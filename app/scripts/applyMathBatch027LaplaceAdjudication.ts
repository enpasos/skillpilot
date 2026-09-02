import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-09-02'
const reviewer = 'codex-math-b027-laplace-adjudication-2026-09-02'
const goalId = '5ab17678-bba7-4e6b-9aff-5a909e24d40e'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
  byMapping: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json',
} as const

const previousDescriptionDe = 'Die lernende Person kann Laplace-Experimente beschreiben, Wahrscheinlichkeiten in gleichwahrscheinlichen Situationen bestimmen und Ergebnisse tabellarisch oder grafisch auswerten.'
const previousDescriptionEn = 'The learner can describe Laplace experiments, determine probabilities in equiprobable situations, and evaluate results in tables or graphs.'
const descriptionDe = 'Die lernende Person kann anhand der Versuchsanordnung begründen, ob ein einfaches Zufallsexperiment als Laplace-Experiment modelliert werden kann, seine Ergebnismenge und Ereignisse tabellarisch oder grafisch darstellen sowie im Laplace-Fall theoretische Ereigniswahrscheinlichkeiten als Anteil der günstigen an allen möglichen gleichwahrscheinlichen Elementarergebnissen bestimmen und deuten.'
const descriptionEn = "The learner can use the setup of a simple random experiment to justify whether it can be modelled as a Laplace experiment, represent its sample space and events in a table or graph, and, in the Laplace case, determine and interpret theoretical event probabilities as the proportion of favourable outcomes among all possible equally likely elementary outcomes."

const empiricalFrequencyGoalId = '8823e26e-694c-581b-9adf-4db7db6f43c9'
const simulationGoalId = '4aa70ad4-171d-5671-a864-c0c7758fa0ed'
const largeNumbersGoalId = 'b7cc2fc4-c695-5a97-93b0-3a619c632ca8'

function abs(path: string) {
  return resolve(repoRoot, path)
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as JsonRecord
}

function readJsonl(path: string): JsonRecord[] {
  return readFileSync(abs(path), 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
}

function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function reviewFingerprint(goal: JsonRecord, ruleVersion: string): string {
  const dimensionTags = goal.dimensionTags as JsonRecord | undefined
  const payload = stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText(goal.titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText(goal.descriptionEn),
    phase: normalizeText(dimensionTags?.phase),
    area: normalizeText(dimensionTags?.area),
    topicCode: normalizeText(dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function replaceMappingRows(
  rows: JsonRecord[],
  key: 'legacyGoalId',
  sourceGoalId: string,
  canonicalGoalIds: string[],
  withReviewDecisionId: boolean,
) {
  const indices = rows.map((row, index) => row[key] === sourceGoalId ? index : -1).filter((index) => index >= 0)
  if (indices.length === 0) throw new Error(`Missing mapping row for ${sourceGoalId}`)
  const first = indices[0]
  const template = rows[first]
  const replacements = canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: sourceGoalId,
    canonicalGoalId,
    matchType: 'partial',
    ...(withReviewDecisionId ? { reviewDecisionId: sourceGoalId } : {}),
  }))
  rows.splice(first, indices.length, ...replacements)
  if (template.matchType !== 'partial') throw new Error(`Unexpected match type for ${sourceGoalId}`)
}

function updateDecision(
  decisions: JsonRecord[],
  sourceGoalId: string,
  canonicalGoalIds: string[],
  rationale: string,
) {
  const decision = decisions.find((entry) => entry.sourceGoalId === sourceGoalId)
  if (!decision) throw new Error(`Missing review decision for ${sourceGoalId}`)
  decision.canonicalGoalIds = canonicalGoalIds
  decision.matchType = 'partial'
  decision.rationale = rationale
  decision.reviewedAt = reviewedAt
  decision.reviewer = reviewer
  decision.evidence = {
    ...((decision.evidence as JsonRecord | undefined) ?? {}),
    method: 'b027-description-scope-reconciliation',
    reconciledGoalId: goalId,
  }
}

const outputs = new Map<string, string>()

const canonical = readJson(paths.canonical)
const goal = (canonical.goals as JsonRecord[]).find((entry) => entry.id === goalId)
if (!goal) throw new Error(`Missing canonical goal ${goalId}`)
const matchesPrevious = goal.description === previousDescriptionDe && goal.descriptionEn === previousDescriptionEn
const matchesFinal = goal.description === descriptionDe && goal.descriptionEn === descriptionEn
if (!matchesPrevious && !matchesFinal) throw new Error(`Unexpected current bilingual description for ${goalId}`)
goal.description = descriptionDe
goal.descriptionEn = descriptionEn
const visualizationLink = (goal.resourceLinks as JsonRecord[] | undefined)?.find((entry) => entry.type === 'goal-visualization')
if (!visualizationLink) throw new Error(`Missing goal visualization link for ${goalId}`)
visualizationLink.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${descriptionDe}`
outputs.set(paths.canonical, `${JSON.stringify(canonical, null, 2)}\n`)

const semanticKinds = readJson(paths.semanticKinds)
const semanticKind = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
if (!semanticKind || semanticKind.semanticKind !== 'curricularAtomic' || semanticKind.decisionStatus !== 'authoritative') {
  throw new Error(`Missing authoritative curricularAtomic decision for ${goalId}`)
}
semanticKind.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
outputs.set(paths.semanticKinds, `${JSON.stringify(semanticKinds, null, 2)}\n`)

const atomicity = readJsonl(paths.atomicity)
const atomicityRecord = atomicity.find((entry) => entry.goalId === goalId)
if (!atomicityRecord) throw new Error(`Missing semantic-atomicity record for ${goalId}`)
Object.assign(atomicityRecord, {
  fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
  status: 'atomic',
  semanticAtomic: true,
  reviewedAt,
  reviewer,
  reason: 'Die begründete Modellwahl, die Darstellung von Ergebnismenge und Ereignis sowie die daraus folgende theoretische Laplace-Wahrscheinlichkeit bilden eine zusammenhängende Auswertungskette; empirische Häufigkeiten bleiben ausdrücklich in getrennten Lernzielen.',
  suggestedSplit: [],
})
outputs.set(paths.atomicity, `${atomicity.map((record) => JSON.stringify(record)).join('\n')}\n`)

const memory = readJsonl(paths.memory)
const memoryRecord = memory.find((entry) => entry.goalId === goalId)
if (!memoryRecord) throw new Error(`Missing memory-review record for ${goalId}`)
Object.assign(memoryRecord, {
  fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
  status: 'memory_required',
  memoryUseful: true,
  reviewedAt,
  reviewer,
  reason: 'Die Bedingung gleichwahrscheinlicher Elementarergebnisse und das Verhältnis günstig zu möglich sind ein enger Abrufbaustein; Modellwahl, Darstellung, Deutung und Transfer verbleiben im gewöhnlichen Lernziel und in Aufgaben.',
})
outputs.set(paths.memory, `${memory.map((record) => JSON.stringify(record)).join('\n')}\n`)

const byReview = readJson(paths.byReview)
replaceMappingRows(byReview.mappings as JsonRecord[], 'legacyGoalId', '40b2829a-35fd-5e6e-96ba-20ec6928940d', [empiricalFrequencyGoalId, simulationGoalId], true)
replaceMappingRows(byReview.mappings as JsonRecord[], 'legacyGoalId', 'by-math-m8-5-40b2829a-s02-ecb5961c3d', [largeNumbersGoalId], true)
replaceMappingRows(byReview.mappings as JsonRecord[], 'legacyGoalId', 'by-math-m8-5-40b2829a-s03-a2262e2861', [empiricalFrequencyGoalId], true)
updateDecision(
  byReview.decisions as JsonRecord[],
  '40b2829a-35fd-5e6e-96ba-20ec6928940d',
  [empiricalFrequencyGoalId, simulationGoalId],
  'Relative Häufigkeiten aus selbst durchgeführten Zufallsexperimenten und ihre softwaregestützte Auswertung werden durch die kanonischen Ziele zu empirischen Häufigkeiten und Simulationen abgedeckt; das theoretische Laplace-Ziel wird nicht mehr als Ersatz für empirische Auswertung verwendet.',
)
updateDecision(
  byReview.decisions as JsonRecord[],
  'by-math-m8-5-40b2829a-s02-ecb5961c3d',
  [largeNumbersGoalId],
  'Die Aussage des empirischen Gesetzes der großen Zahlen ist exakt im eigenständigen kanonischen Lernziel verankert und wird nicht dem theoretischen Laplace-Ziel zugerechnet.',
)
updateDecision(
  byReview.decisions as JsonRecord[],
  'by-math-m8-5-40b2829a-s03-a2262e2861',
  [empiricalFrequencyGoalId],
  'Relative Häufigkeiten als Schätzwerte für Wahrscheinlichkeiten gehören zum eigenständigen kanonischen Ziel für empirische Häufigkeiten und bleiben vom theoretischen Laplace-Modell getrennt.',
)
outputs.set(paths.byReview, `${JSON.stringify(byReview, null, 2)}\n`)

const byMapping = readJson(paths.byMapping)
replaceMappingRows(byMapping.mappings as JsonRecord[], 'legacyGoalId', '40b2829a-35fd-5e6e-96ba-20ec6928940d', [empiricalFrequencyGoalId, simulationGoalId], false)
outputs.set(paths.byMapping, `${JSON.stringify(byMapping, null, 2)}\n`)

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) throw new Error(`Adjudication drift in ${path}; run with --write`)
}

console.log(`CHECK apply_math_batch_027_laplace_adjudication ${writeMode ? 'WRITE' : 'PASS'} files=${outputs.size}`)
