import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface RuntimeIndexConfig {
  label: string
  landscapePath: string
  publicIndexPath: string
  minimumItemCount: number
  minimumClassicSourceRoutes: number
  minimumMemConsistentRoutes: number
  requiredMemPocGoals: string[]
  expectedRequest: {
    goalSelection: string
    jurisdiction: string
    includeMemSparql: boolean
    audience: string
  }
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const runtimeIndexes: RuntimeIndexConfig[] = [
  {
    label: 'Mathematik',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    publicIndexPath: 'app/public/data/goal-source-rationales-math-public.json',
    minimumItemCount: 600,
    minimumClassicSourceRoutes: 600,
    minimumMemConsistentRoutes: 150,
    requiredMemPocGoals: [
      'a075ae99-7669-563d-807a-f91b119c020a',
      '09f47964-2cd0-410e-93ee-9632b582fc91',
      'b1dcc191-d046-50de-984a-ee5c17157628',
    ],
    expectedRequest: {
      goalSelection: 'source-backed-relevant-leaves',
      jurisdiction: 'DE-BY',
      includeMemSparql: true,
      audience: 'plain',
    },
  },
  {
    label: 'Physik',
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    publicIndexPath: 'app/public/data/goal-source-rationales-physics-public.json',
    minimumItemCount: 350,
    minimumClassicSourceRoutes: 350,
    minimumMemConsistentRoutes: 0,
    requiredMemPocGoals: [],
    expectedRequest: {
      goalSelection: 'source-backed-relevant-leaves',
      jurisdiction: 'DE-HE',
      includeMemSparql: false,
      audience: 'plain',
    },
  },
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

function readIndex(
  repoPath: string,
  failures: string[],
): { raw: string; payload: Record<string, unknown> } | null {
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

function validateIndex(
  config: RuntimeIndexConfig,
  payload: Record<string, unknown>,
  canonicalGoalsById: ReadonlyMap<string, Record<string, unknown>>,
  failures: string[],
): void {
  const request = asRecord(payload.request)
  const summary = asRecord(payload.summary)
  const items = Array.isArray(payload.items) ? payload.items.map(asRecord) : []
  const pathLabel = config.publicIndexPath

  if (payload.schemaVersion !== 1) {
    failures.push(`${pathLabel}: schemaVersion must be 1`)
  }
  if (request.goalSelection !== config.expectedRequest.goalSelection) {
    failures.push(`${pathLabel}: request.goalSelection must be ${config.expectedRequest.goalSelection}`)
  }
  if (request.landscapePath !== config.landscapePath) {
    failures.push(`${pathLabel}: request.landscapePath must be ${config.landscapePath}`)
  }
  if (request.jurisdiction !== config.expectedRequest.jurisdiction) {
    failures.push(`${pathLabel}: request.jurisdiction must be ${config.expectedRequest.jurisdiction}`)
  }
  if (Boolean(request.includeMemSparql) !== config.expectedRequest.includeMemSparql) {
    failures.push(`${pathLabel}: request.includeMemSparql must be ${config.expectedRequest.includeMemSparql}`)
  }
  if (request.audience !== config.expectedRequest.audience) {
    failures.push(`${pathLabel}: request.audience must be ${config.expectedRequest.audience}`)
  }

  if (items.length < config.minimumItemCount) {
    failures.push(`${pathLabel}: expected at least ${config.minimumItemCount} items, found ${items.length}`)
  }

  const requestedGoals = readNumber(summary.requestedGoals)
  const resolvedGoals = readNumber(summary.resolvedGoals)
  const goalsWithClassicSourceRoute = readNumber(summary.goalsWithClassicSourceRoute)
  const goalsWithoutClassicSourceRoute = readNumber(summary.goalsWithoutClassicSourceRoute)
  const goalsWithMemSparqlConsistentRoute = readNumber(summary.goalsWithMemSparqlConsistentRoute)

  if (requestedGoals !== items.length) {
    failures.push(`${pathLabel}: summary.requestedGoals must match item count`)
  }
  if (resolvedGoals !== items.length) {
    failures.push(`${pathLabel}: summary.resolvedGoals must match item count`)
  }
  if ((goalsWithClassicSourceRoute ?? 0) < config.minimumClassicSourceRoutes) {
    failures.push(`${pathLabel}: expected at least ${config.minimumClassicSourceRoutes} classic source routes`)
  }
  if (goalsWithoutClassicSourceRoute !== 0) {
    failures.push(`${pathLabel}: public runtime index must not contain classic source gaps`)
  }
  if ((goalsWithMemSparqlConsistentRoute ?? 0) < config.minimumMemConsistentRoutes) {
    failures.push(`${pathLabel}: expected at least ${config.minimumMemConsistentRoutes} MEM-consistent routes`)
  }

  const itemsByGoalId = new Map<string, Record<string, unknown>>()
  items.forEach((item) => {
    const goal = asRecord(item.goal)
    const goalId = readString(goal.id)
    if (goalId === null) return
    itemsByGoalId.set(goalId, item)
    const canonicalGoal = canonicalGoalsById.get(goalId)
    if (!canonicalGoal) {
      failures.push(`${pathLabel}: goal ${goalId} is missing from ${config.landscapePath}`)
      return
    }
    if (goal.title !== canonicalGoal.title) {
      failures.push(`${pathLabel}: goal ${goalId} title is stale relative to ${config.landscapePath}`)
    }
    if (goal.description !== canonicalGoal.description) {
      failures.push(`${pathLabel}: goal ${goalId} description is stale relative to ${config.landscapePath}`)
    }
  })

  config.requiredMemPocGoals.forEach((goalId) => {
    const item = itemsByGoalId.get(goalId)
    if (!item) {
      failures.push(`${pathLabel}: missing required MEM/FWU PoC goal ${goalId}`)
      return
    }
    if (item.sourceRationaleStatus !== 'classic_source_reviewed') {
      failures.push(`${pathLabel}: ${goalId} must have a reviewed classic source route`)
    }
    const classicSourceRoute = asRecord(item.classicSourceRoute)
    if (Object.keys(classicSourceRoute).length === 0) {
      failures.push(`${pathLabel}: ${goalId} must include classicSourceRoute`)
    }
    const memSparqlRoute = asRecord(item.memSparqlRoute)
    if (memSparqlRoute.status !== 'mem_sparql_consistent') {
      failures.push(`${pathLabel}: ${goalId} must keep the MEM/FWU PoC route consistent`)
    }
  })
}

const failures: string[] = []
const passedSummaries: string[] = []

runtimeIndexes.forEach((config) => {
  const publicIndex = readIndex(config.publicIndexPath, failures)
  const canonicalLandscape = readIndex(config.landscapePath, failures)
  if (publicIndex !== null) {
    const canonicalGoals = canonicalLandscape === null || !Array.isArray(canonicalLandscape.payload.goals)
      ? []
      : canonicalLandscape.payload.goals.map(asRecord)
    const canonicalGoalsById = new Map(canonicalGoals.flatMap((goal) => {
      const goalId = readString(goal.id)
      return goalId === null ? [] : [[goalId, goal] as const]
    }))
    validateIndex(config, publicIndex.payload, canonicalGoalsById, failures)
    const summary = asRecord(publicIndex.payload.summary)
    passedSummaries.push(
      [
        `${config.label}:`,
        `items=${summary.resolvedGoals ?? 'unknown'}`,
        `sha256=${sha256(publicIndex.raw).slice(0, 12)}`,
      ].join(' '),
    )
  }
})

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    [
      'Goal source-rationale runtime index check passed.',
      ...passedSummaries,
    ].join(' '),
  )
}
