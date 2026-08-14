import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  invalidateRecordingCache,
  publishRecordingGeneration,
  readReusableRecording,
} from "../src/recording-cache.js";

test("publishes and reuses only a complete hash-consistent recording generation", async (t) => {
  const workDir = await mkdtemp(join(tmpdir(), "demo-video-recording-cache-"));
  t.after(() => rm(workDir, { recursive: true, force: true }));
  const temporaryDirectory = await mkdtemp(join(workDir, ".recording-"));
  const temporaryScreenshotsPath = join(temporaryDirectory, "screenshots");
  const temporaryVideoPath = join(temporaryDirectory, "recording.webm");
  await mkdir(temporaryScreenshotsPath, { mode: 0o700 });
  await writeFile(temporaryVideoPath, "video-generation-one");
  await writeFile(join(temporaryScreenshotsPath, "chapter-step.png"), "pixels-generation-one");
  const timeline = [{
    chapterId: "chapter",
    chapterTitle: "Chapter",
    stepId: "step",
    action: "screenshot" as const,
    label: "Capture",
    startedAtMs: 0,
    endedAtMs: 10,
    screenshot: join(workDir, "screenshots", "chapter-step.png"),
    evidence: [],
    secretInput: false,
  }];

  await publishRecordingGeneration(workDir, {
    temporaryDirectory,
    temporaryVideoPath,
    temporaryScreenshotsPath,
    timeline,
    durationMs: 10,
    browserVersion: "test-browser",
  });
  const reusable = await readReusableRecording(workDir);
  assert.equal(reusable?.browserVersion, "test-browser");
  assert.equal(reusable?.timeline[0]?.screenshot, join(workDir, "screenshots", "chapter-step.png"));
  assert.match(await readFile(join(workDir, "timeline.json"), "utf8"), /"screenshot": "screenshots\/chapter-step\.png"/u);
  assert.doesNotMatch(await readFile(join(workDir, "timeline.json"), "utf8"), new RegExp(workDir.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  assert.equal(await readFile(join(workDir, "recording.webm"), "utf8"), "video-generation-one");
  assert.equal(await readFile(join(workDir, "screenshots", "chapter-step.png"), "utf8"), "pixels-generation-one");

  await writeFile(join(workDir, "recording.webm"), "mixed-generation");
  assert.equal(await readReusableRecording(workDir), undefined);
});

test("rejects absolute or escaping screenshot paths in a persisted timeline", async (t) => {
  const workDir = await mkdtemp(join(tmpdir(), "demo-video-recording-cache-"));
  t.after(() => rm(workDir, { recursive: true, force: true }));
  const temporaryDirectory = await mkdtemp(join(workDir, ".recording-"));
  const temporaryScreenshotsPath = join(temporaryDirectory, "screenshots");
  const temporaryVideoPath = join(temporaryDirectory, "recording.webm");
  await mkdir(temporaryScreenshotsPath, { mode: 0o700 });
  await writeFile(temporaryVideoPath, "video");
  await writeFile(join(temporaryScreenshotsPath, "capture.png"), "pixels");
  await publishRecordingGeneration(workDir, {
    temporaryDirectory,
    temporaryVideoPath,
    temporaryScreenshotsPath,
    timeline: [{
      chapterId: "chapter",
      chapterTitle: "Chapter",
      stepId: "step",
      action: "screenshot",
      label: "Capture",
      startedAtMs: 0,
      endedAtMs: 1,
      screenshot: join(workDir, "screenshots", "capture.png"),
      evidence: [],
      secretInput: false,
    }],
    durationMs: 1,
    browserVersion: "test-browser",
  });

  const timelinePath = join(workDir, "timeline.json");
  const metadataPath = join(workDir, "recording.json");
  const timeline = JSON.parse(await readFile(timelinePath, "utf8")) as Array<Record<string, unknown>>;
  timeline[0]!.screenshot = "../capture.png";
  await writeFile(timelinePath, `${JSON.stringify(timeline)}\n`);
  const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as Record<string, unknown>;
  const { createHash } = await import("node:crypto");
  metadata.timelineSha256 = createHash("sha256").update(await readFile(timelinePath)).digest("hex");
  await writeFile(metadataPath, `${JSON.stringify(metadata)}\n`);
  assert.equal(await readReusableRecording(workDir), undefined);
});

test("invalidating the commit marker prevents partial files from being reused", async (t) => {
  const workDir = await mkdtemp(join(tmpdir(), "demo-video-recording-cache-"));
  t.after(() => rm(workDir, { recursive: true, force: true }));
  await writeFile(join(workDir, "recording.webm"), "old-video");
  await writeFile(join(workDir, "timeline.json"), "[]");
  await writeFile(join(workDir, "recording.json"), "{}");

  await invalidateRecordingCache(workDir);
  assert.equal(await readReusableRecording(workDir), undefined);
});
