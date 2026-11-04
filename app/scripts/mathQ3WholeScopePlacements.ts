import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import type { CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'

type Binding = { path: string; sha256: string }
type Goal = { id?: string; contains?: readonly string[]; requires?: readonly string[] }
type View = { viewId: string; rootNodes: CompositionViewNode[] }
type Operation = { id: string; viewId: string; goalId: string; projectionRole: 'target' | 'prerequisiteOnly'; anchorStructureId: string | null; label: string; scopeRows: string[]; removePrerequisiteOnlyMask?: { parentStructureId: string | null; childIndex: number; reference: CompositionViewNode } }
type Rule = { viewId: string; beforeView: Binding; operations: Operation[] }
type Plan = { schemaVersion: number; kind: string; authorProposalIsNotImplementationAcceptance: boolean; contentDecision: Binding; baselineCanonical: Binding; baselineScopeViewRouting: Binding; newAssessmentIds: string[]; exactChangedGoalIds: string[]; integratedWholeGoals: Binding[]; assets: Binding[]; views: Rule[]; independentPlacementFindings?: Binding; retainedTargetPaths: { viewId: string; goalId: string; scope: string }[] }
const q3NewIdentities = ["f74d944a-e09b-5e01-867b-09740fadf18d", "51b008fd-2ce4-5e38-98b1-75c9ede34f6d", "57833097-393c-5a08-8c03-e161b43cb9cc", "7246cd87-b720-5866-8c0c-3b93fec46189", "ed344e04-818b-59ab-9b4a-087428c05c8f", "a789460f-92b8-565a-82ca-d5d6b7928b19", "6e977ea1-0d38-54bb-82d7-12e6326845af", "095df29a-6791-50aa-aff1-b3d94d9b5eeb", "fdba2315-d467-568c-a6b7-64c15d414935", "f59b0af8-b90a-5cdb-88d6-561323a4f763", "63576e96-1fdd-5bd5-a875-e0c010a534d7"]
const policyPath = 'app/scripts/config/math-country-seki-stage-policy.json'
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => [k, stable(v)])) : value
const equal = (a: unknown, b: unknown) => JSON.stringify(stable(a)) === JSON.stringify(stable(b))
const fail = (message: string): never => { throw new Error(`Q3 whole scope placement: ${message}`) }
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
function load(root: string, goals: ReadonlyMap<string, Goal>): Plan | undefined {
  const policy = JSON.parse(readFileSync(resolve(root, policyPath), 'utf8')) as { q3WholeScopePlacement?: Binding; stageDecisionBindings: Binding[] }
  if (!policy.q3WholeScopePlacement) {
    if (q3NewIdentities.some(id => goals.has(id))) fail('Q3 identities require their exact bound scope contract')
    return undefined
  }
  const checked = (binding: Binding): unknown => {
    if (!policy.stageDecisionBindings.some(b => equal(b, binding)) || digest(readFileSync(resolve(root, binding.path))) !== binding.sha256) fail(`missing or stale bound input ${binding.path}`)
    return JSON.parse(readFileSync(resolve(root, binding.path), 'utf8'))
  }
  const plan = checked(policy.q3WholeScopePlacement) as Plan
  if (plan.schemaVersion !== 1 || plan.kind !== 'reviewed-q3-whole-scope-placement-development-contract' || !plan.authorProposalIsNotImplementationAcceptance) fail('development contract differs')
  const decision = checked(plan.contentDecision) as { verdict: string; acceptedForms: { goalId: string; exactTargetScopes: string[] }[]; acceptedExistingWholeReuses: { goalId: string; exactTargetScopes: string[] }[]; integrationContract: { onlyNewPreparationContext: { goalId: string; exactScopes: string[] } } }
  if (decision.verdict !== 'PASS_FINITE_CONTENT_SOURCE_R_RUBRIC_UX_WITH_FROZEN_OVERLAY' || decision.acceptedForms.length !== 12 || decision.acceptedExistingWholeReuses.length !== 6) fail('genuine content review differs')
  const baseline = checked(plan.baselineCanonical) as { goals: Goal[] }
  const expected = new Map<string, Goal>()
  for (const binding of plan.integratedWholeGoals) { const goal = checked(binding) as Goal; if (!goal.id || expected.has(goal.id)) fail('duplicate integrated identity'); expected.set(goal.id!, goal) }
  if (!equal([...expected.keys()].sort(), [...plan.exactChangedGoalIds].sort()) || plan.newAssessmentIds.length !== 11 || goals.size !== baseline.goals.length + 11) fail('canonical delta inventory differs')
  for (const old of baseline.goals) if (!old.id || !equal(goals.get(old.id), expected.get(old.id) ?? old)) fail(`changed unapproved canonical object ${old.id}`)
  for (const id of plan.newAssessmentIds) if (baseline.goals.some(g => g.id === id) || !equal(goals.get(id), expected.get(id))) fail(`new canonical identity differs ${id}`)
  for (const asset of plan.assets) if (!policy.stageDecisionBindings.some(b => equal(b, asset)) || digest(readFileSync(resolve(root, asset.path))) !== asset.sha256) fail('runtime asset drift')
  const routing = checked(plan.baselineScopeViewRouting) as { actualScopeCount: number; rows: { scope: string; viewId: string }[] }
  if (routing.actualScopeCount !== 161 || routing.rows.length !== 161 || new Set(routing.rows.map(row => row.scope)).size !== 161) fail('baseline scope routing differs')
  const approved = new Map([...decision.acceptedForms, ...decision.acceptedExistingWholeReuses].map(row => [row.goalId, row.exactTargetScopes]))
  const support = decision.integrationContract.onlyNewPreparationContext
  const placementFindings = plan.independentPlacementFindings ? checked(plan.independentPlacementFindings) as { scope: string; targetExtra?: string[] }[] : []
  const operationIds = new Set<string>(), seenViews = new Set<string>()
  for (const rule of plan.views) {
    checked(rule.beforeView)
    if (seenViews.has(rule.viewId)) fail('duplicate view rule'); seenViews.add(rule.viewId)
    const scopes = routing.rows.filter(row => row.viewId === rule.viewId).map(row => row.scope).sort()
    if (!scopes.length) fail('view lacks actual baseline scope routing')
    for (const op of rule.operations) {
      const allowed = op.projectionRole === 'prerequisiteOnly' && op.goalId === support.goalId ? support.exactScopes
        : op.projectionRole === 'prerequisiteOnly' ? placementFindings.filter(row => row.targetExtra?.includes(op.goalId)).map(row => row.scope)
        : op.projectionRole === 'target' ? approved.get(op.goalId) : undefined
      if (op.viewId !== rule.viewId || operationIds.has(op.id) || !equal([...op.scopeRows].sort(), scopes) || !allowed || scopes.some(scope => !allowed.includes(scope))) fail('operation differs from independent exact identity/scope/role decision')
      operationIds.add(op.id)
    }
  }
  return plan
}
function wrapper(operation: Operation): CompositionViewNode {
  const node: CompositionViewNode = operation.projectionRole === 'prerequisiteOnly'
    ? { kind: 'goalEntry', goalId: operation.goalId, projectionRole: 'prerequisiteOnly' }
    : { kind: 'goalEntry', goalId: operation.goalId }
  return { kind: 'structure', id: operation.id, label: operation.label, children: [node] }
}
function structures(nodes: CompositionViewNode[], id: string): Extract<CompositionViewNode, { kind: 'structure' }>[] {
  return nodes.flatMap(node => node.kind === 'structure' ? [...(node.id === id ? [node] : []), ...structures(node.children, id)] : [])
}
function strip(view: View, rule: Rule): View {
  const ids = new Map(rule.operations.map(operation => [operation.id, operation]))
  const visit = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap<CompositionViewNode>(node => {
    if (node.kind !== 'structure') return [node]
    const operation = ids.get(node.id)
    if (operation) { if (!equal(node, wrapper(operation))) fail('modified Q3 wrapper'); return [] }
    return [{ ...node, children: visit(node.children) }]
  })
  const result = { ...view, rootNodes: visit(view.rootNodes) }
  for (const operation of rule.operations) if (operation.removePrerequisiteOnlyMask) {
    const mask = operation.removePrerequisiteOnlyMask
    const anchors = mask.parentStructureId ? structures(result.rootNodes, mask.parentStructureId) : []
    if (mask.parentStructureId && anchors.length !== 1) fail('mask restoration parent differs')
    const nodes = anchors[0]?.children ?? result.rootNodes
    if (nodes.some(node => equal(node, mask.reference))) fail('removed mask was retained or duplicated')
    nodes.splice(mask.childIndex, 0, structuredClone(mask.reference))
  }
  return result
}
/** Build-time additive layer. The G5 and older exact producer guards see their unchanged reviewed source. */
export function withoutQ3WholeScopePlacements<T extends View>(view: T, goals: ReadonlyMap<string, Goal>, root: string): T {
  const plan = load(root, goals), rule = plan?.views.find(r => r.viewId === view.viewId)
  if (!rule) return view
  const before = JSON.parse(readFileSync(resolve(root, rule.beforeView.path), 'utf8')) as View
  if (equal(view, before)) return view
  const wrapperOperations = rule.operations.filter(op => !op.removePrerequisiteOnlyMask)
  const present = wrapperOperations.filter(op => structures(view.rootNodes, op.id).length)
  if (!present.length) return view
  if (present.length !== wrapperOperations.length || present.some(op => structures(view.rootNodes, op.id).length !== 1)) fail('partial or duplicated Q3 source layer')
  const result = strip(view, rule)
  if (!equal(result, before)) fail(`source changed beyond exact Q3 additions ${view.viewId}`)
  return result as T
}
export function applyQ3WholeScopePlacements<T extends View>(view: T, goals: ReadonlyMap<string, Goal>, root: string): T {
  const plan = load(root, goals), rule = plan?.views.find(r => r.viewId === view.viewId)
  if (!rule) return view
  const source = withoutQ3WholeScopePlacements(view, goals, root)
  const before = JSON.parse(readFileSync(resolve(root, rule.beforeView.path), 'utf8')) as View
  if (!equal(source, before)) fail(`generated baseline differs from accepted G5 ${view.viewId}`)
  const result = structuredClone(source)
  for (const operation of rule.operations) {
    if (operation.viewId !== view.viewId || !goals.has(operation.goalId) || goals.get(operation.goalId)?.contains?.length) fail('invalid atomic operation')
    if (operation.removePrerequisiteOnlyMask) {
      const mask = operation.removePrerequisiteOnlyMask
      if (operation.projectionRole !== 'target' || !equal(mask.reference, { kind: 'goalEntry', goalId: operation.goalId, projectionRole: 'prerequisiteOnly' })) fail('invalid target mask correction')
      const anchors = mask.parentStructureId ? structures(result.rootNodes, mask.parentStructureId) : []
      if (mask.parentStructureId && anchors.length !== 1) fail('mask removal parent differs')
      const nodes = anchors[0]?.children ?? result.rootNodes
      if (!equal(nodes[mask.childIndex], mask.reference)) fail('exact source mask differs')
      nodes.splice(mask.childIndex, 1)
    } else {
      const anchors = operation.anchorStructureId ? structures(result.rootNodes, operation.anchorStructureId) : []
      if (operation.anchorStructureId && anchors.length !== 1) fail('missing or ambiguous authored parent')
      ;(anchors[0]?.children ?? result.rootNodes).push(wrapper(operation))
    }
  }
  const roles = collectCompositionProjectionRoleGoalIds(result.rootNodes, goals)
  for (const operation of rule.operations) {
    if (operation.projectionRole === 'target' && (!roles.targetGoalIds.has(operation.goalId) || roles.prerequisiteOnlyGoalIds.has(operation.goalId))) fail('approved assessment lacks an actual target path')
    if (operation.projectionRole === 'prerequisiteOnly' && roles.targetGoalIds.has(operation.goalId)) fail('support or scope mask became a target')
  }
  for (const retained of plan!.retainedTargetPaths.filter(row => row.viewId === view.viewId)) if (!roles.targetGoalIds.has(retained.goalId) || roles.prerequisiteOnlyGoalIds.has(retained.goalId)) fail('retained assessment is not an actual target')
  return result
}
