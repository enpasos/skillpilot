// Technical verification only; Apache-2.0 under LICENSING.md.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
  type PositiveGoalEvidenceReviewRecord,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

const root = '/home/enpasos/projects/skillpilot'
const out = dirname(fileURLToPath(import.meta.url))
const read = (name: string) => JSON.parse(readFileSync(join(out, name), 'utf8'))
const digest = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const landscape = read('candidate.landscape.INERT.json')
const candidates = read('positive.candidates.INERT.json')
const criteriaFingerprint = digest(readFileSync(join(out, 'candidate-positive-criteria.INERT.json')))
const records: PositiveGoalEvidenceReviewRecord[] = []
const bindings: Array<Record<string, unknown>> = []
for (const candidate of candidates.goals) {
  const goal = landscape.goals.find((g: { id: string }) => g.id === candidate.goalId)
  if (!goal) throw new Error(`Missing candidate goal ${candidate.goalId}`)
  const resourceDigests: Record<string, string> = {}
  for (const link of goal.resourceLinks ?? []) {
    if (link.type === 'goal-visualization') {
      resourceDigests[link.url] = digest(readFileSync(join(root, 'app/public', link.url)))
    }
  }
  const record: PositiveGoalEvidenceReviewRecord = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
    schemaVersion: 2,
    reviewId: candidates.reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteriaFingerprint,
    landscapeId: landscape.landscapeId,
    goalId: goal.id,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, resourceDigests, 'curricularAtomic'),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(candidate.profile),
    status: 'needs_human_review',
    reviewAuthority: 'ai_candidate',
    reviewedAt: candidates.reviewedAt,
    reviewer: candidates.reviewer,
    reason: candidate.reason,
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    reviewRunIds: [],
    dissent: [],
    profile: candidate.profile,
  }
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic')
  if (errors.length) throw new Error(errors.join('\n'))
  records.push(record)
  bindings.push({ goalId: goal.id, effectiveSemanticKind: 'curricularAtomic', resourceDigests,
    goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint,
    profileFingerprint: record.profileFingerprint, semanticErrors: errors })
}
writeFileSync(join(out, 'positive.profiles.INERT.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n')

const original = read('history/original-543b.goal.json')
const originalP = JSON.parse(readFileSync(join(out, 'history/original-543b.positive.record.jsonl'), 'utf8'))
const reused = read('whole-goal.candidates.INERT.json').unchangedReusedWholeGoals
const current = read('history/canonical.original.bytes.json')
const originalPBinding = {
  goalFingerprintMatchesWholeCurrentGoal: originalP.goalFingerprint === fingerprintGoalForPositiveEvidence(original, 'curricularAtomic'),
  profileFingerprintMatchesRetainedWholeProfile: originalP.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(originalP.profile),
}
if (Object.values(originalPBinding).some(v => !v)) throw new Error('Historical original P binding mismatch')
for (const g of reused) {
  const before = current.goals.find((x: { id: string }) => x.id === g.id)
  if (JSON.stringify(before) !== JSON.stringify(g)) throw new Error(`Reuse changed goal ${g.id}`)
}
const ids = new Set(landscape.goals.map((g: { id: string }) => g.id))
if (ids.size !== landscape.goals.length) throw new Error('Duplicate goal identity')
const graphErrors: string[] = []
for (const field of ['requires', 'contains']) {
  const edges = new Map<string, string[]>(landscape.goals.map((g: any) => [g.id, g[field] ?? []]))
  const active = new Set<string>(), done = new Set<string>()
  const visit = (id: string) => {
    if (active.has(id)) throw new Error(`${field} cycle through ${id}`)
    if (done.has(id)) return
    active.add(id)
    for (const edge of edges.get(id) ?? []) {
      if (ids.has(edge)) visit(edge)
      else graphErrors.push(`${id}: external or missing ${field} reference ${edge}`)
    }
    active.delete(id); done.add(id)
  }
  for (const id of edges.keys()) visit(id)
}
const manifest = read('author-source-manifest.INERT.json')
const sourceStillExact = manifest.canonicalSource.sha256 === digest(readFileSync(join(root, manifest.canonicalSource.path)))
const historyStillExact = manifest.canonicalSource.sha256 === digest(readFileSync(join(out, 'history/canonical.original.bytes.json')))
const changedIds = landscape.goals.filter((g: any) => JSON.stringify(g) !== JSON.stringify(current.goals.find((x: any) => x.id === g.id))).map((g: any) => g.id)
if (JSON.stringify(changedIds) !== JSON.stringify(['543bf91f-f6c6-5b1b-ba9e-43de321d8c7f'])) throw new Error('Unexpected candidate-landscape change')
const report = {
  technicalOnly: true, independentContentReviewOrAcceptanceClaim: false,
  genericTool: 'app/scripts/positiveGoalEvidenceProfileModel.ts',
  criteriaFingerprint, candidateBindings: bindings, originalPBinding,
  unchangedReusedGoalIds: reused.map((g: any) => g.id), changedGoalIds: changedIds,
  newGoalIds: [], graphCycles: [], graphReferenceNotes: [...new Set(graphErrors)].sort(),
  sourceCanonicalStillByteExact: sourceStillExact, retainedCanonicalByteExact: historyStillExact,
}
writeFileSync(join(out, 'fingerprint-and-semantic-check.actual.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ candidateProfiles: records.length, changedGoalIds: changedIds, newGoalIds: [],
  fingerprints: 'pass', historicalPBinding: 'pass', dagCycles: 0, sourceCanonicalStillByteExact: sourceStillExact }))
