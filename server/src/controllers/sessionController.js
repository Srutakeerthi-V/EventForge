const mongoose = require('mongoose');
const Session = require('../models/Session');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check for a room scheduling conflict.
 * @param {string} room        - Room ObjectId
 * @param {Date}   startTime   - Proposed start
 * @param {Date}   endTime     - Proposed end
 * @param {string} [excludeId] - Session _id to exclude (for updates)
 */
const checkRoomConflict = async (room, startTime, endTime, excludeId = null) => {
  const query = {
    room,
    status: { $ne: 'cancelled' },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Session.findOne(query);
};

/**
 * Check for a speaker scheduling conflict.
 * @param {string} speaker     - User ObjectId of the speaker
 * @param {Date}   startTime   - Proposed start
 * @param {Date}   endTime     - Proposed end
 * @param {string} [excludeId] - Session _id to exclude (for updates)
 */
const checkSpeakerConflict = async (speaker, startTime, endTime, excludeId = null) => {
  const query = {
    speaker,
    status: { $ne: 'cancelled' },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Session.findOne(query);
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// @desc    Create a session for an event
// @route   POST /api/sessions
// @access  Private (organizer, admin)
const createSession = async (req, res, next) => {
  try {
    const { event, title, description, speaker, room, startTime, endTime, sessionType, capacity, topics } =
      req.body;

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'startTime must be before endTime',
      });
    }

    // 1. Room conflict check
    if (room) {
      const roomConflict = await checkRoomConflict(room, startTime, endTime);
      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: 'Room is already booked for this time slot',
        });
      }
    }

    // 2. Speaker conflict check
    if (speaker) {
      const speakerConflict = await checkSpeakerConflict(speaker, startTime, endTime);
      if (speakerConflict) {
        return res.status(400).json({
          success: false,
          message: 'Speaker has another session scheduled during this time',
        });
      }
    }

    const session = await Session.create({
      event,
      title,
      description,
      speaker: speaker || undefined,
      room: room || undefined,
      startTime,
      endTime,
      sessionType: sessionType || 'presentation',
      capacity,
      topics: Array.isArray(topics) ? topics : topics ? [topics] : [],
    });

    await session.populate([
      { path: 'speaker', select: 'firstName lastName email' },
      { path: 'room', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sessions for an event
// @route   GET /api/sessions?eventId=<id>
// @access  Public / optionalAuth
const getSessions = async (req, res, next) => {
  try {
    const { eventId } = req.query;

    const filter = eventId ? { event: eventId } : {};

    const sessions = await Session.find(filter)
      .populate('speaker', 'firstName lastName email')
      .populate('room', 'name capacity floor')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('speaker', 'firstName lastName email')
      .populate('room', 'name capacity floor')
      .populate('event', 'title startDate endDate');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a session (with conflict re-check excluding current session)
// @route   PUT /api/sessions/:id
// @access  Private (organizer, admin)
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const startTime = req.body.startTime || session.startTime;
    const endTime   = req.body.endTime   || session.endTime;
    const room      = req.body.room      !== undefined ? req.body.room    : session.room;
    const speaker   = req.body.speaker   !== undefined ? req.body.speaker : session.speaker;

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'startTime must be before endTime',
      });
    }

    // 1. Room conflict check (excluding current session)
    if (room) {
      const roomConflict = await checkRoomConflict(room, startTime, endTime, req.params.id);
      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: 'Room is already booked for this time slot',
        });
      }
    }

    // 2. Speaker conflict check (excluding current session)
    if (speaker) {
      const speakerConflict = await checkSpeakerConflict(speaker, startTime, endTime, req.params.id);
      if (speakerConflict) {
        return res.status(400).json({
          success: false,
          message: 'Speaker has another session scheduled during this time',
        });
      }
    }

    const allowedFields = [
      'title',
      'description',
      'speaker',
      'room',
      'startTime',
      'endTime',
      'sessionType',
      'capacity',
      'topics',
      'status',
      'presentationMaterial',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();

    await session.populate([
      { path: 'speaker', select: 'firstName lastName email' },
      { path: 'room', select: 'name capacity floor' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private (organizer, admin)
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sessions assigned to the logged-in speaker
// @route   GET /api/sessions/mine
// @access  Private (speaker)
const getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ speaker: req.user._id })
      .populate('event', 'title startDate endDate')
      .populate('room', 'name capacity floor')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getMySessions,
};
