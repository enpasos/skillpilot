// Technical adoption of the selected actual sealed independent biology D rounds; no new science review.
// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout.ts'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {validateGoalDescriptionReviewDualRound} from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {extractGoalDescriptionDualRoundResolutionSource,buildGoalDescriptionDualRoundResolution,validateGoalDescriptionDualRoundResolution,fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {buildGoalDescriptionRolloutSynthesisRoundBinding,fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,validateGoalDescriptionRolloutSynthesisDecisionManifest} from '../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'
import {buildGoalDescriptionRolloutResolutionSynthesis} from '../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
assert.equal(process.argv.length,3,'Usage: tsx prepare-genuine-native-protected-one-existing-partial-contract.technical.mts <actual-inputs.json>')
const spec=JSON.parse(readFileSync(resolve(root,process.argv[2]),'utf8'))
assert.equal(spec.scope,'two-source-prerequisite-current')
const author=resolve(root,spec.authorDirectory),native=resolve(root,spec.nativeDirectory),srcA=resolve(root,spec.firstResultDirectory),srcB=resolve(root,spec.secondResultDirectory)
assert.notEqual(srcA,srcB)
const declared=new Map<string,any>(),sha=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:sha(b),bytes:b.length}}
const use=(p:string)=>{const b=bind(p);declared.set(p,b);return b}
const bytes=(p:string)=>{use(p);return readFileSync(p)}
const read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});const b=Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n';if(existsSync(p)){assert.equal(sha(readFileSync(p)),sha(b));return}writeFileSync(p,b,{flag:'wx'})}
const copy=(a:string,b:string)=>write(b,bytes(a))
const verify=(b:any)=>{const v=use(resolve(root,b.path));assert.equal(v.sha256,'sha256:'+b.sha256.replace('sha256:',''));if(b.bytes!==undefined)assert.equal(v.bytes,b.bytes);return v}
const seals=spec.sealBindings.map((b:any)=>{verify(b);return read(resolve(root,b.path))})
for(const binding of spec.requiredVerifiedBindings)verify(binding)
const sourceCanon=resolve(root,spec.canonicalPath),landscape=read(sourceCanon),modelFull=read(resolve(root,spec.fullModelPath))
assert.equal(landscape.goals.length,479);assert.equal(modelFull.pages.length,394)
const allLower:any[]=[]
for(const scope of [spec.scope]){
const existingOut=resolve(own,'native-d-'+scope),existingIndex=resolve(existingOut,'resolution-index.json')
assert.equal(existsSync(existingIndex),false,'Immutable new direct native campaign path required')

const out=resolve(own,'native-d-'+scope),sourceBundle=resolve(native,'bundle')
for(const n of ['review-bundle-manifest.json','book-model.json'])copy(resolve(sourceBundle,n),resolve(out,'bundle',n));
// Genuine already-versioned native HTML/PDF remain at the original bundle; no re-render or duplicate native archive.
for(const b of spec.originalNativeBindings)verify(b)
copy(resolve(out,'bundle/review-bundle-manifest.json'),resolve(out,'bundle/manifest.json'));const bundle=read(resolve(out,'bundle/manifest.json')),model=read(resolve(out,'bundle/book-model.json'))
const roundA={base:resolve(native,'round-a'),input:'description-review-input.json',campaign:'description-review-campaign.json',bundle:'review-bundle-manifest.json',batches:resolve(native,'round-a/batches'),results:srcA}
const roundB={base:resolve(native,'round-b'),input:'description-review-input.json',campaign:'description-review-campaign.json',bundle:'review-bundle-manifest.json',batches:resolve(native,'round-b/batches'),results:srcB}
const input=read(resolve(roundA.base,roundA.input)),secondInput=read(resolve(roundB.base,roundB.input));assert.equal(stableGoalBookJson(input),stableGoalBookJson(secondInput))
const firstCampaign=read(resolve(roundA.base,roundA.campaign)),secondCampaign=read(resolve(roundB.base,roundB.campaign));assert.notEqual(firstCampaign.independenceGroupId,secondCampaign.independenceGroupId)
assert.equal(firstCampaign.batchSize,20);assert.equal(secondCampaign.batchSize,20);assert.equal(firstCampaign.blindToOtherReviews,true);assert.equal(secondCampaign.blindToOtherReviews,true)
const batchId='biologie-two-reviewed-native-d-20261009-v1-'+scope,configPath=resolve(own,'native-d-'+scope+'.batch.config.json')

const cfg={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'biologie',subjectLabel:'Biologie',bookId:model.book.id,title:model.book.title,outputDirectory:relative(root,out),baseGoalBookConfigPath:spec.bookConfigPath,goalIds:input.goals.map((g:any)=>g.goalId),feedbackBaseUrl:'https://skillpilot.com/feedback',promptPath:relative(root,resolve(native,'round-a/prompt.md')),criteriaPath:relative(root,resolve(native,'round-a/criteria.md')),publicRoot:relative(root,author)};write(configPath,cfg)
const roundBinding=(directory:string,c:any)=>({directory,campaignId:c.campaignId,campaignDigest:fingerprintGoalDescriptionReviewCampaign(c),roundId:c.roundId,independenceGroupId:c.independenceGroupId,batchId:c.batches[0].batchId,batchInputFingerprint:c.batches[0].batchInputFingerprint})
const manifest={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',schemaVersion:1,validationContract:'goal-description-rollout-batch-v1',batchId,subject:'biologie',subjectLabel:'Biologie',configPath:relative(root,configPath),configDigest:sha(readFileSync(configPath)),goalIds:cfg.goalIds,curriculumAtomicDenominatorAtPreparation:394,source:{baseGoalBookConfigPath:cfg.baseGoalBookConfigPath,landscapePath:model.source.landscapePath,landscapeId:model.book.landscapeId,baseBookDigest:modelFull.digest},artifacts:{bundleDirectory:'bundle',bookModelPath:'bundle/book-model.json',bookModelDigest:model.digest,bundleManifestPath:'bundle/manifest.json',bundleFingerprint:bundle.bundleFingerprint,reviewInputFingerprint:input.reviewInputFingerprint,rounds:{first:roundBinding('round-a',firstCampaign),second:roundBinding('round-b',secondCampaign)}},reviewPolicy:{oneBatchPerRound:true,blindIndependentFirstPass:true,aiRecordsAreCandidatesOnly:true,automaticAcceptance:false}};write(resolve(out,'batch-manifest.json'),manifest)
for(const [name,r,c] of [['a',roundA,firstCampaign],['b',roundB,secondCampaign]] as any[]){const target=resolve(out,'round-'+name);copy(resolve(r.base,r.input),resolve(target,'description-review-input.json'));copy(resolve(r.base,r.campaign),resolve(target,'description-review-campaign.json'));copy(resolve(r.base,r.bundle),resolve(target,'review-bundle-manifest.json'));for(const n of ['prompt.md','criteria.md','contracts/goal-description-review-record.schema.json'])copy(resolve(r.base,n),resolve(target,n));const bid=c.batches[0].batchId;copy(resolve(r.batches,bid+'.input.jsonl'),resolve(target,'batches',bid+'.input.jsonl'));for(const [suffix,actual] of [['records.jsonl',name==='a'?spec.firstActualRecordsPath:spec.secondActualRecordsPath],['run.json',name==='a'?spec.firstActualRunPath:spec.secondActualRunPath]])copy(resolve(root,actual),resolve(target,'results',bid+'.'+suffix));const run=read(resolve(target,'results',bid+'.run.json'));assert.equal(run.blindToOtherRuns,true);assert.equal(run.independenceGroupId,c.independenceGroupId)}
const loadActualRound = async (name:string) => { const folder=resolve(out,'round-'+name), bundle=read(resolve(folder,'review-bundle-manifest.json')), input=read(resolve(folder,'description-review-input.json')), campaign=read(resolve(folder,'description-review-campaign.json')); const loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(folder,'batches'),resultsDirectory:resolve(folder,'results')});assert.deepEqual(loaded.errors,[]);return {bundle,input,campaign,resultPairs:loaded.resultPairs} }
const first=await loadActualRound('a'), second=await loadActualRound('b');const actualDual=await validateGoalDescriptionReviewDualRound({first,second});assert.deepEqual(actualDual.errors,[]);assert.ok(actualDual.summary);const dualBytes=Buffer.from(JSON.stringify(actualDual.summary,null,2)+'\n');write(resolve(out,'dual-summary.json'),dualBytes);const dual={first,second,summary:actualDual.summary!,bytes:dualBytes}
// The unchanged native CampaignResults, DualRound and Resolution APIs validate the genuine batchSize20 campaigns directly.
// No PreparedBatch20 wrapper or fabricated reviewer campaign is used.


const sources=input.goals.map((g:any)=>{const a=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:g.goalId,label:'sealed root A'}),b=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:g.goalId,label:'sealed B'});assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.equal(a.source!.decision,'keep');assert.equal(b.source!.decision,'keep');return {goal:g,first:a.source!,second:b.source!}})
assert.equal(sources.length,2)
assert.deepEqual(sources.map((s:any)=>s.goal.goalId).sort(),['82acfbde-9ce8-5658-892e-4dcfb1c3a1f1','328fd9d3-d3c3-5731-a8da-a909143d3962'].sort())
const entries=[]
for(const s of sources){
 const targetId=s.goal.goalId
 const synthesis={synthesisId:batchId+'-actual-current-synthesis-'+targetId,authority:'ai_synthesis' as const,synthesizedBy:'Codex technical integrator of two genuine separately sealed current native/source reviews; no new science reviewer',synthesizedAt:new Date().toISOString(),rationaleDe:'Gezielte technische Übernahme der zwei tatsächlichen aktuellen unabhängigen KEEP-Reviews für die betroffene ganze Ziel-/Seiten-/Quellen-/Kontextbindung. Beide echten Evidenzketten bleiben unverändert; die eigene erste Verständnisevidenz wird in dieser kompatiblen Auflösung ausgewählt. Die tatsächliche Primäroperatorprüfung erhält neun legitime weitere Unterstufenrollen, korrigiert die begrenzten SN/ST-Rollen und entfernt genau die unzulässige universelle Voraussetzung328fd→82ac. Dies ist keine neue fachliche Prüfung unveränderter Ziele und keine menschliche Freigabe.',rationaleEn:'Targeted technical adoption of two actual current independent KEEP reviews for the affected whole goal/page/source/context binding. Both genuine evidence chains remain unchanged; the first understanding evidence is selected in this compatible resolution. Actual primary-operator review retains nine legitimate other lower-stage roles, corrects the bounded SN/ST roles and removes exactly the unjustified universal prerequisite328fd→82ac. This is neither new scientific review of unchanged goals nor human approval.',understandingEvidence:structuredClone(s.first.record.understandingEvidence),dissent:[{dissentId:'compatible-genuine-current-native-evidence-'+targetId,source:'both' as const,textDe:'Die beiden tatsächlichen aktuellen KEEP-Records stimmen in der ganzen Ziel-/Seiten-/Kontextentscheidung überein. Beide Evidenzketten bleiben erhalten; die erste wird ausgewählt.',textEn:'Both actual current KEEP records agree on the whole goal/page/context decision. Both evidence chains are retained; the first is selected.',disposition:'accepted_first' as const}],humanAttestation:null}
 const resolution=buildGoalDescriptionDualRoundResolution({resolutionId:batchId+'-resolution-'+targetId,goalId:targetId,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dual.bytes,currentInput:input,firstSource:s.first,secondSource:s.second})
 const validation=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:input,landscape,first:dual.first,second:dual.second});assert.deepEqual(validation.errors,[]);assert.equal(validation.strictDescriptionComplete,true)
 const rp=resolve(out,'resolutions',targetId+'.resolution.json');write(rp,resolution)
 entries.push({goalId:targetId,titleDe:s.goal.currentTitleDe,groupId:batchId,decision:'keep_current',resolutionPath:'resolutions/'+targetId+'.resolution.json',resolutionDigest:sha(readFileSync(rp)),resolutionFingerprint:resolution.resolutionFingerprint,strictDescriptionComplete:true})
}
const index:any={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',schemaVersion:2,indexContract:'goal-description-standalone-batch-resolution-index-v1',artifactSetId:batchId+'-genuine-current-two-resolutions',subject:'Biologie',semanticKind:'curricularAtomic',batchGoalIds:input.goals.map((g:any)=>g.goalId),groups:[{groupId:batchId,artifactDirectory:'.',dualSummaryPath:'dual-summary.json',dualSummaryDigest:sha(dual.bytes),campaignGoalCount:2,resolvedGoalCount:2}],resolutions:entries}
assert.deepEqual(validateStandaloneResolutionIndexSchema(index),[]);assert.deepEqual(validateStandaloneResolutionIndexStructure(index,new Set(modelFull.pages.map((p:any)=>p.goalId))),[]);write(resolve(out,'resolution-index.json'),index)
allLower.push({scope,config:bind(configPath),index:bind(resolve(out,'resolution-index.json')),ordinaryStandaloneIndexFormat:'existing closed schema-version2 standalone contract',nativeCampaignResultsPASS:true,nativeDualSummaryPASS:true,individualResolutionValidationPASS:true,actualNativeCampaignGoalCount:2,selectedGoalIds:input.goals.map((g:any)=>g.goalId),sourceCanon:bind(sourceCanon),centralAdoptionPending:true})
}
write(resolve(own,'checks/'+spec.scope+'.genuine-native-D-direct-existing-contracts.actual.json'),{seals,D:allLower,originalCampaignAndInputAndRecordAndRunBytesUnchanged:true,completeIndependentActualSources:true,noFabricatedDeferredKeepClaims:true,noNewScienceRun:true,noWholeSourceCourseApproval:true,activeWrites:0,humanApproval:false,humanTrial:false,newStrictScientificClosuresClaimed:0,restoredStrictBindingsIntegrated:0})
write(resolve(own,'checks/'+spec.scope+'.genuine-native-D-declared-inputs.actual.json'),{files:[...declared.values()]})
console.log(JSON.stringify({nativeCampaignResults:'PASS',nativeDual:'PASS',ordinaryExistingStandaloneV2Index:'PASS',individualGenuineCurrentResolutions:2,activeWrites:0,newScientificStrictClosures:0}))
