const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  subject: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Spoof Attempt'],
    required: true,
    default: 'Present'
  },
  confidence: {
    type: Number,
    default: 0.95
  },
  spoofScore: {
    type: Number,
    default: 0.05
  },
  isSpoof: {
    type: Boolean,
    default: false
  },
  location: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    distanceMeters: { type: Number, default: 0 },
    withinRadius: { type: Boolean, default: true }
  },
  clientIp: {
    type: String,
    default: '127.0.0.1'
  },
  verificationMethod: {
    type: String,
    default: 'AI Face Recognition'
  },
  reasons: [String]
});

// Index to avoid duplicate 'Present' log for the same student in the same session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
