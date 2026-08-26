import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const BUNDLE_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-review-bundle.schema.json'
const RUN_SCHEMA_PATH = 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
const FINDING_SCHEMA_PATH = 'contracts/goal-evidence/v1/goal-evidence-finding.schema.json'

export type GoalEvidenceAiRunManifest = {
  runId: string
  campaignId?: string
  roundId?: string
  batchId?: string
  batchInputFingerprint?: string
  bundleFingerprint: string
  bookDigest: string
  provider: string
  model: string
  modelVersion?: string
  promptFingerprint: string
  criteriaFingerprint: string
  independenceGroupId: string
  role: string
  blindToOtherRuns: boolean
  goalIds: string[]
  inputArtifacts: Array<{ role: string; digest: string }>
  startedAt: string
  completedAt: string
  status: 'completed' | 'failed'
  outputDigest: string
}

export type GoalEvidenceFinding = {
  findingId: string
  runId: string
  bundleFingerprint: string
  goalId: string
  goalFingerprint: string
  pageFingerprint: string
  findingStatus: string
  reviewAuthority: string
}

const repositoryPath = (configuredPath: string) => {
  const absolutePath = resolve(REPOSITORY_ROOT, configuredPath)
  const relativePath = relative(REPOSITORY_ROOT, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || relativePath === '') {
    throw new Error(`Contract path escapes the repository: ${configuredPath}`)
  }
  return absolutePath
}

const sha256 = (value: Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = (value: Buffer, label: string) => value.toString('utf8')
  .split(/\r?\n/u)
  .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
  .filter(({ line }) => line !== '')
  .map(({ line, lineNumber }) => parseJson<GoalEvidenceFinding>(line, `${label}:${lineNumber}`))

const sameOrderedValues = (left: readonly string[], right: readonly string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const contentArtifactRoles = new Set([
  'book_pdf',
  'book_html',
  'book_model',
  'review_input_json',
  'review_input_jsonl',
  'description_review_batch_input_jsonl',
  'review_markdown',
])

export const validateGoalReviewRunBindings = ({
  bundle,
  run,
  expectedGoalIds,
  expectedBatchInputFingerprint,
}: {
  bundle: GoalBookReviewBundleManifest
  run: GoalEvidenceAiRunManifest
  expectedGoalIds?: readonly string[]
  expectedBatchInputFingerprint?: string
}) => {
  const errors: string[] = []
  if (run.bundleFingerprint !== bundle.bundleFingerprint) {
    errors.push('Run bundleFingerprint does not match the review bundle')
  }
  if (run.bookDigest !== bundle.bookModelDigest) {
    errors.push('Run bookDigest does not match the review bundle')
  }
  if (run.promptFingerprint !== bundle.promptFingerprint) {
    errors.push('Run promptFingerprint does not match the review bundle')
  }
  if (run.criteriaFingerprint !== bundle.criteriaFingerprint) {
    errors.push('Run criteriaFingerprint does not match the review bundle')
  }

  const bundleGoalIds = bundle.goals.map(({ goalId }) => goalId)
  if (expectedGoalIds) {
    if (!sameOrderedValues(run.goalIds, expectedGoalIds)) {
      errors.push('Run goalIds do not match the campaign batch exactly and in order')
    }
  } else {
    const startIndex = bundleGoalIds.indexOf(run.goalIds[0] ?? '')
    const expectedSlice = startIndex < 0
      ? []
      : bundleGoalIds.slice(startIndex, startIndex + run.goalIds.length)
    if (startIndex < 0 || !sameOrderedValues(run.goalIds, expectedSlice)) {
      errors.push('Run goalIds must be an exact ordered contiguous subset of the review bundle')
    }
  }

  const bundleArtifacts = new Map(bundle.artifacts.map((artifact) => [artifact.role, artifact]))
  const seenArtifactRoles = new Set<string>()
  run.inputArtifacts.forEach(({ role, digest }) => {
    if (seenArtifactRoles.has(role)) errors.push(`Run inputArtifacts repeat role ${role}`)
    seenArtifactRoles.add(role)
    if (role === 'description_review_batch_input_jsonl') {
      if (!expectedBatchInputFingerprint) {
        errors.push('Run input artifact description_review_batch_input_jsonl is not valid outside a bound description-review batch')
      } else if (digest !== expectedBatchInputFingerprint) {
        errors.push('Run description_review_batch_input_jsonl digest does not match the campaign batch')
      }
      return
    }
    const artifact = bundleArtifacts.get(role as GoalBookReviewBundleManifest['artifacts'][number]['role'])
    if (!artifact) errors.push(`Run input artifact ${role} is absent from the review bundle`)
    else if (artifact.digest !== digest) {
      errors.push(`Run input artifact ${role} digest does not match the review bundle`)
    }
  })
  if (!seenArtifactRoles.has('review_prompt')) {
    errors.push('Run inputArtifacts must include the bound review_prompt')
  }
  if (!seenArtifactRoles.has('review_criteria')) {
    errors.push('Run inputArtifacts must include the bound review_criteria')
  }
  if (expectedBatchInputFingerprint && !seenArtifactRoles.has('description_review_batch_input_jsonl')) {
    errors.push('Run inputArtifacts must include the bound description_review_batch_input_jsonl')
  }
  if (![...seenArtifactRoles].some((role) => contentArtifactRoles.has(role))) {
    errors.push('Run inputArtifacts must include at least one bound review content artifact')
  }
  const promptArtifact = bundleArtifacts.get('review_prompt')
  if (promptArtifact && promptArtifact.digest !== bundle.promptFingerprint) {
    errors.push('Review bundle promptFingerprint does not match its review_prompt artifact')
  }
  const criteriaArtifact = bundleArtifacts.get('review_criteria')
  if (criteriaArtifact && criteriaArtifact.digest !== bundle.criteriaFingerprint) {
    errors.push('Review bundle criteriaFingerprint does not match its review_criteria artifact')
  }

  if (run.role !== 'synthesizer' && run.blindToOtherRuns !== true) {
    errors.push('Independent AI review runs must be blind to other runs')
  }
  if (Date.parse(run.completedAt) < Date.parse(run.startedAt)) {
    errors.push('Run completedAt precedes startedAt')
  }
  return errors
}

const loadValidators = async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const [bundleSchema, runSchema, findingSchema] = await Promise.all([
    readFile(repositoryPath(BUNDLE_SCHEMA_PATH), 'utf8').then((value) => JSON.parse(value)),
    readFile(repositoryPath(RUN_SCHEMA_PATH), 'utf8').then((value) => JSON.parse(value)),
    readFile(repositoryPath(FINDING_SCHEMA_PATH), 'utf8').then((value) => JSON.parse(value)),
  ])
  return {
    ajv,
    validateBundle: ajv.compile(bundleSchema),
    validateRun: ajv.compile(runSchema),
    validateFinding: ajv.compile(findingSchema),
  }
}

export const validateGoalEvidenceFindingBatch = async ({
  bundle,
  run,
  findingsBytes,
}: {
  bundle: GoalBookReviewBundleManifest
  run: GoalEvidenceAiRunManifest
  findingsBytes: Buffer
}) => {
  const { ajv, validateBundle, validateRun, validateFinding } = await loadValidators()
  const errors: string[] = []
  if (!validateBundle(bundle)) errors.push(`Bundle: ${ajv.errorsText(validateBundle.errors)}`)
  if (!validateRun(run)) errors.push(`Run: ${ajv.errorsText(validateRun.errors)}`)
  const findings = parseJsonl(findingsBytes, 'findings.jsonl')
  findings.forEach((finding, index) => {
    if (!validateFinding(finding)) {
      errors.push(`Finding ${index + 1}: ${ajv.errorsText(validateFinding.errors)}`)
    }
  })
  if (errors.length > 0) return { errors, findings }

  errors.push(...validateGoalReviewRunBindings({ bundle, run }))
  if (run.outputDigest !== sha256(findingsBytes)) {
    errors.push('Run outputDigest does not match findings.jsonl bytes')
  }

  const goalById = new Map(bundle.goals.map((goal) => [goal.goalId, goal]))
  const runGoalIds = new Set(run.goalIds)
  const findingIds = new Set<string>()
  findings.forEach((finding) => {
    const goal = goalById.get(finding.goalId)
    if (findingIds.has(finding.findingId)) errors.push(`Duplicate findingId ${finding.findingId}`)
    findingIds.add(finding.findingId)
    if (!runGoalIds.has(finding.goalId)) {
      errors.push(`Finding ${finding.findingId} cites a goal outside the run batch`)
    }
    if (!goal) errors.push(`Finding ${finding.findingId} cites a goal outside the bundle`)
    else if (
      finding.goalFingerprint !== goal.goalFingerprint
      || finding.pageFingerprint !== goal.pageFingerprint
    ) {
      errors.push(`Finding ${finding.findingId} cites stale or foreign goal/page fingerprints`)
    }
    if (finding.runId !== run.runId) errors.push(`Finding ${finding.findingId} cites a different runId`)
    if (finding.bundleFingerprint !== bundle.bundleFingerprint) {
      errors.push(`Finding ${finding.findingId} cites a different bundleFingerprint`)
    }
    if (finding.findingStatus !== 'candidate' || finding.reviewAuthority !== 'ai_candidate') {
      errors.push(`AI finding ${finding.findingId} must remain an ai_candidate`)
    }
  })
  return { errors, findings }
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!['--bundle', '--run', '--findings'].includes(key) || !value) {
      throw new Error('Usage: tsx scripts/validateGoalEvidenceFindings.ts --bundle <manifest.json> --run <run.json> --findings <findings.jsonl>')
    }
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  const bundle = values.get('--bundle')
  const run = values.get('--run')
  const findings = values.get('--findings')
  if (!bundle || !run || !findings) throw new Error('Missing --bundle, --run, or --findings')
  return { bundle: resolve(bundle), run: resolve(run), findings: resolve(findings) }
}

const main = async () => {
  const paths = parseArgs(process.argv.slice(2))
  const [bundleBytes, runBytes, findingsBytes] = await Promise.all([
    readFile(paths.bundle),
    readFile(paths.run),
    readFile(paths.findings),
  ])
  const result = await validateGoalEvidenceFindingBatch({
    bundle: parseJson<GoalBookReviewBundleManifest>(bundleBytes, paths.bundle),
    run: parseJson<GoalEvidenceAiRunManifest>(runBytes, paths.run),
    findingsBytes,
  })
  if (result.errors.length > 0) {
    result.errors.forEach((error) => console.error(error))
    process.exitCode = 1
    return
  }
  console.log(`Goal-evidence findings valid: ${result.findings.length}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
