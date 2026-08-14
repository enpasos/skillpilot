import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { loadScenario } from "../src/config.js";
import { runProcess } from "../src/process.js";
import { buildPipeline, narrationStage, recordStage, renderStage, speechStage, type RecordStageResult } from "../src/pipeline.js";
import type { TtsOpenAIClient } from "../src/tts.js";
import type { RecordingAdapter, RecordingContext } from "../src/types.js";
import { scenarioWorkDir } from "../src/workdir.js";

test("recordStage injects an adapter and records fresh unless reuse is explicit", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-adapter-"));
  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.outputDir = directory;
  const staleManifestPath = join(scenarioWorkDir(scenario), "manifest.json");
  await mkdir(scenarioWorkDir(scenario), { recursive: true, mode: 0o700 });
  await writeFile(staleManifestPath, "stale", { mode: 0o600 });
  const contexts: RecordingContext[] = [];
  const adapter: RecordingAdapter = {
    kind: "test-adapter",
    record: async (context) => {
      contexts.push(context);
      return {
        videoPath: join(context.workDir, "test.webm"),
        timelinePath: join(context.workDir, "timeline.json"),
        timeline: [{
          chapterId: "complete-flow",
          chapterTitle: "Declarative browser workflow",
          stepId: "open-fixture",
          action: "goto",
          label: "Open",
          startedAtMs: 0,
          endedAtMs: 1,
          evidence: [],
          secretInput: false,
        }],
        durationMs: 1,
        browserVersion: "test",
      };
    },
  };

  await recordStage({ scenario, scenarioPath: examplePath, recordingAdapter: adapter });
  await assert.rejects(access(staleManifestPath), (error: NodeJS.ErrnoException) => error.code === "ENOENT");
  await recordStage({
    scenario,
    scenarioPath: examplePath,
    recordingAdapter: adapter,
    reuseRecording: true,
  });

  assert.equal(contexts[0]?.force, true);
  assert.equal(contexts[1]?.force, false);
});

test("recordStage rejects an unresolved deployment revision", async () => {
  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.sourceRevision = "SET_TO_DEPLOYED_GIT_SHA";
  await assert.rejects(
    recordStage({
      scenario,
      scenarioPath: examplePath,
      recordingAdapter: { kind: "must-not-run", record: async () => { throw new Error("unexpected"); } },
    }),
    /cannot be a placeholder/u,
  );
});

test("build removes a stale completion manifest before mutable stages", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-stale-build-"));
  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.outputDir = join(directory, "output");
  scenario.cacheDir = join(directory, "cache");
  const workDir = scenarioWorkDir(scenario);
  await mkdir(workDir, { recursive: true, mode: 0o700 });
  const manifestPath = join(workDir, "manifest.json");
  await writeFile(manifestPath, "stale", { mode: 0o600 });

  await assert.rejects(
    buildPipeline({
      scenario,
      scenarioPath: examplePath,
      recordingAdapter: { kind: "failing", record: async () => { throw new Error("recording failed"); } },
    }),
    /recording failed/u,
  );
  await assert.rejects(access(manifestPath), (error: NodeJS.ErrnoException) => error.code === "ENOENT");
});

test("the SkillPilot review requires the exact deployed 40-character Git SHA", async () => {
  const reviewPath = resolve("scenarios/skillpilot-openai-review.template.yaml");
  const scenario = await loadScenario(reviewPath);
  scenario.sourceRevision = "68973c05";
  await assert.rejects(
    recordStage({
      scenario,
      scenarioPath: reviewPath,
      recordingAdapter: { kind: "must-not-run", record: async () => { throw new Error("unexpected"); } },
    }),
    /exact 40-character deployed Git SHA/u,
  );
});

test("narration cache is keyed to the fresh recording analysis", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-narration-cache-"));
  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.outputDir = directory;
  scenario.cacheDir = join(directory, "cache");
  scenario.narration.mode = "ai";
  let requests = 0;
  const narrationClient = {
    responses: {
      parse: async () => {
        requests += 1;
        return { output_parsed: {
          summary: "A safe demo.",
          editorialNotes: [],
          segments: [{
            id: "intro",
            chapterId: "complete-flow",
            anchorEventId: "open-fixture",
            title: "Open",
            narration: "The application is open.",
            subtitle: "The application is open.",
          }],
        } };
      },
    },
  } as never;

  const recorded = (evidence: string): RecordStageResult => ({
    workDir: join(directory, "work"),
    recording: {
      videoPath: join(directory, "recording.webm"),
      timelinePath: join(directory, "timeline.json"),
      timeline: [{
        chapterId: "complete-flow",
        chapterTitle: "Declarative browser workflow",
        stepId: "open-fixture",
        action: "goto",
        label: "Open",
        startedAtMs: 0,
        endedAtMs: 1,
        evidence: [{ selector: "h1", text: evidence }],
        secretInput: false,
      }],
      durationMs: 1,
      browserVersion: "test",
    },
    analysis: {
      scenarioId: scenario.id,
      title: scenario.title,
      durationMs: 1,
      platform: scenario.platform,
      chapters: [{
        id: "complete-flow",
        title: "Declarative browser workflow",
        startedAtMs: 0,
        endedAtMs: 1,
        events: [{
          stepId: "open-fixture",
          label: "Open",
          action: "goto",
          startedAtMs: 0,
          endedAtMs: 1,
          evidence: [`h1: ${evidence}`],
        }],
      }],
    },
    analysisPath: join(directory, "analysis.json"),
  });

  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded("first"));
  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded("first"));
  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded("second"));
  assert.equal(requests, 2);
  const cacheFiles = (await import("node:fs/promises")).readdir(scenario.cacheDir);
  assert.equal((await cacheFiles).filter((file) => file.startsWith("narration-")).length, 2);
});

test("narration cache is keyed to the captured screenshot bytes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-image-cache-"));
  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.outputDir = directory;
  scenario.cacheDir = join(directory, "cache");
  scenario.narration.mode = "ai";
  const screenshot = join(directory, "screenshots", "result.png");
  await mkdir(join(directory, "screenshots"), { recursive: true });
  await writeFile(screenshot, "first image bytes");
  let requests = 0;
  const narrationClient = {
    responses: { parse: async () => {
      requests += 1;
      return { output_parsed: { summary: "Image.", editorialNotes: [], segments: [{
        id: "image",
        chapterId: "complete-flow",
        anchorEventId: "result",
        title: "Result",
        narration: "The result is visible.",
        subtitle: "The result is visible.",
      }] } };
    } },
  } as never;
  const recorded: RecordStageResult = {
    workDir: directory,
    recording: {
      videoPath: join(directory, "recording.webm"),
      timelinePath: join(directory, "timeline.json"),
      timeline: [],
      durationMs: 1_000,
      browserVersion: "test",
    },
    analysis: {
      scenarioId: scenario.id,
      title: scenario.title,
      durationMs: 1_000,
      platform: scenario.platform,
      chapters: [{ id: "complete-flow", title: "Flow", startedAtMs: 0, endedAtMs: 1_000, events: [{
        stepId: "result",
        label: "Result",
        action: "screenshot",
        startedAtMs: 0,
        endedAtMs: 1_000,
        evidence: [],
        screenshot,
      }] }],
    },
    analysisPath: join(directory, "analysis.json"),
  };

  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded);
  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded);
  await writeFile(screenshot, "second image bytes");
  await narrationStage({ scenario, scenarioPath: examplePath, narrationClient }, recorded);
  assert.equal(requests, 2);
});

test("joins scripted narration, mocked OpenAI WAV speech, subtitles, and recorded video", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-pipeline-"));
  const videoPath = join(directory, "recording.mp4");
  const wavPath = join(directory, "voice.wav");
  await runProcess("ffmpeg", [
    "-y", "-f", "lavfi", "-i", "color=c=0x203050:s=640x360:r=30:d=2",
    "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", videoPath,
  ]);
  await runProcess("ffmpeg", [
    "-y", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=1",
    "-c:a", "pcm_s16le", wavPath,
  ]);
  const wav = await readFile(wavPath);
  const audioBuffer = wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer;
  const ttsClient = {
    audio: {
      speech: {
        create: async () => ({ arrayBuffer: async () => audioBuffer }),
      },
    },
  } as unknown as TtsOpenAIClient;

  const examplePath = resolve("scenarios/example.yaml");
  const scenario = await loadScenario(examplePath);
  scenario.outputDir = directory;
  scenario.cacheDir = join(directory, "cache");
  scenario.render.width = 640;
  scenario.render.height = 360;
  scenario.render.autoZoom.enabled = true;

  const timelinePath = join(directory, "timeline.json");
  const timeline = [{
    chapterId: "complete-flow",
    chapterTitle: "Declarative browser workflow",
    stepId: "open-fixture",
    action: "goto" as const,
    label: "Open the fixture application",
    startedAtMs: 100,
    endedAtMs: 400,
    evidence: [{ selector: "h1", text: "Browser Demo Video" }],
    click: { x: 320, y: 180 },
    secretInput: false,
  }];
  await writeFile(timelinePath, JSON.stringify(timeline), "utf8");
  const recorded: RecordStageResult = {
    workDir: directory,
    recording: {
      videoPath,
      timelinePath,
      timeline,
      durationMs: 2_000,
      browserVersion: "fixture",
    },
    analysis: {
      scenarioId: scenario.id,
      title: scenario.title,
      durationMs: 2_000,
      platform: scenario.platform,
      chapters: [{
        id: "complete-flow",
        title: "Declarative browser workflow",
        startedAtMs: 100,
        endedAtMs: 400,
        events: [{
          stepId: "open-fixture",
          label: "Open the fixture application",
          action: "goto",
          startedAtMs: 100,
          endedAtMs: 400,
          evidence: ["h1: Browser Demo Video"],
        }],
      }],
    },
    analysisPath: join(directory, "analysis.json"),
  };
  const options = { scenario, scenarioPath: examplePath, ttsClient };
  const narrated = await narrationStage(options, recorded);
  const speech = await speechStage(options, narrated.narration, recorded.recording);
  const rendered = await renderStage(
    options,
    recorded,
    speech.narration,
    speech.scheduled,
    speech.videoHolds,
  );

  assert.ok((await stat(rendered.outputVideoPath)).size > 0);
  assert.match(await readFile(rendered.subtitlesPath, "utf8"), /AI-generated and is not a human voice/i);

  scenario.outputDir = join(directory, "manifest-output");
  scenario.cacheDir = join(directory, "manifest-cache");
  const built = await buildPipeline({
    scenario,
    scenarioPath: examplePath,
    ttsClient,
    refreshAi: true,
    recordingAdapter: {
      kind: "fixture-recording",
      record: async () => ({
        videoPath,
        timelinePath,
        timeline,
        durationMs: 2_000,
        browserVersion: "fixture",
      }),
    },
  });
  const manifestText = await readFile(built.manifestPath, "utf8");
  const manifest = JSON.parse(manifestText) as {
    sourceRevision: string;
    scenarioFile: string;
    artifacts: Record<string, unknown> & {
      video: { path: string; sha256: string };
      sourceRecording: { path: string; sha256: string };
      analysis: { path: string; sha256: string };
      narrationAudio: Array<{ path: string; sha256: string }>;
    };
  };
  assert.equal(manifest.sourceRevision, "local-fixture-v1");
  assert.equal(manifest.scenarioFile, "example.yaml");
  assert.match(manifest.artifacts.video.sha256, /^[0-9a-f]{64}$/u);
  assert.match(manifest.artifacts.sourceRecording.sha256, /^[0-9a-f]{64}$/u);
  assert.match(manifest.artifacts.analysis.sha256, /^[0-9a-f]{64}$/u);
  assert.equal(manifest.artifacts.narrationAudio.length, 1);
  assert.match(manifest.artifacts.narrationAudio[0]?.path ?? "", /^audio\/[0-9a-f]{64}\.wav$/u);
  assert.doesNotMatch(manifest.artifacts.narrationAudio[0]?.path ?? "", /(?:^|\/)\.\.(?:\/|$)/u);
  assert.doesNotMatch(manifestText, new RegExp(directory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
});
