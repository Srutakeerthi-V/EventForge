const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Session = require('../models/Session');
const Feedback = require('../models/Feedback');
const Coupon = require('../models/Coupon');
const Event = require('../models/Event');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Sponsor = require('../models/Sponsor');
const SessionAttendance = require('../models/SessionAttendance');

// General or event-specific analytics
const getAnalytics = async (req, res, next) => {
  try {
    const eventId = req.query.eventId;
    if (eventId) {
      const filter = { event: eventId };
      const [registrations, confirmed, checkIns, ticketDistribution, sessionPopularity, feedback, coupons, sponsors, event] = await Promise.all([
        Registration.countDocuments(filter),
        Registration.countDocuments({ ...filter, status: 'confirmed' }),
        Ticket.countDocuments({ ...filter, isCheckedIn: true }),
        Registration.aggregate([
          { $match: { ...filter, status: 'confirmed' } },
          { $group: { _id: '$ticketCategory', count: { $sum: 1 } } }
        ]),
        Registration.aggregate([
          { $match: { ...filter, status: 'confirmed' } },
          { $unwind: '$selectedSessions' },
          { $group: { _id: '$selectedSessions', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Feedback.aggregate([
          { $match: filter },
          { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]),
        Coupon.aggregate([
          { $match: { event: eventId } },
          { $group: { _id: null, used: { $sum: '$usedCount' } } }
        ]),
        Sponsor.countDocuments(filter),
        Event.findById(eventId).select('title capacity registrationCount checkInCount status isPublished startDate endDate')
      ]);

      const attendancePercentage = confirmed > 0 ? Number(((checkIns / confirmed) * 100).toFixed(1)) : 0;

      return res.json({
        success: true,
        data: {
          event,
          totalRegistrations: registrations,
          confirmedRegistrations: confirmed,
          checkIns,
          attendancePercentage,
          ticketDistribution,
          sessionPopularity,
          feedbackRatings: feedback[0] || { averageRating: 0, count: 0 },
          couponUsage: coupons[0]?.used || 0,
          sponsorCount: sponsors
        }
      });
    }

    // Platform-level summary
    const [users, organizations, events, activeEvents, registrations, checkIns] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Organization.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Event.countDocuments({ isPublished: true, status: { $nin: ['completed', 'cancelled'] } }),
      Registration.countDocuments({ status: 'confirmed' }),
      Ticket.countDocuments({ isCheckedIn: true })
    ]);

    return res.json({
      success: true,
      data: { users, organizations, events, activeEvents, registrations, checkIns }
    });
  } catch (error) {
    return next(error);
  }
};

// Admin Analytics
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      usersByRole,
      totalOrganizations,
      totalEvents,
      eventsByStatus,
      totalRegistrations,
      recentEvents,
      recentRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Organization.countDocuments(),
      Event.countDocuments(),
      Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Registration.countDocuments(),
      Event.find().sort({ createdAt: -1 }).limit(5).select('title eventType status createdAt capacity registrationCount'),
      Registration.find().sort({ createdAt: -1 }).limit(5).populate('attendee', 'firstName lastName email').populate('event', 'title')
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        usersByRole,
        totalOrganizations,
        totalEvents,
        eventsByStatus,
        totalRegistrations,
        recentEvents,
        recentRegistrations
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Organizer Analytics
const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const eventId = req.query.eventId;
    let eventFilter = {};
    if (eventId) {
      eventFilter = { event: eventId };
    } else {
      // Aggregate for events organized by current user
      const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
      const eventIds = myEvents.map(e => e._id);
      eventFilter = { event: { $in: eventIds } };
    }

    const [
      totalRegistrations,
      confirmedRegistrations,
      checkIns,
      ticketDistribution,
      sessions,
      feedback,
      sponsors,
      revenueResult
    ] = await Promise.all([
      Registration.countDocuments(eventFilter),
      Registration.countDocuments({ ...eventFilter, status: 'confirmed' }),
      Ticket.countDocuments({ ...eventFilter, isCheckedIn: true }),
      Registration.aggregate([
        { $match: { ...eventFilter, status: 'confirmed' } },
        { $group: { _id: '$ticketCategory', count: { $sum: 1 } } }
      ]),
      Session.find(eventId ? { event: eventId } : { event: { $in: eventFilter.event?.$in || [] } })
        .sort({ attendanceCount: -1 })
        .limit(5)
        .select('title attendanceCount sessionType startTime'),
      Feedback.aggregate([
        { $match: eventFilter },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]),
      Sponsor.countDocuments(eventFilter),
      Registration.aggregate([
        { $match: { ...eventFilter, status: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$finalAmount' } } }
      ])
    ]);

    const attendancePercentage = confirmedRegistrations > 0
      ? Number(((checkIns / confirmedRegistrations) * 100).toFixed(1))
      : 0;

    return res.json({
      success: true,
      data: {
        totalRegistrations,
        confirmedRegistrations,
        checkIns,
        attendancePercentage,
        ticketDistribution,
        sessionPopularity: sessions,
        feedbackRatings: feedback[0] || { averageRating: 0, count: 0 },
        sponsorCount: sponsors,
        revenueTotal: revenueResult[0]?.totalRevenue || 0
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Staff Analytics
const getStaffAnalytics = async (req, res, next) => {
  try {
    const eventId = req.query.eventId;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId query parameter is required' });
    }

    const [checkInCount, totalRegistrations, sessionAttendance] = await Promise.all([
      Ticket.countDocuments({ event: eventId, isCheckedIn: true }),
      Registration.countDocuments({ event: eventId, status: 'confirmed' }),
      SessionAttendance.aggregate([
        { $match: { event: eventId } },
        { $group: { _id: '$session', count: { $sum: 1 } } }
      ])
    ]);

    const attendancePercentage = totalRegistrations > 0
      ? Number(((checkInCount / totalRegistrations) * 100).toFixed(1))
      : 0;

    return res.json({
      success: true,
      data: {
        checkInCount,
        totalRegistrations,
        attendancePercentage,
        sessionAttendance
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnalytics,
  getAdminAnalytics,
  getOrganizerAnalytics,
  getStaffAnalytics
};