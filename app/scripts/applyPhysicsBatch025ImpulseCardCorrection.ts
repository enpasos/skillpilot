import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

type JsonRecord = Record<string, unknown>
type Locale = 'de' | 'en'
type DeckSpec = {
  path: string
  locale: Locale
  beforeSha256: string
  afterSha256: string
}
type PlannedFile = {
  path: string
  bytes: string
  beforeSha256: string
  afterSha256: string
  state: 'before' | 'after'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const deckId = 'de_gymnasium_physics_mechanics_ephase'
const cardId = 'physics_e_cov_030'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const originGoalId = 'e790de73-f8e5-4027-bc05-9f12a0e8c9cb'
const reviewedAt = '2026-08-29'
const reviewer = 'codex-physics-b025-impulse-card-correction-2026-08-29'
const reason = (
  'Behalten und korrigiert: Die Karte bezeichnet den Kraftstoß nun ausdrücklich als Vektor '
  + 'der resultierenden äußeren Kraft, verwendet das bestimmte Zeitintegral mit Grenzen und '
  + 'trennt die allgemeine Beziehung vom Spezialfall konstanter resultierender äußerer Kraft; '
  + 'Diagrammdeutung und Anwendung bleiben Teil des Lernziels.'
)
const beforeCardFingerprint = (
  'sha256:044e283f4d0232371dba2d5b2beb40c870b99ade689006b9250683e7829830e1'
)
const afterCardFingerprint = (
  'sha256:dcb301bfdf83cb27d9a2347e625b543fdb4ebbdfdd0e1489b2d2f6e8ac89edde'
)

// Deliberately left unbound until an independent review of the complete no-write plan.
// Both --write and --check fail closed while this value remains PENDING.
const expectedPlanSha256 = '1d4ed9d35b0b316b5824794d0f7e90a5bfc5526c0928d7e1da5fee2b19e1b5d3'

const paths = {
  canonicalDeckDe:
    'curricula/DE/Gymnasium/memory-decks/'
    + 'de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  canonicalDeckEn:
    'curricula/DE/Gymnasium/memory-decks/'
    + 'de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  publicDeckDe: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  publicDeckEn: 'app/public/data/de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  backendDeckDe:
    'backend/src/main/resources/static/data/'
    + 'de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  backendDeckEn:
    'backend/src/main/resources/static/data/'
    + 'de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  cardLedger:
    'curricula/DE/Gymnasium/quality/memory-card-review/'
    + 'canonical-physics-full.cards.review.jsonl',
} as const

const beforeDeckDeSha256 = '38d559d28fa781c6fcc138317cf74674fb0117ba4b13bda09e8763170e7e25e3'
const afterDeckDeSha256 = '8ca9a6c241b40e58adb5ea544329c7846c0aac4faac2f66b55a387345ab9a7c8'
const beforeDeckEnSha256 = 'a7e121f9ee47997aa4b565a51d94653750d5f7b84ca1464ec65864f9dd82deef'
const afterDeckEnSha256 = '66c7e596d9998203fcf017004621cb6430a8c1e4a71b8d3e210d943cd71cc99b'
const beforeLedgerSha256 = '298f8d35f3fea77af1218b02a35c405710232ec660b276ec077e2675a7c6eab6'
const afterLedgerSha256 = 'ac1e0c0878c94397b458adb4b812f02ff02d2d48402b9b23ea7a48b8b3503b1c'

const deckSpecs: DeckSpec[] = [
  {
    path: paths.canonicalDeckDe,
    locale: 'de',
    beforeSha256: beforeDeckDeSha256,
    afterSha256: afterDeckDeSha256,
  },
  {
    path: paths.canonicalDeckEn,
    locale: 'en',
    beforeSha256: beforeDeckEnSha256,
    afterSha256: afterDeckEnSha256,
  },
  {
    path: paths.publicDeckDe,
    locale: 'de',
    beforeSha256: beforeDeckDeSha256,
    afterSha256: afterDeckDeSha256,
  },
  {
    path: paths.publicDeckEn,
    locale: 'en',
    beforeSha256: beforeDeckEnSha256,
    afterSha256: afterDeckEnSha256,
  },
  {
    path: paths.backendDeckDe,
    locale: 'de',
    beforeSha256: beforeDeckDeSha256,
    afterSha256: afterDeckDeSha256,
  },
  {
    path: paths.backendDeckEn,
    locale: 'en',
    beforeSha256: beforeDeckEnSha256,
    afterSha256: afterDeckEnSha256,
  },
]

const expectedOutputPaths = [
  ...deckSpecs.map(({ path }) => path),
  paths.cardLedger,
]

const oldCardText = {
  de: {
    front: 'Kraftstoß?',
    back: String.raw`$\vec J= \int \vec F\,dt \approx \vec F\,\Delta t= \Delta \vec p$`,
  },
  en: {
    front: 'Impulse?',
    back: String.raw`$\vec J= \int \vec F\,dt \approx \vec F\,\Delta t= \Delta \vec p$`,
  },
} as const

const correctedCardText = {
  de: {
    front: 'Kraftstoß durch die resultierende äußere Kraft?',
    back: String.raw`$\vec J_\mathrm{ext}=\int_{t_1}^{t_2}\sum \vec F_\mathrm{ext}(t)\,\mathrm dt=\Delta\vec p$

Bei konstanter resultierender äußerer Kraft gilt $\vec J_\mathrm{ext}=\sum \vec F_\mathrm{ext}\,\Delta t$.`,
  },
  en: {
    front: 'Impulse from the net external force?',
    back: String.raw`$\vec J_\mathrm{ext}=\int_{t_1}^{t_2}\sum \vec F_\mathrm{ext}(t)\,\mathrm dt=\Delta\vec p$

For a constant net external force, $\vec J_\mathrm{ext}=\sum \vec F_\mathrm{ext}\,\Delta t$.`,
  },
} as const

const expectedCardMetadata = {
  de: {
    category: 'E-Phase Mechanik',
    tags: ['GK', 'LK', `goal:${originGoalId}`],
  },
  en: {
    category: 'E-Phase Mechanics',
    tags: ['GK', 'LK', 'coverage:auto', `goal:${originGoalId}`],
  },
} as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => (
  createHash('sha256').update(value).digest('hex')
)
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) throw new Error(message)
}
const exact = (left: unknown, right: unknown): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
)
const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => (
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
)
const normalizeText = (value: unknown): string => (
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
)
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
const readJson = (path: string): JsonRecord => (
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
)
const readJsonl = (path: string): JsonRecord[] => (
  readFileSync(absolute(path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
)
const cardFingerprint = (card: JsonRecord): string => sha256Digest(stableJson({
  ruleVersion: 'memory-card-review-v1',
  deckId,
  cardId: card.id,
  front: normalizeText(card.front),
  back: normalizeText(card.back),
  category: normalizeText(card.category),
  tags: (card.tags as unknown[]).map(normalizeText),
}))

const plannedFiles: PlannedFile[] = []
const plannedDeckBytes = new Map<Locale, string>()
const currentDeckStates = new Map<Locale, Array<'before' | 'after'>>()

for (const spec of deckSpecs) {
  assert(existsSync(absolute(spec.path)), `${spec.path}: missing bounded deck copy`)
  const currentBytes = readFileSync(absolute(spec.path))
  const currentSha256 = sha256(currentBytes)
  assert(
    currentSha256 === spec.beforeSha256 || currentSha256 === spec.afterSha256,
    `${spec.path}: deck is neither exact before-state nor exact after-state`,
  )
  const state = currentSha256 === spec.afterSha256 ? 'after' : 'before'
  const deck = readJson(spec.path)
  assert(deck.deckId === deckId, `${spec.path}: deckId drifted`)
  assert(Array.isArray(deck.cards), `${spec.path}: cards is not an array`)
  const cards = deck.cards as JsonRecord[]
  const matchingCards = cards.filter((card) => card.id === cardId)
  assert(matchingCards.length === 1, `${spec.path}: expected exactly one ${cardId}`)
  const card = matchingCards[0]
  const expectedCurrentText = state === 'before'
    ? oldCardText[spec.locale]
    : correctedCardText[spec.locale]
  assert(card.front === expectedCurrentText.front, `${spec.path}: ${cardId} front drifted`)
  assert(card.back === expectedCurrentText.back, `${spec.path}: ${cardId} back drifted`)
  assert(
    card.category === expectedCardMetadata[spec.locale].category,
    `${spec.path}: ${cardId} category drifted`,
  )
  assert(
    exact(card.tags, expectedCardMetadata[spec.locale].tags),
    `${spec.path}: ${cardId} tags drifted`,
  )

  const nextDeck = cloneJson(deck)
  const nextCard = (nextDeck.cards as JsonRecord[]).find((candidate) => candidate.id === cardId)
  assert(nextCard, `${spec.path}: cloned target card missing`)
  nextCard.front = correctedCardText[spec.locale].front
  nextCard.back = correctedCardText[spec.locale].back
  const nextBytes = serializeJson(nextDeck)
  assert(sha256(nextBytes) === spec.afterSha256, `${spec.path}: planned deck hash drifted`)

  const priorLocaleBytes = plannedDeckBytes.get(spec.locale)
  if (priorLocaleBytes !== undefined) {
    assert(priorLocaleBytes === nextBytes, `${spec.locale}: planned deck copies differ`)
  } else {
    plannedDeckBytes.set(spec.locale, nextBytes)
  }
  const localeStates = currentDeckStates.get(spec.locale) ?? []
  localeStates.push(state)
  currentDeckStates.set(spec.locale, localeStates)
  plannedFiles.push({
    path: spec.path,
    bytes: nextBytes,
    beforeSha256: spec.beforeSha256,
    afterSha256: spec.afterSha256,
    state,
  })
}

for (const locale of ['de', 'en'] as const) {
  const localeSpecs = deckSpecs.filter((spec) => spec.locale === locale)
  const localeStates = currentDeckStates.get(locale) ?? []
  assert(localeSpecs.length === 3 && localeStates.length === 3, `${locale}: copy count drifted`)
  if (new Set(localeStates).size === 1) {
    const currentCopies = localeSpecs.map((spec) => readFileSync(absolute(spec.path)))
    assert(
      currentCopies.every((bytes) => bytes.equals(currentCopies[0])),
      `${locale}: same-state deck copies are not byte-identical`,
    )
  }
}

assert(existsSync(absolute(paths.cardLedger)), 'Card-review ledger is missing')
const currentLedgerBytes = readFileSync(absolute(paths.cardLedger))
const currentLedgerSha256 = sha256(currentLedgerBytes)
assert(
  currentLedgerSha256 === beforeLedgerSha256 || currentLedgerSha256 === afterLedgerSha256,
  'Card-review ledger is neither exact before-state nor exact after-state',
)
const ledgerState = currentLedgerSha256 === afterLedgerSha256 ? 'after' : 'before'
const ledger = readJsonl(paths.cardLedger)
const matchingLedgerRecords = ledger.filter((record) => (
  record.deckId === deckId && record.cardId === cardId
))
assert(matchingLedgerRecords.length === 1, `Expected exactly one ledger record for ${cardId}`)
const ledgerRecord = matchingLedgerRecords[0]
assert(ledgerRecord.schemaVersion === 1, `${cardId}: ledger schemaVersion drifted`)
assert(ledgerRecord.reviewId === 'canonical-physics-full', `${cardId}: reviewId drifted`)
assert(ledgerRecord.ruleVersion === 'memory-card-review-v1', `${cardId}: ruleVersion drifted`)
assert(ledgerRecord.landscapeId === landscapeId, `${cardId}: landscapeId drifted`)
assert(ledgerRecord.status === 'kept', `${cardId}: status drifted`)
assert(ledgerRecord.necessary === true, `${cardId}: necessary flag drifted`)
assert(exact(ledgerRecord.originGoalIds, [originGoalId]), `${cardId}: originGoalIds drifted`)
if (ledgerState === 'before') {
  assert(ledgerRecord.fingerprint === beforeCardFingerprint, `${cardId}: old fingerprint drifted`)
  assert(ledgerRecord.reviewedAt === '2026-05-17', `${cardId}: old reviewedAt drifted`)
  assert(ledgerRecord.reviewer === 'codex-physics-memory-pilot', `${cardId}: old reviewer drifted`)
} else {
  assert(ledgerRecord.fingerprint === afterCardFingerprint, `${cardId}: new fingerprint drifted`)
  assert(ledgerRecord.reviewedAt === reviewedAt, `${cardId}: new reviewedAt drifted`)
  assert(ledgerRecord.reviewer === reviewer, `${cardId}: new reviewer drifted`)
  assert(ledgerRecord.reason === reason, `${cardId}: new reason drifted`)
}

const primaryDeDeck = readJson(paths.canonicalDeckDe)
const primaryDeCard = (primaryDeDeck.cards as JsonRecord[])
  .find((card) => card.id === cardId)
assert(primaryDeCard, `${cardId}: primary German card missing`)
const primaryDeState = plannedFiles.find(({ path }) => path === paths.canonicalDeckDe)?.state
assert(primaryDeState, `${cardId}: primary German deck state missing`)
assert(
  cardFingerprint(primaryDeCard) === (
    primaryDeState === 'before' ? beforeCardFingerprint : afterCardFingerprint
  ),
  `${cardId}: primary German card fingerprint disagrees with its bound file state`,
)
if (primaryDeState === ledgerState) {
  assert(
    ledgerRecord.fingerprint === cardFingerprint(primaryDeCard),
    `${cardId}: same-state primary card and ledger fingerprints disagree`,
  )
}
const plannedPrimaryDeCard = cloneJson(primaryDeCard)
plannedPrimaryDeCard.front = correctedCardText.de.front
plannedPrimaryDeCard.back = correctedCardText.de.back
assert(
  cardFingerprint(plannedPrimaryDeCard) === afterCardFingerprint,
  `${cardId}: corrected fingerprint mismatch`,
)

const nextLedger = cloneJson(ledger)
const nextLedgerRecord = nextLedger.find((record) => (
  record.deckId === deckId && record.cardId === cardId
))
assert(nextLedgerRecord, `${cardId}: cloned ledger record missing`)
Object.assign(nextLedgerRecord, {
  fingerprint: afterCardFingerprint,
  reviewedAt,
  reviewer,
  reason,
})
const nextLedgerBytes = serializeJsonl(nextLedger)
assert(sha256(nextLedgerBytes) === afterLedgerSha256, 'Planned card-review ledger hash drifted')
plannedFiles.push({
  path: paths.cardLedger,
  bytes: nextLedgerBytes,
  beforeSha256: beforeLedgerSha256,
  afterSha256: afterLedgerSha256,
  state: ledgerState,
})

assert(plannedFiles.length === 7, `Expected exactly seven planned files, got ${plannedFiles.length}`)
assert(
  exact(plannedFiles.map(({ path }) => path), expectedOutputPaths),
  'Impulse-card output boundary drifted',
)
assert(new Set(expectedOutputPaths).size === 7, 'Impulse-card output boundary contains duplicates')

const boundedPlan = {
  schemaVersion: 1,
  contract: 'physics-b025-impulse-card-correction-plan-v1',
  scope: {
    deckId,
    cardId,
    originGoalId,
    outputFileCount: 7,
    outputPaths: expectedOutputPaths,
  },
  correction: {
    de: correctedCardText.de,
    en: correctedCardText.en,
    fingerprint: afterCardFingerprint,
    reviewedAt,
    reviewer,
    reason,
  },
  outputBindings: plannedFiles.map(({ path, beforeSha256, afterSha256 }) => ({
    path,
    beforeSha256,
    afterSha256,
  })),
}
const planSha256 = sha256(stableJson(boundedPlan))

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${planSha256} binding=${expectedPlanSha256}`)
console.log(`SCOPE files=${plannedFiles.length} decks=6 ledgers=1 card=${cardId}`)
console.log(`CARD_FINGERPRINT ${beforeCardFingerprint} -> ${afterCardFingerprint}`)
for (const file of plannedFiles) {
  console.log(
    `${file.state === 'after' ? 'KEEP' : 'UPDATE'} ${file.path} `
    + `${file.beforeSha256} -> ${file.afterSha256}`,
  )
}

if (checkMode) {
  assert(expectedPlanSha256 !== 'PENDING', 'CHECK failed: expectedPlanSha256 remains PENDING')
  assert(planSha256 === expectedPlanSha256, 'CHECK failed: plan hash drifted')
  const incomplete = plannedFiles.filter(({ state }) => state !== 'after')
  assert(incomplete.length === 0, `CHECK failed: ${incomplete.length} output(s) remain before-state`)
  console.log('CHECK PASS')
} else if (writeMode) {
  assert(
    expectedPlanSha256 !== 'PENDING',
    `Refusing --write: bind expectedPlanSha256 to ${planSha256} after independent review`,
  )
  assert(planSha256 === expectedPlanSha256, 'Refusing --write: plan hash drifted')
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const updates = plannedFiles.filter(({ state }) => state === 'before')
  const stagingPath = (path: string): string => `${absolute(path)}.b025-impulse-card-staging`
  const remainingStaging = new Set<string>()
  try {
    for (const file of updates) {
      const staging = stagingPath(file.path)
      mkdirSync(dirname(staging), { recursive: true })
      if (existsSync(staging)) {
        assert(sha256(readFileSync(staging)) === file.afterSha256, `${file.path}: stale staging drifted`)
      } else {
        writeFileSync(staging, file.bytes, { encoding: 'utf8', flag: 'wx' })
      }
      assert(sha256(readFileSync(staging)) === file.afterSha256, `${file.path}: staging hash mismatch`)
      remainingStaging.add(staging)
    }
    for (const file of updates) {
      const staging = stagingPath(file.path)
      renameSync(staging, absolute(file.path))
      remainingStaging.delete(staging)
      assert(
        sha256(readFileSync(absolute(file.path))) === file.afterSha256,
        `${file.path}: post-rename hash mismatch`,
      )
    }
  } finally {
    for (const staging of remainingStaging) rmSync(staging, { force: true })
  }
  console.log(`WRITE PASS ${updates.length} bounded file(s) atomically replaced`)
} else {
  console.log('PLAN ONLY; no files written. --write is fail-closed while expectedPlanSha256 is PENDING.')
}
