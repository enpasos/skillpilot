import type { StagePlan, StagePlanStructureBinding, StagePlanUnit } from '../../utils/stagePlan'
import type { UiGoal } from '../../goalTypes'
import type { GoalPlacement, ProgramUnit } from '../../landscapeTypes'
import { isCompositionStructureNode } from '../../utils/treeProjectionRuntime'
import { learnerMapProjectionSignature } from './learnerMapProjection'
import { buildLearnerUnitMapProjection, type LearnerMapMemberUnit, type LearnerMapUnitIdentity,
  type LearnerMapUnitOrder, type LearnerUnitMapFixture } from './learnerUnitMapProjection'
import { UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreviewSubjects'

export { MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID, UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreviewSubjects'

/**
 * PROVISIONAL stand-in until plan units are declared in the curriculum data
 * (concept §10.1, works F1/F2): the composition-view node IDs of the stage
 * sections. Each stage gets one unit key, so that Mathematics and Physics share
 * one map node per stage. Remove this table once the views declare plan units.
 */
export const PROVISIONAL_STAGE_PLAN_UNITS = [
  { key: 'sek1', label: { de: 'Sekundarstufe I', en: 'Lower secondary (Sek I)' },
    viewNodeIds: ['physics-seki', 'physics-bw-seki', 'sek1', 'sek-i', 'sek1-g8', 'sek1-g9',
      'rp-sek1-g8', 'rp-sek1-g9', 'sh-sek1-g8', 'sh-sek1-g9'] },
  { key: 'sek2', label: { de: 'Sekundarstufe II', en: 'Upper secondary (Sek II)' },
    viewNodeIds: ['physics-sekii-gk', 'physics-sekii-lk', 'physics-sekii-gk-lk', 'physics-bw-sekii', 'sek2-gk', 'sek2-lk', 'sek2-gk-lk', 'sek-ii',
      'kursstufe-gk', 'kursstufe-lk'] },
] as const

/** Stage order of the provisional plan units: each lies after the previous one. */
const STAGE_ORDER = PROVISIONAL_STAGE_PLAN_UNITS.map(stage => stage.key)
const stageByViewNodeId = new Map<string, (typeof PROVISIONAL_STAGE_PLAN_UNITS)[number]>(
  PROVISIONAL_STAGE_PLAN_UNITS.flatMap(stage => stage.viewNodeIds.map(nodeId => [nodeId, stage] as const)))

export interface LearnerUnitMapLandscapeSource {
  meta?: { landscapeId?: string; programUnits?: readonly ProgramUnit[]; goalPlacements?: readonly GoalPlacement[] }
}

/** A selected plan and its verified v1.3 index records, not a second placement source.
 * Loading and digest validation belong to the shared production reader. */
export interface LearnerStagePlanMapContext {
  plan: StagePlan
  views: readonly { viewId: string; planIds: readonly string[]; structureBindings: readonly StagePlanStructureBinding[] }[]
}

export interface LearnerUnitMapPreviewInput {
  rootGoals: readonly UiGoal[]
  goalIndexAll: ReadonlyMap<string, UiGoal>
  visibleGoalIds: ReadonlySet<string>
  visibleChildrenByParent: ReadonlyMap<string, readonly string[]>
  /** Learner landscapes with their placement layer; learning units come from here. */
  landscapeSources?: readonly LearnerUnitMapLandscapeSource[]
  language?: 'de' | 'en'
  /** Bound views use only indexed plan structures as units; unbound views retain their compatibility sections. */
  stagePlanContext?: LearnerStagePlanMapContext
}

export interface LearnerUnitMapPreview {
  /** Deepest top-down step: the deepest nesting of view sections (0 without sections). */
  maxStep: number
  step: number
  units: Map<string, LearnerMapUnitIdentity>
  after: LearnerMapUnitOrder[]
  memberUnits: LearnerMapMemberUnit[]
}

const viewNodeId = (goal: UiGoal) => typeof goal.extendedData?.compositionNodeId === 'string' ? goal.extendedData.compositionNodeId : undefined
const viewId = (goal: UiGoal) => typeof goal.extendedData?.compositionViewId === 'string' ? goal.extendedData.compositionViewId : ''
const metadataSignature = (value: unknown): string => JSON.stringify(value, (_key, entry: unknown) =>
  entry && typeof entry === 'object' && !Array.isArray(entry)
    ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left.localeCompare(right))) : entry)

/** The repository reader has already checked the raw index and source pins.
 * Refuse mixed plan authorities rather than falling back to the provisional table. */
export function resolveLearnerStagePlanContext(goals: ReadonlyMap<string, UiGoal>): LearnerStagePlanMapContext | undefined {
  let selected: LearnerStagePlanMapContext | undefined
  let selectedIndex: string | undefined
  const views = new Map<string, LearnerStagePlanMapContext['views'][number]>()
  for (const goal of goals.values()) {
    const raw = goal.extendedData?.stagePlanProjection
    if (raw === undefined) continue
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid runtime stage-plan projection')
    const context = raw as LearnerStagePlanMapContext & { indexSource?: { path?: string; sha256?: string } }
    if (!context.plan?.planId || !Array.isArray(context.plan.units) || !Array.isArray(context.views)
      || !context.indexSource?.path || !/^sha256:[0-9a-f]{64}$/u.test(context.indexSource.sha256 ?? '')) {
      throw new Error('Missing verified runtime stage-plan authority')
    }
    const source = `${context.indexSource.path}:${context.indexSource.sha256}`
    if (selectedIndex && selectedIndex !== source) throw new Error('Mixed runtime stage-plan index epochs')
    selectedIndex ??= source
    if (selected && metadataSignature(selected.plan) !== metadataSignature(context.plan)) throw new Error('Conflicting selected runtime stage plans')
    selected ??= context
    for (const view of context.views) {
      if (!view.planIds?.includes(context.plan.planId) || !Array.isArray(view.structureBindings)) throw new Error('Unbound runtime stage-plan view')
      const existing = views.get(view.viewId)
      if (existing && metadataSignature(existing) !== metadataSignature(view)) throw new Error('Conflicting runtime stage-plan view identity')
      views.set(view.viewId, view)
    }
  }
  return selected ? { plan: selected.plan, views: [...views.values()] } : undefined
}

/**
 * Units of the preview, top down (concept §10.1): the sections of the learner's
 * Land views stand in for plan units. Step 1 makes the outermost sections below
 * a subject root units; each further step adds the sections directly inside.
 * Subject roots and canonical clusters are never units here.
 */
export function deriveLearnerUnitMapPreview(input: LearnerUnitMapPreviewInput, requestedStep?: number): LearnerUnitMapPreview {
  const { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent, landscapeSources = [], language = 'de' } = input
  const stagePlanContext = input.stagePlanContext ?? resolveLearnerStagePlanContext(goalIndexAll)
  const planBoundViewIds = new Set(stagePlanContext?.views.map(view => view.viewId) ?? [])
  const declaredUnits = new Map<string, StagePlanUnit>()
  if (stagePlanContext) {
    const unitById = new Map(stagePlanContext.plan.units.map(unit => [unit.id, unit]))
    const bindings = new Map(stagePlanContext.views.filter(view => view.planIds.includes(stagePlanContext.plan.planId))
      .flatMap(view => view.structureBindings.map(binding => [`${view.viewId}\u0000${binding.structureId}`, binding] as const)))
    for (const goal of goalIndexAll.values()) {
      const binding = bindings.get(`${viewId(goal)}\u0000${viewNodeId(goal)}`)
      const unit = binding && unitById.get(binding.planUnitId)
      if (unit) declaredUnits.set(goal.id, unit)
    }
  }
  const subjects = new Set(UNIT_MAP_PREVIEW_SUBJECT_IDS)
  const isSection = (goal: UiGoal | undefined): goal is UiGoal => !!goal && isCompositionStructureNode(goal)
    && !goal.tags?.includes('root')
    && !!goal.landscapeId && subjects.has(goal.landscapeId) && !!viewNodeId(goal)
    && (!planBoundViewIds.has(viewId(goal)) || declaredUnits.has(goal.id))
  const children = (id: string) => (visibleChildrenByParent.get(id) ?? []).filter(child => visibleGoalIds.has(child))
  const depthOf = new Map<string, number>()
  const siblingSections: string[][] = []
  const seen = new Set<string>()
  const walk = (id: string, sectionDepth: number) => {
    if (seen.has(id)) return
    seen.add(id)
    const sections: string[] = []
    for (const child of children(id)) {
      const goal = goalIndexAll.get(child)
      const section = isSection(goal) && !depthOf.has(child)
      if (section) {
        depthOf.set(child, sectionDepth + 1)
        sections.push(child)
      }
      walk(child, section ? sectionDepth + 1 : sectionDepth)
    }
    if (sections.length > 1) siblingSections.push(sections)
  }
  for (const root of rootGoals) {
    // A selected overview can contain the subject roots. Section identity is
    // still restricted to the reviewed map subjects by isSection above.
    if (visibleGoalIds.has(root.id)) walk(root.id, 0)
  }
  const maxStep = Math.max(0, ...depthOf.values())
  const step = maxStep === 0 ? 0 : Math.min(maxStep, Math.max(1, Math.round(requestedStep ?? maxStep)))

  const keyOf = (goal: UiGoal) => {
    const declared = declaredUnits.get(goal.id)
    if (declared && stagePlanContext) return `plan:${stagePlanContext.plan.planId}:${declared.id}`
    const nodeId = viewNodeId(goal)!
    return stageByViewNodeId.get(nodeId)?.key ?? `${goal.landscapeId}:${viewId(goal)}:${nodeId}`
  }
  const units = new Map<string, LearnerMapUnitIdentity>()
  for (const [id, depth] of depthOf) {
    if (depth > step) continue
    const goal = goalIndexAll.get(id)!
    const declared = declaredUnits.get(id)
    const stage = planBoundViewIds.has(viewId(goal)) ? undefined : stageByViewNodeId.get(viewNodeId(goal)!)
    units.set(id, declared ? { key: keyOf(goal), label: language === 'en' ? declared.labelEn ?? declared.label : declared.label }
      : stage ? { key: stage.key, label: stage.label[language] } : { key: keyOf(goal) })
  }
  const keys = new Set([...units.values()].map(identity => identity.key))
  const after: LearnerMapUnitOrder[] = []
  if (stagePlanContext) {
    for (const unit of stagePlanContext.plan.units) for (const previous of unit.after) {
      const key = `plan:${stagePlanContext.plan.planId}:${unit.id}`, before = `plan:${stagePlanContext.plan.planId}:${previous}`
      if (keys.has(key) && keys.has(before)) after.push({ unit: key, after: before })
    }
  }
  // Unbound views retain their compatibility preview. Their identities and
  // sibling order cannot claim membership in an activated subject contribution.
  for (let index = 1; index < STAGE_ORDER.length; index++) {
    if (keys.has(STAGE_ORDER[index]) && keys.has(STAGE_ORDER[index - 1])) after.push({ unit: STAGE_ORDER[index], after: STAGE_ORDER[index - 1] })
  }
  for (const sections of siblingSections) {
    const unitKeys = sections.filter(id => units.has(id) && !planBoundViewIds.has(viewId(goalIndexAll.get(id)!)))
      .map(id => units.get(id)!.key)
    for (let index = 1; index < unitKeys.length; index++) {
      if (unitKeys[index] !== unitKeys[index - 1]) after.push({ unit: unitKeys[index], after: unitKeys[index - 1] })
    }
  }

  // Declared learning units (contract 1.2 `own` placements) where the data carries them.
  const memberUnits: LearnerMapMemberUnit[] = []
  for (const source of landscapeSources) {
    const meta = source.meta
    if (!meta?.landscapeId || !subjects.has(meta.landscapeId)) continue
    for (const unit of meta.programUnits ?? []) {
      if (unit.kind !== 'learningUnit') continue
      const goalIds = (meta.goalPlacements ?? []).filter(placement => placement.unitId === unit.id && placement.relation === 'own')
        .map(placement => placement.goalId)
      if (goalIds.length) memberUnits.push({ key: `learning-unit:${meta.landscapeId}:${unit.id}`,
        label: language === 'en' ? unit.labelEn ?? unit.label : unit.label, goalIds,
        withAssessments: (unit.coverageReviews?.length ?? 0) > 0 })
    }
  }
  return { maxStep, step, units, after, memberUnits }
}

/**
 * Boards with more children are listed without arrows. Measured on the real
 * Bavarian and Hessian GK views with ELK: boards up to 178 children lay out in
 * under 1 s; the stage boards of step 1 (408 to 1026 children) need 2.5 s to 40 s.
 */
export const UNIT_MAP_COMPACT_LIST_THRESHOLD = 200

export type LearnerUnitMapViewInput = LearnerUnitMapPreviewInput & {
  canonicalGoalIndexAll: ReadonlyMap<string, UiGoal>
  useRawGoalTitles?: boolean
}

/** Unchanged topology keeps the fixture object, and with it node DOM, camera state and ELK layouts. */
export function createLearnerUnitMapCache() {
  let previous: { signature: string; canonical: ReadonlyMap<string, UiGoal>; sources: unknown
    byStep: Map<number, { fixture: LearnerUnitMapFixture; maxStep: number; step: number }> } | undefined
  return (input: LearnerUnitMapViewInput, requestedStep: number | null) => {
    const context = input.stagePlanContext ?? resolveLearnerStagePlanContext(input.goalIndexAll)
    const signature = JSON.stringify([learnerMapProjectionSignature(input), input.language, context, [...input.visibleGoalIds].map(id => {
      const goal = input.goalIndexAll.get(id)
      return [goal?.landscapeId, goal?.extendedData?.syntheticStructureKind, goal?.extendedData?.compositionViewId,
        goal?.extendedData?.compositionNodeId, goal?.personalCurriculumProjection?.presentationOnly]
    })])
    if (previous?.signature !== signature || previous.canonical !== input.canonicalGoalIndexAll || previous.sources !== input.landscapeSources) {
      previous = { signature, canonical: input.canonicalGoalIndexAll, sources: input.landscapeSources, byStep: new Map() }
    }
    const preview = deriveLearnerUnitMapPreview(input, requestedStep ?? undefined)
    const cached = previous.byStep.get(preview.step)
    if (cached) return cached
    const fixture = buildLearnerUnitMapProjection({ ...input, units: preview.units, after: preview.after, memberUnits: preview.memberUnits })
    const result = { fixture, maxStep: preview.maxStep, step: preview.step }
    previous.byStep.set(preview.step, result)
    return result
  }
}
