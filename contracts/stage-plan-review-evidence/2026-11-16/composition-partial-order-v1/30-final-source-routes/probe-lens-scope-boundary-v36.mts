import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync,mkdirSync,mkdtempSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createRouteProfiles,evaluateRouteProfile} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot',out=process.argv[2] ? resolve(process.argv[2]) : resolve(root,'tmp/pipeline/laender-stufen/gesamt/review/remaining-lower-assessments')
mkdirSync(out,{recursive:true})
const dir=resolve(root,'curricula/DE/Gymnasium/canonical'),files=readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>resolve(dir,n))
const catalog=files.map(p=>JSON.parse(readFileSync(p,'utf8'))),physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')
const goals=new Map<string,any>(catalog.flatMap(l=>l.goals).map(g=>[g.id,g]))
const viewDir=resolve(root,'curricula/DE/Gymnasium/composition-views/physik')
const views=readdirSync(viewDir).filter(n=>n.endsWith('.view.json')).map(n=>resolve(viewDir,n))
const paths=[...files,...views,resolve(root,'app/scripts/generateCurriculumQualityStatus.ts'),resolve(root,'app/scripts/lib/explicitAtomicRouteEndpoints.ts')]
const pins=()=>Object.fromEntries(paths.map(p=>[p.slice(root.length+1),createHash('sha256').update(readFileSync(p)).digest('hex')]))
const before=pins(),profile=createRouteProfiles().find(p=>p.profileId==='canonical-physics-sek1')!
const task='3b7b2b62-e39c-5936-b0d8-5406206e57b6',competency='84ddb244-e560-592f-9d43-e84c801fe5b4'
const applicability=buildApplicabilityCompilation(catalog.map((landscape,i)=>({landscape,file:files[i]})))
function inspect(path:string){
 const view=JSON.parse(readFileSync(path,'utf8')),assignments=new Map<string,{priority:number;distance:number;target:boolean}>()
 function visit(nodes:any[]){for(const n of nodes){if(n.kind==='structure'){visit(n.children);continue}const priority=n.kind==='goalEntry'?2:1,target=n.projectionRole!=='prerequisiteOnly';function expand(id:string,distance:number){const old=assignments.get(id);if(!old||priority>old.priority||priority===old.priority&&(distance<old.distance||distance===old.distance&&target))assignments.set(id,{priority,distance,target});if(n.kind==='canonicalSubtree')for(const child of goals.get(id).contains??[])expand(child.split(':').at(-1),distance+1)}expand(n.goalId,0)}}
 visit(view.rootNodes)
 const seeds=new Set<string>()
 for(const[id,a]of assignments){const g=goals.get(id);if(!a.target||g.contains?.length)continue;const tags=g.tags??[],course=view.scope.courseProfile,release=String(g.release?.courseLevel??'').trim().toUpperCase();if(!course||!tags.length||tags.includes(course)||release===course||!tags.some((t:string)=>t==='GK'||t==='LK')&&!release)seeds.add(id)}
 const learning=new Set<string>(),pending=[...seeds,...profile.motivationAnchorGoalIds]
 while(pending.length){const id=pending.pop()!;if(learning.has(id))continue;learning.add(id);pending.push(...(goals.get(id).requires??[]).map((id:string)=>id.split(':').at(-1)))}
 return {viewId:view.viewId,taskRole:assignments.get(task)?.target?'target':assignments.has(task)?'prerequisiteOnly':'absent',taskInS:seeds.has(task),taskInL:learning.has(task),competencyInS:seeds.has(competency),competencyInL:learning.has(competency)}
}
const canonical=['de-de-gym-physics-gk.view.json','de-de-gym-physics-lk.view.json'].map(name=>inspect(resolve(viewDir,name)))
for(const r of canonical){assert.equal(r.taskInS,false);assert.equal(r.taskInL,false);assert.equal(r.competencyInS,false);assert.equal(r.competencyInL,false)}
const rows=[]
for(const state of ['mv','sl']){
 const selected=views.filter(p=>p.split('/').at(-1)!.startsWith('de-'+state+'-'))
 const baseline=evaluateRouteProfile(physics,profile,applicability,catalog,selected).rules.find(r=>r.id==='CQR-104')!
 assert.equal(baseline.status,'pass',JSON.stringify(baseline))
 for(const kind of ['cross-target-downgraded','stage-target-downgraded']){
  const isolated=mkdtempSync(resolve(out,`lens-${state}-${kind}-`)),copied=[]
  for(const source of selected){const name=source.split('/').at(-1)!,view=JSON.parse(readFileSync(source,'utf8'));if(name===`de-${state}-${kind.startsWith('cross')?'gk':'seki'}.view.json`){function remove(nodes:any[]):any[]{return nodes.filter(n=>n.goalId!==task).map(n=>n.kind==='structure'?{...n,children:remove(n.children)}:n)}view.rootNodes=remove(view.rootNodes);view.rootNodes.push({kind:'goalEntry',goalId:task,projectionRole:'prerequisiteOnly'})}const path=resolve(isolated,name);writeFileSync(path,JSON.stringify(view,null,2)+'\n');copied.push(path)}
  const failed=evaluateRouteProfile(physics,profile,applicability,catalog,copied).rules.find(r=>r.id==='CQR-104')!
  assert.equal(failed.status,'fail');assert(failed.details?.some(d=>d.startsWith('Missing terminal autonomy goal(s):')&&d.includes(task)),JSON.stringify(failed))
  rows.push({state,kind,status:'EXPECTED_FAIL',rule:failed,isolatedViewDirectory:isolated.slice(root.length+1)})
 }
}
const after=pins(),drift=Object.keys(before).filter(p=>before[p]!==after[p]);assert.deepEqual(drift,[])
const result={status:'PASS',reviewer:'/root/he_ephase_source_review',at:new Date().toISOString(),inputPins:before,inputDrift:drift,
 canonicalDormantContexts:canonical,positiveLandContexts:['MV','SL'],negativeCases:rows,
 limits:'No production view/model was mutated. Negatives remove atomic target refs and add an explicit POnly exclusion to prevent a broad subtree fallback from retaining the target. Catalog existence alone never imports a task or assessed competency into S/L.'}
writeFileSync(resolve(out,'lens-scope-boundary.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({status:'PASS',canonicalDormantContexts:canonical,positiveLandContexts:2,negativeCases:rows.length,inputDrift:drift},null,2))
