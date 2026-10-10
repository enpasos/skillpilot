// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson,parseSubjectDurationModelPolicy} from './goalBookModel.ts'
import {expandGoalBookSourceAtlasReceipt} from './goalBookSourceAtlasInputs.ts'
const root=resolve('.'),p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1',b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
const read=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const put=(f:string,v:any)=>{assert.ok(f.startsWith(p+'/'));const abs=resolve(root,f);mkdirSync(dirname(abs),{recursive:true});writeFileSync(abs,JSON.stringify(v,null,2)+'\n')}
const observed=read(p+'/checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json')
const config=read(p+'/source-atlas/whole398-source24.normal-probe.inputs.json')
// Separately exercise the existing duration parser; this does not override the failed whole-count assertion.
const policy=parseSubjectDurationModelPolicy(read(p+'/inputs/current-normal-duration-policy.exact.json'),config.subject,config.expectedJurisdictions,observed.actualWholeScopes)
put(p+'/checks/normal-duration-policy-targeted-actual.json',{schemaVersion:1,normalAPI:'parseSubjectDurationModelPolicy',actualIssueCount:0,subject:config.subject,jurisdictions:[...policy.entries()].map(([jurisdiction,decision])=>({jurisdiction,decision})),scopeCount:observed.actualWholeScopes.length,wholeSourceCompilerStillFailedCount:true,newSourceCourseProfileInferred:false,strictGain:0,humanApproval:false})
const expanded=expandGoalBookSourceAtlasReceipt(read(b+'/source/current-active381-362-source-projection.receipt.exact.json'))
put(p+'/source-atlas/original-active381-362-projection.normal-expanded.exact.json',expanded)
const fresh=await loadGoalBookBuildInputs(p+'/native/whole398-normal-source24-goal-body-comparison.config.json',root)
const prior=read(b+'/native/after-whole-normal-book-model.actual.json')
assert.equal(fresh.model.pages.length,398)
assert.equal(stableGoalBookJson(fresh.model.pages),stableGoalBookJson(prior.pages),'Actual Native whole-page context changed; targeted review required')
put(p+'/native/whole398-fresh-normal-review-model.actual.json',fresh.model)
put(p+'/checks/normal-current-source24-native-page-dependency-comparison.actual.json',{schemaVersion:1,normalAPI:'loadGoalBookBuildInputs',wholePageCount:fresh.model.pages.length,all398ExistingNativePageBodiesAndFingerprintsExact:true,wholeModelDigestExact:fresh.model.digest===prior.digest,beforeModelDigest:prior.digest,afterModelDigest:fresh.model.digest,modelSourceMetadataExact:stableGoalBookJson(fresh.model.source)===stableGoalBookJson(prior.source),source24MappingConsumedByThisCanonicalReviewModel:false,boundedReason:'Canonical full review config consumes goals, kind decisions, composition, current P and raster QA. It does not consume a source Atlas receipt or the two candidate mapping successors. This proves reused review page bodies only, not national publication or whole source coverage.',wholeSourceAtlasGateStillFailed:true,strictGain:0,sourceCourseOrDescriptionApproval:false,humanApproval:false})
console.log(JSON.stringify({actualNormalDurationParserIssues:0,actualNormalWholeReviewPages:398,all398CurrentPageBodiesAndFingerprintsExact:true,wholeModelDigestExact:fresh.model.digest===prior.digest,sourceAtlasCountStillFailed:true,strictGain:0}))
