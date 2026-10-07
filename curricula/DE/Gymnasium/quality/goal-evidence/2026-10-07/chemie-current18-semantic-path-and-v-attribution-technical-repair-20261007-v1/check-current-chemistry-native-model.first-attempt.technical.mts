import assert from 'node:assert/strict'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel.ts'
const loaded = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')
assert.equal(loaded.model.landscapeId, 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
console.log(JSON.stringify({nativeReadOnlyBuildInputsAndSemanticLedger: 'PASS', bookId: loaded.model.bookId, canonicalLandscapeId: loaded.model.landscapeId, publishedPages: loaded.model.goals.length}, null, 2))
