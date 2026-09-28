import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const source = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-newton-parallel-two-png-20260927-v1'
const target = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-newton-current-description-20260927-v1'
const newtonId = '0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'
const parallelId = '2231c29b-eb4e-51ae-9cb1-eb033bf16099'
const imageSha256 = 'sha256:ff3477c02aef5f17fdf46412b4f1c3eed0c1672bcc3eb0ecacc605c6ba85543e'
const reviewedAt = '2026-09-27T10:13:03Z'
const sha256 = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
const verifyOrWrite = async (path: string, bytes: Buffer, write: boolean): Promise<void> => {
  const absolute = join(root, path)
  let current: Buffer | null = null
  try { current = await readFile(absolute) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current) assert(current.equals(bytes), `${path}: output differs from exact Newton text/P review`)
  else {
    assert(write, `${path}: output is missing`)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, bytes, { flag: 'wx' })
  }
}

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--check', 'Usage: tsx app/scripts/materializeMathM7NewtonTextPDelta.ts --write|--check')
  const write = mode === '--write'
  const oldConfigPath = `${source}/positive-current-two.config.json`
  const oldConfigBytes = await readFile(join(root, oldConfigPath))
  const oldConfig = JSON.parse(oldConfigBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  assert(oldConfig.scope.goalIds.join(',') === `${newtonId},${parallelId}`, 'Source P scope changed')
  const oldReviewBytes = await readFile(join(root, oldConfig.reviewPath))
  const oldRecords = oldReviewBytes.toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
  assert(oldRecords.length === 2 && oldRecords[0]?.goalId === newtonId && oldRecords[1]?.goalId === parallelId, 'Source P records changed')
  assert(oldRecords[0]?.reviewAuthority === 'ai_candidate' && oldRecords[0]?.status === 'needs_human_review', 'Newton source P must be an AI candidate')
  const canonical = await readJson<{ goals: Array<{ id: string; description: string; descriptionEn: string; resourceLinks?: Array<{ type: string; role?: string; url: string; altText?: string }> }> }>(oldConfig.landscapePath)
  const goal = canonical.goals.find((row) => row.id === newtonId)
  assert(goal?.description === 'Die lernende Person kann beim Newton-Verfahren die Nullstelle der Tangente im aktuellen Graphpunkt als nächsten Näherungswert bestimmen, die Iteration bei geeigneten Funktionen und Startwerten anwenden und Grenzen anhand von Ableitung und Näherungsverlauf begründen.', 'Newton DE text changed')
  assert(goal?.descriptionEn === "The learner can determine the root of the tangent at the current point on the graph as the next approximation in Newton's method, iterate for suitable functions and starting values, and explain limitations using the derivative and the course of the approximations.", 'Newton EN text changed')
  const image = goal.resourceLinks?.filter((link) => link.type === 'goal-visualization' && link.role === 'primary')
  assert(image?.length === 1 && image[0]?.url === `/assets/goal-visualizations/mathematik/${newtonId}/${newtonId}.png` && image[0].altText?.includes('die positive Nullstelle'), 'Newton image/alt text changed')
  const qa = await readJson<{ records: Array<{ goalId: string; aiApproved?: string; aiApprovedAssetSha256?: string }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  assert(qa.records.find((row) => row.goalId === newtonId)?.aiApproved === 'yes' && qa.records.find((row) => row.goalId === newtonId)?.aiApprovedAssetSha256 === imageSha256, 'Exact current V review missing')
  for (const path of [
    `curricula/DE/Gymnasium/visualizations/mathematik/${newtonId}/${newtonId}.png`,
    `app/public${image[0].url}`,
    `backend/src/main/resources/static${image[0].url}`,
  ]) assert(sha256(await readFile(join(root, path))) === imageSha256, `${path}: image bytes differ`)

  const newtonConfig: PositiveGoalEvidenceReviewConfig = {
    ...oldConfig,
    reviewId: 'canonical-math-positive-evidence-m7-newton-current-description-20260927-v1',
    reviewPath: `${target}/positive-newton.review.jsonl`,
    scope: { label: 'Newton nach beidseitiger D-Revision und fachlich korrigiertem Alttext', goalIds: [newtonId] },
  }
  const parallelConfig: PositiveGoalEvidenceReviewConfig = {
    ...oldConfig,
    reviewPath: `${target}/positive-parallel-retained.review.jsonl`,
    scope: { label: 'Unveränderter P-v2-Kandidat für parallele und senkrechte Lagebeziehungen', goalIds: [parallelId] },
  }
  const candidateSet = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: newtonConfig.reviewId,
    reviewedAt,
    reviewer: 'Codex Newton targeted description and exact-image P-v2 review 2026-09-27',
    goals: [{
      goalId: newtonId,
      reason: `Die aktualisierte D-Formulierung präzisiert den Tangentenschnitt als nächsten Näherungswert und verlangt einen begründeten Blick auf Ableitung und Iterationsverlauf. Das unveränderte P-v2-Profil prüft beides mit zwei unabhängigen Fällen: f(x)=x²−3 liefert zwei Schritte und bei Start 0 eine undefinierte Division; h(x)=x³−2x+2 erzeugt aus 0 den definierten Zweierzyklus 0→1→0. Das aktuelle PNG ${imageSha256} mit f(x)=x²−2 illustriert die positive Nullstelle; Bild und korrigierter Alttext sind keine Leistungsprobe. E1/G1-KI-Kandidat, keine menschliche Freigabe.`,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(oldRecords[0]!.profile),
    }],
  }
  const current = await buildPositiveGoalEvidenceCandidateRecords({ config: newtonConfig, candidateSet })
  assert(current.length === 1 && current[0]?.profileFingerprint === oldRecords[0]?.profileFingerprint, 'Newton P profile content changed')
  assert(current[0]?.reviewInputFingerprint !== oldRecords[0]?.reviewInputFingerprint, 'Newton P input fingerprint did not change')
  const artifacts = [
    { path: `${target}/positive-newton.config.json`, bytes: jsonBytes(newtonConfig) },
    { path: `${target}/positive-newton.candidates.json`, bytes: jsonBytes(candidateSet) },
    { path: `${target}/positive-newton.review.jsonl`, bytes: Buffer.from(`${JSON.stringify(current[0])}\n`) },
    { path: `${target}/positive-parallel-retained.config.json`, bytes: jsonBytes(parallelConfig) },
    { path: `${target}/positive-parallel-retained.review.jsonl`, bytes: Buffer.from(`${JSON.stringify(oldRecords[1])}\n`) },
    { path: `${target}/positive-binding-review.json`, bytes: jsonBytes({
      schemaVersion: 1,
      reviewedAt,
      authority: 'ai_candidate',
      humanApproved: false,
      sourceConfigPath: oldConfigPath,
      sourceConfigSha256: sha256(oldConfigBytes),
      sourceReviewSha256: sha256(oldReviewBytes),
      newtonGoalId: newtonId,
      imageSha256,
      previousInputFingerprint: oldRecords[0]?.reviewInputFingerprint,
      currentInputFingerprint: current[0]?.reviewInputFingerprint,
      unchangedProfileFingerprint: current[0]?.profileFingerprint,
      retainedParallelGoalId: parallelId,
      limit: 'Current P-v2 AI candidate only; no human approval, learner performance or D approval.',
    }) },
  ]
  for (const artifact of artifacts) await verifyOrWrite(artifact.path, artifact.bytes, write)
  for (const path of [`${target}/positive-newton.config.json`, `${target}/positive-parallel-retained.config.json`]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} Newton current-text P-v2 AI candidate and unchanged parallel P; no human approval.`)
}

void main().catch((error) => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode = 1 })
