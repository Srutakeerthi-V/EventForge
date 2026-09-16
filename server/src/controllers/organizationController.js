const Organization = require('../models/Organization');
const User = require('../models/User');
const { sendResponse, sendError, validateObjectId } = require('../utils/helpers');

const createOrganization = async (req, res) => {
  try {
    const { name, description, website, email, phone, address, city, country, industry } = req.body;

    if (!name) {
      return sendError(res, 400, 'Organization name is required', ['name is required']);
    }

    const organization = await Organization.create({
      name,
      description,
      website,
      email,
      phone,
      address,
      city,
      country,
      industry,
      owner: req.user._id,
      isActive: true,
    });

    if (req.user.role !== 'PLATFORM_ADMIN' && !req.user.organization) {
      await User.findByIdAndUpdate(req.user._id, { organization: organization._id });
    }

    return sendResponse(res, 201, true, 'Organization created successfully', { organization });
  } catch (error) {
    return sendError(res, 500, 'Failed to create organization', [error.message]);
  }
};

const getOrganizations = async (req, res) => {
  try {
    let organizations;

    if (req.user.role === 'PLATFORM_ADMIN') {
      organizations = await Organization.find().sort({ createdAt: -1 });
    } else {
      organizations = await Organization.find({
        $or: [
          { _id: req.user.organization },
          { owner: req.user._id },
        ],
      }).sort({ createdAt: -1 });
    }

    return sendResponse(res, 200, true, 'Organizations retrieved successfully', { organizations });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch organizations', [error.message]);
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid organization id', ['invalid organization id']);
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return sendError(res, 404, 'Organization not found', ['organization not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && organization.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have access to this organization', ['forbidden']);
    }

    return sendResponse(res, 200, true, 'Organization retrieved successfully', { organization });
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch organization', [error.message]);
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid organization id', ['invalid organization id']);
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return sendError(res, 404, 'Organization not found', ['organization not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && organization.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to update this organization', ['forbidden']);
    }

    const allowedFields = ['name', 'description', 'website', 'email', 'phone', 'address', 'city', 'country', 'industry', 'isActive'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await Organization.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return sendResponse(res, 200, true, 'Organization updated successfully', { organization: updated });
  } catch (error) {
    return sendError(res, 500, 'Failed to update organization', [error.message]);
  }
};

const deactivateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return sendError(res, 400, 'Invalid organization id', ['invalid organization id']);
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return sendError(res, 404, 'Organization not found', ['organization not found']);
    }

    if (req.user.role !== 'PLATFORM_ADMIN' && organization.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not allowed to deactivate this organization', ['forbidden']);
    }

    organization.isActive = !organization.isActive;
    await organization.save();

    return sendResponse(res, 200, true, `Organization ${organization.isActive ? 'activated' : 'deactivated'} successfully`, {
      organization,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update organization status', [error.message]);
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deactivateOrganization,
};
