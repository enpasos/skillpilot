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
      /Do not enable the\s+bundled and standalone variants at the same time/u,
      "Both variants may be enabled at the same time",
    ));
    assert.match(
      validateClaudePluginPackage(root).errors.join("\n"),
      /duplicate bundled and standalone installations/u,
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
