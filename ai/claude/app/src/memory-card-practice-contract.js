/* global __TOOL_MEMORY_CARD_START__, __TOOL_MEMORY_CARD_REVIEW__ */

export const MEMORY_CARD_PRACTICE_TOOLS = Object.freeze({
  start: typeof __TOOL_MEMORY_CARD_START__ === "string"
    ? __TOOL_MEMORY_CARD_START__
    : "start_skillpilot_memory_practice",
  review: typeof __TOOL_MEMORY_CARD_REVIEW__ === "string"
    ? __TOOL_MEMORY_CARD_REVIEW__
    : "review_skillpilot_memory_practice_card"
});

export const MEMORY_CARD_RATINGS = Object.freeze(["not_known", "known"]);

export function isMemoryCardRating(value) {
  return MEMORY_CARD_RATINGS.includes(value);
}
