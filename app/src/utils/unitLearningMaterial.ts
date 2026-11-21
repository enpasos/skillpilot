import { learnerGoalPresentationKind, type UiGoal } from '../goalTypes'
import type { MapPracticeMaterial } from '../components/learningUnitMap/types'

declare const __UNIT_MAP_LEARNING_MATERIALS__: readonly MapPracticeMaterial[]
export const UNIT_MAP_LEARNING_MATERIALS: readonly MapPracticeMaterial[] =
  typeof __UNIT_MAP_LEARNING_MATERIALS__ === 'undefined' ? [] : __UNIT_MAP_LEARNING_MATERIALS__

const matchesView = (viewIds: readonly string[], value: unknown) => typeof value === 'string'
  && (viewIds.includes(value) || value.startsWith('merged:') && value.slice(7).split('+').every(id => viewIds.includes(id)))

export function isUnitMaterialSource(material: MapPracticeMaterial, goal: UiGoal): boolean {
  return goal.landscapeId === material.unit.landscapeId
    && goal.extendedData?.compositionNodeId === material.unit.compositionNodeId
    && matchesView(material.unit.viewIds, goal.extendedData.compositionViewId)
}

/** Use the material of the nearest bound unit on the displayed path, just as the coach does. */
export function findUnitPracticeExercise(goal: UiGoal | undefined, scopeIdsNearestFirst: Iterable<string>,
  materialForScope: (scopeId: string) => MapPracticeMaterial | undefined, language: 'de' | 'en') {
  if (!goal || learnerGoalPresentationKind(goal) !== 'goal') return
  for (const scopeId of scopeIdsNearestFirst) {
    const material = materialForScope(scopeId)
    if (material && material.unit.landscapeId === goal.landscapeId) {
      return material.exercises.find(exercise => exercise.goalId === goal.id)?.[language]
    }
  }
}
