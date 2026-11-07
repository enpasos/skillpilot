// SPDX-License-Identifier: Apache-2.0
// Existing native compilers/consumers only; no alternative scope engine.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {
  normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds,
} from '../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { applyCompositionViewProjection } from '../../../../app/src/utils/compositionViewRuntime.ts'
import { convertLearningGoal } from '../../../../app/src/goalTypes.ts'
import { goalMatchesFilters } from '../../../../app/src/utils/goalFilters.ts'

const ram = '/dev/shm/skillpilot-math-e4de-duration-20261107'
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const old = load(ram + '/baseline-source.json')
const current = load(ram + '/candidate-source.json')
const oldCanonical = normalizeCanonicalLandscape(old)
const newCanonical = normalizeCanonicalLandscape(current)
const oldUi = old.goals.map((goal: Parameters<typeof convertLearningGoal>[0]) => convertLearningGoal(goal, { landscapeId: old.landscapeId }))
const newUi = current.goals.map((goal: Parameters<typeof convertLearningGoal>[0]) => convertLearningGoal(goal, { landscapeId: current.landscapeId }))
const policy = load(ram + '/candidate-policy.json')
const files: string[] = [...policy.sek1Templates.map((row: { fileName: string }) => row.fileName),
  ...policy.crossStageTemplates.map((row: { outputFileName: string }) => row.outputFileName)]
assert.equal(new Set(files).size, 18)
const allowed = new Set(['0c2ddfcd-1399-41ad-aaed-4f061812602a', 'ce198bc9-b014-52ba-814f-25cc3e020668', 'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe'])
const rows = []
for (const file of files) {
  const bytes = readFileSync(ram + '/baseline-views/' + file)
  assert(bytes.equals(readFileSync(ram + '/candidate-views/' + file)))
  assert(bytes.equals(readFileSync('curricula/DE/Gymnasium/composition-views/mathematik/' + file)))
  const view = normalizeCompositionView(JSON.parse(bytes.toString('utf8')))
  const left = compileCompositionView(view, oldCanonical)
  const right = compileCompositionView(view, newCanonical)
  assert.deepEqual(left, right, file + ': complete native tree/order/findings')
  assert.equal(left.findings.filter(row => row.severity === 'error').length, 0)
  const oldRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(oldCanonical.goals.map(goal => [goal.id, goal])))
  const newRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(newCanonical.goals.map(goal => [goal.id, goal])))
  for (const key of ['targetGoalIds', 'prerequisiteOnlyGoalIds'] as const) {
    assert.deepEqual([...oldRoles[key]].sort(), [...newRoles[key]].sort(), file + ': ' + key)
  }
  const oldProjected = applyCompositionViewProjection([{ meta: old, goals: oldUi }], view)[0].goals
  const newProjected = applyCompositionViewProjection([{ meta: current, goals: newUi }], view)[0].goals
  assert.equal(oldProjected.length, newProjected.length)
  const actualPayloadDeltas = []
  for (let i = 0; i < oldProjected.length; i++) {
    const before = oldProjected[i]
    const after = newProjected[i]
    assert.equal(before.id, after.id, file + ': actual App goal order')
    if (JSON.stringify(before) === JSON.stringify(after)) continue
    assert(allowed.has(before.id), file + ': unrelated App payload delta ' + before.id)
    const fields = Object.keys({ ...before, ...after }).filter(key => JSON.stringify(before[key as keyof typeof before]) !== JSON.stringify(after[key as keyof typeof after]))
    const allowedFields = before.id.startsWith('0c2') ? ['description', 'requires', 'effectiveRequires'] : before.id.startsWith('ce198') ? ['requires', 'effectiveRequires', 'resourceLinks'] : ['requires', 'effectiveRequires']
    assert(fields.every(field => allowedFields.includes(field)), file + ': unplanned App field ' + fields.join(','))
    actualPayloadDeltas.push({ goalId: before.id, fields,
      before: Object.fromEntries(fields.map(field => [field, before[field as keyof typeof before]])),
      after: Object.fromEntries(fields.map(field => [field, after[field as keyof typeof after]])) })
  }
  const filters = [view.scope.jurisdiction, view.scope.durationModel, view.scope.courseProfile].filter(Boolean) as string[]
  const selected = (ui: typeof oldUi, roles: typeof oldRoles) => ui.filter((goal: typeof oldUi[number]) => roles.targetGoalIds.has(goal.id) && goal.contains.length === 0 && goalMatchesFilters(goal, filters)).map((goal: typeof oldUi[number]) => goal.id).sort()
  const oldTargets = selected(oldUi, oldRoles)
  const newTargets = selected(newUi, newRoles)
  assert.deepEqual(oldTargets, newTargets, file + ': actual filtered atomic targets')
  rows.push({ fileName: file, rawBytesSha256: createHash('sha256').update(bytes).digest('hex'), scope: view.scope,
    exactNativeTreeAndFindingsEqual: true, compiledOldSha256: hash(left), compiledCandidateSha256: hash(right), compilerErrors: 0,
    exactRoleMembershipEqual: true, targetRoleGoalIds: [...oldRoles.targetGoalIds].sort(), prerequisiteOnlyRoleGoalIds: [...oldRoles.prerequisiteOnlyGoalIds].sort(),
    exactFilteredAtomicTargetsEqual: true, filteredAtomicTargets: oldTargets, actualAppGoalOrderEqual: true,
    actualAppProjectedGoalCount: oldProjected.length, allOtherAppPayloadFieldsEqual: true, actualPayloadDeltas })
}
console.log(JSON.stringify({ status: 'PASS-unapplied-technical-layout-review', outputs: rows,
  all18BaselineCandidateLiveRawBytesEqual: true, all18NativeTreeFindingsRoleScopeAndFilteredTargetSetsEqual: true,
  payloadBoundary: 'The App retains the three reviewed direct prerequisite edits, exact diagram B description and five native matrix resource metadata changes. No full goal payload equality is claimed.',
  noLiveSourcePolicyQaOrViewWrites: true, noMaturityOrWholeSubjectQaPassClaimed: true }, null, 2))
