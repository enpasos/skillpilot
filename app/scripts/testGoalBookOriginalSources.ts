import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GoalBookModel } from './goalBookModel'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from './goalBookOriginalSources'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const loadBook = (subject: string): GoalBookModel => JSON.parse(readFileSync(
  resolve(root, `app/public/lernzielbuch/de-gym-${subject}-bundesweit.book-model.json`), 'utf8',
)) as GoalBookModel
const template = loadBook('mathematik')
const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'skillpilot-original-sources-test-'))
const extractionPath = 'curricula/DE/Gymnasium/input/fixture.json'
const mappingPath = 'curricula/DE/Gymnasium/mapping/fixture.review.json'
const landscapePath = 'curricula/DE/Gymnasium/canonical/fixture.json'
type Row = Record<string, unknown>
const write = (path: string, value: unknown) => {
  const target = resolve(temporaryRoot, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify(value))
}
const sourceGoal = (id: string, overrides: Row = {}): Row => ({
  id, passageId: 'p1', sourceRef: 'Original section 7.3, S. 8', stage: 'SekI',
  durationModel: 'G8', ...overrides,
})
const model = structuredClone(template)
model.book.landscapeId = 'test-landscape'
model.source.landscapePath = landscapePath
const scope = { stage: 'SekI' as const, durationModel: 'G8' as const, courseProfile: null }
model.pages = [{ ...template.pages[0], goalId: 'leaf', applicability: [
  { jurisdiction: 'DE-HE', scopes: [scope, { ...scope, durationModel: 'G9' }] },
  { jurisdiction: 'DE-BY', scopes: [scope] },
] }]
const baselineLandscape = {
  landscapeId: 'test-landscape', goals: [
    { id: 'root', contains: ['topic'] },
    { id: 'topic', contains: ['leaf'] },
    { id: 'leaf', contains: [], requires: ['dependency'], tags: ['SekII', 'GK', 'LK'] },
    { id: 'dependency', contains: [] },
  ],
}
const baselineExtraction = {
  sourceLandscapeId: 'source-landscape', jurisdiction: 'DE-HE', stage: 'SekI',
  sourceDocument: { key: 'D', title: 'Official original', official: true, url: 'https://example.org/original.pdf' },
  passages: [{ id: 'p1', page: 8 }], sourceGoals: [sourceGoal('source')],
}
const mapping = (target: string, sourceIds = ['source']) => ({
  targetLandscapeId: 'test-landscape', sourceLandscapeId: 'source-landscape', sourceExtractionPath: extractionPath,
  decisions: sourceIds.map((sourceGoalId) => ({ sourceGoalId, decision: 'mapped', canonicalGoalIds: [target] })),
  mappings: [{ legacyGoalId: 'source', canonicalGoalId: 'leaf', matchType: 'exact' }],
})
const reset = () => {
  write(landscapePath, baselineLandscape)
  write(extractionPath, baselineExtraction)
  write(mappingPath, mapping('leaf'))
}
const build = () => buildGoalBookOriginalSources(model, temporaryRoot)

try {
  reset()
  const direct = build()
  assert.equal(direct.bookDigest, model.digest)
  assert.equal(direct.goals.leaf.length, 3, 'all exact matrix tuples remain, including missing sources')
  assert.equal(direct.goals.leaf[0].evidenceIds.length, 1)
  assert.equal(direct.goals.leaf[1].evidenceIds.length, 0, 'G8 source is not evidence for G9')
  assert.equal(direct.goals.leaf[2].evidenceIds.length, 0, 'HE source is not evidence for BY')
  assert.equal(direct.evidence[0].kind, 'direct')
  assert.equal(direct.evidence[0].scopeMatch, 'exact')
  assert.equal(direct.documents[0].url, 'https://example.org/original.pdf', 'printed page never becomes an invented PDF anchor')
  assert.equal(direct.evidence[0].sourceRef, 'Original section 7.3, S. 8')
  assert.equal(serializeGoalBookOriginalSources(build()), serializeGoalBookOriginalSources(direct), 'deterministic bytes')
  assert.ok(serializeGoalBookOriginalSources(direct).endsWith('\n'))

  write(mappingPath, mapping('topic'))
  const inherited = build()
  assert.equal(inherited.evidence[0].kind, 'inherited')
  assert.equal(inherited.evidence[0].mappedTargetGoalId, 'topic', 'preserve actual reviewed ancestor target')
  write(landscapePath, { ...baselineLandscape, goals: baselineLandscape.goals.map((goal) => goal.id === 'topic'
    ? { ...goal, extendedData: { applicabilityMappingInheritance: 'boundary' } } : goal) })
  assert.equal(build().evidence.length, 1, 'a boundary may inherit its own direct mapping downwards')
  write(mappingPath, mapping('root'))
  assert.equal(build().evidence.length, 0, 'no inheritance across a supplement boundary')

  reset()
  write(mappingPath, mapping('dependency'))
  assert.equal(build().evidence.length, 0, 'requires is never an original-source mapping')
  write(mappingPath, { ...mapping('leaf'), decisions: [{ sourceGoalId: 'source', decision: 'excluded', canonicalGoalIds: [] }] })
  assert.equal(build().evidence.length, 0, 'stale compatibility mappings cannot override authoritative decisions')

  reset()
  write(extractionPath, { ...baselineExtraction, stage: 'SekI+SekII', sourceGoals: [
    sourceGoal('source', { stage: undefined, durationModel: undefined }),
  ] })
  const context = build()
  assert.equal(context.goals.leaf[0].evidenceIds.length, 1)
  assert.deepEqual(context.evidence[0].unspecifiedDimensions, ['stage', 'durationModel'])
  assert.equal(context.evidence[0].scopeMatch, 'source-context', 'mixed-stage collection does not locate a source goal')
  assert.deepEqual(context.evidence[0].sourceScope.stage, [], 'canonical SekII/GK/LK tags are not source metadata')

  reset()
  const upperModel = structuredClone(model)
  upperModel.pages[0].applicability = [{ jurisdiction: 'DE-HE', scopes: [
    { stage: 'SekII', durationModel: null, courseProfile: 'GK' },
    { stage: 'SekII', durationModel: null, courseProfile: 'LK' },
    scope,
  ] }]
  write(extractionPath, { ...baselineExtraction, stage: 'SekII', sourceGoals: [sourceGoal('source', { stage: 'SekII', courseLevel: 'LK' })] })
  let upper = buildGoalBookOriginalSources(upperModel, temporaryRoot)
  assert.deepEqual(upper.goals.leaf.map((row) => row.evidenceIds.length), [0, 1, 0], 'LK and upper-secondary source cannot leak into GK or SekI')
  for (const courseLevel of ['GK_LK', 'GK/LK', 'both']) {
    write(extractionPath, { ...baselineExtraction, stage: 'SekII', sourceGoals: [sourceGoal('source', { stage: 'SekII', courseLevel })] })
    upper = buildGoalBookOriginalSources(upperModel, temporaryRoot)
    assert.deepEqual(upper.goals.leaf.map((row) => row.evidenceIds.length), [1, 1, 0], `${courseLevel} explicitly covers both courses`)
  }
  write(extractionPath, { ...baselineExtraction, stage: 'SekII', sourceGoals: [sourceGoal('source', { stage: 'SekII', courseLevel: 'unspecified' })] })
  upper = buildGoalBookOriginalSources(upperModel, temporaryRoot)
  assert.deepEqual(upper.evidence[0].unspecifiedDimensions, ['courseProfile'])
  write(extractionPath, { ...baselineExtraction, stage: 'SekI+SekII',
    sourceDocument: { ...baselineExtraction.sourceDocument, stage: 'SekII', courseProfile: 'LK' },
    sourceGoals: [sourceGoal('source', { stage: 'unspecified', courseLevel: 'unspecified' })],
  })
  upper = buildGoalBookOriginalSources(upperModel, temporaryRoot)
  assert.deepEqual(upper.goals.leaf.map((row) => row.evidenceIds.length), [0, 1, 0], 'unknown goal metadata preserves explicit document restrictions')
  assert.deepEqual(upper.evidence[0].unspecifiedDimensions, [])
  for (const contradictory of [
    { tags: ['stage:SekII'] },
    { tags: ['durationModel:G9'] },
    { courseProfile: 'GK', courseLevel: 'LK' },
  ]) {
    reset()
    write(extractionPath, { ...baselineExtraction, sourceGoals: [sourceGoal('source', contradictory)] })
    assert.equal(build().evidence.length, 0, 'contradictory field/tag restrictions are excluded, not relabeled as unspecified')
  }
  reset()
  write(extractionPath, { ...baselineExtraction,
    sourceDocument: { ...baselineExtraction.sourceDocument, durationModel: 'G9' },
  })
  assert.equal(build().evidence.length, 0, 'opposing goal and document duration restrictions cannot expand applicability')

  reset()
  write(extractionPath, { ...baselineExtraction, sourceDocuments: [
    baselineExtraction.sourceDocument,
    { ...baselineExtraction.sourceDocument, key: 'OTHER', url: 'https://example.org/other.pdf' },
  ] })
  assert.equal(build().evidence.length, 0, 'ambiguous documents have no arbitrary first-document fallback')
  write(extractionPath, { ...baselineExtraction, sourceDocument: { ...baselineExtraction.sourceDocument, official: false } })
  assert.equal(build().evidence.length, 0, 'no invented official-source claim')
  write(extractionPath, { ...baselineExtraction, sourceDocument: { ...baselineExtraction.sourceDocument, url: 'javascript:alert(1)' } })
  assert.equal(build().evidence.length, 0, 'unsafe links are excluded')

  reset()
  write(extractionPath, { ...baselineExtraction, sourceGoals: [sourceGoal('source'), sourceGoal('same-locator')] })
  write(mappingPath, mapping('leaf', ['source', 'same-locator']))
  assert.equal(build().evidence.length, 1, 'same locator retains one genuine witness, not repeated mapping exports')
  write(mappingPath, { ...mapping('leaf'), sourceExtractionPath: '../outside.json' })
  assert.throws(build, /repository-relative/u, 'source references cannot escape the repository')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}

for (const subject of ['mathematik', 'physik']) {
  const current = loadBook(subject)
  const index = buildGoalBookOriginalSources(current)
  const serialized = serializeGoalBookOriginalSources(index)
  assert.ok(Buffer.byteLength(serialized) < 8 * 1024 * 1024, `${subject}: bounded public sidecar`)
  const tuples = Object.values(index.goals).flat()
  assert.equal(tuples.length, current.pages.reduce((total, page) => total + (page.applicability ?? []).reduce((n, group) => n + group.scopes.length, 0), 0))
  assert.ok(Math.max(...tuples.map((tuple) => tuple.evidenceIds.length)) <= 256)
  assert.ok(tuples.some((tuple) => !tuple.evidenceIds.length), 'missing goal-specific evidence stays explicit')
  const exampleId = subject === 'mathematik' ? 'cf474eab-1379-4877-907e-58b0892ce734' : 'f1a078ae-6262-4444-a4bc-a5ab275621cf'
  const examples = index.goals[exampleId].filter((tuple) => tuple.jurisdiction === 'DE-HE')
  const evidenceById = new Map(index.evidence.map((item) => [item.id, item]))
  assert.ok(examples.every((tuple) => tuple.evidenceIds.some((id) => evidenceById.get(id)?.kind === 'direct')))
  if (subject === 'mathematik') {
    const docById = new Map(index.documents.map((doc) => [doc.id, doc]))
    for (const tuple of examples) {
      const urls = tuple.evidenceIds.map((id) => docById.get(evidenceById.get(id)!.documentId)!.url)
      assert.ok(urls.some((url) => url.endsWith(`${tuple.durationModel!.toLowerCase()}-mathematik.pdf`)))
      assert.ok(!urls.some((url) => url.endsWith(`${tuple.durationModel === 'G8' ? 'g9' : 'g8'}-mathematik.pdf`)))
    }
  } else {
    assert.ok(examples[0].evidenceIds.some((id) => evidenceById.get(id)?.sourceRef.includes('S. 8')))
  }
  console.log(`Original sources ${subject}: ${Buffer.byteLength(serialized)} bytes; ${tuples.length} exact matrix tuples; ${tuples.filter((tuple) => !tuple.evidenceIds.length).length} without documented individual source`)
}
console.log('Goal-book original-source regression tests passed.')
