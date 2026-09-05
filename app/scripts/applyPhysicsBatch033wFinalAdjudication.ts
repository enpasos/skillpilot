import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CanonicalAuthoringGoal } from '../src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type Revision = {
  id: string
  beforeStateDigest: string
  sourceRecordId: string
  sourceRecordDigest: string
  titleDe: string
  titleEn: string
  descriptionDe: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
}

const repositoryRoot = resolve(import.meta.dirname, '../..')
const write = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const paths = {
  roundB: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033w-final-adjudication-context-recheck-10-v1/round-b/results/physik-rollout-v1-batch-033w-final-adjudication-context-recheck-10-v1-20260905-first-pass-b.batch-001.records.jsonl',
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const
const reviewedAt = '2026-09-05'
const reviewer = 'codex-physics-b033w-final-adjudication-2026-09-05'

const revisions: Revision[] = [
  {
    id: 'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
    beforeStateDigest: '24c628e2ac7ea65e81233511abaceac84fd05201f2bf7d9a637a1edcab022692',
    sourceRecordId: 'b033w-round-b-2018751b-record-07',
    sourceRecordDigest: 'sha256:d82f3c9e22fd9fdc017902d6820e88350cc28297dbae36561b3ae706a0e44556',
    titleDe: 'Schwingungsgleichung lösen',
    titleEn: 'Solve Oscillation Equation',
    descriptionDe: 'Die lernende Person kann die lineare Differenzialgleichung einer ungedämpften harmonischen Schwingung für gegebene Anfangsbedingungen lösen und die Lösung anhand von Amplitude, Kreisfrequenz und Phase physikalisch deuten.',
    descriptionEn: 'The learner can solve the linear differential equation of an undamped harmonic oscillator for given initial conditions and physically interpret the solution in terms of amplitude, angular frequency, and phase.',
    atomicityReason: 'Lineare Differenzialgleichung, Anfangsbedingungen und Deutung der Lösungsparameter gehören zur Lösung eines einzigen ungedämpften harmonischen Schwingungsmodells.',
    memoryReason: 'Form und Parameterbezeichnungen können gestützt werden; Anfangsbedingungen sowie Amplitude, Kreisfrequenz und Phase müssen in neuen linearen Schwingersystemen eigenständig bestimmt und physikalisch gedeutet werden.',
  },
  {
    id: 'a684bec1-ba59-59d0-98d2-4ca37236f64c',
    beforeStateDigest: '9344e2d0503f1a46b4d47964eb6ac1b967e82744df4095c6d4940b3471c4170a',
    sourceRecordId: 'b033w-round-b-2018751b-record-10',
    sourceRecordDigest: 'sha256:94f8982a6ea094ad81494e4475854dafd88bdec0aec9b4a3af0d1355cc93b064',
    titleDe: 'Relativitätspostulate und Experimente',
    titleEn: 'Postulates of Relativity and Experiments',
    descriptionDe: 'Die lernende Person kann das Relativitätsprinzip und die Invarianz der Lichtgeschwindigkeit als Postulate formulieren, ihre Bedeutung für Inertialsysteme erläutern und den Nullbefund des Michelson-Morley-Versuchs historisch als Einwand gegen einen nachweisbaren Ätherwind einordnen.',
    descriptionEn: 'The learner can formulate the principle of relativity and the invariance of the speed of light as postulates, explain their meaning for inertial frames, and historically contextualize the null result of the Michelson-Morley experiment as evidence against a detectable ether wind.',
    atomicityReason: 'Beide Postulate, ihr Inertialsystembezug und die begrenzte Einordnung des Michelson-Morley-Nullbefunds verbinden Theorie und experimentelle Evidenz in einer einzigen grundlegenden Relativitätskompetenz.',
    memoryReason: 'Postulatnamen können gestützt werden; ihre Bedeutung für Inertialsysteme und die begrenzte Schlussfolgerung aus dem Nullbefund müssen an neuen experimentellen Situationen begründet werden.',
  },
]

const absolute = (path: string): string => resolve(repositoryRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const digest = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const reviewFingerprint = (goal: CanonicalAuthoringGoal, ruleVersion: string): string => `sha256:${digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalize(goal.title),
  titleEn: normalize(goal.titleEn),
  description: normalize(goal.description),
  descriptionEn: normalize(goal.descriptionEn),
  phase: normalize(goal.dimensionTags?.phase),
  area: normalize(goal.dimensionTags?.area),
  topicCode: normalize(goal.dimensionTags?.topicCode),
  nodeKind: normalize(goal.nodeKind),
}))}`
const goalStateDigest = (goal: CanonicalAuthoringGoal): string => digest(JSON.stringify([
  goal.title,
  goal.titleEn,
  goal.description,
  goal.descriptionEn,
  goal.requires ?? [],
  goal.semanticKind ?? null,
  goal.tags ?? [],
  goal.dimensionTags?.demandLevel ?? null,
]))
const isAfter = (goal: CanonicalAuthoringGoal, revision: Revision): boolean => (
  goal.title === revision.titleDe
  && goal.titleEn === revision.titleEn
  && goal.description === revision.descriptionDe
  && goal.descriptionEn === revision.descriptionEn
)

const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a' || canonical.subject !== 'Physik') {
  throw new Error(`Unexpected canonical Physics landscape ${String(canonical.landscapeId)}`)
}
const goals = canonical.goals as CanonicalAuthoringGoal[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')

const roundBRecords = readFileSync(absolute(paths.roundB), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => ({ record: JSON.parse(line) as JsonRecord, digest: `sha256:${digest(line)}` }))

for (const revision of revisions) {
  const sourceMatches = roundBRecords.filter(({ record }) => record.goalId === revision.id)
  if (sourceMatches.length !== 1) throw new Error(`${revision.id}: expected exactly one Round-B source record`)
  const source = sourceMatches[0]!
  if (
    source.record.recordId !== revision.sourceRecordId
    || source.digest !== revision.sourceRecordDigest
    || source.record.decision !== 'revise'
    || source.record.recordStatus !== 'candidate'
    || source.record.reviewAuthority !== 'ai_candidate'
    || source.record.currentTitleDe !== revision.titleDe
    || source.record.currentTitleEn !== revision.titleEn
    || source.record.proposedDescriptionDe !== revision.descriptionDe
    || source.record.proposedDescriptionEn !== revision.descriptionEn
  ) throw new Error(`${revision.id}: exact Round-B revision source binding drifted`)
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`${revision.id}: missing canonical goal`)
  if (goal.type !== 'atomic' || JSON.stringify(goal.contains ?? []) !== '[]') {
    throw new Error(`${revision.id}: expected retained atomic goal`)
  }
  if (goal.title !== revision.titleDe || goal.titleEn !== revision.titleEn) {
    throw new Error(`${revision.id}: B033w adjudication must not change either title`)
  }
  if (goalStateDigest(goal) !== revision.beforeStateDigest && !isAfter(goal, revision)) {
    throw new Error(`${revision.id}: canonical goal is outside the exact bounded before/after state`)
  }
  goal.description = revision.descriptionDe
  goal.descriptionEn = revision.descriptionEn

  const visualizationLinks = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
    .filter((link) => link.type === 'goal-visualization')
  if (visualizationLinks.length > 1) throw new Error(`${revision.id}: multiple visualization links`)
  if (visualizationLinks.length === 1) Object.assign(visualizationLinks[0], {
    title: `Visualisierung: ${revision.titleDe}`,
    description: `Visualisierung zum Lernziel: ${revision.titleDe}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.descriptionDe}`,
  })
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticById = new Map((semanticKinds.decisions as JsonRecord[])
  .map((decision) => [String(decision.goalId), decision]))
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const decision = semanticById.get(revision.id)
  if (!decision || decision.decisionStatus !== 'authoritative' || decision.semanticKind !== 'curricularAtomic') {
    throw new Error(`${revision.id}: missing authoritative curricularAtomic semantic-kind decision`)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const atomicityRecord = atomicityById.get(revision.id)
  if (!atomicityRecord || atomicityRecord.status !== 'atomic' || atomicityRecord.semanticAtomic !== true) {
    throw new Error(`${revision.id}: missing decided atomicity review`)
  }
  Object.assign(atomicityRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })
  const memoryRecord = memoryById.get(revision.id)
  if (!memoryRecord || !['no_memory_needed', 'memory_required'].includes(String(memoryRecord.status))) {
    throw new Error(`${revision.id}: missing decided memory review`)
  }
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}

const visualizationQa = readJson(paths.visualizationQa)
const visualizationById = new Map((visualizationQa.records as JsonRecord[])
  .map((record) => [String(record.goalId), record]))
let retainedVisualizationCount = 0
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const record = visualizationById.get(revision.id)
  if (!record) throw new Error(`${revision.id}: missing visualization QA record`)
  record.title = goal.title
  record.description = goal.description
  if (record.visualizationState !== 'available') continue
  const canonicalAsset = readFileSync(absolute(String(record.canonicalAssetPath)))
  const publicAsset = readFileSync(absolute(String(record.publicAssetPath)))
  if (!canonicalAsset.equals(publicAsset) || `sha256:${digest(canonicalAsset)}` !== record.assetSha256) {
    throw new Error(`${revision.id}: retained visualization bytes or digest drifted`)
  }
  retainedVisualizationCount += 1
}

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
  [paths.visualizationQa, serializeJson(visualizationQa)],
])
const changed = [...outputs].filter(([path, content]) => readFileSync(absolute(path), 'utf8') !== content)
if (!write && changed.length > 0) {
  throw new Error(`Physics B033w final adjudication is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}
if (write && changed.length > 0) {
  execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
  changed.forEach(([path, content]) => writeFileSync(absolute(path), content, 'utf8'))
}

console.log(
  `CHECK apply_physics_batch_033w_final_adjudication ${write ? 'WRITE' : 'PASS'} revisions=${revisions.length} titlesChanged=0 retainedVisualizations=${retainedVisualizationCount} changed=${changed.length}`,
)
