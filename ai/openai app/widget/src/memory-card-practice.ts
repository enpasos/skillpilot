import type { MemoryCardRating } from "./memory-card-practice-contract";

export type MemoryCardPracticeCard = {
  id: string;
  front: string;
  back: string;
  category?: string;
  reviewCapability: string;
};

export type MemoryCardPracticeProgress = {
  due: number;
  scheduled: number;
  total: number;
};

export type MemoryCardPracticeBatch = {
  cards: MemoryCardPracticeCard[];
  initialIndex: number;
  totalDueCards: number;
  hasMore: boolean;
};

export type MemoryCardPractice = {
  communicationLocale: "de" | "en";
  learningSessionId: string;
  goalId: string;
  goalTitle: string;
  expectedStateVersion: number;
  progress: MemoryCardPracticeProgress;
  cockpitUrl?: string;
  completed: boolean;
  cardBatch: MemoryCardPracticeBatch;
};

export type MemoryCardPracticeReceipt = {
  status: string;
  goalId: string;
  goalTitle: string;
  expectedStateVersion: number;
  progress: MemoryCardPracticeProgress;
  completed: boolean;
};

export type MemoryCardStartArguments = {
  learningSessionId: string;
  goalId: string;
  expectedStateVersion: number;
};

export type MemoryCardReviewArguments = {
  learningSessionId: string;
  goalId: string;
  cardId: string;
  reviewCapability: string;
  rating: MemoryCardRating;
  expectedStateVersion: number;
  clientRequestId: string;
};

/**
 * Parse the public REVIEW receipt. Unlike START, REVIEW intentionally carries
 * no private card batch, and an idempotent coordinator replay may omit `_meta`
 * altogether. The receipt and its fresh stateVersion therefore come only from
 * model-visible structuredContent.
 */
export function memoryCardReviewReceiptFromToolResult(
  value: unknown
): MemoryCardPracticeReceipt | undefined {
  for (const candidate of structuredContentCandidates(value)) {
    const expectedStateVersion = nonNegativeInteger(candidate.stateVersion);
    const status = boundedText(candidate.status, 100);
    const goalId = boundedText(candidate.goalId, 300);
    const goalTitle = boundedText(candidate.goalTitle, 1_000);
    const progressRecord = record(candidate.progress);
    const total = nonNegativeInteger(progressRecord?.totalCards);
    const due = nonNegativeInteger(progressRecord?.dueCards);
    const scheduled = nonNegativeInteger(progressRecord?.scheduledCards);
    const completed = candidate.completed;
    if (
      expectedStateVersion === undefined ||
      !status ||
      !goalId ||
      !goalTitle ||
      total === undefined ||
      due === undefined ||
      scheduled === undefined ||
      due > total ||
      scheduled > total ||
      typeof completed !== "boolean"
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
 * Read the private widget projection from a complete MCP result or from the
 * ChatGPT toolResponseMetadata compatibility snapshot.
 *
 * Card contents deliberately never fall back to structuredContent. That field
 * is model-visible; the practice card lives exclusively in result `_meta`.
 */
export function memoryCardPracticeFromToolResult(
  value: unknown,
  options: {
    stateVersionSource?: unknown;
    allowMetadataStateVersion?: boolean;
  } = {}
): MemoryCardPractice | undefined {
  const authoritativeStateVersion =
    stateVersionFromToolOutput(options.stateVersionSource) ??
    stateVersionFromToolOutput(value);
  if (
    authoritativeStateVersion === undefined &&
    options.allowMetadataStateVersion === false
  ) {
    return undefined;
  }
  for (const metadata of metadataCandidates(value)) {
    const metadataStateVersion = options.allowMetadataStateVersion === false
      ? undefined
      : nonNegativeInteger(record(metadata.skillpilotMemoryCard)?.expectedStateVersion);
    const practice = memoryCardPracticeFromMetadata(
      metadata,
      authoritativeStateVersion ?? metadataStateVersion
    );
    if (practice) return practice;
  }
  return undefined;
}

export function memoryCardPracticeFromMetadata(
  value: unknown,
  stateVersion?: number
): MemoryCardPractice | undefined {
  const metadata = record(value);
  const candidate = record(metadata?.skillpilotMemoryCard);
  if (!candidate) return undefined;

  const communicationLocale = locale(candidate.communicationLocale);
  const learningSessionId = learningSession(candidate.learningSessionId);
  const goalId = boundedText(candidate.goalId, 300);
  const goalTitle = boundedText(candidate.goalTitle, 1_000);
  const expectedStateVersion = stateVersion ?? nonNegativeInteger(candidate.expectedStateVersion);
  const progressRecord = record(candidate.progress);
  const due = nonNegativeInteger(progressRecord?.due);
  const scheduled = nonNegativeInteger(progressRecord?.scheduled);
  const total = nonNegativeInteger(progressRecord?.total);
  const cockpitUrl = safeHttpsUrl(candidate.cockpitUrl);
  const explicitlyCompleted = candidate.completed;
  const cardBatch = memoryCardBatch(candidate.cardBatch);

  if (
    !communicationLocale ||
    !learningSessionId ||
    !goalId ||
    !goalTitle ||
    expectedStateVersion === undefined ||
    due === undefined ||
    scheduled === undefined ||
    total === undefined ||
    !cardBatch ||
    due > total ||
    scheduled > total ||
    cardBatch.totalDueCards !== due ||
    (explicitlyCompleted !== undefined && typeof explicitlyCompleted !== "boolean")
  ) {
    return undefined;
  }

  const completed = explicitlyCompleted === true || due === 0;
  if (completed && cardBatch.cards.length > 0) return undefined;
  if (!completed && cardBatch.cards.length === 0) return undefined;

  return {
    communicationLocale,
    learningSessionId,
    goalId,
    goalTitle,
    expectedStateVersion,
    progress: { due, scheduled, total },
    completed,
    cardBatch,
    ...(cockpitUrl ? { cockpitUrl } : {}),
  };
}

/**
 * State version is the sole piece read from model-visible tool output. The
 * coordinator advances it around writes, so a review response's
 * structuredContent is newer than the hidden projection prepared during the
 * operation. No card text is ever inspected here.
 */
export function stateVersionFromToolOutput(value: unknown): number | undefined {
  const queue: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const seen = new Set<object>();
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const candidate = record(next.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const direct = nonNegativeInteger(candidate.stateVersion);
    if (direct !== undefined) return direct;
    const structured = record(candidate.structuredContent);
    const structuredVersion = nonNegativeInteger(structured?.stateVersion);
    if (structuredVersion !== undefined) return structuredVersion;
    if (next.depth >= 3) continue;
    for (const key of [
      "toolResponseMetadata",
      "mcp_tool_result",
      "call_tool_result",
      "toolResult",
      "result"
    ]) {
      if (candidate[key] !== undefined) {
        queue.push({ value: candidate[key], depth: next.depth + 1 });
      }
    }
  }
  return undefined;
}

export function createMemoryCardReviewArguments(
  practice: MemoryCardPractice,
  card: MemoryCardPracticeCard,
  rating: MemoryCardRating,
  clientRequestId: string
): MemoryCardReviewArguments | undefined {
  const requestId = boundedText(clientRequestId, 200);
  if (!requestId || !practice.cardBatch.cards.some((candidate) => candidate.id === card.id)) {
    return undefined;
  }
  return {
    learningSessionId: practice.learningSessionId,
    goalId: practice.goalId,
    cardId: card.id,
    reviewCapability: card.reviewCapability,
    rating,
    expectedStateVersion: practice.expectedStateVersion,
    clientRequestId: requestId
  };
}

export function createMemoryCardStartArguments(
  practice: MemoryCardPractice
): MemoryCardStartArguments {
  return {
    learningSessionId: practice.learningSessionId,
    goalId: practice.goalId,
    expectedStateVersion: practice.expectedStateVersion
  };
}

function learningSession(value: unknown): string | undefined {
  const candidate = boundedText(value, 100);
  return candidate && /^sps_[A-Za-z0-9_-]{43}$/.test(candidate)
    ? candidate
    : undefined;
}

function opaqueReviewCapability(value: unknown): string | undefined {
  const candidate = boundedText(value, 100);
  return candidate && /^[A-Za-z0-9_-]{43}$/.test(candidate)
    ? candidate
    : undefined;
}

/** A tiny single-flight gate makes double clicks harmless and testable. */
export class MemoryCardSubmissionGate {
  private generation = 0;
  private activeGeneration: number | undefined;

  begin(): number | undefined {
    if (this.activeGeneration !== undefined) return undefined;
    this.generation += 1;
    this.activeGeneration = this.generation;
    return this.activeGeneration;
  }

  isCurrent(generation: number): boolean {
    return this.activeGeneration === generation;
  }

  finish(generation: number): void {
    if (this.activeGeneration === generation) this.activeGeneration = undefined;
  }
}

function metadataCandidates(value: unknown): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  const queue: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const seen = new Set<object>();

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const candidate = record(next.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const directMetadata = record(candidate._meta);
    if (directMetadata) result.push(directMetadata);
    if (candidate.skillpilotMemoryCard !== undefined) result.push(candidate);
    if (next.depth >= 3) continue;

    // Known compatibility wrappers only. Never traverse structuredContent:
    // private card data must not be recovered from model-visible output.
    for (const key of [
      "toolResponseMetadata",
      "mcp_tool_result",
      "call_tool_result",
      "toolResult",
      "result"
    ]) {
      if (candidate[key] !== undefined) {
        queue.push({ value: candidate[key], depth: next.depth + 1 });
      }
    }
  }
  return result;
}

function structuredContentCandidates(value: unknown): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  const queue: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  const seen = new Set<object>();

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const candidate = record(next.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const structured = record(candidate.structuredContent);
    if (structured) result.push(structured);
    if (next.depth >= 3) continue;
    for (const key of [
      "toolResponseMetadata",
      "mcp_tool_result",
      "call_tool_result",
      "toolResult",
      "result"
    ]) {
      if (candidate[key] !== undefined) {
        queue.push({ value: candidate[key], depth: next.depth + 1 });
      }
    }
  }
  return result;
}

function memoryCard(value: unknown): MemoryCardPracticeCard | undefined {
  if (value === undefined || value === null) return undefined;
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

function memoryCardBatch(value: unknown): MemoryCardPracticeBatch | undefined {
  const candidate = record(value);
  if (!candidate || !Array.isArray(candidate.cards) || candidate.cards.length > 20) {
    return undefined;
  }
  const cards: MemoryCardPracticeCard[] = [];
  const cardIds = new Set<string>();
  for (const rawCard of candidate.cards) {
    const card = memoryCard(rawCard);
    if (!card || cardIds.has(card.id)) return undefined;
    cards.push(card);
    cardIds.add(card.id);
  }

  const initialIndex = nonNegativeInteger(candidate.initialIndex);
  const totalDueCards = nonNegativeInteger(candidate.totalDueCards);
  const hasMore = candidate.hasMore;
  if (
    initialIndex === undefined ||
    totalDueCards === undefined ||
    typeof hasMore !== "boolean" ||
    totalDueCards < cards.length ||
    hasMore !== (totalDueCards > cards.length) ||
    (cards.length === 0 ? initialIndex !== 0 : initialIndex >= cards.length)
  ) {
    return undefined;
  }
  return { cards, initialIndex, totalDueCards, hasMore };
}

function locale(value: unknown): "de" | "en" | undefined {
  const text = boundedText(value, 30)?.toLowerCase();
  if (text === "de" || text?.startsWith("de-")) return "de";
  if (text === "en" || text?.startsWith("en-")) return "en";
  return undefined;
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

function nonNegativeInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
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
