const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deactivateOrganization,
} = require('../controllers/organizationController');

const router = express.Router();

router.get('/', protect, getOrganizations);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createOrganization);
router.get('/:id', protect, getOrganizationById);
router.put('/:id', protect, updateOrganization);
router.patch('/:id/status', protect, deactivateOrganization);

module.exports = router;
