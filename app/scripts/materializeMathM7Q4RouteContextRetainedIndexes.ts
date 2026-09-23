import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
} from './reportDeepUnderstandingRollout'

// The three new Q4 assessments changed nine goal-book page contexts. Keep
// historical indexes byte-for-byte, and derive narrow registered replacements
// containing only goals whose old page context was not changed.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1'
const specs = [
  {
    directory: `${base}/2026-09-23/m7-q4-model-check-three-current-20260923-v1`,
    source: 'resolution-index.json',
    output: 'resolution-index.route-context-retained-one-20260923-v1.json',
    sourceDigest: 'sha256:fcf47276ca05d8dec761f0436439a0fb8e6b74bbac67d7e8c65b3d64fe36bc44',
    exclude: [
      '163dd583-8308-53f0-b60d-34588787988d',
      '519660d0-85e5-57a6-a219-d0a253336649',
    ],
    retainedCount: 1,
  },
  {
    directory: `${base}/2026-09-23/m7-image-delta-three-keep-two-partial-20260923-v1`,
    source: 'resolution-index.json',
    output: 'resolution-index.route-context-retained-one-20260923-v1.json',
    sourceDigest: 'sha256:5ed3ea46e18d0e678e86f9e9f498b9615c39755ee30ca5eea47859fcbba759b3',
    exclude: ['fb4dcd2a-a6a9-5371-a2fc-95348ee130e0'],
    retainedCount: 1,
  },
  {
    directory: `${base}/2026-09-23/m7-modeling-d16-stable-ten-partial-20260923-v1`,
    source: 'resolution-index.json',
    output: 'resolution-index.route-context-retained-seven-20260923-v1.json',
    sourceDigest: 'sha256:3510e03e95abe52182b682f95c5efd6116ce3607579c9a8e346396fcc7934312',
    exclude: [
      'ae2ca565-928d-55f4-b804-7155cf210120',
      '4a630596-6e2f-593e-bac6-2a6d8fa58e2f',
      '74f28ce7-e568-5d6e-b946-17445b344fcc',
    ],
    retainedCount: 7,
  },
  {
    directory: `${base}/2026-09-07/batch-042-calculus-models-growth-and-integration-20-v1`,
    source: 'resolution-index.current-keep12-v1.json',
    output: 'resolution-index.route-context-retained-nine-20260923-v1.json',
    sourceDigest: 'sha256:44ea1a2c334a05e4c6ff74feebcd01302045c442f983b67e4ff09f7baad72a81',
    exclude: [
      'dc12f281-f161-572b-a973-8405ae9b2498',
      '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
      '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
    ],
    retainedCount: 9,
  },
] as const

const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const outputBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const fail = (message: string): never => { throw new Error(message) }

const main = async () => {
  const mode = process.argv[2]
  if (mode !== '--write' && mode !== '--check') fail('Usage: tsx scripts/materializeMathM7Q4RouteContextRetainedIndexes.ts --write|--check')
  const central = JSON.parse(await readFile(resolve(root,
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'), 'utf8')) as {
    subjects: Array<{ subject: string; resolutionIndexPaths: string[] }>
  }
  const paths = central.subjects.find((subject) => subject.subject === 'mathematik')?.resolutionIndexPaths
    ?? fail('Missing Mathematik central registry')
  for (const spec of specs) {
    const sourcePath = `${spec.directory}/${spec.source}`
    const targetPath = `${spec.directory}/${spec.output}`
    const sourceCount = paths.filter((path) => path === sourcePath).length
    const targetCount = paths.filter((path) => path === targetPath).length
    if (!((sourceCount === 1 && targetCount === 0) || (sourceCount === 0 && targetCount === 1))) {
      fail(`Expected exactly one source or retained registration for ${spec.directory}`)
    }
    const sourceBytes = await readFile(resolve(root, sourcePath))
    if (digest(sourceBytes) !== spec.sourceDigest) fail(`Historical source index changed: ${sourcePath}`)
    const source = JSON.parse(sourceBytes.toString('utf8')) as AggregateResolutionIndex & {
      batchGoalIds?: string[]
    }
    if (source.subject !== 'Mathematik' || source.groups.length !== 1) fail(`Invalid source index ${sourcePath}`)
    const sourceIds = source.resolutions.map((entry) => entry.goalId)
    if (new Set(sourceIds).size !== sourceIds.length) fail(`Duplicate source goals in ${sourcePath}`)
    const exclude = new Set<string>(spec.exclude)
    if (exclude.size !== spec.exclude.length || spec.exclude.some((goalId) => sourceIds.filter((id) => id === goalId).length !== 1)) {
      fail(`Exclusions are not unique exact source goals in ${sourcePath}`)
    }
    const retained = source.resolutions.filter((entry) => !exclude.has(entry.goalId))
    if (retained.length !== spec.retainedCount || retained.some((entry) => entry.strictDescriptionComplete !== true)) {
      fail(`Retained strict count changed in ${sourcePath}`)
    }
    const result: AggregateResolutionIndex = {
      schemaVersion: 1,
      artifactSetId: `${source.artifactSetId}-route-context-retained-${spec.retainedCount}-20260923-v1`,
      subject: 'Mathematik',
      semanticKind: 'curricularAtomic',
      strictDescriptionReviewCompleteCount: spec.retainedCount,
      curriculumAtomicDenominator: 797,
      descriptionReviewPercentage: Number(((spec.retainedCount / 797) * 100).toFixed(1)),
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
