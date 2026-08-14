import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { loadScenario } from "../src/config.js";
import {
  preflightSkillPilotReviewBuild,
  runSkillPilotReviewBuild,
} from "../src/skillpilot-review-build.js";
import { scenarioWorkDir } from "../src/workdir.js";
import type { BuildArtifacts } from "../src/types.js";

function mockReviewProfile(
  scenario: Awaited<ReturnType<typeof loadScenario>>,
  directory: string,
  cleanup: () => Promise<void> = async () => undefined,
): {
  environment: Record<string, string>;
  createProfileSnapshot: (sourcePath: string, snapshotParent: string) => Promise<{
    path: string;
    cleanup(): Promise<void>;
  }>;
} {
  const profileName = scenario.browser.persistentProfilePathFromEnv;
  if (!profileName) throw new Error("Review template has no persistent-profile binding");
  return {
    environment: { [profileName]: join(directory, "operator-profile") },
    createProfileSnapshot: async () => ({
      path: join(directory, "cache", "browser-profiles", "snapshot", "profile"),
      cleanup,
    }),
  };
}

test("standalone review preflight validates a private profile snapshot and deletes it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-profile-preflight-"));
  try {
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    scenario.sourceRevision = "a".repeat(40);
    scenario.outputDir = join(directory, "output");
    scenario.cacheDir = join(directory, "cache");
    const profileName = scenario.browser.persistentProfilePathFromEnv!;
    const sourceProfile = join(directory, "operator-profile");
    const snapshotProfile = join(directory, "cache", "browser-profiles", "snapshot", "profile");
    let snapshotCleanup = 0;
    let browserProfile: string | undefined;
    let storageValidation = 0;

    const result = await preflightSkillPilotReviewBuild({
      scenario,
      scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
      environment: { [profileName]: sourceProfile },
      narrationClient: {} as never,
      ttsClient: {} as never,
    }, {
      createProfileSnapshot: async (path, snapshotParent) => {
        assert.equal(path, sourceProfile);
        assert.equal(snapshotParent, join(scenario.cacheDir, "browser-profiles"));
        return {
          path: snapshotProfile,
          cleanup: async () => { snapshotCleanup += 1; },
        };
      },
      cleanupPendingFixtures: async () => ({ deletedLearnerCount: 0, pendingLearnerCount: 0 }),
      runDoctor: async () => [{ name: "all", ok: true, detail: "ready" }],
      validateStorageState: async () => {
        storageValidation += 1;
        throw new Error("must not validate storage state");
      },
      validatePlatformInputs: async () => scenario.platformClips.map((config) => ({
        config,
        inputPath: join(directory, `${config.id}.mp4`),
        expectedSha256: "c".repeat(64),
        sourceRevision: scenario.sourceRevision,
      })),
      validateNativeMedia: async () => [],
      validateReviewBrowser: async (_scenario, environment) => {
        browserProfile = environment?.[profileName];
        return {
          origin: "https://chatgpt.com",
          composerVisible: true,
          skillPilotAppVisible: true,
        };
      },
    });

    assert.equal(result.browserAuthentication, "persistent-profile");
    assert.equal(result.storageCookies, 0);
    assert.equal(result.storageOrigins, 0);
    assert.equal(browserProfile, snapshotProfile);
    assert.equal(storageValidation, 0);
    assert.equal(snapshotCleanup, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("review build reuses one profile snapshot for preflight and recording then deletes it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-profile-build-"));
  try {
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    scenario.sourceRevision = "d".repeat(40);
    scenario.outputDir = join(directory, "output");
    scenario.cacheDir = join(directory, "cache");
    const profileName = scenario.browser.persistentProfilePathFromEnv!;
    const sourceProfile = join(directory, "operator-profile");
    const snapshotProfile = join(directory, "cache", "browser-profiles", "snapshot", "profile");
    const seenProfiles: string[] = [];
    let snapshotCleanup = 0;
    const workDir = scenarioWorkDir(scenario);

    const result = await runSkillPilotReviewBuild({
      scenario,
      scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
      environment: { [profileName]: sourceProfile },
      narrationClient: {} as never,
      ttsClient: {} as never,
    }, {
      createProfileSnapshot: async () => ({
        path: snapshotProfile,
        cleanup: async () => { snapshotCleanup += 1; },
      }),
      cleanupPendingFixtures: async () => ({ deletedLearnerCount: 0, pendingLearnerCount: 0 }),
      runDoctor: async () => [{ name: "all", ok: true, detail: "ready" }],
      validatePlatformInputs: async () => scenario.platformClips.map((config) => ({
        config,
        inputPath: join(directory, `${config.id}.mp4`),
        expectedSha256: "c".repeat(64),
        sourceRevision: scenario.sourceRevision,
      })),
      validateNativeMedia: async () => [],
      validateReviewBrowser: async (_scenario, environment) => {
        seenProfiles.push(environment?.[profileName] ?? "missing");
        return {
          origin: "https://chatgpt.com",
          composerVisible: true,
          skillPilotAppVisible: true,
        };
      },
      prepareFixtures: async () => ({
        environment: {},
        learnerCount: 6,
        cleanup: async () => undefined,
      }),
      build: (async (options): Promise<BuildArtifacts> => {
        seenProfiles.push(options.environment?.[profileName] ?? "missing");
        assert.equal(snapshotCleanup, 0);
        await mkdir(workDir, { recursive: true, mode: 0o700 });
        const pending = join(workDir, "manifest.pending.json");
        await writeFile(pending, "pending\n", { mode: 0o600 });
        return {
          workDir,
          recording: {
            videoPath: join(workDir, "recording.webm"),
            timelinePath: join(workDir, "timeline.json"),
            timeline: [],
            durationMs: 1,
            browserVersion: "test",
          },
          narrationPath: join(workDir, "narration.json"),
          narration: { title: "", overview: "", disclosure: "", segments: [] },
          subtitlesPath: join(workDir, "subtitles.srt"),
          webVideoPath: join(workDir, "web.mp4"),
          outputVideoPath: join(workDir, "final.mp4"),
          manifestPath: pending,
        };
      }) as typeof import("../src/pipeline.js").buildPipeline,
    });

    assert.deepEqual(seenProfiles, [snapshotProfile, snapshotProfile]);
    assert.equal(snapshotCleanup, 1);
    assert.equal(result.learnerCount, 6);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("review preflight fails before creating any disposable learner", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-preflight-"));
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  scenario.sourceRevision = "a".repeat(40);
  scenario.outputDir = join(directory, "output");
  scenario.cacheDir = join(directory, "cache");
  const profile = mockReviewProfile(scenario, directory);
  let fixtureCalls = 0;

  await assert.rejects(
    runSkillPilotReviewBuild({
      scenario,
      scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
      environment: profile.environment,
      narrationClient: {} as never,
      ttsClient: {} as never,
    }, {
      createProfileSnapshot: profile.createProfileSnapshot,
      runDoctor: async () => [{ name: "playwright-chromium", ok: false, detail: "missing" }],
      prepareFixtures: async () => {
        fixtureCalls += 1;
        throw new Error("must not run");
      },
    }),
    /Review preflight failed: playwright-chromium/u,
  );
  assert.equal(fixtureCalls, 0);
});

test("SkillPilot v1 review rejects legacy storage-state authentication", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-storage-state-rejected-"));
  try {
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    scenario.sourceRevision = "a".repeat(40);
    scenario.outputDir = join(directory, "output");
    scenario.cacheDir = join(directory, "cache");
    scenario.browser.storageState = join(directory, "storage.json");
    const profile = mockReviewProfile(scenario, directory);
    let snapshotCleanup = 0;

    await assert.rejects(
      preflightSkillPilotReviewBuild({
        scenario,
        scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
        environment: profile.environment,
        narrationClient: {} as never,
        ttsClient: {} as never,
      }, {
        createProfileSnapshot: async () => ({
          path: join(directory, "snapshot", "profile"),
          cleanup: async () => { snapshotCleanup += 1; },
        }),
      }),
      /requires a run-owned persistent-profile snapshot, not browser\.storageState/u,
    );
    assert.equal(snapshotCleanup, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("SkillPilot v1 runtime rejects non-browser evidence and user-agent spoofing", async () => {
  const mutations: Array<{
    name: string;
    apply(scenario: Awaited<ReturnType<typeof loadScenario>>): void;
    expected: RegExp;
  }> = [
    {
      name: "mobile-web",
      apply: (scenario) => { scenario.platform = "mobile-web"; },
      expected: /exactly the ChatGPT browser Web surface/u,
    },
    {
      name: "native clip",
      apply: (scenario) => {
        scenario.platformClips = [{
          id: "native-ios",
          title: "must be rejected",
          platform: "ios",
          path: "/private/native.mov",
          expectedSha256: "a".repeat(64),
          sourceRevision: "b".repeat(40),
          privacyReviewed: true,
          audio: "mute",
        }];
      },
      expected: /must not append native platform clips/u,
    },
    {
      name: "custom user agent",
      apply: (scenario) => { scenario.browser.userAgent = "custom-review-agent"; },
      expected: /ordinary user agent without spoofing/u,
    },
  ];

  for (const mutation of mutations) {
    const directory = await mkdtemp(join(tmpdir(), `demo-video-review-${mutation.name}-`));
    try {
      const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
      scenario.sourceRevision = "a".repeat(40);
      scenario.outputDir = join(directory, "output");
      scenario.cacheDir = join(directory, "cache");
      mutation.apply(scenario);
      let cleanupCalls = 0;
      const profile = mockReviewProfile(scenario, directory, async () => { cleanupCalls += 1; });
      await assert.rejects(
        preflightSkillPilotReviewBuild({
          scenario,
          scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
          environment: profile.environment,
          narrationClient: {} as never,
          ttsClient: {} as never,
        }, {
          createProfileSnapshot: profile.createProfileSnapshot,
        }),
        mutation.expected,
      );
      assert.equal(cleanupCalls, 1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
});

test("review preflight recovers pending cleanup before ordered external checks", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-order-"));
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  scenario.sourceRevision = "a".repeat(40);
  scenario.outputDir = join(directory, "output");
  scenario.cacheDir = join(directory, "cache");
  const profile = mockReviewProfile(scenario, directory);
  const order: string[] = [];

  await preflightSkillPilotReviewBuild({
    scenario,
    scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
    environment: profile.environment,
    narrationClient: {} as never,
    ttsClient: {} as never,
  }, {
    createProfileSnapshot: profile.createProfileSnapshot,
    cleanupPendingFixtures: async () => {
      order.push("cleanup-recovery");
      return { deletedLearnerCount: 1, pendingLearnerCount: 0 };
    },
    runDoctor: async () => {
      order.push("doctor");
      return [{ name: "all", ok: true, detail: "ready" }];
    },
    validatePlatformInputs: async () => {
      order.push("platform-inputs");
      return scenario.platformClips.map((config) => ({
        config,
        inputPath: join(directory, `${config.id}.mp4`),
        expectedSha256: "c".repeat(64),
        sourceRevision: scenario.sourceRevision,
      }));
    },
    validateNativeMedia: async () => {
      order.push("native-media");
      return [];
    },
    validateReviewBrowser: async () => {
      order.push("browser");
      return {
        origin: "https://chatgpt.com",
        composerVisible: true,
        skillPilotAppVisible: true,
      };
    },
  });

  assert.deepEqual(order, [
    "cleanup-recovery",
    "doctor",
    "platform-inputs",
    "native-media",
    "browser",
  ]);
});

test("fixture preparation failure leaves no stale review completion marker", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-marker-"));
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  scenario.sourceRevision = "a".repeat(40);
  scenario.outputDir = join(directory, "output");
  scenario.cacheDir = join(directory, "cache");
  const profile = mockReviewProfile(scenario, directory);
  const workDir = scenarioWorkDir(scenario);
  await mkdir(workDir, { recursive: true, mode: 0o700 });
  const markers = [join(workDir, "manifest.json"), join(workDir, "manifest.pending.json")];
  await Promise.all(markers.map((path) => writeFile(path, "stale\n", { mode: 0o600 })));

  await assert.rejects(
    runSkillPilotReviewBuild({
      scenario,
      scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
      environment: profile.environment,
      narrationClient: {} as never,
      ttsClient: {} as never,
    }, {
      createProfileSnapshot: profile.createProfileSnapshot,
      cleanupPendingFixtures: async () => ({ deletedLearnerCount: 0, pendingLearnerCount: 0 }),
      runDoctor: async () => [{ name: "all", ok: true, detail: "ready" }],
      validatePlatformInputs: async () => scenario.platformClips.map((config) => ({
        config,
        inputPath: join(directory, `${config.id}.mp4`),
        expectedSha256: "c".repeat(64),
        sourceRevision: scenario.sourceRevision,
      })),
      validateNativeMedia: async () => [],
      validateReviewBrowser: async () => ({
        origin: "https://chatgpt.com",
        composerVisible: true,
        skillPilotAppVisible: true,
      }),
      prepareFixtures: async () => {
        throw new Error("planned fixture failure");
      },
    }),
    /planned fixture failure/u,
  );
  for (const marker of markers) {
    await assert.rejects(
      access(marker),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
  }
});

test("review manifest becomes complete only after disposable learner cleanup", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-complete-"));
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  scenario.sourceRevision = "b".repeat(40);
  scenario.outputDir = join(directory, "output");
  scenario.cacheDir = join(directory, "cache");
  const workDir = scenarioWorkDir(scenario);
  const order: string[] = [];
  const profile = mockReviewProfile(scenario, directory, async () => {
    assert.equal(await readFile(join(workDir, "manifest.pending.json"), "utf8"), "pending\n");
    await assert.rejects(
      access(join(workDir, "manifest.json")),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
    order.push("profile-cleanup");
  });
  const buildArtifacts = async (): Promise<BuildArtifacts> => {
    await mkdir(workDir, { recursive: true, mode: 0o700 });
    const pending = join(workDir, "manifest.pending.json");
    await writeFile(pending, "pending\n", { mode: 0o600 });
    order.push("build");
    return {
      workDir,
      recording: {
        videoPath: join(workDir, "recording.webm"),
        timelinePath: join(workDir, "timeline.json"),
        timeline: [],
        durationMs: 1,
        browserVersion: "test",
      },
      narrationPath: join(workDir, "narration.json"),
      narration: { title: "", overview: "", disclosure: "", segments: [] },
      subtitlesPath: join(workDir, "subtitles.srt"),
      webVideoPath: join(workDir, "web.mp4"),
      outputVideoPath: join(workDir, "final.mp4"),
      manifestPath: pending,
    };
  };

  const result = await runSkillPilotReviewBuild({
    scenario,
    scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
    environment: profile.environment,
    narrationClient: {} as never,
    ttsClient: {} as never,
  }, {
    createProfileSnapshot: profile.createProfileSnapshot,
    runDoctor: async () => [{ name: "all", ok: true, detail: "ready" }],
    validateReviewBrowser: async () => ({
      origin: "https://chatgpt.com",
      composerVisible: true,
      skillPilotAppVisible: true,
    }),
    validatePlatformInputs: async () => scenario.platformClips.map((config) => ({
      config,
      inputPath: join(directory, `${config.id}.mp4`),
      expectedSha256: "c".repeat(64),
      sourceRevision: scenario.sourceRevision,
    })),
    validateNativeMedia: async () => [],
    prepareFixtures: async () => ({
      environment: {},
      learnerCount: 6,
      cleanup: async () => { order.push("cleanup"); },
    }),
    build: buildArtifacts as typeof import("../src/pipeline.js").buildPipeline,
  });

  order.push("returned");
  assert.deepEqual(order, ["build", "cleanup", "profile-cleanup", "returned"]);
  assert.equal(result.learnerCount, 6);
  assert.equal(result.artifacts.manifestPath, join(workDir, "manifest.json"));
  assert.equal(await readFile(result.artifacts.manifestPath, "utf8"), "pending\n");
  await assert.rejects(
    access(join(workDir, "manifest.pending.json")),
    (error: NodeJS.ErrnoException) => error.code === "ENOENT",
  );
});

test("profile snapshot cleanup failure removes every completion marker", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-profile-cleanup-failure-"));
  try {
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    scenario.sourceRevision = "e".repeat(40);
    scenario.outputDir = join(directory, "output");
    scenario.cacheDir = join(directory, "cache");
    const workDir = scenarioWorkDir(scenario);
    const profile = mockReviewProfile(scenario, directory, async () => {
      throw new Error("planned profile cleanup failure");
    });

    await assert.rejects(
      runSkillPilotReviewBuild({
        scenario,
        scenarioPath: resolve("scenarios/skillpilot-openai-review.template.yaml"),
        environment: profile.environment,
        narrationClient: {} as never,
        ttsClient: {} as never,
      }, {
        createProfileSnapshot: profile.createProfileSnapshot,
        cleanupPendingFixtures: async () => ({ deletedLearnerCount: 0, pendingLearnerCount: 0 }),
        runDoctor: async () => [{ name: "all", ok: true, detail: "ready" }],
        validatePlatformInputs: async () => [],
        validateNativeMedia: async () => [],
        validateReviewBrowser: async () => ({
          origin: "https://chatgpt.com",
          composerVisible: true,
          skillPilotAppVisible: true,
        }),
        prepareFixtures: async () => ({
          environment: {},
          learnerCount: 6,
          cleanup: async () => undefined,
        }),
        build: (async (): Promise<BuildArtifacts> => {
          await mkdir(workDir, { recursive: true, mode: 0o700 });
          const pending = join(workDir, "manifest.pending.json");
          await writeFile(pending, "pending\n", { mode: 0o600 });
          return {
            workDir,
            recording: {
              videoPath: join(workDir, "recording.webm"),
              timelinePath: join(workDir, "timeline.json"),
              timeline: [],
              durationMs: 1,
              browserVersion: "test",
            },
            narrationPath: join(workDir, "narration.json"),
            narration: { title: "", overview: "", disclosure: "", segments: [] },
            subtitlesPath: join(workDir, "subtitles.srt"),
            webVideoPath: join(workDir, "web.mp4"),
            outputVideoPath: join(workDir, "final.mp4"),
            manifestPath: pending,
          };
        }) as typeof import("../src/pipeline.js").buildPipeline,
      }),
      /planned profile cleanup failure/u,
    );

    for (const marker of ["manifest.json", "manifest.pending.json"]) {
      await assert.rejects(
        access(join(workDir, marker)),
        (error: NodeJS.ErrnoException) => error.code === "ENOENT",
      );
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
