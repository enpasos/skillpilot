import type { UiGoal } from '../../goalTypes'
import type { LearningUnitReadModel, LearningUnitsReadModel } from '../../utils/learningUnitsApi'
import type { LearnerMapProjectionInput } from './learnerMapProjection'

const unitKey = (ref: { contractId: string; revision: string }) => JSON.stringify([ref.contractId, ref.revision])
export const learningUnitNavigationId = (ref: { contractId: string; revision: string }) =>
  `__learning_unit_navigation__:${encodeURIComponent(ref.contractId)}:${encodeURIComponent(ref.revision)}`

const navigationGoal = (id: string, title: string, description: string, contains: string[]): UiGoal => ({
  id, title, description, contains, type: 'cluster', semanticKind: 'programStructure', requires: [],
  phase: 'GLOBAL', themenfeld: '', area: '', level: 0, core: true, weight: 1,
  leitideen: [], kompetenzen: [], sourceRef: '', examples: [],
})
const localText = (value: Record<string, string>, language: 'de' | 'en') => value[language] ?? value.de ?? value.en ?? ''

export interface LearningUnitNavigationProjection {
  input: LearnerMapProjectionInput
  unitsByEntryId: ReadonlyMap<string, LearningUnitReadModel>
  navigationEntryIds: ReadonlySet<string>
}

/** Read-only navigation from the selected backend offer. No goal definitions,
 * prerequisites, outcomes or unit completion are inferred or written here. */
export function projectLearningUnitNavigation(base: LearnerMapProjectionInput,
  readModel: LearningUnitsReadModel | null | undefined, language: 'de' | 'en'): LearningUnitNavigationProjection {
  const fallback = (): LearningUnitNavigationProjection => ({ input: base, unitsByEntryId: new Map(), navigationEntryIds: new Set() })
  if (readModel?.offerBinding?.status !== 'valid' || !readModel.offerBinding.rootContractRefs.length) return fallback()
  const units = new Map(readModel.units.map(unit => [unitKey(unit), unit]))
  if (units.size !== readModel.units.length) return fallback()
  const reached = new Set<string>()
  const visiting = new Set<string>()
  const owners = new Map<string, string>()
  const validate = (key: string): boolean => {
    if (visiting.has(key)) return false
    if (reached.has(key)) return true
    const unit = units.get(key)
    if (!unit || base.goalIndexAll.has(learningUnitNavigationId(unit))) return false
    visiting.add(key)
    for (const id of unit.ownGoalIds) {
      if (owners.has(id) && owners.get(id) !== key) return false
      owners.set(id, key)
      const goal = base.goalIndexAll.get(id)
      if (goal && (goal.type === 'cluster' || goal.contains.length)) return false
    }
    if (!unit.requiredChildContractRefs.every(ref => validate(unitKey(ref)))) return false
    visiting.delete(key)
    reached.add(key)
    return true
  }
  if (!readModel.offerBinding.rootContractRefs.every(ref => validate(unitKey(ref)))) return fallback()

  const goalIndexAll = new Map(base.goalIndexAll)
  const visibleGoalIds = new Set<string>()
  const children = new Map<string, readonly string[]>()
  const unitsByEntryId = new Map<string, LearningUnitReadModel>()
  const navigationEntryIds = new Set<string>()
  const unitEntryIds = new Set<string>()
  const attached = new Set<string>()
  const attach = (key: string): string | null => {
    // A shared required child has one visible path, in authored root order.
    if (attached.has(key)) return null
    attached.add(key)
    const unit = units.get(key)!
    const own = unit.ownGoalIds.filter(id => base.visibleGoalIds.has(id) && base.goalIndexAll.has(id))
    const required = unit.requiredChildContractRefs.map(ref => attach(unitKey(ref))).filter((id): id is string => id !== null)
    if (!own.length && !required.length) return null
    const id = learningUnitNavigationId(unit)
    const entries = [...own, ...required]
    goalIndexAll.set(id, navigationGoal(id, localText(unit.title, language),
      localText(unit.promise, language) || localText(unit.introduction, language), entries))
    children.set(id, entries)
    visibleGoalIds.add(id)
    own.forEach(goalId => { visibleGoalIds.add(goalId); children.set(goalId, []) })
    unitsByEntryId.set(id, unit)
    unitEntryIds.add(id)
    navigationEntryIds.add(id)
    return id
  }
  const unitRoots = readModel.offerBinding.rootContractRefs.map(ref => attach(unitKey(ref))).filter((id): id is string => id !== null)
  if (!unitRoots.length) return fallback()

  const pruned = new Map<string, boolean>()
  const remaining = (id: string): boolean => {
    if (pruned.has(id)) return pruned.get(id)!
    if (owners.has(id) || !base.visibleGoalIds.has(id) || !base.goalIndexAll.has(id)) return false
    pruned.set(id, false)
    const originalChildren = (base.visibleChildrenByParent.get(id) ?? [])
      .filter(child => base.visibleGoalIds.has(child) && base.goalIndexAll.has(child))
    const kept = originalChildren.filter(remaining)
    // Opaque canonical clusters remain sections, even without visible children.
    if (originalChildren.length && !kept.length) return false
    visibleGoalIds.add(id)
    children.set(id, kept)
    pruned.set(id, true)
    return true
  }
  const otherRoots = base.rootGoals.filter(goal => remaining(goal.id)).map(goal => goal.id)
  const roots = [...unitRoots]
  if (otherRoots.length) {
    let id = '__learning_unit_navigation_other_goals__'
    while (goalIndexAll.has(id)) id += '_'
    goalIndexAll.set(id, navigationGoal(id, language === 'en' ? 'Other learning goals' : 'Weitere Lernziele', '', otherRoots))
    children.set(id, otherRoots)
    visibleGoalIds.add(id)
    navigationEntryIds.add(id)
    roots.push(id)
  }
  return { input: { ...base, goalIndexAll, rootGoals: roots.map(id => goalIndexAll.get(id)!),
    visibleGoalIds, visibleChildrenByParent: children, navigationUnitIds: unitEntryIds }, unitsByEntryId, navigationEntryIds }
}
