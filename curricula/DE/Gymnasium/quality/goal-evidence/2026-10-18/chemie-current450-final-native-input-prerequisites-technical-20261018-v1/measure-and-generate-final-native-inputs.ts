// SPDX-License-Identifier: Apache-2.0
// Root-run final-cut helper. Default pin preflight only. --execute builds exactly
// one stock full450 model, measures it, and derives configs from that same model.
// Does not render, prepare campaigns, create votes, or mutate normal data.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,relative,dirname,sep} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel';
import {buildGoalDescriptionRolloutSubsetModel,loadGoalDescriptionRolloutBatchConfig} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign';
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution';
import {validateResolutionIndex} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout';
import {OUT,REGISTRY,CANONICAL,SEMANTIC,QA,read,pin,check,must,fields,currentInputs,selectedP450,activeDOwners} from './native-input-common';

async function main(){
const argv=process.argv.slice(2),execute=argv.includes('--execute');
const planAt=argv.indexOf('--final-plan'),planPath=planAt<0?null:argv[planAt+1];
for(let i=0;i<argv.length;i++){must(['--help','--execute','--final-plan'].includes(argv[i]),'Unknown argument '+argv[i]);if(argv[i]==='--final-plan')i++;}
if(argv.includes('--help')||!planPath){
 console.log('Usage: app/node_modules/.bin/tsx '+OUT+'/measure-and-generate-final-native-inputs.ts --final-plan NEW_ROOT_FINAL_CUT_PLAN.json [--execute]\nDefault: exact final pin/P/scope preflight only. --execute: one stock full450 model + full native-owner validation + per-goal strict/context/payload measurements + bounded <=20 configs from that same model. No render/campaign/review/normal write.');
 must(!execute||!!planPath,'--execute requires an actual final plan');
}else{
 const spec=read(planPath),prepared=read(OUT+'/PREPARED.inputs.manifest.json'),source=read(OUT+'/INPUT.selected-P450-owner-map-and-pins.json');
 must(spec.subject==='chemie'&&spec.finalScopeApplied===true,'Final Chemistry source/view/applicability/release cut has not been explicitly frozen');
 const mandatory=['canonical','semanticKinds','normalRegistry','finalScopeReceipt','finalApplicabilityReceipt','preparedInputsManifest','baseGoalBookConfig','positiveAggregate','reviewView','existingD65Science','existingD65ScienceSeal'];
 for(const k of mandatory)check(spec[k]);
 must(spec.canonical.path===CANONICAL&&spec.semanticKinds.path===SEMANTIC&&spec.normalRegistry.path===REGISTRY,'Final normal canonical/SEM/registry paths mismatch');
 must(spec.preparedInputsManifest.path===OUT+'/PREPARED.inputs.manifest.json','Wrong prepared-input manifest');
 must(isDeepStrictEqual(spec.baseGoalBookConfig,prepared.baseGoalBookConfig)&&isDeepStrictEqual(spec.positiveAggregate,prepared.positiveAggregate)&&isDeepStrictEqual(spec.reviewView,prepared.reviewView),'Prepared config/aggregate/QA view pins changed');
 check(prepared.selectedPMap);
 const supportGuard=spec.finalOperationReceipts;
 must(supportGuard&&['support169','practice75Release','THHBMetadata','applicabilityApply'].every(k=>supportGuard[k]),'Actual169-support,75-release,TH/HB metadata and applicability-apply receipts required');
 for(const p of Object.values(supportGuard))check(p);
 must(Array.isArray(spec.finalCompositionViewPins)&&spec.finalCompositionViewPins.length===41,'Exact final41 Chemistry view pins required');
 must(new Set(spec.finalCompositionViewPins.map((p:any)=>p.path)).size===41&&spec.finalCompositionViewPins.every((p:any)=>p.path.startsWith('curricula/DE/Gymnasium/composition-views/chemie/')&&p.path.endsWith('.view.json')),'Final view pins must be41 unique normal Chemistry views');
 for(const p of spec.finalCompositionViewPins)check(p);
 for(const p of spec.additionalInputGuards??[])check(p);
 for(const p of source.stockSourcePins)check(p);
 for(const p of source.visualizationAssets)check(p);
 const inputs=currentInputs(),P=selectedP450(inputs),byGoal=new Map<string,any>(inputs.landscape.goals.map((g:any)=>[g.id,g]));
 const oldAuditPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-native-D-binding-staleness-audit-technical-20261018-v1/FACTS.checkpoint662-to-current737-D-binding-cause-attribution.json';
 const prior=read(oldAuditPath),priorById=new Map(prior.perGoal.map((r:any)=>[r.goalId,r]));
 must(prior.newNodes.length===75&&prior.newNodes.every((r:any)=>r.semanticKind==='practiceAssessment'&&byGoal.get(r.goalId)?.examData?.reviewStatus==='released'),'Exact75 new assessments have not all been explicitly released');
 must(inputs.chem.positiveEvidenceConfigPaths.length===156&&isDeepStrictEqual(inputs.chem.positiveEvidenceConfigPaths,source.selectedConfigPaths),'Selected156 current P config paths changed; regenerate a new prepared successor');
 must(P.sources.every((s:any)=>source.sources.some((t:any)=>isDeepStrictEqual(t,s))),'Selected P source/config/criteria pins changed');
 const aggregateRows=readFileSync(spec.positiveAggregate.path,'utf8').split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
 must(aggregateRows.length===450&&new Set(aggregateRows.map((r:any)=>r.goalId)).size===450,'Aggregate is not exactly450 unique whole P records');
 must(aggregateRows.every((r:any)=>isDeepStrictEqual(r,P.selected.get(r.goalId)?.record)),'Aggregate differs from actual complete selected P records');
 const cfg=read(spec.baseGoalBookConfig.path);
 must(cfg.landscapePath===CANONICAL&&cfg.semanticKindLedgerPath===SEMANTIC&&cfg.goalVisualizationQaPath===QA&&cfg.publicationMode==='review'&&cfg.compositionViewPath===spec.reviewView.path&&!cfg.compositionViewManifestPath,'Full450 base must bind exact normal inputs and explicit ordinary review-only QA view');
 must(isDeepStrictEqual(cfg.evidenceReviewPaths,[spec.positiveAggregate.path]),'Base must bind exact selected whole P aggregate');
 must(spec.outputRoot===OUT+'/final-cut','Final output must stay in the new own final-cut directory');
 must(cfg.outputPath===spec.outputRoot+'/full450.current.review.book-model.json','Final model output path mismatch');
 const guards=[...mandatory.map(k=>spec[k]),...Object.values(supportGuard),...spec.finalCompositionViewPins,...(spec.additionalInputGuards??[]),...source.stockSourcePins,...source.visualizationAssets,...P.sources.flatMap((s:any)=>[s.config,s.review,s.criteria]),pin(QA)];
 if(!execute){
  console.log(JSON.stringify({executed:false,finalCutPinsValidated:true,selectedPConfigs:156,selectedWholeP:450,preparedWholeObjectsExact:true,ordinaryGoals:450,modelBuilds:0,renders:0,newVotes:0,normalWrites:0},null,2));
 }else{
  must(!existsSync(spec.outputRoot),'Final output already exists; preserve it and author an additive successor');
  const native=activeDOwners(inputs),indicesByPath=new Map(native.indices.map((x:any)=>[x.path,x.index]));
  const currentReady=new Set<string>(),validationRows:any[]=[];
  const scope:any={landscape:{landscapeId:inputs.landscape.landscapeId??inputs.landscape.id},rawLandscape:inputs.landscape,goalById:byGoal,rawGoalById:byGoal,atomicGoalIds:inputs.ordinary,denominator:450,issues:[]};
  for(const indexPath of [...new Set([...native.owners.values()].map((o:any)=>o.indexPath))]){
   const index=indicesByPath.get(indexPath),superseded=new Set<string>(index.resolutions.filter((r:any)=>native.owners.get(r.goalId)?.indexPath!==indexPath).map((r:any)=>r.goalId));
   const withdrawn=new Map<string,string>(inputs.chem.resolutionWithdrawals.filter((w:any)=>w.indexPath===indexPath).map((w:any)=>[w.goalId,w.historicalResolutionDigest]));
   const result=await validateResolutionIndex(indexPath,inputs.chem,scope,superseded,withdrawn,native.retirement);
   for(const id of result.ready)currentReady.add(id);
   validationRows.push({indexPath,readyGoalIds:[...result.ready].sort(),issues:result.issues,unchangedProductionValidator:true});
  }
  for(const p of guards)check(p);
  // This is the sole full-model load/build in this helper. No renderer is called.
  const loaded=await loadGoalBookBuildInputs(spec.baseGoalBookConfig.path),model=loaded.model;
  must(model.pages.length===450&&model.pages.every(p=>inputs.ordinary.has(p.goalId)),'Actual full model does not cover exact450 ordinary goals');
  const pageById=new Map(model.pages.map(p=>[p.goalId,p]));
  const cache=new Map<string,any>(),get=(p:string)=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p)};
  const rel=(p:string)=>relative(process.cwd(),resolve(p));
  const transportKeys=new Set(['pageNumber','navigationOrder','treeOrder','anchor','breadcrumbs','chapterIds','pageFingerprint']);
  const refKeys=new Set(['requires','reverseRequires','externalPrerequisites','externalReverseRequires']);
  const allowedPageKeys=new Set(['goalId','shortKey','title','description','applicability','visualization','evidenceReview','goalFingerprint',...transportKeys,...refKeys]);
  const normalizedRefs=(refs:any[])=>refs.map(r=>({goalId:r.goalId,title:r.title,landscapeId:r.landscapeId??null,canonicalUrl:r.canonicalUrl??null})).sort((a,b)=>a.goalId.localeCompare(b.goalId)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const pagePayload=(p:any)=>{must(Object.keys(p).every(k=>allowedPageKeys.has(k)),'Unknown page key must be classified explicitly');const a:any=Object.fromEntries(Object.entries(p).filter(([k])=>!transportKeys.has(k)&&!refKeys.has(k)));a.forwardReferences=normalizedRefs([...p.requires,...p.externalPrerequisites]);a.reverseReferences=normalizedRefs([...p.reverseRequires,...p.externalReverseRequires]);return a};
  const perGoal:any[]=[];
  for(const id of [...inputs.ordinary].sort()){
   const o=native.owners.get(id),root=rel(resolve(dirname(o.indexPath),o.group.artifactDirectory??o.group.groupId)),resolutionPath=rel(resolve(dirname(o.indexPath),o.entry.resolutionPath));
   const resolution=get(resolutionPath),firstPath=root+'/round-a/description-review-input.json',secondPath=root+'/round-b/description-review-input.json';
   const first=get(firstPath),second=get(secondPath),frozen=first.goals.find((g:any)=>g.goalId===id),peer=second.goals.find((g:any)=>g.goalId===id);
   must(frozen&&peer&&isDeepStrictEqual(frozen,peer),'Original two native input values differ '+id);
   must(fingerprintGoalDescriptionReviewContext(frozen)===resolution.goal.goalReviewContextFingerprint&&fingerprintGoalDescriptionReviewPage(frozen.reviewContext.page)===resolution.goal.pageFingerprint,'Original native bindings are not internally exact '+id);
   const goal=byGoal.get(id),page=pageById.get(id)!,record=P.selected.get(id).record;
   const expectedSummary={reviewId:record.reviewId,status:record.status,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope};
   must(isDeepStrictEqual(page.evidenceReview,expectedSummary)&&page.goalFingerprint===record.goalFingerprint,'Actual stock page does not bind selected P whole record '+id);
   const actual={goalId:id,goalFingerprint:page.goalFingerprint,pageFingerprint:page.pageFingerprint,currentTitleDe:goal.title,currentTitleEn:goal.titleEn,currentDescriptionDe:goal.description,currentDescriptionEn:goal.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(goal),reviewContext:{page,evidenceProfile:record}};
   const oldPage=frozen.reviewContext.page,rawPageFields=fields(oldPage,page),payloadFields=fields(pagePayload(oldPage),pagePayload(page)),canonicalFields=fields(frozen.canonicalContext,actual.canonicalContext),evidenceFields=fields(frozen.reviewContext.evidenceProfile,record);
   const textFields=fields({titleDe:frozen.currentTitleDe,titleEn:frozen.currentTitleEn,descriptionDe:frozen.currentDescriptionDe,descriptionEn:frozen.currentDescriptionEn},{titleDe:goal.title,titleEn:goal.titleEn,descriptionDe:goal.description,descriptionEn:goal.descriptionEn});
   const priorRow:any=priorById.get(id),nativeValid=currentReady.has(id);
   const required=!nativeValid||canonicalFields.length>0||textFields.length>0||payloadFields.length>0||evidenceFields.length>0;
   perGoal.push({goalId:id,title:goal.title,activeIndex:o.indexPath,resolutionPath,originalFirstInput:firstPath,originalSecondInput:secondPath,originalReviewIdentities:resolution.rounds,unchangedProductionNativeContractValid:nativeValid,canonicalContextChangedFields:canonicalFields,bilingualTextChangedFields:textFields,strictRawPageChangedFields:rawPageFields,pagePayloadChangedFields:payloadFields,completeSelectedPRecordChangedFields:evidenceFields,oldContextFingerprint:fingerprintGoalDescriptionReviewContext(frozen),actualFullModelContextFingerprint:fingerprintGoalDescriptionReviewContext(actual),oldPageFingerprint:oldPage.pageFingerprint,actualFullModelPageFingerprint:page.pageFingerprint,requiresActualFinalInputReview:!!required,pureEnvelopeDifferenceWithValidatedOldNativeOwner:!required&&rawPageFields.length>0,retainedOriginalOwnerEligible:!required&&nativeValid,prior737Attribution:priorRow?.attribution??null,newNativeReviewOrScienceAcceptanceClaimed:false});
  }
  const requiredIds=perGoal.filter(r=>r.requiresActualFinalInputReview).map(r=>r.goalId),requiredSet=new Set(requiredIds),done=new Set<string>(),ordered:string[]=[];
  while(done.size<requiredIds.length){const candidates=requiredIds.filter(id=>!done.has(id)&&pageById.get(id)!.requires.every(r=>!requiredSet.has(r.goalId)||done.has(r.goalId))).sort((a,b)=>pageById.get(a)!.navigationOrder-pageById.get(b)!.navigationOrder||a.localeCompare(b));must(candidates.length>0,'Actual final required roster has no prerequisite-safe ordering');done.add(candidates[0]);ordered.push(candidates[0]);}
  const configs:any[]=[],subsetChecks:any[]=[];
  for(let i=0;i<ordered.length;i+=20){
   const n=String(i/20+1).padStart(3,'0'),goalIds=ordered.slice(i,i+20),batchId='chemie-current450-final-context-d-'+n+'-20261018-v1',bookId='chemie-current450-final-context-d-'+n;
   const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds,bookId,title:'Chemie: endgültiger aktueller D-Kontext'});
   must(subset.pages.length===goalIds.length,'Actual bounded subset lost selected goals');
   configs.push({path:spec.outputRoot+'/batch-'+n+'.config.json',value:{$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'chemie',subjectLabel:'Chemie',bookId,title:'Chemie: endgültiger aktueller D-Kontext',baseGoalBookConfigPath:spec.baseGoalBookConfig.path,goalIds,outputDirectory:spec.outputRoot+'/batch-'+n,feedbackBaseUrl:'https://skillpilot.com/api/goal-feedback',promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',publicRoot:'app/public',printDerivativeProfile:'bounded-atlas'}});
   subsetChecks.push({goalIds,pages:subset.pages.length,stockSubsetDigest:subset.digest});
  }
  guards.push(...native.indices.map((r:any)=>pin(r.path)),...[...cache.keys()].map(pin));
  for(const p of guards)check(p);
  mkdirSync(spec.outputRoot,{recursive:true});
  const write=(p:string,v:any)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  write(cfg.outputPath,model);
  const measurementPath=spec.outputRoot+'/MEASUREMENT.actual-final-450-page-and-context-deltas.json';
  const summary={ordinaryGoals:450,fullModelBuilds:1,actualProductionNativeCurrentReady:currentReady.size,strictRawPageDeltaGoals:perGoal.filter(r=>r.strictRawPageChangedFields.length).length,pagePayloadDeltaGoals:perGoal.filter(r=>r.pagePayloadChangedFields.length).length,canonicalContextDeltaGoals:perGoal.filter(r=>r.canonicalContextChangedFields.length).length,selectedWholePRecordDeltaGoals:perGoal.filter(r=>r.completeSelectedPRecordChangedFields.length).length,requiredFinalInputReviewGoals:requiredIds.length,pureEnvelopeWithValidatedOldOwnerGoals:perGoal.filter(r=>r.pureEnvelopeDifferenceWithValidatedOldNativeOwner).length,boundedGroups:configs.length,renders:0,newVotes:0,normalWrites:0};
  write(measurementPath,{role:'ACTUAL_FINAL_STOCK_MODEL_AND_NATIVE_CONTRACT_BINDING_MEASUREMENT_NOT_REVIEW_ACCEPTANCE',finalCutPins:mandatory.map(k=>spec[k]),fullModel:pin(cfg.outputPath),sourceApplicabilityReceipt:spec.finalApplicabilityReceipt,summary,nativeValidation:validationRows,perGoal,requiredReviewGoalIds:ordered,strictBindingDeltaGoalIds:perGoal.filter(r=>r.strictRawPageChangedFields.length||r.canonicalContextChangedFields.length||r.completeSelectedPRecordChangedFields.length).map(r=>r.goalId),bindingTransportOnlyCandidates:perGoal.filter(r=>r.pureEnvelopeDifferenceWithValidatedOldNativeOwner).map(r=>({goalId:r.goalId,activeIndex:r.activeIndex,action:'Retain only the original unchanged-production-validated native owner; no new page fingerprint is claimed. Any later rebind to the new full-model envelope must satisfy the unchanged native contract.'})),selectionPolicy:'Actual native contract failures or changed canonical/text/page payload/complete selected P records require final-input review. Raw book/subset envelope differences are recorded separately and never by themselves supply a new scientific vote.',knownOldDifferencesNotBlanketRescheduled:true});
  const goalIdsPath=spec.outputRoot+'/GOAL_IDS.actual-final-required-native-input-reviews.json';write(goalIdsPath,{goalIds:ordered,measurement:pin(measurementPath),derivedFromActualFinalModel:true});
  for(const c of configs){write(c.path,c.value);await loadGoalDescriptionRolloutBatchConfig(c.path);}
  const finalPlan={...spec,goalIds:ordered,goalIdsFile:pin(goalIdsPath),finalApplicabilityMeasurement:pin(measurementPath),batches:configs.map(c=>({config:pin(c.path),baseGoalBookConfig:spec.baseGoalBookConfig,finalReviewerReceipts:[],synthesisAuthoring:null})),additionalInputGuards:[...guards,pin(cfg.outputPath),pin(measurementPath),pin(goalIdsPath),pin(oldAuditPath)],actualFullModelBuiltOnce:true,scientificReuseIsDeclaredInputNotNewVote:true};
  write(spec.outputRoot+'/FINAL-INPUTS.actual.staged.json',finalPlan);
  write(spec.outputRoot+'/RECEIPT.actual-one-model-measure-and-bounded-configs.json',{role:'TECHNICAL_INPUT_MEASUREMENT_AND_CONFIG_GENERATION_ONLY',summary,finalFullModel:pin(cfg.outputPath),measurement:pin(measurementPath),requiredGoalIds:pin(goalIdsPath),subsetChecks,finalNativePlan:pin(spec.outputRoot+'/FINAL-INPUTS.actual.staged.json'),normalRegistryOrHistoricalFilesWritten:false,newNativeReviewerRecordsCreated:false});
  for(const p of guards)check(p);
  console.log(JSON.stringify({executed:true,summary,nativePlan:spec.outputRoot+'/FINAL-INPUTS.actual.staged.json'},null,2));
 }
}
}
main().catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1;});
