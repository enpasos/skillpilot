import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonRecord = Record<string, unknown>

type StandaloneResolutionIndex = {
  schemaVersion: number
  artifactSetId: string
  subject: string
  semanticKind: string
  batchGoalIds: string[]
  groups: JsonRecord[]
  resolutions: JsonRecord[]
}

type CheckpointSpec = {
  inputPath: string
  outputPath: string
  expectedArtifactSetId: string
  excludedGoalIds: string[]
  curriculumAtomicDenominator: number
}

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const write = process.argv.includes('--write')

const specs: CheckpointSpec[] = [
  {
    inputPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-002-current-v7-sixth-pass-main-20/resolution-index.json',
    outputPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-002-current-v7-sixth-pass-main-20/resolution-index.current-checkpoint.json',
    expectedArtifactSetId: 'mathematik-rollout-v1-batch-002-current-v7-sixth-pass-main-20-20260826-strict-resolutions',
    excludedGoalIds: ['0bd7dc9b-c7f9-52e6-b374-a019edfd821c'],
    curriculumAtomicDenominator: 791,
  },
  {
    inputPath: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-27/batch-012-global-electricity-final-9-v1/resolution-index.json',
    outputPath: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-27/batch-012-global-electricity-final-9-v1/resolution-index.current-checkpoint.json',
    expectedArtifactSetId: 'physik-rollout-v1-batch-012-global-electricity-final-9-v1-20260827-strict-resolutions',
    excludedGoalIds: ['f1a078ae-6262-4444-a4bc-a5ab275621cf'],
    curriculumAtomicDenominator: 444,
  },
]

const parseIndex = (path: string): StandaloneResolutionIndex => {
  const parsed = JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as StandaloneResolutionIndex
  if (
    parsed.schemaVersion !== 2
    || !Array.isArray(parsed.batchGoalIds)
    || !Array.isArray(parsed.groups)
    || parsed.groups.length !== 1
    || !Array.isArray(parsed.resolutions)
  ) {
    throw new Error(`${path}: expected one strict standalone resolution group`)
  }
  return parsed
}

for (const spec of specs) {
  const source = parseIndex(spec.inputPath)
  if (source.artifactSetId !== spec.expectedArtifactSetId) {
    throw new Error(`${spec.inputPath}: unexpected artifactSetId ${source.artifactSetId}`)
  }

  const excluded = new Set(spec.excludedGoalIds)
  const sourceGoalIds = new Set(source.batchGoalIds)
  for (const goalId of excluded) {
    if (!sourceGoalIds.has(goalId)) throw new Error(`${spec.inputPath}: missing excluded goal ${goalId}`)
  }
  const resolutions = source.resolutions.filter((entry) => !excluded.has(String(entry.goalId)))
  if (resolutions.length !== source.resolutions.length - excluded.size) {
    throw new Error(`${spec.inputPath}: excluded resolution count is inconsistent`)
  }

  const group = {
    ...source.groups[0],
    resolvedGoalCount: resolutions.length,
  }
  const checkpoint = {
    schemaVersion: 1,
    artifactSetId: `${source.artifactSetId}-current-checkpoint`,
    subject: source.subject,
    semanticKind: source.semanticKind,
    strictDescriptionReviewCompleteCount: resolutions.length,
    curriculumAtomicDenominator: spec.curriculumAtomicDenominator,
    descriptionReviewPercentage: Number((
      resolutions.length / spec.curriculumAtomicDenominator * 100
    ).toFixed(1)),
    groups: [group],
    resolutions,
  }
  const bytes = `${JSON.stringify(checkpoint, null, 2)}\n`
  const output = resolve(repoRoot, spec.outputPath)
  const current = (() => {
    try {
      return readFileSync(output, 'utf8')
    } catch {
      return null
    }
  })()
  if (current === bytes) {
    console.log(`CURRENT ${spec.outputPath}`)
  } else if (!write) {
    console.log(`STALE ${spec.outputPath}`)
    process.exitCode = 1
  } else {
    writeFileSync(output, bytes)
    console.log(`WROTE ${spec.outputPath}`)
  }
}
