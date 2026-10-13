// Apache-2.0. Two finite inactive asset/QA candidates only; no CLI rollout or Git.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-child-actual-image-independent-v-20261013-v1'
const consumed = new Map<string, any>()
const bind = (path: string) => {
  const bytes = readFileSync(resolve(root, path))
  const result = { path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length }
  consumed.set(path, result)
  return result
}
const read = (path: string) => { bind(path); return JSON.parse(readFileSync(resolve(root, path), 'utf8')) }
const guarded = (binding: any) => { assert.deepEqual(bind(binding.path), binding); return read(binding.path) }
const first = read(`${own}/FIRST.neutral-actual-image-input-seal.json`)
const selector = guarded(first.neutralSelector)
for (const row of first.directNeutralBindings) assert.deepEqual(bind(row.expected.path), row.expected)
const modules = ['app/scripts/goalVisualizationQaModel.ts', 'app/src/utils/goalVisualizationQaStatus.ts', 'app/scripts/reportDeepUnderstandingRollout.ts']
modules.forEach(bind)
bind('app/scripts/generateGoalVisualizationQaLedgers.ts')
bind('AGENTS.md')
const [qaModel, qaStatus, deep] = await Promise.all(modules.map(path => import(pathToFileURL(resolve(root, path)).href)))
const goals = guarded(selector.exactWholeChildGoalsWithStockImportedLinks)
const linkCAS = guarded(selector.wholeResourceLinkCAS)
const oldCAS = guarded(linkCAS.sourceWholeGoalCASBinding)
assert.equal(linkCAS.wholeChildCompareAndSwap.length, 2)
for (const row of linkCAS.wholeChildCompareAndSwap) {
  assert.deepEqual(oldCAS.newChildren.find((goal: any) => goal.id === row.expectedBeforeWholeChild.id), row.expectedBeforeWholeChild)
  assert.deepEqual(goals.goals.find((goal: any) => goal.id === row.expectedBeforeWholeChild.id), row.proposedAfterWholeChild)
  const { resourceLinks, ...body } = row.proposedAfterWholeChild
  assert.deepEqual(body, row.expectedBeforeWholeChild)
  assert.equal(resourceLinks.length, 1)
}
const candidate = read(`${own}/candidate/two-exact-asset-ai-qa-records.inactive.json`)
assert.equal(candidate.schemaVersion, 1)
assert.equal(candidate.subject, 'chemie')
assert.equal(candidate.records.length, 2)
const expectedFields = ['goalId','title','description','subject','landscapeId','landscapePath','visualizationState','missingReason','imageUrl','publicAssetPath','canonicalAssetPath','assetSha256','umlautsCorrectChatGpt','contentApprovedChatGpt','humanApproved','humanIssueIdentified','humanIssueDescription','chatGptReviewedAt','chatGptReviewer','chatGptNotes','humanReviewedAt','humanReviewer','aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes'].sort()
const yesNo = ['umlautsCorrectChatGpt','contentApprovedChatGpt','humanApproved','humanIssueIdentified','aiApproved']
const nullableTime = ['chatGptReviewedAt','humanReviewedAt','aiReviewedAt']
const results = []
for (const row of candidate.records) {
  assert.deepEqual(Object.keys(row).sort(), expectedFields)
  for (const key of expectedFields) {
    if (yesNo.includes(key)) assert(['yes','no'].includes(row[key]))
    else if (nullableTime.includes(key)) assert(row[key] === null || (typeof row[key] === 'string' && !Number.isNaN(Date.parse(row[key]))))
    else assert.equal(typeof row[key], 'string')
  }
  const asset = selector.twoActualAssetsAndPrompts.find((entry: any) => entry.goalId === row.goalId)
  const actualAsset = bind(asset.asset.path)
  assert.deepEqual(actualAsset, asset.asset)
  assert.equal(row.assetSha256, actualAsset.sha256)
  assert.equal(row.aiApprovedAssetSha256, actualAsset.sha256)
  const goal = goals.goals.find((entry: any) => entry.id === row.goalId)
  assert.equal(row.imageUrl, goal.resourceLinks[0].url)
  assert.equal(row.title, goal.title)
  assert.equal(row.description, goal.description)
  const review = qaModel.normalizeGoalVisualizationAiReview(row, actualAsset.sha256)
  for (const key of ['aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes']) assert.equal(review[key], row[key])
  assert.equal(qaStatus.aiApprovalStatus(row), 'approved')
  assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview(row), true)
  assert.equal(qaStatus.aiApprovalStatus({ ...row, assetSha256: `sha256:${'0'.repeat(64)}` }), 'stale')
  assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview({ ...row, assetSha256: `sha256:${'0'.repeat(64)}` }), false)
  assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview({ ...row, humanIssueIdentified: 'yes' }), true)
  assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview({ ...row, aiApproved: 'no', humanApproved: 'yes' }), false)
  assert.equal(deep.hasCompletedDeepUnderstandingVisualizationReview({ ...row, visualizationState: 'missing', missingReason: 'deferred_quality_review' }), false)
  assert.equal(row.humanApproved, 'no')
  assert.equal(row.humanReviewedAt, null)
  assert.equal(row.humanReviewer, '')
  results.push({ goalId: row.goalId, asset: actualAsset, exactStockQaFieldShapeAndTypes: true, goalResourceLinkIdAndUrlExact: true, stockAiNormalizerExact: true, stockCurrentAssetAiApproval: 'approved', stockMachineVPredicateForThisInactiveExactAssetRow: true, mismatchedHashBecomesStaleAndFailsV: true, humanFindingDoesNotVetoMachineV: true, humanApprovalAloneCannotSatisfyMachineV: true, missingOrDeferredImageFailsV: true, humanApprovalNotWritten: true })
}
guarded(selector.exactUnchangedTwoRouteProfiles)
guarded(selector.exactUnchangedFourDEENCases)
assert.deepEqual(bind(selector.parentOverviewRetained.path), selector.parentOverviewRetained)
const result = { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), role: 'Two exact prospective QA row field/type and unmodified production API checks; actual scientific visual findings are separate', neutralBindingsExact: first.directNeutralBindings.length, modules: modules.map(bind), stockQaFieldDefinitionSource: bind('app/scripts/generateGoalVisualizationQaLedgers.ts'), perExactAsset: results, currentHumanFieldsNeitherSatisfyNorVetoMachineV: true, candidatePathsAreProspectiveIntegrationTargets: true, wholeChildBodiesUnchangedExceptAddedResourceLinks: true, wholeProfilesAndCasesExactContextOnly: true, genericApprovalsGranted: 0, fullRolloutChecksInvoked: 0, activeWrites: false, gitOperations: false, humanApproval: false, humanTrial: false, m7Granted: false }
writeFileSync(resolve(root, own, 'checks/exact-asset-schema-and-stock-api-guards.actual.json'), `${JSON.stringify(result, null, 2)}\n`)
writeFileSync(resolve(root, own, 'checks/consumed-input-bindings.actual.json'), `${JSON.stringify({ inputBindings: [...consumed.values()] }, null, 2)}\n`)
console.log(JSON.stringify({ neutralBindingsExact: first.directNeutralBindings.length, exactAssetRows: results.length, stockFieldShapesValid: 2, aiAssetApprovalPredicates: 2, perInactiveRowMachineVPredicates: 2, humanFieldsNeitherSatisfyNorVetoV: true, wrongHashFailsV: true, genericApprovals: 0, activeWrites: false }))
