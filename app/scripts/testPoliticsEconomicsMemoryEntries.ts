import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  resolvePoliticsEconomicsMemoryEntries,
  type PoliticsEconomicsMemoryGoal,
} from './lib/politicsEconomicsMemoryEntries'

const fixture = JSON.parse(readFileSync(fileURLToPath(new URL(
  '../../contracts/canonical-goal-identity/v1/fixtures/politics-economics-memory-before-id-repair.json',
  import.meta.url,
)), 'utf8')) as {
  goals: PoliticsEconomicsMemoryGoal[]
  orderedEntries: { kind: 'goalEntry'; goalId: string; displayLabel: string }[]
}

// The checked-in fixture was extracted from the original canonical bytes and
// original fallback at the pinned pre-ID commit, independently of this helper.
assert.deepEqual(resolvePoliticsEconomicsMemoryEntries(fixture.goals), fixture.orderedEntries)
assert.deepEqual(resolvePoliticsEconomicsMemoryEntries([...fixture.goals].reverse()), fixture.orderedEntries)

const newIds = fixture.goals.map((_, index) => `10000000-0000-5000-8000-${String(index + 1).padStart(12, '0')}`)
const renamed = fixture.goals.map((goal, index) => ({ ...goal, id: newIds[index] }))
assert.deepEqual(resolvePoliticsEconomicsMemoryEntries(renamed), fixture.orderedEntries.map((entry, index) => ({
  ...entry,
  goalId: newIds[index],
})))

assert.throws(
  () => resolvePoliticsEconomicsMemoryEntries(fixture.goals.slice(1)),
  /Expected exactly one canonical .*found 0/u,
)
assert.throws(
  () => resolvePoliticsEconomicsMemoryEntries([...fixture.goals, { ...fixture.goals[0], id: newIds[0] }]),
  /Expected exactly one canonical .*found 2/u,
)
assert.throws(
  () => resolvePoliticsEconomicsMemoryEntries(fixture.goals.map((goal) => ({ ...goal, id: newIds[0] }))),
  /five distinct canonical goals/u,
)
assert.throws(
  () => resolvePoliticsEconomicsMemoryEntries(fixture.goals.map((goal, index) => ({ ...goal, id: index === 0 ? '' : goal.id }))),
  /no valid identity/u,
)

console.log('Politik/Wirtschaft memory entries: original ordered five, changed identities and four genuine invalid controls passed')
