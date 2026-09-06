import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkGoalBookSourceAtlasInputs } from './goalBookSourceAtlasInputs'
import { testGoalBookSourceAtlasInputs } from './testGoalBookSourceAtlasInputs'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const globalLedgerRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/release-model')
const bookLedgerRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/goal-book-publication')

const isWithin = (directory: string, path: string): boolean => {
  const child = relative(directory, path)
  return child === '' || (!isAbsolute(child) && child !== '..' && !child.startsWith(`..${sep}`))
}

const assertBookOnlyPath = (path: string): void => {
  assert.ok(!isWithin(globalLedgerRoot, path), 'Book-only ledger must not enter global semantic-kind discovery')
  assert.ok(isWithin(bookLedgerRoot, path), 'Book-only ledger must stay in its explicit publication scope')
}

const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'))

// Match the recursive discovery boundary of validateCompositionViews.ts, including
// nested directories and case-insensitive filenames, rather than only old paths.
const collectGlobalLedgers = async (directory: string): Promise<string[]> => {
  const paths: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) paths.push(...await collectGlobalLedgers(path))
    else if (/\.semantic-kinds\.json$/i.test(entry.name)) paths.push(path)
  }
  return paths
}

const assertNoGlobalCopy = (bookLandscapeIds: Set<string>, landscapeId: string): void => {
  assert.ok(!bookLandscapeIds.has(landscapeId), 'Book-only classifications must not change global view validation')
}

export const testGoalBookInputIsolation = async (): Promise<void> => {
  testGoalBookSourceAtlasInputs()
  for (const path of ['chemie.semantic-kinds.json', 'nested/biologie.semantic-kinds.json']) {
    assert.throws(() => assertBookOnlyPath(resolve(globalLedgerRoot, path)), /global semantic-kind discovery/)
  }
  assert.throws(() => assertBookOnlyPath(resolve(bookLedgerRoot, '../elsewhere.json')), /publication scope/)

  const bookLandscapeIds = new Set<string>()
  for (const [configName, expectedLandscapeId] of [
    ['de-gym-chemistry-national-atlas', 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'],
    ['de-gym-biology-national-atlas', '08a43a1b-d97e-522c-9dfa-c950a493364e'],
  ]) {
    const config = await readJson(resolve(repoRoot, `app/scripts/config/goal-books/${configName}.json`))
    const ledgerPath = resolve(repoRoot, config.semanticKindLedgerPath)
    assertBookOnlyPath(ledgerPath)
    const ledger = await readJson(ledgerPath)
    assert.equal(ledger.sourceLandscapeId, expectedLandscapeId)
    bookLandscapeIds.add(expectedLandscapeId)
    const model = await readJson(resolve(repoRoot, config.outputPath))
    assert.equal(model.source.semanticKindLedgerPath, config.semanticKindLedgerPath)
    const { receipt } = checkGoalBookSourceAtlasInputs(`app/scripts/config/goal-books/${configName}.inputs.json`, repoRoot)
    assert.equal(receipt.bookId, config.bookId)
    assert.equal(receipt.counts.publishedCurricularAtomicGoals, model.book.pageCount)
  }

  // A renamed copy under the global root must also fail, even if the book
  // configuration itself still points to the correct isolated input.
  for (const landscapeId of bookLandscapeIds) {
    assert.throws(() => assertNoGlobalCopy(bookLandscapeIds, landscapeId), /global view validation/)
  }
  assertNoGlobalCopy(bookLandscapeIds, 'unrelated-landscape')
  for (const path of await collectGlobalLedgers(globalLedgerRoot)) {
    const ledger = await readJson(path)
    if (ledger.documentType === 'semantic-kind-ledger') {
      assertNoGlobalCopy(bookLandscapeIds, ledger.sourceLandscapeId)
    }
  }
  console.log('Goal-book input isolation passed (Chemistry and Biology, including nested/copy regression guards).')
}
