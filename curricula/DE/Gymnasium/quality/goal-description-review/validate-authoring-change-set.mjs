#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(here, '../../../../..')
const receiptPath = resolve(
  here,
  'canonical-math-description-authoring-change-set-2026-08-16.json',
)
const requireSource = process.argv.includes('--require-source')

function fail(message) {
  throw new Error(message)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256Bytes(path) {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function digestReceipt(receipt) {
  const payload = structuredClone(receipt)
  delete payload.changeSetDigest
  return `sha256:${createHash('sha256').update(canonicalJson(payload)).digest('hex')}`
}

function reviewedDescriptionDigest(change) {
  return `sha256:${createHash('sha256')
    .update(
      canonicalJson({
        goalId: change.goalId,
        titleDe: change.titleDe,
        titleEn: change.titleEn,
        descriptionDe: change.approvedDescriptionDe,
        descriptionEn: change.approvedDescriptionEn,
      }),
    )
    .digest('hex')}`
}

function collectForbiddenTemporaryFields(value, path = '$', findings = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenTemporaryFields(item, `${path}[${index}]`, findings))
    return findings
  }
  if (!value || typeof value !== 'object') return findings

  const forbidden = new Set([
    'understandingEvidence',
    'essentialUnderstandingDe',
    'essentialUnderstandingEn',
    'observablePerformanceDe',
    'observablePerformanceEn',
    'transferExpectationDe',
    'transferExpectationEn',
    'evidenceProfileContract',
    'evidenceProfileRecommendation',
  ])
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) findings.push(`${path}.${key}`)
    collectForbiddenTemporaryFields(child, `${path}.${key}`, findings)
  }
  return findings
}

const receipt = readJson(receiptPath)
assert(receipt.schemaVersion === 1, 'schemaVersion must be 1')
assert(receipt.authoringStatus === 'accepted_and_applied', 'authoringStatus must be accepted_and_applied')
assert(receipt.changeCount === 33, `expected changeCount 33, got ${receipt.changeCount}`)
assert(receipt.changes.length === receipt.changeCount, 'changeCount does not match changes.length')
assert(receipt.scope.approvedRevisionCount === receipt.changeCount, 'scope revision count does not match')
assert(receipt.applicationVerification.canonicalMatchCount === receipt.changeCount, 'verification count does not match')
assert(receipt.authorizationBoundaries.temporaryEvidencePromoted === false, 'temporary evidence must remain excluded')
assert(receipt.authorizationBoundaries.graphMutationAuthorized === false, 'receipt must not authorize graph mutation')
assert(receipt.authorizationBoundaries.deploymentAuthorized === false, 'receipt must not authorize deployment')
assert(receipt.postChangeReReview.reviewedAt === '2026-08-16', 'post-change review date must be 2026-08-16')
assert(receipt.postChangeReReview.notHashRefresh === true, 'post-change review must explicitly be a fresh content review')
assert(
  receipt.postChangeReReview.reviewMethod === 'fresh_content_review_after_approved_bilingual_revision',
  'unexpected post-change review method',
)

const forbiddenFields = collectForbiddenTemporaryFields(receipt)
assert(forbiddenFields.length === 0, `temporary evidence fields found: ${forbiddenFields.join(', ')}`)

const expectedCodes = Array.from({ length: 33 }, (_, index) => `R${String(index + 1).padStart(2, '0')}`)
const actualCodes = receipt.changes.map((change) => change.reviewCode)
assert(JSON.stringify(actualCodes) === JSON.stringify(expectedCodes), 'changes must be ordered exactly R01 through R33')
assert(new Set(receipt.changes.map((change) => change.goalId)).size === 33, 'goal IDs must be unique')
assert(receipt.changeSetDigest === digestReceipt(receipt), 'changeSetDigest does not match canonical JSON payload')

const canonicalPath = resolve(repositoryRoot, receipt.scope.canonicalFile)
const canonical = readJson(canonicalPath)
assert(canonical.landscapeId === receipt.scope.landscapeId, 'canonical landscapeId does not match receipt scope')
const canonicalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const memoryRequiredCodes = new Set(['R11', 'R12', 'R24'])
let memoryRequiredCount = 0
let noMemoryNeededCount = 0

for (const change of receipt.changes) {
  const goal = canonicalById.get(change.goalId)
  assert(goal, `${change.reviewCode}: canonical goal ${change.goalId} is missing`)
  assert(goal.title === change.titleDe, `${change.reviewCode}: German title changed since review`)
  assert(goal.titleEn === change.titleEn, `${change.reviewCode}: English title changed since review`)
  assert(goal.description === change.approvedDescriptionDe, `${change.reviewCode}: German approved description is not canonical`)
  assert(goal.descriptionEn === change.approvedDescriptionEn, `${change.reviewCode}: English approved description is not canonical`)
  assert(/^sha256:[a-f0-9]{64}$/.test(change.originalGoalFingerprint), `${change.reviewCode}: invalid original goal fingerprint`)
  assert(/^sha256:[a-f0-9]{64}$/.test(change.originalPageFingerprint), `${change.reviewCode}: invalid original page fingerprint`)
  assert(change.postChangeReview.reviewedAt === '2026-08-16', `${change.reviewCode}: unexpected post-change review date`)
  assert(
    change.postChangeReview.reviewedDescriptionDigest === reviewedDescriptionDigest(change),
    `${change.reviewCode}: reviewed-description digest does not bind the approved bilingual text`,
  )
  assert(
    change.postChangeReview.semanticKind.decision === 'curricularAtomic',
    `${change.reviewCode}: semantic kind is not curricularAtomic`,
  )
  assert(
    change.postChangeReview.semanticAtomicity.status === 'atomic' &&
      change.postChangeReview.semanticAtomicity.semanticAtomic === true,
    `${change.reviewCode}: semantic atomicity is not confirmed`,
  )
  assert(
    change.postChangeReview.semanticKind.reasonDe.includes(change.titleDe),
    `${change.reviewCode}: semantic-kind reason is not goal-specific`,
  )
  assert(
    change.postChangeReview.semanticAtomicity.reasonDe.includes(change.titleDe),
    `${change.reviewCode}: atomicity reason is not goal-specific`,
  )
  const memoryReview = change.postChangeReview.memoryCardSuitability
  if (memoryRequiredCodes.has(change.reviewCode)) {
    memoryRequiredCount += 1
    assert(memoryReview.status === 'memory_required', `${change.reviewCode}: memory_required review is missing`)
    assert(memoryReview.memoryUseful === true, `${change.reviewCode}: memoryUseful must be true`)
    assert(memoryReview.memoryGoalIds?.length > 0, `${change.reviewCode}: memory goal binding is missing`)
    assert(memoryReview.deckIds?.length > 0, `${change.reviewCode}: deck binding is missing`)
  } else {
    noMemoryNeededCount += 1
    assert(memoryReview.status === 'no_memory_needed', `${change.reviewCode}: expected no_memory_needed`)
    assert(memoryReview.memoryUseful === false, `${change.reviewCode}: memoryUseful must be false`)
    assert(memoryReview.memoryGoalIds === undefined, `${change.reviewCode}: no-memory review must not bind memory goals`)
    assert(memoryReview.deckIds === undefined, `${change.reviewCode}: no-memory review must not bind decks`)
  }
}

assert(memoryRequiredCount === 3, `expected 3 memory_required reviews, got ${memoryRequiredCount}`)
assert(noMemoryNeededCount === 30, `expected 30 no_memory_needed reviews, got ${noMemoryNeededCount}`)
assert(receipt.postChangeReReview.counts.semanticKindCurricularAtomic === 33, 'semantic-kind count mismatch')
assert(receipt.postChangeReReview.counts.semanticAtomicityAtomic === 33, 'atomicity count mismatch')
assert(receipt.postChangeReReview.counts.memoryRequired === memoryRequiredCount, 'memory_required count mismatch')
assert(receipt.postChangeReReview.counts.noMemoryNeeded === noMemoryNeededCount, 'no_memory_needed count mismatch')

const sourcePath = resolve(repositoryRoot, receipt.sourceReview.sourceFile)
const humanReportPath = resolve(repositoryRoot, receipt.sourceReview.humanReportFile)
if (existsSync(sourcePath)) {
  assert(sha256Bytes(sourcePath) === receipt.sourceReview.sourceFileSha256, 'reconciliation source byte digest does not match')
  const source = readJson(sourcePath)
  assert(source.reconciliationDigest === receipt.sourceReview.reconciliationDigest, 'reconciliation logical digest does not match')
  for (const key of [
    'campaignId',
    'roundId',
    'reconciliationId',
    'bundleFingerprint',
    'bookDigest',
    'reviewInputFingerprint',
  ]) {
    assert(source[key] === receipt.sourceReview[key], `sourceReview.${key} does not match reconciliation`)
  }

  const revisions = source.findings.filter((finding) => finding.reconciledDecision === 'revise')
  assert(revisions.length === 33, `source has ${revisions.length} revisions instead of 33`)
  revisions.forEach((finding, index) => {
    const change = receipt.changes[index]
    const expected = {
      reviewOrder: finding.order,
      goalId: finding.goalId,
      originalGoalFingerprint: finding.goalFingerprint,
      originalPageFingerprint: finding.pageFingerprint,
      titleDe: finding.currentTitleDe,
      titleEn: finding.currentTitleEn,
      reviewedCurrentDescriptionDe: finding.currentDescriptionDe,
      reviewedCurrentDescriptionEn: finding.currentDescriptionEn,
      approvedDescriptionDe: finding.proposedDescriptionDe,
      approvedDescriptionEn: finding.proposedDescriptionEn,
      rationaleDe: finding.rationale,
      sourceResultFile: finding.sourceResultFile,
    }
    for (const [key, value] of Object.entries(expected)) {
      assert(change[key] === value, `${change.reviewCode}: ${key} differs from reconciliation`)
    }
    if (finding.reconciliationNote !== undefined) {
      assert(change.reconciliationNoteDe === finding.reconciliationNote, `${change.reviewCode}: reconciliation note differs`)
    } else {
      assert(change.reconciliationNoteDe === undefined, `${change.reviewCode}: unexpected reconciliation note`)
    }
  })
} else if (requireSource) {
  fail(`required reconciliation source is missing: ${sourcePath}`)
}

if (existsSync(humanReportPath)) {
  assert(sha256Bytes(humanReportPath) === receipt.sourceReview.humanReportSha256, 'human report byte digest does not match')
} else if (requireSource) {
  fail(`required human report is missing: ${humanReportPath}`)
}

console.log(`Goal-description authoring change set: PASS (${receipt.changeCount}/33 canonical descriptions and digest match)`)
