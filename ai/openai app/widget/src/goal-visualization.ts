export type GoalVisualization = {
  goalId: string;
  title: string;
  description?: string;
  imageUrl: string;
  altText: string;
  cockpitUrl: string;
};

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
