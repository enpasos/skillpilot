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
  intermediateDe?: string
  intermediateEn?: string
  afterDe: string
  afterEn: string
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
const reviewer = 'codex-physics-b031-oscillations-waves-adjudication-2026-09-02'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
} as const

const revisions: Record<string, Revision> = {
  'd03f1cb6-c224-53db-ad91-76cc7827978d': {
    beforeDe: 'Die lernende Person kann eine harmonische Schwingung als periodischen Vorgang beschreiben und sie im t-s-Diagramm anhand von Feder- oder Fadenpendel experimentell untersuchen.',
    beforeEn: 'The learner can describe a harmonic oscillation as a periodic process and experimentally investigate it in a t-s diagram using a spring or pendulum.',
    intermediateDe: 'Die lernende Person kann eine harmonische Schwingung als näherungsweise sinusförmigen periodischen Vorgang beschreiben und die Bewegung eines Federpendels im linearen Bereich oder eines Fadenpendels bei kleinen Winkelauslenkungen experimentell in einem t-s-Diagramm untersuchen.',
    intermediateEn: 'The learner can describe a harmonic oscillation as an approximately sinusoidal periodic process and experimentally investigate, in a t-s diagram, the motion of a spring oscillator in its linear range or a simple pendulum at small angular displacements.',
    afterDe: 'Die lernende Person kann eine harmonische Schwingung als sinusförmiges periodisches Modell beschreiben und anhand eines t-s-Diagramms experimentell untersuchen, inwieweit die Bewegung eines Federpendels im linearen Bereich oder eines Fadenpendels bei kleinen Winkelauslenkungen diesem Modell entspricht.',
    afterEn: 'The learner can describe harmonic oscillation as a sinusoidal periodic model and use a displacement-time graph to investigate experimentally how closely the motion of a spring oscillator in its linear range or a simple pendulum at small angular displacements matches this model.',
    expectedPromptFiles: 1,
    atomicityReason: 'Sinusmodell, sein begrenzter Gültigkeitsbereich und die experimentelle Prüfung im t-s-Diagramm bilden eine zusammenhängende Modellierungskompetenz; Feder- und Fadenpendel sind alternative Realisierungen.',
    memoryStatus: 'memory_required',
    memoryReason: 'Sinusmodell und charakteristische Schwingungsgrößen bleiben ein enger Abrufkern; Modellbereich, Experiment, Diagrammdeutung und Harmonizitätsprüfung bleiben Verständnisleistungen.',
  },
  '158e1c19-7ccb-4c8c-931c-b685951ab161': {
    beforeDe: 'Die lernende Person kann eine fortschreitende ebene Transversalwelle beschreiben und die Auslenkungen s(x,t) für festgehaltene Orte beziehungsweise Zeitpunkte deuten, insbesondere als Momentanbild einer Welle.',
    beforeEn: 'The learner can describe a progressive plane transverse wave and interpret the deflections s(x,t) for fixed positions or times, in particular as an instantaneous snapshot of a wave.',
    afterDe: 'Die lernende Person kann eine fortschreitende ebene Transversalwelle beschreiben und s(x,t) sowohl als zeitlichen Verlauf der Auslenkung an einem festen Ort als auch als räumliches Momentanbild zu einem festen Zeitpunkt deuten.',
    afterEn: 'The learner can describe a progressive plane transverse wave and interpret s(x,t) both as the time dependence of displacement at a fixed position and as a spatial snapshot at a fixed time.',
    expectedPromptFiles: 1,
    atomicityReason: 'Zeitverlauf und Momentanbild sind zwei Schnitte derselben Funktion s(x,t), deren koordinierte Deutung genau die beanspruchte Darstellungsleistung einer fortschreitenden Transversalwelle bildet.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Unterscheidung der beiden Schnitte von s(x,t) muss an Darstellungen selbstständig vollzogen werden; eine isolierte Merkkarte würde diese Koordinationsleistung nicht sichern.',
  },
  'd716a35e-e422-5aba-b39a-f2e22f1e1e74': {
    beforeDe: 'Die lernende Person kann Brechung, Reflexion und Beugung als charakteristische Wellenphänomene beschreiben und mithilfe von Beispielen (z. B. Wellenwanne) qualitativ deuten.',
    beforeEn: 'The learner can describe refraction, reflection, and diffraction as characteristic wave phenomena and qualitatively interpret them using examples (e.g., ripple tank).',
    afterDe: 'Die lernende Person kann Reflexion, Brechung und Beugung anhand von Wellenfronten voneinander unterscheiden und ihre charakteristischen Veränderungen mithilfe des Huygens’schen Prinzips unter den jeweiligen Randbedingungen qualitativ erklären.',
    afterEn: 'The learner can distinguish reflection, refraction, and diffraction from one another using wavefronts and qualitatively explain their characteristic changes under the respective boundary conditions using Huygens’ principle.',
    expectedPromptFiles: 1,
    atomicityReason: 'Die drei Phänomene werden nicht als unabhängige Routinen aufgezählt, sondern innerhalb einer einzigen vergleichenden Klassifikations- und Erklärungsleistung anhand von Wellenfronten, Randbedingungen und demselben Huygens-Modell unterschieden.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die knappen Kennzeichen von Reflexion, Brechung und Beugung können als Abrufanker dienen; Vergleich, Wellenfrontdeutung, Randbedingungen und Huygens-Erklärung bleiben Verständnis- und Transferleistungen.',
  },
  '85157cf0-7f68-5aea-b375-0f9797008cc9': {
    beforeDe: 'Active Noise Cancellation (Antischall) als destruktive Interferenz. Bewertung von Lärmschutzmaßnahmen.',
    beforeEn: 'Active noise cancellation (anti-noise) as destructive interference. Evaluation of noise protection measures.',
    afterDe: 'Die lernende Person kann Active Noise Cancellation als gezielt erzeugte destruktive Interferenz erklären und seine Eignung als Lärmschutzmaßnahme anhand der physikalischen Wirkungsweise, Wirksamkeit und Grenzen bewerten.',
    afterEn: 'The learner can explain active noise cancellation as deliberately generated destructive interference and evaluate its suitability as a noise-control measure in terms of its physical mechanism, effectiveness, and limitations.',
    expectedPromptFiles: 1,
    atomicityReason: 'Die physikalische Erklärung von ANC liefert unmittelbar die Kriterien für die Bewertung seiner Eignung als Lärmschutzmaßnahme; beide Schritte bilden eine zusammenhängende erklärungsbasierte Urteilsleistung zu demselben System.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die Eignung von ANC muss aus Interferenzbedingungen, Anwendungssituation und Grenzen begründet bewertet werden; diese Urteilsleistung wird durch Fallvergleich statt durch eine eigene Memorycard aufgebaut.',
  },
  'f47a7fa0-b929-5264-b038-b83fd682967f': {
    beforeDe: 'Ultraschallortung und Bildgebung als Anwendung mechanischer Wellen. Reflexion, Laufzeit und Auflösung qualitativ einordnen.',
    beforeEn: 'Ultrasound ranging and imaging as applications of mechanical waves. Qualitatively relate reflection, travel time, and resolution.',
    afterDe: 'Die lernende Person kann erklären, wie Ultraschallortung und -bildgebung Reflexionen und Laufzeiten mechanischer Wellen nutzen, und die erreichbare räumliche Auflösung qualitativ einordnen.',
    afterEn: 'The learner can explain how ultrasound ranging and imaging use reflections and travel times of mechanical waves and qualitatively assess the achievable spatial resolution.',
    expectedPromptFiles: 2,
    atomicityReason: 'Reflexion, Laufzeit und räumliche Auflösung sind aufeinander bezogene Bestandteile desselben Ultraschall-Messprinzips für Ortung und Bildgebung.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Messprinzip und Auflösung müssen aus Laufzeit, Reflexion und Wellenparametern in neuen Situationen erschlossen werden; eine isolierte Merkkarte ist dafür nicht notwendig.',
  },
  'e7131fe3-1da6-5555-80ec-fb6bdf8fcc29': {
    beforeDe: 'Nutzung von Ultraschall und Doppler-Effekt zur Messung von Strömungsgeschwindigkeiten (z. B. Blutfluss). Frequenzverschiebung bei bewegtem Sender/Empfänger.',
    beforeEn: 'Use of ultrasound and the Doppler effect to measure flow velocities (e.g., blood flow). Frequency shift for moving source/receiver.',
    intermediateDe: 'Die lernende Person kann erklären, wie die Frequenzverschiebung von an bewegten Blutbestandteilen gestreutem Ultraschall von deren Geschwindigkeitskomponente in Strahlrichtung abhängt, und sie zur Bestimmung von Strömungsgeschwindigkeiten nutzen.',
    intermediateEn: 'The learner can explain how the frequency shift of ultrasound scattered by moving blood components depends on their velocity component along the beam and use it to determine flow velocities.',
    afterDe: 'Die lernende Person kann erklären, wie die Frequenzverschiebung von an bewegten Blutbestandteilen gestreutem Ultraschall von deren Geschwindigkeitskomponente in Strahlrichtung abhängt, und daraus bei bekanntem Einschallwinkel die Strömungsgeschwindigkeit bestimmen.',
    afterEn: 'The learner can explain how the frequency shift of ultrasound scattered by moving blood components depends on their velocity component along the beam and use it to determine flow velocity when the insonation angle is known.',
    expectedPromptFiles: 2,
    atomicityReason: 'Streuung, richtungsabhängige Doppler-Verschiebung und die Rekonstruktion der Strömungsgeschwindigkeit bei bekanntem Einschallwinkel bilden die zusammenhängende Modell- und Messkette derselben medizinischen Ultraschallanwendung.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Die medizinische Geschwindigkeitsbestimmung verlangt Modellwahl, Richtungszerlegung und Deutung der Frequenzverschiebung; diese Leistungen werden durch Anwendung statt durch eine eigene Memorycard gesichert.',
  },
  '0d2a4690-d891-503b-96f4-42c2de48fd8b': {
    beforeDe: 'Erzeugung von Tönen durch stehende Wellen in Saiten (Gitarre, Klavier) und Luftsäulen (Orgel, Blasinstrumente). Zusammenhang von Frequenz, Wellenlänge und Instrumentenlänge.',
    beforeEn: 'Generation of tones by standing waves in strings (guitar, piano) and air columns (organ, wind instruments). Relation between frequency, wavelength, and instrument length.',
    intermediateDe: 'Die lernende Person kann erklären, wie stehende Wellen in Saiten und Luftsäulen Töne erzeugen, und aus den jeweiligen Randbedingungen den Zusammenhang zwischen Instrumentenlänge, möglichen Wellenlängen und Frequenzen qualitativ ableiten.',
    intermediateEn: 'The learner can explain how standing waves in strings and air columns produce tones and qualitatively derive the relationship between instrument length, permitted wavelengths, and frequencies from the respective boundary conditions.',
    afterDe: 'Die lernende Person kann erklären, wie die Randbedingungen die möglichen stehenden Wellenmoden in Saiten und Luftsäulen festlegen und dadurch die möglichen Töne bestimmen, und den Zusammenhang zwischen Instrumentenlänge, möglichen Wellenlängen und Frequenzen qualitativ ableiten.',
    afterEn: 'The learner can explain how boundary conditions select the permitted standing-wave modes in strings and air columns and thereby determine the possible tones, and qualitatively derive the relationship between instrument length, permitted wavelengths, and frequencies.',
    expectedPromptFiles: 1,
    atomicityReason: 'Randbedingungen, erlaubte Moden und mögliche Tonhöhen bilden dieselbe Resonatormodell-Kette; Saiten und Luftsäulen sind fachlich relevante Vergleichsfälle dieser einen Kompetenz.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Zulässige Wellenlängen und Frequenzen müssen aus den Randbedingungen des jeweiligen Instruments abgeleitet werden; diese Modellleistung benötigt keine eigene Memorycard.',
  },
  'e160acb4-5b88-509e-8055-2653df420c65': {
    beforeDe: 'Die lernende Person kann die harmonische Wellengleichung aufstellen und Parameter interpretieren.',
    beforeEn: 'The learner can set up the harmonic wave equation and interpret parameters.',
    afterDe: 'Die lernende Person kann eine harmonische Wellengleichung aufstellen und Amplitude, Frequenz, Wellenlänge, Phase sowie Ausbreitungsrichtung aus ihren Parametern deuten.',
    afterEn: 'The learner can formulate a harmonic wave equation and interpret its parameters in terms of amplitude, frequency, wavelength, phase, and direction of propagation.',
    expectedPromptFiles: 1,
    atomicityReason: 'Aufstellen und Parameterdeutung sind gekoppelte Darstellungen desselben harmonischen Wellenmodells; die genannten Größen spezifizieren diese eine Modellierungskompetenz.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die Standardform und Beziehungen zwischen Kreisfrequenz, Wellenzahl, Frequenz und Wellenlänge bleiben ein enger Abrufkern; Gleichungswahl, Vorzeichen- und Parameterdeutung bleiben Verständnisleistungen.',
  },
  '215f5558-562c-5686-b649-931f324c7983': {
    beforeDe: 'Die lernende Person kann Phasensprünge an festen und losen Enden erklären und mathematisch beschreiben.',
    beforeEn: 'The learner can explain phase shifts at fixed and free ends and describe them mathematically.',
    afterDe: 'Die lernende Person kann erklären und mathematisch beschreiben, warum eine eindimensionale Auslenkungswelle bei der Reflexion am festen Ende einen Phasensprung von π und am losen Ende keinen Phasensprung erfährt.',
    afterEn: 'The learner can explain and describe mathematically why a one-dimensional displacement wave undergoes a phase shift of π upon reflection at a fixed end and no phase shift at a free end.',
    expectedPromptFiles: 1,
    atomicityReason: 'Der Vergleich der beiden Randbedingungen und ihrer Phasenfolge beantwortet eine einzige Reflexionsfrage für eindimensionale Auslenkungswellen.',
    memoryStatus: 'memory_required',
    memoryReason: 'Die Zuordnung fester Rand zu π-Sprung und loser Rand zu keinem Sprung ist ein kompakter Abrufkern; Erklärung, mathematische Darstellung und Transfer auf neue Wellenbilder bleiben Verständnisleistungen.',
  },
  '1c430e0a-b63e-5729-8715-a96a5a68740f': {
    beforeDe: 'Gruppengeschwindigkeit und Dispersion von Wellenpaketen deuten.',
    beforeEn: 'Interpret group velocity and dispersion of wave packets.',
    intermediateDe: 'Die lernende Person kann die Gruppengeschwindigkeit als Geschwindigkeit der Hüllkurve eines Wellenpakets deuten und erklären, wie Dispersion zu einer Veränderung seiner Form und Breite führt.',
    intermediateEn: 'The learner can interpret group velocity as the velocity of a wave packet\'s envelope and explain how dispersion changes its shape and width.',
    afterDe: 'Die lernende Person kann bei einem schmalbandigen Wellenpaket die Gruppengeschwindigkeit als Geschwindigkeit seiner Hüllkurve deuten und erklären, wie frequenzabhängige Ausbreitung (Dispersion) seine Form und Breite verändert.',
    afterEn: 'The learner can interpret group velocity as the velocity of a narrowband wave packet\'s envelope and explain how frequency-dependent propagation (dispersion) changes its shape and width.',
    expectedPromptFiles: 1,
    atomicityReason: 'Hüllkurvenbewegung im Schmalbandmodell und Formänderung durch frequenzabhängige Ausbreitung sind unmittelbar gekoppelte Eigenschaften desselben Wellenpakets und bilden eine zusammenhängende Deutungskompetenz.',
    memoryStatus: 'no_memory_needed',
    memoryReason: 'Gruppengeschwindigkeit und Dispersion müssen an veränderten Wellenpaketen erklärt und voneinander abgegrenzt werden; eine isolierte Merkkarte ersetzt diese Deutung nicht.',
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
  const matchesBefore = goal.description === revision.beforeDe && goal.descriptionEn === revision.beforeEn
  const matchesIntermediate = revision.intermediateDe !== undefined && revision.intermediateEn !== undefined
    && goal.description === revision.intermediateDe && goal.descriptionEn === revision.intermediateEn
  const matchesAfter = goal.description === revision.afterDe && goal.descriptionEn === revision.afterEn
  if (!matchesBefore && !matchesIntermediate && !matchesAfter) {
    throw new Error(`${goalId}: bilingual description is outside the bounded states`)
  }

  goal.description = revision.afterDe
  goal.descriptionEn = revision.afterEn
  const visualizationLinks = (goal.resourceLinks as JsonRecord[] | undefined)
    ?.filter((link) => link.type === 'goal-visualization') ?? []
  if (visualizationLinks.length !== 1) throw new Error(`${goalId}: expected one goal-visualization link`)
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
  if (!record || record.visualizationState !== 'available') {
    throw new Error(`${goalId}: missing available visualization-QA record`)
  }
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
    throw new Error(`Physics B031 oscillations/waves adjudication drift in ${path}; run with --write`)
  }
}

console.log(`CHECK apply_physics_batch_031_oscillations_waves_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=${revisedGoals.size} files=${outputs.size}`)
