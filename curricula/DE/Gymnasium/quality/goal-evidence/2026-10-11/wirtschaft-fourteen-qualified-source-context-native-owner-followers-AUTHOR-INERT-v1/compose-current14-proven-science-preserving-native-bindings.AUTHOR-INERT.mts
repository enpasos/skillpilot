import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const R=process.cwd();
const O=join(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-fourteen-qualified-source-context-native-owner-followers-AUTHOR-INERT-v1');
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const write=(p:string,v:any)=>{if(existsSync(p)){if(readFileSync(p,'utf8')===JSON.stringify(v,null,2)+'\n')return; throw new Error('Existing inert artifact must be preserved: '+p);}writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const prep=await import(pathToFileURL(join(R,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
const resol=await import(pathToFileURL(join(R,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href);
const sc=await import(pathToFileURL(join(R,'app/scripts/goalDescriptionRolloutResolutionSynthesis.ts')).href);
const syn=await import(pathToFileURL(join(R,'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts')).href);
const plan=load(join(O,'actual-current-qualified14-native-groups-and-C-source-context-plan.INERT.json'));
const receipts:any[]=[];
const expectedHead=plan.HEADAtPreparation;
if(execFileSync('git',['rev-parse','HEAD'],{cwd:R,encoding:'utf8'}).trim()!==expectedHead)throw new Error('Current CI head drift');
for(const g of plan.groups){
 const out=join(R,g.outputDirectory);
 const dual=await prep.materializeGoalDescriptionRolloutBatchDualSummary(g.configPath,true);
 const oldManifest=load(join(R,g.exactWholeScienceHistoryDirectory,'synthesis-decisions.json'));
 const batchBytes=readFileSync(join(out,'batch-manifest.json'));
 const oldByGoal=new Map(oldManifest.decisions.map((d:any)=>[d.goalId,d]));
 const sources=new Map<string,any>();
 for(const id of g.goalIds){
  const first=resol.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:id,label:'Original first scientific review technical continuation'});
  const second=resol.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:id,label:'Original second scientific review technical continuation'});
  if(first.errors.length||second.errors.length||!first.source||!second.source)throw new Error([first.errors,second.errors].flat().join(' | '));
  sources.set(id,{first:first.source,second:second.source});
 }
 const sample=sources.get(g.goalIds[0]);
 const expectedAt=new Date(Math.max(...[...dual.first.resultPairs,...dual.second.resultPairs].map((p:any)=>Date.parse(p.run.completedAt)))+1000).toISOString();
 if(oldManifest.synthesizedAt!==expectedAt)throw new Error('Original scientific synthesis timestamp differs from exact native historical run closure');
 const manifest:any={...structuredClone(oldManifest),manifestId:dual.prepared.manifest.batchId+'-technical-continuation',batch:{batchId:dual.prepared.manifest.batchId,batchManifestDigest:sha(batchBytes),configDigest:dual.prepared.manifest.configDigest,bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,bookDigest:dual.first.input.bookDigest,reviewInputFingerprint:dual.first.input.reviewInputFingerprint,dualSummaryDigest:sha(dual.bytes),canonicalLandscapeDigest:sha(readFileSync(join(R,dual.prepared.manifest.source.landscapePath)))},rounds:{first:syn.buildGoalDescriptionRolloutSynthesisRoundBinding(sample.first.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),second:syn.buildGoalDescriptionRolloutSynthesisRoundBinding(sample.second.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)},decisions:[]};
 delete manifest.deferredGoals;delete manifest.manifestFingerprint;
 const succ=new Map<string,any>();
 for(const id of g.goalIds){
  const original=load(join(R,g.originalPairs[id].resolution.path));
  const current=dual.first.input.goals.find((x:any)=>x.goalId===id);
  const source=sources.get(id);
  const decision:any=structuredClone(oldByGoal.get(id));
  decision.decisionId=dual.prepared.manifest.batchId+'.'+id.slice(0,8);
  decision.goalFingerprint=current.goalFingerprint;decision.pageFingerprint=current.pageFingerprint;decision.goalReviewContextFingerprint=resol.fingerprintGoalDescriptionReviewContext(current);
  decision.records={first:{recordId:source.first.binding.recordId,recordDigest:source.first.binding.recordDigest},second:{recordId:source.second.binding.recordId,recordDigest:source.second.binding.recordDigest}};
  manifest.decisions.push(decision);
  const next:any=structuredClone(original);
  next.goal.pageFingerprint=current.pageFingerprint;next.goal.goalReviewContextFingerprint=decision.goalReviewContextFingerprint;
  next.rounds={first:source.first.binding,second:source.second.binding};next.dualSummary.digest=sha(dual.bytes);
  next.synthesisDecisionManifest={...next.synthesisDecisionManifest,manifestId:manifest.manifestId,decisionId:decision.decisionId};
  const summaryGoal=dual.summary.goals.find((x:any)=>x.goalId===id); const expectedSynthesis=sc.buildGoalDescriptionRolloutResolutionSynthesis({batchId:dual.prepared.manifest.batchId,manifest,decision,summaryGoal,firstSource:source.first,secondSource:source.second}); const science=(x:any)=>{const c=structuredClone(x);delete c.synthesisId;c.dissent=c.dissent.map((v:any)=>{delete v.dissentId;return v;});return c;}; if(JSON.stringify(science(expectedSynthesis))!==JSON.stringify(science(original.synthesis)))throw new Error('Scientific synthesis payload changed beyond deterministic identifier bindings');next.synthesis=expectedSynthesis;
  if(JSON.stringify(next.goal.finalText)!==JSON.stringify(original.goal.finalText)||next.goal.goalFingerprint!==original.goal.goalFingerprint)throw new Error('Original whole goal text or goal fingerprint changed');
  succ.set(id,next);
 }
 manifest.manifestFingerprint=syn.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifest);
 const manifestPath=join(out,'synthesis-decisions.json');write(manifestPath,manifest);
 const manifestBytes=readFileSync(manifestPath);
 for(const id of g.goalIds){
  const next=succ.get(id);next.synthesisDecisionManifest.manifestDigest=sha(manifestBytes);next.synthesisDecisionManifest.manifestFingerprint=manifest.manifestFingerprint;
  delete next.resolutionFingerprint;next.resolutionFingerprint=resol.fingerprintGoalDescriptionDualRoundResolution(next);
  write(join(out,'resolutions',id+'.resolution.json'),next);
 }
 const checked=await prep.materializeGoalDescriptionRolloutBatchResolutionIndex(g.configPath,true);
 receipts.push({groupNumber:g.groupNumber,configPath:g.configPath,goalIds:g.goalIds,nativeStandaloneV2ReadyGoals:checked.index.resolutions.map((x:any)=>x.goalId),nativeSchemaAndPreparedInputAndRoundResultsAndDualResolutionChecksPassed:true,wholeOriginalSciencePreserved:true,newModelCalls:0,newScientificReviews:0,integratedClosures:0});
 console.log(JSON.stringify({group:g.groupNumber,nativeStandaloneReady:checked.index.resolutions.length}));
}
if(execFileSync('git',['rev-parse','HEAD'],{cwd:R,encoding:'utf8'}).trim()!==expectedHead)throw new Error('Current CI head drift at end');
write(join(O,'actual-fourteen-native-current-owner-standalone-V2-container-checks.AUTHOR-INERT.json'),{status:'AUTHOR-INERT-native-bindings-pass-independent-qualification-pending',actualUTC:new Date().toISOString(),HEAD:expectedHead,groups:receipts,readyNativeStandaloneCount:receipts.reduce((a,b)=>a+b.goalIds.length,0),explicitOpen6de:plan.explicitOpen6de,reusedRoot2Owners:plan.Root2Current3ReusedIDs,newModelCalls:0,newScientificReview:0,activeRegistryOrLedgerWrites:0,centralDescriptionIncreaseClaimed:0,strictClosures:0,humanApproval:false});
