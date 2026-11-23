import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MEMORY_DECK_FORMAT_VERSION, legacyOriginGoalTagIds } from '../src/utils/memoryCardOrigins'
import { discoverActiveMemoryCardReviewConfigs } from './memoryCardReviewConfigDiscovery'

/**
 * Derives the format-2 card field `originGoalIds` of the canonical Gymnasium decks
 * (contracts/memory-deck/v2) from the active memory-card review ledgers.
 *
 * Per card: the kept review record's `originGoalIds`, exactly as recorded; without
 * such a record the card's `goal:<id>` tags; without either the card stays as
 * authored. `--check` writes nothing and fails when a deck differs from the derivation.
 */

const DECK_DIR = 'curricula/DE/Gymnasium/memory-decks'

type JsonObject = Record<string, unknown>
export type OriginSource = 'ledger' | 'legacy-tags' | 'unbound'

interface Args {
  check: boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

function parseArgs(argv: string[]): Args {
  const args: Args = { check: false }
  for (const arg of argv) {
    if (arg === '--check') args.check = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

const readText = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')
const sameSet = (left: readonly string[], right: readonly string[]) => {
  const expected = new Set(right)
  return new Set(left).size === expected.size && left.every((id) => expected.has(id))
}

/** Kept review records of every active memory-card review, keyed by deck and card. */
function readKeptCardOrigins(): Map<string, string[]> {
  const origins = new Map<string, string[]>()
  for (const { configPath } of discoverActiveMemoryCardReviewConfigs()) {
    const config = JSON.parse(readText(configPath)) as { reviewPath: string; cardReviewPath?: string }
    const cardReviewPath = config.cardReviewPath ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl')
    for (const line of readText(cardReviewPath).split(/\r?\n/).filter((row) => row.trim())) {
      const record = JSON.parse(line) as { deckId: string; cardId: string; status: string; originGoalIds?: unknown }
      if (record.status !== 'kept') continue
      const ids = record.originGoalIds
      if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string' && id.length > 0)) {
        throw new Error(`${cardReviewPath}: kept card ${record.deckId}/${record.cardId} has no originGoalIds`)
      }
      const key = `${record.deckId}::${record.cardId}`
      if (origins.has(key)) throw new Error(`Card ${key} is reviewed by more than one active ledger`)
      origins.set(key, ids as string[])
    }
  }
  return origins
}

/** Insert originGoalIds after `back` (or replace it in place) without reordering other fields. */
function withOriginGoalIds(card: JsonObject, ids: string[]): JsonObject {
  if ('originGoalIds' in card) return { ...card, originGoalIds: ids }
  const next: JsonObject = {}
  let inserted = false
  for (const [key, value] of Object.entries(card)) {
    next[key] = value
    if (key === 'back') {
      next.originGoalIds = ids
      inserted = true
    }
  }
  if (!inserted) next.originGoalIds = ids
  return next
}

function withFormatVersion(deck: JsonObject): JsonObject {
  if ('schemaVersion' in deck) return { ...deck, schemaVersion: MEMORY_DECK_FORMAT_VERSION }
  return { schemaVersion: MEMORY_DECK_FORMAT_VERSION, ...deck }
}

export function deriveDeck(
  fileName: string,
  deck: JsonObject,
  keptOrigins: ReadonlyMap<string, string[]>,
  counts: Record<OriginSource, number>,
): JsonObject {
  const deckId = deck.deckId
  if (typeof deckId !== 'string' || !Array.isArray(deck.cards)) throw new Error(`${fileName}: not a memory deck`)
  const cards = deck.cards.map((value, index) => {
    const card = value as JsonObject
    const cardId = card.id
    if (typeof cardId !== 'string') throw new Error(`${fileName}: card ${index + 1} has no id`)
    const ledger = keptOrigins.get(`${deckId}::${cardId}`)
    if (ledger) {
      counts.ledger += 1
      return withOriginGoalIds(card, [...ledger])
    }
    const tagIds = legacyOriginGoalTagIds(card as { tags?: string[] })
    if (tagIds.length > 0) {
      const authored = card.originGoalIds
      if (Array.isArray(authored) && !sameSet(authored as string[], tagIds)) {
        throw new Error(`${fileName}: ${cardId} has no kept review record and its originGoalIds differ from its goal: tags`)
      }
      counts['legacy-tags'] += 1
      return withOriginGoalIds(card, Array.isArray(authored) ? authored as string[] : tagIds)
    }
    counts.unbound += 1
    return card
  })
  return { ...withFormatVersion(deck), cards }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const keptOrigins = readKeptCardOrigins()
  const counts: Record<OriginSource, number> = { ledger: 0, 'legacy-tags': 0, unbound: 0 }
  const changed: string[] = []
  const files = readdirSync(resolve(repoRoot, DECK_DIR)).filter((name) => name.endsWith('.json')).sort()
  for (const fileName of files) {
    const path = `${DECK_DIR}/${fileName}`
    const before = readText(path)
    const after = `${JSON.stringify(deriveDeck(fileName, JSON.parse(before) as JsonObject, keptOrigins, counts), null, 2)}\n`
    if (after === before) continue
    changed.push(path)
    if (!args.check) writeFileSync(resolve(repoRoot, path), after, 'utf8')
  }
  console.log(`Memory decks: ${files.length}; cards from kept review records: ${counts.ledger}; `
    + `from legacy goal: tags: ${counts['legacy-tags']}; without understanding goals: ${counts.unbound}`)
  if (changed.length === 0) {
    console.log('All memory decks carry format 2 and the derived originGoalIds.')
    return
  }
  console.log(`${args.check ? 'Out of date' : 'Updated'}: ${changed.length} deck(s)`)
  changed.forEach((path) => console.log(`- ${path}`))
  if (args.check) {
    console.log('Run `npm --prefix app run sync:memory-deck-origins`, then redeploy the decks.')
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
