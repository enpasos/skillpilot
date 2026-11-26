// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import type { LearningGoal } from '../src/landscapeTypes'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from './goalBookModel'
import { auditDirectedQuantityArrowRoutes, fingerprintDirectedQuantityArrowContract,
  validateDirectedQuantityArrowEvidence, type DirectedQuantityArrowDecision } from './lib/directedQuantityArrows'
import { directedQuantityArrowImageIssues, isDirectedQuantityArrowCriterionApproved,
  preserveDirectedQuantityArrowImageReview, validateDirectedQuantityArrowImageEvidence,
  type DirectedQuantityArrowImageReview } from './lib/directedQuantityArrowVisualizationQa'

const HASH = `sha256:${'a'.repeat(64)}`
const OLD_HASH = `sha256:${'b'.repeat(64)}`
const evidencePath = 'curricula/DE/Gymnasium/quality/fixture/arrow-decisions.json'
const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const goal = { id: 'force', type: 'atomic', title: 'Draw force arrows at the body', requires: ['arrows'] } as LearningGoal
const evidence = () => Buffer.from(JSON.stringify({ schemaVersion: 1, documentType: 'directed-quantity-arrow-decisions', sourceBindings: [],
  rows: [{ goalId: goal.id, contractFingerprint: fingerprintDirectedQuantityArrowContract(goal), usage: 'required',
    representationKinds: ['spatialQuantityArrow'], basis: 'independent current contract reading', rationale: 'This task explicitly requires a scaled force drawing.' }] }))
function decision(): DirectedQuantityArrowDecision {
  return { usage: 'required', representationKinds: ['spatialQuantityArrow'], evidence: { path: evidencePath, sha256: digest(evidence()), entryId: goal.id } }
}
function ledger() {
  return {
    $schema: 'https://skillpilot.com/schemas/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json',
    documentType: 'semantic-kind-ledger', ledgerFormatVersion: 2,
    ledgerId: 'fixture', profileId: 'fixture', profileVersion: '1.0.0', sourceLandscapeId: 'physics-fixture',
    sourceLandscapePath: 'curricula/fixture.json', sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
    reviewMethod: 'one-time-reviewed-pilot-migration-v1',
    counts: { curricularAtomic: 1, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: 1 },
    decisions: [{ goalId: goal.id, semanticKind: 'curricularAtomic', sourceFingerprint: fingerprintSemanticKindSourceGoal({ ...goal }),
      decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-curricular-atomic', directedQuantityArrows: decision() }],
  }
}

test('V2 requires the typed individual marker; missing or unknown markers fail the native parser', () => {
  const current = ledger()
  const parse = (value: unknown) => parseSemanticKindLedger(value, { goals: [goal] }, 'physics-fixture', 'curricula/fixture.json')
  assert.equal(parse(current).directedQuantityArrowsByGoalId.get(goal.id)?.usage, 'required')
  const missing = structuredClone(current) as unknown as { decisions: Array<Record<string, unknown>> }
  delete missing.decisions[0]!.directedQuantityArrows
  assert.throws(() => parse(missing), /closed JSON Schema/)
  const unknown = structuredClone(current)
  Object.assign(unknown.decisions[0]!.directedQuantityArrows, { usage: 'imageOnlyAssumedTeaching' })
  assert.throws(() => parse(unknown), /closed JSON Schema/)
  const silentV1 = { ...current, $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json', ledgerFormatVersion: 1 }
  assert.throws(() => parse(silentV1), /closed JSON Schema/)
})

test('independent contract evidence catches a wrongly omitted marker and changed task contract', () => {
  const read = () => evidence()
  const decisions = new Map([[goal.id, decision()]])
  validateDirectedQuantityArrowEvidence([goal], decisions, read)
  assert.throws(() => validateDirectedQuantityArrowEvidence([goal], new Map(), read), /missing usage marker/)
  const omitted = structuredClone(decision())
  omitted.usage = 'notRequired'
  omitted.representationKinds = ['none']
  assert.throws(() => validateDirectedQuantityArrowEvidence([goal], new Map([[goal.id, omitted]]), read), /contradicts the reviewed contract/)
  assert.throws(() => validateDirectedQuantityArrowEvidence([{ ...goal, description: 'A newly required diagram' }], decisions, read), /stale teaching\/material contract/)
})

test('retired A5 sources bind exact portable receipts and Git-backed reading material on the normal evidence path', () => {
  const dossier = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1'
  const reviewer = `${dossier}/rule/source-l/reviewer-b.md`
  const checks = `${dossier}/rule/final-k4-v3/checks/checks.actual.json`
  const sources = [
    { path: reviewer, sha256: 'sha256:6db07ba6e1bf321a0e0b264c23e532140cc542253aeffe7b3aeb5464152b77f3' },
    { path: checks, sha256: 'sha256:5305c12f9731a5bce43a4bd34596b5dbedcd52491ca67bb2a256805954ca4f1f' },
  ]
  const validate = (changedPath?: string, replacement?: Buffer, sourceBindings = sources) => {
    const bytes = Buffer.from(JSON.stringify({ ...JSON.parse(evidence().toString()), sourceBindings }))
    const current = decision()
    current.evidence.sha256 = digest(bytes)
    validateDirectedQuantityArrowEvidence([goal], new Map([[goal.id, current]]), path => {
      assert.ok(path !== reviewer && path !== checks, 'Retired original was read from the working tree')
      if (path === evidencePath) return bytes
      if (path === changedPath) {
        if (replacement) return replacement
        throw Error(`Missing test input: ${path}`)
      }
      return readFileSync(new URL(`../../${path}`, import.meta.url))
    })
  }
  validate()
  for (const name of ['reviewer-b.successor.actual.json', 'checks.actual.json']) {
    const receipt = `${dossier}/portable/${name}`
    assert.throws(() => validate(receipt), /Missing test input/)
    assert.throws(() => validate(receipt, Buffer.from('{"original":{"sha256":"forged"}}')), /changed portable review source/)
  }
  for (const path of ['basis-l/reviewer-b.md', 'basis-l/provenance.actual.json']) {
    assert.throws(() => validate(`${dossier}/${path}`, Buffer.from('changed')), /changed portable review source/)
  }
  assert.throws(() => validate(`${dossier}/rule/final-k4-v3/checks/reader-controls.log`, Buffer.from('changed')), /changed portable check log/)
  for (const source of sources) {
    assert.throws(() => validate(undefined, undefined, [{ ...source, sha256: OLD_HASH }]), /changed review source/)
  }
})

test('the actual atomic requires path is mandatory, self is allowed, cluster grouping grants no path', () => {
  const arrow = { id: 'arrows', type: 'atomic', requires: [] } as unknown as LearningGoal
  const decisions = new Map([[goal.id, decision()]])
  assert.equal(auditDirectedQuantityArrowRoutes([goal, arrow], decisions, 'arrows').findings.length, 0)
  assert.equal(auditDirectedQuantityArrowRoutes([{ ...goal, requires: [] }, arrow], decisions, 'arrows').findings.length, 1)
  assert.equal(auditDirectedQuantityArrowRoutes([arrow], new Map([['arrows', decision()]]), 'arrows').findings.length, 0)
  const cluster = { id: 'cluster', type: 'cluster', contains: ['arrows'], requires: ['arrows'] } as unknown as LearningGoal
  assert.equal(auditDirectedQuantityArrowRoutes([{ ...goal, requires: ['cluster'] }, arrow, cluster], decisions, 'arrows').findings.length, 1)
})

function imageReview(): DirectedQuantityArrowImageReview {
  return { criterionVersion: 'directed-quantity-arrows-v1', assetSha256: HASH, representationKinds: ['spatialQuantityArrow'], status: 'accepted',
    checks: { referencePoint: 'pass', direction: 'pass', quantityAndOwnScale: 'pass', tipNotPlace: 'pass', additionSameQuantityReference: 'notApplicable' },
    evidence: { path: evidencePath, sha256: HASH, entryId: 'image' }, reviewedAt: '2026-11-26T10:00:00Z', reviewer: 'independent material reader',
    notes: 'The force starts at the body; the legend names N and the independent arrow scale; the tip does not touch another object.' }
}
const imageRecord = (review = imageReview()) => ({ goalId: 'image', visualizationState: 'available', assetSha256: HASH, directedQuantityArrowReview: review })

test('old image hash and an unlabelled force arrow cannot obtain the criterion approval', () => {
  assert.equal(isDirectedQuantityArrowCriterionApproved(imageRecord()), true)
  assert.match(directedQuantityArrowImageIssues(imageRecord({ ...imageReview(), assetSha256: OLD_HASH })).join(' '), /current image hash/)
  const unlabelled = imageReview()
  unlabelled.checks.quantityAndOwnScale = 'fail'
  assert.equal(isDirectedQuantityArrowCriterionApproved(imageRecord(unlabelled)), false)
  assert.match(directedQuantityArrowImageIssues(imageRecord(unlabelled)).join(' '), /quantityAndOwnScale/)
  const missing = { ...imageRecord(), directedQuantityArrowReview: undefined }
  assert.match(directedQuantityArrowImageIssues(missing).join(' '), /missing directed/)
})

test('correct field lines, lens object arrows and an explicitly separate tip-to-tail construction pass', () => {
  for (const kind of ['fieldLineConvention', 'opticalRayOrObject'] as const) {
    const review = imageReview()
    review.representationKinds = [kind]
    review.status = 'notApplicable'
    for (const key of Object.keys(review.checks) as Array<keyof typeof review.checks>) review.checks[key] = 'notApplicable'
    review.notes = kind === 'fieldLineConvention'
      ? 'A field line encodes tangent direction and relative density; it has no quantity-arrow length scale.'
      : 'The object arrow marks the object extent in this lens construction, using the position scale.'
    assert.deepEqual(directedQuantityArrowImageIssues(imageRecord(review)), [])
    assert.equal(isDirectedQuantityArrowCriterionApproved(imageRecord(review)), true)
  }
  const separate = imageReview()
  separate.representationKinds = ['separateVectorConstruction']
  separate.checks.additionSameQuantityReference = 'pass'
  separate.notes = 'Explicit separate tip-to-tail construction; all forces and their sum belong to the named body; the arrow scale is stated.'
  assert.deepEqual(directedQuantityArrowImageIssues(imageRecord(separate)), [])
})

test('criterion evidence is immutable and generation preserves all current fields without approving changed bytes', () => {
  const original = imageRecord()
  const { evidence: _binding, ...review } = original.directedQuantityArrowReview
  const bytes = Buffer.from(JSON.stringify({ schemaVersion: 1, documentType: 'directed-quantity-arrow-image-decisions', sourceBindings: [], rows: [{ goalId: 'image', review }] }))
  original.directedQuantityArrowReview.evidence.sha256 = digest(bytes)
  assert.equal(validateDirectedQuantityArrowImageEvidence([original], () => bytes).accepted, 1)
  const changed = structuredClone(original)
  changed.directedQuantityArrowReview.notes = 'Another unreviewed interpretation'
  assert.throws(() => validateDirectedQuantityArrowImageEvidence([changed], () => bytes), /contradicts reviewed material/)
  assert.deepEqual(preserveDirectedQuantityArrowImageReview(original, HASH), { directedQuantityArrowReview: original.directedQuantityArrowReview })
  assert.deepEqual(preserveDirectedQuantityArrowImageReview(original, OLD_HASH), {})
})
