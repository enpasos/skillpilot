import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

const root = resolve(import.meta.dirname, '../..')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/'
const sourceStem = 'canonical-math-positive-understanding-evidence-m7-matrix-probability-ten-20260922-v1'
const retainedStem = 'canonical-math-positive-understanding-evidence-m7-matrix-probability-retained8-20260923-v1'
const revisedStem = 'canonical-math-positive-understanding-evidence-m7-matrix-stochastics-open2-20260923-v1'
const revisedIds = [
  '4c494716-567b-59c2-855c-6ea45635c666',
  '52e57eb5-7cd1-5df0-a8c6-7b090f097d9f',
] as const
const revisedIdSet = new Set<string>(revisedIds)
const reviewedAt = '2026-09-23T02:36:18Z'
const reviewer = 'Codex / targeted Math M7 matrix-stochastics open2 profile recheck'
const writeMode = process.argv.includes('--write')
if (process.argv.slice(2).some((argument) => argument !== '--write')) {
  throw new Error('Usage: tsx materializeMathM7MatrixStochasticsOpen2EvidenceRebind.ts [--write]')
}

const sourceConfig = JSON.parse(readFileSync(resolve(root, `${base}${sourceStem}.config.json`), 'utf8')) as PositiveGoalEvidenceReviewConfig
const sourceLines = readFileSync(resolve(root, `${base}${sourceStem}.review.jsonl`), 'utf8')
  .split(/\r?\n/u).filter((line) => line.length > 0)
const sourceRecords = sourceLines.map((line) => JSON.parse(line) as {
  goalId: string
  reviewId: string
  status: string
  reviewAuthority: string
  reason: string
  profile: unknown
  evidenceLevel: string
  maximumClaimScope: string
  dissent: string[]
})
if (sourceConfig.reviewId !== sourceStem || sourceRecords.length !== 10) {
  throw new Error('Unexpected historical ten-goal profile source')
}
const sourceIds = sourceConfig.scope.goalIds
if (sourceIds.length !== 10 || sourceIds.some((goalId, index) => sourceRecords[index]?.goalId !== goalId)) {
  throw new Error('Historical source config and records do not match in order')
}
for (const record of sourceRecords) {
  if (record.reviewId !== sourceStem || record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate') {
    throw new Error(`${record.goalId}: unexpected historical authority or status`)
  }
}

const retainedIds = sourceIds.filter((goalId) => !revisedIdSet.has(goalId))
if (retainedIds.length !== 8 || revisedIds.some((goalId) => !sourceIds.includes(goalId))) {
  throw new Error('Open-two split does not partition the historical ten-goal scope')
}
const retainedConfig: PositiveGoalEvidenceReviewConfig = {
  ...sourceConfig,
  reviewPath: `${base}${retainedStem}.review.jsonl`,
  scope: { ...sourceConfig.scope, label: 'Acht unveränderte Matrix- und Wahrscheinlichkeitsprofile aus dem Zehnerpaket', goalIds: retainedIds },
}
// The eight JSONL lines are copied byte-for-byte. The old reviewId remains
// truthful and the original v1 config/records stay untouched as history.
const retainedReview = `${sourceLines.filter((line, index) => !revisedIdSet.has(sourceRecords[index].goalId)).join('\n')}\n`

const revisedConfig: PositiveGoalEvidenceReviewConfig = {
  ...sourceConfig,
  reviewId: revisedStem,
  reviewPath: `${base}${revisedStem}.review.jsonl`,
  scope: { ...sourceConfig.scope, label: 'Zwei gezielt fachlich neu gebundene Matrix- und Vierfeldertafelprofile', goalIds: [...revisedIds] },
}
const sourceById = new Map(sourceRecords.map((record) => [record.goalId, record]))
const candidates = {
  schemaVersion: 1 as const,
  authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
  reviewId: revisedStem,
  reviewedAt,
  reviewer,
  goals: revisedIds.map((goalId) => {
    const prior = sourceById.get(goalId)
    if (!prior) throw new Error(`${goalId}: historical profile missing`)
    return {
      goalId,
      reason: goalId === revisedIds[0]
        ? 'Die neue Beschreibung begrenzt Schattenwuerfe fachlich auf lineare Parallelprojektionen. Beide unveraenderten Transferfaelle pruefen eine solche lineare Schattenregel samt Matrixspalten und geometrischer Wirkung; das aktive Bild zeigt S(x,y)=(x+y,0) mit parallelen Pfeilen. Keine Zentralprojektion wird behauptet. Nur die exakte Ziel-/Seitenbindung wird neu berechnet; Profil und AI-Kandidatenstatus bleiben unveraendert.'
        : 'Die neue Beschreibung trennt gemeinsame Wahrscheinlichkeiten von bedingten Anteilen innerhalb der passenden Bezugsgruppe. Beide unveraenderten Transferfaelle verlangen korrekt beschriftete Vier- bzw. Mehrfeldertafeln, Gesamtnenner fuer gemeinsame und Randgruppennenner fuer bedingte Anteile; das aktive Bild macht 30/100, 30/50 und 30/40 sichtbar. Das eigenstaendige Berechnungsziel bleibt getrennt. Nur die exakte Ziel-/Seitenbindung wird neu berechnet; Profil und AI-Kandidatenstatus bleiben unveraendert.',
      evidenceLevel: prior.evidenceLevel as 'E1',
      maximumClaimScope: prior.maximumClaimScope as 'G1',
      dissent: prior.dissent,
      profile: prior.profile as Parameters<typeof buildPositiveGoalEvidenceCandidateRecords>[0]['candidateSet']['goals'][number]['profile'],
    }
  }),
}
const revisedRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: revisedConfig, candidateSet: candidates })
if (revisedRecords.length !== 2 || revisedRecords.some((record, index) => record.goalId !== revisedIds[index])) {
  throw new Error('Materialized open-two profile order differs from reviewed scope')
}
revisedRecords.forEach((record) => {
  const prior = sourceById.get(record.goalId)
  if (!prior || record.profileFingerprint !== (prior as { profileFingerprint?: string }).profileFingerprint) {
    throw new Error(`${record.goalId}: approved transfer profile content changed unexpectedly`)
  }
})
const revisedReview = `${revisedRecords.map((record) => JSON.stringify(record)).join('\n')}\n`

const outputs: Array<[string, string]> = [
  [`${base}${retainedStem}.config.json`, `${JSON.stringify(retainedConfig, null, 2)}\n`],
  [`${base}${retainedStem}.review.jsonl`, retainedReview],
  [`${base}${revisedStem}.config.json`, `${JSON.stringify(revisedConfig, null, 2)}\n`],
  [`${base}${revisedStem}.review.jsonl`, revisedReview],
]
for (const [path, expected] of outputs) {
  const absolute = resolve(root, path)
  let actual = ''
  try { actual = readFileSync(absolute, 'utf8') } catch { /* new versioned artifact */ }
  if (actual === expected) continue
  if (!writeMode) throw new Error(`${path}: current artifact differs from checked materialization`)
  writeFileSync(absolute, expected)
}
console.log(`CHECK math_m7_matrix_stochastics_open2_evidence_rebind ${writeMode ? 'WRITE' : 'PASS'} retained=8 revised=2 historical=unchanged`)
