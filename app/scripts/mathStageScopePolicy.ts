import { createHash } from 'node:crypto'
import {
  collectCompositionProjectionRoleGoalIds,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'

/** The explicit mapping/layout selection is independent of preparation edges. */
export function selectReviewedMathTargetBuckets<TBucket extends string>({
  goals, jurisdiction, durationModel, buckets, supplementGoalIds = [], additionalTargetGoalIds = [],
  excludedGoalIds = new Set<string>(), blockedTargetGoalIds = new Set<string>(), bucketForGoal,
}: {
  goals: ReadonlyMap<string, StageGoal>; jurisdiction: string; durationModel: string
  buckets: Record<TBucket, string[]>; supplementGoalIds?: string[]; additionalTargetGoalIds?: string[]
  excludedGoalIds?: ReadonlySet<string>; blockedTargetGoalIds?: ReadonlySet<string>
  bucketForGoal: (id: string) => TBucket | null
}): Record<TBucket, string[]> {
  const applicable = (id: string) => !goals.get(id)?.applicability?.jurisdiction
    || goals.get(id)!.applicability!.jurisdiction!.includes(jurisdiction)
  const selected = Object.fromEntries(Object.entries(buckets).map(([bucket, ids]) => [
    bucket, new Set((ids as string[]).filter(id => applicable(id) || blockedTargetGoalIds.has(id))),
  ])) as Record<TBucket, Set<string>>
  const placed = new Set([...(Object.values(selected) as Set<string>[]).flatMap(ids => [...ids]), ...supplementGoalIds])
  for (const id of [...placed, ...additionalTargetGoalIds]) if (!goals.has(id)) fail(`unknown selected target ${id}`)
  for (const id of additionalTargetGoalIds) {
    // Existing cross-stage placements keep their reviewed parent.
    if (excludedGoalIds.has(id) || placed.has(id)) continue
    if (blockedTargetGoalIds.has(id)) fail(`${jurisdiction} ${durationModel}: additional target ${id} is blocked by the reviewed layout`)
    const bucket = bucketForGoal(id)
    if (bucket === null || selected[bucket] === undefined) fail(`No ${jurisdiction} ${durationModel} bucket for additional target ${id}`)
    selected[bucket].add(id)
    placed.add(id)
  }
  return Object.fromEntries(Object.entries(selected).map(([bucket, ids]) => [bucket, [...ids as Set<string>].sort((a, b) =>
    (goals.get(a)?.title ?? '').localeCompare(goals.get(b)?.title ?? '', 'de', { numeric: true, sensitivity: 'base' }) || a.localeCompare(b)),
  ])) as Record<TBucket, string[]>
}

/** Validate the canonical support context without turning it into selected work. */
export function collectKnownMathSupportContext(targetGoalIds: Iterable<string>, goals: ReadonlyMap<string, StageGoal>): ReadonlySet<string> {
  const parents = new Map<string, string[]>()
  for (const [id, goal] of goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), id])
  const visited = new Set<string>()
  const visit = (id: string): void => {
    if (visited.has(id)) return
    visited.add(id)
    const goal = goals.get(id)
    if (!goal) fail(`missing canonical support goal ${id}`)
    for (const required of goal!.requires ?? []) visit(required)
    for (const child of goal!.contains ?? []) visit(child)
    // Requirements inherited from canonical ancestors are part of runtime context.
    const seenParents = new Set<string>()
    const pending = [...(parents.get(id) ?? [])]
    while (pending.length) {
      const parent = pending.pop()!
      if (seenParents.has(parent)) continue
      seenParents.add(parent)
      for (const required of goals.get(parent)?.requires ?? []) visit(required)
      pending.push(...(parents.get(parent) ?? []))
    }
  }
  for (const id of targetGoalIds) visit(id)
  return visited
}

export type MathAtomicSupportContext = {
  taskGoalIds: string[]
  tasks: Array<{ taskGoalId: string; supportGoalIds: string[]; effectiveDirectPrerequisiteIds: string[] }>
  supportUnionGoalIds: string[]
  directPrerequisiteIdsByGoalId: Record<string, string[]>
}

/** Mirror CompletionProfileCompiler: inherit from every parent, then atomize direct requirements. */
export function collectMathAtomicSupportContext(taskGoalIds: Iterable<string>, goals: ReadonlyMap<string, StageGoal>): MathAtomicSupportContext {
  const ids = [...goals.keys()].sort()
  const contains = new Map<string, Set<string>>()
  const requires = new Map<string, Set<string>>()
  // CompletionCanonicalGraphResolver resolves exact IDs first, then namespace aliases.
  const resolveReference = (ref: string): string => {
    if (goals.has(ref)) return ref
    const separator = ref.indexOf(':')
    if (separator >= 0 && goals.has(ref.slice(separator + 1))) return ref.slice(separator + 1)
    const matches = ids.filter(id => id.endsWith(`:${ref}`))
    if (matches.length > 1) fail(`ambiguous canonical reference ${ref}`)
    return matches[0] ?? ref
  }
  const references = (value: readonly string[] | undefined, kind: string): Set<string> => {
    const values = value ?? []
    if (values.some(id => typeof id !== 'string' || !id.trim())) fail(`invalid canonical ${kind} reference`)
    const resolved = values.map(resolveReference)
    if (resolved.some(id => !goals.has(id)) || new Set(resolved).size !== resolved.length) {
      fail(`invalid or missing canonical ${kind} reference`)
    }
    return new Set(resolved)
  }
  for (const id of ids) {
    const goal = goals.get(id)!
    if (!id.trim() || !goal || goal.id !== id) fail(`canonical identity mismatch ${id}`)
    contains.set(id, references(goal.contains, 'contains'))
    requires.set(id, references(goal.requires, 'requires'))
    if (goal.type && (goal.type.toLowerCase() === 'atomic') !== !goal.contains?.length) fail(`canonical atomic/cluster mismatch ${id}`)
  }
  const order = (edges: ReadonlyMap<string, ReadonlySet<string>>, kind: string): string[] => {
    const degree = new Map([...edges.keys()].map(id => [id, 0]))
    for (const children of edges.values()) for (const child of children) degree.set(child, (degree.get(child) ?? 0) + 1)
    const pending = [...degree].filter(([, count]) => count === 0).map(([id]) => id).sort()
    const result: string[] = []
    for (let index = 0; index < pending.length; index++) {
      const id = pending[index]
      result.push(id)
      for (const child of edges.get(id) ?? []) {
        degree.set(child, degree.get(child)! - 1)
        if (degree.get(child) === 0) pending.push(child)
      }
    }
    if (result.length !== edges.size) fail(`canonical ${kind} cycle`)
    return result
  }
  const containsOrder = order(contains, 'contains')
  order(requires, 'requires')
  const effective = new Map([...requires].map(([id, refs]) => [id, new Set(refs)]))
  for (const id of containsOrder) for (const child of contains.get(id)!) {
    for (const ref of effective.get(id)!) effective.get(child)!.add(ref)
  }
  const atoms = new Map<string, Set<string>>()
  for (const id of [...containsOrder].reverse()) {
    const children = contains.get(id)!
    atoms.set(id, children.size ? new Set([...children].flatMap(child => [...atoms.get(child)!])) : new Set([id]))
  }
  const roots = [...taskGoalIds]
  if (!roots.length || new Set(roots).size !== roots.length || roots.some(id => !goals.has(id) || contains.get(id)!.size)) {
    fail('atomic task context needs distinct known atomic roots')
  }
  roots.sort()
  const expanded = new Map<string, Set<string>>()
  const contexts = roots.map(taskGoalId => {
    const context = new Set<string>()
    const pending = [taskGoalId]
    for (let index = 0; index < pending.length; index++) {
      const id = pending[index]
      if (context.has(id)) continue
      context.add(id)
      if (!expanded.has(id)) expanded.set(id, new Set([...effective.get(id)!].flatMap(ref => [...atoms.get(ref)!])))
      pending.push(...expanded.get(id)!)
    }
    return { taskGoalId, supportGoalIds: [...context].filter(id => id !== taskGoalId).sort(),
      effectiveDirectPrerequisiteIds: [...expanded.get(taskGoalId)!].sort() }
  })
  order(expanded, 'atomic requirement')
  return {
    taskGoalIds: roots,
    tasks: contexts,
    supportUnionGoalIds: [...new Set(contexts.flatMap(task => task.supportGoalIds))].sort(),
    directPrerequisiteIdsByGoalId: Object.fromEntries([...expanded].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .map(([id, refs]) => [id, [...refs].sort()])),
  }
}

export function assertKnownMathTargetSupport(targetGoalIds: Iterable<string>, goals: ReadonlyMap<string, StageGoal>): void {
  collectKnownMathSupportContext(targetGoalIds, goals)
}

export type MathStageScopeRule = {
  id: string; jurisdiction: string; durationModels: string[]
  deniedGoalIds: string[]; retainedGoalIds: string[]; additionalTargetGoalIds: string[]
  relocateGoalIds: string[]; sourceDecision: string; additionalTargetLabel?: string
  additionalSourceDecisions?: string[]
  stageGroups?: Array<{ id: string; label: string; goalIds: string[]; assessmentGoalIds: string[] }>
  deniedAssessmentGoalIds?: string[]
}
export type MathAssessmentScopeOperation = {
  id: string; viewId: string; goalIds: string[]; action: 'exclude-target' | 'relocate-existing-target' | 'include-target'
  anchorStructureId: string; label: string; sourceDecision: string; directReference?: boolean
  exactExamSlot?: {
    expectedScope: Record<string, string | undefined>; childIndex: number; expectedReference: CompositionViewNode
    beforeAnchorObjectSha256: string; afterAnchorObjectSha256: string; wrapperStructureId?: string
  }
}
type StageGoal = { id?: string; type?: string; title?: string; applicability?: { jurisdiction?: string[] }; contains?: readonly string[]; requires?: readonly string[]; nodeKind?: string; examData?: unknown }
type View = { viewId: string; scope?: Record<string, string | undefined>; rootNodes: CompositionViewNode[] }
const sorted = (ids: Iterable<string>) => [...new Set(ids)].sort()
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
function fail(message: string): never { throw new Error(`Mathematics stage scope: ${message}`) }

/** Resolve explicit source decisions, never phase/year/requirement heuristics. */
export function mathStageRuleForScope(rules: MathStageScopeRule[], jurisdiction: string, durationModels: string[]): MathStageScopeRule | undefined {
  const matches = durationModels.map(duration => {
    const found = rules.filter(rule => rule.jurisdiction === jurisdiction && rule.durationModels.includes(duration))
    if (found.length > 1) fail(`ambiguous ${jurisdiction}/${duration} decision`)
    return found[0]
  })
  if (matches.every(rule => !rule)) return undefined
  if (matches.some(rule => !rule)) fail(`duration-neutral output lacks a decision for every ${jurisdiction} offering`)
  const first = matches[0]!
  const fields = (rule: MathStageScopeRule) => [sorted(rule.deniedGoalIds), sorted(rule.retainedGoalIds), rule.additionalTargetGoalIds,
    sorted(rule.relocateGoalIds), rule.additionalTargetLabel ?? '', rule.stageGroups ?? [], sorted(rule.deniedAssessmentGoalIds ?? [])]
  if (matches.some(rule => !same(fields(first), fields(rule!)))) fail(`explicit ${jurisdiction} duration decisions require separate output views`)
  return first
}

/**
 * Prune only the reviewed stage fragment. Cross-stage aliases of explicitly
 * relocated goals are split along their affected canonical path; all other
 * stages retain their target contracts. No ordinary requirement is removed.
 */
export function applyMathStageScopeRule<T extends View>(
  input: T,
  goals: ReadonlyMap<string, StageGoal>,
  rule: MathStageScopeRule | undefined,
  stageAnchorId: string,
  crossStage: boolean,
): { view: T; splitCanonicalGoalIds: string[]; addedAtomicGoalIds: string[]; removedAtomicGoalIds: string[]; relocatedGoalIds: string[] } {
  if (!rule) return { view: input, splitCanonicalGoalIds: [], addedAtomicGoalIds: [], removedAtomicGoalIds: [], relocatedGoalIds: [] }
  const deniedOrdinary = new Set(rule.deniedGoalIds)
  const denied = new Set([...deniedOrdinary, ...(rule.deniedAssessmentGoalIds ?? [])])
  const additions = new Set(rule.additionalTargetGoalIds)
  if (rule.relocateGoalIds.some(id => !additions.has(id))) fail('relocation needs an explicit positive stage target decision')
  for (const id of [...deniedOrdinary, ...additions, ...rule.retainedGoalIds]) {
    const goal = goals.get(id)
    if (!goal || goal.contains?.length || ['exam', 'memory'].includes(goal.nodeKind ?? '') || goal.examData) fail(`${id} is not an existing ordinary atomic stage contract`)
  }
  for (const id of rule.deniedAssessmentGoalIds ?? []) {
    const goal = goals.get(id)
    if (!goal || goal.contains?.length || goal.nodeKind === 'memory' || !(goal.nodeKind === 'exam' || goal.examData)
      || !rule.sourceDecision) fail('assessment exclusion requires its exact separate source/scope decision')
  }
  if ([...denied].some(id => additions.has(id) || rule.retainedGoalIds.includes(id))) fail('conflicting source role decisions')
  const before = collectCompositionProjectionRoleGoalIds(input.rootNodes, goals)
  const stageGroups = rule.stageGroups ?? []
  const groupedGoalIds = new Set(stageGroups.flatMap(group => group.goalIds))
  for (const group of stageGroups) for (const id of group.goalIds) {
    const goal = goals.get(id)
    const assessment = goal?.examData as { reviewStatus?: string } | undefined
    if (!goal || goal.contains?.length || goal.nodeKind === 'memory' || !before.targetGoalIds.has(id)) fail('a stage group only relocates existing selected atomic targets')
    if ((goal.nodeKind === 'exam' || goal.examData) && (!group.assessmentGoalIds.includes(id) || assessment?.reviewStatus !== 'released')) fail('stage group assessment needs its explicit released content decision')
  }
  const result = structuredClone(input)
  const splitIds = new Set<string>()
  const relocated = new Set<string>()
  const descendants = (id: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(id)) fail('canonical contains cycle')
    const next = new Set(seen).add(id)
    return new Set([id, ...(goals.get(id)?.contains ?? []).flatMap(child => [...descendants(child, next)])])
  }
  const pruneReference = (node: Exclude<CompositionViewNode, { kind: 'structure' }>, omitted: ReadonlySet<string>): CompositionViewNode[] => {
    if (node.kind === 'landscapeEntry') fail('stage pruning does not support opaque landscape references')
    if (node.projectionRole === 'prerequisiteOnly') return [structuredClone(node)]
    if (omitted.has(node.goalId)) return []
    if (node.kind === 'goalEntry') return [structuredClone(node)] // goalEntry is opaque.
    const closure = descendants(node.goalId)
    if (![...omitted].some(id => closure.has(id))) return [structuredClone(node)]
    const goal = goals.get(node.goalId)
    if (goal?.requires?.length) fail(`splitting ${node.goalId} needs an explicit inherited-requirement preservation decision`)
    splitIds.add(node.goalId)
    const children = (goal?.contains ?? []).flatMap(id => pruneReference({ kind: 'canonicalSubtree', goalId: id }, omitted))
    return children.length ? [{ kind: 'structure', id: `reviewed-stage-split-${node.goalId}`,
      label: node.displayLabel ?? goal?.title ?? node.goalId, children }] : []
  }
  let anchors = 0
  const relocate = new Set(crossStage ? rule.relocateGoalIds : [])
  const visit = (nodes: CompositionViewNode[], insideStage: boolean): CompositionViewNode[] => nodes.flatMap<CompositionViewNode>(node => {
    if (node.kind === 'structure') {
      const isAnchor = node.id === stageAnchorId
      if (isAnchor) anchors++
      const children = visit(node.children, insideStage || isAnchor)
      if (!isAnchor && node.children.length && !children.length) return []
      return [{ ...structuredClone(node), children }]
    }
    const omitted = !crossStage || insideStage ? new Set([...denied, ...groupedGoalIds]) : relocate
    if (crossStage && !insideStage && node.kind !== 'landscapeEntry' && node.projectionRole !== 'prerequisiteOnly') {
      const closure = node.kind === 'goalEntry' ? new Set([node.goalId]) : descendants(node.goalId)
      for (const id of relocate) if (closure.has(id) && before.targetGoalIds.has(id)) relocated.add(id)
    }
    return pruneReference(node, omitted)
  })
  result.rootNodes = visit(result.rootNodes, false)
  if (anchors !== 1) fail(`${input.viewId}: expected one explicit stage anchor ${stageAnchorId}`)
  const append = (nodes: CompositionViewNode[]): void => {
    for (const node of nodes) if (node.kind === 'structure') {
      if (node.id !== stageAnchorId) { append(node.children); continue }
      const stageRoles = collectCompositionProjectionRoleGoalIds([node], goals)
      const missing = rule.additionalTargetGoalIds.filter(id => !stageRoles.targetGoalIds.has(id))
      if (missing.length) {
        const additionId = `reviewed-stage-additions-${rule.jurisdiction.toLowerCase()}`
        const existing = node.children.filter(child => child.kind === 'structure' && child.id === additionId)
        if (existing.length > 1) fail('ambiguous authored stage additions container')
        if (existing[0]?.kind === 'structure') {
          existing[0].label = rule.additionalTargetLabel ?? existing[0].label
          existing[0].children.push(...missing.map(id => ({ kind: 'goalEntry' as const, goalId: id })))
        } else node.children.push({ kind: 'structure', id: additionId,
          label: rule.additionalTargetLabel ?? 'Funktionen und Änderungsraten', children: missing.map(id => ({ kind: 'goalEntry', goalId: id })) })
      }
      for (const group of stageGroups) node.children.push({ kind: 'structure', id: group.id, label: group.label,
        children: group.goalIds.map(id => ({ kind: 'goalEntry', goalId: id })) })
    }
  }
  append(result.rootNodes)
  // Splitting an inherited reference can increase specificity. Preserve the
  // original resolved support roles, except explicitly added reviewed targets.
  let after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  const revivedSupport = [...before.prerequisiteOnlyGoalIds].filter(id => after.targetGoalIds.has(id) && !additions.has(id))
  result.rootNodes.push(...revivedSupport.map(id => ({ kind: 'goalEntry' as const, goalId: id, projectionRole: 'prerequisiteOnly' as const })))
  after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  result.rootNodes.push(...[...denied].filter(id => !after.targetGoalIds.has(id) && !after.prerequisiteOnlyGoalIds.has(id))
    .map(id => ({ kind: 'goalEntry' as const, goalId: id, projectionRole: 'prerequisiteOnly' as const })))
  after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  const atomic = (ids: Iterable<string>) => sorted([...ids].filter(id => !goals.get(id)?.contains?.length))
  const removed = atomic([...before.targetGoalIds].filter(id => !after.targetGoalIds.has(id)))
  const added = atomic([...after.targetGoalIds].filter(id => !before.targetGoalIds.has(id)))
  if (removed.some(id => !denied.has(id)) || added.some(id => !additions.has(id))) fail(`${input.viewId}: unapproved atomic target delta`)
  if (rule.retainedGoalIds.some(id => !after.targetGoalIds.has(id)) || rule.additionalTargetGoalIds.some(id => !after.targetGoalIds.has(id))) fail(`${input.viewId}: source-supported target missing`)
  const findAnchor = (nodes: CompositionViewNode[]): Extract<CompositionViewNode, { kind: 'structure' }> | undefined => {
    for (const node of nodes) if (node.kind === 'structure') {
      if (node.id === stageAnchorId) return node
      const found = findAnchor(node.children)
      if (found) return found
    }
  }
  const finalStage = collectCompositionProjectionRoleGoalIds([findAnchor(result.rootNodes)!], goals)
  if ([...denied].some(id => finalStage.targetGoalIds.has(id))) fail(`${input.viewId}: denied atom remains in stage placement`)
  if (rule.retainedGoalIds.some(id => !finalStage.targetGoalIds.has(id))) fail(`${input.viewId}: retained target missing from its actual stage placement`)
  if (rule.additionalTargetGoalIds.some(id => !finalStage.targetGoalIds.has(id))) fail(`${input.viewId}: added target missing from stage placement`)
  if ([...groupedGoalIds].some(id => !finalStage.targetGoalIds.has(id))) fail(`${input.viewId}: relocated group target missing from stage placement`)
  return { view: result, splitCanonicalGoalIds: sorted(splitIds), addedAtomicGoalIds: added, removedAtomicGoalIds: removed, relocatedGoalIds: sorted(relocated) }
}

/** Add only separately reviewed whole contracts at an exact authored stage anchor. */
export function addReviewedMathStageTargets<T extends View>(
  input: T, goals: ReadonlyMap<string, StageGoal>, goalIds: string[], anchorId: string, decisionId: string, label = 'Differentialrechnung',
  assessmentGoalIds: string[] = [], directReference = false,
): T {
  if (!decisionId || new Set(goalIds).size !== goalIds.length) fail('invalid explicit positive stage decision')
  for (const id of goalIds) {
    const goal = goals.get(id)
    if (!goal || goal.contains?.length || goal.nodeKind === 'memory') fail('positive placement requires an existing atomic goal')
    if ((goal.nodeKind === 'exam' || goal.examData) && !assessmentGoalIds.includes(id)) fail('assessment placement requires its exact separate reviewed identity')
  }
  const result = structuredClone(input)
  let anchors = 0
  const visit = (nodes: CompositionViewNode[]): void => {
    for (const node of nodes) if (node.kind === 'structure') {
      if (node.id !== anchorId) { visit(node.children); continue }
      anchors++
      const all = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
      const local = collectCompositionProjectionRoleGoalIds([node], goals)
      const missing = goalIds.filter(id => !local.targetGoalIds.has(id))
      if (missing.some(id => all.targetGoalIds.has(id))) fail('existing target needs an explicit relocation before its positive stage placement')
      if (directReference) node.children.push(...missing.map(id => ({ kind: 'goalEntry' as const, goalId: id, projectionRole: 'target' as const })))
      else if (missing.length) node.children.push({ kind: 'structure', id: `reviewed-stage-positive-${decisionId}`,
        label, children: missing.map(id => ({ kind: 'goalEntry', goalId: id })) })
    }
  }
  visit(result.rootNodes)
  if (anchors !== 1) fail(`positive placement needs exact stage anchor ${anchorId}`)
  const roles = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  if (goalIds.some(id => !roles.targetGoalIds.has(id))) fail('positive placement was overridden by another authored role')
  return result
}

/** Relocate existing ordinary contracts across authored stage boundaries. */
export function relocateReviewedMathStageTargets<T extends View>(
  input: T, goals: ReadonlyMap<string, StageGoal>, goalIds: string[], anchorId: string, decisionId: string, label: string,
  assessmentGoalIds: string[] = [],
): T {
  const before = collectCompositionProjectionRoleGoalIds(input.rootNodes, goals)
  if (goalIds.some(id => !before.targetGoalIds.has(id))) fail('relocation requires every whole contract to be an existing selected target')
  const removed = applyMathStageScopeRule(input, goals, {
    id: decisionId, jurisdiction: '', durationModels: [], deniedGoalIds: goalIds.filter(id => !assessmentGoalIds.includes(id)),
    deniedAssessmentGoalIds: assessmentGoalIds, retainedGoalIds: [],
    additionalTargetGoalIds: [], relocateGoalIds: [], sourceDecision: decisionId,
  }, anchorId, false).view
  const result = addReviewedMathStageTargets(removed, goals, goalIds, anchorId, decisionId, label, assessmentGoalIds)
  const after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  const atomic = (ids: Iterable<string>) => sorted([...ids].filter(id => !goals.get(id)?.contains?.length))
  if (!same(atomic(before.targetGoalIds), atomic(after.targetGoalIds))) fail('relocation changed the whole-curriculum atomic target universe')
  return result
}

/** Preserve a reviewed exam slot whole; hidden preparation never becomes target work. */
function includeAssessmentInExactExamSlot<T extends View>(
  input: T, goals: ReadonlyMap<string, StageGoal>, operation: MathAssessmentScopeOperation,
): T {
  const slot = operation.exactExamSlot!
  const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value)
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, stable(child)])) : value
  const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
  const error = (message: string): never => fail(`exact exam slot: ${message}`)
  if (!slot || operation.action !== 'include-target' || operation.directReference !== undefined || operation.goalIds.length !== 1
    || !slot.expectedScope || Array.isArray(slot.expectedScope) || !Object.keys(slot.expectedScope).length
    || Object.values(slot.expectedScope).some(value => typeof value !== 'string' || !value.trim())
    || !input.scope || !same(sorted(Object.keys(input.scope)), sorted(Object.keys(slot.expectedScope)))
    || Object.entries(slot.expectedScope).some(([key, value]) => input.scope![key] !== value)) error('action, identity or exact scope differs')
  if (!Number.isSafeInteger(slot.childIndex) || slot.childIndex < 0
    || !/^[a-f0-9]{64}$/.test(slot.beforeAnchorObjectSha256) || !/^[a-f0-9]{64}$/.test(slot.afterAnchorObjectSha256)
    || slot.beforeAnchorObjectSha256 === slot.afterAnchorObjectSha256) error('invalid slot or object hashes')
  const id = operation.goalIds[0]
  const goal = goals.get(id)
  if (!goal) return error('unknown assessment')
  const exam = goal?.examData as { reviewStatus?: string; coveredGoalIds?: string[] } | undefined
  if (goal.contains?.length || goal.nodeKind === 'memory' || exam?.reviewStatus !== 'released') error('task is not a released atomic assessment')
  const required = goal.requires ?? [], covered = exam?.coveredGoalIds ?? []
  for (const refs of [required, covered]) {
    if (!refs.length || new Set(refs).size !== refs.length
      || refs.some(ref => typeof ref !== 'string' || !ref.trim() || ref === id || !goals.has(ref))) error('unknown or empty requires/coverage contract')
  }
  type Structure = Extract<CompositionViewNode, { kind: 'structure' }>
  const find = (nodes: CompositionViewNode[], structureId: string): Structure[] => nodes.flatMap(node =>
    node.kind === 'structure' ? [...(node.id === structureId ? [node] : []), ...find(node.children, structureId)] : [])
  const result = structuredClone(input)
  const anchors = find(result.rootNodes, operation.anchorStructureId)
  if (anchors.length !== 1 || slot.childIndex >= anchors[0].children.length) error('missing or ambiguous anchor/slot')
  const anchor = anchors[0]
  const reference = slot.expectedReference
  if (!reference || !['structure', 'canonicalSubtree'].includes(reference.kind)) error('unsupported original reference')
  const entry: CompositionViewNode = { kind: 'goalEntry', goalId: id, projectionRole: 'target' }
  let replacement: Structure
  if (reference.kind === 'structure') {
    if (slot.wrapperStructureId !== undefined || !reference.id || !reference.label || !Array.isArray(reference.children)
      || reference.label !== operation.label) error('original structure differs')
    replacement = { ...structuredClone(reference), children: [...structuredClone(reference.children), entry] }
  } else if (reference.kind === 'canonicalSubtree') {
    if (!goals.get(reference.goalId)?.contains?.length || reference.projectionRole === 'prerequisiteOnly'
      || !slot.wrapperStructureId?.trim() || !operation.label.trim()
      || reference.displayLabel && reference.displayLabel !== operation.label) error('invalid preserved subtree wrapper')
    replacement = { kind: 'structure', id: slot.wrapperStructureId!, label: operation.label, children: [structuredClone(reference), entry] }
  } else return error('unsupported original reference')
  const applied = hash(anchor) === slot.afterAnchorObjectSha256
  if (applied) {
    if (hash(anchor.children[slot.childIndex]) !== hash(replacement)) error('applied replacement drifted')
  } else if (hash(anchor) !== slot.beforeAnchorObjectSha256 || hash(anchor.children[slot.childIndex]) !== hash(reference)) error('before anchor/reference drifted')
  // Reconstruct the exact original view even for an idempotent call, so a
  // second target reference or a changed outer role cannot hide behind its hash.
  const original = structuredClone(result)
  const originalAnchor = find(original.rootNodes, operation.anchorStructureId)[0]
  originalAnchor.children[slot.childIndex] = structuredClone(reference)
  if (hash(originalAnchor) !== slot.beforeAnchorObjectSha256) error('original anchor cannot be reconstructed')
  const wrapperId = replacement.id
  if (find(original.rootNodes, wrapperId).length !== (reference.kind === 'structure' ? 1 : 0)) error('ambiguous wrapper identity')
  const containsTask = (root: string): boolean => {
    const seen = new Set<string>(), pending = [root]
    for (const current of pending) {
      if (current === id) return true
      if (seen.has(current)) continue
      seen.add(current)
      const currentGoal = goals.get(current)
      if (!currentGoal) error('unknown referenced goal')
      pending.push(...(currentGoal!.contains ?? []))
    }
    return false
  }
  const occurrences = (nodes: CompositionViewNode[]): number => nodes.reduce((count, node) => count + (node.kind === 'structure'
    ? occurrences(node.children) : node.kind === 'landscapeEntry' || node.projectionRole === 'prerequisiteOnly' ? 0
      : node.kind === 'goalEntry' ? Number(node.goalId === id) : Number(containsTask(node.goalId))), 0)
  const before = collectCompositionProjectionRoleGoalIds(original.rootNodes, goals)
  if (occurrences(original.rootNodes) || before.targetGoalIds.has(id) || before.prerequisiteOnlyGoalIds.has(id)) error('task already referenced outside the reviewed slot')
  if ([...required, ...covered].some(ref => !before.targetGoalIds.has(ref))) error('whole required/covered target unavailable')
  anchor.children[slot.childIndex] = replacement
  if (hash(anchor) !== slot.afterAnchorObjectSha256 || find(result.rootNodes, wrapperId).length !== 1 || occurrences(result.rootNodes) !== 1) error('after anchor or unique task reference differs')
  const after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  if (!same(sorted(after.targetGoalIds), sorted([...before.targetGoalIds, id]))
    || !same(sorted(after.prerequisiteOnlyGoalIds), sorted(before.prerequisiteOnlyGoalIds))) error('target/support roles changed')
  return result
}

/** Explicit view operations for independently reviewed whole-assessment scopes. */
export function applyMathAssessmentScopeOperations<T extends View>(
  input: T, goals: ReadonlyMap<string, StageGoal>, operations: MathAssessmentScopeOperation[],
): T {
  let result = input
  for (const operation of operations.filter(candidate => candidate.viewId === input.viewId)) {
    if (!operation.sourceDecision || !operation.goalIds.length) fail('assessment operation lacks its exact author decision')
    for (const id of operation.goalIds) {
      const goal = goals.get(id)
      if (!goal || goal.contains?.length || goal.nodeKind === 'memory' || !(goal.nodeKind === 'exam' || goal.examData)) {
        fail('assessment operation requires its exact separate source/scope decision for an existing assessment')
      }
    }
    if (operation.exactExamSlot !== undefined) {
      result = includeAssessmentInExactExamSlot(result, goals, operation)
    } else if (operation.action === 'exclude-target') {
      // A whole-view exclusion needs no subtree split. Keep the exact authored
      // cluster so its unmodified LK counterpart still merges into one tree.
      const before = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
      const excluded = new Set(operation.goalIds)
      const masked = new Set<string>()
      let anchors = 0
      const visit = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap<CompositionViewNode>(node => {
        if (node.kind === 'structure') {
          if (node.id === operation.anchorStructureId) anchors++
          const children = visit(node.children)
          return node.children.length && !children.length && node.id !== operation.anchorStructureId ? [] : [{ ...node, children }]
        }
        if (node.kind === 'landscapeEntry' || !excluded.has(node.goalId)) return [structuredClone(node)]
        if (node.projectionRole !== 'prerequisiteOnly') return []
        if (node.kind === 'goalEntry') masked.add(node.goalId)
        return [structuredClone(node)]
      })
      result = { ...structuredClone(result), rootNodes: visit(result.rootNodes) }
      if (anchors !== 1) fail(`assessment exclusion needs exact stage anchor ${operation.anchorStructureId}`)
      result.rootNodes.push(...operation.goalIds.filter(id => !masked.has(id))
        .map(id => ({ kind: 'goalEntry' as const, goalId: id, projectionRole: 'prerequisiteOnly' as const })))
      const after = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
      if (operation.goalIds.some(id => after.targetGoalIds.has(id))) fail('assessment exclusion remains a target')
      const expected = [...before.targetGoalIds].filter(id => !excluded.has(id))
      if (!same(sorted(expected), sorted(after.targetGoalIds))) fail('assessment exclusion changed another target contract')
    } else if (operation.action === 'relocate-existing-target') {
      result = relocateReviewedMathStageTargets(result, goals, operation.goalIds, operation.anchorStructureId,
        operation.id, operation.label, operation.goalIds)
    } else if (operation.action === 'include-target') {
      result = addReviewedMathStageTargets(result, goals, operation.goalIds, operation.anchorStructureId,
        operation.id, operation.label, operation.goalIds, operation.directReference === true)
    } else fail('unknown assessment scope operation')
  }
  return result
}
