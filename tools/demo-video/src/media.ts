import { rename, rm } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { runProcess } from "./process.js";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";

export interface MediaBinaryPaths {
  ffmpeg?: string;
  ffprobe?: string;
}

export interface NarrationAudioSource {
  id: string;
  filePath: string;
  preferredStartMs?: number | undefined;
}

export interface ScheduledNarrationAudio {
  id: string;
  filePath: string;
  startMs: number;
  durationMs: number;
  endMs: number;
}

export interface VideoHoldPoint {
  /** Timestamp in the unmodified source recording. */
  atMs: number;
  durationMs: number;
}

export interface NarrationScheduleOptions extends MediaBinaryPaths {
  initialStartMs?: number;
  minimumGapMs?: number;
}

export interface ClickFocusPoint {
  atMs: number;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface AutoZoomOptions {
  enabled?: boolean;
  maxScale?: number;
  durationMs?: number;
  leadInMs?: number;
}

export interface SubtitleBurnInOptions {
  filePath: string;
  fontsDirectory?: string;
  fontName?: string;
  fontSize?: number;
  marginBottom?: number;
}

export interface RenderPlanOptions {
  inputVideoPath: string;
  outputVideoPath: string;
  sourceVideoDurationMs: number;
  outputDurationMs: number;
  audioSegments?: readonly ScheduledNarrationAudio[];
  videoHolds?: readonly VideoHoldPoint[];
  clickFocusPoints?: readonly ClickFocusPoint[];
  autoZoom?: AutoZoomOptions;
  subtitles?: SubtitleBurnInOptions;
  width?: number;
  height?: number;
  fps?: number;
  crf?: number;
  preset?: string;
  audioBitrate?: string;
}

export interface FfmpegRenderPlan {
  args: string[];
  filterComplex: string;
  outputDurationMs: number;
}

export interface RenderVideoOptions
  extends Omit<
      RenderPlanOptions,
      "sourceVideoDurationMs" | "outputDurationMs" | "outputVideoPath"
    >,
    MediaBinaryPaths {
  outputVideoPath: string;
  tailPaddingMs?: number;
  timeoutMs?: number;
}

export interface RenderVideoResult {
  outputVideoPath: string;
  sourceVideoDurationMs: number;
  requestedOutputDurationMs: number;
  actualOutputDurationMs: number;
  ffmpegArgs: readonly string[];
}

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_FPS = 30;

function requireNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
}

function requirePositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive integer`);
  }
}

function seconds(milliseconds: number): string {
  return (milliseconds / 1_000).toFixed(3);
}

export async function probeMediaDurationMs(
  filePath: string,
  options: MediaBinaryPaths = {},
): Promise<number> {
  const ffprobe = options.ffprobe ?? "ffprobe";
  const result = await runProcess(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    filePath,
  ]);

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (cause) {
    throw new Error(`ffprobe returned invalid JSON for ${filePath}`, { cause });
  }
  const rawDuration = (parsed as { format?: { duration?: unknown } }).format
    ?.duration;
  const durationSeconds =
    typeof rawDuration === "number"
      ? rawDuration
      : typeof rawDuration === "string"
        ? Number.parseFloat(rawDuration)
        : Number.NaN;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`ffprobe did not report a positive duration for ${filePath}`);
  }
  // Rounding up avoids trimming the last partial millisecond of a TTS asset.
  return Math.ceil(durationSeconds * 1_000);
}

/**
 * Probes each TTS asset and creates a non-overlapping narration timeline. A
 * preferred timestamp is treated as a lower bound; long preceding narration
 * moves later segments forward instead of mixing two voices on top of each
 * other.
 */
export async function scheduleNarrationAudio(
  sources: readonly NarrationAudioSource[],
  options: NarrationScheduleOptions = {},
): Promise<ScheduledNarrationAudio[]> {
  const initialStartMs = options.initialStartMs ?? 0;
  const minimumGapMs = options.minimumGapMs ?? 120;
  requireNonNegativeInteger(initialStartMs, "initialStartMs");
  requireNonNegativeInteger(minimumGapMs, "minimumGapMs");

  const scheduled: ScheduledNarrationAudio[] = [];
  let cursorMs = initialStartMs;
  for (const source of sources) {
    if (!source.id.trim()) throw new TypeError("Narration source IDs must not be empty");
    if (source.preferredStartMs !== undefined) {
      requireNonNegativeInteger(source.preferredStartMs, "preferredStartMs");
    }
    const durationMs = await probeMediaDurationMs(source.filePath, options);
    const startMs = Math.max(source.preferredStartMs ?? cursorMs, cursorMs);
    const endMs = startMs + durationMs;
    scheduled.push({ ...source, startMs, durationMs, endMs });
    cursorMs = endMs + minimumGapMs;
  }
  return scheduled;
}

interface ZoomWindow extends ClickFocusPoint {
  startFrame: number;
  endFrame: number;
  targetX: number;
  targetY: number;
}

function chooseZoomWindows(
  points: readonly ClickFocusPoint[],
  width: number,
  height: number,
  fps: number,
  options: Required<Pick<AutoZoomOptions, "durationMs" | "leadInMs">>,
): ZoomWindow[] {
  const candidates = [...points]
    .sort((left, right) => left.atMs - right.atMs)
    .map((point) => {
      requireNonNegativeInteger(point.atMs, "clickFocusPoint.atMs");
      if (
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        !Number.isFinite(point.viewportWidth) ||
        !Number.isFinite(point.viewportHeight) ||
        point.viewportWidth <= 0 ||
        point.viewportHeight <= 0
      ) {
        throw new TypeError("Click focus coordinates and viewport dimensions must be finite");
      }
      const startMs = Math.max(0, point.atMs - options.leadInMs);
      const endMs = startMs + options.durationMs;
      const fitScale = Math.min(width / point.viewportWidth, height / point.viewportHeight);
      const fittedWidth = point.viewportWidth * fitScale;
      const fittedHeight = point.viewportHeight * fitScale;
      const offsetX = (width - fittedWidth) / 2;
      const offsetY = (height - fittedHeight) / 2;
      return {
        ...point,
        startFrame: Math.round((startMs * fps) / 1_000),
        endFrame: Math.max(
          Math.round((endMs * fps) / 1_000),
          Math.round((startMs * fps) / 1_000) + 1,
        ),
        targetX: Math.max(0, Math.min(width, offsetX + point.x * fitScale)),
        targetY: Math.max(0, Math.min(height, offsetY + point.y * fitScale)),
      };
    });

  // Overlapping zoom windows tend to create distracting camera jumps. Keep the
  // first click in a cluster and resume automatic focusing after it has eased
  // back to 1x.
  const chosen: ZoomWindow[] = [];
  for (const candidate of candidates) {
    const previous = chosen.at(-1);
    if (!previous || candidate.startFrame > previous.endFrame) {
      chosen.push(candidate);
    }
  }
  return chosen;
}

function nestedExpression(
  windows: readonly ZoomWindow[],
  expression: (window: ZoomWindow) => string,
  fallback: string,
): string {
  return windows.reduceRight(
    (otherwise, window) =>
      `if(between(on,${window.startFrame},${window.endFrame}),${expression(window)},${otherwise})`,
    fallback,
  );
}

/** Returns a complete `zoompan` filter or undefined when no focus is active. */
export function buildAutoZoomFilter(
  points: readonly ClickFocusPoint[],
  dimensions: { width: number; height: number; fps: number },
  options: AutoZoomOptions = {},
): string | undefined {
  if (options.enabled === false || points.length === 0) return undefined;
  const { width, height, fps } = dimensions;
  requirePositiveInteger(width, "width");
  requirePositiveInteger(height, "height");
  requirePositiveInteger(fps, "fps");
  const maxScale = options.maxScale ?? 1.12;
  const durationMs = options.durationMs ?? 1_400;
  const leadInMs = options.leadInMs ?? 180;
  if (!Number.isFinite(maxScale) || maxScale <= 1 || maxScale > 2) {
    throw new RangeError("autoZoom.maxScale must be greater than 1 and at most 2");
  }
  requirePositiveInteger(durationMs, "autoZoom.durationMs");
  requireNonNegativeInteger(leadInMs, "autoZoom.leadInMs");

  const windows = chooseZoomWindows(points, width, height, fps, {
    durationMs,
    leadInMs,
  });
  if (windows.length === 0) return undefined;

  const scaleDelta = (maxScale - 1).toFixed(6);
  const zoom = nestedExpression(
    windows,
    (window) =>
      `1+${scaleDelta}*sin(PI*(on-${window.startFrame})/${window.endFrame - window.startFrame})`,
    "1",
  );
  const x = nestedExpression(
    windows,
    (window) =>
      `max(0,min(iw-iw/zoom,${window.targetX.toFixed(3)}-iw/(2*zoom)))`,
    "0",
  );
  const y = nestedExpression(
    windows,
    (window) =>
      `max(0,min(ih-ih/zoom,${window.targetY.toFixed(3)}-ih/(2*zoom)))`,
    "0",
  );
  return `zoompan=z='${zoom}':x='${x}':y='${y}':d=1:s=${width}x${height}:fps=${fps}`;
}

/** Escapes an absolute path for a quoted libavfilter option value. */
export function escapeFfmpegFilterPath(filePath: string): string {
  return path
    .resolve(filePath)
    .replaceAll("\\", "/")
    .replace(/([:\[\],;])/g, "\\$1")
    .replaceAll("'", "\\'");
}

function subtitleFilter(options: SubtitleBurnInOptions): string {
  const styleParts = [
    `FontSize=${options.fontSize ?? 22}`,
    "PrimaryColour=&H00FFFFFF",
    "OutlineColour=&H90000000",
    "BorderStyle=1",
    "Outline=2",
    "Shadow=0",
    "Alignment=2",
    `MarginV=${options.marginBottom ?? 48}`,
  ];
  if (options.fontName) {
    if (/[:,;'\[\]]/.test(options.fontName)) {
      throw new TypeError("Subtitle fontName contains unsupported punctuation");
    }
    styleParts.unshift(`FontName=${options.fontName}`);
  }
  const fontsDirectory = options.fontsDirectory
    ? `:fontsdir='${escapeFfmpegFilterPath(options.fontsDirectory)}'`
    : "";
  return `subtitles=filename='${escapeFfmpegFilterPath(options.filePath)}'${fontsDirectory}:charenc=UTF-8:force_style='${styleParts.join(",")}'`;
}

function validateScheduledAudio(
  segments: readonly ScheduledNarrationAudio[],
): ScheduledNarrationAudio[] {
  const sorted = [...segments].sort((left, right) => left.startMs - right.startMs);
  let previousEndMs = 0;
  sorted.forEach((segment, index) => {
    requireNonNegativeInteger(segment.startMs, "audioSegment.startMs");
    requirePositiveInteger(segment.durationMs, "audioSegment.durationMs");
    if (segment.endMs !== segment.startMs + segment.durationMs) {
      throw new RangeError("audioSegment.endMs must equal startMs + durationMs");
    }
    if (index > 0 && segment.startMs < previousEndMs) {
      throw new RangeError("Scheduled narration audio must not overlap");
    }
    previousEndMs = segment.endMs;
  });
  return sorted;
}

function validateVideoHolds(
  holds: readonly VideoHoldPoint[],
  sourceVideoDurationMs: number,
): VideoHoldPoint[] {
  const sorted = [...holds].sort((left, right) => left.atMs - right.atMs);
  const merged: VideoHoldPoint[] = [];
  for (const hold of sorted) {
    requireNonNegativeInteger(hold.atMs, "videoHold.atMs");
    requirePositiveInteger(hold.durationMs, "videoHold.durationMs");
    if (hold.atMs > sourceVideoDurationMs) {
      throw new RangeError("Video holds must be inside the source recording");
    }
    const previous = merged.at(-1);
    if (previous?.atMs === hold.atMs) previous.durationMs += hold.durationMs;
    else merged.push({ ...hold });
  }
  return merged;
}

function pacedVideoInput(
  holds: readonly VideoHoldPoint[],
  sourceVideoDurationMs: number,
  fps: number,
): { filters: string[]; input: string; durationMs: number } {
  if (holds.length === 0) {
    return { filters: [], input: "[0:v]", durationMs: sourceVideoDurationMs };
  }
  const frameMs = 1_000 / fps;
  const normalized = validateVideoHolds(
    holds.map((hold) => ({
      ...hold,
      atMs: hold.atMs === 0 ? Math.min(sourceVideoDurationMs, frameMs) : hold.atMs,
    })),
    sourceVideoDurationMs,
  );
  const sourceCount = normalized.length + (normalized.at(-1)!.atMs < sourceVideoDurationMs ? 1 : 0);
  const sourceLabels = sourceCount === 1
    ? ["[0:v]"]
    : Array.from({ length: sourceCount }, (_, index) => `[holdsrc${index}]`);
  const filters = sourceCount === 1
    ? []
    : [`[0:v]split=${sourceCount}${sourceLabels.join("")}`];
  const outputLabels: string[] = [];
  let startMs = 0;
  normalized.forEach((hold, index) => {
    const output = `[holdpart${index}]`;
    filters.push(
      `${sourceLabels[index]}trim=start=${seconds(startMs)}:end=${seconds(hold.atMs)},` +
      `setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${seconds(hold.durationMs)}${output}`,
    );
    outputLabels.push(output);
    startMs = hold.atMs;
  });
  if (startMs < sourceVideoDurationMs) {
    const index = outputLabels.length;
    const output = `[holdpart${index}]`;
    filters.push(
      `${sourceLabels[index]}trim=start=${seconds(startMs)}:end=${seconds(sourceVideoDurationMs)},` +
      `setpts=PTS-STARTPTS${output}`,
    );
    outputLabels.push(output);
  }
  filters.push(`${outputLabels.join("")}concat=n=${outputLabels.length}:v=1:a=0[vpaced]`);
  return {
    filters,
    input: "[vpaced]",
    durationMs: sourceVideoDurationMs + normalized.reduce((total, hold) => total + hold.durationMs, 0),
  };
}

export function buildFfmpegRenderPlan(options: RenderPlanOptions): FfmpegRenderPlan {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const fps = options.fps ?? DEFAULT_FPS;
  requirePositiveInteger(width, "width");
  requirePositiveInteger(height, "height");
  requirePositiveInteger(fps, "fps");
  requirePositiveInteger(options.sourceVideoDurationMs, "sourceVideoDurationMs");
  requirePositiveInteger(options.outputDurationMs, "outputDurationMs");
  const holds = validateVideoHolds(options.videoHolds ?? [], options.sourceVideoDurationMs);
  const pacedVideo = pacedVideoInput(holds, options.sourceVideoDurationMs, fps);
  if (options.outputDurationMs < pacedVideo.durationMs) {
    throw new RangeError("outputDurationMs must not truncate the paced source video");
  }
  const audio = validateScheduledAudio(options.audioSegments ?? []);
  const latestAudioEnd = audio.at(-1)?.endMs ?? 0;
  if (latestAudioEnd > options.outputDurationMs) {
    throw new RangeError("outputDurationMs must include every narration segment");
  }

  const args = ["-y", "-nostdin", "-hide_banner", "-loglevel", "warning"];
  args.push("-i", options.inputVideoPath);
  audio.forEach((segment) => args.push("-i", segment.filePath));

  const filters: string[] = [...pacedVideo.filters];
  const padDurationMs = options.outputDurationMs - pacedVideo.durationMs;
  const videoFilters = [
    `fps=${fps}`,
    `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
    "setsar=1",
  ];
  if (padDurationMs > 0) {
    videoFilters.push(`tpad=stop_mode=clone:stop_duration=${seconds(padDurationMs)}`);
  }
  const autoZoom = buildAutoZoomFilter(
    options.clickFocusPoints ?? [],
    { width, height, fps },
    options.autoZoom,
  );
  if (autoZoom) videoFilters.push(autoZoom);
  if (options.subtitles) videoFilters.push(subtitleFilter(options.subtitles));
  filters.push(`${pacedVideo.input}${videoFilters.join(",")}[vout]`);

  filters.push(
    `anullsrc=channel_layout=stereo:sample_rate=48000,atrim=duration=${seconds(options.outputDurationMs)},asetpts=PTS-STARTPTS[silence]`,
  );
  audio.forEach((segment, index) => {
    filters.push(
      `[${index + 1}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asetpts=PTS-STARTPTS,adelay=${segment.startMs}:all=1[a${index}]`,
    );
  });
  const audioInputs = ["[silence]", ...audio.map((_, index) => `[a${index}]`)].join("");
  filters.push(
    `${audioInputs}amix=inputs=${audio.length + 1}:duration=longest:dropout_transition=0:normalize=0,atrim=duration=${seconds(options.outputDurationMs)},alimiter=limit=0.95[aout]`,
  );

  const filterComplex = filters.join(";");
  args.push(
    "-filter_complex",
    filterComplex,
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-map_metadata",
    "-1",
    "-metadata",
    "creation_time=1970-01-01T00:00:00Z",
    "-t",
    seconds(options.outputDurationMs),
    "-c:v",
    "libx264",
    "-preset",
    options.preset ?? "medium",
    "-crf",
    String(options.crf ?? 18),
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    options.audioBitrate ?? "192k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    options.outputVideoPath,
  );
  return { args, filterComplex, outputDurationMs: options.outputDurationMs };
}

export async function renderVideo(
  options: RenderVideoOptions,
): Promise<RenderVideoResult> {
  const ffmpeg = options.ffmpeg ?? "ffmpeg";
  const sourceVideoDurationMs = await probeMediaDurationMs(options.inputVideoPath, options);
  const audio = validateScheduledAudio(options.audioSegments ?? []);
  const holds = validateVideoHolds(options.videoHolds ?? [], sourceVideoDurationMs);
  const pacedVideoDurationMs = sourceVideoDurationMs + holds.reduce(
    (total, hold) => total + hold.durationMs,
    0,
  );
  const latestAudioEnd = audio.at(-1)?.endMs ?? 0;
  const tailPaddingMs = options.tailPaddingMs ?? 500;
  requireNonNegativeInteger(tailPaddingMs, "tailPaddingMs");
  const requestedOutputDurationMs = Math.max(
    pacedVideoDurationMs,
    latestAudioEnd > 0 ? latestAudioEnd + tailPaddingMs : 0,
  );

  if (path.resolve(options.inputVideoPath) === path.resolve(options.outputVideoPath)) {
    throw new Error("The rendered output path must differ from the source video path");
  }
  if (path.extname(options.outputVideoPath).toLowerCase() !== ".mp4") {
    throw new Error("Rendered output must use the .mp4 extension");
  }

  await ensurePrivateDirectory(path.dirname(options.outputVideoPath));
  const temporaryOutput = path.join(
    path.dirname(options.outputVideoPath),
    `.${path.basename(options.outputVideoPath, ".mp4")}.${randomUUID()}.rendering.mp4`,
  );
  const plan = buildFfmpegRenderPlan({
    ...options,
    sourceVideoDurationMs,
    outputDurationMs: requestedOutputDurationMs,
    outputVideoPath: temporaryOutput,
    audioSegments: audio,
    videoHolds: holds,
  });

  try {
    await runProcess(ffmpeg, plan.args, {
      timeoutMs: options.timeoutMs ?? 30 * 60_000,
      maxOutputBytes: 32 * 1024 * 1024,
    });
    try {
      // POSIX rename-over-target preserves an atomic publication boundary.
      // Windows rejects an existing destination; only there do we fall back
      // to remove-then-rename after FFmpeg has completed successfully.
      await rename(temporaryOutput, options.outputVideoPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (process.platform !== "win32"
          || (code !== "EEXIST" && code !== "EPERM" && code !== "EACCES")) throw error;
      await rm(options.outputVideoPath, { force: true });
      await rename(temporaryOutput, options.outputVideoPath);
    }
    await ensurePrivateFile(options.outputVideoPath);
  } catch (error) {
    await rm(temporaryOutput, { force: true });
    throw error;
  }

  const actualOutputDurationMs = await probeMediaDurationMs(
    options.outputVideoPath,
    options,
  );
  return {
    outputVideoPath: options.outputVideoPath,
    sourceVideoDurationMs,
    requestedOutputDurationMs,
    actualOutputDurationMs,
    ffmpegArgs: plan.args.map((argument) =>
      argument === temporaryOutput ? options.outputVideoPath : argument,
    ),
  };
}
