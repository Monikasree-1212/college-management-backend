const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  semester: { type: Number, required: true },
  credits: { type: Number, default: 3 },
  description: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
