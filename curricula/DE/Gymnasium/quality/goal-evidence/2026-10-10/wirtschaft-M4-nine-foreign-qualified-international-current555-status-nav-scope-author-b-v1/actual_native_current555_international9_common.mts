import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import assert from 'node:assert/strict';import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const land=()=>JSON.parse(readFileSync(canPath,'utf8'));const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;const cfg=JSON.parse(readFileSync(join(CAP,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'utf8'));const sem=new Map(JSON.parse(readFileSync(join(OUT,'whole-current555-semantic-kinds.readonly.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));const ids=["6e2a064c-8371-5130-803a-3c75171fb99a", "ceec91b6-1ef7-5145-ade5-47f8db65cc86", "b069348f-2279-5db9-a674-60c405361b3c", "9269a45c-219e-58db-b58a-f898fb1c640d", "d5f37a74-2b17-53f6-af71-5323e83813c4", "b62c29de-179d-579f-95f2-ec3314960e0b", "924d8880-3659-5b1d-b24d-73efbc64cb93", "2976423b-8ab2-5539-b8a9-849de72f466d", "dbf02f3d-e1ee-5438-b270-6f6c6b744ee3"];for(const id of ids)sem.set(id,'practiceAssessment');const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
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
