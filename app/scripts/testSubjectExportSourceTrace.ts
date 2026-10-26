import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'
import { createDeterministicZip32 } from './deterministicZip32'
import { selectSourceTraceEvidence } from './traceSubjectExportSourceReference'

const firstPath = 'data/sources/DE-BY/upper/first.json'
const secondPath = 'data/sources/DE-BY/upper/second.json'
const mappingPath = 'data/mappings/DE-BY/upper/review.review.json'
const makeSource = (artifactPath: string, sourceText: string) => ({
  artifactPath, extractionId: artifactPath, sourceGoals: [{
    sourceGoalId: 'shared-source-id', sourceText,
    sourceTextSha256: createHash('sha256').update(sourceText).digest('hex'),
    sourceDocumentUrl: 'https://example.org/official.pdf',
  }],
})
const first = makeSource(firstPath, 'First authored source version.')
const second = makeSource(secondPath, '  A different authored source version.\n')
const versionTwo = {
  schemaVersion: 2, sourceGoalReferenceCount: 2, sources: [first, second],
  mappingSourceBindings: [{ mappingPath, sourceArtifactPaths: [firstPath] }],
}
const mapping = {
  mappingPath, reviewId: null, sourceLandscapeId: null, targetLandscapeId: 'target',
  legacyGoalId: 'shared-source-id', reviewDecisionId: null, sourceGoalId: 'shared-source-id',
  canonicalGoalId: 'canonical-goal', matchType: 'exact', jurisdiction: 'DE-BY', stage: 'upper',
}
const sourceQuery = { sourceGoalId: 'shared-source-id', sourceArtifactPath: null, canonicalGoalId: null }
const canonicalQuery = { sourceGoalId: null, sourceArtifactPath: null, canonicalGoalId: 'canonical-goal' }

assert.throws(() => selectSourceTraceEvidence(versionTwo, [mapping], sourceQuery), /Ambiguous source goal ID/u,
  'an unqualified duplicate ID cannot silently choose or overwrite a source version')
const selectedSecond = selectSourceTraceEvidence(versionTwo, [], { ...sourceQuery, sourceArtifactPath: secondPath })
assert.equal(selectedSecond.sourceGoals[0].sourceText, second.sourceGoals[0].sourceText,
  'a qualified trace retains exact authored text, including its whitespace')
assert.equal(selectedSecond.sourceGoals[0].sourceTextSha256, second.sourceGoals[0].sourceTextSha256)
const canonicalTrace = selectSourceTraceEvidence(versionTwo, [mapping], canonicalQuery)
assert.deepEqual(canonicalTrace.sourceGoals.map((goal) => goal.artifactPath), [firstPath],
  'a canonical query uses the mapping collection binding rather than another version with the same ID')
const allVersions = structuredClone(versionTwo)
allVersions.mappingSourceBindings[0].sourceArtifactPaths.push(secondPath)
assert.deepEqual(selectSourceTraceEvidence(allVersions, [mapping], canonicalQuery).sourceGoals
  .map((goal) => goal.sourceText), [first.sourceGoals[0].sourceText, second.sourceGoals[0].sourceText],
  'all explicitly bound source versions remain visible without selecting one text')
assert.throws(() => selectSourceTraceEvidence(versionTwo, [], { ...sourceQuery, sourceArtifactPath: 'data/sources/unknown.json' }),
  /Unknown source artifact path/u)
assert.throws(() => selectSourceTraceEvidence(versionTwo, [{ ...mapping, sourceGoalId: 'unresolved' }], canonicalQuery),
  /Unresolved source goal/u)
const legacy = { schemaVersion: 1, sourceGoalReferenceCount: 1, sources: [first] }
assert.equal(selectSourceTraceEvidence(legacy, [mapping], sourceQuery).sourceGoals[0].artifactPath, null,
  'unambiguous legacy source-ID queries retain their original interface')
assert.throws(() => selectSourceTraceEvidence({ ...legacy, sources: [first, second] }, [], sourceQuery),
  /Duplicate legacy sourceGoalId/u, 'the legacy v1 reader remains globally unique and strict')

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
mkdirSync(join(repoRoot, 'tmp'), { recursive: true })
const directory = mkdtempSync(join(repoRoot, 'tmp/source-trace-regression-'))
const archiveRoot = 'source-trace-regression'
const jsonEntry = (path: string, value: unknown) => {
  const content = Buffer.from(JSON.stringify(value))
  return { packagePath: `${archiveRoot}/${path}`, content, bytes: content.length,
    sha256: createHash('sha256').update(content).digest('hex'), crc32: crc32(content) >>> 0 }
}
const traceScript = fileURLToPath(new URL('./traceSubjectExportSourceReference.ts', import.meta.url))
try {
  const zipPath = join(directory, 'v2.zip')
  createDeterministicZip32([
    jsonEntry('data/sources/source-goal-references.json', versionTwo),
    jsonEntry('data/canonical/subject.landscape.json', { goals: [{ id: 'canonical-goal' }] }),
    jsonEntry(firstPath, {}), jsonEntry(secondPath, {}),
    jsonEntry(mappingPath, { decisions: [{ sourceGoalId: 'shared-source-id', canonicalGoalIds: ['canonical-goal'] }] }),
  ], new Date('2026-01-01T00:00:00Z'), zipPath)
  const run = (...args: string[]) => spawnSync(process.execPath,
    ['--import', 'tsx', traceScript, '--zip', zipPath, '--format', 'json', ...args],
    { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' })
  const ambiguous = run('--source-goal-id', 'shared-source-id')
  assert.equal(ambiguous.status, 1)
  assert.match(ambiguous.stderr, /Ambiguous source goal ID/u)
  const qualified = run('--source-goal-id', 'shared-source-id', '--source-artifact-path', secondPath)
  assert.equal(qualified.status, 0, qualified.stderr)
  assert.equal(JSON.parse(qualified.stdout).sourceGoals[0].sourceText, second.sourceGoals[0].sourceText)
  const byCanonical = run('--canonical-goal-id', 'canonical-goal')
  assert.equal(byCanonical.status, 0, byCanonical.stderr)
  const result = JSON.parse(byCanonical.stdout)
  assert.equal(result.sourceGoals[0].artifactPath, firstPath)
  assert.equal(result.mappings[0].canonicalGoalId, 'canonical-goal',
    'actual CLI tracing supports review decisions with canonicalGoalIds arrays')
  console.log('Subject source trace passed: versioned identity, ambiguity rejection, exact text, authored mapping binding, and CLI qualifier.')
} finally {
  rmSync(directory, { recursive: true, force: true })
}
