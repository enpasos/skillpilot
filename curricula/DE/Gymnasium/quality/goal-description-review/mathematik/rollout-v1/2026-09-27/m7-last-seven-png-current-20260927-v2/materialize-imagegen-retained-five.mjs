import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../')
const here = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-last-seven-png-current-20260927-v2'
const sourcePath = `${here}/resolution-index.json`
const outputPath = `${here}/resolution-index.imagegen-retained-five-20260927-v1.json`
const provenancePath = `${here}/imagegen-retained-five.provenance.json`
const expectedSourceHash = '26fdce06a9ffcc581397376bf7f00165ba6beb261cc01675fa2813aca7a900e0'
const moved = new Set([
  '4f64f771-20ba-581a-86ba-bcdb1759e4d2',
  'a7fb1a7a-8315-5bcb-842e-48293293dfcc',
])
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const put = async (path, bytes) => {
  try {
    await writeFile(at(path), bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST' || !(await readFile(at(path))).equals(bytes)) throw error
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const sourceBytes = await readFile(at(sourcePath))
if (sha(sourceBytes) !== expectedSourceHash) throw new Error('Historical seven-goal D index changed')
const source = JSON.parse(sourceBytes.toString('utf8'))
if (source.schemaVersion !== 2 || source.subject !== 'Mathematik' || source.groups.length !== 1 ||
    source.batchGoalIds.length !== 7 || source.resolutions.length !== 7 ||
    source.resolutions.some((row, index) => row.goalId !== source.batchGoalIds[index]) ||
    [...moved].some((id) => source.batchGoalIds.filter((value) => value === id).length !== 1)) {
  throw new Error('Pinned standalone D index is not the expected seven-goal source')
}
const retained = source.resolutions.filter((entry) => !moved.has(entry.goalId))
if (retained.length !== 5 || retained.some((entry) => !entry.strictDescriptionComplete)) {
  throw new Error('Expected five exact strict retained D resolutions')
}
const summaryBytes = await readFile(at(`${here}/${source.groups[0].dualSummaryPath}`))
if (sha(summaryBytes) !== source.groups[0].dualSummaryDigest.slice('sha256:'.length)) {
  throw new Error('Historical seven-goal dual summary changed')
}
for (const entry of retained) {
  const bytes = await readFile(at(`${here}/${entry.resolutionPath}`))
  if (sha(bytes) !== entry.resolutionDigest.slice('sha256:'.length)) {
    throw new Error(`Retained resolution bytes changed: ${entry.goalId}`)
  }
}

// A v2 standalone index must exactly match all goals in its dual summary.
// The supported legacy partial-index shape retains a subset of that campaign.
const index = {
  schemaVersion: 1,
  artifactSetId: `${source.artifactSetId}-imagegen-retained-five-20260927-v1`,
  subject: 'Mathematik',
  semanticKind: 'curricularAtomic',
  strictDescriptionReviewCompleteCount: 5,
  curriculumAtomicDenominator: 797,
  descriptionReviewPercentage: Number(((5 / 797) * 100).toFixed(1)),
  groups: [{ ...source.groups[0], resolvedGoalCount: 5 }],
  resolutions: retained,
}
await put(outputPath, json(index))
await put(provenancePath, json({
  schemaVersion: 1,
  purpose: 'Retain only five unchanged strict D resolutions from the historical seven-goal campaign after two imagegen page replacements; old index and resolutions remain intact',
  sourceIndexPath: sourcePath,
  sourceIndexSha256: `sha256:${expectedSourceHash}`,
  outputIndexPath: outputPath,
  movedGoalIds: [...moved],
  retainedGoalIds: retained.map(({ goalId }) => goalId),
  originalDualSummarySha256: source.groups[0].dualSummaryDigest,
  retainedResolutionSha256ByGoalId: Object.fromEntries(retained.map(({ goalId, resolutionDigest }) => [goalId, resolutionDigest])),
  authority: 'historical AI synthesis candidates retained; no human approval',
}))
