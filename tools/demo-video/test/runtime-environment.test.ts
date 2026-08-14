import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadScenario } from "../src/config.js";
import {
  referencedEnvironmentNames,
  runtimeEnvironmentSecrets,
  takeScenarioEnvironment,
} from "../src/runtime-environment.js";

const reviewScenarioPath = new URL(
  "../scenarios/skillpilot-openai-review.template.yaml",
  import.meta.url,
);

test("takes every scenario capability and native-clip input out of process-style storage", async () => {
  const scenario = await loadScenario(fileURLToPath(reviewScenarioPath));
  const names = referencedEnvironmentNames(scenario);
  const source: NodeJS.ProcessEnv = Object.fromEntries(
    names.map((name, index) => [name, `value-${index}`]),
  );
  source.UNRELATED = "kept";

  const captured = takeScenarioEnvironment(scenario, source);

  assert.equal(Object.keys(captured).length, names.length);
  assert.deepEqual(Object.keys(captured).sort(), names);
  assert.deepEqual(source, { UNRELATED: "kept" });
  const secrets = runtimeEnvironmentSecrets(scenario, captured);
  assert.ok(secrets.length > 0);
  assert.ok(secrets.length <= names.length);
  assert.ok(secrets.every((value) => Object.values(captured).includes(value)));
  for (const clip of scenario.platformClips) {
    if (clip.expectedSha256FromEnv) {
      assert.ok(!secrets.includes(captured[clip.expectedSha256FromEnv] ?? ""));
    }
    if (clip.sourceRevisionFromEnv) {
      assert.ok(!secrets.includes(captured[clip.sourceRevisionFromEnv] ?? ""));
    }
    if (clip.privacyReviewedFromEnv) {
      assert.ok(!secrets.includes(captured[clip.privacyReviewedFromEnv] ?? ""));
    }
  }
});
