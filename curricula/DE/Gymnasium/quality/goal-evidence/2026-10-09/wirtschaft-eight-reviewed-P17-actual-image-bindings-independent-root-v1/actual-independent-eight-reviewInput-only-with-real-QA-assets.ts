import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
async function main(){
 const root=process.cwd();
 const outputDir='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-eight-reviewed-P17-actual-image-bindings-independent-root-v1';
 const out=path.join(root,outputDir,'actual-independent-eight-P17-real-image-bindings-and-valid-whole-content-reuse.receipt.json');
 if(fs.existsSync(out))throw Error('Immutable output already exists');
 const authorBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1';
 const v16=authorBase+'/current407-P311-P8-exact-QA-resource-bindings-and-owner-union-author-v16';
 const oldP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-source125-eight-existing-profile-sixteen-case-remedy-author-v1/whole-eight-seventeen-final-positive-v4.current-native-bound.author-candidates.jsonl';
 const newP=v16+'/whole-eight-seventeen-Root-reviewed-positive.with-actual-QA-resource-binding-only.native-successor.jsonl';
 const can=authorBase+'/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13/whole-V13-CAN407-four-exact-Root-machine-released-materials.inert.candidate.json';
 const qa=authorBase+'/final-thirteen-released-current311-P311-native-preparation-v10/candidate-qa311.current403.inert.json';
 const approved='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-eight-P16-source-delta-independent-root-v1/actual-final-independent-eight-KEEP-P17-bounded252-resolution-and-valid-history-retention.receipt.json';
 const previousGoals='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-source125-eight-existing-profile-sixteen-case-remedy-author-v1/whole-eight-unchanged-current-goal-contracts.for-native-binder.json';
 const modelPath='app/scripts/positiveGoalEvidenceProfileModel.ts';
 const parse=(p:string)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const lines=(p:string)=>fs.readFileSync(path.join(root,p),'utf8').trim().split('\n').map(x=>JSON.parse(x));
 const digest=(p:string)=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
 const bind=(p:string)=>({path:p,sha256:digest(p)});
 const old=lines(oldP),current=lines(newP),goals=parse(can).goals,qas=parse(qa).records,previous=parse(previousGoals);
 const wholeGoalMap=new Map(goals.map((g:any)=>[g.id,g]));
 const guards=[oldP,newP,can,qa,approved,previousGoals,modelPath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'].map(bind);
 if(old.length!==8||current.length!==8)throw Error('Expected exactly8 records');
 const native=await import(pathToFileURL(path.join(root,modelPath)).href);
 const results=[];
 for(const record of current){
  const prior=old.find(r=>r.goalId===record.goalId);
  const goal=wholeGoalMap.get(record.goalId) as any;
  if(!goal||JSON.stringify(goal)!==JSON.stringify(previous.find((g:any)=>g.id===record.goalId)))throw Error('Whole current goal changed');
  const changed=Object.keys(record).filter(k=>JSON.stringify(record[k])!==JSON.stringify(prior[k]));
  if(JSON.stringify(changed)!==JSON.stringify(['reviewInputFingerprint'])||JSON.stringify(Object.keys(record))!==JSON.stringify(Object.keys(prior)))throw Error('Not exactly one allowed technical field');
  const q=qas.find((r:any)=>r.goalId===record.goalId);
  const digests:Record<string,string>={};const assets=[];
  for(const link of goal.resourceLinks??[]){
   if(link.type!=='goal-visualization')continue;
   const pub='app/public/'+link.url.slice(1);
   const canAsset=pub.replace('app/public/assets/goal-visualizations/','curricula/DE/Gymnasium/visualizations/');
   const backend='backend/src/main/resources/static/'+link.url.slice(1);
   const hash=digest(pub);
   if(hash!==digest(canAsset)||hash!==digest(backend)||q.imageUrl!==link.url||q.assetSha256!==hash||q.aiApproved!=='yes'||q.aiApprovedAssetSha256!==hash)throw Error('Actual bytes or explicit current AI visualization approval differ');
   digests[link.url]=hash;
   assets.push({public:bind(pub),canonical:bind(canAsset),generatedBackend:bind(backend)});
   guards.push(bind(pub),bind(canAsset),bind(backend));
  }
  if(assets.length!==1)throw Error('Expected1exact current primary goal image');
  const errors=native.validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,'curricularAtomic');
  if(errors.length)throw Error(errors.join('\n'));
  results.push({goalId:record.goalId,changedFields:changed,allOtherWholeRecordFieldsExact:true,wholeCurrentGoalExact:true,wholeCases:record.profile.applicationCaseBriefs.length,actualResourceDigests:digests,actualWholeImageAssets:assets,explicitPriorCurrentMachineVisualApproval:{reviewer:q.aiReviewer,reviewedAt:q.aiReviewedAt,notes:q.aiNotes},nativeSemanticErrors:errors});
 }
 const guardsAfter=guards.map(x=>bind(x.path));
 if(JSON.stringify(guards)!==JSON.stringify(guardsAfter))throw Error('Input changed during bounded validation');
 fs.writeFileSync(out,JSON.stringify({at:new Date().toISOString(),reviewer:'/root',author:'/root/economics_independent_continuation_a',previousGoalTurnClassification:'progress: authorized origin/main integration and independent protected-M7 evidence changed authoritative state; no strict Economics increase',decision:'KEEP exactly8 technical current-image bindings; reuse exact previously independently approved wholeP17 content',originalActualWholePositiveContentApproval:bind(approved),oldWholeContent:bind(oldP),currentExactlyBoundWholeP17:bind(newP),nativeActualModel:bind(modelPath),results,before:guards,after:guardsAfter,allEightWholeProfilesAnd17CasesExact:true,freshFachlicheReviewClaimed:false,newIndependentVisualApprovalClaimed:false,actualCurrentMachineVisualApprovalBindingVerified:true,caseCount:results.reduce((n,r)=>n+r.wholeCases,0),wholeCourseSourceDOrHumanApproval:false,liveWrites:false,strictCurrent:300,denominator:311,newStrictAcademicClosures:0,restoredStrictBindings:0,strictNet:0,next:'Use exact currentP17 in eventual owner-page freeze after true legacy assessment prerequisites and course roles are resolved.'},null,2)+'\n');
 console.log(JSON.stringify({receipt:bind(path.relative(root,out)),goals:results.length,cases:results.reduce((n,r)=>n+r.wholeCases,0),actualNativeErrors:0,netStrict:0}));
}
main().catch(error=>{console.error(String(error));process.exitCode=1;});
