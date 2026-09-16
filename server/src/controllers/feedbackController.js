const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');

const submitFeedback = async (req, res, next) => {
  try {
    const { event, session, rating, comment, type = session ? 'session' : 'event', isAnonymous = false } = req.body;
    const registration = await Registration.findOne({ attendee: req.user._id, event, status: 'confirmed' });
    if (!registration) return res.status(403).json({ success: false, message: 'You must be registered for this event to submit feedback' });
    const feedback = await Feedback.create({ event, session, attendee: req.user._id, rating, comment, type, isAnonymous });
    return res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: { feedback } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Feedback already submitted for this item' });
    return next(error);
  }
};

const listFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ event: req.query.eventId }).populate('attendee', 'firstName lastName email').populate('session', 'title').sort({ createdAt: -1 });
    return res.json({ success: true, data: { feedback } });
  } catch (error) { return next(error); }
};

module.exports = { submitFeedback, listFeedback };