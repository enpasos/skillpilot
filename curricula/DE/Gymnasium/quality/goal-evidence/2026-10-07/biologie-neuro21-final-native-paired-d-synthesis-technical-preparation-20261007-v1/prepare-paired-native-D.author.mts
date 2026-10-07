// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import { stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import { validatePreparedGoalDescriptionRolloutBatch, materializeGoalDescriptionRolloutBatchDualSummary } from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { extractGoalDescriptionDualRoundResolutionSource, buildGoalDescriptionDualRoundResolution, validateGoalDescriptionDualRoundResolution, fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewCampaign } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import { buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, validateGoalDescriptionRolloutSynthesisDecisionManifest } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '/home/enpasos/projects/skillpilot/app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'

const root='/home/enpasos/projects/skillpilot'
const own=dirname(fileURLToPath(import.meta.url))
const stage=resolve(own,'../biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1')
const contracts=resolve(own,'../biologie-neuro21-final-native-d-campaigns-integration-plan-author-20261007-v1')
const sourceA=resolve(own,'../biologie-neuro21-final-images-current-bindings-independent-root-a-v1')
const sourceB=resolve(root,process.argv[2]??'missing-independent-B-path')
const sealBPath=resolve(root,process.argv[3]??'missing-independent-B-seal')
const declared=new Map<string,any>()
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:sha(b),bytes:b.length}}
const use=(p:string)=>{declared.set(p,bind(p));return bind(p)}
const read=(p:string)=>{use(p);return JSON.parse(readFileSync(p,'utf8'))}
const bytes=(p:string)=>{use(p);return readFileSync(p)}
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const copy=(p:string,q:string)=>write(q,bytes(p))
const verifySeal=(p:string,expected?:string)=>{
  const b=use(p);if(expected)assert.equal(b.sha256,expected)
  const s=read(p)
  const payload=s.ownPayloads??s.files??s.payloads??s.ownFiles
  assert.ok(Array.isArray(payload),'seal must declare payloads')
  const inputs=s.declaredInputs??s.inputs??[]
  for(const item of [...payload,...inputs]){const a=bind(resolve(root,item.path));assert.equal(a.sha256.replace('sha256:',''),item.sha256.replace('sha256:',''));assert.equal(a.bytes,item.bytes)}
  return {seal:b,verifiedPayloadCount:payload.length,verifiedInputCount:inputs.length}
}
const seals={A:verifySeal(resolve(sourceA,'independent-final-native-current-d-a-v1.final.freeze.json'),'sha256:aeea2c0f947f4e30c32bda224b42bbb3ef40022942fcbba2fe4c0a66bde8b2ce'),B:verifySeal(sealBPath,'sha256:13cc45b355cce30dc72f3a7e57813d64feeca9e1fabbab985955e2e64f1f741a'),stage03:verifySeal(resolve(stage,'final-native-preparation.author.freeze.json'),'sha256:8046c51f45013d2fcffbb5da26e55ed2f83dcc0eaca9b02411b950d1298342ec'),campaigns:verifySeal(resolve(contracts,'technical-preparation.final.freeze.json'),'sha256:968d8f964e8deac4bbb5752bb05296235b1d6349f8bffe2174311e308950a7db')}
const privateCanonical=resolve(stage,'isolated-repository/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const landscape=read(privateCanonical)
const goals=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const base=read(resolve(stage,'isolated-repository/outputs/full-final390.book-model.json'))
const neutral=read(resolve(stage,'final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json'))
const neutralRows=new Map(neutral.records.map((r:any)=>[r.goalId,r]))
const validations:any[]=[]
const artifactRouting:any[]=[]
for(const scope of ['twenty','one']){
  const previous=resolve(contracts,'native-d-'+scope)
  const out=resolve(own,'native-d-'+scope)
  for(const name of readdirSync(resolve(previous,'bundle'),{recursive:true}) as string[]){const p=resolve(previous,'bundle',name);try{readFileSync(p)}catch{continue};copy(p,resolve(out,'bundle',name))}
  const bundle=read(resolve(out,'bundle/manifest.json'))
  const model=read(resolve(out,'bundle/book-model.json'))
  const input=read(resolve(previous,'round-a/description-review-input.json'))
  const firstCampaign=read(resolve(previous,'round-a/description-review-campaign.json'))
  const secondCampaign=read(resolve(previous,'round-b/description-review-campaign.json'))
  const batchId='biologie-neuro21-final-native-paired-'+scope+'-20261007-v1'
  const configPath=resolve(own,'native-d-'+scope+'.batch.config.json')
  const baseConfigPath=relative(root,resolve(stage,'isolated-repository/config/full-final390.book.config.json'))
  const config={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'biologie',subjectLabel:'Biologie',bookId:model.book.id,title:model.book.title,baseGoalBookConfigPath:baseConfigPath,goalIds:input.goals.map((g:any)=>g.goalId),outputDirectory:relative(root,out),feedbackBaseUrl:bundle.feedbackBaseUrl,promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md',publicRoot:relative(root,resolve(stage,'isolated-repository/app/public')),printDerivativeProfile:'bounded-atlas'}
  write(configPath,config)
  const roundBinding=(directory:string,c:any)=>({directory,campaignId:c.campaignId,campaignDigest:fingerprintGoalDescriptionReviewCampaign(c),roundId:c.roundId,independenceGroupId:c.independenceGroupId,batchId:c.batches[0].batchId,batchInputFingerprint:c.batches[0].batchInputFingerprint})
  const manifest={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',schemaVersion:1,validationContract:'goal-description-rollout-batch-v1',batchId,subject:'biologie',subjectLabel:'Biologie',configPath:relative(root,configPath),configDigest:sha(readFileSync(configPath)),goalIds:config.goalIds,curriculumAtomicDenominatorAtPreparation:390,source:{baseGoalBookConfigPath:baseConfigPath,landscapePath:model.source.landscapePath,landscapeId:model.book.landscapeId,baseBookDigest:base.digest},artifacts:{bundleDirectory:'bundle',bookModelPath:'bundle/book-model.json',bookModelDigest:model.digest,bundleManifestPath:'bundle/manifest.json',bundleFingerprint:bundle.bundleFingerprint,reviewInputFingerprint:input.reviewInputFingerprint,rounds:{first:roundBinding('round-a',firstCampaign),second:roundBinding('round-b',secondCampaign)}},reviewPolicy:{oneBatchPerRound:true,blindIndependentFirstPass:true,aiRecordsAreCandidatesOnly:true,automaticAcceptance:false}}
  write(resolve(out,'batch-manifest.json'),manifest)
  for(const [round,source] of [['a',sourceA],['b',sourceB]]){
    const rp=resolve(previous,'round-'+round),target=resolve(out,'round-'+round)
    for(const name of ['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json','prompt.md','criteria.md','contracts/goal-description-review-record.schema.json'])copy(resolve(rp,name),resolve(target,name))
    const campaign=round==='a'?firstCampaign:secondCampaign
    const bid=campaign.batches[0].batchId
    copy(resolve(rp,'batches',bid+'.input.jsonl'),resolve(target,'batches',bid+'.input.jsonl'))
    // Exact sealed successful native-conformant first-pass bytes, never original failed format.
    const sourceRecords=round==='a'?resolve(source,'native-d-'+scope,'records.native-conformant.jsonl'):resolve(source,'native-d-'+scope,'results',bid+'.records.jsonl')
    const sourceRun=round==='a'?resolve(source,'native-d-'+scope,'run.native-conformant.json'):resolve(source,'native-d-'+scope,'results',bid+'.run.json')
    copy(sourceRecords,resolve(target,'results',bid+'.records.jsonl'))
    copy(sourceRun,resolve(target,'results',bid+'.run.json'))
  }
  await validatePreparedGoalDescriptionRolloutBatch(relative(root,configPath))
  const dual=await materializeGoalDescriptionRolloutBatchDualSummary(relative(root,configPath),true)
  const sources=input.goals.map((g:any)=>{
    assert.equal(stableGoalBookJson(g),stableGoalBookJson((neutralRows.get(g.goalId) as any).nativeFinalSubsetDInput))
    const a=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:g.goalId,label:'A'})
    const b=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:g.goalId,label:'B'})
    assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.ok(a.source&&b.source)
    assert.equal(a.source.decision,'keep');assert.equal(b.source.decision,'keep')
    return {goal:g,first:a.source!,second:b.source!}
  })
  const synthesizedAt=new Date(Math.max(...[...dual.first.resultPairs,...dual.second.resultPairs].map(({run}:any)=>Date.parse(run.completedAt)))+1000).toISOString()
  const expectedBatch={batchId,batchManifestDigest:sha(readFileSync(resolve(out,'batch-manifest.json'))),configDigest:manifest.configDigest,bundleFingerprint:bundle.bundleFingerprint,bookDigest:input.bookDigest,reviewInputFingerprint:input.reviewInputFingerprint,dualSummaryDigest:sha(dual.bytes),canonicalLandscapeDigest:sha(readFileSync(privateCanonical))}
  const rounds={first:buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].first.binding,firstCampaign.batches[0].batchInputFingerprint),second:buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].second.binding,secondCampaign.batches[0].batchInputFingerprint)}
  const expectedGoals=sources.map(({goal:g,first,second}:any)=>({goalId:g.goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},firstSource:first,secondSource:second}))
  const decisions=sources.map(({goal:g,first,second}:any)=>({decisionId:batchId+':'+g.goalId,goalId:g.goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},resolutionDecision:'keep_current',evidenceRound:'first',records:{first:{recordId:first.binding.recordId,recordDigest:first.binding.recordDigest},second:{recordId:second.binding.recordId,recordDigest:second.binding.recordDigest}},rationaleDe:'Vom Root delegierte faktische KEEP-Zusammenführung zweier versiegelter unabhängiger nativer Erstpass-Nachweise; keine neue Autor-Fachbewertung. A: '+first.record.rationale+' B: '+second.record.rationale,rationaleEn:'Root-delegated factual KEEP synthesis of two sealed independent native first-pass records over the exact final bilingual goal, PDF page, original raster and bounded source/context input. A evidence: '+first.record.understandingEvidence.essentialUnderstandingEn+' B evidence: '+second.record.understandingEvidence.essentialUnderstandingEn+' Existing current scientific material bodies remain bound, with the actual current080v4 replacement. This synthesis grants no human approval, whole-source approval or central strict gain.'}))
  for(const d of decisions){assert.ok(d.rationaleDe.length<=4000);assert.ok(d.rationaleEn.length<=4000)}
  const synthesisPayload={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',manifestId:batchId+'-synthesis',authority:'ai_synthesis',synthesizedBy:'Codex technical integrator under Root delegated factual paired KEEP decisions; no new scientific reviewer',synthesizedAt,batch:expectedBatch,rounds,decisions}
  const synthesis={...synthesisPayload,manifestFingerprint:fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(synthesisPayload as any)}
  const validation=await validateGoalDescriptionRolloutSynthesisDecisionManifest({manifest:synthesis as any,expected:{batch:expectedBatch as any,rounds,synthesizedAt,goals:expectedGoals as any}})
  assert.deepEqual(validation.errors,[])
  const synthesisPath=resolve(out,'synthesis-decisions.json')
  write(synthesisPath,synthesis)
  const synthesisBytes=readFileSync(synthesisPath)
  const entries:any[]=[]
  for(const s of sources){
    const decision=decisions.find(d=>d.goalId===s.goal.goalId)!
    const summaryGoal=dual.summary.goals.find((g:any)=>g.goalId===s.goal.goalId)!
    const fact=buildGoalDescriptionRolloutResolutionSynthesis({batchId,manifest:synthesis as any,decision:decision as any,summaryGoal,firstSource:s.first,secondSource:s.second})
    const resolution=buildGoalDescriptionDualRoundResolution({resolutionId:batchId+':'+s.goal.goalId,goalId:s.goal.goalId,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis:fact,dualSummaryBytes:dual.bytes,currentInput:input,firstSource:s.first,secondSource:s.second,synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestId:synthesis.manifestId,manifestPath:'synthesis-decisions.json',manifestDigest:sha(synthesisBytes),manifestFingerprint:synthesis.manifestFingerprint,decisionId:decision.decisionId}})
    const result=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:input,landscape,first:dual.first,second:dual.second,synthesisDecisionManifestArtifact:{manifest:synthesis as any,manifestBytes:synthesisBytes,manifestPath:'synthesis-decisions.json'}})
    assert.deepEqual(result.errors,[]);assert.equal(result.strictDescriptionComplete,true)
    const path=resolve(out,'resolutions',s.goal.goalId+'.resolution.json')
    write(path,resolution)
    entries.push({goalId:s.goal.goalId,titleDe:s.goal.currentTitleDe,groupId:batchId,decision:resolution.decision,resolutionPath:'resolutions/'+s.goal.goalId+'.resolution.json',resolutionDigest:sha(readFileSync(path)),resolutionFingerprint:resolution.resolutionFingerprint,strictDescriptionComplete:true})
    validations.push({scope,goalId:s.goal.goalId,nativeResolutionErrors:result.errors,inertNativeDescriptionComplete:result.strictDescriptionComplete,centralStrictGain:0,sourceAMetadata:s.first.binding,sourceBMetadata:s.second.binding,exactOriginalFinalPage:s.goal.reviewContext.page,wholeCurrentPositiveBody:(neutralRows.get(s.goal.goalId) as any).positiveCurrentFinalProfileBody,wholeSourceApproval:false,humanApproval:false,humanTrial:false})
  }
  // Existing native contract construction; upper index API needs future active canonical.
  const index={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',schemaVersion:2,indexContract:'goal-description-standalone-batch-resolution-index-v1',artifactSetId:batchId+'-strict-resolutions',subject:'Biologie',semanticKind:'curricularAtomic',batchGoalIds:config.goalIds,groups:[{groupId:batchId,artifactDirectory:'.',dualSummaryPath:'dual-summary.json',dualSummaryDigest:sha(dual.bytes),campaignGoalCount:dual.summary.goalCount,resolvedGoalCount:entries.length}],resolutions:entries}
  const schemaPath=resolve(root,'contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json')
  const schema=read(schemaPath),ajv=new Ajv2020({allErrors:true,strict:true}),checker=ajv.compile(schema)
  assert.ok(checker(index),JSON.stringify(checker.errors))
  const indexPath=resolve(out,'resolution-index.json')
  write(indexPath,index)
  artifactRouting.push({scope,config:bind(configPath),batchManifest:bind(resolve(out,'batch-manifest.json')),dualSummary:bind(resolve(out,'dual-summary.json')),synthesis:bind(synthesisPath),resolutionIndex:bind(indexPath),nativePreparedBatchValid:true,nativeDualSummaryValid:true,nativeSynthesisValid:true,nativeResolutionCount:entries.length,indexNativeSchemaValid:true,upperIndexMaterializerDeferredUntilActualCanonicalIntegration:true,actualSourceCanonical:bind(privateCanonical)})
}
assert.equal(validations.length,21)
const a949=resolve(sourceA,'unselected949-actual-context-only-review.root-a.json')
copy(a949,resolve(own,'inputs/unselected949.actual-root-a-context-review.exact.json'))
copy(resolve(contracts,'concrete-native-integration-plan.author.json'),resolve(own,'inputs/prior-concrete-native-integration-plan.exact.json'))
copy(resolve(contracts,'protected74-planned-exact-whole-goal-page-context-image-AM-fingerprints.author.json'),resolve(own,'inputs/protected74.exact-fingerprints.json'))
copy(resolve(contracts,'protected-Math-Physics-and-current-Bio-registry-bindings.author.json'),resolve(own,'inputs/protected-Math-Physics-Bio-registry.exact.json'))
const operativeConfigs:any[]=[]
for(const kind of ['atomicity','memory']){
  const cfg=read(resolve(stage,'candidate-scaffolds/current-content-'+kind+'.final-images.config.json'))
  const outputRecords=resolve(own,'operative/current-full390-'+kind+'.records.jsonl')
  copy(resolve(root,cfg.reviewPath),outputRecords)
  const candidate={...cfg,reviewPath:relative(root,outputRecords),reportPath:relative(root,resolve(own,'operative/current-full390-'+kind+'.report.md'))}
  if(kind==='memory'){
    const cards=resolve(own,'operative/current-memory-cards.exact.jsonl')
    copy(resolve(root,cfg.cardReviewPath),cards);candidate.cardReviewPath=relative(root,cards)
  }
  const output=resolve(own,'operative/current-full390-'+kind+'.config.json');write(output,candidate)
  operativeConfigs.push({kind,config:bind(output),records:bind(outputRecords),wholeCurrent390ScienceDecisionsExact:true})
}
copy(resolve(contracts,'planned-active-atomicity.config.author.json'),resolve(own,'operative/future-active-atomicity.config.author.json'))
copy(resolve(contracts,'planned-active-memory.config.author.json'),resolve(own,'operative/future-active-memory.config.author.json'))
copy(resolve(stage,'isolated-repository/inputs/semantic-kinds.final-image-candidate.json'),resolve(own,'operative/current-semantic-kinds.exact.json'))
write(resolve(own,'paired-native-D21-and-operative-current-integration-routing.author.json'),{role:'Root-delegated factual synthesis technical preparation; no new scientific reviewer',actualIndependentSeals:seals,nativeD20Plus1:artifactRouting,actualRoot949ContextOnly:bind(resolve(own,'inputs/unselected949.actual-root-a-context-review.exact.json')),operativeFull390AM:operativeConfigs,currentSemanticLedger:bind(resolve(own,'operative/current-semantic-kinds.exact.json')),concreteSourceAssetFutureIntegrationPlan:bind(resolve(own,'inputs/prior-concrete-native-integration-plan.exact.json')),futureRegistryResolutionIndexPaths:artifactRouting.map(r=>r.resolutionIndex.path),noActiveCopiesOrQARegistryWrites:true,wholeSourceCoverage:false,humanApproval:false,humanTrial:false,strictGain:0})
write(resolve(own,'actual-native-paired-synthesis-validations-and-source-body-bindings.author.json'),{role:'actual lower native validations over sealed independent first-pass records',validations,declaredInputs:[...declared.values()],upperNativeIndexMaterializerDeferredUntilFutureActiveCanonical:true,unmodifiedNativeSchemasAndHelpers:true,newScientificReviewer:false,wholeSourceApproval:false,humanApproval:false,humanTrial:false,strictGain:0})
console.log(JSON.stringify({actualNativePairedGoalCount:validations.length,nativeSynthesisValidation:'pass',resolutionBindingErrors:0,sourceA:sourceA,sourceB:sourceB,newScientificReviews:0,centralStrictGain:0}))
