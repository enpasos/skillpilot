/** Opt-in orientation turn through the test application's loopback MCP transport. */
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual, parseArgs } from 'node:util'
import { OPENAI_PLUGIN } from './lib/openai_plugin_config.mjs'
import { bindDialogSubmissionPackage, modelResult, modelTools, ResponsesClient, validateConfig } from './openai_dialog_eval.mjs'
import { digest } from './openai_plugin_submission.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const protocol = '2025-11-25'
const getContext = 'get_skillpilot_context'
const setMastery = 'set_skillpilot_mastery'
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const boundedText = (value, limit) => typeof value === 'string' && value.trim() && value.length <= limit
const sessionPattern = /(?<![\w-])sps_[\w-]{20,}(?![\w-])/gu
const requestIdPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu

function parseJson(text, subject) {
  try { return JSON.parse(text) }
  catch { assert.fail(`Invalid JSON from ${subject}`) }
}

async function boundedBody(stream, maximum) {
  const chunks = []
  let size = 0
  for await (const chunk of stream) {
    size += chunk.length
    assert.ok(size <= maximum, 'Journey input or loopback response exceeds its byte limit')
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

function validateFixture(fixture) {
  assert.ok(object(fixture), 'Missing local journey fixture')
  const { port, learningSessionId, accessToken, orientationGoalId, orientationPathId, priorConversation, learnerMessage } = fixture
  assert.ok(Number.isInteger(port) && port > 0 && port <= 65535, 'Invalid loopback test port')
  assert.ok(typeof learningSessionId === 'string' && /^sps_[\w-]{20,256}$/u.test(learningSessionId), 'Invalid test learning session')
  assert.ok(typeof accessToken === 'string' && /^[A-Za-z0-9._~+/=-]{20,8192}$/u.test(accessToken), 'Invalid test OAuth token')
  assert.ok(boundedText(orientationGoalId, 320) && boundedText(orientationPathId, 320), 'Missing orientation fixture identity')
  assert.ok(Array.isArray(priorConversation) && priorConversation.length > 0 && priorConversation.length <= 12
    && priorConversation.every(message => object(message) && ['user', 'assistant'].includes(message.role)
      && boundedText(message.content, 4_000)), 'Invalid prior orientation conversation')
  assert.ok(boundedText(learnerMessage, 4_000), 'Missing learner reply')
}

function publicJson(value, fixture, alias, apiKey = '') {
  let text = JSON.stringify(value).replaceAll(fixture.learningSessionId, alias).replaceAll(fixture.accessToken, '[REDACTED]')
  if (apiKey) text = text.replaceAll(apiKey, '[REDACTED]')
  return text.replace(sessionPattern, token => token === alias ? token : '[REDACTED]')
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/gu, '[REDACTED]')
}

function loopbackMcp(fixture) {
  // A source-provided URL could send test tokens outside the isolated JVM.
  const url = `http://127.0.0.1:${fixture.port}/internal/openai/v1/mcp`
  let id = 0
  return async (method, params) => {
    const requestId = ++id
    const response = await fetch(url, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
      headers: {
        'content-type': 'application/json', accept: 'application/json, text/event-stream',
        authorization: `Bearer ${fixture.accessToken}`, 'MCP-Protocol-Version': protocol,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }),
    })
    assert.ok(response.ok, `Loopback MCP HTTP ${response.status}`)
    const reply = parseJson(await boundedBody(response.body, 1_048_576), 'loopback MCP')
    assert.ok(reply?.jsonrpc === '2.0' && reply.id === requestId && !reply.error && object(reply.result),
      'Loopback MCP did not return a matching successful JSON-RPC response')
    return reply.result
  }
}

function rehearsalClient(alias, pathId) {
  return { async respond(payload, phase) {
    let args = { learningSessionId: alias }
    const name = phase === 'context' ? getContext : setMastery
    if (phase === 'mastery') {
      const context = parseJson(payload.input.at(-1).output, 'rehearsal context').structuredContent
      const path = context.orientationOutlook.paths.find(option => option.pathId === pathId)
      assert.ok(path, 'Rehearsal path missing from the real context')
      args = { ...args, goalId: context.activeGoal.goalId, orientationPathId: path.pathId,
        expectedStateVersion: context.stateVersion, clientRequestId: randomUUID() }
    }
    return { output: [{ type: 'function_call', name, arguments: JSON.stringify(args), call_id: `rehearsal_${phase}` }] }
  } }
}

export async function runLiveJourneyTurn(fixture, { packaged, contract, config, client, mode, apiKey = '' }) {
  validateFixture(fixture)
  assert.ok(['rehearsed', 'model'].includes(mode), 'Choose exactly one turn mode')
  const alias = `sps_${randomBytes(32).toString('base64url')}`
  assert.ok(alias !== fixture.learningSessionId, 'Test session alias must differ from the real session')
  const mcp = loopbackMcp(fixture)
  const initialized = await mcp('initialize', {
    protocolVersion: protocol, capabilities: {}, clientInfo: { name: 'skillpilot-isolated-journey', version: '1' },
  })
  assert.ok(initialized.serverInfo?.name === OPENAI_PLUGIN.identity && typeof initialized.instructions === 'string'
    && initialized.instructions.trimEnd() === contract.serverInstructions.trimEnd(),
    'Loopback MCP identity or instructions differ from the submission candidate')
  const listed = await mcp('tools/list', {})
  assert.ok(Array.isArray(listed.tools) && !listed.nextCursor, 'Loopback MCP did not advertise a complete tool list')
  const tools = modelTools(listed.tools)
  const sortTools = catalog => [...catalog].sort((a, b) => a.name.localeCompare(b.name))
  assert.ok(isDeepStrictEqual(sortTools(tools), sortTools(modelTools(contract.tools))),
    'Loopback model-visible tools differ from the submission candidate')
  assert.ok([getContext, setMastery].every(name => tools.some(tool => tool.name === name)), 'Missing orientation journey tools')

  // This is ordinary conversation context. The expected goal, path, and call
  // order remain local checks, and never become actor instructions.
  const input = [{ role: 'user', content: `Ich möchte mit SkillPilot Coach meine vorbereitete Lernsitzung fortsetzen.\nlearningSessionId: ${alias}` },
    ...fixture.priorConversation.map(({ role, content }) => ({ role, content })), { role: 'user', content: fixture.learnerMessage }]
  const instructions = `${packaged.instructions.skill}\n\n${packaged.instructions.policy}\n\n${initialized.instructions}`
  const actor = client ?? (mode === 'rehearsed' ? rehearsalClient(alias, fixture.orientationPathId) : new ResponsesClient({ apiKey, config }))
  const nextCall = async (phase, expected) => {
    const payload = { model: config.model, instructions, tools, input, tool_choice: 'auto', parallel_tool_calls: false,
      reasoning: { effort: config.reasoningEffort }, include: ['reasoning.encrypted_content'] }
    const publicPayload = parseJson(publicJson(payload, fixture, alias, apiKey), 'sanitized test prompt')
    const requestBody = { ...publicPayload, store: false, max_output_tokens: config.maxOutputTokens, service_tier: 'default' }
    assert.ok(Buffer.byteLength(JSON.stringify(requestBody)) <= config.maxRequestBytes, 'Orientation model request exceeds its byte limit')
    const response = await actor.respond(publicPayload, phase)
    assert.ok(Array.isArray(response?.output), 'Actor returned no tool decision')
    const actions = response.output.filter(item => item?.type === 'function_call')
    const validOutput = response.output.every(item => item?.type === 'function_call' || item?.type === 'reasoning'
      || (item?.type === 'message' && item.role === 'assistant' && Array.isArray(item.content)
        && item.content.length > 0 && item.content.every(part => part?.type === 'output_text' && typeof part.text === 'string')))
    assert.ok(validOutput && actions.length === 1 && actions[0].name === expected,
      `Expected a single model-selected ${expected} call`)
    const call = actions[0]
    assert.ok(boundedText(call.call_id, 256) && boundedText(call.arguments, 4_096), 'Invalid tool call framing')
    const args = parseJson(call.arguments, 'actor tool arguments')
    const properties = tools.find(tool => tool.name === expected).parameters.properties
    assert.ok(object(args) && args.learningSessionId === alias && Object.keys(args).every(key => Object.hasOwn(properties, key)),
      'Model used an invalid learning-session alias or unsupported tool argument')
    input.push(...response.output)
    return { callId: call.call_id, args }
  }

  const first = await nextCall('context', getContext)
  assert.ok(Object.keys(first.args).length === 1, 'Orientation needs the full first context')
  const initial = await mcp('tools/call', { name: getContext, arguments: { learningSessionId: fixture.learningSessionId } })
  const state = initial.structuredContent
  assert.ok((initial.isError == null || initial.isError === false) && state?.interactionMode === 'orientation' && state.activeGoal?.goalId === fixture.orientationGoalId
    && Number.isSafeInteger(state.stateVersion) && state.stateVersion >= 0
    && state.orientationOutlook?.paths?.some(path => path.pathId === fixture.orientationPathId),
  'Real context did not offer the expected active orientation and path')
  input.push({ type: 'function_call_output', call_id: first.callId, output: publicJson(modelResult(initial), fixture, alias, apiKey) })

  const second = await nextCall('mastery', setMastery)
  const write = second.args
  assert.ok(second.callId !== first.callId && Object.keys(write).length === 5
    && write.goalId === fixture.orientationGoalId && write.orientationPathId === fixture.orientationPathId
    && write.expectedStateVersion === state.stateVersion && typeof write.clientRequestId === 'string'
    && requestIdPattern.test(write.clientRequestId), 'Model did not copy the confirmed orientation, path, and state version')
  const persisted = await mcp('tools/call', { name: setMastery, arguments: { ...write, learningSessionId: fixture.learningSessionId } })
  const saved = persisted.structuredContent
  assert.ok((persisted.isError == null || persisted.isError === false) && saved?.status === 'updated' && saved.savedGoalId === fixture.orientationGoalId
    && saved.savedMastery === 1 && saved.stateVersion === state.stateVersion + 1 && object(saved.context),
  'Loopback MCP did not confirm one persisted orientation update with a successor context')
  const result = parseJson(publicJson(modelResult(persisted), fixture, '[REDACTED]', apiKey), 'sanitized persistence result')
  return { status: 'passed', mode, modelRequests: mode === 'model' ? 2 : 0, actorDecisions: 2,
    toolCalls: 2, contextCalls: 1, masteryCalls: 1, result }
}

async function main() {
  const { values } = parseArgs({ options: { zip: { type: 'string', multiple: true }, model: { type: 'boolean' }, rehearse: { type: 'boolean' } } })
  assert.ok(values.zip?.length === 1 && values.zip[0].trim() && Boolean(values.model) !== Boolean(values.rehearse),
    'Usage: node scripts/openai_live_journey_turn.mjs --zip PATH (--rehearse|--model)')
  const mode = values.model ? 'model' : 'rehearsed'
  const apiKey = values.model ? process.env.OPENAI_EVAL_API_KEY : ''
  if (values.model) {
    assert.ok(!process.env.CI, 'The opt-in model turn runs locally')
    assert.ok(apiKey?.trim(), 'Missing dedicated OPENAI_EVAL_API_KEY for the opt-in model turn')
  }
  const config = JSON.parse(readFileSync(resolve(root, 'scripts/config/openai-dialog-eval.json'), 'utf8'))
  Object.assign(config, { maxRequests: 2, maxRequestsPerTurn: 2, maxOutputTokens: 2_048,
    maxRequestBytes: 180_000, requestTimeoutMs: 30_000, maxEstimatedUsd: 2 })
  validateConfig(config, new Date(), { requireCurrentPricing: values.model === true })
  const fixture = parseJson(await boundedBody(process.stdin, 128 * 1024), 'test stdin')
  const packaged = bindDialogSubmissionPackage(values.zip[0])
  const contract = JSON.parse(readFileSync(resolve(root, packaged.report.sourceBindings.contractPath), 'utf8'))
  assert.ok(digest(contract) === packaged.report.sourceBindings.contractSha256, 'Submission snapshot changed after verification')
  const result = await runLiveJourneyTurn(fixture, { packaged, contract, config, mode, apiKey })
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => {
  // No backend bodies, malformed model arguments, or client exceptions on stdout/stderr.
  console.error(error.code === 'ERR_ASSERTION' ? error.message : 'Isolated journey transport or setup failed')
  process.exitCode = 1
})
