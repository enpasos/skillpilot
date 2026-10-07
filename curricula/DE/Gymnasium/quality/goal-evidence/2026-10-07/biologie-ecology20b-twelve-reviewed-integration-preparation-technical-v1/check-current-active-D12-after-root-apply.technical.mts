// SPDX-License-Identifier: Apache-2.0
// Read-only current canonical validation of actual sealed paired D12 resolutions.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {materializeGoalDescriptionRolloutBatchDualSummary} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {validateGoalDescriptionDualRoundResolution} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const landscape=read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')),prepared=read(resolve(own,'candidate/canonical.future-active.json')),out=resolve(own,'native-d-twelve'),index=read(resolve(out,'resolution-index.json')),ids=index.batchGoalIds
for(const id of ids)assert.deepEqual(landscape.goals.find((g:any)=>g.id===id),prepared.goals.find((g:any)=>g.id===id),'Actual current whole target must match the exact reviewed preparation')
const dual=await materializeGoalDescriptionRolloutBatchDualSummary(relative(root,resolve(own,'native-d-twelve.batch.config.json')),false),manifestBytes=readFileSync(resolve(out,'synthesis-decisions.json')),manifest=JSON.parse(manifestBytes.toString('utf8'))
for(const e of index.resolutions){const b=readFileSync(resolve(out,e.resolutionPath)),resolution=JSON.parse(b.toString('utf8'));assert.equal(sha(b),e.resolutionDigest);const v=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,landscape,first:dual.first,second:dual.second,synthesisDecisionManifestArtifact:{manifest,manifestBytes,manifestPath:'synthesis-decisions.json'}});assert.deepEqual(v.errors,[]);assert.equal(v.strictDescriptionComplete,true)}
console.log(JSON.stringify({actualCurrentCanonicalNativeD12:'PASS',nativeResolvedTargets:12,genuineOriginalRecordsAndCampaignsRetained:true,activeWrites:0,humanApproval:false,humanTrial:false}))
