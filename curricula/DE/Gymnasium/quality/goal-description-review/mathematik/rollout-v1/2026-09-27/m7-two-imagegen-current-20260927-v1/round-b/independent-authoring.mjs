import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// This script serializes independently authored Round B judgments. It reads
// only the shared bundle and Round B inputs; it never reads Round A output.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-two-imagegen-current-20260927-v1'
const round = `${here}/round-b`
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const at = (path) => resolve(root, path)
const jsonBytes = (value) => `${JSON.stringify(value, null, 2)}\n`
const campaign = JSON.parse(readFileSync(at(`${round}/description-review-campaign.json`), 'utf8'))
const input = JSON.parse(readFileSync(at(`${round}/description-review-input.json`), 'utf8'))
const bundle = JSON.parse(readFileSync(at(`${round}/review-bundle-manifest.json`), 'utf8'))
const batch = campaign.batches[0]
const batchPath = `${round}/batches/${batch.batchId}.input.jsonl`
const batchBytes = readFileSync(at(batchPath))
const lines = batchBytes.toString('utf8').trimEnd().split('\n').map(JSON.parse)
if (sha(batchBytes) !== batch.batchInputFingerprint || campaign.goalCount !== 2 ||
    input.goals.length !== 2 || lines.length !== 2 ||
    bundle.bundleFingerprint !== campaign.bundleFingerprint) {
  throw new Error('Round B input bindings differ')
}

const authored = {
  '4f64f771-20ba-581a-86ba-bcdb1759e4d2': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die kartesischen Komponenten eines komplexen Punkts bestimmen seinen Abstand r vom Ursprung und für z≠0 einen Winkel φ zur positiven reellen Achse; Winkel, die sich um 2π unterscheiden, beschreiben denselben Punkt. In der Polarform verbindet r die Größe mit φ als Richtung, während bei z=0 nur r=0 bestimmt ist. In φ=ωt macht das Vorzeichen von ω den Drehsinn und |ω| die Winkeländerung je Zeiteinheit sichtbar.',
      essentialUnderstandingEn: 'The Cartesian components of a complex point determine its distance r from the origin and, for z≠0, an angle φ from the positive real axis; angles differing by 2π describe the same point. In polar form r expresses magnitude and φ direction, whereas at z=0 only r=0 is determined. In φ=ωt, the sign of ω gives the rotation direction and |ω| the angular change per unit time.',
      observablePerformanceDe: 'Zu einem unabhängig vorgelegten Punkt außerhalb des ersten Quadranten trägt die lernende Person Real- und Imaginärteil maßstäblich ein, bestimmt r und ein quadrantenrichtiges Argument und übersetzt den Punkt in r(cosφ+i sinφ) beziehungsweise re^{iφ}. Für eine neu vorgelegte Darstellung mit φ=ωt erklärt sie Radius, Vorzeichen, Einheit und Drehsinn; für den Ursprung nennt sie r=0 ohne ein Argument festzulegen.',
      observablePerformanceEn: 'For an independently supplied point outside quadrant I, the learner plots real and imaginary parts to scale, finds r and an argument in the correct quadrant, and translates the point into r(cosφ+i sinφ) or re^{iφ}. For a fresh representation with φ=ωt, they explain radius, sign, unit, and rotation direction; at the origin they state r=0 without assigning an argument.',
      transferExpectationDe: 'In einer neuen Aufgabe wechselt die Vorgabe von kartesischen Koordinaten eines festen Punkts zu z(t)=4e^{iπt/6}. Die lernende Person leitet daraus selbstständig nicht-achsengebundene Positionen, die Drehung gegen den Uhrzeigersinn und die Periodendauer 12 s ab, statt die im Bild gezeigten Vierteldrehungen im Uhrzeigersinn zu übernehmen.',
      transferExpectationEn: 'A fresh task changes the given information from Cartesian coordinates of a fixed point to z(t)=4e^{iπt/6}. The learner independently derives positions away from the axes, counterclockwise rotation, and a 12-second period rather than copying the image’s clockwise quarter-turns.',
    },
    rationale: 'KEEP: DE und EN benennen dieselbe zusammenhängende AB2-Darstellungskompetenz mit Polarform, Betrag, Argument nur für z≠0 und der fachlichen Deutung von φ=ωt. Der Zeitfall nutzt die zuvor dargestellte Betrag-Winkel-Beziehung; er verlangt keine separate dynamische Modellierung. Die aktuelle, unmittelbar betrachtete imagegen-Grafik zeigt z=1+i bei (1,1), r=√2, φ=45°=π/4 und 2e^(−iπt/2) mit t=0 rechts, 1 unten, 2 links, 3 oben korrekt. Sie ist Lehrhilfe und liefert keine eigenständige Lernendenleistung; ein neues Aufgabenformat muss andere Punkte und Bewegung verwenden. Der rohe sourceRef zu HMKB Q4.3 S. 52 begrenzt die Einordnung, ersetzt aber keine unabhängig geprüfte vollständige Quellenabbildung. Im gebundenen D-Input ist kein aktuelles V2-Profil mitgeliefert: create. Keine Humanfreigabe.',
    evidenceProfileRecommendation: 'create',
  },
  'a7fb1a7a-8315-5bcb-842e-48293293dfcc': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Addition und Subtraktion komplexer Zahlen verändern den Punkt durch Vektorverschiebungen um den zweiten Operanden beziehungsweise dessen Gegenvektor. Multiplikation mit einem von null verschiedenen Faktor kombiniert die Multiplikation der Beträge mit der Addition der Argumente; der Nullfaktor bildet dagegen auf den Ursprung ab. Division durch einen von null verschiedenen Faktor kombiniert den Betragsquotienten mit der Differenz der Argumente. Dadurch werden additive und multiplikative Wirkungen in derselben Zahlenebene unterscheidbar.',
      essentialUnderstandingEn: 'Adding and subtracting complex numbers move the point by the second operand or its opposite vector. Multiplication by a nonzero factor combines multiplication of moduli with addition of arguments, whereas a zero factor maps to the origin. Division by a nonzero factor combines the modulus quotient with subtraction of arguments. This distinguishes additive and multiplicative effects in the same complex plane.',
      observablePerformanceDe: 'Für unabhängig vorgelegte komplexe Zahlen berechnet und zeichnet die lernende Person Anfangs- und Endpunkte aller vier Rechenarten in gleich skalierten Achsen. Sie erklärt die beiden Verschiebungsvektoren sowie für einen von null verschiedenen Faktor Drehsinn und Betragsfaktor der Multiplikation und Division. Den Nullfaktor ordnet sie dem Ursprung zu und prüft, dass ein Divisor nicht null ist.',
      observablePerformanceEn: 'For independently supplied complex numbers, the learner calculates and plots the initial and terminal points of all four operations on equally scaled axes. They explain the two translation vectors and, for a nonzero factor, the rotation direction and modulus factor of multiplication and division. They map a zero factor to the origin and check that a divisor is nonzero.',
      transferExpectationDe: 'In einer neuen Aufgabe ersetzt u=−2 den schrägen Faktor 1+i des Bildes. Die lernende Person deutet Addition und Subtraktion als entgegengesetzte waagerechte Verschiebungen, Multiplikation als Halbdrehung mit Streckung um 2 und Division als Halbdrehung mit Betragsfaktor 1/2; sie begründet diese Änderungen aus Betrag und Argument von u.',
      transferExpectationEn: 'In a fresh task, u=−2 replaces the image’s oblique factor 1+i. The learner interprets addition and subtraction as opposite horizontal translations, multiplication as a half-turn with scale factor 2, and division as a half-turn with modulus factor 1/2; they justify these changes from the modulus and argument of u.',
    },
    rationale: 'KEEP: Der DE/EN-Text fordert eine einheitliche geometrische Interpretation der vier Grundrechenarten, nicht vier voneinander gelöste Rechenverfahren. Die additive Verschiebung und die multiplikative Drehung/Streckung sind zwei kontrastierende Wirkungen desselben Repräsentationswechsels; der Divisor ungleich null steht ausdrücklich im Text. Die bestehende semanticAtomic-Angabe ist allein kein Entscheidungsgrund, doch die gemeinsame Deutungsleistung ist in einer Aufgabe prüfbar und rechtfertigt hier kein split_review. Das tatsächlich betrachtete imagegen-PNG verwendet gleich skalierte Re-/Im-Achsen: z=u=1+i ergibt Summe (2,2), Differenz (0,0), Produkt (0,2) und Quotient (1,0); ±45° und √2 stimmen. Es illustriert nur ein Beispiel und ist kein Leistungsnachweis. Der sourceRef nennt HMKB Q4.3 S. 52; die vollständige Quellenabbildung und effektive Projektion wurden in diesem D-Input nicht nachgewiesen. Ein aktuelles V2-Profil ist dort nicht mitgeliefert: create. Keine Humanfreigabe.',
    evidenceProfileRecommendation: 'create',
  },
}

const keys = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
]
const runId = `${batch.batchId}.codex-independent-b`
const records = input.goals.map((goal, index) => {
  for (const key of keys) {
    if (goal[key] !== lines[index].goal[key]) throw new Error(`Round B page/input mismatch: ${goal.goalId} ${key}`)
  }
  if (goal.goalId !== batch.goalIds[index] || !authored[goal.goalId]) throw new Error('Round B scope changed')
  const judgment = authored[goal.goalId]
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map((key) => [key, goal[key]])),
    decision: judgment.decision,
    understandingEvidence: judgment.understandingEvidence,
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: judgment.evidenceProfileRecommendation,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`

const reviewedImages = input.goals.map(({ goalId, reviewContext }) => {
  const image = reviewContext.page.visualization
  const path = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`
  if (sha(readFileSync(at(path))) !== image.originalDigest) throw new Error(`Current image differs: ${goalId}`)
  return { goalId, path, digest: image.originalDigest, actuallyViewed: true }
})
const disclosure = {
  execution: 'Independent Codex subagent /root/rebind_two_imagegen_p authored Round B; exact serving model identifier not exposed',
  provider: 'openai',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by the orchestration environment; none inferred',
  startedAt: '2026-09-27T16:30:09.000Z',
  timestampScope: 'Clock captured before final Round B authoring; earlier input reading occurred before this capture',
  independence: 'No Round A output, earlier D review, adjudication, synthesis, or canonical diff was read. This agent previously authored the separate P-v2 rebind and had seen its profiles; these D judgments use the supplied Round B input. Independence is from other D runs, not model or provider diversity.',
  reviewedImages,
  boundary: 'Description review AI candidates only. Images are current page context; this run grants no visualization or human approval and does not assert complete source mapping or effective composition projection.',
}
const disclosureBytes = jsonBytes(disclosure)
const artifactDigest = (role) => bundle.artifacts.find((item) => item.role === role)?.digest
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
  provider: disclosure.provider,
  model: disclosure.model,
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(disclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'book_pdf', digest: artifactDigest('book_pdf') },
    { role: 'review_markdown', digest: artifactDigest('review_markdown') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'run_manifest_schema', digest: artifactDigest('run_manifest_schema') },
  ],
  startedAt: disclosure.startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
}
if (run.inputArtifacts.some(({ digest }) => !digest)) throw new Error('Required bound input artifact is missing')

const files = [
  [`${round}/runtime-disclosure.json`, disclosureBytes],
  [`${round}/results/${batch.batchId}.records.jsonl`, recordsBytes],
  [`${round}/results/${batch.batchId}.run.json`, jsonBytes(run)],
]
process.stdout.write(`*** Begin Patch\n${files.map(([path, content]) =>
  `*** Add File: ${path}\n${content.trimEnd().split('\n').map((line) => `+${line}`).join('\n')}\n`
).join('')}*** End Patch\n`)
