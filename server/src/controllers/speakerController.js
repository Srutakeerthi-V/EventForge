const SpeakerProfile = require('../models/SpeakerProfile');

// @desc    Speaker creates or updates their own profile (upsert)
// @route   POST /api/speakers/me  |  PUT /api/speakers/me
// @access  Private (speaker)
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'designation',
      'company',
      'bio',
      'expertise',
      'linkedin',
      'twitter',
      'website',
      'photo',
      'isPublic',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await SpeakerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'firstName lastName email');

    const statusCode = profile ? 200 : 201;

    res.status(statusCode).json({
      success: true,
      message: 'Speaker profile saved successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Speaker gets their own profile
// @route   GET /api/speakers/me
// @access  Private (speaker)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await SpeakerProfile.findOne({ user: req.user._id }).populate(
      'user',
      'firstName lastName email'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Speaker profile not found. Please create one.',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all speaker profiles (organizer/admin)
// @route   GET /api/speakers
// @access  Private (organizer, admin)
const getAllSpeakers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isPublic !== undefined) {
      filter.isPublic = req.query.isPublic === 'true';
    }

    const profiles = await SpeakerProfile.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single speaker profile by userId
// @route   GET /api/speakers/:userId
// @access  Private
const getSpeakerById = async (req, res, next) => {
  try {
    const profile = await SpeakerProfile.findOne({ user: req.params.userId }).populate(
      'user',
      'firstName lastName email'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Speaker profile not found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Speaker updates their availability slots
// @route   PUT /api/speakers/me/availability
// @access  Private (speaker)
const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'availability must be an array of time slots',
      });
    }

    const profile = await SpeakerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { availability } },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateProfile,
  getMyProfile,
  getAllSpeakers,
  getSpeakerById,
  updateAvailability,
};
