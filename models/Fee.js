const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, enum: ['tuition', 'hostel', 'transport', 'library', 'exam'], required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  semester: Number,
  transactionId: String,
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
