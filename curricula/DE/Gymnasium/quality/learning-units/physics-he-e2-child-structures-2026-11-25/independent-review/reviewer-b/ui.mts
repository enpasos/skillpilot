import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import { buildSortedChildrenMap } from '../../../../../app/src/utils/learnerNavigation/treeSiblingOrder'
import { isUnitMaterialSource, findUnitPracticeExercise } from '../../../../../app/src/utils/unitLearningMaterial'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareLandscapeEntries, type LandscapeEntry } from '../../../../../app/src/hooks/useLandscapes'
import type { SkillLandscape } from '../../../../../app/src/landscapeTypes'
import type { CompositionView } from '../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../../../../../app/src/utils/compositionViewRuntime'
import { buildLearnerNavigationProjection, normalizeLearnerProjectedEntries } from '../../../../../app/src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../../../../../app/src/utils/treeProjectionRuntime'
import { buildTreeCompletionProgressMap } from '../../../../../app/src/utils/treeCompletionProgress'
import { selectPracticeCards } from '../../../../../app/src/utils/flashcardPractice'
import { cardOriginGoalIds, legacyOriginGoalTagIds } from '../../../../../app/src/utils/memoryCardOrigins'
import { getSrsFilterTagsForGoal } from '../../../../../app/src/utils/srsTags'
import { buildLearnerUnitMapProjection, filterLearnerUnitMapToSubjects } from '../../../../../app/src/utils/learnerNavigation/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math, PHYSICS_LANDSCAPE_ID as physics } from '../../../../../app/src/utils/learnerNavigation/learnerUnitMapPreview'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, cardDeckIdsByScope, findUnitMaterialScopes, mapDeckGoalIds,
  placeUnitLearningResources, unitResourcePlacements } from '../../../../../app/src/components/learningUnitMap/unitLearningMaterialActions'
import { getLearningScopeRelations } from '../../../../../app/src/components/learningUnitMap/scopeRelations'
import { mapEntryPath } from '../../../../../app/src/components/learningUnitMap/mapEntryPath'
import { UNIT_MAP_LEARNING_MATERIALS as packageMaterials } from '../../../../../app/src/packageConsumer/learnerUnitMapPreviewSubjects'
import { readUnitMapMaterials } from '../../../../../app/scripts/lib/unitLearningMaterialCatalog'
const repo = execFileSync("git",["rev-parse","--show-toplevel"],{encoding:"utf8"}).trim()
const materials = readUnitMapMaterials(resolve(repo,"curricula"))
const memoryId = materials.find(item=>item.unit.compositionNodeId==="physics-e1-motion")!.unit.flashcardGoalId!
const read=async <T,>(path:string):Promise<T> => JSON.parse(await readFile(resolve(repo,"curricula/DE/Gymnasium",path),"utf8"))
const physicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const mathematicsLandscape = await read<SkillLandscape>('canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const canonical = prepareLandscapeEntries([mathematicsLandscape, physicsLandscape])
const input = (views: CompositionView[]) => {
  const projected = normalizeLearnerProjectedEntries(views.reduce<LandscapeEntry[]>((entries, view) =>
    applyCompositionViewProjection(entries, view), canonical))
  const goals = new Map(projected.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent, navigationGoals: goalIndexAll } = buildLearnerNavigationProjection(goals, buildDirectChildrenMap(goals))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags?.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => {
    if (visibleGoalIds.has(id)) return
    visibleGoalIds.add(id)
    for (const child of visibleChildrenByParent.get(id) ?? []) visit(child)
  }
  rootGoals.forEach(goal => visit(goal.id))
  return { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent,
    canonicalGoalIndexAll: new Map(canonical.flatMap(landscape => landscape.goals).map(goal => [goal.id, goal])) }
}
const physicsFixture = (value: ReturnType<typeof input>) => {
  const preview = deriveLearnerUnitMapPreview({ ...value, landscapeSources: canonical })
  return filterLearnerUnitMapToSubjects(buildLearnerUnitMapProjection({ ...value,
    units: preview.units, after: preview.after, memberUnits: preview.memberUnits }), new Set([physics]))
}

const traffic="4a2bf015-052b-4af0-aed7-324259fa1a8a";
const deck=await read<any>("memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json");
const result:any={};
for(const rev of ["948f2a419d","a88f17523b"]) {
 const rv:any={};
 result[rev]=rv;
 for (const scope of ["","-g8","-g9","-sekii"]) for (const course of ["gk","lk"]) {
  const filename = scope === "-sekii" ? "de-he-sekii-"+course : "de-he-"+course+scope;
  const selected=JSON.parse(execFileSync("git", ["show",rev+":curricula/DE/Gymnasium/composition-views/physik/"+filename+".view.json"],{cwd:repo,encoding:"utf8",maxBuffer:4e6}));
  const value=input([selected]);
  const original=physicsFixture(value);
  const tree=buildSortedChildrenMap(value.visibleChildrenByParent, value.goalIndexAll, "learner", original, materials);
  const acts=buildUnitFlashcardActions(memoryId, original, value.goalIndexAll,value.visibleGoalIds,deck.cards,"de");
  const e2=mapEntryPath(original,traffic)!.find(id=>value.goalIndexAll.get(id)?.extendedData?.compositionNodeId==="physics-e2-newton-and-conservation")!;
  const title=(id:string)=>original.entries[id]?.title ?? value.goalIndexAll.get(id)?.title ?? id;
  const actions=(id:string)=>{const act=acts.get(id);return act?selectPracticeCards(deck.cards,getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!),act.goalIds).map(c=>c.id):[]};
  const children=original.entries[e2].children ?? [];
  rv[filename]={board:children.map(title),tree:(tree.get(e2)??[]).map(title),cards:actions(e2),children:children.filter(id=>original.entries[id].kind==="unit").map(id=>({section:title(id),board:(original.entries[id].children??[]).map(title),tree:(tree.get(id)??[]).map(title),cards:actions(id)}))};
 }
}
console.log(JSON.stringify(result,null,2));
