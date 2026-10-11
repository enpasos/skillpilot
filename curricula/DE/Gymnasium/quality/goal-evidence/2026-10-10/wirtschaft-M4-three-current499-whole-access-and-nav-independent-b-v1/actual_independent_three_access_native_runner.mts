import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts';
import { routeProfiles, evaluateRouteProfile, readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure } from './generateCurriculumQualityStatus.ts';

const CAP=process.argv[2], OUT=process.argv[3], ROOT=process.argv[4];
const binding=JSON.parse(readFileSync(join(OUT,'actual-own-private-capsule-and-exact-input-bindings.json'),'utf8'));
const index=JSON.parse(readFileSync(join(ROOT,binding.viewIndex),'utf8'));
const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const land=()=>JSON.parse(readFileSync(canPath,'utf8'));
const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;
const newIds=['a7bd6f96-d1bd-54e0-a2b1-cb32a87ac401','2bc079fa-0c84-58e5-8f8c-84f6081be46b','16955ace-fbb0-57db-86bd-a00f1e77614d'];
const politicalGoal='76a33679-ec6e-5f0e-b3e3-fdbfa4674a3b';
const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
const sha=(x:any)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const sem=(after:boolean)=>new Map(JSON.parse(readFileSync(join(OUT,after?'whole-after-semantic-decisions.exact.json':'whole-before-semantic-decisions.exact.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const setViews=(candidate:boolean)=>index.views.forEach((v:any)=>copyFileSync(join(ROOT,v[candidate?'candidate':'currentBefore'].path),join(CAP,v.activePath)));

function scopes(c:any,report:any,source:any,after:boolean){
  const base=join(CAP,'curricula/DE/Gymnasium/composition-views/wirtschaft');
  const entries=readdirSync(base).filter(p=>p.endsWith('.json')).map(p=>({file:join(base,p),view:JSON.parse(readFileSync(join(base,p),'utf8'))})).filter(e=>e.view.landscapeId===c.landscapeId&&e.view.scope.stage==='CrossStage');
  assert.equal(entries.length,34);
  const kinds=sem(after);
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

function run(label:string,after:boolean){
  console.log(JSON.stringify({event:'begin-native-frame',label}));
  const c=land(),compilation=buildApplicabilityCompilation();
  const report=compilation.reports.find(r=>r.landscapeId===c.landscapeId)!;
  const route=evaluateRouteProfile(c,profile,compilation);
  const source=readJurisdictionCoverageByLandscapeId(compilation).get(c.landscapeId)!;
  const scopeRows=scopes(c,report,source,after);
  const rows=newIds.filter(id=>c.goals.some((g:any)=>g.id===id)).map(id=>{
    const g=c.goals.find((g:any)=>g.id===id),closure=collectWholeMaterialPrerequisiteClosure(c,id);
    return {goalId:id,wholeGoal:g,wholeCompilerRow:report.goals.find((r:any)=>r.goalId===id),
      wholePrerequisiteClosure:{atomicGoalIds:[...closure.atomicGoalIds].sort(),unresolvedReferences:[...closure.unresolvedReferences].sort()},
      actualTargetScopes:scopeRows.filter(s=>s.allTargetAtomicIds.includes(id)).map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,
        missingWholePrerequisites:[...closure.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort(),
        missingCoveredGoals:g.examData.coveredGoalIds.filter((i:string)=>!s.allSupportAtomicIds.includes(i)).sort()}))};
  });
  const foreignReports=compilation.reports.filter(r=>r.landscapeId!==c.landscapeId).map(r=>({landscapeId:r.landscapeId,wholeReportSHA256:sha(r),summary:r.summary}));
  const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:scopeRows,wholeThreeMaterialRows:rows,allForeignWholeCompilerReportBindings:foreignReports};
  save(label+'.actual-native.json',result);
  console.log(JSON.stringify({event:'completed-native-frame',label,compiler:report.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtomicGoals:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals},route:route.rules.find(r=>r.id==='CQR-104')?.metrics}));
  return result;
}

const withoutNew=(s:any)=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Array.isArray(v)?v.filter(id=>!newIds.includes(id)):v]));
function preservation(before:any,after:any){
  assert.deepEqual(after.all64NativeScopeSets.map(withoutNew),before.all64NativeScopeSets);
  assert.deepEqual(before.allForeignWholeCompilerReportBindings,after.allForeignWholeCompilerReportBindings);
  assert.equal(after.all64NativeScopeSets.reduce((n:any,s:any)=>n+s.ordinaryTargets.length,0),6974);
  for(const r of after.wholeThreeMaterialRows){
    assert.equal(r.wholePrerequisiteClosure.unresolvedReferences.length,0);
    assert.deepEqual(r.wholeGoal.requires,r.wholeGoal.examData.coveredGoalIds);
    assert.equal(r.wholeGoal.extendedData.applicabilityFromRequires,true);
    for(const s of r.actualTargetScopes){assert.equal(s.missingWholePrerequisites.length,0);assert.equal(s.missingCoveredGoals.length,0);assert.ok(['GK','LK'].includes(s.courseProfile));}
  }
}
const before=run('before-current496-and-current34-views',false);
assert.equal(before.wholeCompiler.summary.errors,0);assert.equal(before.wholeCompiler.summary.warnings,0);
setViews(true);copyFileSync(join(ROOT,binding.actualAfterCAN),canPath);
const positive=run('after-count-correct-current499-and62-accesses-positive',true);
assert.equal(positive.wholeCompiler.summary.errors,0);assert.equal(positive.wholeCompiler.summary.warnings,0);
preservation(before,positive);
for(const r of [before,positive]){assert.equal(r.wholeSource.totalJurisdictions,16);assert.equal(r.wholeSource.sourceAtomicGoals,2134);assert.equal(r.wholeSource.totalAtomicGoals,338);assert.equal(r.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(r.wholeSource.unmappedSourceAtomicGoals,0);}
const atomicSourceFields=['totalJurisdictions','totalAtomicGoals','coveredJurisdictions','sourceBackedJurisdictions','sourceCompleteJurisdictions','cleanJurisdictions','unsupportedAssignedAtomicGoals','sourceAtomicGoals','sourceMappedToViewAtomicGoals','unmappedSourceAtomicGoals','sourceExtractedGoals','sourceUnregisteredGoals','sourceOriginalGoals','sourceFullyCoveredOriginalGoals','sourcePartiallyCoveredOriginalGoals','sourceUncoveredOriginalGoals'];
assert.deepEqual(Object.fromEntries(atomicSourceFields.map(k=>[k,(before.wholeSource as any)[k]])),Object.fromEntries(atomicSourceFields.map(k=>[k,(positive.wholeSource as any)[k]])));
for(const j of before.wholeSource.jurisdictions){const a=positive.wholeSource.jurisdictions.find((x:any)=>x.jurisdiction===j.jurisdiction)!;
  for(const k of ['visibleAtomicGoals','viewAtomicGoals','sourceBackedAtomicGoals','unsupportedAssignedAtomicGoals','sourceAtomicGoals','sourceMappedToViewAtomicGoals','unmappedSourceAtomicGoals'])assert.deepEqual((j as any)[k],(a as any)[k]);
}
const heGK=index.views.find((v:any)=>v.activePath.endsWith('de-he-gym-economics-gk.view.json'));
const hePath=join(CAP,heGK.activePath),he=JSON.parse(readFileSync(hePath,'utf8'));
let removed=0;
function dropNew(nodes:any[]){for(const n of nodes){if(n.children){const old=n.children.length;n.children=n.children.filter((ch:any)=>!(ch.kind==='goalEntry'&&ch.goalId===newIds[0]));removed+=old-n.children.length;dropNew(n.children);}}}
dropNew(he.rootNodes);assert.equal(removed,1);writeFileSync(hePath,JSON.stringify(he,null,2)+'\n');
const missing=run('genuine-one-HE-GK-beteiligung-material-access-drop-negative',true);
assert.equal(missing.wholeCompiler.summary.errors,0);assert.equal(missing.wholeCompiler.summary.warnings,0);
assert.deepEqual(missing.all64NativeScopeSets.map(withoutNew),before.all64NativeScopeSets);
const posM:any=positive.wholeRoute.rules.find(r=>r.id==='CQR-104')!.metrics,missM:any=missing.wholeRoute.rules.find(r=>r.id==='CQR-104')!.metrics;
assert.ok(missM.visibleSelectedGoalOccurrencesMissingDirectTerminalRoute>posM.visibleSelectedGoalOccurrencesMissingDirectTerminalRoute);
assert.ok(missing.wholeThreeMaterialRows[0].actualTargetScopes.length<positive.wholeThreeMaterialRows[0].actualTargetScopes.length);
setViews(true);
const bad=land(),badGoal=bad.goals.find((g:any)=>g.id===politicalGoal);
assert.ok(badGoal.tags.includes('GK')&&badGoal.tags.includes('LK'));badGoal.tags=badGoal.tags.filter((t:string)=>t!=='GK');
writeFileSync(canPath,JSON.stringify(bad,null,2)+'\n');
const drop=run('genuine-unauthorized-existing76a-GK-course-drop-negative',true);
assert.notDeepEqual(drop.all64NativeScopeSets.map(withoutNew),before.all64NativeScopeSets);
const affected=drop.all64NativeScopeSets.filter((r:any,i:number)=>JSON.stringify(r.ordinaryTargets)!==JSON.stringify(positive.all64NativeScopeSets[i].ordinaryTargets));
assert.ok(affected.length>0);assert.ok(affected.every((r:any)=>r.courseProfile==='GK'));
assert.ok(drop.wholeThreeMaterialRows[0].actualTargetScopes.some((s:any)=>s.courseProfile==='GK'&&s.missingWholePrerequisites.includes(politicalGoal)));
const dropM:any=drop.wholeRoute.rules.find(r=>r.id==='CQR-104')!.metrics;
assert.ok(dropM.wholeMaterialPrerequisiteOccurrencesMissingFromProjection>posM.wholeMaterialPrerequisiteOccurrencesMissingFromProjection);
copyFileSync(join(ROOT,binding.actualAfterCAN),canPath);setViews(true);
save('actual-own-positive-two-real-negatives-and64-scope-preservation.summary.json',{
  compilerBefore:before.wholeCompiler.summary,compilerAfter:positive.wholeCompiler.summary,
  all64OldTargetPrerequisiteOnlyMemoryOrientationAndOrdinarySetsExact:true,ordinaryOccurrences6974:6974,
  allForeignWholeCompilerReportsExact:true,sourceAtomicContractExact16Jurisdictions2134OriginalGoals:true,
  actualAddedMaterialTargetOccurrences:positive.wholeThreeMaterialRows.map(r=>({goalId:r.goalId,occurrences:r.actualTargetScopes.length,fullClosure:r.wholePrerequisiteClosure})),
  nativeRouteBefore:before.wholeRoute.rules.find(r=>r.id==='CQR-104'),nativeRouteAfter:positive.wholeRoute.rules.find(r=>r.id==='CQR-104'),
  missingMaterialNegative:{removedActualReferences:removed,route:missing.wholeRoute.rules.find(r=>r.id==='CQR-104'),wholeScienceNotRepeated:true},
  unauthorizedCourseDropNegative:{actualGoalId:politicalGoal,actualChangedField:'tags: remove only GK',detectedOrdinaryScopeCount:affected.length,affectedScopes:affected.map(r=>({view:r.view,jurisdiction:r.jurisdiction,courseProfile:r.courseProfile})),nativeRule:drop.wholeRoute.rules.find(r=>r.id==='CQR-104')},
  positiveRestored:true,activeWrites:0,strictGain:0,M4Claim:false,M6Claim:false,humanApproval:false
});
console.log(JSON.stringify({event:'all-independent-native-positive-negative-contracts-passed',actualBeforeGoals:before.wholeCompiler.summary.goals,actualAfterGoals:positive.wholeCompiler.summary.goals,ordinaryOccurrences:6974}));
