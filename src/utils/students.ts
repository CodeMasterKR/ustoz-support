export interface Student {
  id: string
  name: string
  createdAt: string
}

const KEY = 'ustoz_students'

function uid() { return Math.random().toString(36).slice(2, 9) }

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Student[]) : []
  } catch {
    return []
  }
}

function persist(students: Student[]) {
  localStorage.setItem(KEY, JSON.stringify(students))
}

export function addStudent(name: string): Student {
  const s: Student = { id: uid(), name: name.trim(), createdAt: new Date().toISOString() }
  persist([s, ...loadStudents()])
  return s
}

export function deleteStudent(id: string): void {
  persist(loadStudents().filter((s) => s.id !== id))
}

export function updateStudent(id: string, name: string): void {
  persist(loadStudents().map((s) => (s.id === id ? { ...s, name: name.trim() } : s)))
}
