import { scoreLearnerCompositionScope } from './learnerCompositionScopeMatching'
import {
  compileGoalBookChapterProjection,
  type GoalBookChapterProjection,
  type GoalBookChapterProjectionCompileResult,
} from './goalBookChapterProjection'
import type {
  GoalBookApplicabilityFilter,
  GoalBookRuntimeModel,
  GoalBookRuntimeCompositionViewSource,
  GoalBookSuppliedChapterProjection,
  GoalBookSuppliedChapterProjectionNode,
} from './goalBookRuntime'

export interface GoalBookPersonalizationScope {
  landscapeId: string
  schoolForm: 'Gymnasium'
  jurisdiction: string
  stage: 'SekI' | 'SekII'
  durationModel?: 'G8' | 'G9'
  courseProfile?: 'GK' | 'LK'
}

export type GoalBookPersonalizationScopeResolution =
  | { status: 'partial' }
  | { status: 'unbound' }
  | { status: 'invalid' }
  | {
    status: 'complete'
    key: string
    scope: GoalBookPersonalizationScope
  }

interface ApplicabilityTuple {
  jurisdiction: string
  stage: 'SekI' | 'SekII'
  durationModel: 'G8' | 'G9' | null
  courseProfile: 'GK' | 'LK' | null
}

const applicabilityTuples = (model: GoalBookRuntimeModel): ApplicabilityTuple[] => {
  const tuples = new Map<string, ApplicabilityTuple>()
  model.pages.forEach((page) => page.applicability?.forEach((group) => {
    group.scopes.forEach((scope) => {
      const tuple = {
        jurisdiction: group.jurisdiction,
        stage: scope.stage as 'SekI' | 'SekII',
        durationModel: scope.durationModel as 'G8' | 'G9' | null,
        courseProfile: scope.courseProfile as 'GK' | 'LK' | null,
      }
      tuples.set(JSON.stringify(tuple), tuple)
    })
  }))
  return [...tuples.values()]
}

/**
 * Resolves only a complete learner Level-2 scope. A jurisdiction and stage are
 * always required. G8/G9 is required only when the selected state/stage has
 * more than one authored duration variant; a sole variant is deterministic.
 * Course profile is meaningful and mandatory only for Sek II.
 */
export const resolveGoalBookPersonalizationScope = (
  model: GoalBookRuntimeModel,
  filter: GoalBookApplicabilityFilter,
): GoalBookPersonalizationScopeResolution => {
  if (!filter.jurisdiction || !filter.stage) return { status: 'partial' }
  if (!['SekI', 'SekII'].includes(filter.stage)) return { status: 'invalid' }
  if (filter.stage === 'SekI' && filter.courseProfile !== null) return { status: 'invalid' }
  if (filter.stage === 'SekII' && filter.courseProfile === null) return { status: 'partial' }

  let candidates = applicabilityTuples(model).filter((scope) => (
    scope.jurisdiction === filter.jurisdiction
    && scope.stage === filter.stage
    && (filter.stage === 'SekI'
      ? scope.courseProfile === null
      : scope.courseProfile === filter.courseProfile)
  ))
  if (candidates.length === 0) return { status: 'invalid' }

  const durationValues = new Set(candidates.map(({ durationModel }) => durationModel))
  let durationModel = filter.durationModel as 'G8' | 'G9' | null
  if (durationModel === null) {
    if (durationValues.size > 1) return { status: 'partial' }
    durationModel = durationValues.values().next().value ?? null
  }
  candidates = candidates.filter((scope) => scope.durationModel === durationModel)
  if (candidates.length === 0) return { status: 'invalid' }

  const scope: GoalBookPersonalizationScope = {
    landscapeId: model.navigation.goalGraph.landscapeId,
    schoolForm: 'Gymnasium',
    jurisdiction: filter.jurisdiction,
    stage: filter.stage as 'SekI' | 'SekII',
    ...(durationModel ? { durationModel } : {}),
    ...(filter.stage === 'SekII' && filter.courseProfile
      ? { courseProfile: filter.courseProfile as 'GK' | 'LK' }
      : {}),
  }
  const requestedScope = learnerScopeForMatching(scope)
  const hasCompatiblePublishedView = model.source.compositionViewSources.some((source) => (
    scoreLearnerCompositionScope(source.scope, requestedScope) !== null
  ))
  if (!hasCompatiblePublishedView) return { status: 'unbound' }
  return {
    status: 'complete',
    key: JSON.stringify(scope),
    scope,
  }
}

export const goalBookCompositionViewMatchUrl = (
  scope: GoalBookPersonalizationScope,
): string => {
  const params = new URLSearchParams({
    landscapeId: scope.landscapeId,
    schoolForm: scope.schoolForm,
    jurisdiction: scope.jurisdiction,
    stage: scope.stage,
    courseProfile: scope.courseProfile ?? '',
    durationModel: scope.durationModel ?? '',
  })
  return `/api/ui/composition-views/match?${params.toString()}`
}

const asRuntimeScope = (
  scope: GoalBookPersonalizationScope,
): GoalBookApplicabilityFilter => ({
  jurisdiction: scope.jurisdiction,
  stage: scope.stage,
  durationModel: scope.durationModel ?? null,
  courseProfile: scope.courseProfile ?? null,
})

const compareStrings = (left: string, right: string): number => {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  const serialized = JSON.stringify(value)
  return serialized === undefined ? 'null' : serialized
}

const digestStableJson = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableJson(value))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return `sha256:${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

const sameAuthoredScope = (
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
): boolean => stableJson(left) === stableJson(right)

const learnerScopeForMatching = (
  scope: GoalBookPersonalizationScope,
): Record<string, string> => ({
  schoolForm: scope.schoolForm,
  jurisdiction: scope.jurisdiction,
  stage: scope.stage,
  ...(scope.durationModel ? { durationModel: scope.durationModel } : {}),
  ...(scope.courseProfile ? { courseProfile: scope.courseProfile } : {}),
})

const adaptCompiledProjection = (
  model: GoalBookRuntimeModel,
  compiled: GoalBookChapterProjection,
  scope: GoalBookPersonalizationScope,
  source: GoalBookRuntimeCompositionViewSource,
): GoalBookSuppliedChapterProjection => {
  if (
    compiled.landscapeId !== model.navigation.goalGraph.landscapeId
    || scoreLearnerCompositionScope(compiled.scope, learnerScopeForMatching(scope)) === null
  ) throw new Error('Die gelieferte Kapitelsicht stimmt nicht mit dem gewählten Scope überein.')

  const pagesByGoalId = new Map(model.pages.map((page) => [page.goalId, page] as const))
  const orderedDrafts: Array<GoalBookSuppliedChapterProjectionNode & { treeOrder: number }> = [
    ...compiled.chapters.map((chapter) => ({
      nodeId: chapter.chapterId,
      label: chapter.label,
      parentNodeId: chapter.parentChapterId,
      childNodeIds: [],
      kind: chapter.chapterId.startsWith('goal:') ? 'cluster' as const : 'structure' as const,
      goalId: null,
      descendantGoalCount: 0,
      treeOrder: chapter.treeOrder,
    })),
    ...compiled.placements.map((placement) => {
      const page = pagesByGoalId.get(placement.goalId)
      if (!page) throw new Error(`Die Kapitelsicht enthält die unbekannte Buchseite ${placement.goalId}.`)
      return {
        nodeId: `goal:${placement.goalId}`,
        label: page.title,
        parentNodeId: placement.chapterIds.at(-1) ?? null,
        childNodeIds: [],
        kind: 'goal' as const,
        goalId: placement.goalId,
        descendantGoalCount: 1,
        treeOrder: placement.treeOrder,
      }
    }),
  ].sort((left, right) => left.treeOrder - right.treeOrder)

  const nodesById = new Map<string, typeof orderedDrafts[number]>()
  orderedDrafts.forEach((node, index) => {
    if (node.treeOrder !== index || nodesById.has(node.nodeId)) {
      throw new Error('Die Kapitelsicht besitzt keine eindeutige, lückenlose Baumreihenfolge.')
    }
    nodesById.set(node.nodeId, node)
  })
  orderedDrafts.forEach((node) => {
    if (node.parentNodeId === null) return
    const parent = nodesById.get(node.parentNodeId)
    if (!parent || parent.kind === 'goal') {
      throw new Error(`Der Elternknoten ${node.parentNodeId} fehlt in der Kapitelsicht.`)
    }
    parent.childNodeIds.push(node.nodeId)
  })

  const visiting = new Set<string>()
  const countDescendants = (node: typeof orderedDrafts[number]): number => {
    if (node.kind === 'goal') return 1
    if (visiting.has(node.nodeId)) throw new Error('Die Kapitelsicht enthält einen Zyklus.')
    visiting.add(node.nodeId)
    const count = node.childNodeIds.reduce((sum, childNodeId) => {
      const child = nodesById.get(childNodeId)
      if (!child) throw new Error(`Der Kindknoten ${childNodeId} fehlt in der Kapitelsicht.`)
      return sum + countDescendants(child)
    }, 0)
    visiting.delete(node.nodeId)
    if (count === 0) throw new Error(`Das Kapitel ${node.nodeId} enthält kein Lernziel.`)
    node.descendantGoalCount = count
    return count
  }
  orderedDrafts.filter(({ parentNodeId }) => parentNodeId === null).forEach(countDescendants)

  return {
    projectionId: `composition-view:${compiled.viewId}:${source.projectionFingerprint}`,
    viewId: compiled.viewId,
    scope: asRuntimeScope(scope),
    digest: source.digest,
    nodes: orderedDrafts.map((node) => ({
      nodeId: node.nodeId,
      label: node.label,
      parentNodeId: node.parentNodeId,
      childNodeIds: node.childNodeIds,
      kind: node.kind,
      goalId: node.goalId,
      descendantGoalCount: node.descendantGoalCount,
    })),
  }
}

export interface GoalBookPersonalizedProjectionCompileResult
  extends GoalBookChapterProjectionCompileResult {
  suppliedProjection: GoalBookSuppliedChapterProjection | null
}

export const compileGoalBookPersonalizedProjection = async (
  rawView: unknown,
  model: GoalBookRuntimeModel,
  scope: GoalBookPersonalizationScope,
): Promise<GoalBookPersonalizedProjectionCompileResult> => {
  const compiled = compileGoalBookChapterProjection(
    rawView,
    model.navigation.goalGraph,
    new Set(model.pages.map(({ goalId }) => goalId)),
  )
  if (!compiled.projection) return { ...compiled, suppliedProjection: null }
  try {
    const source = model.source.compositionViewSources.find((candidate) => (
      candidate.viewId === compiled.projection?.viewId
      && sameAuthoredScope(candidate.scope, compiled.projection.scope)
    ))
    if (!source) {
      throw new Error('Die gelieferte Kapitelsicht ist nicht an diese Buchausgabe gebunden.')
    }
    if (scoreLearnerCompositionScope(source.scope, learnerScopeForMatching(scope)) === null) {
      throw new Error('Die gebundene Kapitelsicht passt nicht zur gewählten Personalisierung.')
    }
    const [rawViewDigest, projectionFingerprint] = await Promise.all([
      digestStableJson(rawView),
      digestStableJson({
        viewId: compiled.projection.viewId,
        scope: compiled.projection.scope,
        curricularAtomicGoalIds: compiled.projection.placements
          .map(({ goalId }) => goalId)
          .sort(compareStrings),
      }),
    ])
    if (rawViewDigest !== source.digest || projectionFingerprint !== source.projectionFingerprint) {
      throw new Error('Die gelieferte Kapitelsicht stimmt nicht mit ihrem Publikationsbinding überein.')
    }
    return {
      ...compiled,
      suppliedProjection: adaptCompiledProjection(model, compiled.projection, scope, source),
    }
  } catch (error) {
    return {
      projection: null,
      suppliedProjection: null,
      findings: [
        ...compiled.findings,
        {
          code: 'GBP-UI-001',
          severity: 'error',
          message: error instanceof Error ? error.message : 'Die Kapitelsicht ist ungültig.',
        },
      ],
    }
  }
}
