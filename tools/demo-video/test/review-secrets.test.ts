import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { loadScenario } from "../src/config.js";
import { loadReviewSecrets } from "../src/review-secrets.js";

test("loads browser-only review credentials and profile path from one private file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-secrets-"));
  const secretPath = join(directory, "review.json");
  const browserProfilePath = join(directory, "chatgpt-profile");
  try {
    await writeFile(secretPath, `${JSON.stringify({
      schemaVersion: 1,
      openAiApiKey: "sk-private-test-key",
      browserProfilePath,
      platformClips: [],
    })}\n`, { mode: 0o600 });
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    const loaded = await loadReviewSecrets(secretPath, scenario);

    assert.equal(loaded.openAiApiKey, "sk-private-test-key");
    assert.equal(loaded.environment.SKILLPILOT_REVIEW_CHATGPT_PROFILE, browserProfilePath);
    assert.deepEqual(loaded.sensitiveValues.sort(), [
      browserProfilePath,
      "sk-private-test-key",
    ].sort());
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects unexpected or unreviewed native evidence for a browser-only review", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-review-secrets-"));
  const secretPath = join(directory, "review.json");
  try {
    await writeFile(secretPath, `${JSON.stringify({
      schemaVersion: 1,
      openAiApiKey: "sk-private-test-key",
      browserProfilePath: join(directory, "chatgpt-profile"),
      platformClips: [{
        id: "native-ios-core-flow",
        platform: "ios",
        path: "relative.mp4",
        sha256: "b".repeat(64),
        sourceRevision: "a".repeat(40),
        privacyReviewed: false,
      }],
    })}\n`, { mode: 0o600 });
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    await assert.rejects(
      loadReviewSecrets(secretPath, scenario),
      /does not match the required strict schema/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
