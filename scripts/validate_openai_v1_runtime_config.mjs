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

export const OPENAI_V1_PUBLIC_CONTRACT = Object.freeze({
  "mcp-url": "https://mcp-coach-v1.skillpilot.com/mcp",
  "oauth-resource": "https://mcp-coach-v1.skillpilot.com/mcp",
  "protected-resource-metadata":
    "https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
});

// These names look plausible, but making a public contract URL configurable
// would let one Spring process silently serve the V1 implementation under a
// different public identity. The public URLs therefore remain literal release
// contract values; Nginx owns the external-to-internal route mapping.
export const FORBIDDEN_OPENAI_V1_URL_OVERRIDE_NAMES = Object.freeze([
  "SKILLPILOT_OPENAI_COACH_V1_MCP_URL",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_RESOURCE",
  "SKILLPILOT_OPENAI_COACH_V1_RESOURCE_METADATA",
  "SKILLPILOT_OPENAI_COACH_V1_RESOURCE_METADATA_URL",
  "SKILLPILOT_OPENAI_COACH_V1_PROTECTED_RESOURCE_METADATA",
  "SKILLPILOT_OPENAI_COACH_V1_PROTECTED_RESOURCE_METADATA_URL",
  "SKILLPILOT_OPENAI_COACH_V1_UI_ORIGIN",
  "SKILLPILOT_OPENAI_MCP_URL",
  "SKILLPILOT_OPENAI_OAUTH_RESOURCE",
  "SKILLPILOT_OPENAI_RESOURCE_METADATA",
  "SKILLPILOT_OPENAI_RESOURCE_METADATA_URL",
  "SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA",
  "SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA_URL",
  "SKILLPILOT_OPENAI_UI_ORIGIN",
]);

const LEGACY_OPENAI_ENVIRONMENT_PREFIXES = Object.freeze([
  "SKILLPILOT_OPENAI_DE_",
  "SKILLPILOT_OPENAI_COACH_DE_",
  "SKILLPILOT_OPENAI_COACH_EN_",
]);
const LEGACY_OPENAI_APPS_CHALLENGE = "SKILLPILOT_OPENAI_APPS_CHALLENGE";
export const REMOVED_DIRECT_START_ENVIRONMENT_NAMES = Object.freeze([
  "SKILLPILOT_OPENAI_SECURE_COOKIE",
  "SKILLPILOT_OPENAI_BINDING_TTL",
  "SKILLPILOT_OPENAI_LAUNCH_TTL",
  "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_REQUESTS",
  "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_CAPABILITY_REQUESTS",
  "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_PROCESS_GLOBAL_REQUESTS",
  "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_ISSUER_REQUESTS",
  "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_ISSUER_PROCESS_GLOBAL_REQUESTS",
]);
const COACH_LINE_ENVIRONMENT_NAME =
  /^SKILLPILOT_OPENAI_COACH_V[1-9][0-9]*_[A-Z0-9_]+$/;
export const IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAMES = Object.freeze([
  "SKILLPILOT_OPENAI_COACH_V1_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_WORKFLOW_VERSION",
  "SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE",
  "SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ID",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_REDIRECT_URIS",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_JWK_SET_URI",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_SIGNING_ALGORITHM",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_LEGACY_CLIENT_IDS",
]);
const IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAME_SET = new Set(
  IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAMES,
);

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

const yamlIndentation = (line) => /^ */.exec(line)?.[0].length ?? 0;

const yamlMappingBlock = (applicationYaml, path) => {
  const lines = applicationYaml.split(/\r?\n/);
  let searchStart = 0;
  let searchEnd = lines.length;
  let parentIndent = -2;
  let mappingLineIndex = -1;

  for (const segment of path) {
    const indentation = parentIndent + 2;
    const mappingPattern = new RegExp(
      `^ {${indentation}}${escapeRegExp(segment)}:\\s*(?:#.*)?$`,
    );
    mappingLineIndex = -1;
    for (let index = searchStart; index < searchEnd; index += 1) {
      if (mappingPattern.test(lines[index])) {
        mappingLineIndex = index;
        break;
      }
    }
    assert.notEqual(
      mappingLineIndex,
      -1,
      `application.yml must contain the nested ${path.join(".")} mapping.`,
    );

    let mappingEnd = searchEnd;
    for (let index = mappingLineIndex + 1; index < searchEnd; index += 1) {
      const line = lines[index];
      if (line.trim() === "" || line.trimStart().startsWith("#")) {
        continue;
      }
      if (yamlIndentation(line) <= indentation) {
        mappingEnd = index;
        break;
      }
    }

    searchStart = mappingLineIndex + 1;
    searchEnd = mappingEnd;
    parentIndent = indentation;
  }

  return lines.slice(mappingLineIndex + 1, searchEnd).join("\n");
};

export function isForbiddenOpenAiV1EnvironmentName(name) {
  return (
    LEGACY_OPENAI_ENVIRONMENT_PREFIXES.some((prefix) =>
      name.startsWith(prefix),
    ) ||
    name === LEGACY_OPENAI_APPS_CHALLENGE ||
    REMOVED_DIRECT_START_ENVIRONMENT_NAMES.includes(name) ||
    FORBIDDEN_OPENAI_V1_URL_OVERRIDE_NAMES.includes(name) ||
    (COACH_LINE_ENVIRONMENT_NAME.test(name) &&
      !IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAME_SET.has(name))
  );
}

export function validateCanonicalPublicDefaults(applicationYaml) {
  const openAiV1Block = yamlMappingBlock(applicationYaml, [
    "skillpilot",
    "openai",
    "coach",
    "v1",
  ]);
  for (const [propertyName, expectedValue] of Object.entries(
    OPENAI_V1_PUBLIC_CONTRACT,
  )) {
    assert.deepEqual(
      applicationPropertyValues(openAiV1Block, propertyName),
      [expectedValue],
      `${propertyName} must be the exact fixed SkillPilot Coach V1 public contract value.`,
    );
  }
}

export function validateExplicitPublicOverrides(env) {
  for (const name of Object.keys(env)) {
    if (!isForbiddenOpenAiV1EnvironmentName(name)) {
      continue;
    }
    if (FORBIDDEN_OPENAI_V1_URL_OVERRIDE_NAMES.includes(name)) {
      assert.fail(
        `${name} must not be set; the V1 public URL is fixed by the release contract.`,
      );
    }
    if (COACH_LINE_ENVIRONMENT_NAME.test(name)) {
      assert.fail(
        `${name} must not be set; this coach-line setting is not implemented by the current shared Spring server.`,
      );
    }
    if (REMOVED_DIRECT_START_ENVIRONMENT_NAMES.includes(name)) {
      assert.fail(
        `${name} is obsolete and must not be set; the unpublished provider-side Direct-Start runtime was removed.`,
      );
    }
    assert.fail(
      `${name} is obsolete and must not be set; use a line-specific SKILLPILOT_OPENAI_COACH_V1_* or shared SKILLPILOT_OPENAI_* setting.`,
    );
  }
}

export function parseServiceEnvironmentFile(environmentFile) {
  const forbiddenEnvironmentNames = {};

  for (const rawLine of environmentFile.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    const assignment = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (
      assignment === null ||
      !isForbiddenOpenAiV1EnvironmentName(assignment[1])
    ) {
      continue;
    }

    const name = assignment[1];
    if (Object.hasOwn(forbiddenEnvironmentNames, name)) {
      throw new Error(
        `${name} is assigned more than once in the service environment file.`,
      );
    }
    // Deliberately do not retain or parse the value. A legacy variable may be
    // a client secret, and diagnostics need only its name to fail closed.
    forbiddenEnvironmentNames[name] = true;
  }

  return forbiddenEnvironmentNames;
}

export function validateBuiltApplication(applicationYaml, deployedCommit) {
  assert.match(
    deployedCommit,
    /^[0-9a-f]{40}$/,
    "The deployed Git commit must be a lowercase 40-character SHA.",
  );
  assert.ok(
    !applicationYaml.includes("@skillpilotServerBuild@"),
    "Built application.yml must not contain the server-build source token.",
  );
  assert.ok(
    !applicationYaml.includes("${SKILLPILOT_SERVER_BUILD"),
    "Built application.yml must not depend on a runtime SKILLPILOT_SERVER_BUILD override.",
  );

  const openAiV1Block = yamlMappingBlock(applicationYaml, [
    "skillpilot",
    "openai",
    "coach",
    "v1",
  ]);
  const serverBuildValues = applicationPropertyValues(
    openAiV1Block,
    "server-build",
  );
  assert.deepEqual(
    serverBuildValues,
    [deployedCommit],
    "server-build in built application.yml must equal the exact Git commit being deployed.",
  );

  const openAiServerVersionMatch = applicationYaml.match(
    /^[ \t]*server-name:[ \t]*skillpilot-coach-v1[ \t]*(?:#.*)?\r?\n[ \t]*server-version:[ \t]*(?:"([^"]*)"|'([^']*)'|([^#\s]+))[ \t]*(?:#.*)?$/m,
  );
  assert.ok(
    openAiServerVersionMatch,
    "Built application.yml must contain the SkillPilot Coach V1 MCP server version.",
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
  serviceEnvironment = {},
  sourceApplicationYaml = readFileSync(sourceApplicationPath, "utf8"),
  builtApplicationYaml,
  deployedCommit,
} = {}) {
  validateCanonicalPublicDefaults(sourceApplicationYaml);
  validateExplicitPublicOverrides(env);
  validateExplicitPublicOverrides(serviceEnvironment);

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
  const parsed = {};
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (value === undefined) {
      throw new Error(`Missing value for ${option}.`);
    }
    if (option === "--built-application") {
      if (parsed.builtApplicationPath !== undefined) {
        throw new Error("--built-application may be specified only once.");
      }
      parsed.builtApplicationPath = resolve(value);
      continue;
    }
    if (option === "--service-environment-file") {
      if (parsed.serviceEnvironmentPath !== undefined) {
        throw new Error(
          "--service-environment-file may be specified only once.",
        );
      }
      parsed.serviceEnvironmentPath = resolve(value);
      continue;
    }
    throw new Error(`Unknown option: ${option}.`);
  }
  return parsed;
};

export function main(arguments_ = process.argv.slice(2)) {
  const { builtApplicationPath, serviceEnvironmentPath } =
    parseArguments(arguments_);
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
  const serviceEnvironment = serviceEnvironmentPath
    ? parseServiceEnvironmentFile(
        readFileSync(serviceEnvironmentPath, "utf8"),
      )
    : {};

  validateOpenAiV1RuntimeConfig({
    serviceEnvironment,
    builtApplicationYaml,
    deployedCommit,
  });

  if (builtApplicationPath && serviceEnvironmentPath) {
    console.log(
      `OpenAI V1 built and systemd runtime configuration are pinned to ${deployedCommit}.`,
    );
  } else if (builtApplicationPath) {
    console.log(
      `OpenAI V1 built runtime configuration is pinned to ${deployedCommit}.`,
    );
  } else if (serviceEnvironmentPath) {
    console.log(
      "OpenAI V1 systemd runtime configuration uses the line-specific/shared environment namespace and fixed public contract URLs.",
    );
  } else {
    console.log(
      "OpenAI V1 runtime configuration uses the line-specific/shared environment namespace and fixed public contract URLs.",
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main();
}
