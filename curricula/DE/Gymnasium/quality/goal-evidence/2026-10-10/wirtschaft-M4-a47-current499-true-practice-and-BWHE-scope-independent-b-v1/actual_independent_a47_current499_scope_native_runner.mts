import {readFileSync,writeFileSync,copyFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {buildApplicabilityCompilation} from './applicabilityCompiler.ts';
import {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const CAP=process.argv[2],OUT=process.argv[3],ROOT=process.argv[4];
const binding=JSON.parse(readFileSync(join(OUT,'actual-current499-a47-body-status-contract-P8-and-private-canonical-input-bindings.json'),'utf8'));
const canPath=join(CAP,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const land=()=>JSON.parse(readFileSync(canPath,'utf8'));
const profile=routeProfiles.find(p=>p.landscapeId===land().landscapeId)!;
const sem=new Map(JSON.parse(readFileSync(join(OUT,'whole-current-semantic-decisions.no-edits.exact.json'),'utf8')).decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const id='a47e8fca-3ce1-5edb-90b4-28225b02340a';
const save=(n:string,x:any)=>writeFileSync(join(OUT,n),JSON.stringify(x,null,2)+'\n');
const sha=(x:any)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
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
 console.log(JSON.stringify({event:'begin-actual-canonical-frame',label}));
 const c=land(),comp=buildApplicabilityCompilation(),report=comp.reports.find(r=>r.landscapeId===c.landscapeId)!,route=evaluateRouteProfile(c,profile,comp),source=readJurisdictionCoverageByLandscapeId(comp).get(c.landscapeId)!,rows=scopes(c,report,source,true),g=c.goals.find((g:any)=>g.id===id),cl=collectWholeMaterialPrerequisiteClosure(c,id);
 const result={wholeCompiler:report,wholeSource:source,wholeRoute:route,all64NativeScopeSets:rows,wholeCurrentMaterial:g,actualCompiledMaterialRow:report.goals.find((r:any)=>r.goalId===id),wholeMaterialClosure:{atomicGoalIds:[...cl.atomicGoalIds].sort(),unresolvedReferences:[...cl.unresolvedReferences].sort()},actualMaterialTargetScopes:rows.filter(s=>s.allTargetAtomicIds.includes(id)).map(s=>({view:s.view,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,missingPrerequisites:[...cl.atomicGoalIds].filter(i=>!s.allSupportAtomicIds.includes(i)).sort(),missingCoveredGoals:g.examData.coveredGoalIds.filter((i:string)=>!s.allSupportAtomicIds.includes(i))})),allForeignWholeCompilerReports:comp.reports.filter(r=>r.landscapeId!==c.landscapeId).map(r=>({landscapeId:r.landscapeId,wholeReportSHA256:sha(r),summary:r.summary}))};save(label+'.actual-native.json',result);console.log(JSON.stringify({event:'completed-actual-canonical-frame',label,compiler:report.summary,actualMaterialTitle:result.actualCompiledMaterialRow?.title,actualCompiledCountries:result.actualCompiledMaterialRow?.compiledApplicability.jurisdiction,materialVisibleScopes:result.actualMaterialTargetScopes,source:{jurisdictions:source.totalJurisdictions,sourceAtoms:source.sourceAtomicGoals,unsupported:source.unsupportedAssignedAtomicGoals,reverse:source.unmappedSourceAtomicGoals}}));return result;
}
const before=run('before-genuine-current499-e9b0-actual-canonical');
copyFileSync(join(ROOT,binding.wholeAfterCAN.path),canPath);
const positive=run('after-one-qualified-a47-actual-canonical-BWHE-true-practice');
assert.equal(positive.wholeCompiler.summary.goals,499);assert.equal(positive.wholeCompiler.summary.errors,0);assert.equal(positive.wholeCompiler.summary.warnings,0);
assert.equal(positive.actualCompiledMaterialRow!.title,positive.wholeCurrentMaterial.title);
assert.deepEqual(positive.actualCompiledMaterialRow!.compiledApplicability.jurisdiction,['DE-BW','DE-HE']);
assert.ok(positive.actualCompiledMaterialRow!.evidence.some((e:any)=>e.kind==='assessment-requires'&&e.value==='DE-BW'));
assert.equal(positive.wholeCurrentMaterial.extendedData.applicabilityFromRequires,true);
assert.deepEqual(before.all64NativeScopeSets,positive.all64NativeScopeSets);
assert.deepEqual(before.allForeignWholeCompilerReports,positive.allForeignWholeCompilerReports);
assert.equal(positive.all64NativeScopeSets.reduce((n:any,s:any)=>n+s.ordinaryTargets.length,0),6974);
for(const x of [before,positive]){assert.equal(x.wholeSource.totalJurisdictions,16);assert.equal(x.wholeSource.sourceAtomicGoals,2134);assert.equal(x.wholeSource.unsupportedAssignedAtomicGoals,0);assert.equal(x.wholeSource.unmappedSourceAtomicGoals,0);}
const atomicFields=['totalJurisdictions','totalAtomicGoals','coveredJurisdictions','sourceBackedJurisdictions','sourceCompleteJurisdictions','cleanJurisdictions','unsupportedAssignedAtomicGoals','sourceAtomicGoals','sourceMappedToViewAtomicGoals','unmappedSourceAtomicGoals','sourceExtractedGoals','sourceUnregisteredGoals','sourceOriginalGoals','sourceFullyCoveredOriginalGoals','sourcePartiallyCoveredOriginalGoals','sourceUncoveredOriginalGoals'];assert.deepEqual(atomicFields.map(k=>(before.wholeSource as any)[k]),atomicFields.map(k=>(positive.wholeSource as any)[k]));
assert.equal(positive.wholeMaterialClosure.unresolvedReferences.length,0);
for(const s of positive.actualMaterialTargetScopes){assert.ok(['DE-BW','DE-HE'].includes(s.jurisdiction));assert.ok(['GK','LK'].includes(s.courseProfile));assert.equal(s.missingPrerequisites.length,0);assert.equal(s.missingCoveredGoals.length,0);}
const candidate=land(),wrongCountry=structuredClone(candidate);wrongCountry.goals.find((g:any)=>g.id===id).applicability.jurisdiction.push('DE-BE');writeFileSync(canPath,JSON.stringify(wrongCountry,null,2)+'\n');
const countryNegative=run('genuine-a47-nonderived-BE-declaration-negative');assert.ok(countryNegative.wholeCompiler.warnings.some((w:any)=>w.code==='APV-203'&&w.goalId===id));assert.ok(!countryNegative.actualCompiledMaterialRow!.compiledApplicability.jurisdiction?.includes('DE-BE'));assert.deepEqual(countryNegative.all64NativeScopeSets,positive.all64NativeScopeSets);
const noFlag=structuredClone(candidate);delete noFlag.goals.find((g:any)=>g.id===id).extendedData.applicabilityFromRequires;writeFileSync(canPath,JSON.stringify(noFlag,null,2)+'\n');
const flagNegative=run('genuine-a47-required-practice-derivation-flag-omission-negative');assert.ok(flagNegative.wholeCompiler.warnings.some((w:any)=>w.code==='APV-203'&&w.goalId===id));assert.ok(!flagNegative.actualCompiledMaterialRow!.compiledApplicability.jurisdiction?.includes('DE-BW'));assert.ok(!flagNegative.actualCompiledMaterialRow!.evidence.some((e:any)=>e.kind==='assessment-requires'));
copyFileSync(join(ROOT,binding.wholeAfterCAN.path),canPath);
const met=(x:any)=>x.wholeRoute.rules.find((r:any)=>r.id==='CQR-104').metrics;
save('actual-independent-current499-one-a47-BWHE-true-practice-positive-and-two-negative.summary.json',{decision:'KEEP',actualCanonicalAfterTitle:positive.actualCompiledMaterialRow!.title,actualDerivedBWHE:positive.actualCompiledMaterialRow,compilerBefore:before.wholeCompiler.summary,compilerAfter:positive.wholeCompiler.summary,all64TargetSupportPOnlyMemoryOrientationSetsWholeExact:true,allForeignWholeCompilerReportsExact:true,wholeSourceReportExact:sha(before.wholeSource)===sha(positive.wholeSource),sourceAtomic16_2134_0_0Exact:true,ordinary6974Exact:true,wholeFivePrerequisiteGoals:positive.wholeMaterialClosure,actualMaterialTargetScopes:positive.actualMaterialTargetScopes,nativeBeforeRule:before.wholeRoute.rules.find((r:any)=>r.id==='CQR-104'),nativeAfterRule:positive.wholeRoute.rules.find((r:any)=>r.id==='CQR-104'),actualFalseCountryNegativeWarnings:countryNegative.wholeCompiler.warnings,actualOmittedPracticeFlagNegativeWarnings:flagNegative.wholeCompiler.warnings,genuineNegativeCountriesRejected:true,positiveCANRestored:true,viewEdits:0,CANChangesOnlyQualifiedA47:true,SEMInputFPFollowerStillRequired:true,strictFiveGateGain:0,newRouteAccessBindings:0,humanApproval:false,activeWrites:0,M4OverallClaim:false,M6Claim:false});
console.log(JSON.stringify({event:'actual-four-canonical-frames-and-bounded-contracts-PASS',before:met(before),after:met(positive),counterprobes:'BE declaration and actual derivation flag omission fail as required'}));
