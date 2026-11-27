import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  FirstPartyClient, advance, agentRunning, checkedWebSources, createRun, decodeJsonFile, exchangeFiles, fabricatePermanentId, finalize,
  identifyToolCall, observationEvents, parseRunArguments, resolveToolName, technicalRequest, toolsFittingRequest, validateObservation, validateWebConfig, waitForAgent,
} from './claude_coach_web_e2e.mjs'

const sources = checkedWebSources()
const GOALS = ['goal-orientation', 'goal-first', 'goal-second']

function fakeBackend() {
  const learners = new Map()
  let counter = 0
  return {
    learners, log: [],
    async createLearner() { const id = `Lrn${String(++counter).padStart(2, '0')}abcdEFGH5678`; learners.set(id, { mastered: [], active: 0 }); this.log.push(`create ${id}`); return id },
    async deleteLearner(id) { assert.ok(learners.delete(id), 'unknown learner'); this.log.push(`delete ${id}`) },
    async launch() { const id = `spc_${'s'.repeat(24)}${counter}`; return { learningSessionId: id, prompt: `Nutze den SkillPilot-Coach-Skill.\nlearningSessionId: ${id}`, webUrl: 'https://claude.ai/new' } },
    async snapshot(id) { const learner = learners.get(id); return { activeGoalId: GOALS[learner.active], activeGoalTitle: 'Titel', learningState: null, requiredAction: 'teachActiveGoal', mastered: [...learner.mastered].sort() } },
    complete() { const learner = [...learners.values()].at(-1); learner.mastered.push(GOALS[learner.active]); learner.active += 1; return learner.mastered.at(-1) },
  }
}

function harness(scenarioIds, { selection = 'partial' } = {}) {
  const backend = fakeBackend()
  const state = createRun({ runId: 'unit-test-run', scenarioIds, selection, bindings: {} })
  let said = 0
  const deps = { ...sources, backend, say: async () => `Antwort der lernenden Person ${++said}`, save: () => {} }
  return { state, deps, backend }
}

const preflightOk = { preflight: { signedIn: true, connectorConnected: true, pluginListed: null, notes: '' } }
const turn = (overrides = {}) => ({ assistantText: 'Antwort des Coaches.', skillBlocks: [], toolCalls: [], permissionPrompts: [], hostRefusals: [], anomalies: [], ...overrides })
const firstTurn = (overrides = {}) => turn({ model: { label: 'Claude Opus 5.5', effort: 'Mittel' }, ...overrides })
const call = (name, request, fields = {}, extra = {}) => ({ connector: 'SkillPilot', label: name.replaceAll('_', ' '), name, request, responseFields: { status: 'OK', ...fields }, responsePreview: '{"status":"OK"}', isError: false, ...extra })
const sessionOf = action => /spc_[A-Za-z0-9_-]+/u.exec(action.message)[0]

/** Plays the browser agent: `observe` returns the observation for each action. */
async function play({ state, deps }, observe) {
  let action = await advance(state, undefined, deps)
  for (let guard = 0; action.action !== 'done'; guard++) {
    assert.ok(guard < 40, 'The run does not end')
    action = await advance(state, await observe(action), deps)
  }
  return finalize(state, deps)
}

test('the repository sources are valid and bind the run', () => {
  assert.equal(sources.config.agent.effort, 'xhigh')
  assert.equal(sources.config.coach.effortLabel, 'medium')
  assert.ok(sources.toolCatalog.includes('set_skillpilot_mastery') && !sources.toolCatalog.includes('review_skillpilot_memory_practice_card'))
  assert.throws(() => validateWebConfig({ ...sources.config, origin: 'http://skillpilot.com' }), /https origin/u)
  assert.throws(() => validateWebConfig({ ...sources.config, coach: { ...sources.config.coach, effortPattern: '^high$' } }), /rejects coach\.effortLabel/u)
  assert.throws(() => validateWebConfig({ ...sources.config, agent: { ...sources.config.agent, effort: 'extreme' } }), /agent\.effort/u)
})

test('a complete learning journey passes on backend state and leaves no learner behind', async () => {
  const run = harness(['first-session-journey'])
  let session
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    if (action.action === 'new-chat') {
      assert.deepEqual(action.model, { name: 'Opus 5.5', effort: 'medium' })
      session = sessionOf(action)
      return firstTurn({ skillBlocks: ['skillpilot-coach-v1'], toolCalls: [call('get_skillpilot_coach_context', { learningSessionId: session })] })
    }
    assert.match(action.message, /^Antwort der lernenden Person/u)
    const goalId = run.backend.complete()
    return turn({ toolCalls: [call('set_skillpilot_mastery', { learningSessionId: session, goalId, mastery: 1 }, { savedGoalId: goalId, savedMastery: 1 })] })
  })
  assert.deepEqual(report.cases[0].deterministic.failures, [])
  assert.equal(report.status, 'passed_partial_selection')
  assert.equal(run.backend.learners.size, 0)
  assert.equal(report.learnersLeft, 0)
  const text = JSON.stringify(report)
  assert.ok(!text.includes(session) && !/Lrn\d\dabcd/u.test(text), 'The report must not carry a session or a permanent ID')
  assert.ok(text.includes('[learning-session]'))
})

test('a connector call without the unchanged learning session fails', async () => {
  const run = harness(['pause-after-start'])
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    if (action.action === 'new-chat') return firstTurn({ skillBlocks: ['SkillPilot Coach'], toolCalls: [call('get_skillpilot_coach_context', { learningSessionId: `${sessionOf(action)}x` })] })
    return turn()
  })
  assert.deepEqual(report.cases[0].deterministic.failures, ['session-passed-unchanged'])
  assert.equal(report.status, 'failed')
})

test('another model, a refusal by the web interface or an unread request fails', async () => {
  const run = harness(['pause-after-start'])
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    if (action.action === 'new-chat') return firstTurn({ model: { label: 'Claude Sonnet 5.5', effort: 'Hoch' }, skillBlocks: ['skillpilot-coach-v1'], hostRefusals: ['Nicht ausgeführt'], toolCalls: [call('get_skillpilot_coach_context', null)] })
    return turn()
  })
  const failures = report.cases[0].deterministic.failures
  for (const id of ['web-model-selected', 'web-no-host-refusal', 'web-tool-evidence-complete', 'session-passed-unchanged']) assert.ok(failures.includes(id), `${id} must fail`)
})

test('an unusable observation changes nothing and is handed back with its problems', async () => {
  const { state, deps } = harness(['pause-after-start'])
  await advance(state, undefined, deps)
  const action = await advance(state, preflightOk, deps)
  const before = JSON.stringify(state)
  const again = await advance(state, { assistantText: '' }, deps)
  assert.equal(again.n, action.n)
  assert.ok(again.problems.length >= 3)
  assert.equal(JSON.stringify(state), before)
  assert.deepEqual(await advance(state, undefined, deps), action, 'A lost action is handed out again')
  assert.deepEqual(validateObservation('send', turn({ toolCalls: [{ label: 'x' }] })).length, 6)
  assert.deepEqual(validateObservation('preflight', { preflight: { signedIn: 'yes' } }), ['preflight.signedIn must be true or false.'])
  assert.deepEqual(validateObservation('send', { blocked: 'Usage limit reached' }), [])
})

test('an unknown session passes only with the displayed backend error', async () => {
  const observe = fields => async action => {
    if (action.action === 'preflight') return preflightOk
    assert.match(action.message, /learningSessionId: spc_/u)
    return firstTurn({
      assistantText: 'Bitte öffne skillpilot.com und wähle dort erneut „Lernen starten“.',
      toolCalls: [call('get_skillpilot_coach_context', { learningSessionId: sessionOf(action) }, {}, fields)],
    })
  }
  const refused = harness(['unknown-session'])
  const report = await play(refused, observe({ responseFields: null, responsePreview: '{"status":"ERROR","errorCode":"LEARNING_SESSION_REQUIRED"}', isError: true }))
  assert.deepEqual(report.cases[0].deterministic.failures, [])
  assert.deepEqual(refused.backend.log, [], 'No learner is created when the chat can reach none')
  const accepted = await play(harness(['unknown-session']), observe({}))
  assert.deepEqual(accepted.cases[0].deterministic.failures, ['error-observed:LEARNING_SESSION_REQUIRED'])
})

test('the offered permanent ID is a look-alike of a learner that no longer exists', async () => {
  const run = harness(['permanent-id-offered'])
  let offered
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    offered = /SkillPilot-ID: (\S+)\./u.exec(action.message)[1]
    assert.equal(run.backend.learners.size, 0, 'The sample learner is deleted before anything is typed')
    return firstTurn({ assistantText: 'Dafür brauche ich eine Lernsitzung: Wähle auf skillpilot.com „Lernen starten“.' })
  })
  const created = run.backend.log[0].split(' ')[1]
  assert.deepEqual(run.backend.log, [`create ${created}`, `delete ${created}`])
  assert.ok(offered !== created && offered.length === created.length)
  assert.deepEqual(report.cases[0].deterministic.failures, [])
  assert.ok(!JSON.stringify(report).includes(offered))

  const leaking = harness(['permanent-id-offered'])
  const leaked = await play(leaking, action => (action.action === 'preflight' ? preflightOk : firstTurn({ assistantText: `Mit ${/SkillPilot-ID: (\S+)\./u.exec(action.message)[1]} geht das nicht; wähle „Lernen starten“.` })))
  assert.deepEqual(leaked.cases[0].deterministic.failures, ['privacy-permanent-id-not-in-prose'])
})

test('a blocked browser ends the run as an error and removes the learner', async () => {
  const signedOut = harness(['pause-after-start'])
  const first = await play(signedOut, () => ({ preflight: { signedIn: false, connectorConnected: null, pluginListed: null } }))
  assert.equal(first.status, 'error')
  assert.match(first.error, /not signed in/u)
  assert.deepEqual(signedOut.backend.log, [])

  const limited = harness(['pause-after-start', 'missing-session'], { selection: 'complete' })
  const second = await play(limited, action => (action.action === 'preflight' ? preflightOk : { blocked: 'Usage limit reached' }))
  assert.equal(second.status, 'error')
  assert.deepEqual(second.cases.map(entry => entry.status), ['error', 'error'])
  assert.equal(limited.backend.learners.size, 0)
})

test('a run that stops half way is an error and still removes its learner', async () => {
  const { state, deps, backend } = harness(['pause-after-start'])
  await advance(state, undefined, deps)
  await advance(state, preflightOk, deps)
  assert.equal(backend.learners.size, 1)
  const report = await finalize(state, deps)
  assert.equal(report.status, 'error')
  assert.equal(report.cases[0].error.message, 'The run ended before this scenario finished')
  assert.equal(backend.learners.size, 0)
})

test('tool calls of other connectors are reported, unknown SkillPilot calls fail', () => {
  const events = observationEvents(turn({ toolCalls: [
    { connector: 'Excalidraw', label: 'Create view', name: null, request: {}, responseFields: null, responsePreview: null, isError: null },
    { connector: 'SkillPilot', label: 'Etwas Neues', name: null, request: {}, responseFields: {}, responsePreview: null, isError: false },
    { connector: null, label: 'Get skillpilot coach context', name: null, request: { learningSessionId: 'spc_x' }, responseFields: null, responsePreview: '{"status":"OK"', isError: false },
  ] }), 'start', { catalog: sources.toolCatalog, inputs: sources.toolInputs, candidate: sources.candidate })
  assert.deepEqual(events.filter(event => event.type === 'tool').map(event => [event.source, event.name]), [['foreign', 'Create view'], ['skillpilot', 'unidentified:Etwas Neues'], ['skillpilot', 'get_skillpilot_coach_context']])
  assert.deepEqual(events[1].candidates, [], 'A request without the learning session fits no tool')
  assert.equal(resolveToolName({ name: null, label: 'SkillPilot: Set SkillPilot mastery' }, sources.toolCatalog), 'set_skillpilot_mastery')
  assert.equal(resolveToolName({ name: 'something_else', label: 'Web search' }, sources.toolCatalog), null)
})

// What claude.ai displayed on 27 November 2026: the read call without a tool name and with reworded
// field names, a row that only says the connector was loaded, and a shortened response.
const retrieved = (session, extra = {}) => ({
  connector: 'skillpilot', label: 'Aus skillpilot abgerufen', name: null, request: { Language: 'de', 'Learning session id': session },
  responseTopLevel: ['State version', 'Language', 'Level completion'], responseFields: { 'State version': 7 },
  responsePreview: 'State version: 7\nLanguage: de\nLevel completion:\n  Calculation status: valid', responseTruncated: true, isError: false, ...extra,
})

test('the display of claude.ai without tool names passes, and says what it could not decide', async () => {
  const run = harness(['pause-after-start'])
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    const session = sessionOf({ message: run.state.cases['pause-after-start'].preparedPrompt })
    if (action.action === 'new-chat') return firstTurn({
      skillBlocks: ['Skill geladen skillpilot-coach-v1 (skillpilot-coach-v1)'], connectorLoads: ['skillpilot geladen'],
      toolCalls: [retrieved(session), { connector: 'skillpilot', label: 'skillpilot · render_skillpilot_goal_visualization', name: 'render_skillpilot_goal_visualization', request: { expectedStateVersion: 7, goalId: 'goal-orientation', language: 'de', learningSessionId: session }, responseTopLevel: [], responseFields: {}, responsePreview: 'Freigegebenes Lernzielbild bereitgestellt.', responseTruncated: false, isError: false }],
    })
    return turn({ toolCalls: [retrieved(session)] })
  })
  const [entry] = report.cases
  assert.deepEqual(entry.deterministic.checks.filter(check => !check.passed).map(check => check.id), [])
  assert.equal(report.status, 'passed_partial_selection')
  assert.deepEqual(entry.connectorLoads, ['skillpilot geladen'])
  assert.deepEqual(entry.toolIdentification, { byDisplayedName: 1, byRequestFields: 0, byRequestAndResultFields: 0, notDecided: [
    { label: 'Aus skillpilot abgerufen', fits: ['get_skillpilot_coach_context', 'get_skillpilot_navigation_options', 'start_skillpilot_verified_recall'] },
    { label: 'Aus skillpilot abgerufen', fits: ['get_skillpilot_coach_context', 'get_skillpilot_navigation_options', 'start_skillpilot_verified_recall'] },
  ] })
  assert.match(entry.deterministic.checks.find(check => check.id === 'first-connector-tool').detail, /without a tool name; its request fits get_skillpilot_coach_context, get_skillpilot_navigation_options, start_skillpilot_verified_recall/u)
  assert.ok(!JSON.stringify(report).includes('spc_'), 'The report must not carry a learning session')
})

test('another tool behind the same display fails: the response tells them apart', async () => {
  const run = harness(['pause-after-start'])
  const report = await play(run, action => {
    if (action.action === 'preflight') return preflightOk
    const session = sessionOf({ message: run.state.cases['pause-after-start'].preparedPrompt })
    const navigation = retrieved(session, { responseTopLevel: ['State version', 'Language', 'Navigation options'] })
    return action.action === 'new-chat' ? firstTurn({ skillBlocks: ['Skill geladen skillpilot-coach-v1'], toolCalls: [navigation] }) : turn({ toolCalls: [navigation] })
  })
  const failed = report.cases[0].deterministic.checks.filter(check => !check.passed).map(check => check.id)
  assert.deepEqual(failed, ['first-connector-tool', 'tool-succeeded:get_skillpilot_coach_context'])
  assert.equal(report.cases[0].toolIdentification.byRequestAndResultFields, 2)
})

test('a displayed call is told apart by its name, then its request, then its response', () => {
  const inputs = sources.toolInputs
  const identify = call => identifyToolCall({ name: null, label: 'Aus skillpilot abgerufen', responseFields: null, ...call }, { catalog: sources.toolCatalog, inputs })
  assert.deepEqual(technicalRequest({ 'Learning session id': 's', 'Expected state version': 3, 'Goal id': 'g', Mystery: 1 }, inputs), { fields: { learningSessionId: 's', expectedStateVersion: 3, goalId: 'g', Mystery: 1 }, unknown: ['Mystery'] })
  assert.deepEqual(toolsFittingRequest({ learningSessionId: 's', goalId: 'g' }, inputs), ['get_skillpilot_exam_evaluation'])
  assert.deepEqual(toolsFittingRequest({ goalId: 'g' }, inputs), [], 'Every tool needs the learning session')
  // One tool fits the request.
  assert.equal(identify({ request: { 'Batch capability': 'b', 'Learning session id': 's' } }).name, 'get_skillpilot_verified_recall_answers')
  assert.equal(identify({ request: { 'Learning session id': 's', 'Completion choice page': 2 } }).identifiedBy, 'request-fields')
  // Saving a result and activating a goal take the same fields; only a saved result names the goal it saved.
  const write = { 'Client request id': 'c', 'Expected state version': 3, 'Goal id': 'g', 'Learning session id': 's' }
  assert.deepEqual(identify({ request: write }).candidates, ['set_skillpilot_active_goal', 'set_skillpilot_mastery'])
  assert.equal(identify({ request: write }).name, null)
  assert.equal(identify({ request: write, responseFields: { 'Saved goal id': 'g', 'Saved mastery': 1 } }).name, 'set_skillpilot_mastery')
  assert.equal(identify({ request: { ...write, Redirect: true } }).name, 'set_skillpilot_active_goal')
  // A displayed name wins, an unknown field fits nothing.
  assert.equal(identify({ label: 'skillpilot · set_skillpilot_focus', request: write }).identifiedBy, 'displayed-name')
  assert.deepEqual(identify({ request: { 'Learning session id': 's', Mystery: 1 } }).candidates, [])
  // Every result marker is a field the backend puts into a response.
  const adapter = readFileSync(new URL('../backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java', import.meta.url), 'utf8')
  const markers = Object.values(inputs).map(entry => entry.resultMarker).filter(Boolean)
  assert.equal(markers.length, 3)
  for (const marker of markers) assert.ok(adapter.includes(`response.put("${marker}"`), `The backend no longer returns ${marker}`)
})

test('a reworded error and a shortened response are read from the display', () => {
  const [event] = observationEvents(turn({ toolCalls: [retrieved('spc_x', { responseTopLevel: ['Status', 'Error code', 'Message'], responseFields: { Status: 'ERROR', 'Error code': 'INVALID_LEARNING_SESSION' }, responsePreview: 'Status: ERROR\nError code: INVALID_LEARNING_SESSION', isError: true })] }), 'start', { catalog: sources.toolCatalog, inputs: sources.toolInputs, candidate: sources.candidate })
  assert.deepEqual(event.result, { status: 'ERROR', errorCode: 'INVALID_LEARNING_SESSION' })
  assert.deepEqual(event.input, { language: 'de', learningSessionId: 'spc_x' })
  assert.equal(event.resultTruncated, true)
  const [fromPreview] = observationEvents(turn({ toolCalls: [retrieved('spc_x', { responseFields: {}, responsePreview: 'Status: ERROR\nError code: INVALID_LEARNING_SESSION' })] }), 'start', { catalog: sources.toolCatalog, inputs: sources.toolInputs, candidate: sources.candidate })
  assert.deepEqual(fromPreview.result, { errorCode: 'INVALID_LEARNING_SESSION', status: 'ERROR' })
  assert.deepEqual(validateObservation('send', turn({ connectorLoads: 'skillpilot geladen', toolCalls: [retrieved('spc_x', { responseTopLevel: 'State version', responseTruncated: 'yes' })] })).length, 3)
})

test('the public backend client calls only its routes and deletes only its own learners', async () => {
  assert.throws(() => new FirstPartyClient({ origin: 'http://127.0.0.1:8080' }), /https origin/u)
  const requests = []
  let failSetup = false
  const fetchImpl = async (url, options) => {
    const path = new URL(url).pathname
    requests.push(`${options.method} ${path}`)
    if (options.method === 'POST' && path === '/api/ui/learners') return new Response(JSON.stringify({ state: { skillpilotId: 'OwnLearner01' } }))
    if (failSetup && options.method === 'PUT') return new Response('', { status: 500 })
    return new Response(options.method === 'DELETE' ? null : '{}', { status: options.method === 'DELETE' ? 204 : 200 })
  }
  const client = new FirstPartyClient({ origin: 'https://skillpilot.com', fetchImpl })
  await assert.rejects(client.json('GET', '/api/ui/learners/x/export'), /may not call GET \/api\/ui\/learners\/\[id\]\/export/u)
  await assert.rejects(client.deleteLearner('SomeoneElse99'), /only learners it created/u)
  assert.deepEqual(requests, [])
  failSetup = true
  await assert.rejects(client.createLearner(sources.suite.learnerProfiles['hessen-g9-oberstufe-physik-grundkurs']), /HTTP 500/u)
  assert.deepEqual(requests, ['POST /api/ui/learners', 'PUT /api/ui/learners/OwnLearner01/curriculum', 'DELETE /api/ui/learners/OwnLearner01'])
  assert.equal(client.created.size, 0)
})

test('helpers for Windows files and look-alike IDs are strict', () => {
  const files = exchangeFiles({ runId: '2026-11-27T10-00-00.000Z', distro: 'Ubuntu', repositoryRoot: '/home/user/projects/skillpilot', node: '/usr/bin/node', claude: 'C:\\Users\\user\\.local\\bin\\claude.exe', agent: sources.config.agent })
  assert.equal(files['step.cmd'], '@echo off\r\nwsl.exe -d Ubuntu --cd /home/user/projects/skillpilot --exec /usr/bin/node scripts/claude_coach_web_e2e.mjs step --run 2026-11-27T10-00-00.000Z %*\r\n')
  assert.match(files['start.cmd'], /--chrome --model claude-opus-5-5 --effort xhigh "Read the file driver\.md in this folder and follow it exactly \(run 2026-11-27T10-00-00\.000Z\)\."/u)
  assert.throws(() => exchangeFiles({ runId: 'run', distro: 'Ubuntu & calc', repositoryRoot: '/r', node: '/n', claude: 'C:\\c.exe', agent: sources.config.agent }), /distribution/u)
  assert.throws(() => exchangeFiles({ runId: 'run', distro: 'Ubuntu', repositoryRoot: '/my projects/skillpilot', node: '/n', claude: 'C:\\c.exe', agent: sources.config.agent }), /repository path/u)
  assert.throws(() => exchangeFiles({ runId: 'run', distro: 'Ubuntu', repositoryRoot: '/r', node: '/n', claude: 'C:\\c.exe" & calc', agent: sources.config.agent }), /Windows path/u)
  assert.deepEqual(decodeJsonFile(Buffer.from('\uFEFF{"a":"ä"}', 'utf8')), { a: 'ä' })
  assert.deepEqual(decodeJsonFile(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('{"a":"ä"}', 'utf16le')])), { a: 'ä' })
  const fabricated = fabricatePermanentId('Ab12-cdEF-3456')
  assert.match(fabricated, /^[A-Z][a-z]\d\d-[a-z]{2}[A-Z]{2}-\d{4}$/u)
  assert.notEqual(fabricated, 'Ab12-cdEF-3456')
  assert.throws(() => fabricatePermanentId('a-b'), /too short/u)
  assert.deepEqual(parseRunArguments(['--scenario', 'a', '--no-launch', '--scenario', 'b', '--keep-learners']), { scenarios: ['a', 'b'], noLaunch: true, keepLearners: true })
  assert.throws(() => parseRunArguments(['--scenario']), /Usage/u)
})

test('run waits for the last step or for the agent window, never longer', async () => {
  const wait = (statuses, answers, extra = {}) => {
    let clock = 0
    let polls = 0
    return waitForAgent('r', { readStatus: () => { const value = statuses[Math.min(polls, statuses.length - 1)]; polls += 1; if (value instanceof Error) throw value; return value }, running: () => answers.shift() ?? false, pause: async ms => { clock += ms }, now: () => clock, pollMs: 60_000, checkEvery: 1, ...extra })
  }
  assert.equal(await wait(['running', new Error('half written'), 'running', 'finished'], [true, true, true]), 'ended')
  assert.equal(await wait(['running'], [true, true, false, false]), 'agent-closed')
  assert.equal(await wait(['running'], [true, false, true, false, null, false, false]), 'agent-closed', 'Only two missing answers in a row end the wait')
  assert.equal(await wait(['running'], [false, false, false, false, false, false]), 'agent-not-started')
  assert.equal(await wait(['blocked'], []), 'ended')
  const windows = (stdout, status = 0) => (command, args) => command === 'which' ? { status: 0, stdout: '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe\n' } : { status, stdout }
  assert.equal(agentRunning('2026-11-27T10-00-00.000Z', windows('"C:\\c.exe" --chrome "Read ... exactly (run 2026-11-27T10-00-00.000Z)."\r\n"C:\\c.exe" --chrome-native-host\r\n')), true)
  assert.equal(agentRunning('2026-11-27T10-00-00.000Z', windows('"C:\\c.exe" --chrome "Read ... exactly (run 2026-11-27T09-00-00.000Z)."\r\n')), false)
  assert.equal(agentRunning('r', windows('', 1)), null)
  assert.equal(agentRunning('r', () => ({ status: 1, stdout: '' })), null)
})
