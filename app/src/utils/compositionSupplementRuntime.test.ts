import assert from 'node:assert/strict'
import { combineSelectedCompositionDocuments, hasExplicitCompositionSupplements, applyCompositionViewProjection } from './compositionViewRuntime'
import { parseCompositionSupplementOptions, requestCompositionSupplementOptions } from './personalCurriculumEditorApi'
import { convertLearningGoal } from '../goalTypes'
import type { LearningGoal, SkillLandscape } from '../landscapeTypes'

const owner = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const selected = JSON.stringify({ [owner]: { selected: false, supplementSelections: [{ supplementId: 'TEST_ONLY', authorizationSha256: 'a'.repeat(64) }] } })
assert.equal(hasExplicitCompositionSupplements(selected), true)
assert.equal(hasExplicitCompositionSupplements(JSON.stringify({ [owner]: { selected: true } })), false)
// Catalog IDs and opaque saved selections are detected without granting authority.
const catalogOwner = 'catalog:arbitrary-subject@2027'
const otherOwner = 'catalog:other-subject'
const savedSubjects = {
  [catalogOwner]: { selected: false, supplementSelections: [{ staleOrUnknownSelection: true }] },
  [otherOwner]: { selected: true, supplementSelections: [] },
}
for (const config of [savedSubjects, { personalCurriculum: savedSubjects, metadata: { version: 1 } }]) {
  const value = JSON.stringify(config)
  assert.equal(hasExplicitCompositionSupplements(value), true)
  assert.equal(hasExplicitCompositionSupplements(value, undefined), true)
  assert.equal(hasExplicitCompositionSupplements(value, catalogOwner), true)
  for (const absentOwner of ['', ' ', 'unknown-owner', otherOwner, owner, '*', '__proto__']) {
    assert.equal(hasExplicitCompositionSupplements(value, absentOwner), false, absentOwner)
  }
}
assert.equal(hasExplicitCompositionSupplements(selected, owner), true)
for (const config of [
  null, true, 7, 'text', [], [{ supplementSelections: ['opaque'] }], {},
  { [catalogOwner]: null }, { [catalogOwner]: [] },
  { [catalogOwner]: { selected: true } },
  { [catalogOwner]: { supplementSelections: [] } },
  { [catalogOwner]: { supplementSelections: 'opaque' } },
  { [catalogOwner]: { supplementSelections: { length: 1 } } },
  { supplementSelections: ['top-level-metadata'] },
  { metadata: { nested: { supplementSelections: ['unrelated'] } } },
  { personalCurriculum: null, ...savedSubjects },
  { personalCurriculum: [], ...savedSubjects },
  { personalCurriculum: {}, metadata: savedSubjects },
]) {
  assert.equal(hasExplicitCompositionSupplements(JSON.stringify(config)), false, JSON.stringify(config))
}
for (const value of [undefined, null, '', '{invalid']) {
  assert.equal(hasExplicitCompositionSupplements(value), false)
}
// Even an invalid saved payload must reach backend validation and explicit recovery.
assert.equal(hasExplicitCompositionSupplements(JSON.stringify({ [catalogOwner]: { supplementSelections: [null] } }), catalogOwner), true)
const base = { viewId: 'TEST_ONLY_base', landscapeId: owner, scope: { schoolForm: 'Gymnasium', stage: 'SekI' }, rootNodes: [{ kind: 'structure', id: 'base', label: 'Base', children: [{ kind: 'goalEntry', goalId: 'TEST_ONLY_base_atom' }] }] }
const supplement = { viewId: 'TEST_ONLY_selected_supplement', landscapeId: owner, scope: base.scope, rootNodes: [{ kind: 'structure', id: 'preparation', label: 'Preparation', children: [{ kind: 'goalEntry', goalId: 'TEST_ONLY_extra' }] }] }
const combined = combineSelectedCompositionDocuments([base, supplement])!
assert.equal(combined.rootNodes.length, 2)
const goals = ['TEST_ONLY_base_atom', 'TEST_ONLY_extra'].map((id) => ({ id, title: id, description: 'TEST_ONLY', contains: [], requires: [], tags: [], dimensionTags: { framework: "TEST_ONLY", demandLevel: "AB1", processCompetencies: [], guidingIdeas: [], phase: "E" }, weight: 1, phase: 'E', core: true, level: 1 }) as LearningGoal)
const meta = { landscapeId: owner, goals, title: 'TEST_ONLY' } as SkillLandscape
const entry = { meta, goals: goals.map((goal) => convertLearningGoal(goal, { landscapeId: owner })) }
const projection = applyCompositionViewProjection([entry], combined)[0]
const structures = projection.goals.filter((goal) => goal.extendedData?.syntheticStructureKind === 'compositionView')
assert.deepEqual(structures.map((goal) => goal.id), ['composition:TEST_ONLY_base:structure:base', 'composition:TEST_ONLY_selected_supplement:structure:preparation'])
assert.equal(projection.goals.filter((goal) => goal.id === 'TEST_ONLY_base_atom').length, 1)
const onlySupplement = applyCompositionViewProjection([{ ...entry, goals: entry.goals.filter((goal) => goal.id === 'TEST_ONLY_extra') }], combineSelectedCompositionDocuments([supplement]))[0]
assert.equal(onlySupplement.goals.some((goal) => goal.id === 'TEST_ONLY_base_atom'), false)
assert.throws(() => combineSelectedCompositionDocuments([base, { ...supplement, landscapeId: 'wrong' }]), /Mixed composition owners/)
const response = { options: [{ optionId: 'opaque TEST_ONLY', label: 'Vorbereitung', labelEn: 'Preparation', action: 'ADD', mathCourseProfile: 'GK', targets: [{ goalId: 'TEST_ONLY_extra', title: 'Zusatz', titleEn: 'Extra' }], additionalAtomicTargets: 1 }], problemCode: null }
assert.equal(parseCompositionSupplementOptions(response).options[0].mathCourseProfile, 'GK')
assert.throws(() => parseCompositionSupplementOptions({ options: [{ ...response.options[0], action: 'CHANGE_RAW_TARGETS' }] }), /Invalid preparation/)
let captured: RequestInit | undefined
await requestCompositionSupplementOptions('TEST_ONLY_learner', 'opaque TEST_ONLY', { apiBase: '', fetchImpl: async (_url, options) => { captured = options; return new Response(JSON.stringify(response), { status: 200 }) } })
assert.deepEqual(JSON.parse(String(captured?.body)), { optionId: 'opaque TEST_ONLY' })
assert.equal(captured?.credentials, 'include')
console.log('Composition supplement frontend contract: passed (synthetic TEST_ONLY fixtures)')
