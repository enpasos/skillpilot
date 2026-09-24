import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Current v2 Round B only; no other round, earlier review, resolution or diff is read.
const startedAt = '2026-09-23T19:47:45.097Z'
const directory = dirname(fileURLToPath(import.meta.url))
const input = JSON.parse(await readFile(join(directory, 'description-review-input.json'), 'utf8'))
const campaign = JSON.parse(await readFile(join(directory, 'description-review-campaign.json'), 'utf8'))
const batch = campaign.batches[0]
const runId = 'math-m7-j7-triangle-png-current-20260923-v2-first-pass-b-codex'
const sha256 = (data) => `sha256:${createHash('sha256').update(data).digest('hex')}`

const findings = [
  {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Zulässige Seiten- und Winkelangaben werden als geometrische Bedingungen für die Eckpunkte umgesetzt: Eine Grundseite, ein Winkelstrahl oder Kreisbögen legen die Lage des Dreiecks fest, die das fertig konstruierte Ergebnis erfüllen muss.',
      essentialUnderstandingEn: 'Valid side and angle data become geometric conditions on the vertices: a base, an angle ray or compass arcs locate the triangle, and the completed construction must satisfy those givens.',
      observablePerformanceDe: 'Die lernende Person konstruiert aus einem eigenständigen zulässigen Datensatz mit Geodreieck und Zirkel ein beschriftetes Dreieck und dokumentiert Grundseite, Winkel- beziehungsweise Kreisbogenkonstruktion und Endkontrolle in nachvollziehbarer Reihenfolge.',
      observablePerformanceEn: 'From an independent valid data set, the learner uses a set square and compass to construct a labelled triangle and documents the base, angle or compass-arc steps and final check in a traceable order.',
      transferExpectationDe: 'Wechseln die Angaben von SSS zu SWS, passt die lernende Person die Werkzeugfolge von zwei Kreisbögen auf Winkelstrahl und Längenabtrag an und erklärt, wie die neue Folge alle Vorgaben erfüllt.',
      transferExpectationEn: 'When the givens change from SSS to SAS, the learner adapts the tool sequence from two compass arcs to an angle ray and transferred length and explains how the new sequence meets every given.',
    },
    rationale: 'Der aktuelle DE/EN-Zieltext verlangt genau eine Konstruktionskompetenz: zulässige Angaben mit Geodreieck und Zirkel umsetzen und die Schritte nachvollziehbar dokumentieren. Das unveränderte 5/6/7-cm-PNG zeigt nur ein mögliches Endergebnis, keine ausgeführte Konstruktion. Der aktuelle P-v2-Kandidat verlangt unabhängig davon SWS- und SSS-Konstruktionen samt Schrittfolge; weder Lösbarkeitsklassifikation noch Sinussatz werden hereingenommen. Keine konkrete Textschwäche.',
    evidenceProfileRecommendation: 'none',
  },
  {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die gegebenen Maße müssen geometrisch miteinander vereinbar sein: Die Dreiecksungleichung kann Existenz ausschließen, gültige SSS-Daten legen genau eine Form bis auf Kongruenz fest, und manche Seiten-Winkel-Lagen erlauben mehrere nicht kongruente Schnittlagen.',
      essentialUnderstandingEn: 'The given measures must be geometrically compatible: the triangle inequality can rule out existence, valid SSS data determine exactly one shape up to congruence, and some side-angle arrangements allow several non-congruent intersection positions.',
      observablePerformanceDe: 'Die lernende Person untersucht konkrete Angaben und begründet eigenständig mit Dreiecksungleichung, Kongruenzsatz oder Schnittbedingungen, ob null, eine Kongruenzklasse oder mehrere nicht kongruente Dreiecke möglich sind.',
      observablePerformanceEn: 'The learner examines concrete data and independently uses the triangle inequality, a congruence theorem or intersection conditions to justify whether zero, one congruence class or several non-congruent triangles are possible.',
      transferExpectationDe: 'Nach einer SSS-Prüfung beurteilt die lernende Person eine neue, möglicherweise mehrdeutige Seiten-Winkel-Lage über Kreis-Strahl-Schnitte und leitet die Anzahl der Lösungen aus den neuen Maßen ab statt aus den drei Bildkarten.',
      transferExpectationEn: 'After an SSS check, the learner examines a fresh potentially ambiguous side-angle arrangement through circle-ray intersections and derives the number of solutions from its new measures rather than the three picture cards.',
    },
    rationale: 'Die aktuelle deutsche und englische Beschreibung benennt Existenz, Eindeutigkeit bis auf Kongruenz und mehrere nicht kongruente Lösungen nun ausdrücklich und inhaltlich deckungsgleich. Damit ist die Zählkonvention bei spiegelbildlichen SSS-Zeichnungen klar, ohne eine zusätzliche Konstruktionsleistung zu fordern. Das Drei-Karten-PNG ist nur Orientierung; insbesondere SSS braucht gültige Seiten und der SSA-Zweifall ist nicht allgemein. Der aktuelle separate P-v2-Kandidat prüft die Bedingungen an unabhängigen SSS-/SSA-Daten, also kein weiterer Änderungsbedarf.',
    evidenceProfileRecommendation: 'none',
  },
]

if (input.goals.length !== 2 || batch.goalIds.length !== 2 || findings.length !== 2) {
  throw new Error('This v2 blind review must contain exactly the two bound J7 goals')
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
  generationParametersFingerprint: sha256(JSON.stringify({ mode: 'independent-current-v2-review', temperature: 'not-exposed' })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'review_markdown', digest: 'sha256:9c2892ad535a0d8b3a8ea056c1748f47393b9d4be4997f07b7f5b1788d8bc849' },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v2',
}
await writeFile(join(resultsDirectory, `${batch.batchId}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(`v2 Round B materialized: ${records.length} records; ${run.outputDigest}`)
