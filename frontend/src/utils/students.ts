import { api } from '@/api/client'

export interface Student {
  id: string
  name: string
  createdAt: string
  groupId?: string | null
}

export async function loadStudents(): Promise<Student[]> {
  try {
    return await api.get<Student[]>('/students')
  } catch {
    return []
  }
}

export async function addStudent(name: string): Promise<Student> {
  return api.post<Student>('/students', { name: name.trim() })
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`)
}

export async function updateStudent(id: string, name: string): Promise<void> {
  await api.patch(`/students/${id}`, { name: name.trim() })
}

export async function clearStudents(): Promise<void> {
  await api.delete('/students/clear')
}
