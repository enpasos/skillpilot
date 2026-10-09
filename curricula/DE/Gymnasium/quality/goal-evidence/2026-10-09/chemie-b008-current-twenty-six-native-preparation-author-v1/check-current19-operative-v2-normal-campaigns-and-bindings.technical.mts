// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateGoalDescriptionReviewCampaign } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'nineteen-operative-native-preparation-v2')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const bind = (path: string) => { const bytes = readFileSync(path); return { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const entryPath = resolve(out, 'neutral-current-nineteen-actual-operative-native-independent-review.entry.json'), entry = read(entryPath)
const bundlePath = resolve(root, entry.nativeBundle.path), bundle = read(bundlePath), bundleDirectory = dirname(bundlePath)
const artifacts = bundle.artifacts.map((artifact: any) => {
  const binding = bind(resolve(bundleDirectory, artifact.path))
  assert.equal(binding.sha256, artifact.sha256 ?? artifact.digest)
  if (artifact.bytes !== undefined) assert.equal(binding.bytes, artifact.bytes)
  return binding
})
const campaignChecks = []
for (const description of entry.campaigns) {
  const campaign = read(resolve(root, description.campaignPath)), input = read(resolve(root, description.inputPath))
  const result = await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  assert.deepEqual(result.errors, []); assert.equal(campaign.blindToOtherReviews, true)
  assert.deepEqual(campaign.batches.flatMap((batch: any) => batch.goalIds), entry.goalIds)
  campaignChecks.push({ side: description.side, campaign: bind(resolve(root, description.campaignPath)), input: bind(resolve(root, description.inputPath)), normalErrors: [], actualIndependentResults: 0 })
}
const intake = read(resolve(root, entry.currentPAndOperativeThirtyEightCaseIntake.path)), materials = read(resolve(root, intake.wholeOperativeCasesAndProfileBodies.path))
const records = readFileSync(resolve(root, entry.currentPRecords.path), 'utf8').trim().split('\n').map(line => JSON.parse(line))
assert.equal(records.length, 19); assert.equal(materials.entries.length, 19)
assert.equal(materials.entries.reduce((n: number, e: any) => n + e.wholeOperativeCases.length, 0), 38)
for (const row of records) {
  const material = materials.entries.find((e: any) => e.goalId === row.goalId)
  assert.equal(stableGoalBookJson(row.profile), stableGoalBookJson(material.wholePairedNormalV2Profile))
  assert.equal(row.reviewAuthority, 'ai_candidate'); assert.equal(row.status, 'needs_human_review'); assert.deepEqual(row.reviewRunIds, [])
}
assert.equal(materials.exactFourOrdinaryCaseDeltas.length, 4)
const model = read(resolve(bundleDirectory, bundle.artifacts.find((artifact: any) => artifact.role === 'book_model').path))
assert.deepEqual(model.pages, read(resolve(own, 'native-nineteen/book-model.json')).pages);
assert.equal(model.pages.length, 19); assert.ok(model.pages.every((page: any) => page.visualization))
const request = read(resolve(root, entry.requiredNativeOriginalIndexRequest.path))
assert.equal(request.files.length, 4)
for (const binding of request.files) assert.deepEqual(bind(resolve(root, binding.path)), binding)
const outputPath = resolve(out, 'ordinary-current-nineteen-native-campaign-and-material-bindings.actual.json')
assert.ok(!existsSync(outputPath))
writeFileSync(outputPath, JSON.stringify({ schemaVersion: 1, role: 'Ordinary technical campaigns, exact artifact bindings and whole operative P19/thirty-eight-case data; no scientific/native verdict', actualNativeEntry: bind(entryPath), artifacts, campaignChecks, actualCurrentNormalProfiles: 19, actualWholeOperativeCases: 38, actualMaterializedCaseRemedies: 4, genuineIndependentCurrentNativeResults: 0, normalCampaignErrors: [], noSourceCourseOrNativeApproval: true, humanApproval: false, activeWrites: [], actualExitCode: 0, strictGain: 0 }, null, 2) + '\n')
console.log(JSON.stringify({ actualNormalCampaigns: 2, artifactBindings: artifacts.length, ordinaryErrors: [], actualCurrentP19Profiles: 19, wholeOperativeCases: 38, currentNativeApprovals: 0, strictGain: 0 }))
