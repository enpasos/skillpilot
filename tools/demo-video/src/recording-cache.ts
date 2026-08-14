import { randomUUID } from "node:crypto";
import { access, readFile, rename, rm } from "node:fs/promises";
import { basename, join, normalize, sep } from "node:path";

import { sha256File } from "./hash.js";
import { ensurePrivateDirectory, ensurePrivateFile, writePrivateFile } from "./private-fs.js";
import type { RecordingResult, TimelineEvent } from "./types.js";

interface RecordingCacheMetadata {
  schemaVersion: 1;
  durationMs: number;
  browserVersion: string;
  videoSha256: string;
  timelineSha256: string;
  screenshots: Array<{ fileName: string; sha256: string }>;
}

export interface RecordingGeneration {
  temporaryDirectory: string;
  temporaryVideoPath: string;
  temporaryScreenshotsPath: string;
  timeline: TimelineEvent[];
  durationMs: number;
  browserVersion: string;
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

function finalPaths(workDir: string) {
  return {
    videoPath: join(workDir, "recording.webm"),
    timelinePath: join(workDir, "timeline.json"),
    metadataPath: join(workDir, "recording.json"),
    screenshotsPath: join(workDir, "screenshots"),
  };
}

async function replaceFile(source: string, destination: string): Promise<void> {
  try {
    // POSIX rename-over-target is atomic. Windows rejects an existing target,
    // so only that platform behavior falls back to remove-then-rename.
    await rename(source, destination);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (process.platform !== "win32"
        || (code !== "EEXIST" && code !== "EPERM" && code !== "EACCES")) throw error;
    await rm(destination, { force: true });
    await rename(source, destination);
  }
}

async function replaceDirectory(source: string, destination: string): Promise<void> {
  const backup = `${destination}.previous-${randomUUID()}`;
  let hadDestination = false;
  try {
    await rename(destination, backup);
    hadDestination = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  try {
    await rename(source, destination);
  } catch (error) {
    if (hadDestination) await rename(backup, destination).catch(() => undefined);
    throw error;
  }
  if (hadDestination) await rm(backup, { recursive: true, force: true });
}

function screenshotFileNames(timeline: TimelineEvent[]): string[] {
  return timeline.flatMap((event) => event.screenshot ? [basename(event.screenshot)] : []);
}

function persistedTimeline(timeline: TimelineEvent[]): TimelineEvent[] {
  return timeline.map((event) => event.screenshot
    ? { ...event, screenshot: ["screenshots", basename(event.screenshot)].join("/") }
    : event);
}

function materializeTimeline(workDir: string, timeline: TimelineEvent[]): TimelineEvent[] | undefined {
  const expectedPrefix = `screenshots${sep}`;
  const materialized: TimelineEvent[] = [];
  for (const event of timeline) {
    if (!event.screenshot) {
      materialized.push(event);
      continue;
    }
    const portablePath = normalize(event.screenshot.replaceAll("/", sep));
    if (!portablePath.startsWith(expectedPrefix)
        || portablePath.slice(expectedPrefix.length).includes(sep)
        || basename(portablePath) !== portablePath.slice(expectedPrefix.length)) {
      return undefined;
    }
    materialized.push({ ...event, screenshot: join(workDir, portablePath) });
  }
  return materialized;
}

/**
 * Publishes a complete recording generation. `recording.json` is the commit
 * marker and is replaced last, so a crash can never make a partial generation
 * reusable as a valid cache entry.
 */
export async function publishRecordingGeneration(
  workDir: string,
  generation: RecordingGeneration,
): Promise<RecordingResult> {
  const paths = finalPaths(workDir);
  const temporaryTimelinePath = join(generation.temporaryDirectory, "timeline.json");
  const temporaryMetadataPath = join(generation.temporaryDirectory, "recording.json");
  const portableTimeline = persistedTimeline(generation.timeline);
  await writePrivateFile(temporaryTimelinePath, `${JSON.stringify(portableTimeline, null, 2)}\n`, { encoding: "utf8" });

  const screenshots = await Promise.all(screenshotFileNames(generation.timeline).map(async (fileName) => ({
    fileName,
    sha256: await sha256File(join(generation.temporaryScreenshotsPath, fileName)),
  })));
  const metadata: RecordingCacheMetadata = {
    schemaVersion: 1,
    durationMs: generation.durationMs,
    browserVersion: generation.browserVersion,
    videoSha256: await sha256File(generation.temporaryVideoPath),
    timelineSha256: await sha256File(temporaryTimelinePath),
    screenshots,
  };
  await writePrivateFile(temporaryMetadataPath, `${JSON.stringify(metadata, null, 2)}\n`, { encoding: "utf8" });

  await ensurePrivateDirectory(workDir);
  await rm(paths.metadataPath, { force: true });
  await replaceDirectory(generation.temporaryScreenshotsPath, paths.screenshotsPath);
  await replaceFile(generation.temporaryVideoPath, paths.videoPath);
  await replaceFile(temporaryTimelinePath, paths.timelinePath);
  await replaceFile(temporaryMetadataPath, paths.metadataPath);
  await ensurePrivateDirectory(paths.screenshotsPath);
  await Promise.all([
    ensurePrivateFile(paths.videoPath),
    ensurePrivateFile(paths.timelinePath),
    ensurePrivateFile(paths.metadataPath),
    ...screenshots.map((screenshot) => ensurePrivateFile(join(paths.screenshotsPath, screenshot.fileName))),
  ]);

  return {
    videoPath: paths.videoPath,
    timelinePath: paths.timelinePath,
    timeline: generation.timeline,
    durationMs: generation.durationMs,
    browserVersion: generation.browserVersion,
  };
}

/** Returns only a complete, hash-consistent recording generation. */
export async function readReusableRecording(workDir: string): Promise<RecordingResult | undefined> {
  const paths = finalPaths(workDir);
  if (!await exists(paths.metadataPath)) return undefined;

  try {
    const metadata = JSON.parse(await readFile(paths.metadataPath, "utf8")) as RecordingCacheMetadata;
    if (metadata.schemaVersion !== 1 || !Number.isSafeInteger(metadata.durationMs) || metadata.durationMs < 0) {
      return undefined;
    }
    if (!metadata.browserVersion || !Array.isArray(metadata.screenshots)) return undefined;
    if (await sha256File(paths.videoPath) !== metadata.videoSha256) return undefined;
    if (await sha256File(paths.timelinePath) !== metadata.timelineSha256) return undefined;
    for (const screenshot of metadata.screenshots) {
      if (!screenshot.fileName || basename(screenshot.fileName) !== screenshot.fileName) return undefined;
      if (await sha256File(join(paths.screenshotsPath, screenshot.fileName)) !== screenshot.sha256) return undefined;
    }
    const persisted = JSON.parse(await readFile(paths.timelinePath, "utf8")) as TimelineEvent[];
    if (!Array.isArray(persisted)) return undefined;
    const timeline = materializeTimeline(workDir, persisted);
    if (!timeline) return undefined;
    return {
      videoPath: paths.videoPath,
      timelinePath: paths.timelinePath,
      timeline,
      durationMs: metadata.durationMs,
      browserVersion: metadata.browserVersion,
    };
  } catch {
    return undefined;
  }
}

export async function invalidateRecordingCache(workDir: string): Promise<void> {
  await rm(finalPaths(workDir).metadataPath, { force: true });
}
