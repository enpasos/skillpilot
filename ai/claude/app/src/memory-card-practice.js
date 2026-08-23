import { isMemoryCardRating } from "./memory-card-practice-contract.js";

/**
 * Parse the bounded, model-visible receipt of an app-only review call.
 * Private card data is neither expected nor read here.
 */
export function memoryCardReviewReceiptFromToolResult(value) {
  for (const candidate of structuredContentCandidates(value)) {
    const expectedStateVersion = nonNegativeInteger(candidate.stateVersion);
    const status = boundedText(candidate.status, 100);
    const goalId = boundedText(candidate.goalId, 300);
    const goalTitle = boundedText(candidate.goalTitle, 1_000);
    const progress = record(candidate.progress);
    const total = nonNegativeInteger(progress?.totalCards);
    const due = nonNegativeInteger(progress?.dueCards);
    const scheduled = nonNegativeInteger(progress?.scheduledCards);
    const completed = candidate.completed;
    if (
      expectedStateVersion === undefined
      || !status
      || !goalId
      || !goalTitle
      || total === undefined
      || due === undefined
      || scheduled === undefined
      || due > total
      || scheduled > total
      || typeof completed !== "boolean"
    ) {
      continue;
    }
    return {
      status,
      goalId,
      goalTitle,
      expectedStateVersion,
      progress: { total, due, scheduled },
      completed
    };
  }
  return undefined;
}

/**
 * Read card content only from result `_meta.skillpilotMemoryCard`.
 * Known transport wrappers are traversed, but `structuredContent` is never
 * traversed for private data.
 */
export function memoryCardPracticeFromToolResult(
  value,
  { stateVersionSource, allowMetadataStateVersion = true } = {}
) {
  const privateLearningSessionId = learningSessionIdFromToolResult(value);
  if (!privateLearningSessionId) return undefined;

  const authoritativeStateVersion = stateVersionFromToolOutput(stateVersionSource)
    ?? stateVersionFromToolOutput(value);
  if (authoritativeStateVersion === undefined && !allowMetadataStateVersion) {
    return undefined;
  }

  for (const metadata of metadataCandidates(value)) {
    const metadataStateVersion = allowMetadataStateVersion
      ? nonNegativeInteger(record(metadata.skillpilotMemoryCard)?.expectedStateVersion)
      : undefined;
    const practice = memoryCardPracticeFromMetadata(
      metadata,
      authoritativeStateVersion ?? metadataStateVersion
    );
    if (practice?.learningSessionId === privateLearningSessionId) return practice;
  }
  return undefined;
}

export function memoryCardPracticeFromMetadata(value, stateVersion) {
  const candidate = record(record(value)?.skillpilotMemoryCard);
  if (!candidate) return undefined;

  const learningSessionId = opaqueLearningSessionId(candidate.learningSessionId);
  const communicationLocale = locale(candidate.communicationLocale);
  const goalId = boundedText(candidate.goalId, 300);
  const goalTitle = boundedText(candidate.goalTitle, 1_000);
  const expectedStateVersion = stateVersion
    ?? nonNegativeInteger(candidate.expectedStateVersion);
  const progress = record(candidate.progress);
  const due = nonNegativeInteger(progress?.due);
  const scheduled = nonNegativeInteger(progress?.scheduled);
  const total = nonNegativeInteger(progress?.total);
  const cardBatch = memoryCardBatch(candidate.cardBatch);
  const explicitCompleted = candidate.completed;

  if (
    !learningSessionId
    || !communicationLocale
    || !goalId
    || !goalTitle
    || expectedStateVersion === undefined
    || due === undefined
    || scheduled === undefined
    || total === undefined
    || due > total
    || scheduled > total
    || !cardBatch
    || cardBatch.totalDueCards !== due
    || (explicitCompleted !== undefined && typeof explicitCompleted !== "boolean")
  ) {
    return undefined;
  }

  const completed = explicitCompleted === true || due === 0;
  if (completed !== (cardBatch.cards.length === 0)) return undefined;

  return {
    learningSessionId,
    communicationLocale,
    goalId,
    goalTitle,
    expectedStateVersion,
    progress: { due, scheduled, total },
    completed,
    cardBatch
  };
}

export function stateVersionFromToolOutput(value) {
  const queue = [{ value, depth: 0 }];
  const seen = new Set();
  while (queue.length > 0) {
    const next = queue.shift();
    const candidate = record(next?.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const direct = nonNegativeInteger(candidate.stateVersion);
    if (direct !== undefined) return direct;
    const structured = record(candidate.structuredContent);
    const structuredVersion = nonNegativeInteger(structured?.stateVersion);
    if (structuredVersion !== undefined) return structuredVersion;
    if (next.depth >= 3) continue;
    enqueueKnownWrappers(queue, candidate, next.depth);
  }
  return undefined;
}

export function createMemoryCardReviewArguments(
  practice,
  card,
  rating,
  clientRequestId
) {
  const requestId = boundedText(clientRequestId, 200);
  if (
    !requestId
    || !isMemoryCardRating(rating)
    || !practice.cardBatch.cards.some((candidate) => candidate.id === card.id)
  ) {
    return undefined;
  }
  return {
    learningSessionId: practice.learningSessionId,
    goalId: practice.goalId,
    cardId: card.id,
    reviewCapability: card.reviewCapability,
    rating,
    expectedStateVersion: practice.expectedStateVersion,
    clientRequestId: requestId,
    language: practice.communicationLocale
  };
}

export function createMemoryCardStartArguments(practice) {
  return {
    learningSessionId: practice.learningSessionId,
    goalId: practice.goalId,
    expectedStateVersion: practice.expectedStateVersion,
    language: practice.communicationLocale
  };
}

/**
 * Read the short-lived learner session only from private result metadata.
 * This is used to bind component-local follow-up calls to the same learner
 * session without copying the value into model-visible content or the DOM.
 */
export function learningSessionIdFromToolResult(value) {
  const sessions = new Set();
  let invalid = false;
  for (const metadata of metadataCandidates(value)) {
    const privatePractice = record(metadata.skillpilotMemoryCard);
    if (!privatePractice || privatePractice.learningSessionId === undefined) continue;
    const session = opaqueLearningSessionId(privatePractice.learningSessionId);
    if (!session) invalid = true;
    else sessions.add(session);
  }
  return !invalid && sessions.size === 1 ? [...sessions][0] : undefined;
}

export class MemoryCardSubmissionGate {
  #generation = 0;
  #activeGeneration;

  begin() {
    if (this.#activeGeneration !== undefined) return undefined;
    this.#generation += 1;
    this.#activeGeneration = this.#generation;
    return this.#activeGeneration;
  }

  isCurrent(generation) {
    return this.#activeGeneration === generation;
  }

  finish(generation) {
    if (this.#activeGeneration === generation) this.#activeGeneration = undefined;
  }
}

function metadataCandidates(value) {
  const result = [];
  const queue = [{ value, depth: 0 }];
  const seen = new Set();
  while (queue.length > 0) {
    const next = queue.shift();
    const candidate = record(next?.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const directMetadata = record(candidate._meta);
    if (directMetadata) result.push(directMetadata);
    if (candidate.skillpilotMemoryCard !== undefined) result.push(candidate);
    if (next.depth >= 3) continue;
    enqueueKnownWrappers(queue, candidate, next.depth);
  }
  return result;
}

function structuredContentCandidates(value) {
  const result = [];
  const queue = [{ value, depth: 0 }];
  const seen = new Set();
  while (queue.length > 0) {
    const next = queue.shift();
    const candidate = record(next?.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const structured = record(candidate.structuredContent);
    if (structured) result.push(structured);
    if (next.depth >= 3) continue;
    enqueueKnownWrappers(queue, candidate, next.depth);
  }
  return result;
}

function enqueueKnownWrappers(queue, candidate, depth) {
  for (const key of ["mcp_tool_result", "call_tool_result", "toolResult", "result"]) {
    if (candidate[key] !== undefined) {
      queue.push({ value: candidate[key], depth: depth + 1 });
    }
  }
}

function memoryCardBatch(value) {
  const candidate = record(value);
  if (!candidate || !Array.isArray(candidate.cards) || candidate.cards.length > 20) {
    return undefined;
  }

  const cards = [];
  const ids = new Set();
  for (const value of candidate.cards) {
    const card = memoryCard(value);
    if (!card || ids.has(card.id)) return undefined;
    ids.add(card.id);
    cards.push(card);
  }

  const totalDueCards = nonNegativeInteger(candidate.totalDueCards);
  if (
    totalDueCards === undefined
    || totalDueCards < cards.length
  ) {
    return undefined;
  }
  return {
    cards,
    totalDueCards,
    hasMore: totalDueCards > cards.length
  };
}

function memoryCard(value) {
  const candidate = record(value);
  const id = boundedText(candidate?.id, 300);
  const front = boundedText(candidate?.front, 20_000);
  const back = boundedText(candidate?.back, 20_000);
  const category = optionalBoundedText(candidate?.category, 500);
  const reviewCapability = opaqueReviewCapability(candidate?.reviewCapability);
  if (!id || !front || !back || !reviewCapability) return undefined;
  return {
    id,
    front,
    back,
    reviewCapability,
    ...(category ? { category } : {})
  };
}

function opaqueReviewCapability(value) {
  const candidate = boundedText(value, 16_384);
  return candidate && /^[A-Za-z0-9_-]+$/.test(candidate)
    ? candidate
    : undefined;
}

function opaqueLearningSessionId(value) {
  const candidate = boundedText(value, 47);
  return candidate && /^spc_[A-Za-z0-9_-]{43}$/.test(candidate)
    ? candidate
    : undefined;
}

function locale(value) {
  const text = boundedText(value, 30)?.toLowerCase();
  if (text === "de" || text?.startsWith("de-")) return "de";
  if (text === "en" || text?.startsWith("en-")) return "en";
  return undefined;
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

function nonNegativeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}
