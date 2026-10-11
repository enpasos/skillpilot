import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const out=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-four-needed-of-C12-current-qualified-context-native-owner-followers-AUTHOR-INERT-a-v1');
const plan=JSON.parse(readFileSync(join(out,'actual-four-needed-native-groups-original-science-and-eight-reused-strict-contexts.AUTHOR-INERT.json'),'utf8'));
const native=await import(pathToFileURL(join(root,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
const rows:any[]=[];
for (const g of plan.nativeGroups){
 const startedAtUtc=new Date().toISOString();
 const prepared=await native.prepareGoalDescriptionRolloutBatch(g.configPath);
 const checked=await native.validatePreparedGoalDescriptionRolloutBatch(g.configPath);
 rows.push({groupNumber:g.groupNumber,goalIds:g.goalIds,configPath:g.configPath,startedAtUtc,completedAtUtc:new Date().toISOString(),originalFunctions:['prepareGoalDescriptionRolloutBatch','validatePreparedGoalDescriptionRolloutBatch'],actualNativePrepareCheck:'PASS',baseBookDigest:checked.manifest.source.baseBookDigest,subsetModelDigest:prepared.model.digest,reviewInputFingerprint:checked.manifest.artifacts.reviewInputFingerprint,newReviewInference:false,activeWrites:0});
 console.log(JSON.stringify({group:g.groupNumber,goalIds:g.goalIds,nativePrepareCheck:'PASS'}));
}
writeFileSync(join(out,'actual-original-native-four-group-prepare-check.AUTHOR-INERT.json'),JSON.stringify({status:'native-four-prepare-check-PASS-no-new-science',rows,activeWrites:0,newReviews:0},null,2)+'\n',{flag:'wx'});
