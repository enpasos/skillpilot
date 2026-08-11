import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  type GoalEvidenceReviewRecord,
  validateGoalEvidenceRecordSemantics,
} from './goalEvidenceProfileModel'

interface GoalEvidenceReviewConfig {
  $schema: string
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  semanticKindLedgerPath: string
  reviewPath: string
  requireApproved: boolean
  scope: {
    label: string
    goalIds: string[]
  }
}

interface SemanticKindLedger {
  sourceLandscapeId: string
  decisions: Array<{
    goalId: string
    semanticKind: string
    decisionStatus: string
  }>
}

interface Args {
  configPath: string
  mode: 'report' | 'check'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const defaultConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-representation-choice-pilot.config.json'
const schemaPath = resolve(repoRoot, 'contracts/goal-evidence/v1/goal-evidence-profile.schema.json')
const configSchemaPath = resolve(repoRoot, 'contracts/goal-evidence/v1/goal-evidence-review-config.schema.json')

function parseArgs(argv: string[]): Args {
  const args: Args = { configPath: defaultConfigPath, mode: 'report' }
  for (const arg of argv) {
    if (arg.startsWith('--config=')) args.configPath = arg.slice('--config='.length)
    else if (arg === '--mode=check') args.mode = 'check'
    else if (arg === '--mode=report') args.mode = 'report'
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

function repoPath(path: string): string {
  const absolutePath = resolve(repoRoot, path)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '..' || relativePath.startsWith('../')) {
    throw new Error(`Configured path must stay inside the repository: ${path}`)
  }
  return absolutePath
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function readJsonl(path: string): { records: GoalEvidenceReviewRecord[]; errors: string[] } {
  const errors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(({ text }) => text.length > 0)
    .flatMap(({ text, lineNumber }) => {
      try {
        return [JSON.parse(text) as GoalEvidenceReviewRecord]
      } catch (error) {
        errors.push(`Line ${lineNumber}: invalid JSON (${(error as Error).message})`)
        return []
      }
    })
  return { records, errors }
}

function resourceDigestsForGoal(goal: SkillLandscape['goals'][number]): { digests: Record<string, string>; errors: string[] } {
  const digests: Record<string, string> = {}
  const errors: string[] = []
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    if (!link.url.startsWith('/assets/goal-visualizations/')) {
      errors.push(`${goal.id}: unsupported goal-visualization URL ${link.url}`)
      continue
    }
    const assetPath = resolve(repoRoot, 'app/public', link.url.slice(1))
    if (!existsSync(assetPath)) {
      errors.push(`${goal.id}: goal-visualization asset is missing at ${assetPath}`)
      continue
    }
    digests[link.url] = `sha256:${createHash('sha256').update(readFileSync(assetPath)).digest('hex')}`
  }
  return { digests, errors }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const rawConfig = loadJson<unknown>(repoPath(args.configPath))
  const validateConfig = ajv.compile(loadJson<Record<string, unknown>>(configSchemaPath))
  if (!validateConfig(rawConfig)) {
    throw new Error(`Invalid goal-evidence review config: ${ajv.errorsText(validateConfig.errors)}`)
  }
  const config = rawConfig as GoalEvidenceReviewConfig
  const landscape = loadJson<SkillLandscape>(repoPath(config.landscapePath))
  if (landscape.landscapeId !== config.landscapeId) {
    throw new Error(`Configured landscapeId ${config.landscapeId} does not match ${config.landscapePath}`)
  }
  const semanticKindLedger = loadJson<SemanticKindLedger>(repoPath(config.semanticKindLedgerPath))
  if (semanticKindLedger.sourceLandscapeId !== config.landscapeId) {
    throw new Error(
      `Semantic-kind ledger targets ${semanticKindLedger.sourceLandscapeId}, expected ${config.landscapeId}`,
    )
  }
  const semanticKindByGoalId = new Map<string, string>()
  for (const decision of semanticKindLedger.decisions) {
    if (decision.decisionStatus !== 'authoritative') {
      throw new Error(`Semantic-kind decision for ${decision.goalId} is not authoritative`)
    }
    if (semanticKindByGoalId.has(decision.goalId)) {
      throw new Error(`Duplicate semantic-kind decision for ${decision.goalId}`)
    }
    semanticKindByGoalId.set(decision.goalId, decision.semanticKind)
  }

  const validateSchema = ajv.compile(loadJson<Record<string, unknown>>(schemaPath))
  const { records, errors: parseErrors } = readJsonl(repoPath(config.reviewPath))
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const configuredGoalIds = new Set(config.scope.goalIds)
  const recordsByGoalId = new Map<string, GoalEvidenceReviewRecord>()
  const errors = [...parseErrors]

  for (const record of records) {
    const recordForValidation: unknown = record
    const invalidRecordGoalId = record.goalId || '<unknown>'
    if (!validateSchema(recordForValidation)) {
      errors.push(`${invalidRecordGoalId}: ${ajv.errorsText(validateSchema.errors, { separator: '; ' })}`)
      continue
    }
    if (record.reviewId !== config.reviewId) errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
    if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.goalId}: ruleVersion does not match ${config.ruleVersion}`)
    if (record.landscapeId !== config.landscapeId) errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
    if (!configuredGoalIds.has(record.goalId)) errors.push(`${record.goalId}: record is outside the configured scope`)
    if (recordsByGoalId.has(record.goalId)) errors.push(`${record.goalId}: duplicate review record`)
    recordsByGoalId.set(record.goalId, record)
    const goal = goalById.get(record.goalId)
    const resourceState = goal ? resourceDigestsForGoal(goal) : { digests: {}, errors: [] }
    errors.push(...resourceState.errors)
    const semanticKind = semanticKindByGoalId.get(record.goalId)
    if (!semanticKind) errors.push(`${record.goalId}: no authoritative semantic-kind decision`)
    errors.push(...validateGoalEvidenceRecordSemantics(
      record,
      goal,
      resourceState.digests,
      semanticKind,
    ))
    if (config.requireApproved && record.status !== 'approved') {
      errors.push(`${record.goalId}: configured scope requires an approved profile`)
    }
  }

  for (const goalId of configuredGoalIds) {
    if (!goalById.has(goalId)) errors.push(`${goalId}: configured goal does not exist`)
    if (!recordsByGoalId.has(goalId)) errors.push(`${goalId}: missing review record`)
  }

  const counts = new Map<string, number>()
  for (const record of records) counts.set(record.status, (counts.get(record.status) ?? 0) + 1)
  console.log(`# Goal Evidence Review: ${config.reviewId}`)
  console.log(`Scope: ${config.scope.label}`)
  console.log(`Configured goals: ${configuredGoalIds.size}`)
  console.log(`Approved: ${counts.get('approved') ?? 0}`)
  console.log(`Needs human review: ${counts.get('needs_human_review') ?? 0}`)
  console.log(`Rejected: ${counts.get('rejected') ?? 0}`)
  console.log(`Blocking issues: ${errors.length}`)
  errors.forEach((error) => console.log(`- ${error}`))

  if (args.mode === 'check' && errors.length > 0) process.exitCode = 1
}

main()
