import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson, type GoalBookModel, type GoalBookPage } from './goalBookModel'
import { buildGoalDescriptionCanonicalContext, type GoalDescriptionReviewInput } from './validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewPage } from './validateGoalDescriptionDualRoundResolution'

const root = fileURLToPath(new URL('../..', import.meta.url))
const preparation = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-15-current-review-20260927-v1'
)
const json = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T
const sha256 = (value: Uint8Array): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const scopeKeys = (page: GoalBookPage): string[] => (page.applicability ?? [])
  .flatMap(({ jurisdiction, scopes }) => scopes.map((scope) => (
    [jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('|')
  ))).sort()

const config = await json<{ goalIds: string[] }>(resolve(root, `${preparation}.config.json`))
assert.equal(config.goalIds.length, 15)
const newBook = await json<GoalBookModel>(resolve(root, preparation, 'bundle/book-model.json'))
const newInput = await json<GoalDescriptionReviewInput>(resolve(root, preparation,
  'round-a/description-review-input.json'))
assert.deepEqual(newBook.pages.map(({ goalId }) => goalId), config.goalIds)
assert.deepEqual(newInput.goals.map(({ goalId }) => goalId), config.goalIds)
assert.equal(newInput.bookDigest, newBook.digest)
const canonical = await json<{ goals: Array<Record<string, unknown>> }>(resolve(root,
  newBook.source.landscapePath))
const canonicalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const imageQa = await json<{ records: Array<{
  goalId: string
  imageUrl: string
  assetSha256: string
  canonicalAssetPath: string
  publicAssetPath: string
  aiApproved: string
  aiApprovedAssetSha256: string
  contentApprovedChatGpt: string
}> }>(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'))
const imageQaById = new Map(imageQa.records.map((record) => [record.goalId, record]))
const registry = await json<{ subjects: Array<{
  subject: string; resolutionIndexPaths: string[]
}> }>(resolve(root,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
const math = registry.subjects.find(({ subject }) => subject === 'mathematik')
assert.ok(math)
const targets = new Set(config.goalIds)
const owners = new Map<string, {
  oldPage: GoalBookPage
  oldInput: GoalDescriptionReviewInput['goals'][number]
  originalResolutionDigest: string
}>()
for (const relativeIndexPath of math.resolutionIndexPaths) {
  const indexPath = resolve(root, relativeIndexPath)
  const index = await json<{
    groups: Array<{ groupId: string; artifactDirectory?: string }>
    resolutions: Array<{ goalId: string; groupId: string; resolutionPath: string;
      resolutionDigest: string; strictDescriptionComplete: boolean }>
  }>(indexPath)
  for (const entry of index.resolutions) {
    if (!targets.has(entry.goalId)) continue
    assert.ok(!owners.has(entry.goalId), `duplicate original D owner for ${entry.goalId}`)
    assert.equal(entry.strictDescriptionComplete, true)
    const group = index.groups.find((candidate) => candidate.groupId === entry.groupId)
    assert.ok(group)
    const groupDirectory = resolve(dirname(indexPath), group.artifactDirectory ?? group.groupId)
    const oldBook = await json<GoalBookModel>(resolve(groupDirectory, 'bundle/book-model.json'))
    const oldReviewInput = await json<GoalDescriptionReviewInput>(resolve(groupDirectory,
      'round-a/description-review-input.json'))
    const oldPage = oldBook.pages.find((page) => page.goalId === entry.goalId)
    const oldInput = oldReviewInput.goals.find((goal) => goal.goalId === entry.goalId)
    assert.ok(oldPage && oldInput)
    assert.equal(fingerprintGoalDescriptionReviewPage(oldPage), oldPage.pageFingerprint)
    assert.equal(stableGoalBookJson(oldInput.reviewContext.page), stableGoalBookJson(oldPage))
    const resolutionBytes = await readFile(resolve(dirname(indexPath), entry.resolutionPath))
    assert.equal(sha256(resolutionBytes), entry.resolutionDigest)
    owners.set(entry.goalId, { oldPage, oldInput,
      originalResolutionDigest: entry.resolutionDigest })
  }
}
assert.equal(owners.size, 15)
const cases = await Promise.all(config.goalIds.map(async (goalId) => {
  const prior = owners.get(goalId)!
  const page = newBook.pages.find((item) => item.goalId === goalId)!
  const input = newInput.goals.find((item) => item.goalId === goalId)!
  const goal = canonicalById.get(goalId)
  assert.ok(goal)
  assert.equal(fingerprintGoalDescriptionReviewPage(page), page.pageFingerprint)
  assert.equal(stableGoalBookJson(input.reviewContext.page), stableGoalBookJson(page))
  assert.equal(stableGoalBookJson(input.canonicalContext),
    stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal)))
  const oldKeys = scopeKeys(prior.oldPage)
  const newKeys = scopeKeys(page)
  const oldSet = new Set(oldKeys)
  const newSet = new Set(newKeys)
  const textFields = (['currentTitleDe', 'currentTitleEn',
    'currentDescriptionDe', 'currentDescriptionEn'] as const).filter((field) => (
    input[field] !== prior.oldInput[field]
  ))
  const imageChanged = stableGoalBookJson(page.visualization)
    !== stableGoalBookJson(prior.oldPage.visualization)
  if (imageChanged) {
    const qa = imageQaById.get(goalId)
    assert.ok(qa && page.visualization)
    assert.equal(page.visualization.url, qa.imageUrl)
    assert.equal(page.visualization.originalDigest, qa.assetSha256)
    assert.equal(qa.aiApproved, 'yes')
    assert.equal(qa.contentApprovedChatGpt, 'yes')
    assert.equal(qa.aiApprovedAssetSha256, qa.assetSha256)
    assert.equal(sha256(await readFile(resolve(root, qa.canonicalAssetPath))), qa.assetSha256)
    assert.equal(sha256(await readFile(resolve(root, qa.publicAssetPath))), qa.assetSha256)
  }
  const sourceChanged = input.canonicalContext?.sourceRef
    !== prior.oldInput.canonicalContext?.sourceRef
  const navigationFields = (['pageNumber', 'navigationOrder', 'treeOrder',
    'breadcrumbs', 'chapterIds', 'externalPrerequisites'] as const).filter((field) => (
    stableGoalBookJson(page[field]) !== stableGoalBookJson(prior.oldPage[field])
  ))
  return {
    goalId, title: page.title,
    originalResolutionDigest: prior.originalResolutionDigest,
    oldPageFingerprint: prior.oldPage.pageFingerprint,
    currentPageFingerprint: page.pageFingerprint,
    goalFingerprintChanged: page.goalFingerprint !== prior.oldPage.goalFingerprint,
    textFieldsChanged: textFields,
    sourceRefChanged: sourceChanged,
    ...(sourceChanged ? { oldSourceRef: prior.oldInput.canonicalContext?.sourceRef,
      currentSourceRef: input.canonicalContext?.sourceRef } : {}),
    imageChanged,
    ...(imageChanged ? { oldImage: prior.oldPage.visualization,
      currentImage: page.visualization } : {}),
    navigationFieldsChanged: navigationFields,
    removedScopes: oldKeys.filter((key) => !newSet.has(key)),
    addedScopes: newKeys.filter((key) => !oldSet.has(key)),
  }
}))
assert.equal(cases.filter((entry) => entry.imageChanged).length, 6)
assert.equal(cases.filter((entry) => entry.sourceRefChanged).length, 0)
assert.equal(cases.filter((entry) => entry.textFieldsChanged.length > 0).length, 0)
assert.equal(cases.filter((entry) => entry.goalFingerprintChanged).length, 0)
console.log(JSON.stringify({
  preparedBookDigest: newBook.digest,
  preparedReviewInputFingerprint: newInput.reviewInputFingerprint,
  originalDClaimsCompared: cases.length,
  changedImageCount: cases.filter((entry) => entry.imageChanged).length,
  changedSourceCount: cases.filter((entry) => entry.sourceRefChanged).length,
  changedTextCount: cases.filter((entry) => entry.textFieldsChanged.length).length,
  cases,
}, null, 2))
