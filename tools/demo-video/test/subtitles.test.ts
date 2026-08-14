import assert from "node:assert/strict";
import test from "node:test";

import {
  createSubtitleCues,
  formatSrtTimestamp,
  renderSrt,
  wrapSubtitleText,
} from "../src/subtitles.js";

test("formats SubRip timestamps without losing millisecond precision", () => {
  assert.equal(formatSrtTimestamp(0), "00:00:00,000");
  assert.equal(formatSrtTimestamp(3_723_045), "01:02:03,045");
});

test("wraps and times narration as bounded two-line cues", () => {
  const cues = createSubtitleCues(
    [
      {
        id: "intro",
        text: "This generated walkthrough explains each visible action without exposing private credentials or session capabilities.",
        startMs: 1_000,
        endMs: 7_000,
      },
    ],
    { maxCharactersPerLine: 24, maxLinesPerCue: 2 },
  );

  assert.ok(cues.length >= 2);
  const firstCue = cues[0];
  assert.ok(firstCue);
  assert.equal(firstCue.index, 1);
  assert.equal(firstCue.sourceId, "intro");
  assert.equal(firstCue.startMs, 1_000);
  assert.equal(cues.at(-1)?.endMs, 7_000);
  assert.ok(cues.every((cue) => cue.text.split("\n").length <= 2));
  assert.ok(
    cues.every((cue) =>
      cue.text.split("\n").every((line) => Array.from(line).length <= 24),
    ),
  );
  for (let index = 1; index < cues.length; index += 1) {
    assert.equal(cues[index]!.startMs, cues[index - 1]!.endMs);
  }
});

test("sanitizes subtitle formatting and emits valid sequential SRT blocks", () => {
  const cues = createSubtitleCues([
    {
      text: "Use <b>visible</b> {\\an8} text.",
      startMs: 250,
      endMs: 2_000,
    },
  ]);
  const srt = renderSrt(cues);

  assert.match(srt, /^1\n00:00:00,250 --> 00:00:02,000\n/u);
  assert.doesNotMatch(srt, /<b>|\{\\an8\}/u);
  assert.ok(srt.endsWith("\n"));
});

test("rejects overlapping narration instead of stacking captions", () => {
  assert.throws(
    () =>
      createSubtitleCues([
        { text: "One", startMs: 0, endMs: 1_000 },
        { text: "Two", startMs: 900, endMs: 1_500 },
      ]),
    /must not overlap/u,
  );
});

test("splits a single oversized token deterministically", () => {
  assert.deepEqual(wrapSubtitleText("abcdefghijkl", 5), ["abcde", "fghij", "kl"]);
});

test("keeps every cue positive even when the available duration is tiny", () => {
  const cues = createSubtitleCues(
    [{ text: "abcdefghij k l", startMs: 0, endMs: 3 }],
    {
      maxCharactersPerLine: 5,
      maxLinesPerCue: 1,
      minimumCueDurationMs: 850,
    },
  );
  assert.equal(cues.length, 3);
  assert.deepEqual(
    cues.map((cue) => cue.endMs - cue.startMs),
    [1, 1, 1],
  );
});
