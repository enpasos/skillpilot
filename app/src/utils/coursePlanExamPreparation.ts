import type { LearningCoursePlanBlock, MilestoneCoursePlanBlock, TeacherCoursePlan, TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import {
  addCoursePlanDays, countCoursePlanWorkdaysInclusive, evaluateTeacherCoursePlan,
  getLearningCoursePlanBlockGoalIds, isCoursePlanBlockActive, parseCoursePlanDate,
} from './localTeacherCoursePlan'
import {
  analyzeCoursePlanTaskCoverage, isCoursePlanAssessment, resolveCoursePlanTopicSelection,
  setCoursePlanTopicSelected, type CoursePlanTaskCoverage,
} from './coursePlanTopicSelection'

type VisibleChildren = ReadonlyMap<string, readonly string[]>

function resolveCoursePrerequisiteReference(ref: string, goals: ReadonlyMap<string, UiGoal>): string | null {
  if (goals.has(ref)) return ref
  const separator = ref.indexOf(':')
  if (separator >= 0 && goals.has(ref.slice(separator + 1))) return ref.slice(separator + 1)
  for (const id of goals.keys()) {
    if (id.endsWith(`:${ref}`)) return id
  }
  return null
}

export interface CoursePlanExamPreparation {
  coverage: CoursePlanTaskCoverage
  requiredGoalIds: string[]
  foundationGoalIds: string[]
  /** Prerequisite-only references outside this course; never scheduled targets. */
  externalFoundationGoalIds: string[]
  masteredGoalIds: string[]
  timelyGoalIds: string[]
  toPlanGoalIds: string[]
  unavailableGoalIds: string[]
  laterBlockIds: string[]
  validDates: boolean
  planEvaluable: boolean
}

/** Consent follows the full authored selection, even when open work is unchanged. */
export function coursePlanPreparationConsentKey(
  plan: TeacherCoursePlan,
  milestone: MilestoneCoursePlanBlock,
  preview: CoursePlanExamPreparation,
  startDate: string,
  endDate: string,
): string {
  return JSON.stringify([
    plan.revision, milestone.id, milestone.date,
    milestone.goalIds ?? (milestone.goalId ? [milestone.goalId] : []),
    startDate, endDate, preview.coverage, preview.requiredGoalIds,
    preview.foundationGoalIds, preview.externalFoundationGoalIds,
    preview.toPlanGoalIds, preview.unavailableGoalIds, preview.laterBlockIds,
  ])
}

/** Read-only preview. Prerequisites describe preparation, never assessment coverage. */
export function previewCoursePlanExamPreparation({
  plan, milestone, goals, visibleChildren, startDate, endDate,
}: {
  plan: TeacherCoursePlan
  milestone: MilestoneCoursePlanBlock
  goals: ReadonlyMap<string, UiGoal>
  visibleChildren?: VisibleChildren
  startDate: string
  endDate: string
}): CoursePlanExamPreparation {
  const coverage = analyzeCoursePlanTaskCoverage(milestone.goalIds ?? (milestone.goalId ? [milestone.goalId] : []), goals, visibleChildren)
  const scope = plan.planningBaseline ? new Set(plan.planningBaseline.scopeAtomicGoalIds) : null
  const open = plan.planningBaseline ? new Set(plan.planningBaseline.openAtomicGoalIds) : null
  const isMastered = (id: string) => Boolean(scope?.has(id) && !open?.has(id))
  const required = new Set([...coverage.topicGoalIds, ...coverage.coveredGoalIds, ...coverage.taskGoalIds])
  const original = new Set(required)
  const unavailable = new Set(coverage.unavailableGoalIds)
  const external = new Set<string>()
  const prerequisitesByGoal = new Map<string, Set<string>>()
  const visited = new Set<string>()
  const pending = [...required]
  while (pending.length > 0) {
    const id = pending.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    const goal = goals.get(id)
    if (!goal || (scope && !scope.has(id))) { unavailable.add(id); continue }
    if (isMastered(id)) continue
    const prerequisites = new Set<string>()
    prerequisitesByGoal.set(id, prerequisites)
    const refs = new Set([...goal.requires, ...(goal.effectiveRequires ?? []), ...(goal.inheritedRequires ?? [])])
    for (const ref of refs) {
      const courseRef = resolveCoursePrerequisiteReference(ref, goals)
      if (!courseRef) {
        // The course projection deliberately excludes other subjects and
        // prerequisite-only goals. Their absence is not missing task coverage.
        external.add(ref)
        continue
      }
      const resolved = resolveCoursePlanTopicSelection([courseRef], goals, visibleChildren)
      resolved.invalidGoalIds.forEach((missing) => unavailable.add(missing))
      for (const atom of resolved.atomicGoalIds) {
        if (scope && !scope.has(atom)) {
          external.add(atom)
          continue
        }
        if (isCoursePlanAssessment(goals.get(atom)!)) {
          unavailable.add(atom)
          continue
        }
        required.add(atom)
        if (!isMastered(atom)) prerequisites.add(atom)
        if (!visited.has(atom)) pending.push(atom)
      }
    }
  }
  // Detect in-course dependency cycles without recursion. Such a prerequisite
  // chain cannot be promised as complete, even if the existing plan is empty.
  const remainingPrerequisites = new Map([...prerequisitesByGoal].map(([id, refs]) => [id, refs.size]))
  const dependents = new Map<string, string[]>()
  prerequisitesByGoal.forEach((refs, id) => refs.forEach((ref) => {
    const entries = dependents.get(ref) ?? []
    entries.push(id)
    dependents.set(ref, entries)
  }))
  const ready = [...remainingPrerequisites].filter(([, count]) => count === 0).map(([id]) => id)
  for (let index = 0; index < ready.length; index += 1) {
    for (const dependent of dependents.get(ready[index]) ?? []) {
      const count = remainingPrerequisites.get(dependent)! - 1
      remainingPrerequisites.set(dependent, count)
      if (count === 0) ready.push(dependent)
    }
  }
  remainingPrerequisites.forEach((count, id) => { if (count > 0) unavailable.add(id) })
  const validDates = Boolean(parseCoursePlanDate(startDate) && parseCoursePlanDate(endDate) && parseCoursePlanDate(milestone.date)
    && startDate <= endDate && endDate < milestone.date
    && (countCoursePlanWorkdaysInclusive(startDate, endDate) ?? 0) > 0)
  const evaluation = validDates ? evaluateTeacherCoursePlan(plan, goals, endDate, visibleChildren) : null
  const timely = new Set(evaluation?.metrics?.dueGoalIds ?? [])
  const requiredGoalIds = [...required].filter((id) => !unavailable.has(id))
  const toPlanGoalIds = requiredGoalIds.filter((id) => !isMastered(id) && !timely.has(id))
  const toPlan = new Set(toPlanGoalIds)
  const laterBlockIds = plan.blocks.filter((block) => block.kind === 'learning' && isCoursePlanBlockActive(block)
    && resolveCoursePlanTopicSelection(getLearningCoursePlanBlockGoalIds(block), goals, visibleChildren)
      .atomicGoalIds.some((id) => toPlan.has(id))).map((block) => block.id)
  return {
    coverage, requiredGoalIds,
    foundationGoalIds: requiredGoalIds.filter((id) => !original.has(id)),
    externalFoundationGoalIds: [...external],
    masteredGoalIds: requiredGoalIds.filter(isMastered),
    timelyGoalIds: requiredGoalIds.filter((id) => !isMastered(id) && timely.has(id)),
    toPlanGoalIds, unavailableGoalIds: [...unavailable], laterBlockIds,
    validDates, planEvaluable: Boolean(evaluation?.metrics && evaluation.quality.status !== 'invalid'),
  }
}

/** Apply only the previewed scope; new task matches never widen this preparation. */
export function buildCoursePlanExamPreparationBlocks({
  plan, milestone, preview, goals, visibleChildren, startDate, endDate, blockId,
  moveLaterGoals, includeExternalFoundations = false, title,
}: {
  plan: TeacherCoursePlan
  milestone: MilestoneCoursePlanBlock
  preview: CoursePlanExamPreparation
  goals: ReadonlyMap<string, UiGoal>
  visibleChildren?: VisibleChildren
  startDate: string
  endDate: string
  blockId: string
  moveLaterGoals: boolean
  /** Acknowledges separate preparation; never changes external mastery. */
  includeExternalFoundations?: boolean
  title: string
}): TeacherCoursePlanBlock[] | null {
  if (!preview.validDates || !preview.planEvaluable || milestone.active === false
    || preview.coverage.taskGoalIds.length === 0 || preview.coverage.unknownTaskIds.length > 0
    || preview.unavailableGoalIds.length > 0 || preview.toPlanGoalIds.length === 0
    || (preview.externalFoundationGoalIds.length > 0 && !includeExternalFoundations)
    || (preview.laterBlockIds.length > 0 && !moveLaterGoals)) return null
  const moving = new Set(preview.toPlanGoalIds)
  const blocks = plan.blocks.map((block): TeacherCoursePlanBlock => {
    if (block.kind !== 'learning' || !isCoursePlanBlockActive(block)) return block
    let roots = [...getLearningCoursePlanBlockGoalIds(block)]
    const scope = resolveCoursePlanTopicSelection(roots, goals, visibleChildren)
    for (const atom of scope.atomicGoalIds) {
      if (moving.has(atom)) roots = setCoursePlanTopicSelected(roots, atom, false, goals, visibleChildren)
    }
    if (roots.length === getLearningCoursePlanBlockGoalIds(block).length
      && roots.every((id, index) => id === getLearningCoursePlanBlockGoalIds(block)[index])) return block
    // The preview explicitly names affected sections before a move is accepted.
    return roots.length ? { ...block, goalId: roots[0], goalIds: roots } : { ...block, active: false }
  })
  const preparation: LearningCoursePlanBlock = {
    id: blockId, kind: 'learning', goalId: preview.toPlanGoalIds[0],
    goalIds: [...preview.toPlanGoalIds], title, startDate, endDate, active: true,
  }
  blocks.push(preparation)
  const result = evaluateTeacherCoursePlan({ ...plan, blocks }, goals, endDate, visibleChildren)
  const due = new Set(result.metrics?.dueGoalIds ?? [])
  // Buffers or another section must not turn the promised deadline into a partial plan.
  const mastered = new Set(preview.masteredGoalIds)
  return result.metrics && result.quality.status !== 'invalid'
    && preview.requiredGoalIds.every((id) => mastered.has(id) || due.has(id)) ? blocks : null
}

export const defaultCoursePlanPreparationEnd = (milestone: MilestoneCoursePlanBlock) => addCoursePlanDays(milestone.date, -1) ?? milestone.date
