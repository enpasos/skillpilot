import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const R=process.cwd();
const T='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1';
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-three-recycling-current403-graph-source-integration-author-20261013-v4';
const F='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current403-four-P-normal-input-materialization-author-20261013-v1';
const stock=await import(resolve(R,'app/scripts/goalBookModel.ts'));
const positive=await import(resolve(R,'app/scripts/positiveGoalEvidenceProfileModel.ts'));
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(R,p))).digest('hex');
const write=(p:string,x:any)=>writeFileSync(resolve(R,p),JSON.stringify(x,null,2)+'\n');
const l=read(T+'/candidate/canonical531.current406.final-resources.inactive.json');
const s=read(T+'/candidate/semantic531.current406.final-resources.inactive.json');
const base=read(B+'/candidate/canonical531.current406.final-compiled.inactive.json');
const bsem=read(B+'/candidate/semantic531.current406.proposed.inactive.json');
const ids=['f9e6d689-6e59-59a4-9f21-8c2d44413244','f54b2c33-11f1-571f-aa1c-cf969cc141c4','b7ae47da-6afa-5651-977a-3139af7d6eab'];
const semChecks=[];
for(const id of ids){
 const g=l.goals.find((g:any)=>g.id===id),b=base.goals.find((g:any)=>g.id===id);
 const d=s.decisions.find((d:any)=>d.goalId===id);
 const before=stock.fingerprintSemanticKindSourceGoal(b),after=stock.fingerprintSemanticKindSourceGoal(g);
 if(d.sourceFingerprint!==before)throw Error('Base SEM fingerprint mismatch '+id);
 d.sourceFingerprint=after;
 semChecks.push({goalId:id,before,after,resourceOnlyChangeDoesNotChangeStockSourceFingerprint:before===after,decisionBodyExceptFingerprintUnchanged:JSON.stringify({...d,sourceFingerprint:before})===JSON.stringify(bsem.decisions.find((d:any)=>d.goalId===id))});
}
if(JSON.stringify(s.decisions)!==JSON.stringify(bsem.decisions))throw Error('Unexpected SEM decision drift beyond exact resource-only technical measurement');
write(T+'/candidate/semantic531.current406.final-resources.inactive.json',s);
write(T+'/checks/SEM3-stock-resource-only-fingerprint-measurement.actual.json',{stockModule:{path:'app/scripts/goalBookModel.ts',sha256:sha('app/scripts/goalBookModel.ts')},checks:semChecks,all531DecisionsExactlyUnchanged:true,newSemanticApproval:false});
const olds=readFileSync(resolve(R,F+'/positive/four-current403.ai-candidate.needs-human-review.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const assetrows=read(T+'/checks/eight-exact-publicRoot-source-assets.actual.json').assets;
const criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';
const measured=[];
for(const old of olds){
 const g=l.goals.find((g:any)=>g.id===old.goalId);
 const kind=s.decisions.find((d:any)=>d.goalId===old.goalId).semanticKind;
 const digests:any={};
 for(const link of g.resourceLinks??[]){
  if(link.type!=='goal-visualization')continue;
  const a=assetrows.find((a:any)=>a.url===link.url);
  if(!a)throw Error('Missing exact asset '+old.goalId);
  digests[link.url]=sha(a.source.path);
 }
 const goalFingerprint=positive.fingerprintGoalForPositiveEvidence(g,kind);
 const profileFingerprint=positive.fingerprintPositiveGoalEvidenceProfile(old.profile);
 const reviewInputFingerprint=positive.fingerprintPositiveGoalEvidenceReviewInput(g,sha(criteria),digests,kind);
 const semanticErrors=positive.validatePositiveGoalEvidenceRecordSemantics(old,g,digests,kind);
 const x={goalId:old.goalId,goalFingerprint,profileFingerprint,reviewInputFingerprint,goalFingerprintMatchesSealedP4:goalFingerprint===old.goalFingerprint,profileFingerprintMatchesSealedP4:profileFingerprint===old.profileFingerprint,reviewInputFingerprintMatchesSealedP4:reviewInputFingerprint===old.reviewInputFingerprint,resourceDigests:digests,status:old.status,reviewAuthority:old.reviewAuthority,semanticErrors};
 if(!x.goalFingerprintMatchesSealedP4||!x.profileFingerprintMatchesSealedP4||!x.reviewInputFingerprintMatchesSealedP4||semanticErrors.length)throw Error('P4 carryover is not exact '+JSON.stringify(x));
 measured.push(x);
}
write(T+'/checks/P4-current406-stock-goal-profile-resource-identity.actual.json',{result:'Four sealed candidate records retain exact current406 goal/profile/resource input bindings',checks:measured,originalScientificReviewReferences:F+'/INPUTS.exact-production-and-reviewed-content.bindings.json',sourceRecordsSha256:sha(F+'/positive/four-current403.ai-candidate.needs-human-review.jsonl'),retainedRecordsSha256:sha(T+'/positive/four-current406.exact-retained.ai-candidate.needs-human-review.jsonl'),newScientificApproval:false,hashOnlyScientificApproval:false});
console.log('Stock SEM3 recomputed unchanged; P4 goal/profile/resource fingerprints all exact; no new scientific approval.');
