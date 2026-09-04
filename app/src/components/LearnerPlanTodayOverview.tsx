import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Flag,
  ListChecks,
  Play,
  Repeat2,
  Settings,
} from 'lucide-react'
import * as React from 'react'

import type { LearnerLearningPlanSummary } from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'
import { getLearnerLearningPlanCopy } from '../utils/learnerLearningPlanCopy'
import {
  formatLearnerLearningPlanDate,
  formatLearnerLearningPlanPeriod,
} from '../utils/learnerLearningPlanReadModel'

export interface LearnerPlanTodayOverviewProps {
  plans: readonly LearnerLearningPlanSummary[]
  language: LabelLanguage
  planModeEnabled: boolean
  subjectLabel: (landscapeId: string) => string
  goalLabel: (goalId: string) => string | undefined
  activeGoalId?: string | null
  activeLandscapeId?: string | null
  actionsDisabled?: boolean
  navigationAvailable?: (landscapeId: string) => boolean
  isReconciling?: boolean
  switchingPlanId?: string | null
  staleDataMessage?: string
  actionError?: string
  onContinue: () => void
  onSwitch: (planId: string) => void
  onOpenSettings: () => void
  onRetry?: () => void
}

const LearnerPlanDetails = ({
  plan,
  language,
  nextGoalLabel,
}: {
  plan: LearnerLearningPlanSummary
  language: LabelLanguage
  nextGoalLabel?: string
}) => {
  const copy = getLearnerLearningPlanCopy(language)
  const backlogOpen = Math.max(0, plan.metrics.openDueThroughToday - plan.metrics.openDueToday)

  return (
    <div className="mt-3 grid gap-3 border-t border-border-color pt-3 text-sm text-text-secondary sm:grid-cols-2">
      {plan.planLabel ? (
        <p className="sm:col-span-2">
          <span className="font-medium text-text-primary">{plan.planLabel}</span>
        </p>
      ) : null}
      <p>
        <span className="block text-xs font-medium uppercase tracking-wide">{copy.planPeriodLabel}</span>
        <span className="mt-1 block tabular-nums text-text-primary">
          {formatLearnerLearningPlanPeriod(plan.period.startDate, plan.period.endDate, language)}
        </span>
      </p>
      <p>
        <span className="block text-xs font-medium uppercase tracking-wide">{copy.dueTodayLabel}</span>
        <span className="mt-1 block text-text-primary">
          {plan.metrics.openDueToday} {language === 'de' ? 'offen' : 'open'}
          {' · '}
          {plan.metrics.completedDueToday} {language === 'de' ? 'beherrscht' : 'mastered'}
        </span>
      </p>
      <p className="sm:col-span-2">
        {copy.cumulativeProgress(
          plan.metrics.completedDueThroughToday,
          plan.metrics.dueThroughToday,
        )}
        {' · '}
        {copy.backlogOpen(backlogOpen)}
        {' · '}
        {plan.metrics.totalPlanned} {language === 'de' ? 'Ziele im Plan' : 'goals in plan'}
      </p>
      {plan.nextEligibleGoal ? (
        <p className="sm:col-span-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950/20">
          <span className="block text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
            {copy.nextEligibleGoalLabel}
          </span>
          <span className="mt-1 block font-medium text-text-primary">
            {nextGoalLabel || copy.nextEligibleGoalTitleUnavailable}
          </span>
        </p>
      ) : null}
      <p>
        <span className="flex items-center gap-2 font-medium text-text-primary">
          <ListChecks size={16} aria-hidden="true" />
          {copy.currentBlockLabel}
        </span>
        <span className="mt-1 block">
          {plan.currentBlock
            ? `${plan.currentBlock.title} · ${formatLearnerLearningPlanPeriod(plan.currentBlock.startDate, plan.currentBlock.endDate, language)}`
            : copy.noCurrentBlock}
        </span>
      </p>
      <p>
        <span className="flex items-center gap-2 font-medium text-text-primary">
          <Flag size={16} aria-hidden="true" />
          {copy.nextMilestoneLabel}
        </span>
        <span className="mt-1 block">
          {plan.nextMilestone
            ? `${plan.nextMilestone.title} · ${formatLearnerLearningPlanDate(plan.nextMilestone.date, language)}`
            : copy.noNextMilestone}
        </span>
      </p>
      <p className="sm:col-span-2">
        <span className="flex items-center gap-2 font-medium text-text-primary">
          <CalendarDays size={16} aria-hidden="true" />
          {copy.bufferLabel}
        </span>
        <span className="mt-1 block">
          {copy.bufferValue(plan.buffer.remainingWorkdays, plan.buffer.totalWorkdays)}
        </span>
      </p>
    </div>
  )
}

export const LearnerPlanTodayOverview = ({
  plans,
  language,
  planModeEnabled,
  subjectLabel,
  goalLabel,
  activeGoalId = null,
  activeLandscapeId = null,
  actionsDisabled = false,
  navigationAvailable = () => true,
  isReconciling = false,
  switchingPlanId = null,
  staleDataMessage,
  actionError,
  onContinue,
  onSwitch,
  onOpenSettings,
  onRetry,
}: LearnerPlanTodayOverviewProps) => {
  const copy = getLearnerLearningPlanCopy(language)
  const headingId = React.useId()
  const summaryId = React.useId()
  const validPlans = plans.filter((plan) => !plan.stale)
  const openThroughToday = validPlans.reduce(
    (sum, plan) => sum + plan.metrics.openDueThroughToday,
    0,
  )
  const activeSubject = activeLandscapeId ? subjectLabel(activeLandscapeId) : null
  const activeGoalLabel = activeGoalId ? goalLabel(activeGoalId) : undefined
  const allActionsDisabled = actionsDisabled || Boolean(staleDataMessage)

  return (
    <section
      data-testid="learner-plan-today-overview"
      aria-labelledby={headingId}
      aria-describedby={summaryId}
      className="rounded-2xl border border-sky-200 bg-sidebar-bg p-4 shadow-sm dark:border-sky-900/60 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id={headingId} className="text-xl font-bold text-text-primary">{copy.todayTitle}</h2>
            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
              {copy.todayScope(validPlans.length)}
            </span>
          </div>
          <p id={summaryId} className="mt-1 text-sm font-medium text-text-primary">
            {openThroughToday > 0 ? copy.todayOpen(openThroughToday) : copy.todayDone}
          </p>
          {openThroughToday > 0 ? (
            <p className="mt-1 text-xs text-text-secondary">{copy.includesBacklog}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:border-sky-800 dark:hover:bg-sky-950/30 dark:hover:text-sky-200"
        >
          <Settings size={16} aria-hidden="true" />
          {copy.openSettingsAction}
        </button>
      </div>

      {!planModeEnabled ? (
        <div className="mt-4 rounded-xl border border-border-color bg-input-bg/40 px-4 py-3 text-sm">
          <p className="font-semibold text-text-primary">{copy.planModeOffTitle}</p>
          <p className="mt-1 text-text-secondary">{copy.planModeOffBody}</p>
        </div>
      ) : activeGoalId && activeLandscapeId ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900/60 dark:bg-sky-950/20">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              {copy.currentGoalLabel} · {activeSubject}
            </p>
            {activeGoalLabel ? (
              <p className="mt-1 truncate font-medium text-text-primary" title={activeGoalLabel}>
                {activeGoalLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            data-testid="learner-plan-continue"
            disabled={allActionsDisabled || isReconciling || Boolean(switchingPlanId)}
            onClick={onContinue}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
          >
            <Play size={16} fill="currentColor" aria-hidden="true" />
            {copy.continueLearningAction}
          </button>
        </div>
      ) : isReconciling ? (
        <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-100" role="status">
          {copy.preparingNextGoal}
        </p>
      ) : null}

      {staleDataMessage ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100" role="alert">
          {staleDataMessage}
        </p>
      ) : null}
      {actionError ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100" role="alert">
          <p className="flex min-w-0 items-start gap-2">
            <CircleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            <span>{actionError}</span>
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-9 shrink-0 rounded-lg border border-current px-3 py-1.5 font-semibold"
            >
              {copy.retryAction}
            </button>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-4 divide-y divide-border-color border-y border-border-color">
        {plans.map((plan) => {
          const label = subjectLabel(plan.landscapeId)
          const isActive = Boolean(activeGoalId && plan.landscapeId === activeLandscapeId)
          const isSwitching = switchingPlanId === plan.planId
          const hasOpenDueGoal = plan.metrics.openDueThroughToday > 0
          const canSwitch = planModeEnabled
            && !isActive
            && !plan.stale
            && hasOpenDueGoal
            && Boolean(plan.nextEligibleGoal)
            && navigationAvailable(plan.landscapeId)

          return (
            <li
              key={plan.planId}
              data-testid={`learner-plan-subject-${plan.landscapeId}`}
              className="py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{label}</h3>
                    {isActive ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                        {copy.currentSubjectBadge}
                      </span>
                    ) : null}
                    {plan.stale ? (
                      <span className="rounded-full border border-amber-300 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:text-amber-200">
                        {language === 'de' ? 'Plan veraltet' : 'Plan out of date'}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {plan.stale
                      ? copy.stalePlan
                      : hasOpenDueGoal
                        ? plan.nextEligibleGoal
                          ? copy.openCount(plan.metrics.openDueThroughToday)
                          : copy.subjectBlocked
                        : copy.subjectDone}
                  </p>
                </div>
                {canSwitch ? (
                  <button
                    type="button"
                    data-testid="learner-plan-switch"
                    aria-busy={isSwitching || undefined}
                    disabled={allActionsDisabled || isReconciling || Boolean(switchingPlanId)}
                    onClick={() => onSwitch(plan.planId)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/30"
                  >
                    <Repeat2 size={16} aria-hidden="true" />
                    {isSwitching ? copy.switchBusy : copy.switchSubjectAction(label)}
                  </button>
                ) : null}
              </div>
              <details className="group mt-2 rounded-lg text-sm">
                <summary
                  aria-label={`${copy.detailsAction}: ${label}`}
                  className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1.5 font-medium text-text-secondary hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden"
                >
                  {copy.detailsAction}
                  <ChevronDown className="transition-transform group-open:rotate-180" size={16} aria-hidden="true" />
                </summary>
                <LearnerPlanDetails
                  plan={plan}
                  language={language}
                  nextGoalLabel={plan.nextEligibleGoal
                    ? goalLabel(plan.nextEligibleGoal.goalId)
                    : undefined}
                />
              </details>
            </li>
          )
        })}
      </ul>

      {planModeEnabled && !isReconciling && !activeGoalId && openThroughToday > 0 && !actionError ? (
        <p className="mt-4 flex items-start gap-2 text-sm text-text-secondary" role="status">
          <CircleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          <span>{copy.dueGoalBlocked}</span>
        </p>
      ) : null}
      {planModeEnabled && !isReconciling && !activeGoalId && openThroughToday === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {copy.nothingDue}
        </p>
      ) : null}
    </section>
  )
}
