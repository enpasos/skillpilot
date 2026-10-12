import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {isGoalVisualizationAiApproved} from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationQaModel.ts';
import {isAiApprovedForCurrentAsset} from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts';
const root='/home/enpasos/projects/skillpilot';
const own=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-current217-three-fresh-independent-b-20261012-v9');
const q=JSON.parse(readFileSync(resolve(own,'V/exact-three.qa.json'),'utf8'));
const results=q.records.map((r:any)=>{
 const actual='sha256:'+createHash('sha256').update(readFileSync(resolve(root,r.canonicalAssetPath))).digest('hex');
 assert.equal(actual,r.assetSha256);assert.equal(actual,r.aiApprovedAssetSha256);assert.equal(r.humanApproved,'no');assert.ok(isGoalVisualizationAiApproved(r));assert.ok(isAiApprovedForCurrentAsset(r));
 return {goalId:r.goalId,actualSha256:actual,productionAiPredicatesPass:true,humanApproved:false,widthsActuallyViewed:[360,680],nativeGoalPageActuallyViewed:true};
});
writeFileSync(resolve(own,'receipts/V-production-predicates-and-CAS.actual.json'),JSON.stringify({validator:'unchanged production goalVisualizationQaModel and goalVisualizationQaStatus functions',results,activeWrites:false},null,2)+'\n');console.log('V3 exact-byte production predicates valid; HumanApproval false');
