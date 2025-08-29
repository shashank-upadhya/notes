// server/src/routes/authRoutes.ts
import express from 'express';
import { signup, verifyOtp, login, googleLogin, generateLoginOtp, loginWithOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/google', googleLogin); // Route for Google login

router.post('/generate-login-otp', generateLoginOtp);
router.post('/login-with-otp', loginWithOtp);

export default router;