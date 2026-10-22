const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protectFaculty } = require('../middleware/auth');

// Helper: check if current time falls within slot range
function isSlotCurrentlyActive(day, startTime, endTime) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];

  if (day !== currentDay) return false;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

// @route   GET /timetable (and /api/timetable)
// @desc    Get all timetable slots for faculty
router.get('/', protectFaculty, async (req, res) => {
  try {
    const slots = await Timetable.find({ facultyId: req.faculty._id })
      .populate('linkedSessions')
      .sort({ day: 1, startTime: 1 });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const enrichedSlots = slots.map(slot => ({
      ...slot.toObject(),
      isLiveNow: isSlotCurrentlyActive(slot.day, slot.startTime, slot.endTime),
      isToday: slot.day === currentDay
    }));

    res.json({
      success: true,
      currentDay,
      count: enrichedSlots.length,
      slots: enrichedSlots
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/timetable/active-slot
// @desc    Detect timetable slot currently active based on system clock
router.get('/active-slot', protectFaculty, async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDay = days[now.getDay()];

    const slots = await Timetable.find({
      facultyId: req.faculty._id,
      day: currentDay
    });

    const activeSlot = slots.find(s => isSlotCurrentlyActive(s.day, s.startTime, s.endTime));

    res.json({
      success: true,
      currentDay,
      currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      activeSlot: activeSlot || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   POST /timetable (and /api/timetable)
// @desc    Create new timetable slot
router.post('/', protectFaculty, async (req, res) => {
  try {
    const { subject, courseCode, day, startTime, endTime, room, department, semester } = req.body;

    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Subject, day, start time, and end time are required'
      });
    }

    const newSlot = await Timetable.create({
      subject,
      courseCode: courseCode || subject.substring(0, 3).toUpperCase() + '301',
      facultyId: req.faculty._id,
      day,
      startTime,
      endTime,
      room: room || 'LH-101',
      department: department || req.faculty.department || 'Computer Science',
      semester: semester || 'Semester 6'
    });

    res.status(201).json({
      success: true,
      message: 'Timetable lecture slot created successfully',
      slot: newSlot
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create slot', error: err.message });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable slot
router.delete('/:id', protectFaculty, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timetable slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
