const router = require('express').Router();
const { getAllStudents, getStudent, getMyProfile, updateStudent, deleteStudent, getStats, uploadPhoto } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', authorize('admin', 'faculty'), getAllStudents);
router.get('/stats', authorize('admin'), getStats);
router.get('/me', authorize('student'), getMyProfile);
router.get('/:id', getStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.post(
  '/upload-photo/:id',
  authorize('admin', 'student'),
  upload.single('photo'),
  (err, req, res, next) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  },
  uploadPhoto
);

module.exports = router;
