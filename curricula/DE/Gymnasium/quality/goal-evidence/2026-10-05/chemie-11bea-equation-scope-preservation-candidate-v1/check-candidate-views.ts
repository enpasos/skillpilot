import {readFileSync,writeFileSync} from 'node:fs'
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
const dir='/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-11bea-equation-scope-preservation-candidate-v1'
const read=(f:string)=>JSON.parse(readFileSync(`${dir}/${f}`,'utf8'))
const current=read('current-compiled-views.inventory.json'),units=read('candidate-view-units.json'),ids=read('candidate-ids.json')
const canon=normalizeCanonicalLandscape(read('candidate-canonical.preview.json'))
const unitById=new Map(units.units.map((u:any)=>[u.viewId,u]))
const by=new Map(canon.goals.map(g=>[g.id,g]))
const roots=new Map([[canon.landscapeId,canon.goals.find(g=>g.tags.includes('root'))!.id]])
const goalIds=[ids.parent,ids.basic,ids.redox,ids.proton]
const rows=current.rows.map((row:any)=>{
 const unit:any=unitById.get(row.viewId)
 const view=normalizeCompositionView(unit?.after??row.beforeView)
 const result=compileCompositionView(view,canon)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,by,roots)
 const refs:any[]=[]
 const visit=(nodes:any[],path:string[])=>nodes.forEach(n=>{const p=[...path,n.label];if(goalIds.includes(n.sourceGoalId))refs.push({goalId:n.sourceGoalId,path:p});visit(n.children,p)})
 visit(result.compiledRootNodes,[])
 const targets=goalIds.map(goalId=>({goalId,role:roles.targetGoalIds.has(goalId)?'target':roles.prerequisiteOnlyGoalIds.has(goalId)?'prerequisiteOnly':'absent',visibleCount:refs.filter(r=>r.goalId===goalId).length,visiblePaths:refs.filter(r=>r.goalId===goalId).map(r=>r.path)}))
 const oldParent=row.goalBindings.find((b:any)=>b.goalId===ids.parent).role
 const oldRedox=row.goalBindings.find((b:any)=>b.goalId===ids.redox).role
 return {viewId:view.viewId,path:row.path,scope:view.scope,explicitViewDelta:!!unit,findings:result.findings,targets,originalParentRole:oldParent,originalRedoxRole:oldRedox,originalBasicTargetIntentRetained:oldParent!=='target'||roles.targetGoalIds.has(ids.basic),originalRedoxRoleRetained:oldRedox!=='target'||roles.targetGoalIds.has(ids.redox),newRedoxTarget:oldRedox!=='target'&&roles.targetGoalIds.has(ids.redox),protonTargetNeedsSourceAndScopeReview:roles.targetGoalIds.has(ids.proton),status:'MECHANICAL_COMPILATION_ONLY; SOURCE_SCOPE_HOLD'}
})
const out={status:'INACTIVE_PREVIEW_NOT_PROJECTION_APPROVAL',method:'Actual production composition compiler, all 37 actual authored current chemistry views; no runtime jurisdiction fallback or applicability inference accepted as complete source evidence',viewCount:rows.length,explicitViewDeltaCount:units.units.length,errorCount:rows.flatMap((r:any)=>r.findings).filter((f:any)=>f.severity==='error').length,originalParentTargetViewCount:rows.filter((r:any)=>r.originalParentRole==='target').length,allOriginalBasicTargetIntentRetained:rows.every((r:any)=>r.originalBasicTargetIntentRetained),allOriginalRedoxTargetRolesRetained:rows.every((r:any)=>r.originalRedoxRoleRetained),newRedoxTargetViews:rows.filter((r:any)=>r.newRedoxTarget).map((r:any)=>r.viewId),protonTargetViews:rows.filter((r:any)=>r.protonTargetNeedsSourceAndScopeReview).map((r:any)=>r.viewId),rows}
writeFileSync(`${dir}/candidate-compiled-views.inventory.json`,JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({views:out.viewCount,explicitDeltas:out.explicitViewDeltaCount,errors:out.errorCount,basicIntentRetained:out.allOriginalBasicTargetIntentRetained,redoxRolesRetained:out.allOriginalRedoxTargetRolesRetained,newRedoxTargetViews:out.newRedoxTargetViews.length,protonTargetViews:out.protonTargetViews.length}))
