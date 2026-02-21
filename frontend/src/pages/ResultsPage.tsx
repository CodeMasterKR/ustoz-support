import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen, FlaskConical, Gamepad2, PenLine, House,
  ArrowLeft, Pencil, Check, X,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Trophy, Clock, Target, Lightbulb, RefreshCw, AlertCircle,
  Maximize2, Minimize2, Eye, EyeOff, FileDown,
  ChevronDown
} from 'lucide-react'
import { clsx } from 'clsx'
import type { GenerateRequest, GeneratedContent, Slide, GameCard } from '@/types'
import { generateWithGroq } from '@/services/groq'
import { saveContent } from '@/utils/storage'
import { Button } from '@/components/ui/Button'

type Tab = 'presentation' | 'test' | 'game' | 'practice' | 'homework'

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'presentation', label: 'Taqdimot',   icon: <BookOpen className="w-4 h-4" />,    color: 'text-blue-600' },
  { id: 'test',         label: 'Test',        icon: <FlaskConical className="w-4 h-4" />, color: 'text-emerald-600' },
  { id: 'game',         label: "O'yin",       icon: <Gamepad2 className="w-4 h-4" />,    color: 'text-violet-600' },
  { id: 'practice',     label: 'Amaliyot',    icon: <PenLine className="w-4 h-4" />,     color: 'text-amber-600' },
  { id: 'homework',     label: 'Uyga vazifa', icon: <House className="w-4 h-4" />,       color: 'text-rose-600' },
]

// Slide accent colors (left bar)
const SLIDE_ACCENT: Record<string, string> = {
  intro:   '#3b82f6',
  content: '#6366f1',
  example: '#0d9488',
  summary: '#059669',
}
const SLIDE_BG: Record<string, string> = {
  intro:   'bg-blue-600',
  content: 'bg-primary-600',
  example: 'bg-teal-600',
  summary: 'bg-emerald-600',
}

// ——— SLIDE IMAGE ———
function SlideImage({ slide }: { slide: Slide }) {
  const [err, setErr] = useState(false)
  const keyword = encodeURIComponent((slide.imageKeyword ?? slide.title).split(' ').slice(0, 2).join('+'))
  const seed = slide.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const src = err
    ? `https://picsum.photos/seed/${seed}/800/450`
    : `https://loremflickr.com/800/450/${keyword}?lock=${seed}`

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={src}
        alt={slide.title}
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  )
}

// ——— FULL-SCREEN SLIDE ———
function FullscreenPresentation({
  slides, cur, onCur, onExit
}: { slides: Slide[]; cur: number; onCur: (n: number) => void; onExit: () => void }) {
  const slide = slides[cur]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onCur(Math.min(slides.length - 1, cur + 1))
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   onCur(Math.max(0, cur - 1))
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cur, slides.length])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Slide area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Image background */}
        <div className="absolute inset-0">
          <SlideImage slide={slide} />
        </div>
        {/* Content overlay */}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-12 bg-black/40">
          <div
            className="w-1.5 absolute left-0 top-0 bottom-0"
            style={{ backgroundColor: SLIDE_ACCENT[slide.type] }}
          />
          <div className="text-7xl mb-4">{slide.emoji}</div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">{slide.title}</h1>
          {slide.subtitle && <p className="text-xl text-white/80 mb-5">{slide.subtitle}</p>}
          <ul className="space-y-2.5">
            {slide.content.map((line, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 text-lg drop-shadow">
                <span className="w-2 h-2 rounded-full bg-white/70 mt-2.5 flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-14 bg-black/80 flex items-center justify-between px-6 flex-shrink-0">
        <button onClick={onExit} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
          <Minimize2 className="w-4 h-4" /> Chiqish (ESC)
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => onCur(Math.max(0, cur - 1))} disabled={cur === 0} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/70 text-sm font-medium">{cur + 1} / {slides.length}</span>
          <button onClick={() => onCur(Math.min(slides.length - 1, cur + 1))} disabled={cur === slides.length - 1} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => onCur(i)} className={clsx('rounded-full transition-all', i === cur ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/30')} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ——— PDF HELPERS ———
function openPrintWindow(html: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => setTimeout(() => win.print(), 500)
}

function buildPresentationPDF(data: NonNullable<GeneratedContent['presentation']>, topic: string): string {
  const accentColors: Record<string, string> = { intro: '#3b82f6', content: '#6366f1', example: '#0d9488', summary: '#059669' }
  const slideHTML = data.slides.map((s, i) => {
    const color = accentColors[s.type] ?? '#6366f1'
    const keyword = encodeURIComponent((s.imageKeyword ?? s.title).split(' ').slice(0, 2).join('+'))
    const seed = s.id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
    return `<div class="slide">
  <div class="slide-left" style="background:${color}">
    <div class="slide-num">${i + 1}/${data.slides.length}</div>
    <div class="slide-emoji">${s.emoji ?? ''}</div>
    <div class="slide-img-wrap"><img src="https://loremflickr.com/320/480/${keyword}?lock=${seed}" onerror="this.style.display='none'" /></div>
  </div>
  <div class="slide-right">
    <div class="slide-badge" style="background:${color}20;color:${color}">${s.type.toUpperCase()}</div>
    <h2>${s.title}</h2>
    ${s.subtitle ? `<p class="subtitle">${s.subtitle}</p>` : ''}
    <ul>${s.content.map((c) => `<li>${c}</li>`).join('')}</ul>
  </div>
</div>`
  }).join('')

  return `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>${topic} - Taqdimot</title>
<style>
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; }
.slide { width: 297mm; height: 210mm; display: flex; page-break-after: always; overflow: hidden; }
.slide-left { width: 85mm; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px; position: relative; overflow: hidden; }
.slide-img-wrap { position: absolute; inset: 0; opacity: 0.25; }
.slide-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.slide-num { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.25); color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; z-index: 2; }
.slide-emoji { font-size: 60px; z-index: 2; margin-top: 50px; }
.slide-right { flex: 1; padding: 32px 36px; display: flex; flex-direction: column; justify-content: center; background: #fff; }
.slide-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 12px; }
h2 { font-size: 26px; font-weight: 800; color: #111; margin-bottom: 8px; line-height: 1.2; }
.subtitle { font-size: 14px; color: #555; margin-bottom: 16px; }
ul { list-style: none; padding: 0; }
li { font-size: 13px; color: #333; padding: 5px 0 5px 16px; border-left: 3px solid #e5e7eb; margin-bottom: 4px; line-height: 1.5; }
</style></head><body>${slideHTML}</body></html>`
}

function buildTestPDF(data: NonNullable<GeneratedContent['test']>, topic: string, withAnswers: boolean): string {
  const diffLabel: Record<string, string> = { easy: 'Oson', medium: "O'rtacha", hard: 'Qiyin' }
  const qs = data.questions.map((q, i) => `
<div class="q">
  <p class="q-text"><span class="q-num">${i + 1}.</span> ${q.question}</p>
  <div class="options">
    ${q.options.map((o, oi) => `<div class="opt ${withAnswers && oi === q.correctIndex ? 'correct' : ''}">${String.fromCharCode(65 + oi)}) ${o}</div>`).join('')}
  </div>
  ${withAnswers && q.explanation ? `<p class="exp">💡 ${q.explanation}</p>` : ''}
</div>`).join('')

  const answerKey = withAnswers ? '' : `
<div class="answer-key-page">
  <h2>Javob kaliti — Faqat o'qituvchi uchun</h2>
  <div class="answer-grid">
    ${data.questions.map((q, i) => `<div class="ans-item"><span class="ans-num">${i + 1}.</span> <span class="ans-val">${String.fromCharCode(65 + q.correctIndex)}</span></div>`).join('')}
  </div>
</div>`

  return `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>${topic} - Test</title>
<style>
@page { size: A4; margin: 15mm 15mm 15mm 15mm; }
* { box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; font-size: 13px; }
.header { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 16px; }
.header h1 { font-size: 18px; margin: 0 0 4px; }
.header-meta { display: flex; gap: 20px; font-size: 11px; color: #555; }
.student-info { display: flex; gap: 30px; margin-bottom: 16px; font-size: 12px; }
.student-info span { border-bottom: 1px solid #999; padding-bottom: 2px; min-width: 120px; display: inline-block; color: #999; }
.q { margin-bottom: 14px; break-inside: avoid; }
.q-text { font-weight: 600; margin-bottom: 6px; font-size: 13px; line-height: 1.4; }
.q-num { color: #4f46e5; font-weight: 800; }
.options { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-left: 10px; }
.opt { font-size: 12px; padding: 3px 6px; border-radius: 4px; color: #333; }
.opt.correct { background: #dcfce7; color: #166534; font-weight: 600; }
.exp { font-size: 11px; color: #2563eb; margin-top: 4px; margin-left: 10px; font-style: italic; }
.answer-key-page { page-break-before: always; padding-top: 20px; }
.answer-key-page h2 { font-size: 16px; margin-bottom: 16px; color: #4f46e5; }
.answer-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.ans-item { text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; }
.ans-num { font-size: 11px; color: #666; display: block; }
.ans-val { font-size: 18px; font-weight: 800; color: #059669; }
</style></head><body>
<div class="header">
  <h1>${topic} — Test</h1>
  <div class="header-meta">
    <span>⏱ ${data.timeLimit} daqiqa</span>
    <span>📝 ${data.questions.length} savol</span>
    ${withAnswers ? '<span style="color:#059669;font-weight:600">✅ Javob kaliti bilan</span>' : ''}
  </div>
</div>
<div class="student-info">
  <span>Ism, familiya: ___________________</span>
  <span>Sana: ___________</span>
  <span>Baho: ______</span>
</div>
${qs}
${answerKey}
</body></html>`
}

// ——— PRESENTATION VIEW ———
function PresentationView({
  data, editing, onSave
}: {
  data: NonNullable<GeneratedContent['presentation']>
  editing: boolean
  onSave: (d: NonNullable<GeneratedContent['presentation']>) => void
}) {
  const [cur, setCur] = useState(0)
  const [fs, setFs] = useState(false)
  const [draft, setDraft] = useState(data)
  const slide = editing ? draft.slides[cur] : data.slides[cur]
  const accent = SLIDE_ACCENT[slide.type]

  const updateSlide = (field: string, value: unknown) => {
    setDraft((d) => ({ ...d, slides: d.slides.map((s, i) => i === cur ? { ...s, [field]: value } : s) }))
  }

  return (
    <>
      {fs && <FullscreenPresentation slides={data.slides} cur={cur} onCur={setCur} onExit={() => setFs(false)} />}

      <div className="space-y-4">
        {/* Main slide */}
        <div className="card overflow-hidden shadow-md" style={{ borderTop: `4px solid ${accent}` }}>
          {/* Image header */}
          <div className="relative h-52 overflow-hidden">
            <SlideImage slide={slide} />
            <div className="absolute inset-0 flex items-end p-5">
              <div className="text-5xl drop-shadow-lg">{slide.emoji}</div>
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm uppercase tracking-wide">
                {cur + 1} / {data.slides.length}
              </span>
              <button onClick={() => setFs(true)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide content */}
          <div className="p-6">
            {editing ? (
              <input
                className="field w-full text-xl font-bold mb-3"
                value={draft.slides[cur].title}
                onChange={(e) => updateSlide('title', e.target.value)}
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900 mb-1">{slide.title}</h2>
            )}
            {slide.subtitle && !editing && <p className="text-sm text-gray-500 mb-3">{slide.subtitle}</p>}

            <div className="space-y-1.5 mt-3">
              {(editing ? draft.slides[cur] : slide).content.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: accent }} />
                  {editing ? (
                    <input className="field flex-1 py-1.5" value={line} onChange={(e) => {
                      const arr = [...draft.slides[cur].content]; arr[i] = e.target.value; updateSlide('content', arr)
                    }} />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{line}</p>
                  )}
                </div>
              ))}
            </div>

            {editing && (
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => onSave(draft)} icon={<Check className="w-3.5 h-3.5" />}>Saqlash</Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} icon={<ChevronLeft className="w-4 h-4" />}>Oldingi</Button>
          <div className="flex gap-1.5">
            {data.slides.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} className={clsx('rounded-full transition-all', i === cur ? 'w-5 h-2' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400')} style={i === cur ? { backgroundColor: accent } : {}} />
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCur((c) => Math.min(data.slides.length - 1, c + 1))} disabled={cur === data.slides.length - 1}>Keyingi<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {data.slides.map((s, i) => (
            <button key={s.id} onClick={() => setCur(i)} className={clsx('rounded-xl border-2 overflow-hidden transition-all', i === cur ? 'shadow-md' : 'border-gray-200 hover:border-gray-300')} style={i === cur ? { borderColor: SLIDE_ACCENT[s.type] } : {}}>
              <div className="relative h-12 overflow-hidden">
                <SlideImage slide={s} />
              </div>
              <div className="p-1.5 bg-white">
                <p className="text-[10px] font-medium text-gray-700 truncate">{s.title}</p>
              </div>
            </button>
          ))}
        </div>

        {/* PDF download */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openPrintWindow(buildPresentationPDF(data, data.topic))}
          icon={<FileDown className="w-3.5 h-3.5" />}
        >
          PDF sifatida saqlash
        </Button>
      </div>
    </>
  )
}

// ——— TEST VIEW ———
function TestView({
  data, editing, onSave
}: {
  data: NonNullable<GeneratedContent['test']>
  editing: boolean
  onSave: (d: NonNullable<GeneratedContent['test']>) => void
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [draft, setDraft] = useState(data)
  const [showPdfMenu, setShowPdfMenu] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  const score = data.questions.filter((q) => answers[q.id] === q.correctIndex).length
  const diffBg: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }

  const qList = editing ? draft.questions : data.questions

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{data.timeLimit} daqiqa</span>
          <span className="flex items-center gap-1"><Target className="w-4 h-4" />{data.questions.length} savol</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnswers((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all border-gray-200 hover:border-primary-300 text-gray-600"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? "Javoblarni yashirish" : "Barcha javoblar"}
          </button>
          {/* PDF dropdown */}
          <div className="relative" ref={pdfRef}>
            <button
              onClick={() => setShowPdfMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-gray-200 hover:border-primary-300 text-gray-600 transition-all"
            >
              <FileDown className="w-4 h-4" />
              PDF
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPdfMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[200px] py-1">
                <button
                  onClick={() => { openPrintWindow(buildTestPDF(data, data.topic, false)); setShowPdfMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">O'quvchilar uchun</span>
                  <span className="block text-xs text-gray-400">Javoblarsiz (imtihon varaqasi)</span>
                </button>
                <button
                  onClick={() => { openPrintWindow(buildTestPDF(data, data.topic, true)); setShowPdfMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">O'qituvchi uchun</span>
                  <span className="block text-xs text-gray-400">Javoblar bilan (nazorat nusxasi)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score */}
      {submitted && (
        <div className={clsx('p-4 rounded-2xl border-2 flex items-center gap-4', score >= data.questions.length * 0.7 ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300')}>
          <Trophy className={clsx('w-8 h-8', score >= data.questions.length * 0.7 ? 'text-emerald-500' : 'text-amber-500')} />
          <div>
            <p className="font-bold text-lg">{score}/{data.questions.length} to'g'ri</p>
            <p className="text-sm text-gray-500">{score >= data.questions.length * 0.7 ? 'Ajoyib natija! 🎉' : "Ko'proq mashq qiling"}</p>
          </div>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => { setAnswers({}); setSubmitted(false) }} icon={<RefreshCw className="w-3.5 h-3.5" />}>Qayta</Button>
        </div>
      )}

      {/* Answer key panel */}
      {showAnswers && !editing && (
        <div className="card p-4 bg-primary-50 border-primary-200">
          <p className="text-xs font-bold text-primary-700 mb-3 uppercase tracking-wide">Javob kaliti</p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {data.questions.map((q, i) => (
              <div key={q.id} className="text-center p-2 bg-white rounded-lg border border-primary-100">
                <p className="text-[10px] text-gray-400">{i + 1}</p>
                <p className="font-bold text-primary-600 text-sm">{String.fromCharCode(65 + q.correctIndex)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {qList.map((q, qi) => {
        const answered = answers[q.id] !== undefined
        const correct = answers[q.id] === q.correctIndex
        return (
          <div key={q.id} className="card p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">{qi + 1}</span>
              <div className="flex-1">
                {editing ? (
                  <input className="field font-medium" value={q.question} onChange={(e) => {
                    const qs = [...draft.questions]; qs[qi] = { ...qs[qi], question: e.target.value }; setDraft({ ...draft, questions: qs })
                  }} />
                ) : (
                  <p className="font-medium text-gray-800 text-sm">{q.question}</p>
                )}
              </div>
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0', diffBg[q.difficulty])}>
                {q.difficulty === 'easy' ? 'Oson' : q.difficulty === 'medium' ? "O'rta" : 'Qiyin'}
              </span>
              {submitted && (answered && correct ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-10">
              {q.options.map((opt, oi) => {
                const isAnswer = showAnswers && oi === q.correctIndex
                let style = 'border-gray-200 bg-white hover:border-gray-300'
                if (isAnswer) style = 'border-emerald-400 bg-emerald-50'
                if (answered && !submitted && !showAnswers) style = oi === answers[q.id] ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
                if (submitted) {
                  if (oi === q.correctIndex) style = 'border-emerald-400 bg-emerald-50'
                  else if (oi === answers[q.id]) style = 'border-red-300 bg-red-50'
                  else style = 'border-gray-200 bg-white opacity-50'
                }
                return (
                  <button key={oi} onClick={() => !submitted && !showAnswers && setAnswers((a) => ({ ...a, [q.id]: oi }))} disabled={submitted || showAnswers}
                    className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left text-sm transition-all', style)}>
                    <span className={clsx('w-5 h-5 rounded-full border-2 text-[11px] font-bold flex items-center justify-center flex-shrink-0',
                      answers[q.id] === oi && !submitted && !showAnswers ? 'border-primary-500 bg-primary-500 text-white' :
                      isAnswer ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-gray-500')}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {editing ? (
                      <input className="flex-1 bg-transparent focus:outline-none text-sm" value={opt} onClick={(e) => e.stopPropagation()} onChange={(e) => {
                        const qs = [...draft.questions]; const opts = [...qs[qi].options]; opts[oi] = e.target.value; qs[qi] = { ...qs[qi], options: opts }; setDraft({ ...draft, questions: qs })
                      }} />
                    ) : opt}
                  </button>
                )
              })}
            </div>

            {submitted && q.explanation && (
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-blue-50 rounded-xl ml-10">
                <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">{q.explanation}</p>
              </div>
            )}
          </div>
        )
      })}

      {editing && <Button size="sm" onClick={() => onSave(draft)} icon={<Check className="w-3.5 h-3.5" />}>Saqlash</Button>}

      {!submitted && !editing && !showAnswers && (
        <Button size="lg" className="w-full justify-center" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < data.questions.length}>
          Natijani Ko'rish ({Object.keys(answers).length}/{data.questions.length})
        </Button>
      )}
    </div>
  )
}

// ——— GAME HELPERS ———
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

type GameMode = 'bamboozle' | 'quiz' | 'memory'

const GAME_MODES: { id: GameMode; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'bamboozle', label: 'Bamboozle', emoji: '🎮', desc: "Jamoa o'yini",       color: 'border-rose-400 bg-rose-50' },
  { id: 'quiz',      label: 'Tez Savol', emoji: '⚡', desc: '10 soniya limit',    color: 'border-amber-400 bg-amber-50' },
  { id: 'memory',    label: 'Xotira',    emoji: '🧠', desc: 'Juftlarni toping',   color: 'border-violet-400 bg-violet-50' },
]

// ——— BAMBOOZLE GAME ———
type BTeam  = { id: number; name: string; score: number }
type BPhase = 'setup' | 'board' | 'question' | 'powerup' | 'done'
type BPowerUp = {
  emoji: string; name: string; good: boolean
  apply: (teams: BTeam[], idx: number) => { teams: BTeam[]; msg: string }
}

const BTEAM_COLORS = [
  { bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-400' },
  { bg: 'bg-blue-500',    light: 'bg-blue-50',     text: 'text-blue-600',    border: 'border-blue-400' },
  { bg: 'bg-amber-400',   light: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-400' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-400' },
]

const BOPT_COLORS = [
  'bg-red-500 hover:bg-red-600',
  'bg-blue-500 hover:bg-blue-600',
  'bg-amber-400 hover:bg-amber-500',
  'bg-emerald-500 hover:bg-emerald-600',
]

const B_POWERUPS: BPowerUp[] = [
  {
    emoji: '⭐', name: 'YULDUZ!', good: true,
    apply: (teams, idx) => ({
      teams: teams.map((t, i) => i === idx ? { ...t, score: t.score > 0 ? t.score * 2 : 50 } : t),
      msg: `${teams[idx].name} bali 2 barobarga ko'paydi!`,
    }),
  },
  {
    emoji: '💰', name: 'OLTIN TOPILDI!', good: true,
    apply: (teams, idx) => ({
      teams: teams.map((t, i) => i === idx ? { ...t, score: t.score + 50 } : t),
      msg: `${teams[idx].name} +50 bonus bal oldi!`,
    }),
  },
  {
    emoji: '🎁', name: "SOVg'A!", good: true,
    apply: (teams, idx) => ({
      teams: teams.map((t, i) => i === idx ? { ...t, score: t.score + 25 } : t),
      msg: `${teams[idx].name} +25 bepul bal oldi!`,
    }),
  },
  {
    emoji: '🦊', name: 'BAMBOOZLE!', good: true,
    apply: (teams, idx) => {
      const opponents = teams.filter((_, i) => i !== idx)
      if (!opponents.length) return { teams, msg: `${teams[idx].name} yolg'iz!` }
      const victim = opponents.reduce((a, b) => a.score > b.score ? a : b)
      const steal  = Math.min(20, victim.score)
      return {
        teams: teams.map((t) =>
          t.id === teams[idx].id ? { ...t, score: t.score + steal }
          : t.id === victim.id  ? { ...t, score: t.score - steal }
          : t
        ),
        msg: `${teams[idx].name} ${victim.name}dan ${steal} bal o'g'irladi! 😈`,
      }
    },
  },
  {
    emoji: '🦈', name: 'AKULA HUJUMI!', good: true,
    apply: (teams, idx) => ({
      teams: teams.map((t, i) => i === idx ? t : { ...t, score: Math.max(0, t.score - 15) }),
      msg: `${teams[idx].name} raqiblarni cho'ktirdi! Har biri -15 bal`,
    }),
  },
  {
    emoji: '💥', name: 'PORTLASH!', good: false,
    apply: (teams, idx) => ({
      teams: teams.map((t, i) => i === idx ? { ...t, score: Math.max(0, t.score - 50) } : t),
      msg: `${teams[idx].name} portladi va 50 bal yo'qotdi!`,
    }),
  },
  {
    emoji: '🔄', name: 'ALMASHTIRISH!', good: false,
    apply: (teams, idx) => {
      const opponents = teams.filter((_, i) => i !== idx)
      if (!opponents.length) return { teams, msg: 'Almashtirishga raqib kerak!' }
      const target  = opponents[Math.floor(Math.random() * opponents.length)]
      const myScore = teams[idx].score
      return {
        teams: teams.map((t) =>
          t.id === teams[idx].id ? { ...t, score: target.score }
          : t.id === target.id  ? { ...t, score: myScore }
          : t
        ),
        msg: `${teams[idx].name} (${myScore}) va ${target.name} (${target.score}) ballari almashdi!`,
      }
    },
  },
  {
    emoji: '🦠', name: 'VIRUS!', good: false,
    apply: (teams) => ({
      teams: teams.map((t) => ({ ...t, score: 0 })),
      msg: `Dahshatli virus barcha ballarni yo'q qildi... Hammasi noldan!`,
    }),
  },
]

function BamboozleGame({ cards }: { cards: GameCard[] }) {
  const [phase, setPhase]             = useState<BPhase>('setup')
  const [teamCount, setTeamCount]     = useState(2)
  const [teamNames, setTeamNames]     = useState(["Qizil Jamoa", "Ko'k Jamoa", "Sariq Jamoa", "Yashil Jamoa"])
  const [teams, setTeams]             = useState<BTeam[]>([])
  const [questions]                   = useState(() => makeQuizQuestions(cards))
  const [qStatus, setQStatus]         = useState<(null | 'correct' | 'wrong')[]>(() => Array(cards.length).fill(null))
  const [currentTeam, setCurrentTeam] = useState(0)
  const [selectedQ, setSelectedQ]     = useState<number | null>(null)
  const [activePU, setActivePU]       = useState<{ pu: BPowerUp; msg: string } | null>(null)

  const startGame = () => {
    setTeams(teamNames.slice(0, teamCount).map((name, i) => ({ id: i, name, score: 0 })))
    setQStatus(Array(questions.length).fill(null))
    setCurrentTeam(0); setSelectedQ(null); setActivePU(null)
    setPhase('board')
  }

  const nextTurn = (status: (null | 'correct' | 'wrong')[], tCount: number) => {
    if (status.every((s) => s !== null)) { setPhase('done'); return }
    setCurrentTeam((c) => (c + 1) % tCount)
    setSelectedQ(null)
    setPhase('board')
  }

  const handleAnswer = (correct: boolean) => {
    if (selectedQ === null) return
    const newStatus = [...qStatus]
    newStatus[selectedQ] = correct ? 'correct' : 'wrong'
    setQStatus(newStatus)
    if (correct) {
      const newTeams = teams.map((t, i) => i === currentTeam ? { ...t, score: t.score + 100 } : t)
      if (Math.random() < 0.35) {
        const pu     = B_POWERUPS[Math.floor(Math.random() * B_POWERUPS.length)]
        const result = pu.apply(newTeams, currentTeam)
        setTeams(result.teams)
        setActivePU({ pu, msg: result.msg })
        setPhase('powerup')
      } else {
        setTeams(newTeams)
        nextTurn(newStatus, teams.length)
      }
    } else {
      nextTurn(newStatus, teams.length)
    }
  }

  const dismissPowerUp = () => { setActivePU(null); nextTurn(qStatus, teams.length) }

  // ——— SETUP ———
  if (phase === 'setup') return (
    <div className="space-y-5">
      <div className="card p-5 bg-violet-600 text-center">
        <p className="text-4xl mb-1">🎮</p>
        <p className="text-white font-black text-xl tracking-wide">BAMBOOZLE</p>
        <p className="text-violet-200 text-sm mt-0.5">Jamoalar bilan qiziqarli musobaqa!</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Jamoalar soni</p>
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button key={n} onClick={() => setTeamCount(n)}
              className={clsx('flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all',
                teamCount === n ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
              {n} jamoa
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Jamoa nomlari</p>
        {Array.from({ length: teamCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={clsx('w-5 h-5 rounded-full flex-shrink-0', BTEAM_COLORS[i].bg)} />
            <input className="field flex-1" value={teamNames[i]}
              onChange={(e) => { const n = [...teamNames]; n[i] = e.target.value; setTeamNames(n) }} />
          </div>
        ))}
      </div>

      <Button className="w-full justify-center" size="lg" onClick={startGame} icon={<Gamepad2 className="w-4 h-4" />}>
        O'yinni Boshlash!
      </Button>
    </div>
  )

  // ——— BOARD ———
  if (phase === 'board') {
    const cols = teams.length === 2 ? 'grid-cols-2' : teams.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
    return (
      <div className="space-y-3">
        {/* Scores */}
        <div className={clsx('grid gap-2', cols)}>
          {teams.map((team, i) => (
            <div key={team.id} className={clsx('rounded-2xl p-3 border-2 flex flex-col items-center gap-0.5',
              i === currentTeam ? `${BTEAM_COLORS[i].border} ${BTEAM_COLORS[i].light}` : 'border-transparent bg-white')}>
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs', BTEAM_COLORS[i].bg)}>
                {i === currentTeam ? '▶' : i + 1}
              </div>
              <p className="text-[11px] font-semibold text-gray-600 truncate text-center w-full mt-0.5">{team.name}</p>
              <p className={clsx('font-black text-xl leading-none', BTEAM_COLORS[i].text)}>{team.score}</p>
            </div>
          ))}
        </div>

        {/* Turn banner */}
        <div className={clsx('p-3 rounded-xl flex items-center gap-2', BTEAM_COLORS[currentTeam].light)}>
          <div className={clsx('w-2.5 h-2.5 rounded-full', BTEAM_COLORS[currentTeam].bg)} />
          <p className={clsx('text-sm font-bold', BTEAM_COLORS[currentTeam].text)}>
            {teams[currentTeam]?.name} — savol tanlang!
          </p>
        </div>

        {/* Question tiles */}
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => {
            const s = qStatus[i]
            return (
              <button key={i} onClick={() => { if (s !== null) return; setSelectedQ(i); setPhase('question') }}
                disabled={s !== null}
                className={clsx('rounded-2xl border-2 p-3 min-h-[72px] flex flex-col items-center justify-center transition-all',
                  s === 'correct' ? 'border-emerald-300 bg-emerald-50' :
                  s === 'wrong'   ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-white hover:border-violet-400 hover:shadow-md active:scale-95')}>
                {s === 'correct' ? <span className="text-2xl">✅</span> :
                 s === 'wrong'   ? <span className="text-2xl">❌</span> : (
                  <><span className="text-xl mb-0.5">{q.card.emoji}</span><span className="text-xs font-bold text-gray-400">{i + 1}</span></>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ——— QUESTION ———
  if (phase === 'question' && selectedQ !== null) {
    const q = questions[selectedQ]
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold', BTEAM_COLORS[currentTeam].light, BTEAM_COLORS[currentTeam].text)}>
            <div className={clsx('w-2 h-2 rounded-full', BTEAM_COLORS[currentTeam].bg)} />
            {teams[currentTeam]?.name}
          </div>
          <span className="text-xs text-gray-400">Savol {selectedQ + 1}/{questions.length}</span>
        </div>

        {/* Question */}
        <div className="card p-6 text-center bg-gray-900">
          <div className="text-4xl mb-3">{q.card.emoji}</div>
          <p className="text-xl font-black text-white leading-snug">{q.card.term}</p>
          <p className="text-gray-500 text-sm mt-1">Quyidagi ta'riflardan to'g'risini tanlang</p>
        </div>

        {/* 4 colored options */}
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, oi) => (
            <div key={oi} className={clsx('rounded-2xl p-4 text-white flex items-start gap-2 min-h-[72px]', BOPT_COLORS[oi])}>
              <span className="font-black text-xl leading-none flex-shrink-0">{String.fromCharCode(65 + oi)}</span>
              <span className="text-sm font-semibold leading-snug">{opt}</span>
            </div>
          ))}
        </div>

        {/* Answer hint for teacher */}
        <p className="text-center text-xs text-gray-400">
          To'g'ri javob: <span className="font-black text-emerald-600 text-sm">{String.fromCharCode(65 + q.correctIndex)}</span>
        </p>

        {/* Teacher controls */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleAnswer(false)}
            className="py-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-700 font-black text-base hover:bg-red-100 transition-all">
            ✗ Noto'g'ri
          </button>
          <button onClick={() => handleAnswer(true)}
            className="py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-black text-base hover:bg-emerald-100 transition-all">
            ✓ To'g'ri
          </button>
        </div>

        <button onClick={() => { setSelectedQ(null); setPhase('board') }}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors">
          ← Taxtaga qaytish
        </button>
      </div>
    )
  }

  // ——— POWER-UP ———
  if (phase === 'powerup' && activePU) {
    const { pu, msg } = activePU
    const cols = teams.length === 2 ? 'grid-cols-2' : teams.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
    return (
      <div className={clsx('card p-8 text-center', pu.good ? 'bg-violet-600' : 'bg-gray-900')}>
        <p className="text-8xl mb-3" style={{ lineHeight: '1.1' }}>{pu.emoji}</p>
        <p className="text-2xl font-black text-white mb-2">{pu.name}</p>
        <p className="text-base text-white/80 mb-6 leading-snug">{msg}</p>
        <div className={clsx('grid gap-2 mb-6', cols)}>
          {teams.map((team, i) => (
            <div key={team.id} className="bg-white/15 rounded-2xl p-3">
              <div className={clsx('w-4 h-4 rounded-full mx-auto mb-1', BTEAM_COLORS[i].bg)} />
              <p className="text-[11px] text-white/70 truncate">{team.name}</p>
              <p className="text-2xl font-black text-white">{team.score}</p>
            </div>
          ))}
        </div>
        <button onClick={dismissPowerUp}
          className="px-8 py-3 bg-white text-gray-900 font-black rounded-2xl hover:bg-gray-100 transition-colors text-sm">
          Davom ettirish →
        </button>
      </div>
    )
  }

  // ——— DONE ———
  if (phase === 'done') {
    const sorted  = [...teams].sort((a, b) => b.score - a.score)
    const medals  = ['🥇', '🥈', '🥉']
    return (
      <div className="space-y-3">
        <div className="card p-6 bg-violet-600 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-white font-black text-xl">{sorted[0].name}</p>
          <p className="text-violet-200 text-sm">{sorted[0].score} ball bilan g'alaba!</p>
        </div>
        {sorted.map((team, rank) => {
          const origIdx = teams.findIndex((t) => t.id === team.id)
          return (
            <div key={team.id} className={clsx('card p-4 flex items-center gap-3 border-2',
              rank === 0 ? 'border-amber-400 bg-amber-50' : 'border-transparent')}>
              <span className="text-2xl">{medals[rank] ?? rank + 1}</span>
              <div className={clsx('w-4 h-4 rounded-full flex-shrink-0', BTEAM_COLORS[origIdx].bg)} />
              <p className="flex-1 font-semibold text-gray-800">{team.name}</p>
              <p className={clsx('font-black text-xl', BTEAM_COLORS[origIdx].text)}>{team.score}</p>
            </div>
          )
        })}
        <Button className="w-full justify-center" onClick={() => {
          setTeams([]); setQStatus(Array(questions.length).fill(null))
          setCurrentTeam(0); setSelectedQ(null); setActivePU(null); setPhase('setup')
        }} icon={<RefreshCw className="w-4 h-4" />}>
          Qayta O'ynash
        </Button>
      </div>
    )
  }

  return null
}

// ——— QUIZ GAME ———
function makeQuizQuestions(cards: GameCard[]) {
  return shuffle(cards).map((card) => {
    const others   = shuffle(cards.filter((c) => c.id !== card.id))
    const wrongOpts = others.slice(0, 3).map((c) => c.definition)
    const options  = shuffle([card.definition, ...wrongOpts])
    return { card, options, correctIndex: options.indexOf(card.definition) }
  })
}

function QuizGame({ cards }: { cards: GameCard[] }) {
  const [questions]             = useState(() => makeQuizQuestions(cards))
  const [index, setIndex]       = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [done, setDone]         = useState(false)
  const q = questions[index]

  useEffect(() => {
    if (selected !== null || done) return
    if (timeLeft <= 0) { setSelected(-1); return }
    const t = setTimeout(() => setTimeLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, selected, done])

  const pick = (oi: number) => {
    if (selected !== null) return
    setSelected(oi)
    if (oi === q.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) { setDone(true); return }
    setIndex((i) => i + 1); setSelected(null); setTimeLeft(10)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="card p-8 text-center">
        <div className="text-5xl mb-3">{pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📚'}</div>
        <p className="text-3xl font-black text-gray-900 mb-1">{score}/{questions.length}</p>
        <p className="text-sm text-gray-400 mb-6">{pct}% to'g'ri javob</p>
        <Button onClick={() => { setIndex(0); setScore(0); setSelected(null); setTimeLeft(10); setDone(false) }} icon={<RefreshCw className="w-4 h-4" />}>
          Qayta o'ynash
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {questions.map((_, i) => (
            <div key={i} className={clsx('h-1.5 rounded-full transition-all',
              i < index ? 'w-5 bg-amber-500' : i === index ? 'w-5 bg-amber-300' : 'w-3 bg-gray-200')} />
          ))}
        </div>
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-base font-black border-2 transition-all',
          selected !== null
            ? (selected === q.correctIndex ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-red-400 bg-red-50 text-red-500')
            : timeLeft <= 3 ? 'border-red-400 bg-red-50 text-red-500'
            : timeLeft <= 6 ? 'border-amber-400 bg-amber-50 text-amber-600'
            : 'border-gray-200 bg-white text-gray-700')}>
          {selected !== null ? (selected === q.correctIndex ? '✓' : '✗') : timeLeft}
        </div>
      </div>

      {/* Question card */}
      <div className="card p-6 text-center bg-amber-500">
        <div className="text-4xl mb-2">{q.card.emoji}</div>
        <p className="text-xl font-bold text-white">{q.card.term}</p>
        <p className="text-sm text-amber-100 mt-1">Ta'rifini toping</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, oi) => {
          let cls = 'border-gray-200 bg-white hover:border-amber-300 text-gray-800'
          if (selected !== null) {
            if (oi === q.correctIndex) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
            else if (oi === selected && selected !== -1) cls = 'border-red-400 bg-red-50 text-red-700'
            else cls = 'border-gray-100 bg-gray-50 text-gray-400 opacity-60'
          }
          return (
            <button key={oi} onClick={() => pick(oi)} disabled={selected !== null}
              className={clsx('w-full p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all', cls)}>
              <span className="font-black text-xs mr-2 opacity-50">{String.fromCharCode(65 + oi)}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button onClick={next} className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors">
          {index + 1 >= questions.length ? "Natijani Ko'rish 🏁" : 'Keyingi →'}
        </button>
      )}
      {selected === -1 && <p className="text-center text-sm text-red-500 -mt-2">⏱ Vaqt tugadi!</p>}
    </div>
  )
}

// ——— MEMORY GAME ———
type MemoryTile = { id: string; pairId: string; text: string; isDefinition: boolean; emoji?: string }

function makeTiles(cards: GameCard[]): MemoryTile[] {
  return shuffle(
    cards.flatMap((c) => [
      { id: `${c.id}-t`, pairId: c.id, text: c.term,       isDefinition: false, emoji: c.emoji },
      { id: `${c.id}-d`, pairId: c.id, text: c.definition, isDefinition: true },
    ])
  )
}

function MemoryGame({ cards }: { cards: GameCard[] }) {
  const [tiles, setTiles]       = useState<MemoryTile[]>(() => makeTiles(cards))
  const [flipped, setFlipped]   = useState<string[]>([])
  const [matched, setMatched]   = useState<string[]>([])
  const [moves, setMoves]       = useState(0)
  const [checking, setChecking] = useState(false)

  const flip = (id: string) => {
    const tile = tiles.find((t) => t.id === id)!
    if (checking || flipped.includes(id) || matched.includes(tile.pairId)) return
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      setChecking(true)
      const [a, b] = next.map((fid) => tiles.find((t) => t.id === fid)!)
      if (a.pairId === b.pairId) {
        setMatched((m) => [...m, a.pairId])
        setFlipped([])
        setChecking(false)
      } else {
        setTimeout(() => { setFlipped([]); setChecking(false) }, 900)
      }
    }
  }

  const done = matched.length === cards.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{matched.length}/{cards.length} juft topildi</span>
        <span className="font-medium text-gray-700">{moves} harakat</span>
      </div>

      {done && (
        <div className="card p-5 bg-emerald-50 border-2 border-emerald-300 text-center">
          <p className="text-2xl mb-1">🧠✨</p>
          <p className="font-bold text-emerald-700">{cards.length} juft topildi — {moves} harakatda!</p>
          <Button variant="secondary" size="sm" className="mt-3"
            onClick={() => { setTiles(makeTiles(cards)); setFlipped([]); setMatched([]); setMoves(0); setChecking(false) }}
            icon={<RefreshCw className="w-3.5 h-3.5" />}>Qayta</Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        {tiles.map((tile) => {
          const isFlipped = flipped.includes(tile.id)
          const isMatched = matched.includes(tile.pairId)
          const visible   = isFlipped || isMatched
          return (
            <button
              key={tile.id}
              onClick={() => flip(tile.id)}
              disabled={isMatched || (flipped.length === 2 && !isFlipped)}
              className={clsx(
                'rounded-xl border-2 p-1.5 min-h-[72px] flex flex-col items-center justify-center text-center transition-all',
                isMatched ? 'border-emerald-300 bg-emerald-50' :
                isFlipped
                  ? (tile.isDefinition ? 'border-violet-400 bg-violet-50' : 'border-primary-400 bg-primary-50')
                  : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
              )}
            >
              {visible ? (
                <>
                  {!tile.isDefinition && tile.emoji && <span className="text-sm">{tile.emoji}</span>}
                  <span className={clsx('text-[10px] font-semibold leading-tight mt-0.5',
                    isMatched ? 'text-emerald-700' : tile.isDefinition ? 'text-violet-700' : 'text-primary-700')}>
                    {tile.text.length > 35 ? tile.text.slice(0, 33) + '…' : tile.text}
                  </span>
                </>
              ) : (
                <span className="text-xl text-gray-300">?</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-primary-300 bg-primary-50 flex-shrink-0" /> Atama</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-violet-300 bg-violet-50 flex-shrink-0" /> Ta'rif</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-emerald-300 bg-emerald-50 flex-shrink-0" /> Topildi</span>
      </div>
    </div>
  )
}

// ——— GAME VIEW ———
function GameView({ data }: { data: NonNullable<GeneratedContent['game']> }) {
  const [mode, setMode] = useState<GameMode>('bamboozle')
  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2">
        {GAME_MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={clsx('p-3 rounded-2xl border-2 text-center transition-all',
              mode === m.id ? m.color : 'border-gray-200 bg-white hover:border-gray-300')}>
            <div className="text-2xl mb-1">{m.emoji}</div>
            <p className={clsx('text-xs font-bold', mode === m.id ? 'text-gray-800' : 'text-gray-500')}>{m.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>
      {mode === 'bamboozle' && <BamboozleGame key="bm" cards={data.cards} />}
      {mode === 'quiz'      && <QuizGame      key="qz" cards={data.cards} />}
      {mode === 'memory'    && <MemoryGame    key="mm" cards={data.cards} />}
    </div>
  )
}

// ——— PRACTICE VIEW ———
function PracticeView({ data, editing, onSave }: { data: NonNullable<GeneratedContent['practice']>; editing: boolean; onSave: (d: NonNullable<GeneratedContent['practice']>) => void }) {
  const [draft, setDraft] = useState(data)
  const typeBg: Record<string, string> = { 'fill-blank': 'bg-sky-100 text-sky-700', 'short-answer': 'bg-primary-100 text-primary-700', 'calculation': 'bg-purple-100 text-purple-700', 'essay': 'bg-pink-100 text-pink-700', 'true-false': 'bg-teal-100 text-teal-700' }
  const typeLabel: Record<string, string> = { 'fill-blank': "Bo'sh to'ldirish", 'short-answer': 'Qisqa javob', 'calculation': 'Hisoblash', 'essay': 'Insho', 'true-false': "To'g'ri/Noto'g'ri" }
  return (
    <div className="space-y-3">
      {(editing ? draft : data).tasks.map((task, ti) => (
        <div key={task.id} className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{task.taskNumber}</div>
            <div className="flex-1">
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2', typeBg[task.type] ?? 'bg-gray-100 text-gray-600')}>{typeLabel[task.type]}</span>
              {editing ? <textarea className="field w-full resize-none mt-1" rows={3} value={task.instruction} onChange={(e) => { const t = [...draft.tasks]; t[ti] = { ...t[ti], instruction: e.target.value }; setDraft({ ...draft, tasks: t }) }} /> : <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{task.instruction}</p>}
              {task.hints?.length && !editing ? <div className="mt-2 flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-xs text-gray-500">{task.hints.join(' • ')}</p></div> : null}
            </div>
          </div>
          {!editing && <textarea placeholder="Javob..." className="field mt-3 ml-11 resize-none" rows={2} />}
        </div>
      ))}
      {editing && <Button size="sm" onClick={() => onSave(draft)} icon={<Check className="w-3.5 h-3.5" />}>Saqlash</Button>}
    </div>
  )
}

// ——— HOMEWORK VIEW ———
function HomeworkView({ data, editing, onSave }: { data: NonNullable<GeneratedContent['homework']>; editing: boolean; onSave: (d: NonNullable<GeneratedContent['homework']>) => void }) {
  const [draft, setDraft] = useState(data)
  const typeStyle: Record<string, string> = { written: 'bg-blue-100 text-blue-700', research: 'bg-purple-100 text-purple-700', creative: 'bg-pink-100 text-pink-700', practical: 'bg-teal-100 text-teal-700' }
  const typeLabel: Record<string, string> = { written: 'Yozma', research: 'Tadqiqot', creative: 'Ijodiy', practical: 'Amaliy' }
  return (
    <div className="space-y-3">
      <div className="card p-4 bg-rose-50 border-rose-100">
        <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-rose-500" /><span className="text-sm font-medium text-rose-700">{data.estimatedTime}</span></div>
        {data.objectives.map((o, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 mt-1"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />{o}</div>)}
      </div>
      {(editing ? draft : data).tasks.map((task, ti) => (
        <div key={task.id} className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{task.taskNumber}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', typeStyle[task.type])}>{typeLabel[task.type]}</span>
                {task.deadline && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{task.deadline}</span>}
              </div>
              {editing ? <textarea className="field w-full resize-none" rows={3} value={task.instruction} onChange={(e) => { const t = [...draft.tasks]; t[ti] = { ...t[ti], instruction: e.target.value }; setDraft({ ...draft, tasks: t }) }} /> : <p className="text-sm text-gray-800 leading-relaxed">{task.instruction}</p>}
              {task.resources?.length && !editing ? <div className="mt-2 space-y-0.5">{task.resources.map((r, i) => <p key={i} className="text-xs text-gray-400">• {r}</p>)}</div> : null}
            </div>
          </div>
        </div>
      ))}
      {editing && <Button size="sm" onClick={() => onSave(draft)} icon={<Check className="w-3.5 h-3.5" />}>Saqlash</Button>}
    </div>
  )
}

// ——— LOADING SKELETON ———
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 bg-gray-200 rounded-xl w-1/2" />
      <div className="flex gap-1.5">{[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded-xl flex-1" />)}</div>
      <div className="card overflow-hidden">
        <div className="h-52 bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

// ——— MAIN ———
export function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const request = location.state?.request as GenerateRequest | undefined
  const fromHistory = location.state?.content as GeneratedContent | undefined

  const [content, setContent] = useState<GeneratedContent | null>(fromHistory ?? null)
  const [activeTab, setActiveTab] = useState<Tab | null>(fromHistory ? fromHistory.request.contentTypes[0] as Tab : null)
  const [editingTab, setEditingTab] = useState<Tab | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!fromHistory)

  const doGenerate = (req: GenerateRequest) => {
    setLoading(true); setError(null)
    generateWithGroq(req)
      .then((c) => { setContent(c); setActiveTab(req.contentTypes[0] as Tab); saveContent(c).catch(console.error) })
      .catch((e) => setError(e.message || 'Xatolik'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (fromHistory) return
    if (!request) { navigate('/'); return }
    doGenerate(request)
  }, [])

  const updateContent = (key: keyof GeneratedContent, value: unknown) => {
    setContent((c) => {
      if (!c) return c
      const updated = { ...c, [key]: value }
      saveContent(updated).catch(console.error)
      return updated
    })
    setEditingTab(null)
  }

  const tabs = TABS.filter((t) => (content?.request ?? request)?.contentTypes.includes(t.id))

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Orqaga
          </button>
          <h1 className="text-xl font-bold text-gray-900">{(content?.request ?? request)?.topic}</h1>
        </div>
      </div>

      {error && (
        <div className="card p-5 border-red-200 bg-red-50 flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Xatolik yuz berdi</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            <Button size="sm" variant="danger" className="mt-3" onClick={() => request && doGenerate(request)}>Qayta urinish</Button>
          </div>
        </div>
      )}

      {loading && <Skeleton />}

      {!loading && content && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-200 rounded-xl mb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingTab(null) }}
                className={clsx('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center',
                  activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Edit toggle */}
          {activeTab && activeTab !== 'game' && (
            <div className="flex justify-end mb-3">
              {editingTab === activeTab
                ? <button onClick={() => setEditingTab(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"><X className="w-4 h-4" /> Bekor</button>
                : <button onClick={() => setEditingTab(activeTab)} className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 transition-colors"><Pencil className="w-3.5 h-3.5" /> Tahrirlash</button>
              }
            </div>
          )}

          {activeTab === 'presentation' && content.presentation && <PresentationView data={content.presentation} editing={editingTab === 'presentation'} onSave={(d) => updateContent('presentation', d)} />}
          {activeTab === 'test'         && content.test         && <TestView         data={content.test}         editing={editingTab === 'test'}         onSave={(d) => updateContent('test', d)} />}
          {activeTab === 'game'         && content.game         && <GameView         data={content.game} />}
          {activeTab === 'practice'     && content.practice     && <PracticeView     data={content.practice}     editing={editingTab === 'practice'}     onSave={(d) => updateContent('practice', d)} />}
          {activeTab === 'homework'     && content.homework     && <HomeworkView     data={content.homework}     editing={editingTab === 'homework'}     onSave={(d) => updateContent('homework', d)} />}
        </>
      )}
    </div>
  )
}
