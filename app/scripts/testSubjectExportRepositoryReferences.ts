import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  packageContentForRepoSource,
  packageMemoryCardReviewLedger,
  packageMemoryCardReviewReport,
  rewriteJsonRepositoryReferences,
  sanitizeJsonForPackage,
  selectCardDeckFiles,
  selectMappingFiles,
  selectMemoryCardReviewAudits,
  selectSourceExtractionFiles,
  selectSourceExtractionJsonFiles,
  sourceGoalReferenceIndex,
  sourceGoalReferenceIndexRecord,
} from './buildSkillpilotExportPackage'

type JsonValue = Parameters<typeof rewriteJsonRepositoryReferences>[0]
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string): JsonValue => JSON.parse(readFileSync(path, 'utf8')) as JsonValue
const record = (value: JsonValue | undefined): Record<string, JsonValue> => {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, JsonValue>
}
const array = (value: JsonValue | undefined): JsonValue[] => {
  assert(Array.isArray(value))
  return value
}
const internalPatterns = [
  /\/home\//u,
  /\\home\\/u,
  /curricula\/DE\/Gymnasium\//u,
  /app\/public\//u,
  /tmp\/exports\//u,
  /"sourceExtractionPath"/u,
  /"sourceExtractionPaths"/u,
  /"generatedRationale"/u,
]
const assertPortable = (text: string, context: string) => {
  for (const pattern of internalPatterns) {
    assert(!pattern.test(text), `${context}: retained internal reference matching ${pattern}`)
  }
}
const repositoryPath = /(?:curricula[/\\]|app[/\\]public[/\\]|[/\\]home[/\\])[^\s`"'()[\]{}<>]+/gu

// Review records and decks retain their entire shape and every ordinary value.
// For an original pointer-bearing string, all surrounding prose must survive in
// order, including qualifications about the status and limits of a review.
const assertOnlyPointersChanged = (
  before: JsonValue,
  after: JsonValue,
  context: string,
  omittedInternalKeys: ReadonlySet<string> = new Set(),
): void => {
  if (typeof before === 'string' && typeof after === 'string' && before !== after) {
    const literalParts = before.split(repositoryPath)
    assert(literalParts.length > 1, `${context}: changed a string without a repository pointer`)
    let position = 0
    for (const part of literalParts) {
      if (!part) continue
      const next = after.indexOf(part, position)
      assert(next >= position, `${context}: changed prose outside its repository pointer`)
      position = next + part.length
    }
    return
  }
  if (Array.isArray(before)) {
    assert(Array.isArray(after), context)
    assert.equal(after.length, before.length, context)
    before.forEach((value, index) => assertOnlyPointersChanged(value, after[index], `${context}[${index}]`, omittedInternalKeys))
    return
  }
  if (before !== null && typeof before === 'object') {
    const actual = record(after)
    const retained = Object.entries(before).filter(([key]) => !omittedInternalKeys.has(key))
    assert.deepEqual(Object.keys(actual).sort(), retained.map(([key]) => key).sort(), `${context}: no other record field may disappear`)
    retained.forEach(([key, value]) => assertOnlyPointersChanged(value, actual[key], `${context}.${key}`, omittedInternalKeys))
    return
  }
  assert.deepEqual(after, before, context)
}

const fixture = {
  text: 'A formula \\alpha + \\beta must survive.',
  rationale: 'Existing qualified judgment; see curricula/DE/Gymnasium/quality/example.json; no new approval.',
  provenance: { path: 'curricula/DE/Gymnasium/quality/example.json', sha256: 'a'.repeat(64), approved: false },
}
const rewritten = rewriteJsonRepositoryReferences(fixture)
assertOnlyPointersChanged(fixture, rewritten, 'reference-only boundary')
assert.equal(record(rewritten).text, fixture.text)
assert.equal(record(record(rewritten).provenance).sha256, fixture.provenance.sha256)
assert.equal(record(record(rewritten).provenance).approved, false)
assertPortable(JSON.stringify(rewritten), 'reference-only boundary')

const specifications = [
  ['BIOLOGIE', 'biologie'],
  ['CHEMIE', 'chemie'],
  ['DEUTSCH', 'deutsch'],
  ['GESCHICHTE', 'geschichte'],
  ['INFORMATIK', 'informatik'],
  ['LATEIN', 'latein'],
  ['MATHEMATIK', 'mathematik'],
  ['PHYSIK', 'physik'],
  ['POLITIKWIRTSCHAFT', 'politik-und-wirtschaft'],
  ['WIRTSCHAFT', 'wirtschaftswissenschaften'],
] as const
let deckCount = 0
let ledgerRecords = 0
let sourceGoalCount = 0
let normalizedPassageReferences = 0
let candidateBindings = 0
for (const [token, slug] of specifications) {
  const canonicalPath = resolve(repoRoot, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${token}.de.json`)
  const canonicalBytes = readFileSync(canonicalPath)
  const landscape = record(readJson(canonicalPath))
  const originalGoals = array(landscape.goals)
  const portableLandscape = record(sanitizeJsonForPackage(landscape, 'canonical-landscape'))
  assertPortable(JSON.stringify(portableLandscape), `${slug} canonical`)
  const portableGoals = array(portableLandscape.goals)
  assert.equal(portableGoals.length, originalGoals.length)
  for (let index = 0; index < originalGoals.length; index += 1) {
    const original = record(originalGoals[index])
    const portable = record(portableGoals[index])
    for (const key of ['id', 'title', 'titleEn', 'description', 'descriptionEn']) {
      assert.deepEqual(portable[key], original[key], `${slug} ${String(original.id)}.${key}`)
    }
    const beforeExtended = original.extendedData
    if (beforeExtended === null || typeof beforeExtended !== 'object' || Array.isArray(beforeExtended)) continue
    const afterExtended = record(portable.extendedData)
    for (const [key, value] of Object.entries(beforeExtended)) {
      if (!key.endsWith('CandidateBinding')) continue
      const originalBinding = record(value)
      const portableBinding = record(afterExtended[key])
      if (!Object.hasOwn(originalBinding, 'prospectiveNormalFile')) continue
      candidateBindings += 1
      assert(!Object.hasOwn(portableBinding, 'prospectiveNormalFile'), 'the unshipped internal prospective file is omitted')
      const retained = Object.fromEntries(Object.entries(originalBinding).filter(([field]) => field !== 'prospectiveNormalFile'))
      assertOnlyPointersChanged(retained, portableBinding, `${slug}.${key}`, new Set(['path']))
      for (const [field, fieldValue] of Object.entries(retained)) {
        if (fieldValue === false) assert.equal(portableBinding[field], false, `${slug}.${key}.${field}: no approval claim may change`)
      }
    }
  }

  const errors: string[] = []
  const decks = selectCardDeckFiles(landscape, errors)
  for (const path of decks) {
    const bytes = readFileSync(path)
    const original = record(readJson(path))
    const output = packageContentForRepoSource(path, 'card-deck')
    assertPortable(output.toString('utf8'), `${slug} deck ${path}`)
    const portable = record(JSON.parse(output.toString('utf8')) as JsonValue)
    assertOnlyPointersChanged(original, portable, `${slug} deck ${path}`)
    assert.deepEqual(portable.cards, original.cards, 'all actual card content and fingerprint payloads remain exact')
    assert.deepEqual(readFileSync(path), bytes, 'export never changes the reviewed source deck')
    deckCount += 1
  }
  assert.equal(typeof landscape.landscapeId, 'string')
  const audits = selectMemoryCardReviewAudits(landscape.landscapeId as string, errors)
  for (const audit of audits) {
    for (const kind of ['goal', 'card'] as const) {
      const path = kind === 'goal' ? audit.reviewPath : audit.cardReviewPath
      const bytes = readFileSync(path)
      const original = bytes.toString('utf8').split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line) as JsonValue)
      const output = packageMemoryCardReviewLedger(audit, kind)
      assertPortable(output, `${slug} ${kind} ledger`)
      const portable = output.split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line) as JsonValue)
      assertOnlyPointersChanged(original, portable, `${slug} ${kind} ledger`)
      for (let index = 0; index < original.length; index += 1) {
        const before = record(original[index])
        const after = record(portable[index])
        for (const field of ['fingerprint', 'status', 'memoryUseful', 'necessary', 'memoryGoalIds', 'deckIds', 'originGoalIds', 'reviewer', 'reviewedAt']) {
          assert.deepEqual(after[field], before[field], `${slug} ${kind} review ${index}.${field}`)
        }
      }
      assert.deepEqual(readFileSync(path), bytes, 'export never changes the original review ledger')
      ledgerRecords += original.length
    }
    const reportBytes = readFileSync(audit.reportPath)
    const report = packageMemoryCardReviewReport(audit, slug)
    assertPortable(report, `${slug} audit report`)
    assert(report.includes(`data/canonical/${slug}.landscape.json`))
    assert(!report.includes(audit.configPath) && !report.includes(audit.reviewPath) && !report.includes(audit.cardReviewPath))
    assert.deepEqual(readFileSync(audit.reportPath), reportBytes, 'export never changes the generated source audit')
  }

  const mappings = selectMappingFiles([], landscape.landscapeId as string)
  const sources = selectSourceExtractionJsonFiles(selectSourceExtractionFiles(mappings, [], errors))
  const sourceIndex = sourceGoalReferenceIndex(sources, mappings)
  assertPortable(JSON.stringify(sourceIndex), `${slug} source reference index`)
  for (const path of sources) {
    const original = record(readJson(path))
    const indexed = sourceGoalReferenceIndexRecord(path)
    const originalSourceGoals = array(original.sourceGoals)
    assert.equal(indexed.sourceGoals.length, originalSourceGoals.length)
    const passages = Array.isArray(original.passages) ? original.passages.map(record) : []
    const passagesById = new Map(passages.map((passage) => [passage.id, passage]))
    for (let index = 0; index < originalSourceGoals.length; index += 1) {
      const before = record(originalSourceGoals[index])
      const after = indexed.sourceGoals[index]
      const originalText = [before.sourceText, before.rawSourceText, before.parentBulletText, before.description]
        .find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() ?? ''
      assert.equal(after.sourceText, originalText, 'repository-pointer normalization never changes official source text')
      assert.equal(after.sourceTextSha256, createHash('sha256').update(originalText).digest('hex'))
      const passage = passagesById.get(before.passageId)
      if (typeof passage?.sourceRef === 'string' && internalPatterns.some((pattern) => pattern.test(passage.sourceRef as string))) {
        normalizedPassageReferences += 1
        assert(after.passage)
        assertPortable(JSON.stringify(after.passage), `${slug} normalized source passage`)
      }
      sourceGoalCount += 1
    }
  }
  assert.deepEqual(errors, [], `${slug}: current source inputs remain valid`)
  assert.deepEqual(readFileSync(canonicalPath), canonicalBytes, 'export never changes canonical content')
}
assert(candidateBindings > 0, 'the regression includes current Chemistry candidate qualification fields')
assert(normalizedPassageReferences > 0, 'the regression includes inherited passage sourceRef repository pointers')
console.log(`Subject export references passed: ${specifications.length} subjects, ${deckCount} decks, ${ledgerRecords} review records, ${sourceGoalCount} exact source texts; candidate qualifications and source hashes preserved`)
