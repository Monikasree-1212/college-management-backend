const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const fees = await Fee.find({ student: student._id }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFeeStatus = async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'paid') update.paidDate = new Date();
    if (req.body.transactionId) update.transactionId = req.body.transactionId;
    const fee = await Fee.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeeStats = async (req, res) => {
  try {
    const [total, paid, pending, overdue] = await Promise.all([
      Fee.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Fee.countDocuments({ status: 'pending' }),
      Fee.countDocuments({ status: 'overdue' }),
    ]);
    res.json({
      totalAmount: total[0]?.total || 0,
      paidAmount: paid[0]?.total || 0,
      pendingCount: pending,
      overdueCount: overdue,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
