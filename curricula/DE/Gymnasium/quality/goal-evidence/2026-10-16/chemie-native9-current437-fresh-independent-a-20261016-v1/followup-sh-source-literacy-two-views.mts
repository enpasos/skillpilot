// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
const R='/home/enpasos/projects/skillpilot',E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const O=resolve(R,E,'chemie-native9-current437-fresh-independent-a-20261016-v1')
const C=resolve(R,E,'chemie-SH032-existing-source-literacy-target-two-view-author-successor-20261016-v1/CAS.two-whole-SH-views.existing-source-literacy-target.AUTHOR.inactive.json')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
assert.equal(sha(C),'sha256:083f284b962fb771ce0e57f4b5be8e32ebe58b06d7b5b249845d4d156863fd8f')
const cas=read(C),canonicalPath=resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
assert.equal(sha(canonicalPath),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const landscape=read(canonicalPath),by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const {buildApplicabilityCompilation}=await import(`${K}/app/scripts/applicabilityCompiler.ts`)
const {compileCompositionView,normalizeCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {applyCompositionViewProjection}=await import(`${K}/app/src/utils/compositionViewRuntime.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const {buildDirectChildrenMap,getRenderedChildIds}=await import(`${K}/app/src/utils/treeProjectionRuntime.ts`)
const report=buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId===landscape.landscapeId)
assert.equal(report.findings.filter((f:any)=>f.severity==='error').length,0)
const app=new Map<string,any>(report.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
function audit(raw:any){
 const view=normalizeCompositionView(raw),preview=compileCompositionView(view,landscape)
 assert.equal(preview.findings.filter((f:any)=>f.severity==='error').length,0)
 const input={meta:landscape,goals:landscape.goals.map((g:any)=>convertLearningGoal({...g,applicability:{...g.applicability,...app.get(g.id)}},{landscapeId:landscape.landscapeId}))}
 const projected=applyCompositionViewProjection([input],view)[0],pby=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pby)
 const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
 children.forEach((ids:string[],parent:string)=>children.set(parent,ids.filter(id=>pby.has(id)&&goalMatchesFilters(pby.get(id),filters))))
 const visible=new Set<string>(),todo=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id)
 while(todo.length){const id=todo.pop()!;if(visible.has(id))continue;visible.add(id);todo.push(...getRenderedChildIds(id,pby,children))}
 return visible
}
const origin='5b1bb5d9-07b1-5ba9-b320-cc97be917c60',orientation='a9c22adc-b543-5b0c-a2d8-3189facdff08',endpoint='69928892-ac71-553d-a35c-4f96f16b6d6e'
assert.deepEqual(by.get(origin).requires,[orientation]);assert.deepEqual(by.get(orientation).requires,[])
const results=[]
for(const op of cas.operations){
 const beforePath=resolve(R,op.before.path),afterPath=resolve(R,op.after.path),before=read(beforePath),after=read(afterPath)
 assert.equal(sha(beforePath),op.before.sha256);assert.equal(sha(afterPath),op.after.sha256)
 assert.equal(sha(resolve(K,op.normalPath)),op.beforeWholeFileSha256)
 const restored=structuredClone(after);let edits=0
 function walk(nodes:any[]){for(const n of nodes){if(n.id===op.soleChange.sectionId){assert.deepEqual(n.children.pop(),op.soleChange.append);edits++}walk(n.children??[])}}
 walk(restored.rootNodes);assert.equal(edits,1);assert.deepEqual(restored,before)
 assert.deepEqual(op.soleChange.append,{kind:'goalEntry',goalId:origin,projectionRole:'target'})
 const b=audit(before),a=audit(after)
 assert.ok(!b.has(origin));assert.ok(a.has(origin));assert.ok(a.has(orientation))
 assert.ok([...b].every(id=>a.has(id)))
 assert.deepEqual([...a].filter(id=>!b.has(id)),[origin])
 const closure=new Set<string>()
 function prereqs(id:string){for(const r of by.get(id)?.requires??[]){if(closure.has(r))continue;closure.add(r);prereqs(r)}}
 prereqs(endpoint)
 const beforeMissing=[...closure].filter(id=>!b.has(id)),afterMissing=[...closure].filter(id=>!a.has(id))
 assert.deepEqual(beforeMissing,[origin]);assert.deepEqual(afterMissing,[])
 results.push({normalPath:op.normalPath,before:op.before,after:op.after,soleAddition:origin,role:'target',allPreviousNodesAndRolesExact:true,exactlyOneTargetAdded:true,endpointPrerequisiteClosure:[...closure],beforeMissing,afterMissing,orientationVisible:true,canonicalAndRequiresUnchanged:true})
}
writeFileSync(resolve(O,'CHECK.followup-SH-two-source-literacy-targets.actual-stock.json'),JSON.stringify({role:'Independent nonauthor finite two-view technical check, following original first science',casSha256:sha(C),canonicalSha256:sha(canonicalPath),results,whole39ClosureClaim:false,HumanApproval:false,HumanTrial:false},null,2)+'\n')
console.log(JSON.stringify({twoViewsPass:results.length,soleAddedTarget:origin,eachEndpointClosureNowComplete:true,whole39ClosureClaim:false}))
