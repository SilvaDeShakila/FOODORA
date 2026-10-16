# FOODORA — Sri Lanka's Premier Real-Time Food Delivery Platform
> *"Cravings, Delivered in Real Time."*

FOODORA is a complete, production-grade, full-stack food delivery web application crafted specifically for the Sri Lankan market. Built with a high-performance **Black & Gold** aesthetic inspired by modern editorial luxury, it features real JWT authentication, role-based workflows, live GPS delivery visualizer, printable official tax invoices, and atomic JSON file persistence with zero external database dependencies.

---

## 🍛 Highlights & Sri Lankan Market Localization

- **100% Sri Lankan Localization**: Built for authentic local favorites including *Kottu Roti (Cheese, Dolphin, Chicken)*, *Village Rice & Curry with Pol Sambol*, *Egg Hoppers & Pol Roti*, *Colombo Dum Biriyani*, *Negombo Lagoon Crab*, and *Ceylon Bakery Short Eats*.
- **Currency & Regions**: Accurate pricing in **Sri Lankan Rupees (LKR / Rs.)** across key regional hubs: **Colombo (01–15), Dehiwala, Nugegoda, Kandy, Galle Fort, Negombo, Kurunegala, and Matara**.
- **Interactive Live Route Visualizer**: Dynamic simulated Colombo street telemetry map with rider avatar navigation, distance indicators, live ETA countdown, and driver chat drawer.
- **Official Printable Tax Receipts**: Printable tax invoices compliant with Sri Lankan business receipt standards (TIN, VAT registration, order itemization).
- **Celebration Delights**: Real-time canvas-confetti celebration and audio feedback upon successful order delivery.
- **Zero Database Requirement**: Persistent data storage in atomic JSON files with write locks and temp file renames (`server/data/*.json`).

---

## 🎨 Visual Identity — Luxury Black & Gold Design System

The application uses a consistent, high-contrast palette:
- **Main Background**: `#0B0F14`
- **Secondary Background**: `#111720`
- **Cards & Surfaces**: `#151B23`
- **Elevated Surfaces**: `#1C2530`
- **Primary Accent**: `#D4AF37` (Metallic Gold)
- **Accent Hover**: `#E8C66A`
- **Main Text**: `#F8FAFC`
- **Secondary Text**: `#94A3B8`
- **Borders & Dividers**: `#293241`

---

## 👥 Role-Based Portals & Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Password | Persona & Scope |
| :--- | :--- | :--- | :--- |
| **Customer (Colombo)** | `customer@foodora.lk` | `password123` | Nimal Perera (Kollupitiya, Colombo 03) |
| **Customer (Kandy)** | `dilani@foodora.lk` | `password123` | Dilani Jayawardena (Peradeniya Rd, Kandy) |
| **Restaurant Owner** | `owner@foodora.lk` | `password123` | Sunil Fernando (Owner of Raja Bojun Heritage) |
| **Delivery Rider** | `rider@foodora.lk` | `password123` | Roshan Gunaratne (Colombo Express Rider) |
| **Super Admin** | `admin@foodora.lk` | `password123` | Anura Senanayake (Foodora Operations HQ) |

> ⚡ **Demo Tester Bar**: A persistent top banner enables instant 1-click persona switching without re-typing passwords.

---

## 🛠️ Technology Stack & Architecture

### Architecture Overview
FOODORA operates a unified full-stack architecture where a single Node.js Express process serves both the backend REST APIs under `/api/*` and Vite React frontend middleware during development (`tsx server.ts`).

```
[ Browser / Client (React 19 + TypeScript + Tailwind CSS) ]
                         │
               HTTP / REST API requests
                         │
                         ▼
        [ Express Server (`server.ts`) ]
         ├── CORS & JSON Body Parsing
         ├── JWT Auth & Role Authorization Middleware
         ├── REST Routes (/api/auth, /api/orders, etc.)
         └── JsonStorage Service
                 │
           Atomic File I/O (Write Lock + Temp Renames)
                 │
                 ▼
       [ `server/data/*.json` Persistent Files ]
```

### Frontend
- **React 19** with **TypeScript**
- **Vite 8** (Lightning fast bundling)
- **Tailwind CSS v4** (Custom Gold `@theme` system)
- **React Router DOM v7**
- **Lucide React** (Clean editorial icons)
- **Canvas Confetti** (Order completion celebration)
- **Leaflet & SVG Interactive Street Telemetry**

### Backend & Persistence
- **Node.js** & **Express 4** with TypeScript (`tsx`)
- **JSON File-Based Persistence** (`server/services/jsonStorage.ts`)
- **bcryptjs** (10-round salted password hashing)
- **jsonwebtoken (JWT)** for signed stateless bearer tokens
- **Atomic File Operations** (Locks + temporary rename strategy preventing concurrent collisions)

---

## 📁 Directory Structure

```
FOODORA/
├── server/
│   ├── config/
│   │   └── index.ts              # Port, JWT secrets, environment variables
│   ├── data/
│   │   ├── users.json            # Customer, owner, rider, admin accounts
│   │   ├── restaurants.json      # 12+ Sri Lankan partner restaurants
│   │   ├── menu-items.json       # 40+ authentic dishes with LKR pricing
│   │   ├── orders.json           # Orders with timelines and telemetry
│   │   ├── reviews.json          # Customer reviews and ratings
│   │   ├── promotions.json       # Active promotional discount codes
│   │   └── notifications.json    # Order and platform notifications
│   ├── middleware/
│   │   └── auth.ts               # JWT verification & role authorization
│   ├── routes/
│   │   ├── auth.ts               # Register, login, demo switch, profile
│   │   ├── restaurants.ts        # Search, filter by cuisine/city/rating
│   │   ├── menuItems.ts          # Menu item queries and owner CRUD
│   │   ├── orders.ts             # Order submission, backend pricing, tracking
│   │   ├── reviews.ts            # Restaurant reviews and rating calculation
│   │   ├── users.ts              # Profile and saved delivery address book
│   │   ├── owner.ts              # Restaurant owner orders & kitchen milestones
│   │   ├── rider.ts              # Rider task acceptance & delivery updates
│   │   ├── admin.ts              # Admin KPIs, moderation, and data reset
│   │   ├── promotions.ts         # Voucher code validation
│   │   ├── notifications.ts      # Live alert messages
│   │   └── health.ts             # Service health check
│   ├── scripts/
│   │   ├── seed.ts               # CLI database re-seeder
│   │   └── seedData.ts           # Realistic Sri Lankan sample dataset generator
│   └── services/
│       └── jsonStorage.ts        # Reusable file persistence service with write locking
├── src/
│   ├── components/
│   │   ├── CartDrawer.tsx        # Slide-over cart review
│   │   ├── DemoBar.tsx           # Quick persona switcher for testers
│   │   ├── FoodCard.tsx          # Food dish card with veg/spicy badges
│   │   ├── FoodDetailsModal.tsx  # Portions, spice levels, add-ons
│   │   ├── FoodoraLogo.tsx       # Foodora brand identity
│   │   ├── Footer.tsx            # Sri Lankan island coverage footer
│   │   ├── ImageWithFallback.tsx # Preloading image component with Sri Lankan fallbacks
│   │   ├── InvoiceModal.tsx      # Printable official tax receipt
│   │   ├── LiveRouteMap.tsx      # Animated Colombo road map & rider telemetry
│   │   ├── Navbar.tsx            # Header navigation & city selector
│   │   ├── OrderStatusBadge.tsx  # Color-coded lifecycle badge
│   │   ├── OrderTimeline.tsx     # Chronological status stepper
│   │   ├── ProtectedRoute.tsx    # Role & auth route guards
│   │   └── RestaurantCard.tsx    # Cover photo, ratings, tags, and fees
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Session state, login, register, role switch
│   │   ├── CartContext.tsx       # Local storage cart with single-restaurant rule
│   │   └── ToastContext.tsx      # Global notification toast provider
│   ├── pages/
│   │   ├── AccountPage.tsx       # User profile, saved addresses, order history
│   │   ├── AdminDashboardPage.tsx# Platform analytics and moderation
│   │   ├── CartPage.tsx          # Full cart review with coupon validation
│   │   ├── CheckoutPage.tsx      # Sri Lankan delivery address & COD checkout
│   │   ├── HomePage.tsx          # Landing hero, cuisines, featured kitchens
│   │   ├── LoginPage.tsx         # Sign in with quick-fill demo buttons
│   │   ├── OrderTrackingPage.tsx # Live order tracker with simulated steps
│   │   ├── OwnerDashboardPage.tsx# Restaurant owner kitchen management
│   │   ├── PromotionsPage.tsx    # Discount codes with 1-click copy
│   │   ├── RegisterPage.tsx      # Customer registration
│   │   ├── RestaurantDetailsPage.tsx # Menu categories, search, reviews
│   │   └── RestaurantsPage.tsx   # Discovery with filters and sorting
│   ├── services/
│   │   └── api.ts                # Client API service
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces
│   ├── App.tsx                   # Main React routing configuration
│   └── main.tsx                  # Client entry point
├── tests/
│   └── api.test.ts               # Automated verification test suite
├── .env.example
├── package.json
├── server.ts                     # Full-stack Express server with Vite middleware
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20 LTS recommended)
- **npm**: v9.0.0 or later

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default values in `.env`:
```env
PORT=3000
NODE_ENV="development"
JWT_SECRET="foodora_jwt_secret_dev_sri_lanka_change_in_production"
```

### 3. Run Automated Validation Test Suite
Verify that sample seed data, bcrypt hashing, JWT issuance, promotional discount logic, and order state machines pass:
```bash
npm test
```

### 4. Start Full-Stack Application
```bash
npm run dev
```

Open your browser to:
👉 **http://localhost:3000**

---

## 🎟️ Active Promotion Codes

| Code | Discount | Minimum Order | Description |
| :--- | :--- | :--- | :--- |
| `FOODORA20` | 20% OFF (Max Rs. 800) | Rs. 1,500 | 20% discount on all partner restaurants |
| `COLOMBOFAST` | Flat Rs. 300 OFF | Rs. 1,200 | Flat discount on Colombo district orders |
| `FIRSTEAT` | 15% OFF (Max Rs. 500) | Rs. 1,000 | 15% discount on your first FOODORA order |

---

## 🔒 Security Architecture

1. **Password Encryption**: Stored exclusively as 10-round salted `bcrypt` hashes. Plaintext passwords are never persisted.
2. **Backend Price Integrity**: All subtotal calculations, discounts, delivery fees, and minimum orders are validated server-side by loading original dish records from storage. Client-submitted prices are ignored.
3. **Role Escalation Protection**: Public registration (`/api/auth/register`) enforces the `customer` role only. Admin and partner roles cannot be created via public registration.
4. **Role-Based Endpoint Protection**: Sensitive routes (owner dashboard, rider dispatch, admin moderation) require valid JWT claims and are guarded by `requireRole(...)` middleware.
5. **Concurrency & Data Integrity**: File operations in `server/services/jsonStorage.ts` use sequential in-memory mutex locks and write to `.tmp` files before atomically renaming, preventing corruption during concurrent writes.

---

## 📄 License
Licensed under Apache-2.0. Built for Google AI Studio.
