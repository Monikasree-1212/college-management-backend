const router = require('express').Router();
const { getAllFaculty, getFaculty, getMyProfile, updateFaculty, deleteFaculty, getAssignedCourses } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                                   getAllFaculty);
router.get('/me',          authorize('faculty'),  getMyProfile);
router.get('/:id/courses', authorize('admin', 'faculty'), getAssignedCourses);
router.get('/:id',                                getFaculty);
router.put('/:id',         authorize('admin'),    updateFaculty);
router.delete('/:id',      authorize('admin'),    deleteFaculty);

module.exports = router;
