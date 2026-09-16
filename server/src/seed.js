const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Venue = require('./models/Venue');
const Room = require('./models/Room');
const SpeakerProfile = require('./models/SpeakerProfile');
const Session = require('./models/Session');
const TicketCategory = require('./models/TicketCategory');
const Registration = require('./models/Registration');
const Ticket = require('./models/Ticket');
const Sponsor = require('./models/Sponsor');
const SponsorshipPackage = require('./models/SponsorshipPackage');
const SponsorDeliverable = require('./models/SponsorDeliverable');
const StaffAssignment = require('./models/StaffAssignment');
const Coupon = require('./models/Coupon');
const Waitlist = require('./models/Waitlist');
const Announcement = require('./models/Announcement');
const Feedback = require('./models/Feedback');
const UserInterest = require('./models/UserInterest');
const AIContent = require('./models/AIContent');
const Subscription = require('./models/Subscription');

const DEMO_PASSWORD = 'Password123';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventforge';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully.');

    // Clear existing collections
    console.log('Clearing old collections...');
    const collections = [
      User, Organization, Subscription, Event, Venue, Room,
      SpeakerProfile, Session, TicketCategory, Registration, Ticket,
      Sponsor, SponsorshipPackage, SponsorDeliverable, StaffAssignment,
      Coupon, Waitlist, Announcement, Feedback, UserInterest, AIContent
    ];
    for (const model of collections) {
      await model.deleteMany({});
    }

    console.log('Creating demo users...');
    const admin = await User.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'PLATFORM_ADMIN',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 019-2831',
      bio: 'Global platform administrator managing infrastructure and enterprise policies.'
    });

    const organizer = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'organizer@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'EVENT_ORGANIZER',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 018-7744',
      bio: 'Executive Director of Global Conferences with 12+ years in corporate summit logistics.'
    });

    const staff = await User.create({
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'staff@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'EVENT_STAFF',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 014-9922',
      bio: 'Lead on-site operations and badge access coordinator.'
    });

    const speaker = await User.create({
      firstName: 'Dr. Emily',
      lastName: 'Watson',
      email: 'speaker@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'SPEAKER',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 012-3456',
      bio: 'Principal AI Strategist and Keynote speaker specializing in autonomous enterprise systems.'
    });

    const attendee = await User.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'attendee@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'ATTENDEE',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 017-8899',
      bio: 'Senior Technical Lead eager to explore upcoming enterprise technology and networks.'
    });

    const sponsorUser = await User.create({
      firstName: 'TechCorp',
      lastName: 'Partners',
      email: 'sponsor@eventforge.com',
      password: DEMO_PASSWORD,
      role: 'SPONSOR',
      isActive: true,
      isEmailVerified: true,
      phone: '+1 (555) 011-5500',
      bio: 'Corporate Sponsorship and Brand Relations Manager at TechCorp Solutions.'
    });

    console.log('Creating organization and subscription...');
    const org = await Organization.create({
      name: 'EventForge Enterprises',
      slug: 'eventforge-enterprises',
      description: 'Global corporate events and premier summit production organization.',
      website: 'https://eventforge.example.com',
      email: 'contact@eventforge.example.com',
      phone: '+1 (555) 010-0000',
      address: '100 Innovation Way, Suite 500',
      city: 'San Francisco',
      country: 'United States',
      industry: 'Technology & Events',
      size: '51-200',
      owner: organizer._id,
      isActive: true
    });

    const subscription = await Subscription.create({
      organization: org._id,
      plan: 'enterprise',
      status: 'active',
      maxEvents: 50,
      maxAttendees: 5000,
      features: ['Custom Branding', 'QR Rapid Check-in', 'Dedicated Account Rep', 'AI Studio'],
      price: 2499
    });

    await Organization.findByIdAndUpdate(org._id, { subscription: subscription._id });
    await User.findByIdAndUpdate(organizer._id, { organization: org._id });

    console.log('Creating venues and rooms...');
    const venue = await Venue.create({
      name: 'Grand Convention Center',
      address: '750 Howard Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94103',
      capacity: 2500,
      facilities: ['High-speed Wi-Fi 6', '4K Laser Projection', 'VIP Green Room', 'Simultaneous Translation', 'Catering Deck', 'Direct Freight Loading'],
      description: 'Flagship convention center equipped with broadcast-quality AV and auditorium facilities.',
      createdBy: organizer._id,
      organization: org._id,
      isActive: true
    });

    const mainHall = await Room.create({
      venue: venue._id,
      name: 'Grand Auditorium (Main Hall)',
      capacity: 800,
      floor: 'Level 1',
      facilities: ['Main Keynote Stage', 'Dolby Surround Sound', 'Dual 4K LED Walls', 'Livestream Studio'],
      isActive: true
    });

    const workshopRoom = await Room.create({
      venue: venue._id,
      name: 'Workshop Lab A',
      capacity: 120,
      floor: 'Level 2',
      facilities: ['Hands-on Pods', 'Power per Desk', 'Interactive Whiteboards', 'Presenter Display'],
      isActive: true
    });

    const panelRoom = await Room.create({
      venue: venue._id,
      name: 'Executive Panel Hall B',
      capacity: 200,
      floor: 'Level 2',
      facilities: ['Lounge Seating', 'Panel Microphones', 'Audience Q&A Stations'],
      isActive: true
    });

    console.log('Creating speaker profile...');
    await SpeakerProfile.create({
      user: speaker._id,
      designation: 'Principal AI Researcher & Fellow',
      company: 'TechInnovate Systems',
      bio: 'Dr. Emily Watson leads next-generation enterprise AI research and has authored landmark publications on generative agentic workflows.',
      expertise: ['Artificial Intelligence', 'Autonomous Agents', 'Neural Architectures', 'Enterprise Innovation'],
      linkedin: 'https://linkedin.com/in/emilywatson-ai',
      twitter: 'https://twitter.com/dr_emily_watson',
      website: 'https://emilywatson.example.com',
      availability: [
        { date: new Date(Date.now() + 86400000 * 30), startTime: '09:00', endTime: '18:00', isAvailable: true }
      ],
      isPublic: true
    });

    console.log('Creating events...');
    const now = Date.now();
    const event1StartDate = new Date(now + 86400000 * 30); // 30 days ahead
    const event1EndDate = new Date(now + 86400000 * 32);

    const event1 = await Event.create({
      title: 'TechSummit 2026: Enterprise Frontiers',
      description: 'The premier enterprise conference bringing together visionary leaders, software architects, and AI pioneers. Featuring three days of high-impact keynotes, technical deep dives, and networking.',
      eventType: 'Conference',
      organizer: organizer._id,
      organization: org._id,
      banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      startDate: event1StartDate,
      endDate: event1EndDate,
      registrationStartDate: new Date(now - 86400000 * 7),
      registrationEndDate: new Date(now + 86400000 * 25),
      venue: venue._id,
      capacity: 500,
      availableSeats: 490,
      status: 'published',
      isPublished: true,
      tags: ['AI', 'Cloud Architecture', 'DevOps', 'Cybersecurity', 'Leadership'],
      topics: ['Agentic Workflows', 'Zero Trust Architecture', 'Cloud Scale', 'Corporate Innovation'],
      agenda: [
        { time: '09:00 AM', title: 'Registration & Welcome Coffee', description: 'Check-in at main lobby and pick up credential badges' },
        { time: '10:00 AM', title: 'Opening Keynote: Autonomous AI Frontiers', description: 'Keynote delivery by Dr. Emily Watson' },
        { time: '12:30 PM', title: 'Executive Networking Luncheon', description: 'Gourmet buffet and structured executive roundtable' },
        { time: '02:00 PM', title: 'Cloud Modernization Masterclass', description: 'Interactive hands-on session in Workshop Lab A' },
        { time: '04:00 PM', title: 'Future of Security Panel', description: 'Cross-industry discussion on sovereign clouds and threat defense' }
      ],
      registrationCount: 1,
      checkInCount: 0
    });

    const event2StartDate = new Date(now + 86400000 * 45);
    const event2EndDate = new Date(now + 86400000 * 46);

    const event2 = await Event.create({
      title: 'Global DevCon & Cloud Expo 2026',
      description: 'An intensive two-day engineering summit focused on microservices, cloud-native deployments, and container orchestration.',
      eventType: 'Workshop',
      organizer: organizer._id,
      organization: org._id,
      banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      startDate: event2StartDate,
      endDate: event2EndDate,
      registrationStartDate: new Date(now - 86400000 * 5),
      registrationEndDate: new Date(now + 86400000 * 40),
      venue: venue._id,
      capacity: 200,
      availableSeats: 200,
      status: 'published',
      isPublished: true,
      tags: ['Engineering', 'Kubernetes', 'Cloud Native'],
      topics: ['Microservices', 'Site Reliability', 'Distributed Systems'],
      registrationCount: 0,
      checkInCount: 0
    });

    console.log('Creating ticket categories...');
    const catEarlyBird = await TicketCategory.create({
      event: event1._id,
      name: 'Early Bird Pass',
      type: 'Early Bird',
      price: 199,
      capacity: 100,
      sold: 0,
      benefits: ['All Keynotes & Sessions', 'Lounge Access', 'Continental Breakfast & Lunch', 'Digital Badge'],
      saleStartDate: new Date(now - 86400000 * 10),
      saleEndDate: new Date(now + 86400000 * 10),
      isActive: true,
      description: 'Discounted access for early registrants.'
    });

    const catGeneral = await TicketCategory.create({
      event: event1._id,
      name: 'General Admission',
      type: 'General',
      price: 349,
      capacity: 300,
      sold: 1,
      benefits: ['All Stage Sessions', 'Expo Floor Access', 'Networking Reception', 'Attendee Kit'],
      saleStartDate: new Date(now - 86400000 * 10),
      saleEndDate: new Date(now + 86400000 * 25),
      isActive: true,
      description: 'Full 3-day access to all main tracks and sponsor showcase.'
    });

    const catVIP = await TicketCategory.create({
      event: event1._id,
      name: 'VIP Executive Pass',
      type: 'VIP',
      price: 799,
      capacity: 50,
      sold: 0,
      benefits: ['Front-Row Keynote Seating', 'Private Speaker Lounge Access', 'VIP Gala Dinner', 'Fast-Track Check-in', '1-on-1 Mentorship Session'],
      saleStartDate: new Date(now - 86400000 * 10),
      saleEndDate: new Date(now + 86400000 * 25),
      isActive: true,
      description: 'Exclusive executive experience with premium privileges.'
    });

    console.log('Creating conflict-free sessions...');
    const session1Start = new Date(event1StartDate.getTime() + 10 * 3600000); // 10:00 AM
    const session1End = new Date(event1StartDate.getTime() + 11.5 * 3600000); // 11:30 AM
    const session2Start = new Date(event1StartDate.getTime() + 14 * 3600000); // 02:00 PM
    const session2End = new Date(event1StartDate.getTime() + 15.5 * 3600000); // 03:30 PM
    const session3Start = new Date(event1StartDate.getTime() + 16 * 3600000); // 04:00 PM
    const session3End = new Date(event1StartDate.getTime() + 17.5 * 3600000); // 05:30 PM

    const session1 = await Session.create({
      event: event1._id,
      title: 'Opening Keynote: Autonomous AI Frontiers',
      description: 'An illuminating analysis of how multi-agent architectures are reshaping modern corporate workflows, compliance, and product development.',
      speaker: speaker._id,
      room: mainHall._id,
      startTime: session1Start,
      endTime: session1End,
      sessionType: 'keynote',
      capacity: 500,
      topics: ['Artificial Intelligence', 'Autonomous Agents', 'Leadership'],
      status: 'scheduled',
      attendanceCount: 1,
      presentationMaterial: [
        { title: 'Keynote Slides (PDF)', url: 'https://example.com/slides-keynote.pdf', type: 'slides' }
      ]
    });

    const session2 = await Session.create({
      event: event1._id,
      title: 'Cloud Modernization Masterclass & Hands-on Lab',
      description: 'Step-by-step techniques to decouple monolithic systems, scale microservices, and deploy multi-cloud Kubernetes clusters.',
      room: workshopRoom._id,
      startTime: session2Start,
      endTime: session2End,
      sessionType: 'workshop',
      capacity: 100,
      topics: ['Cloud Scale', 'Kubernetes', 'Architecture'],
      status: 'scheduled',
      attendanceCount: 0
    });

    const session3 = await Session.create({
      event: event1._id,
      title: 'Executive Panel: Future of Sovereign Cloud & Data Privacy',
      description: 'Leading CISOs and policy advisors discuss global data residency, zero-trust infrastructure, and cyber resilience.',
      room: panelRoom._id,
      startTime: session3Start,
      endTime: session3End,
      sessionType: 'panel',
      capacity: 180,
      topics: ['Zero Trust', 'Cybersecurity', 'Governance'],
      status: 'scheduled',
      attendanceCount: 1
    });

    console.log('Creating sponsorship packages & sponsors...');
    const packageGold = await SponsorshipPackage.create({
      event: event1._id,
      name: 'Gold Corporate Partner',
      description: 'Prominent brand visibility, expo showcase booth, and co-branded reception.',
      price: 7500,
      tier: 'gold',
      benefits: ['Premium 10x10 Expo Booth', 'Logo on main stage screens', '4 Complimentary VIP Passes', 'Sponsor spotlight in keynote booklet'],
      slotsAvailable: 4,
      slotsUsed: 1,
      isActive: true
    });

    const packagePlatinum = await SponsorshipPackage.create({
      event: event1._id,
      name: 'Platinum Title Sponsor',
      description: 'Exclusive title recognition across all badges, lanyards, and main stage backdrop.',
      price: 15000,
      tier: 'platinum',
      benefits: ['Exclusive Lanyard Co-Branding', 'Dedicated Keynote 10-minute slot', '8 VIP Passes', 'Private Executive Suite'],
      slotsAvailable: 2,
      slotsUsed: 0,
      isActive: true
    });

    const sponsor = await Sponsor.create({
      event: event1._id,
      user: sponsorUser._id,
      organization: org._id,
      package: packageGold._id,
      brandName: 'TechCorp Solutions Inc.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      website: 'https://techcorp.example.com',
      description: 'Global enterprise software and cloud optimization partner.',
      contactName: 'TechCorp Brand Team',
      contactEmail: 'sponsor@eventforge.com',
      status: 'active',
      assets: [
        { title: 'Vector Brand Logo', url: 'https://techcorp.example.com/logo.svg', type: 'logo' },
        { title: 'Keynote Backdrop Banner', url: 'https://techcorp.example.com/banner.png', type: 'banner' }
      ]
    });

    await SponsorDeliverable.create({
      sponsor: sponsor._id,
      event: event1._id,
      title: 'High-Resolution Brand Assets for Screen Projection',
      description: 'Submit 4K vector format logos for display on the main keynote LED screen.',
      dueDate: new Date(now + 86400000 * 15),
      status: 'completed',
      completionDate: new Date()
    });

    await SponsorDeliverable.create({
      sponsor: sponsor._id,
      event: event1._id,
      title: 'Expo Showcase Booth Equipment Checklist',
      description: 'Finalize monitor rentals, power requirements, and booth staff badge list.',
      dueDate: new Date(now + 86400000 * 20),
      status: 'pending'
    });

    console.log('Creating staff assignment...');
    await StaffAssignment.create({
      event: event1._id,
      user: staff._id,
      role: 'staff',
      venue: venue._id,
      duties: ['Rapid QR Ticket Check-in', 'Lobby Badge Station', 'Session Access Control', 'Attendee Inquiries'],
      status: 'confirmed',
      assignedBy: organizer._id
    });

    console.log('Creating coupons...');
    await Coupon.create({
      code: 'FORGE10',
      event: event1._id,
      discountType: 'percentage',
      discountValue: 10,
      minAmount: 100,
      maxUses: 100,
      usedCount: 0,
      expiryDate: new Date(now + 86400000 * 60),
      isActive: true,
      description: '10% discount on all TechSummit registration tiers.'
    });

    await Coupon.create({
      code: 'VIP50',
      event: event1._id,
      discountType: 'fixed',
      discountValue: 50,
      minAmount: 200,
      maxUses: 50,
      usedCount: 0,
      expiryDate: new Date(now + 86400000 * 60),
      isActive: true,
      description: '$50 instant credit for executive passes.'
    });

    console.log('Creating registration and confirmed QR ticket...');
    const registration = await Registration.create({
      attendee: attendee._id,
      event: event1._id,
      ticketCategory: catGeneral._id,
      selectedSessions: [session1._id, session3._id],
      originalAmount: 349,
      discountAmount: 0,
      finalAmount: 349,
      status: 'confirmed',
      registrationDate: new Date(),
      confirmationDate: new Date()
    });

    const ticketNumber = `EF-${Date.now()}-DEMO01`;
    const qrData = `eventforge:ticket:${ticketNumber}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const ticket = await Ticket.create({
      registration: registration._id,
      attendee: attendee._id,
      event: event1._id,
      ticketCategory: catGeneral._id,
      ticketNumber,
      qrData,
      qrCode,
      status: 'active',
      isCheckedIn: false,
      issuedAt: new Date()
    });

    console.log('Creating announcements and feedback...');
    await Announcement.create({
      event: event1._id,
      title: 'Welcome to TechSummit 2026: Badges & Check-in Details',
      content: 'We are thrilled to welcome all attendees to TechSummit 2026. Rapid QR Check-in stations will be open starting 08:00 AM on opening day at the Grand Convention Center lobby.',
      type: 'general',
      targetRoles: ['all'],
      createdBy: organizer._id,
      isPublished: true,
      publishedAt: new Date()
    });

    await Announcement.create({
      event: event1._id,
      title: 'Speaker Presentation Slides Pre-Release',
      content: 'Keynote slides by Dr. Emily Watson are now available under the session agenda for preview.',
      type: 'update',
      targetRoles: ['all'],
      createdBy: organizer._id,
      isPublished: true,
      publishedAt: new Date()
    });

    await Feedback.create({
      event: event1._id,
      session: session1._id,
      attendee: attendee._id,
      rating: 5,
      comment: 'Incredible presentation on agentic AI workflows. The practical insights and live demonstrations were world-class!',
      type: 'session'
    });

    await UserInterest.create({
      user: attendee._id,
      topics: ['Artificial Intelligence', 'Cloud Scale', 'Zero Trust', 'Agentic Workflows'],
      eventTypes: ['Conference', 'Workshop'],
      industries: ['Software Engineering', 'Enterprise IT']
    });

    await AIContent.create({
      type: 'event_description',
      prompt: 'TechSummit 2026 corporate conference description',
      content: 'TechSummit 2026 brings global innovators together to explore agentic AI, resilient distributed clouds, and modern leadership strategies in a premier corporate setting.',
      createdBy: organizer._id,
      isUsed: true
    });

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS (Password: Password123 for all):');
    console.log('1. Admin:     admin@eventforge.com');
    console.log('2. Organizer: organizer@eventforge.com');
    console.log('3. Staff:     staff@eventforge.com');
    console.log('4. Speaker:   speaker@eventforge.com');
    console.log('5. Attendee:  attendee@eventforge.com');
    console.log('6. Sponsor:   sponsor@eventforge.com');
    console.log('------------------------------------------------------');
    console.log(`Event ID:            ${event1._id}`);
    console.log(`Ticket Number:       ${ticket.ticketNumber}`);
    console.log(`QR Data string:      ${ticket.qrData}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
