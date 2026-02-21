import { api } from '@/api/client'

export interface Group {
  id: string
  name: string
  color: string
  studentIds: string[]
  createdAt: string
}

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

const COLORS_KEY = 'ustoz_group_colors'

function getStoredColors(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(COLORS_KEY) ?? '{}') } catch { return {} }
}

function setStoredColor(groupId: string, color: string) {
  const colors = getStoredColors()
  colors[groupId] = color
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
}

interface ApiGroup {
  id: string
  name: string
  createdAt: string
  students: { id: string }[]
}

function apiGroupToGroup(g: ApiGroup, index: number): Group {
  const colors = getStoredColors()
  let color = colors[g.id]
  if (!color) {
    color = GROUP_COLORS[index % GROUP_COLORS.length]
    setStoredColor(g.id, color)
  }
  return {
    id: g.id,
    name: g.name,
    color,
    studentIds: g.students.map((s) => s.id),
    createdAt: g.createdAt,
  }
}

export async function loadGroups(): Promise<Group[]> {
  try {
    const groups = await api.get<ApiGroup[]>('/groups')
    return groups.map((g, i) => apiGroupToGroup(g, i))
  } catch {
    return []
  }
}

export async function addGroup(name: string): Promise<Group> {
  const g = await api.post<ApiGroup>('/groups', { name: name.trim() })
  const existing = await loadGroups()
  return apiGroupToGroup(g, existing.length)
}

export async function deleteGroup(id: string): Promise<void> {
  await api.delete(`/groups/${id}`)
  const colors = getStoredColors()
  delete colors[id]
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
}

export async function updateGroup(id: string, name: string): Promise<void> {
  await api.patch(`/groups/${id}`, { name: name.trim() })
}

export function setGroupColor(id: string, color: string): void {
  setStoredColor(id, color)
}

export async function toggleStudentInGroup(groupId: string, studentId: string, isCurrentlyInGroup: boolean): Promise<void> {
  await api.patch(`/students/${studentId}`, { groupId: isCurrentlyInGroup ? null : groupId })
}

export async function clearGroups(): Promise<void> {
  await api.delete('/groups/clear')
}
