import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
} from './reportDeepUnderstandingRollout'

// Four new PNGs changed their GoalBook image bindings. Historical indexes
// remain immutable; only unaffected resolutions are registered alongside the
// new, image-bound seven-goal D campaign.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1'
const specs = [
  {
    directory: `${base}/2026-09-23/m7-unregistered-eight-six-keep-partial-20260923-v1`,
    source: 'resolution-index.json',
    output: 'resolution-index.current-png-retained-five-20260923-v1.json',
    sourceDigest: 'sha256:941d240a13ab6a489643da7380adb1c6a076dfc852159d33c9d19010713c7990',
    excludedGoalId: '25a3cc39-976e-58a5-b882-73baee5c037c',
    retainedCount: 5,
  },
  {
    directory: `${base}/2026-09-23/m7-upper-sec-next20-double-keep12-partial-20260923-v1`,
    source: 'resolution-index.json',
    output: 'resolution-index.current-png-retained-eleven-20260923-v1.json',
    sourceDigest: 'sha256:aea61bd3ff3221688fffcd100890d4440cbc2201dbc00d9e8bef24f2351d3730',
    excludedGoalId: '55d0474b-b82c-59b6-a62a-b6a0a34d9c4b',
    retainedCount: 11,
  },
  {
    directory: `${base}/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1`,
    source: 'resolution-index.current-keep5.retained-before-q3-modeling-three-png-delta-20260923-v2.json',
    output: 'resolution-index.current-png-retained-four-20260923-v1.json',
    sourceDigest: 'sha256:541e805e736a3f9692fc979a61f378ad3f15efeea242d5c8c2990fec41abb192',
    excludedGoalId: 'b7cc2fc4-c695-5a97-93b0-3a619c632ca8',
    retainedCount: 4,
  },
  {
    directory: `${base}/2026-09-07/batch-042-calculus-models-growth-and-integration-20-v1`,
    source: 'resolution-index.route-context-retained-nine-20260923-v1.json',
    output: 'resolution-index.current-png-retained-eight-20260923-v1.json',
    sourceDigest: 'sha256:d9b52dcdb329a36ca446df5b9c760c9d30c542385ebc4a6f132caee839b4b787',
    excludedGoalId: '4ae9e316-509f-517d-bd94-a165817af24f',
    retainedCount: 8,
  },
] as const

const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const outputBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const fail = (message: string): never => { throw new Error(message) }

const main = async () => {
  const mode = process.argv[2]
  if (mode !== '--write' && mode !== '--check') {
    fail('Usage: tsx scripts/materializeMathM7FourPngDRetainedIndexes.ts --write|--check')
  }
  for (const spec of specs) {
    const sourcePath = `${spec.directory}/${spec.source}`
    const targetPath = `${spec.directory}/${spec.output}`
    const sourceBytes = await readFile(resolve(root, sourcePath))
    if (digest(sourceBytes) !== spec.sourceDigest) fail(`Historical source index changed: ${sourcePath}`)
    const source = JSON.parse(sourceBytes.toString('utf8')) as AggregateResolutionIndex
    if (source.subject !== 'Mathematik' || source.groups.length !== 1) fail(`Invalid source index ${sourcePath}`)
    const sourceIds = source.resolutions.map((entry) => entry.goalId)
    if (new Set(sourceIds).size !== sourceIds.length || sourceIds.filter((id) => id === spec.excludedGoalId).length !== 1) {
      fail(`Expected one exact affected goal in ${sourcePath}`)
    }
    const retained = source.resolutions.filter((entry) => entry.goalId !== spec.excludedGoalId)
    if (retained.length !== spec.retainedCount || retained.some((entry) => !entry.strictDescriptionComplete)) {
      fail(`Unexpected retained strict count in ${sourcePath}`)
    }
    const result: AggregateResolutionIndex = {
      schemaVersion: 1,
      artifactSetId: `${source.artifactSetId}-current-png-retained-${spec.retainedCount}-20260923-v1`,
      subject: 'Mathematik',
      semanticKind: 'curricularAtomic',
      strictDescriptionReviewCompleteCount: spec.retainedCount,
      curriculumAtomicDenominator: source.curriculumAtomicDenominator,
      descriptionReviewPercentage: Number(((spec.retainedCount / source.curriculumAtomicDenominator) * 100).toFixed(1)),
      ...(source.synthesisDecisionManifest ? { synthesisDecisionManifest: source.synthesisDecisionManifest } : {}),
      groups: [{ ...source.groups[0], resolvedGoalCount: spec.retainedCount }],
      resolutions: retained,
    }
    const errors = validateLegacyResolutionIndexSnapshot(result)
    if (errors.length) fail(`${targetPath}: ${errors.join('; ')}`)
    const expected = outputBytes(result)
    let current: Buffer | null = null
    try { current = await readFile(resolve(root, targetPath)) } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    if (current && !current.equals(expected)) fail(`Retained index is stale: ${targetPath}`)
    if (!current && mode === '--check') fail(`Missing retained index: ${targetPath}`)
    if (!current && mode === '--write') await writeFile(resolve(root, targetPath), expected, { flag: 'wx' })
    console.log(`${targetPath}: retained ${spec.retainedCount}/${sourceIds.length}`)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
