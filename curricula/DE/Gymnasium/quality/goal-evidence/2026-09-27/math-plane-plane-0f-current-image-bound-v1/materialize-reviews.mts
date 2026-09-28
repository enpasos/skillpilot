import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = resolve(import.meta.dirname, '../../../../../../..')
const goalId = '0f4f9957-8afe-4aab-9dd8-c26c9aee2afd'
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/retained-first15-eleven.review.jsonl'
const sourceSha256 = '56b952c97aa13bdad6bb8c47921da263e496ccd7c3481b80296cfaa263abf21c'
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-plane-plane-0f-current-image-bound-v1'
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
const imageSha256 = '02716078e13c78735318f87001034b11daffe2d8bf0ad89de5cc04b8757562b7'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const source = readFileSync(resolve(root, sourcePath))
if (sha256(source) !== sourceSha256) throw new Error(`Historical 11-goal P review bytes changed: ${sourcePath}`)
const rows = source.toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line))
if (rows.length !== 11 || rows.filter((row) => row.goalId === goalId).length !== 1) {
  throw new Error('Unexpected 11-goal source scope or missing plane-plane record')
}
const original = rows.find((row) => row.goalId === goalId)
const retained = rows.filter((row) => row.goalId !== goalId)
const landscape = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8'))
const goal = landscape.goals.find((row) => row.id === goalId)
if (!goal || goal.title !== 'Lagebeziehung zweier Ebenen untersuchen (LK)') {
  throw new Error('Current plane-plane goal title is missing')
}
if (goal.description !== 'Die lernende Person kann die Lagebeziehung zweier Ebenen untersuchen, dazu das zugehörige lineare Gleichungssystem systematisch lösen und die Lösungsmenge geometrisch interpretieren.') {
  throw new Error('Current plane-plane goal description changed; new content review required')
}
const imageUrl = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`
if (goal.resourceLinks?.find((link) => link.role === 'primary')?.url !== imageUrl) {
  throw new Error('Current primary visualization URL changed')
}
const currentImageSha256 = sha256(readFileSync(resolve(root, 'app/public', imageUrl.slice(1))))
if (currentImageSha256 !== imageSha256) throw new Error('Current plane-plane PNG bytes changed; visual re-review required')
const reviewCriteriaFingerprint = `sha256:${sha256(readFileSync(resolve(root, criteriaPath)))}`
if (reviewCriteriaFingerprint !== original.reviewCriteriaFingerprint) throw new Error('P-v2 criteria changed')
const resourceDigests = { [imageUrl]: `sha256:${imageSha256}` }
const current = {
  ...original,
  reviewId: 'canonical-math-m7-plane-plane-title-imagegen-p-20260927-v1',
  goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic'),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(original.profile),
  reviewedAt: '2026-09-27T19:24:21.000Z',
  reviewer: 'OpenAI Codex plane-plane subject review; AI candidate only',
  reason: 'Die neue DE/EN-Titelfassung bezeichnet nur noch die durch HE Q2.3 LK belegte Lagebeziehung zweier Ebenen; die unveränderte Beschreibung integriert LGS-Lösen und geometrische Deutung. Die aktuelle PNG wurde visuell in Originalgröße und bei 360 px geprüft: E1 x+y+z=3 und E2 x-y+z=1 führen korrekt zu y=1, x+z=2 und X=(2,1,0)+t(-1,0,1). Das erste Fallbeispiel prüft die Schnittgerade, ein unabhängiger Transfer trennt identische von echt parallelen Ebenen. Keine Gerade-Ebene-Kompetenz und keine Humanfreigabe.',
}
if (current.status !== 'needs_human_review' || current.reviewAuthority !== 'ai_candidate'
  || current.evidenceLevel !== 'E1' || current.maximumClaimScope !== 'G1') {
  throw new Error('P-v2 AI candidate authority or claim scope changed unexpectedly')
}
const outputs = [
  [`${packagePath}/retained-first15-ten.review.jsonl`, `${retained.map((row) => JSON.stringify(row)).join('\n')}\n`],
  [`${packagePath}/positive-evidence.review.jsonl`, `${JSON.stringify(current)}\n`],
] as const
for (const [target, bytes] of outputs) {
  const absolute = resolve(root, target)
  if (process.argv[2] === '--write') {
    writeFileSync(absolute, bytes, { flag: 'wx' })
    console.log(`Wrote ${target}`)
  } else if (process.argv.length === 2) {
    if (readFileSync(absolute, 'utf8') !== bytes) throw new Error(`Stale materialized P review: ${target}`)
    console.log(`Verified ${target}`)
  } else {
    throw new Error('Usage: tsx materialize-reviews.mts [--write]')
  }
}
