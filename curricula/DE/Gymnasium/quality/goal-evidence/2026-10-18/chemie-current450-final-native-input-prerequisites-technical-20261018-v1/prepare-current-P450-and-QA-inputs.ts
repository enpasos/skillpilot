// SPDX-License-Identifier: Apache-2.0
// Creates only new technical input artifacts. No model build, render or review.
import {writeFileSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {OUT,REGISTRY,CANONICAL,SEMANTIC,QA,read,pin,sha,must,currentInputs,selectedP450} from './native-input-common';
const inputs=currentInputs(),start=[REGISTRY,CANONICAL,SEMANTIC].map(pin),P=selectedP450(inputs);
must(inputs.chem.positiveEvidenceConfigPaths.length===156,'Expected actually applied156 selected P configs');
const ids=[...inputs.ordinary].sort(),aggregate=OUT+'/P450.selected-current-whole-records.review.jsonl';
const viewPath=OUT+'/BASE450.full-current-ordinary.review.view.json',configPath=OUT+'/BASE450.full-current-positive.review.config.json';
const write=(p:string,x:any)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const body=ids.map(id=>P.selected.get(id).rawLine).join('\n')+'\n';
const wholeObjects=body.trim().split('\n').map(x=>JSON.parse(x));
must(wholeObjects.every((r:any)=>isDeepStrictEqual(r,P.selected.get(r.goalId).record)),'Whole selected P objects changed in aggregation');
writeFileSync(aggregate,body,{flag:'wx'});
write(viewPath,{$schema:'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json',viewFormatVersion:'1.0',viewId:'chemie-current450-final-ordinary-review-base-20261018-v1',landscapeId:inputs.landscape.landscapeId??inputs.landscape.id,language:'de',scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:'technical-complete450-review-20261018',label:'Vollständige technische Review-Basis (450 Kompetenzen)',children:ids.map(goalId=>({kind:'goalEntry',goalId,projectionRole:'target'}))}]});
write(configPath,{schemaVersion:1,bookId:'chemie-current450-final-native-review-base-20261018-v1',title:'Chemie: vollständige aktuelle Review-Basis 450',landscapePath:CANONICAL,compositionViewPath:viewPath,semanticKindLedgerPath:SEMANTIC,goalVisualizationQaPath:QA,publicationMode:'review',evidenceReviewPaths:[aggregate],outputPath:OUT+'/final-cut/full450.current.review.book-model.json'});
const owners=ids.map(id=>{const r=P.selected.get(id);return{goalId:id,configPath:r.configPath,reviewPath:r.reviewPath,line:r.line,reviewId:r.record.reviewId,status:r.record.status,reviewAuthority:r.record.reviewAuthority,rawLineSha256:r.rawLineSha256,wholeRecordSha256:sha(JSON.stringify(r.record)),goalFingerprint:r.record.goalFingerprint,reviewInputFingerprint:r.record.reviewInputFingerprint,profileFingerprint:r.record.profileFingerprint}});
const stock=['app/scripts/goalBookModel.ts','app/scripts/goalBookEvidenceReviewLoader.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/reportDeepUnderstandingRollout.ts'];
write(OUT+'/INPUT.selected-P450-owner-map-and-pins.json',{role:'EXACT_SELECTED_WHOLE_P_RECORD_AGGREGATION_NOT_NEW_REVIEW',preparationCutPins:start,finalCanonicalPinNotAsserted:true,selectedConfigPaths:inputs.chem.positiveEvidenceConfigPaths,positiveConfigs:156,selectedOwners:450,owners,sources:P.sources,visualizationAssets:P.assetPins,stockSourcePins:stock.map(pin),aggregate:pin(aggregate),view:pin(viewPath),baseConfig:pin(configPath),ordinaryGoalIds:ids});
write(OUT+'/PREPARED.inputs.manifest.json',{role:'PREPARED_REVIEW_INPUTS_FINAL_CUT_PENDING_NO_MODEL_BUILT',subject:'chemie',finalScopeApplied:false,preparedCutPins:start,selectedPMap:pin(OUT+'/INPUT.selected-P450-owner-map-and-pins.json'),positiveAggregate:pin(aggregate),reviewView:pin(viewPath),baseGoalBookConfig:pin(configPath),wholeSelectedRecordObjectsExact:true,statusCounts:owners.reduce((a:any,r:any)=>(a[r.status]=(a[r.status]??0)+1,a),{}),finalScopeReceipt:null,finalApplicabilityMeasurement:null,finalCanonicalRawPin:null,fullModelBuilds:0,renders:0,newReviewVotes:0,normalWrites:0});
for(const p of start)must(isDeepStrictEqual(pin(p.path),p),'Preparation input drift '+p.path);
console.log(JSON.stringify({positiveConfigs:156,selectedWholeRecords:450,wholeRecordObjectsPreserved:true,aggregate:pin(aggregate),view:pin(viewPath),baseConfig:pin(configPath),finalScopeApplied:false,fullModelBuilds:0,renders:0,newVotes:0,normalWrites:0},null,2));
