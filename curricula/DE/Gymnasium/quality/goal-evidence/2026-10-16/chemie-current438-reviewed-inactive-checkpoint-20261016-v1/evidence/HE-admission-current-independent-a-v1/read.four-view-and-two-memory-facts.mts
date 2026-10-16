import fs from 'node:fs';
import {collectCompositionProjectionRoleGoalIds} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilter} from '../../../app/src/utils/goalFilters.ts';
import {getSrsFilterTags} from '../../../app/src/utils/srsTags.ts';
const b='tmp/chemie-m7-resumed-20261016/'; const l=b+'chemie-combined639-two-GK-priors-final-review-capsule-v1/';
const goals=JSON.parse(fs.readFileSync(l+'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8')).goals;
const gc=JSON.parse(fs.readFileSync(b+'HE-admission-author-candidate-v1/CAS.seven-selected-WHOLE-goals.AUTHOR.inactive.json','utf8'));
const byId=new Map(goals.map(g=>[g.id,g])); for(const o of gc.operations)byId.set(o.goalId,o.after);
const vc=JSON.parse(fs.readFileSync(b+'HE-admission-author-candidate-v1/CAS.four-WHOLE-HE-views.AUTHOR.inactive.json','utf8'));
const deck=JSON.parse(fs.readFileSync(l+'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_natural_q2.de.json','utf8'));
const mems=gc.operations.filter(o=>o.after.nodeKind==='memory').map(o=>o.after);
for(const v of vc.operations){const r=collectCompositionProjectionRoleGoalIds(v.after.rootNodes,byId);const ids=['17ab1148','9fef5c29','b8d3b453','d92b3a20','428b4d9c','5c8f0bbb','e9d34f34','197bc2c5','cf270aaf','ee359c2e','8721d943','dc5173e8','6eba90b5','413040cd'].map(p=>[...byId.keys()].find(id=>id.startsWith(p))!);console.log(JSON.stringify({viewId:v.after.viewId,path:v.path,roles:ids.map(id=>({id,target:r.targetGoalIds.has(id),support:r.prerequisiteOnlyGoalIds.has(id),courseMatches:goalMatchesFilter(byId.get(id),v.after.scope.courseProfile),effectiveTarget:r.targetGoalIds.has(id)&&goalMatchesFilter(byId.get(id),v.after.scope.courseProfile)}))}));}
for(const g of mems){const tags=getSrsFilterTags(g.tags);const selected=deck.cards.filter(c=>tags.length===0||c.tags?.some(t=>tags.includes(t)));console.log(JSON.stringify({memoryGoalId:g.id,filterTags:tags,actualCards:selected.map(c=>({id:c.id,front:c.front,back:c.back,originTags:c.tags.filter(t=>t.startsWith('goal:'))})),requires:g.requires}));}
