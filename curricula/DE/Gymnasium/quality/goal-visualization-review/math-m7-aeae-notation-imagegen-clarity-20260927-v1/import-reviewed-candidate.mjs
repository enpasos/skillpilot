import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../')
const here = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-aeae-notation-imagegen-clarity-20260927-v1'
const goalId = 'aeae526e-b3a4-5a17-b177-351df0307cb9'
const oldImageSha = 'fd230b4a6ec4071bf78335622e3699a0c73502c8ed3635d84d349f015ca6f287'
const oldPromptSha = 'fd77b6f9b79f277256ffdad17bc82f2dbf65bf79f20636111b92f9939a844b2d'
const firstCandidateSha = 'ca8b6ce933e055466b01e7de4949e3587f7ef7b1d1d74802776642d3a9d40c56'
const finalCandidateSha = 'a04ca7f4853c4fff837d381c7c7851376285dae9a1d4a2291fc2347c89887281'
const generatedDir = '/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054'
const canonicalDir = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}`
const publicDir = `app/public/assets/goal-visualizations/mathematik/${goalId}`
const backendDir = `backend/src/main/resources/static/assets/goal-visualizations/mathematik/${goalId}`
const oldPaths = [`${canonicalDir}/${goalId}.jpg`, `${publicDir}/${goalId}.jpg`, `${backendDir}/${goalId}.jpg`]
const newPaths = [`${canonicalDir}/${goalId}.png`, `${publicDir}/${goalId}.png`, `${backendDir}/${goalId}.png`]
const oldPromptPath = `${canonicalDir}/prompt.de.md`
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const readPinned = async (path, expected) => {
  const bytes = await readFile(path.startsWith('/') ? path : at(path))
  if (sha(bytes) !== expected) throw new Error(`Pinned bytes changed: ${path}`)
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

const oldCopies = await Promise.all(oldPaths.map((path) => readPinned(path, oldImageSha)))
if (oldCopies.some((bytes) => !bytes.equals(oldCopies[0]))) throw new Error('Old JPEG copies differ')
const oldPrompt = await readPinned(oldPromptPath, oldPromptSha)
const firstCandidate = await readPinned(`${generatedDir}/exec-80b6f08c-4a0f-4b82-8edb-52b7beed312f.png`, firstCandidateSha)
const finalCandidate = await readPinned(`${generatedDir}/exec-48a5c3a6-a14a-4783-a711-ad86cc0480ce.png`, finalCandidateSha)
const landscape = JSON.parse(await readFile(at('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8'))
const goal = landscape.goals.find((row) => row.id === goalId)
const oldLinks = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const oldQa = qa.records.find((row) => row.goalId === goalId)
if (oldLinks.length !== 1 || oldLinks[0].url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg` ||
    oldLinks[0].provider !== 'Google Gemini / Nano Banana Pro' ||
    oldQa?.assetSha256 !== `sha256:${oldImageSha}` || oldQa?.aiApprovedAssetSha256 !== `sha256:${oldImageSha}` ||
    oldQa?.humanApproved !== 'no') {
  throw new Error('Old goal link or old AI-only V-QA record differs')
}

await put(`${here}/prior/${goalId}.jpg`, oldCopies[0])
await put(`${here}/prior/prompt.de.md`, oldPrompt)
await put(`${here}/prior/resource-link.json`, Buffer.from(`${JSON.stringify(oldLinks[0], null, 2)}\n`))
await put(`${here}/prior/qa-record.json`, Buffer.from(`${JSON.stringify(oldQa, null, 2)}\n`))
await put(`${here}/intermediate-unquoted-f.png`, firstCandidate)
await put(`${here}/final-candidate-no-arrows.png`, finalCandidate)
for (const path of newPaths) await put(path, finalCandidate)

const receipt = {
  schemaVersion: 1,
  goalId,
  purpose: 'Two-stage OpenAI imagegen clarity edit of previously AI-KEEP old JPEG; no claim that old notation was mathematically false',
  oldImage: { paths: oldPaths, archivePath: `${here}/prior/${goalId}.jpg`, sha256: `sha256:${oldImageSha}` },
  oldPrompt: { path: oldPromptPath, archivePath: `${here}/prior/prompt.de.md`, sha256: `sha256:${oldPromptSha}` },
  oldResourceLinkArchive: `${here}/prior/resource-link.json`,
  oldQaRecordArchive: `${here}/prior/qa-record.json`,
  imagegenEdits: [
    { stage: 1, source: oldPaths[0], output: `${here}/intermediate-unquoted-f.png`, sha256: `sha256:${firstCandidateSha}`, change: 'Replace quoted f in the left speech bubble with unquoted f; original quotation mark was not a proven derivative prime.' },
    { stage: 2, source: `${here}/intermediate-unquoted-f.png`, output: `${here}/final-candidate-no-arrows.png`, sha256: `sha256:${finalCandidateSha}`, change: 'Remove two thin black dashed connector arrows without replacement; retain f(3)=7, callouts and x/f(x) table.' },
  ],
  activePngPaths: newPaths,
  activePngSha256: `sha256:${finalCandidateSha}`,
  historicalJpegDisposition: 'The old JPEG is archived byte-for-byte. A separate retirement script moves all three former unlinked production copies into the versioned prior/ archive to satisfy the asset orphan check.',
  visualReviewAuthority: 'Independent AI only; no human approval; see review note and exact-hash QA ledger update.',
}
await put(`${here}/import-receipt.json`, Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`))
