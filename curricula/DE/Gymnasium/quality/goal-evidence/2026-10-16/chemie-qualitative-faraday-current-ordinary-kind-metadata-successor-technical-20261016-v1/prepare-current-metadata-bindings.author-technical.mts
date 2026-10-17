// SPDX-License-Identifier: Apache-2.0
// Current technical candidates only; actual current independent reviews pending.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'

const R = '/home/enpasos/projects/skillpilot'
const L = resolve(R, 'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1')
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O = E + '/chemie-qualitative-faraday-current-ordinary-kind-metadata-successor-technical-20261016-v1'
const A = E + '/chemie-native9-current437-fresh-independent-a-20261016-v1'
const gId = '0e3f849b-133d-57da-882c-0d67c3eb05b8'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const kindsPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const readRows = (p: string) => readFileSync(p, 'utf8').trim().split(/\r?\n/).map((line) => JSON.parse(line))
const save = (name: string, data: unknown, jsonl = false) => writeFileSync(resolve(R, O, name),
  jsonl ? (data as unknown[]).map((row) => JSON.stringify(row)).join('\n') + '\n' : JSON.stringify(data, null, 2) + '\n', { flag: 'wx' })
const before = read(resolve(R, O, 'WHOLEGOAL.0e3.before-actual-L.json'))
const after = read(resolve(R, O, 'WHOLEGOAL.0e3.after-current-L2.json'))
assert.deepEqual(Object.keys(before).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])), ['nodeKind'])
const { fingerprintSemanticKindSourceGoal } = await import(L + '/app/scripts/goalBookModel.ts')
const {
  fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics,
} = await import(L + '/app/scripts/positiveGoalEvidenceProfileModel.ts')
const { buildGoalDescriptionCanonicalContext } = await import(L + '/app/scripts/validateGoalDescriptionReviewCampaign.ts')

function stockFp(file: string, endMarker: string) {
  const p = resolve(L, 'app/scripts', file)
  const source = readFileSync(p, 'utf8'), start = source.indexOf('function normalizeText('), end = source.indexOf(endMarker, start)
  assert.ok(start >= 0 && end > start)
  const fragment = source.slice(start, end)
  const js = ts.transpileModule(fragment, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  return { path: p, sha256: sha(p), fragmentSha256: 'sha256:' + createHash('sha256').update(fragment).digest('hex'),
    fn: new Function('createHash', js + ';return fingerprintGoal;')(createHash) }
}
const aFp = stockFp('semanticAtomicityReview.ts', 'function isLeaf(')
const mFp = stockFp('memoryCardReview.ts', 'function fingerprintMemoryCard(')
const oldKinds = read(resolve(L, kindsPath)), nextKinds = structuredClone(oldKinds)
const kind = nextKinds.decisions.find((row: any) => row.goalId === gId)
assert.equal(kind.semanticKind, 'curricularAtomic')
assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(before))
kind.sourceFingerprint = fingerprintSemanticKindSourceGoal(after)
assert.equal(oldKinds.decisions.filter((row: any, index: number) => JSON.stringify(row) !== JSON.stringify(nextKinds.decisions[index])).length, 1)
save('SEMANTIC639.only-current-ordinary-metadata-source-binding.json', nextKinds)

const oldA = readRows(resolve(R, A, 'A9.current-independent.review.jsonl')).find((row: any) => row.goalId === gId)
const oldM = readRows(resolve(R, A, 'M9.current-independent.review.jsonl')).find((row: any) => row.goalId === gId)
const oldP = readRows(resolve(R, A, 'P9.current-independent.review.jsonl')).find((row: any) => row.goalId === gId)
const now = new Date().toISOString(), reviewId = 'chemie-qualitative-faraday-ordinary-metadata-technical-author-20261016-v1'
const reviewer = '/root/chemie_memory_course_filter_qa_fix_20261016 (technical AUTHOR, no current independent followup claimed)'
const reason = 'AUTHOR technical current-metadata candidate only: remove the erroneous runtime tutor label from a source-qualified ordinary learning goal. Title, bilingual description, prerequisites, examples, materials, image, selected cards and complete P profile are unchanged. Actual current independent A/B metadata/native followups remain pending; this serialization does not impersonate those reviewers.'
assert.equal(oldA.fingerprint, aFp.fn(before, oldA.ruleVersion))
assert.equal(oldM.fingerprint, mFp.fn(before, oldM.ruleVersion))
const candidateA = { ...oldA, reviewId, fingerprint: aFp.fn(after, oldA.ruleVersion), status: 'needs_developer_review', semanticAtomic: null, reviewedAt: now, reviewer, reason }
const candidateM = { ...oldM, reviewId, fingerprint: mFp.fn(after, oldM.ruleVersion), status: 'needs_developer_review', memoryUseful: null, reviewedAt: now, reviewer, reason }
const resources: Record<string, string> = {}
for (const link of after.resourceLinks ?? []) if (link.type === 'goal-visualization') {
  resources[link.url] = sha(resolve(L, 'app/public', link.url.slice(1)))
}
assert.equal(oldP.goalFingerprint, fingerprintGoalForPositiveEvidence(before, 'curricularAtomic'))
assert.equal(oldP.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(before, oldP.reviewCriteriaFingerprint, resources, 'curricularAtomic'))
const candidateP = { ...oldP, reviewId,
  goalFingerprint: fingerprintGoalForPositiveEvidence(after, 'curricularAtomic'),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(after, oldP.reviewCriteriaFingerprint, resources, 'curricularAtomic'),
  status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: now, reviewer, reason,
  evidenceLevel: 'E0', maximumClaimScope: 'G0', reviewRunIds: [],
  dissent: ['AUTHOR technical current-metadata page input only. Actual independent current A/B followups pending; historical independent science remains unchanged.'],
}
assert.deepEqual(candidateP.profile, oldP.profile)
assert.equal(candidateP.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(oldP.profile))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(candidateP, after, resources, 'curricularAtomic'), [])
save('A1.current-metadata.author-technical-candidate.review.jsonl', [candidateA], true)
save('M1.current-metadata.author-technical-candidate.review.jsonl', [candidateM], true)
save('P1.current-metadata.author-technical-candidate.review.jsonl', [candidateP], true)
save('HISTORY.actual-original-A1-M1-P1-whole-science-records.json', { A: oldA, M: oldM, P: oldP })
const common = { schemaVersion: 1, reviewId, landscapeId: oldA.landscapeId, landscapePath,
  scope: { label: 'One current ordinary metadata AUTHOR candidate; actual independent review pending', leafGoalIds: [gId] } }
save('A1.current-metadata.author-technical-candidate.config.json', { ...common, ruleVersion: 'semantic-atomicity-v1', reviewPath: O + '/A1.current-metadata.author-technical-candidate.review.jsonl' })
save('M1.current-metadata.author-technical-candidate.config.json', { ...common, ruleVersion: 'memory-card-review-v1', reviewPath: O + '/M1.current-metadata.author-technical-candidate.review.jsonl' })
const pConfig = read(resolve(R, A, 'P9.current-independent.config.json'))
save('P1.current-metadata.author-technical-candidate.config.json', { ...pConfig, reviewId,
  semanticKindLedgerPath: O + '/SEMANTIC639.only-current-ordinary-metadata-source-binding.json',
  reviewPath: O + '/P1.current-metadata.author-technical-candidate.review.jsonl',
  scope: { label: 'Only current metadata, whole P profile retained, AUTHOR candidate E0/G0', goalIds: [gId] } })
const beforeContext = buildGoalDescriptionCanonicalContext(before), afterContext = buildGoalDescriptionCanonicalContext(after)
assert.deepEqual(Object.keys(beforeContext).filter((key) => JSON.stringify(beforeContext[key]) !== JSON.stringify(afterContext[key])), ['nodeKind'])
save('BINDINGS.actual-one-goal-stock-fingerprint-and-canonical-context-delta.AUTHOR-not-review.json', {
  role: 'Actual unmodified stock fingerprints for technical AUTHOR candidates; current scientific followups pending',
  beforeCanonicalSha256: 'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9', afterCanonicalSha256: sha(resolve(L, landscapePath)),
  goalId: gId,
  semanticKindSourceFingerprint: { before: fingerprintSemanticKindSourceGoal(before), after: fingerprintSemanticKindSourceGoal(after) },
  atomicityFingerprint: { before: oldA.fingerprint, after: candidateA.fingerprint },
  memoryFingerprint: { before: oldM.fingerprint, after: candidateM.fingerprint },
  positiveGoalFingerprint: { before: oldP.goalFingerprint, after: candidateP.goalFingerprint },
  positiveReviewInputFingerprint: { before: oldP.reviewInputFingerprint, after: candidateP.reviewInputFingerprint },
  positiveProfileFingerprint: { before: oldP.profileFingerprint, after: candidateP.profileFingerprint, unchanged: true },
  canonicalContext: { before: beforeContext, after: afterContext, onlyChangedField: 'nodeKind' },
  needsCurrentNativeContextFollowup: true,
  unchanged: ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains', 'examples', 'resourceLinks', 'extendedData', 'full P profile', 'actual image bytes', 'all card content/selections'],
  stockFingerprintSources: [aFp, mFp].map(({ fn, ...metadata }) => metadata),
  resourceDigestsUnchanged: resources,
  newIndependentApprovalClaim: false, HumanApproval: false, HumanTrial: false, M7Claim: false,
})
console.log(JSON.stringify({ goalId: gId, canonical: sha(resolve(L, landscapePath)),
  sourceKind: kind.sourceFingerprint, a: candidateA.fingerprint, m: candidateM.fingerprint,
  p: candidateP.goalFingerprint, pInput: candidateP.reviewInputFingerprint,
  pProfile: candidateP.profileFingerprint, nativeContextMustBeRebound: true }))
