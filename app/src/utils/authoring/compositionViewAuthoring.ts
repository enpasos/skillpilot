import type { GoalPlacementContext } from '../../landscapeTypes'
import {
  STATE_LOOKING_TITLE_PATTERN,
  asRecord,
  asString,
  buildCanonicalGraphIndex,
  normalizeGoalRef,
  normalizeCanonicalLandscape,
  type CanonicalAuthoringLandscape,
} from './canonicalAuthoring'

export type CompositionViewNode =
  | CompositionStructureNode
  | CompositionCanonicalSubtreeNode
  | CompositionGoalEntryNode
  | CompositionLandscapeEntryNode

export type CompositionProjectionRole = 'target' | 'prerequisiteOnly' | 'voluntary'
export type CompositionSubtreeProjectionRole = Exclude<CompositionProjectionRole, 'voluntary'>
export type CompositionViewFormatVersion = '1.0' | '1.1' | '1.2' | '1.3'

export const COMPOSITION_VIEW_13_SCHEMA = 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'

/** Source and package readers use the same version/role boundary. Legacy editor
 * drafts may omit headers; an optional offer always needs the 1.3 contract. */
export function readCompositionViewFormatVersion(view: Record<string, unknown>): CompositionViewFormatVersion {
  const version = view.viewFormatVersion === undefined ? '1.0' : view.viewFormatVersion
  if (version !== '1.0' && version !== '1.1' && version !== '1.2' && version !== '1.3') {
    throw new Error(`Unsupported composition view format version: ${String(version)}`)
  }
  const schema = view.$schema
  if (version === '1.3' && schema !== COMPOSITION_VIEW_13_SCHEMA
    || schema === COMPOSITION_VIEW_13_SCHEMA && version !== '1.3') {
    throw new Error('Composition view format 1.3 requires its exact source schema and version binding.')
  }
  return version
}

/** A complete declaration of the parent's partial child order; omitted pairs
 * impose no planning order. Goal prerequisites remain a separate relation. */
export interface CompositionChildOrder {
  after: { unit: string; after: string }[]
}

export interface CompositionStructureNode extends Record<string, unknown> {
  kind: 'structure'
  id: string
  label: string
  children: CompositionViewNode[]
  /** Omission retains legacy sibling order; an empty after explicitly declares no planning order. */
  childOrder?: CompositionChildOrder
}

/** Shared source/runtime guard. References name direct structure children only. */
export function readCompositionChildOrder(value: unknown, childIds: readonly string[]): CompositionChildOrder | undefined {
  if (value === undefined) return undefined
  const fail = (message: string): never => { throw new Error(`Invalid composition childOrder: ${message}`) }
  const object = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)
  if (!object(value) || Object.keys(value).some(key => key !== 'after') || !Array.isArray(value.after)) return fail('expected exactly an after array')
  const known = new Set(childIds), seen = new Set<string>(), successors = new Map<string, Set<string>>()
  const after: CompositionChildOrder['after'] = []
  for (const pair of value.after) {
    if (!object(pair) || Object.keys(pair).some(key => key !== 'unit' && key !== 'after')
      || typeof pair.unit !== 'string' || typeof pair.after !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(pair.unit) || !/^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(pair.after)
      || pair.unit.length > 300 || pair.after.length > 300) return fail('invalid order pair')
    if (!known.has(pair.unit) || !known.has(pair.after)) return fail('order endpoints must be direct structure children')
    if (pair.unit === pair.after) return fail('self order')
    const key = `${pair.unit}\u0000${pair.after}`
    if (seen.has(key)) return fail('duplicate order pair')
    seen.add(key)
    const next = successors.get(pair.after) ?? new Set<string>()
    next.add(pair.unit); successors.set(pair.after, next)
    after.push({ unit: pair.unit, after: pair.after })
  }
  const active = new Set<string>(), complete = new Set<string>()
  const visit = (id: string) => {
    if (active.has(id)) return fail('cycle in declared order')
    if (complete.has(id)) return
    active.add(id)
    for (const next of successors.get(id) ?? []) visit(next)
    active.delete(id); complete.add(id)
  }
  for (const id of known) visit(id)
  for (const pair of after) {
    const reachable = new Set<string>(), pending = [...successors.get(pair.after) ?? []].filter(id => id !== pair.unit)
    while (pending.length) {
      const id = pending.pop()!
      if (id === pair.unit) return fail('transitively redundant order pair')
      if (reachable.has(id)) continue
      reachable.add(id); pending.push(...successors.get(id) ?? [])
    }
  }
  return { after }
}

/** Preserve declared reachability through filtered-out intermediates, then
 * reduce again. Filtering never invents a new sibling adjacency. */
export function projectCompositionChildOrder(order: CompositionChildOrder, visibleChildIds: readonly string[]): CompositionChildOrder {
  const needs = new Map<string, Set<string>>()
  for (const pair of order.after) {
    const previous = needs.get(pair.unit) ?? new Set<string>()
    previous.add(pair.after); needs.set(pair.unit, previous)
  }
  const ancestors = (id: string) => {
    const found = new Set<string>(), pending = [...needs.get(id) ?? []]
    while (pending.length) {
      const previous = pending.pop()!
      if (found.has(previous)) continue
      found.add(previous); pending.push(...needs.get(previous) ?? [])
    }
    return found
  }
  const closure = new Map(visibleChildIds.map(id => [id, ancestors(id)]))
  return { after: visibleChildIds.flatMap(unit => visibleChildIds.filter(previous => closure.get(unit)!.has(previous)
    && !visibleChildIds.some(intermediate => intermediate !== previous && closure.get(unit)!.has(intermediate)
      && closure.get(intermediate)!.has(previous))).map(after => ({ unit, after }))) }
}

export interface CompositionCanonicalSubtreeNode extends Record<string, unknown> {
  kind: 'canonicalSubtree'
  goalId: string
  displayLabel?: string
  projectionRole?: CompositionSubtreeProjectionRole
}

export interface CompositionGoalEntryNode extends Record<string, unknown> {
  kind: 'goalEntry'
  goalId: string
  displayLabel?: string
  projectionRole?: CompositionProjectionRole
  /** Explicit acquisition place for an atom already in the backend's closed L. */
  acquisitionPlacement?: true
}

export interface CompositionLandscapeEntryNode extends Record<string, unknown> {
  kind: 'landscapeEntry'
  landscapeId: string
  displayLabel?: string
}

export interface CompositionView extends Record<string, unknown> {
  viewId: string
  landscapeId: string
  scope: GoalPlacementContext
  rootNodes: CompositionViewNode[]
}

export interface CompositionViewFinding {
  code: string
  severity: 'error' | 'warning'
  message: string
  nodePath?: string
  goalId?: string
}

export interface CompiledCompositionPreviewNode {
  runtimeId: string
  kind: 'structure' | 'goal'
  label: string
  sourceGoalId?: string
  projectionRole?: CompositionProjectionRole
  children: CompiledCompositionPreviewNode[]
}

export interface CompositionCompileResult {
  compiledRootNodes: CompiledCompositionPreviewNode[]
  findings: CompositionViewFinding[]
  projectionRoles: CompositionProjectionRoleGoalIds
}

export const getCompositionProjectionRole = (
  node: CompositionCanonicalSubtreeNode | CompositionGoalEntryNode,
): CompositionProjectionRole => {
  const role = node.projectionRole
  if (role === undefined || role === 'target') return 'target'
  if (role === 'prerequisiteOnly' || role === 'voluntary' && node.kind === 'goalEntry') return role
  throw new Error(`Invalid composition projectionRole: ${String(role)}`)
}

export interface CompositionProjectionRoleGoalIds {
  /** Legacy authored sets retain their meaning, including selected clusters. */
  targetGoalIds: Set<string>
  prerequisiteOnlyGoalIds: Set<string>
  voluntaryGoalIds: Set<string>
  /** Atom sets include opaque group descendants and implicit prerequisites. */
  targetAtomicGoalIds: Set<string>
  prerequisiteOnlyAtomicGoalIds: Set<string>
  voluntaryAtomicGoalIds: Set<string>
  conflictingGoalIds: Set<string>
}

type CompositionProjectionRoleSource = 'landscapeEntry' | 'canonicalSubtree' | 'goalEntry'

interface CompositionProjectionRoleAssignment {
  role: CompositionProjectionRole
  source: CompositionProjectionRoleSource
  distance: number
}

const COMPOSITION_PROJECTION_ROLE_SOURCE_PRIORITY: Record<CompositionProjectionRoleSource, number> = {
  landscapeEntry: 0,
  canonicalSubtree: 1,
  goalEntry: 2,
}

const isMoreSpecificCompositionProjectionRoleAssignment = (
  candidate: CompositionProjectionRoleAssignment,
  current: CompositionProjectionRoleAssignment | undefined,
): boolean => {
  if (!current) return true

  const candidatePriority = COMPOSITION_PROJECTION_ROLE_SOURCE_PRIORITY[candidate.source]
  const currentPriority = COMPOSITION_PROJECTION_ROLE_SOURCE_PRIORITY[current.source]
  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority
  }

  if (candidate.distance !== current.distance) {
    return candidate.distance < current.distance
  }

  return candidate.role === 'target' && current.role === 'prerequisiteOnly'
}

type CompositionRoleGoal = { type?: string; contains?: readonly string[]; requires?: readonly string[] }
const resolveCompositionGoalRef = (reference: string, goalById: ReadonlyMap<string, CompositionRoleGoal>) =>
  goalById.has(reference) ? reference : normalizeGoalRef(reference)

/** Canonical cluster prerequisites are inherited by their descendants, including
 * atoms selected without their canonical parent in the presentation tree. */
export const createCompositionEffectiveRequirementsReader = (goalById: ReadonlyMap<string, CompositionRoleGoal>) => {
  const parents = new Map<string, Set<string>>()
  for (const [goalId, goal] of goalById) for (const child of goal.contains ?? []) {
    const childId = resolveCompositionGoalRef(child, goalById)
    const previous = parents.get(childId) ?? new Set<string>()
    previous.add(goalId); parents.set(childId, previous)
  }
  const memo = new Map<string, Set<string>>(), visiting = new Set<string>()
  const read = (goalId: string): Set<string> => {
    const cached = memo.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return new Set()
    visiting.add(goalId)
    const result = new Set((goalById.get(goalId)?.requires ?? []).map(ref => resolveCompositionGoalRef(ref, goalById)))
    for (const parent of parents.get(goalId) ?? []) for (const requirement of read(parent)) result.add(requirement)
    result.delete(goalId)
    visiting.delete(goalId); memo.set(goalId, result)
    return result
  }
  return read
}

export const collectCompositionProjectionRoleGoalIds = (
  nodes: CompositionViewNode[],
  goalById: ReadonlyMap<string, CompositionRoleGoal>,
  rootGoalIdByLandscapeId: ReadonlyMap<string, string> = new Map(),
): CompositionProjectionRoleGoalIds => {
  const assignmentByGoalId = new Map<string, CompositionProjectionRoleAssignment>()
  const atomicAssignmentByGoalId = new Map<string, CompositionProjectionRoleAssignment>()
  const conflictingGoalIds = new Set<string>()

  const assignAtom = (goalId: string, assignment: CompositionProjectionRoleAssignment) => {
    const current = atomicAssignmentByGoalId.get(goalId)
    if (current && current.role !== assignment.role && (current.role === 'voluntary' || assignment.role === 'voluntary'
      || current.source === 'goalEntry' && assignment.source === 'goalEntry' && current.distance === assignment.distance)) {
      conflictingGoalIds.add(goalId)
    }
    if (isMoreSpecificCompositionProjectionRoleAssignment(assignment, current)) {
      atomicAssignmentByGoalId.set(goalId, assignment)
    }
  }

  const assignAtomicDescendants = (goalId: string, assignment: CompositionProjectionRoleAssignment, seen = new Set<string>()) => {
    if (seen.has(goalId)) return
    seen.add(goalId)
    const goal = goalById.get(goalId)
    if (!goal) return
    if (!(goal.contains?.length)) {
      if (goal.type !== 'cluster') assignAtom(goalId, assignment)
    }
    else goal.contains.forEach(child => assignAtomicDescendants(resolveCompositionGoalRef(child, goalById), { ...assignment, distance: assignment.distance + 1 }, seen))
  }

  const assignGoal = (goalId: string, assignment: CompositionProjectionRoleAssignment) => {
    if (goalById.has(goalId) && goalById.get(goalId)?.type !== 'cluster' && !(goalById.get(goalId)?.contains?.length)) assignAtom(goalId, assignment)
    if (isMoreSpecificCompositionProjectionRoleAssignment(
      assignment,
      assignmentByGoalId.get(goalId),
    )) {
      assignmentByGoalId.set(goalId, assignment)
    }
  }

  const assignSubtree = (
    rootGoalId: string,
    role: CompositionProjectionRole,
    source: Extract<CompositionProjectionRoleSource, 'landscapeEntry' | 'canonicalSubtree'>,
  ) => {
    const shortestDistanceByGoalId = new Map<string, number>()
    const queue: Array<{ goalId: string, distance: number }> = [{ goalId: rootGoalId, distance: 0 }]

    for (let index = 0; index < queue.length; index += 1) {
      const { goalId, distance } = queue[index]
      const knownDistance = shortestDistanceByGoalId.get(goalId)
      if (knownDistance !== undefined && knownDistance <= distance) continue
      shortestDistanceByGoalId.set(goalId, distance)
      assignGoal(goalId, { role, source, distance })

      const goal = goalById.get(goalId)
      ;(goal?.contains ?? []).forEach((childId) => {
        queue.push({ goalId: resolveCompositionGoalRef(childId, goalById), distance: distance + 1 })
      })
    }
  }

  const visitNode = (node: CompositionViewNode) => {
    if ((node.kind === 'structure' || node.kind === 'landscapeEntry') && node.projectionRole !== undefined) {
      throw new Error(`Invalid composition projectionRole on ${node.kind}: ${String(node.projectionRole)}`)
    }
    if (node.kind === 'structure') {
      node.children.forEach(visitNode)
      return
    }

    if (node.kind === 'landscapeEntry') {
      const rootGoalId = rootGoalIdByLandscapeId.get(node.landscapeId)
      if (rootGoalId) assignSubtree(rootGoalId, 'target', 'landscapeEntry')
      return
    }

    const role = getCompositionProjectionRole(node)
    if (node.kind === 'canonicalSubtree') {
      assignSubtree(node.goalId, role, 'canonicalSubtree')
    } else {
      assignGoal(node.goalId, { role, source: 'goalEntry', distance: 0 })
      assignAtomicDescendants(node.goalId, { role, source: 'goalEntry', distance: 0 })
    }
  }

  nodes.forEach(visitNode)
  const targetGoalIds = new Set<string>()
  const prerequisiteOnlyGoalIds = new Set<string>()
  const voluntaryGoalIds = new Set<string>()
  assignmentByGoalId.forEach((assignment, goalId) => {
    if (assignment.role === 'prerequisiteOnly') {
      prerequisiteOnlyGoalIds.add(goalId)
    } else if (assignment.role === 'voluntary') {
      voluntaryGoalIds.add(goalId)
    } else {
      targetGoalIds.add(goalId)
    }
  })
  const targetAtomicGoalIds = new Set<string>()
  const prerequisiteOnlyAtomicGoalIds = new Set<string>()
  const voluntaryAtomicGoalIds = new Set<string>()
  atomicAssignmentByGoalId.forEach(({ role }, goalId) => {
    const destination = role === 'target' ? targetAtomicGoalIds : role === 'voluntary' ? voluntaryAtomicGoalIds : prerequisiteOnlyAtomicGoalIds
    destination.add(goalId)
  })
  const visited = new Set<string>()
  const effectiveRequirements = createCompositionEffectiveRequirementsReader(goalById)
  const pending = [...assignmentByGoalId.keys()]
  while (pending.length) {
    const goalId = pending.pop()!
    if (visited.has(goalId)) continue
    visited.add(goalId)
    const goal = goalById.get(goalId)
    if (!goal) continue
    if (goal.type !== 'cluster' && !goal.contains?.length && !targetAtomicGoalIds.has(goalId) && !voluntaryAtomicGoalIds.has(goalId)) {
      prerequisiteOnlyAtomicGoalIds.add(goalId)
    }
    pending.push(...(goal.contains ?? []).map(ref => resolveCompositionGoalRef(ref, goalById)), ...effectiveRequirements(goalId))
  }
  return { targetGoalIds, prerequisiteOnlyGoalIds, voluntaryGoalIds,
    targetAtomicGoalIds, prerequisiteOnlyAtomicGoalIds, voluntaryAtomicGoalIds, conflictingGoalIds }
}

const normalizeScope = (value: unknown): GoalPlacementContext => {
  const record = asRecord(value)
  const scope: GoalPlacementContext = {}
  Object.entries(record).forEach(([key, entry]) => {
    if (typeof entry === 'string' && entry.trim() !== '') {
      scope[key] = entry
    }
  })
  return scope
}

const normalizeCompositionNode = (value: unknown, pathLabel: string): CompositionViewNode => {
  const record = asRecord(value)
  if (record.projectionRole !== undefined && (record.kind !== 'goalEntry' && record.kind !== 'canonicalSubtree'
    || record.projectionRole !== 'target' && record.projectionRole !== 'prerequisiteOnly'
      && !(record.kind === 'goalEntry' && record.projectionRole === 'voluntary'))) {
    throw new Error(`Invalid composition projectionRole at ${pathLabel}: ${String(record.projectionRole)}`)
  }
  if (record.kind === 'canonicalSubtree') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'canonicalSubtree',
      goalId: asString(record.goalId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  if (record.kind === 'goalEntry') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'goalEntry',
      goalId: asString(record.goalId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  if (record.kind === 'landscapeEntry') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'landscapeEntry',
      landscapeId: asString(record.landscapeId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  const children = Array.isArray(record.children) ? record.children : []
  return {
    ...record,
    kind: 'structure',
    id: asString(record.id, `structure-${pathLabel}`),
    label: asString(record.label, 'New Structure'),
    children: children.map((child, index) => normalizeCompositionNode(child, `${pathLabel}-${index}`)),
  }
}

export const normalizeCompositionView = (value: unknown): CompositionView => {
  const record = asRecord(value)
  const version = readCompositionViewFormatVersion(record)
  const rootNodes = Array.isArray(record.rootNodes) ? record.rootNodes : []
  const normalizedNodes = rootNodes.map((node, index) => normalizeCompositionNode(node, `root-${index}`))
  const validateRoleVersion = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
    if (node.kind === 'structure') validateRoleVersion(node.children)
    else if (node.kind === 'goalEntry' && node.projectionRole === 'voluntary' && version !== '1.3') {
      throw new Error('The voluntary projectionRole requires composition view format 1.3.')
    }
  })
  validateRoleVersion(normalizedNodes)
  return {
    ...record,
    viewId: asString(record.viewId, 'new-view'),
    landscapeId: asString(record.landscapeId),
    scope: normalizeScope(record.scope),
    rootNodes: normalizedNodes,
  }
}

export const createEmptyCompositionView = (): CompositionView => ({
  viewId: 'new-view',
  landscapeId: '',
  scope: {
    schoolForm: 'Gymnasium',
  },
  rootNodes: [],
})

const getLandscapeRootGoal = (landscape: CanonicalAuthoringLandscape) =>
  landscape.goals.find((goal) => (goal.tags ?? []).includes('root')) ?? null

const isGenericStructureLabel = (label: string): boolean => {
  const normalized = label.trim().toLowerCase()
  return normalized === ''
    || normalized === 'new structure'
    || normalized === 'new node'
    || /^structure\s*\d*$/iu.test(normalized)
    || /^cluster\s*\d*$/iu.test(normalized)
    || /^node\s*\d*$/iu.test(normalized)
}

const stringifyNodePath = (path: number[]): string => (
  path.length === 0 ? 'root' : path.join('.')
)

const expandCanonicalSubtree = (
  goalId: string,
  descendantsById: ReadonlyMap<string, ReadonlySet<string>>,
): Set<string> => {
  const expanded = new Set<string>([goalId])
  descendantsById.get(goalId)?.forEach((descendantId) => expanded.add(descendantId))
  return expanded
}

export const compileCompositionView = (
  view: CompositionView,
  landscape: CanonicalAuthoringLandscape | null,
  goalUniverse: CanonicalAuthoringLandscape | null = null,
  landscapeUniverseById: Map<string, CanonicalAuthoringLandscape> | null = null,
): CompositionCompileResult => {
  const findings: CompositionViewFinding[] = []
  let formatVersion: CompositionViewFormatVersion | undefined
  try {
    formatVersion = readCompositionViewFormatVersion(view)
  } catch (error) {
    findings.push({ code: 'CPV-012', severity: 'error', message: error instanceof Error ? error.message : String(error) })
  }
  const hasScopeDiscriminator = ['jurisdiction', 'stage', 'courseProfile', 'durationModel']
    .some((key) => ((view.scope[key] ?? '') as string).trim())

  if (!(view.viewId ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'viewId fehlt.' })
  }
  if (!(view.landscapeId ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'landscapeId fehlt.' })
  }
  if (!(view.scope.schoolForm ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'scope.schoolForm fehlt.' })
  }
  if (!hasScopeDiscriminator) {
    findings.push({
      code: 'CPV-001',
      severity: 'error',
      message: 'Mindestens einer der Scope-Keys jurisdiction, stage, courseProfile oder durationModel muss gesetzt sein.',
    })
  }
  if (view.rootNodes.length === 0) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'Keine rootNodes definiert.' })
  }

  const canonicalLandscape = landscape ? normalizeCanonicalLandscape(landscape) : null
  if (!canonicalLandscape) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'Kein kanonischer Graph geladen.' })
    return { compiledRootNodes: [], findings, projectionRoles: collectCompositionProjectionRoleGoalIds([], new Map()) }
  }

  const canonicalGoalUniverse = goalUniverse ? normalizeCanonicalLandscape(goalUniverse) : canonicalLandscape

  if (view.landscapeId && canonicalLandscape.landscapeId && view.landscapeId !== canonicalLandscape.landscapeId) {
    findings.push({
      code: 'CPV-001',
      severity: 'error',
      message: `view.landscapeId (${view.landscapeId}) passt nicht zum geladenen kanonischen Graphen (${canonicalLandscape.landscapeId}).`,
    })
  }

  const index = buildCanonicalGraphIndex(canonicalGoalUniverse)
  const rootGoalIdByLandscapeId = new Map<string, string>()
  const canonicalRootGoal = getLandscapeRootGoal(canonicalLandscape)
  if (canonicalRootGoal) {
    rootGoalIdByLandscapeId.set(canonicalLandscape.landscapeId, canonicalRootGoal.id)
  }
  landscapeUniverseById?.forEach((candidateLandscape, landscapeId) => {
    const rootGoal = getLandscapeRootGoal(candidateLandscape)
    if (rootGoal) rootGoalIdByLandscapeId.set(landscapeId, rootGoal.id)
  })
  let projectionRoles = collectCompositionProjectionRoleGoalIds([], new Map())
  try {
    projectionRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, index.goalById, rootGoalIdByLandscapeId)
  } catch (error) {
    findings.push({ code: 'CPV-008', severity: 'error', message: error instanceof Error ? error.message : String(error) })
  }
  const { targetGoalIds: effectiveTargetGoalIds, voluntaryGoalIds } = projectionRoles
  const effectiveVisibleGoalIds = new Set([...effectiveTargetGoalIds, ...voluntaryGoalIds])
  const structureIds = new Set<string>()
  const subtreeRootsByPath = new Map<string, { goalId: string, expandedGoalIds: Set<string> }>()
  const referencedRootIds = new Map<string, string>()
  const goalOccurrenceCount = new Map<string, number>()
  const goalParentKeys = new Map<string, Set<string>>()

  const noteGoalOccurrence = (goalId: string, parentKey: string | null) => {
    goalOccurrenceCount.set(goalId, (goalOccurrenceCount.get(goalId) ?? 0) + 1)
    if (!parentKey) return
    const parents = goalParentKeys.get(goalId) ?? new Set<string>()
    parents.add(parentKey)
    goalParentKeys.set(goalId, parents)
  }

  const validateNode = (node: CompositionViewNode, path: number[]) => {
    const pathKey = stringifyNodePath(path)
    if (node.acquisitionPlacement !== undefined && (formatVersion !== '1.2' && formatVersion !== '1.3'
      || node.kind !== 'goalEntry' || node.acquisitionPlacement !== true
      || node.projectionRole !== 'prerequisiteOnly' || path.length < 2)) {
      findings.push({ code: 'CPV-011', severity: 'error', nodePath: pathKey,
        message: 'acquisitionPlacement requires a nested explicit prerequisiteOnly goalEntry in view format 1.2 or 1.3.' })
    }

    if (node.projectionRole !== undefined && (node.kind !== 'goalEntry' && node.kind !== 'canonicalSubtree'
      || node.projectionRole !== 'target' && node.projectionRole !== 'prerequisiteOnly'
        && !(node.kind === 'goalEntry' && node.projectionRole === 'voluntary'))) {
      findings.push({ code: 'CPV-008', severity: 'error', nodePath: pathKey,
        message: `Ungültige projectionRole: ${String(node.projectionRole)}` })
      return
    }
    if (node.projectionRole === 'voluntary' && formatVersion !== '1.3') {
      findings.push({ code: 'CPV-012', severity: 'error', nodePath: pathKey,
        message: 'The voluntary projectionRole requires composition view format 1.3.' })
    }

    if (node.kind === 'structure') {
      try {
        readCompositionChildOrder(node.childOrder, node.children.filter(child => child.kind === 'structure').map(child => child.id))
      } catch (error) {
        findings.push({ code: 'CPV-010', severity: 'error', nodePath: pathKey,
          message: error instanceof Error ? error.message : String(error) })
      }
      if (!(node.id ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'Structure node ohne id.' })
      } else if (structureIds.has(node.id)) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: `Doppelte structure id: ${node.id}` })
      } else {
        structureIds.add(node.id)
      }

      if (!(node.label ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'Structure node ohne label.' })
      } else if (isGenericStructureLabel(node.label)) {
        findings.push({ code: 'CPV-101', severity: 'warning', nodePath: pathKey, message: 'Sehr generisches structure label.' })
      }

      if (node.children.length === 0) {
        findings.push({ code: 'CPV-007', severity: 'error', nodePath: pathKey, message: 'Leerer structure node ohne Kinder.' })
      }

      node.children.forEach((child, indexOfChild) => validateNode(child, [...path, indexOfChild]))
      return
    }

    if (node.kind === 'landscapeEntry') {
      if (!(node.landscapeId ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'landscapeEntry ohne landscapeId.' })
        return
      }

      if (!landscapeUniverseById) {
        return
      }

      const referencedLandscape = landscapeUniverseById.get(node.landscapeId)
      if (!referencedLandscape) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          message: `Fehlende kanonische Landscape-Referenz: ${node.landscapeId}`,
        })
        return
      }

      const rootGoal = getLandscapeRootGoal(referencedLandscape)
      if (!rootGoal) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          message: `Referenzierte Landscape ${node.landscapeId} hat keinen Root-Knoten.`,
        })
      }
      return
    }

    if (node.kind === 'goalEntry') {
      if (!(node.goalId ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'goalEntry ohne goalId.' })
        return
      }

      const referencedGoal = index.goalById.get(node.goalId)
      if (!referencedGoal) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          goalId: node.goalId,
          message: `Fehlende kanonische Ziel-Referenz: ${node.goalId}`,
        })
        return
      }

      if (node.acquisitionPlacement === true && referencedGoal.contains.length > 0) {
        findings.push({ code: 'CPV-011', severity: 'error', nodePath: pathKey, goalId: node.goalId,
          message: 'acquisitionPlacement may reference only an atomic goal.' })
      }
      if (node.projectionRole === 'voluntary' && (referencedGoal.contains.length > 0 || referencedGoal.type === 'cluster')) {
        findings.push({ code: 'CPV-013', severity: 'error', nodePath: pathKey, goalId: node.goalId,
          message: 'A voluntary goalEntry must reference one canonical atomic goal.' })
      }

      if (referencedGoal.semanticKind === 'curricularArea') {
        findings.push({
          code: 'CPV-009',
          severity: 'error',
          nodePath: pathKey,
          goalId: node.goalId,
          message: 'goalEntry darf keinen als curricularArea klassifizierten kanonischen Cluster als opakes Ziel einblenden; verwende canonicalSubtree oder eine explizite fachliche Struktur aus atomaren Zielen.',
        })
      }

      if (STATE_LOOKING_TITLE_PATTERN.test(referencedGoal.title)) {
        findings.push({
          code: 'CPV-102',
          severity: 'warning',
          nodePath: pathKey,
          goalId: node.goalId,
          message: 'Referenziertes kanonisches Ziel wirkt noch phasen- oder landesspezifisch benannt.',
        })
      }
      return
    }

    if (!(node.goalId ?? '').trim()) {
      findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'canonicalSubtree ohne goalId.' })
      return
    }

    const referencedGoal = index.goalById.get(node.goalId)
    if (!referencedGoal) {
      findings.push({ code: 'CPV-002', severity: 'error', nodePath: pathKey, goalId: node.goalId, message: `Fehlender kanonischer Root: ${node.goalId}` })
      return
    }

    if (STATE_LOOKING_TITLE_PATTERN.test(referencedGoal.title)) {
      findings.push({ code: 'CPV-102', severity: 'warning', nodePath: pathKey, goalId: node.goalId, message: 'Referenzierter kanonischer Root wirkt noch phasen- oder landesspezifisch benannt.' })
    }

    if (getCompositionProjectionRole(node) === 'prerequisiteOnly') {
      return
    }

    const previousPathForSameRoot = referencedRootIds.get(node.goalId)
    if (previousPathForSameRoot) {
      findings.push({
        code: 'CPV-004',
        severity: 'error',
        nodePath: pathKey,
        goalId: node.goalId,
        message: `Derselbe kanonische Root (${node.goalId}) ist bereits unter ${previousPathForSameRoot} referenziert.`,
      })
    } else {
      referencedRootIds.set(node.goalId, pathKey)
    }

    subtreeRootsByPath.set(pathKey, {
      goalId: node.goalId,
      expandedGoalIds: expandCanonicalSubtree(node.goalId, index.descendantsById),
    })
  }

  view.rootNodes.forEach((node, indexOfNode) => validateNode(node, [indexOfNode]))

  const subtreeEntries = Array.from(subtreeRootsByPath.entries())
  for (let leftIndex = 0; leftIndex < subtreeEntries.length; leftIndex += 1) {
    const [leftPath, leftEntry] = subtreeEntries[leftIndex]
    for (let rightIndex = leftIndex + 1; rightIndex < subtreeEntries.length; rightIndex += 1) {
      const [rightPath, rightEntry] = subtreeEntries[rightIndex]
      const overlap = Array.from(leftEntry.expandedGoalIds).filter((goalId) => rightEntry.expandedGoalIds.has(goalId))
      if (overlap.length === 0) continue
      findings.push({
        code: 'CPV-004',
        severity: 'error',
        nodePath: `${leftPath} <> ${rightPath}`,
        message: `Überlappende kanonische Teilbäume (${leftEntry.goalId} / ${rightEntry.goalId}); gemeinsame Ziele: ${overlap.slice(0, 5).join(', ')}${overlap.length > 5 ? ' ...' : ''}`,
      })
    }
  }

  const compileGoalSubtree = (
    goalId: string,
    parentKey: string | null,
    pathKey: string,
    displayLabel?: string,
  ): CompiledCompositionPreviewNode | null => {
    const goal = index.goalById.get(goalId)
    if (!goal || !effectiveVisibleGoalIds.has(goalId)) return null
    noteGoalOccurrence(goal.id, parentKey)
    const runtimeId = `${pathKey}/goal:${goal.id}`
    return {
      runtimeId,
      kind: 'goal',
      label: displayLabel?.trim() || goal.title,
      sourceGoalId: goal.id,
      ...(voluntaryGoalIds.has(goal.id) ? { projectionRole: 'voluntary' as const } : {}),
      children: (index.childrenById.get(goal.id) ?? [])
        .map((childId) => compileGoalSubtree(childId, goal.id, `${runtimeId}/${childId}`))
        .filter((child): child is CompiledCompositionPreviewNode => child !== null),
    }
  }

  const compileNode = (
    node: CompositionViewNode,
    parentKey: string | null,
    path: number[],
  ): CompiledCompositionPreviewNode | null => {
    const pathKey = stringifyNodePath(path)
    if (node.projectionRole !== undefined && node.projectionRole !== 'target'
      && node.projectionRole !== 'prerequisiteOnly' && !(node.kind === 'goalEntry' && node.projectionRole === 'voluntary')) return null
    if (node.kind === 'structure') {
      const runtimeId = `structure:${node.id || pathKey}`
      const children = node.children
        .map((child, indexOfChild) => compileNode(child, runtimeId, [...path, indexOfChild]))
        .filter((child): child is CompiledCompositionPreviewNode => child !== null)
      if (children.length === 0) return null
      return {
        runtimeId,
        kind: 'structure',
        label: node.label,
        children,
      }
    }

    if (node.kind === 'landscapeEntry') {
      const referencedLandscape = landscapeUniverseById?.get(node.landscapeId)
      const rootGoal = referencedLandscape ? getLandscapeRootGoal(referencedLandscape) : null
      if (rootGoal?.id) {
        noteGoalOccurrence(rootGoal.id, parentKey)
      }
      return {
        runtimeId: `landscape:${pathKey}`,
        kind: 'goal',
        label: node.displayLabel?.trim() || rootGoal?.title || referencedLandscape?.title || node.landscapeId,
        sourceGoalId: rootGoal?.id,
        children: [],
      }
    }

    if (node.kind === 'goalEntry') {
      if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
      const goal = index.goalById.get(node.goalId)
      if (!goal || !effectiveVisibleGoalIds.has(goal.id)) return null
      noteGoalOccurrence(goal.id, parentKey)
      return {
        runtimeId: `goalEntry:${pathKey}`,
        kind: 'goal',
        label: node.displayLabel?.trim() || goal.title,
        sourceGoalId: goal.id,
        ...(voluntaryGoalIds.has(goal.id) ? { projectionRole: 'voluntary' as const } : {}),
        children: [],
      }
    }

    if (getCompositionProjectionRole(node) === 'prerequisiteOnly') return null
    return compileGoalSubtree(node.goalId, parentKey, pathKey, node.displayLabel)
  }

  const compiledRootNodes = view.rootNodes
    .map((node, indexOfNode) => compileNode(node, null, [indexOfNode]))
    .filter((node): node is CompiledCompositionPreviewNode => node !== null)

  if (formatVersion === '1.3') {
    for (const goalId of projectionRoles.conflictingGoalIds) {
      findings.push({ code: 'CPV-013', severity: 'error', goalId,
        message: 'Conflicting projection roles for one canonical atom in this view.' })
    }

    const atomicDescendants = (rootId: string): Set<string> => {
      const atoms = new Set<string>(), seen = new Set<string>(), pending = [rootId]
      while (pending.length) {
        const goalId = pending.pop()!
        if (seen.has(goalId)) continue
        seen.add(goalId)
        const goal = index.goalById.get(goalId)
        if (!goal) continue
        if (!goal.contains.length) {
          if (goal.type !== 'cluster') atoms.add(goalId)
        }
        else pending.push(...goal.contains.map(normalizeGoalRef))
      }
      return atoms
    }

    // Count actual authored acquisition places, including opaque goal entries.
    // Preparation templates remain conditional on authoritative runtime placement;
    // repeated templates are not duplicate visible offers in the source tree.
    const placesByAtom = new Map<string, string[]>()
    const notePlaces = (rootId: string, path: string, role: CompositionProjectionRole) => {
      for (const goalId of atomicDescendants(rootId)) {
        const selected = role === 'target' ? projectionRoles.targetAtomicGoalIds.has(goalId)
          : role === 'voluntary' && projectionRoles.voluntaryAtomicGoalIds.has(goalId)
        if (!selected) continue
        const places = placesByAtom.get(goalId) ?? []
        places.push(path); placesByAtom.set(goalId, places)
      }
    }
    const collectPlaces = (nodes: CompositionViewNode[], parent = '') => nodes.forEach((node, offset) => {
      const path = `${parent}${parent ? '.' : ''}${offset}`
      if (node.kind === 'structure') collectPlaces(node.children, path)
      else if (node.kind === 'landscapeEntry') {
        const rootId = rootGoalIdByLandscapeId.get(node.landscapeId)
        if (rootId) notePlaces(rootId, path, 'target')
      } else {
        const role = node.projectionRole
        if (role !== undefined && role !== 'target' && role !== 'prerequisiteOnly' && !(node.kind === 'goalEntry' && role === 'voluntary')) return
        notePlaces(node.goalId, path, role ?? 'target')
      }
    })
    collectPlaces(view.rootNodes)
    for (const goalId of new Set([...projectionRoles.targetAtomicGoalIds, ...projectionRoles.voluntaryAtomicGoalIds])) {
      if ((placesByAtom.get(goalId)?.length ?? 0) !== 1) {
        findings.push({ code: 'CPV-014', severity: 'error', goalId,
          message: 'Every regular target and voluntary atom requires exactly one visible place in its view.' })
      }
    }
    const mandatoryVisited = new Set<string>()
    const mandatoryPending = [...projectionRoles.targetAtomicGoalIds]
    const effectiveRequirements = createCompositionEffectiveRequirementsReader(index.goalById)
    while (mandatoryPending.length) {
      const goalId = mandatoryPending.pop()!
      if (mandatoryVisited.has(goalId)) continue
      mandatoryVisited.add(goalId)
      if (projectionRoles.voluntaryAtomicGoalIds.has(goalId)) {
        findings.push({ code: 'CPV-015', severity: 'error', goalId,
          message: 'The prerequisite closure of a regular target must not pass through a voluntary goal.' })
        continue
      }
      const goal = index.goalById.get(goalId)
      if (goal) mandatoryPending.push(...effectiveRequirements(goalId), ...goal.contains.map(normalizeGoalRef))
    }

    for (const goalId of new Set([...projectionRoles.targetGoalIds, ...projectionRoles.prerequisiteOnlyGoalIds, ...mandatoryVisited])) {
      if (projectionRoles.voluntaryGoalIds.has(goalId)) continue
      const goal = index.goalById.get(goalId)
      const covered = asRecord(goal?.examData).coveredGoalIds
      if (Array.isArray(covered) && covered.some(ref => typeof ref === 'string'
        && [...atomicDescendants(normalizeGoalRef(ref))].some(atom => projectionRoles.voluntaryAtomicGoalIds.has(atom)))) {
        findings.push({ code: 'CPV-016', severity: 'error', goalId,
          message: 'An assessment of any voluntary performance must itself have projectionRole voluntary.' })
      }
    }
  }

  goalOccurrenceCount.forEach((count, goalId) => {
    if (count > 1) {
      findings.push({
        code: 'CPV-005',
        severity: 'error',
        goalId,
        message: `Kanonisches Ziel erscheint mehrfach im kompilierten Baum: ${goalId}`,
      })
    }
  })

  goalParentKeys.forEach((parents, goalId) => {
    if (parents.size > 1) {
      findings.push({
        code: 'CPV-006',
        severity: 'error',
        goalId,
        message: `Kanonisches Ziel hat mehr als einen sichtbaren Parent im kompilierten Baum: ${goalId}`,
      })
    }
  })

  return {
    compiledRootNodes,
    projectionRoles,
    findings: findings.sort((left, right) => {
      const leftKey = `${left.severity}:${left.code}:${left.nodePath ?? ''}:${left.goalId ?? ''}:${left.message}`
      const rightKey = `${right.severity}:${right.code}:${right.nodePath ?? ''}:${right.goalId ?? ''}:${right.message}`
      return leftKey.localeCompare(rightKey, 'de', { numeric: true, sensitivity: 'base' })
    }),
  }
}
