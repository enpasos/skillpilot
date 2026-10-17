// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const R='/home/enpasos/projects/skillpilot';
const T=R+'/tmp/chemie-m7-resumed-20261016';
const O=T+'/BB-BE-four-existing-acquisition-source-independent-b-v1';
const A=T+'/BB-BE-four-crossstage-prerequisite-source-author-successor-v1';
const L=T+'/chemie-shared640-recycling-native-author-capsule-L6-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(b:any)=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>({path:p.slice(R.length+1),sha256:sha(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const stable=(v:any):any=>Array.isArray(v)?v.map(stable):v!==null&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const fp=(v:any)=>sha(JSON.stringify(stable(v)));
const firstPath=O+'/FIRST.independent-b.whole-source-scope-decisions.before-stock.frozen.json';
assert.equal(pin(firstPath).sha256,'sha256:1e3eaf96fb2524333394a4e1330d71727f99310cc273f3e71f7391a9e86bbe7c');
const first=read(firstPath);
assert.equal(first.mechanicsAlreadyRun.stockCompiles,0);
const scienceSeal=read(O+'/SEAL.FIRST.independent-b.before-stock.json');
for(const f of scienceSeal.files)assert.deepEqual(pin(R+'/'+f.path),f);
const casp=A+'/CAS.FINAL.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.AUTHOR.inactive.json';
assert.equal(pin(casp).sha256,'sha256:bf5613e8dfd15f315b8ae5714792810a7481b27ba35972834bbc7eae9ca97f4f');
const cas=read(casp),selector=read(A+'/OUTPUTS.FINAL.BB-BE-four-CrossStage-source-acquisition.AUTHOR.selector.json');
const currentCanonicalPath=L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const cp=T+'/INPUT.exact37e-pre-two-priors-reconstructed-by-inverse-guarded-CAS.canonical.snapshot.json';
// Exact old bytes were reconstructed by Root; independently verify the digest.
// The separately changed current L6 canonical receives a separate four-view addendum.
assert.equal(pin(cp).sha256,'sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80');
assert.equal(pin(currentCanonicalPath).sha256,'sha256:ae53884b26285d9483b315f030216566b74fb7067e9fc962610e493aadeb3fb2');
const can=read(cp),by=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
const currentCan=read(currentCanonicalPath),currentBy=new Map<string,any>(currentCan.goals.map((g:any)=>[g.id,g]));
assert.equal(can.goals.length,641);
for(const row of first.decisions)assert.equal(fp(by.get(row.goalId)),row.wholeCanonicalGoalObjectFingerprint,'Reviewed whole goal drift '+row.goalId);
for(const row of first.decisions)assert.equal(fp(currentBy.get(row.goalId)),row.wholeCanonicalGoalObjectFingerprint,'Current reviewed whole goal drift '+row.goalId);
const changedCurrentGoals=can.goals.filter((g:any)=>fp(g)!==fp(currentBy.get(g.id))).map((g:any)=>{
 const current=currentBy.get(g.id);assert(current);const {requires:b,...bg}=g,{requires:a,...ag}=current;assert.deepEqual(ag,bg);
 return {goalId:g.id,title:g.title,beforeRequires:b,currentRequires:a,onlyRequiresChanged:true};
});
assert.equal(changedCurrentGoals.length,2);assert.equal(currentCan.goals.length,641);
const {goals:oldGs,...oldMeta}=can,{goals:newGs,...newMeta}=currentCan;assert.deepEqual(newMeta,oldMeta);
const semPath=L+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const kinds=new Map<string,string>(read(semPath).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
assert.equal(can.goals.filter((g:any)=>kinds.get(g.id)==='curricularAtomic').length,439);
const sourceIndex=read(O+'/INPUT.whole-92-source-rows-and-mapping-cells.read-bound.json');
const schemaPath=R+'/contracts/curriculum-package/v1/composition-view.schema.json';
const mcPath=L+'/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';
const mc=read(mcPath),mPath=L+'/'+mc.reviewPath;
const mRows=fs.readFileSync(mPath,'utf8').split('\n').filter(Boolean).map((l:string)=>JSON.parse(l));
const protectedPaths=[cp,currentCanonicalPath,semPath,schemaPath,mcPath,mPath,R+'/'+first.P439Vector.path,L+'/'+mc.cardReviewPath,
 L+'/app/src/utils/authoring/compositionViewAuthoring.ts',L+'/app/src/utils/goalFilters.ts',
 ...sourceIndex.inputs.flatMap((i:any)=>[R+'/'+i.mapping.path,R+'/'+i.extraction.path,R+'/'+i.officialPDF.path]),
 ...cas.operations.map((o:any)=>L+'/'+o.targetPath)];
const initialPins=[...new Set<string>(protectedPaths)].map(pin);
const {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView}=await import(L+'/app/src/utils/authoring/compositionViewAuthoring.ts');
const {goalMatchesFilters}=await import(L+'/app/src/utils/goalFilters.ts');
const {default:Ajv2020}=await import(R+'/app/node_modules/ajv/dist/2020.js');
const validate=new Ajv2020({allErrors:true,strict:false}).compile(read(schemaPath));
function roleSets(v:any){
 const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);
 return {target:new Set<string>([...r.targetGoalIds].filter(i=>goalMatchesFilters(by.get(i),[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean)))),support:r.prerequisiteOnlyGoalIds};
}
const role=(r:any,i:string)=>r.target.has(i)?'target':r.support.has(i)?'prerequisiteOnly':'absent';
function closure(i:string){const seen=new Set<string>(),todo=[...(by.get(i)?.requires??[])];while(todo.length){const p=todo.pop()!;if(seen.has(p))continue;seen.add(p);todo.push(...(by.get(p)?.requires??[]));}return [...seen];}
function missing(r:any){const map=new Map<string,Set<string>>();for(const i of r.target)if(kinds.get(i)==='curricularAtomic')for(const p of closure(i))if(role(r,p)==='absent'){if(!map.has(p))map.set(p,new Set());map.get(p)!.add(i);}return [...map].sort((a,b)=>a[0].localeCompare(b[0])).map(([goalId,consumers])=>({goalId,title:by.get(goalId)?.title,kind:kinds.get(goalId),ordinaryConsumerIds:[...consumers].sort()}));}
function refs(nodes:any[]):any[]{return nodes.flatMap(n=>n.kind==='structure'?refs(n.children):[n]);}
function retained(b:any,a:any){
 assert.equal(b.kind,a.kind);
 if(b.kind!=='structure'){assert.deepEqual(a,b);return;}
 const {children:bc,...bm}=b,{children:ac,...am}=a;assert.deepEqual(am,bm);assert(ac.length>=bc.length);
 bc.forEach((n:any,k:number)=>retained(n,ac[k]));
}
assert.deepEqual(cas.operations.map((o:any)=>o.targetPath).sort(),['bb','be'].flatMap(j=>['gk','lk'].map(c=>`curricula/DE/Gymnasium/composition-views/chemie/de-${j}-${c}.view.json`)).sort());
assert.deepEqual(cas.canonicalGoalOperations,[]);assert.deepEqual(cas.sourceMappingOperations,[]);
const augmented={...can,goals:can.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))};
const rows=[];
for(const op of cas.operations){
 const input=L+'/'+op.targetPath;
 assert.equal(pin(input).sha256,op.expectedCurrentFileSha256);assert.equal(fp(op.before),op.expectedCurrentWholeObjectFingerprint);assert.deepEqual(read(input),op.before);
 const artifact=selector.wholeAfterViews.find((x:any)=>x.path===op.afterArtifact.path);assert(artifact);assert.deepEqual(pin(R+'/'+artifact.path),artifact);assert.deepEqual(read(R+'/'+artifact.path),op.after);
 assert.equal(validate(op.after),true,JSON.stringify(validate.errors));
 const {rootNodes:bn,...bm}=op.before,{rootNodes:an,...am}=op.after;assert.deepEqual(am,bm);assert.equal(bn.length,an.length);bn.forEach((n:any,k:number)=>retained(n,an[k]));
 const before=roleSets(op.before),after=roleSets(op.after),added=[...after.target].filter(i=>!before.target.has(i)).sort();
 const lost=[...before.target].filter(i=>!after.target.has(i));assert.deepEqual(lost,[]);assert.deepEqual([...before.support].sort(),[...after.support].sort());assert.deepEqual(added,[...op.expectedAddedEffectiveTargetGoalIds].sort());
 const oldRefs=refs(bn),newRefs=refs(an).filter((n:any)=>!oldRefs.some((o:any)=>fp(o)===fp(n)));
 const newClusterRefs=newRefs.filter((n:any)=>(by.get(n.goalId)?.contains??[]).length);
 assert(newClusterRefs.every((n:any)=>n.kind==='canonicalSubtree'));
 assert(newRefs.every((n:any)=>(n.projectionRole??'target')==='target'));
 const raw=compileCompositionView(normalizeCompositionView(op.after),can);
 const rawErrors=raw.findings.filter((f:any)=>f.severity==='error');assert.deepEqual(rawErrors,[]);
 const currentRaw=compileCompositionView(normalizeCompositionView(op.after),currentCan);
 assert.deepEqual(currentRaw.findings,raw.findings);
 const prevKind=compileCompositionView(normalizeCompositionView(op.before),augmented).findings;
 const nextKind=compileCompositionView(normalizeCompositionView(op.after),augmented).findings;
 const findingKey=(f:any)=>JSON.stringify({code:f.code,goalId:f.goalId,message:f.message,severity:f.severity});
 const newKindErrors=nextKind.filter((f:any)=>f.severity==='error'&&!prevKind.some((p:any)=>findingKey(p)===findingKey(f)));assert.deepEqual(newKindErrors,[]);
 const mb=missing(before),ma=missing(after),newMissing=ma.filter(q=>!mb.some(p=>p.goalId===q.goalId));assert.deepEqual(newMissing,[]);
 const directMissing=[...after.target].flatMap(i=>(by.get(i)?.requires??[]).filter((p:string)=>role(after,p)==='absent').map((p:string)=>({consumerId:i,consumerKind:kinds.get(i),priorId:p,priorKind:kinds.get(p)})));
 const memoryRefs=added.flatMap(i=>mRows.filter((m:any)=>m.goalId===i&&m.status==='memory_required').flatMap((m:any)=>(m.memoryGoalIds??[]).filter((p:string)=>role(after,p)==='absent').map((p:string)=>({ordinaryGoalId:i,memoryGoalId:p,title:by.get(p)?.title,courseFilteredOut:!goalMatchesFilters(by.get(p),[op.after.scope.courseProfile,op.after.scope.jurisdiction,op.after.scope.durationModel].filter(Boolean))}))));
 rows.push({viewId:op.after.viewId,scope:op.after.scope,before:pin(input),after:artifact,allWholeBeforeGuardsExact:true,onlyAppendedTargetReferences:true,schemaValid:true,rawCanonicalCompile:{errors:rawErrors,allFindings:raw.findings},separateCurrentRawCanonicalCompile:{errors:currentRaw.findings.filter((f:any)=>f.severity==='error'),allFindings:currentRaw.findings,findingsIdenticalToExact37Baseline:true},kindAugmentedDiagnostic:{beforeErrorCount:prevKind.filter((f:any)=>f.severity==='error').length,afterErrorCount:nextKind.filter((f:any)=>f.severity==='error').length,newErrors:newKindErrors},targetCountBefore:before.target.size,targetCountAfter:after.target.size,addedTargetGoalIds:added,addedByKind:added.reduce((a:any,i:string)=>(a[kinds.get(i)??'unknown']=(a[kinds.get(i)??'unknown']??0)+1,a),{}),lostTargets:lost,prerequisiteOnlyRoleIdsExact:[...after.support].sort(),newClusterReferences:newClusterRefs,remainingDirectMissing:directMissing,remainingTransitiveMissing:ma,newTransitiveMissing:newMissing,newlyTargetedOrdinaryMissingMemoryReferences:memoryRefs});
}
// Bounded closure inspection only: no canonical, P, M or card rewrites and no M gate.
const relevant=new Set<string>(rows.flatMap((r:any)=>r.addedTargetGoalIds.flatMap((i:string)=>[i,...closure(i)]))),grey=new Set<string>(),done=new Set<string>();
function visit(i:string){assert(by.has(i),'unknown '+i);assert(!grey.has(i),'cycle '+i);if(done.has(i))return;grey.add(i);for(const p of by.get(i).requires??[])visit(p);grey.delete(i);done.add(i);}
for(const i of relevant)visit(i);
for(const p of initialPins)assert.deepEqual(pin(R+'/'+p.path),p);
for(const i of sourceIndex.inputs)for(const name of ['mapping','extraction','officialPDF'])assert.deepEqual(pin(R+'/'+i[name].path),i[name]);
const authorBoundaryPath=A+'/BOUNDARIES.FINAL.explicit-fachliche-Memory-and-kind-aware-existing-interface-HOLDs.json';
const report={role:'Independent B bounded readonly technical verification AFTER own sealed scientific FIRST. Passing technical checks do not change B-SOURCE-01 HOLD.',executedUTC:new Date().toISOString(),ownScientificFirst:pin(firstPath),wholeCAS:pin(casp),authorSelector:pin(A+'/OUTPUTS.FINAL.BB-BE-four-CrossStage-source-acquisition.AUTHOR.selector.json'),exact37CanonicalSnapshot:pin(cp),currentPrivateCanonical:pin(currentCanonicalPath),canonicalBindingDrift:{CASBoundCanonical:cas.canonicalBinding,originalCurrentL6GlobalPinStillMatches:false,exact37SnapshotMatchesCASBoundBytes:true,firstRunAbortedBeforeImportsOrChecks:true,rootReportedDelta:'Separately paired requires-only changes on 1c/1f and three generic/NI views integrated in private L6 during this review. No independent scientific re-review of those changes here.',changedCurrentGoals,whole55SourceReviewedGoalsUnchangedByOwnFingerprint:true,currentFourWholeBeforeGuardsStillExact:true,scientificFirstNotRewritten:true},protectedPins:initialPins,unchangedAfterChecks:true,actualChecks:{schemaAfterViews:4,rawExact37CanonicalCompileAfterViews:4,separateCurrentRawCanonicalCompileAfterViews:4,kindAugmentedExact37DiagnosticBeforeAndAfter:8,fullAPV:0,central:0,globalM:0,builds:0,nativeD:0},fourScopes:rows,selectedRequiresGraph:{nodes:relevant.size,allKnown:true,acyclic:true,canonicalEdgesChangedByThisCandidate:0},sourceBoundary:'92 whole existing cells retained, original source PDFs and all extraction/mapping bytes unchanged. No new source row, coverage approval or applicability/requires source-proof inference.',authorBoundaries:pin(authorBoundaryPath),allAuthorHoldsRemainOpen:true,ownDissent:first.requiredRevision,applicationAuthorizedByThisReport:false,writesOutsideOwnRoot:0,allRoutesClosed:false,M7Claim:false,HumanApproval:false,HumanTrial:false};
const reportPath=O+'/CHECK.independent-b.four-readonly-schema-compile-roles-source-boundaries.json';fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({report:pin(reportPath),first:pin(firstPath),scopeResults:rows.map((r:any)=>({id:r.viewId,schema:r.schemaValid,rawCompileErrors:r.rawCanonicalCompile.errors.length,targetsBefore:r.targetCountBefore,targetsAfter:r.targetCountAfter,added:r.addedTargetGoalIds.length,addedByKind:r.addedByKind,kindErrorsBefore:r.kindAugmentedDiagnostic.beforeErrorCount,kindErrorsAfter:r.kindAugmentedDiagnostic.afterErrorCount,newKindErrors:r.kindAugmentedDiagnostic.newErrors.length,support:r.prerequisiteOnlyRoleIdsExact.length,transitiveMissing:r.remainingTransitiveMissing.length,newTransitiveMissing:r.newTransitiveMissing.length,missingMemoryOccurrences:r.newlyTargetedOrdinaryMissingMemoryReferences.length})),selectedRequiresGraph:report.selectedRequiresGraph,overallScientificDecision:'HOLD B-SOURCE-01'}));
