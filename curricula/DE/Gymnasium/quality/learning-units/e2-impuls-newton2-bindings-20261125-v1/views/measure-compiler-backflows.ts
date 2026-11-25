// SPDX-License-Identifier: Apache-2.0
// Exact fixture contract of app/scripts/testPhysicsStageViewProjection.ts.
import {execFileSync} from 'node:child_process'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
async function main(){
 const [root,output,revision]=process.argv.slice(2)
 const load=async(path:string)=>import(pathToFileURL(resolve(root,path)).href)
 const {prepareLandscapeEntries}=await load('app/src/hooks/useLandscapes.ts')
 const {applyCompositionViewProjection,applyPersonalCurriculumProjection}=await load('app/src/utils/compositionViewRuntime.ts')
 const {normalizeLearnerProjectedEntries,collapseLearnerSubjectRoots}=await load('app/src/utils/learnerTreeProjection.ts')
 const {buildDirectChildrenMap}=await load('app/src/utils/treeProjectionRuntime.ts')
 const {deriveLearnerUnitMapPreview,PHYSICS_LANDSCAPE_ID}=await load('app/src/utils/learnerNavigation/learnerUnitMapPreview.ts')
 const {buildLearnerUnitMapProjection}=await load('app/src/utils/learnerNavigation/learnerUnitMapProjection.ts')
 const read=(path:string)=>JSON.parse(revision!=='current'?execFileSync('git',['show',revision+':'+relative(root,path)],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}):readFileSync(path,'utf8'))
 const canonical=resolve(root,'curricula/DE/Gymnasium/canonical')
 const source=prepareLandscapeEntries(readdirSync(canonical).filter(f=>f.endsWith('.json')).map(f=>read(resolve(canonical,f))))
 const canonicalGoals=new Map(source.flatMap((e:any)=>e.goals.map((g:any)=>[g.id,g])))
 const views=resolve(root,'curricula/DE/Gymnasium/composition-views/physik'),rows=[]
 for(const file of readdirSync(views).filter(f=>f.endsWith('.view.json')).sort()){
  const view=read(resolve(views,file))
  const composed=normalizeLearnerProjectedEntries(applyCompositionViewProjection(source,view))
  const projected=applyPersonalCurriculumProjection(composed,source)
  const goalIndexAll=new Map(projected.flatMap((e:any)=>e.goals).map((g:any)=>[g.id,g]))
  const {childrenByParent:visibleChildrenByParent}=collapseLearnerSubjectRoots(goalIndexAll,buildDirectChildrenMap(goalIndexAll))
  const rootGoals=[...goalIndexAll.values()].filter((g:any)=>g.landscapeId===PHYSICS_LANDSCAPE_ID&&g.tags.includes('root'))
  const visibleGoalIds=new Set<string>();const visit=(id:string)=>{if(visibleGoalIds.has(id))return;visibleGoalIds.add(id);(visibleChildrenByParent.get(id)??[]).forEach(visit)};rootGoals.forEach((g:any)=>visit(g.id))
  const input={rootGoals,goalIndexAll,visibleChildrenByParent,visibleGoalIds,landscapeSources:source,canonicalGoalIndexAll:canonicalGoals}
  const maximum=deriveLearnerUnitMapPreview(input).maxStep,levels=[]
  for(let step=1;step<=maximum;step++){
   const preview=deriveLearnerUnitMapPreview(input,step)
   const map=buildLearnerUnitMapProjection({...input,units:preview.units,after:preview.after})
   const bad=map.findings.filter((f:any)=>['unknownUnit','afterNotSiblings','contradictoryAfter','selfAfter'].includes(f.kind));if(bad.length)throw Error(JSON.stringify(bad))
   const backwards=Object.entries(map.scopeRelations??{}).flatMap(([scope,relations]:[string,any])=>relations.filter((r:any)=>r.backward).map((r:any)=>({scope,scopeTitle:map.entries[scope]?.title,source:r.source,sourceTitle:map.entries[r.source]?.title,target:r.target,targetTitle:map.entries[r.target]?.title,provenance:r.provenance})))
   levels.push({step,scopeCount:Object.keys(map.scopeRelations??{}).length,backwards})
  }
  rows.push({file,viewId:view.viewId,scope:view.scope,levels});process.stderr.write(file+'\n')
 }
 writeFileSync(output,JSON.stringify({sourceState:revision,method:'Exact unpersonalized compiler fixture of testPhysicsStageViewProjection.ts; same current app functions against baseline/current data; all nested scopeRelations. Unlike Task-G, no synthetic Personal Curriculum closure or native course applicability restriction is introduced.',rows},null,2)+'\n')
}
main().catch(e=>{console.error(e);process.exit(1)})
