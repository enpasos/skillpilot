import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import assert from 'node:assert/strict';import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const land=()=>JSON.parse(readFileSync(canPath,'utf8'));const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;const cfg=JSON.parse(readFileSync(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'));const semPath=cfg.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften').semanticKindLedgerPath;const sem=new Map(JSON.parse(readFileSync(join(CAP,semPath),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));const ids=['b2086441-16a8-58f9-8036-49a9758c6aac'];sem.set(ids[0],'practiceAssessment');const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
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
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,actualMaterials:materialRows};save(label+'.actual-native.json',result);console.log(JSON.stringify({label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},materialClosure:materialRows.map(m=>({id:m.id,closure:m.wholeClosure,eligibleAbsent:m.actual64Scopes.filter(s=>!s.materialCurrentlyVisible&&s.countryCompatible&&s.courseCompatible&&s.wholeCoveredTargetsPresent&&s.missingPrerequisites.length===0).map(s=>({view:s.view,jurisdiction:s.jurisdiction}))}))}));return result;
}



const before=run('before-current524',[]);
const idx=JSON.parse(readFileSync(join(OUT,'actual-one-status-nav-and-eight-LK-accesses.current524-fieldwise-author-index.json'),'utf8'));
copyFileSync(join(ROOT,idx.afterCAN.path),canPath);
for(const v of idx.views)copyFileSync(join(ROOT,v.after.path),join(CAP,v.activePath));
const after=run('after-current525-eight-LK-accesses',ids);
const non=(rs:any[])=>rs.map(s=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Array.isArray(v)?v.filter(i=>sem.get(i)!=='practiceAssessment'):v])));
assert.deepEqual(non(before.all64NativeScopeSets),non(after.all64NativeScopeSets));
const atomicSource=(x:any)=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,k==='jurisdictions'?(v as any[]).map(j=>Object.fromEntries(Object.entries(j).filter(([n])=>!['visibleGoals','visibleClusterGoals','warnings','diagnosticPartialOnlyWarnings'].includes(n)))):v]));
assert.deepEqual(atomicSource(before.wholeSource),atomicSource(after.wholeSource));
const metrics=(x:any)=>x.wholeRoute.rules.find((r:any)=>r.id==='CQR-104').metrics;
for(const x of [before,after]){assert.equal(x.wholeCompiler.summary.errors,0);assert.equal(x.wholeCompiler.summary.warnings,0);assert.equal(x.wholeSource.sourceAtomicGoals,2134);assert.equal(x.wholeSource.totalJurisdictions,16);assert.equal(x.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(x.wholeSource.unmappedSourceAtomicGoals,0);assert.equal(x.all64NativeScopeSets.reduce((n:number,s:any)=>n+s.ordinaryTargets.length,0),6974);assert.equal(metrics(x).wholeMaterialPrerequisiteOccurrencesMissingFromProjection,0);}
const m=after.actualMaterials[0],valid=m.actual64Scopes.filter((s:any)=>s.materialCurrentlyVisible);assert.equal(valid.length,14);assert.ok(valid.every((s:any)=>s.courseProfile==='LK'&&s.countryCompatible&&s.courseCompatible&&s.wholeCoveredSupportPresent&&s.missingPrerequisites.length===0));assert.ok(m.actual64Scopes.every((s:any)=>s.materialCurrentlyVisible===(s.courseProfile==='LK'&&s.countryCompatible&&s.wholeCoveredTargetsPresent&&s.missingPrerequisites.length===0)));
const nr=idx.views.find((v:any)=>v.activePath.includes('de-ni-gym-economics-lk.'));assert.ok(nr);copyFileSync(join(ROOT,nr.before.path),join(CAP,nr.activePath));const negative=run('negative-delete-one-NI-LK-required-material-access',ids);assert.deepEqual(non(before.all64NativeScopeSets),non(negative.all64NativeScopeSets));assert.deepEqual(atomicSource(after.wholeSource),atomicSource(negative.wholeSource));assert.ok(metrics(negative).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute>metrics(after).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute);assert.ok(negative.actualMaterials[0].actual64Scopes.filter((s:any)=>s.jurisdiction==='DE-NI'&&s.courseProfile==='LK').every((s:any)=>!s.materialCurrentlyVisible));
copyFileSync(join(ROOT,nr.after.path),join(CAP,nr.activePath));
save('actual-one-pure-Gini-eight-LK-accesses-source64scope-and-genuine-required-drop.author-native-summary.json',{role:'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE',actualWholeCompilerBefore:before.wholeCompiler.summary,actualWholeCompilerAfter:after.wholeCompiler.summary,actualWholeCompilerNegative:negative.wholeCompiler.summary,all64Ordinary6974SupportPOnlyMemoryOrientationExact:true,sourceAtomicContract16_2134_0_0Exact:true,sourceWholeBeforeAfterExact:JSON.stringify(before.wholeSource)===JSON.stringify(after.wholeSource),fullSourceCountsAndContextDeltasAreInWholeReports:true,beforeCQR104:metrics(before),afterCQR104:metrics(after),negativeCQR104:metrics(negative),actualNewMaterialWholeClosure:m.wholeClosure,actual14WholeCompatibleLKScopes:valid,noNewGKAccess:true,actualNewPracticeKindOnlyInReadonlyCollector:true,noActiveCANSEMRegistryPOrViewWrites:true,strictGoalDelta:0});
console.log(JSON.stringify({event:'author-Gini524-525-native-done',before:metrics(before).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,after:metrics(after).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,negative:metrics(negative).visibleSelectedGoalOccurrencesMissingDirectTerminalRoute,valid14:valid.length}));
