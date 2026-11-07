import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {exactMeaningEvidenceMatches,protectedAssessmentMeaning} from '/dev/shm/informatics-q2-source-scope-v3-20261107/ci/app/scripts/lib/retainedAssessmentCoverage.ts';
const R='/home/enpasos/projects/skillpilot', base='qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review', O=R+'/'+base+'/source-v3-independent-review';
const read=(p:string)=>readFileSync(R+'/'+p),hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const data=JSON.parse(readFileSync(O+'/independent-source-probe.json','utf8')),g=data.ordinary875;
const owner='7d51b38c-a149-5407-bddc-d2ce7878b020',id=g.before.id,atoms=[owner+':'+id];
const evidence:any={kind:'exact-equivalence-binding',owner,goalId:id,sourceSha256:g.sourceAfterSha256,oldMeaningSha256:g.oldProtectedMeaningSha256,newMeaningSha256:g.newProtectedMeaningSha256,atomicGoalKeys:atoms,evidencePins:[base+'/source-v3-independent-review/README.md',base+'/source-v3-independent-review/independent-source-probe.json',base+'/source-v3-independent-review/independent-scope-authority.json'].map(path=>({path,sha256:hash(read(path))})),rationale:'Only exact historical875 source/scope metadata correction: the unchanged complete hierarchy/parallelism performance, stable ID, LK tag, weight and type are retained. The old authored source record is explicitly historical and unsupported statutory applicability is withdrawn. No new assessment result, competence or whole-state duty is inferred.'};
const old=protectedAssessmentMeaning(g.before),current=protectedAssessmentMeaning(g.after);
const check=(e:any= evidence,newGoal:any=current,oldGoal:any=old,source:string=g.sourceAfterSha256,goalId:string=id,reader=read)=>exactMeaningEvidenceMatches(e,owner,goalId,source,oldGoal,newGoal,atoms,reader);
assert(check());const cases=[{case:'exact reviewed source and old/new protected definitions',matches:true}];
for(const [name,call] of [
 ['changed ordinary competency',()=>check(evidence,{...(current as any),description:'The learner can model only basic states.'})],
 ['new unreviewed metadata exemption',()=>check(evidence,{...(current as any),applicability:{jurisdiction:['DE-HE']}})],
 ['old definition changed',()=>check(evidence,current,{...(old as any),weight:0})],
 ['wrong new source frame',()=>check(evidence,current,old,g.sourceBeforeSha256)],
 ['different ordinary goal',()=>check(evidence,current,old,g.sourceAfterSha256,'7ad8caf0-3a31-56f1-bee1-574c01b0c156')],
 ['missing review artifact',()=>check(evidence,current,old,g.sourceAfterSha256,id,()=>{throw Error('missing')})],
 ['mutated review artifact',()=>check(evidence,current,old,g.sourceAfterSha256,id,()=>Buffer.from('{}'))],
 ['fewer than two review pins',()=>check({...evidence,evidencePins:evidence.evidencePins.slice(0,1)})],
] as const){assert.equal(call(),false,name);cases.push({case:name,matches:false});}
const code=readFileSync('/dev/shm/informatics-q2-source-scope-v3-20261107/ci/app/scripts/lib/retainedAssessmentCoverage.ts','utf8');assert(code.includes('const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = []'));
writeFileSync(O+'/ordinary875-binding-counterchecks.json',JSON.stringify({status:'independent exact-equivalence evidence supported; production binding not installed',oldSourceSha256:g.sourceBeforeSha256,newSourceSha256:g.sourceAfterSha256,oldGoalObjectJsonSha256:g.oldObjectJsonSha256,newGoalObjectJsonSha256:g.newObjectJsonSha256,evidenceProposal:evidence,cases,consumerLimit:'Existing exactMeaningEvidenceMatches accepts only this exact finite record. Original production retained referenced-goal comparison does not yet consume it (CCR02); the four exam rows remain held. This is no blanket metadata exemption and no retrospective material certification.',productionRegistryEmpty:true},null,2)+'\n');
console.log(JSON.stringify({cases:cases.length,exactPositive:true,negativeCases:cases.length-1,productionRegistryStillEmpty:true}));
