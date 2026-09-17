import {
  ChevronDown,
  CircleAlert,
  Play,
  Repeat2,
  Settings,
} from 'lucide-react'
import * as React from 'react'

import type {
  LearnerLearningPlanSummary,
  LearnerPlanStatus,
  LearnerPlanSubjectStatus,
} from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'
import { getLearnerLearningPlanCopy } from '../utils/learnerLearningPlanCopy'
import {
  formatLearnerLearningPlanDate,
  formatLearnerLearningPlanPeriod,
} from '../utils/learnerLearningPlanReadModel'
import { LearnerPlanDailyProgress } from './LearnerPlanDailyProgress'

export interface LearnerPlanTodayOverviewProps {
  /** The one backend-formulated status; the cockpit renders it and derives nothing from metrics. */
  status: LearnerPlanStatus | null
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

/** Plan details describe the schedule only; the status itself never comes from here. */
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
        <span className="block text-xs font-medium uppercase tracking-wide">{copy.currentBlockLabel}</span>
        <span className="mt-1 block text-text-primary">
          {plan.currentBlock
            ? `${plan.currentBlock.title} · ${formatLearnerLearningPlanPeriod(plan.currentBlock.startDate, plan.currentBlock.endDate, language)}`
            : copy.noCurrentBlock}
        </span>
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
        <span className="block text-xs font-medium uppercase tracking-wide">{copy.nextMilestoneLabel}</span>
        <span className="mt-1 block">
          {plan.nextMilestone
            ? `${plan.nextMilestone.title} · ${formatLearnerLearningPlanDate(plan.nextMilestone.date, language)}`
            : copy.noNextMilestone}
        </span>
      </p>
      <p>
        <span className="block text-xs font-medium uppercase tracking-wide">{copy.bufferLabel}</span>
        <span className="mt-1 block">
          {copy.bufferValue(plan.buffer.remainingWorkdays, plan.buffer.totalWorkdays)}
        </span>
      </p>
      <p className="sm:col-span-2">
        {plan.metrics.totalPlanned} {language === 'de' ? 'Ziele im Plan' : 'goals in plan'}
      </p>
    </div>
  )
}

export const LearnerPlanTodayOverview = ({
  status,
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
  const weekly = status?.periodBasis === 'WEEK'
  const activeSubject = activeLandscapeId ? subjectLabel(activeLandscapeId) : null
  const activeGoalLabel = activeGoalId ? goalLabel(activeGoalId) : undefined
  const allActionsDisabled = actionsDisabled || Boolean(staleDataMessage)

  /**
   * Resolves the one plan behind a subject. A subject backed by several plans is deliberately
   * not switchable — the backend already withdrew that capability, and guessing here would
   * reintroduce the ambiguity it fails closed on.
   */
  const plansForSubject = (subject: LearnerPlanSubjectStatus) => plans.filter(
    (plan) => !plan.stale && subjectLabel(plan.landscapeId) === subject.subjectLabel,
  )

  return (
    <section
      data-testid="learner-plan-today-overview"
      aria-labelledby={headingId}
      aria-describedby={status && !status.evaluable ? summaryId : undefined}
      className="rounded-2xl border border-sky-200 bg-sidebar-bg p-4 shadow-sm dark:border-sky-900/60 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="text-xl font-bold text-text-primary">
            {weekly ? (language === 'de' ? 'Diese Woche' : 'This week') : copy.todayTitle}
          </h2>
          {/*
            The per-subject rows below already carry the backend's status line for every
            subject, split into period text and a coloured plan-status label. Repeating the
            combined text here would state the same thing twice and make the closed mobile
            view scroll. Only the unavailability notice, which no row covers, stays here.
          */}
          {status && !status.evaluable ? (
            <p
              id={summaryId}
              data-testid="learner-plan-status-notice"
              className="mt-1 text-sm text-text-secondary"
            >
              {language === 'de'
                ? 'Für mindestens ein Fach lässt sich der Planstand derzeit nicht bestimmen.'
                : 'For at least one subject the plan status cannot be determined right now.'}
            </p>
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
            {/* The backend announces the active goal neutrally; the cockpit does not rephrase it. */}
            {status?.activeGoal?.announcement ?? activeGoalLabel ? (
              <p
                data-testid="learner-plan-active-goal"
                className="mt-1 truncate font-medium text-text-primary"
                title={status?.activeGoal?.title ?? activeGoalLabel}
              >
                {status?.activeGoal?.announcement ?? activeGoalLabel}
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100" role="alert">
          <p>{staleDataMessage}</p>
          {onRetry && !actionError ? (
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
        {(status?.subjects ?? []).map((subject) => {
          const subjectPlans = plansForSubject(subject)
          const plan = subjectPlans.length === 1 ? subjectPlans[0] : null
          const isSwitching = plan ? switchingPlanId === plan.planId : false
          const canSwitch = planModeEnabled
            && !subject.current
            && subject.canContinue
            && plan !== null
            && Boolean(plan.nextEligibleGoal)
            && navigationAvailable(plan.landscapeId)

          return (
            <li
              key={subject.subjectKey}
              data-testid={`learner-plan-subject-${subject.subjectKey}`}
              className="py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 w-full sm:w-auto sm:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{subject.subjectLabel}</h3>
                    {subject.current ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                        {copy.currentSubjectBadge}
                      </span>
                    ) : null}
                  </div>
                  <LearnerPlanDailyProgress subject={subject} language={language} />
                </div>
                {canSwitch && plan ? (
                  <button
                    type="button"
                    data-testid="learner-plan-switch"
                    aria-busy={isSwitching || undefined}
                    disabled={allActionsDisabled || isReconciling || Boolean(switchingPlanId)}
                    onClick={() => onSwitch(plan.planId)}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-200 sm:w-auto dark:hover:bg-sky-950/30"
                  >
                    <Repeat2 size={16} aria-hidden="true" />
                    {isSwitching ? copy.switchBusy : copy.switchSubjectAction(subject.subjectLabel)}
                  </button>
                ) : null}
              </div>
              {plan ? (
                <details className="group mt-2 rounded-lg text-sm">
                  <summary
                    aria-label={`${copy.detailsAction}: ${subject.subjectLabel}`}
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
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
