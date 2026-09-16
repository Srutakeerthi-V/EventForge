const Waitlist = require('../models/Waitlist');
const Registration = require('../models/Registration');

// @desc    Attendee joins the waitlist for an event
// @route   POST /api/waitlist
// @access  Private (attendee)
const joinWaitlist = async (req, res, next) => {
  try {
    const { event, ticketCategory } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'event is required',
      });
    }

    // 1. Check if the user is already registered for this event
    const existingRegistration = await Registration.findOne({
      attendee: req.user._id,
      event,
      status: { $nin: ['cancelled'] },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // 2. Check if already on the waitlist
    const existingWaitlist = await Waitlist.findOne({
      user: req.user._id,
      event,
    });

    if (existingWaitlist) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waitlist for this event',
      });
    }

    // 3. Determine position (current active waitlist count + 1)
    const currentCount = await Waitlist.countDocuments({
      event,
      status: { $in: ['waiting', 'invited'] },
    });

    const position = currentCount + 1;

    const entry = await Waitlist.create({
      event,
      user: req.user._id,
      ticketCategory,
      position,
      status: 'waiting',
    });

    await entry.populate([
      { path: 'event', select: 'title startDate' },
      { path: 'ticketCategory', select: 'name price' },
    ]);

    res.status(201).json({
      success: true,
      message: `You have been added to the waitlist at position ${position}`,
      data: entry,
    });
  } catch (error) {
    // Handle duplicate key (race condition on unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waitlist for this event',
      });
    }
    next(error);
  }
};

// @desc    Organizer: get the waitlist for a specific event
// @route   GET /api/waitlist?eventId=<id>
// @access  Private (organizer, admin)
const getWaitlist = async (req, res, next) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'eventId query parameter is required',
      });
    }

    const entries = await Waitlist.find({ event: eventId })
      .populate('user', 'firstName lastName email phone')
      .populate('ticketCategory', 'name price type')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attendee: get all their own waitlist entries
// @route   GET /api/waitlist/mine
// @access  Private (attendee)
const getMyWaitlists = async (req, res, next) => {
  try {
    const entries = await Waitlist.find({ user: req.user._id })
      .populate('event', 'title startDate endDate location')
      .populate('ticketCategory', 'name price type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attendee (or admin) removes a waitlist entry
// @route   DELETE /api/waitlist/:id
// @access  Private
const removeFromWaitlist = async (req, res, next) => {
  try {
    const entry = await Waitlist.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waitlist entry not found',
      });
    }

    // Only the owner or an admin can remove the entry
    if (entry.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove this waitlist entry',
      });
    }

    await entry.deleteOne();

    // Re-sequence positions for remaining entries in the same event
    const remaining = await Waitlist.find({
      event: entry.event,
      status: { $in: ['waiting', 'invited'] },
    }).sort({ position: 1 });

    const bulkOps = remaining.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { position: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await Waitlist.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: 'Removed from waitlist successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinWaitlist,
  getWaitlist,
  getMyWaitlists,
  removeFromWaitlist,
};
