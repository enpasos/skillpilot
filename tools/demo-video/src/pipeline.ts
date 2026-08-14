import { access, readFile, rm } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { analyzeRecording, portableAnalysis, writeAnalysis, type RecordingAnalysis } from "./analyzer.js";
import { redactedScenario } from "./config.js";
import { sha256File, sha256Text, stableJson } from "./hash.js";
import {
  generateNarration,
  type NarrationOpenAIClient,
  type NarrationEvidence,
  type NarrationInput,
  type NarrationPlan as OpenAiNarrationPlan,
} from "./narrator.js";
import { PlaywrightRecordingAdapter } from "./recorder.js";
import { verifyPublishedRecording } from "./recording-verifier.js";
import { ensurePrivateDirectory, ensurePrivateFile, writePrivateFile } from "./private-fs.js";
import { assertTextIsPrivate, configuredEnvironmentSecrets } from "./privacy.js";
import { runProcess } from "./process.js";
import {
  renderVideo,
  probeMediaDurationMs,
  scheduleNarrationAudio,
  type ClickFocusPoint,
  type ScheduledNarrationAudio,
  type VideoHoldPoint,
} from "./media.js";
import { createNarrationPacingPlan, shiftRecordedTimestamp } from "./pacing.js";
import { createSubtitleCues, writeSrtFile } from "./subtitles.js";
import { synthesizeSpeechSegments } from "./tts.js";
import type { TtsOpenAIClient } from "./tts.js";
import type { BuildArtifacts, DemoScenario, NarrationPlan, NarrationSegment, RecordingAdapter, RecordingResult } from "./types.js";
import { scenarioWorkDir } from "./workdir.js";

export { scenarioWorkDir } from "./workdir.js";

export type PipelineStage = "record" | "narrate" | "tts" | "render" | "build";

export interface PipelineOptions {
  scenario: DemoScenario;
  scenarioPath: string;
  /** Explicitly invalidates AI narration and TTS caches. */
  force?: boolean;
  reuseRecording?: boolean;
  recordingAdapter?: RecordingAdapter;
  refreshAi?: boolean;
  narrationClient?: NarrationOpenAIClient;
  ttsClient?: TtsOpenAIClient;
}

export interface RecordStageResult {
  workDir: string;
  recording: RecordingResult;
  analysis: RecordingAnalysis;
  analysisPath: string;
}

interface SpeechStageResult {
  narration: NarrationPlan;
  scheduled: ScheduledNarrationAudio[];
  videoHolds: VideoHoldPoint[];
}

function fromOpenAiPlan(plan: OpenAiNarrationPlan): NarrationPlan {
  return {
    title: plan.summary,
    overview: plan.summary,
    disclosure: plan.disclosure,
    segments: plan.segments.map((segment) => ({
      id: segment.id,
      chapterId: segment.chapterId,
      title: segment.title,
      text: segment.narration,
      subtitle: segment.subtitle,
      startAfterStepId: segment.anchorEventId,
      desiredStartMs: segment.anchorMs,
    })),
  };
}

function scriptedPlan(scenario: DemoScenario, recording: RecordingResult): NarrationPlan {
  const segments: NarrationSegment[] = scenario.chapters.map((chapter, index) => {
    const firstEvent = recording.timeline.find((event) => event.chapterId === chapter.id);
    if (!firstEvent || !chapter.scriptedNarration) {
      throw new Error(`Cannot create scripted narration for chapter ${chapter.id}`);
    }
    return {
      id: `scripted-${index + 1}-${chapter.id}`,
      chapterId: chapter.id,
      title: chapter.title,
      text: `${index === 0 ? `${scenario.narration.disclosure} ` : ""}${chapter.scriptedNarration}`.trim(),
      subtitle: `${index === 0 ? `${scenario.narration.disclosure} ` : ""}${chapter.scriptedNarration}`.trim(),
      startAfterStepId: firstEvent.stepId,
      desiredStartMs: firstEvent.startedAtMs,
    };
  });
  return {
    title: scenario.title,
    overview: scenario.description ?? scenario.title,
    disclosure: scenario.narration.disclosure,
    segments,
  };
}

function narrationInput(scenario: DemoScenario, analysis: RecordingAnalysis): NarrationInput {
  const evidence: NarrationEvidence[] = analysis.chapters.flatMap((chapter) =>
    chapter.events.flatMap((event) => event.screenshot
      ? [{
          id: `${chapter.id}-${event.stepId}`,
          chapterId: chapter.id,
          atMs: event.startedAtMs,
          summary: event.evidence.join("\n"),
          imagePath: event.screenshot,
          imageDetail: "low" as const,
        }]
      : []),
  );
  return {
    title: scenario.title,
    objective: scenario.description ?? `Demonstrate ${scenario.title} accurately from the recorded browser evidence.`,
    audience: "A software marketplace reviewer evaluating product behavior, safety boundaries, and user value.",
    chapters: analysis.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      ...(chapter.narrationHint ? { narrationHint: chapter.narrationHint } : {}),
    })),
    timeline: analysis.chapters.flatMap((chapter) => chapter.events.map((event) => ({
      id: event.stepId,
      chapterId: chapter.id,
      atMs: event.startedAtMs,
      endMs: event.endedAtMs,
      action: event.action,
      label: event.label,
      ...(event.narrationHint ? { outcome: event.narrationHint } : {}),
      visibleText: event.evidence.join("\n"),
    }))),
    evidence,
    constraints: [
      `Create at most ${scenario.narration.maxSegments} segments.`,
      "Never mention or reconstruct redacted identifiers, authentication data, capabilities, or secrets.",
      "Do not claim that an emulated mobile browser is a native iOS or Android application.",
    ],
  };
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await ensurePrivateDirectory(dirname(path));
  await writePrivateFile(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8" });
}

function assertPrivateValue(scenario: DemoScenario, value: unknown, label: string): void {
  assertTextIsPrivate(
    typeof value === "string" ? value : JSON.stringify(value),
    scenario.privacy,
    configuredEnvironmentSecrets(scenario),
    label,
  );
}

export async function recordStage(options: PipelineOptions): Promise<RecordStageResult> {
  if (options.scenario.id === "skillpilot-openai-review-v1"
      && !/^[0-9a-f]{40}$/u.test(options.scenario.sourceRevision)) {
    throw new Error("The SkillPilot review scenario.sourceRevision must be the exact 40-character deployed Git SHA");
  }
  if (/^(?:SET_|TODO|CHANGEME|UNKNOWN)/iu.test(options.scenario.sourceRevision)) {
    throw new Error("scenario.sourceRevision must identify the exact deployed source and cannot be a placeholder");
  }
  const workDir = scenarioWorkDir(options.scenario);
  await ensurePrivateDirectory(options.scenario.outputDir);
  await ensurePrivateDirectory(options.scenario.cacheDir);
  await ensurePrivateDirectory(workDir);
  if (!(options.reuseRecording ?? false)) {
    await rm(join(workDir, "manifest.json"), { force: true });
  }
  const adapter = options.recordingAdapter ?? new PlaywrightRecordingAdapter();
  const recording = await adapter.record({
    scenario: options.scenario,
    scenarioPath: resolve(options.scenarioPath),
    workDir,
    force: !(options.reuseRecording ?? false),
  });
  const analysis = analyzeRecording(options.scenario, recording);
  assertPrivateValue(options.scenario, analysis, "recording analysis");
  const analysisPath = join(workDir, "analysis.json");
  await writeAnalysis(analysisPath, workDir, analysis);
  return { workDir, recording, analysis, analysisPath };
}

export async function narrationStage(
  options: PipelineOptions,
  recorded: RecordStageResult,
): Promise<{ narration: NarrationPlan; narrationPath: string }> {
  const screenshotPaths = [...new Set(recorded.analysis.chapters.flatMap((chapter) =>
    chapter.events.flatMap((event) => event.screenshot ? [event.screenshot] : []),
  ))].sort();
  const screenshotEvidence = await Promise.all(screenshotPaths.map(async (path) => ({
    id: relative(recorded.workDir, path),
    sha256: await sha256File(path),
  })));
  const narrationInputDigest = sha256Text(stableJson({
    scenario: redactedScenario(options.scenario),
    analysis: portableAnalysis(recorded.workDir, recorded.analysis),
    screenshotEvidence,
  })).slice(0, 20);
  const narrationCachePath = join(options.scenario.cacheDir, `narration-${narrationInputDigest}.json`);
  const narrationPath = join(recorded.workDir, "narration.json");
  const mayReuseNarration = options.scenario.narration.mode === "ai";
  if (mayReuseNarration && !options.force && !options.refreshAi && await exists(narrationCachePath)) {
    const narration = JSON.parse(await readFile(narrationCachePath, "utf8")) as NarrationPlan;
    assertPrivateValue(options.scenario, narration, "cached narration");
    await writeJson(narrationPath, narration);
    return { narration, narrationPath };
  }
  const narration = options.scenario.narration.mode === "scripted"
    ? scriptedPlan(options.scenario, recorded.recording)
    : fromOpenAiPlan(await generateNarration(narrationInput(options.scenario, recorded.analysis), {
        ...(options.narrationClient ? { client: options.narrationClient } : {}),
        model: options.scenario.narration.model,
        disclosure: options.scenario.narration.disclosure,
        maxImageEvidence: 8,
        maxSegments: options.scenario.narration.maxSegments,
        sensitiveValues: configuredEnvironmentSecrets(options.scenario),
      }));
  assertPrivateValue(options.scenario, narration, "narration");
  await writeJson(narrationPath, narration);
  if (mayReuseNarration) await writeJson(narrationCachePath, narration);
  return { narration, narrationPath };
}

export async function speechStage(
  options: PipelineOptions,
  narration: NarrationPlan,
  recording: RecordingResult,
): Promise<SpeechStageResult> {
  assertPrivateValue(options.scenario, narration, "TTS input");
  await ensurePrivateDirectory(options.scenario.cacheDir);
  const speech = await synthesizeSpeechSegments(
    narration.segments.map((segment) => ({
      id: segment.id,
      text: segment.text,
      chapterId: segment.chapterId,
      anchorMs: segment.desiredStartMs,
    })),
    {
      ...(options.ttsClient ? { client: options.ttsClient } : {}),
      cacheDir: options.scenario.cacheDir,
      model: options.scenario.narration.ttsModel,
      voice: options.scenario.narration.voice,
      instructions: options.scenario.narration.instructions,
      disclosure: options.scenario.narration.disclosure,
      refreshCache: (options.refreshAi ?? false) || (options.force ?? false),
    },
  );
  const probed = await scheduleNarrationAudio(
    speech.map((segment) => ({
      id: segment.id,
      filePath: segment.audioPath,
      ...(segment.anchorMs !== undefined ? { preferredStartMs: segment.anchorMs } : {}),
    })),
    {
      ffprobe: options.scenario.binaries.ffprobe,
      minimumGapMs: options.scenario.narration.segmentGapMs,
    },
  );
  const sourceVideoDurationMs = await probeMediaDurationMs(recording.videoPath, {
    ffprobe: options.scenario.binaries.ffprobe,
  });
  const pacing = createNarrationPacingPlan(probed.map((entry) => {
    const segment = narration.segments.find((candidate) => candidate.id === entry.id);
    if (!segment) throw new Error(`Missing narration anchor for ${entry.id}`);
    return {
      id: entry.id,
      filePath: entry.filePath,
      anchorMs: segment.desiredStartMs,
      durationMs: entry.durationMs,
    };
  }), {
    sourceVideoDurationMs,
    minimumGapMs: options.scenario.narration.segmentGapMs,
  });
  const scheduled = pacing.audio;
  const scheduleById = new Map(scheduled.map((entry) => [entry.id, entry]));
  return {
    narration: {
      ...narration,
      segments: narration.segments.map((segment) => {
        const synthesized = speech.find((entry) => entry.id === segment.id);
        const timing = scheduleById.get(segment.id);
        if (!synthesized || !timing) throw new Error(`Missing synthesized narration for ${segment.id}`);
        return {
          ...segment,
          audioPath: synthesized.audioPath,
          audioDurationMs: timing.durationMs,
          startMs: timing.startMs,
          endMs: timing.endMs,
        };
      }),
    },
    scheduled,
    videoHolds: pacing.holds,
  };
}

async function publishSpeechAudio(speech: SpeechStageResult, workDir: string): Promise<SpeechStageResult> {
  const audioDirectory = join(workDir, "audio");
  await ensurePrivateDirectory(audioDirectory);
  const publishedBySource = new Map<string, string>();
  for (const sourcePath of new Set(speech.scheduled.map((segment) => segment.filePath))) {
    const digest = await sha256File(sourcePath);
    const publishedPath = join(audioDirectory, `${digest}.wav`);
    await writePrivateFile(publishedPath, await readFile(sourcePath));
    publishedBySource.set(sourcePath, publishedPath);
  }
  const publishedPath = (sourcePath: string): string => {
    const path = publishedBySource.get(sourcePath);
    if (!path) throw new Error(`Missing published narration audio for ${sourcePath}`);
    return path;
  };
  return {
    narration: {
      ...speech.narration,
      segments: speech.narration.segments.map((segment) => segment.audioPath
        ? { ...segment, audioPath: publishedPath(segment.audioPath) }
        : segment),
    },
    scheduled: speech.scheduled.map((segment) => ({
      ...segment,
      filePath: publishedPath(segment.filePath),
    })),
    videoHolds: speech.videoHolds,
  };
}

function publishedNarration(narration: NarrationPlan, workDir: string): NarrationPlan {
  return {
    ...narration,
    segments: narration.segments.map((segment) => {
      if (!segment.audioPath) return segment;
      return { ...segment, audioPath: relative(workDir, segment.audioPath) };
    }),
  };
}

export async function renderStage(
  options: PipelineOptions,
  recorded: RecordStageResult,
  narration: NarrationPlan,
  scheduled: ScheduledNarrationAudio[],
  videoHolds: VideoHoldPoint[],
): Promise<{ subtitlesPath: string; outputVideoPath: string }> {
  const subtitlesPath = join(recorded.workDir, "subtitles.srt");
  const cues = createSubtitleCues(narration.segments.map((segment) => {
    if (segment.startMs === undefined || segment.endMs === undefined) {
      throw new Error(`Narration segment ${segment.id} has no scheduled timing`);
    }
    return {
      id: segment.id,
      text: segment.subtitle ?? segment.text,
      startMs: segment.startMs,
      endMs: segment.endMs,
    };
  }));
  assertPrivateValue(options.scenario, cues, "subtitles");
  await writeSrtFile(subtitlesPath, cues);
  await ensurePrivateFile(subtitlesPath);
  const outputVideoPath = join(recorded.workDir, `${options.scenario.id}.mp4`);
  const clickFocusPoints: ClickFocusPoint[] = recorded.recording.timeline.flatMap((event) => event.click
    ? [{
        atMs: shiftRecordedTimestamp(event.startedAtMs, videoHolds),
        x: event.click.x,
        y: event.click.y,
        viewportWidth: options.scenario.browser.viewport.width,
        viewportHeight: options.scenario.browser.viewport.height,
      }]
    : []);
  await renderVideo({
    inputVideoPath: recorded.recording.videoPath,
    outputVideoPath,
    audioSegments: scheduled,
    videoHolds,
    clickFocusPoints,
    autoZoom: {
      enabled: options.scenario.render.autoZoom.enabled,
      maxScale: options.scenario.render.autoZoom.factor,
      durationMs: options.scenario.render.autoZoom.durationMs,
    },
    ...(options.scenario.render.burnSubtitles
      ? { subtitles: {
          filePath: subtitlesPath,
          fontSize: options.scenario.render.subtitleFontSize,
          marginBottom: options.scenario.render.subtitleBottomMargin,
        } }
      : {}),
    width: options.scenario.render.width,
    height: options.scenario.render.height,
    fps: options.scenario.render.fps,
    crf: options.scenario.render.crf,
    preset: options.scenario.render.preset,
    ffmpeg: options.scenario.binaries.ffmpeg,
    ffprobe: options.scenario.binaries.ffprobe,
  });
  await ensurePrivateFile(outputVideoPath);
  return { subtitlesPath, outputVideoPath };
}

export async function buildPipeline(options: PipelineOptions): Promise<BuildArtifacts> {
  const buildOptions = options;
  const intendedWorkDir = scenarioWorkDir(buildOptions.scenario);
  await ensurePrivateDirectory(buildOptions.scenario.outputDir);
  await ensurePrivateDirectory(intendedWorkDir);
  // manifest.json is the completion marker for the assembled package. Remove
  // it before any mutable stage so a failed regeneration cannot leave an old
  // build looking current.
  await rm(join(intendedWorkDir, "manifest.json"), { force: true });
  const recorded = await recordStage(buildOptions);
  if (!options.recordingAdapter) await verifyPublishedRecording(buildOptions.scenario);
  const narrated = await narrationStage(buildOptions, recorded);
  const synthesizedSpeech = await speechStage(buildOptions, narrated.narration, recorded.recording);
  const speech = await publishSpeechAudio(synthesizedSpeech, recorded.workDir);
  await writeJson(narrated.narrationPath, publishedNarration(speech.narration, recorded.workDir));
  const rendered = await renderStage(
    buildOptions,
    recorded,
    speech.narration,
    speech.scheduled,
    speech.videoHolds,
  );
  const manifestPath = join(recorded.workDir, "manifest.json");
  const [ffmpegVersion, ffprobeVersion] = await Promise.all([
    runProcess(buildOptions.scenario.binaries.ffmpeg, ["-version"]).then((result) => result.stdout.split(/\r?\n/, 1)[0] ?? "unknown"),
    runProcess(buildOptions.scenario.binaries.ffprobe, ["-version"]).then((result) => result.stdout.split(/\r?\n/, 1)[0] ?? "unknown"),
  ]);
  const screenshotPaths = [...new Set(recorded.recording.timeline.flatMap((event) =>
    event.screenshot ? [event.screenshot] : [],
  ))].sort();
  const audioPaths = [...new Set(speech.narration.segments.flatMap((segment) =>
    segment.audioPath ? [segment.audioPath] : [],
  ))].sort();
  const artifact = async (path: string) => ({
    path: relative(recorded.workDir, path),
    sha256: await sha256File(path),
  });
  const manifest = {
    schemaVersion: 1,
    scenario: redactedScenario(buildOptions.scenario),
    scenarioFile: basename(buildOptions.scenarioPath),
    scenarioSourceSha256: await sha256File(resolve(buildOptions.scenarioPath)),
    sourceRevision: buildOptions.scenario.sourceRevision,
    toolVersion: "0.1.0",
    nodeVersion: process.version,
    browserVersion: recorded.recording.browserVersion,
    binaries: { ffmpeg: ffmpegVersion, ffprobe: ffprobeVersion },
    models: {
      narration: buildOptions.scenario.narration.mode === "ai" ? buildOptions.scenario.narration.model : "scripted",
      tts: buildOptions.scenario.narration.ttsModel,
      voice: buildOptions.scenario.narration.voice,
    },
    artifacts: {
      video: await artifact(rendered.outputVideoPath),
      sourceRecording: await artifact(recorded.recording.videoPath),
      subtitles: await artifact(rendered.subtitlesPath),
      timeline: await artifact(recorded.recording.timelinePath),
      analysis: await artifact(recorded.analysisPath),
      narration: await artifact(narrated.narrationPath),
      screenshots: await Promise.all(screenshotPaths.map(artifact)),
      narrationAudio: await Promise.all(audioPaths.map(artifact)),
    },
  };
  // Regex policy is intentionally retained verbatim in the audit manifest and
  // can naturally match its own source. Scan the data-bearing fields while
  // excluding only that policy definition.
  const scenarioForPrivacyCheck = structuredClone(manifest.scenario) as {
    privacy?: { forbiddenPatterns?: string[] };
  };
  if (scenarioForPrivacyCheck.privacy) scenarioForPrivacyCheck.privacy.forbiddenPatterns = [];
  assertPrivateValue(
    buildOptions.scenario,
    { ...manifest, scenario: scenarioForPrivacyCheck },
    "manifest",
  );
  await writeJson(manifestPath, manifest);
  return {
    workDir: recorded.workDir,
    recording: recorded.recording,
    narrationPath: narrated.narrationPath,
    narration: speech.narration,
    subtitlesPath: rendered.subtitlesPath,
    outputVideoPath: rendered.outputVideoPath,
    manifestPath,
  };
}
