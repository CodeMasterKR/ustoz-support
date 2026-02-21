import { clsx } from 'clsx'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-sm px-6 py-3 rounded-xl gap-2',
}

export function Button({
  variant = 'primary', size = 'md', loading, icon,
  children, className, disabled, style, ...props
}: ButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: 'var(--primary)', color: '#fff' },
    secondary: { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    ghost:     { color: 'var(--text-secondary)' },
    danger:    { backgroundColor: 'var(--danger)', color: '#fff' },
  }

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variant === 'primary' && 'shadow-sm hover:shadow-md',
        variant === 'secondary' && 'shadow-sm hover:shadow-md',
        variant === 'danger' && 'shadow-sm',
        sizes[size],
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <span className="dot-bounce w-1.5 h-1.5 bg-current rounded-full inline-block" />
          <span className="dot-bounce w-1.5 h-1.5 bg-current rounded-full inline-block" />
          <span className="dot-bounce w-1.5 h-1.5 bg-current rounded-full inline-block" />
        </span>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
