import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { deviationApprovalSha256, validateDeviation, type DeclinedDecision } from './sourceMappingDeviation'
import { sourceMappingDigest } from './sourceMappingDigest'

const edition = { targetLandscapeId: 'physics', sourceId: 'official-physics-ni', edition: '2022' }
const files = new Map<string, Buffer>()
const readEvidence = (path: string): Buffer => {
  const file = files.get(path)
  if (!file) throw new Error(`Missing fixture evidence ${path}`)
  return file
}
const store = (path: string, bytes: Buffer) => {
  files.set(path, bytes)
  return { path, sha256: createHash('sha256').update(bytes).digest('hex') }
}
const row = { wording: 'Source requirement', context: ['Part A', 'Process'], scope: ['advanced'] }
const rowRef = { sourceGoalId: 'official-row-1', rowSha256: sourceMappingDigest(row) }
const otherRef = { sourceGoalId: 'official-row-2', rowSha256: sourceMappingDigest({ ...row, context: ['Part B'] }) }
const original = { locator: 'page 42, section B, row 7', excerpt: 'The school selects the software.' }
const standingDecision = store('standing-decision.md', Buffer.from('Approved standing decision and scope.'))
const performance = {
  standingDecision,
  retainedPerformance: 'Interpret given measurements and estimate their accuracy.',
  droppedPerformance: 'Operate the specified demonstration equipment.',
}
const fixtures = [
  {
    category: 'schoolOrTeacher', requiredDetail: 'tableHeader',
    evidence: { addressedTo: 'school', subject: 'The school', operator: 'selects', heading: 'Teaching',
      tableHeader: 'School arrangements', sourceLocation: original },
  },
  {
    category: 'duplicate', requiredDetail: 'sameScope',
    evidence: { duplicateOf: otherRef, samePerformance: 'Both require describing the recorded experiment.',
      sameScope: 'Both apply to the advanced class in the same module.' },
  },
  {
    category: 'replacedWithinEdition', requiredDetail: 'authorityLocation',
    evidence: { replacedBy: otherRef, replacedLocation: original,
      replacementLocation: { locator: 'page 44', excerpt: 'The learners use the revised equipment.' },
      authorityLocation: { locator: 'page 4', excerpt: 'Section B on page 44 applies from August 2022.' },
      effectivePeriod: 'From August 2022 through the end of this edition.' },
  },
  {
    category: 'infeasiblePracticalAssessment', requiredDetail: 'ownInvestigation',
    evidence: { ...performance, requiredPerformance: 'Operate the instrument and produce a measurement.',
      practicalObstacle: 'The supported learning setting has no calibrated instrument.',
      consideredEvidenceRoutes: [{ route: 'Simulation', finding: 'The learner cannot operate the instrument.' }],
      ownInvestigation: { route: 'Home measurement', finding: 'A portable substitute cannot attain the required accuracy.' } },
  },
  {
    category: 'deliberateDidacticDeviation', requiredDetail: 'learnerImpact',
    evidence: { ...performance, learnerImpact: 'The learner must obtain operating experience elsewhere.' },
  },
] as const

const schema = JSON.parse(readFileSync(new URL('../../contracts/source-mapping-review/v2/deviation.schema.json', import.meta.url), 'utf8'))
const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
const checkDeviation = ajv.compile(schema)
const checkApproval = ajv.getSchema(`${schema.$id}#/$defs/approval`)
assert(checkApproval)

function approvalFor(decision: DeclinedDecision) {
  return {
    schemaVersion: 1, decisionSha256: deviationApprovalSha256(decision, edition),
    reviewer: decision.reviewer, reviewedAt: decision.reviewedAt, verdict: 'approved',
  }
}

function attachApproval(decision: DeclinedDecision, approval: unknown = approvalFor(decision)): void {
  decision.deviation.review = store(decision.deviation.review.path, Buffer.from(JSON.stringify(approval)))
}

function decisionFor(fixture: typeof fixtures[number] = fixtures[0]): DeclinedDecision {
  const { category, evidence } = fixture
  const deviation = { category, evidence: structuredClone(evidence), categoryVersion: 1,
    reason: `Individual finding for ${category}`, review: { path: `${category}/approval.json`, sha256: '' },
  } as DeclinedDecision['deviation']
  const decision: DeclinedDecision = {
    ...rowRef, decision: 'declined', author: 'Curriculum author', reviewer: 'Independent reviewer',
    reviewedAt: '2026-11-27', deviation,
  }
  attachApproval(decision)
  return decision
}

for (const fixture of fixtures) {
  const decision = decisionFor(fixture)
  assert(checkDeviation(decision.deviation), ajv.errorsText(checkDeviation.errors))
  assert(checkApproval(approvalFor(decision)), ajv.errorsText(checkApproval.errors))
  validateDeviation(decision, edition, readEvidence)

  Reflect.deleteProperty(decision.deviation.evidence, fixture.requiredDetail)
  attachApproval(decision)
  assert.equal(checkDeviation(decision.deviation), false, `${fixture.requiredDetail} is required by the schema`)
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /invalid category evidence/)
}

for (const patch of [{ targetLandscapeId: 'maths' }, { sourceId: 'different-source' }, { edition: '2027' }]) {
  assert.throws(() => validateDeviation(decisionFor(), { ...edition, ...patch }, readEvidence), /affirm this exact decision/)
}
for (const patch of [
  { sourceGoalId: 'another-row' }, { rowSha256: sourceMappingDigest({ ...row, wording: 'One word changed' }) },
  { rowSha256: sourceMappingDigest({ ...row, context: ['Part B', 'Process'] }) },
  { rowSha256: sourceMappingDigest({ ...row, scope: ['basic'] }) },
  { author: 'Different author' }, { reviewer: 'Different reviewer' }, { reviewedAt: '2026-11-28' },
]) {
  const decision = { ...decisionFor(), ...patch }
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /affirm this exact decision/)
}
for (const patch of [
  { reason: 'Different reasoning for this row' },
  { evidence: { ...fixtures[0].evidence, operator: 'determines' } },
  { category: 'duplicate', evidence: fixtures[1].evidence },
]) {
  const decision = decisionFor()
  Object.assign(decision.deviation, patch)
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /affirm this exact decision/)
}
for (const patch of [{ verdict: 'rejected' }, { unexpected: true }]) {
  const decision = decisionFor()
  const approval = { ...approvalFor(decision), ...patch }
  attachApproval(decision, approval)
  assert.equal(checkApproval(approval), false)
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /affirm this exact decision/)
}
const selfReviewed = { ...decisionFor(), reviewer: '  CURRICULUM   AUTHOR  ' }
attachApproval(selfReviewed)
assert.throws(() => validateDeviation(selfReviewed, edition, readEvidence), /independent of the author/)
const impossibleDate = { ...decisionFor(), reviewedAt: '2026-02-30' }
attachApproval(impossibleDate)
assert.throws(() => validateDeviation(impossibleDate, edition, readEvidence), /ISO calendar date/)

for (const [fixture, ref] of [[fixtures[1], 'duplicateOf'], [fixtures[2], 'replacedBy']] as const) {
  const decision = decisionFor(fixture)
  Object.assign(decision.deviation.evidence, { [ref]: rowRef })
  attachApproval(decision)
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /invalid category evidence/)
}
const unboundApproval = decisionFor()
files.set(unboundApproval.deviation.review.path, Buffer.from(JSON.stringify(approvalFor(unboundApproval), null, 2)))
assert.throws(() => validateDeviation(unboundApproval, edition, readEvidence), /approval hash mismatch/)
const malformedApproval = decisionFor()
malformedApproval.deviation.review = store(malformedApproval.deviation.review.path, Buffer.from('approved'))
assert.throws(() => validateDeviation(malformedApproval, edition, readEvidence), /approval must be valid JSON/)
files.delete(malformedApproval.deviation.review.path)
assert.throws(() => validateDeviation(malformedApproval, edition, readEvidence), /cannot read approval/)

for (const fixture of [fixtures[3], fixtures[4]]) {
  const decision = decisionFor(fixture)
  files.set(standingDecision.path, Buffer.from('A different standing decision.'))
  assert.throws(() => validateDeviation(decision, edition, readEvidence), /standing decision hash mismatch/)
}
const unknownCategory = decisionFor()
Object.assign(unknownCategory.deviation, { category: 'other' })
attachApproval(unknownCategory)
assert.equal(checkDeviation(unknownCategory.deviation), false)
assert.throws(() => validateDeviation(unknownCategory, edition, readEvidence), /invalid category evidence/)

console.log('Five deviation categories and independent edition/row/approval bindings passed.')
