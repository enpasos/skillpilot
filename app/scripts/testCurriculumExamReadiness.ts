// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import {
  deriveCurriculumMaturity,
  deriveScopeMaturity,
  evaluateExamTaskReadiness,
} from './generateCurriculumQualityStatus'
import { checkCurriculumMaturityFloors, collectCurriculumMaturityFloorFailures } from './checkCurriculumMaturityFloors'
import { strictGraphFixtureId, strictGraphFixtureRule } from './testCurriculumGraphMaturity'

const canonical = resolve(import.meta.dirname, '../../curricula/DE/Gymnasium/canonical')
const load = (file: string): SkillLandscape => JSON.parse(readFileSync(resolve(canonical, file), 'utf8'))
const fixtures = JSON.parse(readFileSync(resolve(import.meta.dirname, 'fixtures/informatics-generic-terminal-exams.json'), 'utf8'))
const generic = fixtures.goals as LearningGoal[]
assert.equal(generic.length, 6, 'The actual six known negative payloads must be discovered.')
const decisions = generic.map(goal => ({ id: goal.id, status: evaluateExamTaskReadiness([goal]).status }))
console.log(`Actual generic terminal readiness: ${JSON.stringify(decisions)}`)
assert.deepEqual(decisions.map(row => row.status), Array(6).fill('fail'))

const positives = [
  ['DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', '311ab2f2-3364-5166-ac22-3ef01419fee4'],
  ['DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', '71e8936b-fa8a-50dc-8c47-fca015b85ac5'],
].map(([file, id]) => {
  const goal = load(file).goals.find(goal => goal.id === id)
  assert.ok(goal?.examData, 'A concrete existing Math/Physics task is required.')
  assert.equal(evaluateExamTaskReadiness([goal]).status, 'pass')
  return goal
})

let variants = 0
for (const goal of generic) {
  for (const taskContent of [
    `Aufgabe 1. Zahl 7.\n${goal.examData!.taskContent}`,
    positives[0].examData!.taskContent,
  ]) {
    const disguised = { ...goal, examData: { ...goal.examData!, taskContent } }
    assert.equal(evaluateExamTaskReadiness([disguised]).status, 'fail',
      'A number, subtask marker or concrete task cannot turn the same generic sentence into a solution.')
    variants++
  }
}

const positive = positives[0]
for (const patch of [
  { reviewStatus: 'draft' as const },
  { taskContent: '' },
  { solutionContent: '' },
  { scoring: { ...positive.examData!.scoring, steps: [] } },
  { taskContent: 'Eine materialgestützte J8-Übungsaufgabe verbindet mehrere Themen.' },
  { taskContent: 'Eine integrative Sek-I-Abschlussaufgabe wird bearbeitet.' },
  { taskContent: 'Die Übungsaufgabe verbindet mehrere Bereiche.' },
  { taskContent: 'Bearbeiten Sie die Aufgabe.', solutionContent: 'Die Lösung zeigt die Anwendung.' },
]) assert.equal(evaluateExamTaskReadiness([{ ...positive, examData: { ...positive.examData!, ...patch } }]).status, 'fail')

// Use the actual production CQR-202 aggregation, actual checked graph fixture,
// scope derivation, curriculum derivation and unchanged protected-floor checker.
assert.equal(strictGraphFixtureRule.status, 'pass')
assert.equal(strictGraphFixtureRule.graphIntegrity?.ok, true)
const coreRules = [strictGraphFixtureRule, ...[
  'CQR-000', 'CQR-002', 'CQR-003', 'CQR-301', 'CQR-401', 'CQR-501', 'CQR-302', 'CQR-303',
].map(id => ({ id, status: 'pass' as const, summary: 'Other fixture requirement passed' }))]
const scopeFor = (goals: LearningGoal[]) => {
  const rules = [
    ...['CQR-101', 'CQR-102', 'CQR-103', 'CQR-104', 'CQR-201', 'CQR-203']
      .map(id => ({ id, status: 'pass' as const, summary: 'Other fixture route requirement passed' })),
    evaluateExamTaskReadiness(goals),
  ]
  return { scopeId: 'actual-exam-payload-fixture', label: 'Actual exam payloads',
    selectedAtomicGoals: 2, rules, maturity: deriveScopeMaturity(rules) }
}
const goodScope = scopeFor(positives)
assert.equal(goodScope.maturity, 'M4')
assert.equal(deriveCurriculumMaturity(coreRules, [goodScope], strictGraphFixtureId), 'M7')
const badScope = scopeFor(generic)
const actual202 = badScope.rules.find(rule => rule.id === 'CQR-202')!
assert.equal(actual202.status, 'fail')
assert.equal(actual202.metrics?.weakExamData, 6)
assert.equal(badScope.maturity, 'M2')
const badMaturity = deriveCurriculumMaturity(coreRules, [badScope], strictGraphFixtureId)
assert.equal(badMaturity, 'M3', 'The readiness failure, not an unrelated M0, must prevent M6/M7.')
for (const minimumMaturity of ['M6', 'M7'] as const) {
  const policy = { schemaVersion: 1, policyId: 'existing-protected-floor-contract-fixture', baselineDate: '2026-08-20',
    exceptions: [], knownPreBaselineRegressions: [], floors: [{ landscapeId: strictGraphFixtureId,
      frameworkId: 'fixture-framework', subject: 'Fixture', minimumMaturity, reason: 'Exercise the existing floor contract.' }] }
  const status = (scope: typeof badScope) => ({ curricula: [{ landscapeId: strictGraphFixtureId,
    frameworkId: 'fixture-framework', subject: 'Fixture', rules: coreRules, scopes: [scope],
    maturity: deriveCurriculumMaturity(coreRules, [scope], strictGraphFixtureId) }] })
  assert.doesNotThrow(() => checkCurriculumMaturityFloors(status(goodScope), policy))
  const failures = collectCurriculumMaturityFloorFailures(status(badScope), policy)
  assert.ok(failures.some(line => line.includes(`current M3 is below protected floor ${minimumMaturity}`)))
  assert.ok(failures.some(line => line.includes('CQR-202 fail')))
  assert.ok(!failures.some(line => line.includes('no complete passing strict graph-integrity report')))
  assert.throws(() => checkCurriculumMaturityFloors(status(badScope), policy), /maturity regression/)
}
console.log(`Curriculum exam readiness passed: 6 actual negatives, ${variants} misleading-task variants, 2 actual positives, existing guards, scope/curriculum/M6/M7 floor chain.`)
