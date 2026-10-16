import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const repo=resolve(process.cwd(),'..');
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-current419-original-positive-atomicity-a-20261015-v1';
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile}=await import(pathToFileURL(resolve(repo,'tmp/chemie-m7-resumed-20261015/lab15-original-pa-a-host/app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const can=JSON.parse(await readFile(resolve(repo,base,'inputs/canonical.current419.exact.json'),'utf8'));
const sem=JSON.parse(await readFile(resolve(repo,base,'inputs/semantic.current419.exact.json'),'utf8'));
const gm=new Map(can.goals.map((g:any)=>[g.id,g]));const sm=new Map(sem.decisions.map((x:any)=>[x.goalId,x.semanticKind]));
const path=resolve(repo,base,'P/fifteen.original-reviewed.profiles.jsonl');const records=(await readFile(path,'utf8')).trim().split('\n').map(JSON.parse);
const criteria='sha256:'+createHash('sha256').update(await readFile(resolve(repo,base,'inputs/chemistry-positive-criteria.exact.md'))).digest('hex');
const metadata=[];
for(const p of records){const g=gm.get(p.goalId);const k=sm.get(p.goalId);const previous={goalFingerprint:p.goalFingerprint,reviewInputFingerprint:p.reviewInputFingerprint,profileFingerprint:p.profileFingerprint,reviewCriteriaFingerprint:p.reviewCriteriaFingerprint};p.reviewCriteriaFingerprint=criteria;p.goalFingerprint=fingerprintGoalForPositiveEvidence(g,k);p.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,criteria,{},k);p.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(p.profile);metadata.push({goalId:p.goalId,previousBindings:previous,productionBindings:{goalFingerprint:p.goalFingerprint,reviewInputFingerprint:p.reviewInputFingerprint,profileFingerprint:p.profileFingerprint,reviewCriteriaFingerprint:criteria},profileContentUnchanged:previous.profileFingerprint===p.profileFingerprint,semanticKind:k,reviewedResourceTypes:[]})}
await writeFile(path,records.map((p:any)=>JSON.stringify(p)).join('\n')+'\n');
await writeFile(resolve(repo,base,'P/PRODUCTION.exact-fingerprint-bindings.json'),JSON.stringify({method:'Unchanged production fingerprint functions; bookkeeping only, no scientific vote or profile-content correction. Exact original profile contents preserved.',bindings:metadata},null,2)+'\n');
console.log(JSON.stringify({records:records.length,unchangedProfilePayloads:metadata.filter(x=>x.profileContentUnchanged).length,criteriaFingerprint:criteria}));
