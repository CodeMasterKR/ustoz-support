import { Menu, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  sidebarOpen: boolean
  onMenuClick: () => void
  onToggle: () => void
}

export function Header({ sidebarOpen, onMenuClick, onToggle }: Props) {
  return (
    <header
      className="h-14 flex items-center px-4 gap-3 flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop hamburger — toggles sidebar */}
      <button
        onClick={onToggle}
        className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand on mobile — always visible */}
      <Link to="/" className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Ustoz Support</span>
      </Link>

      {/* Brand on desktop — only when sidebar is collapsed */}
      {!sidebarOpen && (
        <Link to="/" className="hidden lg:flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Ustoz Support</span>
        </Link>
      )}
    </header>
  )
}
