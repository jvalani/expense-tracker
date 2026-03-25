const nodemailer = require('nodemailer');

/**
 * Configure the transporter for sending emails.
 * Using standard environment variables for flexibility.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // Use SSL/TLS for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP code to a user's email.
 */
const sendOtpEmail = async (email, otp) => {
  // Development Fallback: If no SMTP credentials, log to console
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\n' + '='.repeat(50));
    console.warn('⚠️  SMTP NOT CONFIGURED: OTP EMAILS DISABLED');
    console.warn(`📧 OTP for ${email}: ${otp}`);
    console.warn('='.repeat(50) + '\n');
    return { messageId: 'dev-mock-id' };
  }

  const mailOptions = {
    from: `"FlowTrack" <${process.env.SMTP_FROM || 'no-reply@flowtrack.com'}>`,
    to: email,
    subject: 'Your Registration OTP - FlowTrack',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">Welcome to FlowTrack</h2>
        <p>Hello,</p>
        <p>You requested a one-time password (OTP) for your registration on FlowTrack.</p>
        <div style="background: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #111827; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #6B7280; text-align: center;">
          &copy; ${new Date().getFullYear()} FlowTrack. All rights reserved.
        </footer>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
