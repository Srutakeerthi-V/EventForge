const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createOrganization, getOrganizations, getOrganizationById, updateOrganization, deactivateOrganization } = require('../controllers/organizationController');

const router = express.Router();

router.get('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), getOrganizations);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createOrganization);
router.get('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), getOrganizationById);
router.put('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), updateOrganization);
router.patch('/:id/status', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), deactivateOrganization);

module.exports = router;
