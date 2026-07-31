#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");
const sourceApplicationPath = resolve(
  repositoryRoot,
  "backend/src/main/resources/application.yml",
);

export const OPENAI_V1_PUBLIC_DEFAULTS = Object.freeze({
  SKILLPILOT_OPENAI_DE_MCP_URL: "https://mcp-v1.skillpilot.com/mcp",
  SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE: "https://mcp-v1.skillpilot.com",
  SKILLPILOT_OPENAI_DE_UI_ORIGIN: "https://ui-v1.skillpilot.com",
  SKILLPILOT_OPENAI_DE_RESOURCE_METADATA:
    "https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource",
});

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applicationPropertyValues = (applicationYaml, propertyName) => {
  const propertyPattern = new RegExp(
    `^\\s*${escapeRegExp(propertyName)}:\\s*(?:"([^"]*)"|'([^']*)'|([^#\\s]+))\\s*(?:#.*)?$`,
    "gm",
  );
  return [...applicationYaml.matchAll(propertyPattern)].map(
    (match) => match[1] ?? match[2] ?? match[3],
  );
};

export function validateCanonicalPublicDefaults(applicationYaml) {
  for (const [name, expectedDefault] of Object.entries(
    OPENAI_V1_PUBLIC_DEFAULTS,
  )) {
    const placeholderPattern = new RegExp(
      `\\$\\{${escapeRegExp(name)}:([^}]*)\\}`,
      "g",
    );
    const placeholders = [...applicationYaml.matchAll(placeholderPattern)];
    assert.equal(
      placeholders.length,
      1,
      `${name} must occur exactly once with a versioned application default.`,
    );
    assert.equal(
      placeholders[0][1],
      expectedDefault,
      `${name} must default to the exact SkillPilot Coach DE V1 public contract.`,
    );
  }
}

export function validateExplicitPublicOverrides(env) {
  for (const [name, expectedValue] of Object.entries(
    OPENAI_V1_PUBLIC_DEFAULTS,
  )) {
    if (!Object.hasOwn(env, name) || env[name] === undefined) {
      continue;
    }
    assert.equal(
      env[name],
      expectedValue,
      `${name}, when explicitly set, must exactly identify the SkillPilot Coach DE V1 public contract.`,
    );
  }
}

export function validateBuiltApplication(applicationYaml, deployedCommit) {
  assert.match(
    deployedCommit,
    /^[0-9a-f]{40}$/,
    "The deployed Git commit must be a lowercase 40-character SHA.",
  );
  assert.ok(
    !applicationYaml.includes("@skillpilotOpenAiDeServerBuild@"),
    "Built application.yml must not contain the server-build source token.",
  );
  assert.ok(
    !applicationYaml.includes("${SKILLPILOT_SERVER_BUILD"),
    "Built application.yml must not depend on a runtime SKILLPILOT_SERVER_BUILD override.",
  );

  const serverBuildValues = applicationPropertyValues(
    applicationYaml,
    "server-build",
  );
  assert.deepEqual(
    serverBuildValues,
    [deployedCommit],
    "server-build in built application.yml must equal the exact Git commit being deployed.",
  );

  const openAiServerVersionMatch = applicationYaml.match(
    /^[ \t]*server-name:[ \t]*skillpilot-coach-de-v1[ \t]*(?:#.*)?\r?\n[ \t]*server-version:[ \t]*(?:"([^"]*)"|'([^']*)'|([^#\s]+))[ \t]*(?:#.*)?$/m,
  );
  assert.ok(
    openAiServerVersionMatch,
    "Built application.yml must contain the SkillPilot Coach DE V1 MCP server version.",
  );
  assert.equal(
    openAiServerVersionMatch[1] ??
      openAiServerVersionMatch[2] ??
      openAiServerVersionMatch[3],
    deployedCommit,
    "OpenAI MCP server-version in built application.yml must equal the exact Git commit being deployed.",
  );
}

export function validateOpenAiV1RuntimeConfig({
  env = process.env,
  sourceApplicationYaml = readFileSync(sourceApplicationPath, "utf8"),
  builtApplicationYaml,
  deployedCommit,
} = {}) {
  validateCanonicalPublicDefaults(sourceApplicationYaml);
  validateExplicitPublicOverrides(env);

  if (builtApplicationYaml !== undefined) {
    assert.ok(
      deployedCommit,
      "A deployed Git commit is required when validating a built application.yml.",
    );
    validateCanonicalPublicDefaults(builtApplicationYaml);
    validateBuiltApplication(builtApplicationYaml, deployedCommit);
  }
}

const parseArguments = (arguments_) => {
  if (arguments_.length === 0) {
    return {};
  }
  if (arguments_.length === 2 && arguments_[0] === "--built-application") {
    return { builtApplicationPath: resolve(arguments_[1]) };
  }
  throw new Error(
    "Usage: node scripts/validate_openai_v1_runtime_config.mjs [--built-application <path>]",
  );
};

export function main(arguments_ = process.argv.slice(2)) {
  const { builtApplicationPath } = parseArguments(arguments_);
  const deployedCommit = execFileSync(
    "git",
    ["rev-parse", "--verify", "HEAD^{commit}"],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  ).trim();
  const builtApplicationYaml = builtApplicationPath
    ? readFileSync(builtApplicationPath, "utf8")
    : undefined;

  validateOpenAiV1RuntimeConfig({
    builtApplicationYaml,
    deployedCommit,
  });

  if (builtApplicationPath) {
    console.log(
      `OpenAI V1 built runtime configuration is pinned to ${deployedCommit}.`,
    );
  } else {
    console.log(
      "OpenAI V1 public runtime configuration uses verified application defaults or exact explicit overrides.",
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main();
}
