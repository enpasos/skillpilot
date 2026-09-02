import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

type Revision = {
  beforeDe: string
  beforeEn: string
  afterDe: string
  afterEn: string
  beforeRequires: string[]
  afterRequires: string[]
  expectedVisualizationLinks: number
  expectedPromptFiles: number
  atomicityReason: string
  memoryStatus: 'memory_required' | 'no_memory_needed'
  memoryReason: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowedArguments = new Set(['--write'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)

const reviewedAt = '2026-09-02'
const reviewer = 'codex-physics-b030-charge-magnetism-adjudication-2026-09-02'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const

const revisions: Record<string, Revision> = {
  'a6e48b88-51ed-5942-bdb8-8d2192652e0d': {
    beforeDe: 'Phänomenologischer Einstieg: Anziehung und Abstoßung, Ladungstrennung durch Reibung (Ballon, Haare) und der qualitative Kraftbegriff.',
    beforeEn: 'Phenomenological entry: attraction and repulsion, charge separation through friction (balloon, hair), and the qualitative concept of force.',
    afterDe: 'Die lernende Person kann Anziehung und Abstoßung elektrisch geladener Körper sowie Ladungstrennung durch Reibung phänomenologisch untersuchen und die beobachteten Wechselwirkungen mit einem qualitativen Kraftbegriff beschreiben.',
    afterEn: 'The learner can phenomenologically investigate attraction and repulsion between electrically charged bodies and charge separation through friction, and describe the observed interactions using a qualitative concept of force.',
    beforeRequires: ['5c44b9ba-9b05-4774-95d5-073230d3fc4f'],
    afterRequires: ['5c44b9ba-9b05-4774-95d5-073230d3fc4f'],
    expectedVisualizationLinks: 0,
    expectedPromptFiles: 1,
    atomicityReason: 'Anziehung, Abstoßung und Ladungstrennung werden in einem zusammenhängenden phänomenologischen Untersuchungsgang mit demselben qualitativen Kraftbegriff beschrieben; kein unabhängiges Teilziel wird mitgeführt.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Das Ziel wird durch Beobachtung, Vergleich und qualitative Beschreibung elektrischer Wechselwirkungen aufgebaut; eine isolierte Merkkarte ersetzt diese phänomenologische Untersuchung nicht.',
  },
  '0924162b-46d0-5c56-93bc-33e1f5ac6886': {
    beforeDe: 'Die lernende Person kann in einer oberstufengerechten Modellierung erklären, wie Permanentmagnetismus aus mikroskopischen Kreisströmen/Spins und ausgerichteten Elementarmagneten entsteht, und den Zusammenhang zur makroskopischen Feldwirkung herstellen.',
    beforeEn: 'The learner can explain in an upper-secondary model how permanent magnetism arises from microscopic current loops/spins and aligned elementary magnets and connect this to macroscopic field effects.',
    afterDe: 'Die lernende Person kann in einem oberstufengerechten Modell Magnetisierung und Permanentmagnetismus durch die Ausrichtung mikroskopischer magnetischer Momente erklären und den Zusammenhang mit der makroskopischen Feldwirkung herstellen.',
    afterEn: 'The learner can use an upper-secondary-level model to explain magnetization and permanent magnetism in terms of the alignment of microscopic magnetic moments and relate this to the macroscopic field effect.',
    beforeRequires: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
    afterRequires: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
    expectedVisualizationLinks: 1,
    expectedPromptFiles: 1,
    atomicityReason: 'Die Ausrichtung mikroskopischer magnetischer Momente und ihre makroskopische Feldwirkung bilden die beiden Modellebenen derselben Erklärung von Magnetisierung und Permanentmagnetismus.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Kompetenz verlangt den erklärenden Zusammenhang zwischen mikroskopischer Ausrichtung und makroskopischer Feldwirkung; diese Modellleistung wird durch Verständnis und Anwendung statt durch eine eigene Memorycard aufgebaut.',
  },
  '9854589c-5feb-4942-b90f-311ddf36eb78': {
    beforeDe: 'Die lernende Person kann die Bewegung geladener Teilchen in homogenen magnetischen Feldern untersuchen, die Lorentzkraft fachlich nutzen und einfache Bahnformen qualitativ deuten.',
    beforeEn: 'The learner can investigate the motion of charged particles in homogeneous magnetic fields, apply the Lorentz force concept, and interpret simple trajectory shapes qualitatively.',
    afterDe: 'Die lernende Person kann vorgegebene oder simulierte Bahnen geladener Teilchen in homogenen Magnetfeldern mithilfe der Lorentzkraft vergleichen und aus Krümmung und Umlaufsinn qualitative Aussagen über Ladungsvorzeichen sowie über Änderungen von Masse, Geschwindigkeit oder Feldstärke ableiten.',
    afterEn: 'The learner can compare given or simulated trajectories of charged particles in uniform magnetic fields using the Lorentz force and infer qualitative effects of charge sign and changes in mass, speed, or field strength from curvature and direction of motion.',
    beforeRequires: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
    afterRequires: ['8c9394cb-f54a-508d-9750-4c49e31b3fa9'],
    expectedVisualizationLinks: 1,
    expectedPromptFiles: 2,
    atomicityReason: 'Der Vergleich von Bahnen und die qualitative Inferenz von Ladungsvorzeichen sowie Parameteränderungen aus Krümmung und Umlaufsinn sind zusammengehörige Auswertungen desselben Lorentzkraft-Bahnmodells.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die kompakte Lorentzkraft- und Kreisbahnbeziehung muss für den qualitativen Vergleich verfügbar sein; die Inferenz von Ladungsvorzeichen und Parameterwirkungen aus neuen Bahnen bleibt eine Verständnis- und Transferleistung.',
  },
}

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

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
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
const goals = canonical.goals as JsonRecord[]
const revisedGoals = new Map<string, JsonRecord>()

for (const [goalId, revision] of Object.entries(revisions)) {
  const goal = goals.find((entry) => entry.id === goalId)
  if (!goal) throw new Error(`Missing canonical goal ${goalId}`)

  const matchesBeforeText = goal.description === revision.beforeDe && goal.descriptionEn === revision.beforeEn
  const matchesAfterText = goal.description === revision.afterDe && goal.descriptionEn === revision.afterEn
  if (!matchesBeforeText && !matchesAfterText) {
    throw new Error(`${goalId}: bilingual description is outside the bounded states`)
  }
  if (!same(goal.requires ?? [], revision.beforeRequires) && !same(goal.requires ?? [], revision.afterRequires)) {
    throw new Error(`${goalId}: requires is outside the bounded states`)
  }

  goal.description = revision.afterDe
  goal.descriptionEn = revision.afterEn
  goal.requires = [...revision.afterRequires]

  const visualizationLinks = (goal.resourceLinks as JsonRecord[] | undefined)
    ?.filter((link) => link.type === 'goal-visualization') ?? []
  if (visualizationLinks.length !== revision.expectedVisualizationLinks) {
    throw new Error(
      `${goalId}: expected ${revision.expectedVisualizationLinks} goal-visualization links, found ${visualizationLinks.length}`,
    )
  }
  for (const link of visualizationLinks) {
    link.title = `Visualisierung: ${goal.title}`
    link.description = `Visualisierung zum Lernziel: ${goal.title}.`
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${revision.afterDe}`
  }
  revisedGoals.set(goalId, goal)
}
outputs.set(paths.canonical, serializeJson(canonical))

const semanticKinds = readJson(paths.semanticKinds)
for (const [goalId, goal] of revisedGoals) {
  const decision = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
  if (!decision || decision.semanticKind !== 'curricularAtomic' || decision.decisionStatus !== 'authoritative') {
    throw new Error(`${goalId}: missing authoritative curricularAtomic decision`)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
for (const [goalId, revision] of Object.entries(revisions)) {
  const goal = revisedGoals.get(goalId)!
  const atomicityRecord = atomicity.find((entry) => entry.goalId === goalId)
  const memoryRecord = memory.find((entry) => entry.goalId === goalId)
  if (!atomicityRecord || !memoryRecord) throw new Error(`${goalId}: missing atomicity or memory record`)

  Object.assign(atomicityRecord, {
    fingerprint: goalReviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })

  if (memoryRecord.status !== revision.memoryStatus) {
    throw new Error(`${goalId}: expected memory status ${revision.memoryStatus}, found ${String(memoryRecord.status)}`)
  }
  Object.assign(memoryRecord, {
    fingerprint: goalReviewFingerprint(goal, 'memory-card-review-v1'),
    memoryUseful: revision.memoryStatus === 'memory_required',
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
  if (revision.memoryStatus === 'memory_required') {
    if (!Array.isArray(memoryRecord.memoryGoalIds) || memoryRecord.memoryGoalIds.length === 0
      || !Array.isArray(memoryRecord.deckIds) || memoryRecord.deckIds.length === 0) {
      throw new Error(`${goalId}: missing required memory trace`)
    }
  } else {
    delete memoryRecord.memoryGoalIds
    delete memoryRecord.deckIds
  }
}
outputs.set(paths.atomicity, serializeJsonl(atomicity))
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
for (const [goalId, goal] of revisedGoals) {
  const record = (visualizationQa.records as JsonRecord[]).find((entry) => entry.goalId === goalId)
  if (!record) throw new Error(`${goalId}: missing visualization-QA record`)
  record.title = goal.title
  record.description = goal.description
}
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

for (const [goalId, revision] of Object.entries(revisions)) {
  const goal = revisedGoals.get(goalId)!
  const directory = `curricula/DE/Gymnasium/visualizations/physik/${goalId}`
  const promptFiles = readdirSync(abs(directory)).filter((name) => name.endsWith('prompt.de.md')).sort()
  if (promptFiles.length !== revision.expectedPromptFiles) {
    throw new Error(`${goalId}: expected ${revision.expectedPromptFiles} prompt files, found ${promptFiles.length}`)
  }
  for (const name of promptFiles) {
    const path = `${directory}/${name}`
    outputs.set(path, updatePromptBinding(readFileSync(abs(path), 'utf8'), goal))
  }
}

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) {
    throw new Error(`Batch030 charge/magnetism adjudication drift in ${path}; run with --write`)
  }
}

console.log(
  `CHECK apply_physics_batch_030_charge_magnetism_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=${revisedGoals.size} topologyRebindings=1 files=${outputs.size}`,
)
