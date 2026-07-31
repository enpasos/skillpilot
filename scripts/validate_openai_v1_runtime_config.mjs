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
  SKILLPILOT_OPENAI_DE_MCP_URL:
    "https://mcp-coach-de-v1.skillpilot.com/mcp",
  SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE:
    "https://mcp-coach-de-v1.skillpilot.com/mcp",
  SKILLPILOT_OPENAI_DE_RESOURCE_METADATA:
    "https://mcp-coach-de-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
});

export const REMOVED_OPENAI_V1_PUBLIC_OVERRIDES = Object.freeze([
  "SKILLPILOT_OPENAI_DE_UI_ORIGIN",
]);

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
  for (const name of REMOVED_OPENAI_V1_PUBLIC_OVERRIDES) {
    assert.equal(
      applicationYaml.includes(`\${${name}`),
      false,
      `${name} must not configure a custom MCP UI domain for the V1 draft.`,
    );
  }
}

export function validateExplicitPublicOverrides(env) {
  for (const name of REMOVED_OPENAI_V1_PUBLIC_OVERRIDES) {
    assert.equal(
      !Object.hasOwn(env, name) || env[name] === undefined,
      true,
      `${name} must not be set; the V1 draft uses the OpenAI sandbox origin.`,
    );
  }
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

export function parseServiceEnvironmentFile(environmentFile) {
  const publicNames = new Set([
    ...Object.keys(OPENAI_V1_PUBLIC_DEFAULTS),
    ...REMOVED_OPENAI_V1_PUBLIC_OVERRIDES,
  ]);
  const publicOverrides = {};

  for (const [index, rawLine] of environmentFile.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    const assignment = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (assignment === null || !publicNames.has(assignment[1])) {
      continue;
    }

    const [, name, rawValue] = assignment;
    if (Object.hasOwn(publicOverrides, name)) {
      throw new Error(
        `${name} is assigned more than once in the service environment file.`,
      );
    }
    publicOverrides[name] = parseServiceEnvironmentValue(
      name,
      rawValue,
      index + 1,
    );
  }

  return publicOverrides;
}

function parseServiceEnvironmentValue(name, rawValue, lineNumber) {
  const value = rawValue.trim();
  if (value.startsWith("\"") || value.startsWith("'")) {
    const quote = value[0];
    if (value.length < 2 || value.at(-1) !== quote) {
      throw new Error(
        `${name} has an unsupported quoted value on environment-file line ${lineNumber}.`,
      );
    }
    const unquoted = value.slice(1, -1);
    if (unquoted.includes("\\") || unquoted.includes(quote)) {
      throw new Error(
        `${name} has unsupported escaping on environment-file line ${lineNumber}.`,
      );
    }
    return unquoted;
  }
  if (/\s|["'\\]/.test(value)) {
    throw new Error(
      `${name} has an unsupported value on environment-file line ${lineNumber}.`,
    );
  }
  return value;
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
      "OpenAI V1 systemd runtime configuration uses verified application defaults or exact explicit overrides.",
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
