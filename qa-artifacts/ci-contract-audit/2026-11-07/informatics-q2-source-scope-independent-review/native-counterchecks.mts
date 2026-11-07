import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {auditTransitiveMinimality} from '../../../../app/scripts/auditTransitiveMinimality.ts';
import {checkSkillGraphIntegrity} from '../../../../app/scripts/lib/skillGraphIntegrity.ts';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView} from '../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
const R=process.cwd(), O=resolve(R,'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review');
const P=resolve(O,'../informatics-q2-source-scope-material-implementation-candidate');
const C='/dev/shm/info-source-review';
const owner='7d51b38c-a149-5407-bddc-d2ce7878b020';
const infoPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const original=read(resolve(R,infoPath)), candidate=read(resolve(C,infoPath));
const originalById=new Map(original.goals.map((g:any)=>[g.id,g]));
const goalMap=new Map(candidate.goals.map((g:any)=>[g.id,g]));
const catalog=readdirSync(resolve(R,'curricula/DE/Gymnasium/canonical')).filter(p=>p.endsWith('.de.json')).sort().map(p=>read(resolve(R,'curricula/DE/Gymnasium/canonical',p))).map(l=>l.landscapeId===owner?candidate:l);
const catalogPins=readdirSync(resolve(R,'curricula/DE/Gymnasium/canonical')).filter(p=>p.endsWith('.de.json')).sort().map(p=>({path:p,sha256:sha(resolve(R,'curricula/DE/Gymnasium/canonical',p))}));
const proof=JSON.parse(gunzipSync(readFileSync(resolve(P,'related-preparation-minimality-proof.json.gz'))).toString()).proof;
const pristine=structuredClone(candidate), work=structuredClone(candidate), wMap=new Map(work.goals.map((g:any)=>[g.id,g]));
for(const r of proof){const g:any=wMap.get(r.source.split(':')[1]);g.requires.push(r.prerequisite.split(':')[1]);}
const replay=[];
for(const r of proof){const cat=catalog.map(l=>l.landscapeId===owner?work:l);const audit=auditTransitiveMinimality(cat,[owner]);const found=audit.findings.find(f=>f.source===r.source&&f.prerequisite===r.prerequisite);if(!found)throw Error('Unproved removal '+r.iteration);const g:any=wMap.get(r.source.split(':')[1]);g.requires=g.requires.filter((id:string)=>id!==r.prerequisite.split(':')[1]);replay.push({iteration:r.iteration,source:r.source,prerequisite:r.prerequisite,actualWitness:found.witness,actualSupportingOrigins:found.supportingOrigins,sameWitness:JSON.stringify(found.witness)===JSON.stringify(r.witness)});}
const sameRequires=work.goals.every((g:any)=>JSON.stringify([...g.requires].sort())===JSON.stringify([...(goalMap.get(g.id) as any).requires].sort()));
const interesting=['875cb53c-b48d-5b2b-8cb0-e20f27534f16','0df1bedd-5fda-5b3b-a959-c9610237bb3e','269a561b-f12e-57b2-9b05-e20f58c9dcf6','ca2ff162-c71f-500f-8ce7-321ab2cf3f1f'];
const roles=(v:any)=>collectCompositionProjectionRoleGoalIds(v.rootNodes,goalMap as any);
const views=[];
for(const name of readdirSync(resolve(C,'curricula/DE/Gymnasium/composition-views/informatik')).sort()){
 const v=read(resolve(C,'curricula/DE/Gymnasium/composition-views/informatik',name));const before=read(resolve(R,'curricula/DE/Gymnasium/composition-views/informatik',name));
 const a=roles(v), b=collectCompositionProjectionRoleGoalIds(before.rootNodes,originalById as any);const compile=compileCompositionView(v,candidate);
 views.push({file:name,scope:v.scope,interestingTargets:Object.fromEntries(interesting.map(i=>[i,a.targetGoalIds.has(i)])),targetCount:a.targetGoalIds.size,removedTargets:[...b.targetGoalIds].filter(i=>!a.targetGoalIds.has(i)),addedTargets:[...a.targetGoalIds].filter(i=>!b.targetGoalIds.has(i)),findings:compile.findings});
}
const he=read(resolve(C,'curricula/DE/Gymnasium/composition-views/informatik/de-he-gym-informatics-crossstage.view.json'));
function omit(v:any,ids:Set<string>){const walk=(ns:any[]):any[]=>ns.filter(n=>!ids.has(n.goalId)).map(n=>n.children?{...n,children:walk(n.children)}:n);return {...v,rootNodes:walk(v.rootNodes)}}
const scopeMutants=[];
for(const [label,ids] of [['remove875Only',[interesting[0]]],['remove875AndHistoricalPractice',[interesting[0],'010651ba-ddd0-510b-8ed1-e3610031f6e1']]] as const){
 const v=omit(he,new Set(ids)), a=roles(v);scopeMutants.push({label,interestingTargets:Object.fromEntries(interesting.map(i=>[i,a.targetGoalIds.has(i)])),removedTargets:[...roles(he).targetGoalIds].filter(i=>!a.targetGoalIds.has(i)),visibleExamsStillDemanding875:interesting.slice(1).filter(i=>a.targetGoalIds.has(i)&&(goalMap.get(i) as any).requires.includes(interesting[0])),fullDefinitionsPreserved:interesting.every(i=>goalMap.has(i)),compileFindings:compileCompositionView(v,candidate).findings});
}
// Countercheck the questionable index->aggregation witness without changing any source file.
const indexId='98fcf9d1-71b8-5e5b-928b-166917330da4',groupId='13be8508-9eb3-510d-bd5c-4ba4efcc2589';
const cut=structuredClone(pristine);cut.goals.find((g:any)=>g.id===indexId).requires=[];
const lost=[];
for(const exam of interesting.slice(1)){
 const counter=structuredClone(cut);counter.goals.find((g:any)=>g.id===exam).requires.push(groupId);
 const audit=auditTransitiveMinimality(catalog.map(l=>l.landscapeId===owner?counter:l),[owner]);
 const finding=audit.findings.find(f=>f.source===owner+':'+exam&&f.prerequisite===owner+':'+groupId);
 lost.push({exam,reintroducedAggregationEdgeRedundant:!!finding,alternativeWitness:finding?.witness,alternativeOrigins:finding?.supportingOrigins});
}
const cutBoth=structuredClone(cut);cutBoth.goals.find((g:any)=>g.id==='a49d9d9c-a8f2-52e7-a90a-6ad4bfafafbb').requires=[];
const lostBoth=[];
for(const exam of interesting.slice(1)){
 const counter=structuredClone(cutBoth);counter.goals.find((g:any)=>g.id===exam).requires.push(groupId);
 const audit=auditTransitiveMinimality(catalog.map(l=>l.landscapeId===owner?counter:l),[owner]);
 lostBoth.push({exam,reintroducedAggregationEdgeRedundant:audit.findings.some(f=>f.source===owner+':'+exam&&f.prerequisite===owner+':'+groupId)});
}
const graph=checkSkillGraphIntegrity(catalog,[owner]);
const repairedWitness=structuredClone(pristine);
for(const id of [indexId,'a49d9d9c-a8f2-52e7-a90a-6ad4bfafafbb']) repairedWitness.goals.find((g:any)=>g.id===id).requires=['fd1f5c79-20e6-5829-98c1-0909e047cad4'];
for(const id of interesting.slice(1)) repairedWitness.goals.find((g:any)=>g.id===id).requires.push(groupId);
const repairedWitnessGraph=checkSkillGraphIntegrity(catalog.map(l=>l.landscapeId===owner?repairedWitness:l),[owner]);
const rootSibling=structuredClone(repairedWitness);
rootSibling.goals.find((g:any)=>g.id==='31026f4a-629b-571f-b45d-a87f47a09d9e').contains=rootSibling.goals.find((g:any)=>g.id==='31026f4a-629b-571f-b45d-a87f47a09d9e').contains.filter((id:string)=>id!==interesting[0]);
rootSibling.goals.find((g:any)=>g.id==='29ec47db-7dfe-553d-b850-40e06f164545').contains.push(interesting[0]);
const rootSiblingGraph=checkSkillGraphIntegrity(catalog.map(l=>l.landscapeId===owner?rootSibling:l),[owner]);
const output={candidateSha256:sha(resolve(C,infoPath)),activeSha256:sha(resolve(R,infoPath)),catalogPins,native21SequentialReplay:replay,sameRequiresAfterReplay:sameRequires,finalGraph:graph,views,scopeMutants,indexAggregationWitnessCountercheck:lost,indexAndViewsAggregationCountercheck:lostBoth,proposedFiveEdgeRepairGraph:repairedWitnessGraph,rootSiblingAndFiveEdgeRepairGraph:rootSiblingGraph,limitations:['In-memory review mutants are counterexamples, not an applied repair.','Composition roles are authored target membership; actual profile selection is separately examined in native backend evidence.','A native graph pass is not source authority or fachliche acceptance.']};
writeFileSync(resolve(O,'native-counterchecks.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({replay:replay.length,sameRequires,graph:graph.checks,state875Targets:views.filter(x=>x.scope.jurisdiction&&x.interestingTargets[interesting[0]]).map(x=>x.scope.jurisdiction),stateOld41Targets:views.filter(x=>x.scope.jurisdiction&&x.interestingTargets[interesting[1]]).length,scopeMutants,indexAggregationWitnessCountercheck:lost}));
