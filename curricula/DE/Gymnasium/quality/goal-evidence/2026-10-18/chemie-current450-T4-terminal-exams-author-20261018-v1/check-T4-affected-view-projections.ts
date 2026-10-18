import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'

const own=path.dirname(new URL(import.meta.url).pathname)
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const pin=(p:string)=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size})
const currentPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const before=read(currentPath),after=structuredClone(before)
const drafts=read(path.join(own,'AUTHOR.sixteen-whole-new-exam-goals.pending.json')).goals
const ordinary=read(path.join(own,'INPUT.whole-current-eighteen-goals-and-P.json')).records
const byBefore=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
ordinary.forEach((r:any)=>assert.deepEqual(r.goal,byBefore.get(r.goal.id),'selected whole current ordinary CAS'))
after.goals.push(...drafts)
for(const op of read(path.join(own,'AUTHOR.sparse-phase-practice-contains-appends.pending.json')).operations){
 const parent=after.goals.find((g:any)=>g.id===op.parentId)
 assert.deepEqual(parent,op.beforeWholeParent,'selected whole practice parent CAS')
 parent.contains.push(...op.append)
}
const viewOps=read(path.join(own,'AUTHOR.sparse-existing-view-practice-placements.pending.json'))
const matrix=read(path.join(own,'AUTHOR.eighteen-endpoint-dispositions-and-exact-input-CAS.json')).records.filter((r:any)=>r.newGoalObjectProposed)
const paths=[...new Set<string>(matrix.flatMap((r:any)=>r.actualExistingTargetViews))].sort()
const sorted=(xs:Iterable<string>)=>[...xs].sort()
const newIds=new Set<string>(drafts.map((g:any)=>g.id))
function parent(view:any,parts:string[]){let cur={children:view.rootNodes};for(const id of parts)cur=cur.children.find((n:any)=>n.id===id);return cur}
function projected(raw:any,v:any){
 const view=normalizeCompositionView(v),rawMap=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,rawMap)
 const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
 const p=applyCompositionViewProjection([entry],view)[0],by=new Map(p.goals.map(g=>[g.id,g])),children=buildDirectChildrenMap(by),seen=new Set<string>(),parents=new Map<string,Set<string>>()
 const stack=p.goals.filter(g=>g.tags.includes('root')).map(g=>g.id)
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,by,children)){if(!parents.has(c))parents.set(c,new Set());parents.get(c)!.add(id);stack.push(c)}}
 assert(seen.size)
 const filters=[view.scope.jurisdiction,view.scope.courseProfile,view.scope.durationModel].filter(Boolean) as string[]
 const targets=new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(rawMap.get(id),filters)))
 return {view,roles,by,seen,parents,targets}
}
const results=paths.map(filename=>{
 const rawView=read(filename),candidate=structuredClone(rawView)
 for(const op of viewOps.parentOperations.filter((x:any)=>x.normalView.path===filename)){
  const p=parent(candidate,op.parentPath);assert.deepEqual(p,op.beforeWholeParent)
  for(const ins of op.insertions){const i=p.children.findIndex((n:any)=>JSON.stringify(n)===JSON.stringify(ins.afterExactExistingTargetEntry));assert(i>=0);p.children.splice(i+1,0,ins.newEntry)}
  assert.deepEqual(p,op.afterWholeParent)
 }
 const b=projected(before,rawView),a=projected(after,candidate)
 const expected=matrix.filter((r:any)=>r.actualExistingTargetViews.includes(filename)).map((r:any)=>r.newEndpointId)
 const unexpected=[...a.targets].filter(id=>newIds.has(id)&&!expected.includes(id))
 assert.deepEqual(expected.filter(id=>!a.targets.has(id)),[],`all planned endpoints actually visible ${filename}`)
 assert.deepEqual(sorted([...a.targets].filter(id=>!newIds.has(id))),sorted(b.targets),'all old visible target sets exact')
 assert.deepEqual(sorted(a.roles.prerequisiteOnlyGoalIds),sorted(b.roles.prerequisiteOnlyGoalIds),'old prerequisite-only roles exact')
 assert.deepEqual(sorted([...a.roles.targetGoalIds].filter(id=>!newIds.has(id))),sorted(b.roles.targetGoalIds),'all old target roles exact')
 for(const [id,parents] of a.parents)assert(parents.size<=1,`multiple visible parents ${id}`)
 const isMemory=(id:string)=>{const g=byBefore.get(id);return g?.tags?.some((t:string)=>t==='memorization'||t.startsWith('srs-deck:'))}
 assert.deepEqual(sorted([...a.targets].filter(isMemory)),sorted([...b.targets].filter(isMemory)),'all visible old memory targets exact')
 const additions=expected.map(id=>{
  const g=drafts.find((x:any)=>x.id===id);assert.equal(g.requires.length,1)
  const req=g.requires[0];assert(b.targets.has(req)&&a.targets.has(req)&&a.by.has(req),'genuine required ordinary target visible and graph-available')
  assert(a.parents.get(id)?.size===1)
  return {examId:id,ordinaryGoalId:req,visibleBefore:false,visibleAfter:true,renderedParent:[...a.parents.get(id)!][0],ordinaryRequiredTargetVisibleAndGraphAvailable:true}
 })
 return {view:pin(filename),viewId:a.view.viewId,scope:a.view.scope,oldVisibleTargetCount:b.targets.size,newVisibleTargetCount:a.targets.size,additions,unexpectedInheritedNewPracticeTargets:unexpected.map(id=>({examId:id,ordinaryGoalId:drafts.find((g:any)=>g.id===id).requires[0],ordinaryTargetSelected:b.targets.has(drafts.find((g:any)=>g.id===id).requires[0]),decision:'HOLD_CANONICAL_PARENT_ATTACHMENT_UNTIL_HONEST_SCOPE_REMEDY'})),noOldTargetLossOrRoleChange:true,noDuplicateRenderedParent:true,oldVisibleMemoryTargetsExact:true,oldCanonicalPracticeFoldersRetained:true,oldCanonicalFolderToNewStructuralParentMapping:[],newPhaseLocalStructures:filename.includes("de-de-gym")&&filename.endsWith("chemistry-lk.view.json")?[{structureId:"t4-local-q4-practice",phase:"Q4",existingFolderReplaced:false}]:[]}
})
const unexpectedCount=results.reduce((n,r)=>n+r.unexpectedInheritedNewPracticeTargets.length,0)
const report={status:unexpectedCount?'PARTIAL_CANONICAL_PLACEMENT_HOLD':'PASS',method:'Finite actual stock projection/role/tree/filter calls on36affected views only; all candidate mutation is in memory.',currentCanonicalAtCheck:pin(currentPath),affectedViews:results.length,actualAddedPlannedPracticeAppearances:results.reduce((n,r)=>n+r.additions.length,0),unexpectedInheritedPracticeAppearances:unexpectedCount,newOrdinaryTargets:0,normalWrites:0,compilerAPBuildRuns:0,records:results}
fs.writeFileSync(path.join(own,'CHECK.actual-T4-affected-view-projections.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,affectedViews:report.affectedViews,actualAddedPlannedPracticeAppearances:report.actualAddedPlannedPracticeAppearances,unexpectedInheritedPracticeAppearances:unexpectedCount,newOrdinaryTargets:0,normalWrites:0}))
