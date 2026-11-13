// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { evaluateSemanticAtomicity, fingerprintGoal } from './generateCurriculumQualityStatus'
import { validateSemanticAtomicityRecordShape } from './lib/semanticAtomicityRecordValidation'

const goal = {
  id: 'atom', title: 'Explain proportionality', description: 'Explain a proportional relation.',
  contains: [], requires: [], dimensionTags: {}, weight: 1,
} as unknown as LearningGoal
const landscape = { landscapeId: 'fixture', goals: [goal] } as SkillLandscape
const baseConfig = {
  schemaVersion: 1 as const, reviewId: 'fixture-review', ruleVersion: 'fixture-v1',
  landscapeId: landscape.landscapeId, landscapePath: 'fixture.json',
  scope: { label: 'fixture', leafGoalIds: [goal.id] },
}
const accepted = {
  schemaVersion: 1, reviewId: baseConfig.reviewId, ruleVersion: baseConfig.ruleVersion,
  landscapeId: landscape.landscapeId, goalId: goal.id,
  fingerprint: fingerprintGoal(goal, baseConfig.ruleVersion), status: 'atomic', semanticAtomic: true,
  reason: 'One assessable competence.',
}
function evaluate(lines: unknown[], extra = '') {
  const cache = resolve(import.meta.dirname, '../node_modules/.tmp')
  mkdirSync(cache, { recursive: true })
  const folder = mkdtempSync(resolve(cache, 'atomicity-contract-'))
  try {
    const reviewPath = resolve(folder, 'review.jsonl')
    writeFileSync(reviewPath, lines.map(line => JSON.stringify(line)).join('\n') + '\n' + extra)
    return evaluateSemanticAtomicity(landscape, [{ ...baseConfig, reviewPath }])
  } finally { rmSync(folder, { recursive: true, force: true }) }
}

test('a current accepted atomicity record passes both shared shape and producer', () => {
  assert.deepEqual(validateSemanticAtomicityRecordShape(accepted, baseConfig), [])
  assert.equal(evaluate([accepted]).status, 'pass')
})
for (const [label, patch] of [
  ['unsupported status', { status: 'approved' }],
  ['non-string status', { status: ['atomic'] }],
  ['contradictory atomicity', { semanticAtomic: false }],
  ['wrong schema', { schemaVersion: 2 }],
  ['wrong review', { reviewId: 'other' }],
  ['wrong rule', { ruleVersion: 'other' }],
  ['wrong landscape', { landscapeId: 'other' }],
  ['missing reason', { reason: '' }],
  ['non-string reason', { reason: 42 }],
] as const) test(`CQR-301 rejects ${label} despite a current goal fingerprint`, () => {
  const candidate = { ...accepted, ...patch }
  assert.ok(validateSemanticAtomicityRecordShape(candidate, baseConfig).length > 0)
  const result = evaluate([candidate])
  assert.equal(result.status, 'fail')
  assert.equal(result.metrics?.invalidReviewRecords, 1)
})
for (const value of [null, [], 'atomic', 42]) test(`CQR-301 rejects malformed record ${JSON.stringify(value)}`, () => {
  const result = evaluate([accepted, value])
  assert.equal(result.status, 'fail')
  assert.equal(result.metrics?.invalidReviewRecords, 1)
})
test('malformed extra JSON cannot be ignored beside a complete current review', () => {
  const result = evaluate([accepted], '{invalid json\n')
  assert.equal(result.status, 'fail')
  assert.equal(result.metrics?.parseErrors, 1)
})
test('duplicate current records cannot overwrite each other into a pass', () => {
  const result = evaluate([accepted, accepted])
  assert.equal(result.status, 'fail')
  assert.equal(result.metrics?.duplicateReviewRecords, 1)
})
for (const status of ['needs_developer_review', 'non_atomic']) test(`valid ${status} still blocks the required pass`, () => {
  const result = evaluate([{ ...accepted, status, semanticAtomic: status === 'non_atomic' ? false : null }])
  assert.equal(result.status, 'warn')
})
