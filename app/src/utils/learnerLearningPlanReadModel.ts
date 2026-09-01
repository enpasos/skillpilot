import type {
  LearnerLearningPlanDate,
  LearnerLearningPlanSummary,
  LearnerLearningPlansResponse,
} from '../learnerLearningPlanTypes'
import type { LabelLanguage } from './filterLabels'

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u
const BERLIN_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const berlinDateKey = (epochMilliseconds = Date.now()): string =>
  BERLIN_DATE_FORMAT.format(new Date(epochMilliseconds))

/**
 * Returns a delay just beyond the next Europe/Berlin date boundary. Binary
 * search keeps this correct across both daylight-saving transitions and does
 * not depend on the browser's configured time zone.
 */
export const millisecondsUntilNextBerlinDateBoundary = (
  nowEpochMilliseconds = Date.now(),
): number => {
  const currentDate = berlinDateKey(nowEpochMilliseconds)
  let lower = nowEpochMilliseconds
  let upper = nowEpochMilliseconds + 36 * 60 * 60 * 1_000
  if (berlinDateKey(upper) === currentDate) {
    return 60 * 60 * 1_000
  }
  while (upper - lower > 1) {
    const middle = Math.floor((lower + upper) / 2)
    if (berlinDateKey(middle) === currentDate) lower = middle
    else upper = middle
  }
  return Math.max(1_000, upper - nowEpochMilliseconds + 1_000)
}

const parseDateOnly = (value: LearnerLearningPlanDate): Date | null => {
  const match = DATE_PATTERN.exec(value)
  if (!match) return null
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? date
    : null
}

/**
 * Prevents personal plan content from surviving a SkillPilot-ID/scope switch
 * for even one intermediate render.
 */
export const selectScopedLearnerLearningPlans = (
  plans: LearnerLearningPlansResponse | null,
  dataScopeKey: string,
  currentScopeKey: string,
): LearnerLearningPlansResponse | null => dataScopeKey === currentScopeKey ? plans : null

export const isLearnerPlanActionAvailable = (
  loadStatus: 'loading' | 'ready' | 'error',
  refreshInFlight = false,
): boolean => loadStatus === 'ready' && !refreshInFlight

const planUrgencyRank = (plan: LearnerLearningPlanSummary): number => {
  if (plan.stale) return 4
  if (plan.canContinue) return 0
  if (plan.metrics.openDueThroughToday > 0) return 1
  if (plan.metrics.dueToday > 0) return 2
  return 3
}

const compareStableText = (left: string, right: string): number => (
  left === right ? 0 : left < right ? -1 : 1
)

/** Actionable and overdue subjects stay ahead of completed or stale plans. */
export const sortLearnerLearningPlansForToday = (
  plans: readonly LearnerLearningPlanSummary[],
): LearnerLearningPlanSummary[] => [...plans].sort((left, right) => (
  planUrgencyRank(left) - planUrgencyRank(right)
  || right.metrics.openDueThroughToday - left.metrics.openDueThroughToday
  || compareStableText(left.landscapeId, right.landscapeId)
  || compareStableText(left.planId, right.planId)
))

export const formatLearnerLearningPlanDate = (
  value: LearnerLearningPlanDate,
  language: LabelLanguage,
): string => {
  const date = parseDateOnly(value)
  if (!date) return value
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export const formatLearnerLearningPlanPeriod = (
  startDate: LearnerLearningPlanDate,
  endDate: LearnerLearningPlanDate,
  language: LabelLanguage,
): string => `${formatLearnerLearningPlanDate(startDate, language)} – ${formatLearnerLearningPlanDate(endDate, language)}`
