import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const goalId = '797ee047-b8dd-45cf-880e-98571a56c690'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const reviewedAt = '2026-09-02'
const reviewedAtIso = '2026-09-02T15:50:00.000Z'
const reviewer = 'codex-math-b028-fractional-equation-adjudication-2026-09-02'

const titleDe = 'Bruchgleichungen lösen und als Schnittprobleme deuten'
const titleEn = 'Solve fractional equations and interpret them as intersection problems'
const beforeDescriptionDe =
  'Die lernende Person kann Bruchgleichungen rechnerisch lösen und in einfachen Fällen als Schnittprobleme von Funktionsgraphen interpretieren.'
const beforeDescriptionEn =
  'The learner can solve fractional equations algebraically and, in simple cases, interpret them as intersection problems of function graphs.'
const finalDescriptionDe =
  'Die lernende Person kann Bruchgleichungen unter Angabe und Beachtung der gemeinsamen Definitionsmenge rechnerisch lösen und ihre Lösungen in einfachen Fällen als x-Koordinaten der Schnittpunkte der Graphen beider Gleichungsseiten deuten.'
const finalDescriptionEn =
  'The learner can solve fractional equations algebraically while stating and respecting their common domain and, in simple cases, interpret their solutions as the x-coordinates of the intersections of the graphs of both sides.'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  canonicalImage:
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`,
  publicImage:
    `app/public/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`,
  backendImage:
    `backend/src/main/resources/static/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`,
  prompt:
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/prompt.de.md`,
  reconstructionPrompt:
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/image-reconstruction-prompt.de.md`,
} as const

// The reviewed Nano Banana Pro asset and its historical generator records stay byte-identical.
const protectedHashes: Record<string, string> = {
  [paths.canonicalImage]: '1bf61b645b372ce898c8765745096ebb7ce26b82f64be0d9bb77c835c22c6000',
  [paths.publicImage]: '1bf61b645b372ce898c8765745096ebb7ce26b82f64be0d9bb77c835c22c6000',
  [paths.backendImage]: '1bf61b645b372ce898c8765745096ebb7ce26b82f64be0d9bb77c835c22c6000',
  [paths.prompt]: '0e568b1a2d877c3e29418399de0f632ebfaa11a715aed1fa60e2951067abfe73',
  [paths.reconstructionPrompt]: '1745b9fd48908d9bebf569e375fd280c9c7525a9576f3d1448e79f143378cb41',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex')
const digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}
const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(absolute(path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string =>
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const same = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right)
const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}))

for (const [path, expectedHash] of Object.entries(protectedHashes)) {
  assert(existsSync(absolute(path)), `Missing protected visualization artifact: ${path}`)
  const actualHash = sha256(readFileSync(absolute(path)))
  assert(actualHash === expectedHash, `Protected visualization artifact drifted: ${path}`)
}

const outputs = new Map<string, string>()

const canonical = readJson(paths.canonical)
assert(canonical.landscapeId === landscapeId, 'Unexpected canonical Mathematics landscape')
const goal = (canonical.goals as JsonRecord[])
  .find((candidate) => candidate.id === goalId)
assert(goal, `${goalId}: missing canonical goal`)
assert(
  goal.title === titleDe
    && goal.titleEn === titleEn
    && goal.type === 'atomic'
    && same(goal.contains, [])
    && (
      same([goal.description, goal.descriptionEn], [beforeDescriptionDe, beforeDescriptionEn])
      || same([goal.description, goal.descriptionEn], [finalDescriptionDe, finalDescriptionEn])
    ),
  `${goalId}: identity, atomicity, or bilingual description left the bounded states`,
)

const visualizationLinks = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
  .filter((link) => link.type === 'goal-visualization')
assert(visualizationLinks.length === 1, `${goalId}: expected one visualization link`)
const visualizationLink = visualizationLinks[0]
const beforeAltText =
  `Didaktische Visualisierung zum Lernziel "${titleDe}". ${beforeDescriptionDe}`
const finalAltText =
  `Didaktische Visualisierung zum Lernziel "${titleDe}". ${finalDescriptionDe}`
assert(
  visualizationLink.resourceType === 'image'
    && visualizationLink.role === 'primary'
    && visualizationLink.skillpilotId === goalId
    && visualizationLink.title === `Visualisierung: ${titleDe}`
    && visualizationLink.url === `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
    && visualizationLink.provider === 'Google Gemini / Nano Banana Pro'
    && visualizationLink.description === `Visualisierung zum Lernziel: ${titleDe}.`
    && visualizationLink.reviewStatus === 'pilot'
    && (visualizationLink.altText === beforeAltText
      || visualizationLink.altText === finalAltText),
  `${goalId}: retained Nano Banana Pro link drifted`,
)

const beforeGoal = clone(goal)
beforeGoal.description = beforeDescriptionDe
beforeGoal.descriptionEn = beforeDescriptionEn
const beforeVisualization = (beforeGoal.resourceLinks as JsonRecord[])
  .find((link) => link.type === 'goal-visualization')!
beforeVisualization.altText = beforeAltText

goal.description = finalDescriptionDe
goal.descriptionEn = finalDescriptionEn
visualizationLink.altText = finalAltText
const finalGoal = clone(goal)
outputs.set(paths.canonical, serializeJson(canonical))

const semanticKinds = readJson(paths.semanticKinds)
const semanticKind = (semanticKinds.decisions as JsonRecord[])
  .find((candidate) => candidate.goalId === goalId)
assert(
  semanticKind?.semanticKind === 'curricularAtomic'
    && semanticKind.decisionStatus === 'authoritative',
  `${goalId}: missing authoritative curricularAtomic decision`,
)
const beforeSemanticKindFingerprint = fingerprintSemanticKindSourceGoal(beforeGoal)
const finalSemanticKindFingerprint = fingerprintSemanticKindSourceGoal(finalGoal)
assert(
  semanticKind.sourceFingerprint === beforeSemanticKindFingerprint
    || semanticKind.sourceFingerprint === finalSemanticKindFingerprint,
  `${goalId}: semantic-kind source fingerprint is outside bounded states`,
)
semanticKind.sourceFingerprint = finalSemanticKindFingerprint
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const atomicityRecord = atomicity.find((candidate) => candidate.goalId === goalId)
assert(
  atomicityRecord?.ruleVersion === 'semantic-atomicity-v1'
    && atomicityRecord.status === 'atomic'
    && atomicityRecord.semanticAtomic === true
    && same(atomicityRecord.suggestedSplit, []),
  `${goalId}: semantic-atomicity decision drifted`,
)
const beforeAtomicityFingerprint = reviewFingerprint(beforeGoal, atomicityRecord.ruleVersion)
const finalAtomicityFingerprint = reviewFingerprint(finalGoal, atomicityRecord.ruleVersion)
assert(
  atomicityRecord.fingerprint === beforeAtomicityFingerprint
    || atomicityRecord.fingerprint === finalAtomicityFingerprint,
  `${goalId}: semantic-atomicity fingerprint is outside bounded states`,
)
Object.assign(atomicityRecord, {
  fingerprint: finalAtomicityFingerprint,
  status: 'atomic',
  semanticAtomic: true,
  reviewedAt,
  reviewer,
  reason:
    'Algebraisches Lösen unter gemeinsamer Definitionsmenge und grafische Schnittpunktdeutung sind zwei Repräsentationen derselben Lösungsmenge; die Präzisierung führt kein unabhängiges Teilziel ein.',
  suggestedSplit: [],
})
outputs.set(paths.atomicity, serializeJsonl(atomicity))

const memory = readJsonl(paths.memory)
const memoryRecord = memory.find((candidate) => candidate.goalId === goalId)
assert(
  memoryRecord?.ruleVersion === 'memory-card-review-v1'
    && memoryRecord.status === 'no_memory_needed'
    && memoryRecord.memoryUseful === false
    && (!memoryRecord.memoryGoalIds || same(memoryRecord.memoryGoalIds, []))
    && (!memoryRecord.deckIds || same(memoryRecord.deckIds, [])),
  `${goalId}: no-memory decision drifted`,
)
const beforeMemoryFingerprint = reviewFingerprint(beforeGoal, memoryRecord.ruleVersion)
const finalMemoryFingerprint = reviewFingerprint(finalGoal, memoryRecord.ruleVersion)
assert(
  memoryRecord.fingerprint === beforeMemoryFingerprint
    || memoryRecord.fingerprint === finalMemoryFingerprint,
  `${goalId}: memory-review fingerprint is outside bounded states`,
)
Object.assign(memoryRecord, {
  fingerprint: finalMemoryFingerprint,
  status: 'no_memory_needed',
  memoryUseful: false,
  reviewedAt,
  reviewer,
  reason:
    'Gemeinsame Definitionsmenge, algebraischer Lösungsweg und Schnittpunktdeutung müssen verknüpft angewendet werden; ein isoliertes Memory-Deck trägt diese Kompetenz nicht.',
})
outputs.set(paths.memory, serializeJsonl(memory))

const visualQa = readJson(paths.visualQa)
assert(
  visualQa.schemaVersion === 1 && visualQa.subject === 'mathematik',
  'Unexpected Mathematics visualization-QA ledger',
)
const visualQaRecords = (visualQa.records as JsonRecord[])
  .filter((candidate) => candidate.goalId === goalId)
assert(visualQaRecords.length === 1, `${goalId}: expected one visualization-QA record`)
const visualQaRecord = visualQaRecords[0]
const assetDigest = `sha256:${protectedHashes[paths.canonicalImage]}`
assert(
  visualQaRecord.title === titleDe
    && (visualQaRecord.description === beforeDescriptionDe
      || visualQaRecord.description === finalDescriptionDe)
    && visualQaRecord.visualizationState === 'available'
    && visualQaRecord.imageUrl === `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
    && visualQaRecord.assetSha256 === assetDigest
    && visualQaRecord.contentApprovedChatGpt === 'yes'
    && visualQaRecord.umlautsCorrectChatGpt === 'yes'
    && visualQaRecord.humanApproved === 'yes'
    && visualQaRecord.humanIssueIdentified === 'no',
  `${goalId}: visualization-QA identity, approval, or asset digest drifted`,
)
Object.assign(visualQaRecord, {
  description: finalDescriptionDe,
  chatGptReviewedAt: reviewedAtIso,
  chatGptReviewer: reviewer,
  chatGptNotes:
    'Das unveränderte Nano-Banana-Pro-Bild bleibt zur präzisierten Beschreibung kompatibel: Es nennt die gemeinsame Definitionsmenge x ≠ 0 und x ≠ −1, löst die Beispielgleichung algebraisch und deutet x = 1 ausdrücklich als x-Koordinate des Schnittpunkts S(1|1).',
})
outputs.set(paths.visualQa, serializeJson(visualQa))

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(absolute(path), bytes)
  else if (readFileSync(absolute(path), 'utf8') !== bytes) {
    throw new Error(`Adjudication drift in ${path}; run with --write`)
  }
}

console.log(
  `CHECK apply_math_batch_028_fractional_equation_adjudication ${writeMode ? 'WRITE' : 'PASS'} files=${outputs.size} goal=${goalId}`,
)
