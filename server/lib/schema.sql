-- ============================================================
-- VAULTA — Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SETTINGS TABLE (one row per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bill_prefix TEXT DEFAULT '',
  bill_start_number INTEGER DEFAULT 1,
  bill_current_number INTEGER DEFAULT 1,
  threshold_value NUMERIC(15,2) DEFAULT 50000,
  gold_interest_rate NUMERIC(4,2) DEFAULT 2.0,
  silver_interest_rate NUMERIC(4,2) DEFAULT 4.0,
  mandatory_fields JSONB DEFAULT '{}',
  print_template TEXT DEFAULT 'default',
  backup_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  initial TEXT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alt_mobile TEXT,
  email TEXT,
  relation_type TEXT,
  relation_name TEXT,
  door_no TEXT,
  address TEXT,
  area TEXT,
  pincode TEXT,
  aadhar_number TEXT,
  aadhar_front_url TEXT,
  aadhar_back_url TEXT,
  photo_url TEXT,
  rating NUMERIC(3,1) DEFAULT 1.0,
  total_bills INTEGER DEFAULT 0,
  active_bills INTEGER DEFAULT 0,
  released_bills INTEGER DEFAULT 0,
  avg_pledge_amount NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_trgm ON customers USING GIN (mobile gin_trgm_ops);

-- ============================================================
-- BILLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Bill metadata
  bill_number TEXT NOT NULL,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_time TIME NOT NULL DEFAULT CURRENT_TIME,
  jewel_type TEXT NOT NULL CHECK (jewel_type IN ('gold', 'silver')),
  
  -- Customer snapshot (in case customer is updated later)
  customer_initial TEXT,
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  customer_alt_mobile TEXT,
  customer_email TEXT,
  relation_type TEXT,
  relation_name TEXT,
  door_no TEXT,
  address TEXT,
  area TEXT,
  pincode TEXT,
  aadhar_number TEXT,
  aadhar_front_url TEXT,
  aadhar_back_url TEXT,
  customer_photo_url TEXT,
  
  -- Amount details
  principal_amount NUMERIC(15,2) NOT NULL,
  present_value NUMERIC(15,2) NOT NULL,
  current_principal NUMERIC(15,2) NOT NULL, -- updated as payments are made
  
  -- Article summary
  total_net_weight NUMERIC(10,3) DEFAULT 0,
  article_descriptions TEXT, -- comma-separated descriptions for quick view
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'renewed')),
  hso TEXT DEFAULT 'S' CHECK (hso IN ('H', 'S', 'O', '')),
  
  -- Release/Renew info
  release_renew_date DATE,
  release_renew_time TIME,
  renewed_bill_number TEXT,
  renewed_from_bill_id UUID REFERENCES bills(id),
  
  -- Search vector
  search_vector TSVECTOR,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, bill_number)
);

-- B-Tree indexes for fast filtering/sorting
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON bills(bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_principal ON bills(principal_amount);
CREATE INDEX IF NOT EXISTS idx_bills_customer_mobile ON bills(customer_mobile);

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_bills_search_vector ON bills USING GIN (search_vector);

-- Trigram indexes for LIKE/ILIKE search
CREATE INDEX IF NOT EXISTS idx_bills_bill_number_trgm ON bills USING GIN (bill_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_bills_customer_name_trgm ON bills USING GIN (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_bills_area_trgm ON bills USING GIN (area gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_bills_aadhar_trgm ON bills USING GIN (aadhar_number gin_trgm_ops);

-- ============================================================
-- ARTICLES TABLE (jewel cards per bill)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  net_weight NUMERIC(10,3),
  gross_weight NUMERIC(10,3),
  description_tags TEXT[], -- e.g. {"broken", "bend"}
  purity_tag TEXT,         -- e.g. "22k"
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_bill_id ON articles(bill_id);

-- ============================================================
-- TRANSACTIONS TABLE (interest & principal payments)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('interest', 'principal')),
  months_paid INTEGER,      -- for interest type
  amount_paid NUMERIC(15,2), -- for principal type
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_bill_id ON transactions(bill_id);

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  section TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================
-- FUNCTION: Update search vector on bills
-- ============================================================
CREATE OR REPLACE FUNCTION update_bill_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.bill_number, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.customer_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.customer_mobile, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.customer_alt_mobile, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.area, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.aadhar_number, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.article_descriptions, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bill_search_vector
  BEFORE INSERT OR UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_bill_search_vector();

-- ============================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: Recalculate H/S/O for all bills when threshold changes
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_hso(p_user_id UUID, p_threshold NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE bills
  SET hso = CASE
    WHEN current_principal < p_threshold THEN 'S'
    WHEN hso = 'S' THEN 'H'  -- was S, now above threshold, default to H
    ELSE hso                  -- H or O stays unless it was S
  END
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Update customer stats after bill changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_customer_stats(p_customer_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_active INTEGER;
  v_released INTEGER;
  v_avg NUMERIC;
  v_rating NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status IN ('released', 'renewed')),
    AVG(principal_amount)
  INTO v_total, v_active, v_released, v_avg
  FROM bills
  WHERE customer_id = p_customer_id;

  -- Rating calculation
  -- New customer (1 bill) = 1
  -- Good customer (pledges often, pays interest) = 6-10
  -- Average customer = 4-6
  -- Bad customer = 1-4
  IF v_total <= 1 THEN
    v_rating := 1.0;
  ELSIF v_released::NUMERIC / NULLIF(v_total, 0) >= 0.7 THEN
    v_rating := 7.0 + LEAST(3.0, v_total::NUMERIC / 10);
  ELSIF v_released::NUMERIC / NULLIF(v_total, 0) >= 0.4 THEN
    v_rating := 4.0 + (v_released::NUMERIC / NULLIF(v_total, 0)) * 5;
  ELSE
    v_rating := 1.0 + (v_released::NUMERIC / NULLIF(v_total, 0)) * 5;
  END IF;

  v_rating := LEAST(10.0, GREATEST(1.0, ROUND(v_rating, 1)));

  UPDATE customers SET
    total_bills = v_total,
    active_bills = v_active,
    released_bills = v_released,
    avg_pledge_amount = COALESCE(v_avg, 0),
    rating = v_rating,
    updated_at = NOW()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;
