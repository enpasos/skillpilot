import type { UiGoal } from '../goalTypes'
import type { MapPracticeMaterial } from '../components/learningUnitMap/types'
import { isUnitMaterialSource } from './unitLearningMaterial'

/** Select only the material owned by this displayed unit or its own orientation. */
export function unitIntroductionForSelection(goal: UiGoal | undefined, pathNearestFirst: Iterable<string>,
  goals: ReadonlyMap<string, UiGoal>, materials: readonly MapPracticeMaterial[]) {
  if (!goal) return
  const path = [...pathNearestFirst].flatMap(id => goals.get(id) ?? [])
  return materials.find(material => isUnitMaterialSource(material, goal)
    || material.unit.orientationGoalId === goal.id && material.unit.landscapeId === goal.landscapeId
      && path.some(scope => isUnitMaterialSource(material, scope)))
}

/** A resource starts only after the backend has checked the browsed unit. */
export async function requestUnitIntroductionGate(learnerId: string, goalId: string,
  options: { fetchImpl?: typeof fetch; apiBase?: string } = {}): Promise<string | null> {
  if (!learnerId || !goalId) throw new Error('Missing unit introduction context')
  const base = (options.apiBase ?? import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const response = await (options.fetchImpl ?? fetch)(`${base}/api/ui/learners/${encodeURIComponent(learnerId)}/unit-introduction?${new URLSearchParams({ goalId })}`,
    { cache: 'no-store' })
  if (!response.ok) throw new Error('Unit introduction unavailable')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid unit introduction')
  const orientation = (data as Record<string, unknown>).orientationGoalId
  if (orientation === null) return null
  if (typeof orientation !== 'string' || !orientation.trim()) throw new Error('Invalid unit introduction')
  return orientation
}
