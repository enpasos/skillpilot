import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../src/utils/goalBookPublicationRegistry'
import { MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES, parseGoalBookOriginalSources } from '../src/utils/goalBookOriginalSources'
import { parseAndValidateGoalBookModel } from './goalBookModel'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from './goalBookOriginalSources'

const publicRoot = fileURLToPath(new URL('../public/lernzielbuch/', import.meta.url))
const args = process.argv.slice(2)
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: tsx scripts/buildGoalBookOriginalSources.ts [--check]')
}

for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
  const model = parseAndValidateGoalBookModel(await readFile(
    resolve(publicRoot, `${definition.artifactStem}.book-model.json`), 'utf8',
  ))
  const index = await buildGoalBookOriginalSources(model)
  const serialized = serializeGoalBookOriginalSources(index)
  if (Buffer.byteLength(serialized) > MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES) {
    throw new Error(`Original sources exceed the browser size budget: ${definition.bookId}`)
  }
  parseGoalBookOriginalSources(index, model)
  const outputPath = resolve(publicRoot, `${definition.artifactStem}.original-sources.json`)
  if (args[0] === '--check') {
    if (await readFile(outputPath, 'utf8') !== serialized) {
      throw new Error(`Original sources are stale: ${outputPath}. Run npm run build:goal-book-original-sources.`)
    }
  } else {
    await writeFile(outputPath, serialized, 'utf8')
  }
  console.log(`Original sources ${args[0] === '--check' ? 'verified' : 'written'}: ${definition.bookId}; ${Buffer.byteLength(serialized)} bytes`)
}
