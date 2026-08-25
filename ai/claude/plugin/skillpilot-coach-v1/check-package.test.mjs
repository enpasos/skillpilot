import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateClaudePluginPackage } from "./check-package.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));

test("validates the checked-in Claude plugin package", () => {
  assert.deepEqual(validateClaudePluginPackage(packageRoot), { errors: [], toolCount: 12 });
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

test("rejects loss of the learner presentation boundary", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      "do not narrate tool calls",
      "may narrate tool calls",
    ));
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /learner presentation boundary/u);
  });
});

test("rejects incomplete coverage of the twelve-tool contract", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      "`get_skillpilot_exam_evaluation`",
      "the exam evaluation operation",
    ));
    assert.match(validateClaudePluginPackage(root).errors.join("\n"), /get_skillpilot_exam_evaluation/u);
  });
});

test("rejects loss of the mandatory post-reload goal-visualization render", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      /immediate next\s+SkillPilot tool/u,
      "optional later SkillPilot tool",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /one immediate goal-visualization render per unseen goal\/state pair/u,
    );
  });
});

test("rejects client-type inference as a substitute for Claude-known modality", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      "Use only the current interaction mode already known to Claude.",
      "Infer interaction mode from the connected client type.",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /separate Claude-known interaction mode from client type/u,
    );
  });
});

test("rejects Claude-generated visuals in voice mode", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/references/coaching-policy.md", (value) => value.replace(
      "In voice mode, do not create or request Claude-generated images",
      "In voice mode, create Claude-generated images",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /suppress Claude-generated visuals in voice mode/u,
    );
  });
});

test("rejects suppressing approved goal rendering in voice mode", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      /A server-approved\s+`goalVisualization` is not Claude-generated/u,
      "A server-approved `goalVisualization` follows the same suppression rule",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /preserve approved goal rendering/u,
    );
  });
});

test("rejects image-dependent coaching tasks or incomplete graph wording", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/references/coaching-policy.md", (value) => value.replace(
      /fully understandable and solvable\s+from its spoken or written wording alone/u,
      "understandable after inspecting the visual",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /keep every task text-complete/u,
    );
  });
});

test("rejects visual-only learner evidence in voice mode", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/references/coaching-policy.md", (value) => value.replace(
      /every learner answer is present in the current conversation,\s+including any spoken or written responses/u,
      "every answer is visibly displayed",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /spoken and written learner evidence equally/u,
    );
  });
});

test("rejects leaking protected component content into voice dialogue", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      /This never authorizes reproducing content that a\s+protected workflow keeps inside a private component\./u,
      "Read every private component aloud.",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /suppress Claude-generated visuals in voice mode/u,
    );
  });
});

test("rejects counting accessibility graph givens as mastery evidence", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/references/coaching-policy.md", (value) => value.replace(
      "Never ask the learner to recover a value already supplied for",
      "Ask the learner to repeat every value already supplied for",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /keep every task text-complete/u,
    );
  });
});

test("rejects alternative-practice scaffolding during an active exam", () => {
  withPackageCopy((root) => {
    mutate(root, "skills/skillpilot-coach-v1/SKILL.md", (value) => value.replace(
      "For an active exam, pause without",
      "For an active exam, immediately offer practice with",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /keep every task text-complete/u,
    );
  });
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

test("rejects conflation of the Web-and-Android direct-install pilot with public listing", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /The package has been observed in paid Claude Web chat\s+and, after account-level direct installation on Claude Pro, in the native\s+Claude app on Android/u,
      "The direct-install pilot proves official public distribution",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /distinguish the Web-and-Android direct-install pilot from post-publication listing verification/u,
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
      /All twelve MCP tools and both interactive MCP Apps come from the remote\s+SkillPilot connector/u,
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
    ["plugin tool ownership", "The plugin shell owns all twelve tools and both MCP Apps UIs."],
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
  writeFileSync(target, transform(readFileSync(target, "utf8")));
}
