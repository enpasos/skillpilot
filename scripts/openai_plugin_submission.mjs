import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const plugin = resolve(root, 'ai/openai plugin/skillpilot-coach-v1')
const submission = resolve(plugin, 'submission')
const requiredPortalIds = ['P1', 'P2', 'P3', 'P4', 'P5', 'N1', 'N2', 'N3']
const json = value => `${JSON.stringify(value, null, 2)}\n`
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : json(value)).digest('hex')
const readJson = path => {
  assert.ok(statSync(path).size <= 4 * 1024 * 1024, 'Input exceeds the 4 MiB safety limit')
  return JSON.parse(readFileSync(path, 'utf8'))
}
const nonempty = (value, label) => assert.ok(typeof value === 'string' && value.trim().length > 0, `${label} must be nonempty`)
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label} contains duplicates`)
const sourcePath = path => relative(root, path).replaceAll('\\', '/')

function validateAssertions(testCase, toolNames) {
  assert.ok(Array.isArray(testCase.assertions) && testCase.assertions.length > 0, `${testCase.id}: missing semantic assertions`)
  unique(testCase.assertions.map(entry => entry.id), `${testCase.id} assertion IDs`)
  for (const assertion of testCase.assertions) {
    nonempty(assertion.id, 'Assertion ID')
    assert.ok(['manual', 'visible-exact', 'no-tools', 'tool-count', 'tool-error'].includes(assertion.kind), `${testCase.id}: unsupported assertion`)
    if (assertion.kind === 'manual') nonempty(assertion.description, `${testCase.id} manual oracle`)
    if (assertion.kind === 'visible-exact') nonempty(assertion.value, `${testCase.id} exact visible output`)
    if (['tool-count', 'tool-error'].includes(assertion.kind)) {
      nonempty(assertion.tool, `${testCase.id} asserted tool`)
      if (toolNames) assert.ok(toolNames.has(assertion.tool), `${testCase.id}: assertion references unknown tool`)
    }
    if (assertion.kind === 'tool-count') {
      assert.ok(Number.isSafeInteger(assertion.min) && assertion.min >= 0, `${testCase.id}: missing/invalid tool-count minimum`)
      assert.ok(Number.isSafeInteger(assertion.max) && assertion.max >= assertion.min, `${testCase.id}: missing/invalid tool-count maximum`)
    }
    if (assertion.kind === 'tool-error') nonempty(assertion.code, `${testCase.id} expected error code`)
  }
}

export function validateExecutionMappings(suite, repositoryRoot = root) {
  for (const testCase of suite.cases) {
    assert.ok(testCase.execution.automated.length > 0, `${testCase.id}: missing executable backend/component mapping`)
    for (const mapping of testCase.execution.automated) {
      const path = resolve(repositoryRoot, mapping.path)
      assert.ok(path.startsWith(`${resolve(repositoryRoot)}/`), 'Execution mapping escapes repository')
      assert.ok(existsSync(path), `${testCase.id}: mapped test file is missing`)
      const source = readFileSync(path, 'utf8')
      assert.ok(source.includes(mapping.selector), `${testCase.id}: mapped test selector is missing`)
    }
  }
}

// Never import an old portal export into the generated draft. These reject common
// accidentally pasted credentials in our authored, non-secret sources and traces.
export function assertNoSecrets(value) {
  const visit = item => {
    if (typeof item === 'string') {
      assert.ok(!/\b(?:sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/u.test(item), 'Possible credential in public artifact')
      assert.ok(!/https?:\/\/[^\s]+[?&](?:token|signature|sig|X-Amz-Signature|X-Goog-Signature)=/iu.test(item), 'Signed URL in public artifact')
      for (const match of item.matchAll(/\bsps_[A-Za-z0-9_-]{20,}/gu)) {
        assert.ok(match[0] === 'sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Real session identifier in public artifact')
      }
    } else if (Array.isArray(item)) item.forEach(visit)
    else if (item && typeof item === 'object') {
      for (const [key, entry] of Object.entries(item)) {
        assert.ok(!/^(?:client_secret|access_token|refresh_token|password|test_credentials|oauth_client|learningSessionId|learnerId|skillpilotId)$/iu.test(key), 'Secret or learner identity field in public artifact')
        visit(entry)
      }
    }
  }
  visit(value)
}

// Schema fields legitimately name learningSessionId; source/trace payload checks
// run on authored review data, not on the exported public schema itself.
export function validateSuite(suite, manifest, contract) {
  assert.equal(suite.schemaVersion, 1)
  assert.equal(suite.pluginIdentity, manifest.name, 'Suite/plugin identity mismatch')
  assert.equal(suite.candidateVersion, manifest.version, 'Stale suite candidate version')
  assert.equal(contract.pluginIdentity, manifest.name, 'Contract/plugin identity mismatch')
  assert.ok(Array.isArray(contract.tools) && contract.tools.length > 0, 'Missing exported tool contract')
  unique(contract.tools.map(tool => tool.name), 'Contract tool names')
  const toolNames = new Set(contract.tools.map(tool => tool.name))
  const ids = suite.cases.map(testCase => testCase.id)
  unique(ids, 'Case IDs')
  assert.deepEqual(suite.cases.filter(testCase => testCase.portal).map(testCase => testCase.id), requiredPortalIds, 'Exactly P1-P5 and N1-N3 must be complete and ordered')
  for (const id of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']) assert.ok(ids.includes(id), `Missing daily-plan case ${id}`)
  assertNoSecrets(suite)
  for (const testCase of suite.cases) {
    assert.equal(testCase.kind, testCase.id.startsWith('P') ? 'positive' : testCase.id.startsWith('N') ? 'negative' : 'internal')
    const fixture = suite.fixtures[testCase.fixture]
    assert.ok(fixture, `${testCase.id}: missing fixture`)
    nonempty(fixture.description, `${testCase.id} fixture description`)
    assert.ok(fixture.steps.length > 0, `${testCase.id}: fixture has no setup steps`)
    assert.ok(testCase.turns.length > 0, `${testCase.id}: missing user turns`)
    unique(testCase.turns.map(turn => turn.id), `${testCase.id} turn IDs`)
    for (const turn of testCase.turns) {
      assert.ok(['user', 'ui', 'prepared-start'].includes(turn.kind), `${testCase.id}: unsupported turn kind`)
      nonempty(turn.text, `${testCase.id}/${turn.id}`)
    }
    nonempty(testCase.portalSummary, `${testCase.id} expected output`)
    assert.ok(/[.!?]$/u.test(testCase.portalSummary), `${testCase.id}: expected output must end as a complete sentence`)
    assert.ok(!/(?:\.\.\.|…|\bTODO\b|\bTBD\b)/u.test(testCase.portalSummary), `${testCase.id}: truncated or placeholder expected output`)
    const fields = portalCase(testCase, fixture)
    assert.notEqual(fields.expected_output, fields.tools_triggered, `${testCase.id}: expected output repeats tool names`)
    for (const [field, budget] of Object.entries(suite.portalBudgets)) {
      assert.ok(Number.isSafeInteger(budget) && budget > 0)
      assert.ok(Array.from(fields[field]).length <= budget, `${testCase.id}: ${field} exceeds authored budget ${budget}; shorten explicitly, never truncate`)
    }
    for (const name of [...testCase.tools.required, ...testCase.tools.forbidden, ...testCase.tools.order.flat()]) {
      assert.ok(name === '*' || toolNames.has(name), `${testCase.id}: unknown tool ${name}`)
    }
    unique(testCase.tools.required, `${testCase.id} required tools`)
    unique(testCase.tools.forbidden, `${testCase.id} forbidden tools`)
    assert.ok(testCase.tools.required.every(name => !testCase.tools.forbidden.includes(name) && !testCase.tools.forbidden.includes('*')), `${testCase.id}: contradictory tool rules`)
    validateAssertions(testCase, toolNames)
    assert.equal(testCase.execution.realHost.status, 'pending', 'Source cases cannot assert a host acceptance result')
    for (const mapping of testCase.execution.automated) {
      nonempty(mapping.path, 'Execution path')
      nonempty(mapping.selector, 'Execution selector')
      assert.ok(['backend-contract', 'component'].includes(mapping.layer), 'Static/backend tests are not model or host acceptance')
    }
  }
  const p3 = suite.cases.find(testCase => testCase.id === 'P3').turns.map(turn => turn.text).join('\n')
  assert.match(p3, /S\(d\|e\)/u, 'P3 must include the vertex coordinates')
  const p4 = suite.cases.find(testCase => testCase.id === 'P4').turns.map(turn => turn.text).join('\n')
  assert.match(p4, /maximal|höchstens/u, 'P4 must interpret the bounded covered area')
  assert.match(p4, /500/u)
  return suite
}

function portalCase(testCase, fixture) {
  return {
    description: `${testCase.id}: ${fixture.description}`,
    user_prompt: `Fixture setup:\n${fixture.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\nExpected starting state: ${fixture.expectedStart}\n\nOrdered turns:\n${testCase.turns.map((turn, index) => `${index + 1}. [${turn.kind}] ${turn.text}`).join('\n\n')}`,
    tools_triggered: testCase.tools.required.length ? testCase.tools.required.join(', ') : 'No MCP tools; first-party handoff only.',
    expected_output: testCase.portalSummary,
    expected_output_url: null,
    file_attachment_urls: null,
  }
}

function portalTool(tool) {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    input_json_schema: tool.inputSchema,
    output_json_schema: tool.outputSchema,
    provided_tool_annotations: tool.annotations,
    metadata: tool.meta,
  }
}

export function generateSubmission({ manifest, mcp, contract, suite, metadata, bindings = {} }) {
  validateSuite(suite, manifest, contract)
  assertNoSecrets(metadata)
  const servers = Object.values(mcp.mcpServers)
  assert.equal(servers.length, 1, 'Expected one authoritative MCP endpoint')
  const endpoint = new URL(servers[0].url)
  assert.equal(endpoint.protocol, 'https:')
  assert.equal(endpoint.search, '', 'MCP endpoint must not carry credentials or cache-busting query parameters')
  assert.equal(endpoint.username + endpoint.password, '')
  assert.equal(metadata.schemaVersion, 1)
  nonempty(metadata.customerSupportUrl, 'Customer support URL')
  assert.equal(new URL(metadata.customerSupportUrl).protocol, 'https:')
  const listing = manifest.interface
  for (const key of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category', 'websiteURL', 'privacyPolicyURL', 'termsOfServiceURL']) nonempty(listing[key], `Manifest interface.${key}`)
  const resources = contract.tools.map(portalTool)
  const draft = {
    version: manifest.version,
    display_name: listing.displayName,
    developer_name: listing.developerName,
    plugin_category: listing.category.toLowerCase(),
    subtitle: listing.shortDescription,
    description: listing.longDescription,
    brand_color: listing.brandColor,
    branding: {
      website: listing.websiteURL,
      customer_support: metadata.customerSupportUrl,
      privacy_policy: listing.privacyPolicyURL,
      terms_of_service: listing.termsOfServiceURL,
    },
    mcp_url: endpoint.href,
    mcp: { mcp_url: endpoint.href, resources },
    resources,
    test_cases: suite.cases.filter(testCase => testCase.kind === 'positive').map(testCase => portalCase(testCase, suite.fixtures[testCase.fixture])),
    negative_test_cases: suite.cases.filter(testCase => testCase.kind === 'negative').map(testCase => portalCase(testCase, suite.fixtures[testCase.fixture])),
  }
  const preparation = {
    schemaVersion: 1,
    state: 'PREPARED_NOT_SUBMITTED',
    pluginIdentity: manifest.name,
    candidateVersion: manifest.version,
    format: 'Portal-shaped non-secret review worksheet; no documented portal JSON import/API is assumed.',
    sourceBindings: { ...bindings, suiteSha256: digest(suite), contractSha256: digest(contract), manifestSha256: digest(manifest), mcpSha256: digest(mcp), metadataSha256: digest(metadata) },
    generatedDraftSha256: digest(draft),
    starterPrompts: listing.defaultPrompt,
    portalCaseIds: requiredPortalIds,
    internalCaseIds: suite.cases.filter(testCase => !testCase.portal).map(testCase => testCase.id),
    resourceBindings: contract.resources,
    manualStepsRequired: metadata.manualStepsRequired,
    evidence: { sourceValidation: 'generated', backendAndComponentTests: 'run separately and retain their actual reports', liveModelReplay: 'not run by generator', chatgptWebAcceptance: 'pending', nativeMobileAcceptance: 'not claimed', submission: 'not performed', publication: 'not performed' },
  }
  return { draft, preparation }
}

// Compare only our authored fields. Never log values from the credential-bearing
// portal export: output contains paths and defect classifications, not secrets.
export function auditExport(expected, actual) {
  const issues = []
  const compare = (left, right, path) => {
    if (Array.isArray(left)) {
      if (!Array.isArray(right)) { issues.push({ path, kind: 'missing-or-wrong-type' }); return }
      if (left.length !== right.length) issues.push({ path, kind: 'count-mismatch' })
      left.forEach((entry, index) => compare(entry, right[index], `${path}[${index}]`))
    } else if (left && typeof left === 'object') {
      if (!right || typeof right !== 'object' || Array.isArray(right)) { issues.push({ path, kind: 'missing-or-wrong-type' }); return }
      for (const [key, value] of Object.entries(left)) compare(value, right[key], `${path}.${key}`)
    } else if (left !== right) {
      issues.push({ path, kind: typeof left === 'string' && typeof right === 'string' && left.startsWith(right) ? 'truncated-prefix' : 'value-mismatch' })
    }
  }
  compare(expected, actual, '$')
  for (const bucket of ['test_cases', 'negative_test_cases']) {
    for (const [index, testCase] of (Array.isArray(actual[bucket]) ? actual[bucket] : []).entries()) {
      if (typeof testCase.expected_output !== 'string' || !testCase.expected_output.trim()) issues.push({ path: `$.${bucket}[${index}].expected_output`, kind: 'missing-visible-outcome' })
      else {
        if (!/[.!?]$/u.test(testCase.expected_output)) issues.push({ path: `$.${bucket}[${index}].expected_output`, kind: 'possibly-incomplete-sentence' })
        if (testCase.expected_output === testCase.tools_triggered) issues.push({ path: `$.${bucket}[${index}].expected_output`, kind: 'tool-list-in-outcome-field' })
      }
    }
  }
  return { matches: issues.length === 0, exportedState: ['DRAFT', 'REVIEW', 'REJECTED', 'APPROVED', 'PUBLISHED'].includes(actual.status) ? actual.status : 'not reported', issues, caveat: 'Export defects do not establish a reviewer rejection reason.' }
}

// Input is a deliberately sanitized event log, not a dump of private MCP data.
// Semantic/visual oracles require identified human review and concrete evidence.
// Machine checks alone never promote a synthetic replay to real-host acceptance.
export function validateTrace(suite, trace) {
  // Validate the source shape on this path as well, including all assertion
  // fields. The current exported contract is additionally checked by the CLI.
  const declaredTools = [...new Set(suite.cases.flatMap(testCase => [...testCase.tools.required, ...testCase.tools.forbidden, ...testCase.tools.order.flat()]).filter(name => name !== '*'))]
  validateSuite(suite, { name: suite.pluginIdentity, version: suite.candidateVersion }, { pluginIdentity: suite.pluginIdentity, tools: declaredTools.map(name => ({ name })) })
  assertNoSecrets(trace)
  assert.equal(trace.schemaVersion, 1)
  assert.equal(trace.candidateVersion, suite.candidateVersion, 'Trace uses a stale candidate')
  assert.equal(trace.suiteSha256, digest(suite), 'Trace uses stale review cases')
  assert.ok(['backend-fixture', 'model-replay', 'chatgpt-web', 'chatgpt-ios', 'chatgpt-android'].includes(trace.layer))
  nonempty(trace.runId, 'Trace run ID')
  assert.ok(Array.isArray(trace.cases), 'Missing trace cases')
  unique(trace.cases.map(entry => entry.id), 'Trace cases')
  const failures = []
  const pendingManual = []
  const results = []
  for (const testCase of suite.cases) {
    const entry = trace.cases.find(item => item.id === testCase.id)
    if (!entry) { failures.push(`${testCase.id}: missing execution`); continue }
    const events = entry.events
    if (!Array.isArray(events) || events.length === 0) { failures.push(`${testCase.id}: missing events`); continue }
    const eventIds = events.map(event => event.id)
    unique(eventIds, `${testCase.id} event IDs`)
    for (const event of events) {
      nonempty(event.id, 'Event ID')
      assert.ok(['user', 'tool', 'assistant', 'ui'].includes(event.kind), 'Unsupported trace event kind')
      if (event.kind === 'tool') {
        nonempty(event.name, 'Tool event name')
        assert.ok(declaredTools.includes(event.name), 'Unknown tool in trace')
        assert.ok(['success', 'error'].includes(event.outcome), 'Tool event requires an explicit success/error outcome')
        if (event.outcome === 'error') nonempty(event.errorCode, 'Tool error code')
        else assert.ok(event.errorCode === undefined, 'Successful tool event must not carry an error')
      }
    }
    const observedTurns = events.filter(event => ['user', 'ui'].includes(event.kind)).map(event => event.turnId)
    assert.deepEqual(observedTurns, testCase.turns.map(turn => turn.id), `${testCase.id}: missing or reordered authored turns`)
    const tools = events.filter(event => event.kind === 'tool')
    const expectedError = event => testCase.assertions.some(assertion => assertion.kind === 'tool-error' && assertion.tool === event.name && assertion.code === event.errorCode)
    for (const event of tools) if (event.outcome === 'error' && !expectedError(event)) failures.push(`${testCase.id}: unexpected tool error: ${event.name}`)
    for (const name of testCase.tools.required) if (!tools.some(event => event.name === name && (event.outcome === 'success' || expectedError(event)))) failures.push(`${testCase.id}: required tool success/error outcome missing: ${name}`)
    for (const name of testCase.tools.forbidden) if (tools.some(event => name === '*' || event.name === name)) failures.push(`${testCase.id}: forbidden tool called: ${name}`)
    for (const order of testCase.tools.order) {
      let cursor = 0
      for (const event of tools) if (event.name === order[cursor]) cursor += 1
      if (cursor !== order.length) failures.push(`${testCase.id}: tool order mismatch`)
    }
    for (const assertion of testCase.assertions) {
      const label = `${testCase.id}/${assertion.id}`
      if (assertion.kind === 'no-tools' && tools.length > 0) failures.push(`${label}: tools called`)
      if (assertion.kind === 'visible-exact' && events.filter(event => event.kind === 'assistant').map(event => event.text?.trim()).join('\n') !== assertion.value) failures.push(`${label}: visible output mismatch`)
      if (assertion.kind === 'tool-count') {
        const count = tools.filter(event => event.name === assertion.tool).length
        if (count < assertion.min || count > assertion.max) failures.push(`${label}: tool call count mismatch`)
      }
      if (assertion.kind === 'tool-error' && !tools.some(event => event.name === assertion.tool && event.errorCode === assertion.code)) failures.push(`${label}: required error missing`)
      if (assertion.kind === 'manual') {
        const review = entry.manualReviews?.find(item => item.assertionId === assertion.id)
        if (!review || review.status !== 'passed' || typeof review.reviewer !== 'string' || !review.reviewer.trim() || !Array.isArray(review.eventIds) || review.eventIds.length === 0 || review.eventIds.some(id => !eventIds.includes(id)) || !/^[0-9a-f]{64}$/u.test(review.evidenceSha256 ?? '')) pendingManual.push(label)
      }
    }
    results.push({ id: testCase.id, eventCount: events.length, toolCount: tools.length })
  }
  if (trace.cases.some(entry => !suite.cases.some(testCase => testCase.id === entry.id))) failures.push('Unknown extra trace case')
  const realHost = trace.layer.startsWith('chatgpt-')
  if (realHost) {
    if (!trace.hostEvidence || !/^[0-9a-f]{64}$/u.test(trace.hostEvidence.sha256 ?? '') || !trace.hostEvidence.recordingReference || !trace.hostEvidence.observedAt || !trace.hostEvidence.reviewer) failures.push('Real-host trace is missing recording/time/reviewer provenance')
  }
  return { passed: failures.length === 0 && pendingManual.length === 0, layer: trace.layer, realHostEvidence: realHost, failures, pendingManual, results, caveat: 'This validates trace declarations and invariants; it neither executes a model nor authenticates a recording. Human evidence review remains required.' }
}

function argumentsFor(argv) {
  const [command, ...rest] = argv
  const options = {}
  for (let index = 0; index < rest.length; index += 2) {
    assert.ok(rest[index].startsWith('--') && rest[index + 1] && !rest[index + 1].startsWith('--'), 'Options require --name value')
    options[rest[index].slice(2)] = rest[index + 1]
  }
  for (const key of Object.keys(options)) assert.ok(['contract', 'out-dir', 'export', 'trace'].includes(key), `Unknown option ${key}`)
  return { command, options }
}

export function main(argv = process.argv.slice(2)) {
  const { command, options } = argumentsFor(argv)
  assert.ok(['prepare', 'check', 'audit-export', 'validate-trace'].includes(command), 'Usage: openai_plugin_submission.mjs prepare|check|audit-export --export PATH|validate-trace --trace PATH [--contract PATH] [--out-dir PATH]')
  const manifestPath = resolve(plugin, '.codex-plugin/plugin.json')
  const manifest = readJson(manifestPath)
  const suitePath = resolve(submission, 'review-cases.json')
  const suite = readJson(suitePath)
  const contractPath = resolve(options.contract ?? resolve(root, 'contracts/drafts/openai', manifest.name, `${manifest.version}-SNAPSHOT/contract/contract.json`))
  const snapshotManifest = resolve(dirname(contractPath), '../plugin.json')
  assert.ok(existsSync(snapshotManifest), 'Contract requires its adjacent exported plugin.json version binding')
  assert.equal(readJson(snapshotManifest).version, manifest.version, 'Exported contract belongs to a different candidate version')
  const mcpPath = resolve(plugin, '.mcp.json')
  const metadataPath = resolve(submission, 'portal-metadata.json')
  const result = generateSubmission({ manifest, mcp: readJson(mcpPath), contract: readJson(contractPath), suite, metadata: readJson(metadataPath), bindings: { contractPath: sourcePath(contractPath), suitePath: sourcePath(suitePath), manifestPath: sourcePath(manifestPath), metadataPath: sourcePath(metadataPath) } })
  validateExecutionMappings(suite)
  if (command === 'validate-trace') {
    assert.ok(options.trace, '--trace is required')
    const traceResult = validateTrace(suite, readJson(resolve(options.trace)))
    console.log(json(traceResult))
    if (!traceResult.passed) process.exitCode = 1
    return traceResult
  }
  const out = resolve(options['out-dir'] ?? resolve(submission, 'generated'))
  if (command === 'audit-export') {
    assert.ok(options.export, '--export is required')
    const audit = auditExport(result.draft, readJson(resolve(options.export)))
    console.log(json(audit))
    if (!audit.matches) process.exitCode = 1
    return audit
  }
  for (const [name, value] of [['portal-draft.json', result.draft], ['preparation.json', result.preparation]]) {
    const path = resolve(out, name)
    if (command === 'check') assert.equal(readFileSync(path, 'utf8'), json(value), `${name} is stale; run prepare after reviewing the current sources`)
    else { mkdirSync(out, { recursive: true }); writeFileSync(path, json(value)) }
  }
  console.log(`CHECK openai_plugin_submission PASS ${manifest.name} ${manifest.version} cases=${suite.cases.length} portal=5+3 state=PREPARED_NOT_SUBMITTED`)
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() } catch (error) { console.error(`CHECK openai_plugin_submission FAIL ${error.message}`); process.exitCode = 1 }
}
