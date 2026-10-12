// SPDX-License-Identifier: Apache-2.0
// Informed technical preparation only. Empty independent-review campaigns.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {resolve,join,dirname} from 'node:path';
import {writeGoalBookModel} from '../../../../../../../../app/scripts/goalBookModel';
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../../app/scripts/goalBookRenderer';
import {buildGoalBookReviewBundle} from '../../../../../../../../app/scripts/exportGoalBookReviewBundle';
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../../app/scripts/createGoalDescriptionReviewCampaign';
const bp='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6',b=resolve(bp),read=async(p:string)=>JSON.parse(await readFile(p,'utf8')),write=async(p:string,x:any)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n')};
const model=await read(join(b,'native/full407.current.actual.book-model.json')),ids=process.argv.includes('--source-only')?['b4ca3af2-77f1-59e8-955d-c4959e284242']:await read(join(b,'neutral/actual-targeted-native-goal-ids.json')),v1=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v1'),out=[];
const tuples=await read(join(b,'inputs/all-current-candidate-image-tuples.json')),pub=join(b,'native-public');for(const tuple of (tuples.records??tuples)){if(!ids.includes(tuple.goalId))continue;const dest=join(pub,tuple.url.slice(1));await mkdir(dirname(dest),{recursive:true});await copyFile(resolve(tuple.path??tuple.assetPath),dest);}
const options={feedbackBaseUrl:'https://skillpilot.com/api/goal-feedback',publicRoot:pub,printDerivativeProfile:'bounded-atlas' as const};
const sourceOnly=process.argv.includes('--source-only');for(let ix=0;ix<(sourceOnly?1:2);ix++){const k=sourceOnly?2:ix;
 const goalIds=sourceOnly?ids:ids.slice(k*12,(k+1)*12),dir=join(b,`native/targeted-batch-${k+1}`);await mkdir(dir,{recursive:true});
 const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds,bookId:`chemie-current407-targeted-native-${k+1}-v3`,title:'Chemie – aktuelles gezieltes Prüfmaterial'}),mp=join(dir,'book-model.json'),hp=join(dir,'book.html'),pp=join(dir,'book.pdf');
 await writeGoalBookModel(subset,mp);await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,hp,options),hp+'.render-manifest.json');await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pp,options),pp+'.render-manifest.json');
 const bd=join(dir,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath:mp,pdfPath:pp,pdfRenderManifestPath:pp+'.render-manifest.json',htmlPath:hp,htmlRenderManifestPath:hp+'.render-manifest.json',outputDirectory:bd,promptPath:join(v1,'review/goal-description-understanding-evidence-review-v2.md'),criteriaPath:join(v1,'review/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:[]});
 for(const f of bundle.files){await mkdir(dirname(join(bd,f.relativePath)),{recursive:true});await writeFile(join(bd,f.relativePath),f.content);}await write(join(bd,'manifest.json'),bundle.manifest);
 const campaigns=[];
 for(const round of ['a','b']){
  const cd=join(dir,`round-${round}`),campaign=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:await readFile(join(bd,'manifest.json')),bookModelBytes:await readFile(join(bd,'book-model.json')),reviewInputBytes:await readFile(join(bd,'review-input.json')),bundleDirectory:bd,outputDirectory:cd,campaignOptions:{campaignId:`chemie-current407-targeted-${k+1}-independent-${round}-v3`,roundId:round,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:`chemie-current407-targeted-v3-independent-${round}`,blindToOtherReviews:true,batchSize:20}});
  await mkdir(join(cd,'results'));campaigns.push({round,inputPath:join(cd,'description-review-input.json'),campaignPath:join(cd,'description-review-campaign.json'),goalCount:campaign.input.goals.length,resultsCount:0,normalValidationErrors:0,scientificVotes:0});
 }
 out.push({ordinal:k+1,goalIds,bookModelPath:mp,pdfPath:pp,htmlPath:hp,bundleManifestPath:join(bd,'manifest.json'),campaigns});console.log(JSON.stringify({renderedBatch:k+1,goalCount:goalIds.length,emptyFirstPassCampaigns:2}));
}
await write(join(b,sourceOnly?'checks/source-only-b4-native-and-empty-first-pass-campaigns.actual.json':'checks/targeted23-native-and-empty-first-pass-campaigns.actual.json'),{batches:out,totalTargetedGoals:ids.length,maximumBatchGoals:12,unmodifiedNormalAPIs:true,scientificVotes:0,independentReviewPending:true,authorRole:'informed author/technical preparer, not independent reviewer'});
