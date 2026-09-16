const StaffAssignment = require('../models/StaffAssignment');
const User = require('../models/User');

const assignStaff = async (req, res, next) => {
  try {
    const { event, user, role, venue, duties } = req.body;
    const staffUser = await User.findOne({ _id: user, role: { $in: ['EVENT_STAFF', 'staff'] }, isActive: true });
    if (!staffUser) return res.status(400).json({ success: false, message: 'User must be an active event staff member' });
    const assignment = await StaffAssignment.create({ event, user, role, venue, duties, assignedBy: req.user._id });
    res.status(201).json({ success: true, data: { assignment } });
  } catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: 'Staff member is already assigned to this event' }); next(error); }
};

const listAssignments = async (req, res, next) => {
  try { const filter = req.query.eventId ? { event: req.query.eventId } : (req.user.role === 'EVENT_STAFF' ? { user: req.user._id } : {}); const assignments = await StaffAssignment.find(filter).populate('event', 'title startDate').populate('user', 'firstName lastName email role').populate('venue', 'name').sort({ createdAt: -1 }); res.json({ success: true, data: { assignments } }); } catch (error) { next(error); }
};

module.exports = { assignStaff, listAssignments };