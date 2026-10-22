const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: 'Monday'
  },
  startTime: {
    type: String,
    required: true // '09:00' format (24hr)
  },
  endTime: {
    type: String,
    required: true // '10:00' format (24hr)
  },
  room: {
    type: String,
    default: 'LH-101'
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  semester: {
    type: String,
    default: 'Semester 6'
  },
  linkedSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);
