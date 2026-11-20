import type { StagePlan, StagePlanStructureBinding, StagePlanUnit } from '../../utils/stagePlan'
import type { UiGoal } from '../../goalTypes'
import type { GoalPlacement, ProgramUnit } from '../../landscapeTypes'
import { isCompositionStructureNode } from '../../utils/treeProjectionRuntime'
import { projectCompositionChildOrder, readCompositionChildOrder } from '../../utils/authoring/compositionViewAuthoring'
import { learnerMapProjectionSignature } from './learnerMapProjection'
import { buildLearnerUnitMapProjection, type LearnerMapMemberUnit, type LearnerMapUnitIdentity,
  type LearnerMapUnitOrder, type LearnerUnitMapFixture } from './learnerUnitMapProjection'
import { MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID, UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreviewSubjects'

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

type HesseCompatibilityDuration = 'G8' | 'G9' | 'duration-neutral'
type HesseCompatibilityView = { landscapeId: string; duration?: HesseCompatibilityDuration }
/** Explicit preview compatibility records, not activated v1.3 plan bindings.
 * Duration-specific Physics identities use the source-backed G8 year nodes;
 * the retained neutral Physics views keep their G9 year nodes. */
const hesseCompatibilityViews = new Map<string, HesseCompatibilityView>()
const registerHesseCourseViews = (gk: string, lk: string, record: HesseCompatibilityView) => {
  for (const id of [gk, lk, `merged:${lk}+${gk}`, `merged:${gk}+${lk}`]) hesseCompatibilityViews.set(id, record)
}
for (const [suffix, duration] of [['', undefined], ['-g8', 'G8'], ['-g9', 'G9']] as const) {
  registerHesseCourseViews(`de-he-gym-math-gk${suffix}`, `de-he-gym-math-lk${suffix}`,
    { landscapeId: MATHEMATICS_LANDSCAPE_ID, duration })
}
registerHesseCourseViews('de-he-gym-sekii-math-gk', 'de-he-gym-sekii-math-lk', { landscapeId: MATHEMATICS_LANDSCAPE_ID })
for (const duration of ['G8', 'G9'] as const) hesseCompatibilityViews.set(`de-he-gym-seki-math-${duration.toLowerCase()}`,
  { landscapeId: MATHEMATICS_LANDSCAPE_ID, duration })
registerHesseCourseViews('de-he-gym-physics-gk', 'de-he-gym-physics-lk', { landscapeId: PHYSICS_LANDSCAPE_ID })
registerHesseCourseViews('de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8', { landscapeId: PHYSICS_LANDSCAPE_ID, duration: 'G8' })
hesseCompatibilityViews.set('de-he-gym-seki-physics-g8', { landscapeId: PHYSICS_LANDSCAPE_ID, duration: 'G8' })
registerHesseCourseViews('de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9', { landscapeId: PHYSICS_LANDSCAPE_ID, duration: 'G9' })
hesseCompatibilityViews.set('de-he-gym-seki-physics-g9', { landscapeId: PHYSICS_LANDSCAPE_ID, duration: 'G9' })
registerHesseCourseViews('de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk', { landscapeId: PHYSICS_LANDSCAPE_ID })

type ReviewedHesseCompatibilityIdentity = LearnerMapUnitIdentity & { calendar: string; position: number }
const hesseYearNodes = new Map<string, { year: number; duration?: HesseCompatibilityDuration }>()
for (const year of [5, 6, 7, 8, 9, 10]) for (const [suffix, duration] of [['', undefined], ['-g8', 'G8'], ['-g9', 'G9']] as const) {
  if (year === 10 && duration === 'G8') continue
  hesseYearNodes.set(`j${year}${suffix}`, { year, duration })
}
const hessePhaseNodes = new Map([
  ['e-phase', { phase: 'E', position: 0, de: 'Einführungsphase', en: 'Introductory phase' }],
  ['q1', { phase: 'Q1', position: 1, de: 'Q1', en: 'Q1' }],
  ['q2', { phase: 'Q2', position: 2, de: 'Q2', en: 'Q2' }],
  ['q3', { phase: 'Q3', position: 3, de: 'Q3', en: 'Q3' }],
  ['q4', { phase: 'Q4', position: 4, de: 'Q4', en: 'Q4' }],
  ['abitur', { phase: 'abitur', position: 5, de: 'Abiturprüfung', en: 'Abitur examination' }],
])
const hessePhysicsPhaseNodes = new Map([
  ['physics-e-phase', 'e-phase'], ['physics-q1', 'q1'], ['physics-q2', 'q2'],
  ['physics-q3', 'q3'], ['physics-q4', 'q4'], ['physics-he-abitur', 'abitur'],
])
const hessePhysicsYearNodes = new Map<string, { year: number; duration?: HesseCompatibilityDuration }>(
  [7, 8, 10].map(year => [`physics-he-seki-j${year}`, { year }]))
for (const year of [6, 7, 8, 9]) hessePhysicsYearNodes.set(`physics-he-seki-j${year}-g8`, { year, duration: 'G8' })

function deriveReviewedHesseCompatibilityIdentities(
  goals: ReadonlyMap<string, UiGoal>, visibleIds: ReadonlySet<string>, language: 'de' | 'en',
): Map<string, ReviewedHesseCompatibilityIdentity> {
  const durations = new Set<HesseCompatibilityDuration>()
  let hasMathematicsContext = false
  for (const [id, goal] of goals) {
    if (!visibleIds.has(id)) continue
    const view = hesseCompatibilityViews.get(viewId(goal))
    if (!view || view.landscapeId !== goal.landscapeId) continue
    if (view.landscapeId === MATHEMATICS_LANDSCAPE_ID) hasMathematicsContext = true
    if (view.duration) durations.add(view.duration)
  }
  if (!hasMathematicsContext || durations.size > 1) return new Map()
  // A neutral Physics view may join one explicit selected display context.
  // Ambiguous mixed-duration input never merges Physics with either duration.
  const selectedDuration = durations.size === 1 ? [...durations][0] : 'duration-neutral'
  const identities = new Map<string, ReviewedHesseCompatibilityIdentity>()
  for (const [id, goal] of goals) {
    const view = hesseCompatibilityViews.get(viewId(goal)), node = viewNodeId(goal)
    if (!visibleIds.has(id) || !view || view.landscapeId !== goal.landscapeId || !node) continue
    const mathYear = view.landscapeId === MATHEMATICS_LANDSCAPE_ID ? hesseYearNodes.get(node) : undefined
    const physicsYear = view.landscapeId === PHYSICS_LANDSCAPE_ID ? hessePhysicsYearNodes.get(node) : undefined
    if (mathYear?.duration && mathYear.duration !== view.duration) continue
    if (physicsYear && (physicsYear.duration === 'G8' ? view.duration !== 'G8' : view.duration === 'G8')) continue
    if (view.duration === 'G8' && mathYear?.year === 10) continue
    const duration = view.duration ?? selectedDuration
    const prefix = `he-compat:${duration}`
    const year = mathYear?.year ?? physicsYear?.year
    if (year !== undefined) {
      identities.set(id, { key: `${prefix}:year:${year}`, calendar: `${prefix}:years`, position: year,
        label: language === 'en' ? `Year ${year}` : `Jahrgangsstufe ${year}` })
      continue
    }
    const phase = hessePhaseNodes.get(view.landscapeId === MATHEMATICS_LANDSCAPE_ID ? node : hessePhysicsPhaseNodes.get(node) ?? '')
    if (phase) identities.set(id, { key: `${prefix}:phase:${phase.phase}`, calendar: `${prefix}:phases`, position: phase.position,
      label: phase[language] })
  }
  return identities
}

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
    // A single-stage projection may expose its actual stage as a root. Its
    // explicit identity still belongs to the shared stage calendar; a subject
    // root or an unknown structure never gains a unit from its title or tag.
    && (!goal.tags?.includes('root') || stageByViewNodeId.has(viewNodeId(goal) ?? '') || declaredUnits.has(goal.id))
    && !!goal.landscapeId && subjects.has(goal.landscapeId) && !!viewNodeId(goal)
    && (!planBoundViewIds.has(viewId(goal)) || declaredUnits.has(goal.id))
  const children = (id: string) => (visibleChildrenByParent.get(id) ?? []).filter(child => visibleGoalIds.has(child))
  const depthOf = new Map<string, number>()
  const siblingSections: { parent: string; sections: string[] }[] = []
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
    if (sections.length > 1) siblingSections.push({ parent: id, sections })
  }
  for (const root of rootGoals) {
    // A selected overview can contain the subject roots. Section identity is
    // still restricted to the reviewed map subjects by isSection above.
    if (!visibleGoalIds.has(root.id)) continue
    const depth = isSection(root) ? depthOf.get(root.id) ?? 1 : 0
    if (depth) depthOf.set(root.id, depth)
    walk(root.id, depth)
  }
  const maxStep = Math.max(0, ...depthOf.values())
  const step = maxStep === 0 ? 0 : Math.min(maxStep, Math.max(1, Math.round(requestedStep ?? maxStep)))
  const hesseCompatibility = deriveReviewedHesseCompatibilityIdentities(goalIndexAll, visibleGoalIds, language)
  for (const [id] of hesseCompatibility) if (planBoundViewIds.has(viewId(goalIndexAll.get(id)!))) hesseCompatibility.delete(id)

  const keyOf = (goal: UiGoal) => {
    const declared = declaredUnits.get(goal.id)
    if (declared && stagePlanContext) return `plan:${stagePlanContext.plan.planId}:${declared.id}`
    const compatibility = hesseCompatibility.get(goal.id)
    if (compatibility) return compatibility.key
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
      : stage ? { key: stage.key, label: stage.label[language] }
        : hesseCompatibility.has(id) ? { key: keyOf(goal), label: hesseCompatibility.get(id)!.label } : { key: keyOf(goal) })
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
  const compatibilityCalendars = new Map<string, Map<string, ReviewedHesseCompatibilityIdentity>>()
  for (const [id, identity] of hesseCompatibility) {
    if (!units.has(id)) continue
    const calendar = compatibilityCalendars.get(identity.calendar) ?? new Map<string, ReviewedHesseCompatibilityIdentity>()
    calendar.set(identity.key, identity)
    compatibilityCalendars.set(identity.calendar, calendar)
  }
  // Calendar adjacency follows the union across subjects. Physics 8 -> 10 must
  // not shortcut a visible Mathematics year 9, nor can partial E/Q sibling
  // lists remove the known order of another subject's intervening phase.
  for (const calendar of compatibilityCalendars.values()) {
    const ordered = [...calendar.values()].sort((left, right) => left.position - right.position)
    for (let index = 1; index < ordered.length; index++) after.push({ unit: ordered[index].key, after: ordered[index - 1].key })
  }
  for (const { parent, sections } of siblingSections) {
    const parentGoal = goalIndexAll.get(parent)!
    const unboundSections = sections.filter(id => units.has(id) && !planBoundViewIds.has(viewId(goalIndexAll.get(id)!)))
    // A source declaration is the complete partial planning order for this
    // parent. Missing pairs impose no order; actual requires remain visible
    // through the independent map projection. Bound plans always take priority.
    if (!planBoundViewIds.has(viewId(parentGoal)) && parentGoal.extendedData?.compositionChildOrder !== undefined) {
      // Keep the source identity inventory: Personal Curriculum pruning may
      // already have removed an empty intermediate child from contains.
      const sourceChildIds = parentGoal.extendedData.compositionChildOrderChildIds
      if (!Array.isArray(sourceChildIds) || !sourceChildIds.every(id => typeof id === 'string')
        || new Set(sourceChildIds).size !== sourceChildIds.length) throw new Error('Missing source child identities for composition childOrder')
      const declared = readCompositionChildOrder(parentGoal.extendedData.compositionChildOrder,
        sourceChildIds)!
      const byNodeId = new Map(unboundSections.map(id => [viewNodeId(goalIndexAll.get(id)!)!, id]))
      for (const pair of projectCompositionChildOrder(declared, [...byNodeId.keys()]).after) {
        const current = byNodeId.get(pair.unit), previous = byNodeId.get(pair.after)
        if (!current || !previous) continue
        const unit = units.get(current)!.key, before = units.get(previous)!.key
        if (unit !== before) after.push({ unit, after: before })
      }
      continue
    }
    for (let index = 1; index < unboundSections.length; index++) {
      const previous = unboundSections[index - 1], current = unboundSections[index]
      const left = hesseCompatibility.get(previous), right = hesseCompatibility.get(current)
      if (left && right && left.calendar === right.calendar) continue
      const before = units.get(previous)!.key, unit = units.get(current)!.key
      if (unit !== before) after.push({ unit, after: before })
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
        goal?.extendedData?.compositionNodeId, goal?.extendedData?.compositionChildOrder,
        goal?.extendedData?.compositionChildOrderChildIds, goal?.personalCurriculumProjection?.presentationOnly]
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
