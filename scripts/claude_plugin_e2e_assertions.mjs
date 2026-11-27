/**
 * Pure deterministic checks for the Claude plugin end-to-end run.
 * No model call, no network, no file access. `passed` is neither a semantic
 * judgement of the coaching nor an acceptance of the claude.ai host.
 */

export const SKILL_TOOL = 'Skill'
export const READ_TOOL = 'Read'
export const CONTEXT = 'get_skillpilot_coach_context'
export const MASTERY = 'set_skillpilot_mastery'
export const APP_ONLY_TOOLS = Object.freeze(['review_skillpilot_memory_practice_card'])
/** `run.hostKind` of a run through Claude's web interface; every other run is the headless host. */
export const WEB_HOST = 'claude-ai-web'
/** Tools that change what the learner works on or what counts as achieved. */
export const LEARNING_STATE_WRITE_TOOLS = Object.freeze([
  MASTERY,
  'set_skillpilot_active_goal',
  'set_skillpilot_focus',
  'resume_skillpilot_learning_plan',
  'switch_skillpilot_learning_plan_subject',
  'record_skillpilot_verified_recall_results',
  'choose_skillpilot_completion_route',
])
export const SESSION_ID_PATTERN = /\bspc_[A-Za-z0-9_-]{16,}/u
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/u
const MAX_WORDS_IN_TOOL_INPUT_STRING = 12

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const unique = values => [...new Set(values)]

/** Parsed JSON payload of a connector tool result, or undefined. Plain text is not state. */
export function toolPayload(event) {
  if (isObject(event?.result)) return event.result
  if (typeof event?.resultText !== 'string') return undefined
  try {
    const parsed = JSON.parse(event.resultText)
    return isObject(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function toolErrorCode(event) {
  const payload = toolPayload(event)
  return payload?.errorCode ?? payload?.error?.code ?? (payload?.status === 'ERROR' ? 'ERROR' : undefined)
}

/** Never treat a missing, denied or malformed result as a successful operation. */
export function toolSucceeded(event) {
  return event?.type === 'tool' && event.completed === true && event.isError !== true && !toolErrorCode(event)
}

/**
 * Whether a call is this tool. Claude's web interface displays some calls without the tool name;
 * such a call carries `candidates`, the tools its displayed request fits, and counts as each of
 * them. A call from a host that reports names has no candidates.
 */
export function callMayBe(event, name) {
  return event?.name === name || (Array.isArray(event?.candidates) && event.candidates.includes(name))
}

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach(item => collectStrings(item, out))
  else if (isObject(value)) Object.values(value).forEach(item => collectStrings(item, out))
  return out
}

function validateStringList(value, label, errors, { optional = true } = {}) {
  if (value === undefined && optional) return
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) errors.push(`${label} must be a list of non-empty strings.`)
}

function validatePatternList(value, label, errors) {
  validateStringList(value, label, errors)
  for (const source of Array.isArray(value) ? value : []) {
    try { new RegExp(source, 'iu') } catch { errors.push(`${label} contains an invalid pattern: ${source}`) }
  }
}

const TURN_KINDS = ['prepared-start', 'text', 'simulated']
const SESSION_KINDS = ['launch', 'fabricated', 'none']
const EXPECT_KEYS = ['skillLoaded', 'firstSkillPilotTool', 'requiredTools', 'forbiddenTools', 'allowedErrorCodes', 'requiredErrorCodes', 'backend', 'assistantMustMatch', 'assistantMustNotMatch']
const BACKEND_KEYS = ['initialActiveGoalMastered', 'newlyMasteredAtLeast', 'newlyMasteredAtMost', 'masteryUnchanged', 'activeGoalUnchanged', 'activeGoalChanged']
const UNTIL_KEYS = ['newlyMasteredAtLeast', 'toolSucceeded']
const PRECONDITION_KEYS = ['requiredAction', 'newlyMasteredExactly']

/** Returns a list of problems; an empty list means the suite is well-formed. */
export function validateSuite(suite) {
  const errors = []
  if (!isObject(suite) || suite.schemaVersion !== 1) return ['Scenario suite must be an object with schemaVersion 1.']
  const profiles = isObject(suite.learnerProfiles) ? suite.learnerProfiles : {}
  if (!Object.keys(profiles).length) errors.push('At least one learner profile is required.')
  for (const [name, profile] of Object.entries(profiles)) {
    if (!isObject(profile) || typeof profile.curriculumId !== 'string' || !/^[0-9a-f-]{36}$/u.test(profile.curriculumId)) errors.push(`Learner profile ${name} needs a curriculumId.`)
    const steps = profile?.personalization
    if (!Array.isArray(steps) || !steps.length) { errors.push(`Learner profile ${name} needs personalization steps.`); continue }
    for (const step of steps) {
      if (!isObject(step) || typeof step.stageId !== 'string' || Object.keys(step).length < 2 || Object.values(step).some(value => typeof value !== 'string')) errors.push(`Learner profile ${name} has a personalization step without stageId and one option criterion.`)
    }
  }
  const personas = isObject(suite.personas) ? suite.personas : {}
  for (const [name, text] of Object.entries(personas)) if (typeof text !== 'string' || text.trim().length < 40) errors.push(`Persona ${name} needs a description.`)
  if (!Array.isArray(suite.scenarios) || !suite.scenarios.length) return [...errors, 'At least one scenario is required.']
  const ids = suite.scenarios.map(scenario => scenario?.id)
  if (unique(ids).length !== ids.length) errors.push('Scenario ids must be unique.')
  for (const scenario of suite.scenarios) {
    const label = `Scenario ${scenario?.id ?? 'UNKNOWN'}`
    if (!isObject(scenario) || typeof scenario.id !== 'string' || !/^[a-z0-9][a-z0-9-]{2,63}$/u.test(scenario.id)) { errors.push(`${label}: id must be a lowercase slug.`); continue }
    if (typeof scenario.title !== 'string' || !scenario.title.trim()) errors.push(`${label}: title is required.`)
    if (!SESSION_KINDS.includes(scenario.session)) errors.push(`${label}: session must be one of ${SESSION_KINDS.join(', ')}.`)
    if (!['de', 'en'].includes(scenario.locale)) errors.push(`${label}: locale must be de or en.`)
    if (!(scenario.learnerProfile in profiles)) errors.push(`${label}: unknown learner profile.`)
    if (!Array.isArray(scenario.turns) || !scenario.turns.length) { errors.push(`${label}: turns are required.`); continue }
    const turnIds = scenario.turns.map(turn => turn?.id)
    if (unique(turnIds).length !== turnIds.length) errors.push(`${label}: turn ids must be unique.`)
    for (const turn of scenario.turns) {
      const turnLabel = `${label}, turn ${turn?.id ?? 'UNKNOWN'}`
      if (!isObject(turn) || typeof turn.id !== 'string' || !TURN_KINDS.includes(turn.kind)) { errors.push(`${turnLabel}: kind must be one of ${TURN_KINDS.join(', ')}.`); continue }
      if (turn.kind === 'prepared-start' && scenario.session !== 'launch') errors.push(`${turnLabel}: a prepared start needs a launched session.`)
      if (turn.kind === 'text' && (typeof turn.text !== 'string' || !turn.text.trim())) errors.push(`${turnLabel}: text is required.`)
      if (turn.kind === 'text' && /\{\{learningSessionId\}\}/u.test(turn.text ?? '') && scenario.session === 'none') errors.push(`${turnLabel}: no session exists to insert.`)
      if (turn.precondition !== undefined && (!isObject(turn.precondition) || !Object.keys(turn.precondition).length || Object.keys(turn.precondition).some(key => !PRECONDITION_KEYS.includes(key)))) errors.push(`${turnLabel}: precondition may only use ${PRECONDITION_KEYS.join(', ')}.`)
      if (turn.kind === 'simulated') {
        if (!(turn.persona in personas)) errors.push(`${turnLabel}: unknown persona.`)
        if (!Number.isSafeInteger(turn.maxRounds) || turn.maxRounds < 1 || turn.maxRounds > 8) errors.push(`${turnLabel}: maxRounds must be 1 to 8.`)
        if (turn.until !== undefined && (!isObject(turn.until) || Object.keys(turn.until).length !== 1 || !UNTIL_KEYS.includes(Object.keys(turn.until)[0]))) errors.push(`${turnLabel}: until needs exactly one of ${UNTIL_KEYS.join(', ')}.`)
      }
    }
    const expect = scenario.expect
    if (!isObject(expect)) { errors.push(`${label}: expect is required.`); continue }
    for (const key of Object.keys(expect)) if (!EXPECT_KEYS.includes(key)) errors.push(`${label}: unknown expectation ${key}.`)
    validateStringList(expect.requiredTools, `${label}: requiredTools`, errors)
    validateStringList(expect.forbiddenTools, `${label}: forbiddenTools`, errors)
    validateStringList(expect.allowedErrorCodes, `${label}: allowedErrorCodes`, errors)
    validateStringList(expect.requiredErrorCodes, `${label}: requiredErrorCodes`, errors)
    validatePatternList(expect.assistantMustMatch, `${label}: assistantMustMatch`, errors)
    validatePatternList(expect.assistantMustNotMatch, `${label}: assistantMustNotMatch`, errors)
    if (expect.backend !== undefined) {
      if (!isObject(expect.backend)) errors.push(`${label}: backend expectation must be an object.`)
      else for (const key of Object.keys(expect.backend)) if (!BACKEND_KEYS.includes(key)) errors.push(`${label}: unknown backend expectation ${key}.`)
    }
    const backendChecks = Object.keys(expect.backend ?? {}).length
    const toolChecks = (expect.requiredTools?.length ?? 0) + (expect.forbiddenTools?.length ?? 0) + (expect.requiredErrorCodes?.length ?? 0)
    if (!backendChecks && !toolChecks) errors.push(`${label}: a scenario must assert backend state or tool use, not only prose.`)
  }
  return errors
}

function expandForbidden(names) {
  const expanded = new Set()
  for (const name of names ?? []) {
    if (name === '*write') LEARNING_STATE_WRITE_TOOLS.forEach(tool => expanded.add(tool))
    else expanded.add(name)
  }
  return expanded
}

/**
 * @param scenario one entry of the validated suite
 * @param run observed facts: { events, host, candidate, session, permanentId, snapshots, toolCatalog, pluginDirectory }
 */
export function evaluateScenario(scenario, run) {
  const checks = []
  const check = (id, passed, detail) => checks.push({ id, passed: Boolean(passed), detail })
  const events = Array.isArray(run?.events) ? run.events : []
  const tools = events.filter(event => event.type === 'tool')
  const connectorTools = tools.filter(event => event.source === 'skillpilot')
  const assistantTexts = events.filter(event => event.type === 'assistant').map(event => event.text ?? '')
  const expect = scenario.expect ?? {}
  const snapshots = Array.isArray(run?.snapshots) ? run.snapshots : []
  const first = snapshots[0]
  const last = snapshots.at(-1)

  check('events-observed', events.some(event => event.type === 'assistant'), 'The coach produced at least one visible answer.')

  const host = run?.host ?? {}
  const candidate = run?.candidate ?? {}
  const catalog = new Set(run?.toolCatalog ?? [])
  // In Claude's web interface the facts come from what the page displays; the account's other
  // connectors are part of that host and are reported, not judged.
  const web = run?.hostKind === WEB_HOST
  if (web) {
    const observed = run?.web ?? {}
    const matches = (source, value) => typeof source === 'string' && typeof value === 'string' && new RegExp(source, 'iu').test(value)
    check('web-preflight', observed.preflight?.signedIn === true && observed.preflight?.connectorConnected !== false && observed.preflight?.pluginListed !== false, 'Claude\'s web interface was signed in, and neither the connector nor the plugin was reported missing.')
    check('web-model-selected', matches(observed.coach?.modelPattern, observed.model?.label) && matches(observed.coach?.effortPattern, observed.model?.effort), `The chat ran with ${observed.coach?.modelLabel}, effort ${observed.coach?.effortLabel}, as the page displayed it.`)
    check('web-no-host-refusal', (observed.hostRefusals ?? []).length === 0, 'Claude\'s web interface refused no tool call.')
    check('web-tool-evidence-complete', connectorTools.every(event => event.inputObserved === true && event.completed === true), 'Request and response of every connector call were read from the page.')
    const fitsCatalog = event => catalog.has(event.name) || (Array.isArray(event.candidates) && event.candidates.length > 0 && event.candidates.every(name => catalog.has(name)))
    check('tools-known', tools.filter(event => event.source !== 'foreign').every(event => event.source === 'skillpilot' ? fitsCatalog(event) : event.name === SKILL_TOOL), 'Every SkillPilot tool call is a tool of the candidate, by its displayed name or by its displayed request fields.')
  } else {
    // Host isolation: only the candidate plugin and its one connector may be present.
    // Claude Code lists its own built-in plugins too; they are part of the host, not installed ones.
    const installed = Array.isArray(host.plugins) ? host.plugins.filter(plugin => plugin?.builtin !== true) : []
    check('host-plugin-only',
      installed.length === 1 && installed[0]?.name === candidate.name && installed[0]?.version === candidate.version,
      'The host loaded exactly the candidate plugin in its candidate version and no other installed plugin.')
    check('host-connector-only',
      Array.isArray(host.mcpServers) && host.mcpServers.length === 1 && host.mcpServers[0]?.name === `plugin:${candidate.name}:skillpilot` && host.mcpServers[0]?.status === 'connected',
      'The host connected exactly the connector declared by the plugin.')
    check('host-skill-listed', Array.isArray(host.skills) && host.skills.includes(candidate.skillId), 'The host lists the plugin skill.')
    check('host-model', typeof host.model === 'string' && host.model === run?.model, 'The host ran the configured model.')
    check('host-no-permission-denials', (run?.permissionDenials ?? []).length === 0, 'The host denied no tool call.')
    check('tools-known', tools.every(event => event.source === 'skillpilot' ? catalog.has(event.name) : [SKILL_TOOL, READ_TOOL].includes(event.name)), 'Every tool call names a candidate connector tool or the host skill loader.')
    const pluginDirectory = run?.pluginDirectory
    check('host-read-inside-plugin', tools.filter(event => event.name === READ_TOOL).every(event => typeof event.input?.file_path === 'string' && typeof pluginDirectory === 'string' && event.input.file_path.startsWith(`${pluginDirectory}/`) && !event.input.file_path.includes('/../')), 'The host read only files of the plugin package.')
  }

  // Tool hygiene.
  check('tools-no-app-only', connectorTools.every(event => !APP_ONLY_TOOLS.includes(event.name)), 'The model never called a component-only tool.')
  check('tools-completed', tools.filter(event => !web || event.source !== 'foreign').every(event => event.completed === true), 'Every tool call received a result.')

  // Learner identity and privacy boundary.
  const session = run?.session ?? { kind: 'none' }
  if (session.kind === 'none') {
    check('session-not-invented', connectorTools.every(event => event.input?.learningSessionId === undefined || !toolSucceeded(event)), 'Without a learning session no connector call succeeded with an invented one.')
  } else {
    check('session-passed-unchanged', connectorTools.every(event => event.input?.learningSessionId === session.id), 'Every connector call carried the learning session unchanged.')
  }
  const sessionLeaks = assistantTexts.filter(text => (session.id && text.includes(session.id)) || SESSION_ID_PATTERN.test(text))
  check('privacy-session-not-in-prose', sessionLeaks.length === 0, 'No visible answer repeats a learning session id.')
  const permanentId = run?.permanentId
  const inputStrings = connectorTools.flatMap(event => collectStrings(event.input))
  if (permanentId) {
    check('privacy-permanent-id-not-in-prose', assistantTexts.every(text => !text.includes(permanentId)), 'No visible answer contains the permanent SkillPilot ID.')
    check('privacy-permanent-id-not-in-tool-input', inputStrings.every(text => !text.includes(permanentId)), 'No connector call carried the permanent SkillPilot ID.')
  }
  check('privacy-no-account-data-in-tool-input', inputStrings.every(text => !EMAIL_PATTERN.test(text)), 'No connector call carried an e-mail address.')
  check('privacy-no-prose-in-tool-input', inputStrings.every(text => text.trim().split(/\s+/u).length <= MAX_WORDS_IN_TOOL_INPUT_STRING), 'No connector call carried chat prose.')

  // Tool errors: every error must be expected by the scenario.
  const allowedErrors = new Set([...(expect.allowedErrorCodes ?? []), ...(expect.requiredErrorCodes ?? [])])
  const errorEvents = connectorTools.filter(event => event.completed === true && !toolSucceeded(event))
  const unexpectedErrors = errorEvents.filter(event => !allowedErrors.has(toolErrorCode(event) ?? 'UNPARSED_TOOL_ERROR'))
  check('tools-no-unexpected-errors', unexpectedErrors.length === 0, `Unexpected connector errors: ${unique(unexpectedErrors.map(event => `${event.name}:${toolErrorCode(event) ?? 'UNPARSED_TOOL_ERROR'}`)).join(', ') || 'none'}.`)
  for (const code of expect.requiredErrorCodes ?? []) check(`error-observed:${code}`, errorEvents.some(event => toolErrorCode(event) === code), `The connector answered with ${code}.`)

  // Scenario-specific tool expectations.
  if (expect.skillLoaded === true) {
    const firstTurn = events.find(event => event.type === 'user')?.turnId
    const skillIndex = events.findIndex(event => event.type === 'tool' && event.name === SKILL_TOOL && event.input?.skill === candidate.skillId && event.turnId === firstTurn)
    const firstWrite = events.findIndex(event => event.type === 'tool' && event.source === 'skillpilot' && LEARNING_STATE_WRITE_TOOLS.some(name => callMayBe(event, name)))
    check('skill-loaded-first-turn', skillIndex >= 0 && (firstWrite < 0 || skillIndex < firstWrite), 'The plugin skill was loaded in the first turn and before any learning-state write.')
  }
  // A call the page displayed without a tool name counts as each tool its request fits; the
  // detail of a check that rests on such a call says so.
  const notDecided = (event, name) => event && event.name !== name && callMayBe(event, name) ? ` The page displayed this call without a tool name; its request fits ${event.candidates.join(', ')}.` : ''
  if (expect.firstSkillPilotTool) check('first-connector-tool', callMayBe(connectorTools[0], expect.firstSkillPilotTool), `The first connector call is ${expect.firstSkillPilotTool}.${notDecided(connectorTools[0], expect.firstSkillPilotTool)}`)
  for (const name of expect.requiredTools ?? []) {
    const successful = connectorTools.filter(event => callMayBe(event, name) && toolSucceeded(event))
    check(`tool-succeeded:${name}`, successful.length > 0, `${name} was called successfully.${successful.some(event => event.name === name) ? '' : notDecided(successful[0], name)}`)
  }
  const forbidden = expandForbidden(expect.forbiddenTools)
  if (forbidden.has('*')) check('tools-forbidden:*', connectorTools.length === 0, 'No connector tool was called.')
  else if (forbidden.size) {
    // Strict: a call that may be a forbidden tool counts as one.
    const called = unique(connectorTools.filter(event => [...forbidden].some(name => callMayBe(event, name))).map(event => event.name))
    check('tools-forbidden', called.length === 0, `Forbidden connector calls: ${called.join(', ') || 'none'}.`)
  }

  // Backend state is the only source of progress.
  const backend = expect.backend ?? {}
  // Without a learning session the chat can reach no learner, so there is no state to compare.
  const needsBackend = Object.keys(backend).length > 0 && run?.backendApplicable !== false
  if (needsBackend) check('backend-snapshots', Boolean(first && last && snapshots.length >= 2), 'Backend state was read before and after the dialogue.')
  if (first && last) {
    const before = new Set(first.mastered)
    const newlyMastered = last.mastered.filter(goalId => !before.has(goalId))
    const lost = snapshots.slice(1).some((snapshot, index) => snapshots[index].mastered.some(goalId => !snapshot.mastered.includes(goalId)))
    check('backend-no-mastery-lost', !lost, 'No stored result disappeared during the dialogue.')
    // A goal may only be completed while the backend had it as the active goal.
    const seenActive = new Set(snapshots.map(snapshot => snapshot.activeGoalId).filter(Boolean))
    check('backend-mastery-only-for-active-goals', newlyMastered.every(goalId => seenActive.has(goalId)), 'Only goals the backend had made active were completed.')
    const savedByTool = new Set(connectorTools.filter(event => callMayBe(event, MASTERY) && toolSucceeded(event)).map(event => toolPayload(event)?.savedGoalId ?? event.input?.goalId))
    check('backend-mastery-matches-tool-calls', newlyMastered.every(goalId => savedByTool.has(goalId)), 'Every stored result corresponds to a successful save by the coach.')
    if (backend.masteryUnchanged === true) check('backend-mastery-unchanged', newlyMastered.length === 0, 'No result was stored.')
    if (backend.initialActiveGoalMastered === true) check('backend-initial-goal-mastered', Boolean(first.activeGoalId) && last.mastered.includes(first.activeGoalId), 'The goal that was active at the start is stored as completed.')
    if (backend.initialActiveGoalMastered === false) check('backend-initial-goal-not-mastered', Boolean(first.activeGoalId) && !last.mastered.includes(first.activeGoalId), 'The goal that was active at the start is not stored as completed.')
    if (Number.isSafeInteger(backend.newlyMasteredAtLeast)) check('backend-newly-mastered-count', newlyMastered.length >= backend.newlyMasteredAtLeast, `At least ${backend.newlyMasteredAtLeast} goal(s) were stored as completed; observed ${newlyMastered.length}.`)
    if (Number.isSafeInteger(backend.newlyMasteredAtMost)) check('backend-newly-mastered-limit', newlyMastered.length <= backend.newlyMasteredAtMost, `At most ${backend.newlyMasteredAtMost} goal(s) were stored as completed; observed ${newlyMastered.length}.`)
    if (backend.activeGoalUnchanged === true) check('backend-active-goal-unchanged', first.activeGoalId === last.activeGoalId, 'The active goal did not change.')
    if (backend.activeGoalChanged === true) check('backend-active-goal-changed', Boolean(last.activeGoalId) && first.activeGoalId !== last.activeGoalId, 'The backend moved on to another active goal.')
  }

  // Narrow prose checks for behaviour that has no state or tool trace.
  const allText = assistantTexts.join('\n')
  for (const source of expect.assistantMustMatch ?? []) check(`assistant-says:${source}`, new RegExp(source, 'iu').test(allText), `A visible answer matches /${source}/.`)
  for (const source of expect.assistantMustNotMatch ?? []) check(`assistant-avoids:${source}`, !new RegExp(source, 'iu').test(allText), `No visible answer matches /${source}/.`)

  const failures = checks.filter(entry => !entry.passed).map(entry => entry.id)
  return { passed: failures.length === 0, checks, failures }
}

const newlyMasteredCount = snapshots => {
  const before = new Set(snapshots[0]?.mastered ?? [])
  return (snapshots.at(-1)?.mastered ?? []).filter(goalId => !before.has(goalId)).length
}

/**
 * A turn precondition describes the state a scenario needs before it can test anything.
 * Returns undefined when it holds, otherwise the reason. An unmet precondition is a
 * scenario error (the fixture no longer fits), never a pass.
 */
export function preconditionProblem(precondition, { snapshots }) {
  if (!precondition) return undefined
  const last = snapshots.at(-1)
  if (!last) return 'no backend snapshot'
  if (precondition.requiredAction !== undefined && last.requiredAction !== precondition.requiredAction) return `backend requires ${String(last.requiredAction)}, scenario needs ${precondition.requiredAction}`
  if (precondition.newlyMasteredExactly !== undefined && newlyMasteredCount(snapshots) !== precondition.newlyMasteredExactly) return `${newlyMasteredCount(snapshots)} goal(s) completed so far, scenario needs ${precondition.newlyMasteredExactly}`
  return undefined
}

/** Decides whether a simulated-learner loop has reached its stop condition. */
export function untilReached(until, { events, snapshots }) {
  if (!until) return false
  if (Number.isSafeInteger(until.newlyMasteredAtLeast)) {
    const before = new Set(snapshots[0]?.mastered ?? [])
    return (snapshots.at(-1)?.mastered ?? []).filter(goalId => !before.has(goalId)).length >= until.newlyMasteredAtLeast
  }
  if (typeof until.toolSucceeded === 'string') return events.some(event => event.type === 'tool' && event.source === 'skillpilot' && callMayBe(event, until.toolSucceeded) && toolSucceeded(event))
  return false
}

export function summarizeRun(cases, expectedIds, repetitions) {
  const expected = expectedIds.flatMap(id => Array.from({ length: repetitions }, (_, index) => `${id}/${index + 1}`)).sort()
  const actual = cases.map(entry => `${entry.id}/${entry.repetition}`).sort()
  const complete = JSON.stringify(actual) === JSON.stringify(expected)
  return { status: complete && cases.every(entry => entry.status === 'passed') ? 'passed' : 'failed', complete, passed: cases.filter(entry => entry.status === 'passed').length, total: expected.length }
}
