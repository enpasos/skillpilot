// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const [repo, host, packet] = process.argv.slice(2)
const load = (p: string) => JSON.parse(readFileSync(resolve(packet, p), 'utf8'))
const digest = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const model = await import(pathToFileURL(resolve(host, 'app/scripts/goalVisualizationQaModel.ts')).href)
const central = await import(pathToFileURL(resolve(host, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const goalBook = await import(pathToFileURL(resolve(host, 'app/scripts/goalBookModel.ts')).href)
const binding = load('BINDING.exact-final-two-DEEN-ALT-PNG.normal-V.actual.json')
const firstSeal = load('FIRST.actual-two-final-V-decisions.seal.json')
assert.equal(firstSeal.normalVBindingsAtSeal, 0)
assert.ok(Date.parse(firstSeal.sealedAtUTC) < Date.parse(binding.boundAtUTC))
for (const row of firstSeal.files) assert.equal(digest(resolve(repo, row.path)), row.sha256)
const normal = load('qa/V2.final-context.normal-alias.qa.json')
const physical = load('qa/V2.final-context.physical-transport.qa.json')
assert.equal(normal.records.length, 2); assert.equal(physical.records.length, 2)
const transport = load('TRANSPORT.normal-aliases-to-exact-physical-files.json')
const aliases = new Map(transport.normalAliases.map((x: any) => [x.normalAlias, x.physical]))
const canonical = JSON.parse(readFileSync(resolve(repo, binding.finalCanonical.path), 'utf8'))
const semantic = JSON.parse(readFileSync(resolve(repo, binding.finalSemanticSourceOnly.path), 'utf8'))
assert.equal(digest(resolve(repo, binding.finalCanonical.path)), binding.finalCanonical.sha256)
assert.equal(digest(resolve(repo, binding.finalSemanticSourceOnly.path)), binding.finalSemanticSourceOnly.sha256)
for (const row of normal.records) {
  const physicalRow = physical.records.find((r: any) => r.goalId === row.goalId)
  const first = load(`FIRST.${row.goalId.slice(0, 8)}.actual-final-V.original.json`)
  assert.equal(first.decision, 'accepted'); assert.equal(first.newNormalVBindingsAtFIRST, 0)
  const goal = canonical.goals.find((g: any) => g.id === row.goalId)
  assert.deepEqual(first.wholeFinalGoal, goal)
  assert.equal(row.title, goal.title); assert.equal(row.description, goal.description)
  assert.equal(row.imageUrl, goal.resourceLinks[0].url)
  for (const key of ['landscapePath', 'canonicalAssetPath', 'publicAssetPath']) {
    const target: any = aliases.get(row[key]); assert.ok(target)
    assert.equal(physicalRow[key], target.path)
    assert.equal(digest(resolve(repo, target.path)), target.sha256)
    if (key !== 'landscapePath') assert.equal(target.sha256, row.assetSha256)
    assert.equal(digest(resolve(host, row[key])), target.sha256)
  }
  for (const key of Object.keys(row).filter(k => !['landscapePath', 'canonicalAssetPath', 'publicAssetPath'].includes(k))) assert.deepEqual(physicalRow[key], row[key])
  for (const record of [row, physicalRow]) {
    assert.equal(model.isGoalVisualizationAiApproved(record), true)
    assert.equal(model.normalizeGoalVisualizationAiReview(record, record.assetSha256).aiApproved, 'yes')
    assert.equal(central.hasCompletedDeepUnderstandingVisualizationReview(record), true)
    assert.equal(record.humanApproved, 'no'); assert.equal(record.humanReviewedAt, null)
  }
  const sem = semantic.decisions.find((r: any) => r.goalId === row.goalId)
  assert.equal(sem.sourceFingerprint, goalBook.fingerprintSemanticKindSourceGoal(goal))
}
console.log(JSON.stringify({schemaVersion:1, checkedAtUTC:new Date().toISOString(), role:'Bounded unchanged stock V model and completion predicate, no central execution', normalRecords:2, uniqueScientificVotes:2, physicalAliasIsSameVote:true, exactFinalWholeDEENALTContext:true, exactSourceAndPublicPNGBytes:true, semanticSourceFingerprintsMatchStock:true, FIRSTBeforeBinding:true, errors:[], centralExecuted:false, wholeSubjectFreshnessCLIExecuted:false, newOtherGateVotes:0, humanApproval:false, humanTrial:false, activeWrites:0, strictClosures:0, machineM7Granted:false},null,2))
