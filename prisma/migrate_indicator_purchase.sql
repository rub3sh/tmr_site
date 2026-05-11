-- Migration: indicator purchase flow + tier pricing
-- Run with: psql $DATABASE_URL -f prisma/migrate_indicator_purchase.sql

-- Enums
CREATE TYPE "IndicatorAccessPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE "IndicatorTier" AS ENUM ('CORE', 'SMT', 'SUITE');

-- New columns on indicators
ALTER TABLE "indicators"
  ADD COLUMN IF NOT EXISTS "trading_view_script_id" TEXT,
  ADD COLUMN IF NOT EXISTS "tier" "IndicatorTier" NOT NULL DEFAULT 'SUITE';

-- Tier pricing table
CREATE TABLE IF NOT EXISTS "indicator_tier_pricing" (
  "id"          TEXT NOT NULL,
  "tier"        "IndicatorTier" NOT NULL,
  "label"       TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "monthly"     INTEGER NOT NULL DEFAULT 0,
  "quarterly"   INTEGER NOT NULL DEFAULT 0,
  "annual"      INTEGER NOT NULL DEFAULT 0,
  "features"    TEXT[] NOT NULL DEFAULT '{}',
  "is_active"   BOOLEAN NOT NULL DEFAULT true,
  "updated_at"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "indicator_tier_pricing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicator_tier_pricing_tier_key" UNIQUE ("tier")
);

-- Indicator purchases table
CREATE TABLE IF NOT EXISTS "indicator_purchases" (
  "id"                    TEXT NOT NULL,
  "user_id"               TEXT NOT NULL,
  "tier"                  "IndicatorTier" NOT NULL DEFAULT 'SUITE',
  "trading_view_username" TEXT NOT NULL,
  "access_period"         "IndicatorAccessPeriod" NOT NULL,
  "razorpay_order_id"     TEXT NOT NULL,
  "razorpay_payment_id"   TEXT,
  "razorpay_signature"    TEXT,
  "amount_in_paise"       INTEGER NOT NULL,
  "currency"              TEXT NOT NULL DEFAULT 'INR',
  "status"                "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
  "tv_access_granted"     BOOLEAN NOT NULL DEFAULT false,
  "access_expires_at"     TIMESTAMP(3),
  "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"            TIMESTAMP(3) NOT NULL,

  CONSTRAINT "indicator_purchases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "indicator_purchases_razorpay_order_id_key" UNIQUE ("razorpay_order_id"),
  CONSTRAINT "indicator_purchases_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
