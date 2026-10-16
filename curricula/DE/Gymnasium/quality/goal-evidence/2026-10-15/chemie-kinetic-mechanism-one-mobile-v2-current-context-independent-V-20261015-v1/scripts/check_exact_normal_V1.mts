// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const [repo, packet] = process.argv.slice(2)
const load = (name: string) => JSON.parse(readFileSync(resolve(packet, name), 'utf8'))
const digest = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const model = await import(pathToFileURL(resolve(repo, 'app/scripts/goalVisualizationQaModel.ts')).href)
const central = await import(pathToFileURL(resolve(repo, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const goalBook = await import(pathToFileURL(resolve(repo, 'app/scripts/goalBookModel.ts')).href)

const binding = load('BINDING.exact-final-DEEN-ALT-PNG.one-normal-V.actual.json')
const first = load('FIRST.mobile-v2.final-context.informed-resumption.original.json')
const firstSeal = load('FIRST.mobile-v2.final-context.informed-resumption.seal.json')
assert.equal(digest(resolve(repo, binding.FIRST.path)), binding.FIRST.sha256)
assert.equal(digest(resolve(repo, binding.FIRSTSeal.path)), binding.FIRSTSeal.sha256)
assert.equal(first.decision, 'accepted')
assert.equal(first.newNormalVBindingsAtFIRST, 0)
assert.equal(firstSeal.normalVBindingsAtSeal, 0)
assert.ok(Date.parse(firstSeal.sealedAtUTC) < Date.parse(binding.boundAtUTC))
const normal = load('qa/V1.final-context.normal-alias.qa.json')
const physical = load('qa/V1.final-context.physical-transport.qa.json')
assert.equal(normal.records.length, 1)
assert.equal(physical.records.length, 1)
const row = normal.records[0], physicalRow = physical.records[0]
const transport = load('TRANSPORT.normal-aliases-to-committable-physical-files.json')
const aliases = new Map(transport.normalAliases.map((x: any) => [x.normalAlias, x.physical]))
const physicalOf = (alias: string): any => {
  const target = aliases.get(alias)
  assert.ok(target, alias)
  return target
}
const canonicalBinding = physicalOf(row.landscapePath)
assert.equal(canonicalBinding.sha256, binding.finalCanonical.sha256)
assert.equal(digest(resolve(repo, canonicalBinding.path)), canonicalBinding.sha256)
const canonical = JSON.parse(readFileSync(resolve(repo, canonicalBinding.path), 'utf8'))
const goal = canonical.goals.find((g: any) => g.id === row.goalId)
assert.deepEqual(goal, binding.wholeFinalGoal)
assert.equal(row.title, goal.title)
assert.equal(row.description, goal.description)
assert.equal(row.subject, 'chemie')
assert.equal(row.landscapeId, canonical.landscapeId)
const links = goal.resourceLinks.filter((x: any) => x.type === 'goal-visualization' && x.role === 'primary')
assert.equal(links.length, 1)
assert.equal(row.imageUrl, links[0].url)
assert.equal(binding.fullFinalALT, links[0].altText)
assert.equal(row.publicAssetPath, `app/public${row.imageUrl}`)
assert.match(row.assetSha256, /^sha256:[0-9a-f]{64}$/u)
for (const key of ['canonicalAssetPath', 'publicAssetPath']) {
  const target = physicalOf(row[key])
  assert.equal(target.sha256, row.assetSha256)
  assert.equal(digest(resolve(repo, target.path)), row.assetSha256)
  assert.equal(physicalRow[key], target.path)
}
assert.equal(physicalRow.landscapePath, canonicalBinding.path)
for (const key of Object.keys(row).filter(k => !['landscapePath', 'canonicalAssetPath', 'publicAssetPath'].includes(k))) {
  assert.deepEqual(physicalRow[key], row[key], key)
}
for (const record of [row, physicalRow]) {
  assert.equal(model.isGoalVisualizationAiApproved(record), true)
  assert.equal(model.normalizeGoalVisualizationAiReview(record, record.assetSha256).aiApproved, 'yes')
  assert.equal(central.hasCompletedDeepUnderstandingVisualizationReview(record), true)
  assert.equal(record.humanApproved, 'no')
  assert.equal(record.humanReviewedAt, null)
  assert.equal(record.humanReviewer, '')
}
const semantic = JSON.parse(readFileSync(resolve(repo, binding.finalSemanticSourceOnly.path), 'utf8'))
assert.equal(digest(resolve(repo, binding.finalSemanticSourceOnly.path)), binding.finalSemanticSourceOnly.sha256)
const semanticRow = semantic.decisions.find((x: any) => x.goalId === row.goalId)
assert.equal(semanticRow.sourceFingerprint, goalBook.fingerprintSemanticKindSourceGoal(goal))
const stockModules = ['app/scripts/goalVisualizationQaModel.ts', 'app/src/utils/goalVisualizationQaStatus.ts',
  'app/scripts/reportDeepUnderstandingRollout.ts', 'app/scripts/goalBookModel.ts']
  .map(path => ({ path, sha256: digest(resolve(repo, path)) }))
console.log(JSON.stringify({ schemaVersion: 1, role: 'Bounded normal V1 exact-context validation using unchanged production model and completion predicate',
  checkedAtUTC: new Date().toISOString(), goalId: row.goalId, normalRecords: 1, uniqueScientificVotes: 1,
  physicalAliasIsSameVote: true, normalStockCurrentAssetApproval: true, normalStockVCompletionPredicate: true,
  exactFinalWholeDEENALTContext: true, exactSourceAndPublicPNGBytes: true, semanticSourceFingerprintMatchesStock: true,
  FIRSTBeforeBinding: true, stockModules, errors: [], centralExecuted: false, wholeSubjectFreshnessCLIExecuted: false,
  fullBuildExecuted: false, newDescriptionPositiveAtomicityMemoryVotes: 0, humanApproval: false, humanTrial: false,
  activeWrites: 0, strictClosures: 0, machineM7Granted: false }, null, 2))
