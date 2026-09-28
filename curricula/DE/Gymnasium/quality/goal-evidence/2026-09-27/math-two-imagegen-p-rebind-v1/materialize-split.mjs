import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-imagegen-p-rebind-v1'
const source = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-seven-final-image-bound-v1'
const sourcePaths = {
  config: `${source}/positive-evidence.config.json`,
  candidates: `${source}/positive-evidence.candidates.json`,
  review: `${source}/positive-evidence.review.jsonl`,
}
const sourceHashes = {
  config: '4409cf1b99e511f1413d9b74ced31eb72b7f0ac0adffcae1983ab59d55c09b4f',
  candidates: '3184d38cfa60215abd39159e0c5d4698872f2d1a1b1e743cfeebf892bbd1a1bd',
  review: '8b70b8191fc9499228e6b92ec1728931a338d571e08448301ad0ef4a6e0cff5b',
}
const imageHashes = {
  '4f64f771-20ba-581a-86ba-bcdb1759e4d2': 'baacfac873a3fe74f598ca759c70008b8f7705313c10771f79db4c8ad56da2dc',
  'a7fb1a7a-8315-5bcb-842e-48293293dfcc': 'e6986d073f66e53a843e9cab29ffc2620c11beb100d2bd2b06360b97a1ec580c',
}
const movedIds = Object.keys(imageHashes)
const movedSet = new Set(movedIds)
const reviewId = 'canonical-math-p-v2-m7-two-imagegen-bound-20260927-v1'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const readPinned = async (key) => {
  const bytes = await readFile(at(sourcePaths[key]))
  if (sha(bytes) !== sourceHashes[key]) throw new Error(`Pinned source changed: ${sourcePaths[key]}`)
  return bytes
}
const put = async (path, bytes) => {
  const absolute = at(path)
  await mkdir(dirname(absolute), { recursive: true })
  try {
    await writeFile(absolute, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST' || !(await readFile(absolute)).equals(bytes)) throw error
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const config = JSON.parse(await readPinned('config'))
const oldCandidates = JSON.parse(await readPinned('candidates'))
const reviewBytes = await readPinned('review')
if (!reviewBytes.toString('utf8').endsWith('\n')) throw new Error('Source review lacks trailing newline')
const sourceLines = reviewBytes.toString('utf8').trimEnd().split('\n')
const records = sourceLines.map((line) => JSON.parse(line))
if (records.length !== 7 || records.some((row, index) => row.goalId !== config.scope.goalIds[index]) ||
    oldCandidates.reviewId !== config.reviewId ||
    oldCandidates.goals.length !== 7 ||
    oldCandidates.goals.some((row, index) => row.goalId !== records[index].goalId ||
      JSON.stringify(row.profile) !== JSON.stringify(records[index].profile))) {
  throw new Error('Pinned seven-goal P source config, candidates, and review differ')
}
const byId = new Map(records.map((row) => [row.goalId, row]))
for (const id of movedIds) {
  const row = byId.get(id)
  if (!row || row.status !== 'needs_human_review' || row.reviewAuthority !== 'ai_candidate' ||
      row.evidenceLevel !== 'E1' || row.maximumClaimScope !== 'G1' ||
      row.reviewRunIds.length !== 0 || row.dissent.length !== 0) {
    throw new Error(`${id}: source P authority or claim changed`)
  }
}

const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const imageBindings = {}
for (const id of movedIds) {
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const links = goals.get(id)?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const paths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  const actualHashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
  const qaRow = qa.records.find((row) => row.goalId === id)
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      links[0].reviewStatus !== 'pilot' || !links[0].altText ||
      !links[0].provider.startsWith('OpenAI imagegen') ||
      actualHashes.some((hash) => hash !== imageHashes[id]) ||
      qaRow?.imageUrl !== url || qaRow?.assetSha256 !== `sha256:${imageHashes[id]}` ||
      qaRow?.aiApproved !== 'yes' || qaRow?.aiApprovedAssetSha256 !== `sha256:${imageHashes[id]}` ||
      qaRow?.humanApproved !== 'no') {
    throw new Error(`${id}: imported image, canonical link, or AI-only V-QA binding differs`)
  }
  imageBindings[id] = { url, paths, sha256: `sha256:${imageHashes[id]}`, altText: links[0].altText }
}

const retained = sourceLines.map((line) => ({ line, row: JSON.parse(line) }))
  .filter(({ row }) => !movedSet.has(row.goalId))
if (retained.length !== 5) throw new Error('Expected exactly five untouched source records')
const retainedReviewPath = `${here}/retained-five.review.jsonl`
const retainedConfigPath = `${here}/retained-five.config.json`
await put(retainedConfigPath, jsonBytes({
  ...config,
  reviewPath: retainedReviewPath,
  scope: {
    label: 'Five unaffected P-v2 AI candidates retained as exact JSONL lines after two imagegen replacements',
    goalIds: retained.map(({ row }) => row.goalId),
  },
}))
await put(retainedReviewPath, Buffer.from(`${retained.map(({ line }) => line).join('\n')}\n`))

const reviewPath = `${here}/positive-evidence.review.jsonl`
const configPath = `${here}/positive-evidence.config.json`
const candidatesPath = `${here}/positive-evidence.candidates.json`
await put(configPath, jsonBytes({
  ...config,
  reviewId,
  reviewPath,
  reviewRunManifestPaths: [],
  reviewedResourceTypes: ['goal-visualization'],
  requireApproved: false,
  scope: {
    label: 'Two exact imagegen PNG-bound Mathematik P-v2 AI candidates with independent transfer tasks',
    goalIds: movedIds,
  },
}))

const reasons = {
  [movedIds[0]]: 'DE: Das aktuelle imagegen-PNG zeigt z=1+i bei (1,1), r=√2 und φ=45°=π/4 sowie z(t)=2e^(−iπt/2) zu t=0,1,2,3 im Uhrzeigersinn. Die neue Illustration ändert den mathematischen Gehalt des zuvor geprüften Beispiels nicht. Das beibehaltene Profil prüft stattdessen unabhängig z=−3+3√3i im zweiten Quadranten und den Nullfall ohne Argument sowie z(t)=3e^(iπt/3) mit positivem Drehsinn, anderen Zwischenwinkeln und T=6 s. Diese Antworten stehen nicht im Bild; bloßes Wiederholen seiner Punkte ist keine Lernendenevidenz. Exakte Bildbytes und aktueller Alttext sind gebunden; AI-Kandidat ohne Humanfreigabe. EN: The current imagegen PNG shows z=1+i at (1,1), r=√2 and φ=45°=π/4, plus clockwise z(t)=2e^(−iπt/2) at t=0,1,2,3. Its illustrated mathematics is unchanged. The retained profile independently assesses z=−3+3√3i in quadrant II and zero with no argument, then counterclockwise z(t)=3e^(iπt/3) with different intermediate angles and a six-second period. The picture supplies none of these answers; repeating its points is not learner evidence. Exact image bytes and current alt text are bound; AI candidate without human approval.',
  [movedIds[1]]: 'DE: Das aktuelle imagegen-PNG zeigt auf gleich skalierten Re-/Im-Achsen für z=u=1+i die korrekten Endpunkte 2+2i, 0, 2i und 1, Verschiebungen, Drehungen um ±45° und den Faktor √2; u≠0 ist sichtbar. Der mathematische Bildinhalt ändert das zuvor geprüfte Profil nicht. Dessen erster Fall verwendet w=2−i statt u=1+i und verlangt neue algebraische Ergebnisse und geometrische Wege; der zweite Fall deutet Multiplikation und Division durch i für u=−2+i als inverse Vierteldrehungen und begründet die Nichtteilbarkeit durch null. Keine dieser Antworten lässt sich aus dem Bild kopieren. Exakte Bildbytes und aktueller Alttext sind gebunden; AI-Kandidat ohne Humanfreigabe. EN: On equally scaled Re/Im axes, the current imagegen PNG correctly shows the four endpoints 2+2i, 0, 2i and 1 for z=u=1+i, translations, ±45° rotations, the √2 factor and u≠0. Its mathematical content does not change the previously reviewed profile. The first case uses w=2−i and demands new results and geometric paths; the second interprets multiplication and division by i for u=−2+i as inverse quarter-turns and explains why division by zero is undefined. None of these answers can be copied from the picture. Exact image bytes and current alt text are bound; AI candidate without human approval.',
}
await put(candidatesPath, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T16:24:43.000Z',
  reviewer: 'Codex Mathematik imagegen P-v2 visual-content reinspection; AI candidate only',
  goals: movedIds.map((goalId) => ({
    goalId,
    reason: reasons[goalId],
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile: structuredClone(byId.get(goalId).profile),
  })),
}))

await put(`${here}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'Split seven image-bound Mathematics P-v2 AI candidates into five exact retained records and two re-inspected imagegen-bound records; central registry untouched',
  sourceFiles: Object.keys(sourcePaths).map((key) => ({ path: sourcePaths[key], sha256: `sha256:${sourceHashes[key]}` })),
  movedGoalIds: movedIds,
  retainedGoalIds: retained.map(({ row }) => row.goalId),
  retainedRawLineSha256ByGoalId: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  sourceProfileFingerprintByGoalId: Object.fromEntries(movedIds.map((id) => [id, byId.get(id).profileFingerprint])),
  profileDisposition: Object.fromEntries(movedIds.map((id) => [id, 'Retained after direct visual comparison: new imagegen art presents the same mathematical example, while both profile cases remain independent.'])),
  imageBindings,
  reviewedVisualContent: {
    [movedIds[0]]: 'Fixed z=1+i at (1,1), r=√2, φ=π/4; clockwise 2e^(−iπt/2) at 0/1/2/3 s; polar expression states r≥0 and argument only for z≠0.',
    [movedIds[1]]: 'For z=u=1+i, add (2,2), subtract (0,0), multiply (0,2), divide (1,0); equal Re/Im scale, ±45° and √2 factors, divisor u≠0.',
  },
  outputConfigPath: configPath,
  outputCandidatesPath: candidatesPath,
  outputReviewPath: reviewPath,
  retainedConfigPath,
  retainedReviewPath,
  authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
}))
