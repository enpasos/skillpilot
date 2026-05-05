import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'
import type { ApplicabilityFinding } from './applicabilityCompiler'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4'
type SemanticReviewStatus = 'atomic' | 'needs_developer_review' | 'non_atomic'

interface QualityRuleDefinition {
  id: string
  label: string
  category: 'graph' | 'route' | 'assessment' | 'review' | 'view' | 'applicability'
  maturityTarget: MaturityLevel
  description: string
}

interface RuleResult {
  id: string
  status: RuleStatus
  summary: string
  metrics?: Record<string, number>
  details?: string[]
}

interface ScopeStatus {
  scopeId: string
  label: string
  maturity: MaturityLevel
  selectedAtomicGoals: number
  rules: RuleResult[]
}

interface CurriculumStatus {
  landscapeId: string
  title: string
  subject?: string
  frameworkId?: string
  path: string
  maturity: MaturityLevel
  goals: number
  atomicGoals: number
  clusterGoals: number
  scopes: ScopeStatus[]
  rules: RuleResult[]
}

interface StatusDocument {
  schemaVersion: 1
  rulesVersion: 'curriculum-quality-v1'
  generatedAt: string
  generatedBy: string
  sources: {
    canonicalRoot: string
    semanticAtomicityRoot: string
    compositionViewRoot: string
    acceptedWarningsPath: string
  }
  summary: {
    curricula: number
    maturity: Record<MaturityLevel, number>
    ruleStatus: Record<RuleStatus, number>
  }
  ruleCatalog: QualityRuleDefinition[]
  curricula: CurriculumStatus[]
}

interface ReviewConfig {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
  scope: {
    label: string
    rootGoalIds?: string[]
    leafGoalIds?: string[]
  }
}

interface ReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: SemanticReviewStatus
  semanticAtomic: boolean | null
  reviewedAt: string
  reviewer: string
  reason: string
}

interface AcceptedWarningEntry {
  code: string
  landscapeId: string
  goalId?: string
  dimension?: string
  value?: string
  rationale?: string
}

interface RouteProfile {
  profileId: string
  landscapeId: string
  label: string
  motivationAnchorGoalIds: string[]
  terminalGoalIds?: string[]
  terminalAutonomyClusterIds: string[]
  goalSelector: (goal: LearningGoal) => boolean
  clusterSelector: (goal: LearningGoal) => boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const semanticAtomicityRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/semantic-atomicity')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const acceptedWarningsPath = resolve(repoRoot, 'docs/qa-ci/applicability-accepted-warnings.json')
const statusDir = resolve(repoRoot, 'docs/qa-ci/status')
const statusJsonPath = join(statusDir, 'curriculum-quality-status.json')
const statusMarkdownPath = join(statusDir, 'curriculum-quality-status.md')

const CANONICAL_GYM_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const CANONICAL_GYM_MATH_SEK1_PRACTICE_CLUSTER_ID = 'bfc4fe23-bfa4-4836-9bd2-793f4305d682'
const CANONICAL_GYM_MATH_SEK1_CAPSTONE_GOAL_ID = '30b62966-80d0-45f1-bdd9-b4fb815c7111'
const CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
const CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS = [
  '28b45b93-11e1-5a96-97a1-4cfee171802b',
  'c25158fc-4860-59b2-8ef0-dca355f3a8b1',
  '14b19ee4-364e-50bd-b6a3-499471356ef3',
  'f24096c6-6ca0-5c15-a2f5-7bdaec789a8d',
  '57f07e66-800c-5f7e-99ab-11dd6e520eb1',
  'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1',
]

const ruleCatalog: QualityRuleDefinition[] = [
  {
    id: 'CQR-001',
    label: 'Basic graph integrity',
    category: 'graph',
    maturityTarget: 'M0',
    description: 'Goal IDs, local references, self-reference guards, and direct DAG checks are clean.',
  },
  {
    id: 'CQR-002',
    label: 'Explicit type consistency',
    category: 'graph',
    maturityTarget: 'M0',
    description: 'Stored type metadata agrees with structural atomic/cluster classification.',
  },
  {
    id: 'CQR-101',
    label: 'Effective full route coverage',
    category: 'route',
    maturityTarget: 'M1',
    description: 'Configured route scopes connect motivation anchors to terminal autonomy goals through effective requires.',
  },
  {
    id: 'CQR-102',
    label: 'Atomic direct route coverage',
    category: 'route',
    maturityTarget: 'M2',
    description: 'Configured route scopes connect motivation anchors to terminal autonomy goals through direct atomic requires.',
  },
  {
    id: 'CQR-103',
    label: 'No scoped cluster requires',
    category: 'route',
    maturityTarget: 'M2',
    description: 'Configured route scopes no longer depend on cluster-level requires for ordinary didactic sequencing.',
  },
  {
    id: 'CQR-201',
    label: 'Terminal autonomy exam data',
    category: 'assessment',
    maturityTarget: 'M3',
    description: 'Terminal autonomy goals in configured scopes are exam-mode-capable or explicitly reviewed.',
  },
  {
    id: 'CQR-301',
    label: 'Semantic atomicity review freshness',
    category: 'review',
    maturityTarget: 'M4',
    description: 'Configured semantic-atomicity ledgers are complete, current, and free of unresolved review queue entries.',
  },
  {
    id: 'CQR-401',
    label: 'Composition view availability',
    category: 'view',
    maturityTarget: 'M4',
    description: 'The curriculum has at least one reviewed learner-facing composition view.',
  },
  {
    id: 'CQR-501',
    label: 'Applicability warning debt',
    category: 'applicability',
    maturityTarget: 'M4',
    description: 'Active applicability warnings are resolved and accepted warning records still match current findings.',
  },
]

const routeProfiles: RouteProfile[] = [
  {
    profileId: 'canonical-math-sek1',
    landscapeId: CANONICAL_GYM_MATH_LANDSCAPE_ID,
    label: 'Sekundarstufe I',
    motivationAnchorGoalIds: [CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID],
    terminalGoalIds: [CANONICAL_GYM_MATH_SEK1_CAPSTONE_GOAL_ID],
    terminalAutonomyClusterIds: [CANONICAL_GYM_MATH_SEK1_PRACTICE_CLUSTER_ID],
    goalSelector: (goal) => isAtomicGoal(goal) && isCanonicalGymMathSek1Goal(goal),
    clusterSelector: isCanonicalGymMathSek1Goal,
  },
  {
    profileId: 'canonical-math-sek2',
    landscapeId: CANONICAL_GYM_MATH_LANDSCAPE_ID,
    label: 'Sekundarstufe II',
    motivationAnchorGoalIds: [CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID],
    terminalAutonomyClusterIds: CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS,
    goalSelector: (goal) => isAtomicGoal(goal) && isCanonicalGymMathSek2Goal(goal) && !isMemoryGoal(goal),
    clusterSelector: isCanonicalGymMathSek2Goal,
  },
]

function toRepoPath(path: string): string {
  return relative(repoRoot, path).split(/[\\/]/).join('/')
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function collectFiles(root: string, predicate: (fileName: string) => boolean): string[] {
  if (!existsSync(root)) return []

  const result: string[] = []
  const visit = (directory: string) => {
    const entries = readdirSync(directory, { withFileTypes: true })
    entries.forEach((entry) => {
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
        return
      }
      if (entry.isFile() && predicate(entry.name)) {
        result.push(absolutePath)
      }
    })
  }

  visit(root)
  return result.sort((left, right) => left.localeCompare(right))
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return (goal.contains?.length ?? 0) === 0
}

function isSemanticAtomicityRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (isMemoryGoal(goal)) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function isMemoryGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isCanonicalGymMathSek1Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_MATH_SEK1_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('phase:SekI')) return true
  const legacyPhase = (goal as { phase?: string }).phase
  if (/^J\d{1,2}$/.test(goal.dimensionTags?.phase ?? legacyPhase ?? '')) return true

  const topicCode = goal.dimensionTags?.topicCode ?? goal.themenfeld ?? ''
  return topicCode.includes('SEK1')
}

function isCanonicalGymMathSek2Goal(goal: LearningGoal): boolean {
  if (goal.id === CANONICAL_GYM_MATH_SEK2_MOTIVATION_GOAL_ID) return true
  if (goal.tags?.includes('phase:SekII')) return true

  const legacyPhase = (goal as { phase?: string }).phase
  if (['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase ?? legacyPhase ?? '')) return true

  const topicCode = goal.dimensionTags?.topicCode ?? goal.themenfeld ?? ''
  return topicCode.includes('SEK2')
}

function parseReference(raw: string, currentLandscapeId: string): { landscapeId: string; goalId: string } {
  if (raw.includes(':')) {
    const [landscapeId, goalId] = raw.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  return { landscapeId: currentLandscapeId, goalId: raw }
}

function buildParentByChild(goals: LearningGoal[]): Map<string, string[]> {
  const parentByChild = new Map<string, string[]>()
  goals.forEach((goal) => {
    goal.contains?.forEach((childId) => {
      const parsedChild = parseReference(childId, '')
      const childGoalId = parsedChild.goalId
      const parents = parentByChild.get(childGoalId) ?? []
      parents.push(goal.id)
      parentByChild.set(childGoalId, parents)
    })
  })
  return parentByChild
}

function buildDirectRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
  const edges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    const localRequires = (goal.requires ?? [])
      .map((ref) => parseReference(ref, landscape.landscapeId))
      .filter((ref) => ref.landscapeId === landscape.landscapeId)
      .map((ref) => ref.goalId)
    edges.set(goal.id, localRequires)
  })
  return edges
}

function buildAtomicDirectRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const edges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    if (!isAtomicGoal(goal)) {
      edges.set(goal.id, [])
      return
    }

    const atomicRequires = (goal.requires ?? [])
      .map((ref) => parseReference(ref, landscape.landscapeId))
      .filter((ref) => ref.landscapeId === landscape.landscapeId)
      .map((ref) => goalById.get(ref.goalId))
      .filter((requiredGoal): requiredGoal is LearningGoal => !!requiredGoal && isAtomicGoal(requiredGoal))
      .map((requiredGoal) => requiredGoal.id)
    edges.set(goal.id, atomicRequires)
  })
  return edges
}

function buildEffectiveRequiresEdges(landscape: LearningLandscape): Map<string, string[]> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const parentByChild = buildParentByChild(landscape.goals)
  const directEdges = buildDirectRequiresEdges(landscape)
  const ancestorCache = new Map<string, string[]>()

  const ancestorsOf = (goalId: string): string[] => {
    const cached = ancestorCache.get(goalId)
    if (cached) return cached

    const result: string[] = []
    const seen = new Set<string>()
    const stack = [...(parentByChild.get(goalId) ?? [])]
    while (stack.length > 0) {
      const current = stack.pop()
      if (!current || seen.has(current)) continue
      seen.add(current)
      result.push(current)
      stack.push(...(parentByChild.get(current) ?? []))
    }
    ancestorCache.set(goalId, result)
    return result
  }

  const effectiveEdges = new Map<string, string[]>()
  landscape.goals.forEach((goal) => {
    const requires = new Set(directEdges.get(goal.id) ?? [])
    ancestorsOf(goal.id).forEach((ancestorId) => {
      const ancestor = goalById.get(ancestorId)
      ancestor?.requires?.forEach((rawRef) => {
        const ref = parseReference(rawRef, landscape.landscapeId)
        if (ref.landscapeId === landscape.landscapeId) requires.add(ref.goalId)
      })
    })
    effectiveEdges.set(goal.id, Array.from(requires))
  })

  return effectiveEdges
}

function buildReverseEdges(edgeMap: Map<string, string[]>): Map<string, string[]> {
  const reverse = new Map<string, string[]>()
  edgeMap.forEach((targets, sourceId) => {
    if (!reverse.has(sourceId)) reverse.set(sourceId, [])
    targets.forEach((targetId) => {
      const existing = reverse.get(targetId) ?? []
      existing.push(sourceId)
      reverse.set(targetId, existing)
    })
  })
  return reverse
}

function hasPath(startId: string, targetId: string, edgeMap: Map<string, string[]>): boolean {
  if (startId === targetId) return true
  const seen = new Set<string>()
  const stack = [startId]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || seen.has(current)) continue
    seen.add(current)

    for (const next of edgeMap.get(current) ?? []) {
      if (next === targetId) return true
      if (!seen.has(next)) stack.push(next)
    }
  }

  return false
}

function findCycle(edgeMap: Map<string, string[]>): string[] | null {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const stack: string[] = []

  const visit = (goalId: string): string[] | null => {
    if (visiting.has(goalId)) {
      const cycleStart = stack.indexOf(goalId)
      return stack.slice(Math.max(0, cycleStart)).concat(goalId)
    }
    if (visited.has(goalId)) return null

    visiting.add(goalId)
    stack.push(goalId)
    for (const nextId of edgeMap.get(goalId) ?? []) {
      const cycle = visit(nextId)
      if (cycle) return cycle
    }
    stack.pop()
    visiting.delete(goalId)
    visited.add(goalId)
    return null
  }

  for (const goalId of edgeMap.keys()) {
    const cycle = visit(goalId)
    if (cycle) return cycle
  }
  return null
}

function formatGoal(goal: LearningGoal | undefined, goalId: string): string {
  return goal ? `${goal.title} [${goalId}]` : goalId
}

function makeRule(
  id: string,
  status: RuleStatus,
  summary: string,
  metrics?: Record<string, number>,
  details?: string[],
): RuleResult {
  return {
    id,
    status,
    summary,
    ...(metrics ? { metrics } : {}),
    ...(details && details.length > 0 ? { details: details.slice(0, 20) } : {}),
  }
}

function evaluateGraphIntegrity(landscape: LearningLandscape, globalGoalIds: Set<string>): RuleResult {
  const errors: string[] = []
  const goalById = new Map<string, LearningGoal>()

  landscape.goals.forEach((goal) => {
    if (goalById.has(goal.id)) {
      errors.push(`Duplicate goal id ${goal.id}`)
    } else {
      goalById.set(goal.id, goal)
    }
  })

  const requireEdges = new Map<string, string[]>()
  const containsEdges = new Map<string, string[]>()

  landscape.goals.forEach((goal) => {
    const localRequires: string[] = []
    const localContains: string[] = []

    goal.requires?.forEach((rawRef) => {
      const ref = parseReference(rawRef, landscape.landscapeId)
      if (ref.goalId === goal.id && ref.landscapeId === landscape.landscapeId) {
        errors.push(`${formatGoal(goal, goal.id)} requires itself`)
      }
      if (ref.landscapeId === landscape.landscapeId && !goalById.has(ref.goalId) && !globalGoalIds.has(ref.goalId)) {
        errors.push(`${formatGoal(goal, goal.id)} requires missing local goal ${ref.goalId}`)
      }
      if (ref.landscapeId === landscape.landscapeId && goalById.has(ref.goalId)) localRequires.push(ref.goalId)
    })

    goal.contains?.forEach((rawRef) => {
      const ref = parseReference(rawRef, landscape.landscapeId)
      if (ref.goalId === goal.id && ref.landscapeId === landscape.landscapeId) {
        errors.push(`${formatGoal(goal, goal.id)} contains itself`)
      }
      if (ref.landscapeId === landscape.landscapeId && !goalById.has(ref.goalId) && !globalGoalIds.has(ref.goalId)) {
        errors.push(`${formatGoal(goal, goal.id)} contains missing local goal ${ref.goalId}`)
      }
      if (ref.landscapeId === landscape.landscapeId && goalById.has(ref.goalId)) localContains.push(ref.goalId)
    })

    requireEdges.set(goal.id, localRequires)
    containsEdges.set(goal.id, localContains)
  })

  const requiresCycle = findCycle(requireEdges)
  if (requiresCycle) errors.push(`Direct requires cycle: ${requiresCycle.join(' -> ')}`)

  const containsCycle = findCycle(containsEdges)
  if (containsCycle) errors.push(`Contains cycle: ${containsCycle.join(' -> ')}`)

  return makeRule(
    'CQR-001',
    errors.length === 0 ? 'pass' : 'fail',
    errors.length === 0 ? 'Basic graph integrity checks pass.' : `${errors.length} graph integrity issue(s).`,
    {
      goals: landscape.goals.length,
      localReferenceIssues: errors.length,
    },
    errors,
  )
}

function evaluateTypeConsistency(landscape: LearningLandscape): RuleResult {
  const mismatches = landscape.goals.filter((goal) => {
    if (!goal.type) return false
    const canonicalType = isAtomicGoal(goal) ? 'atomic' : 'cluster'
    return goal.type !== canonicalType
  })

  return makeRule(
    'CQR-002',
    mismatches.length === 0 ? 'pass' : 'fail',
    mismatches.length === 0 ? 'Explicit type metadata matches graph structure.' : `${mismatches.length} explicit type mismatch(es).`,
    { mismatches: mismatches.length },
    mismatches.map((goal) => `${formatGoal(goal, goal.id)} declares ${goal.type}`),
  )
}

function evaluateRouteProfile(landscape: LearningLandscape, profile: RouteProfile): ScopeStatus {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const selectedGoals = landscape.goals.filter(profile.goalSelector)
  const effectiveEdges = buildEffectiveRequiresEdges(landscape)
  const reverseEffectiveEdges = buildReverseEdges(effectiveEdges)
  const atomicDirectEdges = buildAtomicDirectRequiresEdges(landscape)
  const reverseAtomicDirectEdges = buildReverseEdges(atomicDirectEdges)
  const terminalAutonomyGoals = profile.terminalAutonomyClusterIds
    .flatMap((clusterId) => goalById.get(clusterId)?.contains ?? [])
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal)
    .filter(isAtomicGoal)
  const terminalGoalIds = profile.terminalGoalIds && profile.terminalGoalIds.length > 0
    ? profile.terminalGoalIds
    : terminalAutonomyGoals.map((goal) => goal.id)

  const missingEffectiveMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasPath(goal.id, anchorId, effectiveEdges)))
  const missingEffectiveTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasPath(goal.id, terminalId, reverseEffectiveEdges)))

  const missingDirectMotivation = selectedGoals.filter((goal) =>
    !profile.motivationAnchorGoalIds.some((anchorId) => hasPath(goal.id, anchorId, atomicDirectEdges)))
  const missingDirectTerminal = selectedGoals.filter((goal) =>
    !terminalGoalIds.some((terminalId) => hasPath(goal.id, terminalId, reverseAtomicDirectEdges)))

  const scopedClusterRequires = landscape.goals.filter((goal) =>
    !isAtomicGoal(goal) && profile.clusterSelector(goal) && (goal.requires?.length ?? 0) > 0)

  const terminalAutonomyGoalsWithoutExamData = terminalAutonomyGoals.filter((goal) => !goal.examData)

  const rules: RuleResult[] = [
    makeRule(
      'CQR-101',
      missingEffectiveMotivation.length === 0 && missingEffectiveTerminal.length === 0 ? 'pass' : 'fail',
      missingEffectiveMotivation.length === 0 && missingEffectiveTerminal.length === 0
        ? 'Effective route coverage is complete for the configured scope.'
        : 'Effective route coverage has missing route segments.',
      {
        selectedAtomicGoals: selectedGoals.length,
        missingMotivationPath: missingEffectiveMotivation.length,
        missingTerminalPath: missingEffectiveTerminal.length,
      },
      [
        ...missingEffectiveMotivation.map((goal) => `No effective motivation path: ${formatGoal(goal, goal.id)}`),
        ...missingEffectiveTerminal.map((goal) => `No effective terminal path: ${formatGoal(goal, goal.id)}`),
      ],
    ),
    makeRule(
      'CQR-102',
      missingDirectMotivation.length === 0 && missingDirectTerminal.length === 0 ? 'pass' : 'warn',
      missingDirectMotivation.length === 0 && missingDirectTerminal.length === 0
        ? 'Direct atomic route coverage is complete for the configured scope.'
        : 'Direct atomic route coverage still needs migration work.',
      {
        selectedAtomicGoals: selectedGoals.length,
        missingDirectMotivationPath: missingDirectMotivation.length,
        missingDirectTerminalPath: missingDirectTerminal.length,
      },
      [
        ...missingDirectMotivation.map((goal) => `No direct atomic motivation path: ${formatGoal(goal, goal.id)}`),
        ...missingDirectTerminal.map((goal) => `No direct atomic terminal path: ${formatGoal(goal, goal.id)}`),
      ],
    ),
    makeRule(
      'CQR-103',
      scopedClusterRequires.length === 0 ? 'pass' : 'warn',
      scopedClusterRequires.length === 0
        ? 'No scoped cluster-level requires remain.'
        : `${scopedClusterRequires.length} scoped cluster-level requires remain.`,
      { scopedClusterRequires: scopedClusterRequires.length },
      scopedClusterRequires.map((goal) => `${formatGoal(goal, goal.id)} has ${goal.requires.length} requires`),
    ),
    makeRule(
      'CQR-201',
      terminalAutonomyGoalsWithoutExamData.length === 0 ? 'pass' : 'warn',
      terminalAutonomyGoalsWithoutExamData.length === 0
        ? 'All configured terminal autonomy goals have examData.'
        : `${terminalAutonomyGoalsWithoutExamData.length} terminal autonomy goal(s) lack examData.`,
      {
        terminalAutonomyGoals: terminalAutonomyGoals.length,
        terminalAutonomyGoalsWithExamData: terminalAutonomyGoals.length - terminalAutonomyGoalsWithoutExamData.length,
        terminalAutonomyGoalsWithoutExamData: terminalAutonomyGoalsWithoutExamData.length,
      },
      terminalAutonomyGoalsWithoutExamData.map((goal) => `Missing examData: ${formatGoal(goal, goal.id)}`),
    ),
  ]

  return {
    scopeId: profile.profileId,
    label: profile.label,
    selectedAtomicGoals: selectedGoals.length,
    maturity: deriveScopeMaturity(rules),
    rules,
  }
}

function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function collectScopeGoalIds(rootGoalIds: string[], goalById: Map<string, LearningGoal>): Set<string> {
  const result = new Set<string>()
  const visiting = new Set<string>()

  const visit = (goalId: string) => {
    if (result.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) return
    visiting.add(goalId)
    result.add(goalId)
    goal.contains?.forEach(visit)
    visiting.delete(goalId)
  }

  rootGoalIds.forEach(visit)
  return result
}

function parseReviewRecords(path: string): { records: ReviewRecord[]; parseErrors: string[] } {
  if (!existsSync(path)) return { records: [], parseErrors: [`Missing review file: ${toRepoPath(path)}`] }

  const parseErrors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as ReviewRecord]
      } catch (error) {
        parseErrors.push(`Line ${lineNumber}: ${(error as Error).message}`)
        return []
      }
    })
  return { records, parseErrors }
}

function evaluateSemanticAtomicity(landscape: LearningLandscape, configs: ReviewConfig[]): RuleResult {
  if (configs.length === 0) {
    return makeRule('CQR-301', 'not_configured', 'No semantic atomicity review config is registered for this curriculum.')
  }

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  let leafGoals = 0
  let atomic = 0
  let needsDeveloperReview = 0
  let nonAtomic = 0
  let missing = 0
  let stale = 0
  let obsolete = 0
  const details: string[] = []

  configs.forEach((config) => {
    const scopeGoalIds = Array.isArray(config.scope.leafGoalIds) && config.scope.leafGoalIds.length > 0
      ? new Set(config.scope.leafGoalIds)
      : collectScopeGoalIds(config.scope.rootGoalIds ?? [], goalById)
    const scopedLeafGoals = Array.from(scopeGoalIds)
      .map((goalId) => goalById.get(goalId))
      .filter((goal): goal is LearningGoal => !!goal && isAtomicGoal(goal) && isSemanticAtomicityRelevantGoal(goal))
    const scopedLeafGoalIds = new Set(scopedLeafGoals.map((goal) => goal.id))
    const fingerprintsByGoalId = new Map(scopedLeafGoals.map((goal) => [goal.id, fingerprintGoal(goal, config.ruleVersion)]))
    const reviewPath = resolve(repoRoot, config.reviewPath)
    const { records, parseErrors } = parseReviewRecords(reviewPath)
    const recordsByGoalId = new Map(records.map((record) => [record.goalId, record]))

    leafGoals += scopedLeafGoals.length
    parseErrors.forEach((issue) => details.push(`${config.reviewId}: ${issue}`))

    scopedLeafGoals.forEach((goal) => {
      const record = recordsByGoalId.get(goal.id)
      if (!record) {
        missing += 1
        if (details.length < 20) details.push(`${config.reviewId}: missing ${formatGoal(goal, goal.id)}`)
        return
      }
      const expectedFingerprint = fingerprintsByGoalId.get(goal.id)
      if (record.fingerprint !== expectedFingerprint) {
        stale += 1
        if (details.length < 20) details.push(`${config.reviewId}: stale ${formatGoal(goal, goal.id)}`)
        return
      }
      if (record.status === 'atomic') atomic += 1
      if (record.status === 'needs_developer_review') needsDeveloperReview += 1
      if (record.status === 'non_atomic') nonAtomic += 1
    })

    records.forEach((record) => {
      if (!scopedLeafGoalIds.has(record.goalId)) obsolete += 1
    })
  })

  const unresolved = missing + stale + needsDeveloperReview + nonAtomic + obsolete
  return makeRule(
    'CQR-301',
    unresolved === 0 ? 'pass' : 'warn',
    unresolved === 0
      ? 'Semantic atomicity review ledgers are current and fully accepted.'
      : 'Semantic atomicity review still has missing, stale, or unresolved entries.',
    {
      configs: configs.length,
      leafGoals,
      atomic,
      needsDeveloperReview,
      nonAtomic,
      missing,
      stale,
      obsolete,
    },
    details,
  )
}

function readSemanticConfigs(): Map<string, ReviewConfig[]> {
  const configsByLandscapeId = new Map<string, ReviewConfig[]>()
  collectFiles(semanticAtomicityRoot, (fileName) => /\.config\.json$/i.test(fileName)).forEach((file) => {
    const config = loadJson<ReviewConfig>(file)
    const existing = configsByLandscapeId.get(config.landscapeId) ?? []
    existing.push(config)
    configsByLandscapeId.set(config.landscapeId, existing)
  })
  return configsByLandscapeId
}

function readCompositionViewCountsByLandscapeId(): Map<string, number> {
  const counts = new Map<string, number>()
  collectFiles(compositionViewRoot, (fileName) => /\.view\.json$/i.test(fileName)).forEach((file) => {
    const parsed = loadJson<{ landscapeId?: string }>(file)
    if (!parsed.landscapeId) return
    counts.set(parsed.landscapeId, (counts.get(parsed.landscapeId) ?? 0) + 1)
  })
  return counts
}

function applicabilityWarningKey(
  warning: Pick<ApplicabilityFinding, 'code' | 'landscapeId' | 'goalId' | 'dimension' | 'value'>,
): string {
  return [
    warning.code,
    warning.landscapeId,
    warning.goalId ?? '',
    warning.dimension ?? '',
    warning.value ?? '',
  ].join('|')
}

function readAcceptedWarningEntries(): AcceptedWarningEntry[] {
  if (!existsSync(acceptedWarningsPath)) return []
  const registry = loadJson<{ acceptedWarnings?: AcceptedWarningEntry[] }>(acceptedWarningsPath)
  return Array.isArray(registry.acceptedWarnings) ? registry.acceptedWarnings : []
}

function readApplicabilityWarningMetricsByLandscapeId(): Map<string, Record<string, number>> {
  const acceptedEntries = readAcceptedWarningEntries()
  const acceptedKeys = new Set(acceptedEntries.map(applicabilityWarningKey))
  const currentWarningKeys = new Set<string>()
  const counts = new Map<string, Record<string, number>>()

  const ensureMetrics = (landscapeId: string): Record<string, number> => {
    const existing = counts.get(landscapeId)
    if (existing) return existing
    const metrics = {
      activeWarnings: 0,
      acceptedWarnings: 0,
      obsoleteAcceptedWarnings: 0,
    }
    counts.set(landscapeId, metrics)
    return metrics
  }

  const warningFindings = Array.from(
    new Map(
      buildApplicabilityCompilation().reports
        .flatMap((report) => report.findings)
        .filter((finding) => finding.severity === 'warning')
        .map((finding) => [
          [
            finding.severity,
            finding.code,
            finding.landscapeId,
            finding.goalId ?? '',
            finding.dimension ?? '',
            finding.value ?? '',
            finding.message,
          ].join('|'),
          finding,
        ]),
    ).values(),
  )

  warningFindings.forEach((finding) => {
    const key = applicabilityWarningKey(finding)
    currentWarningKeys.add(key)
    const metrics = ensureMetrics(finding.landscapeId)
    if (acceptedKeys.has(key)) {
      metrics.acceptedWarnings += 1
    } else {
      metrics.activeWarnings += 1
    }
  })

  acceptedEntries.forEach((entry) => {
    if (!entry.landscapeId || currentWarningKeys.has(applicabilityWarningKey(entry))) return
    ensureMetrics(entry.landscapeId).obsoleteAcceptedWarnings += 1
  })

  return counts
}

function evaluateCompositionViews(count: number): RuleResult {
  return makeRule(
    'CQR-401',
    count > 0 ? 'pass' : 'not_configured',
    count > 0 ? `${count} composition view(s) are registered.` : 'No composition view is registered for this curriculum.',
    { compositionViews: count },
  )
}

function evaluateApplicabilityWarnings(metrics: Record<string, number> | undefined): RuleResult {
  const activeWarnings = metrics?.activeWarnings ?? 0
  const acceptedWarnings = metrics?.acceptedWarnings ?? 0
  const obsoleteAcceptedWarnings = metrics?.obsoleteAcceptedWarnings ?? 0
  const unresolvedWarnings = activeWarnings + obsoleteAcceptedWarnings

  return makeRule(
    'CQR-501',
    unresolvedWarnings === 0 ? 'pass' : 'warn',
    unresolvedWarnings === 0
      ? `${acceptedWarnings} accepted applicability warning(s) are current and no active applicability warning debt is visible.`
      : `${activeWarnings} active and ${obsoleteAcceptedWarnings} obsolete accepted applicability warning(s) need review.`,
    {
      activeWarnings,
      acceptedWarnings,
      obsoleteAcceptedWarnings,
    },
  )
}

function deriveScopeMaturity(rules: RuleResult[]): MaturityLevel {
  if (rules.find((rule) => rule.id === 'CQR-101')?.status !== 'pass') return 'M0'
  if (rules.find((rule) => rule.id === 'CQR-102')?.status !== 'pass') return 'M1'
  if (rules.find((rule) => rule.id === 'CQR-103')?.status !== 'pass') return 'M1'
  if (rules.find((rule) => rule.id === 'CQR-201')?.status !== 'pass') return 'M2'
  return 'M3'
}

function deriveCurriculumMaturity(curriculumRules: RuleResult[], scopes: ScopeStatus[]): MaturityLevel {
  const graphReady = curriculumRules.find((rule) => rule.id === 'CQR-001')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-002')?.status === 'pass'
  if (!graphReady) return 'M0'

  const routeScopes = scopes.filter((scope) => scope.rules.some((rule) => rule.id === 'CQR-101'))
  if (routeScopes.length === 0) return 'M0'
  if (!routeScopes.every((scope) => scope.rules.find((rule) => rule.id === 'CQR-101')?.status === 'pass')) return 'M0'
  if (!routeScopes.every((scope) => scope.maturity === 'M2' || scope.maturity === 'M3')) return 'M1'
  if (!routeScopes.every((scope) => scope.maturity === 'M3')) return 'M2'

  const m4Ready = curriculumRules.find((rule) => rule.id === 'CQR-301')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-401')?.status === 'pass'
    && curriculumRules.find((rule) => rule.id === 'CQR-501')?.status === 'pass'
  return m4Ready ? 'M4' : 'M3'
}

function renderMarkdown(status: StatusDocument): string {
  const lines: string[] = []
  lines.push('# Curriculum Quality Status')
  lines.push('')
  lines.push(`Generated: ${status.generatedAt}`)
  lines.push(`Rules version: ${status.rulesVersion}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('| --- | ---: |')
  lines.push(`| Curricula | ${status.summary.curricula} |`)
  Object.entries(status.summary.maturity).forEach(([level, count]) => {
    lines.push(`| ${level} | ${count} |`)
  })
  lines.push('')
  lines.push('## Curricula')
  lines.push('')
  lines.push('| Curriculum | Maturity | Goals | Atomic | QA scopes | Warn | Fail |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
  status.curricula.forEach((curriculum) => {
    const allRules = [...curriculum.rules, ...curriculum.scopes.flatMap((scope) => scope.rules)]
    const warnCount = allRules.filter((rule) => rule.status === 'warn').length
    const failCount = allRules.filter((rule) => rule.status === 'fail').length
    lines.push(`| ${curriculum.title} | ${curriculum.maturity} | ${curriculum.goals} | ${curriculum.atomicGoals} | ${curriculum.scopes.length} | ${warnCount} | ${failCount} |`)
  })
  lines.push('')
  lines.push('## Rule Catalog')
  lines.push('')
  lines.push('| Rule | Target | Category | Description |')
  lines.push('| --- | --- | --- | --- |')
  status.ruleCatalog.forEach((rule) => {
    lines.push(`| ${rule.id} | ${rule.maturityTarget} | ${rule.category} | ${rule.description} |`)
  })
  lines.push('')
  return `${lines.join('\n')}\n`
}

function main() {
  const semanticConfigsByLandscapeId = readSemanticConfigs()
  const compositionViewCountsByLandscapeId = readCompositionViewCountsByLandscapeId()
  const applicabilityWarningMetricsByLandscapeId = readApplicabilityWarningMetricsByLandscapeId()

  const canonicalFiles = collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
  const loadedLandscapes = canonicalFiles.map((file) => ({
    file,
    landscape: loadJson<LearningLandscape>(file),
  }))
  const globalGoalIds = new Set(loadedLandscapes.flatMap(({ landscape }) => landscape.goals.map((goal) => goal.id)))

  const curricula = loadedLandscapes
    .map(({ file, landscape }) => {
      const atomicGoals = landscape.goals.filter(isAtomicGoal).length
      const curriculumRules: RuleResult[] = [
        evaluateGraphIntegrity(landscape, globalGoalIds),
        evaluateTypeConsistency(landscape),
        evaluateSemanticAtomicity(landscape, semanticConfigsByLandscapeId.get(landscape.landscapeId) ?? []),
        evaluateCompositionViews(compositionViewCountsByLandscapeId.get(landscape.landscapeId) ?? 0),
        evaluateApplicabilityWarnings(applicabilityWarningMetricsByLandscapeId.get(landscape.landscapeId)),
      ]
      const scopedProfiles = routeProfiles.filter((profile) => profile.landscapeId === landscape.landscapeId)
      const scopes = scopedProfiles.map((profile) => evaluateRouteProfile(landscape, profile))
      if (scopes.length === 0) {
        curriculumRules.push(makeRule(
          'CQR-101',
          'not_configured',
          'No explicit route-coverage profile is registered for this curriculum.',
        ))
      }

      return {
        landscapeId: landscape.landscapeId,
        title: landscape.title,
        subject: landscape.subject,
        frameworkId: landscape.frameworkId,
        path: toRepoPath(file),
        maturity: deriveCurriculumMaturity(curriculumRules, scopes),
        goals: landscape.goals.length,
        atomicGoals,
        clusterGoals: landscape.goals.length - atomicGoals,
        scopes,
        rules: curriculumRules,
      } satisfies CurriculumStatus
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'de', { sensitivity: 'base' }))

  const allRules = curricula.flatMap((curriculum) => [
    ...curriculum.rules,
    ...curriculum.scopes.flatMap((scope) => scope.rules),
  ])
  const maturity: Record<MaturityLevel, number> = { M0: 0, M1: 0, M2: 0, M3: 0, M4: 0 }
  curricula.forEach((curriculum) => {
    maturity[curriculum.maturity] += 1
  })
  const ruleStatus: Record<RuleStatus, number> = { pass: 0, warn: 0, fail: 0, not_configured: 0 }
  allRules.forEach((rule) => {
    ruleStatus[rule.status] += 1
  })

  const status: StatusDocument = {
    schemaVersion: 1,
    rulesVersion: 'curriculum-quality-v1',
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateCurriculumQualityStatus.ts',
    sources: {
      canonicalRoot: toRepoPath(canonicalRoot),
      semanticAtomicityRoot: toRepoPath(semanticAtomicityRoot),
      compositionViewRoot: toRepoPath(compositionViewRoot),
      acceptedWarningsPath: toRepoPath(acceptedWarningsPath),
    },
    summary: {
      curricula: curricula.length,
      maturity,
      ruleStatus,
    },
    ruleCatalog,
    curricula,
  }

  mkdirSync(statusDir, { recursive: true })
  writeFileSync(statusJsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8')
  writeFileSync(statusMarkdownPath, renderMarkdown(status), 'utf8')
  console.log(`Wrote ${toRepoPath(statusJsonPath)}`)
  console.log(`Wrote ${toRepoPath(statusMarkdownPath)}`)
}

main()
