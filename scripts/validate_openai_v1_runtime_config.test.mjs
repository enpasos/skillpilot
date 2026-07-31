import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  OPENAI_V1_PUBLIC_DEFAULTS,
  validateBuiltApplication,
  validateCanonicalPublicDefaults,
  validateExplicitPublicOverrides,
  validateOpenAiV1RuntimeConfig,
} from "./validate_openai_v1_runtime_config.mjs";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const canonicalSourceApplication = Object.entries(OPENAI_V1_PUBLIC_DEFAULTS)
  .map(([name, value]) => `property-${name}: \${${name}:${value}}`)
  .join("\n");
const builtApplication = `${canonicalSourceApplication}
skillpilot:
  claude:
    mcp:
      server-name: skillpilot-claude
      server-version: \${SKILLPILOT_CLAUDE_MCP_SERVER_VERSION:0.1.0}
  openai:
    de:
      server-build: "${COMMIT}"
      mcp:
        server-name: skillpilot-coach-de-v1
        server-version: "${COMMIT}"
`;

test("missing public overrides safely use the verified application defaults", () => {
  assert.doesNotThrow(() =>
    validateOpenAiV1RuntimeConfig({
      env: {},
      sourceApplicationYaml: canonicalSourceApplication,
    }),
  );
});

test("exact explicit public overrides remain valid", () => {
  assert.doesNotThrow(() =>
    validateExplicitPublicOverrides({ ...OPENAI_V1_PUBLIC_DEFAULTS }),
  );
});

test("an explicit empty or different public override fails closed", () => {
  for (const name of Object.keys(OPENAI_V1_PUBLIC_DEFAULTS)) {
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "" }),
      new RegExp(`${name}, when explicitly set`),
    );
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "https://wrong.example" }),
      new RegExp(`${name}, when explicitly set`),
    );
  }
});

test("application defaults themselves must remain exactly versioned", () => {
  const [name, expected] = Object.entries(OPENAI_V1_PUBLIC_DEFAULTS)[0];
  assert.throws(
    () =>
      validateCanonicalPublicDefaults(
        canonicalSourceApplication.replace(expected, "https://wrong.example"),
      ),
    new RegExp(`${name} must default`),
  );
});

test("built application pins server build and MCP server version to the commit", () => {
  assert.doesNotThrow(() =>
    validateBuiltApplication(builtApplication, COMMIT),
  );
});

test("built application rejects stale SHAs and unresolved build placeholders", () => {
  assert.throws(
    () =>
      validateBuiltApplication(
        builtApplication.replace(
          `server-build: "${COMMIT}"`,
          `server-build: "${"f".repeat(40)}"`,
        ),
        COMMIT,
      ),
    /server-build in built application.yml/,
  );
  assert.throws(
    () =>
      validateBuiltApplication(
        builtApplication.replace(
          `server-version: "${COMMIT}"`,
          `server-version: "${"f".repeat(40)}"`,
        ),
        COMMIT,
      ),
    /OpenAI MCP server-version in built application.yml/,
  );
  assert.throws(
    () =>
      validateBuiltApplication(
        builtApplication.replace(
          `"${COMMIT}"`,
          '"@skillpilotOpenAiDeServerBuild@"',
        ),
        COMMIT,
      ),
    /must not contain the server-build source token/,
  );
  assert.throws(
    () =>
      validateBuiltApplication(
        builtApplication.replace(
          `"${COMMIT}"`,
          "${SKILLPILOT_SERVER_BUILD:dev}",
        ),
        COMMIT,
      ),
    /must not depend on a runtime SKILLPILOT_SERVER_BUILD override/,
  );
});

test("repository application.yml carries all verified public defaults", () => {
  const applicationYaml = readFileSync(
    new URL("../backend/src/main/resources/application.yml", import.meta.url),
    "utf8",
  );
  assert.doesNotThrow(() => validateCanonicalPublicDefaults(applicationYaml));
});

test("deployment validates the generated application only for the OpenAI coach before restart", () => {
  const deploymentScript = readFileSync(
    new URL("./deploy.sh", import.meta.url),
    "utf8",
  );
  const backendBuildPosition = deploymentScript.indexOf(
    "./gradlew clean build -x test",
  );
  const builtValidationPosition = deploymentScript.indexOf(
    "--built-application build/resources/main/application.yml",
  );
  const restartPosition = deploymentScript.indexOf('echo "Starte Service neu..."');

  assert.ok(backendBuildPosition >= 0);
  assert.ok(builtValidationPosition > backendBuildPosition);
  assert.ok(restartPosition > builtValidationPosition);
  assert.match(
    deploymentScript,
    /if \[ "\$\{VITE_SKILLPILOT_COACH_VARIANT\}" = "openai-mcp" \]; then\n  echo "Prüfe eingebettete OpenAI-Plugin-V1-Build-ID\.\.\."\n  node \.\.\/scripts\/validate_openai_v1_runtime_config\.mjs \\\n    --built-application build\/resources\/main\/application\.yml/,
  );
});
