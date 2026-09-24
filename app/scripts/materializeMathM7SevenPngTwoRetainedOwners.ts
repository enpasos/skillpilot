import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
  type StandaloneBatchResolutionIndex,
} from './reportDeepUnderstandingRollout'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1'
const specs = [
  {
    input: `${base}/2026-09-23/m7-four-png-three-text-delta-20260923-v1/resolution-index.json`,
    expectedSha256: '67b235eb8fc4e9d398dd09bd85e6200673ffbc096cdbf8664465421f18e91421',
    excludeIds: ['b431148b-526c-4bde-b04b-48d23101d0d3'],
    denominator: 797,
    output: `${base}/2026-09-23/m7-four-png-three-text-delta-20260923-v1/resolution-index.retained-before-m7-seven-png-current-d-20260924-v1.json`,
  },
  {
    input: `${base}/2026-09-05/batch-033-atlas-next-unreviewed-disjoint-20-v1/resolution-index.current-carryover-v1.retained-before-m7-current-bundle39-20260920-v1.json`,
    expectedSha256: '844b67fc4f65d51eabe392142c5a7a55e060e6803068b290253f169217846d71',
    excludeIds: ['502ecaa7-cca6-5c51-a1cc-da09a7b2382c'],
    denominator: 796,
    output: `${base}/2026-09-05/batch-033-atlas-next-unreviewed-disjoint-20-v1/resolution-index.current-carryover-v1.retained-before-m7-seven-png-current-d-20260924-v1.json`,
  },
  {
    input: `${base}/2026-09-23/m7-q2-bodies-nine-keep-partial-20260923-v1/resolution-index.json`,
    expectedSha256: '44769083f3d1fb34907c5179c3750804fd6378d7591b32cd6e10a9b79fe57431',
    excludeIds: [
      '1e77bb2f-0cd6-5961-b0fb-230317c73fce',
      '288633c1-f61c-5b48-af7e-a80357f96cad',
      'c71ae268-f28e-59f0-982d-91db8f963378',
      'e8237315-654e-5150-97de-49c4cb49b3d1',
      '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
    ],
    denominator: 797,
    output: `${base}/2026-09-23/m7-q2-bodies-nine-keep-partial-20260923-v1/resolution-index.retained-four-before-m7-seven-png-current-d-20260924-v1.json`,
  },
] as const

type Index = AggregateResolutionIndex | StandaloneBatchResolutionIndex

const main = async () => {
  const mode = process.argv[2]
  if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7SevenPngTwoRetainedOwners.ts --write|--check')
  }
  for (const spec of specs) {
    const sourceBytes = await readFile(resolve(root, spec.input))
    const digest = createHash('sha256').update(sourceBytes).digest('hex')
    if (digest !== spec.expectedSha256) throw new Error(`${spec.input}: source index changed`)
    const source = JSON.parse(sourceBytes.toString('utf8')) as Index
    if (source.subject !== 'Mathematik' || source.semanticKind !== 'curricularAtomic'
      || source.groups.length !== 1 || spec.excludeIds.some((id) => source.resolutions.filter(({ goalId }) => goalId === id).length !== 1)) {
      throw new Error(`${spec.input}: expected excluded-goal ownership is missing`)
    }
    const resolutions = source.resolutions.filter(({ goalId }) => !spec.excludeIds.some((id) => goalId === id))
    const index: AggregateResolutionIndex = {
      schemaVersion: 1 as const,
      artifactSetId: `${source.artifactSetId}-retained-before-m7-seven-png-current-d-20260924-v1`,
      subject: source.subject,
      semanticKind: source.semanticKind,
      strictDescriptionReviewCompleteCount: resolutions.length,
      curriculumAtomicDenominator: spec.denominator,
      descriptionReviewPercentage: Number(((resolutions.length / spec.denominator) * 100).toFixed(1)),
      groups: [{ ...source.groups[0], resolvedGoalCount: resolutions.length }],
      resolutions,
    }
    const errors = validateLegacyResolutionIndexSnapshot(index)
    if (errors.length) throw new Error(`${spec.output}: ${errors.join(' | ')}`)
    const outputBytes = Buffer.from(`${JSON.stringify(index, null, 2)}\n`)
    const outputPath = resolve(root, spec.output)
    let existingBytes: Buffer | null = null
    try {
      existingBytes = await readFile(outputPath)
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    if (existingBytes && !existingBytes.equals(outputBytes)) {
      throw new Error(`${spec.output}: retained snapshot changed`)
    }
    if (!existingBytes && mode === '--write') {
      await writeFile(outputPath, outputBytes, { flag: 'wx' })
    } else if (!existingBytes) {
      throw new Error(`${spec.output}: retained snapshot missing`)
    }
    console.log(`${spec.excludeIds.length} excluded: retained ${resolutions.length}; ${spec.output}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
