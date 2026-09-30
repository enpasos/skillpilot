import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
