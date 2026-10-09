// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateGoalDescriptionReviewBatch} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts';
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts';
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..');
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex');
async function main(){
const D=[];
for(const selection of ['evolution17','protected-source-contexts']){
const source=resolve(author,'native-subsets',selection),round=resolve(source,'round-a'),out=resolve(own,'normal-D',selection);const bundle=read(resolve(source,'bundle/review-bundle-manifest.json')),input=read(resolve(round,'description-review-input.json')),campaign=read(resolve(round,'description-review-campaign.json')),run=read(resolve(out,'run-manifest.actual.json'));const batch=campaign.batches[0];
const batchInputPath=resolve(round,'batches',batch.batchId+'.input.jsonl');const result=await validateGoalDescriptionReviewBatch({bundle,input,campaign,run,batchInputBytes:readFileSync(batchInputPath),recordsBytes:readFileSync(resolve(out,'description-records.jsonl'))});
const artifacts=bundle.artifacts.map((a:any)=>{const p=resolve(source,'bundle',a.path),b=readFileSync(p);if(sha(b)!==a.digest||b.length!==a.bytes)throw Error('actual artifact stale '+p);return {role:a.role,path:relative(root,p),digest:a.digest,bytes:a.bytes,actualExact:true}});
D.push({selection,ordinaryFunction:'validateGoalDescriptionReviewBatch',errors:result.errors,recordCount:result.records.length,decisions:result.records.map((r:any)=>({goalId:r.goalId,decision:r.decision})),actualBundleArtifacts:artifacts,newDescriptionReviewClaimed:selection==='evolution17',protectedContextOnly:selection==='protected-source-contexts'});
}
const p=reviewPositiveGoalEvidenceConfig(relative(root,resolve(own,'normal-P/P17.native-independent-A.config.json')));const P={ordinaryFunction:'reviewPositiveGoalEvidenceConfig',errors:p.errors,counts:p.counts,recordCount:p.records.length,records:p.records.map(r=>({goalId:r.goalId,status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope}))};
const report={schemaVersion:1,role:'actual-normal-bounded-D17-context15-P17-terminal',D,P,humanApproval:false,strictGain:0};writeFileSync(resolve(own,'normal-D17-context15-P17.actual-terminal.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({D:D.map(x=>({selection:x.selection,records:x.recordCount,errors:x.errors})),P:{records:P.recordCount,counts:P.counts,errors:P.errors},strictGain:0}));if(D.some(x=>x.errors.length)||P.errors.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
