import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { decodeGoalSetBits, goalSetBits } from './reportMathPhysicsNativeInventory'

const root = resolve(import.meta.dirname, '../..')
const inventory = JSON.parse(readFileSync(resolve(root,
  'docs/dev/learning-units-inventory/2026-11-06/native-math-physics.json'), 'utf8'))

// Check every recorded input without starting the backend. Missing files fail at readFileSync.
for (const [path, expected] of Object.entries(inventory.sources)) {
  const actual = createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')
  assert.equal(actual, expected, `${path}: native inventory source changed; inspect and regenerate the inventory`)
}

// Equal cardinality does not prove equal membership; byte and universe boundaries matter.
const universe = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
assert.notEqual(goalSetBits(universe, new Set(['a', 'i'])), goalSetBits(universe, new Set(['b', 'h'])))
assert.deepEqual(decodeGoalSetBits(universe, 'AQE='), ['a', 'i'])
assert.throws(() => decodeGoalSetBits(universe, 'AQ=='), /wrong universe size/u)

const rows = inventory.configurations as Array<{
  key: string; landscapeId: string; viewId: string | null; membershipClass: string
  scope: Record<string, string>; mergedFromViewIds: string[]
}>
assert.equal(new Set(rows.map(({ key }) => key)).size, rows.length)
assert.equal(rows.length, inventory.summary.configurations)
let checkedMembers = 0
for (const [id, raw] of Object.entries(inventory.membershipClasses)) {
  const group = raw as { landscapeId: string; targetBits: string; prerequisiteOnlyBits: string
    members: string[]; targetCounts: Record<string, number>; prerequisiteOnlyCounts: Record<string, number>
    foreignTargetCount: number; foreignPrerequisiteOnlyCount: number }
  const pool = inventory.goalUniverseIds as string[]
  const targets = decodeGoalSetBits(pool, group.targetBits)
  const support = decodeGoalSetBits(pool, group.prerequisiteOnlyBits)
  assert(!targets.some((goalId) => support.includes(goalId)))
  assert.equal(Object.values(group.targetCounts).reduce((a, b) => a + b, 0) + group.foreignTargetCount, targets.length)
  assert.equal(Object.values(group.prerequisiteOnlyCounts).reduce((a, b) => a + b, 0)
    + group.foreignPrerequisiteOnlyCount, support.length)
  assert.deepEqual(group.members, rows.filter((row) => row.membershipClass === id).map(({ key }) => key))
  checkedMembers += group.members.length
}
assert.equal(checkedMembers, rows.length)
for (const row of rows) {
  assert(inventory.membershipClasses[row.membershipClass], `${row.key}: missing class`)
  assert(!row.scope.jurisdiction || /^DE-[A-Z]{2}$/u.test(row.scope.jurisdiction))
  if (row.scope.stage === 'SekI') assert.equal(row.scope.courseProfile, undefined)
  if (row.scope.stage === 'SekII') assert.equal(row.scope.durationModel, undefined)
  if (row.scope.courseProfile === 'GK+LK' && row.viewId?.startsWith('merged:')) {
    assert(row.mergedFromViewIds.length > 1, 'Combined native views must retain their actual inputs')
  }
  if (!row.viewId) {
    const group = inventory.membershipClasses[row.membershipClass]
    const local = new Set(inventory.pools[row.landscapeId].goalIds)
    assert.equal(decodeGoalSetBits(inventory.goalUniverseIds, group.targetBits).filter((id) => local.has(id)).length, 0,
      'No learner view must never expose the full canonical pool as a substitute')
  }
}
for (const deck of inventory.decks) for (const reference of deck.references) {
  const actual = JSON.parse(readFileSync(resolve(root, reference.path), 'utf8'))
  assert.equal(reference.deckId, actual.deckId)
  assert.deepEqual(reference.cardIds, actual.cards.map((card: { id: string }) => card.id))
}
assert.equal(inventory.summary.memoryGoals, 11)
assert.equal(inventory.summary.deckReferences, 18)
console.log(`Native inventory integrity passed: ${rows.length} configurations, ${checkedMembers} classified members, 18 exact deck references.`)
