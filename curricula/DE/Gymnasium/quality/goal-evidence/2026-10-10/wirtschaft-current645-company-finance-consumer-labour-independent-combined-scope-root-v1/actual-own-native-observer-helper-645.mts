import { readFileSync, writeFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { goalMatchesFilters } from './app/src/utils/goalFilters.ts';
import { buildApplicabilityCompilation } from './app/scripts/applicabilityCompiler.ts';
import { routeProfiles, evaluateRouteProfile, readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure } from './app/scripts/generateCurriculumQualityStatus.ts';
const [cap, out, root, label] = process.argv.slice(2);
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
assert.notEqual(realpathSync(join(cap,rel)),realpathSync(join(root,rel)));
assert.notEqual(statSync(join(cap,rel)).ino,statSync(join(root,rel)).ino);
const landscape=read(join(cap,rel));
const registry=read(join(cap,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'));
const economics=registry.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften');
const kinds=new Map<string,string>(read(join(cap,economics.semanticKindLedgerPath)).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const reviewedIds:string[]=read(join(out,'whole-new48-material-ids.for-independent-native.json'));
for(const id of reviewedIds) kinds.set(id,'practiceAssessment');
const profile=routeProfiles.find((p:any)=>p.landscapeId===landscape.landscapeId)!;
assert.ok(profile);
const compilation=buildApplicabilityCompilation();
const compiler=compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)!;
const source=readJurisdictionCoverageByLandscapeId(compilation).get(landscape.landscapeId)!;
const route=evaluateRouteProfile(landscape,profile,compilation);
const jurisdictions=new Map<string,Set<string>>(compiler.goals.map((g:any)=>[g.goalId,new Set<string>(g.compiledApplicability.jurisdiction??[])]));
const viewsDir=join(cap,'curricula/DE/Gymnasium/composition-views/wirtschaft');
const views=readdirSync(viewsDir).filter(f=>f.endsWith('.json')).map(f=>({path:join(viewsDir,f),view:read(join(viewsDir,f))})).filter(x=>x.view.landscapeId===landscape.landscapeId&&x.view.scope.stage==='CrossStage');
assert.equal(views.length,34);
const rows:any[]=[];
const sorted=(xs:Iterable<string>)=>[...xs].sort();
const collect=(v:any,j:string,support:boolean)=>new Set<string>([...collectRenderedAtomicGoalIdsFromCompositionView(landscape,v.path,[v.view.scope.courseProfile,v.view.scope.durationModel].filter((x:any)=>typeof x==='string'&&x),support,'CrossStage',profile.motivationAnchorGoalIds)].filter(id=>jurisdictions.get(id)?.has(j)));
for(const v of views){
 for(const j of v.view.scope.jurisdiction?[v.view.scope.jurisdiction]:source.jurisdictions.map((x:any)=>x.jurisdiction)){
  let target=collect(v,j,false),support=collect(v,j,true);
  if(!v.view.scope.jurisdiction){
   const authority=views.filter(x=>x.view.scope.jurisdiction===j&&x.view.scope.courseProfile===v.view.scope.courseProfile&&x.view.scope.durationModel===v.view.scope.durationModel);
   assert.equal(authority.length,1);
   const at=collect(authority[0],j,false),as=collect(authority[0],j,true);
   const oldSupport=sorted(support).filter(id=>!target.has(id));
   target=new Set(sorted(target).filter(id=>at.has(id)));
   support=new Set([...target,...oldSupport,...sorted(as).filter(id=>!at.has(id))]);
  }
  const byKind=(s:Set<string>,kind:string)=>sorted(s).filter(id=>kinds.get(id)===kind);
  rows.push({viewPath:v.path.slice(cap.length+1),jurisdiction:j,courseProfile:v.view.scope.courseProfile,durationModel:v.view.scope.durationModel,
    allTargetAtomicIds:sorted(target),allSupportAtomicIds:sorted(support),prerequisiteOnlyAtomicIds:sorted(support).filter(id=>!target.has(id)),
    ordinaryTargets:byKind(target,'curricularAtomic'),ordinarySupport:byKind(support,'curricularAtomic'),memoryTargets:byKind(target,'memory'),memorySupport:byKind(support,'memory'),
    orientationTargets:byKind(target,'orientation'),orientationSupport:byKind(support,'orientation')});
 }
}
assert.equal(rows.length,64);rows.sort((a,b)=>(a.viewPath+a.jurisdiction).localeCompare(b.viewPath+b.jurisdiction));
const materialRows=landscape.goals.filter((g:any)=>reviewedIds.includes(g.id)).map((g:any)=>{
 const closure=collectWholeMaterialPrerequisiteClosure(landscape,g.id);
 return {id:g.id,wholeGoal:g,wholePrerequisiteIds:sorted(closure.atomicGoalIds),unresolvedReferences:sorted(closure.unresolvedReferences),compilerGoal:compiler.goals.find((x:any)=>x.goalId===g.id)};
});
const decisions=materialRows.flatMap((m:any)=>rows.map(s=>{
 const country=m.compilerGoal.compiledApplicability.jurisdiction.includes(s.jurisdiction);
 const course=goalMatchesFilters(m.wholeGoal,[s.courseProfile,s.durationModel].filter(Boolean));
 const missing=m.wholePrerequisiteIds.filter((id:string)=>!s.allSupportAtomicIds.includes(id));
 return {materialId:m.id,scopeKey:s.viewPath+'|'+s.jurisdiction,courseProfile:s.courseProfile,jurisdiction:s.jurisdiction,
   countryFits:country,courseFits:course,wholeMandatoryClosureIds:m.wholePrerequisiteIds,missingWholePrerequisiteIds:missing,
   coveredOrdinaryTargetIds:m.wholeGoal.examData.coveredGoalIds.filter((id:string)=>s.ordinaryTargets.includes(id)),
   coveredExistingPrerequisiteOnlyIds:m.wholeGoal.examData.coveredGoalIds.filter((id:string)=>s.prerequisiteOnlyAtomicIds.includes(id)),
   actualVisibleTarget:s.allTargetAtomicIds.includes(m.id),actualEntireClosureEligible:country&&course&&missing.length===0};
}));
const raw={role:'ROOT fresh native foreign whole scope observation; no automatic science verdict',goalCount:landscape.goals.length,compiler,source,route,all64NativeScopeRows:rows,wholeReviewedMaterialRows:materialRows,individualWholeMaterialContextBindings:decisions};
writeFileSync(join(out,label+'.raw.json.gz'),gzipSync(Buffer.from(JSON.stringify(raw,null,2)+'\n'),{level:9}));
const rule=route.rules.find((x:any)=>x.id==='CQR-104');
const summary={label,goalCount:landscape.goals.length,compiler:compiler.summary,source:{jurisdictions:source.totalJurisdictions,sourceAtomic:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,unmapped:source.unmappedSourceAtomicGoals},routeMetrics:rule.metrics,scopeRows:rows.length,materialContexts:decisions.length,actuallyVisibleNewBindings:decisions.filter(x=>x.actualVisibleTarget).length};
writeFileSync(join(out,label+'.summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
