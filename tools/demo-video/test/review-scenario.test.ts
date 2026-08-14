import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";

import { loadScenario } from "../src/config.js";

test("locks the SkillPilot review blueprint to five positive and three negative cases", async () => {
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));

  assert.deepEqual(scenario.chapters.map((chapter) => chapter.id), [
    "p1-sessionless-start",
    "p2-orientation",
    "p3-memory-and-recall",
    "p4-exam-evaluation",
    "p5-focus-widening",
    "n1-missing-session",
    "n2-level-two-boundary",
    "n3-exam-help-boundary",
  ]);
  assert.equal(scenario.sourceRevision, "SET_TO_DEPLOYED_GIT_SHA");
  for (const chapter of scenario.chapters) {
    const finalStep = chapter.steps.at(-1);
    assert.ok(finalStep?.capture, `${chapter.id} must end with captured result evidence`);
    assert.ok(
      finalStep?.action === "assert" || finalStep?.action === "waitFor",
      `${chapter.id} must fail closed on its visible result`,
    );
  }

  const protectedCases = new Map([
    ["p2-orientation", "SKILLPILOT_REVIEW_P2_START_URL"],
    ["p3-memory-and-recall", "SKILLPILOT_REVIEW_P3_START_URL"],
    ["p4-exam-evaluation", "SKILLPILOT_REVIEW_P4_START_URL"],
    ["p5-focus-widening", "SKILLPILOT_REVIEW_P5_START_URL"],
    ["n2-level-two-boundary", "SKILLPILOT_REVIEW_N2_START_URL"],
    ["n3-exam-help-boundary", "SKILLPILOT_REVIEW_N3_START_URL"],
  ]);
  for (const [chapterId, environmentName] of protectedCases) {
    const chapter = scenario.chapters.find((candidate) => candidate.id === chapterId);
    assert.ok(chapter, `missing review chapter ${chapterId}`);
    const first = chapter.steps[0];
    assert.equal(first?.action, "goto");
    assert.equal(first?.action === "goto" ? first.urlFromEnv : undefined, environmentName);
    assert.equal(first?.action === "goto" ? first.url : undefined, undefined);
  }

  const memory = scenario.chapters.find((chapter) => chapter.id === "p3-memory-and-recall");
  assert.ok(memory);
  const knownRatings = memory.steps.filter((step) =>
    step.action === "click" && "role" in step.target && step.target.name === "Gewusst",
  );
  assert.equal(knownRatings.length, 8);
  assert.ok(memory.steps.some((step) =>
    step.action === "assert" && "text" in step.target && step.target.text === "Für heute geschafft",
  ));

  const invalidSession = scenario.chapters.find((chapter) => chapter.id === "n1-missing-session");
  assert.ok(invalidSession?.steps.some((step) =>
    step.action === "waitFor" && "text" in step.target && step.target.text === "SESSION_REQUIRED",
  ));
  const sessionless = scenario.chapters.find((chapter) => chapter.id === "p1-sessionless-start");
  assert.ok(sessionless?.steps.some((step) =>
    step.action === "assert" && "text" in step.target && step.target.text === "SkillPilot Coach v1",
  ));
});
