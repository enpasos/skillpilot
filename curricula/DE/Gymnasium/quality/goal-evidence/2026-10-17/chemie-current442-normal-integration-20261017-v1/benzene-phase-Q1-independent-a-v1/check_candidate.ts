import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { reviewPositiveGoalEvidenceConfig } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1'
const out=base+'/benzene-phase-Q1-independent-a-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const pin=(p:string)=>{const bytes=readFileSync(p);return {path:resolve(p),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
const old=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const next=read(base+'/benzene-phase-Q1-native-adapter-v1/C654.exact-one-phase-candidate.json.snapshot')
const gid='4bdbdf32-3021-5a0a-b412-b611166b2d21'
const maps=[old,next].map(c=>new Map(c.goals.map((g:any)=>[g.id,g])))
const root=old.goals.find((g:any)=>(g.tags??[]).includes('root'))
const roots=new Map([[old.landscapeId,root.id]])
const viewDir='curricula/DE/Gymnasium/composition-views/chemie'
const views=readdirSync(viewDir).filter(f=>f.endsWith('.view.json')).sort().map(f=>{
 const path=viewDir+'/'+f;const v=read(path)
 const a=collectCompositionProjectionRoleGoalIds(v.rootNodes,maps[0] as any,roots)
 const b=collectCompositionProjectionRoleGoalIds(v.rootNodes,maps[1] as any,roots)
 const array=(s:Set<string>)=>Array.from(s).sort()
 const targetsEqual=JSON.stringify(array(a.targetGoalIds))===JSON.stringify(array(b.targetGoalIds))
 const prereqsEqual=JSON.stringify(array(a.prerequisiteOnlyGoalIds))===JSON.stringify(array(b.prerequisiteOnlyGoalIds))
 const role=(x:typeof a)=>x.targetGoalIds.has(gid)?'target':x.prerequisiteOnlyGoalIds.has(gid)?'prerequisiteOnly':'absent'
 return {file:pin(path),viewId:v.viewId,scope:v.scope,allTargetGoalIdsExact:targetsEqual,allPrerequisiteOnlyGoalIdsExact:prereqsEqual,targetCount:a.targetGoalIds.size,prerequisiteOnlyCount:a.prerequisiteOnlyGoalIds.size,benzeneRoleBefore:role(a),benzeneRoleAfter:role(b)}
})
if(views.length!==41||views.some(v=>!v.allTargetGoalIdsExact||!v.allPrerequisiteOnlyGoalIdsExact))throw Error('Composition role mismatch')
const config=base+'/benzene-phase-Q1-native-adapter-v1/P1.validation-candidate.config.json'
const p=reviewPositiveGoalEvidenceConfig(config)
const result={atUTC:new Date().toISOString(),actualStockFunction:'reviewPositiveGoalEvidenceConfig',config:pin(config),errors:p.errors,counts:p.counts,all41CompositionRoleSetsExact:true,compositionRoleFunction:'collectCompositionProjectionRoleGoalIds',compositionRoleFunctionSource:pin('app/src/utils/authoring/compositionViewAuthoring.ts'),views}
writeFileSync(out+'/CHECK.P1-and-all41-roles.actual.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({errors:p.errors,counts:p.counts,viewCount:views.length,all41CompositionRoleSetsExact:true,HE:views.filter(v=>v.scope.jurisdiction==='DE-HE').map(v=>({view:v.viewId,role:v.benzeneRoleAfter}))}))
