import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
async function main(){
 const R=process.cwd(), E=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
 const O=resolve(E,'chemie-SH032-existing-source-literacy-target-two-view-author-successor-20261016-v1'),L=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
 const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
 const G='5b1bb5d9-07b1-5ba9-b320-cc97be917c60',N='3eb2a06c-d283-57aa-9eb4-088940c4801a',T='69928892-ac71-553d-a35c-4f96f16b6d6e'
 const can=read(resolve(L,C)),cas=read(resolve(O,'CAS.two-whole-SH-views.existing-source-literacy-target.AUTHOR.inactive.json'))
 assert.equal(sha(resolve(L,C)),cas.baseCanonical.sha256)
 const semPath=resolve(E,'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/SEMANTIC639.descriptive-classification.for-review-only.json')
 const sem=read(semPath),kind=new Map(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]));assert.equal(kind.get(G),'curricularAtomic')
 const ordinary=new Set(sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
 const diagPath=resolve(E,'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/CHECK.actual-combined639-stock82-and39views.before-Fruit-practical-placement.json'),diag=read(diagPath)
 const {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(R,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
 const {normalizeCanonicalLandscape}=await import(pathToFileURL(resolve(R,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
 const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(R,'app/src/hooks/useLandscapes.ts')).href)
 const {applyCompositionViewProjection}=await import(pathToFileURL(resolve(R,'app/src/utils/compositionViewRuntime.ts')).href)
 const {goalMatchesFilters}=await import(pathToFileURL(resolve(R,'app/src/utils/goalFilters.ts')).href)
 const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookModel.ts')).href)
 const {buildApplicabilityCompilation}=await import(pathToFileURL(resolve(L,'app/scripts/applicabilityCompiler.ts')).href)
 const applicability=buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId===can.landscapeId);assert(applicability)
 assert.equal(applicability.summary.errors,0)
 const applicabilityById=new Map(applicability.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
 assert(applicabilityById.get(G).jurisdiction.includes('DE-SH'))
 const scopedCan={...can,goals:can.goals.map((g:any)=>({...g,applicability:applicabilityById.get(g.id)??g.applicability}))}
 const norm=normalizeCanonicalLandscape(can),gb=new Map(norm.goals.map((g:any)=>[g.id,g])),scopeGb=new Map(scopedCan.goals.map((g:any)=>[g.id,g]))
 assert.equal(sem.decisions.find((d:any)=>d.goalId===G).sourceFingerprint,fingerprintSemanticKindSourceGoal(gb.get(G)))
 const pinPaths=[resolve(L,C),semPath,diagPath,...cas.operations.map((op:any)=>resolve(L,op.normalPath))]
 const inputPins=pinPaths.map(p=>({path:relative(R,p),sha256:sha(p)}));const rows=[]
 const flatten=(nodes:any[],out:string[]=[]):string[]=>{for(const n of nodes){if(n.sourceGoalId)out.push(n.sourceGoalId);flatten(n.children??[],out)}return out}
 const closure=(id:string,byId:Map<string,any>,effective:boolean,out=new Set<string>()):Set<string>=>{for(const r of (effective?(byId.get(id)?.effectiveRequires??byId.get(id)?.requires):byId.get(id)?.requires)??[]){if(out.has(r))continue;out.add(r);closure(r,byId,effective,out)}return out}
 for(const op of cas.operations){
  assert.equal(sha(resolve(L,op.normalPath)),op.beforeWholeFileSha256)
  const before=normalizeCompositionView(read(resolve(R,op.before.path))),after=normalizeCompositionView(read(resolve(R,op.after.path)))
  assert.deepEqual(before.scope,after.scope);assert.equal(after.scope.stage,'CrossStage')
  const bcomp=compileCompositionView(before,norm),acomp=compileCompositionView(after,norm)
  assert.deepEqual(bcomp.findings.filter((f:any)=>f.severity==='error'),[]);assert.deepEqual(acomp.findings.filter((f:any)=>f.severity==='error'),[])
  const bIds=flatten(bcomp.compiledRootNodes),aIds=flatten(acomp.compiledRootNodes),bset=new Set(bIds),aset=new Set(aIds)
  assert.deepEqual([...bset].filter(x=>!aset.has(x)),[]);assert.deepEqual([...aset].filter(x=>!bset.has(x)),[G]);assert.equal(aIds.filter(x=>x===G).length,1)
  const br=collectCompositionProjectionRoleGoalIds(before.rootNodes,gb),ar=collectCompositionProjectionRoleGoalIds(after.rootNodes,gb)
  assert.deepEqual([...br.prerequisiteOnlyGoalIds].sort(),[...ar.prerequisiteOnlyGoalIds].sort());assert(ar.targetGoalIds.has(G));assert(!ar.prerequisiteOnlyGoalIds.has(G))
  const scopeFilters=[after.scope.jurisdiction,after.scope.courseProfile]
  const bo=new Set([...bset].filter(x=>ordinary.has(x)&&goalMatchesFilters(scopeGb.get(x),scopeFilters))),ao=new Set([...aset].filter(x=>ordinary.has(x)&&goalMatchesFilters(scopeGb.get(x),scopeFilters)))
  const olddiag=diag.views.find((v:any)=>op.normalPath.endsWith(v.file));assert.deepEqual([...bo].sort(),olddiag.ordinaryTargets)
  const rawClosure=closure(T,gb,false),rawOutsideBefore=[...rawClosure].filter(x=>ordinary.has(x)&&!bo.has(x)).sort(),rawOutsideAfter=[...rawClosure].filter(x=>ordinary.has(x)&&!ao.has(x)).sort()
  assert.deepEqual(rawOutsideBefore,[G]);assert.deepEqual(rawOutsideAfter,[])
  const entries=prepareLandscapeEntries([scopedCan]),runtimeGoals=new Map(entries[0].goals.map((g:any)=>[g.id,g]))
  const effectiveClosure=closure(T,runtimeGoals,true)
  const effectiveOutsideBefore=[...effectiveClosure].filter(x=>ordinary.has(x)&&!bo.has(x)).sort(),effectiveOutsideAfter=[...effectiveClosure].filter(x=>ordinary.has(x)&&!ao.has(x)).sort()
  assert.deepEqual(effectiveOutsideBefore,[G]);assert.deepEqual(effectiveOutsideAfter,[])
  const projected=applyCompositionViewProjection(prepareLandscapeEntries([scopedCan]),after)[0]
  const projectedMap=new Map(projected.goals.map((g:any)=>[g.id,g]));const roots=projected.goals.filter((g:any)=>g.tags.includes('root'))
  const rendered=new Set<string>();const visit=(id:string)=>{if(rendered.has(id))return;rendered.add(id);for(const child of projectedMap.get(id)?.contains??[])visit(child)};roots.forEach((g:any)=>visit(g.id))
  assert(rendered.has(G)&&rendered.has(N)&&rendered.has(T));assert(rendered.has('a9c22adc-b543-5b0c-a2d8-3189facdff08'))
  for(const id of bo)assert(rendered.has(id),'prior ordinary target lost from runtime '+id)
  assert.equal(projectedMap.get(N).requires.includes(G),true)
  rows.push({normalPath:op.normalPath,scope:after.scope,beforeSha256:op.before.sha256,afterSha256:op.after.sha256,stockCompilerBeforeErrors:[],stockCompilerAfterErrors:[],compiledSourceGoalIdsBefore:bIds,compiledSourceGoalIdsAfter:aIds,ordinaryTargetsBefore:bo.size,ordinaryTargetsAfter:ao.size,addedOrdinaryTargets:[G],lostOrdinaryTargets:[],priorSupportRoleIdsExact:true,newGoalRole:'target',newGoalVisibleExactlyOnce:true,prerequisiteOnlyBefore:[...br.prerequisiteOnlyGoalIds],prerequisiteOnlyAfter:[...ar.prerequisiteOnlyGoalIds],stockRuntimeProjectedGoalVisible:true,stockRuntimePreservesEveryPriorOrdinaryTarget:true,rawCanonicalRequiresClosure:[...rawClosure].sort(),effectiveRequiresClosureFromStockPrepareLandscapeEntries:[...effectiveClosure].sort(),outsideOrdinaryPrerequisitesBefore:rawOutsideBefore,outsideOrdinaryPrerequisitesAfter:rawOutsideAfter,outsideEffectiveOrdinaryPrerequisitesBefore:effectiveOutsideBefore,outsideEffectiveOrdinaryPrerequisitesAfter:effectiveOutsideAfter,new699RoutePrerequisiteOmissionsAfter:0,stockEffectiveRequiresDirectBodies:[T,N,G,'a9c22adc-b543-5b0c-a2d8-3189facdff08'].map(id=>({goalId:id,direct:runtimeGoals.get(id)?.requires,effective:runtimeGoals.get(id)?.effectiveRequires,inherited:runtimeGoals.get(id)?.inheritedRequires})),wholeGoalBodiesCardsAndSourceScienceUnchanged:true})
 }
 const drift=inputPins.filter(p=>sha(resolve(R,p.path))!==p.sha256);assert.deepEqual(drift,[])
 const stockPaths=['app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/hooks/useLandscapes.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/goalFilters.ts']
 const out={recordKind:'Actual bounded two-view stock compiler and runtime projection/closure checks of inactive AUTHOR proposal, not independent placement approval',createdAtUtc:new Date().toISOString(),baseCanonicalSha256:sha(resolve(L,C)),actualLApplicabilityCompilerCodeSha256:sha(resolve(L,'app/scripts/applicabilityCompiler.ts')),actualApplicabilitySummary:applicability.summary,actualSourceLiteracyApplicability:applicability.goals.find((g:any)=>g.goalId===G),inputPins,stockCodePins:stockPaths.map(p=>({path:p,sha256:sha(resolve(R,p))})),views:rows,inputDrift:drift,canonicalWrites:0,cardWrites:0,sourceMappingWrites:0,normalWrites:0,newIndependentVotes:0,independentPlacementReviewersStillRequired:2,wholeM7:false,HumanApproval:false,HumanTrial:false}
 writeFileSync(resolve(O,'CHECKS.actual-stock-two-view-compiler-runtime-and-699-closure.AUTHOR.json'),JSON.stringify(out,null,2)+'\n')
 console.log(JSON.stringify({views:rows.map(({normalPath,ordinaryTargetsBefore,ordinaryTargetsAfter,addedOrdinaryTargets,lostOrdinaryTargets,outsideEffectiveOrdinaryPrerequisitesBefore,outsideEffectiveOrdinaryPrerequisitesAfter})=>({normalPath,ordinaryTargetsBefore,ordinaryTargetsAfter,addedOrdinaryTargets,lostOrdinaryTargets,outsideEffectiveOrdinaryPrerequisitesBefore,outsideEffectiveOrdinaryPrerequisitesAfter})),inputDrift:drift,newIndependentVotes:0,normalWrites:0},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
