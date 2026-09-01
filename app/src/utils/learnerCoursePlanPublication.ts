import type { TeacherCoursePlan } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import type { SaveLearnerLearningPlanBlock } from '../learnerLearningPlanTypes'
import { assignAtomicGoalsToLearningBlocks } from './localTeacherCoursePlan'

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
    if (block.kind === 'learning') {
      const assignment = assignmentByBlockId.get(block.id)
      if (!assignment) {
        return { ok: false, blockId: block.id, goalId: block.goalId }
      }
      if (assignment.atomicGoalIds.length === 0) continue
      assignment.atomicGoalIds.forEach((goalId) => uniqueAtomicGoalIds.add(goalId))
      const title = block.title?.trim() || goals.get(block.goalId)?.title?.trim()
      blocks.push({
        id: block.id,
        kind: 'learning',
        goalId: block.goalId,
        ...(title ? { title } : {}),
        startDate: block.startDate,
        endDate: block.endDate,
        atomicGoalIds: [...assignment.atomicGoalIds],
      })
      continue
    }
    if (block.kind === 'buffer') {
      blocks.push({
        id: block.id,
        kind: 'buffer',
        title: block.title,
        startDate: block.startDate,
        endDate: block.endDate,
      })
      continue
    }
    blocks.push({
      id: block.id,
      kind: 'milestone',
      title: block.title,
      ...(block.goalId ? { goalId: block.goalId } : {}),
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
