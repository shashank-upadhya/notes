// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendOtpEmail } from '../utils/emailSender.js';
import { OAuth2Client } from 'google-auth-library';

// --- JWT Generation ---
const generateToken = (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- 1. Signup with Email and Password ---
export const signup = async (req: Request, res: Response) => {
  console.log('Signup request received:', { body: { ...req.body, password: '[REDACTED]' } });
  
  const schema = Joi.object({
    name: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
    console.log('Validation error:', errorMessage);
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const { name, dateOfBirth, email, password } = value;

    console.log('Looking for existing user with email:', email);
    let user = await User.findOne({ email });
    
    if (user && user.isVerified) {
      console.log('User already exists and is verified');
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('Generated OTP:', otp);

    if (user) {
      console.log('Updating existing unverified user');
      user.name = name;
      user.dateOfBirth = dateOfBirth;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      console.log('Creating new user');
      user = new User({ name, dateOfBirth, email, password, otp, otpExpires });
      await user.save();
    }

    console.log('User saved successfully, sending OTP email...');
    await sendOtpEmail(email, otp);
    console.log('OTP email sent successfully');
    
    res.status(201).json({ message: 'OTP sent to your email. Please verify.' });

  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      message: 'Server error during signup.', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// --- 2. Verify OTP ---
export const verifyOtp = async (req: Request, res: Response) => {
  console.log('Verify OTP request received:', req.body);
  
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
    console.log('Validation error:', errorMessage);
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const { email, otp } = value;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.otp || user.otp !== otp) {
      console.log('Invalid OTP. Expected:', user.otp, 'Received:', otp);
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    if (user.otpExpires! < new Date()) {
      console.log('OTP expired. Expires at:', user.otpExpires, 'Current time:', new Date());
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken((user._id as any).toString());
    console.log('OTP verified successfully for user:', email);
    
    res.status(200).json({
      message: 'Account verified successfully!',
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });

  } catch (err: any) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ 
      message: 'Server error during OTP verification.', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// --- 3. Login (with Password - kept for flexibility) ---
export const login = async (req: Request, res: Response) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const { email, password } = value;
        const user = await User.findOne({ email });

        if (!user || !user.password || !user.isVerified) {
            return res.status(401).json({ message: 'Invalid credentials or user not verified.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken((user._id as any).toString());
        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: { id: user._id, email: user.email, name: user.name },
        });

    } catch (err: any) {
        console.error('Login error:', err);
        res.status(500).json({ 
          message: 'Server error during login.', 
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

// --- 4. Google OAuth Handler ---
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("Google Client ID not configured in .env file");
            return res.status(500).json({ message: "Server configuration error." });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub || !payload.name) {
            return res.status(400).json({ message: "Invalid Google token." });
        }
        
        const { sub: googleId, email, name } = payload;
        
        let user = await User.findOne({ googleId });
        
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
            } else {
                user = new User({
                    name,
                    email,
                    googleId,
                    isVerified: true,
                    dateOfBirth: new Date(0), 
                });
            }
            await user.save();
        }

        const jwtToken = generateToken((user._id as any).toString());
        res.status(200).json({
            message: 'Google login successful!',
            token: jwtToken,
            user: { id: user._id, email: user.email, name: user.name },
        });

    } catch (err: any) {
        console.error('Google login error:', err);
        res.status(500).json({ 
          message: 'Google authentication failed.', 
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

// --- 5. Generate OTP for Login ---
export const generateLoginOtp = async (req: Request, res: Response) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const { email } = value;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(404).json({ message: 'No verified user found with this email.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP has been sent to your email.' });

  } catch (err: any) {
    console.error('Generate login OTP error:', err);
    res.status(500).json({ 
      message: 'Server error.', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// --- 6. Login with OTP ---
export const loginWithOtp = async (req: Request, res: Response) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const { email, otp } = value;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.otp || user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
    }
    if (user.otpExpires! < new Date()) {
        return res.status(400).json({ message: 'OTP has expired.' });
    }
    
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken((user._id as any).toString());
    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });

  } catch (err: any) {
      console.error('Login with OTP error:', err);
      res.status(500).json({ 
        message: 'Server error.', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
  }
};