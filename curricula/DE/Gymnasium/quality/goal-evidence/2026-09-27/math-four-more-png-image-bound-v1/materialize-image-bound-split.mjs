import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-more-png-image-bound-v1'
const sourceConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-p20-thirteen.config.json'
const sourceReviewPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-p20-thirteen.review.jsonl'
const sourceHashes = {
  [sourceConfigPath]: '46e57286851b830d616e39e25e7968a5479c2743b8c2e20381651965608ae340',
  [sourceReviewPath]: '3f748291866d69857d07b5416979381dff1c5e9a661da34317957d0cf62e2273',
}
const imageHashes = {
  '21fa0c22-976e-59b3-a871-899f0c0177f3': '345954480f78d53665c8effba6d22e8019ae4aebc745960f01f111e86cc4c976',
  '4aa70ad4-171d-5671-a864-c0c7758fa0ed': '34387caf628357b0d265b94dcd0c0d2359d15265b7219532f9a918ecb8b92251',
  '9023226b-fc17-412b-807c-2bb45cd551d5': '4827bc3171dde6090f174fcda4d3a6691296b5e1ee2820b7928dac491113f060',
  'b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2': '45772c3862767cfd98131dbcfd8c11fe343b0b7fe95358000d4d1e354c1620b9',
}
const movedIds = Object.keys(imageHashes)
const reviewId = 'canonical-math-p-v2-m7-four-more-png-image-bound-20260927-v1'
const reviewedAt = '2026-09-27T13:01:13.000Z'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const bytesOf = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readPinned = async (path) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== sourceHashes[path]) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const absolute = at(path)
  await mkdir(dirname(absolute), { recursive: true })
  try {
    await writeFile(absolute, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (!(await readFile(absolute)).equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const config = JSON.parse(await readPinned(sourceConfigPath))
const reviewBytes = await readPinned(sourceReviewPath)
if (!reviewBytes.toString('utf8').endsWith('\n')) throw new Error('Source JSONL must end with LF')
const sourceLines = reviewBytes.toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
if (sourceRecords.length !== config.scope.goalIds.length ||
    !sourceRecords.every((record, index) => record.goalId === config.scope.goalIds[index])) {
  throw new Error('Pinned P config/review order mismatch')
}
const byId = new Map(sourceRecords.map((record) => [record.goalId, record]))
if (movedIds.some((id) => !byId.has(id))) throw new Error('A moved goal is absent from the pinned P review')
for (const id of movedIds) {
  const record = byId.get(id)
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' ||
      record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' ||
      record.reviewRunIds.length !== 0 || record.dissent.length !== 0) {
    throw new Error(`${id}: source P authority or claim changed`)
  }
}

const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const imageBindings = {}
for (const id of movedIds) {
  const goal = goalById.get(id)
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const paths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  const actualHashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
  const qaRow = qa.records.find((row) => row.goalId === id)
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      links[0].reviewStatus !== 'pilot' || actualHashes.some((hash) => hash !== imageHashes[id]) ||
      qaRow?.assetSha256 !== `sha256:${imageHashes[id]}` ||
      qaRow?.aiApproved !== 'yes' || qaRow?.aiApprovedAssetSha256 !== `sha256:${imageHashes[id]}` ||
      qaRow?.humanApproved !== 'no') {
    throw new Error(`${id}: exact imported bitmap, link, or AI-only V-QA binding is not current`)
  }
  imageBindings[id] = { url, paths, sha256: `sha256:${imageHashes[id]}` }
}

const retainedPairs = sourceLines
  .map((line) => ({ line, record: JSON.parse(line) }))
  .filter(({ record }) => !imageHashes[record.goalId])
if (retainedPairs.length !== sourceLines.length - movedIds.length) {
  throw new Error('Retained P count mismatch')
}
const retainedConfigPath = `${packagePath}/retained-p20-nine.config.json`
const retainedReviewPath = `${packagePath}/retained-p20-nine.review.jsonl`
await put(retainedConfigPath, bytesOf({
  ...config,
  reviewPath: retainedReviewPath,
  scope: {
    label: 'Nine unaffected text-only P-v2 AI-candidate records retained byte-for-byte after the four exact-PNG split',
    goalIds: retainedPairs.map(({ record }) => record.goalId),
  },
}))
await put(retainedReviewPath, Buffer.from(`${retainedPairs.map(({ line }) => line).join('\n')}\n`))

const newConfigPath = `${packagePath}/positive-evidence.config.json`
const newReviewPath = `${packagePath}/positive-evidence.review.jsonl`
const candidatePath = `${packagePath}/positive-evidence.candidates.json`
await put(newConfigPath, bytesOf({
  ...config,
  reviewId,
  reviewPath: newReviewPath,
  reviewRunManifestPaths: [],
  reviewedResourceTypes: ['goal-visualization'],
  requireApproved: false,
  scope: {
    label: 'Four current Mathematics P-v2 AI candidates re-inspected against exact active PNGs; no human approval claimed',
    goalIds: movedIds,
  },
}))

const reasons = {
  [movedIds[0]]: 'DE: Das aktive Bild zeigt 4/10·3/9=2/15 für zweimal Rot ohne Zurücklegen. Der erste frische Fall verlangt stattdessen Rot-dann-Blau zu 3/5·2/4, der zweite ein Komplementereignis bei vier unabhängigen Würfen. Beide Konstruktionen und ihre Erklärungen sind eigenständige Leistungen; Bildwerte und Ereignis werden nicht kopiert. EN: The active image shows 4/10·3/9=2/15 for two reds without replacement. Fresh case one instead requires red-then-blue for 3/5·2/4; case two uses a complement event over four independent throws. Both constructions and explanations remain independent learner work. Exact bitmap bound; AI candidate only, no human approval.',
  [movedIds[1]]: 'DE: Das aktive Bild zeigt ausschließlich die Auswertung von 60 simulierten Würfelwürfen: 10+12+8+11+9+10=60 und h(2)=12/60=20 %. Es zeigt keine Softwarebedienung. Das Profil verlangt eigenständiges Aufsetzen einer 600er-Tabellenkalkulation und Transfer zu 400 Versuchen mit geordneten Münzpaaren samt korrekter Aggregation; das Bild liefert diese Ergebnisse nicht. EN: The active image shows only the analysis of 60 simulated die throws, with correct counts and 12/60=20%; it does not show software operation. The profile independently requires a 600-throw spreadsheet simulation and transfer to 400 trials with ordered coin pairs and correct aggregation. Exact bitmap bound; AI candidate only, no human approval.',
  [movedIds[2]]: 'DE: Das aktive Bild erklärt x²+4x+4=(x+2)² und grenzt die algebraische Nullstelle x=−2 ausdrücklich vom geometrischen Bereich x≥0 ab. Das Profil prüft eine andere Gleichung durch quadratische Ergänzung und ein 40-cm²-Rechteck per Lösungsformel einschließlich Verwerfung von −8 cm. Weder Term noch Lösung sind aus dem Bild übertragbar. EN: The active image correctly distinguishes the algebraic root x=−2 of (x+2)²=0 from the shown geometry domain x≥0. The profile checks a different equation by completing the square and a 40-cm² rectangle by formula, rejecting −8 cm. Its solutions are not copied from the image. Exact bitmap bound; AI candidate only, no human approval.',
  [movedIds[3]]: 'DE: Das aktive Bild zeigt am Würfel eine vertikale Spiegelebene und eine zentrale 90°-Drehachse. Das Profil fordert dagegen drei Mittelebenen und 180°-Achsen eines ungleichkantigen Quaders sowie die vier vertikalen Ebenen einer quadratischen Pyramide ohne horizontale Spiegelebene. Das sind andere Körper und eigenständige Symmetrieargumente. EN: The active image shows a vertical cube mirror plane and central quarter-turn axis. The profile instead assesses three midplanes and half-turn axes of an unequal box, then four vertical planes of a square pyramid with no horizontal mirror plane. These are independent solid-symmetry arguments. Exact bitmap bound; AI candidate only, no human approval.',
}
const candidates = movedIds.map((goalId) => {
  const source = byId.get(goalId)
  const profile = structuredClone(source.profile)
  if (goalId === movedIds[0]) {
    const first = profile.applicationCaseBriefs.find((item) => item.id === 'dependent-product-event')
    if (!first) throw new Error('Pinned probability profile lacks dependent-product-event')
    first.taskDemandDe = 'Finde zu (3/5)·(2/4) einen passenden Zufallsversuch mit dem Ereignis „zuerst Rot, dann Blau“. Erkläre, weshalb der zweite Nenner 4 und der zweite Zähler 2 ist.'
    first.taskDemandEn = 'Give an experiment for (3/5)·(2/4) with the event “red first, then blue”. Explain why the second denominator is 4 and numerator 2.'
    first.expectedPerformanceDe = 'Urne mit 3 roten und 2 blauen Kugeln; zweimal ohne Zurücklegen ziehen; Ereignis Rot–Blau. Nach dem ersten Rot bleiben 4 Kugeln, darunter weiterhin 2 blaue, daher P(RB)=(3/5)(2/4)=3/10.'
    first.expectedPerformanceEn = 'An urn has 3 red and 2 blue balls; draw twice without replacement; event red–blue. After the first red, 4 balls remain, still including 2 blue, so P(RB)=(3/5)(2/4)=3/10.'
    first.understandingFocusDe = 'Die bedingte zweite Teilchance betrifft nun eine andere Farbe; die Bildlösung zweimal Rot ist nicht die Antwort.'
    first.understandingFocusEn = 'The conditional second stage now concerns a different colour; the image solution for two reds is not the answer.'
    profile.variationAxes[0].textDe = 'Vom Rot–Blau-Ereignis mit bedingtem Produkt zu einem Komplementterm für vier unabhängige Würfe wechseln.'
    profile.variationAxes[0].textEn = 'Move from a red–blue event with a conditional product to a complement expression for four independent rolls.'
  }
  return {
    goalId,
    reason: reasons[goalId],
    evidenceLevel: source.evidenceLevel,
    maximumClaimScope: source.maximumClaimScope,
    dissent: source.dissent,
    profile,
  }
})
await put(candidatePath, bytesOf({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt,
  reviewer: 'Codex Mathematics exact-PNG P-v2 reinspection; AI candidate only',
  goals: candidates,
}))
await put(`${packagePath}/provenance.json`, bytesOf({
  schemaVersion: 1,
  purpose: 'SHA-pinned four-image P-v2 successor with exact retained nine and no human-approval claim',
  sourceFiles: Object.entries(sourceHashes).map(([path, hash]) => ({ path, sha256: `sha256:${hash}` })),
  movedGoalIds: movedIds,
  retainedGoalIds: retainedPairs.map(({ record }) => record.goalId),
  retainedRawLineSha256ByGoalId: Object.fromEntries(retainedPairs.map(({ line, record }) => [record.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  sourceProfileFingerprints: Object.fromEntries(movedIds.map((id) => [id, byId.get(id).profileFingerprint])),
  profileDisposition: {
    [movedIds[0]]: 'first assessment case changed from red–red to red–blue to avoid copying the illustration; second complement case retained',
    [movedIds[1]]: 'profile retained after checking software-operation and transfer demands independent of output-only illustration',
    [movedIds[2]]: 'profile retained after checking distinct algebra and rectangle-domain transfer',
    [movedIds[3]]: 'profile retained after checking distinct unequal-box and pyramid symmetries',
  },
  imageBindings,
  authority: 'ai_candidate; needs_human_review; no human approval',
}))
