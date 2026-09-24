import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
  type StandaloneBatchResolutionIndex,
} from './reportDeepUnderstandingRollout'

// The new J5 D2 campaign owns these two goals. Preserve every unaffected
// historical resolution entry and its byte-pinned source artifact.
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const specs = [
  {
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-001-final-20-v2',
    source: 'resolution-index.json',
    output: 'resolution-index.retained-before-j5-d2-20260924-v1.json',
    sourceDigest: 'sha256:c4c86ee866d6efb4c46af5d0f03f2a3c8e4d87941d5e7dcec89cb57419534ec2',
    excludedGoalId: '25593605-5e13-55cc-9a05-8f3d737e15e9',
    sourceSchemaVersion: 2,
    sourceCount: 20,
    retainedCount: 19,
    curriculumAtomicDenominator: 797,
  },
  {
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-002-current-v7-sixth-pass-main-20',
    source: 'resolution-index.retained-before-by-j5-j6-ten-image-binding-20260924-v1.json',
    output: 'resolution-index.retained-before-j5-d2-20260924-v1.json',
    sourceDigest: 'sha256:3774452f9e75a0a1e4aee34787d100080c40ee52334517c224c4256beaa0abd5',
    excludedGoalId: 'f2e42af5-67a6-477e-82ea-e65b09cc6cb3',
    sourceSchemaVersion: 1,
    sourceCount: 8,
    retainedCount: 7,
    curriculumAtomicDenominator: 791,
  },
] as const

const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const fail = (message: string): never => { throw new Error(message) }

const main = async () => {
  const mode = process.argv[2]
  if (mode !== '--write' && mode !== '--check') {
    fail('Usage: tsx scripts/materializeMathM7J5D2LegacyRetainedIndexes.ts --write|--check')
  }
  for (const spec of specs) {
    const sourcePath = `${spec.directory}/${spec.source}`
    const targetPath = `${spec.directory}/${spec.output}`
    const sourceBytes = await readFile(resolve(repositoryRoot, sourcePath))
    if (digest(sourceBytes) !== spec.sourceDigest) fail(`Historical source index changed: ${sourcePath}`)
    const source = JSON.parse(sourceBytes.toString('utf8')) as
      | AggregateResolutionIndex
      | StandaloneBatchResolutionIndex
    if (
      source.schemaVersion !== spec.sourceSchemaVersion
      || source.subject !== 'Mathematik'
      || source.semanticKind !== 'curricularAtomic'
      || source.groups.length !== 1
      || source.resolutions.length !== spec.sourceCount
    ) fail(`Unexpected source index identity or scope: ${sourcePath}`)
    const sourceIds = source.resolutions.map((entry) => entry.goalId)
    if (
      new Set(sourceIds).size !== sourceIds.length
      || sourceIds.filter((id) => id === spec.excludedGoalId).length !== 1
    ) fail(`Expected one exact old resolution for ${spec.excludedGoalId}`)
    const retained = source.resolutions.filter((entry) => entry.goalId !== spec.excludedGoalId)
    if (retained.length !== spec.retainedCount || retained.some((entry) => !entry.strictDescriptionComplete)) {
      fail(`Unexpected retained strict count in ${sourcePath}`)
    }
    const group = source.groups[0]
    if (
      group.resolvedGoalCount !== spec.sourceCount
      || retained.some((entry) => entry.groupId !== group.groupId)
    ) fail(`Source group does not exactly cover the resolutions in ${sourcePath}`)
    const denominator = source.schemaVersion === 1
      ? source.curriculumAtomicDenominator
      : spec.curriculumAtomicDenominator
    if (denominator !== spec.curriculumAtomicDenominator) fail(`Source denominator changed: ${sourcePath}`)
    const result: AggregateResolutionIndex = {
      schemaVersion: 1,
      artifactSetId: `${source.artifactSetId}-retained-before-j5-d2-20260924-v1`,
      subject: source.subject,
      semanticKind: source.semanticKind,
      strictDescriptionReviewCompleteCount: spec.retainedCount,
      curriculumAtomicDenominator: denominator,
      descriptionReviewPercentage: Number(((spec.retainedCount / denominator) * 100).toFixed(1)),
      groups: [{ ...group, resolvedGoalCount: spec.retainedCount }],
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
    if (!current && mode === '--write') await writeFile(resolve(repositoryRoot, targetPath), expected, { flag: 'wx' })
    console.log(`${targetPath}: retained ${spec.retainedCount}/${spec.sourceCount}`)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
