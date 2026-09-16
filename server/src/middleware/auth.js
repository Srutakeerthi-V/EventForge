const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeRole = (role) => {
  if (!role) return '';
  const normalized = String(role).trim();
  const aliases = {
    admin: 'PLATFORM_ADMIN',
    organizer: 'EVENT_ORGANIZER',
    staff: 'EVENT_STAFF',
    speaker: 'SPEAKER',
    attendee: 'ATTENDEE',
    sponsor: 'SPONSOR',
    PLATFORM_ADMIN: 'PLATFORM_ADMIN',
    EVENT_ORGANIZER: 'EVENT_ORGANIZER',
    EVENT_STAFF: 'EVENT_STAFF',
    SPEAKER: 'SPEAKER',
    ATTENDEE: 'ATTENDEE',
    SPONSOR: 'SPONSOR',
  };
  return aliases[normalized.toLowerCase()] || normalized.toUpperCase();
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      if (!req.user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }
      req.user.role = normalizeRole(req.user.role);
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole || req.user?.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
