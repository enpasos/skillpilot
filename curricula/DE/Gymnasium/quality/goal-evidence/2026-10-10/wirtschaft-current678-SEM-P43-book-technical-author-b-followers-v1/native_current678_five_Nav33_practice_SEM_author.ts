import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {fingerprintSemanticKindSourceGoal} from './goalBookModel.ts';
const O=process.argv[2],R=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const rd=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const i=rd(join(O,'actual-current678-five-native-Nav-FPs33-foreign-kind-only-author-inputs.json'));
const old=rd(join(R,i.oldSEM.path)),before=rd(join(R,i.canonicalBefore.path)),after=rd(join(R,i.canonicalCandidate.path));
const bg=new Map(before.goals.map((g:any)=>[g.id,g])),ag=new Map(after.goals.map((g:any)=>[g.id,g]));
assert.equal(old.decisions.length,645);assert.equal(after.goals.length,678);
const allowed=new Set(i.allowedChangedOldGoalIds),changed:any[]=[];
const next=structuredClone(old);next.ledgerId='wirtschaft-current678-international-operations-policy33-native-successor-20261010-v17';
for(const d of next.decisions){
 const g:any=ag.get(d.goalId);assert.ok(g);
 assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(bg.get(d.goalId)));
 const oldfp=d.sourceFingerprint,fp=fingerprintSemanticKindSourceGoal(g);
 if(fp!==oldfp){assert(allowed.has(d.goalId));changed.push({goalId:d.goalId,semanticKind:d.semanticKind,before:oldfp,after:fp});d.sourceFingerprint=fp;}
 else assert.deepEqual(g,bg.get(d.goalId));
}
assert.equal(changed.length,5);assert.deepEqual(changed.map(x=>x.goalId).sort(),[...allowed].sort());
for(const id of i.newQualifiedPracticeGoalIds){
 const g:any=ag.get(id);assert(!bg.has(id));assert.equal(g.examData.reviewStatus,'released');
 assert.equal(g.extendedData.applicabilityFromRequires,true);assert.deepEqual(g.requires,g.examData.coveredGoalIds);
 assert(i.individualKindAuthorBindings.some((x:any)=>x.materialId===id&&x.actualOnlyMachineStatusAndNoteDifference));
 next.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'});
}
next.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId));next.counts.total=678;next.counts.practiceAssessment=297;
assert.equal(next.counts.curricularAtomic,336);assert.equal(next.decisions.length,678);
for(const d of next.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(ag.get(d.goalId)));
const nd=new Map(next.decisions.map((d:any)=>[d.goalId,d]));
for(const d of old.decisions){const n:any=nd.get(d.goalId);assert.deepEqual({...n,sourceFingerprint:d.sourceFingerprint},d);if(!allowed.has(d.goalId))assert.deepEqual(n,d);}
assert.equal(next.sourceLandscapePath,i.sourceLandscapePath);
writeFileSync(join(O,'whole-current678-original640-kind-rows-five-Nav-FPs33-foreign-practice.SEM-v17-INERT.json'),JSON.stringify(next,null,2)+'\n');
writeFileSync(join(O,'actual-native-current678-old640-kind-rows-five-real-Nav-FPs33-foreign-practice-author.receipt.json'),JSON.stringify({role:'TECHNICAL_AUTHOR_NATIVE_SEM_ONLY_NO_SELF_SCOPE_OR_SCIENCE_KEEP',current678:true,all336OrdinaryWholeObjectsAndSourceFPsExact:true,old640NonNavSemanticRowsAndWholeGoalsExact:true,all645OriginalKindsDecisionStatusesBasisExact:true,changedNavSourceFingerprintBindings:changed,new33ForeignWholeQualifiedPracticeKinds:i.individualKindAuthorBindings,foreignWholeScience:i.foreignWholeScientificBindings,counts:next.counts,noHashOnlyScientificApproval:true,humanApproval:false,strictNetGain:0,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({SEM:678,ordinary:336,practice:297,NavSourceFPs:5,oldNonNavRowsExact:640}));
