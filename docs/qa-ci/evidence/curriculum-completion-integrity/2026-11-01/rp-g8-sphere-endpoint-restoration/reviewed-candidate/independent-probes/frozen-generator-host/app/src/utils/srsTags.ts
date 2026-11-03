import type { UiGoal } from '../goalTypes'

const SRS_FILTER_EXCLUDE = new Set([
  'structure',
  'root',
  'module',
  'lesson',
  'vocabulary',
  'grammar',
  'practice',
  'memorization',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
])

export function getSrsFilterTags(tags?: string[]): string[] {
  const safeTags = Array.isArray(tags) ? tags : []
  const selectTags = safeTags.filter((tag) => tag.startsWith('select:'))
  if (selectTags.length > 0) return selectTags

  return safeTags.filter((tag) => !tag.startsWith('srs-deck') && !SRS_FILTER_EXCLUDE.has(tag))
}

export function getSrsFilterTagsForGoal(goal: UiGoal): string[] {
  return getSrsFilterTags(goal.tags)
}
