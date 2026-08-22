export function goalVisualizationFromStructuredContent(value) {
  const candidate = record(record(value)?.goalVisualization);
  if (!candidate) return undefined;

  const goalId = boundedText(candidate.goalId, 300);
  const title = boundedText(candidate.title, 1_000);
  const description = optionalBoundedText(candidate.description, 4_000);
  const imageUrl = safeSkillPilotUrl(candidate.imageUrl);
  const altText = boundedText(candidate.altText, 1_000);
  const cockpitUrl = safeSkillPilotUrl(candidate.cockpitUrl);
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

export function retainGoalVisualization(current, structuredContent) {
  const next = goalVisualizationFromStructuredContent(structuredContent);
  if (!next) return current;
  return sameVisualization(current, next) ? current : next;
}

function sameVisualization(left, right) {
  return left?.goalId === right.goalId
    && left.title === right.title
    && left.description === right.description
    && left.imageUrl === right.imageUrl
    && left.altText === right.altText
    && left.cockpitUrl === right.cockpitUrl;
}

function safeSkillPilotUrl(value) {
  const text = boundedText(value, 2_000);
  if (!text) return undefined;
  try {
    const url = new URL(text);
    if (
      url.protocol !== "https:"
      || url.origin !== "https://skillpilot.com"
      || url.username
      || url.password
    ) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : undefined;
}

function boundedText(value, maxLength) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : undefined;
}

function optionalBoundedText(value, maxLength) {
  if (value === undefined || value === null || value === "") return undefined;
  return boundedText(value, maxLength);
}
