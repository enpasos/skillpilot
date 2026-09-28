import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-aeae-notation-imagegen-p-rebind-v1'
const source = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-argumentation-communication-p-20260923-v1'
const sourcePaths = {
  config: `${source}/image-bound-15.config.json`,
  candidates: `${source}/image-bound-15.candidates.json`,
  review: `${source}/image-bound-15.review.jsonl`,
}
const sourceHashes = {
  config: '3509b3bd544422f8634b40a46cecb6a72b850af2056d0b64c572ecd5bc717c00',
  candidates: 'a0dbba17e0cd8c43bbdfb186a5c2fef64f9ddc5f98ddaf85488bf24f4946e6c6',
  review: '7231236a8fc6fc20a86aaa2cac8053b00141c7557fe45a0aa0a8434139a1bf1c',
}
const goalId = 'aeae526e-b3a4-5a17-b177-351df0307cb9'
const oldImageSha = 'fd230b4a6ec4071bf78335622e3699a0c73502c8ed3635d84d349f015ca6f287'
const newImageSha = 'a04ca7f4853c4fff837d381c7c7851376285dae9a1d4a2291fc2347c89887281'
const reviewId = 'canonical-math-m7-aeae-imagegen-notation-p-v2-20260927-v1'
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
if (records.length !== 15 || records.some((row, index) => row.goalId !== config.scope.goalIds[index]) ||
    oldCandidates.reviewId !== config.reviewId || oldCandidates.goals.length !== 15 ||
    oldCandidates.goals.some((row, index) => row.goalId !== records[index].goalId ||
      JSON.stringify(row.profile) !== JSON.stringify(records[index].profile))) {
  throw new Error('Pinned 15-goal P config, candidate set, and review differ')
}
const old = records.find((row) => row.goalId === goalId)
if (!old || old.status !== 'needs_human_review' || old.reviewAuthority !== 'ai_candidate' ||
    old.evidenceLevel !== 'E1' || old.maximumClaimScope !== 'G1' ||
    old.reviewRunIds.length !== 0 || old.dissent.length !== 0 ||
    old.profile.applicationCaseBriefs?.map((row) => row.id).join(',') !== 'function-notation,conditional-notation' ||
    !old.reason.includes('paired quotation marks')) {
  throw new Error('Old aeae P authority, independent cases, or old-image assessment differs')
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
const actualHashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const qaRow = qa.records.find((row) => row.goalId === goalId)
if (goal?.title !== 'Notation adressatengerecht erläutern' ||
    links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
    links[0].reviewStatus !== 'pilot' || !links[0].altText.includes('f(3)=7') ||
    !links[0].provider.startsWith('OpenAI imagegen edit') ||
    actualHashes.some((hash) => hash !== newImageSha) ||
    qaRow?.imageUrl !== url || qaRow?.assetSha256 !== `sha256:${newImageSha}` ||
    qaRow?.aiApproved !== 'yes' || qaRow?.aiApprovedAssetSha256 !== `sha256:${newImageSha}` ||
    qaRow?.humanApproved !== 'no') {
  throw new Error('Current aeae PNG, link, or AI-only V-QA binding differs')
}

const retained = sourceLines.map((line) => ({ line, row: JSON.parse(line) }))
  .filter(({ row }) => row.goalId !== goalId)
if (retained.length !== 14) throw new Error('Expected 14 untouched source records')
const retainedReviewPath = `${here}/retained-fourteen.review.jsonl`
const retainedConfigPath = `${here}/retained-fourteen.config.json`
await put(retainedConfigPath, jsonBytes({
  ...config,
  reviewPath: retainedReviewPath,
  scope: {
    label: 'Fourteen unaffected image-bound Q4 AI P-v2 candidates retained as exact JSONL lines after aeae imagegen clarity edit',
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
    label: 'One freshly image-bound aeae notation AI P-v2 candidate after two-stage imagegen clarity edit',
    goalIds: [goalId],
  },
}))
await put(candidatesPath, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T17:03:24.000Z',
  reviewer: 'Codex independent current-aeae-PNG P-v2 content reinspection; AI candidate only',
  goals: [{
    goalId,
    reason: 'DE: Das aktuelle zweistufig editierte imagegen-PNG (sha256:a04ca7f4853c4fff837d381c7c7851376285dae9a1d4a2291fc2347c89887281) wurde direkt in 1678×937 und bei 360 px geprüft. Es zeigt f(3)=7, benennt f/Funktion, 3/eingesetzter x-Wert und 7/Funktionswert zutreffend, und die Tabelle x|f(x) mit 3|7 stimmt. Die früheren gestrichelten, potenziell missverständlichen Verbinder fehlen; der alte f-Text war typografisch zitiert und kein erwiesener Ableitungsfehler. Der mathematische Bildinhalt ändert die zuvor geprüfte P-Leistung nicht. Der erste eigenständige P-Fall unterscheidet f(2) und f′(2) trotz zufällig gleicher 12 und verlangt eine neue Erklärung; das Bild enthält weder Ableitung noch diese Antwort. Der zweite Fall überträgt adressatengerechte Notation auf P(Rad|Regen) gegen P(Regen|Rad) mit unterschiedlichen Bezugsgruppen; auch diese Antworten stehen nicht im Bild. Das beibehaltene Profil ist damit nicht bloß ein Bildabgleich; AI-E1/G1-Kandidat ohne Humanfreigabe. EN: The current two-stage imagegen PNG was inspected at 1678×937 and 360 px. It correctly shows f(3)=7, f as function, 3 as substituted x-value and 7 as function value, with a consistent x/f(x) table containing 3/7. The potentially misleading dashed connectors have gone; the old f label was typographically quoted, not a proven derivative error. The illustrated mathematics does not change the previously reviewed P demands. The first independent case distinguishes f(2) from f′(2) despite equal values of 12 and requires a new explanation; the image gives neither a derivative nor this answer. The second transfers audience-aware notation to P(Cycle|Rain) versus P(Rain|Cycle) with different reference groups; neither answer appears in the image. The retained profile is not a mere image match; AI E1/G1 candidate without human approval.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile: structuredClone(old.profile),
  }],
}))

await put(`${here}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'Split the active 15-goal P package into 14 exact retained records and one genuinely re-reviewed, current-image-bound aeae record',
  sourceFiles: Object.keys(sourcePaths).map((key) => ({ path: sourcePaths[key], sha256: `sha256:${sourceHashes[key]}` })),
  movedGoalId: goalId,
  retainedGoalIds: retained.map(({ row }) => row.goalId),
  retainedRawLineSha256ByGoalId: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  sourceProfileFingerprint: old.profileFingerprint,
  profileDisposition: 'Retained after actual visual/content comparison: new image removes quotes around f and misleading dashed arrows, while keeping correct f(3)=7 example. Both independent P cases still assess changed notation contexts not answered by the art.',
  imageComparison: { oldJpegSha256: `sha256:${oldImageSha}`, newPngSha256: `sha256:${newImageSha}`, newUrl: url, newPaths: paths, newAltText: links[0].altText },
  visualReviewEvidence: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-m7-aeae-notation-imagegen-clarity-20260927-v1.md',
  outputConfigPath: configPath,
  outputCandidatesPath: candidatesPath,
  outputReviewPath: reviewPath,
  retainedConfigPath,
  retainedReviewPath,
  authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
}))
