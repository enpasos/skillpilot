// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts';
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..');
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const ref=(p:string)=>{const b=readFileSync(resolve(root,p));return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const inputPath=relative(root,resolve(own,'whole32-native-pages-whole17-profile34-cases.science-only.input.json'));
const input=read(inputPath);const entry=read(input.neutralAuthorEntry.path??input.neutralAuthorEntry);
const before=read(entry.actualFullBeforeModelPath),after=read(entry.actualFullCandidateModelPath);
const by=(m:any)=>new Map(m.pages.map((p:any)=>[p.goalId,p]));const old=by(before),current=by(after);
const comparisons=input.whole32NativePagesAndWholeCanonicalGoals.map((r:any)=>{
 const id=r.wholeCurrentGoal.id;const a:any=old.get(id),b:any=current.get(id);if(!a||!b)throw Error(id);
 const fpA=fingerprintGoalDescriptionReviewPage(a),fpB=fingerprintGoalDescriptionReviewPage(b);
 if(fpA!==a.pageFingerprint||fpB!==b.pageFingerprint)throw Error('ordinary page fingerprint invalid '+id);
 const goal=(page:any)=>({...r.wholeReviewInputGoal,goalFingerprint:page.goalFingerprint,pageFingerprint:page.pageFingerprint,reviewContext:{page,evidenceProfile:r.wholeReviewInputGoal.reviewContext.evidenceProfile}});
 const ca=fingerprintGoalDescriptionReviewContext(goal(a)),cb=fingerprintGoalDescriptionReviewContext(goal(b));
 const changedKeys=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));
 return {goalId:id,selection:r.selection,oldPageFingerprint:fpA,currentPageFingerprint:fpB,oldGoalReviewContextFingerprint:ca,currentGoalReviewContextFingerprint:cb,ordinaryPageFingerprintValid:true,ordinaryGoalReviewContextFingerprintUnchanged:ca===cb,wholeNativePageUnchanged:JSON.stringify(a)===JSON.stringify(b),changedKeys,retainExistingValidDP:ca===cb,newDescriptionScienceReviewClaimed:false};
});
const protectedRows=comparisons.filter((r:any)=>r.selection==='protected-source-contexts');
if(protectedRows.length!==15||protectedRows.filter((r:any)=>r.retainExistingValidDP).length!==14||protectedRows.filter((r:any)=>!r.retainExistingValidDP)[0]?.goalId!=='2ae2da43-73d5-578f-84f4-be0585a7d8f9')throw Error('protected exact frame differs');
const allDiff=before.pages.filter((p:any)=>JSON.stringify(p)!==JSON.stringify(current.get(p.goalId))).map((p:any)=>p.goalId);
if(before.pages.length!==394||after.pages.length!==394||allDiff.length!==19)throw Error('full frame differs');
writeFileSync(resolve(own,'normal-full394-page-and-goal-context-fingerprints.actual.json'),JSON.stringify({schemaVersion:1,role:'bounded-independent-normal-fingerprint-comparison',input:ref(inputPath),before:ref(entry.actualFullBeforeModelPath),after:ref(entry.actualFullCandidateModelPath),ordinaryFunctions:['fingerprintGoalDescriptionReviewPage','fingerprintGoalDescriptionReviewContext'],whole394DeltaGoalIds:allDiff,comparisons,protectedRetainValidDPCount:14,protectedNewNativeBindingGoalIds:['2ae2da43-73d5-578f-84f4-be0585a7d8f9'],strictGain:0,humanApproval:false},null,2)+'\n');
console.log(JSON.stringify({full394Delta:allDiff.length,protectedRetainValidDP:14,protectedChanged:['2ae2da43-73d5-578f-84f4-be0585a7d8f9'],errors:0}));
