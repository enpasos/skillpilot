declare const __TOOL_MEMORY_CARD_START__: string;
declare const __TOOL_MEMORY_CARD_REVIEW__: string;

/**
 * The two names are injected by the widget build. Keeping them in one module
 * prevents the interactive view and its tests from drifting away from the MCP
 * tool catalog.
 */
export const MEMORY_CARD_PRACTICE_TOOLS = Object.freeze({
  start: __TOOL_MEMORY_CARD_START__,
  review: __TOOL_MEMORY_CARD_REVIEW__
});

export type MemoryCardRating = "not_known" | "known";
