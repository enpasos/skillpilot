import assert from "node:assert/strict";
import test from "node:test";
import { scenarioSchema } from "../src/schema.js";
import { resolveRecordedFocusRegions } from "../src/recorded-focus.js";
import type { DemoScenario, RecordedFocusConfig, TimelineEvent } from "../src/types.js";

const focus: RecordedFocusConfig = {
  fromStepId: "open", toStepId: "read", x: 296, y: 258, width: 688, height: 302, leadMs: 300,
};
function scenario(recordedFocus: unknown = focus): DemoScenario {
  return scenarioSchema.parse({
    schemaVersion: 1, id: "camera-test", title: "Camera test", sourceRevision: "test",
    browser: { video: { width: 1280, height: 720 } },
    chapters: [{ id: "curriculum", title: "Curriculum", recordedFocus,
      steps: [{ id: "open", action: "wait", label: "Open", durationMs: 1000 },
        { id: "read", action: "wait", label: "Read", durationMs: 1000 }] }],
  }) as DemoScenario;
}
const event: TimelineEvent = {
  chapterId: "curriculum", chapterTitle: "Curriculum", stepId: "open", action: "wait", label: "Open",
  startedAtMs: 2000, endedAtMs: 3000, evidence: [], secretInput: false,
};
const timeline: TimelineEvent[] = [event, { ...event, stepId: "read", startedAtMs: 3000, endedAtMs: 5000 }];

test("camera framing schema is explicit, bounded and confined to ordered chapter steps", () => {
  assert.deepEqual(scenario().chapters[0]!.recordedFocus, focus);
  const { leadMs: _lead, ...withoutLead } = focus;
  assert.equal(scenario(withoutLead).chapters[0]!.recordedFocus?.leadMs, 0);
  for (const invalid of [
    { x: -1 }, { width: 0 }, { width: 1000 }, { height: 600 }, { leadMs: 1001 }, { leadMs: 0.5 },
    { fromStepId: "foreign" }, { toStepId: "foreign" }, { fromStepId: "read", toStepId: "open" },
    { undocumented: "overlay" },
  ]) assert.throws(() => scenario({ ...focus, ...invalid }));
  const withZoom = scenario();
  withZoom.render.autoZoom.enabled = true;
  assert.throws(() => scenarioSchema.parse(withZoom), /cannot be combined/u);
});

test("camera framing maps the lead and full interval through actual renderer holds without editing source evidence", () => {
  const original = JSON.stringify(timeline);
  // The first nominal hold is after sourceStart 1700, but its renderer split is
  // at 1650; its 500ms pause must therefore already be included at focus start.
  const regions = resolveRecordedFocusRegions(scenario(), { timeline, durationMs: 6000 }, [
    { atMs: 1750, durationMs: 500 }, { atMs: 4000, durationMs: 1500 },
  ]);
  assert.deepEqual(regions, [{
    chapterId: "curriculum", fromStepId: "open", toStepId: "read",
    sourceStartMs: 1700, sourceEndMs: 5000, startMs: 2200, endMs: 7000,
    x: 296, y: 258, width: 688, height: 302, sourceWidth: 1280, sourceHeight: 720,
    leadMs: 300, fit: "contain", paddingColor: "white", speed: 1,
  }]);
  assert.equal(JSON.stringify(timeline), original);
  const early = [{ ...event, startedAtMs: 100, endedAtMs: 200 },
    { ...event, stepId: "read", startedAtMs: 200, endedAtMs: 500 }];
  assert.equal(resolveRecordedFocusRegions(scenario(), { timeline: early, durationMs: 6000 }, [])[0]!.sourceStartMs, 0);
  const noFocus = scenario();
  delete noFocus.chapters[0]!.recordedFocus;
  assert.deepEqual(resolveRecordedFocusRegions(noFocus, { timeline, durationMs: 6000 }, []), []);
});

test("camera framing fails closed for missing, duplicate, cross-chapter, unordered or out-of-source recorded steps", () => {
  for (const invalid of [
    [event], [...timeline, event], [timeline[1]!, event],
    [event, { ...timeline[1]!, chapterId: "other" }],
    [event, { ...timeline[1]!, startedAtMs: 2500 }],
    [event, { ...timeline[1]!, endedAtMs: 6001 }],
  ]) assert.throws(() => resolveRecordedFocusRegions(scenario(), { timeline: invalid, durationMs: 6000 }, []));
  const overlapping = scenario();
  overlapping.chapters.push({ ...overlapping.chapters[0]!, id: "next",
    recordedFocus: { ...focus, fromStepId: "next-open", toStepId: "next-read" },
    steps: [{ id: "next-open", action: "wait", label: "Open", durationMs: 100 },
      { id: "next-read", action: "wait", label: "Read", durationMs: 100 }] });
  assert.throws(() => resolveRecordedFocusRegions(overlapping, { durationMs: 6000, timeline: [...timeline,
    { ...event, chapterId: "next", stepId: "next-open", startedAtMs: 5100, endedAtMs: 5200 },
    { ...event, chapterId: "next", stepId: "next-read", startedAtMs: 5200, endedAtMs: 5500 },
  ] }, []), /must not overlap/u);
});
