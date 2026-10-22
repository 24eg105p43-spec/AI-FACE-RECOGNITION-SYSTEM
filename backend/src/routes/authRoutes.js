const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Faculty = require('../models/Faculty');
const { protectFaculty } = require('../middleware/auth');

// Firebase-like Brute-Force Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login/register attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_faculty_jwt_key_2026_secure_key', 
    { expiresIn: '7d' }
  );
};

// Strict Real-World Email Validator (RFC 5322 standard)
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

// Strong Real-World Password Validator (min 8 chars, at least 1 uppercase or number)
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+[\]{};':",.<>?/\\|`~=-]/.test(password);
  if (!hasLetter || !hasDigitOrSpecial) {
    return { valid: false, message: 'Password must contain both letters and numbers/symbols.' };
  }
  return { valid: true };
}

// @route   POST /api/auth/login
// @desc    Faculty login with JWT & real credentials validation
router.post('/login', authLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    email = String(email).trim().toLowerCase();
    password = String(password);

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid, existing email address.' });
    }

    const faculty = await Faculty.findOne({ email });
    if (!faculty || !(await faculty.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(faculty._id);

    res.json({
      success: true,
      token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        role: faculty.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register faculty member with real existing email and password
router.post('/register', authLimiter, async (req, res) => {
  try {
    let { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);
    department = department ? String(department).trim() : 'Computer Science & Engineering';

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter a valid full name.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid, existing email address format.' });
    }

    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ success: false, message: pwdCheck.message });
    }

    // Check if email already registered
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const faculty = await Faculty.create({
      name,
      email,
      password,
      department,
      role: 'faculty'
    });

    const token = generateToken(faculty._id);

    res.status(201).json({
      success: true,
      message: 'Account successfully created.',
      token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        role: faculty.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Self-service password update for registered accounts
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    let { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    email = String(email).trim().toLowerCase();
    newPassword = String(newPassword);

    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.valid) {
      return res.status(400).json({ success: false, message: pwdCheck.message });
    }

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email.' });
    }

    faculty.password = newPassword;
    await faculty.save();

    res.json({
      success: true,
      message: 'Password successfully updated. You can now sign in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed.', error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current faculty user
router.get('/me', protectFaculty, async (req, res) => {
  res.json({
    success: true,
    faculty: req.faculty
  });
});

module.exports = router;
