-- ============================================================
-- AgriFlow Database Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. USERS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('farmer', 'buyer', 'admin')) NOT NULL,
  state VARCHAR(100),
  district VARCHAR(100),
  avatar_url VARCHAR(512),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. HISTORICAL YIELD TABLE (Populated from Kaggle Dataset 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crop_yields_historical (
  id SERIAL PRIMARY KEY,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  crop_year INT NOT NULL,
  season VARCHAR(50) NOT NULL,  -- Kharif, Rabi, Summer, Whole Year, etc.
  crop VARCHAR(100) NOT NULL,
  area_hectares NUMERIC(15, 2) NOT NULL,
  production_quintals NUMERIC(15, 2),
  yield_quintals_per_hectare NUMERIC(15, 4)
);

CREATE INDEX IF NOT EXISTS idx_yield_state_crop ON crop_yields_historical (state, crop);
CREATE INDEX IF NOT EXISTS idx_yield_season_year ON crop_yields_historical (season, crop_year);

-- ─────────────────────────────────────────────────────────────
-- 3. DISEASE CATALOGUE (Seeded treatments for Kaggle Dataset 2 classes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disease_catalogue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name VARCHAR(100) NOT NULL,      -- Corn, Wheat, Tomato, Rice, Potato
  disease_name VARCHAR(255) NOT NULL,   -- Matches classifier label e.g. Tomato_Early_Blight
  scientific_name VARCHAR(255),
  symptoms TEXT NOT NULL,
  organic_treatment TEXT NOT NULL,
  chemical_treatment TEXT NOT NULL,
  prevention_measures TEXT NOT NULL,
  severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. DISEASE DIAGNOSES (Log of all farmer uploads + AI results)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disease_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(512) NOT NULL,
  crop_detected VARCHAR(100) NOT NULL,
  disease_detected VARCHAR(255) NOT NULL,
  confidence_score NUMERIC(5, 4) NOT NULL,
  catalog_disease_id UUID REFERENCES disease_catalogue(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_farmer ON disease_diagnoses (farmer_id);

-- ─────────────────────────────────────────────────────────────
-- 5. LISTINGS (Marketplace crop listings)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_name VARCHAR(255) NOT NULL,
  quantity_quintals NUMERIC(10, 2) NOT NULL,
  price_per_quintal NUMERIC(10, 2) NOT NULL,
  location_state VARCHAR(100) NOT NULL,
  location_district VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(512),
  status VARCHAR(50) CHECK (status IN ('active', 'sold', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_status ON listings (status);
CREATE INDEX IF NOT EXISTS idx_listing_state ON listings (location_state);

-- ─────────────────────────────────────────────────────────────
-- 6. ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  quantity_ordered NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  razorpay_order_id VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON orders (listing_id);

-- ─────────────────────────────────────────────────────────────
-- 7. PAYMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
  transaction_id VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Trigger: auto-update updated_at columns
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
