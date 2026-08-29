import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-28'
const reviewer = 'codex-physics-batch-019-wording-adjudication-2026-08-28'
const expectedAdjudicationSha256 = '6ee0503895d4c3d36f672083e91ba7f523eaf8fe2896dee5f3425663ae5c60f9'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  batchDirectory:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-019-q1-q2-magnetism-induction-16-v1',
} as const

const topologyRebindings: Record<string, { previous: string[], current: string[] }> = {
  '9854589c-5feb-4942-b90f-311ddf36eb78': {
    previous: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
    current: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
  },
  '8c9394cb-f54a-508d-9750-4c49e31b3fa9': {
    previous: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
    current: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
  },
  'a522c8c0-f3a4-5568-acae-3010ed9feb87': {
    previous: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
    current: ['8c9394cb-f54a-508d-9750-4c49e31b3fa9'],
  },
  '0924162b-46d0-5c56-93bc-33e1f5ac6886': {
    previous: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
    current: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
  },
}

const abs = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex')
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(abs(path), 'utf8'))
const readJsonl = (path: string): JsonRecord[] => readFileSync(abs(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line))
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => `sha256:${sha256Hex(stableJson({
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
}))}`

const atomicityReasons: Record<string, string> = {
  '106417ed-80db-5490-a1ee-bb4160d3f2b4':
    'Die begründete Auswahl und Anwendung eines passenden idealisierten Feldmodells einschließlich seiner Gültigkeitsgrenze ist eine einzelne Modellwahlkompetenz; Leiter und Spule sind alternative Modellfälle.',
  'c6355a22-24cf-5d8b-88af-ea11711460fb':
    'Kraftbetrag, Kraftrichtung und die Bestimmung von B im senkrechten Messfall sind zusammengehörige Auswertungen desselben Leiterkraftmodells.',
  '3b866aea-3e4d-5f23-91de-759148382710':
    'Bahnradius und Umlaufzeit werden unter denselben Kreisbahnbedingungen aus Lorentz- und Zentripetalkraft bestimmt und bilden eine einzelne quantitative Bahnkompetenz.',
  '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a':
    'Geschwindigkeitszerlegung und die daraus folgende Einordnung als Gerad-, Kreis- oder Schraubenbahn sind Schritte einer einzelnen Bahnmodell-Kompetenz.',
  'b39ae8fb-4358-5866-8adf-3d5365368eeb':
    'Hall-Spannung und ihre Auswertung als Magnetfeld- oder Ladungsträgerinformation bilden eine zusammenhängende Ursache-Messgröße-Deutung-Kette.',
  '2d62b444-796e-548d-aeee-cfd9c6665ddc':
    'Die explizite Gegenüberstellung von Feldrollen, Synchronisation, Bahnregelung und Grenzen ist eine einzelne Vergleichskompetenz; Zyklotron und Synchrotron sind ihre Vergleichsfälle.',
  '1a037489-3c95-540b-8cae-0acd360358ee':
    'Flussdefinition und qualitative Induktionsfolge werden durch dieselbe zeitliche Flussänderung verbunden und bilden eine einzelne kausale Modellkompetenz.',
  'eb1ea150-ec6c-5000-bce3-f46c820dccf8':
    'Betrag beziehungsweise Vorzeichen der mittleren Induktionsspannung und die Lenzsche Richtungsbegründung sind quantitative und qualitative Auswertungen desselben Induktionsgesetzes.',
  'e5c33afc-a233-50ff-a17f-63c085dfb89c':
    'Entstehung, Bremswirkung und Verringerung von Wirbelströmen werden mit demselben Induktions- und Lenz-Mechanismus erklärt und bilden eine einzelne Transferkompetenz.',
  '37f28bc4-def2-57cf-a06b-191dfd228205':
    'Reaktion der Spule auf Stromänderungen und Deutung der Induktivität beschreiben gemeinsam das eine phänomenologische Selbstinduktionsmodell.',
  '692db5b6-8be1-5c7b-8307-3a02afb21ea0':
    'Strom- und Spannungsverläufe, Zeitkonstante und Bestimmung von L sind zusammengehörige Auswertungen eines einzelnen idealisierten RL-Transienten.',
  'a1389d4e-dc97-5557-babe-a31a2bd57217':
    'Energiebestimmung sowie begründete Aufnahme und Abgabe sind Anwendungen desselben Energiemodells einer Spule mit konstanter Induktivität.',
  'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c':
    'Die vorgegebene Anwendung wird mit einem einheitlichen Schema aus Flussänderung, induzierter Größe und technischem Zweck erklärt; die genannten Geräte sind alternative Transferfälle.',
  'ffbbf243-c2eb-4330-b050-837de994c130':
    'Quellen, Quellenfreiheit und Wirbelaussagen werden als zusammenwirkende Bestandteile eines einzelnen qualitativen Maxwell-Überblicks eingeordnet.',
  'd18d4190-ddc1-5181-b1b6-e79947b737c2':
    'Momentane Spannungsbestimmung und Deutung ihres Verlaufs sind zusammengehörige Teile der Anwendung der zeitlichen Ableitungsform des Induktionsgesetzes.',
}

const memoryReasons: Record<string, string> = {
  '106417ed-80db-5490-a1ee-bb4160d3f2b4':
    'Die kompakten Feldbeziehungen und ihre Größenbedeutungen müssen für die Modellwahl verfügbar sein; Auswahl, Gültigkeitsprüfung und Anwendung bleiben Verständnis- und Transferleistungen.',
  'c6355a22-24cf-5d8b-88af-ea11711460fb':
    'Die kompakte Leiterkraftbeziehung einschließlich Winkelabhängigkeit muss sicher abrufbar sein; Richtung, Messanordnung und Modellprüfung werden verständnisorientiert geübt.',
  '3b866aea-3e4d-5f23-91de-759148382710':
    'Kreisbahnbedingungen sowie Radius und Umlaufzeit sollen aus Lorentz- und Zentripetalkraft rekonstruiert und auf wechselnde Fälle übertragen werden; eine eigene Memorycard ist nicht notwendig.',
  '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a':
    'Die Bahnform muss aus der situationsabhängigen Geschwindigkeitszerlegung hergeleitet werden; isoliertes Faktenlernen ersetzt diese Modellleistung nicht.',
  'b39ae8fb-4358-5866-8adf-3d5365368eeb':
    'Die kompakte Hall-Beziehung und Vorzeichenbedeutung müssen abrufbar sein; Messauswertung und Ladungsträgerdeutung bleiben kausale Verständnisleistungen.',
  '2d62b444-796e-548d-aeee-cfd9c6665ddc':
    'Die nichtrelativistische Zyklotronperiode beziehungsweise -frequenz ist ein eng begrenzter Erinnerungsanteil; der Vergleich mit dem Synchrotron und die Grenzbegründungen bleiben Verständnisleistungen.',
  '1a037489-3c95-540b-8cae-0acd360358ee':
    'Die kompakte Flussdefinition muss sicher verfügbar sein; Winkelwahl, Flussänderung und Induktionsursache werden an variierenden Situationen verstanden.',
  'eb1ea150-ec6c-5000-bce3-f46c820dccf8':
    'Induktionsgesetz, Windungszahl und Lenzsches Minuszeichen sind ein begrenzter Erinnerungsanteil; Richtungsbegründung und Flussanalyse bleiben Verständnisleistungen.',
  'e5c33afc-a233-50ff-a17f-63c085dfb89c':
    'Wirbelstromwirkung und Laminierung sollen über Induktionsgesetz und Lenzsche Regel an wechselnden Situationen erklärt werden; eine eigene Memorycard ist nicht notwendig.',
  '37f28bc4-def2-57cf-a06b-191dfd228205':
    'Der kompakte Zusammenhang von Stromänderung, Selbstinduktionsspannung und Induktivität muss abrufbar sein; Schaltvorgänge werden weiterhin kausal erklärt.',
  '692db5b6-8be1-5c7b-8307-3a02afb21ea0':
    'RL-Verläufe und die Bestimmung von L sollen aus Schaltung, Anfangsbedingungen und Zeitkonstante analysiert werden; eine zusätzliche Memorycard ist nicht erforderlich.',
  'a1389d4e-dc97-5557-babe-a31a2bd57217':
    'Die kompakte Beziehung W = 1/2 · L · I² muss sicher abrufbar sein; Modellgrenze, Energieaufnahme und -abgabe werden physikalisch begründet.',
  'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c':
    'Die Kompetenz verlangt die kausale Analyse einer jeweils vorgegebenen Anwendung; ein Gerätekatalog als Memory-Deck wäre weder notwendig noch lernwirksam.',
  'ffbbf243-c2eb-4330-b050-837de994c130':
    'Der Überblick soll Zusammenhänge zwischen Quellen und Wirbelfeldern verständlich ordnen; eine zusätzliche isolierte Merkkarte ist dafür nicht erforderlich.',
  'd18d4190-ddc1-5181-b1b6-e79947b737c2':
    'Die Ableitungsform soll aus dem zeitabhängigen Fluss angewendet und der Verlauf gedeutet werden; der bereits vorhandene Induktionsgesetz-Deckanteil genügt.',
}

const adjudicationPath = `${paths.batchDirectory}/third-adjudication/adjudication.json`
const adjudicationBytes = readFileSync(abs(adjudicationPath))
if (sha256Hex(adjudicationBytes) !== expectedAdjudicationSha256) {
  throw new Error(`Batch019 adjudication digest changed: ${adjudicationPath}`)
}
const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as JsonRecord
if (
  adjudication.schemaVersion !== 1
  || adjudication.subject !== 'physik'
  || adjudication.materialized !== false
  || adjudication.noProgressClaim !== true
  || adjudication.counts?.total !== 16
  || adjudication.counts?.accepted_revision !== 15
  || adjudication.counts?.keep_current !== 1
  || adjudication.counts?.structural_split !== 0
  || adjudication.decisions?.length !== 16
) throw new Error('Unexpected Batch019 adjudication contract')

const roundInputDirectory = abs(`${paths.batchDirectory}/round-a/batches`)
const roundInputFiles = readdirSync(roundInputDirectory).filter((name) => name.endsWith('.input.jsonl'))
if (roundInputFiles.length !== 1) throw new Error(`Expected one Batch019 round-A input file, found ${roundInputFiles.length}`)
const reviewInputs = readFileSync(join(roundInputDirectory, roundInputFiles[0]), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const reviewInputByGoalId = new Map(reviewInputs.map((entry) => [entry.goal.goalId as string, entry.goal]))

const changedDecisions = (adjudication.decisions as JsonRecord[])
  .filter((decision) => decision.resolutionDecision === 'accepted_revision')
if (changedDecisions.length !== 15) throw new Error(`Expected 15 revisions, found ${changedDecisions.length}`)

const canonical = readJson(paths.canonical)
const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [goal.id as string, goal]))
for (const decision of changedDecisions) {
  const goal = goalById.get(decision.goalId)
  const input = reviewInputByGoalId.get(decision.goalId)
  if (!goal || !input) throw new Error(`${decision.goalId}: missing canonical goal or bound review input`)
  const finalText = decision.finalText as JsonRecord
  const currentTuple = [goal.title, goal.titleEn, goal.description, goal.descriptionEn]
  const inputTuple = [input.currentTitleDe, input.currentTitleEn, input.currentDescriptionDe, input.currentDescriptionEn]
  const finalTuple = [finalText.titleDe, finalText.titleEn, finalText.descriptionDe, finalText.descriptionEn]
  const matchesInput = currentTuple.every((value, index) => value === inputTuple[index])
  const matchesFinal = currentTuple.every((value, index) => value === finalTuple[index])
  if (!matchesInput && !matchesFinal) throw new Error(`${decision.goalId}: canonical bilingual text drifted from review input and adjudication`)
  Object.assign(goal, {
    title: finalText.titleDe,
    titleEn: finalText.titleEn,
    description: finalText.descriptionDe,
    descriptionEn: finalText.descriptionEn,
  })
  if (Array.isArray(decision.requiresAfterRevision)) {
    const expectedRequires = input.canonicalContext.requires as string[]
    const currentRequires = goal.requires as string[]
    const finalRequires = decision.requiresAfterRevision as string[]
    const matchesInputRequires = JSON.stringify(currentRequires) === JSON.stringify(expectedRequires)
    const matchesFinalRequires = JSON.stringify(currentRequires) === JSON.stringify(finalRequires)
    if (!matchesInputRequires && !matchesFinalRequires) throw new Error(`${decision.goalId}: requires drifted from review input and adjudication`)
    goal.requires = [...finalRequires]
  }
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    link.title = `Visualisierung: ${goal.title}`
    link.description = `Visualisierung zum Lernziel: ${goal.title}.`
    link.altText = `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`
  }
}

for (const [goalId, rebinding] of Object.entries(topologyRebindings)) {
  const goal = goalById.get(goalId)
  if (!goal) throw new Error(`${goalId}: missing goal for topology rebinding`)
  const current = JSON.stringify(goal.requires ?? [])
  if (current !== JSON.stringify(rebinding.previous) && current !== JSON.stringify(rebinding.current)) {
    throw new Error(`${goalId}: requires drifted from the bounded topology adjudication`)
  }
  goal.requires = [...rebinding.current]
}

const semanticKinds = readJson(paths.semanticKinds)
const semanticKindRefreshGoalIds = new Set([
  ...changedDecisions.map((decision) => decision.goalId as string),
  ...Object.keys(topologyRebindings),
])
for (const goalId of semanticKindRefreshGoalIds) {
  const goal = goalById.get(goalId)!
  const record = (semanticKinds.decisions as JsonRecord[]).find((candidate) => candidate.goalId === goalId)
  if (!record || record.semanticKind !== 'curricularAtomic' || record.decisionStatus !== 'authoritative') {
    throw new Error(`${goalId}: missing authoritative curricularAtomic decision`)
  }
  record.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}

const atomicity = readJsonl(paths.atomicity)
const memory = readJsonl(paths.memory)
for (const decision of changedDecisions) {
  const goal = goalById.get(decision.goalId)!
  const atomicityRecord = atomicity.find((candidate) => candidate.goalId === decision.goalId)
  const memoryRecord = memory.find((candidate) => candidate.goalId === decision.goalId)
  if (!atomicityRecord || !memoryRecord) throw new Error(`${decision.goalId}: missing review-ledger record`)
  if (!atomicityReasons[decision.goalId] || !memoryReasons[decision.goalId]) {
    throw new Error(`${decision.goalId}: missing subject-specific ledger rationale`)
  }
  Object.assign(atomicityRecord, {
    fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
    status: 'atomic',
    semanticAtomic: true,
    reviewedAt,
    reviewer,
    reason: atomicityReasons[decision.goalId],
    suggestedSplit: [],
  })
  Object.assign(memoryRecord, {
    fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
    reviewedAt,
    reviewer,
    reason: memoryReasons[decision.goalId],
  })
  if (memoryRecord.status === 'memory_required') {
    memoryRecord.memoryUseful = true
    if (!Array.isArray(memoryRecord.memoryGoalIds) || memoryRecord.memoryGoalIds.length === 0
      || !Array.isArray(memoryRecord.deckIds) || memoryRecord.deckIds.length === 0) {
      throw new Error(`${decision.goalId}: missing required memory trace`)
    }
  } else if (memoryRecord.status === 'no_memory_needed') {
    memoryRecord.memoryUseful = false
    delete memoryRecord.memoryGoalIds
    delete memoryRecord.deckIds
  } else {
    throw new Error(`${decision.goalId}: unresolved memory status ${String(memoryRecord.status)}`)
  }
}

const visualizationQa = readJson(paths.visualizationQa)
for (const decision of changedDecisions) {
  const goal = goalById.get(decision.goalId)!
  const record = (visualizationQa.records as JsonRecord[]).find((candidate) => candidate.goalId === decision.goalId)
  if (!record) throw new Error(`${decision.goalId}: missing visualization-QA record`)
  record.title = goal.title
  record.description = goal.description
}

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.memory, serializeJsonl(memory)],
  [paths.visualizationQa, serializeJson(visualizationQa)],
])

const updatePromptBinding = (bytes: string, goal: JsonRecord): string => {
  if (!bytes.includes(`SkillPilot-ID: \`${goal.id}\``)) throw new Error(`${goal.id}: visualization prompt is not ID-bound`)
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

for (const decision of changedDecisions) {
  const goal = goalById.get(decision.goalId)!
  const directory = `curricula/DE/Gymnasium/visualizations/physik/${decision.goalId}`
  const promptFiles = readdirSync(abs(directory)).filter((name) => name.endsWith('prompt.de.md'))
  if (promptFiles.length === 0) throw new Error(`${decision.goalId}: missing visualization prompt binding`)
  for (const name of promptFiles) {
    const path = `${directory}/${name}`
    outputs.set(path, updatePromptBinding(readFileSync(abs(path), 'utf8'), goal))
  }
}

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) throw new Error(`Batch019 wording adjudication drift in ${path}`)
}

console.log(
  `CHECK apply_physics_batch_019_wording_adjudication ${writeMode ? 'WRITE' : 'PASS'} revisions=${changedDecisions.length} topologyRebindings=${Object.keys(topologyRebindings).length} files=${outputs.size} stableIds=16 denominator=447`,
)
