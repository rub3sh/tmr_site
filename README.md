# Mellow's Hive

A trading education platform built with Next.js 14, PostgreSQL, and Prisma. Features course management, subscription plans, Discord OAuth, Razorpay payments, video hosting via VdoCipher, and a live economic calendar.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 14 (App Router)                 |
| Language   | TypeScript                              |
| Database   | PostgreSQL 15 + Prisma ORM              |
| Auth       | NextAuth v4 (Discord OAuth + email)     |
| Payments   | Razorpay                                |
| Video      | VdoCipher                               |
| Email      | Resend                                  |
| UI         | Tailwind CSS + Framer Motion            |
| Realtime   | Socket.IO                               |

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

---

## Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd mellows-hive
npm install --legacy-peer-deps
```

### 2. Environment setup

```bash
cp .env.example .env
# Edit .env with your real values (see Environment Variables section)
```

### 3. Database setup (first time only)

```bash
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
```

### 4. Start dev server

```bash
npm run dev
```

This automatically: starts PostgreSQL, generates Prisma client, pushes schema, seeds sample data, and starts Next.js on `http://localhost:3000`.

---

## Default Credentials (seed data)

| Role    | Login URL             | Email                   | Password      |
|---------|-----------------------|-------------------------|---------------|
| Admin   | `/login?admin=true`   | `admin@mellowshive.com` | `admin123456` |
| Student | `/login`              | Discord OAuth           | —             |

> Change admin credentials immediately before going to production.

---

## Environment Variables

| Variable                  | Description                                  |
|---------------------------|----------------------------------------------|
| `DATABASE_URL`            | PostgreSQL connection string                 |
| `NEXTAUTH_URL`            | Full public URL of the app                   |
| `NEXTAUTH_SECRET`         | Random 32-char secret for JWT signing        |
| `DISCORD_CLIENT_ID`       | Discord OAuth app client ID                  |
| `DISCORD_CLIENT_SECRET`   | Discord OAuth app client secret              |
| `RAZORPAY_KEY_ID`         | Razorpay live/test key ID                    |
| `RAZORPAY_KEY_SECRET`     | Razorpay live/test key secret                |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key (exposed to browser) |
| `VDOCIPHER_API_SECRET`    | VdoCipher API secret for video OTP           |
| `RESEND_API_KEY`          | Resend API key for transactional email       |
| `RESEND_FROM_EMAIL`       | Sender email address                         |
| `FINNHUB_API_KEY`         | Finnhub key for economic calendar (optional) |
| `NEXT_PUBLIC_APP_URL`     | Public app URL (same as NEXTAUTH_URL)        |

---

## npm Scripts

| Script           | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start dev server (includes DB setup)     |
| `npm run build`  | Production build                         |
| `npm start`      | Start production server                  |
| `npm run db:generate` | Regenerate Prisma client            |
| `npm run db:push`| Push schema to DB (no migration history) |
| `npm run db:migrate` | Run Prisma migrations               |
| `npm run db:seed`| Seed sample data                         |
| `npm run db:studio` | Open Prisma Studio GUI               |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login / register pages
│   ├── admin/           # Admin panel (courses, students, plans, analytics)
│   ├── student/         # Student dashboard, course player
│   ├── courses/         # Public course listing
│   ├── dashboard/       # Trading hub (charts, calendar, indicators)
│   ├── api/             # All API routes
│   └── market-education/# Public market education pages
├── components/          # Shared UI components
├── lib/                 # Prisma client, auth, helpers
└── types/               # TypeScript types
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Sample data seeder
scripts/
└── setup-db.sh          # Pre-dev DB health check
```

---

## Key Features

- **Course Management** — Admin creates courses with video lessons, attachments, and quizzes
- **Subscription Plans** — Tiered plans (Starter / Pro / Elite) with monthly & yearly pricing
- **Razorpay Payments** — Webhook-verified order flow with coupon support
- **Discord OAuth** — Students sign in via Discord; admin uses email + password
- **Video DRM** — VdoCipher OTP-based video playback (prevents downloading)
- **Economic Calendar** — Live events from Finnhub with impact filters
- **Leaderboard & Giveaways** — Gamification for student engagement
- **Admin Analytics** — Revenue, enrollment, and engagement dashboards

---

## VPS Deployment

See [VPS_DEPLOY.md](./VPS_DEPLOY.md) for step-by-step instructions to deploy on a Ubuntu VPS with a public IP using Nginx + PM2.
