const router = require('express').Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', authorize('admin', 'faculty'), createAnnouncement);
router.put('/:id', authorize('admin', 'faculty'), updateAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

module.exports = router;
