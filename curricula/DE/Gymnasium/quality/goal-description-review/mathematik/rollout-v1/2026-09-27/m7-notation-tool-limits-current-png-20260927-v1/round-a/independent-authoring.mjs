import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Blind Round A serialization. Read only the shared prepared bundle and A input;
// never open an earlier D decision, Round B output, synthesis, or registry.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-notation-tool-limits-current-png-20260927-v1'
const round = `${here}/round-a`
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
const ids = ['aeae526e-b3a4-5a17-b177-351df0307cb9', 'c97a33d9-d5e4-56c5-ae4c-822bc4f54898']
if (sha(batchBytes) !== batch.batchInputFingerprint || campaign.goalCount !== 2 ||
    input.goals.length !== 2 || lines.length !== 2 ||
    ids.some((id, index) => id !== batch.goalIds[index] || id !== input.goals[index].goalId) ||
    bundle.bundleFingerprint !== campaign.bundleFingerprint) {
  throw new Error('Round A input bindings differ')
}

const judgments = {
  [ids[0]]: {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die Bedeutung einer mathematischen Schreibweise hängt von Rolle, Kontext und adressierter Person ab: Bei f(3)=7 bezeichnet f eine Funktion, 3 die Eingabe und 7 den zugehörigen Wert; die Zeichen sind keine austauschbaren Namen. Eine verständliche Erklärung verbindet die formale Notation mit einem passenden konkreten Beispiel, ohne ihre mathematische Bedeutung zu verlieren.',
      essentialUnderstandingEn: 'The meaning of mathematical notation depends on role, context and audience: in f(3)=7, f names a function, 3 the input and 7 its corresponding value; these signs are not interchangeable labels. A clear explanation connects formal notation with a suitable concrete example without losing its mathematical meaning.',
      observablePerformanceDe: 'Für eine unabhängig vorgelegte neue Funktionsschreibweise erklärt die lernende Person einer bezeichneten Zielgruppe in eigenen Worten, was Funktionsname, eingesetzte Variable und Ergebnis bedeuten, zeigt die Zuordnung an einem selbst gewählten Beispiel und prüft, ob eine mögliche Fehlinterpretation wie Multiplikation oder Vertauschen von Eingabe und Ausgabe ausgeschlossen ist.',
      observablePerformanceEn: 'For independently supplied new function notation, the learner explains in their own words to a specified audience what the function name, substituted variable and result mean, illustrates the mapping with an example they choose, and checks that a plausible misreading such as multiplication or swapping input and output is ruled out.',
      transferExpectationDe: 'Eine frische Aufgabe wechselt von Funktionswerten zur Intervall- und Mengenschreibweise A=[2,5) und x∈A. Die lernende Person erklärt einer jüngeren Person, weshalb 2 dazugehört und 5 nicht, nennt passende enthaltene und ausgeschlossene Zahlen und übersetzt die Zeichen in Alltagssprache, statt den Bildfall f(3)=7 nachzusprechen.',
      transferExpectationEn: 'A fresh task changes from function values to interval and set notation A=[2,5) and x∈A. The learner explains to a younger student why 2 is included and 5 is not, gives suitable included and excluded numbers, and translates the signs into ordinary language instead of repeating the image’s f(3)=7 example.',
    },
    rationale: 'KEEP: DE und EN beanspruchen dieselbe einzelne Kommunikationsleistung: verwendete mathematische Notation für Adressaten verständlich erläutern und durch geeignete Beispiele verdeutlichen. Erklären und Beispielgeben sind hier ein zusammenhängender Nachweis, keine zwei unabhängig zu splittenden Fachziele. Das direkt betrachtete aktuelle PNG sha256:a04ca7f4853c4fff837d381c7c7851376285dae9a1d4a2291fc2347c89887281 zeigt f(3)=7, die Rollen von f, 3 und 7 sowie eine konsistente Wertetabelle; es ist Lehrhilfe, kein Lernendennachweis. Der frische Intervall-/Mengenfall verlangt einen echten Wechsel von Zeichenart und Adressatenperspektive. Im gebundenen D-Input ist evidenceProfile=null, deshalb Empfehlung create, auch wenn separat eine P-Arbeit existiert. Canonical sourceRef fehlt und Roh-Tags/Seitendarstellung allein beweisen keine vollständige Quellen- oder bundesweite Projektionsprüfung. KI-Kandidat, keine Humanfreigabe.',
    evidenceProfileRecommendation: 'create',
  },
  [ids[1]]: {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine digitale Werkzeugausgabe hängt von Eingabebereich, Einstellungen, numerischer Genauigkeit und Ausgabekonvention ab; ein angezeigter Hauptwert oder Graph beweist weder Vollständigkeit noch Gültigkeit aller mathematischen Aussagen. Eine sinnvolle Sicherung richtet sich nach der konkreten Fehlerquelle: Definitionsbereich prüfen, Näherungen kontrollieren oder weitere Lösungen unabhängig suchen.',
      essentialUnderstandingEn: 'A digital tool output depends on input domain, settings, numerical precision and output convention; a displayed principal value or graph proves neither completeness nor the validity of every mathematical claim. An appropriate safeguard matches the actual failure mode: check the domain, verify approximations or independently search for further solutions.',
      observablePerformanceDe: 'Zu einer unabhängig vorgelegten Werkzeugausgabe und Aufgabenbedingung benennt die lernende Person die konkrete Grenze, beispielsweise einen nur angezeigten Hauptwert statt aller Intervalllösungen. Sie überprüft Kandidaten an der Ausgangsbedingung, sucht weitere zulässige Fälle mit einer begründeten mathematischen Kontrolle und erklärt, warum genau diese Sicherung die Lücke der Ausgabe schließt.',
      observablePerformanceEn: 'Given an independently supplied tool result and task condition, the learner identifies the specific limitation, such as one displayed principal value rather than all solutions in an interval. They check candidates against the original condition, seek further admissible cases by a justified mathematical check, and explain why that safeguard addresses the output’s gap.',
      transferExpectationDe: 'In einer neuen Aufgabe zeigt ein Plotter für g(x)=1/(x−1) nahe x=1 scheinbar verbundene Kurvenpunkte. Die lernende Person wechselt von der Mehrdeutigkeit einer Umkehrfunktion zum Definitionsbereichsproblem: Sie schließt x=1 wegen Nenner null aus, prüft Werte auf beiden Seiten und verwirft einen dort abgelesenen Funktionswert oder eine durchgehende Kurve trotz der Anzeige.',
      transferExpectationEn: 'In a fresh task, a plotter appears to connect points of g(x)=1/(x−1) near x=1. The learner transfers from inverse-function ambiguity to a domain problem: they exclude x=1 because the denominator is zero, check values on both sides, and reject a displayed value there or a continuous curve despite the tool display.',
    },
    rationale: 'KEEP: Der aktuelle DE-/EN-Text verbindet Werkzeuggrenzen mit der sachlich passenden Sicherung und bleibt als eine AB3-Prüfkompetenz zusammenhängend; Definitionsbereich, Näherung und Mehrdeutigkeit sind Beispiele, keine Pflicht, drei unabhängige Ziele zu behaupten. Das direkt betrachtete gebundene PNG sha256:5757931b056b60db83cbb19b0229d4b33f944c7471c26ec108c5be7529ddfda1 veranschaulicht bei sin(x)=1/2 im Intervall [0,π] den Hauptwert π/6 und die zweite Lösung 5π/6 korrekt. Eine Werkzeuganzeige oder das Bild allein ist kein Nachweis, dass die lernende Person die Grenze selbst erkennt. Der frische Polstellenfall erfordert eine andere Sicherung aus dem Definitionsbereich statt nur eine andere Zahl im Sinusbeispiel. Im gebundenen D-Input ist evidenceProfile=null, daher create. Canonical sourceRef fehlt; Roh-Tags/Seitendarstellung belegen keine vollständige externe Quelle oder effektive Projektion. KI-Kandidat, keine Humanfreigabe.',
    evidenceProfileRecommendation: 'create',
  },
}

const keys = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
]
const runId = `${batch.batchId}.codex-independent-a`
const records = input.goals.map((goal, index) => {
  for (const key of keys) {
    if (goal[key] !== lines[index].goal[key]) throw new Error(`Round A page/input mismatch: ${goal.goalId} ${key}`)
  }
  const judgment = judgments[goal.goalId]
  if (!judgment || goal.reviewContext.evidenceProfile !== null) throw new Error('Round A scope or P-context changed')
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
  execution: 'Independent Codex subagent /root/rebind_two_imagegen_p authored Round A; exact serving model identifier not exposed',
  provider: 'openai',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by orchestration; none inferred',
  startedAt: '2026-09-27T17:06:28.000Z',
  timestampScope: 'Clock captured during current Round A input and image review; aeae V import and P rebind preceded this time',
  independence: 'No old five-goal D decision, new Round B output, adjudication, synthesis or D registry was read before these Round A judgments. This agent imported and directly reviewed the aeae image, authored its separate P rebind, and had seen that P profile; this prior non-D exposure is disclosed. Independence is from other D reviewers, not provider or model diversity.',
  reviewedImages,
  boundary: 'Description-review AI candidates only. The images are teaching context, not learner evidence. No human approval, complete source mapping, effective composition projection, or D/P/V registry mutation is claimed by this run.',
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
