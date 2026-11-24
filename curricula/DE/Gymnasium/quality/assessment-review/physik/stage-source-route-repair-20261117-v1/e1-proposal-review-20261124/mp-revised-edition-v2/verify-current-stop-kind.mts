import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const out=dirname(fileURLToPath(import.meta.url));let root=out;while(!existsSync(join(root,'curricula/curriculum_manifest.json'))){const parent=dirname(root);assert.notEqual(parent,root);root=parent;}
const {parseSemanticKindLedger,fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href);
const {loadVerifiedPrerequisiteReductionContext}=await import(pathToFileURL(join(root,'app/scripts/prerequisiteReductionProof.ts')).href);
const lp='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';
const landscape=JSON.parse(readFileSync(root+'/'+cp,'utf8')),ledger=JSON.parse(readFileSync(root+'/'+lp,'utf8'));const input=JSON.parse(readFileSync(out+'/blind-inputs/input.json','utf8'));const stop=input.metadataScenarios.find((s:any)=>s.scenario==='STOP_NO_SUCCESSOR');
const rows=stop.goals.map((expected:any)=>{const actual=landscape.goals.find((g:any)=>g.id===expected.id);assert.deepEqual(actual,expected);const decision=ledger.decisions.find((r:any)=>r.goalId===expected.id);assert.equal(decision.semanticKind,'practiceAssessment');const fingerprint=fingerprintSemanticKindSourceGoal(actual);assert.equal(decision.sourceFingerprint,fingerprint);return {goalId:actual.id,nativeSemanticKindSourceFingerprint:fingerprint,semanticKind:decision.semanticKind};});
assert.equal(landscape.goals.length,863);assert(!landscape.goals.some((g:any)=>g.id==='05cfd298-cb80-54c4-a898-b521ef270843'));
const context=await loadVerifiedPrerequisiteReductionContext();const parsed=parseSemanticKindLedger(ledger,landscape,landscape.landscapeId,cp,context);
const result={checkedAt:new Date().toISOString(),status:'PASS',validator:'native parseSemanticKindLedger with await loadVerifiedPrerequisiteReductionContext()',goalCount:landscape.goals.length,ledgerCounts:ledger.counts,nativeParserReturnKeys:Object.keys(parsed),currentCanonicalRawSha256:createHash('sha256').update(readFileSync(root+'/'+cp)).digest('hex'),currentLedgerRawSha256:createHash('sha256').update(readFileSync(root+'/'+lp)).digest('hex'),actualStopRows:rows,newAssessmentPresent:false,limits:'Native full current-kind verification only; no content acceptance, mastery write or mainCI completion.'};console.log(JSON.stringify(result,null,2));
