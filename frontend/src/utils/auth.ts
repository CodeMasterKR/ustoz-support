import { api } from '@/api/client'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string | null
}

export type AuthResult = { user: AuthUser } | { error: string }

type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string }

function storeSession(data: AuthResponse) {
  localStorage.setItem('ustoz_access_token', data.accessToken)
  localStorage.setItem('ustoz_refresh_token', data.refreshToken)
  localStorage.setItem('ustoz_user', JSON.stringify(data.user))
}

export function getCurrentUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem('ustoz_user') ?? 'null')
  } catch {
    return null
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim())        return { error: "Ism bo'sh bo'lishi mumkin emas" }
  if (!email.includes('@')) return { error: "Email noto'g'ri" }
  if (password.length < 6)  return { error: "Parol kamida 6 ta belgi bo'lishi kerak" }
  try {
    const data = await api.post<AuthResponse>('/auth/register', { name: name.trim(), email: email.trim(), password })
    storeSession(data)
    return { user: data.user }
  } catch (err: unknown) {
    return { error: (err as Error).message ?? 'Xato yuz berdi' }
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) return { error: 'Email va parol kiriting' }
  try {
    const data = await api.post<AuthResponse>('/auth/login', { email: email.trim(), password })
    storeSession(data)
    return { user: data.user }
  } catch (err: unknown) {
    return { error: (err as Error).message ?? 'Xato yuz berdi' }
  }
}

export async function loginWithGoogle(name: string, email: string, googleId: string): Promise<AuthResult> {
  try {
    const data = await api.post<AuthResponse>('/auth/google', { googleId, name, email })
    storeSession(data)
    return { user: data.user }
  } catch (err: unknown) {
    return { error: (err as Error).message ?? 'Xato yuz berdi' }
  }
}

export function logout(): void {
  localStorage.removeItem('ustoz_access_token')
  localStorage.removeItem('ustoz_refresh_token')
  localStorage.removeItem('ustoz_user')
}

export async function updateProfile(_id: string, name: string, _email: string): Promise<AuthResult> {
  if (!name.trim()) return { error: "Ism bo'sh bo'lishi mumkin emas" }
  try {
    const user = await api.patch<AuthUser>('/users/me', { name: name.trim() })
    const stored = getCurrentUser()
    if (stored) {
      localStorage.setItem('ustoz_user', JSON.stringify({ ...stored, name: user.name }))
    }
    return { user }
  } catch (err: unknown) {
    return { error: (err as Error).message ?? 'Xato yuz berdi' }
  }
}

export async function changePassword(_id: string, oldPassword: string, newPassword: string): Promise<AuthResult> {
  if (newPassword.length < 6) return { error: "Yangi parol kamida 6 ta belgi bo'lishi kerak" }
  try {
    await api.patch('/auth/password', { oldPassword, newPassword })
    const user = getCurrentUser()!
    return { user }
  } catch (err: unknown) {
    return { error: (err as Error).message ?? 'Xato yuz berdi' }
  }
}

export async function deleteAccount(_id: string): Promise<void> {
  await api.delete('/users/me')
  logout()
}
