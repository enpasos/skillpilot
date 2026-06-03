import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const bundledIndexPath = 'app/src/data/goal-source-rationales-math-public.json'
const publicIndexPath = 'app/public/data/goal-source-rationales-math-public.json'

const minimumItemCount = 600
const minimumClassicSourceRoutes = 600
const minimumMemConsistentRoutes = 150

const requiredMemPocGoals = [
  'a075ae99-7669-563d-807a-f91b119c020a',
  '09f47964-2cd0-410e-93ee-9632b582fc91',
  'b1dcc191-d046-50de-984a-ee5c17157628',
]

function absolutePath(repoPath: string): string {
  return resolve(repoRoot, repoPath)
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function readIndex(repoPath: string, failures: string[]): { raw: string; payload: Record<string, unknown> } | null {
  const path = absolutePath(repoPath)
  if (!existsSync(path)) {
    failures.push(`${repoPath}: missing runtime source-rationale index`)
    return null
  }

  try {
    const raw = readFileSync(path, 'utf8')
    return { raw, payload: asRecord(JSON.parse(raw)) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${repoPath}: invalid JSON: ${message}`)
    return null
  }
}

function validateIndex(payload: Record<string, unknown>, failures: string[]): void {
  const request = asRecord(payload.request)
  const summary = asRecord(payload.summary)
  const items = Array.isArray(payload.items) ? payload.items.map(asRecord) : []

  if (payload.schemaVersion !== 1) {
    failures.push(`${bundledIndexPath}: schemaVersion must be 1`)
  }
  if (request.goalSelection !== 'source-backed-relevant-leaves') {
    failures.push(`${bundledIndexPath}: request.goalSelection must be source-backed-relevant-leaves`)
  }
  if (request.jurisdiction !== 'DE-BY') {
    failures.push(`${bundledIndexPath}: request.jurisdiction must keep DE-BY as the MEM/FWU comparison preference`)
  }
  if (request.includeMemSparql !== true) {
    failures.push(`${bundledIndexPath}: request.includeMemSparql must be true`)
  }
  if (request.audience !== 'plain') {
    failures.push(`${bundledIndexPath}: request.audience must be plain`)
  }

  if (items.length < minimumItemCount) {
    failures.push(`${bundledIndexPath}: expected at least ${minimumItemCount} items, found ${items.length}`)
  }

  const requestedGoals = readNumber(summary.requestedGoals)
  const resolvedGoals = readNumber(summary.resolvedGoals)
  const goalsWithClassicSourceRoute = readNumber(summary.goalsWithClassicSourceRoute)
  const goalsWithoutClassicSourceRoute = readNumber(summary.goalsWithoutClassicSourceRoute)
  const goalsWithMemSparqlConsistentRoute = readNumber(summary.goalsWithMemSparqlConsistentRoute)

  if (requestedGoals !== items.length) {
    failures.push(`${bundledIndexPath}: summary.requestedGoals must match item count`)
  }
  if (resolvedGoals !== items.length) {
    failures.push(`${bundledIndexPath}: summary.resolvedGoals must match item count`)
  }
  if ((goalsWithClassicSourceRoute ?? 0) < minimumClassicSourceRoutes) {
    failures.push(`${bundledIndexPath}: expected at least ${minimumClassicSourceRoutes} classic source routes`)
  }
  if (goalsWithoutClassicSourceRoute !== 0) {
    failures.push(`${bundledIndexPath}: public runtime index must not contain classic source gaps`)
  }
  if ((goalsWithMemSparqlConsistentRoute ?? 0) < minimumMemConsistentRoutes) {
    failures.push(`${bundledIndexPath}: expected at least ${minimumMemConsistentRoutes} MEM-consistent routes`)
  }

  const itemsByGoalId = new Map<string, Record<string, unknown>>()
  items.forEach((item) => {
    const goal = asRecord(item.goal)
    const goalId = readString(goal.id)
    if (goalId !== null) itemsByGoalId.set(goalId, item)
  })

  requiredMemPocGoals.forEach((goalId) => {
    const item = itemsByGoalId.get(goalId)
    if (!item) {
      failures.push(`${bundledIndexPath}: missing required MEM/FWU PoC goal ${goalId}`)
      return
    }
    if (item.sourceRationaleStatus !== 'classic_source_reviewed') {
      failures.push(`${bundledIndexPath}: ${goalId} must have a reviewed classic source route`)
    }
    const classicSourceRoute = asRecord(item.classicSourceRoute)
    if (Object.keys(classicSourceRoute).length === 0) {
      failures.push(`${bundledIndexPath}: ${goalId} must include classicSourceRoute`)
    }
    const memSparqlRoute = asRecord(item.memSparqlRoute)
    if (memSparqlRoute.status !== 'mem_sparql_consistent') {
      failures.push(`${bundledIndexPath}: ${goalId} must keep the MEM/FWU PoC route consistent`)
    }
  })
}

const failures: string[] = []
const bundledIndex = readIndex(bundledIndexPath, failures)
const publicIndex = readIndex(publicIndexPath, failures)

if (bundledIndex !== null && publicIndex !== null && bundledIndex.raw !== publicIndex.raw) {
  failures.push(
    `${bundledIndexPath} and ${publicIndexPath} differ; regenerate with npm run quality:goal-source-rationales:math-public`,
  )
}

if (bundledIndex !== null) {
  validateIndex(bundledIndex.payload, failures)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    [
      'Goal source-rationale runtime index check passed.',
      `items=${(asRecord(bundledIndex?.payload.summary).resolvedGoals ?? 'unknown')}`,
      `sha256=${bundledIndex === null ? 'missing' : sha256(bundledIndex.raw).slice(0, 12)}`,
    ].join(' '),
  )
}
