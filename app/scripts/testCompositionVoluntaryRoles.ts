// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { assertNoCurriculumOffers, checkCurriculumViewSource } from './lib/curriculumVoluntaryOfferGuard'
import {
  COMPOSITION_VIEW_13_SCHEMA, collectCompositionProjectionRoleGoalIds, compileCompositionView,
  getCompositionProjectionRole, normalizeCompositionView,
  type CompositionGoalEntryNode, type CompositionStructureNode, type CompositionView, type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'

const atom = (id: string, requires: string[] = [], coveredGoalIds?: string[]) => ({
  id, title: id, requires, contains: [], type: 'atomic',
  ...(coveredGoalIds ? { examData: { coveredGoalIds } } : {}),
})
const landscape = normalizeCanonicalLandscape({ landscapeId: 'subject', title: 'Subject', goals: [
  { id: 'root', title: 'Subject', requires: [], contains: ['regular', 'support', 'offers', 'opaque'], tags: ['root'] },
  atom('regular', ['implicit']), atom('support'), atom('implicit'),
  { id: 'offers', title: 'Offers', requires: [], contains: ['offer', 'other-offer'] },
  atom('offer', ['regular', 'support', 'other-offer']), atom('other-offer'),
  atom('offer-exam', ['offer'], ['regular', 'offer']),
  atom('mixed-exam', [], ['regular', 'offer']),
  atom('group-exam', [], ['offers']),
  { id: 'opaque', title: 'Independent group', requires: [], contains: ['nested'] },
  { id: 'nested', title: 'Nested source', requires: [], contains: ['opaque-atom'] },
  atom('opaque-atom', ['implicit']), atom('dependent', ['via']), atom('via', ['offer']),
  atom('optional-preparation', ['other-offer']), atom('prepared-offer', ['optional-preparation']),
  atom('implicit-exam-dependent', ['mixed-exam']),
  { id: 'inheritance-parent', title: 'Canonical parent', requires: ['offer'], contains: ['inherited-regular'] },
  atom('inherited-regular'),
  { id: 'support-parent', title: 'Canonical parent with support', requires: ['implicit'], contains: ['inherited-support-target'] },
  atom('inherited-support-target'),
  { id: 'scope-with-dormant', title: 'Effective regular scope', requires: [], contains: ['regular', 'optional-preparation'] },
  { id: 'empty-cluster', title: 'Empty structural source', type: 'cluster', requires: [], contains: [] },
] })
const goalById = new Map(landscape.goals.map(goal => [goal.id, goal]))
const entry = (goalId: string, projectionRole?: CompositionGoalEntryNode['projectionRole']): CompositionGoalEntryNode =>
  ({ kind: 'goalEntry', goalId, ...(projectionRole ? { projectionRole } : {}) })
const section = (id: string, children: CompositionViewNode[]): CompositionStructureNode =>
  ({ kind: 'structure', id, label: id, children })
const makeView = (rootNodes: CompositionViewNode[]): CompositionView => ({
  $schema: COMPOSITION_VIEW_13_SCHEMA, viewFormatVersion: '1.3', viewId: 'voluntary-contract',
  landscapeId: 'subject', language: 'de', scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE' }, rootNodes,
})
const offered = () => section('Voluntary offers', [entry('offer', 'voluntary'), entry('other-offer', 'voluntary'), entry('offer-exam', 'voluntary')])
const view = makeView([section('Regular', [entry('regular')]), entry('support', 'prerequisiteOnly'), offered()])
const compile = (candidate: CompositionView) => compileCompositionView(candidate, landscape)
const errors = (candidate: CompositionView) => compile(candidate).findings.filter(finding => finding.severity === 'error')
const sorted = (set: Set<string>) => [...set].sort()
function mixedSectionPreservesSiblingRoles() {
  const siblings = [entry('regular'), entry('other-offer', 'voluntary'), entry('support', 'prerequisiteOnly')]
  const mixed = normalizeCompositionView(makeView([section('Mixed', siblings)]))
  assert.deepEqual(mixed.rootNodes[0], section('Mixed', siblings))
  const compiled = compile(mixed)
  assert.deepEqual(compiled.findings, [])
  assert.deepEqual(sorted(compiled.projectionRoles.targetAtomicGoalIds), ['regular'])
  assert.deepEqual(sorted(compiled.projectionRoles.prerequisiteOnlyAtomicGoalIds), ['implicit', 'support'])
  assert.deepEqual(sorted(compiled.projectionRoles.voluntaryAtomicGoalIds), ['other-offer'])
  assert.deepEqual(compiled.compiledRootNodes[0].children.map(child => child.sourceGoalId), ['regular', 'other-offer'])
}
mixedSectionPreservesSiblingRoles()
const result = compile(normalizeCompositionView(view))
// The format accepts this test view, but curriculum activation is still pinned at zero.
const sourceBytes = JSON.stringify(view)
for (const encoded of [sourceBytes, sourceBytes.replaceAll('voluntary', '\\u0076oluntary')]) {
  assert.throws(() => checkCurriculumViewSource('test source', Buffer.from(encoded)),
    /test source: expected 0 voluntary entries, found 3/)
}
assert.throws(() => assertNoCurriculumOffers('test runtime', result.compiledRootNodes),
  /test runtime: expected 0 voluntary entries, found 3/)
assert.deepEqual(result.findings, [], 'A mixed view with an entirely voluntary section compiles.')
assert.deepEqual(sorted(result.projectionRoles.targetGoalIds), ['regular'])
assert.deepEqual(sorted(result.projectionRoles.prerequisiteOnlyGoalIds), ['support'])
assert.deepEqual(sorted(result.projectionRoles.voluntaryGoalIds), ['offer', 'offer-exam', 'other-offer'])
assert.deepEqual(sorted(result.projectionRoles.targetAtomicGoalIds), ['regular'])
assert.deepEqual(sorted(result.projectionRoles.prerequisiteOnlyAtomicGoalIds), ['implicit', 'support'])
assert.deepEqual(sorted(result.projectionRoles.voluntaryAtomicGoalIds), ['offer', 'offer-exam', 'other-offer'])
assert.equal(result.compiledRootNodes[1].label, 'Voluntary offers')
assert(result.compiledRootNodes[1].children.every(child => child.projectionRole === 'voluntary'))
for (const sets of [
  [result.projectionRoles.targetGoalIds, result.projectionRoles.prerequisiteOnlyGoalIds, result.projectionRoles.voluntaryGoalIds],
  [result.projectionRoles.targetAtomicGoalIds, result.projectionRoles.prerequisiteOnlyAtomicGoalIds, result.projectionRoles.voluntaryAtomicGoalIds],
]) {
  assert.equal(new Set(sets.flatMap(set => [...set])).size, sets.reduce((sum, set) => sum + set.size, 0))
}
assert.equal(result.projectionRoles.targetAtomicGoalIds.size, 1, 'Offers and their assessments never increase the regular target denominator.')
const qualified = collectCompositionProjectionRoleGoalIds([{ kind: 'canonicalSubtree', goalId: 'subject:root' }], new Map([
  ['subject:root', { contains: ['subject:regular'] }],
  ['subject:regular', { requires: ['subject:implicit'] }], ['subject:implicit', {}],
]))
assert.deepEqual(sorted(qualified.targetGoalIds), ['subject:regular', 'subject:root'], 'Known qualified graph keys retain their namespace.')
assert.deepEqual(sorted(qualified.prerequisiteOnlyAtomicGoalIds), ['subject:implicit'])
assert.deepEqual(errors(makeView([offered()])), [], 'No mandatory child is required for a section or view of voluntary offers.')
assert.deepEqual(errors(makeView([entry('opaque')])), [], 'An opaque group induces its atoms at the one authored place.')
assert.deepEqual(sorted(compile(makeView([entry('opaque')])).projectionRoles.targetAtomicGoalIds), ['opaque-atom'])
assert.deepEqual(sorted(compile(makeView([entry('inherited-support-target')])).projectionRoles.prerequisiteOnlyAtomicGoalIds), ['implicit'],
  'Implicit preparation includes inherited canonical requirements when the canonical parent is absent from the view.')

let negatives = 0
function rejects(name: string, candidate: CompositionView, code: string) {
  assert(errors(candidate).some(finding => finding.code === code), `${name}: ${JSON.stringify(errors(candidate))}`)
  negatives++
}
rejects('duplicate visible offer', makeView([offered(), section('Again', [entry('offer', 'voluntary')])]), 'CPV-014')
rejects('missing canonical visible place', makeView([entry('missing', 'voluntary')]), 'CPV-002')
rejects('voluntary acquisition place', makeView([section('Offers', [{ ...entry('offer', 'voluntary'), acquisitionPlacement: true }])]), 'CPV-011')
rejects('non-atomic voluntary goal', makeView([entry('opaque', 'voluntary')]), 'CPV-013')
rejects('empty cluster is not a voluntary atom', makeView([entry('empty-cluster', 'voluntary')]), 'CPV-013')
assert.equal(compile(makeView([entry('empty-cluster')])).projectionRoles.targetAtomicGoalIds.size, 0,
  'An explicitly structural empty cluster never inflates the atomic target denominator.')
rejects('conflicting explicit role', makeView([offered(), entry('offer')]), 'CPV-013')
rejects('conflicting inherited child role', makeView([{ kind: 'canonicalSubtree', goalId: 'offers' }, offered()]), 'CPV-013')
rejects('conflicting explicit target and preparation', makeView([entry('regular'), entry('regular', 'prerequisiteOnly')]), 'CPV-013')
rejects('mandatory direct path through offer', makeView([entry('offer-exam'), offered()]), 'CPV-015')
rejects('mandatory transitive path through offer', makeView([entry('dependent'), offered()]), 'CPV-015')
rejects('inherited canonical prerequisite path through offer', makeView([entry('inherited-regular'), offered()]), 'CPV-015')
rejects('mandatory path through explicit preparation into offer', makeView([entry('dependent'), entry('via', 'prerequisiteOnly'), offered()]), 'CPV-015')
assert.deepEqual(errors(makeView([
  entry('optional-preparation', 'prerequisiteOnly'),
  section('Prepared offers', [entry('prepared-offer', 'voluntary'), entry('other-offer', 'voluntary')]),
])), [], 'Dormant preparations belonging only to an optional path may require a voluntary offer.')
assert.deepEqual(errors(makeView([
  { kind: 'canonicalSubtree', goalId: 'scope-with-dormant' },
  entry('optional-preparation', 'prerequisiteOnly'), entry('other-offer', 'voluntary'),
])), [], 'A preparation override removes its atom from broad target seeds; its dormant optional path never becomes mandatory.')
rejects('mixed assessment requires voluntary role', makeView([entry('mixed-exam'), offered()]), 'CPV-016')
rejects('implicitly required mixed assessment requires voluntary role', makeView([entry('implicit-exam-dependent'), offered()]), 'CPV-016')
rejects('assessed group contains voluntary performance', makeView([entry('group-exam'), offered()]), 'CPV-016')
const acquisition = { ...entry('support', 'prerequisiteOnly'), acquisitionPlacement: true as const }
assert.deepEqual(errors(makeView([section('First', [acquisition]), section('Second', [acquisition])])), [],
  'Conditional preparation templates retain the established acquisition contract; repetition is not a second visible offer.')
rejects('target cannot be a preparation acquisition template', makeView([section('Target', [{ ...entry('regular'), acquisitionPlacement: true }])]), 'CPV-011')

for (const projectionRole of ['target', 'prerequisiteOnly', 'voluntary'] as const) {
  assert.equal(getCompositionProjectionRole(entry('regular', projectionRole)), projectionRole)
  assert.deepEqual(errors(makeView([entry('regular', projectionRole)])), [])
}
for (const version of [undefined, '1.0', '1.1', '1.2']) {
  const legacy: CompositionView = { ...view, viewFormatVersion: version }
  delete legacy.$schema
  rejects(`offer rejected in old ${String(version)} format`, legacy, 'CPV-012')
  assert.throws(() => normalizeCompositionView(legacy), /requires.*1\.3/)
  const ordinary = { ...legacy, rootNodes: [entry('regular')] }
  assert.deepEqual(errors(ordinary), [], `Legacy ${String(version)} ordinary role semantics stay supported.`)
  assert.deepEqual(sorted(compile(ordinary).projectionRoles.targetGoalIds), ['regular'])
}
for (const version of [null, '1.4', 1.3, '', '1.3 ']) {
  const invalid = { ...view, viewFormatVersion: version }
  rejects(`unknown version ${String(version)}`, invalid, 'CPV-012')
  assert.throws(() => normalizeCompositionView(invalid), /Unsupported/)
}
for (const schema of [undefined, 'https://example.org/unknown', 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json']) {
  const invalid = { ...view, $schema: schema }
  rejects('source schema/version mismatch', invalid, 'CPV-012')
  assert.throws(() => normalizeCompositionView(invalid), /exact source schema/)
}
for (const role of [null, 'optional', 'Voluntary', '', 1]) {
  const invalid = makeView([{ ...entry('regular'), projectionRole: role } as unknown as CompositionGoalEntryNode])
  rejects(`unknown role ${String(role)}`, invalid, 'CPV-008')
  assert.throws(() => normalizeCompositionView(invalid), /Invalid.*projectionRole/)
  assert.throws(() => collectCompositionProjectionRoleGoalIds(invalid.rootNodes, goalById), /Invalid.*projectionRole/)
}
for (const kind of ['canonicalSubtree', 'structure', 'landscapeEntry']) {
  const invalid = makeView([{ kind, goalId: 'offer', id: 'invalid', label: 'Invalid', children: [], landscapeId: 'subject', projectionRole: 'voluntary' } as unknown as CompositionViewNode])
  rejects(`voluntary role on ${kind}`, invalid, 'CPV-008')
  assert.throws(() => normalizeCompositionView(invalid), /Invalid.*projectionRole/)
  assert.throws(() => collectCompositionProjectionRoleGoalIds(invalid.rootNodes, goalById), /Invalid.*projectionRole/)
}
console.log(`Voluntary composition role compiler passed: three disjoint authored/induced atom sets; regular counts; voluntary-only sections; prerequisites and mixed assessments; ${negatives} negative controls; legacy 1.0/1.1/1.2 preserved.`)
