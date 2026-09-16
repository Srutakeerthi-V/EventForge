const Venue = require('../models/Venue');
const Room = require('../models/Room');
const { sendResponse, sendError, validateObjectId } = require('../utils/helpers');

const createVenue = async (req, res) => {
  try {
    if (!['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(req.user.role)) {
      return sendError(res, 403, 'Only admins and organizers can create venues', ['forbidden']);
    }

    const { name, address, city, capacity, contactPerson, facilities } = req.body;
    if (!name || !address || !city || !capacity) {
      return sendError(res, 400, 'Name, address, city and capacity are required', ['missing required venue fields']);
    }

    const venue = await Venue.create({
      name,
      address,
      city,
      capacity,
      contactName: contactPerson,
      facilities,
      createdBy: req.user._id,
      organization: req.user.organization || null,
    });

    return sendResponse(res, 201, true, 'Venue created successfully', { venue });
  } catch (error) {
    return sendError(res, 500, 'Failed to create venue', [error.message]);
  }
};

const getVenues = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'PLATFORM_ADMIN') {
      query.$or = [
        { organization: req.user.organization },
        { createdBy: req.user._id },
      ];
    }

    const venues = await Venue.find(query).sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Venues retrieved successfully', { venues });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch venues', [error.message]);
  }
};

const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid venue id', ['invalid venue id']);
    }

    const venue = await Venue.findById(id);
    if (!venue) {
      return sendError(res, 404, 'Venue not found', ['venue not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && venue.createdBy?.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have access to this venue', ['forbidden']);
    }

    return sendResponse(res, 200, true, 'Venue retrieved successfully', { venue });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch venue', [error.message]);
  }
};

const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid venue id', ['invalid venue id']);
    }

    const venue = await Venue.findById(id);
    if (!venue) {
      return sendError(res, 404, 'Venue not found', ['venue not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && venue.createdBy?.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to update this venue', ['forbidden']);
    }

    Object.keys(req.body).forEach((field) => {
      if (field !== '_id' && field !== '__v') {
        venue[field] = req.body[field];
      }
    });

    await venue.save();
    return sendResponse(res, 200, true, 'Venue updated successfully', { venue });
  } catch (error) {
    return sendError(res, 500, 'Failed to update venue', [error.message]);
  }
};

const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid venue id', ['invalid venue id']);
    }

    const venue = await Venue.findById(id);
    if (!venue) {
      return sendError(res, 404, 'Venue not found', ['venue not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && venue.createdBy?.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to delete this venue', ['forbidden']);
    }

    const roomCount = await Room.countDocuments({ venue: venue._id, isActive: true });
    if (roomCount > 0) {
      return sendError(res, 409, 'Venue cannot be deleted while it has active rooms', ['delete or deactivate rooms first']);
    }
    await venue.deleteOne();
    return sendResponse(res, 200, true, 'Venue deleted successfully', { id });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete venue', [error.message]);
  }
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
};
