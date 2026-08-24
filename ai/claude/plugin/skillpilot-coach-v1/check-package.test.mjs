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

test("rejects loss of the paid Web, Desktop and Cowork plugin contract", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /The public SkillPilot plugin is the preferred complete\s+installation for eligible paid Claude Web chat, Desktop Chat and Cowork\s+users/u,
      "The public SkillPilot plugin is optional for a few unspecified Claude users",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /preferred complete paid Web\/Desktop\/Cowork installation/u,
    );
  });
});

test("rejects loss of the Skill surface and Cowork-only capability boundary", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /The SkillPilot coaching Skill works in paid Claude Web chat, Desktop Chat and\s+Cowork/u,
      "The SkillPilot coaching Skill works only in Cowork",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /Skill on paid Web\/Desktop\/Cowork/u,
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

test("rejects Claude Free or native-mobile plugin claims", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value
      .replace("The plugin is not available on Claude Free", "The plugin is available on Claude Free")
      .replace("does not claim native mobile plugin support", "claims native mobile plugin support"));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /reject Claude Free and native-mobile plugin claims/u,
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
    ["native mobile", "The SkillPilot plugin supports native-mobile plugin support."],
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
