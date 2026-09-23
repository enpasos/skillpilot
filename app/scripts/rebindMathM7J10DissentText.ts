import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CanonicalAuthoringGoal } from '../src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type ReviewedGoal = {
  id: string
  descriptionDe: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
  memoryStatus: 'no_memory_needed' | 'memory_required'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unexpected = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
} as const
const reviewedAt = '2026-09-23'
const reviewer = 'codex-math-m7-j10-targeted-dissent-text-2026-09-23'
const reviewedGoals: ReviewedGoal[] = [
  {
    id: '31207307-0cf9-4a56-bf14-90196dc2b3d4',
    descriptionDe: 'Die lernende Person kann exponentielle Wachstums- und Zerfallsprozesse in Graphen, Tabellen und Sachsituationen am konstanten Faktor bei gleich großen Schritten erkennen und passende Exponentialfunktionen begründet zuordnen.',
    descriptionEn: 'The learner can recognize exponential growth and decay processes in graphs, tables, and real-world contexts by a constant factor over equal steps and justify the match to suitable exponential functions.',
    atomicityReason: 'Konstanter Faktor und begründete Zuordnung verbinden dieselbe exponentielle Struktur über Graph, Tabelle und Kontext; die gesonderte Parameterbestimmung ist nicht Teil dieses Ziels.',
    memoryReason: 'Die Zuordnung exponentieller Modelle zu neuen Darstellungen und Sachsituationen verlangt Deutung und Begründung; ein eigenes Memory-Deck ist dafür nicht erforderlich.',
    memoryStatus: 'no_memory_needed',
  },
  {
    id: 'c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7',
    descriptionDe: 'Die lernende Person kann Funktionsgleichungen exponentieller Funktionen lesen, ihre Parameter aus gegebenen Werten oder Darstellungen bestimmen und Anfangswert sowie Wachstums- oder Zerfallsfaktor im Kontext deuten.',
    descriptionEn: 'The learner can read equations of exponential functions, determine their parameters from given values or representations, and interpret the initial value and growth or decay factor in context.',
    atomicityReason: 'Parameter aus Werten bestimmen und als Anfangswert beziehungsweise Schritt-Faktor deuten sind zwei Seiten derselben Modellinterpretation.',
    memoryReason: 'Die Parameterrollen müssen an neuen Gleichungen, Werten und Kontexten erschlossen werden; hierfür ist keine zusätzliche Memory-Karte erforderlich.',
    memoryStatus: 'no_memory_needed',
  },
  {
    id: '3c1d6ce7-099e-4267-9ff2-3d1526209a89',
    descriptionDe: 'Die lernende Person kann den Logarithmus für eine positive Basis ungleich 1 und ein positives Argument als Umkehroperation des Potenzierens erläutern und in einfachen Fällen Werte mithilfe der Definition, sonst mit digitalen Werkzeugen bestimmen.',
    descriptionEn: 'The learner can explain the logarithm for a positive base other than 1 and a positive argument as the inverse of exponentiation, determine simple values from the definition, and use digital tools for other values.',
    atomicityReason: 'Definitionsbereich, Umkehrbeziehung und einfache Wertbestimmung bilden eine zusammenhängende Einführung in den Logarithmus; das Ziel fordert keine eigenständige allgemeine Logarithmenrechnung.',
    memoryReason: 'Die kompakte Logarithmusdefinition mit positiver Basis ungleich 1 und positivem Argument ist weiterhin ein begrenzter Memory-Anteil; die beiden aktiven Karten enthalten diese Bedingungen bereits, während Verständnis und Anwendung im Lernziel bleiben.',
    memoryStatus: 'memory_required',
  },
  {
    id: '3010d965-b9b9-4dc5-9d04-d706725e9a30',
    descriptionDe: 'Die lernende Person kann exponentielle Zu- und Abnahme als Änderung mit konstantem Faktor je gleich großem Schritt beschreiben, veranschaulichen und von linearer Änderung mit konstanter Differenz begründet abgrenzen.',
    descriptionEn: 'The learner can describe and illustrate exponential increase and decrease as change by a constant factor per equal step and justify the distinction from linear change by a constant difference.',
    atomicityReason: 'Der Vergleich von konstantem Faktor und konstanter Differenz operationalisiert eine einzige begründete Modellunterscheidung, nicht mehrere unabhängige Rechenverfahren.',
    memoryReason: 'Die Entscheidung zwischen linearer und exponentieller Änderung muss aus neuen Werten, Graphen und Sachverhalten begründet werden; ein eigenes Memory-Deck ist nicht erforderlich.',
    memoryStatus: 'no_memory_needed',
  },
  {
    id: '1ce8af38-082a-477b-af48-b924c92761bf',
    descriptionDe: 'Die lernende Person kann bei einfachen ganzrationalen Funktionen Term und Graph anhand charakteristischer Merkmale wie Nullstellen und Endverhalten einander zuordnen und den Zusammenhang beschreiben.',
    descriptionEn: 'The learner can match expressions and graphs of simple polynomial functions using characteristic features such as zeros and end behavior, and describe their relationship.',
    atomicityReason: 'Nullstellen und Endverhalten dienen als Merkmale für eine einzige Term-Graph-Zuordnung in einfachen Fällen; separate Kurvendiskussion oder Ableitungsrechnung wird nicht eingeführt.',
    memoryReason: 'Die Zuordnung eines neuen Polynomterms zu einem Graphen erfordert strukturbezogene Deutung statt isoliertes Faktenlernen; ein eigenes Memory-Deck ist nicht gerechtfertigt.',
    memoryStatus: 'no_memory_needed',
  },
  {
    id: 'ad66009f-55fb-563f-ace0-dbfeae7c76c3',
    descriptionDe: 'Die lernende Person kann in einfachen Fällen das Krümmungsverhalten über das Vorzeichen der zweiten Ableitung beschreiben und Wendestellen durch einen Wechsel dieses Vorzeichens begründen.',
    descriptionEn: 'The learner can describe curvature in simple cases using the sign of the second derivative and justify inflection points by a change in that sign.',
    atomicityReason: 'Das Vorzeichen von f″ und sein Wechsel beschreiben dieselbe Krümmungsanalyse; die Revision vermeidet, f″=0 allein als hinreichendes Wendekriterium zu behandeln.',
    memoryReason: 'Eine Wendestelle muss an einem neuen Funktionsverlauf über den Krümmungswechsel begründet werden; reines Erinnern an f″=0 genügt gerade nicht, daher kein eigenes Memory-Deck.',
    memoryStatus: 'no_memory_needed',
  },
  {
    id: 'f76d00dc-6b31-59cd-b01a-3610eadc9908',
    descriptionDe: 'Die lernende Person kann für differenzierbare Funktionen aus f′(x) > 0 bzw. f′(x) < 0 an jeder Stelle eines Intervalls strenge Monotonie folgern und mit einem Gegenbeispiel begründen, warum strenge Monotonie nicht an jeder Stelle eine strikt positive bzw. negative Ableitung erzwingt.',
    descriptionEn: 'The learner can infer strict monotonicity for differentiable functions from f′(x) > 0 or f′(x) < 0 throughout an interval and use a counterexample to explain why strict monotonicity does not require a strictly positive or negative derivative at every point.',
    atomicityReason: 'Satz und Gegenbeispiel prüfen gemeinsam das Verständnis der gerichteten Implikation zwischen strengem Ableitungsvorzeichen und strenger Monotonie; sie behaupten keine falsche Umkehrung für nichtstrenge Varianten.',
    memoryReason: 'Die Nichtumkehrbarkeit muss an einem neuen Gegenbeispiel begründet werden; die reine Erinnerung an den Satz wäre kein ausreichender Leistungsnachweis und rechtfertigt kein eigenes Deck.',
    memoryStatus: 'no_memory_needed',
  },
]

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const digest = (value: string | Uint8Array): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const reviewFingerprint = (goal: CanonicalAuthoringGoal, ruleVersion: string): string => digest(stableJson({
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
}))

const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced') throw new Error('Unexpected Mathematics landscape')
const goals = canonical.goals as CanonicalAuthoringGoal[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
const semanticKinds = readJson(paths.semanticKinds)
const semanticById = new Map((semanticKinds.decisions as JsonRecord[]).map((record) => [String(record.goalId), record]))
const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))

for (const revision of reviewedGoals) {
  const goal = goalById.get(revision.id)
  if (!goal || goal.description !== revision.descriptionDe || goal.descriptionEn !== revision.descriptionEn) {
    throw new Error(`${revision.id}: canonical text outside the reviewed exact state`)
  }
  const visualizationLinks = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
    .filter((link) => link.type === 'goal-visualization')
  if (visualizationLinks.length !== 1 || !String(visualizationLinks[0].altText ?? '').endsWith(revision.descriptionDe)) {
    throw new Error(`${revision.id}: visualization alt text does not reflect the reviewed description`)
  }

  const semantic = semanticById.get(revision.id)
  if (!semantic || semantic.semanticKind !== 'curricularAtomic' || semantic.decisionStatus !== 'authoritative') {
    throw new Error(`${revision.id}: missing authoritative curricularAtomic decision`)
  }
  semantic.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  // Keep the schema-authorized decision basis. The exact reason for this
  // targeted recheck is recorded in the adjacent A/M review decisions.
  if (semantic.decisionBasis !== 'reviewed-current-pilot-curricular-atomic') {
    throw new Error(`${revision.id}: unexpected semantic-kind decision basis`)
  }

  const atomic = atomicityById.get(revision.id)
  if (!atomic || atomic.status !== 'atomic' || atomic.semanticAtomic !== true) {
    throw new Error(`${revision.id}: missing atomic decision`)
  }
  Object.assign(atomic, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
  })

  const memoryRecord = memoryById.get(revision.id)
  if (!memoryRecord || memoryRecord.status !== revision.memoryStatus) {
    throw new Error(`${revision.id}: unexpected memory suitability status`)
  }
  if (revision.memoryStatus === 'memory_required') {
    if (memoryRecord.memoryUseful !== true
      || !Array.isArray(memoryRecord.memoryGoalIds)
      || !Array.isArray(memoryRecord.deckIds)
      || stableJson([...(memoryRecord.memoryGoalIds as string[])].sort()) !== stableJson([
        '77259806-add7-5fcb-b89c-376e1b0c88d6',
        '4eefbd04-9e49-41ea-a087-9ad6ac71ec5a',
      ].sort())
      || stableJson([...(memoryRecord.deckIds as string[])].sort()) !== stableJson([
        'de_gymnasium_math_functions_basics',
        'de_gymnasium_math_seki_core',
      ].sort())) {
      throw new Error(`${revision.id}: memory-required card trace changed`)
    }
  } else if (memoryRecord.memoryUseful !== false) {
    throw new Error(`${revision.id}: no-memory decision changed`)
  }
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}

const outputs = new Map<string, string>([
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
])
const changed = [...outputs].filter(([path, value]) => readFileSync(absolute(path), 'utf8') !== value)
if (!writeMode && changed.length > 0) {
  throw new Error(`J10 targeted text bindings are not current: ${changed.map(([path]) => path).join(', ')}`)
}
if (writeMode) changed.forEach(([path, value]) => writeFileSync(absolute(path), value, 'utf8'))
console.log(`CHECK rebind_math_m7_j10_dissent_text ${writeMode ? 'WRITE' : 'PASS'} goals=${reviewedGoals.length} changed=${changed.length}`)
