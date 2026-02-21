import type { GeneratedContent } from '@/types'

const KEY = 'ustoz_history'

type Serialized = Omit<GeneratedContent, 'createdAt'> & { createdAt: string }

export function saveContent(content: GeneratedContent) {
  try {
    const history = loadHistory()
    const updated = [serialize(content), ...history.filter((h) => h.id !== content.id)].slice(0, 40)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    // ignore storage errors
  }
}

export function loadHistory(): GeneratedContent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return (JSON.parse(raw) as Serialized[]).map(deserialize)
  } catch {
    return []
  }
}

export function deleteContent(id: string) {
  const updated = loadHistory().filter((h) => h.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated.map(serialize)))
}

function serialize(c: GeneratedContent): Serialized {
  return { ...c, createdAt: c.createdAt.toISOString() }
}

function deserialize(c: Serialized): GeneratedContent {
  return { ...c, createdAt: new Date(c.createdAt) }
}
