import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [open, setOpen]             = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger — fixed top-left */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-xl shadow flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <Sidebar
        isOpen={open}
        mobileOpen={mobileOpen}
        onToggle={() => setOpen((v) => !v)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen">
        {/* Desktop spacer matching sidebar width */}
        <div
          className={clsx(
            'hidden lg:block flex-shrink-0 transition-[width] duration-300 ease-in-out',
            open ? 'w-[280px]' : 'w-[66px]',
          )}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 px-4 py-4 lg:px-6 lg:py-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
