import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadScenario, redactedScenario } from "../src/config.js";

const minimalScenario = `
schemaVersion: 1
id: config-test
title: Config test
sourceRevision: test-revision
variables:
  fixture: fixture.html
narration:
  mode: scripted
chapters:
  - id: first
    title: First
    scriptedNarration: This is deterministic.
    steps:
      - id: open
        action: goto
        label: Open
        url: \${fixture}
      - id: secret
        action: fill
        label: Secret
        target: { css: "#secret" }
        valueFromEnv: CONFIG_TEST_SECRET
`;

test("loads defaults, resolves local URLs, and keeps environment values out of configuration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(scenarioPath, minimalScenario, "utf8");
  process.env.CONFIG_TEST_SECRET = "must-not-appear";
  const scenario = await loadScenario(scenarioPath);

  assert.equal(scenario.browser.headless, true);
  assert.equal(scenario.browser.persistentProfileRequiresSnapshot, false);
  assert.equal(scenario.browser.dialogPolicy, "dismiss");
  assert.deepEqual(scenario.privacy.requiredMaskSelectors, []);
  assert.deepEqual(scenario.platformClips, []);
  assert.match(scenario.chapters[0]!.steps[0]!.action === "goto" ? scenario.chapters[0]!.steps[0]!.url ?? "" : "", /^file:/);
  assert.doesNotMatch(JSON.stringify(scenario), /must-not-appear/);
  assert.match(JSON.stringify(redactedScenario(scenario)), /\[ENV:CONFIG_TEST_SECRET\]/);
});

test("requires every mandatory evidence mask to be an active configured selector", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario.replace(
      "narration:\n",
      "privacy:\n  maskSelectors: ['#configured']\n  requiredMaskSelectors: ['#account']\nnarration:\n",
    ),
    "utf8",
  );
  await assert.rejects(
    loadScenario(scenarioPath),
    /Required mask selector is not configured/u,
  );
});

test("rejects duplicate step IDs before recording", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(scenarioPath, minimalScenario.replace("id: secret", "id: open"), "utf8");
  await assert.rejects(loadScenario(scenarioPath), /Duplicate step id: open/);
});

test("rejects an environment-backed input that explicitly disables secrecy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario.replace("valueFromEnv: CONFIG_TEST_SECRET", "valueFromEnv: CONFIG_TEST_SECRET\n        secret: false"),
    "utf8",
  );
  await assert.rejects(loadScenario(scenarioPath), /cannot set secret=false/);
});

test("rejects literal values marked as secrets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario.replace("valueFromEnv: CONFIG_TEST_SECRET", "value: literal-secret\n        secret: true"),
    "utf8",
  );
  await assert.rejects(loadScenario(scenarioPath), /must use valueFromEnv/);
});

test("redacted scenario removes variables, URLs, paths, and preserves regex policy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario
      .replace("variables:\n  fixture: fixture.html", "variables:\n  fixture: https://example.test/?prompt=sps_secret")
      .replace("narration:\n", "browser:\n  storageState: protected.json\nprivacy:\n  forbiddenPatterns: ['sps_[A-Za-z0-9_]+']\nnarration:\n"),
    "utf8",
  );
  const scenario = await loadScenario(scenarioPath);
  const serialized = JSON.stringify(redactedScenario(scenario));
  assert.doesNotMatch(serialized, /example\.test|protected\.json|sps_secret/);
  assert.match(serialized, /sps_\[A-Za-z0-9_\]\+/);
  assert.match(serialized, /PRIVATE_OUTPUT_DIRECTORY/);
});

test("resolves literal platform clips while redacting their protected paths", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario.replace(
      "chapters:\n",
      `platformClips:
  - id: native-ios
    title: Reviewed core flow
    platform: ios
    path: protected/ios.mov
    expectedSha256: ${"a".repeat(64)}
    sourceRevision: ${"c".repeat(40)}
    privacyReviewed: true
    audio: mute
chapters:
`,
    ),
    "utf8",
  );

  const scenario = await loadScenario(scenarioPath);
  assert.equal(scenario.platformClips[0]?.path, join(directory, "protected", "ios.mov"));
  const serialized = JSON.stringify(redactedScenario(scenario));
  assert.doesNotMatch(serialized, /protected[\\/]ios\.mov/u);
  assert.match(serialized, /PROTECTED_PLATFORM_CLIP_PATH/u);
});

test("requires one source, digest, and privacy attestation for every platform clip", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-config-"));
  const scenarioPath = join(directory, "scenario.yaml");
  await writeFile(
    scenarioPath,
    minimalScenario.replace(
      "chapters:\n",
      `platformClips:
  - id: native-ios
    title: Invalid native clip
    platform: ios
    path: ios.mov
    pathFromEnv: IOS_CLIP
    expectedSha256: ${"b".repeat(64)}
    sourceRevision: ${"c".repeat(40)}
    audio: mute
chapters:
`,
    ),
    "utf8",
  );

  await assert.rejects(
    loadScenario(scenarioPath),
    /needs exactly one of path or pathFromEnv|needs exactly one privacy review attestation/u,
  );
});
