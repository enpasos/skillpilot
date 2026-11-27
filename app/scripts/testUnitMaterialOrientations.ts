// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { validateUnitMaterialOrientations } from './lib/unitMaterialOrientationValidation'

// A third subject with neither an assessment contract nor orientation credit is still covered.
const opening = { id: 'network-opening', type: 'atomic', semanticKind: 'orientation', contains: [] as string[], requires: [] as string[] }
const landscape = { landscapeId: 'informatics', goals: [opening, { ...opening, id: 'second-opening' },
  { id: 'packet', type: 'atomic', semanticKind: 'ordinary', contains: [], requires: [] }] }
const material = { schemaVersion: 2, unit: { landscapeId: landscape.landscapeId, compositionNodeId: 'networks',
  viewIds: ['course-a', 'course-b'], orientationGoalId: opening.id } }
const view = (viewId: string): CompositionView => ({ viewId, landscapeId: landscape.landscapeId,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage' }, rootNodes: [{
    kind: 'structure', id: material.unit.compositionNodeId, label: 'Networks', children: [
      { kind: 'goalEntry', goalId: opening.id }, { kind: 'canonicalSubtree', goalId: 'packet' },
    ],
  }] })
const fixture = () => ({ materials: [structuredClone(material)], landscapes: [structuredClone(landscape)],
  views: new Map(material.unit.viewIds.map(id => [id, view(id)])) })
type Fixture = ReturnType<typeof fixture>
const validate = (input: Fixture) => validateUnitMaterialOrientations(input.materials, input.landscapes, input.views)
assert.equal(validate(fixture()), 1)
let negatives = 0
function rejects(change: (input: Fixture) => void, expected: RegExp) {
  const input = fixture()
  change(input)
  assert.throws(() => validate(input), expected)
  negatives++
}
const children = (input: Fixture) => {
  const unit = input.views.get('course-b')!.rootNodes[0]
  assert(unit.kind === 'structure')
  return unit.children
}
rejects(input => {
  input.landscapes[0].goals = input.landscapes[0].goals.filter(goal => goal.id !== opening.id)
  input.landscapes.push({ ...structuredClone(landscape), landscapeId: 'other-subject' })
}, /real goal of its own landscape/)
rejects(input => { input.landscapes[0].goals[0].type = 'cluster' }, /atomic orientation/)
rejects(input => { input.landscapes[0].goals[0].contains = ['packet'] }, /atomic orientation/)
rejects(input => { children(input).push({ kind: 'goalEntry', goalId: 'second-opening' }) }, /exactly one direct opening/)
rejects(input => { children(input).push({ kind: 'goalEntry', goalId: opening.id }) }, /duplicate opening/)
rejects(input => { children(input).reverse() }, /first target child/)
rejects(input => { children(input).unshift({ kind: 'structure', id: 'earlier-unit', label: 'Earlier', children: [] }) }, /first target child/)
rejects(input => { children(input).shift() }, /first target child/)
rejects(input => { children(input)[0].projectionRole = 'prerequisiteOnly' }, /first target child/)
rejects(input => { input.views.delete('course-b') }, /missing own view/)
rejects(input => { input.views.get('course-b')!.landscapeId = 'other-subject' }, /missing own view/)
rejects(input => { input.views.get('course-b')!.rootNodes = [] }, /missing or ambiguous unit/)
rejects(input => { input.materials[0].unit.orientationGoalId = '' }, /missing orientation goal/)

const legacy = fixture()
legacy.materials[0].schemaVersion = 1
legacy.materials[0].unit.orientationGoalId = ''
legacy.landscapes = []
legacy.views.clear()
assert.equal(validate(legacy), 0, 'Version 1 acquires no new orientation obligations')
const unrelated = fixture()
unrelated.views.set('unconfigured', { ...view('unconfigured'), rootNodes: [] })
assert.equal(validate(unrelated), 1, 'Unconfigured views and units acquire no new orientation obligations')
assert.equal(validateUnitMaterialOrientations([], [], new Map()), 0)
console.log(`Unit material orientations PASS: contract-free Informatics fixture, all bound views, ${negatives} negative probes, unchanged v1/unconfigured scope.`)
