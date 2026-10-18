import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes';
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters';
const b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/';
const p=b+'chemie-current450-SN-film-fixing-paired-placement-author-20261018-v2/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const proposal=read(p+'AUTHOR.one-whole-SN-view-before-after.pending.json');
const before=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
const after=structuredClone(before);
const endpoint=read(p+'INPUT.exact-whole-film-exam.draft.json');
assert(!after.goals.some((g:any)=>g.id===endpoint.id));
after.goals.push(endpoint);
assert.deepEqual(proposal.beforeWholeView,read(proposal.normalView.path));
const make=(r:any)=>({meta:r,goals:r.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:r.landscapeId}))});
function project(r:any,v:any){
  const m=new Map<string,any>(r.goals.map((g:any)=>[g.id,g]));
  const normalized=normalizeCompositionView(v);
  const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m);
  const result=applyCompositionViewProjection([make(r)],normalized)[0];
  const by=new Map<string,any>(result.goals.map((g:any)=>[g.id,g]));
  const children=buildDirectChildrenMap(by);
  const stack=result.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id);
  const seen=new Set<string>();
  while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,by,children))}
  const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean);
  return new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters)));
}
const old=project(before,proposal.beforeWholeView),next=project(after,proposal.candidateWholeView);
const added=[...next].filter(id=>!old.has(id)),removed=[...old].filter(id=>!next.has(id));
assert.deepEqual(new Set(added),new Set([...proposal.newOrdinaryTargets,...proposal.newAssessmentTargets]));
assert.equal(removed.length,0);
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
const closure=new Set<string>();
function visit(id:string){if(closure.has(id))return;closure.add(id);const g=by.get(id);assert(g);for(const required of g.requires??[])visit(required)}
visit(endpoint.id);
const missing=[...closure].filter(id=>!next.has(id));
assert.deepEqual(missing,[]);
const excluded:any[]=[];
for(const name of ['de-sn-lk.view.json','de-he-gk.view.json']){
  const path='curricula/DE/Gymnasium/composition-views/chemie/'+name;
  const view=read(path),set=project(after,view);
  excluded.push({path,ordinaryVisible:set.has(proposal.newOrdinaryTargets[0]),assessmentVisible:set.has(endpoint.id)});
  assert(!set.has(endpoint.id));
}
console.log(JSON.stringify({status:'PASS_EXACT_SN_PAIR_AND_TRANSITIVE_PREREQUISITE_TARGET_CLOSURE',beforeTargets:old.size,afterTargets:next.size,added,removed,transitiveClosure:[...closure],missingPrerequisiteTargets:missing,excludedScopeProbes:excluded,normalWrites:0},null,2));
