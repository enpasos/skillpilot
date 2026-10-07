// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookReviewBundle } from '/home/enpasos/projects/skillpilot/app/scripts/exportGoalBookReviewBundle.ts'
import { buildGoalDescriptionReviewInput, buildGoalDescriptionReviewCampaign, serializeGoalDescriptionReviewBatchInput, loadGoalDescriptionReviewRecordSchemaBytes, validateGoalDescriptionReviewCampaign } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { verifyGoalBookReviewBundleArtifactBytes, writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts } from '/home/enpasos/projects/skillpilot/app/scripts/createGoalDescriptionReviewCampaign.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { writeGoalBookModel, stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const root='/home/enpasos/projects/skillpilot'
const own=dirname(fileURLToPath(import.meta.url))
const previous=resolve(own,'../biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1')
const tracked=new Map<string,any>()
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const binding=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:hash(b),bytes:b.length}}
const read=(p:string)=>{tracked.set(p,binding(p));return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const neutralPath=resolve(previous,'final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json')
const neutral=read(neutralPath)
const landscapePath=resolve(previous,'isolated-repository/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const landscape=read(landscapePath)
const rows=new Map(neutral.records.map((r:any)=>[r.goalId,r]))
const promptPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md')
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md')
for(const p of [promptPath,criteriaPath])tracked.set(p,binding(p))
const recordSchema=await loadGoalDescriptionReviewRecordSchemaBytes()
const recordSchemaDigest=hash(recordSchema)
const routing:any[]=[]
for(const scope of ['twenty','one']){
  const old=resolve(previous,'native-final-'+scope)
  const bundleDir=resolve(own,'native-d-'+scope,'bundle')
  const modelPath=resolve(old,'book-model.json')
  const model=read(modelPath)
  const options={modelPath,pdfPath:resolve(old,'book.pdf'),pdfRenderManifestPath:resolve(old,'book.pdf.render-manifest.json'),htmlPath:resolve(old,'book.html'),htmlRenderManifestPath:resolve(old,'book.html.render-manifest.json'),outputDirectory:bundleDir,promptPath,criteriaPath,goalIds:[]}
  for(const p of [options.pdfPath,options.pdfRenderManifestPath,options.htmlPath,options.htmlRenderManifestPath])tracked.set(p,binding(p))
  const built=await buildGoalBookReviewBundle(model,options)
  for(const f of built.files)write(resolve(bundleDir,f.relativePath),f.content)
  write(resolve(bundleDir,'manifest.json'),built.manifest)
  const verified=await verifyGoalBookReviewBundleArtifactBytes(built.manifest,bundleDir)
  const input=buildGoalDescriptionReviewInput({bundle:built.manifest,reviewInput:built.input,landscape})
  for(const g of input.goals)assert.equal(stableGoalBookJson(g),stableGoalBookJson((rows.get(g.goalId) as any).nativeFinalSubsetDInput))
  const rounds:any[]=[]
  for(const reviewer of ['a','b']){
    const dir=resolve(own,'native-d-'+scope,'round-'+reviewer)
    const campaign=buildGoalDescriptionReviewCampaign({bundle:built.manifest,input,campaignId:'biologie-neuro21-final-'+scope+'-d-'+reviewer+'-20261007',roundId:'biologie-neuro21-final-'+scope+'-first-pass-'+reviewer+'-20261007',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'biologie-neuro21-final-native-d-independent-'+reviewer+'-20261007',blindToOtherReviews:true,recordSchemaDigest,batchSize:20})
    const result=await validateGoalDescriptionReviewCampaign({bundle:built.manifest,input,campaign})
    assert.deepEqual(result.errors,[])
    write(resolve(dir,'review-bundle-manifest.json'),built.manifest)
    write(resolve(dir,'description-review-input.json'),input)
    write(resolve(dir,'description-review-campaign.json'),campaign)
    write(resolve(dir,'contracts/goal-description-review-record.schema.json'),recordSchema)
    await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:built.manifest,campaignDirectory:dir,verifiedArtifactBytes:verified})
    const batches=campaign.batches.map(batch=>{
      const path=resolve(dir,'batches',batch.batchId+'.input.jsonl')
      write(path,serializeGoalDescriptionReviewBatchInput({bundleFingerprint:built.manifest.bundleFingerprint,bookDigest:built.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals.filter(g=>batch.goalIds.includes(g.goalId))}))
      return {...batch,input:binding(path)}
    })
    const config={role:'technical native campaign routing; no review result',reviewer,scope,reviewerRole:campaign.reviewerRole,permittedSubstantiveRunRole:reviewer==='b'?'assessment_adversarial_reviewer':'didactic_reviewer',blindToOtherReviews:true,independenceGroupId:campaign.independenceGroupId,bundle:binding(resolve(dir,'review-bundle-manifest.json')),input:binding(resolve(dir,'description-review-input.json')),campaign:binding(resolve(dir,'description-review-campaign.json')),batches,neutralFull21Input:binding(neutralPath),originalSealedArtifactDirectory:relative(root,old),privateCanonicalInput:binding(landscapePath),nativeBundleDirectory:relative(root,bundleDir),nativeValidator:'app/scripts/validateGoalDescriptionReviewCampaign.ts',nativeValidatorFlags:['--bundle','--input','--campaign','--run','--batch-input','--records'],recordSchemaDigest,humanApproval:false,humanTrial:false,newScientificDecision:false,strictGain:0}
    const configPath=resolve(dir,'native-review-routing.config.author.json')
    write(configPath,config)
    rounds.push({...config,config:binding(configPath),nativeCampaignValidationErrors:result.errors})
  }
  routing.push({scope,bundle:binding(resolve(bundleDir,'manifest.json')),bookModelDigest:model.digest,allGoalInputsExactToSealedStage03:true,rounds})
}
// Existing native subset API, same actual final full390 model; no scientific D campaign.
const basePath=resolve(previous,'isolated-repository/outputs/full-final390.book-model.json')
const base=read(basePath)
const id='9499943f-89b7-54e3-9fe2-e90404beaa4a'
const model949=buildGoalDescriptionRolloutSubsetModel({baseModel:base,goalIds:[id],bookId:base.book.id+'-unselected949-context',title:'Biologie – bestehender Kontext der Zielseite 949'})
const model949Path=resolve(own,'native-unselected949/book-model.json')
await writeGoalBookModel(model949,model949Path)
const diff=read(resolve(previous,'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json')).rows.find((r:any)=>r.goalId===id)
const gd=read(resolve(previous,'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json')).rows.find((r:any)=>r.goalId===id)
assert.equal(gd.currentVsFinalWholeGoalExact,true)
assert.deepEqual(model949.pages[0].visualization,diff.wholeFinalNativePage.visualization)
write(resolve(own,'native-unselected949/whole-goal-page-context.neutral.author.raw.json'),{role:'technical unselected949 page/context binding only; no new scientific review',goalId:id,wholeOriginalGoal:gd.wholeCurrentGoal,wholeFinalGoal:gd.wholeFinalImageCandidateGoal,wholeOriginalGoalExact:true,full390PageAndContextDiff:diff,nativeSubsetPage:model949.pages[0],nativeSubsetModel:binding(model949Path),nativeSubsetCanAdjustPageNavigationAndFingerprints:true,existingVisualizationExact:true,scientificApproval:false,humanApproval:false,humanTrial:false,strictGain:0})
write(resolve(own,'native-d20-plus1-campaigns.neutral-routing.author.json'),{role:'technical author routing of existing final native21 artifacts; no reviewer decisions',campaigns:routing,native949Model:binding(model949Path),sealedStage03Neutral:binding(neutralPath),lowerNativeApisUsedWithExplicitPrivateLandscape:true,upperCampaignWrapperRequiresLiveSourceRootAndWasNotUsed:true,full390ModelBuilds:0,twentyOneRerenders:0,scientificReviewRecordsCreated:0,activeWrites:false,humanApproval:false,humanTrial:false,strictGain:0})
write(resolve(own,'native-campaign-preparation.actual.author.receipt.json'),{role:'actual exported native contract builders',campaignCount:4,allFourNativeCampaignValidationsPassed:true,nativeInputExactToStage03:true,recordSchemaDigest,scientificReviewRecordsCreated:0,native949SubsetModelCreated:true,declaredInputs:[...tracked.values()],humanApproval:false,humanTrial:false,strictGain:0})
console.log(JSON.stringify({campaigns:4,nativeValidation:'passed',sameFinal21Inputs:true,scope949Model:relative(root,model949Path)}))
