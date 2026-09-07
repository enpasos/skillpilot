import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../src/utils/goalBookPublicationRegistry'
import { buildGoalBookPublications, goalBookBuildArtifactNames } from './buildGoalBookPublications'
import {
  GOAL_BOOK_BUILD_CACHE_FILE,
  goalBookBuildCacheMatches,
  hashGoalBookBuildBytes,
  hashGoalBookBuildFile,
  promoteGoalBookBuildDirectory,
  readGoalBookBuildCache,
} from './goalBookBuildCache'

const temporaryRoot = await mkdtemp(join(tmpdir(), 'skillpilot-goal-book-build-test-'))
try {
  assert.deepEqual(GOAL_BOOK_PUBLICATION_REGISTRY.map(({ subject }) => subject), [
    'mathematics', 'physics', 'chemistry', 'biology',
  ])
  const names = GOAL_BOOK_PUBLICATION_REGISTRY.flatMap(goalBookBuildArtifactNames)
  assert.equal(names.length, 16, 'all four books have model, original sources, PDF and render manifest')
  assert.equal(new Set(names).size, names.length, 'publication artifact names cannot collide')
  for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
    assert.ok(goalBookBuildArtifactNames(definition).includes(`${definition.artifactStem}.pdf`))
  }

  const cached = join(temporaryRoot, 'cached')
  await mkdir(cached)
  const filenames = ['model.json', 'sources.json', 'book.pdf', 'manifest.json']
  for (const name of filenames) await writeFile(join(cached, name), `original ${name}`)
  const inputDigest = hashGoalBookBuildBytes('current model + original sources + renderer + tools + font bytes')
  const outputs = Object.fromEntries(await Promise.all(filenames.map(async (name) => [
    name, await hashGoalBookBuildFile(join(cached, name)),
  ])))
  const entry = { inputDigest, outputs }
  assert.equal(await goalBookBuildCacheMatches(entry, inputDigest, cached, filenames), true)
  assert.equal(await goalBookBuildCacheMatches(entry, hashGoalBookBuildBytes('changed source'), cached, filenames), false)
  assert.equal(await goalBookBuildCacheMatches(undefined, inputDigest, cached, filenames), false)
  assert.equal(await goalBookBuildCacheMatches({ ...entry, outputs: { ...outputs, extra: 'digest' } }, inputDigest, cached, filenames), false)

  for (const name of filenames) {
    await writeFile(join(cached, name), `tampered ${name}`)
    assert.equal(await goalBookBuildCacheMatches(entry, inputDigest, cached, filenames), false, `${name} cannot bypass content verification`)
    await rm(join(cached, name))
    assert.equal(await goalBookBuildCacheMatches(entry, inputDigest, cached, filenames), false, `${name} is mandatory`)
    await writeFile(join(cached, name), `original ${name}`)
  }
  await rm(join(cached, 'book.pdf'))
  await symlink(join(cached, 'model.json'), join(cached, 'book.pdf'))
  assert.equal(await goalBookBuildCacheMatches(entry, inputDigest, cached, filenames), false, 'symlinks cannot become published artifacts')
  await rm(join(cached, 'book.pdf'))
  await writeFile(join(cached, 'book.pdf'), 'original book.pdf')

  assert.deepEqual(await readGoalBookBuildCache(cached), { schemaVersion: 1, books: {} })
  await writeFile(join(cached, GOAL_BOOK_BUILD_CACHE_FILE), '{invalid')
  assert.deepEqual(await readGoalBookBuildCache(cached), { schemaVersion: 1, books: {} })
  const receipt = { schemaVersion: 1, books: { fixture: entry } }
  await writeFile(join(cached, GOAL_BOOK_BUILD_CACHE_FILE), JSON.stringify(receipt))
  assert.deepEqual(await readGoalBookBuildCache(cached), receipt)

  const output = join(temporaryRoot, 'published')
  const staging = join(temporaryRoot, 'staging')
  await mkdir(output)
  await mkdir(staging)
  await writeFile(join(output, 'index.json'), 'previous complete publication')
  await writeFile(join(staging, 'index.json'), 'new validated publication')
  await promoteGoalBookBuildDirectory(staging, output, ['index.json'])
  assert.equal(await readFile(join(output, 'index.json'), 'utf8'), 'new validated publication')
  assert.ok(!(await readdir(temporaryRoot)).some((name) => name.startsWith('.goal-book-previous-')))

  // Simulate the final staging rename failing after the previous directory was moved.
  await assert.rejects(promoteGoalBookBuildDirectory(join(temporaryRoot, 'missing-stage'), output, ['index.json']))
  assert.equal(await readFile(join(output, 'index.json'), 'utf8'), 'new validated publication', 'failed promotion restores the previous complete publication')
  assert.ok(!(await readdir(temporaryRoot)).some((name) => name.startsWith('.goal-book-previous-')))

  await mkdir(staging)
  await writeFile(join(staging, 'index.json'), 'would replace')
  await writeFile(join(output, 'teacher-notes.txt'), 'unrelated user file')
  await assert.rejects(promoteGoalBookBuildDirectory(staging, output, ['index.json']), /unrelated publication files/u)
  assert.equal(await readFile(join(output, 'teacher-notes.txt'), 'utf8'), 'unrelated user file')
  assert.equal(await readFile(join(output, 'index.json'), 'utf8'), 'new validated publication')

  await assert.rejects(buildGoalBookPublications({ outputDirectory: '/' }), /dedicated generated publication directory/u)
  const badBrowserOutput = join(temporaryRoot, 'bad-browser-output')
  await assert.rejects(buildGoalBookPublications({ outputDirectory: badBrowserOutput, chromiumExecutablePath: join(temporaryRoot, 'missing-chromium') }))
  assert.ok(!(await readdir(temporaryRoot)).includes('.bad-browser-output.build-lock'), 'preflight failure releases the lock')
  const concurrentOutput = join(temporaryRoot, 'concurrent')
  await mkdir(join(temporaryRoot, '.concurrent.build-lock'))
  await assert.rejects(buildGoalBookPublications({ outputDirectory: concurrentOutput }), /Another goal-book build holds/u)
  assert.ok((await readdir(temporaryRoot)).includes('.concurrent.build-lock'), 'a competing build never removes the original lock')

  console.log('Goal-book publication build tests passed (registry, hashes, missing/tampered artifacts, cache receipts, rollback, unrelated-file protection and locks)')
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
