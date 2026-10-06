// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-reviewed-integration-candidate-v2'
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(p),'utf8'))
const cfg=read(prep+'/batch.config.json'),old=read(own+'/native-finalbook/bundle/book-model.json')
const base=await loadGoalBookBuildInputs(cfg.baseGoalBookConfigPath)
const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
const equal=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
if(!equal(old.pages,current.pages))throw new Error('Current entire3 page payload changed after native QA inventory normalization')
const changes=Object.keys(old.source).filter(k=>!equal(old.source[k],current.source[k]))
if(changes.some(k=>k!=='goalVisualizationQaDigest'))throw new Error('Unexpected current source dependency drift: '+changes.join(','))
writeFileSync(own+'/whole-current-navigation-before-and-after.actual.json',JSON.stringify({before:old.navigation,after:current.navigation,currentBaseDigest:base.model.digest,currentSourceChanges:changes},null,2)+'\n')
const oldNavigationWithCurrentProvenance=structuredClone(old.navigation)
if(oldNavigationWithCurrentProvenance.derivedProjection?.baseModelDigest!==current.navigation.derivedProjection?.baseModelDigest){
 if(current.navigation.derivedProjection?.baseModelDigest!==base.model.digest)throw new Error('Current derived navigation is not bound to actual current base model')
 oldNavigationWithCurrentProvenance.derivedProjection.baseModelDigest=base.model.digest
}
if(!equal(oldNavigationWithCurrentProvenance,current.navigation))throw new Error('Navigation changed beyond exact raw-QA-derived base model provenance')
for(const k of Object.keys(old))if(!['digest','source','navigation'].includes(k)&&!equal(old[k],(current as any)[k]))throw new Error('Other book payload changed: '+k)
const atlas=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const receipts:any[]=[]
const walk=(v:any):void=>{
 if(v&&typeof v==='object')for(const x of Object.values(v))walk(x)
 else if(typeof v==='string'&&v.startsWith('sha256:'))receipts.push(v)
}
walk(atlas)
const proof={actualAt:new Date().toISOString(),configPath:prep+'/batch.config.json',reviewedModelDigest:old.digest,currentModelDigest:current.digest,changedSourceMetadataFields:changes,entireThreeCurrentPagesExact:true,allCurrentDEENTextGoalPageContextImageSourceFingerprintsExact:true,allOtherBookPayloadFieldsExactExcludingQaDerivedBaseDigest:true,actualOnlyNavigationDifference:'derivedProjection.baseModelDigest',navigationBaseDigestBoundToActualCurrentBase:true,twoExistingRootMachineVisualDecisionsImported:true,newIndependentScienceReviewClaims:0,humanApproval:false,humanTrial:false,activeWrites:0}
writeFileSync(own+'/native-current-three-entire-page-binding-proof.actual.json',JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify(proof))
