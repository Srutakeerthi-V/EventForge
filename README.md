# EventForge – Corporate Event & Conference Management Platform

**EventForge** is a full-stack MERN capstone platform designed for enterprise summits, multi-track conferences, and corporate workshops. It features real JWT role-based authentication, conflict-free session scheduling, dynamic QR ticket generation, live staff check-in with duplicate prevention, real MongoDB aggregated analytics, and an integrated AI Content Studio.

---

## 🎨 Design System & Theme

| Token | Hex Value | Application |
|---|---|---|
| **Primary Burgundy** | `#800020` | Brand identity, primary headers, active navigation, key action buttons |
| **Cream** | `#F3E6D5` | Card surfaces, secondary containers, hero feature modules |
| **Background** | `#FFF9F2` | Main page canvas background, modal interiors |
| **Accent Coral** | `#D45060` | Eyebrow badges, callouts, status highlights |

---

## 👥 Core User Roles & Credentials

All demo accounts are pre-seeded and ready to use. Password for all accounts: **`Password123`**

| Role | Email | Key Capabilities |
|---|---|---|
| **Platform Admin** | `admin@eventforge.com` | Manage organizations, audit users & roles, manage subscription tiers, view platform-wide analytics |
| **Event Organizer** | `organizer@eventforge.com` | Create summits, configure venues & rooms, schedule conflict-free sessions, manage ticket tiers & coupons, track deliverables, broadcast announcements, run AI Studio |
| **Event Staff** | `staff@eventforge.com` | View assigned summits, live QR camera/code validator, instant attendee check-in with duplicate detection, record session attendance |
| **Speaker** | `speaker@eventforge.com` | Manage speaker credentials & bio, view assigned tracks, schedule availability, link presentation slides/decks |
| **Attendee** | `attendee@eventforge.com` | Browse conferences, select ticket tiers & sessions, apply discount coupons, download interactive digital QR badge, receive AI session recommendations, submit 1–5 star reviews |
| **Sponsor** | `sponsor@eventforge.com` | Manage brand profile and logos, track sponsorship deliverables checklist, review booth allocations |

> 💡 **Quick Role Switcher:** The top navigation bar and login page include a **1-Click Demo Role Switcher** to instantly evaluate any of the 6 roles without manual typing!

---

## 🛠️ Architecture & Tech Stack

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Stateless JWT & bcryptjs password hashing (12 rounds)
- **Validation:** Strict server-side validation & room/speaker conflict detection
- **QR Generation:** Node.js `qrcode` library generating Base64 Data URLs
- **AI Integration:** Google Gemini 1.5 Flash assistant with resilience fallbacks

### Frontend
- **Framework:** React 19 & Vite
- **Routing:** React Router v7 with protected role-based routes
- **HTTP Client:** Centralized Axios instance with request/response interceptors
- **Styling:** Custom corporate design system adhering to the palette
- **Icons:** Zero-dependency clean SVG icon library

---

## 📂 Project Structure

```
D:\EventForge
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, Sidebar, Modal, Badge, Icons
│   │   ├── context/          # AuthContext (user, login, register, logout, roles)
│   │   ├── pages/            # LandingPage, EventsPage, EventDetailPage, LoginPage, RegisterPage,
│   │   │                     # DashboardPage, AdminViews, OrganizerViews, StaffViews, SpeakerViews,
│   │   │                     # AttendeeViews, SponsorViews
│   │   ├── services/         # Centralized Axios API instance
│   │   ├── App.jsx           # Master router with ProtectedRoute
│   │   ├── App.css           # Global layout & animations
│   │   └── main.jsx          # Entry point
│   ├── .env.example
│   └── package.json
└── server/
    ├── src/
    │   ├── config/           # MongoDB connection configuration (db.js)
    │   ├── controllers/      # 14 REST API controllers
    │   ├── middleware/       # JWT Auth guard, role authorization & centralized error handler
    │   ├── models/           # 22 Mongoose schemas (User, Event, Venue, Session, Ticket, Coupon, etc.)
    │   ├── routes/           # REST API routes mounted under /api/*
    │   ├── seed.js           # Database seed script
    │   ├── verify.js         # Automated E2E test suite
    │   ├── app.js            # Express app configuration & middleware
    │   └── server.js         # Server bootstrap entry point
    ├── .env.example
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### 2. Environment Setup

**Backend (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventforge
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
AI_API_KEY=your_google_gemini_api_key_here
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database
Run the comprehensive seed script to populate realistic demo data:
```bash
cd D:\EventForge\server
node src/seed.js
```

### 4. Start the Application

**Start Backend (Port 5000):**
```bash
cd D:\EventForge\server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd D:\EventForge\client
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated End-to-End Verification

To run the automated verification suite covering all 11 core requirements:
```bash
cd D:\EventForge\server
node src/verify.js
```

**Verification Coverage:**
1. Health check endpoint
2. JWT Authentication across all 6 roles
3. Public & authenticated event listings
4. Real room and speaker conflict detection
5. Coupon code validation & percentage calculation
6. Ticket creation with dynamic QR Code generation
7. Staff ticket validation endpoint
8. Instant QR Check-in execution
9. Duplicate check-in rejection with 409 status
10. Real MongoDB aggregated analytics (Admin & Organizer)
11. AI Content Studio generation endpoints
