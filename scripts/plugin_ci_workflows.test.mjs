import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const readWorkflow = (name) => readFileSync(
  new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8',
)
const ci = readWorkflow('ci.yml')
const marketplace = readWorkflow('claude-marketplace.yml')
const dialogs = readWorkflow('openai-dialog-regression.yml')

test('paid dialogs run only on trusted default-branch code with bounded dedicated credentials', () => {
  assert.doesNotMatch(dialogs, /pull_request|pull_request_target|continue-on-error|secrets: inherit/u)
  assert.match(dialogs, /github\.event\.repository\.default_branch/u)
  assert.match(dialogs, /vars\.OPENAI_DIALOG_EVAL_ENABLED == 'true'/u)
  assert.match(dialogs, /contents: read/u)
  assert.match(dialogs, /secrets\.OPENAI_EVAL_API_KEY/u)
  assert.equal(dialogs.match(/secrets\./gu)?.length, 1)
  assert.match(dialogs, /node scripts\/openai_dialog_eval\.mjs run --out-dir tmp\/openai-dialog-ci/u)
  assert.match(dialogs, /path: tmp\/openai-dialog-ci\/report\.json/u)
  assert.match(ci, /node --test scripts\/openai_dialog_eval\.test\.mjs scripts\/openai_dialog_assertions\.test\.mjs/u)
})

test('plugin CI stays focused on current releases', () => {
  for (const workflow of [ci, marketplace]) {
    assert.doesNotMatch(workflow, /check_openai_plugin_review_freeze(?:\.test)?\.mjs/u)
    assert.doesNotMatch(workflow, /verify_openai_review_video(?:\.test)?\.mjs/u)
    assert.doesNotMatch(workflow, /^\s*- name:.*\b(?:rejected|review freeze|review history|historical review)\b/imu)
  }
})

test('current source validation is independent of archived review-video bytes and digest', () => {
  // Isolate the filesystem shim in a subprocess: do not rename shared history
  // or weaken the separate archival integrity checker for this regression.
  const validationUrl = new URL('./check_openai_plugin_versioning.mjs', import.meta.url).href
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import { syncBuiltinESMExports } from 'node:module';
    const originalRead = fs.readFileSync;
    const originalExists = fs.existsSync;
    const isHistoricalVideo = (path) => String(path).replaceAll('\\\\', '/').includes('/openai-review/');
    let dossierWasRead = false;
    fs.existsSync = (path) => !isHistoricalVideo(path) && originalExists(path);
    fs.readFileSync = (path, ...args) => {
      assert.equal(isHistoricalVideo(path), false, 'Current validation must not read an archived review video.');
      const contents = originalRead(path, ...args);
      if (String(path).endsWith('/docs/deploy/openai-plugin-v1-submission.md')) {
        dossierWasRead = true;
        return contents.replace(/[0-9a-f]{64}/gu, 'historical-digest-omitted');
      }
      return contents;
    };
    syncBuiltinESMExports();
    await import(${JSON.stringify(validationUrl)});
    assert.equal(dossierWasRead, true, 'Regression must exercise the isolated dossier read without requiring historical text to remain.');
  `], { encoding: 'utf8', timeout: 60_000 })
  assert.equal(result.error, undefined)
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stdout, /plugin and version contract check passed/u)
})

test('current OpenAI contract, submission and runtime checks remain active', () => {
  for (const command of [
    'npm --prefix "ai/openai app" test',
    'scripts/openai_plugin_release.test.mjs',
    'scripts/plugin_ci_workflows.test.mjs',
    'scripts/check_openai_plugin_versioning.mjs',
    'scripts/check_openai_coach_v11_candidate.test.mjs',
    'scripts/openai_plugin_submission.test.mjs',
    'scripts/openai_plugin_submission.mjs check',
    'scripts/validate_openai_v1_runtime_config.test.mjs',
    'scripts/validate_openai_v1_runtime_config.mjs',
  ]) assert(ci.includes(command), `Current check missing: ${command}`)
})

test('Claude package and publication validation remains independent', () => {
  for (const command of [
    'npm --prefix ai/claude/app test',
    'node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs',
    'node scripts/claude_direct_install_beta_release.mjs verify',
  ]) assert(ci.includes(command), `Claude check missing: ${command}`)
  for (const command of [
    'node scripts/claude_direct_install_beta_release.mjs verify',
    'node --test scripts/claude_marketplace_release.test.mjs',
    ...['check', 'prepare', 'validate-cli', 'smoke-local']
      .map((action) => `node scripts/claude_marketplace_release.mjs ${action}`),
  ]) assert(marketplace.includes(command), `Marketplace check missing: ${command}`)
})

test('CI retains only reproducible non-secret submission worksheets after validation and audit', () => {
  const upload = ci.match(/      - name: Retain checked OpenAI submission worksheets\n([\s\S]*?)(?=\n  [\w-]+:)/u)?.[1]
  assert.ok(upload, 'Missing prepared submission artifact')
  assert.match(upload, /uses: actions\/upload-artifact@v6/u)
  assert.match(upload, /if-no-files-found: error/u)
  assert.doesNotMatch(upload, /if:.*always\(/u)
  const paths = upload.match(/          path: \|\n((?:            .+\n)+)/u)?.[1]
    .trim().split('\n').map(line => line.trim())
  assert.deepEqual(paths, ['portal-draft.json', 'preparation.json', 'acceptance-guide.md', 'trace-template.json']
    .map(name => `ai/openai plugin/skillpilot-coach-v1/submission/generated/${name}`))
  assert.ok(ci.indexOf('scripts/openai_plugin_submission.mjs check') < ci.indexOf('Audit MCP App dependencies'))
  assert.ok(ci.indexOf('Audit MCP App dependencies') < ci.indexOf('Retain checked OpenAI submission worksheets'))
})
