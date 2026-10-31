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

test('demo-video CI installs its own pinned browser before browser-dependent tests', () => {
  const installStepName = '      - name: Install browser demo-video tool dependencies\n'
  const validationStepName = '      - name: Validate reproducible browser demo-video tool\n'
  const installStep = ci.split(installStepName)[1]?.split(/\n  [\w-]+:/u)[0]
  const validationStep = ci.split(validationStepName)[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(installStep, 'Missing demo-video dependency step')
  assert.ok(validationStep, 'Missing demo-video validation step')
  assert.match(installStep, /working-directory: tools\/demo-video/u)
  assert.match(validationStep, /working-directory: tools\/demo-video/u)
  for (const command of [
    'npm ci --ignore-scripts',
    'npx --no-install playwright install --with-deps chromium',
  ]) assert.ok(installStep.includes(command), `Missing demo-video dependency command: ${command}`)
  for (const command of [
    'npm run check',
    'npm run demo -- record --scenario scenarios/example.yaml',
    'npm run demo -- verify-recording --scenario scenarios/example.yaml',
  ]) assert.ok(validationStep.includes(command), `Missing demo-video validation command: ${command}`)
  const dependencyPosition = ci.indexOf(installStepName)
  const validationPosition = ci.indexOf(validationStepName)
  assert.ok(dependencyPosition >= 0 && dependencyPosition < validationPosition,
    'Demo-video dependencies must be installed before validation')
  let previous = -1
  for (const command of ['npm run check', 'npm run demo -- record --scenario scenarios/example.yaml', 'npm run demo -- verify-recording --scenario scenarios/example.yaml']) {
    const position = validationStep.indexOf(command)
    assert.ok(position > previous, `Missing or out-of-order demo-video command: ${command}`)
    previous = position
  }
  // Keep the demo tool's independent browser/font installation after the
  // frontend build has consumed the verified goal-book publication artifact.
  const builtAssets = ci.indexOf('      - name: Check frontend shell assets in the built application\n')
  assert.ok(builtAssets >= 0 && builtAssets < dependencyPosition)
})

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
    'scripts/compute_curriculum_revision.test.mjs',
    'scripts/check_openai_plugin_versioning.mjs',
    'scripts/check_openai_coach_v11_candidate.test.mjs',
    'scripts/openai_plugin_submission.test.mjs',
    'scripts/openai_plugin_submission.mjs check',
    'scripts/validate_openai_v1_runtime_config.test.mjs',
    'scripts/validate_openai_v1_runtime_config.mjs',
    'scripts/audit_npm_dependencies.test.mjs',
    'node scripts/audit_npm_dependencies.mjs "ai/openai app"',
  ]) assert(ci.includes(command), `Current check missing: ${command}`)
})

test('backend CI checks the read-only deploy snapshot before its long test suite', () => {
  const backend = ci.split('\n  backend-ci:\n')[1]
  assert.ok(backend, 'Missing backend CI job')
  const gate = backend.indexOf('      - name: Verify OpenAI V1 release or draft snapshot\n')
  const tests = backend.indexOf('      - name: Run backend tests\n')
  assert.ok(gate >= 0 && tests > gate, 'Deploy snapshot drift must fail before the full backend test suite')
  const step = backend.slice(gate).split(/\n      - name:/u)[0]
  assert.match(step, /working-directory: \./u)
  assert.match(step, /run: node scripts\/openai_plugin_release\.mjs verify/u)
  assert.doesNotMatch(step, /continue-on-error|openai_plugin_release\.mjs prepare/u)
  const deploy = readFileSync(new URL('../scripts/deploy.sh', import.meta.url), 'utf8')
  assert.match(deploy, /node scripts\/openai_plugin_release\.mjs verify/u)
  assert.doesNotMatch(deploy, /node scripts\/openai_plugin_release\.mjs prepare/u)
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

test('Claude checkout retains release verification inputs without unrelated curriculum media', () => {
  const job = ci.split('\n  claude-connector-v1-ci:\n')[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(job, 'Missing Claude CI job')
  const patterns = job.match(/          sparse-checkout: \|\n((?:            .+\n)+)/u)?.[1]
    .trim().split('\n').map(line => line.trim())
  assert.ok(patterns?.length, 'Claude checkout must stay bounded before dependency installation')
  const includes = (path) => patterns.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
  for (const path of [
    'ai/claude/app',
    'ai/claude/connector-v1',
    'ai/claude/plugin/skillpilot-coach-v1/release/history',
    'backend/build.gradle.kts',
    'backend/src/main/resources/claude-connector-v1',
    'backend/src/main/resources/claude-plugin-publication',
    'scripts/claude_direct_install_beta_release.test.mjs',
    'scripts/check_claude_plugin_v1_release.mjs',
    'scripts/generate_claude_plugin_publication.mjs',
    'scripts/deploy.sh',
  ]) assert.ok(includes(path), `Missing Claude verification input: ${path}`)
  for (const path of ['curricula', 'app/public', 'qa-artifacts']) {
    assert.equal(includes(path), false, `Unrelated large checkout: ${path}`)
  }
  for (const command of [
    'npm --prefix ai/claude/app test',
    'npm --prefix ai/claude/app audit --audit-level=moderate',
    'git diff --exit-code --',
    'node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs',
    'node --test ai/claude/plugin/skillpilot-coach-v1/build-package.test.mjs',
    'node --test scripts/claude_direct_install_beta_release.test.mjs',
    'node scripts/claude_direct_install_beta_release.mjs verify',
  ]) assert.ok(job.includes(command), `Missing Claude gate: ${command}`)
  assert.doesNotMatch(job, /continue-on-error/u)
})

test('CI retains reproducible non-secret submission worksheets and ZIP after validation and audit', () => {
  const upload = ci.match(/      - name: Retain checked OpenAI submission worksheets\n([\s\S]*?)(?=\n  [\w-]+:)/u)?.[1]
  assert.ok(upload, 'Missing prepared submission artifact')
  assert.match(upload, /uses: actions\/upload-artifact@v6/u)
  assert.match(upload, /if-no-files-found: error/u)
  assert.doesNotMatch(upload, /if:.*always\(/u)
  const paths = upload.match(/          path: \|\n((?:            .+\n)+)/u)?.[1]
    .trim().split('\n').map(line => line.trim())
  assert.deepEqual(paths, ['portal-draft.json', 'preparation.json', 'acceptance-guide.md', 'trace-template.json', 'submission-plugin.json', 'submission-package.json']
    .map(name => `ai/openai plugin/skillpilot-coach/submission/generated/${name}`))
  assert.ok(ci.indexOf('scripts/openai_plugin_submission.mjs check') < ci.indexOf('Audit MCP App dependencies'))
  assert.ok(ci.indexOf('Audit MCP App dependencies') < ci.indexOf('Retain checked OpenAI submission worksheets'))
  assert.match(ci, /node --test scripts\/openai_plugin_submission\.test\.mjs scripts\/reproducible_plugin_zip\.test\.mjs/u)
  assert.match(ci, /node scripts\/openai_plugin_submission\.mjs package --out-dir tmp\/openai-submission-package/u)
  assert.match(ci, /node scripts\/openai_plugin_submission\.mjs audit-zip --zip "\$archive"/u)
  const zipUpload = ci.match(/      - name: Retain checked OpenAI submission ZIP\n([\s\S]*?)(?=\n  [\w-]+:)/u)?.[1]
  assert.ok(zipUpload, 'Missing reproducible ZIP artifact')
  assert.doesNotMatch(zipUpload, /if:.*always\(/u)
  assert.match(zipUpload, /tmp\/openai-submission-package\/\*-submission\.zip/u)
  assert.match(zipUpload, /tmp\/openai-submission-package\/submission-package\.json/u)
  assert.match(zipUpload, /if-no-files-found: error/u)
  assert.ok(ci.indexOf('Build current OpenAI submission ZIP') < ci.indexOf('Retain checked OpenAI submission ZIP'))
  assert.ok(ci.indexOf('Audit MCP App dependencies') < ci.indexOf('Retain checked OpenAI submission ZIP'))
})
