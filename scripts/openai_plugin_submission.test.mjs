import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { assertNoSecrets, auditExport, digest, generateSubmission, validateExecutionMappings, validateSuite, validateTrace } from './openai_plugin_submission.mjs'

const suite = JSON.parse(readFileSync(new URL('../ai/openai plugin/skillpilot-coach-v1/submission/review-cases.json', import.meta.url)))
const manifest = {
  name: 'skillpilot-coach-v1', version: suite.candidateVersion,
  interface: { displayName: 'Fixture coach', shortDescription: 'Fixture description', longDescription: 'Fixture longer description.', developerName: 'Fixture developer', category: 'Education & Research', websiteURL: 'https://fixture.example', privacyPolicyURL: 'https://fixture.example/privacy', termsOfServiceURL: 'https://fixture.example/terms', brandColor: '#123456', defaultPrompt: ['Fixture start?'] },
}
const toolNames = [...new Set(suite.cases.flatMap(entry => [...entry.tools.required, ...entry.tools.forbidden]).filter(name => name !== '*'))]
const contract = { pluginIdentity: manifest.name, tools: toolNames.map(name => ({ name, title: name, description: `${name} fixture only.`, inputSchema: { type: 'object', properties: {} }, outputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: name.startsWith('get_') }, meta: {} })), resources: [] }
const mcp = { mcpServers: { coach: { url: 'https://fixture.example/mcp' } } }
const metadata = { schemaVersion: 1, customerSupportUrl: 'https://fixture.example/help', manualStepsRequired: ['Review the current host.'] }
const input = { manifest, contract, mcp, metadata, suite }
const clone = value => structuredClone(value)

test('all portal and internal cases validate without asserting model acceptance', () => {
  assert.equal(validateSuite(suite, manifest, contract), suite)
  const { draft, preparation } = generateSubmission(input)
  assert.equal(draft.test_cases.length, 5)
  assert.equal(draft.negative_test_cases.length, 3)
  assert.equal(preparation.internalCaseIds.length, 6)
  assert.equal(preparation.state, 'PREPARED_NOT_SUBMITTED')
  assert.equal(preparation.evidence.chatgptWebAcceptance, 'pending')
  assert.equal(draft.status, undefined)
  assert.equal(draft.id, undefined)
  assert.equal(draft.oauth_client, undefined)
  assert.equal(draft.test_credentials, undefined)
  assert.equal(draft.demo_recording_url, undefined)
  assert.match(draft.test_cases[3].user_prompt, /https:\/\/skillpilot.com\/start\/abi26-he-mathe-k1\?courseLevel=GK/u)
  assert.match(draft.negative_test_cases[2].user_prompt, /CREATE/u)
  assert.match(draft.test_cases[2].user_prompt, /In Cockpit activate Warum Mathematik/u)
})

test('each case maps to an existing executable test selector without claiming that a run occurred', () => {
  assert.doesNotThrow(() => validateExecutionMappings(suite))
  const changed = clone(suite)
  changed.cases[0].execution.automated[0].selector = 'nonexistentReplaySelector'
  assert.throws(() => validateExecutionMappings(changed), /selector is missing/u)
})

test('generation is deterministic and uses current source metadata, not stale export values', () => {
  assert.deepEqual(generateSubmission(input), generateSubmission(clone(input)))
  const changed = clone(input)
  changed.manifest.version = '1.2.0'
  changed.suite.candidateVersion = '1.2.0'
  changed.manifest.interface.displayName = 'New name'
  changed.mcp.mcpServers.coach.url = 'https://new-fixture.example/mcp'
  changed.metadata.customerSupportUrl = 'https://new-fixture.example/support'
  const result = generateSubmission(changed)
  assert.equal(result.draft.version, '1.2.0')
  assert.equal(result.draft.display_name, 'New name')
  assert.equal(result.draft.mcp_url, 'https://new-fixture.example/mcp')
  assert.equal(result.draft.branding.customer_support, 'https://new-fixture.example/support')
})

test('missing cases, duplicate IDs, stale versions and unknown tools fail closed', () => {
  for (const mutate of [
    value => value.cases.splice(2, 1),
    value => { value.cases[2].id = 'P2' },
    value => { value.candidateVersion = '1.0.0' },
    value => value.cases[1].tools.required.push('unpublished_tool'),
    value => value.cases[1].tools.forbidden.push(value.cases[1].tools.required[0]),
  ]) {
    const changed = clone(suite)
    mutate(changed)
    assert.throws(() => validateSuite(changed, manifest, contract))
  }
})

test('expected outputs cannot be truncated, omitted, copied from tools or exceed the authored budget', () => {
  for (const summary of ['', 'Existing mastery remains un', 'TODO.', 'And so on…', `${'x'.repeat(300)}.`]) {
    const changed = clone(suite)
    changed.cases[4].portalSummary = summary
    assert.throws(() => validateSuite(changed, manifest, contract))
  }
  const changed = clone(suite)
  changed.cases[0].portalSummary = 'No MCP tools; first-party handoff only.'
  assert.throws(() => validateSuite(changed, manifest, contract), /repeats tool names/u)
})

test('P3 vertex and P4 contextual interpretation cannot silently disappear', () => {
  const changed = clone(suite)
  changed.cases.find(entry => entry.id === 'P3').turns = changed.cases.find(entry => entry.id === 'P3').turns.map(turn => ({ ...turn, text: turn.text.replace('S(d|e)', '') }))
  assert.throws(() => validateSuite(changed, manifest, contract), /vertex/u)
  const changedExam = clone(suite)
  changedExam.cases.find(entry => entry.id === 'P4').turns = changedExam.cases.find(entry => entry.id === 'P4').turns.map(turn => ({ ...turn, text: turn.text.replaceAll(/maximal|höchstens/gu, '') }))
  assert.throws(() => validateSuite(changedExam, manifest, contract), /covered area/u)
})

test('saved export audit detects field changes, missing negatives, truncation and tool-list substitution without values', () => {
  const expected = generateSubmission(input).draft
  assert.equal(auditExport(expected, clone(expected)).matches, true)
  const actual = clone(expected)
  actual.status = 'REJECTED'
  actual.oauth_client = { client_secret: 'DO_NOT_DISCLOSE_THIS_SENTINEL' }
  actual.test_cases[2].expected_output = actual.test_cases[2].tools_triggered
  actual.test_cases[4].expected_output = expected.test_cases[4].expected_output.slice(0, -9)
  actual.negative_test_cases[0].expected_output = null
  actual.resources[0].provided_tool_annotations.readOnlyHint = !actual.resources[0].provided_tool_annotations.readOnlyHint
  const report = auditExport(expected, actual)
  assert.equal(report.matches, false)
  assert.equal(report.exportedState, 'REJECTED')
  assert.ok(report.issues.some(issue => issue.kind === 'truncated-prefix'))
  assert.ok(report.issues.some(issue => issue.kind === 'tool-list-in-outcome-field'))
  assert.ok(report.issues.some(issue => issue.kind === 'missing-visible-outcome'))
  assert.ok(report.issues.some(issue => issue.path.endsWith('readOnlyHint')))
  assert.ok(!JSON.stringify(report).includes('DO_NOT_DISCLOSE_THIS_SENTINEL'))
})

test('credentials, signed URLs and real session strings are rejected from authored sources and sanitized traces', () => {
  for (const value of [{ client_secret: 'private' }, { note: `sps_${'B'.repeat(43)}` }, { note: `Bearer ${'A'.repeat(20)}` }, { url: 'https://fixture.example/video?X-Amz-Signature=private' }]) assert.throws(() => assertNoSecrets(value))
  assert.doesNotThrow(() => assertNoSecrets({ note: 'sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }))
})

function incompleteTrace() {
  return { schemaVersion: 1, candidateVersion: suite.candidateVersion, suiteSha256: digest(suite), runId: 'synthetic-unit-test-not-host-evidence', layer: 'backend-fixture', cases: [] }
}

test('missing executions and semantic reviews are never reported as acceptance', () => {
  const empty = validateTrace(suite, incompleteTrace())
  assert.equal(empty.passed, false)
  assert.equal(empty.failures.length, suite.cases.length)
  const trace = incompleteTrace()
  trace.cases = [{ id: 'P1', events: [{ id: 'user-start', kind: 'user', turnId: 'start' }, { id: 'reply', kind: 'assistant', text: suite.cases[0].assertions.find(entry => entry.kind === 'visible-exact').value }] }]
  const result = validateTrace(suite, trace)
  assert.equal(result.passed, false)
  assert.equal(result.realHostEvidence, false)
  assert.ok(result.pendingManual.some(label => label.startsWith('P1/')))
})

test('trace checks actual event tool names, counts, order and errors; stale traces fail', () => {
  const trace = incompleteTrace()
  const authoredTurns = id => suite.cases.find(entry => entry.id === id).turns.map(turn => ({ id: `user-${turn.id}`, kind: 'user', turnId: turn.id }))
  trace.cases = [{ id: 'P1', events: [...authoredTurns('P1'), { id: 'bad-tool', kind: 'tool', name: 'get_skillpilot_context', outcome: 'success' }] }, { id: 'N1', events: [...authoredTurns('N1'), { id: 'wrong-error', kind: 'tool', name: 'get_skillpilot_context', outcome: 'error', errorCode: 'OTHER' }] }]
  const result = validateTrace(suite, trace)
  assert.ok(result.failures.some(label => label.includes('forbidden tool')))
  assert.ok(result.failures.some(label => label.includes('required error missing')))
  trace.suiteSha256 = '0'.repeat(64)
  assert.throws(() => validateTrace(suite, trace), /stale review/u)
})

test('missing count bounds and unknown assertions fail on both suite and trace paths', () => {
  for (const mutate of [assertion => { delete assertion.min }, assertion => { delete assertion.max }, assertion => { delete assertion.tool }, assertion => { assertion.kind = 'invented-success' }]) {
    const changed = clone(suite)
    const assertion = changed.cases.flatMap(entry => entry.assertions).find(entry => entry.kind === 'tool-count')
    mutate(assertion)
    assert.throws(() => validateSuite(changed, manifest, contract))
    const trace = incompleteTrace()
    trace.suiteSha256 = digest(changed)
    assert.throws(() => validateTrace(changed, trace))
  }
})

test('errors cannot stand in for required successful operations and missing authored turns fail', () => {
  const trace = incompleteTrace()
  const testCase = suite.cases.find(entry => entry.id === 'P2')
  trace.cases = [{ id: 'P2', events: [
    ...testCase.turns.map(turn => ({ id: `user-${turn.id}`, kind: 'user', turnId: turn.id })),
    ...testCase.tools.required.map((name, index) => ({ id: `tool-${index}`, kind: 'tool', name, outcome: 'error', errorCode: 'AUDIT_FAILURE' })),
  ] }]
  const result = validateTrace(suite, trace)
  assert.equal(result.passed, false)
  assert.ok(result.failures.some(label => label.includes('unexpected tool error')))
  assert.ok(result.failures.some(label => label.includes('required tool success/error outcome missing')))
  trace.cases[0].events.shift()
  assert.throws(() => validateTrace(suite, trace), /missing or reordered authored turns/u)
})

test('claiming real ChatGPT requires explicit recording provenance and still does not execute a host', () => {
  const trace = incompleteTrace()
  trace.layer = 'chatgpt-ios'
  const result = validateTrace(suite, trace)
  assert.equal(result.passed, false)
  assert.ok(result.failures.includes('Real-host trace is missing recording/time/reviewer provenance'))
  assert.match(result.caveat, /neither executes a model/u)
})
