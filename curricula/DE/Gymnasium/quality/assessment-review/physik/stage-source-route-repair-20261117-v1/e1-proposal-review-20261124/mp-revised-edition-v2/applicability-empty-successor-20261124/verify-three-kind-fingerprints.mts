import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const out=dirname(fileURLToPath(import.meta.url));let root=out;while(!existsSync(join(root,'curricula/curriculum_manifest.json'))){const parent=dirname(root);assert.notEqual(parent,root);root=parent;}
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href);
const cp=join(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),lp=join(root,'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json');
const goals=JSON.parse(readFileSync(cp,'utf8')).goals,ledger=JSON.parse(readFileSync(lp,'utf8'));const previous=JSON.parse(readFileSync(join(dirname(out),'stop-native-current-kind-check.actual.json'),'utf8'));
const rows=previous.actualStopRows.map((old:any)=>{const goal=goals.find((g:any)=>g.id===old.goalId);const actual=fingerprintSemanticKindSourceGoal(goal);assert.equal(actual,old.nativeSemanticKindSourceFingerprint);const decision=ledger.decisions.find((r:any)=>r.goalId===old.goalId);assert.equal(decision.sourceFingerprint,actual);assert.equal(decision.semanticKind,'practiceAssessment');return {...old,currentNativeFingerprint:actual,unchanged:true};});
console.log(JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),currentCanonicalRawSha256:createHash('sha256').update(readFileSync(cp)).digest('hex'),currentKindLedgerRawSha256:createHash('sha256').update(readFileSync(lp)).digest('hex'),rows},null,2));
