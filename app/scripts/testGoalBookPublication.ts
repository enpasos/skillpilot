import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  assertCanonicalRelationUrls,
  assertGoalBookSourceAtlasConfigBinding,
  defaultGoalBookPublicationPaths,
  goalBookPublicationPaths,
  parseGoalBookPublicationIndex,
  verifyPublishedGoalBook,
  verifyPublishedGoalBooks,
} from './checkGoalBookPublication'
import { serviceWorkerPrecacheGlobIgnores } from '../serviceWorkerNavigationPolicy'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../src/utils/goalBookPublicationRegistry'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { buildGoalBookOriginalSources } from './goalBookOriginalSources'

const sourceBindingFixture = {
  bookId: 'fixture-atlas', landscapePath: 'fixture-landscape.json',
  semanticKindLedgerPath: 'fixture-types.json', manifestPath: 'fixture.sources.json',
}
const nativeBindingFixture = {
  bookId: sourceBindingFixture.bookId, landscapePath: sourceBindingFixture.landscapePath,
  semanticKindLedgerPath: sourceBindingFixture.semanticKindLedgerPath,
  compositionViewManifestPath: sourceBindingFixture.manifestPath,
}
assert.doesNotThrow(() => assertGoalBookSourceAtlasConfigBinding(sourceBindingFixture, nativeBindingFixture))
for (const key of ['bookId', 'landscapePath', 'semanticKindLedgerPath', 'manifestPath'] as const) {
  assert.throws(
    () => assertGoalBookSourceAtlasConfigBinding({ ...sourceBindingFixture, [key]: 'different-input' }, nativeBindingFixture),
    /input companion does not match/u,
    `a source-input companion cannot verify another ${key}`,
  )
}

const verifiedBooks = await verifyPublishedGoalBooks()
assert.deepEqual(
  verifiedBooks.map(({ model }) => model.book.id),
  GOAL_BOOK_PUBLICATION_REGISTRY.map(({ bookId }) => bookId),
  'the real publication gate verifies every registered book in canonical order',
)
const applicabilityReportByLandscapeId = new Map(
  buildApplicabilityCompilation().reports.map((report) => [report.landscapeId, report] as const),
)
verifiedBooks.forEach(({ model }) => {
  const report = applicabilityReportByLandscapeId.get(model.book.landscapeId)
  assert.ok(report, `missing compiled applicability for ${model.book.landscapeId}`)
  const compiledJurisdictionsByGoalId = new Map(report.goals.map(({ goalId, compiledApplicability }) => [
    goalId,
    new Set(compiledApplicability.jurisdiction ?? []),
  ] as const))
  model.pages.forEach((page) => {
    const compiledJurisdictions = compiledJurisdictionsByGoalId.get(page.goalId)
    assert.ok(compiledJurisdictions, `missing compiled applicability for goal ${page.goalId}`)
    const unsupportedJurisdictions = (page.applicability ?? [])
      .map(({ jurisdiction }) => jurisdiction)
      .filter((jurisdiction) => !compiledJurisdictions.has(jurisdiction))
    assert.deepEqual(
      unsupportedJurisdictions,
      [],
      `${model.book.id} must not publish ${page.goalId} in a jurisdiction without compiled applicability`,
    )
  })
})
const verified = verifiedBooks.find(({ model }) => model.book.id === 'de-gym-mathematik-bundesweit')
assert.ok(verified, 'the real publication contains the registered mathematics atlas')
assert.equal(verified.model.book.id, 'de-gym-mathematik-bundesweit')
assert.equal(verified.model.pages.length, 796)
assert.equal(verified.index.books[0].model.url, '/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json')
assert.equal(verified.index.books[0].pdf.url, '/lernzielbuch/de-gym-mathematik-bundesweit.pdf')
const registryFixture = {
  schemaVersion: 1,
  books: [verified.index.books[0], {
    bookId: 'de-gym-physik-bundesweit',
    title: 'Lernzielbuch Physik – Gymnasium bundesweit',
    locale: 'de-DE',
    publicationMode: 'review' as const,
    pageCount: 429,
    model: {
      url: '/lernzielbuch/de-gym-physik-bundesweit.book-model.json',
      sha256: `sha256:${'a'.repeat(64)}`,
      modelDigest: `sha256:${'b'.repeat(64)}`,
    },
    pdf: {
      url: '/lernzielbuch/de-gym-physik-bundesweit.pdf',
      sha256: `sha256:${'c'.repeat(64)}`,
      renderManifestUrl: '/lernzielbuch/de-gym-physik-bundesweit.pdf.render-manifest.json',
      renderManifestSha256: `sha256:${'d'.repeat(64)}`,
    },
  }, ...verified.index.books.slice(2)],
}
assert.equal(
  parseGoalBookPublicationIndex(JSON.stringify(registryFixture)).books.length,
  4,
  'the closed registry accepts all four nationwide subject atlases',
)
const nationwideJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
]
for (const bookId of ['de-gym-chemie-bundesweit', 'de-gym-biologie-bundesweit']) {
  const atlas = verifiedBooks.find(({ model }) => model.book.id === bookId)
  assert.ok(atlas, `missing native nationwide publication ${bookId}`)
  const { model } = atlas
  assert.ok(model.pages.length > 0)
  assert.equal(model.pages.length, model.book.pageCount)
  assert.deepEqual(model.book.scope, { schoolForm: 'Gymnasium' }, 'the atlas is not restricted to one course profile or stage')
  assert.deepEqual(model.navigation.canonicalProjectionSource.scope, {
    jurisdiction: 'DE', schoolForm: 'Gymnasium', stage: 'CrossStage',
  })
  assert.equal(model.source.navigationOwnership, 'canonical-composition-view-v1')
  assert.ok(model.source.compositionViewManifestPath?.endsWith('.sources.json'))
  assert.equal(model.source.compositionViewPath, model.source.compositionViewManifestPath)
  assert.equal(model.source.navigationViewPath, model.navigation.canonicalProjectionSource.path)
  assert.ok(model.source.durationModelPolicyPath && model.source.durationModelPolicyDigest)
  assert.deepEqual([...new Set(model.source.compositionViewSources?.map(({ scope }) => scope.jurisdiction))].sort(), nationwideJurisdictions)
  assert.deepEqual([...new Set(model.pages.flatMap(({ applicability }) => (
    (applicability ?? []).map(({ jurisdiction }) => jurisdiction)
  )))].sort(), nationwideJurisdictions)
  assert.ok(model.pages.every(({ applicability }) => applicability && applicability.length > 0))

  // The unchanged publication gate already byte-binds this sidecar to the
  // current native inputs. Missing row-level evidence remains an honest gap.
  const sources = buildGoalBookOriginalSources(model)
  assert.equal(sources.bookId, bookId)
  assert.equal(sources.bookDigest, model.digest)
  assert.ok(sources.documents.length > 0 && sources.evidence.length > 0, 'the atlas exposes real original-source documents, not an empty placeholder')
  assert.ok(Object.values(sources.goals).some((rows) => rows.some(({ evidenceIds }) => evidenceIds.length > 0)))
  for (const page of model.pages) {
    const tuples = (page.applicability ?? []).flatMap(({ jurisdiction, scopes }) => (
      scopes.map((scope) => ({ jurisdiction, ...scope }))
    ))
    assert.deepEqual(sources.goals[page.goalId].map(({ jurisdiction, stage, durationModel, courseProfile }) => (
      { jurisdiction, stage, durationModel, courseProfile }
    )), tuples)
  }
}
assert.throws(
  () => parseGoalBookPublicationIndex(JSON.stringify({
    ...registryFixture,
    books: registryFixture.books.slice(0, 1),
  })),
  /complete publication registry/u,
  'removing a registered book fails the publication contract',
)
assert.throws(
  () => parseGoalBookPublicationIndex(JSON.stringify({
    ...registryFixture,
    books: registryFixture.books.map((entry, index) => index === 1
      ? { ...entry, bookId: 'unregistered-book' }
      : entry),
  })),
  /closed publication registry/u,
  'an unregistered publication fails closed',
)
assert.ok(
  serviceWorkerPrecacheGlobIgnores.includes('lernzielbuch/**'),
  'the large publication must not be added to the service-worker precache',
)

const tamperedRelationModel = (mutate: (url: URL) => void) => {
  const model = structuredClone(verified.model)
  const reference = model.pages
    .flatMap((page) => [...page.externalPrerequisites, ...page.externalReverseRequires])
    .find((candidate) => candidate.canonicalUrl !== null)
  assert.ok(reference?.canonicalUrl, 'the real publication must exercise canonical external relations')
  const url = new URL(reference.canonicalUrl)
  mutate(url)
  reference.canonicalUrl = url.toString()
  return model
}

assert.doesNotThrow(
  () => assertCanonicalRelationUrls(verified.model),
  'the current publication binds every external relation to its atlas and edition',
)
assert.throws(
  () => assertCanonicalRelationUrls(tamperedRelationModel((url) => url.searchParams.append('debug', '1'))),
  /unsafe canonical URL/u,
  'extra relation query parameters fail closed',
)
assert.throws(
  () => assertCanonicalRelationUrls(tamperedRelationModel((url) => (
    url.searchParams.append('landscape', verified.model.book.landscapeId)
  ))),
  /unsafe canonical URL/u,
  'duplicate relation query parameters fail closed',
)
assert.throws(
  () => assertCanonicalRelationUrls(tamperedRelationModel((url) => (
    url.searchParams.set('landscape', 'wrong-landscape')
  ))),
  /unsafe canonical URL/u,
  'relation links cannot silently select a different atlas',
)
assert.throws(
  () => assertCanonicalRelationUrls(tamperedRelationModel((url) => (
    url.searchParams.set('edition', 'wrong-edition')
  ))),
  /unsafe canonical URL/u,
  'relation links cannot silently select a different edition',
)
assert.throws(
  () => assertCanonicalRelationUrls(tamperedRelationModel((url) => {
    url.username = 'unexpected'
  })),
  /unsafe canonical URL/u,
  'relation links cannot carry credentials',
)

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'skillpilot-published-goal-book.'))
try {
  for (const subject of ['chemistry', 'biology']) {
    const definition = GOAL_BOOK_PUBLICATION_REGISTRY.find((entry) => entry.subject === subject)
    assert.ok(definition)
    const paths = goalBookPublicationPaths(definition)
    await assert.rejects(
      verifyPublishedGoalBook({
        ...paths,
        configPath: join(dirname(paths.configPath), 'missing-publication-input-companion.json'),
      }),
      /ENOENT.*missing-publication-input-companion\.inputs\.json/u,
      `${subject}: missing source-input companions must fail before artifact verification`,
    )
  }
  const staleSourcesPath = join(temporaryDirectory, 'stale.original-sources.json')
  await writeFile(staleSourcesPath, '{}\n', 'utf8')
  await assert.rejects(
    verifyPublishedGoalBook({
      ...defaultGoalBookPublicationPaths,
      originalSourcesPath: staleSourcesPath,
    }),
    /original sources are stale/u,
    'source changes cannot silently publish stale original-source links',
  )

  const oversizedSourcesPath = join(temporaryDirectory, 'oversized.original-sources.json')
  await writeFile(oversizedSourcesPath, ' '.repeat(8 * 1024 * 1024 + 1), 'utf8')
  await assert.rejects(
    verifyPublishedGoalBook({
      ...defaultGoalBookPublicationPaths,
      originalSourcesPath: oversizedSourcesPath,
    }),
    /original sources exceed the browser runtime size budget/u,
    'original sources that the browser cannot load cannot pass publication',
  )

  const tamperedPdfPath = join(temporaryDirectory, 'tampered.pdf')
  await writeFile(tamperedPdfPath, '%PDF-1.7\nintentionally tampered\n%%EOF\n', 'latin1')
  await assert.rejects(
    verifyPublishedGoalBook({
      ...defaultGoalBookPublicationPaths,
      pdfPath: tamperedPdfPath,
    }),
    /PDF byte digest does not match index\.json/u,
    'a changed PDF fails closed before publication',
  )

  const oversizedModelPath = join(temporaryDirectory, 'oversized-model.json')
  await writeFile(oversizedModelPath, ' '.repeat((8 * 1024 * 1024) + 1), 'utf8')
  await assert.rejects(
    verifyPublishedGoalBook({
      ...defaultGoalBookPublicationPaths,
      modelPath: oversizedModelPath,
    }),
    /BookModel exceeds the browser runtime size budget/u,
    'a BookModel that the browser runtime cannot load fails the publication gate',
  )
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true })
}

console.log('Published goal-book artifact and dependency-free build gate passed.')
