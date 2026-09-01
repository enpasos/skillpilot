import type { LearnerCoursePlanBaseline } from '../coursePlanTypes'
import { normalizeLearnerCoursePlanBaseline } from './localTeacherCoursePlan'

interface LearnerPlanningScopeResponse {
  curriculumId: unknown
  landscapeId: unknown
  focusGoalIds: unknown
  scopeGoalIds: unknown
  totalAtomicGoalCount: unknown
  masteredAtomicGoalCount: unknown
  openAtomicGoalIds: unknown
  capturedAt: unknown
}

const apiBase = String(import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

export interface FetchLearnerPlanningScopeInput {
  learnerId: string
  landscapeId: string
  scopeGoalId?: string
  signal?: AbortSignal
}

/**
 * Reads the learner's authoritative target projection without creating any
 * server-side teacher/learner relation or changing learner state.
 */
export async function fetchLearnerPlanningScope({
  learnerId,
  landscapeId,
  scopeGoalId,
  signal,
}: FetchLearnerPlanningScopeInput): Promise<LearnerCoursePlanBaseline> {
  const query = new URLSearchParams({ landscapeId })
  if (scopeGoalId) query.set('scopeGoalId', scopeGoalId)
  const response = await fetch(
    toApi(`/api/ui/learners/${encodeURIComponent(learnerId)}/planning-scope?${query.toString()}`),
    { cache: 'no-store', signal },
  )
  if (!response.ok) throw new Error(`Unexpected planning-scope status ${response.status}`)
  const value = await response.json() as LearnerPlanningScopeResponse
  const baseline = normalizeLearnerCoursePlanBaseline({
    source: 'learner-planning-scope-v1',
    curriculumId: value?.curriculumId,
    landscapeId: value?.landscapeId,
    ...(scopeGoalId ? { scopeGoalId } : {}),
    focusGoalIds: value?.focusGoalIds,
    scopeAtomicGoalIds: value?.scopeGoalIds,
    openAtomicGoalIds: value?.openAtomicGoalIds,
    totalAtomicGoalCount: value?.totalAtomicGoalCount,
    masteredAtomicGoalCount: value?.masteredAtomicGoalCount,
    capturedAt: value?.capturedAt,
  })
  if (!baseline || baseline.landscapeId !== landscapeId) {
    throw new Error('Planning-scope response is inconsistent.')
  }
  return baseline
}
