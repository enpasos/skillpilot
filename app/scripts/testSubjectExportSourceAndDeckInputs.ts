import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSubjectExportSourceReferences } from './subjectExportSourceReferences'
import {
  reviewMappingSourceGoalReferences,
  sanitizeJsonForPackage,
  selectCardDeckFiles,
  selectMappingFiles,
  selectMemoryCardReviewAudits,
  selectSourceExtractionFiles,
  selectSourceExtractionJsonFiles,
  sourceGoalReferenceIndex,
} from './buildSkillpilotExportPackage'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const fixture = mkdtempSync(join(repoRoot, 'tmp/subject-export-inputs-'))
try {
  const runtimeDir = join(fixture, 'runtime')
  const exactDir = join(fixture, 'reviewed')
  mkdirSync(runtimeDir)
  mkdirSync(exactDir)
  const exactDeck = join(exactDir, 'same-name.json')
  const runtimeDeck = join(runtimeDir, 'same-name.json')
  writeFileSync(exactDeck, '{"deckId":"reviewed"}')
  writeFileSync(runtimeDeck, '{"deckId":"old-runtime-copy"}')
  const exactPath = relative(repoRoot, exactDeck)
  const errors: string[] = []
  assert.deepEqual(selectCardDeckFiles({ vocabularySource: exactPath }, errors, [runtimeDir]), [exactDeck],
    'an exact reviewed repository source wins over a stale runtime deck with the same basename')
  assert.deepEqual(selectCardDeckFiles({ vocabularySource: '/data/same-name.json' }, errors, [runtimeDir]), [runtimeDeck],
    'legacy runtime deck URLs keep their established source lookup')
  assert.deepEqual(errors, [])
  const missingErrors: string[] = []
  assert.deepEqual(selectCardDeckFiles({ vocabularySource: `${exactPath}.missing` }, missingErrors, [runtimeDir]), [])
  assert.equal(missingErrors.length, 1)
  const collisionErrors: string[] = []
  selectCardDeckFiles({ goals: [{ vocabularySource: exactPath }, { vocabularySource: '/data/same-name.json' }] }, collisionErrors, [runtimeDir])
  assert.match(collisionErrors[0], /Conflicting card deck sources/u,
    'two different decks cannot silently share one flattened package filename')
  assert.throws(() => selectCardDeckFiles({ vocabularySource: '../outside.json' }, [], [runtimeDir]), /outside the repository/u)

  const subjects = readJson('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
    .subjects as Array<{ landscapePath: string; memoryReviewConfigPath: string }>
  for (const name of ['BIOLOGIE', 'CHEMIE']) {
    const landscapePath = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`
    const landscape = readJson(landscapePath)
    const subjectErrors: string[] = []
    const warnings: string[] = []
    const mappings = selectMappingFiles([], landscape.landscapeId)
    const selected = selectSourceExtractionFiles(mappings, warnings, subjectErrors)
    const jsonSources = selectSourceExtractionJsonFiles(selected)
    assert.equal(jsonSources.length, selected.filter((path) => path.toLowerCase().endsWith('.json')).length)
    const sourceIndex = sourceGoalReferenceIndex(jsonSources, mappings)
    const sourceContract = parseSubjectExportSourceReferences(sourceIndex, {
      artifactPaths: new Set(sourceIndex.sources.map((source) => source.artifactPath)),
      mappingPaths: new Set(sourceIndex.mappingSourceBindings.map((binding) => binding.mappingPath)),
    })
    assert.deepEqual(sourceContract.issues, [], `${name}: source versions have valid qualified identities and authored bindings`)
    assert.deepEqual(reviewMappingSourceGoalReferences(mappings).filter(({ mappingPath, sourceGoalId }) => (
      sourceContract.resolveMapping(mappingPath, sourceGoalId).length === 0
    )), [], `${name}: every current review source ID resolves within its own authored collections, including additional and pending-named source files`)
    assert(sourceIndex.sourceGoalReferenceCount > new Set(sourceIndex.sources.flatMap((source) => source.sourceGoals.map((goal) => goal.sourceGoalId))).size,
      'real overlapping source versions remain separate records instead of being deduplicated by bare ID')
    const decks = selectCardDeckFiles(landscape, subjectErrors)
    assert.equal(decks.length, name === 'BIOLOGIE' ? 6 : 8,
      'all actually referenced bilingual reviewed decks are included without renaming their source files')
    const sanitized = JSON.stringify(sanitizeJsonForPackage(landscape, 'canonical-landscape'))
    assert(!sanitized.includes('"vocabularySource":"curricula/'))
    assert.deepEqual(subjectErrors, [])
  }
  for (const name of ['BIOLOGIE', 'WIRTSCHAFT']) {
    const landscapePath = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`
    const landscape = readJson(landscapePath)
    const active = subjects.find((subject) => subject.landscapePath === landscapePath)!
    const errors: string[] = []
    const audits = selectMemoryCardReviewAudits(landscape.landscapeId, errors)
    assert.equal(audits.length, 1)
    assert.equal(audits[0].configPath, resolve(repoRoot, active.memoryReviewConfigPath))
    assert.equal(audits[0].reportPath, resolve(repoRoot, readJson(active.memoryReviewConfigPath).reportPath))
    assert.deepEqual(errors, [], 'packaged audits use the same current evidence and generated report as the release gate')
  }
  assert.deepEqual(sanitizeJsonForPackage({
    vocabularySource: 'curricula/DE/Gymnasium/quality/goal-evidence/reviewed/deck.json',
    vocabularySourceEn: '/data/deck-en.json',
  }, 'canonical-landscape'), { vocabularySource: 'data/cards/deck.json', vocabularySourceEn: 'data/cards/deck-en.json' })
  const a = 'data/sources/a.json'
  const b = 'data/sources/b.json'
  const c = 'data/sources/c.json'
  const mapping = 'data/mappings/DE-BW/upper/fixture.review.json'
  const v2 = {
    schemaVersion: 2,
    sourceGoalReferenceCount: 3,
    sources: [
      { artifactPath: a, extractionId: 'same-authored-id', sourceGoals: [{ sourceGoalId: 'reused', sourceText: 'Original wording' }] },
      { artifactPath: b, extractionId: 'same-authored-id', sourceGoals: [{ sourceGoalId: 'reused', sourceText: 'Revised wording' }] },
      { artifactPath: c, extractionId: 'unrelated', sourceGoals: [{ sourceGoalId: 'foreign', sourceText: 'Unrelated wording' }] },
    ],
    mappingSourceBindings: [{ mappingPath: mapping, sourceArtifactPaths: [a, b] }],
  }
  const options = { artifactPaths: new Set([a, b, c]), mappingPaths: new Set([mapping]) }
  const parsed = parseSubjectExportSourceReferences(v2, options)
  assert.deepEqual(parsed.issues, [])
  assert.deepEqual(parsed.resolveMapping(mapping, 'reused').map(({ artifactPath, goal }) => [artifactPath, goal.sourceText]),
    [[a, 'Original wording'], [b, 'Revised wording']], 'every explicitly bound version retains its own original source text')
  assert.deepEqual(parsed.resolveMapping(mapping, 'foreign'), [], 'a matching bare ID in an unbound source is insufficient')
  assert.deepEqual(parsed.resolveMapping('data/mappings/DE-BW/upper/unknown.review.json', 'reused'), [])
  assert.deepEqual(parsed.resolveMapping(mapping, 'unknown'), [])
  const mutated = (change: (value: typeof v2) => void) => {
    const value = structuredClone(v2)
    change(value)
    return parseSubjectExportSourceReferences(value, options)
  }
  assert(mutated((value) => { value.sources[1].sourceGoals.push(value.sources[1].sourceGoals[0]); value.sourceGoalReferenceCount += 1 }).issues.some((issue) => /Duplicate sourceGoalId within collection/u.test(issue)))
  assert(mutated((value) => { value.sources[1].artifactPath = a }).issues.some((issue) => /Duplicate source collection/u.test(issue)))
  assert(mutated((value) => { value.sources[0].artifactPath = 'data/sources/../escape.json' }).issues.length > 0)
  assert(mutated((value) => { value.mappingSourceBindings[0].sourceArtifactPaths = ['data/sources/missing.json'] }).issues.some((issue) => /Unknown source collection binding/u.test(issue)))
  assert(mutated((value) => { value.mappingSourceBindings = [] }).issues.some((issue) => /Missing mapping source binding/u.test(issue)))
  assert(mutated((value) => { value.sourceGoalReferenceCount = 0 }).issues.length > 0)
  assert(parseSubjectExportSourceReferences(v2, { ...options, artifactPaths: new Set([a, c]) }).issues.some((issue) => /Missing source collection artifact/u.test(issue)))
  assert(parseSubjectExportSourceReferences(v2, { ...options, mappingPaths: new Set() }).issues.some((issue) => /Unknown mapping source binding/u.test(issue)))
  const legacy = { schemaVersion: 1, sources: [{ extractionId: 'legacy', sourceGoals: [{ sourceGoalId: 'old-id', sourceText: 'Original wording' }] }] }
  assert.deepEqual(parseSubjectExportSourceReferences(legacy).issues, [])
  assert.equal(parseSubjectExportSourceReferences(legacy).resolveMapping(mapping, 'old-id').length, 1)
  const duplicatedLegacy = { ...legacy, sources: [...legacy.sources, ...legacy.sources] }
  assert(parseSubjectExportSourceReferences(duplicatedLegacy).issues.some((issue) => /Duplicate legacy sourceGoalId/u.test(issue)))
  assert.deepEqual(parseSubjectExportSourceReferences(duplicatedLegacy).resolveMapping(mapping, 'old-id'), [], 'v1 cannot silently adopt v2 duplicate semantics')
  assert(parseSubjectExportSourceReferences({ ...v2, schemaVersion: 3 }).issues.length > 0)
  process.stdout.write('Subject export input tests passed: exact reviewed decks, collision negatives, current Bio/Chem source closure and active audit routing.\n')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
