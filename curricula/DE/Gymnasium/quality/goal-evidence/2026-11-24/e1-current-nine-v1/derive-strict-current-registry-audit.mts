// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fingerprintPrerequisiteReductionRecord} from '../../../../../../../app/scripts/prerequisiteReductionProof'
const root='curricula/DE/Gymnasium/',path=root+'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const bytes=readFileSync(path), doc=JSON.parse(bytes.toString())
const registryPath=root+'provenance/prerequisite-reduction-proof-registry.json',registryBytes=readFileSync(registryPath),registry=JSON.parse(registryBytes.toString())
const goals=['ce431132-dfc4-42c2-aff6-bd72035190f8','09029573-864f-40ca-bf8a-cee7bf6dcb73','d6dc0e02-831d-4894-a61a-852bcc74f147','6ea3fb3c-abdc-568f-ab13-97c36dc274e4','2b9e565f-d9b4-5e23-b5b7-b7977cecff06']
const records=goals.map(id=>{const goal=doc.goals.find((g:any)=>g.id===id),transfer=registry.transfers.find((t:any)=>t.source===doc.landscapeId+':'+id);if(!goal||!transfer)throw new Error('Missing registered goal '+id);const current=fingerprintPrerequisiteReductionRecord(goal);return{goalId:id,currentGoalDigest:current,frozenGoalDigest:transfer.frozenGoalDigest,reviewedHistoricalGoalDigest:transfer.reviewedGoalDigest,transferAvailable:current===transfer.frozenGoalDigest,strictCurrentInputRequired:current!==transfer.frozenGoalDigest}})
if(records.some(r=>r.transferAvailable))throw new Error('Unexpected historical transfer availability; inspect current input')
const hash=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
console.log(JSON.stringify({schemaVersion:1,contract:'e1-strict-current-registry-audit-v1',registryPath,registryRawDigest:hash(registryBytes),registryEdits:0,canonicalPath:path,canonicalRawDigest:hash(bytes),records,interpretation:'All five goals differ from their immutable frozen V9 values. No old review transfer is used. DIA/FF/MOD require fresh exact-current D/P; ZB/MP require actual current assessment/prerequisite reviews. This audit is a native digest comparison, not itself a content approval.'},null,2))
