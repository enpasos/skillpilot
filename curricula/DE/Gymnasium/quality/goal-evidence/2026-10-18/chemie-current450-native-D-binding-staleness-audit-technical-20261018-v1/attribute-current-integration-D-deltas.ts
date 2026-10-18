// SPDX-License-Identifier: Apache-2.0
// Read-only attribution of local D-context changes; no GoalBook build or review.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-D-binding-staleness-audit-technical-20261018-v1/';
const overlay='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-inactive-ci-checkpoint-20261018-v1/overlay/';
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const sem='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const must=(c:any,m:string)=>{if(!c)throw Error(m)};
const dump=(p:string,v:any)=>writeFileSync(out+p,JSON.stringify(v,null,2)+'\n');
const auditPath=out+'FACTS.active-native-D-owners-and-exact-local-binding-deltas.json';
const audit=read(auditPath),startPin=pin(canonical),baselinePin=pin(overlay+canonical+'.snapshot');
must(startPin.sha256===audit.startedAtInputPins[0].sha256,'Current graph differs from exact active-owner audit');
must(baselinePin.sha256==='4788d9034bc977b7f93681720a61efdba573a1550268e27973a507d72e26d575','Restored checkpoint662 input is not exact');
const current=read(canonical),old=read(baselinePin.path),ledger=read(sem);
const now=new Map<string,any>(current.goals.map((g:any)=>[g.id,g]));
const before=new Map<string,any>(old.goals.map((g:any)=>[g.id,g]));
const ordinary=new Set<string>(ledger.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));
const kind=new Map<string,string>(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]));
const fields=(a:any,b:any)=>[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>!isDeepStrictEqual(a?.[k],b?.[k]));
const refs=(g:any,graph:Map<string,any>)=>(g.requires??[]).map((r:any)=>typeof r==='string'?r:r.id).filter((r:string)=>graph.has(r));
must(current.goals.every((g:any)=>(g.requires??[]).every((r:any)=>typeof r==='string')),'Reference normalization must be extended before this audit is valid');
const reverse=(graph:Map<string,any>)=>{const m=new Map<string,string[]>();for(const g of graph.values())for(const r of new Set<string>(refs(g,graph))){const xs=m.get(r)??[];xs.push(g.id);m.set(r,xs)}return m};
const oldReverse=reverse(before),newReverse=reverse(now);
const cache=new Map<string,any>();
const frozen=(r:any)=>{if(!cache.has(r.firstInput))cache.set(r.firstInput,read(r.firstInput));return cache.get(r.firstInput).goals.find((g:any)=>g.goalId===r.goalId)};
const compare=(graph:Map<string,any>,reverseMap:Map<string,string[]>,id:string,page:any)=>{
 const oldForward=new Map<string,any>([...page.requires,...page.externalPrerequisites].map((r:any)=>[r.goalId,r]));
 const oldReverseRefs=new Map<string,any>([...page.reverseRequires,...page.externalReverseRequires].map((r:any)=>[r.goalId,r]));
 const forwards=[...new Set<string>(refs(graph.get(id),graph))],reverses=[...new Set(reverseMap.get(id)??[])];
 return {forwardAdded:forwards.filter(x=>!oldForward.has(x)),forwardRemoved:[...oldForward.keys()].filter(x=>!forwards.includes(x)),reverseAdded:reverses.filter(x=>!oldReverseRefs.has(x)),reverseRemoved:[...oldReverseRefs.keys()].filter(x=>!reverses.includes(x)),forwardTitleChanges:[...oldForward].filter(([x,r])=>graph.has(x)&&r.title!==graph.get(x).title).map(([x])=>x),reverseTitleChanges:[...oldReverseRefs].filter(([x,r])=>graph.has(x)&&r.title!==graph.get(x).title).map(([x])=>x)};
};
const nonempty=(d:any)=>Object.values(d).some((xs:any)=>xs.length);
const rows=audit.perGoal.map((r:any)=>{
 const id=r.goalId,g=now.get(id),b=before.get(id),f=frozen(r);
 must(g&&b,'Ordinary goal missing from checkpoint/current graph '+id);
 const baselineFrozenDiff=compare(before,oldReverse,id,f.reviewContext.page);
 const currentFrozenDiff=compare(now,newReverse,id,f.reviewContext.page);
 const canonicalDelta=fields(buildGoalDescriptionCanonicalContext(b),buildGoalDescriptionCanonicalContext(g));
 const forwardBefore=refs(b,before),forwardNow=refs(g,now),reverseBefore=oldReverse.get(id)??[],reverseNow=newReverse.get(id)??[];
 const sinceCheckpoint={canonicalContextFields:canonicalDelta,forwardAdded:forwardNow.filter(x=>!forwardBefore.includes(x)),forwardRemoved:forwardBefore.filter(x=>!forwardNow.includes(x)),reverseAdded:reverseNow.filter(x=>!reverseBefore.includes(x)),reverseRemoved:reverseBefore.filter(x=>!reverseNow.includes(x)),forwardTitleChanges:forwardNow.filter(x=>before.has(x)&&before.get(x).title!==now.get(x).title),reverseTitleChanges:reverseNow.filter(x=>before.has(x)&&before.get(x).title!==now.get(x).title)};
 const currentCause=canonicalDelta.length||Object.entries(sinceCheckpoint).some(([k,v]:any)=>k!=='canonicalContextFields'&&v.length);
 const historical=nonempty(baselineFrozenDiff);
 return {goalId:id,title:g.title,configPath:r.configPath,activeIndex:r.activeIndex,resolutionPath:r.resolutionPath,firstInput:r.firstInput,secondInput:r.secondInput,nativeReviewIdentities:r.nativeReviewIdentities,canonicalDeltaFields:fields(b,g),baselineFrozenReferenceDifference:baselineFrozenDiff,currentFrozenReferenceDifference:currentFrozenDiff,sinceCheckpoint:{...sinceCheckpoint,reverseAdded:sinceCheckpoint.reverseAdded.map(x=>({goalId:x,title:now.get(x).title,semanticKind:kind.get(x),newSinceCheckpoint:!before.has(x)}))},currentIntegrationCausedLocalBindingChange:!!currentCause,olderFrozenReferenceDifferenceAlreadyPresentAtCheckpoint:historical,currentFrozenLocalBindingDifference:r.structurallyAffected,attribution:currentCause?(historical?'CURRENT_INTEGRATION_AND_OLDER_FROZEN_PAGE_DIFFERENCES':'CURRENT_INTEGRATION_ONLY'):(historical?'OLDER_FROZEN_PAGE_DIFFERENCES_ONLY':'NO_MEASURED_LOCAL_BINDING_DIFFERENCE')};
});
const newlyAffected=rows.filter((r:any)=>r.currentIntegrationCausedLocalBindingChange);
const oldOnly=rows.filter((r:any)=>r.attribution==='OLDER_FROZEN_PAGE_DIFFERENCES_ONLY');
const groups=new Map<string,any>();
for(const r of rows){const g=groups.get(r.configPath)??{configPath:r.configPath,activeIndex:r.activeIndex,currentIntegrationGoalIds:[],olderOnlyGoalIds:[],allMeasuredFrozenDeltaGoalIds:[]};if(r.currentIntegrationCausedLocalBindingChange)g.currentIntegrationGoalIds.push(r.goalId);if(r.attribution==='OLDER_FROZEN_PAGE_DIFFERENCES_ONLY')g.olderOnlyGoalIds.push(r.goalId);if(r.currentFrozenLocalBindingDifference)g.allMeasuredFrozenDeltaGoalIds.push(r.goalId);groups.set(r.configPath,g)}
const goalChanges=[...before].filter(([id,g])=>now.has(id)&&!isDeepStrictEqual(g,now.get(id))).map(([id,g])=>({goalId:id,semanticKind:kind.get(id),fields:fields(g,now.get(id))}));
const newlyAdded=[...now.keys()].filter(id=>!before.has(id)).map(id=>({goalId:id,semanticKind:kind.get(id),title:now.get(id).title}));
const changedKinds:any={};for(const x of newlyAdded)changedKinds[x.semanticKind??'unknown']=(changedKinds[x.semanticKind??'unknown']??0)+1;
const summary={baselineNodes:before.size,currentNodes:now.size,ordinaryGoals:ordinary.size,addedNodes:newlyAdded.length,addedKinds:changedKinds,changedExistingGoals:goalChanges.length,ordinaryWholeGoalDeltas:goalChanges.filter(x=>ordinary.has(x.goalId)).length,currentIntegrationCausedLocalBindingGoalCount:newlyAffected.length,currentIntegrationAffectedConfigCount:[...groups.values()].filter(g=>g.currentIntegrationGoalIds.length).length,newAssessmentReverseOrdinaryGoalCount:rows.filter((r:any)=>r.sinceCheckpoint.reverseAdded.length).length,newAssessmentReversePairCount:rows.reduce((n:number,r:any)=>n+r.sinceCheckpoint.reverseAdded.length,0),requiresAndNewAssessmentReverseOverlap:rows.filter((r:any)=>r.sinceCheckpoint.canonicalContextFields.length&&r.sinceCheckpoint.reverseAdded.length).length,mixedCurrentIntegrationAndOlderFrozenDifferenceCount:rows.filter((r:any)=>r.attribution==='CURRENT_INTEGRATION_AND_OLDER_FROZEN_PAGE_DIFFERENCES').length,olderFrozenReferenceDifferenceGoalCount:rows.filter((r:any)=>r.olderFrozenReferenceDifferenceAlreadyPresentAtCheckpoint).length,olderOnlyFrozenDifferenceGoalCount:oldOnly.length,currentFrozenReferenceOrCanonicalDeltaGoalCount:rows.filter((r:any)=>r.currentFrozenLocalBindingDifference).length,nonordinaryAnchorDescriptionEnOnlyChanged:goalChanges.filter(x=>x.semanticKind==='orientation'&&isDeepStrictEqual(x.fields,['descriptionEn'])).length};
dump('FACTS.checkpoint662-to-current737-D-binding-cause-attribution.json',{role:'EXACT_LOCAL_REFERENCE_CAUSE_ATTRIBUTION_NOT_FINAL_PAGE_ACCEPTANCE',inputs:[baselinePin,startPin,pin(sem),pin(auditPath)],summary,existingGoalChanges:goalChanges,newNodes:newlyAdded,perGoal:rows,configGroups:[...groups.values()],limits:['Current-integration causes are measured against exact restored checkpoint662; older frozen page references are reported separately.','Direct ID/title reference changes necessarily change corresponding native page fields if regenerated using the same ordinary scope. No model is built and navigation/assets/P/page applicability are not asserted current.','The changed orientation EN description belongs to a nonordinary orientation node; ordinary page references bind its ID/title, not its descriptionEn.','Composition/source changes do not enter these direct reference calculations. Final source/applicability and whole-page diff remains a separate required cut after all integrations.']});
dump('GOAL_IDS.current-integration-caused-D-local-binding-deltas.json',{canonical:startPin,baseline:baselinePin,goalIds:newlyAffected.map((r:any)=>r.goalId),notFinal:true,reason:'Exact canonical-context/direct-page-reference changes since restored662; final current pages and evidence binding still require materialization.'});
dump('CONFIGS.current-integration-caused-D-local-binding-deltas.json',{canonical:startPin,groups:[...groups.values()].filter(g=>g.currentIntegrationGoalIds.length)});
must(isDeepStrictEqual(pin(canonical),startPin),'Current graph drifted during attribution');
console.log(JSON.stringify(summary,null,2));
