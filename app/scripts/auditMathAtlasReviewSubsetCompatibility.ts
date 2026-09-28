import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookPage } from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from './materializeGoalDescriptionRolloutBatch'
import { fingerprintGoalDescriptionReviewPage } from './validateGoalDescriptionDualRoundResolution'
import { proveMathAtlasReviewSubsetNarrowing } from './mathAtlasReviewSubsetCompatibility'

const root = fileURLToPath(new URL('../..', import.meta.url))
const preparation = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1'
)
const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T
const sha256 = (bytes: Uint8Array): string => (
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
)
const main = async () => {
  const report = await json<{
    affectedPages: Array<{ goalId: string; declaredStrictDResolution: boolean }>
    proposedBookDigest: string
  }>(resolve(root, preparation, 'course-projection-delta.json'))
  const targetIds = new Set(report.affectedPages
    .filter(({ declaredStrictDResolution }) => declaredStrictDResolution)
    .map(({ goalId }) => goalId))
  assert.equal(targetIds.size, 95)
  const proposed = (await loadGoalBookBuildInputs(resolve(
    root, preparation, 'proposed-atlas.config.json',
  ))).model
  assert.equal(proposed.digest, report.proposedBookDigest,
    'the course-projection report is stale; regenerate it before subset audit')
  const registry = await json<{ subjects: Array<{
    subject: string
    resolutionIndexPaths: string[]
  }> }>(resolve(root,
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
  const math = registry.subjects.find(({ subject }) => subject === 'mathematik')
  assert.ok(math)
  const subsetCache = new Map<string, {
    old: { pages: GoalBookPage[] }
    proposed: { pages: GoalBookPage[] } | null
    rebuildError: string | null
  }>()
  const cases: Array<{
    goalId: string
    priorResolutionDigest: string
    oldSubsetPageFingerprint: string
    proposedSubsetPageFingerprint: string | null
    rebuildError: string | null
    nonScopeChangedFields: string[]
    removedScopes: string[]
    addedScopes: string[]
    exactScopeNarrowing: boolean
    oldPageDigest: string | null
    proposedPageDigest: string | null
  }> = []
  for (const indexPath of math.resolutionIndexPaths) {
    const absoluteIndex = resolve(root, indexPath)
    const index = await json<{
      groups: Array<{ groupId: string; artifactDirectory?: string }>
      resolutions: Array<{
        goalId: string
        groupId: string
        resolutionPath: string
        resolutionDigest: string
      }>
    }>(absoluteIndex)
    for (const entry of index.resolutions) {
      if (!targetIds.has(entry.goalId)) continue
      const group = index.groups.find(({ groupId }) => groupId === entry.groupId)
      assert.ok(group)
      const groupDirectory = resolve(dirname(absoluteIndex), group.artifactDirectory ?? group.groupId)
      let subset = subsetCache.get(groupDirectory)
      if (!subset) {
        const oldBook = await json<{
          book: { id: string; title: string }
          pages: GoalBookPage[]
        }>(resolve(groupDirectory, 'bundle/book-model.json'))
        let proposedBook: { pages: GoalBookPage[] } | null = null
        let rebuildError: string | null = null
        try {
          proposedBook = buildGoalDescriptionRolloutSubsetModel({
            baseModel: proposed,
            goalIds: oldBook.pages.map(({ goalId }) => goalId),
            bookId: oldBook.book.id,
            title: oldBook.book.title,
          })
        } catch (error) {
          rebuildError = error instanceof Error ? error.message : String(error)
        }
        subset = { old: oldBook, proposed: proposedBook, rebuildError }
        subsetCache.set(groupDirectory, subset)
      }
      const oldPage = subset.old.pages.find(({ goalId }) => goalId === entry.goalId)
      const proposedPage = subset.proposed?.pages.find(({ goalId }) => goalId === entry.goalId)
      assert.ok(oldPage)
      assert.equal(fingerprintGoalDescriptionReviewPage(oldPage), oldPage.pageFingerprint,
        `${entry.goalId}: old review-subset page fingerprint is stale`)
      const resolutionBytes = await readFile(resolve(dirname(absoluteIndex), entry.resolutionPath))
      assert.equal(sha256(resolutionBytes), entry.resolutionDigest)
      const resolution = JSON.parse(resolutionBytes.toString('utf8')) as {
        goal: { goalId: string; goalFingerprint: string; pageFingerprint: string }
      }
      assert.equal(resolution.goal.goalId, entry.goalId)
      assert.equal(resolution.goal.pageFingerprint, oldPage.pageFingerprint)
      if (!proposedPage) {
        cases.push({
          goalId: entry.goalId,
          priorResolutionDigest: entry.resolutionDigest,
          oldSubsetPageFingerprint: oldPage.pageFingerprint,
          proposedSubsetPageFingerprint: null,
          rebuildError: subset.rebuildError ?? 'Proposed subset omitted the goal',
          nonScopeChangedFields: [],
          removedScopes: [],
          addedScopes: [],
          exactScopeNarrowing: false,
          oldPageDigest: null,
          proposedPageDigest: null,
        })
        continue
      }
      assert.equal(resolution.goal.goalFingerprint, proposedPage.goalFingerprint)
      assert.equal(fingerprintGoalDescriptionReviewPage(proposedPage), proposedPage.pageFingerprint,
        `${entry.goalId}: proposed review-subset page fingerprint is stale`)
      const proof = proveMathAtlasReviewSubsetNarrowing(oldPage, proposedPage)
      cases.push({
        goalId: entry.goalId,
        priorResolutionDigest: entry.resolutionDigest,
        oldSubsetPageFingerprint: oldPage.pageFingerprint,
        proposedSubsetPageFingerprint: proposedPage.pageFingerprint,
        rebuildError: null,
        nonScopeChangedFields: proof.nonScopeChangedFields,
        removedScopes: proof.removedScopes,
        addedScopes: proof.addedScopes,
        exactScopeNarrowing: proof.exactScopeNarrowing,
        oldPageDigest: proof.oldPageDigest,
        proposedPageDigest: proof.proposedPageDigest,
      })
    }
  }
  assert.equal(cases.length, 95)
  assert.equal(new Set(cases.map(({ goalId }) => goalId)).size, 95)
  const exactSubsetNarrowing = cases.filter((entry) => entry.exactScopeNarrowing)
  const proofReceipts = exactSubsetNarrowing.map(({ goalId, priorResolutionDigest,
    oldSubsetPageFingerprint, proposedSubsetPageFingerprint, oldPageDigest,
    proposedPageDigest, removedScopes }) => ({
    goalId,
    priorResolutionDigest,
    oldSubsetPageFingerprint,
    proposedSubsetPageFingerprint,
    oldPageDigest,
    proposedPageDigest,
    removedScopes,
  })).sort((left, right) => left.goalId.localeCompare(right.goalId))
  const proofDigest = sha256(Buffer.from(stableGoalBookJson(proofReceipts)))
  assert.equal(exactSubsetNarrowing.length, 80,
    'the current 80-case GK/LK compatibility subset changed; re-adjudicate before any transfer design')
  assert.equal(proofDigest,
    'sha256:27027c4ececdd74b4c0883fe19e900426aec0f11d64d8f7b318526944e012315',
    'the GK/LK compatibility receipt set changed; re-adjudicate before any transfer design')
  const changedFields = Object.fromEntries([...new Set(cases.flatMap((entry) => (
    entry.nonScopeChangedFields
  )))].sort().map((field) => [field, cases.filter((entry) => (
    entry.nonScopeChangedFields.includes(field)
  )).length]))
  console.log(JSON.stringify({
    totalRegisteredClaims: cases.length,
    exactSubsetNarrowingCandidates: exactSubsetNarrowing.length,
    exactSubsetProofDigest: proofDigest,
    ...(process.argv.includes('--receipts') ? { exactSubsetReceipts: proofReceipts } : {}),
    nonCompatibleCases: cases.filter((entry) => !entry.exactScopeNarrowing)
      .map(({ goalId, rebuildError, nonScopeChangedFields, addedScopes,
        removedScopes }) => ({ goalId, rebuildError, nonScopeChangedFields,
        addedScopes: addedScopes.length, removedScopes: removedScopes.length })),
    extraNonScopeFieldChanges: changedFields,
    subsetRebuildFailures: cases.filter((entry) => entry.rebuildError !== null)
      .map(({ goalId, rebuildError }) => ({ goalId, rebuildError })),
    scopeAdditions: cases.filter((entry) => entry.addedScopes.length > 0)
      .map(({ goalId }) => goalId),
    noScopeRemoval: cases.filter((entry) => entry.removedScopes.length === 0)
      .map(({ goalId }) => goalId),
    examplesBeyondApplicability: cases.filter((entry) => entry.nonScopeChangedFields.length > 0)
      .slice(0, 15).map(({ goalId, nonScopeChangedFields }) => ({ goalId, nonScopeChangedFields })),
    interpretation: 'Diagnostic only: even an exact subset field diff is not an accepted D rebind under the current closed validator.',
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
