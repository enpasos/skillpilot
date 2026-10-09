// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/';
const author=base+'biologie-source7-SN-ST-SekI-82ac-stage-route-author-successor-v1/';
const own=base+'biologie-source7-SN-ST-SekI-82ac-stage-route-independent-b-followup-v1/';
const prior=base+'biologie-source7-five-existing-method-owners-independent-b-v1/';
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const id='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1';
const goal=read(author+'inputs/full479-only16.canonical.exact.json').goals.find((g:any)=>g.id===id);
const authorP=read(author+'inputs/whole82ac-preserved-original-profile-plus-method-appendices.exact.json');
const ownP=readFileSync(prior+'P5-independent-b.bounded-material-candidate.review.jsonl','utf8').trim().split('\n').map(s=>JSON.parse(s)).find((r:any)=>r.goalId===id);
const cfg=read(prior+'P5-independent-b.bounded-material-candidate.config.json');
const resources:Record<string,string>={};
for(const link of goal.resourceLinks.filter((r:any)=>r.type==='goal-visualization')) resources[link.url]=sha(readFileSync('app/public'+link.url));
const criteria=sha(readFileSync(cfg.reviewCriteriaPath));
assert.deepEqual(authorP.profile,ownP.profile);
for(const record of [authorP,ownP]){
 assert.equal(record.goalFingerprint,fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'));
 assert.equal(record.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'));
 assert.equal(record.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(record.profile));
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[]);
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');
}
const report={schemaVersion:1,license:'CC-BY-4.0',role:'Targeted technical preservation of already genuinely reviewed unchanged whole82ac positive profile; no new scientific P authorship',goalId:id,criteriaFingerprint:criteria,actualResourceDigests:resources,goalFingerprint:ownP.goalFingerprint,reviewInputFingerprint:ownP.reviewInputFingerprint,profileFingerprint:ownP.profileFingerprint,wholeAuthorAndOwnPreviouslyReviewedProfilesEqual:true,actualNormalSemanticsErrors:[],status:ownP.status,reviewAuthority:ownP.reviewAuthority,evidenceLevel:ownP.evidenceLevel,maximumClaimScope:ownP.maximumClaimScope,newPReviewClaimed:false,humanApproval:false,activeWrites:0,strictGain:0};
writeFileSync(own+'82ac-unchanged-whole-positive-bindings.actual.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
