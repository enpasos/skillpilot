import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
} from './reportDeepUnderstandingRollout'

// Two newly image-bound D resolutions replace registrations for these goals.
// Earlier resolution files and their index snapshots remain untouched.
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const specs = [
  {
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/calibration-v2/2026-08-25',
    source: 'resolution-index.retained-before-m7-current-bundle39-20260920-v1.json',
    output: 'resolution-index.retained-before-two-local-png-20260923-v1.json',
    sourceDigest: 'sha256:f5350c8e5c2e4b8bc6cc8972a007226273a878f22881047169e4370fbcd638d1',
    excludedGoalId: '570d5931-f126-5bb4-8b7f-db236d6b727f',
    retainedCount: 16,
  },
  {
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-030-atlas-context-recheck-18-v1',
    source: 'resolution-index.retained-before-m7-current-bundle39-20260920-v1.json',
    output: 'resolution-index.retained-before-two-local-png-20260923-v1.json',
    sourceDigest: 'sha256:310033c35ab51c5899f7341856e0949b3a05da9c3d3d37eb2abefe1ba99af693',
    excludedGoalId: 'dcda6fdf-108f-5ea1-bce7-6f30d6443517',
    retainedCount: 15,
  },
] as const

const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const fail = (message: string): never => { throw new Error(message) }

const main = async () => {
  const mode = process.argv[2]
  if (mode !== '--write' && mode !== '--check') {
    fail('Usage: tsx scripts/materializeMathM7TwoLocalPngDRetainedIndexes.ts --write|--check')
  }
  for (const spec of specs) {
    const sourcePath = `${spec.directory}/${spec.source}`
    const targetPath = `${spec.directory}/${spec.output}`
    const sourceBytes = await readFile(resolve(repositoryRoot, sourcePath))
    if (digest(sourceBytes) !== spec.sourceDigest) fail(`Historical index changed: ${sourcePath}`)
    const source = JSON.parse(sourceBytes.toString('utf8')) as AggregateResolutionIndex
    if (source.subject !== 'Mathematik' || source.semanticKind !== 'curricularAtomic') {
      fail(`Unexpected source index identity: ${sourcePath}`)
    }
    const sourceIds = source.resolutions.map((entry) => entry.goalId)
    const excluded = source.resolutions.filter((entry) => entry.goalId === spec.excludedGoalId)
    if (new Set(sourceIds).size !== sourceIds.length || excluded.length !== 1) {
      fail(`Expected one exact old resolution for ${spec.excludedGoalId}`)
    }
    const retained = source.resolutions.filter((entry) => entry.goalId !== spec.excludedGoalId)
    if (retained.length !== spec.retainedCount || retained.some((entry) => !entry.strictDescriptionComplete)) {
      fail(`Unexpected retained strict count in ${sourcePath}`)
    }
    const affectedGroup = excluded[0]?.groupId
    const groups = source.groups.map((group) => ({
      ...group,
      resolvedGoalCount: group.resolvedGoalCount - Number(group.groupId === affectedGroup),
    }))
    if (
      groups.filter((group) => group.groupId === affectedGroup).length !== 1
      || groups.some((group) => group.resolvedGoalCount < 0)
      || groups.reduce((sum, group) => sum + group.resolvedGoalCount, 0) !== spec.retainedCount
    ) fail(`Historical groups do not partition the retained entries in ${sourcePath}`)
    const result: AggregateResolutionIndex = {
      ...source,
      artifactSetId: `${source.artifactSetId}-retained-before-two-local-png-20260923-v1`,
      strictDescriptionReviewCompleteCount: spec.retainedCount,
      descriptionReviewPercentage: Number((
        (spec.retainedCount / source.curriculumAtomicDenominator) * 100
      ).toFixed(1)),
      groups,
      resolutions: retained,
    }
    const errors = validateLegacyResolutionIndexSnapshot(result)
    if (errors.length) fail(`${targetPath}: ${errors.join('; ')}`)
    const expected = jsonBytes(result)
    let current: Buffer | null = null
    try { current = await readFile(resolve(repositoryRoot, targetPath)) } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    if (current && !current.equals(expected)) fail(`Retained index differs from pinned source: ${targetPath}`)
    if (!current && mode === '--check') fail(`Missing retained index: ${targetPath}`)
    if (!current && mode === '--write') {
      await writeFile(resolve(repositoryRoot, targetPath), expected, { flag: 'wx' })
    }
    console.log(`${targetPath}: retained ${spec.retainedCount}/${source.resolutions.length}`)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
