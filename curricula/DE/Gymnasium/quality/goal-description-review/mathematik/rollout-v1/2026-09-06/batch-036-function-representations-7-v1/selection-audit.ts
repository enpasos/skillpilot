import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {loadGoalBookBuildInputs} from '../../../../../../../../../app/scripts/goalBookModel';
import {selectGoalDescriptionRolloutCandidates,buildGoalDescriptionRolloutSubsetModel,loadGoalDescriptionRolloutInFlightLedger} from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const baseConfigPath='app/scripts/config/goal-books/de-gym-math-national-atlas.json';
const inFlightPath='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json';
const outputBase="curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-036-function-representations-7-v1";
async function main(){
const registryDigest=sha(registryPath),inFlightDigest=sha(inFlightPath);
const s=json(registryPath).subjects.find((s:any)=>s.subject==='mathematik');
const indexBindings=s.resolutionIndexPaths.map((path:string)=>({path,digest:sha(path),value:json(path)}));
const done=indexBindings.flatMap((x:any)=>x.value.resolutions.map((r:any)=>r.goalId));
const positives=s.positiveEvidenceConfigPaths.map((path:string)=>({path,digest:sha(path),value:json(path)}));
const pids=positives.flatMap((p:any)=>p.value.scope.goalIds);
assert.equal(done.length,280,'Root checked D checkpoint changed');assert.equal(new Set(done).size,280);
assert.equal(pids.length,280,'Root checked P checkpoint changed');assert.equal(new Set(pids).size,280);
assert.deepEqual([...done].sort(),[...pids].sort(),'D/P checked scope changed');
const expertPaths=[
'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-034-q4-sibling-priority-17-v1.config.json',
'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-035-sibling-priority-remainder-7-v1.config.json'];
const expertIds=expertPaths.flatMap(p=>json(p).goalIds);
assert.equal(expertIds.length,24);assert.equal(new Set(expertIds).size,24);assert.ok(expertIds.every(id=>done.includes(id)),'Finished expert pool not fully in checked scope');
const held=await loadGoalDescriptionRolloutInFlightLedger(inFlightPath);
const active=held.activeBatches.filter((x:any)=>x.config.subject==='mathematik');
assert.ok(active.every((x:any)=>x.config.baseGoalBookConfigPath===baseConfigPath));
const heldIds=active.flatMap((x:any)=>x.config.goalIds);
assert.equal(heldIds.length,3);assert.ok(heldIds.every((id:string)=>!done.includes(id)));
const native=await loadGoalBookBuildInputs(baseConfigPath);
assert.equal(native.config.landscapePath,s.landscapePath);assert.equal(native.config.semanticKindLedgerPath,s.semanticKindLedgerPath);
const publishedPath='app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json';
const published=json(publishedPath);
assert.equal(published.digest,'sha256:24a5ac6024a94423a5a6cad76be3f1eeae2d904b2917f96bb7d74dd6941a3fa7');
assert.equal(native.model.digest,published.digest,'Native current source differs from published/checkpoint model');
const ledger=json(s.semanticKindLedgerPath);
const atomic=ledger.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic'&&r.decisionStatus==='authoritative').map((r:any)=>r.goalId);
assert.equal(atomic.length,796);assert.equal(new Set(atomic).size,796);assert.equal(ledger.counts.curricularAtomic,796);
assert.deepEqual([...atomic].sort(),native.model.pages.map((p:any)=>p.goalId).sort());
const landscape=json(s.landscapePath);
const selected=selectGoalDescriptionRolloutCandidates({model:native.model,completedGoalIds:new Set([...done,...heldIds]),metadataByGoalId:new Map(landscape.goals.map((g:any)=>[g.id,g])),maximumGoalCount:20,strategy:'coherent-area-phase'});
assert.equal(selected.length,7);assert.equal(selected[0].basePageNumber,197);assert.equal(selected[6].basePageNumber,203);
const config={
$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,
batchId:'mathematik-rollout-v1-batch-036-function-representations-7-v1-20260906',subject:'mathematik',subjectLabel:'Mathematik',
bookId:'de-gym-math-b036-function-representations-7-v1-20260906',title:'Mathematik – B036 Funktionsdarstellungen (7 Ziele)',
baseGoalBookConfigPath:baseConfigPath,goalIds:selected.map((x:any)=>x.goalId),outputDirectory:outputBase,feedbackBaseUrl:'https://skillpilot.com/lernziel-feedback',
promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',printDerivativeProfile:'bounded-atlas'};
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:native.model,goalIds:config.goalIds,bookId:config.bookId,title:config.title});
assert.deepEqual(subset.pages.map(p=>p.goalId),config.goalIds);
assert.equal(sha(registryPath),registryDigest,'Registry changed during selection');assert.equal(sha(inFlightPath),inFlightDigest,'Reservation state changed during selection');
console.log(JSON.stringify({checkedAt:new Date().toISOString(),grantsProgress:false,reservationCreated:false,checkpointBasis:'Root verified Math280/796 strict D280 P280 atomicity796 memory796 visualization796 issues0; guarded exact scopes, no global report rerun.',selectionStrategy:'native coherent-area-phase, max20',registryPath,registryDigest,inFlightPath,inFlightDigest,indexBindings:indexBindings.map(({path,digest}:any)=>({path,digest})),positiveConfigBindings:positives.map(({path,digest}:any)=>({path,digest})),canonicalPath:s.landscapePath,canonicalDigest:sha(s.landscapePath),semanticKindLedgerPath:s.semanticKindLedgerPath,semanticKindLedgerDigest:sha(s.semanticKindLedgerPath),nativeModelDigest:native.model.digest,publishedModelDigest:published.digest,publishedModelBytesDigest:sha(publishedPath),sourceBindings:native.model.source,atomicCount:atomic.length,completedCount:done.length,heldGoalIds:heldIds,expertPool24:{paths:expertPaths,allCompleted:true,excludedCount:24},selected,subsetValidation:{pass:true,pageCount:subset.pages.length,digest:subset.digest,prerequisiteSafe:true,modelOnly:true},config},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
