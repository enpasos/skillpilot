import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { buildJudgeRequest, dialogToolPayload, evaluateDialogCase, validateJudgeResult } from './openai_dialog_assertions.mjs'

const suite = JSON.parse(readFileSync(new URL('../ai/openai plugin/skillpilot-coach-v1/submission/review-cases.json', import.meta.url), 'utf8'))
const getCase = id => structuredClone(suite.cases.find(entry => entry.id === id))
const user = (turnId, text = 'fixture turn', actor = 'user') => ({ type: actor === 'component' ? 'ui' : 'user', turnId, actor, text })
const reply = (turnId, text = 'Observed answer.') => ({ type: 'assistant', turnId, actor: 'model', text })
const tool = (turnId, name, payload = {}, args = {}, extra = {}) => ({ type: 'tool', turnId, actor: 'model', name, arguments: args, result: { structuredContent: payload, content: [], isError: false }, ...extra })
const ctx = (turnId, extra = {}) => tool(turnId, 'get_skillpilot_context', { learningState: 'ACTIVE', stateVersion: 1, communicationLocale: 'de', activeGoal: { goalId: 'g1' }, ...extra })
const base = testCase => testCase.turns.flatMap(turn => turn.kind === 'ui' ? [user(turn.id, turn.text, 'component')] : [user(turn.id, turn.text), ctx(turn.id), reply(turn.id)])
const insert = (events, turnId, ...calls) => events.splice(events.findIndex(event => event.type === 'assistant' && event.turnId === turnId), 0, ...calls)
const failed = (result, prefix) => result.failures.some(id => id.startsWith(prefix))

test('sessionless exact text passes deterministic checks, without claiming manual acceptance', () => {
  const c = getCase('P1')
  const events = [user('start'), reply('start', c.assertions[0].value)]
  const result = evaluateDialogCase(c, events)
  assert.equal(result.passed, true)
  assert.equal(result.checks.some(entry => entry.id === 'no-state-change'), false)
  assert.equal(result.manualReviews, undefined)
  assert.equal(result.hostEvidence, undefined)
  assert.equal(evaluateDialogCase(c, []).passed, false)
  assert.equal(evaluateDialogCase(c, [reply('start', c.assertions[0].value)]).passed, false)
  assert.equal(evaluateDialogCase(c, [...events, tool('start', 'get_skillpilot_context', {}, {}, { blocked: true })]).passed, false)
})

test('unknown, missing and reordered turns fail rather than silently reducing coverage', () => {
  const c = getCase('D5')
  assert.equal(evaluateDialogCase(c, base(c)).passed, true)
  assert.equal(evaluateDialogCase(c, [user('unknown')]).passed, false)
  assert.equal(evaluateDialogCase(c, [{ ...user('request'), actor: undefined }]).passed, false)
  const p2 = base(getCase('P2'))
  ;[p2[0], p2[3]] = [p2[3], p2[0]]
  assert.equal(failed(evaluateDialogCase(getCase('P2'), p2), 'authored-turns'), true)
})

test('every learner turn needs its own first context exactly once, not a reload after mutation', () => {
  const c = getCase('D5')
  const events = base(c)
  insert(events, 'request', ctx('request'))
  assert.equal(failed(evaluateDialogCase(c, events), 'fresh-context'), true)
  const noContext = [user('request'), reply('request')]
  assert.equal(failed(evaluateDialogCase(c, noContext), 'fresh-context'), true)
  const before = [user('request'), tool('request', 'render_skillpilot_goal_visualization'), ctx('request'), reply('request')]
  assert.equal(failed(evaluateDialogCase(c, before), 'context-before-call'), true)
})

test('MCP expected session errors are distinguished from missing output and failed tools', () => {
  const c = getCase('N1')
  const error = tool('invalid', 'get_skillpilot_context', { code: 'SESSION_REQUIRED' })
  error.result.isError = true
  assert.equal(evaluateDialogCase(c, [user('invalid'), error, reply('invalid')]).passed, true)
  const changed = structuredClone(error)
  changed.result.structuredContent.code = 'INTERNAL_ERROR'
  assert.equal(evaluateDialogCase(c, [user('invalid'), changed, reply('invalid')]).passed, false)
  delete changed.result
  assert.equal(evaluateDialogCase(c, [user('invalid'), changed, reply('invalid')]).passed, false)
  assert.deepEqual(dialogToolPayload({ result: { content: [{ type: 'text', text: '{"code":"SESSION_REQUIRED"}' }] } }), { code: 'SESSION_REQUIRED' })
})

test('negative cases count blocked forbidden attempts, not only successful mutations', () => {
  for (const [id, name] of [['N2', 'set_skillpilot_active_goal'], ['N3', 'get_skillpilot_exam_evaluation'], ['D4', 'resume_skillpilot_learning_plan'], ['D6', 'render_skillpilot_goal_visualization']]) {
    const c = getCase(id)
    const events = base(c)
    const turn = c.turns.at(-1).id
    insert(events, turn, tool(turn, name, {}, {}, { blocked: true }))
    assert.equal(failed(evaluateDialogCase(c, events), `forbidden:${name}`), true)
  }
})

test('orientation cannot complete on a bare interest even when overall tool order is right', () => {
  const c = getCase('P2')
  const good = base(c)
  insert(good, 'continue', tool('continue', 'set_skillpilot_mastery', { context: { learningState: 'ACTIVE', activeGoal: { goalId: 'g2' } }, stateVersion: 2 }, { expectedStateVersion: 1 }))
  assert.equal(evaluateDialogCase(c, good).passed, true)
  const bad = base(c)
  insert(bad, 'interest', tool('interest', 'set_skillpilot_mastery', {}, { expectedStateVersion: 1 }))
  assert.equal(failed(evaluateDialogCase(c, bad), 'orientation-consent'), true)
})

test('P4 timing, current evaluation receipt and exact fixture score are checked independently of counts', () => {
  const c = getCase('P4')
  const evaluation = tool('submission', 'get_skillpilot_exam_evaluation', { goalId: 'exam', evaluationCapability: 'fixture-cap', scoring: { maxPoints: 25, passingPoints: 13 }, stateVersion: 1 })
  const mastery = tool('submission', 'set_skillpilot_mastery', {}, { expectedStateVersion: 1, goalId: 'exam', evaluationCapability: 'fixture-cap', earnedPoints: 25 })
  const good = base(c)
  insert(good, 'submission', evaluation, mastery)
  assert.equal(evaluateDialogCase(c, good).passed, true)
  const early = base(c)
  insert(early, 'task', { ...evaluation, turnId: 'task' })
  insert(early, 'submission', mastery)
  assert.equal(failed(evaluateDialogCase(c, early), 'exam-submission'), true)
  const wrongScore = structuredClone(good)
  wrongScore.find(event => event.name === 'set_skillpilot_mastery').arguments.earnedPoints = 13
  assert.equal(failed(evaluateDialogCase(c, wrongScore), 'exam-score'), true)
})

test('P5 refreshes scope options after consent and copies all independent roots exactly', () => {
  const c = getCase('P5')
  const nav = turn => tool(turn, 'get_skillpilot_navigation', { target: 'scope', options: [{ goalIds: ['broader', 'independent'] }], stateVersion: 1 })
  const write = tool('consent', 'set_skillpilot_scope', {}, { goalIds: ['broader', 'independent'], expectedStateVersion: 1 })
  const good = base(c)
  insert(good, 'inspect', nav('inspect'))
  insert(good, 'consent', nav('consent'), write)
  assert.equal(evaluateDialogCase(c, good).passed, true)
  const stale = good.filter(event => !(event.name === 'get_skillpilot_navigation' && event.turnId === 'consent'))
  assert.equal(failed(evaluateDialogCase(c, stale), 'scope-fresh-option'), true)
  const lostRoot = structuredClone(good)
  lostRoot.find(event => event.name === 'set_skillpilot_scope').arguments.goalIds = ['broader']
  assert.equal(failed(evaluateDialogCase(c, lostRoot), 'scope-fresh-option'), true)
})

test('D2/D4 check actual plan preconditions and D3 exact authorized labels before switching', () => {
  const d2 = getCase('D2')
  const events = [user('start'), ctx('start', { activeGoal: undefined, learningPlanToday: { resumeAvailable: true, guidance: { state: 'resume' } } }), tool('start', 'resume_skillpilot_learning_plan', {}, { expectedStateVersion: 1 }), reply('start')]
  assert.equal(evaluateDialogCase(d2, events).passed, true)
  events[1].result.structuredContent.learningPlanToday.guidance.state = 'complete'
  assert.equal(failed(evaluateDialogCase(d2, events), 'starting-plan-precondition'), true)
  events[1].result.structuredContent.learningPlanToday.guidance.state = 'resume'
  events[1].result.structuredContent.activeGoal = { goalId: 'active' }
  assert.equal(failed(evaluateDialogCase(d2, events), 'resume-precondition'), true)
  assert.equal(failed(evaluateDialogCase(getCase('D4'), base(getCase('D4'))), 'starting-plan-precondition'), true)
  const d3 = getCase('D3')
  const switching = base(d3)
  const context = switching.find(event => event.name === 'get_skillpilot_context' && event.turnId === 'switch')
  context.result.structuredContent.learningPlanToday = { subjects: [{ subject: 'Mathematik', current: true, canContinue: true }, { subject: 'Physik', current: false, canContinue: true }] }
  insert(switching, 'switch', tool('switch', 'switch_skillpilot_learning_plan_subject', {}, { subject: 'Physik', expectedStateVersion: 1 }))
  assert.equal(evaluateDialogCase(d3, switching).passed, true)
  switching.find(event => event.name === 'switch_skillpilot_learning_plan_subject').arguments.subject = 'physics'
  assert.equal(failed(evaluateDialogCase(d3, switching), 'subject-option'), true)
})

test('P3 cannot impersonate a component or release recall answers before the answer turn', () => {
  const c = getCase('P3')
  const events = base(c)
  insert(events, 'practice', tool('practice', 'review_skillpilot_memory_practice_card'))
  insert(events, 'recall', tool('recall', 'get_skillpilot_verified_recall_answers'))
  const result = evaluateDialogCase(c, events)
  assert.equal(failed(result, 'tool-actor'), true)
  assert.equal(failed(result, 'recall-submission'), true)
  assert.equal(failed(result, 'eight-component-ratings'), true)
  const rating = tool('rate', 'review_skillpilot_memory_practice_card', {}, {}, { actor: 'component' })
  const rated = [...events.slice(0, events.findIndex(event => event.turnId === 'rate') + 1), rating]
  assert.equal(evaluateDialogCase(c, rated).checks.filter(entry => entry.id.startsWith('tool-actor')).at(-1).passed, true)
})

test('image authority and version are not inferred from a successful renderer response', () => {
  const c = getCase('D1')
  const events = base(c)
  events[1].result.structuredContent.goalVisualization = { goalId: 'g1' }
  insert(events, 'start', tool('start', 'render_skillpilot_goal_visualization', {}, { goalId: 'g1', expectedStateVersion: 1 }))
  assert.equal(evaluateDialogCase(c, events).passed, true)
  events[2].arguments.goalId = 'invented'
  events[2].arguments.expectedStateVersion = 99
  assert.equal(failed(evaluateDialogCase(c, events), 'render-authority'), true)
  assert.equal(failed(evaluateDialogCase(c, events), 'fresh-version'), true)
})

test('paired fixture snapshots detect silent state mutations despite read-only tool names', () => {
  const c = getCase('D5')
  const events = base(c)
  const state = { stateVersion: 1, activeGoalId: 'g1', confirmedWriteCount: 0, masteryWrites: 0, domainState: { personalCurriculum: ['Mathematik', 'Physik'], mastery: {} } }
  events[1].stateBefore = structuredClone(state)
  events[1].stateAfter = structuredClone(state)
  assert.equal(evaluateDialogCase(c, events).passed, true)
  events[1].stateAfter.domainState.mastery.g1 = 1
  assert.equal(failed(evaluateDialogCase(c, events), 'mastery-preserved'), true)
  events[1].stateAfter.domainState.personalCurriculum = ['Physik']
  assert.equal(failed(evaluateDialogCase(c, events), 'personal-curriculum'), true)
  events[1].stateAfter.confirmedWriteCount = 1
  assert.equal(failed(evaluateDialogCase(c, events), 'read-only-state'), true)
  delete events[1].stateAfter
  assert.equal(failed(evaluateDialogCase(c, events), 'snapshot-pair'), true)
})

test('judge request excludes private channels, credentials and audit internals and is clearly API-only', () => {
  const c = getCase('P2')
  const events = base(c)
  events[1].result._meta = { cardBack: 'PRIVATE-ANSWER-CANARY' }
  events[1].result.structuredContent._meta = { nested: 'NESTED-SECRET' }
  events[1].arguments.learningSessionId = 'sps_SYNTHETIC_SESSION_1234567890'
  events[1].stateBefore = { learnerId: 'private-audit' }
  events[1].result.structuredContent.evaluationCapability = 'PRIVATE-CAP-CANARY'
  events[2].text = `Visible sps_SYNTHETIC_SESSION_1234567890 Bearer ${'A'.repeat(24)}`
  const request = buildJudgeRequest(c, events)
  const serialized = JSON.stringify(request)
  for (const secret of ['PRIVATE-ANSWER-CANARY', 'NESTED-SECRET', 'PRIVATE-CAP-CANARY', 'private-audit', 'sps_SYNTHETIC_SESSION_1234567890', 'A'.repeat(24)]) assert.equal(serialized.includes(secret), false)
  assert.match(request.instructions, /not a human reviewer/u)
  assert.match(request.instructions, /untrusted evidence/u)
  assert.equal(request.text.format.strict, true)
  assert.equal(JSON.parse(request.input).criteria.length, c.assertions.filter(a => a.kind === 'manual').length)
  assert.equal(JSON.parse(request.input).hostLimitations.length, 3)
  const noSemantics = { ...c, assertions: [{ id: 'only-count', kind: 'no-tools' }] }
  assert.equal(buildJudgeRequest(noSemantics, events), null)
})

test('judge results require every semantic criterion, actual evidence and explicit pass', () => {
  const c = getCase('P2')
  const events = base(c)
  const good = { caseId: c.id, evaluations: c.assertions.filter(a => a.kind === 'manual').map(a => ({ assertionId: a.id, status: 'pass', explanation: 'Observed text meets the API-visible criterion; host rendering not assessed.', evidenceTurnIds: ['continue'] })) }
  const result = validateJudgeResult(c, good, events)
  assert.equal(result.passed, true)
  assert.equal(result.evaluator, 'llm-judge')
  assert.equal(result.manualReviews, undefined)
  for (const mutate of [
    value => value.evaluations.pop(),
    value => value.evaluations.push(value.evaluations[0]),
    value => { value.evaluations[0].assertionId = 'invented' },
    value => { value.evaluations[0].evidenceTurnIds = ['missing'] },
    value => { value.evaluations[0].evidenceTurnIds = [] },
    value => { value.evaluations[0].explanation = '' },
    value => { value.evaluations[0].status = 'insufficient_evidence' },
    value => { value.evaluations[0].status = 'fail' },
    value => { value.manualReviews = [] },
  ]) {
    const changed = structuredClone(good)
    mutate(changed)
    assert.equal(validateJudgeResult(c, changed, events).passed, false)
  }
  assert.equal(validateJudgeResult(c, null, events).passed, false)
})

test('every current case uses only the known Structured Outputs schema subset', () => {
  const allowed = new Set(['type', 'properties', 'required', 'additionalProperties', 'enum', 'items', 'minItems', 'maxItems'])
  const walk = schema => {
    for (const keyword of Object.keys(schema)) assert.ok(allowed.has(keyword), `Unsupported API schema keyword: ${keyword}`)
    if (schema.type === 'object') {
      assert.equal(schema.additionalProperties, false)
      assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort())
      for (const value of Object.values(schema.properties)) walk(value)
    }
    if (schema.items) walk(schema.items)
  }
  assert.equal(suite.cases.length, 14)
  for (const c of suite.cases) {
    const request = buildJudgeRequest(c, base(c))
    assert.ok(request, `${c.id}: semantic criteria must not silently disappear`)
    walk(request.text.format.schema)
    const result = { caseId: c.id, evaluations: c.assertions.filter(a => a.kind === 'manual').map(a => ({ assertionId: a.id, status: 'pass', explanation: 'Observed API-visible behavior.', evidenceTurnIds: [c.turns[0].id] })) }
    result.evaluations[0].evidenceTurnIds.push(c.turns[0].id)
    assert.equal(validateJudgeResult(c, result, base(c)).passed, false, `${c.id}: duplicate evidence still fails programmatically`)
    result.evaluations[0].evidenceTurnIds.pop()
    result.evaluations[0].explanation = ' '
    assert.equal(validateJudgeResult(c, result, base(c)).passed, false, `${c.id}: blank explanations still fail programmatically`)
  }
})
