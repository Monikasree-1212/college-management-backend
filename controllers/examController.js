const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Student = require('../models/Student');

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('course', 'name code').sort({ date: -1 });
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code');
    res.json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ exam: req.params.id });
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.submitResults = async (req, res) => {
  try {
    const { examId, results } = req.body;
    const ops = results.map(r => ({
      updateOne: {
        filter: { exam: examId, student: r.studentId },
        update: { $set: { marksObtained: r.marksObtained, remarks: r.remarks } },
        upsert: true,
      }
    }));
    await Result.bulkWrite(ops);
    // Assign grades individually to trigger pre-save hook
    for (const r of results) {
      const result = await Result.findOne({ exam: examId, student: r.studentId });
      if (result) { result.marksObtained = r.marksObtained; await result.save(); }
    }
    res.json({ message: 'Results submitted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentResults = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const results = await Result.find({ student: student._id })
      .populate({ path: 'exam', populate: { path: 'course', select: 'name code' } });
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getExamResults = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
