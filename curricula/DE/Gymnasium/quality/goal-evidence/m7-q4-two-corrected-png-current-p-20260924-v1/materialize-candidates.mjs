import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packageRoot = dirname(fileURLToPath(import.meta.url))
const sourceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1'
const sourceConfig = `${sourceRoot}/retained-q4-two.config.json`
const sourceReview = `${sourceRoot}/retained-q4-two.review.jsonl`
const pins = new Map([
  [sourceConfig, 'ac28e4a5a5d318792827492c1dc9ed18e988d770dd2fd658e3c4181022881a2c'],
  [sourceReview, '63e6f1b8f9f7a6115153a13547412701883eff88c8c98cb6d4aa06b0b95a4eb9'],
  ['app/public/assets/goal-visualizations/mathematik/fcb4cef1-b17a-5682-924c-41498fc6c9b2/fcb4cef1-b17a-5682-924c-41498fc6c9b2.png', '2fced6226ce06bde28b37b391daeb0710dd1272ba6e25dd3aff28dbbfc45e67e'],
  ['app/public/assets/goal-visualizations/mathematik/fde351a8-98b1-5d75-b4df-813beb2bbe3c/fde351a8-98b1-5d75-b4df-813beb2bbe3c.png', 'a831dbbe7a5cc3b92da30376bf22cf63c6cbd02f18be8e51cea20510e2febd44'],
])
for (const [path, expected] of pins) {
  const actual = createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')
  if (actual !== expected) throw new Error(`${path}: expected ${expected}, received ${actual}`)
}

const config = JSON.parse(readFileSync(resolve(packageRoot, 'positive-evidence.config.json'), 'utf8'))
const sourceRecords = readFileSync(resolve(root, sourceReview), 'utf8').trim().split('\n').map(JSON.parse)
if (sourceRecords.length !== 2 || sourceRecords.some((record, index) => record.goalId !== config.scope.goalIds[index])) {
  throw new Error('Pinned source records do not match the configured Q4 two-goal scope')
}

const goals = sourceRecords.map((record) => {
  const profile = structuredClone(record.profile)
  if (record.goalId === 'fcb4cef1-b17a-5682-924c-41498fc6c9b2') {
    profile.applicationCaseBriefs[0] = {
      id: 'sum-of-two-even-integers',
      taskDemandDe: 'Formuliere mit eindeutigem Geltungsbereich und klaren Hilfsvariablen die Aussage, dass die Summe zweier gerader ganzer Zahlen wieder gerade ist. Begründe sie allgemein und benenne ausdrücklich die Voraussetzungen, die den Schluss tragen.',
      taskDemandEn: 'With a clear domain and explicit auxiliary variables, state that the sum of two even integers is even. Justify it generally and name the assumptions that support the conclusion.',
      expectedPerformanceDe: 'Für alle geraden a,b∈ℤ gibt es k,l∈ℤ mit a=2k und b=2l. Daher ist a+b=2(k+l); weil k+l∈ℤ, ist a+b gerade. Die Aussage ist eine Implikation unter den genannten Ganzzahligkeits- und Gerade-Voraussetzungen, keine Behauptung über beliebige reelle Zahlen.',
      expectedPerformanceEn: 'For all even a,b∈ℤ there are k,l∈ℤ with a=2k and b=2l. Thus a+b=2(k+l); because k+l∈ℤ, the sum a+b is even. This is an implication under the stated integer and evenness assumptions, not a claim about arbitrary real numbers.',
      understandingFocusDe: 'Zwei selbst eingeführte ganzzahlige Hilfsvariablen, Geltungsbereich und logische Schlussrichtung strukturiert und konsistent formulieren; die Lösung steht nicht im aktuellen Bild.',
      understandingFocusEn: 'State two self-introduced integer auxiliaries, the domain and logical direction in a structured, consistent way; the solution is not shown in the current image.',
    }
    return {
      goalId: record.goalId,
      reason: 'DE: Das aktuelle PNG zeigt den Beweis „gerade n ⇒ n² gerade“ mit k∈ℤ korrekt (SHA 2fced622…). Er wird ausdrücklich nicht als P-Prüfungsantwort wiederverwendet: Der erste neue Fall verlangt die eigenständige Formulierung und allgemeine Begründung der Summe zweier gerader ganzer Zahlen mit zwei Hilfsvariablen; der zweite, unveränderte Fall verlangt die logisch andersartige Nullstellen-Äquivalenz für x²−1. Beide Fälle prüfen Bedingung, Schlussrichtung und Notation am aktuellen Ziel, ohne eine bloße Bildabschrift als Verständnis zu zählen. EN: The current PNG correctly shows the even-square proof with integer k, but that displayed proof is not reused as an evidence answer. A new case requires a general statement and proof for the sum of two even integers using two auxiliaries; the retained second case requires the distinct zero-set equivalence for x²−1. Together they assess premise, logical direction and notation without accepting image copying as understanding.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile,
    }
  }
  if (record.goalId === 'fde351a8-98b1-5d75-b4df-813beb2bbe3c') {
    profile.applicationCaseBriefs[0] = {
      id: 'production-cost',
      taskDemandDe: 'Eine Werkstatt zahlt pro Tag 18 € Fixkosten und 3 € Materialkosten pro hergestelltem Teil. Formuliere K(x), gib den zulässigen Bereich an, deute beide Terme und berechne K(10) mit Einheit.',
      taskDemandEn: 'A workshop pays €18 fixed cost per day and €3 material cost per manufactured item. Formulate K(x), state the admissible domain, interpret both terms and calculate K(10) with its unit.',
      expectedPerformanceDe: 'Für ganze x≥0 gilt K(x)=(18+3x) €; 18 € ist der tägliche Fixkostenanteil und 3 €/Teil mal x Teile sind die variablen Materialkosten. K(10)=48 €. Der Koeffizient 3 beschreibt Kosten, keinen Verkaufspreis oder Erlös.',
      expectedPerformanceEn: 'For integer x≥0, K(x)=(18+3x) €; €18 is the daily fixed cost and €3 per item times x items is the variable material cost. K(10)=€48. The coefficient 3 describes cost, not a selling price or revenue.',
      understandingFocusDe: 'Fixe und variable Kosten aus einem neuen Kontext mit anderen Zahlen zu einer Funktion zusammensetzen und sachlich deuten, ohne die Kiosk-Zahlen aus dem PNG zu übernehmen.',
      understandingFocusEn: 'Build and interpret a cost function from a new context with different numbers, without copying the kiosk numbers from the PNG.',
    }
    return {
      goalId: record.goalId,
      reason: 'DE: Das aktuelle PNG zeigt ein fachlich korrigiertes Kiosk-Kostenmodell K(x)=15+2x mit 2 € Materialkosten je Saft (SHA a831dbbe…). Der Werkstatt-Fall verwendet unabhängig 18 € Fixkosten und 3 € Stückkosten; K(10)=48 € muss mit Einheiten selbst hergeleitet werden. Der zweite Fall überträgt die Modellierung auf x+y≤40 als Kapazitätsungleichung und erklärt, warum Gleichheit nicht erzwungen ist. Der gesondert dokumentierte HE-Q4.2-Quellen-/D-Dissent ist damit nicht entschieden; dieses Profil beansprucht nur die aktuelle kanonische Zielkompetenz. EN: The corrected PNG depicts a kiosk cost model K(x)=15+2x with €2 material cost per juice. The workshop case independently uses €18 fixed and €3 unit costs and requires K(10)=€48 with units; the second case transfers to the capacity inequality x+y≤40 and explains why equality is not required. The separate HE-Q4.2 source/description dissent remains unresolved; this profile addresses only the current canonical goal.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: ['Separate D/source issue remains open: whether the current canonical goal breadth is directly supported by the HE-Q4.2 source has not been resolved. This P-v2 profile does not approve source coverage or a canonical description.'],
      profile,
    }
  }
  throw new Error(`Unexpected Q4 goal ${record.goalId}`)
})

const candidates = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-24T00:54:00Z',
  reviewer: 'OpenAI Codex Q4 current-P content review; AI candidate only (exact runtime model identifier unavailable)',
  goals,
}
const path = resolve(packageRoot, 'positive-evidence.candidates.json')
const bytes = `${JSON.stringify(candidates, null, 2)}\n`
const mode = process.argv[2]
if (mode === '--write') {
  writeFileSync(path, bytes)
  console.log(`Wrote ${path}`)
} else if (mode === '--check') {
  if (readFileSync(path, 'utf8') !== bytes) throw new Error('Current candidate file does not match pinned source and reviewed Q4 changes')
  console.log(`Verified ${path}`)
} else {
  throw new Error('Use --write or --check')
}
