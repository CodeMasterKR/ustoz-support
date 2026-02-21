import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Clock, BookOpen, FlaskConical, Gamepad2, PenLine, House, Trash2, Plus, ChevronRight, ArrowLeft } from 'lucide-react'
import { clsx } from 'clsx'
import type { GeneratedContent, ContentType } from '@/types'
import { loadHistory, deleteContent } from '@/utils/storage'
import { Button } from '@/components/ui/Button'

const TYPE_META: Record<ContentType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  presentation: { label: 'Taqdimot',   icon: <BookOpen className="w-3.5 h-3.5" />,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  test:         { label: 'Test',        icon: <FlaskConical className="w-3.5 h-3.5" />, color: 'text-emerald-600',bg: 'bg-emerald-50' },
  game:         { label: "O'yin",       icon: <Gamepad2 className="w-3.5 h-3.5" />,    color: 'text-violet-600', bg: 'bg-violet-50' },
  practice:     { label: 'Amaliyot',    icon: <PenLine className="w-3.5 h-3.5" />,     color: 'text-amber-600',  bg: 'bg-amber-50' },
  homework:     { label: 'Uyga vazifa', icon: <House className="w-3.5 h-3.5" />,       color: 'text-rose-600',   bg: 'bg-rose-50' },
}

const TYPE_TITLES: Partial<Record<ContentType, string>> = {
  presentation: 'Taqdimotlar',
  test:         'Testlar',
  game:         "O'yinlar",
  practice:     'Amaliyot',
  homework:     'Uyga vazifalar',
}

const LANG_LABEL: Record<string, string> = { uz: "O'zbek", ru: 'Русский', en: 'English' }

function formatDate(date: Date): string {
  const now  = new Date()
  const diff = now.getTime() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Hozirgina'
  if (mins < 60)  return `${mins} daqiqa oldin`
  if (hours < 24) return `${hours} soat oldin`
  if (days < 7)   return `${days} kun oldin`
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function HistoryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeFilter = searchParams.get('type') as ContentType | null

  const [history,    setHistory]    = useState<GeneratedContent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    loadHistory()
      .then(setHistory)
      .finally(() => setLoading(false))
  }, [])

  const displayed = typeFilter
    ? history.filter((item) => item.request.contentTypes.includes(typeFilter))
    : history

  const pageTitle = typeFilter ? (TYPE_TITLES[typeFilter] ?? 'Materiallar') : 'Tarix'
  const meta      = typeFilter ? TYPE_META[typeFilter] : null

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteContent(id)
    setHistory((h) => h.filter((item) => item.id !== id))
    setDeletingId(null)
  }

  const handleOpen = (item: GeneratedContent) => {
    navigate('/results', { state: { content: item } })
  }

  if (loading) {
    return (
      <div className="animate-fade-up max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (displayed.length === 0) {
    return (
      <div className="animate-fade-up max-w-2xl mx-auto">
        <div className="mb-5">
          {typeFilter && (
            <Link to="/history" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Barcha materiallar
            </Link>
          )}
          <div className="flex items-center gap-2">
            {meta && (
              <span className={clsx('flex items-center justify-center w-7 h-7 rounded-lg', meta.bg, meta.color)}>
                {meta.icon}
              </span>
            )}
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-600 mb-2">
            {typeFilter ? `Hali ${pageTitle.toLowerCase()} yaratilmagan` : 'Hali hech narsa yaratilmagan'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {typeFilter
              ? 'Yangi material yaratsangiz, bu yerda ko\'rsatiladi'
              : 'Yangi dars materiali yaratsangiz, bu yerda ko\'rsatiladi'}
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => navigate('/')} icon={<Plus className="w-4 h-4" />}>
              Material yaratish
            </Button>
            {typeFilter && (
              <Button variant="secondary" onClick={() => navigate('/history')}>
                Barchasini ko'rish
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          {typeFilter && (
            <Link to="/history" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Barcha materiallar
            </Link>
          )}
          <div className="flex items-center gap-2">
            {meta && (
              <span className={clsx('flex items-center justify-center w-7 h-7 rounded-lg', meta.bg, meta.color)}>
                {meta.icon}
              </span>
            )}
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{displayed.length} ta material</p>
        </div>
        <Button size="sm" onClick={() => navigate('/')} icon={<Plus className="w-4 h-4" />}>
          Yangi
        </Button>
      </div>

      <div className="space-y-2">
        {displayed.map((item) => {
          const types = item.request.contentTypes
          return (
            <div
              key={item.id}
              onClick={() => handleOpen(item)}
              className="card p-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Date badge */}
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {item.createdAt.toLocaleDateString('uz-UZ', { month: 'short' })}
                  </span>
                  <span className="text-base font-black text-gray-700 leading-none">
                    {item.createdAt.getDate()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate pr-2">{item.request.topic}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {types.map((t) => {
                      const m = TYPE_META[t]
                      return (
                        <span key={t} className={clsx('flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', m.color, m.bg)}>
                          {m.icon}
                          {m.label}
                        </span>
                      )
                    })}
                    <span className="text-[11px] text-gray-400 ml-1">{LANG_LABEL[item.request.language]}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {deletingId === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                      >
                        O'chirish
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(null) }}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Bekor
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(item.id) }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-primary-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        So'nggi materiallar serverda saqlanadi
      </p>
    </div>
  )
}
