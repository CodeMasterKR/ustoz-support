import { api } from '@/api/client'
import type { GeneratedContent, ContentType } from '@/types'

interface HistoryRecord {
  id: string
  topic: string
  language: string
  types: string[]
  result: Record<string, unknown>
  createdAt: string
}

function recordToContent(h: HistoryRecord): GeneratedContent {
  return {
    id: h.id,
    request: {
      topic: h.topic,
      language: h.language as 'uz' | 'ru' | 'en',
      contentTypes: h.types as ContentType[],
    },
    ...(h.result as Omit<GeneratedContent, 'id' | 'request' | 'createdAt'>),
    createdAt: new Date(h.createdAt),
  }
}

export async function saveContent(content: GeneratedContent): Promise<void> {
  const { id: _id, request, createdAt: _createdAt, ...rest } = content
  await api.post('/history', {
    topic: request.topic,
    language: request.language,
    types: request.contentTypes,
    result: rest,
  })
}

export async function loadHistory(): Promise<GeneratedContent[]> {
  try {
    const records = await api.get<HistoryRecord[]>('/history')
    return records.map(recordToContent)
  } catch {
    return []
  }
}

export async function deleteContent(id: string): Promise<void> {
  await api.delete(`/history/${id}`)
}

export async function clearHistory(): Promise<void> {
  await api.delete('/history/clear')
}
