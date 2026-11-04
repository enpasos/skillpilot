import React from 'react'
import { Send } from 'lucide-react'
import type { LabelLanguage } from '../utils/filterLabels'
import { getLearnerLearningPlanCopy } from '../utils/learnerLearningPlanCopy'
import { getLearnerViewCopy } from '../utils/learnerViewCopy'

/** The active goal stays visible while the learner browses another goal. */
export const LearnerActiveGoalBanner = ({
  language,
  subjectLabel,
  title,
  announcement,
  onReveal,
}: {
  language: LabelLanguage
  subjectLabel?: string | null
  title?: string
  announcement?: string | null
  onReveal?: () => void
}): React.ReactElement => {
  const copy = getLearnerLearningPlanCopy(language)
  const revealLabel = getLearnerViewCopy(language).revealActiveGoalTitle

  return (
    <div
      data-testid="learner-active-goal-banner"
      className="flex items-center gap-4 rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900/60 dark:bg-sky-950/20"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
          {copy.currentGoalLabel}{subjectLabel ? ` · ${subjectLabel}` : ''}
        </p>
        {/* Preserve the backend announcement rather than interpreting learner evidence here. */}
        {announcement ?? title ? (
          <p
            data-testid="learner-plan-active-goal"
            className="mt-1 whitespace-normal break-words font-medium text-text-primary"
            title={title}
          >
            {announcement ?? title}
          </p>
        ) : null}
      </div>
      {onReveal ? (
        <button
          type="button"
          onClick={onReveal}
          aria-label={revealLabel}
          title={revealLabel}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-amber-500 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <Send size={28} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
