const TicketCategory = require('../models/TicketCategory');

// @desc    Organizer creates a ticket category for their event
// @route   POST /api/ticket-categories
// @access  Private (organizer, admin)
const createTicketCategory = async (req, res, next) => {
  try {
    const { event, name, type, price, capacity, benefits, saleStartDate, saleEndDate, maxPerPerson, isActive, description } =
      req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'event is required',
      });
    }

    const category = await TicketCategory.create({
      event,
      name,
      type,
      price,
      capacity,
      benefits,
      saleStartDate,
      saleEndDate,
      maxPerPerson,
      isActive,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket category created successfully',
      data: { ticketCategory: category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket categories for an event
// @route   GET /api/ticket-categories?eventId=<id>
// @access  Public / optionalAuth
const getTicketCategoriesByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.query;

    const filter = eventId ? { event: eventId } : {};

    // Non-organizer/admin users only see active categories
    if (!req.user || !['EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'organizer', 'admin'].includes(req.user.role)) {
      filter.isActive = true;
    }

    const categories = await TicketCategory.find(filter).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: { ticketCategories: categories },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ticket category
// @route   PUT /api/ticket-categories/:id
// @access  Private (organizer, admin)
const updateTicketCategory = async (req, res, next) => {
  try {
    const category = await TicketCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Ticket category not found',
      });
    }

    const allowedFields = [
      'name',
      'type',
      'price',
      'capacity',
      'benefits',
      'saleStartDate',
      'saleEndDate',
      'maxPerPerson',
      'isActive',
      'description',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Ticket category updated successfully',
      data: { ticketCategory: category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket category
// @route   DELETE /api/ticket-categories/:id
// @access  Private (organizer, admin)
const deleteTicketCategory = async (req, res, next) => {
  try {
    const category = await TicketCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Ticket category not found',
      });
    }

    if (category.sold > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a ticket category with sold tickets. Deactivate it instead.',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Ticket category deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicketCategory,
  getTicketCategoriesByEvent,
  updateTicketCategory,
  deleteTicketCategory,
};
