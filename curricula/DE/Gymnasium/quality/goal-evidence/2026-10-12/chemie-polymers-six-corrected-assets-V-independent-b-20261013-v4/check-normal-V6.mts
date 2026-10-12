import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {aiApprovalStatus,isAiApprovedForCurrentAsset} from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts';
import {normalizeGoalVisualizationAiReview} from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationQaModel.ts';
const own=process.argv[2],root='/home/enpasos/projects/skillpilot';
const records=JSON.parse(readFileSync(`${own}/V6.six-assets.independent-b.json`,'utf8')).records;
const checks=records.map((r:any)=>{
 const sha=createHash('sha256').update(readFileSync(`${root}/${r.assetPath}`)).digest('hex');
 if(sha!==r.assetSha256||sha!==r.aiApprovedAssetSha256)throw new Error('Actual asset mismatch');
 const normalized=normalizeGoalVisualizationAiReview(r,sha),status=aiApprovalStatus(r),approved=isAiApprovedForCurrentAsset(r);
 const expected=r.boundedDecision==='keep';
 if(approved!==expected||status!==(expected?'approved':'rejected')||normalized.aiApproved!==(expected?'yes':'no')||normalized.aiApprovedAssetSha256!==sha)throw new Error('Normal V state mismatch');
 const stale=normalizeGoalVisualizationAiReview(r,'f'.repeat(64));
 if(stale.aiApproved!=='no'||stale.aiApprovedAssetSha256!==''||aiApprovalStatus({...r,assetSha256:'f'.repeat(64)})!=='stale')throw new Error('Changed asset inherited approval');
 return {goalId:r.goalId,actualAssetSha256:sha,normalAiApprovalStatus:status,normalIsAiApprovedForCurrentAsset:approved,normalizedExactAssetReview:normalized,changedAssetReviewRejected:true,humanApprovalClaim:false};
});
if(checks.filter((r:any)=>r.normalIsAiApprovedForCurrentAsset).length!==5)throw new Error('Unexpected count');
writeFileSync(`${own}/NORMAL.V6.actual-check.receipt.json`,JSON.stringify({schemaVersion:1,command:'node --import tsx <own>/check-normal-V6.mts <own>',productionImports:['app/src/utils/goalVisualizationQaStatus.ts','app/scripts/goalVisualizationQaModel.ts'],role:'Actual normal image-review normalization/status functions; not native/context/globalpublication validation',checks,passed:true,humanApprovalClaim:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,exactAssetChecks:checks.length,positive:5,rejected:1,changedAssetInheritanceRejected:true}));
