const Attendance = require('../models/Attendance');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Course = require('../models/Course');

exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    const faculty = await Faculty.findOne({ user: req.user.id });
    const existing = await Attendance.findOne({ course: courseId, date: new Date(date) });
    if (existing) {
      existing.records = records;
      await existing.save();
      return res.json(existing);
    }
    const attendance = await Attendance.create({ course: courseId, faculty: faculty._id, date, records });
    res.status(201).json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAttendanceByCourse = async (req, res) => {
  try {
    const records = await Attendance.find({ course: req.params.courseId })
      .populate({ path: 'records.student', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const record = await Attendance.findOne({ course: req.params.courseId, date: new Date(req.params.date) })
      .populate({ path: 'records.student', populate: { path: 'user', select: 'name' } });
    res.json(record || { records: [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.json([]);

    const records = await Attendance.find({ 'records.student': student._id })
      .populate('course', 'name code');

    // Aggregate per course: count present and total
    const courseMap = {};
    for (const r of records) {
      const courseId = r.course?._id?.toString();
      if (!courseId) continue;
      if (!courseMap[courseId]) {
        courseMap[courseId] = { course: r.course, present: 0, total: 0 };
      }
      const rec = r.records.find(x => x.student.toString() === student._id.toString());
      courseMap[courseId].total += 1;
      if (rec?.status === 'present' || rec?.status === 'late') {
        courseMap[courseId].present += 1;
      }
    }

    const summary = Object.values(courseMap).map(c => {
      const present = Number(c.present) || 0;
      const total   = Number(c.total)   || 0;
      const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;
      return { course: c.course, present, total, percentage };
    });

    console.log('Attendance Data:', summary);
    res.json(summary);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year, courseId } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const query = { date: { $gte: start, $lte: end } };
    if (courseId) query.course = courseId;
    const records = await Attendance.find(query).populate('course', 'name code');
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFacultyCourseStudents = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id }).populate('courses');
    const courses = await Course.find({ _id: { $in: faculty.courses } })
      .populate({ path: 'students', populate: { path: 'user', select: 'name email' } });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
