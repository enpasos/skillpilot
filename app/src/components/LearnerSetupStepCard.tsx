import React from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface LearnerSetupStepCardProps {
  stepNumber?: number
  stepLabel: string
  title: string
  description: string
  compact: boolean
  summaryLabel: string
  /** Every confirmed value of the step. All of them are shown; none is abbreviated away. */
  summaryItems: string[]
  changeLabel: string
  closeLabel: string
  children: React.ReactNode
  className?: string
}

const StepBadge = ({ stepNumber, className }: { stepNumber?: number; className: string }) => (
  stepNumber == null
    ? null
    : (
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white ${className}`}
      >
        {stepNumber}
      </span>
    )
)

export const LearnerSetupStepCard = React.forwardRef<HTMLElement, LearnerSetupStepCardProps>(({
  stepNumber,
  stepLabel,
  title,
  description,
  compact,
  summaryLabel,
  summaryItems,
  changeLabel,
  closeLabel,
  children,
  className = '',
}, ref) => {
  const contentId = React.useId()
  const headingId = React.useId()
  const [manuallyExpanded, setManuallyExpanded] = React.useState(false)
  const contentExpanded = !compact || manuallyExpanded
  // The header is a grid: beside the button on wide screens, while on narrow
  // screens the summary runs below the button over the full text width.
  const hasBadge = stepNumber != null
  const gridColumns = hasBadge ? 'grid-cols-[auto_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'
  const fullTextColumns = hasBadge ? 'col-start-2 col-end-4' : 'col-start-1 col-end-3'
  const titleColumns = compact ? (hasBadge ? 'col-start-2 col-end-3' : 'col-start-1 col-end-2') : fullTextColumns
  const summaryColumns = hasBadge ? 'col-start-2 col-end-4 sm:col-end-3' : 'col-start-1 col-end-3 sm:col-end-2'
  const actionColumn = hasBadge ? 'col-start-3' : 'col-start-2'
  const headerRowAlignment = compact ? 'self-center sm:self-start' : 'self-start'
  // Beside the text column the badge spans both rows, so its height never pushes the second row down.
  const badgeRows = compact ? 'row-start-1 row-end-2 sm:row-end-3' : 'row-start-1 row-end-3'

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={`scroll-mt-4 rounded-xl border border-border-color bg-white/70 shadow-sm outline-none animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50 ${className}`}
    >
      <div className={`grid gap-x-3 ${gridColumns} ${compact ? 'px-4 py-3' : 'p-4 pb-0'}`}>
        <StepBadge stepNumber={stepNumber} className={`col-start-1 ${badgeRows} ${headerRowAlignment}`} />
        <h2 id={headingId} className={`row-start-1 min-w-0 text-base font-bold text-text-primary ${titleColumns} ${headerRowAlignment}`}>
          {stepNumber != null && (
            <span className="sr-only">{stepLabel} {stepNumber}: </span>
          )}
          {title}
        </h2>
        {compact ? (
          <p className={`row-start-2 mt-0.5 min-w-0 text-xs leading-relaxed text-text-secondary ${summaryColumns}`}>
            <span className="mr-1.5 inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              {summaryLabel}:
            </span>
            {summaryItems.map((item, index) => {
              const last = index === summaryItems.length - 1
              return (
                <React.Fragment key={`${index}:${item}`}>
                  {/* A value wraps to the next line as a whole; it breaks only if it is wider than the card. */}
                  <span className="inline-block max-w-full">{last ? item : `${item} ·`}</span>
                  {last ? null : ' '}
                </React.Fragment>
              )
            })}
          </p>
        ) : (
          <p className={`row-start-2 mt-1 min-w-0 text-xs leading-relaxed text-text-secondary ${fullTextColumns}`}>{description}</p>
        )}
        {compact && (
          <button
            type="button"
            aria-expanded={manuallyExpanded}
            aria-controls={contentId}
            aria-label={`${manuallyExpanded ? closeLabel : changeLabel}: ${title}`}
            onClick={() => setManuallyExpanded((current) => !current)}
            className={`row-start-1 row-end-2 flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-sky-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:row-end-3 dark:text-sky-300 dark:hover:bg-slate-800/50 ${actionColumn} ${headerRowAlignment}`}
          >
            <span>{manuallyExpanded ? closeLabel : changeLabel}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform ${manuallyExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      <div
        id={contentId}
        hidden={!contentExpanded}
        className={compact ? 'border-t border-border-color px-4 pb-4 pt-4' : 'px-4 pb-4 pt-4'}
      >
        {children}
      </div>
    </section>
  )
})

LearnerSetupStepCard.displayName = 'LearnerSetupStepCard'
