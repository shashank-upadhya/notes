import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
  // ✅ Create the transporter INSIDE the function
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully.');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
};