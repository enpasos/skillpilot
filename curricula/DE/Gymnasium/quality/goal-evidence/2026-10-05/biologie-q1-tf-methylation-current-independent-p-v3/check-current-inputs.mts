import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const root = process.cwd()
const directory = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-p-v3')
const original = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2')
const candidate = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-source-consumer-candidate-v3')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const readRows = (path: string) => readFileSync(path, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const sha = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const config = read(resolve(directory, 'positive.materialization-only.config.json'))
const candidateSet = read(resolve(directory, 'positive-evidence.reviewed-candidates.json'))
const originalRows = readRows(resolve(original, 'positive.validation-only.review.jsonl'))
const currentRows = readRows(resolve(directory, 'positive.materialization-only.review.jsonl'))
const sameSourceOnlyRows = await buildPositiveGoalEvidenceCandidateRecords({
  config: { ...config, reviewedResourceTypes: [] },
  candidateSet,
})
const delta = originalRows.map((old, index) => {
  const current = currentRows[index]
  const sourceOnly = sameSourceOnlyRows[index]
  if (old.goalId !== current.goalId || old.goalId !== sourceOnly.goalId) throw new Error('Goal order differs')
  if (JSON.stringify(old.profile) !== JSON.stringify(current.profile)) throw new Error(`${old.goalId}: inner profile changed`)
  if (old.profileFingerprint !== current.profileFingerprint || old.goalFingerprint !== current.goalFingerprint) {
    throw new Error(`${old.goalId}: goal/profile fingerprint changed`)
  }
  if (old.reviewInputFingerprint !== sourceOnly.reviewInputFingerprint) throw new Error(`${old.goalId}: source-only fingerprint changed`)
  if (old.reviewInputFingerprint === current.reviewInputFingerprint) throw new Error(`${old.goalId}: explicit image witness not bound`)
  if (current.status !== 'needs_human_review' || current.reviewAuthority !== 'ai_candidate') throw new Error('Authority incorrectly raised')
  return {
    goalId: old.goalId,
    innerProfileExactEquality: true,
    goalFingerprintUnchanged: current.goalFingerprint,
    profileFingerprintUnchanged: current.profileFingerprint,
    previousAuthorImageUnboundReviewInputFingerprint: old.reviewInputFingerprint,
    currentSourceOnlyControlReviewInputFingerprint: sourceOnly.reviewInputFingerprint,
    currentExplicitImageBoundReviewInputFingerprint: current.reviewInputFingerprint,
    sourceOnlyBindingDelta: false,
    reasonForCurrentReviewInputDelta: 'explicit existing PNG witness added; no Goal/Profile/Case/Source-sidecar payload change',
    currentStatus: current.status,
    currentAuthority: current.reviewAuthority,
    applicationCaseIdsUnchanged: current.profile.applicationCaseBriefs.map(({ id }: { id: string }) => id),
  }
})
const receipt = {
  schemaVersion: 1,
  recordedAt: new Date().toISOString(),
  independentProfileAuthor: false,
  originalCandidateDigest: sha(resolve(original, 'positive-evidence.candidates.json')),
  currentFrozenCandidateDigest: sha(resolve(candidate, 'positive-evidence.candidates.json')),
  originalAndCurrentFrozenCandidateBytesExact: sha(resolve(original, 'positive-evidence.candidates.json')) === sha(resolve(candidate, 'positive-evidence.candidates.json')),
  nativeCurrentBindings: delta,
  actualLearnerObservations: 0,
  humanApproval: false,
  activeWrites: 0,
  newStrictClosures: 0,
}
writeFileSync(resolve(directory, 'exact-profile-carry-forward-and-current-bindings.actual.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ profiles: delta.length, exactInnerProfileEquality: true, sourceOnlyBindingDelta: false, explicitImageBindingAdded: true, humanApproval: false }))
