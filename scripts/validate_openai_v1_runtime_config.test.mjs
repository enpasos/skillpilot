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
  FORBIDDEN_OPENAI_V1_URL_OVERRIDE_NAMES,
  IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAMES,
  OPENAI_V1_PUBLIC_CONTRACT,
  REMOVED_DIRECT_START_ENVIRONMENT_NAMES,
  isForbiddenOpenAiV1EnvironmentName,
  parseServiceEnvironmentFile,
  validateBuiltApplication,
  validateCanonicalPublicDefaults,
  validateExplicitPublicOverrides,
  validateOpenAiV1RuntimeConfig,
} from "./validate_openai_v1_runtime_config.mjs";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const applicationConfig = (serverBuild, serverVersion) => `
skillpilot:
  claude:
    mcp:
      server-name: skillpilot-claude
      server-version: \${SKILLPILOT_CLAUDE_MCP_SERVER_VERSION:0.1.0}
  openai:
    coach:
      v1:
        mcp-url: ${OPENAI_V1_PUBLIC_CONTRACT["mcp-url"]}
        oauth-resource: ${OPENAI_V1_PUBLIC_CONTRACT["oauth-resource"]}
        server-build: "${serverBuild}"
        mcp:
          server-name: skillpilot-coach-v1
          server-version: "${serverVersion}"
        oauth:
          protected-resource-metadata: ${OPENAI_V1_PUBLIC_CONTRACT["protected-resource-metadata"]}
`;
const canonicalSourceApplication = applicationConfig(
  "@skillpilotServerBuild@",
  "@skillpilotServerBuild@",
);
const builtApplication = applicationConfig(COMMIT, COMMIT);
const authenticatedClientEnvironment = {
  SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED: "false",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD: "private_key_jwt",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_AUDIENCE:
    "https://skillpilot.com/api/openai/v1/oauth2/token",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_CLOCK_SKEW: "PT30S",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_MAX_LIFETIME: "PT5M",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_AUTHORIZATION_POLICY_VERSION: "synthetic-jwt-1",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_ENABLED: "true",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_AUTHORIZATION_POLICY_VERSION: "synthetic-basic-1",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_CLIENT_ID: "skillpilot-synthetic-basic",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_CLIENT_SECRET: "synthetic-transition-secret-never-print",
  SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_REDIRECT_URIS: "https://chatgpt.com/connector_platform_oauth_redirect",
  SKILLPILOT_OPENAI_OAUTH_CLIENT_ASSERTION_REPLAY_CACHE_SIZE: "10000",
  SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_AUTHENTICATION_MODE: "claude-custom-confidential",
  SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_CIMD_ENABLED: "true",
  SKILLPILOT_CLAUDE_V1_OAUTH_PUBLIC_AUTHORIZATION_POLICY_VERSION: "synthetic-public-1",
  SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_ID: "skillpilot-synthetic-client",
  SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_SECRET: "synthetic-only-never-print-this-secret",
  SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD: "client_secret_basic",
  SKILLPILOT_CLAUDE_V1_OAUTH_REDIRECT_URI: "https://claude.ai/api/mcp/auth_callback",
  SKILLPILOT_CLAUDE_V1_OAUTH_AUTHORIZATION_POLICY_VERSION: "synthetic-1",
};
const unknownAssertionEnvironmentNames = [
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_AUDIENCE_TYPO",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_CLOCK_SKEWW",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_MAX_LIFETIME_EXTRA",
  // The existing replay-budget setting belongs to the shared namespace.
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ASSERTION_REPLAY_CACHE_SIZE",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONIONAL_BASIC_ENABLED",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_TRANSITIONAL_BASIC_CLIENT_SECRET_TYPO",
  "SKILLPILOT_OPENAI_COACH_V1_OAUTH_AUTHORIZATION_POLICY_VERSION_TYPO",
];

test("the fixed public contract needs no runtime URL overrides", () => {
  assert.doesNotThrow(() =>
    validateOpenAiV1RuntimeConfig({
      env: {},
      sourceApplicationYaml: canonicalSourceApplication,
    }),
  );
});

test("line-specific and process-shared environment names remain valid", () => {
  const lineEnvironment = Object.fromEntries(
    IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAMES.map((name) => [
      name,
      "test-value",
    ]),
  );
  assert.doesNotThrow(() =>
    validateExplicitPublicOverrides({
      ...lineEnvironment,
      SKILLPILOT_OPENAI_RATE_LIMIT_ENABLED: "true",
    }),
  );
  assert.ok(
    IMPLEMENTED_OPENAI_COACH_V1_ENVIRONMENT_NAMES.includes(
      "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE",
    ),
  );
});

test("independent OAuth client profiles pass namespace checks without retaining credentials", () => {
  assert.doesNotThrow(() =>
    validateExplicitPublicOverrides(authenticatedClientEnvironment),
  );
  const assignments = Object.entries(authenticatedClientEnvironment)
    .map(([name, value]) => `${name}=${value}`)
    .join("\n");
  assert.deepEqual(parseServiceEnvironmentFile(assignments), {});
});

test("retired global OAuth switch is rejected before deploy while explicit false remains valid", () => {
  const name = "SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED";
  for (const value of ["true", "TRUE", "yes", "1", "", "do-not-print-this-value"]) {
    assert.throws(() => validateExplicitPublicOverrides({ [name]: value }), /migrate explicitly/u);
    assert.throws(() => parseServiceEnvironmentFile(`${name}=${value}`), /migrate explicitly/u);
  }
  for (const value of ["false", "FALSE", '"false"', "'false'"]) {
    assert.deepEqual(parseServiceEnvironmentFile(`${name}=${value}`), {});
  }
  assert.throws(() => parseServiceEnvironmentFile(`${name}=false\n${name}=true`), /assigned more than once/u);
});

test("every implemented V1 environment binding has matching JavaScript and shell gates", () => {
  const applicationYaml = readFileSync(
    new URL("../backend/src/main/resources/application.yml", import.meta.url),
    "utf8",
  );
  const sourceNames = [...new Set([...applicationYaml.matchAll(
    /\$\{(SKILLPILOT_OPENAI_COACH_V1_[A-Z0-9_]+)[:}]/g,
  )].map((match) => match[1]))];
  assert.ok(sourceNames.length > 0);
  const allowedNames = [...new Set([
    ...sourceNames,
    ...Object.keys(authenticatedClientEnvironment),
  ])];
  for (const name of allowedNames) {
    assert.equal(isForbiddenOpenAiV1EnvironmentName(name), false, name);
  }
  const completed = spawnSync("bash", ["-c", `
source "$1"
shift
for name in "$@"; do
  if _skillpilot_openai_v1_forbidden_environment_name "$name"; then
    printf '%s\\n' "$name" >&2
    exit 1
  fi
done
`, "oauth-namespace-test", new URL(
    "./lib/openai_v1_service_environment.sh", import.meta.url,
  ).pathname, ...allowedNames], { encoding: "utf8" });
  assert.equal(completed.status, 0, completed.stderr);
});

test("removed Direct-Start environment names fail closed", () => {
  for (const name of REMOVED_DIRECT_START_ENVIRONMENT_NAMES) {
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "do-not-print" }),
      new RegExp(`${name} is obsolete and must not be set`),
    );
  }
});

test("unimplemented coach lines and misspelled V1 settings fail closed", () => {
  for (const name of [
    "SKILLPILOT_OPENAI_COACH_V1_TYPO",
    "SKILLPILOT_OPENAI_COACH_V2_ENABLED",
    "SKILLPILOT_OPENAI_COACH_V3_OAUTH_CLIENT_ID",
    "SKILLPILOT_OPENAI_COACH_V9_ENABLED",
    ...unknownAssertionEnvironmentNames,
  ]) {
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "do-not-print" }),
      new RegExp(`${name} must not be set; this coach-line setting is not implemented`),
    );
  }
});

test("all legacy provider names fail closed, including unknown suffixes", () => {
  for (const name of [
    "SKILLPILOT_OPENAI_DE_ENABLED",
    "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET",
    "SKILLPILOT_OPENAI_DE_FUTURE_SETTING",
    "SKILLPILOT_OPENAI_COACH_DE_V1_ENABLED",
    "SKILLPILOT_OPENAI_COACH_EN_V1_ENABLED",
    "SKILLPILOT_OPENAI_APPS_CHALLENGE",
  ]) {
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "do-not-print" }),
      new RegExp(`${name} is obsolete and must not be set`),
    );
  }
});

test("tempting line-specific public URL override names fail closed", () => {
  for (const name of FORBIDDEN_OPENAI_V1_URL_OVERRIDE_NAMES) {
    assert.throws(
      () => validateExplicitPublicOverrides({ [name]: "https://wrong.example" }),
      new RegExp(`${name} must not be set`),
    );
  }
});

test("systemd environment parsing retains forbidden names but never values", () => {
  const secretSentinel = "do-not-read-this";
  const parsed = parseServiceEnvironmentFile(`
# Valid secrets and unrelated settings must never enter validator diagnostics.
SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=${secretSentinel}
SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=${secretSentinel}
SKILLPILOT_OPENAI_COACH_V1_MCP_URL='https://wrong.example'
`);

  assert.deepEqual(parsed, {
    SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET: true,
    SKILLPILOT_OPENAI_COACH_V1_MCP_URL: true,
  });
  assert.throws(
    () => validateExplicitPublicOverrides(parsed),
    /SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET is obsolete/,
  );
  assert.ok(!JSON.stringify(parsed).includes(secretSentinel));
});

test("a stale systemd environment name fails before service restart", () => {
  const serviceEnvironment = parseServiceEnvironmentFile(`
SKILLPILOT_OPENAI_DE_MCP_URL=https://skillpilot.com/api/openai/de/mcp
`);

  assert.throws(
    () =>
      validateOpenAiV1RuntimeConfig({
        env: {},
        serviceEnvironment,
        sourceApplicationYaml: canonicalSourceApplication,
      }),
    /SKILLPILOT_OPENAI_DE_MCP_URL is obsolete/,
  );
});

test("duplicate forbidden assignments fail closed without reading values", () => {
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
        `SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=${secretSentinel}\n`,
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
    assert.match(completed.stderr, /SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET/);
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
      `SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=${secretSentinel}\n`,
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

    const diagnosticSessionTtlGate = runGate({
      FAKE_DIRECT_ENVIRONMENT:
        "SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=true",
    });
    assert.equal(
      diagnosticSessionTtlGate.status,
      0,
      diagnosticSessionTtlGate.stderr,
    );

    const mtlsEdgeMode = runGate({
      FAKE_DIRECT_ENVIRONMENT:
        "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe",
    });
    assert.equal(mtlsEdgeMode.status, 0, mtlsEdgeMode.stderr);

    const authenticatedAssignments = Object.entries(authenticatedClientEnvironment)
      .map(([name, value]) => `${name}=${value}`);
    for (const overrides of [
      { FAKE_DIRECT_ENVIRONMENT: authenticatedAssignments.join(" ") },
      { FAKE_PASS_ENVIRONMENT: Object.keys(authenticatedClientEnvironment).join(" ") },
      { FAKE_MANAGER_ENVIRONMENT: authenticatedAssignments.join("\n") },
    ]) {
      const authenticated = runGate(overrides);
      assert.equal(authenticated.status, 0, authenticated.stderr);
      assert.ok(!authenticated.stdout.includes(authenticatedClientEnvironment.SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_SECRET));
      assert.ok(!authenticated.stderr.includes(authenticatedClientEnvironment.SKILLPILOT_CLAUDE_V1_OAUTH_CLIENT_SECRET));
    }

    for (const name of unknownAssertionEnvironmentNames) {
      for (const overrides of [
        { FAKE_DIRECT_ENVIRONMENT: `${name}=${secretSentinel}` },
        { FAKE_PASS_ENVIRONMENT: name },
        { FAKE_MANAGER_ENVIRONMENT: `${name}=${secretSentinel}` },
      ]) {
        const rejected = runGate(overrides);
        assert.notEqual(rejected.status, 0, name);
        assert.match(rejected.stderr, new RegExp(name));
        assert.ok(!rejected.stdout.includes(secretSentinel));
        assert.ok(!rejected.stderr.includes(secretSentinel));
      }
    }

    for (const overrides of [
      { SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED: "true" },
      { FAKE_DIRECT_ENVIRONMENT: "SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED=true" },
      { FAKE_DIRECT_ENVIRONMENT: '"SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED=true"' },
      { FAKE_PASS_ENVIRONMENT: "SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED",
        FAKE_MANAGER_ENVIRONMENT: "SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED=true" },
    ]) {
      const rejected = runGate(overrides);
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, /Migration auf unabhängige Clientprofile/u);
      assert.ok(!rejected.stderr.includes(secretSentinel));
    }
    writeFileSync(environmentPath, "SKILLPILOT_OAUTH_AUTHENTICATED_CLIENTS_REQUIRED=true\n");
    assert.notEqual(runGate().status, 0);
    writeFileSync(environmentPath, `SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=${secretSentinel}\n`);

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
            "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET=direct-secret",
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
            "SKILLPILOT_OPENAI_COACH_V1_MCP_URL=https://wrong.example",
        },
        message: /darf nicht aus der globalen systemd-Umgebung stammen/,
      },
      {
        overrides: {
          FAKE_DIRECT_ENVIRONMENT:
            "SKILLPILOT_OPENAI_COACH_V9_ENABLED=true",
        },
        message: /darf nicht direkt in der systemd-Unit gesetzt sein/,
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

test("application public contract values are fixed literals in the nested line", () => {
  for (const [propertyName, expected] of Object.entries(
    OPENAI_V1_PUBLIC_CONTRACT,
  )) {
    assert.throws(
      () =>
        validateCanonicalPublicDefaults(
          canonicalSourceApplication.replace(
            `${propertyName}: ${expected}`,
            `${propertyName}: \${SKILLPILOT_OPENAI_COACH_V1_MCP_URL:https://wrong.example}`,
          ),
        ),
      new RegExp(`${propertyName} must be the exact fixed`),
    );
  }

  const legacyShape = canonicalSourceApplication
    .replace("    coach:\n      v1:\n", "    de:\n")
    .replace(/^ {8}/gm, "      ");
  assert.throws(
    () => validateCanonicalPublicDefaults(legacyShape),
    /nested skillpilot.openai.coach.v1 mapping/,
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
          '"@skillpilotServerBuild@"',
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
    '--built-application "${SKILLPILOT_BACKEND_BUILD_DIR}/resources/main/application.yml"',
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
    /if \[ "\$\{VITE_SKILLPILOT_COACH_VARIANT\}" = "openai-mcp" \]; then\n  echo "Prüfe eingebettete OpenAI-Plugin-V1-Build-ID\.\.\."\n  node \.\.\/scripts\/validate_openai_v1_runtime_config\.mjs \\\n    --built-application "\$\{SKILLPILOT_BACKEND_BUILD_DIR\}\/resources\/main\/application\.yml"/,
  );
});
