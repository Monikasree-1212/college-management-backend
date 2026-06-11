const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const { role } = req.user;
    const filter = { $or: [{ targetAudience: 'all' }, { targetAudience: role === 'admin' ? { $exists: true } : `${role}s` }] };
    const announcements = await Announcement.find(filter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user.id });
    res.status(201).json(announcement);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(announcement);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
