// Exact retention of unaffected D records when two Q3 binomial images change.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mode = process.argv[2]
if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  throw new Error('Usage: node materialize-math-q3-binomial-two-d-retained-20260924.mjs --write|--check (repository root)')
}
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q3-stochastics-next12-seven-keep-partial-20260923-v1/resolution-index.retained-before-next-four-png-20260923-v1.json'
const sourceSha = '87d265ac12f6a19eef812c404265d5e989d1e5ac3470ffff701a00acbc81f719'
const excluded = new Set([
  '9b6f4d7d-a804-5666-b7ea-85bb3c73da4a',
  'aa00edfa-cf8d-500e-994f-7e33a5ebd045',
])
const outputPath = sourcePath.replace(/\.json$/, '.retained-before-binomial-two-png-20260924-v1.json')
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const sourceBytes = readFileSync(resolve(sourcePath))
if (sha(sourceBytes) !== sourceSha) throw new Error('Pinned D index changed')
const source = JSON.parse(sourceBytes)
if (source.resolutions.length !== 4 || source.resolutions.filter((record) => excluded.has(record.goalId)).length !== 2) {
  throw new Error('Expected exactly two Q3 records among four active D resolutions')
}
const resolutions = source.resolutions.filter((record) => !excluded.has(record.goalId))
const retained = {
  ...source,
  artifactSetId: `${source.artifactSetId}-retained-before-binomial-two-png-20260924-v1`,
  strictDescriptionReviewCompleteCount: resolutions.length,
  descriptionReviewPercentage: Number((resolutions.length * 100 / source.curriculumAtomicDenominator).toFixed(1)),
  groups: source.groups.map((group) => ({
    ...group,
    resolvedGoalCount: resolutions.filter((record) => record.groupId === group.groupId).length,
  })),
  resolutions,
}
const expected = Buffer.from(`${JSON.stringify(retained, null, 2)}\n`)
if (existsSync(resolve(outputPath))) {
  if (!readFileSync(resolve(outputPath)).equals(expected)) throw new Error('Retained D output differs')
} else if (mode === '--write') {
  writeFileSync(resolve(outputPath), expected, { flag: 'wx' })
} else {
  throw new Error('Retained D output missing')
}
console.log(`D retained ${resolutions.length}/${source.resolutions.length}: ${outputPath}; sha256:${sha(expected)}`)
