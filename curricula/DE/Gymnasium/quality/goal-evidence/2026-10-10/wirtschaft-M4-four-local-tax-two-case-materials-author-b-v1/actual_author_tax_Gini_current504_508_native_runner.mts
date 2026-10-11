import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import assert from 'node:assert/strict';import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const land=()=>JSON.parse(readFileSync(canPath,'utf8'));const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;const cfg=JSON.parse(readFileSync(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'));const semPath=cfg.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften').semanticKindLedgerPath;const sem=new Map(JSON.parse(readFileSync(join(CAP,semPath),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));const mats=JSON.parse(readFileSync(join(OUT,'whole-four-intrinsic-local-tax-materials.two-cases-DRAFT-author-candidates-v1.json'),'utf8'));for(const m of mats)sem.set(m.id,'practiceAssessment');const oldIds=['81d5575e-9e1f-5389-84dd-1f6226a3b373','5721a967-0a6f-5d57-bfdc-737b11354067'];const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');const norm=(x:any)=>JSON.parse(JSON.stringify(x));
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
}
function run(label:string,ids:string[]){
 const c=land(),comp=buildApplicabilityCompilation(),report=comp.reports.find(r=>r.landscapeId===c.landscapeId)!;const route=evaluateRouteProfile(c,profile,comp),source=readJurisdictionCoverageByLandscapeId(comp).get(c.landscapeId)!;const rows=scopes(c,report,source,false);
 const materialRows=ids.map(id=>{const g=c.goals.find((g:any)=>g.id===id),cl=collectWholeMaterialPrerequisiteClosure(c,id);const cc=report.goals.find((g:any)=>g.goalId===id);return {id,wholeMaterial:g,wholeCompiledRow:cc,wholeClosure:{atomicGoalIds:[...cl.atomicGoalIds].sort(),unresolvedReferences:[...cl.unresolvedReferences].sort()},actual64Scopes:rows.map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,materialCurrentlyVisible:s.allTargetAtomicIds.includes(id),countryCompatible:(cc?.compiledApplicability.jurisdiction??[]).includes(s.jurisdiction),courseCompatible:g.tags.includes(s.courseProfile),wholeCoveredTargetsPresent:g.examData.coveredGoalIds.every((i:string)=>s.ordinaryTargets.includes(i)),wholeCoveredSupportPresent:g.examData.coveredGoalIds.every((i:string)=>s.allSupportAtomicIds.includes(i)),missingPrerequisites:[...cl.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort()}))};});
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,actualMaterials:materialRows};save(label+'.actual-native.json',result);console.log(JSON.stringify({label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},materialClosure:materialRows.map(m=>({id:m.id,closure:m.wholeClosure,eligibleAbsent:m.actual64Scopes.filter(s=>!s.materialCurrentlyVisible&&s.countryCompatible&&s.courseCompatible&&s.wholeCoveredTargetsPresent&&s.missingPrerequisites.length===0).map(s=>({view:s.view,jurisdiction:s.jurisdiction}))}))}));return result;
}
const before=run('actual-current504-Gini-two-whole-KEEP-64scope-intake',oldIds);assert.equal(before.wholeCompiler.summary.goals,504);assert.equal(before.wholeCompiler.summary.errors,0);assert.equal(before.wholeCompiler.summary.warnings,0);assert.equal(before.wholeSource.sourceAtomicGoals,2134);assert.equal(before.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(before.wholeSource.unmappedSourceAtomicGoals,0);assert.equal(before.all64NativeScopeSets.reduce((n:any,s:any)=>n+s.ordinaryTargets.length,0),6974);
copyFileSync(join(OUT,'whole-current504-plus-four-DRAFT-and-bounded-existing-nav.INERT-CAN508.json'),canPath);const draft=run('actual-inert-CAN508-four-DRAFT-64scope-eligibility-only',[...oldIds,...mats.map((m:any)=>m.id)]);assert.equal(draft.wholeCompiler.summary.goals,508);assert.equal(draft.wholeCompiler.summary.errors,0);assert.equal(draft.wholeCompiler.summary.warnings,0);assert.deepEqual(norm(before.all64NativeScopeSets),norm(draft.all64NativeScopeSets));const sourceAtomic=(x:any)=>{const y=structuredClone(x);delete y.rawAtomicGoals;for(const j of y.jurisdictions){delete j.visibleGoals;delete j.visibleClusterGoals;}return y;};assert.deepEqual(sourceAtomic(before.wholeSource),sourceAtomic(draft.wholeSource));for(const m of draft.actualMaterials)assert.equal(m.wholeClosure.unresolvedReferences.length,0);save('actual-native-current504-to508-DRAFT-only-summary.author.json',{compilerBefore:before.wholeCompiler.summary,compilerDraft:draft.wholeCompiler.summary,all64OldSetsWholeExact:true,ordinary6974Exact:true,sourceAtomic16_2134_0_0Exact:true,actualOldGiniRows:before.actualMaterials,newDraftRows:draft.actualMaterials.filter(m=>!oldIds.includes(m.id)),noReleaseOrStrictClaim:true,independentApproval:false,activeWrites:0});copyFileSync(join(OUT,'whole-current504-before-new-tax-materials.exact-inert-input.json'),canPath);
