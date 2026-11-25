/** Run via tsx with the pinned checkout as cwd and paths to the actual GK/LK German closure responses. */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const revision = '4f963b4b78922d11fea4029e15fa8183e572dd35'
const git = (...args: string[]) => execFileSync('git', args, { maxBuffer: 32*1024*1024, encoding:'utf8' })
if (git('rev-parse','HEAD').trim() !== revision) throw new Error('Run in pinned checkout')
const load = (name: string) => import(pathToFileURL(resolve('app',name)).href)
const { prepareLandscapeEntries } = await load('src/hooks/useLandscapes.ts')
const { applyCompositionViewProjection, applyPersonalCurriculumProjection, applyMatchedCompositionRouteGoalProjection } = await load('src/utils/compositionViewRuntime.ts')
const { normalizeLearnerProjectedEntries, buildLearnerNavigationProjection } = await load('src/utils/learnerTreeProjection.ts')
const { buildDirectChildrenMap } = await load('src/utils/treeProjectionRuntime.ts')
const { buildSortedChildrenMap } = await load('src/utils/learnerNavigation/treeSiblingOrder.ts')
const { deriveLearnerUnitMapPreview } = await load('src/utils/learnerNavigation/learnerUnitMapPreview.ts')
const { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } = await load('src/utils/learnerNavigation/learnerUnitMapProjection.ts')
const physicsId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const results = []
for (const [index, course] of ['GK','LK'].entries()) {
  const inputBytes = readFileSync(process.argv[index+2])
  const input = JSON.parse(inputBytes.toString())
  const closure = prepareLandscapeEntries(input)
  const viewFile='curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-'+course.toLowerCase()+'.view.json'
  const view=JSON.parse(git('show',revision+':'+viewFile))
  const entries=applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(
    applyMatchedCompositionRouteGoalProjection(applyCompositionViewProjection(closure,view), undefined)),closure,'de')
  const goals=new Map(entries.flatMap((e:any)=>e.goals).map((g:any)=>[g.id,g]))
  const {childrenByParent:visibleChildrenByParent,navigationGoals:goalIndexAll}=buildLearnerNavigationProjection(goals,buildDirectChildrenMap(goals))
  const rootGoals=[...goalIndexAll.values()].filter((g:any)=>g.tags?.includes('root'))
  const visibleGoalIds=new Set<string>()
  function visit(id: string){if(!visibleGoalIds.has(id)){visibleGoalIds.add(id);for(const child of visibleChildrenByParent.get(id)??[])visit(child)}}
  rootGoals.forEach((g:any)=>visit(g.id))
  const projected={rootGoals,visibleChildrenByParent,goalIndexAll,visibleGoalIds,canonicalGoalIndexAll:new Map(closure.flatMap((e:any)=>e.goals).map((g:any)=>[g.id,g]))}
  const preview=deriveLearnerUnitMapPreview({...projected,landscapeSources:closure})
  const board=filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({...projected,units:preview.units,after:preview.after,memberUnits:preview.memberUnits}),new Set([physicsId]))
  const tree=buildSortedChildrenMap(visibleChildrenByParent,goalIndexAll,'learner',board)
  const e2='composition:'+view.viewId+':structure:physics-e2-newton-and-conservation'
  const mapIds=board.entries[e2]?.children, cockpitIds=tree.get(e2)
  if (!Array.isArray(mapIds) || !Array.isArray(cockpitIds)) throw new Error('Missing E.2 learner board or tree')
  const physics=input.find((s:any)=>s.landscapeId===physicsId)
  const exams=['22561c66','72649cf5','68061652','be6d4895'].map(prefix=>{
    const matches=(ids:string[])=>ids.some(id=>id.startsWith(prefix))
    return {prefix,target:matches(physics.personalCurriculumProjection.targetGoalIds), map:matches(mapIds),cockpit:matches(cockpitIds)}
  })
  results.push({course,closureSha256:createHash('sha256').update(inputBytes).digest('hex'),matchedView:view.viewId,scopeRevision:physics.personalCurriculumProjection.scopeRevision,mapIds,cockpitIds,exams})
}
console.log(JSON.stringify({revision,runtime:'Native backend learner closure -> authored Physics view -> personal projection -> board and sorted learner cockpit children',results},null,2))
