import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ═══════════════════════════════════════════════════════════════
   DATABASE TYPES (mirrors schema.sql)
═══════════════════════════════════════════════════════════════ */
export type ProviderRole = 'hospital_admin' | 'lab_admin' | 'doctor'

export interface ProviderProfile {
  id: string
  role: ProviderRole
  full_name: string
  email: string
  phone?: string
  organization?: string
  status: 'pending' | 'approved' | 'rejected'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Hospital {
  id: number
  provider_id?: string
  name: string
  area: string
  type: string
  rating: number
  fee: string
  wait: string
  tag: string
  accent: string
  grade: string
  beds: number
  specialists: number
  description?: string
  services: string[]
  hours?: string
  phone?: string
  address?: string
  insurance: string[]
  parking?: string
  logo_url?: string
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Laboratory {
  id: number
  provider_id?: string
  name: string
  area: string
  rating: number
  turnaround: string
  accent: string
  grade: string
  certified: string
  categories: string[]
  home_visit: boolean
  online_results: boolean
  description?: string
  hours?: string
  phone?: string
  address?: string
  home_visit_fee?: string
  result_delivery?: string
  logo_url?: string
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  provider_id?: string
  hospital_id?: number
  name: string
  initials: string
  specialty: string
  available: string[]
  color: string
  experience?: string
  specialty_desc?: string
  bio?: string
  qualifications?: string
  languages: string[]
  hospital_name?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LabTest {
  id: number
  lab_id?: number
  name: string
  category: string
  price: string
  fasting: boolean
  turnaround?: string
  icon_name: string
  color: string
  plain_description?: string
  why_needed?: string
  preparation?: string
  measures: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Medication {
  id: number
  doctor_id?: number
  name: string
  dosage?: string
  schedule?: string
  time?: string
  gradient: string
  type?: string
  used_for?: string
  how_to_take?: string
  side_effects?: string
  refill_by?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/* ═══════════════════════════════════════════════════════════════
   AUTH HELPERS
═══════════════════════════════════════════════════════════════ */
export async function signUp(email: string, password: string, role: ProviderRole, fullName: string, organization?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName, organization },
      emailRedirectTo: `${window.location.origin}/admin`
    }
  })
  if (error) throw error
  // Profile is auto-created by database trigger (handle_new_user)
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(): Promise<ProviderProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('provider_profiles').select('*').eq('id', user.id).single()
  return data
}

/* ═══════════════════════════════════════════════════════════════
   CRUD HELPERS
═══════════════════════════════════════════════════════════════ */
// Hospitals
export const fetchHospitals = async () => {
  const { data, error } = await supabase.from('hospitals').select('*').eq('is_active', true).order('rating', { ascending: false })
  if (error) throw error
  return data as Hospital[]
}

export const fetchMyHospitals = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('hospitals').select('*').eq('provider_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data as Hospital[]
}

export const upsertHospital = async (hospital: Partial<Hospital>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const payload = { ...hospital, provider_id: user.id }
  const { data, error } = hospital.id
    ? await supabase.from('hospitals').update(payload).eq('id', hospital.id).select().single()
    : await supabase.from('hospitals').insert(payload).select().single()
  if (error) throw error
  return data as Hospital
}

// Laboratories
export const fetchLaboratories = async () => {
  const { data, error } = await supabase.from('laboratories').select('*').eq('is_active', true).order('rating', { ascending: false })
  if (error) throw error
  return data as Laboratory[]
}

export const fetchMyLaboratories = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('laboratories').select('*').eq('provider_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data as Laboratory[]
}

export const upsertLaboratory = async (lab: Partial<Laboratory>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const payload = { ...lab, provider_id: user.id }
  const { data, error } = lab.id
    ? await supabase.from('laboratories').update(payload).eq('id', lab.id).select().single()
    : await supabase.from('laboratories').insert(payload).select().single()
  if (error) throw error
  return data as Laboratory
}

// Doctors
export const fetchDoctors = async () => {
  const { data, error } = await supabase.from('doctors').select('*').eq('is_active', true).order('name')
  if (error) throw error
  return data as Doctor[]
}

export const fetchMyDoctors = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('doctors').select('*').eq('provider_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data as Doctor[]
}

export const upsertDoctor = async (doctor: Partial<Doctor>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const payload = { ...doctor, provider_id: user.id }
  const { data, error } = doctor.id
    ? await supabase.from('doctors').update(payload).eq('id', doctor.id).select().single()
    : await supabase.from('doctors').insert(payload).select().single()
  if (error) throw error
  return data as Doctor
}

// Lab Tests
export const fetchLabTests = async () => {
  const { data, error } = await supabase.from('lab_tests').select('*').eq('is_active', true).order('name')
  if (error) throw error
  return data as LabTest[]
}

export const upsertLabTest = async (test: Partial<LabTest>) => {
  const { data, error } = test.id
    ? await supabase.from('lab_tests').update(test).eq('id', test.id).select().single()
    : await supabase.from('lab_tests').insert(test).select().single()
  if (error) throw error
  return data as LabTest
}

// Medications
export const upsertMedication = async (med: Partial<Medication>) => {
  const { data, error } = med.id
    ? await supabase.from('medications').update(med).eq('id', med.id).select().single()
    : await supabase.from('medications').insert(med).select().single()
  if (error) throw error
  return data as Medication
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT PARSING HELPER
═══════════════════════════════════════════════════════════════ */
export async function saveDocumentUpload(rawText: string, entityType: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('document_uploads').insert({
    provider_id: user.id,
    raw_text: rawText,
    entity_type: entityType,
    status: 'pending'
  }).select().single()
  if (error) throw error
  return data
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT TYPES
═══════════════════════════════════════════════════════════════ */
export interface PatientProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: string
  blood_type?: string
  allergies: string[]
  insurance_provider?: string
  insurance_id?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  address?: string
  area?: string
  avatar_url?: string
  services_needed: string[]
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  patient_id: string
  hospital_id?: number
  doctor_id?: number
  appointment_date: string
  appointment_time: string
  status: string
  payment_method?: string
  notes?: string
  created_at: string
}

export interface LabBooking {
  id: number
  patient_id: string
  lab_id?: number
  booking_date: string
  home_visit: boolean
  status: string
  payment_method?: string
  total_amount: number
  notes?: string
  created_at: string
}

export interface HomeVisit {
  id: number
  patient_id: string
  doctor_id?: number
  visit_date: string
  visit_time: string
  reason: string
  symptoms: string[]
  urgency: string
  address: string
  area?: string
  status: string
  payment_method?: string
  fee?: string
  notes?: string
  created_at: string
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT AUTH HELPERS
═══════════════════════════════════════════════════════════════ */
export async function patientSignUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'patient', full_name: fullName },
      emailRedirectTo: `${window.location.origin}/`
    }
  })
  if (error) throw error
  return data
}

export async function patientSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function getPatientProfile(): Promise<PatientProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('patient_profiles').select('*').eq('id', user.id).single()
  return data
}

export async function updatePatientProfile(updates: Partial<PatientProfile>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('patient_profiles').update(updates).eq('id', user.id).select().single()
  if (error) throw error
  return data as PatientProfile
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT BOOKING HELPERS
═══════════════════════════════════════════════════════════════ */
export async function createAppointment(appointment: Partial<Appointment>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('appointments').insert({
    ...appointment,
    patient_id: user.id
  }).select().single()
  if (error) throw error
  return data as Appointment
}

export async function fetchMyAppointments() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('appointments').select('*').eq('patient_id', user.id).order('appointment_date', { ascending: false })
  if (error) throw error
  return data as Appointment[]
}

export async function createLabBooking(booking: Partial<LabBooking>, testIds: number[]) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('lab_bookings').insert({
    ...booking,
    patient_id: user.id
  }).select().single()
  if (error) throw error
  // Insert test associations
  if (testIds.length > 0) {
    await supabase.from('lab_booking_tests').insert(
      testIds.map(tid => ({ booking_id: data.id, test_id: tid }))
    )
  }
  return data as LabBooking
}

export async function createHomeVisit(visit: Partial<HomeVisit>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('home_visits').insert({
    ...visit,
    patient_id: user.id
  }).select().single()
  if (error) throw error
  return data as HomeVisit
}

export async function fetchMyHomeVisits() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('home_visits').select('*').eq('patient_id', user.id).order('visit_date', { ascending: false })
  if (error) throw error
  return data as HomeVisit[]
}
