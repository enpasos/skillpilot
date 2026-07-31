#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expected = {
  SKILLPILOT_OPENAI_DE_MCP_URL: "https://mcp-v1.skillpilot.com/mcp",
  SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE: "https://mcp-v1.skillpilot.com",
  SKILLPILOT_OPENAI_DE_UI_ORIGIN: "https://ui-v1.skillpilot.com",
  SKILLPILOT_OPENAI_DE_RESOURCE_METADATA:
    "https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource",
};

for (const [name, value] of Object.entries(expected)) {
  assert.equal(
    process.env[name],
    value,
    `${name} must exactly identify the SkillPilot Coach DE V1 public contract.`,
  );
}

const deployedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
assert.match(deployedCommit, /^[0-9a-f]{40}$/);
assert.equal(
  process.env.SKILLPILOT_SERVER_BUILD,
  deployedCommit,
  "SKILLPILOT_SERVER_BUILD must equal the exact Git commit being deployed.",
);

console.log(
  `OpenAI V1 runtime configuration is pinned to ${deployedCommit}.`,
);
