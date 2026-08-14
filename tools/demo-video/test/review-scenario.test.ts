import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.equal(scenario.browser.headless, false);
  assert.deepEqual(scenario.browser.viewport, { width: 1440, height: 900 });
  assert.deepEqual(scenario.browser.video, { width: 1440, height: 900 });
  assert.equal(
    scenario.browser.persistentProfilePathFromEnv,
    "SKILLPILOT_REVIEW_CHATGPT_PROFILE",
  );
  assert.equal(scenario.browser.persistentProfileRequiresSnapshot, true);
  assert.equal(scenario.browser.storageState, undefined);
  assert.deepEqual(scenario.platformClips, []);
  const accountSelector = "[data-testid='accounts-profile-button']";
  assert.ok(scenario.privacy.maskSelectors.includes(accountSelector));
  assert.deepEqual(scenario.privacy.requiredMaskSelectors, [accountSelector]);
  assert.match(scenario.narration.instructions, /ChatGPT browser experience/u);
  assert.match(scenario.narration.instructions, /do not claim operating-system, native-app, mobile, or cross-platform support/u);
  for (const chapter of scenario.chapters) {
    const finalStep = chapter.steps.at(-1);
    assert.ok(finalStep?.capture, `${chapter.id} must end with captured result evidence`);
    assert.ok(
      finalStep?.action === "assert" || finalStep?.action === "waitFor",
      `${chapter.id} must fail closed on its visible result`,
    );
  }

  const protectedCases = new Map([
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

  const orientation = scenario.chapters.find((chapter) => chapter.id === "p2-orientation");
  assert.ok(orientation);
  const orientationFirst = orientation.steps[0];
  assert.equal(orientationFirst?.action, "goto");
  assert.equal(
    orientationFirst?.action === "goto" ? orientationFirst.url : undefined,
    "https://skillpilot.com/",
  );
  assert.equal(
    orientationFirst?.action === "goto" ? orientationFirst.urlFromEnv : undefined,
    undefined,
  );

  const termsCheck = orientation.steps.find((step) => step.id === "p2-terms-check");
  assert.equal(termsCheck?.action, "check");
  assert.deepEqual(
    termsCheck?.action === "check" ? termsCheck.target : undefined,
    { role: "checkbox", name: "Ich akzeptiere die Nutzungsbedingungen", exact: false },
  );

  const disposableId = orientation.steps.find((step) => step.id === "p2-enter-disposable-id");
  assert.equal(disposableId?.action, "fill");
  assert.equal(
    disposableId?.action === "fill" ? disposableId.valueFromEnv : undefined,
    "SKILLPILOT_REVIEW_P2_SKILLPILOT_ID",
  );
  assert.equal(disposableId?.action === "fill" ? disposableId.secret : undefined, true);
  assert.deepEqual(
    disposableId?.action === "fill" ? disposableId.target : undefined,
    { css: "#skillpilotIdInput" },
  );
  const existingIdLabel = orientation.steps.find((step) => step.id === "p2-existing-id-label");
  assert.equal(existingIdLabel?.action, "assert");
  assert.deepEqual(
    existingIdLabel?.action === "assert" ? existingIdLabel.target : undefined,
    { text: "Vorhandene ID", exact: true },
  );
  assert.equal(existingIdLabel?.capture, true);
  const levelTwoComplete = orientation.steps.find((step) => step.id === "p2-level-two-complete");
  assert.equal(levelTwoComplete?.action, "waitFor");
  assert.deepEqual(
    levelTwoComplete?.action === "waitFor" ? levelTwoComplete.target : undefined,
    { role: "heading", name: "Dein persönlicher Lehrplan ist eingerichtet." },
  );

  const expectedLevelTwoEvidence = [
    "Hessen",
    "G9",
    "Gymnasiale Oberstufe (Sekundarstufe II)",
    "Mathematik",
    "Mathematik – Leistungskurs",
  ];
  for (const expectedText of expectedLevelTwoEvidence) {
    assert.ok(orientation.steps.some((step) => (
      step.action === "assert"
      && "text" in step.target
      && step.target.text === expectedText
      && step.target.exact === true
    )), `P2 must visibly verify Level-2 value: ${expectedText}`);
  }
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text === "SkillPilot-App in ChatGPT"
  )), "P2 must visibly verify the provider integration");
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text === "Der Lerncoach ist ein KI-Assistent und kann Fehler machen. Prüfe wichtige Antworten."
    && step.target.exact === true
  )), "P2 must visibly verify the first-party AI notice");
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text.includes("SkillPilot öffnet einen neuen ChatGPT-Chat")
    && step.target.text.includes("„SkillPilot Coach v1“")
    && step.target.exact === true
  )), "P2 must visibly verify the fresh-chat provider handoff");

  const firstPartyHandoff = orientation.steps.find((step) => step.id === "p2-open-chatgpt");
  assert.equal(firstPartyHandoff?.action, "click");
  assert.equal(
    firstPartyHandoff?.action === "click" ? firstPartyHandoff.samePage : undefined,
    true,
  );
  assert.deepEqual(
    firstPartyHandoff?.action === "click" ? firstPartyHandoff.target : undefined,
    { role: "button", name: "SkillPilot-App öffnen" },
  );
  assert.doesNotMatch(
    JSON.stringify(orientation),
    /SKILLPILOT_REVIEW_P2_START_URL/u,
    "P2 must use the normal first-party handoff rather than a prebuilt ChatGPT URL",
  );

  const memory = scenario.chapters.find((chapter) => chapter.id === "p3-memory-and-recall");
  assert.ok(memory);
  const memoryStepIds = memory.steps.map((step) => step.id);
  const pathIndex = memoryStepIds.indexOf("p3-orientation-path");
  const personalIndex = memoryStepIds.indexOf("p3-orientation-personal");
  const continuationIndex = memoryStepIds.indexOf("p3-orientation-continuation");
  const practiceIndex = memoryStepIds.indexOf("p3-practice-prompt");
  assert.ok(pathIndex >= 0 && pathIndex < personalIndex);
  assert.ok(personalIndex < continuationIndex);
  assert.ok(continuationIndex < practiceIndex);
  const orientationContinuation = memory.steps[continuationIndex];
  assert.equal(orientationContinuation?.action, "assert");
  assert.equal(
    orientationContinuation?.action === "assert" ? orientationContinuation.text : undefined,
    "Darstellungsform auswählen und begründen",
  );
  const practicePrompt = memory.steps[practiceIndex];
  assert.equal(practicePrompt?.action, "fill");
  assert.match(
    practicePrompt?.action === "fill" ? practicePrompt.value ?? "" : "",
    /Lernkarten - Funktionen und Gleichungen/u,
  );
  const knownRatings = memory.steps.filter((step) =>
    step.action === "click" && "role" in step.target && step.target.name === "Gewusst",
  );
  assert.equal(knownRatings.length, 8);
  assert.ok(memory.steps.some((step) =>
    step.action === "assert" && "text" in step.target && step.target.text === "Für heute geschafft",
  ));

  const assertVisibleResponseBefore = (
    chapterId: string,
    waitStepId: string,
    nextStepId: string,
  ): void => {
    const chapter = scenario.chapters.find((candidate) => candidate.id === chapterId);
    assert.ok(chapter, `missing review chapter ${chapterId}`);
    const stepIds = chapter.steps.map((step) => step.id);
    const waitIndex = stepIds.indexOf(waitStepId);
    const nextIndex = stepIds.indexOf(nextStepId);
    assert.ok(waitIndex >= 0 && waitIndex < nextIndex, `${waitStepId} must precede ${nextStepId}`);
    const waitStep = chapter.steps[waitIndex];
    assert.equal(waitStep?.action, "waitFor");
    assert.equal(waitStep?.timeoutMs, 60000);
  };

  assertVisibleResponseBefore("p4-exam-evaluation", "p4-wait-task", "p4-answer");
  assertVisibleResponseBefore("p5-focus-widening", "p5-wait-context", "p5-request");
  assertVisibleResponseBefore("n2-level-two-boundary", "n2-wait-context", "n2-prompt");
  assertVisibleResponseBefore("n3-exam-help-boundary", "n3-wait-task", "n3-prompt");

  for (const [chapterId, waitStepId] of [
    ["p5-focus-widening", "p5-wait-context"],
    ["n2-level-two-boundary", "n2-wait-context"],
  ] as const) {
    const chapter = scenario.chapters.find((candidate) => candidate.id === chapterId);
    const responseGate = chapter?.steps.find((step) => step.id === waitStepId);
    assert.equal(responseGate?.action, "waitFor");
    assert.deepEqual(
      responseGate?.action === "waitFor" ? responseGate.target : undefined,
      { css: "[data-message-author-role='assistant']", match: "last" },
      `${chapterId} must wait for a fresh visible assistant response`,
    );
  }

  for (const chapterId of ["p4-exam-evaluation", "n3-exam-help-boundary"]) {
    const chapter = scenario.chapters.find((candidate) => candidate.id === chapterId);
    const examGate = chapter?.steps.find((step) => step.id.endsWith("wait-task"));
    assert.equal(examGate?.action, "waitFor");
    assert.deepEqual(
      examGate?.action === "waitFor" ? examGate.target : undefined,
      {
        text: "B1 (Analysis – „Das Algenwachstum“, 25 BE)",
        exact: false,
        match: "last",
      },
      `${chapterId} must wait for the reviewed exam task title`,
    );
  }

  const invalidSession = scenario.chapters.find((chapter) => chapter.id === "n1-missing-session");
  assert.ok(invalidSession?.steps.some((step) =>
    step.action === "waitFor" && "text" in step.target && step.target.text === "SESSION_REQUIRED",
  ));
  const sessionless = scenario.chapters.find((chapter) => chapter.id === "p1-sessionless-start");
  assert.ok(sessionless?.steps.some((step) =>
    step.action === "assert" && "text" in step.target && step.target.text === "SkillPilot Coach v1",
  ));
  const accountMaskGate = sessionless?.steps.find((step) => step.id === "p1-account-mask-target");
  assert.equal(accountMaskGate?.action, "assert");
  assert.deepEqual(
    accountMaskGate?.action === "assert" ? accountMaskGate.target : undefined,
    { css: accountSelector, match: "last" },
  );
  assert.equal(accountMaskGate?.capture, true);
});

test("documents the exact local SkillPilot review paths without native release gates", async () => {
  const readme = await readFile(resolve("README.md"), "utf8");
  const operatorBlock = readme.slice(readme.indexOf("## SkillPilot OpenAI review demo"));
  const root = "/home/enpasos/projects/skillpilot/tools/demo-video";
  assert.match(operatorBlock, new RegExp(`cd ${root}`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/secrets/chatgpt-login-profile`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/secrets/skillpilot-review\\.json`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/scenarios/skillpilot-openai-review\\.template\\.yaml`, "u"));
  assert.doesNotMatch(operatorBlock, /cd tools\/demo-video|\/absolute\/private\/path/u);
  assert.doesNotMatch(operatorBlock, /native device capture[^.]*remain explicit release gates/iu);
  assert.match(
    operatorBlock,
    /Native device capture is\s+outside this browser-only V1 release scope; it is not a current release gate/u,
  );
});
