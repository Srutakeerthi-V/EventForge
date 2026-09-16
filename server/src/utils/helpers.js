const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '90d' });
};

const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = []) => {
  const response = { success: false, message };
  if (errors.length > 0) response.errors = errors;
  return res.status(statusCode).json(response);
};

const validateObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

module.exports = { generateToken, generateRefreshToken, sendResponse, sendError, validateObjectId };
