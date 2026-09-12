import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { publicationFiles, validateClaudePluginPackage } from "./check-package.mjs";
import { instructionByteLimits, validateClaudeCoachInstructions } from "./check-instructions.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const instructionPaths = {
  skill: "skills/skillpilot-coach-v1/SKILL.md",
  recall: "skills/skillpilot-coach-v1/references/verified-recall.md",
  exams: "skills/skillpilot-coach-v1/references/exams.md",
};

test("validates the checked-in Claude plugin package", () => {
  assert.deepEqual(validateClaudePluginPackage(packageRoot), { errors: [], toolCount: 14 });
});

test("rejects a replacement candidate version other than 1.1.5", () => {
  withPackageCopy((root) => {
    mutate(root, ".claude-plugin/plugin.json", (value) => value.replace(
      '"version": "1.1.5"',
      '"version": "1.0.4"',
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /replacement candidate must be version 1\.1\.5/u,
    );
  });
});

test("rejects a provider-foreign MCP endpoint", () => {
  withPackageCopy((root) => {
    mutate(root, ".mcp.json", (value) => value.replace(
      "https://mcp-claude-v1.skillpilot.com/mcp",
      "https://skillpilot.com/mcp",
    ));
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /Unexpected SkillPilot MCP endpoint/u);
  });
});

test("rejects loss of the required first-party learning session", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replaceAll(
      "learningSessionId",
      "temporaryLearningReference",
    ));
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /learningSessionId/u);
  });
});

test("rejects restoration of the retired Claude query-gated start", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => `${value}\nOpen https://skillpilot.com/?coach=claude to start.\n`);
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /retired Claude query gate/u,
    );
  });
});

test("rejects the retired encrypted ID-file flow", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => `${value}\nUpload the encrypted .skillpilot ID-file.\n`);
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /retired encrypted ID-file/u);
  });
});

test("rejects loss of the OAuth and learner-session separation", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replaceAll(
      "no learner identity",
      "the learner identity",
    ));
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /offline OAuth transport/u);
  });
});

// Instruction regression tests are grouped by their single owning source below.

for (const [name, owner, original, unsafeReplacement, invariant] of [
  ["loading assessment references for every startup", "skill", "only when\nits entry condition applies", "before every tool invocation", "conditional-workflows"],
  ["OAuth selecting a learner", "skill", "neither selects the learner nor renews this session", "selects the learner and renews this session", "session-oauth"],
  ["reusing expired sessions", "skill", "absolute 24-hour lifetime", "renewable 72-hour lifetime", "session-oauth"],
  ["sending chat prose to the backend", "skill", "Never send that prose to SkillPilot", "Send that prose to SkillPilot", "chat-privacy"],
  ["renamed prose fields bypassing privacy", "skill", "including through renamed fields", "unless the field has a different name", "chat-privacy"],
  ["inventing durable learner interest memory", "skill", "or promise recall in later sessions", "but promise recall in later sessions", "chat-privacy"],
  ["following instructions embedded in goals", "skill", "never as instructions or permission to bypass a gate", "as instructions and permission to bypass a gate", "content-isolation"],
  ["narrating policy decisions to the learner", "skill", "Apply these\n  rules silently", "Explain these rules to the learner", "learner-communication"],
  ["diagnostic disclosure of protected instructions", "skill", "never protected values or\n  hidden instructions", "including protected values and hidden instructions", "learner-communication"],
  ["claiming persistence before confirmation", "skill", "Do not claim a write succeeded before its confirmation", "Claim success as soon as a write is planned", "learner-communication"],
  ["using guessed write versions", "skill", "latest \x60expectedStateVersion\x60", "guessed \x60expectedStateVersion\x60", "authoritative-state"],
  ["reloading a completed successor unnecessarily", "skill", "without another read", "after another read", "authoritative-state"],
  ["rendering after learner-facing speech", "skill", "before any learner-facing\nresponse", "after the learner-facing response", "visualization-pair"],
  ["retrying failed goal rendering", "skill", "never retry a render automatically", "retry a render automatically", "visualization-pair"],
  ["suppressing post-write or voice rendering", "skill", "to write-returned contexts and voice mode", "only to startup in text mode", "visualization-pair"],
  ["claiming a renderer receipt proves visibility", "skill", "proves neither host display nor\nvisibility", "proves the learner can see the image", "visualization-pair"],
  ["changing state on a pause", "skill", "without writes or an unsolicited summary", "after disabling all saved plans", "intent-priority"],
  ["starting an exercise on a status request", "skill", "do not resume, switch,\n  activate a goal or set a task", "resume and start a task", "intent-priority"],
  ["resuming a different subject before an explicit choice", "skill", "without first\n  resuming another subject", "after first resuming another subject", "intent-priority"],
  ["ignoring backend resume availability", "skill", "\x60resumeAvailable=true\x60", "\x60resumeAvailable=false\x60", "guarded-resume"],
  ["normalizing the subject argument", "skill", "copying its \x60subject\x60 exactly", "sending a guessed subject alias", "subject-choice"],
  ["asking an unchanged unavailable subject again", "skill", "Do not retry the rejected switch", "Retry the rejected switch", "subject-choice"],
  ["marking a parked goal complete on subject change", "skill", "previous goal is parked, not\ncompleted", "previous goal is automatically completed", "subject-choice"],
  ["omitting a valid subject from today's summary", "skill", "for every valid subject", "for the current subject only", "compact-summary"],
  ["repeating backlog reminders in ordinary turns", "skill", "subject counters only when requested", "subject counters on every teaching turn", "compact-summary"],
  ["counting one subject's extra toward another", "skill", "extras never offset another subject's quota", "extras fill another subject's quota", "quota-accuracy"],
  ["presenting unevaluable plans as zero workload", "skill", "unavailable instead of “0 of 0”", "“0 of 0 done”", "quota-accuracy"],
  ["automatically assigning extra after the daily quota", "skill", "requires an explicit request for voluntary extra", "happens automatically after quota completion", "daily-guidance"],
  ["letting a subject request bypass the completed daily quota", "skill", "governs subject requests and already\nactive goals", "governs only already active goals", "daily-complete-precedence"],
  ["continuing an active goal without voluntary extra after the daily quota", "skill", "governs subject requests and already\nactive goals", "governs only subject requests", "daily-complete-precedence"],
  ["reversing daily completion precedence over subject and active-goal requests", "skill", "guard also governs subject requests", "guard does not govern subject requests", "daily-complete-precedence"],
  ["claiming blocked plans complete", "skill", "without\nclaiming completion", "while claiming completion", "daily-guidance"],
  ["lowering ordinary evidence to a guided answer", "skill", "two independent checks", "one heavily guided answer", "ordinary-evidence"],
  ["choosing the successor in a completion write", "skill", "backend alone selects its successor", "coach selects its successor", "ordinary-evidence"],
  ["testing subject knowledge in orientation", "skill", "Do not test knowledge or correctness", "Test knowledge and correctness", "orientation-not-assessment"],
  ["completing orientation on a bare interest label", "skill", "interest choice starts a tailored follow-up, not completion", "interest choice completes the orientation", "orientation-not-assessment"],
  ["reconfirming a clear request to leave orientation", "skill", "without another confirmation or narrated completion", "after asking for another confirmation", "orientation-not-assessment"],
  ["rewriting the learner's published focus payload", "skill", "complete unchanged \x60goalIds\x60", "approximately matched \x60goalIds\x60", "learner-agency"],
  ["using app-only card rating from the model", "skill", "never call \x60review_skillpilot_memory_practice_card\x60 yourself", "call \x60review_skillpilot_memory_practice_card\x60 yourself", "private-memory-practice"],
  ["treating ordinary due-card practice as mastery", "skill", "today's cards is not memory-goal mastery", "today's cards establishes memory-goal mastery", "private-memory-practice"],
  ["inferring a client type to control tools", "skill", "never ask for or infer a\ndevice/client type", "infer a device/client type", "accessible-tasks"],
  ["generating visuals in voice mode", "skill", "In voice mode, create no\nClaude-generated images", "In voice mode, create Claude-generated images", "accessible-tasks"],
  ["counting provided graph facts as learner evidence", "skill", "not mastery evidence", "valid mastery evidence", "accessible-tasks"],
  ["continuing from an unconfirmed write", "skill", "do not continue from an unconfirmed\nwrite", "continue from an unconfirmed write", "failure-recovery"],
  ["releasing Recall answers before the complete batch", "recall", "only after the complete learner submission", "before the complete learner submission", "recall-answer-gate"],
  ["using a model-selected Recall subset", "recall", "do not supply a goal, subset, count or order", "select a goal, subset, count and order", "recall-answer-gate"],
  ["restoring free-text Recall result feedback", "recall", "exactly \x60cardId\x60 and \x60passed\x60", "\x60cardId\x60, \x60passed\x60 and learner-answer feedback", "recall-results"],
  ["submitting a partial Recall batch", "recall", "or send a partial batch", "but send a partial batch when convenient", "recall-results"],
  ["continuing the stale memory goal after Recall", "recall", "Do not continue\n   the old memory goal", "Continue the old memory goal", "recall-results"],
  ["fetching exam evaluation before a complete submission", "exams", "before calling \x60get_skillpilot_exam_evaluation\x60", "after calling \x60get_skillpilot_exam_evaluation\x60", "exam-answer-gate"],
  ["revealing the exam rubric before submission", "exams", "do not disclose a\n   passing threshold or scoring rubric", "disclose the passing threshold and scoring rubric", "exam-answer-gate"],
  ["rejecting equivalent correct exam methods", "exams", "receive equal\n   credit", "receive no credit", "exam-evaluation"],
  ["marking a failing exam complete", "exams", "Only for a final passing result", "For every submitted result", "exam-evaluation"],
  ["coaching an active exam through follow-up questions", "exams", "without follow-up coaching questions", "by asking follow-up coaching questions", "exam-evaluation"],
  ["substituting easier practice inside an active exam", "exams", "substitute easier practice", "omit difficult work", "exam-visual-fallback"],
]) {
  test("rejects " + name, () => {
    const instructions = readInstructions();
    assert.ok(instructions[owner].includes(original), "The negative scenario must mutate current instructions.");
    instructions[owner] = instructions[owner].replace(original, unsafeReplacement);
    const errors = validateClaudeCoachInstructions(instructions);
    assert.ok(errors.some((error) => error.includes("Coach invariant " + invariant + " ")),
      "Missing " + invariant + " failure for: " + name + "\n" + errors.join("\n"));
  });
}

test("accepts Markdown and line-wrap changes without duplicating semantic rules", () => {
  const instructions = readInstructions();
  for (const owner of Object.keys(instructions)) {
    instructions[owner] = instructions[owner].replaceAll("\x60", "")
      .split(/\n\s*\n/u).map((paragraph) => {
        if (paragraph.startsWith("#") || paragraph.startsWith("---")) return paragraph;
        return paragraph.replace(/\s+/gu, " ").replace(/(.{1,88})\s+/gu, "$1\n");
      }).join("\n\n");
  }
  assert.deepEqual(validateClaudeCoachInstructions(instructions), []);
});

test("rejects a missing protected workflow reference before packaging", () => {
  for (const owner of ["recall", "exams"]) {
    withPackageCopy((root) => {
      rmSync(resolve(root, instructionPaths[owner]));
      assert.match(validateClaudePluginPackage(root).errors.join("\n"),
        /Missing or unreadable skills\/skillpilot-coach-v1\/references\//u);
    });
  }
});

test("publishes one common Skill and only the two conditional workflow references", () => {
  assert.deepEqual(publicationFiles, [
    ".claude-plugin/plugin.json",
    ".mcp.json",
    "README.md",
    "SETUP.md",
    instructionPaths.skill,
    instructionPaths.recall,
    instructionPaths.exams,
  ]);
});

test("rejects restoring an eager mandatory policy load", () => {
  for (const addedRule of [
    "Read all references before every coaching turn.",
    "Read [the coaching policy](references/coaching-policy.md) before using a SkillPilot tool.",
  ]) {
    const instructions = readInstructions();
    instructions.skill += `\n${addedRule}\n`;
    assert.match(validateClaudeCoachInstructions(instructions).join("\n"),
      /conditional|duplicate coaching-policy/u);
  }
});

test("rejects duplicate common paragraphs in a specialty reference", () => {
  const instructions = readInstructions();
  const paragraph = instructions.skill.split(/\n\s*\n/u)
    .find((value) => value.length >= 100 && !value.startsWith("#") && !value.startsWith("---"));
  assert.ok(paragraph, "The fixture must contain a common coaching paragraph.");
  instructions.recall += `\n\n${paragraph}\n`;
  assert.match(validateClaudeCoachInstructions(instructions).join("\n"), /Duplicate coaching paragraph/u);
});

test("keeps the concise instruction budgets separate from publication documentation", () => {
  for (const [owner, budget] of Object.entries(instructionByteLimits)) {
    const instructions = readInstructions();
    instructions[owner] += `\n${"x".repeat(budget)}\n`;
    assert.match(validateClaudeCoachInstructions(instructions).join("\n"), /instruction byte budget/u);
  }
});

test("rejects chat-derived mastery fields in every instruction owner", () => {
  for (const owner of Object.keys(instructionPaths)) {
    for (const field of ["workFeedback", "outcomeFeedback"]) {
      const instructions = readInstructions();
      instructions[owner] += `\nSend ${field} with the completion write.\n`;
      assert.match(validateClaudeCoachInstructions(instructions).join("\n"),
        /Mastery must send only structured completion data/u);
    }
  }
});

test("rejects missing workflow tools across the instruction owners", () => {
  withPackageCopy((root) => {
    for (const relativePath of Object.values(instructionPaths)) {
      const target = resolve(root, relativePath);
      writeFileSync(target, readFileSync(target, "utf8")
        .replaceAll("record_skillpilot_verified_recall_results", "record_recall"));
    }
    assert.match(validateClaudePluginPackage(root).errors.join("\n"),
      /Coach instructions must cover record_skillpilot_verified_recall_results/u);
  });
});

test("rejects provider-internal subject or orientation selection identifiers", () => {
  for (const field of ["subjectLabel", "landscapeId", "orientationPathId"]) {
    withPackageCopy((root) => {
      mutate(root, instructionPaths.skill, (value) => `${value}\nSend ${field}.\n`);
      assert.match(validateClaudePluginPackage(root).errors.join("\n"),
        /provider-internal plan identifiers|orientation or successor selection identifier/u);
    });
  }
});

test("rejects loss of same-server coexistence and custom-connector boundaries", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /A plugin and Directory installation that reference this exact remote MCP URL may coexist;\s+Claude exposes one set of tools for the shared server/u,
      "Plugin and Directory installations can never coexist",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /same-server plugin and Directory coexistence/u,
    );
  });
});

test("rejects conflation of historical observations with 1.1.5 acceptance", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /Earlier packages were\s+observed in paid Claude Web chat and, after account-level direct installation\s+on Claude Pro, in the native Claude app on Android/u,
      "The 1.1.5 package already passed every exact-client check",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /distinguish historical observations from pending 1\.1\.5 exact-candidate acceptance/u,
    );
  });
});

test("rejects expansion beyond the Claude Web and Android publication scope", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /The v1 publication scope is limited to eligible paid Claude Chat on the Web and\s+the native Android app after account-level installation/u,
      "SkillPilot Coach v1 is supported everywhere",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /v1 publication scope limited to eligible paid Claude Web and verified native Android chat/u,
    );
  });
});

test("rejects loss of the public README release boundary", () => {
  withPackageCopy((root) => {
    mutate(root, "README.md", (value) => value.replace(
      /Its product scope is limited to eligible paid\s+Claude Chat on the Web and the native Android app/u,
      "available on every Claude surface",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /README.md must state the Web-and-Android direct-install boundary/u,
    );
  });
});

test("rejects loss of the independent Connector Directory lane", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /The Connectors Directory remains a\s+separate connector-only distribution route with its own Team\/Enterprise\s+submission gate and is not a prerequisite for plugin submission/u,
      "The Connectors Directory submission is required before plugin submission",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /independent Connector Directory lane/u,
    );
  });
});

test("rejects Claude Free, iOS or Android in-app installation claims", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value
      .replace("The plugin is not available on Claude Free", "The plugin is available on Claude Free")
      .replace("does not claim iOS plugin support", "claims iOS plugin support")
      .replace("installation from inside the Android app", "installation nowhere"));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /reject Claude Free, iOS and Android in-app installation claims/u,
    );
  });
});

test("rejects attribution of connector tools or UIs to the plugin shell", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /All fourteen MCP tools and both interactive MCP Apps come from the remote\s+SkillPilot connector/u,
      "The plugin shell supplies the MCP tools and interactive MCP Apps",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /attribute all tools and interactive UIs to the connector/u,
    );
  });
});

test("rejects appended contradictory Claude distribution claims", () => {
  for (const [name, appendedClaim] of [
    ["Claude Free", "The SkillPilot plugin is available on Claude Free."],
    ["Android in-app installation", "The SkillPilot plugin can be installed from inside the Android app."],
    ["unqualified native mobile", "The SkillPilot plugin supports native-mobile plugin support."],
    ["iOS", "The SkillPilot plugin supports native Claude iOS Chat."],
    ["Claude Desktop Chat", "The SkillPilot plugin supports Claude Desktop Chat."],
    ["Claude Cowork", "The SkillPilot plugin supports Claude Cowork."],
    ["public Claude Code", "The SkillPilot plugin supports public Claude Code."],
    ["historical Desktop/Cowork claim", "The public SkillPilot plugin is the preferred complete installation for eligible paid Claude Web chat, Desktop Chat and Cowork users."],
    ["Skill subject", "The SkillPilot coaching Skill works in paid Claude Web chat, Desktop Chat and Cowork."],
    ["Markdown line wrap", "The SkillPilot plugin supports\nClaude Desktop Chat."],
    ["passive modal", "The SkillPilot plugin can be used in Claude Cowork."],
    ["coexistence prohibition", "Plugin and Directory installations must never coexist."],
    ["plugin tool ownership", "The plugin shell owns all fourteen tools and both MCP Apps UIs."],
  ]) {
    withPackageCopy((root) => {
      mutate(root, "SETUP.md", (value) => `${value}\n${appendedClaim}\n`);
      assert.ok(
        validateClaudePluginPackage(root).errors.some((error) => (
          error.includes("forbidden contradictory Claude distribution claim")
        )),
        `${name} append-only contradiction must be rejected`,
      );
    });
  }
});

test("allows explicit negative Claude surface boundaries", () => {
  for (const claim of [
    "The SkillPilot plugin provides no support for Claude Desktop Chat.",
    "The SkillPilot plugin includes no Claude Cowork support.",
    "The SkillPilot plugin supports neither Claude Desktop Chat nor Cowork.",
    "The SkillPilot plugin supports paid Web and Android chat, not Claude Desktop Chat.",
    "The SkillPilot plugin does not claim installation from inside the Android app.",
    "The SkillPilot plugin provides no support for Claude iOS Chat.",
  ]) {
    withPackageCopy((root) => {
      mutate(root, "SETUP.md", (value) => `${value}\n${claim}\n`);
      assert.ok(
        !validateClaudePluginPackage(root).errors.some((error) => (
          error.includes("forbidden contradictory Claude distribution claim")
        )),
        `explicit negative boundary must be allowed: ${claim}`,
      );
    });
  }
});

function withPackageCopy(callback) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-plugin-"));
  try {
    cpSync(packageRoot, root, { recursive: true });
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function mutate(root, relativePath, transform) {
  const target = resolve(root, relativePath);
  const original = readFileSync(target, "utf8");
  const mutated = transform(original);
  assert.notEqual(mutated, original, `Mutation must change ${relativePath}.`);
  writeFileSync(target, mutated);
}

function readInstructions() {
  return Object.fromEntries(Object.entries(instructionPaths).map(([owner, path]) =>
    [owner, readFileSync(resolve(packageRoot, path), "utf8")]));
}
