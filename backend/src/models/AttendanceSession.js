const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  timetableSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'LH-101'
  },
  durationMinutes: {
    type: Number,
    default: 10
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  campusLat: {
    type: Number,
    default: 12.9716
  },
  campusLng: {
    type: Number,
    default: 77.5946
  },
  radiusMeters: {
    type: Number,
    default: 500
  },
  autoMarkedAbsent: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
