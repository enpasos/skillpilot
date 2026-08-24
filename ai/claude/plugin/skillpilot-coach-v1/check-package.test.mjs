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

test("rejects loss of the duplicate-installation boundary", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      /Never enable a\s+Directory, custom and plugin-bundled SkillPilot connector together in the same\s+Claude surface or workspace/u,
      "Enable every available SkillPilot connector together in the same Claude workspace",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /duplicate Directory, custom and plugin-bundled connector installations/u,
    );
  });
});

test("rejects routing normal Claude Web through the plugin package", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      "Do not upload or install this plugin package in normal Claude Web",
      "Install this plugin package in normal Claude Web",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /normal Claude Web through the Connectors Directory/u,
    );
  });
});

test("rejects loss of the Cowork and Claude Code plugin scope", () => {
  withPackageCopy((root) => {
    mutate(root, "SETUP.md", (value) => value.replace(
      "plugin package is scoped to Claude Cowork and Claude Code",
      "plugin package is scoped to every Claude surface",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /scope the plugin package to Claude Cowork and Claude Code/u,
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
