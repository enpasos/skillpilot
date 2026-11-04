import React from 'react'

interface Option {
  id: string
  label: string
}

interface Crumb {
  id: string
  label: string
  options: Option[]
  onSelect: (id: string) => void
  onNavigate: () => void
}

interface BreadcrumbProps {
  crumbs: Crumb[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ crumbs }) => {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
      {crumbs.map((crumb, idx) => {
        const showDivider = idx < crumbs.length - 1
        const hasSiblings = crumb.options.length > 1
        return (
          <React.Fragment key={crumb.id}>
            <div
              className={`flex items-center rounded-full border border-border-color bg-input-bg transition-colors focus-within:border-sky-400 hover:border-text-secondary ${hasSiblings ? 'pr-0' : 'pr-2'
                }`}
            >
              <button
                type="button"
                onClick={crumb.onNavigate}
                className="px-3 py-1.5 hover:text-text-primary truncate max-w-[240px] text-left text-text-primary"
                title="Zu diesem Ziel springen"
              >
                {crumb.label}
              </button>
              {hasSiblings && (
                <div className="relative h-full border-l border-border-color rounded-r-full">
                  <select
                    value={crumb.id}
                    onChange={(event) => crumb.onSelect(event.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Anderes Ziel auf dieser Ebene wählen"
                  >
                    {crumb.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="px-2 py-1 flex items-center justify-center h-full text-text-secondary pointer-events-none">
                    <span className="text-[10px] leading-none">▼</span>
                  </div>
                </div>
              )}
            </div>
            {showDivider && <span className="text-text-secondary">/</span>}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
