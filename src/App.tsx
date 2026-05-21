import { useState } from 'react'
import {
  Home, Calendar, FileText, Search, Bell, ChevronRight,
  MapPin, Clock, Video, AlertCircle, Pill, Users,
  Heart, Activity, ArrowLeft, Star, Check, Plus,
  Shield, Filter, Phone, TrendingUp, Award, FlaskConical,
  Microscope, Zap, Building2, TestTube, ScanLine, Stethoscope,
  CreditCard, Settings, LogOut, Info, X
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type Screen = 'home' | 'hospitals' | 'labs' | 'booking' | 'lab-booking' | 'records' | 'profile'
type BookingFor = 'hospital' | 'lab'
type SheetData =
  | { type: 'hospital'; data: typeof HOSPITALS[0] }
  | { type: 'lab'; data: typeof LABS[0] }
  | { type: 'test'; data: typeof LAB_TESTS[0] }
  | { type: 'doctor'; data: typeof DOCTORS[0] }
  | { type: 'record'; data: typeof RECORDS[0] }
  | { type: 'med'; data: typeof MEDS[0] }
  | { type: 'notifications' }
  | null

/* ═══════════════════════════════════════════════════════════════
   DATA — HOSPITALS (with detail)
═══════════════════════════════════════════════════════════════ */
const HOSPITALS = [
  { id: 1, name: 'Apollo Bramwell', area: 'Moka', type: 'Private', rating: 4.9, fee: 'Rs 1,200', wait: '~10 min', tag: 'Cardiology', accent: 'from-blue-500 to-cyan-500', grade: 'A+', beds: 200, specialists: 45,
    detail: { desc: "Mauritius's most advanced private hospital, internationally accredited and affiliated with Apollo Hospitals India. Equipped with state-of-the-art diagnostics and surgical theatres.", services: ['Cardiology','Oncology','Neurology','Orthopaedics','Maternity','Emergency 24/7'], hours: 'Open 24/7 — Emergency always available', phone: '+230 405 2000', address: 'Riche Terre, Moka District', insurance: ['NIC','Swan','Anglo','Jubilee','SICOM'], parking: 'Free parking available' }},
  { id: 2, name: 'Moka Eye Hospital', area: 'Moka', type: 'Specialist', rating: 4.8, fee: 'Rs 800', wait: '~15 min', tag: 'Ophthalmology', accent: 'from-violet-500 to-purple-500', grade: 'A', beds: 50, specialists: 12,
    detail: { desc: "Specialist eye care centre offering comprehensive eye treatments including cataract surgery, LASIK, glaucoma management, and paediatric eye care.", services: ['LASIK','Cataract Surgery','Glaucoma','Retina Treatment','Paediatric Eye Care'], hours: 'Mon–Sat 8:00 AM – 6:00 PM', phone: '+230 433 7000', address: 'St Jean Road, Moka', insurance: ['NIC','Swan','Jubilee'], parking: 'On-site parking' }},
  { id: 3, name: 'Clinique Ferrière', area: 'Beau Bassin', type: 'Private', rating: 4.6, fee: 'Rs 600', wait: '~20 min', tag: 'General', accent: 'from-emerald-500 to-teal-500', grade: 'A', beds: 120, specialists: 28,
    detail: { desc: "Well-established private clinic offering a wide range of medical and surgical specialties, serving central Mauritius since 1985.", services: ['General Surgery','Maternity','Cardiology','Orthopaedics','Dermatology','Paediatrics'], hours: 'Mon–Sat 7:00 AM – 9:00 PM, Sun 8:00 AM – 5:00 PM', phone: '+230 454 3061', address: 'Ferrière Street, Beau Bassin', insurance: ['NIC','Swan','Anglo','SICOM'], parking: 'Street parking available' }},
  { id: 4, name: 'C-Care Wellkin', area: 'Moka', type: 'Private', rating: 4.5, fee: 'Rs 700', wait: '~25 min', tag: 'General', accent: 'from-orange-400 to-amber-500', grade: 'B+', beds: 80, specialists: 20,
    detail: { desc: "Modern private hospital part of the C-Care group, offering advanced diagnostics, specialist consultations, and a 24/7 emergency department.", services: ['Cardiology','Oncology','Gastroenterology','Urology','Emergency 24/7'], hours: '24/7 Emergency, Consultations Mon–Sat', phone: '+230 605 1000', address: 'Moka Business Hub', insurance: ['NIC','Swan','Anglo','Jubilee'], parking: 'Free covered parking' }},
  { id: 5, name: 'Dar El Iman', area: 'Rose Hill', type: 'Private', rating: 4.4, fee: 'Rs 500', wait: '~30 min', tag: 'General', accent: 'from-rose-400 to-pink-500', grade: 'B+', beds: 60, specialists: 15,
    detail: { desc: "Community-focused private clinic serving the Rose Hill area with friendly, affordable specialist and GP services.", services: ['General Practice','Gynaecology','Paediatrics','Dermatology','Minor Surgery'], hours: 'Mon–Sat 7:30 AM – 7:00 PM', phone: '+230 464 1070', address: 'Royal Road, Rose Hill', insurance: ['NIC','Swan'], parking: 'Limited street parking' }},
  { id: 6, name: 'Flacq Hospital', area: 'Flacq', type: 'Public', rating: 4.1, fee: 'Free', wait: '~45 min', tag: 'General', accent: 'from-slate-400 to-slate-500', grade: 'B', beds: 300, specialists: 35,
    detail: { desc: "The largest public hospital in the east of Mauritius, offering free healthcare to all residents. Fully equipped emergency and surgical departments.", services: ['Emergency','Surgery','Maternity','Paediatrics','Internal Medicine','Orthopaedics'], hours: '24/7 Emergency, Outpatient Mon–Fri 8 AM – 4 PM', phone: '+230 413 2400', address: 'Hospital Road, Centre de Flacq', insurance: ['Free for all residents'], parking: 'Free parking' }},
]

/* ═══════════════════════════════════════════════════════════════
   DATA — LABORATORIES (with detail)
═══════════════════════════════════════════════════════════════ */
const LABS = [
  { id: 1, name: 'Lancet Labo Mauritius', area: 'Port Louis', rating: 4.9, turnaround: '4–6 hrs', accent: 'from-cyan-500 to-teal-500', grade: 'A+', certified: 'ISO 15189', categories: ['Haematology','Biochemistry','Microbiology','Immunology'], homeVisit: true, onlineResults: true,
    detail: { desc: 'Part of the largest private laboratory network in southern Africa. Internationally accredited with ISO 15189, ensuring gold-standard diagnostic accuracy.', hours: 'Mon–Fri 7:00 AM – 5:00 PM, Sat 7:00 AM – 1:00 PM', phone: '+230 211 8000', address: '5 Edith Cavell Street, Port Louis', homeVisitFee: 'Rs 300 additional', resultDelivery: 'Results via SMS, email, or DodoCare app' }},
  { id: 2, name: 'Cerba Mauritius', area: 'Ebène', rating: 4.8, turnaround: '6–12 hrs', accent: 'from-blue-500 to-indigo-500', grade: 'A+', certified: 'ISO 15189', categories: ['Genetics','Pathology','Biochemistry','Toxicology'], homeVisit: true, onlineResults: true,
    detail: { desc: 'International laboratory group with European-grade standards. Specialises in genetics, toxicology, and rare disease testing.', hours: 'Mon–Fri 7:30 AM – 5:30 PM, Sat 8:00 AM – 12:00 PM', phone: '+230 467 2600', address: 'Cybercity Tower, Ebène', homeVisitFee: 'Rs 350 additional', resultDelivery: 'Online portal and app notifications' }},
  { id: 3, name: 'Labo Bari', area: 'Curepipe', rating: 4.6, turnaround: '8–12 hrs', accent: 'from-emerald-500 to-green-500', grade: 'A', certified: 'COFRAC', categories: ['Haematology','Biochemistry','Serology'], homeVisit: false, onlineResults: true,
    detail: { desc: 'Trusted local laboratory in Curepipe with French-accredited (COFRAC) quality standards. Friendly service and reliable results.', hours: 'Mon–Fri 7:00 AM – 4:00 PM, Sat 7:00 AM – 12:00 PM', phone: '+230 670 1234', address: 'Royal Road, Curepipe', homeVisitFee: 'Not available', resultDelivery: 'Collect in person or online' }},
  { id: 4, name: 'Bio-Analyse Centre', area: 'Rose Hill', rating: 4.5, turnaround: '12–24 hrs', accent: 'from-violet-500 to-purple-500', grade: 'A', certified: 'ISO 9001', categories: ['Biochemistry','Microbiology','Hormones'], homeVisit: true, onlineResults: false,
    detail: { desc: 'Established centre in Rose Hill specialising in hormone analysis and microbiology. Known for personalised patient care.', hours: 'Mon–Fri 7:00 AM – 4:30 PM, Sat 7:30 AM – 11:30 AM', phone: '+230 464 5600', address: 'Sir Virgil Naz Street, Rose Hill', homeVisitFee: 'Rs 400 additional', resultDelivery: 'Collect in person or by phone' }},
  { id: 5, name: 'C-Lab (C-Care Group)', area: 'Moka', rating: 4.7, turnaround: '2–4 hrs', accent: 'from-rose-500 to-pink-500', grade: 'A', certified: 'ISO 15189', categories: ['Haematology','Biochemistry','PCR Testing'], homeVisit: false, onlineResults: true,
    detail: { desc: 'Hospital-integrated laboratory part of the C-Care network. Fast turnaround times with direct integration to your hospital records.', hours: 'Open 24/7 (emergency testing), Routine: Mon–Sat', phone: '+230 605 1050', address: 'C-Care Wellkin Hospital, Moka', homeVisitFee: 'Not available', resultDelivery: 'Automatic sync to DodoCare and C-Care portal' }},
]

/* ═══════════════════════════════════════════════════════════════
   DATA — LAB TESTS (with plain-language detail)
═══════════════════════════════════════════════════════════════ */
const LAB_TESTS = [
  { id: 1, name: 'Complete Blood Count (CBC)', category: 'Haematology', price: 'Rs 450', fasting: false, turnaround: '4 hrs', icon: TestTube, color: 'text-red-500 bg-red-50',
    detail: { plain: 'Counts your 3 types of blood cells. Red cells carry oxygen. White cells fight bacteria and viruses. Platelets help stop bleeding when you get a cut.', why: 'Routine checkup, tiredness, recurrent infections, anaemia, or before surgery.', prep: 'No fasting needed. You can eat and drink normally.', measures: ['Red blood cells (oxygen carriers)','White blood cells (immune fighters)','Platelets (clotting cells)','Haemoglobin (oxygen protein)'] }},
  { id: 2, name: 'Lipid Panel (Cholesterol)', category: 'Biochemistry', price: 'Rs 650', fasting: true, turnaround: '6 hrs', icon: Activity, color: 'text-amber-500 bg-amber-50',
    detail: { plain: 'Measures the fats in your blood — total cholesterol, HDL ("good"), LDL ("bad"), and triglycerides. High LDL can block arteries and cause heart attacks.', why: 'Heart disease risk check, family history of heart problems, or monitoring cholesterol medication.', prep: 'Fast for 9–12 hours before the test. Water is fine — no food or sugary drinks.', measures: ['Total cholesterol','HDL — good cholesterol','LDL — bad cholesterol','Triglycerides (blood fats)'] }},
  { id: 3, name: 'HbA1c (Diabetes)', category: 'Biochemistry', price: 'Rs 550', fasting: false, turnaround: '6 hrs', icon: FlaskConical, color: 'text-blue-500 bg-blue-50',
    detail: { plain: 'Shows your average blood sugar level over the past 3 months. Think of it as a long-term snapshot of how much sugar has been in your blood.', why: 'Diagnose or monitor diabetes and pre-diabetes. Recommended every 3–6 months for diabetic patients.', prep: 'No fasting needed. You can eat and drink normally before this test.', measures: ['Glycated haemoglobin percentage','3-month average blood sugar','Diabetes risk category'] }},
  { id: 4, name: 'Thyroid Panel (TSH/T3/T4)', category: 'Immunology', price: 'Rs 900', fasting: false, turnaround: '8 hrs', icon: Microscope, color: 'text-violet-500 bg-violet-50',
    detail: { plain: 'Checks if your thyroid gland (the butterfly-shaped gland in your neck) is working properly. Your thyroid controls energy, weight, mood, and body temperature.', why: 'Unexplained weight gain or loss, tiredness, hair thinning, feeling cold, anxiety, or mood changes.', prep: 'No special preparation. Take your regular medications as usual.', measures: ['TSH — thyroid stimulating hormone','T3 — triiodothyronine','T4 — thyroxine','Free T4 — active thyroid hormone'] }},
  { id: 5, name: 'COVID-19 PCR Test', category: 'PCR Testing', price: 'Rs 1,200', fasting: false, turnaround: '2 hrs', icon: ScanLine, color: 'text-emerald-500 bg-emerald-50',
    detail: { plain: 'Detects the genetic material of the COVID-19 virus with very high accuracy. More reliable than a rapid antigen test and accepted for travel.', why: 'Confirmed diagnosis, required for international travel, or following close contact with a positive case.', prep: 'Avoid eating, drinking, or brushing teeth 30 minutes before the nasal/throat swab.', measures: ['SARS-CoV-2 RNA detection','Positive / Negative result','Ct value (viral load indicator)'] }},
  { id: 6, name: 'Kidney Function Test', category: 'Biochemistry', price: 'Rs 700', fasting: true, turnaround: '6 hrs', icon: TestTube, color: 'text-cyan-500 bg-cyan-50',
    detail: { plain: 'Checks how well your kidneys are cleaning waste from your blood. Measures creatinine and urea — waste products that build up if kidneys struggle.', why: 'Kidney disease screening, high blood pressure, diabetes monitoring, or before starting certain medications.', prep: 'Drink water normally. Fasting for 8 hours gives the most accurate results.', measures: ['Creatinine (kidney waste marker)','Urea / BUN','eGFR (kidney filtration rate)','Electrolytes (sodium, potassium)'] }},
  { id: 7, name: 'Liver Function Test', category: 'Biochemistry', price: 'Rs 750', fasting: true, turnaround: '6 hrs', icon: Activity, color: 'text-orange-500 bg-orange-50',
    detail: { plain: 'Measures enzymes and proteins your liver produces. High levels can mean your liver is stressed, inflamed, or damaged.', why: 'Alcohol monitoring, medication side-effect check, fatty liver, jaundice (yellow skin/eyes), or persistent fatigue.', prep: 'Avoid alcohol for 24 hours before. Fasting for 8 hours recommended for best results.', measures: ['ALT & AST (liver enzymes)','Bilirubin (jaundice marker)','Albumin (liver protein)','ALP (bile duct enzyme)'] }},
  { id: 8, name: 'Urine Analysis', category: 'Microbiology', price: 'Rs 350', fasting: false, turnaround: '4 hrs', icon: FlaskConical, color: 'text-pink-500 bg-pink-50',
    detail: { plain: 'Examines your urine sample for signs of infection, kidney problems, diabetes, or inflammation. A simple, painless test.', why: 'Urinary discomfort, frequent urination, kidney stones, routine checkup, or suspected urinary tract infection.', prep: "Use a clean 'midstream' sample — let a little urine go first, then collect in the cup. No fasting needed.", measures: ['pH and specific gravity','Protein and glucose levels','Red/white blood cells','Bacteria and crystals'] }},
]

/* ═══════════════════════════════════════════════════════════════
   DATA — DOCTORS (with bio and specialty description)
═══════════════════════════════════════════════════════════════ */
const DOCTORS = [
  { id: 1, name: 'Dr. Priya Ramjuttun', initials: 'PR', specialty: 'Cardiologist', available: ['9:00','10:30','14:00','15:30'], color: 'bg-blue-500', exp: '14 yrs',
    specialtyDesc: 'A heart doctor who diagnoses and treats conditions affecting your heart, arteries, and blood pressure.', bio: 'Trained at University of Mauritius and Apollo Hospitals India. Specialises in interventional cardiology and heart failure management.', qualifications: 'MBBS, MD Cardiology', languages: ['English','French','Creole'], hospital: 'Apollo Bramwell, Moka' },
  { id: 2, name: 'Dr. Ahmed Sulliman', initials: 'AS', specialty: 'General Practitioner', available: ['8:30','11:00','13:30','16:00'], color: 'bg-emerald-500', exp: '9 yrs',
    specialtyDesc: 'Your family doctor — first point of contact for all health concerns, from colds and flu to managing chronic conditions.', bio: 'Experienced GP with special interest in diabetes management and preventive medicine. Known for thorough consultations.', qualifications: 'MBBS, Diploma Family Medicine', languages: ['English','French','Creole','Hindi'], hospital: 'C-Care Wellkin, Moka' },
  { id: 3, name: 'Dr. Marie Leblanc', initials: 'ML', specialty: 'Paediatrician', available: ['9:30','11:30','14:30'], color: 'bg-violet-500', exp: '11 yrs',
    specialtyDesc: "A children's doctor — expert in the health, development, and wellbeing of babies, children, and teenagers.", bio: 'Paediatric specialist trained in France. Passionate about childhood nutrition and developmental milestones.', qualifications: 'MD Paediatrics (Bordeaux)', languages: ['English','French','Creole'], hospital: 'Clinique Ferrière, Beau Bassin' },
  { id: 4, name: 'Dr. Ravi Chadee', initials: 'RC', specialty: 'Dermatologist', available: ['10:00','11:30','15:00'], color: 'bg-amber-500', exp: '7 yrs',
    specialtyDesc: 'A skin specialist who treats acne, eczema, psoriasis, moles, rashes, and performs skin checks for early cancer detection.', bio: 'Dermatology specialist from University of Cape Town. Expert in cosmetic dermatology and skin cancer screening.', qualifications: 'MBChB, FC Derm (SA)', languages: ['English','French','Creole'], hospital: 'Apollo Bramwell, Moka' },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — MEDICATIONS (detail info)
═══════════════════════════════════════════════════════════════ */
const MEDS = [
  { id: 0, name: 'Amlodipine 5mg', sub: '1 tablet · With water', time: '8:00 AM', grad: 'from-emerald-400 to-teal-500',
    detail: { type: 'Blood Pressure Medicine', usedFor: 'Lowers high blood pressure and reduces chest pain (angina). Relaxes blood vessels so blood flows more easily.', howTake: 'Swallow 1 tablet in the morning with a full glass of water. Can be taken with or without food.', sideEffects: 'Mild ankle swelling, slight dizziness when standing up, or flushing. These usually improve after the first week.', refillBy: 'June 10, 2026' }},
  { id: 1, name: 'Metformin 500mg', sub: '1 tablet · After meal', time: '1:00 PM', grad: 'from-blue-400 to-cyan-500',
    detail: { type: 'Diabetes Medicine', usedFor: 'Helps control blood sugar levels in Type 2 diabetes. Makes your body respond better to insulin.', howTake: 'Take 1 tablet after lunch with food to reduce stomach upset. Swallow whole — do not crush.', sideEffects: 'Mild nausea or upset stomach when first starting. Taking it with food helps. Tell your doctor if you feel very tired.', refillBy: 'June 15, 2026' }},
  { id: 2, name: 'Atorvastatin 20mg', sub: '1 tablet · Before bed', time: '9:00 PM', grad: 'from-violet-400 to-purple-500',
    detail: { type: 'Cholesterol Medicine', usedFor: 'Lowers LDL ("bad") cholesterol and triglycerides. Protects your arteries and reduces the risk of heart attack and stroke.', howTake: 'Take 1 tablet at bedtime. Your liver makes most cholesterol at night, so evening dosing is most effective.', sideEffects: 'Occasional muscle aches or mild headache. Tell your doctor if you experience unexplained muscle pain or weakness.', refillBy: 'July 1, 2026' }},
]

/* ═══════════════════════════════════════════════════════════════
   DATA — RECORDS (mixed hospital + lab)
═══════════════════════════════════════════════════════════════ */
const RECORDS = [
  { id: 1, date: '12 May 2026', by: 'Dr. Priya Ramjuttun', initials: 'PR', provider: 'Apollo Bramwell', providerType: 'hospital' as const, type: 'Consultation', summary: 'Hypertension follow-up — BP well controlled at 128/82. Continue current medications.', icon: Heart, accent: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', status: 'Completed' },
  { id: 2, date: '10 May 2026', by: 'Lancet Labo', initials: 'LL', provider: 'Lancet Labo Mauritius', providerType: 'lab' as const, type: 'Lab Result', summary: 'CBC + Lipid Panel — all values within normal range. Cholesterol improved since last test.', icon: FlaskConical, accent: 'bg-cyan-500', light: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-600', status: 'Normal' },
  { id: 3, date: '28 Apr 2026', by: 'Dr. Marie Leblanc', initials: 'ML', provider: 'Clinique Ferrière', providerType: 'hospital' as const, type: 'Lab Results', summary: 'Blood panel — all normal. Vitamin D slightly low — supplement recommended.', icon: Activity, accent: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', status: 'Normal' },
  { id: 4, date: '15 Apr 2026', by: 'Cerba Mauritius', initials: 'CM', provider: 'Cerba Mauritius', providerType: 'lab' as const, type: 'Lab Result', summary: 'HbA1c — 6.1% (Borderline pre-diabetic). Recommend dietary adjustments and retest in 3 months.', icon: TestTube, accent: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', status: 'Attention' },
  { id: 5, date: '10 Mar 2026', by: 'Dr. Ahmed Sulliman', initials: 'AS', provider: 'C-Care Wellkin', providerType: 'hospital' as const, type: 'Prescription', summary: 'Seasonal allergy treatment — antihistamine prescribed for 2 weeks. Follow up if symptoms persist.', icon: Pill, accent: 'bg-violet-500', light: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', status: 'Completed' },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */
const NOTIFICATIONS = [
  { id: 1, title: 'Lab Result Ready', body: 'Your HbA1c result from Cerba Mauritius is ready to view.', time: '2 hours ago', icon: TestTube, color: 'bg-amber-100 text-amber-600', unread: true },
  { id: 2, title: 'Appointment Reminder', body: 'Dr. Priya Ramjuttun — tomorrow at 10:30 AM, Apollo Bramwell.', time: '5 hours ago', icon: Calendar, color: 'bg-blue-100 text-blue-600', unread: true },
  { id: 3, title: 'Medication Due', body: "Don't forget your Metformin 500mg at 1:00 PM today.", time: '1 day ago', icon: Pill, color: 'bg-emerald-100 text-emerald-600', unread: false },
]

const DATES = [
  { short: 'Mon', num: '19' }, { short: 'Tue', num: '20' },
  { short: 'Wed', num: '21' }, { short: 'Thu', num: '22' },
  { short: 'Fri', num: '23' }, { short: 'Sat', num: '24' },
]

/* ═══════════════════════════════════════════════════════════════
   SVG ILLUSTRATIONS
═══════════════════════════════════════════════════════════════ */
function LabIllustration() {
  return (
    <svg viewBox="0 0 160 80" className="w-full h-full" fill="none">
      <circle cx="40" cy="35" r="22" fill="white" fillOpacity="0.12" />
      <path d="M32 48 L36 28 L44 28 L48 48 Q44 54 40 54 Q36 54 32 48Z" fill="white" fillOpacity="0.2" />
      <circle cx="38" cy="42" r="4" fill="white" fillOpacity="0.5" />
      <circle cx="44" cy="45" r="2.5" fill="white" fillOpacity="0.4" />
      <rect x="35" y="22" width="10" height="8" rx="1" fill="white" fillOpacity="0.3" />
      <circle cx="90" cy="30" r="16" fill="white" fillOpacity="0.1" />
      <path d="M82 38 L86 22 L94 22 L98 38" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
      <circle cx="90" cy="35" r="5" fill="white" fillOpacity="0.35" />
      <path d="M110 20 L150 20 M110 30 L145 30 M110 40 L140 40 M110 50 L130 50" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <circle cx="107" cy="20" r="2.5" fill="white" fillOpacity="0.5" />
      <circle cx="107" cy="30" r="2.5" fill="white" fillOpacity="0.5" />
      <circle cx="107" cy="40" r="2.5" fill="white" fillOpacity="0.5" />
      <circle cx="107" cy="50" r="2.5" fill="white" fillOpacity="0.35" />
    </svg>
  )
}

function HospitalIllustration() {
  return (
    <svg viewBox="0 0 40 40" width="20" height="20" fill="none">
      <rect x="6" y="18" width="28" height="20" rx="2" fill="white" fillOpacity="0.2" />
      <rect x="10" y="22" width="8" height="7" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="22" y="22" width="8" height="7" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="15" y="30" width="10" height="8" rx="1" fill="white" fillOpacity="0.45" />
      <rect x="14" y="10" width="12" height="10" rx="1" fill="white" fillOpacity="0.25" />
      <rect x="19" y="6" width="2" height="18" fill="white" fillOpacity="0.65" />
      <rect x="14" y="13" width="12" height="2" fill="white" fillOpacity="0.65" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
  @keyframes pulse-sos { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.2);opacity:0} }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.2)} 30%{transform:scale(1)} 45%{transform:scale(1.12)} 60%{transform:scale(1)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .sos-ring::before,.sos-ring::after{content:'';position:absolute;inset:-4px;border-radius:9999px;background:rgba(239,68,68,.45);animation:pulse-sos 1.6s ease-out infinite}
  .sos-ring::after{inset:-9px;background:rgba(239,68,68,.2);animation-delay:.55s}
  .heartbeat{animation:heartbeat 2s ease-in-out infinite}
  .float{animation:float 4s ease-in-out infinite}
  .fade-up{animation:fadeUp .3s ease-out forwards}
  .scale-in{animation:scaleIn .25s ease-out forwards}
  .sheet-up{animation:slideUp .32s cubic-bezier(.32,.72,0,1) forwards}
  .overlay-in{animation:fadeIn .2s ease-out forwards}
  *{-webkit-tap-highlight-color:transparent}
  ::-webkit-scrollbar{display:none}
`

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [_bookingFor, setBookingFor] = useState<BookingFor>('hospital')
  const [bookStep, setBookStep] = useState(1)
  const [selectedHospital, setSelectedHospital] = useState<typeof HOSPITALS[0] | null>(null)
  const [selectedLab, setSelectedLab] = useState<typeof LABS[0] | null>(null)
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [labSearch, setLabSearch] = useState('')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [sosActive, setSosActive] = useState(false)
  const [homeVisit, setHomeVisit] = useState(false)
  // NEW state
  const [sheet, setSheet] = useState<SheetData>(null)
  const [areaFilter, setAreaFilter] = useState('All')
  const [takenMeds, setTakenMeds] = useState<number[]>([0]) // indices of taken meds
  const [toast, setToast] = useState<string | null>(null)

  const openSheet = (s: SheetData) => setSheet(s)
  const closeSheet = () => setSheet(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const toggleMed = (id: number) => {
    setTakenMeds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  const filteredHospitals = HOSPITALS.filter(h => {
    const matchesSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.area.toLowerCase().includes(searchQuery.toLowerCase()) || h.tag.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArea = areaFilter === 'All' || h.area === areaFilter || (areaFilter === 'Public' && h.type === 'Public')
    return matchesSearch && matchesArea
  })

  const filteredLabs = LABS.filter(l => !labSearch || l.name.toLowerCase().includes(labSearch.toLowerCase()) || l.area.toLowerCase().includes(labSearch.toLowerCase()) || l.categories.some(c => c.toLowerCase().includes(labSearch.toLowerCase())))

  const startHospitalBooking = (hospital: typeof HOSPITALS[0]) => {
    setSelectedHospital(hospital); setBookStep(1); setSelectedDoctor(null); setSelectedTime(null); setSelectedDate(null)
    setBookingConfirmed(false); setBookingFor('hospital'); setScreen('booking')
  }

  const startLabBooking = (lab: typeof LABS[0]) => {
    setSelectedLab(lab); setBookStep(1); setSelectedTests([]); setSelectedDate(null)
    setBookingConfirmed(false); setHomeVisit(false); setBookingFor('lab'); setScreen('lab-booking')
  }

  const toggleTest = (id: number) =>
    setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const selectedTestTotal = LAB_TESTS
    .filter(t => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + parseInt(t.price.replace('Rs ', '').replace(',', '')), 0)

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #ccfbf1 50%, #d1fae5 100%)' }}>
      <style>{CSS}</style>

      {/* Phone */}
      <div className="w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col relative"
        style={{ background: '#F1F5F9', boxShadow: '0 40px 80px rgba(0,0,0,0.22),0 0 0 1px rgba(255,255,255,0.6),inset 0 1px 0 rgba(255,255,255,0.8)' }}>

        {/* Status bar */}
        <div className="flex justify-between items-center px-7 pt-4 pb-0.5 flex-shrink-0" style={{ zIndex: 20, position: 'relative' }}>
          <span className="text-[13px] font-semibold" style={{ color: 'white' }}>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-28 h-5 bg-black rounded-full" style={{ zIndex: 30 }} />
          <div className="flex gap-1.5 items-center">
            {[2,3,4,5].map((h,i)=><div key={i} className="w-[3px] rounded-full bg-white" style={{height:h*2.5}}/>)}
            <div className="w-4 h-[11px] border-2 border-white rounded-sm ml-1 flex items-center px-[1.5px]">
              <div className="w-full h-full bg-white rounded-[1px]" style={{width:'80%'}}/>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {screen === 'home' && <HomeScreen setScreen={setScreen} sosActive={sosActive} setSosActive={setSosActive} openSheet={openSheet} takenMeds={takenMeds} toggleMed={toggleMed} showToast={showToast} />}
          {screen === 'hospitals' && <HospitalsScreen search={searchQuery} setSearch={setSearchQuery} hospitals={filteredHospitals} startBooking={startHospitalBooking} setScreen={setScreen} areaFilter={areaFilter} setAreaFilter={setAreaFilter} openSheet={openSheet} />}
          {screen === 'labs' && <LabsScreen search={labSearch} setSearch={setLabSearch} labs={filteredLabs} tests={LAB_TESTS} startBooking={startLabBooking} setScreen={setScreen} openSheet={openSheet} />}
          {screen === 'booking' && <HospitalBookingScreen hospital={selectedHospital} step={bookStep} setStep={setBookStep} doctor={selectedDoctor} setDoctor={setSelectedDoctor} time={selectedTime} setTime={setSelectedTime} date={selectedDate} setDate={setSelectedDate} onConfirm={()=>{setBookingConfirmed(true);setBookStep(3)}} confirmed={bookingConfirmed} setScreen={setScreen} openSheet={openSheet} />}
          {screen === 'lab-booking' && <LabBookingScreen lab={selectedLab} step={bookStep} setStep={setBookStep} tests={LAB_TESTS} selectedTests={selectedTests} toggleTest={toggleTest} date={selectedDate} setDate={setSelectedDate} homeVisit={homeVisit} setHomeVisit={setHomeVisit} total={selectedTestTotal} onConfirm={()=>{setBookingConfirmed(true);setBookStep(3)}} confirmed={bookingConfirmed} setScreen={setScreen} openSheet={openSheet} />}
          {screen === 'records' && <RecordsScreen setScreen={setScreen} openSheet={openSheet} />}
          {screen === 'profile' && <ProfileScreen showToast={showToast} openSheet={openSheet} />}
        </div>

        <BottomNav screen={screen} setScreen={setScreen} />

        {/* ─── Bottom Sheet Overlay ─── */}
        {sheet && (
          <div className="absolute inset-0 z-[60] flex flex-col justify-end" style={{ borderRadius: '44px', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-black/50 overlay-in" style={{ backdropFilter: 'blur(4px)' }} onClick={closeSheet} />
            <div className="relative bg-white rounded-t-[28px] max-h-[82%] overflow-y-auto sheet-up" style={{ scrollbarWidth: 'none', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="sticky top-0 bg-white pt-3 pb-1 z-10">
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
              </div>
              <div className="px-5 pb-8">
                <button onClick={closeSheet} className="absolute top-3 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center z-20 active:scale-90 transition-transform">
                  <X size={16} className="text-slate-500" />
                </button>
                {renderSheetContent(sheet, closeSheet, setScreen, startHospitalBooking, startLabBooking, showToast)}
              </div>
            </div>
          </div>
        )}

        {/* ─── Toast ─── */}
        {toast && (
          <div className="absolute bottom-24 left-4 right-4 z-[70] bg-slate-900 text-white text-[12px] font-semibold px-4 py-3 rounded-2xl text-center scale-in"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHEET CONTENT RENDERER
═══════════════════════════════════════════════════════════════ */
function renderSheetContent(sheet: NonNullable<SheetData>, closeSheet: () => void, _setScreen: (s: Screen) => void, startHospitalBooking: (h: typeof HOSPITALS[0]) => void, startLabBooking: (l: typeof LABS[0]) => void, showToast: (m: string) => void) {

  if (sheet.type === 'notifications') {
    return (
      <div className="pt-2">
        <h3 className="text-slate-800 text-[17px] font-bold mb-4">Notifications</h3>
        <div className="space-y-3">
          {NOTIFICATIONS.map(n => {
            const Icon = n.icon
            return (
              <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-2xl ${n.unread ? 'bg-blue-50/60 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-800 text-[13px] font-bold">{n.title}</p>
                    {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{n.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (sheet.type === 'hospital') {
    const h = sheet.data
    return (
      <div className="pt-2">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${h.accent} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            <HospitalIllustration />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 text-[17px] font-bold">{h.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-[13px] font-bold text-slate-700">{h.rating}</span>
              <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)' }}>{h.grade}</span>
              <span className="text-[10px] text-slate-400">{h.type}</span>
            </div>
          </div>
        </div>
        <p className="text-slate-600 text-[13px] leading-relaxed mb-4">{h.detail.desc}</p>
        <div className="space-y-3 mb-5">
          <InfoRow icon={Building2} label="Services" value={h.detail.services.join(' · ')} />
          <InfoRow icon={Clock} label="Hours" value={h.detail.hours} />
          <InfoRow icon={Phone} label="Phone" value={h.detail.phone} />
          <InfoRow icon={MapPin} label="Address" value={h.detail.address} />
          <InfoRow icon={Shield} label="Insurance" value={h.detail.insurance.join(', ')} />
          <InfoRow icon={Activity} label="Beds" value={`${h.beds} beds · ${h.specialists} specialists`} />
        </div>
        <button onClick={() => { closeSheet(); startHospitalBooking(h) }}
          className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 6px 24px rgba(15,118,110,0.45)' }}>
          Book Appointment →
        </button>
      </div>
    )
  }

  if (sheet.type === 'lab') {
    const l = sheet.data
    return (
      <div className="pt-2">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${l.accent} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            <FlaskConical size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 text-[17px] font-bold">{l.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-[13px] font-bold text-slate-700">{l.rating}</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{l.certified}</span>
            </div>
          </div>
        </div>
        <p className="text-slate-600 text-[13px] leading-relaxed mb-4">{l.detail.desc}</p>
        <div className="space-y-3 mb-4">
          <InfoRow icon={Microscope} label="Specialties" value={l.categories.join(' · ')} />
          <InfoRow icon={Clock} label="Hours" value={l.detail.hours} />
          <InfoRow icon={Phone} label="Phone" value={l.detail.phone} />
          <InfoRow icon={MapPin} label="Address" value={l.detail.address} />
          <InfoRow icon={Zap} label="Results" value={l.detail.resultDelivery} />
          {l.homeVisit && <InfoRow icon={Users} label="Home Visit" value={l.detail.homeVisitFee} />}
        </div>
        <button onClick={() => { closeSheet(); startLabBooking(l) }}
          className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)', boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}>
          Book Tests →
        </button>
      </div>
    )
  }

  if (sheet.type === 'test') {
    const t = sheet.data
    const Icon = t.icon
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center`}>
            <Icon size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 text-[16px] font-bold leading-tight">{t.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-400">{t.category}</span>
              {t.fasting && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Fasting required</span>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <DetailSection emoji="💡" title="What is this test?" body={t.detail.plain} />
          <DetailSection emoji="📋" title="Why do this test?" body={t.detail.why} />
          <DetailSection emoji="🍽️" title="How to prepare" body={t.detail.prep} />
          <div>
            <p className="text-slate-700 text-[12px] font-bold mb-2">📊 What it measures:</p>
            <div className="grid grid-cols-1 gap-1.5">
              {t.detail.measures.map(m => (
                <div key={m} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  <span className="text-slate-600 text-[11px]">{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
            <div>
              <p className="text-slate-400 text-[10px]">Price</p>
              <p className="text-slate-800 text-[16px] font-bold">{t.price}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px]">Results in</p>
              <p className="text-slate-800 text-[14px] font-bold">{t.turnaround}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sheet.type === 'doctor') {
    const d = sheet.data
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl ${d.color} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            <span className="text-white text-[18px] font-bold">{d.initials}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 text-[17px] font-bold">{d.name}</h3>
            <p className="text-slate-500 text-[12px]">{d.specialty} · {d.exp} experience</p>
          </div>
        </div>
        <div className="rounded-2xl p-3.5 mb-4" style={{ background: 'linear-gradient(135deg,#F0F9FF,#EEF2FF)', border: '1px solid #DBEAFE' }}>
          <p className="text-blue-700 text-[11px] font-bold mb-1">💓 What is a {d.specialty}?</p>
          <p className="text-slate-600 text-[12px] leading-relaxed">{d.specialtyDesc}</p>
        </div>
        <p className="text-slate-600 text-[13px] leading-relaxed mb-4">{d.bio}</p>
        <div className="space-y-3">
          <InfoRow icon={Award} label="Qualifications" value={d.qualifications} />
          <InfoRow icon={MapPin} label="Hospital" value={d.hospital} />
          <InfoRow icon={Users} label="Languages" value={d.languages.join(', ')} />
          <InfoRow icon={Clock} label="Available today" value={d.available.join(' · ')} />
        </div>
      </div>
    )
  }

  if (sheet.type === 'med') {
    const m = sheet.data
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-14 rounded-full bg-gradient-to-b ${m.grad}`} />
          <div className="flex-1">
            <h3 className="text-slate-800 text-[17px] font-bold">{m.name}</h3>
            <p className="text-slate-500 text-[12px]">{m.detail.type}</p>
          </div>
          <Pill size={20} className="text-slate-300" />
        </div>
        <div className="space-y-4">
          <DetailSection emoji="💊" title="What is this medicine for?" body={m.detail.usedFor} />
          <DetailSection emoji="📝" title="How to take it" body={m.detail.howTake} />
          <DetailSection emoji="⚠️" title="Possible side effects" body={m.detail.sideEffects} />
          <div className="rounded-2xl p-3.5" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p className="text-amber-800 text-[12px] font-bold flex items-center gap-1.5"><Calendar size={13} /> Refill needed by: {m.detail.refillBy}</p>
          </div>
        </div>
      </div>
    )
  }

  if (sheet.type === 'record') {
    const r = sheet.data
    const Icon = r.icon
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl ${r.accent} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-800 text-[16px] font-bold">{r.type}</h3>
            <p className="text-slate-400 text-[11px]">{r.date}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status==='Completed'?'bg-emerald-100 text-emerald-700':r.status==='Normal'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{r.status}</span>
        </div>
        <p className="text-slate-700 text-[13px] leading-relaxed mb-4">{r.summary}</p>
        <div className="space-y-3">
          <InfoRow icon={Stethoscope} label="Provider" value={r.by} />
          <InfoRow icon={Building2} label={r.providerType === 'lab' ? 'Laboratory' : 'Hospital'} value={r.provider} />
          <InfoRow icon={Calendar} label="Date" value={r.date} />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => { closeSheet(); showToast('PDF download starting...') }}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl text-[12px] active:scale-95 transition-transform">
            📥 Download PDF
          </button>
          <button onClick={() => { closeSheet(); showToast('Shared with your doctor') }}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl text-[12px] active:scale-95 transition-transform">
            📤 Share
          </button>
        </div>
      </div>
    )
  }

  return null
}

/* ═══════════════════════════════════════════════════════════════
   HELPER UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
function InfoRow({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-slate-700 text-[12px] leading-relaxed">{value}</p>
      </div>
    </div>
  )
}

function DetailSection({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div>
      <p className="text-slate-700 text-[12px] font-bold mb-1">{emoji} {title}</p>
      <p className="text-slate-500 text-[12px] leading-relaxed">{body}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════════════════════════════ */
function HomeScreen({ setScreen, sosActive, setSosActive, openSheet, takenMeds, toggleMed, showToast }: any) {
  return (
    <div className="flex flex-col" style={{ background: '#F1F5F9' }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-10 pb-10"
        style={{ background: 'linear-gradient(150deg,#0F766E 0%,#0369A1 55%,#1D4ED8 100%)', borderRadius: '0 0 32px 32px' }}>
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 390 200" className="w-full h-full" fill="none">
            <circle cx="350" cy="-20" r="130" fill="white" />
            <circle cx="40" cy="180" r="80" fill="white" />
          </svg>
        </div>

        <div className="relative flex justify-between items-start mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-[10px]">🦤</span>
              </div>
              <span className="text-cyan-200 text-[11px] font-bold tracking-widest uppercase">DodoCare MU</span>
            </div>
            <h1 className="text-white text-[22px] font-bold leading-tight">Good morning, Laurent</h1>
            <p className="text-blue-200/70 text-[11px] mt-0.5">Mauritius · Thursday 22 May 2026</p>
          </div>
          <button onClick={() => openSheet({ type: 'notifications' })}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Bell size={17} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-white/50" />
          </button>
        </div>

        {/* Health score */}
        <div className="relative rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4.5" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="url(#hg)" strokeWidth="4.5"
                  strokeDasharray={`${2*Math.PI*26*0.87} ${2*Math.PI*26}`} strokeLinecap="round" />
                <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#60A5FA" />
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Heart size={13} className="text-white heartbeat mb-0.5" fill="white" />
                <span className="text-white text-[10px] font-bold leading-none">87</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white/55 text-[10px] uppercase tracking-widest font-semibold">Health Score</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-white text-[26px] font-bold leading-none">87</span>
                <span className="text-emerald-300 text-[11px] font-semibold flex items-center gap-0.5">
                  <TrendingUp size={10} /> +3 this week
                </span>
              </div>
              <p className="text-white/45 text-[10px] mt-0.5">Excellent — keep it up</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {[
              { label: 'Appts', value: '2', icon: Calendar, color: 'text-cyan-300', screen: 'records' as Screen },
              { label: 'Labs', value: '1', icon: FlaskConical, color: 'text-pink-300', screen: 'labs' as Screen },
              { label: 'Meds', value: '3', icon: Pill, color: 'text-emerald-300', screen: 'profile' as Screen },
              { label: 'Records', value: '12', icon: FileText, color: 'text-violet-300', screen: 'records' as Screen },
            ].map(({ label, value, icon: Icon, color, screen }) => (
              <button key={label} onClick={() => setScreen(screen)} className="text-center active:scale-90 transition-transform">
                <Icon size={13} className={`${color} mx-auto mb-1`} />
                <p className="text-white font-bold text-[14px] leading-none">{value}</p>
                <p className="text-white/40 text-[9px] mt-0.5">{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => setScreen('hospitals')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
            style={{ background: 'linear-gradient(145deg,#0F766E,#0369A1)', boxShadow: '0 6px 24px rgba(15,118,110,0.4)' }}>
            <div className="absolute top-1 right-0 opacity-25 float">
              <HospitalIllustration />
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
              <Building2 size={17} className="text-white" />
            </div>
            <p className="text-white text-[13px] font-bold">Hospitals</p>
            <p className="text-white/60 text-[10px]">Book appointment</p>
          </button>

          <button onClick={() => setScreen('labs')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
            style={{ background: 'linear-gradient(145deg,#0891B2,#6366F1)', boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
              <FlaskConical size={17} className="text-white" />
            </div>
            <p className="text-white text-[13px] font-bold">Laboratories</p>
            <p className="text-white/60 text-[10px]">Book tests</p>
            <span className="absolute top-3 right-3 bg-white/25 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
          </button>

          <button onClick={() => setSosActive(!sosActive)}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.97] transition-all"
            style={sosActive
              ? { background: 'linear-gradient(145deg,#DC2626,#B91C1C)', boxShadow: '0 6px 28px rgba(220,38,38,0.55)' }
              : { background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${sosActive ? 'sos-ring' : ''}`}
              style={{ background: sosActive ? 'rgba(255,255,255,0.2)' : '#FEF2F2' }}>
              <AlertCircle size={17} className={sosActive ? 'text-white' : 'text-red-500'} />
            </div>
            <p className={`text-[13px] font-bold ${sosActive ? 'text-white' : 'text-slate-800'}`}>{sosActive ? 'SOS Active' : 'Emergency'}</p>
            <p className={`text-[10px] ${sosActive ? 'text-red-200' : 'text-slate-400'}`}>{sosActive ? 'Help coming…' : 'SAMU 114'}</p>
          </button>

          <button onClick={() => showToast('Family health hub coming soon!')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-2.5">
              <Users size={17} className="text-violet-600" />
            </div>
            <p className="text-slate-800 text-[13px] font-bold">Family</p>
            <p className="text-slate-400 text-[10px]">3 members</p>
            <div className="absolute bottom-3.5 right-3 flex -space-x-1.5">
              {['#3B82F6','#10B981','#8B5CF6'].map((c,i) => <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{background:c}}/>)}
            </div>
          </button>
        </div>

        {/* Pending lab results alert */}
        <button onClick={() => setScreen('records')}
          className="w-full mb-5 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg,#FFF7ED,#FFFBEB)', border: '1px solid #FED7AA' }}>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <TestTube size={18} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-orange-800 text-[12px] font-bold">Lab Result Ready</p>
            <p className="text-orange-600 text-[11px]">HbA1c — Cerba Mauritius · 15 Apr</p>
          </div>
          <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-1 rounded-full flex-shrink-0">View</span>
        </button>

        {/* Upcoming appointment */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-slate-800 text-[13px] font-bold">Next Appointment</h2>
            <button onClick={() => setScreen('records')} className="text-teal-600 text-[11px] font-bold active:scale-95 transition-transform">See all →</button>
          </div>
          <div className="rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#EFF6FF,#F0FDF4)', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => openSheet({ type: 'doctor', data: DOCTORS[0] })}
                className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                style={{ boxShadow: '0 4px 14px rgba(37,99,235,.45)' }}>
                <span className="text-white text-sm font-bold">PR</span>
              </button>
              <div className="flex-1 min-w-0">
                <button onClick={() => openSheet({ type: 'doctor', data: DOCTORS[0] })} className="text-left">
                  <p className="text-slate-800 text-[13px] font-bold">Dr. Priya Ramjuttun</p>
                  <p className="text-slate-500 text-[11px]">Cardiologist · Apollo Bramwell</p>
                </button>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-0.5 rounded-full"><Calendar size={9}/> Thu 22 May</span>
                  <span className="flex items-center gap-1 text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-0.5 rounded-full"><Clock size={9}/> 10:30 AM</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => showToast('Video call starting...')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                  style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 3px 10px rgba(15,118,110,.4)' }}>
                  <Video size={14} className="text-white" />
                </button>
                <button onClick={() => showToast('Calling +230 405 2000...')}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-transform">
                  <Phone size={14} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming lab test */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-slate-800 text-[13px] font-bold">Upcoming Lab Test</h2>
            <button onClick={() => setScreen('labs')} className="text-teal-600 text-[11px] font-bold active:scale-95 transition-transform">See all →</button>
          </div>
          <button onClick={() => openSheet({ type: 'lab', data: LABS[0] })}
            className="w-full rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg,#F0FDFA,#EFF6FF)', border: '1px solid #99F6E4' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}>
                <FlaskConical size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-[13px] font-bold">Lipid Panel + CBC</p>
                <p className="text-slate-500 text-[11px]">Lancet Labo Mauritius · Port Louis</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-cyan-600 text-[10px] font-bold bg-cyan-100 px-2 py-0.5 rounded-full"><Calendar size={9}/> Fri 23 May</span>
                  <span className="flex items-center gap-1 text-cyan-600 text-[10px] font-bold bg-cyan-100 px-2 py-0.5 rounded-full"><Clock size={9}/> 7:30 AM</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full flex-shrink-0">Fasting</span>
            </div>
          </button>
        </div>

        {/* Medications */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-slate-800 text-[13px] font-bold">Today's Medications</h2>
            <button onClick={() => showToast('Add medication coming soon')}
              className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)' }}>
              <Plus size={13} className="text-white" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #F1F5F9' }}>
            {MEDS.map((med, i) => (
              <div key={med.id} className={`flex items-center gap-3 px-4 py-3.5 ${i<MEDS.length-1?'border-b border-slate-50':''}`}>
                <button onClick={() => openSheet({ type: 'med', data: med })}
                  className={`w-2.5 h-10 rounded-full bg-gradient-to-b ${med.grad} flex-shrink-0 active:scale-90 transition-transform`} />
                <button onClick={() => openSheet({ type: 'med', data: med })} className="flex-1 text-left min-w-0">
                  <p className="text-slate-800 text-[12px] font-bold">{med.name}</p>
                  <p className="text-slate-400 text-[10px]">{med.sub}</p>
                </button>
                <p className="text-slate-500 text-[11px] font-semibold mr-2">{med.time}</p>
                <button onClick={() => toggleMed(med.id)}
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 active:scale-90 transition-all ${takenMeds.includes(med.id)?'bg-emerald-500 border-emerald-500':'border-slate-200 hover:border-slate-300'}`}>
                  {takenMeds.includes(med.id) && <Check size={13} className="text-white" strokeWidth={2.5}/>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Partner network */}
        <div className="mb-4">
          <h2 className="text-slate-800 text-[13px] font-bold mb-3">Our Partner Network</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '6 Hospitals', sub: 'Across Mauritius', icon: Building2, grad: 'from-blue-500 to-cyan-500', screen: 'hospitals' as Screen },
              { label: '5 Laboratories', sub: 'ISO certified', icon: FlaskConical, grad: 'from-cyan-500 to-indigo-500', screen: 'labs' as Screen },
              { label: '50+ Doctors', sub: 'All specialties', icon: Stethoscope, grad: 'from-emerald-500 to-teal-500', screen: 'hospitals' as Screen },
              { label: '8 Test Categories', sub: 'Lab analysis', icon: Microscope, grad: 'from-violet-500 to-purple-500', screen: 'labs' as Screen },
            ].map(({ label, sub, icon: Icon, grad, screen }) => (
              <button key={label} onClick={() => setScreen(screen)}
                className="rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.97] transition-transform"
                style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-slate-800 text-[12px] font-bold leading-tight">{label}</p>
                  <p className="text-slate-400 text-[10px]">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITALS SCREEN (with working area filters)
═══════════════════════════════════════════════════════════════ */
function HospitalsScreen({ search, setSearch, hospitals, startBooking, setScreen, areaFilter, setAreaFilter, openSheet }: any) {
  const areas = ['All','Moka','Beau Bassin','Rose Hill','Flacq','Public']

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-10 pb-6" style={{ background: 'linear-gradient(150deg,#0F766E,#0369A1)', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-[17px] font-bold leading-tight">Find a Hospital</h1>
            <p className="text-white/50 text-[10px]">{hospitals.length} partner hospitals</p>
          </div>
          <button className="w-9 h-9 rounded-2xl flex items-center justify-center ml-auto"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Filter size={16} className="text-white" />
          </button>
        </div>
        <div className="relative mb-3">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Hospital, area, specialty…"
            className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none"
            style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {areas.map(a => (
            <button key={a} onClick={() => setAreaFilter(a)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all"
              style={areaFilter===a?{background:'white',color:'#0F766E'}:{background:'rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.85)',border:'1px solid rgba(255,255,255,0.25)'}}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 pb-4 space-y-3" style={{ background: '#F1F5F9' }}>
        {hospitals.length === 0 && (
          <div className="text-center py-10">
            <Search size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-[13px] font-bold">No hospitals found</p>
            <p className="text-slate-400 text-[11px] mt-1">Try a different area or search term</p>
          </div>
        )}
        {hospitals.map((h: any) => (
          <div key={h.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <div className={`h-1.5 bg-gradient-to-r ${h.accent}`} />
            <button onClick={() => openSheet({ type: 'hospital', data: h })} className="w-full p-4 text-left active:scale-[0.99] transition-transform">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${h.accent} flex items-center justify-center flex-shrink-0`}
                  style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                  <HospitalIllustration />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">{h.tag}</span>
                    <span className="text-[10px] text-slate-400">{h.type}</span>
                  </div>
                  <h3 className="text-slate-800 text-[14px] font-bold leading-tight">{h.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-slate-400" />
                    <span className="text-slate-400 text-[11px]">{h.area}, Mauritius</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-slate-500"><span className="font-semibold text-slate-700">{h.beds}</span> beds</span>
                    <span className="text-[10px] text-slate-500"><span className="font-semibold text-slate-700">{h.specialists}</span> specialists</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-[13px] font-bold text-slate-800">{h.rating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)' }}>{h.grade}</span>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2 px-4 pb-3 pt-0">
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5">
                <Clock size={10} className="text-teal-600" />
                <span className="text-[11px] text-slate-600 font-medium">{h.wait}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5">
                <Activity size={10} className="text-teal-600" />
                <span className="text-[11px] text-slate-600 font-medium">From {h.fee}</span>
              </div>
              <button onClick={() => startBooking(h)}
                className="ml-auto px-4 py-2 rounded-xl text-white text-[12px] font-bold active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 3px 12px rgba(15,118,110,0.4)' }}>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LABS SCREEN (test items now clickable for detail)
═══════════════════════════════════════════════════════════════ */
function LabsScreen({ search, setSearch, labs, tests, startBooking, setScreen, openSheet }: any) {
  const [activeTab, setActiveTab] = useState<'labs'|'tests'>('labs')

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-10 pb-6" style={{ background: 'linear-gradient(150deg,#0891B2,#6366F1)', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-[17px] font-bold leading-tight">Laboratories</h1>
            <p className="text-white/50 text-[10px]">{labs.length} ISO-certified partner labs</p>
          </div>
        </div>

        <div className="h-14 mb-4 opacity-60"><LabIllustration /></div>

        <div className="relative mb-3">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e: any) => setSearch(e.target.value)} placeholder="Lab name, area, test category…"
            className="w-full rounded-2xl pl-11 pr-4 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none"
            style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
        </div>

        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {([['labs','Laboratories'],['tests','Browse Tests']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={activeTab===id?{background:'white',color:'#0891B2',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}:{color:'rgba(255,255,255,0.7)'}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-4" style={{ background: '#F1F5F9' }}>
        {activeTab === 'labs' && (
          <div className="space-y-3">
            {labs.map((lab: any) => (
              <div key={lab.id} className="rounded-2xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                <div className={`h-1.5 bg-gradient-to-r ${lab.accent}`} />
                <button onClick={() => openSheet({ type: 'lab', data: lab })} className="w-full p-4 text-left active:scale-[0.99] transition-transform">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lab.accent} flex items-center justify-center flex-shrink-0`}
                      style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                      <FlaskConical size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{lab.certified}</span>
                        {lab.homeVisit && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Home visit</span>}
                      </div>
                      <h3 className="text-slate-800 text-[14px] font-bold leading-tight">{lab.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-slate-400" />
                        <span className="text-slate-400 text-[11px]">{lab.area}, Mauritius</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {lab.categories.slice(0,3).map((cat: string) => (
                          <span key={cat} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{cat}</span>
                        ))}
                        {lab.categories.length > 3 && <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">+{lab.categories.length-3}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-[13px] font-bold text-slate-800">{lab.rating}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>{lab.grade}</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2 px-4 pb-3 pt-0">
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-2.5 py-1.5">
                    <Clock size={10} className="text-indigo-500" />
                    <span className="text-[11px] text-slate-600 font-medium">{lab.turnaround}</span>
                  </div>
                  {lab.onlineResults && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 rounded-xl px-2.5 py-1.5">
                      <Zap size={10} className="text-emerald-600" />
                      <span className="text-[11px] text-emerald-700 font-semibold">Online results</span>
                    </div>
                  )}
                  <button onClick={() => startBooking(lab)}
                    className="ml-auto px-4 py-2 rounded-xl text-white text-[12px] font-bold active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)', boxShadow: '0 3px 12px rgba(99,102,241,0.4)' }}>
                    Book Tests
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-2.5">
            <p className="text-slate-400 text-[11px] font-semibold">{tests.length} tests available — tap any test to learn more</p>
            {tests.map((test: any) => {
              const Icon = test.icon
              return (
                <button key={test.id} onClick={() => openSheet({ type: 'test', data: test })}
                  className="w-full rounded-2xl p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                  <div className={`w-10 h-10 rounded-xl ${test.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-[13px] font-bold leading-tight">{test.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{test.category}</span>
                      {test.fasting && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Fasting</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-800 text-[13px] font-bold">{test.price}</p>
                    <p className="text-slate-400 text-[10px]">{test.turnaround}</p>
                  </div>
                  <Info size={16} className="text-slate-300 flex-shrink-0 ml-1" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HOSPITAL BOOKING SCREEN (doctor detail on tap)
═══════════════════════════════════════════════════════════════ */
function HospitalBookingScreen({ hospital, step, setStep, doctor, setDoctor, time, setTime, date, setDate, onConfirm, confirmed, setScreen, openSheet }: any) {
  return (
    <div className="flex flex-col" style={{ background: '#F1F5F9', minHeight: '100%' }}>
      <div className="px-5 pt-10 pb-5" style={{ background: confirmed ? 'linear-gradient(150deg,#059669,#0D9488)' : 'linear-gradient(150deg,#0F766E,#0369A1)', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => confirmed ? setScreen('home') : (step > 1 ? setStep(step-1) : setScreen('hospitals'))}
            className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-[17px] font-bold flex-1">{confirmed ? 'Confirmed!' : 'Book Appointment'}</h1>
        </div>
        {!confirmed && (
          <>
            <div className="flex items-center gap-2 mb-3">
              {[1,2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${step>=s?'bg-white text-teal-700':'text-white/60'}`}
                    style={step<s?{background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)'}:{boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                    {step>s?<Check size={13} strokeWidth={3}/>:s}
                  </div>
                  {s<2 && <div className={`h-0.5 w-12 rounded-full ${step>s?'bg-white':'bg-white/25'}`}/>}
                </div>
              ))}
              <span className="text-white/55 text-[11px] ml-1">{step===1?'Doctor & Time':'Confirm & Pay'}</span>
            </div>
            {hospital && (
              <div className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <Building2 size={14} className="text-white/70" />
                <div>
                  <p className="text-white text-[12px] font-bold">{hospital.name}</p>
                  <p className="text-white/55 text-[10px]">{hospital.area} · From {hospital.fee}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 px-5 py-5">
        {step===1 && !confirmed && (
          <div className="fade-up space-y-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DATES.map(d => {
                  const active = date===`${d.short} ${d.num}`
                  return (
                    <button key={d.num} onClick={() => setDate(`${d.short} ${d.num}`)}
                      className="flex-shrink-0 flex flex-col items-center px-3.5 py-3 rounded-2xl border active:scale-95 transition-all"
                      style={active?{background:'linear-gradient(135deg,#0F766E,#0369A1)',borderColor:'transparent',boxShadow:'0 4px 14px rgba(15,118,110,0.45)',color:'white'}:{background:'white',borderColor:'#F1F5F9',color:'#64748B'}}>
                      <span className="text-[9px] font-semibold opacity-60 mb-0.5">{d.short}</span>
                      <span className="text-[16px] font-bold">{d.num}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose Doctor</p>
                <p className="text-[10px] text-teal-600 font-semibold">Tap for details</p>
              </div>
              {DOCTORS.map(d => (
                <div key={d.id} className="mb-2">
                  <button onClick={() => setDoctor(d)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${doctor?.id===d.id?'':'hover:bg-slate-50'}`}
                    style={doctor?.id===d.id?{background:'linear-gradient(135deg,#F0F9FF,#EEF2FF)',border:'1.5px solid #BAE6FD',boxShadow:'0 2px 12px rgba(15,118,110,0.1)'}:{background:'white',border:'1.5px solid #F1F5F9'}}>
                    <div className={`w-11 h-11 rounded-2xl ${d.color} flex items-center justify-center flex-shrink-0`}
                      style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}>
                      <span className="text-white text-[13px] font-bold">{d.initials}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-slate-800 text-[13px] font-bold">{d.name}</p>
                      <p className="text-slate-400 text-[11px]">{d.specialty} · {d.exp}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openSheet({ type: 'doctor', data: d }) }}
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform mr-1">
                      <Info size={13} className="text-slate-400" />
                    </button>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${doctor?.id===d.id?'bg-teal-500 border-teal-500':'border-slate-200'}`}>
                      {doctor?.id===d.id && <Check size={12} className="text-white" strokeWidth={3}/>}
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {doctor && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Available Slots</p>
                <div className="flex gap-2 flex-wrap">
                  {doctor.available.map((t: string) => (
                    <button key={t} onClick={() => setTime(t)}
                      className="px-4 py-2.5 rounded-2xl text-[12px] font-bold active:scale-95 transition-all"
                      style={time===t?{background:'linear-gradient(135deg,#0F766E,#0369A1)',color:'white',boxShadow:'0 3px 12px rgba(15,118,110,0.4)'}:{background:'white',border:'1px solid #F1F5F9',color:'#475569'}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!doctor || !time || !date}
              className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 6px 24px rgba(15,118,110,0.45)' }}>
              Continue →
            </button>
          </div>
        )}
        {step===2 && !confirmed && (
          <div className="fade-up space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Summary</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}>
              <div className={`h-1.5 bg-gradient-to-r ${hospital?.accent}`}/>
              <div className="p-4 space-y-3.5">
                {[
                  {label:'Hospital',value:hospital?.name},
                  {label:'Doctor',value:doctor?.name},
                  {label:'Specialty',value:doctor?.specialty},
                  {label:'Date',value:date?`${date}, May 2026`:''},
                  {label:'Time',value:time},
                  {label:'Consultation Fee',value:hospital?.fee},
                ].map(({label,value}) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-400 text-[12px]">{label}</span>
                    <span className="text-slate-800 text-[13px] font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Payment</p>
              <div className="grid grid-cols-3 gap-2">
                {[{label:'MCB Juice',active:true},{label:'MyT Money',active:false},{label:'Cash',active:false}].map(({label,active}) => (
                  <button key={label} className="py-3 rounded-2xl text-[11px] font-bold border"
                    style={active?{background:'linear-gradient(135deg,#0F766E,#0369A1)',color:'white',borderColor:'transparent',boxShadow:'0 2px 8px rgba(15,118,110,0.35)'}:{background:'white',borderColor:'#F1F5F9',color:'#475569'}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={onConfirm}
              className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg,#059669,#0D9488)', boxShadow: '0 6px 24px rgba(5,150,105,0.45)' }}>
              Confirm & Pay {hospital?.fee}
            </button>
          </div>
        )}
        {confirmed && <BookingConfirmed type="hospital" doctor={doctor} date={date} time={time} provider={hospital} accent={hospital?.accent} setScreen={setScreen}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LAB BOOKING SCREEN (test info on tap)
═══════════════════════════════════════════════════════════════ */
function LabBookingScreen({ lab, step, setStep, tests, selectedTests, toggleTest, date, setDate, homeVisit, setHomeVisit, total, onConfirm, confirmed, setScreen, openSheet }: any) {
  return (
    <div className="flex flex-col" style={{ background: '#F1F5F9', minHeight: '100%' }}>
      <div className="px-5 pt-10 pb-5"
        style={{ background: confirmed ? 'linear-gradient(150deg,#059669,#0D9488)' : 'linear-gradient(150deg,#0891B2,#6366F1)', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => confirmed ? setScreen('home') : (step > 1 ? setStep(step-1) : setScreen('labs'))}
            className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-[17px] font-bold flex-1">{confirmed ? 'Booked!' : 'Book Lab Tests'}</h1>
        </div>
        {!confirmed && (
          <>
            <div className="flex items-center gap-2 mb-3">
              {[1,2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${step>=s?'bg-white text-indigo-700':'text-white/60'}`}
                    style={step<s?{background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)'}:{boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                    {step>s?<Check size={13} strokeWidth={3}/>:s}
                  </div>
                  {s<2 && <div className={`h-0.5 w-12 rounded-full ${step>s?'bg-white':'bg-white/25'}`}/>}
                </div>
              ))}
              <span className="text-white/55 text-[11px] ml-1">{step===1?'Select Tests':'Date & Confirm'}</span>
            </div>
            {lab && (
              <div className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <FlaskConical size={14} className="text-white/70" />
                <div>
                  <p className="text-white text-[12px] font-bold">{lab.name}</p>
                  <p className="text-white/55 text-[10px]">{lab.certified} · {lab.turnaround}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 px-5 py-5">
        {step===1 && !confirmed && (
          <div className="fade-up space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Tests</p>
              {selectedTests.length > 0 && (
                <span className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)' }}>
                  {selectedTests.length} selected · Rs {total.toLocaleString()}
                </span>
              )}
            </div>
            {tests.map((test: any) => {
              const Icon = test.icon
              const active = selectedTests.includes(test.id)
              return (
                <div key={test.id} className="flex gap-2">
                  <button onClick={() => toggleTest(test.id)}
                    className="flex-1 rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all active:scale-[0.99]"
                    style={active?{background:'linear-gradient(135deg,#F0F9FF,#EEF2FF)',border:'1.5px solid #BAE6FD',boxShadow:'0 3px 12px rgba(8,145,178,0.12)'}:{background:'white',border:'1.5px solid #F1F5F9'}}>
                    <div className={`w-10 h-10 rounded-xl ${test.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-[13px] font-bold leading-tight">{test.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{test.category}</span>
                        {test.fasting && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Fasting</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-800 text-[13px] font-bold">{test.price}</p>
                      <p className="text-slate-400 text-[10px]">{test.turnaround}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-1 ${active?'bg-cyan-500 border-cyan-500':'border-slate-200'}`}>
                      {active && <Check size={12} className="text-white" strokeWidth={3}/>}
                    </div>
                  </button>
                  <button onClick={() => openSheet({ type: 'test', data: test })}
                    className="w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
                    <Info size={15} className="text-slate-400" />
                  </button>
                </div>
              )
            })}
            <button onClick={() => setStep(2)} disabled={selectedTests.length===0}
              className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#0891B2,#6366F1)', boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}>
              Continue → {selectedTests.length > 0 && `(${selectedTests.length} tests)`}
            </button>
          </div>
        )}

        {step===2 && !confirmed && (
          <div className="fade-up space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Collection</p>
            <div>
              <p className="text-slate-600 text-[12px] font-semibold mb-2">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DATES.map(d => {
                  const active = date===`${d.short} ${d.num}`
                  return (
                    <button key={d.num} onClick={() => setDate(`${d.short} ${d.num}`)}
                      className="flex-shrink-0 flex flex-col items-center px-3.5 py-3 rounded-2xl border active:scale-95 transition-all"
                      style={active?{background:'linear-gradient(135deg,#0891B2,#6366F1)',borderColor:'transparent',boxShadow:'0 4px 14px rgba(99,102,241,0.45)',color:'white'}:{background:'white',borderColor:'#F1F5F9',color:'#64748B'}}>
                      <span className="text-[9px] font-semibold opacity-60 mb-0.5">{d.short}</span>
                      <span className="text-[16px] font-bold">{d.num}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {lab?.homeVisit && (
              <div>
                <p className="text-slate-600 text-[12px] font-semibold mb-2">Collection Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{label:'Visit Lab',sub:'Walk-in',icon:Building2,val:false},{label:'Home Visit',sub:'+Rs 300',icon:Users,val:true}].map(opt => (
                    <button key={opt.label} onClick={() => setHomeVisit(opt.val)}
                      className="p-3 rounded-2xl border flex items-center gap-2.5 transition-all"
                      style={homeVisit===opt.val?{background:'linear-gradient(135deg,#F0F9FF,#EEF2FF)',border:'1.5px solid #BAE6FD',boxShadow:'0 2px 8px rgba(8,145,178,0.12)'}:{background:'white',border:'1.5px solid #F1F5F9'}}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${homeVisit===opt.val?'bg-cyan-100':'bg-slate-100'}`}>
                        <opt.icon size={16} className={homeVisit===opt.val?'text-cyan-600':'text-slate-400'} />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-800 text-[12px] font-bold">{opt.label}</p>
                        <p className="text-slate-400 text-[10px]">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}>
              <div className={`h-1.5 bg-gradient-to-r ${lab?.accent}`}/>
              <div className="p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Lab</span><span className="text-slate-800 text-[12px] font-bold">{lab?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Tests</span><span className="text-slate-800 text-[12px] font-bold">{selectedTests.length} selected</span></div>
                <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Date</span><span className="text-slate-800 text-[12px] font-bold">{date?`${date}, May 2026`:'-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Collection</span><span className="text-slate-800 text-[12px] font-bold">{homeVisit?'Home Visit':'Walk-in'}</span></div>
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <span className="text-slate-700 text-[13px] font-bold">Total</span>
                  <span className="text-slate-800 text-[15px] font-bold">Rs {(total + (homeVisit?300:0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button onClick={onConfirm} disabled={!date}
              className="w-full text-white font-bold py-4 rounded-2xl text-[14px] active:scale-[0.98] transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#059669,#0D9488)', boxShadow: '0 6px 24px rgba(5,150,105,0.45)' }}>
              Confirm & Pay Rs {(total + (homeVisit?300:0)).toLocaleString()}
            </button>
          </div>
        )}
        {confirmed && <BookingConfirmed type="lab" date={date} provider={lab} accent={lab?.accent} setScreen={setScreen}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BOOKING CONFIRMED (shared)
═══════════════════════════════════════════════════════════════ */
function BookingConfirmed({ type, doctor, date, time, provider, accent, setScreen }: any) {
  return (
    <div className="flex flex-col items-center pt-4 text-center fade-up">
      <div className="relative w-24 h-24 mb-5">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center" style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
          <Check size={38} className="text-emerald-500" strokeWidth={2.5}/>
        </div>
      </div>
      <h2 className="text-slate-800 text-[22px] font-bold mb-1">You're all set!</h2>
      <p className="text-slate-500 text-[13px] leading-relaxed mb-6 max-w-[220px]">
        {type==='lab' ? 'Your lab tests have been booked.' : 'Your appointment is confirmed.'}
      </p>
      <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ background: 'white', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}>
        <div className={`h-1.5 bg-gradient-to-r ${accent}`}/>
        <div className="p-4 space-y-3">
          {type==='hospital' && doctor && <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Doctor</span><span className="text-slate-800 text-[12px] font-bold">{doctor.name}</span></div>}
          <div className="flex justify-between"><span className="text-slate-400 text-[12px]">{type==='lab'?'Laboratory':'Hospital'}</span><span className="text-slate-800 text-[12px] font-bold">{provider?.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Date</span><span className="text-slate-800 text-[12px] font-bold">{date}, May 2026</span></div>
          {time && <div className="flex justify-between"><span className="text-slate-400 text-[12px]">Time</span><span className="text-slate-800 text-[12px] font-bold">{time}</span></div>}
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl text-[13px] active:scale-95 transition-transform">Add to Calendar</button>
        <button onClick={() => setScreen('home')}
          className="flex-1 text-white font-bold py-3.5 rounded-2xl text-[13px] active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 4px 18px rgba(15,118,110,0.4)' }}>
          Done
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RECORDS SCREEN (record detail on tap)
═══════════════════════════════════════════════════════════════ */
function RecordsScreen({ setScreen, openSheet }: any) {
  const [activeTab, setActiveTab] = useState<'all'|'hospital'|'lab'>('all')
  const filtered = activeTab==='all' ? RECORDS : RECORDS.filter(r => r.providerType===activeTab)

  const statusColor: Record<string,string> = {
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Normal': 'bg-blue-100 text-blue-700',
    'Attention': 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="flex flex-col" style={{ background: '#F1F5F9', minHeight: '100%' }}>
      <div className="px-5 pt-10 pb-5" style={{ background: 'linear-gradient(150deg,#1D4ED8,#0F766E)', borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-[17px] font-bold flex-1">Medical Records</h1>
          <button className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'white' }}>
            <Plus size={16} className="text-blue-700" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {label:'Total',value:'12',icon:FileText},
            {label:'Hospital',value:'7',icon:Building2},
            {label:'Lab',value:'5',icon:FlaskConical},
            {label:'Attention',value:'1',icon:AlertCircle},
          ].map(({label,value,icon:Icon}) => (
            <div key={label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Icon size={13} className="text-white/70 mx-auto mb-1" />
              <p className="text-white font-bold text-[15px] leading-none">{value}</p>
              <p className="text-white/45 text-[9px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {([['all','All Records'],['hospital','Hospital'],['lab','Laboratory']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
              style={activeTab===id?{background:'white',color:'#1D4ED8',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}:{color:'rgba(255,255,255,0.65)'}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Timeline — tap for details</p>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-12 w-px" style={{ background: 'linear-gradient(to bottom,#CBD5E1,transparent)' }} />
          <div className="space-y-3.5">
            {filtered.map(r => {
              const Icon = r.icon
              return (
                <button key={r.id} onClick={() => openSheet({ type: 'record', data: r })}
                  className="w-full flex gap-3 fade-up text-left active:scale-[0.98] transition-transform">
                  <div className={`w-10 h-10 rounded-2xl ${r.accent} flex items-center justify-center flex-shrink-0 z-10`}
                    style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className={`flex-1 rounded-2xl p-3.5 ${r.light} border ${r.border}`}
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold ${r.text} bg-white/70 px-2 py-0.5 rounded-full`}>{r.type}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusColor[r.status] ?? 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{r.date}</span>
                        </div>
                        <p className="text-slate-800 text-[13px] font-bold leading-snug line-clamp-2">{r.summary}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className={`w-5 h-5 rounded-lg ${r.accent} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-[8px] font-bold">{r.initials}</span>
                          </div>
                          <span className="text-slate-500 text-[11px] font-medium">{r.by}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ${r.providerType==='lab'?'bg-indigo-100 text-indigo-600':'bg-teal-100 text-teal-600'}`}>
                            {r.providerType==='lab'?'Lab':'Hospital'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#F0FDF4,#ECFEFF)', border: '1.5px dashed #6EE7B7' }}>
          <Award size={20} className="text-teal-500 mx-auto mb-1.5" />
          <p className="text-teal-700 text-[12px] font-bold">Health streak: 3 months</p>
          <p className="text-teal-500/80 text-[10px] mt-0.5">Regular check-ups keep you ahead</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE SCREEN (settings rows functional)
═══════════════════════════════════════════════════════════════ */
function ProfileScreen({ showToast, openSheet: _openSheet }: any) {
  return (
    <div className="flex flex-col" style={{ background: '#F1F5F9', minHeight: '100%' }}>
      <div className="px-5 pt-10 pb-8" style={{ background: 'linear-gradient(150deg,#1E293B,#0F172A)', borderRadius: '0 0 32px 32px' }}>
        <div className="flex justify-between items-start mb-5">
          <h1 className="text-white text-[17px] font-bold">My Profile</h1>
          <button onClick={() => showToast('Settings page coming soon')}
            className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Settings size={16} className="text-white/70" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)', boxShadow: '0 6px 20px rgba(15,118,110,0.45)' }}>
            LJ
          </div>
          <div>
            <h2 className="text-white text-[18px] font-bold">Laurent Jean</h2>
            <p className="text-white/50 text-[12px]">ID: DDC-MU-00142</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold text-white bg-teal-600 px-2 py-0.5 rounded-full">Premium</span>
              <span className="text-[10px] text-white/50">Member since 2025</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}>
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest">Health Info</p>
          </div>
          {[
            {label:'Blood Type',value:'O+',icon:Heart,color:'text-red-500'},
            {label:'Age',value:'34 years',icon:Users,color:'text-blue-500'},
            {label:'Allergies',value:'Penicillin',icon:AlertCircle,color:'text-amber-500'},
            {label:'Insurance',value:'SICOM Health Plan',icon:Shield,color:'text-emerald-500'},
          ].map(({label,value,icon:Icon,color}) => (
            <button key={label} onClick={() => showToast(`${label}: ${value}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 active:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className={color} />
              </div>
              <span className="text-slate-500 text-[12px] flex-1 text-left">{label}</span>
              <span className="text-slate-800 text-[12px] font-bold">{value}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2.5">
            <p className="text-slate-700 text-[12px] font-bold">Family Members</p>
            <button onClick={() => showToast('Add family member coming soon')}
              className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0F766E,#0369A1)' }}>
              <Plus size={13} className="text-white" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              {name:'Marie Jean',relation:'Spouse',initials:'MJ',color:'from-pink-400 to-rose-500'},
              {name:'Théo Jean',relation:'Son · 8',initials:'TJ',color:'from-blue-400 to-cyan-500'},
              {name:'Asha Jean',relation:'Daughter · 5',initials:'AJ',color:'from-violet-400 to-purple-500'},
            ].map(m => (
              <button key={m.name} onClick={() => showToast(`${m.name} · ${m.relation}`)}
                className="flex-shrink-0 w-24 rounded-2xl p-3 text-center active:scale-95 transition-transform"
                style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-1.5`}>
                  <span className="text-white text-[11px] font-bold">{m.initials}</span>
                </div>
                <p className="text-slate-800 text-[11px] font-bold leading-tight">{m.name.split(' ')[0]}</p>
                <p className="text-slate-400 text-[9px]">{m.relation}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}>
          {[
            {label:'Insurance & Payments',icon:CreditCard,color:'text-blue-500', msg:'SICOM Health Plan — Active'},
            {label:'Notifications',icon:Bell,color:'text-violet-500', msg:'Notifications enabled'},
            {label:'Privacy & Security',icon:Shield,color:'text-emerald-500', msg:'All data encrypted & HIPAA compliant'},
            {label:'Language / Langue',icon:Info,color:'text-amber-500', msg:'English · Switch language coming soon'},
          ].map(({label,icon:Icon,color,msg},i) => (
            <button key={label} onClick={() => showToast(msg)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 ${i<3?'border-b border-slate-50':''} active:bg-slate-50 transition-colors`}>
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className={color} />
              </div>
              <span className="text-slate-800 text-[13px] flex-1 text-left">{label}</span>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg,#F0FDFA,#EFF6FF)', border: '1px solid #BAE6FD' }}>
          <span className="text-2xl">🦤</span>
          <p className="text-slate-700 text-[13px] font-bold mt-1">DodoCare MU</p>
          <p className="text-slate-400 text-[10px]">Powered by JUVA Digital Studio · v1.0.0</p>
          <p className="text-slate-400 text-[10px]">Connecting Mauritius to better health</p>
        </div>

        <button onClick={() => showToast('Signed out successfully')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
          <LogOut size={16} className="text-red-500" />
          <span className="text-red-500 text-[13px] font-bold">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAV (5 tabs)
═══════════════════════════════════════════════════════════════ */
function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'hospitals' as Screen, icon: Building2, label: 'Hospitals' },
    { id: 'labs' as Screen, icon: FlaskConical, label: 'Labs' },
    { id: 'records' as Screen, icon: FileText, label: 'Records' },
    { id: 'profile' as Screen, icon: Users, label: 'Profile' },
  ]
  return (
    <div className="flex-shrink-0 px-2 pt-2 pb-5"
      style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 -6px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex justify-around items-center">
        {items.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setScreen(id)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all active:scale-95 relative"
            style={screen === id ? { background: 'linear-gradient(135deg,#F0FDFA,#EFF6FF)' } : {}}>
            <Icon size={20} strokeWidth={screen===id?2.2:1.7}
              className={screen===id?'text-teal-600':'text-slate-400'} />
            <span className={`text-[9px] font-bold ${screen===id?'text-teal-600':'text-slate-400'}`}>{label}</span>
            {id==='labs' && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border border-white"/>}
          </button>
        ))}
      </div>
    </div>
  )
}
