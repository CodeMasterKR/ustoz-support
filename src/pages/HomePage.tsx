import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen, FlaskConical, Gamepad2, PenLine, House } from 'lucide-react'
import { clsx } from 'clsx'
import type { ContentType, GenerateRequest } from '@/types'
import { Button } from '@/components/ui/Button'

function UzFlag() {
  // star points: outer r=4.5, inner r=1.8
  const sp = "0,-4.5 1.06,-1.46 4.28,-1.39 1.71,0.56 2.65,3.64 0,1.8 -2.65,3.64 -1.71,0.56 -4.28,-1.39 -1.06,-1.46"
  const stars: [number, number][] = [
    [58,10],[80,10],[102,10],[124,10],
    [58,23],[80,23],[102,23],[124,23],
    [58,36],[80,36],[102,36],[124,36],
  ]
  return (
    <svg width="20" height="14" viewBox="0 0 200 140" className="rounded-sm flex-shrink-0">
      {/* Ko'k band */}
      <rect width="200" height="46" fill="#1EBFFF"/>
      {/* Qizil-oq-qizil chiziq */}
      <rect y="46" width="200" height="2" fill="#CE1126"/>
      <rect y="48" width="200" height="3" fill="white"/>
      <rect y="51" width="200" height="2" fill="#CE1126"/>
      {/* Oq band */}
      <rect y="53" width="200" height="37" fill="white"/>
      {/* Qizil-oq-qizil chiziq */}
      <rect y="90" width="200" height="2" fill="#CE1126"/>
      <rect y="92" width="200" height="3" fill="white"/>
      <rect y="95" width="200" height="2" fill="#CE1126"/>
      {/* Yashil band */}
      <rect y="97" width="200" height="43" fill="#1EB53A"/>
      {/* Yariq oy */}
      <circle cx="30" cy="23" r="15" fill="white"/>
      <circle cx="37" cy="21" r="12" fill="#1EBFFF"/>
      {/* 12 yulduz (3×4) */}
      {stars.map(([cx, cy], i) => (
        <polygon key={i} points={sp} transform={`translate(${cx},${cy})`} fill="white"/>
      ))}
    </svg>
  )
}

function RuFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm flex-shrink-0">
      <rect width="20" height="14" fill="#D52B1E"/>
      <rect width="20" height="9.33" fill="#0039A6"/>
      <rect width="20" height="4.67" fill="white"/>
    </svg>
  )
}

function GbFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 60 40" className="rounded-sm flex-shrink-0">
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="8"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V40 M0,20 H60" stroke="white" strokeWidth="12"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7"/>
    </svg>
  )
}

const options: { type: ContentType; label: string; desc: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { type: 'presentation', label: 'Taqdimot',        desc: 'Slaydlar bilan vizual dars',    icon: <BookOpen className="w-5 h-5" />,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-400' },
  { type: 'test',         label: 'Test',             desc: "Ko'p tanlovli savollar",        icon: <FlaskConical className="w-5 h-5" />, color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-400' },
  { type: 'game',         label: "Interaktiv O'yin", desc: "O'yin orqali o'rganish",        icon: <Gamepad2 className="w-5 h-5" />,    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-400' },
  { type: 'practice',     label: 'Amaliyot',         desc: 'Mustahkamlash mashqlari',       icon: <PenLine className="w-5 h-5" />,     color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-400' },
  { type: 'homework',     label: 'Uyga Vazifa',      desc: 'Mustaqil ish topshiriqlari',    icon: <House className="w-5 h-5" />,       color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-400' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>('uz')
  const [selected, setSelected] = useState<ContentType[]>(['presentation', 'test'])
  const [loading, setLoading] = useState(false)

  const toggle = (t: ContentType) =>
    setSelected((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])

  const generate = async () => {
    if (!topic.trim() || selected.length === 0) return
    setLoading(true)
    const req: GenerateRequest = { topic: topic.trim(), language, contentTypes: selected }
    navigate('/results', { state: { request: req } })
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Yangi dars materiali</h1>
        <p className="text-sm text-gray-500 mt-0.5">Mavzuni kiriting, AI qolganini qiladi</p>
      </div>

      <div className="card p-6">
        {/* Topic */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Dars mavzusi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="Masalan: Ikkinchi darajali tenglamalar..."
              className="field pr-9"
              autoFocus
            />
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
          </div>
        </div>

        {/* Til */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Til</label>
          <div className="flex gap-2">
            {([
              { code: 'uz', label: "O'zbek",  flag: <UzFlag /> },
              { code: 'ru', label: 'Русский', flag: <RuFlag /> },
              { code: 'en', label: 'English', flag: <GbFlag /> },
            ] as const).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                  language === l.code
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-primary-300'
                )}
              >
                {l.flag}
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content types */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nima yaratish kerak?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt) => {
              const on = selected.includes(opt.type)
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => toggle(opt.type)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    on ? `${opt.border} ${opt.bg}` : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    on ? `${opt.bg} ${opt.color}` : 'bg-gray-100 text-gray-400'
                  )}>
                    {opt.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={clsx('font-semibold text-sm', on ? 'text-gray-900' : 'text-gray-500')}>{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                  <div className={clsx(
                    'ml-auto w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    on ? `${opt.border} ${opt.bg}` : 'border-gray-300'
                  )}>
                    {on && <div className={clsx('w-2 h-2 rounded-sm', opt.color.replace('text-', 'bg-'))} />}
                  </div>
                </button>
              )
            })}
          </div>
          {selected.length === 0 && (
            <p className="text-xs text-rose-500 mt-1.5">Kamida bitta tur tanlang</p>
          )}
        </div>

        <Button
          size="lg"
          className="w-full justify-center"
          onClick={generate}
          loading={loading}
          disabled={!topic.trim() || selected.length === 0}
          icon={!loading ? <Sparkles className="w-4 h-4" /> : undefined}
        >
          {loading ? 'Yaratilmoqda...' : 'Materiallarni Yaratish'}
        </Button>
      </div>
    </div>
  )
}
