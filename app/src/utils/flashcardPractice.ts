import { cardOriginGoalIds, type MemoryCardOriginFields } from './memoryCardOrigins'

/** Existing deck selectors and a topic's actual goal membership are independent filters. */
export function selectPracticeCards<T extends MemoryCardOriginFields>(
  cards: readonly T[], filterTags?: readonly string[], goalIds?: readonly string[],
): T[] {
  const tags = new Set(filterTags)
  const goals = goalIds === undefined ? null : new Set(goalIds)
  return cards.filter(card => (!tags.size || card.tags?.some(tag => tags.has(tag)))
    && (goals === null || cardOriginGoalIds(card).some(id => goals.has(id))))
}

export interface FlashcardPracticeRequest {
  goalId: string
  title: string
  /** Undefined practices the original complete deck; an empty list selects no cards. */
  goalIds?: string[]
}
