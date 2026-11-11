import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { createServer as createTcpServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(new URL('../app/package.json', import.meta.url))
const { load: loadYaml } = require('js-yaml')
const actionPath = './.github/actions/ubuntu-apt'
const actionDirectory = join(repositoryRoot, actionPath)
const renderScript = join(actionDirectory, 'render-ubuntu-sources.sh')
const orderScript = join(actionDirectory, 'order-ubuntu-mirrors.sh')

// Pinned policy: every Ubuntu stanza reads a mirror list with the direct Ubuntu
// endpoint first and the runner image's Azure mirror second; APT moves a failed or
// stalled file to the next mirror, and a pre-update hook lets a source that answers go first.
const directArchive = 'https://archive.ubuntu.com/ubuntu/'
const directSecurity = 'https://security.ubuntu.com/ubuntu/'
const azureMirror = 'http://azure.archive.ubuntu.com/ubuntu/'
const installedHook = '/usr/local/sbin/skillpilot-order-ubuntu-mirrors'
const installedMirrorDirectory = '/etc/apt/skillpilot-ubuntu-mirrors'
const policySettings = {
  'Dir::Etc::sourcelist': ['skillpilot-ubuntu.sources'],
  'Dir::Etc::sourceparts': ['-'],
  'Acquire::http::Timeout': ['30'],
  'Acquire::https::Timeout': ['30'],
  // Same-source retries come before the next mirror, multiply the wait for a stalled
  // source, and can leave APT 2.8 waiting forever once mirror redirects reach that host.
  'Acquire::Retries': ['0'],
  'APT::Update::Pre-Invoke::': [`${installedHook} ${installedMirrorDirectory} || true`],
}

// Renderer and hook overrides must come from the test only, never from the caller.
const baseEnvironment = Object.fromEntries(Object.entries(process.env)
  .filter(([name]) => !/^(?:SKILLPILOT_UBUNTU_|SKILLPILOT_APT_|APT_CONFIG$)/u.test(name)))
baseEnvironment.LC_ALL = 'C'

const renderSources = (input, output, mirrorDirectory, overrides = {}) => {
  const result = spawnSync('bash', [renderScript, input, output, mirrorDirectory],
    { encoding: 'utf8', timeout: 15_000, env: { ...baseEnvironment, ...overrides } })
  assert.equal(result.status, 0, `rendering Ubuntu sources failed:\n${result.stdout}\n${result.stderr}`)
}

const readMirrorList = path => {
  const lines = readFileSync(path, 'utf8').split('\n')
  return {
    probe: lines.find(line => line.startsWith('# probe: '))?.slice('# probe: '.length),
    entries: lines.filter(line => line.trim() !== '' && !line.startsWith('#')).map(line => line.split('\t')),
  }
}

const parseAptConfig = dump => {
  const settings = new Map()
  for (const line of dump.split('\n').filter(Boolean)) {
    const match = /^(.*?) "(.*)";$/u.exec(line)
    const [key, value] = match ? [match[1], match[2]] : [line, undefined]
    settings.set(key, [...(settings.get(key) ?? []), value])
  }
  return settings
}

// A private APT root: APT_CONFIG is read before any configuration fragment, so every
// configuration directory and writable location is redirected before APT starts.
const createAptRoot = (prefix, extraConfig = [], parent = tmpdir()) => {
  const root = mkdtempSync(join(parent, prefix))
  for (const path of ['etc/apt.conf.d', 'etc/sources.list.d', 'etc/preferences.d', 'state/lists/partial',
    'cache/archives/partial', 'log']) {
    mkdirSync(join(root, path), { recursive: true })
  }
  writeFileSync(join(root, 'state/status'), '')
  const bootstrap = join(root, 'bootstrap.conf')
  writeFileSync(bootstrap, [
    `Dir::Etc ${JSON.stringify(join(root, 'etc'))};`,
    `Dir::State ${JSON.stringify(join(root, 'state'))};`,
    `Dir::State::status ${JSON.stringify(join(root, 'state/status'))};`,
    `Dir::Cache ${JSON.stringify(join(root, 'cache'))};`,
    `Dir::Log ${JSON.stringify(join(root, 'log'))};`,
    'Debug::NoLocking "true";',
    ...extraConfig,
    '',
  ].join('\n'))
  return { root, etc: join(root, 'etc'), env: { ...baseEnvironment, APT_CONFIG: bootstrap } }
}

// Installs the action's apt.conf with the hook and list paths mapped into the private root.
const installPolicy = (etc, mirrorDirectory, { hook = true } = {}) => {
  const policy = readFileSync(join(actionDirectory, 'apt.conf'), 'utf8')
  assert.ok(policy.includes(installedHook) && policy.includes(installedMirrorDirectory),
    'apt.conf must run the installed order hook on the installed mirror lists')
  assert.ok(!/["\s]/u.test(orderScript + mirrorDirectory), 'Fixture paths must not need quoting')
  writeFileSync(join(etc, 'apt.conf.d/99skillpilot-ubuntu-sources'), policy
    .replaceAll(installedHook, `bash ${orderScript}`)
    .replaceAll(installedMirrorDirectory, mirrorDirectory))
  if (!hook) writeFileSync(join(etc, 'apt.conf.d/99zz-without-order-hook'), '#clear APT::Update::Pre-Invoke;\n')
}

test('Ubuntu APT policy routes Ubuntu through direct-first mirror lists, bypasses unrelated repositories and keeps trust settings', () => {
  const apt = createAptRoot('skillpilot-ubuntu-apt-')
  try {
    // Mirrors the hosted runner image: ubuntu.sources delegates to a local
    // mirror list whose first (preferred) entry is the Azure mirror.
    const mirrorList = join(apt.etc, 'apt-mirrors.txt')
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
      writeFileSync(join(apt.etc, path), content)
    }
    const runApt = (program, args) => {
      const result = spawnSync(program, args, { env: apt.env, encoding: 'utf8', timeout: 15_000 })
      assert.equal(result.error, undefined, `${program} must be available: ${result.error}`)
      assert.equal(result.status, 0, `${program} failed:\n${result.stdout}\n${result.stderr}`)
      return result.stdout
    }
    // --print-uris only lists downloads, without running hooks or making network requests.
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
    const baselineConfig = parseAptConfig(runApt('apt-config', ['dump']))

    const mirrorDirectory = join(apt.etc, 'skillpilot-ubuntu-mirrors')
    const renderedSources = join(apt.etc, 'skillpilot-ubuntu.sources')
    renderSources(join(apt.etc, 'sources.list.d/ubuntu.sources'), renderedSources, mirrorDirectory)
    const rendered = readFileSync(renderedSources, 'utf8')
    const withoutUris = content => content.split('\n').filter(line => !line.startsWith('URIs:'))
    assert.deepEqual(withoutUris(rendered), withoutUris(sourceFiles['sources.list.d/ubuntu.sources']),
      'Rendering must keep types, suites, components and Signed-By unchanged and add no trust options')
    assert.deepEqual(rendered.split('\n').filter(line => line.startsWith('URIs:')), [
      `URIs: mirror+file:${mirrorDirectory}/archive.txt`,
      `URIs: mirror+file:${mirrorDirectory}/security.txt`,
    ], 'Each Ubuntu stanza must read the SkillPilot mirror list of its kind')
    assert.deepEqual(readMirrorList(join(mirrorDirectory, 'archive.txt')), {
      probe: 'dists/noble/InRelease',
      entries: [[directArchive, 'priority:1'], [azureMirror, 'priority:2']],
    }, 'The archive suites must prefer archive.ubuntu.com and fall back to the Azure mirror')
    assert.deepEqual(readMirrorList(join(mirrorDirectory, 'security.txt')), {
      probe: 'dists/noble-security/InRelease',
      entries: [[directSecurity, 'priority:1'], [azureMirror, 'priority:2']],
    }, 'The security suite must prefer security.ubuntu.com and fall back to the Azure mirror')
    // Installed verbatim: --print-uris and apt-config never run the update hook.
    copyFileSync(join(actionDirectory, 'apt.conf'), join(apt.etc, 'apt.conf.d/99skillpilot-ubuntu-sources'))

    const configuredUris = downloadUris()
    assert.ok(configuredUris.length > 0 && configuredUris.every(uri => uri.protocol === 'mirror+file:'
      && /^\/(?:archive|security)\.txt\//u.test(uri.pathname.slice(mirrorDirectory.length))
      && uri.pathname.startsWith(`${mirrorDirectory}/`)),
    'Every download must go through a SkillPilot mirror list; unrelated repositories stay excluded')
    for (const suite of ['noble', 'noble-updates', 'noble-backports', 'noble-security']) {
      const list = suite.endsWith('-security') ? 'security.txt' : 'archive.txt'
      assert.ok(configuredUris.some(uri => uri.pathname === `${mirrorDirectory}/${list}/dists/${suite}/InRelease`),
        `The configured repositories must still request the signed ${suite} release metadata through ${list}`)
    }

    const configuredConfig = parseAptConfig(runApt('apt-config', ['dump']))
    for (const [key, values] of Object.entries(policySettings)) {
      assert.deepEqual(configuredConfig.get(key), values, `APT must apply ${key} = ${values.join(', ')}`)
    }
    // Setting a nested option also materializes its empty parent nodes.
    const isPolicyParent = key => Object.keys(policySettings).some(policyKey => policyKey.startsWith(`${key}::`))
    for (const key of new Set([...baselineConfig.keys(), ...configuredConfig.keys()])) {
      if (key in policySettings) continue
      if (!baselineConfig.has(key) && isPolicyParent(key) && configuredConfig.get(key).every(value => value === '')) continue
      assert.deepEqual(configuredConfig.get(key), baselineConfig.get(key),
        `The policy must not change ${key}: authentication and hash validation stay as they are`)
    }
    for (const [path, content] of Object.entries(sourceFiles)) {
      assert.equal(readFileSync(join(apt.etc, path), 'utf8'), content, `The original ${path} must remain intact`)
    }
  } finally {
    rmSync(apt.root, { recursive: true, force: true })
  }
})

test('rendering writes a mirror list per stanza kind and keeps other sources untouched', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-render-'))
  try {
    const input = join(root, 'ubuntu.sources')
    const output = join(root, 'skillpilot-ubuntu.sources')
    const mirrorDirectory = join(root, 'mirrors')
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
    renderSources(input, output, mirrorDirectory)
    assert.deepEqual(readFileSync(output, 'utf8').split('\n').filter(line => line.startsWith('URIs:')), [
      `URIs: mirror+file:${mirrorDirectory}/security.txt`,
      'URIs: http://ports.ubuntu.com/ubuntu-ports/',
    ])
    assert.deepEqual(readdirSync(mirrorDirectory), ['security.txt'], 'Only used mirror lists are written')
    assert.deepEqual(readMirrorList(join(mirrorDirectory, 'security.txt')).entries,
      [[directSecurity, 'priority:1'], [azureMirror, 'priority:2']])

    writeFileSync(input, [
      'Types: deb',
      'URIs: mirror+file:/etc/apt/apt-mirrors.txt',
      'Suites: noble noble-security',
      'Components: main',
      '',
    ].join('\n'))
    renderSources(input, output, mirrorDirectory)
    assert.deepEqual(readMirrorList(join(mirrorDirectory, 'archive.txt')), {
      probe: 'dists/noble/InRelease',
      entries: [[directArchive, 'priority:1'], [azureMirror, 'priority:2']],
    }, 'A stanza with any non-security suite uses the archive list')

    const failing = args => spawnSync('bash', [renderScript, ...args], { encoding: 'utf8', env: baseEnvironment })
    assert.notEqual(failing([input, output, 'relative/mirrors']).status, 0,
      'The mirror list directory must be absolute, because sources reference it by path')
    writeFileSync(input, '')
    assert.notEqual(failing([input, output, mirrorDirectory]).status, 0,
      'An empty ubuntu.sources must fail instead of disabling Ubuntu')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('the action installs the order hook and mirror lists where apt.conf expects them', () => {
  const action = loadYaml(readFileSync(join(actionDirectory, 'action.yml'), 'utf8'))
  const [step] = action.runs.steps
  assert.equal(action.runs.steps.length, 1)
  assert.equal(step.env.SKILLPILOT_APT_ORDER, '${{ github.action_path }}/order-ubuntu-mirrors.sh')
  const commands = step.run.split('\n').map(line => line.trim()).filter(line => line.startsWith('sudo '))
  assert.deepEqual(commands, [
    `sudo bash "$SKILLPILOT_APT_RENDER" /etc/apt/sources.list.d/ubuntu.sources /etc/apt/skillpilot-ubuntu.sources ${installedMirrorDirectory}`,
    `sudo install -m 755 "$SKILLPILOT_APT_ORDER" ${installedHook}`,
    'sudo install -m 644 "$SKILLPILOT_APT_POLICY" /etc/apt/apt.conf.d/99skillpilot-ubuntu-sources',
  ], 'Lists and hook must be in place before apt.conf activates them')
})

test('the order hook keeps the lists unchanged when it cannot probe', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-order-'))
  try {
    const list = join(root, 'archive.txt')
    const content = `# probe: dists/noble/InRelease\n${directArchive}\tpriority:1\n${azureMirror}\tpriority:2\n`
    writeFileSync(list, content)
    const result = spawnSync('/bin/bash', [orderScript, root], { encoding: 'utf8', env: { PATH: '/nonexistent' } })
    assert.equal(result.status, 0, 'The hook must never fail apt-get update')
    assert.match(result.stdout, /curl is missing, keeping the current order/u)
    assert.equal(readFileSync(list, 'utf8'), content)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// --- Offline failover proof against a signed local repository -------------------------

const sha256 = data => createHash('sha256').update(data).digest('hex')
const fixturePackage = 'skillpilot-fixture'
const fixtureDeb = `pool/main/s/${fixturePackage}/${fixturePackage}_1.0_all.deb`

const writeFile = (path, content) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

// Builds noble and noble-security with one package, clear-signed by a throwaway key. It
// also returns the same InRelease files signed by a second key outside the keyring, and
// the package with altered content, for a mirror that must not be trusted.
const buildSignedRepository = directory => {
  const gnupgHome = join(directory, 'gnupg')
  mkdirSync(gnupgHome, { mode: 0o700 })
  const gpg = args => {
    const result = spawnSync('gpg', ['--homedir', gnupgHome, '--batch', ...args], { timeout: 60_000 })
    assert.equal(result.status, 0, `gpg ${args.join(' ')} failed:\n${result.stderr}`)
    return result.stdout
  }
  const stopAgent = () => spawnSync('gpgconf', ['--homedir', gnupgHome, '--kill', 'gpg-agent'], { timeout: 15_000 })
  try {
    const trustedKey = 'apt-fixture@example.invalid'
    const foreignKey = 'apt-foreign@example.invalid'
    for (const key of [trustedKey, foreignKey]) {
      gpg(['--pinentry-mode', 'loopback', '--passphrase', '', '--quick-gen-key',
        `SkillPilot APT fixture <${key}>`, 'ed25519', 'sign', '1d'])
    }
    const keyring = join(directory, 'fixture-keyring.gpg')
    writeFileSync(keyring, gpg(['--export', trustedKey]))
    const untrusted = new Map()
    const webRoot = join(directory, 'web')
    const archive = join(webRoot, 'ubuntu')
    const deb = Buffer.from('Fixture payload: APT checks its size and SHA256 from the signed index.\n')
    writeFile(join(archive, fixtureDeb), deb)
    const tamperedPackage = Buffer.from(deb.toString().replace('Fixture', 'Altered')) // same size
    const packages = Buffer.from([
      `Package: ${fixturePackage}`, 'Version: 1.0', 'Architecture: all',
      'Maintainer: SkillPilot CI <apt-fixture@example.invalid>', `Filename: ${fixtureDeb}`,
      `Size: ${deb.length}`, `SHA256: ${sha256(deb)}`, 'Description: APT failover test fixture', '',
    ].join('\n'))
    const translation = Buffer.from([
      `Package: ${fixturePackage}`, `Description-md5: ${'0'.repeat(32)}`, 'Description-en: APT failover test fixture', '',
    ].join('\n'))
    // Like the Ubuntu archive, indexes are also published by hash; APT then asks the
    // mirror list again for every index file instead of reusing the InRelease mirror.
    const indexFiles = []
    for (const suite of ['noble', 'noble-security']) {
      const dists = join(archive, 'dists', suite)
      const indexes = [['main/binary-amd64', 'Packages', packages], ['main/i18n', 'Translation-en', translation]]
      for (const [directory, name, content] of indexes) {
        writeFile(join(dists, directory, name), content)
        writeFile(join(dists, directory, 'by-hash/SHA256', sha256(content)), content)
        indexFiles.push(`/ubuntu/dists/${suite}/${directory}/by-hash/SHA256/${sha256(content)}`)
      }
      writeFile(join(dists, 'Release'), [
        'Origin: SkillPilot fixture', 'Label: SkillPilot fixture', `Suite: ${suite}`, 'Codename: noble',
        `Date: ${new Date(Date.now() - 60_000).toUTCString().replace('GMT', 'UTC')}`,
        'Architectures: amd64', 'Components: main', 'Acquire-By-Hash: yes', 'SHA256:',
        ...indexes.map(([directory, name, content]) => ` ${sha256(content)} ${content.length} ${directory}/${name}`), '',
      ].join('\n'))
      gpg(['--yes', '--clearsign', '--local-user', trustedKey, '--output', join(dists, 'InRelease'), join(dists, 'Release')])
      indexFiles.push(`/ubuntu/dists/${suite}/InRelease`)
      untrusted.set(`/ubuntu/dists/${suite}/InRelease`,
        gpg(['--clearsign', '--local-user', foreignKey, '--output', '-', join(dists, 'Release')]))
    }
    return { webRoot, keyring, indexFiles, untrusted, tamperedPackage }
  } finally {
    stopAgent()
  }
}

// Every fixture source gets its own loopback address: APT remembers a refused or timed-out
// address (not address and port) for the rest of the run, as it would for a real host.
const listen = (server, host) => new Promise((resolvePromise, reject) => {
  server.once('error', reject)
  server.listen(0, host, () => resolvePromise(`http://${host}:${server.address().port}/ubuntu/`))
})

// Serves the repository; `replaced` maps request paths to other content.
const serveRepository = async (webRoot, host, replaced = new Map()) => {
  const requests = []
  const server = createServer((request, response) => {
    const path = resolve(webRoot, `.${decodeURIComponent(new URL(request.url, 'http://fixture').pathname)}`)
    const requestPath = path.slice(webRoot.length)
    requests.push(requestPath)
    let body
    try {
      if (!path.startsWith(`${webRoot}/`)) throw new Error('outside the repository')
      body = replaced.get(requestPath) ?? readFileSync(path)
    } catch {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { 'content-length': body.length }).end(request.method === 'HEAD' ? undefined : body)
  })
  return {
    uri: await listen(server, host),
    requests,
    close: () => new Promise(done => { server.closeAllConnections(); server.close(done) }),
  }
}

// Accepts connections and never answers: a stalled mirror.
const serveStall = async host => {
  const sockets = new Set()
  let connections = 0
  const server = createTcpServer(socket => {
    connections += 1
    sockets.add(socket)
    socket.on('error', () => {})
    socket.on('close', () => sockets.delete(socket))
    socket.resume()
  })
  return {
    uri: await listen(server, host),
    connections: () => connections,
    close: () => new Promise(done => { for (const socket of sockets) socket.destroy(); server.close(done) }),
  }
}

// A port nobody listens on: connections are refused.
const refusedUri = async host => {
  const server = createTcpServer()
  const uri = await listen(server, host)
  await new Promise(done => server.close(done))
  return uri
}

const run = (command, args, { env, cwd, timeoutMs = 120_000 }) => new Promise((resolvePromise, reject) => {
  const started = performance.now()
  const child = spawn(command, args, { env, cwd })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs)
  child.on('error', reject)
  child.on('close', (status, signal) => {
    clearTimeout(timer)
    if (signal) output += `\n[${command} killed by ${signal} after ${timeoutMs / 1000} s: it did not finish]`
    resolvePromise({ status, signal, output, seconds: (performance.now() - started) / 1000 })
  })
})

test('APT fails over per file, the order hook moves a refusing or stalled source behind one that answers, trust checks still apply to every mirror, and a total outage still fails', { timeout: 300_000 }, async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'skillpilot-ubuntu-apt-failover-'))
  const servers = []
  try {
    const { webRoot, keyring, indexFiles, untrusted, tamperedPackage } = buildSignedRepository(workspace)
    const fallback = await serveRepository(webRoot, '127.0.0.1')
    servers.push(fallback)
    const direct = await serveRepository(webRoot, '127.0.0.2')
    servers.push(direct)
    const stall = await serveStall('127.0.0.3')
    servers.push(stall)
    const foreignSigned = await serveRepository(webRoot, '127.0.0.6', untrusted)
    servers.push(foreignSigned)
    const tampered = await serveRepository(webRoot, '127.0.0.7', new Map([[`/ubuntu/${fixtureDeb}`, tamperedPackage]]))
    servers.push(tampered)
    const refused = await refusedUri('127.0.0.4')
    const otherRefused = await refusedUri('127.0.0.5')
    const probeEnvironment = { SKILLPILOT_APT_PROBE_CONNECT_TIMEOUT: '2', SKILLPILOT_APT_PROBE_MAX_TIME: '3' }

    let phase = 0
    const prepare = ({ preferred, fallbackUri, hook }) => {
      phase += 1
      const apt = createAptRoot(`phase${phase}-`, ['APT::Architecture "amd64";', 'APT::Architectures { "amd64"; };'], workspace)
      writeFileSync(join(apt.etc, 'apt-mirrors.txt'), `${azureMirror}\tpriority:1\n`)
      const stanza = suite => [
        'Types: deb', `URIs: mirror+file:${join(apt.etc, 'apt-mirrors.txt')}`, `Suites: ${suite}`,
        'Components: main', `Signed-By: ${keyring}`, '',
      ]
      writeFileSync(join(apt.etc, 'sources.list.d/ubuntu.sources'), [...stanza('noble'), ...stanza('noble-security')].join('\n'))
      const mirrorDirectory = join(apt.etc, 'skillpilot-ubuntu-mirrors')
      renderSources(join(apt.etc, 'sources.list.d/ubuntu.sources'), join(apt.etc, 'skillpilot-ubuntu.sources'),
        mirrorDirectory, {
          SKILLPILOT_UBUNTU_ARCHIVE_URI: preferred,
          SKILLPILOT_UBUNTU_SECURITY_URI: preferred,
          SKILLPILOT_UBUNTU_FALLBACK_URI: fallbackUri,
        })
      installPolicy(apt.etc, mirrorDirectory, { hook })
      const options = { env: { ...apt.env, ...probeEnvironment }, cwd: apt.root }
      return {
        update: () => run('apt-get', ['update'], options),
        download: () => run('apt-get', ['download', fixturePackage], options),
        // The shape of the workflow steps: `apt-get update && apt-get install ...`.
        step: () => run('sh', ['-c', `apt-get update && apt-get install --simulate --yes --no-install-recommends ${fixturePackage}`], options),
        lists: () => ['archive.txt', 'security.txt'].map(name => readMirrorList(join(mirrorDirectory, name)).entries),
        cleanup: () => rmSync(apt.root, { recursive: true, force: true }),
      }
    }
    const assertServed = (server, files, label, { output }) => {
      for (const file of files) {
        assert.ok(server.requests.includes(file), `${label}: ${file} must be served by ${server.uri}\n${output}`)
      }
    }

    // 1. Without the hook, every file moves from the refusing source to the next mirror at once.
    const perFile = prepare({ preferred: refused, fallbackUri: fallback.uri, hook: false })
    const perFileUpdate = await perFile.update()
    assert.equal(perFileUpdate.status, 0, perFileUpdate.output)
    assert.ok(perFileUpdate.seconds < 20, `Per-file failover must not wait or hang (took ${perFileUpdate.seconds}s)`)
    const refusedBase = refused.replace(/\/$/u, '').replace(/[.*+?^${}()|[\]\\/]/gu, '\\$&')
    for (const file of ['noble InRelease', 'noble-security InRelease', 'noble/main amd64 Packages']) {
      assert.match(perFileUpdate.output, new RegExp(`^Ign:\\d+ ${refusedBase} ${file}$`, 'mu'),
        `APT must try the refusing source first for ${file} and then move on`)
    }
    assertServed(fallback, indexFiles, 'Per-file failover', perFileUpdate)
    const perFileDownload = await perFile.download()
    assert.equal(perFileDownload.status, 0, perFileDownload.output)
    assertServed(fallback, [`/ubuntu/${fixtureDeb}`], 'Package download failover', perFileDownload)
    perFile.cleanup()

    // 2. A source that accepts connections but stalls would cost two 30 s timeouts per
    //    file; the hook probes it first and lets the answering mirror go first.
    fallback.requests.length = 0
    const stalled = prepare({ preferred: stall.uri, fallbackUri: fallback.uri, hook: true })
    const stalledUpdate = await stalled.update()
    assert.equal(stalledUpdate.status, 0, stalledUpdate.output)
    assert.ok(stalledUpdate.seconds < 25, `A stalled source must not stall the update (took ${stalledUpdate.seconds}s)`)
    assert.match(stalledUpdate.output, /failed the probe, trying http:\/\/127\.0\.0\.1:\d+\/ubuntu\/ first/u)
    assert.deepEqual(stalled.lists(), [
      [[stall.uri, 'priority:2'], [fallback.uri, 'priority:1']],
      [[stall.uri, 'priority:2'], [fallback.uri, 'priority:1']],
    ], 'The hook must change priorities only, keeping the line order as the preference')
    assert.equal(stall.connections(), 2, 'Only the two probes may reach the stalled source, never APT itself')
    assertServed(fallback, indexFiles, 'Stalled source', stalledUpdate)
    stalled.cleanup()

    // 3. Reverse case: while the preferred source answers, it stays first and the hook
    //    does not wait for a stalled second source.
    const healthy = prepare({ preferred: direct.uri, fallbackUri: stall.uri, hook: true })
    const healthyStep = await healthy.step()
    assert.equal(healthyStep.status, 0, healthyStep.output)
    assert.ok(healthyStep.seconds < 15, `A stalled second source must not delay the update (took ${healthyStep.seconds}s)`)
    assert.deepEqual(healthy.lists(), [
      [[direct.uri, 'priority:1'], [stall.uri, 'priority:2']],
      [[direct.uri, 'priority:1'], [stall.uri, 'priority:2']],
    ])
    assertServed(direct, indexFiles, 'Healthy preferred source', healthyStep)
    assert.ok(stall.connections() <= 4, 'APT must not contact the stalled second source')
    healthy.cleanup()

    // 4. When every source is down, the step still fails: apt-get update only warns
    //    about transient network errors, and the install that follows finds no package.
    const down = prepare({ preferred: refused, fallbackUri: otherRefused, hook: true })
    const downStep = await down.step()
    assert.match(downStep.output, /no source answered the probe/u)
    assert.match(downStep.output, /Some index files failed to download/u)
    assert.equal(downStep.status, 100, `A total outage must fail the step:\n${downStep.output}`)
    assert.ok(downStep.seconds < 20, `A refused total outage must fail fast (took ${downStep.seconds}s)`)
    assert.deepEqual(down.lists()[0], [[refused, 'priority:1'], [otherRefused, 'priority:2']],
      'Without an answering source the line order stays')
    down.cleanup()

    // 5. Failover never weakens trust: a mirror whose InRelease is signed by a key outside
    //    Signed-By is rejected and the step fails, and a package whose content does not
    //    match the signed index fails its download.
    const foreign = prepare({ preferred: refused, fallbackUri: foreignSigned.uri, hook: false })
    const foreignStep = await foreign.step()
    assert.equal(foreignStep.status, 100, `An untrusted mirror must fail the step:\n${foreignStep.output}`)
    assert.match(foreignStep.output, /NO_PUBKEY|is not signed/u)
    assert.ok(!foreignSigned.requests.some(path => path.includes('/by-hash/')),
      'APT must not fetch indexes from a mirror whose release file it could not verify')
    foreign.cleanup()
    const altered = prepare({ preferred: refused, fallbackUri: tampered.uri, hook: false })
    const alteredUpdate = await altered.update()
    assert.equal(alteredUpdate.status, 0, alteredUpdate.output)
    const alteredDownload = await altered.download()
    assert.equal(alteredDownload.status, 100, `A tampered package must fail:\n${alteredDownload.output}`)
    assert.match(alteredDownload.output, /Hash Sum mismatch/u)
    altered.cleanup()
  } finally {
    await Promise.all(servers.map(server => server.close()))
    rmSync(workspace, { recursive: true, force: true })
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
