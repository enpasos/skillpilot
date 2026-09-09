import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

import { loadScenario } from "../src/config.js";

test("locks the upload video to the supported browser launch and five main workflows", async () => {
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));

  assert.deepEqual(scenario.chapters.map((chapter) => chapter.id), [
    "p2-orientation",
    "p3-memory-and-recall",
    "p4-exam-evaluation",
    "p5-focus-widening",
    "d1-daily-plan",
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
  assert.ok(!scenario.privacy.maskSelectors.includes("[contenteditable='true']"));
  assert.ok(!scenario.privacy.forbiddenPatterns.some((pattern) => pattern.includes("sps_")));
  assert.match(scenario.narration.instructions, /ChatGPT browser experience/u);
  assert.match(
    scenario.narration.instructions,
    /do not claim operating-system, native-app, mobile, or cross-platform support/u,
  );
  for (const chapter of scenario.chapters) {
    const finalStep = chapter.steps.at(-1);
    assert.ok(finalStep?.capture, `${chapter.id} must end with captured result evidence`);
    assert.ok(
      finalStep?.action === "assert" || finalStep?.action === "waitFor",
      `${chapter.id} must fail closed on its visible result`,
    );
  }

  const firstPartyCases = new Map([
    ["p2-orientation", "SKILLPILOT_REVIEW_P2_SKILLPILOT_ID"],
    ["p3-memory-and-recall", "SKILLPILOT_REVIEW_P3_SKILLPILOT_ID"],
    ["p4-exam-evaluation", "SKILLPILOT_REVIEW_P4_SKILLPILOT_ID"],
    ["p5-focus-widening", "SKILLPILOT_REVIEW_P5_SKILLPILOT_ID"],
    ["d1-daily-plan", "SKILLPILOT_REVIEW_D1_SKILLPILOT_ID"],
  ]);
  for (const [chapterId, environmentName] of firstPartyCases) {
    const chapter = scenario.chapters.find((candidate) => candidate.id === chapterId);
    assert.ok(chapter, `missing review chapter ${chapterId}`);
    const first = chapter.steps[0];
    assert.equal(first?.action, "goto");
    assert.equal(first?.action === "goto" ? first.url : undefined, "https://skillpilot.com/");
    assert.equal(first?.action === "goto" ? first.urlFromEnv : undefined, undefined);
    const prefix = chapterId.slice(0, 2);
    const disposableId = chapter.steps.find((step) => step.id === `${prefix}-enter-disposable-id`);
    const expandCurriculum = chapter.steps.find((step) => step.id === `${prefix}-expand-personal-curriculum`);
    const launch = chapter.steps.find((step) => step.id === `${prefix}-open-chatgpt`);
    const injectedPromptGate = chapter.steps.find((step) => step.id === `${prefix}-prompt-injected`);
    assert.equal(disposableId?.action, "fill");
    assert.equal(disposableId?.action === "fill" ? disposableId.valueFromEnv : undefined, environmentName);
    assert.equal(disposableId?.action === "fill" ? disposableId.secret : undefined, true);
    if (chapterId !== "p2-orientation") {
      assert.equal(
        disposableId?.capture,
        true,
        `${chapterId} must capture the opaque permanent-ID mask before leaving SkillPilot`,
      );
    }
    assert.deepEqual(disposableId?.action === "fill" ? disposableId.target : undefined, {
      css: "#skillpilotIdInput",
    });
    assert.equal(expandCurriculum?.action, "click");
    assert.deepEqual(expandCurriculum?.action === "click" ? expandCurriculum.target : undefined, {
      role: "button",
      name: "Ändern: Persönliches Curriculum festlegen",
      exact: true,
    });
    assert.equal(launch?.action, "click");
    assert.equal(launch?.action === "click" ? launch.samePage : undefined, true);
    assert.deepEqual(launch?.action === "click" ? launch.target : undefined, {
      role: "button",
      name: "Mit ChatGPT starten",
    });
    assert.equal(injectedPromptGate?.action, "assertPreparedPrompt");
    assert.deepEqual(
      injectedPromptGate?.action === "assertPreparedPrompt" ? injectedPromptGate.target : undefined,
      { css: "[contenteditable='true']" },
    );
    const stepIds = chapter.steps.map((step) => step.id);
    assert.ok(
      stepIds.indexOf(`${prefix}-open-chatgpt`)
        < stepIds.indexOf(`${prefix}-prompt-injected`)
      && stepIds.indexOf(`${prefix}-prompt-injected`)
        < stepIds.indexOf(`${prefix}-send-start`),
      `${chapterId} must prove the exact URL-prefilled message before sending`,
    );
    assert.equal(
      chapter.steps.some((step) => (
        step.id === `${prefix}-open-app-menu`
        || step.id === `${prefix}-search-app`
        || step.id === `${prefix}-attach-app`
        || step.id === `${prefix}-app-selected`
      )),
      false,
      `${chapterId} must let the prepared text invoke SkillPilot without a redundant lookup`,
    );
    assert.equal(
      chapter.steps.some((step) => (
        step.action === "type"
        && step.value === "SkillPilot Coach v1"
      )),
      false,
      `${chapterId} must never type the app name into the prepared message`,
    );
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
  const expandSummary = orientation.steps.find((step) => step.id === "p2-expand-personal-curriculum");
  assert.equal(expandSummary?.action, "click");
  assert.deepEqual(
    expandSummary?.action === "click" ? expandSummary.target : undefined,
    { role: "button", name: "Ändern: Persönliches Curriculum festlegen", exact: true },
  );

  for (const expectedText of [
    "Hessen",
    "G9",
    "Gymnasiale Oberstufe (Sekundarstufe II)",
    "Mathematik",
    "Mathematik – Leistungskurs",
  ]) {
    assert.ok(orientation.steps.some((step) => (
      step.action === "assert"
      && "text" in step.target
      && step.target.text === expectedText
      && step.target.exact === true
    )), `launch chapter must visibly verify Level-2 value: ${expectedText}`);
  }
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text === "SkillPilot-App in ChatGPT"
  )), "launch chapter must visibly verify the provider integration");
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text === "Der Lerncoach ist ein KI-Assistent und kann Fehler machen. Prüfe wichtige Antworten."
    && step.target.exact === true
  )), "launch chapter must visibly verify the first-party AI notice");
  assert.ok(orientation.steps.some((step) => (
    step.action === "assert"
    && "text" in step.target
    && step.target.text.includes("SkillPilot öffnet einen neuen ChatGPT-Chat")
    && step.target.text.includes("„SkillPilot Coach v1“")
    && step.target.exact === true
  )), "launch chapter must visibly verify the fresh-chat handoff");

  const firstPartyHandoff = orientation.steps.find((step) => step.id === "p2-open-chatgpt");
  assert.equal(firstPartyHandoff?.action, "click");
  assert.equal(firstPartyHandoff?.action === "click" ? firstPartyHandoff.samePage : undefined, true);
  assert.deepEqual(
    firstPartyHandoff?.action === "click" ? firstPartyHandoff.target : undefined,
    { role: "button", name: "Mit ChatGPT starten" },
  );
  assert.doesNotMatch(JSON.stringify(orientation), /SKILLPILOT_REVIEW_P2_START_URL/u);
  const sendStartIndex = orientation.steps.findIndex((step) => step.id === "p2-send-start");
  assert.ok(orientation.steps.findIndex((step) => step.id === "p2-prompt-injected") < sendStartIndex);
  const accountMaskGate = orientation.steps.find((step) => step.id === "p2-account-mask-target");
  assert.equal(accountMaskGate?.action, "assert");
  assert.deepEqual(
    accountMaskGate?.action === "assert" ? accountMaskGate.target : undefined,
    { css: accountSelector, match: "last" },
  );
  assert.equal(accountMaskGate?.capture, true);

  const memory = scenario.chapters.find((chapter) => chapter.id === "p3-memory-and-recall");
  assert.ok(memory);
  const memoryStepIds = memory.steps.map((step) => step.id);
  const pathIndex = memoryStepIds.indexOf("p3-orientation-path");
  const personalIndex = memoryStepIds.indexOf("p3-orientation-personal");
  const continuationIndex = memoryStepIds.indexOf("p3-learning-exchange");
  const practiceIndex = memoryStepIds.indexOf("p3-practice-prompt");
  const memoryGoalIndex = memoryStepIds.indexOf("p3-memory-goal-ready");
  const recallIndex = memoryStepIds.indexOf("p3-recall-prompt");
  assert.ok(pathIndex >= 0 && pathIndex < personalIndex);
  assert.ok(personalIndex < continuationIndex);
  assert.ok(continuationIndex < practiceIndex);
  assert.ok(practiceIndex < memoryGoalIndex);
  assert.ok(memoryGoalIndex < recallIndex);
  const memoryPath = memory.steps.find((step) => step.id === "p3-orientation-path");
  const memoryPersonal = memory.steps.find((step) => step.id === "p3-orientation-personal");
  assert.equal(
    memoryPath?.action === "fill" ? memoryPath.value : undefined,
    "Wachstum fände ich spannend",
  );
  assert.equal(
    memoryPersonal?.action === "fill" ? memoryPersonal.value : undefined,
    "Bakterienwachstum",
  );
  const orientationStepIds = orientation.steps.map((step) => step.id);
  const orientationPath = orientation.steps.find((step) => step.id === "p2-path");
  const orientationPersonal = orientation.steps.find((step) => step.id === "p2-personal");
  assert.equal(
    orientationPath?.action === "fill" ? orientationPath.value : undefined,
    "Wachstum fände ich spannend",
  );
  assert.equal(
    orientationPersonal?.action === "fill" ? orientationPersonal.value : undefined,
    "Bakterienwachstum",
  );
  assert.ok(
    orientationStepIds.indexOf("p2-send-personal")
      < orientationStepIds.indexOf("p2-adaptive-learning-answer"),
  );
  assert.ok(
    orientationStepIds.indexOf("p2-adaptive-learning-answer")
      < orientationStepIds.indexOf("p2-learning-result"),
  );
  const secondGoalAnswer = orientation.steps.find((step) => step.id === "p2-adaptive-learning-answer");
  assert.equal(
    secondGoalAnswer?.action === "fill" ? secondGoalAnswer.value : undefined,
    "Ich möchte jetzt mit Bakterienwachstum konkret weiterlernen. Ich würde einen Graphen wählen, weil man daran die Entwicklung über die Zeit und Veränderungen besonders schnell erkennt. Was kann ich am Graphen erkennen, das eine Tabelle weniger direkt zeigt?",
  );
  const p2SecondGoal = orientation.steps.find((step) => step.id === "p2-second-goal");
  const p3SecondGoal = memory.steps.find((step) => step.id === "p3-learning-exchange");
  for (const result of [p2SecondGoal, p3SecondGoal]) {
    assert.equal(result?.action, "assert");
    assert.match(
      result?.action === "assert" ? result.textPattern ?? "" : "",
      /Darstellungsform auswählen und begründen/u,
    );
  }
  const p2FlexibleResult = orientation.steps.find((step) => step.id === "p2-learning-result");
  assert.equal(p2FlexibleResult?.action, "assert");
  assert.equal(p2FlexibleResult?.action === "assert" ? p2FlexibleResult.textPattern : undefined, "\\S");
  assert.equal(memoryStepIds.includes("p3-adaptive-learning-answer"), false);
  assert.equal(orientationStepIds.includes("p2-select-next"), false);
  assert.equal(memoryStepIds.includes("p3-select-next"), false);
  assert.equal(memoryStepIds.includes("p3-widget"), false);

  const exam = scenario.chapters.find((chapter) => chapter.id === "p4-exam-evaluation");
  assert.ok(exam);
  assert.ok(
    exam.steps.findIndex((step) => step.id === "p4-wait-task")
      < exam.steps.findIndex((step) => step.id === "p4-answer"),
  );
  const examGate = exam.steps.find((step) => step.id === "p4-wait-task");
  assert.equal(examGate?.action, "assert");
  assert.match(
    examGate?.action === "assert" ? examGate.textPattern ?? "" : "",
    /Algenteppichs/u,
  );
  const examResult = exam.steps.find((step) => step.id === "p4-result");
  assert.equal(
    examResult?.action === "assert" ? examResult.textPattern : undefined,
    "Bestätigte\\s+Punktzahl:\\s*25\\s+von\\s+25",
  );

  const focus = scenario.chapters.find((chapter) => chapter.id === "p5-focus-widening");
  assert.ok(focus);
  const focusStepIds = focus.steps.map((step) => step.id);
  assert.ok(focusStepIds.indexOf("p5-wait-context") < focusStepIds.indexOf("p5-request"));
  assert.ok(focusStepIds.indexOf("p5-option") < focusStepIds.indexOf("p5-confirm"));
  assert.ok(focusStepIds.indexOf("p5-confirm") < focusStepIds.indexOf("p5-send-confirm"));
  const focusRequest = focus.steps.find((step) => step.id === "p5-request");
  assert.match(
    focusRequest?.action === "fill" ? focusRequest.value ?? "" : "",
    /ändere den Fokus noch nicht/u,
  );
});

test("daily-plan chapter verifies counts, genuine continuation and an explicit subject switch", async () => {
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  const daily = scenario.chapters.find((chapter) => chapter.id === "d1-daily-plan");
  assert.ok(daily);
  const ids = daily.steps.map((step) => step.id);
  const assertBefore = (before: string, after: string): void => {
    assert.ok(ids.includes(before) && ids.includes(after));
    assert.ok(ids.indexOf(before) < ids.indexOf(after), `${before} must precede ${after}`);
  };
  assertBefore("d1-prompt-injected", "d1-send-start");
  assertBefore("d1-send-start", "d1-daily-counts");
  assertBefore("d1-daily-counts", "d1-mathematics-active");
  assertBefore("d1-mathematics-active", "d1-continue-mathematics");
  assertBefore("d1-send-continuation", "d1-mathematics-continued");
  assertBefore("d1-mathematics-continued", "d1-switch-physics");
  assertBefore("d1-send-switch", "d1-physics-result");

  const resultPattern = (id: string): RegExp => {
    const step = daily.steps.find((candidate) => candidate.id === id);
    assert.ok(step?.action === "assert");
    assert.deepEqual(step.target, {
      css: "[data-message-author-role='assistant']",
      match: "last",
    });
    assert.ok(step.textPattern);
    return new RegExp(step.textPattern, "iu");
  };
  const counts = resultPattern("d1-daily-counts");
  assert.match("Heute: 0/2 beherrscht · Offen: Mathematik 1 · Physik 1", counts);
  assert.match("Heute: 0/0 beherrscht · Offen: Mathematik 0 · Physik 0 · Rückstand: 2", counts);
  for (const incorrect of [
    "Heute: 2/48 beherrscht · Offen: Mathematik 19 · Physik 27",
    "Heute: 0/2 beherrscht · Offen: Mathematik 1 · Physik 10",
    "Heute: 0/2 beherrscht · Offen: Mathematik 1 · Physik 1 · Rückstand: 2",
    "Heute: 0/0 beherrscht · Offen: Mathematik 0 · Physik 0",
    "Heute: 0/0 beherrscht · Offen: Mathematik 0 · Physik 0 · Rückstand: 20",
    "Tagesplan nicht auswertbar.",
  ]) assert.doesNotMatch(incorrect, counts);
  assert.match("Warum Mathematik? – Denken, Muster & Zukunft", resultPattern("d1-mathematics-active"));
  const continuation = resultPattern("d1-mathematics-continued");
  assert.match("Mit Mathematik kannst du Wachstum erkunden. Was interessiert dich daran?", continuation);
  assert.doesNotMatch("Weiter geht es.", continuation);
  const physics = resultPattern("d1-physics-result");
  assert.match("Warum Physik? – Weltverständnis & Zukunft: Was möchtest du entdecken?", physics);
  assert.doesNotMatch("Warum Mathematik? – Denken, Muster & Zukunft: Was möchtest du entdecken?", physics);
  assert.doesNotMatch("Physik ist gewählt.", physics);

  const followUp = daily.steps.find((step) => step.id === "d1-continue-mathematics");
  assert.ok(followUp?.action === "fill");
  assert.equal(followUp.value,
    "Ich möchte bei Mathematik weiterlernen. Mich interessiert, wie man mit Mathematik Wachstum verstehen kann.");
  const subjectSwitch = daily.steps.find((step) => step.id === "d1-switch-physics");
  assert.ok(subjectSwitch?.action === "fill");
  assert.equal(subjectSwitch.value, "Jetzt Physik.");
  // Only learner input is typed. Neither expected numbers nor generated coach
  // responses are inserted into the genuine host conversation or its DOM.
  for (const step of daily.steps) {
    if (step.action === "fill" && step.value !== undefined) {
      assert.deepEqual(step.target, { css: "[contenteditable='true']" });
      assert.doesNotMatch(step.value, /0\/2|0\/0|beherrscht|Rückstand|antworte mit|sage genau/iu);
    }
  }
  assert.match(daily.narrationHint ?? "", /does not prove.*D2/u);
  assert.match(daily.narrationHint ?? "", /motivation, not a knowledge test or proof of mastery/u);
});

test("documents exact local paths and separates the upload video from portal test cases", async () => {
  const readme = await readFile(resolve("README.md"), "utf8");
  const operatorBlock = readme.slice(readme.indexOf("## SkillPilot OpenAI review demo"));
  const root = "/home/enpasos/projects/skillpilot/tools/demo-video";
  assert.match(operatorBlock, new RegExp(`cd ${root}`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/secrets/chatgpt-login-profile`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/secrets/skillpilot-review\\.json`, "u"));
  assert.match(operatorBlock, new RegExp(`${root}/scenarios/skillpilot-openai-review\\.template\\.yaml`, "u"));
  assert.doesNotMatch(operatorBlock, /cd tools\/demo-video|\/absolute\/private\/path/u);
  assert.match(operatorBlock, /five browser chapters P2–P5 and D1/u);
  assert.match(operatorBlock, /five positive and three negative cases remain separate portal Testing entries/u);
  assert.match(
    operatorBlock,
    /Native device capture is\s+outside this browser-only V1 release scope; it is not a current release gate/u,
  );
});
