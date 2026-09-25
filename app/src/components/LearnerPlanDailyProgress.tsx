import * as React from 'react'
import { Repeat2 } from 'lucide-react'
import type { LearnerPlanSubjectStatus } from '../learnerLearningPlanTypes'
import type { LabelLanguage } from '../utils/filterLabels'

const DIRECTION_CLASSES = {
  behind: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  on_track: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  ahead: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
} as const

const NEEDLE_CLASSES = {
  blue: 'text-sky-700 dark:text-sky-300',
  neutral: 'text-slate-600 dark:text-slate-200',
  red: 'text-red-700 dark:text-red-400',
  green: 'text-green-700 dark:text-green-400',
} as const

const SUBJECT_BADGE_CLASSES = 'rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200'

const ARC_PATH = 'M 18 83 A 62 62 0 0 1 142 83'
const ARC_STROKE_WIDTH = 20

/** The backend supplies the needle position; only SVG coordinates are calculated here. */
const needleEnd = (position: number) => {
  const angle = Math.PI * (1 - position)
  return { x: 80 + 48 * Math.cos(angle), y: 83 - 48 * Math.sin(angle) }
}

const Dial = ({
  title, description, position, range, needleTone, testId, children,
}: {
  title: React.ReactNode
  description: string
  position: number | null
  range: 'period' | 'balance'
  needleTone: keyof typeof NEEDLE_CLASSES
  testId: string
  children: React.ReactNode
}) => {
  const normalized = position === null ? null : range === 'balance' ? (position + 1) / 2 : position
  const bounded = normalized === null ? null : Math.max(0, Math.min(1, normalized))
  const end = bounded === null ? null : needleEnd(bounded)

  return (
    <div
      data-testid={testId}
      data-needle-position={position ?? undefined}
      className="flex h-full min-w-0 flex-col rounded-xl border border-border-color bg-input-bg/40 px-2 pb-1.5 pt-2 text-center"
    >
      <p className="min-h-7 text-sm font-semibold uppercase leading-4 tracking-wide text-text-secondary">{title}</p>
      <svg className="mx-auto mb-1 block h-auto w-full max-w-[156px]" viewBox="0 0 160 94" role="img" aria-label={description}>
        <path d={ARC_PATH} fill="none"
          className="text-[#8796aa] dark:text-[#a9b8c9]" stroke="currentColor" strokeWidth={ARC_STROKE_WIDTH} strokeLinecap="round" />
        {range === 'period' && bounded !== null && bounded > 0 ? (
          <path d={ARC_PATH} fill="none" pathLength={100}
            className="text-sky-600 dark:text-sky-200" stroke="currentColor"
            strokeDasharray={`${bounded * 100} 100`} strokeWidth={ARC_STROKE_WIDTH} strokeLinecap="round" />
        ) : null}
        {range === 'balance' && bounded !== null ? (
          <>
            <path d={ARC_PATH} fill="none" pathLength={100}
              className="text-red-600 dark:text-red-300" stroke="currentColor"
              strokeDasharray="30 100" strokeWidth={ARC_STROKE_WIDTH} strokeLinecap="round" />
            <path d={ARC_PATH} fill="none" pathLength={100}
              className="text-green-600 dark:text-green-300" stroke="currentColor"
              strokeDasharray="30 100" strokeDashoffset="-70" strokeWidth={ARC_STROKE_WIDTH} strokeLinecap="round" />
          </>
        ) : null}
        {end ? (
          <>
            <line x1="80" y1="83" x2={end.x} y2={end.y}
              className={NEEDLE_CLASSES[needleTone]} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="80" cy="83" r="5" className={NEEDLE_CLASSES[needleTone]} fill="currentColor" />
          </>
        ) : null}
      </svg>
      {children}
    </div>
  )
}

/** Displays one backend subject status and its two backend-scaled gauges. */
export const LearnerPlanDailyProgress = ({ subject, language, periodBasis, showGauges, currentBadgeLabel, switchAction }: {
  subject: LearnerPlanSubjectStatus
  language: LabelLanguage
  periodBasis: 'DAY' | 'WEEK'
  showGauges: boolean
  currentBadgeLabel: string
  switchAction?: {
    accessibleLabel: string
    label: string
    busy: boolean
    disabled: boolean
    onClick: () => void
  }
}) => {
  const isGerman = language === 'de'
  const periodTitle = periodBasis === 'WEEK'
    ? (isGerman ? 'Diese Woche' : 'This week')
    : (isGerman ? 'Heute' : 'Today')
  const balanceTitle = isGerman ? 'GESAMT' : 'OVERALL'
  const unavailable = isGerman ? 'Nicht auswertbar' : 'Unavailable'
  const hasGoalProgress = subject.achievedGoalCount !== undefined || subject.targetGoalCount !== undefined
  const balanceHeading = hasGoalProgress ? (
    <>
      {balanceTitle}: <span data-testid="learner-plan-achieved-goals" aria-live="polite" aria-atomic="true"
        className="normal-case tracking-normal text-text-primary">
        {subject.achievedGoalCount == null || subject.targetGoalCount == null
          ? (isGerman ? 'nicht verfügbar' : 'unavailable')
          : `${subject.achievedGoalCount} ${isGerman ? 'von' : 'of'} ${subject.targetGoalCount}`}
      </span>
    </>
  ) : balanceTitle
  const heading = (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="font-semibold text-text-primary">{subject.subjectLabel}</h3>
      {subject.current ? (
        <span data-testid="learner-plan-current-subject-badge" className={SUBJECT_BADGE_CLASSES}>
          {currentBadgeLabel}
        </span>
      ) : null}
      {switchAction ? (
        <button type="button" data-testid="learner-plan-switch"
          aria-label={switchAction.accessibleLabel}
          aria-busy={switchAction.busy || undefined}
          disabled={switchAction.disabled}
          onClick={switchAction.onClick}
          className={`inline-flex items-center gap-1 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-sky-900/70 ${SUBJECT_BADGE_CLASSES}`}>
          <Repeat2 size={14} aria-hidden="true" />
          {switchAction.label}
        </button>
      ) : null}
    </div>
  )
  const statusLine = subject.evaluable ? (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite" aria-atomic="true">
      {!showGauges ? <span className="text-sm text-text-primary">{subject.periodText}</span> : null}
      {subject.planStatusText ? (
        <span data-testid={`learner-plan-status-${subject.statusDirection ?? 'unknown'}`}
          data-status-direction={subject.statusDirection ?? undefined}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${DIRECTION_CLASSES[subject.statusDirection ?? 'on_track']}`}>
          {subject.planStatusText}
        </span>
      ) : null}
    </div>
  ) : null

  if (!showGauges) return <div>{heading}<div className="mt-1">{statusLine}</div></div>

  if (!subject.evaluable || !subject.periodGauge) {
    return (
      <div className="learner-plan-progress" data-testid="learner-plan-gauges-unavailable">
        <div className="learner-plan-progress-heading min-w-0">
          {heading}
        </div>
        <div className="learner-plan-progress-dials mt-2 grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
          <Dial title={periodTitle} description={`${subject.subjectLabel}: ${unavailable}`}
            position={null} range="period" needleTone="blue" testId="learner-plan-period-gauge">
            <p className="mt-auto text-sm text-text-secondary">{unavailable}</p>
          </Dial>
          <Dial title={balanceHeading} description={`${subject.subjectLabel}: ${unavailable}`}
            position={null} range="balance" needleTone="neutral" testId="learner-plan-balance-gauge">
            <p className="mt-auto text-sm text-text-secondary">{unavailable}</p>
          </Dial>
        </div>
      </div>
    )
  }

  const { periodGauge, balanceGauge } = subject
  const balanceDialText = subject.balanceDialText ?? subject.planStatusText
  const periodCount = isGerman
    ? `${periodGauge.completed} von ${periodGauge.target}`
    : `${periodGauge.completed} of ${periodGauge.target}`
  const noTarget = isGerman ? 'Nichts geplant' : 'Nothing planned'
  const balanceUnavailable = isGerman ? 'Skala nicht verfügbar' : 'Scale unavailable'
  const balanceSeverity = !balanceGauge ? 'scale-unavailable'
    : balanceGauge.severeBehind ? 'severe-behind'
      : balanceGauge.strongAhead ? 'strong-ahead' : subject.statusDirection
  const balanceNeedleTone = balanceGauge?.severeBehind ? 'red'
    : subject.statusDirection === 'ahead' ? 'green' : 'neutral'
  return (
    <div className="learner-plan-progress">
      <div className="learner-plan-progress-heading min-w-0">
        {heading}
      </div>
      <div className="learner-plan-progress-dials mt-2 grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
        <Dial title={periodTitle}
          description={`${subject.subjectLabel}: ${periodGauge.target === 0 ? noTarget : `${periodTitle}, ${periodCount}`}`}
          position={periodGauge.needlePosition} range="period" needleTone="blue" testId="learner-plan-period-gauge">
          <p className="mt-auto text-sm font-semibold leading-5 text-text-primary">
            {periodGauge.target === 0 ? noTarget : periodCount}
          </p>
        </Dial>
        <div className="h-full" data-severity={balanceSeverity}>
          <Dial title={balanceHeading}
            description={`${subject.subjectLabel}: ${subject.planStatusText}${balanceGauge ? '' : `. ${balanceUnavailable}`}.`}
            position={balanceGauge?.needlePosition ?? null} range="balance"
            needleTone={balanceNeedleTone} testId="learner-plan-balance-gauge">
            <p data-testid={`learner-plan-status-${subject.statusDirection ?? 'unknown'}`}
              data-status-direction={subject.statusDirection ?? undefined}
              aria-live="polite" aria-atomic="true"
              className="mt-auto text-sm font-semibold leading-5 text-text-primary">
              {balanceDialText}
            </p>
            {!balanceGauge ? <p className="text-xs leading-4 text-text-secondary">{balanceUnavailable}</p> : null}
          </Dial>
        </div>
      </div>
    </div>
  )
}
