import assert from "node:assert/strict";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildAutoZoomFilter,
  buildFfmpegVideoCompositionPlan,
  buildFfmpegRenderPlan,
  composeVideoClips,
  escapeFfmpegFilterPath,
  probeMediaDurationMs,
  probeMediaStreamTypes,
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

test("creates a normalized, explicitly labeled Web and native clip composition plan", () => {
  const plan = buildFfmpegVideoCompositionPlan({
    sources: [
      {
        id: "web-playwright",
        filePath: "/private/web.mp4",
        audio: "preserve",
        durationMs: 2_000,
        hasAudio: true,
        labelFilePath: "/private/labels/web.srt",
      },
      {
        id: "native-ios",
        filePath: "/private/ios.mov",
        audio: "mute",
        durationMs: 1_000,
        hasAudio: true,
        labelFilePath: "/private/labels/ios.srt",
      },
    ],
    outputVideoPath: "/private/final.mp4",
    width: 1_920,
    height: 1_080,
    fps: 30,
  });

  assert.equal(plan.outputDurationMs, 3_000);
  assert.match(plan.filterComplex, /subtitles=filename=/u);
  assert.match(plan.filterComplex, /Alignment=7/u);
  assert.match(plan.filterComplex, /scale=w=1920:h=1080:force_original_aspect_ratio=decrease/u);
  assert.match(plan.filterComplex, /anullsrc=channel_layout=stereo:sample_rate=48000/u);
  assert.match(plan.filterComplex, /concat=n=2:v=1:a=1\[vout\]\[aout\]/u);
  assert.equal(plan.args[plan.args.indexOf("-c:v") + 1], "libx264");
  assert.equal(plan.args[plan.args.indexOf("-c:a") + 1], "aac");
  assert.equal(plan.args[plan.args.indexOf("-map_metadata") + 1], "-1");
  assert.equal(plan.args[plan.args.indexOf("-map_chapters") + 1], "-1");
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

test("normalizes and concatenates Web and muted native clips into one playable MP4", async (t) => {
  if (!(await hasRequiredFfmpegFeatures())) {
    t.skip("ffmpeg with libx264, AAC and subtitles support is not installed");
    return;
  }

  const directory = await mkdtemp(path.join(os.tmpdir(), "demo-video-composition-"));
  try {
    const web = path.join(directory, "web.mp4");
    const native = path.join(directory, "ios.mov");
    const label = path.join(directory, "ios.srt");
    const output = path.join(directory, "review.mp4");
    await runProcess("ffmpeg", [
      "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "color=c=0x203050:s=320x180:r=30:d=0.6",
      "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=0.6",
      "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", web,
    ]);
    await runProcess("ffmpeg", [
      "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "color=c=0x805020:s=180x320:r=24:d=0.4",
      "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", native,
    ]);
    await writeFile(
      label,
      "1\n00:00:00,000 --> 00:00:01,000\niOS — externally recorded native clip\n",
      "utf8",
    );

    const result = await composeVideoClips({
      sources: [
        { id: "web-playwright", filePath: web, audio: "preserve" },
        { id: "native-ios", filePath: native, audio: "mute", labelFilePath: label },
      ],
      outputVideoPath: output,
      width: 640,
      height: 360,
      fps: 30,
    });

    assert.ok(result.actualOutputDurationMs >= 900);
    assert.ok(result.actualOutputDurationMs <= 1_100);
    assert.deepEqual(await probeMediaStreamTypes(output), { video: 1, audio: 1 });
    assert.ok((await stat(output)).size > 0);
    if (process.platform !== "win32") {
      assert.equal((await stat(output)).mode & 0o077, 0);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
