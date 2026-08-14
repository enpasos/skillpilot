import assert from "node:assert/strict";
import { test } from "node:test";

import { createNarrationPacingPlan, shiftRecordedTimestamp } from "../src/pacing.js";

test("adds only the visual holds needed to keep narration before the next event", () => {
  const plan = createNarrationPacingPlan([
    { id: "one", filePath: "one.wav", anchorMs: 1_000, durationMs: 3_000 },
    { id: "two", filePath: "two.wav", anchorMs: 3_000, durationMs: 2_000 },
  ], {
    sourceVideoDurationMs: 5_000,
    minimumGapMs: 250,
    tailPaddingMs: 500,
  });

  assert.deepEqual(plan.holds, [
    { atMs: 3_000, durationMs: 1_250 },
    { atMs: 5_000, durationMs: 500 },
  ]);
  assert.deepEqual(plan.audio.map(({ id, startMs, endMs }) => ({ id, startMs, endMs })), [
    { id: "one", startMs: 1_000, endMs: 4_000 },
    { id: "two", startMs: 4_250, endMs: 6_250 },
  ]);
  assert.equal(plan.pacedVideoDurationMs, 6_750);
  assert.equal(shiftRecordedTimestamp(3_000, plan.holds), 4_250);
});

test("merges holds for narration segments sharing one recorded anchor", () => {
  const plan = createNarrationPacingPlan([
    { id: "one", filePath: "one.wav", anchorMs: 500, durationMs: 800 },
    { id: "two", filePath: "two.wav", anchorMs: 500, durationMs: 900 },
  ], {
    sourceVideoDurationMs: 2_000,
    minimumGapMs: 100,
  });

  assert.deepEqual(plan.holds, [{ atMs: 500, durationMs: 900 }]);
  assert.equal(plan.audio[1]!.startMs, 1_400);
});

test("fails instead of silently producing an excessive frozen shot", () => {
  assert.throws(() => createNarrationPacingPlan([
    { id: "too-long", filePath: "voice.wav", anchorMs: 0, durationMs: 40_000 },
  ], {
    sourceVideoDurationMs: 1_000,
    minimumGapMs: 0,
    maxSingleHoldMs: 5_000,
  }), /quality limit/u);
});

test("applies the quality limit after merging narration at one anchor", () => {
  assert.throws(() => createNarrationPacingPlan([
    { id: "one", filePath: "one.wav", anchorMs: 500, durationMs: 20_000 },
    { id: "two", filePath: "two.wav", anchorMs: 500, durationMs: 20_000 },
    { id: "three", filePath: "three.wav", anchorMs: 500, durationMs: 20_000 },
  ], {
    sourceVideoDurationMs: 2_000,
    minimumGapMs: 0,
    maxSingleHoldMs: 30_000,
  }), /combined .* quality limit/u);
});
