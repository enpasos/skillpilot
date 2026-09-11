import * as React from 'react'
import type { LearnerLearningPlanMetrics } from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'
import { getLearnerLearningPlanCopy } from '../utils/learnerLearningPlanCopy'

export const LearnerPlanDailyProgress = ({ metrics, subjectLabel, language }: {
  metrics: LearnerLearningPlanMetrics
  subjectLabel: string
  language: LabelLanguage
}) => {
  const copy = getLearnerLearningPlanCopy(language)
  const progressTextId = React.useId()
  const complete = metrics.dueToday > 0 && metrics.openDueToday === 0
  const extra = metrics.extraCompletedToday ?? 0
  return (
    <div className="mt-1" aria-live="polite" aria-atomic="true">
      <p id={progressTextId} className={`text-sm ${complete ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-text-secondary'}`}>
        {metrics.dueToday > 0
          ? copy.dailyProgress(metrics.completedDueToday, metrics.dueToday)
          : copy.todayNoQuota}
      </p>
      {metrics.dueToday > 0 ? (
        <progress
          aria-label={copy.dailyTargetLabel(subjectLabel)}
          aria-describedby={progressTextId}
          aria-valuetext={copy.dailyProgress(metrics.completedDueToday, metrics.dueToday)}
          value={metrics.completedDueToday}
          max={metrics.dueToday}
          className="mt-1 block h-1.5 w-full max-w-sm overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500 dark:[&::-webkit-progress-bar]:bg-slate-700"
        />
      ) : null}
      {complete ? <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">{copy.dailyTargetDone}</p> : null}
      {extra > 0 ? <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">{copy.extraCompleted(extra)}</p> : null}
    </div>
  )
}
