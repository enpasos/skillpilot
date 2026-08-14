import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { redactedScenario, loadScenario } from "../src/config.js";
import { sha256File } from "../src/hash.js";
import { validatePlatformClipInputs } from "../src/platform-clips.js";

test("accepts only a private, reviewed native clip bound to its exact digest", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-platform-clip-"));
  const clipPath = join(directory, "reviewed-ios.mov");
  const previous = {
    path: process.env.DEMO_VIDEO_TEST_IOS_CLIP,
    sha256: process.env.DEMO_VIDEO_TEST_IOS_CLIP_SHA256,
    revision: process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVISION,
    reviewed: process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED,
  };
  try {
    await writeFile(clipPath, "reviewed native evidence", { mode: 0o600 });
    const digest = await sha256File(clipPath);
    process.env.DEMO_VIDEO_TEST_IOS_CLIP = clipPath;
    process.env.DEMO_VIDEO_TEST_IOS_CLIP_SHA256 = digest;
    process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVISION = "d".repeat(40);
    process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED = "true";

    const scenario = await loadScenario(resolve("scenarios/example.yaml"));
    scenario.platformClips = [{
      id: "native-ios",
      title: "Core flow",
      platform: "ios",
      pathFromEnv: "DEMO_VIDEO_TEST_IOS_CLIP",
      expectedSha256FromEnv: "DEMO_VIDEO_TEST_IOS_CLIP_SHA256",
      sourceRevisionFromEnv: "DEMO_VIDEO_TEST_IOS_CLIP_REVISION",
      privacyReviewedFromEnv: "DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED",
      audio: "mute",
    }];

    const [resolvedClip] = await validatePlatformClipInputs(scenario);
    assert.equal(resolvedClip?.inputPath, clipPath);
    assert.equal(resolvedClip?.expectedSha256, digest);
    assert.equal(resolvedClip?.sourceRevision, "d".repeat(40));
    assert.doesNotMatch(JSON.stringify(redactedScenario(scenario)), new RegExp(clipPath, "u"));

    process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED = "false";
    await assert.rejects(validatePlatformClipInputs(scenario), /attestation must equal true/u);
    process.env.DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED = "true";
    process.env.DEMO_VIDEO_TEST_IOS_CLIP_SHA256 = "0".repeat(64);
    await assert.rejects(validatePlatformClipInputs(scenario), /does not match the reviewed digest/u);

    if (process.platform !== "win32") {
      process.env.DEMO_VIDEO_TEST_IOS_CLIP_SHA256 = digest;
      await chmod(clipPath, 0o644);
      await assert.rejects(validatePlatformClipInputs(scenario), /accessible by group or others/u);
    }
  } finally {
    const restore = (name: string, value: string | undefined): void => {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    };
    restore("DEMO_VIDEO_TEST_IOS_CLIP", previous.path);
    restore("DEMO_VIDEO_TEST_IOS_CLIP_SHA256", previous.sha256);
    restore("DEMO_VIDEO_TEST_IOS_CLIP_REVISION", previous.revision);
    restore("DEMO_VIDEO_TEST_IOS_CLIP_REVIEWED", previous.reviewed);
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects relative paths supplied by the environment", async () => {
  const scenario = await loadScenario(resolve("scenarios/example.yaml"));
  scenario.platformClips = [{
    id: "native-android",
    title: "Core flow",
    platform: "android",
    pathFromEnv: "DEMO_VIDEO_TEST_RELATIVE_ANDROID_CLIP",
    expectedSha256: "a".repeat(64),
    sourceRevision: "e".repeat(40),
    privacyReviewed: true,
    audio: "mute",
  }];
  const previous = process.env.DEMO_VIDEO_TEST_RELATIVE_ANDROID_CLIP;
  try {
    process.env.DEMO_VIDEO_TEST_RELATIVE_ANDROID_CLIP = "relative/android.mp4";
    await assert.rejects(validatePlatformClipInputs(scenario), /must be absolute/u);
  } finally {
    if (previous === undefined) delete process.env.DEMO_VIDEO_TEST_RELATIVE_ANDROID_CLIP;
    else process.env.DEMO_VIDEO_TEST_RELATIVE_ANDROID_CLIP = previous;
  }
});
