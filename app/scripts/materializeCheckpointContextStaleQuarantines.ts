import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateDeepUnderstandingRollout,
  loadDeepUnderstandingRolloutConfig,
  type AggregateResolutionIndex,
  type DeepUnderstandingRolloutConfig,
} from './reportDeepUnderstandingRollout'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

type SemanticKindLedger = {
  counts?: { curricularAtomic: number }
  decisions: Array<{ semanticKind: string; decisionStatus: string }>
}

interface QuarantineSpec {
  subject: 'mathematik' | 'physik'
  expectedLabel: 'Mathematik' | 'Physik'
  excludedGoalIds: string[]
  retainedCount: number
  denominator: number
  sourceIndexPath: string
  sourceIndexSha256: string
  outputIndexPath: string
  sourceEvidenceConfigPath: string
  sourceEvidenceConfigSha256: string
  outputEvidenceConfigPath: string
  sourceEvidenceReviewPath: string
  sourceEvidenceReviewSha256: string
  outputEvidenceReviewPath: string
  scopeLabel: string
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const centralConfigPath = (
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
  + 'de-gymnasium-math-physics.config.json'
)
const write = process.argv.includes('--write')

const specs: QuarantineSpec[] = [
  {
    subject: 'mathematik',
    expectedLabel: 'Mathematik',
    excludedGoalIds: [
      '46bdcc16-418f-417a-89cf-033d7ae6c8cc',
      '82597dfb-0ec6-4a77-abaf-e1d6bdd12041',
    ],
    retainedCount: 10,
    denominator: 795,
    sourceIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-031r-atlas-revised-context-final-recheck-14-v1/resolution-index.stable-current-carryover-12-v1.json',
    sourceIndexSha256: 'sha256:f88e4bda5011a334cba4c52664439f3508d48d0e2d01b548c599eedb813b5fb4',
    outputIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-031r-atlas-revised-context-final-recheck-14-v1/resolution-index.overlap-safe-current-filtered-10-v1.json',
    sourceEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-031r-stable-current-carryover-12-v1.config.json',
    sourceEvidenceConfigSha256: 'sha256:144b2a5849765c75b414b291e10dd63dcc8eea994c0b5d8c424a3479db4a83e1',
    outputEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-031r-overlap-safe-current-filtered-10-v1.config.json',
    sourceEvidenceReviewPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-031r-stable-current-carryover-12-v1.review.jsonl',
    sourceEvidenceReviewSha256: 'sha256:efb86ff48be5a6d950a991ea971d4fcab8a74fc7c8d2723a63ae52f7af89a4ab',
    outputEvidenceReviewPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-031r-overlap-safe-current-filtered-10-v1.review.jsonl',
    scopeLabel: 'Canonical Mathematics positive understanding-evidence rollout v1 B031r: overlap-safe current checkpoint subset retaining 10 profiles',
  },
  {
    subject: 'physik',
    expectedLabel: 'Physik',
    excludedGoalIds: ['f74c691b-0b76-54e0-8fd6-a22211994e0a'],
    retainedCount: 7,
    denominator: 464,
    sourceIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/batch-017-global-nuclear-physics-current-8-v3/resolution-index.json',
    sourceIndexSha256: 'sha256:a11a8581a0ac4cdf5a67276f7080cc62205f07d0717cb1e7e6f9ce760a00a31f',
    outputIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/batch-017-global-nuclear-physics-current-8-v3/resolution-index.overlap-safe-current-filtered-7-v1.json',
    sourceEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-017-nuclear-physics-current-v1.config.json',
    sourceEvidenceConfigSha256: 'sha256:a371ac36f3df5d0bafab035d9fa3107cde78fe428a2ec235a6a77e1a478941e6',
    outputEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-017-overlap-safe-current-filtered-7-v1.config.json',
    sourceEvidenceReviewPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-017-nuclear-physics-current-v1.review.jsonl',
    sourceEvidenceReviewSha256: 'sha256:95fa9403427118ad49091766a6b1c0497628a2307c3e598d6043d5a0c3997503',
    outputEvidenceReviewPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-017-overlap-safe-current-filtered-7-v1.review.jsonl',
    scopeLabel: 'Canonical Physics positive understanding-evidence rollout v1 B017: overlap-safe current checkpoint subset retaining 7 profiles',
  },
]

const sha256 = (value: Buffer | string): string => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const absolute = (path: string): string => resolve(repositoryRoot, path)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const sameValues = (left: string[], right: string[]): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
)

const assertUnique = (values: string[], label: string): void => {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicate goal IDs`)
}

const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(absolute(path))))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing checkpoint quarantine artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing checkpoint quarantine artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => current[index]
    ? []
    : [mkdir(dirname(absolute(path)), { recursive: true })
        .then(() => writeFile(absolute(path), bytes, { flag: 'wx' }))]))
}

const parseReviewLines = (bytes: Buffer, path: string): Array<{ line: string; record: PositiveGoalEvidenceReviewRecord }> => {
  const text = bytes.toString('utf8')
  if (!text.endsWith('\n')) throw new Error(`${path} must end with a newline`)
  return text.slice(0, -1).split('\n').map((line, index) => {
    if (line.length === 0 || line.endsWith('\r')) {
      throw new Error(`${path}:${index + 1} is not one canonical LF-terminated JSON record`)
    }
    return { line, record: JSON.parse(line) as PositiveGoalEvidenceReviewRecord }
  })
}

const occurrenceCount = (values: string[], value: string): number => (
  values.filter((candidate) => candidate === value).length
)

const assertRegistrationPair = (
  configuredPaths: string[],
  sourcePath: string,
  outputPath: string,
  label: string,
): void => {
  const sourceCount = occurrenceCount(configuredPaths, sourcePath)
  const outputCount = occurrenceCount(configuredPaths, outputPath)
  if (!((sourceCount === 1 && outputCount === 0) || (sourceCount === 0 && outputCount === 1))) {
    throw new Error(`${label} must register exactly one of source or filtered replacement`)
  }
}

const materializeSpec = async (
  spec: QuarantineSpec,
  centralConfig: DeepUnderstandingRolloutConfig,
): Promise<Array<{ path: string; bytes: Buffer }>> => {
  const subjectConfig = centralConfig.subjects.find(({ subject }) => subject === spec.subject)
  if (!subjectConfig || subjectConfig.label !== spec.expectedLabel) {
    throw new Error(`Missing expected central rollout subject ${spec.subject}`)
  }
  assertRegistrationPair(
    subjectConfig.resolutionIndexPaths,
    spec.sourceIndexPath,
    spec.outputIndexPath,
    `${spec.subject} resolution registration`,
  )
  assertRegistrationPair(
    subjectConfig.positiveEvidenceConfigPaths,
    spec.sourceEvidenceConfigPath,
    spec.outputEvidenceConfigPath,
    `${spec.subject} evidence registration`,
  )

  const [sourceIndexBytes, sourceConfigBytes, sourceReviewBytes, ledgerBytes] = await Promise.all([
    readFile(absolute(spec.sourceIndexPath)),
    readFile(absolute(spec.sourceEvidenceConfigPath)),
    readFile(absolute(spec.sourceEvidenceReviewPath)),
    readFile(absolute(subjectConfig.semanticKindLedgerPath)),
  ])
  const sourceHashes = [
    [sha256(sourceIndexBytes), spec.sourceIndexSha256, 'resolution index'],
    [sha256(sourceConfigBytes), spec.sourceEvidenceConfigSha256, 'evidence config'],
    [sha256(sourceReviewBytes), spec.sourceEvidenceReviewSha256, 'evidence review'],
  ]
  sourceHashes.forEach(([actual, expected, label]) => {
    if (actual !== expected) throw new Error(`${spec.subject} source ${label} digest changed: ${actual}`)
  })

  const sourceIndex = JSON.parse(sourceIndexBytes.toString('utf8')) as AggregateResolutionIndex
  const sourceConfig = JSON.parse(sourceConfigBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as SemanticKindLedger
  const sourceReviewLines = parseReviewLines(sourceReviewBytes, spec.sourceEvidenceReviewPath)
  const excluded = new Set(spec.excludedGoalIds)
  assertUnique(spec.excludedGoalIds, `${spec.subject} quarantine exclusion`)

  const indexGoalIds = sourceIndex.resolutions.map(({ goalId }) => goalId)
  const evidenceGoalIds = sourceConfig.scope.goalIds
  const reviewGoalIds = sourceReviewLines.map(({ record }) => record.goalId as string)
  ;[
    [indexGoalIds, 'source resolution index'],
    [evidenceGoalIds, 'source evidence scope'],
    [reviewGoalIds, 'source evidence review'],
  ].forEach(([values, label]) => {
    const goalIds = values as string[]
    assertUnique(goalIds, `${spec.subject} ${label as string}`)
    spec.excludedGoalIds.forEach((goalId) => {
      if (occurrenceCount(goalIds, goalId) !== 1) {
        throw new Error(`${spec.subject} ${label as string} does not contain excluded ${goalId} exactly once`)
      }
    })
  })
  if (
    indexGoalIds.length - spec.excludedGoalIds.length !== spec.retainedCount
    || evidenceGoalIds.length - spec.excludedGoalIds.length !== spec.retainedCount
    || reviewGoalIds.length - spec.excludedGoalIds.length !== spec.retainedCount
  ) throw new Error(`${spec.subject} source artifact counts do not produce ${spec.retainedCount} retained goals`)

  const retainedIndexEntries = sourceIndex.resolutions
    .filter(({ goalId }) => !excluded.has(goalId as string))
  const retainedEvidenceGoalIds = evidenceGoalIds.filter((goalId) => !excluded.has(goalId))
  const retainedReviewLines = sourceReviewLines.filter(({ record }) => !excluded.has(record.goalId as string))
  const retainedReviewGoalIds = retainedReviewLines.map(({ record }) => record.goalId as string)
  if (!sameValues(retainedIndexEntries.map(({ goalId }) => goalId as string), retainedEvidenceGoalIds)) {
    const sameSets = retainedIndexEntries.every(({ goalId }) => retainedEvidenceGoalIds.includes(goalId as string))
    if (!sameSets) throw new Error(`${spec.subject} retained index and evidence scopes differ`)
  }
  if (!sameValues(retainedEvidenceGoalIds, retainedReviewGoalIds)) {
    throw new Error(`${spec.subject} retained evidence scope and raw review line order differ`)
  }
  if (retainedReviewLines.some(({ line }, index) => (
    sourceReviewLines.find(({ record }) => record.goalId === retainedReviewGoalIds[index])?.line !== line
  ))) throw new Error(`${spec.subject} retained evidence payload bytes changed`)

  const denominator = Number(ledger.counts?.curricularAtomic)
  const authoritativeCount = ledger.decisions.filter((decision) => (
    decision.semanticKind === 'curricularAtomic' && decision.decisionStatus === 'authoritative'
  )).length
  if (denominator !== spec.denominator || authoritativeCount !== spec.denominator) {
    throw new Error(`${spec.subject} expected current curricularAtomic denominator ${spec.denominator}, got ${denominator}/${authoritativeCount}`)
  }
  const sourceGroup = sourceIndex.groups[0]
  if (sourceIndex.groups.length !== 1 || !sourceGroup) {
    throw new Error(`${spec.subject} source index must have one group`)
  }
  const index: AggregateResolutionIndex = {
    schemaVersion: 1,
    artifactSetId: `${sourceIndex.artifactSetId as string}-checkpoint-quarantine-overlap-safe-current-filtered-${spec.retainedCount}`,
    subject: spec.expectedLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: spec.retainedCount,
    curriculumAtomicDenominator: spec.denominator,
    descriptionReviewPercentage: Number(((spec.retainedCount / spec.denominator) * 100).toFixed(1)),
    groups: [{
      ...sourceGroup,
      resolvedGoalCount: spec.retainedCount,
    }] as AggregateResolutionIndex['groups'],
    resolutions: retainedIndexEntries as AggregateResolutionIndex['resolutions'],
  }
  const outputConfig: PositiveGoalEvidenceReviewConfig = {
    ...sourceConfig,
    reviewPath: spec.outputEvidenceReviewPath,
    scope: {
      label: spec.scopeLabel,
      goalIds: retainedEvidenceGoalIds,
    },
  }
  const outputReviewBytes = Buffer.from(`${retainedReviewLines.map(({ line }) => line).join('\n')}\n`)

  const sourceConfigSemantic = {
    ...sourceConfig,
    reviewPath: undefined,
    scope: { ...sourceConfig.scope, label: undefined, goalIds: undefined },
  }
  const outputConfigSemantic = {
    ...outputConfig,
    reviewPath: undefined,
    scope: { ...outputConfig.scope, label: undefined, goalIds: undefined },
  }
  if (JSON.stringify(sourceConfigSemantic) !== JSON.stringify(outputConfigSemantic)) {
    throw new Error(`${spec.subject} filtered evidence config changed non-scope semantic fields`)
  }
  if (spec.excludedGoalIds.some((goalId) => outputReviewBytes.toString('utf8').includes(goalId))) {
    throw new Error(`${spec.subject} excluded goal remains in filtered evidence review`)
  }

  return [
    { path: spec.outputIndexPath, bytes: jsonBytes(index) },
    { path: spec.outputEvidenceConfigPath, bytes: jsonBytes(outputConfig) },
    { path: spec.outputEvidenceReviewPath, bytes: outputReviewBytes },
  ]
}

const validateOutputs = async (centralConfig: DeepUnderstandingRolloutConfig): Promise<void> => {
  for (const spec of specs) {
    const result = reviewPositiveGoalEvidenceConfig(absolute(spec.outputEvidenceConfigPath))
    if (result.errors.length > 0 || result.records.length !== spec.retainedCount) {
      throw new Error(`${spec.subject} filtered evidence validation failed: ${result.errors.join('; ')}`)
    }
    const actualIds = result.records.map(({ goalId }) => goalId)
    if (spec.excludedGoalIds.some((goalId) => actualIds.includes(goalId))) {
      throw new Error(`${spec.subject} filtered evidence validator still observes an excluded goal`)
    }
  }

  const replacementConfig: DeepUnderstandingRolloutConfig = {
    ...centralConfig,
    reportId: `${centralConfig.reportId}-checkpoint-quarantine-validation`,
    subjects: centralConfig.subjects.map((subject) => {
      const spec = specs.find(({ subject: candidate }) => candidate === subject.subject)
      if (!spec) return subject
      return {
        ...subject,
        resolutionIndexPaths: subject.resolutionIndexPaths.map((path) => (
          path === spec.sourceIndexPath ? spec.outputIndexPath : path
        )),
        positiveEvidenceConfigPaths: subject.positiveEvidenceConfigPaths.map((path) => (
          path === spec.sourceEvidenceConfigPath ? spec.outputEvidenceConfigPath : path
        )),
      }
    }),
  }
  const tempDirectory = await mkdtemp(join(repositoryRoot, '.tmp-checkpoint-quarantine-'))
  const tempConfigPath = join(tempDirectory, 'rollout.config.json')
  try {
    await writeFile(tempConfigPath, jsonBytes(replacementConfig), { flag: 'wx' })
    const report = await generateDeepUnderstandingRollout(tempConfigPath)
    for (const spec of specs) {
      const subject = report.subjects.find(({ subject: candidate }) => candidate === spec.subject)
      if (!subject) throw new Error(`Replacement rollout report omitted ${spec.subject}`)
      const outputIndex = JSON.parse(
        (await readFile(absolute(spec.outputIndexPath))).toString('utf8'),
      ) as AggregateResolutionIndex
      const forbiddenIssueFragments = [
        ...spec.excludedGoalIds,
        ...outputIndex.resolutions.map(({ goalId }) => goalId),
        outputIndex.artifactSetId,
        spec.outputIndexPath,
        spec.outputEvidenceConfigPath,
      ]
      const artifactIssues = subject.issues.filter((issue) => (
        forbiddenIssueFragments.some((fragment) => issue.includes(fragment))
      ))
      if (artifactIssues.length > 0) {
        throw new Error(`${spec.subject} filtered replacement validation failed: ${artifactIssues.join('; ')}`)
      }
    }
    console.log(`Replacement rollout validation: PASS (unrelated existing blockers=${report.blockingIssueCount})`)
  } finally {
    await rm(tempDirectory, { recursive: true, force: true })
  }
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)
  const centralConfig = loadDeepUnderstandingRolloutConfig(absolute(centralConfigPath))
  const artifacts = (await Promise.all(specs.map((spec) => materializeSpec(spec, centralConfig)))).flat()
  await writeAllOrRequireExact(artifacts)
  await validateOutputs(centralConfig)
  specs.forEach((spec) => {
    console.log(`${write ? 'Materialized' : 'Verified'} ${spec.expectedLabel} checkpoint quarantine: retained=${spec.retainedCount}; excluded=${spec.excludedGoalIds.join(',')}; denominator=${spec.denominator}`)
  })
  artifacts.forEach(({ path, bytes }) => console.log(`${sha256(bytes)}  ${relative(repositoryRoot, absolute(path))}`))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
