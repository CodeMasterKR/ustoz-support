import type { GenerateRequest, GeneratedContent, Presentation, Test, GameData, Practice, Homework } from '@/types'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const KEY = import.meta.env.VITE_GROQ_API_KEY

function uid() { return Math.random().toString(36).slice(2, 9) }

function buildPrompt(req: GenerateRequest): string {
  const lang = req.language === 'uz' ? "O'zbek tilida" : req.language === 'ru' ? 'На русском языке' : 'In English'
  const schemas: string[] = []

  if (req.contentTypes.includes('presentation')) {
    schemas.push(`"presentation": {
  "topic": "...",
  "slides": [
    { "id":"s1", "type":"intro",   "emoji":"📚", "imageKeyword":"education classroom", "title":"...", "subtitle":"...", "content":["...","...","..."] },
    { "id":"s2", "type":"content", "emoji":"🔬", "imageKeyword":"science study",       "title":"...", "content":["...","...","...","...","..."] },
    { "id":"s3", "type":"content", "emoji":"📊", "imageKeyword":"data analysis",       "title":"...", "content":["...","...","...","...","..."] },
    { "id":"s4", "type":"example", "emoji":"💡", "imageKeyword":"idea innovation",     "title":"...", "content":["...","...","...","..."] },
    { "id":"s5", "type":"content", "emoji":"🌍", "imageKeyword":"world knowledge",     "title":"...", "content":["...","...","...","...","..."] },
    { "id":"s6", "type":"example", "emoji":"⚗️", "imageKeyword":"experiment lab",      "title":"...", "content":["...","...","...","..."] },
    { "id":"s7", "type":"summary", "emoji":"✅", "imageKeyword":"success achievement",  "title":"...", "content":["...","...","...","..."] }
  ]
}`)
  }

  if (req.contentTypes.includes('test')) {
    schemas.push(`"test": {
  "topic": "...",
  "timeLimit": 40,
  "questions": [
    { "id":"q1",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":0, "explanation":"..." },
    { "id":"q2",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":1, "explanation":"..." },
    { "id":"q3",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":2, "explanation":"..." },
    { "id":"q4",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":3, "explanation":"..." },
    { "id":"q5",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":0, "explanation":"..." },
    { "id":"q6",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":1, "explanation":"..." },
    { "id":"q7",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":2, "explanation":"..." },
    { "id":"q8",  "difficulty":"easy",   "question":"...", "options":["...","...","...","..."], "correctIndex":3, "explanation":"..." },
    { "id":"q9",  "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":0, "explanation":"..." },
    { "id":"q10", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":1, "explanation":"..." },
    { "id":"q11", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":2, "explanation":"..." },
    { "id":"q12", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":3, "explanation":"..." },
    { "id":"q13", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":0, "explanation":"..." },
    { "id":"q14", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":1, "explanation":"..." },
    { "id":"q15", "difficulty":"medium", "question":"...", "options":["...","...","...","..."], "correctIndex":2, "explanation":"..." },
    { "id":"q16", "difficulty":"hard",   "question":"...", "options":["...","...","...","..."], "correctIndex":3, "explanation":"..." },
    { "id":"q17", "difficulty":"hard",   "question":"...", "options":["...","...","...","..."], "correctIndex":0, "explanation":"..." },
    { "id":"q18", "difficulty":"hard",   "question":"...", "options":["...","...","...","..."], "correctIndex":1, "explanation":"..." },
    { "id":"q19", "difficulty":"hard",   "question":"...", "options":["...","...","...","..."], "correctIndex":2, "explanation":"..." },
    { "id":"q20", "difficulty":"hard",   "question":"...", "options":["...","...","...","..."], "correctIndex":3, "explanation":"..." }
  ]
}`)
  }

  if (req.contentTypes.includes('game')) {
    schemas.push(`"game": {
  "type": "cards", "topic": "...", "instructions": "...",
  "cards": [
    { "id":"g1", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g2", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g3", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g4", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g5", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g6", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g7", "emoji":"...", "term":"...", "definition":"..." },
    { "id":"g8", "emoji":"...", "term":"...", "definition":"..." }
  ]
}`)
  }

  if (req.contentTypes.includes('practice')) {
    schemas.push(`"practice": {
  "topic": "...", "totalPoints": 30,
  "tasks": [
    { "id":"p1", "taskNumber":1, "type":"short-answer", "instruction":"...", "answer":"...", "hints":["...","..."] },
    { "id":"p2", "taskNumber":2, "type":"fill-blank",   "instruction":"...", "answer":"..." },
    { "id":"p3", "taskNumber":3, "type":"true-false",   "instruction":"...", "answer":"..." },
    { "id":"p4", "taskNumber":4, "type":"essay",        "instruction":"...", "hints":["..."] },
    { "id":"p5", "taskNumber":5, "type":"short-answer", "instruction":"...", "answer":"..." }
  ]
}`)
  }

  if (req.contentTypes.includes('homework')) {
    schemas.push(`"homework": {
  "topic": "...", "estimatedTime": "45-60 daqiqa", "objectives": ["...","...","..."],
  "tasks": [
    { "id":"h1", "taskNumber":1, "type":"research",  "instruction":"...", "resources":["...","..."] },
    { "id":"h2", "taskNumber":2, "type":"written",   "instruction":"..." },
    { "id":"h3", "taskNumber":3, "type":"creative",  "instruction":"..." },
    { "id":"h4", "taskNumber":4, "type":"practical", "instruction":"...", "deadline":"Keyingi dars" }
  ]
}`)
  }

  return `${lang}, "${req.topic}" mavzusida o'quv materiallar yarating.
Faqat to'g'ri JSON qaytaring — hech qanday markdown yoki izoh qo'shma.

{
${schemas.join(',\n')}
}`
}

function ensureIds<T extends { id?: string }>(arr: T[]): (T & { id: string })[] {
  return (arr || []).map((item) => ({ ...item, id: item.id || uid() }))
}

export async function generateWithGroq(req: GenerateRequest): Promise<GeneratedContent> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: "Siz maktab o'qituvchilariga yordam beradigan AI yordamchisiz. Har doim faqat to'g'ri JSON qaytaring. Kontentni o'quvchilar uchun qiziqarli va tushunarli qiling. Test uchun aniq 20 ta savol yarating.",
        },
        { role: 'user', content: buildPrompt(req) },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API xatosi: ${err}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? '{}'

  let parsed: Record<string, unknown>
  try { parsed = JSON.parse(raw) }
  catch { throw new Error("AI javobi noto'g'ri formatda") }

  const result: GeneratedContent = { id: uid(), request: req, createdAt: new Date() }

  if (parsed.presentation) {
    const p = parsed.presentation as Presentation
    result.presentation = { ...p, slides: ensureIds(p.slides || []) }
  }
  if (parsed.test) {
    const t = parsed.test as Test
    result.test = { ...t, questions: ensureIds(t.questions || []) }
  }
  if (parsed.game) {
    const g = parsed.game as GameData
    result.game = { ...g, cards: ensureIds(g.cards || []) }
  }
  if (parsed.practice) {
    const pr = parsed.practice as Practice
    result.practice = { ...pr, tasks: ensureIds(pr.tasks || []) }
  }
  if (parsed.homework) {
    const hw = parsed.homework as Homework
    result.homework = { ...hw, tasks: ensureIds(hw.tasks || []) }
  }

  return result
}
