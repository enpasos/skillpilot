import fs from 'node:fs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import path from 'node:path'
import { convertLearningGoal } from '../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'

const own = path.dirname(new URL(import.meta.url).pathname)
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const pin = (p: string) => ({ path:p, sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'), bytes:fs.statSync(p).size })
const authorPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-HE-course-admission-author-remedy-20261018-v1/AUTHOR.two-whole-HE-admission-successors.pending.json'
assert.equal(pin(authorPath).sha256,'b648581a5d548aeadc2bc269d1f920a2b1e5216d6f93684898c35b925d7c92be')
const author = read(authorPath)
const rawPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const raw = read(rawPath)
const byId = new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const semanticPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const kinds = new Map<string,string>(read(semanticPath).decisions.map((x:any)=>[x.goalId,x.semanticKind]))
const originalPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-ten-current-exams-informed-independent-b-20261018-v1/INPUT.ten-whole-current-draft-exam-goals.exact.json'
const original = new Map<string,any>(read(originalPath).map((g:any)=>[g.id,g]))
const disposal = '805a2f58-29ce-55d0-8a85-42ee486239b3'
const sorted = (v:Iterable<string>) => [...v].sort()
const entry = {meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
function targets(viewPath:string) {
  const v=normalizeCompositionView(read(viewPath))
  const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,byId)
  const projected=applyCompositionViewProjection([entry],v)[0]
  const map=new Map(projected.goals.map(g=>[g.id,g]))
  const children=buildDirectChildrenMap(map),seen=new Set<string>()
  const stack=projected.goals.filter(g=>g.tags.includes('root')).map(g=>g.id)
  while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,map,children))}
  const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean) as string[]
  const ordinary=new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&kinds.get(id)==='curricularAtomic'&&goalMatchesFilters(byId.get(id),filters)))
  return {viewPin:pin(viewPath),viewId:v.viewId,scope:v.scope,ordinary,map,roles,seen}
}
const rows=author.records.map((r:any)=>{
  const before=r.beforeWholeGoal,after=r.proposedWholeGoal
  assert.deepEqual(before,byId.get(r.goalId),'current whole before CAS')
  assert.deepEqual(before,original.get(r.goalId),'original own read current whole body CAS')
  const reconstructed=structuredClone(before)
  reconstructed.requires.push(...r.appendRequiredGoalIds)
  const allowed=['currentCourseTargetAdmissionCount','currentDirectRequiresObjectCount','currentDirectRequiresAtomicObjectCount','currentDirectRequiresClusterObjectCount','counterMeaning']
  for(const key of allowed) reconstructed.extendedData.routeCoverage[key]=after.extendedData.routeCoverage[key]
  assert.deepEqual(reconstructed,after,'only exact appends and five declared counter fields')
  assert.equal(after.requires.length,new Set(after.requires).size)
  assert.deepEqual(before.examData,after.examData,'whole task/solution/7covered/44-27 scoring retained')
  assert.equal(after.examData.coveredGoalIds.length,7)
  assert.equal(after.examData.scoring.maxPoints,44)
  assert.equal(after.examData.scoring.passingPoints,27)
  const suffix=r.course.toLowerCase()
  const sek=targets(`curricula/DE/Gymnasium/composition-views/chemie/de-he-sekii-${suffix}.view.json`)
  const cross=targets(`curricula/DE/Gymnasium/composition-views/chemie/de-he-${suffix}.view.json`)
  const expected=new Set([...sek.ordinary,disposal])
  assert.deepEqual(sorted(after.requires),sorted(expected),'exact own SekII targets plus retained disposal support')
  assert.deepEqual(sorted(r.appendRequiredGoalIds),sorted([...expected].filter(id=>!before.requires.includes(id))))
  assert.equal(sek.ordinary.size,r.course==='GK'?162:241)
  assert.equal(after.requires.length,r.course==='GK'?163:242)
  assert.equal(r.appendRequiredGoalIds.length,r.course==='GK'?10:13)
  assert.equal(after.extendedData.routeCoverage.currentCourseTargetAdmissionCount,sek.ordinary.size)
  assert.equal(after.extendedData.routeCoverage.currentDirectRequiresObjectCount,after.requires.length)
  assert.equal(after.extendedData.routeCoverage.currentDirectRequiresAtomicObjectCount,after.requires.length)
  assert.equal(after.extendedData.routeCoverage.currentDirectRequiresClusterObjectCount,0)
  const extraIncludingRetainedSupport=[...cross.ordinary].filter(id=>!sek.ordinary.has(id))
  const extra=extraIncludingRetainedSupport.filter(id=>id!==disposal)
  assert.equal(extraIncludingRetainedSupport.length,91)
  assert.equal(extra.length,90)
  assert.deepEqual(sorted(extraIncludingRetainedSupport.filter(id=>after.requires.includes(id))),[disposal])
  assert.deepEqual(extra.filter(id=>after.requires.includes(id)),[]) 
  for(const id of after.requires){assert(sek.map.has(id));assert(sek.roles.targetGoalIds.has(id)||sek.roles.prerequisiteOnlyGoalIds.has(id));assert(!(byId.get(id).contains??[]).length)}
  assert(after.requires.includes(disposal)&&!sek.ordinary.has(disposal))
  const additions=r.appendRequiredGoalIds.map((id:string)=>({goalId:id,title:byId.get(id).title,tags:byId.get(id).tags,description:byId.get(id).description,descriptionEn:byId.get(id).descriptionEn,requires:byId.get(id).requires,selectedCurrentSekIIOwnTarget:sek.ordinary.has(id),inActualProjectedGraph:sek.map.has(id)}))
  return {goalId:r.goalId,course:r.course,sekIIView:{pin:sek.viewPin,viewId:sek.viewId,scope:sek.scope,ordinaryTargets:sorted(sek.ordinary)},crossStageView:{pin:cross.viewPin,viewId:cross.viewId,scope:cross.scope,extraOrdinaryTargetsNotAdmitted:sorted(extra)},originalRequires:before.requires,proposedRequires:after.requires,appendRequiredGoalIds:r.appendRequiredGoalIds,additions,currentCourseTargetCount:sek.ordinary.size,actualAdmissionCount:after.requires.length,retainedDisposalSupport:disposal,wholeExamDataAndEveryOtherFieldExact:true,allAdmissionGoalsInActualGraphAndSelectedRole:true}
})
const result={status:'PASS',author:pin(authorPath),currentCanonicalAtCheck:pin(rawPath),semanticKinds:pin(semanticPath),ownOriginalInput:pin(originalPath),records:rows,newNormalWrites:0,newBodyOrPScienceVotes:0,centralAPCompilerBuildRuns:0}
fs.writeFileSync(path.join(own,'CHECK.actual-two-current-HE-admissions-and-exact-body-retention.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({status:'PASS',courses:rows.map((r:any)=>({course:r.course,ordinary:r.currentCourseTargetCount,admission:r.actualAdmissionCount,appends:r.appendRequiredGoalIds.length,crossStageExtrasNotAdmitted:r.crossStageView.extraOrdinaryTargetsNotAdmitted.length})),wholeBodyUnchanged:true,normalWrites:0}))
