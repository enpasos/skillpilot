// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { COMPOSITION_VIEW_13_SCHEMA, compileCompositionView, type CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { collectProfileTargetGoalIds, toExplicitTree } from './prepareGoalBookCanonicalNavigationCandidates'

const landscape = normalizeCanonicalLandscape({ landscapeId: 'fixture', title: 'Fixture', goals: [
  { id: 'region', title: 'Region', type: 'cluster', contains: ['regular', 'support', 'excluded'], requires: [] },
  { id: 'regular', title: 'Regular', type: 'atomic', contains: [], requires: ['support'] },
  { id: 'support', title: 'Support', type: 'atomic', contains: [], requires: [] },
  { id: 'excluded', title: 'Excluded from atlas', type: 'atomic', contains: [], requires: [] },
  { id: 'offer', title: 'Offer', type: 'atomic', contains: [], requires: ['regular'] },
] })
const goals = new Map(landscape.goals.map(goal => [goal.id, goal]))
const atlas = new Set(['regular', 'offer'])
const view: CompositionView = { viewId: 'navigation', landscapeId: 'fixture', language: 'de', scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE' },
  rootNodes: [{ kind: 'structure', id: 'unit', label: 'Unit', children: [
    { kind: 'canonicalSubtree', goalId: 'region' }, { kind: 'goalEntry', goalId: 'support', projectionRole: 'prerequisiteOnly' },
  ] }] }
const expected = [{ kind: 'structure', id: 'canonical-structure:unit', label: 'Unit', children: [
  { kind: 'structure', id: 'canonical-goal-region', label: 'Region', children: [{ kind: 'goalEntry', goalId: 'regular' }] },
] }]
const validate13 = new Ajv2020({ allErrors: true, strict: false }).compile(JSON.parse(readFileSync(
  new URL('../../contracts/composition-view/v1.3/composition-view.schema.json', import.meta.url), 'utf8',
)))
for (const version of [undefined, '1.0', '1.2', '1.3']) {
  const candidate = { ...view, viewFormatVersion: version,
    ...(version === '1.3' ? { $schema: COMPOSITION_VIEW_13_SCHEMA }
      : version === '1.2' ? { $schema: 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json' }
        : version === '1.0' ? { $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json' } : {}) }
  if (version === '1.3') assert(validate13(candidate), JSON.stringify(validate13.errors))
  const compiled = compileCompositionView(candidate, landscape)
  assert.deepEqual(compiled.findings, [])
  assert.equal(JSON.stringify(compiled.compiledRootNodes.map(node => toExplicitTree(node, goals, atlas))), JSON.stringify(expected),
    `Target-only ${String(version)} inputs retain the same serialized candidate bytes.`)
  assert.deepEqual([...collectProfileTargetGoalIds(compiled.compiledRootNodes, goals, atlas)], ['regular'])
}
const offered = { ...view, $schema: COMPOSITION_VIEW_13_SCHEMA, viewFormatVersion: '1.3', rootNodes: [
  { kind: 'structure' as const, id: 'offers', label: 'Offers', children: [{ kind: 'goalEntry' as const, goalId: 'offer', projectionRole: 'voluntary' as const }] },
] }
assert(validate13(offered), JSON.stringify(validate13.errors))
const compiled = compileCompositionView(offered, landscape)
assert.deepEqual(compiled.findings, [])
for (const membership of [atlas, new Set<string>()]) {
  assert.throws(() => toExplicitTree(compiled.compiledRootNodes[0], goals, membership), /cannot erase voluntary role/,
    'The legacy writer rejects an offer even when the published model would otherwise omit it.')
  assert.throws(() => collectProfileTargetGoalIds(compiled.compiledRootNodes, goals, membership), /cannot erase voluntary role/,
    'A profile offer is neither counted as a target nor silently dropped.')
}
console.log('Canonical navigation reader passed: identical target-only output across legacy and1.3 inputs, authored P exclusion, and four voluntary backbone/profile refusal controls.')
