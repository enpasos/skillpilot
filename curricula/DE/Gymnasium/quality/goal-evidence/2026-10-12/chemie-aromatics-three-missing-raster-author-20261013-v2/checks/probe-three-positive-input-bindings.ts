// Apache-2.0. Proposed image-input closure only; no P approval or active adoption.
import {readFileSync,writeFileSync}from'node:fs';
import {createHash}from'node:crypto';
import {resolve}from'node:path';
import{pathToFileURL}from'node:url';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics-three-missing-raster-author-20261013-v2';
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
async function main(){
 const m=await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href),base=read(O+'/inputs/current-three-goals.exact.json'),can=read(O+'/private-parent/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
 const old=readFileSync(A+'/author/P20.normal-v2.author-candidates.jsonl','utf8').trim().split('\n').map(JSON.parse),sem=read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),kind=new Map(sem.decisions.filter((r:any)=>r.decisionStatus==='authoritative').map((r:any)=>[r.goalId,r.semanticKind])),rows:any[]=[],errors:string[]=[];
 for(const id of base.goalIds){const g=can.goals.find((g:any)=>g.id===id),r=old.find((r:any)=>r.goalId===id),resources:Record<string,string>={};for(const l of g.resourceLinks??[]){if(l.type==='goal-visualization')resources[l.url]=hash(O+'/private-parent/app/public'+l.url);}
  const gf=m.fingerprintGoalForPositiveEvidence(g,kind.get(id)),rf=m.fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,resources,kind.get(id)),pf=m.fingerprintPositiveGoalEvidenceProfile(r.profile);const future={...r,goalFingerprint:gf,reviewInputFingerprint:rf,profileFingerprint:pf};const e=m.validatePositiveGoalEvidenceRecordSemantics(future,g,resources,kind.get(id));errors.push(...e);if(gf!==r.goalFingerprint||pf!==r.profileFingerprint||rf===r.reviewInputFingerprint)errors.push(id+': expected body/profile stable but image input changed');rows.push({goalId:id,oldGoalFingerprint:r.goalFingerprint,proposedGoalFingerprint:gf,goalFingerprintUnchanged:gf===r.goalFingerprint,profileFingerprintUnchanged:pf===r.profileFingerprint,oldReviewInputFingerprint:r.reviewInputFingerprint,proposedReviewInputFingerprint:rf,resourceDigests:resources,normalExportedSemanticsErrors:e,originalP20Unmodified:true,proposalOnly:true,requiresRootNormalRematerializationAfterIndependentImageReview:true});
 }
 writeFileSync(O+'/checks/actual-three-only-positive-image-input-delta-closure.json',JSON.stringify({schemaVersion:1,goalIds:base.goalIds,records:rows,errors,passed:errors.length===0,normalModuleBinding:{path:'app/scripts/positiveGoalEvidenceProfileModel.ts',sha256:hash('app/scripts/positiveGoalEvidenceProfileModel.ts')},sourceP20Binding:{path:A+'/author/P20.normal-v2.author-candidates.jsonl',sha256:hash(A+'/author/P20.normal-v2.author-candidates.jsonl')},imageInputFingerprintsChanged:3,semanticGoalAndProfileChanges:0,activePRecordsWritten:0,newScientificCompletions:0,independentVotes:0},null,2)+'\n');console.log(JSON.stringify({imageInputChanges:3,bodyProfileChanges:0,errors,newScientificCompletions:0}));if(errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
