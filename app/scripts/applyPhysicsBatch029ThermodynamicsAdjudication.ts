import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
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
const reviewer = 'codex-physics-b029-thermodynamics-adjudication-2026-09-02'
const deckId = 'de_gymnasium_physics_mechanics_ephase'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  goalMemory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  cardMemory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl',
  canonicalDeckDe: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  canonicalDeckEn: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  publicDeckDe: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  publicDeckEn: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  backendDeckDe: 'backend/src/main/resources/static/data/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  backendDeckEn: 'backend/src/main/resources/static/data/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
} as const

const revisions: Record<string, Revision> = {
  'cd1903a5-d70a-5320-9124-b6b24917ba14': {
    beforeDe: 'Die lernende Person kann Zustandsgrößen (p, V, T, n) mit SI-Einheiten sicher verwenden und das ideale Gasgesetz pV = nRT zur Berechnung fehlender Größen anwenden.',
    beforeEn: 'The learner can safely use state variables (p, V, T, n) with SI units and apply the ideal gas law pV = nRT to calculate missing quantities.',
    afterDe: 'Die lernende Person kann für ein ideales Gas Druck p, Volumen V, absolute Temperatur T und Stoffmenge n in SI-Einheiten verwenden, ihren Zusammenhang pV = nRT erklären, eine fehlende Zustandsgröße bestimmen und das Ergebnis anhand der Einheit und der erwarteten Größenordnung auf Plausibilität prüfen.',
    afterEn: 'For an ideal gas, the learner can use pressure p, volume V, absolute temperature T, and amount of substance n in SI units, explain their relationship pV = nRT, determine a missing state variable, and check the result for plausibility using its unit and expected order of magnitude.',
    atomicityReason: 'Modellgrenze, Größenbeziehung, Berechnung und Plausibilitätsprüfung bilden eine zusammenhängende Anwendung des idealen Gasgesetzes; kein unabhängiges Teilziel wird mitgeführt.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die SI-Größen, absolute Temperatur und Gleichung pV = nRT bleiben ein enger Abrufkern; Modellwahl, Erklärung, Rechnung und Plausibilitätsprüfung werden durch Verständnis und Aufgaben gesichert.',
  },
  'fb73c94b-6a23-5351-8fef-db2c2533e361': {
    beforeDe: 'Die lernende Person kann isochore, isobare und isotherme Zustandsänderungen im p-V-T-Zusammenhang unterscheiden und fehlende Größen rechnerisch bestimmen.',
    beforeEn: 'The learner can distinguish isochoric, isobaric, and isothermal state changes in the p-V-T relation and determine missing quantities computationally.',
    afterDe: 'Die lernende Person kann isochore (V konstant), isobare (p konstant) und isotherme (T konstant) Zustandsänderungen einer festen Stoffmenge eines idealen Gases anhand der jeweils konstanten Zustandsgröße unterscheiden, den passenden Zusammenhang der übrigen Größen begründen und damit fehlende Größen bestimmen.',
    afterEn: 'The learner can distinguish isochoric (constant V), isobaric (constant p), and isothermal (constant T) changes of a fixed amount of ideal gas by the state variable held constant, justify the corresponding relationship between the remaining variables, and use it to determine missing quantities.',
    atomicityReason: 'Prozessart, passende reduzierte Gasgleichung und Berechnung prüfen gemeinsam dieselbe Zustandsänderung einer festen Stoffmenge; kein Split ist fachlich erforderlich.',
    memoryStatus: 'memory_required',
    memoryReason: 'Konstante Zustandsgröße und zugehörige reduzierte Idealgasbeziehung sind ein enger Abrufkern; Begründung, Auswahl und Berechnung bleiben im gewöhnlichen Lernziel.',
  },
  '7fe3022f-fad0-5f41-af1c-d55ff214ebc6': {
    beforeDe: 'Die lernende Person kann adiabatische Prozesse (ohne Wärmeaustausch) beschreiben, im p-V-Diagramm skizzieren und qualitativ von isothermen Prozessen abgrenzen.',
    beforeEn: 'The learner can describe adiabatic processes (without heat exchange), sketch them in a p-V diagram, and distinguish them qualitatively from isothermal processes.',
    afterDe: 'Die lernende Person kann adiabatische Zustandsänderungen eines idealen Gases als Prozesse ohne Wärmeaustausch über die Systemgrenze beschreiben, qualitativ erklären, wie Arbeit bei Kompression oder Expansion die innere Energie und Temperatur verändert, sowie idealisierte quasistatische Verläufe im p-V-Diagramm skizzieren und von isothermen Zustandsänderungen abgrenzen.',
    afterEn: 'The learner can describe adiabatic changes of an ideal gas as processes with no heat transfer across the system boundary, explain qualitatively how work during compression or expansion changes internal energy and temperature, and sketch idealized quasistatic paths in a p-V diagram and distinguish them from isothermal changes.',
    atomicityReason: 'Wärmegrenze, Arbeitswirkung und p-V-Abgrenzung machen gemeinsam den fachlichen Kern einer adiabatischen Idealgas-Zustandsänderung beobachtbar.',
    memoryStatus: 'memory_required',
    memoryReason: 'Der kompakte Abrufkern Q = 0 und die Abgrenzung zur Isotherme bleiben sinnvoll; Systemgrenze, Arbeitswirkung, Diagramm und Transfer bleiben Verständnisleistungen.',
  },
  '7982cd8e-2151-59e7-858d-c1361c5d249e': {
    beforeDe: 'Die lernende Person kann die Prozessarbeit bei Volumenänderungen in einfachen Fällen (insbesondere isobare Prozesse) berechnen und im p-V-Diagramm als Fläche deuten.',
    beforeEn: 'The learner can calculate process work for volume changes in simple cases (especially isobaric processes) and interpret it as area in the p-V diagram.',
    afterDe: 'Die lernende Person kann die Prozessarbeit bei Volumenänderungen in einfachen Fällen, insbesondere bei isobaren Prozessen, mit einer ausgewiesenen Vorzeichenkonvention berechnen, im p-V-Diagramm als vorzeichenbehaftete Fläche unter dem Prozessweg deuten und das Vorzeichen aus der Prozessrichtung begründen.',
    afterEn: 'The learner can calculate process work for volume changes in simple cases, especially isobaric processes, using an explicit sign convention, interpret it in a p-V diagram as the signed area under the process path, and justify its sign from the process direction.',
    atomicityReason: 'Berechnung, vorzeichenbehaftete Flächendeutung und Begründung aus der Prozessrichtung sind drei Darstellungen derselben Prozessarbeitskompetenz.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die beiden gebräuchlichen Vorzeichenkonventionen und das Flächenintegral sind ein enger Abrufkern; Wahl, Begründung und Anwendung bleiben Verständnis und Aufgabenpraxis.',
  },
  '93ece389-78c5-5141-9ef1-c68bd558306e': {
    beforeDe: 'Die lernende Person kann bei isochoren und isobaren Prozessen Wärmemengen mit Q = n·C_V·ΔT bzw. Q = n·C_P·ΔT berechnen und die Bedeutung der Wärmekapazitäten erläutern.',
    beforeEn: 'The learner can calculate heat quantities for isochoric and isobaric processes with Q = n·C_V·ΔT and Q = n·C_P·ΔT and explain the meaning of heat capacities.',
    afterDe: 'Die lernende Person kann bei isochoren beziehungsweise isobaren Prozessen die übertragene Wärmemenge mit Q = n·C_V·ΔT beziehungsweise Q = n·C_P·ΔT unter der Annahme näherungsweise konstanter molarer Wärmekapazitäten berechnen und erklären, warum die passende Wärmekapazität von der Prozessbedingung abhängt.',
    afterEn: 'The learner can calculate the heat transferred in isochoric or isobaric processes using Q = n·C_V·ΔT or Q = n·C_P·ΔT, assuming approximately constant molar heat capacities, and explain why the appropriate heat capacity depends on the process condition.',
    atomicityReason: 'Formelauswahl, Berechnung und Erklärung der prozessabhängigen molaren Wärmekapazität bilden eine einzige Wärmeübertragungskompetenz.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die prozessgebundenen Formeln mit molaren, näherungsweise konstanten Wärmekapazitäten sind ein enger Abrufkern; Auswahl, Annahmen und Erklärung verbleiben im Lernziel.',
  },
  'cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73': {
    beforeDe: 'Abgrenzung alltagssprachlicher "Energieverbrauch" von physikalischer Energieerhaltung und Entropieerzeugung.',
    beforeEn: 'Distinguish everyday "energy consumption" from physical energy conservation and entropy production.',
    afterDe: 'Die lernende Person kann den alltagssprachlichen „Energieverbrauch“ von der physikalischen Energieerhaltung abgrenzen und erklären, dass bei vollständig bilanziertem System die Energie erhalten bleibt, ihre Nutzbarkeit für einen gewünschten Zweck bei irreversiblen Umwandlungen durch Entropieerzeugung jedoch abnimmt.',
    afterEn: 'The learner can distinguish the everyday phrase “energy consumption” from physical energy conservation and explain that, for a fully accounted system, energy remains conserved while its usability for a desired purpose decreases through entropy production in irreversible transformations.',
    atomicityReason: 'Die Gegenüberstellung von Energieerhaltung und abnehmender Nutzbarkeit löst eine einzelne, zentrale Fehlvorstellung zum alltagssprachlichen Energieverbrauch auf.',
    memoryStatus: 'memory_required',
    memoryReason: 'Energieerhaltung und Entropieerzeugung bilden einen kompakten Begriffsanker; Systembilanz, Irreversibilität, Nutzbarkeit und Transfer werden erklärend geprüft.',
  },
  'b615830a-e8b0-5754-81e0-99da98343a8d': {
    beforeDe: 'Die lernende Person kann signifikante Stellen in Rechenergebnissen korrekt bestimmen und konsistent anwenden.',
    beforeEn: 'The learner can determine significant figures in computed results correctly and apply them consistently.',
    afterDe: 'Die lernende Person kann Rechenergebnisse passend zur angegebenen Genauigkeit beziehungsweise Unsicherheit der Eingangsdaten auf eine sinnvolle Zahl signifikanter Stellen runden, Zwischenwerte mit ausreichender Genauigkeit weiterführen und Scheingenauigkeit vermeiden.',
    afterEn: 'The learner can round calculated results to a meaningful number of significant figures consistent with the stated precision or uncertainty of the input data, carry intermediate values with sufficient precision, and avoid false precision.',
    atomicityReason: 'Rundung, ausreichende Zwischenwertgenauigkeit und Vermeidung von Scheingenauigkeit bilden gemeinsam eine einzige fachgerechte Ergebnisangabe.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Zahl sinnvoller Stellen muss aus Genauigkeit beziehungsweise Unsicherheit der Daten begründet werden; diese Urteilskompetenz wird durch Anwendung statt durch eine eigene Memorycard aufgebaut.',
  },
  'ac25ffe3-fd42-592d-a937-79cc13460313': {
    beforeDe: 'Die lernende Person kann Bewegungen schrittweise in einer Tabellenkalkulation modellieren (Differenzenverfahren), Parameter variieren und Simulationsergebnisse interpretieren.',
    beforeEn: 'The learner can model motions stepwise in a spreadsheet, vary parameters, and interpret simulation results.',
    afterDe: 'Die lernende Person kann ein Bewegungsmodell mit Anfangsbedingungen und endlichen Zeitschritten als Differenzenverfahren in einer Tabellenkalkulation umsetzen, Parameter systematisch variieren und Simulationsergebnisse im Hinblick auf den Bewegungsverlauf, die Modellannahmen und die Zeitschrittweite interpretieren.',
    afterEn: 'The learner can implement a motion model with initial conditions and finite time steps using a finite-difference method in a spreadsheet, vary parameters systematically, and interpret the simulation results in terms of the motion, model assumptions, and time-step size.',
    atomicityReason: 'Diskretisierung, Parametervariation und Interpretation bilden den zusammenhängenden Modellierungszyklus eines Bewegungsmodells in der Tabellenkalkulation.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die kompakte Schrittstruktur eines Differenzenverfahrens kann als Abrufstütze dienen; Modellannahmen, Parameterwirkung, Zeitschrittprüfung und Interpretation bleiben Verständnisleistungen.',
  },
}

const cardTexts = {
  de: {
    physics_e_cov_076: {
      front: 'Volumenarbeit: Betrag und Vorzeichenkonvention',
      back: '$W_{\\mathrm{vom\\ Gas}}=\\int_{V_0}^{V_1}p\\,dV$ (Expansion positiv)\n\n$W_{\\mathrm{am\\ Gas}}=-\\int_{V_0}^{V_1}p\\,dV$ (Expansion negativ)\n\nDer Betrag ist die Fläche unter dem Prozessweg; die Konvention muss angegeben werden.',
    },
    physics_e_cov_078: {
      front: 'Wärmemengen bei isochor/isobar',
      back: 'Für näherungsweise konstante molare Wärmekapazitäten:\n\nIsochor: $Q=n\\,C_V\\,\\Delta T$\n\nIsobar: $Q=n\\,C_P\\,\\Delta T$',
    },
  },
  en: {
    physics_e_cov_076: {
      front: 'Volume work: magnitude and sign convention',
      back: '$W_{\\mathrm{by\\ gas}}=\\int_{V_0}^{V_1}p\\,dV$ (expansion positive)\n\n$W_{\\mathrm{on\\ gas}}=-\\int_{V_0}^{V_1}p\\,dV$ (expansion negative)\n\nThe magnitude is the area under the process path; the convention must be stated.',
    },
    physics_e_cov_078: {
      front: 'Heat quantities for isochoric/isobaric processes',
      back: 'For approximately constant molar heat capacities:\n\nIsochoric: $Q=n\\,C_V\\,\\Delta T$\n\nIsobaric: $Q=n\\,C_P\\,\\Delta T$',
    },
  },
} as const

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

function cardReviewFingerprint(card: JsonRecord): string {
  return sha256(stableJson({
    ruleVersion: 'memory-card-review-v1',
    deckId,
    cardId: card.id,
    front: normalizeText(card.front),
    back: normalizeText(card.back),
    category: normalizeText(card.category),
    tags: (card.tags as unknown[]).map(normalizeText).filter(Boolean),
  }))
}

const outputs = new Map<string, string>()
const canonical = readJson(paths.canonical)
const goals = canonical.goals as JsonRecord[]
const revisedGoals = new Map<string, JsonRecord>()
for (const [goalId, revision] of Object.entries(revisions)) {
  const goal = goals.find((entry) => entry.id === goalId)
  if (!goal) throw new Error(`Missing canonical goal ${goalId}`)
  const matchesBefore = goal.description === revision.beforeDe && goal.descriptionEn === revision.beforeEn
  const matchesAfter = goal.description === revision.afterDe && goal.descriptionEn === revision.afterEn
  if (!matchesBefore && !matchesAfter) throw new Error(`${goalId}: bilingual description is outside the bounded states`)
  goal.description = revision.afterDe
  goal.descriptionEn = revision.afterEn
  const visualization = (goal.resourceLinks as JsonRecord[] | undefined)?.find((link) => link.type === 'goal-visualization')
  if (!visualization) throw new Error(`${goalId}: missing goal visualization`)
  visualization.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${revision.afterDe}`
  revisedGoals.set(goalId, goal)
}
outputs.set(paths.canonical, `${JSON.stringify(canonical, null, 2)}\n`)

const semanticKinds = readJson(paths.semanticKinds)
for (const [goalId, goal] of revisedGoals) {
  const decision = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
  if (!decision || decision.semanticKind !== 'curricularAtomic' || decision.decisionStatus !== 'authoritative') {
    throw new Error(`${goalId}: missing authoritative curricularAtomic decision`)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
outputs.set(paths.semanticKinds, `${JSON.stringify(semanticKinds, null, 2)}\n`)

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.goalMemory)
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
  Object.assign(memoryRecord, {
    fingerprint: goalReviewFingerprint(goal, 'memory-card-review-v1'),
    status: revision.memoryStatus,
    memoryUseful: revision.memoryStatus === 'memory_required',
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}
outputs.set(paths.atomicity, `${atomicity.map((record) => JSON.stringify(record)).join('\n')}\n`)
outputs.set(paths.goalMemory, `${memory.map((record) => JSON.stringify(record)).join('\n')}\n`)

const deckPaths = [
  paths.canonicalDeckDe,
  paths.canonicalDeckEn,
  paths.publicDeckDe,
  paths.publicDeckEn,
  paths.backendDeckDe,
  paths.backendDeckEn,
] as const
const plannedDecks = new Map<string, JsonRecord>()
for (const path of deckPaths) {
  const locale = path.endsWith('.de.json') ? 'de' : 'en'
  const deck = readJson(path)
  if (deck.deckId !== deckId) throw new Error(`${path}: unexpected deck ID`)
  for (const [cardId, text] of Object.entries(cardTexts[locale])) {
    const card = (deck.cards as JsonRecord[]).find((entry) => entry.id === cardId)
    if (!card) throw new Error(`${path}: missing ${cardId}`)
    card.front = text.front
    card.back = text.back
  }
  plannedDecks.set(path, deck)
  outputs.set(path, `${JSON.stringify(deck, null, 2)}\n`)
}
for (const locale of ['de', 'en'] as const) {
  const copies = locale === 'de'
    ? [paths.canonicalDeckDe, paths.publicDeckDe, paths.backendDeckDe]
    : [paths.canonicalDeckEn, paths.publicDeckEn, paths.backendDeckEn]
  const serialized = copies.map((path) => JSON.stringify(plannedDecks.get(path)))
  if (!serialized.every((value) => value === serialized[0])) throw new Error(`${locale}: planned deck copies differ`)
}

const cardLedger = readJsonl(paths.cardMemory)
const primaryDeck = plannedDecks.get(paths.canonicalDeckDe)!
for (const cardId of ['physics_e_cov_076', 'physics_e_cov_078']) {
  const card = (primaryDeck.cards as JsonRecord[]).find((entry) => entry.id === cardId)
  const record = cardLedger.find((entry) => entry.deckId === deckId && entry.cardId === cardId)
  if (!card || !record || record.status !== 'kept' || record.necessary !== true) {
    throw new Error(`${cardId}: missing kept card review`)
  }
  Object.assign(record, {
    fingerprint: cardReviewFingerprint(card),
    reviewedAt,
    reviewer,
    reason: cardId === 'physics_e_cov_076'
      ? 'Behalten und korrigiert: Die Karte unterscheidet nun explizit Arbeit vom Gas und Arbeit am Gas, bindet das Vorzeichen an Prozessrichtung und Konvention und verhindert den Widerspruch zum ersten Hauptsatz; Deutung und Anwendung bleiben im Lernziel.'
      : 'Behalten und präzisiert: Die Karte bindet n·C_V·ΔT beziehungsweise n·C_P·ΔT ausdrücklich an näherungsweise konstante molare Wärmekapazitäten; Prozesswahl und Erklärung bleiben im Lernziel.',
  })
}
outputs.set(paths.cardMemory, `${cardLedger.map((record) => JSON.stringify(record)).join('\n')}\n`)

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) throw new Error(`Adjudication drift in ${path}; run with --write`)
}

console.log(`CHECK apply_physics_batch_029_thermodynamics_adjudication ${writeMode ? 'WRITE' : 'PASS'} files=${outputs.size} goals=${revisedGoals.size}`)
