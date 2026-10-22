import type { TeacherCoursePlan } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import type { SaveLearnerLearningPlanBlock } from '../learnerLearningPlanTypes'
import {
  assignAtomicGoalsToLearningBlocks,
  getLearningCoursePlanBlockGoalIds,
  isCoursePlanBlockActive,
  resolveAtomicGoalDescendants,
  resolveLearningCoursePlanBlockAtomicGoals,
} from './localTeacherCoursePlan'

export interface LearnerLearningPlanCopy {
  planLabel: string
  blocks: SaveLearnerLearningPlanBlock[]
  atomicGoalCount: number
}

export type LearnerLearningPlanCopyResult =
  | { ok: true; copy: LearnerLearningPlanCopy }
  | { ok: false; blockId: string; goalId: string }

/**
 * Creates a subject-plan copy from the teacher-owned local draft. Learning
 * blocks use the immutable open-goal assignments captured by the teacher plan.
 * The baseline is consulted only to keep that scope; it is never copied into
 * the request. Mastery, coverage journal, attestations, class reference, and
 * revision history likewise never enter the resulting request document.
 */
export function materializeLearnerLearningPlanCopy({
  plan,
  fallbackPlanLabel,
  goals,
  visibleChildrenByParent,
}: {
  plan: TeacherCoursePlan
  fallbackPlanLabel: string
  goals: ReadonlyMap<string, UiGoal>
  visibleChildrenByParent?: ReadonlyMap<string, readonly string[]>
}): LearnerLearningPlanCopyResult {
  const blocks: SaveLearnerLearningPlanBlock[] = []
  const uniqueAtomicGoalIds = new Set<string>()
  const assignmentResult = assignAtomicGoalsToLearningBlocks(
    plan,
    goals,
    visibleChildrenByParent,
  )
  if (assignmentResult.quality.status !== 'complete') {
    const issue = assignmentResult.quality.issues[0]
    return {
      ok: false,
      blockId: issue?.blockId ?? '',
      goalId: issue?.goalId ?? '',
    }
  }
  const assignmentByBlockId = new Map(
    assignmentResult.assignments.map((assignment) => [assignment.blockId, assignment]),
  )

  for (const block of plan.blocks) {
    const activation = block.active === undefined ? {} : { active: block.active }
    if (block.kind === 'learning') {
      const assignment = assignmentByBlockId.get(block.id)
      const active = isCoursePlanBlockActive(block)
      if (active && !assignment) {
        return { ok: false, blockId: block.id, goalId: block.goalId }
      }
      // Paused work is retained independently of active deduplication. It must
      // still resolve in the selected curriculum before publishing, but cannot
      // reserve atoms or contribute to the active plan's work count.
      const inactiveResolution = active ? null
        : resolveLearningCoursePlanBlockAtomicGoals(block, goals, visibleChildrenByParent)
      if (inactiveResolution && inactiveResolution.quality.status !== 'complete') {
        return {
          ok: false, blockId: block.id,
          goalId: inactiveResolution.quality.issues[0]?.goalId ?? block.goalId,
        }
      }
      const baselineOpen = plan.planningBaseline
        ? new Set(plan.planningBaseline.openAtomicGoalIds) : null
      const atomicGoalIds = active
        ? assignment!.atomicGoalIds
        : inactiveResolution!.atomicGoalIds.filter((goalId) => !baselineOpen || baselineOpen.has(goalId))
      if (active && atomicGoalIds.length === 0) continue
      if (active) atomicGoalIds.forEach((goalId) => uniqueAtomicGoalIds.add(goalId))
      const goalId = getLearningCoursePlanBlockGoalIds(block)[0]!
      const title = block.title?.trim() || goals.get(goalId)?.title?.trim()
      blocks.push({
        id: block.id,
        kind: 'learning',
        ...activation,
        goalId,
        ...(block.goalIds !== undefined ? { goalIds: [...block.goalIds] } : {}),
        ...(title ? { title } : {}),
        startDate: block.startDate,
        endDate: block.endDate,
        atomicGoalIds: [...atomicGoalIds],
      })
      continue
    }
    if (block.kind === 'buffer') {
      blocks.push({
        id: block.id,
        kind: 'buffer',
        ...activation,
        title: block.title,
        startDate: block.startDate,
        endDate: block.endDate,
      })
      continue
    }
    const milestoneGoalIds = block.goalIds ?? (block.goalId ? [block.goalId] : [])
    for (const goalId of milestoneGoalIds) {
      const resolution = resolveAtomicGoalDescendants(goalId, goals, visibleChildrenByParent)
      if (resolution.quality.status !== 'complete'
        || (block.goalIds !== undefined && resolution.atomicGoalIds.length === 0)) {
        return { ok: false, blockId: block.id, goalId }
      }
    }
    blocks.push({
      id: block.id,
      kind: 'milestone',
      ...activation,
      title: block.title,
      ...(block.goalIds !== undefined
        ? { goalIds: [...block.goalIds] }
        : block.goalId ? { goalId: block.goalId } : {}),
      date: block.date,
    })
  }

  return {
    ok: true,
    copy: {
      planLabel: plan.schoolYearLabel?.trim() || fallbackPlanLabel.trim(),
      blocks,
      atomicGoalCount: uniqueAtomicGoalIds.size,
    },
  }
}
