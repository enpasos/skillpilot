/**
 * Understanding goals of a memory card.
 *
 * Deck format 2 (`contracts/memory-deck/v2`) names them in the card field
 * `originGoalIds`. Older decks encode the same relation as `goal:<id>` tags;
 * readers fall back to those tags only when the field is absent.
 */
export const MEMORY_DECK_FORMAT_VERSION = 2
export const LEGACY_ORIGIN_GOAL_TAG_PREFIX = 'goal:'

export interface MemoryCardOriginFields {
  originGoalIds?: readonly string[]
  tags?: readonly string[]
}

/** Goal IDs of the retired `goal:<id>` tag encoding, in tag order and without duplicates. */
export function legacyOriginGoalTagIds(card: MemoryCardOriginFields): string[] {
  const ids = (card.tags ?? [])
    .filter((tag) => typeof tag === 'string' && tag.startsWith(LEGACY_ORIGIN_GOAL_TAG_PREFIX))
    .map((tag) => tag.slice(LEGACY_ORIGIN_GOAL_TAG_PREFIX.length))
    .filter(Boolean)
  return [...new Set(ids)]
}

/** The card's understanding goals: the format-2 field when present, otherwise the legacy tags. */
export function cardOriginGoalIds(card: MemoryCardOriginFields): string[] {
  if (Array.isArray(card.originGoalIds)) {
    return [...new Set(card.originGoalIds.filter((id) => typeof id === 'string' && id.length > 0))]
  }
  return legacyOriginGoalTagIds(card)
}
