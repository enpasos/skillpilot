import assert from 'node:assert/strict'
import { getWeeklyCompletionCounts, isRecordedCompletion, type MasteryHistoryEntry } from './masteryHistory'

const entry = (timestamp: string, source?: MasteryHistoryEntry['source']): MasteryHistoryEntry => ({
  goalId: 'goal', timestamp, value: 1, ...(source ? { source } : {}),
})
const history = [
  entry('2026-09-06T21:59:00Z', 'completion_event'), // Sunday in Berlin
  entry('2026-09-06T22:01:00Z', 'completion_event'), // Monday in Berlin
  entry('2026-09-08T10:00:00Z', 'legacy_last_updated'),
  entry('2026-09-08T10:00:00Z'),
  entry('invalid', 'completion_event'),
  entry('2026-09-12T10:00:00Z', 'completion_event'), // future
]
const counts = getWeeklyCompletionCounts(history, Date.parse('2026-09-11T12:00:00Z'))
assert.equal(counts.length, 8)
assert.deepEqual(counts.slice(-2), [{ key: '2026-08-31', count: 1 }, { key: '2026-09-07', count: 1 }])
assert.equal(counts.reduce((sum, week) => sum + week.count, 0), 2)
assert.equal(isRecordedCompletion(history[2]), false)
assert.equal(isRecordedCompletion(history[3]), false)
assert.deepEqual(getWeeklyCompletionCounts([
  entry('2026-03-29T21:59:00Z', 'completion_event'),
  entry('2026-03-29T22:01:00Z', 'completion_event'),
], Date.parse('2026-03-30T12:00:00Z')).slice(-2), [
  { key: '2026-03-23', count: 1 }, { key: '2026-03-30', count: 1 },
], 'Berlin week boundary remains correct across daylight saving')
console.log('Mastery completion history tests passed')
