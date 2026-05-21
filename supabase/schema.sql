-- ═══════════════════════════════════════════════════════════════
-- DodoCare MU — Provider Portal Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. ENUMS
CREATE TYPE provider_role AS ENUM ('hospital_admin', 'lab_admin', 'doctor');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. PROVIDER PROFILES (extends Supabase auth.users)
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role provider_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  status approval_status DEFAULT 'approved',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. HOSPITALS
CREATE TABLE hospitals (
  id SERIAL PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Private',
  rating NUMERIC(2,1) DEFAULT 4.0,
  fee TEXT NOT NULL,
  wait TEXT DEFAULT '~30 min',
  tag TEXT DEFAULT 'General',
  accent TEXT DEFAULT 'from-blue-500 to-cyan-500',
  grade TEXT DEFAULT 'B',
  beds INTEGER DEFAULT 0,
  specialists INTEGER DEFAULT 0,
  -- detail fields
  description TEXT,
  services TEXT[] DEFAULT '{}',
  hours TEXT,
  phone TEXT,
  address TEXT,
  insurance TEXT[] DEFAULT '{}',
  parking TEXT,
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. LABORATORIES
CREATE TABLE laboratories (
  id SERIAL PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 4.0,
  turnaround TEXT DEFAULT '6-12 hrs',
  accent TEXT DEFAULT 'from-cyan-500 to-teal-500',
  grade TEXT DEFAULT 'B',
  certified TEXT DEFAULT 'ISO 9001',
  categories TEXT[] DEFAULT '{}',
  home_visit BOOLEAN DEFAULT false,
  online_results BOOLEAN DEFAULT false,
  -- detail fields
  description TEXT,
  hours TEXT,
  phone TEXT,
  address TEXT,
  home_visit_fee TEXT,
  result_delivery TEXT,
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DOCTORS
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  specialty TEXT NOT NULL,
  available TEXT[] DEFAULT '{}',
  color TEXT DEFAULT 'bg-blue-500',
  experience TEXT,
  specialty_desc TEXT,
  bio TEXT,
  qualifications TEXT,
  languages TEXT[] DEFAULT '{}',
  hospital_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LAB TESTS
CREATE TABLE lab_tests (
  id SERIAL PRIMARY KEY,
  lab_id INTEGER REFERENCES laboratories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  fasting BOOLEAN DEFAULT false,
  turnaround TEXT,
  icon_name TEXT DEFAULT 'TestTube',
  color TEXT DEFAULT 'text-blue-500 bg-blue-50',
  -- plain-language detail
  plain_description TEXT,
  why_needed TEXT,
  preparation TEXT,
  measures TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MEDICATIONS (for reference/catalog)
CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  schedule TEXT,
  time TEXT,
  gradient TEXT DEFAULT 'from-blue-400 to-blue-500',
  -- detail fields
  type TEXT,
  used_for TEXT,
  how_to_take TEXT,
  side_effects TEXT,
  refill_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DOCUMENT UPLOADS (for auto-parse feature)
CREATE TABLE document_uploads (
  id SERIAL PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  raw_text TEXT,
  parsed_data JSONB,
  entity_type TEXT, -- 'hospital', 'lab', 'doctor', 'test'
  entity_id INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'parsed', 'applied', 'error'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. INDEXES
CREATE INDEX idx_hospitals_area ON hospitals(area);
CREATE INDEX idx_hospitals_provider ON hospitals(provider_id);
CREATE INDEX idx_labs_area ON laboratories(area);
CREATE INDEX idx_labs_provider ON laboratories(provider_id);
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_provider ON doctors(provider_id);
CREATE INDEX idx_lab_tests_lab ON lab_tests(lab_id);
CREATE INDEX idx_doc_uploads_provider ON document_uploads(provider_id);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Public read for client app (everyone can see active hospitals, labs, doctors, tests)
CREATE POLICY "Public read hospitals" ON hospitals FOR SELECT USING (is_active = true);
CREATE POLICY "Public read laboratories" ON laboratories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read doctors" ON doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lab_tests" ON lab_tests FOR SELECT USING (is_active = true);
CREATE POLICY "Public read medications" ON medications FOR SELECT USING (is_active = true);

-- Providers can manage their own data
CREATE POLICY "Providers manage own hospitals" ON hospitals FOR ALL USING (provider_id = auth.uid());
CREATE POLICY "Providers manage own labs" ON laboratories FOR ALL USING (provider_id = auth.uid());
CREATE POLICY "Providers manage own doctors" ON doctors FOR ALL USING (provider_id = auth.uid());
CREATE POLICY "Providers manage own tests" ON lab_tests FOR ALL
  USING (lab_id IN (SELECT id FROM laboratories WHERE provider_id = auth.uid()));
CREATE POLICY "Providers manage own meds" ON medications FOR ALL
  USING (doctor_id IN (SELECT id FROM doctors WHERE provider_id = auth.uid()));
CREATE POLICY "Providers manage own uploads" ON document_uploads FOR ALL USING (provider_id = auth.uid());

-- Provider profiles: users can read/update their own
CREATE POLICY "Users read own profile" ON provider_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON provider_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON provider_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 11. AUTO-UPDATE timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER laboratories_updated_at BEFORE UPDATE ON laboratories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lab_tests_updated_at BEFORE UPDATE ON lab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER provider_profiles_updated_at BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 12. SEED DATA (optional — matches current hardcoded data)
-- Run this only if you want to pre-populate with the existing DodoCare data
-- Otherwise providers will add their own data through the portal
