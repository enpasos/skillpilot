import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { sha256File } from "./hash.js";
import { composeVideoClips, type ComposeVideoClipsResult } from "./media.js";
import { assertPrivateInputFile, ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";
import { createSubtitleCues, writeSrtFile } from "./subtitles.js";
import { runtimeEnvironmentValue, type RuntimeEnvironment } from "./runtime-environment.js";
import type { DemoScenario, NativePlatform, PlatformClipConfig } from "./types.js";

interface ResolvedPlatformClipInput {
  config: PlatformClipConfig;
  inputPath: string;
  expectedSha256: string;
  sourceRevision: string;
}

export interface ComposedPlatformClip {
  id: string;
  title: string;
  platform: NativePlatform;
  captureMethod: "external-native-recording";
  sourceRevision: string;
  privacyReviewed: true;
  audioPolicy: "mute" | "preserve";
  sourceSha256: string;
  sourceDurationMs: number;
  sourceHasAudio: boolean;
  labelPath: string;
}

export interface PlatformClipCompositionResult {
  outputVideoPath: string;
  webVideoPath: string;
  webDurationMs: number;
  webLabelPath: string;
  platformClips: ComposedPlatformClip[];
  outputDurationMs: number;
  actualOutputDurationMs: number;
}

function requiredEnvironment(
  name: string,
  label: string,
  environment?: RuntimeEnvironment,
): string {
  const value = runtimeEnvironmentValue(environment, name);
  if (!value?.trim()) throw new Error(`${label} requires environment variable ${name}`);
  return value.trim();
}

function resolveClipPath(clip: PlatformClipConfig, environment?: RuntimeEnvironment): string {
  if (clip.path) return resolve(clip.path);
  if (!clip.pathFromEnv) throw new Error(`Platform clip ${clip.id} has no input path`);
  const value = requiredEnvironment(clip.pathFromEnv, `Platform clip ${clip.id}`, environment);
  if (!isAbsolute(value)) {
    throw new Error(`Platform clip ${clip.id} environment path ${clip.pathFromEnv} must be absolute`);
  }
  return resolve(value);
}

function expectedClipSha256(clip: PlatformClipConfig, environment?: RuntimeEnvironment): string {
  const value = clip.expectedSha256
    ?? (clip.expectedSha256FromEnv
      ? requiredEnvironment(clip.expectedSha256FromEnv, `Platform clip ${clip.id}`, environment)
      : undefined);
  if (!value || !/^[0-9a-fA-F]{64}$/u.test(value)) {
    throw new Error(`Platform clip ${clip.id} needs an exact SHA-256 digest`);
  }
  return value.toLowerCase();
}

function assertPrivacyReview(clip: PlatformClipConfig, environment?: RuntimeEnvironment): void {
  if (clip.privacyReviewed === true) return;
  if (!clip.privacyReviewedFromEnv) {
    throw new Error(`Platform clip ${clip.id} has no privacy review attestation`);
  }
  const value = requiredEnvironment(
    clip.privacyReviewedFromEnv,
    `Platform clip ${clip.id}`,
    environment,
  );
  if (value !== "true") {
    throw new Error(`Platform clip ${clip.id} privacy review attestation must equal true`);
  }
}

function sourceRevision(clip: PlatformClipConfig, environment?: RuntimeEnvironment): string {
  const value = clip.sourceRevision
    ?? (clip.sourceRevisionFromEnv
      ? requiredEnvironment(clip.sourceRevisionFromEnv, `Platform clip ${clip.id}`, environment)
      : undefined);
  if (!value || !/^[0-9a-f]{40}$/u.test(value)) {
    throw new Error(`Platform clip ${clip.id} needs the exact lowercase 40-character deployed Git SHA`);
  }
  return value;
}

export async function validatePlatformClipInputs(
  scenario: DemoScenario,
  environment?: RuntimeEnvironment,
): Promise<ResolvedPlatformClipInput[]> {
  return await Promise.all(scenario.platformClips.map(async (config) => {
    assertPrivacyReview(config, environment);
    const inputPath = resolveClipPath(config, environment);
    const expectedSha256 = expectedClipSha256(config, environment);
    await assertPrivateInputFile(inputPath, `Platform clip ${config.id}`);
    const actualSha256 = await sha256File(inputPath);
    if (actualSha256 !== expectedSha256) {
      throw new Error(`Platform clip ${config.id} SHA-256 does not match the reviewed digest`);
    }
    return {
      config,
      inputPath,
      expectedSha256,
      sourceRevision: sourceRevision(config, environment),
    };
  }));
}

async function writePlatformLabel(path: string, text: string): Promise<void> {
  const cues = createSubtitleCues(
    [{ id: "platform-label", text, startMs: 0, endMs: 24 * 60 * 60 * 1_000 }],
    { maxCharactersPerLine: 72, maxLinesPerCue: 2 },
  );
  await writeSrtFile(path, cues);
  await ensurePrivateFile(path);
}

export async function composeScenarioPlatformClips(options: {
  scenario: DemoScenario;
  workDir: string;
  webVideoPath: string;
  outputVideoPath: string;
  environment?: RuntimeEnvironment;
}): Promise<PlatformClipCompositionResult> {
  if (options.scenario.platformClips.length === 0) {
    throw new Error("Platform clip composition requires at least one configured native clip");
  }
  const resolved = await validatePlatformClipInputs(options.scenario, options.environment);
  const snapshotDirectory = await mkdtemp(join(options.workDir, ".platform-input-"));
  await ensurePrivateDirectory(snapshotDirectory);
  const labelDirectory = join(options.workDir, "platform-labels");
  await ensurePrivateDirectory(labelDirectory);
  const webLabelPath = join(labelDirectory, "00-web.srt");
  await writePlatformLabel(webLabelPath, "Web — Playwright Chromium recording");

  try {
    const snapshots = await Promise.all(resolved.map(async (entry, index) => {
      const snapshotPath = join(snapshotDirectory, `${String(index + 1).padStart(2, "0")}-${entry.config.id}.bin`);
      await copyFile(entry.inputPath, snapshotPath);
      await ensurePrivateFile(snapshotPath);
      if (await sha256File(snapshotPath) !== entry.expectedSha256) {
        throw new Error(`Platform clip ${entry.config.id} changed while it was being prepared`);
      }
      const labelPath = join(
        labelDirectory,
        `${String(index + 1).padStart(2, "0")}-${entry.config.id}.srt`,
      );
      const platformName = entry.config.platform === "ios" ? "iOS" : "Android";
      await writePlatformLabel(
        labelPath,
        `${platformName}: ${entry.config.title} — externally recorded native clip`,
      );
      return { entry, snapshotPath, labelPath };
    }));

    const composed: ComposeVideoClipsResult = await composeVideoClips({
      sources: [
        {
          id: "web-playwright",
          filePath: options.webVideoPath,
          audio: "preserve",
          labelFilePath: webLabelPath,
        },
        ...snapshots.map(({ entry, snapshotPath, labelPath }) => ({
          id: entry.config.id,
          filePath: snapshotPath,
          audio: entry.config.audio,
          labelFilePath: labelPath,
        })),
      ],
      outputVideoPath: options.outputVideoPath,
      width: options.scenario.render.width,
      height: options.scenario.render.height,
      fps: options.scenario.render.fps,
      crf: options.scenario.render.crf,
      preset: options.scenario.render.preset,
      ffmpeg: options.scenario.binaries.ffmpeg,
      ffprobe: options.scenario.binaries.ffprobe,
    });
    const sourceById = new Map(composed.sources.map((source) => [source.id, source]));
    const webSource = sourceById.get("web-playwright");
    if (!webSource) throw new Error("Composed video is missing its Playwright Web source");
    return {
      outputVideoPath: composed.outputVideoPath,
      webVideoPath: options.webVideoPath,
      webDurationMs: webSource.durationMs,
      webLabelPath,
      platformClips: snapshots.map(({ entry, labelPath }) => {
        const source = sourceById.get(entry.config.id);
        if (!source) throw new Error(`Composed video is missing platform clip ${entry.config.id}`);
        return {
          id: entry.config.id,
          title: entry.config.title,
          platform: entry.config.platform,
          captureMethod: "external-native-recording" as const,
          sourceRevision: entry.sourceRevision,
          privacyReviewed: true as const,
          audioPolicy: entry.config.audio,
          sourceSha256: entry.expectedSha256,
          sourceDurationMs: source.durationMs,
          sourceHasAudio: source.hasAudio,
          labelPath,
        };
      }),
      outputDurationMs: composed.outputDurationMs,
      actualOutputDurationMs: composed.actualOutputDurationMs,
    };
  } finally {
    await rm(snapshotDirectory, { recursive: true, force: true });
  }
}
