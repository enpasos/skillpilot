import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Preserve the nine unaffected D resolutions when two normal-distribution
// goals receive new learner-visible images. The old index remains historical.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-upper-sec-next20-double-keep12-partial-20260923-v1'
const sourcePath = `${base}/resolution-index.current-png-retained-eleven-20260923-v1.json`
const sourceSha = '985d01acf1374e7bb0eb77843e88732b263055cf2ced690694a312ced13a4e72'
const targetPath = `${base}/resolution-index.retained-before-three-v-png-20260923-v1.json`
const affectedIds = new Set([
  '8c32d941-b51c-5663-951c-a610f8900f76',
  'a7778885-17aa-5eeb-a6a7-fbf4c8d55a16',
])
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const main = async () => {
  const mode = process.argv[2]
  assert(['--write', '--check'].includes(mode) && process.argv.length === 3, 'Usage: node materialize-math-three-v-d-retained-20260923.mjs --write|--check')
  const sourceBytes = await readFile(resolve(root, sourcePath))
  assert(sha(sourceBytes) === sourceSha, `D source changed: ${sourcePath}`)
  const source = JSON.parse(sourceBytes)
  assert(source.schemaVersion === 1 && source.subject === 'Mathematik' && source.semanticKind === 'curricularAtomic', 'Wrong D source')
  assert(source.groups?.length === 1 && source.resolutions?.length === 11 && source.strictDescriptionReviewCompleteCount === 11, 'D source count changed')
  assert(source.groups[0].resolvedGoalCount === 11 && source.curriculumAtomicDenominator === 797, 'D group/denominator changed')
  const ids = source.resolutions.map((entry) => entry.goalId)
  assert(new Set(ids).size === ids.length && [...affectedIds].every((id) => ids.filter((candidate) => candidate === id).length === 1), 'Affected D IDs not unique')
  for (const entry of source.resolutions) {
    assert(entry.strictDescriptionComplete === true, `Old D decision not complete: ${entry.goalId}`)
    const recordBytes = await readFile(resolve(root, dirname(sourcePath), entry.resolutionPath))
    assert(`sha256:${sha(recordBytes)}` === entry.resolutionDigest, `Old D record drift: ${entry.goalId}`)
  }
  const retained = source.resolutions.filter((entry) => !affectedIds.has(entry.goalId))
  assert(retained.length === 9, 'Wrong retained D count')
  const result = {
    ...source,
    artifactSetId: `${source.artifactSetId}-retained-before-three-v-png-20260923-v1`,
    strictDescriptionReviewCompleteCount: retained.length,
    descriptionReviewPercentage: Number(((retained.length / source.curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{ ...source.groups[0], resolvedGoalCount: retained.length }],
    resolutions: retained,
  }
  const output = json(result)
  let current = null
  try { current = await readFile(resolve(root, targetPath)) } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  assert(current?.equals(output) || (mode === '--write' && current === null), `Retained D artifact missing or altered: ${targetPath}`)
  if (mode === '--write' && current === null) await writeFile(resolve(root, targetPath), output, { flag: 'wx' })
  console.log(`${targetPath}: ${retained.length} unchanged D records; ${affectedIds.size} affected`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
