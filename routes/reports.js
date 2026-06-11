const router = require('express').Router();
const {
  attendanceReport,
  resultReport,
  idCard,
  feeReceipt,
  bonafide,
  gradeCard,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Student accesses own reports via /me, admin/faculty via /:studentId
router.get('/attendance/me',           authorize('student'),             (req, res) => { req.params.studentId = null; attendanceReport(req, res); });
router.get('/attendance/:studentId',   authorize('admin', 'faculty'),    attendanceReport);
router.get('/results/me',              authorize('student'),             (req, res) => { req.params.studentId = null; resultReport(req, res); });
router.get('/results/:studentId',      authorize('admin', 'faculty'),    resultReport);
router.get('/id-card/me',              authorize('student'),             (req, res) => { req.params.studentId = null; idCard(req, res); });
router.get('/id-card/:studentId',      authorize('admin'),               idCard);
router.get('/fee-receipt/me',          authorize('student'),             (req, res) => { req.params.studentId = null; feeReceipt(req, res); });
router.get('/fee-receipt/:studentId',  authorize('admin'),               feeReceipt);
router.get('/bonafide/me',             authorize('student'),             (req, res) => { req.params.studentId = null; bonafide(req, res); });
router.get('/bonafide/:studentId',     authorize('admin'),               bonafide);
router.get('/grade-card/me',           authorize('student'),             (req, res) => { req.params.studentId = null; gradeCard(req, res); });
router.get('/grade-card/:studentId',   authorize('admin', 'faculty'),    gradeCard);

module.exports = router;
