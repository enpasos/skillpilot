// SPDX-License-Identifier: Apache-2.0
// Technical serialization of actual sealed A judgments; no new scientific vote.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'

const R = '/home/enpasos/projects/skillpilot'
const L = resolve(R, 'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const A = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native9-current437-fresh-independent-a-20261016-v1'
const O = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const sourcePath = resolve(L, 'app/scripts/memoryCardReview.ts')
const source = readFileSync(sourcePath, 'utf8')
assert.equal(source, readFileSync(resolve(R, 'app/scripts/memoryCardReview.ts'), 'utf8'))
const start = source.indexOf('function normalizeText(')
const end = source.indexOf('function memoryCardKey(', start)
assert.ok(start >= 0 && end > start)
const fragment = source.slice(start, end)
const js = ts.transpileModule(fragment, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const { normalizeText, fingerprintMemoryCard } = new Function('createHash',
  js + ';return { normalizeText, fingerprintMemoryCard };')(createHash)
const originalPath = resolve(R, A, 'M4.actual-inspected-cards.current-independent.cards.review.jsonl')
const originals = readFileSync(originalPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const firstPath = resolve(R, A, 'FIRST.independent-current-nine-science-and-separate699.frozen.json')
assert.equal(sha(firstPath), 'sha256:dbdbefe4b37fa1dc2d314b647d1a275d81715783a9c2b6c76ef17ce846d97d4a')
assert.equal(originals.length, 4)
const operations = []
const successors = originals.map((original) => {
  const filename = original.cardId === 'chem_bond_009'
    ? 'de_gymnasium_chemistry_flashcards_bonding_structure.de.json'
    : 'de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
  const canonicalPath = resolve(L, 'curricula/DE/Gymnasium/memory-decks', filename)
  const publicPath = resolve(L, 'app/public/data', filename)
  const canonicalDeck = read(canonicalPath)
  const publicDeck = read(publicPath)
  const wholeCanonicalCard = canonicalDeck.cards.find((card: any) => card.id === original.cardId)
  const wholePublicCard = publicDeck.cards.find((card: any) => card.id === original.cardId)
  assert.ok(wholeCanonicalCard)
  assert.deepEqual(wholeCanonicalCard, wholePublicCard)
  assert.equal(canonicalDeck.deckId, original.deckId)
  assert.equal(publicDeck.deckId, original.deckId)
  const rawPayload = { deckId: canonicalDeck.deckId, cardId: wholeCanonicalCard.id,
    front: wholeCanonicalCard.front, back: wholeCanonicalCard.back,
    category: wholeCanonicalCard.category, tags: wholeCanonicalCard.tags }
  // This equality proves that the same raw card fields A actually serialized
  // remain present; the repair does not substitute a changed card for review.
  assert.equal(fingerprintMemoryCard(rawPayload, original.ruleVersion), original.fingerprint)
  const normalizedPayload = { ...rawPayload,
    front: normalizeText(wholePublicCard.front), back: normalizeText(wholePublicCard.back),
    category: normalizeText(wholePublicCard.category),
    tags: Array.isArray(wholePublicCard.tags)
      ? wholePublicCard.tags.map((tag: unknown) => normalizeText(tag)).filter(Boolean) : [],
  }
  // Identical to the collectMemoryDeckEvidence preprocessing before the
  // unmodified stock fingerprintMemoryCard call.
  const successor = { ...original,
    fingerprint: fingerprintMemoryCard(normalizedPayload, original.ruleVersion) }
  operations.push({ deckId: original.deckId, cardId: original.cardId,
    originalWholeScientificRecord: original, technicalSuccessorWholeRecord: successor,
    changedFields: Object.keys(original).filter((key) => original[key] !== successor[key]),
    unchangedRawPayloadStillMatchesOriginalAFingerprint: true,
    wholeCanonicalCard, wholePublicCard, canonicalAndPublicWholeCardsExact: true,
    rawPayload, normalizedStockPayload: normalizedPayload,
    canonicalDeckPath: canonicalPath, canonicalDeckSha256: sha(canonicalPath),
    publicDeckPath: publicPath, publicDeckSha256: sha(publicPath),
  })
  return successor
})
assert.equal(operations.filter((operation) => operation.changedFields.length > 0).length, 2)
assert.ok(operations.every((operation) => operation.changedFields.every((field) => field === 'fingerprint')))
const successorName = 'M4.actual-A-science.stock-preprocessing-root-technical-successor.cards.review.jsonl'
writeFileSync(resolve(R, O, successorName), successors.map((row) => JSON.stringify(row)).join('\n') + '\n', { flag: 'wx' })
writeFileSync(resolve(R, O, 'HISTORY.M4.actual-A-original-raw-four-records.exact.jsonl'), readFileSync(originalPath), { flag: 'wx' })
const receipt = { role: 'ROOT-authorized additive technical serialization repair, not new independent review',
  technicalAuthor: '/root/chemie_memory_course_filter_qa_fix_20261016',
  authorization: 'Parent /root explicitly authorized technical serialization over the exact same actually reviewed whole cards, retaining original A scientific judgment and provenance.',
  createdAt: new Date().toISOString(), scientificReviewer: '/root/chemie_native9_fresh_independent_a_20261016',
  firstScience: { path: firstPath.slice(R.length + 1), sha256: sha(firstPath) },
  originalRecords: { path: originalPath.slice(R.length + 1), sha256: sha(originalPath) },
  scientificReviewIdReviewerDateStatusNecessityOriginAndReasonsUnchanged: true,
  originalAIsNotClaimedAsAuthorOfThisTechnicalRepair: true,
  stockSource: { path: sourcePath.slice(R.length + 1), sha256: sha(sourcePath),
    fragmentSha256: 'sha256:' + createHash('sha256').update(fragment).digest('hex') },
  preprocessing: 'Stock normalizeText performs String(value ?? empty).normalize(NFKC), whitespace collapse and trim; tags normalize each string with the same helper, discard empty, default to [].',
  records: operations, outputPath: O + '/' + successorName,
  HumanApproval: false, HumanTrial: false, MachineM7Pass: false,
}
writeFileSync(resolve(R, O, 'CAS.actual-A-M4-stock-preprocessing-root-technical-successor.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ actualIndependentScienceUnchanged: 4, correctedStockFingerprintSerialization: 2,
  rawCurrentCardsStillMatchOriginalARecordedFingerprints: 4, output: O + '/' + successorName }))
