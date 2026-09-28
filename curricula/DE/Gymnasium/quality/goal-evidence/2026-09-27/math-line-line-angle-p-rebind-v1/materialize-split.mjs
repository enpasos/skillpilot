import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-line-line-angle-p-rebind-v1'
const source = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-consensus-revised-image-bound-v1'
const sourcePaths = {
  config: `${source}/retained-seven.config.json`,
  review: `${source}/retained-seven.review.jsonl`,
}
const sourceHashes = {
  config: '23a4012239b918704cc8465bf27f03545bc3b06d9c03098289e0027cca85301b',
  review: '693072b6cabd2565bd446f1fbcafba5ccb43017017c5cfbc9d23c8b47acce3cf',
}
const goalId = '18be713b-7d90-4f01-b60a-5582ac4df0e8'
const imageSha = '984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2'
const reviewId = 'canonical-math-p-v2-m7-line-line-angle-bound-20260927-v1'
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
const reviewBytes = await readPinned('review')
if (!reviewBytes.toString('utf8').endsWith('\n')) throw new Error('Source review lacks trailing newline')
const sourceLines = reviewBytes.toString('utf8').trimEnd().split('\n')
const records = sourceLines.map((line) => JSON.parse(line))
if (records.length !== 7 || records.some((row, index) => row.goalId !== config.scope.goalIds[index])) {
  throw new Error('Pinned seven-goal config and review differ')
}
const old = records.find((row) => row.goalId === goalId)
if (!old || old.profile.applicationCaseBriefs[1]?.id !== 'line-plane' ||
    old.status !== 'needs_human_review' || old.reviewAuthority !== 'ai_candidate' ||
    old.evidenceLevel !== 'E1' || old.maximumClaimScope !== 'G1' ||
    old.reviewRunIds.length !== 0 || old.dissent.length !== 0) {
  throw new Error('Old 18be scope or AI authority differs')
}

const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goal = landscape.goals.find((row) => row.id === goalId)
const url = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`
const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
const paths = [
  `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`,
  `app/public${url}`,
  `backend/src/main/resources/static${url}`,
]
const imageHashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const qaRow = qa.records.find((row) => row.goalId === goalId)
if (goal?.title !== 'Schnittwinkel zweier Geraden berechnen' ||
    !goal.description.includes('zweier sich schneidender Geraden') ||
    goal.description.includes('Ebene') ||
    links.length !== 1 || links[0].url !== url ||
    links[0].license !== 'CC-BY-4.0' || links[0].reviewStatus !== 'pilot' ||
    !links[0].altText.includes('u=(1,0)') || !links[0].altText.includes('v=(1,1)') ||
    imageHashes.some((hash) => hash !== imageSha) ||
    qaRow?.imageUrl !== url || qaRow?.assetSha256 !== `sha256:${imageSha}` ||
    qaRow?.aiApproved !== 'yes' || qaRow?.aiApprovedAssetSha256 !== `sha256:${imageSha}` ||
    qaRow?.humanApproved !== 'no') {
  throw new Error('Current line-line goal, image, or AI-only V-QA binding differs')
}

const retained = sourceLines.map((line) => ({ line, row: JSON.parse(line) }))
  .filter(({ row }) => row.goalId !== goalId)
if (retained.length !== 6) throw new Error('Expected six untouched source records')
const retainedReviewPath = `${here}/retained-six.review.jsonl`
const retainedConfigPath = `${here}/retained-six.config.json`
await put(retainedConfigPath, jsonBytes({
  ...config,
  reviewPath: retainedReviewPath,
  scope: {
    label: 'Six unaffected historical P-v2 AI candidates retained as exact JSONL lines after line-line angle scope repair',
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
    label: 'One current line-line angle-only Mathematik P-v2 AI candidate with independent direction-reversal transfer',
    goalIds: [goalId],
  },
}))

const profile = {
  archetype: 'procedure',
  expectations: [{
    id: 'nonobtuse-line-line-angle',
    essentialUnderstandingDe: 'Der nichtstumpfe Schnittwinkel zweier sich schneidender Geraden hängt von den geometrischen Geraden ab, nicht von der Wahl ihrer von null verschiedenen Richtungsvektoren. Daher gilt cos α=|a·b|/(|a||b|) mit 0°≤α≤90°; eine Richtungsumkehr ändert den Schnittwinkel nicht.',
    essentialUnderstandingEn: 'The non-obtuse angle between two intersecting lines depends on the geometric lines, not on the choice of their nonzero direction vectors. Thus cos α=|a·b|/(|a||b|) with 0°≤α≤90°; reversing a direction does not change the line angle.',
    observablePerformanceDe: 'Die lernende Person stellt eine tatsächliche Schnittlage fest, berechnet aus zwei von null verschiedenen Richtungsvektoren den nichtstumpfen Winkel und begründet anhand der Geraden, weshalb Vorzeichenwechsel eines Richtungsvektors den Winkel nicht ändern.',
    observablePerformanceEn: 'The learner establishes an actual intersection, computes the non-obtuse angle from two nonzero direction vectors and explains geometrically why reversing one vector does not change it.',
  }],
  coverageExpectations: {
    requiredExpectationIds: ['nonobtuse-line-line-angle'],
    alternativeExpectationGroups: [],
    minimumIndependentDemonstrations: 2,
    freshVariationRequired: true,
    independentTransferRequired: true,
  },
  variationAxes: [{
    id: 'intersection-versus-orientation-transfer',
    textDe: 'Erster Fall: räumliche Geraden mit zunächst unbekanntem Schnittpunkt und positivem Skalarprodukt. Zweiter, eigenständiger Fall: andere Geraden mit negativem Skalarprodukt und Vergleich der beiden Orientierungen desselben Richtungsvektors.',
    textEn: 'First case: spatial lines with an initially unknown intersection and positive dot product. Independent second case: different lines with a negative dot product and comparison of both orientations of the same direction vector.',
  }],
  applicationCaseBriefs: [{
    id: 'nonorigin-intersection',
    taskDemandDe: 'Gegeben sind g: x=(1,0,2)+s(1,1,0) und h: x=(1,1,1)+t(1,0,1). Zeige, dass sie sich schneiden, bestimme den Schnittpunkt und berechne den nichtstumpfen Schnittwinkel.',
    taskDemandEn: 'Given g: x=(1,0,2)+s(1,1,0) and h: x=(1,1,1)+t(1,0,1), show that they intersect, find the intersection point and compute their non-obtuse angle.',
    expectedPerformanceDe: 'Aus den Koordinaten folgt s=t=1 und P=(2,1,2). Für a=(1,1,0) und b=(1,0,1) sind a·b=1 sowie |a|=|b|=√2. Damit cos α=|1|/2=1/2 und α=60°. Das Ergebnis ist der kleinere geometrische Winkel der sich in P schneidenden Geraden.',
    expectedPerformanceEn: 'The coordinate equations give s=t=1 and P=(2,1,2). For a=(1,1,0) and b=(1,0,1), a·b=1 and |a|=|b|=√2. Hence cos α=|1|/2=1/2 and α=60°. This is the smaller geometric angle of the lines meeting at P.',
    understandingFocusDe: 'Schnittlage, Richtungsvektoren und nichtstumpfen Winkel in einer neuen räumlichen Konfiguration zusammenführen.',
    understandingFocusEn: 'Connect intersection, direction vectors and the non-obtuse angle in a new spatial configuration.',
  }, {
    id: 'direction-reversal-invariant',
    taskDemandDe: 'Die Geraden g: x=(2,−1,1)+s(2,1,0) und h: x=(2,−1,1)+t(−1,−1,0) schneiden sich. Berechne ihren nichtstumpfen Winkel. Ersetze danach den Richtungsvektor von h durch (1,1,0): Begründe, warum dieselbe Gerade und derselbe Schnittwinkel entstehen, obwohl sich das Skalarprodukt-Vorzeichen ändert.',
    taskDemandEn: 'The lines g: x=(2,−1,1)+s(2,1,0) and h: x=(2,−1,1)+t(−1,−1,0) intersect. Compute their non-obtuse angle. Then replace h’s direction vector by (1,1,0): explain why this gives the same line and angle although the dot-product sign changes.',
    expectedPerformanceDe: 'Die gemeinsame Stützstelle P=(2,−1,1) ist ein Schnittpunkt; die Richtungen sind nicht kollinear. Mit a=(2,1,0), b=(−1,−1,0) ist a·b=−3, |a||b|=√10 und cos α=|−3|/√10=3/√10, also α≈18,4°. Der reine Vektorwinkel wäre ≈161,6° und ist nicht der nichtstumpfe Geradenschnittwinkel. Für −b=(1,1,0) ist a·(−b)=3; h bleibt dieselbe Gerade, daher α unverändert.',
    expectedPerformanceEn: 'The shared base point P=(2,−1,1) is an intersection and the directions are not collinear. With a=(2,1,0), b=(−1,−1,0), a·b=−3 and |a||b|=√10, so cos α=|−3|/√10=3/√10 and α≈18.4°. The oriented vector angle would be ≈161.6°, not the non-obtuse line angle. For −b=(1,1,0), a·(−b)=3; h remains the same line, hence α is unchanged.',
    understandingFocusDe: 'Der Betrag beseitigt die willkürliche Orientierung des Richtungsvektors; der nichtstumpfe Geradenwinkel ist invariant unter b↦−b.',
    understandingFocusEn: 'The absolute value removes arbitrary vector orientation; the non-obtuse line angle is invariant under b↦−b.',
  }],
}

await put(candidatesPath, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T16:43:00.000Z',
  reviewer: 'Codex current line-line angle-only P-v2 content review; AI candidate only',
  goals: [{
    goalId,
    reason: 'DE: Das aktuelle Bild sha256:984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2 zeigt zwei sich im Ursprung unter 45° schneidende Geraden mit u=(1,0), v=(1,1), positivem Skalarprodukt und korrekter Formel für diesen Bildfall. Es zeigt keinen Gerade-Ebene-Fall und keine Richtungsumkehr. Das frühere P-Profil überschritt das nun explizit auf Gerade–Gerade begrenzte Ziel mit einem Gerade-Ebene-Transfer und wird deshalb fachlich ersetzt. Die neuen Fälle verlangen einen eigenständigen räumlichen Schnittpunkt mit 60° und eine andere Konfiguration, bei der der negative Skalarproduktwert nur mit Betrag den nichtstumpfen Winkel 18,4° liefert und eine Richtungsumkehr als dieselbe Gerade erkannt wird. Beide Antworten sind nicht aus dem Bild ablesbar; AI-E1/G1-Kandidat ohne Humanfreigabe. EN: The exact current image shows two lines crossing at the origin at 45° with u=(1,0), v=(1,1), a positive dot product and a correct formula for that pictured case. It depicts neither a line-plane pair nor direction reversal. The old profile exceeded the now explicit line-line scope through a line-plane transfer, so it is substantively replaced. The new independent cases require finding a spatial intersection with a 60° angle, and handling a different configuration where only the absolute dot product gives the non-obtuse 18.4° angle and reversed direction represents the same line. Neither answer is in the image; AI E1/G1 candidate without human approval.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile,
  }],
}))

await put(`${here}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'Replace stale seven-goal Mathematics P block with six exact retained records and one newly content-reviewed current line-line angle-only record; central registry untouched',
  sourceFiles: Object.keys(sourcePaths).map((key) => ({ path: sourcePaths[key], sha256: `sha256:${sourceHashes[key]}` })),
  movedGoalId: goalId,
  retainedGoalIds: retained.map(({ row }) => row.goalId),
  retainedRawLineSha256ByGoalId: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  oldProfileFingerprint: old.profileFingerprint,
  oldProfileIssue: 'Line-plane case lies outside current two-intersecting-lines goal and is not retained.',
  currentGoal: { title: goal.title, description: goal.description, descriptionEn: goal.descriptionEn },
  reviewedVisualContent: 'Directly inspected current PNG: g horizontal through origin, h rising through origin; u=(1,0), v=(1,1), marked acute 45°, positive-dot cosine 1/√2. Formula as depicted is correct for its positive-dot case but does not by itself teach reversal invariance.',
  imageBinding: { url, paths, sha256: `sha256:${imageSha}`, altText: links[0].altText, qaAuthority: 'AI yes; human no' },
  outputConfigPath: configPath,
  outputCandidatesPath: candidatesPath,
  outputReviewPath: reviewPath,
  retainedConfigPath,
  retainedReviewPath,
  authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
}))
