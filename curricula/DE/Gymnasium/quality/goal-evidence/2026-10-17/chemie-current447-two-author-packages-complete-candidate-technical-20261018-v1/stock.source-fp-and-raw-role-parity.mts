import fs from 'node:fs';
import crypto from 'node:crypto';
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel.ts';
import {normalizeCompositionView, collectCompositionProjectionRoleGoalIds} from '../app/src/utils/authoring/compositionViewAuthoring.ts';

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1';
const cp=out+'/C659.447ordinary-68memory.two-author-candidates.INACTIVE.json';
const sp='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const bp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const vp=out+'/VIEWS41.complete-five-new-target-proposals.INACTIVE.json';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=fs.readFileSync(p);return{path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const stable=(x:any):string=>{if(x===null||typeof x!=='object')return JSON.stringify(x);if(Array.isArray(x))return'['+x.map(stable).join(',')+']';return'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}'};
const eq=(a:any,b:any)=>stable(a)===stable(b);
const assert=(b:boolean,msg:string)=>{if(!b)throw new Error(msg)};
const write=(name:string,x:any)=>{const p=out+'/'+name;fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');return pin(p)};
const before=read(bp), c=read(cp), oldsem=read(sp), views=read(vp);
const oldby=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));
const by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const newIds=new Set<string>([...by.keys()].filter(id=>!oldby.has(id)));
assert(newIds.size===5,'expected five new atoms');
const semantic=structuredClone(oldsem);
semantic.ledgerId='chemie-current659-447ordinary-five-new-author-assumptions-inactive-20261018-v1';
semantic.sourceLandscapePath=cp;
const rebindings:any[]=[];
for(let i=0;i<semantic.decisions.length;i++){
 const old=oldsem.decisions[i],row=semantic.decisions[i];
 assert(old.sourceFingerprint===fingerprintSemanticKindSourceGoal(oldby.get(old.goalId)),'stale actual normal SEM '+old.goalId);
 row.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(row.goalId));
 if(row.sourceFingerprint!==old.sourceFingerprint)rebindings.push({goalId:row.goalId,before:old.sourceFingerprint,after:row.sourceFingerprint,classificationFieldsExact:true});
 const withoutFP=(x:any)=>Object.fromEntries(Object.entries(x).filter(([k])=>k!=='sourceFingerprint'));
 assert(eq(withoutFP(row),withoutFP(old)),'changed an existing classification '+row.goalId);
}
for(const gid of newIds)semantic.decisions.push({goalId:gid,sourceFingerprint:fingerprintSemanticKindSourceGoal(by.get(gid)),semanticKind:'curricularAtomic',decisionStatus:'author_candidate',decisionBasis:'inactive-unreviewed-author-curricular-atomic-proposal'});
semantic.counts.curricularAtomic=447;semantic.counts.total=659;
assert(rebindings.length===6,'unexpected actual old sourceFP delta count');
assert(semantic.decisions.length===659,'wrong full semantic transport length');
for(const row of semantic.decisions)assert(row.sourceFingerprint===fingerprintSemanticKindSourceGoal(by.get(row.goalId)),'wrong candidate sourceFP');
const semp=write('SEM659.current654-classes-plus-five-author-assumptions.INACTIVE-TRANSPORT.json',semantic);

const viewRows:any[]=[];let added=0,oldTargets=0,oldSupport=0;
const perNew=new Map<string,any[]>();
function withoutNew(nodes:any[]):any[]{return nodes.filter(n=>!newIds.has(n.goalId)).map(n=>n.kind==='structure'?{...n,children:withoutNew(n.children)}:n)}
for(const row of views.rows){
 const old=read(row.normalPath),aft=row.wholeCandidateView;
 const pruned={...aft,rootNodes:withoutNew(aft.rootNodes)};
 assert(eq(old,pruned),'deleting exactly the five new references did not restore old whole view '+row.viewId);
 const b=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(old).rootNodes,oldby);
 const a=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(aft).rootNodes,by);
 const sorted=(s:Set<string>)=>[...s].sort();
 const aOldTarget=new Set<string>([...a.targetGoalIds].filter(id=>!newIds.has(id)));
 const aOldSupport=new Set<string>([...a.prerequisiteOnlyGoalIds].filter(id=>!newIds.has(id)));
 assert(eq(sorted(aOldTarget),sorted(b.targetGoalIds)),'old raw targets changed '+row.viewId);
 assert(eq(sorted(aOldSupport),sorted(b.prerequisiteOnlyGoalIds)),'old support roles changed '+row.viewId);
 const additions=[...a.targetGoalIds].filter(id=>newIds.has(id));
 for(const gid of additions){const list=perNew.get(gid)??[];list.push({viewId:row.viewId,scope:aft.scope});perNew.set(gid,list)}
 assert([...a.prerequisiteOnlyGoalIds].every(id=>!newIds.has(id)),'new support role not explicitly proposed');
 oldTargets+=b.targetGoalIds.size;oldSupport+=b.prerequisiteOnlyGoalIds.size;added+=additions.length;
 viewRows.push({viewId:row.viewId,before:pin(row.normalPath),wholeBeforeRestoredByRemovingOnlyFiveNewRefs:true,allOldTargetRolesExact:true,allOldPrerequisiteOnlyRolesExact:true,newTargetGoalIds:additions.sort(),beforeRawTargetCount:b.targetGoalIds.size,afterRawTargetCount:a.targetGoalIds.size});
}
assert(added===48,'wrong target addition total');
const bio='223e33a4-5545-5332-ac4e-7d7a6cbc587c',med='4965395d-e0c5-5e23-a408-a11712aab409';
assert((perNew.get(bio)??[]).length===32,'wrong bio retention count');
assert((perNew.get(med)??[]).length===4,'wrong medicine retention count');
assert((perNew.get(bio)??[]).every(x=>x.scope.jurisdiction!=='DE-BY'),'new BY import');
assert((perNew.get(med)??[]).every(x=>!(x.scope.jurisdiction==='DE-HB'&&x.scope.courseProfile==='GK')),'HB GK medicine added');
for(const gid of newIds)if(gid!==bio&&gid!==med)assert((perNew.get(gid)??[]).length===4&&(perNew.get(gid)??[]).every(x=>x.scope.jurisdiction==='DE-HB'),'Pnew scope not exact HB4');
const report=write('PARITY.stock-SEM-source-fingerprints-and-raw41-view-roles.actual.json',{
 artifactRole:'Technical stock sourceFP/role comparison only; no composition build, AP or science review',atUTC:new Date().toISOString(),
 canonical:pin(cp),normalSEM:pin(sp),candidateSEM:semp,views:pin(vp),
 counts:{allGoals:659,ordinaryKinds:447,memoryKinds:68,existingClassificationsUnchanged:654,existingSourceFPsChanged:rebindings.length,existingWholeSemanticRowsExact:654-rebindings.length,newAuthorHypotheses:5,views:41,oldRawTargetOccurrences:oldTargets,oldRawPrerequisiteOnlyOccurrences:oldSupport,newRawTargets:added},
 actualSourceFPRebindings:rebindings,newAuthorClassificationIds:[...newIds],
 nativeSEMSchemaBoundary:{schemaUnchanged:true,newFiveStatus:'author_candidate',newFiveDecisionBasis:'inactive-unreviewed-author-curricular-atomic-proposal',isNativeValidLedger:false,reason:'The unchanged closed native schema requires authoritative plus a reviewed decisionBasis. These five rows intentionally remain author hypotheses until actual paired science is serialized by Root; this transport does not invent reviewed labels.'},
 rows:viewRows,newTargetCoordinates:[...perNew].map(([goalId,coordinates])=>({goalId,coordinates})),
 stockFunctions:[pin('app/scripts/goalBookModel.ts'),pin('app/src/utils/authoring/compositionViewAuthoring.ts')],
 boundaries:{normalWrites:0,newScientificReviews:0,AP:false,build:false,nativeApproval:false,HumanApproval:false,HumanTrial:false,M7:false,applicabilityScopeNotCompiled:true,rawRoleParityIsNotFinalScopeApproval:true}
});
fs.copyFileSync('tmp/chemie447_sem_and_raw_role_parity.mts',out+'/stock.source-fp-and-raw-role-parity.mts');
console.log(JSON.stringify({semantic:semp,parity:report,counts:{newRawTargets:added,existingSourceFPRebindings:rebindings.length,wholeOldSemanticRowsExact:654-rebindings.length}},null,2));
