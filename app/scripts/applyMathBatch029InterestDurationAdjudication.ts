import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowedArguments = new Set(['--write'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)

const goalId = 'fc34449a-fbf4-574c-884f-ecdf48b42d2e'
const reviewedAt = '2026-09-02'
const reviewer = 'codex-mathematics-b029-interest-duration-adjudication-2026-09-02'
const beforeDe = 'Die lernende Person kann mit einer Tabellenkalkulation die Laufzeit in einfachen Finanzsituationen näherungsweise bestimmen und das Ergebnis im Kontext prüfen.'
const beforeEn = 'The learner can use a spreadsheet to estimate duration in simple financial situations and check the result in context.'
const afterDe = 'Die lernende Person kann mit einer Tabellenkalkulation die Laufzeit in einfachen Finanzsituationen als Anzahl der Zins- oder Zahlungsperioden näherungsweise bestimmen und das Ergebnis im Kontext prüfen.'
const afterEn = 'The learner can use a spreadsheet to estimate the term in simple financial situations as a number of interest or payment periods and check the result in context.'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
} as const

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as JsonRecord
}

function readJsonl(path: string): JsonRecord[] {
  return readFileSync(abs(path), 'utf8')
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JsonRecord)
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function serializeJsonl(records: JsonRecord[]): string {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
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

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function goalReviewFingerprint(goal: JsonRecord, ruleVersion: string): string {
  return sha256(stableJson({
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
}

function updatePromptBinding(bytes: string, goal: JsonRecord): string {
  if (!bytes.includes(`SkillPilot-ID: \`${goal.id}\``)) {
    throw new Error(`${goal.id}: visualization prompt is not ID-bound`)
  }
  let titleBindingCount = 0
  let descriptionBindingCount = 0
  const lines = bytes.split(/\r?\n/u).map((line) => {
    if (/^# (?:Lernzielvisualisierung|Bildrekonstruktionsprompt): /u.test(line)) {
      return line.replace(/: .*$/u, `: ${goal.title}`)
    }
    if (/^- Titel: /u.test(line) || /^Titel: /u.test(line)) {
      titleBindingCount += 1
      return `${line.startsWith('- ') ? '- ' : ''}Titel: ${goal.title}`
    }
    if (/^- Beschreibung: /u.test(line) || /^Beschreibung: /u.test(line)) {
      descriptionBindingCount += 1
      return `${line.startsWith('- ') ? '- ' : ''}Beschreibung: ${goal.description}`
    }
    return line
  })
  if (titleBindingCount === 0 || descriptionBindingCount === 0) {
    throw new Error(`${goal.id}: incomplete title/description binding in visualization prompt`)
  }
  return lines.join('\n')
}

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
const goal = (canonical.goals as JsonRecord[]).find((entry) => entry.id === goalId)
if (!goal) throw new Error(`Missing canonical goal ${goalId}`)
const matchesBefore = goal.description === beforeDe && goal.descriptionEn === beforeEn
const matchesAfter = goal.description === afterDe && goal.descriptionEn === afterEn
if (!matchesBefore && !matchesAfter) throw new Error(`${goalId}: bilingual description is outside the bounded states`)

goal.description = afterDe
goal.descriptionEn = afterEn
const visualizationLinks = (goal.resourceLinks as JsonRecord[] | undefined)
  ?.filter((link) => link.type === 'goal-visualization') ?? []
if (visualizationLinks.length !== 0) throw new Error(`${goalId}: expected no materialized visualization link`)
outputs.set(paths.canonical, serializeJson(canonical))

const semanticKinds = readJson(paths.semanticKinds)
const semanticKind = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
if (!semanticKind || semanticKind.semanticKind !== 'curricularAtomic' || semanticKind.decisionStatus !== 'authoritative') {
  throw new Error(`${goalId}: missing authoritative curricularAtomic decision`)
}
semanticKind.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const atomicityRecord = atomicity.find((entry) => entry.goalId === goalId)
if (!atomicityRecord) throw new Error(`${goalId}: missing semantic-atomicity record`)
Object.assign(atomicityRecord, {
  fingerprint: goalReviewFingerprint(goal, 'semantic-atomicity-v1'),
  status: 'atomic',
  semanticAtomic: true,
  reviewedAt,
  reviewer,
  reason: 'Die Laufzeit als Zahl der Zins- oder Zahlungsperioden und ihre kontextbezogene Prüfung bilden dieselbe tabellarische inverse Parameterbestimmung; kein unabhängiges Teilziel wird mitgeführt.',
  suggestedSplit: [],
})
outputs.set(paths.atomicity, serializeJsonl(atomicity))

const memory = readJsonl(paths.memory)
const memoryRecord = memory.find((entry) => entry.goalId === goalId)
if (!memoryRecord || memoryRecord.status !== 'no_memory_needed') {
  throw new Error(`${goalId}: expected no_memory_needed review`)
}
Object.assign(memoryRecord, {
  fingerprint: goalReviewFingerprint(goal, 'memory-card-review-v1'),
  memoryUseful: false,
  reviewedAt,
  reviewer,
  reason: 'Die Laufzeit muss aus dem periodischen Tabellenverlauf eingegrenzt, mit einer Zeiteinheit verbunden und im Finanzkontext gedeutet werden; diese Modellierungsleistung wird durch Aufgabenpraxis statt durch eine eigene Memorycard aufgebaut.',
})
delete memoryRecord.memoryGoalIds
delete memoryRecord.deckIds
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationQaRecord = (visualizationQa.records as JsonRecord[]).find((entry) => entry.goalId === goalId)
if (!visualizationQaRecord || visualizationQaRecord.visualizationState !== 'missing') {
  throw new Error(`${goalId}: expected deferred missing-visualization QA record`)
}
visualizationQaRecord.title = goal.title
visualizationQaRecord.description = goal.description
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

const visualizationDirectory = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}`
const promptFiles = readdirSync(abs(visualizationDirectory)).filter((name) => name.endsWith('prompt.de.md')).sort()
if (promptFiles.length !== 1 || promptFiles[0] !== 'prompt.de.md') {
  throw new Error(`${goalId}: expected exactly the deferred provider prompt`)
}
for (const name of promptFiles) {
  const path = `${visualizationDirectory}/${name}`
  outputs.set(path, updatePromptBinding(readFileSync(abs(path), 'utf8'), goal))
}

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) {
    throw new Error(`Mathematics B029 duration adjudication drift in ${path}; run with --write`)
  }
}

console.log(`CHECK apply_math_batch_029_interest_duration_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=1 files=${outputs.size}`)
