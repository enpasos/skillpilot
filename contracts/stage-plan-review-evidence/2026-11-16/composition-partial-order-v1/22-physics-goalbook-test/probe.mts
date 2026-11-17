import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import { normalizeCanonicalLandscape, normalizeGoalRef, resolveCanonicalNodeType, type CanonicalAuthoringGoal } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds, type CompositionViewNode, type CompiledCompositionPreviewNode } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {sourceCoverageAtomicScopeMatcher} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts';
import type {SkillLandscape} from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts';
import {prepareLandscapeEntries} from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts';
import {applyCompositionViewProjection,applyPersonalCurriculumProjection} from '/home/enpasos/projects/skillpilot/app/src/utils/compositionViewRuntime.ts';
import {normalizeLearnerProjectedEntries} from '/home/enpasos/projects/skillpilot/app/src/utils/learnerTreeProjection.ts';
const root='/home/enpasos/projects/skillpilot',out='/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-test';const read=(p:string)=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));const hash=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rawLandscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),rawMathLandscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),rawChemistryLandscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
const LANDSCAPE_ID=rawLandscape.landscapeId;
const ledger=read('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json');const kinds=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const base=normalizeCanonicalLandscape(rawLandscape);const landscapeWithSemanticKinds={...base,goals:base.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))};
const universeGoals=[...landscapeWithSemanticKinds.goals,...normalizeCanonicalLandscape(rawMathLandscape).goals,...normalizeCanonicalLandscape(rawChemistryLandscape).goals];
const physicsAndMathGoalUniverse={landscapeId:'universe',title:'Universe',goals:universeGoals};const physicsAndMathGoalById=new Map(universeGoals.map(g=>[g.id,g]));const semanticGoalById=new Map(landscapeWithSemanticKinds.goals.map(g=>[g.id,g]));
const retainedPhysicsProjectionAuthority=read('scripts/generate_laender_physics_stage_views.memberships.json').authorities;
const materializationSourceEntries=prepareLandscapeEntries([rawLandscape,rawMathLandscape,rawChemistryLandscape]);
const validatedGravitationGkViewIds=new Set(),validatedGravitationLkViewIds=new Set();
interface AuthoredPrerequisiteRoot {goalId:string;kind:'goalEntry'|'canonicalSubtree'}

const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views/physik'
const HE_DURATION_VIEW_SPECS = (['g8', 'g9'] as const).flatMap((duration) => [
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-gk-${duration}.view.json`, viewId: `de-he-gym-physics-gk-${duration}`, stage: 'CrossStage', courseProfile: 'GK', durationModel: duration.toUpperCase() },
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-lk-${duration}.view.json`, viewId: `de-he-gym-physics-lk-${duration}`, stage: 'CrossStage', courseProfile: 'LK', durationModel: duration.toUpperCase() },
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-seki-${duration}.view.json`, viewId: `de-he-gym-seki-physics-${duration}`, stage: 'SekI', courseProfile: undefined, durationModel: duration.toUpperCase() },
])
const GRAVITATION_ROOT_GOAL_ID = '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089'
const GRAVITATION_LK_ONLY_PROJECTION_ROOTS = [
  {
    goalId: '16caf92e-2800-57d1-946c-5b92ce848a96',
    kind: 'goalEntry',
  },
  {
    goalId: '89cadf81-143b-5f6b-82bd-29ba20d92a1b',
    kind: 'goalEntry',
  },
  {
    goalId: '423e21b9-0d0c-5709-899d-7ab738b55e36',
    kind: 'canonicalSubtree',
  },
] as const
const GRAVITATION_LK_ONLY_GOAL_IDS = [
  ...GRAVITATION_LK_ONLY_PROJECTION_ROOTS.map(({ goalId }) => goalId),
  '481ffd56-d585-56fe-b525-ed423e30eed3',
  '1b833656-cd16-5b21-973a-9810960dcfd2',
  'c968d263-8be4-5cf9-b320-e95398fe648f',
] as const
const GRAVITATION_COMPOSITION_JURISDICTIONS = [
  'bb', 'be', 'hb', 'he', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th',
] as const
const EXPECTED_GRAVITATION_GK_VIEW_IDS = new Set([
  'de-de-gym-physics-gk',
  'de-de-gym-sekii-physics-gk',
  ...GRAVITATION_COMPOSITION_JURISDICTIONS.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gym-physics-gk`,
    `de-${jurisdiction}-gym-sekii-physics-gk`,
  ]),
  ...HE_DURATION_VIEW_SPECS.filter(({ courseProfile }) => courseProfile === 'GK').map(({ viewId }) => viewId),
])
const EXPECTED_GRAVITATION_LK_VIEW_IDS = new Set([
  'de-de-gym-physics-lk',
  'de-de-gym-sekii-physics-lk',
  ...GRAVITATION_COMPOSITION_JURISDICTIONS.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gym-physics-lk`,
    `de-${jurisdiction}-gym-sekii-physics-lk`,
  ]),
  ...HE_DURATION_VIEW_SPECS.filter(({ courseProfile }) => courseProfile === 'LK').map(({ viewId }) => viewId),
])
const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}
const collectVisibleGoalIds = (nodes: CompiledCompositionPreviewNode[]): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (node.kind === 'goal' && node.sourceGoalId) result.add(node.sourceGoalId)
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return result
}
const collectAuthoredPrerequisiteRoots = (
  nodes: CompositionViewNode[],
  includeAcquisitionPlacements = true,
): AuthoredPrerequisiteRoot[] => {
  const result: AuthoredPrerequisiteRoot[] = []
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry') return
    if (node.projectionRole === 'prerequisiteOnly'
      && (includeAcquisitionPlacements || node.kind !== 'goalEntry' || node.acquisitionPlacement !== true)) {
      result.push({ goalId: node.goalId, kind: node.kind })
    }
  }
  nodes.forEach(visit)
  return result
}
const collectCompositionStructures = (
  nodes: CompositionViewNode[],
  structureId: string,
  matches: Extract<CompositionViewNode, { kind: 'structure' }>[] = [],
): Extract<CompositionViewNode, { kind: 'structure' }>[] => {
  nodes.forEach((node) => {
    if (node.kind !== 'structure') return
    if (node.id === structureId) matches.push(node)
    collectCompositionStructures(node.children, structureId, matches)
  })
  return matches
}
const collectAuthoredProjectionGoalIds = (
  nodes: CompositionViewNode[],
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Set<string> => {
  const result = new Set<string>()
  const addCanonicalSubtree = (rootGoalId: string) => {
    const stack = [rootGoalId]
    while (stack.length > 0) {
      const goalId = stack.pop()
      if (!goalId || result.has(goalId)) continue
      const goal = goalsById.get(goalId)
      assert(goal, `authored projection references unknown goal ${goalId}`)
      result.add(goalId)
      goal.contains.map(normalizeGoalRef).forEach((childId) => stack.push(childId))
    }
  }
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry') return
    if (node.kind === 'canonicalSubtree') addCanonicalSubtree(normalizeGoalRef(node.goalId))
    else result.add(normalizeGoalRef(node.goalId))
  }
  nodes.forEach(visit)
  return result
}
const materializationSeedScopeMatchers = new Map(materializationSourceEntries.flatMap(entry => {
  const matches = sourceCoverageAtomicScopeMatcher({ ...entry.meta, goals: entry.goals } as SkillLandscape)
  return entry.goals.map(goal => [goal.id, matches] as const)
}))
function validate(view:any){const compilation=compileCompositionView(view,landscapeWithSemanticKinds as any,physicsAndMathGoalUniverse as any);assert.deepEqual(compilation.findings.filter(x=>x.severity==='error'),[]);const visibleGoalIds=collectVisibleGoalIds(compilation.compiledRootNodes);
  const hesseGravitationUnitId = `he-physics-topic-${GRAVITATION_ROOT_GOAL_ID}`
  const knownHesseView = ['de-he-gym-physics-gk', 'de-he-gym-physics-lk',
    'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
    ...HE_DURATION_VIEW_SPECS.filter(({ stage }) => stage === 'CrossStage').map(({ viewId }) => viewId)].includes(view.viewId)
  const compiledHesseGravitation = (nodes: CompiledCompositionPreviewNode[]): boolean => nodes.some(node =>
    (node.kind === 'structure' && node.runtimeId === `structure:${hesseGravitationUnitId}`) || compiledHesseGravitation(node.children))
  if (knownHesseView) assert.equal(collectCompositionStructures(view.rootNodes, hesseGravitationUnitId).length, 1,
    `${view.viewId}: retain exactly one opened gravitation topic`)
  const gravitationRootIsTarget = EXPECTED_GRAVITATION_GK_VIEW_IDS.has(view.viewId)
    || EXPECTED_GRAVITATION_LK_VIEW_IDS.has(view.viewId)
  if (knownHesseView) assert(compiledHesseGravitation(compilation.compiledRootNodes))
  const gravitationAtomicIds = [...collectAuthoredProjectionGoalIds([
    { kind: 'canonicalSubtree', goalId: GRAVITATION_ROOT_GOAL_ID },
  ], semanticGoalById)].filter(id => resolveCanonicalNodeType(semanticGoalById.get(id)!) === 'atomic')
  if (gravitationRootIsTarget) gravitationAtomicIds.forEach(goalId => {
    const retainedSupport = retainedPhysicsProjectionAuthority[view.viewId]?.prerequisiteOnlyAtomicGoalIds ?? []
    const expectedTarget = !retainedSupport.includes(goalId)
      && (view.scope.courseProfile === 'LK' || !GRAVITATION_LK_ONLY_GOAL_IDS.some(id => id === goalId))
    assert.equal(visibleGoalIds.has(goalId), expectedTarget,
      `${view.viewId}: opened gravitation retains the exact reviewed atomic course scope ${goalId}`)
  })
  const authoredGravitationProjectionRoots = collectAuthoredPrerequisiteRoots(view.rootNodes, false)
    .filter(({ goalId }) => GRAVITATION_LK_ONLY_PROJECTION_ROOTS.some((root) => root.goalId === goalId))
    .sort((left, right) => compareCodePoints(left.goalId, right.goalId))
  if (view.scope.courseProfile === 'GK') {
    GRAVITATION_LK_ONLY_GOAL_IDS.forEach((goalId) => {
      if (resolveCanonicalNodeType(semanticGoalById.get(goalId)!) !== 'atomic') return
      assert(
        !visibleGoalIds.has(goalId),
        `${view.viewId} must not expose LK-only gravitation goal ${goalId} as a GK target`,
      )
    })
    if (gravitationRootIsTarget) {
      assert.deepEqual(
        authoredGravitationProjectionRoots,
        [...GRAVITATION_LK_ONLY_PROJECTION_ROOTS,
          ...(['de-de-gym-physics-gk', 'de-de-gym-sekii-physics-gk'].includes(view.viewId)
            ? ['16caf92e-2800-57d1-946c-5b92ce848a96', '89cadf81-143b-5f6b-82bd-29ba20d92a1b']
              .map(goalId => ({ goalId, kind: 'canonicalSubtree' as const })) : []),
        ]
          .sort((left, right) => compareCodePoints(left.goalId, right.goalId)),
        `${view.viewId} must retain all three explicit gravitation prerequisiteOnly overrides`,
      )
      validatedGravitationGkViewIds.add(view.viewId)
    }
  }
  if (view.scope.courseProfile === 'LK' && gravitationRootIsTarget) {
    assert.deepEqual(
      authoredGravitationProjectionRoots,
      [],
      `${view.viewId} must not downgrade LK gravitation targets to prerequisite-only`,
    )
    GRAVITATION_LK_ONLY_GOAL_IDS.forEach((goalId) => {
      if (resolveCanonicalNodeType(semanticGoalById.get(goalId)!) !== 'atomic') return
      assert(
        visibleGoalIds.has(goalId),
        `${view.viewId} must retain LK gravitation target ${goalId}`,
      )
    })
    validatedGravitationLkViewIds.add(view.viewId)
  }

  const markers: Array<Extract<CompositionViewNode, { kind: 'goalEntry' }>> = []
  const markerParents = new Map<string, string>()
  const collectMarkers = (nodes: CompositionViewNode[], parent?: string) => nodes.forEach(node => {
    if (node.kind === 'structure') collectMarkers(node.children, node.id)
    else if (node.kind === 'goalEntry' && node.acquisitionPlacement === true) {
      assert(parent, `${view.viewId}: explicit acquisition has an authored unit`)
      markers.push(node)
      markerParents.set(node.goalId, parent)
    }
  })
  collectMarkers(view.rootNodes)
  assert.equal(new Set(markers.map(node => node.goalId)).size, markers.length,
    `${view.viewId}: one explicit acquisition location per canonical atom`)
  const actualSeeds = new Set([...visibleGoalIds].filter((id) => {
    const goal = physicsAndMathGoalById.get(id)
    if (!goal || goal.contains.length > 0 || resolveCanonicalNodeType(goal) !== 'atomic') return false
    const matchesScope = materializationSeedScopeMatchers.get(id)
    assert(matchesScope, `${view.viewId}: canonical owner for projected seed ${id}`)
    return matchesScope(goal as unknown as SkillLandscape['goals'][number], view.scope)
  }))
  const actualLearning = new Set(actualSeeds)
  const pending = [...actualSeeds]
  while (pending.length > 0) {
    const id = pending.pop()!
    const goal = physicsAndMathGoalById.get(id)
    assert(goal, `${view.viewId}: unknown canonical learning atom ${id}`)
    goal.requires.map(normalizeGoalRef).forEach((required) => {
      if (!actualLearning.has(required)) { actualLearning.add(required); pending.push(required) }
    })
  }
  markers.forEach(node => {
    assert.equal(view.viewFormatVersion, '1.2')
    assert.equal(node.projectionRole, 'prerequisiteOnly')
    assert(!actualSeeds.has(node.goalId),
      `${view.viewId}: an acquisition template must never create a seed: ${node.goalId}`)
  })
  const personalSources = materializationSourceEntries.map(entry => ({ ...entry, meta: { ...entry.meta,
    personalCurriculumProjection: {
      revision: 'atomic-prerequisite-learning-v1' as const, rootLandscapeId: LANDSCAPE_ID, scopeRevision: view.viewId,
      seedAtomicGoalIds: entry.goals.filter(goal => actualSeeds.has(goal.id)).map(goal => goal.id),
      targetGoalIds: entry.goals.filter(goal => actualLearning.has(goal.id)).map(goal => goal.id), requiredByPaths: {},
    },
  } }))
  const materialized = applyPersonalCurriculumProjection(
    normalizeLearnerProjectedEntries(applyCompositionViewProjection(materializationSourceEntries, view)), personalSources,
  )
  const materializedGoals = new Map(materialized.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const localRoots = materialized.find(entry => entry.meta.landscapeId === LANDSCAPE_ID)?.goals
    .filter(goal => goal.tags.includes('root')) ?? []
  const visited = new Set<string>()
  const incoming = new Map<string, number>()
  const actualParents = new Map<string, string | undefined>()
  const visitMaterialized = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    materializedGoals.get(id)?.contains.forEach(child => {
      incoming.set(child, (incoming.get(child) ?? 0) + 1)
      actualParents.set(child, materializedGoals.get(id)?.extendedData?.compositionNodeId as string | undefined)
      visitMaterialized(child)
    })
  }
  localRoots.forEach(goal => visitMaterialized(goal.id))
  markers.forEach(node => {
    if (!actualLearning.has(node.goalId)) {
      assert.equal(incoming.get(node.goalId) ?? 0, 0,
        `${view.viewId}: dormant acquisition template must stay invisible outside the actual learning basis: ${node.goalId}`)
      assert(!visited.has(node.goalId), `${view.viewId}: inactive acquisition creates no visible target`)
      return
    }
    assert.equal(incoming.get(node.goalId), 1,
      `${view.viewId}: active acquisition must materialize exactly once in the real learning tree: ${node.goalId}`)
    assert.equal(actualParents.get(node.goalId), markerParents.get(node.goalId),
      `${view.viewId}: needed nonseed must use its authored acquisition unit, not a broad support alias: ${node.goalId}`)
  })


return {actualSeeds,actualLearning,markers};}
const frozen=root+'/tmp/pipeline/laender-stufen/gesamt/physics/frozen-v33';const manifest=JSON.parse(fs.readFileSync(frozen+'/manifest.json','utf8'));const pins=Object.fromEntries(manifest.views.map((v:any)=>[v.file,v.sha256]));
const load=(file:string)=>{const p=frozen+'/views/'+file;assert.equal(hash(p),pins[file]);return normalizeCompositionView(JSON.parse(fs.readFileSync(p,'utf8')))};
const results:any[]=[];assert.equal(EXPECTED_GRAVITATION_GK_VIEW_IDS.size,32);assert.equal(EXPECTED_GRAVITATION_LK_VIEW_IDS.size,32);
let bindingChecks=0,atomicChecks=0;
const gravityAtoms=[...collectAuthoredProjectionGoalIds([{kind:'canonicalSubtree',goalId:GRAVITATION_ROOT_GOAL_ID}],semanticGoalById)].filter(id=>resolveCanonicalNodeType(semanticGoalById.get(id)!)==='atomic');
for(const row of manifest.views){if(!EXPECTED_GRAVITATION_GK_VIEW_IDS.has(row.viewId)&&!EXPECTED_GRAVITATION_LK_VIEW_IDS.has(row.viewId))continue;const view=load(row.file);const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,physicsAndMathGoalById);const retained=retainedPhysicsProjectionAuthority[view.viewId]?.prerequisiteOnlyAtomicGoalIds??[];for(const id of gravityAtoms){const expected=!retained.includes(id)&&(view.scope.courseProfile==='LK'||!GRAVITATION_LK_ONLY_GOAL_IDS.some(g=>g===id));assert.equal(roles.targetGoalIds.has(id),expected,view.viewId+' '+id);atomicChecks++;}bindingChecks++;}
assert.equal(bindingChecks,64);results.push({case:'all original32+32 raw atomic role bindings',pass:true,bindingChecks,atomicChecks});const cases=['de-he-gk.view.json','de-he-lk.view.json','de-de-gym-physics-gk.view.json','de-bb-seki.view.json'];const originals=new Map(cases.map(f=>[f,load(f)]));
for(const [file,v] of originals){try{const r=validate(v);results.push({case:'baseline '+file,pass:true,seeds:r.actualSeeds.size,learning:r.actualLearning.size,markers:r.markers.length});}catch(e){results.push({case:'baseline '+file,pass:false,error:String(e)});}}
function change(nodes:any[],pred:(n:any)=>boolean,action:(n:any)=>any):number{let n=0;for(let i=nodes.length-1;i>=0;i--){const x=nodes[i];if(pred(x)){const y=action(x);if(y===null)nodes.splice(i,1);else nodes[i]=y;n++;}else if(x.kind==='structure')n+=change(x.children,pred,action);}return n;}
function negative(name:string,file:string,mut:(v:any)=>void){const v=structuredClone(originals.get(file));mut(v);try{validate(v);results.push({case:name,rejected:false});}catch(e){results.push({case:name,rejected:true,error:String(e).slice(0,1100)});}}
negative('LK missing actual gravitation atom','de-he-lk.view.json',v=>assert.equal(change(v.rootNodes,n=>n.goalId==='16caf92e-2800-57d1-946c-5b92ce848a96',()=>null),1));
negative('GK forbidden LK target','de-he-gk.view.json',v=>assert.equal(change(v.rootNodes,n=>n.goalId==='16caf92e-2800-57d1-946c-5b92ce848a96'&&!n.acquisitionPlacement,n=>({...n,projectionRole:'target'})),1));
negative('GK missing original override','de-he-gk.view.json',v=>assert.equal(change(v.rootNodes,n=>n.goalId==='89cadf81-143b-5f6b-82bd-29ba20d92a1b'&&!n.acquisitionPlacement,()=>null),1));
const bb=originals.get('de-bb-seki.view.json')!;const baseBB=validate(bb);const unrelated=landscapeWithSemanticKinds.goals.find(g=>!g.contains.length&&!baseBB.actualLearning.has(g.id))!;
const dormant=structuredClone(bb);dormant.rootNodes.find((n:any)=>n.kind==='structure').children.push({kind:'goalEntry',goalId:unrelated.id,projectionRole:'prerequisiteOnly',acquisitionPlacement:true});try{const r=validate(dormant);assert(!r.actualSeeds.has(unrelated.id));assert(!r.actualLearning.has(unrelated.id));results.push({case:'BB additional marker remains dormant without demand',pass:true,goalId:unrelated.id});}catch(e){results.push({case:'BB additional marker remains dormant without demand',pass:false,error:String(e)});}
negative('BB acquisition changed into target','de-bb-seki.view.json',v=>{let changed=false;change(v.rootNodes,n=>n.acquisitionPlacement===true&&!changed,n=>{changed=true;return {...n,projectionRole:'target'}});assert(changed)});
negative('BB duplicate needed acquisition','de-bb-seki.view.json',v=>{let done=false;change(v.rootNodes,n=>n.kind==='structure'&&n.children.some((c:any)=>c.acquisitionPlacement===true)&&!done,n=>{done=true;n.children.push(structuredClone(n.children.find((c:any)=>c.acquisitionPlacement===true)));return n;});assert(done)});
const external=landscapeWithSemanticKinds.goals.find(g=>!g.contains.length&&!baseBB.actualSeeds.has(g.id)&&!materializationSeedScopeMatchers.get(g.id)!(g as any,bb.scope)&&g.requires.some(r=>!baseBB.actualLearning.has(normalizeGoalRef(r))));
if(external){const prep=external.requires.map(normalizeGoalRef).find(id=>!baseBB.actualLearning.has(id))!;const v=structuredClone(bb);const parent=v.rootNodes.find((n:any)=>n.kind==='structure');parent.children.push({kind:'goalEntry',goalId:external.id},{kind:'goalEntry',goalId:prep,projectionRole:'prerequisiteOnly',acquisitionPlacement:true});try{const r=validate(v);assert(!r.actualSeeds.has(external.id));assert(!r.actualLearning.has(prep));results.push({case:'BB excluded-jurisdiction target cannot activate prerequisite marker',pass:true,external:external.id,prep});}catch(e){results.push({case:'BB excluded-jurisdiction target cannot activate prerequisite marker',pass:false,error:String(e)});}}else results.push({case:'BB foreign demand mutation unavailable',pass:false});
const reordered=structuredClone(bb);function reverse(ns:any[]){ns.reverse();ns.forEach(n=>{if(n.kind==='structure')reverse(n.children)});}reverse(reordered.rootNodes);try{validate(reordered);results.push({case:'BB reordered arrays',pass:true});}catch(e){results.push({case:'BB reordered arrays',pass:false,error:String(e)});}
const report={reviewedTestHash:hash(out+'/reviewed-test.ts'),currentTestHash:hash(root+'/app/scripts/testPhysicsGoalBookInputs.ts'),extractGuardHash:hash(out+'/extracted-guards.json'),v33ManifestHash:hash(frozen+'/manifest.json'),results};fs.writeFileSync(out+'/negative-probe.actual.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));assert(results.every(r=>r.pass===true||r.rejected===true));
