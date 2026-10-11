import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';
import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];
const binding=JSON.parse(readFileSync(join(OUT,'actual-finalV4-private-capsule-input-followup-binding.json'),'utf8'));
const index=JSON.parse(readFileSync(join(ROOT,binding.finalViewIndex),'utf8'));
const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const land=()=>JSON.parse(readFileSync(canPath,'utf8'));
const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;
const sem=new Map(JSON.parse(readFileSync(join(OUT,'whole-current-semantic-decisions.no-edits.exact.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const materialIds=['294f5721-33b8-553d-b62a-32f9a0d28f5c','0d111408-c754-50fa-8cd3-25ec75f6205f','c19ee0d7-0ab2-5c6f-8828-bc098a495b09','30ce4a89-90a6-5cb6-b5e4-db8fc4a66d33','248c0ac2-f6cf-5c61-bf62-2fecc83f05aa'];
const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
const sha=(x:any)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const setViews=(after:boolean)=>index.views.forEach((r:any)=>copyFileSync(join(ROOT,r[after?'after':'before'].path),join(CAP,r.activePath)));
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

function run(label:string){
 console.log(JSON.stringify({event:'begin-native-frame',label}));
 const c=land(),comp=buildApplicabilityCompilation(),report=comp.reports.find(r=>r.landscapeId===c.landscapeId)!;
 const route=evaluateRouteProfile(c,profile,comp),source=readJurisdictionCoverageByLandscapeId(comp).get(c.landscapeId)!;
 const rows=scopes(c,report,source,true);
 const materials=materialIds.map(id=>{const g=c.goals.find((g:any)=>g.id===id),cl=collectWholeMaterialPrerequisiteClosure(c,id);return {id,wholeMaterial:g,wholeCompiledRow:report.goals.find((g:any)=>g.goalId===id),wholeClosure:{atomicGoalIds:[...cl.atomicGoalIds].sort(),unresolvedReferences:[...cl.unresolvedReferences].sort()},actualTargetScopes:rows.filter(s=>s.allTargetAtomicIds.includes(id)).map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,missingPrerequisites:[...cl.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort(),missingCoveredGoals:g.examData.coveredGoalIds.filter((i:string)=>!s.allSupportAtomicIds.includes(i))}))};});
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,wholeFiveMaterialRows:materials,allForeignWholeCompilerReports:comp.reports.filter(r=>r.landscapeId!==c.landscapeId).map(r=>({landscapeId:r.landscapeId,wholeReportSHA256:sha(r),summary:r.summary}))};save(label+'.actual-native.json',result);console.log(JSON.stringify({event:'completed-native-frame',label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},route:route.rules.find(r=>r.id==='CQR-104')?.metrics}));return result;
}
const stripMaterials=(s:any)=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Array.isArray(v)?v.filter(id=>!materialIds.includes(id)):v]));
const before=run('before-current499-current34-qualified-main3-views');
setViews(true);
const positive=run('after-only-safe21-V4-schema-identifiers-positive');
for(const x of [before,positive]){assert.equal(x.wholeCompiler.summary.errors,0);assert.equal(x.wholeCompiler.summary.warnings,0);assert.equal(x.all64NativeScopeSets.reduce((n:any,s:any)=>n+s.ordinaryTargets.length,0),6974);assert.equal(x.wholeSource.totalJurisdictions,16);assert.equal(x.wholeSource.sourceAtomicGoals,2134);assert.equal(x.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(x.wholeSource.unmappedSourceAtomicGoals,0);}
assert.deepEqual(before.all64NativeScopeSets.map(stripMaterials),positive.all64NativeScopeSets.map(stripMaterials));
assert.deepEqual(before.all64NativeScopeSets.map(s=>s.prerequisiteOnlyAtomicIds),positive.all64NativeScopeSets.map(s=>s.prerequisiteOnlyAtomicIds));
assert.deepEqual(before.allForeignWholeCompilerReports,positive.allForeignWholeCompilerReports);
for(const r of positive.wholeFiveMaterialRows){assert.equal(r.wholeClosure.unresolvedReferences.length,0);for(const s of r.actualTargetScopes){assert.equal(s.missingPrerequisites.length,0);assert.equal(s.missingCoveredGoals.length,0);if(r.id.startsWith('c19'))assert.equal(s.courseProfile,'LK');}}
const sourceAtomicFields=['totalJurisdictions','totalAtomicGoals','coveredJurisdictions','sourceBackedJurisdictions','sourceCompleteJurisdictions','cleanJurisdictions','unsupportedAssignedAtomicGoals','sourceAtomicGoals','sourceMappedToViewAtomicGoals','unmappedSourceAtomicGoals','sourceExtractedGoals','sourceUnregisteredGoals','sourceOriginalGoals','sourceFullyCoveredOriginalGoals','sourcePartiallyCoveredOriginalGoals','sourceUncoveredOriginalGoals'];
assert.deepEqual(sourceAtomicFields.map(k=>(before.wholeSource as any)[k]),sourceAtomicFields.map(k=>(positive.wholeSource as any)[k]));
const be=index.views.find((r:any)=>r.activePath.endsWith('de-be-gym-economics-gk.view.json')),p=join(CAP,be.activePath),v=JSON.parse(readFileSync(p,'utf8'));
const supportId='87ee2b5a-8d10-51e4-a288-539e5ac251ea';let removed=0;
function dropSupport(ns:any[]){for(const n of ns){if(n.children){const old=n.children.length;n.children=n.children.filter((c:any)=>!(c.kind==='goalEntry'&&c.goalId===supportId));removed+=old-n.children.length;dropSupport(n.children);}}}
dropSupport(v.rootNodes);assert.equal(removed,1);writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const negative=run('genuine-one-BEGK-existing87ee-Ponly-support-drop-negative');
assert.equal(negative.all64NativeScopeSets.reduce((n:any,s:any)=>n+s.ordinaryTargets.length,0),6974);
assert.deepEqual(negative.all64NativeScopeSets.map(s=>s.ordinaryTargets),positive.all64NativeScopeSets.map(s=>s.ordinaryTargets));
assert.notDeepEqual(negative.all64NativeScopeSets.map(s=>s.prerequisiteOnlyAtomicIds),positive.all64NativeScopeSets.map(s=>s.prerequisiteOnlyAtomicIds));
const pm:any=positive.wholeRoute.rules.find(r=>r.id==='CQR-104')!.metrics,nm:any=negative.wholeRoute.rules.find(r=>r.id==='CQR-104')!.metrics;
assert.ok(nm.wholeMaterialPrerequisiteOccurrencesMissingFromProjection>pm.wholeMaterialPrerequisiteOccurrencesMissingFromProjection);
assert.ok(negative.wholeFiveMaterialRows[0].actualTargetScopes.some(s=>s.jurisdiction==='DE-BE'&&s.courseProfile==='GK'&&s.missingPrerequisites.includes(supportId)));
setViews(true);
const changes=positive.all64NativeScopeSets.map((r:any,i:number)=>({view:r.view,jurisdiction:r.jurisdiction,courseProfile:r.courseProfile,addedTargets:r.allTargetAtomicIds.filter((id:string)=>!before.all64NativeScopeSets[i].allTargetAtomicIds.includes(id)),removedTargets:before.all64NativeScopeSets[i].allTargetAtomicIds.filter((id:string)=>!r.allTargetAtomicIds.includes(id))})).filter(r=>r.addedTargets.length||r.removedTargets.length);
assert.ok(changes.every(r=>r.removedTargets.length===0&&r.addedTargets.every((id:string)=>materialIds.includes(id))));
save('actual-current499-safe21-native64-scope-source-and-real-support-negative.summary.json',{compilerBefore:before.wholeCompiler.summary,compilerAfter:positive.wholeCompiler.summary,all64OldNonAssessmentTargetSupportMemoryOrientationSetsExact:true,all64PrerequisiteOnlySetsExact:true,ordinary6974Exact:true,wholeSourceReportExact:sha(before.wholeSource)===sha(positive.wholeSource),wholeCompilerReportExact:sha(before.wholeCompiler)===sha(positive.wholeCompiler),sourceAtomicContract16_2134_0_0Exact:true,allForeignWholeCompilerReportsExact:true,actualScopeTargetOnlyAdditions:changes,nativeBeforeRule:before.wholeRoute.rules.find(r=>r.id==='CQR-104'),nativePositiveRule:positive.wholeRoute.rules.find(r=>r.id==='CQR-104'),actualMissingSupportNegative:{goalId:supportId,view:be.activePath,deletedReferences:removed,nativeRule:negative.wholeRoute.rules.find(r=>r.id==='CQR-104'),allOrdinaryTargetsExact:true,materialClosureActuallyFails:true},positiveWholeViewsRestored:true,wholeCANUnchanged:true,wholeSEMUnchanged:true,activeWrites:0,strictGain:0,M4OverallClaim:false,M6Claim:false,humanApproval:false});console.log(JSON.stringify({event:'completed-independent-3frames-all-contracts-PASS',actualScopeAdditions:changes.length}));
