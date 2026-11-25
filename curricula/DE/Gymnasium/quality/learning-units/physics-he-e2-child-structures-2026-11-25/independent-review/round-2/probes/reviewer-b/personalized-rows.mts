import {execFileSync} from 'node:child_process'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve, dirname} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import assert from 'node:assert/strict'

const rev = '4f963b4b78'
const here = dirname(fileURLToPath(import.meta.url))
const plans = JSON.parse(readFileSync(resolve(here, 'measure.actual.json'),'utf8')).plans
const git=(...args:string[])=>execFileSync('git', args,{encoding:'utf8', maxBuffer:64*1024*1024})
if (git('diff','--name-only',rev,'--','app/src','app/scripts/lib')) throw Error('Runtime differs from pinned Git object')
const app=(file:string)=>import(pathToFileURL(resolve('app',file)).href)
const {prepareLandscapeEntries} = await app('src/hooks/useLandscapes.ts')
const {applyCompositionViewProjection,applyPersonalCurriculumProjection} = await app('src/utils/compositionViewRuntime.ts')
const {buildLearnerNavigationProjection,normalizeLearnerProjectedEntries} = await app('src/utils/learnerTreeProjection.ts')
const {buildDirectChildrenMap} = await app('src/utils/treeProjectionRuntime.ts')
const {deriveLearnerUnitMapPreview} = await app('src/utils/learnerNavigation/learnerUnitMapPreview.ts')
const {buildLearnerUnitMapProjection,filterLearnerUnitMapToSubjects} = await app('src/utils/learnerNavigation/learnerUnitMapProjection.ts')
const {buildSortedChildrenMap}= await app('src/utils/learnerNavigation/treeSiblingOrder.ts')
const read=(path:string)=>JSON.parse(git('show',rev+':curricula/DE/Gymnasium/'+path))
const physics=read('canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const out:any={}
for(const course of ['GK','LK']) {
  const view=read('composition-views/physik/de-he-sekii-'+course.toLowerCase()+'.view.json')
  const sources=prepareLandscapeEntries([physics])
  const projection=normalizeLearnerProjectedEntries(applyCompositionViewProjection(sources,view))
  const personalMeta={revision:'atomic-prerequisite-learning-v1',rootLandscapeId:physics.landscapeId,scopeRevision:'review-from-predecessor-e2-scope',targetGoalIds:plans[course].newSorted,seedGoalIds:[],requiredByPaths:{}}
  const sourceWithMeta=sources.map((s:any)=>({...s,meta:{...s.meta,personalCurriculumProjection:personalMeta}}))
  const observed:any={}
  for(const [label, projected] of [['withoutPersonalScope',projection],['sectionWithPersonalScope',applyPersonalCurriculumProjection(projection,sourceWithMeta)]] as const){
    const map=new Map<string,any>(projected.flatMap((s:any)=>s.goals).map((g:any)=>[g.id,g]))
    const {navigationGoals:goalIndexAll,childrenByParent:visibleChildrenByParent}=buildLearnerNavigationProjection(map,buildDirectChildrenMap(map))
    const rootGoals=[...goalIndexAll.values()].filter((g:any)=>g.tags?.includes('root'))
    const visibleGoalIds=new Set<string>()
    const visit=(id:string)=>{if(visibleGoalIds.has(id))return;visibleGoalIds.add(id);(visibleChildrenByParent.get(id)??[]).forEach(visit)}
    rootGoals.forEach((g:any)=>visit(g.id))
    const inputs={rootGoals,goalIndexAll,visibleChildrenByParent,visibleGoalIds,canonicalGoalIndexAll:new Map(sources.flatMap((l:any)=>l.goals).map((g:any)=>[g.id,g]))}
    const pre=deriveLearnerUnitMapPreview({...inputs,landscapeSources:sources})
    const board=filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({...inputs,units:pre.units,after:pre.after,memberUnits:pre.memberUnits}),new Set([physics.landscapeId]))
    const tree=buildSortedChildrenMap(visibleChildrenByParent,goalIndexAll,'learner',board)
    const section='composition:'+view.viewId+':structure:physics-e2-newton-and-conservation'
    const alias=(id:string)=>goalIndexAll.get(id)?.extendedData?.compositionNodeId??id
    observed[label]={tree:(tree.get(section)??[]).map(alias),board:(board.entries[section]?.children??[]).map(alias)}
  }
  assert.equal(observed.withoutPersonalScope.tree.length,10)
  const count=course==='GK'?10:8
  assert.equal(observed.sectionWithPersonalScope.tree.length,count)
  assert.equal(observed.sectionWithPersonalScope.board.length,count)
  out[course]=observed
}
writeFileSync(resolve(here,'personalized-rows.actual.json'),JSON.stringify(out,null,2)+'\n')
console.log(Object.fromEntries(Object.entries(out).map(([c,values]:[string,any])=>[c,Object.fromEntries(Object.entries(values).map(([k,v]:[string,any])=>[k,v.board.length]))])))
