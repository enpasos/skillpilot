// Prepared reproducibility helper only. This file has not been executed by its author; existing actual native frames and code are bound separately. Run only with an independent physical private capsule and new output directory.
import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import assert from 'node:assert/strict';import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const land=()=>JSON.parse(readFileSync(canPath,'utf8'));const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;const cfg=JSON.parse(readFileSync(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'));const semPath=cfg.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften').semanticKindLedgerPath;const sem=new Map(JSON.parse(readFileSync(join(CAP,semPath),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));const ids=["0d9c1945-2726-5ac6-92d5-a5245f1e5e9e", "1a56a8a7-c81f-5dd2-94ac-93bc6cba8eab", "6c96a1a7-b5b5-5a41-b972-e06049c616d1", "dae7f108-cb3a-50c6-82ca-f8712f8b46f4", "d2e3a826-53d0-55c9-92eb-2522ae73f2bb", "49b2ce35-03d5-5582-9792-b0fe4308fe5f", "5caf53b7-c603-58ed-b5f2-3d47e1c98141", "dae7f108-cb3a-50c6-82ca-f8712f8b46f4", "c919366e-cff5-50a1-b0a6-45fb3072544d"];for(const id of ids)sem.set(id,'practiceAssessment');const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
function scopes(c:any,report:any,source:any,after:boolean){
  const base=join(CAP,'curricula/DE/Gymnasium/composition-views/wirtschaft');
  const entries=readdirSync(base).filter(p=>p.endsWith('.json')).map(p=>({file:join(base,p),view:JSON.parse(readFileSync(join(base,p),'utf8'))})).filter(e=>e.view.landscapeId===c.landscapeId&&e.view.scope.stage==='CrossStage');
  assert.equal(entries.length,34);
  const kinds=sem;
  const compiled=new Map(report.goals.map((g:any)=>[g.goalId,new Set(g.compiledApplicability.jurisdiction??[])]));
  const result:any[]=[];
  for(const e of entries){
    for(const jurisdiction of e.view.scope.jurisdiction?[e.view.scope.jurisdiction]:source.jurisdictions.map((j:any)=>j.jurisdiction)){
      const collect=(entry:any,includeSupport:boolean)=>{
        const filters=[entry.view.scope.courseProfile,entry.view.scope.durationModel].filter(v=>typeof v==='string'&&v);
        return new Set<string>([...collectRenderedAtomicGoalIdsFromCompositionView(c,entry.file,filters,includeSupport,'CrossStage',profile.motivationAnchorGoalIds)].filter(id=>(compiled.get(id)as Set<string>)?.has(jurisdiction)));
      };
      let target=collect(e,false),support=collect(e,true);
      if(!e.view.scope.jurisdiction){
        const authored=entries.filter(a=>a.view.scope.jurisdiction===jurisdiction&&a.view.scope.courseProfile===e.view.scope.courseProfile&&a.view.scope.durationModel===e.view.scope.durationModel);
        assert.equal(authored.length,1);
        const at=collect(authored[0],false),av=collect(authored[0],true),oldSupport=new Set([...support].filter(id=>!target.has(id)));
        target=new Set([...target].filter(id=>at.has(id)));
        support=new Set([...target,...oldSupport,...[...av].filter(id=>!at.has(id))]);
      }
      const byKind=(ids:Set<string>,kind:string)=>[...ids].filter(id=>kinds.get(id)===kind).sort();
      result.push({view:e.file.slice(CAP.length+1),jurisdiction,courseProfile:e.view.scope.courseProfile,durationModel:e.view.scope.durationModel,
        allTargetAtomicIds:[...target].sort(),allSupportAtomicIds:[...support].sort(),
        prerequisiteOnlyAtomicIds:[...support].filter(id=>!target.has(id)).sort(),
        ordinaryTargets:byKind(target,'curricularAtomic'),ordinarySupport:byKind(support,'curricularAtomic'),
        memoryTargets:byKind(target,'memory'),memorySupport:byKind(support,'memory'),
        orientationTargets:byKind(target,'orientation'),orientationSupport:byKind(support,'orientation')});
    }
  }
  assert.equal(result.length,64);
  return result.sort((a,b)=>(a.view+a.jurisdiction).localeCompare(b.view+b.jurisdiction));
}function run(label:string,ids:string[]){
 const c=land(),comp=buildApplicabilityCompilation(),report=comp.reports.find(r=>r.landscapeId===c.landscapeId)!;const route=evaluateRouteProfile(c,profile,comp),source=readJurisdictionCoverageByLandscapeId(comp).get(c.landscapeId)!;const rows=scopes(c,report,source,false);
 const materialRows=ids.map(id=>{const g=c.goals.find((g:any)=>g.id===id),cl=collectWholeMaterialPrerequisiteClosure(c,id);const cc=report.goals.find((g:any)=>g.goalId===id);return {id,wholeMaterial:g,wholeCompiledRow:cc,wholeClosure:{atomicGoalIds:[...cl.atomicGoalIds].sort(),unresolvedReferences:[...cl.unresolvedReferences].sort()},actual64Scopes:rows.map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,materialCurrentlyVisible:s.allTargetAtomicIds.includes(id),countryCompatible:(cc?.compiledApplicability.jurisdiction??[]).includes(s.jurisdiction),courseCompatible:g.tags.includes(s.courseProfile),wholeCoveredTargetsPresent:g.examData.coveredGoalIds.every((i:string)=>s.ordinaryTargets.includes(i)),wholeCoveredSupportPresent:g.examData.coveredGoalIds.every((i:string)=>s.allSupportAtomicIds.includes(i)),missingPrerequisites:[...cl.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort()}))};});
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,actualMaterials:materialRows};save(label+'.actual-native.json',result);console.log(JSON.stringify({label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},metrics:route.rules.find((r:any)=>r.id==='CQR-104').metrics}));return result;
}




const idx=JSON.parse(readFileSync(join(OUT,'actual-nine-status-two-phase-Nav-and118-authoritative-country-national-accesses.current532.fieldwise-author-index.json'),'utf8'));
copyFileSync(join(ROOT,idx.beforeCAN.path),canPath);
for(const v of idx.views)copyFileSync(join(ROOT,v.before.path),join(CAP,v.activePath));
const before=run('final-before-current532',[]);
copyFileSync(join(ROOT,idx.afterCAN.path),canPath);
for(const v of idx.views)copyFileSync(join(ROOT,v.after.path),join(CAP,v.activePath));
const after=run('final-after-current541-nine-macro118-accesses',ids);
const non=(rs:any[])=>rs.map(s=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Array.isArray(v)?v.filter(i=>sem.get(i)!=='practiceAssessment'):v])));
const atomicSource=(x:any)=>Object.fromEntries(Object.entries(x).filter(([k])=>k!=='rawAtomicGoals').map(([k,v])=>[k,k==='jurisdictions'?(v as any[]).map(j=>Object.fromEntries(Object.entries(j).filter(([n])=>!['visibleGoals','visibleClusterGoals'].includes(n)))):v]));
const metrics=(x:any)=>x.wholeRoute.rules.find((r:any)=>r.id==='CQR-104').metrics;
assert.deepEqual(non(before.all64NativeScopeSets),non(after.all64NativeScopeSets));
assert.deepEqual(atomicSource(before.wholeSource),atomicSource(after.wholeSource));
const ordinaryIds=new Set(before.all64NativeScopeSets.flatMap((s:any)=>s.ordinarySupport));assert.equal(ordinaryIds.size,336);
const bc=new Map(before.wholeCompiler.goals.map((g:any)=>[g.goalId,g]));
for(const row of after.wholeCompiler.goals){if(ordinaryIds.has(row.goalId))assert.deepEqual(row,bc.get(row.goalId));}
for(const x of [before,after]){
 assert.equal(x.wholeCompiler.summary.errors,0);assert.equal(x.wholeCompiler.summary.warnings,0);
 assert.equal(x.wholeSource.sourceAtomicGoals,2134);assert.equal(x.wholeSource.totalJurisdictions,16);assert.equal(x.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(x.wholeSource.unmappedSourceAtomicGoals,0);
 assert.equal(x.all64NativeScopeSets.reduce((n:number,s:any)=>n+s.ordinaryTargets.length,0),6974);
 assert.equal(metrics(x).wholeMaterialPrerequisiteOccurrencesMissingFromProjection,0);assert.equal(metrics(x).wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath,0);assert.equal(metrics(x).visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks,0);
}
const allBindings=after.actualMaterials.flatMap((m:any)=>m.actual64Scopes.filter((s:any)=>s.materialCurrentlyVisible).map((s:any)=>({materialId:m.id,...s})));
assert.equal(allBindings.length,210);
assert.ok(allBindings.every((s:any)=>s.countryCompatible&&s.courseCompatible&&s.wholeCoveredSupportPresent&&s.missingPrerequisites.length===0));
for(const m of after.actualMaterials){assert.ok(m.actual64Scopes.every((s:any)=>s.materialCurrentlyVisible===(s.countryCompatible&&s.courseCompatible&&s.wholeCoveredSupportPresent&&s.missingPrerequisites.length===0)));}
const nr=idx.views.find((v:any)=>v.activePath.endsWith('/de-ni-gym-economics-lk.view.json'));assert.ok(nr);
const nv=JSON.parse(readFileSync(join(ROOT,nr.after.path),'utf8'));const negativeMaterial='dae7f108-cb3a-50c6-82ca-f8712f8b46f4';const previousLength=nv.rootNodes[0].children.length;nv.rootNodes[0].children=nv.rootNodes[0].children.filter((n:any)=>!(n.kind==='goalEntry'&&n.goalId===negativeMaterial));assert.equal(nv.rootNodes[0].children.length,previousLength-1);
writeFileSync(join(OUT,'negative-one-NI-LK-whole-state-rules-endpoint-only-reference-drop.view.json'),JSON.stringify(nv,null,2)+'\n');
writeFileSync(join(CAP,nr.activePath),JSON.stringify(nv,null,2)+'\n');
let negative:any;
try {
 negative=run('final-negative-one-real-NI-LK-state-rules-endpoint-reference-drop',ids);
 assert.deepEqual(non(before.all64NativeScopeSets),non(negative.all64NativeScopeSets));assert.deepEqual(atomicSource(after.wholeSource),atomicSource(negative.wholeSource));assert.equal(negative.wholeCompiler.summary.errors,0);assert.equal(negative.wholeCompiler.summary.warnings,0);
 assert.ok(metrics(negative).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute>metrics(after).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute);
 assert.ok(negative.actualMaterials.find((m:any)=>m.id===negativeMaterial).actual64Scopes.filter((s:any)=>s.jurisdiction==='DE-NI'&&s.courseProfile==='LK').every((s:any)=>!s.materialCurrentlyVisible));
} finally {copyFileSync(join(ROOT,nr.after.path),join(CAP,nr.activePath));}
const compiledClusterChanges=after.wholeCompiler.goals.filter((g:any)=>bc.has(g.goalId)&&JSON.stringify(g)!==JSON.stringify(bc.get(g.goalId))).map((g:any)=>({goalId:g.goalId,wholeBefore:bc.get(g.goalId),wholeAfter:g}));assert.ok(compiledClusterChanges.every((x:any)=>x.wholeBefore.goalType==='cluster'));
save('actual-nine-macro118-country-national-accesses-three-native-author-summary.json',{role:'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE',beforeCompiler:before.wholeCompiler.summary,afterCompiler:after.wholeCompiler.summary,negativeCompiler:negative.wholeCompiler.summary,all64Ordinary6974SupportPOnlyMemoryOrientationWholeExact:true,all336OrdinaryCompiledRowsExact:true,sourceAtomicContract16_2134_0_0WholeExact:true,rawAtomicPracticeCountChange:{before:before.wholeSource.rawAtomicGoals,after:after.wholeSource.rawAtomicGoals,newWholePracticeGoals:9},sourceVisibleClusterCountDeltas:before.wholeSource.jurisdictions.map((b:any,i:number)=>({jurisdiction:b.jurisdiction,beforeVisibleGoals:b.visibleGoals,afterVisibleGoals:after.wholeSource.jurisdictions[i].visibleGoals,beforeClusters:b.visibleClusterGoals,afterClusters:after.wholeSource.jurisdictions[i].visibleClusterGoals})),actualExistingCompiledClusterChanges:compiledClusterChanges,beforeCQR104:metrics(before),afterCQR104:metrics(after),negativeCQR104:metrics(negative),actual210WholeEligibleNativeScopes:allBindings,newCountryRefs:105,newNationalRefs:13,newTotalPracticeRefs:118,explicitAllCoveredPOnlyCountryContexts4AndNational4:true,existingOrdinaryRolesNeverRewritten:true,new9PracticeKindsOnlyInReadonlyCollector:true,noActiveCANSEMRegistryPOrViewWrites:true,strictGoalDelta:0,wholeCQR104StillOpen:after.wholeRoute.rules.find((r:any)=>r.id==='CQR-104').status!=='PASS'});
console.log(JSON.stringify({event:'actual-three-frame-author-native-done',before:metrics(before).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,after:metrics(after).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,negative:metrics(negative).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,actualWholeCompatibleScopes:allBindings.length,compiledClusterChanges:compiledClusterChanges.length}));
