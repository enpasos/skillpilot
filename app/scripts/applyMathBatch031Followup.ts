import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CanonicalAuthoringGoal } from '../src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type Revision = {
  id: string
  before: {
    titleDe: string
    titleEn: string
    descriptionDe: string
    descriptionEn: string
    requires: string[]
  }
  after: {
    titleDe: string
    titleEn: string
    descriptionDe: string
    descriptionEn: string
    requires: string[]
  }
  atomicityReason: string
  memoryReason: string
  visualizationNote: string
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
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
} as const
const reviewedAt = '2026-09-05'
const reviewedAtIso = '2026-09-05T20:30:00.000Z'
const reviewer = 'codex-mathematics-b031r-dual-review-followup-2026-09-05'

const revisions: Revision[] = [
  {
    id: 'fa0b6b69-ce54-4711-90e6-26f27249cd71',
    before: {
      titleDe: 'Lösungswege für Klammer- und Verhältnisgleichungen vergleichen',
      titleEn: 'Compare solution methods for bracketed and ratio equations',
      descriptionDe: 'Die lernende Person kann nach dem Lösen einer linearen Klammergleichung und einer Verhältnisgleichung die jeweils tragende Struktur – Distributivgesetz beziehungsweise Proportionalität mit zulässigen Nennern – erläutern, die Lösungswege vergleichen und ihre Gültigkeit durch Einsetzen prüfen.',
      descriptionEn: 'After solving a bracketed linear equation and a ratio equation, the learner can explain the governing structure in each case—the distributive law or proportionality with admissible denominators—compare the solution methods, and check their validity by substitution.',
      requires: [
        '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6',
        '959cc50b-6c81-4fa1-800f-4804a707b1ee',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    after: {
      titleDe: 'Lösungswege für Klammer- und Verhältnisgleichungen vergleichen',
      titleEn: 'Compare solution methods for bracketed and ratio equations',
      descriptionDe: 'Die lernende Person kann nach dem Lösen einer linearen Klammergleichung und einer Verhältnisgleichung die jeweils tragende Struktur – Distributivgesetz beziehungsweise Proportionalität mit zulässigen Nennern – erläutern, Gemeinsamkeiten und Unterschiede der zulässigen Umformungen vergleichen und die erhaltenen Lösungen durch Einsetzen in die jeweilige Ausgangsgleichung prüfen.',
      descriptionEn: 'After solving a bracketed linear equation and a ratio equation, the learner can explain the governing structure in each case—the distributive law or proportionality with admissible denominators—compare similarities and differences in the admissible transformations, and check the obtained solutions by substituting them into the respective original equation.',
      requires: [
        '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6',
        '959cc50b-6c81-4fa1-800f-4804a707b1ee',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    atomicityReason: 'Das Ziel prüft eine einzige Vergleichs- und Begründungsleistung auf Basis bereits beherrschter Einzelverfahren; die Lösungsprobe kontrolliert nur die Ergebnisse und wird nicht mit einem Beweis für jeden Umformungsschritt verwechselt.',
    memoryReason: 'Strukturvergleich, Zulässigkeitsbegründung und Lösungsprobe müssen an neuen Gleichungen geleistet werden; ein Memory-Deck würde diese Transferleistung nicht tragen.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt für den Vergleich beider Verfahren geeignet; der Text präzisiert lediglich die Reichweite der Lösungsprobe.',
  },
  {
    id: '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
    before: {
      titleDe: 'Parameter trigonometrischer Funktionen deuten',
      titleEn: 'Interpret Parameters of Trigonometric Functions',
      descriptionDe: 'Die lernende Person kann Parameter von Sinus- und Kosinusfunktionen in Termen und Graphen deuten und deren Wirkung auf Amplitude, Verschiebung und Periodenlänge beschreiben.',
      descriptionEn: 'The learner can interpret parameters of sine and cosine functions in equations and graphs and describe their effect on amplitude, translation, and period length.',
      requires: [
        'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e',
        '8a691345-3216-522c-a898-d65e8e94db28',
        '71a483ba-9680-4654-bb5e-5ab5427f0919',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    after: {
      titleDe: 'Parameter trigonometrischer Funktionen deuten',
      titleEn: 'Interpret parameters of trigonometric functions',
      descriptionDe: 'Die lernende Person kann Parameter von Sinus- und Kosinusfunktionen in Termen und Graphen deuten und deren Wirkung auf Amplitude, Verschiebung und Periodenlänge beschreiben.',
      descriptionEn: 'The learner can interpret parameters of sine and cosine functions in expressions and graphs and describe their effects on amplitude, translation, and period length.',
      requires: [
        '46bdcc16-418f-417a-89cf-033d7ae6c8cc',
        '82597dfb-0ec6-4a77-abaf-e1d6bdd12041',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    atomicityReason: 'Parameterwirkungen in Term und Graph sind gekoppelte Darstellungen derselben Transformationskompetenz; die neue Route setzt die dafür nötige Funktions-, Graph- und Einheitskreisvorstellung explizit voraus.',
    memoryReason: 'Parameterrollen können begrifflich gestützt werden; die Wirkung muss an neuen Termen und Graphen erklärt und übertragen werden.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt für Parameterwirkungen geeignet; korrigiert werden ausschließlich Lernroute und englische Begriffsparität.',
  },
  {
    id: '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
    before: {
      titleDe: 'Parameter trigonometrischer Funktionen deuten',
      titleEn: 'Interpret parameters of trigonometric functions',
      descriptionDe: 'Die lernende Person kann Parameter von Sinus- und Kosinusfunktionen in Termen und Graphen deuten und deren Wirkung auf Amplitude, Verschiebung und Periodenlänge beschreiben.',
      descriptionEn: 'The learner can interpret parameters of sine and cosine functions in expressions and graphs and describe their effects on amplitude, translation, and period length.',
      requires: [
        '46bdcc16-418f-417a-89cf-033d7ae6c8cc',
        '82597dfb-0ec6-4a77-abaf-e1d6bdd12041',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    after: {
      titleDe: 'Parameter trigonometrischer Funktionen deuten',
      titleEn: 'Interpret parameters of trigonometric functions',
      descriptionDe: 'Die lernende Person kann Parameter von Sinus- und Kosinusfunktionen in Termen und Graphen deuten und deren Wirkung auf Amplitude, Spiegelung, horizontale und vertikale Verschiebung sowie Periodenlänge beschreiben.',
      descriptionEn: 'The learner can interpret parameters of sine and cosine functions in expressions and graphs and describe their effects on amplitude, reflection, horizontal and vertical translation, and period length.',
      requires: [
        '46bdcc16-418f-417a-89cf-033d7ae6c8cc',
        '82597dfb-0ec6-4a77-abaf-e1d6bdd12041',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    atomicityReason: 'Amplitude, Spiegelung, Verschiebungen und Periode sind gekoppelte graphische Wirkungen derselben Parameterdeutung an trigonometrischen Termen und Graphen.',
    memoryReason: 'Parameterrollen können gestützt werden; insbesondere negative Faktoren und ihre Spiegelungswirkung müssen an neuen Termen und Graphen begründet übertragen werden.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt unverändert; der Text ergänzt die bislang fehlende Spiegelungswirkung negativer Parameter.',
  },
  {
    id: 'a6c8db0a-a8a2-46bf-af04-d73d69d6c8b1',
    before: {
      titleDe: 'Trigonometrische Graphen aus Funktionstermen zeichnen',
      titleEn: 'Draw trigonometric graphs from function expressions',
      descriptionDe: 'Die lernende Person kann für Funktionsterme der Form $a\\cdot\\sin(b\\cdot(x+c))+d$ mithilfe von Amplitude, Periode und Verschiebungen den zugehörigen Graphen zeichnen.',
      descriptionEn: 'The learner can draw the graph of expressions of the form $a\\cdot\\sin(b\\cdot(x+c))+d$ using amplitude, period, and shifts.',
      requires: [
        '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
        '302a857d-ad71-4bdf-81f3-851c95aeefe1',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    after: {
      titleDe: 'Trigonometrische Graphen aus Funktionstermen zeichnen',
      titleEn: 'Draw trigonometric graphs from function expressions',
      descriptionDe: 'Die lernende Person kann für Funktionsterme der Form $a\\cdot\\sin(b\\cdot(x+c))+d$ den zugehörigen Graphen aus dem Sinusgrundgraphen mithilfe von Amplitude, Periodenlänge, horizontaler und vertikaler Verschiebung sowie gegebenenfalls Spiegelung zeichnen.',
      descriptionEn: 'The learner can draw the graph of an expression of the form $a\\cdot\\sin(b\\cdot(x+c))+d$ from the basic sine graph using amplitude, period length, horizontal and vertical translation, and reflection where applicable.',
      requires: [
        '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
        '302a857d-ad71-4bdf-81f3-851c95aeefe1',
        '65365dce-f33f-49d8-9516-42f75883aa86',
      ],
    },
    atomicityReason: 'Alle genannten Transformationen sind Konstruktionsschritte für denselben Graphen aus einem gegebenen Sinusterm und bilden eine einzelne Darstellungsleistung.',
    memoryReason: 'Die Transformationsnamen können gestützt werden; ihre korrekte Auswahl, Reihenfolge und Spiegelungswirkung müssen am neuen Term eigenständig umgesetzt werden.',
    visualizationNote: 'Das vorhandene Nano-Banana-Pro-Bild bleibt unverändert; ergänzt wird nur die mathematisch notwendige Spiegelungsoption.',
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
const stateMatches = (goal: CanonicalAuthoringGoal, state: Revision['before']): boolean => (
  goal.title === state.titleDe
  && goal.titleEn === state.titleEn
  && goal.description === state.descriptionDe
  && goal.descriptionEn === state.descriptionEn
  && stableJson(goal.requires ?? []) === stableJson(state.requires)
)

const canonical = readJson(paths.canonical)
if (canonical.landscapeId !== '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced') throw new Error('Unexpected canonical Mathematics landscape')
const goals = canonical.goals as CanonicalAuthoringGoal[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))

for (const revision of revisions) {
  const goal = goalById.get(revision.id)
  if (!goal) throw new Error(`${revision.id}: missing canonical goal`)
  const finalState = [...revisions].reverse().find((candidate) => candidate.id === revision.id)!.after
  if (!stateMatches(goal, revision.before) && !stateMatches(goal, revision.after) && !stateMatches(goal, finalState)) {
    throw new Error(`${revision.id}: outside bounded before/after state`)
  }
  Object.assign(goal, {
    title: revision.after.titleDe,
    titleEn: revision.after.titleEn,
    description: revision.after.descriptionDe,
    descriptionEn: revision.after.descriptionEn,
    requires: [...revision.after.requires],
  })
  const links = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
    .filter((link) => link.type === 'goal-visualization')
  if (links.length !== 1) throw new Error(`${revision.id}: expected one retained visualization link`)
  Object.assign(links[0], {
    title: `Visualisierung: ${revision.after.titleDe}`,
    description: `Visualisierung zum Lernziel: ${revision.after.titleDe}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${revision.after.titleDe}". ${revision.after.descriptionDe}`,
  })
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticById = new Map((semanticKinds.decisions as JsonRecord[])
  .map((decision) => [String(decision.goalId), decision]))
const atomicity = readJsonl(paths.atomicity)
const atomicityById = new Map(atomicity.map((record) => [String(record.goalId), record]))
const memory = readJsonl(paths.memory)
const memoryById = new Map(memory.map((record) => [String(record.goalId), record]))

for (const revision of revisions) {
  const goal = goalById.get(revision.id)!
  const semantic = semanticById.get(revision.id)
  if (!semantic || semantic.semanticKind !== 'curricularAtomic' || semantic.decisionStatus !== 'authoritative') {
    throw new Error(`${revision.id}: missing authoritative curricularAtomic binding`)
  }
  semantic.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  const atomic = atomicityById.get(revision.id)
  if (!atomic) throw new Error(`${revision.id}: missing atomicity review`)
  Object.assign(atomic, {
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
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}

const visualizationQa = readJson(paths.visualizationQa)
const visualizationById = new Map((visualizationQa.records as JsonRecord[])
  .map((record) => [String(record.goalId), record]))
for (const revision of revisions) {
  const record = visualizationById.get(revision.id)
  if (!record || record.visualizationState !== 'available') throw new Error(`${revision.id}: expected retained visualization`)
  const canonicalAsset = readFileSync(absolute(String(record.canonicalAssetPath)))
  const publicAsset = readFileSync(absolute(String(record.publicAssetPath)))
  if (!canonicalAsset.equals(publicAsset) || digest(canonicalAsset) !== record.assetSha256) {
    throw new Error(`${revision.id}: retained visualization bytes or digest drifted`)
  }
  Object.assign(record, {
    title: revision.after.titleDe,
    description: revision.after.descriptionDe,
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

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
  [paths.visualizationQa, serializeJson(visualizationQa)],
])
const changed = [...outputs].filter(([path, value]) => readFileSync(absolute(path), 'utf8') !== value)
if (!writeMode && changed.length > 0) {
  throw new Error(`Mathematics B031 follow-up is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}
if (writeMode) changed.forEach(([path, value]) => writeFileSync(absolute(path), value, 'utf8'))

console.log(`CHECK apply_math_batch_031_followup ${writeMode ? 'WRITE' : 'PASS'} revisions=${revisions.length} changed=${changed.length}`)
