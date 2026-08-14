import { lstat, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

import { assertTextIsPrivate, configuredEnvironmentSecrets } from "./privacy.js";
import { readReusableRecording } from "./recording-cache.js";
import type { DemoScenario, MaskRegion, TimelineEvent } from "./types.js";
import { scenarioWorkDir } from "./workdir.js";

export interface RecordingVerification {
  workDir: string;
  screenshots: number;
  matchingMaskPixels: number;
}

async function assertPrivateModes(root: string): Promise<void> {
  const visit = async (path: string): Promise<void> => {
    const metadata = await lstat(path);
    if (metadata.isSymbolicLink()) throw new Error(`Recording artifact is a symbolic link: ${path}`);
    if (process.platform !== "win32") {
      const expected = metadata.isDirectory() ? 0o700 : 0o600;
      if ((metadata.mode & 0o777) !== expected) {
        throw new Error(`Recording artifact has mode ${(metadata.mode & 0o777).toString(8)}, expected ${expected.toString(8)}: ${path}`);
      }
    }
    if (metadata.isDirectory()) {
      for (const entry of await readdir(path)) await visit(join(path, entry));
    }
  };
  await visit(root);
}

function rgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

async function matchingPixels(
  page: Page,
  dataUrl: string,
  color: [number, number, number],
  regions: MaskRegion[],
): Promise<Array<{ area: number; matches: number; secret: boolean; configured: boolean }>> {
  return page.evaluate(async ({ source, target, masks }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D context unavailable");
      context.drawImage(image, 0, 0);
      const bytes = context.getImageData(0, 0, canvas.width, canvas.height).data;
      return masks.map((mask) => {
        const startX = Math.max(0, Math.floor(mask.x));
        const startY = Math.max(0, Math.floor(mask.y));
        const endX = Math.min(canvas.width, Math.ceil(mask.x + mask.width));
        const endY = Math.min(canvas.height, Math.ceil(mask.y + mask.height));
        let matches = 0;
        let area = 0;
        for (let y = startY; y < endY; y += 1) {
          for (let x = startX; x < endX; x += 1) {
            const index = (y * canvas.width + x) * 4;
            area += 1;
            if (bytes[index] === target[0] && bytes[index + 1] === target[1] && bytes[index + 2] === target[2]) matches += 1;
          }
        }
        return { area, matches, secret: mask.secret, configured: mask.configured };
      });
    }, { source: dataUrl, target: color, masks: regions });
}

export function requiredSecretCaptures(timeline: TimelineEvent[]): TimelineEvent[] {
  return timeline.flatMap((event, index) => {
    if (!event.secretInput) return [];
    const capture = timeline.slice(index).find((candidate) => candidate.screenshot);
    if (!capture) throw new Error(`Secret input ${event.stepId} has no following evidence screenshot`);
    return [capture];
  });
}

export interface MaskVerificationSummary {
  capturedConfiguredMask: boolean;
  matchingMaskPixels: number;
}

export function verifyMaskEvidence(
  event: TimelineEvent,
  results: Array<{ area: number; matches: number; secret: boolean; configured: boolean }>,
  requiresSecretMask: boolean,
): MaskVerificationSummary {
  const opaque = results.filter((result) => result.area >= 20 && result.matches / result.area >= 0.5);
  if (requiresSecretMask && !opaque.some((result) => result.secret)) {
    throw new Error(`Secret input is not visibly protected in evidence screenshot after ${event.stepId}`);
  }
  return {
    capturedConfiguredMask: opaque.some((result) => result.configured),
    matchingMaskPixels: Math.max(...opaque.map((result) => result.matches), 0),
  };
}

export async function verifyPublishedRecording(scenario: DemoScenario): Promise<RecordingVerification> {
  const workDir = scenarioWorkDir(scenario);
  const recording = await readReusableRecording(workDir);
  if (!recording) throw new Error("No complete, hash-consistent recording generation exists");
  const environmentSecrets = configuredEnvironmentSecrets(scenario);
  for (const path of [recording.timelinePath, join(workDir, "recording.json"), join(workDir, "analysis.json")]) {
    assertTextIsPrivate(await readFile(path, "utf8"), scenario.privacy, environmentSecrets, path);
  }
  await assertPrivateModes(workDir);

  const screenshotEvents = recording.timeline.filter((event) => event.screenshot);
  const screenshots = screenshotEvents.map((event) => event.screenshot as string);
  const secretCaptures = new Set(requiredSecretCaptures(recording.timeline));
  let matchingMaskPixelCount = 0;
  let capturedConfiguredMask = false;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const event of screenshotEvents) {
      const regions = event.masks ?? [];
      const bytes = await readFile(event.screenshot as string);
      const results = await matchingPixels(
        page,
        `data:image/png;base64,${bytes.toString("base64")}`,
        rgb(scenario.privacy.maskColor),
        regions,
      );
      const summary = verifyMaskEvidence(event, results, secretCaptures.has(event));
      matchingMaskPixelCount = Math.max(matchingMaskPixelCount, summary.matchingMaskPixels);
      if (summary.capturedConfiguredMask) capturedConfiguredMask = true;
    }
  } finally {
    await browser.close();
  }
  if ((scenario.privacy.maskSelectors.length > 0 || scenario.privacy.maskTextSelectors.length > 0)
      && !capturedConfiguredMask) {
    throw new Error("Configured opaque masks were not visibly exercised in the captured screenshots");
  }
  return { workDir, screenshots: screenshots.length, matchingMaskPixels: matchingMaskPixelCount };
}
