// SPDX-License-Identifier: Apache-2.0
// Current native composition/personal/navigation/map projection; no backend session claim.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

async function main() {
const [root, output, revision] = process.argv.slice(2)
const load = async (file:string) => import(pathToFileURL(resolve(root,file)).href)
const {prepareLandscapeEntries}=await load('app/src/hooks/useLandscapes.ts')
const {collectCompositionProjectionRoleGoalIds}=await load('app/src/utils/authoring/compositionViewAuthoring.ts')
const {applyCompositionViewProjection,applyPersonalCurriculumProjection}=await load('app/src/utils/compositionViewRuntime.ts')
const {normalizeLearnerProjectedEntries,buildLearnerNavigationProjection}=await load('app/src/utils/learnerTreeProjection.ts')
const {buildDirectChildrenMap}=await load('app/src/utils/treeProjectionRuntime.ts')
const {buildLearnerMapProjection}=await load('app/src/utils/learnerNavigation/learnerMapProjection.ts')
const {goalMatchesFilters}=await load('app/src/utils/goalFilters.ts')
const {deriveLearnerUnitMapPreview}=await load('app/src/utils/learnerNavigation/learnerUnitMapPreview.ts')
const {buildLearnerUnitMapProjection,filterLearnerUnitMapToSubjects}=await load('app/src/utils/learnerNavigation/learnerUnitMapProjection.ts')
const canonDir=resolve(root,'curricula/DE/Gymnasium/canonical'), viewDir=resolve(root,'curricula/DE/Gymnasium/composition-views')
const read=(path:string)=>JSON.parse(revision && revision!=='current' ? execFileSync('git',['show',revision+':'+relative(root,path)],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}) : readFileSync(path,'utf8'))
const docs=readdirSync(canonDir).filter(f=>f.endsWith('.json')).sort().map(f=>read(resolve(canonDir,f)))
const source=prepareLandscapeEntries(docs)
const goals=new Map<string,any>(source.flatMap((e:any)=>e.goals.map((g:any)=>[g.id,g])))
const physics=docs.find(d=>d.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'),math=docs.find(d=>d.subject==='Mathematik')??docs.find(d=>d.title==='Mathematik')
if (!physics||!math) throw Error('Missing subjects')
const keys:string[]=[]
const ids=Object.fromEntries(keys.map(k=>[k,[...goals.keys()].find(id=>id.startsWith(k))]))
if(Object.values(ids).some(id=>!id))throw Error('Missing tracked goal')
const atomic=(id:string)=>{const g=goals.get(id);return g&&g.type!=='cluster'&&!g.contains.length}
const roots=new Map(docs.map(d=>[d.landscapeId,d.goals.find((g:any)=>(g.tags??[]).includes('root'))?.id]))
const roles=(v:any)=>collectCompositionProjectionRoleGoalIds(v.rootNodes,goals,roots)
const seeds=(v:any)=>new Set<string>([...roles(v).targetGoalIds].filter((id:any)=>atomic(id)&&goalMatchesFilters(goals.get(id),[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean))))
function closed(seed:Set<string>){
 const paths=new Map<string,string[]>([...seed].map(id=>[id,[id]])),queue=[...seed]
 for(let i=0;i<queue.length;i++)for(const ref of goals.get(queue[i])?.requires??[]){const id=ref.split(':').at(-1);if(!goals.has(id))throw Error('Missing prerequisite '+ref);if(!paths.has(id)){paths.set(id,[...paths.get(queue[i])!,id]);queue.push(id)}}
 return paths
}
function projected(views:any[],seed:Set<string>){
 const paths=closed(seed)
 const personal=source.map((e:any)=>({...e,meta:{...e.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'a0e13c56-c25f-4742-9272-3a1a603ee52e',scopeRevision:'e2-bindings-20261125-current',seedAtomicGoalIds:e.goals.filter((g:any)=>seed.has(g.id)).map((g:any)=>g.id),targetGoalIds:e.goals.filter((g:any)=>paths.has(g.id)).map((g:any)=>g.id),requiredByPaths:Object.fromEntries(e.goals.filter((g:any)=>paths.has(g.id)&&!seed.has(g.id)).map((g:any)=>[g.id,paths.get(g.id)]))}}}))
 // Preserve the runtime call order used by the preparation-placement consumer tests.
 const activeSubjects=new Set(views.map(v=>v.landscapeId))
 const runtimeSource=source.filter((e:any)=>activeSubjects.has(e.meta.landscapeId)||e.goals.some((g:any)=>paths.has(g.id))).map((e:any)=>activeSubjects.has(e.meta.landscapeId)?e:{...e,goals:e.goals.filter((g:any)=>paths.has(g.id))})
 const composed=normalizeLearnerProjectedEntries(views.reduce((entries,v)=>applyCompositionViewProjection(entries,v),runtimeSource))
 const actual=applyPersonalCurriculumProjection(composed,personal)
 const index=new Map<string,any>(actual.flatMap((e:any)=>e.goals.map((g:any)=>[g.id,g])))
 const nav=buildLearnerNavigationProjection(index,buildDirectChildrenMap(index))
 const visible=new Set<string>(nav.navigationGoals.keys())
 const rootGoals=[...nav.navigationGoals.values()].filter((g:any)=>(g.tags??[]).includes('root')&&g.contains.length)
 const map=buildLearnerMapProjection({rootGoals,goalIndexAll:nav.navigationGoals,canonicalGoalIndexAll:goals,visibleGoalIds:visible,visibleChildrenByParent:nav.childrenByParent})
 const places=(goalId:string)=>{const path=map.entryPaths?.[goalId];return path?.map((id:string)=>({id,title:map.entries[id]?.title??index.get(id)?.title,compositionNodeId:index.get(id)?.extendedData?.compositionNodeId,compositionViewId:index.get(id)?.extendedData?.compositionViewId}))??null}
 const unitInput={rootGoals,goalIndexAll:nav.navigationGoals,canonicalGoalIndexAll:goals,visibleGoalIds:visible,visibleChildrenByParent:nav.childrenByParent,landscapeSources:source}
 const maximum=deriveLearnerUnitMapPreview(unitInput).maxStep
 const backflows=[]
 for(let step=1;step<=maximum;step++){
  const preview=deriveLearnerUnitMapPreview(unitInput,step)
  const complete=buildLearnerUnitMapProjection({...unitInput,units:preview.units,after:preview.after,memberUnits:preview.memberUnits})
  const fixture=filterLearnerUnitMapToSubjects(complete,new Set([physics.landscapeId]))
  const bad=fixture.findings.filter((f:any)=>['unknownUnit','afterNotSiblings','contradictoryAfter','selfAfter'].includes(f.kind))
  if(bad.length)throw Error('Invalid actual nested map '+JSON.stringify(bad))
  const backwardsOf=(map:any)=>Object.entries(map.scopeRelations??{}).flatMap(([scope,relations]:[string,any])=>relations.filter((r:any)=>r.backward).map((r:any)=>({scope,scopeTitle:map.entries[scope]?.title,source:r.source,sourceTitle:map.entries[r.source]?.title,target:r.target,targetTitle:map.entries[r.target]?.title,provenance:r.provenance})))
  const backwards=backwardsOf(fixture)
  backflows.push({step,scopes:Object.keys(fixture.scopeRelations??{}).length,units:Object.values(fixture.entries).filter((e:any)=>e.kind==='unit').length,backwards,
    combinedAllBackwards:views.length>1?backwardsOf(complete):undefined,
    mathematicsBackwards:views.length>1?backwardsOf(filterLearnerUnitMapToSubjects(complete,new Set([math.landscapeId]))):undefined})
 }
 return {paths,places,reachable:(id:string)=>!!map.entries[id],backflows}

}
// Source places preserve structure IDs and labels; no school grade is inferred from canonical phase metadata.
function authored(v:any,id:string){const out:any[]=[];function visit(n:any,path:any[]){if(n.kind==='structure'){n.children.forEach((c:any)=>visit(c,[...path,{id:n.id,title:n.label}]))}else if(n.goalId===id)out.push({kind:n.kind,role:n.projectionRole??'target',acquisitionPlacement:n.acquisitionPlacement===true,path});else if(n.kind==='canonicalSubtree'){const stack=[[n.goalId,0]],seen=new Set();for(const [gid,d]of stack as any){if(seen.has(gid))continue;seen.add(gid);if(gid===id){out.push({kind:n.kind,role:n.projectionRole??'target',distance:d,acquisitionPlacement:false,path});break}goals.get(gid)?.contains.forEach((child:string)=>stack.push([child,d+1]))}}}v.rootNodes.forEach((n:any)=>visit(n,[]));return out}
const mathViews=readdirSync(resolve(viewDir,'mathematik')).filter(f=>f.endsWith('.view.json')).sort().map(f=>({file:f,view:read(resolve(viewDir,'mathematik',f))}))
const sameScope=(a:any,b:any)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort())
const allRows=[]
const summarizeGoal=(key:string,id:string,view:any,ps:Set<string>,pr:any,pclosed:any,pc:any,m:any,ms:Set<string>,mr:any,mclosed:any,mc:any,joint:any)=>({
 id, physicsAuthoredRole:pr.targetGoalIds.has(id)?'target':pr.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',
 physicsOperationalTarget:ps.has(id), inPhysicsLearningBasis:pclosed.has(id), physicsRequirementPath:pclosed.get(id)??null,
 physicsMapPath:pc.places(id), physicsAuthored:authored(view,id),
 mathAuthoredRole:mr.targetGoalIds.has(id)?'target':mr.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',
 mathOperationalTarget:ms.has(id), inMathLearningBasis:mclosed.has(id), mathRequirementPath:mclosed.get(id)??null,
 mathMapPath:mc.places(id), mathAuthored:authored(m.view,id), combinedMapPath:joint.places(id)
})
for(const file of readdirSync(resolve(viewDir,'physik')).filter(f=>f.endsWith('.view.json')).sort()){
 const view=read(resolve(viewDir,'physik',file)),ps=seeds(view),pr=roles(view),pclosed=closed(ps),pc=projected([view],ps)
 const exactScope=mathViews.filter(m=>sameScope(m.view.scope,view.scope))
 const compatibleDuration=mathViews.filter(m=>!view.scope.durationModel&&m.view.scope.durationModel&&sameScope(Object.fromEntries(Object.entries(m.view.scope).filter(([k])=>k!=='durationModel')),view.scope))
 const variants=exactScope.length===1?exactScope:compatibleDuration
 if(!variants.length||exactScope.length>1)throw Error('No unique exact scope or duration variants for '+file)
 const row:any={file,physicsViewId:view.viewId,scope:view.scope,physicsSeedCount:ps.size,physicsLearningBasisCount:pclosed.size,pairing:exactScope.length===1?'exact-scope':'all-duration-variants',physicsBackflows:pc.backflows,pairs:[],sensitivityPairs:[]}
 for(const m of variants){
  if(view.scope.durationModel&&m.view.scope.durationModel!==view.scope.durationModel)throw Error('Duration mismatch')
  const ms=seeds(m.view),mr=roles(m.view),mclosed=closed(ms),mc=projected([m.view],ms),joint=projected([view,m.view],new Set([...ps,...ms]))
  const pair:any={mathFile:m.file,mathViewId:m.view.viewId,mathScope:m.view.scope,mathSeedCount:ms.size,combinedBackflows:joint.backflows,goals:{}}
  for(const [key,id]of Object.entries(ids)as [string,string][])pair.goals[key]=summarizeGoal(key,id,view,ps,pr,pclosed,pc,m,ms,mr,mclosed,mc,joint)
  row.pairs.push(pair)
 }
 if(view.scope.courseProfile==='LK'){
  const gkScope={...view.scope,courseProfile:'GK'}
  const gk=mathViews.filter(m=>sameScope(m.view.scope,gkScope))
  if(gk.length!==1)throw Error('No exact Math GK sensitivity partner '+file)
  const m=gk[0],ms=seeds(m.view),mr=roles(m.view),mclosed=closed(ms),mc=projected([m.view],ms),joint=projected([view,m.view],new Set([...ps,...ms]))
  const pair:any={mathFile:m.file,mathViewId:m.view.viewId,mathScope:m.view.scope,mathSeedCount:ms.size,combinedBackflows:joint.backflows,goals:{}}
  for(const [key,id]of Object.entries(ids)as [string,string][])pair.goals[key]=summarizeGoal(key,id,view,ps,pr,pclosed,pc,m,ms,mr,mclosed,mc,joint)
  row.sensitivityPairs.push(pair)
 }
 allRows.push(row)
 writeFileSync(output+'.partial',JSON.stringify({ids,rows:allRows},null,2)+'\n')
 process.stderr.write(file+'\n')
}
writeFileSync(output,JSON.stringify({sourceState:revision??'current',method:'Actual current app composition, complete Personal Curriculum requires closure, navigation and unit-map preview; all nested preview levels and scopeRelations, Physics subject filter. Current code reads baseline or current data; no historical client replay or actual learner state.',ids,rows:allRows},null,2)+'\n')
}
main().catch(error=>{console.error(error);process.exit(1)})
