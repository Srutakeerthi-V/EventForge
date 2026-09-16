const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();
router.get('/', protect, async (req, res, next) => {
  try { const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }); res.json({ success: true, data: { notifications } }); } catch (error) { next(error); }
});
router.patch('/:id/read', protect, async (req, res, next) => {
  try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true, readAt: new Date() }, { new: true }); if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' }); res.json({ success: true, data: { notification } }); } catch (error) { next(error); }
});
module.exports = router;