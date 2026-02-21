import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Settings, Monitor, FlaskConical,
  PenLine, Trash2, AlertTriangle,
  CheckCircle2, ChevronRight, Eye, EyeOff, RotateCcw, Bell,
  Layers,
} from 'lucide-react'
import { clsx } from 'clsx'
import { getCurrentUser, updateProfile, changePassword, deleteAccount } from '@/utils/auth'
import { loadSettings, saveSettings, resetSettings, DEFAULTS, type AppSettings } from '@/utils/settings'
import { applyTheme } from '@/utils/theme'
import { loadHistory } from '@/utils/storage'
import { loadStudents } from '@/utils/students'
import { loadGroups } from '@/utils/groups'
import type { ContentType } from '@/types'

// ——— Toggle switch ———
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-checked={value}
      className={clsx(
        'relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none',
        value ? 'bg-primary-600' : 'bg-gray-300'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
        value ? 'translate-x-6' : 'translate-x-0'
      )} />
    </button>
  )
}

// ——— Setting row ———
function SettingRow({
  label, desc, children,
}: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-gray-800">{label}</p>
        {desc && <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

// ——— Section card ———
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  )
}

// ——— Select ———
function Select<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="text-sm border-2 border-gray-200 rounded-xl px-3 py-1.5 focus:border-primary-500 focus:outline-none bg-white text-gray-700 min-w-[140px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ——— Number slider ———
function Slider({
  value, onChange, min, max, step = 1, unit = '',
}: {
  value: number; onChange: (v: number) => void
  min: number; max: number; step?: number; unit?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-primary-600"
      />
      <span className="text-sm font-semibold text-primary-600 w-12 text-right">{value}{unit}</span>
    </div>
  )
}

// ——— Toast ———
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={clsx(
      'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium',
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    )}>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  )
}

const SECTIONS = [
  { id: 'profile',       label: 'Profil',           icon: User },
  { id: 'general',       label: 'Umumiy',            icon: Settings },
  { id: 'content',       label: 'Kontent',           icon: Monitor },
  { id: 'test',          label: 'Test',              icon: FlaskConical },
  { id: 'practice',      label: 'Amaliyot & Vazifa', icon: PenLine },
  { id: 'students',      label: "O'quvchilar",       icon: Layers },
  { id: 'notifications', label: 'Bildirishnomalar',  icon: Bell },
  { id: 'account',       label: 'Hisob',             icon: AlertTriangle },
]

const CONTENT_TYPES: { type: ContentType; label: string }[] = [
  { type: 'presentation', label: 'Taqdimot' },
  { type: 'test',         label: 'Test' },
  { type: 'game',         label: "O'yin" },
  { type: 'practice',     label: 'Amaliyot' },
  { type: 'homework',     label: 'Uyga vazifa' },
]

// ——— Main ———
export function SettingsPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [active, setActive] = useState('profile')
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Profile state
  const [profName,  setProfName]  = useState(user?.name  ?? '')
  const [profEmail, setProfEmail] = useState(user?.email ?? '')
  const [profSaved, setProfSaved] = useState(false)

  // Password state
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [showOld,  setShowOld]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (key === 'theme') applyTheme(value as AppSettings['theme'])
  }

  const handleSave = () => {
    saveSettings(settings)
    showToast("Sozlamalar saqlandi")
  }

  const handleProfileSave = () => {
    if (!user) return
    const res = updateProfile(user.id, profName, profEmail)
    if ('error' in res) { showToast(res.error, 'error'); return }
    setProfSaved(true)
    showToast("Profil yangilandi")
    setTimeout(() => setProfSaved(false), 2000)
  }

  const handlePasswordChange = () => {
    if (!user) return
    if (!oldPass || !newPass) { showToast("Barcha maydonlarni to'ldiring", 'error'); return }
    const res = changePassword(user.id, oldPass, newPass)
    if ('error' in res) { showToast(res.error, 'error'); return }
    setOldPass(''); setNewPass('')
    showToast("Parol muvaffaqiyatli o'zgartirildi")
  }

  const handleReset = () => {
    resetSettings()
    setSettings({ ...DEFAULTS })
    showToast("Sozlamalar qayta tiklandi")
  }

  const handleClearHistory = () => {
    localStorage.removeItem('ustoz_history')
    showToast("Tarix tozalandi")
  }

  const handleClearStudents = () => {
    localStorage.removeItem('ustoz_students')
    showToast("O'quvchilar ro'yxati tozalandi")
  }

  const handleClearGroups = () => {
    localStorage.removeItem('ustoz_groups')
    showToast("Guruhlar tozalandi")
  }

  const handleExport = () => {
    const data = {
      settings: loadSettings(),
      history: JSON.parse(localStorage.getItem('ustoz_history') ?? '[]'),
      students: JSON.parse(localStorage.getItem('ustoz_students') ?? '[]'),
      groups: JSON.parse(localStorage.getItem('ustoz_groups') ?? '[]'),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ustoz-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Ma'lumotlar eksport qilindi")
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.history)  localStorage.setItem('ustoz_history',  JSON.stringify(data.history))
        if (data.students) localStorage.setItem('ustoz_students', JSON.stringify(data.students))
        if (data.groups)   localStorage.setItem('ustoz_groups',   JSON.stringify(data.groups))
        if (data.settings) { saveSettings({ ...DEFAULTS, ...data.settings }); setSettings({ ...DEFAULTS, ...data.settings }) }
        showToast("Ma'lumotlar import qilindi")
      } catch {
        showToast("Fayl noto'g'ri formatda", 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDeleteAccount = () => {
    if (!user) return
    if (!confirm("Hisob o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.")) return
    deleteAccount(user.id)
    navigate('/login')
  }

  const historyCount  = loadHistory().length
  const studentCount  = loadStudents().length
  const groupCount    = loadGroups().length

  const navClick = (id: string) => {
    setActive(id)
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ilova sozlamalarini boshqaring</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Tiklash
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Saqlash
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* ——— Nav sidebar ——— */}
        <div className="w-[200px] flex-shrink-0 hidden sm:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => navClick(s.id)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-primary-600' : 'text-gray-400')} />
                  <span className="flex-1 truncate">{s.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ——— Mobile tabs ——— */}
        <div className="sm:hidden w-full mb-3 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => navClick(s.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                    active === s.id ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />{s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ——— Content ——— */}
        <div ref={contentRef} className="flex-1 min-w-0 space-y-4">

          {/* ——— PROFILE ——— */}
          {active === 'profile' && (
            <>
              <Section title="Shaxsiy ma'lumotlar">
                <div className="py-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 text-xl font-bold flex-shrink-0">
                      {(profName || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ism</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={profEmail}
                        onChange={(e) => setProfEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleProfileSave}
                    className={clsx(
                      'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      profSaved
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    )}
                  >
                    {profSaved ? 'Saqlandi ✓' : 'Profilni yangilash'}
                  </button>
                </div>
              </Section>

              <Section title="Parolni o'zgartirish">
                <div className="py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Eski parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showOld ? 'text' : 'password'}
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowOld(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Yangi parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Kamida 6 ta belgi"
                        className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                  >
                    Parolni o'zgartirish
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* ——— GENERAL ——— */}
          {active === 'general' && (
            <>
              <Section title="Tillar va interfeys">
                <SettingRow label="Standart til" desc="Kontent yaratishda ishlatiladigan til">
                  <Select
                    value={settings.defaultLanguage}
                    onChange={(v) => set('defaultLanguage', v)}
                    options={[
                      { value: 'uz', label: "O'zbek" },
                      { value: 'ru', label: 'Русский' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Mavzu" desc="Interfeys rangi">
                  <Select
                    value={settings.theme}
                    onChange={(v) => set('theme', v)}
                    options={[
                      { value: 'light', label: "Yorug'" },
                      { value: 'dark',  label: "Qorong'u" },
                      { value: 'system', label: 'Tizim' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Ixcham rejim" desc="Kichikroq interfeys elementlari">
                  <Toggle value={settings.compactMode} onChange={(v) => set('compactMode', v)} />
                </SettingRow>
              </Section>

              <Section title="Standart kontent turlari">
                <div className="py-4">
                  <p className="text-sm text-gray-500 mb-3">Bosh sahifada avtomatik belgilanadigan turlar</p>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(({ type, label }) => {
                      const on = settings.defaultContentTypes.includes(type)
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            const cur = settings.defaultContentTypes
                            set('defaultContentTypes',
                              on ? cur.filter(t => t !== type) : [...cur, type]
                            )
                          }}
                          className={clsx(
                            'px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all',
                            on ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Section>

              <Section title="Animatsiya va ovoz">
                <SettingRow label="Animatsiyalar" desc="Sahifa o'tish animatsiyalari">
                  <Toggle value={settings.animationsEnabled} onChange={(v) => set('animationsEnabled', v)} />
                </SettingRow>
                <SettingRow label="Ovoz effektlari" desc="Tugma bosish va xabarnoma ovozlari">
                  <Toggle value={settings.soundEnabled} onChange={(v) => set('soundEnabled', v)} />
                </SettingRow>
              </Section>
            </>
          )}

          {/* ——— CONTENT ——— */}
          {active === 'content' && (
            <>
              <Section title="Taqdimot sozlamalari">
                <SettingRow label="Slaydlar soni" desc="Har bir taqdimotdagi slaydlar soni">
                  <Slider value={settings.presentationSlideCount} onChange={(v) => set('presentationSlideCount', v)} min={4} max={15} />
                </SettingRow>
                <SettingRow label="Rasmlar" desc="Slaydharda rasmlarni ko'rsatish">
                  <Toggle value={settings.showSlideImages} onChange={(v) => set('showSlideImages', v)} />
                </SettingRow>
                <SettingRow label="Avtomatik o'ynash" desc="Slaydlar o'zi almashinadi">
                  <Toggle value={settings.slidesAutoPlay} onChange={(v) => set('slidesAutoPlay', v)} />
                </SettingRow>
                <SettingRow label="O'tish animatsiyasi" desc="Slaydlar orasidagi o'tish effekti">
                  <Select
                    value={settings.slideTransition}
                    onChange={(v) => set('slideTransition', v)}
                    options={[
                      { value: 'slide', label: 'Siljish' },
                      { value: 'fade',  label: "So'nish" },
                      { value: 'zoom',  label: 'Zoom' },
                    ]}
                  />
                </SettingRow>
              </Section>

              <Section title="Uyga vazifa sozlamalari">
                <SettingRow label="Topshiriqlar soni" desc="Har bir uyga vazifadagi topshiriqlar">
                  <Slider value={settings.homeworkTaskCount} onChange={(v) => set('homeworkTaskCount', v)} min={2} max={15} />
                </SettingRow>
                <SettingRow label="Standart muddati" desc="Uyga vazifa topshirish muddati (kun)">
                  <Slider value={settings.defaultDeadlineDays} onChange={(v) => set('defaultDeadlineDays', v)} min={1} max={14} unit=" kun" />
                </SettingRow>
              </Section>
            </>
          )}

          {/* ——— TEST ——— */}
          {active === 'test' && (
            <>
              <Section title="Test parametrlari">
                <SettingRow label="Savollar soni" desc="Har bir testdagi savollar soni">
                  <Slider value={settings.testQuestionCount} onChange={(v) => set('testQuestionCount', v)} min={5} max={50} />
                </SettingRow>
                <SettingRow label="Vaqt chegarasi" desc="Test uchun ajratilgan vaqt (daqiqa)">
                  <Slider value={settings.testTimeLimit} onChange={(v) => set('testTimeLimit', v)} min={5} max={120} unit=" daq" />
                </SettingRow>
                <SettingRow label="Izohlarni ko'rsatish" desc="To'g'ri javobdan keyin izoh ko'rsatish">
                  <Toggle value={settings.showExplanations} onChange={(v) => set('showExplanations', v)} />
                </SettingRow>
                <SettingRow label="Variantlarni aralashtirish" desc="Javob variantlari tartibini tasodifiy qilish">
                  <Toggle value={settings.shuffleOptions} onChange={(v) => set('shuffleOptions', v)} />
                </SettingRow>
              </Section>

              <Section title="Qiyinlik taqsimoti">
                <div className="py-4 space-y-4">
                  <p className="text-sm text-gray-500">Jami: {settings.testDifficultyEasy + settings.testDifficultyMedium + settings.testDifficultyHard}% (100% bo'lishi kerak)</p>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-emerald-600">Oson</span>
                      <span className="text-sm font-bold text-emerald-700">{settings.testDifficultyEasy}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5}
                      value={settings.testDifficultyEasy}
                      onChange={(e) => set('testDifficultyEasy', Number(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-amber-600">O'rtacha</span>
                      <span className="text-sm font-bold text-amber-700">{settings.testDifficultyMedium}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5}
                      value={settings.testDifficultyMedium}
                      onChange={(e) => set('testDifficultyMedium', Number(e.target.value))}
                      className="w-full accent-amber-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-red-600">Qiyin</span>
                      <span className="text-sm font-bold text-red-700">{settings.testDifficultyHard}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5}
                      value={settings.testDifficultyHard}
                      onChange={(e) => set('testDifficultyHard', Number(e.target.value))}
                      className="w-full accent-red-500" />
                  </div>
                  {/* Visual bar */}
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 transition-all" style={{ width: `${settings.testDifficultyEasy}%` }} />
                    <div className="bg-amber-400 transition-all" style={{ width: `${settings.testDifficultyMedium}%` }} />
                    <div className="bg-red-400 transition-all" style={{ width: `${settings.testDifficultyHard}%` }} />
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* ——— PRACTICE & HOMEWORK ——— */}
          {active === 'practice' && (
            <>
              <Section title="Amaliyot sozlamalari">
                <SettingRow label="Topshiriqlar soni" desc="Har bir amaliyotdagi topshiriqlar soni">
                  <Slider value={settings.practiceTaskCount} onChange={(v) => set('practiceTaskCount', v)} min={3} max={20} />
                </SettingRow>
                <SettingRow label="Ko'rsatmalarni ko'rsatish" desc="Topshiriqlarda maslahat ko'rsatish">
                  <Toggle value={settings.showHints} onChange={(v) => set('showHints', v)} />
                </SettingRow>
              </Section>

              <Section title="Uyga vazifa sozlamalari">
                <SettingRow label="Topshiriqlar soni" desc="Har bir uyga vazifadagi topshiriqlar soni">
                  <Slider value={settings.homeworkTaskCount} onChange={(v) => set('homeworkTaskCount', v)} min={2} max={15} />
                </SettingRow>
                <SettingRow label="Standart muddati" desc="Uyga vazifa topshirish muddati (kun)">
                  <Slider value={settings.defaultDeadlineDays} onChange={(v) => set('defaultDeadlineDays', v)} min={1} max={14} unit=" kun" />
                </SettingRow>
              </Section>
            </>
          )}

          {/* ——— STUDENTS ——— */}
          {active === 'students' && (
            <>
              <Section title="Baholash tizimi">
                <SettingRow label="Standart baho tizimi" desc="O'quvchilarni baholash uchun shkal">
                  <Select
                    value={settings.defaultGradeSystem}
                    onChange={(v) => set('defaultGradeSystem', v)}
                    options={[
                      { value: '5',      label: "5 balli (1–5)" },
                      { value: '10',     label: '10 balli (1–10)' },
                      { value: '100',    label: '100 balli (0–100)' },
                      { value: 'letter', label: "Harfli (A–F)" },
                    ]}
                  />
                </SettingRow>
              </Section>

              <Section title="Statistika">
                <div className="py-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "O'quvchilar", value: studentCount, color: 'text-sky-600 bg-sky-50' },
                      { label: 'Guruhlar',    value: groupCount,   color: 'text-teal-600 bg-teal-50' },
                      { label: 'Materiallar', value: historyCount, color: 'text-primary-600 bg-primary-50' },
                    ].map((s) => (
                      <div key={s.label} className={clsx('rounded-xl p-3 text-center', s.color)}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm font-medium mt-0.5 opacity-70">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Zaxira nusxa">
                <SettingRow label="Avtomatik zaxira" desc="Ma'lumotlar avtomatik saqlansin">
                  <Toggle value={settings.autoBackup} onChange={(v) => set('autoBackup', v)} />
                </SettingRow>
              </Section>
            </>
          )}

          {/* ——— NOTIFICATIONS ——— */}
          {active === 'notifications' && (
            <>
              <Section title="Bildirishnomalar">
                <SettingRow label="Animatsiyalar" desc="Sahifa va kontent animatsiyalari">
                  <Toggle value={settings.animationsEnabled} onChange={(v) => set('animationsEnabled', v)} />
                </SettingRow>
                <SettingRow label="Ovoz effektlari" desc="Tugma bosish va muvaffaqiyat ovozlari">
                  <Toggle value={settings.soundEnabled} onChange={(v) => set('soundEnabled', v)} />
                </SettingRow>
              </Section>

              <Section title="Ilova haqida">
                <div className="py-4 space-y-3">
                  {[
                    { label: 'Versiya',     value: '1.0.0' },
                    { label: 'AI modeli',   value: settings.aiModel },
                    { label: 'Platformasi', value: 'Vite + React + TypeScript' },
                    { label: 'Stil',        value: 'Tailwind CSS v3' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Saqlash statistikasi">
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Materiallar',  value: historyCount, max: settings.historyLimit, color: 'primary' },
                      { label: "O'quvchilar",  value: studentCount, max: 200,                   color: 'sky' },
                      { label: 'Guruhlar',     value: groupCount,   max: 50,                    color: 'teal' },
                      { label: 'Sozlamalar',   value: 1,            max: 1,                     color: 'violet' },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-gray-500">{s.label}</span>
                          <span className="text-sm font-bold text-gray-700">{s.value}/{s.max}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-${s.color}-500 transition-all`}
                            style={{ width: `${Math.min(100, (s.value / s.max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* ——— ACCOUNT ——— */}
          {active === 'account' && (
            <>
              <Section title="Hisob ma'lumotlari">
                <div className="py-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-primary-50 rounded-xl p-2">
                      <p className="font-bold text-primary-700">{historyCount}</p>
                      <p className="text-gray-500">Material</p>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-2">
                      <p className="font-bold text-sky-700">{studentCount}</p>
                      <p className="text-gray-500">O'quvchi</p>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-2">
                      <p className="font-bold text-teal-700">{groupCount}</p>
                      <p className="text-gray-500">Guruh</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Xavfli zona">
                <div className="py-4 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Hisobni o'chirish</p>
                      <p className="text-sm text-red-600 mt-0.5 mb-3">
                        Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay yo'qoladi.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hisobni o'chirish
                      </button>
                    </div>
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* Save button at bottom */}
          {active !== 'profile' && active !== 'account' && active !== 'notifications' && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Saqlash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
