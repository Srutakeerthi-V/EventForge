const Event = require('../models/Event');
const { sendResponse, sendError, validateObjectId } = require('../utils/helpers');

const normalizeEventPayload = (body) => {
  const payload = { ...body };

  if (payload.bannerImage && !payload.banner) {
    payload.banner = payload.bannerImage;
  }

  if (payload.registrationStart && !payload.registrationStartDate) {
    payload.registrationStartDate = payload.registrationStart;
  }

  if (payload.registrationEnd && !payload.registrationEndDate) {
    payload.registrationEndDate = payload.registrationEnd;
  }

  if (payload.published !== undefined && payload.isPublished === undefined) {
    payload.isPublished = payload.published;
  }

  if (payload.status) {
    payload.status = String(payload.status).toLowerCase();
  }

  if (payload.availableSeats !== undefined && payload.capacity !== undefined && payload.availableSeats === null) {
    payload.availableSeats = payload.capacity;
  }

  return payload;
};

const createEvent = async (req, res) => {
  try {
    if (!['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(req.user.role)) {
      return sendError(res, 403, 'Only platform admins and event organizers can create events', ['forbidden']);
    }

    const payload = normalizeEventPayload(req.body);

    if (!payload.title || !payload.description || !payload.eventType || !payload.startDate || !payload.endDate || !payload.capacity) {
      return sendError(res, 400, 'Required event fields are missing', ['title, description, eventType, startDate, endDate, and capacity are required']);
    }

    const event = await Event.create({
      ...payload,
      organizer: req.user._id,
      organization: payload.organization || req.user.organization || null,
      availableSeats: payload.availableSeats ?? payload.capacity,
      status: payload.status || 'draft',
      isPublished: payload.isPublished ?? false,
    });

    return sendResponse(res, 201, true, 'Event created successfully', { event });
  } catch (error) {
    return sendError(res, 500, 'Failed to create event', [error.message]);
  }
};

const getEvents = async (req, res) => {
  try {
    const filters = {};

    if (req.query.eventType) {
      filters.eventType = req.query.eventType;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.user && ['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(req.user.role)) {
      if (req.query.my === 'true') {
        filters.organizer = req.user._id;
      }
    } else {
      filters.isPublished = true;
      filters.status = { $in: ['published', 'registration_open', 'registration_closed', 'ongoing'] };
    }

    const events = await Event.find(filters)
      .populate('organizer', 'firstName lastName email')
      .populate('organization', 'name')
      .populate('venue', 'name city')
      .sort({ startDate: 1 });

    return sendResponse(res, 200, true, 'Events retrieved successfully', { events });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch events', [error.message]);
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid event id', ['invalid event id']);
    }

    const event = await Event.findById(id)
      .populate('organizer', 'firstName lastName email')
      .populate('organization', 'name')
      .populate('venue', 'name city address capacity');

    if (!event) {
      return sendError(res, 404, 'Event not found', ['event not found']);
    }

    if (!req.user || (!event.isPublished && req.user.role !== 'PLATFORM_ADMIN' && event.organizer._id.toString() !== req.user._id.toString())) {
      return sendError(res, 403, 'This event is not available', ['forbidden']);
    }

    return sendResponse(res, 200, true, 'Event retrieved successfully', { event });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch event', [error.message]);
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid event id', ['invalid event id']);
    }

    const event = await Event.findById(id);
    if (!event) {
      return sendError(res, 404, 'Event not found', ['event not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to update this event', ['forbidden']);
    }

    const payload = normalizeEventPayload(req.body);
    const allowedFields = [
      'title', 'description', 'eventType', 'organization', 'banner', 'startDate', 'endDate',
      'registrationStartDate', 'registrationEndDate', 'venue', 'status', 'capacity',
      'availableSeats', 'tags', 'topics', 'agenda', 'isPublished', 'published'
    ];

    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        event[field] = payload[field];
      }
    });

    await event.save();
    return sendResponse(res, 200, true, 'Event updated successfully', { event });
  } catch (error) {
    return sendError(res, 500, 'Failed to update event', [error.message]);
  }
};

const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return sendError(res, 404, 'Event not found', ['event not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to publish this event', ['forbidden']);
    }

    event.isPublished = true;
    event.status = 'published';
    await event.save();

    return sendResponse(res, 200, true, 'Event published successfully', { event });
  } catch (error) {
    return sendError(res, 500, 'Failed to publish event', [error.message]);
  }
};

const changeEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found', ['event not found']);
    if (req.user.role !== 'PLATFORM_ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to change this event status', ['forbidden']);
    }
    const status = String(req.body.status || '').toLowerCase();
    const allowedStatuses = ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) return sendError(res, 400, 'Invalid event status', [allowedStatuses.join(', ')]);
    event.status = status;
    event.isPublished = status !== 'draft' && status !== 'cancelled';
    await event.save();
    return sendResponse(res, 200, true, 'Event status updated successfully', { event });
  } catch (error) {
    return sendError(res, 500, 'Failed to change event status', [error.message]);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found', ['event not found']);
    if (req.user.role !== 'PLATFORM_ADMIN' && event.organizer.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to delete this event', ['forbidden']);
    }
    await event.deleteOne();
    return sendResponse(res, 200, true, 'Event deleted successfully', { id: req.params.id });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete event', [error.message]);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  publishEvent,
  changeEventStatus,
  deleteEvent,
};
