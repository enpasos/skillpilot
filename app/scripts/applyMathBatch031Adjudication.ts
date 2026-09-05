import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded Layer-A ledgers predate one shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && process.argv.includes('--check')) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-09-05'
const reviewedAtIso = '2026-09-05T01:30:00.000Z'
const reviewer = 'codex-mathematics-b031-adjudication-2026-09-05'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const orientationId = '65365dce-f33f-49d8-9516-42f75883aa86'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
} as const

type Revision = {
  id: string
  beforeTitleDe: string
  beforeTitleEn: string
  beforeDescriptionDe: string
  beforeDescriptionEn: string
  titleDe: string
  titleEn: string
  descriptionDe: string
  descriptionEn: string
  requires?: string[]
  atomicityReason: string
  memoryReason: string
  visualizationNote: string
}

const revisions: Revision[] = [
  {
    id: 'fa0b6b69-ce54-4711-90e6-26f27249cd71',
    beforeTitleDe: 'Lineare Gleichungen mit Klammern und Verhältnisgleichungen lösen',
    beforeTitleEn: 'Solve linear equations with brackets and ratio equations',
    beforeDescriptionDe: 'Die lernende Person kann lineare Gleichungen auch mit Klammern sowie Verhältnisgleichungen lösen, unterschiedliche Verfahren nachvollziehbar nutzen und Ergebnisse fachsprachlich begründen.',
    beforeDescriptionEn: 'The learner can solve linear equations including equations with brackets as well as ratio equations, use different methods transparently, and justify results using correct terminology.',
    titleDe: 'Lösungswege für Klammer- und Verhältnisgleichungen vergleichen',
    titleEn: 'Compare solution methods for bracketed and ratio equations',
    descriptionDe: 'Die lernende Person kann nach dem Lösen einer linearen Klammergleichung und einer Verhältnisgleichung die jeweils tragende Struktur – Distributivgesetz beziehungsweise Proportionalität mit zulässigen Nennern – erläutern, die Lösungswege vergleichen und ihre Gültigkeit durch Einsetzen prüfen.',
    descriptionEn: 'After solving a bracketed linear equation and a ratio equation, the learner can explain the governing structure in each case—the distributive law or proportionality with admissible denominators—compare the solution methods, and check their validity by substitution.',
    requires: [
      '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6',
      '959cc50b-6c81-4fa1-800f-4804a707b1ee',
      orientationId,
    ],
    atomicityReason: 'Das Ziel prüft nicht erneut zwei isolierte Grundverfahren, sondern genau eine Vergleichs- und Begründungsleistung, die auf den bereits vorausgesetzten Einzelkompetenzen zu linearen und Verhältnisgleichungen aufbaut.',
    memoryReason: 'Verfahrenswahl, Strukturvergleich und Gültigkeitsprüfung müssen an neuen Gleichungen begründet werden; ein Memory-Deck würde diese Transferleistung nicht tragen.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild stellt je einen korrekten Klammer- und Verhältnisgleichungsweg nebeneinander dar und eignet sich damit unmittelbar für den nun expliziten Struktur- und Verfahrensvergleich.',
  },
  {
    id: '17c9e061-fe52-5553-be81-fec7a525fcbd',
    beforeTitleDe: 'Gleichungen und Ungleichungen lösen',
    beforeTitleEn: 'Solve equations and inequalities',
    beforeDescriptionDe: 'Die lernende Person kann einfache Gleichungen bzw. Ungleichungen lösen, die Lösungsmenge angeben und Bedingungen (z. B. Nenner ≠ 0) beachten.',
    beforeDescriptionEn: 'The learner can solve basic equations or inequalities, state the solution set and respect conditions (e.g. denominator ≠ 0).',
    titleDe: 'Algebraische Lösungswege auf Gültigkeit prüfen',
    titleEn: 'Check the validity of algebraic solution paths',
    descriptionDe: 'Die lernende Person kann bei einem vorgegebenen Lösungsweg zu einer Gleichung oder linearen Ungleichung prüfen, ob Definitionsmenge, Äquivalenzumformungen, Vorzeichenregeln und angegebene Lösungsmenge zusammenpassen, einen Fehler lokalisieren und begründet korrigieren.',
    descriptionEn: 'Given a solution path for an equation or linear inequality, the learner can check whether the domain, equivalent transformations, sign rules, and stated solution set are consistent, locate an error, and correct it with justification.',
    requires: [
      '96c55cb6-d2c7-5145-8567-b5f570f55a8a',
      '74dc4b0d-a167-564c-bdc1-5cf510aee280',
      'f17935b0-189f-5e0c-988d-ce508b710097',
      orientationId,
    ],
    atomicityReason: 'Gegenstand ist eine einzelne diagnostische Leistung: die innere Gültigkeit eines vorgegebenen algebraischen Lösungswegs prüfen und einen lokalisierten Fehler begründet korrigieren. Gleichung und Ungleichung sind dabei zulässige Aufgabenvarianten, keine addierten Beherrschungsziele.',
    memoryReason: 'Die Gültigkeitsprüfung erfordert kontextabhängiges Diagnostizieren von Umformungen, Bedingungen und Lösungsmengen; isolierte Merksätze reichen dafür nicht aus.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild zeigt korrekte Gleichungs- und Ungleichungswege samt Lösungsmenge und Nebenbedingung. Es liefert damit geeignete Referenzfälle für die nun geforderte Gültigkeitsdiagnose, ohne selbst die Prüfung zu ersetzen.',
  },
  {
    id: '647ec09d-68ae-57db-9ca4-aeb2da4218f1',
    beforeTitleDe: 'Formale Schreibweisen situationsgerecht nutzen',
    beforeTitleEn: 'Use formal writing appropriately',
    beforeDescriptionDe: 'Die lernende Person kann formale Schreibweisen situationsgerecht einsetzen (z. B. Mengen- und Intervallschreibweise, Funktionsnotation) und Ergebnisse sauber notieren.',
    beforeDescriptionEn: 'The learner can use formal writing appropriately (e.g. set/interval notation, function notation) and record results cleanly.',
    titleDe: 'Formale Schreibweisen situationsgerecht nutzen',
    titleEn: 'Use formal notation appropriately',
    descriptionDe: 'Die lernende Person kann Mengen-, Intervall- und Funktionsnotation passend zur mathematischen Aussage auswählen, korrekt verwenden und erläutern, welche Objekte, Mengen oder Zuordnungen damit bezeichnet werden.',
    descriptionEn: 'The learner can select and correctly use set, interval, and function notation to match a mathematical statement and explain which objects, sets, or mappings the notation denotes.',
    atomicityReason: 'Auswahl, korrekte Verwendung und Bedeutungsdeutung formaler Notation sind Aspekte derselben Repräsentationskompetenz; die Revision ersetzt die oberflächliche Forderung nach sauberem Schriftbild durch prüfbare Semantik.',
    memoryReason: 'Die passende Notation muss aus der Bedeutung einer neuen Aussage gewählt und zurückübersetzt werden; dafür ist Repräsentationspraxis statt eines gesonderten Memory-Decks erforderlich.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild verknüpft dieselbe Menge korrekt mit Mengenschreibweise, abgeschlossenem Intervall und Zahlengerade und trennt davon die Funktionsnotation. Es bleibt zur semantisch präzisierten Beschreibung vollständig passend.',
  },
  {
    id: 'c31d3a7a-778b-5ae3-9aa4-7b5674047f83',
    beforeTitleDe: 'Parallele und senkrechte Geraden konstruieren',
    beforeTitleEn: 'Construct parallel and perpendicular lines',
    beforeDescriptionDe: 'Die lernende Person kann parallele und senkrechte Geraden mit Geodreieck oder Zirkel sauber konstruieren und die Konstruktion mit der passenden Fachsprache erläutern.',
    beforeDescriptionEn: 'The learner can accurately construct parallel and perpendicular lines using a set square or compass and explain the construction with appropriate terminology.',
    titleDe: 'Parallele und senkrechte Geraden konstruieren',
    titleEn: 'Construct parallel and perpendicular lines',
    descriptionDe: 'Die lernende Person kann parallele und senkrechte Geraden mit dem Geodreieck oder mit Zirkel und Lineal konstruieren und die jeweils genutzte geometrische Eigenschaft fachsprachlich erläutern.',
    descriptionEn: 'The learner can construct parallel and perpendicular lines using a set square or a compass and straightedge and explain the geometric property used in each construction with appropriate terminology.',
    atomicityReason: 'Werkzeugausführung und Begründung sichern dieselbe Konstruktionskompetenz; die Revision korrigiert lediglich die unvollständige Werkzeugangabe für Zirkelkonstruktionen.',
    memoryReason: 'Die Konstruktion muss ausgeführt und über ihre geometrische Invariante begründet werden; ein isoliertes Memory-Deck ist dafür nicht nötig.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild zeigt die parallele und senkrechte Geodreieck-Konstruktion geometrisch korrekt; die ergänzte zulässige Alternative Zirkel und Lineal widerspricht der Darstellung nicht.',
  },
  {
    id: 'f0a49da2-018b-4cda-adbd-27047b610a0f',
    beforeTitleDe: 'Kongruenzsätze anwenden und begründen',
    beforeTitleEn: 'Apply and justify congruence theorems',
    beforeDescriptionDe: 'Die lernende Person kann Kongruenzsätze zur Begründung gleicher Dreiecke anwenden, passende Voraussetzungen benennen und die Argumentation nachvollziehbar darstellen.',
    beforeDescriptionEn: 'The learner can apply congruence theorems to justify congruent triangles, name suitable conditions, and present the argument clearly.',
    titleDe: 'Kongruenzsätze anwenden und begründen',
    titleEn: 'Apply and justify triangle congruence criteria',
    descriptionDe: 'Die lernende Person kann einen geeigneten Kongruenzsatz auswählen, seine Voraussetzungen an zwei Dreiecken prüfen und damit deren Kongruenz nachvollziehbar begründen.',
    descriptionEn: 'The learner can select an appropriate triangle congruence criterion, verify its conditions for two triangles, and use it to justify their congruence clearly.',
    atomicityReason: 'Auswahl, Voraussetzungskontrolle und Schluss auf Kongruenz bilden eine zusammenhängende geometrische Argumentation; es werden keine unabhängig beherrschbaren Teilziele gebündelt.',
    memoryReason: 'Die Auswahl eines Kongruenzkriteriums und die Prüfung seiner Voraussetzungen müssen an wechselnden Figuren begründet werden; reine Merkabfrage genügt nicht.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild nennt korrekte Kongruenzkriterien und führt an einem SWS-Beispiel Voraussetzungen und Kongruenzschluss sichtbar zusammen.',
  },
  {
    id: 'f65ab452-1884-57b0-9be3-c7d9e4944891',
    beforeTitleDe: 'Geometrische Beziehungen an Kreisen und Zylindern begründet anwenden',
    beforeTitleEn: 'Apply geometric relationships for circles and cylinders with justification',
    beforeDescriptionDe: 'Die lernende Person kann Darstellungen von Kreisen und Zylindern deuten, passende Größenbeziehungen erkennen und diese in einfachen geometrischen Begründungen nutzen.',
    beforeDescriptionEn: 'The learner can interpret representations of circles and cylinders, identify suitable metric relationships, and use them in simple geometric justifications.',
    titleDe: 'Zylindermantel aus dem Kreisumfang herleiten',
    titleEn: 'Derive the lateral area of a cylinder from the circumference of its base',
    descriptionDe: 'Die lernende Person kann im Netz eines geraden Kreiszylinders begründen, dass eine Seite des Mantelrechtecks dem Umfang 2πr der Grundfläche und die andere der Höhe h entspricht, und daraus die Mantelfläche M = 2πrh herleiten.',
    descriptionEn: 'Using the net of a right circular cylinder, the learner can justify that one side of the lateral rectangle equals the circumference 2πr of the base and the other equals the height h, and thereby derive the lateral area M = 2πrh.',
    requires: [
      '8064088b-dc0a-4a67-ad63-360fdcc9869d',
      '11c88ea2-8502-5008-bec2-3e491c75ace4',
      orientationId,
    ],
    atomicityReason: 'Kreisumfang, Seitenlänge des abgewickelten Mantelrechtecks und Mantelflächenformel sind aufeinanderfolgende Begründungsschritte derselben Zylindernetz-Kompetenz; die unabhängige Tangentengeometrie bleibt in ihrem eigenen Ziel.',
    memoryReason: 'Die Mantelflächenformel soll aus Netz und Kreisumfang hergeleitet und nicht isoliert memoriert werden; ein eigenes Memory-Deck ist nicht erforderlich.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild zeigt im großen linken Panel exakt das Zylindernetz, U = 2πr und M = U·h = 2πrh. Das fachlich korrekte, klar getrennte Tangentenpanel ist ergänzender Kontext und wird nicht als Evidenz für das atomare Ziel gewertet; ein Bildaustausch wäre weder nötig noch im Sinne der Nano-Banana-Präferenz.',
  },
  {
    id: 'cf8c5677-f3c5-5563-8f0a-68443fbab7bf',
    beforeTitleDe: 'Geometrische Probleme mit Ortslinien konstruieren',
    beforeTitleEn: 'Solve geometric problems using loci constructions',
    beforeDescriptionDe: 'Die lernende Person kann geometrische Probleme mithilfe von Ortslinien wie Kreislinie, Mittelsenkrechte, Winkelhalbierende, Mittelparallele und Thaleskreis zeichnerisch lösen, optional mit dynamischer Geometriesoftware, und die Lösung beschreiben.',
    beforeDescriptionEn: 'The learner can solve geometric problems by drawing loci such as circles, perpendicular bisectors, angle bisectors, midlines, and Thales circles, optionally using dynamic geometry software, and describe the solution.',
    titleDe: 'Geometrische Probleme mit Ortslinien konstruieren',
    titleEn: 'Solve geometric problems using locus constructions',
    descriptionDe: 'Die lernende Person kann geometrische Probleme mithilfe geeigneter Ortslinien wie Kreislinie, Mittelsenkrechte, Winkelhalbierende, Mittelparallele und Thaleskreis zeichnerisch lösen, optional mit dynamischer Geometriesoftware, und die Wahl der Ortslinien sowie die aus ihren Schnittpunkten gewonnene Lösung begründen.',
    descriptionEn: 'The learner can solve geometric problems graphically using suitable loci such as circles, perpendicular bisectors, angle bisectors, lines midway between parallel lines, and Thales circles, optionally with dynamic geometry software, and justify the choice of loci and the solution obtained from their intersections.',
    atomicityReason: 'Bedingungen in Ortslinien übersetzen, ihre Schnittpunkte konstruieren und die Lösung begründen sind Phasen eines einzigen Ortslinienverfahrens; die Beispiele sind austauschbare Varianten.',
    memoryReason: 'Die geeignete Ortslinie muss aus einer neuen geometrischen Bedingung abgeleitet und begründet werden; ein Memory-Deck würde diese Konstruktions- und Transferleistung nicht ersetzen.',
    visualizationNote: 'Das unveränderte Nano-Banana-Pro-Bild zeigt die Mittelsenkrechte als Ortslinie gleicher Abstände und ihren Lösungspunkt korrekt; die präzisierte Begründungsanforderung wird dadurch unterstützt.',
  },
]

const trigRouteGoalIds = [
  '46bdcc16-418f-417a-89cf-033d7ae6c8cc',
  '82597dfb-0ec6-4a77-abaf-e1d6bdd12041',
  '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
  '8d30d241-0247-48ac-83d3-4e0de61584d3',
  '5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11',
] as const
const circleFoundationId = '8a691345-3216-522c-a898-d65e8e94db28'
const cylinderGoalId = 'f65ab452-1884-57b0-9be3-c7d9e4944891'
const redundantCylinderRouteGoalIds = [
  '9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5',
  '6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9',
] as const

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
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== landscapeId) throw new Error('Unexpected canonical Mathematics landscape')
const goals = canonical.goals as JsonRecord[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length) throw new Error('Duplicate canonical Mathematics goal IDs')

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`${revision.id}: missing canonical goal`)
  const before = goal.title === revision.beforeTitleDe
    && goal.titleEn === revision.beforeTitleEn
    && goal.description === revision.beforeDescriptionDe
    && goal.descriptionEn === revision.beforeDescriptionEn
  const after = goal.title === revision.titleDe
    && goal.titleEn === revision.titleEn
    && goal.description === revision.descriptionDe
    && goal.descriptionEn === revision.descriptionEn
  if (!before && !after) throw new Error(`${revision.id}: semantic text is outside the bounded states`)
  if (goal.type !== 'atomic' || !same(goal.contains ?? [], [])) throw new Error(`${revision.id}: expected retained atomic goal`)

  goal.title = revision.titleDe
  goal.titleEn = revision.titleEn
  goal.description = revision.descriptionDe
  goal.descriptionEn = revision.descriptionEn
  if (revision.requires) goal.requires = [...revision.requires]

  const links = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
    .filter((link) => link.type === 'goal-visualization')
  if (links.length !== 1) throw new Error(`${revision.id}: expected one retained visualization link`)
  Object.assign(links[0], {
    title: `Visualisierung: ${revision.titleDe}`,
    description: `Visualisierung zum Lernziel: ${revision.titleDe}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.descriptionDe}`,
  })
}

for (const goalId of trigRouteGoalIds) {
  const goal = goalById.get(goalId)
  if (!goal) throw new Error(`${goalId}: missing trigonometry route goal`)
  const requires = goal.requires as string[]
  const before = requires.includes(cylinderGoalId)
  const after = requires.includes(circleFoundationId) && !requires.includes(cylinderGoalId)
  if (!before && !after) throw new Error(`${goalId}: trigonometry route is outside the bounded states`)
  goal.requires = [...new Set(requires.map((id) => id === cylinderGoalId ? circleFoundationId : id))]
}
for (const goalId of redundantCylinderRouteGoalIds) {
  const goal = goalById.get(goalId)
  if (!goal) throw new Error(`${goalId}: missing solid-geometry route goal`)
  goal.requires = (goal.requires as string[]).filter((id) => id !== cylinderGoalId)
}
outputs.set(paths.canonical, serializeJson(canonical))

const semanticKinds = readJson(paths.semanticKinds)
const semanticDecisionById = new Map((semanticKinds.decisions as JsonRecord[])
  .map((decision) => [String(decision.goalId), decision]))
const refingerprintIds = new Set([
  ...revisions.map((revision) => revision.id),
  ...trigRouteGoalIds,
  ...redundantCylinderRouteGoalIds,
])
for (const goalId of refingerprintIds) {
  const goal = goalById.get(goalId)
  const decision = semanticDecisionById.get(goalId)
  if (!goal || !decision || decision.decisionStatus !== 'authoritative') {
    throw new Error(`${goalId}: missing authoritative semantic-kind binding`)
  }
  if (revisions.some((revision) => revision.id === goalId) && decision.semanticKind !== 'curricularAtomic') {
    throw new Error(`${goalId}: revised goal must remain curricularAtomic`)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
outputs.set(paths.semanticKinds, serializeJson(semanticKinds))

const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const atomicityRecord = atomicityById.get(revision.id)
  if (!atomicityRecord) throw new Error(`${revision.id}: missing atomicity review`)
  Object.assign(atomicityRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
    suggestedSplit: [],
  })
  const memoryRecord = memoryById.get(revision.id)
  if (!memoryRecord || memoryRecord.status !== 'no_memory_needed') {
    throw new Error(`${revision.id}: expected no_memory_needed review`)
  }
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
  delete memoryRecord.memoryGoalIds
  delete memoryRecord.deckIds
}
outputs.set(paths.atomicity, serializeJsonl(atomicity))
outputs.set(paths.memory, serializeJsonl(memory))

const visualizationQa = readJson(paths.visualizationQa)
const visualizationById = new Map((visualizationQa.records as JsonRecord[])
  .map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  const record = visualizationById.get(revision.id)
  if (!record || record.visualizationState !== 'available' || typeof record.assetSha256 !== 'string') {
    throw new Error(`${revision.id}: expected one available visualization QA record`)
  }
  const canonicalAsset = readFileSync(absolute(String(record.canonicalAssetPath)))
  const publicAsset = readFileSync(absolute(String(record.publicAssetPath)))
  if (!canonicalAsset.equals(publicAsset) || digest(canonicalAsset) !== record.assetSha256) {
    throw new Error(`${revision.id}: retained visualization bytes or digest drifted`)
  }
  Object.assign(record, {
    title: revision.titleDe,
    description: revision.descriptionDe,
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
}
outputs.set(paths.visualizationQa, serializeJson(visualizationQa))

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(absolute(path), bytes)
  else if (readFileSync(absolute(path), 'utf8') !== bytes) {
    throw new Error(`Mathematics B031 adjudication drift in ${path}; run with --write`)
  }
}

console.log(`CHECK apply_math_batch_031_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=${revisions.length} refingerprinted=${refingerprintIds.size} files=${outputs.size}`)
