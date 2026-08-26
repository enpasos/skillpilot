import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type ResolutionEntry = {
  goalId: string
  titleDe: string
  groupId: string
  decision: string
  resolutionPath: string
  resolutionDigest: string
  resolutionFingerprint: string
  strictDescriptionComplete: boolean
}

type ResolutionGroup = {
  groupId: string
  artifactDirectory?: string
  dualSummaryPath: string
  dualSummaryDigest: string
  campaignGoalCount: number
  resolvedGoalCount: number
}

type StandaloneResolutionIndex = {
  groups: ResolutionGroup[]
  resolutions: ResolutionEntry[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const outputPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/checkpoint-current-2026-08-26/resolution-index.json',
)
const calibrationPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/calibration-v2/2026-08-26/final-20-v6/resolution-index.json',
)
const routeCurrentPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-26/batch-006-route-stabilized-motion-modeling-1-current-v1/resolution-index.json',
)
const routeReboundGoalId = 'd6dc0e02-831d-4894-a61a-852bcc74f147'

const parseIndex = (path: string): StandaloneResolutionIndex =>
  JSON.parse(readFileSync(path, 'utf8')) as StandaloneResolutionIndex

const relativeFromOutput = (absolutePath: string): string => {
  const value = relative(dirname(outputPath), absolutePath)
  if (value === '..' || value.startsWith(`..${sep}..${sep}`)) {
    throw new Error(`Composite artifact path escapes the expected Physik review tree: ${absolutePath}`)
  }
  return value.split(sep).join('/')
}

const prefixEntry = (
  entry: ResolutionEntry,
  sourceIndexPath: string,
): ResolutionEntry => ({
  ...entry,
  resolutionPath: relativeFromOutput(resolve(dirname(sourceIndexPath), entry.resolutionPath)),
})

const prefixGroup = (
  group: ResolutionGroup,
  sourceIndexPath: string,
  resolvedGoalCount: number,
): ResolutionGroup => ({
  ...group,
  artifactDirectory: relativeFromOutput(
    resolve(dirname(sourceIndexPath), group.artifactDirectory ?? group.groupId),
  ),
  dualSummaryPath: relativeFromOutput(resolve(dirname(sourceIndexPath), group.dualSummaryPath)),
  resolvedGoalCount,
})

const calibration = parseIndex(calibrationPath)
const routeCurrent = parseIndex(routeCurrentPath)
if (calibration.groups.length !== 1 || routeCurrent.groups.length !== 1) {
  throw new Error('Expected exactly one group in each source resolution index')
}
const calibrationEntries = calibration.resolutions
  .filter(({ goalId }) => goalId !== routeReboundGoalId)
  .map((entry) => prefixEntry(entry, calibrationPath))
const routeEntries = routeCurrent.resolutions.map((entry) => prefixEntry(entry, routeCurrentPath))
if (
  calibration.resolutions.length !== 20
  || calibrationEntries.length !== 19
  || routeEntries.length !== 1
  || routeEntries[0]?.goalId !== routeReboundGoalId
) {
  throw new Error('Unexpected calibration or route-current resolution membership')
}

const output = {
  schemaVersion: 1,
  artifactSetId: 'physics-calibration-route-current-composite-20-20260826',
  subject: 'Physik',
  semanticKind: 'curricularAtomic',
  synthesisAuthority: 'ai_synthesis',
  synthesizedAt: '2026-08-26T14:05:00.000Z',
  strictDescriptionReviewCompleteCount: 20,
  curriculumAtomicDenominator: 438,
  descriptionReviewPercentage: 4.6,
  groups: [
    prefixGroup(calibration.groups[0], calibrationPath, calibrationEntries.length),
    prefixGroup(routeCurrent.groups[0], routeCurrentPath, routeEntries.length),
  ],
  resolutions: [...calibrationEntries, ...routeEntries],
}
const expected = `${JSON.stringify(output, null, 2)}\n`
const writeMode = process.argv.includes('--write')
if (writeMode) {
  writeFileSync(outputPath, expected, 'utf8')
  console.log(`Wrote ${relative(repositoryRoot, outputPath)}: ${output.resolutions.length} resolutions`)
} else {
  const actual = readFileSync(outputPath, 'utf8')
  if (actual !== expected) throw new Error('Current Physik composite resolution index is stale')
  console.log(`Verified ${relative(repositoryRoot, outputPath)}: ${output.resolutions.length} resolutions`)
}
