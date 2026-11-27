import { OPENAI_PLUGIN } from "./lib/openai_plugin_config.mjs";
/** Test-only API actor + independent judge. Never imported by the runtime coach. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { digest, validateSuite } from './openai_plugin_submission.mjs'
import { evaluateDialogCase, buildJudgeRequest, validateJudgeResult } from './openai_dialog_assertions.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const plugin = resolve(root, OPENAI_PLUGIN.sourcePath)
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const sha = data => createHash('sha256').update(data).digest('hex')
const API_URL = 'https://api.openai.com/v1/responses'
const APP_ONLY = 'review_skillpilot_memory_practice_card'

export function childEnvironment(environment = process.env) {
  return Object.fromEntries(['PATH', 'LANG', 'LC_ALL', 'TMPDIR', 'HOME', 'JAVA_HOME', 'GRADLE_USER_HOME', 'XDG_CACHE_HOME', 'SKILLPILOT_BACKEND_BUILD_DIR']
    .filter(key => environment[key]).map(key => [key, environment[key]]))
}

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: root, env: childEnvironment(), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  assert.equal(result.status, 0, 'Cannot bind the test to the current Git sources')
  return result.stdout
}

export function validateConfig(config, now = new Date(), { requireCurrentPricing = true } = {}) {
  assert.equal(config.schemaVersion, 1)
  // Changing a model also requires a reviewed price entry, not an unpriced env override.
  assert.equal(config.model, 'gpt-5.6-sol', 'Review model support and price bounds before changing the model')
  assert.equal(config.judgeModel, config.model)
  assert.ok(['none', 'low', 'medium', 'high'].includes(config.reasoningEffort))
  for (const [name, maximum] of Object.entries({ repetitions: 5, maxRequests: 500, maxRequestsPerTurn: 20, maxOutputTokens: 8192, maxRequestBytes: 200000, requestTimeoutMs: 60000 })) {
    assert.ok(Number.isSafeInteger(config[name]) && config[name] > 0 && config[name] <= maximum, `Invalid ${name}`)
  }
  assert.ok(Number.isFinite(config.maxEstimatedUsd) && config.maxEstimatedUsd > 0 && config.maxEstimatedUsd <= 25, 'Invalid cost ceiling')
  assert.ok(config.pricing.inputUsdPerMillion >= 5 && config.pricing.outputUsdPerMillion >= 20, 'Unreviewed price reduction')
  assert.match(config.pricing.validThrough, /^\d{4}-\d{2}-\d{2}$/u)
  if (requireCurrentPricing) assert.ok(now.toISOString().slice(0, 10) <= config.pricing.validThrough, 'API price verification expired; review rates first')
  return config
}

/** Reserve BEFORE requests; ambiguous failures keep their full reservation. No paid retries. */
export class ResponsesClient {
  constructor({ apiKey, config, fetchImpl = fetch }) {
    assert.ok(typeof apiKey === 'string' && apiKey.trim(), 'OPENAI_EVAL_API_KEY is missing; no API tests executed')
    this.apiKey = apiKey
    this.config = validateConfig(config)
    this.fetchImpl = fetchImpl
    this.usage = { requests: 0, inputTokens: 0, outputTokens: 0, estimatedUsd: 0, requestsWithUncertainUsage: 0 }
    this.requests = []
  }

  async respond(payload, label) {
    assert.ok(!this.halted, 'API client halted after an uncertain or invalid response')
    try { return await this.request(payload, label) }
    catch (error) { this.halted = true; throw error }
  }

  async request(payload, label) {
    const c = this.config
    assert.ok(this.usage.requests < c.maxRequests, 'Run request limit reached')
    const body = { ...payload, store: false, max_output_tokens: c.maxOutputTokens, service_tier: 'default' }
    assert.ok([c.model, c.judgeModel].includes(body.model), 'Unpriced model')
    const serialized = JSON.stringify(body)
    const bytes = Buffer.byteLength(serialized)
    assert.ok(bytes <= c.maxRequestBytes, 'Request size limit reached')
    // UTF-8 bytes upper-bound ordinary text tokens. Include framing/special-token allowance.
    const reservedInput = bytes + 8192
    const reservation = (reservedInput * c.pricing.inputUsdPerMillion + c.maxOutputTokens * c.pricing.outputUsdPerMillion) / 1e6
    assert.ok(this.usage.estimatedUsd + reservation <= c.maxEstimatedUsd, 'Run cost reservation limit reached')
    this.usage.requests++
    this.usage.estimatedUsd += reservation
    this.usage.requestsWithUncertainUsage++
    const record = { label, status: 'error', reservedUsd: reservation }
    this.requests.push(record)
    const response = await this.fetchImpl(API_URL, {
      method: 'POST', redirect: 'error',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: serialized, signal: AbortSignal.timeout(c.requestTimeoutMs),
    })
    record.requestId = response.headers.get('x-request-id') ?? null
    // Do not echo the response error body: it can reflect credentials or request content.
    assert.ok(response.ok, `OpenAI API HTTP ${response.status}`)
    const data = await response.json()
    const usage = data.usage
    assert.ok(Number.isSafeInteger(usage?.input_tokens) && usage.input_tokens >= 0, 'Missing input usage')
    assert.ok(Number.isSafeInteger(usage?.output_tokens) && usage.output_tokens >= 0, 'Missing output usage')
    assert.ok(usage.input_tokens <= reservedInput && usage.output_tokens <= c.maxOutputTokens, 'Token reservation violated; halt and review pricing')
    const estimated = (usage.input_tokens * c.pricing.inputUsdPerMillion + usage.output_tokens * c.pricing.outputUsdPerMillion) / 1e6
    this.usage.estimatedUsd += estimated - reservation
    this.usage.requestsWithUncertainUsage--
    this.usage.inputTokens += usage.input_tokens
    this.usage.outputTokens += usage.output_tokens
    Object.assign(record, { responseId: data.id, model: data.model, usage, estimatedUsd: estimated, status: data.status })
    assert.equal(data.status, 'completed', 'Incomplete API response is not a passed test')
    assert.ok(Array.isArray(data.output), 'API response has no output array')
    return data
  }
}

export function modelTools(tools) {
  return tools.filter(tool => {
    const visibility = (tool.meta ?? tool._meta)?.ui?.visibility
    return tool.name !== APP_ONLY && (!visibility || visibility.includes('model'))
  }).map(tool => ({
    type: 'function', name: tool.name, description: tool.description,
    parameters: tool.inputSchema,
    // Preserve the actual optional-field contract. Strict normalization changes its semantics.
    strict: false,
  }))
}

export function modelResult(result) {
  assert.ok(result && typeof result === 'object', 'Missing MCP result')
  // Deliberate allowlist. Component-only card fronts, backs and capabilities stay private.
  return Object.fromEntries(['content', 'structuredContent', 'isError'].filter(key => key in result).map(key => [key, result[key]]))
}

export function sanitizeReport(value, apiKey = '') {
  if (typeof value === 'string') {
    let text = apiKey ? value.replaceAll(apiKey, '[REDACTED_API_KEY]') : value
    text = text.replace(/\b(?:sk-[\w-]{16,}|Bearer\s+[\w.-]{16,})/gu, '[REDACTED_CREDENTIAL]')
    text = text.replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/gu, token => `[capability:${sha(token).slice(0, 16)}]`)
    text = text.replace(/\bsps_[\w-]{20,}/gu, '[synthetic-session]')
    return text
  }
  if (Array.isArray(value)) return value.map(item => sanitizeReport(item, apiKey))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['_meta', 'meta', 'encrypted_content'].includes(key))
    .map(([key, item]) => [key, /^(?:apiKey|authorization|access_token|refresh_token|client_secret)$/iu.test(key) ? '[REDACTED]' : sanitizeReport(item, apiKey)]))
  return value
}

/** Child gets no API key or inherited production credentials. No network listener. */
export class FixtureBridge {
  constructor(manifest) {
    const safeEnv = Object.fromEntries(['PATH', 'LANG', 'LC_ALL', 'TMPDIR'].filter(key => process.env[key]).map(key => [key, process.env[key]]))
    this.child = spawn(manifest.javaExecutable, ['-cp', manifest.classpath, manifest.mainClass], { cwd: resolve(root, 'backend'), env: safeEnv, stdio: ['pipe', 'pipe', 'pipe'] })
    this.sequence = 0
    this.pending = new Map()
    this.closed = false
    this.child.stderr.resume() // Test-only framework logging is not an evidence artifact.
    createInterface({ input: this.child.stdout }).on('line', line => {
      try {
        const response = JSON.parse(line)
        const pending = this.pending.get(response.id)
        assert.ok(pending, 'Unsolicited fixture output')
        this.pending.delete(response.id)
        clearTimeout(pending.timer)
        if (response.ok) pending.resolve(response)
        else pending.reject(new Error(`Fixture ${response.error?.code ?? 'ERROR'}: ${response.error?.message ?? 'request failed'}`))
      } catch (error) { this.fail(error) }
    })
    this.child.on('error', error => this.fail(error))
    this.child.on('exit', () => this.fail(new Error('Fixture process exited')))
  }
  fail(error) {
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error) }
    this.pending.clear()
    this.closed = true
  }
  request(request) {
    assert.ok(!this.closed, 'Fixture process is closed')
    const id = ++this.sequence
    return new Promise((resolveRequest, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('Fixture timeout')); this.close() }, 30000)
      this.pending.set(id, { resolve: resolveRequest, reject, timer })
      this.child.stdin.write(`${JSON.stringify({ ...request, id })}\n`)
    })
  }
  close() { this.fail(new Error('Fixture closed')); this.child.stdin.end(); this.child.kill() }
}

export async function runDialogCase({ testCase, bridge, client, instructions, config, expectedTools }) {
  const events = []
  const outcome = { id: testCase.id, status: 'error', events, hostAcceptance: 'not_tested', componentInteraction: testCase.id === 'P3' ? 'simulated' : 'not_tested' }
  let currentTurn = null
  try {
    const setup = await bridge.request({ action: 'reset', caseId: testCase.id })
    assert.equal(setup.caseId, testCase.id)
    assert.equal(setup.evidenceLayer, 'model-api-with-simulated-domain')
    const tools = modelTools(setup.tools)
    const byName = catalog => [...catalog].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    assert.deepEqual(byName(tools), byName(modelTools(expectedTools)), 'Fixture tool catalog differs from the candidate')
    assert.equal(setup.serverInstructions, instructions.server, 'Fixture instructions differ from candidate')
    outcome.initialState = (await bridge.request({ action: 'snapshot' })).state
    const input = [...(setup.priorConversation ?? [])]
    const knownTools = new Set(tools.map(tool => tool.name))
    const actorInstructions = `${instructions.skill}\n\n${instructions.policy}\n\n${instructions.server}`
    outcome.actorInstructionsSha256 = sha(actorInstructions)
    for (const turn of testCase.turns) {
      currentTurn = turn.id
      if (turn.kind === 'ui') {
        const stateBefore = (await bridge.request({ action: 'snapshot' })).state
        const ui = await bridge.request({ action: 'ui', turnId: turn.id })
        const stateAfter = (await bridge.request({ action: 'snapshot' })).state
        events.push({ type: 'ui', actor: 'component', turnId: turn.id, text: turn.text })
        assert.ok(Array.isArray(ui.events) && ui.events.length > 0, 'UI simulation returned no executed events')
        events.push(...ui.events.map(event => ({ ...event, turnId: turn.id, actor: 'component', result: modelResult(event.result) })))
        // Aggregate UI boundaries are explicit; do not invent per-card snapshots.
        outcome.componentState = { stateBefore, stateAfter }
        assert.equal(stateAfter.masteryWrites, stateBefore.masteryWrites, 'Ordinary card practice changed mastery')
        assert.deepEqual(stateAfter.domainState?.mastery, stateBefore.domainState?.mastery, 'Ordinary card practice changed mastery state')
        continue
      }
      const text = turn.kind === 'prepared-start' ? setup.preparedMessage : turn.text
      assert.ok(typeof text === 'string' && text.trim(), 'Prepared fixture message is missing')
      events.push({ type: 'user', actor: 'user', turnId: turn.id, text })
      input.push({ role: 'user', content: text })
      let ended = false
      for (let step = 0; step < config.maxRequestsPerTurn; step++) {
        const response = await client.respond({
          model: config.model, instructions: actorInstructions, tools, input,
          tool_choice: 'auto', parallel_tool_calls: false,
          reasoning: { effort: config.reasoningEffort }, include: ['reasoning.encrypted_content'],
        }, `${testCase.id}/${turn.id}/${step}`)
        input.push(...response.output)
        let calls = 0
        let visible = false
        for (const item of response.output) {
          if (item.type === 'reasoning') continue
          if (item.type === 'message') {
            assert.ok(item.content.every(content => content.type === 'output_text'), 'Refused or non-text actor response')
            const answer = item.content.map(content => content.text).join('')
            if (answer.trim()) { visible = true; events.push({ type: 'assistant', actor: 'model', turnId: turn.id, text: answer }) }
            continue
          }
          assert.equal(item.type, 'function_call', 'Unexpected actor output type')
          calls++
          const event = { type: 'tool', actor: 'model', turnId: turn.id, name: item.name }
          events.push(event) // Record attempts, even malformed or forbidden ones.
          assert.ok(knownTools.has(item.name), 'Unknown or app-only tool attempted by model')
          event.arguments = JSON.parse(item.arguments)
          if (testCase.tools.forbidden.includes('*') || testCase.tools.forbidden.includes(item.name)) {
            event.blocked = true
            throw new Error(`Forbidden tool attempted: ${item.name}`)
          }
          event.stateBefore = (await bridge.request({ action: 'snapshot' })).state
          const result = await bridge.request({ action: 'call', name: item.name, arguments: event.arguments })
          event.result = modelResult(result.rawMcpResult)
          event.stateAfter = (await bridge.request({ action: 'snapshot' })).state
          input.push({ type: 'function_call_output', call_id: item.call_id, output: JSON.stringify(event.result) })
        }
        if (calls === 0) { assert.ok(visible, 'Empty actor turn'); ended = true; break }
      }
      assert.ok(ended, 'Tool loop limit reached')
    }
    outcome.finalState = (await bridge.request({ action: 'snapshot' })).state
    events.forEach((event, index) => { event.id = `e${index + 1}` })
    outcome.deterministic = evaluateDialogCase(testCase, events)
    const request = buildJudgeRequest(testCase, sanitizeReport(events))
    outcome.judgePromptSha256 = sha(JSON.stringify(request))
    if (request) {
      const response = await client.respond({ ...request, model: config.judgeModel, reasoning: { effort: config.reasoningEffort } }, `${testCase.id}/semantic-judge`)
      const text = response.output.filter(item => item.type === 'message').flatMap(item => item.content).filter(item => item.type === 'output_text').map(item => item.text).join('')
      outcome.semantic = validateJudgeResult(testCase, JSON.parse(text), events)
    } else outcome.semantic = { passed: true, checks: [], evaluator: 'not_required' }
    outcome.status = outcome.deterministic.passed && outcome.semantic.passed ? 'passed' : 'failed'
  } catch (error) {
    events.forEach((event, index) => { event.id = `e${index + 1}` })
    outcome.error = { turnId: currentTurn, message: error.message }
    outcome.deterministic = evaluateDialogCase(testCase, events)
  }
  return outcome
}

export function bindDialogSubmissionPackage(zipPath) {
  const script = resolve(root, 'scripts/openai_plugin_submission.mjs')
  const args = zipPath ? ['check', '--zip', resolve(zipPath)] : ['check']
  const child = spawnSync(process.execPath, [script, ...args], { cwd: root, env: childEnvironment(), encoding: 'utf8', timeout: 300000 })
  assert.equal(child.status, 0, zipPath
    ? 'Submission package check failed; run openai_plugin_submission.mjs check --zip PATH for details'
    : 'Submission package check failed; run openai_plugin_submission.mjs check for details')
  const receipt = /^CHECK openai_plugin_submission PACKAGE archiveSha256=([a-f0-9]{64}) reportSha256=([a-f0-9]{64})$/mu.exec(child.stdout)
  assert.ok(receipt, 'Submission check did not report the package and build report digests')
  const reportBytes = readFileSync(resolve(plugin, 'submission/generated/submission-package.json'))
  assert.equal(sha(reportBytes), receipt[2], 'Submission build report changed after verification')
  const report = JSON.parse(reportBytes)
  assert.equal(report.archiveSha256, receipt[1], 'Verified archive digest differs from the submission build report')

  // The check reconstructs the deterministic ZIP and byte-compares any supplied
  // archive. Load the exact verified member bytes without a second ZIP parser.
  const packagedSource = (path, source = path) => {
    const member = report.files.find(file => file.path === path)
    assert.ok(member, `Submission ZIP is missing its member: ${path}`)
    const bytes = readFileSync(resolve(plugin, source))
    assert.equal(bytes.length, member.bytes, `Packaged member size changed after verification: ${path}`)
    assert.equal(sha(bytes), member.sha256, `Packaged member bytes changed after verification: ${path}`)
    return bytes
  }
  const skill = packagedSource(`${OPENAI_PLUGIN.skillPath}/SKILL.md`)
  const policy = packagedSource(`${OPENAI_PLUGIN.skillPath}/references/coaching-policy.md`)
  const agent = packagedSource(`${OPENAI_PLUGIN.skillPath}/agents/openai.yaml`)
  const manifest = JSON.parse(packagedSource('.codex-plugin/plugin.json', 'submission/generated/submission-plugin.json'))
  assert.equal(manifest.name, OPENAI_PLUGIN.identity, 'Unexpected packaged plugin identity')
  assert.equal(manifest.version, report.candidateVersion, 'Packaged manifest version differs from the verified build')
  assert.equal(manifest.skills, './skills/', 'Submission manifest does not load the bundled skills')
  assert.equal(manifest.mcpServers, './.mcp.json', 'Submission manifest does not load the packaged MCP configuration')
  assert.ok(manifest.apps == null && manifest.extensions?.['com.openai']?.apps == null, 'Submission manifest contains a competing app binding')
  const mcp = packagedSource('.mcp.json')
  const servers = JSON.parse(mcp).mcpServers
  assert.deepEqual(Object.keys(servers), [OPENAI_PLUGIN.identity], 'Submission package does not declare the SkillPilot MCP server')
  const server = servers[OPENAI_PLUGIN.identity]
  const endpoint = server.url
  assert.equal(endpoint, OPENAI_PLUGIN.publicEndpoint, 'Submission package does not use the SkillPilot MCP endpoint')
  const auth = server.extensions?.['com.openai']?.auth
  assert.equal(auth?.type, 'oauth', 'Submission MCP requires OAuth')
  const dependencies = JSON.parse(agent).dependencies?.tools?.filter(tool => tool.type === 'mcp') ?? []
  assert.equal(dependencies.length, 1, 'Coach skill must depend on exactly one MCP server')
  assert.equal(dependencies[0].value, OPENAI_PLUGIN.identity, 'Coach skill depends on a different MCP server')
  assert.equal(dependencies[0].url, endpoint, 'Coach skill and packaged MCP endpoints differ')
  assert.equal(dependencies[0].transport, 'streamable_http', 'Coach skill requires remote MCP over streaming HTTP')
  return {
    report,
    instructions: { skill: skill.toString('utf8'), policy: policy.toString('utf8') },
    bindings: {
      packageArchiveSource: zipPath ? 'provided-zip' : 'reproduced-in-memory',
      packageArchiveSha256: report.archiveSha256,
      packageMcpEndpoint: endpoint,
      packageMcpSha256: sha(mcp), skillSha256: sha(skill), policySha256: sha(policy), skillAgentSha256: sha(agent),
    },
  }
}

function checkedSources(config, zipPath) {
  const packaged = bindDialogSubmissionPackage(zipPath)
  const manifest = readJson(resolve(plugin, '.codex-plugin/plugin.json'))
  const snapshot = resolve(root, 'contracts/drafts/openai', manifest.name, `${manifest.version}-SNAPSHOT`)
  const contract = readJson(resolve(snapshot, 'contract/contract.json'))
  const suite = readJson(resolve(plugin, 'submission/review-cases.json'))
  validateSuite(suite, manifest, contract)
  const files = ['scripts/openai_dialog_eval.mjs', 'scripts/openai_dialog_assertions.mjs', 'scripts/openai_plugin_submission.mjs', 'scripts/config/openai-dialog-eval.json', 'backend/build.gradle.kts']
  const harnessDir = resolve(root, 'backend/src/test/java/com/skillpilot/backend/openai/mcp/de')
  files.push(...readdirSync(harnessDir).filter(name => name.startsWith('OpenAiDialogReplay')).map(name => relative(root, resolve(harnessDir, name))))
  const bindings = {
    ...packaged.bindings,
    gitCommit: gitOutput(['rev-parse', 'HEAD']).trim(),
    backendSourceSha256: digest(gitOutput(['ls-files', '--cached', '--others', '--exclude-standard', '--', 'backend/src/main/java']).trim().split('\n').sort().map(path => [path, sha(readFileSync(resolve(root, path)))])),
    candidateVersion: manifest.version, suiteSha256: digest(suite), contractSha256: digest(contract),
    snapshotManifestSha256: sha(readFileSync(resolve(snapshot, 'snapshot-manifest.json'))),
    configSha256: digest(config),
    files: Object.fromEntries(files.map(path => [path, sha(readFileSync(resolve(root, path)))])),
  }
  assert.equal(bindings.candidateVersion, packaged.report.candidateVersion, 'Dialog and submission package versions differ')
  for (const field of ['suiteSha256', 'contractSha256', 'snapshotManifestSha256']) {
    assert.equal(bindings[field], packaged.report.sourceBindings[field], `Dialog input differs from the verified submission package: ${field}`)
  }
  return { suite, contract, bindings, instructions: { ...packaged.instructions, server: contract.serverInstructions } }
}

export function summarizeRun(cases, expectedIds, repetitions) {
  const expected = expectedIds.flatMap(id => Array.from({ length: repetitions }, (_, i) => `${id}/${i + 1}`)).sort()
  const actual = cases.map(entry => `${entry.id}/${entry.repetition}`).sort()
  const complete = JSON.stringify(actual) === JSON.stringify(expected)
  return { status: complete && cases.every(entry => entry.status === 'passed') ? 'passed' : 'failed', complete, passed: cases.filter(entry => entry.status === 'passed').length, total: expected.length }
}

export async function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv
  assert.ok(['check', 'run'].includes(command), 'Usage: node scripts/openai_dialog_eval.mjs check|run [--zip PATH] [--out-dir tmp/PATH]')
  const { values } = parseArgs({ args, options: { zip: { type: 'string', multiple: true }, 'out-dir': { type: 'string', multiple: true } } })
  for (const [flag, paths] of Object.entries(values)) assert.ok(paths.length === 1 && paths[0].trim(), `Use exactly one nonempty path for --${flag}`)
  const zipPath = values.zip?.[0]
  const config = validateConfig(readJson(resolve(root, 'scripts/config/openai-dialog-eval.json')), new Date(), { requireCurrentPricing: command === 'run' })
  const sources = checkedSources(config, zipPath)
  const release = spawnSync(process.execPath, [resolve(root, 'scripts/openai_plugin_release.mjs'), 'verify'], { cwd: root, env: childEnvironment(), stdio: 'pipe', timeout: 300000 })
  assert.equal(release.status, 0, 'openai_plugin_release.mjs preflight failed; run it directly for details')
  if (command === 'check') {
    console.log(`Submission package verified: ${sources.bindings.candidateVersion} sha256=${sources.bindings.packageArchiveSha256} MCP=${sources.bindings.packageMcpEndpoint}`)
    console.log(`API dialog configuration checked: ${sources.suite.cases.length} cases; NO MODEL TESTS EXECUTED.`)
    return
  }
  const out = resolve(root, values['out-dir']?.[0] ?? `tmp/openai-dialog-eval/${new Date().toISOString().replaceAll(':', '-')}`)
  const tmp = realpathSync(resolve(root, 'tmp'))
  assert.ok(out.startsWith(`${tmp}/`) && !existsSync(out), 'Use a fresh output directory below repository tmp/')
  // Validate existing ancestor symlinks before creating the output directory.
  let ancestor = dirname(out)
  while (!existsSync(ancestor)) ancestor = dirname(ancestor)
  assert.ok(realpathSync(ancestor) === tmp || realpathSync(ancestor).startsWith(`${tmp}/`), 'Output symlink escapes tmp/')
  mkdirSync(out, { recursive: true, mode: 0o700 })
  const apiKey = process.env.OPENAI_EVAL_API_KEY
  const report = {
    schemaVersion: 1, layer: 'model-api-with-simulated-domain', hostAcceptance: 'not_tested',
    startedAt: new Date().toISOString(), bindings: sources.bindings, config,
    cases: [], status: 'incomplete', total: sources.suite.cases.length * config.repetitions,
  }
  let bridge, client
  const save = () => writeFileSync(resolve(out, 'report.json'), `${JSON.stringify(sanitizeReport(report, apiKey), null, 2)}\n`, { mode: 0o600 })
  save()
  try {
    client = new ResponsesClient({ apiKey, config })
    const build = spawnSync('./gradlew', ['--quiet', 'prepareOpenAiDialogReplay'], { cwd: resolve(root, 'backend'), encoding: 'utf8', timeout: 300000,
      env: childEnvironment(),
    })
    assert.equal(build.status, 0, 'Fixture compilation failed; run backend/gradlew prepareOpenAiDialogReplay for details')
    bridge = new FixtureBridge(readJson(resolve(root, 'backend/build/openai-dialog-replay/launcher.json')))
    for (let repetition = 1; repetition <= config.repetitions; repetition++) {
      for (const testCase of sources.suite.cases) {
        const result = await runDialogCase({ testCase, bridge, client, instructions: sources.instructions, config, expectedTools: sources.contract.tools })
        report.cases.push({ ...result, repetition })
        report.usage = client.usage
        report.requests = client.requests
        save()
        console.log(`${testCase.id}/${repetition}: ${result.status}`)
      }
    }
    assert.deepEqual(checkedSources(config, zipPath).bindings, sources.bindings, 'Sources or the selected ZIP changed during the run; results cannot certify this candidate')
    Object.assign(report, summarizeRun(report.cases, sources.suite.cases.map(entry => entry.id), config.repetitions))
  } catch (error) { report.status = 'error'; report.error = error.message }
  finally {
    bridge?.close()
    report.finishedAt = new Date().toISOString()
    if (client) { report.usage = client.usage; report.requests = client.requests }
    save()
    console.log(`API dialog regression: ${report.status}; report: ${relative(root, resolve(out, 'report.json'))}; ChatGPT host: NOT TESTED`)
    if (report.status !== 'passed') process.exitCode = 1
  }
  return report
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1 })
