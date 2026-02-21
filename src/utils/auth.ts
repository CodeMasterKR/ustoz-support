export interface AuthUser {
  id: string
  name: string
  email: string
}

const USERS_KEY   = 'ustoz_auth_users'
const SESSION_KEY = 'ustoz_auth_session'

type StoredUser = AuthUser & { hash: string; googleId?: string }

function simpleHash(password: string, email: string): string {
  const str = password + email.toLowerCase() + 'ustoz_2025_salt'
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h | 0
  }
  return (h >>> 0).toString(36)
}

function uid() { return Math.random().toString(36).slice(2, 10) }

function loadUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') } catch { return [] }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export type AuthResult = { user: AuthUser } | { error: string }

export function register(name: string, email: string, password: string): AuthResult {
  if (!name.trim())    return { error: "Ism bo'sh bo'lishi mumkin emas" }
  if (!email.includes('@')) return { error: "Email noto'g'ri" }
  if (password.length < 6) return { error: "Parol kamida 6 ta belgi bo'lishi kerak" }

  const users = loadUsers()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "Bu email allaqachon ro'yxatdan o'tgan" }
  }

  const user: AuthUser = { id: uid(), name: name.trim(), email: email.toLowerCase().trim() }
  saveUsers([...users, { ...user, hash: simpleHash(password, email) }])
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { user }
}

export function login(email: string, password: string): AuthResult {
  if (!email || !password) return { error: "Email va parol kiriting" }

  const users = loadUsers()
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
  if (!found) return { error: "Email yoki parol noto'g'ri" }
  if (found.hash !== simpleHash(password, found.email)) return { error: "Email yoki parol noto'g'ri" }

  const user: AuthUser = { id: found.id, name: found.name, email: found.email }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { user }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser(): AuthUser | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') } catch { return null }
}

export function updateProfile(id: string, name: string, email: string): AuthResult {
  if (!name.trim())         return { error: "Ism bo'sh bo'lishi mumkin emas" }
  if (!email.includes('@')) return { error: "Email noto'g'ri" }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return { error: "Foydalanuvchi topilmadi" }

  const conflict = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)
  if (conflict) return { error: "Bu email allaqachon band" }

  users[idx] = { ...users[idx], name: name.trim(), email: email.toLowerCase().trim() }
  saveUsers(users)
  const user: AuthUser = { id, name: name.trim(), email: email.toLowerCase().trim() }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { user }
}

export function changePassword(id: string, oldPassword: string, newPassword: string): AuthResult {
  if (newPassword.length < 6) return { error: "Yangi parol kamida 6 ta belgi bo'lishi kerak" }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return { error: "Foydalanuvchi topilmadi" }

  const user = users[idx]
  if (user.hash !== simpleHash(oldPassword, user.email)) return { error: "Eski parol noto'g'ri" }

  users[idx] = { ...user, hash: simpleHash(newPassword, user.email) }
  saveUsers(users)
  return { user: { id: user.id, name: user.name, email: user.email } }
}

export function loginWithGoogle(name: string, email: string, googleId: string): AuthResult {
  const users = loadUsers()
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())

  if (found) {
    if (!found.googleId) {
      const idx = users.indexOf(found)
      users[idx] = { ...found, googleId }
      saveUsers(users)
    }
    const user: AuthUser = { id: found.id, name: found.name, email: found.email }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return { user }
  }

  const user: AuthUser = { id: uid(), name: name.trim(), email: email.toLowerCase().trim() }
  saveUsers([...users, { ...user, hash: '', googleId }])
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { user }
}

export function deleteAccount(id: string): void {
  const users = loadUsers()
  saveUsers(users.filter((u) => u.id !== id))
  sessionStorage.removeItem(SESSION_KEY)
}
