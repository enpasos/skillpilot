import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  assertCleanAncestors, buildPluginCopy, checkedSources, childEnvironment, compareVersions, createEventCollector,
  parseRunArguments, readCandidate, renderTranscript, sanitizeReport, toolInputDifferences, toolInputsOf, validateConfig,
} from './claude_plugin_e2e.mjs'
import { evaluateScenario, preconditionProblem, summarizeRun, toolSucceeded, untilReached, validateSuite } from './claude_plugin_e2e_assertions.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const clone = value => JSON.parse(JSON.stringify(value))
const suite = readJson('ai/claude/plugin-e2e/scenarios.json')
const config = readJson('scripts/config/claude-plugin-e2e.json')
const scenario = id => suite.scenarios.find(entry => entry.id === id)

const SESSION = `spc_${'a'.repeat(43)}`
const PERMANENT = '11111111-2222-4333-8444-555555555555'
const ORIENTATION = 'goal-orientation'
const NEXT = 'goal-next'
const PLUGIN = '/tmp/e2e/plugin'
const candidate = { name: 'skillpilot-coach-v1', version: '1.1.15', skillId: 'skillpilot-coach-v1:skillpilot-coach-v1' }
const catalog = ['get_skillpilot_coach_context', 'set_skillpilot_mastery', 'set_skillpilot_active_goal', 'render_skillpilot_goal_visualization', 'confirm_skillpilot_completion_contract']

const tool = (turnId, name, input, result, extra = {}) => ({ type: 'tool', turnId, source: 'skillpilot', name, input: { learningSessionId: SESSION, ...input }, completed: true, isError: false, result, ...extra })
const snapshot = (activeGoalId, mastered, requiredAction = 'teachActiveGoal') => ({ activeGoalId, activeGoalTitle: activeGoalId, learningState: 'TEACHING', requiredAction, mastered })

/** A dialogue in which everything a learner needs worked: start, orientation, one assessed goal. */
function journeyRun() {
  return {
    model: 'claude-opus-5-5', candidate, permanentId: PERMANENT, pluginDirectory: PLUGIN, toolCatalog: catalog, permissionDenials: [],
    session: { kind: 'launch', id: SESSION },
    host: {
      model: 'claude-opus-5-5', plugins: [{ name: candidate.name, version: candidate.version, builtin: false }, { name: 'cc-plugin-privacy', version: null, builtin: true }],
      mcpServers: [{ name: 'plugin:skillpilot-coach-v1:skillpilot', status: 'connected' }], skills: [candidate.skillId, 'dataviz'],
    },
    snapshots: [snapshot(ORIENTATION, [], 'orientActiveGoal'), snapshot(ORIENTATION, [], 'orientActiveGoal'), snapshot(NEXT, [ORIENTATION]), snapshot('goal-third', [NEXT, ORIENTATION].sort())],
    events: [
      { type: 'user', turnId: 'start', text: `Nutze den SkillPilot-Coach-Skill.\nlearningSessionId: ${SESSION}` },
      { type: 'tool', turnId: 'start', source: 'host', name: 'Skill', input: { skill: candidate.skillId }, completed: true, isError: false },
      { type: 'tool', turnId: 'start', source: 'host', name: 'Read', input: { file_path: `${PLUGIN}/skills/skillpilot-coach-v1/references/task-closure.md` }, completed: true, isError: false },
      tool('start', 'get_skillpilot_coach_context', { language: 'de' }, { stateVersion: 7 }),
      { type: 'assistant', turnId: 'start', text: 'Dein aktives Lernziel: Warum Physik?' },
      { type: 'user', turnId: 'learn', text: 'Mich interessiert das MRT. Ich möchte weitermachen.' },
      tool('learn', 'set_skillpilot_mastery', { goalId: ORIENTATION, expectedStateVersion: 7 }, { status: 'SUCCESS', savedGoalId: ORIENTATION, savedMastery: 1 }),
      { type: 'assistant', turnId: 'learn', text: 'Weiter mit Pfeilen. Aufgabe: …' },
      { type: 'user', turnId: 'learn', text: 'Der Pfeil ist 3 cm lang und zeigt nach links.' },
      tool('learn', 'set_skillpilot_mastery', { goalId: NEXT, expectedStateVersion: 8 }, { status: 'SUCCESS', savedGoalId: NEXT, savedMastery: 1 }),
      { type: 'assistant', turnId: 'learn', text: 'Richtig, das Ziel ist geschafft.' },
    ],
  }
}

const failuresOf = (id, mutate) => {
  const run = journeyRun()
  mutate(run)
  return evaluateScenario(scenario(id), run).failures
}

test('the committed suite and configuration are valid and bound to the candidate', () => {
  assert.deepEqual(validateSuite(suite), [])
  validateConfig(clone(config))
  const sources = checkedSources()
  assert.equal(sources.candidate.name, 'skillpilot-coach-v1')
  assert.equal(sources.candidate.skillId, 'skillpilot-coach-v1:skillpilot-coach-v1')
  assert.ok(Object.keys(sources.candidate.files).includes('.mcp.json'))
  assert.match(sources.candidate.packageSha256, /^[0-9a-f]{64}$/u)
  // The suite must cover the happy path, a refusal to store without evidence and the session boundary.
  for (const id of ['first-session-journey', 'pause-after-start', 'no-result-without-evidence', 'missing-session', 'unknown-session', 'permanent-id-offered']) assert.ok(scenario(id), `Missing scenario ${id}`)
})

test('malformed suites are rejected', () => {
  const broken = mutate => { const copy = clone(suite); mutate(copy); return validateSuite(copy) }
  assert.match(broken(copy => { copy.scenarios[0].turns[1].persona = 'unknown' }).join(' '), /unknown persona/u)
  assert.match(broken(copy => { copy.scenarios[0].turns[0].kind = 'click' }).join(' '), /kind must be one of/u)
  assert.match(broken(copy => { copy.scenarios[3].turns[0] = { id: 'start', kind: 'prepared-start' } }).join(' '), /needs a launched session/u)
  assert.match(broken(copy => { copy.scenarios[3].turns[0].text = 'learningSessionId: {{learningSessionId}}' }).join(' '), /no session exists/u)
  assert.match(broken(copy => { copy.scenarios[1].id = copy.scenarios[0].id }).join(' '), /ids must be unique/u)
  assert.match(broken(copy => { copy.scenarios[0].expect = { assistantMustMatch: ['gut gemacht'] } }).join(' '), /not only prose/u)
  assert.match(broken(copy => { copy.scenarios[0].expect.backend.unknownRule = true }).join(' '), /unknown backend expectation/u)
  assert.match(broken(copy => { copy.scenarios[0].turns[1].maxRounds = 99 }).join(' '), /maxRounds/u)
  assert.match(broken(copy => { copy.scenarios[2].turns[2].precondition = { anything: 1 } }).join(' '), /precondition may only use/u)
  assert.match(broken(copy => { copy.scenarios[0].expect.assistantMustMatch = ['('] }).join(' '), /invalid pattern/u)
})

test('a complete learner journey passes every check', () => {
  const result = evaluateScenario(scenario('first-session-journey'), journeyRun())
  assert.deepEqual(result.failures, [])
  assert.ok(result.passed)
  assert.ok(result.checks.length > 20)
})

test('negative controls: each broken fact fails its own check', () => {
  const journey = 'first-session-journey'
  const expectFailure = (mutate, expected, id = journey) => {
    const failures = failuresOf(id, mutate)
    for (const check of [expected].flat()) assert.ok(failures.includes(check), `Expected ${check}, got ${failures.join(', ') || 'no failure'}`)
  }
  expectFailure(run => { run.events.at(-1).text += ` ${SESSION}` }, 'privacy-session-not-in-prose')
  expectFailure(run => { run.events.at(-1).text += ' spc_QUJDREVGR0hJSktMTU5PUFFSU1RVVldY' }, 'privacy-session-not-in-prose')
  expectFailure(run => { run.events.at(-1).text += ` ${PERMANENT}` }, 'privacy-permanent-id-not-in-prose')
  expectFailure(run => { run.events[3].input.note = PERMANENT }, 'privacy-permanent-id-not-in-tool-input')
  expectFailure(run => { run.events[3].input.contact = 'someone@example.org' }, 'privacy-no-account-data-in-tool-input')
  expectFailure(run => { run.events[6].input.feedback = 'Die lernende Person hat alle Teilaufgaben richtig gelöst und ihre Antwort sauber und vollständig begründet.' }, 'privacy-no-prose-in-tool-input')
  expectFailure(run => { run.events[6].input.learningSessionId = `spc_${'b'.repeat(43)}` }, 'session-passed-unchanged')
  expectFailure(run => { run.events[9].isError = true; run.events[9].result = { status: 'ERROR', errorCode: 'STATE_CONFLICT' } }, ['tools-no-unexpected-errors', 'backend-mastery-matches-tool-calls'])
  expectFailure(run => { run.events[9].isError = true; delete run.events[9].result }, 'tools-no-unexpected-errors')
  expectFailure(run => { run.events[9].completed = false }, 'tools-completed')
  expectFailure(run => { run.snapshots.at(-1).mastered = [NEXT, ORIENTATION, 'goal-never-active'].sort() }, ['backend-mastery-only-for-active-goals', 'backend-mastery-matches-tool-calls'])
  expectFailure(run => { run.snapshots.at(-1).mastered = [NEXT] }, ['backend-no-mastery-lost', 'backend-initial-goal-mastered'])
  expectFailure(run => { run.snapshots.at(-1).mastered = [ORIENTATION]; run.events.splice(9, 1) }, 'backend-newly-mastered-count')
  expectFailure(run => { run.snapshots.at(-1).activeGoalId = ORIENTATION }, 'backend-active-goal-changed')
  expectFailure(run => { run.host.plugins.push({ name: 'another-plugin', version: '1.0.0', builtin: false }) }, 'host-plugin-only')
  expectFailure(run => { run.host.plugins[0].version = '1.1.14' }, 'host-plugin-only')
  expectFailure(run => { run.host.mcpServers.push({ name: 'claude.ai skillpilot', status: 'connected' }) }, 'host-connector-only')
  expectFailure(run => { run.host.mcpServers[0].status = 'failed' }, 'host-connector-only')
  expectFailure(run => { run.host.skills = ['dataviz'] }, 'host-skill-listed')
  expectFailure(run => { run.host.model = 'claude-sonnet-5-5' }, 'host-model')
  expectFailure(run => { run.permissionDenials.push({ turnId: 'learn', tool: 'x' }) }, 'host-no-permission-denials')
  expectFailure(run => { run.events.splice(4, 0, tool('start', 'review_skillpilot_memory_practice_card', {}, { status: 'SUCCESS' })) }, ['tools-no-app-only', 'tools-known'])
  expectFailure(run => { run.events.splice(4, 0, { type: 'tool', turnId: 'start', source: 'foreign', name: 'mcp__claude_ai_skillpilot__set_skillpilot_mastery', input: {}, completed: true }) }, 'tools-known')
  expectFailure(run => { run.events[2].input.file_path = '/home/someone/.claude/CLAUDE.md' }, 'host-read-inside-plugin')
  expectFailure(run => { run.events[2].input.file_path = `${PLUGIN}/../secret` }, 'host-read-inside-plugin')
  expectFailure(run => { run.events.splice(1, 1) }, 'skill-loaded-first-turn')
  expectFailure(run => { run.events[1].turnId = 'learn'; run.events.splice(6, 0, run.events.splice(1, 1)[0]) }, 'skill-loaded-first-turn')
  expectFailure(run => { [run.events[3], run.events[6]] = [run.events[6], run.events[3]] }, 'first-connector-tool')
  expectFailure(run => { run.events = run.events.filter(event => event.type !== 'assistant') }, 'events-observed')

  // A learner who only asks for the status: any stored result or learning-state write fails.
  expectFailure(() => {}, ['tools-forbidden', 'backend-mastery-unchanged', 'backend-active-goal-unchanged'], 'pause-after-start')
  // A learner who shows no evidence: a second stored result fails.
  expectFailure(() => {}, 'backend-newly-mastered-limit', 'no-result-without-evidence')
})

test('session boundary scenarios', () => {
  const noSession = () => {
    const run = journeyRun()
    run.session = { kind: 'none' }
    run.snapshots = [snapshot(ORIENTATION, []), snapshot(ORIENTATION, [])]
    run.events = [
      { type: 'user', turnId: 'ask', text: 'Ich möchte mit SkillPilot Physik lernen.' },
      { type: 'assistant', turnId: 'ask', text: 'Öffne bitte skillpilot.com und wähle „Lernen starten“.' },
    ]
    return run
  }
  assert.deepEqual(evaluateScenario(scenario('missing-session'), noSession()).failures, [])
  assert.deepEqual(evaluateScenario(scenario('permanent-id-offered'), noSession()).failures, [])
  const called = noSession()
  called.events.splice(1, 0, { ...tool('ask', 'get_skillpilot_coach_context', {}, { stateVersion: 1 }), input: { learningSessionId: 'spc_invented' } })
  assert.deepEqual(evaluateScenario(scenario('missing-session'), called).failures, ['session-not-invented', 'tools-forbidden:*'])
  const silent = noSession()
  silent.events[1].text = 'Womit möchtest du anfangen?'
  assert.deepEqual(evaluateScenario(scenario('missing-session'), silent).failures, ['assistant-says:skillpilot\\.com', 'assistant-says:Lernen starten|Mit Claude lernen|Lernsitzung|Start-?Prompt'])
  // Both labels of skillpilot.com count: the entry "Lernen starten" and the start button "Mit Claude lernen" (Product Owner, 27 November 2026).
  const button = noSession()
  button.events[1].text = 'Öffne https://skillpilot.com/ und starte dort deine Lernsitzung über „Mit Claude lernen“.'
  assert.deepEqual(evaluateScenario(scenario('missing-session'), button).failures, [])
  assert.deepEqual(evaluateScenario(scenario('missing-session'), button).notes, [])
  // The content counts, not the label: a new start on skillpilot.com without a button name passes with a note (Product Owner, 27 November 2026).
  const described = noSession()
  described.events[1].text = 'Öffne https://skillpilot.com/ und erstelle dort einen neuen Start-Prompt für Claude.'
  const result = evaluateScenario(scenario('permanent-id-offered'), described)
  assert.deepEqual(result.failures, [])
  assert.deepEqual(result.notes, ['No visible answer matches /Lernen starten|Mit Claude lernen/; preferred, not required.'])
  const nowhere = noSession()
  nowhere.events[1].text = 'Starte bitte eine neue Lernsitzung.'
  assert.deepEqual(evaluateScenario(scenario('missing-session'), nowhere).failures, ['assistant-says:skillpilot\\.com'])

  const unknown = noSession()
  unknown.session = { kind: 'fabricated', id: SESSION }
  unknown.events.splice(1, 0, tool('start', 'get_skillpilot_coach_context', {}, { status: 'ERROR', errorCode: 'LEARNING_SESSION_REQUIRED' }, { isError: true }))
  assert.deepEqual(evaluateScenario(scenario('unknown-session'), unknown).failures, [])
  const swallowed = clone(unknown)
  swallowed.events.splice(1, 1)
  assert.ok(evaluateScenario(scenario('unknown-session'), swallowed).failures.includes('error-observed:LEARNING_SESSION_REQUIRED'))
})

test('loop conditions, preconditions and run summary', () => {
  const run = journeyRun()
  assert.equal(untilReached({ newlyMasteredAtLeast: 2 }, run), true)
  assert.equal(untilReached({ newlyMasteredAtLeast: 3 }, run), false)
  assert.equal(untilReached({ toolSucceeded: 'set_skillpilot_mastery' }, run), true)
  assert.equal(untilReached({ toolSucceeded: 'set_skillpilot_focus' }, run), false)
  assert.equal(untilReached(undefined, run), false)
  assert.equal(toolSucceeded({ type: 'tool', completed: true, isError: true }), false)
  assert.equal(toolSucceeded({ type: 'tool', completed: false, isError: false }), false)
  assert.equal(preconditionProblem(undefined, run), undefined)
  assert.equal(preconditionProblem({ requiredAction: 'teachActiveGoal', newlyMasteredExactly: 2 }, run), undefined)
  assert.match(preconditionProblem({ requiredAction: 'orientActiveGoal' }, run), /scenario needs orientActiveGoal/u)
  assert.match(preconditionProblem({ newlyMasteredExactly: 1 }, run), /scenario needs 1/u)
  assert.deepEqual(summarizeRun([{ id: 'a', repetition: 1, status: 'passed' }], ['a'], 1), { status: 'passed', complete: true, passed: 1, total: 1 })
  assert.equal(summarizeRun([{ id: 'a', repetition: 1, status: 'passed' }], ['a', 'b'], 1).status, 'failed')
  assert.equal(summarizeRun([{ id: 'a', repetition: 1, status: 'error' }], ['a'], 1).status, 'failed')
})

test('configuration guards', () => {
  const invalid = mutate => { const copy = clone(config); mutate(copy); return () => validateConfig(copy) }
  assert.throws(invalid(copy => { copy.hostSystemPrompt += ' Always call get_skillpilot_coach_context first.' }), /must not contain product or coaching instructions/u)
  assert.throws(invalid(copy => { copy.hostSystemPrompt += ' Record mastery only after a check.' }), /must not contain product or coaching instructions/u)
  assert.throws(invalid(copy => { copy.backend.port = 8080 }), /backend\.port/u)
  assert.throws(invalid(copy => { copy.backend.schema = 'public' }), /public schema/u)
  assert.throws(invalid(copy => { copy.model = 'gpt-5.6-sol' }), /Invalid model/u)
  assert.throws(invalid(copy => { copy.repetitions = 0 }), /Invalid repetitions/u)
  assert.throws(invalid(copy => { copy.backend.resource = 'https://skillpilot.com/mcp' }), /backend\.resource/u)
  assert.equal(compareVersions('2.1.332', '2.1.280'), 1)
  assert.equal(compareVersions('2.1.241', '2.1.280'), -1)
  assert.equal(compareVersions('2.1.280', '2.1.280'), 0)
  assert.deepEqual(parseRunArguments(['--scenario', 'a', '--scenario', 'b', '--model', 'claude-opus-5-5', '--repetitions', '2']), { scenarios: ['a', 'b'], model: 'claude-opus-5-5', repetitions: 2 })
  assert.throws(() => parseRunArguments(['--unknown', 'x']), /Usage/u)
  assert.throws(() => parseRunArguments(['--model']), /Usage/u)
  assert.throws(() => parseRunArguments(['--model', 'a', '--model', 'b']), /given twice/u)
})

test('the host inherits no parent session and no foreign connector', () => {
  const environment = childEnvironment({ PATH: '/bin', HOME: '/home/x', CLAUDECODE: '1', CLAUDE_CODE_SESSION_ID: 's', CLAUDE_CODE_ENTRYPOINT: 'vscode', OPENAI_API_KEY: 'k', ANTHROPIC_API_KEY: 'a' }, { ENABLE_CLAUDEAI_MCP_SERVERS: 'false' })
  assert.deepEqual(environment, { PATH: '/bin', HOME: '/home/x', ANTHROPIC_API_KEY: 'a', ENABLE_CLAUDEAI_MCP_SERVERS: 'false' })
})

test('the test copy equals the candidate except for the connector address', t => {
  const directory = mkdtempSync(join(tmpdir(), 'skillpilot-claude-plugin-e2e-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const real = readCandidate()
  buildPluginCopy(real, join(directory, 'plugin'), { url: 'http://127.0.0.1:18080/internal/connectors/claude/v1/mcp', headers: { Authorization: 'Bearer test-token' } })
  for (const path of Object.keys(real.files)) {
    if (path === '.mcp.json') continue
    assert.deepEqual(readFileSync(join(directory, 'plugin', path)), readFileSync(join(real.pluginRoot, path)), path)
  }
  const declared = JSON.parse(readFileSync(join(directory, 'plugin', '.mcp.json'), 'utf8'))
  assert.deepEqual(Object.keys(declared.mcpServers), ['skillpilot'])
  assert.equal(declared.mcpServers.skillpilot.type, 'http')
  assert.equal(declared.mcpServers.skillpilot.url, 'http://127.0.0.1:18080/internal/connectors/claude/v1/mcp')

  assertCleanAncestors(directory)
  const nested = join(directory, 'project', 'workspace')
  mkdirSync(nested, { recursive: true })
  writeFileSync(join(directory, 'project', 'CLAUDE.md'), 'foreign instructions')
  assert.throws(() => assertCleanAncestors(nested), /would inherit/u)
})

test('reports carry no session, credential, permanent id or account data', () => {
  const capability = 'A'.repeat(120)
  const cleaned = sanitizeReport({
    text: `learningSessionId: ${SESSION} id ${PERMANENT} mail someone@example.org Bearer abcdefghijklmnopqrstuvwxyz capability ${capability}`,
    nested: [{ authorization: 'Bearer x', clientSecret: 'secret', input: { learningSessionId: SESSION } }],
    count: 3,
  }, [[PERMANENT, '[permanent-id]'], [SESSION, '[learning-session]']])
  const serialized = JSON.stringify(cleaned)
  for (const forbidden of [SESSION, PERMANENT, 'someone@example.org', 'abcdefghijklmnopqrstuvwxyz', capability, 'secret"']) assert.ok(!serialized.includes(forbidden), forbidden)
  assert.match(cleaned.text, /\[learning-session\].*\[permanent-id\].*\[email\].*\[REDACTED_CREDENTIAL\].*\[opaque:[0-9a-f]{16}\]/u)
  assert.equal(cleaned.count, 3)
  assert.equal(renderTranscript([{ type: 'user', text: `Start ${SESSION}` }, { type: 'tool', name: 'x' }, { type: 'assistant', text: 'Hallo' }], [[SESSION, '[learning-session]']]).includes(SESSION), false)
})

test('host stream events become the checked event model', () => {
  const collector = createEventCollector('skillpilot-coach-v1')
  const prefix = 'mcp__plugin_skillpilot-coach-v1_skillpilot__'
  assert.equal(collector.push({ type: 'system', subtype: 'init', model: 'claude-opus-5-5', claude_code_version: '2.1.332', plugins: [{ name: 'skillpilot-coach-v1', version: '1.1.15', path: '/x', source: 'skillpilot-coach-v1@inline' }, { name: 'cc-plugin-privacy', path: 'builtin', source: 'cc-plugin-privacy@builtin' }], mcp_servers: [{ name: 'plugin:skillpilot-coach-v1:skillpilot', status: 'connected' }], skills: ['a'], tools: ['Skill'] }, 't1'), null)
  collector.push({ type: 'assistant', message: { content: [{ type: 'thinking', thinking: '' }, { type: 'tool_use', id: 'u1', name: `${prefix}get_skillpilot_coach_context`, input: { learningSessionId: SESSION } }, { type: 'tool_use', id: 'u2', name: 'Skill', input: { skill: 'x' } }, { type: 'tool_use', id: 'u3', name: 'mcp__other__tool', input: {} }] } }, 't1')
  collector.push({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'u1', content: [{ type: 'text', text: JSON.stringify({ status: 'ERROR', errorCode: 'LEARNING_SESSION_REQUIRED', message: 'm', private: 'not kept' }) }], is_error: true }, { type: 'tool_result', tool_use_id: 'u2', content: 'Launching skill: x' }] } }, 't1')
  collector.push({ type: 'assistant', message: { content: [{ type: 'text', text: 'Bitte starte neu.' }, { type: 'text', text: '   ' }] } }, 't1')
  const result = collector.push({ type: 'result', subtype: 'success', is_error: false, total_cost_usd: 0.25, num_turns: 3, permission_denials: [{ tool_name: 'Bash' }] }, 't1')
  assert.deepEqual(result, { turnId: 't1', subtype: 'success', isError: false, hostTurns: 3 })
  assert.equal(collector.costUsd, 0.25)
  assert.deepEqual(collector.permissionDenials, [{ turnId: 't1', tool: 'Bash' }])
  assert.deepEqual(collector.host.plugins, [{ name: 'skillpilot-coach-v1', version: '1.1.15', builtin: false }, { name: 'cc-plugin-privacy', version: null, builtin: true }])
  const [context, skill, foreign, answer] = collector.events
  assert.deepEqual([context.source, context.name, context.completed, context.isError], ['skillpilot', 'get_skillpilot_coach_context', true, true])
  assert.deepEqual(context.result, { status: 'ERROR', errorCode: 'LEARNING_SESSION_REQUIRED', message: 'm' })
  assert.deepEqual([skill.source, skill.name, skill.completed, skill.result], ['host', 'Skill', true, undefined])
  assert.deepEqual([foreign.source, foreign.completed], ['foreign', false])
  assert.deepEqual(answer, { type: 'assistant', turnId: 't1', text: 'Bitte starte neu.' })
  assert.equal(collector.events.length, 4)
  // A second init of the same process must not replace the first host description.
  collector.push({ type: 'system', subtype: 'init', model: 'other' }, 't2')
  assert.equal(collector.host.model, 'claude-opus-5-5')
})

test('the recorded tool inputs are compared with the tools the connector lists', () => {
  const listed = toolInputsOf([
    { name: 'set_skillpilot_mastery', inputSchema: { properties: { language: {}, goalId: {}, learningSessionId: {}, expectedStateVersion: {}, clientRequestId: {}, earnedPoints: {}, evaluationCapability: {} }, required: ['goalId', 'expectedStateVersion', 'clientRequestId', 'learningSessionId'] } },
    { name: 'get_skillpilot_coach_context', inputSchema: { properties: { learningSessionId: {}, language: {} }, required: ['learningSessionId'] } },
  ])
  assert.deepEqual(Object.keys(listed), ['get_skillpilot_coach_context', 'set_skillpilot_mastery'])
  assert.deepEqual(listed.set_skillpilot_mastery, { required: ['clientRequestId', 'expectedStateVersion', 'goalId', 'learningSessionId'], optional: ['earnedPoints', 'evaluationCapability', 'language'] })
  const differing = toolInputDifferences(listed)
  // The coach context lost an optional field here, and every tool the connector did not list differs.
  assert.ok(differing.includes('get_skillpilot_coach_context') && !differing.includes('set_skillpilot_mastery') && differing.includes('set_skillpilot_focus'))
})
