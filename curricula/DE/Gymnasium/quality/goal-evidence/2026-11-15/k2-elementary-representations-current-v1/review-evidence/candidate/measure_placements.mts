// SPDX-License-Identifier: Apache-2.0
import { readFileSync,readdirSync,writeFileSync } from 'node:fs'
import { resolve,dirname,relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds } from '../../app/src/utils/authoring/compositionViewAuthoring.ts'
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../..')
const payload=JSON.parse(readFileSync(resolve(out,'candidate-payload.json'),'utf8'))
const catalog=readdirSync(resolve(out,'inputs/catalog')).filter(x=>x.endsWith('.de.json')).map(f=>JSON.parse(readFileSync(resolve(out,'inputs/catalog',f),'utf8')))
const proposed=JSON.parse(readFileSync(resolve(out,'proposed',payload.canonicalPath),'utf8'));const after=catalog.map(d=>normalizeCanonicalLandscape(d.landscapeId===proposed.landscapeId?proposed:d))
const universe={landscapeId:'all-canonical',title:'complete canonical catalog',goals:after.flatMap(d=>d.goals)}
const universes=new Map(after.map(d=>[d.landscapeId,d]));const goalBy=new Map(universe.goals.map(g=>[g.id,g]));const roots=new Map(after.map(d=>[d.landscapeId,String(d.rootId??d.goals[0].id)]))
const list=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?list(resolve(p,x.name)):x.isFile()&&x.name.endsWith('.json')?[resolve(p,x.name)]:[])
const rows=[]
for(const path of list(resolve(root,'curricula/DE/Gymnasium/composition-views'))){const raw=readFileSync(path);const value=JSON.parse(String(raw));if(value.landscapeId!==proposed.landscapeId)continue
 const view=normalizeCompositionView(value),result=compileCompositionView(view,universes.get(view.landscapeId)!,universe,universes)
 const role=collectCompositionProjectionRoleGoalIds(view.rootNodes,goalBy,roots)
 rows.push({path:relative(root,path),rawSha256:'sha256:'+createHash('sha256').update(raw).digest('hex'),viewId:view.viewId,scope:view.scope,errors:result.findings.filter(x=>x.severity==='error'),newAssessments:payload.newAssessments.map((g:any)=>({goalId:g.id,authoredTargetMembership:role.targetGoalIds.has(g.id),authoredPrerequisiteOnlyMembership:role.prerequisiteOnlyGoalIds.has(g.id),declaredApplicability:g.applicability.jurisdiction,targetGoalAuthoredMembership:role.targetGoalIds.has(g.requires[0])}))})
}
writeFileSync(resolve(out,'proposed-view-compilation.actual.json'),JSON.stringify({status:rows.every(x=>!x.errors.length)?'pass':'fail',engine:'native compileCompositionView + collectCompositionProjectionRoleGoalIds',limits:'Authored subtree membership is measured before final applicability and learning-closure filtering. This is not a native backend Personal Curriculum acceptance result, release or new official country/year assignment. Regenerate duration views and run full native offered inventory after independent current review.',views:rows.length,viewsWithErrors:rows.filter(x=>x.errors.length).length,rows},null,2)+'\n')
console.log(JSON.stringify({views:rows.length,viewsWithErrors:rows.filter(x=>x.errors.length).length,newAssessmentAuthoredTargetCounts:Object.fromEntries(payload.newAssessments.map((g:any)=>[g.id,rows.filter(x=>x.newAssessments.find((e:any)=>e.goalId===g.id)?.authoredTargetMembership).length]))},null,2))
