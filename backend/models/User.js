const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  usn: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  dob: {
    type: String,
    required: true,
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
  semester: {
    type: String,
    default: '4th Sem'
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
