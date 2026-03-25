const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/node-mailer');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'expense_tracker_secret', {
    expiresIn: '7d',
  });

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update OTP in DB
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Email
    try {
      await sendOtpEmail(normalizedEmail, otp);
      const message = (!process.env.SMTP_USER || !process.env.SMTP_PASS) 
        ? `OTP sent (Dev: ${otp})` 
        : 'OTP sent to your email.';
      res.json({ message });
    } catch (mailError) {
      console.error('Mail Error:', mailError);
      res.status(500).json({ message: 'Failed to send OTP email.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'All fields including OTP are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP
    const otpRecord = await Otp.findOne({ email: normalizedEmail, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Delete OTP after successful registration
    await Otp.deleteOne({ _id: otpRecord._id });

    sendAuthResponse(res, 201, user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user.' });
  }
};

exports.login = async (req, res) => {
  // ... existing login logic (already viewed and unchanged)
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to log in.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) {
      user.name = name.trim();
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters long.' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
