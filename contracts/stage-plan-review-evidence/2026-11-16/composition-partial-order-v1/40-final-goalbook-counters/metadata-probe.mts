import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {resolve} from 'node:path';
const repoRoot='/home/enpasos/projects/skillpilot',out='/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-final-counters';const base=(p:string)=>JSON.parse(readFileSync(resolve(repoRoot,p),'utf8'));
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';const raw=base(canonicalPath);
const receiptPath='curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/metadata-followup/covered-strands-20261117-v1.actual.json';
const receipt=base(receiptPath),activationPath='curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/nine-offers-activation.actual.json',activation=base(activationPath);

const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
function validate(context?:{goals:any[],files:Map<string,any>}){const rawGoalById=new Map((context?.goals??raw.goals).map((g:any)=>[g.id,g]));const readJson=<T>(p:string):T=>structuredClone(context?.files.has(p)?context.files.get(p):base(p));
const ownTaskActivation = readJson<{ tasks: Array<{
  id: string; releasedPath: string; releasedSha256: string; contentReview: string
  sourceArtifactPath: string; sourceArtifactSha256: string; offeredJurisdictions: string[]
}> }>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/nine-offers-activation.actual.json')
const coveredStrandsFollowup = readJson<{
  schema: string; status: string; independentPriorApproval: { reviewer: string }
  changes: Array<{ goalId: string; beforeGoalPath: string; beforeGoalSha256: string
    currentGoalPath: string; currentGoalSha256: string
    allowedDelta: { path: string; before: string[]; after: string[] } }>
}>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/metadata-followup/covered-strands-20261117-v1.actual.json')
assert.equal(coveredStrandsFollowup.schema, 'metadata-only-assessment-covered-strands-followup-v1')
assert.equal(coveredStrandsFollowup.status, 'APPLIED_APPROVED_METADATA_ONLY')
assert.equal(coveredStrandsFollowup.independentPriorApproval.reviewer, '/root')
assert.deepEqual(coveredStrandsFollowup.changes.map(change => change.goalId).sort(compareCodePoints), [
  'a8dc0290-9f80-5763-8943-e16b8d2aa860', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
].sort(compareCodePoints))
for (const change of coveredStrandsFollowup.changes) {
  assert.deepEqual(change.allowedDelta, { path: 'examData.coveredStrands', before: [], after: ['LI_BEWEGUNG'] })
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.beforeGoalPath), 'utf8')), change.beforeGoalSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.currentGoalPath), 'utf8')), change.currentGoalSha256)
  const expected = readJson<{ examData: { coveredStrands: string[] } }>(change.beforeGoalPath)
  assert.deepEqual(expected.examData.coveredStrands, [])
  expected.examData.coveredStrands = ['LI_BEWEGUNG']
  assert.deepEqual(readJson(change.currentGoalPath), expected, `${change.goalId}: no other field may change in the followup`)
  assert.deepEqual(rawGoalById.get(change.goalId), expected, `${change.goalId}: exact separately approved current payload`)
}
assert.deepEqual(ownTaskActivation.tasks.map(task => task.id).sort(compareCodePoints), [
  '3b7b2b62-e39c-5936-b0d8-5406206e57b6', '57a03b38-5ec5-5e4f-b71a-4024bab1584c',
  '797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  '884bd99b-2373-5174-af7c-c6813b91bd93', 'bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04',
  'e6a89922-75ce-53dd-9e7b-3a683398431c', 'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
  'f602680f-ea75-5bed-ae87-72f6be34a99b',
].sort(compareCodePoints), 'exact nine independently reviewed own task offerings')
for (const row of ownTaskActivation.tasks) {
  const task = rawGoalById.get(row.id)
  assert(task, `${row.id}: released own assessment exists`)
  const acceptedRelease = readJson<{ examData: { coveredStrands: string[] } }>(row.releasedPath)
  const followup = coveredStrandsFollowup.changes.find(change => change.goalId === row.id)
  if (followup) {
    assert.deepEqual(acceptedRelease, readJson(followup.beforeGoalPath), `${row.id}: followup starts at the exact original release`)
    acceptedRelease.examData.coveredStrands = ['LI_BEWEGUNG']
  }
  assert.deepEqual(task, acceptedRelease, `${row.id}: exact accepted release plus only its separately approved strand correction`)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.releasedPath), 'utf8')), row.releasedSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.sourceArtifactPath), 'utf8')), row.sourceArtifactSha256)
  assert.equal(String(readJson<{ status: string }>(row.contentReview).status).toUpperCase(), 'PASS')
  const exam = task.examData as { reviewStatus: string; coveredGoalIds: string[] }
  assert.equal(exam.reviewStatus, 'released')
  assert.deepEqual(task.requires, exam.coveredGoalIds)
  assert.equal(exam.coveredGoalIds.length, 1)
  const extended = task.extendedData as { applicabilityFromRequires?: boolean; applicabilityMappingInheritance: string; applicabilityOverrides: { jurisdiction: string[] } }
  assert.equal(extended.applicabilityFromRequires, undefined)
  assert.equal(extended.applicabilityMappingInheritance, 'boundary')
  assert.deepEqual(extended.applicabilityOverrides.jurisdiction, row.offeredJurisdictions)
  assert.deepEqual(task.applicability, { jurisdiction: row.offeredJurisdictions })
}

}

validate();const cases=[];const mutate=(name:string,fn:(c:any)=>void)=>{const c={goals:structuredClone(raw.goals),files:new Map<string,any>()};fn(c);let error='';try{validate(c)}catch(e){error=String(e)}assert(error,name);cases.push({name,rejected:true,error});};
const editReceipt=(c:any,fn:(r:any)=>void)=>{const r=structuredClone(receipt);fn(r);c.files.set(receiptPath,r)};
mutate('wrong allowed delta field',c=>editReceipt(c,r=>r.changes[0].allowedDelta.path='requires'));
mutate('additional strand beyond exact correction',c=>editReceipt(c,r=>r.changes[0].allowedDelta.after.push('LI_ENERGIE')));
mutate('missing approved change row',c=>editReceipt(c,r=>r.changes.pop()));
mutate('foreign fourth goal granted metadata exception',c=>editReceipt(c,r=>r.changes.push({...r.changes[0],goalId:'e6a89922-75ce-53dd-9e7b-3a683398431c'})));
mutate('unapproved receipt status',c=>editReceipt(c,r=>r.status='DRAFT'));
mutate('wrong reviewed current bytes digest',c=>editReceipt(c,r=>r.changes[0].currentGoalSha256='0'.repeat(64)));
mutate('altered real prerequisite',c=>{c.goals.find((g:any)=>g.id===receipt.changes[0].goalId).requires=[]});
mutate('altered task description',c=>{c.goals.find((g:any)=>g.id===receipt.changes[0].goalId).description='different task'});
mutate('altered actual coverage goals',c=>{c.goals.find((g:any)=>g.id===receipt.changes[0].goalId).examData.coveredGoalIds=[]});
mutate('unlisted task gains strand change',c=>{c.goals.find((g:any)=>g.id==='e6a89922-75ce-53dd-9e7b-3a683398431c').examData.coveredStrands=['LI_BEWEGUNG']});
mutate('original release content substituted',c=>{const row=activation.tasks.find((r:any)=>r.id==='7cfaf48e-e420-5c09-8ec2-932f0dba4d08');const x=base(row.releasedPath);x.requires=[];c.files.set(row.releasedPath,x)});
mutate('prior goal already has a strand',c=>{const row=receipt.changes[0],x=base(row.beforeGoalPath);x.examData.coveredStrands=['LI_BEWEGUNG'];c.files.set(row.beforeGoalPath,x)});
assert.equal(sha256(readFileSync(resolve(repoRoot,'app/scripts/testPhysicsGoalBookInputs.ts'),'utf8')),'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471');
writeFileSync(out+'/metadata-negatives.actual.json',JSON.stringify({status:'PASS',testSha256:'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471',positiveRealReleaseCases:9,exactFollowupGoals:3,negativeMutations:cases},null,2)+'\n');console.log(JSON.stringify({status:'PASS',positiveRealReleaseCases:9,exactFollowupGoals:3,negativeMutations:cases.length,testSha256:'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471'}));
