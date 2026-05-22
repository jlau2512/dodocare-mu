-- ═══════════════════════════════════════════════════════════════
-- DodoCare MU — Patient Tables (run AFTER schema.sql)
-- ═══════════════════════════════════════════════════════════════

-- 1. PATIENT PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  insurance_provider TEXT,
  insurance_id TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  area TEXT,
  avatar_url TEXT,
  -- what services patient signed up for
  services_needed TEXT[] DEFAULT '{}', -- 'lab_tests','hospital_visits','home_treatment','medications'
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. APPOINTMENTS (hospital doctor appointments)
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, completed, cancelled, no_show
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. LAB BOOKINGS
CREATE TABLE IF NOT EXISTS lab_bookings (
  id SERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  lab_id INTEGER REFERENCES laboratories(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  home_visit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'confirmed', -- confirmed, sample_collected, processing, results_ready, completed
  payment_method TEXT,
  total_amount INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. LAB BOOKING TESTS (junction table)
CREATE TABLE IF NOT EXISTS lab_booking_tests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES lab_bookings(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES lab_tests(id) ON DELETE SET NULL
);

-- 5. HOME VISITS (doctor-at-home / treatment at domicile)
CREATE TABLE IF NOT EXISTS home_visits (
  id SERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'normal', -- normal, urgent, emergency
  address TEXT NOT NULL,
  area TEXT,
  status TEXT DEFAULT 'requested', -- requested, accepted, en_route, in_progress, completed, cancelled
  payment_method TEXT,
  fee TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PATIENT RECORDS (links to actual medical records)
CREATE TABLE IF NOT EXISTS patient_records (
  id SERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- consultation, lab_result, prescription, imaging
  provider_type TEXT NOT NULL, -- hospital, lab
  provider_name TEXT NOT NULL,
  provider_by TEXT, -- doctor name or lab name
  record_date DATE NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'completed', -- completed, normal, attention, pending
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PATIENT MEDICATIONS (personal medication tracking)
CREATE TABLE IF NOT EXISTS patient_medications (
  id SERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  medication_id INTEGER REFERENCES medications(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  schedule TEXT,
  time TEXT,
  gradient TEXT DEFAULT 'from-blue-400 to-blue-500',
  is_active BOOLEAN DEFAULT true,
  refill_by DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_patient_profiles_email ON patient_profiles(email);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_patient ON lab_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_patient ON home_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_doctor ON home_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_patient ON patient_records(patient_id);

-- RLS
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_booking_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;

-- Patient profiles: own only
CREATE POLICY "Patients read own profile" ON patient_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Patients update own profile" ON patient_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Patients insert own profile" ON patient_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Appointments: own only
CREATE POLICY "Patients manage own appointments" ON appointments FOR ALL USING (patient_id = auth.uid());

-- Lab bookings: own only
CREATE POLICY "Patients manage own lab bookings" ON lab_bookings FOR ALL USING (patient_id = auth.uid());
CREATE POLICY "Patients manage own lab booking tests" ON lab_booking_tests FOR ALL
  USING (booking_id IN (SELECT id FROM lab_bookings WHERE patient_id = auth.uid()));

-- Home visits: own only
CREATE POLICY "Patients manage own home visits" ON home_visits FOR ALL USING (patient_id = auth.uid());

-- Records: own only
CREATE POLICY "Patients read own records" ON patient_records FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Patients insert own records" ON patient_records FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Medications: own only
CREATE POLICY "Patients manage own medications" ON patient_medications FOR ALL USING (patient_id = auth.uid());

-- Auto-update timestamps
CREATE TRIGGER patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lab_bookings_updated_at BEFORE UPDATE ON lab_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER home_visits_updated_at BEFORE UPDATE ON home_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new patient signup (auto-create patient profile from auth metadata)
CREATE OR REPLACE FUNCTION handle_new_patient()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Only create patient profile if role is 'patient' or not specified (default)
  IF (NEW.raw_user_meta_data->>'role') IS NULL OR (NEW.raw_user_meta_data->>'role') = 'patient' THEN
    INSERT INTO patient_profiles (id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
      COALESCE(NEW.email, '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't already conflict with provider trigger
-- The existing handle_new_user trigger handles providers
-- We add a separate trigger for patients
CREATE OR REPLACE TRIGGER on_auth_user_created_patient
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_patient();
