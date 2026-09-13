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
import { createNarrationPacingPlan } from "../src/pacing.js";
import { sha256File } from "../src/hash.js";

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
  assert.match(plan.filterComplex, /trim=start=0\.000:end=1\.900/u);
  assert.match(plan.filterComplex, /trim=start=1\.900:end=5\.000/u);
  assert.match(plan.filterComplex, /concat=n=2:v=1:a=0\[vpaced\]/u);
});

test("visual notice is independently burned for eight seconds at a safe top-right position", () => {
  const plan = buildFfmpegRenderPlan({
    inputVideoPath: "/input/demo.webm", outputVideoPath: "/output/demo.mp4",
    sourceVideoDurationMs: 10_000, outputDurationMs: 10_000,
    visualDisclosure: { textFilePath: "/private/voice-label.txt" },
  });
  assert.match(plan.filterComplex, /drawtext=textfile=.*voice-label\.txt/u);
  assert.match(plan.filterComplex, /expansion=none/u);
  assert.match(plan.filterComplex, /x=w-tw-34:y=34/u);
  assert.match(plan.filterComplex, /box=1:boxcolor=black@0\.75/u);
  assert.match(plan.filterComplex, /enable='lt\(t,8\)'/u);
  assert.doesNotMatch(plan.filterComplex, /subtitles=filename/u);
});

test("recorded camera focus partitions real footage with explicit bounded crop and white aspect-preserving padding", () => {
  const region = { startMs: 1000, endMs: 3000, x: 296, y: 258, width: 688, height: 302,
    sourceWidth: 1280, sourceHeight: 720 };
  const options = { inputVideoPath: "raw.webm", outputVideoPath: "render.mp4",
    sourceVideoDurationMs: 4000, outputDurationMs: 4000, recordedFocusRegions: [region] };
  const plan = buildFfmpegRenderPlan(options);
  assert.match(plan.filterComplex, /trim=start=0\.000:end=1\.000/u);
  assert.match(plan.filterComplex, /trim=start=1\.000:end=3\.000/u);
  assert.match(plan.filterComplex, /trim=start=3\.000:end=4\.000/u);
  assert.match(plan.filterComplex, /crop=w=688:h=302:x=296:y=258:exact=1,scale=w=1920:h=1080:force_original_aspect_ratio=decrease/u);
  assert.match(plan.filterComplex, /pad=1920:1080:\(ow-iw\)\/2:\(oh-ih\)\/2:color=white/u);
  assert.match(plan.filterComplex, /concat=n=3:v=1:a=0\[vfocused\]/u);
  assert.doesNotMatch(plan.filterComplex, /setpts=.*\*PTS|overlay=/u);
  for (const invalid of [{ x: -1 }, { width: 1280 }, { startMs: 0.5 }, { startMs: 3000 }, { endMs: 4001 }]) {
    assert.throws(() => buildFfmpegRenderPlan({ ...options, recordedFocusRegions: [{ ...region, ...invalid }] }));
  }
  assert.throws(() => buildFfmpegRenderPlan({ ...options, recordedFocusRegions: [region, region] }), /must not overlap/u);
  assert.throws(() => buildFfmpegRenderPlan({ ...options, autoZoom: { enabled: true } }), /cannot be combined/u);
  const unchanged = { ...options, recordedFocusRegions: [] };
  const { recordedFocusRegions: _unused, ...withoutFocus } = options;
  assert.deepEqual(buildFfmpegRenderPlan(unchanged), buildFfmpegRenderPlan(withoutFocus));
});

test("a zero-time hold keeps the first source frame without a fractional timestamp", () => {
  const plan = buildFfmpegRenderPlan({
    inputVideoPath: "/input/demo.webm", outputVideoPath: "/output/demo.mp4",
    sourceVideoDurationMs: 1_000, outputDurationMs: 2_000,
    videoHolds: [{ atMs: 0, durationMs: 1_000 }], fps: 30,
  });
  assert.match(plan.filterComplex, /trim=start=0\.000:end=0\.034/u);
  assert.match(plan.filterComplex, /trim=start=0\.034:end=1\.000/u);
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

test("recorded camera focus preserves real motion and every frame at 1x, covers narration holds and restores the full view", async (t) => {
  if (!(await hasRequiredFfmpegFeatures())) { t.skip("Required FFmpeg features are not installed"); return; }
  const directory = await mkdtemp(path.join(os.tmpdir(), "demo-video-camera-focus-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = path.join(directory, "source.mp4");
  const output = path.join(directory, "camera.mp4");
  const baseline = path.join(directory, "same-holds-full-view.mp4");
  const unpaced = path.join(directory, "camera-without-holds.mp4");
  await runProcess("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
    "color=c=red:s=320x240:r=25:d=4", "-vf",
    "drawbox=x=60:y=80:w=200:h=80:color=blue:t=fill:enable='lt(t,2)',drawbox=x=60:y=80:w=200:h=80:color=lime:t=fill:enable='gte(t,2)'",
    "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", source]);
  const sourceHash = await sha256File(source);
  const region = { startMs: 1000, endMs: 3800, x: 60, y: 80, width: 200, height: 80,
    sourceWidth: 320, sourceHeight: 240 };
  await renderVideo({ inputVideoPath: source, outputVideoPath: output, width: 640, height: 360, fps: 25,
    videoHolds: [{ atMs: 2600, durationMs: 800 }], recordedFocusRegions: [region] });
  await renderVideo({ inputVideoPath: source, outputVideoPath: baseline, width: 640, height: 360, fps: 25,
    videoHolds: [{ atMs: 2600, durationMs: 800 }] });
  await renderVideo({ inputVideoPath: source, outputVideoPath: unpaced, width: 640, height: 360, fps: 25,
    recordedFocusRegions: [{ ...region, endMs: 3000 }] });
  const pixel = async (atMs: number, x: number, y: number): Promise<number[]> => {
    const result = await runProcess("ffmpeg", ["-hide_banner", "-ss", (atMs / 1000).toFixed(3), "-i", output,
      "-frames:v", "1", "-an", "-vf", `crop=8:8:${x}:${y},signalstats,metadata=print`, "-f", "null", "-"]);
    return ["Y", "U", "V"].map((channel) => {
      const match = new RegExp(`lavfi\\.signalstats\\.${channel}AVG=(\\d+(?:\\.\\d+)?)`, "u").exec(result.stderr);
      assert.ok(match, "camera sample must contain an actual rendered frame");
      return Number(match[1]);
    });
  };
  assert.ok((await pixel(500, 100, 80))[2]! > 200, "full recorded red view precedes the camera crop");
  assert.ok((await pixel(1200, 100, 80))[1]! > 200, "actual blue rectangle fills the camera closeup");
  assert.ok((await pixel(2200, 100, 80))[2]! < 70, "real blue-to-green action occurs at its original 2s time");
  assert.ok((await pixel(3300, 100, 80))[2]! < 70, "green closeup persists throughout the paced reading hold");
  assert.ok((await pixel(1200, 320, 20))[0]! > 230, "white letterboxing preserves the entire crop aspect ratio");
  assert.ok((await pixel(4200, 100, 80))[2]! > 200, "full recorded view resumes outside the declared interval");
  const frameCount = async (file: string): Promise<number> => {
    const probe = await runProcess("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0",
      "-show_entries", "stream=nb_read_frames", "-of", "json", file]);
    return Number(JSON.parse(probe.stdout).streams[0].nb_read_frames);
  };
  assert.equal(await frameCount(unpaced), 100, "camera framing preserves all 100 original frames at 1x");
  assert.equal(await frameCount(output), await frameCount(baseline),
    "camera framing adds no frame loss to the identical off-frame-grid narration-hold baseline");
  assert.equal(await probeMediaDurationMs(output), await probeMediaDurationMs(baseline),
    "camera framing does not shorten or extend the paced baseline");
  assert.ok(Math.abs(await probeMediaDurationMs(output) - 4800) < 50);
  assert.equal(await sha256File(source), sourceHash, "camera framing must not rewrite original evidence");
  await assert.rejects(renderVideo({ inputVideoPath: source, outputVideoPath: path.join(directory, "bad.mp4"),
    recordedFocusRegions: [{ ...region, endMs: 3000, sourceWidth: 640 }] }), /actual source video/u);
});

test("holds keep the preceding screen when recorded transitions lead event anchors, without losing source states", async (t) => {
  if (!(await hasRequiredFfmpegFeatures())) { t.skip("Required FFmpeg features are not installed"); return; }
  const directory = await mkdtemp(path.join(os.tmpdir(), "demo-video-hold-boundary-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceVideo = path.join(directory, "source.mp4");
  const outputVideo = path.join(directory, "held.mp4");
  await runProcess("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "color=c=0xff0000:s=320x180:r=25:d=1",
    "-f", "lavfi", "-i", "color=c=0x00ff00:s=320x180:r=25:d=1",
    "-f", "lavfi", "-i", "color=c=0x0000ff:s=320x180:r=25:d=1",
    "-filter_complex", "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]", "-map", "[v]",
    "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", sourceVideo,
  ]);
  await renderVideo({
    inputVideoPath: sourceVideo, outputVideoPath: outputVideo, width: 320, height: 180,
    // This reproduces a 25fps screencast painting each new page 80ms before
    // the corresponding wall-clock event anchor, as seen in the Quickstart.
    videoHolds: [{ atMs: 1_080, durationMs: 1_500 }, { atMs: 2_080, durationMs: 1_500 }],
  });
  const frameV = async (seconds: number): Promise<number> => {
    const result = await runProcess("ffmpeg", [
      "-hide_banner", "-ss", String(seconds), "-i", outputVideo, "-frames:v", "1", "-an",
      "-vf", "crop=8:8:100:100,signalstats,metadata=print", "-f", "null", "-",
    ]);
    const match = /lavfi\.signalstats\.VAVG=(\d+(?:\.\d+)?)/u.exec(result.stderr);
    assert.ok(match, "sampled video must contain a real frame");
    return Number(match[1]);
  };
  assert.ok(await frameV(0.5) > 200, "original first red screen is retained");
  assert.ok(await frameV(1.8) > 200, "first long hold must keep red, not the upcoming green screen");
  assert.ok(await frameV(2.8) < 70, "green transition plays after the hold");
  assert.ok(await frameV(4.3) < 70, "second hold must keep green, not the upcoming blue screen");
  const finalV = await frameV(5.5);
  assert.ok(finalV > 90 && finalV < 140, "final blue state and remaining source footage are retained");
  assert.ok(Math.abs(await probeMediaDurationMs(outputVideo) - 6_000) < 100, "holds preserve total source duration plus inserted pauses");
});

test("final narration frames keep their chapter when next pages paint 200ms before event anchors", async (t) => {
  if (!(await hasRequiredFfmpegFeatures())) { t.skip("Required FFmpeg features are not installed"); return; }
  const directory = await mkdtemp(path.join(os.tmpdir(), "demo-video-stable-reading-hold-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceVideo = path.join(directory, "source.mp4");
  const outputVideo = path.join(directory, "held.mp4");
  await runProcess("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "color=c=red:s=320x180:r=25:d=2",
    "-f", "lavfi", "-i", "color=c=green:s=320x180:r=25:d=2",
    "-f", "lavfi", "-i", "color=c=blue:s=320x180:r=25:d=2",
    "-f", "lavfi", "-i", "color=c=yellow:s=320x180:r=25:d=2",
    "-filter_complex", "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v]", "-map", "[v]",
    "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", sourceVideo,
  ]);
  const pacing = createNarrationPacingPlan([
    { id: "feedback", filePath: "unused.wav", anchorMs: 0, durationMs: 4_500, holdAtMs: 1_200 },
    { id: "session", filePath: "unused.wav", anchorMs: 2_200, durationMs: 4_500, holdAtMs: 3_200 },
    { id: "mobile", filePath: "unused.wav", anchorMs: 4_200, durationMs: 4_500, holdAtMs: 5_200 },
    { id: "finish", filePath: "unused.wav", anchorMs: 6_200, durationMs: 1_000 },
  ], { sourceVideoDurationMs: 8_000, minimumGapMs: 500, tailPaddingMs: 500 });
  await renderVideo({ inputVideoPath: sourceVideo, outputVideoPath: outputVideo, width: 320, height: 180,
    videoHolds: pacing.holds });
  const frameColour = async (file: string, atMs: number): Promise<number[]> => {
    const result = await runProcess("ffmpeg", [
      "-hide_banner", "-ss", (atMs / 1_000).toFixed(3), "-i", file, "-frames:v", "1", "-an",
      "-vf", "crop=8:8:100:100,signalstats,metadata=print", "-f", "null", "-",
    ]);
    return ["Y", "U", "V"].map(channel => {
      const match = new RegExp(`lavfi\\.signalstats\\.${channel}AVG=(\\d+(?:\\.\\d+)?)`, "u").exec(result.stderr);
      assert.ok(match, "final narration sample must contain a real source frame");
      return Number(match[1]);
    });
  };
  for (const [index, segment] of pacing.audio.entries()) {
    const expected = await frameColour(sourceVideo, index * 2_000 + 500);
    const actual = await frameColour(outputVideo, segment.endMs - 50);
    assert.ok(actual.every((value, channel) => Math.abs(value - expected[channel]!) < 3),
      `${segment.id} must still show its own chapter at the final narration frame`);
  }
  assert.ok(Math.abs(await probeMediaDurationMs(outputVideo) - pacing.pacedVideoDurationMs) < 100,
    "all original source time remains, with only the planned pauses added");
});

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
