import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Serialize independently authored Round B judgments from bound B input only.
// This script never opens Round A results, a synthesis, or a canonical diff.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-line-angle-scope-hold-20260927-v1'
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
const goalId = '18be713b-7d90-4f01-b60a-5582ac4df0e8'
if (sha(batchBytes) !== batch.batchInputFingerprint || campaign.goalCount !== 1 ||
    input.goals.length !== 1 || lines.length !== 1 || batch.goalIds[0] !== goalId ||
    bundle.bundleFingerprint !== campaign.bundleFingerprint) {
  throw new Error('Round B input bindings differ')
}
const goal = input.goals[0]
const keys = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
]
for (const key of keys) {
  if (goal[key] !== lines[0].goal[key]) throw new Error(`Round B page/input mismatch: ${key}`)
}
if (goal.goalId !== goalId || !goal.currentDescriptionDe.includes('zweier sich schneidender Geraden') ||
    !goal.currentDescriptionEn.includes('two intersecting lines') ||
    goal.reviewContext.evidenceProfile !== null) {
  throw new Error('Current line-line description or bound P-context differs')
}

const runId = `${batch.batchId}.codex-independent-b`
const record = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
  schemaVersion: 1,
  recordId: `${runId}.001`,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  ...Object.fromEntries(keys.map((key) => [key, goal[key]])),
  decision: 'keep',
  understandingEvidence: {
    essentialUnderstandingDe: 'Für zwei sich tatsächlich schneidende Geraden im Raum ist der nichtstumpfe Schnittwinkel eine Eigenschaft der Geraden und ihres Schnittpunkts, nicht der beliebig orientierten Richtungsvektoren. Das Skalarprodukt verbindet ihre Richtungen mit dem Winkel; der Betrag im normierten Skalarprodukt sorgt dafür, dass eine Umkehr eines Richtungsvektors denselben geometrischen Winkel zwischen 0° und 90° liefert.',
    essentialUnderstandingEn: 'For two lines that actually intersect in space, the non-obtuse angle is a property of the lines at their intersection, not of arbitrarily oriented direction vectors. The dot product connects their directions to the angle; taking its absolute value before normalization ensures that reversing either direction gives the same geometric angle from 0° to 90°.',
    observablePerformanceDe: 'Bei zwei unabhängig vorgelegten Geradengleichungen prüft die lernende Person rechnerisch die Schnittlage, bestimmt den Schnittpunkt, entnimmt von null verschiedene Richtungsvektoren und berechnet den nichtstumpfen Schnittwinkel mit |u·v|/(|u||v|). Sie erklärt am geometrischen Geradenpaar, warum ein stumpfer Winkel zwischen gewählten Vektoren nicht als gesuchter nichtstumpfer Schnittwinkel ausgegeben wird.',
    observablePerformanceEn: 'Given two independently supplied line equations, the learner checks algebraically that they intersect, finds the intersection point, takes nonzero direction vectors and computes the non-obtuse angle using |u·v|/(|u||v|). They explain from the geometric line pair why an obtuse angle between chosen vectors is not the requested non-obtuse intersection angle.',
    transferExpectationDe: 'Eine neue räumliche Geradenkonfiguration liefert zunächst einen negativen Skalarproduktwert. Die lernende Person bestimmt trotzdem den nichtstumpfen Geradenwinkel und zeigt durch Ersetzen eines Richtungsvektors durch sein Negatives, dass sich nur die Orientierung des Vektors, nicht die Gerade, Schnittlage oder der Winkel ändert; ein Gerade–Ebene-Winkel wird nicht einbezogen.',
    transferExpectationEn: 'A fresh spatial line configuration initially gives a negative dot product. The learner still determines the non-obtuse line angle and shows by replacing one direction vector with its negative that only the vector orientation changes, not the line, intersection, or angle; no line-plane angle is introduced.',
  },
  rationale: 'KEEP: Der aktuelle deutsche und englische Wortlaut ist fachlich gleichwertig, verständlich und auf den nichtstumpfen Winkel zweier sich schneidender Geraden begrenzt. Berechnung und geometrische Deutung bilden eine zusammenhängende AB2-Leistung; weder Gerade–Ebene noch Ebenenwinkel oder allgemeine Lageklassifikation wird eingeschmuggelt. Das gebundene, direkt betrachtete PNG zeigt g und h mit u=(1,0), v=(1,1), tatsächlichem Schnitt im Ursprung und 45° korrekt. Seine Formel ohne Betrag ist beim abgebildeten positiven Skalarprodukt richtig, deckt aber negative Vorzeichen und Richtungsumkehr nicht ab; deshalb fordert die unabhängige Transferevidenz den Betrag und die Invarianz. Die Seitendarstellung zeigt GK/LK-Kontext für Hessen, doch der bloße sourceRef und die Seite beweisen keine vollständige externe Quellenabbildung oder effektive Projektion. Im gebundenen D-Input liegt kein aktuelles V2-Profil vor, daher lautet die Empfehlung create, unabhängig von separat laufender P-Arbeit. Bild und diese KI-Entscheidung sind weder Lernendenleistung noch Humanfreigabe.',
  evidenceProfileContract: 'positive-understanding-evidence-v2',
  evidenceProfileRecommendation: 'create',
  recordStatus: 'candidate',
  reviewAuthority: 'ai_candidate',
}
const recordsBytes = `${JSON.stringify(record)}\n`
const image = goal.reviewContext.page.visualization
const imagePath = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`
if (sha(readFileSync(at(imagePath))) !== image.originalDigest) throw new Error('Current image differs')
const disclosure = {
  execution: 'Independent Codex subagent /root/rebind_two_imagegen_p authored Round B; exact serving model identifier not exposed',
  provider: 'openai',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by orchestration; none inferred',
  startedAt: '2026-09-27T16:45:21.000Z',
  timestampScope: 'Clock captured during Round B source and input examination; preparatory P work preceded this time',
  independence: 'No Round A output, earlier D decision, adjudication, synthesis, or canonical diff was read before this Round B decision. This agent authored the separate P split and saw the prior stale P record; this prior exposure is disclosed. Independence is from other D runs, not provider or model diversity.',
  reviewedImage: { goalId, path: imagePath, digest: image.originalDigest, actuallyViewed: true },
  sourceCrossCheck: 'Separately checked the public official HMKB 2024 Mathematics KCGO PDF, Q2.3 printed page 42: the line-line intersection point and angle clause is under grundlegendes Niveau (Grundkurs und Leistungskurs). This cross-check is outside the frozen D batch and does not assert full source mapping or learner-facing applicability.',
  sourceUrl: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf',
  boundary: 'Description review AI candidate only; no visualization, human, source-mapping, or effective-composition approval.',
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
if (run.inputArtifacts.some(({ digest }) => !digest)) throw new Error('Bound input artifact missing')
const files = [
  [`${round}/runtime-disclosure.json`, disclosureBytes],
  [`${round}/results/${batch.batchId}.records.jsonl`, recordsBytes],
  [`${round}/results/${batch.batchId}.run.json`, jsonBytes(run)],
]
process.stdout.write(`*** Begin Patch\n${files.map(([path, content]) =>
  `*** Add File: ${path}\n${content.trimEnd().split('\n').map((line) => `+${line}`).join('\n')}\n`
).join('')}*** End Patch\n`)
