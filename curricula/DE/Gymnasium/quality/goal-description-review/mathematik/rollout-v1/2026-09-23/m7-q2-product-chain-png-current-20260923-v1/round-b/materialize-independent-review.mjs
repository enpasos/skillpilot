import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const roundDirectory = dirname(fileURLToPath(import.meta.url))
const resultDirectory = join(roundDirectory, 'results')
const campaign = JSON.parse(readFileSync(join(roundDirectory, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(join(roundDirectory, 'review-bundle-manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const input = readFileSync(join(roundDirectory, 'batches', `${batch.batchId}.input.jsonl`), 'utf8')
  .trimEnd()
  .split('\n')
  .map((line) => JSON.parse(line))
const runId = `${campaign.campaignId}.run-001`
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const review = {
  'cf48c918-f6c1-5429-8da6-14df43f2f550': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Wenn beide Faktoren eines Produkts von x abhängen, erfasst die Ableitung die Änderung beider Faktoren: (uv)′ = u′v + uv′. Die Ableitungen einfach zu multiplizieren oder einen Beitrag wegzulassen, ist nicht gleichwertig.',
      essentialUnderstandingEn: 'When both factors of a product depend on x, its derivative accounts for changes in both: (uv)′ = u′v + uv′. Simply multiplying the derivatives or omitting one contribution is not equivalent.',
      observablePerformanceDe: 'Die lernende Person zerlegt ein neues Produkt in zwei differenzierbare Faktoren, leitet beide ab, erklärt die beiden Summanden der Produktableitung und überprüft ihr Ergebnis mit einem dazu passenden unabhängigen Kontrollweg.',
      observablePerformanceEn: 'The learner splits a fresh product into two differentiable factors, differentiates both, explains the two terms of the product derivative, and checks the result by a suitable independent route.',
      transferExpectationDe: 'Bei einem Produkt mit Exponentialfaktor statt zweier Polynome wendet die lernende Person weiterhin beide Änderungsbeiträge an und wählt eine passende lokale oder algebraische Kontrolle; ein möglicher Ausgleich der Beiträge an einer Stelle wird nicht mit einer konstanten Funktion verwechselt.',
      transferExpectationEn: 'For a product involving an exponential factor rather than two polynomials, the learner still includes both change contributions and chooses a suitable local or algebraic check; cancellation at one point is not confused with a constant function.',
    },
    rationale: 'KEEP: Die aktuelle DE/EN-Beschreibung benennt genau eine zusammenhängende LK-Kompetenz: Produkte differenzierbarer Funktionen mit der Produktregel ableiten und durch einen geeigneten, nicht festgelegten Kontrollweg prüfen. Das gerenderte Beispiel und das tatsächlich betrachtete PNG rechnen g=x², h=x+1, f′=2x(x+1)+x² und die Expansion f=x³+x², f′=3x²+2x korrekt vor; dies ist Lernhilfe und keine unabhängige Lernendenleistung. Das aktuelle P-v2-Profil prüft beide Beiträge und eine selbstständige Kontrolle in anderen Fällen, bleibt aber KI-Kandidat ohne menschliche Freigabe. Der rohe NRW-sourceRef und die gerenderte Geltungsmatrix wurden nicht als externe Quellen- oder Kompositionsfreigabe ausgegeben. Eine Textrevision würde hier keinen belegten Mangel beheben und darf Ausmultiplizieren nicht zum einzig zulässigen Kontrollweg machen.',
  },
  'ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Bei f(x)=g(u(x)) ist g eine eigenständige äußere Funktion und u die innere Funktion. Die äußere Ableitung wird am inneren Wert ausgewertet und mit der inneren Ableitung multipliziert: f′(x)=g′(u(x))u′(x).',
      essentialUnderstandingEn: 'For f(x)=g(u(x)), g is the independent outer function and u the inner function. The outer derivative is evaluated at the inner value and multiplied by the inner derivative: f′(x)=g′(u(x))u′(x).',
      observablePerformanceDe: 'Die lernende Person identifiziert in einer neuen Verkettung die beiden eigenständigen Funktionen, bildet g′ und u′, setzt u(x) an der richtigen Stelle ein und erklärt, weshalb der Faktor u′(x) im Ergebnis steht.',
      observablePerformanceEn: 'For a fresh composition, the learner identifies the two independent functions, finds g′ and u′, substitutes u(x) at the correct point, and explains why the factor u′(x) appears in the result.',
      transferExpectationDe: 'Bei einer Verkettung mit nichtlinearer innerer Funktion, etwa einer Exponentialfunktion von −x², passt die lernende Person die Auswertungsstelle und den variablen inneren Faktor an und begründet damit auch das Vorzeichen der resultierenden Ableitung.',
      transferExpectationEn: 'For a composition with a nonlinear inner function, such as an exponential of −x², the learner adjusts the evaluation point and variable inner factor and uses them to justify the sign of the resulting derivative.',
    },
    rationale: 'KEEP: Der aktuelle zweisprachige Text verlangt bereits das Ableiten einer Verkettung mit der Kettenregel und das nachvollziehbare Kennzeichnen von äußerer und innerer Funktion im Ableitungsweg. Er ist fachlich präzise, kurz und vom Produktregel-Nachbarziel getrennt. Das tatsächlich betrachtete korrigierte PNG zeigt ausdrücklich die eigenständige äußere Funktion g(t)=t³, die innere u(x)=x²+1 und den korrekten inneren Faktor 2x; der zurückgestellte Entwurf ist keine aktuelle Bindung. Das Bild beweist keine selbstständige Leistung. Das aktuelle P-v2-Profil prüft frische Verkettungen mit veränderter Reihenfolge bzw. nichtlinearer innerer Funktion, bleibt KI-Kandidat ohne menschliche Freigabe. Der rohe NRW-sourceRef und die gerenderte Geltungsmatrix wurden nicht als externe Quellen- oder Kompositionsfreigabe ausgegeben. Eine längere Ersatzbeschreibung würde hier keine belegte Unklarheit beseitigen.',
  },
}

if (input.length !== 2 || input.some((entry, index) => entry.goal.goalId !== batch.goalIds[index])) {
  throw new Error('The bound batch is not the expected two-goal Q2 order')
}
const records = input.map((entry, index) => {
  const substantive = review[entry.goal.goalId]
  if (!substantive) throw new Error(`Missing independent review for ${entry.goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: entry.bundleFingerprint,
    bookDigest: entry.bookDigest,
    goalId: entry.goal.goalId,
    goalFingerprint: entry.goal.goalFingerprint,
    pageFingerprint: entry.goal.pageFingerprint,
    currentTitleDe: entry.goal.currentTitleDe,
    currentTitleEn: entry.goal.currentTitleEn,
    currentDescriptionDe: entry.goal.currentDescriptionDe,
    currentDescriptionEn: entry.goal.currentDescriptionEn,
    ...substantive,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'none',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})

const recordBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const artifact = (role) => {
  const found = bundle.artifacts.find((entry) => entry.role === role)
  if (!found) throw new Error(`Missing bound artifact: ${role}`)
  return { role, digest: found.digest }
}
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
  provider: 'OpenAI',
  model: 'Codex subagent (runtime model ID not exposed)',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({ samplingControls: 'not exposed', process: 'independent manual review of bound Q2 bundle and original pixels' })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('book_pdf'),
    artifact('book_model'),
    artifact('review_prompt'),
    artifact('review_criteria'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: '2026-09-23T18:46:28.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordBytes),
  toolchainVersion: 'codex-independent-review-20260923',
}

mkdirSync(resultDirectory, { recursive: true })
writeFileSync(join(resultDirectory, `${batch.batchId}.records.jsonl`), recordBytes)
writeFileSync(join(resultDirectory, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(`${campaign.roundId}: ${records.length} independent candidate records, output ${run.outputDigest}`)
