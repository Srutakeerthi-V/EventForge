const Sponsor = require('../models/Sponsor');
const SponsorshipPackage = require('../models/SponsorshipPackage');
const SponsorDeliverable = require('../models/SponsorDeliverable');

const listSponsors = async (req, res, next) => {
  try { const sponsors = await Sponsor.find(req.query.eventId ? { event: req.query.eventId } : {}).populate('package', 'name price benefits').populate('event', 'title').sort({ createdAt: -1 }); res.json({ success: true, data: { sponsors } }); } catch (error) { next(error); }
};

const createPackage = async (req, res, next) => {
  try { const packageDoc = await SponsorshipPackage.create(req.body); res.status(201).json({ success: true, data: { package: packageDoc } }); } catch (error) { next(error); }
};

const listPackages = async (req, res, next) => {
  try { const packages = await SponsorshipPackage.find(req.query.eventId ? { event: req.query.eventId } : {}).sort({ price: 1 }); res.json({ success: true, data: { packages } }); } catch (error) { next(error); }
};

const createSponsor = async (req, res, next) => {
  try {
    const { event, package: packageId } = req.body;
    const packageDoc = await SponsorshipPackage.findOneAndUpdate({ _id: packageId, event, isActive: true, $expr: { $lt: ['$slotsUsed', '$slotsAvailable'] } }, { $inc: { slotsUsed: 1 } }, { new: true });
    if (!packageDoc) return res.status(409).json({ success: false, message: 'Sponsorship package is unavailable' });
    const sponsor = await Sponsor.create({ ...req.body, user: req.user._id, status: 'active' });
    res.status(201).json({ success: true, data: { sponsor } });
  } catch (error) { next(error); }
};

const createDeliverable = async (req, res, next) => {
  try { const deliverable = await SponsorDeliverable.create(req.body); res.status(201).json({ success: true, data: { deliverable } }); } catch (error) { next(error); }
};

const listDeliverables = async (req, res, next) => {
  try { const deliverables = await SponsorDeliverable.find(req.query.sponsorId ? { sponsor: req.query.sponsorId } : {}).populate('sponsor', 'brandName').sort({ dueDate: 1 }); res.json({ success: true, data: { deliverables } }); } catch (error) { next(error); }
};

const updateDeliverable = async (req, res, next) => {
  try { const deliverable = await SponsorDeliverable.findByIdAndUpdate(req.params.id, { ...req.body, completionDate: req.body.status === 'completed' ? new Date() : req.body.completionDate }, { new: true, runValidators: true }); if (!deliverable) return res.status(404).json({ success: false, message: 'Deliverable not found' }); res.json({ success: true, data: { deliverable } }); } catch (error) { next(error); }
};

module.exports = { listSponsors, createPackage, listPackages, createSponsor, createDeliverable, listDeliverables, updateDeliverable };