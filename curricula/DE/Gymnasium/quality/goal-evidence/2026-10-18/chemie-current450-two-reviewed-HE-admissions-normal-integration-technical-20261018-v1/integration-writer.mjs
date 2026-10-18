// Apache-2.0. Actual finite reviewed admission repair; no new body/scientific vote.
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const j=p=>JSON.parse(readFileSync(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const assert=(b,m)=>{if(!b)throw Error(m);};
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';
const O=N+'/chemie-current450-two-reviewed-HE-admissions-normal-integration-technical-20261018-v1';
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const A=N+'/chemie-current450-two-HE-course-admission-author-remedy-20261018-v1/AUTHOR.two-whole-HE-admission-successors.pending.json';
const B=N+'/chemie-current450-two-HE-admission-remedy-informed-independent-b-20261018-v1/FIRST.two-current-HE-admission-remedy.independent-B.json';
const D=N+'/chemie-current450-two-HE-admission-remedy-independent-c-20261018-v1/FIRST.actual-independent-c-two-HE-admission-remedy.json';
assert(!existsSync(O),'Do not overwrite a completed integration');
assert(pin(C).sha256==='664b6854b83f3b3d260d5bd914cac7309bb178d101a68ebf22706e9c33466573','Unexpected before canonical');
const guards=[C,S,R,A,B,D].map(pin),raw=readFileSync(C,'utf8'),semRaw=readFileSync(S,'utf8');
const c=JSON.parse(raw),sem=JSON.parse(semRaw),author=j(A),b=j(B),d=j(D);
assert(pin(A).sha256==='b648581a5d548aeadc2bc269d1f920a2b1e5216d6f93684898c35b925d7c92be','Wrong author proposal');
const ids=author.records.map(r=>r.goalId),byId=new Map(c.goals.map(g=>[g.id,g]));
const ordinary=new Set(sem.decisions.filter(x=>x.semanticKind==='curricularAtomic').map(x=>x.goalId));
assert(ids.length===2&&ordinary.size===450,'Wrong finite scope');
for(const row of author.records){
  assert(b.records.find(x=>x.goalId===row.goalId)?.decision==='KEEP_BOUNDED_CURRENT_ADMISSION_INTERFACE_HOLD_RESOLVED_FOR_THIS_CANDIDATE','Missing current B acceptance');
  assert(d.decisions.find(x=>x.goalId===row.goalId)?.decision==='ACCEPT_BOUNDED_CURRENT_COURSE_ADMISSION_INTERFACE','Missing current independent C acceptance');
  assert(isDeepStrictEqual(byId.get(row.goalId),row.beforeWholeGoal),'Reviewed whole current interface changed');
  const next=structuredClone(row.proposedWholeGoal);
  assert(isDeepStrictEqual(next.examData,row.beforeWholeGoal.examData),'Task/solution/scoring/coverage changed');
  assert(next.examData.reviewStatus==='draft'&&next.examData.coveredGoalIds.length===7,'Wrong release input');
  next.examData.reviewStatus='released';
  next.examData.reviewNote='Machine assessment body retains its exact valid historical paired content reviews; current course-admission correction accepted by two independent bounded interface checks: '+B+' and '+D+'. Prerequisites cover the current selected HE Sek-II course plus retained safety support. Passing the seven-competence 44/27 paper does not demonstrate or write mastery of the admission prerequisites. No human approval, local experiment clearance or actual learner execution is claimed.';
  byId.set(row.goalId,next);
}
for(const id of ordinary)assert(isDeepStrictEqual(byId.get(id),c.goals.find(g=>g.id===id)),'Ordinary changed');
const candidate={...c,goals:c.goals.map(g=>byId.get(g.id))};
const marker='\n  "goals": [\n',start=raw.indexOf(marker)+marker.length,end=raw.lastIndexOf('\n  ]');
const body=raw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index);
assert(starts.length===c.goals.length,'Canonical layout changed');
let patched='';
for(let i=0;i<starts.length;i++){
 const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));
 assert(g.id===c.goals[i].id,'Goal order changed');
 patched+=ids.includes(g.id)?'    '+JSON.stringify(byId.get(g.id),null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part;
}
const nextRaw=raw.slice(0,start)+patched+raw.slice(end);
assert(isDeepStrictEqual(JSON.parse(nextRaw),candidate),'Patch differs');
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href);
let nextSem=semRaw;
for(const id of ids){const before=sem.decisions.find(x=>x.goalId===id),after=fingerprintSemanticKindSourceGoal(byId.get(id));assert(nextSem.split(JSON.stringify(before.sourceFingerprint)).length===2,'Ambiguous semantic fingerprint');nextSem=nextSem.replace(JSON.stringify(before.sourceFingerprint),JSON.stringify(after));}
const original='app/scripts/generateCurriculumQualityStatus.ts',originalPin=pin(original),probePath='app/scripts/.__chemie450-finite-HE-route-probe.ts';
assert(!existsSync(probePath),'Probe exists');
let beforeRoute,afterRoute;
try{
 writeFileSync(probePath,readFileSync(original,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'});
 const probe=await import(pathToFileURL(resolve(probePath)).href),profile=probe.routeProfiles.find(p=>p.profileId==='canonical-chemistry-sek2');
 beforeRoute=probe.evaluateRouteProfile(c,profile,{reports:[]});afterRoute=probe.evaluateRouteProfile(candidate,profile,{reports:[]});
}finally{unlinkSync(probePath);}
assert(pin(original).sha256===originalPin.sha256,'Evaluator changed');
const metrics=(r,id)=>r.rules.find(x=>x.id===id).metrics;
assert(metrics(beforeRoute,'CQR-101').missingTerminalPath===105&&metrics(afterRoute,'CQR-101').missingTerminalPath===103,'Unexpected terminal impact');
assert(metrics(afterRoute,'CQR-101').missingMotivationPath===77,'Motivation changed');
assert(metrics(beforeRoute,'CQR-202').weakExamData===2&&metrics(afterRoute,'CQR-202').weakExamData===0,'Expected both last draft interfaces resolved');
for(const guard of guards)assert(pin(guard.path).sha256===guard.sha256,'Input drift');
mkdirSync(O);mkdirSync(O+'/before');
writeFileSync(O+'/before/canonical.664.exact.json.snapshot',raw,{flag:'wx'});
writeFileSync(O+'/before/semantic-kind.946.exact.json.snapshot',semRaw,{flag:'wx'});
writeFileSync(C,nextRaw);writeFileSync(S,nextSem);
assert(pin(R).sha256===guards.find(x=>x.path===R).sha256,'Central registry changed');
const out=O+'/RECEIPT.actual-two-HE-admissions-integrated.json';
writeFileSync(out,JSON.stringify({artifactRole:'TECHNICAL_NORMAL_INTEGRATION_OF_AUTHENTIC_REVIEWED_ADMISSION_REMEDY_NO_NEW_TASK_SCIENCE',atUTC:new Date().toISOString(),inputs:guards,
 actualChanges:author.records.map(r=>({goalId:r.goalId,addedAdmissionRequirements:r.appendRequiredGoalIds,admissionCount:byId.get(r.goalId).requires.length,assessedCoverageUnchanged:7,scoringUnchanged:{maxPoints:44,passingPoints:27},machineReviewStatus:'released'})),
 ordinaryWholeObjectsUnchanged:450,ordinaryRawSourceBlocksUnchanged:true,wholePositiveProfilesUnchanged:true,sourceMappingsAndViewsUnchanged:true,protectedSubjectsUnchanged:true,
 canonicalAfter:pin(C),semanticAfter:pin(S),actualUnchangedEvaluator:originalPin,beforeRoute,afterRoute,
 progress:{newOrdinaryScientificFirstCompletions:0,recoveredTerminalPaths:2,totalRecoveredThisPhase:4,currentMissingTerminal:103,currentMissingMotivation:77,weakCurrentExamData:0},
 limits:{completeCentralRerun:false,finalDContextBindingsNotYetMeasured:true,M7Claim:false,CIPassClaim:false,humanApproval:false,realPracticalPerformance:false},
 remaining:'Real terminal task packages and motivation candidate, final native context bindings, then one bundled full standard central and protected-floor check.'},null,2)+'\n',{flag:'wx'});
writeFileSync(O+'/integration-writer.mjs',readFileSync('tmp/integrate-chemie450-two-reviewed-HE-admissions.mjs'),{flag:'wx'});
const files=[out,O+'/before/canonical.664.exact.json.snapshot',O+'/before/semantic-kind.946.exact.json.snapshot',O+'/integration-writer.mjs'];
writeFileSync(O+'/SEAL.actual-closed-two-HE-integration.json',JSON.stringify({files:files.map(pin),normalOutputs:[pin(C),pin(S)],reviewRecordsModified:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({admissionCounts:ids.map(id=>byId.get(id).requires.length),weak2to0:true,terminal105to103:true,ordinaryUnchanged:450,receipt:pin(out),canonical:pin(C),semantic:pin(S)}));
