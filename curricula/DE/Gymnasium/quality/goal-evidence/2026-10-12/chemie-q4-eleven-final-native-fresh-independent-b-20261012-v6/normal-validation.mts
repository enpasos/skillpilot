import {readFileSync,writeFileSync} from 'node:fs';
import {validateGoalDescriptionReviewCampaignResults} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts';
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts';
const o='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-final-native-fresh-independent-b-20261012-v6';const b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5/native-D11/round-b';
const get=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const c=get(b+'/description-review-campaign.json');
const r=await validateGoalDescriptionReviewCampaignResults({bundle:get(b+'/review-bundle-manifest.json'),input:get(b+'/description-review-input.json'),campaign:c,resultPairs:[{batchId:c.batches[0].batchId,run:get(o+'/description/D11.original-first-pass-b.run.json'),batchInputBytes:readFileSync(b+'/batches/'+c.batches[0].batchId+'.input.jsonl'),recordsBytes:readFileSync(o+'/description/D11.original-first-pass-b.records.jsonl')}]});
const results:any={D11:{errors:r.errors,records:r.records.length}};
for (const n of ['P11','P9','P2']) {const v=reviewPositiveGoalEvidenceConfig(o+'/positive/'+n+'.normal.config.json'); results[n]={errors:v.errors,counts:v.counts,scopeCount:v.config.scope.goalIds.length,meaning:n==='P9'?'nine scientifically accepted current machine candidates, E1/G1; no human approval':'contract validation only; explicit image dissent retained in two held tuples'};}
writeFileSync(o+'/checks/D11-P11-P9-P2.normal-production-validation.actual.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));if(Object.values(results).some((v:any)=>v.errors.length))process.exitCode=1;
