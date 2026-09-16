const User = require('../models/User');
const { sendResponse, sendError, validateObjectId } = require('../utils/helpers');

const getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'PLATFORM_ADMIN') {
      return sendError(res, 403, 'Only platform admins can list users', ['Forbidden']);
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Users retrieved successfully', { users });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch users', [error.message]);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid user id', ['invalid user id']);
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found', ['user not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user._id.toString() !== user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to view this user', ['forbidden']);
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch user', [error.message]);
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found', ['user not found']);
    }
    return sendResponse(res, 200, true, 'Profile retrieved successfully', { user });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch profile', [error.message]);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = id || req.user._id;

    if (!validateObjectId(targetId)) {
      return sendError(res, 400, 'Invalid user id', ['invalid user id']);
    }

    const user = await User.findById(targetId);
    if (!user) {
      return sendError(res, 404, 'User not found', ['user not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user._id.toString() !== user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to update this user', ['forbidden']);
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'bio', 'organization'];
    const nextData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        nextData[field] = req.body[field];
      }
    });

    if (req.user.role === 'PLATFORM_ADMIN' && req.body.role) {
      nextData.role = req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(targetId, nextData, {
      new: true,
      runValidators: true,
    }).select('-password');

    return sendResponse(res, 200, true, 'User updated successfully', { user: updatedUser });
  } catch (error) {
    return sendError(res, 500, 'Failed to update user', [error.message]);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current and new password are required', ['currentPassword and newPassword are required']);
    }
    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters', ['new password must be at least 6 characters']);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found', ['user not found']);
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect', ['current password is incorrect']);
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully', { user: user.toJSON() });
  } catch (error) {
    return sendError(res, 500, 'Failed to change password', [error.message]);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'PLATFORM_ADMIN') {
      return sendError(res, 403, 'Only platform admins can update user status', ['forbidden']);
    }

    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid user id', ['invalid user id']);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User not found', ['user not found']);
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendResponse(res, 200, true, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, {
      user: user.toJSON(),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update user status', [error.message]);
  }
};

module.exports = {
  getUsers,
  getUserById,
  getMyProfile,
  updateUser,
  changePassword,
  toggleUserStatus,
};
