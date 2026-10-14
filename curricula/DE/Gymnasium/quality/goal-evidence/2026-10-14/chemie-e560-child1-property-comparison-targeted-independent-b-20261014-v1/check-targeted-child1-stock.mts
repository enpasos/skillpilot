// Bounded stock checks for an independent review; Apache-2.0.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-e560-child1-property-comparison-targeted-independent-b-20261014-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-e560-child1-property-comparison-targeted-P-author-successor-20261014-v1'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const oldCases = read(`${base}/positive/four-whole-child-cases.DEEN.author.json`)
const cases = read(`${author}/candidate/four-whole-cases.property-comparison-author-successor.json`)
const oldProfiles = read(`${base}/positive/two-complete-positive-v2-child-profiles.DEEN.author.json`)
const profiles = read(`${author}/candidate/two-whole-profiles.property-comparison-author-successor.json`)
const cas = read(`${author}/CAS.one-whole-case-two-carriers-and-child1-profile.author.json`)
assert.equal(cases.cases.length, 4)
assert.equal(profiles.goals.length, 2)
assert.deepEqual(cas.beforeWholeCase, oldCases.cases[1])
assert.deepEqual(cas.afterWholeCase, cases.cases[1])
assert.deepEqual(cas.beforeWholeChild1ProfileSpec, oldProfiles.goals[0])
assert.deepEqual(cas.afterWholeChild1ProfileSpec, profiles.goals[0])
assert.deepEqual(cases.cases[0], oldCases.cases[0])
assert.deepEqual(cases.cases.slice(2), oldCases.cases.slice(2))
assert.deepEqual(profiles.goals[1], oldProfiles.goals[1])
assert.deepEqual(profiles.goals[0].profile.coverageExpectations, oldProfiles.goals[0].profile.coverageExpectations)
assert.deepEqual(profiles.goals[0].profile.variationAxes, oldProfiles.goals[0].profile.variationAxes)
assert.deepEqual(profiles.goals[0].profile.expectations[0], oldProfiles.goals[0].profile.expectations[0])
assert.deepEqual(profiles.goals[0].profile.expectations[2], oldProfiles.goals[0].profile.expectations[2])
assert.deepEqual(profiles.goals[0].profile.applicationCaseBriefs[0], oldProfiles.goals[0].profile.applicationCaseBriefs[0])
assert.deepEqual(cases.cases[1].rubric[0], oldCases.cases[1].rubric[0])
assert.deepEqual(cases.cases[1].rubric[2], oldCases.cases[1].rubric[2])
for (const field of ['dataDe', 'dataEn', 'expectationIds', 'maximumPoints', 'visualizationRequired']) {
  assert.deepEqual(cases.cases[1][field], oldCases.cases[1][field])
}
for (const c of cases.cases) {
  const spec = profiles.goals.find((g: any) => g.goalId === c.goalId)
  const brief = spec.profile.applicationCaseBriefs.find((b: any) => b.id === c.caseId)
  assert.equal(brief.taskDemandDe, c.taskDe)
  assert.equal(brief.taskDemandEn, c.taskEn)
  assert.equal(brief.expectedPerformanceDe, c.modelAnswerDe)
  assert.equal(brief.expectedPerformanceEn, c.modelAnswerEn)
  assert.equal(brief.understandingFocusDe, c.rubric.map((r: any) => r.criterionDe).join(' / '))
  assert.equal(brief.understandingFocusEn, c.rubric.map((r: any) => r.criterionEn).join(' / '))
  assert.deepEqual(c.expectationIds, c.rubric.map((r: any) => r.expectationId))
  assert.equal(c.rubric.reduce((n: number, r: any) => n + r.maximumPoints, 0), c.maximumPoints)
  for (const id of c.expectationIds) assert(spec.profile.expectations.some((e: any) => e.id === id))
}
const schema = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, ...schema.properties.profile })
const validateRecord = ajv.compile(schema)
for (const spec of profiles.goals) assert(validateProfile(spec.profile), JSON.stringify(validateProfile.errors))
const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve(root, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2, reviewId: profiles.reviewId,
  goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
  landscapePath: `${base}/candidate/canonical533.current407.author.inactive.json`,
  semanticKindLedgerPath: `${base}/candidate/semantic533.current407.author.proposals.inactive.json`,
  reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',
  reviewPath: `${own}/not-written-authority.jsonl`, reviewedResourceTypes: [], requireApproved: false,
  scope: { label: 'Independent B bounded targeted child1 property comparison followup', goalIds: profiles.goals.map((g: any) => g.goalId) },
}
const after = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: profiles })
const before = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: oldProfiles })
for (const record of after) {
  assert(validateRecord(record), JSON.stringify(validateRecord.errors))
  assert.equal(record.status, 'needs_human_review')
  assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E0')
  assert.equal(record.maximumClaimScope, 'G0')
}
assert.equal(after[0].goalFingerprint, before[0].goalFingerprint)
assert.equal(after[0].reviewInputFingerprint, before[0].reviewInputFingerprint)
assert.notEqual(after[0].profileFingerprint, before[0].profileFingerprint)
assert.deepEqual(after[1], before[1])
const report = {
  schemaVersion: 1, status: 'PASS', stockProfileAndFullRecordSchemas: 'PASS',
  stockProfileSemanticsAndExactGoalInputProfileFingerprints: 'PASS',
  completeFourCaseTaskAnswerRubricExpectationJoins: 'PASS', exactCASBeforeAfterJoins: 'PASS',
  case1AndBothChild2CasesAndWholeChild2ProfilePreserved: true,
  formationAndBalanceRubricAndNetworkRubricAndDataPreserved: true,
  coverageContractAndVariationAxesPreserved: true,
  profiles: after.map((r: any) => ({ goalId: r.goalId, goalFingerprint: r.goalFingerprint,
    reviewInputFingerprint: r.reviewInputFingerprint, profileFingerprint: r.profileFingerprint,
    status: r.status, reviewAuthority: r.reviewAuthority, evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope })),
  authorRecordsMaterializedOnlyInMemory: true, nativeDOrPAuthorityRowsWritten: false,
  scientificAcceptanceFromTheseChecks: false,
}
writeFileSync(resolve(root, `${own}/STOCK.targeted-child1-schema-semantics-joins.actual.json`), JSON.stringify(report, null, 2) + '\n')
console.log('PASS: stock P schemas/semantics/fingerprints; four full case joins; whole CAS; exact supporting case1/child2 and formation/network-duty preservation; no authority rows written.')
