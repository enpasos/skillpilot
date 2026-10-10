import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts';
import { routeProfiles, evaluateRouteProfile, readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure } from './generateCurriculumQualityStatus.ts';

const CAP=process.argv[2], OUT=process.argv[3], AFTER=process.argv[4];
const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const land=()=>JSON.parse(readFileSync(canPath,'utf8'));
const sem=new Map(JSON.parse(readFileSync(join(OUT,'whole-current-semantic-kind-decisions-for64-scope-tests.exact-input.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;
const C19='c19ee0d7-0ab2-5c6f-8828-bc098a495b09', Q2='a1c0e891-cb5b-56ef-9aa7-ac782e2099c3';
const requiredCountries=['DE-BB','DE-BW','DE-BY','DE-HE'];
const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');

function scopes(c:any,report:any,source:any){
  const base=join(CAP,'curricula/DE/Gymnasium/composition-views/wirtschaft');
  const entries=readdirSync(base).filter(p=>p.endsWith('.json')).map(p=>({file:join(base,p),view:JSON.parse(readFileSync(join(base,p),'utf8'))})).filter(e=>e.view.landscapeId===c.landscapeId&&e.view.scope.stage==='CrossStage');
  assert.equal(entries.length,34);
  const compiled=new Map(report.goals.map((g:any)=>[g.goalId,new Set(g.compiledApplicability.jurisdiction??[])]));
  const result:any[]=[];
  for(const e of entries){
    for(const jurisdiction of e.view.scope.jurisdiction?[e.view.scope.jurisdiction]:source.jurisdictions.map((j:any)=>j.jurisdiction)){
      const collect=(entry:any,includeSupport:boolean)=>{
        const filters=[entry.view.scope.courseProfile,entry.view.scope.durationModel].filter(v=>typeof v==='string'&&v);
        return new Set([...collectRenderedAtomicGoalIdsFromCompositionView(c,entry.file,filters,includeSupport,'CrossStage',profile.motivationAnchorGoalIds)].filter(id=>(compiled.get(id)as Set<string>)?.has(jurisdiction)));
      };
      let target=collect(e,false),support=collect(e,true);
      if(!e.view.scope.jurisdiction){
        const authored=entries.filter(a=>a.view.scope.jurisdiction===jurisdiction&&a.view.scope.courseProfile===e.view.scope.courseProfile&&a.view.scope.durationModel===e.view.scope.durationModel);
        assert.equal(authored.length,1);
        const at=collect(authored[0],false),av=collect(authored[0],true),oldSupport=new Set([...support].filter(id=>!target.has(id)));
        target=new Set([...target].filter(id=>at.has(id)));
        support=new Set([...target,...oldSupport,...[...av].filter(id=>!at.has(id))]);
      }
      const byKind=(ids:Set<string>,kind:string)=>[...ids].filter(id=>sem.get(id)===kind).sort();
      result.push({view:e.file.slice(CAP.length+1),jurisdiction,courseProfile:e.view.scope.courseProfile,durationModel:e.view.scope.durationModel,
        allTargetAtomicIds:[...target].sort(),allSupportAtomicIds:[...support].sort(),
        ordinaryTargets:byKind(target,'curricularAtomic'),ordinarySupport:byKind(support,'curricularAtomic'),
        memoryTargets:byKind(target,'memory'),memorySupport:byKind(support,'memory'),
        orientationTargets:byKind(target,'orientation'),orientationSupport:byKind(support,'orientation')});
    }
  }
  assert.equal(result.length,64);
  return result.sort((a,b)=>(a.view+a.jurisdiction).localeCompare(b.view+b.jurisdiction));
}

function run(label:string){
  const c=land(),compilation=buildApplicabilityCompilation();
  const report=compilation.reports.find(r=>r.landscapeId===c.landscapeId)!;
  const route=evaluateRouteProfile(c,profile,compilation);
  const source=readJurisdictionCoverageByLandscapeId(compilation).get(c.landscapeId)!;
  const byId=new Map(report.goals.map((g:any)=>[g.goalId,g]));
  const goal=c.goals.find((g:any)=>g.id===C19),parent=c.goals.find((g:any)=>g.id===Q2);
  const closure=collectWholeMaterialPrerequisiteClosure(c,C19);
  const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:scopes(c,report,source),
    otherWholeCompilerReports:compilation.reports.filter(r=>r.landscapeId!==c.landscapeId),
    wholeTwoCompilerRows:[byId.get(C19),byId.get(Q2)],
    wholeFourDirectRequiresRows:goal.requires.map((id:string)=>byId.get(id)),
    wholeFourChildRows:parent.contains.map((id:string)=>byId.get(id)),
    actualWholeC19PrerequisiteClosure:{atomicGoalIds:[...closure.atomicGoalIds].sort(),unresolvedReferences:[...closure.unresolvedReferences].sort()}};
  save(label+'.actual-native.json',result);
  console.log(JSON.stringify({label,summary:report.summary,warnings:report.findings.filter(f=>f.severity==='warning'),twoCompiledRows:result.wholeTwoCompilerRows.map((r:any)=>({goalId:r.goalId,compiled:r.compiledApplicability}))}));
  return result;
}

const before=run('before-same-whole-qualified-composition-only-APV2-old-declared-fields');
assert.equal(before.wholeCompiler.summary.errors,0);
assert.equal(before.wholeCompiler.summary.warnings,2);
assert.deepEqual(before.wholeCompiler.findings.filter(f=>f.severity==='warning').map(f=>f.goalId).sort(),[C19,Q2].sort());
copyFileSync(AFTER,canPath);
const positive=run('after-two-current-derived-fields-positive');
assert.equal(positive.wholeCompiler.summary.errors,0);
assert.equal(positive.wholeCompiler.summary.warnings,0);
assert.deepEqual(before.wholeSource,positive.wholeSource);
assert.deepEqual(before.wholeRoute,positive.wholeRoute);
assert.deepEqual(before.all64NativeScopeSets,positive.all64NativeScopeSets);
assert.deepEqual(before.otherWholeCompilerReports,positive.otherWholeCompilerReports);
assert.deepEqual(before.actualWholeC19PrerequisiteClosure,positive.actualWholeC19PrerequisiteClosure);
assert.equal(positive.actualWholeC19PrerequisiteClosure.unresolvedReferences.length,0);
for(const row of positive.wholeTwoCompilerRows)assert.deepEqual(row.compiledApplicability.jurisdiction,requiredCountries);
for(const row of positive.all64NativeScopeSets){
  if(row.allTargetAtomicIds.includes(C19)){
    assert.equal(row.courseProfile,'LK');
    assert.ok(requiredCountries.includes(row.jurisdiction));
  }
  if(row.courseProfile==='GK')assert.ok(!row.allSupportAtomicIds.includes(C19));
}

const bad=land();bad.goals.find((g:any)=>g.id===C19).applicability.jurisdiction.push('DE-BE');
writeFileSync(canPath,JSON.stringify(bad,null,2)+'\n');
const negative=run('genuine-C19-unqualified-BE-declared-country-negative');
assert.equal(negative.wholeCompiler.summary.errors,0);
assert.equal(negative.wholeCompiler.summary.warnings,1);
assert.deepEqual(negative.wholeCompiler.findings.filter(f=>f.severity==='warning').map(f=>({code:f.code,goalId:f.goalId})),[{code:'APV-203',goalId:C19}]);
assert.deepEqual(negative.wholeSource,positive.wholeSource);
assert.deepEqual(negative.wholeRoute,positive.wholeRoute);
assert.deepEqual(negative.all64NativeScopeSets,positive.all64NativeScopeSets);
assert.deepEqual(negative.otherWholeCompilerReports,positive.otherWholeCompilerReports);
assert.deepEqual(negative.wholeTwoCompilerRows[0].compiledApplicability.jurisdiction,requiredCountries);
copyFileSync(AFTER,canPath);
save('actual-two-field-native-positive-negative-and64-scope-invariance.summary.json',{
  compilerBefore:before.wholeCompiler.summary,compilerPositive:positive.wholeCompiler.summary,compilerNegative:negative.wholeCompiler.summary,
  all64OrdinarySupportMemoryOrientationAndAllAtomicSetsWholeExact:true,
  wholeSourceReportExact:true,wholeRouteResultExact:true,allForeignWholeCompilerReportsExact:true,
  compiledDerivedCountries:requiredCountries,actualVisibleC19Scopes:positive.all64NativeScopeSets.filter(r=>r.allTargetAtomicIds.includes(C19)).map(r=>({view:r.view,jurisdiction:r.jurisdiction,courseProfile:r.courseProfile})),
  actualC19FullMandatoryClosure:positive.actualWholeC19PrerequisiteClosure,
  genuineNegative:'Declared DE-BE cannot create compiled BE applicability, nor a GK C19 terminal; native APV-203 remains one real M5 warning.',
  positiveRestored:true,sourceAuthorSuccessorIndependentlyApprovedHere:false,
  ownWholeScienceRestarted:false,activeWrites:0,strictGain:0,M6Claim:false,humanApproval:false
});
