import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface DecodedToken {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Check for the header and try to extract the token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token was extracted from the header, send an error
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  // 3. If a token exists, verify it
  try {
    // At this point, TypeScript knows 'token' is a string
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as DecodedToken;

    const foundUser = await User.findById(decoded.id).select('-password');
    req.user = (foundUser || undefined) as any;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};