# Mellow's Hive - Developer Guide

Complete technical documentation for the Mellow's Hive trading education platform.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Architecture](#2-project-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [Admin Panel](#7-admin-panel)
8. [Student Area](#8-student-area)
9. [API Routes Reference](#9-api-routes-reference)
10. [Course Management](#10-course-management)
11. [Payment Flow](#11-payment-flow)
12. [Video System](#12-video-system)
13. [Design System](#13-design-system)
14. [Common Tasks](#14-common-tasks-for-developers)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

### One-Command Setup

```bash
cd mellows-hive

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file and fill in real values
cp .env.example .env

# --- Database Setup (PostgreSQL) ---
# Create the database role and database (first time only):
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mellow_hive'
  ) THEN
    CREATE ROLE mellow_hive LOGIN PASSWORD 'mellow_joel';
  END IF;
END
$$;
SQL
sudo -u postgres psql -c "CREATE DATABASE mellows_hive OWNER mellow_hive;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mellows_hive TO mellow_hive;"

# Start development server (auto-runs DB setup)
npm run dev
```

`npm run dev` automatically:
1. Starts PostgreSQL
2. Generates Prisma client
3. Pushes schema to database
4. Seeds sample data (admin + students + courses + plans)
5. Starts Next.js dev server on `localhost:3000`

### Default Credentials

| Role    | Login URL                  | Email                   | Password       |
|---------|---------------------------|-------------------------|----------------|
| Admin   | `/login?admin=true`       | `admin@mellowshive.com` | `admin123456`  |
| Student | `/login` (Discord OAuth)  | Uses Discord account    | N/A            |

> **IMPORTANT:** Change admin credentials immediately in production. The password is hashed with bcrypt (12 salt rounds) in `prisma/seed.ts`.

### Sample Students (from seed)

| Student ID | Name          | Status   |
|------------|---------------|----------|
| MH-0001    | Arjun Patel   | VERIFIED |
| MH-0002    | Priya Sharma  | VERIFIED |
| MH-0003    | Rahul Mehta   | PENDING  |
| MH-0004    | Sneha Reddy   | PENDING  |

### Sample Plans (from seed)

| Plan    | Monthly | Yearly   | Courses Included                         |
|---------|---------|----------|------------------------------------------|
| Starter | ₹999    | ₹9,999   | Time Cycle Mastery                       |
| Pro     | ₹2,999  | ₹29,999  | Time Cycle Mastery, Orderflow Mastery    |
| Elite   | ₹4,999  | ₹49,999  | All courses                              |

### npm Scripts

| Script          | Purpose                                              |
|-----------------|------------------------------------------------------|
| `npm run dev`   | Start dev server (auto DB setup + localhost:3000)    |
| `npm run build` | Production build                                     |
| `npm run start` | Start production server                              |
| `db:generate`   | Regenerate Prisma client                             |
| `db:push`       | Push schema to DB (no migration files)               |
| `db:migrate`    | Create migration + apply                             |
| `db:seed`       | Run seed script                                      |
| `db:studio`     | Open Prisma Studio GUI                               |

---

## 2. Project Architecture

```
Tech Stack:
  Frontend  → Next.js 14 (App Router) + React 18 + TailwindCSS 3
  3D        → Three.js + React Three Fiber + Drei
  Animation → Framer Motion
  Charts    → Recharts
  Backend   → Next.js API Routes (same project)
  Database  → PostgreSQL + Prisma 5 ORM
  Auth      → NextAuth.js v4 (JWT strategy)
              - Discord OAuth (students)
              - Credentials (admin only)
  Payments  → Razorpay
  Video     → VdoCipher (DRM-protected streaming)
  Email     → Resend
  Chat      → Discord (external — secure invite links)
  Validation→ Zod v4
```

### Rendering Strategy

| Route Pattern              | Rendering    | Why                              |
|---------------------------|--------------|----------------------------------|
| `/` (landing)             | Dynamic SSR  | Queries DB for courses           |
| `/login`                  | Static       | No server data needed            |
| `/courses/[id]`          | Dynamic SSR  | Course data from DB              |
| `/student/*`             | Dynamic SSR  | User-specific data               |
| `/student/courses/[id]`  | Client       | Video player + real-time progress|
| `/admin/*`               | Dynamic SSR  | Admin data from DB               |
| `/dashboard`             | Redirect     | Redirects to `/student/library`  |
| `/api/*`                 | Dynamic      | All API routes                   |

---

## 3. Directory Structure

```
mellows-hive/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   └── seed.ts                # Seed script (admin + students + courses + plans)
│
├── scripts/
│   └── setup-db.sh            # Auto DB setup (runs on npm run dev)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, providers, metadata)
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── globals.css        # Global styles + Tailwind directives
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/page.tsx # Discord OAuth + Admin credentials login
│   │   │
│   │   ├── student/           # Student area (requires auth)
│   │   │   ├── layout.tsx     # Student shell (navbar + content)
│   │   │   ├── library/       # Course library (main student page)
│   │   │   ├── courses/[courseId]/ # Video player with module sidebar
│   │   │   ├── calendar/      # Events calendar
│   │   │   ├── leaderboards/  # Rankings with weekly/monthly/all-time
│   │   │   ├── indicators/    # TradingView Pine Script indicators
│   │   │   ├── tutor/         # AI Tutor (coming soon) + FAQ
│   │   │   ├── giveaways/     # Active giveaways
│   │   │   └── profile/       # User profile + subscription info
│   │   │
│   │   ├── admin/             # Admin panel (requires ADMIN role)
│   │   │   ├── layout.tsx     # Admin shell (sidebar + content)
│   │   │   ├── page.tsx       # Dashboard (stats overview)
│   │   │   ├── courses/       # Course management
│   │   │   │   ├── page.tsx   # Course list
│   │   │   │   ├── new/       # Create course (details + plan access)
│   │   │   │   └── [courseId]/edit/ # Manage modules + videos + details
│   │   │   ├── plans/         # Subscription plan management
│   │   │   ├── students/      # Student management + verification
│   │   │   ├── leaderboard/   # Leaderboard entries
│   │   │   ├── calendar/      # Event management
│   │   │   ├── indicators/    # Indicator management
│   │   │   ├── giveaways/     # Giveaway management
│   │   │   ├── coupons/       # Coupon/discount codes
│   │   │   ├── analytics/     # Revenue + engagement analytics
│   │   │   └── settings/      # Discord bot + platform config
│   │   │
│   │   ├── dashboard/         # Legacy redirects to /student/*
│   │   │
│   │   └── api/               # API routes (see Section 9)
│   │       ├── auth/[...nextauth]/
│   │       ├── admin/courses/  # Admin CRUD for courses/modules/videos
│   │       ├── admin/plans/
│   │       ├── admin/students/
│   │       ├── admin/leaderboard/
│   │       ├── admin/calendar/
│   │       ├── admin/indicators/
│   │       ├── admin/giveaways/
│   │       ├── admin/coupons/
│   │       ├── courses/
│   │       ├── payments/
│   │       ├── progress/
│   │       ├── video/otp/
│   │       ├── calendar/
│   │       ├── leaderboard/
│   │       ├── indicators/
│   │       ├── giveaways/
│   │       └── student/profile/
│   │
│   ├── components/
│   │   ├── ui/                # Design system primitives
│   │   ├── layout/            # Navbar, Footer, AdminSidebar
│   │   ├── landing/           # Hero, Service Cards, Newsletter
│   │   └── admin/             # Student actions, Analytics cards, User table
│   │
│   ├── lib/                   # Server-side utilities
│   │   ├── auth.ts            # NextAuth config (Discord + Credentials)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── password.ts        # Password hashing (bcrypt)
│   │   ├── razorpay.ts        # Razorpay client
│   │   ├── vdocipher.ts       # VdoCipher OTP generation
│   │   ├── resend.ts          # Email templates
│   │   └── constants.ts       # App constants, nav items, plan tiers
│   │
│   ├── hooks/                 # Client-side React hooks
│   ├── types/                 # TypeScript type definitions
│   ├── validators/            # Zod schemas
│   └── middleware.ts          # Route protection (auth + role check)
│
├── .env.example               # Environment template
├── tailwind.config.ts         # Tailwind theme
└── package.json               # Dependencies + scripts
```

---

## 4. Environment Variables

All variables are in `.env`. Copy from `.env.example`.

| Variable                      | Required | Description                                    | Where to Get                          |
|-------------------------------|----------|------------------------------------------------|---------------------------------------|
| `DATABASE_URL`                | Yes      | PostgreSQL connection string                   | Your DB host                          |
| `NEXTAUTH_SECRET`             | Yes      | 32+ char random string for JWT signing         | `openssl rand -base64 32`             |
| `NEXTAUTH_URL`                | Yes      | Full app URL                                   | `http://localhost:3000` (dev)         |
| `DISCORD_CLIENT_ID`           | Yes      | Discord OAuth application ID                   | Discord Developer Portal              |
| `DISCORD_CLIENT_SECRET`       | Yes      | Discord OAuth application secret               | Discord Developer Portal              |
| `DISCORD_BOT_TOKEN`           | No       | Discord bot token (for role assignment)        | Discord Developer Portal              |
| `DISCORD_GUILD_ID`            | No       | Discord server ID                              | Discord server settings               |
| `RAZORPAY_KEY_ID`             | Yes      | Razorpay API key ID                            | Razorpay Dashboard > Settings > API   |
| `RAZORPAY_KEY_SECRET`         | Yes      | Razorpay API key secret                        | Same as above                         |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes      | Same as RAZORPAY_KEY_ID (client-exposed)       | Same as above                         |
| `VDOCIPHER_API_SECRET`        | Yes      | VdoCipher API secret for video OTP             | VdoCipher Dashboard > Config > API    |
| `RESEND_API_KEY`              | Yes      | Resend email API key                           | resend.com > API Keys                 |
| `RESEND_FROM_EMAIL`           | Yes      | Sender email (verified domain)                 | resend.com > Domains                  |
| `NEXT_PUBLIC_APP_URL`         | Yes      | Full app URL (used in emails)                  | Your deployed URL                     |

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → Add redirect: `http://localhost:3000/api/auth/callback/discord`
4. Copy Client ID and Client Secret to `.env`
5. Enable `identify`, `email`, `guilds` scopes

---

## 5. Database Schema

File: `prisma/schema.prisma`

### Entity Relationship (3-Level Course Hierarchy)

```
User ──┬── Subscription ── Plan ──(many-to-many)── Course
       ├── Purchase ──── Course
       └── VideoProgress ── Video

Course ── Lesson (Module) ── Video
                           └── Attachment
```

### Key Models

#### User (`users` table)
| Field              | Type     | Notes                                        |
|--------------------|----------|----------------------------------------------|
| id                 | cuid     | Primary key                                  |
| email              | String   | Unique, used for login                       |
| name               | String?  | Display name                                 |
| discordId          | String?  | Unique Discord user ID                       |
| discordUsername     | String?  | Discord username                             |
| discordAvatar      | String?  | Discord avatar hash                          |
| role               | Enum     | `STUDENT` (default) or `ADMIN`               |
| studentId          | String?  | Unique MH-XXXX format (auto-generated)       |
| verificationStatus | Enum     | `PENDING`, `VERIFIED`, `REJECTED`            |

#### Course → Lesson → Video (3-Level Hierarchy)
| Model    | Key Fields                              | Notes                                    |
|----------|-----------------------------------------|------------------------------------------|
| Course   | title, slug, priceInPaise, status       | Top level. Has plans, lessons, purchases |
| Lesson   | title, description, sortOrder           | Module within a course. Has videos, attachments |
| Video    | title, videoUrl, vdoCipherId, durationSec | Individual video. Has progress tracking  |

#### Plan & Subscription
| Model        | Key Fields                          | Notes                                    |
|--------------|-------------------------------------|------------------------------------------|
| Plan         | name, priceMonthly, priceYearly     | Subscription tier (Starter/Pro/Elite)    |
| PlanCourse   | planId, courseId                     | Many-to-many join table                  |
| Subscription | userId, planId, status, billingCycle | Active user subscription                 |

#### Other Models
- **Attachment** — PDFs, links, tools, notes per lesson
- **VideoProgress** — Per-user per-video watch tracking
- **LeaderboardEntry** — Profit/consistency/completion scores
- **CalendarEvent** — Platform events (live sessions, webinars)
- **Giveaway** — Competitions with entry tracking
- **Indicator** — TradingView Pine Script indicators
- **Coupon** — Discount codes
- **DiscordLink** — Discord integration settings

---

## 6. Authentication System

### Auth Providers

| Provider     | ID              | Users   | How It Works                              |
|-------------|-----------------|---------|-------------------------------------------|
| Discord     | `discord`       | Students| OAuth flow → creates/updates user          |
| Credentials | `admin-login`   | Admins  | Email + password → bcrypt verify           |

### Login Flow

**Students:**
1. User clicks "Login with Discord" on `/login`
2. Redirected to Discord OAuth → grants `identify email guilds`
3. `signIn` callback creates/updates user with Discord data
4. Auto-generates `MH-XXXX` student ID if new
5. Redirects to `/student/library`

**Admins:**
1. Navigate to `/login?admin=true` (shows admin form)
2. Enter email + password
3. Credentials provider verifies with bcrypt
4. Redirects to `/admin`

### Session Shape

```typescript
session.user = {
  id: string;
  email: string;
  name?: string;
  role: 'STUDENT' | 'ADMIN';
  studentId?: string;           // MH-XXXX
  verificationStatus?: string;  // PENDING | VERIFIED | REJECTED
  image?: string;               // Discord avatar URL
}
```

### Route Protection (middleware.ts)

| Route Pattern    | Protection                        |
|-----------------|-----------------------------------|
| `/student/*`    | Must be logged in (any role)      |
| `/admin/*`      | Must be logged in + role = ADMIN  |
| `/dashboard/*`  | Must be logged in (redirects)     |
| Everything else | Public                            |

---

## 7. Admin Panel

Access: `/login?admin=true` → `/admin`

### Navigation

| Page          | URL                     | Purpose                                       |
|---------------|-------------------------|-----------------------------------------------|
| Dashboard     | `/admin`                | Stats overview (users, revenue, watch time)   |
| Courses       | `/admin/courses`        | Course list with plan badges, stats           |
| Create Course | `/admin/courses/new`    | New course (details, pricing, plan access)    |
| Edit Course   | `/admin/courses/[id]/edit` | Manage modules + videos + course details   |
| Plans         | `/admin/plans`          | Create/manage subscription plans              |
| Students      | `/admin/students`       | Student list, verification, progress          |
| Leaderboard   | `/admin/leaderboard`    | Add/manage leaderboard entries                |
| Calendar      | `/admin/calendar`       | Create/manage events                          |
| Indicators    | `/admin/indicators`     | Manage Pine Script indicators                 |
| Giveaways     | `/admin/giveaways`      | Create/manage giveaways                       |
| Coupons       | `/admin/coupons`        | Discount codes management                     |
| Analytics     | `/admin/analytics`      | Revenue, MRR, top courses                     |
| Settings      | `/admin/settings`       | Discord bot config, platform info             |

### Course Creation Flow

1. **Create course** at `/admin/courses/new`
   - Set name, description, pricing, difficulty, category
   - Select which plans can access this course
   - Set status (DRAFT/PUBLISHED)
   - Click "Create & Add Modules" → redirects to edit page

2. **Add modules** at `/admin/courses/[id]/edit` (Modules tab)
   - Add module title and description
   - Modules are ordered by creation sequence

3. **Add videos** to each module
   - Expand a module → click "Add Video"
   - Set video title, URL, VdoCipher ID, duration
   - Mark as Free or Preview

4. **Edit course details** (Details tab)
   - Update all course info including plan access
   - Save changes

---

## 8. Student Area

Access: `/login` (Discord OAuth) → `/student/library`

| Page          | URL                       | Purpose                                     |
|---------------|---------------------------|---------------------------------------------|
| Library       | `/student/library`        | Course grid with progress, lock states      |
| Course Player | `/student/courses/[id]`   | Video player + module sidebar               |
| Calendar      | `/student/calendar`       | Monthly calendar with events                |
| Leaderboards  | `/student/leaderboards`   | Weekly/monthly/all-time rankings            |
| Indicators    | `/student/indicators`     | TradingView indicators (plan-gated)         |
| Tutor         | `/student/tutor`          | AI Tutor (coming soon) + FAQ               |
| Giveaways     | `/student/giveaways`      | Active giveaways with entry                 |
| Profile       | `/student/profile`        | Avatar, student ID, subscription, Discord   |

---

## 9. API Routes Reference

All routes return JSON. Error format: `{ error: string }`.

### Admin Course Management

| Method   | Route                                              | Purpose                           |
|----------|---------------------------------------------------|------------------------------------|
| `POST`   | `/api/admin/courses`                               | Create course (with plan access)   |
| `GET`    | `/api/admin/courses/[courseId]`                    | Get course with modules/videos     |
| `PATCH`  | `/api/admin/courses/[courseId]`                    | Update course details + plans      |
| `DELETE` | `/api/admin/courses/[courseId]`                    | Delete course                      |
| `GET`    | `/api/admin/courses/[courseId]/modules`            | List modules                       |
| `POST`   | `/api/admin/courses/[courseId]/modules`            | Add module                         |
| `PATCH`  | `/api/admin/courses/[courseId]/modules/[moduleId]` | Update module                      |
| `DELETE` | `/api/admin/courses/[courseId]/modules/[moduleId]` | Delete module + its videos         |
| `POST`   | `/api/admin/courses/[courseId]/videos`             | Add video to a module              |
| `PATCH`  | `/api/admin/courses/[courseId]/videos/[videoId]`   | Update video                       |
| `DELETE` | `/api/admin/courses/[courseId]/videos/[videoId]`   | Delete video                       |

### Admin Other

| Method   | Route                                           | Purpose                        |
|----------|------------------------------------------------|--------------------------------|
| `GET/POST` | `/api/admin/plans`                           | List / create plans            |
| `PATCH`  | `/api/admin/plans/[planId]`                    | Update plan                    |
| `PATCH`  | `/api/admin/students/[studentId]/verify`       | Set verification status        |
| `GET/POST` | `/api/admin/leaderboard`                     | List / upsert entries          |
| `GET/POST` | `/api/admin/calendar`                        | List / create events           |
| `DELETE` | `/api/admin/calendar/[eventId]`                | Delete event                   |
| `GET/POST` | `/api/admin/indicators`                      | List / create indicators       |
| `GET/POST` | `/api/admin/giveaways`                       | List / create giveaways        |
| `GET/POST` | `/api/admin/coupons`                         | List / create coupons          |
| `PATCH`  | `/api/admin/coupons/[couponId]`                | Toggle coupon active           |

### Public / Student

| Method   | Route                                | Auth    | Purpose                        |
|----------|--------------------------------------|---------|--------------------------------|
| `GET`    | `/api/courses/[courseId]`           | No      | Course details + modules/videos|
| `POST`   | `/api/payments/create-order`        | Optional| Create Razorpay order          |
| `POST`   | `/api/payments/verify`              | No      | Verify payment signature       |
| `GET`    | `/api/progress?courseId=xxx`        | Yes     | Video progress for a course    |
| `POST`   | `/api/progress`                     | Yes     | Update video watch progress    |
| `POST`   | `/api/video/otp`                    | Yes     | Generate VdoCipher OTP         |
| `GET`    | `/api/calendar`                     | Yes     | Public calendar events         |
| `GET`    | `/api/leaderboard?period=weekly`    | Yes     | Leaderboard rankings           |
| `GET`    | `/api/indicators`                   | Yes     | Indicators (plan-gated)        |
| `GET`    | `/api/giveaways`                    | Yes     | Active giveaways               |
| `POST`   | `/api/giveaways/[id]/enter`         | Yes     | Enter a giveaway               |
| `GET`    | `/api/student/profile`              | Yes     | User profile + subscription    |
| `GET`    | `/api/analytics`                    | Admin   | Platform analytics             |

---

## 10. Course Management

### Hierarchy

```
Course (e.g., "Orderflow Mastery")
  └── Module/Lesson (e.g., "Introduction to Orderflow")
        └── Video (e.g., "What is Orderflow?")
        └── Attachment (e.g., "Orderflow Cheatsheet.pdf")
```

### Access Model

Courses are accessed via **Plans** (subscription-based):
- Plans have monthly/yearly pricing
- Each Plan links to one or more Courses via `PlanCourse` join table
- Students subscribe to a Plan to access its courses
- Individual course purchase is also supported via `Purchase` model

### Admin Course API Example

**Create course:**
```json
POST /api/admin/courses
{
  "title": "Orderflow Mastery",
  "slug": "orderflow-mastery",
  "description": "Master orderflow trading...",
  "priceInPaise": 799900,
  "difficulty": "ADVANCED",
  "status": "DRAFT",
  "planIds": ["plan_id_1", "plan_id_2"]
}
```

**Add module:**
```json
POST /api/admin/courses/{courseId}/modules
{ "title": "Introduction to Orderflow", "description": "Basics..." }
```

**Add video to module:**
```json
POST /api/admin/courses/{courseId}/videos
{
  "lessonId": "module_id",
  "title": "What is Orderflow?",
  "videoUrl": "https://...",
  "vdoCipherId": "abc123",
  "durationSec": 600,
  "isFree": false
}
```

---

## 11. Payment Flow

### Razorpay Integration

```
User clicks "Buy Now"
  → POST /api/payments/create-order { courseId, email }
  → Razorpay modal opens
  → User completes payment
  → POST /api/payments/verify { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  → HMAC-SHA256 signature verification
  → Purchase status → COMPLETED
```

### Price Format

All prices stored in **paise** (smallest INR unit):
- ₹4,999 = `499900` paise
- ₹999 = `99900` paise

### Test vs Live

- **Test mode:** `rzp_test_*` keys. Test card: `4111 1111 1111 1111`
- **Live mode:** `rzp_live_*` keys. Real payments processed.

---

## 12. Video System

### VdoCipher DRM Integration

1. Admin uploads video to VdoCipher dashboard
2. Gets Video ID → enters it when creating a video in admin panel
3. Student clicks play → `POST /api/video/otp { videoId }`
4. Server verifies access (plan-based or purchase-based or free video)
5. Server calls VdoCipher API → returns OTP + playbackInfo
6. Client creates VdoCipher iframe player with OTP

### Protection Layers

| Layer           | How                                                   |
|-----------------|-------------------------------------------------------|
| DRM             | VdoCipher Widevine/FairPlay encryption                |
| Watermark       | User email burned into video stream by VdoCipher      |
| Token auth      | OTPs are single-use, tied to user                     |
| Tab blur        | Blurs video when tab is hidden                        |
| Right-click     | Disables context menu and keyboard shortcuts          |

---

## 13. Design System

### Theme: Black & White Premium

| Element    | Value                    | CSS Variable           |
|------------|--------------------------|------------------------|
| Background | `#000000`               | `--bg-primary`         |
| Card BG    | `#0a0a0a`               | `--bg-card`            |
| Accent     | `#FFFFFF`               | `--accent`             |
| Text       | `#FFFFFF`               | `--text-primary`       |
| Muted      | `#999999`               | `--text-secondary`     |
| Border     | `#1a1a1a`               | `--border-primary`     |
| Glass      | `rgba(255,255,255,0.03)` | `--glass-bg`          |
| Success    | `#22C55E`               | `--success`            |
| Warning    | `#F59E0B`               | `--warning`            |
| Error      | `#EF4444`               | `--error`              |

### Fonts

| Font           | Usage                | Class          |
|----------------|----------------------|----------------|
| Space Grotesk  | Headings, numbers    | `font-heading` |
| Inter (system) | Body text            | Default        |
| Gobold         | Brand text           | `font-gobold`  |

### CSS Utilities (globals.css)

| Class                  | Effect                              |
|------------------------|-------------------------------------|
| `.text-gradient-premium` | White-to-gray gradient text       |
| `.text-gradient-silver`  | White-to-dark gradient text       |
| `.glass`               | Glassmorphism background + blur     |
| `.glass-hover`         | Enhanced glass on hover             |
| `.card-glow`           | Subtle border glow with hover       |
| `.shimmer`             | Animated shimmer effect             |
| `.skeleton`            | Loading skeleton with shimmer       |
| `.sidebar-link`        | Admin sidebar link styling          |
| `.admin-table`         | Admin table styling                 |
| `.video-protected`     | Disable text selection              |

---

## 14. Common Tasks for Developers

### Adding a New Course (via Admin Panel)

1. Login as admin at `/login?admin=true`
2. Go to Courses → Create Course
3. Fill in details, pricing, plan access
4. Click "Create & Add Modules"
5. Add modules, then add videos to each module
6. Switch to Details tab → set status to PUBLISHED

### Changing Colors/Theme

1. Edit `tailwind.config.ts` for Tailwind classes
2. Edit `src/app/globals.css` for CSS variables
3. The white accent `#FFFFFF` is the primary brand color

### Adding a New Admin Page

1. Create `src/app/admin/your-page/page.tsx`
2. Add nav item to `ADMIN_NAV_ITEMS` in `src/lib/constants.ts`
3. Add icon mapping in `src/components/layout/admin-sidebar.tsx`

### Modifying the Database

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Run `npx prisma generate`
4. Update affected API routes and components

---

## 15. Troubleshooting

### Build Fails with Prisma Errors

```bash
npx prisma generate
npx prisma db push
```

### DB Connection Failed (P1000)

```bash
# Create database if not exists
sudo -u postgres psql -c "CREATE DATABASE mellows_hive OWNER mellow_hive;" 2>/dev/null
# Verify connection
psql "postgresql://mellow_hive:mellow_joel@localhost:5432/mellows_hive"
```

### Discord OAuth Not Working

1. Check `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` in `.env`
2. Verify redirect URL in Discord Developer Portal matches `{NEXTAUTH_URL}/api/auth/callback/discord`
3. Ensure `identify`, `email`, `guilds` scopes are enabled

### Landing Page Shows "Courses launching soon"

- Database not connected or no published courses
- Run `npm run dev` (auto-seeds) or `npx tsx prisma/seed.ts`

### Video Won't Play

- Check `VDOCIPHER_API_SECRET` in `.env`
- Verify VdoCipher Video ID exists in VdoCipher dashboard
- Check `/api/video/otp` response in network tab
- Ensure user has plan access or video is marked `isFree`

### "Unauthorized" on Admin Routes

- User must have `role: ADMIN` in database
- Check via: `npx prisma studio` → users table
- Admin login URL: `/login?admin=true`

---

## Appendix: Quick File Reference

| What You Want to Change         | File(s)                                              |
|--------------------------------|------------------------------------------------------|
| App name / branding            | `src/lib/constants.ts`, `src/app/layout.tsx`        |
| Landing page                   | `src/app/page.tsx`, `src/components/landing/`       |
| Login page                     | `src/app/(auth)/login/page.tsx`                     |
| Auth config                    | `src/lib/auth.ts`                                   |
| Route protection               | `src/middleware.ts`                                  |
| Admin sidebar nav              | `src/lib/constants.ts` + `src/components/layout/admin-sidebar.tsx` |
| Student nav                    | `src/lib/constants.ts` + `src/components/layout/navbar.tsx` |
| Course management              | `src/app/admin/courses/`, `src/app/api/admin/courses/` |
| Video player                   | `src/app/student/courses/[courseId]/page.tsx`        |
| Payment flow                   | `src/app/api/payments/`                             |
| Email templates                | `src/lib/resend.ts`                                 |
| Database schema                | `prisma/schema.prisma`                              |
| Seed data                      | `prisma/seed.ts`                                    |
| Colors / theme                 | `tailwind.config.ts`, `src/app/globals.css`         |
| Dev setup automation           | `scripts/setup-db.sh`, `package.json` (predev)      |

---

*Last updated: 2026-04-02*
