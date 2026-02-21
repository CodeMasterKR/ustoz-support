import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { ResultsPage } from '@/pages/ResultsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { getCurrentUser } from '@/utils/auth'
import { loadSettings } from '@/utils/settings'
import { applyTheme } from '@/utils/theme'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function PrivateRoute() {
  return getCurrentUser() ? <Layout /> : <Navigate to="/login" replace />
}

export default function App() {
  useEffect(() => {
    applyTheme(loadSettings().theme)
  }, [])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/results"   element={<ResultsPage />} />
            <Route path="/history"   element={<HistoryPage />} />
            <Route path="/students"  element={<StudentsPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
