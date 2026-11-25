import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
import { applyCompositionViewProjection } from '/home/enpasos/projects/skillpilot/app/src/utils/compositionViewRuntime.ts'
import { buildLearnerNavigationProjection, normalizeLearnerProjectedEntries } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerTreeProjection.ts'
import { buildDirectChildrenMap } from '/home/enpasos/projects/skillpilot/app/src/utils/treeProjectionRuntime.ts'
import { deriveLearnerUnitMapPreview, PHYSICS_LANDSCAPE_ID as physics } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerNavigation/learnerUnitMapPreview.ts'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerNavigation/learnerUnitMapProjection.ts'
import { buildUnitFlashcardActions } from '/home/enpasos/projects/skillpilot/app/src/components/learningUnitMap/unitLearningMaterialActions.ts'
import { selectPracticeCards } from '/home/enpasos/projects/skillpilot/app/src/utils/flashcardPractice.ts'
import { getSrsFilterTagsForGoal } from '/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts'
const root='/home/enpasos/projects/skillpilot'
const git=(commit:string,path:string)=>JSON.parse(execFileSync('git',['show',`${commit}:${path}`],{cwd:root,encoding:'utf8',maxBuffer:100e6}))
const canonical=prepareLandscapeEntries(['MATHEMATIK','PHYSIK'].map(name=>git('a88f17523b',`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`)))
const deck=git('a88f17523b','curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json')
const memory=git('a88f17523b','curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json').unit.flashcardGoalId
const files=['gk','gk-g8','gk-g9','lk','lk-g8','lk-g9','sekii-gk','sekii-lk'].map(name=>`de-he-${name}.view.json`)
const result:any[]=[]
for(const filename of files) {
 const row:any={filename}
 for(const [label,commit] of [['before','948f2a419d'],['after','a88f17523b']]) {
  const view=git(commit,`curricula/DE/Gymnasium/composition-views/physik/${filename}`)
  const projected=normalizeLearnerProjectedEntries(applyCompositionViewProjection(canonical,view))
  const goals=new Map(projected.flatMap(landscape=>landscape.goals).map(goal=>[goal.id,goal]))
  const {childrenByParent:visibleChildrenByParent,navigationGoals:goalIndexAll}=buildLearnerNavigationProjection(goals,buildDirectChildrenMap(goals))
  const rootGoals=[...goalIndexAll.values()].filter(goal=>goal.tags?.includes('root'))
  const visibleGoalIds=new Set<string>();const visit=(id:string)=>{if(visibleGoalIds.has(id))return;visibleGoalIds.add(id);for(const child of visibleChildrenByParent.get(id)??[])visit(child)}
  rootGoals.forEach(goal=>visit(goal.id))
  const input={rootGoals,goalIndexAll,visibleGoalIds,visibleChildrenByParent,canonicalGoalIndexAll:new Map(canonical.flatMap(landscape=>landscape.goals).map(goal=>[goal.id,goal]))}
  const preview=deriveLearnerUnitMapPreview({...input,landscapeSources:canonical})
  const fixture=filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({...input,units:preview.units,after:preview.after,memberUnits:preview.memberUnits}),new Set([physics]))
  const find=(suffix:string)=>[...goalIndexAll.values()].find(goal=>goal.extendedData?.compositionNodeId===suffix)?.id
  const e2=find('physics-e2-newton-and-conservation')!
  const e2Map=fixture.entryPaths?.[e2]?.at(-1)??e2
  const e2Entry=fixture.entries[e2Map]
  const actions=buildUnitFlashcardActions(memory,fixture,goalIndexAll,visibleGoalIds,deck.cards,'de')
  const cardIds=(id:string)=>{const action=actions.get(id);return action?selectPracticeCards(deck.cards,getSrsFilterTagsForGoal(goalIndexAll.get(memory)!),action.goalIds).map(c=>c.id):[]}
  const childIds=e2Entry?.children??[]
  row[label]={e2,e2Map,e2Entry,boardChildren:childIds.map(id=>({id,title:fixture.entries[id]?.title,kind:fixture.entries[id]?.kind})),
   mapFindings:fixture.findings,boardRelations:fixture.scopeRelations?.[e2Map],
   treeChildren:(visibleChildrenByParent.get(e2)??[]).map(id=>({id,title:goalIndexAll.get(id)?.title,kind:goalIndexAll.get(id)?.nodeKind})),
   cardIds:cardIds(e2Map),childCards:Object.fromEntries(childIds.filter(id=>fixture.entries[id]?.kind==='unit').map(id=>[id,cardIds(id)])),
   movedPaths:Object.fromEntries(['eb0ffdea-c12d-56df-b7e8-c0297d2f8aff','a42f91a4-0d21-5aa9-ae11-f48be6f2e431','594f7f21-6b8a-531c-8424-5f1dcbaf0f23','e359f8bb-6106-44aa-9edf-694528d2d2a9'].map(id=>[id,fixture.entryPaths?.[id]??[]]))}
 }
 result.push(row)
 console.log(filename,'board children',row.before.boardChildren.length,'=>',row.after.boardChildren.length,'cards',row.before.cardIds.length,'=>',row.after.cardIds.length,'childCards',Object.values(row.after.childCards).map((x:any)=>x.length),'findings',row.after.mapFindings.length)
}
writeFileSync(new URL('./map-probe.actual.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
