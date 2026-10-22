const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');
const { protectFaculty } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_faculty_jwt_key_2026_secure_key', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/login
// @desc    Faculty login with JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const faculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (!faculty || !(await faculty.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register faculty member
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existingFaculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (existingFaculty) {
      return res.status(400).json({ success: false, message: 'Faculty with this email already exists' });
    }

    const faculty = await Faculty.create({
      name,
      email: email.toLowerCase(),
      password,
      department: department || 'Computer Science'
    });

    const token = generateToken(faculty._id);

    res.status(201).json({
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
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
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
