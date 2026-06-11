const Course = require('../models/Course');
const Student = require('../models/Student');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('department', 'name code')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department', 'name').populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'students', populate: { path: 'user', select: 'name email' }
    });
    res.json(course?.students || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.enrollStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    await Course.findByIdAndUpdate(req.params.id, { $addToSet: { students: { $each: studentIds } } });
    await Student.updateMany({ _id: { $in: studentIds } }, { $addToSet: { courses: req.params.id } });
    res.json({ message: 'Students enrolled successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeStudent = async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { $pull: { students: req.params.studentId } });
    await Student.findByIdAndUpdate(req.params.studentId, { $pull: { courses: req.params.id } });
    res.json({ message: 'Student removed from course' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
