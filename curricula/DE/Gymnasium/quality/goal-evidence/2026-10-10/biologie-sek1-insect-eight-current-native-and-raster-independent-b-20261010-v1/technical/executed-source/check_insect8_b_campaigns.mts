// SPDX-License-Identifier: Apache-2.0
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1';
const dir=resolve(base,process.argv[2]??'round-b');
const read=async(p:string)=>JSON.parse(await readFile(resolve(dir,p),'utf8'));
const [campaign,input,bundle]=await Promise.all([read('description-review-campaign.json'),read('description-review-input.json'),read('review-bundle-manifest.json')]);
const result=await validateGoalDescriptionReviewCampaignResultDirectories({campaign,input,bundle,batchesDirectory:resolve(dir,'batches'),resultsDirectory:resolve(dir,'results')});
const out={schemaVersion:1,role:'Actual unchanged normal independent B description campaign validator',campaignId:campaign.campaignId,goalIds:result.records.map((r:any)=>r.goalId),recordCount:result.records.length,errors:result.errors,exitCode:result.errors.length?1:0,knownSeparateOriginalVPeerDifference:true,currentDPOtherRunsRead:false,activeWrites:false,humanApproval:false,strictNetGain:0};
await writeFile(resolve(base,'normal',process.argv[3]??'original-D8-campaign.actual.json'),JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(out));process.exitCode=out.exitCode;
