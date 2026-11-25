// Run with the pinned checkout as cwd: app/node_modules/.bin/tsx /path/to/measure-ui.mts
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const base = '948f2a419d18c08c7edd6b5d7f9a5367fe81bcf6'
const head = 'a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d'
const git = (...args: string[]) => execFileSync('git', args, {encoding:'utf8',maxBuffer:64*1024*1024})
if (git('rev-parse','HEAD').trim() !== head || git('diff','--name-only',base,head,'--','app/src').trim()) {
  throw Error('Probe requires the exact reviewed checkout and identical frontend runtime in both versions')
}
const native = (file: string) => import(pathToFileURL(join(process.cwd(), 'app', file)).href)
const {prepareLandscapeEntries} = await native('src/hooks/useLandscapes.ts')
const {applyCompositionViewProjection} = await native('src/utils/compositionViewRuntime.ts')
const {normalizeLearnerProjectedEntries,buildLearnerNavigationProjection} = await native('src/utils/learnerTreeProjection.ts')
const {buildDirectChildrenMap} = await native('src/utils/treeProjectionRuntime.ts')
const {buildSortedChildrenMap} = await native('src/utils/learnerNavigation/treeSiblingOrder.ts')
const {deriveLearnerUnitMapPreview} = await native('src/utils/learnerNavigation/learnerUnitMapPreview.ts')
const {buildLearnerUnitMapProjection,filterLearnerUnitMapToSubjects} = await native('src/utils/learnerNavigation/learnerUnitMapProjection.ts')
const {buildUnitFlashcardActions} = await native('src/components/learningUnitMap/unitLearningMaterialActions.ts')
const {selectPracticeCards} = await native('src/utils/flashcardPractice.ts')
const {getSrsFilterTagsForGoal} = await native('src/utils/srsTags.ts')
const {getLearningScopeRelations} = await native('src/components/learningUnitMap/scopeRelations.ts')
const {readUnitMapMaterials} = await native('scripts/lib/unitLearningMaterialCatalog.ts')
const curriculum='curricula/DE/Gymnasium/'
const read=(rev: string,file:string)=>JSON.parse(git('show',rev+':'+curriculum+file))
const physics=read(head,'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const math=read(head,'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const canonical=prepareLandscapeEntries([math,physics])
const materials=readUnitMapMaterials(join(process.cwd(),'curricula'))
const memory=materials.find((v:any)=>v.unit.compositionNodeId==='physics-e1-motion').unit.flashcardGoalId
const decks=Object.fromEntries(['de','en'].map(lang=>[lang,read(head,'memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.'+lang+'.json')]))
const target='physics-e2-newton-and-conservation'
const e5='he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089'
const changed=git('diff','--name-only',base,head,'--',curriculum+'composition-views/physik').trim().split('\n')
const snapshots=[]
for (const path of changed) {
  for (const commit of [base,head]) {
    const view=read(commit,path.slice(curriculum.length))
    const entries=normalizeLearnerProjectedEntries(applyCompositionViewProjection(canonical,view))
    const goals=new Map(entries.flatMap((l:any)=>l.goals).map((g:any)=>[g.id,g]))
    const {childrenByParent:visibleChildrenByParent,navigationGoals:goalIndexAll}=buildLearnerNavigationProjection(goals,buildDirectChildrenMap(goals))
    const rootGoals=[...goalIndexAll.values()].filter((g:any)=>g.tags?.includes('root'))
    const visibleGoalIds=new Set<string>()
    const visit=(id:string)=>{if (!visibleGoalIds.has(id)) {visibleGoalIds.add(id); (visibleChildrenByParent.get(id)??[]).forEach(visit)}}
    rootGoals.forEach((g:any)=>visit(g.id))
    const projected={rootGoals,visibleChildrenByParent,goalIndexAll,visibleGoalIds,canonicalGoalIndexAll:new Map(canonical.flatMap((l:any)=>l.goals).map((g:any)=>[g.id,g]))}
    const preview=deriveLearnerUnitMapPreview({...projected,landscapeSources:canonical})
    const board=filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({...projected, units:preview.units,after:preview.after,memberUnits:preview.memberUnits}),new Set([physics.landscapeId]))
    const tree=buildSortedChildrenMap(visibleChildrenByParent,goalIndexAll,'learner',board)
    const byShort=(key:string)=>[...goalIndexAll.values()].find((g:any)=>g.extendedData?.compositionNodeId===key)?.id
    const alias=(id:string)=>goalIndexAll.get(id)?.extendedData?.compositionNodeId ?? id
    const units=[target,e5,...Object.keys(board.entries).map(alias).filter((k:string)=>k.startsWith('physics-e2-') && k!==target)]
    const scopeOutputs={}
    for (const key of [...new Set(units)]) {
      const id=byShort(key)
      if (!id || !board.entries[id]) throw Error('No board entry for '+key)
      const actions={}
      for (const lang of ['de','en']) {
        const act=buildUnitFlashcardActions(memory,board,goalIndexAll,visibleGoalIds,decks[lang].cards,lang).get(id)
        actions[lang]=act ? {title:act.title,cardIds:selectPracticeCards(decks[lang].cards,getSrsFilterTagsForGoal(goalIndexAll.get(memory)),act.goalIds).map((v:any)=>v.id).sort()} : null
      }
      scopeOutputs[key]={boardChildren:board.entries[id].children?.map(alias),treeChildren:(tree.get(id)??[]).map(alias),actions,
                         displayedArrows:getLearningScopeRelations(board,id).map((v:any)=>[alias(v.source),alias(v.target)])}
    }
    snapshots.push({file:path,commit,scope:scopeOutputs,mapFindings:board.findings,trafficPath:board.entryPaths['4a2bf015-052b-4af0-aed7-324259fa1a8a']?.map(alias)})
  }
}
console.log(JSON.stringify({base,head,scope:'Native learner projection, physics-only boards, Math + Physics canonical inputs, scoped deck selection before per-learner scheduling.',snapshots},null,2))
