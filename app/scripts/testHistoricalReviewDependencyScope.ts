// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eligibleHistoricalReviewLandscapes as eligible, requireHistoricalReviewApplicabilityBinding, type ReviewFrameDocument } from './lib/historicalReviewDependencyScope'
const doc = (landscapeId: string, goals: ReviewFrameDocument['goals'], extra = {}): ReviewFrameDocument => ({ landscapeId, goals, ...extra })
const changedB = (before: ReviewFrameDocument[]) => before.map(document => document.landscapeId === 'B'
  ? { ...document, goals: document.goals.map(goal => goal.id === 'b' ? { ...goal, requires: ['other'] } : goal) }
  : structuredClone(document))
const dependencyCases: Array<[string, Record<string, unknown>]> = [
  ['qualified requires', { requires: ['B:b'] }],
  ['unqualified foreign requires', { requires: ['b'] }],
  ['foreign contains', { contains: ['B:b'] }],
  ['assessment applicability basis', { extendedData: { assessmentApplicabilityBasis: { kind: 'allOfGoalApplicability', goalRefs: ['b'] } } }],
  ['source locator', { provenance: { source: 'curricula/B#b' } }],
]
for (const [name, extra] of dependencyCases) test(`${name}: dependency on changed document forbids reuse`, () => {
  const before = [doc('A', [{ id: 'a', ...extra }]), doc('B', [{ id: 'b' }, { id: 'other' }])]
  assert.ok(!eligible(changedB(before), before).has('A'))
})
test('transitive document dependencies forbid reuse', () => {
  const before = [doc('A', [{ id: 'a', requires: ['C:c'] }]), doc('C', [{ id: 'c', requires: ['b'] }]), doc('B', [{ id: 'b' }, { id: 'other' }])]
  assert.ok(!eligible(changedB(before), before).has('A'))
})
test('removed historical foreign ID retains its dependency', () => {
  const before = [doc('A', [{ id: 'a', requires: ['b'] }]), doc('B', [{ id: 'b' }])]
  const after = [structuredClone(before[0]), doc('B', [{ id: 'renamed' }])]
  assert.ok(!eligible(after, before).has('A'))
})
test('foreign containing ancestor changes forbid child subject reuse', () => {
  const before = [doc('A', [{ id: 'a' }]), doc('B', [{ id: 'parent', contains: ['A:a'], requires: ['b'] }, { id: 'b' }])]
  const after = [structuredClone(before[0]), doc('B', [{ id: 'parent', contains: ['A:a'], requires: [] }, { id: 'b' }])]
  assert.ok(!eligible(after, before).has('A'))
})
test('unchanged foreign ancestor with dependency on changed subject forbids child reuse', () => {
  const before = [doc('A', [{ id: 'a' }]), doc('C', [{ id: 'parent', contains: ['A:a'], requires: ['B:b'] }]), doc('B', [{ id: 'b' }, { id: 'other' }])]
  assert.ok(!eligible(changedB(before), before).has('A'))
})
test('unrelated changed sibling under an unchanged overview ancestor does not revoke reuse', () => {
  const before = [doc('A', [{ id: 'a' }]), doc('B', [{ id: 'b' }, { id: 'other' }]),
    doc('overview', [{ id: 'root', contains: ['A:a', 'B:b'], requires: [] }], { offered: ['A', 'B'] })]
  assert.ok(eligible(changedB(before), before).has('A'))
})
test('local unqualified ID shadows unrelated foreign ID', () => {
  const before = [doc('A', [{ id: 'a', requires: ['shared'] }, { id: 'shared' }]), doc('B', [{ id: 'shared' }, { id: 'b' }, { id: 'other' }])]
  assert.ok(eligible(changedB(before), before).has('A'))
})
test('ambiguous foreign plain ID cannot grant reuse after a possible owner changes', () => {
  const before = [doc('A', [{ id: 'a', requires: ['shared'] }]), doc('B', [{ id: 'shared' }, { id: 'b' }, { id: 'other' }]), doc('C', [{ id: 'shared' }])]
  assert.ok(!eligible(changedB(before), before).has('A'))
})
test('raw goal edits and catalog identity changes never gain historical eligibility', () => {
  const before = [doc('A', [{ id: 'a', description: 'old' }])]
  assert.ok(!eligible([doc('A', [{ id: 'a', description: 'new' }])], before).has('A'))
  assert.throws(() => eligible([], before))
  assert.throws(() => eligible([before[0], before[0]], before))
})

test('applicability comparison binds every eligible goal and ignores unrelated changes', () => {
  const before = [
    { key: 'A:a', compiledApplicability: { jurisdiction: ['HE'] } },
    { key: 'A:b', compiledApplicability: { jurisdiction: ['BY'] } },
    { key: 'B:x', compiledApplicability: { jurisdiction: ['HE'] } },
  ]
  const scope = new Set(['A'])
  requireHistoricalReviewApplicabilityBinding([...before].reverse(), before, scope)
  requireHistoricalReviewApplicabilityBinding(before.map(row => row.key === 'B:x'
    ? { ...row, compiledApplicability: { jurisdiction: ['BY'] } } : row), before, scope)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding(before.map(row => row.key === 'A:a'
    ? { ...row, compiledApplicability: { jurisdiction: ['BY'] } } : row), before, scope), /differs/)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding(before.slice(1), before, scope), /differs/)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding([], [], scope), /missing reusable subject/)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding(before, before, new Set()), /empty reusable scope/)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding([before[0], ...before], before, scope), /duplicate/)
  assert.throws(() => requireHistoricalReviewApplicabilityBinding(before, before, new Set(['A', 'missing'])), /missing reusable subject/)
})

test('object-keyed foreign references retain the dependency', () => {
  const before = [doc('A', [{ id: 'a', coverage: { 'B:b': true } }]), doc('B', [{ id: 'b' }, { id: 'other' }])]
  assert.ok(!eligible(changedB(before), before).has('A'))
})
for (const extra of [
  { requires: ['missing'] }, { requires: ['B:missing'] }, { contains: ['missing'] },
  { requires: ['B:b', 'B:b'] },
  { extendedData: { assessmentApplicabilityBasis: { goalRefs: ['missing'] } } },
]) test(`unresolved or duplicate semantic references deny reuse: ${JSON.stringify(extra)}`, () => {
  const frame = [doc('A', [{ id: 'a', ...extra }]), doc('B', [{ id: 'b' }])]
  assert.ok(!eligible(frame, frame).has('A'))
})
