// Read-only, exact-field patch emitter; apply stdout with apply_patch.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { corrections, cardCorrections } from './authoring-spec.mjs'

const root = process.cwd()
const packagePath = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-local-corrections-v1'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const read = p => fs.readFileSync(path.resolve(root, p), 'utf8')
const sha = s => 'sha256:' + createHash('sha256').update(typeof s === 'string' ? s : JSON.stringify(s)).digest('hex')
const encode = x => JSON.stringify(x, null, 2) + '\n'
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(path.resolve(root, 'app/scripts/goalBookModel.ts')).href)
const { fingerprintAMGoal, fingerprintCard } = await import(pathToFileURL(path.resolve(root, 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-split-implementation-v1/ledger-candidate.ts')).href)
const reviewedAt = new Date().toISOString()
const reviewer = 'codex-individual-physics-b048-local-four-adjudication'
const patches = new Map()
function hunk(file, before, after) {
  assert(read(file).includes(before), 'Exact byte lease missing: ' + file)
  const list = patches.get(file) ?? []
  list.push({ offset: read(file).indexOf(before), text: '@@\n' + before.split('\n').map(s => '-' + s).join('\n') + '\n' + after.split('\n').map(s => '+' + s).join('\n') })
  patches.set(file, list)
}
const block = x => JSON.stringify(x, null, 2).split('\n').map(s => '    ' + s).join('\n') + ','
const beforeLandscape = JSON.parse(read(landscapePath))
const kinds = JSON.parse(read(kindPath))
const changedGoals = []
const records = []
for (const change of corrections) {
  const before = beforeLandscape.goals.find(g => g.id === change.goalId)
  assert(before && before.description === change.beforeDescription, 'Goal description lease: ' + change.goalId)
  const after = structuredClone(before)
  for (const field of ['title', 'titleEn', 'description', 'descriptionEn']) if (change[field]) after[field] = change[field]
  after.resourceLinks = (after.resourceLinks ?? []).map(link => link.type === 'goal-visualization' ? {
    ...link,
    title: `Visualisierung: ${after.title}`,
    description: `Visualisierung zum Lernziel: ${after.title}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${after.title}". ${after.description}`,
  } : link)
  assert.deepEqual(after.requires, before.requires)
  assert.deepEqual(after.contains, before.contains)
  hunk(landscapePath, block(before), block(after))
  const kind = kinds.decisions.find(r => r.goalId === before.id)
  assert(kind && kind.semanticKind === 'curricularAtomic')
  assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(before))
  hunk(kindPath, block(kind), block({ ...kind, sourceFingerprint: fingerprintSemanticKindSourceGoal(after) }))
  for (const [directory, rule, reason] of [
    ['semantic-atomicity', 'semantic-atomicity-v1', change.atomicityReason],
    ['memory-card-review', 'memory-card-review-v1', change.memoryReason],
  ]) {
    const file = `curricula/DE/Gymnasium/quality/${directory}/canonical-physics-full.review.jsonl`
    const raw = read(file).trim().split('\n').find(line => JSON.parse(line).goalId === before.id)
    const row = JSON.parse(raw)
    assert.equal(row.fingerprint, fingerprintAMGoal(before, rule))
    const next = { ...row, fingerprint: fingerprintAMGoal(after, rule), reviewedAt, reviewer, reason }
    hunk(file, raw, JSON.stringify(next))
    records.push({ file, goalId: before.id, before: row, after: next })
  }
  changedGoals.push({ goalId: before.id, source: change.source, before, after, beforeSha256: sha(before), afterSha256: sha(after) })
}

const changedCards = []
for (const lang of ['de', 'en']) {
  const filename = `de_gymnasium_physics_flashcards_mechanics_ephase.${lang}.json`
  const sourcePath = 'curricula/DE/Gymnasium/memory-decks/' + filename
  const deck = JSON.parse(read(sourcePath))
  for (const [id, fields] of Object.entries(cardCorrections[lang])) {
    const before = deck.cards.find(c => c.id === id)
    assert(before, 'Existing exact card required: ' + id)
    const after = { ...before, ...fields }
    for (const file of [sourcePath, 'app/public/data/' + filename, 'backend/src/main/resources/static/data/' + filename]) hunk(file, block(before), block(after))
    if (lang === 'de') {
      const file = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl'
      const raw = read(file).trim().split('\n').find(line => JSON.parse(line).cardId === id)
      const row = JSON.parse(raw)
      assert.equal(row.fingerprint, fingerprintCard(before, deck.deckId))
      assert.equal(row.status, 'kept')
      const reason = id === 'physics_e_cov_036'
        ? 'DE/EN einzeln gegengelesen: x=v0t und y=gt²/2 gelten mit gemeinsamem Zeitparameter, horizontalem Start, positiver Fallrichtung, vernachlässigbarem Luftwiderstand und konstantem g. Der kompakte Formelbezug bleibt notwendig und korrekt; Interpretation wird weiterhin am normalen Ziel geprüft.'
        : 'DE/EN einzeln gegengelesen: Fallbewegung mit Luftwiderstand ist nicht freier Fall. Bei vernachlässigbarem Auftrieb begründet Gewichtskraft=Luftwiderstandskraft a=0 bei fortgesetzter Bewegung. Terminologie/Schreibfehler korrigiert, präziser Merksatz weiterhin notwendig und ausschließlich dem bisherigen Grenzgeschwindigkeitsziel zugeordnet.'
      hunk(file, raw, JSON.stringify({ ...row, fingerprint: fingerprintCard(after, deck.deckId), reviewedAt, reviewer, reason }))
    }
    changedCards.push({ sourcePath, deckId: deck.deckId, cardId: id, before, after })
  }
}

let output = '*** Begin Patch\n'
for (const [file, hunks] of patches) output += `*** Update File: ${file}\n${hunks.sort((a, b) => a.offset - b.offset).map(h => h.text).join('\n')}\n`
const receipt = {
  documentType: 'physics-individual-wording-adjudication', schemaVersion: 1, reviewedAt,
  implementationAuthority: 'Product owner requests Physics 100 percent commit-ready milestone and has explicitly permitted comparable genuine curriculum improvements.',
  reviewAuthority: 'AI content adjudication only; no human QA attestation, no D closure, no automatic P or image approval.',
  unchanged: ['all goal IDs', 'all requires/contains edges', 'all source and composition-view scopes', 'all image bytes', 'all other canonical goals and review rows', 'all runtime/plugin contracts'],
  changedGoals, changedCards, individualGateRecords: records,
}
const receiptPath = packagePath + '/individual-adjudication.receipt.json'
assert(!fs.existsSync(path.resolve(root, receiptPath)), 'Receipt is immutable; do not overwrite')
output += `*** Add File: ${receiptPath}\n${encode(receipt).trimEnd().split('\n').map(s => '+' + s).join('\n')}\n*** End Patch\n`
process.stdout.write(output)
