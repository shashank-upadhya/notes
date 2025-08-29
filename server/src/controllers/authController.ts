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
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// --- 1. Signup with Email and Password ---
export const signup = async (req: Request, res: Response) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
  // Safely access the message and provide a fallback if it doesn't exist
  const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
  return res.status(400).json({ message: errorMessage });
}

  try {
    const { name, dateOfBirth, email, password } = value; // 'value' is now correctly in scope

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      user.name = name;
      user.dateOfBirth = dateOfBirth;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = new User({ name, dateOfBirth, email, password, otp, otpExpires });
      await user.save();
    }

    await sendOtpEmail(email, otp);
    res.status(201).json({ message: 'OTP sent to your email. Please verify.' });

  } catch (err: any) {
    res.status(500).json({ message: 'Server error during signup.', error: err.message });
  }
};

// --- 2. Verify OTP ---
export const verifyOtp = async (req: Request, res: Response) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
  // Safely access the message and provide a fallback if it doesn't exist
  const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
  return res.status(400).json({ message: errorMessage });
}

  try {
    const { email, otp } = value; // 'value' is now correctly in scope
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

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken((user._id as any).toString());
    res.status(200).json({
      message: 'Account verified successfully!',
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });

  } catch (err: any) {
    res.status(500).json({ message: 'Server error during OTP verification.', error: err.message });
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
  // Safely access the message and provide a fallback if it doesn't exist
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
        res.status(500).json({ message: 'Server error during login.', error: err.message });
    }
};

// --- 4. Google OAuth Handler ---
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
        // ✅ ADD THIS CHECK
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error("Google Client ID not configured in .env file");
            return res.status(500).json({ message: "Server configuration error." });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Now TypeScript knows this is a string
        });
        
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub || !payload.name) {
            return res.status(400).json({ message: "Invalid Google token." });
        }
        
        // ... rest of the function remains the same
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
        res.status(500).json({ message: 'Google authentication failed.', error: err.message });
    }
};

// --- 5. Generate OTP for Login ---
export const generateLoginOtp = async (req: Request, res: Response) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error, value } = schema.validate(req.body);
  
 if (error) {
  // Safely access the message and provide a fallback if it doesn't exist
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
    res.status(500).json({ message: 'Server error.', error: err.message });
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
  // Safely access the message and provide a fallback if it doesn't exist
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
      res.status(500).json({ message: 'Server error.', error: err.message });
  }
};