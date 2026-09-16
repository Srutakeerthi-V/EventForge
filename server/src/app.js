const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/usersRoutes');
const organizationRoutes = require('./routes/organizationsRoutes');
const eventRoutes = require('./routes/eventsRoutes');
const venueRoutes = require('./routes/venuesRoutes');
const roomRoutes = require('./routes/roomsRoutes');
const speakerRoutes = require('./routes/speakerRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const ticketCategoryRoutes = require('./routes/ticketCategoryRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const couponRoutes = require('./routes/couponRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const staffRoutes = require('./routes/staffRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EventForge API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ticket-categories', ticketCategoryRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
