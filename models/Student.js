const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number, required: true, min: 1, max: 8 },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  dateOfBirth: Date,
  address: String,
  guardianName: String,
  guardianPhone: String,
  admissionDate: { type: Date, default: Date.now },
  bloodGroup: String,
  photo: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
