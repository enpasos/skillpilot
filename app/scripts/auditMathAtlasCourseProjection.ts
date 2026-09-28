import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  canonicalGoalMatchesCourseProfile,
  loadGoalBookBuildInputs,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookPage,
} from './goalBookModel'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const preparationDirectory = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1'
)
const currentConfig = resolve(repositoryRoot, 'app/scripts/config/goal-books/de-gym-math-national-atlas.json')
const proposedConfig = resolve(repositoryRoot, preparationDirectory, 'proposed-atlas.config.json')
const reportPath = resolve(repositoryRoot, preparationDirectory, 'course-projection-delta.json')
const resolutionRegistryPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
)
const digest = (value: unknown): string => (
  `sha256:${createHash('sha256').update(stableGoalBookJson(value)).digest('hex')}`
)
const withoutPageApplicability = (page: GoalBookPage) => {
  const content: Record<string, unknown> = { ...page }
  delete content.applicability
  delete content.pageFingerprint
  return content
}
const scopeKeys = (page: GoalBookPage): string[] => (page.applicability ?? [])
  .flatMap(({ jurisdiction, scopes }) => scopes.map((scope) => (
    [jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('|')
  )))
  .sort()

interface DescriptionBinding {
  indexPath: string
  resolutionPath: string
  resolutionDigest: string
}

const getDeclaredStrictDescriptionBindings = async (): Promise<Map<string, DescriptionBinding>> => {
  const registry = JSON.parse(await readFile(resolutionRegistryPath, 'utf8')) as {
    subjects: Array<{ subject: string; resolutionIndexPaths: string[] }>
  }
  const math = registry.subjects.find(({ subject }) => subject === 'mathematik')
  assert.ok(math, 'Mathematics resolution registry missing')
  const bindings = new Map<string, DescriptionBinding>()
  for (const indexPath of math.resolutionIndexPaths) {
    const index = JSON.parse(await readFile(resolve(repositoryRoot, indexPath), 'utf8')) as {
      resolutions: Array<{
        goalId: string
        strictDescriptionComplete: boolean
        resolutionPath: string
        resolutionDigest: string
      }>
    }
    for (const resolution of index.resolutions) {
      if (!resolution.strictDescriptionComplete) continue
      assert.ok(!bindings.has(resolution.goalId), `duplicate D claim ${resolution.goalId}`)
      bindings.set(resolution.goalId, {
        indexPath,
        resolutionPath: resolve(dirname(indexPath), resolution.resolutionPath),
        resolutionDigest: resolution.resolutionDigest,
      })
    }
  }
  return bindings
}

const main = async () => {
  const courseFixture = (tags: string[], courseLevel: string) => ({
    id: 'fixture', title: 'Fixture', requires: [], contains: [], tags,
    release: { courseLevel },
  })
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['GK'], 'LK'), 'GK'), true)
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['GK'], 'LK'), 'LK'), true)
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['LK'], 'GK'), 'GK'), true)
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['LK'], 'GK'), 'LK'), true)
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['LK'], ''), 'GK'), false)
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture(['LK'], ''), 'LK'), true)
  // The backend currently treats goals with no tags as course-unrestricted,
  // even if release.courseLevel is set. Preserve that exact compatibility rule.
  assert.equal(canonicalGoalMatchesCourseProfile(courseFixture([], 'LK'), 'GK'), true)
  const [oldModel, newModel, registeredDBindings] = await Promise.all([
    loadGoalBookBuildInputs(currentConfig).then(({ model }) => model),
    loadGoalBookBuildInputs(proposedConfig).then(({ model }) => model),
    getDeclaredStrictDescriptionBindings(),
  ])
  parseAndValidateGoalBookModel(oldModel)
  parseAndValidateGoalBookModel(newModel)
  assert.equal(oldModel.book.pageCount, 797)
  assert.equal(newModel.book.pageCount, oldModel.book.pageCount)
  assert.deepEqual(newModel.pages.map(({ goalId }) => goalId), oldModel.pages.map(({ goalId }) => goalId))
  assert.equal(newModel.source.landscapeDigest, oldModel.source.landscapeDigest)
  assert.equal(newModel.source.compositionViewDigest, oldModel.source.compositionViewDigest)
  assert.equal(newModel.source.goalVisualizationQaDigest, oldModel.source.goalVisualizationQaDigest)
  assert.equal(newModel.source.semanticKindLedgerDigest, oldModel.source.semanticKindLedgerDigest)
  const canonicalLandscape = JSON.parse(await readFile(resolve(
    repositoryRoot,
    newModel.source.landscapePath,
  ), 'utf8')) as { goals: Array<{ id: string; tags?: string[]; release?: unknown }> }
  const goalById = new Map(canonicalLandscape.goals.map((goal) => [goal.id, goal]))
  for (const page of newModel.pages) {
    const goal = goalById.get(page.goalId)
    assert.ok(goal, `missing canonical goal ${page.goalId}`)
    for (const applicability of page.applicability ?? []) {
      for (const scope of applicability.scopes) {
        if (scope.stage !== 'SekII') continue
        assert.ok(scope.courseProfile)
        assert.ok(canonicalGoalMatchesCourseProfile(goal, scope.courseProfile),
          `${page.goalId}: ${applicability.jurisdiction} ${scope.courseProfile} is a new course leak`)
      }
    }
  }
  for (const goalId of [
    '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
    '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
    'dc12f281-f161-572b-a973-8405ae9b2498',
  ]) {
    const page = newModel.pages.find((candidate) => candidate.goalId === goalId)
    assert.ok(page)
    for (const jurisdiction of ['DE-HE', 'DE-BY']) {
      const scopes = page.applicability?.find((entry) => entry.jurisdiction === jurisdiction)?.scopes ?? []
      assert.ok(scopes.some((scope) => scope.stage === 'SekII' && scope.courseProfile === 'LK'),
        `${goalId}: ${jurisdiction} lost LK membership`)
      assert.ok(scopes.every((scope) => scope.courseProfile !== 'GK'),
        `${goalId}: ${jurisdiction} still leaks into GK`)
    }
  }
  const sharedIntegralGoal = newModel.pages.find(({ goalId }) => (
    goalId === '809ef78a-f282-5593-89be-0f2cb95570ac'
  ))
  assert.ok(sharedIntegralGoal)
  for (const jurisdiction of ['DE-HE', 'DE-BY']) {
    assert.ok(sharedIntegralGoal.applicability?.find((entry) => (
      entry.jurisdiction === jurisdiction
    ))?.scopes.some((scope) => scope.stage === 'SekII' && scope.courseProfile === 'GK'),
    `shared integral goal lost ${jurisdiction} GK membership`)
  }

  const affected = oldModel.pages.flatMap((oldPage, index) => {
    const newPage = newModel.pages[index]
    assert.equal(newPage.goalId, oldPage.goalId)
    const oldKeys = scopeKeys(oldPage)
    const newKeys = scopeKeys(newPage)
    const newSet = new Set(newKeys)
    const oldSet = new Set(oldKeys)
    const added = newKeys.filter((key) => !oldSet.has(key))
    const removed = oldKeys.filter((key) => !newSet.has(key))
    const unaffectedContentDigest = digest(withoutPageApplicability(oldPage))
    assert.equal(digest(withoutPageApplicability(newPage)), unaffectedContentDigest,
      `${oldPage.goalId}: content or visualization changed`)
    assert.equal(oldPage.goalFingerprint, newPage.goalFingerprint)
    if (removed.length === 0 && added.length === 0) {
      assert.equal(oldPage.pageFingerprint, newPage.pageFingerprint)
      return []
    }
    assert.equal(added.length, 0, `${oldPage.goalId}: new applicability was added`)
    assert.ok(removed.every((key) => key.split('|')[1] === 'SekII' && key.endsWith('|GK')),
      `${oldPage.goalId}: a non-SekII-GK scope was removed`)
    assert.notEqual(oldPage.pageFingerprint, newPage.pageFingerprint)
    return [{
      goalId: oldPage.goalId,
      title: oldPage.title,
      oldPageFingerprint: oldPage.pageFingerprint,
      newPageFingerprint: newPage.pageFingerprint,
      goalFingerprint: oldPage.goalFingerprint,
      unaffectedContentDigest,
      removedGkScopes: removed,
      declaredStrictDResolution: registeredDBindings.has(oldPage.goalId),
      ...(registeredDBindings.has(oldPage.goalId)
        ? { priorResolution: registeredDBindings.get(oldPage.goalId) }
        : {}),
    }]
  })
  const removedCount = affected.reduce((sum, page) => sum + page.removedGkScopes.length, 0)
  assert.equal(affected.length, 99, 'expected exact 99-page Mathematics GK/LK delta')
  assert.equal(removedCount, 1447, 'expected exact 1,447 GK-scope removals')
  assert.equal(affected.filter((page) => page.declaredStrictDResolution).length, 98,
    'expected exact 98 registered strict-D claims affected')
  for (const page of affected.filter((candidate) => candidate.declaredStrictDResolution)) {
    const binding = registeredDBindings.get(page.goalId)!
    const resolutionBytes = await readFile(resolve(repositoryRoot, binding.resolutionPath))
    const resolutionDigest = `sha256:${createHash('sha256').update(resolutionBytes).digest('hex')}`
    assert.equal(resolutionDigest, binding.resolutionDigest,
      `${page.goalId}: registered D resolution bytes differ from index`)
    const resolution = JSON.parse(resolutionBytes.toString('utf8')) as {
      goal: { goalId: string; goalFingerprint: string; pageFingerprint: string }
    }
    assert.equal(resolution.goal.goalId, page.goalId)
    assert.equal(resolution.goal.goalFingerprint, page.goalFingerprint)
    // Resolutions bind review-subset pages. Their pagination and navigation
    // orders legitimately differ from a page in the full 797-page Atlas.
    // Record both fingerprints, but never call this a D carryover proof.
    Object.assign(page.priorResolution!, {
      priorReviewSubsetPageFingerprint: resolution.goal.pageFingerprint,
    })
  }
  const byJurisdiction = Object.fromEntries([...new Set(affected.flatMap((page) => (
    page.removedGkScopes.map((scope) => scope.split('|')[0])
  )))].sort().map((jurisdiction) => [jurisdiction, affected.reduce((count, page) => (
    count + page.removedGkScopes.filter((scope) => scope.startsWith(`${jurisdiction}|`)).length
  ), 0)]))
  const report = {
    schemaVersion: 1,
    status: 'preparation_not_activated',
    policy: 'canonical-course-markers-v1',
    baselineBookDigest: oldModel.digest,
    proposedBookDigest: newModel.digest,
    landscapeDigest: oldModel.source.landscapeDigest,
    sourceManifestDigest: oldModel.source.compositionViewManifestDigest,
    pageCount: newModel.pages.length,
    affectedPageCount: affected.length,
    removedGkScopeCount: removedCount,
    addedScopeCount: 0,
    declaredStrictDClaimsAffected: 98,
    note: 'Declared resolution-index IDs are counted here; current strict D validation is a separate gate. No approval is transferred by this report.',
    removedGkScopesByJurisdiction: byJurisdiction,
    affectedPages: affected,
  }
  const bytes = `${JSON.stringify(report, null, 2)}\n`
  if (process.argv.includes('--write')) {
    await writeFile(reportPath, bytes)
  } else {
    assert.equal(await readFile(reportPath, 'utf8'), bytes,
      'stored course-projection-delta.json is stale; rerun with --write')
  }
  console.log(`Math Atlas GK/LK preparation verified: ${affected.length} pages, ${removedCount} GK scopes, 98 registered D claims; proposed digest ${newModel.digest}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
