import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'

const root='/home/enpasos/projects/skillpilot'
const out=`${root}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-11bea-equation-scope-preservation-candidate-v1`
const canon=normalizeCanonicalLandscape(JSON.parse(readFileSync(`${root}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`,'utf8')))
const ids=['11bea4c6-7b8a-47e0-8293-2eb1ce34cf66','22133f29-ef02-4408-8f8d-2bbea3275d91','1c1420c2-a8e2-520f-8015-6df637a973bd','018bec90-445f-4a88-b8bc-228f8335dee6']
const dir=`${root}/curricula/DE/Gymnasium/composition-views/chemie`
const rows=[]
for(const name of readdirSync(dir).filter(n=>n.endsWith('.json')).sort()){
 const raw=readFileSync(`${dir}/${name}`)
 const before=JSON.parse(raw.toString());const view=normalizeCompositionView(before)
 const compiled=compileCompositionView(view,canon)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(canon.goals.map(g=>[g.id,g])),new Map([[canon.landscapeId,canon.goals.find(g=>g.id===canon.rootGoalId)?.id ?? canon.goals.find(g=>!canon.goals.some(p=>p.contains.includes(g.id)))!.id]]))
 const refs:any[]=[]
 const visit=(nodes:any[],path:string[])=>nodes.forEach(n=>{const p=[...path,n.label];if(ids.includes(n.sourceGoalId))refs.push({goalId:n.sourceGoalId,runtimeId:n.runtimeId,path:p});visit(n.children,p)})
 visit(compiled.compiledRootNodes,[])
 rows.push({path:`curricula/DE/Gymnasium/composition-views/chemie/${name}`,digest:`sha256:${createHash('sha256').update(raw).digest('hex')}`,viewId:view.viewId,scope:view.scope,beforeView:before,compilationFindings:compiled.findings,goalBindings:ids.map(goalId=>({goalId,role:roles.targetGoalIds.has(goalId)?'target':roles.prerequisiteOnlyGoalIds.has(goalId)?'prerequisiteOnly':'absent',compiledVisibleReferences:refs.filter(r=>r.goalId===goalId)}))})
}
writeFileSync(`${out}/current-compiled-views.inventory.json`,JSON.stringify({snapshotAtUtc:new Date().toISOString(),method:'Current compileCompositionView + collectCompositionProjectionRoleGoalIds; actual authored current chemie views, current canonical chemistry only',viewCount:rows.length,rows},null,2)+'\n')
console.log(JSON.stringify({views:rows.length,errorFindings:rows.reduce((s,r)=>s+r.compilationFindings.filter((f:any)=>f.severity==='error').length,0),bindings:rows.map(r=>({viewId:r.viewId,scope:r.scope,roles:r.goalBindings.map(g=>[g.goalId.slice(0,5),g.role])}))}))
