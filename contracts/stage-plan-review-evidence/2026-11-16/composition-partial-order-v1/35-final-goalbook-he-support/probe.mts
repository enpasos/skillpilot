import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import {resolve} from 'node:path';
import {normalizeCanonicalLandscape,normalizeGoalRef} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,type CompositionViewNode} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {collectRenderedAtomicGoalIdsFromCompositionView} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts';
import type {SkillLandscape} from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts';
const repoRoot='/home/enpasos/projects/skillpilot',out='/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-he-support-v2';const readJson=(p:string)=>JSON.parse(fs.readFileSync(resolve(repoRoot,p),'utf8'));const hash=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(resolve(repoRoot,p))).digest('hex');
const paths=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'];
const [rawLandscape,rawMathLandscape,rawChemistryLandscape]=paths.map(readJson);
const normalized=[rawLandscape,rawMathLandscape,rawChemistryLandscape].map(normalizeCanonicalLandscape);
const physicsAndMathGoalById=new Map(normalized.flatMap(x=>x.goals).map(g=>[g.id,g]));
const semanticGoalById=new Map(normalized[0].goals.map(g=>[g.id,g]));

const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views/physik'
const HE_SEKI_UPPER_SUPPORT_LEAK_IDS = [
  '09029573-864f-40ca-bf8a-cee7bf6dcb73', '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  '1b833656-cd16-5b21-973a-9810960dcfd2', '206fe51d-cc78-5422-b139-32cc97eb1c37',
  '330808f6-789a-583d-86df-e271a7683d8b', '38e0ff49-f132-44c8-b17a-73dada5344db',
  '481ffd56-d585-56fe-b525-ed423e30eed3', '73b309ed-1aab-5778-8494-d9b65f5a352b',
  'a0aaedcb-41f8-4891-af77-a69a76b8c10d', 'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c968d263-8be4-5cf9-b320-e95398fe648f', 'e3bce51c-cfeb-4706-b95e-a22b76e7dd73',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
]
const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
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
function validate(view:any,durationSpec:any,sourcePath:string){
      const crossStage = normalizeCompositionView(readJson(
        `${COMPOSITION_VIEW_DIRECTORY}/de-he-gk-${durationSpec.durationModel.toLowerCase()}.view.json`,
      ))
      const sourceStages = collectCompositionStructures(crossStage.rootNodes, 'physics-seki')
      const excerptStages = collectCompositionStructures(view.rootNodes, 'physics-seki')
      assert.equal(sourceStages.length, 1)
      assert.deepEqual(excerptStages, sourceStages,
        `${view.viewId}: preserve every exact lower-stage reference payload and acquisition placement`)
      const ownAtoms = (ids: Set<string>) => [...ids]
        .filter((id) => semanticGoalById.get(id)?.contains.length === 0).sort(compareCodePoints)
      const stageRoles = collectCompositionProjectionRoleGoalIds(sourceStages, physicsAndMathGoalById)
      const sourceRoles = collectCompositionProjectionRoleGoalIds(crossStage.rootNodes, physicsAndMathGoalById)
      const sourceTargetIds = new Set(ownAtoms(stageRoles.targetGoalIds))
      const required = new Set<string>()
      const pending = [...sourceTargetIds]
      while (pending.length > 0) {
        const id = pending.pop()!
        if (required.has(id)) continue
        required.add(id)
        pending.push(...(physicsAndMathGoalById.get(id)?.requires ?? []).map(normalizeGoalRef))
      }
      const explicitStageSupport = new Set(ownAtoms(stageRoles.prerequisiteOnlyGoalIds))
      const expectedSupport = new Set(ownAtoms(sourceRoles.prerequisiteOnlyGoalIds)
        .filter((id) => required.has(id) || explicitStageSupport.has(id)))
      explicitStageSupport.forEach((id) => expectedSupport.add(id))
      assert.deepEqual([...expectedSupport].sort(compareCodePoints),
        ['13b338eb-f761-5817-9058-11043b9cb253', 'f74c691b-0b76-54e0-8fd6-a22211994e0a',
          'b378c8b3-5e83-5abf-8243-b0f345037bfc', 'd3c153b9-e09b-5668-8386-73105546a7c1',
          'da26294f-4316-5bd5-a37a-bd89397b3b8b'].sort(compareCodePoints),
        'the stage-resolved excerpt retains the two declared supports and three genuinely required method preparations')
      for (const neededMethod of ['b378c8b3-5e83-5abf-8243-b0f345037bfc',
        'd3c153b9-e09b-5668-8386-73105546a7c1', 'da26294f-4316-5bd5-a37a-bd89397b3b8b']) {
        assert(required.has(neededMethod), `${view.viewId}: added method support must have a real unpruned source-seed requirement`)
      }
      const assertBoundStageRoles = (nodes: CompositionViewNode[]) => {
        const roles = collectCompositionProjectionRoleGoalIds(nodes, physicsAndMathGoalById)
        assert.deepEqual(ownAtoms(roles.targetGoalIds), [...sourceTargetIds].sort(compareCodePoints),
          'SekI excerpt must preserve the exact 134 own target atoms')
        assert.deepEqual(ownAtoms(roles.prerequisiteOnlyGoalIds), [...expectedSupport].sort(compareCodePoints),
          'SekI excerpt must preserve exactly the resolved required/explicit own support')
      }
      assertBoundStageRoles(view.rootNodes)
      const renderedOwnVisibleIds = collectRenderedAtomicGoalIdsFromCompositionView(
        rawLandscape as unknown as SkillLandscape, resolve(repoRoot, sourcePath), [durationSpec.durationModel],
        true, 'SekI', [], [rawLandscape, rawMathLandscape, rawChemistryLandscape] as unknown as SkillLandscape[],
      )
      assert.deepEqual(ownAtoms(renderedOwnVisibleIds), [...sourceTargetIds, ...expectedSupport].sort(compareCodePoints),
        'actual Sek-I own-Physics visibility agrees with its resolved target/support roles')
      for (const leakedId of HE_SEKI_UPPER_SUPPORT_LEAK_IDS) {
        assert(!required.has(leakedId), `${view.viewId}: do not prune a real required preparation ${leakedId}`)
        assert.throws(() => assertBoundStageRoles([...view.rootNodes,
          { kind: 'goalEntry', goalId: leakedId, projectionRole: 'prerequisiteOnly' }]),
        /resolved required\/explicit own support/u,
        `${view.viewId}: reject reintroduced upper-stage support ${leakedId}`)
      }
      for (const supportId of expectedSupport) {
        const removeSupport = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap((node) => (
          node.kind === 'structure' ? [{ ...node, children: removeSupport(node.children) }]
            : collectCompositionProjectionRoleGoalIds([node], physicsAndMathGoalById).prerequisiteOnlyGoalIds.has(supportId) ? [] : [node]
        ))
        assert.throws(() => assertBoundStageRoles(removeSupport(view.rootNodes)),
          /resolved required\/explicit own support/u,
          `${view.viewId}: reject loss of necessary/explicit preparation ${supportId}`)
      }
return {sourceTargetIds,expectedSupport,required};}

const methodIds=['b378c8b3-5e83-5abf-8243-b0f345037bfc','d3c153b9-e09b-5668-8386-73105546a7c1','da26294f-4316-5bd5-a37a-bd89397b3b8b'];
const rows=[];
for(const durationModel of ['G8','G9']) {
 const sourcePath=COMPOSITION_VIEW_DIRECTORY+'/de-he-seki-'+durationModel.toLowerCase()+'.view.json';const view=normalizeCompositionView(readJson(sourcePath));const durationSpec={durationModel};
 const result=validate(view,durationSpec,sourcePath);assert.equal(result.sourceTargetIds.size,134);
 const mutations=[];
 for(const id of methodIds) {
  const changed=[];for(const [gid,g] of physicsAndMathGoalById){if(g.requires.some(r=>normalizeGoalRef(r)===id)){changed.push([gid,g]);physicsAndMathGoalById.set(gid,{...g,requires:g.requires.filter(r=>normalizeGoalRef(r)!==id)});}}
  assert(changed.length>0);let error='';try{validate(view,durationSpec,sourcePath)}catch(e){error=String(e)}finally{for(const [gid,g] of changed)physicsAndMathGoalById.set(gid,g)}
  assert.match(error,/added method support must have a real unpruned source-seed requirement/);mutations.push({type:'all actual canonical incoming R edges removed in memory',methodId:id,rejected:true,removedEdges:changed.map(([gid])=>[gid,id]),error});
 }
 rows.push({durationModel,sourcePath,sourceTargetCount:result.sourceTargetIds.size,expectedSupport:[...result.expectedSupport].sort(),positive:true,embeddedNegativeCases:HE_SEKI_UPPER_SUPPORT_LEAK_IDS.length+result.expectedSupport.size,mutations});
}
const testHash=hash('app/scripts/testPhysicsGoalBookInputs.ts');assert.equal(testHash,'511ac8a37cd816796a81718d80502ad16144d8f5bb6458c2b1ae57b549314282');
fs.writeFileSync(out+'/probe.actual.json',JSON.stringify({status:'PASS',testHash,rows,inputs:Object.fromEntries(paths.map(p=>[p,hash(p)])),limits:['Focused exact HE stage-support block; complete GoalBook/CQR execution remains the author run.','Canonical R mutation is in-memory only and deliberately invalidates the demand to verify the guard.']},null,2)+'\n');console.log(JSON.stringify({status:'PASS',positiveCases:rows.length,embeddedNegativeCases:rows.reduce((s,r)=>s+r.embeddedNegativeCases,0),independentRCutNegatives:rows.reduce((s,r)=>s+r.mutations.length,0),testHash}));
