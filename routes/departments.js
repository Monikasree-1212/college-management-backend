const router = require('express').Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().populate({ path: 'head', populate: { path: 'user', select: 'name' } });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
