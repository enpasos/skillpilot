import fs from 'node:fs';
import {collectCompositionProjectionRoleGoalIds} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts';
const root='tmp/chemie-m7-resumed-20261016/';
const canonical=JSON.parse(fs.readFileSync(root+'chemie-combined639-two-GK-priors-final-review-capsule-v1/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8'));
const byId=new Map(canonical.goals.map(g=>[g.id,g]));
const id='d2ccd1d5-56f7-583f-9724-e97441367f91';
for(const course of ['gk','lk']){
 const path=root+'eight-empty-compiled-source-author-candidate-v1/after/curricula/DE/Gymnasium/composition-views/chemie/de-sn-'+course+'.view.json';
 const view=JSON.parse(fs.readFileSync(path,'utf8')); const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId);
 console.log(JSON.stringify({path,goalId:id,target:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),targetCount:roles.targetGoalIds.size,supportCount:roles.prerequisiteOnlyGoalIds.size}));
}
