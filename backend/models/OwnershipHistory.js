const mongoose = require('mongoose');

const ownershipHistorySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  previousOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  newOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  conditionAtTransfer: {
    type: String,
    required: true,
    default: 'Good'
  },
  notes: {
    type: String,
    default: 'Handed over in good condition.'
  },
  academicSemesterUsed: {
    type: String,
    default: '4th Semester'
  },
  studentFeedback: {
    type: String,
    default: 'Great book for exam prep.'
  },
  location: {
    type: String,
    default: 'College Campus / Department Library'
  },
  transactionHash: {
    type: String,
    default: () => 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
  }
});

module.exports = mongoose.model('OwnershipHistory', ownershipHistorySchema);
