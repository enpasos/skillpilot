import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { childEnvironment, modelResult, modelTools, ResponsesClient, runDialogCase, sanitizeReport, summarizeRun, validateConfig } from './openai_dialog_eval.mjs'

const config = () => JSON.parse(readFileSync(new URL('./config/openai-dialog-eval.json', import.meta.url)))
const response = (data, status = 200) => ({ ok: status === 200, status, headers: new Map([['x-request-id', 'req_fixture']]), json: async () => data })
const complete = overrides => ({ id: 'resp_fixture', model: config().model, status: 'completed', usage: { input_tokens: 20, output_tokens: 10 }, output: [{ type: 'message', content: [{ type: 'output_text', text: 'Hello' }] }], ...overrides })
const payload = () => ({ model: config().model, input: [{ role: 'user', content: 'Hello' }] })

test('build, Git and verification children never inherit API or production credentials', () => {
  assert.deepEqual(childEnvironment({ PATH: '/usr/bin', JAVA_HOME: '/jdk', OPENAI_EVAL_API_KEY: 'secret', DATABASE_URL: 'credentials', JAVA_TOOL_OPTIONS: 'untrusted' }), { PATH: '/usr/bin', JAVA_HOME: '/jdk' })
})

test('the success path executes a separate complete judge without manufacturing host acceptance', async () => {
  const suite = JSON.parse(readFileSync(new URL('../ai/openai plugin/skillpilot-coach-v1/submission/review-cases.json', import.meta.url)))
  const testCase = suite.cases.find(entry => entry.id === 'P1')
  const bridge = { async request(request) {
    if (request.action === 'reset') return { caseId: 'P1', evidenceLayer: 'model-api-with-simulated-domain', tools: [], serverInstructions: 'Server policy' }
    assert.equal(request.action, 'snapshot')
    return { state: { confirmedWriteCount: 0 } }
  } }
  const requests = []
  const client = { async respond(request) {
    requests.push(request)
    const text = requests.length === 1 ? testCase.assertions.find(a => a.kind === 'visible-exact').value : JSON.stringify({ caseId: 'P1', evaluations: [{ assertionId: 'no-state-change', status: 'pass', explanation: 'Fixture-only unit test: no calls observed.', evidenceTurnIds: ['start'] }] })
    return complete({ output: [{ type: 'message', content: [{ type: 'output_text', text }] }] })
  } }
  const result = await runDialogCase({ testCase, bridge, client, instructions: { server: 'Server policy', skill: 'Skill policy', policy: 'Coaching policy' }, config: config(), expectedTools: [] })
  assert.equal(requests.length, 2)
  assert.equal(requests[1].text.format.type, 'json_schema')
  assert.equal(result.status, 'passed')
  assert.equal(result.hostAcceptance, 'not_tested')
  assert.equal(result.semantic.evaluator, 'llm-judge')
  assert.equal(result.manualReviews, undefined)
})

test('missing API key and expired/unbounded configuration fail closed', () => {
  assert.throws(() => new ResponsesClient({ config: config(), apiKey: '' }), /missing/u)
  assert.throws(() => validateConfig(config(), new Date('2027-01-01')), /expired/u)
  for (const changes of [{ maxEstimatedUsd: 0 }, { maxRequests: 0 }, { maxOutputTokens: 9000 }, { repetitions: 0 }, { model: 'unpriced-model' }]) {
    assert.throws(() => validateConfig({ ...config(), ...changes }))
  }
})

test('Responses requests use fixed origin, no storage, no redirect, bounded output and explicit usage', async () => {
  let seen
  const client = new ResponsesClient({ apiKey: 'test-only-key', config: config(), fetchImpl: async (url, request) => { seen = { url, request }; return response(complete()) } })
  await client.respond(payload(), 'test')
  assert.equal(seen.url, 'https://api.openai.com/v1/responses')
  assert.equal(seen.request.redirect, 'error')
  const body = JSON.parse(seen.request.body)
  assert.equal(body.store, false)
  assert.equal(body.max_output_tokens, 4096)
  assert.equal(body.service_tier, 'default')
  assert.equal(client.usage.requests, 1)
  assert.equal(client.usage.requestsWithUncertainUsage, 0)
  assert.equal(client.usage.inputTokens, 20)
  assert.equal(client.requests[0].requestId, 'req_fixture')
  assert.ok(Math.abs(client.usage.estimatedUsd - 0.0003) < 1e-12)
})

test('cost reservation blocks before network, including a single oversized-cost request', async () => {
  let called = false
  const client = new ResponsesClient({ apiKey: 'fixture', config: { ...config(), maxEstimatedUsd: 0.001 }, fetchImpl: async () => { called = true } })
  await assert.rejects(client.respond(payload(), 'test'), /reservation/u)
  assert.equal(called, false)
  assert.equal(client.usage.requests, 0)
})

test('timeouts, HTTP errors and incomplete/invalid usage halt with no hidden retries', async () => {
  for (const fake of [
    async () => { throw new Error('timeout') },
    async () => response({ error: 'DO NOT PRINT PRIVATE BODY' }, 401),
    async () => response(complete({ status: 'incomplete' })),
    async () => response(complete({ usage: undefined })),
    async () => response(complete({ usage: { input_tokens: 1e9, output_tokens: 10 } })),
  ]) {
    let calls = 0
    const client = new ResponsesClient({ apiKey: 'fixture', config: config(), fetchImpl: async () => { calls++; return fake() } })
    await assert.rejects(client.respond(payload(), 'test'))
    await assert.rejects(client.respond(payload(), 'test2'), /halted/u)
    assert.equal(calls, 1)
    assert.ok(!JSON.stringify(client.requests).includes('PRIVATE BODY'))
  }
})

test('request and byte ceilings cannot be bypassed', async () => {
  const client = new ResponsesClient({ apiKey: 'fixture', config: { ...config(), maxRequests: 1 }, fetchImpl: async () => response(complete()) })
  await client.respond(payload(), 'first')
  await assert.rejects(client.respond(payload(), 'second'), /request limit/u)
  const other = new ResponsesClient({ apiKey: 'fixture', config: config(), fetchImpl: async () => { assert.fail('must not send oversized request') } })
  await assert.rejects(other.respond({ ...payload(), instructions: 'x'.repeat(200001) }, 'large'), /size limit/u)
})

test('full model tool contract preserves optional schemas and excludes app-only functions', () => {
  const tool = { name: 'get_skillpilot_context', description: 'Context', inputSchema: { type: 'object', properties: { optional: { type: 'string' } } } }
  const tools = modelTools([tool, { ...tool, name: 'review_skillpilot_memory_practice_card' }, { ...tool, name: 'private_future_tool', meta: { ui: { visibility: ['app'] } } }])
  assert.equal(tools.length, 1)
  assert.deepEqual(tools[0].parameters, tool.inputSchema)
  assert.equal(tools[0].strict, false)
})

test('component metadata and private card answers never enter model result or evidence artifact', () => {
  const raw = { content: [], structuredContent: { status: 'ready' }, isError: false, _meta: { front: 'PRIVATE_CARD_FRONT', back: 'PRIVATE_CARD_BACK' }, debug: 'PRIVATE_DEBUG' }
  assert.deepEqual(modelResult(raw), { content: [], structuredContent: { status: 'ready' }, isError: false })
  assert.ok(!JSON.stringify(sanitizeReport(raw)).includes('PRIVATE_CARD'))
  const scrubbed = sanitizeReport({ text: 'actual-key sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA eyJabc.def.ghi', apiKey: 'actual-key', encrypted_content: 'secret_reasoning' }, 'actual-key')
  assert.ok(!JSON.stringify(scrubbed).includes('actual-key'))
  assert.ok(!JSON.stringify(scrubbed).includes('eyJabc'))
  assert.ok(!JSON.stringify(scrubbed).includes('secret_reasoning'))
})

test('missing, duplicated, failed or error repetitions cannot yield all-pass', () => {
  const cases = [{ id: 'P1', repetition: 1, status: 'passed' }, { id: 'N1', repetition: 1, status: 'passed' }]
  assert.equal(summarizeRun(cases, ['P1', 'N1'], 1).status, 'passed')
  assert.equal(summarizeRun(cases, ['P1', 'N1'], 2).status, 'failed')
  assert.equal(summarizeRun([...cases, cases[0]], ['P1', 'N1'], 1).status, 'failed')
  assert.equal(summarizeRun(cases.slice(1), ['P1', 'N1'], 1).status, 'failed')
  for (const status of ['failed', 'error', 'pending']) assert.equal(summarizeRun([{ ...cases[0], status }, cases[1]], ['P1', 'N1'], 1).status, 'failed')
})

test('actor chooses calls without receiving the hidden oracle; forbidden attempts are retained and never dispatched', async () => {
  const suite = JSON.parse(readFileSync(new URL('../ai/openai plugin/skillpilot-coach-v1/submission/review-cases.json', import.meta.url)))
  const testCase = structuredClone(suite.cases.find(entry => entry.id === 'P1'))
  testCase.portalSummary = 'HIDDEN_ORACLE_SENTINEL'
  let dispatched = false
  const tool = { name: 'get_skillpilot_context', description: 'Context', inputSchema: { type: 'object' } }
  const bridge = { async request(request) {
    if (request.action === 'reset') return { caseId: 'P1', evidenceLayer: 'model-api-with-simulated-domain', tools: [tool], serverInstructions: 'Server policy' }
    if (request.action === 'snapshot') return { state: {} }
    dispatched = true
    assert.fail('forbidden call reached fixture')
  } }
  const client = { async respond(request) {
    assert.ok(!JSON.stringify(request).includes('HIDDEN_ORACLE_SENTINEL'))
    assert.equal(request.tool_choice, 'auto')
    assert.equal(request.tools.length, 1)
    return complete({ output: [{ type: 'function_call', name: tool.name, arguments: '{}', call_id: 'call_fixture' }] })
  } }
  const result = await runDialogCase({ testCase, bridge, client, instructions: { server: 'Server policy', skill: 'Skill policy', policy: 'Coaching policy' }, config: config(), expectedTools: [tool] })
  assert.equal(result.status, 'error')
  assert.equal(dispatched, false)
  assert.equal(result.events.find(event => event.type === 'tool').blocked, true)
  assert.equal(result.hostAcceptance, 'not_tested')
})
