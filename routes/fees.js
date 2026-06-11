const router = require('express').Router();
const { getAllFees, getMyFees, createFee, updateFeeStatus, getFeeStats } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getAllFees);
router.get('/me', authorize('student'), getMyFees);
router.get('/stats', authorize('admin'), getFeeStats);
router.post('/', authorize('admin'), createFee);
router.put('/:id', authorize('admin'), updateFeeStatus);

module.exports = router;
