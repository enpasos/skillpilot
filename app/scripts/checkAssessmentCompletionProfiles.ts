/**
 * Authoring boundary for static assessment completion profiles.
 *
 * This validates the closed JSON contract and literal references only.
 * The Java CompletionProfileCompiler owns scope expansion, graph semantics,
 * protected goal kinds, reachability, rule applicability and completion.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const schemaPath = resolve(root, 'contracts/assessment-completion/v1/profile.schema.json')
const ajv = new Ajv2020({ allErrors: true, strict: true })
const schemaValidator = ajv.compile(JSON.parse(readFileSync(schemaPath, 'utf8')))
const scopeValidator = ajv.compile(JSON.parse(readFileSync(resolve(root, 'contracts/assessment-completion/v1/scope.schema.json'), 'utf8')))

export interface CompletionProfileShape {
  schemaVersion: 1
  id: string
  revision: string
  title: Record<string, string>
  levelScopeRef: string
  applicability?: Record<string, string[]>
  protectedGoalIds?: string[]
  review: { reference: string; scopeRevision: string; taskRevision: string; rubricRevision: string }
  rules: { ruleId: string; assessmentGoalIds: string[]; waivableGoalIds: string[]; rationale: string; reviewRef: string }[]
}

export function validateCompletionProfileShape(value: unknown): string[] {
  if (!schemaValidator(value)) {
    return (schemaValidator.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
  }
  const profile = value as CompletionProfileShape
  const errors: string[] = []
  const ruleIds = new Set<string>()
  for (const rule of profile.rules) {
    if (ruleIds.has(rule.ruleId)) errors.push(`duplicate ruleId ${rule.ruleId}`)
    ruleIds.add(rule.ruleId)
  }
  return errors
}

/** Caller supplies the complete canonical inventory, never a UI-filtered set. */
export function validateCompletionProfileReferences(
  value: unknown,
  goalIds: ReadonlySet<string>,
  scopeIds?: ReadonlySet<string>,
): string[] {
  const errors = validateCompletionProfileShape(value)
  if (errors.length > 0) return errors
  const profile = value as CompletionProfileShape
  const references = new Set(profile.protectedGoalIds ?? [])
  for (const rule of profile.rules) {
    rule.assessmentGoalIds.forEach((id) => references.add(id))
    rule.waivableGoalIds.forEach((id) => references.add(id))
  }
  for (const id of references) if (!goalIds.has(id)) errors.push(`unresolved canonical goal reference ${id}`)
  if (scopeIds && !scopeIds.has(profile.levelScopeRef)) errors.push(`unresolved authoritative levelScopeRef ${profile.levelScopeRef}`)
  return errors
}

export function validateCompletionScope(value: unknown, goalIds: ReadonlySet<string>): string[] {
  if (!scopeValidator(value)) {
    return (scopeValidator.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
  }
  const scope = value as { targetRootIds: string[] }
  return scope.targetRootIds.filter((id) => !goalIds.has(id)).map((id) => `unresolved canonical scope root ${id}`)
}

function jsonFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? jsonFiles(path) : entry.isFile() && entry.name.endsWith('.json') ? [path] : []
  }).sort()
}

function canonicalGoalIds(): Set<string> {
  const ids = new Set<string>()
  // Runtime landscape files are direct JSON children of their landscape folders;
  // do not treat quality ledgers or captured input snapshots as canonical goals.
  const canonicalRoot = resolve(root, 'curricula/DE/Gymnasium/canonical')
  for (const path of jsonFiles(canonicalRoot)) {
    const payload = JSON.parse(readFileSync(path, 'utf8')) as { goals?: { id?: unknown }[] }
    if (!Array.isArray(payload.goals)) continue
    for (const goal of payload.goals) if (typeof goal.id === 'string') ids.add(goal.id)
  }
  return ids
}

export function checkCompletionProfiles(paths: string[], goalIds?: ReadonlySet<string>): number {
  const ids = goalIds ?? canonicalGoalIds()
  const failures: string[] = []
  const scopeIds = new Set<string>()
  for (const path of jsonFiles(resolve(root, 'curricula/DE/Gymnasium/completion-scopes'))) {
    try {
      const value: unknown = JSON.parse(readFileSync(path, 'utf8'))
      const errors = validateCompletionScope(value, ids)
      if (errors.length === 0) {
        const id = (value as { id: string }).id
        if (scopeIds.has(id)) errors.push(`duplicate scope id ${id}`)
        scopeIds.add(id)
      }
      errors.forEach((error) => failures.push(`${relative(root, path)}: ${error}`))
    } catch (error) {
      failures.push(`${relative(root, path)}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const profiles = new Map<string, string>()
  let count = 0
  for (const input of paths) {
    const fullPath = resolve(root, input)
    if (!existsSync(fullPath)) {
      failures.push(`${input}: input does not exist`)
      continue
    }
    const files = statSync(fullPath).isDirectory() ? jsonFiles(fullPath) : [fullPath]
    for (const path of files) {
      count += 1
      try {
        const value: unknown = JSON.parse(readFileSync(path, 'utf8'))
        const errors = validateCompletionProfileReferences(value, ids, scopeIds)
        if (errors.length === 0) {
          const profile = value as CompletionProfileShape
          const previous = profiles.get(profile.id)
          if (previous) errors.push(`profile id ${profile.id} is also declared in ${previous}`)
          profiles.set(profile.id, relative(root, path))
        }
        errors.forEach((error) => failures.push(`${relative(root, path)}: ${error}`))
      } catch (error) {
        failures.push(`${relative(root, path)}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  if (failures.length > 0) throw new Error(failures.join('\n'))
  return count
}

function main(): void {
  const args = process.argv.slice(2)
  const defaultPath = 'curricula/DE/Gymnasium/completion-profiles'
  // No approved production profile is implied by installing the feature.
  const paths = args.length > 0 ? args : existsSync(resolve(root, defaultPath)) ? [defaultPath] : []
  const count = checkCompletionProfiles(paths)
  console.log(`Assessment completion authoring check passed for ${count} profile(s); semantic validation belongs to the Java compiler.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
