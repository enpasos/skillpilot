// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookOriginalSources, goalBookOriginalSourceMappingPaths, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const root=process.cwd(), own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current-native-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const meta=read(own+'/prospective-paths.json'), full=read(own+'/prospective-full.book-model.json'), subset=read(own+'/native-finalbook/bundle/book-model.json')
const selected=goalBookOriginalSourceMappingPaths(full,root)
assert.ok(selected?.length);assert.deepEqual(selected,read(meta.atlasPath).mappingPaths)
const beforeSelected=selected.map(p=>p===meta.newHEMappingPath?meta.oldHEMappingPath:p)
const before=buildGoalBookOriginalSources(read(own+'/baseline-full.book-model.json'),root,beforeSelected)
writeFileSync(resolve(root,own,'baseline-original-sources.json'),serializeGoalBookOriginalSources(before))
const signatures=(index:any,id:string)=>{
 const d=new Map(index.documents.map((row:any)=>[row.id,row])),e=new Map(index.evidence.map((row:any)=>[row.id,row]))
 return index.goals[id].flatMap((facet:any)=>facet.evidenceIds.map((eid:string)=>{
  const r:any=e.get(eid);return {sourceRef:r.sourceRef,kind:r.kind,scopeMatch:r.scopeMatch,sourceGoalId:r.sourceGoalId,mappedTargetGoalId:r.mappedTargetGoalId,sourceScope:r.sourceScope,facet:{jurisdiction:facet.jurisdiction,stage:facet.stage,durationModel:facet.durationModel,courseProfile:facet.courseProfile},document:d.get(r.documentId)}
 }))
}
const indexes=[]
for(const [name,model] of [['full',full],['seven-goal-d-book',subset]] as const){
 const index=buildGoalBookOriginalSources(model,root,selected)
 const citations=meta.goalIds.map((id:string)=>{
  const rows=signatures(index,id);assert.ok(rows.length)
  const he=rows.filter((r:any)=>r.sourceScope.jurisdiction==='DE-HE')
  assert.ok(he.length);assert.ok(he.every((r:any)=>r.document.url.includes('/2025-10/') && /S\.(36|37)/.test(r.sourceRef)))
  const sid=read(own+'/source-seven-field-deltas.author.json').deltas.find((r:any)=>r.goalId===id).sourceGoalId
  const extractionRow=read(meta.newHEExtractionPath).sourceGoals.find((g:any)=>g.id===sid)
  assert.equal(extractionRow.sourceDocumentKey,'KC2024_BIOLOGIE_SEKII_STAND_20250801')
  assert.equal(extractionRow.description,read(own+'/current-canonical.before.snapshot.json').goals.find((g:any)=>g.id===id).description)
  const lower=rows.filter((r:any)=>r.sourceScope.jurisdiction!=='DE-HE')
  assert.ok(lower.every((r:any)=>r.scopeMatch==='source-context'))
  return {goalId:id,rows,beforeRows:signatures(before,id),sourceDocumentKey:extractionRow.sourceDocumentKey,wholeLowerSourceClosureClaimed:false}
 })
 writeFileSync(resolve(root,own,name+'.current-original-sources.json'),serializeGoalBookOriginalSources(index))
 if(name==='full'){
  const changes=full.pages.filter((p:any)=>JSON.stringify(signatures(before,p.goalId))!==JSON.stringify(signatures(index,p.goalId))).map((p:any)=>p.goalId)
  assert.deepEqual([...changes].sort(),[...meta.goalIds].sort(),'Unexpected existing goal source-citation change')
 }
 indexes.push({name,bookDigest:model.digest,pages:model.pages.length,citations})
}
writeFileSync(resolve(root,own,'native-original-sources.actual.author.receipt.json'),JSON.stringify({selectedMappingPaths:selected,beforeSelectedMappingPaths:beforeSelected,nativeIndexes:indexes,exactSevenCurrentSourceCitationChanges:true,otherCurrent357OriginalSourceFacetsPreserved:true,noHistoricalURLFilterOrWitnessWaiver:true,humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({indexes:2,fullPages:full.pages.length,subsetPages:subset.pages.length,exactCurrentHE2025Seven:true,other357FacetsPreserved:true}))
