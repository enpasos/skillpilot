import assert from 'node:assert/strict'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel.ts'
const loaded = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')
assert.equal(loaded.model.book.landscapeId, 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
console.log(JSON.stringify({nativeReadOnlyBuildInputsAndSemanticLedger: 'PASS', bookId: loaded.model.book.id, canonicalLandscapeId: loaded.model.book.landscapeId, publishedPages: loaded.model.pages.length}, null, 2))
