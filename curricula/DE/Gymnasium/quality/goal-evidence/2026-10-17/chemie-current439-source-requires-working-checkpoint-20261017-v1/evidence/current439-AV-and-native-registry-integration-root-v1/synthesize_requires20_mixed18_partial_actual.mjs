import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const O=dirname(fileURLToPath(import.meta.url)),N=join(O,'capsule');
const stock=await import(join(N,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const rt=await import(join(N,'app/scripts/validateGoalDescriptionDualRoundResolution.ts'));
const mt=await import(join(N,'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'));
const st=await import(join(N,'app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'));
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const bytes=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
async function put(p,b){try{if(!(await readFile(p)).equals(b))throw Error('Existing different '+p);}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(p,b,{flag:'wx'});}}
const rationales=JSON.parse(await readFile(join(O,'SYNTHESIS.requires20-mixed18.root-actual-rationales.json'),'utf8'));
const results=[];
for(const [key,file] of [['requires20','RECEIPT.Requires20-A-B2.exact-native-staging-and-stock-checks.json'],['mixed18','RECEIPT.Mixed18-A-B.exact-native-staging-and-stock-checks.json']]){
 const stage=JSON.parse(await readFile(join(O,file),'utf8')),notes=rationales[key].notes,deferred=rationales[key].deferred;
 for(const p of stage.sourceGuards)if(sha(await readFile(p.path))!=='sha256:'+p.sha256)throw Error('Foreign input drift '+p.path);
 const dual=await stock.materializeGoalDescriptionRolloutBatchDualSummary(stage.configRelativePath,true),root=dual.prepared.outputDirectory;
 const sources=new Map();
 for(const goalId of dual.prepared.manifest.goalIds){
  const a=rt.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId,label:'First'}),b=rt.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId,label:'Second'});
  if(a.errors.length||b.errors.length||!a.source||!b.source)throw Error('Unavailable source '+goalId);
  if(notes[goalId]){if(a.source.decision!=='keep'||b.source.decision!=='keep')throw Error('Unresolved decision '+goalId);}
  else if(!deferred[goalId]||![a.source.decision,b.source.decision].includes('revise'))throw Error('Invalid deferral '+goalId);
  sources.set(goalId,{first:a.source,second:b.source});
 }
 if(Object.keys(notes).length+Object.keys(deferred).length!==stage.goalCount)throw Error('Partition count');
 const first=sources.get(stage.goalIds[0]);
 const synthesizedAt=new Date(Math.max(...[...dual.first.resultPairs,...dual.second.resultPairs].map(x=>Date.parse(x.run.completedAt)))+1000).toISOString();
 const manifest={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',manifestId:'chemie-current439-'+key+'-partial-paired-root-synthesis-20261017-v1',authority:'ai_synthesis',synthesizedBy:'Codex root actual paired synthesis; accepted revisions explicitly deferred, no human attestation',synthesizedAt,batch:{batchId:dual.prepared.manifest.batchId,batchManifestDigest:sha(await readFile(join(root,'batch-manifest.json'))),configDigest:dual.prepared.manifest.configDigest,bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,bookDigest:dual.first.input.bookDigest,reviewInputFingerprint:dual.first.input.reviewInputFingerprint,dualSummaryDigest:sha(dual.bytes),canonicalLandscapeDigest:sha(await readFile(join(N,dual.prepared.manifest.source.landscapePath)))},rounds:{first:mt.buildGoalDescriptionRolloutSynthesisRoundBinding(first.first.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),second:mt.buildGoalDescriptionRolloutSynthesisRoundBinding(first.second.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)},decisions:dual.prepared.manifest.goalIds.filter(id=>notes[id]).map(goalId=>{
  const g=dual.first.input.goals.find(x=>x.goalId===goalId),s=sources.get(goalId),n=notes[goalId];
  return {decisionId:'chemie-'+key+'-partial-root-'+goalId+'-20261017-v1',goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:rt.fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},resolutionDecision:'keep_current',evidenceRound:n[0],records:{first:{recordId:s.first.binding.recordId,recordDigest:s.first.binding.recordDigest},second:{recordId:s.second.binding.recordId,recordDigest:s.second.binding.recordDigest}},rationaleDe:n[1],rationaleEn:n[2]};
 }),deferredGoals:dual.prepared.manifest.goalIds.filter(id=>deferred[id]).map(goalId=>{const s=sources.get(goalId),n=deferred[goalId];return {goalId,firstDecision:s.first.decision,secondDecision:s.second.decision,rationaleDe:n[0],rationaleEn:n[1]};})};
 manifest.manifestFingerprint=mt.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifest);
 const check=await mt.validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest);if(check.errors.length)throw Error(check.errors.join(' | '));
 const mp='synthesis-decision-manifest.json',mb=bytes(manifest);await put(join(root,mp),mb);
 for(const d of manifest.decisions){const s=sources.get(d.goalId);const synthesis=st.buildGoalDescriptionRolloutResolutionSynthesis({batchId:manifest.batch.batchId,manifest,decision:d,summaryGoal:dual.summary.goals.find(x=>x.goalId===d.goalId),firstSource:s.first,secondSource:s.second});const r=rt.buildGoalDescriptionDualRoundResolution({resolutionId:d.decisionId,goalId:d.goalId,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,firstSource:s.first,secondSource:s.second,synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestPath:mp,manifestId:manifest.manifestId,manifestDigest:sha(mb),manifestFingerprint:manifest.manifestFingerprint,decisionId:d.decisionId}});if(r.status!=='resolved')throw Error('Open '+d.goalId);await put(join(root,'resolutions',d.goalId+'.resolution.json'),bytes(r));}
 await stock.materializeGoalDescriptionRolloutBatchResolutionIndex(stage.configRelativePath,true);
 const ib=await readFile(join(root,'resolution-index.json'));
 for(const p of stage.sourceGuards)if(sha(await readFile(p.path))!=='sha256:'+p.sha256)throw Error('Foreign drift '+p.path);
 const receipt={role:'Actual stock-finalized partial paired D synthesis with accepted real D revisions deferred',key,createdAtUTC:new Date().toISOString(),config:stage.configRelativePath,root:stage.nativeRootRelativePath,resolvedCurrentDescriptions:manifest.decisions.length,explicitDeferredDescriptions:manifest.deferredGoals,independentNativeReviews:stage.goalCount*2,indexDigest:sha(ib),index:JSON.parse(ib),manifestDigest:sha(mb),sourceGuardCount:stage.sourceGuards.length,allSourceGuardsUnchanged:true,newGoalTextsAuthored:0,newPositiveProfilesAuthored:0,revisionDissentOverrideUsed:false,separatePAndVFindingsRemainOpen:true,globalFiveGateNetIncreaseNotYetMeasured:true,centralRegistered:false,humanApproval:false,timingQualification:'The deterministic stock synthesis timestamp is computed from native serialization-run metadata and is not asserted as the actual scientific review duration. Scientific FIRST evidence and an append-only reviewer timing clarification remain separately preserved.'};
 await writeFile(join(O,'RECEIPT.actual-stock-'+key+'-partial-paired-synthesis.json'),bytes(receipt),{flag:'wx'});
 results.push({key,resolved:manifest.decisions.length,deferred:manifest.deferredGoals.length,indexDigest:sha(ib),receiptDigest:sha(bytes(receipt))});console.log(JSON.stringify(results.at(-1)));
}
console.log(JSON.stringify({results,currentDescriptionsResolved:results.reduce((s,x)=>s+x.resolved,0),actualAcceptedRevisionsStillDeferred:4,centralRegistered:false,globalFiveGateNetNotYetMeasured:true}));
