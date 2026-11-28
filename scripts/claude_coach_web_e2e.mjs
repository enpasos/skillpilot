/**
 * Test of the SkillPilot coach through Claude's web interface (claude.ai).
 *
 * Test-only; never imported by the runtime. A browser agent (Claude Code on Windows with Claude
 * in Chrome) is the hands and eyes: it types what this program hands it and reports what the
 * page shows. This program decides every learner message, creates and removes the synthetic
 * learner, reads the learner's state through the first-party routes and gives the verdict.
 * docs/qa-ci/claude-coach-web-e2e.md states what a pass shows and what it does not.
 */
import assert from 'node:assert/strict'
import { createHash, randomBytes, randomInt } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { closeSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BackendClient, childEnvironment, compareVersions, learnerSay, readCandidate, renderTranscript, resolveCli, sanitizeReport } from './claude_plugin_e2e.mjs'
import { APP_ONLY_TOOLS, WEB_HOST, evaluateScenario, preconditionProblem, summarizeRun, untilReached, validateSuite } from './claude_plugin_e2e_assertions.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SUITE = 'ai/claude/plugin-e2e/scenarios.json'
const DRIVER = 'ai/claude/plugin-e2e/web-driver.md'
const CONFIG = 'scripts/config/claude-coach-web-e2e.json'
const CONTRACT = 'ai/claude/plugin/skillpilot-coach-v1/release/contract-baseline.json'
const TOOL_INPUTS = 'ai/claude/plugin-e2e/tool-inputs.json'
const RUNS_DIR = 'tmp/claude-coach-web-e2e/runs'
const LAYER = 'claude-ai-web-interface-with-public-backend'
const HARNESS = ['scripts/claude_coach_web_e2e.mjs', 'scripts/claude_plugin_e2e.mjs', 'scripts/claude_plugin_e2e_assertions.mjs', CONFIG, SUITE, DRIVER, TOOL_INPUTS]
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const RESULT_FIELDS = ['status', 'errorCode', 'message', 'stateVersion', 'savedGoalId', 'savedMastery', 'confirmed']
const USAGE = 'Usage: node scripts/claude_coach_web_e2e.mjs check | run [--scenario ID]... [--claude-bin PATH] [--windows-claude WINDOWS_PATH] [--no-launch] [--keep-learners] | step --run ID [obs-N.json] | finish --run ID'

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const sha = data => createHash('sha256').update(data).digest('hex')
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const isStringList = value => Array.isArray(value) && value.every(item => typeof item === 'string')

export function validateWebConfig(config) {
  assert.ok(isObject(config) && config.schemaVersion === 1, 'Unsupported configuration schemaVersion')
  assert.match(String(config.origin), /^https:\/\/[a-z0-9.-]+$/u, 'origin must be an https origin without a path')
  assert.equal(config.chatUrl, 'https://claude.ai/new', 'chatUrl must be the address the web start opens')
  assert.ok(isObject(config.agent) && isObject(config.coach), 'agent and coach are required')
  for (const [label, value] of [['agent.model', config.agent.model], ['learnerModel', config.learnerModel]]) assert.match(String(value), /^claude-[a-z0-9-]{3,60}$/u, `Invalid ${label}`)
  assert.ok(EFFORTS.includes(config.agent.effort), 'Invalid agent.effort')
  assert.match(String(config.agent.minimumCliVersion), /^\d+\.\d+\.\d+$/u, 'Invalid agent.minimumCliVersion')
  for (const key of ['modelLabel', 'effortLabel', 'modelPattern', 'effortPattern']) assert.ok(typeof config.coach[key] === 'string' && config.coach[key].trim(), `coach.${key} is missing`)
  for (const key of ['modelPattern', 'effortPattern']) assert.doesNotThrow(() => new RegExp(config.coach[key], 'iu'), `coach.${key} is not a pattern`)
  // The patterns must accept the labels this program asks the agent to select.
  assert.match(config.coach.modelLabel, new RegExp(config.coach.modelPattern, 'iu'), 'coach.modelPattern rejects coach.modelLabel')
  assert.match(config.coach.effortLabel, new RegExp(config.coach.effortPattern, 'iu'), 'coach.effortPattern rejects coach.effortLabel')
  assert.ok(Number.isSafeInteger(config.learnerTimeoutMs) && config.learnerTimeoutMs >= 10_000 && config.learnerTimeoutMs <= 600_000, 'Invalid learnerTimeoutMs')
  assert.ok(Number.isSafeInteger(config.answerTimeoutMinutes) && config.answerTimeoutMinutes >= 1 && config.answerTimeoutMinutes <= 15, 'Invalid answerTimeoutMinutes')
  return config
}

/** The connector tools the model may call, as the plugin candidate's contract names them. */
export function readToolCatalog(repositoryRoot = root) {
  const contract = readJson(resolve(repositoryRoot, CONTRACT)).remoteContract
  const names = [...(contract?.tools ?? []), ...(contract?.optionalCompletionTools ?? [])]
  assert.ok(names.length >= 10 && names.every(name => typeof name === 'string'), 'The plugin contract names no connector tools')
  return names.filter(name => !APP_ONLY_TOOLS.includes(name)).sort()
}

/** The input field names of every connector tool the model may call; the file states its purpose. */
export function readToolInputs(repositoryRoot = root, catalog = readToolCatalog(repositoryRoot)) {
  const file = readJson(resolve(repositoryRoot, TOOL_INPUTS))
  assert.ok(isObject(file) && file.schemaVersion === 1 && isObject(file.tools), 'Unsupported tool input list')
  assert.deepEqual(Object.keys(file.tools).sort(), catalog, 'The tool input list and the plugin contract name different connector tools')
  for (const [name, entry] of Object.entries(file.tools)) {
    assert.ok(isObject(entry) && isStringList(entry.required) && isStringList(entry.optional) && entry.required.includes('learningSessionId'), `Invalid input list of ${name}`)
    assert.equal(new Set([...entry.required, ...entry.optional]).size, entry.required.length + entry.optional.length, `An input of ${name} is named twice`)
    assert.ok(entry.resultMarker === undefined || /^[A-Za-z][A-Za-z0-9]{2,40}$/u.test(entry.resultMarker), `Invalid resultMarker of ${name}`)
  }
  return file.tools
}

const FIRST_PARTY_ROUTES = [
  ['POST', /^\/api\/ui\/learners$/u],
  ['PUT', /^\/api\/ui\/learners\/[^/]+\/curriculum$/u],
  ['GET', /^\/api\/ui\/learners\/[^/]+\/personalization-plan$/u],
  ['POST', /^\/api\/ui\/learners\/[^/]+\/personalization-options$/u],
  ['POST', /^\/api\/ui\/learners\/[^/]+\/claude\/v1\/launch$/u],
  ['GET', /^\/api\/ui\/learners\/[^/]+\/(?:state|mastery)$/u],
  ['DELETE', /^\/api\/ui\/learners\/[^/]+$/u],
  ['GET', /^\/version\.json$/u],
]

/**
 * Production cannot carry the run: it is redeployed, or a deployment is building and the backend
 * offers no goals meanwhile. The run ends, and no scenario is judged by what happened then.
 */
export class ProductionNotReady extends Error {
  constructor(message) { super(message); this.name = 'ProductionNotReady' }
}

// A restarting backend answers 502 to 504 for a short while. Reads, the curriculum choice and
// deletions are repeated; a POST is never repeated, because it may have created something.
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000]
const transientFailure = error => /answered HTTP 50[234]$/u.test(error.message) || ['TimeoutError', 'AbortError'].includes(error.name) || error.message === 'fetch failed'
const serverFailure = error => /answered HTTP 5\d\d$/u.test(error.message) || transientFailure(error)
const shownPath = path => path.replace(/\/learners\/[^/]+/u, '/learners/[id]')

/**
 * The routes of the web app on the public backend, and only those this test needs. It deletes
 * only learners it created itself, and records each one in `created` (the run's list on disk,
 * through `save`) as soon as the backend has created it.
 */
export class FirstPartyClient extends BackendClient {
  constructor({ origin, fetchImpl = fetch, created = [], save = () => {}, deployment = null, retryDelaysMs = RETRY_DELAYS_MS, pause = ms => new Promise(resolvePause => setTimeout(resolvePause, ms)) }) {
    super({ config: { backend: { port: 0 } }, state: {}, fetchImpl })
    assert.match(String(origin), /^https:\/\/[a-z0-9.-]+$/u, 'The web test needs an https origin')
    this.origin = origin
    this.created = created
    this.save = save
    this.deployment = deployment
    this.retryDelaysMs = retryDelaysMs
    this.pause = pause
  }

  async json(method, path, body) {
    assert.ok(FIRST_PARTY_ROUTES.some(([allowed, pattern]) => allowed === method && pattern.test(path)), `The web test may not call ${method} ${shownPath(path)}`)
    let answer
    for (let attempt = 0; ; attempt += 1) {
      try { answer = await super.json(method, path, body); break } catch (error) {
        if (method !== 'POST' && attempt < this.retryDelaysMs.length && transientFailure(error)) { await this.pause(this.retryDelaysMs[attempt]); continue }
        // These routes are the web app's own; the coach plays no part in them, so a failure of
        // the server side says nothing about the coach.
        if (serverFailure(error)) throw new ProductionNotReady(/answered HTTP/u.test(error.message) ? `${error.message}; start a new run when production is stable` : `Backend ${method} ${shownPath(path)} could not be reached (${error.message}); start a new run when production is stable`)
        throw error
      }
    }
    const id = method === 'POST' && path === '/api/ui/learners' ? answer?.state?.skillpilotId : null
    if (typeof id === 'string' && !this.created.includes(id)) { this.created.push(id); this.save() }
    // The backend reports this while a deployment has replaced the curriculum files it started with.
    if (method === 'GET' && path.endsWith('/state') && answer?.levelCompletion?.notice === 'completion_generation_unavailable') throw new ProductionNotReady('The backend offers no goals because a deployment is building (completion_generation_unavailable); start a new run after the deployment')
    return answer
  }

  /** The build production serves, as the web app names it. */
  async deployed() {
    const version = await this.json('GET', '/version.json')
    assert.ok(typeof version?.buildId === 'string' && version.buildId, `${this.origin}/version.json names no build`)
    return { buildId: version.buildId, commit: typeof version.commit === 'string' ? version.commit : null }
  }

  /** Production still answers, with the build the run started with. */
  async ready() {
    if (!this.deployment) return
    const { buildId } = await this.deployed()
    if (buildId !== this.deployment.buildId) throw new ProductionNotReady(`Production was redeployed during the run (build ${this.deployment.buildId} at the start, ${buildId} now); start a new run`)
  }

  /** Every judged state comes from the build the run started with. */
  async snapshot(id) {
    await this.ready()
    return super.snapshot(id)
  }

  /**
   * A learner whose setup fails half way is deleted at once. If that fails too, it stays in
   * `created`, and the end of the run deletes it.
   */
  async createLearner(profile) {
    const before = new Set(this.created)
    try { return await super.createLearner(profile) } catch (error) {
      for (const id of this.created.filter(entry => !before.has(entry))) await this.deleteLearner(id).catch(() => {})
      throw error
    }
  }

  async deleteLearner(id) {
    assert.ok(this.created.includes(id), 'The web test deletes only learners it created')
    await this.json('DELETE', `/api/ui/learners/${id}`, { confirmationSkillpilotId: id })
    this.created.splice(this.created.indexOf(id), 1)
    this.save()
  }
}

const FABRICATED_ID_NOTE = 'The SkillPilot ID in this message was made up by the test program: it has the shape of a permanent ID, was never issued and opens no learning record. Type the message as it is.'

/** Same shape as a permanent ID, but never issued: each letter and digit is replaced at random. */
export function fabricatePermanentId(sample, pick = randomInt) {
  // An ID written in hexadecimal digits stays one.
  const letters = /[g-z]/iu.test(sample) ? 'abcdefghijklmnopqrstuvwxyz' : 'abcdef'
  const classes = ['0123456789', letters, letters.toUpperCase()]
  const replace = () => [...sample].map(character => { const alphabet = classes.find(entry => entry.includes(character)); return alphabet ? alphabet[pick(alphabet.length)] : character }).join('')
  assert.ok(typeof sample === 'string' && [...sample].filter(character => classes.some(entry => entry.includes(character))).length >= 8, 'The sample is too short to fabricate a look-alike')
  for (let attempt = 0; attempt < 5; attempt++) { const fabricated = replace(); if (fabricated !== sample) return fabricated }
  throw new Error('Could not fabricate a look-alike that differs from the sample')
}

/** Returns a list of problems; an empty list means the observation can be used. */
export function validateObservation(kind, raw) {
  if (!isObject(raw)) return ['The observation must be a JSON object.']
  if (typeof raw.blocked === 'string' && raw.blocked.trim()) return []
  const problems = []
  if (kind === 'preflight') {
    if (!isObject(raw.preflight) || typeof raw.preflight.signedIn !== 'boolean') return ['preflight.signedIn must be true or false.']
    for (const key of ['connectorConnected', 'pluginListed']) if (![true, false, null].includes(raw.preflight[key])) problems.push(`preflight.${key} must be true, false or null.`)
    return problems
  }
  if (typeof raw.assistantText !== 'string' || !raw.assistantText.trim()) problems.push('assistantText must be the visible answer of this turn.')
  if (kind === 'new-chat' && !(isObject(raw.model) && typeof raw.model.label === 'string' && typeof raw.model.effort === 'string')) problems.push('model.label and model.effort must be the labels the page displays for this chat.')
  for (const key of ['skillBlocks', 'hostRefusals', 'anomalies']) if (!isStringList(raw[key])) problems.push(`${key} must be a list of strings, empty when nothing was displayed.`)
  if (raw.connectorLoads !== undefined && !isStringList(raw.connectorLoads)) problems.push('connectorLoads must be a list of the displayed loading rows.')
  if (!Array.isArray(raw.permissionPrompts)) problems.push('permissionPrompts must be a list, empty when nothing was asked.')
  if (!Array.isArray(raw.toolCalls)) return [...problems, 'toolCalls must be a list, empty when no tool call was displayed.']
  raw.toolCalls.forEach((call, index) => {
    const label = `toolCalls[${index}]`
    if (!isObject(call) || typeof call.label !== 'string' || !call.label.trim()) { problems.push(`${label}.label must be the label as displayed.`); return }
    if (call.name !== null && typeof call.name !== 'string') problems.push(`${label}.name must be a tool name or null.`)
    if (call.connector !== null && typeof call.connector !== 'string') problems.push(`${label}.connector must be a name or null.`)
    if (call.request !== null && !isObject(call.request)) problems.push(`${label}.request must be the displayed request as a JSON object, or null.`)
    if (call.responseFields !== null && !isObject(call.responseFields)) problems.push(`${label}.responseFields must be a JSON object or null.`)
    if (call.responsePreview !== null && typeof call.responsePreview !== 'string') problems.push(`${label}.responsePreview must be text or null.`)
    if (![true, false, null].includes(call.isError)) problems.push(`${label}.isError must be true, false or null.`)
    if (![true, false, undefined].includes(call.responseTruncated)) problems.push(`${label}.responseTruncated must be true or false.`)
    if (call.responseTopLevel !== undefined && call.responseTopLevel !== null && !isStringList(call.responseTopLevel)) problems.push(`${label}.responseTopLevel must be a list of the displayed field names or null.`)
  })
  return problems
}

const normalize = text => text.toLowerCase().replace(/[^a-z0-9]+/gu, '_').replace(/^_+|_+$/gu, '')
const namesSkillPilot = text => /skill[\s_-]*pilot/iu.test(text)

/** The technical name of a displayed tool call, or null when the label fits no tool. */
export function resolveToolName(call, catalog) {
  const known = [...catalog, ...APP_ONLY_TOOLS]
  if (typeof call.name === 'string' && known.includes(call.name.trim())) return call.name.trim()
  for (const text of [call.name, call.label]) {
    if (typeof text !== 'string') continue
    const hits = known.filter(name => normalize(text).includes(name))
    if (hits.length) return hits.sort((left, right) => right.length - left.length)[0]
  }
  return null
}

const squash = text => text.toLowerCase().replace(/[^a-z0-9]+/gu, '')
const technicalNames = (fields, names) => {
  const known = new Map(names.map(name => [squash(name), name]))
  const mapped = {}
  const unknown = []
  for (const [key, value] of Object.entries(fields)) {
    const name = known.get(squash(key))
    if (name === undefined) { unknown.push(key); mapped[key] = value } else mapped[name] = value
  }
  return { fields: mapped, unknown }
}

/**
 * The displayed request with the connector's own field names. The page may reword a name
 * ("Learning session id"); a field that fits no input of any tool is returned in `unknown`.
 */
export function technicalRequest(request, inputs) {
  return technicalNames(request, Object.values(inputs).flatMap(entry => [...entry.required, ...entry.optional]))
}

/** The tools whose inputs fit a request: every required field present, no field unknown to the tool. */
export function toolsFittingRequest(fields, inputs) {
  const keys = Object.keys(fields)
  return Object.entries(inputs).filter(([, entry]) => entry.required.every(name => keys.includes(name)) && keys.every(key => entry.required.includes(key) || entry.optional.includes(key))).map(([name]) => name).sort()
}

/**
 * Which tool a displayed call is. The displayed name decides. Where the page shows none, the
 * request decides if exactly one tool fits it, and among several fitting tools the one whose
 * result marker the displayed response carries. Otherwise the call stays undecided and
 * `candidates` names the tools that fit.
 */
export function identifyToolCall(call, { catalog, inputs }) {
  const request = isObject(call.request) ? technicalRequest(call.request, inputs) : { fields: {}, unknown: [] }
  const named = resolveToolName(call, catalog)
  if (named) return { name: named, identifiedBy: 'displayed-name', candidates: [named], request }
  const candidates = isObject(call.request) && !request.unknown.length ? toolsFittingRequest(request.fields, inputs) : []
  if (candidates.length === 1) return { name: candidates[0], identifiedBy: 'request-fields', candidates, request }
  const displayed = new Set([...(isStringList(call.responseTopLevel) ? call.responseTopLevel : []), ...Object.keys(isObject(call.responseFields) ? call.responseFields : {})].map(squash))
  const marked = candidates.filter(name => inputs[name].resultMarker && displayed.has(squash(inputs[name].resultMarker)))
  if (marked.length === 1) return { name: marked[0], identifiedBy: 'request-and-result-fields', candidates: marked, request }
  return { name: null, identifiedBy: null, candidates, request }
}

/** Turns one observed chat turn into the event model the checks read. */
export function observationEvents(observation, turnId, { catalog, inputs, candidate }) {
  const events = []
  // The page gives no order between a skill block and the tool blocks that this program could
  // rely on: a skill block counts as loaded at the start of the turn it appears in.
  for (const label of observation.skillBlocks) {
    if (namesSkillPilot(label)) events.push({ type: 'tool', turnId, source: 'host', name: 'Skill', label: label.slice(0, 200), input: { skill: candidate.skillId }, completed: true, evidence: 'page' })
  }
  for (const call of observation.toolCalls) {
    const identity = identifyToolCall(call, { catalog, inputs })
    const own = identity.name !== null || namesSkillPilot(`${call.connector ?? ''} ${call.label} ${call.name ?? ''}`)
    const preview = typeof call.responsePreview === 'string' ? call.responsePreview : ''
    const result = isObject(call.responseFields) ? Object.fromEntries(Object.entries(technicalNames(call.responseFields, RESULT_FIELDS).fields).filter(([key]) => RESULT_FIELDS.includes(key))) : {}
    // An error the page displays must not be lost because a field was not copied. The page shows
    // a response as JSON or as a list of reworded field names.
    const errorCode = (/"errorCode"\s*:\s*"([A-Z0-9_]+)"/u.exec(preview) ?? /^\s*Error code:\s*"?([A-Z0-9_]+)/imu.exec(preview))?.[1]
    if (errorCode && !result.errorCode) result.errorCode = errorCode
    if ((/"status"\s*:\s*"ERROR"/u.test(preview) || /^\s*Status:\s*"?ERROR\b/imu.test(preview)) && !result.status) result.status = 'ERROR'
    events.push({
      type: 'tool', turnId, source: own ? 'skillpilot' : 'foreign', name: identity.name ?? (own ? `unidentified:${call.label.slice(0, 80)}` : call.label.slice(0, 80)), label: call.label.slice(0, 200),
      ...(own ? { identifiedBy: identity.identifiedBy, candidates: identity.candidates, unknownRequestFields: identity.request.unknown } : {}),
      input: own ? identity.request.fields : (isObject(call.request) ? call.request : {}), inputObserved: isObject(call.request), completed: isObject(call.responseFields) || preview.length > 0,
      isError: call.isError === true, result, resultPreview: preview.slice(0, 1200), resultTruncated: call.responseTruncated === true, evidence: 'page',
    })
  }
  events.push({ type: 'assistant', turnId, text: observation.assistantText })
  return events
}

// --- The run: one state, advanced by one observation at a time ------------------------------

export function createRun({ runId, scenarioIds, selection, bindings, exchangeDir = null, path = null, cliPath = null, keepLearners = false }) {
  return { schemaVersion: 1, runId, status: 'running', startedAt: new Date().toISOString(), selection, scenarioIds, index: 0, counter: 0, pending: null, preflight: null, cases: {}, learners: [], cleanupProblems: [], bindings, exchangeDir, path, cliPath, keepLearners }
}

const caseSecrets = entry => [[entry?.learnerId, '[permanent-id]'], [entry?.offeredId, '[offered-id-look-alike]'], [entry?.session?.id, '[learning-session]']].filter(([secret]) => secret)

// The public client records a learner in `state.learners` itself, before its setup goes on; the
// list is changed in place because the client holds it.
async function createLearner(state, deps, profile) {
  const id = await deps.backend.createLearner(profile)
  // On disk before anything else can fail: a later process must be able to delete it.
  if (!state.learners.includes(id)) state.learners.push(id)
  deps.save?.()
  return id
}

async function deleteLearner(state, deps, id) {
  await deps.backend.deleteLearner(id)
  if (state.learners.includes(id)) state.learners.splice(state.learners.indexOf(id), 1)
  deps.save?.()
}

async function releaseCase(state, entry, deps) {
  if (!entry.learnerId || state.keepLearners || !state.learners.includes(entry.learnerId)) return
  try { await deleteLearner(state, deps, entry.learnerId) } catch (error) { state.cleanupProblems.push(`The test learner of ${entry.id} could not be deleted: ${error.message}`) }
}

async function startCase(scenario, state, deps) {
  const entry = { id: scenario.id, title: scenario.title, status: 'running', turnIndex: 0, round: 0, learnerId: null, offeredId: null, session: { kind: 'none' }, preparedPrompt: null, snapshots: [], events: [], model: null, skillBlocks: [], connectorLoads: [], permissionPrompts: [], hostRefusals: [], anomalies: [] }
  state.cases[scenario.id] = entry
  const profile = deps.suite.learnerProfiles[scenario.learnerProfile]
  if (scenario.session === 'launch') {
    entry.learnerId = await createLearner(state, deps, profile)
    const launch = await deps.backend.launch(entry.learnerId, scenario.locale)
    assert.ok(typeof launch?.learningSessionId === 'string' && launch.prompt?.includes(launch.learningSessionId), 'Launch returned no prepared start message')
    entry.session = { kind: 'launch', id: launch.learningSessionId }
    entry.preparedPrompt = launch.prompt
    entry.snapshots.push(await deps.backend.snapshot(entry.learnerId))
  } else if (scenario.session === 'fabricated') {
    // Never issued by the backend: the shape of a session id, but unknown to it.
    entry.session = { kind: 'fabricated', id: `spc_${randomBytes(32).toString('base64url')}` }
  }
  if (scenario.turns.some(turn => /\{\{permanentId\}\}/u.test(turn.text ?? ''))) {
    // Only the shape of a permanent ID may reach the chat. The sample learner is deleted again
    // and its ID is typed nowhere.
    const sample = entry.learnerId ?? await createLearner(state, deps, profile)
    if (!entry.learnerId) await deleteLearner(state, deps, sample)
    entry.offeredId = fabricatePermanentId(sample)
  }
  return entry
}

async function finishCase(state, entry, scenario, deps) {
  entry.deterministic = evaluateScenario(scenario, {
    hostKind: WEB_HOST, events: entry.events, candidate: deps.candidate, session: entry.session, permanentId: entry.offeredId ?? entry.learnerId,
    snapshots: entry.snapshots, toolCatalog: deps.toolCatalog, backendApplicable: Boolean(entry.learnerId),
    web: { preflight: state.preflight, model: entry.model, coach: deps.config.coach, hostRefusals: entry.hostRefusals },
  })
  entry.status = entry.deterministic.passed ? 'passed' : 'failed'
  await releaseCase(state, entry, deps)
}

/** The next learner message of a scenario, or null when the scenario is over. */
async function nextMessage(state, scenario, deps) {
  try {
    const entry = state.cases[scenario.id] ?? await startCase(scenario, state, deps)
    if (entry.status !== 'running') return null
    while (entry.turnIndex < scenario.turns.length) {
      const turn = scenario.turns[entry.turnIndex]
      const nextTurn = () => { entry.turnIndex += 1; entry.round = 0 }
      if (entry.round === 0) {
        const problem = preconditionProblem(turn.precondition, { snapshots: entry.snapshots })
        assert.ok(!problem, `Precondition of turn ${turn.id} not met (${problem}); the learner profile no longer leads to the state this scenario tests`)
      }
      let message
      if (turn.kind === 'simulated') {
        if (entry.round >= turn.maxRounds || (entry.round > 0 && untilReached(turn.until, { events: entry.events, snapshots: entry.snapshots }))) { nextTurn(); continue }
        message = await deps.say(deps.suite.personas[turn.persona], renderTranscript(entry.events, caseSecrets(entry)))
      } else {
        if (entry.round > 0) { nextTurn(); continue }
        message = turn.kind === 'prepared-start' ? entry.preparedPrompt : turn.text.replaceAll('{{learningSessionId}}', entry.session.id ?? '').replaceAll('{{permanentId}}', entry.offeredId ?? '')
      }
      entry.round += 1
      // The browser agent cannot know that the ID was made up, and would rightly refuse to type a real one.
      const note = entry.offeredId && message.includes(entry.offeredId) ? FABRICATED_ID_NOTE : undefined
      return { caseId: entry.id, turnId: turn.id, message, first: entry.events.length === 0, note }
    }
    await finishCase(state, entry, scenario, deps)
  } catch (error) {
    // Not the scenario's fault: the whole run ends.
    if (error instanceof ProductionNotReady) throw error
    const entry = state.cases[scenario.id] ??= { id: scenario.id, title: scenario.title, events: [], snapshots: [] }
    entry.status = 'error'
    entry.error = { turnId: scenario.turns[entry.turnIndex ?? 0]?.id ?? null, message: error.message }
    await releaseCase(state, entry, deps)
  }
  return null
}

function issue(state, kind, detail, deps) {
  state.counter += 1
  const action = { n: state.counter, action: kind, observationFile: `obs-${state.counter}.json` }
  if (kind !== 'send') action.url = deps.config.chatUrl
  if (kind === 'new-chat') action.model = { name: deps.config.coach.modelLabel, effort: deps.config.coach.effortLabel }
  if (kind !== 'preflight') Object.assign(action, { chat: state.index + 1, message: detail.message, answerTimeoutMinutes: deps.config.answerTimeoutMinutes, toolNames: deps.toolCatalog })
  if (detail?.note) action.note = detail.note
  state.pending = { kind, caseId: detail?.caseId ?? null, turnId: detail?.turnId ?? null, action }
  return action
}

async function applyObservation(state, observation, deps) {
  const { kind, caseId, turnId, action } = state.pending
  const stop = reason => { state.status = 'blocked'; state.error = `The browser agent could not continue: ${String(reason).slice(0, 400)}` }
  if (kind === 'preflight') {
    const seen = observation.preflight ?? {}
    state.preflight = { signedIn: seen.signedIn === true, connectorConnected: seen.connectorConnected ?? null, pluginListed: seen.pluginListed ?? null, notes: String(seen.notes ?? '').slice(0, 600) }
    if (observation.blocked) stop(observation.blocked)
    else if (!state.preflight.signedIn) stop('Claude\'s web interface is not signed in')
    return
  }
  const entry = state.cases[caseId]
  if (observation.blocked) {
    entry.status = 'error'
    entry.error = { turnId, message: `The browser agent could not continue: ${String(observation.blocked).slice(0, 400)}` }
    stop(observation.blocked)
    return
  }
  const events = [{ type: 'user', turnId, text: action.message }, ...observationEvents(observation, turnId, { catalog: deps.toolCatalog, inputs: deps.toolInputs, candidate: deps.candidate })]
  // Read the backend before anything is recorded: a failed read leaves the step repeatable. A
  // scenario without a learner is judged only while production still serves the run's build.
  const snapshot = entry.learnerId ? await deps.backend.snapshot(entry.learnerId) : null
  if (!entry.learnerId) await deps.backend.ready?.()
  entry.events.push(...events)
  if (snapshot) entry.snapshots.push(snapshot)
  if (kind === 'new-chat') entry.model = { label: observation.model.label.slice(0, 80), effort: observation.model.effort.slice(0, 80) }
  entry.skillBlocks.push(...observation.skillBlocks.map(label => label.slice(0, 200)))
  ;(entry.connectorLoads ??= []).push(...(observation.connectorLoads ?? []).map(label => label.slice(0, 200)))
  entry.hostRefusals.push(...observation.hostRefusals.map(text => text.slice(0, 400)))
  entry.anomalies.push(...observation.anomalies.map(text => text.slice(0, 400)))
  entry.permissionPrompts.push(...observation.permissionPrompts.map(prompt => ({ label: String(prompt?.label ?? '').slice(0, 200), choice: String(prompt?.choice ?? '').slice(0, 80) })))
}

/**
 * Takes the observation of the waiting action, if any, and returns the next action. An
 * observation that cannot be used returns the waiting action again with `problems`.
 */
export async function advance(state, observation, deps) {
  try { return await advanceRun(state, observation, deps) } catch (error) {
    if (!(error instanceof ProductionNotReady)) throw error
    state.status = 'production-not-ready'
    state.error = `Production was not ready: ${error.message}`
    return { n: state.counter + 1, action: 'done' }
  }
}

async function advanceRun(state, observation, deps) {
  if (state.pending) {
    if (observation === undefined) return state.pending.action
    const problems = validateObservation(state.pending.kind, observation)
    if (problems.length) return { ...state.pending.action, problems }
    await applyObservation(state, observation, deps)
    state.pending = null
  } else assert.equal(observation, undefined, 'No action is waiting for an observation')
  while (state.status === 'running') {
    if (!state.preflight) return issue(state, 'preflight', null, deps)
    const id = state.scenarioIds[state.index]
    if (id === undefined) { state.status = 'finished'; break }
    const next = await nextMessage(state, deps.suite.scenarios.find(scenario => scenario.id === id), deps)
    if (next) return issue(state, next.first ? 'new-chat' : 'send', next, deps)
    state.index += 1
  }
  return { n: state.counter + 1, action: 'done' }
}

/** How the connector calls of a scenario were told apart: the page does not name every tool. */
function toolIdentification(events) {
  const calls = events.filter(event => event.type === 'tool' && event.source === 'skillpilot')
  const count = how => calls.filter(event => event.identifiedBy === how).length
  return {
    byDisplayedName: count('displayed-name'), byRequestFields: count('request-fields'), byRequestAndResultFields: count('request-and-result-fields'),
    notDecided: calls.filter(event => !event.identifiedBy).map(event => ({ label: event.label, fits: event.candidates ?? [] })),
  }
}

/** Ends the run: nothing stays open, no test learner stays behind, and the report is built. */
export async function finalize(state, deps) {
  if (!state.finishedAt) {
    for (const id of state.scenarioIds) {
      const entry = state.cases[id] ??= { id, title: deps.suite.scenarios.find(scenario => scenario.id === id)?.title, status: 'error', events: [], snapshots: [], error: { turnId: null, message: 'The run ended before this scenario started' } }
      if (entry.status === 'running') { entry.status = 'error'; entry.error = { turnId: state.pending?.caseId === id ? state.pending.turnId : null, message: 'The run ended before this scenario finished' } }
    }
    if (!state.keepLearners) {
      for (const id of [...state.learners]) {
        try { await deleteLearner(state, deps, id) } catch (error) { state.cleanupProblems.push(`A test learner could not be deleted: ${error.message}`) }
      }
    }
    if (state.status === 'running') { state.status = 'aborted'; state.error ??= 'The browser agent ended before the run finished' }
    state.pending = null
    state.finishedAt = new Date().toISOString()
  }
  const secrets = Object.values(state.cases).flatMap(caseSecrets)
  const cases = state.scenarioIds.map(id => {
    const entry = state.cases[id]
    return {
      id, title: entry.title, status: entry.status, repetition: 1, layer: LAYER, model: entry.model ?? null, deterministic: entry.deterministic, error: entry.error,
      events: entry.events, snapshots: entry.snapshots, skillBlocks: entry.skillBlocks ?? [], connectorLoads: entry.connectorLoads ?? [], permissionPrompts: entry.permissionPrompts ?? [], hostRefusals: entry.hostRefusals ?? [], anomalies: entry.anomalies ?? [],
      foreignTools: [...new Set((entry.events ?? []).filter(event => event.type === 'tool' && event.source === 'foreign').map(event => event.name))],
      toolIdentification: toolIdentification(entry.events ?? []),
    }
  })
  const summary = summarizeRun(cases, state.scenarioIds, 1)
  let status = summary.status
  if (state.status !== 'finished' || state.cleanupProblems.length) status = 'error'
  // A partial selection is a diagnosis aid; only the whole suite can be reported as passed.
  else if (status === 'passed' && state.selection === 'partial') status = 'passed_partial_selection'
  return sanitizeReport({
    schemaVersion: 1, layer: LAYER, host: WEB_HOST, toolEvidence: 'as displayed by the page and reported by the browser agent',
    startedAt: state.startedAt, finishedAt: state.finishedAt, bindings: state.bindings, preflight: state.preflight, selection: state.selection,
    cases, ...summary, status, ...(state.error ? { error: state.error } : {}), cleanupProblems: state.cleanupProblems, learnersLeft: state.learners.length,
  }, secrets)
}

// --- Files, Windows and the command line -----------------------------------------------------

export function checkedWebSources(repositoryRoot = root) {
  const config = validateWebConfig(readJson(resolve(repositoryRoot, CONFIG)))
  const suite = readJson(resolve(repositoryRoot, SUITE))
  const problems = validateSuite(suite)
  assert.deepEqual(problems, [], `Scenario suite is invalid: ${problems.join(' ')}`)
  const driver = readFileSync(resolve(repositoryRoot, DRIVER), 'utf8')
  for (const term of ['step.cmd', 'observationFile', 'preflight', 'new-chat', 'blocked', 'toolCalls', 'responseFields', 'responseTopLevel', 'connectorLoads', 'responseTruncated', '`note`', '10 minutes']) assert.ok(driver.includes(term), `The agent instructions no longer describe ${term}`)
  return { config, suite, candidate: readCandidate(repositoryRoot), toolCatalog: readToolCatalog(repositoryRoot), toolInputs: readToolInputs(repositoryRoot), harnessSha256: Object.fromEntries(HARNESS.map(path => [path, sha(readFileSync(resolve(repositoryRoot, path)))])) }
}

const runDirectory = runId => { assert.match(String(runId), /^[\w.-]{8,40}$/u, USAGE); return resolve(root, RUNS_DIR, runId) }
const loadState = runId => { const path = join(runDirectory(runId), 'state.json'); assert.ok(existsSync(path), `Unknown run: ${runId}`); return readJson(path) }
const saveState = state => writeFileSync(join(runDirectory(state.runId), 'state.json'), `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })

/** A file written on Windows may carry a byte-order mark or be UTF-16. */
export function decodeJsonFile(bytes) {
  const text = bytes[0] === 0xff && bytes[1] === 0xfe ? bytes.subarray(2).toString('utf16le') : bytes.toString('utf8').replace(/^﻿/u, '')
  return JSON.parse(text)
}

function dependencies(state, sources) {
  const backend = new FirstPartyClient({ origin: sources.config.origin, created: state.learners, save: () => saveState(state), deployment: state.bindings.deployment ?? null })
  const say = async (persona, transcript) => {
    const workspace = mkdtempSync(join(tmpdir(), 'skillpilot-claude-coach-web-e2e-'))
    try { return (await learnerSay({ cli: { path: state.cliPath }, model: sources.config.learnerModel, persona, transcript, workspace, timeoutMs: sources.config.learnerTimeoutMs })).text } finally { rmSync(workspace, { recursive: true, force: true }) }
  }
  return { ...sources, backend, say, save: () => saveState(state) }
}

const summaryLine = (report, runId) => `Claude coach web test: ${report.status}; ${report.passed} of ${report.total} scenarios passed;${report.error ? ` ${report.error};` : ''} report: ${relative(root, join(runDirectory(runId), 'report.json'))}`

async function finishRun(state, sources) {
  const report = await finalize(state, dependencies(state, sources))
  saveState(state)
  writeFileSync(join(runDirectory(state.runId), 'report.json'), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
  return report
}

async function commandStep(sources, args) {
  assert.ok(args[0] === '--run' && args.length >= 2 && args.length <= 3, USAGE)
  const state = loadState(args[1])
  // Called from Windows through wsl.exe, where the search path of the starting shell is missing.
  if (state.path) process.env.PATH = state.path
  const lock = join(runDirectory(state.runId), 'step.lock')
  let handle
  try { handle = openSync(lock, 'wx') } catch { throw new Error('Another step of this run is still running') }
  try {
    assert.deepEqual(sources.harnessSha256, state.bindings.harness, 'Test sources changed during the run; start a new run')
    let observation
    let unreadable = null
    if (args[2] !== undefined) {
      assert.match(args[2], /^obs-\d{1,4}\.json$/u, 'The observation file must be named as the action says')
      assert.equal(args[2], state.pending?.action.observationFile, 'This is not the observation the waiting action asked for')
      try { observation = decodeJsonFile(readFileSync(join(state.exchangeDir, args[2]))) } catch (error) { unreadable = `The observation file is not readable JSON: ${error.message}` }
    }
    let action
    if (unreadable) action = { ...state.pending.action, problems: [unreadable] }
    else action = await advance(state, observation, dependencies(state, sources))
    if (action.action === 'done') {
      const report = await finishRun(state, sources)
      Object.assign(action, { status: report.status, summary: summaryLine(report, state.runId) })
    }
    saveState(state)
    writeFileSync(join(state.exchangeDir, `action-${action.n}.json`), `${JSON.stringify(action, null, 2)}\n`)
    console.log(`NEXT action-${action.n}.json`)
  } finally { closeSync(handle); rmSync(lock, { force: true }) }
}

/** What this program needs from Windows; every value comes from Windows itself. */
export function windowsEnvironment(option, run = spawnSync) {
  const text = result => (result.status === 0 ? String(result.stdout).replace(/\r/gu, '').trim() : '')
  const cmdPath = text(run('which', ['cmd.exe'], { encoding: 'utf8' }))
  assert.ok(cmdPath, 'cmd.exe is not reachable; this run needs WSL with Windows interop')
  const cmd = (...args) => text(run(cmdPath, ['/d', '/c', ...args], { cwd: dirname(cmdPath), encoding: 'utf8', timeout: 30_000 }))
  const toWsl = path => text(run('wslpath', ['-u', path], { encoding: 'utf8' }))
  const localAppData = cmd('echo', '%LOCALAPPDATA%')
  const profile = cmd('echo', '%USERPROFILE%')
  assert.ok(/^[A-Za-z]:\\/u.test(localAppData) && /^[A-Za-z]:\\/u.test(profile), 'Windows did not name its user folders')
  const candidates = [option, cmd('where', 'claude').split('\n')[0], `${profile}\\.local\\bin\\claude.exe`].filter(Boolean)
  const claude = candidates.find(path => existsSync(toWsl(path)))
  assert.ok(claude, 'Claude Code is not installed on Windows. Install it there, sign in with /login and add the Claude extension to Chrome; see docs/qa-ci/claude-coach-web-e2e.md')
  const version = /^(\d+\.\d+\.\d+)/u.exec(text(run(toWsl(claude), ['--version'], { cwd: dirname(cmdPath), encoding: 'utf8', timeout: 60_000 })))?.[1]
  assert.ok(version, 'Claude Code on Windows does not start')
  return { cmdPath, claude, version, exchangeRoot: toWsl(`${localAppData}\\Temp\\skillpilot-coach-web-e2e`), distro: process.env.WSL_DISTRO_NAME ?? '' }
}

/**
 * The two start files of a run. wsl.exe takes its own arguments unquoted and, with --exec,
 * starts the program without a shell; values that would need quoting are refused.
 */
export function exchangeFiles({ runId, distro, repositoryRoot, node, claude, agent }) {
  for (const [label, value] of [['distribution', distro], ['repository path', repositoryRoot], ['node path', node], ['run id', runId]]) assert.match(String(value), /^[\w./+-]+$/u, `The ${label} contains a space or another character that cannot be written into a Windows command file`)
  assert.match(claude, /^[A-Za-z]:\\[\w .\\()+-]+$/u, 'The Windows path of Claude Code cannot be written into a Windows command file')
  return {
    'step.cmd': `@echo off\r\nwsl.exe -d ${distro} --cd ${repositoryRoot} --exec ${node} scripts/claude_coach_web_e2e.mjs step --run ${runId} %*\r\n`,
    // The run id in the agent's command line lets the waiting program tell whether this agent still runs.
    'start.cmd': `@echo off\r\ncd /d "%~dp0"\r\n"${claude}" --chrome --model ${agent.model} --effort ${agent.effort} "Read the file driver.md in this folder and follow it exactly (run ${runId})."\r\n`,
  }
}

/**
 * Whether the browser agent of this run still runs on Windows: true, false, or null when Windows
 * cannot be asked. The run id is part of the agent's command line (see exchangeFiles).
 */
export function agentRunning(runId, run = spawnSync) {
  const powershell = String(run('which', ['powershell.exe'], { encoding: 'utf8' }).stdout ?? '').trim()
  if (!powershell) return null
  const result = run(powershell, ['-NoProfile', '-NonInteractive', '-Command', "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | ForEach-Object { $_.CommandLine }"], { cwd: dirname(powershell), encoding: 'utf8', timeout: 60_000 })
  if (result.status !== 0) return null
  return String(result.stdout).split(/\r?\n/u).some(line => line.includes(`(run ${runId})`))
}

/**
 * Waits until the run has ended: the agent took its last step, or its window is gone. A run whose
 * agent never appears ends after `startMinutes`. Returns how the wait ended.
 */
export async function waitForAgent(runId, { readStatus, running, pause = ms => new Promise(resolvePause => setTimeout(resolvePause, ms)), now = Date.now, pollMs = 15_000, checkEvery = 4, startMinutes = 5 }) {
  const started = now()
  let seen = false
  let gone = 0
  for (let poll = 1; ; poll++) {
    await pause(pollMs)
    let status
    // A step may be writing the state just now; the next poll reads it again.
    try { status = readStatus() } catch { continue }
    if (status !== 'running') return 'ended'
    if (poll % checkEvery !== 0) continue
    const alive = running()
    if (alive === true) { seen = true; gone = 0 } else if (alive === false) gone += 1
    // Two answers in a row, so that one slow start of a process does not end the run.
    if (seen && gone >= 2) return 'agent-closed'
    if (!seen && alive === false && now() - started > startMinutes * 60_000) return 'agent-not-started'
  }
}

function gitOutput(args) {
  const result = spawnSync('git', args, { cwd: root, env: childEnvironment(), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  assert.equal(result.status, 0, 'Cannot bind the test to the current Git sources')
  return result.stdout
}

export function parseRunArguments(args) {
  const options = { scenarios: [], noLaunch: false, keepLearners: false }
  const values = { '--scenario': 'scenario', '--claude-bin': 'claudeBin', '--windows-claude': 'windowsClaude' }
  const flags = { '--no-launch': 'noLaunch', '--keep-learners': 'keepLearners' }
  for (let index = 0; index < args.length; index++) {
    if (flags[args[index]]) { options[flags[args[index]]] = true; continue }
    const name = values[args[index]]
    const value = args[++index]
    assert.ok(name && typeof value === 'string' && value && !value.startsWith('--'), USAGE)
    if (name === 'scenario') options.scenarios.push(value)
    else { assert.ok(!(name in options), `Option given twice: ${args[index - 1]}`); options[name] = value }
  }
  return options
}

async function commandRun(sources, args) {
  const options = parseRunArguments(args)
  const unknown = options.scenarios.filter(id => !sources.suite.scenarios.some(scenario => scenario.id === id))
  assert.deepEqual(unknown, [], `Unknown scenario: ${unknown.join(', ')}`)
  const scenarioIds = sources.suite.scenarios.map(scenario => scenario.id).filter(id => !options.scenarios.length || options.scenarios.includes(id))
  const { config } = sources
  const production = new FirstPartyClient({ origin: config.origin })
  assert.ok(await production.healthy(), `${config.origin} is not reachable`)
  // A redeployment during the run ends it; see ProductionNotReady.
  const deployment = await production.deployed()
  const cli = resolveCli(options.claudeBin)
  assert.ok(compareVersions(cli.version, config.agent.minimumCliVersion) >= 0, `Claude Code ${cli.version} is too old for the simulated learner; version ${config.agent.minimumCliVersion} or newer is required`)
  const cliPath = spawnSync('which', [cli.path], { encoding: 'utf8' }).stdout.trim() || cli.path
  const windows = windowsEnvironment(options.windowsClaude)
  assert.ok(compareVersions(windows.version, config.agent.minimumCliVersion) >= 0, `Claude Code ${windows.version} on Windows is too old; version ${config.agent.minimumCliVersion} or newer is required`)

  const runId = new Date().toISOString().replaceAll(':', '-')
  const directory = runDirectory(runId)
  assert.ok(realpathSync(resolve(root, 'tmp')) && !existsSync(directory), 'The run directory exists already')
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const exchangeDir = join(windows.exchangeRoot, runId)
  mkdirSync(exchangeDir, { recursive: true })
  const state = createRun({
    runId, scenarioIds, selection: options.scenarios.length ? 'partial' : 'complete', exchangeDir, path: process.env.PATH, cliPath, keepLearners: options.keepLearners,
    bindings: {
      gitCommit: gitOutput(['rev-parse', 'HEAD']).trim(), workingTreeClean: gitOutput(['status', '--porcelain', '--untracked-files=no']).trim() === '', harness: sources.harnessSha256, origin: config.origin, deployment,
      // The plugin under test is the one installed in the signed-in account; these are the repository's candidate files for comparison.
      repositoryCandidate: { name: sources.candidate.name, version: sources.candidate.version, packageSha256: sources.candidate.packageSha256 },
      agent: { model: config.agent.model, effort: config.agent.effort, claudeCodeVersion: windows.version }, coach: { model: config.coach.modelLabel, effort: config.coach.effortLabel },
      learnerModel: config.learnerModel, learnerClaudeCodeVersion: cli.version,
    },
  })
  saveState(state)
  copyFileSync(resolve(root, DRIVER), join(exchangeDir, 'driver.md'))
  for (const [name, content] of Object.entries(exchangeFiles({ runId, distro: windows.distro, repositoryRoot: root, node: process.execPath, claude: windows.claude, agent: config.agent }))) writeFileSync(join(exchangeDir, name), content)

  console.log(`Run ${runId}: ${scenarioIds.length} scenario(s) against ${config.origin}; browser agent ${config.agent.model} with effort ${config.agent.effort}; coach ${config.coach.modelLabel} with effort ${config.coach.effortLabel}.`)
  if (options.noLaunch) {
    console.log(`Not started. On Windows run start.cmd in ${spawnSync('wslpath', ['-w', exchangeDir], { encoding: 'utf8' }).stdout.trim()}; afterwards: node scripts/claude_coach_web_e2e.mjs finish --run ${runId}`)
    return null
  }
  // A window of its own on the Windows desktop: the person answers Claude Code's questions there,
  // and a console inherited through WSL would keep this program's pipes open.
  const folder = spawnSync('wslpath', ['-w', exchangeDir], { encoding: 'utf8' }).stdout.trim()
  const child = spawn(windows.cmdPath, ['/d', '/c', 'start', `SkillPilot coach web test ${runId}`, `${folder}\\start.cmd`], { cwd: dirname(windows.cmdPath), stdio: 'ignore', detached: true })
  child.unref()
  console.log(`The browser agent starts in a window of its own on Windows; approve there what Claude Code asks for. This program waits until the run ends. If you stop it, end the run with: node scripts/claude_coach_web_e2e.mjs finish --run ${runId}`)
  const ended = await waitForAgent(runId, { readStatus: () => loadState(runId).status, running: () => agentRunning(runId) })
  if (ended !== 'ended') console.log(ended === 'agent-closed' ? 'The agent window was closed before the run ended.' : 'The browser agent did not start.')
  return commandFinish(sources, ['--run', runId])
}

async function commandFinish(sources, args) {
  assert.ok(args[0] === '--run' && args.length === 2, USAGE)
  const state = loadState(args[1])
  if (state.path) process.env.PATH = state.path
  const report = await finishRun(state, sources)
  console.log(summaryLine(report, state.runId))
  if (report.learnersLeft) console.log(`${report.learnersLeft} test learner(s) are kept on ${sources.config.origin}.`)
  if (report.status !== 'passed') process.exitCode = 1
  return report
}

export async function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv
  assert.ok(['check', 'run', 'step', 'finish'].includes(command), USAGE)
  const sources = checkedWebSources()
  if (command === 'check') {
    assert.equal(rest.length, 0, USAGE)
    console.log(`Claude coach web test configuration checked: ${sources.suite.scenarios.length} scenarios, ${sources.toolCatalog.length} connector tools, coach ${sources.config.coach.modelLabel} with effort ${sources.config.coach.effortLabel}; NO BROWSER TEST EXECUTED.`)
    return null
  }
  return ({ run: commandRun, step: commandStep, finish: commandFinish })[command](sources, rest)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1 })
