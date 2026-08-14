import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildAutoZoomFilter,
  buildFfmpegRenderPlan,
  escapeFfmpegFilterPath,
  probeMediaDurationMs,
  renderVideo,
  scheduleNarrationAudio,
} from "../src/media.js";
import { runProcess } from "../src/process.js";

test("builds a smooth, bounded auto-zoom around click coordinates", () => {
  const filter = buildAutoZoomFilter(
    [
      {
        atMs: 1_000,
        x: 960,
        y: 540,
        viewportWidth: 1_920,
        viewportHeight: 1_080,
      },
    ],
    { width: 1_920, height: 1_080, fps: 30 },
    { maxScale: 1.15, durationMs: 1_200, leadInMs: 200 },
  );

  assert.match(filter ?? "", /^zoompan=/u);
  assert.match(filter ?? "", /sin\(PI\*/u);
  assert.match(filter ?? "", /max\(0,min\(iw-iw\/zoom/u);
  assert.match(filter ?? "", /s=1920x1080:fps=30$/u);
});

test("creates a shell-free H.264/AAC/faststart render plan", () => {
  const plan = buildFfmpegRenderPlan({
    inputVideoPath: "/input/demo.webm",
    outputVideoPath: "/output/demo.mp4",
    sourceVideoDurationMs: 5_000,
    outputDurationMs: 6_000,
    videoHolds: [{ atMs: 2_000, durationMs: 400 }],
    audioSegments: [
      {
        id: "intro",
        filePath: "/audio/intro.wav",
        startMs: 500,
        durationMs: 1_000,
        endMs: 1_500,
      },
    ],
    subtitles: { filePath: "/captions/demo.srt" },
  });

  assert.deepEqual(plan.args.slice(0, 6), [
    "-y",
    "-nostdin",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-i",
  ]);
  assert.equal(plan.args[plan.args.indexOf("-c:v") + 1], "libx264");
  assert.equal(plan.args[plan.args.indexOf("-c:a") + 1], "aac");
  assert.equal(plan.args[plan.args.indexOf("-movflags") + 1], "+faststart");
  assert.equal(plan.args[plan.args.indexOf("-map_metadata") + 1], "-1");
  assert.match(plan.filterComplex, /adelay=500:all=1/u);
  assert.match(plan.filterComplex, /subtitles=filename=/u);
  assert.match(plan.filterComplex, /tpad=stop_mode=clone/u);
  assert.match(plan.filterComplex, /trim=start=0\.000:end=2\.000/u);
  assert.match(plan.filterComplex, /concat=n=2:v=1:a=0\[vpaced\]/u);
});

test("escapes Windows-style filter paths without shell quoting", () => {
  const escaped = escapeFfmpegFilterPath("C:\\Demo Files\\review,final.srt");
  assert.doesNotMatch(escaped, /\\Demo Files/u);
  assert.match(escaped, /Demo Files/u);
  assert.match(escaped, /\\,/u);
});

async function hasRequiredFfmpegFeatures(): Promise<boolean> {
  try {
    const [version, filters, encoders] = await Promise.all([
      runProcess("ffmpeg", ["-version"]),
      runProcess("ffmpeg", ["-hide_banner", "-filters"]),
      runProcess("ffmpeg", ["-hide_banner", "-encoders"]),
    ]);
    return (
      /ffmpeg version/u.test(version.stdout) &&
      /\bsubtitles\b/u.test(filters.stdout) &&
      /\blibx264\b/u.test(encoders.stdout) &&
      /\baac\b/u.test(encoders.stdout)
    );
  } catch {
    return false;
  }
}

test("renders a synthetic clip with scheduled narration and burned captions", async (t) => {
  if (!(await hasRequiredFfmpegFeatures())) {
    t.skip("ffmpeg with libx264, AAC and subtitles support is not installed");
    return;
  }

  const directory = await mkdtemp(path.join(os.tmpdir(), "demo video media-"));
  try {
    const sourceVideo = path.join(directory, "source.mp4");
    const narration = path.join(directory, "voice.wav");
    const subtitles = path.join(directory, "captions.srt");
    const output = path.join(directory, "rendered.mp4");

    await runProcess("ffmpeg", [
      "-y",
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x334455:s=320x180:r=30:d=1",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      sourceVideo,
    ]);
    await runProcess("ffmpeg", [
      "-y",
      "-nostdin",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=0.3",
      "-c:a",
      "pcm_s16le",
      narration,
    ]);
    await writeFile(
      subtitles,
      "1\n00:00:00,100 --> 00:00:00,800\nAutomated review demo\n",
      "utf8",
    );

    const audio = await scheduleNarrationAudio(
      [{ id: "intro", filePath: narration, preferredStartMs: 100 }],
      { minimumGapMs: 0 },
    );
    const result = await renderVideo({
      inputVideoPath: sourceVideo,
      outputVideoPath: output,
      audioSegments: audio,
      videoHolds: [{ atMs: 500, durationMs: 400 }],
      subtitles: { filePath: subtitles, fontSize: 18 },
      width: 640,
      height: 360,
      fps: 30,
      clickFocusPoints: [
        {
          atMs: 300,
          x: 160,
          y: 90,
          viewportWidth: 320,
          viewportHeight: 180,
        },
      ],
      autoZoom: { durationMs: 400, leadInMs: 100 },
      tailPaddingMs: 0,
    });

    assert.ok(result.actualOutputDurationMs >= 1_300);
    assert.ok(result.actualOutputDurationMs <= 1_500);
    assert.ok((await probeMediaDurationMs(output)) >= 1_300);

    const replacement = await renderVideo({
      inputVideoPath: sourceVideo,
      outputVideoPath: output,
      audioSegments: audio,
      width: 640,
      height: 360,
      fps: 30,
      tailPaddingMs: 0,
    });
    assert.ok(replacement.actualOutputDurationMs >= 900);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
