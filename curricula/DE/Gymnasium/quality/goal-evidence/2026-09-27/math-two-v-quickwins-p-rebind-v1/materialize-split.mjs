import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-v-quickwins-p-rebind-v1'
const sources = [
  {
    id: '8b3ce429-e6bb-5d33-b6aa-6ded41afc74c',
    label: 'logarithm',
    config: 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/5eb2b3fea74a.config.json',
    configSha: 'e460283251e8e693fcf63d09c8b042a16087ee2b88202d5904eff20a7b0a44b2',
    review: 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/5eb2b3fea74a.review.jsonl',
    reviewSha: '89008496c9da397fc78b567749a06f8accb463b5502df5772bbc0d85e9ec3f6b',
    imageSha: '3c7a63b04016e68503a5829be93b785ff5d68cb56e0e044ef89dfa5290da2106',
    expectedCases: ['combined-log-transform', 'choose-log-transform'],
    reason: 'DE: Das neue Bild zeigt ausschließlich die Verschiebung von ln(x) zu ln(x−2) um 2 nach rechts und die entsprechenden Asymptoten. Das Profil fordert unabhängig g(x)=2ln(3(x−1))+4 mit innerer und äußerer Skalierung sowie einen neuen Kandidatenvergleich bei x=−2. Die sechs Bildpunkte liefern diese Antworten nicht. EN: The new image illustrates only a two-unit right shift of ln(x); the independent cases combine inside/outside scaling and a different candidate comparison. Exact current bitmap bound; AI candidate, no human approval.',
  },
  {
    id: 'bd637a72-6609-54f5-bb33-8a9e898bf7a0',
    label: 'heuristic',
    config: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-next-four-png-image-bound-v1/retained-p20-five.config.json',
    configSha: '98940b06468f944afba8f8fd51286a5a00e32c49ceb9257c93ee2cd54dff051a',
    review: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-next-four-png-image-bound-v1/retained-p20-five.review.jsonl',
    reviewSha: 'afd29aaa190be51e5737616065f79ae8f52f08e68bff9bc9c3c7366bc6502c75',
    imageSha: 'dbafb59c8db08324fd077537888e4ada708aaeb3a576a516cf5a0101b03178e5',
    expectedCases: ['symmetry-optimum', 'odd-divisibility'],
    reason: 'DE: Das neue Bild führt an 11→8→4 ein einzelnes Rückwärtsarbeiten mit Vorwärtsprobe vor. Das Profil verlangt unabhängig eine begründete Symmetrie-/Quadratergänzungswahl für ein Rechteck und den Sonderansatz n=2k+1 für Teilbarkeit durch 8. Keine Bildzahl oder Rechnung löst diese Fälle. EN: The new image works a small backwards example; the independent profile assesses symmetry in an area maximum and odd-integer representation in a divisibility proof. Exact current bitmap bound; AI candidate, no human approval.',
  },
]
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinned = async (path, digest) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== digest) throw new Error(`Pinned source changed: ${path}`)
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

const selected = []
const sourceFiles = []
for (const source of sources) {
  const config = JSON.parse(await pinned(source.config, source.configSha))
  const reviewBytes = await pinned(source.review, source.reviewSha)
  sourceFiles.push({ path: source.config, sha256: `sha256:${source.configSha}` }, { path: source.review, sha256: `sha256:${source.reviewSha}` })
  if (!reviewBytes.toString('utf8').endsWith('\n')) throw new Error(`Source JSONL lacks final LF: ${source.review}`)
  const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
  const rows = lines.map((line) => JSON.parse(line))
  if (rows.map((row) => row.goalId).join(',') !== config.scope.goalIds.join(',')) {
    throw new Error(`Source P scope/order mismatch: ${source.review}`)
  }
  const row = rows.find((entry) => entry.goalId === source.id)
  if (!row || row.reviewAuthority !== 'ai_candidate' || row.status !== 'needs_human_review' ||
      row.evidenceLevel !== 'E1' || row.maximumClaimScope !== 'G1' ||
      source.expectedCases.join(',') !== row.profile.applicationCaseBriefs.map((item) => item.id).join(',')) {
    throw new Error(`Source P profile/authority changed: ${source.id}`)
  }
  const graph = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
  const goal = graph.goals.find((entry) => entry.id === source.id)
  const url = `/assets/goal-visualizations/mathematik/${source.id}/${source.id}.png`
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const pngPaths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${source.id}/${source.id}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      links[0].reviewStatus !== 'pilot' ||
      (await Promise.all(pngPaths.map(async (path) => sha(await readFile(at(path)))))).some((digest) => digest !== source.imageSha)) {
    throw new Error(`New exact-PNG binding changed: ${source.id}`)
  }
  const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
  const qaRow = qa.records.find((entry) => entry.goalId === source.id)
  if (qaRow?.assetSha256 !== `sha256:${source.imageSha}` || qaRow?.aiApprovedAssetSha256 !== `sha256:${source.imageSha}` ||
      qaRow?.aiApproved !== 'yes' || qaRow?.humanApproved !== 'no') {
    throw new Error(`New exact-PNG QA binding changed: ${source.id}`)
  }
  const retained = lines.map((line) => ({ line, row: JSON.parse(line) })).filter(({ row: entry }) => entry.goalId !== source.id)
  const retainedPath = `${here}/${source.label}-retained.review.jsonl`
  await put(`${here}/${source.label}-retained.config.json`, json({
    ...config,
    reviewPath: retainedPath,
    scope: { label: `Unaffected ${source.label} source P-v2 AI records retained as exact JSONL lines`, goalIds: retained.map(({ row: entry }) => entry.goalId) },
  }))
  await put(retainedPath, Buffer.from(`${retained.map(({ line }) => line).join('\n')}\n`))
  selected.push({ source, row, config, pngPaths, retainedGoalIds: retained.map(({ row: entry }) => entry.goalId) })
}

const reviewId = 'canonical-math-p-v2-m7-two-current-png-quickwins-20260927-v1'
const combined = selected[0].config
const combinedPath = `${here}/positive-evidence.review.jsonl`
await put(`${here}/positive-evidence.config.json`, json({
  ...combined,
  reviewId,
  reviewPath: combinedPath,
  reviewedResourceTypes: ['goal-visualization'],
  reviewRunManifestPaths: [],
  scope: { label: 'Two independent P-v2 AI candidate profiles re-inspected against their current exact PNGs', goalIds: sources.map((item) => item.id) },
}))
await put(`${here}/positive-evidence.candidates.json`, json({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T13:52:52.000Z',
  reviewer: 'Codex targeted exact-PNG P-v2 comparison; AI candidate only',
  goals: selected.map(({ source, row }) => ({
    goalId: source.id,
    reason: source.reason,
    evidenceLevel: row.evidenceLevel,
    maximumClaimScope: row.maximumClaimScope,
    dissent: row.dissent,
    profile: row.profile,
  })),
}))
await put(`${here}/provenance.json`, json({
  schemaVersion: 1,
  purpose: 'Re-inspect only two P-v2 cases against newly imported exact PNGs; preserve other source records byte-for-byte',
  sourceFiles,
  newBindings: Object.fromEntries(selected.map(({ source, pngPaths }) => [source.id, { pngPaths, sha256: `sha256:${source.imageSha}` }])),
  retainedGoalIds: Object.fromEntries(selected.map(({ source, retainedGoalIds }) => [source.id, retainedGoalIds])),
  profileDisposition: 'Existing independent cases retained after comparing each with its new image; no pictured solution transfers to the tasks',
  authority: 'ai_candidate; needs_human_review; no human approval',
}))
