// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookOriginalSources, goalBookOriginalSourceMappingPaths, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current365-native-candidate-v2'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const full=read(own+'/prospective-full.book-model.json'),subset=read(own+'/native-finalbook/bundle/book-model.json'),ids=read(own+'/batch.config.json').goalIds
const selected=goalBookOriginalSourceMappingPaths(full,root);assert.ok(selected?.length)
assert.deepEqual(selected,read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json').mappingPaths)
const signatures=(index:any,id:string)=>{const d=new Map(index.documents.map((r:any)=>[r.id,r])),e=new Map(index.evidence.map((r:any)=>[r.id,r]));return index.goals[id].flatMap((facet:any)=>facet.evidenceIds.map((eid:string)=>{const r:any=e.get(eid);return {sourceRef:r.sourceRef,kind:r.kind,scopeMatch:r.scopeMatch,sourceGoalId:r.sourceGoalId,mappedTargetGoalId:r.mappedTargetGoalId,sourceScope:r.sourceScope,facet:{jurisdiction:facet.jurisdiction,stage:facet.stage,durationModel:facet.durationModel,courseProfile:facet.courseProfile},document:d.get(r.documentId)}}))}
const indexes=[]
for(const [name,model] of [['full',full],['seven-goal-d-book',subset]] as const){
 const index=buildGoalBookOriginalSources(model,root,selected);writeFileSync(resolve(root,own,name+'.current-original-sources.json'),serializeGoalBookOriginalSources(index));indexes.push({name,bookDigest:model.digest,pages:model.pages.length,citations:ids.map((id:string)=>({goalId:id,rows:signatures(index,id)}))})
}
writeFileSync(resolve(root,own,'native-current365-original-sources.actual.receipt.json'),JSON.stringify({selectedMappingPaths:selected,nativeIndexes:indexes,newScienceApprovalClaimed:false,humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({nativeOriginalSourceIndexes:2,currentFullPages:full.pages.length,currentSubsetPages:subset.pages.length,newScienceApproval:false}))
