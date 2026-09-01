import { CalendarDays, Flag, ListChecks } from 'lucide-react'
import * as React from 'react'
import type { LearnerLearningPlanSummary } from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'
import {
  getLearnerLearningPlanCopy,
  getLearnerLearningPlanPaceMessage,
} from '../utils/learnerLearningPlanCopy'
import {
  formatLearnerLearningPlanDate,
  formatLearnerLearningPlanPeriod,
} from '../utils/learnerLearningPlanReadModel'
import { PacingGauge } from './PacingGauge'

export interface LearnerPlanTodayCardProps {
  plan: LearnerLearningPlanSummary
  subjectLabel: string
  language: LabelLanguage
  planModeEnabled: boolean
  nextGoalLabel?: string
  staleDataMessage?: string
  actionsDisabled?: boolean
  navigationAvailable?: boolean
  isContinuing?: boolean
  onContinue: (planId: string) => void
}

export const LearnerPlanTodayCard = ({
  plan,
  subjectLabel,
  language,
  planModeEnabled,
  nextGoalLabel,
  staleDataMessage,
  actionsDisabled = false,
  navigationAvailable = true,
  isContinuing = false,
  onContinue,
}: LearnerPlanTodayCardProps) => {
  const copy = getLearnerLearningPlanCopy(language)
  const headingId = React.useId()
  const descriptionId = React.useId()
  const currentPeriod = plan.currentBlock
    ? formatLearnerLearningPlanPeriod(
        plan.currentBlock.startDate,
        plan.currentBlock.endDate,
        language,
      )
    : null
  const backlogOpen = Math.max(0, plan.metrics.openDueThroughToday - plan.metrics.openDueToday)

  return (
    <article
      data-testid={`learner-plan-today-${plan.landscapeId}`}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className="rounded-2xl border border-border-color bg-sidebar-bg p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-semibold text-text-primary">
            {copy.cardTitle(subjectLabel)}
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
            {copy.cardDescription}
          </p>
          {plan.planLabel && (
            <p className="mt-2 truncate text-sm font-medium text-text-primary" title={plan.planLabel}>
              {plan.planLabel}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-text-secondary">
          <span className="block font-medium">{copy.planPeriodLabel}</span>
          <span className="mt-1 block tabular-nums">
            {formatLearnerLearningPlanPeriod(
              plan.period.startDate,
              plan.period.endDate,
              language,
            )}
          </span>
        </div>
      </div>

      <dl
        aria-label={copy.cardDescription}
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-border-color bg-input-bg/40 p-4">
          <dt className="text-xs text-text-secondary">{copy.dueTodayLabel}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
            <span>{plan.metrics.dueToday}</span>
          </dd>
        </div>
        <div className="rounded-xl border border-border-color bg-input-bg/40 p-4">
          <dt className="text-xs text-text-secondary">{copy.completedDueTodayLabel}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
            <span>{plan.metrics.completedDueToday}</span>
          </dd>
        </div>
        <div className="rounded-xl border border-border-color bg-input-bg/40 p-4">
          <dt className="text-xs text-text-secondary">{copy.openDueTodayLabel}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
            {plan.metrics.openDueToday}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 rounded-xl border border-border-color px-4 py-3 text-sm text-text-secondary">
        <span>{copy.cumulativeProgress(plan.metrics.completedDueThroughToday, plan.metrics.dueThroughToday)}</span>
        <span>{copy.backlogOpen(backlogOpen)}</span>
        <span>{plan.metrics.totalPlanned} {language === 'de' ? 'Ziele im Plan' : 'goals in plan'}</span>
      </div>

      {plan.nextEligibleGoal && (
        <section className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
            {copy.nextEligibleGoalLabel}
          </h3>
          <p className="mt-1 font-medium text-text-primary">
            {nextGoalLabel || copy.nextEligibleGoalTitleUnavailable}
          </p>
        </section>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-border-color p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <ListChecks size={17} aria-hidden="true" />
            {copy.currentBlockLabel}
          </h3>
          {plan.currentBlock ? (
            <>
              <p className="mt-2 font-medium text-text-primary">{plan.currentBlock.title}</p>
              <p className="mt-1 text-sm tabular-nums text-text-secondary">{currentPeriod}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">{copy.noCurrentBlock}</p>
          )}
        </section>

        <section className="rounded-xl border border-border-color p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Flag size={17} aria-hidden="true" />
            {copy.nextMilestoneLabel}
          </h3>
          {plan.nextMilestone ? (
            <>
              <p className="mt-2 font-medium text-text-primary">{plan.nextMilestone.title}</p>
              <p className="mt-1 text-sm tabular-nums text-text-secondary">
                {formatLearnerLearningPlanDate(plan.nextMilestone.date, language)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">{copy.noNextMilestone}</p>
          )}
        </section>

        <section className="rounded-xl border border-border-color p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <CalendarDays size={17} aria-hidden="true" />
            {copy.bufferLabel}
          </h3>
          <p className="mt-2 text-sm tabular-nums text-text-secondary">
            {copy.bufferValue(plan.buffer.remainingWorkdays, plan.buffer.totalWorkdays)}
          </p>
        </section>
      </div>

      <div
        data-testid="learner-plan-pace-neutral"
        data-status="neutral"
        className="mt-4"
      >
        <PacingGauge
          status="unavailable"
          label={copy.paceTitle}
          statusLabel={copy.paceUnavailableStatus}
          valueLabel={copy.paceNeutral}
          unavailableReason={getLearnerLearningPlanPaceMessage(plan.pace.reason, copy)}
        />
      </div>

      {plan.stale && (
        <p className="mt-4 rounded-xl border border-border-color p-4 text-sm text-text-secondary">
          {copy.stalePlan}
        </p>
      )}

      {staleDataMessage && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100" role="status">
          {staleDataMessage}
        </p>
      )}

      {planModeEnabled && plan.canContinue && navigationAvailable && !staleDataMessage && !actionsDisabled && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            data-testid="learner-plan-continue"
            aria-busy={isContinuing || undefined}
            disabled={isContinuing}
            onClick={() => onContinue(plan.planId)}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
          >
            {isContinuing ? copy.continueBusy : copy.continueAction}
          </button>
        </div>
      )}

      {planModeEnabled && plan.canContinue && !navigationAvailable && !staleDataMessage && !actionsDisabled && (
        <p
          data-testid="learner-plan-navigation-unavailable"
          className="mt-4 rounded-xl border border-border-color p-4 text-sm leading-6 text-text-secondary"
        >
          {copy.crossSubjectNavigationUnavailable}
        </p>
      )}

      {planModeEnabled && !plan.canContinue && !plan.stale && !staleDataMessage && !actionsDisabled && (
        <p
          data-testid="learner-plan-continue-status"
          className="mt-4 rounded-xl border border-border-color p-4 text-sm leading-6 text-text-secondary"
        >
          {plan.continueReason === 'active-goal-in-progress'
            ? copy.activeGoalInProgress
            : plan.metrics.openDueThroughToday === 0
              ? copy.nothingDue
              : copy.dueGoalBlocked}
        </p>
      )}
    </article>
  )
}
