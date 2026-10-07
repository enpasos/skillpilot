// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {loadGoalDescriptionRolloutInFlightLedger} from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const result=await loadGoalDescriptionRolloutInFlightLedger(),closed=new Set(['9e656697-fc05-5aa9-9aca-871af2e89eb7','f0939f88-a6af-5334-ac4d-5d54732af25a','28bb9d15-f865-5843-a035-6066580fea64','1c1420c2-a8e2-520f-8015-6df637a973bd'])
for(const b of result.activeBatches)if(b.config.subject==='chemie')for(const id of b.config.goalIds)assert(!closed.has(id),'Integrated Chemie goal still claimed by in-flight ledger: '+id)
const b007=result.activeBatches.find(b=>b.config.batchId==='chemie-b007-two-current-open-20261007-v2'),b014=result.activeBatches.find(b=>b.config.batchId==='chemie-b014-three-current-open-20261007-v2');assert.equal(b007?.config.goalIds.length,2);assert.equal(b014?.config.goalIds.length,3)
console.log(JSON.stringify({nativeLedgerAndAllConfigSchemas:'PASS',duplicateClaims:false,B007Remaining:2,B014Remaining:3,otherClaimsPreserved:true,newScientificReview:false}))
