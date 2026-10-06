// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fifteen-reviewed-integration-candidate-v5'
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-native-candidate-v4'
const read=(p:string)=>JSON.parse(readFileSync(resolve(p),'utf8'))
const cfg=read(prep+'/batch.config.json'),old=read(own+'/native-finalbook/bundle/book-model.json')
const base=await loadGoalBookBuildInputs(cfg.baseGoalBookConfigPath)
const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
const equal=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
if(!equal(old.pages,current.pages))throw new Error('Current entire15 page payload changed after native QA inventory normalization')
const changes=Object.keys(old.source).filter(k=>!equal(old.source[k],current.source[k]))
if(changes.some(k=>k!=='goalVisualizationQaDigest'))throw new Error('Unexpected current source dependency drift: '+changes.join(','))
for(const k of Object.keys(old))if(!['digest','source'].includes(k)&&!equal(old[k],(current as any)[k]))throw new Error('Other book payload changed: '+k)
const atlas=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const receipts:any[]=[]
const walk=(v:any):void=>{
 if(v&&typeof v==='object')for(const x of Object.values(v))walk(x)
 else if(typeof v==='string'&&v.startsWith('sha256:'))receipts.push(v)
}
walk(atlas)
const proof={actualAt:new Date().toISOString(),configPath:prep+'/batch.config.json',reviewedModelDigest:old.digest,currentModelDigest:current.digest,changedSourceMetadataFields:changes,entireFifteenCurrentPagesExact:true,allCurrentDEENTextGoalPageContextImageSourceFingerprintsExact:true,allOtherBookPayloadFieldsExact:true,qaScientificallyUnchangedOrderOnly:true,actualNewScienceApprovals:0,humanApproval:false,humanTrial:false,activeWrites:0}
writeFileSync(own+'/native-current-fifteen-entire-page-binding-proof.actual.json',JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify(proof))
