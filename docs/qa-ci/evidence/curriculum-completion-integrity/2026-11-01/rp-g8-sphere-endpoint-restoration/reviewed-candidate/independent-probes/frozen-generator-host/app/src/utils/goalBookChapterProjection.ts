import type { GoalPlacementContext } from '../landscapeTypes'
import {
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
  type CanonicalAuthoringLandscape,
} from './authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionView,
  type CompositionViewFinding,
  type CompositionViewNode,
} from './authoring/compositionViewAuthoring'

export const GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION = '1.0.0' as const

export interface GoalBookNavigationGraphGoal {
  id: string
  title: string
  contains: string[]
  type: 'atomic' | 'cluster'
  tags?: string[]
  semanticKind?: string
}

export interface GoalBookNavigationGoalGraph {
  schemaVersion: typeof GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION
  landscapeId: string
  title: string
  goals: GoalBookNavigationGraphGoal[]
  digest: string
}

export interface GoalBookChapterProjectionChapter {
  chapterId: string
  label: string
  parentChapterId: string | null
  order: number
  treeOrder: number
}

export interface GoalBookChapterProjectionPlacement {
  goalId: string
  breadcrumbs: string[]
  chapterIds: string[]
  navigationOrder: number
  treeOrder: number
}

export interface GoalBookChapterProjection {
  schemaVersion: typeof GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION
  viewId: string
  landscapeId: string
  title?: string
  scope: GoalPlacementContext
  chapters: GoalBookChapterProjectionChapter[]
  placements: GoalBookChapterProjectionPlacement[]
}

export interface GoalBookChapterProjectionCompileResult {
  projection: GoalBookChapterProjection | null
  findings: CompositionViewFinding[]
}

const projectionFinding = (
  code: string,
  message: string,
  goalId?: string,
): CompositionViewFinding => ({
  code,
  severity: 'error',
  message,
  ...(goalId ? { goalId } : {}),
})

const collectExplicitMissingPrerequisiteIds = (
  nodes: CompositionViewNode[],
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Set<string> => {
  const rolesByGoalId = new Map<string, Set<'target' | 'prerequisiteOnly'>>()
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry' || goalById.has(node.goalId)) return
    const roles = rolesByGoalId.get(node.goalId) ?? new Set()
    roles.add(node.projectionRole === 'prerequisiteOnly' ? 'prerequisiteOnly' : 'target')
    rolesByGoalId.set(node.goalId, roles)
  }
  nodes.forEach(visit)

  return new Set([...rolesByGoalId]
    .filter(([, roles]) => roles.size === 1 && roles.has('prerequisiteOnly'))
    .map(([goalId]) => goalId))
}

const withExplicitExternalPrerequisiteStubs = (
  view: CompositionView,
  landscape: CanonicalAuthoringLandscape,
): CanonicalAuthoringLandscape => {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal] as const))
  const prerequisiteIds = collectExplicitMissingPrerequisiteIds(view.rootNodes, goalById)
  if (prerequisiteIds.size === 0) return landscape

  return normalizeCanonicalLandscape({
    ...landscape,
    goals: [
      ...landscape.goals,
      ...[...prerequisiteIds].sort().map((goalId) => ({
        id: goalId,
        title: goalId,
        contains: [],
        requires: [],
        type: 'atomic',
        tags: ['goal-book-external-prerequisite-stub'],
      })),
    ],
  })
}

/**
 * Compiles the same authored Composition View used by the Cockpit into the
 * smaller, read-only chapter projection consumed by a learning-goal book.
 *
 * `includedGoalIds` is the authoritative book membership boundary. It keeps
 * prerequisite-only and non-book goals out of the projection without
 * rewriting the authored tree. Missing references are tolerated only when
 * every direct reference explicitly marks that goal `prerequisiteOnly`; this
 * supports cross-landscape prerequisites without publishing foreign goals as
 * navigation targets.
 */
export const compileGoalBookChapterProjection = (
  rawView: unknown,
  rawGoalGraph: Omit<GoalBookNavigationGoalGraph, 'digest'> | CanonicalAuthoringLandscape,
  includedGoalIds?: ReadonlySet<string>,
): GoalBookChapterProjectionCompileResult => {
  const view = normalizeCompositionView(rawView)
  const normalizedGoalGraph = normalizeCanonicalLandscape(rawGoalGraph)
  // The BookModel's authoritative membership set already limits this
  // projection to curricularAtomic pages. Strip the published semantic-kind
  // annotation before invoking the general authoring compiler so an explicitly
  // excluded curricularArea goalEntry does not invalidate an otherwise valid
  // book projection merely because it is absent from `includedGoalIds`.
  const baseLandscape = normalizeCanonicalLandscape({
    ...normalizedGoalGraph,
    goals: normalizedGoalGraph.goals.map((goal) => {
      const { semanticKind: _semanticKind, ...withoutSemanticKind } = goal
      void _semanticKind
      return withoutSemanticKind
    }),
  })
  const landscape = withExplicitExternalPrerequisiteStubs(view, baseLandscape)
  const compilation = compileCompositionView(view, baseLandscape, landscape)
  const findings = [...compilation.findings]

  if (findings.some(({ severity }) => severity === 'error')) {
    return { projection: null, findings }
  }

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal] as const))
  const chapterDrafts: Array<Omit<GoalBookChapterProjectionChapter, 'order'>> = []
  const chapterById = new Map<string, Omit<GoalBookChapterProjectionChapter, 'order'>>()
  const placements: GoalBookChapterProjectionPlacement[] = []
  let nextTreeOrder = 0

  const enterChapter = (
    chapterId: string,
    label: string,
    parentChapterId: string | null,
  ) => {
    if (chapterById.has(chapterId)) {
      findings.push(projectionFinding(
        'GBP-002',
        `Die kompilierte Kapitelsicht enthält die Kapitel-ID ${chapterId} mehrfach.`,
      ))
      return
    }
    const chapter = { chapterId, label, parentChapterId, treeOrder: nextTreeOrder }
    nextTreeOrder += 1
    chapterById.set(chapterId, chapter)
    chapterDrafts.push(chapter)
  }

  const visit = (
    node: CompiledCompositionPreviewNode,
    breadcrumbs: string[],
    chapterIds: string[],
  ) => {
    if (node.kind === 'structure') {
      enterChapter(node.runtimeId, node.label, chapterIds.at(-1) ?? null)
      node.children.forEach((child) => visit(
        child,
        [...breadcrumbs, node.label],
        [...chapterIds, node.runtimeId],
      ))
      return
    }

    const goalId = node.sourceGoalId
    const goal = goalId ? goalById.get(goalId) : undefined
    if (!goalId || !goal) {
      findings.push(projectionFinding(
        'GBP-003',
        `Der kompilierte Knoten ${node.runtimeId} hat kein auflösbares kanonisches Ziel.`,
        goalId,
      ))
      return
    }

    if (resolveCanonicalNodeType(goal) === 'atomic') {
      if (!includedGoalIds || includedGoalIds.has(goalId)) {
        if (chapterIds.length === 0) {
          findings.push(projectionFinding(
            'GBP-004',
            `Das Lernziel ${goalId} liegt außerhalb eines Kapitels.`,
            goalId,
          ))
          return
        }
        placements.push({
          goalId,
          breadcrumbs,
          chapterIds,
          navigationOrder: placements.length,
          treeOrder: nextTreeOrder,
        })
        nextTreeOrder += 1
      }
      return
    }

    const chapterId = `goal:${goalId}`
    enterChapter(chapterId, node.label, chapterIds.at(-1) ?? null)
    node.children.forEach((child) => visit(
      child,
      [...breadcrumbs, node.label],
      [...chapterIds, chapterId],
    ))
  }

  compilation.compiledRootNodes.forEach((root) => visit(root, [], []))

  const seenGoalIds = new Set<string>()
  placements.forEach(({ goalId }) => {
    if (seenGoalIds.has(goalId)) {
      findings.push(projectionFinding(
        'GBP-005',
        `Das Lernziel ${goalId} erscheint mehrfach in der Kapitelsicht.`,
        goalId,
      ))
    }
    seenGoalIds.add(goalId)
  })
  if (placements.length === 0) {
    findings.push(projectionFinding('GBP-001', 'Die Kapitelsicht enthält keine Lernziele.'))
  }

  if (findings.some(({ severity }) => severity === 'error')) {
    return { projection: null, findings }
  }

  const activeChapterIds = new Set(placements.flatMap(({ chapterIds }) => chapterIds))
  const activeTreeOrders = [
    ...chapterDrafts
      .filter(({ chapterId }) => activeChapterIds.has(chapterId))
      .map(({ treeOrder }) => treeOrder),
    ...placements.map(({ treeOrder }) => treeOrder),
  ].sort((left, right) => left - right)
  const normalizedTreeOrder = new Map(activeTreeOrders.map((treeOrder, index) => [treeOrder, index]))
  const chapters = chapterDrafts
    .filter(({ chapterId }) => activeChapterIds.has(chapterId))
    .map((chapter, order) => ({
      ...chapter,
      order,
      treeOrder: normalizedTreeOrder.get(chapter.treeOrder)!,
    }))
  const normalizedPlacements = placements.map((placement) => ({
    ...placement,
    treeOrder: normalizedTreeOrder.get(placement.treeOrder)!,
  }))

  return {
    projection: {
      schemaVersion: GOAL_BOOK_CHAPTER_PROJECTION_SCHEMA_VERSION,
      viewId: view.viewId,
      landscapeId: view.landscapeId,
      ...(typeof view.title === 'string' && view.title.trim() !== ''
        ? { title: view.title.trim() }
        : {}),
      scope: { ...view.scope },
      chapters,
      placements: normalizedPlacements,
    },
    findings,
  }
}
