const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, default: 'Assistant Professor' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  qualification: String,
  experience: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  specialization: String,
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
