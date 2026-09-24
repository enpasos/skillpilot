import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Preserve only unchanged strict D resolutions after four new image bindings.
// The source indices and their historical resolution records stay untouched.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const splits = [
  {
    source: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q3-stochastics-next12-seven-keep-partial-20260923-v1/resolution-index.retained-before-four-comic-png-20260923-v1.json',
    sourceSha: '063571c5f0c20f004a3d97a1c3fb89d0dd10940eae0fd860f508f1bf3fc80a87',
    target: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q3-stochastics-next12-seven-keep-partial-20260923-v1/resolution-index.retained-before-next-four-png-20260923-v1.json',
    expectedCount: 6,
    affected: [
      '4d906967-9f4b-5dc8-af7a-d403b95d61f5',
      '5c9ac68c-3928-518c-bbe0-e044667035a6',
    ],
  },
  {
    source: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q4-process-next12-ten-keep-partial-20260923-v1/resolution-index.json',
    sourceSha: 'b013dfe14645d3db1e439058547ee958a3dadd38f50fa75b64e7b3060748313c',
    target: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q4-process-next12-ten-keep-partial-20260923-v1/resolution-index.retained-before-next-four-png-20260923-v1.json',
    expectedCount: 10,
    affected: ['5d9c156b-e5a4-5e91-9da3-22e858eb1f8e'],
  },
]

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const main = async () => {
  const mode = process.argv[2]
  assert(['--write', '--check'].includes(mode) && process.argv.length === 3,
    'Usage: node materialize-math-next-four-d-retained-20260923.mjs --write|--check')
  for (const split of splits) {
    const sourceBytes = await readFile(resolve(root, split.source))
    assert(sha(sourceBytes) === split.sourceSha, `D source changed: ${split.source}`)
    const source = JSON.parse(sourceBytes)
    assert(source.schemaVersion === 1 && source.subject === 'Mathematik'
      && source.semanticKind === 'curricularAtomic', `Wrong D source: ${split.source}`)
    assert(source.groups?.length === 1 && source.resolutions?.length === split.expectedCount
      && source.strictDescriptionReviewCompleteCount === split.expectedCount
      && source.groups[0].resolvedGoalCount === split.expectedCount
      && source.curriculumAtomicDenominator === 797, `D source count changed: ${split.source}`)
    const ids = source.resolutions.map((entry) => entry.goalId)
    const affected = new Set(split.affected)
    assert(new Set(ids).size === ids.length
      && split.affected.every((id) => ids.filter((candidate) => candidate === id).length === 1),
    `Affected D IDs not unique: ${split.source}`)
    for (const entry of source.resolutions) {
      assert(entry.strictDescriptionComplete === true, `Old D decision not complete: ${entry.goalId}`)
      const recordBytes = await readFile(resolve(root, dirname(split.source), entry.resolutionPath))
      assert(`sha256:${sha(recordBytes)}` === entry.resolutionDigest, `Old D record drift: ${entry.goalId}`)
    }
    const retained = source.resolutions.filter((entry) => !affected.has(entry.goalId))
    assert(retained.length === split.expectedCount - affected.size, `Wrong retained D count: ${split.source}`)
    const result = {
      ...source,
      artifactSetId: `${source.artifactSetId}-retained-before-next-four-png-20260923-v1`,
      strictDescriptionReviewCompleteCount: retained.length,
      descriptionReviewPercentage: Number(((retained.length / source.curriculumAtomicDenominator) * 100).toFixed(1)),
      groups: [{ ...source.groups[0], resolvedGoalCount: retained.length }],
      resolutions: retained,
    }
    const output = json(result)
    let current = null
    try { current = await readFile(resolve(root, split.target)) } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
    assert(current?.equals(output) || (mode === '--write' && current === null),
      `Retained D artifact missing or altered: ${split.target}`)
    if (mode === '--write' && current === null) await writeFile(resolve(root, split.target), output, { flag: 'wx' })
    console.log(`${split.target}: ${retained.length} unchanged D records; ${affected.size} affected`)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
