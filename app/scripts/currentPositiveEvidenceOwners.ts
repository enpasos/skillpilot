import { readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { stableGoalEvidenceJson } from './goalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import type { GoalDescriptionReviewInputGoal } from './validateGoalDescriptionReviewCampaign'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const canonicalSources = new Map([
  ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'],
  ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'],
])

/** Source activation, never a goal-ID, phase or course-profile allowlist. */
export const isCanonicalMathPhysicsEvidenceSource = (source: {
  landscapePath: string; landscapeId?: string
}): boolean => canonicalSources.has(source.landscapePath)
  && (source.landscapeId === undefined || canonicalSources.get(source.landscapePath) === source.landscapeId)

export interface CurrentPositiveEvidenceOwner {
  configPath: string
  config: PositiveGoalEvidenceReviewConfig
  record: PositiveGoalEvidenceReviewRecord
}
export interface CurrentPositiveEvidenceSource {
  subject: string
  landscapeId: string
  landscapePath: string
  semanticKindLedgerPath: string
  atomicGoalIds: ReadonlySet<string>
  positiveEvidenceConfigPaths: readonly string[]
}
export type CurrentPositiveEvidenceObserver = (
  configPath: string, config: PositiveGoalEvidenceReviewConfig, record: PositiveGoalEvidenceReviewRecord,
) => void

const repoPath = (path: string): string => {
  const absolute = resolve(repoRoot, path)
  const rel = relative(repoRoot, absolute)
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`Configured path must stay inside the repository: ${path}`)
  return absolute
}
const duplicates = (values: readonly string[]) => values.filter((value, index) => values.indexOf(value) !== index)

/** Only final, unique, normally validated current owners may reach consumers.
 * Invalid later config/record claims cannot be healed by an earlier valid owner. */
export const loadCurrentPositiveEvidenceOwners = (
  source: CurrentPositiveEvidenceSource,
  observer?: CurrentPositiveEvidenceObserver,
): { ready: Set<string>; owners: Map<string, CurrentPositiveEvidenceOwner>; issues: string[] } => {
  const issues: string[] = []
  const claims = new Map<string, string[]>()
  const candidates = new Map<string, CurrentPositiveEvidenceOwner>()
  const issue = (detail: string) => issues.push(`${source.subject}: ${detail}`)
  for (const configPath of source.positiveEvidenceConfigPaths) {
    const claimed = new Set<string>()
    let raw: PositiveGoalEvidenceReviewConfig
    try {
      raw = JSON.parse(readFileSync(repoPath(configPath), 'utf8')) as PositiveGoalEvidenceReviewConfig
      const scopeIds = Array.isArray(raw.scope?.goalIds) ? raw.scope.goalIds : []
      scopeIds.filter((id) => typeof id === 'string').forEach((id) => claimed.add(id))
      // Include foreign/out-of-scope record claims even when normal validation
      // rejects the config. They must never leave an earlier claim authoritative.
      if (typeof raw.reviewPath === 'string') {
        for (const line of readFileSync(repoPath(raw.reviewPath), 'utf8').split(/\r?\n/u).filter((line) => line.trim())) {
          try {
            const record = JSON.parse(line) as { goalId?: unknown }
            if (typeof record.goalId === 'string') claimed.add(record.goalId)
          } catch { /* The ordinary validator reports malformed record lines. */ }
        }
      }
    } catch (error) {
      issue(`${configPath}: ${error instanceof Error ? error.message : String(error)}`)
      claimed.forEach((goalId) => claims.set(goalId, [...(claims.get(goalId) ?? []), configPath]))
      continue
    }
    claimed.forEach((goalId) => claims.set(goalId, [...(claims.get(goalId) ?? []), configPath]))
    let result: ReturnType<typeof reviewPositiveGoalEvidenceConfig>
    try { result = reviewPositiveGoalEvidenceConfig(configPath) } catch (error) {
      issue(`${configPath}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    const config = result.config
    const duplicateScope = duplicates(config.scope.goalIds)
    duplicateScope.forEach((goalId) => issue(`${configPath}: duplicate configured evidence goal ${goalId}`))
    const sameSource = config.landscapeId === source.landscapeId
      && config.landscapePath === source.landscapePath
      && config.semanticKindLedgerPath === source.semanticKindLedgerPath
    if (!sameSource) issue(`${configPath}: evidence config is bound to another subject source`)
    result.errors.forEach((error) => issue(`${configPath}: ${error}`))
    if (!sameSource || result.errors.length || duplicateScope.length) continue
    for (const record of result.records) {
      if (!source.atomicGoalIds.has(record.goalId)) {
        issue(`${configPath}: evidence goal ${record.goalId} is not current curricularAtomic`)
        continue
      }
      if ((record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate')
          || (record.status === 'approved' && record.reviewAuthority === 'human')) {
        candidates.set(record.goalId, { configPath, config, record })
      }
    }
  }
  const owners = new Map<string, CurrentPositiveEvidenceOwner>()
  for (const [goalId, paths] of claims) {
    if (paths.length !== 1) {
      issue(`positive-evidence overlap for ${goalId}: ${paths.join(' and ')}`)
      continue
    }
    const owner = candidates.get(goalId)
    if (owner && owner.configPath === paths[0]) owners.set(goalId, owner)
  }
  // Deliberately outside the scan: a later duplicate invalidates the first owner.
  owners.forEach(({ configPath, config, record }) => observer?.(configPath, config, record))
  return { ready: new Set(owners.keys()), owners, issues }
}

/** Cycle-free config-only boundary for the ordinary Book importer. No report,
 * renderer, D/A/M/V evaluation or caller readiness receipt is involved. */
export const loadRegisteredCurrentPositiveEvidenceOwners = (
  source: Omit<CurrentPositiveEvidenceSource, 'subject' | 'positiveEvidenceConfigPaths'>,
): ReturnType<typeof loadCurrentPositiveEvidenceOwners> => {
  const empty = (detail: string) => ({ ready: new Set<string>(),
    owners: new Map<string, CurrentPositiveEvidenceOwner>(), issues: [detail] })
  if (!isCanonicalMathPhysicsEvidenceSource(source)) return empty('Source is outside the registered canonical Math/Physics evidence boundary')
  try {
    const configPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
    const schemaPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json'
    const raw = JSON.parse(readFileSync(repoPath(configPath), 'utf8'))
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)
    const validator = ajv.compile(JSON.parse(readFileSync(repoPath(schemaPath), 'utf8')))
    if (!validator(raw)) return empty(`Invalid registered deep-understanding config: ${ajv.errorsText(validator.errors)}`)
    const subjects = raw.subjects as Array<CurrentPositiveEvidenceSource>
    if (duplicates(subjects.map((entry) => entry.subject)).length) return empty('Duplicate registered rollout subjects')
    const matches = subjects.filter((entry) => entry.landscapePath === source.landscapePath
      && entry.semanticKindLedgerPath === source.semanticKindLedgerPath)
    if (matches.length !== 1) return empty('No unique registered current evidence source for the exact landscape and semantic-kind ledger')
    return loadCurrentPositiveEvidenceOwners({ ...matches[0], ...source })
  } catch (error) { return empty(error instanceof Error ? error.message : String(error)) }
}

const changedPaths = (before: unknown, after: unknown, path = ''): string[] => {
  if (stableGoalEvidenceJson(before) === stableGoalEvidenceJson(after)) return []
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object'
      || Array.isArray(before) !== Array.isArray(after)) return [path || '/']
  const a = before as Record<string, unknown>
  const b = after as Record<string, unknown>
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().flatMap((key) => (
    changedPaths(a[key], b[key], `${path}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`)
  ))
}

/** Existing D validators own schema, page and round integrity. This comparison
 * adds the current P dependency, preserving the legitimate null/null contract. */
export const validateDescriptionPositiveEvidenceBinding = (
  inputGoal: Pick<GoalDescriptionReviewInputGoal, 'goalId' | 'reviewContext'>,
  activeOwner: CurrentPositiveEvidenceOwner | undefined,
): { status: 'profile-independent' | 'current' | 'invalid'; errors: string[] } => {
  const { evidenceProfile, page } = inputGoal.reviewContext
  if (evidenceProfile === null && page.evidenceReview === null) return { status: 'profile-independent', errors: [] }
  const prefix = `${inputGoal.goalId}: current positive-evidence dependency`
  if (evidenceProfile === null || page.evidenceReview === null) {
    return { status: 'invalid', errors: [`${prefix}: profile/page summary null binding conflicts`] }
  }
  if (!activeOwner) return { status: 'invalid', errors: [`${prefix}: no unique valid current P owner`] }
  if (evidenceProfile.schemaVersion !== 2 || evidenceProfile.goalId !== inputGoal.goalId
      || activeOwner.record.goalId !== inputGoal.goalId || evidenceProfile.landscapeId !== activeOwner.record.landscapeId) {
    return { status: 'invalid', errors: [`${prefix}: foreign goal, landscape or P schema at ${activeOwner.configPath}`] }
  }
  const paths = changedPaths(evidenceProfile, activeOwner.record)
  if (paths.length) return {
    status: 'invalid', errors: [`${prefix}: stale full P record against ${activeOwner.configPath}; changed fields ${paths.join(', ')}`],
  }
  return { status: 'current', errors: [] }
}
