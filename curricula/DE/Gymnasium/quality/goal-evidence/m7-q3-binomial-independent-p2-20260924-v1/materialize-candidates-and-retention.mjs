import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1'
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1/retained-q3-seven'
const sourcePaths = { config: `${sourceBase}.config.json`, review: `${sourceBase}.review.jsonl` }
const sourceSha = {
  config: 'bd63ddf6a094a07024af7dd5e3ac2cda84f718ada9ed01a31a6c3de691030b54',
  review: 'b6a809f8fdc02b12cbe3d8a8b453f44e05c3e2e7a2febf0a71664a2a064c91db',
}
const movedIds = ['9b6f4d7d-a804-5666-b7ea-85bb3c73da4a', 'aa00edfa-cf8d-500e-994f-7e33a5ebd045']
const sourceProfiles = {
  [movedIds[0]]: 'sha256:2e6929e0f7bc08aa194c20bd3d6cd2acd6296326d964a18b3dc51661399d94bd',
  [movedIds[1]]: 'sha256:9961d77a830231f77aca9b5db961ad66e9f0e44c6c6702e659388435526d5609',
}
const candidateImageSha = {
  [movedIds[0]]: 'df91aa81ca527fb0f07d035b9050f25589ab9d171072ca5cc4410d8c256aa9f2',
  [movedIds[1]]: '58cd2f73b87e66856188dc09c03562dbd8cb6186174e3745014e6162f6dfb837',
}
const reviewId = 'canonical-math-p-v2-m7-q3-binomial-independent-two-20260924-v1'
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinnedRead = async (path, digest) => {
  const bytes = await readFile(at(path))
  if (sha256(bytes) !== digest) throw new Error(`Pinned input changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const target = at(path)
  await mkdir(dirname(target), { recursive: true })
  try { await writeFile(target, bytes, { flag: 'wx' }) } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (!(await readFile(target)).equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha256(bytes)}`)
}

const sourceConfig = JSON.parse(await pinnedRead(sourcePaths.config, sourceSha.config))
const sourceLines = (await pinnedRead(sourcePaths.review, sourceSha.review)).toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
if (sourceLines.length !== 7 || sourceConfig.scope.goalIds.length !== 7) throw new Error('Expected seven pinned Q3 records')
if (!sourceRecords.every((record, index) => record.goalId === sourceConfig.scope.goalIds[index] && record.reviewId === sourceConfig.reviewId)) {
  throw new Error('Q3 source record order/identity changed')
}
for (const goalId of movedIds) {
  const record = sourceRecords.find((entry) => entry.goalId === goalId)
  if (!record || record.profileFingerprint !== sourceProfiles[goalId]) throw new Error(`${goalId}: source profile changed`)
}
if (!sourceRecords.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.reviewRunIds.length === 0)) {
  throw new Error('Q3 source unexpectedly claims approval')
}

const retainedIds = sourceConfig.scope.goalIds.filter((id) => !movedIds.includes(id))
const retainedLines = sourceLines.filter((_, index) => !movedIds.includes(sourceRecords[index].goalId))
if (retainedIds.length !== 5 || retainedLines.length !== 5) throw new Error('Expected five unaffected records')
const retainedConfigPath = `${packagePath}/retained-q3-five.config.json`
const retainedReviewPath = `${packagePath}/retained-q3-five.review.jsonl`
await put(retainedConfigPath, jsonBytes({
  ...sourceConfig,
  reviewPath: retainedReviewPath,
  scope: { label: 'Five unaffected Q3 AI-candidate P-v2 records, raw lines retained from pinned active seven-record owner', goalIds: retainedIds },
}))
await put(retainedReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`))

const proofOld = sourceRecords.find((record) => record.goalId === movedIds[0]).profile
const calculateOld = sourceRecords.find((record) => record.goalId === movedIds[1]).profile
const proof = {
  ...proofOld,
  variationAxes: [
    { id: 'success-failure-positions', textDe: 'Genau ein Treffer gegenüber genau einer Niete; Positionen explizit aufzählen oder mit dem Binomialkoeffizienten zählen', textEn: 'Exactly one success versus exactly one failure; list placements explicitly or count them with the binomial coefficient' },
    { id: 'success-probability', textDe: 'Ungleiche Trefferwahrscheinlichkeiten 0,3 und 0,8 mit unterschiedlichen Potenzen für Treffer und Nieten', textEn: 'Unequal success probabilities 0.3 and 0.8 with different powers for successes and failures' },
  ],
  applicationCaseBriefs: [
    {
      id: 'one-success-four-unequal-trials',
      taskDemandDe: 'Vier unabhängige Versuche haben jeweils Trefferwahrscheinlichkeit 0,3. Begründe die Faktoren und berechne P(genau ein Treffer), indem du zuerst alle Trefferpositionen ermittelst.',
      taskDemandEn: 'Four independent trials each have success probability 0.3. Justify the factors and calculate P(exactly one success), first identifying all success positions.',
      expectedPerformanceDe: 'Die vier disjunkten Muster TNNN, NTNN, NNTN und NNNT haben je 0,3·0,7³=0,1029. Der Positionsfaktor ist (4 über 1)=4; folglich P(X=1)=4·0,1029=0,4116. Die Potenzen zählen einen Treffer und drei Nieten.',
      expectedPerformanceEn: 'The four disjoint patterns SFFF, FSFF, FFSF and FFFS each have probability 0.3·0.7³=0.1029. The placement factor is 4 choose 1 =4, hence P(X=1)=4·0.1029=0.4116. The powers count one success and three failures.',
      understandingFocusDe: 'Eine feste Folge, unabhängige Produktwahrscheinlichkeit und Zahl disjunkter Positionen werden getrennt begründet; das Bild mit zwei Köpfen und 1/16 liefert keine dieser Antworten.',
      understandingFocusEn: 'A fixed sequence, independent product probability, and count of disjoint placements are justified separately; the two-head image with 1/16 supplies none of these answers.',
    },
    proofOld.applicationCaseBriefs[1],
  ],
}
const calculate = {
  ...calculateOld,
  expectations: [
    {
      ...calculateOld.expectations[0],
      essentialUnderstandingDe: 'P(X=k) bezeichnet ein einzelnes Ergebnis, P(a≤X≤b) eine Summe disjunkter Punktwahrscheinlichkeiten und P(X≤b) bzw. P(X≥a) eine kumulierte Randwahrscheinlichkeit.',
      essentialUnderstandingEn: 'P(X=k) denotes a point event, P(a≤X≤b) a sum of disjoint point probabilities, and P(X≤b) or P(X≥a) a cumulative tail probability.',
    },
    calculateOld.expectations[1],
  ],
  variationAxes: [
    { id: 'event-shape-and-bound', textDe: 'Punkt X=0, inneres Intervall 2≤X≤4 und oberer Rand X≥2 gegenüber seltenem oberem Rand X≥4', textEn: 'point X=0, interior interval 2≤X≤4, and upper tail X≥2 versus rare upper tail X≥4' },
    { id: 'context-and-parameter', textDe: 'Fünf unabhängige Spielversuche mit Trefferwahrscheinlichkeit 0,4 gegenüber fünf unabhängigen Teilen mit Defektwahrscheinlichkeit 0,2', textEn: 'Five independent game trials with success probability 0.4 versus five independent items with defect probability 0.2' },
  ],
  applicationCaseBriefs: [
    {
      id: 'game-five-point-interval-upper-tail',
      taskDemandDe: 'In fünf unabhängigen Spielrunden beträgt die Trefferchance je 0,4. Für die Trefferzahl X bestimme P(X=0), P(2≤X≤4) und P(X≥2); erkläre, welches zusätzliche Ergebnis den Unterschied der letzten beiden Ereignisse ausmacht, und deute die Zahlen für solche Fünfergruppen.',
      taskDemandEn: 'In five independent game rounds, the chance of a success is 0.4 each time. For success count X, find P(X=0), P(2≤X≤4), and P(X≥2); explain which extra outcome accounts for the difference between the latter two events, and interpret the results for such groups of five.',
      expectedPerformanceDe: 'Für X~Bin(5;0,4) gilt P(X=0)=0,6⁵=0,07776, P(2≤X≤4)=0,3456+0,2304+0,0768=0,6528 und P(X≥2)=1−0,07776−0,2592=0,66304. Die Differenz 0,01024 ist P(X=5). Diese Werte beschreiben Anteile von Fünfergruppen mit keinem, zwei bis vier bzw. mindestens zwei Treffern, nicht Trefferzahlen.',
      expectedPerformanceEn: 'For X~Bin(5,0.4), P(X=0)=0.6⁵=0.07776, P(2≤X≤4)=0.3456+0.2304+0.0768=0.6528, and P(X≥2)=1−0.07776−0.2592=0.66304. Their difference 0.01024 is P(X=5). These are proportions of five-round groups with zero, two through four, or at least two successes, not numbers of successes.',
      understandingFocusDe: 'Ereignisgrenzen, Komplement und die fehlende Randklasse X=5 im Kontext sauber unterscheiden; weder die vier fairen Münzwürfe noch ihre drei Bildwerte liefern die Lösung.',
      understandingFocusEn: 'Distinguish event bounds, complement, and the omitted tail class X=5 in context; neither the four fair coin tosses nor their three image values supplies the solution.',
    },
    calculateOld.applicationCaseBriefs[1],
  ],
}

const configPath = `${packagePath}/positive-evidence.config.json`
const candidatesPath = `${packagePath}/positive-evidence.candidates.json`
await put(configPath, jsonBytes({
  ...sourceConfig,
  reviewId,
  reviewPath: `${packagePath}/positive-evidence.review.jsonl`,
  reviewedResourceTypes: [],
  scope: { label: 'Two independent Q3 Binomial P-v2 AI candidates; image candidates remain unbound, including 9b6 visual HOLD', goalIds: movedIds },
}))
await put(candidatesPath, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T22:58:55.000Z',
  reviewer: 'Codex AI candidate author /root/by_ten_d_round_b (exact model identifier unavailable)',
  goals: [
    {
      goalId: movedIds[0], evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
      reason: 'DE: Das Ziel verlangt eine kombinatorische und probabilistische Begründung der Binomialformel. Die bisherigen vier fairen Würfe mit genau zwei Köpfen sind identisch mit dem vorgeschlagenen Bild und deshalb kein unabhängiger Leistungsnachweis. Der neue Fall mit einem Treffer in vier unabhängigen Versuchen und p=0,3 fordert Einzelmuster, Produktregel und disjunkte Positionszahl neu; der zweite Fall mit p=0,8 und vier Treffern in fünf Versuchen prüft Transfer. Der Bildkandidat df91aa81… bleibt HOLD: seine sichtbare 1/16-Aussage nennt faire unabhängige Würfe nicht. Keine Bildbindung oder menschliche Freigabe. EN: The goal asks for a combinatorial and probabilistic justification of the binomial formula. The previous four fair tosses with exactly two heads duplicate the proposed image and cannot serve as independent evidence. The new one-success case with four independent trials and p=0.3 independently requires one-pattern probability and placement counting; a second case with p=0.8 and four successes in five trials checks transfer. The df91aa81… image is on HOLD because its visible 1/16 claim omits fair independent tosses. No image binding or human approval.',
      profile: proof,
    },
    {
      goalId: movedIds[1], evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
      reason: 'DE: Der bisherige Vier-Münzwürfe-Fall mit P(X=2)=6/16, P(1≤X≤2)=10/16 und P(X≤2)=11/16 steht vollständig im vorgeschlagenen Bild und ist daher kein frischer Nachweis. Der neue Fall verlangt bei fünf unabhängigen Runden mit p=0,4 Punkt-, Intervall- und oberes Randereignis, eine Komplementrechnung, die fehlende Klasse X=5 sowie Kontextdeutung; der zweite Defekt-Fall prüft einen seltenen anderen oberen Rand. Bild 58cd2f73… ist lediglich fachlich akzeptierter ungebundener Kandidat; dieses P-Profil prüft und bindet ihn nicht. Keine menschliche Freigabe. EN: The previous four-toss case, including all three probabilities, is fully shown in the proposed image and is not fresh evidence. The new five-round case with p=0.4 requires a point, interval, and upper-tail event, a complement calculation, the omitted class X=5, and contextual interpretation; the second defect case checks a different rare upper tail. Image 58cd2f73… is only an acceptable unbound candidate; this P profile does not review or bind it. No human approval.',
      profile: calculate,
    },
  ],
}))
await put(`${packagePath}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'SHA-pinned Q3 P-v2 split: five unaffected raw records retained and two independent text-only candidate profiles prepared; no image binding or central integration',
  sourceFiles: Object.entries(sourcePaths).map(([kind, path]) => ({ path, sha256: `sha256:${sourceSha[kind]}` })),
  movedGoalIds: movedIds,
  retainedGoalIds: retainedIds,
  retainedRawLineSha256ByGoalId: Object.fromEntries(retainedLines.map((line) => { const record = JSON.parse(line); return [record.goalId, `sha256:${sha256(Buffer.from(`${line}\n`))}`] })),
  sourceProfileFingerprints: sourceProfiles,
  unboundCandidateImageSha256ByGoalId: Object.fromEntries(Object.entries(candidateImageSha).map(([id, digest]) => [id, `sha256:${digest}`])),
  visualDisposition: { [movedIds[0]]: 'HOLD', [movedIds[1]]: 'ACCEPT_UNBOUND_CANDIDATE' },
  outputPaths: [retainedConfigPath, retainedReviewPath, configPath, candidatesPath],
}))
