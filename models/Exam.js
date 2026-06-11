const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: Number, default: 180 }, // minutes
  examType: { type: String, enum: ['midterm', 'final', 'quiz', 'assignment'], default: 'midterm' },
  semester: Number,
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
