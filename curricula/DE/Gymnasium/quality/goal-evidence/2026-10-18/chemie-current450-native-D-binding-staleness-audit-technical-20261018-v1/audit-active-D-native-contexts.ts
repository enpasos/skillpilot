// SPDX-License-Identifier: Apache-2.0
// Read-only native D binding audit. Does not build a GoalBook or create reviews.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,relative} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {buildResolutionSupersessionChains,validateResolutionSemanticRetirements} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout';
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution';
import {fingerprintGoalForEvidence} from '../../../../../../../app/scripts/goalEvidenceProfileModel';

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-D-binding-staleness-audit-technical-20261018-v1/';
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}};
const rel=(p:string)=>relative(process.cwd(),resolve(p));
const must=(x:any,m:string)=>{if(!x)throw Error(m)};
const dump=(p:string,x:any)=>writeFileSync(out+p,JSON.stringify(x,null,2)+'\n');
const startPins=[canonical,registry,semantic].map(pin);
const landscape=read(canonical),ledger=read(semantic),chem=read(registry).subjects.find((s:any)=>s.subject==='chemie');
const goals=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]));
const ordinary=new Set<string>(ledger.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));
must(ordinary.size===450,'Expected450 current ordinary goals');
const indices=chem.resolutionIndexPaths.map((path:string)=>({path,index:read(path)}));
const retirements=validateResolutionSemanticRetirements({config:chem,landscape,semanticKindLedger:ledger,indices,scopeIssues:[]});
must(retirements.issues.length===0,'Existing semantic retirement proof is not current: '+retirements.issues.join(';'));
const chains=buildResolutionSupersessionChains(chem.resolutionSupersessions,chem.resolutionIndexPaths,ordinary,retirements);
must(chains.issues.length===0,'Existing native D owner chains invalid: '+chains.issues.join(';'));
const tips=new Map(chains.chains.map((c:any)=>[c.goalId,c.indexPaths.at(-1)]));
const withdrawals=new Set(chem.resolutionWithdrawals.map((w:any)=>w.indexPath+'#'+w.goalId));
const owners=new Map<string,any>();
for(const item of indices)for(const entry of item.index.resolutions){
 if(!ordinary.has(entry.goalId)||withdrawals.has(item.path+'#'+entry.goalId))continue;
 const tip=tips.get(entry.goalId);if(tip&&tip!==item.path)continue;
 must(!owners.has(entry.goalId),'Duplicate active native D owner: '+entry.goalId);
 const group=item.index.groups.find((g:any)=>g.groupId===entry.groupId);
 must(group,'Missing active D group: '+entry.goalId);
 owners.set(entry.goalId,{...item,entry,group});
}
must(owners.size===450,'Active D owners do not exactly cover450 current ordinary goals; found'+owners.size);
const inputCache=new Map<string,any>(),manifestCache=new Map<string,any>();
const currentDependents=new Map<string,string[]>();
for(const g of landscape.goals)for(const r of new Set<string>(g.requires??[])){const ds=currentDependents.get(r)??[];ds.push(g.id);currentDependents.set(r,ds)}
const readCached=(p:string,cache:Map<string,any>)=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p)};
const fieldDiff=(a:any,b:any)=>[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>!isDeepStrictEqual(a?.[k],b?.[k]));
const byId=(xs:any[])=>new Map<string,any>(xs.map(x=>[x.goalId,x]));
const rows:any[]=[],inputIssues:any[]=[];
for(const id of [...ordinary].sort()){
 const owner=owners.get(id),root=rel(resolve(dirname(owner.path),owner.group.artifactDirectory??owner.group.groupId));
 const resolutionPath=rel(resolve(dirname(owner.path),owner.entry.resolutionPath));
 const resolution=read(resolutionPath);
 const firstPath=root+'/round-a/description-review-input.json',secondPath=root+'/round-b/description-review-input.json';
 const a=readCached(firstPath,inputCache),b=readCached(secondPath,inputCache);
 const frozen=a.goals.find((g:any)=>g.goalId===id),second=b.goals.find((g:any)=>g.goalId===id);
 must(frozen&&second,'Active native D inputs do not contain owned goal '+id);
 const current=goals.get(id),context=buildGoalDescriptionCanonicalContext(current),page=frozen.reviewContext.page;
 const oldContextFP=fingerprintGoalDescriptionReviewContext(frozen),pageFP=fingerprintGoalDescriptionReviewPage(page);
 const goalFP=fingerprintGoalForEvidence(current,'goal-evidence-v1','curricularAtomic');
 const contextOnlyCandidate={...structuredClone(frozen),canonicalContext:context,currentTitleDe:current.title,currentTitleEn:current.titleEn,currentDescriptionDe:current.description,currentDescriptionEn:current.descriptionEn,goalFingerprint:goalFP};
 const changedCanonicalFields=fieldDiff(frozen.canonicalContext,context);
 const bilingualTextChanged=!isDeepStrictEqual({titleDe:frozen.currentTitleDe,titleEn:frozen.currentTitleEn,descriptionDe:frozen.currentDescriptionDe,descriptionEn:frozen.currentDescriptionEn},{titleDe:current.title,titleEn:current.titleEn,descriptionDe:current.description,descriptionEn:current.descriptionEn});
 const frozenForward=byId([...page.requires,...page.externalPrerequisites]),frozenReverse=byId([...page.reverseRequires,...page.externalReverseRequires]);
 const currentForward=[...new Set<string>(current.requires??[])],currentReverse=[...new Set(currentDependents.get(id)??[])];
 const forwardAdded=currentForward.filter(r=>!frozenForward.has(r)),forwardRemoved=[...frozenForward.keys()].filter(r=>!currentForward.includes(r));
 const reverseAdded=currentReverse.filter(r=>!frozenReverse.has(r)),reverseRemoved=[...frozenReverse.keys()].filter(r=>!currentReverse.includes(r));
 const forwardTitleChanges=[...frozenForward].filter(([r,ref])=>goals.has(r)&&ref.title!==goals.get(r).title).map(([r])=>r);
 const reverseTitleChanges=[...frozenReverse].filter(([r,ref])=>goals.has(r)&&ref.title!==goals.get(r).title).map(([r])=>r);
 const manifestPath=root+'/batch-manifest.json';
 let configPath:string|null=null,baseConfigPath:string|null=null,viewPath:string|null=null,sourceManifestPath:string|null=null;
 if(existsSync(manifestPath)){
  const manifest=readCached(manifestPath,manifestCache);configPath=manifest.configPath;baseConfigPath=manifest.source?.baseGoalBookConfigPath??null;
  if(baseConfigPath&&existsSync(baseConfigPath)){const cfg=readCached(baseConfigPath,manifestCache);viewPath=cfg.compositionViewPath??null;sourceManifestPath=cfg.compositionViewManifestPath??null}
 }
 const pageReferenceFieldsChanged=!!(forwardAdded.length||forwardRemoved.length||reverseAdded.length||reverseRemoved.length||forwardTitleChanges.length||reverseTitleChanges.length);
 const structurallyAffected=!!(changedCanonicalFields.length||bilingualTextChanged||goalFP!==frozen.goalFingerprint||pageReferenceFieldsChanged);
 if(oldContextFP!==resolution.goal.goalReviewContextFingerprint||pageFP!==frozen.pageFingerprint||fingerprintGoalDescriptionReviewContext(second)!==oldContextFP||goalFP!==frozen.goalFingerprint)inputIssues.push({goalId:id,oldContextDigestExact:oldContextFP===resolution.goal.goalReviewContextFingerprint,oldPageDigestExact:pageFP===frozen.pageFingerprint,twoFrozenInputsPerGoalExact:isDeepStrictEqual(frozen,second),goalFingerprintCurrent:goalFP===frozen.goalFingerprint});
 rows.push({goalId:id,title:current.title,activeIndex:owner.path,resolutionPath,configPath,baseConfigPath,configFilePresent:!!configPath&&existsSync(configPath),baseConfigFilePresent:!!baseConfigPath&&existsSync(baseConfigPath),viewPath,sourceManifestPath,firstInput:firstPath,secondInput:secondPath,nativeReviewIdentities:{first:resolution.rounds.first,second:resolution.rounds.second},frozenGoalFingerprint:frozen.goalFingerprint,currentGoalFingerprint:goalFP,goalFingerprintCurrent:goalFP===frozen.goalFingerprint,bilingualTextChanged,changedCanonicalFields,oldNativeContextFingerprint:oldContextFP,contextOnlyCurrentCandidateFingerprint:fingerprintGoalDescriptionReviewContext(contextOnlyCandidate),canonicalContextChanged:changedCanonicalFields.length>0,frozenPageFingerprint:pageFP,pageFingerprintInternallyValid:pageFP===frozen.pageFingerprint,pageReferenceFieldsChanged,forwardAdded:forwardAdded.map(r=>({goalId:r,title:goals.get(r)?.title})),forwardRemoved,reverseAdded:reverseAdded.map(r=>({goalId:r,title:goals.get(r)?.title,semanticKind:ledger.decisions.find((x:any)=>x.goalId===r)?.semanticKind})),reverseRemoved,forwardTitleChanges,reverseTitleChanges,structurallyAffected,retainedFrozenPageNotClaimedCurrent:true});
}
const affected=rows.filter(r=>r.structurallyAffected);
const grouped=new Map<string,any>();
for(const r of rows){const key=r.configPath??r.activeIndex;const g=grouped.get(key)??{configPath:r.configPath,activeIndex:r.activeIndex,baseConfigPath:r.baseConfigPath,viewPath:r.viewPath,sourceManifestPath:r.sourceManifestPath,activeOwnedGoalIds:[],affectedGoalIds:[]};g.activeOwnedGoalIds.push(r.goalId);if(r.structurallyAffected)g.affectedGoalIds.push(r.goalId);grouped.set(key,g)}
const summary={currentNodes:landscape.goals.length,ordinaryGoals:ordinary.size,registeredHistoricalIndices:indices.length,activeOwnerGoals:owners.size,activeConfigGroups:grouped.size,affectedLocalBindingGoals:affected.length,canonicalContextChanged:rows.filter(r=>r.canonicalContextChanged).length,bilingualDescriptionOrTitleChanged:rows.filter(r=>r.bilingualTextChanged).length,goalFingerprintChanged:rows.filter(r=>!r.goalFingerprintCurrent).length,pageReferenceFieldsChanged:rows.filter(r=>r.pageReferenceFieldsChanged).length,assessmentReverseReferenceDifferenceGoals:rows.filter(r=>r.reverseAdded.some((x:any)=>x.semanticKind==='practiceAssessment')).length,forwardReferenceChanged:rows.filter(r=>r.forwardAdded.length||r.forwardRemoved.length||r.forwardTitleChanges.length).length,reverseReferenceChanged:rows.filter(r=>r.reverseAdded.length||r.reverseRemoved.length||r.reverseTitleChanges.length).length,nativeFrozenInputIntegrityIssues:inputIssues.length,fullBookBuilds:0,HTMLOrPDFRenders:0,newReviewVotes:0,normalWrites:0};
dump('FACTS.active-native-D-owners-and-exact-local-binding-deltas.json',{role:'READ_ONLY_NATIVE_FINGERPRINT_AND_STRUCTURAL_REFERENCE_AUDIT_NOT_CURRENT_PAGE_ACCEPTANCE',startedAtInputPins:startPins,summary,nativeFrozenInputIssues:inputIssues,activeConfigGroups:[...grouped.values()],perGoal:rows,affectedGoalIds:affected.map(r=>r.goalId),limits:['Current page fingerprints are deliberately not generated: this audit loads existing frozen inputs and calls native fingerprint readers, not a full GoalBook builder.','The exact current canonical-context/reference delta roster is a local binding lower bound. Final full model/page, source/applicability, image/evidence and subset navigation fields must be compared after the remaining integrations.','Frozen round identities and results remain historical. No checksum or one reviewer can substitute for two actual final-input D reviews.']});
dump('GOAL_IDS.current-stage-known-D-binding-deltas.json',{role:'CURRENT_STAGE_MEASURED_LOCAL_BINDING_DELTAS_NOT_FINAL_GOAL_IDS',canonical:startPins[0],goalIds:affected.map(r=>r.goalId),notFinal:true,finalScopeStillPending:true});
dump('CONFIGS.affected-active-native-D-batches.json',{canonical:startPins[0],configs:[...grouped.values()].filter(g=>g.affectedGoalIds.length),allActiveConfigs:[...grouped.values()]});
dump('INPUT.native-reader-pins.json',{readers:['app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/goalBookModel.ts'].map(pin),inputs:startPins,activeFrozenInputs:[...inputCache.keys()].map(pin),activeRegisteredIndices:indices.map((r:any)=>pin(r.path)),activeOwnedResolutions:rows.map(r=>pin(r.resolutionPath)),fullBookBuilds:0});
console.log(JSON.stringify({summary,affectedConfigs:[...grouped.values()].filter(g=>g.affectedGoalIds.length).map(g=>({config:g.configPath,affected:g.affectedGoalIds.length,owned:g.activeOwnedGoalIds.length})),currentInputDrift:startPins.filter(p=>!isDeepStrictEqual(pin(p.path),p))},null,2));
