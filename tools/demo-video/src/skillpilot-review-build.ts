import { randomUUID } from "node:crypto";
import { rename, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

import { runDoctor } from "./doctor.js";
import {
  createPersistentProfileSnapshot,
  persistentProfilePath,
} from "./persistent-browser-profile.js";
import { buildPipeline, scenarioWorkDir, type PipelineOptions } from "./pipeline.js";
import { validatePlatformClipInputs } from "./platform-clips.js";
import { ensurePrivateDirectory, ensurePrivateFile, writePrivateFile } from "./private-fs.js";
import {
  validateNativeClipMedia,
  validatePlaywrightStorageState,
} from "./review-input-preflight.js";
import { validateChatGptReviewBrowser } from "./review-browser-preflight.js";
import {
  cleanupPendingSkillPilotReviewFixtures,
  prepareSkillPilotReviewFixtures,
  type SkillPilotReviewFixtures,
} from "./skillpilot-review-fixtures.js";
import type { BuildArtifacts } from "./types.js";

export interface SkillPilotReviewBuildResult {
  artifacts: BuildArtifacts;
  learnerCount: number;
}

export interface SkillPilotReviewPreflightResult {
  doctorChecks: number;
  storageCookies: number;
  storageOrigins: number;
  browserAuthentication: "storage-state" | "persistent-profile";
  platformClips: number;
}

export interface SkillPilotReviewBuildDependencies {
  runDoctor: typeof runDoctor;
  validateStorageState: typeof validatePlaywrightStorageState;
  validatePlatformInputs: typeof validatePlatformClipInputs;
  validateNativeMedia: typeof validateNativeClipMedia;
  validateReviewBrowser: typeof validateChatGptReviewBrowser;
  createProfileSnapshot: typeof createPersistentProfileSnapshot;
  cleanupPendingFixtures: typeof cleanupPendingSkillPilotReviewFixtures;
  prepareFixtures: typeof prepareSkillPilotReviewFixtures;
  build: typeof buildPipeline;
}

const defaultDependencies: SkillPilotReviewBuildDependencies = {
  runDoctor,
  validateStorageState: validatePlaywrightStorageState,
  validatePlatformInputs: validatePlatformClipInputs,
  validateNativeMedia: validateNativeClipMedia,
  validateReviewBrowser: validateChatGptReviewBrowser,
  createProfileSnapshot: createPersistentProfileSnapshot,
  cleanupPendingFixtures: cleanupPendingSkillPilotReviewFixtures,
  prepareFixtures: prepareSkillPilotReviewFixtures,
  build: buildPipeline,
};

async function assertPrivateWritableDirectory(path: string): Promise<void> {
  await ensurePrivateDirectory(path);
  const probe = join(path, `.review-preflight-${randomUUID()}`);
  try {
    await writePrivateFile(probe, "private review preflight\n", { encoding: "utf8" });
  } finally {
    await rm(probe, { force: true });
  }
}

async function invalidateCompletionMarkers(workDir: string): Promise<void> {
  await Promise.all([
    rm(join(workDir, "manifest.json"), { force: true }),
    rm(join(workDir, "manifest.pending.json"), { force: true }),
  ]);
}

function cleanupLedgerPath(options: PipelineOptions): string {
  // Stable across source revisions so a later run can recover an interrupted
  // generation even when production has been redeployed meanwhile.
  return join(options.scenario.outputDir, ".skillpilot-review-pending-cleanup.json");
}

async function promoteCompletionMarker(artifacts: BuildArtifacts): Promise<BuildArtifacts> {
  if (basename(artifacts.manifestPath) !== "manifest.pending.json") {
    throw new Error("Review build did not produce a deferred completion manifest");
  }
  const finalPath = join(dirname(artifacts.manifestPath), "manifest.json");
  await rm(finalPath, { force: true });
  await rename(artifacts.manifestPath, finalPath);
  await ensurePrivateFile(finalPath);
  return { ...artifacts, manifestPath: finalPath };
}

interface PreparedReviewProfile {
  options: PipelineOptions;
  cleanup(): Promise<void>;
}

async function prepareReviewProfile(
  options: PipelineOptions,
  dependencies: SkillPilotReviewBuildDependencies,
): Promise<PreparedReviewProfile> {
  const sourcePath = persistentProfilePath(options.scenario, options.environment);
  if (!sourcePath) return { options, cleanup: async () => undefined };
  const environmentName = options.scenario.browser.persistentProfilePathFromEnv;
  if (!environmentName) throw new Error("Persistent profile runtime binding is missing");
  const snapshot = await dependencies.createProfileSnapshot(
    sourcePath,
    join(options.scenario.cacheDir, "browser-profiles"),
  );
  return {
    options: {
      ...options,
      environment: {
        ...options.environment,
        [environmentName]: snapshot.path,
      },
    },
    cleanup: snapshot.cleanup,
  };
}

async function withPreparedReviewProfile<T>(
  options: PipelineOptions,
  dependencies: SkillPilotReviewBuildDependencies,
  operation: (
    preparedOptions: PipelineOptions,
    cleanupProfile: () => Promise<void>,
  ) => Promise<T>,
): Promise<T> {
  const prepared = await prepareReviewProfile(options, dependencies);
  let result: T | undefined;
  let operationError: unknown;
  let cleanupError: unknown;
  try {
    result = await operation(prepared.options, prepared.cleanup);
  } catch (error) {
    operationError = error;
  }
  try {
    await prepared.cleanup();
  } catch (error) {
    cleanupError = error;
  }
  if (operationError !== undefined && cleanupError !== undefined) {
    throw new AggregateError(
      [operationError, cleanupError],
      "SkillPilot review operation failed and browser-profile snapshot cleanup was incomplete",
    );
  }
  if (operationError !== undefined) throw operationError;
  if (cleanupError !== undefined) throw cleanupError;
  if (result === undefined) throw new Error("SkillPilot review operation produced no result");
  return result;
}

async function preflightPreparedSkillPilotReviewBuild(
  options: PipelineOptions,
  dependencies: SkillPilotReviewBuildDependencies,
): Promise<SkillPilotReviewPreflightResult> {
  const usesPersistentProfile = Boolean(options.scenario.browser.persistentProfilePathFromEnv);
  if (options.scenario.browser.storageState) {
    throw new Error("SkillPilot v1 review requires a run-owned persistent-profile snapshot, not browser.storageState");
  }
  if (!usesPersistentProfile || !options.scenario.browser.persistentProfileRequiresSnapshot) {
    throw new Error("SkillPilot v1 review requires a run-owned persistent-profile snapshot");
  }
  await dependencies.cleanupPendingFixtures({
    cleanupLedgerPath: cleanupLedgerPath(options),
  });
  const checks = await dependencies.runDoctor(options.scenario, {
    openAiApiKeyConfigured: Boolean(options.narrationClient && options.ttsClient),
  });
  const failedChecks = checks.filter((check) => !check.ok);
  if (failedChecks.length > 0) {
    throw new Error(
      `Review preflight failed: ${failedChecks.map((check) => check.name).join(", ")}`,
    );
  }
  const clips = await dependencies.validatePlatformInputs(
    options.scenario,
    options.environment,
  );
  if (clips.some((clip) => clip.sourceRevision !== options.scenario.sourceRevision)) {
    throw new Error("Every native review clip must identify the same deployed source revision as the Web recording");
  }
  await dependencies.validateNativeMedia(
    clips.map((clip) => ({
      id: clip.config.id,
      filePath: clip.inputPath,
      audioPolicy: clip.config.audio,
    })),
    { ffprobe: options.scenario.binaries.ffprobe },
  );
  await dependencies.validateReviewBrowser(options.scenario, options.environment);
  await assertPrivateWritableDirectory(options.scenario.outputDir);
  await assertPrivateWritableDirectory(options.scenario.cacheDir);
  await assertPrivateWritableDirectory(scenarioWorkDir(options.scenario));
  return {
    doctorChecks: checks.length,
    storageCookies: 0,
    storageOrigins: 0,
    browserAuthentication: "persistent-profile",
    platformClips: clips.length,
  };
}

export async function preflightSkillPilotReviewBuild(
  options: PipelineOptions,
  dependencyOverrides: Partial<SkillPilotReviewBuildDependencies> = {},
): Promise<SkillPilotReviewPreflightResult> {
  const dependencies = { ...defaultDependencies, ...dependencyOverrides };
  return await withPreparedReviewProfile(
    options,
    dependencies,
    async (preparedOptions) => await preflightPreparedSkillPilotReviewBuild(
      preparedOptions,
      dependencies,
    ),
  );
}

function installTerminationCleanup(
  fixtures: SkillPilotReviewFixtures,
  workDir: string,
  cleanupProfile: () => Promise<void>,
): () => void {
  const handlers = new Map<NodeJS.Signals, () => void>();
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    const handler = (): void => {
      // `once` removes this listener first; a second signal keeps the normal
      // immediate-termination behavior while the bounded cleanup is running.
      void fixtures.cleanup()
        .catch(() => undefined)
        .then(cleanupProfile)
        .catch(() => undefined)
        .then(() => invalidateCompletionMarkers(workDir))
        .finally(() => process.kill(process.pid, signal));
    };
    handlers.set(signal, handler);
    process.once(signal, handler);
  }
  return () => {
    for (const [signal, handler] of handlers) process.removeListener(signal, handler);
  };
}

export async function runSkillPilotReviewBuild(
  options: PipelineOptions,
  dependencyOverrides: Partial<SkillPilotReviewBuildDependencies> = {},
): Promise<SkillPilotReviewBuildResult> {
  const dependencies = { ...defaultDependencies, ...dependencyOverrides };
  const workDir = scenarioWorkDir(options.scenario);
  let pendingResult: SkillPilotReviewBuildResult;
  try {
    pendingResult = await withPreparedReviewProfile(
      options,
      dependencies,
      async (preparedOptions, cleanupProfile) => {
      await preflightPreparedSkillPilotReviewBuild(preparedOptions, dependencies);

      const preparedWorkDir = scenarioWorkDir(preparedOptions.scenario);
      // A new production-fixture generation invalidates any earlier completion
      // marker before the first external write.
      await invalidateCompletionMarkers(preparedWorkDir);
      const fixtures = await dependencies.prepareFixtures({
        cleanupLedgerPath: cleanupLedgerPath(preparedOptions),
      });
      const removeTerminationHandlers = installTerminationCleanup(
        fixtures,
        preparedWorkDir,
        cleanupProfile,
      );
      let buildError: unknown;
      let cleanupError: unknown;
      let artifacts: BuildArtifacts | undefined;
      try {
        try {
          artifacts = await dependencies.build({
            ...preparedOptions,
            environment: { ...preparedOptions.environment, ...fixtures.environment },
            force: true,
            reuseRecording: false,
            refreshAi: true,
            deferCompletionMarker: true,
          });
        } catch (error) {
          buildError = error;
        }
        try {
          await fixtures.cleanup();
        } catch (error) {
          cleanupError = error;
        }
      } finally {
        removeTerminationHandlers();
      }

      if (buildError !== undefined || cleanupError !== undefined) {
        await invalidateCompletionMarkers(preparedWorkDir);
        if (buildError !== undefined && cleanupError !== undefined) {
          throw new AggregateError(
            [buildError, cleanupError],
            "SkillPilot review build failed and disposable learner cleanup was incomplete",
          );
        }
        if (cleanupError !== undefined) throw cleanupError;
        throw buildError;
      }
      if (!artifacts) throw new Error("SkillPilot review build produced no artifacts");
      return {
        artifacts,
        learnerCount: fixtures.learnerCount,
      };
      },
    );
  } catch (error) {
    try {
      await invalidateCompletionMarkers(workDir);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "SkillPilot review failed and completion-marker invalidation was incomplete",
      );
    }
    throw error;
  }

  try {
    return {
      ...pendingResult,
      artifacts: await promoteCompletionMarker(pendingResult.artifacts),
    };
  } catch (error) {
    try {
      await invalidateCompletionMarkers(workDir);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "SkillPilot review manifest promotion failed and marker invalidation was incomplete",
      );
    }
    throw error;
  }
}
