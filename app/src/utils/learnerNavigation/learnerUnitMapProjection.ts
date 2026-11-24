import type { UiGoal } from '../../goalTypes'
import { getAudienceGoalTitle } from '../treeProjectionRuntime'
import { createLearnerRequirementResolver, learnerMapEntryKind, learnerMapRootId,
  type LearnerMapProjectionInput } from './learnerMapProjection'
import type { LearningMapEntry, LearningMapFixture, LearningMapRelation, LearningMapRequirement } from '../../components/learningUnitMap/types'

/** Several tree nodes with one key are one unit: one map node holding the union of their content. */
export interface LearnerMapUnitIdentity {
  key: string
  label?: string
  presentationGroup?: true
}

/** Declared order between two units: `unit` lies after `after`. */
export interface LearnerMapUnitOrder {
  unit: string
  after: string
}

/** A unit declared by its own goals (a learning unit of contract 1.2), not by a tree node. */
export interface LearnerMapMemberUnit {
  key: string
  label: string
  goalIds: readonly string[]
  /** Its entry names coverage reviews of its own assessments (concept B2). */
  withAssessments?: boolean
}

export interface LearnerUnitMapProjectionInput extends LearnerMapProjectionInput {
  /** Tree node ID to unit identity. Every other cluster is removed for display. */
  units: ReadonlyMap<string, LearnerMapUnitIdentity>
  after?: readonly LearnerMapUnitOrder[]
  memberUnits?: readonly LearnerMapMemberUnit[]
}

export type LearnerUnitMapFindingKind =
  /** An `after` names a key that no unit declares. */
  | 'unknownUnit'
  /** An `after` names a declared unit that holds no goal of this map. */
  | 'absentUnit'
  | 'selfAfter'
  /** The two units of an `after` are not children of the same unit. */
  | 'afterNotSiblings'
  /** An `after` would contradict earlier accepted `after` (a cycle among children). */
  | 'contradictoryAfter'
  /** An `after` already follows from the other `after` among the same children (rule E4). */
  | 'redundantAfter'
  /** Tree nodes with one unit key lie under different units; the first place wins. */
  | 'unitInTwoPlaces'
  /** A tree node lies inside a unit with its own key; its content stays in that unit. */
  | 'nestedUnitKey'
  /** One goal lies under two different units; the first place wins. */
  | 'goalInTwoPlaces'
  /** The own goals of a member unit lie under different units; it is not shown. */
  | 'memberUnitSplit'
  /** No own goal of a member unit is in this map. */
  | 'memberUnitAbsent'

export interface LearnerUnitMapFinding {
  kind: LearnerUnitMapFindingKind
  message: string
  unitKeys?: string[]
  goalIds?: string[]
}

export interface LearnerUnitMapFixture extends LearningMapFixture {
  findings: LearnerUnitMapFinding[]
  /** Landscape IDs of the subjects of the map's goals, in order of first appearance. */
  subjectIds: string[]
  /** Map entry ID of every unit key shown in the map. */
  unitEntryIds: Record<string, string>
}

const UNIT_ID_PREFIX = '__unit__:'

/**
 * The learner's graph cleaned of every cluster that is not a unit (concept
 * §3.4): units and atomic goals remain, and each unit contains exactly its
 * children. Arrows connect only the children of one unit. Nothing is stored;
 * bad declarations become findings, never exceptions.
 */
export function buildLearnerUnitMapProjection(input: LearnerUnitMapProjectionInput): LearnerUnitMapFixture {
  const { rootGoals, goalIndexAll, canonicalGoalIndexAll = goalIndexAll, visibleGoalIds, visibleChildrenByParent,
    useRawGoalTitles = true, units, after = [], memberUnits = [] } = input
  const rootId = learnerMapRootId(goalIndexAll)
  const findings: LearnerUnitMapFinding[] = []
  const reported = new Set<string>()
  const report = (finding: LearnerUnitMapFinding, onceKey?: string) => {
    if (onceKey) {
      if (reported.has(onceKey)) return
      reported.add(onceKey)
    }
    findings.push(finding)
  }
  const entries: Record<string, LearningMapEntry> = Object.create(null)
  entries[rootId] = { id: rootId, title: 'Meine Lernziele', description: '', kind: 'cluster',
    requires: [], children: [], position: { x: 0, y: 0 } }
  const parentOf = new Map<string, string>()
  const childSet = new Map<string, Set<string>>([[rootId, new Set()]])
  const addChild = (parentId: string, childId: string) => {
    const set = childSet.get(parentId) ?? new Set<string>()
    childSet.set(parentId, set)
    if (set.has(childId)) return
    set.add(childId)
    entries[parentId].children!.push(childId)
    parentOf.set(childId, parentId)
  }
  const visibleChildren = (id: string) => [...(visibleChildrenByParent.get(id) ?? [])]
    .filter(child => visibleGoalIds.has(child) && goalIndexAll.has(child))
  const visibleRoots = rootGoals.filter(goal => visibleGoalIds.has(goal.id) && goalIndexAll.has(goal.id))

  // A key with several reachable tree nodes becomes one synthetic map node.
  const reachable = new Set<string>()
  const reach = (id: string) => {
    if (reachable.has(id)) return
    reachable.add(id)
    visibleChildren(id).forEach(reach)
  }
  visibleRoots.forEach(goal => reach(goal.id))
  const nodesByKey = new Map<string, string[]>()
  for (const [nodeId, identity] of units) {
    if (!reachable.has(nodeId)) continue
    const nodes = nodesByKey.get(identity.key) ?? []
    nodes.push(nodeId)
    nodesByKey.set(identity.key, nodes)
  }
  const usedIds = new Set<string>([...goalIndexAll.keys(), rootId])
  const syntheticUnitId = (key: string) => {
    let id = `${UNIT_ID_PREFIX}${key}`
    while (usedIds.has(id)) id += '_'
    usedIds.add(id)
    return id
  }
  const unitEntryIdByKey = new Map<string, string>()
  const unitKeyByEntryId = new Map<string, string>()
  const memberUnitEntryIds = new Set<string>()
  const treeParentOf = new Map<string, string | undefined>()
  const audienceTitle = (goal: UiGoal, treeParentId?: string) => useRawGoalTitles ? goal.title
    : getAudienceGoalTitle(goal, treeParentId ? goalIndexAll.get(treeParentId) : undefined)
  const unitEntry = (nodeId: string, identity: LearnerMapUnitIdentity, treeParentId?: string): string => {
    const existing = unitEntryIdByKey.get(identity.key)
    if (existing) return existing
    const nodes = nodesByKey.get(identity.key) ?? [nodeId]
    const goal = goalIndexAll.get(nodeId)!
    const id = nodes.length === 1 ? nodeId : syntheticUnitId(identity.key)
    entries[id] = { id, title: identity.label ?? audienceTitle(goal, treeParentId),
      sourceSections: nodes.length === 1 && treeParentId ? goalIndexAll.get(treeParentId)?.childNavigationSources?.get(nodeId) : undefined,
      presentationGroup: nodes.length === 1 ? identity.presentationGroup : undefined,
      description: nodes.length === 1 ? goal.description : '', kind: 'unit', unitType: 'unit', children: [], requires: [], position: { x: 0, y: 0 } }
    childSet.set(id, new Set())
    unitEntryIdByKey.set(identity.key, id)
    unitKeyByEntryId.set(id, identity.key)
    return id
  }
  const isAncestorOrSelf = (candidate: string, id: string) => {
    for (let current: string | undefined = id; current; current = parentOf.get(current)) if (current === candidate) return true
    return false
  }

  const preparationIds: string[] = []
  let preparationTitle: string | undefined
  const aliasOwner = new Map<string, string>()
  const displacedSources = new Set<string>()
  const placeLeaf = (id: string, parentId: string, treeParentId?: string) => {
    const sources = treeParentId ? goalIndexAll.get(treeParentId)?.childNavigationSources?.get(id) ?? [] : []
    const existing = parentOf.get(id)
    if (existing !== undefined) {
      if (existing !== parentId) {
        for (const source of sources) displacedSources.add(source.id)
        report({ kind: 'goalInTwoPlaces', goalIds: [id],
          message: `Goal ${id} lies under two units; it stays in its first place.` }, `goal:${id}`)
      }
      return
    }
    const goal = goalIndexAll.get(id)!
    const sourceSections = goal.preparationSource && goal.preparationSource.id !== treeParentId
      ? [goal.preparationSource, ...sources] : sources
    entries[id] = { id, title: audienceTitle(goal, treeParentId), description: goal.description,
      sourceSections: sourceSections.length ? sourceSections : undefined,
      kind: learnerMapEntryKind(goal, canonicalGoalIndexAll.get(id), 0), children: [], requires: [],
      position: { x: 0, y: 0 }, subjects: goal.landscapeId ? [goal.landscapeId] : [] }
    treeParentOf.set(id, treeParentId)
    addChild(parentId, id)
  }
  const walked = new Set<string>()
  const onPath = new Set<string>()
  const walk = (nodeId: string, parentId: string, treeParentId?: string) => {
    const goal = goalIndexAll.get(nodeId)
    if (!goal || onPath.has(nodeId)) return
    const children = visibleChildren(nodeId)
    // Goals that the prerequisite closure adds from outside the plan wait for
    // their place as preparation; their synthetic cluster is no map node.
    if (goal.personalCurriculumProjection?.presentationOnly) {
      preparationTitle ??= audienceTitle(goal)
      for (const child of children) if (!preparationIds.includes(child)) preparationIds.push(child)
      return
    }
    if (learnerMapEntryKind(goal, canonicalGoalIndexAll.get(nodeId), children.length) !== 'cluster') {
      placeLeaf(nodeId, parentId, treeParentId)
      return
    }
    // A displayed cluster without visible children (a goalEntry or an explicit
    // empty cluster) stays one leaf: its hidden atoms are context, not targets.
    if (!children.length) {
      placeLeaf(nodeId, parentId, treeParentId)
      return
    }
    let next = parentId
    const identity = units.get(nodeId)
    if (identity) {
      const id = unitEntry(nodeId, identity, treeParentId)
      if (isAncestorOrSelf(id, parentId)) {
        report({ kind: 'nestedUnitKey', unitKeys: [identity.key],
          message: `Tree node ${nodeId} lies inside unit ${identity.key} with its own key.` }, `nested:${nodeId}`)
      } else {
        const existing = parentOf.get(id)
        if (existing === undefined) addChild(parentId, id)
        else if (existing !== parentId) report({ kind: 'unitInTwoPlaces', unitKeys: [identity.key],
          message: `Unit ${identity.key} lies under two different units; it stays in its first place.` }, `unit:${identity.key}`)
        next = id
      }
      if (next !== nodeId) aliasOwner.set(nodeId, next)
    } else if (!aliasOwner.has(nodeId)) aliasOwner.set(nodeId, parentId)
    const walkKey = `${nodeId}\u0000${next}`
    if (walked.has(walkKey)) return
    walked.add(walkKey)
    onPath.add(nodeId)
    for (const child of children) walk(child, next, nodeId)
    onPath.delete(nodeId)
  }
  for (const root of visibleRoots) walk(root.id, rootId)

  // Units without any goal of this map are not shown.
  const holdsGoal = (id: string): boolean => {
    const entry = entries[id]
    if (entry.kind !== 'unit') return true
    entry.children = entry.children!.filter(holdsGoal)
    return entry.children.length > 0
  }
  entries[rootId].children = entries[rootId].children!.filter(holdsGoal)
  for (const [key, id] of [...unitEntryIdByKey]) {
    if (!entries[id].children!.length) {
      delete entries[id]
      unitEntryIdByKey.delete(key)
      unitKeyByEntryId.delete(id)
    }
  }

  const contextGoalTitles: Record<string, string> = Object.create(null)
  const resolver = createLearnerRequirementResolver(goalIndexAll, canonicalGoalIndexAll, id => {
    contextGoalTitles[id] ??= entries[id]?.title ?? goalIndexAll.get(id)?.title ?? resolver.canonicalGoal(id)?.title ?? id
  })
  const leafDependents = (id: string) => resolver.isCanonicalCluster(id) ? [...new Set([id, ...resolver.atoms(id)])] : [id]

  // Member units: shown only where all their present own goals share one parent.
  for (const unit of memberUnits) {
    const present = [...new Set(unit.goalIds)].filter(id => entries[id] && entries[id].kind !== 'unit' && parentOf.has(id))
    if (!present.length) {
      report({ kind: 'memberUnitAbsent', unitKeys: [unit.key], message: `No own goal of unit ${unit.key} is in this map.` })
      continue
    }
    if (unitEntryIdByKey.has(unit.key)) {
      report({ kind: 'unitInTwoPlaces', unitKeys: [unit.key], message: `Unit key ${unit.key} is already declared by a tree node.` })
      continue
    }
    const parents = [...new Set(present.map(id => parentOf.get(id)!))]
    if (parents.length > 1) {
      report({ kind: 'memberUnitSplit', unitKeys: [unit.key], goalIds: present,
        message: `The own goals of unit ${unit.key} lie under ${parents.length} different units.` })
      continue
    }
    const parentId = parents[0]
    const section = goalIndexAll.get(parentId)
    const firstChild = section?.extendedData?.compositionNodeId ? visibleChildren(parentId)[0] : undefined
    if (firstChild && present.includes(firstChild) && canonicalGoalIndexAll.get(firstChild)?.semanticKind === 'orientation') {
      // This view section starts with the declared unit's own opening. Keep its
      // visible children on that board, including section goals outside 'own'.
      const board = entries[parentId]
      board.orientationGoalId = firstChild
      board.presentationGroup = undefined
      if (unit.withAssessments) board.unitType = 'unitWithAssessments'
      unitEntryIdByKey.set(unit.key, parentId)
      continue
    }
    const id = syntheticUnitId(unit.key)
    entries[id] = { id, title: unit.label, description: '', kind: 'unit', unitType: unit.withAssessments ? 'unitWithAssessments' : 'unit',
      children: [], requires: [], position: { x: 0, y: 0 } }
    childSet.set(id, new Set())
    const siblings = entries[parentId].children!
    const firstIndex = Math.min(...present.map(goalId => siblings.indexOf(goalId)))
    entries[parentId].children = siblings.filter(goalId => !present.includes(goalId))
    entries[parentId].children!.splice(Math.min(firstIndex, entries[parentId].children!.length), 0, id)
    childSet.set(parentId, new Set(entries[parentId].children))
    parentOf.set(id, parentId)
    for (const goalId of present) addChild(id, goalId)
    unitEntryIdByKey.set(unit.key, id)
    unitKeyByEntryId.set(id, unit.key)
    memberUnitEntryIds.add(id)
  }

  // Declared order: accepted only between children of one unit, without cycles.
  const knownKeys = new Set([...[...units.values()].map(identity => identity.key), ...memberUnits.map(unit => unit.key)])
  const orderEdges = new Map<string, Map<string, Set<string>>>() // parent -> earlier -> later
  const later = (parentId: string, id: string) => orderEdges.get(parentId)?.get(id) ?? new Set<string>()
  /** Whether `a` lies after `b` among the children of `parentId`, directly or through further children. */
  const liesAfter = (parentId: string, a: string, b: string): boolean => {
    const seen = new Set<string>([b])
    const stack = [b]
    while (stack.length) {
      for (const next of later(parentId, stack.pop()!)) {
        if (next === a) return true
        if (!seen.has(next)) { seen.add(next); stack.push(next) }
      }
    }
    return false
  }
  const acceptedPairs: Array<{ parentId: string; earlier: string; later: string; keys: [string, string] }> = []
  const seenPairs = new Set<string>()
  for (const order of after) {
    const pairKey = `${order.unit}\u0000${order.after}`
    if (seenPairs.has(pairKey)) continue
    seenPairs.add(pairKey)
    if (order.unit === order.after) {
      report({ kind: 'selfAfter', unitKeys: [order.unit], message: `Unit ${order.unit} is declared after itself.` })
      continue
    }
    const missing = [order.unit, order.after].filter(key => !unitEntryIdByKey.has(key))
    if (missing.length) {
      for (const key of missing) report(knownKeys.has(key)
        ? { kind: 'absentUnit', unitKeys: [key], message: `Unit ${key} holds no goal of this map; its order is not applied.` }
        : { kind: 'unknownUnit', unitKeys: [key], message: `No unit declares the key ${key}; its order is not applied.` }, `${knownKeys.has(key) ? 'absent' : 'unknown'}:${key}`)
      continue
    }
    const laterId = unitEntryIdByKey.get(order.unit)!
    const earlierId = unitEntryIdByKey.get(order.after)!
    const parentId = parentOf.get(laterId)!
    if (parentOf.get(earlierId) !== parentId) {
      report({ kind: 'afterNotSiblings', unitKeys: [order.unit, order.after],
        message: `${order.unit} after ${order.after} is not applied: the two units are not children of the same unit.` })
      continue
    }
    if (liesAfter(parentId, earlierId, laterId)) {
      report({ kind: 'contradictoryAfter', unitKeys: [order.unit, order.after],
        message: `${order.unit} after ${order.after} is not applied: ${order.after} already lies after ${order.unit}.` })
      continue
    }
    const edges = orderEdges.get(parentId) ?? new Map<string, Set<string>>()
    orderEdges.set(parentId, edges)
    const set = edges.get(earlierId) ?? new Set<string>()
    edges.set(earlierId, set)
    set.add(laterId)
    acceptedPairs.push({ parentId, earlier: earlierId, later: laterId, keys: [order.unit, order.after] })
  }

  // Preparation: descend from the root into the unique earliest child unit that
  // needs the goal (directly or through other preparation goals).
  const preparation = preparationIds.filter(id => !parentOf.has(id) && goalIndexAll.has(id))
  if (preparation.length) {
    const preparationSet = new Set(preparation)
    const placed = Object.values(entries).filter(entry => entry.id !== rootId && entry.kind !== 'unit').map(entry => entry.id)
    const neededBy = new Map<string, Set<string>>()
    for (const id of [...placed, ...preparation]) for (const dependent of leafDependents(id)) {
      for (const requirement of resolver.directRequirementContext(dependent)) for (const source of requirement.sourceGoalIds) {
        const set = neededBy.get(source) ?? new Set<string>()
        neededBy.set(source, set)
        set.add(id)
      }
    }
    const pathOf = (id: string) => {
      const path = [id]
      for (let current = parentOf.get(id); current; current = parentOf.get(current)) path.unshift(current)
      return path
    }
    const isTreeUnit = (id: string) => entries[id]?.kind === 'unit' && !memberUnitEntryIds.has(id)
    for (const id of preparation) {
      const dependents = new Set<string>()
      const seen = new Set([id])
      const queue = [id]
      while (queue.length) {
        for (const consumer of neededBy.get(queue.shift()!) ?? []) {
          if (seen.has(consumer)) continue
          seen.add(consumer)
          if (preparationSet.has(consumer)) queue.push(consumer)
          else dependents.add(consumer)
        }
      }
      const paths = [...dependents].map(pathOf)
      let current = rootId
      for (;;) {
        const candidates = new Set<string>()
        for (const path of paths) {
          const index = path.indexOf(current)
          if (index >= 0 && index + 1 < path.length && isTreeUnit(path[index + 1])) candidates.add(path[index + 1])
        }
        const earliest = [...candidates].filter(child => ![...candidates].some(other => other !== child && liesAfter(current, child, other)))
        if (earliest.length !== 1) break
        current = earliest[0]
      }
      const goal = goalIndexAll.get(id)!
      entries[id] = { id, title: audienceTitle(goal), description: goal.description,
        kind: learnerMapEntryKind(goal, canonicalGoalIndexAll.get(id), 0), children: [], requires: [],
        position: { x: 0, y: 0 }, subjects: goal.landscapeId ? [goal.landscapeId] : [], preparation: true }
      addChild(current, id)
    }
  }

  // Actual prerequisite-closure atoms can have a phase as their earliest
  // common acquisition place. Give them a presentation unit beside that
  // phase's topics. This neither selects targets nor claims an authored plan
  // binding; all atom identities and requirement edges are processed below.
  // An ambiguous root placement stays explicit, and atomic topic boards stay
  // atomic rather than gaining a wrapper for every preparation goal.
  for (const parent of Object.values(entries)) {
    if (parent.kind !== 'unit' || !parent.children?.some(id => entries[id]?.kind === 'unit')) continue
    const goals = parent.children.filter(id => entries[id]?.preparation && entries[id].kind !== 'unit')
    if (!goals.length) continue
    const preparationSet = new Set(goals)
    const owner = new Map<string, string>()
    const indexDescendants = (id: string, child: string) => {
      owner.set(id, child)
      entries[id].children?.forEach(descendant => indexDescendants(descendant, child))
    }
    parent.children.forEach(child => indexDescendants(child, child))
    const successors = new Map(parent.children.map(id => [id, new Set<string>()]))
    const indegree = new Map(parent.children.map(id => [id, 0]))
    const connect = (source: string, target: string) => {
      if (source === target || successors.get(source)!.has(target)) return
      successors.get(source)!.add(target)
      indegree.set(target, indegree.get(target)! + 1)
    }
    for (const [id, target] of owner) {
      if (entries[id].kind === 'unit') continue
      for (const dependent of leafDependents(id)) for (const requirement of resolver.directRequirementContext(dependent)) {
        for (const atom of requirement.sourceGoalIds) {
          const source = owner.get(atom)
          if (source) connect(source, target)
        }
      }
    }
    for (const pair of acceptedPairs) if (pair.parentId === parent.id) connect(pair.earlier, pair.later)
    const siblingIndex = new Map(parent.children.map((id, index) => [id, index]))
    const ready = parent.children.filter(id => indegree.get(id) === 0)
    const ordered: string[] = []
    while (ready.length) {
      ready.sort((a, b) => Number(preparationSet.has(b)) - Number(preparationSet.has(a))
        || siblingIndex.get(a)! - siblingIndex.get(b)!)
      const id = ready.shift()!
      ordered.push(id)
      for (const next of successors.get(id)!) {
        indegree.set(next, indegree.get(next)! - 1)
        if (indegree.get(next) === 0) ready.push(next)
      }
    }
    // Never cover an existing board cycle with a new group. Consecutive
    // preparation blocks in a topological order are convex: a path through a
    // topic separates the blocks, so contraction cannot create a new cycle.
    if (ordered.length !== parent.children.length) continue
    const groups: string[][] = []
    let current: string[] | undefined
    for (const id of ordered) {
      if (!preparationSet.has(id)) { current = undefined; continue }
      if (!current) { current = []; groups.push(current) }
      current.push(id)
    }
    const replacements = new Map<string, string>()
    groups.forEach((group, index) => {
      let key = `required-foundations:${unitKeyByEntryId.get(parent.id) ?? parent.id}${index ? `:${index + 1}` : ''}`
      while (unitEntryIdByKey.has(key)) key += '_'
      const id = syntheticUnitId(key)
      const title = preparationTitle ?? 'Notwendige Grundlagen'
      entries[id] = { id, title: groups.length > 1 ? `${title} (${index + 1})` : title, description: '', kind: 'unit', unitType: 'unit', presentationGroup: true,
        children: [], requires: [], position: { x: 0, y: 0 } }
      unitEntryIdByKey.set(key, id)
      unitKeyByEntryId.set(id, key)
      parentOf.set(id, parent.id)
      childSet.set(id, new Set())
      group.forEach(goalId => { addChild(id, goalId); replacements.set(goalId, id) })
    })
    parent.children = [...new Set(parent.children.map(child => replacements.get(child) ?? child))]
    childSet.set(parent.id, new Set(parent.children))
  }

  const entryPaths: Record<string, string[]> = Object.create(null)
  entryPaths[rootId] = [rootId]
  const order = [rootId]
  for (const parentId of order) for (const id of entries[parentId].children ?? []) {
    if (entryPaths[id]) continue
    entryPaths[id] = [...entryPaths[parentId], id]
    order.push(id)
  }

  const boardsBySource = new Map<string, Set<string>>()
  for (const id of order) {
    for (const source of entries[id].sourceSections ?? []) {
      if (goalIndexAll.get(id)?.preparationSource?.id === source.id) {
        entryPaths[source.id] ??= entryPaths[id] // explicit single-atom acquisition alias
      } else {
        const boards = boardsBySource.get(source.id) ?? new Set<string>()
        boards.add(parentOf.get(id)!)
        boardsBySource.set(source.id, boards)
      }
    }
  }
  // A source group opens its containing board, never one arbitrary member.
  // When distributed across boards it has no unique map location.
  for (const [source, boards] of boardsBySource) {
    const prior = aliasOwner.get(source)
    if (prior) boards.add(prior)
    if (boards.size === 1 && !displacedSources.has(source)) aliasOwner.set(source, [...boards][0])
    else aliasOwner.delete(source)
  }

  // Subjects come from the goals' landscapes, never from titles.
  const subjectsOf = (id: string): string[] => {
    const entry = entries[id]
    if (!entry.children?.length) return entry.subjects ?? []
    entry.subjects = [...new Set(entry.children.flatMap(subjectsOf))]
    return entry.subjects
  }
  const subjectIds = subjectsOf(rootId)

  const scopeRelations: NonNullable<LearningMapFixture['scopeRelations']> = Object.create(null)
  const scopeContext: NonNullable<LearningMapFixture['scopeContext']> = Object.create(null)
  const relationIndex = new Map<string, LearningMapRelation>()
  const addRelation = (scopeId: string, relation: LearningMapRelation) => {
    relationIndex.set(`${scopeId}\u0000${relation.source}\u0000${relation.target}`, relation)
    ;(scopeRelations[scopeId] ??= []).push(relation)
  }
  // Draw `after` transitively reduced among the children of each unit (rule E4).
  for (const pair of acceptedPairs) {
    const implied = [...later(pair.parentId, pair.earlier)].some(middle => middle !== pair.later
      && liesAfter(pair.parentId, pair.later, middle))
    if (implied) {
      report({ kind: 'redundantAfter', unitKeys: [...pair.keys],
        message: `${pair.keys[0]} after ${pair.keys[1]} already follows from the other declared order.` })
      continue
    }
    addRelation(pair.parentId, { source: pair.earlier, target: pair.later, kind: 'summary', provenance: [], unitOrder: 'declared' })
  }
  const addContext = (scopeId: string, target: string, provenance: LearningMapRequirement) => {
    const board = scopeContext[scopeId] ??= Object.create(null)
    ;(board[target] ??= []).push(provenance)
  }
  for (const targetId of order.slice(1)) {
    const target = entries[targetId]
    if (target.kind === 'unit' || !resolver.canonicalGoal(targetId)) continue
    const isCluster = resolver.isCanonicalCluster(targetId)
    const opaqueAtoms = isCluster ? new Set(resolver.atoms(targetId)) : null
    const targetPath = entryPaths[targetId]
    for (const dependentGoalId of leafDependents(targetId)) for (const provenance of resolver.directRequirementContext(dependentGoalId)) {
      const sourceAtoms = provenance.sourceGoalIds
      target.requires.push(provenance.requiredGoalId)
      const projected = new Map<string, { scopeId: string; source: string; target: string; sourceGoalIds: string[] }>()
      for (const sourceAtom of sourceAtoms) {
        const sourcePath = entryPaths[sourceAtom]
        if (!sourcePath) continue // Hidden atoms remain context.
        let common = 0
        while (common < sourcePath.length && common < targetPath.length && sourcePath[common] === targetPath[common]) common++
        if (common === 0 || common >= sourcePath.length || common >= targetPath.length) continue
        const scopeId = targetPath[common - 1]
        const key = `${scopeId}\u0000${sourcePath[common]}\u0000${targetPath[common]}`
        const group = projected.get(key) ?? { scopeId, source: sourcePath[common], target: targetPath[common], sourceGoalIds: [] }
        group.sourceGoalIds.push(sourceAtom)
        projected.set(key, group)
      }
      for (const [key, group] of projected) {
        const record = { ...provenance, sourceGoalIds: group.sourceGoalIds }
        const units = entries[group.source].kind === 'unit' && entries[group.target].kind === 'unit'
        if (units && liesAfter(group.scopeId, group.target, group.source)) {
          // Covered by the declared order. Only a drawn (reduced) `after` carries it.
          relationIndex.get(key)?.provenance.push(record)
          continue
        }
        const existing = relationIndex.get(key)
        if (existing) {
          if (!units && !(!isCluster && group.source === group.sourceGoalIds[0] && group.sourceGoalIds.length === 1
            && group.target === dependentGoalId && provenance.requiredGoalId === group.source)) existing.kind = 'summary'
          existing.provenance.push(record)
          continue
        }
        if (units) {
          const backward = liesAfter(group.scopeId, group.source, group.target)
          addRelation(group.scopeId, backward
            ? { source: group.source, target: group.target, kind: 'summary', provenance: [record], backward: true }
            : { source: group.source, target: group.target, kind: 'summary', provenance: [record], unitOrder: 'derived' })
          continue
        }
        const direct = !isCluster && group.source === group.sourceGoalIds[0] && group.sourceGoalIds.length === 1
          && group.target === dependentGoalId && provenance.requiredGoalId === group.source
        addRelation(group.scopeId, { source: group.source, target: group.target, kind: direct ? 'requirement' : 'summary', provenance: [record] })
      }
      for (let depth = 1; depth < targetPath.length; depth++) {
        const scopeId = targetPath[depth - 1]
        const outside = sourceAtoms.filter(id => {
          if (opaqueAtoms?.has(id)) return false
          const sourcePath = entryPaths[id]
          return !sourcePath || sourcePath[depth - 1] !== scopeId
        })
        if (outside.length || !sourceAtoms.length || provenance.unresolved) addContext(scopeId, targetPath[depth],
          outside.length === sourceAtoms.length ? provenance : { ...provenance, sourceGoalIds: outside })
      }
    }
    target.requires = [...new Set(target.requires)]
  }

  // A removed cluster or a merged tree node still leads to the board that holds its content.
  for (const [alias, owner] of aliasOwner) {
    if (!entries[alias] && entryPaths[owner]) entryPaths[alias] = [...entryPaths[owner], alias]
  }
  return promoteSingleGoalGroups({ rootId, title: 'Meine Lernziele', entries, entryPaths, scopeRelations, scopeContext, contextGoalTitles,
    getRequirementContext: resolver.getRequirementContext, findings, subjectIds,
    unitEntryIds: Object.fromEntries(unitEntryIdByKey) })
}

/**
 * A presentation group may stand for its single actionable leaf. Perform this
 * after placing all owned goals and evaluating the declared sibling order:
 * the leaf takes the group's place in the same order, with the same evidence.
 * Stage-plan units and units with a curriculum or material contract retain their board.
 */
function promoteSingleGoalGroups(fixture: LearnerUnitMapFixture): LearnerUnitMapFixture {
  const representative = new Map<string, string>()
  const visit = (id: string): string => {
    const entry = fixture.entries[id]
    const children = entry.children?.map(visit)
    if (entry.presentationGroup && children?.length === 1) {
      const leaf = fixture.entries[children[0]]
      if (leaf.kind !== 'unit' && leaf.kind !== 'cluster') {
        representative.set(id, leaf.id)
        return leaf.id
      }
    }
    return id
  }
  visit(fixture.rootId)
  if (!representative.size) return fixture
  const shown = (id: string) => representative.get(id) ?? id
  const entries: typeof fixture.entries = Object.assign(Object.create(null), fixture.entries)
  for (const [group, goalId] of representative) {
    const source = entries[group]
    delete entries[group]
    const goal = entries[goalId]
    // Children are visited first, so prepending reconstructs the source path.
    entries[goalId] = { ...goal, sourceSections: [{ id: group, title: source.title }, ...(goal.sourceSections ?? [])] }
  }
  for (const entry of Object.values(entries)) {
    if (entry.children?.some(id => representative.has(id))) entries[entry.id] = { ...entry, children: entry.children.map(shown) }
  }
  const entryPaths: NonNullable<LearningMapFixture['entryPaths']> = Object.create(null)
  for (const [id, path] of Object.entries(fixture.entryPaths ?? {})) {
    // Legacy aliases of removed clusters end with the alias behind its owner.
    const owner = !fixture.entries[id] && path.at(-1) === id ? path.at(-2) : id
    const visible = path.filter(step => !representative.has(step))
    if (owner && representative.has(owner)) {
      if (id !== owner) visible.pop()
      visible.push(shown(owner))
    }
    entryPaths[id] = visible
  }
  const scopeRelations: NonNullable<LearningMapFixture['scopeRelations']> = Object.create(null)
  for (const [scope, relations] of Object.entries(fixture.scopeRelations ?? {})) {
    if (!representative.has(scope)) scopeRelations[scope] = relations.map(edge => ({
      ...edge, source: shown(edge.source), target: shown(edge.target),
    }))
  }
  const scopeContext: NonNullable<LearningMapFixture['scopeContext']> = Object.create(null)
  for (const [scope, board] of Object.entries(fixture.scopeContext ?? {})) {
    if (representative.has(scope)) continue
    const context = scopeContext[scope] = Object.create(null)
    for (const [id, requirements] of Object.entries(board)) context[shown(id)] = requirements
  }
  return { ...fixture, entries, entryPaths, scopeRelations, scopeContext,
    unitEntryIds: Object.fromEntries(Object.entries(fixture.unitEntryIds).filter(([, id]) => !representative.has(id))) }
}

/**
 * Subjects are filters (concept §3.4): goals of other subjects disappear,
 * units stay while they still contain goals. Demand on a hidden goal becomes
 * outside context; nothing moves.
 */
export function filterLearnerUnitMapToSubjects(fixture: LearnerUnitMapFixture, subjects: ReadonlySet<string>): LearnerUnitMapFixture {
  const kept = new Set<string>()
  const removed = new Set<string>()
  const keep = (id: string): boolean => {
    const entry = fixture.entries[id]
    if (!entry) return false
    const keepEntry = entry.children?.length
      ? entry.children.map(keep).some(Boolean) || id === fixture.rootId
      : id === fixture.rootId || (entry.subjects ?? []).some(subject => subjects.has(subject))
    if (keepEntry) kept.add(id)
    else removed.add(id)
    return keepEntry
  }
  keep(fixture.rootId)
  const entries: Record<string, LearningMapEntry> = Object.create(null)
  for (const id of kept) {
    const entry = fixture.entries[id]
    entries[id] = { ...entry, children: entry.children?.filter(child => kept.has(child)),
      subjects: entry.subjects?.filter(subject => subjects.has(subject)) }
  }
  const entryPaths: Record<string, string[]> = Object.create(null)
  for (const [id, path] of Object.entries(fixture.entryPaths ?? {})) {
    if (kept.has(id) || (!fixture.entries[id] && path.every(step => step === id || kept.has(step)))) entryPaths[id] = path
  }
  const scopeContext: NonNullable<LearningMapFixture['scopeContext']> = Object.create(null)
  const addContext = (scopeId: string, target: string, provenance: LearningMapRequirement) => {
    const board = scopeContext[scopeId] ??= Object.create(null)
    ;(board[target] ??= []).push(provenance)
  }
  for (const [scopeId, board] of Object.entries(fixture.scopeContext ?? {})) {
    if (!kept.has(scopeId)) continue
    for (const [target, requirements] of Object.entries(board)) {
      if (!kept.has(target)) continue
      for (const requirement of requirements) if (!removed.has(requirement.dependentGoalId)) addContext(scopeId, target, requirement)
    }
  }
  const scopeRelations: NonNullable<LearningMapFixture['scopeRelations']> = Object.create(null)
  for (const [scopeId, relations] of Object.entries(fixture.scopeRelations ?? {})) {
    if (!kept.has(scopeId)) continue
    for (const relation of relations) {
      if (!kept.has(relation.target)) continue
      const sourceKept = kept.has(relation.source)
      const provenance: LearningMapRequirement[] = []
      for (const requirement of relation.provenance) {
        if (removed.has(requirement.dependentGoalId)) continue
        const shown = sourceKept ? requirement.sourceGoalIds.filter(id => !removed.has(id)) : []
        const hidden = requirement.sourceGoalIds.filter(id => !shown.includes(id))
        if (shown.length) provenance.push({ ...requirement, sourceGoalIds: shown })
        if (hidden.length) {
          // Hidden demand is outside context on this board and every board above it.
          const path = fixture.entryPaths?.[scopeId] ?? [fixture.rootId]
          const boardPath = [...path, relation.target]
          for (let depth = 1; depth < boardPath.length; depth++) addContext(boardPath[depth - 1], boardPath[depth], { ...requirement, sourceGoalIds: hidden })
        }
      }
      if (sourceKept && (provenance.length || relation.unitOrder === 'declared')) {
        ;(scopeRelations[scopeId] ??= []).push({ ...relation, provenance })
      }
    }
    // Filtering out a sibling does not erase its calendar position. Contract
    // only declared order paths on this board, stopping at the first retained
    // unit on each path. Requirements never supply or inherit these edges.
    const siblings = new Set(fixture.entries[scopeId]?.children ?? [])
    const declared = new Map<string, Set<string>>()
    for (const relation of relations) {
      if (relation.unitOrder !== 'declared' || relation.backward
        || !siblings.has(relation.source) || !siblings.has(relation.target)) continue
      const next = declared.get(relation.source) ?? new Set<string>()
      next.add(relation.target)
      declared.set(relation.source, next)
    }
    const contracted = new Map<string, Set<string>>()
    for (const source of siblings) {
      if (!kept.has(source) || !declared.has(source)) continue
      const seen = new Set([source]), pending = [...declared.get(source) ?? []], targets = new Set<string>()
      while (pending.length) {
        const target = pending.pop()!
        if (seen.has(target)) continue
        seen.add(target)
        if (kept.has(target)) targets.add(target)
        else pending.push(...declared.get(target) ?? [])
      }
      contracted.set(source, targets)
    }
    const reachable = (source: string, target: string): boolean => {
      const seen = new Set<string>(), pending = [source]
      while (pending.length) {
        const current = pending.pop()!
        if (current === target) return true
        if (seen.has(current)) continue
        seen.add(current)
        pending.push(...contracted.get(current) ?? [])
      }
      return false
    }
    for (const [source, targets] of contracted) for (const target of targets) {
      if ([...targets].some(middle => middle !== target && reachable(middle, target))) continue
      const output = scopeRelations[scopeId] ??= []
      const existing = output.findIndex(relation => relation.source === source && relation.target === target)
      if (existing >= 0) {
        if (output[existing].unitOrder !== 'declared') output[existing] = { ...output[existing], unitOrder: 'declared' }
      } else output.push({ source, target, kind: 'summary', provenance: [], unitOrder: 'declared' })
    }
  }
  return promoteSingleGoalGroups({ ...fixture, entries, entryPaths, scopeRelations, scopeContext,
    subjectIds: fixture.subjectIds.filter(subject => subjects.has(subject)),
    unitEntryIds: Object.fromEntries(Object.entries(fixture.unitEntryIds).filter(([, id]) => kept.has(id))) })
}
