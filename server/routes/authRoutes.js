const express = require('express');

const { register, login, sendOtp, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.patch('/profile', auth, updateProfile);

module.exports = router;
