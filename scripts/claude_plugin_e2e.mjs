/**
 * Model-in-the-loop end-to-end test of the Claude plugin against a real local backend.
 *
 * Test-only; never imported by the runtime. The plugin candidate is loaded by Claude Code in
 * headless mode, its connector points at a local backend with its own database schema, and the
 * learner comes from the same first-party routes the SkillPilot web start uses. The host is not
 * claude.ai: docs/qa-ci/claude-plugin-e2e.md states what a pass shows and what it does not.
 */
import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { APP_ONLY_TOOLS, evaluateScenario, preconditionProblem, summarizeRun, untilReached, validateSuite } from './claude_plugin_e2e_assertions.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_SOURCE = 'ai/claude/plugin/skillpilot-coach-v1'
const PUBLICATION = `${PLUGIN_SOURCE}/release/marketplace-publication.json`
const SUITE = 'ai/claude/plugin-e2e/scenarios.json'
const CONFIG = 'scripts/config/claude-plugin-e2e.json'
const TOOL_INPUTS = 'ai/claude/plugin-e2e/tool-inputs.json'
const BACKEND_STATE_DIR = 'tmp/claude-plugin-e2e/backend'
const RUNS_DIR = 'tmp/claude-plugin-e2e/runs'
const PRODUCTION_MCP_URL = 'https://mcp-claude-v1.skillpilot.com/mcp'
const CONNECTOR_SERVER = 'skillpilot'
const OAUTH_CLIENT_ID = 'skillpilot-claude-e2e-local'
const LAYER = 'claude-code-headless-host-with-local-backend'
const USAGE = 'Usage: node scripts/claude_plugin_e2e.mjs check | backend start|stop|status | run [--scenario ID]... [--model ID] [--learner-model ID] [--repetitions N] [--claude-bin PATH] [--out-dir tmp/PATH]'

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const sha = data => createHash('sha256').update(data).digest('hex')
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const sleep = ms => new Promise(resolveSleep => setTimeout(resolveSleep, ms))

/** A parent Claude Code session must not leak its own session variables into the test host. */
export function childEnvironment(environment = process.env, extra = {}) {
  const passed = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TERM', 'TMPDIR', 'JAVA_HOME', 'GRADLE_USER_HOME', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY', 'NODE_EXTRA_CA_CERTS', 'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN']
  return { ...Object.fromEntries(passed.filter(key => environment[key]).map(key => [key, environment[key]])), ...extra }
}

export function validateConfig(config) {
  assert.ok(isObject(config) && config.schemaVersion === 1, 'Unsupported configuration schemaVersion')
  for (const key of ['model', 'learnerModel']) assert.match(String(config[key]), /^claude-[a-z0-9-]{3,60}$/u, `Invalid ${key}`)
  assert.match(String(config.minimumCliVersion), /^\d+\.\d+\.\d+$/u, 'Invalid minimumCliVersion')
  for (const [name, minimum, maximum] of [['repetitions', 1, 5], ['turnTimeoutMs', 10_000, 900_000], ['learnerTimeoutMs', 10_000, 600_000]]) {
    assert.ok(Number.isSafeInteger(config[name]) && config[name] >= minimum && config[name] <= maximum, `Invalid ${name}`)
  }
  assert.ok(Number.isFinite(config.maxBudgetUsdPerScenario) && config.maxBudgetUsdPerScenario > 0 && config.maxBudgetUsdPerScenario <= 20, 'Invalid maxBudgetUsdPerScenario')
  assert.ok(typeof config.hostSystemPrompt === 'string' && config.hostSystemPrompt.trim().length >= 20, 'hostSystemPrompt is missing')
  // The host prompt stands in for a neutral chat app. Coaching rules belong to the plugin
  // under test; moving them here would make a failing candidate look green.
  assert.ok(!/skillpilot|learningsessionid|lernen starten|mastery|coach/iu.test(config.hostSystemPrompt), 'hostSystemPrompt must not contain product or coaching instructions')
  const backend = config.backend
  assert.ok(isObject(backend), 'backend configuration is missing')
  assert.ok(Number.isSafeInteger(backend.port) && backend.port >= 1024 && backend.port <= 65535 && backend.port !== 8080, 'backend.port must be a free high port other than the developer default 8080')
  assert.match(String(backend.schema), /^[a-z][a-z0-9_]{2,40}$/u, 'Invalid backend.schema')
  assert.notEqual(backend.schema, 'public', 'The test backend must not use the public schema')
  assert.match(String(backend.publicHost), /^[a-z0-9.-]+$/u, 'Invalid backend.publicHost')
  assert.equal(backend.resource, `https://${backend.publicHost}/mcp`, 'backend.resource must be the public MCP URL of backend.publicHost')
  assert.match(String(backend.redirectUri), /^https:\/\//u, 'Invalid backend.redirectUri')
  assert.match(String(backend.internalBasePath), /^\/[a-z0-9/]+$/u, 'Invalid backend.internalBasePath')
  assert.ok(Number.isSafeInteger(backend.startTimeoutMs) && backend.startTimeoutMs >= 60_000 && backend.startTimeoutMs <= 1_800_000, 'Invalid backend.startTimeoutMs')
  return config
}

export function compareVersions(left, right) {
  const a = left.split('.').map(Number)
  const b = right.split('.').map(Number)
  for (let index = 0; index < 3; index++) if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1
  return 0
}

export function resolveCli(option, environment = process.env) {
  const path = option ?? environment.SKILLPILOT_CLAUDE_CLI ?? 'claude'
  const result = spawnSync(path, ['--version'], { encoding: 'utf8', env: childEnvironment(environment), timeout: 30_000 })
  const version = /^(\d+\.\d+\.\d+)/u.exec(result.stdout ?? '')?.[1]
  assert.ok(result.status === 0 && version, `Claude Code CLI not found or not runnable: ${path}`)
  return { path, version }
}

/** The plugin candidate: the exact files the personal marketplace publishes. */
export function readCandidate(repositoryRoot = root) {
  const pluginRoot = resolve(repositoryRoot, PLUGIN_SOURCE)
  const manifest = readJson(resolve(pluginRoot, '.claude-plugin/plugin.json'))
  const publication = readJson(resolve(repositoryRoot, PUBLICATION))
  const paths = publication?.source?.publicationFiles
  assert.ok(Array.isArray(paths) && paths.includes('.mcp.json') && paths.includes('.claude-plugin/plugin.json'), 'Publication file list is incomplete')
  assert.equal(publication.plugin?.version, manifest.version, 'Publication record and plugin manifest disagree on the version')
  const skillPaths = paths.filter(path => /^skills\/[^/]+\/SKILL\.md$/u.test(path))
  assert.equal(skillPaths.length, 1, 'The candidate must contain exactly one skill')
  const files = Object.fromEntries([...paths].sort().map(path => [path, sha(readFileSync(resolve(pluginRoot, path)))]))
  const declared = readJson(resolve(pluginRoot, '.mcp.json'))
  assert.deepEqual(Object.keys(declared.mcpServers ?? {}), [CONNECTOR_SERVER], 'The candidate must declare exactly the skillpilot connector')
  assert.deepEqual(declared.mcpServers[CONNECTOR_SERVER], { type: 'http', url: PRODUCTION_MCP_URL }, 'The candidate connector declaration changed')
  return {
    name: manifest.name,
    version: manifest.version,
    skillId: `${manifest.name}:${skillPaths[0].split('/')[1]}`,
    pluginRoot,
    files,
    packageSha256: sha(Object.entries(files).map(([path, digest]) => `${path}\0${digest}\n`).join('')),
    directInstallSha256: publication.plugin?.directInstallSha256 ?? null,
  }
}

/**
 * Copies the candidate byte for byte. Only the connector address differs: the test copy names
 * the local backend and carries the transport token the test obtained through OAuth.
 */
export function buildPluginCopy(candidate, directory, connection) {
  for (const path of Object.keys(candidate.files)) {
    const target = join(directory, path)
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 })
    if (path === '.mcp.json') {
      writeFileSync(target, `${JSON.stringify({ mcpServers: { [CONNECTOR_SERVER]: { type: 'http', url: connection.url, headers: connection.headers } } }, null, 2)}\n`, { mode: 0o600 })
    } else {
      writeFileSync(target, readFileSync(join(candidate.pluginRoot, path)), { mode: 0o600 })
      assert.equal(sha(readFileSync(target)), candidate.files[path], `Test copy differs from candidate: ${path}`)
    }
  }
  return directory
}

/** Claude Code reads instruction files from every ancestor directory of its working directory. */
export function assertCleanAncestors(directory) {
  for (let current = realpathSync(directory); ; current = dirname(current)) {
    for (const name of ['CLAUDE.md', 'CLAUDE.local.md', 'AGENTS.md', '.mcp.json', join('.claude', 'CLAUDE.md'), join('.claude', 'settings.json')]) {
      assert.ok(!existsSync(join(current, name)), `Host workspace would inherit ${join(current, name)}`)
    }
    if (dirname(current) === current) return
  }
}

export function sanitizeReport(value, secrets = []) {
  if (typeof value === 'string') {
    let text = value
    for (const [secret, label] of secrets) if (secret) text = text.replaceAll(secret, label)
    text = text.replace(/\bspc_[A-Za-z0-9_-]{16,}/gu, '[learning-session]')
    text = text.replace(/\bBearer\s+[\w.-]{16,}/gu, '[REDACTED_CREDENTIAL]')
    text = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/gu, '[email]')
    return text.replace(/\b[A-Za-z0-9_-]{60,}\b/gu, token => `[opaque:${sha(token).slice(0, 16)}]`)
  }
  if (Array.isArray(value)) return value.map(item => sanitizeReport(item, secrets))
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /^(?:authorization|access_token|refresh_token|client_secret|clientSecret|signingSecret|capabilitySecret)$/u.test(key) ? '[REDACTED]' : sanitizeReport(item, secrets)]))
  return value
}

function contentText(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.filter(item => item?.type === 'text' && typeof item.text === 'string').map(item => item.text).join('')
}

const RESULT_FIELDS = ['status', 'errorCode', 'message', 'stateVersion', 'savedGoalId', 'savedMastery', 'confirmed']

/** Turns the host's stream-json lines into the small event model the checks read. */
export function createEventCollector(candidateName) {
  const prefix = `mcp__plugin_${candidateName}_${CONNECTOR_SERVER}__`
  const pending = new Map()
  const collector = { events: [], host: null, permissionDenials: [], costUsd: 0, results: [] }
  collector.push = (raw, turnId) => {
    if (!isObject(raw)) return null
    if (raw.type === 'system' && raw.subtype === 'init') {
      collector.host ??= {
        model: raw.model, cliVersion: raw.claude_code_version, plugins: (raw.plugins ?? []).map(plugin => ({ name: plugin.name, version: plugin.version ?? null, builtin: plugin.path === 'builtin' || /@builtin$/u.test(plugin.source ?? '') })),
        mcpServers: raw.mcp_servers ?? [], skills: raw.skills ?? [], tools: raw.tools ?? [], memoryPaths: raw.memory_paths ?? null,
      }
      return null
    }
    if (raw.type === 'assistant') {
      for (const block of raw.message?.content ?? []) {
        if (block.type === 'text' && block.text?.trim()) collector.events.push({ type: 'assistant', turnId, text: block.text })
        if (block.type === 'tool_use') {
          const connector = block.name.startsWith(prefix)
          const event = { type: 'tool', turnId, source: connector ? 'skillpilot' : block.name.startsWith('mcp__') ? 'foreign' : 'host', name: connector ? block.name.slice(prefix.length) : block.name, input: block.input ?? {}, completed: false }
          pending.set(block.id, event)
          collector.events.push(event)
        }
      }
      return null
    }
    if (raw.type === 'user') {
      for (const block of Array.isArray(raw.message?.content) ? raw.message.content : []) {
        if (block.type !== 'tool_result') continue
        const event = pending.get(block.tool_use_id)
        if (!event) continue
        pending.delete(block.tool_use_id)
        const text = contentText(block.content)
        event.completed = true
        event.isError = block.is_error === true
        event.resultLength = text.length
        event.resultPreview = text.slice(0, 1200)
        try {
          const parsed = JSON.parse(text)
          if (isObject(parsed)) event.result = Object.fromEntries(RESULT_FIELDS.filter(key => key in parsed).map(key => [key, parsed[key]]))
        } catch { /* plain tool text carries no authoritative state */ }
      }
      return null
    }
    if (raw.type === 'result') {
      if (Number.isFinite(raw.total_cost_usd)) collector.costUsd = Math.max(collector.costUsd, raw.total_cost_usd)
      collector.permissionDenials.push(...(raw.permission_denials ?? []).map(denial => ({ turnId, tool: denial.tool_name ?? null })))
      const result = { turnId, subtype: raw.subtype, isError: raw.is_error === true, hostTurns: raw.num_turns ?? null }
      collector.results.push(result)
      return result
    }
    return null
  }
  return collector
}

/** One headless Claude Code process per scenario; turns arrive as stream-json user messages. */
export class HostSession {
  constructor({ cli, model, pluginDirectory, workspace, systemPrompt, maxBudgetUsd, candidate, turnTimeoutMs }) {
    this.turnTimeoutMs = turnTimeoutMs
    this.collector = createEventCollector(candidate.name)
    const connector = `mcp__plugin_${candidate.name}_${CONNECTOR_SERVER}`
    const args = ['-p', '--model', model, '--plugin-dir', pluginDirectory, '--add-dir', pluginDirectory, '--setting-sources', 'project',
      '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
      '--system-prompt', systemPrompt, '--tools', 'Skill,Read',
      '--allowedTools', connector, 'Skill', 'Read',
      '--disallowedTools', ...APP_ONLY_TOOLS.map(tool => `${connector}__${tool}`),
      '--max-budget-usd', String(maxBudgetUsd)]
    this.child = spawn(cli.path, args, { cwd: workspace, env: childEnvironment(process.env, { ENABLE_CLAUDEAI_MCP_SERVERS: 'false' }), stdio: ['pipe', 'pipe', 'pipe'] })
    this.stderr = ''
    this.child.stderr.on('data', chunk => { this.stderr = `${this.stderr}${chunk}`.slice(-4000) })
    this.waiting = null
    this.closed = false
    this.currentTurn = null
    createInterface({ input: this.child.stdout }).on('line', line => {
      let raw
      try { raw = JSON.parse(line) } catch { return }
      const result = this.collector.push(raw, this.currentTurn)
      if (result && this.waiting) { const { resolveTurn, timer } = this.waiting; this.waiting = null; clearTimeout(timer); resolveTurn(result) }
    })
    const fail = error => { this.closed = true; if (this.waiting) { const { rejectTurn, timer } = this.waiting; this.waiting = null; clearTimeout(timer); rejectTurn(error) } }
    this.child.on('error', error => fail(new Error(`Host process failed: ${error.message}`)))
    this.child.on('exit', code => fail(new Error(`Host process exited with code ${code}: ${this.stderr.trim().split('\n').at(-1) ?? ''}`)))
  }

  send(text, turnId) {
    assert.ok(!this.closed, 'Host process is closed')
    assert.ok(!this.waiting, 'A turn is still running')
    this.currentTurn = turnId
    this.collector.events.push({ type: 'user', turnId, text })
    return new Promise((resolveTurn, rejectTurn) => {
      const timer = setTimeout(() => { this.waiting = null; rejectTurn(new Error('Host turn timed out')); this.close() }, this.turnTimeoutMs)
      this.waiting = { resolveTurn, rejectTurn, timer }
      this.child.stdin.write(`${JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text }] } })}\n`)
    }).then(result => {
      assert.ok(result.subtype === 'success' && !result.isError, `Host turn ended with ${result.subtype}`)
      return result
    })
  }

  close() {
    if (this.closed) return
    this.closed = true
    this.child.stdin.end()
    this.child.kill()
  }
}

export function renderTranscript(events, secrets = []) {
  const lines = events.filter(event => event.type === 'user' || event.type === 'assistant').map(event => `${event.type === 'user' ? 'Ich' : 'Coach'}: ${sanitizeReport(event.text, secrets)}`)
  return `Bisheriger Gesprächsverlauf (Coach ist der Lerncoach, Ich ist die lernende Person):\n\n${lines.join('\n\n')}\n\nSchreibe jetzt die nächste Nachricht der lernenden Person.`
}

/** The simulated learner is a separate model call without tools, plugin or connector. */
export function learnerSay({ cli, model, persona, transcript, workspace, timeoutMs }) {
  return new Promise((resolveSay, rejectSay) => {
    const child = spawn(cli.path, ['-p', '--model', model, '--system-prompt', persona, '--tools', '', '--setting-sources', 'project', '--strict-mcp-config', '--no-session-persistence', '--output-format', 'json', '--max-budget-usd', '1'],
      { cwd: workspace, env: childEnvironment(process.env, { ENABLE_CLAUDEAI_MCP_SERVERS: 'false' }), stdio: ['pipe', 'pipe', 'ignore'] })
    let output = ''
    const timer = setTimeout(() => { child.kill(); rejectSay(new Error('Simulated learner timed out')) }, timeoutMs)
    child.stdout.on('data', chunk => { output += chunk })
    child.on('error', error => { clearTimeout(timer); rejectSay(error) })
    child.on('exit', () => {
      clearTimeout(timer)
      try {
        const result = JSON.parse(output)
        const text = String(result.result ?? '').trim()
        assert.ok(result.subtype === 'success' && text, 'Simulated learner returned no message')
        resolveSay({ text: text.slice(0, 4000), costUsd: Number.isFinite(result.total_cost_usd) ? result.total_cost_usd : 0 })
      } catch (error) { rejectSay(new Error(`Simulated learner failed: ${error.message}`)) }
    })
    child.stdin.end(transcript)
  })
}

/** First-party and connector access to the local test backend. */
export class BackendClient {
  constructor({ config, state, fetchImpl = fetch }) {
    this.backend = config.backend
    this.state = state
    this.fetchImpl = fetchImpl
    this.origin = `http://127.0.0.1:${config.backend.port}`
    this.forwarded = { 'X-Forwarded-Host': config.backend.publicHost, 'X-Forwarded-Proto': 'https' }
  }

  get mcpUrl() { return `${this.origin}${this.backend.internalBasePath}/mcp` }

  async json(method, path, body) {
    const response = await this.fetchImpl(`${this.origin}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60_000) })
    const text = await response.text()
    assert.ok(response.ok, `Backend ${method} ${path.replace(/\/learners\/[^/]+/u, '/learners/[id]')} answered HTTP ${response.status}`)
    return text ? JSON.parse(text) : null
  }

  async healthy() {
    try { return (await this.fetchImpl(`${this.origin}/api/health`, { signal: AbortSignal.timeout(5000) })).ok } catch { return false }
  }

  async createLearner(profile) {
    const created = await this.json('POST', '/api/ui/learners', {})
    const id = created?.state?.skillpilotId
    assert.ok(typeof id === 'string' && id, 'Backend created no learner')
    const base = `/api/ui/learners/${id}`
    await this.json('PUT', `${base}/curriculum`, { curriculumId: profile.curriculumId })
    let plan = await this.json('GET', `${base}/personalization-plan`)
    for (const step of profile.personalization) {
      const { stageId, ...criteria } = step
      assert.equal(plan.stageId, stageId, `Personal Curriculum setup is at stage ${plan.stageId}, the profile expects ${stageId}`)
      const matches = (plan.options ?? []).filter(option => Object.entries(criteria).every(([key, value]) => option[key] === value))
      assert.equal(matches.length, 1, `Personal Curriculum stage ${stageId} offers ${matches.length} options for ${JSON.stringify(criteria)}`)
      plan = await this.json('POST', `${base}/personalization-options`, { optionId: matches[0].optionId })
    }
    assert.equal(plan.stage, 'COMPLETE', 'Personal Curriculum setup did not complete')
    return id
  }

  /** The same route the web start "Lernen starten" calls for Claude. */
  launch(id, locale) {
    return this.json('POST', `/api/ui/learners/${id}/claude/v1/launch`, { communicationLocale: locale, client: 'web-start' })
  }

  async snapshot(id) {
    const [state, mastery] = await Promise.all([this.json('GET', `/api/ui/learners/${id}/state`), this.json('GET', `/api/ui/learners/${id}/mastery`)])
    return {
      activeGoalId: state.activeGoal?.id ?? null,
      activeGoalTitle: state.activeGoal?.title ?? null,
      learningState: state.learningState ?? null,
      requiredAction: state.stateMachine?.requiredAction ?? null,
      mastered: Object.entries(mastery?.mastery ?? {}).filter(([, value]) => value >= 1).map(([goalId]) => goalId).sort(),
    }
  }

  /** The real authorization-code flow with PKCE of the dedicated confidential client profile. */
  async accessToken() {
    const verifier = randomBytes(48).toString('base64url')
    const query = new URLSearchParams({
      response_type: 'code', client_id: this.state.clientId, redirect_uri: this.backend.redirectUri, scope: 'skillpilot.read skillpilot.write',
      state: randomBytes(12).toString('hex'), resource: this.backend.resource, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    })
    const authorize = await this.fetchImpl(`${this.origin}${this.backend.internalBasePath}/oauth2/authorize?${query}`, { headers: this.forwarded, redirect: 'manual', signal: AbortSignal.timeout(30_000) })
    const code = authorize.status === 302 ? new URL(authorize.headers.get('location')).searchParams.get('code') : null
    assert.ok(code, `Authorization answered HTTP ${authorize.status} without a code`)
    const token = await this.fetchImpl(`${this.origin}${this.backend.internalBasePath}/oauth2/token`, {
      method: 'POST', signal: AbortSignal.timeout(30_000),
      headers: { ...this.forwarded, 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${this.state.clientId}:${this.state.clientSecret}`).toString('base64')}` },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: this.backend.redirectUri, resource: this.backend.resource }),
    })
    assert.ok(token.ok, `Token exchange answered HTTP ${token.status}`)
    const accessToken = (await token.json()).access_token
    assert.ok(typeof accessToken === 'string' && accessToken, 'Token exchange returned no access token')
    return accessToken
  }

  connectorHeaders(accessToken) { return { ...this.forwarded, Authorization: `Bearer ${accessToken}` } }

  async rpc(accessToken, method, params) {
    const response = await this.fetchImpl(this.mcpUrl, {
      method: 'POST', signal: AbortSignal.timeout(30_000),
      headers: { ...this.connectorHeaders(accessToken), 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    assert.ok(response.ok, `Connector ${method} answered HTTP ${response.status}`)
    const text = await response.text()
    const payload = JSON.parse(/^data: (.*)$/mu.exec(text)?.[1] ?? text)
    assert.ok(payload.result, `Connector ${method} returned no result`)
    return payload.result
  }

  async connectorInfo(accessToken) {
    const initialized = await this.rpc(accessToken, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'skillpilot-claude-plugin-e2e', version: '1' } })
    const { tools } = await this.rpc(accessToken, 'tools/list')
    const appOnly = tool => { const visibility = (tool._meta ?? tool.meta)?.ui?.visibility; return Array.isArray(visibility) && !visibility.includes('model') }
    return {
      serverInfo: initialized.serverInfo ?? null,
      instructionsSha256: sha(initialized.instructions ?? ''),
      modelTools: tools.filter(tool => !appOnly(tool)).map(tool => tool.name).sort(),
      appOnlyTools: tools.filter(appOnly).map(tool => tool.name).sort(),
      toolsWithoutAnnotations: tools.filter(tool => !tool.annotations?.title || (tool.annotations.readOnlyHint === undefined && tool.annotations.destructiveHint === undefined)).map(tool => tool.name),
      toolInputs: toolInputsOf(tools.filter(tool => !appOnly(tool))),
    }
  }
}

/** The input field names of each tool, in the form of ai/claude/plugin-e2e/tool-inputs.json. */
export function toolInputsOf(tools) {
  return Object.fromEntries([...tools].sort((left, right) => left.name.localeCompare(right.name)).map(tool => {
    const required = [...(tool.inputSchema?.required ?? [])].sort()
    return [tool.name, { required, optional: Object.keys(tool.inputSchema?.properties ?? {}).filter(name => !required.includes(name)).sort() }]
  }))
}

/** What differs between the connector's tool inputs and the recorded list the coach web test decides by. */
export function toolInputDifferences(actual, repositoryRoot = root) {
  const recorded = Object.fromEntries(Object.entries(readJson(resolve(repositoryRoot, TOOL_INPUTS)).tools).map(([name, entry]) => [name, { required: entry.required, optional: entry.optional }]))
  return [...new Set([...Object.keys(actual), ...Object.keys(recorded)])].sort().filter(name => JSON.stringify(actual[name]) !== JSON.stringify(recorded[name]))
}

export async function runScenario({ scenario, suite, config, candidate, cli, backend, model, learnerModel, toolCatalog }) {
  const outcome = { id: scenario.id, title: scenario.title, status: 'error', layer: LAYER, hostAcceptance: 'claude_ai_not_tested', events: [], snapshots: [] }
  const work = mkdtempSync(join(tmpdir(), 'skillpilot-claude-plugin-e2e-'))
  const secrets = []
  let host
  let learnerCostUsd = 0
  let currentTurn = null
  try {
    const learnerId = await backend.createLearner(suite.learnerProfiles[scenario.learnerProfile])
    secrets.push([learnerId, '[permanent-id]'])
    let session = { kind: 'none' }
    let preparedPrompt = null
    if (scenario.session === 'launch') {
      const launch = await backend.launch(learnerId, scenario.locale)
      session = { kind: 'launch', id: launch.learningSessionId }
      preparedPrompt = launch.prompt
      assert.ok(typeof session.id === 'string' && preparedPrompt?.includes(session.id), 'Launch returned no prepared start message')
    } else if (scenario.session === 'fabricated') {
      // Never issued by the backend: the shape of a session id, but unknown to it.
      session = { kind: 'fabricated', id: `spc_${randomBytes(32).toString('base64url')}` }
    }
    if (session.id) secrets.push([session.id, '[learning-session]'])
    const accessToken = await backend.accessToken()
    secrets.push([accessToken, '[transport-token]'])
    const pluginDirectory = buildPluginCopy(candidate, join(work, 'plugin'), { url: backend.mcpUrl, headers: backend.connectorHeaders(accessToken) })
    const workspace = join(work, 'workspace')
    mkdirSync(workspace, { mode: 0o700 })
    assertCleanAncestors(workspace)
    outcome.snapshots.push(await backend.snapshot(learnerId))
    host = new HostSession({ cli, model, pluginDirectory, workspace, systemPrompt: config.hostSystemPrompt, maxBudgetUsd: config.maxBudgetUsdPerScenario, candidate, turnTimeoutMs: config.turnTimeoutMs })
    outcome.events = host.collector.events
    const say = async (text, turnId) => {
      await host.send(text, turnId)
      outcome.snapshots.push(await backend.snapshot(learnerId))
    }
    for (const turn of scenario.turns) {
      currentTurn = turn.id
      const problem = preconditionProblem(turn.precondition, { snapshots: outcome.snapshots })
      assert.ok(!problem, `Precondition of turn ${turn.id} not met (${problem}); the learner profile no longer leads to the state this scenario tests`)
      if (turn.kind === 'prepared-start') await say(preparedPrompt, turn.id)
      else if (turn.kind === 'text') await say(turn.text.replaceAll('{{learningSessionId}}', session.id ?? '').replaceAll('{{permanentId}}', learnerId), turn.id)
      else {
        for (let round = 1; round <= turn.maxRounds; round++) {
          const learner = await learnerSay({ cli, model: learnerModel, persona: suite.personas[turn.persona], transcript: renderTranscript(outcome.events, secrets), workspace, timeoutMs: config.learnerTimeoutMs })
          learnerCostUsd += learner.costUsd
          await say(learner.text, turn.id)
          if (untilReached(turn.until, { events: outcome.events, snapshots: outcome.snapshots })) break
        }
      }
    }
    const memoryIndex = host.collector.host?.memoryPaths?.auto ? join(host.collector.host.memoryPaths.auto, 'MEMORY.md') : null
    assert.ok(!memoryIndex || !existsSync(memoryIndex), 'The host workspace has stored memory; results would not be independent')
    outcome.deterministic = evaluateScenario(scenario, {
      events: outcome.events, host: host.collector.host, candidate, model, session, permanentId: learnerId,
      snapshots: outcome.snapshots, toolCatalog, pluginDirectory, permissionDenials: host.collector.permissionDenials,
    })
    outcome.status = outcome.deterministic.passed ? 'passed' : 'failed'
  } catch (error) {
    outcome.error = { turnId: currentTurn, message: error.message }
  } finally {
    host?.close()
    outcome.host = host?.collector.host ? { model: host.collector.host.model, cliVersion: host.collector.host.cliVersion, plugins: host.collector.host.plugins, mcpServers: host.collector.host.mcpServers } : null
    outcome.estimatedUsd = Number(((host?.collector.costUsd ?? 0) + learnerCostUsd).toFixed(4))
    rmSync(work, { recursive: true, force: true })
  }
  return sanitizeReport(outcome, secrets)
}

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: root, env: childEnvironment(), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  assert.equal(result.status, 0, 'Cannot bind the test to the current Git sources')
  return result.stdout
}

export function checkedSources() {
  const config = validateConfig(readJson(resolve(root, CONFIG)))
  const suite = readJson(resolve(root, SUITE))
  const problems = validateSuite(suite)
  assert.deepEqual(problems, [], `Scenario suite is invalid: ${problems.join(' ')}`)
  const candidate = readCandidate()
  const harness = ['scripts/claude_plugin_e2e.mjs', 'scripts/claude_plugin_e2e_assertions.mjs', CONFIG, SUITE]
  return { config, suite, candidate, harnessSha256: Object.fromEntries(harness.map(path => [path, sha(readFileSync(resolve(root, path)))])) }
}

// --- Local test backend -------------------------------------------------------------------

const statePath = () => resolve(root, BACKEND_STATE_DIR, 'state.json')

export function readBackendState() {
  assert.ok(existsSync(statePath()), 'The test backend is not started. Run: node scripts/claude_plugin_e2e.mjs backend start')
  return readJson(statePath())
}

function databaseSettings(environment = process.env) {
  const defaults = /password:\s*\$\{POSTGRES_PASSWORD:([^}]*)\}/u.exec(readFileSync(resolve(root, 'backend/src/main/resources/application.yml'), 'utf8'))
  return {
    host: environment.POSTGRES_HOST ?? 'localhost', port: environment.POSTGRES_PORT ?? '5432', database: environment.POSTGRES_DB ?? 'skillpilot',
    user: environment.POSTGRES_USER ?? 'skillpilot', password: environment.POSTGRES_PASSWORD ?? defaults?.[1] ?? '',
  }
}

function listenerPid(port) {
  const result = spawnSync('ss', ['-ltnpH', `sport = :${port}`], { encoding: 'utf8' })
  const pid = /pid=(\d+)/u.exec(result.stdout ?? '')?.[1]
  return pid ? Number(pid) : null
}

async function backendStart(config) {
  const backend = new BackendClient({ config, state: {} })
  assert.ok(!(await backend.healthy()) && !listenerPid(config.backend.port), `Port ${config.backend.port} is already in use; run "backend status" or "backend stop" first`)
  const database = databaseSettings()
  const schema = spawnSync('psql', ['-h', database.host, '-p', database.port, '-U', database.user, '-d', database.database, '-v', 'ON_ERROR_STOP=1', '-c', `create schema if not exists ${config.backend.schema}`],
    { encoding: 'utf8', env: { ...childEnvironment(), PGPASSWORD: database.password }, timeout: 30_000 })
  assert.equal(schema.status, 0, `Cannot create schema ${config.backend.schema} with psql: ${(schema.stderr ?? schema.error?.message ?? '').trim().split('\n').at(-1)}`)
  const directory = resolve(root, BACKEND_STATE_DIR)
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const token = () => randomBytes(32).toString('base64url')
  const state = { port: config.backend.port, schema: config.backend.schema, clientId: OAUTH_CLIENT_ID, clientSecret: token(), startedAt: new Date().toISOString() }
  const prefix = 'skillpilot.claude.connector.v1'
  // Random per start and handed over through the environment, not the command line.
  const properties = {
    'server.port': config.backend.port,
    'spring.datasource.url': `jdbc:postgresql://${database.host}:${database.port}/${database.database}?currentSchema=${config.backend.schema}`,
    'spring.liquibase.default-schema': config.backend.schema,
    'logging.file.name': join(directory, 'skillpilot.log'),
    [`${prefix}.enabled`]: true,
    [`${prefix}.signing-secret`]: token(),
    [`${prefix}.capability-secret`]: token(),
    [`${prefix}.max-oauth-requests-per-caller-per-minute`]: 300,
    [`${prefix}.oauth.client-authentication-mode`]: 'claude-custom-confidential',
    [`${prefix}.oauth.client-id`]: state.clientId,
    [`${prefix}.oauth.client-secret`]: state.clientSecret,
    [`${prefix}.oauth.client-authentication-method`]: 'client_secret_basic',
    [`${prefix}.oauth.authorization-policy-version`]: 'e2e-local-v1',
  }
  const log = openSync(join(directory, 'bootrun.log'), 'w', 0o600)
  const child = spawn('./gradlew', ['bootRun'], {
    cwd: resolve(root, 'backend'), detached: true, stdio: ['ignore', log, log],
    env: childEnvironment(process.env, { GITHUB_CLIENT_ID: 'e2e-local', GITHUB_CLIENT_SECRET: 'e2e-local', SPRING_APPLICATION_JSON: JSON.stringify(properties) }),
  })
  closeSync(log)
  let exited = false
  child.on('exit', () => { exited = true })
  child.on('error', () => { exited = true })
  child.unref()
  writeFileSync(statePath(), `${JSON.stringify({ ...state, gradlePid: child.pid }, null, 2)}\n`, { mode: 0o600 })
  console.log(`Starting the test backend on port ${config.backend.port} with schema ${config.backend.schema}; log: ${relative(root, join(directory, 'bootrun.log'))}`)
  const deadline = Date.now() + config.backend.startTimeoutMs
  while (!(await backend.healthy())) {
    assert.ok(!exited, 'Gradle bootRun ended before the backend became healthy; see the log')
    assert.ok(Date.now() < deadline, 'The backend did not become healthy in time; see the log')
    await sleep(3000)
  }
  const connector = await new BackendClient({ config, state }).connectorInfo(await new BackendClient({ config, state }).accessToken())
  const differing = toolInputDifferences(connector.toolInputs)
  console.log(`Test backend ready: ${connector.serverInfo?.name} ${connector.serverInfo?.version}, ${connector.modelTools.length} model tools; recorded tool inputs ${differing.length ? `DIFFER for ${differing.join(', ')}` : 'equal the connector'}.`)
}

async function backendStop(config) {
  const state = existsSync(statePath()) ? readJson(statePath()) : null
  const pids = [listenerPid(config.backend.port), state?.gradlePid].filter(pid => Number.isSafeInteger(pid) && pid > 1)
  for (const pid of pids) { try { process.kill(pid, 'SIGTERM') } catch { /* already gone */ } }
  for (let attempt = 0; attempt < 30 && listenerPid(config.backend.port); attempt++) await sleep(1000)
  assert.ok(!listenerPid(config.backend.port), `A process still listens on port ${config.backend.port}`)
  rmSync(statePath(), { force: true })
  console.log(`Test backend stopped. Schema ${config.backend.schema} is kept; drop it with psql when no longer needed.`)
}

async function backendStatus(config) {
  const healthy = await new BackendClient({ config, state: {} }).healthy()
  console.log(`Test backend on port ${config.backend.port}: ${healthy ? 'healthy' : 'not reachable'}; state file ${existsSync(statePath()) ? 'present' : 'missing'}.`)
  if (!healthy || !existsSync(statePath())) process.exitCode = 1
}

// --- Command line ---------------------------------------------------------------------------

export function parseRunArguments(args) {
  const options = { scenarios: [] }
  const names = { '--scenario': 'scenario', '--model': 'model', '--learner-model': 'learnerModel', '--repetitions': 'repetitions', '--claude-bin': 'claudeBin', '--out-dir': 'outDir' }
  for (let index = 0; index < args.length; index += 2) {
    const name = names[args[index]]
    const value = args[index + 1]
    assert.ok(name && typeof value === 'string' && value && !value.startsWith('--'), USAGE)
    if (name === 'scenario') options.scenarios.push(value)
    else { assert.ok(!(name in options), `Option given twice: ${args[index]}`); options[name] = value }
  }
  if (options.repetitions !== undefined) options.repetitions = Number(options.repetitions)
  return options
}

export async function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv
  assert.ok(['check', 'backend', 'run'].includes(command), USAGE)
  const sources = checkedSources()
  if (command === 'check') {
    assert.equal(rest.length, 0, USAGE)
    console.log(`Claude plugin end-to-end configuration checked: ${sources.suite.scenarios.length} scenarios for ${sources.candidate.name} ${sources.candidate.version}; NO MODEL TESTS EXECUTED.`)
    return null
  }
  if (command === 'backend') {
    assert.ok(rest.length === 1 && ['start', 'stop', 'status'].includes(rest[0]), USAGE)
    await ({ start: backendStart, stop: backendStop, status: backendStatus })[rest[0]](sources.config)
    return null
  }
  const options = parseRunArguments(rest)
  const config = validateConfig({ ...sources.config, model: options.model ?? sources.config.model, learnerModel: options.learnerModel ?? sources.config.learnerModel, repetitions: options.repetitions ?? sources.config.repetitions })
  const unknown = options.scenarios.filter(id => !sources.suite.scenarios.some(scenario => scenario.id === id))
  assert.deepEqual(unknown, [], `Unknown scenario: ${unknown.join(', ')}`)
  const scenarios = sources.suite.scenarios.filter(scenario => !options.scenarios.length || options.scenarios.includes(scenario.id))
  const cli = resolveCli(options.claudeBin)
  assert.ok(compareVersions(cli.version, config.minimumCliVersion) >= 0, `Claude Code ${cli.version} is too old for these models; version ${config.minimumCliVersion} or newer is required (run "claude update" or pass --claude-bin)`)
  const backend = new BackendClient({ config, state: readBackendState() })
  assert.ok(await backend.healthy(), 'The test backend is not reachable. Run: node scripts/claude_plugin_e2e.mjs backend start')
  const connector = await backend.connectorInfo(await backend.accessToken())

  const out = resolve(root, options.outDir ?? `${RUNS_DIR}/${new Date().toISOString().replaceAll(':', '-')}`)
  const tmp = realpathSync(resolve(root, 'tmp'))
  assert.ok(out.startsWith(`${tmp}/`) && !existsSync(out), 'Use a fresh output directory below repository tmp/')
  let ancestor = dirname(out)
  while (!existsSync(ancestor)) ancestor = dirname(ancestor)
  assert.ok(realpathSync(ancestor) === tmp || realpathSync(ancestor).startsWith(`${tmp}/`), 'Output symlink escapes tmp/')
  mkdirSync(out, { recursive: true, mode: 0o700 })

  const report = {
    schemaVersion: 1, layer: LAYER, hostAcceptance: 'claude_ai_not_tested', startedAt: new Date().toISOString(),
    bindings: {
      gitCommit: gitOutput(['rev-parse', 'HEAD']).trim(), workingTreeClean: gitOutput(['status', '--porcelain', '--untracked-files=no']).trim() === '',
      candidate: { name: sources.candidate.name, version: sources.candidate.version, packageSha256: sources.candidate.packageSha256, directInstallSha256: sources.candidate.directInstallSha256, files: sources.candidate.files },
      harness: sources.harnessSha256, claudeCodeVersion: cli.version, model: config.model, learnerModel: config.learnerModel, connector,
    },
    selection: options.scenarios.length ? 'partial' : 'complete', repetitions: config.repetitions, cases: [], status: 'incomplete', total: scenarios.length * config.repetitions,
  }
  const save = () => writeFileSync(resolve(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
  save()
  try {
    assert.deepEqual(connector.toolsWithoutAnnotations, [], `Connector tools without title or read/destructive annotation: ${connector.toolsWithoutAnnotations.join(', ')}`)
    assert.deepEqual(toolInputDifferences(connector.toolInputs), [], `${TOOL_INPUTS} no longer equals the input fields of these connector tools`)
    for (let repetition = 1; repetition <= config.repetitions; repetition++) {
      for (const scenario of scenarios) {
        const result = await runScenario({ scenario, suite: sources.suite, config, candidate: sources.candidate, cli, backend, model: config.model, learnerModel: config.learnerModel, toolCatalog: connector.modelTools })
        report.cases.push({ ...result, repetition })
        report.estimatedUsd = Number(report.cases.reduce((sum, entry) => sum + (entry.estimatedUsd ?? 0), 0).toFixed(4))
        save()
        console.log(`${scenario.id}/${repetition}: ${result.status}${result.status === 'failed' ? ` (${result.deterministic.failures.join(', ')})` : ''}${result.error ? ` (${result.error.message})` : ''}`)
      }
    }
    assert.deepEqual(checkedSources().harnessSha256, sources.harnessSha256, 'Test sources changed during the run; results cannot certify this candidate')
    assert.equal(readCandidate().packageSha256, sources.candidate.packageSha256, 'The plugin candidate changed during the run')
    Object.assign(report, summarizeRun(report.cases, scenarios.map(scenario => scenario.id), config.repetitions))
    // A partial selection is a diagnosis aid; only the whole suite can be reported as passed.
    if (report.status === 'passed' && report.selection === 'partial') report.status = 'passed_partial_selection'
  } catch (error) { report.status = 'error'; report.error = error.message }
  finally {
    report.finishedAt = new Date().toISOString()
    save()
    console.log(`Claude plugin end-to-end run: ${report.status}; report: ${relative(root, resolve(out, 'report.json'))}; estimated list-price usage ${report.estimatedUsd ?? 0} USD; claude.ai host: NOT TESTED`)
    if (report.status !== 'passed') process.exitCode = 1
  }
  return report
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1 })
