import * as React from 'react'
import type { LearnerPlanSubjectStatus } from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'

const DIRECTION_CLASSES = {
  behind: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  on_track: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  ahead: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
} as const

/**
 * Renders the backend's status line for one subject.
 *
 * The period text and the plan-status label come from the backend verbatim, and the colour is
 * derived solely from the delivered direction. Nothing here recomputes a balance or infers
 * "nothing left" from a reached period target — that would be a second status model.
 */
export const LearnerPlanDailyProgress = ({ subject, language }: {
  subject: LearnerPlanSubjectStatus
  language: LabelLanguage
}) => {
  const statusId = React.useId()

  if (!subject.evaluable) {
    return (
      <p className="mt-1 text-sm text-text-secondary" aria-live="polite">
        {language === 'de'
          ? 'Der Planstand für dieses Fach ist derzeit nicht auswertbar. Weiterlernen bleibt möglich.'
          : 'The plan status for this subject cannot be evaluated right now. Learning remains possible.'}
      </p>
    )
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2" aria-live="polite" aria-atomic="true">
      <span id={statusId} className="text-sm text-text-primary">{subject.periodText}</span>
      {subject.planStatusText ? (
        <span
          data-testid={`learner-plan-status-${subject.statusDirection ?? 'unknown'}`}
          data-status-direction={subject.statusDirection ?? undefined}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            DIRECTION_CLASSES[subject.statusDirection ?? 'on_track']
          }`}
        >
          {subject.planStatusText}
        </span>
      ) : null}
    </div>
  )
}
