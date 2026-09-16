const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, sendResponse, sendError } = require('../utils/helpers');

const normalizeRole = (role) => {
  const normalized = String(role || 'ATTENDEE').trim().toUpperCase();

  const roleMap = {
    ADMIN: 'PLATFORM_ADMIN',
    PLATFORM_ADMIN: 'PLATFORM_ADMIN',
    ORGANIZER: 'EVENT_ORGANIZER',
    EVENT_ORGANIZER: 'EVENT_ORGANIZER',
    STAFF: 'EVENT_STAFF',
    EVENT_STAFF: 'EVENT_STAFF',
    SPEAKER: 'SPEAKER',
    ATTENDEE: 'ATTENDEE',
    SPONSOR: 'SPONSOR',
  };

  return roleMap[normalized] || 'ATTENDEE';
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName) {
      return sendError(res, 400, 'First name and last name are required', ['firstName and lastName are required']);
    }

    if (!email) {
      return sendError(res, 400, 'Email is required', ['email is required']);
    }

    if (!password || password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long', ['password must be at least 6 characters long']);
    }

    const emailValue = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailValue });

    if (existingUser) {
      return sendError(res, 400, 'User already exists with this email', ['email already registered']);
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailValue,
      password,
      role: normalizeRole(role),
    });

    const token = generateToken(user._id);

    return sendResponse(res, 201, true, 'User registered successfully', {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((item) => item.message);
      return sendError(res, 400, 'Validation error', errors);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return sendError(res, 400, `${field} already exists`, [`${field} is already in use`]);
    }

    return sendError(res, 500, 'Failed to register user', [error.message]);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required', ['email and password are required']);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return sendError(res, 401, 'Invalid email or password', ['Invalid email or password']);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password', ['Invalid email or password']);
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Account is deactivated', ['Account is deactivated']);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to login', [error.message]);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    return sendResponse(res, 200, true, 'Current user retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch current user', [error.message]);
  }
};

const logout = async (req, res) => {
  try {
    return sendResponse(res, 200, true, 'Logout successful', null);
  } catch (error) {
    return sendError(res, 500, 'Failed to logout', [error.message]);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
