const Room = require('../models/Room');
const Venue = require('../models/Venue');
const { sendResponse, sendError, validateObjectId } = require('../utils/helpers');

const createRoom = async (req, res) => {
  try {
    if (!['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(req.user.role)) {
      return sendError(res, 403, 'Only admins and organizers can create rooms', ['forbidden']);
    }

    const { venue, name, capacity, floor, facilities } = req.body;
    if (!venue || !name || !capacity) {
      return sendError(res, 400, 'Venue, name and capacity are required', ['missing room fields']);
    }

    const parentVenue = await Venue.findById(venue);
    if (!parentVenue || !parentVenue.isActive) {
      return sendError(res, 400, 'Room must belong to an active venue', ['invalid venue']);
    }
    if (Number(capacity) > parentVenue.capacity) {
      return sendError(res, 400, 'Room capacity cannot exceed venue capacity', ['invalid capacity']);
    }

    const room = await Room.create({
      venue,
      name,
      capacity,
      floor,
      facilities,
    });

    return sendResponse(res, 201, true, 'Room created successfully', { room });
  } catch (error) {
    return sendError(res, 500, 'Failed to create room', [error.message]);
  }
};

const getRooms = async (req, res) => {
  try {
    const query = {};
    if (req.query.venue) {
      query.venue = req.query.venue;
    }

    const rooms = await Room.find(query).populate('venue', 'name city').sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Rooms retrieved successfully', { rooms });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch rooms', [error.message]);
  }
};

const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid room id', ['invalid room id']);
    }

    const room = await Room.findById(id).populate('venue', 'name city');
    if (!room) {
      return sendError(res, 404, 'Room not found', ['room not found']);
    }

    return sendResponse(res, 200, true, 'Room retrieved successfully', { room });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch room', [error.message]);
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid room id', ['invalid room id']);
    }

    const room = await Room.findById(id);
    if (!room) {
      return sendError(res, 404, 'Room not found', ['room not found']);
    }

    Object.keys(req.body).forEach((field) => {
      if (field !== '_id' && field !== '__v') {
        room[field] = req.body[field];
      }
    });

    await room.save();
    return sendResponse(res, 200, true, 'Room updated successfully', { room });
  } catch (error) {
    return sendError(res, 500, 'Failed to update room', [error.message]);
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid room id', ['invalid room id']);
    }

    const room = await Room.findById(id);
    if (!room) {
      return sendError(res, 404, 'Room not found', ['room not found']);
    }

    await room.deleteOne();
    return sendResponse(res, 200, true, 'Room deleted successfully', { id });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete room', [error.message]);
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
