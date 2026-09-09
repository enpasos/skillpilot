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

test('Ubuntu APT policy excludes unrelated repositories while preserving sources and trust settings', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-'))
  try {
    for (const path of ['etc/apt.conf.d', 'etc/sources.list.d', 'state/lists/partial', 'cache/archives/partial', 'log']) {
      mkdirSync(join(root, path), { recursive: true })
    }
    const sourceFiles = {
      'sources.list': 'deb https://legacy.example.invalid/ubuntu noble main\n',
      'sources.list.d/ubuntu.sources': [
        'Types: deb',
        'URIs: https://ubuntu.example.invalid/ubuntu',
        'Suites: noble noble-updates noble-backports',
        'Components: main restricted universe multiverse',
        'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg',
        '',
        'Types: deb',
        'URIs: https://security.example.invalid/ubuntu',
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
    assert.deepEqual(hosts(baselineUris), [
      'chrome.example.invalid', 'legacy.example.invalid', 'microsoft.example.invalid',
      'security.example.invalid', 'ubuntu.example.invalid',
    ])
    const baselineConfig = runApt('apt-config', ['dump'])

    copyFileSync(join(repositoryRoot, actionPath, 'apt.conf'), join(root, 'etc/apt.conf.d/99skillpilot-ubuntu-sources'))

    const configuredUris = downloadUris()
    assert.deepEqual(hosts(configuredUris), ['security.example.invalid', 'ubuntu.example.invalid'])
    for (const suite of ['noble', 'noble-updates', 'noble-backports', 'noble-security']) {
      assert.ok(configuredUris.some(uri => uri.pathname === `/ubuntu/dists/${suite}/InRelease`),
        `The configured repositories must still request the signed ${suite} release metadata`)
    }
    const configuredConfig = runApt('apt-config', ['dump'])
    assert.match(configuredConfig, /^Dir::Etc::sourcelist "sources\.list\.d\/ubuntu\.sources";$/mu)
    assert.match(configuredConfig, /^Dir::Etc::sourceparts "-";$/mu)
    const withoutSourceSelection = config => config.split('\n')
      .filter(line => !/^Dir::Etc::(?:sourcelist|sourceparts) /u.test(line))
    assert.deepEqual(withoutSourceSelection(configuredConfig), withoutSourceSelection(baselineConfig),
      'Source selection must not alter any other APT setting, including authentication and hash validation')
    for (const [path, content] of Object.entries(sourceFiles)) {
      assert.equal(readFileSync(join(root, 'etc', path), 'utf8'), content,
        `The original ${path} must remain intact`)
    }
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
    }
  }
  for (const file of ['ci.yml', 'docs_checks.yml', 'owl-ci.yml']) {
    assert.ok(coveredWorkflows.has(file), `${file} must be covered by the dependency-step check`)
  }
})
