import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { test } from 'node:test'
import { runCodexJourneyTurn } from './openai_codex_journey_actor.mjs'

const phases = [
  ['context', 'get_skillpilot_context'],
  ['confirm', 'confirm_skillpilot_completion_contract'],
  ['refresh', 'get_skillpilot_context'],
  ['mastery', 'set_skillpilot_mastery'],
]
const tools = [...new Set(phases.map(([, name]) => name)), 'render_skillpilot_goal_visualization']
  .map(name => ({ name, description: `Test tool ${name}`, parameters: { type: 'object' } }))
const fixture = { accessToken: 'private-test-token', learningSessionId: 'private-test-session' }
const packageInstructions = 'Instructions from the verified ZIP'

const fakeCli = String.raw`
  import assert from 'node:assert/strict'
  const [endpoint, scenario, ...sequence] = process.argv.slice(1)
  const emit = event => process.stdout.write(JSON.stringify(event) + '\n')
  let requestId = 0
  const post = async (method, params, options = {}) => {
    const response = await fetch(options.url ?? endpoint, { method: 'POST', redirect: 'error',
      headers: { 'content-type': 'application/json', ...options.headers },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }) })
    if (options.reject) {
      assert.equal(response.status, 404)
      assert.equal(response.headers.get('location'), null)
      return
    }
    assert.equal(response.status, 200)
    return await response.json()
  }
  let prompt = ''
  for await (const chunk of process.stdin) prompt += chunk
  assert.match(prompt, /Public learner prompt/)
  assert.doesNotMatch(prompt, /private-test/)
  if (scenario === 'shell') {
    emit({ type: 'item.started', item: { type: 'command_execution' } })
    process.exit(0)
  }
  await post('initialize', { protocolVersion: '2025-11-25' })
  const inventory = (await post('tools/list', {})).result.tools
  assert.deepEqual(inventory.map(tool => tool.name), ['get_skillpilot_context',
    'confirm_skillpilot_completion_contract', 'set_skillpilot_mastery', 'render_skillpilot_goal_visualization'])
  assert.ok(inventory.every(tool => tool.inputSchema.type === 'object'))
  if (scenario === 'third-party') {
    await post('tools/call', {}, { reject: true, headers: { origin: 'https://third-party.invalid' } })
    await post('tools/call', {}, { reject: true, url: endpoint + '?redirect=https://third-party.invalid' })
  }
  if (scenario === 'early-exit') process.exit(0)
  const toolCall = async name => await post('tools/call', { name, arguments: { fixtureAlias: 'public-value' } })
  if (scenario === 'wrong-call') {
    await toolCall('render_skillpilot_goal_visualization')
    process.exit(0)
  }
  for (const [index, name] of sequence.entries()) {
    const answer = await toolCall(name)
    assert.equal(answer.result.structuredContent.index, index)
    emit({ type: 'item.completed', item: { type: 'mcp_tool_call', server: 'skillpilot-coach',
      tool: name, status: index === 0 && scenario === 'bad-transcript' ? 'failed' : 'completed' } })
  }
  if (scenario === 'extra-call') {
    await toolCall('set_skillpilot_mastery')
    process.exit(0)
  }
  const replies = {
    'no-pause': 'Ich habe deine Auswahl gespeichert.',
    'not-saved': 'Deine Auswahl wurde nicht gespeichert. Wir pausieren hier.',
    'unable-to-save': 'Wir pausieren hier. Ich konnte die Orientierung abschließen, aber deine Wahl nicht speichern.',
    'no-pause-admitted': 'Deine Wahl ist gespeichert. Wir machen jetzt keine Pause.',
    'pause-denied': 'Deine Wahl ist gespeichert. Wir pausieren vorerst nicht.',
    'no-usage': 'Die Orientierung ist abgeschlossen und deine Wahl ist gespeichert. Wir machen eine Pause.',
  }
  emit({ type: 'item.completed', item: { type: 'agent_message', text: replies[scenario]
    ?? 'Ich habe deine Auswahl gespeichert. Wir pausieren hier.' } })
  emit({ type: 'turn.completed', usage: scenario === 'no-usage' ? undefined
    : { input_tokens: 12, cached_input_tokens: 2, output_tokens: 8, other: 'ignore' } })
`

function fakeJourney(scenario, { phasesUnderTest = phases, environment = { PATH: '/usr/bin', OPENAI_EVAL_API_KEY: 'must-not-leak' } } = {}) {
  const decisions = []
  let scratch
  function checkLogin(executable, args, options) {
    assert.equal(executable, 'codex')
    assert.deepEqual(args, ['login', 'status'])
    assert.deepEqual(options.env, { PATH: '/usr/bin' })
    scratch = options.cwd
    return { status: 0, stdout: '', stderr: 'Logged in using ChatGPT' }
  }
  function spawnProcess(executable, args, options) {
    assert.equal(executable, 'codex')
    assert.equal(options.cwd, scratch)
    assert.deepEqual(options.env, { PATH: '/usr/bin' })
    for (const setting of ['--ignore-user-config', '--ignore-rules', '--ephemeral', 'read-only',
      'web_search="disabled"', 'shell_tool', 'apps', 'plugins', 'browser_use']) assert.ok(args.includes(setting), setting)
    assert.equal(args.find(arg => arg.startsWith('developer_instructions=')), `developer_instructions=${JSON.stringify(packageInstructions)}`)
    const endpoint = JSON.parse(args.find(arg => arg.startsWith('mcp_servers.skillpilot-coach.url=')).split('=')[1])
    assert.match(endpoint, /^http:\/\/127\.0\.0\.1:\d+\/[\da-f-]+$/u)
    return spawn(process.execPath, ['--input-type=module', '-e', fakeCli, endpoint, scenario, ...phasesUnderTest.map(([, name]) => name)], options)
  }
  async function runTurn(receivedFixture, { client, mode }) {
    assert.equal(receivedFixture, fixture)
    assert.equal(mode, 'model')
    const input = [{ role: 'user', content: 'Public learner prompt' }]
    let result
    for (const [index, [phase, name]] of phasesUnderTest.entries()) {
      if (result) input.push({ type: 'function_call_output', output: JSON.stringify(result) })
      const decision = await client.respond({ tools, input, instructions: packageInstructions }, phase)
      assert.equal(decision.output.length, 1)
      const call = decision.output[0]
      assert.equal(call.type, 'function_call')
      assert.equal(call.name, name)
      assert.deepEqual(JSON.parse(call.arguments), { fixtureAlias: 'public-value' })
      decisions.push(name)
      result = { structuredContent: { index } }
    }
    return { status: 'passed', actorDecisions: decisions.length, result }
  }
  return { decisions, scratch: () => scratch,
    run: () => runCodexJourneyTurn(fixture, {}, { environment, checkLogin, spawnProcess, runTurn }) }
}

test('uses the complete tool inventory and acknowledges the saved orientation and pause', async () => {
  const journey = fakeJourney('third-party')
  const receipt = await journey.run()
  assert.deepEqual(journey.decisions, phases.map(([, name]) => name))
  assert.deepEqual(receipt, { status: 'passed', mode: 'codex', modelRequests: null, actorDecisions: 4,
    result: { structuredContent: { index: 3 } }, pauseAcknowledged: true, saveAcknowledged: true,
    usage: { input_tokens: 12, cached_input_tokens: 2, output_tokens: 8 } })
  await assert.rejects(access(journey.scratch()), { code: 'ENOENT' })
})

test('rejects other calls and actions before they can reach the live learner driver', async () => {
  for (const [scenario, message] of [['wrong-call', /unexpected MCP tool call/],
    ['shell', /action outside the isolated MCP tools/], ['early-exit', /ended before the context decision/]]) {
    const journey = fakeJourney(scenario)
    await assert.rejects(journey.run(), message)
    assert.deepEqual(journey.decisions, [])
  }
})

test('rejects extra calls, failed transcripts and a missing final pause acknowledgement', async () => {
  for (const [scenario, message, decisionCount] of [['extra-call', /unexpected MCP tool call/, 4],
    ['bad-transcript', /did not acknowledge precisely/, 1], ['no-pause', /did not acknowledge the saved orientation and pause/, 4]]) {
    const journey = fakeJourney(scenario)
    await assert.rejects(journey.run(), message)
    assert.deepEqual(journey.decisions, phases.slice(0, decisionCount).map(([, name]) => name))
  }
})

test('permits the two-decision turn when the completion contract is already acknowledged', async () => {
  const journey = fakeJourney('no-usage', { phasesUnderTest: [phases[0], phases[3]] })
  const receipt = await journey.run()
  assert.equal(receipt.actorDecisions, 2)
  assert.equal(receipt.modelRequests, null)
  assert.equal(receipt.usage, undefined)
})

test('rejects final messages that explicitly deny the save or pause', async () => {
  for (const scenario of ['not-saved', 'unable-to-save', 'no-pause-admitted', 'pause-denied']) {
    const journey = fakeJourney(scenario)
    await assert.rejects(journey.run(), /did not acknowledge the saved orientation and pause/, scenario)
  }
})

test('requires a local run and a ChatGPT login', async () => {
  const journey = fakeJourney('unused', { environment: { CI: 'true' } })
  await assert.rejects(journey.run(), /runs locally/)
  assert.equal(journey.scratch(), undefined)
  await assert.rejects(runCodexJourneyTurn(fixture, {}, {
    environment: {}, checkLogin: () => ({ status: 0, stdout: 'Logged in using an API key' }),
    spawnProcess: () => assert.fail('Must not start the actor without a ChatGPT login'),
  }), /requires an active ChatGPT login/)
})
