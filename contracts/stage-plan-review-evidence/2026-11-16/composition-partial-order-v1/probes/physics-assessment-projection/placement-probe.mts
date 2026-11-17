import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import type { UiGoal } from '/home/enpasos/projects/skillpilot/app/src/goalTypes'
import { normalizeLandscape } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes'
import type { SkillLandscape } from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes'
import {
  collectCompositionProjectionRoleGoalIds,
  type CompositionView,
} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '/home/enpasos/projects/skillpilot/app/src/utils/compositionViewRuntime'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '/home/enpasos/projects/skillpilot/app/src/utils/curriculumDisplay'
import { goalMatchesFilters } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters'
import { normalizeLearnerProjectedEntries } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerTreeProjection'
import { buildVisibleChildrenMap } from '/home/enpasos/projects/skillpilot/app/src/utils/treeProjectionRuntime'
import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler'
import { loadCurrentCurriculumCatalog } from '/home/enpasos/projects/skillpilot/app/scripts/currentCurriculumCatalog'
import { collectRenderedAtomicGoalIdsFromCompositionView, evaluateRouteProfile, createRouteProfiles } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus'
import { liveVerificationInputs } from '/home/enpasos/projects/skillpilot/app/scripts/lib/verificationInputSnapshot'

const routeProfiles = createRouteProfiles()
const root = "/home/enpasos/projects/skillpilot"
const canonicalLandscape = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8')) as SkillLandscape
const canonical = normalizeLandscape(canonicalLandscape)
assert(canonical, 'Canonical Physics must be loadable.')
const canonicalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const viewDirectory = "/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/physics/frozen-v32/views"
const practiceRootIds = [
  '424b07df-bf66-5d7f-99f5-f28b32ad1f22',
  '549a427d-f10a-5537-990e-6fdd7466848b',
  '9dd7c596-a751-523c-acba-916f73e900a5',
  'b47a2a23-b56d-5433-9036-075d6bb7c782',
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2',
]
const abiturRootIds = {
  GK: '61684ca7-b725-534f-944b-c7645cea1792',
  LK: '79028c45-90ae-57eb-8016-f5a96af18fa2',
} as const
const hesseStageViewIds = new Set(['de-he-gym-physics-gk', 'de-he-gym-physics-lk',
  'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8',
  'de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9'])
const newHesseDurationViewIds = new Set([
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8',
  'de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9',
  'de-he-gym-seki-physics-g8', 'de-he-gym-seki-physics-g9',
])
const newLandSekIViewIds = new Set(['bb', 'be', 'bw', 'by', 'hb', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th']
  .map(state => `de-${state}-gym-seki-physics`))
const fermiGoalId = '658cf33d-a0c2-5d47-801a-3dbcd5cac074'
const fermiAssessmentId = '71e8936b-fa8a-50dc-8c47-fca015b85ac5'
const kinematicsAssessments = [
  { id: 'c5807a37-129e-5df6-8989-482bc7f5683e', maxPoints: 24 },
  { id: '6ea3fb3c-abdc-568f-ab13-97c36dc274e4', maxPoints: 36 },
]
const retainedVerticalAssessmentId = '4ab1cf6d-b808-5b86-9291-85df0b9f2496'
assert.equal(canonicalById.get(retainedVerticalAssessmentId)?.extendedData?.applicabilityProjection, 'excluded')
assert.deepEqual(canonicalById.get(retainedVerticalAssessmentId)?.examData?.coveredGoalIds, [])
const astronomyAssessments = new Map([
  ['14cc61c4-4909-5671-b1ee-930a02cb9f51', 'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93'],
  ['50521f0d-71b1-51cf-b30d-650e3abf3036', '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7'],
])
for (const [taskId, basisId] of astronomyAssessments) {
  const task = canonicalById.get(taskId)!
  assert.equal(task.examData?.reviewStatus, 'released')
  assert.deepEqual(task.requires, [basisId])
  assert.deepEqual(task.examData?.coveredGoalIds, [basisId])
}
const diodeSekIJurisdictions = new Set(['DE-BB', 'DE-BE', 'DE-HB', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-SH'])
const diodeTaskIds = [
  'c61b2a69-b5cd-5785-bb04-5d6bca53b218',
  '4ac5a07c-fff0-5eae-890d-89e13eaf69c3',
  '18fb1470-5a03-5277-9486-ae74c63c8a8c',
]
const expectedSekITasks = (view: CompositionView): Array<{ goalId: string; wrapperId: string }> => {
  if (view.scope.stage !== 'CrossStage') return []
  const jurisdiction = view.scope.jurisdiction ?? ''
  // Upper-secondary demand alone does not establish a lower-secondary source placement.
  if (diodeSekIJurisdictions.has(jurisdiction)) return []
  const diodeTasks = diodeTaskIds.map((goalId) => ({ goalId, wrapperId: 'physics-final-diode-seki' }))
  if (['DE-SL', 'DE-SN'].includes(jurisdiction)) return [
    ...diodeTasks,
    ...[...astronomyAssessments.keys()].slice(0, jurisdiction === 'DE-SL' ? 2 : 1)
      .map(goalId => ({ goalId, wrapperId: 'physics-b040-source-local-astronomy' })),
  ]
  if (['DE-ST', 'DE-TH'].includes(jurisdiction)) return diodeTasks.slice(0, 1)
  if (!jurisdiction) {
    return [{ goalId: '74a32716-2b46-5d96-8b57-3f6edb90e088', wrapperId: 'physics-b034-assessments-seki' }, ...diodeTasks]
  }
  return []
}

// Existing scope exclusions, independent of the references being restored.
// A new direct goalEntry must not override these prerequisite-only subtrees.
const q4SupportTaskIds = {
  opticalSound: '51af53cb-8866-52cd-b2ca-af8bd8a836e0',
  opticalChannels: '4dbe6eb9-4d77-58a9-a15c-f0b8bb110a65',
  storedSwitch: '5902ebe8-2025-5a7c-b95d-13057398d6e6',
  elementFormation: '6da29199-f086-512c-89f2-1b5ca865eef9',
  stellarEndStates: '6c87a996-9166-5c6e-8cda-01d40720f9c8',
  reactor: '74a32716-2b46-5d96-8b57-3f6edb90e088',
  emitterCircuit: '144007cb-e2bc-5c82-bf9d-dda705b15257',
}
const q4SupportJurisdictions = new Set([...diodeSekIJurisdictions, 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'])
const expectedPrerequisiteOnlyTasks = (view: CompositionView): string[] => {
  if (view.scope.stage !== 'CrossStage') return []
  if (q4SupportJurisdictions.has(view.scope.jurisdiction ?? '')) {
    return Object.values(q4SupportTaskIds).filter((id) => view.scope.courseProfile === 'GK' || id !== q4SupportTaskIds.emitterCircuit)
  }
  if (!view.scope.jurisdiction) {
    return view.scope.courseProfile === 'GK'
      ? [q4SupportTaskIds.opticalSound, q4SupportTaskIds.opticalChannels, q4SupportTaskIds.emitterCircuit]
      : [q4SupportTaskIds.elementFormation, q4SupportTaskIds.stellarEndStates]
  }
  return []
}

const collectDescendants = (
  rootId: string,
  byId: Map<string, UiGoal>,
  childrenByParent?: Map<string, string[]>,
): Set<string> => {
  const result = new Set<string>()
  const visit = (id: string) => {
    if (result.has(id)) return
    result.add(id)
    const goal = byId.get(id)
    assert(goal, `Missing referenced goal ${id}`)
    ;(childrenByParent ? childrenByParent.get(id) ?? [] : goal.contains).forEach(visit)
  }
  visit(rootId)
  return result
}

const assertAstronomyTargetVisibility = (view: CompositionView, visible: Set<string>): number => {
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalById)
  const filters = [view.scope.courseProfile, view.scope.jurisdiction].filter((value): value is string => !!value)
  // Derive obligations from ordinary targets and canonical prerequisites,
  // independently of whether an assessment reference is present in the view.
  const pending = [...targetGoalIds].filter(id => {
    const goal = canonicalById.get(id)
    return goal && goal.contains.length === 0 && !goal.examData && goalMatchesFilters(goal, filters)
  })
  const demanded = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (demanded.has(id)) continue
    demanded.add(id)
    pending.push(...(canonicalById.get(id)?.requires ?? []).map(ref => ref.split(':').at(-1)!))
  }
  let expected = 0
  for (const [taskId, basisId] of astronomyAssessments) {
    if (!demanded.has(basisId)) continue
    assert(visible.has(taskId), `${view.viewId}: existing astronomy demand needs its released assessment ${taskId}`)
    expected++
  }
  return expected
}

const isBesideExistingAstronomyPreparation = (nodes: CompositionView['rootNodes'], taskId: string): boolean => {
  const basisId = astronomyAssessments.get(taskId)
  if (!basisId) return false
  const references = nodes.filter(node => 'goalId' in node).map(node => node.goalId)
  return (references.includes(taskId) && references.includes(basisId))
    || nodes.some(node => node.kind === 'structure' && isBesideExistingAstronomyPreparation(node.children, taskId))
}

// Assessment coverage is not a prerequisite edge. It still determines which
// content an exercise belongs with: do not schedule it before the competency
// it assesses. Compare authored partial orders, never sibling-array positions.
const assertAssessmentPlacement = (
  viewId: string, task: UiGoal, byId: Map<string, UiGoal>, ancestorsById: Map<string, string[]>,
): void => {
  const taskPath = ancestorsById.get(task.id)
  if (!taskPath) return
  const stage = (path: string[]) => path.map(id => byId.get(id)!.title)
    .find(title => /^Sekundarstufe (?:I|II)(?:\s|$)/u.test(title))
  for (const reference of task.examData?.coveredGoalIds ?? []) {
    const covered = reference.split(':').at(-1)!
    const coveredPath = ancestorsById.get(covered)
    if (!coveredPath) continue
    assert(!(stage(taskPath)?.match(/^Sekundarstufe I(?:\s|$)/u)
      && stage(coveredPath)?.match(/^Sekundarstufe II(?:\s|$)/u)),
    `${viewId}: assessment ${task.id} is in Sek I before its assessed competency ${covered} in Sek II`)
    let index = 0
    while (index < Math.min(taskPath.length, coveredPath.length) && taskPath[index] === coveredPath[index]) index++
    if (!index || index === Math.min(taskPath.length, coveredPath.length)) continue
    const parent = byId.get(taskPath[index - 1])!
    const order = parent.extendedData?.compositionChildOrder as { after: Array<{ unit: string; after: string }> } | undefined
    if (!order) continue
    const taskUnit = byId.get(taskPath[index])?.extendedData?.compositionNodeId as string | undefined
    const coveredUnit = byId.get(coveredPath[index])?.extendedData?.compositionNodeId as string | undefined
    if (!taskUnit || !coveredUnit) continue
    const pending = [coveredUnit], reached = new Set<string>()
    while (pending.length) {
      const current = pending.pop()!
      if (reached.has(current)) continue
      reached.add(current)
      pending.push(...order.after.filter(pair => pair.unit === current).map(pair => pair.after))
    }
    assert(!reached.has(taskUnit),
      `${viewId}: assessment ${task.id} precedes its assessed competency ${covered} by declared after order`)
  }
}


const project = (view:CompositionView) => {
 const [projected]=normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical],view));assert(projected);
 const byId=new Map(projected.goals.map(g=>[g.id,g]));
 const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter((s):s is string=>!!s);
 const children=buildVisibleChildrenMap(byId,undefined,{[CANONICAL_GYMNASIUM_ROOT_ID]:{selected:true,stage:view.scope.stage},[canonical.meta.landscapeId]:{selected:true,filterId:filters.join(',')}});
 const ancestors=new Map<string,string[]>();
 const visit=(id:string,path:string[]=[])=>{assert(!ancestors.has(id));ancestors.set(id,path);(children.get(id)??[]).forEach(c=>visit(c,[...path,id]));};
 projected.goals.filter(g=>g.tags?.includes('root')).forEach(g=>visit(g.id));
 return {view,byId,children,ancestors};
};
const readView=(name:string)=>JSON.parse(readFileSync(resolve(viewDirectory,name),'utf8')) as CompositionView;
const errors:{view:string,task:string,message:string}[]=[];let checked=0;
for(const name of readdirSync(viewDirectory).filter(x=>x.endsWith('.view.json')).sort()){
 const p=project(readView(name));
 for(const id of p.ancestors.keys()) {const task=p.byId.get(id)!;if(!task.examData)continue;checked++;
  try{assertAssessmentPlacement(p.view.viewId,task,p.byId,p.ancestors)}catch(e){errors.push({view:name,task:id,message:String(e)})}
 }
}
const baseView=readView('de-he-gk.view.json');const p=project(baseView);
let chosen:{task:UiGoal,covered:string,parent:UiGoal,taskUnit:string,coveredUnit:string}|undefined;
for(const [id,path] of p.ancestors){const task=p.byId.get(id)!;if(!task.examData)continue;
 for(const covered of task.examData.coveredGoalIds??[]){const cp=p.ancestors.get(covered);if(!cp)continue;let i=0;while(i<Math.min(path.length,cp.length)&&path[i]===cp[i])i++;
  if(!i||i===Math.min(path.length,cp.length))continue;const parent=p.byId.get(path[i-1])!;
  if(!/^Sekundarstufe II/u.test(parent.title))continue;
  const taskUnit=p.byId.get(path[i])?.extendedData?.compositionNodeId as string;const coveredUnit=p.byId.get(cp[i])?.extendedData?.compositionNodeId as string;
  if(taskUnit&&coveredUnit&&taskUnit!==coveredUnit){chosen={task,covered,parent,taskUnit,coveredUnit};break;}
 }if(chosen)break;
}assert(chosen);const q=chosen;
assertAssessmentPlacement('positive-actual',q.task,p.byId,p.ancestors);
const reordered=structuredClone(baseView);const reverse=(nodes:CompositionView['rootNodes'])=>{nodes.reverse();nodes.forEach(n=>{if(n.kind==='structure')reverse(n.children)})};reverse(reordered.rootNodes);const rp=project(reordered);assertAssessmentPlacement('reordered-array',rp.byId.get(q.task.id)!,rp.byId,rp.ancestors);
const mutated=new Map([...p.byId].map(([id,g])=>[id,structuredClone(g)]));
mutated.get(q.parent.id)!.extendedData!.compositionChildOrder={after:[{unit:q.coveredUnit,after:q.taskUnit}]};
assert.throws(()=>assertAssessmentPlacement('direct-reverse',q.task,mutated,p.ancestors),/by declared after order/);
const middle=[...p.byId.values()].find(g=>p.ancestors.get(g.id)?.at(-1)===q.parent.id&&g.extendedData?.compositionNodeId&&![q.taskUnit,q.coveredUnit].includes(g.extendedData.compositionNodeId as string))!.extendedData!.compositionNodeId as string;
mutated.get(q.parent.id)!.extendedData!.compositionChildOrder={after:[{unit:q.coveredUnit,after:middle},{unit:middle,after:q.taskUnit}]};
assert.throws(()=>assertAssessmentPlacement('transitive-reverse',q.task,mutated,p.ancestors),/by declared after order/);
const wrongStage=new Map(p.ancestors);const lower=[...p.byId.values()].find(g=>p.ancestors.has(g.id)&&/^Sekundarstufe I(?:\s|$)/u.test(g.title))!;assert(lower);
wrongStage.set(q.task.id,p.ancestors.get(q.task.id)!.map(id=>id===q.parent.id?lower.id:id));
assert.throws(()=>assertAssessmentPlacement('wrong-lower-stage',q.task,p.byId,wrongStage),/is in Sek I before/);
const ownOnly=structuredClone(q.task);ownOnly.examData!.coveredGoalIds=[];ownOnly.requires=[q.covered];assertAssessmentPlacement('requires-is-not-coverage',ownOnly,mutated,p.ancestors);
const canonicalTree=project(readView('de-de-gym-physics-gk.view.json'));const oldTask='74a32716-2b46-5d96-8b57-3f6edb90e088';const upper=[...canonicalTree.byId.values()].find(g=>canonicalTree.ancestors.has(g.id)&&/^Sekundarstufe II(?:\s|$)/u.test(g.title))!;assert(upper);
const assertOldLower=(map:Map<string,string[]>)=>{const ancestors=(map.get(oldTask)??[]).map(id=>canonicalTree.byId.get(id)!);assert(ancestors.some(g=>/^Sekundarstufe I(?:\s|$)/u.test(g.title)),'previously visible Sek-I assessment must remain in SekI');assert(!ancestors.some(g=>/^Sekundarstufe II(?:\s|$)/u.test(g.title)),'must not move from SekI toSekII');};
assertOldLower(canonicalTree.ancestors);const moved=new Map(canonicalTree.ancestors);moved.set(oldTask,[...canonicalTree.ancestors.get(upper.id)!,upper.id]);assert.throws(()=>assertOldLower(moved),/must remain in SekI/);
const report={status:'PASS-independent-guard-mutations; actualV32findings retained',actualVisibleAssessmentPairsChecked:checked,actualPlacementFindings:errors,realWitness:{task:q.task.id,covered:q.covered,parent:q.parent.id,taskUnit:q.taskUnit,coveredUnit:q.coveredUnit},mutationChecks:['actual placement accepted','array reversal accepted','explicit reversed after rejected','transitive reversed after rejected','covered competency inII rejects task inI','requires alone not treated as coverage','old lower-task ancestry move rejected'],limits:['The old lower-placement mutation is performed on the actual projected ancestry; the attempted raw canonical-view move stalled before the assertions and was bounded separately.','The new placement guard is independent of CQR; known missing TH task is separately rejected by the unchanged demand guard.']};
writeFileSync(resolve(root,'tmp/pipeline/laender-stufen/gesamt/review/physics-assessment-projection/placement-guard.actual.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
