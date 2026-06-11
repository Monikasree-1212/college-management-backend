const Faculty = require('../models/Faculty');
const User = require('../models/User');

exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code')
      .populate('courses', 'name code');
    res.json(faculty);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('courses', 'name code credits');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code')
      .populate('courses', 'name code credits');
    res.json(faculty);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { name, email, phone, avatar, ...facultyFields } = req.body;
    if (name || email || phone || avatar) {
      const faculty = await Faculty.findById(req.params.id);
      await User.findByIdAndUpdate(faculty.user, { name, email, phone, avatar });
    }
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, facultyFields, { new: true })
      .populate('user', 'name email').populate('department', 'name');
    res.json(faculty);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    await User.findByIdAndDelete(faculty.user);
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAssignedCourses = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('courses', 'name code semester credits');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty.courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
