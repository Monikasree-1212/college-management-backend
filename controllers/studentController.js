const Student = require('../models/Student');
const User = require('../models/User');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code')
      .populate('courses', 'name code');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('courses', 'name code credits');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('courses', 'name code credits faculty');
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone, avatar, ...studentFields } = req.body;
    if (name || email || phone || avatar) {
      const student = await Student.findById(req.params.id);
      await User.findByIdAndUpdate(student.user, { name, email, phone, avatar });
    }
    const student = await Student.findByIdAndUpdate(req.params.id, studentFields, { new: true })
      .populate('user', 'name email').populate('department', 'name');
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const bySemester = await Student.aggregate([
      { $group: { _id: '$semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ total, bySemester });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const student = await Student.findById(req.params.id);
    await User.findByIdAndUpdate(student.user, { avatar: avatarUrl });
    res.json({ avatar: avatarUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
