import React from 'react'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  onLogout: () => void
  title?: string
  className?: string
  size?: 'icon' | 'pill'
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogout,
  title = 'Abmelden / Startseite',
  className = 'text-text-secondary hover:text-rose-400',
  size = 'icon',
}) => {
  const sizeClasses = size === 'pill' ? 'px-4 py-2 rounded-lg' : 'w-10 h-10 rounded-full'

  return (
    <button
      type="button"
      onClick={onLogout}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 ${sizeClasses} ${className}`}
    >
      <LogOut size={18} strokeWidth={2} />
    </button>
  )
}
