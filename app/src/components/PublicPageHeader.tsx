import React from 'react'

interface PublicPageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  align?: 'center' | 'left'
}

export const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({
  title,
  subtitle,
  icon,
  className = '',
  align = 'center',
}) => {
  const isCentered = align === 'center'

  return (
    <header className={`${isCentered ? 'text-center' : 'text-left'} ${className}`}>
      {icon && (
        <div className="mb-4 inline-flex items-center justify-center">
          {icon}
        </div>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-200 sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className={`${isCentered ? 'mx-auto' : ''} mt-3 max-w-2xl text-lg leading-relaxed text-text-secondary`}>
          {subtitle}
        </p>
      )}
    </header>
  )
}
