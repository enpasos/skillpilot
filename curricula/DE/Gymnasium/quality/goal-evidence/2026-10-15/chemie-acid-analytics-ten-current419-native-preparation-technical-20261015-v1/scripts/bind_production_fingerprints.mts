// SPDX-License-Identifier: Apache-2.0
// Technical fingerprints only. This does not construct a review record or run.
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const repo = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-analytics-remaining-ten-whole-material-and-profile-author-20261014-v1'
const read = async (path: string) => JSON.parse(await readFile(resolve(repo,path),'utf8'))
const api = await import(pathToFileURL(resolve(repo,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const raw = await read(author+'/author-profiles.ten.raw.json')
const contexts = await read(own+'/inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json')
const model = await read(own+'/native-ten-current/bundle/book-model.json')
const campaignInput = await read(own+'/native-ten-current/round-a/description-review-input.json')
const map = await read(own+'/checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json')
const criteriaBytes = await readFile(resolve(repo,author+'/inputs/positive-profile-criteria.exact.md'))
const criteriaFingerprint = 'sha256:'+createHash('sha256').update(criteriaBytes).digest('hex')
const rows = []
for (const row of raw.profiles) {
  const context = contexts.rows.find((r: any)=>r.goalId===row.goalId)
  const page = model.pages.find((p: any)=>p.goalId===row.goalId)
  const input = campaignInput.goals.find((g: any)=>g.goalId===row.goalId)
  const asset = map.selectedCurrentAssetRows.find((a: any)=>a.goalId===row.goalId)
  const goal = context.wholeCurrentGoal
  const resources = Object.fromEntries(goal.resourceLinks.filter((l: any)=>l.type==='goal-visualization').map((l: any)=>[l.url, asset.physicalRepositorySource.sha256]))
  if (input.goalFingerprint!==page.goalFingerprint || input.pageFingerprint!==page.pageFingerprint) throw new Error('D page/input fingerprint mismatch')
  rows.push({goalId:row.goalId, productionDGoalFingerprint:page.goalFingerprint, productionDPageFingerprint:page.pageFingerprint, productionPGoalFingerprint:api.fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'), productionPReviewInputFingerprint:api.fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resources,'curricularAtomic'), productionRawProfileFingerprint:api.fingerprintPositiveGoalEvidenceProfile(row.profile), resourceDigests:resources, fullCaseReferences:row.fullCaseReferences, sourceRawWholeObjectHashIsNotProductionGoalFingerprint:row.wholeGoalObjectSha256})
}
const report = {schemaVersion:1,role:'technical binding only; no review outcome',productionSources:['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts'],criteriaFingerprint,semanticKind:'curricularAtomic',goalCount:10,modelDigest:model.digest,reviewInputFingerprint:campaignInput.reviewInputFingerprint,rawProfilesRemainE0G0:true,selectableRecordsCreated:0,generationRunsCreated:0,scientificVotes:0,rows}
await writeFile(resolve(repo,own+'/checks/PRODUCTION.D-pages-P-inputs-and-raw-profile-fingerprints.actual.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({goalCount:rows.length,productionFingerprintsBound:true,selectableRecordsCreated:0,generationRunsCreated:0}))
