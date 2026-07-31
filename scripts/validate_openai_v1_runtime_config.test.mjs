import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  OPENAI_V1_PUBLIC_DEFAULTS,
  REMOVED_OPENAI_V1_PUBLIC_OVERRIDES,
  parseServiceEnvironmentFile,
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

test("systemd environment files expose only canonical public URL overrides", () => {
  const parsed = parseServiceEnvironmentFile(`
# Secrets and unrelated settings must never enter validator diagnostics.
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=do-not-read-this
SKILLPILOT_OPENAI_DE_MCP_URL='https://mcp-coach-de-v1.skillpilot.com/mcp'
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA="https://mcp-coach-de-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"
`);

  assert.deepEqual(parsed, {
    SKILLPILOT_OPENAI_DE_MCP_URL:
      OPENAI_V1_PUBLIC_DEFAULTS.SKILLPILOT_OPENAI_DE_MCP_URL,
    SKILLPILOT_OPENAI_DE_RESOURCE_METADATA:
      OPENAI_V1_PUBLIC_DEFAULTS.SKILLPILOT_OPENAI_DE_RESOURCE_METADATA,
  });
  assert.doesNotThrow(() => validateExplicitPublicOverrides(parsed));
  assert.ok(!Object.hasOwn(parsed, "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET"));
});

test("the retired custom UI-origin override fails closed", () => {
  assert.deepEqual(REMOVED_OPENAI_V1_PUBLIC_OVERRIDES, [
    "SKILLPILOT_OPENAI_DE_UI_ORIGIN",
  ]);
  assert.throws(
    () =>
      validateExplicitPublicOverrides({
        SKILLPILOT_OPENAI_DE_UI_ORIGIN: "https://ui-v1.skillpilot.com",
      }),
    /must not be set; the V1 draft uses the OpenAI sandbox origin/,
  );
  assert.throws(
    () =>
      validateCanonicalPublicDefaults(
        `${canonicalSourceApplication}\nui-origin: \${SKILLPILOT_OPENAI_DE_UI_ORIGIN:https://ui-v1.skillpilot.com}`,
      ),
    /must not configure a custom MCP UI domain/,
  );
});

test("a stale systemd environment-file URL fails before service restart", () => {
  const serviceEnvironment = parseServiceEnvironmentFile(`
SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA=https://skillpilot.com/api/openai/de/oauth/protected-resource
`);

  assert.throws(
    () =>
      validateOpenAiV1RuntimeConfig({
        env: {},
        serviceEnvironment,
        sourceApplicationYaml: canonicalSourceApplication,
      }),
    /SKILLPILOT_OPENAI_DE_MCP_URL, when explicitly set/,
  );
});

test("malformed targeted values fail without parsing unrelated secrets", () => {
  assert.throws(
    () =>
      parseServiceEnvironmentFile(`
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET='unterminated
SKILLPILOT_OPENAI_DE_MCP_URL='unterminated
`),
    /SKILLPILOT_OPENAI_DE_MCP_URL has an unsupported quoted value on environment-file line 3/,
  );
});

test("duplicate public URL assignments fail closed", () => {
  assert.throws(
    () =>
      parseServiceEnvironmentFile(`
SKILLPILOT_OPENAI_DE_MCP_URL=https://mcp-v1.skillpilot.com/mcp
SKILLPILOT_OPENAI_DE_MCP_URL=https://mcp-v1.skillpilot.com/mcp
`),
    /SKILLPILOT_OPENAI_DE_MCP_URL is assigned more than once/,
  );
});

test("CLI failure never exposes unrelated service secrets", () => {
  const directory = mkdtempSync(
    resolve(tmpdir(), "skillpilot-runtime-environment-test-"),
  );
  const environmentPath = resolve(directory, "skillpilot.env");
  const secretSentinel = "never-print-this-oauth-secret";
  try {
    writeFileSync(
      environmentPath,
      `SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=${secretSentinel}\n` +
        "SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp\n",
    );
    const completed = spawnSync(
      process.execPath,
      [
        new URL(
          "./validate_openai_v1_runtime_config.mjs",
          import.meta.url,
        ).pathname,
        "--service-environment-file",
        environmentPath,
      ],
      { encoding: "utf8", env: process.env },
    );
    assert.notEqual(completed.status, 0);
    assert.ok(!completed.stdout.includes(secretSentinel));
    assert.ok(!completed.stderr.includes(secretSentinel));
    assert.match(completed.stderr, /SKILLPILOT_OPENAI_DE_MCP_URL/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("systemd service environment gate executes all supported override channels", () => {
  const directory = mkdtempSync(
    resolve(tmpdir(), "skillpilot-systemd-environment-test-"),
  );
  const environmentPath = resolve(directory, "skillpilot.env");
  const fakeSystemctlPath = resolve(directory, "systemctl");
  const secretSentinel = "never-print-this-service-secret";
  try {
    writeFileSync(
      environmentPath,
      `SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=${secretSentinel}\n`,
    );
    writeFileSync(
      fakeSystemctlPath,
      `#!/usr/bin/env bash
set -eu
if [ "\${1:-}" = "show-environment" ]; then
  printf '%s' "\${FAKE_MANAGER_ENVIRONMENT:-}"
  exit 0
fi
property=""
for argument in "$@"; do
  case "\${argument}" in
    --property=*) property="\${argument#--property=}" ;;
  esac
done
case "\${property}" in
  EnvironmentFiles) printf '%s\\n' "\${FAKE_ENVIRONMENT_FILES:-}" ;;
  Environment) printf '%s\\n' "\${FAKE_DIRECT_ENVIRONMENT:-}" ;;
  PassEnvironment) printf '%s\\n' "\${FAKE_PASS_ENVIRONMENT:-}" ;;
  *) exit 2 ;;
esac
`,
    );
    chmodSync(fakeSystemctlPath, 0o755);

    const baselineEnvironment = {
      ...process.env,
      LIBRARY_PATH: new URL(
        "./lib/openai_v1_service_environment.sh",
        import.meta.url,
      ).pathname,
      VALIDATOR_PATH: new URL(
        "./validate_openai_v1_runtime_config.mjs",
        import.meta.url,
      ).pathname,
      NODE_BIN: process.execPath,
      FAKE_SYSTEMCTL: fakeSystemctlPath,
      FAKE_SERVICE_ENV_FILE: environmentPath,
      FAKE_ENVIRONMENT_FILES: `${environmentPath} (ignore_errors=no)`,
      FAKE_DIRECT_ENVIRONMENT: "UNRELATED_DIRECT_SETTING=value",
      FAKE_PASS_ENVIRONMENT: "UNRELATED_PASSED_SETTING",
      FAKE_MANAGER_ENVIRONMENT: "LANG=C",
    };
    const command =
      'source "$LIBRARY_PATH"; ' +
      'validate_openai_v1_service_environment "$FAKE_SYSTEMCTL" skillpilot ' +
      '"$FAKE_SERVICE_ENV_FILE" "$NODE_BIN" "$VALIDATOR_PATH"';
    const runGate = (overrides = {}) =>
      spawnSync("bash", ["-c", command], {
        encoding: "utf8",
        env: { ...baselineEnvironment, ...overrides },
      });

    const passing = runGate();
    assert.equal(passing.status, 0, passing.stderr);
    assert.ok(!passing.stdout.includes(secretSentinel));
    assert.ok(!passing.stderr.includes(secretSentinel));

    const missingEnvironmentPath = resolve(directory, "missing.env");
    const optionalMissing = runGate({
      FAKE_SERVICE_ENV_FILE: missingEnvironmentPath,
      FAKE_ENVIRONMENT_FILES:
        `${missingEnvironmentPath} (ignore_errors=yes)`,
    });
    assert.equal(optionalMissing.status, 0, optionalMissing.stderr);
    assert.match(optionalMissing.stdout, /optionale EnvironmentFile fehlt/);

    const requiredMissing = runGate({
      FAKE_SERVICE_ENV_FILE: missingEnvironmentPath,
      FAKE_ENVIRONMENT_FILES:
        `${missingEnvironmentPath} (ignore_errors=no)`,
    });
    assert.notEqual(requiredMissing.status, 0);
    assert.match(requiredMissing.stderr, /verpflichtende EnvironmentFile/);

    const blockedDirectory = resolve(directory, "blocked");
    const blockedEnvironmentPath = resolve(blockedDirectory, "skillpilot.env");
    mkdirSync(blockedDirectory);
    writeFileSync(blockedEnvironmentPath, "");
    chmodSync(blockedDirectory, 0o644);
    try {
      const inaccessible = runGate({
        FAKE_SERVICE_ENV_FILE: blockedEnvironmentPath,
        FAKE_ENVIRONMENT_FILES:
          `${blockedEnvironmentPath} (ignore_errors=yes)`,
      });
      assert.equal(inaccessible.status, 0, inaccessible.stderr);
      assert.match(inaccessible.stdout, /EnvironmentFile ist root-geschützt/);
    } finally {
      chmodSync(blockedDirectory, 0o700);
    }

    if (process.getuid?.() !== 0) {
      chmodSync(environmentPath, 0o000);
      try {
        const unreadable = runGate();
        assert.equal(unreadable.status, 0, unreadable.stderr);
        assert.match(unreadable.stdout, /EnvironmentFile ist root-geschützt/);
      } finally {
        chmodSync(environmentPath, 0o600);
      }
    }

    const failureCases = [
      {
        overrides: {
          FAKE_ENVIRONMENT_FILES:
            `${environmentPath} (ignore_errors=no) ` +
            "/etc/skillpilot/second.env (ignore_errors=no)",
        },
        message: /muss genau die erwartete EnvironmentFile/,
      },
      {
        overrides: {
          FAKE_DIRECT_ENVIRONMENT:
            "SKILLPILOT_OPENAI_DE_MCP_URL=https://mcp-v1.skillpilot.com/mcp",
        },
        message: /darf nicht direkt in der systemd-Unit gesetzt sein/,
      },
      {
        overrides: {
          FAKE_PASS_ENVIRONMENT: "SKILLPILOT_OPENAI_DE_MCP_URL",
        },
        message: /darf nicht über systemd PassEnvironment übernommen werden/,
      },
      {
        overrides: {
          FAKE_MANAGER_ENVIRONMENT:
            "SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp",
        },
        message: /darf nicht aus der globalen systemd-Umgebung stammen/,
      },
    ];
    for (const failureCase of failureCases) {
      const completed = runGate(failureCase.overrides);
      assert.notEqual(completed.status, 0);
      assert.match(completed.stderr, failureCase.message);
      assert.ok(!completed.stdout.includes(secretSentinel));
      assert.ok(!completed.stderr.includes(secretSentinel));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
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
  const assetCopyPosition = deploymentScript.indexOf(
    'echo "Deploying Vocabulary Decks..."',
  );
  const serviceEnvironmentValidationPosition = deploymentScript.lastIndexOf(
    "validate_openai_v1_service_environment",
  );
  const serviceEnvironmentLibrary = readFileSync(
    new URL("./lib/openai_v1_service_environment.sh", import.meta.url),
    "utf8",
  );

  assert.ok(backendBuildPosition >= 0);
  assert.ok(serviceEnvironmentValidationPosition >= 0);
  assert.ok(assetCopyPosition > serviceEnvironmentValidationPosition);
  assert.ok(builtValidationPosition > backendBuildPosition);
  assert.ok(restartPosition > serviceEnvironmentValidationPosition);
  assert.match(
    serviceEnvironmentLibrary,
    /--property=EnvironmentFiles[\s\S]*--property=Environment[\s\S]*--property=PassEnvironment[\s\S]*show-environment/,
  );
  assert.ok(!serviceEnvironmentLibrary.includes(`source "\${service_env_file}"`));
  assert.ok(!serviceEnvironmentLibrary.includes(`eval "\${service_env_file}"`));
  assert.ok(restartPosition > builtValidationPosition);
  assert.match(
    deploymentScript,
    /if \[ "\$\{VITE_SKILLPILOT_COACH_VARIANT\}" = "openai-mcp" \]; then\n  echo "Prüfe eingebettete OpenAI-Plugin-V1-Build-ID\.\.\."\n  node \.\.\/scripts\/validate_openai_v1_runtime_config\.mjs \\\n    --built-application build\/resources\/main\/application\.yml/,
  );
});
