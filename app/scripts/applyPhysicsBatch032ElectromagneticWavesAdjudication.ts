import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type Revision = {
  id: string
  beforeDe: string
  beforeEn: string
  afterDe: string
  afterEn: string
  atomicityReason: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unexpected = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const
const reviewedAt = '2026-09-05'
const reviewer = 'codex-physics-b032-electromagnetic-waves-dual-review-adjudication-2026-09-05'

const revisions: Revision[] = [
  {
    id: '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    beforeDe: 'Die lernende Person kann das Spektrum elektromagnetischer Wellen darstellen, typische Frequenzbereiche benennen und zugeordneten technischen Anwendungen Beispiele zuordnen.',
    beforeEn: 'The learner can represent the spectrum of electromagnetic waves, name typical frequency ranges, and assign examples to associated technical applications.',
    afterDe: 'Die lernende Person kann das elektromagnetische Spektrum nach Frequenz und Wellenlänge geordnet darstellen, typische Bereiche einordnen, technische Anwendungen passenden Spektralbereichen zuordnen und die Zuordnung anhand relevanter Welleneigenschaften begründen.',
    afterEn: 'The learner can represent the electromagnetic spectrum ordered by frequency and wavelength, classify typical regions, assign technical applications to appropriate spectral regions, and justify the assignment using relevant wave properties.',
    atomicityReason: 'Spektrumsordnung, Bereichseinordnung und begründete Anwendungszuordnung sind koordinierte Darstellungen derselben fachlichen Spektrumskompetenz und gemeinsam in einer Transferaufgabe prüfbar.',
  },
  {
    id: '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
    beforeDe: 'Die lernende Person kann lineare Polarisation von Licht beschreiben, den Begriff der Schwingungsebene einführen und einfache Anwendungen polarisierender Elemente erläutern.',
    beforeEn: 'The learner can describe linear polarization of light, introduce the concept of the plane of vibration, and explain simple applications of polarizing elements.',
    afterDe: 'Die lernende Person kann lineare Polarisation von Licht anhand der festen Schwingungsrichtung des elektrischen Feldes beschreiben, die zugehörige Schwingungsebene kennzeichnen und einfache Anwendungen polarisierender Elemente erläutern.',
    afterEn: 'The learner can describe linear polarization of light in terms of the fixed oscillation direction of the electric field, identify the associated plane of vibration, and explain simple applications of polarizing elements.',
    atomicityReason: 'Elektrische Feldrichtung, Schwingungsebene und die Wirkung polarisierender Elemente bilden ein zusammenhängendes Modell linearer Polarisation und keine voneinander unabhängigen Routinen.',
  },
  {
    id: '4c919da9-157a-5a14-a725-f7343975c9ab',
    beforeDe: 'Die lernende Person kann stehende elektromagnetische Wellen im eindimensionalen Fall qualitativ beschreiben und Beispiele für Resonatoren benennen.',
    beforeEn: 'The learner can qualitatively describe standing electromagnetic waves in the one-dimensional case and name examples of resonators.',
    afterDe: 'Die lernende Person kann eindimensionale stehende elektromagnetische Wellen als Überlagerung gegenläufiger Wellen mit festen Knoten und Bäuchen erklären und Resonatorbeispiele über ihre Randbedingungen einordnen.',
    afterEn: 'The learner can explain one-dimensional standing electromagnetic waves as the superposition of counter-propagating waves with fixed nodes and antinodes and classify resonator examples by their boundary conditions.',
    atomicityReason: 'Überlagerung, ortsfeste Knoten und Bäuche sowie Resonatorrandbedingungen bilden gemeinsam das eindimensionale Modell einer stehenden elektromagnetischen Welle.',
  },
  {
    id: 'f6a3a602-1e45-5018-b0ff-3d49933cf634',
    beforeDe: 'Die lernende Person kann Intensitätsverteilung und Maxima/Minima eines Einzelspalts bestimmen.',
    beforeEn: 'The learner can determine intensity distribution and maxima/minima of a single slit.',
    afterDe: 'Die lernende Person kann die Intensitätsverteilung im Fraunhofer-Beugungsbild eines Einzelspalts modellieren und die Lagen seiner Minima sowie der Maxima mit angemessenen Näherungen bestimmen.',
    afterEn: 'The learner can model the intensity distribution in the Fraunhofer diffraction pattern of a single slit and determine the positions of its minima and maxima using appropriate approximations.',
    atomicityReason: 'Intensitätsverteilung, Minima und näherungsweise Maximalagen sind gekoppelte Aussagen desselben Fraunhofer-Einzelspaltmodells und in einer zusammenhängenden Auswertung prüfbar.',
  },
  {
    id: 'd1e26b52-78a7-5f3b-ac9f-97f3e62d7db1',
    beforeDe: 'Die lernende Person kann Funktionsweise eines Interferometers erläutern und Auswertungen durchführen.',
    beforeEn: 'The learner can explain the operating principle of an interferometer and perform evaluations.',
    afterDe: 'Die lernende Person kann die Funktionsweise eines Interferometers über die Aufteilung kohärenten Lichts auf unterschiedliche optische Wege und seine Überlagerung erklären und aus Änderungen des Interferenzsignals optische Weglängenunterschiede bestimmen.',
    afterEn: 'The learner can explain how an interferometer works by splitting coherent light along different optical paths and recombining it, and determine optical path-length differences from changes in the interference signal.',
    atomicityReason: 'Strahlaufteilung, optische Wegdifferenz, Überlagerung und Messsignal sind aufeinander bezogene Schritte eines einzigen interferometrischen Messprinzips.',
  },
]

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  }
  return JSON.stringify(value)
}
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => `sha256:${sha256(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.phase),
  area: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.area),
  topicCode: normalizeText((goal.dimensionTags as JsonRecord | undefined)?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}))}`
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const canonical = readJson(paths.canonical)
const goals = canonical.goals as JsonRecord[]
assert(canonical.subject === 'Physik' && Array.isArray(goals), 'Unexpected canonical Physics landscape')
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
const visualizationQa = readJson(paths.visualizationQa)
const visualizationRecords = visualizationQa.records as JsonRecord[]
assert(Array.isArray(semanticDecisions) && Array.isArray(visualizationRecords), 'Required Physics ledgers are invalid')

const prompts = new Map<string, string>()
for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  assert(goal, `${revision.id}: canonical goal missing`)
  const currentDe = String(goal.description)
  const currentEn = String(goal.descriptionEn)
  assert(
    (currentDe === revision.beforeDe && currentEn === revision.beforeEn)
      || (currentDe === revision.afterDe && currentEn === revision.afterEn),
    `${revision.id}: canonical description outside bounded before/after state`,
  )
  goal.description = revision.afterDe
  goal.descriptionEn = revision.afterEn

  const semantic = semanticDecisions.find((record) => record.goalId === revision.id)
  assert(semantic?.semanticKind === 'curricularAtomic' && semantic.decisionStatus === 'authoritative', `${revision.id}: semantic-kind record missing`)
  semantic.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)

  const atomic = atomicity.find((record) => record.goalId === revision.id)
  assert(atomic?.ruleVersion === 'semantic-atomicity-v1', `${revision.id}: atomicity record missing`)
  Object.assign(atomic, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })

  const memoryRecord = memory.find((record) => record.goalId === revision.id)
  assert(memoryRecord?.ruleVersion === 'memory-card-review-v1', `${revision.id}: memory-review record missing`)
  memoryRecord.fingerprint = reviewFingerprint(goal, 'memory-card-review-v1')
  memoryRecord.reviewedAt = reviewedAt
  memoryRecord.reviewer = reviewer

  const visualization = visualizationRecords.find((record) => record.goalId === revision.id)
  assert(visualization, `${revision.id}: visualization-QA record missing`)
  visualization.description = revision.afterDe

  const promptPath = `curricula/DE/Gymnasium/visualizations/physik/${revision.id}/prompt.de.md`
  let prompt = readFileSync(absolute(promptPath), 'utf8')
  if (prompt.includes(revision.beforeDe)) prompt = prompt.split(revision.beforeDe).join(revision.afterDe)
  assert(prompt.includes(revision.afterDe) && !prompt.includes(revision.beforeDe), `${revision.id}: prompt description binding failed`)
  prompts.set(promptPath, prompt)
}

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
  [paths.visualizationQa, serializeJson(visualizationQa)],
  ...prompts,
])
const changed = [...outputs].filter(([path, content]) => readFileSync(absolute(path), 'utf8') !== content)

if (writeMode) {
  execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
  changed.forEach(([path, content]) => writeFileSync(absolute(path), content, 'utf8'))
} else if (changed.length > 0) {
  throw new Error(`B032 adjudication is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}

console.log(`CHECK apply_physics_batch032_electromagnetic_waves_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=${revisions.length} changed=${changed.length}`)
