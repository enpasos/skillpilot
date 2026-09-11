import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const workflow = readFileSync(new URL('../.github/workflows/oauth-client-authentication.yml', import.meta.url), 'utf8')
const postgresSuite = 'com.skillpilot.backend.oauth.OAuthClientSecurityPostgresIntegrationTest'
const reportGuard = workflow.match(/python3 - <<'PY'\n([\s\S]*?)\n          PY/u)?.[1]
  .split('\n').map(line => line.replace(/^ {10}/u, '')).join('\n')
const providerGuard = workflow.match(/python3 - <<'PY_PROVIDER'\n([\s\S]*?)\n          PY_PROVIDER/u)?.[1]
  .split('\n').map(line => line.replace(/^ {10}/u, '')).join('\n')
const requiredProviderSuites = [
  'com.skillpilot.backend.openai.de.oauth.OpenAiDeClientAssertionDecoderFactoryTest',
  'com.skillpilot.backend.openai.de.oauth.OpenAiDePinnedJwkSourceTest',
  'com.skillpilot.backend.openai.de.oauth.OpenAiDePrivateKeyJwtFlowIntegrationTest',
  'com.skillpilot.backend.openai.de.oauth.OpenAiDeClientProfilesTest',
  'com.skillpilot.backend.openai.de.oauth.OpenAiDeCimdMetadataGateTest',
  'com.skillpilot.backend.oauth.OAuthTokenRevocationBoundaryTest',
  'com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinatorTest',
  'com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinatorTest',
  'com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthLegacyClientCutoverTest',
  'com.skillpilot.backend.openai.de.OpenAiDeSecureModeConfigurationTest',
  'com.skillpilot.backend.openai.de.health.OpenAiDeCoachHealthIndicatorTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1ConfidentialOAuthIntegrationTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1ConfidentialPostOAuthIntegrationTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1ClientPolicyTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1PublicRefreshFamilyIntegrationTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1RefreshTokenFamiliesTest',
  'com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1OAuthBoundaryFilterTest',
  'com.skillpilot.backend.connectors.claude.v1.ClaudeV1RuntimeValidationTest',
  'com.skillpilot.backend.connectors.claude.v1.ClaudeV1CrossProviderIsolationTest',
  'com.skillpilot.backend.connectors.claude.v1.ClaudeV1SecurityChainIntegrationTest',
  'com.skillpilot.backend.claude.oauth.ClaudeOAuthStrictModeTest',
  'com.skillpilot.backend.claude.oauth.ClaudeOAuthFlowIntegrationTest',
  'com.skillpilot.backend.oauth.JdbcOAuthClientAssertionReplayStoreTest',
  'com.skillpilot.backend.oauth.AuthenticatedClientPolicyTest',
  'com.skillpilot.backend.oauth.IndependentClientProfilePolicyTest',
  'com.skillpilot.backend.oauth.OAuthProfileDiagnosticsFilterTest',
  'com.skillpilot.backend.oauth.CombinedProviderOAuthIsolationIntegrationTest',
  'com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationServiceTest',
  'com.skillpilot.backend.oauth.ProviderScopedRegisteredClientRepositoryTest',
  'com.skillpilot.backend.oauth.OAuthAuthorizationCodeExchangeGuardTest',
]

test('OAuth security is repeatable without production credentials or paid host calls', () => {
  for (const trigger of ['workflow_dispatch:', 'schedule:', 'pull_request:', 'push:']) {
    assert.ok(workflow.includes(trigger), `Missing trigger ${trigger}`)
  }
  assert.match(workflow, /contents: read/u)
  assert.doesNotMatch(workflow, /pull_request_target|continue-on-error|secrets\.|OPENAI_API_KEY|OPENAI_EVAL_API_KEY/u)
  assert.match(workflow, /node --test scripts\/oauth_client_auth_ci\.test\.mjs/u)
  assert.match(workflow, /node --test scripts\/check_oauth_profile_release\.test\.mjs scripts\/validate_openai_v1_runtime_config\.test\.mjs/u)
  assert.match(workflow, /node scripts\/check_oauth_profile_release\.mjs/u)
  assert.doesNotMatch(workflow, /check_oauth_profile_release\.mjs --profile/u,
    'Scheduled local CI must not demand unperformed real-host acceptance or deploy a profile')
})

test('OAuth security covers both providers and requires the real PostgreSQL lane', () => {
  for (const suite of [
    'com.skillpilot.backend.openai.de.oauth.*Test',
    'com.skillpilot.backend.openai.de.health.OpenAiDeCoachHealthIndicatorTest',
    'com.skillpilot.backend.connectors.claude.v1.oauth.*Test',
    'com.skillpilot.backend.connectors.claude.v1.ClaudeV1CrossProviderIsolationTest',
    'com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinatorTest',
    'com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinatorTest',
    'com.skillpilot.backend.claude.oauth.ClaudeOAuthStrictModeTest',
    'com.skillpilot.backend.claude.oauth.ClaudeOAuthFlowIntegrationTest',
    'com.skillpilot.backend.oauth.JdbcOAuthClientAssertionReplayStoreTest',
    'com.skillpilot.backend.oauth.AuthenticatedClientPolicyTest',
    'com.skillpilot.backend.oauth.IndependentClientProfilePolicyTest',
    'com.skillpilot.backend.oauth.OAuthProfileDiagnosticsFilterTest',
    'com.skillpilot.backend.oauth.CombinedProviderOAuthIsolationIntegrationTest',
    'com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationServiceTest',
    'com.skillpilot.backend.oauth.ProviderScopedRegisteredClientRepositoryTest',
    'com.skillpilot.backend.oauth.OAuthAuthorizationCodeExchangeGuardTest',
    'com.skillpilot.backend.oauth.OAuthTokenRevocationBoundaryTest',
    postgresSuite,
  ]) assert.ok(workflow.includes(`--tests '${suite}'`), `Missing security suite ${suite}`)
  assert.match(workflow, /image: postgres@sha256:[0-9a-f]{64}/u)
  assert.match(workflow, /SKILLPILOT_OAUTH_POSTGRES_TEST_ENABLED: 'true'/u)
  assert.match(workflow, /SKILLPILOT_OAUTH_TEST_POSTGRES_URL: jdbc:postgresql:\/\/127\.0\.0\.1:5432\/skillpilot_oauth_test/u)
  assert.match(workflow, /SKILLPILOT_OAUTH_TEST_POSTGRES_USER: postgres/u)
  assert.match(workflow, /SKILLPILOT_OAUTH_TEST_POSTGRES_PASSWORD: skillpilot-test-only/u)
  assert.match(workflow, /--rerun-tasks/u)
  assert.match(workflow, /Require executed PostgreSQL evidence without skipped tests\n        if: always\(\)/u)
  assert.match(workflow, /Require executed provider-security evidence without skipped tests\n        if: always\(\)/u)
  assert.equal(workflow.match(/if-no-files-found: error/gu)?.length, 2)
  assert.equal(workflow.match(/< \.corretto-version/gu)?.length, 2)
  assert.equal(workflow.match(/- '\.corretto-version'/gu)?.length, 2)
  for (const suite of requiredProviderSuites) {
    assert.ok(providerGuard?.includes(`'${suite}'`), `Missing mandatory provider evidence ${suite}`)
    assert.ok(existsSync(new URL(`../backend/src/test/java/${suite.replaceAll('.', '/')}.java`, import.meta.url)),
      `Missing provider-security test source ${suite}`)
  }
})

function runReportGuard(guard, xmlBySuite) {
  assert.ok(guard, 'Missing mandatory XML report guard')
  const directory = mkdtempSync(join(tmpdir(), 'skillpilot-oauth-ci-'))
  try {
    const reports = join(directory, 'backend/build/test-results/test')
    mkdirSync(reports, { recursive: true })
    for (const [suite, xml] of Object.entries(xmlBySuite)) {
      writeFileSync(join(reports, `TEST-${suite}.xml`), xml)
    }
    const result = spawnSync('python3', ['-c', guard], { cwd: directory, encoding: 'utf8' })
    assert.equal(result.error, undefined)
    return result
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function checkReport(xml) {
  return runReportGuard(reportGuard, xml === null ? {} : { [postgresSuite]: xml })
}

function passingReport(suite) {
  return `<testsuite name="${suite}" tests="1" skipped="0" errors="0" failures="0"><testcase name="securityBoundary"/></testsuite>`
}

test('PostgreSQL evidence gate accepts an executed, passing test suite', () => {
  const result = checkReport(passingReport(postgresSuite))
  assert.equal(result.status, 0, result.stderr)
})

test('PostgreSQL evidence gate rejects absent, empty, skipped, wrong or failing suites', () => {
  for (const xml of [
    null,
    `<testsuite name="${postgresSuite}" tests="0"/>`,
    `<testsuite name="wrong" tests="1"><testcase name="atomicReplay"/></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1" skipped="1"><testcase name="atomicReplay"><skipped/></testcase></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1" failures="1"><testcase name="atomicReplay"><failure/></testcase></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1" errors="1"><testcase name="atomicReplay"><error/></testcase></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1"/>`,
    `<testsuite name="${postgresSuite}" tests="1"><testcase name="atomicReplay"><skipped/></testcase></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="2"><testcase name="atomicReplay"/></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1"><testcase name="atomicReplay"><failure/></testcase></testsuite>`,
    `<testsuite name="${postgresSuite}" tests="1"><testcase name="atomicReplay"><error/></testcase></testsuite>`,
    '<malformed',
  ]) assert.notEqual(checkReport(xml).status, 0, `Incorrect pass for ${xml}`)
})

test('Provider evidence gate requires every critical suite to execute successfully', () => {
  const reports = Object.fromEntries(requiredProviderSuites.map(suite => [suite, passingReport(suite)]))
  const result = runReportGuard(providerGuard, reports)
  assert.equal(result.status, 0, result.stderr)
  assert.notEqual(runReportGuard(providerGuard, {}).status, 0)
  for (const suite of requiredProviderSuites) {
    const incomplete = { ...reports }
    delete incomplete[suite]
    assert.notEqual(runReportGuard(providerGuard, incomplete).status, 0, `Accepted missing suite ${suite}`)
  }
})

test('Provider evidence gate rejects skipped, failed, inconsistent and extra broken reports', () => {
  const reports = Object.fromEntries(requiredProviderSuites.map(suite => [suite, passingReport(suite)]))
  const suite = requiredProviderSuites[0]
  for (const xml of [
    `<testsuite name="${suite}" tests="0"/>`,
    '<testsuite name="wrong" tests="1"><testcase/></testsuite>',
    `<testsuite name="${suite}" tests="1" skipped="1"><testcase/></testsuite>`,
    `<testsuite name="${suite}" tests="1" failures="1"><testcase/></testsuite>`,
    `<testsuite name="${suite}" tests="1" errors="1"><testcase/></testsuite>`,
    `<testsuite name="${suite}" tests="2"><testcase/></testsuite>`,
    `<testsuite name="${suite}" tests="1"><testcase><skipped/></testcase></testsuite>`,
    `<testsuite name="${suite}" tests="1"><testcase><failure/></testcase></testsuite>`,
    `<testsuite name="${suite}" tests="1"><testcase><error/></testcase></testsuite>`,
    '<malformed',
  ]) assert.notEqual(runReportGuard(providerGuard, { ...reports, [suite]: xml }).status, 0,
    `Accepted invalid provider report ${xml}`)
  assert.notEqual(runReportGuard(providerGuard, {
    ...reports,
    'additional.SecurityTest': '<testsuite name="additional.SecurityTest" tests="1"><testcase><skipped/></testcase></testsuite>',
  }).status, 0, 'Accepted skipped extra test selected by a provider wildcard')
})
