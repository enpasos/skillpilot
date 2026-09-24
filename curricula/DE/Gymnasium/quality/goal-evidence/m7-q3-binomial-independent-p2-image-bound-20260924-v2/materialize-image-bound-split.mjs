import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const previous = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1'
const next = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-image-bound-20260924-v2'
const sources = {
  retainedConfig: [`${previous}/retained-q3-five.config.json`, '6602d72a3228ca37d20357b240f43f766c03bcdd5a4595cc35715272e5924457'],
  retainedReview: [`${previous}/retained-q3-five.review.jsonl`, '54d6f1e1960163f3d35ac79ae6e0f736926791d895a95eb59bf7f24265accc7d'],
  movedConfig: [`${previous}/positive-evidence.config.json`, 'c0febfdb37b63b1cb3a2dc9f58f939a6abd94b38b8442223e64ec392811a112a'],
  movedCandidates: [`${previous}/positive-evidence.candidates.json`, '4c755caf9302331accc5ef410ec280eaf1ebfa7a84de8b03390bf7171b3275c7'],
  movedReview: [`${previous}/positive-evidence.review.jsonl`, '1f4ceea949b6e774b0bdc58da588f1ba19a36724a10c16516265907441c9eef1'],
  provenance: [`${previous}/provenance.json`, '8fb80b0b74826af757ba037b8caa22de04592af808e15e05224b9ac35e813302'],
}
const goalIds = ['9b6f4d7d-a804-5666-b7ea-85bb3c73da4a', 'aa00edfa-cf8d-500e-994f-7e33a5ebd045']
const images = {
  [goalIds[0]]: 'cfc3330cbdeee3ec592a19662174cb7f4f80af70cb3c857c185baf2a5015ada0',
  [goalIds[1]]: '58cd2f73b87e66856188dc09c03562dbd8cb6186174e3745014e6162f6dfb837',
}
const profiles = {
  [goalIds[0]]: 'sha256:4f4ba39480ca49c4c7615f407a47036f72aa182f8296b37edcc9d48ac8b9409d',
  [goalIds[1]]: 'sha256:da9188fa9c8e6d7e3c75375e75ab103462314ee8ee3797da0643a924fda94b38',
}
const sha = (x) => createHash('sha256').update(x).digest('hex')
const at = (p) => resolve(root, p)
const json = (x) => Buffer.from(`${JSON.stringify(x, null, 2)}\n`)
const pinned = async ([path, digest]) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== digest) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const file = at(path)
  await mkdir(dirname(file), { recursive: true })
  try { await writeFile(file, bytes, { flag: 'wx' }) } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (!(await readFile(file)).equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}
const blobs = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, spec]) => [key, await pinned(spec)])))
const oldRetainedConfig = JSON.parse(blobs.retainedConfig)
const oldMovedConfig = JSON.parse(blobs.movedConfig)
const oldCandidates = JSON.parse(blobs.movedCandidates)
const oldRecords = blobs.movedReview.toString('utf8').trimEnd().split('\n').map(JSON.parse)
const retainedLines = blobs.retainedReview.toString('utf8').trimEnd().split('\n')
const retained = retainedLines.map(JSON.parse)
if (retained.length !== 5 || oldRecords.length !== 2 || oldCandidates.goals.length !== 2 ||
    !retained.every((r, i) => r.goalId === oldRetainedConfig.scope.goalIds[i]) ||
    !oldRecords.every((r, i) => r.goalId === goalIds[i] && r.profileFingerprint === profiles[r.goalId] && oldCandidates.goals[i].goalId === r.goalId) ||
    !retained.concat(oldRecords).every((r) => r.status === 'needs_human_review' && r.reviewAuthority === 'ai_candidate' && r.reviewRunIds.length === 0)) {
  throw new Error('Pinned P-v2 identity, profile, or candidate authority changed')
}
const landscape = JSON.parse(await readFile(at(oldMovedConfig.landscapePath), 'utf8'))
const byId = new Map(landscape.goals.map((goal) => [goal.id, goal]))
if (byId.get(goalIds[0])?.description !== 'Die lernende Person kann an einem passenden Bernoulli-Ketten-Beispiel begründen, warum die Binomialformel für genau k Treffer die Anzahl möglicher Trefferpositionen mit der Wahrscheinlichkeit einer festen Treffer-Niete-Folge multipliziert.' ||
    byId.get(goalIds[0])?.descriptionEn !== 'Using a suitable Bernoulli-chain example, the learner can justify why the binomial formula for exactly k successes multiplies the number of possible success placements by the probability of one fixed success-failure sequence.' ||
    byId.get(goalIds[1])?.description !== 'Die lernende Person kann für eine binomialverteilte Zufallsgröße Punkt-, Intervall- und kumulierte Wahrscheinlichkeiten mit Summenschreibweise oder digitalen Werkzeugen bestimmen und die Ergebnisse im Kontext deuten.' ||
    byId.get(goalIds[1])?.descriptionEn !== 'For a binomial random variable, the learner can determine point, interval, and cumulative probabilities using summation notation or digital tools and interpret the results in context.') {
  throw new Error('Current bilingual Q3 canonical wording differs from reviewed P scope')
}
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const qaRows = Array.isArray(qa) ? qa : Object.values(qa).find((x) => Array.isArray(x) && x.some((r) => r?.goalId === goalIds[0]))
if (!qaRows) throw new Error('Visualization QA rows not found')
const bindings = {}
for (const id of goalIds) {
  const links = byId.get(id)?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const publicPath = `app/public${url}`
  const canonicalPath = `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`
  const publicSha = sha(await readFile(at(publicPath)))
  const canonicalSha = sha(await readFile(at(canonicalPath)))
  const q = qaRows.find((row) => row.goalId === id)
  if (links.length !== 1 || links[0].url !== url || publicSha !== images[id] || canonicalSha !== publicSha ||
      q?.assetSha256 !== `sha256:${publicSha}` || q?.aiApprovedAssetSha256 !== `sha256:${publicSha}` || q?.humanApproved !== 'no') {
    throw new Error(`${id}: active image, canonical, and QA mismatch`)
  }
  bindings[id] = { url, publicPath, canonicalPath, sha256: `sha256:${publicSha}`, reviewAuthority: 'AI only' }
}
const reviewId = 'canonical-math-p-v2-m7-q3-binomial-independent-two-image-bound-20260924-v2'
const retainedConfigPath = `${next}/retained-q3-five.config.json`
const retainedReviewPath = `${next}/retained-q3-five.review.jsonl`
const movedConfigPath = `${next}/positive-evidence.config.json`
const movedCandidatesPath = `${next}/positive-evidence.candidates.json`
await put(retainedConfigPath, json({ ...oldRetainedConfig, reviewPath: retainedReviewPath,
  scope: { label: 'Five unaffected Q3 P-v2 AI-candidate raw records retained byte-for-byte from pinned text-only predecessor', goalIds: oldRetainedConfig.scope.goalIds } }))
await put(retainedReviewPath, blobs.retainedReview)
await put(movedConfigPath, json({ ...oldMovedConfig, reviewId, reviewPath: `${next}/positive-evidence.review.jsonl`,
  reviewedResourceTypes: ['goal-visualization'],
  scope: { label: 'Two current Q3 Binomial P-v2 AI candidates bound to SHA-pinned active PNG teaching images; fresh tasks remain independent', goalIds } }))
const reasons = [
  'DE: Das aktive PNG zeigt ausdrücklich vier faire, unabhängige Würfe, sechs korrekte 2K2Z-Folgen und 1/16 je Folge bzw. 6/16 gesamt. Die frische P-Aufgabe verlangt stattdessen für vier unabhängige Versuche mit p=0,3 genau einen Treffer: vier Positionen, 0,3·0,7³=0,1029 je Muster und 0,4116 insgesamt. Der zweite Fall mit n=5, p=0,8, k=4 prüft eine andere Treffer-/Nietenstruktur. Die Lehrgrafik gibt keine Antwort vor; die exakten aktiven PNG-Bytes sind gebunden, ohne menschliche Freigabe. EN: The active PNG visibly states four fair independent tosses, six correct 2H2T sequences, and 1/16 each or 6/16 in total. The fresh P task instead asks for exactly one success in four independent p=0.3 trials: four positions, 0.3·0.7³=0.1029 per pattern, and 0.4116 overall. The second n=5, p=0.8, k=4 case checks a different success/failure structure. The teaching image supplies no answer; exact active PNG bytes are bound without human approval.',
  'DE: Das aktive PNG markiert bei X~Bin(4,1/2) die Ereignisse {2}, {1,2} und {0,1,2} mit richtigen 6/16, 10/16 und 11/16. Die frische P-Aufgabe verlangt dagegen für fünf unabhängige Runden mit p=0,4 Punkt-, Intervall- und oberen Randwert 0,07776, 0,6528 und 0,66304 sowie die fehlende Klasse X=5 mit 0,01024 und Kontextdeutung. Ein zweiter p=0,2-Defektfall prüft einen seltenen oberen Rand. Bildwerte und Ereignisgrenzen liefern diese Antworten nicht; die exakten aktiven PNG-Bytes sind gebunden, ohne menschliche Freigabe. EN: The active PNG correctly marks {2}, {1,2}, and {0,1,2} for X~Bin(4,1/2) as 6/16, 10/16, and 11/16. The fresh P task instead uses five independent p=0.4 rounds to find the point, interval, and upper-tail values 0.07776, 0.6528, and 0.66304, plus the omitted X=5 class 0.01024 and a contextual interpretation. A second p=0.2 defect case tests a rare upper tail. The image supplies neither the new bounds nor answers; exact active PNG bytes are bound without human approval.',
]
await put(movedCandidatesPath, json({ ...oldCandidates, reviewId, reviewedAt: '2026-09-23T23:20:34.000Z',
  reviewer: 'Codex AI candidate author /root/by_ten_d_round_b (exact model identifier unavailable)',
  goals: oldCandidates.goals.map((candidate, i) => ({ ...candidate, reason: reasons[i] })) }))
await put(`${next}/provenance.json`, json({ schemaVersion: 1,
  purpose: 'SHA-pinned image-bound Q3 P-v2 successor: unchanged independent profiles, five byte-for-byte retained raw records, exact active PNG/QA bindings',
  sourceFiles: Object.values(sources).map(([path, digest]) => ({ path, sha256: `sha256:${digest}` })),
  movedGoalIds: goalIds, retainedGoalIds: oldRetainedConfig.scope.goalIds,
  retainedRawLineSha256ByGoalId: Object.fromEntries(retainedLines.map((line) => [JSON.parse(line).goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  sourceProfileFingerprints: profiles, currentBindings: bindings,
  outputPaths: [retainedConfigPath, retainedReviewPath, movedConfigPath, movedCandidatesPath],
  authority: 'ai_candidate; no human approval' }))
