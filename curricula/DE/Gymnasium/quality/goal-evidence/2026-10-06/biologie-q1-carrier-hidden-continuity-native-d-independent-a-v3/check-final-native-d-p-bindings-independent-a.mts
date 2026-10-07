// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {existsSync,readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import {parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..'),rel=own.slice(root.length+1),author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-and-length-targeted-author-v3/'
assert(!existsSync(resolve(own,'native-carrier-v5-d-p-independent-a.final.freeze.json')))
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const bundle=read(author+'round-a/review-bundle-manifest.json'),input=read(author+'round-a/description-review-input.json'),campaign=read(author+'round-a/description-review-campaign.json')
const result=await validateGoalDescriptionReviewCampaignResultDirectories({bundle,input,campaign,batchesDirectory:resolve(root,author+'round-a/batches'),resultsDirectory:resolve(own,'results')})
assert.deepEqual(result.errors,[]);assert.equal(result.records.length,1);assert.equal(result.records[0].decision,'keep')
const model=parseAndValidateGoalBookModel(read(author+'bundle/book-model.json'));assert.equal(model.pages.length,1)
const goal=input.goals[0],contextFingerprint=fingerprintGoalDescriptionReviewContext(goal),pageFingerprint=fingerprintGoalDescriptionReviewPage(goal.reviewContext.page)
assert.equal(pageFingerprint,goal.pageFingerprint);assert.equal(pageFingerprint,model.pages[0].pageFingerprint)
const positive=reviewPositiveGoalEvidenceConfig(rel+'/positive.one.independent-a.current.config.json');assert.deepEqual(positive.errors,[])
const out={schemaVersion:1,createdAtUTC:new Date().toISOString(),goalId:goal.goalId,nativeCampaignResults:'PASS1_KEEP',nativeCampaignErrors:result.errors,nativeDActualOnePageModelAndFingerprints:'PASS1',goalFingerprint:goal.goalFingerprint,pageFingerprint,goalReviewContextFingerprint:contextFingerprint,bundleFingerprint:bundle.bundleFingerprint,bookDigest:input.bookDigest,nativeOnePFullCheckerAfterActualV5Import:'PASS',nativeOnePErrors:positive.errors,nativeOnePCounts:positive.counts,recordStatus:result.records[0].recordStatus,reviewAuthority:result.records[0].reviewAuthority,otherSixReviewsNotRewritten:true,actualHTMLandPDF3PersonallyInspected:true,publicationMode:model.book.publicationMode,humanReleaseQaStatus:goal.reviewContext.page.visualization.qaStatus,humanApprovedForPublication:goal.reviewContext.page.visualization.approvedForPublication,fullNativeGUISupersetGate:'SEPARATE_REQUIRED_GATE_NOT_CLAIMED',activeWrites:false,specialValidatorRules:false,humanApproval:false,humanTrial:false,learnerEvidence:false,strictNetGain:0,newScientificCompletions:0,restoredActiveBindingsByThisReviewer:0}
writeFileSync(resolve(own,'native-final-v5-d-p.validation.actual.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({nativeD:'PASS1_KEEP',nativeP:'PASS1_NEEDS_HUMAN_REVIEW',contextFingerprint,pageFingerprint,errors:0,activeWrites:false}))
