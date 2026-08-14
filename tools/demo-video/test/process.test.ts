import assert from "node:assert/strict";
import { test } from "node:test";

import { runProcess, safeChildEnvironment } from "../src/process.js";

test("child processes receive runtime necessities but not application secrets", async () => {
  const environment = safeChildEnvironment({
    PATH: "/usr/bin",
    HOME: "/private/home",
    LANG: "C.UTF-8",
    OPENAI_API_KEY: "sk-private",
    SKILLPILOT_REVIEW_P3_START_URL: "https://chatgpt.com/?prompt=secret",
    DEMO_VIDEO_FIXTURE_SECRET: "private-value",
  });

  assert.deepEqual(environment, {
    PATH: "/usr/bin",
    HOME: "/private/home",
    LANG: "C.UTF-8",
  });
});

test("runProcess uses the filtered environment by default", async () => {
  const name = "DEMO_VIDEO_CHILD_ENV_SECRET";
  const previous = process.env[name];
  process.env[name] = "must-not-be-inherited";
  try {
    const result = await runProcess(process.execPath, [
      "-e",
      `process.stdout.write(process.env.${name} ?? "absent")`,
    ]);
    assert.equal(result.stdout, "absent");
  } finally {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  }
});
