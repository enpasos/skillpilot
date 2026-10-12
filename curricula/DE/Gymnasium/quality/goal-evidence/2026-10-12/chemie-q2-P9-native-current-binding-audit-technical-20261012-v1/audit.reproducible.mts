// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel';
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
import { buildGoalDescriptionCanonicalContext, fingerprintGoalDescriptionReviewInput } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage, extractGoalDescriptionDualRoundResolutionSource } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution';
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults';
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound';
import { fingerprintPositiveGoalEvidenceReviewInput, positiveGoalEvidenceReviewInputPayload } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..'),day='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';
const base=resolve(root,day,'chemie-q2-naturstoffe-current402-author-20261012-v2');
const p9=resolve(root,day,'chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3');
const out=resolve(root,day,'chemie-q2-P9-native-current-binding-audit-technical-20261012-v1');
const a=resolve(root,day,'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2');
const b=resolve(root,day,'chemie-q2-naturstoffe-current407-independent-b-20261012-v2');
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const records=async(p:string)=>(await readFile(p,'utf8')).trim().split('\n').map(JSON.parse);
const sha=(x:Uint8Array|string)=>'sha256:'+createHash('sha256').update(x).digest('hex');
const stableSha=(x:any)=>sha(stableGoalBookJson(x));
const write=async(name:string,x:any)=>writeFile(resolve(out,name),JSON.stringify(x,null,2)+'\n');
try { await readFile(resolve(out,'FINAL.technical-audit.freeze.json')); throw Error('Sealed audit is immutable; run in a new unsealed audit destination.'); } catch(error) { if ((error as any).code !== 'ENOENT') throw error; }
await mkdir(out,{recursive:true});
const cfg=await read(resolve(base,'native/full407.actual.config.json'));
const landscape=await read(resolve(root,cfg.landscapePath));
const kinds=await read(resolve(root,cfg.semanticKindLedgerPath));
const qa=await read(resolve(root,cfg.goalVisualizationQaPath));
const view=await read(resolve(root,cfg.compositionViewPath));
const images:any={};for(const r of qa.records)if(r.imageUrl&&r.assetSha256)images[r.imageUrl]=r.assetSha256;
const sourceText=await readFile(resolve(base,'positive/P36.actual-bound.ai-candidate.review.jsonl'),'utf8');
const changedText=await readFile(resolve(p9,'positive/P36.merged-inactive-nine-updated-27-exact.review.jsonl'),'utf8');
const oldModel=buildGoalBookModel({landscape,compositionView:view,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:images,evidenceReviewSources:[{path:cfg.evidenceReviewPaths[0],text:sourceText}],config:cfg});
const persisted=await read(resolve(base,'native/full407.actual.book-model.json'));
if(oldModel.digest!==persisted.digest)throw Error('Exact baseline normal-model rebuild disagrees with sealed original; inspect source inputs before proceeding.');
// New source path is genuine P9. The pure production model API builds the diagnostic
// model in memory only. No HTML, PDF, publication or review campaign is authored.
const newPpath=relative(root,resolve(p9,'positive/P36.merged-inactive-nine-updated-27-exact.review.jsonl'));
const newCfg={...cfg,evidenceReviewPaths:[newPpath]};
const newModel=buildGoalBookModel({landscape,compositionView:view,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:images,evidenceReviewSources:[{path:newPpath,text:changedText}],config:newCfg});
const newP=await records(resolve(p9,'positive/P9.author-run-bound.pending.review.jsonl'));
const pbyId=new Map(newP.map((x:any)=>[x.goalId,x]));
const baselineP=await records(resolve(base,'positive/P36.actual-bound.ai-candidate.review.jsonl'));
const oldPbyId=new Map(baselineP.map((x:any)=>[x.goalId,x]));
const mergedPbyId=new Map(changedText.trim().split('\n').map(JSON.parse).map((x:any)=>[x.goalId,x]));
const ids=new Set(newP.map((x:any)=>x.goalId));
const modelChanged=oldModel.pages.filter((x:any)=>x.pageFingerprint!==newModel.pages.find((y:any)=>y.goalId===x.goalId)?.pageFingerprint).map((x:any)=>x.goalId);
if(modelChanged.length!==9 || modelChanged.some((id:string)=>!ids.has(id)))throw Error('Unexpected pure-model page change beyond targeted P9');
const inputs:any[]=[],rows:any[]=[],untouchedRows:any[]=[],oldDualChecks:any[]=[],files=new Set<string>();
for(let n=1;n<=2;n++){
  const adir=resolve(a,`native/batch-${n}/round-a`),bdir=resolve(b,`D29-batch-${n}-round-b`);
  const load=async(dir:string)=>{
    const bundle=await read(resolve(dir,'review-bundle-manifest.json'));
    const input=await read(resolve(dir,'description-review-input.json'));
    const campaign=await read(resolve(dir,'description-review-campaign.json'));
    const result=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(dir,'batches'),resultsDirectory:resolve(dir,'results')});
    if(result.errors.length)throw Error(result.errors.join('\n'));
    for(const name of ['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json'])files.add(resolve(dir,name));
    return {bundle,input,campaign,resultPairs:result.resultPairs};
  };
  const first=await load(adir),second=await load(bdir);
  const dual=await validateGoalDescriptionReviewDualRound({first,second});
  if(dual.errors.length)throw Error(dual.errors.join('\n'));
  oldDualChecks.push({batch:n,goalCount:first.input.goalCount,oldSealedDualNormalValidationErrors:dual.errors,firstPass:first.campaign.reviewPass,secondPass:second.campaign.reviewPass,blindFirst:first.campaign.blindToOtherReviews,blindSecond:second.campaign.blindToOtherReviews,distinctIndependenceGroups:first.campaign.independenceGroupId!==second.campaign.independenceGroupId,historyValidityOnly:true});
  const oldSubset=await read(resolve(base,`native/batch-${n}/book-model.json`));
  const selection=oldSubset.pages.map((x:any)=>x.goalId);
  const oldDerived=buildGoalDescriptionRolloutSubsetModel({baseModel:oldModel,goalIds:selection,bookId:oldSubset.book.id,title:oldSubset.book.title});
  if(oldDerived.digest!==oldSubset.digest)throw Error('Exact baseline subset rebuild differs');
  const newDerived=buildGoalDescriptionRolloutSubsetModel({baseModel:newModel,goalIds:selection,bookId:oldSubset.book.id,title:oldSubset.book.title});
  const proposedGoals=first.input.goals.map((oldGoal:any)=>{
    const page=newDerived.pages.find((x:any)=>x.goalId===oldGoal.goalId);
    const proposed={...structuredClone(oldGoal),pageFingerprint:page.pageFingerprint,reviewContext:{page,evidenceProfile:mergedPbyId.get(oldGoal.goalId)}};
    if(stableGoalBookJson(proposed.canonicalContext)!==stableGoalBookJson(buildGoalDescriptionCanonicalContext(landscape.goals.find((x:any)=>x.id===oldGoal.goalId))))throw Error('Canonical context mismatch');
    if(fingerprintGoalDescriptionReviewPage(page)!==page.pageFingerprint)throw Error('Invalid production current page hash');
    return proposed;
  });
  // Keep old bundle/book bindings solely for this controlled diagnostic. This is
  // not an exportable new campaign. If even this controlled P/context change
  // changes the V3 input fingerprint, a real new native bundle must do so too.
  const controlledPayload={...first.input,goals:proposedGoals};
  delete controlledPayload.reviewInputFingerprint;
  const controlledDInput=fingerprintGoalDescriptionReviewInput(controlledPayload);
  inputs.push({batch:n,oldV3InputFingerprint:first.input.reviewInputFingerprint,controlledP9ContextOnlyV3InputFingerprint:controlledDInput,currentPureSubsetDigest:newDerived.digest,originalSubsetDigest:oldSubset.digest,controlledDiagnosticNotPreparedNewCampaign:true});
  for(const oldGoal of first.input.goals){
    const id=oldGoal.goalId,newGoal=proposedGoals.find((x:any)=>x.goalId===id);
    const other=second.input.goals.find((x:any)=>x.goalId===id);
    if(stableGoalBookJson(oldGoal)!==stableGoalBookJson(other))throw Error('Old A/B input-goal contexts differ');
    const sa=extractGoalDescriptionDualRoundResolutionSource({artifacts:first,goalId:id,label:'First'});
    const sb=extractGoalDescriptionDualRoundResolutionSource({artifacts:second,goalId:id,label:'Second'});
    if(sa.errors.length||sb.errors.length||!sa.source||!sb.source)throw Error('Invalid source extraction');
    if(!ids.has(id)){
      if(stableGoalBookJson(oldGoal)!==stableGoalBookJson(newGoal))throw Error('Unexpected untouched D29 tuple change');
      untouchedRows.push({goalId:id,batch:n,originalDecisions:{first:sa.source.decision,second:sb.source.decision},exactWholeV3GoalTupleUnchanged:true,canonicalContextUnchanged:true,PRecordAndBodyUnchanged:true,selectedNativePageUnchanged:true,selectedImageAndPrerequisitesUnchanged:true,oldGoalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(oldGoal),newGoalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(newGoal),reuseMeaning:'Preserve original pair for this unchanged candidate407+P9-only tuple. Recheck root combined changes before adoption; do not retag into a new review run.'});
      continue;
    }
    const oldP=oldPbyId.get(id),p=pbyId.get(id);
    if(sa.source.decision!=='keep'||sb.source.decision!=='keep')throw Error('Original D source not keep');
    rows.push({goalId:id,batch:n,oldSourceDecisions:{first:sa.source.decision,second:sb.source.decision},oldRecords:{firstRecordId:sa.source.record.recordId,secondRecordId:sb.source.record.recordId},canonicalContextUnchanged:true,fullBilingualTextUnchanged:['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'].every(k=>oldGoal[k]===newGoal[k]),goalFingerprintUnchanged:oldGoal.goalFingerprint===newGoal.goalFingerprint,PRecordReviewInputFingerprintUnchanged:oldP.reviewInputFingerprint===p.reviewInputFingerprint,PBodyActuallyChanged:stableGoalBookJson(oldP.profile)!==stableGoalBookJson(p.profile),oldPProfileFingerprint:oldP.profileFingerprint,newPProfileFingerprint:p.profileFingerprint,oldNativePageFingerprint:oldGoal.pageFingerprint,newNativePageFingerprint:newGoal.pageFingerprint,oldNativePageHashRecomputed:fingerprintGoalDescriptionReviewPage(oldGoal.reviewContext.page),oldGoalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(oldGoal),newGoalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(newGoal),oldPageSourceContextMatchesAandB:true,canClaimCurrentP9NativeDFromOldRecords:false,technicalReason:'P summary changes native pageFingerprint; the complete bound P record/body changes the V3 per-goal context. Both old keep records bind the old page/context.'});
  }
}
const d4root=resolve(root,day,'chemie-q2-four-current402-normal-integration-root-20261012-v3/native-D4');
const d4manifest=await read(resolve(d4root,'batch-manifest.json'));
const d4land=await read(resolve(root,d4manifest.source.landscapePath));
const d4input=await read(resolve(d4root,'round-a/description-review-input.json'));
const d4oldModel=await read(resolve(d4root,'bundle/book-model.json'));
const d4newModel=buildGoalDescriptionRolloutSubsetModel({baseModel:newModel,goalIds:d4input.goals.map((x:any)=>x.goalId),bookId:d4oldModel.book.id,title:d4oldModel.book.title});
const four:any[]=[],preserveTwo=new Map<string,any>();
for(const oldGoal of d4input.goals){
  const id=oldGoal.goalId,oldCanonical=d4land.goals.find((x:any)=>x.id===id),currentCanonical=landscape.goals.find((x:any)=>x.id===id);
  const oldRecord=oldGoal.reviewContext.evidenceProfile,newRecord=mergedPbyId.get(id);
  const oldAssets:any={};oldAssets[oldGoal.reviewContext.page.visualization.url]=oldGoal.reviewContext.page.visualization.originalDigest;
  const currentAssets:any={};for(const l of currentCanonical.resourceLinks??[])if(l.type==='goal-visualization')currentAssets[l.url]=images[l.url];
  const oldExpected=fingerprintPositiveGoalEvidenceReviewInput(oldCanonical,oldRecord.reviewCriteriaFingerprint,oldAssets,'curricularAtomic');
  const newExpected=fingerprintPositiveGoalEvidenceReviewInput(currentCanonical,newRecord.reviewCriteriaFingerprint,currentAssets,'curricularAtomic');
  if(oldExpected!==oldRecord.reviewInputFingerprint||newExpected!==newRecord.reviewInputFingerprint)throw Error('Retained-four P-input payload could not be recomputed');
  const fields=[...new Set([...Object.keys(oldCanonical),...Object.keys(currentCanonical)])].filter(k=>stableGoalBookJson(oldCanonical[k])!==stableGoalBookJson(currentCanonical[k]));
  const changedOnlyRequires={...structuredClone(oldCanonical),requires:currentCanonical.requires};
  const rewiredExpected=fingerprintPositiveGoalEvidenceReviewInput(changedOnlyRequires,oldRecord.reviewCriteriaFingerprint,oldAssets,'curricularAtomic');
  const page=d4newModel.pages.find((x:any)=>x.goalId===id);
  const currentGoal={...structuredClone(oldGoal),canonicalContext:buildGoalDescriptionCanonicalContext(currentCanonical),pageFingerprint:page.pageFingerprint,reviewContext:{page,evidenceProfile:newRecord}};
  if(fields.length===0)preserveTwo.set(id,oldRecord);
  four.push({goalId:id,wholeCanonicalChangedFields:fields,oldRequires:oldCanonical.requires,newRequires:currentCanonical.requires,wholeResourceLinksExact:stableGoalBookJson(oldCanonical.resourceLinks)===stableGoalBookJson(currentCanonical.resourceLinks),reviewedResourcePayloadBefore:positiveGoalEvidenceReviewInputPayload(oldCanonical,oldRecord.reviewCriteriaFingerprint,oldAssets,'curricularAtomic').goalInput.goalVisualizations,reviewedResourcePayloadAfter:positiveGoalEvidenceReviewInputPayload(currentCanonical,newRecord.reviewCriteriaFingerprint,currentAssets,'curricularAtomic').goalInput.goalVisualizations,oldPReviewInputFingerprint:oldExpected,newPReviewInputFingerprint:newExpected,requiresOnlyCounterfactualPInputFingerprint:rewiredExpected,PInputDifferencePreciselyExplainedByRequires:rewiredExpected===newExpected,profileBodyFingerprintUnchanged:oldRecord.profileFingerprint===newRecord.profileFingerprint,completePRecordChangedFields:Object.keys(oldRecord).filter(k=>stableGoalBookJson(oldRecord[k])!==stableGoalBookJson(newRecord[k])),oldNativePageFingerprint:oldGoal.pageFingerprint,currentWithAuthorP36PageFingerprint:page.pageFingerprint,oldV3ContextFingerprint:fingerprintGoalDescriptionReviewContext(oldGoal),currentWithAuthorP36V3ContextFingerprint:fingerprintGoalDescriptionReviewContext(currentGoal),AandMTechnicalHashScope:'Current A/M semantic payloads include goal text/dimension phase/area/topic/nodeKind, but omit requires; these four full canonical goals change only requires or not at all, so A/M fingerprints stay unchanged. Root must still run current checks and assess unchanged rationale/scope; no new A/M vote is created here.'});
}
const diagnosticPath=resolve(out,'DIAGNOSTIC.P36-two-exact-active-D4-records-only-technical.jsonl');
const diagnosticText=changedText.trim().split('\n').map(JSON.parse).map((r:any)=>preserveTwo.get(r.goalId)??r).map((r:any)=>JSON.stringify(r)).join('\n')+'\n';
await writeFile(diagnosticPath,diagnosticText);
const diagnosticRelative=relative(root,diagnosticPath);
const diagnosticCfg={...cfg,evidenceReviewPaths:[diagnosticRelative]};
const diagnosticModel=buildGoalBookModel({landscape,compositionView:view,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:images,evidenceReviewSources:[{path:diagnosticRelative,text:diagnosticText}],config:diagnosticCfg});
const diagnosticSubset=buildGoalDescriptionRolloutSubsetModel({baseModel:diagnosticModel,goalIds:d4input.goals.map((x:any)=>x.goalId),bookId:d4oldModel.book.id,title:d4oldModel.book.title});
for(const record of four){
  const id=record.goalId,oldGoal=d4input.goals.find((x:any)=>x.goalId===id),page=diagnosticSubset.pages.find((x:any)=>x.goalId===id);
  const currentGoal={...structuredClone(oldGoal),canonicalContext:buildGoalDescriptionCanonicalContext(landscape.goals.find((x:any)=>x.id===id)),pageFingerprint:page.pageFingerprint,reviewContext:{page,evidenceProfile:preserveTwo.get(id)??mergedPbyId.get(id)}};
  record.withTwoActualActivePRecordsPreserved={wholeV3TupleExact:stableGoalBookJson(oldGoal)===stableGoalBookJson(currentGoal),pageFingerprint:page.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(currentGoal),technicalOnlyNotAnOperativeLedger:true};
}
if(four.filter((x:any)=>x.withTwoActualActivePRecordsPreserved.wholeV3TupleExact).length!==2)throw Error('Expected exact preserved two active D4 tuples');
const artifacts=[resolve(base,'FINAL.author-package.freeze.json'),resolve(p9,'FINAL.author-package.freeze.json'),resolve(base,'native/full407.actual.config.json'),resolve(base,'native/full407.actual.book-model.json'),resolve(root,cfg.compositionViewPath),resolve(base,'candidate/canonical532.complete-inactive.json'),resolve(base,'candidate/semantic407.inactive-model-input.json'),resolve(base,'candidate/visualization-QA.actual-unapproved-candidates.json'),resolve(base,'positive/P36.actual-bound.ai-candidate.review.jsonl'),resolve(p9,'positive/P9.author-run-bound.pending.review.jsonl'),resolve(p9,'positive/P36.merged-inactive-nine-updated-27-exact.review.jsonl'),resolve(d4root,'batch-manifest.json'),resolve(d4root,'round-a/description-review-input.json'),resolve(d4root,'bundle/book-model.json'),resolve(root,d4manifest.source.landscapePath),...files];
const refs=[];for(const p of artifacts){const bytes=await readFile(p);refs.push({path:relative(root,p),bytes:bytes.length,sha256:sha(bytes)});}
await write('EXACT.read-only-audit-inputs.json',{schemaVersion:1,files:refs,pureAPIsUsed:['buildGoalBookModel','buildGoalDescriptionRolloutSubsetModel','fingerprintGoalDescriptionReviewPage','fingerprintGoalDescriptionReviewContext','fingerprintGoalDescriptionReviewInput','validateGoalDescriptionReviewDualRound'],actualImageBasis:'Exact already-sealed candidate QA digests passed to the normal pure BookModel API. This is page/context binding diagnosis, not new image acceptance.',activeWrites:false,sealedEdits:false,newScientificVotes:0});
await write('P9.actual-native-page-and-V3-context-comparison.json',{schemaVersion:1,mode:'read-only production pure-API model/context audit',oldFullModelExactlyRebuilt:true,oldFullModelDigest:oldModel.digest,currentP9PureFullModelDigest:newModel.digest,fullModelPageCount:oldModel.pages.length,nativeChangedGoalIds:modelChanged,nativeUnchangedPageCount:oldModel.pages.length-modelChanged.length,oldDualChecks,controlledInputComparisons:inputs,goals:rows,newNativeHTMLorPDF:false,newReviewCampaignPrepared:false,newScientificVotes:0,strictProgressGranted:0});
await write('N2D29.actual-untouched20-whole-current-tuples.json',{schemaVersion:1,originalD29Count:29,changedByP9:9,untouchedOriginalPairs:20,goals:untouchedRows,wholeProfileRecordsCompared:true,wholeCanonicalContextsCompared:true,actualPureNativeSubsetPagesCompared:true,combinedRootCandidateAcceptanceClaimed:false,newScientificVotes:0});
await write('retained-active-D4.exact-canonical-Pinput-resources-and-native-tuples.json',{schemaVersion:1,baselineScope:'actual active native D4 source snapshot vs sealed candidate407',goals:four,unchangedFullCanonicalGoalIds:four.filter(x=>x.wholeCanonicalChangedFields.length===0).map(x=>x.goalId),requiresRewiredGoalIds:four.filter(x=>x.wholeCanonicalChangedFields.length>0).map(x=>x.goalId),diagnosticTwoActivePRecordsPreserved:relative(root,diagnosticPath),activeCanonicalOrPWrites:false,newScientificVotes:0});
console.log(JSON.stringify({out:relative(root,out),exactOldFullModelRebuilt:true,oldDualGoalsValidated:29,P9ChangedNativePages:rows.length,unchangedPages:oldModel.pages.length-modelChanged.length,oldVsNewContextEqual:rows.filter(x=>x.oldGoalReviewContextFingerprint===x.newGoalReviewContextFingerprint).length,newScientificVotes:0}));
