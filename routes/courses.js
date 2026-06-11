const router = require('express').Router();
const {
  getAllCourses, createCourse, updateCourse, deleteCourse,
  getCourseStudents, enrollStudents, removeStudent,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                              getAllCourses);
router.post('/',         authorize('admin'), createCourse);
router.put('/:id',       authorize('admin'), updateCourse);
router.delete('/:id',    authorize('admin'), deleteCourse);

// Enrollment
router.get('/:id/students',                              authorize('admin', 'faculty'), getCourseStudents);
router.post('/:id/enroll',                               authorize('admin'),            enrollStudents);
router.delete('/:id/enroll/:studentId',                  authorize('admin'),            removeStudent);

module.exports = router;
