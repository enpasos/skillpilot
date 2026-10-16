// SPDX-License-Identifier: Apache-2.0
// AUTHOR runtime-selection check only, never independent content review.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const repo = process.cwd()
  const base = path.resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-qualitative-faraday')
  const host = path.resolve(repo, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
  const tagSourcePath = path.join(host, 'app/src/utils/srsTags.ts')
  const drillSourcePath = path.join(host, 'app/src/components/srs/FlashcardDrill.tsx')
  const hash = (p: string) => createHash('sha256').update(fs.readFileSync(p)).digest('hex')
  const { getSrsFilterTags } = await import(pathToFileURL(tagSourcePath).href)
  const memory = JSON.parse(fs.readFileSync(path.join(base, 'memory-unit.author-draft.json'), 'utf8'))
  const candidateDeckPath = path.join(base, 'candidate-deck/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json')
  const deck = JSON.parse(fs.readFileSync(candidateDeckPath, 'utf8'))
  const oldDeckPath = path.join(host, 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json')
  const oldDeck = JSON.parse(fs.readFileSync(oldDeckPath, 'utf8'))
  assert.deepEqual(deck.cards.slice(0, oldDeck.cards.length), oldDeck.cards)
  const filterTags = getSrsFilterTags(memory.tags)
  assert.deepEqual(filterTags, ['goal:0e3f849b-133d-57da-882c-0d67c3eb05b8'])
  const source = fs.readFileSync(drillSourcePath, 'utf8')
  const fragment = source.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
  assert.ok(fragment, 'Actual FlashcardDrill predicate must be inspected again if it changes')
  // Execute exactly the predicate extracted from the actual H component.
  const actualPredicate = new Function('card', 'filterTags', 'return ' + fragment[1])
  const selected = deck.cards.filter((card: unknown) => actualPredicate(card, filterTags))
  assert.deepEqual(selected.map((card: { id: string }) => card.id), ['chem_eq_q3_012', 'chem_eq_q3_013'])
  assert.ok(!selected.some((card: { id: string }) => card.id === 'chem_eq_q3_008'))
  assert.equal(selected.length, 2)
  const receipt = {
    role: 'AUTHOR actual SRS selection check; not an independent M review',
    actualSrsTags: { path: path.relative(repo, tagSourcePath), sha256: hash(tagSourcePath) },
    actualFlashcardDrill: { path: path.relative(repo, drillSourcePath), sha256: hash(drillSourcePath), extractedPredicate: fragment[1] },
    sourceDeckSha256: hash(oldDeckPath),
    candidateDeckSha256: hash(candidateDeckPath),
    sourceCardObjectsUnchanged: true,
    sourceCardCount: oldDeck.cards.length,
    candidateCardCount: deck.cards.length,
    memoryGoalId: memory.id,
    actualFilterTags: filterTags,
    actualOrderedSelectedCardIds: selected.map((card: { id: string }) => card.id),
    quantitativeCard008Selected: false,
    changesToRuntimeOrNormalOrH: false,
    independentReview: false,
    HumanApproval: false,
    HumanTrial: false,
  }
  const destination = path.join(base, 'CHECK.actual-H-SRS-two-qualitative-cards.author.json')
  fs.writeFileSync(destination + '.tmp', JSON.stringify(receipt, null, 2) + '\n')
  fs.renameSync(destination + '.tmp', destination)
  process.stdout.write(JSON.stringify(receipt, null, 2) + '\n')
}
main().catch(error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1 })
