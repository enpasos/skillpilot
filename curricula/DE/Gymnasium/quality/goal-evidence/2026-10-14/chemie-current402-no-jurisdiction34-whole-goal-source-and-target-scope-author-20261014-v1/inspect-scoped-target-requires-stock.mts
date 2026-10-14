// Bounded stock target and prerequisite read-only measurements; Apache-2.0.
import {readFileSync, writeFileSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const repo=process.cwd()
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const byId=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const pairs=read(`${own}/INPUT.exact34-whole-goals-and-original-compiler-evidence.actual.json`).rows
const {collectAuthoritativeTargetAtomicGoalIds}=await import(pathToFileURL(resolve(repo,'app/scripts/compositionViewSourceCoverage.ts')).href)
const wantedJurs=new Set(pairs.map((p:any)=>p.jurisdiction))
const viewDir='curricula/DE/Gymnasium/composition-views/chemie'
const views=readdirSync(resolve(repo,viewDir)).filter(n=>n.endsWith('.view.json')).map(n=>({path:`${viewDir}/${n}`,view:read(`${viewDir}/${n}`)})).filter(x=>wantedJurs.has(x.view.scope.jurisdiction))
const targetByView=new Map(views.map(x=>[x.path,new Set(collectAuthoritativeTargetAtomicGoalIds(canonical,x.view))]))
const pendingByJur=new Map([...wantedJurs].map(j=>[j,new Set(pairs.filter((p:any)=>p.jurisdiction===j).map((p:any)=>p.goalId))]))
const rows=pairs.map((p:any)=>{
 const localViews=views.filter(x=>x.view.scope.jurisdiction===p.jurisdiction)
 return {goalId:p.goalId,jurisdiction:p.jurisdiction,title:p.title,scopedViews:localViews.map(x=>{
  const targets=targetByView.get(x.path)!,pending=pendingByJur.get(p.jurisdiction)!
  const consumers=canonical.goals.filter((g:any)=>targets.has(g.id)&&g.requires?.includes(p.goalId))
  return {viewPath:x.path,courseProfile:x.view.scope.courseProfile,isCurrentTarget:targets.has(p.goalId),targetCount:targets.size,
   completeCurrentDirectConsumerBodies:consumers,
   consumersThatAreAlsoInside34RemediationScope:consumers.filter((g:any)=>pending.has(g.id)).map((g:any)=>g.id),
   remainingConsumersIfAllUnsupported34InJurWereOmitted:consumers.filter((g:any)=>!pending.has(g.id)).map((g:any)=>({id:g.id,title:g.title,description:g.description,requires:g.requires,assessment:Boolean(g.examData||g.tags?.includes('Assessment')||g.tags?.includes('Practice'))}))}
 })}
})
writeFileSync(resolve(repo,`${own}/MEASURE.current-targets-and-whole-consumer-bodies.stock.actual.json`),JSON.stringify({schemaVersion:1,rows,stockTargetCollector:'collectAuthoritativeTargetAtomicGoalIds',scopeOnly34:true,activeWrites:false},null,2)+'\n')
console.log(JSON.stringify(rows.map((r:any)=>({goalId:r.goalId,jurisdiction:r.jurisdiction,views:r.scopedViews.filter((v:any)=>v.isCurrentTarget).map((v:any)=>({course:v.courseProfile,remainingConsumers:v.remainingConsumersIfAllUnsupported34InJurWereOmitted.map((g:any)=>({id:g.id,title:g.title}))}))})),null,2))
