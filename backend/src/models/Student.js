const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  semester: {
    type: String,
    default: 'Semester 6'
  },
  faceEmbedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 128;
      },
      message: 'Face embedding vector must contain exactly 128 dimensions'
    }
  },
  facePhoto: {
    type: String, // Base64 data URI or image URL
    default: ''
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
