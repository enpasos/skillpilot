import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')
const sourceFiles = [
  {
    path: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-b042-seven.review.jsonl',
    sha256: '9ff38209f4edaf2bfdf58812f8c668fb1b42e7565cd5e12f5e71f1488952e060',
  },
  {
    path: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-normal-domain-image-bound-p-20260924-v1/current-two.review.jsonl',
    sha256: '912f6afc8d172cffea0169a57833ce7449f314eb28589bc9f2fa0e4adadeba32',
  },
  {
    path: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-038h-current-exponential-scope-7-v1.review.jsonl',
    sha256: '4faeecbe757622ab272d3cceb402624e026cde6986704c3e274ee1400cf53d37',
  },
] as const
const goalIds = [
  '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
  '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
  'b431148b-526c-4bde-b04b-48d23101d0d3',
  '49f9059a-876c-5051-8146-d008b5cc691c',
] as const
const profileFingerprints = [
  'sha256:a9f15a21a152490fe56eab44254d7a4508bec9d56a95e136d2c790eecd27f067',
  'sha256:accf043b1526365eae9ebbc0ec6204a40c5659b0434ef177409bb700d85ce1c7',
  'sha256:286aca061428db9b362ce98459d268112514be26e0a860c1a92dec036fc7c649',
  'sha256:aaa0e6de980b0d91dd2d9f30f352590c796bb31c85fb42cd34cd6b605aba38de',
] as const
const sourceRecords = sourceFiles.flatMap(({ path, sha256: pinned }) => {
  const bytes = readFileSync(resolve(root, path))
  if (sha256(bytes) !== pinned) throw new Error(`Historical P review bytes changed: ${path}`)
  return bytes.toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line))
})
const previous = goalIds.map((goalId, index) => {
  const matching = sourceRecords.filter((record) => record.goalId === goalId)
  if (matching.length !== 1 || matching[0].profileFingerprint !== profileFingerprints[index]) {
    throw new Error(`Expected one pinned P profile for ${goalId}`)
  }
  const record = matching[0]
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') {
    throw new Error(`Historical P candidate status changed: ${goalId}`)
  }
  return record
})

// The old 71fe first case duplicates the current teaching image, including all numbers
// and its answer. Replace that case so the learner must independently validate a new model.
const modelValidationProfile = structuredClone(previous[1].profile)
const modelValidationExpectation = modelValidationProfile.expectations.find((expectation: { id: string }) => (
  expectation.id === 'context-validate-model'
))
if (!modelValidationExpectation || modelValidationProfile.applicationCaseBriefs[0]?.id !== 'visitor-model-validity') {
  throw new Error('Historical 71fe profile shape changed')
}
modelValidationExpectation.observablePerformanceDe = 'Die lernende Person prüft ein Höhenmodell auf zulässige Flugzeiten, ein plausibles Maximum und unmögliche negative Vorhersagen und begründet die zeitliche Begrenzung.'
modelValidationExpectation.observablePerformanceEn = 'The learner checks a height model for admissible flight times, a plausible maximum and impossible negative predictions, and justifies the time limit.'
modelValidationProfile.applicationCaseBriefs[0] = {
  id: 'flight-model-validity',
  taskDemandDe: 'Für den Flug eines Balls bis zum Auftreffen auf den Boden wird die Höhe durch h(t)=20t−5t² in Metern modelliert; t ist die Zeit in Sekunden seit dem Abwurf. Bestimme das Höhenmaximum und den sinnvollen Zeitbereich. Prüfe, ob h(5)=−25 m eine sinnvolle Höhenangabe fünf Sekunden nach dem Start ist.',
  taskDemandEn: 'During a ball flight until it hits the ground, height is modeled by h(t)=20t−5t² metres, where t is seconds since launch. Find the maximum height and the meaningful time interval. Assess whether h(5)=−25 m is a meaningful height five seconds after launch.',
  expectedPerformanceDe: 'h′(t)=20−10t wird bei t=2 null; dort beträgt die Höhe h(2)=20 m. Aus h(t)=5t(4−t) folgen Start t=0 und Auftreffen t=4; für den Flug ist nur 0≤t≤4 sinnvoll. h(5)=−25 m ist rechnerisch richtig, liegt aber nach dem Auftreffen und ist keine physikalische Flughöhe.',
  expectedPerformanceEn: 'h′(t)=20−10t vanishes at t=2; the maximum is h(2)=20 m. From h(t)=5t(4−t), launch is t=0 and landing t=4; only 0≤t≤4 is meaningful for the flight. h(5)=−25 m is arithmetically correct but lies after landing and is not a physical flight height.',
  understandingFocusDe: 'Rechnerisch korrekte Extrapolation von der sachlich zulässigen Dauer eines Flugmodells unterscheiden.',
  understandingFocusEn: 'Distinguish arithmetically correct extrapolation from the contextually valid duration of a flight model.',
}

const reasons = [
  'Der irreführende LK-Zusatz wurde aus dem BY-Pflichtfach-Titel entfernt; Zielkern und Voraussetzungen blieben gleich. Beide bestehenden Aufgaben wurden erneut gerechnet: vorzeichenrichtige Tankänderung 3 L und Endbestand 13 L sowie Ortsänderung 1,5 m gegenüber Weg 2,5 m. Das Lehrbild zeigt einen anderen, rein positiven Tankzufluss von 20 L und liefert diese Antworten nicht. Textgebundener aktueller AI-Kandidat; keine menschliche Freigabe.',
  'Der irreführende LK-Zusatz wurde aus dem BY-Pflichtfach-Titel entfernt; Zielkern und Voraussetzungen blieben gleich. Der alte Besucherfall war bereits vollständig im Lehrbild gelöst und wurde deshalb durch einen unabhängigen Flugbahnfall ersetzt: h(t)=20t−5t² ist nur bis t=4 sinnvoll, erreicht bei t=2 genau 20 m, und h(5)=−25 m ist keine physikalische Flughöhe. Der bestehende Tankkapazitäts-Transfer bleibt richtig. Textgebundener aktueller AI-Kandidat; keine menschliche Freigabe.',
  'Der irreführende LK-Zusatz wurde aus dem BY-Pflichtfach-Titel entfernt; Zielkern und Voraussetzungen blieben gleich. Das bestehende bildgebundene Profil wurde erneut geprüft: Bin(100;0,4) mit np=40 und n(1−p)=60 ist für eine Normalnäherung plausibel, Bin(20;0,001) mit np=0,02 nicht. Diese Parameter und Ergebnisse sind nicht aus dem aktuellen Bild mit Bin(100;0,5) und Bin(100;0,01) ablesbar. Aktueller AI-Kandidat; keine menschliche Freigabe.',
  'Der irreführende LK-Zusatz wurde aus dem BY-Pflichtfach-Titel entfernt; Zielkern und Voraussetzungen blieben gleich. Beide Begründungsfälle wurden erneut geprüft: Mit e^x≥x³/6 folgt x²/e^x≤6/x→0 für x→∞; nach t=−x und e^t≥t⁴/24 gilt |x³e^x|≤24/t→0 mit Annäherung von unten. Das Bild behauptet nur die Dominanz im ersten Fall, führt aber keine dieser Abschätzungen aus. Textgebundener aktueller AI-Kandidat; keine menschliche Freigabe.',
] as const
const goals = previous.map((record, index) => ({
  goalId: goalIds[index],
  reason: reasons[index],
  evidenceLevel: record.evidenceLevel,
  maximumClaimScope: record.maximumClaimScope,
  dissent: record.dissent,
  profile: index === 1 ? modelValidationProfile : record.profile,
}))
const base = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewedAt: '2026-09-28T00:37:10Z',
  reviewer: 'OpenAI Codex current-goal and case review; AI candidate only',
}
const outputs = [
  { name: 'positive-evidence-four.candidates.json', reviewId: 'canonical-math-by-pflichtfach-title-rebind-four-p-20260928-v1', goals },
  { name: 'current-text-three.candidates.json', reviewId: 'canonical-math-by-pflichtfach-title-rebind-text-three-p-20260928-v1', goals: [goals[0], goals[1], goals[3]] },
  { name: 'current-image-one.candidates.json', reviewId: 'canonical-math-by-pflichtfach-title-rebind-image-one-p-20260928-v1', goals: [goals[2]] },
] as const
if (process.argv.length > 3 || (process.argv.length === 3 && process.argv[2] !== '--write')) {
  throw new Error('Usage: tsx materialize-candidates.mts [--write]')
}
for (const output of outputs) {
  const targetPath = `${packagePath}/${output.name}`
  const expectedBytes = `${JSON.stringify({ ...base, reviewId: output.reviewId, goals: output.goals }, null, 2)}\n`
  const target = resolve(root, targetPath)
  if (process.argv[2] === '--write') {
    writeFileSync(target, expectedBytes, { flag: 'wx' })
    console.log(`Wrote ${targetPath}: ${output.goals.length} current candidate(s)`)
  } else {
    if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale candidate set: ${targetPath}`)
    console.log(`Verified ${targetPath}: ${output.goals.length} current candidate(s)`)
  }
}
