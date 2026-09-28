import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { fingerprintPositiveGoalEvidenceProfile, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const target = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-newton-parallel-two-png-20260927-v1'
const oldNewtonConfigPath = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-restored-after-sight-v2/0c7bbd3f.config.json'
const oldParallelConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-parallel-perpendicular-text-retained-20260926-v1/positive-evidence.config.json'
const newtonId = '0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'
const parallelId = '2231c29b-eb4e-51ae-9cb1-eb033bf16099'
const retainedId = '944dd479-9f30-5acb-ab32-3ea0b6dc8e06'
const reviewedAt = '2026-09-27T08:47:39Z'
const imageHashes: Record<string, string> = {
  [newtonId]: 'sha256:ff3477c02aef5f17fdf46412b4f1c3eed0c1672bcc3eb0ecacc605c6ba85543e',
  [parallelId]: 'sha256:cd00825a38ef96a2fe1696a6b02cc4177f7bf689c49137eb2e635f8217bf270f',
}

const sha256 = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const readJsonl = async <T>(path: string): Promise<{ raw: string[]; records: T[] }> => {
  const raw = (await readFile(join(root, path), 'utf8')).trimEnd().split('\n')
  return { raw, records: raw.map((line) => JSON.parse(line) as T) }
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const verifyOrWrite = async (path: string, bytes: Buffer, write: boolean): Promise<void> => {
  const absolute = join(root, path)
  let current: Buffer | null = null
  try { current = await readFile(absolute) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current) {
    assert(current.equals(bytes), `${path}: output differs from checked current images or original evidence`)
  } else {
    assert(write, `${path}: output is missing`)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, bytes, { flag: 'wx' })
  }
}

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--check', 'Usage: tsx app/scripts/materializeMathM7NewtonParallelPDelta.ts --write|--check')
  const write = mode === '--write'
  const [newtonConfigBytes, parallelConfigBytes] = await Promise.all([
    readFile(join(root, oldNewtonConfigPath)),
    readFile(join(root, oldParallelConfigPath)),
  ])
  const oldNewtonConfig = JSON.parse(newtonConfigBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const oldParallelConfig = JSON.parse(parallelConfigBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  assert(oldNewtonConfig.scope.goalIds.length === 1 && oldNewtonConfig.scope.goalIds[0] === newtonId, 'Old Newton P scope changed')
  assert(oldParallelConfig.scope.goalIds.join(',') === [parallelId, retainedId].join(','), 'Old parallel P scope changed')
  assert(oldNewtonConfig.landscapePath === oldParallelConfig.landscapePath && oldNewtonConfig.reviewCriteriaPath === oldParallelConfig.reviewCriteriaPath, 'Old P source context differs')
  const [newtonSource, parallelSource] = await Promise.all([
    readJsonl<PositiveGoalEvidenceReviewRecord>(oldNewtonConfig.reviewPath),
    readJsonl<PositiveGoalEvidenceReviewRecord>(oldParallelConfig.reviewPath),
  ])
  assert(newtonSource.records.length === 1 && newtonSource.records[0]?.goalId === newtonId, 'Old Newton P record changed')
  assert(parallelSource.records.length === 2 && parallelSource.records[0]?.goalId === parallelId && parallelSource.records[1]?.goalId === retainedId, 'Old parallel P record order changed')
  const oldRecords = [newtonSource.records[0], parallelSource.records[0]]
  assert(oldRecords.every((record) => record?.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate'), 'Expected only old AI P candidates')

  const canonical = await readJson<{ goals: Array<{ id: string; resourceLinks?: Array<{ type: string; role?: string; url: string }> }> }>(oldNewtonConfig.landscapePath)
  const qa = await readJson<{ records: Array<{ goalId: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  for (const id of [newtonId, parallelId]) {
    const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
    const goal = canonical.goals.find(({ id: goalId }) => goalId === id)
    const primary = goal?.resourceLinks?.filter(({ type, role }) => type === 'goal-visualization' && role === 'primary')
    assert(primary?.length === 1 && primary[0]?.url === url, `${id}: current canonical image link changed`)
    const [source, publicAsset, backendAsset] = await Promise.all([
      readFile(join(root, 'curricula/DE/Gymnasium/visualizations/mathematik', id, `${id}.png`)),
      readFile(join(root, 'app/public', url)),
      readFile(join(root, 'backend/src/main/resources/static', url)),
    ])
    assert([source, publicAsset, backendAsset].every((asset) => sha256(asset) === imageHashes[id]), `${id}: exact current PNG copies differ`)
    const review = qa.records.find(({ goalId }) => goalId === id)
    assert(review?.assetSha256 === imageHashes[id] && review.aiApproved === 'yes' && review.aiApprovedAssetSha256 === imageHashes[id], `${id}: exact AI V review missing`)
  }

  const retainedConfig: PositiveGoalEvidenceReviewConfig = {
    ...oldParallelConfig,
    reviewPath: `${target}/positive-retained-other.review.jsonl`,
    scope: { label: 'Unveränderter P-v2-Kandidat für Q2-Spatprodukt, nach J5-Bildintegration getrennt', goalIds: [retainedId] },
  }
  const currentConfig: PositiveGoalEvidenceReviewConfig = {
    ...oldNewtonConfig,
    reviewId: 'canonical-math-positive-evidence-m7-newton-parallel-current-png-20260927-v1',
    reviewPath: `${target}/positive-current-two.review.jsonl`,
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Zwei fachlich erneut geprüfte P-v2-Kandidaten mit aktuellen Newton- und Lagebeziehungs-PNGs', goalIds: [newtonId, parallelId] },
  }
  const currentCandidate = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: currentConfig.reviewId,
    reviewedAt,
    reviewer: 'Codex independent current-PNG P-v2 content review; exact image_gen model unavailable',
    goals: [
      {
        goalId: newtonId,
        reason: `Aktuelles Newton-PNG ${imageHashes[newtonId]} im Original und bei 360 px angesehen: f(x)=x²−2, x₀=2, x₁=1,5, x₂≈1,4167 und √2≈1,4142 stimmen; die Tangenten schneiden die x-Achse in richtiger Reihenfolge. Der Hinweis auf einen geeigneten Startwert grenzt die Konvergenzbehauptung ein. Beide alten Transferfälle erneut gerechnet: f(x)=x²−3 ergibt 7/4, 97/56, Residuum 1/3136 und bei Start 0 eine undefinierte Division; h(x)=x³−2x+2 hat von 0 aus den Zyklus 0→1→0, von −2 aus −1,8 und rund −1,769948. Das Bild ist Orientierung, kein Beweis und keine Leistungsprobe. Unverändertes Profil bleibt E1/G1-KI-Kandidat ohne menschliche Freigabe.`,
        evidenceLevel: 'E1' as const,
        maximumClaimScope: 'G1' as const,
        dissent: [],
        profile: structuredClone(oldRecords[0]!.profile),
      },
      {
        goalId: parallelId,
        reason: `Aktuelles Lagebeziehungs-PNG ${imageHashes[parallelId]} im Original und bei 360 px angesehen: links zwei parallele Horizontale, rechts eine als Rechtwinkel markierte Kreuzung zweier Diagonalen; der dokumentierte Linienfit beträgt etwa 89,84°. Die Darstellung ist ein Ausgangsbeispiel, nicht die Begründungsaufgabe. Die beiden alten P-v2-Fälle bleiben nach inhaltlicher Neuprüfung geeignet: gedrehte Paare müssen über Richtungs-/Rechtwinkelbedingungen klassifiziert werden; bei kurzen Strecken entscheidet die Lage der tragenden Geraden und nicht bloß fehlender sichtbarer Schnitt. Das unveränderte Profil bleibt E1/G1-KI-Kandidat ohne menschliche Freigabe.`,
        evidenceLevel: 'E1' as const,
        maximumClaimScope: 'G1' as const,
        dissent: [],
        profile: structuredClone(oldRecords[1]!.profile),
      },
    ],
  }
  const currentRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: currentCandidate })
  assert(currentRecords.length === 2, 'Expected two current P records')
  currentRecords.forEach((record, index) => {
    const old = oldRecords[index]!
    assert(record.reviewInputFingerprint !== old.reviewInputFingerprint, `${record.goalId}: image input did not change P binding`)
    assert(record.profileFingerprint === old.profileFingerprint, `${record.goalId}: old P profile content drifted`)
    assert(record.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(record.profile), `${record.goalId}: P profile hash mismatch`)
  })
  const receipt = {
    schemaVersion: 1,
    reviewedAt,
    authority: 'ai_candidate',
    humanApproved: false,
    sourceConfigSha256: { newton: sha256(newtonConfigBytes), parallel: sha256(parallelConfigBytes) },
    sourceReviewSha256: {
      newton: sha256(await readFile(join(root, oldNewtonConfig.reviewPath))),
      parallel: sha256(await readFile(join(root, oldParallelConfig.reviewPath))),
    },
    retainedUnchangedGoalId: retainedId,
    goals: currentRecords.map((record, index) => ({
      goalId: record.goalId,
      imageSha256: imageHashes[record.goalId],
      oldReviewInputFingerprint: oldRecords[index]!.reviewInputFingerprint,
      currentReviewInputFingerprint: record.reviewInputFingerprint,
      unchangedProfileFingerprint: record.profileFingerprint,
      status: record.status,
    })),
    limit: 'Current P-v2 AI candidates only; no human approval, learner performance or source-permission decision.',
  }
  for (const artifact of [
    { path: `${target}/positive-retained-other.config.json`, bytes: jsonBytes(retainedConfig) },
    { path: `${target}/positive-retained-other.review.jsonl`, bytes: Buffer.from(`${parallelSource.raw[1]}\n`) },
    { path: `${target}/positive-current-two.config.json`, bytes: jsonBytes(currentConfig) },
    { path: `${target}/positive-current-two.candidates.json`, bytes: jsonBytes(currentCandidate) },
    { path: `${target}/positive-current-two.review.jsonl`, bytes: Buffer.from(`${currentRecords.map((record) => JSON.stringify(record)).join('\n')}\n`) },
    { path: `${target}/positive-binding-review.json`, bytes: jsonBytes(receipt) },
  ]) await verifyOrWrite(artifact.path, artifact.bytes, write)
  for (const path of [`${target}/positive-retained-other.config.json`, `${target}/positive-current-two.config.json`]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} one retained and two current exact-PNG P-v2 AI candidates; no human approval.`)
}

void main()
