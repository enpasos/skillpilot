// SPDX-License-Identifier: Apache-2.0
/** Candidate stage-plan contract. Does not replace the learning-unit 1.2 contract. */
import { stagePlanChildren, stagePlanLeafOrder, stagePlanUnitIds } from './stagePlanHierarchy'
import { collectCompositionProjectionRoleGoalIds, type CompositionView, type CompositionViewNode, type CompositionStructureNode } from './authoring/compositionViewAuthoring'

export const STAGE_PLAN_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan.schema.json'
export const PLAN_COMPOSITION_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/composition-view.schema.json'
export type PlanStage = 'SekI' | 'SekII'
export type PlanPhase = 'E' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type PlanUnitBasis = { kind: 'officialSource'; references: string[] }
  | { kind: 'reviewedStructure'; references: string[]; rationale: string }
export interface StagePlanUnit {
  id: string
  label: string
  kind: 'stage' | 'year' | 'phase'
  stage: PlanStage
  labelEn?: string
  /** Explicit temporal children; omission preserves the original two-stage contract. */
  children?: string[]
  year?: number
  phase?: PlanPhase
  /** Evidence for this Land/duration unit, separate from a goal's source assignment. */
  basis?: PlanUnitBasis
  parentUnitId: string
  after: string[]
}
/** Digest-bound generated index bindings; the same v1.3 hierarchy is consumed by map adapters. */
export interface StagePlanStructureBinding {
  structureId: string
  planUnitId: string
  stage: PlanStage
  order: number
  after: string[]
  kind?: StagePlanUnit['kind']
  parentUnitId?: string
  children?: string[]
  year?: number
  phase?: PlanPhase
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
  | { kind: 'officialSource'; sourceStage: PlanStage; sourceUnitId?: string; references: string[] }
  | { kind: 'canonicalDefault'; canonicalPhase: string }
  | { kind: 'reviewedPreparation'; sourceStage: PlanStage; sourceUnitId?: string; references: string[]; rationale: string }
  /** Explicit author placement, without claiming an official year/phase assignment. */
  | { kind: 'reviewedPlacement'; references: string[]; rationale: string }
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
      exact(unit, ['id', 'label', 'labelEn', 'kind', 'stage', 'parentUnitId', 'after', 'children', 'year', 'phase', 'basis'], unitPath)
      if (!identifier(unit.id) || !text(unit.label) || (unit.labelEn !== undefined && !text(unit.labelEn))
        || !['stage', 'year', 'phase'].includes(String(unit.kind)) || !stage(unit.stage)
        || !identifier(unit.parentUnitId) || !ids(unit.after, `${unitPath}.after`)
        || (unit.children !== undefined && !ids(unit.children, `${unitPath}.children`))) {
        fail('SP-SHAPE', unitPath, 'Invalid declared plan unit.'); continue
      }
      if (unitById.has(unit.id) || unit.id === root.id) fail('SP-DUPLICATE', unitPath, 'Duplicate unit ID.')
      unitById.set(unit.id, unit as unknown as StagePlanUnit)
      if (unit.kind === 'stage') {
        if (unit.parentUnitId !== root.id) fail('SP-REF', unitPath, 'A stage must be a direct child of the plan root.')
        if (unit.year !== undefined || unit.phase !== undefined || unit.basis !== undefined) fail('SP-SHAPE', unitPath, 'Stage identities do not masquerade as year or phase assignments.')
      } else {
        if (unit.children !== undefined) fail('SP-SHAPE', unitPath, 'Year and phase units are temporal leaves in this contract.')
        if (unit.kind === 'year' && (unit.stage !== 'SekI' || !Number.isInteger(unit.year) || Number(unit.year) < 1 || Number(unit.year) > 13 || unit.phase !== undefined)) fail('SP-SHAPE', unitPath, 'A SekI year unit declares its applicable school year.')
        if (unit.kind === 'phase' && (unit.stage !== 'SekII' || !['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(String(unit.phase)) || unit.year !== undefined)) fail('SP-SHAPE', unitPath, 'A SekII phase explicitly names E or Q1–Q4; its localized label may reflect the Land.')
        const evidence = record(unit.basis)
        if (!evidence || !['officialSource', 'reviewedStructure'].includes(String(evidence.kind))) fail('SP-SOURCE', unitPath, 'A nested temporal unit needs an explicit source or reviewed structural basis.')
        else {
          exact(evidence, ['kind', 'references', ...(evidence.kind === 'reviewedStructure' ? ['rationale'] : [])], `${unitPath}.basis`)
          if (!strings(evidence.references) || !evidence.references.length || new Set(evidence.references).size !== evidence.references.length
            || evidence.kind === 'reviewedStructure' && !text(evidence.rationale)) fail('SP-SOURCE', unitPath, 'Unit basis needs nonempty references and a rationale for an author-defined structure.')
        }
      }
    }
    const first = [...unitById.values()].filter(unit => unit.kind === 'stage' && unit.stage === 'SekI')
    const second = [...unitById.values()].filter(unit => unit.kind === 'stage' && unit.stage === 'SekII')
    if (first.length !== 1 || second.length !== 1 || !strings(root.children)
      || root.children.length !== 2 || root.children[0] !== first[0]?.id || root.children[1] !== second[0]?.id) {
      fail('SP-ROOT', path, 'The full plan root has exactly SekI and SekII, in that order.')
    }
    const member = new Map<string, string>()
    for (const parent of unitById.values()) {
      const children = parent.children ?? []
      if (parent.children !== undefined && !children.length) fail('SP-SHAPE', path, 'Omit children for an unsplit legacy stage; an explicit temporal split is nonempty.')
      let previousOrdinal = -1
      for (const [index, id] of children.entries()) {
        const child = unitById.get(id)
        if (!child || parent.kind !== 'stage' || child.kind === 'stage' || child.parentUnitId !== parent.id || child.stage !== parent.stage) {
          fail('SP-REF', path, 'A temporal child belongs to exactly its declared parent stage.'); continue
        }
        if (member.has(id)) fail('SP-DUPLICATE', path, 'A unit is listed under more than one parent.')
        member.set(id, parent.id)
        const ordinal = child.kind === 'year' ? child.year! : ['E', 'Q1', 'Q2', 'Q3', 'Q4'].indexOf(child.phase!)
        if (ordinal <= previousOrdinal) fail('SP-ORDER', path, 'Years and phases follow their declared temporal order, without duplicate or backward slots.')
        previousOrdinal = ordinal
        const expected = index ? [children[index - 1]] : []
        if (JSON.stringify(child.after) !== JSON.stringify(expected)) fail('SP-ORDER', path, 'Every temporal child declares exactly its preceding sibling; no implicit or redundant order is accepted.')
      }
    }
    for (const unit of unitById.values()) {
      if (unit.kind !== 'stage' && (!member.has(unit.id) || unitById.get(unit.parentUnitId)?.kind !== 'stage')) fail('SP-REF', path, 'A nested unit must be listed by its parent stage.')
      for (const previous of unit.after) if (!unitById.has(previous) || unitById.get(previous)?.parentUnitId !== unit.parentUnitId) fail('SP-REF', path, 'after must reference a sibling in this plan.')
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
  const basis = (value: unknown, path: string, unit: StagePlanUnit | undefined, plan: StagePlan) => {
    const evidence = record(value)
    if (!evidence) { fail('SP-SHAPE', path, 'Invalid placement basis.'); return }
    if (evidence.kind === 'canonicalDefault') {
      exact(evidence, ['kind', 'canonicalPhase'], path)
      if (!text(evidence.canonicalPhase)) fail('SP-SHAPE', path, 'A provisional canonical default names its phase.')
      if (unit?.kind !== 'stage' && evidence.canonicalPhase !== (unit?.kind === 'year' ? `J${unit.year}` : unit?.phase)) fail('SP-SOURCE', path, 'A nested canonical default must match its declared year or phase; other placements need explicit review.')
      return
    }
    if (evidence.kind === 'reviewedPlacement') {
      exact(evidence, ['kind', 'references', 'rationale'], path)
      if (!strings(evidence.references) || !evidence.references.length || !text(evidence.rationale)) fail('SP-SOURCE', path, 'An author-defined placement needs references and a rationale and asserts no official time assignment.')
      return
    }
    if (evidence.kind !== 'officialSource' && evidence.kind !== 'reviewedPreparation') { fail('SP-SHAPE', path, 'Unknown placement basis.'); return }
    exact(evidence, ['kind', 'sourceStage', 'sourceUnitId', 'references', ...(evidence.kind === 'reviewedPreparation' ? ['rationale'] : [])], path)
    if (!stage(evidence.sourceStage) || !strings(evidence.references) || !evidence.references.length) fail('SP-SOURCE', path, 'An official source assertion needs a stage and evidence references.')
    const sourceUnit = typeof evidence.sourceUnitId === 'string' ? plan.units.find(candidate => candidate.id === evidence.sourceUnitId) : undefined
    if (evidence.sourceUnitId !== undefined && (!sourceUnit || sourceUnit.stage !== evidence.sourceStage)) fail('SP-SOURCE', path, 'Source unit must resolve in this Land/duration plan and agree with the source stage.')
    if (evidence.kind === 'officialSource' && unit && (evidence.sourceStage !== unit.stage || unit.kind !== 'stage' && evidence.sourceUnitId !== unit.id)) fail('SP-SOURCE', path, 'A nested official assignment names its exact source unit; an earlier placement needs reviewedPreparation.')
    if (evidence.kind === 'reviewedPreparation') {
      if (!text(evidence.rationale)) fail('SP-SOURCE', path, 'Early preparation needs a rationale.')
      const order = stagePlanLeafOrder(plan)
      if (sourceUnit) {
        if (!unit || !order.has(sourceUnit.id) || !order.has(unit.id) || order.get(sourceUnit.id)! <= order.get(unit.id)!) fail('SP-SOURCE', path, 'Reviewed preparation retains its later source year or phase and its earlier learning placement.')
      } else if (unit?.kind !== 'stage' || unit.stage !== 'SekI' || evidence.sourceStage !== 'SekII') fail('SP-SOURCE', path, 'Nested early preparation names its source unit; legacy preparation moves SekII into SekI.')
    }
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
      // Check selected identities before comparing their nested signatures.
      // Invalid input must produce a finding rather than dereference an absent unit.
      if (isExcerpt && Array.isArray(binding.unitIds)
        && selectedPlans.some(candidate => (binding.unitIds as unknown[]).some(unitId => !candidate!.units.some(unit => unit.id === unitId)))) {
        fail('SP-EXCERPT', path, 'A shared excerpt selects only declared stage units in every plan context.'); continue
      }
      if (!isExcerpt) {
        const selectedIds = fullViews.get(id)?.plans.map(candidate => candidate.planId) ?? []
        if (selectedIds.length !== selectedPlans.length || selectedPlans.some(candidate => !selectedIds.includes(candidate!.planId))) fail('SP-AUTHORITY', path, 'Every declared shared plan must select this authoritative subject view.')
      }
      const signature = (candidate: StagePlan) => JSON.stringify([candidate.scope.schoolForm, candidate.scope.jurisdiction, candidate.rootUnit.children,
        stagePlanUnitIds(candidate, isExcerpt && Array.isArray(binding.unitIds) ? binding.unitIds as string[] : candidate.rootUnit.children).map(unitId => {
          const unit = candidate.units.find(entry => entry.id === unitId)!
          return [unit.id, unit.kind, unit.stage, unit.parentUnitId === candidate.rootUnit.id ? '@root' : unit.parentUnitId, unit.children, unit.year, unit.phase, unit.after]
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
          if (!unit || usedUnits.has(unit.id) || (atRoot ? unit.kind !== 'stage' || currentUnit !== undefined : !currentUnit || unit.parentUnitId !== currentUnit.id)) fail('SP-REF', nodePath, 'Declare each shared unit once at its explicit parent; only the two stages are roots.')
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
      if (role === 'target' && currentUnit && stagePlanChildren(plan, currentUnit.id).length) fail('SP-PLACEMENT', nodePath, 'In a subdivided stage every atomic target needs one temporal leaf placement, not an ambiguous aggregate placement.')
      if (role === 'target' && currentUnit?.kind !== 'stage' && node.placementBasis === undefined) fail('SP-SOURCE', nodePath, 'A nested target placement needs an explicit basis.')
      if (node.placementBasis !== undefined) basis(node.placementBasis, `${nodePath}.placementBasis`, currentUnit, plan)
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
    if (usedUnits.size !== plan.units.length || view.rootNodes.length !== 2
      || record(view.rootNodes[0])?.planUnitId !== plan.rootUnit.children[0]
      || record(view.rootNodes[1])?.planUnitId !== plan.rootUnit.children[1]) fail('SP-ROOT', path, 'A full subject view exposes exactly both stages in plan order.')
    const encountered = new Map<string, string[]>()
    const noteUnitOrder = (nodes: unknown[]) => nodes.forEach(raw => {
      const node = record(raw)
      if (node?.kind !== 'structure') return
      const unit = unitById.get(String(node.planUnitId))
      if (unit) encountered.set(unit.parentUnitId, [...encountered.get(unit.parentUnitId) ?? [], unit.id])
      if (Array.isArray(node.children)) noteUnitOrder(node.children)
    })
    noteUnitOrder(view.rootNodes)
    for (const unit of plan.units) if (unit.children && JSON.stringify(encountered.get(unit.id) ?? []) !== JSON.stringify(unit.children)) fail('SP-ORDER', path, 'A full view preserves every declared child and their explicit order.')
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
    const firstSource = materialized.get(sourceIds[0])!
    const binding = record(firstSource.planBinding)!
    const sourcePlan = plansById.get(String(binding.planId ?? (binding.planIds as string[])[0]))!
    const unitIds = new Set(stagePlanUnitIds(sourcePlan, selectedIds))
    const sortedSourceIds = [...sourceIds].sort()
    const candidates = sortedSourceIds.map(sourceId => {
      const source = materialized.get(sourceId)!, fullTargets = targetRolesByViewId.get(sourceId)!
      const roots = structuredClone(source.rootNodes.filter(node => node.kind === 'structure' && selectedIds.includes(String(node.planUnitId))))
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
  return unit ? { planId: plan.planId, planUnitId: unit.id, stage: unit.stage, after: [...unit.after],
    ...(plan.units.some(candidate => candidate.kind !== 'stage') ? { kind: unit.kind, parentUnitId: unit.parentUnitId,
      ...(unit.children ? { children: [...unit.children] } : {}), ...(unit.year !== undefined ? { year: unit.year } : {}),
      ...(unit.phase ? { phase: unit.phase } : {}) } : {}) } : undefined
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
  const rank = stagePlanLeafOrder(plan)
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
