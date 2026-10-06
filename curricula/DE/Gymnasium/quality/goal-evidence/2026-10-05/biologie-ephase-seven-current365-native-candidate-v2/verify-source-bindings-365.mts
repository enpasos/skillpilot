// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildGoalBookOriginalSources,serializeGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current365-native-candidate-v2',read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const model=read(own+'/prospective-full.book-model.json'),meta=read(own+'/current365-source-rebase.actual.receipt.json'),atlas=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'),ids=read(own+'/batch.config.json').goalIds
const paths=atlas.mappingPaths.map((p:string)=>p===meta.futureHEMappingPath?meta.oldHEMappingPath:p)
const before=buildGoalBookOriginalSources(model,root,paths),after=read(own+'/full.current-original-sources.json')
const sig=(index:any,id:string)=>{const d=new Map(index.documents.map((r:any)=>[r.id,r])),e=new Map(index.evidence.map((r:any)=>[r.id,r]));return index.goals[id].flatMap((f:any)=>f.evidenceIds.map((eid:string)=>{const r:any=e.get(eid);return{sourceRef:r.sourceRef,kind:r.kind,scopeMatch:r.scopeMatch,sourceGoalId:r.sourceGoalId,mappedTargetGoalId:r.mappedTargetGoalId,sourceScope:r.sourceScope,facet:{jurisdiction:f.jurisdiction,stage:f.stage,durationModel:f.durationModel,courseProfile:f.courseProfile},document:d.get(r.documentId)}}))}
const changes=model.pages.filter((p:any)=>JSON.stringify(sig(before,p.goalId))!==JSON.stringify(sig(after,p.goalId))).map((p:any)=>p.goalId)
assert.deepEqual([...changes].sort(),[...ids].sort());assert.equal(model.pages.length,365)
writeFileSync(resolve(root,own,'actual-active42-current365-original-sources.baseline.json'),serializeGoalBookOriginalSources(before))
writeFileSync(resolve(root,own,'all-current365-source-bindings.actual.comparison.json'),JSON.stringify({currentCanonicalGoalCount:365,active42BaselineUsed:true,baselineMappingPaths:paths,futureMappingPaths:atlas.mappingPaths,changedSourceFacetGoalIds:changes,exactUnchangedOther358SourceFacetGoalIds:model.pages.filter((p:any)=>!changes.includes(p.goalId)).map((p:any)=>p.goalId),bacterialStructureAndFissionSourceRowsExact:['5b2571d9-f079-52b2-b21b-8f389c7409f4','49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd'].every(id=>JSON.stringify(sig(before,id))===JSON.stringify(sig(after,id))),newScienceApprovalClaimed:false,humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({sourceFacetsChangedExactlyE7:changes.length,other358SourceFacetsExact:true,current365:true}))
