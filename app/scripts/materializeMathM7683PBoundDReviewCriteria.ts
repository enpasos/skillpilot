import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  type PositiveGoalEvidenceReviewRecord,
} from './positiveGoalEvidenceProfileModel'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const goalId = '6833664b-bd8b-44a2-95bc-c0b78ff89e31'
const paths = {
  baseCriteria: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
  pConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-first15-20260923-v1/image-bound-14.config.json',
  pRecords: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-first15-20260923-v1/image-bound-14.review.jsonl',
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  output: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-683-congruence-similarity-p-bound-current-20260923-v2.criteria.md',
} as const
const digest = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const read = (path: string) => readFile(resolve(repositoryRoot, path))
const fail = (message: string): never => { throw new Error(message) }

const mode = process.argv[2]
if (mode !== '--write' && mode !== '--check') fail('Usage: tsx app/scripts/materializeMathM7683PBoundDReviewCriteria.ts --write|--check')
const [criteriaBytes, configBytes, recordsBytes, canonicalBytes] = await Promise.all([
  read(paths.baseCriteria), read(paths.pConfig), read(paths.pRecords), read(paths.canonical),
])
const config = JSON.parse(configBytes.toString('utf8')) as {
  reviewId: string
  profileRuleVersion: string
  reviewCriteriaPath: string
  scope: { goalIds: string[] }
}
const landscape = JSON.parse(canonicalBytes.toString('utf8')) as SkillLandscape
const goal = landscape.goals.find((entry) => entry.id === goalId) ?? fail('Current canonical 683 goal missing')
const lines = recordsBytes.toString('utf8').trim().split(/\r?\n/u)
const recordLines = lines.filter((line) => (JSON.parse(line) as { goalId: string }).goalId === goalId)
if (recordLines.length !== 1 || !config.scope.goalIds.includes(goalId) || config.profileRuleVersion !== 'positive-understanding-evidence-v2') {
  fail('Current 683 P-v2 record is missing, duplicated, or outside its configured scope')
}
const record = JSON.parse(recordLines[0]) as PositiveGoalEvidenceReviewRecord
if (
  record.reviewId !== config.reviewId
  || record.goalId !== goalId
  || record.profileRuleVersion !== 'positive-understanding-evidence-v2'
  || record.status !== 'needs_human_review'
  || record.reviewAuthority !== 'ai_candidate'
  || record.profileFingerprint !== fingerprintPositiveGoalEvidenceProfile(record.profile)
  || record.goalFingerprint !== fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
) fail('Current 683 P-v2 record metadata or goal/profile fingerprint does not match canonical goal')
const pCriteriaDigest = digest(await read(config.reviewCriteriaPath))
if (record.reviewCriteriaFingerprint !== pCriteriaDigest) fail('Current 683 P-v2 review criteria fingerprint changed')
const visualizationLinks = (goal.resourceLinks ?? []).filter((link) => link.type === 'goal-visualization')
if (visualizationLinks.length !== 1) fail('Current 683 goal must have exactly one visualization')
const visualization = visualizationLinks[0]
if (!visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
  fail('Current 683 visualization URL is outside its goal directory')
}
const imagePath = resolve(repositoryRoot, 'app/public', `.${visualization.url}`)
const imageDigest = digest(await readFile(imagePath))
const resourceDigests = { [visualization.url]: imageDigest }
if (record.reviewInputFingerprint !== fingerprintPositiveGoalEvidenceReviewInput(
  goal, record.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic',
)) fail('Current 683 P-v2 review input no longer matches canonical text and image')

const output = [
  criteriaBytes.toString('utf8').trimEnd(),
  '',
  '## Aktueller P-v2-Kontext für das präzisierte Kongruenz-und-Ähnlichkeitsziel',
  '',
  `- P-v2-Quellpfad: \`${paths.pRecords}\``,
  `- Exakter P-v2-Quelldigest: \`${digest(recordsBytes)}\``,
  `- Ausgewählter Quellzeilen-Digest: \`${digest(`${recordLines[0]}\n`)}\``,
  `- P-v2-Konfigurationspfad: \`${paths.pConfig}\``,
  `- Exakter Konfigurationsdigest: \`${digest(configBytes)}\``,
  `- Aktueller Visualisierungsdigest: \`${imageDigest}\``,
  '- Dieses P-v2-Profil ist ein aktueller KI-Kandidat, keine menschliche Freigabe und kein Leistungsnachweis eines Lernenden.',
  '- Der native GoalBook-Wert `evidenceProfile: null` beschreibt ausschließlich dessen V1-Profilfeld. Er bedeutet hier nicht, dass kein aktuelles P-v2-Profil existiert.',
  '- Die eigenständige einseitige D-Review-Ausgabe nummeriert ihre Seite neu. Prüfe den Zieltext unabhängig; nutze das folgende P-v2-Profil als vorhandenen positiven Evidenzkontext und empfehle `none` nur, wenn es die nötige Understanding-, Performance- und Transferleistung vollständig abdeckt. Sonst `revise`, nicht blind `create`.',
  '- Bild und Profil ersetzen keine eigenständige Lernendenleistung. Effektive Geltung und vollständige Quellenabdeckung sind mit diesem Zusatz nicht nachgewiesen.',
  '',
  'Der folgende JSON-Block gibt den ausgewählten aktuellen P-v2-Record verlustfrei wieder:',
  '',
  '```json',
  JSON.stringify(record, null, 2),
  '```',
  '',
].join('\n')
const outputPath = resolve(repositoryRoot, paths.output)
if (mode === '--write') {
  await writeFile(outputPath, output, { flag: 'wx' })
} else {
  if ((await readFile(outputPath, 'utf8')) !== output) fail('683 D criteria no longer match exact current P-v2 source/canonical/image')
}
process.stdout.write(`683 P-v2-bound D criteria ${mode}: ${digest(output)}\n`)
