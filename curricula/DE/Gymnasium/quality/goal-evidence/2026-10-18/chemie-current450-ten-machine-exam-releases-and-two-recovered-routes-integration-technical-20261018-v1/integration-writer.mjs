// Apache-2.0. Integrate actual paired exam reviews; no new scientific vote.
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
const j=p=>JSON.parse(readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const assert=(v,m)=>{if(!v)throw Error(m);};
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';
const O=N+'/chemie-current450-ten-machine-exam-releases-and-two-recovered-routes-integration-technical-20261018-v1';
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const A10=N+'/chemie-current450-ten-draft-exam-informed-independent-a-20261018-v1/FIRST.independent-a.ten-current-exam-content-and-interface.json';
const B10=N+'/chemie-current450-ten-current-exams-informed-independent-b-20261018-v1/FIRST.informed-independent-B-ten-current-exams.json';
const A2=N+'/chemie-current450-two-existing-recycling-exams-placement-informed-independent-a-20261018-v1/FIRST.independent-a.two-exams-and-eight-view-placement.json';
const B2=N+'/chemie-current450-two-existing-recycling-exams-independent-b-20261018-v1/FIRST.independent-B-two-recycling-exams-and-placement.json';
const B2V=N+'/chemie-current450-two-existing-recycling-exams-independent-b-20261018-v1/FOLLOWUP.FIRST.exact-fourteen-practice-placements.independent-b.json';
const AUTHOR=N+'/chemie-current450-two-existing-recycling-exams-placement-author-20261018-v1';
const CHECK=N+'/chemie-current450-two-existing-recycling-exams-view-check-technical-20261018-v1/CHECK.actual-original-projection-tree-and-course-filters.json';
assert(!existsSync(O),'Never overwrite a completed integration');
assert(pin(C).sha256==='d09c746ec9393078736dcf9aabac0a0b3a22dc8756a8356c8cedb2f6d6cf866c','Unexpected canonical before');
const guards=[C,S,R,A10,B10,A2,B2,B2V,CHECK].map(pin);
const c=j(C),sem=j(S),reg=j(R),beforeC=readFileSync(C),beforeS=readFileSync(S,'utf8');
const byId=new Map(c.goals.map(g=>[g.id,g]));
const ordinary=new Set(sem.decisions.filter(d=>d.semanticKind==='curricularAtomic').map(d=>d.goalId));
assert(ordinary.size===450&&c.goals.length===662,'Scope changed');
const a10=j(A10),b10=j(B10),a2=j(A2),b2=j(B2);
assert(a10.reviewerId!==b10.reviewerId&&a2.reviewerId!==b2.reviewerId,'Distinct actual reviewers required');
const oldTen=j(N+'/chemie-current450-ten-draft-exam-neutral-current-inputs-20261018-v1/INPUT.ten-whole-current-draft-exam-goals.exact.json');
for(const g of oldTen)assert(isDeepStrictEqual(g,byId.get(g.id)),'Reviewed ten-exam input changed '+g.id);
const oldTwo=j(AUTHOR+'/INPUT.two-whole-existing-exams.exact.json.snapshot');
for(const g of oldTwo)assert(isDeepStrictEqual(g,byId.get(g.id)),'Reviewed two-exam input changed '+g.id);
const released=[];
for(const ar of a10.records){
  const br=b10.records.find(r=>r.goalId===ar.goalId);
  if(ar.decision!=='KEEP')continue;
  assert(br?.disposition.startsWith('KEEP_BOUNDED_'),'Second reviewer did not keep '+ar.goalId);
  const g=structuredClone(byId.get(ar.goalId));
  assert(g.examData.reviewStatus==='draft'&&!ordinary.has(g.id),'Only reviewed assessment release allowed');
  g.examData.reviewStatus='released';
  g.examData.reviewNote='Machine assessment-content and current interface review accepted; exact valid prior body reviews are reused where applicable. Current independent records: '+A10+' and '+B10+'. This is no human approval, actual learner execution, local practical safety clearance or whole-course mastery claim.';
  byId.set(g.id,g);released.push(g.id);
}
assert(released.length===8,'Expected exactly eight fully accepted draft releases');
for(const old of oldTwo){
  const br=b2.records.find(r=>r.goalId===old.id);
  assert(br?.decision.startsWith('KEEP_')&&br.scientificHOLD===false,'Missing actual two-exam science acceptance');
  const aKey=old.id==='c5394fb8-9411-5533-b2af-831c4c67b4be'?'c5394fb8':'id4238e88b';
  assert(a2.contentDecisions[aKey]==='KEEP'&&a2.wholeBodiesAndCurrentAssessedCPExactlyMatchOwnEarlierWholeReading===true,'Missing actual independent A acceptance');
  const g=structuredClone(old);
  g.examData.reviewStatus='released';
  g.examData.reviewNote='Machine-reviewed complete local assessment with three essential rubric axes and conjunctive 6/6 threshold. Actual independent content and placement evidence: '+A2+' and '+B2+'. No human, handling/mining safety, real-plant environmental neutrality or learner execution claim.';
  byId.set(g.id,g);released.push(g.id);
}
const cp=j(AUTHOR+'/AUTHOR.exact-additive-cluster-contains.pending.json');
assert(isDeepStrictEqual(byId.get(cp.before.id),cp.before),'Cluster changed');
byId.set(cp.proposed.id,cp.proposed);
const changed=[...released,cp.proposed.id];
for(const id of ordinary)assert(isDeepStrictEqual(byId.get(id),c.goals.find(g=>g.id===id)),'Ordinary goal changed');
const candidate={...c,goals:c.goals.map(g=>byId.get(g.id))};
const projection=j(CHECK);assert(projection.views===8&&projection.actualAddedPracticeOccurrences===14&&projection.removedTargets===0,'Actual projection check not complete');
const views=j(AUTHOR+'/AUTHOR.two-existing-exams-eight-view-placement.pending.json').records;
for(const v of views)assert(pin(v.normalView.path).sha256===v.normalView.sha256&&pin(v.candidateView.path).sha256===v.candidateView.sha256,'View drift');
// Preserve every unchanged whole goal's source bytes, not merely its parsed value.
const source=beforeC.toString('utf8'),marker='\n  "goals": [\n',start=source.indexOf(marker)+marker.length,end=source.lastIndexOf('\n  ]');
assert(start>=marker.length&&end>start,'Unexpected canonical layout');
const body=source.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index);
assert(starts.length===c.goals.length,'Goal block count differs');
let patched='';
for(let i=0;i<starts.length;i++){
  const raw=body.slice(starts[i],starts[i+1]??body.length),clean=raw.trim().replace(/,$/,'');
  const goal=JSON.parse(clean);assert(goal.id===c.goals[i].id,'Goal source order differs');
  if(!changed.includes(goal.id)){patched+=raw;continue;}
  const tail=raw.slice(raw.lastIndexOf('}')+1);
  patched+='    '+JSON.stringify(byId.get(goal.id),null,2).replace(/\n/g,'\n    ')+tail;
}
const nextC=source.slice(0,start)+patched+source.slice(end);
assert(isDeepStrictEqual(JSON.parse(nextC),candidate),'Exact candidate/source patch mismatch');
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href);
let nextS=beforeS;
for(const id of changed){
  const old=sem.decisions.find(d=>d.goalId===id);assert(old,'Missing semantic-kind row');
  const next=fingerprintSemanticKindSourceGoal(byId.get(id));
  assert(next!==old.sourceFingerprint,'Expected changed assessment/cluster source fingerprint');
  assert(nextS.split(JSON.stringify(old.sourceFingerprint)).length===2,'Ambiguous semantic source fingerprint');
  nextS=nextS.replace(JSON.stringify(old.sourceFingerprint),JSON.stringify(next));
}
const probePath='app/scripts/.__chemie450-finite-route-probe.ts';
assert(!existsSync(probePath),'A finite probe already exists');
const original='app/scripts/generateCurriculumQualityStatus.ts',originalPin=pin(original);
let beforeRoute,afterRoute;
try{
 writeFileSync(probePath,readFileSync(original,'utf8')+'\nexport { evaluateRouteProfile, routeProfiles };\n',{flag:'wx'});
 const probe=await import(pathToFileURL(resolve(probePath)).href);
 const profile=probe.routeProfiles.find(p=>p.profileId==='canonical-chemistry-sek2');
 beforeRoute=probe.evaluateRouteProfile(c,profile,{reports:[]});
 afterRoute=probe.evaluateRouteProfile(candidate,profile,{reports:[]});
}finally{unlinkSync(probePath);}
assert(pin(original).sha256===originalPin.sha256,'Actual evaluator changed');
const rule=(r,id)=>r.rules.find(x=>x.id===id);
assert(rule(beforeRoute,'CQR-101').metrics.missingTerminalPath===107&&rule(afterRoute,'CQR-101').metrics.missingTerminalPath===105,'Unexpected route recovery');
assert(rule(afterRoute,'CQR-101').metrics.missingMotivationPath===77,'Unexpected motivation change');
assert(rule(beforeRoute,'CQR-202').metrics.weakExamData===10&&rule(afterRoute,'CQR-202').metrics.weakExamData===2,'Expected only the two HE admission holds remain');
for(const p of guards)assert(pin(p.path).sha256===p.sha256,'Input drift '+p.path);
mkdirSync(O);mkdirSync(O+'/before');
writeFileSync(O+'/before/canonical.d09.exact.json.snapshot',beforeC,{flag:'wx'});
writeFileSync(O+'/before/semantic-kind.b86.exact.json.snapshot',beforeS,{flag:'wx'});
for(const v of views)writeFileSync(O+'/before/'+v.normalView.path.split('/').at(-1)+'.snapshot',readFileSync(v.normalView.path),{flag:'wx'});
writeFileSync(C,nextC);writeFileSync(S,nextS);
for(const v of views)writeFileSync(v.normalView.path,readFileSync(v.candidateView.path));
assert(pin(R).sha256===guards.find(p=>p.path===R).sha256,'Central registry changed');
const output=O+'/RECEIPT.actual-ten-reviewed-exam-releases-and-two-route-recoveries.json';
writeFileSync(output,JSON.stringify({artifactRole:'TECHNICAL_NORMAL_INTEGRATION_OF_REAL_PAIRED_EXAM_REVIEWS_NOT_NEW_SCIENCE',atUTC:new Date().toISOString(),inputs:guards,
 actualChanges:{releasedAssessmentIds:released,canonicalClusterContainsAppends:oldTwo.map(g=>g.id),views:views.length,practiceViewOccurrencesAdded:14,ordinaryGoalChanges:0,ordinaryDenominator:450,wholePChanges:0,imageChanges:0},
 canonicalBeforeArchive:pin(O+'/before/canonical.d09.exact.json.snapshot'),semanticBeforeArchive:pin(O+'/before/semantic-kind.b86.exact.json.snapshot'),canonicalAfter:pin(C),semanticAfter:pin(S),normalViewsAfter:views.map(v=>pin(v.normalView.path)),
 actualUnchangedStockEvaluator:originalPin,beforeRoute,afterRoute,
 progress:{recoveredExistingTerminalPaths:2,newOrdinaryScientificFirstCompletions:0,newScientificVotesCreatedByIntegration:0,currentMissingMotivation:77,currentMissingTerminal:105,currentDraftHEExamHolds:2},
 boundaries:{wholeCentralRun:false,M7Claim:false,CIPassClaim:false,humanApproval:false,practicalExecution:false,protectedSubjectChanges:0},
 pending:'Resolve the two genuine HE admission interfaces, remaining real terminal duties and motivation candidate; then current affected bindings and one bundled complete central validation.'},null,2)+'\n',{flag:'wx'});
const files=[output,O+'/before/canonical.d09.exact.json.snapshot',O+'/before/semantic-kind.b86.exact.json.snapshot',...views.map(v=>O+'/before/'+v.normalView.path.split('/').at(-1)+'.snapshot')];
writeFileSync(O+'/SEAL.actual-closed-normal-exam-integration.json',JSON.stringify({files:files.map(pin),normalOutputs:[pin(C),pin(S),...views.map(v=>pin(v.normalView.path))],reviewRecordsModified:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({released:released.length,ordinaryChanges:0,terminal107to105:true,weakExams10to2:true,receipt:pin(output),canonical:pin(C),semantic:pin(S)}));
