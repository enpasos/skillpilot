// SPDX-License-Identifier: Apache-2.0
// Conformance of the learning-unit validator: shared fixtures, runtime schema, goal kinds, review binding and CLI contract.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  UnitGraph, assessmentReviewRevisions, validateLearningUnits, validateOfferedScopes,
  type UnitFinding, type UnitGraphGoal, type UnitGraphLandscape,
} from './lib/learningUnitContracts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
export const learningUnitFixturePath = 'contracts/curriculum-package/v1.2/fixtures/learning-units/cases.json'

interface ExpectedFinding { code: string; unitId?: string; goalId?: string }
interface FixtureCase {
  id: string
  landscapes: UnitGraphLandscape[]
  offered?: { id: string; landscapeId: string; seedTargetGoalIds: string[]; targetGoalIds: string[]; members: string[] }[]
  expect: {
    valid: boolean
    findings: ExpectedFinding[]
    offeredFindings?: ExpectedFinding[]
    units?: Record<string, { valid?: boolean; totalScope?: number; goalsWithoutReviewedCoverage?: string[] }>
    ledgers?: Record<string, { atomicGoals: number; ownedGoals: number }>
  }
}

const signature = (finding: ExpectedFinding | UnitFinding): string =>
  [finding.code, finding.unitId ?? '-', finding.goalId ?? '-'].join(' ')
const expectFindings = (caseId: string, actual: UnitFinding[], expected: ExpectedFinding[], label: string) => {
  // An expected entry pins only the fields it names.
  const project = (finding: UnitFinding, pattern: ExpectedFinding): string => signature({
    code: finding.code, unitId: 'unitId' in pattern ? finding.unitId : undefined,
    goalId: 'goalId' in pattern ? finding.goalId : undefined,
  })
  const remaining = [...actual]
  for (const pattern of expected) {
    const index = remaining.findIndex((finding) => project(finding, pattern) === signature(pattern))
    assert.notEqual(index, -1, `${caseId}: missing ${label} ${signature(pattern)}; got ${actual.map(signature).join(' | ') || 'none'}`)
    remaining.splice(index, 1)
  }
  assert.deepEqual(remaining.map(signature), [], `${caseId}: unexpected ${label}`)
}

const fixtures = json(learningUnitFixturePath) as { cases: FixtureCase[] }
assert.equal(new Set(fixtures.cases.map(({ id }) => id)).size, fixtures.cases.length, 'Fixture case IDs must be unique')
const coveredCodes = new Set<string>()
for (const fixture of fixtures.cases) {
  const graph = new UnitGraph(fixture.landscapes)
  const result = validateLearningUnits(fixture.landscapes, graph)
  expectFindings(fixture.id, result.findings, fixture.expect.findings, 'finding')
  assert.equal(fixture.expect.valid, fixture.expect.findings.length === 0, `${fixture.id}: expect.valid must mirror expect.findings`)
  if (fixture.expect.units) {
    if (Object.keys(fixture.expect.units).length === 0) assert.deepEqual(result.units, [], `${fixture.id}: no unit expected`)
    for (const [unitId, expected] of Object.entries(fixture.expect.units)) {
      const unit = result.units.find((summary) => summary.unitId === unitId)
      assert(unit, `${fixture.id}: missing unit summary ${unitId}`)
      if (expected.valid !== undefined) assert.equal(unit.structurallyValid, expected.valid, `${fixture.id}/${unitId}: validity`)
      if (expected.totalScope !== undefined) assert.equal(unit.totalScope, expected.totalScope, `${fixture.id}/${unitId}: total scope`)
      if (expected.goalsWithoutReviewedCoverage) {
        assert.deepEqual(unit.goalsWithoutReviewedCoverage, expected.goalsWithoutReviewedCoverage, `${fixture.id}/${unitId}: reviewed coverage`)
      }
    }
  }
  // A unit is valid exactly when no finding names it.
  for (const unit of result.units) {
    const named = result.findings.some((finding) => finding.landscapeId === unit.landscapeId && finding.unitId === unit.unitId)
    assert.equal(unit.structurallyValid, !named, `${fixture.id}/${unit.unitId}: validity must follow the findings`)
  }
  if (fixture.expect.ledgers) {
    assert.deepEqual(result.ledgers.map((ledger) => ledger.landscapeId).sort(), Object.keys(fixture.expect.ledgers).sort(),
      `${fixture.id}: landscapes with learning units`)
    for (const [landscapeId, expected] of Object.entries(fixture.expect.ledgers)) {
      const ledger = result.ledgers.find((entry) => entry.landscapeId === landscapeId)!
      assert.equal(ledger.atomicGoals, expected.atomicGoals, `${fixture.id}/${landscapeId}: atomic goals`)
      assert.equal(ledger.ownedGoals, expected.ownedGoals, `${fixture.id}/${landscapeId}: owned goals`)
      const unowned = Object.values(ledger.unownedGoals).reduce((sum, count) => sum + count, 0)
      assert.equal(unowned, expected.atomicGoals - expected.ownedGoals, `${fixture.id}/${landscapeId}: unowned goals`)
    }
  }
  const offeredFindings = fixture.offered ? validateOfferedScopes(result.catalogs, graph, fixture.offered.map((membership) => ({
    ...membership, seedTargetGoalIds: new Set(membership.seedTargetGoalIds), targetGoalIds: new Set(membership.targetGoalIds),
  }))) : []
  expectFindings(fixture.id, offeredFindings, fixture.expect.offeredFindings ?? [], 'offered finding')
  for (const finding of [...result.findings, ...offeredFindings]) coveredCodes.add(finding.code)
}
// Every finding code the validator can emit is exercised by at least one fixture.
const source = readFileSync(resolve(root, 'app/scripts/lib/learningUnitContracts.ts'), 'utf8')
const declaredCodes = [...source.matchAll(/'(LU-[A-Z0-9-]+)'/gu)].map((match) => match[1])
assert.deepEqual([...new Set(declaredCodes)].sort(), [...coveredCodes].sort(), 'Each finding code needs a fixture')

// The runtime landscape schema states the same closed declaration for program units and placements.
const runtimeSchema = json('docs/landscape-runtime.schema.json') as { $defs: Record<string, unknown> }
const fragment = (name: string) => new Ajv2020({ allErrors: true, strict: false })
  .compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $ref: `#/$defs/${name}`, $defs: runtimeSchema.$defs })
const programUnitSchema = fragment('programUnit'), goalPlacementSchema = fragment('goalPlacement'), goalSchema = fragment('goal')
const learningUnit = { id: 'u', kind: 'learningUnit', label: 'Einheit', labelEn: 'Unit', promise: 'Ich kann es.', promiseEn: 'I can do it.', revision: '2026-11-12-v1' }
const yearUnit = { id: 'y5', kind: 'year', label: 'Jahrgangsstufe 5', shortLabel: 'J5', order: 5 }
assert(programUnitSchema(learningUnit) && programUnitSchema({ ...learningUnit, parentUnitId: 'top', order: 1 }) && programUnitSchema(yearUnit))
for (const [label, unit] of Object.entries({
  'a learning unit without an English promise': { ...learningUnit, promiseEn: undefined },
  'a learning unit with a field outside the contract': { ...learningUnit, waivableGoalIds: ['A'] },
  'a learning unit with a short label': { ...learningUnit, shortLabel: 'U' },
  'a learning unit with a free-form revision': { ...learningUnit, revision: 'latest' },
  'a learning unit whose ID is no slug': { ...learningUnit, id: 'Unit_A' },
  'a learning promise on a year unit': { ...yearUnit, promise: 'Kein Lernversprechen.' },
})) assert(!programUnitSchema(JSON.parse(JSON.stringify(unit))), `Runtime schema must reject ${label}`)
assert(goalPlacementSchema({ goalId: 'A', unitId: 'u', relation: 'own' }))
assert(goalPlacementSchema({ goalId: 'A', unitId: 'y5', relation: 'primary', context: { jurisdiction: 'DE-HE' } }))
assert(!goalPlacementSchema({ goalId: 'A', unitId: 'u', relation: 'own', context: { jurisdiction: 'DE-HE' } }), 'Ownership carries no context')
assert(!goalPlacementSchema({ goalId: 'A', unitId: 'u', relation: 'own', waivedGoalIds: ['B'] }), 'Ownership carries no undeclared field')
assert(goalPlacementSchema({ goalId: 'A', unitId: 'y5', relation: 'primary', note: 'calendar placements stay open' }))
const coverageReview = { assessmentGoalId: 'Q', goalIds: ['A'], reference: 'review.md',
  taskRevision: `sha256:${'0'.repeat(64)}`, rubricRevision: `sha256:${'0'.repeat(64)}` }
const reviewedUnit = (review: unknown) => JSON.parse(JSON.stringify({ ...learningUnit, coverageReviews: [review] }))
assert(programUnitSchema(reviewedUnit(coverageReview)), JSON.stringify(programUnitSchema.errors))
assert(!programUnitSchema(reviewedUnit({ ...coverageReview, approvedBy: 'someone' })), 'A coverage review has exactly its five fields')
assert(!programUnitSchema(reviewedUnit({ ...coverageReview, assessmentGoalId: undefined })), 'A coverage review names its assessment')
assert(!programUnitSchema(reviewedUnit({ ...coverageReview, goalIds: [] })), 'A coverage review names at least one goal')
assert(!programUnitSchema(reviewedUnit({ ...coverageReview, taskRevision: 'latest' })), 'A coverage review binds a sha256 task revision')
assert(!programUnitSchema({ ...yearUnit, coverageReviews: [] }), 'Only a learning unit carries coverage reviews')
// Goal objects carry nothing of the unit contract, so a review never changes a goal's bytes.
const examGoal = { id: 'Q', title: 'Q', description: 'Q', weight: 1, contains: [], requires: [], dimensionTags: { phase: 'Q2' },
  examData: { taskContent: 'Task', solutionContent: 'Solution', scoring: { maxPoints: 2, passingPoints: 1, steps: [] } } }
assert(goalSchema(examGoal), JSON.stringify(goalSchema.errors))
assert.equal('coverageReview' in (runtimeSchema.$defs.goal as { properties: { examData: { properties: object } } }).properties.examData.properties, false)

// Goal kinds mirror the backend completion semantics, including legacy encodings.
const kindOf = (goal: Omit<UnitGraphGoal, 'id'>) => new UnitGraph([{ landscapeId: 'L', goals: [{ id: 'g', ...goal }] }]).kinds('L:g')
assert.deepEqual(kindOf({}), ['ordinary'])
assert.deepEqual(kindOf({ nodeKind: 'tutor' }), ['ordinary'])
assert.deepEqual(kindOf({ nodeKind: 'EXAM' }), ['assessment'])
assert.deepEqual(kindOf({ examData: {} }), ['assessment'])
assert.deepEqual(kindOf({ semanticKind: 'practiceAssessment' }), ['assessment'])
assert.deepEqual(kindOf({ extendedData: { vocabularySource: '/data/deck.json' } }), ['memory'])
assert.deepEqual(kindOf({ tags: ['srs-deck:math'] }), ['memory'])
assert.deepEqual(kindOf({ semanticKind: 'orientation' }), ['orientation'])
assert.deepEqual(kindOf({ tags: ['orientation'] }), ['orientation'])
// An explicit semantic kind decides; the legacy orientation tag is then ignored.
assert.deepEqual(kindOf({ semanticKind: 'content', tags: ['orientation'] }), ['ordinary'])

// Review bindings are refused for content the backend would hash differently.
const exam = (scoring: unknown, taskContent = 'Task'): UnitGraphGoal =>
  ({ id: 'Q', examData: { taskContent, solutionContent: 'Solution', scoring } })
assert.throws(() => assessmentReviewRevisions(exam({ maxPoints: 2.5 })), /integer numbers/u)
assert.throws(() => assessmentReviewRevisions(exam({ maxPoints: 2 }, 'Task\u0001')), /control character/u)
assert.throws(() => assessmentReviewRevisions({ id: 'Q', examData: { taskContent: 'Task' } }), /lacks a task, solution or rubric/u)
assert.equal(assessmentReviewRevisions(exam({ b: 1, a: [2, 1] })).rubricRevision,
  assessmentReviewRevisions(exam({ a: [2, 1], b: 1 })).rubricRevision, 'Object key order must not change a binding')
assert.notEqual(assessmentReviewRevisions(exam({ a: [2, 1] })).rubricRevision,
  assessmentReviewRevisions(exam({ a: [1, 2] })).rubricRevision, 'Array order is part of a binding')

// The binding equals the one the backend verifies for the shipped assessment-completion pilot.
const pilot = json('curricula/DE/Gymnasium/completion-profiles/math-dot-product-projection.json') as {
  review: { taskRevision: string; rubricRevision: string }; rules: { assessmentGoalIds: string[] }[]
}
const mathematics = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json') as UnitGraphLandscape
const pilotAssessments = pilot.rules.flatMap((rule) => rule.assessmentGoalIds)
assert.equal(pilotAssessments.length, 1, 'The pilot binds exactly one assessment')
const pilotGoal = mathematics.goals.find((goal) => goal.id === pilotAssessments[0])
assert(pilotGoal, 'Pilot assessment must exist in canonical Mathematics')
assert.deepEqual(assessmentReviewRevisions(pilotGoal),
  { taskRevision: pilot.review.taskRevision, rubricRevision: pilot.review.rubricRevision },
  'TypeScript and backend review bindings must agree')

// CLI contract: 0 valid, 1 findings, 2 malformed input.
const work = mkdtempSync(join(tmpdir(), 'learning-unit-cli-'))
try {
  const canonical = join(work, 'canonical')
  mkdirSync(canonical)
  const run = (...args: string[]) => spawnSync(process.execPath,
    [resolve(root, 'app/node_modules/tsx/dist/cli.mjs'), resolve(root, 'app/scripts/validateLearningUnits.ts'), ...args],
    { cwd: resolve(root, 'app'), encoding: 'utf8' })
  const unit = { id: 'u', kind: 'learningUnit', label: 'Einheit', labelEn: 'Unit', promise: 'Ich kann es.', promiseEn: 'I can do it.', revision: '2026-11-12-v1' }
  const write = (landscape: Record<string, unknown>) => writeFileSync(join(canonical, 'L.json'), JSON.stringify({
    landscapeId: 'L', goals: [{ id: 'Q', nodeKind: 'exam', requires: ['A'] }, { id: 'A' }, { id: 'C' }], ...landscape,
  }))
  const own = (...goalIds: string[]) => goalIds.map((goalId) => ({ goalId, unitId: 'u', relation: 'own' }))
  const local = ['--canonical', canonical]

  write({})
  let outcome = run(...local)
  assert.equal(outcome.status, 0, outcome.stderr)
  assert.match(outcome.stdout, /passed: 1 landscape\(s\), 0 unit\(s\), 0 finding\(s\)/u, 'No authored unit is a valid state')

  write({ programUnits: [unit], goalPlacements: own('Q', 'A') })
  outcome = run(...local)
  assert.equal(outcome.status, 0, outcome.stderr)
  assert.match(outcome.stdout, /L \(partial\): 2\/3 atomic goals owned; without unit: 1 ordinary/u)
  assert.match(outcome.stdout, /u: valid; own 1 ordinary, 1 assessment, 0 memory, 0 orientation; total scope 2; reviewed coverage missing for 1 goal/u)

  write({ programUnits: [unit], goalPlacements: own('Q', 'A', 'C') })
  outcome = run(...local)
  assert.equal(outcome.status, 1)
  assert.match(outcome.stderr, /LU-R1 L\/u: Goal C lies on no prerequisite path/u)
  assert.match(outcome.stdout, /u: INVALID/u)

  write({ programUnits: [unit], goalPlacements: own('Q', 'A'), learningUnitCoverage: 'complete' })
  outcome = run(...local)
  assert.equal(outcome.status, 1)
  assert.match(outcome.stderr, /LU-R4-UNOWNED L: Goal C has no owning unit/u)

  write({ programUnits: [{ ...unit, waivableGoalIds: ['A'] }], goalPlacements: own('Q', 'A') })
  outcome = run(...local)
  assert.equal(outcome.status, 1)
  assert.match(outcome.stderr, /LU-UNIT L\/u: Learning unit u: field waivableGoalIds is not part of the contract/u)

  writeFileSync(join(canonical, 'L.json'), '{ not json')
  assert.equal(run(...local).status, 2)
  assert.equal(run('--unknown').status, 2)
  assert.equal(run('--canonical').status, 2)
  assert.equal(run('--canonical', join(work, 'missing')).status, 2)

  // The repository's own landscapes are valid at this commit.
  outcome = run()
  assert.equal(outcome.status, 0, `${outcome.stdout}\n${outcome.stderr}`)
} finally {
  rmSync(work, { recursive: true, force: true })
}

console.log(`Learning-unit contract tests passed: ${fixtures.cases.length} fixture cases, ${coveredCodes.size} finding codes.`)
