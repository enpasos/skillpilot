export type GoalVisualization = {
  goalId: string;
  title: string;
  description?: string;
  imageUrl: string;
  altText: string;
  cockpitUrl: string;
};

/**
 * Decide whether the visualization UI must stay suppressed for this host.
 *
 * The MCP Apps host context is authoritative when it publishes a known
 * platform. The user-agent fallback is presentation-only and covers hosts
 * that do not expose the standard context yet; it is not a security boundary.
 */
export function isMobileGoalVisualizationHost(
  platform: unknown,
  ...userAgents: unknown[]
): boolean {
  if (platform === "mobile") return true;
  if (platform === "web" || platform === "desktop") return false;

  return userAgents.some(
    (value) =>
      typeof value === "string" &&
      /(?:Android|iP(?:hone|ad|od)|Windows Phone|Mobile)/i.test(value)
  );
}

export function goalVisualizationFromStructuredContent(
  value: unknown
): GoalVisualization | undefined {
  const structuredContent = record(value);
  const candidate = record(structuredContent?.goalVisualization);
  if (!candidate) return undefined;

  const goalId = boundedText(candidate.goalId, 200);
  const title = boundedText(candidate.title, 500);
  const description = optionalBoundedText(candidate.description, 4_000);
  const imageUrl = safeHttpsUrl(candidate.imageUrl);
  const altText = boundedText(candidate.altText, 1_000);
  const cockpitUrl = safeHttpsUrl(candidate.cockpitUrl);

  if (!goalId || !title || !imageUrl || !altText || !cockpitUrl) return undefined;

  return {
    goalId,
    title,
    ...(description ? { description } : {}),
    imageUrl,
    altText,
    cockpitUrl
  };
}

/**
 * Merge a host update into the currently rendered visualization.
 *
 * ChatGPT can deliver the same tool result through both the standards-first
 * MCP Apps notification and the window.openai compatibility bridge. Later
 * compatibility updates may be partial and therefore contain no tool output.
 * A dedicated visualization tool never intentionally clears its own result,
 * so an absent or malformed update must not erase an already rendered image.
 */
export function retainGoalVisualization(
  current: GoalVisualization | undefined,
  structuredContent: unknown
): GoalVisualization | undefined {
  const next = goalVisualizationFromStructuredContent(structuredContent);
  if (!next) return current;
  return sameGoalVisualization(current, next) ? current : next;
}

/**
 * Select the first valid host candidate in precedence order. Returning the
 * current object for an identical first candidate is intentional: an older
 * fallback must not restore stale content after the current event value.
 */
export function firstGoalVisualization(
  current: GoalVisualization | undefined,
  structuredContents: readonly unknown[]
): GoalVisualization | undefined {
  for (const structuredContent of structuredContents) {
    const next = goalVisualizationFromStructuredContent(structuredContent);
    if (!next) continue;
    return sameGoalVisualization(current, next) ? current : next;
  }
  return current;
}

function sameGoalVisualization(
  left: GoalVisualization | undefined,
  right: GoalVisualization
): boolean {
  return (
    left?.goalId === right.goalId &&
    left.title === right.title &&
    left.description === right.description &&
    left.imageUrl === right.imageUrl &&
    left.altText === right.altText &&
    left.cockpitUrl === right.cockpitUrl
  );
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function boundedText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : undefined;
}

function optionalBoundedText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return boundedText(value, maxLength);
}

function safeHttpsUrl(value: unknown): string | undefined {
  const text = boundedText(value, 2_000);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
