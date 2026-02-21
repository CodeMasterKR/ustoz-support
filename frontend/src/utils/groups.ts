export interface Group {
  id: string
  name: string
  color: string
  studentIds: string[]
  createdAt: string
}

const KEY = 'ustoz_groups'

export const GROUP_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-primary-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
]

function uid() { return Math.random().toString(36).slice(2, 9) }

export function loadGroups(): Group[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? []
  } catch { return [] }
}

function persist(groups: Group[]) {
  localStorage.setItem(KEY, JSON.stringify(groups))
}

export function addGroup(name: string): Group {
  const all = loadGroups()
  const color = GROUP_COLORS[all.length % GROUP_COLORS.length]
  const g: Group = { id: uid(), name: name.trim(), color, studentIds: [], createdAt: new Date().toISOString() }
  persist([g, ...all])
  return g
}

export function deleteGroup(id: string): void {
  persist(loadGroups().filter((g) => g.id !== id))
}

export function updateGroup(id: string, name: string): void {
  persist(loadGroups().map((g) => (g.id === id ? { ...g, name: name.trim() } : g)))
}

export function setGroupColor(id: string, color: string): void {
  persist(loadGroups().map((g) => (g.id === id ? { ...g, color } : g)))
}

export function toggleStudentInGroup(groupId: string, studentId: string): void {
  persist(
    loadGroups().map((g) => {
      if (g.id !== groupId) return g
      const has = g.studentIds.includes(studentId)
      return {
        ...g,
        studentIds: has
          ? g.studentIds.filter((id) => id !== studentId)
          : [...g.studentIds, studentId],
      }
    }),
  )
}
