// server/src/utils/emailSender.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code for Note-Taking App',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to the Note-Taking App!</h2>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007BFF;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};