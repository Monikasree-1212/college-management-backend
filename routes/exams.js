const router = require('express').Router();
const { getAllExams, createExam, updateExam, deleteExam, submitResults, getStudentResults, getExamResults } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllExams);
router.post('/', authorize('admin', 'faculty'), createExam);
router.put('/:id', authorize('admin', 'faculty'), updateExam);
router.delete('/:id', authorize('admin'), deleteExam);
router.post('/results', authorize('admin', 'faculty'), submitResults);
router.get('/results/me', authorize('student'), getStudentResults);
router.get('/results/:examId', authorize('admin', 'faculty'), getExamResults);

module.exports = router;
