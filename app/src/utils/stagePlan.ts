// SPDX-License-Identifier: Apache-2.0
/** Candidate stage-plan contract. Does not replace the learning-unit 1.2 contract. */
import { collectCompositionProjectionRoleGoalIds, type CompositionView, type CompositionViewNode, type CompositionStructureNode } from './authoring/compositionViewAuthoring'

export const STAGE_PLAN_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan.schema.json'
export const PLAN_COMPOSITION_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/composition-view.schema.json'
export type PlanStage = 'SekI' | 'SekII'
export interface StagePlanUnit {
  id: string
  label: string
  kind: 'stage'
  stage: PlanStage
  parentUnitId: string
  after: string[]
}
export interface StagePlan {
  $schema: typeof STAGE_PLAN_SCHEMA
  planFormatVersion: '1.0'
  planId: string
  scope: { schoolForm: string; jurisdiction: string; durationModel: string }
  rootUnit: { id: string; label: string; children: string[] }
  units: StagePlanUnit[]
  subjectViews: { landscapeId: string; courseProfile: string; viewId: string }[]
}
export type PlacementBasis =
  | { kind: 'officialSource'; sourceStage: PlanStage; references: string[] }
  | { kind: 'canonicalDefault'; canonicalPhase: string }
  | { kind: 'reviewedPreparation'; sourceStage: PlanStage; references: string[]; rationale: string }
export type StagePlanBinding = (
  | { planId: string; planIds?: never }
  /** Explicitly shared duration-neutral authority or excerpt. */
  | { planIds: string[]; planId?: never }
) & (
  | { excerptOfViewId?: never; excerptOfViewIds?: never; unitIds?: never }
  | { excerptOfViewId: string; excerptOfViewIds?: never; unitIds: string[] }
  /** All declared subject/course authorities, checked for a common projection. */
  | { excerptOfViewIds: string[]; excerptOfViewId?: never; unitIds: string[] }
)
export interface StagePlanFinding { code: string; path: string; message: string }
export interface StagePlanGoal {
  id: string
  /** Native canonical title; required when multiauthority convergence uses its fallback label. */
  title?: string
  contains?: readonly string[]
  requires?: readonly string[]
  nodeKind?: string | null
  type?: string
}
export interface StagePlanCatalog {
  plans: readonly unknown[]
  views: readonly unknown[]
  /** Complete canonical goal catalog, including necessary foreign prerequisites. */
  goals: ReadonlyMap<string, StagePlanGoal>
}
export interface StagePlanValidation {
  findings: StagePlanFinding[]
  plansById: Map<string, StagePlan>
  /** Materialized views are returned only when the complete supplied catalog is valid. */
  viewsById: Map<string, CompositionView>
  /** The one learning placement per authority and atom; source assignment is independent. */
  placementsByViewId: Map<string, Map<string, string>>
}

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 2000 && value.trim() === value
const identifier = (value: unknown): value is string => text(value) && value.length <= 300 && /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(text)
const stage = (value: unknown): value is PlanStage => value === 'SekI' || value === 'SekII'
const isAtomicGoal = (goal: StagePlanGoal) => !goal.contains?.length && goal.type !== 'cluster'

/** Validate first, then materialize. No inference from titles, phase or structure IDs. */
export function validateStagePlanCatalog({ plans, views, goals }: StagePlanCatalog): StagePlanValidation {
  const findings: StagePlanFinding[] = []
  const plansById = new Map<string, StagePlan>()
  const rawViews = new Map<string, Record<string, unknown>>()
  const materialized = new Map<string, CompositionView>()
  const placementsByViewId = new Map<string, Map<string, string>>()
  const fail = (code: string, path: string, message: string) => findings.push({ code, path, message })
  // Also guard untyped/JavaScript callers. A shape-only pass cannot establish
  // authoritative placements or provide accepted runtime views.
  if (!goals || typeof goals.get !== 'function' || typeof goals.has !== 'function') {
    fail('SP-CATALOG', 'goals', 'A complete canonical goal catalog is required for authoritative stage-plan validation.')
    return { findings, plansById, viewsById: materialized, placementsByViewId }
  }
  const exact = (value: Record<string, unknown>, allowed: readonly string[], path: string) => {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) fail('SP-SHAPE', `${path}.${key}`, 'Unknown field.')
  }
  const ids = (value: unknown, path: string): value is string[] => {
    if (!Array.isArray(value) || !value.every(identifier)) { fail('SP-SHAPE', path, 'Expected an array of IDs.'); return false }
    if (new Set(value).size !== value.length) fail('SP-DUPLICATE', path, 'Duplicate reference.')
    return true
  }
  const planScopes = new Set<string>()
  plans.forEach((value, index) => {
    const initialFindings = findings.length
    const path = `plans[${index}]`, plan = record(value)
    if (!plan) { fail('SP-SHAPE', path, 'Expected a plan object.'); return }
    exact(plan, ['$schema', 'planFormatVersion', 'planId', 'scope', 'rootUnit', 'units', 'subjectViews'], path)
    if (plan.$schema !== STAGE_PLAN_SCHEMA || plan.planFormatVersion !== '1.0' || !identifier(plan.planId)) {
      fail('SP-SHAPE', path, 'Unsupported stage-plan contract or invalid plan ID.'); return
    }
    if (plansById.has(plan.planId)) fail('SP-DUPLICATE', path, 'Duplicate plan ID.')
    const scope = record(plan.scope), root = record(plan.rootUnit)
    if (!scope || !root || !Array.isArray(plan.units) || !Array.isArray(plan.subjectViews)) {
      fail('SP-SHAPE', path, 'Missing scope, root, units or subject authorities.'); return
    }
    exact(scope, ['schoolForm', 'jurisdiction', 'durationModel'], `${path}.scope`)
    if (!text(scope.schoolForm) || !text(scope.durationModel) || typeof scope.jurisdiction !== 'string'
      || !/^DE-[A-Z]{2}$/u.test(scope.jurisdiction)) fail('SP-SHAPE', `${path}.scope`, 'A Land plan needs school form, Land and duration; national catalogs are not plans.')
    const scopeKey = JSON.stringify([scope.schoolForm, scope.jurisdiction, scope.durationModel])
    if (planScopes.has(scopeKey)) fail('SP-AUTHORITY', path, 'More than one plan for the same school form, Land and duration.')
    planScopes.add(scopeKey)
    exact(root, ['id', 'label', 'children'], `${path}.rootUnit`)
    if (!identifier(root.id) || !text(root.label) || !ids(root.children, `${path}.rootUnit.children`)) fail('SP-SHAPE', `${path}.rootUnit`, 'Invalid root unit.')
    const unitById = new Map<string, StagePlanUnit>()
    for (const [unitIndex, value] of plan.units.entries()) {
      const unitPath = `${path}.units[${unitIndex}]`, unit = record(value)
      if (!unit) { fail('SP-SHAPE', unitPath, 'Expected a unit object.'); continue }
      exact(unit, ['id', 'label', 'kind', 'stage', 'parentUnitId', 'after'], unitPath)
      if (!identifier(unit.id) || !text(unit.label) || unit.kind !== 'stage' || !stage(unit.stage)
        || !identifier(unit.parentUnitId) || !ids(unit.after, `${unitPath}.after`)) {
        fail('SP-SHAPE', unitPath, 'Invalid stage unit.'); continue
      }
      if (unitById.has(unit.id) || unit.id === root.id) fail('SP-DUPLICATE', unitPath, 'Duplicate unit ID.')
      unitById.set(unit.id, unit as unknown as StagePlanUnit)
      if (unit.parentUnitId !== root.id) fail('SP-REF', unitPath, 'A stage must be a direct child of the plan root.')
    }
    const first = [...unitById.values()].filter(unit => unit.stage === 'SekI')
    const second = [...unitById.values()].filter(unit => unit.stage === 'SekII')
    if (unitById.size !== 2 || first.length !== 1 || second.length !== 1 || !strings(root.children)
      || root.children.length !== 2 || root.children[0] !== first[0]?.id || root.children[1] !== second[0]?.id) {
      fail('SP-ROOT', path, 'The full plan root has exactly SekI and SekII, in that order.')
    }
    for (const unit of unitById.values()) for (const previous of unit.after) {
      if (!unitById.has(previous) || unitById.get(previous)?.parentUnitId !== unit.parentUnitId) fail('SP-REF', path, 'after must reference a sibling in this plan.')
    }
    if (first.length === 1 && second.length === 1 && (first[0].after.length !== 0
      || second[0].after.length !== 1 || second[0].after[0] !== first[0].id)) fail('SP-ORDER', path, 'SekII must declare exactly after SekI; SekI has no predecessor.')
    const visiting = new Set<string>(), visited = new Set<string>()
    const visit = (id: string) => {
      if (visiting.has(id)) { fail('SP-CYCLE', path, 'Cycle in declared after.'); return }
      if (visited.has(id)) return
      visiting.add(id)
      for (const previous of unitById.get(id)?.after ?? []) if (unitById.has(previous)) visit(previous)
      visiting.delete(id); visited.add(id)
    }
    unitById.forEach(unit => visit(unit.id))
    const authoritySlots = new Set<string>(), authorityIds = new Set<string>()
    if (!plan.subjectViews.length) fail('SP-AUTHORITY', path, 'Declare at least one subject authority.')
    for (const [authorityIndex, value] of plan.subjectViews.entries()) {
      const authorityPath = `${path}.subjectViews[${authorityIndex}]`, authority = record(value)
      if (!authority) { fail('SP-SHAPE', authorityPath, 'Expected an authority object.'); continue }
      exact(authority, ['landscapeId', 'courseProfile', 'viewId'], authorityPath)
      if (!identifier(authority.landscapeId) || !text(authority.courseProfile) || !identifier(authority.viewId)) {
        fail('SP-SHAPE', authorityPath, 'Invalid subject authority.'); continue
      }
      const slot = JSON.stringify([authority.landscapeId, authority.courseProfile])
      if (authoritySlots.has(slot) || authorityIds.has(authority.viewId)) fail('SP-AUTHORITY', authorityPath, 'Duplicate authority slot or view reference.')
      authoritySlots.add(slot); authorityIds.add(authority.viewId)
    }
    if (findings.length === initialFindings) plansById.set(plan.planId, plan as unknown as StagePlan)
  })

  for (const [index, value] of views.entries()) {
    const view = record(value)
    if (!view || !identifier(view.viewId)) { fail('SP-SHAPE', `views[${index}]`, 'A view needs a valid ID.'); continue }
    if (rawViews.has(view.viewId)) fail('SP-DUPLICATE', `views[${index}]`, 'Duplicate view ID.')
    rawViews.set(view.viewId, view)
  }
  // Qualified refs are accepted only as exact aliases supplied by the caller.
  // A matching bare suffix says nothing about ownership of an arbitrary prefix.
  const resolveGoal = (ref: string): string => goals.get(ref)?.id ?? ref
  const roleGoalById = new Map([...goals.values()].map(goal => [goal.id, { contains: (goal.contains ?? []).map(resolveGoal) }]))
  const roleNodes = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.map(node => node.kind === 'structure'
    ? { ...node, children: roleNodes(node.children) }
    : node.kind === 'canonicalSubtree' || node.kind === 'goalEntry' ? { ...node, goalId: resolveGoal(node.goalId) } : node)
  const effectiveRoles = (nodes: CompositionViewNode[]) => collectCompositionProjectionRoleGoalIds(roleNodes(nodes), roleGoalById)
  const targetRolesByViewId = new Map<string, Set<string>>()
  const supportNodesByViewId = new Map<string, CompositionViewNode[]>()
  const atomCache = new Map<string, string[]>(), atomVisiting = new Set<string>()
  const atoms = (ref: string): string[] => {
    const id = resolveGoal(ref)
    if (atomCache.has(id)) return atomCache.get(id)!
    if (atomVisiting.has(id)) { fail('SP-GRAPH', id, 'Cycle in canonical contains.'); return [] }
    const goal = goals.get(ref)
    if (!goal) { fail('SP-GOAL-REF', id, 'Unknown canonical goal.'); return [] }
    atomVisiting.add(id)
    const result = goal.contains?.length ? [...new Set(goal.contains.flatMap(atoms))] : isAtomicGoal(goal) ? [id] : []
    atomVisiting.delete(id); atomCache.set(id, result)
    return result
  }
  const basis = (value: unknown, path: string, unit: StagePlanUnit | undefined) => {
    const evidence = record(value)
    if (!evidence) { fail('SP-SHAPE', path, 'Invalid placement basis.'); return }
    if (evidence.kind === 'canonicalDefault') {
      exact(evidence, ['kind', 'canonicalPhase'], path)
      if (!text(evidence.canonicalPhase)) fail('SP-SHAPE', path, 'A provisional canonical default names its phase.')
      return
    }
    if (evidence.kind !== 'officialSource' && evidence.kind !== 'reviewedPreparation') { fail('SP-SHAPE', path, 'Unknown placement basis.'); return }
    exact(evidence, ['kind', 'sourceStage', 'references', ...(evidence.kind === 'reviewedPreparation' ? ['rationale'] : [])], path)
    if (!stage(evidence.sourceStage) || !strings(evidence.references) || !evidence.references.length) fail('SP-SOURCE', path, 'An official source assertion needs a stage and evidence references.')
    if (evidence.kind === 'officialSource' && unit && evidence.sourceStage !== unit.stage) fail('SP-SOURCE', path, 'A source-stage deviation requires a reviewedPreparation assertion.')
    if (evidence.kind === 'reviewedPreparation' && (!text(evidence.rationale) || unit?.stage !== 'SekI' || evidence.sourceStage !== 'SekII')) fail('SP-SOURCE', path, 'Early preparation needs a rationale and moves a SekII source target into SekI.')
  }
  const fullViews = new Map<string, { plans: StagePlan[]; view: Record<string, unknown> }>()
  for (const plan of plansById.values()) for (const authority of plan.subjectViews) {
    if (!identifier(authority?.viewId)) continue
    const view = rawViews.get(authority.viewId), path = `views.${authority.viewId}`
    if (!view) { fail('SP-AUTHORITY', path, 'Missing authoritative full view.'); continue }
    const scope = record(view.scope), binding = record(view.planBinding)
    const shared = Array.isArray(binding?.planIds)
    if (view.$schema !== PLAN_COMPOSITION_SCHEMA || view.viewFormatVersion !== '1.1'
      || view.landscapeId !== authority.landscapeId || scope?.courseProfile !== authority.courseProfile
      || scope?.schoolForm !== plan.scope.schoolForm || scope?.jurisdiction !== plan.scope.jurisdiction
      || (shared ? scope?.durationModel !== undefined || !(binding.planIds as unknown[]).includes(plan.planId)
        : scope?.durationModel !== plan.scope.durationModel || binding?.planId !== plan.planId)
      || scope?.stage !== 'CrossStage' || binding?.excerptOfViewId !== undefined || binding?.excerptOfViewIds !== undefined) fail('SP-AUTHORITY', path, 'Authority must be the matching full subject/course view, explicitly selected for this plan.')
    const selected = fullViews.get(authority.viewId)
    if (selected && !shared) fail('SP-AUTHORITY', path, 'Sharing across plans requires an explicit duration-neutral planIds binding.')
    if (selected) selected.plans.push(plan)
    else fullViews.set(authority.viewId, { plans: [plan], view })
  }
  const excerpts = new Map<string, { sourceIds: string[]; unitIds: string[] }>()
  for (const [id, view] of rawViews) {
    if (view.$schema !== PLAN_COMPOSITION_SCHEMA && view.viewFormatVersion !== '1.1' && view.planBinding === undefined) {
      // Legacy views pass through unchanged; their existing validator remains authoritative.
      if ((view.viewFormatVersion !== undefined && view.viewFormatVersion !== '1.0')
        || (view.$schema !== undefined && view.$schema !== 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json')) {
        fail('SP-SHAPE', `views.${id}`, 'Unsupported composition-view contract.'); continue
      }
      materialized.set(id, view as unknown as CompositionView); continue
    }
    const path = `views.${id}`, binding = record(view.planBinding), scope = record(view.scope)
    exact(view, ['$schema', 'viewFormatVersion', 'viewId', 'landscapeId', 'language', 'title', 'scope', 'rootNodes', 'planBinding'], path)
    if (view.$schema !== PLAN_COMPOSITION_SCHEMA || view.viewFormatVersion !== '1.1' || !binding || !scope
      || !identifier(view.landscapeId) || typeof view.language !== 'string' || view.language.length > 64
      || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u.test(view.language)
      || (view.title !== undefined && !text(view.title))) { fail('SP-SHAPE', path, 'Invalid plan composition view.'); continue }
    exact(binding, ['planId', 'planIds', 'excerptOfViewId', 'excerptOfViewIds', 'unitIds'], `${path}.planBinding`)
    exact(scope, ['schoolForm', 'jurisdiction', 'durationModel', 'stage', 'courseProfile'], `${path}.scope`)
    const shared = binding.planIds !== undefined
    const isExcerpt = binding.excerptOfViewId !== undefined || binding.excerptOfViewIds !== undefined
    if (shared && (binding.planId !== undefined || (!isExcerpt && binding.unitIds !== undefined)
      || !ids(binding.planIds, `${path}.planBinding.planIds`) || !binding.planIds.length || binding.planIds.length > 16)) {
      fail('SP-AUTHORITY', path, 'A duration-neutral authority or excerpt lists its nonempty explicit plan contexts, without planId.'); continue
    }
    const selectedPlans = shared ? (binding.planIds as string[]).map(planId => plansById.get(planId))
      : [typeof binding.planId === 'string' ? plansById.get(binding.planId) : undefined]
    const plan = selectedPlans[0]
    if (selectedPlans.some(candidate => !candidate)) { fail('SP-REF', path, 'Unknown plan in authority binding.'); continue }
    if (!plan) { fail('SP-REF', path, 'Unknown plan.'); continue }
    if (scope.schoolForm !== plan.scope.schoolForm || scope.jurisdiction !== plan.scope.jurisdiction
      || (shared ? scope.durationModel !== undefined : scope.durationModel !== plan.scope.durationModel)) fail('SP-SCOPE', path, 'View and plan scope differ; shared authorities must be explicitly duration-neutral.')
    if (shared) {
      if (!isExcerpt) {
        const selectedIds = fullViews.get(id)?.plans.map(candidate => candidate.planId) ?? []
        if (selectedIds.length !== selectedPlans.length || selectedPlans.some(candidate => !selectedIds.includes(candidate!.planId))) fail('SP-AUTHORITY', path, 'Every declared shared plan must select this authoritative subject view.')
      }
      const signature = (candidate: StagePlan) => JSON.stringify([candidate.scope.schoolForm, candidate.scope.jurisdiction, candidate.rootUnit.children,
        candidate.rootUnit.children.map(unitId => {
          const unit = candidate.units.find(entry => entry.id === unitId)!
          return [unit.id, unit.stage, unit.after]
        })])
      if (selectedPlans.some(candidate => signature(candidate!) !== signature(plan))) fail('SP-SHARING', path, 'Shared duration-neutral authorities require the same Land, declared stage identities and stage order in every selected plan.')
    }
    if (isExcerpt) {
      const independent = binding.excerptOfViewIds !== undefined
      if ((independent ? binding.excerptOfViewId !== undefined || !ids(binding.excerptOfViewIds, `${path}.planBinding.excerptOfViewIds`)
        || binding.excerptOfViewIds.length < 2 || binding.excerptOfViewIds.length > 10000 : !identifier(binding.excerptOfViewId))
        || !ids(binding.unitIds, `${path}.planBinding.unitIds`) || !binding.unitIds.length || binding.unitIds.length > 2
        || view.rootNodes !== undefined) { fail('SP-EXCERPT', path, 'An excerpt selects one or both ordered stages and cannot author a tree.'); continue }
      const sourceIds = independent ? binding.excerptOfViewIds as string[] : [binding.excerptOfViewId as string]
      const selectedIds = binding.unitIds as string[]
      const units = selectedIds.map(unitId => plan.units.find(candidate => candidate.id === unitId))
      const expectedStage = selectedIds.length === 2 ? 'CrossStage' : units[0]?.stage
      const orderedIds = plan.rootUnit.children.filter(unitId => selectedIds.includes(unitId))
      if (units.some(unit => !unit) || JSON.stringify(orderedIds) !== JSON.stringify(selectedIds) || scope.stage !== expectedStage) fail('SP-EXCERPT', path, 'Excerpt must select the declared stages in plan order.')
      if (independent) {
        if (scope.courseProfile !== undefined) fail('SP-EXCERPT', path, 'A profile-independent excerpt omits courseProfile; it cannot select a preferred course.')
        if (selectedPlans.some(candidate => !candidate!.subjectViews.some(authority => authority.landscapeId === view.landscapeId))) fail('SP-EXCERPT', path, 'Every selected plan must declare the excerpt subject and its course authorities.')
        const relevant = new Set(selectedPlans.flatMap(candidate => candidate!.subjectViews
          .filter(authority => authority.landscapeId === view.landscapeId).map(authority => authority.viewId)))
        if (relevant.size !== sourceIds.length || sourceIds.some(sourceId => !relevant.has(sourceId))) fail('SP-EXCERPT', path, 'A profile-independent excerpt must reference every declared subject/course authority for the selected plans.')
      }
      for (const sourceId of sourceIds) {
        const authority = fullViews.get(sourceId)
        if (!authority || authority.view.landscapeId !== view.landscapeId
          || (independent ? !authority.plans.some(candidate => selectedPlans.some(selected => selected!.planId === candidate.planId))
            : selectedPlans.some(selected => !authority.plans.some(candidate => candidate.planId === selected!.planId))
              || record(authority.view.scope)?.courseProfile !== scope.courseProfile)) fail('SP-EXCERPT', path, 'Excerpt sources must be matching authoritative full subject views in every selected plan context.')
      }
      excerpts.set(id, { sourceIds, unitIds: selectedIds })
      continue
    }
    if (!fullViews.has(id) || binding.unitIds !== undefined) fail('SP-AUTHORITY', path, 'A full view must be explicitly declared by its plan.')
    if (!Array.isArray(view.rootNodes)) { fail('SP-SHAPE', path, 'Full views author rootNodes.'); continue }
    const unitById = new Map(plan.units.map(unit => [unit.id, unit])), usedUnits = new Set<string>(), nodeIds = new Set<string>()
    const placements = new Map<string, string>()
    const declarations: Array<{ node: CompositionViewNode; path: string; unit?: StagePlanUnit }> = []
    const visibleGoalPaths = new Map<string, string>()
    // Match the existing composition compiler's occurrence semantics: a target
    // goalEntry displays exactly its referenced goal, while canonicalSubtree
    // displays every contained occurrence. Do not deduplicate a canonical DAG
    // here: two visible paths to the same goal are an invalid rendered tree.
    const noteVisibleGoals = (ref: string, nodePath: string, expand: boolean, targets: ReadonlySet<string>, unit?: StagePlanUnit, active = new Set<string>()) => {
      const goal = goals.get(ref)
      if (!goal) { fail('SP-GOAL-REF', nodePath, `Unknown canonical goal ${ref}.`); return }
      // The existing compiler stops at an effectively hidden ancestor. A raw
      // target subtree does not expose a more specific prerequisiteOnly goal.
      if (!targets.has(goal.id)) return
      if (active.has(goal.id)) { fail('SP-GRAPH', nodePath, 'Cycle in canonical contains.'); return }
      if (isAtomicGoal(goal) && unit) {
        if (placements.has(goal.id) && placements.get(goal.id) !== unit.id) fail('SP-PLACEMENT', nodePath, `More than one effective stage placement for ${goal.id}.`)
        placements.set(goal.id, unit.id)
      }
      const previous = visibleGoalPaths.get(goal.id)
      if (previous) {
        fail('SP-DUPLICATE-GOAL', nodePath, `Canonical goal ${goal.id} appears more than once in the compiled tree (first at ${previous}).`)
        return
      }
      visibleGoalPaths.set(goal.id, nodePath)
      if (!expand) return
      active.add(goal.id)
      for (const [index, child] of (goal.contains ?? []).entries()) noteVisibleGoals(child, `${nodePath}.contains[${index}]`, true, targets, unit, active)
      active.delete(goal.id)
    }
    const walk = (value: unknown, nodePath: string, currentUnit?: StagePlanUnit, atRoot = false) => {
      const node = record(value)
      if (!node) { fail('SP-SHAPE', nodePath, 'Expected a composition node.'); return }
      if (node.kind === 'structure') {
        exact(node, ['kind', 'id', 'label', 'children', 'planUnitId'], nodePath)
        if (!identifier(node.id) || !text(node.label) || !Array.isArray(node.children)) { fail('SP-SHAPE', nodePath, 'Invalid structure node.'); return }
        if (nodeIds.has(node.id)) fail('SP-DUPLICATE', nodePath, 'Duplicate structure ID.')
        nodeIds.add(node.id)
        let unit = currentUnit
        if (node.planUnitId !== undefined) {
          unit = typeof node.planUnitId === 'string' ? unitById.get(node.planUnitId) : undefined
          if (!unit || !atRoot || currentUnit || usedUnits.has(unit.id)) fail('SP-REF', nodePath, 'Declare each shared stage exactly once as a view root.')
          if (unit) usedUnits.add(unit.id)
        } else if (atRoot) fail('SP-ROOT', nodePath, 'Every full-view root references a declared stage.')
        node.children.forEach((child, index) => walk(child, `${nodePath}.children[${index}]`, unit))
        return
      }
      if (node.kind !== 'canonicalSubtree' && node.kind !== 'goalEntry') { fail('SP-SHAPE', nodePath, 'A subject plan contains goal references or structures.'); return }
      exact(node, ['kind', 'goalId', 'displayLabel', 'projectionRole', 'placementBasis'], nodePath)
      if (!identifier(node.goalId) || (node.displayLabel !== undefined && !text(node.displayLabel))
        || (node.projectionRole !== undefined && node.projectionRole !== 'target' && node.projectionRole !== 'prerequisiteOnly')) { fail('SP-SHAPE', nodePath, 'Invalid goal reference or projection role.'); return }
      const role = node.projectionRole ?? 'target'
      if (role === 'target' && !currentUnit) fail('SP-PLACEMENT', nodePath, 'Every target belongs to one declared stage.')
      if (role === 'prerequisiteOnly' && node.placementBasis !== undefined) fail('SP-SOURCE', nodePath, 'A prerequisite-only declaration does not assert a source or learning placement.')
      if (node.placementBasis !== undefined) basis(node.placementBasis, `${nodePath}.placementBasis`, currentUnit)
      const referencedGoal = goals.get(node.goalId)
      if (!referencedGoal) { fail('SP-GOAL-REF', nodePath, `Unknown canonical goal ${node.goalId}.`); return }
      declarations.push({ node: node as unknown as CompositionViewNode, path: nodePath, unit: currentUnit })
      // An opaque cluster remains a navigation entry. Its hidden descendants
      // are neither shown nor acquisition targets, and the cluster itself is
      // never fabricated as an atomic learning placement.
      if (node.kind === 'canonicalSubtree') atoms(node.goalId)
    }
    view.rootNodes.forEach((node, index) => walk(node, `${path}.rootNodes[${index}]`, undefined, true))
    // Structure position does not affect role specificity. This temporary
    // declaration index keeps subtree references intact and is never stored as
    // a replacement tree. Use the same collector as the existing compiler.
    const { targetGoalIds } = effectiveRoles(declarations.map(({ node }) => node))
    targetRolesByViewId.set(id, targetGoalIds)
    supportNodesByViewId.set(id, declarations.map(({ node }) => node).filter(node => node.projectionRole === 'prerequisiteOnly'))
    for (const declaration of declarations) {
      const node = declaration.node
      if ((node.kind !== 'canonicalSubtree' && node.kind !== 'goalEntry') || node.projectionRole === 'prerequisiteOnly') continue
      noteVisibleGoals(node.goalId, declaration.path, node.kind === 'canonicalSubtree', targetGoalIds, declaration.unit)
    }
    if (usedUnits.size !== 2 || view.rootNodes.length !== 2
      || record(view.rootNodes[0])?.planUnitId !== plan.rootUnit.children[0]
      || record(view.rootNodes[1])?.planUnitId !== plan.rootUnit.children[1]) fail('SP-ROOT', path, 'A full subject view exposes exactly both stages in plan order.')
    placementsByViewId.set(id, placements)
    materialized.set(id, view as unknown as CompositionView)
  }
  for (const plan of plansById.values()) {
    const sharedPlacements = new Map<string, string>()
    for (const authority of plan.subjectViews) for (const [goalId, unitId] of placementsByViewId.get(authority.viewId) ?? []) {
      if (sharedPlacements.has(goalId) && sharedPlacements.get(goalId) !== unitId) fail('SP-PROFILE', authority.viewId, `Subject/course authorities disagree on the placement of shared canonical goal ${goalId}.`)
      sharedPlacements.set(goalId, unitId)
    }
  }
  if (findings.length) return { findings, plansById, viewsById: new Map(), placementsByViewId: new Map() }
  const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : record(value)
    ? Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, stable(entry)])) : value
  // The same visible projection as the composition compiler: effective roles
  // prune whole hidden branches, opaque entries never expand, and empty
  // structures disappear. Source-local runtime IDs do not define convergence.
  const projection = (nodes: CompositionViewNode[], targets: ReadonlySet<string>, requireTitles = false): unknown[] => {
    const goalNode = (ref: string, expand: boolean, displayLabel?: string): unknown | null => {
      const goal = goals.get(ref)!
      if (!targets.has(goal.id)) return null
      if (requireTitles && !displayLabel?.trim() && typeof goal.title !== 'string') fail('SP-LABEL', goal.id, 'A resolved canonical title is required to compare native fallback labels across authorities.')
      return { kind: 'goal', goalId: goal.id, label: displayLabel?.trim() || goal.title,
        children: expand ? (goal.contains ?? []).map(child => goalNode(child, true)).filter(child => child !== null) : [] }
    }
    return nodes.map(node => {
      if (node.kind === 'structure') {
        const children = projection(node.children, targets, requireTitles)
        return children.length ? { kind: node.kind, planUnitId: node.planUnitId, label: node.label, children } : null
      }
      if (node.kind !== 'canonicalSubtree' && node.kind !== 'goalEntry' || node.projectionRole === 'prerequisiteOnly') return null
      return goalNode(node.goalId, node.kind === 'canonicalSubtree', node.displayLabel)
    }).filter(node => node !== null)
  }
  const supportCoverage = new Map<string, Set<string>>()
  for (const [id, { sourceIds, unitIds: selectedIds }] of excerpts) {
    const unitIds = new Set(selectedIds)
    const sortedSourceIds = [...sourceIds].sort()
    const candidates = sortedSourceIds.map(sourceId => {
      const source = materialized.get(sourceId)!, fullTargets = targetRolesByViewId.get(sourceId)!
      const roots = structuredClone(source.rootNodes.filter(node => node.kind === 'structure' && unitIds.has(String(node.planUnitId))))
      const expected = JSON.stringify(stable(projection(roots, fullTargets, sourceIds.length > 1)))
      const localTargets = effectiveRoles(roots).targetGoalIds
      const promoted = new Set([...localTargets].filter(goalId => !fullTargets.has(goalId)))
      // M3: an authored support declaration has no placement semantics. Keep
      // original subtree/entry declarations needed outside their authored stage
      // in a derived, invisible section instead of flattening target subtrees.
      const retained = (supportNodesByViewId.get(sourceId) ?? []).filter(node => {
        const key = `${node.kind}:${resolveGoal(node.goalId as string)}`
        let coverage = supportCoverage.get(key)
        if (!coverage) { coverage = effectiveRoles([node]).prerequisiteOnlyGoalIds; supportCoverage.set(key, coverage) }
        return [...coverage].some(goalId => promoted.has(goalId))
      })
      if (retained.length && roots[0]?.kind === 'structure') {
        const structureIds = new Set<string>()
        const collectIds = (nodes: CompositionViewNode[]) => nodes.forEach(node => { if (node.kind === 'structure') { structureIds.add(node.id); collectIds(node.children) } })
        collectIds(roots)
        let sectionId = 'global-prerequisite-hints', suffix = 0
        while (structureIds.has(sectionId)) sectionId = `global-prerequisite-hints-${++suffix}`
        roots[0].children.push({ kind: 'structure', id: sectionId, label: 'Voraussetzungshinweise', children: structuredClone(retained) })
      }
      const actual = JSON.stringify(stable(projection(roots, effectiveRoles(roots).targetGoalIds, sourceIds.length > 1)))
      if (actual !== expected) fail('SP-EXCERPT-ROLES', `views.${id}`, `Excerpt does not preserve the authoritative effective projection of ${sourceId}; hidden or additional targets cannot be accepted.`)
      return { roots, signature: expected }
    })
    if (candidates.some(candidate => candidate.signature !== candidates[0].signature)) {
      fail('SP-CONVERGENCE', `views.${id}`, 'Selected stages differ between declared course/duration authorities; no profile-independent excerpt can be claimed.'); continue
    }
    // All source projections have been checked equal. Source order cannot
    // silently choose a course: use a deterministic representative only now.
    materialized.set(id, { ...rawViews.get(id), rootNodes: candidates[0].roots } as unknown as CompositionView)
    placementsByViewId.set(id, new Map([...(placementsByViewId.get(sortedSourceIds[0]) ?? [])].filter(([, unit]) => unitIds.has(unit))))
  }
  return { findings, plansById, viewsById: findings.length ? new Map() : materialized,
    placementsByViewId: findings.length ? new Map() : placementsByViewId }
}

/** Declared stage metadata for map/backend adapters; no label or ID heuristics. */
export function getStagePlanStructureMetadata(plan: StagePlan, node: CompositionViewNode) {
  if (node.kind !== 'structure') return undefined
  const unit = plan.units.find(candidate => candidate.id === (node as CompositionStructureNode).planUnitId)
  return unit ? { planId: plan.planId, planUnitId: unit.id, stage: unit.stage, after: [...unit.after] } : undefined
}

export interface StagePlanPreparation {
  goalId: string
  planUnitId: string
  /** A checked canonical prerequisite path starting at a real target. */
  witnessPath: string[]
}
/**
 * Place additional necessary atoms at their first real need. Input placements
 * are the selected targets, never prerequisiteOnly nodes or canonical phases.
 * Derived preparation asserts no official source assignment and writes no
 * goals, requirements, mastery or curriculum configuration.
 */
export function deriveStagePlanPreparation(
  plan: StagePlan,
  targetPlacements: ReadonlyMap<string, string>,
  goals: ReadonlyMap<string, StagePlanGoal>,
): { preparations: StagePlanPreparation[]; findings: StagePlanFinding[] } {
  const findings: StagePlanFinding[] = [], prepared = new Map<string, StagePlanPreparation>()
  const rank = new Map(plan.rootUnit.children.map((id, index) => [id, index]))
  const canonicalGoals = new Map([...goals.values()].map(goal => [goal.id, goal]))
  const fail = (code: string, path: string, message: string) => findings.push({ code, path, message })
  for (const [targetId, unitId] of targetPlacements) {
    if (!rank.has(unitId)) { fail('SP-REF', targetId, 'Unknown target plan unit.'); continue }
    const target = canonicalGoals.get(targetId)
    if (!target || !isAtomicGoal(target)) { fail('SP-GRAPH', targetId, 'A target placement must resolve to a canonical atomic goal.'); continue }
    const active = new Set<string>(), seen = new Set<string>()
    const visit = (id: string, path: string[]) => {
      if (active.has(id)) { fail('SP-GRAPH', id, 'Cycle in canonical requires.'); return }
      if (seen.has(id)) return
      const goal = canonicalGoals.get(id)
      if (!goal || !isAtomicGoal(goal)) { fail('SP-GRAPH', id, 'Prerequisite endpoints must resolve to canonical atomic goals.'); return }
      active.add(id)
      for (const ref of goal.requires ?? []) {
        const required = goals.get(ref), requiredId = required?.id ?? ref, nextPath = [...path, requiredId]
        if (!required || !isAtomicGoal(required)) { fail('SP-GRAPH', requiredId, 'Prerequisite endpoints must resolve to canonical atomic goals.'); continue }
        const authoredUnit = targetPlacements.get(requiredId)
        if (authoredUnit) {
          if (!rank.has(authoredUnit) || rank.get(authoredUnit)! > rank.get(unitId)!) fail('SP-BACKFLOW', targetId, `Target ${targetId} needs later placed ${requiredId}; review the requirement or the learning placement.`)
        } else {
          const current = prepared.get(requiredId)
          if (!current || rank.get(unitId)! < rank.get(current.planUnitId)!) prepared.set(requiredId, { goalId: requiredId, planUnitId: unitId, witnessPath: nextPath })
        }
        // Never stop at a mastered or already placed intermediate: no learner
        // state belongs to the static learning-basis closure.
        visit(requiredId, nextPath)
      }
      active.delete(id); seen.add(id)
    }
    visit(targetId, [targetId])
  }
  return { preparations: findings.some(finding => finding.code === 'SP-GRAPH' || finding.code === 'SP-REF') ? [] : [...prepared.values()], findings }
}
