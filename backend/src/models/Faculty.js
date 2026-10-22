const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  role: {
    type: String,
    enum: ['faculty', 'admin'],
    default: 'faculty'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
facultySchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
facultySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Faculty', facultySchema);
