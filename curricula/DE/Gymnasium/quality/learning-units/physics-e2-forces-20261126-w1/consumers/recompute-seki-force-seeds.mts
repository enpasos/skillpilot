// SPDX-License-Identifier: Apache-2.0
// Recompute both sides of the exact backend fixture using the authoring projection.
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

const [repository, output] = process.argv.slice(2)
assert(repository && output, 'Supply the working tree and a new output file')
const root = path.resolve(repository)
const base = '0c743ce7e3bea404e6a222168c925f281aa39c2b'
const prior = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/consumers/physics-seki-seed-fixtures.actual.json'
const read = (name: string) => fs.readFileSync(path.join(root, name))
const previous = (name: string) => execFileSync('git', ['show', base + ':' + name], {cwd: root, maxBuffer: 64 * 1024 * 1024})
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const helpers = ['app/src/hooks/useLandscapes.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts',
  'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/goalFilters.ts']
for (const file of helpers) assert.deepEqual(read(file), previous(file))
const load = (file: string) => import(pathToFileURL(path.join(root, file)).href)
const {prepareLandscapeEntries} = await load(helpers[0])
const {collectCompositionProjectionRoleGoalIds} = await load(helpers[1])
const {goalMatchesFilters} = await load(helpers[3])
const directory = 'curricula/DE/Gymnasium/canonical'
const catalogs = fs.readdirSync(path.join(root, directory)).filter(p => p.endsWith('.json')).sort().map(p => directory + '/' + p)
assert.equal(catalogs.length, 21)
type Goal = {id: string; type: string; tags: string[]; contains: string[]; requires: string[]}
function buildGraph(bytes: (file: string) => Buffer) {
  const documents = catalogs.map(file => JSON.parse(bytes(file).toString()))
  const goals = new Map<string, Goal>()
  for (const entry of prepareLandscapeEntries(documents)) {
    for (const goal of entry.goals) goals.set(goal.id, goal)
  }
  const roots = new Map(documents.map(doc => [doc.landscapeId, doc.goals.find((g: Goal) => g.tags?.includes('root'))?.id]))
  return {goals, roots}
}
type View = {viewId: string; rootNodes: unknown[]; scope: {jurisdiction: string}}
function project(graph: ReturnType<typeof buildGraph>, view: View, duration: string, course: string) {
  const {targetGoalIds} = collectCompositionProjectionRoleGoalIds(view.rootNodes, graph.goals, graph.roots)
  const seeds: string[] = []
  for (const id of targetGoalIds as Set<string>) {
    const goal = graph.goals.get(id)
    if (goal && goal.type !== 'cluster' && !goal.contains.length && goalMatchesFilters(goal, [view.scope.jurisdiction, course, duration])) seeds.push(id)
  }
  const closed = new Set(seeds)
  const queue = [...seeds]
  while (queue.length) {
    const goal = graph.goals.get(queue.pop()!)!
    for (const reference of goal.requires) {
      const id = reference.split(':').at(-1)!
      const prerequisite = graph.goals.get(id)
      assert(prerequisite && !prerequisite.contains.length, 'Unresolved or non-atomic prerequisite ' + id)
      if (!closed.has(id)) { closed.add(id); queue.push(id) }
    }
  }
  return {seeds: seeds.sort(), learning: [...closed].sort()}
}
type Fixture = {sourceViewPath: string; sourceViewId: string; sourceViewSha256: string; currentSeedAtomicGoalIds: string[]; currentLearningAtomicGoalIds: string[]}
const fixtures = JSON.parse(read(prior).toString()).scopes as Record<string, Fixture>
assert.deepEqual(read(prior), previous(prior))
const old = buildGraph(previous), current = buildGraph(read)
const balance = ['6ba20688-8cbf-5db1-bda8-346893798d2f', 'd513289a-80a3-5e48-95d3-5791736cddba']
const incline = ['77b44d13-4368-5950-a943-decb377c7302', '4af06e7e-c566-566d-bc99-53ada98fbf0e']
const additionsByLand = new Map([
  ...['DE-BY', 'DE-MV', 'DE-ST'].map(land => [land, [...balance, ...incline].sort()] as const),
  ...['DE-HE', 'DE-SL', 'DE-SN', 'DE-TH'].map(land => [land, balance] as const),
  ...['DE-BW', 'DE-HB', 'DE-HH'].map(land => [land, [] as string[]] as const),
])
const scopes: Record<string, object> = {}
const comparisons = []
const delta = (a: string[], b: string[]) => b.filter(id => !a.includes(id))
for (const [scope, fixture] of Object.entries(fixtures)) {
  const [,land,stage,duration,course] = scope.split('|')
  assert.equal(stage,'SekI')
  const viewBytes = previous(fixture.sourceViewPath)
  assert.equal(digest(viewBytes), fixture.sourceViewSha256)
  const before = project(old, JSON.parse(viewBytes.toString()), duration, course)
  assert.deepEqual(before.seeds, [...fixture.currentSeedAtomicGoalIds].sort())
  assert.deepEqual(before.learning, [...fixture.currentLearningAtomicGoalIds].sort())
  const view = read(fixture.sourceViewPath)
  const parsed = JSON.parse(view.toString())
  assert.equal(parsed.viewId, fixture.sourceViewId)
  assert.equal(parsed.scope.jurisdiction, land)
  const after = project(current, parsed, duration, course)
  const addedSeeds = delta(before.seeds, after.seeds), addedLearning = delta(before.learning, after.learning)
  const addedHere = additionsByLand.get(land)
  assert(addedHere, 'Scope outside the retained ten-Land backend fixture')
  assert.deepEqual(addedSeeds, addedHere, 'Unexpected seed change at ' + scope)
  assert.deepEqual(addedLearning, addedHere, 'Unexpected prerequisite closure change at ' + scope)
  assert.deepEqual(delta(after.seeds, before.seeds), [])
  assert.deepEqual(delta(after.learning, before.learning), [])
  comparisons.push({scope, beforeSeeds: before.seeds.length, afterSeeds: after.seeds.length,
    beforeLearning: before.learning.length, afterLearning: after.learning.length, addedSeeds, addedLearning})
  if (addedSeeds.length || addedLearning.length) {
    scopes[scope] = {currentSeedAtomicGoalIds: after.seeds, currentLearningAtomicGoalIds: after.learning,
      sourceViewPath: fixture.sourceViewPath, sourceViewId: parsed.viewId, sourceViewSha256: digest(view),
      addedSeedAtomicGoalIds: addedSeeds, removedSeedAtomicGoalIds: [], addedLearningAtomicGoalIds: addedLearning, removedLearningAtomicGoalIds: []}
  }
}
assert.equal(comparisons.length, 20)
assert.equal(Object.keys(scopes).length, 14)
fs.writeFileSync(output, JSON.stringify({schemaVersion: 1, method: 'Native scope, target-role and filter functions with an independent traversal of all atomic prerequisite chains on both catalogs.',
  predecessor: {path: prior, sha256: digest(read(prior))}, beforeCommit: base, comparisons, scopes}, null, 2) + '\n', {flag: 'wx'})
