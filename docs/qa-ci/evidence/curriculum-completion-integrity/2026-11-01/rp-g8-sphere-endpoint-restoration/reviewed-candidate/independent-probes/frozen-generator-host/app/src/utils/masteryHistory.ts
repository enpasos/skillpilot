import { berlinDateKey } from './learnerLearningPlanReadModel'

export interface MasteryHistoryEntry {
  goalId: string
  timestamp: string
  value: number
  source?: 'completion_event' | 'legacy_last_updated'
}

/** Old snapshots are useful history, but never evidence of a completion date. */
export const isRecordedCompletion = (entry: MasteryHistoryEntry): boolean =>
  entry.source === 'completion_event'

const weekKey = (epochMilliseconds: number): string => {
  const date = new Date(`${berlinDateKey(epochMilliseconds)}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date.toISOString().slice(0, 10)
}

export const getWeeklyCompletionCounts = (
  history: readonly MasteryHistoryEntry[],
  now = Date.now(),
): Array<{ key: string; count: number }> => {
  const thisMonday = new Date(`${weekKey(now)}T12:00:00Z`)
  const weeks = new Map<string, number>()
  for (let i = 7; i >= 0; i -= 1) {
    const date = new Date(thisMonday)
    date.setUTCDate(date.getUTCDate() - i * 7)
    weeks.set(date.toISOString().slice(0, 10), 0)
  }
  for (const entry of history) {
    const timestamp = Date.parse(entry.timestamp)
    if (!isRecordedCompletion(entry) || !Number.isFinite(timestamp) || timestamp > now) continue
    const key = weekKey(timestamp)
    if (weeks.has(key)) weeks.set(key, weeks.get(key)! + 1)
  }
  return Array.from(weeks, ([key, count]) => ({ key, count }))
}
