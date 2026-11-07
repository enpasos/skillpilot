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
const packageJson = JSON.parse(readFileSync(new URL('../app/package.json', import.meta.url), 'utf8'))

const identityFixtureCommit = '80d70f08e0ce31cbdc214e62b5d3e0e80cd850db'
const identityFixturePaths = [
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
]
const identityStepNames = [
  'Install package-consumer isolation tools',
  'Enable and verify bubblewrap isolation',
  'Prepare pinned Source-A metadata test fixtures',
  'Test Source-A Composer metadata boundary',
  'Test isolated identity QA preparation without skips',
]
const mathScopeStepName = 'Test HE Q2.4/Q2.5 Mathematics scope'

function curriculumStep(workflow, name) {
  const job = workflow.split('\n  graph-validation:\n')[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(job, 'Missing Curriculum CI job')
  const marker = `      - name: ${name}\n`
  assert.equal(job.split(marker).length, 2, `Expected exactly one curriculum step: ${name}`)
  return marker + job.split(marker)[1].split(/\n      - (?:name:|\*)/u)[0] + '\n'
}

function assertIdentityAndMathCiWiring(workflow, scripts = packageJson.scripts) {
  const job = workflow.split('\n  graph-validation:\n')[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(job, 'Missing Curriculum CI job')
  assert.doesNotMatch(job.split('    steps:')[0], /continue-on-error|\bif:/u)
  assert.doesNotMatch(job, /fetch-depth:\s*0|--unshallow|--source-identity-qa-context=|run-isolated\.py/u)
  const steps = identityStepNames.map(name => curriculumStep(workflow, name))
  for (const step of [...steps, curriculumStep(workflow, mathScopeStepName)]) {
    assert.doesNotMatch(step, /continue-on-error|^\s+if:|\|\||\bset\s+\+e|;\s*(?:true|:)|--(?:warn|baseline|skip)/mu,
      'Identity and Math scope checks must remain unconditional hard gates')
  }
  let previous = -1
  for (const name of [...identityStepNames, 'Test general graph reference resolution', 'Validate Graph']) {
    const position = job.indexOf(`      - name: ${name}\n`)
    assert.ok(position > previous, `Missing or out-of-order prerequisite: ${name}`)
    previous = position
  }
  assert.match(steps[0], /sudo apt-get install -y bubblewrap strace/u)
  assert.match(steps[1], /run: bash \.\.\/scripts\/configure_github_bubblewrap\.sh\n/u)
  const fixture = steps[2]
  assert.match(fixture, /working-directory: \./u)
  assert.match(fixture, /set -euo pipefail/u)
  assert.ok(fixture.includes(`identity_fixture_commit=${identityFixtureCommit}\n`))
  assert.ok(fixture.includes('git fetch --no-tags --depth=1 origin "${identity_fixture_commit}"\n'))
  assert.ok(fixture.includes('test "$(git rev-parse --verify "${identity_fixture_commit}^{commit}")" = "${identity_fixture_commit}"\n'))
  assert.deepEqual([...fixture.matchAll(/^\s+(curricula\/[^\s;\\]+)/gmu)].map(match => match[1]), identityFixturePaths)
  assert.ok(fixture.includes('test "$(git cat-file -t "${identity_fixture_commit}:${identity_fixture_path}")" = blob\n'))
  assert.doesNotMatch(fixture, /git (?:clone|checkout|switch|reset)|--depth=0/u)
  assert.equal(scripts['test:source-identity-qa-metadata'], 'tsx scripts/testSourceIdentityQaMetadata.ts')
  assert.match(steps[3], /run: npm run test:source-identity-qa-metadata\n/u)
  const isolation = steps[4]
  assert.match(isolation, /working-directory: \./u)
  assert.match(isolation, /set -euo pipefail/u)
  assert.match(isolation, /^\s+command -v bwrap$/mu)
  assert.match(isolation, /^\s+python3 -B - <<'PY'$/mu)
  assert.ok(isolation.includes('unittest.defaultTestLoader.discover("scripts", pattern="test_*identity_qa*py")'))
  assert.match(isolation, /^\s+if result\.testsRun != 19 or result\.skipped:$/mu)
  assert.match(isolation, /^\s+raise SystemExit\("All nineteen identity QA preparation and capture controls must execute without skips"\)$/mu)
  assert.match(isolation, /^\s+raise SystemExit\(0 if result\.wasSuccessful\(\) else 1\)$/mu)
  assert.doesNotMatch(steps.join(''), /(?:python3?|python)\s+(?:-B\s+)?(?:\.\.\/)?scripts\/prepare_identity_qa_candidate\.py\b/u)
  assert.equal(scripts['test:hessen-math-q24-q25-scope'], 'tsx scripts/testHessenMathQ24Q25Scope.ts')
  assert.match(curriculumStep(workflow, mathScopeStepName), /run: npm run test:hessen-math-q24-q25-scope\n/u)
  assert.ok(job.indexOf(`      - name: ${mathScopeStepName}\n`)
    < job.indexOf('      - name: Test Mathematics Q2 assessment projection and scoring\n'))
}

test('Curriculum CI hard-gates Source-A boundaries, isolated preparation and HE Math scope before production checks', () => {
  assertIdentityAndMathCiWiring(ci)
  // Reuse the existing functional isolation probe, including its hosted-runner
  // policy; presence of a binary alone cannot prove namespace isolation.
  const configure = readFileSync(new URL('./configure_github_bubblewrap.sh', import.meta.url), 'utf8')
  assert.match(configure, /if ! bwrap[\s\S]+--unshare-user[\s\S]+--unshare-net[\s\S]+-- \/bin\/true; then[\s\S]+exit 1/u)
})

test('identity and Math CI wiring rejects missing, skipped, reordered, stale and softened prerequisites', () => {
  const fixture = curriculumStep(ci, identityStepNames[2])
  const boundary = curriculumStep(ci, identityStepNames[3])
  const isolation = curriculumStep(ci, identityStepNames[4])
  const enable = curriculumStep(ci, identityStepNames[1])
  const mathScope = curriculumStep(ci, mathScopeStepName)
  const mathProjection = curriculumStep(ci, 'Test Mathematics Q2 assessment projection and scoring')
  const mutations = [
    ['missing boundary gate', ci.replace(boundary, '')],
    ['boundary before fixture fetch', ci.replace(boundary, '').replace(fixture, boundary + fixture)],
    ['isolation enabled after fixtures', ci.replace(enable, '').replace(isolation, isolation + enable)],
    ['missing bubblewrap prerequisite', ci.replace('command -v bwrap', 'true')],
    ['omitted private capture suite', ci.replace('test_*identity_qa*py', 'test_prepare_identity_qa_candidate.py')],
    ['stale seventeen-control count', ci.replace('result.testsRun != 19', 'result.testsRun != 17')],
    ['accepted unittest skips', ci.replace('result.testsRun != 19 or result.skipped', 'result.testsRun != 19 or False')],
    ['missing fixture-count guard', ci.replace('result.testsRun != 19 or result.skipped', 'result.skipped')],
    ['ignored unittest failure', ci.replace('0 if result.wasSuccessful() else 1', '0 if result.wasSuccessful() else 0')],
    ['soft boundary failure', ci.replace(boundary, boundary.replace('        run:', '        continue-on-error: true\n        run:'))],
    ['conditional boundary execution', ci.replace(boundary, boundary.replace('        run:', "        if: github.event_name == 'push'\n        run:"))],
    ['stale source-fixture pin', ci.replace(`identity_fixture_commit=${identityFixtureCommit}`, `identity_fixture_commit=${'0'.repeat(40)}`)],
    ['unbounded history fetch', ci.replace('--depth=1 origin', '--depth=0 origin')],
    ['missing original ledger blob', ci.replace(`            ${identityFixturePaths[1]}; do`, '            ; do')],
    ['missing exact commit check', ci.replace('test "$(git rev-parse --verify "${identity_fixture_commit}^{commit}")" = "${identity_fixture_commit}"', 'true')],
    ['missing blob type check', ci.replace('test "$(git cat-file -t "${identity_fixture_commit}:${identity_fixture_path}")" = blob', 'true')],
    ['accepted failed bubblewrap lookup', ci.replace('command -v bwrap', 'command -v bwrap || true')],
    ['missing Math scope gate', ci.replace(mathScope, '')],
    ['late Math scope gate', ci.replace(mathScope, '').replace(mathProjection, mathProjection + mathScope)],
    ['full manual A-only context per PR', ci.replace(boundary, boundary.replace('test:source-identity-qa-metadata', 'test:source-identity-qa-metadata -- --source-identity-qa-context=/tmp/request.json'))],
  ]
  for (const [name, mutated] of mutations) {
    assert.notEqual(mutated, ci, `Mutation did not exercise the workflow: ${name}`)
    assert.throws(() => assertIdentityAndMathCiWiring(mutated), undefined, name)
  }
  assert.throws(() => assertIdentityAndMathCiWiring(ci, { ...packageJson.scripts,
    'test:source-identity-qa-metadata': 'true' }))
  assert.throws(() => assertIdentityAndMathCiWiring(ci, { ...packageJson.scripts,
    'test:hessen-math-q24-q25-scope': 'true' }))
})

test('general graph reference CLI negatives run before the production graph gate', () => {
  const fixtures = ci.indexOf('      - name: Test general graph reference resolution\n')
  const actual = ci.indexOf('      - name: Validate Graph\n')
  assert.ok(fixtures >= 0 && actual > fixtures)
  const step = ci.slice(fixtures, actual)
  assert.match(step, /run: npm run test:general-graph-references/u)
  assert.doesNotMatch(step, /continue-on-error|\|\| true|--warn|--baseline/u)
  const packageJson = JSON.parse(readFileSync(new URL('../app/package.json', import.meta.url), 'utf8'))
  assert.equal(packageJson.scripts['test:general-graph-references'],
    'tsx --test scripts/testGeneralGraphReferenceCli.ts')
})

test('UUID CLI negative fixtures run before the hard full-curriculum UUID gate', () => {
  const fixtures = ci.indexOf('      - name: Test Curriculum Goal UUID CLI\n')
  const actual = ci.indexOf('      - name: Validate Curriculum Goal IDs (UUIDs)\n')
  assert.ok(fixtures >= 0 && actual > fixtures)
  const fixtureStep = ci.slice(fixtures, actual)
  assert.match(fixtureStep, /working-directory: \./u)
  assert.match(fixtureStep, /python -B scripts\/test_validate_goal_ids_uuid\.py -v/u)
  const actualStep = ci.slice(actual).split(/\n      - name:/u)[0]
  assert.match(actualStep, /python scripts\/validate_goal_ids_uuid\.py/u)
  assert.doesNotMatch(fixtureStep + actualStep, /continue-on-error|\|\| true|--warn|--baseline/u)
})

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

// Proposal: append to scripts/plugin_ci_workflows.test.mjs, reusing its
// assert/test/spawnSync/ci imports. Do not replace the existing Source-A tests.
function curriculumDagJob(workflow, id) {
  const block = workflow.split(`\n  ${id}:\n`)[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(block, `Missing curriculum DAG job ${id}`)
  return block
}
function curriculumDagStep(job, name) {
  const marker = `      - name: ${name}\n`
  assert.equal(job.split(marker).length, 2, `Expected one step ${name}`)
  return marker + job.split(marker)[1].split(/\n      - (?:name:|\*)/u)[0] + '\n'
}
function assertCurriculumFinalGate(workflow) {
  const core = curriculumDagJob(workflow, 'graph-validation')
  const final = curriculumDagJob(workflow, 'curriculum-ci')
  const book = curriculumDagJob(workflow, 'goal-book-publication')
  assert.doesNotMatch(book, /continue-on-error:|^        if:/mu)
  const bookBuild = curriculumDagStep(book, 'Build and validate all registered goal-book publications from source')
  const bookCheck = curriculumDagStep(book, 'Verify generated publication bindings')
  const bookUpload = curriculumDagStep(book, 'Share verified goal-book publications with the application checks')
  assert.match(bookBuild, /run: npm run build:goal-books -- --force/u)
  assert.match(bookCheck, /run: npm run check:goal-book-publication/u)
  assert.match(bookUpload, /uses: actions\/upload-artifact@v6/u)
  assert.match(bookUpload, /name: goal-book-publication-\$\{\{ github.sha \}\}/u)
  assert.match(bookUpload, /path: app\/public\/lernzielbuch\//u)
  assert.match(bookUpload, /include-hidden-files: true/u)
  assert.match(bookUpload, /if-no-files-found: error/u)
  assert.ok(book.indexOf(bookBuild.trimEnd()) < book.indexOf(bookCheck.trimEnd()))
  assert.ok(book.indexOf(bookCheck.trimEnd()) < book.indexOf(bookUpload.trimEnd()))
  assert.equal((workflow.match(/^    name: Curriculum CI$/gmu) ?? []).length, 1)
  assert.match(core, /^    name: Curriculum source contracts$/mu)
  assert.doesNotMatch(core.split('    steps:')[0], /^\s+(?:needs|if|continue-on-error):/mu)
  assert.match(final, /^    name: Curriculum CI$/mu)
  assert.match(final, /^    needs: \[graph-validation, goal-book-publication\]$/mu)
  assert.match(final, /^    if: \$\{\{ always\(\) \}\}$/mu)
  assert.doesNotMatch(core + final, /continue-on-error:/u)
  const guard = curriculumDagStep(final, 'Require successful curriculum core and verified book build')
  assert.ok(final.split('    steps:\n')[1].startsWith(guard.trimEnd()))
  assert.match(guard, /^        if: \$\{\{ always\(\) \}\}$/mu)
  assert.match(guard, /^        working-directory: \$\{\{ runner.temp \}\}$/mu)
  assert.match(guard, /^        shell: bash$/mu)
  assert.match(guard, /^          CURRICULUM_CORE_RESULT: \$\{\{ needs.graph-validation.result \}\}$/mu)
  assert.match(guard, /^          CURRICULUM_BOOK_RESULT: \$\{\{ needs.goal-book-publication.result \}\}$/mu)
  assert.doesNotMatch(core, /^        if:/mu)
  assert.doesNotMatch(final.replace(guard.trimEnd(), ''), /^        if:/mu)
  const restore = curriculumDagStep(final, 'Restore same-run verified goal-book publications')
  assert.match(restore, /uses: actions\/download-artifact@v7/u)
  assert.match(restore, /name: goal-book-publication-\$\{\{ github.sha \}\}/u)
  assert.match(restore, /path: app\/public\/lernzielbuch\//u)
  assert.doesNotMatch(restore, /run-id:|repository:|github-token:|pattern:|merge-multiple:/u)
  assert.doesNotMatch(core, /actions\/download-artifact|path: app\/public\/lernzielbuch\//u)
  const prepare = curriculumDagStep(final, 'Prepare generated curriculum runtime assets')
  const application = curriculumDagStep(final, 'Build integrated application artifact')
  const consumer = curriculumDagStep(final, 'Build package-only consumer frontend')
  const builtRationale = curriculumDagStep(final, 'Check Goal Source Rationale Build Artifact')
  const contracts = curriculumDagStep(final, 'Validate Curriculum Package Contracts')
  assert.match(prepare, /run: npm run prepare:runtime-assets/u)
  assert.match(application, /run: npm run build:application/u)
  assert.match(consumer, /run: npm run build:package-consumer -- --out-dir \.\.\/tmp\/package-consumer-ci\/frontend/u)
  assert.match(builtRationale, /run: npm run check:goal-source-rationales:build-artifact/u)
  assert.match(contracts, /SKILLPILOT_SOURCE_PDF_MODE: committed-bindings/u)
  assert.match(contracts, /SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false/u)
  assert.match(contracts, /bash scripts\/run_curriculum_release_model_conformance.sh/u)
  let previous = -1
  for (const step of [prepare, restore, application, consumer, builtRationale, contracts]) {
    const position = final.indexOf(step.trimEnd())
    assert.ok(position > previous)
    previous = position
  }
  assert.match(core, /npm run quality:curriculum-status\n\s+npm run check:curriculum-maturity-floors/u)
  assert.match(core, /git diff --exit-code -- \.\.\/docs\/qa-ci\/status/u)
  assert.match(core, /python scripts\/validate_schemas.py/u)
  assert.match(core, /python scripts\/validate_goal_ids_uuid.py/u)
  return guard.split('        run: |\n')[1].split('\n').filter(Boolean)
    .map(line => { assert.ok(line.startsWith('          ')); return line.slice(10) }).join('\n') + '\n'
}

test('Curriculum final required context joins the early core and the checked same-run publication', () => {
  assertCurriculumFinalGate(ci)
})

test('Curriculum final guard rejects each failed, cancelled, skipped, empty, missing or unknown upstream status', () => {
  const body = assertCurriculumFinalGate(ci)
  for (const core of ['success', 'failure', 'cancelled', 'skipped', '', undefined, 'neutral']) {
    for (const book of ['success', 'failure', 'cancelled', 'skipped', '', undefined, 'neutral']) {
      const env = { PATH: process.env.PATH }
      if (core !== undefined) env.CURRICULUM_CORE_RESULT = core
      if (book !== undefined) env.CURRICULUM_BOOK_RESULT = book
      const result = spawnSync('bash', ['--noprofile', '--norc', '-c', body], {
        env, encoding: 'utf8', timeout: 2_000,
      })
      assert.equal(result.error, undefined)
      assert.equal(result.status === 0, core === 'success' && book === 'success',
        `core=${String(core)}, book=${String(book)}: ${result.stdout}\n${result.stderr}`)
    }
  }
})

test('Curriculum final gate wiring rejects skip paths, lost dependencies and detached integration', () => {
  const final = curriculumDagJob(ci, 'curriculum-ci')
  const guard = curriculumDagStep(final, 'Require successful curriculum core and verified book build')
  const app = curriculumDagStep(final, 'Build integrated application artifact')
  const restore = curriculumDagStep(final, 'Restore same-run verified goal-book publications')
  const mutateFinal = (from, to) => ci.replace(final, final.replace(from, to))
  const book = curriculumDagJob(ci, 'goal-book-publication')
  const bookCheck = curriculumDagStep(book, 'Verify generated publication bindings')
  const bookUpload = curriculumDagStep(book, 'Share verified goal-book publications with the application checks')
  const mutateBook = (from, to) => ci.replace(book, book.replace(from, to))
  const mutations = [
    ['missing publication verification', mutateBook(bookCheck.trimEnd(), '')],
    ['soft publication verification', mutateBook(bookCheck, bookCheck.replace('        run:', '        continue-on-error: true\n        run:'))],
    ['early publication upload', ci.replace(book, book.replace(bookUpload.trimEnd(), '').replace(bookCheck.trimEnd(), bookUpload + bookCheck))],
    ['hidden build cache omitted', mutateBook('include-hidden-files: true', 'include-hidden-files: false')],
    ['missing final always', ci.replace(final, final.replace('    if: ${{ always() }}\n', ''))],
    ['skip on failure', ci.replace(final, final.replace('    if: ${{ always() }}', '    if: ${{ success() }}'))],
    ['skip on cancellation', ci.replace(final, final.replace('    if: ${{ always() }}', '    if: ${{ !cancelled() }}'))],
    ['core detached', ci.replace('needs: [graph-validation, goal-book-publication]', 'needs: [goal-book-publication]')],
    ['book detached', ci.replace('needs: [graph-validation, goal-book-publication]', 'needs: [graph-validation]')],
    ['missing guard', mutateFinal(guard.trimEnd(), '')],
    ['late guard', ci.replace(final, final.replace(guard.trimEnd(), '').replace(app.trimEnd(), app.trimEnd() + '\n' + guard))],
    ['wrong required context', ci.replace('    name: Curriculum CI\n', '    name: Curriculum integration\n')],
    ['missing integration', mutateFinal(app.trimEnd(), '')],
    ['conditional integration', mutateFinal(app, app.replace('        run:', '        if: false\n        run:'))],
    ['soft integration', mutateFinal(app, app.replace('        run:', '        continue-on-error: true\n        run:'))],
    ['missing artifact', mutateFinal(restore.trimEnd(), '')],
    ['cross-run artifact', mutateFinal(restore, restore.replace('        with:', '        with:\n          run-id: 123'))],
    ['wrong artifact name', mutateFinal(restore, restore.replace('goal-book-publication-', 'goal-book-catalog-'))],
    ['wrong core result binding', ci.replace('needs.graph-validation.result', 'needs.goal-book-publication.result')],
  ]
  for (const [name, mutant] of mutations) {
    assert.notEqual(mutant, ci, name)
    assert.throws(() => assertCurriculumFinalGate(mutant), undefined, name)
  }
})
