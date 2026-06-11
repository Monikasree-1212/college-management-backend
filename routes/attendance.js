const router = require('express').Router();
const {
  markAttendance, getAttendanceByCourse, getAttendanceByDate,
  getStudentAttendance, getMonthlyReport, getFacultyCourseStudents,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/',                                        authorize('faculty'),           markAttendance);
router.get('/student',                                  authorize('student'),           getStudentAttendance);
router.get('/faculty-courses',                          authorize('faculty'),           getFacultyCourseStudents);
router.get('/monthly',                                  authorize('admin', 'faculty'),  getMonthlyReport);
router.get('/course/:courseId',                         authorize('admin', 'faculty'),  getAttendanceByCourse);
router.get('/course/:courseId/date/:date',              authorize('admin', 'faculty'),  getAttendanceByDate);

module.exports = router;
