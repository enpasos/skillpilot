import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Independent Round B: read only this round's bound input and campaign.
// The actual subject review began at the observed UTC time below, before materialization.
const startedAt = '2026-09-23T19:24:25.464Z'
const directory = dirname(fileURLToPath(import.meta.url))
const input = JSON.parse(await readFile(join(directory, 'description-review-input.json'), 'utf8'))
const campaign = JSON.parse(await readFile(join(directory, 'description-review-campaign.json'), 'utf8'))
const batch = campaign.batches[0]
const runId = 'math-m7-j7-triangle-png-current-20260923-v1-first-pass-b-codex'
const sha256 = (data) => `sha256:${createHash('sha256').update(data).digest('hex')}`

const findings = [
  {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Zulässige Seiten- und Winkelangaben legen die Lage der Dreieckspunkte durch Grundseite, Winkelstrahl und gegebenenfalls Kreisbögen fest; die gewählten Werkzeugschritte müssen alle Vorgaben zugleich erfüllen.',
      essentialUnderstandingEn: 'Valid side and angle data locate the triangle vertices through a base, an angle ray and, when needed, compass arcs; the chosen tool steps must satisfy all givens together.',
      observablePerformanceDe: 'Die lernende Person konstruiert ein Dreieck aus vorgegebenen Kongruenzangaben selbst mit Geodreieck und Zirkel, beschriftet es, dokumentiert die ausgeführten Schritte in verständlicher Reihenfolge und kontrolliert die Angaben am Ergebnis.',
      observablePerformanceEn: 'The learner independently constructs a triangle from given congruence data using a set square and compass, labels it, documents the performed steps in a clear order and checks the givens against the result.',
      transferExpectationDe: 'Bei einem neuen zulässigen Datensatz mit anderer Anordnung der Angaben, etwa SWS statt SSS, wählt die lernende Person eine passende Folge aus Grundseite, Winkelstrahl oder Kreisbögen und dokumentiert die neue Konstruktion ohne Abzeichnen des Bildes.',
      transferExpectationEn: 'For a fresh valid data set with a different arrangement of givens, such as SAS instead of SSS, the learner chooses a suitable sequence of base, angle ray or compass arcs and documents the new construction without copying the image.',
    },
    rationale: 'Der kurze DE/EN-Text nennt die eine konstruktive Kompetenz mit beiden Werkzeugen und nachvollziehbarer Dokumentation bereits präzise. Das PNG zeigt nur ein fertiges SSS-Ergebnis; es liefert weder Konstruktionsschritte noch Leistungsnachweis. Die aktuelle P-v2-Aufgabe prüft diese Schritte an unabhängigen SWS- und SSS-Datensätzen. Lösbarkeitsklassifikation und Sinussatz bleiben außerhalb dieses Ziels; keine lokale Textänderung nötig.',
    evidenceProfileRecommendation: 'none',
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann aus gegebenen Seiten- und Winkelangaben mithilfe von Kongruenzsätzen und geometrischen Bedingungen begründen, ob kein Dreieck, genau ein Dreieck bis auf Kongruenz oder mehrere nicht kongruente Dreiecke möglich sind.',
    proposedDescriptionEn: 'From given side and angle data, the learner can use congruence theorems and geometric conditions to justify whether no triangle, exactly one triangle up to congruence, or several non-congruent triangles are possible.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die Dreiecksungleichung entscheidet bei drei Seiten über die Existenz; gültige SSS-Angaben legen eine Form bis auf Kongruenz fest, während bestimmte Seiten-Winkel-Lagen durch zwei zulässige Kreis-Strahl-Schnittpunkte mehrere nicht kongruente Formen ergeben.',
      essentialUnderstandingEn: 'The triangle inequality determines existence for three sides; valid SSS data fix one shape up to congruence, while some side-angle arrangements yield several non-congruent shapes through two valid circle-ray intersections.',
      observablePerformanceDe: 'Die lernende Person prüft konkrete Seiten- und Winkelangaben selbst und begründet mit Dreiecksungleichung, Kongruenzsatz oder geometrischen Schnittbedingungen, warum null, eine oder mehrere nicht kongruente Lösungen vorliegen.',
      observablePerformanceEn: 'The learner independently checks concrete side and angle data and uses the triangle inequality, a congruence theorem or geometric intersection conditions to justify zero, one or several non-congruent solutions.',
      transferExpectationDe: 'Bei neuen Daten wechselt die lernende Person von einem SSS-Fall mit Existenz- und Eindeutigkeitsprüfung zu einer möglichen mehrdeutigen Seiten-Winkel-Lage und begründet die Anzahl der Lösungen erneut aus den konkreten Bedingungen statt aus den drei Bildkarten.',
      transferExpectationEn: 'With fresh data, the learner moves from an SSS case testing existence and uniqueness to a potentially ambiguous side-angle arrangement and again derives the number of solutions from the concrete conditions rather than the three picture cards.',
    },
    rationale: '„Genau ein Dreieck“ ist ohne die übliche Identifikation kongruenter Figuren bei SSS missverständlich: spiegelbildliche Zeichnungen wären sonst als zwei Dreiecke zählbar. Das aktuelle Bild zeigt nur „ein Dreieck“, während sein Alt-Text und das aktuelle P-v2-Profil die Eindeutigkeit bereits korrekt auf Kongruenzklassen beziehen. Die vorgeschlagene kurze DE/EN-Präzisierung macht diese vorhandene Modellkonvention im Zieltext selbst klar; sie erweitert weder das J7-Argumentationsziel noch verlangt sie das Konstruieren des Geschwisterziels.',
    evidenceProfileRecommendation: 'none',
  },
]

if (input.goals.length !== 2 || batch.goalIds.length !== 2 || findings.length !== 2) {
  throw new Error('This blind review must contain exactly the two bound J7 goals')
}
const records = input.goals.map((goal, index) => ({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  recordId: `${runId}-${goal.goalId.slice(0, 8)}`,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  goalId: goal.goalId,
  goalFingerprint: goal.goalFingerprint,
  pageFingerprint: goal.pageFingerprint,
  currentTitleDe: goal.currentTitleDe,
  currentTitleEn: goal.currentTitleEn,
  currentDescriptionDe: goal.currentDescriptionDe,
  currentDescriptionEn: goal.currentDescriptionEn,
  ...findings[index],
  evidenceProfileContract: 'positive-understanding-evidence-v2',
  recordStatus: 'candidate',
  reviewAuthority: 'ai_candidate',
}))
if (records.some((record, index) => record.goalId !== batch.goalIds[index])) {
  throw new Error('Bound goal order changed')
}
const recordsBytes = Buffer.from(records.map((record) => JSON.stringify(record)).join('\n') + '\n')
const resultsDirectory = join(directory, 'results')
await mkdir(resultsDirectory, { recursive: true })
await writeFile(join(resultsDirectory, `${batch.batchId}.records.jsonl`), recordsBytes)

const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'Codex subagent; runtime model ID not exposed',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({ mode: 'independent-manual-review', temperature: 'not-exposed' })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'review_markdown', digest: 'sha256:8bdf9a06311cbfc9e39da2b4cb6ffee29bfabf3fa587745f9110cd9d84ad8a89' },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v2',
}
await writeFile(join(resultsDirectory, `${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(`Round B materialized: ${records.length} records; ${run.outputDigest}`)
