// SPDX-License-Identifier: Apache-2.0
// Conformance of the learning-unit validator: shared fixtures, schema, review binding and CLI contract.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  UnitGraph, assessmentReviewRevisions, validateLearningUnitCatalogs, validateOfferedScopes,
  type LearningUnitCatalog, type UnitFinding, type UnitGraphGoal, type UnitGraphLandscape,
} from './lib/learningUnitContracts'
import { learningUnitCatalogSchemaErrors } from './validateLearningUnits'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))

interface FixtureUnit { id: string; ownGoalIds: string[]; childUnitIds?: string[]; coverageReviews?: LearningUnitCatalog['units'][number]['coverageReviews'] }
interface FixtureCatalog { catalogId: string; landscapeId: string; completeness: 'partial' | 'complete'; units: FixtureUnit[] }
interface ExpectedFinding { code: string; unitId?: string; goalId?: string }
interface FixtureCase {
  id: string
  landscapes: UnitGraphLandscape[]
  catalogs: FixtureCatalog[]
  offered?: { id: string; landscapeId: string; seedTargetGoalIds: string[]; targetGoalIds: string[]; members: string[] }[]
  expect: {
    findings: ExpectedFinding[]
    offeredFindings?: ExpectedFinding[]
    units?: Record<string, { valid?: boolean; totalScope?: number; goalsWithoutReviewedCoverage?: string[] }>
    ledgers?: Record<string, { atomicGoals: number; ownedGoals: number }>
  }
}

// Fixtures state only what a case is about; identity and wording fields are completed here.
function completeCatalog(fixture: FixtureCatalog, graph: UnitGraph): LearningUnitCatalog {
  return {
    schemaVersion: 1, catalogId: fixture.catalogId, landscapeId: fixture.landscapeId, revision: '2026-11-12-v1',
    completeness: fixture.completeness,
    units: fixture.units.map((unit) => ({
      id: unit.id, revision: '2026-11-12-v1',
      title: { de: `Einheit ${unit.id}`, en: `Unit ${unit.id}` },
      promise: { de: 'Ich kann das Fixture anwenden.', en: 'I can apply the fixture.' },
      ownGoalIds: unit.ownGoalIds,
      ...(unit.childUnitIds ? { childUnitIds: unit.childUnitIds } : {}),
      ...(unit.coverageReviews ? { coverageReviews: unit.coverageReviews.map((review) => {
        const key = `${fixture.landscapeId}:${review.assessmentGoalId}`
        const current = graph.has(key) && graph.goal(key).examData?.scoring ? assessmentReviewRevisions(graph.goal(key)) : undefined
        const bind = (value: string, revision?: string) => value === '@current'
          ? revision ?? `sha256:${'f'.repeat(64)}` : value
        return { ...review, taskRevision: bind(review.taskRevision, current?.taskRevision),
          rubricRevision: bind(review.rubricRevision, current?.rubricRevision) }
      }) } : {}),
    })),
  }
}
const signature = (finding: ExpectedFinding | UnitFinding): string =>
  [finding.code, finding.unitId ?? '-', finding.goalId ?? '-'].join(' ')
const expectFindings = (caseId: string, actual: UnitFinding[], expected: ExpectedFinding[], label: string) => {
  // Expected entries pin only the fields they name.
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

const fixtures = json('contracts/drafts/learning-unit/v1/fixtures/cases.json') as { cases: FixtureCase[] }
assert.equal(new Set(fixtures.cases.map(({ id }) => id)).size, fixtures.cases.length, 'Fixture case IDs must be unique')
const coveredCodes = new Set<string>()
for (const fixture of fixtures.cases) {
  const graph = new UnitGraph(fixture.landscapes)
  const catalogs = fixture.catalogs.map((catalog) => completeCatalog(catalog, graph))
  for (const catalog of catalogs) {
    assert.deepEqual(learningUnitCatalogSchemaErrors(catalog), [], `${fixture.id}: fixture catalog must satisfy the schema`)
  }
  const result = validateLearningUnitCatalogs(catalogs, graph)
  expectFindings(fixture.id, result.findings, fixture.expect.findings, 'finding')
  for (const [unitId, expected] of Object.entries(fixture.expect.units ?? {})) {
    const unit = result.units.find((summary) => summary.unitId === unitId)
    assert(unit, `${fixture.id}: missing unit summary ${unitId}`)
    if (expected.valid !== undefined) assert.equal(unit.structurallyValid, expected.valid, `${fixture.id}/${unitId}: validity`)
    if (expected.totalScope !== undefined) assert.equal(unit.totalScope, expected.totalScope, `${fixture.id}/${unitId}: total scope`)
    if (expected.goalsWithoutReviewedCoverage) {
      assert.deepEqual(unit.goalsWithoutReviewedCoverage, expected.goalsWithoutReviewedCoverage, `${fixture.id}/${unitId}: reviewed coverage`)
    }
  }
  for (const [catalogId, expected] of Object.entries(fixture.expect.ledgers ?? {})) {
    const ledger = result.ledgers.find((entry) => entry.catalogId === catalogId)
    assert(ledger, `${fixture.id}: missing ledger ${catalogId}`)
    assert.equal(ledger.atomicGoals, expected.atomicGoals, `${fixture.id}/${catalogId}: atomic goals`)
    assert.equal(ledger.ownedGoals, expected.ownedGoals, `${fixture.id}/${catalogId}: owned goals`)
    const unowned = Object.values(ledger.unownedGoals).reduce((sum, count) => sum + count, 0)
    assert.equal(unowned, expected.atomicGoals - expected.ownedGoals, `${fixture.id}/${catalogId}: unowned goals`)
  }
  const offeredFindings = fixture.offered ? validateOfferedScopes(catalogs, graph, fixture.offered.map((membership) => ({
    ...membership, seedTargetGoalIds: new Set(membership.seedTargetGoalIds), targetGoalIds: new Set(membership.targetGoalIds),
  }))) : []
  expectFindings(fixture.id, offeredFindings, fixture.expect.offeredFindings ?? [], 'offered finding')
  for (const finding of [...result.findings, ...offeredFindings]) coveredCodes.add(finding.code)
}
// Every finding code the validator can emit is exercised by at least one fixture.
const source = readFileSync(resolve(root, 'app/scripts/lib/learningUnitContracts.ts'), 'utf8')
const declaredCodes = [...source.matchAll(/'(LU-[A-Z0-9-]+)'/gu)].map((match) => match[1])
assert.deepEqual([...new Set(declaredCodes)].sort(), [...coveredCodes].sort(), 'Each finding code needs a fixture')

// Schema: closed contract. Access policy and manual waiver lists cannot be smuggled into a unit.
const validCatalog = (): LearningUnitCatalog => ({
  schemaVersion: 1, catalogId: 'c', landscapeId: 'L', revision: '2026-11-12-v1', completeness: 'partial',
  units: [{ id: 'u', revision: '2026-11-12-v1', title: { de: 'Titel', en: 'Title' },
    promise: { de: 'Versprechen', en: 'Promise' }, ownGoalIds: ['A'] }],
})
assert.deepEqual(learningUnitCatalogSchemaErrors(validCatalog()), [])
const loose = (value: unknown) => value as Record<string, unknown>
const rejected = (label: string, mutate: (catalog: LearningUnitCatalog) => void) => {
  const catalog = validCatalog()
  mutate(catalog)
  assert.notDeepEqual(learningUnitCatalogSchemaErrors(catalog), [], `Schema must reject ${label}`)
}
rejected('an unknown unit field', (catalog) => { loose(catalog.units[0]).wholeUnitPrerequisites = ['other'] })
rejected('a waiver list', (catalog) => { loose(catalog.units[0]).waivableGoalIds = ['A'] })
rejected('a unit without a promise', (catalog) => { delete loose(catalog.units[0]).promise })
rejected('a promise in one language only', (catalog) => { delete loose(catalog.units[0].promise).en })
rejected('a blank promise', (catalog) => { catalog.units[0].promise.de = '   ' })
rejected('a duplicated own goal', (catalog) => { catalog.units[0].ownGoalIds = ['A', 'A'] })
rejected('an unknown completeness', (catalog) => { loose(catalog).completeness = 'draft' })
rejected('a free-form revision', (catalog) => { catalog.revision = 'latest' })
rejected('another schema version', (catalog) => { loose(catalog).schemaVersion = 2 })
rejected('a review without task binding', (catalog) => {
  loose(catalog.units[0]).coverageReviews = [{ assessmentGoalId: 'Q', goalIds: ['A'], reference: 'r.md',
    rubricRevision: `sha256:${'0'.repeat(64)}` }]
})
rejected('a review record outside the repository', (catalog) => {
  catalog.units[0].coverageReviews = [{ assessmentGoalId: 'Q', goalIds: ['A'], reference: '../r.md',
    taskRevision: `sha256:${'0'.repeat(64)}`, rubricRevision: `sha256:${'0'.repeat(64)}` }]
})

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
  const canonical = join(work, 'canonical'), units = join(work, 'units')
  mkdirSync(canonical); mkdirSync(units)
  writeFileSync(join(canonical, 'L.json'), JSON.stringify({ landscapeId: 'L', goals: [
    { id: 'Q', nodeKind: 'exam', requires: ['A'] }, { id: 'A' }, { id: 'C' },
  ] }))
  const run = (...args: string[]) => spawnSync(process.execPath,
    [resolve(root, 'app/node_modules/tsx/dist/cli.mjs'), resolve(root, 'app/scripts/validateLearningUnits.ts'), ...args],
    { cwd: resolve(root, 'app'), encoding: 'utf8' })
  const write = (mutate: (catalog: LearningUnitCatalog) => void) => {
    const catalog = validCatalog()
    catalog.units[0].ownGoalIds = ['Q', 'A']
    mutate(catalog)
    writeFileSync(join(units, 'c.json'), JSON.stringify(catalog))
  }
  const local = ['--canonical', canonical, '--units', units]

  let outcome = run(...local)
  assert.equal(outcome.status, 0, outcome.stderr)
  assert.match(outcome.stdout, /passed: 0 catalog\(s\), 0 unit\(s\)/u, 'No authored unit is a valid state')

  write(() => {})
  outcome = run(...local)
  assert.equal(outcome.status, 0, outcome.stderr)
  assert.match(outcome.stdout, /c \(L, partial\): 2\/3 atomic goals owned; without unit: 1 ordinary/u)
  assert.match(outcome.stdout, /u: valid; own 1 ordinary, 1 assessment, 0 memory, 0 orientation; total scope 2; reviewed coverage missing for 1 goal/u)

  write((catalog) => { catalog.units[0].ownGoalIds.push('C') })
  outcome = run(...local)
  assert.equal(outcome.status, 1)
  assert.match(outcome.stderr, /LU-R1 c\/u: Goal C lies on no prerequisite path/u)
  assert.match(outcome.stdout, /u: INVALID/u)

  write((catalog) => { catalog.completeness = 'complete' })
  outcome = run(...local)
  assert.equal(outcome.status, 1)
  assert.match(outcome.stderr, /LU-R4-UNOWNED c: Goal C has no owning unit/u)

  write((catalog) => { loose(catalog.units[0]).waivableGoalIds = ['A'] })
  outcome = run(...local)
  assert.equal(outcome.status, 2)
  assert.match(outcome.stderr, /invalid-input: .*violates contracts\/drafts\/learning-unit\/v1\/catalog\.schema\.json/u)

  writeFileSync(join(units, 'c.json'), '{ not json')
  assert.equal(run(...local).status, 2)
  assert.equal(run('--unknown').status, 2)
  assert.equal(run('--units').status, 2)
  assert.equal(run('--canonical', join(work, 'missing'), '--units', units).status, 2)

  // The repository's own catalogs are valid at this commit.
  outcome = run()
  assert.equal(outcome.status, 0, `${outcome.stdout}\n${outcome.stderr}`)
} finally {
  rmSync(work, { recursive: true, force: true })
}

console.log(`Learning-unit contract tests passed: ${fixtures.cases.length} fixture cases, ${coveredCodes.size} finding codes.`)
