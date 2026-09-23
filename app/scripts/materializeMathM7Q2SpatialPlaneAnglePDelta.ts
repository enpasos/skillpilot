import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const evidenceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const source = `${evidenceRoot}/m7-q2-spatial-relations-20-20260923-v1`
const output = `${evidenceRoot}/m7-q2-spatial-plane-angle-current-p-20260923-v1`
const planeAngleId = 'bda6a659-9640-53a5-8be0-24705ab623ef'
const reviewedAt = '2026-09-23T01:55:34Z'
const imageSha = 'sha256:b18fe49e4af4129c45e5ed9adf33745e0c8e2fe53a9b91553caeb6a2515cdda4'
const sourceDigests = {
  config: 'sha256:dfb0d9740c0305ccb007be806d0dce14140b841c88753d8b33fff62bc0551e5e',
  review: 'sha256:5c383ce0e99654ac30c075091341b1421f8c1eba1143f0e9497493e37408f94a',
  candidates: 'sha256:7bd8e271ec8bb9816216d5a4066346e2f1a32c81801121228cf522cb08a21adb',
} as const

const sha256 = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const readOptional = async (path: string): Promise<Buffer | null> => {
  try { return await readFile(path) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const verifyOrWrite = async (path: string, expected: Buffer, write: boolean) => {
  const absolute = join(root, path)
  const current = await readOptional(absolute)
  if (current) {
    assert(current.equals(expected), `${path}: generated P artifact differs from the checked source/current PNG`)
  } else {
    assert(write, `${path}: generated P artifact is missing`)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, expected, { flag: 'wx' })
  }
}

const main = async () => {
  const arg = process.argv.slice(2)
  assert(arg.length === 1 && ['--write', '--check'].includes(arg[0]), 'Usage: tsx app/scripts/materializeMathM7Q2SpatialPlaneAnglePDelta.ts --write|--check')
  const write = arg[0] === '--write'
  const [configBytes, reviewBytes, candidateBytes] = await Promise.all([
    readFile(join(root, source, 'positive-evidence.config.json')),
    readFile(join(root, source, 'positive-evidence.review.jsonl')),
    readFile(join(root, source, 'positive-evidence.candidates.json')),
  ])
  assert(sha256(configBytes) === sourceDigests.config, 'Original Q2 P config changed')
  assert(sha256(reviewBytes) === sourceDigests.review, 'Original Q2 P review changed')
  assert(sha256(candidateBytes) === sourceDigests.candidates, 'Original Q2 P candidates changed')
  const original = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const originalLines = reviewBytes.toString('utf8').trimEnd().split('\n')
  const originalRecords = originalLines.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
  const candidates = JSON.parse(candidateBytes.toString('utf8')) as {
    goals: Array<{
      goalId: string
      reason: string
      evidenceLevel: 'E1'
      maximumClaimScope: 'G1'
      dissent: string[]
      profile: PositiveGoalEvidenceReviewRecord['profile']
    }>
  }
  assert(original.scope.goalIds.length === 14 && originalRecords.length === 14 && candidates.goals.length === 14, 'Original Q2 P scope is not fourteen')
  assert(original.scope.goalIds.filter((id) => id === planeAngleId).length === 1, 'Plane-angle goal is not unique in original Q2 P scope')
  assert(original.scope.goalIds.every((id, index) => originalRecords[index]?.goalId === id && candidates.goals[index]?.goalId === id), 'Original Q2 P source order differs')

  const retainedIds = original.scope.goalIds.filter((id) => id !== planeAngleId)
  const retainedLines = originalLines.filter((line) => JSON.parse(line).goalId !== planeAngleId)
  assert(retainedIds.length === 13 && retainedLines.length === 13, 'Expected thirteen unchanged P records')
  const retainedConfig: PositiveGoalEvidenceReviewConfig = {
    ...original,
    reviewPath: `${output}/retained-thirteen.review.jsonl`,
    scope: { label: 'Dreizehn unveränderte Q2-Raumgeometrie-P-v2-Kandidaten nach Ebenenwinkel-Bildwechsel', goalIds: retainedIds },
  }

  const canonical = await readJson<{
    goals: Array<{ id: string; title: string; description: string; resourceLinks?: Array<{ type: string; role?: string; url: string }> }>
  }>(original.landscapePath)
  const goal = canonical.goals.find(({ id }) => id === planeAngleId)
  const imageUrl = `/assets/goal-visualizations/mathematik/${planeAngleId}/${planeAngleId}.png`
  assert(goal?.title === 'Winkel zwischen zwei Ebenen berechnen', 'Current plane-angle goal title changed')
  assert(goal.description.includes('mithilfe geeigneter Normalenvektoren') && goal.description.includes('geometrisch deuten'), 'Current plane-angle goal description changed')
  assert(goal.resourceLinks?.filter(({ type, role }) => type === 'goal-visualization' && role === 'primary').length === 1, 'Plane-angle goal must have exactly one primary image')
  assert(goal.resourceLinks?.some(({ type, role, url }) => type === 'goal-visualization' && role === 'primary' && url === imageUrl), 'Current plane-angle image URL changed')
  const qa = await readJson<{ records: Array<{
    goalId: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string;
    publicAssetPath: string; canonicalAssetPath: string; imageUrl: string
  }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  const qaRecord = qa.records.find(({ goalId }) => goalId === planeAngleId)
  assert(qaRecord?.imageUrl === imageUrl && qaRecord.assetSha256 === imageSha && qaRecord.aiApproved === 'yes' && qaRecord.aiApprovedAssetSha256 === imageSha, 'Current plane-angle PNG lacks exact current AI-V approval')
  const [publicImage, canonicalImage, backendImage] = await Promise.all([
    readFile(join(root, qaRecord.publicAssetPath)),
    readFile(join(root, qaRecord.canonicalAssetPath)),
    readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
  ])
  assert([publicImage, canonicalImage, backendImage].every((bytes) => sha256(bytes) === imageSha), 'Served/canonical plane-angle PNG bytes differ')

  const old = originalRecords.find(({ goalId }) => goalId === planeAngleId)
  const oldCandidate = candidates.goals.find(({ goalId }) => goalId === planeAngleId)
  assert(old?.status === 'needs_human_review' && old.reviewAuthority === 'ai_candidate' && oldCandidate, 'Original plane-angle P candidate is not an AI candidate')
  assert(old.profile.applicationCaseBriefs.length === 2 && old.profile.applicationCaseBriefs.some(({ id }) => id === 'coordinate-planes') && old.profile.applicationCaseBriefs.some(({ id }) => id === 'parametric-sign-reversal'), 'Plane-angle profile transfer cases changed; re-adjudicate')
  const currentConfig: PositiveGoalEvidenceReviewConfig = {
    ...original,
    reviewId: 'canonical-math-positive-understanding-evidence-m7-q2-plane-angle-current-png-20260923-v1',
    reviewPath: `${output}/plane-angle-current-png.review.jsonl`,
    scope: { label: 'Aktuelles PNG: Ebenenschnittwinkel Q2, nur maschineller P-v2-Kandidat', goalIds: [planeAngleId] },
  }
  const currentCandidate = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: currentConfig.reviewId,
    reviewedAt,
    reviewer: 'Codex independent current-PNG P-v2 content review; exact model identifier unavailable',
    goals: [{
      goalId: planeAngleId,
      reason: `Das neue PNG ${imageSha} wurde tatsächlich betrachtet: n_E=(1,0,0), n_F=(1,1,0), Schnittgerade z-Achse und φ=45° sind geometrisch und rechnerisch konsistent; die Formel mit Betrag liefert den kleineren nicht orientierten Ebenenschnittwinkel. Die beiden bestehenden, fachlich erneut geprüften Transferfälle bleiben valide: E:x=0 und F:x+√3y=0 ergeben 60°; aus der Parameterform von F folgt z−x−y=2, mit E:x+y=1 ergibt sich φ≈35,26° unabhängig von der Normalenvorzeichenwahl. Die Visualisierung ist Orientierung, keine Leistungsprobe; E1/G1 ist ein KI-Kandidat ohne menschliche Freigabe oder neue Quellenfreigabe.`,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(oldCandidate.profile),
    }],
  }
  const [currentRecord] = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: currentCandidate })
  assert(currentRecord.reviewInputFingerprint !== old.reviewInputFingerprint, 'Current PNG must change the P review-input binding')
  assert(currentRecord.profileFingerprint === old.profileFingerprint, 'Re-reviewed transferable profile content changed unexpectedly')

  const artifacts = [
    { path: `${output}/retained-thirteen.config.json`, bytes: jsonBytes(retainedConfig) },
    { path: `${output}/retained-thirteen.review.jsonl`, bytes: Buffer.from(`${retainedLines.join('\n')}\n`) },
    { path: `${output}/plane-angle-current-png.config.json`, bytes: jsonBytes(currentConfig) },
    { path: `${output}/plane-angle-current-png.candidates.json`, bytes: jsonBytes(currentCandidate) },
    { path: `${output}/plane-angle-current-png.review.jsonl`, bytes: Buffer.from(`${JSON.stringify(currentRecord)}\n`) },
    { path: `${output}/binding-review.json`, bytes: jsonBytes({
      schemaVersion: 1,
      reviewedAt,
      reviewer: currentCandidate.reviewer,
      authority: 'ai_candidate',
      humanApproved: false,
      goalId: planeAngleId,
      imageUrl,
      imageSha256: imageSha,
      actualImageViewed: true,
      independentVisualizationReviewPath: `curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-plane-angle-correction-20260923-v1/${planeAngleId}/independent-review.json`,
      sourceConfigSha256: sourceDigests.config,
      sourceReviewSha256: sourceDigests.review,
      sourceCandidatesSha256: sourceDigests.candidates,
      oldReviewInputFingerprint: old.reviewInputFingerprint,
      currentReviewInputFingerprint: currentRecord.reviewInputFingerprint,
      unchangedProfileFingerprint: currentRecord.profileFingerprint,
      decision: 'current_p_v2_ai_candidate',
      limit: 'No human profile approval, no new source permission, no learning-performance evidence.',
    }) },
  ]
  for (const artifact of artifacts) await verifyOrWrite(artifact.path, artifact.bytes, write)
  for (const path of [`${output}/retained-thirteen.config.json`, `${output}/plane-angle-current-png.config.json`]) {
    const review = reviewPositiveGoalEvidenceConfig(path)
    assert(review.errors.length === 0, `${path}: ${review.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} 13 unchanged and one current-PNG P-v2 AI candidate; no human approval.`)
}

void main()
