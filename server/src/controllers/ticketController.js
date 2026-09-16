const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ attendee: req.user._id })
      .populate('event', 'title startDate endDate venue location status banner')
      .populate('ticketCategory', 'name type price benefits')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: { tickets } });
  } catch (error) {
    return next(error);
  }
};

const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title startDate endDate venue')
      .populate('attendee', 'firstName lastName email')
      .populate('ticketCategory', 'name type price benefits');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (['ATTENDEE', 'attendee'].includes(req.user.role) && ticket.attendee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }
    return res.json({ success: true, data: { ticket } });
  } catch (error) {
    return next(error);
  }
};

const validateTicket = async (req, res, next) => {
  try {
    const code = req.query.code || req.body.code || req.query.qrData || req.body.qrData || req.query.ticketNumber || req.body.ticketNumber;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Ticket code or QR data is required' });
    }

    const ticket = await Ticket.findOne({
      $or: [{ qrData: code }, { ticketNumber: code.trim().toUpperCase() }, { ticketNumber: code.trim() }]
    })
      .populate('event', 'title startDate endDate venue status')
      .populate('attendee', 'firstName lastName email')
      .populate('ticketCategory', 'name type price');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found or invalid' });
    }

    return res.json({
      success: true,
      data: {
        ticket,
        isValid: ticket.status === 'active' && !ticket.isCheckedIn,
        alreadyCheckedIn: ticket.isCheckedIn
      }
    });
  } catch (error) {
    return next(error);
  }
};

const checkInTicket = async (req, res, next) => {
  try {
    const code = req.body.qrData || req.body.ticketNumber || req.body.code;
    if (!code) {
      return res.status(400).json({ success: false, message: 'QR data or Ticket Number is required' });
    }

    const ticket = await Ticket.findOne({
      $or: [{ qrData: code }, { ticketNumber: code.trim().toUpperCase() }, { ticketNumber: code.trim() }]
    })
      .populate('event', 'title startDate endDate')
      .populate('attendee', 'firstName lastName email')
      .populate('ticketCategory', 'name type');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket QR code or number is invalid' });
    }
    if (ticket.status !== 'active' || ticket.isCheckedIn) {
      return res.status(409).json({
        success: false,
        message: ticket.isCheckedIn ? `Ticket already checked in at ${new Date(ticket.checkInTime).toLocaleTimeString()}` : 'Ticket is inactive or cancelled',
        data: { ticket }
      });
    }

    ticket.isCheckedIn = true;
    ticket.status = 'used';
    ticket.checkInTime = new Date();
    ticket.checkedInBy = req.user._id;
    await ticket.save();

    await Event.findByIdAndUpdate(ticket.event._id, { $inc: { checkInCount: 1 } });

    return res.json({
      success: true,
      message: `Checked in successfully: ${ticket.attendee.firstName} ${ticket.attendee.lastName}`,
      data: { ticket }
    });
  } catch (error) {
    return next(error);
  }
};

const getMyRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({ _id: req.params.id, attendee: req.user._id })
      .populate('event')
      .populate('ticketCategory');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
    return res.json({ success: true, data: { registration } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyTickets,
  getTicket,
  validateTicket,
  checkInTicket,
  getMyRegistration
};