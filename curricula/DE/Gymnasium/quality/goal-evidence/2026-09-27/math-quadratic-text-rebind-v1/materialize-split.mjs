import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-quadratic-text-rebind-v1'
const source = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-more-png-image-bound-v1'
const expected = {
  [`${source}/positive-evidence.config.json`]: '44f950239de982a3c5e3e676d556e2945edd5dbe87ff1c269771df7ce21d466d',
  [`${source}/positive-evidence.review.jsonl`]: '98aead2ca1fc73650d3ee815b93f2ab8b50b5a4f85bf17db8e3057fe7b219e9a',
  [`${source}/positive-evidence.candidates.json`]: 'cafb618d4cdb0bc981b1cac974339224846905d622cff92251feb108f1b603b8',
}
const id = '9023226b-fc17-412b-807c-2bb45cd551d5'
const revisedDe = 'Die lernende Person kann quadratische Gleichungen grafisch, durch quadratische Ergänzung oder mit einer Lösungsformel lösen und einfache Sachprobleme auf quadratische Gleichungen zurückführen.'
const revisedEn = 'The learner can solve quadratic equations graphically, by completing the square, or with a quadratic formula, and translate simple word problems into quadratic equations.'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinned = async (path) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== expected[path]) throw new Error(`Pinned input changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const full = at(path)
  await mkdir(dirname(full), { recursive: true })
  try { await writeFile(full, bytes, { flag: 'wx' }) }
  catch (error) {
    if (error?.code !== 'EEXIST' || !(await readFile(full)).equals(bytes)) throw error
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const config = JSON.parse(await pinned(`${source}/positive-evidence.config.json`))
const candidateSet = JSON.parse(await pinned(`${source}/positive-evidence.candidates.json`))
const reviewBytes = await pinned(`${source}/positive-evidence.review.jsonl`)
const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
const rows = lines.map((line) => JSON.parse(line))
if (!reviewBytes.toString('utf8').endsWith('\n') || rows.length !== 4 ||
    config.scope.goalIds.join(',') !== rows.map((row) => row.goalId).join(',') ||
    candidateSet.goals.map((goal) => goal.goalId).join(',') !== config.scope.goalIds.join(',')) {
  throw new Error('Pinned four-goal source scope mismatch')
}
const original = rows.find((row) => row.goalId === id)
const candidate = candidateSet.goals.find((goal) => goal.goalId === id)
if (!original || !candidate || original.goalFingerprint !== 'sha256:1635d8a1f9fee63262af8b3f06ecdc454a3c4a446d9832dd74a5327c01000aaf' ||
    original.status !== 'needs_human_review' || original.reviewAuthority !== 'ai_candidate' ||
    original.evidenceLevel !== 'E1' || original.maximumClaimScope !== 'G1') {
  throw new Error('Original quadratic P authority/fingerprint changed')
}
const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goal = landscape.goals.find((item) => item.id === id)
if (goal?.description !== revisedDe || goal?.descriptionEn !== revisedEn) {
  throw new Error('Expected independently adjudicated quadratic text is not current')
}
if (candidate.profile.applicationCaseBriefs.length !== 2 ||
    !candidate.profile.applicationCaseBriefs.some((item) => item.id === 'algebra-and-graph') ||
    !candidate.profile.applicationCaseBriefs.some((item) => item.id === 'rectangle-model')) {
  throw new Error('Quadratic understanding profile changed')
}
const pngPath = `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`
if (sha(await readFile(at(pngPath))) !== '4827bc3171dde6090f174fcda4d3a6691296b5e1ee2820b7928dac491113f060') {
  throw new Error('Reviewed quadratic PNG changed')
}

const retained = lines.map((line) => ({ line, row: JSON.parse(line) })).filter(({ row }) => row.goalId !== id)
if (retained.length !== 3) throw new Error('Expected three retained cases')
const retainedPath = `${here}/retained-three.review.jsonl`
await put(`${here}/retained-three.config.json`, json({
  ...config,
  reviewPath: retainedPath,
  scope: { label: 'Three unchanged exact-PNG P-v2 AI candidates retained as raw source lines', goalIds: retained.map(({ row }) => row.goalId) },
}))
await put(retainedPath, Buffer.from(`${retained.map(({ line }) => line).join('\n')}\n`))

const reviewId = 'canonical-math-p-v2-m7-quadratic-revised-text-20260927-v1'
const newReviewPath = `${here}/quadratic-positive-evidence.review.jsonl`
await put(`${here}/quadratic-positive-evidence.config.json`, json({
  ...config,
  reviewId,
  reviewPath: newReviewPath,
  scope: { label: 'One quadratic-equations P-v2 profile re-inspected after independently adjudicated canonical wording correction', goalIds: [id] },
}))
await put(`${here}/quadratic-positive-evidence.candidates.json`, json({
  ...candidateSet,
  reviewId,
  reviewedAt: '2026-09-27T13:38:57.000Z',
  reviewer: 'Codex targeted quadratic DE/EN revision and exact-PNG P-v2 reinspection; AI candidate only',
  goals: [{
    ...candidate,
    reason: `${candidate.reason} The revised DE/EN goal now explicitly requires solving and translating simple word problems into equations; the two independent profile cases assess exactly those distinct demands without copying the pictured worked example. Semantic scope and E1/G1 AI-candidate authority are unchanged.`,
  }],
}))
await put(`${here}/provenance.json`, json({
  schemaVersion: 1,
  purpose: 'Preserve three prior P records byte-for-byte and re-inspect only the canonical quadratic text delta against its existing independent profile and exact PNG',
  sourceFiles: Object.entries(expected).map(([path, hash]) => ({ path, sha256: `sha256:${hash}` })),
  revisedGoalId: id,
  oldGoalFingerprint: original.goalFingerprint,
  newCanonicalDescriptions: { de: revisedDe, en: revisedEn },
  retainedGoalIds: retained.map(({ row }) => row.goalId),
  retainedRawLineSha256: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  reviewedPng: { path: pngPath, sha256: 'sha256:4827bc3171dde6090f174fcda4d3a6691296b5e1ee2820b7928dac491113f060' },
  authority: 'ai_candidate; needs_human_review; no human approval',
}))
