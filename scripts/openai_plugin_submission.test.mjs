import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { assertNoSecrets, auditExport, buildSubmissionZip, digest, generateSubmission, generateSubmissionPackageManifest, main, validateExecutionMappings, validateSubmissionSnapshotSources, validateSuite, validateTrace as validateBoundTrace } from './openai_plugin_submission.mjs'
import { OPENAI_PLUGIN_INSTALL_FILES } from './lib/openai_plugin_install_files.mjs'

const suite = JSON.parse(readFileSync(new URL('../ai/openai plugin/skillpilot-coach-v1/submission/review-cases.json', import.meta.url)))
const manifest = {
  name: 'skillpilot-coach-v1', version: suite.candidateVersion,
  interface: { displayName: 'Fixture coach', shortDescription: 'Fixture description', longDescription: 'Fixture longer description.', developerName: 'Fixture developer', category: 'Education & Research', websiteURL: 'https://fixture.example', privacyPolicyURL: 'https://fixture.example/privacy', termsOfServiceURL: 'https://fixture.example/terms', brandColor: '#123456', defaultPrompt: ['Fixture start?'] },
}
const toolNames = [...new Set(suite.cases.flatMap(entry => [...entry.tools.required, ...entry.tools.forbidden]).filter(name => name !== '*'))]
const contract = { pluginIdentity: manifest.name, tools: toolNames.map(name => ({ name, title: name, description: `${name} fixture only.`, inputSchema: { type: 'object', properties: {} }, outputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: name.startsWith('get_') }, meta: {} })), resources: [] }
const mcp = { mcpServers: { coach: { url: 'https://fixture.example/mcp' } } }
const metadata = { schemaVersion: 1, customerSupportUrl: 'https://fixture.example/help', manualStepsRequired: ['Review the current host.'] }
const bindings = { snapshotManifestSha256: 'a'.repeat(64) }
const input = { manifest, contract, mcp, metadata, suite, bindings }
const clone = value => structuredClone(value)
const expectedCandidate = { contractSha256: digest(contract), snapshotManifestSha256: bindings.snapshotManifestSha256 }
const validateTrace = (source, trace) => validateBoundTrace(source, trace, expectedCandidate)

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
  assert.match(result.acceptanceGuide, /New name 1\.2\.0/u)
  assert.match(result.acceptanceGuide, /https:\/\/new-fixture\.example\/mcp/u)
  assert.equal(result.traceTemplate.candidateVersion, '1.2.0')
  assert.equal(result.traceTemplate.suiteSha256, digest(changed.suite))
})

test('acceptance guide contains every exact setup, turn, oracle and automated mapping', () => {
  const { acceptanceGuide: guide, preparation } = generateSubmission(input)
  assert.match(guide, /Status: NICHT AUSGEFÜHRT/u)
  assert.ok(guide.includes(preparation.sourceBindings.suiteSha256))
  assert.ok(guide.includes(preparation.sourceBindings.contractSha256))
  assert.equal((guide.match(/^## [PND]\d+: /gmu) ?? []).length, suite.cases.length)
  for (const testCase of suite.cases) {
    assert.ok(guide.includes(`## ${testCase.id}: ${testCase.title}`))
    for (const step of suite.fixtures[testCase.fixture].steps) assert.ok(guide.includes(step))
    assert.ok(guide.includes(suite.fixtures[testCase.fixture].expectedStart))
    for (const turn of testCase.turns) {
      assert.ok(guide.includes(`turnId: \`${turn.id}\``))
      for (const line of turn.text.split('\n')) assert.ok(guide.includes(`> ${line}`))
    }
    assert.ok(guide.includes(testCase.portalSummary))
    for (const assertion of testCase.assertions) {
      assert.ok(guide.includes(`- [ ] \`${assertion.id}\``))
      if (assertion.description) assert.ok(guide.includes(assertion.description))
    }
    for (const mapping of testCase.execution.automated) {
      assert.ok(guide.includes(mapping.path))
      assert.ok(guide.includes(mapping.selector))
    }
  }
  for (const step of metadata.manualStepsRequired) assert.ok(guide.includes(step))
})

test('prepared trace has no fabricated observations or approvals and cannot pass validation', () => {
  const { traceTemplate: trace } = generateSubmission(input)
  assert.deepEqual(trace.cases.map(entry => entry.id), suite.cases.map(entry => entry.id))
  assert.equal(trace.runId, '')
  assert.ok(Object.values(trace.hostEvidence).every(value => value === ''))
  assert.throws(() => validateTrace(suite, trace), /run ID/u)
  trace.runId = 'test-incomplete-template'
  const result = validateTrace(suite, trace)
  assert.equal(result.passed, false)
  assert.equal(result.results.length, 0)
  assert.equal(result.failures.filter(failure => failure.includes('missing events')).length, suite.cases.length)
  assert.ok(result.failures.some(failure => failure.includes('missing recording')))
  for (const [index, entry] of trace.cases.entries()) {
    assert.deepEqual(entry.events, [])
    assert.deepEqual(entry.manualReviews.map(review => review.assertionId), suite.cases[index].assertions.filter(assertion => assertion.kind === 'manual').map(assertion => assertion.id))
    for (const review of entry.manualReviews) {
      assert.equal(review.status, 'pending')
      assert.equal(review.reviewer, '')
      assert.equal(review.evidenceSha256, '')
      assert.deepEqual(review.eventIds, [])
    }
  }
  assert.doesNotThrow(() => assertNoSecrets(trace))
})

test('prepare and check bind all six prepared files and detect modified operator materials', t => {
  const temporaryRoot = fileURLToPath(new URL('../tmp/', import.meta.url))
  mkdirSync(temporaryRoot, { recursive: true })
  const output = mkdtempSync(join(temporaryRoot, 'openai-submission-test-'))
  t.after(() => rmSync(output, { recursive: true, force: true }))
  main(['prepare', '--out-dir', output])
  assert.doesNotThrow(() => main(['check', '--out-dir', output]))
  for (const name of ['portal-draft.json', 'preparation.json', 'acceptance-guide.md', 'trace-template.json', 'submission-plugin.json', 'submission-package.json']) {
    const path = join(output, name)
    const original = readFileSync(path, 'utf8')
    writeFileSync(path, `${original}\nSTALE\n`)
    assert.throws(() => main(['check', '--out-dir', output]), /is stale/u)
    writeFileSync(path, original)
  }
})

test('submission manifest imports reviewed cases and current release notes using documented ZIP field names', () => {
  const source = { ...clone(manifest), skills: './skills/', mcpServers: './.mcp.json' }
  const draft = generateSubmission(input).draft
  const result = generateSubmissionPackageManifest({ manifest: source, draft, metadata, releaseNotes: '# Current release\n\nCurrent changes.\n' })
  assert.equal(source.extensions, undefined)
  assert.equal(result.interface.supportURL, metadata.customerSupportUrl)
  const extension = result.extensions['com.openai']
  assert.equal(extension.review.test_cases.positive.length, 5)
  assert.equal(extension.review.test_cases.negative.length, 3)
  assert.equal(extension.review.demo_recording_url, '')
  assert.equal(extension.publication.release_notes, '# Current release\n\nCurrent changes.')
  for (const [index, entry] of extension.review.test_cases.positive.entries()) {
    assert.equal(entry.prompt, draft.test_cases[index].user_prompt)
    assert.equal(entry.expected_behavior, draft.test_cases[index].expected_output)
    assert.equal(entry.tools_triggered, draft.test_cases[index].tools_triggered)
    assert.equal(entry.user_prompt, undefined)
    assert.equal(entry.expected_output, undefined)
  }
  for (const bad of [{ apps: './.app.json' }, { hooks: {} }, { mcpServers: '../external.json' }]) assert.throws(() => generateSubmissionPackageManifest({ manifest: { ...source, ...bad }, draft, metadata, releaseNotes: 'Current changes.' }))
  const withDemo = { ...metadata, demoRecording: { candidateVersion: source.version, url: 'https://fixture.example/current-demo.mp4' } }
  const demo = generateSubmissionPackageManifest({ manifest: source, draft, metadata: withDemo, releaseNotes: 'Current changes.' })
  assert.equal(demo.extensions['com.openai'].review.demo_recording_url, withDemo.demoRecording.url)
  withDemo.demoRecording.candidateVersion = '1.0.0'
  assert.throws(() => generateSubmissionPackageManifest({ manifest: source, draft, metadata: withDemo, releaseNotes: 'Current changes.' }), /current candidate/u)
  for (const url of [
    'https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4',
    `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/${source.version}/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4`,
  ]) {
    assert.throws(() => generateSubmissionPackageManifest({ manifest: source, draft, metadata: { ...metadata, demoRecording: { candidateVersion: source.version, url } }, releaseNotes: 'Current changes.' }), /historical candidate|Rejected 1.0.0/u)
  }
  for (const data of [{ ...metadata, reviewer_instructions: 'private' }, { ...metadata, clientSecret: 'private' }, { ...metadata, demoRecording: { candidateVersion: source.version, url: 'https://fixture.example/demo?token=private' } }]) {
    assert.throws(() => generateSubmissionPackageManifest({ manifest: source, draft, metadata: data, releaseNotes: 'Current changes.' }), /Secret|credential|Signed URL/u)
  }
})

function packageFixture(t) {
  const temporaryRoot = fileURLToPath(new URL('../tmp/', import.meta.url))
  mkdirSync(temporaryRoot, { recursive: true })
  const repositoryRoot = mkdtempSync(join(temporaryRoot, 'openai-zip-test-'))
  t.after(() => rmSync(repositoryRoot, { recursive: true, force: true }))
  const pluginRoot = join(repositoryRoot, 'plugin')
  const sourceRoot = fileURLToPath(new URL('../ai/openai plugin/skillpilot-coach-v1/', import.meta.url))
  for (const path of OPENAI_PLUGIN_INSTALL_FILES) {
    const target = join(pluginRoot, path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, readFileSync(join(sourceRoot, path)))
  }
  writeFileSync(join(repositoryRoot, 'LICENSE'), readFileSync(new URL('../LICENSE', import.meta.url)))
  for (const args of [['init', '--quiet'], ['add', '--', 'plugin', 'LICENSE']]) assert.equal(spawnSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).status, 0)
  const canonical = JSON.parse(readFileSync(join(pluginRoot, '.codex-plugin/plugin.json')))
  const fixtureMetadata = { ...metadata, customerSupportUrl: canonical.interface.supportURL ?? metadata.customerSupportUrl }
  const draft = generateSubmission({ ...input, manifest: canonical, metadata: fixtureMetadata }).draft
  const submissionManifest = generateSubmissionPackageManifest({ manifest: canonical, draft, metadata: fixtureMetadata, releaseNotes: 'Current reviewed changes.' })
  const build = () => buildSubmissionZip({ repositoryRoot, pluginRoot, manifest: canonical, submissionManifest, sourceBindings: bindings })
  return { repositoryRoot, pluginRoot, canonical, submissionManifest, build }
}

test('submission ZIP has exactly seven install files plus LICENSE, binds hashes, and missing demo never claims readiness', t => {
  const { pluginRoot, build } = packageFixture(t)
  mkdirSync(join(pluginRoot, 'submission'))
  writeFileSync(join(pluginRoot, 'submission', 'private-credentials.json'), '{"password":"DO_NOT_PACKAGE"}')
  writeFileSync(join(pluginRoot, '.env'), 'DO_NOT_PACKAGE')
  const first = build()
  const second = build()
  assert.ok(first.archive.equals(second.archive))
  assert.deepEqual(first.report, second.report)
  assert.deepEqual(first.report.files.map(file => file.path), [...OPENAI_PLUGIN_INSTALL_FILES, 'LICENSE'])
  assert.equal(first.report.submissionReadiness.ready, false)
  assert.ok(first.report.submissionReadiness.pending.includes('current-candidate-demo'))
  assert.equal(first.report.reviewInformation.currentCandidateDemoProvided, false)
  assert.ok(!first.archive.includes(Buffer.from('DO_NOT_PACKAGE')))
  assert.ok(!first.archive.includes(Buffer.from('submission/private-credentials.json')))
  const members = new Map()
  let cursor = 0
  while (first.archive.readUInt32LE(cursor) === 0x04034b50) {
    const size = first.archive.readUInt32LE(cursor + 18)
    const nameLength = first.archive.readUInt16LE(cursor + 26)
    const extraLength = first.archive.readUInt16LE(cursor + 28)
    const path = first.archive.subarray(cursor + 30, cursor + 30 + nameLength).toString('utf8')
    const start = cursor + 30 + nameLength + extraLength
    members.set(path, first.archive.subarray(start, start + size))
    cursor = start + size
  }
  assert.deepEqual([...members.keys()].sort(), [...OPENAI_PLUGIN_INSTALL_FILES, 'LICENSE'].sort())
  for (const file of first.report.files) assert.equal(createHash('sha256').update(members.get(file.path)).digest('hex'), file.sha256)
  const packagedManifest = JSON.parse(members.get('.codex-plugin/plugin.json'))
  assert.equal(packagedManifest.extensions['com.openai'].review.test_cases.positive.length, 5)
  assert.equal(packagedManifest.extensions['com.openai'].review.test_cases.negative.length, 3)
  assert.equal(members.get('LICENSE').toString(), readFileSync(new URL('../LICENSE', import.meta.url), 'utf8'))
  const generated = first.report.files.find(file => file.generated)
  assert.equal(generated.path, '.codex-plugin/plugin.json')
  assert.notEqual(generated.sourceSha256, generated.sha256)
  assert.ok(first.report.files.filter(file => !file.generated).every(file => file.sourceSha256 === file.sha256))
  const skill = join(pluginRoot, 'skills/skillpilot-coach-v1/SKILL.md')
  writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nReviewed follow-up instruction.\n`)
  const changed = build()
  assert.notEqual(changed.report.archiveSha256, first.report.archiveSha256)
  assert.notEqual(changed.report.files.find(file => file.path.endsWith('SKILL.md')).sourceSha256, first.report.files.find(file => file.path.endsWith('SKILL.md')).sourceSha256)
})

test('ZIP packaging rejects secrets, nonempty server headers, missing tracked input and symlinked ancestors', t => {
  const { pluginRoot, build } = packageFixture(t)
  const mcpPath = join(pluginRoot, '.mcp.json')
  const original = readFileSync(mcpPath)
  const current = JSON.parse(original)
  const server = Object.values(current.mcpServers)[0]
  server.headers = { 'X-Test': 'value' }
  writeFileSync(mcpPath, JSON.stringify(current))
  assert.throws(build, /nonempty server headers/u)
  delete server.headers
  server.authentication = { clientSecret: 'DO_NOT_PACKAGE' }
  writeFileSync(mcpPath, JSON.stringify(current))
  assert.throws(build, /Secret/u)
  writeFileSync(mcpPath, original)
  const skill = join(pluginRoot, 'skills/skillpilot-coach-v1/SKILL.md')
  writeFileSync(skill, `Private session sps_${'B'.repeat(43)}`)
  assert.throws(build, /Real session identifier/u)
  rmSync(join(pluginRoot, 'skills'), { recursive: true })
  symlinkSync(resolve(pluginRoot, '../elsewhere'), join(pluginRoot, 'skills'))
  assert.throws(build, /symbolic links/u)
  rmSync(join(pluginRoot, 'skills'))
  assert.equal(spawnSync('git', ['rm', '--cached', '--', 'plugin/.mcp.json'], { cwd: resolve(pluginRoot, '..'), encoding: 'utf8' }).status, 0)
  assert.throws(build, /Git-tracked/u)
})

test('package and audit-zip produce and verify exact ZIP bytes and reject corruption', t => {
  const temporaryRoot = fileURLToPath(new URL('../tmp/', import.meta.url))
  mkdirSync(temporaryRoot, { recursive: true })
  const output = mkdtempSync(join(temporaryRoot, 'openai-zip-cli-test-'))
  t.after(() => rmSync(output, { recursive: true, force: true }))
  main(['package', '--out-dir', output])
  const report = JSON.parse(readFileSync(join(output, 'submission-package.json')))
  const path = join(output, report.archiveName)
  assert.doesNotThrow(() => main(['audit-zip', '--zip', path]))
  const bytes = readFileSync(path)
  bytes[40] ^= 1
  writeFileSync(path, bytes)
  assert.throws(() => main(['audit-zip', '--zip', path]), /differs from the current reviewed source/u)
})

test('alternate contract input must match its adjacent candidate snapshot bytes and identity', t => {
  const temporaryRoot = fileURLToPath(new URL('../tmp/', import.meta.url))
  mkdirSync(temporaryRoot, { recursive: true })
  const output = mkdtempSync(join(temporaryRoot, 'openai-contract-binding-test-'))
  t.after(() => rmSync(output, { recursive: true, force: true }))
  const source = new URL(`../contracts/drafts/openai/skillpilot-coach-v1/${suite.candidateVersion}-SNAPSHOT/`, import.meta.url)
  const localContract = join(output, 'contract/contract.json')
  mkdirSync(join(output, 'contract'))
  const bytes = readFileSync(new URL('contract/contract.json', source), 'utf8')
  const snapshot = JSON.parse(readFileSync(new URL('snapshot-manifest.json', source), 'utf8'))
  writeFileSync(localContract, bytes)
  writeFileSync(join(output, 'plugin.json'), readFileSync(new URL('plugin.json', source)))
  writeFileSync(join(output, 'skills-bundle.json'), readFileSync(new URL('skills-bundle.json', source)))
  const snapshotPath = join(output, 'snapshot-manifest.json')
  writeFileSync(snapshotPath, JSON.stringify(snapshot))
  const prepare = () => main(['prepare', '--contract', localContract, '--out-dir', join(output, 'generated')])
  assert.doesNotThrow(prepare)
  writeFileSync(localContract, `${bytes}\n`)
  assert.throws(prepare, /Contract bytes differ/u)
  writeFileSync(localContract, bytes)
  for (const [field, value] of [['pluginIdentity', 'other-plugin'], ['pluginVersion', '0.0.0']]) {
    writeFileSync(snapshotPath, JSON.stringify({ ...snapshot, [field]: value }))
    assert.throws(prepare, /mismatch/u)
  }
  writeFileSync(snapshotPath, JSON.stringify({ ...snapshot, files: [] }))
  assert.throws(prepare, /exactly one current contract/u)
})

test('same-version install sources and adjacent manifest must match the snapshot before CLI packaging', t => {
  const { pluginRoot, canonical } = packageFixture(t)
  const snapshotRoot = join(pluginRoot, '../snapshot')
  mkdirSync(snapshotRoot)
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
  const record = (path, bytes) => ({ path, bytes: bytes.length, sha256: sha256(bytes) })
  const files = []
  const targets = [
    ['.codex-plugin/plugin.json', 'plugin.json'], ['.mcp.json', 'mcp.json'],
    ['assets/favicon-96x96.png', 'assets/favicon-96x96.png'],
    ['assets/web-app-manifest-512x512.png', 'assets/web-app-manifest-512x512.png'],
    [`release-notes/${canonical.version}.md`, 'release-notes.md'],
  ]
  mkdirSync(join(pluginRoot, 'release-notes'))
  writeFileSync(join(pluginRoot, `release-notes/${canonical.version}.md`), 'Current reviewed release.\n')
  for (const [source, expected] of targets) {
    const bytes = readFileSync(join(pluginRoot, source))
    files.push(record(expected, bytes))
    if (expected === 'plugin.json') writeFileSync(join(snapshotRoot, expected), bytes)
  }
  const skills = OPENAI_PLUGIN_INSTALL_FILES.filter(path => path.startsWith('skills/'))
  const bundleBytes = Buffer.from(JSON.stringify({ schemaVersion: 1, files: skills.map(path => record(path.slice(7), readFileSync(join(pluginRoot, path)))) }))
  writeFileSync(join(snapshotRoot, 'skills-bundle.json'), bundleBytes)
  files.push(record('skills-bundle.json', bundleBytes))
  const snapshot = { files }
  const validate = () => validateSubmissionSnapshotSources({ pluginRoot, snapshotRoot, snapshot, manifest: canonical })
  assert.doesNotThrow(validate)
  for (const source of [...targets.map(([source]) => join(pluginRoot, source)), ...skills.map(source => join(pluginRoot, source)), join(snapshotRoot, 'plugin.json'), join(snapshotRoot, 'skills-bundle.json')]) {
    const original = readFileSync(source)
    // Same length, same candidate version; a size-only/version-only guard
    // would miss this change to MCP, skill, release notes or manifest bytes.
    const changed = Buffer.from(original)
    const index = source.endsWith('plugin.json') ? original.indexOf(Buffer.from('learning')) : original.length - 2
    assert.ok(index >= 0)
    changed[index] ^= 1
    writeFileSync(source, changed)
    assert.throws(validate, /hash differs from candidate snapshot/u)
    writeFileSync(source, original)
    assert.doesNotThrow(validate)
  }
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
  return { schemaVersion: 1, candidateVersion: suite.candidateVersion, suiteSha256: digest(suite), ...expectedCandidate, runId: 'synthetic-unit-test-not-host-evidence', layer: 'backend-fixture', cases: [] }
}

test('same-version contract or package changes invalidate traces, including missing candidate bindings', () => {
  const trace = incompleteTrace()
  for (const field of ['contractSha256', 'snapshotManifestSha256']) {
    const stale = { ...trace, [field]: 'b'.repeat(64) }
    assert.throws(() => validateTrace(suite, stale), /stale or missing/u)
    delete stale[field]
    assert.throws(() => validateTrace(suite, stale), /stale or missing/u)
    const current = { ...expectedCandidate, [field]: 'c'.repeat(64) }
    assert.throws(() => validateBoundTrace(suite, trace, current), /stale or missing/u)
  }
  assert.throws(() => validateBoundTrace(suite, trace), /is required/u)
})

test('public listing and starter prompts cannot copy credentials into generated materials', () => {
  for (const field of ['displayName', 'defaultPrompt']) {
    const changed = clone(input)
    const secret = `Bearer ${'A'.repeat(24)}`
    changed.manifest.interface[field] = field === 'defaultPrompt' ? [secret] : secret
    assert.throws(() => generateSubmission(changed), /credential/u)
  }
})

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
