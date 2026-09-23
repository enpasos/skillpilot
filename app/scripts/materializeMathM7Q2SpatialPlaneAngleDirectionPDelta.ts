import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const evidenceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const source = `${evidenceRoot}/m7-q2-spatial-plane-angle-current-p-20260923-v1`
const output = `${evidenceRoot}/m7-q2-spatial-plane-angle-direction-p-20260923-v2`
const goalId = 'bda6a659-9640-53a5-8be0-24705ab623ef'
const imageUrl = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`
const independentImageReview = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-plane-angle-direction-candidate-20260923-v2/independent-image-review-20260923-v2.md'
const reviewedCandidateImage = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-plane-angle-direction-candidate-20260923-v2/plane-angle-direction-candidate.png'
const reviewedCandidateSha = 'sha256:01c320fb4ea450c66d4c14104d14093fd288112e4f97cade2554109ddbc64164'
const sourceDigests = {
  config: 'sha256:69e764d6defda0528b272fbf9787f9847716ef77e583671ec59f21af9cecf38e',
  candidates: 'sha256:82ba9329f145111462c0042de410e359727e463989e624cc28b3a168e9dffb54',
  review: 'sha256:9bfeb3c55559eb689cfc542e5c745168845d1a540f7889ab86809299d81816fe',
} as const

const sha256 = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
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
    assert(current.equals(expected), `${path}: generated P artifact differs from the current reviewed direction PNG`)
  } else {
    assert(write, `${path}: generated P artifact is missing`)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, expected, { flag: 'wx' })
  }
}

const main = async () => {
  const arg = process.argv.slice(2)
  assert(arg.length === 1 && ['--write', '--check'].includes(arg[0]), 'Usage: tsx app/scripts/materializeMathM7Q2SpatialPlaneAngleDirectionPDelta.ts --write|--check')
  const write = arg[0] === '--write'
  const [configBytes, candidateBytes, reviewBytes, independentReviewText, candidatePng] = await Promise.all([
    readFile(join(root, source, 'plane-angle-current-png.config.json')),
    readFile(join(root, source, 'plane-angle-current-png.candidates.json')),
    readFile(join(root, source, 'plane-angle-current-png.review.jsonl')),
    readFile(join(root, independentImageReview), 'utf8'),
    readFile(join(root, reviewedCandidateImage)),
  ])
  assert(sha256(configBytes) === sourceDigests.config, 'Prior Q2 P config changed')
  assert(sha256(candidateBytes) === sourceDigests.candidates, 'Prior Q2 P candidates changed')
  assert(sha256(reviewBytes) === sourceDigests.review, 'Prior Q2 P review changed')
  assert(sha256(candidatePng) === reviewedCandidateSha, 'Independently reviewed direction PNG changed')
  assert(independentReviewText.includes(reviewedCandidateSha.slice(7)) && independentReviewText.includes('parallel zur z-Achse'), 'Independent direction-image review does not match the PNG or its limited geometric claim')

  const previousConfig = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const previousCandidate = JSON.parse(candidateBytes.toString('utf8')) as {
    goals: Array<{
      goalId: string
      profile: PositiveGoalEvidenceReviewRecord['profile']
    }>
  }
  const previousRecord = JSON.parse(reviewBytes.toString('utf8')) as PositiveGoalEvidenceReviewRecord
  assert(previousConfig.scope.goalIds.length === 1 && previousConfig.scope.goalIds[0] === goalId, 'Prior Q2 P scope changed')
  assert(previousRecord.goalId === goalId && previousRecord.reviewAuthority === 'ai_candidate' && previousRecord.status === 'needs_human_review', 'Prior Q2 P record changed authority or goal')
  const profile = previousCandidate.goals[0]?.profile
  assert(previousCandidate.goals.length === 1 && previousCandidate.goals[0].goalId === goalId && profile, 'Prior Q2 P profile changed')
  assert(profile.applicationCaseBriefs.length === 2 && profile.applicationCaseBriefs[0].id === 'coordinate-planes' && profile.applicationCaseBriefs[1].id === 'parametric-sign-reversal', 'Transfer case set changed; independent reassessment required')

  const canonical = await readJson<{
    goals: Array<{ id: string; title: string; description: string; sourceRef?: string; resourceLinks?: Array<{ type: string; role?: string; url: string }> }>
  }>(previousConfig.landscapePath)
  const goal = canonical.goals.find(({ id }) => id === goalId)
  assert(goal?.title === 'Winkel zwischen zwei Ebenen berechnen' && goal.description.includes('mithilfe geeigneter Normalenvektoren') && goal.description.includes('geometrisch deuten'), 'Current plane-angle goal changed; re-review its content')
  assert(goal.sourceRef?.includes('Q2.3, S. 42, Spiegelstrich 8'), 'Current source binding changed; re-review it')
  assert(goal.resourceLinks?.filter(({ type, role }) => type === 'goal-visualization' && role === 'primary').length === 1, 'Plane-angle goal needs exactly one primary image')
  assert(goal.resourceLinks?.some(({ type, role, url }) => type === 'goal-visualization' && role === 'primary' && url === imageUrl), 'Current plane-angle image URL changed')

  const qa = await readJson<{ records: Array<{
    goalId: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string;
    publicAssetPath: string; canonicalAssetPath: string; imageUrl: string
  }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  const qaRecord = qa.records.find(({ goalId: id }) => id === goalId)
  assert(qaRecord?.imageUrl === imageUrl && qaRecord.assetSha256 === reviewedCandidateSha && qaRecord.aiApproved === 'yes' && qaRecord.aiApprovedAssetSha256 === reviewedCandidateSha, 'Current QA has not approved the exact independently reviewed direction PNG')
  const [publicImage, canonicalImage, backendImage] = await Promise.all([
    readFile(join(root, qaRecord.publicAssetPath)),
    readFile(join(root, qaRecord.canonicalAssetPath)),
    readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
  ])
  assert([publicImage, canonicalImage, backendImage].every((bytes) => sha256(bytes) === reviewedCandidateSha), 'Served/canonical direction PNG bytes differ from reviewed candidate')

  const config: PositiveGoalEvidenceReviewConfig = {
    ...previousConfig,
    reviewId: 'canonical-math-positive-understanding-evidence-m7-q2-plane-angle-direction-20260923-v2',
    reviewPath: `${output}/plane-angle-direction.review.jsonl`,
    scope: { label: 'Korrigiertes Richtungs-PNG: Ebenenschnittwinkel Q2, maschineller P-v2-Kandidat', goalIds: [goalId] },
  }
  const candidatePath = `${output}/plane-angle-direction.candidates.json`
  const existingCandidate = await readOptional(join(root, candidatePath))
  const reviewedAt = existingCandidate
    ? (JSON.parse(existingCandidate.toString('utf8')) as { reviewedAt: string }).reviewedAt
    : new Date().toISOString()
  const reviewer = 'Codex current-direction-PNG P-v2 content review; exact model identifier unavailable'
  const candidate = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: config.reviewId,
    reviewedAt,
    reviewer,
    goals: [{
      goalId,
      reason: `Das korrigierte PNG ${reviewedCandidateSha} wurde im Original betrachtet: n_E=(1,0,0) weist in positive x-Richtung, n_F=(1,1,0) diagonal in der xy-Ebene; die eingezeichneten Pfeillängen sind schematisch und keine maßstäbliche Koordinatenablesung. Rechnerisch gilt |n_E·n_F|/(|n_E||n_F|)=1/√2, also der kleinere nicht orientierte Ebenenschnittwinkel φ=45°. Das Bild behauptet nur die Richtung der Schnittgeraden parallel zur z-Achse, nicht ihre exakte Lage; diese Richtung ist zu beiden Normalen orthogonal. Die unveränderten Transferfälle wurden unabhängig erneut gerechnet: E:x=0 und F:x+√3y=0 ergeben 60° entlang der z-Achse; aus der Parameterform von F folgt z−x−y=2, mit E:x+y=1 ergibt sich φ≈35,26° und die Schnittgerade x+y=1,z=3. Der Betrag im Winkelansatz macht die Normalenvorzeichenwahl irrelevant. Die aktuelle Quelle Q2.3, S. 42, Spiegelstrich 8 und die Bildgrenze wurden geprüft. Visualisierung und Transferaufgaben sind nur ein P-v2-KI-Kandidat, keine menschliche Freigabe oder Lernendenleistung.`,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(profile),
    }],
  }
  const [record] = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidate })
  assert(record.reviewInputFingerprint !== previousRecord.reviewInputFingerprint, 'New PNG must change the P review-input binding')
  assert(record.profileFingerprint === previousRecord.profileFingerprint, 'Transfer profile changed unexpectedly')

  const artifacts = [
    { path: `${output}/plane-angle-direction.config.json`, bytes: jsonBytes(config) },
    { path: candidatePath, bytes: jsonBytes(candidate) },
    { path: `${output}/plane-angle-direction.review.jsonl`, bytes: Buffer.from(`${JSON.stringify(record)}\n`) },
    { path: `${output}/binding-review.json`, bytes: jsonBytes({
      schemaVersion: 1,
      reviewedAt,
      reviewer,
      authority: 'ai_candidate',
      humanApproved: false,
      goalId,
      imageUrl,
      imageSha256: reviewedCandidateSha,
      independentVisualizationReviewPath: independentImageReview,
      priorConfigSha256: sourceDigests.config,
      priorCandidatesSha256: sourceDigests.candidates,
      priorReviewSha256: sourceDigests.review,
      previousReviewInputFingerprint: previousRecord.reviewInputFingerprint,
      currentReviewInputFingerprint: record.reviewInputFingerprint,
      unchangedProfileFingerprint: record.profileFingerprint,
      decision: 'current_direction_png_p_v2_ai_candidate',
      limit: 'No human profile approval, no new source permission, no learning-performance evidence.',
    }) },
  ]
  for (const artifact of artifacts) await verifyOrWrite(artifact.path, artifact.bytes, write)
  const result = reviewPositiveGoalEvidenceConfig(`${output}/plane-angle-direction.config.json`)
  assert(result.errors.length === 0, `${output}: ${result.errors.join(' | ')}`)
  console.log(`${write ? 'Wrote' : 'Verified'} current direction-PNG P-v2 AI candidate; no human approval.`)
}

void main()
