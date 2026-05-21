import { useState, useEffect, useCallback } from 'react'
import {
  Building2, FlaskConical, Stethoscope, LogOut, Plus, Save, ChevronRight,
  FileText, Sparkles, X, Check, AlertCircle, Eye, EyeOff,
  ArrowLeft, Trash2, Clock, Shield, Star,
  TestTube, Menu, Home
} from 'lucide-react'
import {
  supabase, signUp, signIn, signOut, getProfile,
  fetchMyHospitals, fetchMyLaboratories, fetchMyDoctors,
  upsertHospital, upsertLaboratory, upsertDoctor, upsertLabTest,
  type ProviderProfile, type ProviderRole,
  type Hospital, type Laboratory, type Doctor, type LabTest
} from '../lib/supabase'

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type AdminScreen =
  | 'dashboard'
  | 'hospitals' | 'hospital-form'
  | 'labs' | 'lab-form'
  | 'doctors' | 'doctor-form'
  | 'tests' | 'test-form'
  | 'document-paste'

/* ═══════════════════════════════════════════════════════════════
   PARSE DOCUMENT WITH AI (client-side for now)
═══════════════════════════════════════════════════════════════ */
function parseDocumentLocally(text: string, entityType: string): Record<string, unknown> {
  // Smart regex-based extraction as fallback when no AI API key
  const extract = (patterns: RegExp[]): string => {
    for (const p of patterns) {
      const m = text.match(p)
      if (m) return m[1]?.trim() || m[0]?.trim()
    }
    return ''
  }

  const extractList = (label: string): string[] => {
    const re = new RegExp(`${label}[:\\s]*([^\\n]+(?:\\n\\s*[-•]\\s*[^\\n]+)*)`, 'i')
    const m = text.match(re)
    if (!m) return []
    return m[1].split(/[,;\n]/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
  }

  if (entityType === 'hospital') {
    return {
      name: extract([/(?:hospital|clinic|centre|center)\s*(?:name)?[:\s]*([^\n]+)/i, /^([A-Z][^\n]{3,60})/m]),
      area: extract([/(?:area|location|district|city)[:\s]*([^\n]+)/i]),
      type: extract([/(?:type|category)[:\s]*(Private|Public|Specialist)/i]) || 'Private',
      fee: extract([/(?:fee|consultation|price|cost)[:\s]*(Rs[\s\d,.]+|\d+)/i]),
      beds: parseInt(extract([/(\d+)\s*beds/i])) || 0,
      specialists: parseInt(extract([/(\d+)\s*(?:specialists?|doctors?)/i])) || 0,
      description: extract([/(?:description|about|overview)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i]),
      services: extractList('services'),
      hours: extract([/(?:hours|opening|schedule|timing)[:\s]*([^\n]+)/i]),
      phone: extract([/(?:phone|tel|contact|call)[:\s]*([\d+\s()-]+)/i]),
      address: extract([/(?:address|location|situated)[:\s]*([^\n]+)/i]),
      insurance: extractList('insurance'),
      parking: extract([/(?:parking)[:\s]*([^\n]+)/i]),
    }
  }

  if (entityType === 'lab') {
    return {
      name: extract([/(?:lab|laboratory|labo)\s*(?:name)?[:\s]*([^\n]+)/i, /^([A-Z][^\n]{3,60})/m]),
      area: extract([/(?:area|location|district)[:\s]*([^\n]+)/i]),
      certified: extract([/(?:certif|accredit|iso)[:\s]*([^\n]+)/i]),
      turnaround: extract([/(?:turnaround|result|delivery)[:\s]*([^\n]+)/i]),
      categories: extractList('categories|specialties|tests offered'),
      description: extract([/(?:description|about|overview)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i]),
      hours: extract([/(?:hours|opening|schedule)[:\s]*([^\n]+)/i]),
      phone: extract([/(?:phone|tel|contact)[:\s]*([\d+\s()-]+)/i]),
      address: extract([/(?:address|location)[:\s]*([^\n]+)/i]),
      home_visit: /home\s*visit|domicile/i.test(text),
      online_results: /online|app|portal|email|sms/i.test(text),
    }
  }

  if (entityType === 'doctor') {
    return {
      name: extract([/(?:dr\.?|doctor)\s*([^\n,]+)/i]),
      specialty: extract([/(?:specialty|speciality|specialisation|field)[:\s]*([^\n]+)/i]),
      qualifications: extract([/(?:qualif|degree|education|mbbs|md)[:\s]*([^\n]+)/i]),
      experience: extract([/(\d+)\s*(?:years?|yrs?)/i]) ? extract([/(\d+)\s*(?:years?|yrs?)/i]) + ' yrs' : '',
      bio: extract([/(?:bio|about|profile|summary)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i]),
      languages: extractList('languages?'),
      hospital_name: extract([/(?:hospital|clinic|works at|affiliated)[:\s]*([^\n]+)/i]),
      available: extractList('available|schedule|slots'),
    }
  }

  if (entityType === 'test') {
    return {
      name: extract([/(?:test|exam)\s*(?:name)?[:\s]*([^\n]+)/i, /^([A-Z][^\n]{3,80})/m]),
      category: extract([/(?:category|department|type)[:\s]*([^\n]+)/i]),
      price: extract([/(?:price|fee|cost)[:\s]*(Rs[\s\d,.]+|\d+)/i]),
      fasting: /fasting\s*(?:required|needed|yes)/i.test(text),
      turnaround: extract([/(?:turnaround|results? in|delivery)[:\s]*([^\n]+)/i]),
      plain_description: extract([/(?:description|what|about|overview)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i]),
      why_needed: extract([/(?:why|indication|reason|purpose)[:\s]*([^\n]+(?:\n[^\n]+){0,2})/i]),
      preparation: extract([/(?:prep|preparation|before|instruction)[:\s]*([^\n]+(?:\n[^\n]+){0,2})/i]),
      measures: extractList('measures|parameters|values|includes'),
    }
  }

  return {}
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PORTAL COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AdminPortal() {
  // Auth state
  const [user, setUser] = useState<ProviderProfile | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)

  // Auth form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState<ProviderRole>('hospital_admin')
  const [showPw, setShowPw] = useState(false)

  // Navigation
  const [screen, setScreen] = useState<AdminScreen>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Document paste
  const [pasteText, setPasteText] = useState('')
  const [pasteType, setPasteType] = useState<string>('hospital')
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null)
  const [parsing, setParsing] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getProfile()
        setUser(profile)
      } catch {
        // not logged in
      } finally {
        setInitialLoading(false)
      }
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getProfile()
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [h, l, d] = await Promise.all([fetchMyHospitals(), fetchMyLaboratories(), fetchMyDoctors()])
        setHospitals(h)
        setLabs(l)
        setDoctors(d)
      } catch (e) {
        console.error('Failed to load data:', e)
      }
    }
    loadData()
  }, [user])

  /* ── AUTH HANDLERS ── */
  const handleAuth = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'signup') {
        await signUp(email, password, role, fullName, organization)
        showToast('Account created! You can now sign in.')
        setAuthMode('login')
      } else {
        await signIn(email, password)
      }
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setScreen('dashboard')
  }

  /* ── SAVE HANDLERS ── */
  const saveHospital = async () => {
    if (!editingItem) return
    setSaving(true)
    try {
      await upsertHospital(editingItem as Partial<Hospital>)
      setHospitals(await fetchMyHospitals())
      showToast('Hospital saved!')
      setScreen('hospitals')
      setEditingItem(null)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveLab = async () => {
    if (!editingItem) return
    setSaving(true)
    try {
      await upsertLaboratory(editingItem as Partial<Laboratory>)
      setLabs(await fetchMyLaboratories())
      showToast('Laboratory saved!')
      setScreen('labs')
      setEditingItem(null)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveDoctor = async () => {
    if (!editingItem) return
    setSaving(true)
    try {
      await upsertDoctor(editingItem as Partial<Doctor>)
      setDoctors(await fetchMyDoctors())
      showToast('Doctor saved!')
      setScreen('doctors')
      setEditingItem(null)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveTest = async () => {
    if (!editingItem) return
    setSaving(true)
    try {
      await upsertLabTest(editingItem as Partial<LabTest>)
      showToast('Lab test saved!')
      setScreen('tests')
      setEditingItem(null)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  /* ── DOCUMENT PASTE HANDLER ── */
  const handleParse = () => {
    if (!pasteText.trim()) return
    setParsing(true)
    // Simulate small delay for UX
    setTimeout(() => {
      const result = parseDocumentLocally(pasteText, pasteType)
      setParsedData(result)
      setParsing(false)
    }, 800)
  }

  const applyParsedData = () => {
    if (!parsedData) return
    setEditingItem(parsedData)
    if (pasteType === 'hospital') setScreen('hospital-form')
    else if (pasteType === 'lab') setScreen('lab-form')
    else if (pasteType === 'doctor') setScreen('doctor-form')
    else if (pasteType === 'test') setScreen('test-form')
    setParsedData(null)
    setPasteText('')
  }

  /* ── FORM FIELD HELPER ── */
  const F = ({ label, field, type = 'text', placeholder = '', textarea = false, required = false }: {
    label: string; field: string; type?: string; placeholder?: string; textarea?: boolean; required?: boolean
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all resize-none"
          rows={3}
          placeholder={placeholder}
          value={String(editingItem?.[field] ?? '')}
          onChange={e => setEditingItem(prev => ({ ...prev!, [field]: e.target.value }))}
        />
      ) : (
        <input
          type={type}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
          placeholder={placeholder}
          value={String(editingItem?.[field] ?? '')}
          onChange={e => setEditingItem(prev => ({ ...prev!, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        />
      )}
    </div>
  )

  const ArrayF = ({ label, field, placeholder = '' }: { label: string; field: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
        placeholder={placeholder}
        value={Array.isArray(editingItem?.[field]) ? (editingItem![field] as string[]).join(', ') : String(editingItem?.[field] ?? '')}
        onChange={e => setEditingItem(prev => ({ ...prev!, [field]: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
      />
      <p className="text-xs text-slate-400 mt-1">Separate with commas</p>
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════
     RENDER — LOADING
  ═══════════════════════════════════════════════════════════════ */
  if (initialLoading) {
    return (
      <div className="admin-portal min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Loading DodoCare Admin...</p>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER — AUTH SCREEN
  ═══════════════════════════════════════════════════════════════ */
  if (!user) {
    return (
      <div className="admin-portal min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-xl shadow-blue-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">DodoCare Admin</h1>
            <p className="text-blue-300/70">Provider Portal for Hospitals, Labs & Doctors</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError('') }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
              >Sign In</button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError('') }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
              >Create Account</button>
            </div>

            {authError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </div>
            )}

            <div className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1.5">Full Name</label>
                    <input type="text" placeholder="Dr. Jean Dupont" value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1.5">Organization</label>
                    <input type="text" placeholder="Apollo Bramwell Hospital" value={organization} onChange={e => setOrganization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1.5">I am a...</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([['hospital_admin', 'Hospital Admin', Building2], ['lab_admin', 'Lab Admin', FlaskConical], ['doctor', 'Doctor', Stethoscope]] as const).map(([r, label, Icon]) => (
                        <button key={r} onClick={() => setRole(r)}
                          className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all text-sm ${role === r ? 'bg-blue-500/20 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>
                          <Icon className="w-5 h-5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Email</label>
                <input type="email" placeholder="admin@hospital.mu" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none pr-12"
                    onKeyDown={e => e.key === 'Enter' && handleAuth()} />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button onClick={handleAuth} disabled={authLoading || !email || !password}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>

          <p className="text-center text-blue-300/40 text-sm mt-6">
            DodoCare Mauritius — Provider Portal v1.0
          </p>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER — MAIN ADMIN LAYOUT
  ═══════════════════════════════════════════════════════════════ */
  const navItems = [
    { id: 'dashboard' as const, icon: Home, label: 'Dashboard' },
    { id: 'hospitals' as const, icon: Building2, label: 'Hospitals' },
    { id: 'labs' as const, icon: FlaskConical, label: 'Laboratories' },
    { id: 'doctors' as const, icon: Stethoscope, label: 'Doctors' },
    { id: 'tests' as const, icon: TestTube, label: 'Lab Tests' },
    { id: 'document-paste' as const, icon: Sparkles, label: 'Smart Import' },
  ]

  return (
    <div className="admin-portal min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-[fadeIn_0.3s_ease]">
          <Check className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* ── MOBILE TOP BAR ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100">
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">DodoCare Admin</span>
        </div>
        <div className="w-10" />
      </div>

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-[slideIn_0.3s_ease]">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* ── SIDEBAR (desktop) ── */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 shadow-sm z-40">
        {renderSidebar()}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
          {screen === 'dashboard' && renderDashboard()}
          {screen === 'hospitals' && renderList('hospital', hospitals, h => h.name, h => `${h.area} · ${h.type}`, h => h.rating)}
          {screen === 'hospital-form' && renderHospitalForm()}
          {screen === 'labs' && renderList('lab', labs, l => l.name, l => `${l.area} · ${l.certified}`, l => l.rating)}
          {screen === 'lab-form' && renderLabForm()}
          {screen === 'doctors' && renderList('doctor', doctors, d => d.name, d => `${d.specialty} · ${d.experience}`, () => 0)}
          {screen === 'doctor-form' && renderDoctorForm()}
          {screen === 'tests' && renderTestForm()}
          {screen === 'test-form' && renderTestForm()}
          {screen === 'document-paste' && renderDocumentPaste()}
        </div>
      </div>
    </div>
  )

  /* ─────────── SIDEBAR ─────────── */
  function renderSidebar() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">DodoCare</h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Provider info */}
        <div className="mx-4 mb-4 p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              {user!.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user!.full_name}</p>
              <p className="text-xs text-blue-600 capitalize">{user!.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => {
            const active = screen === id || screen.startsWith(id.replace(/s$/, '') + '-')
            return (
              <button key={id} onClick={() => { setScreen(id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon className="w-5 h-5" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    )
  }

  /* ─────────── DASHBOARD ─────────── */
  function renderDashboard() {
    const stats = [
      { label: 'Hospitals', count: hospitals.length, icon: Building2, color: 'from-blue-500 to-cyan-500', screen: 'hospitals' as const },
      { label: 'Laboratories', count: labs.length, icon: FlaskConical, color: 'from-violet-500 to-purple-500', screen: 'labs' as const },
      { label: 'Doctors', count: doctors.length, icon: Stethoscope, color: 'from-emerald-500 to-teal-500', screen: 'doctors' as const },
    ]

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome back, {user!.full_name.split(' ')[0]}</h2>
          <p className="text-slate-500 mt-1">Manage your healthcare facilities and providers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(s => (
            <button key={s.label} onClick={() => setScreen(s.screen)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{s.count}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Add Hospital', icon: Building2, color: 'blue', action: () => { setEditingItem({}); setScreen('hospital-form') } },
              { label: 'Add Laboratory', icon: FlaskConical, color: 'violet', action: () => { setEditingItem({}); setScreen('lab-form') } },
              { label: 'Add Doctor', icon: Stethoscope, color: 'emerald', action: () => { setEditingItem({}); setScreen('doctor-form') } },
              { label: 'Smart Import (Paste Document)', icon: Sparkles, color: 'amber', action: () => setScreen('document-paste') },
            ].map(a => (
              <button key={a.label} onClick={a.action}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group">
                <div className={`w-11 h-11 rounded-xl bg-${a.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <a.icon className={`w-5 h-5 text-${a.color}-500`} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{a.label}</p>
                  <p className="text-xs text-slate-400">Click to get started</p>
                </div>
                <Plus className="w-5 h-5 text-slate-300 ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Tip card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">Smart Import</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Have a brochure, certificate, or document about your facility? Just paste the text and our AI will automatically extract all the details into the correct fields. No manual typing needed!
              </p>
              <button onClick={() => setScreen('document-paste')}
                className="mt-4 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm">
                Try Smart Import →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────── GENERIC LIST ─────────── */
  function renderList<T extends { id: number }>(
    type: 'hospital' | 'lab' | 'doctor',
    items: T[],
    getName: (i: T) => string,
    getSub: (i: T) => string,
    getRating: (i: T) => number
  ) {
    const labels = { hospital: 'Hospital', lab: 'Laboratory', doctor: 'Doctor' }
    const icons = { hospital: Building2, lab: FlaskConical, doctor: Stethoscope }
    const colors = { hospital: 'blue', lab: 'violet', doctor: 'emerald' }
    const Icon = icons[type]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My {labels[type]}s</h2>
            <p className="text-slate-500 text-sm mt-1">{items.length} registered</p>
          </div>
          <button onClick={() => { setEditingItem({}); setScreen(`${type}-form` as AdminScreen) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-${colors[type]}-500 text-white font-semibold shadow-lg shadow-${colors[type]}-500/20 hover:shadow-${colors[type]}-500/40 transition-all`}>
            <Plus className="w-4 h-4" /> Add {labels[type]}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No {labels[type].toLowerCase()}s added yet</p>
            <p className="text-slate-400 text-sm mt-1">Click the button above or use Smart Import to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <button key={item.id} onClick={() => { setEditingItem(item as Record<string, unknown>); setScreen(`${type}-form` as AdminScreen) }}
                className="w-full bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all text-left flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-xl bg-${colors[type]}-50 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${colors[type]}-500`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{getName(item)}</p>
                  <p className="text-sm text-slate-400">{getSub(item)}</p>
                </div>
                {getRating(item) > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{getRating(item)}</span>
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ─────────── HOSPITAL FORM ─────────── */
  function renderHospitalForm() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setScreen('hospitals'); setEditingItem(null) }} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{editingItem?.id ? 'Edit' : 'Add'} Hospital</h2>
            <p className="text-slate-500 text-sm">Fill in the details or use Smart Import</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-500" /> Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Hospital Name" field="name" placeholder="Apollo Bramwell" required />
            <F label="Area / District" field="area" placeholder="Moka" required />
            <F label="Type" field="type" placeholder="Private / Public / Specialist" />
            <F label="Consultation Fee" field="fee" placeholder="Rs 1,200" required />
            <F label="Average Wait Time" field="wait" placeholder="~15 min" />
            <F label="Main Specialty Tag" field="tag" placeholder="Cardiology" />
            <F label="Grade" field="grade" placeholder="A+" />
            <F label="Number of Beds" field="beds" type="number" placeholder="200" />
            <F label="Number of Specialists" field="specialists" type="number" placeholder="45" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Details</h3>
          <F label="Description" field="description" textarea placeholder="Tell patients about your facility..." />
          <ArrayF label="Services Offered" field="services" placeholder="Cardiology, Oncology, Emergency 24/7" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Opening Hours" field="hours" placeholder="Open 24/7" />
            <F label="Phone Number" field="phone" placeholder="+230 405 2000" />
          </div>
          <F label="Full Address" field="address" placeholder="Riche Terre, Moka District" />
          <ArrayF label="Accepted Insurance" field="insurance" placeholder="NIC, Swan, Anglo, Jubilee" />
          <F label="Parking Info" field="parking" placeholder="Free parking available" />
        </div>

        <div className="flex gap-3">
          <button onClick={saveHospital} disabled={saving || !editingItem?.name}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50">
            {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Hospital'}
          </button>
          {editingItem?.id != null && (
            <button onClick={() => { setEditingItem(prev => ({ ...prev!, is_active: false })); saveHospital() }}
              className="px-5 py-3.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ─────────── LAB FORM ─────────── */
  function renderLabForm() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setScreen('labs'); setEditingItem(null) }} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{editingItem?.id ? 'Edit' : 'Add'} Laboratory</h2>
            <p className="text-slate-500 text-sm">Enter your lab details</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-violet-500" /> Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Laboratory Name" field="name" placeholder="Lancet Labo Mauritius" required />
            <F label="Area" field="area" placeholder="Port Louis" required />
            <F label="Certification" field="certified" placeholder="ISO 15189" />
            <F label="Typical Turnaround" field="turnaround" placeholder="4-6 hrs" />
            <F label="Grade" field="grade" placeholder="A+" />
          </div>
          <ArrayF label="Test Categories" field="categories" placeholder="Haematology, Biochemistry, Microbiology" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-500" /> Details</h3>
          <F label="Description" field="description" textarea placeholder="Tell patients about your lab..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Opening Hours" field="hours" placeholder="Mon-Fri 7:00 AM - 5:00 PM" />
            <F label="Phone" field="phone" placeholder="+230 211 8000" />
          </div>
          <F label="Full Address" field="address" placeholder="5 Edith Cavell Street, Port Louis" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input type="checkbox" checked={!!editingItem?.home_visit}
                onChange={e => setEditingItem(prev => ({ ...prev!, home_visit: e.target.checked }))}
                className="w-5 h-5 rounded text-violet-500" />
              <span className="text-sm text-slate-700">Home Visit Available</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input type="checkbox" checked={!!editingItem?.online_results}
                onChange={e => setEditingItem(prev => ({ ...prev!, online_results: e.target.checked }))}
                className="w-5 h-5 rounded text-violet-500" />
              <span className="text-sm text-slate-700">Online Results</span>
            </div>
          </div>
          <F label="Home Visit Fee" field="home_visit_fee" placeholder="Rs 300 additional" />
          <F label="Result Delivery Method" field="result_delivery" placeholder="SMS, email, or app" />
        </div>

        <div className="flex gap-3">
          <button onClick={saveLab} disabled={saving || !editingItem?.name}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all disabled:opacity-50">
            {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Laboratory'}
          </button>
        </div>
      </div>
    )
  }

  /* ─────────── DOCTOR FORM ─────────── */
  function renderDoctorForm() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setScreen('doctors'); setEditingItem(null) }} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{editingItem?.id ? 'Edit' : 'Add'} Doctor</h2>
            <p className="text-slate-500 text-sm">Doctor profile and availability</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-emerald-500" /> Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Full Name" field="name" placeholder="Dr. Priya Ramjuttun" required />
            <F label="Initials" field="initials" placeholder="PR" />
            <F label="Specialty" field="specialty" placeholder="Cardiologist" required />
            <F label="Experience" field="experience" placeholder="14 yrs" />
            <F label="Qualifications" field="qualifications" placeholder="MBBS, MD Cardiology" />
            <F label="Hospital / Clinic" field="hospital_name" placeholder="Apollo Bramwell, Moka" />
          </div>
          <F label="Specialty Description (plain language)" field="specialty_desc" textarea placeholder="Explain what this specialist does in simple terms..." />
          <F label="Bio" field="bio" textarea placeholder="Brief background, training, and areas of expertise..." />
          <ArrayF label="Languages Spoken" field="languages" placeholder="English, French, Creole" />
          <ArrayF label="Available Time Slots" field="available" placeholder="9:00, 10:30, 14:00, 15:30" />
        </div>

        <div className="flex gap-3">
          <button onClick={saveDoctor} disabled={saving || !editingItem?.name}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50">
            {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Doctor'}
          </button>
        </div>
      </div>
    )
  }

  /* ─────────── TEST FORM ─────────── */
  function renderTestForm() {
    if (!editingItem && screen === 'tests') {
      // Show tests list — for now redirect to add
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Lab Tests</h2>
              <p className="text-slate-500 text-sm mt-1">Manage test catalog with plain-language descriptions</p>
            </div>
            <button onClick={() => { setEditingItem({}); setScreen('test-form') }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold shadow-lg">
              <Plus className="w-4 h-4" /> Add Test
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <TestTube className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Add lab tests to your catalog</p>
            <p className="text-slate-400 text-sm mt-1">Each test includes plain-language explanations for patients</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setScreen('tests'); setEditingItem(null) }} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Add Lab Test</h2>
            <p className="text-slate-500 text-sm">Include plain-language descriptions patients can understand</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TestTube className="w-5 h-5 text-cyan-500" /> Test Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="Test Name" field="name" placeholder="Complete Blood Count (CBC)" required />
            <F label="Category" field="category" placeholder="Haematology" required />
            <F label="Price" field="price" placeholder="Rs 450" required />
            <F label="Turnaround Time" field="turnaround" placeholder="4 hrs" />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
            <input type="checkbox" checked={!!editingItem?.fasting}
              onChange={e => setEditingItem(prev => ({ ...prev!, fasting: e.target.checked }))}
              className="w-5 h-5 rounded text-cyan-500" />
            <span className="text-sm text-slate-700">Fasting Required</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Patient-Friendly Description
          </h3>
          <p className="text-sm text-slate-400">Write as if explaining to someone with no medical background</p>
          <F label="What is this test? (plain language)" field="plain_description" textarea placeholder="Counts your 3 types of blood cells. Red cells carry oxygen..." />
          <F label="Why would someone need this test?" field="why_needed" textarea placeholder="Routine checkup, tiredness, recurrent infections..." />
          <F label="How to prepare" field="preparation" textarea placeholder="No fasting needed. You can eat and drink normally." />
          <ArrayF label="What it measures" field="measures" placeholder="Red blood cells, White blood cells, Platelets, Haemoglobin" />
        </div>

        <div className="flex gap-3">
          <button onClick={saveTest} disabled={saving || !editingItem?.name}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50">
            {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Lab Test'}
          </button>
        </div>
      </div>
    )
  }

  /* ─────────── DOCUMENT PASTE (Smart Import) ─────────── */
  function renderDocumentPaste() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Smart Import</h2>
          <p className="text-slate-500 text-sm mt-1">Paste any document text and we'll auto-extract the details</p>
        </div>

        {/* Step 1: Select type */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Step 1 — What are you adding?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ['hospital', 'Hospital', Building2, 'blue'],
              ['lab', 'Laboratory', FlaskConical, 'violet'],
              ['doctor', 'Doctor', Stethoscope, 'emerald'],
              ['test', 'Lab Test', TestTube, 'cyan'],
            ] as const).map(([id, label, Icon, color]) => (
              <button key={id} onClick={() => setPasteType(id)}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${pasteType === id ? `border-${color}-500 bg-${color}-50` : 'border-slate-100 hover:border-slate-200'}`}>
                <Icon className={`w-6 h-6 ${pasteType === id ? `text-${color}-500` : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${pasteType === id ? `text-${color}-700` : 'text-slate-600'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Paste text */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Step 2 — Paste your document</h3>
          <p className="text-sm text-slate-400">Paste a brochure, certificate, website text, Word doc content, or any description of the facility</p>
          <textarea
            className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm"
            rows={10}
            placeholder={`Example for hospital:\n\nHospital Name: Apollo Bramwell\nArea: Moka\nType: Private\nConsultation Fee: Rs 1,200\nBeds: 200\nSpecialists: 45\nServices: Cardiology, Oncology, Neurology, Emergency 24/7\nHours: Open 24/7\nPhone: +230 405 2000\nAddress: Riche Terre, Moka District\nInsurance: NIC, Swan, Anglo, Jubilee\nParking: Free parking available\n\nDescription: Mauritius's most advanced private hospital...`}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <button onClick={handleParse} disabled={parsing || !pasteText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all disabled:opacity-50">
            {parsing ? <Clock className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {parsing ? 'Analyzing...' : 'Extract Details'}
          </button>
        </div>

        {/* Step 3: Review parsed data */}
        {parsedData && (
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 space-y-4">
            <h3 className="font-semibold text-emerald-700 flex items-center gap-2">
              <Check className="w-5 h-5" /> Extracted Data — Review & Apply
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              {Object.entries(parsedData).filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true)).map(([key, value]) => (
                <div key={key} className="flex gap-3 text-sm">
                  <span className="font-medium text-emerald-800 capitalize min-w-[140px]">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-slate-700">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={applyParsedData}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all">
                <Check className="w-5 h-5" /> Use This Data (Edit Form)
              </button>
              <button onClick={() => setParsedData(null)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}
