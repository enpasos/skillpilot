// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(dir, '../../../../../../..')
const read = async (path: string) => JSON.parse(await readFile(resolve(root, path), 'utf8'))
const candidate = async (file: string) => JSON.parse(await readFile(resolve(dir, file), 'utf8'))
const delta = await candidate('canonical-and-dependencies.delta.candidate.json')
const views = await candidate('placements-and-views.delta.candidate.json')
const sources = await candidate('source-mappings-and-restrictions.delta.candidate.json')
const inventory = await candidate('current-source-bindings.inventory.json')
const profiles = await candidate('positive-evidence.full.candidates.json')
const holds = await candidate('remaining-source-scope-preservation.plan.json')
const actual = await read(delta.inputPath)
const parent = delta.parentBefore.id
const childIds: string[] = delta.childCandidates.map((g: any) => g.id)
const overlay = structuredClone(actual)
const currentBy = new Map(actual.goals.map((g: any) => [g.id, g]))
assert.deepEqual(currentBy.get(parent), delta.parentBefore, 'Parent before snapshot is stale')
overlay.goals[overlay.goals.findIndex((g: any) => g.id === parent)] = delta.parentAfterCandidate
for (const child of delta.childCandidates) {
  assert.ok(!currentBy.has(child.id), 'Candidate child already exists in active canonical')
  overlay.goals.push(child)
}
for (const change of delta.incomingRequiresDeltas) {
  assert.deepEqual(currentBy.get(change.goalBefore.id), change.goalBefore, `Stale incoming goal ${change.goalBefore.id}`)
  overlay.goals[overlay.goals.findIndex((g: any) => g.id === change.goalBefore.id)] = change.goalAfterCandidate
  assert.ok(!change.goalAfterCandidate.requires.includes(parent))
  for (const id of childIds) assert.ok(change.goalAfterCandidate.requires.includes(id))
}
assert.equal(delta.incomingRequiresDeltas.length, 3)
const by: Map<string, any> = new Map(overlay.goals.map((g: any) => [g.id, g]))
for (const relation of ['requires', 'contains']) {
  const visiting = new Set<string>(), visited = new Set<string>()
  const visit = (id: string) => {
    assert.ok(by.has(id), `Unknown ${relation} reference ${id}`)
    assert.ok(!visiting.has(id), `${relation} cycle involving ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of by.get(id)[relation] ?? []) visit(next)
    visiting.delete(id); visited.add(id)
  }
  for (const id of by.keys()) visit(id)
}
const normalized = normalizeCanonicalLandscape(overlay)
const owned = new Set([parent, ...childIds, ...delta.incomingRequiresDeltas.map((c: any) => c.goalBefore.id)])
assert.deepEqual(validateCanonicalLandscape(normalized).filter(f => f.severity === 'error' && owned.has(f.goalId ?? '')), [])
const normalizedCurrent = normalizeCanonicalLandscape(actual)
const beforeBy = new Map(normalizedCurrent.goals.map(g => [g.id, g]))
const afterBy = new Map(normalized.goals.map(g => [g.id, g]))
const getPointer = (v: any, pointer: string) => pointer.slice(1).split('/').reduce((o, k) => o[k.replaceAll('~1', '/').replaceAll('~0', '~')], v)
const replacePointer = (v: any, pointer: string, after: any) => {
  const parts = pointer.slice(1).split('/').map(k => k.replaceAll('~1', '/').replaceAll('~0', '~'))
  const key = parts.pop()!
  parts.reduce((o, k) => o[k], v)[key] = after
}
const reachability = []
let directEntries = 0
for (const file of (await readdir(resolve(root, 'curricula/DE/Gymnasium/composition-views/chemie'))).filter(f => f.endsWith('.view.json')).sort()) {
  const path = `curricula/DE/Gymnasium/composition-views/chemie/${file}`
  const before = await read(path), after = structuredClone(before)
  for (const change of views.authoredGoalEntryDeltas.filter((c: any) => c.path === path)) {
    assert.deepEqual(getPointer(before, change.pointer), change.nodeBefore, `Stale view ${path}`)
    replacePointer(after, change.pointer, change.nodeAfterCandidate)
    directEntries++
  }
  const beforeView = normalizeCompositionView(before), afterView = normalizeCompositionView(after)
  const beforeRoles = collectCompositionProjectionRoleGoalIds(beforeView.rootNodes, beforeBy)
  const afterRoles = collectCompositionProjectionRoleGoalIds(afterView.rootNodes, afterBy)
  const beforeErrors = compileCompositionView(beforeView, normalizedCurrent).findings.filter(f => f.severity === 'error')
  const afterErrors = compileCompositionView(afterView, normalized).findings.filter(f => f.severity === 'error')
  assert.deepEqual(afterErrors, beforeErrors, `${file}: introduces duplicate or invalid goal references`)
  const hasParent = beforeRoles.targetGoalIds.has(parent)
  for (const id of childIds) assert.equal(afterRoles.targetGoalIds.has(id), hasParent, `${file}: child scope differs from old whole competence`)
  for (const id of beforeRoles.targetGoalIds) assert.ok(afterRoles.targetGoalIds.has(id), `${file}: loses existing target ${id}`)
  const added = [...afterRoles.targetGoalIds].filter(id => !beforeRoles.targetGoalIds.has(id))
  assert.deepEqual(added.sort(), hasParent ? [...childIds].sort() : [])
  const beforeAtoms = [...beforeRoles.targetGoalIds].filter(id => (beforeBy.get(id)?.contains ?? []).length === 0)
  const afterAtoms = [...afterRoles.targetGoalIds].filter(id => (afterBy.get(id)?.contains ?? []).length === 0)
  if (hasParent) assert.equal(afterAtoms.length, beforeAtoms.length + 1)
  reachability.push({path, scopeBefore: before.scope, parentTargetBefore: hasParent,
                    childTargetsCandidate: childIds.filter(id => afterRoles.targetGoalIds.has(id)),
                    atomicTargetsBefore: beforeAtoms.length, atomicTargetsCandidate: afterAtoms.length,
                    unchangedCompileErrorCount: afterErrors.length})
}
assert.equal(directEntries, 26)
// Invoke the actual source helper, rather than simulating the boundary rule.
const atomIds = new Set<string>(overlay.goals.filter((g: any) => !g.contains?.length).map((g: any) => g.id))
for (const child of childIds) assert.deepEqual(sourceAtlasDescendants(child, by, atomIds, actual.landscapeId), [child])
for (const ancestor of inventory.ancestors) {
  const descendants = sourceAtlasDescendants(ancestor, by, atomIds, actual.landscapeId)
  for (const child of childIds) assert.ok(!descendants.includes(child), 'Old broad source bindings incorrectly authorize a new child')
}
for (const change of sources.mappingDeltas) {
  const map = await read(change.mappingPathBefore)
  assert.deepEqual(map.decisions.find((d: any) => d.sourceGoalId === change.sourceGoalId), change.decisionBefore, 'Stale source decision')
  const beforeEdges = map.mappings.filter((e: any) => e.legacyGoalId === change.sourceGoalId)
  if (change.edgeBefore) assert.ok(beforeEdges.some((e: any) => JSON.stringify(e) === JSON.stringify(change.edgeBefore)))
  for (const edge of [...change.replacementEdgesCandidate, ...(change.additionalEdgesCandidate ?? [])]) {
    assert.ok(childIds.includes(edge.canonicalGoalId))
    assert.equal(edge.matchType, 'partial', 'No each-child whole-source exact promotion is permitted')
  }
}
for (const change of sources.sourceExtractionGoalDeltas) {
  const extraction = await read(change.sourceExtractionPathBefore)
  assert.deepEqual(getPointer(extraction, change.goalPointer), change.sourceGoalBefore)
  assert.equal(change.sourceGoalBefore.sourceText, change.sourceGoalAfterCandidate.sourceText)
}
for (const change of holds.selectedCurrentSourceBindings) {
  const map = await read(change.mappingPathBefore)
  const extraction = await read(change.sourceExtractionPathBefore)
  assert.deepEqual(extraction.sourceGoals.find((g: any) => g.id === change.sourceGoalBefore.id), change.sourceGoalBefore)
  assert.deepEqual(map.decisions.find((d: any) => d.sourceGoalId === change.sourceGoalBefore.id), change.decisionBefore)
  assert.deepEqual(map.mappings.filter((e: any) => e.legacyGoalId === change.sourceGoalBefore.id), change.existingEdgesBefore)
}
for (const change of holds.alternativeNarrowDeltas) {
  if (change.sourceGoalAfterCandidate) {
    assert.equal(change.sourceGoalBefore.id, change.sourceGoalAfterCandidate.id)
    assert.equal(change.sourceGoalBefore.sourceText, change.sourceGoalAfterCandidate.sourceText)
    assert.equal(change.sourceGoalAfterCandidate.courseLevel, 'GK_LK')
    assert.ok(change.sourceGoalAfterCandidate.sourceRef.includes('55'))
  }
  for (const edge of change.proposedAdditionalEdges) {
    assert.ok(childIds.includes(edge.canonicalGoalId))
    assert.equal(edge.matchType, 'partial')
  }
}
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const ajv = new Ajv2020({allErrors: true, strict: true})
require('ajv-formats').default(ajv)
const schema = await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const validate = ajv.compile({$schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile})
for (const goal of profiles.goals) {
  assert.ok(childIds.includes(goal.goalId))
  assert.ok(validate(goal.profile), ajv.errorsText(validate.errors))
  const expectations = new Set(goal.profile.expectations.map((e: any) => e.id))
  for (const id of goal.profile.coverageExpectations.requiredExpectationIds) assert.ok(expectations.has(id))
  assert.ok(goal.profile.applicationCaseBriefs.length >= 2)
}
const receipt = {
  schemaVersion: 1, checkedAt: new Date().toISOString(), status: 'targeted-inactive-candidate-structural-check-pass',
  actualCanonicalSha256: 'sha256:' + createHash('sha256').update(await readFile(resolve(root, delta.inputPath))).digest('hex'),
  assertions: ['Exact current owned before snapshots', 'Stable child ID noncollision', 'requires and contains DAG',
               'Actual canonical validator on changed goals', 'Every authored Chemistry view: unchanged errors and old targets preserved',
               'All 26 explicit references expose both child mechanisms', 'Actual sourceAtlasDescendants respects atomic source boundary',
               'Exact current mapping decisions and source text', 'Exact supplemental source/decision/edge snapshots',
               'Stable source IDs/text and narrow HB/RP partial proposals', 'No exact each-child whole-source mapping', 'Full P-v2 profile schema'],
  authoredDirectEntryCount: directEntries, allAuthoredViewReachability: reachability,
  sourceScopeApproval: false, independentDescriptionReviewsComplete: false, machineVComplete: false,
  protectedM6Passed: false, integrationReady: false, strictNetIncrease: 0, humanApproval: false, humanTrial: false,
  unresolved: ['Jurisdiction-specific obligatory/optional/school-form/branch source evidence and target scope',
               'Independent D/P/A/M decisions and current bindings', 'Actual genuine PNGs and independent native/360/680 V',
               '2be strict reverse-context binding', 'Protected M6 source/projection checks at stable integration'],
}
await writeFile(resolve(dir, 'candidate-check.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({status: receipt.status, authoredDirectEntries: directEntries, authoredViews: reachability.length,
                          viewsReachingWholeCompetence: reachability.filter(v => v.parentTargetBefore).length, strictNetIncrease: 0, integrationReady: false}))
