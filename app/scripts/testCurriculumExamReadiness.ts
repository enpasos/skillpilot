// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import {
  deriveCurriculumMaturity,
  deriveScopeMaturity,
  discoverCurriculumAssessmentScope,
  evaluateCurriculumExamReadiness,
  evaluateExamTaskReadiness,
  evaluateGraphIntegrity,
} from './generateCurriculumQualityStatus'
import { checkCurriculumMaturityFloors, collectCurriculumMaturityFloorFailures } from './checkCurriculumMaturityFloors'
import { strictGraphFixtureAssessmentRules, strictGraphFixtureAssessmentScope, strictGraphFixtureId, strictGraphFixtureRule } from './testCurriculumGraphMaturity'

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
const baseExpectedScopes = new Map([[strictGraphFixtureId, strictGraphFixtureAssessmentScope]])
const coreRules = [strictGraphFixtureRule, ...strictGraphFixtureAssessmentRules, ...[
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
assert.equal(deriveCurriculumMaturity(coreRules, [goodScope], strictGraphFixtureId, strictGraphFixtureAssessmentScope), 'M7')
const badScope = scopeFor(generic)
const actual202 = badScope.rules.find(rule => rule.id === 'CQR-202')!
assert.equal(actual202.status, 'fail')
assert.equal(actual202.metrics?.weakExamData, 6)
assert.equal(badScope.maturity, 'M2')
const badMaturity = deriveCurriculumMaturity(coreRules, [badScope], strictGraphFixtureId, strictGraphFixtureAssessmentScope)
assert.equal(badMaturity, 'M3', 'The readiness failure, not an unrelated M0, must prevent M6/M7.')
for (const minimumMaturity of ['M6', 'M7'] as const) {
  const policy = { schemaVersion: 1, policyId: 'existing-protected-floor-contract-fixture', baselineDate: '2026-08-20',
    exceptions: [], knownPreBaselineRegressions: [], floors: [{ landscapeId: strictGraphFixtureId,
      frameworkId: 'fixture-framework', subject: 'Fixture', minimumMaturity, reason: 'Exercise the existing floor contract.' }] }
  const status = (scope: typeof badScope) => ({ curricula: [{ landscapeId: strictGraphFixtureId,
    frameworkId: 'fixture-framework', subject: 'Fixture', rules: coreRules, scopes: [scope],
    maturity: deriveCurriculumMaturity(coreRules, [scope], strictGraphFixtureId, strictGraphFixtureAssessmentScope) }] })
  assert.doesNotThrow(() => checkCurriculumMaturityFloors(status(goodScope), policy, baseExpectedScopes))
  const failures = collectCurriculumMaturityFloorFailures(status(badScope), policy, baseExpectedScopes)
  assert.ok(failures.some(line => line.includes(`current M3 is below protected floor ${minimumMaturity}`)))
  assert.ok(failures.some(line => line.includes('CQR-202 fail')))
  assert.ok(!failures.some(line => line.includes('no complete passing strict graph-integrity report')))
  assert.throws(() => checkCurriculumMaturityFloors(status(badScope), policy, baseExpectedScopes), /maturity regression/)
}
console.log(`Curriculum exam readiness passed: 6 actual negatives, ${variants} misleading-task variants, 2 actual positives, existing guards, scope/curriculum/M6/M7 floor chain.`)

// Real exams outside the former direct route-cluster selection. Discover them
// through the actual released-offer / rendered subject-view paths, then mutate
// their payloads without changing their placement or status.
const info = load('DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json')
const offerIds = [
  '63509366-f5b2-58e5-9976-47df6f8c37e1', 'b86e8ab3-2c12-5b6b-b515-1e7d457c99c2',
  'a98dce49-cf4c-559b-a812-c10bff63d649', 'da96fcb4-f601-5f66-9fec-12b5adc7f7f0',
  'd13e297f-505d-576a-9a86-11ab4d7896c9', '893b6a69-1a1b-539b-981e-3982c52e590c',
  'd9892508-97b5-529e-9b9e-c4889fba2166', '4e0668e3-edca-57f4-b258-df87f23d2b4e',
  '661ec7d3-7371-5e7c-9137-4f643e6f9bf2', 'c44643dc-39b1-5a21-8765-ab346751a184',
]
const viewTargetIds = [
  ['DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json', [
    '2fb368b0-7b9d-5df0-99b6-6d719fd47f95', '4631ba7a-77e8-5a74-b3d8-fc53e206fc40',
    'aca05e9b-996e-5842-9d01-6bcf11e0fc2b', '65c8d2fa-e229-562b-a3d8-b51de7f13b2c',
    '46278a08-7d3d-52aa-9125-6fdb371cfad2', '2f05ec27-de95-5875-9d6e-1739f1462c2e',
    'd063b8d7-6bda-55c6-9f47-fd99269485b7', '24aa27dc-5d86-5fcb-90c8-074b28e55b9d',
  ]],
  ['DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json', [
    '957de50e-1bfa-5be0-a331-fb48ee226d2e', '084d645a-8e87-5940-afd7-bc8053bbd102',
    'a9c1e7f3-75c8-504a-bb8b-5c46b206e890', 'da2eea0a-4b44-52d2-94fc-5f56f1585b4c',
    'b9e4658f-0627-5053-92e3-a8d64bee8469', '0baeed64-882b-5846-a6f4-0ffa18f162dd',
    'ba973405-774b-5552-a302-7966dc42e134', 'a427fafe-d960-54d0-999e-23b53557e801',
  ]],
] as const
const manifestFor = (rules: ReturnType<typeof evaluateCurriculumExamReadiness>, kind: 'structure' | 'readiness') => {
  const rule = rules.find(rule => rule.assessmentValidation?.kind === kind)
  assert.ok(rule?.assessmentValidation)
  return rule.assessmentValidation
}
const mutate = (landscape: SkillLandscape, id: string, patch: Partial<NonNullable<LearningGoal['examData']>>) => ({
  ...landscape, goals: landscape.goals.map(goal => goal.id === id
    ? { ...goal, examData: { ...goal.examData!, ...patch } } : goal),
})
const boilerplate = generic[0].examData!.solutionContent
let hiddenPayloadNegatives = 0
for (const id of offerIds) {
  const goal = info.goals.find(goal => goal.id === id)
  assert.ok(goal?.examData)
  assert.equal(evaluateExamTaskReadiness([goal]).status, 'pass')
  const baseline = manifestFor(evaluateCurriculumExamReadiness(info, []), 'readiness')
  assert.ok(baseline.requiredGoalIds.includes(id))
  assert.ok(!baseline.failingGoalIds.includes(id))
  for (const patch of [{ taskContent: '' }, { solutionContent: '' },
    { scoring: { ...goal.examData.scoring, steps: [] } }, { solutionContent: boilerplate }]) {
    const rules = evaluateCurriculumExamReadiness(mutate(info, id, patch), [])
    assert.ok(manifestFor(rules, 'readiness').failingGoalIds.includes(id))
    assert.ok(manifestFor(rules, 'structure').failingGoalIds.includes(id))
    hiddenPayloadNegatives++
  }
}
for (const [file, ids] of viewTargetIds) {
  const landscape = load(file)
  const before = evaluateCurriculumExamReadiness(landscape)
  for (const id of ids) {
    const goal = landscape.goals.find(goal => goal.id === id)
    assert.ok(goal?.examData)
    assert.equal(evaluateExamTaskReadiness([goal]).status, 'pass')
    assert.ok(manifestFor(before, 'readiness').requiredGoalIds.includes(id), `${file}: real view target ${id}`)
    const after = evaluateCurriculumExamReadiness(mutate(landscape, id, { solutionContent: boilerplate }))
    assert.ok(manifestFor(after, 'readiness').failingGoalIds.includes(id))
    hiddenPayloadNegatives++
  }
}
assert.equal(hiddenPayloadNegatives, 56)
const missingOfferPayload = { ...info, goals: info.goals.map(goal => goal.id === offerIds[0]
  ? { ...goal, examData: undefined } : goal) }
for (const kind of ['structure', 'readiness'] as const) {
  const manifest = manifestFor(evaluateCurriculumExamReadiness(missingOfferPayload, []), kind)
  assert.ok(manifest.definitionGoalIds.includes(offerIds[0]))
  assert.ok(manifest.requiredGoalIds.includes(offerIds[0]))
  assert.ok(manifest.failingGoalIds.includes(offerIds[0]), 'Removing only the payload must not remove an offered Assessment from discovery.')
}

const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const exam = { ...positive, id: A, requires: [], contains: [], tags: [], nodeKind: 'exam' as const }
const fixture: SkillLandscape = { landscapeId: strictGraphFixtureId, title: 'Assessment fixture',
  description: 'Real assessment discovery fixture.', locale: 'de',
  goals: [exam, { ...exam, id: B, nodeKind: 'tutor', examData: undefined },
    { ...exam, id: '00000000-0000-4000-8000-000000000003', title: 'Fixture root',
      contains: [A, B], weight: 2, tags: ['root'], nodeKind: 'tutor', examData: undefined }] }
const fixtureGraph = evaluateGraphIntegrity(fixture, [fixture])
assert.equal(fixtureGraph.status, 'pass', 'A real valid graph must precede the readiness/floor chain.')
const offer = (landscape: SkillLandscape) => ({ ...landscape, goals: landscape.goals.map(goal => goal.id === A
  ? { ...goal, release: { examYear: 2026, kind: 'offer' as const, status: 'released' as const, courseLevel: 'GK' as const } }
  : goal) })
const fullCore = (landscape: SkillLandscape, viewFiles: string[] = [], catalog = [landscape]) => {
  const actualCatalog = [landscape, ...catalog.filter((entry) => entry.landscapeId !== landscape.landscapeId)]
  const expectedScope = discoverCurriculumAssessmentScope(landscape, viewFiles, actualCatalog)
  const rules = [
    ...coreRules.filter(rule => !['CQR-001', 'CQR-202', 'CQR-204'].includes(rule.id)),
    evaluateGraphIntegrity(landscape, actualCatalog),
    ...evaluateCurriculumExamReadiness(landscape, viewFiles, actualCatalog, expectedScope),
  ] as ReturnType<typeof evaluateCurriculumExamReadiness>
  return { rules, expectedScope }
}
const maturityFor = ({ rules, expectedScope }: ReturnType<typeof fullCore>) =>
  deriveCurriculumMaturity(rules, [goodScope], strictGraphFixtureId, expectedScope)
const assertStopsFloors = (bundle: ReturnType<typeof fullCore>) => {
  assert.equal(maturityFor(bundle), 'M3')
  const expected = new Map([[strictGraphFixtureId, bundle.expectedScope]])
  for (const minimumMaturity of ['M6', 'M7'] as const) {
    const policy = { schemaVersion: 1, policyId: 'complete-assessment-floor-fixture', baselineDate: '2026-08-20',
      exceptions: [], knownPreBaselineRegressions: [], floors: [{ landscapeId: strictGraphFixtureId,
        frameworkId: 'fixture-framework', subject: 'Fixture',
        minimumMaturity, reason: 'The existing protected floor cannot bypass an unchecked exam.' }] }
    const status = (current: ReturnType<typeof fullCore>, maturity = maturityFor(current)) => ({ curricula: [{
      landscapeId: strictGraphFixtureId, frameworkId: 'fixture-framework', subject: 'Fixture',
      maturity, rules: current.rules, scopes: [goodScope],
    }] })
    assert.doesNotThrow(() => checkCurriculumMaturityFloors(status(passed), policy,
      new Map([[strictGraphFixtureId, passed.expectedScope]])))
    assert.throws(() => checkCurriculumMaturityFloors(status(passed), policy), /assessment reports bound to current source discovery/)
    const failures = collectCurriculumMaturityFloorFailures(status(bundle), policy, expected)
    assert.ok(failures.some(line => line.includes(`current M3 is below protected floor ${minimumMaturity}`)))
    assert.ok(failures.some(line => line.includes('no complete passing assessment reports bound to current source discovery')))
    assert.throws(() => checkCurriculumMaturityFloors(status(bundle), policy, expected), /maturity regression/)
    // A previously claimed M7 cannot evade the same direct consumer check.
    const claimedFailures = collectCurriculumMaturityFloorFailures(status(bundle, 'M7'), policy, expected)
    assert.ok(claimedFailures.some(line => line.includes('no complete passing assessment reports bound to current source discovery')))
    assert.ok(!claimedFailures.some(line => line.includes('identity mismatch') || line.includes('strict graph-integrity')))
    assert.throws(() => checkCurriculumMaturityFloors(status(bundle, 'M7'), policy, expected), /maturity regression/)
  }
}
const passed = fullCore(offer(fixture))
assert.equal(maturityFor(passed), 'M7')
// The existing parser may normalize a goal endpoint, but owner qualification is
// an exact namespace assertion. No suffix fallback can certify another owner.
for (const ref of [`${strictGraphFixtureId}:${A}`, A]) {
  const withOfferRoot = { ...fixture, goals: fixture.goals.map(goal => goal.tags?.includes('root')
    ? { ...goal, contains: [ref, B], release: { examYear: 2026, kind: 'offer' as const,
      status: 'released' as const, courseLevel: 'GK' as const } } : goal) }
  assert.equal(maturityFor(fullCore(withOfferRoot)), 'M7')
}
for (const ref of [`${strictGraphFixtureId.toUpperCase()}:${A}`, `wrong-owner:${A}`, `:${A}`, `${strictGraphFixtureId}:${A}:extra`]) {
  const invalid = { ...fixture, goals: fixture.goals.map(goal => goal.tags?.includes('root')
    ? { ...goal, contains: [ref, B], release: { examYear: 2026, kind: 'offer' as const,
      status: 'released' as const, courseLevel: 'GK' as const } } : goal) }
  const rules = evaluateCurriculumExamReadiness(invalid, [])
  assert.ok(manifestFor(rules, 'readiness').discoveryIssues.length > 0)
  assert.equal(rules.find(rule => rule.id === 'CQR-202')?.status, 'fail')
}
const uuidOwner = 'abcdef00-0000-4000-8000-000000000001'
const caseGoal = 'abcdef00-0000-4000-8000-000000000002'
const ownedCaseFixture = { ...fixture, landscapeId: uuidOwner, goals: fixture.goals.map(goal => goal.id === A
  ? { ...goal, id: caseGoal } : goal.tags?.includes('root')
    ? { ...goal, contains: [`${uuidOwner}:${caseGoal.toUpperCase()}`, B], release: {
      examYear: 2026, kind: 'offer' as const, status: 'released' as const, courseLevel: 'GK' as const } } : goal) }
assert.equal(evaluateCurriculumExamReadiness(ownedCaseFixture, []).find(rule => rule.id === 'CQR-202')?.status, 'pass')
const wrongCaseOwner = { ...ownedCaseFixture, goals: ownedCaseFixture.goals.map(goal => goal.tags?.includes('root')
  ? { ...goal, contains: [`${uuidOwner.toUpperCase()}:${caseGoal}`, B] } : goal) }
assert.equal(evaluateCurriculumExamReadiness(wrongCaseOwner, []).find(rule => rule.id === 'CQR-202')?.status, 'fail')
for (const [id, kind] of [['CQR-204', 'structure'], ['CQR-202', 'readiness']] as const) {
  assertStopsFloors({ ...passed, rules: passed.rules.filter(rule => rule.id !== id) })
  assertStopsFloors({ ...passed, rules: [...passed.rules, passed.rules.find(rule => rule.id === id)!] })
  for (const patch of [
    { checkedGoalIds: [] }, { checkedGoalIds: [A, A] }, { requiredGoalIds: [] },
    { landscapeId: 'other-owner' }, { failingGoalIds: [A] }, { discoveryIssues: ['missing view'] },
  ]) {
    assertStopsFloors({ ...passed, rules: passed.rules.map(rule => rule.id === id ? { ...rule,
      assessmentValidation: { ...rule.assessmentValidation!, ...patch } } : rule) })
  }
  assertStopsFloors({ ...passed, rules: passed.rules.map(rule => rule.id === id ? { ...rule, assessmentValidation: undefined } : rule) })
  for (const metric of ['examDefinitions', 'requiredExams', 'checkedExams', 'weakExamData', 'discoveryIssues']) {
    assertStopsFloors({ ...passed, rules: passed.rules.map(rule => rule.id === id
      ? { ...rule, metrics: { ...rule.metrics, [metric]: (rule.metrics?.[metric] ?? 0) + 1 } } : rule) })
  }
  assert.equal(manifestFor(passed.rules, kind).checkedGoalIds.length, 1)
}
for (const consistentMetrics of [false, true]) {
  assertStopsFloors({ ...passed, rules: passed.rules.map(rule => !rule.assessmentValidation ? rule : ({
    ...rule, assessmentValidation: { ...rule.assessmentValidation, requiredGoalIds: [],
      ...(rule.id === 'CQR-202' ? { checkedGoalIds: [] } : {}) },
    metrics: { ...rule.metrics, ...(consistentMetrics ? { requiredExams: 0,
      ...(rule.id === 'CQR-202' ? { checkedExams: 0 } : {}) } : {}) },
  })) })
}
const aliasProbe = fullCore(offer(fixture))
for (const rule of aliasProbe.rules) {
  if (!rule.assessmentValidation) continue
  assert.notEqual(rule.assessmentValidation.definitionGoalIds, aliasProbe.expectedScope.definitionGoalIds)
  assert.notEqual(rule.assessmentValidation.requiredGoalIds, aliasProbe.expectedScope.requiredGoalIds)
  rule.assessmentValidation.definitionGoalIds.splice(0)
  rule.assessmentValidation.requiredGoalIds.splice(0)
  rule.assessmentValidation.checkedGoalIds.splice(0)
  rule.metrics = { examDefinitions: 0, requiredExams: 0, checkedExams: 0, weakExamData: 0, discoveryIssues: 0 }
}
assert.deepEqual(aliasProbe.expectedScope.definitionGoalIds, [A])
assert.deepEqual(aliasProbe.expectedScope.requiredGoalIds, [A])
assert.ok(Object.isFrozen(aliasProbe.expectedScope.definitionGoalIds))
assertStopsFloors(aliasProbe)
assert.equal(deriveCurriculumMaturity(passed.rules, [goodScope], strictGraphFixtureId), 'M3', 'A claimed scope is not independent source context.')
// A legitimately checked foreign prerequisite is not an exam definition in
// this owner's namespace, even if all forged counts remain consistent.
const foreign = { ...fixture, landscapeId: 'foreign-owner', goals: [{ ...fixture.goals[1], id: B }] }
const own = { ...fixture, goals: fixture.goals.filter(goal => goal.id !== B).map(goal => goal.id === A
  ? { ...goal, requires: [`foreign-owner:${B}`] }
  : { ...goal, contains: [A], weight: 1 }) }
const withForeign = fullCore(offer(own), [], [own, foreign])
assert.equal(maturityFor(withForeign), 'M7')
assert.ok(withForeign.rules.find(rule => rule.id === 'CQR-001')?.graphIntegrity?.checkedGoalKeys.includes(`foreign-owner:${B}`))
assertStopsFloors({ ...withForeign, rules: withForeign.rules.map(rule => !rule.assessmentValidation ? rule : ({
  ...rule, assessmentValidation: { ...rule.assessmentValidation, definitionGoalIds: [B], requiredGoalIds: [B], checkedGoalIds: [B] },
})) })
// An unoffered, uncontained definition still has N19 obligations. Neither an
// invented retired flag nor a prose note exempts a missing/generic solution.
const unofferedBad = mutate(fixture, A, { solutionContent: '', reviewStatus: 'draft', reviewNote: 'retired' })
assert.equal(manifestFor(evaluateCurriculumExamReadiness(unofferedBad, []), 'readiness').checkedGoalIds.length, 0)
assertStopsFloors(fullCore(unofferedBad))
assertStopsFloors(fullCore(mutate(fixture, A, { solutionContent: boilerplate })))
assertStopsFloors(fullCore({ ...fixture, goals: fixture.goals.map(goal => goal.id === A
  ? { ...goal, examData: undefined } : goal) }))
const draft = mutate(fixture, A, { reviewStatus: 'draft' })
assert.equal(maturityFor(fullCore(draft)), 'M7', 'Complete unoffered drafts do not invent a release obligation.')
assert.equal(evaluateExamTaskReadiness([draft.goals[0]]).status, 'fail')
assertStopsFloors(fullCore(offer(draft)))
const legacy = mutate(offer(fixture), A, { reviewStatus: undefined })
assert.equal(maturityFor(fullCore(legacy)), 'M7', 'Legacy missing reviewStatus retains the existing readiness semantics.')
const noRoutes = fullCore(fixture)
assert.equal(deriveCurriculumMaturity(noRoutes.rules, [], strictGraphFixtureId, noRoutes.expectedScope), 'M2', 'Assessment checks do not configure absent routes.')

const directory = mkdtempSync(resolve(tmpdir(), 'skillpilot-exam-readiness-'))
try {
  const viewFile = resolve(directory, 'fixture.view.json')
  const writeView = (projectionRole: 'target' | 'prerequisiteOnly', goalId = A) => writeFileSync(viewFile, JSON.stringify({
    viewId: 'fixture-view', landscapeId: strictGraphFixtureId,
    scope: { schoolForm: 'Gymnasium', stage: 'SekII', courseProfile: 'GK' },
    rootNodes: [{ kind: 'goalEntry', goalId, projectionRole }],
  }))
  writeView('target')
  assertStopsFloors(fullCore(draft, [viewFile]))
  writeView('prerequisiteOnly')
  assert.equal(maturityFor(fullCore(draft, [viewFile])), 'M7', 'Support-only references are not exam targets.')
  writeView('target', '00000000-0000-4000-8000-000000000099')
  assertStopsFloors(fullCore(fixture, [viewFile]))
  writeView('target', `wrong-owner:${A}`)
  assertStopsFloors(fullCore(fixture, [viewFile]))
} finally { rmSync(directory, { recursive: true, force: true }) }
console.log(`Complete assessment gate passed: 10 actual Info offers, 16 actual DE/History view targets, ${hiddenPayloadNegatives} payload negatives; retained/draft/legacy/discovery/manifest guards and real graph → M7/M6-floor chain.`)
