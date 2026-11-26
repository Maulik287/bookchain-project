const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    default: 'Computer Science'
  },
  subject: {
    type: String,
    default: 'Core Engineering'
  },
  courseCode: {
    type: String,
    default: '24CIE554'
  },
  edition: {
    type: String,
    default: 'Latest Edition'
  },
  isbn: {
    type: String,
    default: 'N/A'
  },
  condition: {
    type: String,
    enum: ['Pristine / Like New', 'Good (Light Notes)', 'Fair (Readable)', 'Worn (Usable)'],
    default: 'Good (Light Notes)'
  },
  status: {
    type: String,
    enum: ['Available', 'Claimed', 'Exchanged'],
    default: 'Available'
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initialOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    default: ''
  },
  currentOwnerNotes: {
    type: String,
    default: ''
  },
  exchangeType: {
    type: String,
    enum: ['Free Donation', 'Exchange for Subject Book', 'Nominal Cost (₹100-300)'],
    default: 'Free Donation'
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
  },
  totalHops: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);
