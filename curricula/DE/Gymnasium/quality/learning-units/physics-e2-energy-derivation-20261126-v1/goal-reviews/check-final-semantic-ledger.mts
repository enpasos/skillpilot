// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url));const root=resolve(base,'../../../../../../..');
const {parseSemanticKindLedger}=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href);
const {loadVerifiedPrerequisiteReductionContext,verifiedPrerequisiteReductionSummary}=await import(pathToFileURL(resolve(root,'app/scripts/prerequisiteReductionProof.ts')).href);
const startedAt=new Date().toISOString();const catalogPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';const ledgerPath='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json';const catBytes=readFileSync(resolve(root,catalogPath));const ledgerBytes=readFileSync(resolve(root,ledgerPath));const catalog=JSON.parse(catBytes.toString());const ledger=JSON.parse(ledgerBytes.toString());
const context=await loadVerifiedPrerequisiteReductionContext();parseSemanticKindLedger(ledger,catalog,catalog.landscapeId,catalogPath,context);assert.deepEqual(ledger.decisions.map((r:any)=>r.goalId),catalog.goals.map((g:any)=>g.id));assert.equal(ledger.decisions.find((r:any)=>r.goalId==='0cf2a5b0-8660-578d-8316-2b8a50fbdff7').decisionBasis,'reviewed-current-post-split-practice-assessment');assert.equal(readFileSync(resolve(root,ledgerPath)).toString(),ledgerBytes.toString());
const sha=(v:Buffer)=>'sha256:'+createHash('sha256').update(v).digest('hex');const result={schemaVersion:1,contract:'task-n-final-semantic-native-truth-check-v1',startedAt,completedAt:new Date().toISOString(),nativeFunction:'app/scripts/goalBookModel.ts#parseSemanticKindLedger',canonicalPath:catalogPath,canonicalRawSha256:sha(catBytes),ledgerPath,ledgerRawSha256:sha(ledgerBytes),nativeSchemaAndCurrentSourceBindings:'pass',exactCanonicalGoalOrder:'pass',objects:ledger.decisions.length,legacyCartPostSplitBasis:'pass',proof:verifiedPrerequisiteReductionSummary(context),contentApprovalClaim:false};writeFileSync(resolve(base,'final-semantic-native-check.actual.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({technicalValidation:'pass',objects:result.objects,ledgerRawSha256:result.ledgerRawSha256}));
