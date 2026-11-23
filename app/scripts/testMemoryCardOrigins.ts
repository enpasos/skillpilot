import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { emptyCounts, writeCardSemantics } from './memFwuRoundtrip'
import { readRdfModel, reconstructCardDecks } from './semanticMemFwuRoundtrip'
import { collectCardOriginErrors, type CardReviewRecord, type MemoryDeckCard } from './memoryCardReview'
import { deriveDeck, type OriginSource } from './syncMemoryDeckOriginGoalIds'

// Deck-side origins of a kept card review: format 2 must repeat the recorded set.
const record = (cardId: string, originGoalIds: string[]) => ({
  schemaVersion: 1, reviewId: 'fixture', ruleVersion: 'memory-card-review-v1', landscapeId: 'fixture',
  deckId: 'deck', cardId, fingerprint: 'sha256:fixture', status: 'kept', necessary: true, originGoalIds,
  reviewedAt: '2026-11-23', reviewer: 'fixture', reason: 'fixture',
}) as CardReviewRecord
const kept = new Map([['deck::c1', record('c1', ['a', 'b'])], ['deck::c2', record('c2', ['c'])]])
const card = (cardId: string, fields: Partial<MemoryDeckCard>): MemoryDeckCard => ({
  deckId: 'deck', cardId, source: '/data/deck.de.json', front: 'Q', back: 'A', category: '', tags: [],
  deckFormatVersion: 2, originGoalIds: null, ...fields,
})
const errors = (...cards: MemoryDeckCard[]) => collectCardOriginErrors(cards, kept)

assert.deepEqual(errors(card('c1', { originGoalIds: ['b', 'a'] }), card('c2', { originGoalIds: ['c'], tags: ['GK', 'goal:c'] })), [],
  'the same set in any order passes, and a mirroring legacy tag is tolerated')
assert.match(errors(card('c1', { originGoalIds: ['a'] }))[0], /differ from the kept card review/)
assert.match(errors(card('c1', { originGoalIds: ['a', 'b', 'x'] }))[0], /differ from the kept card review/)
assert.match(errors(card('c1', {}))[0], /lacks the originGoalIds/, 'a format-2 card must carry the reviewed origins')
assert.match(errors(card('c2', { originGoalIds: ['c'], tags: ['goal:d'] }))[0], /goal: tags \[d\] must repeat/)
assert.match(errors(card('c3', { tags: ['goal:e'] }))[0], /goal: tags \[e\] must repeat/,
  'a reappearing tag-only relation fails in a format-2 deck even without a review record')
assert.match(errors(card('c1', { originGoalIds: [] }))[0], /non-empty list/)
assert.match(errors(card('c1', { originGoalIds: ['a', 'a'] }))[0], /non-empty list/)
assert.deepEqual(errors(card('c1', { deckFormatVersion: null, tags: ['goal:b', 'goal:a'] })), [],
  'an older deck may still encode the reviewed set as tags')
assert.match(errors(card('c1', { deckFormatVersion: null, tags: ['goal:a'] }))[0], /goal: tags \[a\] differ/)
assert.deepEqual(errors(card('c1', { deckFormatVersion: null })), [], 'an older deck without either encoding names no origins')
assert.equal(errors(card('c1', { originGoalIds: ['a'] }), card('c1', { originGoalIds: ['a'] })).length, 1,
  'a deck referenced by several memory goals reports each card once')

// The derivation takes the review record exactly, else the legacy tags, else nothing.
const counts: Record<OriginSource, number> = { ledger: 0, 'legacy-tags': 0, unbound: 0 }
const derived = deriveDeck('fixture.json', { deckId: 'deck', title: 'T', cards: [
  { id: 'c1', front: 'Q', back: 'A', category: 'X', tags: ['GK', 'goal:x'] },
  { id: 'c3', front: 'Q', back: 'A', tags: ['goal:e', 'goal:d', 'goal:e'] },
  { id: 'c4', front: 'Q', back: 'A' },
  { id: 'c2', originGoalIds: ['old'], front: 'Q', back: 'A' },
] }, new Map([['deck::c1', ['b', 'a']], ['deck::c2', ['c']]]), counts)
assert.deepEqual(Object.keys(derived), ['schemaVersion', 'deckId', 'title', 'cards'])
assert.deepEqual(derived.cards, [
  { id: 'c1', front: 'Q', back: 'A', originGoalIds: ['b', 'a'], category: 'X', tags: ['GK', 'goal:x'] },
  { id: 'c3', front: 'Q', back: 'A', originGoalIds: ['e', 'd'], tags: ['goal:e', 'goal:d', 'goal:e'] },
  { id: 'c4', front: 'Q', back: 'A' },
  { id: 'c2', originGoalIds: ['c'], front: 'Q', back: 'A' },
], 'the field follows back, keeps an authored position and never invents a relation')
assert.deepEqual(counts, { ledger: 2, 'legacy-tags': 1, unbound: 1 })
assert.deepEqual(Object.keys(deriveDeck('v1.json', { schemaVersion: 1, deckId: 'deck', title: 'T', cards: [] }, new Map(), counts)),
  ['schemaVersion', 'deckId', 'title', 'cards'], 'an existing version marker is raised in place')
assert.throws(() => deriveDeck('conflict.json', { deckId: 'deck', title: 'T', cards: [
  { id: 'c9', front: 'Q', back: 'A', originGoalIds: ['p'], tags: ['goal:q'] },
] }, new Map(), counts), /differ from its goal: tags/, 'an unreviewed conflict is left to a human decision')

// The MEM/FWU roundtrip of an exported deck keeps each card's origins and adds none.
const exportedDeck = { schemaVersion: 2, deckId: 'deck', title: 'T', landscapeId: 'math', cards: [
  { id: 'c1', front: 'Q1', back: 'A1', originGoalIds: ['b', 'a'], category: 'X', tags: ['GK'] },
  { id: 'c2', front: 'Q2', back: 'A2', category: 'X', tags: ['GK', 'goal:c'] },
] }
const rdfDirectory = await mkdtemp(join(tmpdir(), 'skillpilot-card-origins-'))
try {
  const text = JSON.stringify(exportedDeck)
  const lines: string[] = []
  writeCardSemantics((line) => lines.push(line), 'origin-regression', [{ path: 'origin-regression/data/cards/deck.de.json',
    text, content: null, uncompressedBytes: Buffer.byteLength(text), sha256: null }], emptyCounts(), { semanticIris: true })
  const rdfPath = join(rdfDirectory, 'cards.nt')
  await writeFile(rdfPath, `${lines.join('\n')}\n`)
  const [reconstructed] = reconstructCardDecks((await readRdfModel(rdfPath)).model)
  assert.deepEqual(JSON.parse(JSON.stringify(reconstructed.cards)), exportedDeck.cards,
    'RDF reconstruction keeps originGoalIds in order and omits the field where the card has none')
} finally {
  await rm(rdfDirectory, { recursive: true, force: true })
}

console.log('Memory-card origin checks passed: review binding, retired-tag mirror, exact derivation and RDF roundtrip.')
