import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { goalMatchesFilter } from '../src/utils/goalFilters'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

interface TrackerStateRecord {
  jurisdiction: string
  displayName: string
  mappingFiles?: string[]
}

interface TrackerRecord {
  landscapePath: string
  states: TrackerStateRecord[]
}

interface GoalMappingRecord {
  canonicalGoalId?: string
}

interface GoalMappingFile {
  mappings?: GoalMappingRecord[]
}

interface CompositionViewNode {
  kind?: string
  goalId?: string
  children?: CompositionViewNode[]
}

interface CompositionViewRecord {
  rootNodes?: CompositionViewNode[]
}

type GoalFilterable = Pick<LearningGoal, 'tags' | 'applicability'>

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const trackerPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json')
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return !Array.isArray(goal.contains) || goal.contains.length === 0
}

function goalIsVisibleForJurisdiction(goal: GoalFilterable | undefined, jurisdiction: string): boolean {
  if (!goal) return false
  return goalMatchesFilter(
    {
      tags: goal.tags,
      applicability: goal.applicability,
    },
    jurisdiction,
  )
}

function collectCanonicalGoalIds(nodes: CompositionViewNode[] | undefined, target: Set<string>) {
  for (const node of nodes ?? []) {
    if (node.kind === 'canonicalSubtree' && typeof node.goalId === 'string' && node.goalId.trim()) {
      target.add(node.goalId.trim())
    }
    collectCanonicalGoalIds(node.children, target)
  }
}

function loadMappedCanonicalGoalIds(mappingFiles: string[] | undefined): string[] {
  const ids = new Set<string>()
  for (const relPath of mappingFiles ?? []) {
    const file = resolve(repoRoot, relPath)
    if (!existsSync(file)) continue
    const data = loadJson<GoalMappingFile>(file)
    for (const row of data.mappings ?? []) {
      if (typeof row.canonicalGoalId === "string" && row.canonicalGoalId.trim()) {
        ids.add(row.canonicalGoalId.trim())
      }
    }
  }
  return Array.from(ids).sort()
}

function loadViewCanonicalGoalIds(jurisdiction: string): string[] {
  const refs = new Set<string>()
  for (const suffix of ['gk', 'lk']) {
    const viewPath = resolve(compositionViewDir, `${jurisdiction.toLowerCase()}-${suffix}.view.json`)
    if (!existsSync(viewPath)) continue
    const view = loadJson<CompositionViewRecord>(viewPath)
    collectCanonicalGoalIds(view.rootNodes, refs)
  }
  return Array.from(refs).sort()
}

function formatGoalList(goalIds: string[], goalById: Map<string, LearningGoal>, limit = 5): string {
  if (goalIds.length === 0) return '-'
  const labels = goalIds.slice(0, limit).map((goalId) => {
    const goal = goalById.get(goalId)
    return goal ? `${goal.title} [${goalId}]` : goalId
  })
  const suffix = goalIds.length > limit ? ` +${goalIds.length - limit}` : ''
  return `${labels.join('; ')}${suffix}`
}

function main() {
  const tracker = loadJson<TrackerRecord>(trackerPath)
  const landscape = loadJson<SkillLandscape>(resolve(repoRoot, tracker.landscapePath))
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const requestedJurisdictions = new Set(
    (process.env.JURISDICTIONS ?? '')
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean),
  )
  const states = tracker.states.filter((state) =>
    requestedJurisdictions.size === 0 || requestedJurisdictions.has(state.jurisdiction.toUpperCase()),
  )

  const rows = states.map((state) => {
    const mappedGoalIds = loadMappedCanonicalGoalIds(state.mappingFiles)
    const viewGoalIds = loadViewCanonicalGoalIds(state.jurisdiction)
    const mappedGoals = mappedGoalIds.map((goalId) => goalById.get(goalId)).filter((goal): goal is LearningGoal => !!goal)
    const mappedAtomicGoalIds = mappedGoals.filter(isAtomicGoal).map((goal) => goal.id)
    const mappedClusterGoalIds = mappedGoals.filter((goal) => !isAtomicGoal(goal)).map((goal) => goal.id)
    const applicableMappedGoalIds = mappedGoalIds.filter((goalId) =>
      goalIsVisibleForJurisdiction(goalById.get(goalId), state.jurisdiction),
    )
    const mappedViewGoalIds = viewGoalIds.filter((goalId) => mappedGoalIds.includes(goalId))
    const blockedMappedViewGoalIds = mappedViewGoalIds.filter((goalId) =>
      !goalIsVisibleForJurisdiction(goalById.get(goalId), state.jurisdiction),
    )
    const blockedMappedClusterGoalIds = mappedClusterGoalIds.filter((goalId) =>
      !goalIsVisibleForJurisdiction(goalById.get(goalId), state.jurisdiction),
    )

    return {
      jurisdiction: state.jurisdiction,
      displayName: state.displayName,
      mappedTargets: mappedGoalIds.length,
      mappedAtomicTargets: mappedAtomicGoalIds.length,
      mappedClusterTargets: mappedClusterGoalIds.length,
      applicableMappedTargets: applicableMappedGoalIds.length,
      viewRefs: viewGoalIds.length,
      mappedViewRefs: mappedViewGoalIds.length,
      blockedMappedViewRefs: blockedMappedViewGoalIds.length,
      blockedMappedClusters: blockedMappedClusterGoalIds.length,
      blockedMappedViewRefExamples: formatGoalList(blockedMappedViewGoalIds, goalById),
    }
  })

  rows.sort((left, right) => {
    return right.blockedMappedViewRefs - left.blockedMappedViewRefs
      || right.blockedMappedClusters - left.blockedMappedClusters
      || right.mappedClusterTargets - left.mappedClusterTargets
      || left.jurisdiction.localeCompare(right.jurisdiction)
  })

  console.log('# Canonical Math State Visibility-Gap Audit')
  console.log('')
  console.log(
    'Mapped targets that are mostly clusters but not visible for the state are a strong signal that learner-facing counts are blocked by compiled applicability, not by missing composition views alone.',
  )
  console.log('')
  console.log('| State | Mapped targets | Atomic | Cluster | Applicable mapped | View refs | Mapped view refs | Blocked mapped view refs | Blocked mapped clusters | Sample blocked mapped view refs |')
  console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |')
  for (const row of rows) {
    console.log(
      `| \`${row.jurisdiction}\` ${row.displayName} | ` +
      `\`${row.mappedTargets}\` | ` +
      `\`${row.mappedAtomicTargets}\` | ` +
      `\`${row.mappedClusterTargets}\` | ` +
      `\`${row.applicableMappedTargets}\` | ` +
      `\`${row.viewRefs}\` | ` +
      `\`${row.mappedViewRefs}\` | ` +
      `\`${row.blockedMappedViewRefs}\` | ` +
      `\`${row.blockedMappedClusters}\` | ` +
      `${row.blockedMappedViewRefExamples} |`,
    )
  }
}

main()
