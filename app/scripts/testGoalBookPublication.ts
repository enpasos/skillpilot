import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  assertCanonicalRelationUrls,
  defaultGoalBookPublicationPaths,
  parseGoalBookPublicationIndex,
  verifyPublishedGoalBook,
  verifyPublishedGoalBooks,
} from './checkGoalBookPublication'
import { serviceWorkerPrecacheGlobIgnores } from '../serviceWorkerNavigationPolicy'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../src/utils/goalBookPublicationRegistry'

const verifiedBooks = await verifyPublishedGoalBooks()
assert.deepEqual(
  verifiedBooks.map(({ model }) => model.book.id),
  GOAL_BOOK_PUBLICATION_REGISTRY.map(({ bookId }) => bookId),
  'the real publication gate verifies every registered book in canonical order',
)
const verified = verifiedBooks.find(({ model }) => model.book.id === 'de-gym-mathematik-bundesweit')
assert.ok(verified, 'the real publication contains the registered mathematics atlas')
assert.equal(verified.model.book.id, 'de-gym-mathematik-bundesweit')
assert.equal(verified.model.pages.length, 780)
assert.equal(verified.index.books[0].model.url, '/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json')
assert.equal(verified.index.books[0].pdf.url, '/lernzielbuch/de-gym-mathematik-bundesweit.pdf')
const registryFixture = {
  schemaVersion: 1,
  books: [verified.index.books[0], {
    bookId: 'de-gym-physik-bundesweit',
    title: 'Lernzielbuch Physik – Gymnasium bundesweit',
    locale: 'de-DE',
    publicationMode: 'review' as const,
    pageCount: 426,
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
  }],
}
assert.equal(
  parseGoalBookPublicationIndex(JSON.stringify(registryFixture)).books.length,
  2,
  'the closed registry accepts the complete mathematics and physics catalog',
)
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
    books: [...registryFixture.books.slice(0, 1), {
      ...registryFixture.books[1],
      bookId: 'unregistered-book',
    }],
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
