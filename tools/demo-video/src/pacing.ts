import type { ScheduledNarrationAudio, VideoHoldPoint } from "./media.js";

export interface AnchoredNarrationAudio {
  id: string;
  filePath: string;
  anchorMs: number;
  durationMs: number;
}

export interface NarrationPacingPlan {
  audio: ScheduledNarrationAudio[];
  holds: VideoHoldPoint[];
  pacedVideoDurationMs: number;
}

export interface NarrationPacingOptions {
  sourceVideoDurationMs: number;
  minimumGapMs: number;
  tailPaddingMs?: number;
  maxSingleHoldMs?: number;
}

/**
 * Keeps narration attached to its recorded browser event by inserting a
 * freeze immediately after that event when the original interval is too
 * short. Later event anchors shift by the accumulated holds.
 */
export function createNarrationPacingPlan(
  sources: readonly AnchoredNarrationAudio[],
  options: NarrationPacingOptions,
): NarrationPacingPlan {
  const tailPaddingMs = options.tailPaddingMs ?? 500;
  const maxSingleHoldMs = options.maxSingleHoldMs ?? 30_000;
  requireNonNegativeInteger(options.sourceVideoDurationMs, "sourceVideoDurationMs");
  requireNonNegativeInteger(options.minimumGapMs, "minimumGapMs");
  requireNonNegativeInteger(tailPaddingMs, "tailPaddingMs");
  requireNonNegativeInteger(maxSingleHoldMs, "maxSingleHoldMs");

  let previousAnchor = -1;
  let accumulatedHoldMs = 0;
  const audio: ScheduledNarrationAudio[] = [];
  const holds: VideoHoldPoint[] = [];

  sources.forEach((source, index) => {
    requireNonNegativeInteger(source.anchorMs, `anchorMs for ${source.id}`);
    requirePositiveInteger(source.durationMs, `durationMs for ${source.id}`);
    if (source.anchorMs < previousAnchor) {
      throw new Error("Narration anchors must be ordered by recorded time");
    }
    if (source.anchorMs > options.sourceVideoDurationMs) {
      throw new Error(`Narration anchor ${source.id} is outside the recorded video`);
    }
    previousAnchor = source.anchorMs;

    const next = sources[index + 1];
    const nextAnchor = next?.anchorMs ?? options.sourceVideoDurationMs;
    const requiredIntervalMs = source.durationMs + (next ? options.minimumGapMs : tailPaddingMs);
    const recordedIntervalMs = Math.max(0, nextAnchor - source.anchorMs);
    const holdDurationMs = Math.max(0, requiredIntervalMs - recordedIntervalMs);
    if (holdDurationMs > maxSingleHoldMs) {
      throw new Error(
        `Narration segment ${source.id} needs a ${holdDurationMs} ms visual hold, exceeding the ${maxSingleHoldMs} ms quality limit`,
      );
    }

    const startMs = source.anchorMs + accumulatedHoldMs;
    audio.push({
      id: source.id,
      filePath: source.filePath,
      startMs,
      durationMs: source.durationMs,
      endMs: startMs + source.durationMs,
    });
    if (holdDurationMs > 0) {
      const holdAtMs = nextAnchor;
      const previous = holds.at(-1);
      if (previous?.atMs === holdAtMs) {
        const mergedDurationMs = previous.durationMs + holdDurationMs;
        if (mergedDurationMs > maxSingleHoldMs) {
          throw new Error(
            `Narration at ${holdAtMs} ms needs a combined ${mergedDurationMs} ms visual hold, exceeding the ${maxSingleHoldMs} ms quality limit`,
          );
        }
        previous.durationMs = mergedDurationMs;
      } else {
        holds.push({ atMs: holdAtMs, durationMs: holdDurationMs });
      }
      accumulatedHoldMs += holdDurationMs;
    }
  });

  return {
    audio,
    holds,
    pacedVideoDurationMs: options.sourceVideoDurationMs + accumulatedHoldMs,
  };
}

export function shiftRecordedTimestamp(atMs: number, holds: readonly VideoHoldPoint[]): number {
  requireNonNegativeInteger(atMs, "recorded timestamp");
  return atMs + holds.reduce(
    (total, hold) => total + (hold.atMs <= atMs ? hold.durationMs : 0),
    0,
  );
}

function requireNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
}

function requirePositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive integer`);
  }
}
