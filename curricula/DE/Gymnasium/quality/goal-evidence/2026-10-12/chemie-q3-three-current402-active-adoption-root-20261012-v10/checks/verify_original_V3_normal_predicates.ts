import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
async function main() {
 const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-active-adoption-root-20261012-v10';
 const original=JSON.parse(readFileSync(`${out}/visualizations/V3.original-independent-b.exact.qa.json`,'utf8'));
 const projected=JSON.parse(readFileSync(`${out}/visualizations/V3.future-active-paths.qa.json`,'utf8'));
 const { isAiApprovedForCurrentAsset }=await import(pathToFileURL(resolve('app/src/utils/goalVisualizationQaStatus.ts')).href);
 const results=original.records.map((r:any,i:number)=>{
  const actualSHA='sha256:'+createHash('sha256').update(readFileSync(r.canonicalAssetPath)).digest('hex');
  return {goalId:r.goalId,actualSHA,originalApproved:isAiApprovedForCurrentAsset(r),futureProjectionApproved:isAiApprovedForCurrentAsset(projected.records[i]),imageHashMatches:actualSHA===r.assetSha256,existingReviewedLegacyYesRetained:r.umlautsCorrectChatGpt==='yes'&&r.contentApprovedChatGpt==='yes'&&projected.records[i].umlautsCorrectChatGpt==='yes'&&projected.records[i].contentApprovedChatGpt==='yes',humanFieldsUnchanged:JSON.stringify([r.humanApproved,r.humanIssueIdentified,r.humanReviewedAt,r.humanReviewer])===JSON.stringify([projected.records[i].humanApproved,projected.records[i].humanIssueIdentified,projected.records[i].humanReviewedAt,projected.records[i].humanReviewer])};
 });
 const errors=results.filter((r:any)=>!r.originalApproved||!r.futureProjectionApproved||!r.imageHashMatches||!r.existingReviewedLegacyYesRetained||!r.humanFieldsUnchanged);
 const receipt={normalProductionPredicate:'app/src/utils/goalVisualizationQaStatus.ts:isAiApprovedForCurrentAsset',results,errors,newScientificVotes:0,activeWrites:false,humanApproval:false};
 writeFileSync(`${out}/checks/V3.normal-predicate-and-path-projection.receipt.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 process.stdout.write(JSON.stringify(receipt)+'\n');if(errors.length)process.exitCode=1;
}
main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1;});
