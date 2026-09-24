import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const bundle = JSON.parse(await readFile(join(root, 'review-bundle-manifest.json'), 'utf8'))
const campaign = JSON.parse(await readFile(join(root, 'description-review-campaign.json'), 'utf8'))
const batch = campaign.batches[0]
const batchPath = join(root, 'batches', `${batch.batchId}.input.jsonl`)
const batchBytes = await readFile(batchPath)
const rows = batchBytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line))
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const runId = `${campaign.roundId}.run-1`
// The fresh bound criteria were created at 17:47:34 UTC. Review of that
// bundle started shortly afterward; 17:48 UTC is an approximate minute mark,
// not a claim of millisecond precision. The first finalized record set was
// produced at 17:52:25.215 UTC; a provenance-only rerun preserves that end.
const startedAt = '2026-09-23T17:48:00.000Z'
const completedAt = '2026-09-23T17:52:25.215Z'

const reviews = {
  'e495fa38-b198-5280-a405-9e41cafd6d17': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein vorab festgelegtes Ereignis teilt den Einzelversuch in Treffer und Nichttreffer. Erst unabhängige Wiederholungen mit unveränderter Trefferwahrscheinlichkeit p bilden eine Bernoulli-Kette; n zählt ihre Versuche.',
      essentialUnderstandingEn: 'A predefined event divides each trial into success and failure. Only independent repetitions with unchanged success probability p form a Bernoulli chain; n counts its trials.',
      observablePerformanceDe: 'Die lernende Person identifiziert in einem neuen Zufallskontext Treffer und Nichttreffer, prüft Unabhängigkeit und konstantes p und gibt n und p mit ihrer Bedeutung an.',
      observablePerformanceEn: 'In a fresh random setting, the learner identifies success and failure, checks independence and constant p, and states n and p with their meanings.',
      transferExpectationDe: 'Bei einer mehrfeldrigen Drehscheibe fasst sie Ergebnisse zu Treffer/Nichttreffer zusammen; bei Ziehungen ohne Zurücklegen erkennt sie anhand einer geänderten Folgewahrscheinlichkeit, warum keine Bernoulli-Kette vorliegt.',
      transferExpectationEn: 'For a spinner with several sectors, the learner groups outcomes into success/failure; for draws without replacement, the learner uses a changed subsequent probability to explain why there is no Bernoulli chain.',
    },
    rationale: 'Die aktuelle zweisprachige Beschreibung nennt bereits das Erkennen beider Bernoulli-Strukturen anhand ihrer Voraussetzungen sowie die kontextbezogenen Parameter n und p. Sie ist knapp, fachlich richtig und lässt die konkreten Bedingungen dem gebundenen P-v2-Profil. Das Münzwurf-PNG ist nur ein anschauliches Beispiel; unabhängige Klassifikation in neuen Kontexten bleibt nötig. Eine längere Ersatzformulierung würde keine belegte Beschreibungsunklarheit beheben.',
  },
  '5a2371fd-74ce-5013-932e-35d3713aeaf7': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die theoretische Laplace-Wahrscheinlichkeit setzt gleichwahrscheinliche Elementarergebnisse voraus; die relative Häufigkeit ist der beobachtete Anteil desselben Ereignisses. Eine Abweichung in endlichen Reihen ist möglich und wird durch eine größere Versuchszahl nicht garantiert monoton kleiner.',
      essentialUnderstandingEn: 'A theoretical Laplace probability requires equally likely elementary outcomes; relative frequency is the observed proportion for the same event. Deviations are possible in finite series and are not guaranteed to decrease monotonically with trial count.',
      observablePerformanceDe: 'Die lernende Person begründet für ein frisches Ereignis den Laplace-Anteil, berechnet beobachtete Anteile für zwei Reihen, vergleicht ihre Abstände zum Modellwert und beschreibt die Aussagegrenze der Versuchszahl.',
      observablePerformanceEn: 'For a fresh event, the learner justifies the Laplace proportion, computes observed proportions for two series, compares their distances from the model value, and states the limit of the trial-count inference.',
      transferExpectationDe: 'Bei anders gruppierten gleichwahrscheinlichen Einzelergebnissen, etwa mehreren Kugeln derselben Farbe, bestimmt sie zuerst den richtigen Laplace-Grundraum und vergleicht erst dann neue Datenreihen, ohne eine Ausgleichsgarantie zu behaupten.',
      transferExpectationEn: 'With differently grouped equiprobable elementary outcomes, such as several balls of the same colour, the learner first identifies the correct Laplace sample space and then compares new data series without claiming guaranteed compensation.',
    },
    rationale: 'Die Beschreibung verbindet genau die beanspruchten Elemente: theoretische Laplace-Wahrscheinlichkeit, beobachtete relative Häufigkeiten und Einordnung der Abweichungen nach Versuchszahl. Sie behauptet keine garantierte Annäherung. Die fairer-Würfel-Grafik zeigt ausdrücklich nur ein Beispiel; der Daten- und Modellvergleich muss unabhängig erfolgen. Es gibt keinen belegten lokalen Textfehler, der eine Revision rechtfertigt.',
  },
  'f17935b0-189f-5e0c-988d-ce508b710097': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Äquivalenzumformungen erhalten die Lösungsmenge einer linearen Ungleichung. Multiplikation oder Division durch eine negative Zahl kehrt die Zahlenordnung und damit das Ungleichheitszeichen um; das Relationszeichen bestimmt die Zugehörigkeit des Randwerts.',
      essentialUnderstandingEn: 'Equivalent transformations preserve a linear inequality’s solution set. Multiplying or dividing by a negative number reverses numerical order and therefore the inequality sign; the relation determines whether the boundary value is included.',
      observablePerformanceDe: 'Die lernende Person löst eine neue lineare Ungleichung, begründet den Vorzeichenwechsel am betreffenden Schritt und stellt die Lösungsmenge korrekt auf einer selbst gezeichneten Zahlengeraden oder in Intervallschreibweise dar.',
      observablePerformanceEn: 'The learner solves a fresh linear inequality, justifies the sign reversal at the relevant step, and correctly represents the solution set on a self-drawn number line or in interval notation.',
      transferExpectationDe: 'Bei Variablentermen auf beiden Seiten und gewechselter Strenge der Relation isoliert sie x erneut, entscheidet über offenen oder geschlossenen Rand und prüft ihre gewählte Darstellung mit passenden Werten statt den Bildfall zu kopieren.',
      transferExpectationEn: 'With variable terms on both sides and changed strictness, the learner isolates x afresh, decides whether the boundary is open or closed, and checks the chosen representation with suitable values rather than copying the image case.',
    },
    rationale: 'Die aktuelle J8-Beschreibung ist fachlich präzise: Äquivalenzumformungen, Umkehrung bei negativer Skalierung und Zahlengerade oder Intervall sind bereits ausdrücklich genannt. Das Oder ist wesentlich; weder Beschreibung noch Nachweis dürfen beide Darstellungen zwingend verlangen. Das neue PNG illustriert einen korrekten Einzelfall mit offenem Rand bei −3, ersetzt aber keine selbstständige Lösung. Keine Wortlautänderung nötig.',
  },
  '740ab443-776a-5c7a-8f1d-2b0b59a5ed32': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Zur Implikation P ⇒ Q vertauscht die Umkehrung die Aussagen zu Q ⇒ P; die Kontraposition vertauscht und negiert sie zu ¬Q ⇒ ¬P. Nur die Kontraposition ist allgemein zur Ausgangsaussage gleichwertig.',
      essentialUnderstandingEn: 'For the implication P ⇒ Q, the converse swaps the statements to Q ⇒ P; the contrapositive swaps and negates them to ¬Q ⇒ ¬P. Only the contrapositive is generally equivalent to the original.',
      observablePerformanceDe: 'Die lernende Person formuliert aus einer neuen mathematischen Wenn-dann-Aussage beide Formen, bezeichnet jeweils Voraussetzung und Folgerung und negiert die Teilaussagen der Kontraposition korrekt.',
      observablePerformanceEn: 'From a fresh mathematical if-then statement, the learner states both forms, identifies premise and conclusion in each, and correctly negates the component statements in the contrapositive.',
      transferExpectationDe: 'Bei einer fachsprachlichen Aussage mit einer strengen Ungleichung oder geometrischen Eigenschaft bildet sie die negierten Bedingungen ausdrücklich und trennt eine mögliche falsche Umkehrung von der gleichwertigen Kontraposition.',
      transferExpectationEn: 'For a verbal statement involving a strict inequality or geometric property, the learner states the negated conditions explicitly and separates a possibly false converse from the equivalent contrapositive.',
    },
    rationale: 'Die kurze Beschreibung beansprucht genau das korrekte Bilden und Unterscheiden von Umkehrung und Kontraposition zu einer mathematischen Implikation. Sie verspricht keinen Beweis durch Kontraposition, der erst ein Nachfolgerziel ist. Das Symbol-PNG ordnet die drei Formen korrekt, ist aber keine Lernendenleistung. Die Details von Negation und Gültigkeit gehören in die Verständnisnachweise; KEEP wahrt die bestehende klare Kompetenzgrenze.',
  },
}

if (rows.length !== campaign.goalCount || rows.some((row, index) => row.goal.goalId !== batch.goalIds[index])) {
  throw new Error('The bound Round A input does not match the exact four assigned goals')
}
if (bundle.bundleFingerprint !== campaign.bundleFingerprint || sha256(batchBytes) !== batch.batchInputFingerprint) {
  throw new Error('The Round A campaign or input fingerprint is not current')
}
const records = rows.map((row) => {
  const source = row.goal
  const review = reviews[source.goalId]
  if (!review) throw new Error(`No independent review for ${source.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${source.goalId}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: row.bundleFingerprint,
    bookDigest: row.bookDigest,
    goalId: source.goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    ...review,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'none',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
const resultDir = join(root, 'results')
await mkdir(resultDir, { recursive: true })
const outputBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const outputPath = join(resultDir, `${batch.batchId}.records.jsonl`)
await writeFile(outputPath, outputBytes)
const artifactByRole = new Map(bundle.artifacts.map((artifact) => [artifact.role, artifact]))
const inputArtifacts = [
  'book_model',
  'review_input_jsonl',
  'review_prompt',
  'review_criteria',
  'finding_schema',
  'run_manifest_schema',
].map((role) => {
  const artifact = artifactByRole.get(role)
  if (!artifact) throw new Error(`Missing bound review artifact: ${role}`)
  return { role, digest: artifact.digest }
})
inputArtifacts.push({
  role: 'description_review_batch_input_jsonl',
  digest: batch.batchInputFingerprint,
})
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
  model: 'Codex subagent (runtime model ID not exposed)',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({
    reviewMode: 'blind-first-pass',
    runtimeModelSamplingParameters: 'not exposed',
    outputContract: 'goal-description-review-record-v1',
  })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts,
  startedAt,
  completedAt,
  status: 'completed',
  outputDigest: sha256(outputBytes),
  toolchainVersion: 'codex-subagent-review-v1',
}
await writeFile(join(resultDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(`Materialized ${records.length} blind Round A records and exact run manifest`)
