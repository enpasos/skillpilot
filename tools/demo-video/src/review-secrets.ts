import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { z } from "zod";

import { assertPrivateInputFile } from "./private-fs.js";
import type { DemoScenario, NativePlatform } from "./types.js";

const clipSecretSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  platform: z.enum(["ios", "android"]),
  path: z.string().trim().min(1),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
  privacyReviewed: z.literal(true),
}).strict();

const reviewSecretsSchema = z.object({
  schemaVersion: z.literal(1),
  openAiApiKey: z.string().trim().min(1),
  browserProfilePath: z.string().trim().min(1).optional(),
  platformClips: z.array(clipSecretSchema).default([]),
}).strict();

interface ReviewClipSecret {
  id: string;
  platform: NativePlatform;
  path: string;
  sha256: string;
  sourceRevision: string;
  privacyReviewed: true;
}

export interface ReviewSecrets {
  openAiApiKey: string;
  environment: Record<string, string>;
  sensitiveValues: string[];
}

function requireEnvironmentBinding(
  value: string | undefined,
  clipId: string,
  label: string,
): string {
  if (!value) {
    throw new Error(`Review platform clip ${clipId} must bind ${label} through a protected runtime name`);
  }
  return value;
}

function mapClipEnvironment(
  scenario: DemoScenario,
  suppliedClips: ReviewClipSecret[],
): Record<string, string> {
  const suppliedById = new Map<string, ReviewClipSecret>();
  for (const supplied of suppliedClips) {
    if (suppliedById.has(supplied.id)) {
      throw new Error(`Review secrets contain duplicate platform clip id ${supplied.id}`);
    }
    if (!isAbsolute(supplied.path)) {
      throw new Error(`Review platform clip ${supplied.id} path must be absolute`);
    }
    suppliedById.set(supplied.id, { ...supplied, path: resolve(supplied.path) });
  }

  const expectedIds = new Set(scenario.platformClips.map((clip) => clip.id));
  if (suppliedById.size !== expectedIds.size
    || [...suppliedById.keys()].some((id) => !expectedIds.has(id))) {
    throw new Error("Review secrets must provide exactly the platform clips declared by the scenario");
  }

  const environment: Record<string, string> = {};
  for (const clip of scenario.platformClips) {
    const supplied = suppliedById.get(clip.id);
    if (!supplied) throw new Error(`Review secrets are missing platform clip ${clip.id}`);
    if (supplied.platform !== clip.platform) {
      throw new Error(`Review platform clip ${clip.id} has the wrong native platform`);
    }
    environment[requireEnvironmentBinding(clip.pathFromEnv, clip.id, "path")] = supplied.path;
    environment[
      requireEnvironmentBinding(clip.expectedSha256FromEnv, clip.id, "SHA-256")
    ] = supplied.sha256;
    environment[
      requireEnvironmentBinding(clip.sourceRevisionFromEnv, clip.id, "source revision")
    ] = supplied.sourceRevision;
    environment[
      requireEnvironmentBinding(clip.privacyReviewedFromEnv, clip.id, "privacy review")
    ] = "true";
  }
  return environment;
}

function mapBrowserProfileEnvironment(
  scenario: DemoScenario,
  suppliedPath: string | undefined,
): Record<string, string> {
  const environmentName = scenario.browser.persistentProfilePathFromEnv;
  if (!environmentName) {
    if (suppliedPath !== undefined) {
      throw new Error("Review secrets provide a browser profile but the scenario declares no runtime binding");
    }
    return {};
  }
  if (!suppliedPath) {
    throw new Error("Review secrets must provide browserProfilePath for the persistent Chromium profile");
  }
  if (!isAbsolute(suppliedPath)) {
    throw new Error("Review browser profile path must be absolute");
  }
  return { [environmentName]: resolve(suppliedPath) };
}

export async function loadReviewSecrets(
  path: string,
  scenario: DemoScenario,
): Promise<ReviewSecrets> {
  await assertPrivateInputFile(path, "SkillPilot review secrets file");
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(path, "utf8"));
  } catch {
    throw new Error("SkillPilot review secrets file must contain valid JSON");
  }
  const parsed = reviewSecretsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("SkillPilot review secrets file does not match the required strict schema");
  }
  const environment = {
    ...mapBrowserProfileEnvironment(scenario, parsed.data.browserProfilePath),
    ...mapClipEnvironment(scenario, parsed.data.platformClips),
  };
  return {
    openAiApiKey: parsed.data.openAiApiKey,
    environment,
    sensitiveValues: [
      parsed.data.openAiApiKey,
      ...(parsed.data.browserProfilePath ? [resolve(parsed.data.browserProfilePath)] : []),
      ...parsed.data.platformClips.map((clip) => resolve(clip.path)),
    ],
  };
}
