import { renderedVideoHolds, validateRecordedFocusRegions, type VideoHoldPoint, type VideoRecordedFocusRegion } from "./media.js";
import { shiftRecordedTimestamp } from "./pacing.js";
import type { DemoScenario, RecordingResult } from "./types.js";

/** Explicit provenance for camera framing; raw video and evidence remain intact. */
export interface RecordedFocusRegion extends VideoRecordedFocusRegion {
  chapterId: string;
  fromStepId: string;
  toStepId: string;
  sourceStartMs: number;
  sourceEndMs: number;
  leadMs: number;
  fit: "contain";
  paddingColor: "white";
  speed: 1;
}

export function resolveRecordedFocusRegions(
  scenario: Pick<DemoScenario, "chapters" | "browser" | "render">,
  recording: Pick<RecordingResult, "timeline" | "durationMs">,
  holds: readonly VideoHoldPoint[],
): RecordedFocusRegion[] {
  if (!scenario.chapters.some((chapter) => chapter.recordedFocus)) return [];
  if (scenario.render.autoZoom.enabled) throw new Error("Recorded focus and automatic click zoom cannot be combined");
  const renderedHolds = renderedVideoHolds(holds, recording.durationMs, scenario.render.fps);
  const regions: RecordedFocusRegion[] = [];
  for (const chapter of scenario.chapters) {
    const focus = chapter.recordedFocus;
    if (!focus) continue;
    const leadMs = focus.leadMs ?? 0;
    if (!Number.isSafeInteger(leadMs) || leadMs < 0 || leadMs > 1000) {
      throw new RangeError("Recorded focus leadMs must be an integer between 0 and 1000");
    }
    const authoredFrom = chapter.steps.findIndex((step) => step.id === focus.fromStepId);
    const authoredTo = chapter.steps.findIndex((step) => step.id === focus.toStepId);
    const fromIndexes = recording.timeline.flatMap((event, index) => event.stepId === focus.fromStepId ? [index] : []);
    const toIndexes = recording.timeline.flatMap((event, index) => event.stepId === focus.toStepId ? [index] : []);
    if (authoredFrom < 0 || authoredTo < authoredFrom || fromIndexes.length !== 1 || toIndexes.length !== 1
      || fromIndexes[0]! > toIndexes[0]!) {
      throw new Error(`Recorded focus ${chapter.id} needs unique ordered recorded steps from its chapter`);
    }
    const events = recording.timeline.slice(fromIndexes[0], toIndexes[0]! + 1);
    let previousEndMs = -1;
    for (const event of events) {
      if (event.chapterId !== chapter.id || !Number.isSafeInteger(event.startedAtMs)
        || !Number.isSafeInteger(event.endedAtMs) || event.startedAtMs < 0
        || event.endedAtMs < event.startedAtMs || event.startedAtMs < previousEndMs) {
        throw new Error(`Recorded focus ${chapter.id} has an invalid or cross-chapter recorded interval`);
      }
      previousEndMs = event.endedAtMs;
    }
    const sourceStartMs = Math.max(0, events[0]!.startedAtMs - leadMs);
    const sourceEndMs = events.at(-1)!.endedAtMs;
    if (sourceEndMs <= sourceStartMs || sourceEndMs > recording.durationMs) {
      throw new RangeError(`Recorded focus ${chapter.id} must stay inside the source recording`);
    }
    regions.push({
      chapterId: chapter.id,
      fromStepId: focus.fromStepId,
      toStepId: focus.toStepId,
      sourceStartMs,
      sourceEndMs,
      startMs: shiftRecordedTimestamp(sourceStartMs, renderedHolds),
      endMs: shiftRecordedTimestamp(sourceEndMs, renderedHolds),
      x: focus.x,
      y: focus.y,
      width: focus.width,
      height: focus.height,
      sourceWidth: scenario.browser.video.width,
      sourceHeight: scenario.browser.video.height,
      leadMs,
      fit: "contain",
      paddingColor: "white",
      speed: 1,
    });
  }
  const durationMs = recording.durationMs + renderedHolds.reduce((sum, hold) => sum + hold.durationMs, 0);
  validateRecordedFocusRegions(regions, durationMs);
  return regions;
}
