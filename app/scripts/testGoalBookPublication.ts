import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  defaultGoalBookPublicationPaths,
  verifyPublishedGoalBook,
} from './checkGoalBookPublication'
import { serviceWorkerPrecacheGlobIgnores } from '../serviceWorkerNavigationPolicy'

const verified = await verifyPublishedGoalBook()
assert.equal(verified.model.book.id, 'de-gym-mathematik-bundesweit')
assert.equal(verified.model.pages.length, 754)
assert.equal(verified.index.books[0].model.url, '/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json')
assert.equal(verified.index.books[0].pdf.url, '/lernzielbuch/de-gym-mathematik-bundesweit.pdf')
assert.ok(
  serviceWorkerPrecacheGlobIgnores.includes('lernzielbuch/**'),
  'the large publication must not be added to the service-worker precache',
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
