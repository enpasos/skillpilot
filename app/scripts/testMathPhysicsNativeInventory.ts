import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { decodeGoalSetBits, goalSetBits } from './reportMathPhysicsNativeInventory'

const root = resolve(import.meta.dirname, '../..')

// Equal cardinality does not prove equal membership; byte and universe boundaries matter.
const universe = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
assert.notEqual(goalSetBits(universe, new Set(['a', 'i'])), goalSetBits(universe, new Set(['b', 'h'])))
assert.deepEqual(decodeGoalSetBits(universe, 'AQE='), ['a', 'i'])
assert.deepEqual(decodeGoalSetBits(universe, goalSetBits(universe, new Set())), [])
assert.deepEqual(decodeGoalSetBits(universe, goalSetBits(universe, new Set(universe))), universe)
assert.deepEqual(decodeGoalSetBits(universe, goalSetBits(universe, new Set(['h', 'c', 'zz']))), ['c', 'h'],
  'IDs outside the universe are not encoded; decoding keeps universe order')
assert.throws(() => decodeGoalSetBits(universe, 'AQ=='), /wrong universe size/u)
assert.equal(goalSetBits(universe.slice(0, 8), new Set(['a', 'h'])), 'gQ==')
console.log('Goal bitset encode/decode assertions passed.')

const inventoryArgIndex = process.argv.indexOf('--inventory')
const inventoryArg = inventoryArgIndex >= 0 ? process.argv[inventoryArgIndex + 1]
  : process.argv.find((arg) => arg.startsWith('--inventory='))?.slice('--inventory='.length)
if (inventoryArgIndex >= 0) assert(inventoryArg && !inventoryArg.startsWith('--'), '--inventory needs a path')
if (!inventoryArg) {
  console.log('Inventory integrity assertions skipped: pass --inventory <path> (repository-relative or absolute), '
    + 'e.g. --inventory tmp/learning-units/offered-membership.json after running reportMathPhysicsNativeInventory.ts.')
  process.exit(0)
}
const inventoryPath = isAbsolute(inventoryArg) ? inventoryArg : resolve(root, inventoryArg)
assert(existsSync(inventoryPath), `Inventory file not found: ${inventoryPath}`)
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'))

type Group = { landscapeId: string; targetBits: string; prerequisiteOnlyBits: string; seedTargetBits: string
  members: string[]; targetCounts: Record<string, number>; seedTargetCounts: Record<string, number>
  prerequisiteOnlyCounts: Record<string, number>
  foreignTargetCount: number; foreignSeedTargetCount: number; foreignPrerequisiteOnlyCount: number }
type Row = {
  key: string; landscapeId: string; viewId: string | null; membershipClass: string
  scope: Record<string, string>; mergedFromViewIds: string[]
}

const pool = inventory.goalUniverseIds as string[]
assert(Array.isArray(pool) && pool.every((id) => typeof id === 'string'), 'goalUniverseIds must be string[]')
assert.deepEqual(pool, [...new Set(pool)].sort(), 'goalUniverseIds must be unique and sorted')
for (const field of ['configurations', 'membershipClasses', 'summary', 'pools', 'decks', 'sources']) {
  assert(inventory[field] !== undefined, `Inventory lacks ${field}`)
}

const rows = inventory.configurations as Row[]
const classes = inventory.membershipClasses as Record<string, Group>
assert.equal(new Set(rows.map(({ key }) => key)).size, rows.length, 'Configuration keys must be unique')
assert.equal(rows.length, inventory.summary.configurations)
assert.equal(Object.keys(classes).length, inventory.summary.membershipClasses)

let checkedMembers = 0
for (const [id, group] of Object.entries(classes)) {
  const targets = decodeGoalSetBits(pool, group.targetBits)
  const support = decodeGoalSetBits(pool, group.prerequisiteOnlyBits)
  const supportSet = new Set(support)
  assert(!targets.some((goalId) => supportSet.has(goalId)), `${id}: target/support overlap`)
  assert.equal(typeof group.seedTargetBits, 'string', `${id}: missing seedTargetBits`)
  const seeds = decodeGoalSetBits(pool, group.seedTargetBits)
  const targetSet = new Set(targets)
  assert(seeds.every((goalId) => targetSet.has(goalId)), `${id}: seed target outside targets`)
  assert(!seeds.some((goalId) => supportSet.has(goalId)), `${id}: seed target/support overlap`)
  assert.equal(Object.values(group.targetCounts).reduce((a, b) => a + b, 0) + group.foreignTargetCount, targets.length,
    `${id}: target role counts do not add up`)
  assert.equal(Object.values(group.seedTargetCounts).reduce((a, b) => a + b, 0) + group.foreignSeedTargetCount, seeds.length,
    `${id}: seed target role counts do not add up`)
  assert.equal(Object.values(group.prerequisiteOnlyCounts).reduce((a, b) => a + b, 0)
    + group.foreignPrerequisiteOnlyCount, support.length, `${id}: support role counts do not add up`)
  assert(group.members.length > 0, `${id}: empty class`)
  assert.deepEqual(group.members, rows.filter((row) => row.membershipClass === id).map(({ key }) => key),
    `${id}: members disagree with configurations`)
  assert(group.members.every((key) => rows.find((row) => row.key === key)?.landscapeId === group.landscapeId),
    `${id}: member of another subject`)
  checkedMembers += group.members.length
}
assert.equal(checkedMembers, rows.length)
// Distinct classes of the same subject must differ in membership, not only in hash.
const membershipKeys = Object.values(classes).map((group) =>
  `${group.landscapeId}|${group.targetBits}|${group.prerequisiteOnlyBits}|${group.seedTargetBits}`)
assert.equal(new Set(membershipKeys).size, membershipKeys.length, 'Two classes share identical membership')

for (const row of rows) {
  assert(classes[row.membershipClass], `${row.key}: missing class`)
  assert(inventory.pools[row.landscapeId], `${row.key}: missing pool`)
  assert(!row.scope.jurisdiction || /^DE-[A-Z]{2}$/u.test(row.scope.jurisdiction))
  if (row.scope.stage === 'SekI') assert.equal(row.scope.courseProfile, undefined)
  if (row.scope.stage === 'SekII') assert.equal(row.scope.durationModel, undefined)
  if (row.scope.courseProfile === 'GK+LK' && row.viewId?.startsWith('merged:')) {
    assert(row.mergedFromViewIds.length > 1, 'Combined native views must retain their actual inputs')
  }
  if (!row.viewId) {
    const local = new Set(inventory.pools[row.landscapeId].goalIds)
    assert.equal(decodeGoalSetBits(pool, classes[row.membershipClass].targetBits).filter((id) => local.has(id)).length, 0,
      `${row.key}: no learner view must never expose the full canonical pool as a substitute`)
  }
}
assert.deepEqual([...inventory.summary.noMatchedView].sort(), rows.filter(({ viewId }) => !viewId).map(({ key }) => key).sort())

if (inventory.summary.bySubject) {
  for (const [landscapeId, subject] of Object.entries(inventory.summary.bySubject as Record<string, {
    configurations: number; configurationsByStage: Record<string, number>; membershipClasses: number }>)) {
    assert.equal(subject.configurations, rows.filter((row) => row.landscapeId === landscapeId).length)
    assert.equal(Object.values(subject.configurationsByStage).reduce((a, b) => a + b, 0), subject.configurations)
    assert.equal(subject.membershipClasses, Object.values(classes).filter((group) => group.landscapeId === landscapeId).length)
  }
}

let deckReferences = 0
for (const deck of inventory.decks) for (const reference of deck.references) {
  const actual = JSON.parse(readFileSync(resolve(root, reference.path), 'utf8'))
  assert.equal(reference.deckId, actual.deckId, `${reference.path}: deck ID changed`)
  assert.deepEqual(reference.cardIds, actual.cards.map((card: { id: string }) => card.id), `${reference.path}: cards changed`)
  deckReferences++
}
assert.equal(inventory.decks.length, inventory.summary.memoryGoals)
assert.equal(deckReferences, inventory.summary.deckReferences)
assert.equal(inventory.summary.memoryGoals, 11)
assert.equal(inventory.summary.deckReferences, 18)
console.log(`Native inventory integrity passed: ${rows.length} configurations, ${Object.keys(classes).length} membership classes, `
  + `${checkedMembers} classified members, ${deckReferences} exact deck references.`)
