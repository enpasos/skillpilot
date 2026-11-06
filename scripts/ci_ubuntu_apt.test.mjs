import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(new URL('../app/package.json', import.meta.url))
const { load: loadYaml } = require('js-yaml')
const actionPath = './.github/actions/ubuntu-apt'
const renderScript = join(repositoryRoot, actionPath, 'render-ubuntu-sources.sh')
const acquirePolicy = [
  'Acquire::http::Timeout "30";',
  'Acquire::https::Timeout "30";',
  'Acquire::Retries "2";',
]

const renderSources = (input, output) => {
  const result = spawnSync('bash', [renderScript, input, output], { encoding: 'utf8', timeout: 15_000 })
  assert.equal(result.status, 0, `rendering Ubuntu sources failed:\n${result.stdout}\n${result.stderr}`)
}

test('Ubuntu APT policy bypasses the Azure mirror list and unrelated repositories while preserving trust settings', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-'))
  try {
    for (const path of ['etc/apt.conf.d', 'etc/sources.list.d', 'state/lists/partial', 'cache/archives/partial', 'log']) {
      mkdirSync(join(root, path), { recursive: true })
    }
    // Mirrors the hosted runner image: ubuntu.sources delegates to a local
    // mirror list whose first (preferred) entry is the Azure mirror.
    const mirrorList = join(root, 'etc/apt-mirrors.txt')
    const sourceFiles = {
      'apt-mirrors.txt': [
        'http://azure.archive.ubuntu.com/ubuntu/\tpriority:1',
        'https://archive.ubuntu.com/ubuntu/\tpriority:2',
        'https://security.ubuntu.com/ubuntu/\tpriority:3',
        '',
      ].join('\n'),
      'sources.list': 'deb https://legacy.example.invalid/ubuntu noble main\n',
      'sources.list.d/ubuntu.sources': [
        'Types: deb',
        `URIs: mirror+file:${mirrorList}`,
        'Suites: noble noble-updates noble-backports',
        'Components: main restricted universe multiverse',
        'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg',
        '',
        'Types: deb',
        `URIs: mirror+file:${mirrorList}`,
        'Suites: noble-security',
        'Components: main restricted universe multiverse',
        'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg',
        '',
      ].join('\n'),
      'sources.list.d/google-chrome.list': 'deb https://chrome.example.invalid/linux/chrome/deb stable main\n',
      'sources.list.d/microsoft.sources': [
        'Types: deb',
        'URIs: https://microsoft.example.invalid/repos/code',
        'Suites: stable',
        'Components: main',
        '',
      ].join('\n'),
    }
    for (const [path, content] of Object.entries(sourceFiles)) {
      writeFileSync(join(root, 'etc', path), content)
    }
    writeFileSync(join(root, 'state/status'), '')
    // APT_CONFIG is read before the normal configuration fragments. Redirect
    // every writable location and configuration directory before APT starts;
    // --print-uris only lists downloads, without making network requests.
    const bootstrap = join(root, 'bootstrap.conf')
    writeFileSync(bootstrap, [
      `Dir::Etc ${JSON.stringify(join(root, 'etc'))};`,
      `Dir::State ${JSON.stringify(join(root, 'state'))};`,
      `Dir::State::status ${JSON.stringify(join(root, 'state/status'))};`,
      `Dir::Cache ${JSON.stringify(join(root, 'cache'))};`,
      `Dir::Log ${JSON.stringify(join(root, 'log'))};`,
      'Debug::NoLocking "true";',
      '',
    ].join('\n'))
    const runApt = (program, args) => {
      const result = spawnSync(program, args, {
        env: { ...process.env, APT_CONFIG: bootstrap },
        encoding: 'utf8',
        timeout: 15_000,
      })
      assert.equal(result.error, undefined, `${program} must be available: ${result.error}`)
      assert.equal(result.status, 0, `${program} failed:\n${result.stdout}\n${result.stderr}`)
      return result.stdout
    }
    const downloadUris = () => runApt('apt-get', ['--print-uris', 'update'])
      .split('\n')
      .filter(line => line.startsWith("'"))
      .map(line => new URL(line.split("'")[1]))
    const hosts = uris => [...new Set(uris.map(uri => uri.hostname))].sort()
    const baselineUris = downloadUris()
    assert.deepEqual(hosts(baselineUris.filter(uri => uri.protocol !== 'mirror+file:')), [
      'chrome.example.invalid', 'legacy.example.invalid', 'microsoft.example.invalid',
    ])
    assert.ok(baselineUris.some(uri => uri.href.startsWith(`mirror+file:${mirrorList}/`)),
      'The fixture must reproduce the runner image mirror-list redirection')
    const baselineConfig = runApt('apt-config', ['dump'])

    const renderedSources = join(root, 'etc/skillpilot-ubuntu.sources')
    renderSources(join(root, 'etc/sources.list.d/ubuntu.sources'), renderedSources)
    const withoutUris = content => content.split('\n').filter(line => !line.startsWith('URIs:'))
    assert.deepEqual(withoutUris(readFileSync(renderedSources, 'utf8')),
      withoutUris(sourceFiles['sources.list.d/ubuntu.sources']),
      'Rendering must keep types, suites, components and Signed-By unchanged')
    copyFileSync(join(repositoryRoot, actionPath, 'apt.conf'), join(root, 'etc/apt.conf.d/99skillpilot-ubuntu-sources'))

    const configuredUris = downloadUris()
    assert.ok(configuredUris.every(uri => uri.protocol === 'https:'),
      'No download may go through the mirror list')
    assert.deepEqual(hosts(configuredUris), ['archive.ubuntu.com', 'security.ubuntu.com'])
    for (const suite of ['noble', 'noble-updates', 'noble-backports', 'noble-security']) {
      const host = suite.endsWith('-security') ? 'security.ubuntu.com' : 'archive.ubuntu.com'
      assert.ok(configuredUris.some(uri => uri.hostname === host && uri.pathname === `/ubuntu/dists/${suite}/InRelease`),
        `The configured repositories must still request the signed ${suite} release metadata from ${host}`)
    }
    const configuredConfig = runApt('apt-config', ['dump'])
    assert.match(configuredConfig, /^Dir::Etc::sourcelist "skillpilot-ubuntu\.sources";$/mu)
    assert.match(configuredConfig, /^Dir::Etc::sourceparts "-";$/mu)
    for (const setting of acquirePolicy) {
      assert.ok(configuredConfig.split('\n').includes(setting), `APT must apply ${setting}`)
    }
    const withoutPolicy = config => config.split('\n')
      // Setting a nested Acquire option also materializes its empty parent node.
      .filter(line => !/^Dir::Etc::(?:sourcelist|sourceparts) /u.test(line) && !acquirePolicy.includes(line)
        && !/^Acquire::https? "";$/u.test(line))
    assert.deepEqual(withoutPolicy(configuredConfig), withoutPolicy(baselineConfig),
      'Source selection and network bounds must not alter any other APT setting, including authentication and hash validation')
    for (const [path, content] of Object.entries(sourceFiles)) {
      assert.equal(readFileSync(join(root, 'etc', path), 'utf8'), content,
        `The original ${path} must remain intact`)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('rendering rewrites direct Azure URIs and keeps other sources untouched', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-render-'))
  try {
    const input = join(root, 'ubuntu.sources')
    const output = join(root, 'skillpilot-ubuntu.sources')
    writeFileSync(input, [
      'Types: deb',
      'URIs: http://azure.archive.ubuntu.com/ubuntu/',
      'Suites: noble-security',
      'Components: main',
      '',
      'Types: deb deb-src',
      'URIs: http://ports.ubuntu.com/ubuntu-ports/',
      'Suites: noble noble-security',
      'Components: main',
      '',
    ].join('\n'))
    renderSources(input, output)
    assert.deepEqual(readFileSync(output, 'utf8').split('\n').filter(line => line.startsWith('URIs:')), [
      'URIs: https://security.ubuntu.com/ubuntu/',
      'URIs: http://ports.ubuntu.com/ubuntu-ports/',
    ])
    writeFileSync(input, '')
    const empty = spawnSync('bash', [renderScript, input, output], { encoding: 'utf8' })
    assert.notEqual(empty.status, 0, 'An empty ubuntu.sources must fail instead of disabling Ubuntu')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('every Ubuntu job prepares APT after checkout and before its first package dependency command', () => {
  const workflowDirectory = join(repositoryRoot, '.github/workflows')
  const packageCommand = /\b(?:apt-get|apt)\s+(?:-\S+\s+)*(?:update|install)\b|\bplaywright\s+(?:install-deps\b|install\b[^\n]*--with-deps\b)/u
  const coveredWorkflows = new Set()
  for (const file of readdirSync(workflowDirectory).filter(file => /\.ya?ml$/u.test(file))) {
    const workflow = loadYaml(readFileSync(join(workflowDirectory, file), 'utf8'))
    for (const [name, job] of Object.entries(workflow.jobs ?? {})) {
      const steps = job.steps ?? []
      const firstPackageStep = steps.findIndex(step => packageCommand.test(step.run ?? ''))
      if (firstPackageStep < 0) continue
      coveredWorkflows.add(file)
      const label = `${file}: ${name}`
      assert.match(job['runs-on'], /^ubuntu-/u, `${label} must use an Ubuntu hosted runner`)
      const checkoutStep = steps.findIndex(step => /^actions\/checkout@/u.test(step.uses ?? ''))
      const prepareStep = steps.findIndex(step => step.uses === actionPath)
      assert.ok(checkoutStep >= 0 && prepareStep > checkoutStep && prepareStep < firstPackageStep,
        `${label} must check out the local action and run it before installing packages`)
      assert.equal(steps[prepareStep].if, undefined, `${label} must not conditionally skip APT configuration`)
      assert.notEqual(steps[prepareStep]['continue-on-error'], true, `${label} must fail if APT configuration fails`)
      for (const step of steps.filter(step => packageCommand.test(step.run ?? ''))) {
        const minutes = step['timeout-minutes']
        assert.ok(Number.isInteger(minutes) && minutes > 0 && minutes <= 15,
          `${label}: "${step.name}" must bound package installation with timeout-minutes (at most 15)`)
      }
    }
  }
  for (const file of ['ci.yml', 'docs_checks.yml', 'owl-ci.yml']) {
    assert.ok(coveredWorkflows.has(file), `${file} must be covered by the dependency-step check`)
  }
})

test('assessment authoring sparse checkout retains code, contracts and completion reviews without either raster mirror', () => {
  const workflow = loadYaml(readFileSync(join(repositoryRoot, '.github/workflows/assessment-completion.yml'), 'utf8'))
  const job = workflow.jobs['authoring-and-ui']
  const checkout = job.steps.find(step => /^actions\/checkout@/u.test(step.uses ?? ''))
  assert.equal(job['timeout-minutes'], 20, 'Bound the checkout by removing unrelated bytes, without raising the job timeout')
  assert.equal(checkout.with['sparse-checkout-cone-mode'], false)
  assert.equal(checkout.if, undefined)
  assert.notEqual(checkout['continue-on-error'], true)
  const patterns = checkout.with['sparse-checkout']
  const mirrorExclusion = '!/app/public/assets/goal-visualizations/'
  const completionReviewInclusion = '/curricula/DE/Gymnasium/quality/assessment-completion/'
  assert.ok(patterns.split('\n').includes(mirrorExclusion), 'The public raster mirror also needs an explicit exclusion')
  const requiredPaths = [
    '.nvmrc',
    '.github/actions/ubuntu-apt/apt.conf',
    '.github/workflows/ci.yml',
    'app/package-lock.json',
    'app/scripts/checkAssessmentCompletionProfiles.ts',
    'app/scripts/testFwuOwlCurriculumPackageBuilder.ts',
    'app/scripts/fixtures/learnerViewStartupUi.html',
    'app/scripts/testLevelCompletionBrowser.ts',
    'app/src/views/LearnerView.tsx',
    'app/public/favicon/site.webmanifest',
    'app/public/data/de_gymnasium_informatics_flashcards_network_oop.de.json',
    'contracts/assessment-completion/v1/fixtures/cases.json',
    'contracts/curriculum-package/v1.1/completion-artifact.schema.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    'curricula/DE/Gymnasium/completion-profiles/math-dot-product-projection.json',
    'curricula/DE/Gymnasium/completion-scopes/math-dot-product-projection.json',
    'curricula/DE/Gymnasium/quality/assessment-completion/math-dot-product-projection-2026-10-31.md',
    'scripts/test_assessment_completion_package.py',
    'scripts/test_assessment_completion_fwu.py',
    'scripts/curriculum_fwu_owl_validation_requirements.txt',
    'LICENSES/CC-BY-4.0.txt',
  ]
  const omittedPaths = [
    'app/public/assets/goal-visualizations/fixture/goal.png',
    'curricula/DE/Gymnasium/visualizations/fixture/goal.png',
    'curricula/DE/Gymnasium/quality/goal-evidence/fixture.json',
  ]
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-assessment-sparse-'))
  const git = (args, input) => {
    const result = spawnSync('git', args, {
      cwd: root, input, encoding: 'utf8', timeout: 15_000,
      env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' },
    })
    assert.equal(result.error, undefined, `Git must execute: ${result.error}`)
    assert.equal(result.status, 0, `${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`)
  }
  try {
    git(['init', '--quiet'])
    for (const path of [...requiredPaths, ...omittedPaths]) {
      if (requiredPaths.includes(path)) assert.ok(existsSync(join(repositoryRoot, path)), `Required input no longer exists: ${path}`)
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), `Inert sparse-checkout fixture: ${path}\n`)
    }
    git(['add', '--all'])
    git(['-c', 'user.name=Sparse checkout test', '-c', 'user.email=sparse@example.invalid',
      '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Inert path-selection fixture'])
    git(['sparse-checkout', 'set', '--no-cone', '--stdin'], patterns)
    for (const path of requiredPaths) assert.equal(readFileSync(join(root, path), 'utf8'), `Inert sparse-checkout fixture: ${path}\n`)
    for (const path of omittedPaths) assert.equal(existsSync(join(root, path)), false, `Unrelated checkout bytes: ${path}`)

    // Genuine counterexamples: broad /app/ alone imports the mirror, while
    // omitting the late inclusion loses a required review under quality/.
    git(['sparse-checkout', 'set', '--no-cone', '--stdin'], patterns.replace(`${mirrorExclusion}\n`, ''))
    assert.equal(existsSync(join(root, omittedPaths[0])), true)
    git(['sparse-checkout', 'set', '--no-cone', '--stdin'], patterns.replace(`${completionReviewInclusion}\n`, ''))
    assert.equal(existsSync(join(root, requiredPaths.find(path => path.includes('/quality/')))), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
