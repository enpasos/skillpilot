import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import assert from 'node:assert/strict';import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const land=()=>JSON.parse(readFileSync(canPath,'utf8'));const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;const cfg=JSON.parse(readFileSync(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'));const sem=new Map(JSON.parse(readFileSync(join(OUT,'whole-current555-semantic-kinds.readonly.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));const ids=["1fec367d-f9a7-533b-a9e3-a598796acaa0", "88df8d5d-5af2-5d39-a969-6b9a1473e9ed", "fcd0dcd9-8a0b-5533-b46e-78e6cdf758df", "b8350af2-542a-5e62-b729-e44756e9c9e4", "9be02a13-dad0-531c-8ce1-5629c25005df", "22dc3a85-5818-5d23-a81f-ed8401247892", "b34bfa75-3771-5670-83ce-2ecf32f74c43", "0a8fa166-cce1-558c-a1b9-237bb46b292d", "8576b291-d7ce-5d30-b578-4d417cfa25a4", "933e12c4-2d8b-5354-b620-f71e0b4f4bd4", "64fac140-ab4a-5994-97fe-cb3fef3f78bd", "f06c0ff1-a49a-57f1-8c7b-572d22a849a6", "e8d2ff1d-d9ad-5f55-b724-9dba3dfc7a54"];for(const id of ids)sem.set(id,'practiceAssessment');const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
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
}function run(label:string,selectedIds:string[]=ids){
 const c=land(),comp=buildApplicabilityCompilation(),report=comp.reports.find(r=>r.landscapeId===c.landscapeId)!;const route=evaluateRouteProfile(c,profile,comp),source=readJurisdictionCoverageByLandscapeId(comp).get(c.landscapeId)!;const rows=scopes(c,report,source,false);
 const materialRows=selectedIds.filter(id=>c.goals.some((g:any)=>g.id===id)).map(id=>{const g=c.goals.find((g:any)=>g.id===id),cl=collectWholeMaterialPrerequisiteClosure(c,id);const cc=report.goals.find((g:any)=>g.goalId===id);return {id,wholeMaterial:g,wholeCompiledRow:cc,wholeClosure:{atomicGoalIds:[...cl.atomicGoalIds].sort(),unresolvedReferences:[...cl.unresolvedReferences].sort()},actual64Scopes:rows.map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,materialCurrentlyVisible:s.allTargetAtomicIds.includes(id),countryCompatible:(cc?.compiledApplicability.jurisdiction??[]).includes(s.jurisdiction),courseCompatible:g.tags.includes(s.courseProfile),wholeCoveredTargetsPresent:g.examData.coveredGoalIds.every((i:string)=>s.ordinaryTargets.includes(i)),wholeCoveredSupportPresent:g.examData.coveredGoalIds.every((i:string)=>s.allSupportAtomicIds.includes(i)),missingPrerequisites:[...cl.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort()}))};});
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,actualMaterials:materialRows};save(label+'.actual-native.json',result);console.log(JSON.stringify({label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},metrics:route.rules.find((r:any)=>r.id==='CQR-104').metrics}));return result;
}




export {run,scopes,ids,land,canPath,CAP,OUT,ROOT,save};
