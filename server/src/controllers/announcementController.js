const Announcement = require('../models/Announcement');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

const createAnnouncement = async (req, res, next) => {
  try {
    const { event, title, content, message, type = 'general', targetRoles = ['all'], isPublished = true } = req.body;
    if (!event || !title || !(content || message)) return res.status(400).json({ success: false, message: 'event, title, and content are required' });
    const announcement = await Announcement.create({ event, title, content: content || message, type: type.toLowerCase(), targetRoles, isPublished, createdBy: req.user._id });
    const registrations = await Registration.find({ event, status: 'confirmed' }).distinct('attendee');
    if (isPublished && registrations.length) {
      await Notification.insertMany(registrations.map((user) => ({ user, title, message: content || message, type: type === 'IMPORTANT' || type === 'EMERGENCY' ? 'warning' : 'info', relatedTo: 'Announcement', relatedId: announcement._id })));
    }
    return res.status(201).json({ success: true, message: 'Announcement created successfully', data: { announcement } });
  } catch (error) { return next(error); }
};

const listAnnouncements = async (req, res, next) => {
  try {
    const eventIds = await Registration.find({ attendee: req.user._id, status: 'confirmed' }).distinct('event');
    const filter = req.user.role === 'PLATFORM_ADMIN' || req.user.role === 'EVENT_ORGANIZER'
      ? (req.query.eventId ? { event: req.query.eventId } : {})
      : { event: { $in: eventIds }, isPublished: true };
    const announcements = await Announcement.find(filter).populate('event', 'title').sort({ publishedAt: -1 });
    return res.json({ success: true, data: { announcements } });
  } catch (error) { return next(error); }
};

module.exports = { createAnnouncement, listAnnouncements };