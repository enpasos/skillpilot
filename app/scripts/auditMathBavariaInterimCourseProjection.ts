import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, type GoalBookModel } from './goalBookModel'
import {
  bavariaSekIIScopes,
  deriveBavariaOptionalOnlyGoalIds,
  type BavariaMathSourceExtraction,
  type BavariaMathSourceMapping,
} from './mathBavariaOptionalCourseProjection'

/** Diagnostic only: this does not change goal applicability or approve a D review. */
const root = fileURLToPath(new URL('../..', import.meta.url))
const preparation = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1'
const sourcePath = 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const currentConfig = 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
const proposedConfig = `${preparation}/proposed-atlas.config.json`
const mandatoryDocuments = ['JGST12_EA', 'JGST13_EA_TEIL1', 'JGST13_EA_TEIL2'] as const
const optionalDocument = 'JGST12_VERTIEFUNG'
// BY GK excludes Vertiefungskurs-only nodes and now includes source-supported b9bb/31be. Further scope edits require reviewing and rebinding this digest.
const expectedBindingDigest = 'sha256:5cfaf23045f9350870d2573a2de8121f8750c231df0159bdf496b6a6f8f09952'

type SourceGoal = { id: string; sourceDocumentKey: string }
type Mapping = { legacyGoalId: string; canonicalGoalId: string; matchType: 'exact' | 'partial' }
type ScopeClass = 'both' | 'LK' | 'GK' | 'absent'
type Entry = {
  goalId: string
  sourceBindings: Array<{ sourceGoalId: string; sourceDocumentKey: string; matchType: 'exact' | 'partial' }>
  mappingClass: 'exact' | 'partial_only' | 'mixed'
  currentBy: ScopeClass
  proposedBy: ScopeClass
}

const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(resolve(root, path), 'utf8')) as T
const digest = (value: unknown): string => `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`

const byClass = (book: GoalBookModel, goalId: string): ScopeClass => {
  const page = book.pages.find((candidate) => candidate.goalId === goalId)
  assert.ok(page, `${goalId}: curricularAtomic target missing from Atlas`)
  const profiles = [...new Set(bavariaSekIIScopes(page).map((scope) => scope.courseProfile))]
  assert.ok(profiles.every((profile) => profile === 'GK' || profile === 'LK'),
    `${goalId}: unsupported BY course profile`)
  if (profiles.length === 0) return 'absent'
  if (profiles.length === 2) return 'both'
  return profiles[0] as 'GK' | 'LK'
}

const countScopes = (entries: Entry[], key: 'currentBy' | 'proposedBy') => ({
  both: entries.filter((entry) => entry[key] === 'both').length,
  LK: entries.filter((entry) => entry[key] === 'LK').length,
  GK: entries.filter((entry) => entry[key] === 'GK').length,
  absent: entries.filter((entry) => entry[key] === 'absent').length,
})

const main = async () => {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--print'),
    'Usage: tsx app/scripts/auditMathBavariaInterimCourseProjection.ts [--print]')
  const [source, mapping, ledger, current, proposed] = await Promise.all([
    json<BavariaMathSourceExtraction>(sourcePath),
    json<BavariaMathSourceMapping & { mappings: Mapping[] }>(mappingPath),
    json<{ decisions: Array<{ goalId: string; semanticKind: string }> }>(ledgerPath),
    loadGoalBookBuildInputs(currentConfig).then(({ model }) => model),
    loadGoalBookBuildInputs(proposedConfig).then(({ model }) => model),
  ])
  const sourceGoals = source.sourceGoals as SourceGoal[]
  const sourceById = new Map(sourceGoals.map((goal) => [goal.id, goal]))
  assert.equal(sourceById.size, sourceGoals.length, 'duplicate BY source goal ID')
  const documents = new Map(source.sourceDocuments.map((document) => [document.key, document.role]))
  for (const key of mandatoryDocuments) assert.equal(documents.get(key), 'binding-core', `${key}: role drifted`)
  assert.equal(documents.get(optionalDocument), 'optional-extension')
  const curricularAtomicIds = new Set(ledger.decisions
    .filter((decision) => decision.semanticKind === 'curricularAtomic')
    .map((decision) => decision.goalId))
  assert.equal(current.pages.length, 797, 'current M7 denominator drifted')
  assert.equal(proposed.pages.length, current.pages.length, 'candidate Atlas changed the M7 denominator')
  const currentPageIds = new Set(current.pages.map((page) => page.goalId))
  const proposedPageIds = new Set(proposed.pages.map((page) => page.goalId))
  assert.deepEqual(proposedPageIds, currentPageIds, 'candidate Atlas changed the target ID set')

  const mandatorySourceIds = new Set(sourceGoals
    .filter((goal) => mandatoryDocuments.includes(goal.sourceDocumentKey as typeof mandatoryDocuments[number]))
    .map((goal) => goal.id))
  const mandatoryRows = mapping.mappings.filter((row) => mandatorySourceIds.has(row.legacyGoalId))
  assert.equal(new Set(mandatoryRows.map((row) => row.legacyGoalId)).size, mandatorySourceIds.size,
    'some mandatory BY source goals are unmapped')
  const optional = deriveBavariaOptionalOnlyGoalIds(source, mapping)
  const optionalOnlyIds = new Set(optional.optionalOnlyCanonicalIds)
  const mandatoryIds = [...new Set(mandatoryRows.map((row) => row.canonicalGoalId))]
    .filter((goalId) => curricularAtomicIds.has(goalId))
  const optionalIds = [...optionalOnlyIds].filter((goalId) => curricularAtomicIds.has(goalId))
  assert.ok(mandatoryIds.every((goalId) => currentPageIds.has(goalId)))
  assert.ok(optionalIds.every((goalId) => currentPageIds.has(goalId)))
  assert.deepEqual(mandatoryIds.filter((goalId) => optionalOnlyIds.has(goalId)), [],
    'a BY mandatory target is also optional-only')

  const buildEntries = (goalIds: string[], rows: Mapping[]): Entry[] => goalIds.map((goalId) => {
    const boundRows = rows.filter((row) => row.canonicalGoalId === goalId)
    assert.ok(boundRows.length > 0, `${goalId}: no BY source mapping`)
    const types = [...new Set(boundRows.map((row) => row.matchType))].sort()
    assert.ok(types.every((type) => type === 'exact' || type === 'partial'),
      `${goalId}: unrecognized mapping type`)
    return {
      goalId,
      sourceBindings: boundRows.map((row) => {
        const sourceGoal = sourceById.get(row.legacyGoalId)
        assert.ok(sourceGoal, `${goalId}: unresolved BY source goal ${row.legacyGoalId}`)
        return {
          sourceGoalId: row.legacyGoalId,
          sourceDocumentKey: sourceGoal.sourceDocumentKey,
          matchType: row.matchType,
        }
      }).sort((left, right) => left.sourceGoalId.localeCompare(right.sourceGoalId)
        || left.matchType.localeCompare(right.matchType)),
      mappingClass: types.length === 2 ? 'mixed' : types[0] === 'exact' ? 'exact' : 'partial_only',
      currentBy: byClass(current, goalId),
      proposedBy: byClass(proposed, goalId),
    }
  }).sort((left, right) => left.goalId.localeCompare(right.goalId))
  const mandatory = buildEntries(mandatoryIds, mandatoryRows)
  const optionalSourceIds = new Set(sourceGoals.filter((goal) => goal.sourceDocumentKey === optionalDocument)
    .map((goal) => goal.id))
  const optionalRows = mapping.mappings.filter((row) => optionalSourceIds.has(row.legacyGoalId))
  const optionalEntries = buildEntries(optionalIds, optionalRows)
  const exactMandatory = mandatory.filter((entry) => entry.mappingClass === 'exact')
  const partialMandatory = mandatory.filter((entry) => entry.mappingClass === 'partial_only')
  const exactOptional = optionalEntries.filter((entry) => entry.mappingClass === 'exact')
  const partialOptional = optionalEntries.filter((entry) => entry.mappingClass === 'partial_only')
  const bindingDigest = digest({ mandatory, optional: optionalEntries })
  assert.equal(mandatory.length, 44)
  assert.equal(exactMandatory.length, 14)
  assert.deepEqual(countScopes(mandatory, 'currentBy'), { both: 22, LK: 18, GK: 0, absent: 4 })
  assert.deepEqual(countScopes(mandatory, 'proposedBy'), { both: 20, LK: 20, GK: 0, absent: 4 })
  assert.equal(exactMandatory.filter((entry) => entry.proposedBy === 'LK').length, 2)
  assert.equal(optionalEntries.length, 35)
  assert.deepEqual(countScopes(optionalEntries, 'currentBy'), { both: 0, LK: 35, GK: 0, absent: 0 })
  assert.deepEqual(countScopes(optionalEntries, 'proposedBy'), { both: 0, LK: 35, GK: 0, absent: 0 })
  const summary = {
    status: 'non_active_source_derived_diagnostic',
    mandatorySourceGoals: mandatorySourceIds.size,
    mandatoryMappingRows: mandatoryRows.length,
    mandatoryCanonicalGoals: new Set(mandatoryRows.map((row) => row.canonicalGoalId)).size,
    mandatoryCurricularAtomicPages: mandatory.length,
    mandatoryExactPages: exactMandatory.length,
    mandatoryPartialOnlyPages: partialMandatory.length,
    mandatoryCurrentBy: countScopes(mandatory, 'currentBy'),
    mandatoryProposedBy: countScopes(mandatory, 'proposedBy'),
    mandatoryExactMissingProposedGkIds: exactMandatory.filter((entry) => (
      entry.proposedBy !== 'both' && entry.proposedBy !== 'GK'
    )).map((entry) => entry.goalId),
    mandatoryPartialAbsentProposedLkIds: partialMandatory.filter((entry) => (
      entry.proposedBy !== 'both' && entry.proposedBy !== 'LK'
    )).map((entry) => entry.goalId),
    optionalSourceGoals: optional.optionalSourceGoalCount,
    optionalMappingRows: optional.optionalMappingRows,
    optionalOnlyCanonicalGoals: optional.optionalOnlyCanonicalIds.length,
    optionalCurricularAtomicPages: optionalEntries.length,
    optionalExactPages: exactOptional.length,
    optionalPartialOnlyPages: partialOptional.length,
    optionalCurrentBy: countScopes(optionalEntries, 'currentBy'),
    optionalProposedBy: countScopes(optionalEntries, 'proposedBy'),
    bindingDigest,
  }
  console.log(`${JSON.stringify(summary, null, 2)}\n`)
  if (process.argv[2] === '--print') {
    console.log(`${JSON.stringify({ mandatory, optional: optionalEntries }, null, 2)}\n`)
    return
  }
  assert.equal(bindingDigest, expectedBindingDigest,
    'Bavaria interim-course source mappings or Atlas scopes drifted; inspect and re-adjudicate')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
