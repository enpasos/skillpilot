import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded Layer-A ledgers use several legacy JSON shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && process.argv.includes('--check')) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-09-05'
const reviewedAtIso = '2026-09-05T18:30:00.000Z'
const reviewer = 'codex-mathematics-b032-adjudication-2026-09-05'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const keptGoalId = '6596405a-9728-41df-9163-53670ec2a937'
const splitRetainedId = '7676b0f9-340d-4a91-ab1f-92745a8f88db'
const splitChildShortKey = 'canonical_math_sek1_j9_real_number_extension_and_classification'
const splitChildId = 'f9e21454-857c-5a6a-8367-32a34fc0026b'
const examId = '18db552f-4740-5a64-933b-839c8ad6a55d'
const wrongRootFunctionId = '66077296-a8f8-4645-938b-7c3424cb2f14'
const correctPowerFunctionId = '30c013ac-5164-4c3c-8bc1-9a10b2f49533'
const byPowerFunctionSourceId = '33ded94e-32cc-5c9d-b583-17039df865d2'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  j9AssessmentReadme: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/README.md',
  j9DraftV1: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/draft_v1.md',
  j9DraftV2: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/draft_v2.md',
  j9SolutionV1: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/solution_v1.md',
  j9SolutionV2: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/solution_v2.md',
  j9BlueprintV1: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/blueprint.md',
  j9BlueprintV2: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/blueprint_v2.md',
  j9ReviewV2: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/simulated_review_v2.md',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  atlasNavigation: 'app/scripts/config/goal-books/navigation/de-gym-math-national-atlas.view.json',
  goalBookModelTest: 'app/scripts/testGoalBookModel.ts',
  goalBookPublicationTest: 'app/scripts/testGoalBookPublication.ts',
  bbReview: 'curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  beReview: 'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  bwReview: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  bwDirect: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
  byDirect: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  shReview: 'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  shDirect: 'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_to_canonical_math.json',
} as const

const compositionViewPaths = [
  'curricula/DE/Gymnasium/composition-views/mathematik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g9.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-lk-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-lk-g9.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-seki-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-he-seki-g9.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-gk-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-gk-g9.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-lk-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-lk-g9.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-seki-g8.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-sh-seki-g9.view.json',
] as const

type Revision = {
  id: string
  beforeDescriptionDe: string
  beforeDescriptionEn: string
  descriptionDe: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
  visualizationNote: string
}

const revisions: Revision[] = [
  {
    id: wrongRootFunctionId,
    beforeDescriptionDe: 'Die lernende Person kann typische Wurzelfunktionen graphisch untersuchen, charakteristische Verläufe beschreiben und sie mit passenden Darstellungen begründen.',
    beforeDescriptionEn: 'The learner can investigate typical root functions graphically, describe characteristic behaviour, and justify it using suitable representations.',
    descriptionDe: 'Die lernende Person kann bei grundlegenden Wurzelfunktionen Funktionsterm, Definitions- und Wertemenge sowie Graph aufeinander beziehen und charakteristische Graphenmerkmale begründen.',
    descriptionEn: 'The learner can relate the formula, domain, range, and graph of basic root functions and justify the characteristic features of their graphs.',
    atomicityReason: 'Funktionsterm, Definitions- und Wertemenge sowie Graph werden als zusammengehörige Darstellungen derselben grundlegenden Wurzelfunktion aufeinander bezogen; die Begründung charakteristischer Graphenmerkmale ist die prüfbare Verständnisleistung dieses einen Ziels.',
    memoryReason: 'Die Beziehungen zwischen Term, Mengen und Graph müssen an wechselnden Wurzelfunktionen begründet werden; ein isoliertes Memory-Deck trägt diese Darstellungs- und Transferleistung nicht.',
    visualizationNote: 'Das unveränderte Bild zeigt y = √x mit Startpunkt, Definitions- und Wertemenge sowie charakteristischen Punkten und bleibt damit zur präzisierten Relation von Term, Mengen und Graph passend.',
  },
  {
    id: '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
    beforeDescriptionDe: 'Die lernende Person kann Sinus- und Kosinuswerte für Winkel zwischen 0° und 360° am Einheitskreis veranschaulichen, Vorzeichen sicher bestimmen, zu vorgegebenen Werten passende Winkel finden und negative Taschenrechnerausgaben korrekt interpretieren.',
    beforeDescriptionEn: 'The learner can visualize sine and cosine values for angles between 0° and 360° on the unit circle, determine signs reliably, find suitable angles for given values, and interpret negative calculator outputs correctly.',
    descriptionDe: 'Die lernende Person kann Sinuswerte als y- und Kosinuswerte als x-Koordinaten zu Winkeln von 0° bis 360° am Einheitskreis deuten, ihre Vorzeichen bestimmen, zu vorgegebenen Werten passende Winkel finden und vom Taschenrechner ausgegebene negative Winkelgrößen als äquivalente Winkel im betrachteten Bereich einordnen.',
    descriptionEn: 'The learner can interpret sine values as y-coordinates and cosine values as x-coordinates on the unit circle for angles from 0° to 360°, determine their signs, find angles matching given values, and relate negative angle measures returned by a calculator to equivalent angles in the stated interval.',
    atomicityReason: 'Koordinatendeutung, Vorzeichen, passende Winkel und die Rückführung äquivalenter negativer Winkelgrößen sind aufeinander bezogene Ausführungsschritte derselben Einheitskreis-Kompetenz im festgelegten Gradmaßbereich.',
    memoryReason: 'Winkel und Koordinaten müssen am Einheitskreis gedeutet und auf äquivalente Lagen übertragen werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    visualizationNote: 'Das unveränderte Einheitskreisbild zeigt Sinus als y- und Kosinus als x-Koordinate, korrekte Vorzeichen und äquivalente Winkelpositionen; die sprachlich präzisierte Taschenrechnerausgabe erweitert den dargestellten Inhalt nicht.',
  },
  {
    id: '5bced7dc-6557-4af1-9e70-d87f850d3b7f',
    beforeDescriptionDe: 'Die lernende Person kann bei quadratischen Funktionen der Form a(x+d)^2+e die Wirkung der Parameter auf die Parabel beschreiben, die Anzahl der Nullstellen deuten und die zugehörige Gleichung in einfachen Fällen graphisch und rechnerisch einordnen.',
    beforeDescriptionEn: 'The learner can describe how the parameters in quadratic functions of the form a(x+d)^2+e affect the parabola, interpret the number of roots, and classify the corresponding equation in simple graphical and algebraic cases.',
    descriptionDe: 'Die lernende Person kann bei quadratischen Funktionen der Form f(x) = a(x + d)^2 + e mit a ≠ 0 die Wirkung von a, d und e auf Scheitelpunktlage, Öffnungsrichtung und Streckung oder Stauchung der Parabel beschreiben, daraus die Anzahl der Nullstellen begründen und die Lösungen von f(x) = 0 in einfachen Fällen graphisch und rechnerisch bestimmen.',
    descriptionEn: 'The learner can describe how a, d, and e in quadratic functions of the form f(x) = a(x + d)^2 + e, with a ≠ 0, affect the vertex position, opening direction, and vertical stretch or compression of the parabola, use this to justify the number of zeros, and determine the solutions of f(x) = 0 graphically and algebraically in simple cases.',
    atomicityReason: 'Parameterwirkung, Scheitelpunktlage und Nullstellen werden an derselben Scheitelpunktform kausal aufeinander bezogen; graphische und rechnerische Bestimmung sind zwei Darstellungen derselben einfachen Lösungssituation und keine unabhängigen Inhaltsziele.',
    memoryReason: 'Die Wirkung der Parameter und die Zahl der Nullstellen müssen aus einer neuen Scheitelpunktform begründet werden; ein eigenes Memory-Deck würde diese funktionale Einsicht nicht tragen.',
    visualizationNote: 'Für dieses Ziel war bereits kein Bild vorhanden. Die präzisierte Beschreibung wird im QA-Datensatz ohne Erzeugung eines Bildes weiter als fehlende Visualisierung geführt.',
  },
]

const retainedSplitText = {
  beforeTitleDe: 'Irrationalität von Wurzelzahlen begründen und reelle Zahlen einordnen',
  beforeTitleEn: 'Justify the irrationality of root numbers and classify real numbers',
  beforeDescriptionDe: 'Die lernende Person kann das Grundprinzip eines indirekten Beweises am Beispiel der Irrationalität einer Quadratwurzel nachvollziehen, die Erweiterung von rationalen zu reellen Zahlen begründen und irrationale Zahlen fachsprachlich einordnen.',
  beforeDescriptionEn: 'The learner can follow the basic principle of an indirect proof using the irrationality of a square root, justify the extension from rational to real numbers, and classify irrational numbers using mathematical language.',
  titleDe: 'Irrationalität von √2 indirekt begründen',
  titleEn: 'Justify the irrationality of √2 by indirect proof',
  descriptionDe: 'Die lernende Person kann beim indirekten Beweis der Irrationalität von √2 die Annahme einer vollständig gekürzten rationalen Darstellung, die daraus folgenden Teilbarkeitsaussagen und den entstehenden Widerspruch erläutern und den Widerspruch auf die Ausgangsannahme zurückführen.',
  descriptionEn: 'The learner can explain, in the indirect proof that √2 is irrational, the assumption of a rational representation in lowest terms, the resulting divisibility statements, and the contradiction, and relate that contradiction back to the initial assumption.',
}

const childGoal: JsonRecord = {
  id: splitChildId,
  shortKey: splitChildShortKey,
  title: 'Erweiterung zu den reellen Zahlen begründen und Zahlen einordnen',
  titleEn: 'Justify the extension to real numbers and classify numbers',
  description: 'Die lernende Person kann anhand irrationaler Zahlen erklären, warum der Zahlbereich der rationalen Zahlen zu den reellen Zahlen erweitert wird, und unterschiedlich dargestellte Zahlen begründet als rational oder irrational sowie als reell einordnen.',
  descriptionEn: 'The learner can use irrational numbers to explain why the rational number system is extended to the real numbers and classify numbers in different representations, with justification, as rational or irrational and as real.',
  core: true,
  weight: 1,
  tags: ['canonical'],
  dimensionTags: {
    framework: 'canonical-gymnasium-math',
    demandLevel: 'AB1',
    processCompetencies: ['K1.1', 'K5.1'],
    guidingIdeas: ['L1'],
    phase: 'J9',
    area: 'Algebra',
    topicCode: 'CANONICAL.MATH.SEK1.J9.1B2',
  },
  contains: [],
  requires: [splitRetainedId],
  applicability: {
    jurisdiction: ['DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
  },
  sourceRef: 'LehrplanPLUS Bayern Gymnasium Mathematik, M9.1',
  type: 'atomic',
  semanticAtomic: true,
}

const examTaskBefore = 'Im Materialplan treten mehrere Wurzel- und Potenzausdrücke auf.\n\n1. Vereinfache $\\sqrt{72}$, $\\sqrt{50}-\\sqrt{8}$ und $\\sqrt{12}\\cdot \\sqrt{27}$. (3 BE)\n2. Berechne $8^(1/3)$ und $16^(3/4)$ und rationalisiere $5/\\sqrt{5}$. (2 BE)\n3. Erkläre kurz, warum $\\sqrt{2}$ irrational ist. (2 BE)\n4. Führe für $\\sqrt{10}$ zwei Heron-Schritte mit Startwert $x_0=3$ aus. (2 BE)'
const examTaskAfter = 'Im Materialplan treten mehrere Wurzel- und Potenzausdrücke auf.\n\n1. Vereinfache $\\sqrt{72}$, $\\sqrt{50}-\\sqrt{8}$ und $\\sqrt{12}\\cdot \\sqrt{27}$. (3 BE)\n2. Berechne $8^(1/3)$ und $16^(3/4)$ und rationalisiere $5/\\sqrt{5}$. (2 BE)\n3. Ordne $\\sqrt{2}$ als rational oder irrational und als reell ein. Begründe deine Einordnung mit dem indirekten Beweis und erläutere daran, weshalb der rationale Zahlbereich zu den reellen Zahlen erweitert wird. (3 BE)\n4. Führe für $\\sqrt{10}$ zwei Heron-Schritte mit Startwert $x_0=3$ aus. (2 BE)'
const examSolutionBefore = '$\\sqrt{72}=6\\sqrt{2}$, $\\sqrt{50}-\\sqrt{8}=5\\sqrt{2}-2\\sqrt{2}=3\\sqrt{2}$, $\\sqrt{12}\\cdot \\sqrt{27}=\\sqrt{324}=18$.\n\n$8^(1/3)=2$, $16^(3/4)=8$, $5/\\sqrt{5}=\\sqrt{5}$.\n\nEine gekürzte Bruchdarstellung $\\sqrt{2}=a/b$ würde zu $a^2=2b^2$ führen. Dann wären $a$ und $b$ beide gerade, ein Widerspruch zur Kürzung.\n\n$x_1=(3+10/3)/2=19/6=3.167$; $x_2=(19/6+10/(19/6))/2=(19/6+60/19)/2≈3.162$.'
const examSolutionAfter = '$\\sqrt{72}=6\\sqrt{2}$, $\\sqrt{50}-\\sqrt{8}=5\\sqrt{2}-2\\sqrt{2}=3\\sqrt{2}$, $\\sqrt{12}\\cdot \\sqrt{27}=\\sqrt{324}=18$.\n\n$8^(1/3)=2$, $16^(3/4)=8$, $5/\\sqrt{5}=\\sqrt{5}$.\n\n$\\sqrt{2}$ ist irrational und reell, also $\\sqrt{2}\\in\\mathbb{R}\\setminus\\mathbb{Q}$. Eine vollständig gekürzte Bruchdarstellung $\\sqrt{2}=a/b$ würde zu $a^2=2b^2$ führen. Dann wären $a$ und $b$ beide gerade, ein Widerspruch zur vollständigen Kürzung. Daher ist $\\sqrt{2}$ nicht rational. Weil solche Zahlen beispielsweise als Längen auftreten, reicht $\\mathbb{Q}$ nicht aus; $\\mathbb{R}$ erweitert $\\mathbb{Q}$ um die irrationalen Zahlen.\n\n$x_1=(3+10/3)/2=19/6=3.167$; $x_2=(19/6+10/(19/6))/2=(19/6+60/19)/2≈3.162$.'
const examDescriptionBefore = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 9 bearbeiten: Wurzelterme, rationale Exponenten, Rationalisieren, Irrationalitätsargument und Heron-Verfahren sicher nutzen.'
const examDescriptionAfter = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 9 bearbeiten: Wurzelterme, rationale Exponenten, Rationalisieren, Zahlbereichseinordnung und -erweiterung, indirekten Irrationalitätsbeweis und Heron-Verfahren sicher nutzen.'
const examScoringDescriptionBefore = 'Wurzelterme, rationale Exponenten, Rationalisieren, Irrationalitätsargument und Heron-Verfahren sicher nutzen.'
const examScoringDescriptionAfter = 'Wurzelterme, rationale Exponenten, Rationalisieren, Zahlbereichseinordnung und -erweiterung, indirekten Irrationalitätsbeweis und Heron-Verfahren sicher nutzen.'
const examSourceBefore = 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/draft_v1.md'
const examSourceAfter = 'curricula/DE/Gymnasium/assessments/mathematik/seki/j9/draft_v2.md'

const replaceExactOnce = (input: string, before: string, after: string, label: string): string => {
  const first = input.indexOf(before)
  const last = input.lastIndexOf(before)
  if (first < 0 || first !== last) throw new Error(`${label}: expected exactly one source occurrence`)
  return `${input.slice(0, first)}${after}${input.slice(first + before.length)}`
}

const replaceOrRequireExactOnce = (input: string, before: string, after: string, label: string): string => {
  const beforeCount = input.split(before).length - 1
  const afterCount = input.split(after).length - 1
  if (beforeCount === 1 && afterCount === 0) return input.replace(before, after)
  if (beforeCount === 0 && afterCount === 1) return input
  throw new Error(`${label}: expected exactly one old or current binding`)
}

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
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const digest = (value: string | Uint8Array): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest(stableJson({
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
const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}
if (deterministicGoalId(splitChildShortKey) !== splitChildId) throw new Error('B032 split-child ID is not deterministic')

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== landscapeId) throw new Error('Unexpected canonical Mathematics landscape')
const goals = canonical.goals as JsonRecord[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Mathematics goal IDs')

const keptGoal = goalById.get(keptGoalId)
if (!keptGoal || !same({
  title: keptGoal.title,
  titleEn: keptGoal.titleEn,
  description: keptGoal.description,
  descriptionEn: keptGoal.descriptionEn,
}, {
  title: 'Potenzgesetze mit ganzzahligen Exponenten anwenden',
  titleEn: 'Apply exponent rules with integer exponents',
  description: 'Die lernende Person kann Rechengesetze für Potenzen mit ganzzahligen Exponenten plausibel machen und sie in einfachen algebraischen Situationen sicher anwenden.',
  descriptionEn: 'The learner can make exponent rules for integer exponents plausible and apply them reliably in simple algebraic situations.',
})) throw new Error(`${keptGoalId}: adjudicated KEEP goal drifted`)

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal || goal.type !== 'atomic' || !same(goal.contains ?? [], [])) throw new Error(`${revision.id}: missing retained atomic goal`)
  const before = goal.description === revision.beforeDescriptionDe && goal.descriptionEn === revision.beforeDescriptionEn
  const after = goal.description === revision.descriptionDe && goal.descriptionEn === revision.descriptionEn
  if (!before && !after) throw new Error(`${revision.id}: bilingual description is outside bounded before/after states`)
  goal.description = revision.descriptionDe
  goal.descriptionEn = revision.descriptionEn
  for (const link of (goal.resourceLinks ?? []).filter((entry: JsonRecord) => entry.type === 'goal-visualization')) {
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
  }
}

const retained = goalById.get(splitRetainedId)
if (!retained || retained.type !== 'atomic' || !same(retained.contains ?? [], [])) throw new Error('Missing retained B032 split goal')
const retainedBefore = retained.title === retainedSplitText.beforeTitleDe
  && retained.titleEn === retainedSplitText.beforeTitleEn
  && retained.description === retainedSplitText.beforeDescriptionDe
  && retained.descriptionEn === retainedSplitText.beforeDescriptionEn
const retainedAfter = retained.title === retainedSplitText.titleDe
  && retained.titleEn === retainedSplitText.titleEn
  && retained.description === retainedSplitText.descriptionDe
  && retained.descriptionEn === retainedSplitText.descriptionEn
if (!retainedBefore && !retainedAfter) throw new Error(`${splitRetainedId}: outside bounded split states`)
Object.assign(retained, {
  title: retainedSplitText.titleDe,
  titleEn: retainedSplitText.titleEn,
  description: retainedSplitText.descriptionDe,
  descriptionEn: retainedSplitText.descriptionEn,
})
const retainedVisualization = (retained.resourceLinks ?? []).filter((entry: JsonRecord) => entry.type === 'goal-visualization')
if (retainedVisualization.length !== 1) throw new Error(`${splitRetainedId}: expected one retained visualization link`)
Object.assign(retainedVisualization[0], {
  title: `Visualisierung: ${retainedSplitText.titleDe}`,
  description: `Visualisierung zum Lernziel: ${retainedSplitText.titleDe}.`,
  altText: `Didaktische Visualisierung zum Lernziel "${retainedSplitText.titleDe}". ${retainedSplitText.descriptionDe}`,
})

const existingChild = goalById.get(splitChildId)
if (existingChild && !same(existingChild, childGoal)) throw new Error(`${splitChildId}: existing split child differs from bounded definition`)
if (!existingChild) {
  const retainedIndex = goals.findIndex((goal) => goal.id === splitRetainedId)
  if (retainedIndex < 0) throw new Error('Cannot place B032 split child after retained goal')
  goals.splice(retainedIndex + 1, 0, structuredClone(childGoal))
  goalById.set(splitChildId, goals[retainedIndex + 1])
}

const directParentWeights = new Map<string, [number, number]>([
  ['6c16599a-b61f-414f-a55a-79efada9c8f5', [13, 14]],
  ['8a0b0baf-c7e6-43df-a470-f56050ecaa46', [10, 11]],
])
for (const [parentId, [beforeWeight, afterWeight]] of directParentWeights) {
  const parent = goalById.get(parentId)
  if (!parent || !Array.isArray(parent.contains)) throw new Error(`${parentId}: missing split parent`)
  const occurrences = parent.contains.filter((id: string) => id === splitRetainedId).length
  if (occurrences !== 1) throw new Error(`${parentId}: retained split child must occur exactly once`)
  const childOccurrences = parent.contains.filter((id: string) => id === splitChildId).length
  if (childOccurrences === 0) parent.contains.splice(parent.contains.indexOf(splitRetainedId) + 1, 0, splitChildId)
  else if (childOccurrences !== 1 || parent.contains.indexOf(splitChildId) !== parent.contains.indexOf(splitRetainedId) + 1) {
    throw new Error(`${parentId}: split child is not exactly adjacent to retained goal`)
  }
  if (parent.weight !== beforeWeight && parent.weight !== afterWeight) throw new Error(`${parentId}: unexpected weight ${String(parent.weight)}`)
  parent.weight = afterWeight
}
for (const [ancestorId, beforeWeight, afterWeight] of [
  ['c01b1ce9-a667-4a46-b251-ec33ae602b15', 921, 922],
  ['6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb', 89, 90],
  ['902de188-6f27-47c2-ace1-9b2c5771fde8', 53, 54],
] as const) {
  const ancestor = goalById.get(ancestorId)
  if (!ancestor || (ancestor.weight !== beforeWeight && ancestor.weight !== afterWeight)) {
    throw new Error(`${ancestorId}: unexpected ancestor weight`)
  }
  ancestor.weight = afterWeight
}

const exam = goalById.get(examId)
if (!exam || exam.nodeKind !== 'exam' || !exam.examData) throw new Error('Missing J9 task 1 assessment')
const examRequiresBefore = [
  '62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb',
  '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5',
  '4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a',
  '7fad6a57-cda1-5dee-a55e-877be64ba992',
  '68505a32-3b1d-57b2-a495-00b4097eb50d',
  'e131c594-c45e-5718-9f33-7ae39ddc82ad',
  splitRetainedId,
  'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
  '47d8d47c-7c59-5394-9098-11d9ad3723f1',
  '88abc886-cce8-55cf-b86c-eb4ba45a92d7',
]
const examRequiresAfter = [
  ...examRequiresBefore.slice(0, examRequiresBefore.indexOf(splitRetainedId) + 1),
  splitChildId,
  ...examRequiresBefore.slice(examRequiresBefore.indexOf(splitRetainedId) + 1),
]
const examState = {
  title: exam.title,
  description: exam.description,
  sourceRef: exam.sourceRef,
  requires: exam.requires,
  reviewNote: exam.examData.reviewNote,
  coveredGoalIds: exam.examData.coveredGoalIds,
  sourceArtifactPath: exam.examData.sourceArtifactPath,
  taskContent: exam.examData.taskContent,
  solutionContent: exam.examData.solutionContent,
  maxPoints: exam.examData.scoring?.maxPoints,
  passingPoints: exam.examData.scoring?.passingPoints,
  stepPoints: exam.examData.scoring?.steps?.[0]?.points,
  stepDescription: exam.examData.scoring?.steps?.[0]?.description,
}
const examBeforeState = {
  title: 'Aufgabe 1 (Jahrgangsstufe 9, 9 BE)',
  description: examDescriptionBefore,
  sourceRef: `${examSourceBefore}#task-1`,
  requires: examRequiresBefore,
  reviewNote: 'released after simulated internal review on 2026-06-28 for J9',
  coveredGoalIds: examRequiresBefore,
  sourceArtifactPath: examSourceBefore,
  taskContent: examTaskBefore,
  solutionContent: examSolutionBefore,
  maxPoints: 9,
  passingPoints: 5,
  stepPoints: 9,
  stepDescription: examScoringDescriptionBefore,
}
const examAfterState = {
  title: 'Aufgabe 1 (Jahrgangsstufe 9, 10 BE)',
  description: examDescriptionAfter,
  sourceRef: `${examSourceAfter}#task-1`,
  requires: examRequiresAfter,
  reviewNote: 'released after focused simulated internal review on 2026-09-05 for the B032 number-system split',
  coveredGoalIds: examRequiresAfter,
  sourceArtifactPath: examSourceAfter,
  taskContent: examTaskAfter,
  solutionContent: examSolutionAfter,
  maxPoints: 10,
  passingPoints: 5,
  stepPoints: 10,
  stepDescription: examScoringDescriptionAfter,
}
if (!same(examState, examBeforeState) && !same(examState, examAfterState)) {
  throw new Error('J9 task 1 is outside the exact B032 before/after assessment states')
}
Object.assign(exam, {
  title: examAfterState.title,
  description: examAfterState.description,
  sourceRef: examAfterState.sourceRef,
  requires: [...examRequiresAfter],
})
Object.assign(exam.examData, {
  reviewNote: examAfterState.reviewNote,
  coveredGoalIds: [...examRequiresAfter],
  sourceArtifactPath: examAfterState.sourceArtifactPath,
  taskContent: examAfterState.taskContent,
  solutionContent: examAfterState.solutionContent,
})
Object.assign(exam.examData.scoring, { maxPoints: 10, passingPoints: 5 })
Object.assign(exam.examData.scoring.steps[0], {
  points: 10,
  description: examScoringDescriptionAfter,
})
outputs.set(paths.canonical, serializeJson(canonical))

let j9DraftV2 = readFileSync(absolute(paths.j9DraftV1), 'utf8')
j9DraftV2 = replaceExactOnce(j9DraftV2, '# J9 Mathematics Exam Draft v1', '# J9 Mathematics Exam Draft v2', 'J9 draft heading')
j9DraftV2 = replaceExactOnce(j9DraftV2, 'Status: promoted after simulated internal review', 'Status: promoted after focused simulated internal review on 2026-09-05', 'J9 draft status')
j9DraftV2 = replaceExactOnce(j9DraftV2, 'Total: 50 BE', 'Total: 51 BE', 'J9 draft total')
j9DraftV2 = replaceExactOnce(j9DraftV2, '## Task 1 - Wurzelcheck im Materialplan (9 BE)', '## Task 1 - Wurzelcheck im Materialplan (10 BE)', 'J9 draft task heading')
j9DraftV2 = replaceExactOnce(j9DraftV2, '3. Erkläre kurz, warum $\\sqrt{2}$ irrational ist. (2 BE)', '3. Ordne $\\sqrt{2}$ als rational oder irrational und als reell ein. Begründe deine Einordnung mit dem indirekten Beweis und erläutere daran, weshalb der rationale Zahlbereich zu den reellen Zahlen erweitert wird. (3 BE)', 'J9 draft task 1 prompt')
outputs.set(paths.j9DraftV2, j9DraftV2)

let j9SolutionV2 = readFileSync(absolute(paths.j9SolutionV1), 'utf8')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, '# J9 Mathematics Exam Solution v1', '# J9 Mathematics Exam Solution v2', 'J9 solution heading')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, 'Status: promoted after simulated internal review', 'Status: promoted after focused simulated internal review on 2026-09-05', 'J9 solution status')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, 'Total: 50 BE', 'Total: 51 BE', 'J9 solution total')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, '## Task 1 - Wurzelcheck im Materialplan (9 BE)', '## Task 1 - Wurzelcheck im Materialplan (10 BE)', 'J9 solution task heading')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, 'Eine gekürzte Bruchdarstellung $\\sqrt{2}=a/b$ würde zu $a^2=2b^2$ führen. Dann wären $a$ und $b$ beide gerade, ein Widerspruch zur Kürzung.', '$\\sqrt{2}$ ist irrational und reell, also $\\sqrt{2}\\in\\mathbb{R}\\setminus\\mathbb{Q}$. Eine vollständig gekürzte Bruchdarstellung $\\sqrt{2}=a/b$ würde zu $a^2=2b^2$ führen. Dann wären $a$ und $b$ beide gerade, ein Widerspruch zur vollständigen Kürzung. Daher ist $\\sqrt{2}$ nicht rational. Weil solche Zahlen beispielsweise als Längen auftreten, reicht $\\mathbb{Q}$ nicht aus; $\\mathbb{R}$ erweitert $\\mathbb{Q}$ um die irrationalen Zahlen.', 'J9 solution task 1 reasoning')
j9SolutionV2 = replaceExactOnce(j9SolutionV2, '- 9 BE - Wurzelterme, rationale Exponenten, Rationalisieren, Irrationalitätsargument und Heron-Verfahren sicher nutzen.', '- 10 BE - Wurzelterme, rationale Exponenten, Rationalisieren, Zahlbereichseinordnung und -erweiterung, indirekten Irrationalitätsbeweis und Heron-Verfahren sicher nutzen.', 'J9 solution task 1 scoring')
outputs.set(paths.j9SolutionV2, j9SolutionV2)

let j9BlueprintV2 = readFileSync(absolute(paths.j9BlueprintV1), 'utf8')
j9BlueprintV2 = replaceExactOnce(j9BlueprintV2, '# J9 Mathematics Exam Blueprint v1', '# J9 Mathematics Exam Blueprint v2', 'J9 blueprint heading')
j9BlueprintV2 = replaceExactOnce(j9BlueprintV2, 'Status: promoted after simulated internal review', 'Status: promoted after focused simulated internal review on 2026-09-05', 'J9 blueprint status')
j9BlueprintV2 = replaceExactOnce(j9BlueprintV2, 'Total: 50 BE', 'Total: 51 BE', 'J9 blueprint total')
j9BlueprintV2 = replaceExactOnce(j9BlueprintV2, '| 1 | 9 | Wurzelterme, rationale Exponenten, Rationalisieren, Irrationalitätsargument und Heron-Verfahren sicher nutzen. |', '| 1 | 10 | Wurzelterme, rationale Exponenten, Rationalisieren, Zahlbereichseinordnung und -erweiterung, indirekten Irrationalitätsbeweis und Heron-Verfahren sicher nutzen. |', 'J9 blueprint task 1 row')
j9BlueprintV2 = replaceExactOnce(j9BlueprintV2, '7676b0f9-340d-4a91-ab1f-92745a8f88db (Irrationalität von Wurzelzahlen begründen und reelle Zahlen einordnen)<br>c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1', '7676b0f9-340d-4a91-ab1f-92745a8f88db (Irrationalität von √2 indirekt begründen)<br>f9e21454-857c-5a6a-8367-32a34fc0026b (Erweiterung zu den reellen Zahlen begründen und Zahlen einordnen)<br>c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1', 'J9 blueprint split coverage')
outputs.set(paths.j9BlueprintV2, j9BlueprintV2)

const j9ReviewV2 = `# Focused Simulated Internal Review - J9 Mathematics Exam v2

Reviewer: Codex simulated didactic QA
Review date: 2026-09-05
Decision: approved_for_release_candidate

Scope: Task 1 only; Tasks 2-7 are byte-identical to v1.

- Task 1 now asks learners to classify √2 as irrational and real, explain the indirect contradiction proof, and use the result to justify the extension from the rational to the real number system.
- The three points for item 3 cover the classification, the proof chain, and the extension rationale; merely naming a number set is insufficient.
- The retained proof goal \`${splitRetainedId}\` and the new number-system goal \`${splitChildId}\` both have direct, task-supported \`requires\` and \`examData.coveredGoalIds\` bindings.
- The other Task 1 routines and all remaining exam tasks are unchanged. The revised total is 51 BE.
- v1 remains preserved as the historical released predecessor; the canonical exam node now cites \`draft_v2.md\`.
`
outputs.set(paths.j9ReviewV2, j9ReviewV2)

let j9Readme = readFileSync(absolute(paths.j9AssessmentReadme), 'utf8')
const readmeMarker = 'Status: promoted after simulated internal review\n'
if (!j9Readme.includes('Current promoted revision: v2')) {
  j9Readme = replaceExactOnce(j9Readme, readmeMarker, `${readmeMarker}\nCurrent promoted revision: v2 (focused B032 number-system split follow-up, 2026-09-05)\n`, 'J9 README status')
  j9Readme = replaceExactOnce(j9Readme, '- `simulated_review_v1.md` - internal simulated release review\n', '- `simulated_review_v1.md` - historical internal simulated release review\n- `draft_v2.md` - current learner-facing draft\n- `solution_v2.md` - current solution and scoring\n- `blueprint_v2.md` - current coverage and design matrix\n- `simulated_review_v2.md` - focused review of the B032 follow-up\n', 'J9 README artifacts')
}
outputs.set(paths.j9AssessmentReadme, j9Readme)

type ReviewRoute = {
  sourceGoalId: string
  mode: 'proof' | 'classification'
  matchType: 'exact' | 'partial'
  rationale: string
}

const routeSpecs = new Map<string, ReviewRoute[]>([
  [paths.bbReview, [
    ['bb-math-seki-rlp-1-10-2-2-l1-zahlen-g-07-368e2afb', 'Zahlendarstellungen im reellen Zahlbereich sind dem neuen Zahlbereichs- und Einordnungsziel quellengebunden zugeordnet; weitere Darstellungsroutinen im Cluster bleiben getrennt.'],
    ['bb-math-seki-rlp-1-10-2-2-l1-zahlen-g-08-ff7089c8', 'Das Ordnen reeller Zahlen berührt die Einordnung rationaler und irrationaler Zahlen im neuen Zahlbereichsziel; die konkrete Ordnungsroutine bleibt nur teilweise abgedeckt.'],
    ['bb-math-seki-rlp-1-10-2-2-l1-zahlen-g-09-680ffd55', 'Die Beziehungen zwischen Zahlbereichen einschließlich der reellen Zahlen sind dem neuen Erweiterungs- und Einordnungsziel quellengebunden zugeordnet.'],
  ].map(([sourceGoalId, rationale]) => ({ sourceGoalId, mode: 'classification', matchType: 'partial', rationale })) as ReviewRoute[]],
  [paths.beReview, [
    ['be-math-seki-rlp-1-10-2-2-l1-zahlen-g-07-368e2afb', 'Zahlendarstellungen im reellen Zahlbereich sind dem neuen Zahlbereichs- und Einordnungsziel quellengebunden zugeordnet; weitere Darstellungsroutinen im Cluster bleiben getrennt.'],
    ['be-math-seki-rlp-1-10-2-2-l1-zahlen-g-08-ff7089c8', 'Das Ordnen reeller Zahlen berührt die Einordnung rationaler und irrationaler Zahlen im neuen Zahlbereichsziel; die konkrete Ordnungsroutine bleibt nur teilweise abgedeckt.'],
    ['be-math-seki-rlp-1-10-2-2-l1-zahlen-g-09-680ffd55', 'Die Beziehungen zwischen Zahlbereichen einschließlich der reellen Zahlen sind dem neuen Erweiterungs- und Einordnungsziel quellengebunden zugeordnet.'],
  ].map(([sourceGoalId, rationale]) => ({ sourceGoalId, mode: 'classification', matchType: 'partial', rationale })) as ReviewRoute[]],
  [paths.bwReview, [
    { sourceGoalId: 'bw-math-seki-bp2016-3-2-1-16-a45fbfc0', mode: 'classification', matchType: 'partial', rationale: 'Die beschriebene Unvollständigkeit der rationalen Zahlen und die notwendige Erweiterung zu den reellen Zahlen sind nun dem eigenständigen Zahlbereichsziel zugeordnet; dessen zusätzliche Klassifikationsleistung macht die Kante konservativ partial.' },
    { sourceGoalId: 'bw-math-seki-bp2016-3-2-1-17-61904a64', mode: 'classification', matchType: 'partial', rationale: 'Beispiele irrationaler Zahlen stützen die Einordnung im neuen Zahlbereichsziel, decken dessen begründete Erweiterungsleistung aber nur teilweise ab.' },
  ]],
  [paths.byReview, [
    { sourceGoalId: 'ff811135-d54c-532a-82e1-a3ef98a1feeb', mode: 'proof', matchType: 'exact', rationale: 'Der als erster Source-Extraction-Aspekt erhaltene Lehrplantext zum indirekten Beweis der Irrationalität von √2 entspricht dem auf genau diese Beweisdeutung verengten kanonischen Ziel.' },
    { sourceGoalId: 'by-math-m9-1-ff811135-s02-57b6175837', mode: 'proof', matchType: 'partial', rationale: 'Die Reflexion über die zentrale Bedeutung des Beweisens wird durch das konkrete indirekte Beweisziel nur exemplarisch angebahnt und deshalb konservativ partial zugeordnet.' },
    { sourceGoalId: 'by-math-m9-1-ff811135-s03-c5a02f22dc', mode: 'classification', matchType: 'partial', rationale: 'Die Notwendigkeit der Erweiterung zu den reellen Zahlen und Beispiele irrationaler Zahlen sind durch den neuen Child abgedeckt; die zusätzlich genannte kulturhistorische Bedeutung bleibt außerhalb dieses atomaren Ziels, daher partial.' },
  ]],
  [paths.heReview, [
    { sourceGoalId: 'he-math-seki-kc-7-3-zahlen-j7-8-02-1e930168', mode: 'classification', matchType: 'partial', rationale: 'Der Quellaspekt zu reellen Zahlen wird quellengebunden auf das neue Erweiterungs- und Einordnungsziel geroutet; Wurzel- und Kreiszahlvorstellungen reichen darüber hinaus.' },
    { sourceGoalId: 'he-math-seki-kc-7-3-zahlen-j7-8-04-6d560183', mode: 'classification', matchType: 'partial', rationale: 'Vergleichen und Ordnen rationaler und reeller Zahlen berührt die begründete Zahlbereichseinordnung des neuen Childs, enthält aber zusätzliche Ordnungs- und Rundungsroutinen.' },
    { sourceGoalId: 'he-math-seki-g9-9-2-02-8ccfa0df', mode: 'classification', matchType: 'partial', rationale: 'Die Quadratwurzeldefinition bleibt am eigenen Ziel; der Anteil zur Einordnung in die reellen Zahlen wird quellengebunden auf den neuen Child geroutet.' },
    { sourceGoalId: 'he-math-seki-g9-9-2-05-85851d6f', mode: 'proof', matchType: 'partial', rationale: 'Der Irrationalitätsbeweis ist durch das verengte indirekte Beweisziel abgedeckt; weitere einfache Beweisverfahren werden vom zusätzlich referenzierten allgemeinen Beweisziel getragen.' },
    { sourceGoalId: 'he-math-seki-g9-9-2-08-423cc819', mode: 'classification', matchType: 'partial', rationale: 'Irrationale Quadratwurzeln, reelle Zahlen und wiederaufgegriffene Zahlbereiche werden dem neuen Erweiterungs- und Einordnungsziel zugeordnet; der breite Wiederholungscharakter bleibt partial.' },
    { sourceGoalId: 'he-math-seki-g9-9-2-09-d809b14a', mode: 'classification', matchType: 'partial', rationale: 'Der Zahlbereichsvergleich wird vom neuen Child getragen; Konstruktion, Zahlengeradendarstellung und Rechengesetze bleiben auf den weiteren referenzierten Zielen.' },
    { sourceGoalId: 'he-math-seki-g9-9-4-05-1a905c18', mode: 'classification', matchType: 'partial', rationale: 'Die Inkommensurabilität berührt die Notwendigkeit reeller Zahlen im neuen Child; Streckenberechnung, Konstruktion und Ähnlichkeit bleiben auf den beiden geometrischen Zielen.' },
    { sourceGoalId: 'he-math-seki-g8-8g-2-01-a6bfad7d', mode: 'classification', matchType: 'partial', rationale: 'Der Anteil zu reellen Zahlen wird dem neuen Zahlbereichsziel zugeordnet; Quadratwurzelbegriff und Wurzelcluster bleiben getrennt referenziert.' },
    { sourceGoalId: 'he-math-seki-g8-8g-2-05-9191b1da', mode: 'proof', matchType: 'partial', rationale: 'Das verengte Ziel deckt den indirekten Widerspruchsbeweis an √2 ab; die alternative anschauliche Endziffernargumentation ist weiter als der kanonische Zielumfang, daher partial.' },
  ]],
  [paths.shReview, [
    { sourceGoalId: 'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l1-zahl-und-operation-K006-510875328c', mode: 'classification', matchType: 'partial', rationale: 'Sinntragende Vorstellungen reeller Zahlen werden quellengebunden dem neuen Erweiterungs- und Einordnungsziel zugeordnet; der offene Vorstellungsbegriff bleibt breiter, daher partial.' },
    { sourceGoalId: 'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l1-zahl-und-operation-T042-42c1558bac', mode: 'classification', matchType: 'partial', rationale: 'Nicht abbrechende, nicht periodische Dezimaldarstellungen stützen die Einordnung irrationaler Zahlen im neuen Child, decken dessen gesamte Erweiterungsbegründung jedoch nicht ab.' },
  ]],
])

const routeEvidence = (decision: JsonRecord, mode: ReviewRoute['mode']): JsonRecord => ({
  ...(decision.evidence ?? {}),
  method: 'batch-032-source-bound-structural-split-review',
  adjudication: 'mathematik-b032-2026-09-05',
  retainedCanonicalGoalId: splitRetainedId,
  newCanonicalGoalId: splitChildId,
  routedAspect: mode === 'proof' ? 'indirect-irrationality-proof' : 'real-number-extension-and-classification',
})

for (const [path, specs] of routeSpecs) {
  const document = readJson(path)
  const decisions = document.decisions as JsonRecord[]
  const mappings = document.mappings as JsonRecord[]
  if (!Array.isArray(decisions) || !Array.isArray(mappings)) throw new Error(`${path}: missing review decisions or mapping projection`)
  for (const spec of specs) {
    const decisionMatches = decisions.filter((decision) => decision.sourceGoalId === spec.sourceGoalId)
    if (decisionMatches.length !== 1) throw new Error(`${path}:${spec.sourceGoalId}: expected one decision`)
    const decision = decisionMatches[0]
    const currentIds = decision.canonicalGoalIds as string[]
    const hasBoundedTarget = spec.mode === 'proof'
      ? currentIds?.includes(splitRetainedId)
      : currentIds?.some((id) => id === splitRetainedId || id === splitChildId)
    if (!Array.isArray(currentIds) || !hasBoundedTarget) {
      throw new Error(`${path}:${spec.sourceGoalId}: decision is outside bounded old/new target states`)
    }
    decision.canonicalGoalIds = [...new Set(currentIds.map((id) => (
      spec.mode === 'classification' && id === splitRetainedId ? splitChildId : id
    )))]
    decision.matchType = spec.matchType
    decision.rationale = spec.rationale
    decision.reviewedAt = reviewedAt
    decision.reviewer = reviewer
    decision.evidence = routeEvidence(decision, spec.mode)

    const projected = mappings.filter((mapping) => mapping.legacyGoalId === spec.sourceGoalId)
    if (projected.length < 1) throw new Error(`${path}:${spec.sourceGoalId}: missing projected mapping edges`)
    const relevant = projected.filter((mapping) => [splitRetainedId, splitChildId].includes(mapping.canonicalGoalId))
    if (relevant.length !== 1) throw new Error(`${path}:${spec.sourceGoalId}: expected one bounded proof/classification edge`)
    relevant[0].canonicalGoalId = spec.mode === 'proof' ? splitRetainedId : splitChildId
    relevant[0].matchType = spec.matchType
  }
  outputs.set(path, serializeJson(document))
}

const updateSingleDirectEdge = ({
  path,
  sourceGoalId,
  beforeTarget,
  afterTarget,
  matchType,
}: {
  path: string
  sourceGoalId: string
  beforeTarget: string
  afterTarget: string
  matchType: 'exact' | 'partial'
}): void => {
  const document = readJson(path)
  const mappings = document.mappings as JsonRecord[]
  const matches = mappings.filter((mapping) => mapping.legacyGoalId === sourceGoalId)
  const bounded = matches.filter((mapping) => [beforeTarget, afterTarget].includes(mapping.canonicalGoalId))
  if (bounded.length !== 1) throw new Error(`${path}:${sourceGoalId}: expected one bounded direct mapping edge`)
  bounded[0].canonicalGoalId = afterTarget
  bounded[0].matchType = matchType
  outputs.set(path, serializeJson(document))
}

updateSingleDirectEdge({
  path: paths.bwDirect,
  sourceGoalId: 'b404b3ec-d0a9-405e-a66b-172a5d852a3d',
  beforeTarget: splitRetainedId,
  afterTarget: splitChildId,
  matchType: 'exact',
})
updateSingleDirectEdge({
  path: paths.shDirect,
  sourceGoalId: 'sh-sek1-jg7-9-zahl-operation-reelle-zahlen',
  beforeTarget: splitRetainedId,
  afterTarget: splitChildId,
  matchType: 'partial',
})

const byDirect = readJson(paths.byDirect)
const byDirectMappings = byDirect.mappings as JsonRecord[]
const broadBySourceId = 'ff811135-d54c-532a-82e1-a3ef98a1feeb'
const broadByEdges = byDirectMappings.filter((mapping) => mapping.legacyGoalId === broadBySourceId)
if (broadByEdges.length < 1 || broadByEdges.some((mapping) => ![splitRetainedId, splitChildId].includes(mapping.canonicalGoalId))) {
  throw new Error('BY broad irrationality source has unexpected direct mappings')
}
const proofEdge = broadByEdges.find((mapping) => mapping.canonicalGoalId === splitRetainedId)
if (!proofEdge) throw new Error('BY broad source must retain its proof edge')
proofEdge.matchType = 'partial'
if (!broadByEdges.some((mapping) => mapping.canonicalGoalId === splitChildId)) {
  const index = byDirectMappings.indexOf(proofEdge)
  byDirectMappings.splice(index + 1, 0, {
    legacyGoalId: broadBySourceId,
    canonicalGoalId: splitChildId,
    matchType: 'partial',
  })
}
const wrongByEdges = byDirectMappings.filter((mapping) => (
  mapping.legacyGoalId === byPowerFunctionSourceId
  && [wrongRootFunctionId, correctPowerFunctionId].includes(mapping.canonicalGoalId)
))
if (wrongByEdges.length !== 1) throw new Error('BY power-function direct mapping is outside bounded states')
wrongByEdges[0].canonicalGoalId = correctPowerFunctionId
wrongByEdges[0].matchType = 'partial'
outputs.set(paths.byDirect, serializeJson(byDirect))

const byReview = JSON.parse(outputs.get(paths.byReview)!) as JsonRecord
const byReviewDecision = (byReview.decisions as JsonRecord[]).filter((decision) => decision.sourceGoalId === byPowerFunctionSourceId)
if (byReviewDecision.length !== 1) throw new Error('Missing unique BY power-function review decision')
const powerDecision = byReviewDecision[0]
if (!same(powerDecision.canonicalGoalIds, [wrongRootFunctionId]) && !same(powerDecision.canonicalGoalIds, [correctPowerFunctionId])) {
  throw new Error('BY power-function review decision is outside bounded states')
}
Object.assign(powerDecision, {
  canonicalGoalIds: [correctPowerFunctionId],
  matchType: 'partial',
  rationale: 'Der Quelltext behandelt Funktionen a · x^n mit natürlichem Exponenten, Parameterwirkung, Graphverlauf und Symmetrie und gehört deshalb zum kanonischen Potenzfunktionsziel 30c013ac. Da dieses auch ganzzahlige Exponenten und einen allgemeineren Eigenschaftenvergleich umfasst, ist die Kante konservativ partial; die frühere Wurzelfunktionskante 66077296 war fachlich unbelegt.',
  reviewedAt,
  reviewer,
  evidence: {
    ...(powerDecision.evidence ?? {}),
    method: 'batch-032-source-bound-mapping-correction',
    adjudication: 'mathematik-b032-2026-09-05',
    previousCanonicalGoalId: wrongRootFunctionId,
    correctedCanonicalGoalId: correctPowerFunctionId,
    correctionBasis: 'official-source-span-a-times-x-to-n-graph-and-symmetry',
  },
})
const byReviewPowerEdges = (byReview.mappings as JsonRecord[]).filter((mapping) => (
  mapping.legacyGoalId === byPowerFunctionSourceId
  && [wrongRootFunctionId, correctPowerFunctionId].includes(mapping.canonicalGoalId)
))
if (byReviewPowerEdges.length !== 1) throw new Error('Missing unique BY projected power-function edge')
byReviewPowerEdges[0].canonicalGoalId = correctPowerFunctionId
byReviewPowerEdges[0].matchType = 'partial'
outputs.set(paths.byReview, serializeJson(byReview))

const provenanceRegistry = readJson(paths.provenance)
const provenanceLandscape = (provenanceRegistry.landscapes as JsonRecord[])
  .find((landscape) => landscape.landscapeId === landscapeId)
if (!provenanceLandscape || !provenanceLandscape.goalProvenance) throw new Error('Missing Mathematics provenance registry entry')
const provenance = provenanceLandscape.goalProvenance as JsonRecord
const childProvenance = {
  sourceLandscapeId: 'c1600692-e543-5cf2-a399-6bd96e6b817f',
  sourceGoalId: broadBySourceId,
}
if (provenance[splitChildId] && !same(provenance[splitChildId], childProvenance)) {
  throw new Error(`${splitChildId}: foreign provenance entry`)
}
provenance[splitChildId] = childProvenance
provenanceLandscape.goalProvenance = Object.fromEntries(Object.entries(provenance).sort(([left], [right]) => left.localeCompare(right)))
outputs.set(paths.provenance, serializeJson(provenanceRegistry))

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisions = semanticKinds.decisions as JsonRecord[]
const semanticById = new Map(semanticDecisions.map((decision) => [String(decision.goalId), decision]))
const childSemantic = {
  goalId: splitChildId,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(goalById.get(splitChildId)!),
  semanticKind: 'curricularAtomic',
  decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-structural-split-curricular-atomic',
}
const existingChildSemantic = semanticById.get(splitChildId)
const priorChildSemantic = {
  ...childSemantic,
  decisionBasis: 'reviewed-current-b032-structural-split-curricular-atomic',
}
if (existingChildSemantic && !same(existingChildSemantic, childSemantic) && !same(existingChildSemantic, priorChildSemantic)) {
  throw new Error(`${splitChildId}: foreign semantic-kind decision`)
}
if (!existingChildSemantic) {
  const retainedIndex = semanticDecisions.findIndex((decision) => decision.goalId === splitRetainedId)
  if (retainedIndex < 0) throw new Error('Cannot place split-child semantic decision')
  semanticDecisions.splice(retainedIndex + 1, 0, childSemantic)
  semanticById.set(splitChildId, childSemantic)
} else Object.assign(existingChildSemantic, childSemantic)
const refingerprintIds = new Set([
  ...revisions.map((revision) => revision.id),
  splitRetainedId,
  splitChildId,
  ...directParentWeights.keys(),
  examId,
  'c01b1ce9-a667-4a46-b251-ec33ae602b15',
  '6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb',
  '902de188-6f27-47c2-ace1-9b2c5771fde8',
])
for (const goalId of refingerprintIds) {
  const goal = goalById.get(goalId)
  const decision = semanticById.get(goalId)
  if (!goal || !decision || decision.decisionStatus !== 'authoritative') throw new Error(`${goalId}: missing authoritative semantic kind`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
if (semanticKinds.counts.curricularAtomic !== 793 && semanticKinds.counts.curricularAtomic !== 794) {
  throw new Error(`Unexpected curricularAtomic denominator ${String(semanticKinds.counts.curricularAtomic)}`)
}
if (semanticKinds.counts.total !== 1177 && semanticKinds.counts.total !== 1178) {
  throw new Error(`Unexpected semantic-kind total ${String(semanticKinds.counts.total)}`)
}
semanticKinds.counts.curricularAtomic = 794
semanticKinds.counts.total = 1178
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
const reviewedGoals = [
  ...revisions.map((revision) => ({
    id: revision.id,
    atomicityReason: revision.atomicityReason,
    memoryReason: revision.memoryReason,
  })),
  {
    id: splitRetainedId,
    atomicityReason: 'Annahme, Teilbarkeitsfolgerungen, Widerspruch und Rückbezug auf die Ausgangsannahme sind aufeinanderfolgende Schritte genau eines indirekten Beweises zur Irrationalität von √2; Zahlbereichserweiterung und Klassifikation liegen nun im getrennten Child.',
    memoryReason: 'Der indirekte Beweis muss in seiner logischen Struktur erläutert werden; auswendig gelernte Einzelschritte ohne Rückbezug auf die Annahme genügen nicht und rechtfertigen kein Memory-Deck.',
  },
  {
    id: splitChildId,
    atomicityReason: 'Die Notwendigkeit der Erweiterung von rationalen zu reellen Zahlen und die begründete Einordnung rationaler beziehungsweise irrationaler Zahlen bilden eine zusammenhängende Zahlbereichskompetenz; der unabhängige Irrationalitätsbeweis liegt im vorausgesetzten Ziel.',
    memoryReason: 'Die Zahlbereichseinordnung muss aus Darstellung und Definition begründet sowie auf neue Zahlen übertragen werden; ein separates Memory-Deck ist nicht erforderlich.',
  },
]
for (const reviewed of reviewedGoals) {
  const goal = goalById.get(reviewed.id)!
  let atomicRecord = atomicityById.get(reviewed.id)
  if (!atomicRecord) {
    atomicRecord = {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId,
      goalId: reviewed.id,
    }
    const retainedIndex = atomicity.findIndex((record) => record.goalId === splitRetainedId)
    atomicity.splice(retainedIndex + 1, 0, atomicRecord)
    atomicityById.set(reviewed.id, atomicRecord)
  }
  Object.assign(atomicRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: reviewed.atomicityReason,
    suggestedSplit: [],
  })
  let memoryRecord = memoryById.get(reviewed.id)
  if (!memoryRecord) {
    memoryRecord = {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId,
      goalId: reviewed.id,
    }
    const retainedIndex = memory.findIndex((record) => record.goalId === splitRetainedId)
    memory.splice(retainedIndex + 1, 0, memoryRecord)
    memoryById.set(reviewed.id, memoryRecord)
  }
  if (memoryRecord.status && memoryRecord.status !== 'no_memory_needed') throw new Error(`${reviewed.id}: memory decision is not safely retainable`)
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason: reviewed.memoryReason,
  })
  delete memoryRecord.memoryGoalIds
  delete memoryRecord.deckIds
}
outputs.set(paths.atomicity, serializeJsonl(atomicity))
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationRecords = visualizationQa.records as JsonRecord[]
const visualizationById = new Map(visualizationRecords.map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const record = visualizationById.get(revision.id)
  if (!record) throw new Error(`${revision.id}: missing visualization QA record`)
  record.title = goal.title
  record.description = goal.description
  if (record.visualizationState === 'available') {
    const canonicalAsset = readFileSync(absolute(String(record.canonicalAssetPath)))
    const publicAsset = readFileSync(absolute(String(record.publicAssetPath)))
    if (!canonicalAsset.equals(publicAsset) || digest(canonicalAsset) !== record.assetSha256) throw new Error(`${revision.id}: visualization bytes drifted`)
    Object.assign(record, {
      contentApprovedChatGpt: 'yes',
      umlautsCorrectChatGpt: 'yes',
      chatGptReviewedAt: reviewedAtIso,
      chatGptReviewer: reviewer,
      chatGptNotes: revision.visualizationNote,
      aiApproved: 'yes',
      aiApprovedAssetSha256: record.assetSha256,
      aiReviewedAt: reviewedAtIso,
      aiReviewer: reviewer,
      aiNotes: revision.visualizationNote,
    })
  } else if (record.visualizationState !== 'missing') throw new Error(`${revision.id}: unexpected visualization state`)
}
const retainedQa = visualizationById.get(splitRetainedId)
if (!retainedQa || retainedQa.visualizationState !== 'available') throw new Error('Retained split goal must keep its available visualization')
const retainedCanonicalAsset = readFileSync(absolute(String(retainedQa.canonicalAssetPath)))
const retainedPublicAsset = readFileSync(absolute(String(retainedQa.publicAssetPath)))
if (!retainedCanonicalAsset.equals(retainedPublicAsset) || digest(retainedCanonicalAsset) !== retainedQa.assetSha256) {
  throw new Error('Retained split visualization bytes drifted')
}
const splitVisualizationNote = 'Das unveränderte Bild enthält den vollständigen Paritäts-Widerspruch für √2. Nur dieser Beweisteil dient dem verengten Ziel als Evidenz; die zusätzlich sichtbare Zahlbereichseinordnung bleibt korrekter Kontext, ersetzt aber nicht das neue eigenständige Klassifikationsziel.'
Object.assign(retainedQa, {
  title: retainedSplitText.titleDe,
  description: retainedSplitText.descriptionDe,
  contentApprovedChatGpt: 'yes',
  umlautsCorrectChatGpt: 'yes',
  chatGptReviewedAt: reviewedAtIso,
  chatGptReviewer: reviewer,
  chatGptNotes: splitVisualizationNote,
  aiApproved: 'yes',
  aiApprovedAssetSha256: retainedQa.assetSha256,
  aiReviewedAt: reviewedAtIso,
  aiReviewer: reviewer,
  aiNotes: splitVisualizationNote,
})
const childQa = {
  goalId: splitChildId,
  title: childGoal.title,
  description: childGoal.description,
  subject: 'mathematik',
  landscapeId,
  landscapePath: paths.canonical,
  visualizationState: 'missing',
  missingReason: 'no_primary_link',
  imageUrl: '',
  publicAssetPath: '',
  canonicalAssetPath: '',
  assetSha256: '',
  umlautsCorrectChatGpt: 'no',
  contentApprovedChatGpt: 'no',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  humanIssueDescription: '',
  chatGptReviewedAt: null,
  chatGptReviewer: '',
  chatGptNotes: '',
  humanReviewedAt: null,
  humanReviewer: '',
}
const existingChildQa = visualizationById.get(splitChildId)
const priorChildQa = { ...childQa, missingReason: 'new_structural_split_child_no_dedicated_asset' }
if (existingChildQa && !same(existingChildQa, childQa) && !same(existingChildQa, priorChildQa)) {
  throw new Error(`${splitChildId}: foreign visualization QA record`)
}
if (!existingChildQa) {
  const retainedIndex = visualizationRecords.findIndex((record) => record.goalId === splitRetainedId)
  visualizationRecords.splice(retainedIndex + 1, 0, childQa)
} else Object.assign(existingChildQa, childQa)
visualizationRecords.sort((left, right) => (
  String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
  || String(left.goalId).localeCompare(String(right.goalId))
))
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

const addChildToView = (node: unknown, path: string): number => {
  if (Array.isArray(node)) {
    let retainedOccurrences = 0
    for (let index = 0; index < node.length; index += 1) {
      const entry = node[index] as JsonRecord
      if (entry?.kind === 'goalEntry' && entry.goalId === splitRetainedId) {
        retainedOccurrences += 1
        const next = node[index + 1] as JsonRecord | undefined
        if (next?.kind !== 'goalEntry' || next.goalId !== splitChildId) {
          node.splice(index + 1, 0, { kind: 'goalEntry', goalId: splitChildId })
        }
        index += 1
      } else if (entry?.kind === 'goalEntry' && entry.goalId === splitChildId) {
        throw new Error(`${path}: split child occurs without immediate retained predecessor`)
      } else retainedOccurrences += addChildToView(entry, path)
    }
    return retainedOccurrences
  }
  if (node && typeof node === 'object') return Object.values(node as JsonRecord)
    .reduce((sum: number, value) => sum + addChildToView(value, path), 0)
  return 0
}
for (const path of compositionViewPaths) {
  const view = readJson(path)
  const occurrences = addChildToView(view.rootNodes, path)
  if (occurrences !== 1) throw new Error(`${path}: expected exactly one explicit retained split entry, found ${occurrences}`)
  outputs.set(path, serializeJson(view))
}

const atlasNavigation = readJson(paths.atlasNavigation)
const navigationOccurrences = addChildToView(atlasNavigation.rootNodes, paths.atlasNavigation)
if (navigationOccurrences !== 1) {
  throw new Error(`${paths.atlasNavigation}: expected exactly one retained split entry, found ${navigationOccurrences}`)
}
outputs.set(paths.atlasNavigation, serializeJson(atlasNavigation))

const atlasSources = readJson(paths.atlasSources)
if (
  atlasSources.expectedCurricularAtomicGoalCount !== 793
  && atlasSources.expectedCurricularAtomicGoalCount !== 794
) throw new Error('Unexpected Mathematics atlas curricularAtomic denominator')
atlasSources.expectedCurricularAtomicGoalCount = 794
outputs.set(paths.atlasSources, serializeJson(atlasSources))

let goalBookModelTest = readFileSync(absolute(paths.goalBookModelTest), 'utf8')
goalBookModelTest = replaceOrRequireExactOnce(
  goalBookModelTest,
  "const EXPECTED_NATIONAL_MATH_MODEL_DIGEST = 'sha256:bb22b432b2ac9bfe89d94d2688c74fd39262eef2924c5ac41e1d39bb0613b266'",
  "const EXPECTED_NATIONAL_MATH_MODEL_DIGEST = 'sha256:3f1f2fd3cfd7ec37270eb08c854e66ce15bffbf3f338ee050fc3f62cc8d0b85a'",
  'national Mathematics BookModel digest test binding',
)
goalBookModelTest = replaceOrRequireExactOnce(
  goalBookModelTest,
  'assert.equal(nationalAtlas.book.pageCount, 793)',
  'assert.equal(nationalAtlas.book.pageCount, 794)',
  'national Mathematics BookModel page-count test binding',
)
goalBookModelTest = replaceOrRequireExactOnce(
  goalBookModelTest,
  "assert.equal(new Set(nationalAtlas.pages.map(({ goalId }) => goalId)).size, 793)",
  "assert.equal(new Set(nationalAtlas.pages.map(({ goalId }) => goalId)).size, 794)",
  'national Mathematics unique-page-count test binding',
)
outputs.set(paths.goalBookModelTest, goalBookModelTest)

let goalBookPublicationTest = readFileSync(absolute(paths.goalBookPublicationTest), 'utf8')
goalBookPublicationTest = replaceOrRequireExactOnce(
  goalBookPublicationTest,
  'assert.equal(verified.model.pages.length, 793)',
  'assert.equal(verified.model.pages.length, 794)',
  'published Mathematics page-count test binding',
)
outputs.set(paths.goalBookPublicationTest, goalBookPublicationTest)

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(absolute(path), bytes)
  else if (readFileSync(absolute(path), 'utf8') !== bytes) {
    throw new Error(`Mathematics B032 adjudication drift in ${path}; run with --write`)
  }
}

const runDerivedQualityChecks = (): void => {
  execFileSync('npm', [
    'exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts',
    ...(writeMode ? [] : ['--check']), '--subject=mathematik',
  ], { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' })
  execFileSync('npm', [
    'exec', '--', 'tsx', 'scripts/reportGoalVisualizationRolloutStatus.ts',
    '--subject=mathematik', ...(writeMode ? [] : ['--check']),
  ], { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' })
}
runDerivedQualityChecks()

console.log(
  `CHECK apply_math_batch_032_adjudication ${writeMode ? 'WRITE' : 'PASS'} `
  + `revisions=3 retainedSplit=1 newAtoms=1 mappingReviews=${routeSpecs.size} `
  + `directMappings=3 views=${compositionViewPaths.length}+navigation assessment=1 `
  + `denominator=793->794 files=${outputs.size}+2-derived-status publicTestBindings=4`,
)
