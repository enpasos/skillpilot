import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs } from './goalBookModel'
import {
  bavariaSekIIScopes,
  deriveBavariaOptionalOnlyGoalIds,
  remainingApplicabilityScopeCount,
  type BavariaMathSourceExtraction,
  type BavariaMathSourceMapping,
} from './mathBavariaOptionalCourseProjection'

const root = fileURLToPath(new URL('../..', import.meta.url))
const preparation = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1'
)
const sourcePath = (
  'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/'
  + 'DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
)
const mappingPath = (
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/'
  + 'bavaria_math_source_extraction_to_canonical_math.review.json'
)
const currentConfig = 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
const proposedConfig = `${preparation}/proposed-atlas.config.json`
const reportPath = `${preparation}/bavaria-optional-course-candidate.json`
const registryPath = (
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
  + 'de-gymnasium-math-physics.config.json'
)
const fifteenInputPath = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-15-current-review-20260927-v1/'
  + 'round-a/description-review-input.json'
)
const digestBytes = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const json = async <T>(path: string): Promise<T> => JSON.parse(
  await readFile(resolve(root, path), 'utf8'),
) as T
const scopes = (page: { applicability?: Array<{ jurisdiction: string; scopes: Array<{
  stage: string; durationModel: string | null; courseProfile: string | null
}> }> }) => page.applicability?.flatMap((group) => group.scopes.map((scope) => (
  `${group.jurisdiction}|${scope.stage}|${scope.durationModel ?? ''}|${scope.courseProfile ?? ''}`
))) ?? []

interface CandidateSnapshot {
  registeredStrictDClaimsOnAffectedPages: number
  pages: Array<{ goalId: string; registeredStrictDClaim: boolean; [key: string]: unknown }>
  [key: string]: unknown
}

/** D is live registry state; the checked-in candidate records an earlier D snapshot. */
export const assertBavariaOptionalCandidateSnapshot = (
  current: CandidateSnapshot,
  snapshot: CandidateSnapshot,
) => {
  const validateDClaims = (candidate: CandidateSnapshot, label: string) => {
    assert.ok(Array.isArray(candidate.pages), `${label}: pages must be an array`)
    assert.equal(new Set(candidate.pages.map((page) => page.goalId)).size, candidate.pages.length,
      `${label}: duplicate page IDs`)
    for (const page of candidate.pages) {
      assert.ok(page.goalId, `${label}: empty page ID`)
      assert.equal(typeof page.registeredStrictDClaim, 'boolean',
        `${label}: ${page.goalId} has an invalid strict D claim`)
    }
    assert.equal(candidate.registeredStrictDClaimsOnAffectedPages,
      candidate.pages.filter((page) => page.registeredStrictDClaim).length,
      `${label}: strict D count disagrees with page claims`)
  }
  validateDClaims(current, 'current candidate')
  validateDClaims(snapshot, 'stored candidate')

  const withoutDClaims = (candidate: CandidateSnapshot) => {
    const stable = structuredClone(candidate)
    delete (stable as Partial<CandidateSnapshot>).registeredStrictDClaimsOnAffectedPages
    stable.pages.forEach((page) => { delete (page as Partial<typeof page>).registeredStrictDClaim })
    return stable
  }
  assert.deepEqual(withoutDClaims(current), withoutDClaims(snapshot),
    'Bavaria optional-course source/projection candidate drifted; inspect before rebinding')

  const previousClaims = new Map(snapshot.pages.map((page) => [page.goalId, page.registeredStrictDClaim]))
  for (const page of current.pages) {
    assert.ok(!previousClaims.get(page.goalId) || page.registeredStrictDClaim,
      `${page.goalId}: a previously registered strict D claim regressed`)
  }
}

const main = async () => {
  assert.deepEqual(process.argv.slice(2).filter((argument) => argument !== '--write'), [],
    'only --write is supported')
  const [sourceBytes, mappingBytes, current, proposed, registry, fifteen] = await Promise.all([
    readFile(resolve(root, sourcePath)),
    readFile(resolve(root, mappingPath)),
    loadGoalBookBuildInputs(resolve(root, currentConfig)).then(({ model }) => model),
    loadGoalBookBuildInputs(resolve(root, proposedConfig)).then(({ model }) => model),
    json<{ subjects: Array<{ subject: string; resolutionIndexPaths: string[] }> }>(registryPath),
    json<{ goals: Array<{ goalId: string }> }>(fifteenInputPath),
  ])
  assert.equal(current.book.pageCount, 797)
  assert.equal(proposed.book.pageCount, 797)
  const derivation = deriveBavariaOptionalOnlyGoalIds(
    JSON.parse(sourceBytes.toString('utf8')) as BavariaMathSourceExtraction,
    JSON.parse(mappingBytes.toString('utf8')) as BavariaMathSourceMapping,
  )
  const source = JSON.parse(sourceBytes.toString('utf8')) as Omit<BavariaMathSourceExtraction, 'sourceGoals'> & {
    sourceGoals: Array<{ id: string; sourceDocumentKey: string; topicCode: string }>
  }
  const mapping = JSON.parse(mappingBytes.toString('utf8')) as BavariaMathSourceMapping
  assert.equal(derivation.optionalSourceGoalCount, 41)
  assert.equal(derivation.optionalMappingRows, 66)
  assert.equal(derivation.optionalCanonicalGoalCount, 48)
  assert.deepEqual(derivation.sharedCanonicalIds, [],
    'a BY goal also mapped from a regular source must not be excluded')
  const optionalOnlyIds = new Set(derivation.optionalOnlyCanonicalIds)
  const currentById = new Map(current.pages.map((page) => [page.goalId, page]))
  const affected = proposed.pages.filter((page) => optionalOnlyIds.has(page.goalId))
  assert.equal(affected.length, 35, 'Bavaria optional-course page count drifted')
  const affectedIds = new Set(affected.map((page) => page.goalId))
  const nonPageIds = derivation.optionalOnlyCanonicalIds.filter((id) => !affectedIds.has(id))
  const landscape = await json<{ goals: Array<{ id: string; type?: string; contains?: string[] }> }>(
    current.source.landscapePath,
  )
  const canonicalGoals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  for (const goalId of nonPageIds) {
    const goal = canonicalGoals.get(goalId)
    assert.ok(goal, `missing optional BY canonical cluster ${goalId}`)
    assert.equal(goal.type, 'cluster', `${goalId}: optional BY non-page is not a cluster`)
    assert.ok(goal.contains?.length, `${goalId}: optional BY cluster has no children`)
  }
  const sourceById = new Map(source.sourceGoals.map((goal) => [goal.id, goal]))
  const modulesByPage = new Map<string, Set<string>>()
  for (const row of mapping.mappings) {
    if (!affectedIds.has(row.canonicalGoalId)) continue
    const sourceGoal = sourceById.get(row.legacyGoalId)
    assert.ok(sourceGoal, `missing BY source goal ${row.legacyGoalId}`)
    assert.equal(sourceGoal.sourceDocumentKey, 'JGST12_VERTIEFUNG',
      `${row.canonicalGoalId}: non-optional mapping on optional-only page`)
    assert.match(sourceGoal.topicCode, /^M12-V\.[1-5]$/)
    const modules = modulesByPage.get(row.canonicalGoalId) ?? new Set<string>()
    modules.add(sourceGoal.topicCode)
    modulesByPage.set(row.canonicalGoalId, modules)
  }
  const modulePageCounts = Object.fromEntries([1, 2, 3, 4, 5].map((number) => (
    [`M12-V.${number}`, [...modulesByPage.values()].filter((modules) => (
      modules.has(`M12-V.${number}`)
    )).length]
  )))
  assert.equal(modulesByPage.size, affected.length)
  for (const [goalId, modules] of modulesByPage) {
    assert.equal(modules.size, 1, `${goalId}: optional page belongs to multiple modules`)
  }
  const math = registry.subjects.find((subject) => subject.subject === 'mathematik')
  assert.ok(math, 'Mathematics D registry is absent')
  const strictDIds = new Set<string>()
  for (const indexPath of math.resolutionIndexPaths) {
    const index = await json<{ resolutions: Array<{
      goalId: string; strictDescriptionComplete: boolean
    }> }>(indexPath)
    for (const resolution of index.resolutions) {
      if (!resolution.strictDescriptionComplete) continue
      assert.ok(!strictDIds.has(resolution.goalId), `duplicate strict D owner ${resolution.goalId}`)
      strictDIds.add(resolution.goalId)
    }
  }
  for (const goalId of strictDIds) {
    assert.ok(currentById.has(goalId), `registered strict D goal is absent from the current atlas: ${goalId}`)
  }
  const fifteenIds = new Set(fifteen.goals.map((goal) => goal.goalId))
  assert.equal(fifteenIds.size, 15)
  const pages = affected.map((page) => {
    const old = currentById.get(page.goalId)
    assert.ok(old, `current atlas lost ${page.goalId}`)
    const oldBy = bavariaSekIIScopes(old)
    const proposedBy = bavariaSekIIScopes(page)
    assert.equal(proposedBy.length, 1, `${page.goalId}: optional candidate has unexpected BY scopes`)
    assert.equal(proposedBy[0].courseProfile, 'LK', `${page.goalId}: optional BY scope is not LK`)
    assert.ok(oldBy.some((scope) => scope.courseProfile === 'LK'),
      `${page.goalId}: current atlas has no BY LK scope`)
    const remaining = remainingApplicabilityScopeCount(page)
    assert.ok(remaining > 0, `${page.goalId}: removing BY optional scope would orphan the page`)
    const allScopeKeys = scopes(page)
    const retainedScopeKeys = allScopeKeys.filter((key) => !key.startsWith('DE-BY|SekII|'))
    assert.equal(retainedScopeKeys.length, remaining)
    return {
      goalId: page.goalId,
      title: page.title,
      oldBavariaSekIIScopeCount: oldBy.length,
      oldBavariaSekIIScopeKeys: scopes(old).filter((key) => key.startsWith('DE-BY|SekII|')),
      proposedBavariaSekIIScopeCount: proposedBy.length,
      proposedBavariaSekIIScopeKeys: allScopeKeys.filter((key) => key.startsWith('DE-BY|SekII|')),
      candidateRemovedScopeKeys: allScopeKeys.filter((key) => key.startsWith('DE-BY|SekII|')),
      retainedScopeCount: remaining,
      registeredStrictDClaim: strictDIds.has(page.goalId),
      inCurrentFifteenPageReview: fifteenIds.has(page.goalId),
    }
  }).sort((left, right) => left.goalId.localeCompare(right.goalId))
  const report = {
    schemaVersion: 1,
    status: 'non_active_source_mapping_derived_candidate',
    sourcePath,
    sourceDigest: digestBytes(sourceBytes),
    mappingPath,
    mappingDigest: digestBytes(mappingBytes),
    currentAtlasBookDigest: current.digest,
    proposedGkLkAtlasBookDigest: proposed.digest,
    optionalSourceGoalCount: derivation.optionalSourceGoalCount,
    optionalMappingRowCount: derivation.optionalMappingRows,
    optionalCanonicalGoalCount: derivation.optionalCanonicalGoalCount,
    sharedWithOtherBavariaDocuments: derivation.sharedCanonicalIds,
    optionalOnlyCanonicalGoalCount: derivation.optionalOnlyCanonicalIds.length,
    currentAtlasPageCount: current.pages.length,
    affectedPageCount: pages.length,
    candidateBavariaSekIIScopesRemoved: pages.reduce((sum, page) => (
      sum + page.candidateRemovedScopeKeys.length
    ), 0),
    pagesOrphanedIfRemoved: pages.filter((page) => page.retainedScopeCount === 0).length,
    registeredStrictDClaimsOnAffectedPages: pages.filter((page) => page.registeredStrictDClaim).length,
    currentFifteenPageReviewOverlap: pages.filter((page) => page.inCurrentFifteenPageReview)
      .map((page) => page.goalId),
    pages,
  }
  assert.equal(report.candidateBavariaSekIIScopesRemoved, 35)
  assert.equal(report.pagesOrphanedIfRemoved, 0)
  assert.equal(report.currentFifteenPageReviewOverlap.length, 5)
  const content = `${JSON.stringify(report, null, 2)}\n`
  if (process.argv.includes('--write')) {
    await writeFile(resolve(root, reportPath), content)
  } else {
    const snapshot = await json<CandidateSnapshot>(reportPath)
    assertBavariaOptionalCandidateSnapshot(report, snapshot)
  }
  console.log(JSON.stringify({
    status: report.status,
    optionalSourceGoals: report.optionalSourceGoalCount,
    optionalOnlyCanonicalGoals: report.optionalOnlyCanonicalGoalCount,
    affectedPages: report.affectedPageCount,
    candidateByScopesRemoved: report.candidateBavariaSekIIScopesRemoved,
    pagesOrphaned: report.pagesOrphanedIfRemoved,
    currentStrictDClaimsAffected: report.registeredStrictDClaimsOnAffectedPages,
    currentFifteenReviewOverlap: report.currentFifteenPageReviewOverlap.length,
    optionalPageCountByModule: modulePageCounts,
    optionalMappedClustersWithoutAtlasPage: nonPageIds.length,
  }, null, 2))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
