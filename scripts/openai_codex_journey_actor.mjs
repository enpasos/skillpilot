import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { OPENAI_PLUGIN } from './lib/openai_plugin_config.mjs'
import { runLiveJourneyTurn } from './openai_live_journey_turn.mjs'

const serverName = OPENAI_PLUGIN.identity
const toolsByPhase = {
  context: 'get_skillpilot_context',
  confirm: 'confirm_skillpilot_completion_contract',
  refresh: 'get_skillpilot_context',
  mastery: 'set_skillpilot_mastery',
}
const localAuthEnvironment = ['PATH', 'HOME', 'CODEX_HOME', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME',
  'LANG', 'LC_ALL', 'USER', 'LOGNAME', 'SSL_CERT_FILE', 'SSL_CERT_DIR']
const disabledFeatures = ['apps', 'plugins', 'remote_plugin', 'hooks', 'memories', 'shell_tool', 'unified_exec',
  'multi_agent', 'multi_agent_v2', 'skill_mcp_dependency_install', 'skill_search', 'browser_use',
  'in_app_browser', 'computer_use', 'image_generation', 'view_image']
const deniesCompletion = [
  /\b(?:nicht|nie)\s+(?:\p{L}+\s+){0,2}(?:gespeichert|abgeschlossen|pausiert|pausieren)\b/iu,
  /\bkein(?:e[nsrm]?)?\s+(?:\p{L}+\s+){0,2}(?:lernpause|pause|abschluss|speicherung)\b/iu,
  /\b(?:konnte(?:n|st)?|kann(?:st)?|können|könnte(?:n|st)?|werde(?:n|st)?|wird|wirst)\b[^.!?;\n]{0,60}\b(?:nicht|nie)\b[^.!?;\n]{0,35}\b(?:speichern|abschließen|pausieren)\b/iu,
  /\bpausier(?:e|en|st|t)\s+(?:\p{L}+\s+){0,2}(?:nicht|nie)\b/iu,
]

async function readRequest(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    assert.ok(size <= 128 * 1024, 'Oversized Codex MCP request')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function reply(response, id, payload) {
  response.writeHead(200, { 'content-type': 'application/json' })
    .end(JSON.stringify({ jsonrpc: '2.0', id, ...payload }))
}

function codexArgs(endpoint, instructions) {
  // The only pre-approved MCP server is the randomized, process-owned loopback bridge.
  return ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check',
    '--sandbox', 'read-only', '--json', '--color', 'never',
    '-c', 'approval_policy="never"', '-c', 'web_search="disabled"',
    '-c', 'model_reasoning_effort="low"', '-c', 'project_doc_max_bytes=0',
    '-c', `developer_instructions=${JSON.stringify(instructions)}`,
    '-c', `mcp_servers.${serverName}.url=${JSON.stringify(endpoint)}`,
    '-c', `mcp_servers.${serverName}.required=true`,
    '-c', `mcp_servers.${serverName}.default_tools_approval_mode="approve"`,
    ...disabledFeatures.flatMap(feature => ['--disable', feature]), '-']
}

function createBridge() {
  const path = `/${randomUUID()}`
  const expectedCalls = []
  let acknowledgedCalls = 0
  let tools, child, childDone, pending, replyToCall, fault, finalMessage, usage
  let completedTurns = 0

  function fail(message) {
    fault ??= new Error(message)
    pending?.reject(fault)
    pending = undefined
    if (child && child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  }

  const server = createServer({ requestTimeout: 10_000 }, async (request, response) => {
    const origin = `http://127.0.0.1:${server.address()?.port}`
    if (request.url !== path || (request.headers.origin && request.headers.origin !== origin)) {
      response.writeHead(404).end()
      return
    }
    if (request.method !== 'POST') {
      response.writeHead(405).end()
      return
    }
    try {
      const { jsonrpc, id, method, params } = await readRequest(request)
      if (jsonrpc !== '2.0') throw new Error('Invalid protocol')
      if (id == null && method === 'notifications/initialized') {
        response.writeHead(202).end()
        return
      }
      if (id == null) throw new Error('Missing request ID')
      const answer = result => reply(response, id, { result })
      switch (method) {
        case 'initialize':
          answer({ protocolVersion: params.protocolVersion, serverInfo: { name: serverName, version: 'isolated-test' },
            capabilities: { tools: {} } })
          return
        case 'tools/list': answer({ tools }); return
        case 'ping': answer({}); return
        case 'resources/list': answer({ resources: [] }); return
        case 'resources/templates/list': answer({ resourceTemplates: [] }); return
        case 'tools/call': {
          const { name, arguments: args } = params ?? {}
          if (fault || !pending || name !== pending.name || !args || typeof args !== 'object' || Array.isArray(args)) {
            reply(response, id, { error: { code: -32602, message: 'Call outside the isolated test turn' } })
            fail('Codex made an unexpected MCP tool call')
            return
          }
          const { resolve } = pending
          pending = undefined
          // Keep the Codex call open until the shared driver validates it and returns the test backend's public reply.
          replyToCall = answer
          resolve({ output: [{ type: 'function_call', name, arguments: JSON.stringify(args), call_id: randomUUID() }] })
          return
        }
        default:
          reply(response, id, { error: { code: -32601, message: 'Method unavailable in the isolated test' } })
          fail('Codex made an unexpected MCP request')
      }
    } catch {
      if (!response.headersSent) response.writeHead(400).end()
      fail('Codex sent an invalid MCP request')
    }
  })

  function recordEvent(line) {
    let event
    try { event = JSON.parse(line) } catch { fail('Codex emitted invalid JSON output'); return }
    if (typeof event?.type !== 'string') { fail('Codex emitted an invalid event'); return }
    if (event.type === 'error' || event.type === 'turn.failed') {
      fail('Codex reported an error during the learner turn')
      return
    }
    if (event.type === 'turn.completed') {
      completedTurns++
      usage = event.usage
    }
    if (!event.type?.startsWith('item.')) return
    const item = event.item
    if (!['reasoning', 'agent_message', 'mcp_tool_call'].includes(item?.type)) {
      fail('Codex attempted an action outside the isolated MCP tools')
      return
    }
    if (item.type === 'mcp_tool_call' && (item.server !== serverName || item.tool !== expectedCalls[acknowledgedCalls])) {
      fail('Codex did not acknowledge precisely the learner turn MCP calls')
      return
    }
    if (event.type === 'item.completed' && item.type === 'mcp_tool_call') {
      if (item.status !== 'completed') fail('Codex did not acknowledge precisely the learner turn MCP calls')
      else acknowledgedCalls++
    }
    if (event.type === 'item.completed' && item.type === 'agent_message') finalMessage = item.text
  }

  return {
    async listen() {
      await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
    },
    start(payload, cwd, env, spawnProcess) {
      tools = payload.tools.map(({ name, description, parameters }) => ({ name, description, inputSchema: parameters }))
      const endpoint = `http://127.0.0.1:${server.address().port}${path}`
      child = spawnProcess('codex', codexArgs(endpoint, payload.instructions),
        { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], timeout: 150_000, killSignal: 'SIGKILL' })
      childDone = new Promise(resolve => {
        child.once('error', () => resolve(false))
        child.once('close', status => resolve(status === 0))
      })
      createInterface({ input: child.stdout }).on('line', recordEvent)
      child.stderr.resume()
      child.stdin.on('error', () => fail('Could not send the learner prompt to Codex'))
      child.stdin.end(payload.input.map(({ role, content }) => `<${role}>\n${content}\n</${role}>`).join('\n\n'))
    },
    async decide(payload, phase, start) {
      if (fault) throw fault
      const name = toolsByPhase[phase]
      assert.ok(name && !pending, 'Unexpected phase of the isolated Codex turn')
      expectedCalls.push(name)
      const decision = new Promise((resolve, reject) => { pending = { name, resolve, reject } })
      if (phase === 'context') start()
      else this.reply(JSON.parse(payload.input.at(-1).output))
      return Promise.race([decision, childDone.then(() => {
        throw fault ?? new Error(`Codex ended before the ${phase} decision`)
      })])
    },
    reply(result) {
      if (fault) throw fault
      assert.ok(replyToCall, 'Codex was not waiting for an MCP result')
      replyToCall(result)
      replyToCall = undefined
    },
    async finish(result) {
      this.reply(result)
      const success = await childDone
      if (fault) throw fault
      assert.ok(success && completedTurns === 1, 'Codex did not complete the learner turn')
      assert.equal(acknowledgedCalls, expectedCalls.length, 'Codex did not acknowledge precisely the learner turn MCP calls')
      assert.ok(typeof finalMessage === 'string' && /\b(?:pausier(?:e|en|st|t)|lernpause|pause)\b/iu.test(finalMessage)
        && /\b(?:gespeichert|abgeschlossen)\b/iu.test(finalMessage) && !deniesCompletion.some(pattern => pattern.test(finalMessage)),
        'Codex did not acknowledge the saved orientation and pause')
      return Object.fromEntries(['input_tokens', 'cached_input_tokens', 'output_tokens']
        .filter(key => Number.isSafeInteger(usage?.[key]) && usage[key] >= 0).map(key => [key, usage[key]]))
    },
    async close() {
      if (child && child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
      if (childDone) await childDone
      if (server.listening) await new Promise(resolve => {
        server.close(resolve)
        server.closeAllConnections()
      })
    },
  }
}

export async function runCodexJourneyTurn(fixture, options,
  { environment = process.env, spawnProcess = spawn, checkLogin = spawnSync, runTurn = runLiveJourneyTurn } = {}) {
  assert.ok(!environment.CI, 'The opt-in Codex learner turn runs locally')
  // Keep access to the regular CLI login without inheriting API keys or test backend settings.
  const env = Object.fromEntries(localAuthEnvironment.filter(key => environment[key]).map(key => [key, environment[key]]))
  const scratch = await mkdtemp(join('/tmp', 'skillpilot-codex-journey-'))
  const bridge = createBridge()
  try {
    const login = checkLogin('codex', ['login', 'status'],
      { cwd: scratch, env, timeout: 10_000, maxBuffer: 64 * 1024, encoding: 'utf8' })
    assert.ok(login.status === 0 && /Logged in using ChatGPT/u.test(`${login.stdout}\n${login.stderr}`),
      'Codex CLI requires an active ChatGPT login')
    await bridge.listen()
    const client = { respond: (payload, phase) => bridge.decide(payload, phase, () => bridge.start(payload, scratch, env, spawnProcess)) }
    const receipt = await runTurn(fixture, { ...options, client, mode: 'model' })
    const usage = await bridge.finish(receipt.result)
    return { ...receipt, mode: 'codex', modelRequests: null, pauseAcknowledged: true, saveAcknowledged: true,
      ...(Object.keys(usage).length ? { usage } : {}) }
  } finally {
    await bridge.close()
    await rm(scratch, { recursive: true, force: true })
  }
}
