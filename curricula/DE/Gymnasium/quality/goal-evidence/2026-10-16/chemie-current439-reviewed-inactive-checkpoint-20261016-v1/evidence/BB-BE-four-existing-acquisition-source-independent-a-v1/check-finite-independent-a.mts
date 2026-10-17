import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot';
const O=R+'/tmp/chemie-m7-resumed-20261016/BB-BE-four-existing-acquisition-source-independent-a-v1';
const L=R+'/tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1';
const A=R+'/tmp/chemie-m7-resumed-20261016/BB-BE-four-crossstage-prerequisite-source-author-successor-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=(v:any)=>'sha256:'+crypto.createHash('sha256').update(v).digest('hex');
const pin=(p:string)=>({path:p.slice(R.length+1),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const write=(name:string,obj:any)=>fs.writeFileSync(O+'/'+name,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});
const firstPath=O+'/FIRST.independent-a.source-role-science.before-stock.frozen.json';
const first=read(firstPath),firstPin=pin(firstPath),firstSeal=read(O+'/SEAL.FIRST.independent-a.json');
assert.deepEqual(firstPin,firstSeal.first);
const selectorPath=A+'/OUTPUTS.FINAL.BB-BE-four-CrossStage-source-acquisition.AUTHOR.selector.json';
assert.deepEqual(pin(selectorPath),first.inputSelector);
const selector=read(selectorPath),casPath=R+'/'+selector.wholeViewCAS.path;
assert.deepEqual(pin(casPath),first.selectedCAS);
assert.deepEqual(pin(casPath),selector.wholeViewCAS);
const cas=read(casPath),canonicalPath=R+'/'+cas.canonicalBinding.path;
assert.deepEqual(pin(canonicalPath),first.canonical);
assert.deepEqual(pin(canonicalPath),cas.canonicalBinding);
assert.equal(cas.operations.length,4); assert.deepEqual(cas.sourceMappingOperations,[]);assert.deepEqual(cas.canonicalGoalOperations,[]);
const can=read(canonicalPath),by=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
assert.equal(by.size,641);
const semPath=L+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const kinds=new Map<string,string>(read(semPath).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
assert.equal(can.goals.filter((g:any)=>kinds.get(g.id)==='curricularAtomic').length,439);
const {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView}=await import(L+'/app/src/utils/authoring/compositionViewAuthoring.ts');
const {goalMatchesFilters}=await import(L+'/app/src/utils/goalFilters.ts');
const {default:Ajv2020}=await import(R+'/app/node_modules/ajv/dist/2020.js');
const schemaPath=R+'/contracts/curriculum-package/v1/composition-view.schema.json';
const ajv=new Ajv2020({allErrors:true,strict:false}),validate=ajv.compile(read(schemaPath));
function appendOnly(b:any,a:any,path:string){
 assert.equal(a.kind,b.kind,path);
 if(b.kind!=='structure'){assert.deepEqual(a,b,path);return;}
 const ac=a.children,bc=b.children;
 assert.deepEqual({...a,children:undefined},{...b,children:undefined},path);
 assert(ac.length>=bc.length,path);
 for(let n=0;n<bc.length;n++)appendOnly(bc[n],ac[n],path+'/'+n);
}
function roles(v:any){
 const x=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);
 const filters=[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean);
 return {targets:new Set<string>([...x.targetGoalIds].filter(id=>goalMatchesFilters(by.get(id),filters))),support:new Set<string>(x.prerequisiteOnlyGoalIds)};
}
const diff=(a:Set<string>,b:Set<string>)=>[...a].filter(x=>!b.has(x)).sort();
const role=(r:any,id:string)=>r.targets.has(id)?'target':r.support.has(id)?'prerequisiteOnly':'absent';
function closure(id:string){
 const seen=new Set<string>(),q=[...(by.get(id)?.requires??[])];
 while(q.length){const p=q.pop();if(seen.has(p))continue;assert(by.has(p),'unknown '+p);seen.add(p);q.push(...(by.get(p).requires??[]));}return seen;
}
function gaps(r:any){
 const ordinaryDirect:any[]=[],otherDirect:any[]=[],trans=new Map<string,any>();
 for(const id of r.targets){const g=by.get(id);
  for(const p of g.requires??[])if(role(r,p)==='absent'){
   const e={consumerId:id,consumerKind:kinds.get(id),priorId:p,priorKind:kinds.get(p),priorTitle:by.get(p)?.title};
   (kinds.get(id)==='curricularAtomic'?ordinaryDirect:otherDirect).push(e);
  }
  if(kinds.get(id)==='curricularAtomic')for(const p of closure(id))if(role(r,p)==='absent')trans.set(p,{goalId:p,title:by.get(p)?.title,kind:kinds.get(p)});
 }
 return {ordinaryDirect,otherDirect,transitive:[...trans.values()].sort((a,b)=>a.goalId.localeCompare(b.goalId))};
}
const memoryConfigPath=L+'/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';
const memoryConfig=read(memoryConfigPath),memoryPath=L+'/'+memoryConfig.reviewPath;
const memoryRows=fs.readFileSync(memoryPath,'utf8').trim().split('\n').map(JSON.parse);
const semCan={...can,goals:can.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))};
const scopes:any[]=[];
for(const op of cas.operations){
 const current=L+'/'+op.targetPath;
 assert.equal(pin(current).sha256,op.expectedCurrentFileSha256);assert.deepEqual(read(current),op.before);
 assert.equal(validate(op.after),true,JSON.stringify(validate.errors));
 assert.deepEqual(op.before.scope,op.after.scope);assert.equal(op.before.rootNodes.length,op.after.rootNodes.length);
 assert.deepEqual({...op.before,rootNodes:undefined},{...op.after,rootNodes:undefined});
 op.before.rootNodes.forEach((n:any,i:number)=>appendOnly(n,op.after.rootNodes[i],op.before.viewId+'/'+i));
 const afterPath=R+'/'+op.afterArtifact.path;
 assert.deepEqual(pin(afterPath),op.afterArtifact);assert.deepEqual(read(afterPath),op.after);
 const b=roles(op.before),a=roles(op.after),added=diff(a.targets,b.targets);
 assert.deepEqual(added,[...op.expectedAddedEffectiveTargetGoalIds].sort());
 assert.deepEqual(diff(b.targets,a.targets),[]);assert.deepEqual(a.support,b.support);
 const raw=compileCompositionView(normalizeCompositionView(op.after),can);
 const rawErrors=raw.findings.filter((x:any)=>x.severity==='error');assert.deepEqual(rawErrors,[]);
 const key=(x:any)=>JSON.stringify({code:x.code,goalId:x.goalId,message:x.message});
 const sb=compileCompositionView(normalizeCompositionView(op.before),semCan).findings.filter((x:any)=>x.severity==='error');
 const sa=compileCompositionView(normalizeCompositionView(op.after),semCan).findings.filter((x:any)=>x.severity==='error');
 const newSem=sa.filter((x:any)=>!sb.some((y:any)=>key(x)===key(y)));assert.deepEqual(newSem,[]);
 const bg=gaps(b),ag=gaps(a),newMissing=ag.transitive.filter((x:any)=>!bg.transitive.some((y:any)=>x.goalId===y.goalId));assert.deepEqual(newMissing,[]);
 const missingMemory=memoryRows.filter((m:any)=>added.includes(m.goalId)&&m.status==='memory_required').flatMap((m:any)=>(m.memoryGoalIds??[]).filter((id:string)=>role(a,id)==='absent').map((id:string)=>({ordinaryGoalId:m.goalId,memoryGoalId:id,title:by.get(id)?.title,courseFilteredOut:!goalMatchesFilters(by.get(id),[op.after.scope.courseProfile,op.after.scope.jurisdiction,op.after.scope.durationModel].filter(Boolean))})));
 scopes.push({viewId:op.before.viewId,scope:op.before.scope,before:pin(current),after:pin(afterPath),schemaPASS:true,wholeBeforeGuardPASS:true,onlyAppendedReferences:true,targetCountBefore:b.targets.size,targetCountAfter:a.targets.size,addedTargetGoalIds:added,addedByKind:added.reduce((a:any,id)=>(a[kinds.get(id)??'unknown']=(a[kinds.get(id)??'unknown']??0)+1,a),{}),targetLosses:[],supportRolesExact:true,stockRawCompile:{executed:true,errors:rawErrors,allFindings:raw.findings},kindAwareDiagnostic:{beforeErrors:sb,afterErrors:sa,newErrors:newSem},gapsBefore:bg,gapsAfter:ag,newTransitiveMissing:newMissing,missingCurrentMemoryReferences:missingMemory});
}
const relevant=new Set<string>(scopes.flatMap(s=>s.addedTargetGoalIds.flatMap((id:string)=>[id,...closure(id)])));
const grey=new Set<string>(),black=new Set<string>();
function visit(id:string){assert(by.has(id));assert(!grey.has(id),'cycle '+id);if(black.has(id))return;grey.add(id);for(const p of by.get(id).requires??[])visit(p);grey.delete(id);black.add(id);}
for(const id of relevant)visit(id);
const cellInput=read(A+'/INPUT.current-four-source-whole-cells-and-four-COMBINED-view-roles.json');
const sources=cellInput.sourceInputs.map((s:any)=>({source:s.source,mapping:s.mapping,sourceJSON:read(R+'/'+s.source.path),mappingJSON:read(R+'/'+s.mapping.path)}));
for(const s of sources){assert.deepEqual(pin(R+'/'+s.source.path),s.source);assert.deepEqual(pin(R+'/'+s.mapping.path),s.mapping);}
const verifiedCells=cellInput.sourceCells.map((cell:any)=>{
 const collection=sources.find((s:any)=>s.source.path.endsWith('/'+cell.sourcePath));assert(collection,cell.sourcePath);
 const sourceRow=collection.sourceJSON.sourceGoals.find((s:any)=>s.id===cell.wholeSourceGoal.id);
 const passage=collection.sourceJSON.passages.find((s:any)=>s.id===sourceRow.passageId);
 const decision=collection.mappingJSON.decisions.find((d:any)=>d.sourceGoalId===sourceRow.id);
 const edges=collection.mappingJSON.mappings.filter((m:any)=>m.legacyGoalId===sourceRow.id);
 assert.deepEqual(sourceRow,cell.wholeSourceGoal);assert.deepEqual(passage,cell.wholePassage);assert.deepEqual(decision,cell.wholeDecision);assert.deepEqual(edges,cell.wholeEdges);
 return {cellKey:cell.cellKey,wholeSourceRowSha256:hash(JSON.stringify(sourceRow)),wholeMappingCellSha256:hash(JSON.stringify(decision)),decision:decision.decision,matchType:decision.matchType??null,courseLevel:sourceRow.courseLevel,edgeCount:edges.length};
});
const protectedPaths=[canonicalPath,semPath,memoryConfigPath,memoryPath,firstPath,selectorPath,casPath,...cas.operations.map((o:any)=>L+'/'+o.targetPath),...sources.flatMap((s:any)=>[R+'/'+s.source.path,R+'/'+s.mapping.path]),L+'/app/src/utils/authoring/compositionViewAuthoring.ts',L+'/app/src/utils/goalFilters.ts',schemaPath];
const protectedPins=protectedPaths.map(pin);
for(const p of [...first.actualSourceCollectionPins,...first.officialPrimaryDocuments,first.currentPVector])assert.deepEqual(pin(R+'/'+p.path),p);
const sourceStatus=sources.map((s:any)=>({source:pin(R+'/'+s.source.path),mapping:pin(R+'/'+s.mapping.path),sourceRows:s.sourceJSON.sourceGoals.length,passages:s.sourceJSON.passages.length,pipelineStatus:s.sourceJSON.pipelineStatus,mappingStatus:s.mappingJSON.status,mappingSummary:s.mappingJSON.summary,decisionStatusCounts:s.mappingJSON.decisions.reduce((r:any,d:any)=>(r[d.decision]=(r[d.decision]??0)+1,r),{}),source8AuthorCandidate:s.mappingJSON.source8AuthorCandidate??null}));
const report={role:'Independent A actual finite mechanics following sealed independent scientific FIRST',finishedUTC:new Date().toISOString(),first:firstPin,selector:pin(selectorPath),cas:pin(casPath),canonical:pin(canonicalPath),scopes,requiresGraph:{nodes:relevant.size,allKnown:true,acyclic:true,canonicalEdgesChanged:0},actualWholeSourceCells:verifiedCells,actualSourceStatus:sourceStatus,protectedPins,sourceOperations:0,canonicalOperations:0,L6Writes:0,scopeLimits:{stockFinalCompiles:4,kindAwareBeforeAfterDiagnostics:8,fullAPV:0,globalM:0,central:0,builds:0,nativeD:0,cardScienceReview:0,allRoutesClosed:false,M7Claim:false,HumanApproval:false,HumanTrial:false}};
write('CHECK.independent-a.four-views.schema-stock-roles-source-status.actual.json',report);
console.log(JSON.stringify({schemaPass:scopes.length,stockRawFinalCompiles:scopes.length,scopes:scopes.map(s=>({id:s.viewId,targets:[s.targetCountBefore,s.targetCountAfter],added:s.addedTargetGoalIds.length,kinds:s.addedByKind,rawErrors:s.stockRawCompile.errors.length,existingKindErrors:s.kindAwareDiagnostic.afterErrors.length,newKindErrors:s.kindAwareDiagnostic.newErrors.length,directOrdinaryGaps:s.gapsAfter.ordinaryDirect.length,directOtherGaps:s.gapsAfter.otherDirect.length,transitiveGaps:s.gapsAfter.transitive.length,newTransitive:s.newTransitiveMissing.length,missingMemory:s.missingCurrentMemoryReferences.length})),sourceCells:verifiedCells.length,graphNodes:relevant.size}));
