import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, Clock,
  X, LogOut, Settings, Menu,
  BookOpen, FlaskConical, Gamepad2, PenLine, House,
  Users, Layers,
} from 'lucide-react'
import { clsx } from 'clsx'
import { loadStudents } from '@/utils/students'
import { loadGroups } from '@/utils/groups'
import { getCurrentUser, logout } from '@/utils/auth'

// ——— Nav data ———
const teacherNav = [
  { to: '/',        label: 'Bosh sahifa',       icon: LayoutDashboard, iconColor: '' },
  { to: '/history', label: 'Barcha materiallar', icon: Clock,           iconColor: '' },
]

const contentNav = [
  { to: '/history?type=presentation', label: 'Taqdimotlar', icon: BookOpen,     iconColor: 'text-blue-400' },
  { to: '/history?type=test',         label: 'Testlar',      icon: FlaskConical, iconColor: 'text-emerald-400' },
  { to: '/history?type=game',         label: "O'yinlar",     icon: Gamepad2,     iconColor: 'text-violet-400' },
  { to: '/history?type=practice',     label: 'Amaliyot',     icon: PenLine,      iconColor: 'text-amber-400' },
  { to: '/history?type=homework',     label: 'Uyga vazifa',  icon: House,        iconColor: 'text-rose-400' },
]

// ——— NavItem ———
function NavItem({
  to, label, icon: Icon, iconColor, showLabel, badge,
}: {
  to: string; label: string; icon: React.ElementType; iconColor: string
  showLabel: boolean; badge?: number
}) {
  const location = useLocation()
  const [params] = useSearchParams()
  const url         = new URL(to, 'http://x')
  const targetType  = url.searchParams.get('type')
  const targetTab   = url.searchParams.get('tab')
  const currentType = params.get('type')
  const currentTab  = params.get('tab')
  const isActive    = location.pathname === url.pathname
    && targetType === currentType
    && targetTab  === currentTab

  return (
    <Link
      to={to}
      title={!showLabel ? label : undefined}
      className={clsx(
        'flex items-center rounded-xl transition-all duration-150',
        showLabel ? 'gap-3 px-3 py-2.5' : 'justify-center py-3',
      )}
      style={
        isActive
          ? { backgroundColor: 'var(--sidebar-active)', color: '#fff' }
          : { color: 'var(--sidebar-text)' }
      }
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'
        if (!isActive) e.currentTarget.style.color = 'var(--sidebar-text-active)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
        if (!isActive) e.currentTarget.style.color = 'var(--sidebar-text)'
      }}
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0', !isActive && iconColor)} />
      {showLabel && (
        <>
          <span className="text-[15px] font-medium leading-none truncate flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full leading-none flex-shrink-0">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

// ——— Section divider / label ———
function SectionLabel({ label, showLabel }: { label: string; showLabel: boolean }) {
  if (!showLabel) return <div className="h-px my-2 mx-1" style={{ backgroundColor: 'var(--sidebar-border)' }} />
  return (
    <p className="text-xs font-bold uppercase tracking-widest px-3 pt-4 pb-1.5" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
      {label}
    </p>
  )
}

// ——— Props ———
interface Props {
  isOpen: boolean
  mobileOpen: boolean
  onToggle: () => void
  onMobileClose: () => void
}

// ——— Sidebar ———
export function Sidebar({ isOpen, mobileOpen, onToggle, onMobileClose }: Props) {
  const navigate = useNavigate()
  const [studentCount, setStudentCount] = useState(0)
  const [groupCount,   setGroupCount]   = useState(0)

  useEffect(() => {
    loadStudents().then((s) => setStudentCount(s.length))
    loadGroups().then((g) => setGroupCount(g.length))
  }, [])
  const user = getCurrentUser()
  const showLabel = isOpen || mobileOpen

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen z-40 flex flex-col',
        'transition-all duration-300 ease-in-out overflow-x-hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'w-[270px]',
        isOpen ? 'lg:w-[280px]' : 'lg:w-[66px]',
      )}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* ——— Brand / App Header ——— */}
      <div
        className={clsx(
          'flex items-center flex-shrink-0 py-4',
          showLabel ? 'px-4 gap-3' : 'flex-col gap-2.5 px-0 items-center justify-center',
        )}
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        {/* Brand logo */}
        {showLabel && (
          <div className="leading-none min-w-0 flex-1">
            <img src="/images/logo-dark.png" alt="Ustoz Support" />
          </div>
        )}

        {/* Desktop sidebar toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center transition-colors flex-shrink-0"
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          style={{ color: 'var(--sidebar-text)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ——— Navigation ——— */}
      <nav className="flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto">

        <SectionLabel label="O'qituvchi" showLabel={showLabel} />
        {teacherNav.map((item) => (
          <NavItem key={item.to} {...item} showLabel={showLabel} />
        ))}

        <SectionLabel label="O'quvchi uchun" showLabel={showLabel} />
        {contentNav.map((item) => (
          <NavItem key={item.to} {...item} showLabel={showLabel} />
        ))}

        <SectionLabel label="O'quvchilarim" showLabel={showLabel} />
        <NavItem to="/students" label="O'quvchilar" icon={Users} iconColor="text-sky-400" showLabel={showLabel} badge={studentCount} />
        <NavItem to="/students?tab=groups" label="Guruhlar" icon={Layers} iconColor="text-teal-400" showLabel={showLabel} badge={groupCount} />

        <SectionLabel label="Tizim" showLabel={showLabel} />
        <NavItem to="/settings" label="Sozlamalar" icon={Settings} iconColor="" showLabel={showLabel} />
      </nav>

      {/* ——— User info + logout ——— */}
      {user && (
        <div
          className={clsx(
            'flex items-center gap-3 py-3.5 px-3 flex-shrink-0',
            !showLabel && 'justify-center',
          )}
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ backgroundColor: 'var(--sidebar-active)', opacity: 0.8, color: '#fff' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          {showLabel && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--sidebar-text-active)' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--sidebar-text)' }}>{user.email}</p>
            </div>
          )}
          {showLabel && (
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              style={{ color: 'var(--sidebar-text)' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
