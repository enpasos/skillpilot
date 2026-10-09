import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createMissingSourceExtractionPipeline,
  readSourceExtractionGoalIdsByLandscapeId,
} from './generateCurriculumQualityStatus'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const fullPath = 'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_BIOLOGIE_SEKI_FACHANFORDERUNGEN_2023.source-extraction.json'
const componentPath = 'curricula/DE/Gymnasium/input/SH/source-components/DE_SH_BIOLOGIE_SEKI_HIERARCHY_BOUNDED_20261009_V1.source-extraction.json'
const full = JSON.parse(readFileSync(join(repoRoot, fullPath), 'utf8'))
const component = JSON.parse(readFileSync(join(repoRoot, componentPath), 'utf8'))
const sourceId = full.sourceLandscapeId as string
const expectedIds = full.sourceGoals.map((goal: { id: string }) => goal.id).sort() as string[]
assert.equal(expectedIds.length, 9, 'The original SH source inventory contains nine goals.')
assert.equal(component.sourceLandscapeId, sourceId)
assert.equal(component.sourceGoals.length, 1)
assert(expectedIds.includes(component.sourceGoals[0].id), 'The bounded component repeats an original source goal.')

const temporaryRoot = mkdtempSync(join(tmpdir(), 'source-extraction-inventory-'))
const writeJson = (root: string, path: string, value: unknown) => {
  const absolutePath = join(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, JSON.stringify(value))
  return absolutePath
}
const inventoryIds = (root: string, atomicOnly = false, id = sourceId) => (
  [...(readSourceExtractionGoalIdsByLandscapeId(atomicOnly, root).get(id) ?? [])].sort()
)
const assertUnreviewed = (pipeline: ReturnType<typeof createMissingSourceExtractionPipeline>) => {
  assert(pipeline)
  assert.equal(pipeline.currentStep, 'MAPPING-1')
  assert.equal(pipeline.completedSteps, 0, 'File presence must never complete a review step.')
  assert.equal(pipeline.totalSteps, 3)
  assert.deepEqual(pipeline.steps.map(({ status }) => status), ['incomplete', 'blocked', 'blocked'])
  assert(pipeline.steps.every(({ status }) => status !== 'complete'))
}

try {
  // Reproduce the actual 9 + 1 collision, and reverse its lexical load order.
  for (const reverse of [false, true]) {
    const root = join(temporaryRoot, reverse ? 'component-first' : 'full-first')
    writeJson(root, reverse ? 'z/full.source-extraction.json' : 'a/full.source-extraction.json', full)
    writeJson(root, reverse ? 'a/source-components/component.source-extraction.json' : 'z/source-components/component.source-extraction.json', component)
    assert.deepEqual(inventoryIds(root), expectedIds, 'A component must never replace the full source inventory in either load order.')
    assert.deepEqual(inventoryIds(root, true), expectedIds, 'The nine original source goals remain atomic.')
  }
  const repositoryIds = readSourceExtractionGoalIdsByLandscapeId(false).get(sourceId) ?? new Set<string>()
  expectedIds.forEach((id) => assert(repositoryIds.has(id),
    `The actual repository input tree must retain original SH goal ${id}; additional component IDs are permitted.`))

  const atomicRoot = join(temporaryRoot, 'atomic-filter')
  writeJson(atomicRoot, 'a.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [
      { id: 'cluster', contains: ['leaf-one', 'leaf-two'] },
      { id: 'leaf-one', contains: [] },
      { id: 'leaf-two' },
    ],
  })
  writeJson(atomicRoot, 'source-components/z.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'leaf-one' }, { id: 'leaf-three' }, { id: '' }],
  })
  assert.deepEqual(inventoryIds(atomicRoot), ['cluster', 'leaf-one', 'leaf-three', 'leaf-two'])
  assert.deepEqual(inventoryIds(atomicRoot, true), ['leaf-one', 'leaf-three', 'leaf-two'])
  writeJson(atomicRoot, 'source-components/new.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'leaf-four' }],
  })
  assert(inventoryIds(atomicRoot, true).includes('leaf-four'), 'A fixture root must be reread after a new extraction.')
  const otherRoot = join(temporaryRoot, 'other-root')
  writeJson(otherRoot, 'only.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'other-root-leaf' }],
  })
  assert.deepEqual(inventoryIds(otherRoot, true), ['other-root-leaf'], 'Cached real or fixture roots must not leak into another root.')
  assert.equal(readSourceExtractionGoalIdsByLandscapeId(false, join(temporaryRoot, 'absent')).size, 0)

  const versionRoot = join(temporaryRoot, 'regular-version-selection')
  writeJson(versionRoot, 'a-author.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'candidate-whole-row-held', wholeSourceApproval: false }],
  })
  writeJson(versionRoot, 'z-current.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'current-original' }],
  })
  writeJson(versionRoot, 'source-components/component.source-extraction.json', {
    sourceLandscapeId: sourceId,
    sourceGoals: [{ id: 'current-original' }, { id: 'additional-original' }],
  })
  assert.deepEqual(inventoryIds(versionRoot), ['additional-original', 'current-original'],
    'Regular version selection must stay unchanged; components may add obligations, but historical versions must not be unioned.')
  const componentOnlyRoot = join(temporaryRoot, 'component-only')
  writeJson(componentOnlyRoot, 'source-components/first.source-extraction.json', {
    sourceLandscapeId: sourceId, sourceGoals: [{ id: 'first-original' }],
  })
  writeJson(componentOnlyRoot, 'source-components/second.source-extraction.json', {
    sourceLandscapeId: sourceId, sourceGoals: [{ id: 'first-original' }, { id: 'second-original' }],
  })
  assert.deepEqual(inventoryIds(componentOnlyRoot), ['first-original', 'second-original'],
    'A source with no regular extraction must retain every component obligation exactly once.')

  const repository = join(temporaryRoot, 'repository')
  const referencedPath = 'quality/current/source.additional-source.json'
  const primaryPath = 'input/current-primary.pdf'
  mkdirSync(join(repository, 'input'), { recursive: true })
  writeFileSync(join(repository, primaryPath), 'Fixture primary source bytes')
  const extraction = {
    sourceLandscapeId: 'explicit-source',
    title: 'Explicit bounded source component',
    subject: 'Biologie',
    jurisdiction: 'DE-SH',
    stage: 'SekII',
    durationModels: ['G9'],
    sourceDocuments: [{
      key: 'current-primary', title: 'Current primary source', path: primaryPath,
      url: 'https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html', official: true,
    }],
    sourceGoals: [{ id: 'source-goal' }],
    passages: [{ id: 'passage' }],
  }
  writeJson(repository, referencedPath, extraction)
  const mapping = {
    file: 'mapping/current.review.json',
    sourceLandscapeId: extraction.sourceLandscapeId,
    sourceExtractionPath: referencedPath,
    mappings: [{ legacyGoalId: 'source-goal', canonicalGoalId: 'target-goal', matchType: 'partial' }],
  }
  const present = createMissingSourceExtractionPipeline(mapping, new Map(), repository)
  assertUnreviewed(present)
  assert(present)
  assert.equal(present.sourceKind, 'source-extraction', 'An explicitly referenced existing extraction must not be labelled missing.')
  assert.equal(present.path, referencedPath)
  assert.equal(present.title, extraction.title)
  assert.equal(present.subject, extraction.subject)
  assert.equal(present.stage, extraction.stage)
  assert.equal(present.jurisdiction, extraction.jurisdiction, 'Unregistered source metadata remains visible without inventing a registry entry.')
  assert.deepEqual(present.durationModels, extraction.durationModels)
  assert.equal(present.sourceGoals, 1)
  assert.equal(present.passages, 1)
  assert.equal(present.sourceDocuments?.[0].path, primaryPath)
  assert.equal(present.sourceDocuments?.[0].available, true)
  assert.equal(present.sourceDocuments?.[0].hasUsableUrl, true)
  assert.equal(present.steps[0].checks.find(({ id }) => id === 'source-extraction-file-present')?.passed, true)
  assert.equal(present.steps[0].checks.find(({ id }) => id === 'source-landscape-registered')?.passed, false)
  assert.equal(present.steps[0].checks.find(({ id }) => id === 'source-extraction-review-complete')?.passed, false)

  const registered = createMissingSourceExtractionPipeline(mapping, new Map([[
    extraction.sourceLandscapeId,
    { landscapeId: extraction.sourceLandscapeId, title: 'Registered source', jurisdiction: 'DE-SH' },
  ]]), repository)
  assertUnreviewed(registered)
  assert.equal(registered?.steps[0].checks.find(({ id }) => id === 'source-landscape-registered')?.passed, true)
  writeJson(repository, referencedPath, {
    ...extraction,
    pipelineStatus: { steps: ['MAPPING-1', 'MAPPING-2', 'MAPPING-3'].map((id) => ({ id, status: 'complete' })) },
  })
  assertUnreviewed(createMissingSourceExtractionPipeline(mapping, new Map(), repository))

  const wrongIdPath = 'quality/current/wrong-id.json'
  writeJson(repository, wrongIdPath, { ...extraction, sourceLandscapeId: 'other-source' })
  const wrongId = createMissingSourceExtractionPipeline({ ...mapping, sourceExtractionPath: wrongIdPath }, new Map(), repository)
  assertUnreviewed(wrongId)
  assert.equal(wrongId?.sourceKind, 'missing-extraction')
  assert.equal(wrongId?.sourceGoals, 0, 'A wrong Source-ID must not contribute inventory or metadata.')
  assert.equal(wrongId?.jurisdiction, '')
  assert.equal(wrongId?.steps[0].checks[0].passed, false)
  assert.match(wrongId!.steps[0].checks[0].details ?? '', /Source-ID/)

  const missing = createMissingSourceExtractionPipeline({ ...mapping, sourceExtractionPath: 'quality/absent.json' }, new Map(), repository)
  assertUnreviewed(missing)
  assert.equal(missing?.sourceKind, 'missing-extraction', 'Other quality files must not be scanned to replace an absent explicit reference.')
  assert.equal(missing?.sourceGoals, 0)
  assert.equal(missing?.steps[0].checks[0].passed, false)

  const outside = writeJson(temporaryRoot, 'outside.json', extraction)
  const symlinkPath = 'quality/current/outside-symlink.json'
  symlinkSync(outside, join(repository, symlinkPath))
  for (const path of ['../outside.json', outside, symlinkPath]) {
    const rejected = createMissingSourceExtractionPipeline({ ...mapping, sourceExtractionPath: path }, new Map(), repository)
    assertUnreviewed(rejected)
    assert.equal(rejected?.sourceKind, 'missing-extraction', 'An explicit reference must remain inside the repository, including symlink targets.')
    assert.equal(rejected?.sourceGoals, 0)
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}

console.log('Source-extraction component inventory and conservative explicit-reference regressions passed.')
