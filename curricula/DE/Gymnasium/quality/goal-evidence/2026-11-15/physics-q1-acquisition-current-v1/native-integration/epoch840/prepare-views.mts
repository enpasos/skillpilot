import assert from'node:assert/strict';
import{readFileSync,writeFileSync,readdirSync,mkdirSync}from'node:fs';import{createHash}from'node:crypto';
import{normalizeCanonicalLandscape}from'../../../app/src/utils/authoring/canonicalAuthoring';
import{collectCompositionProjectionRoleGoalIds,compileCompositionView,type CompositionView,type CompositionViewNode}from'../../../app/src/utils/authoring/compositionViewAuthoring';
import{UnitGraph}from'../../../app/scripts/lib/learningUnitContracts';
import{evaluateGraphIntegrity}from'../../../app/scripts/curriculumGraphIntegrity';
const B='tmp/physics-q1-successor-integration-20261115/epoch840',C='curricula/DE/Gymnasium/canonical',V='curricula/DE/Gymnasium/composition-views/physik',P='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex'),sorted=(v:Iterable<string>)=>[...new Set(v)].sort();
const baseline=read(C+'/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),candidate=read(B+'/canonical.candidate.json'),ops=read(B+'/canonical-operations.json'),newIds=new Set<string>(ops.addedTaskIds),retired=new Set<string>(ops.historicalTaskIds);
const candidateInputSha=sha(B+'/canonical.candidate.json');
assert.equal(baseline.goals.length,809);assert.equal(candidate.goals.length,840);
const files=readdirSync(C).filter(x=>x.endsWith('.json')).sort().map(x=>C+'/'+x);
const rawCatalog=files.map(read),catalog=rawCatalog.map(x=>x.landscapeId===P?candidate:x);
const graphIntegrity=evaluateGraphIntegrity(catalog,P);assert.equal(graphIntegrity.status,'pass',JSON.stringify(graphIntegrity));
const nativeBefore=new UnitGraph(rawCatalog),nativeAfter=new UnitGraph(catalog);
const oldMap=new Map<string,any>(),newMap=new Map<string,any>(),owner=new Map<string,string>();
rawCatalog.forEach(c=>c.goals.forEach((g:any)=>oldMap.set(g.id,g)));catalog.forEach(c=>c.goals.forEach((g:any)=>{newMap.set(g.id,g);owner.set(g.id,c.landscapeId)}));
const normCatalog=catalog.map(normalizeCanonicalLandscape),landscapes=new Map(normCatalog.map(x=>[x.landscapeId,x]));
const universe=normalizeCanonicalLandscape({landscapeId:'complete-canonical-gymnasium-tmp840',title:'Canonical universe',goals:normCatalog.flatMap(x=>x.goals)});
const local=(id:string)=>id.includes(':')?id.slice(id.indexOf(':')+1):id;
const key=(id:string)=>owner.get(local(id))+':'+local(id);
function ordinaryIds(ids:Iterable<string>,graph:UnitGraph){return new Set([...ids].filter(id=>graph.has(key(id))&&graph.isAtomic(key(id))&&graph.kind(key(id))==='ordinary').map(local))}
const closedMemo=new Map<string,Set<string>>();
function ordinaryDemand(ids:Iterable<string>,graph=nativeAfter):Set<string>{
 const out=new Set<string>();for(const id0 of ids){const id=local(id0);if(graph===nativeAfter&&(newIds.has(id)||retired.has(id)))continue;const k=key(id);if(!graph.has(k)||!graph.isAtomic(k))continue;
  const ck=(graph===nativeAfter?'after:':'before:')+id;let found=closedMemo.get(ck);if(!found){found=new Set<string>();if(graph.kind(k)==='ordinary')found.add(id);for(const r of graph.reach(k))if(graph.kind(r)==='ordinary')found.add(local(r));closedMemo.set(ck,found)}for(const x of found)out.add(x)}return out;
}
function fullOrdinaryDemand(ids:Iterable<string>){const out=new Set<string>();for(const id of ids){const k=key(id);if(!nativeAfter.has(k)||!nativeAfter.isAtomic(k))continue;if(nativeAfter.kind(k)==='ordinary')out.add(local(id));for(const r of nativeAfter.reach(k))if(nativeAfter.kind(r)==='ordinary')out.add(local(r))}return out}
const affectedMemo=new Map<string,boolean>();
function affected(id:string,seen=new Set<string>()):boolean{if(newIds.has(id)||retired.has(id))return true;const known=affectedMemo.get(id);if(known!==undefined)return known;if(seen.has(id))throw Error('contains cycle');const next=new Set(seen).add(id),found=(newMap.get(id)?.contains??[]).some((x:string)=>affected(local(x),next));affectedMemo.set(id,found);return found}
const selected=process.env.PHYSICS_VIEW_FILES?new Set(process.env.PHYSICS_VIEW_FILES.split(',')):undefined,previous=selected?read(B+'/native-view-integration.actual.json'):undefined;const outputs:any[]=selected?previous.views.filter((r:any)=>!selected.has(r.sourcePath.split('/').at(-1))):[],gaps:any[]=selected?previous.openRouteGaps.filter((r:any)=>!selected.has(r.path.split('/').at(-1))):[],viewPins:any[]=selected?previous.viewInputPins.filter((r:any)=>!selected.has(r.path.split('/').at(-1))):[];if(selected)for(const r of outputs)assert.equal(sha(r.candidatePath),r.candidateSha256,'unchanged view drift');mkdirSync(B+'/views',{recursive:true});
for(const file of readdirSync(V).filter(f=>f.endsWith('.view.json')).sort()){
 if(selected&&!selected.has(file))continue;const path=V+'/'+file,original=read(path)as CompositionView;viewPins.push({path,sha256:sha(path)});
 const originalRoles=collectCompositionProjectionRoleGoalIds(original.rootNodes,oldMap),oldS=ordinaryIds(originalRoles.targetGoalIds,nativeBefore);
 const originalAtomic=sorted(originalRoles.targetGoalIds).filter(id=>nativeBefore.has(key(id))&&nativeBefore.isAtomic(key(id)));
 // Resolve the original role contract before converting affected contains paths.
 const explicitRole=(id:string)=>originalRoles.targetGoalIds.has(id)?'target':'prerequisiteOnly';
 const used=new Set<string>();const collectUsed=(ns:any[])=>ns.forEach(n=>{if(n.kind==='structure')used.add(n.id);if(n.children)collectUsed(n.children)});collectUsed(original.rootNodes);
 function sid(id:string){let s='existing-assessment-path-'+id,n=1;while(used.has(s))s='existing-assessment-path-'+id+'-'+(++n);used.add(s);return s}
 function canonicalNode(id:string,label?:string):CompositionViewNode|undefined{
  if(retired.has(id)||newIds.has(id))return undefined;
  const g=newMap.get(id);assert(g,id);
  if(!g.contains?.length)return{kind:'goalEntry',goalId:id,...(explicitRole(id)==='prerequisiteOnly'?{projectionRole:'prerequisiteOnly'}:{})};
  const children=g.contains.map((x:string)=>canonicalNode(local(x))).filter(Boolean)as CompositionViewNode[];
  return children.length?{kind:'structure',id:sid(id),label:label??g.title,children}:undefined;
 }
 function materialize(ns:CompositionViewNode[]):CompositionViewNode[]{return ns.flatMap((n:any):CompositionViewNode[]=>{
  if(n.kind==='structure'){const children=materialize(n.children);return children.length?[{...n,children}]:[]}
  if(n.goalId&&retired.has(local(n.goalId)))return[];
  if(n.kind==='canonicalSubtree'&&affected(local(n.goalId))){const x=canonicalNode(local(n.goalId),n.displayLabel);return x?[x]:[]}
  return[structuredClone(n)];
 })}
 const next=structuredClone(original);next.rootNodes=materialize(original.rootNodes);
 const digital='72effc66-87f4-5f5e-8d36-1547677365fb',nationalDefault=!original.scope.jurisdiction&&['CrossStage','SekI'].includes(original.scope.stage??'');
 const repairedBeforeDefaultRoles=collectCompositionProjectionRoleGoalIds(next.rootNodes,newMap),repairedBeforeDefaultS=ordinaryIds(repairedBeforeDefaultRoles.targetGoalIds,nativeAfter),repairedBeforeDefaultL=ordinaryDemand(repairedBeforeDefaultRoles.targetGoalIds);
 let nationalDefaultPlacement:any=undefined;
 if(nationalDefault){
  function removeOldDigital(ns:any[]):any[]{return ns.flatMap(n=>{if(n.goalId===digital)return[];if(!n.children)return[n];const children=removeOldDigital(n.children);return children.length?[{...n,children}]:[]})}next.rootNodes=removeOldDigital(next.rootNodes);
  let methods:any;function findMethods(ns:any[]){for(const n of ns){if(n.id==='physics-seki-measurement-foundations')methods=n;if(n.children)findMethods(n.children)}}findMethods(next.rootNodes);assert(methods,'existing nationalSekI measurement-foundations container missing');
  const placementEvidence={role:'canonicalDefault',classification:'own research-based SkillPilot national standard assignment; no official Land/year mapping',sourceInterpretation:'KMK2024MSA S2.1/S2.3 andE2.1/E3.1/E3.3 support age-appropriate own digital data analysis and measurement uncertainty by endSekI. The explicit random/systematic distinction operationalises this methodological aim. RetainedHE phaseE and allLand-specific mappings stay unchanged.',references:['https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2024/2024_06_13-WeBiS_Physik_MSA.pdf','https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/Qualitaet/ImplBroschuere_BiSta_NATURWISSENSCHAFTEN_2024-06-06.pdf','curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1/national-digital-method-placement/72eff-root-placement-review.actual.json']};
  methods.children.push({kind:'goalEntry',goalId:digital,projectionRole:'target',placementEvidence});nationalDefaultPlacement={goalId:digital,containerId:methods.id,containerLabel:methods.label,placementEvidence};
 }
 const expectedS=new Set(oldS);if(nationalDefault)expectedS.add(digital);
 const preRoles=collectCompositionProjectionRoleGoalIds(next.rootNodes,newMap),preS=ordinaryIds(preRoles.targetGoalIds,nativeAfter);
 assert.deepEqual(sorted(preS),sorted(expectedS),'ordinary S changed by historical task removal/materialization: '+file);
 const preAtomic=sorted(preRoles.targetGoalIds).filter(id=>nativeAfter.has(key(id))&&nativeAfter.isAtomic(key(id))),preL=ordinaryDemand(preAtomic),oldL=ordinaryDemand(originalAtomic,nativeBefore);
 const contexts:any[]=[];
 function scopeOrdinary(ns:CompositionViewNode[]){const roles=collectCompositionProjectionRoleGoalIds(ns,newMap);return ordinaryDemand([...roles.targetGoalIds].filter(id=>preRoles.targetGoalIds.has(id)))}
 function stageRank(anc:any[]){let rank=100;for(const n of anc){const text=(n.id+' '+n.label).toLowerCase();if(rank===100&&/sekundarstufe\s*ii\b|(?:^|[-_ ])sekii(?:[-_ ]|$)/u.test(text))rank=90;if(/sekundarstufe\s*i\b|(?:^|[-_ ])seki(?:[-_ ]|$)/u.test(text))rank=0;if(/(?:^|[-_ ])e(?:[-_ ]|$)|einführungsphase/u.test(text))rank=10;for(let q=1;q<=4;q++)if(new RegExp('(?:^|[-_ ])q'+q+'(?:[-_ ]|$)','u').test(text))rank=10+q*10}return rank}
 function contextsOf(ns:CompositionViewNode[],anc:any[]=[]){for(const n of ns as any[])if(n.kind==='structure'){
  const chain=[...anc,n],demand=scopeOrdinary(n.children);contexts.push({node:n,chain,depth:chain.length,demand,rank:stageRank(chain),practice:/übungen|aufgaben|assessment|practice/iu.test(n.label),root:chain.length===1});contextsOf(n.children,chain)}}contextsOf(next.rootNodes);
 const placements:any[]=[],excluded:any[]=[];
 for(const id of newIds){const task=newMap.get(id),needed=fullOrdinaryDemand([id]),missingGlobal=sorted([...needed].filter(x=>!preL.has(x)));
  if(missingGlobal.length){excluded.push({taskId:id,reason:'full ordinary preparation not already demanded by this route',missingOrdinaryGoalIds:missingGlobal});continue}
  const eligible=contexts.filter(c=>!c.root&&c.rank<100&&[...needed].every(x=>c.demand.has(x)));
  eligible.sort((a,b)=>a.rank-b.rank||Number(b.practice)-Number(a.practice)||b.depth-a.depth||a.node.id.localeCompare(b.node.id));
  const chosen=eligible[0];if(!chosen){gaps.push({viewId:next.viewId,path,taskId:id,requiredOrdinaryGoalIds:sorted(needed),reason:'genuine ordinary preparation is demanded but no existing stage/phase container can own the full task without a new placement claim'});continue}
  chosen.node.children.push({kind:'goalEntry',goalId:id});placements.push({taskId:id,containerId:chosen.node.id,containerLabel:chosen.node.label,ancestorLabels:chosen.chain.map((x:any)=>x.label),ordinaryPrerequisiteCount:needed.size,allPreparationAlreadyDemandedLocally:true,allPreparationAlreadyDemandedRoute:true});
 }
 const finalRoles=collectCompositionProjectionRoleGoalIds(next.rootNodes,newMap),finalS=ordinaryIds(finalRoles.targetGoalIds,nativeAfter),finalL=fullOrdinaryDemand(finalRoles.targetGoalIds);
 assert.deepEqual(sorted(finalS),sorted(expectedS),'new tasks changed ordinary S: '+file);assert.deepEqual(sorted(finalL),sorted(preL),'new tasks added ordinary learning: '+file);
 for(const id of retired)assert(!finalRoles.targetGoalIds.has(id)&&!finalRoles.prerequisiteOnlyGoalIds.has(id),'retired task remains in view: '+file+' '+id);
 const compiled=compileCompositionView(next,landscapes.get(P)!,universe,landscapes),errors=compiled.findings.filter(f=>f.severity==='error');
 assert.deepEqual(errors,[],'native compile errors '+file+': '+JSON.stringify(errors));
 writeFileSync(B+'/views/'+file,JSON.stringify(next,null,2)+'\n');
 outputs.push({sourcePath:path,candidatePath:B+'/views/'+file,viewId:next.viewId,scope:next.scope,sourceSha256:sha(path),candidateSha256:sha(B+'/views/'+file),ordinarySeedCountBefore:oldS.size,ordinarySeedCountAfter:finalS.size,ordinarySeedsPreserved:sorted(finalS).join(',')===sorted(oldS).join(','),ordinarySeedAdds:nationalDefault&&!oldS.has(digital)?[digital]:[],ordinarySeedRemovals:[],nationalDefaultPlacement,ordinaryLearningAfterR10BeforeNationalDefault:repairedBeforeDefaultL.size,ordinaryLearningAddedByNationalDefault:sorted([...preL].filter(x=>!repairedBeforeDefaultL.has(x))),ordinaryLearningRemovedByNationalDefault:sorted([...repairedBeforeDefaultL].filter(x=>!preL.has(x))),ordinaryLearningBefore:oldL.size,ordinaryLearningAfterR10AndHistoricalRemoval:repairedBeforeDefaultL.size,ordinaryLearningAfterNationalDefault:preL.size,ordinaryLearningAfterNewTasks:finalL.size,ordinaryLearningAddedOnlyForTasks:[],ordinaryLearningRemovedByRepair:sorted([...oldL].filter(x=>!repairedBeforeDefaultL.has(x))),ordinaryLearningAddedByReviewedR10:sorted([...repairedBeforeDefaultL].filter(x=>!oldL.has(x))),placements,notApplicableTasks:excluded,nativeCompileFindings:compiled.findings});
 if(outputs.length%10===0)console.log(JSON.stringify({compiledViews:outputs.length,taskPlacements:outputs.reduce((n,r)=>n+r.placements.length,0),openRouteGaps:gaps.length}));
}
assert.equal(outputs.length,69);
assert.equal(sha(B+'/canonical.candidate.json'),candidateInputSha,'candidate changed while compiling69views');for(const pin of viewPins)assert.equal(sha(pin.path),pin.sha256,'active view drift '+pin.path);
outputs.sort((a,b)=>a.sourcePath.localeCompare(b.sourcePath));const report={at:new Date().toISOString(),exactRepeatScope:selected?[...selected]:undefined,unchangedViewsReusedWithRawPins:selected?69-selected.size:0,status:gaps.length?'NATIVE_VIEWS_COMPILE_WITH_EXPLICIT_OPEN_PLACEMENT_GAPS':'NATIVE_VIEWS_COMPILE_WITH_REVIEWED_NATIONAL_DEFAULT_NO_TASK_ONLY_LEARNING_ADDS',baselineCanonical:{path:C+'/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',sha256:sha(C+'/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')},candidateCanonical:{path:B+'/canonical.candidate.json',sha256:candidateInputSha},nativeFunctions:['evaluateGraphIntegrity','UnitGraph.reach/kind','collectCompositionProjectionRoleGoalIds','compileCompositionView'],graphIntegrity,viewInputPins:viewPins,views:outputs,openRouteGaps:gaps,newOrdinaryGoals:0,taskStimuliChanged:false,activeWrites:false,learnerResultWrites:false};
writeFileSync(B+'/native-view-integration.actual.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({views:outputs.length,compileErrors:0,ordinarySPreserved:outputs.filter(r=>r.ordinarySeedsPreserved).length,nationalDefaultSeedAdds:outputs.filter(r=>r.ordinarySeedAdds.length).length,ordinaryLAddedForTasks:0,taskPlacements:outputs.reduce((n,r)=>n+r.placements.length,0),openRouteGaps:gaps.length,national:outputs.filter(r=>r.scope.jurisdiction===undefined&&r.scope.stage==='CrossStage').map(r=>({id:r.viewId,seeds:r.ordinarySeedCountAfter,learning:r.ordinaryLearningAfterNewTasks,placements:r.placements.length,removed:r.ordinaryLearningRemovedByRepair.length,realR10Adds:r.ordinaryLearningAddedByReviewedR10.length}))}));
