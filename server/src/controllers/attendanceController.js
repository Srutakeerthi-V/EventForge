const SessionAttendance = require('../models/SessionAttendance');
const Session = require('../models/Session');
const Registration = require('../models/Registration');

const recordAttendance = async (req, res, next) => {
  try {
    const { session: sessionId, attendee: attendeeId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    const registration = await Registration.findOne({ attendee: attendeeId, event: session.event, status: 'confirmed' });
    if (!registration) return res.status(400).json({ success: false, message: 'Attendee is not registered for this event' });
    const attendance = await SessionAttendance.create({ session: sessionId, attendee: attendeeId, event: session.event, recordedBy: req.user._id });
    await Session.findByIdAndUpdate(sessionId, { $inc: { attendanceCount: 1 } });
    return res.status(201).json({ success: true, message: 'Session attendance recorded', data: { attendance } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Attendance already recorded' });
    return next(error);
  }
};

const getSessionAttendance = async (req, res, next) => {
  try {
    const attendance = await SessionAttendance.find({ session: req.params.sessionId }).populate('attendee', 'firstName lastName email').sort({ checkInTime: 1 });
    return res.json({ success: true, data: { attendance } });
  } catch (error) { return next(error); }
};

module.exports = { recordAttendance, getSessionAttendance };