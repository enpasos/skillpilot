# SPDX-License-Identifier: Apache-2.0
"""Run ordinary compiler and source-coverage functions in a bounded external capsule."""
from pathlib import Path
import hashlib, json, shutil, subprocess, tempfile, datetime, time
R=Path.cwd(); B=Path(__file__).resolve().parent; BP=B.relative_to(R).as_posix()
A=B.parent/'biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1'; AP=A.relative_to(R).as_posix()
BIO='08a43a1b-d97e-522c-9dfa-c950a493364e'
C=Path(tempfile.mkdtemp(prefix='skillpilot-bio82ac328fd-source7-independent-b-'))
def bind(f): return {'path':f.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size}
copied=[]
def copy(p):
    src=R/p; dst=C/p; dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);copied.append(bind(src))
for x in json.loads((B/'operative-Source7-paths-and2ae2-context.independent-b.additive-science-FIRST.freeze.json').read_text())['bindings']:
    assert bind(R/x['path'])==x
for p in ['app/package.json','app/scripts/applicabilityCompiler.ts','app/scripts/memoryCardReviewConfigDiscovery.ts','app/src/utils/jurisdictionMetadata.ts']:copy(p)
for f in (R/'curricula/DE/Gymnasium/canonical').glob('*.json'):copy(f.relative_to(R).as_posix())
for name in ['source-landscape-registry','canonical-goal-provenance-registry','canonical-goal-applicability-override-registry']:copy('curricula/DE/Gymnasium/provenance/'+name+'.json')
for f in (R/'curricula/DE').rglob('*.json'):
    if 'mapping' not in f.parts or 'quality' in f.parts:continue
    if json.loads(f.read_text()).get('targetLandscapeId')==BIO:copy(f.relative_to(R).as_posix())
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';copy(registry)
mem=[]
for f in (R/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'):
    p=f.relative_to(R).as_posix();copy(p);mem.append(p)
for subject in json.loads((R/registry).read_text())['subjects']:copy(subject['memoryReviewConfigPath']);mem.append(subject['memoryReviewConfigPath'])
for p in set(mem):
    cfg=json.loads((R/p).read_text())
    if cfg.get('reviewPath'):copy(cfg['reviewPath'])
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
helper=r'''// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {buildApplicabilityCompilation as ordinaryActual} from 'ROOT/app/scripts/applicabilityCompiler.ts';
import {buildApplicabilityCompilation as ordinaryCapsule} from './app/scripts/applicabilityCompiler.ts';
import {collectAuthoritativeTargetAtomicGoalIds} from 'ROOT/app/scripts/compositionViewSourceCoverage.ts';
import {createReviewedRequiresClosureCoverageChecker,sourceCoverageSurrogateKey} from 'ROOT/app/scripts/sourceCoverageEvidence.ts';
const R='ROOT',AP='AUTHOR',BP='OWN',BIO='08a43a1b-d97e-522c-9dfa-c950a493364e';
const H='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1',Q='328fd9d3-d3c3-5731-a8da-a909143d3962',LOWER='26aa47b7-e5cc-5131-8980-0ec3271758b6',CLASS='2ae2da43-73d5-578f-84f4-be0585a7d8f9',KEEP='ffef97e3-12d6-5090-9816-46ab9e57fae2';
const advanced=['1e78d6eb-1f49-59c1-9617-6ea445d3fe65','9dff0360-c2e9-5e43-af8b-87e264281cf7','c2f8c542-9386-5a18-bf7e-52698b932242'];
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const digest=(x:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(x)).digest('hex');
const before=read(AP+'/inputs/whole479-before.exact.json'),after=read(AP+'/candidate/whole479-one-digital-prerequisite-removed.inactive.json');
const actual=ordinaryActual().reports.find((x:any)=>x.landscapeId===BIO)!;assert.ok(actual);
writeFileSync(resolve('.',actual.file),JSON.stringify(before)+'\n');
const capBefore=ordinaryCapsule().reports.find((x:any)=>x.landscapeId===BIO)!;
const strip=(x:any)=>{const y=JSON.parse(JSON.stringify(x));delete y.file;return y;};
assert.deepEqual(strip(actual),strip(capBefore));
writeFileSync(resolve('.',actual.file),JSON.stringify(after)+'\n');
const allOldMappings=readdirSync(resolve('.', 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary')).concat(readdirSync(resolve('.', 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary')));
const additiveBindings=[];
for(const state of ['SN','ST']){
 const source=AP+'/candidate/mappings/'+state+'-whole-reviewed-Source7-operative-path.inactive.review.json';
 const destination='curricula/DE/Gymnasium/mapping/DE-'+state+'/lower-secondary/'+state.toLowerCase()+'_biology_lower_secondary_source_extraction_to_canonical_biology.m7-reviewed-evolution-source7-20261009-v1.review.json';
 writeFileSync(resolve('.',destination),JSON.stringify(read(source))+'\n');additiveBindings.push({state,source,destination,additiveNotReplacement:true});
}
assert.equal(readdirSync(resolve('.', 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary')).concat(readdirSync(resolve('.', 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary'))).length,allOldMappings.length+2);
const capAfter=ordinaryCapsule().reports.find((x:any)=>x.landscapeId===BIO)!;
const surrogate=read('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'),surrogates=new Map<string,any[]>();
for(const e of surrogate.entries??[])if(e.status==='accepted'&&e.evidenceType==='requires-closure'&&['landscapeId','goalId','jurisdiction','requiredByGoalId','rationale'].every(k=>typeof e[k]==='string'&&e[k].trim())){const k=sourceCoverageSurrogateKey(e.landscapeId,e.goalId,e.jurisdiction);surrogates.set(k,[...(surrogates.get(k)??[]),e]);}
const eligible=(g:any)=>{if(!g)return false;const t=g.tags??[];return g.nodeKind!=='memory'&&!t.includes('memorization')&&!t.some((v:string)=>v.startsWith('srs-deck:'))&&!['Practice','Assessment','Motivation','Orientation'].some(v=>t.includes(v))&&!g.examData;};
const reportRoute=(report:any,landscape:any,state:string,proposed:boolean)=>{
 const jurisdiction='DE-'+state,gm=new Map(landscape.goals.map((g:any)=>[g.id,g])),dir='curricula/DE/Gymnasium/composition-views/biologie',views=[],targetIds=new Set<string>();
 for(const name of readdirSync(resolve(R,dir)).filter(n=>n.startsWith('de-'+state.toLowerCase())&&n.endsWith('.json'))){
  const path=dir+'/'+name,lower=name==='de-'+state.toLowerCase()+'-gym-seki-biology.view.json',actualView=read(path),snapshot=read(AP+'/inputs/current-operative-'+state+'-whole-learner-view.exact.json');
  if(lower)assert.deepEqual(actualView,snapshot);
  const candidatePath=proposed&&lower?AP+'/candidate/views/'+state+'-proposed-current.whole-only82ac-target-removed.inactive.json':path;
  const view=read(candidatePath),ids=collectAuthoritativeTargetAtomicGoalIds(landscape,view);
  if(lower&&proposed){
   const oldIds=collectAuthoritativeTargetAtomicGoalIds(before,snapshot);
   assert.deepEqual([...oldIds].filter(id=>!ids.has(id)),[H]);assert.deepEqual([...ids].filter(id=>!oldIds.has(id)),[]);
   assert.equal(ids.has(CLASS),true);assert.equal(ids.has(KEEP),true);assert.equal(ids.has(LOWER),true);assert.equal(ids.has(Q),true);
   for(const id of advanced)assert.equal(ids.has(id),false);
  }
  for(const id of ids)targetIds.add(id);
  views.push({operativePath:candidatePath,actualRepositoryPath:path,isLower:lower,atomicTargetIds:[...ids],unchangedUpperView:!lower});
 }
 const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:BIO,jurisdiction,goals:report.goals,canonicalGoalById:gm,surrogateEntriesByKey:surrogates,isEligibleCanonicalGoal:eligible});
 const rows=report.goals.filter((g:any)=>g.goalType==='atomic'&&targetIds.has(g.goalId)&&eligible(gm.get(g.goalId)));
 const unsupported=rows.filter((g:any)=>!checker.hasCoverageBackedJurisdictionEvidence(g));
 return{jurisdiction,proposed,views,visibleAtomicGoals:rows.length,sourceBackedAtomicGoals:rows.length-unsupported.length,unsupportedAssignedAtomicGoals:unsupported.length,wholeUnsupportedReports:unsupported,wholeAffectedReports:report.goals.filter((g:any)=>[H,Q,CLASS,LOWER,KEEP].includes(g.goalId)),projection:report.projections.find((p:any)=>p.value===jurisdiction)};
};
const routes=[];
for(const state of ['SN','ST']){
 const old=reportRoute(capBefore,before,state,false),current=reportRoute(capAfter,after,state,true);
 assert.deepEqual(old.wholeUnsupportedReports.map((g:any)=>g.goalId),[CLASS]);assert.equal(current.unsupportedAssignedAtomicGoals,0);assert.equal(current.sourceBackedAtomicGoals,current.visibleAtomicGoals);assert.equal(current.projection.errors,0);assert.equal(current.projection.warnings,0);routes.push({before:old,current});
}
writeFileSync(resolve(R,BP,'normal-additive-Source7-and-current-SNST-CQR003-predicate.actual.json'),JSON.stringify({schemaVersion:1,license:'CC-BY-4.0',ownAdditiveScienceFIRSTAlreadyFrozen:true,normalFunctions:['buildApplicabilityCompilation','collectAuthoritativeTargetAtomicGoalIds','createReviewedRequiresClosureCoverageChecker'],wholeActiveBiologyReportExactlyReproducedInCapsule:true,actualBeforeReportDigest:digest(strip(capBefore)),candidateAfterReportDigest:digest(strip(capAfter)),wholeCurrent479CanonWithOneRequiresDelta:true,oldOperativeMappingsAllPreserved:true,additiveReviewedSource7PathBindings:additiveBindings,routes,sourceRegistrationAndReverseCoverageNotReevaluated:true,globalCQR003Claim:false,wholeCourseScienceApproval:false,humanApproval:false,strictGain:0,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({routes:routes.map(r=>({jurisdiction:r.current.jurisdiction,beforeUnsupported:r.before.unsupportedAssignedAtomicGoals,currentUnsupported:r.current.unsupportedAssignedAtomicGoals,currentSourceBacked:r.current.sourceBackedAtomicGoals,currentTargets:r.current.visibleAtomicGoals})),only82acRemovedFromCurrentLowerViews:true,twoAe2Retained:true,ffef97e3Retained:true,threeAdvancedNotAdded:true,oldMappingsPreservedAndSource7Added:true,globalCQR003Claim:false,activeWrites:0}));
'''.replace('ROOT',str(R)).replace('AUTHOR',AP).replace('OWN',BP)
(C/'measure-independent-b.mts').write_text(helper)
at=datetime.datetime.now(datetime.timezone.utc).isoformat();start=time.monotonic();argv=[str(R/'app/node_modules/.bin/tsx'),str(C/'measure-independent-b.mts')]
result=subprocess.run(argv,cwd=C,capture_output=True,text=True)
out=B/'terminal/ordinary-additive-Source7-current-SNST.corrected-invocation.actual.json';assert not out.exists();out.write_text(json.dumps({'schemaVersion':1,'license':'CC-BY-4.0','actualArgv':argv,'actualCwdDiagnosticOnly':str(C),'startedAt':at,'elapsedSeconds':time.monotonic()-start,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr,'normalCodeAndDataInputs':copied,'globalCQR003Claim':False,'humanApproval':False,'strictGain':0,'activeWrites':0},indent=2)+'\n')
print(result.stdout);print(result.stderr[:1800]);print('EXIT',result.returncode)
raise SystemExit(result.returncode)
