# SPDX-License-Identifier: Apache-2.0
"""Real ordinary applicability/source checks, bounded to the changed SN/ST routes."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, tempfile

R=Path.cwd(); D=Path(__file__).resolve().parent; P=D.relative_to(R).as_posix()
C=Path(tempfile.mkdtemp(prefix='skillpilot-bio-source2-ordinary-app-'))
BIO='08a43a1b-d97e-522c-9dfa-c950a493364e'
copied=[]
def bind(f):
 b=f.read_bytes();return {'path':f.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def copy(p):
 src=R/p; dest=C/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest);copied.append(bind(src))
def put(n,x):
 f=D/n;assert not f.exists(),f;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(f)
for p in ['app/package.json','app/scripts/applicabilityCompiler.ts','app/scripts/memoryCardReviewConfigDiscovery.ts','app/src/utils/jurisdictionMetadata.ts']:
 copy(p)
for f in (R/'curricula/DE/Gymnasium/canonical').glob('*.json'):copy(f.relative_to(R).as_posix())
for name in ['source-landscape-registry','canonical-goal-provenance-registry','canonical-goal-applicability-override-registry']:
 copy('curricula/DE/Gymnasium/provenance/'+name+'.json')
for f in (R/'curricula/DE').rglob('*.json'):
 if 'mapping' not in f.parts or 'quality' in f.parts:continue
 x=json.loads(f.read_text())
 if x.get('targetLandscapeId')==BIO:copy(f.relative_to(R).as_posix())
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';copy(registry)
memory=[]
for f in (R/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'):
 p=f.relative_to(R).as_posix();copy(p);memory.append(p)
for s in json.loads((R/registry).read_text())['subjects']:
 copy(s['memoryReviewConfigPath']);memory.append(s['memoryReviewConfigPath'])
for p in set(memory):
 x=json.loads((R/p).read_text())
 if x.get('reviewPath'):copy(x['reviewPath'])
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
for n in ['inputs/whole479-before.exact.json','candidate/whole479-one-digital-prerequisite-removed.inactive.json']:
 copy(P+'/'+n)
helper=r'''import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildApplicabilityCompilation as normalActive} from 'ROOT/app/scripts/applicabilityCompiler.ts'
import {buildApplicabilityCompilation as normalCapsule} from './app/scripts/applicabilityCompiler.ts'
import {collectAuthoritativeTargetAtomicGoalIds} from 'ROOT/app/scripts/compositionViewSourceCoverage.ts'
import {createReviewedRequiresClosureCoverageChecker,sourceCoverageSurrogateKey} from 'ROOT/app/scripts/sourceCoverageEvidence.ts'
const R='ROOT',P='PACKAGE',BIO='08a43a1b-d97e-522c-9dfa-c950a493364e',H='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1',Q='328fd9d3-d3c3-5731-a8da-a909143d3962'
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8')),before=read(P+'/inputs/whole479-before.exact.json'),after=read(P+'/candidate/whole479-one-digital-prerequisite-removed.inactive.json')
const actual=normalActive().reports.find(r=>r.landscapeId===BIO)!;assert.ok(actual)
const canonicalFile=actual.file;writeFileSync(resolve('.',canonicalFile),JSON.stringify(before)+'\n')
const capBefore=normalCapsule().reports.find(r=>r.landscapeId===BIO)!;assert.ok(capBefore)
const strip=(r:any)=>{const x=JSON.parse(JSON.stringify(r));delete x.file;return x}
assert.deepEqual(strip(actual),strip(capBefore),'The bounded capsule must reproduce the complete ordinary active biology report before its one-edge candidate')
writeFileSync(resolve('.',canonicalFile),JSON.stringify(after)+'\n')
for(const state of ['SN','ST']){const target='curricula/DE/Gymnasium/mapping/DE-'+state+'/lower-secondary/'+state.toLowerCase()+'_biology_lower_secondary_source_extraction_to_canonical_biology.review.json';writeFileSync(resolve('.',target),JSON.stringify(read(P+'/candidate/mappings/'+state+'-whole-reviewed-Source7-operative-path.inactive.review.json'))+'\n')}
const capAfter=normalCapsule().reports.find(r=>r.landscapeId===BIO)!;assert.ok(capAfter)
const surrogate=read('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'),surrogates=new Map<string,any[]>()
for(const e of surrogate.entries??[])if(e.status==='accepted'&&e.evidenceType==='requires-closure'&&['landscapeId','goalId','jurisdiction','requiredByGoalId','rationale'].every(k=>typeof e[k]==='string'&&e[k].trim())){const k=sourceCoverageSurrogateKey(e.landscapeId,e.goalId,e.jurisdiction);surrogates.set(k,[...(surrogates.get(k)??[]),e])}
const eligible=(g:any)=>{if(!g)return false;const t=g.tags??[];return g.nodeKind!=='memory'&&!t.includes('memorization')&&!t.some((v:string)=>v.startsWith('srs-deck:'))&&!['Practice','Assessment','Motivation','Orientation'].some(v=>t.includes(v))&&!g.examData}
const ordinary=(report:any,landscape:any,state:string,variant:string)=>{
 const jurisdiction='DE-'+state,gm=new Map(landscape.goals.map((g:any)=>[g.id,g])),viewDir='curricula/DE/Gymnasium/composition-views/biologie',wholeViews=[] as any[],targetIds=new Set<string>()
 for(const name of readdirSync(resolve(R,viewDir)).filter(n=>n.startsWith('de-'+state.toLowerCase())&&n.endsWith('.json'))){
  const actualPath=viewDir+'/'+name,isLower=name==='de-'+state.toLowerCase()+'-gym-seki-biology.view.json',operativePath=variant==='proposed-candidate'&&isLower?P+'/candidate/views/'+state+'-proposed-current.whole-only82ac-target-removed.inactive.json':actualPath,v=read(operativePath),ids=collectAuthoritativeTargetAtomicGoalIds(landscape,v);for(const id of ids)targetIds.add(id);wholeViews.push({operativePath,actualRepositoryPath:actualPath,isLower,wholeView:v,renderedAtomicTargetGoalIds:[...ids]})
 }
 const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:BIO,jurisdiction,goals:report.goals,canonicalGoalById:gm,surrogateEntriesByKey:surrogates,isEligibleCanonicalGoal:eligible}),raw=report.goals.filter((g:any)=>g.goalType==='atomic'&&targetIds.has(g.goalId)&&eligible(gm.get(g.goalId))),unsupported=raw.filter((g:any)=>!checker.hasCoverageBackedJurisdictionEvidence(g))
 return {state,jurisdiction,variant,wholeViews,viewAtomicGoalIds:raw.map((g:any)=>g.goalId),sourceBackedAtomicGoals:raw.length-unsupported.length,visibleAtomicGoals:raw.length,unsupportedAssignedAtomicGoals:unsupported.length,wholeUnsupportedGoalReports:unsupported,whole82acReport:report.goals.find((g:any)=>g.goalId===H),whole328fdReport:report.goals.find((g:any)=>g.goalId===Q),projection:report.projections.find((p:any)=>p.value===jurisdiction)}
}
const routes=[]
for(const state of ['SN','ST']){const old=ordinary(capBefore,before,state,'actual-active'),proposed=ordinary(capAfter,after,state,'proposed-candidate');assert.deepEqual(old.wholeUnsupportedGoalReports.map((g:any)=>g.goalId),['2ae2da43-73d5-578f-84f4-be0585a7d8f9']);assert.equal(proposed.unsupportedAssignedAtomicGoals,0);assert.equal(proposed.sourceBackedAtomicGoals,proposed.visibleAtomicGoals);assert.equal(proposed.projection.errors,0);assert.equal(proposed.projection.warnings,0);routes.push({actualBefore:old,proposedAfter:proposed})}
writeFileSync(resolve(R,P,'checks/ordinary-applicability-and-two-whole-jurisdiction-CQR003-predicate.v2.actual.json'),JSON.stringify({schemaVersion:1,actualNormalCompiler:'app/scripts/applicabilityCompiler.ts#buildApplicabilityCompilation',actualNormalViewTargets:'app/scripts/compositionViewSourceCoverage.ts#collectAuthoritativeTargetAtomicGoalIds',actualNormalSourceChecker:'app/scripts/sourceCoverageEvidence.ts#createReviewedRequiresClosureCoverageChecker',beforeCapsuleFullBiologyReportExactlyMatchesActualActive:true,whole479BeforeReport:capBefore,whole479CandidateAfterReport:capAfter,reviewedSource7MappingPathSuccessorsAppliedOnly:['SN','ST'],noNewMappingSemantics:true,whole2ae2TargetRetained:true,routes,sourceRegistrationAndReverseCoverageNotReevaluated:true,globalCQR003Pass:false,independentScienceApproval:false,humanApproval:false,strictGain:0,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({ordinaryFullBiologyReports:3,candidateWholeGoals:479,scopedWholeJurisdictions:routes.map((r:any)=>({state:r.proposedAfter.state,beforeUnsupported:r.actualBefore.unsupportedAssignedAtomicGoals,candidateUnsupported:r.proposedAfter.unsupportedAssignedAtomicGoals,sourceBacked:r.proposedAfter.sourceBackedAtomicGoals,visible:r.proposedAfter.visibleAtomicGoals})),globalCQR003Pass:false,activeWrites:0,strictGain:0}))
'''.replace('ROOT',str(R)).replace('PACKAGE',P)
(C/'measure.mts').write_text(helper)
result=subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(C/'measure.mts')],cwd=C,text=True,capture_output=True)
for name,content in [('stdout',result.stdout),('stderr',result.stderr)]:
 f=D/f'terminal/SN-ST-ordinary-coverage-v2.{name}.actual.txt';f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists();f.write_text(content)
put('checks/ordinary-SN-ST-coverage-v2-terminal.actual.json',{'schemaVersion':1,'command':['app/node_modules/.bin/tsx','capsule/measure.mts'],'capsulePathDiagnosticOnly':str(C),'observedExitCode':result.returncode,'stdout':bind(D/'terminal/SN-ST-ordinary-coverage-v2.stdout.actual.txt'),'stderr':bind(D/'terminal/SN-ST-ordinary-coverage-v2.stderr.actual.txt'),'exactOrdinaryCodeAndDataInputs':copied,'globalCQR003Pass':False,'independentApproval':False,'activeWrites':0})
print(result.stdout,end='');print(result.stderr,end='')
raise SystemExit(result.returncode)
