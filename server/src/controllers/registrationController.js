const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const TicketCategory = require('../models/TicketCategory');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Session = require('../models/Session');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

const activeWindow = (event) => {
  const now = new Date();
  return (!event.registrationStartDate || now >= event.registrationStartDate)
    && (!event.registrationEndDate || now <= event.registrationEndDate);
};

const createRegistration = async (req, res, next) => {
  try {
    const { event: eventId, ticketCategory: categoryId, selectedSessions = [], couponCode } = req.body;
    if (!mongoose.isValidObjectId(eventId) || !mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ success: false, message: 'Valid event and ticketCategory are required' });
    }

    const [event, category] = await Promise.all([
      Event.findById(eventId),
      TicketCategory.findOne({ _id: categoryId, event: eventId }),
    ]);
    if (!event || !event.isPublished || ['cancelled', 'completed'].includes(event.status)) {
      return res.status(400).json({ success: false, message: 'Event is not accepting registrations' });
    }
    if (!activeWindow(event)) {
      return res.status(400).json({ success: false, message: 'Registration is outside the event registration window' });
    }
    if (!category || !category.isActive) {
      return res.status(400).json({ success: false, message: 'Ticket category is unavailable' });
    }

    const duplicate = await Registration.findOne({ attendee: req.user._id, event: eventId, status: { $ne: 'cancelled' } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'You are already registered for this event' });
    }

    const sessions = selectedSessions.length
      ? await Session.find({ _id: { $in: selectedSessions }, event: eventId, status: { $ne: 'cancelled' } })
      : [];
    if (sessions.length !== selectedSessions.length) {
      return res.status(400).json({ success: false, message: 'One or more selected sessions are invalid' });
    }
    for (const session of sessions) {
      if (session.capacity) {
        const reserved = await Registration.countDocuments({ selectedSessions: session._id, status: 'confirmed' });
        if (reserved >= session.capacity) {
          return res.status(409).json({ success: false, message: `Session '${session.title}' is full` });
        }
      }
    }

    const claimedCategory = await TicketCategory.findOneAndUpdate(
      { _id: categoryId, sold: { $lt: category.capacity } },
      { $inc: { sold: 1 } },
      { new: true },
    );
    if (!claimedCategory) {
      return res.status(409).json({ success: false, message: 'This ticket category is sold out' });
    }

    const claimedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1, registrationCount: 1 } },
      { new: true },
    );
    if (!claimedEvent) {
      await TicketCategory.findByIdAndUpdate(categoryId, { $inc: { sold: -1 } });
      return res.status(409).json({ success: false, message: 'Event capacity has been reached' });
    }

    const originalAmount = category.price;
    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      const invalid = !coupon || (coupon.event && coupon.event.toString() !== eventId.toString())
        || (coupon.expiryDate && coupon.expiryDate < new Date())
        || (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
        || originalAmount < coupon?.minAmount;
      if (invalid) {
        await TicketCategory.findByIdAndUpdate(categoryId, { $inc: { sold: -1 } });
        await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: 1, registrationCount: -1 } });
        return res.status(400).json({ success: false, message: 'Coupon is invalid for this registration' });
      }
      discountAmount = coupon.discountType === 'percentage'
        ? originalAmount * coupon.discountValue / 100
        : Math.min(originalAmount, coupon.discountValue);
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    const registration = await Registration.create({
      attendee: req.user._id,
      event: eventId,
      ticketCategory: categoryId,
      selectedSessions,
      coupon: coupon?._id,
      originalAmount,
      discountAmount,
      finalAmount: Math.max(0, originalAmount - discountAmount),
      status: 'confirmed',
      confirmationDate: new Date(),
    });

    const ticketNumber = `EF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const qrData = `eventforge:ticket:${ticketNumber}`;
    const qrCode = await QRCode.toDataURL(qrData);
    const ticket = await Ticket.create({ registration: registration._id, attendee: req.user._id, event: eventId, ticketCategory: categoryId, ticketNumber, qrData, qrCode });
    await Notification.create({ user: req.user._id, title: 'Registration confirmed', message: `Your registration for ${event.title} is confirmed.`, type: 'success', relatedTo: 'Registration', relatedId: registration._id });

    return res.status(201).json({ success: true, message: 'Registration confirmed', data: { registration, ticket } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'You are already registered for this event' });
    return next(error);
  }
};

const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ attendee: req.user._id }).populate('event', 'title startDate endDate status').populate('ticketCategory', 'name type price').sort({ createdAt: -1 });
    return res.json({ success: true, data: { registrations } });
  } catch (error) { return next(error); }
};

const getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.query.eventId, status: { $ne: 'cancelled' } }).populate('attendee', 'firstName lastName email').populate('ticketCategory', 'name type').sort({ createdAt: -1 });
    return res.json({ success: true, data: { registrations } });
  } catch (error) { return next(error); }
};

module.exports = { createRegistration, getMyRegistrations, getEventRegistrations };