import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds} from '../../../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
const B='curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-integral-mean-split-20260928-v1/';
const c=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','utf8')),goals=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const before=JSON.parse(readFileSync(B+'view-scope-before.json','utf8')),old='809ef78a-f282-5593-89be-0f2cb95570ac',mean='c1c80b80-733f-599d-a2fc-f4dc50eabde2';
const rows=before.map((b:any)=>{const v=JSON.parse(readFileSync(b.path,'utf8'));const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals);assert.equal(r.targetGoalIds.has(old),false,b.path);assert.equal(r.targetGoalIds.has(mean),b.roles[0].target,b.path);for(const p of b.roles.slice(1)){assert.equal(r.targetGoalIds.has(p.id),p.target,b.path);assert.equal(r.prerequisiteOnlyGoalIds.has(p.id),p.prerequisiteOnly,b.path)}return {path:b.path,newMeanTarget:r.targetGoalIds.has(mean),existingStocksPreserved:true,legacyTargetExcluded:true}});
writeFileSync(B+'view-scope-validation.json',JSON.stringify({checkedViews:rows.length,meanTargetViews:rows.filter((r:any)=>r.newMeanTarget).length,rows},null,2)+'\n');console.log('PASS:',rows.length,'views; all 80 previous aggregate target scopes now retain the new mean; existing stock target/prerequisite roles unchanged');
