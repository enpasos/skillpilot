// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution';
import {fingerprintGoalForPositiveEvidence} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';
import {validateResolutionIndex} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout';
import {currentInputs,activeDOwners} from '../chemie-current450-final-native-input-prerequisites-technical-20261018-v1/native-input-common';

const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/';
const C=B+'chemie-current450-native-transport-selection-technical-20261018-v2/';
const O=B+'chemie-current450-native-transport-selection-informed-technical-second-check-20261018-v1/';
assert(!existsSync(O+'SEAL.informed-technical-second-check.json'),'Sealed check is immutable');
const CHEM='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(path:string)=>{const b=readFileSync(path);return{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const dump=(n:string,x:any)=>writeFileSync(O+n,JSON.stringify(x,null,2)+'\n');
const guards=new Map<string,any>();
const guard=(p:any)=>{assert.deepEqual(pin(p.path),p,'Frozen artifact differs '+p.path);guards.set(p.path,p)};
const seal=read(C+'SEAL.actual-transport-selection.json');for(const p of seal.files)guard(p);guards.set(C+'SEAL.actual-transport-selection.json',pin(C+'SEAL.actual-transport-selection.json'));
const proof=read(C+'MEASUREMENT.actual-bounded-metadata-and-reference-transport-retention.json');guard(proof.originalFullModelMeasurement);guard(proof.originalActualFullModel);
const measure=read(proof.originalFullModelMeasurement.path),book=read(proof.originalActualFullModel.path),plan=read(C+'FINAL-INPUTS.actual-current-bindings.staged.json');
guard(plan.earlierConservativeWholePAndRawURLSelection);
const oldPlan=read(plan.earlierConservativeWholePAndRawURLSelection.path),pinned=new Map<string,any>(oldPlan.additionalInputGuards.map((p:any)=>[p.path,p]));
for(const key of ['canonical','semanticKinds','normalRegistry','positiveAggregate'])guard(plan[key]);
for(const path of ['app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts',C+'transport-selection-writer.py'])guards.set(path,pin(path));
const inputs=currentInputs(),native=activeDOwners(inputs),byGoal=new Map<string,any>(inputs.landscape.goals.map((g:any)=>[g.id,g]));
const P=new Map<string,any>(readFileSync(plan.positiveAggregate.path,'utf8').trim().split(/\r?\n/).map(l=>{const r=JSON.parse(l);return[r.goalId,r]}));
const pages=new Map<string,any>(book.pages.map((p:any)=>[p.goalId,p]));assert.equal(P.size,450);assert.equal(pages.size,450);
const rows=new Map<string,any>(measure.perGoal.map((r:any)=>[r.goalId,r])),selected=new Set<string>(proof.perGoalExactTransportProof.map((r:any)=>r.goalId));assert.equal(selected.size,51);
const oldRequired=new Set<string>(measure.requiredReviewGoalIds),baseline=measure.perGoal.filter((r:any)=>!r.requiresActualFinalInputReview);assert.equal(oldRequired.size,330);assert.equal(baseline.length,120);
assert.deepEqual(proof.requiredGoalIds,measure.requiredReviewGoalIds.filter((id:string)=>!selected.has(id)));assert.equal(proof.requiredGoalIds.length,279);
assert.deepEqual(plan.goalIds,proof.requiredGoalIds);assert.deepEqual(plan.batches.flatMap((b:any)=>read(b.config.path).goalIds),proof.requiredGoalIds);assert.equal(plan.batches.length,14);
assert(baseline.every((r:any)=>!selected.has(r.goalId)&&!proof.requiredGoalIds.includes(r.goalId)));

const cache=new Map<string,any>();const get=(p:string)=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p)};
const changed=(a:any,b:any)=>[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>!isDeepStrictEqual(a?.[k],b?.[k]));
const drop=(r:any)=>Object.fromEntries(Object.entries(r).filter(([k])=>!['reviewedAt','reviewer','reviewRunIds'].includes(k)));
const core=['goalId','shortKey','title','description','applicability','visualization','evidenceReview','goalFingerprint'];
const envelope=['pageNumber','navigationOrder','treeOrder','anchor','breadcrumbs','chapterIds','pageFingerprint'];
const referenceKeys=['requires','reverseRequires','externalPrerequisites','externalReverseRequires'];
const identity=(p:any,keys:string[])=>keys.flatMap(k=>p[k].map((r:any)=>[r.goalId,r.title])).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
const refCounts:any={old:{local:0,exactURL:0,plain:0},current:{local:0,exactURL:0,plain:0}};
function refs(page:any,local:Map<string,any>,cut:'old'|'current'){
 const result:any[]=[];
 for(const key of referenceKeys)for(const r of page[key]){
  assert.equal(r.title,byGoal.get(r.goalId)?.title);assert.equal(r.landscapeId,undefined,'No unclassified cross-landscape transport');
  if(key==='requires'||key==='reverseRequires'){
   assert.deepEqual(Object.keys(r).sort(),['anchor','goalId','pageNumber','title']);assert(local.has(r.goalId));assert.equal(r.anchor,'goal-'+r.goalId);assert.equal(r.pageNumber,local.get(r.goalId).pageNumber);refCounts[cut].local++;
   result.push({direction:key,goalId:r.goalId,title:r.title,transport:'exact-local-anchor-and-page',pageNumber:r.pageNumber,anchor:r.anchor});
  }else{
   assert.deepEqual(Object.keys(r).sort(),['canonicalUrl','goalId','title']);assert(!local.has(r.goalId),'In-book target incorrectly external');
   const exact='https://skillpilot.com/lernzielbuch?landscape='+CHEM+'&edition=curricular-atomic-v1#goal-'+r.goalId;
   if(r.canonicalUrl!==null){assert.equal(r.canonicalUrl,exact,'Exact URI bytes, query keys, multiplicity and anchor required');refCounts[cut].exactURL++;result.push({direction:key,goalId:r.goalId,title:r.title,transport:'exact-historical-own-landscape-edition-URL',canonicalUrl:r.canonicalUrl});}
   else{assert(!pages.has(r.goalId),'No missing full450 in-book URL/anchor');refCounts[cut].plain++;result.push({direction:key,goalId:r.goalId,title:r.title,transport:'plain-existing-outside-full450-book'});}
  }
 }
 return result;
}
const perGoal:any[]=[];
for(const claimed of proof.perGoalExactTransportProof){
 const id=claimed.goalId,row=rows.get(id),owner=native.owners.get(id);assert(oldRequired.has(id));assert.equal(row.unchangedProductionNativeContractValid,true);
 assert.equal(owner.indexPath,row.activeIndex);assert.equal(claimed.originalIndex,row.activeIndex);
 const resolved=relative(process.cwd(),resolve(dirname(owner.indexPath),owner.entry.resolutionPath));assert.equal(resolved,row.resolutionPath);guard(claimed.originalResolution);guard(claimed.originalFirstInput);guard(claimed.originalSecondInput);guard(pinned.get(owner.indexPath));
 const first=get(claimed.originalFirstInput.path),old=first.goals.find((g:any)=>g.goalId===id),peer=get(claimed.originalSecondInput.path).goals.find((g:any)=>g.goalId===id);assert.deepEqual(old,peer);
 const current=byGoal.get(id),p=pages.get(id),oldPage=old.reviewContext.page,res=get(resolved);
 assert.deepEqual(old.canonicalContext,buildGoalDescriptionCanonicalContext(current));
 assert.deepEqual([old.currentTitleDe,old.currentTitleEn,old.currentDescriptionDe,old.currentDescriptionEn],[current.title,current.titleEn,current.description,current.descriptionEn]);
 assert.equal(old.goalFingerprint,p.goalFingerprint);assert.equal(p.goalFingerprint,fingerprintGoalForPositiveEvidence(current,'curricularAtomic'));assert.equal(res.goal.goalFingerprint,old.goalFingerprint);
 assert.equal(res.goal.pageFingerprint,old.pageFingerprint);assert.equal(old.pageFingerprint,fingerprintGoalDescriptionReviewPage(oldPage));assert.equal(res.goal.goalReviewContextFingerprint,fingerprintGoalDescriptionReviewContext(old));
 assert.equal(p.pageFingerprint,fingerprintGoalDescriptionReviewPage(p));assert.notEqual(p.pageFingerprint,res.goal.pageFingerprint,'No new full450 page binding is being retained');
 assert.deepEqual(core.map(k=>oldPage[k]),core.map(k=>p[k]));assert(Object.keys(p).every(k=>[...core,...envelope,...referenceKeys].includes(k)));assert(Object.keys(oldPage).every(k=>[...core,...envelope,...referenceKeys].includes(k)));
 const oldP=old.reviewContext.evidenceProfile,currentP=P.get(id);assert.deepEqual(drop(oldP),drop(currentP));const pFields=changed(oldP,currentP);assert(pFields.every(k=>['reviewedAt','reviewer','reviewRunIds'].includes(k)));assert.deepEqual([...pFields].sort(),[...claimed.differentPFields].sort());
 assert.deepEqual(identity(oldPage,['requires','externalPrerequisites']),identity(p,['requires','externalPrerequisites']));assert.deepEqual(identity(oldPage,['reverseRequires','externalReverseRequires']),identity(p,['reverseRequires','externalReverseRequires']));
 const oldLocal=new Map<string,any>(first.goals.map((g:any)=>[g.goalId,g.reviewContext.page]));const oldRefs=refs(oldPage,oldLocal,'old'),newRefs=refs(p,pages,'current');
 const originalValidationIndex=measure.nativeValidation.findIndex((v:any)=>v.indexPath===row.activeIndex),validation=measure.nativeValidation[originalValidationIndex];assert(validation.unchangedProductionValidator&&validation.readyGoalIds.includes(id));
 perGoal.push({goalId:id,title:current.title,originalIndex:row.activeIndex,originalResolution:claimed.originalResolution,originalFirstInput:claimed.originalFirstInput,originalSecondInput:claimed.originalSecondInput,canonicalContextAndWholeDEENExact:true,goalFingerprintExact:true,pageCoreFieldsExact:core,wholePExceptExactlyThreeAllowedProvenanceFieldsExact:true,actualChangedPFields:pFields,profileReasonStatusDissentScopeAuthorityAndFingerprintsExact:true,oldOwnerPageAndReviewContextFingerprintsUnchanged:true,newFull450PageFingerprintNotClaimed:true,strictPageChangedFields:changed(oldPage,p),oldReferenceChecks:oldRefs,currentReferenceChecks:newRefs,existingActualNativeReadyLocator:'/nativeValidation/'+originalValidationIndex+'/readyGoalIds',newReviewVote:false});
}
const baselineProof=baseline.map((row:any)=>{const owner=native.owners.get(row.goalId);assert.equal(owner.indexPath,row.activeIndex);const p=relative(process.cwd(),resolve(dirname(owner.indexPath),owner.entry.resolutionPath));assert.equal(p,row.resolutionPath);guard(pinned.get(p));guard(pinned.get(owner.indexPath));const v=measure.nativeValidation.find((x:any)=>x.indexPath===row.activeIndex);assert(v?.readyGoalIds.includes(row.goalId));return{goalId:row.goalId,originalIndex:row.activeIndex,originalResolutionPin:pinned.get(p),originalReadyUnchanged:true,removedFromNoFurtherReviewRoster:false}});

async function main(){
 const startedUTC=new Date().toISOString(),validation:any[]=[];
 const scope:any={landscape:{landscapeId:inputs.landscape.landscapeId},rawLandscape:inputs.landscape,goalById:byGoal,rawGoalById:byGoal,atomicGoalIds:inputs.ordinary,denominator:450,issues:[]};
 for(const indexPath of [...new Set(perGoal.map(r=>r.originalIndex))].sort()){
  const index=read(indexPath),superseded=new Set<string>(index.resolutions.filter((r:any)=>native.owners.get(r.goalId)?.indexPath!==indexPath).map((r:any)=>r.goalId));
  const withdrawn=new Map<string,string>(inputs.chem.resolutionWithdrawals.filter((w:any)=>w.indexPath===indexPath).map((w:any)=>[w.goalId,w.historicalResolutionDigest]));
  const r=await validateResolutionIndex(indexPath,inputs.chem,scope,superseded,withdrawn,native.retirement);
  const selectedHere=perGoal.filter(g=>g.originalIndex===indexPath).map(g=>g.goalId);assert(selectedHere.every(id=>r.ready.has(id)),'Current production native validator rejects retained owner');
  validation.push({indexPath,selectedGoalIds:selectedHere,selectedReadyGoalIds:selectedHere.filter(id=>r.ready.has(id)),allSelectedReady:true,allReadyGoalIds:[...r.ready].sort(),issues:r.issues,otherIndexIssuesDoNotCreateRetainedOwnerVotes:true});
 }
 assert.equal(validation.length,16);assert.equal(validation.flatMap(v=>v.selectedReadyGoalIds).length,51);
 const invalid='3ec31fe1-e01b-5edd-bd9a-936191d67639';assert(!selected.has(invalid)&&proof.requiredGoalIds.includes(invalid));
 for(const p of guards.values())assert.deepEqual(pin(p.path),p,'Input drift during informed technical check');
 dump('CHECK.actual51-whole-context-P-reference-and-original-owner-contract.json',{role:'INFORMED_TECHNICAL_SECOND_CHECK_NOT_SCIENTIFIC_OR_NATIVE_REVIEW',startedUTC,finishedUTC:new Date().toISOString(),status:'PASS_BOUNDED_51_ORIGINAL_OWNER_RETENTION',candidateSeal:pin(C+'SEAL.actual-transport-selection.json'),sourcePins:[...guards.values()],perGoal,referenceCounts:refCounts,unchangedBaseline120:baselineProof,roster:{original450:450,originalConservativeNewReviews:330,additionallyRetained:51,unchangedBaseline:120,oldOwnersTotal:171,remainingFreshInputs:279,batches:14},currentProductionNativeValidation:validation,knownUnretainedIndexIssue:{goalId:invalid,retained:false,remainsIn279:true},normalWrites:0,modelBuilds:0,renders:0,newReviewerVotes:0,newPageFingerprintBindings:0,scientificOrHumanApproval:false});
 console.log(JSON.stringify({status:'PASS',actualWhole51:perGoal.length,baseline120:baselineProof.length,currentProductionIndices:validation.length,currentRetainedReady:51,roster279:proof.requiredGoalIds.length,references:refCounts,normalWrites:0,modelBuilds:0,newVotes:0},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
