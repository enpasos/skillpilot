import type { UiGoal } from '../../goalTypes'
import { getAudienceGoalTitle } from '../../utils/treeProjectionRuntime'
import type { LearningMapEntry, LearningMapFixture, LearningMapRelation, LearningMapRequirement } from './types'

export interface LearnerMapProjectionInput {
  rootGoals: readonly UiGoal[]
  goalIndexAll: ReadonlyMap<string, UiGoal>
  canonicalGoalIndexAll?: ReadonlyMap<string, UiGoal>
  visibleGoalIds: ReadonlySet<string>
  visibleChildrenByParent: ReadonlyMap<string, readonly string[]>
  useRawGoalTitles?: boolean
  /** Namespaced navigation nodes supplied only by an admitted backend offer. */
  navigationUnitIds?: ReadonlySet<string>
}

/**
 * Read-only navigation over the very same projected tree as CompetenceTree.
 * The canonical graph is used solely to explain requirements; it cannot add
 * targets, change progress, or turn a branch into a whole-unit prerequisite.
 */
export function buildLearnerMapProjection({ rootGoals, goalIndexAll, canonicalGoalIndexAll = goalIndexAll,
  visibleGoalIds, visibleChildrenByParent, useRawGoalTitles = true, navigationUnitIds }: LearnerMapProjectionInput): LearningMapFixture {
  let rootId = '__learner_goal_map_root__'
  while (goalIndexAll.has(rootId)) rootId += '_'
  const entries: Record<string, LearningMapEntry> = Object.create(null)
  entries[rootId] = { id: rootId, title: 'Meine Lernziele', description: '', kind: 'cluster',
    requires: [], children: rootGoals.filter(goal => visibleGoalIds.has(goal.id)).map(goal => goal.id), position: { x: 0, y: 0 } }
  const entryPaths: Record<string, string[]> = Object.create(null)
  entryPaths[rootId] = [rootId]
  const queue = [...entries[rootId].children!]
  for (const id of queue) {
    if (entries[id]) continue
    const goal = goalIndexAll.get(id)
    if (!goal) continue
    const children = [...(visibleChildrenByParent.get(id) ?? [])]
      .filter(child => visibleGoalIds.has(child) && goalIndexAll.has(child))
    const original = canonicalGoalIndexAll.get(id)
    const cluster = goal.type === 'cluster' || goal.contains.length > 0 || children.length > 0
      || original?.type === 'cluster' || (original?.contains.length ?? 0) > 0
    const kind = navigationUnitIds?.has(id) ? 'unit' : cluster ? 'cluster' : goal.nodeKind === 'exam' || goal.examData ? 'assessment'
      : goal.nodeKind === 'memory' ? 'memory' : goal.tags?.some(tag => tag === 'motivation' || tag === 'orientation') ? 'motivation' : 'goal'
    entries[id] = { id, title: goal.title, description: goal.description, kind, children,
      requires: [], position: { x: 0, y: 0 } }
    queue.push(...children)
  }
  // One breadth-first hierarchy index replaces a tree search for every relation
  // and every reveal. Shared canonical containment does not duplicate map nodes.
  const pathQueue = [rootId]
  for (const parentId of pathQueue) {
    for (const id of entries[parentId]?.children ?? []) {
      if (!entries[id] || entryPaths[id]) continue
      entryPaths[id] = [...entryPaths[parentId], id]
      pathQueue.push(id)
    }
  }
  if (!useRawGoalTitles) for (const id of pathQueue.slice(1)) {
    const path = entryPaths[id]
    const parent = goalIndexAll.get(path[path.length - 2])
    entries[id].title = getAudienceGoalTitle(goalIndexAll.get(id)!, parent)
  }

  const normalize = (ref: string): string => {
    if (canonicalGoalIndexAll.has(ref) || goalIndexAll.has(ref)) return ref
    const colon = ref.indexOf(':')
    const suffix = colon >= 0 ? ref.slice(colon + 1) : ref
    return canonicalGoalIndexAll.has(suffix) || goalIndexAll.has(suffix) ? suffix : ref
  }
  const canonicalGoal = (id: string) => canonicalGoalIndexAll.get(id) ?? goalIndexAll.get(id)
  const canonicalParents = new Map<string, string[]>()
  for (const goal of canonicalGoalIndexAll.values()) {
    for (const ref of goal.contains) {
      const id = normalize(ref)
      const parents = canonicalParents.get(id) ?? []
      parents.push(goal.id)
      canonicalParents.set(id, parents)
    }
  }
  type RequirementOrigin = { requiredGoalId: string; authoredOnGoalId?: string }
  const requirements = new Map<string, RequirementOrigin[]>()
  const requirementStack = new Set<string>()
  const inheritedRequirements = (id: string): RequirementOrigin[] => {
    const cached = requirements.get(id)
    if (cached) return cached
    if (requirementStack.has(id)) return []
    requirementStack.add(id)
    const goal = canonicalGoal(id)
    const refs = new Map<string, RequirementOrigin>()
    for (const ref of goal?.requires ?? []) {
      const requiredGoalId = normalize(ref)
      refs.set(`${requiredGoalId}\u0000${id}`, { requiredGoalId, authoredOnGoalId: id })
    }
    for (const parent of canonicalParents.get(id) ?? []) {
      for (const origin of inheritedRequirements(parent)) {
        refs.set(`${origin.requiredGoalId}\u0000${origin.authoredOnGoalId ?? ''}`, origin)
      }
    }
    // Some package graphs already publish inherited refs without their authors.
    // Keep them, marking the unknown author rather than inventing provenance.
    for (const ref of [...(goal?.effectiveRequires ?? []), ...(goal?.inheritedRequires ?? [])]) {
      const requiredGoalId = normalize(ref)
      if (![...refs.values()].some(origin => origin.requiredGoalId === requiredGoalId)) refs.set(requiredGoalId, { requiredGoalId })
    }
    const result = [...refs.values()].filter(origin => origin.requiredGoalId !== id)
    requirements.set(id, result)
    requirementStack.delete(id)
    return result
  }
  const atomMemo = new Map<string, string[]>()
  const atomStack = new Set<string>()
  const incompleteAtoms = new Set<string>()
  const atoms = (id: string): string[] => {
    const cached = atomMemo.get(id)
    if (cached) return cached
    if (atomStack.has(id)) { incompleteAtoms.add(id); return [] }
    const goal = canonicalGoal(id)
    if (!goal) { incompleteAtoms.add(id); return [] }
    atomStack.add(id)
    const cluster = goal.type === 'cluster' || goal.contains.length > 0
    const result = cluster ? [...new Set(goal.contains.flatMap(ref => atoms(normalize(ref))))] : [id]
    if (cluster && (!result.length || goal.contains.some(ref => incompleteAtoms.has(normalize(ref))))) incompleteAtoms.add(id)
    atomStack.delete(id)
    atomMemo.set(id, result)
    return result
  }

  const scopeRelations: NonNullable<LearningMapFixture['scopeRelations']> = Object.create(null)
  const scopeContext: NonNullable<LearningMapFixture['scopeContext']> = Object.create(null)
  const contextGoalTitles: Record<string, string> = Object.create(null)
  const relationIndex = new Map<string, LearningMapRelation>()
  const title = (id: string) => { contextGoalTitles[id] ??= entries[id]?.title ?? goalIndexAll.get(id)?.title ?? canonicalGoal(id)?.title ?? id }
  const directRequirementContext = (dependentGoalId: string): LearningMapRequirement[] => inheritedRequirements(dependentGoalId).map(origin => {
    const sourceGoalIds = atoms(origin.requiredGoalId).filter(id => id !== dependentGoalId)
    title(origin.requiredGoalId); title(dependentGoalId)
    if (origin.authoredOnGoalId) title(origin.authoredOnGoalId)
    sourceGoalIds.forEach(title)
    return { ...origin, dependentGoalId, inherited: origin.authoredOnGoalId !== dependentGoalId,
      sourceGoalIds, unresolved: incompleteAtoms.has(origin.requiredGoalId) }
  })
  const getRequirementContext = (goalId: string): LearningMapRequirement[] => {
    const goal = canonicalGoal(goalId)
    const targets = goal && (goal.type === 'cluster' || goal.contains.length > 0)
      ? [...new Set([goalId, ...atoms(goalId)])] : [goalId]
    return targets.flatMap(directRequirementContext)
  }
  const addContext = (scopeId: string, target: string, provenance: LearningMapRequirement) => {
    const board = scopeContext[scopeId] ??= Object.create(null)
    ;(board[target] ??= []).push(provenance)
  }
  for (const targetId of pathQueue.slice(1)) {
    const targetGoal = canonicalGoal(targetId)
    // A composition goalEntry can deliberately hide children. It remains a
    // cluster and must not become a fictitious atomic assessment or result.
    if (!targetGoal) continue
    const isCluster = targetGoal.type === 'cluster' || targetGoal.contains.length > 0
    // Opaque displayed clusters keep boundary context from their actual atoms.
    // Those hidden atoms are explanations, never additional acquisition targets.
    if (isCluster && entries[targetId].children?.length) continue
    const opaqueAtoms = isCluster ? new Set(atoms(targetId)) : null
    const dependents = opaqueAtoms ? [...new Set([targetId, ...opaqueAtoms])] : [targetId]
    const targetPath = entryPaths[targetId]
    for (const dependentGoalId of dependents) for (const provenance of directRequirementContext(dependentGoalId)) {
      const sourceAtoms = provenance.sourceGoalIds
      entries[targetId].requires.push(provenance.requiredGoalId)
      // Group exact atomic evidence per visible edge, rather than repeating a
      // canonical cluster x consumer matrix on every ancestor board.
      const projected = new Map<string, { scopeId: string; source: string; target: string; sourceGoalIds: string[] }>()
      for (const sourceAtom of sourceAtoms) {
        const sourcePath = entryPaths[sourceAtom]
        if (!sourcePath) continue // Hidden/support-only atoms remain context.
        let common = 0
        while (common < sourcePath.length && common < targetPath.length
          && sourcePath[common] === targetPath[common]) common++
        if (common === 0 || common >= sourcePath.length || common >= targetPath.length) continue
        const scopeId = targetPath[common - 1]
        const source = sourcePath[common]
        const target = targetPath[common]
        const key = `${scopeId}\u0000${source}\u0000${target}`
        const group = projected.get(key) ?? { scopeId, source, target, sourceGoalIds: [] }
        group.sourceGoalIds.push(sourceAtom)
        projected.set(key, group)
      }
      for (const [key, group] of projected) {
        const direct = !isCluster && group.source === group.sourceGoalIds[0] && group.sourceGoalIds.length === 1
          && group.target === dependentGoalId && provenance.requiredGoalId === group.source
        const relation = relationIndex.get(key) ?? { source: group.source, target: group.target,
          kind: direct ? 'requirement' : 'summary', provenance: [] }
        if (!direct) relation.kind = 'summary'
        relation.provenance.push({ ...provenance, sourceGoalIds: group.sourceGoalIds })
        if (!relationIndex.has(key)) {
          relationIndex.set(key, relation)
          ;(scopeRelations[group.scopeId] ??= []).push(relation)
        }
      }
      // At each deeper board the same requirement can be outside the viewport.
      // Keep its exact origin and hidden remainder without adding target nodes.
      for (let depth = 1; depth < targetPath.length; depth++) {
        const scopeId = targetPath[depth - 1]
        const outside = sourceAtoms.filter(id => {
          if (opaqueAtoms?.has(id)) return false
          const sourcePath = entryPaths[id]
          // Both sibling relations and dependencies wholly inside this branch
          // are internal to the board. Neither is an outside prerequisite.
          return !sourcePath || sourcePath[depth - 1] !== scopeId
        })
        if (outside.length || !sourceAtoms.length || provenance.unresolved) addContext(scopeId, targetPath[depth],
          outside.length === sourceAtoms.length ? provenance : { ...provenance, sourceGoalIds: outside })
      }
    }
  }
  for (const entry of Object.values(entries)) entry.requires = [...new Set(entry.requires)]
  return { rootId, title: 'Meine Lernziele', entries, entryPaths, scopeRelations, scopeContext, contextGoalTitles, getRequirementContext }
}

/** Route selection recreates projected goal objects, but unchanged topology must
 * retain node DOM, camera state and its already completed ELK layout. */
export function createLearnerMapProjectionCache() {
  let previous: { signature: string; canonical: LearnerMapProjectionInput['canonicalGoalIndexAll']; fixture: LearningMapFixture } | undefined
  return (input: LearnerMapProjectionInput): LearningMapFixture => {
    const signature = JSON.stringify([input.useRawGoalTitles, [...input.navigationUnitIds ?? []], input.rootGoals.map(goal => goal.id), [...input.visibleGoalIds].map(id => {
      const goal = input.goalIndexAll.get(id)
      return [id, goal?.title, goal?.description, goal?.type, goal?.nodeKind, goal?.tags, goal?.examData ? true : false,
        goal?.contains, goal?.requires, goal?.effectiveRequires, goal?.inheritedRequires, input.visibleChildrenByParent.get(id)]
    })])
    if (previous?.signature === signature && previous.canonical === input.canonicalGoalIndexAll) return previous.fixture
    const fixture = buildLearnerMapProjection(input)
    previous = { signature, canonical: input.canonicalGoalIndexAll, fixture }
    return fixture
  }
}
