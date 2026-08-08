import React from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface LearnerSetupStepCardProps {
  stepNumber?: number
  stepLabel: string
  title: string
  description: string
  compact: boolean
  summaryLabel: string
  summary: string
  changeLabel: string
  closeLabel: string
  children: React.ReactNode
  className?: string
}

const StepBadge = ({ stepNumber }: { stepNumber?: number }) => (
  stepNumber == null
    ? null
    : (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white"
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
  summary,
  changeLabel,
  closeLabel,
  children,
  className = '',
}, ref) => {
  const contentId = React.useId()
  const headingId = React.useId()
  const [manuallyExpanded, setManuallyExpanded] = React.useState(false)
  const contentExpanded = !compact || manuallyExpanded

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={`scroll-mt-4 rounded-xl border border-border-color bg-white/70 shadow-sm outline-none animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50 ${className}`}
    >
      <div className={`flex items-start gap-3 ${compact ? 'px-4 py-3' : 'p-4 pb-0'}`}>
        <StepBadge stepNumber={stepNumber} />
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="text-base font-bold text-text-primary">
            {stepNumber != null && (
              <span className="sr-only">{stepLabel} {stepNumber}: </span>
            )}
            {title}
          </h2>
          {compact ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
              <span className="mr-1.5 inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
                {summaryLabel}:
              </span>
              <span>{summary}</span>
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
          )}
        </div>
        {compact && (
          <button
            type="button"
            aria-expanded={manuallyExpanded}
            aria-controls={contentId}
            aria-label={`${manuallyExpanded ? closeLabel : changeLabel}: ${title}`}
            onClick={() => setManuallyExpanded((current) => !current)}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-sky-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:text-sky-300 dark:hover:bg-slate-800/50"
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
