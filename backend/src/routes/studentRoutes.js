const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const aiServiceClient = require('../services/aiServiceClient');
const { protectFaculty } = require('../middleware/auth');

// @route   POST /register-student and /api/students/register
// @desc    Faculty registers student with face data
router.post(['/register', '/register-student'], protectFaculty, async (req, res) => {
  try {
    const { name, rollNumber, email, department, semester, image } = req.body;

    if (!name || !rollNumber || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, Roll Number, and Face snapshot/image are required'
      });
    }

    // Check if roll number already exists
    const existing = await Student.findOne({ rollNumber: rollNumber.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number "${rollNumber.toUpperCase()}" already exists`
      });
    }

    // Extract 128-d face embedding via AI Microservice
    const aiResult = await aiServiceClient.extractEmbedding(image);
    if (!aiResult.embedding || aiResult.embedding.length !== 128) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract high-confidence facial embedding. Ensure good lighting and facing camera directly.'
      });
    }

    const newStudent = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.toUpperCase().trim(),
      email: email ? email.toLowerCase().trim() : '',
      department: department || 'Computer Science',
      semester: semester || 'Semester 6',
      faceEmbedding: aiResult.embedding,
      facePhoto: image, // Store image data URL for profile preview
      registeredBy: req.faculty._id
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully with AI facial biometric profile',
      student: {
        id: newStudent._id,
        name: newStudent.name,
        rollNumber: newStudent.rollNumber,
        department: newStudent.department,
        semester: newStudent.semester,
        registeredAt: newStudent.registeredAt,
        antiSpoofCheck: aiResult.anti_spoof
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: err.message
    });
  }
});

// @route   GET /api/students
// @desc    List all students
router.get('/', protectFaculty, async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .select('-faceEmbedding')
      .sort({ rollNumber: 1 });
    
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Deactivate or remove student
router.delete('/:id', protectFaculty, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Student removed from active roster' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
