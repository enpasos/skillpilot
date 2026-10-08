// SPDX-License-Identifier: Apache-2.0
// A real existing context delta is reviewable separately, never hash-approved.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync,symlinkSync,readlinkSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),word='576d59e2-397a-5654-b853-7c0c4870fbd3'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:relative(root,p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length})
const write=(p:string,v:any)=>{const bytes=Buffer.isBuffer(v)?v:Buffer.from(typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(bytes),'Refuse changed existing artifact '+p);return}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,bytes)}
const canonical=read(resolve(own,'candidate/canonical.shadow478.basic2-after-three-rasters.json'))
const goal=canonical.goals.find((g:any)=>g.id===word)
const originalCanon=read(resolve(own,'../biologie-stoffwechsel-first-three-native-technical-20261008-v1/candidate/canonical.current476.three-rasters.inactive.json'))
assert.deepEqual(goal,originalCanon.goals.find((g:any)=>g.id===word),'Existing text/resource/P/semantic body must stay KEEP')
assert.deepEqual(buildGoalDescriptionCanonicalContext(goal),buildGoalDescriptionCanonicalContext(originalCanon.goals.find((g:any)=>g.id===word)))
const qa=read(resolve(own,'candidate/visualization-QA.shadow394.two-unapproved.json'))
const imageRecord=qa.records.find((q:any)=>q.goalId===word);assert.ok(imageRecord&&imageRecord.aiApproved==='yes','Keep real original image approval without claiming new approval')
const originalImage=resolve(root,imageRecord.canonicalAssetPath),retainedImage=resolve(own,'retained-context-image',word+'.exact-KEEP.png'),alias=resolve(own,'assets/goal-visualizations/biologie',word,word+'.png')
assert.equal(sha(readFileSync(originalImage)),imageRecord.assetSha256)
write(retainedImage,readFileSync(originalImage));mkdirSync(dirname(alias),{recursive:true});if(existsSync(alias))assert.equal(readlinkSync(alias),relative(dirname(alias),retainedImage));else symlinkSync(relative(dirname(alias),retainedImage),alias)
const before=read(resolve(own,'../biologie-stoffwechsel-first-three-native-technical-20261008-v1/native/full392.current-three-source-raster.book-model.json'))
const after=read(resolve(own,'native/full394.basic2-after-source3.actual-model.json'))
const diff=read(resolve(own,'checks/actual-all392-pages-all241-strict-and-original3-frame.before-after.diff.json'))
assert.deepEqual(diff.strict241ChangedSubstantiveContextGoalIds,[word])
const native=resolve(own,'existing-word-context'),frames:any[]=[]
for(const [side,base] of [['before',before],['after',after]]as const){
 const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base,goalIds:[word],bookId:'biologie-existing-word-context-basic2-20261008',title:'Biologie: bestehender Fotosynthese-Wortkontext'})
 const dir=resolve(native,side),modelPath=resolve(dir,'book-model.json'),htmlPath=resolve(dir,'book.html'),pdfPath=resolve(dir,'book.pdf')
 write(modelPath,model)
 const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
 await writeGoalBookRenderManifest(await writeGoalBookHtml(model,htmlPath,options),htmlPath+'.render-manifest.json')
 const pdf=await writeGoalBookPdf(model,pdfPath,options);await writeGoalBookRenderManifest(pdf,pdfPath+'.render-manifest.json');assert.equal(pdf.goalPageCount,1);assert.equal(pdf.physicalPageCount,3)
 const bundleDirectory=resolve(dir,'bundle'),bundle=await buildGoalBookReviewBundle(model,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:[word]})
 for(const f of bundle.files)write(resolve(bundleDirectory,f.relativePath),f.content)
 write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
 const artifact=(role:string)=>bundle.manifest.artifacts.find((a:any)=>a.role===role)!
 const campaigns=[]
 if(side==='after')for(const reviewer of ['a','b']){const outputDirectory=resolve(dir,'round-'+reviewer),round='bio-existing-word-basic2-context-20261008-independent-'+reviewer;await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory,campaignOptions:{campaignId:round+'-campaign',roundId:round,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:round,blindToOtherReviews:true,batchSize:20}});campaigns.push({reviewer,campaignPath:relative(root,resolve(outputDirectory,'description-review-campaign.json')),inputPath:relative(root,resolve(outputDirectory,'description-review-input.json')),actualResults:0})}
 frames.push({side,page:model.pages[0],actualPDF:bind(resolve(bundleDirectory,artifact('book_pdf').path)),physicalGoalPage:3,modelPath:relative(root,modelPath),bundlePath:relative(root,resolve(bundleDirectory,'review-bundle-manifest.json')),campaigns})
}
const b=frames[0].page,a=frames[1].page
assert.deepEqual(Object.fromEntries(Object.entries(b).filter(([k])=>!['externalReverseRequires','pageFingerprint'].includes(k))),Object.fromEntries(Object.entries(a).filter(([k])=>!['externalReverseRequires','pageFingerprint'].includes(k))))
assert.equal(a.externalReverseRequires.length,b.externalReverseRequires.length+1)
write(resolve(own,'neutral-existing-word-targeted-context.author.entry.json'),{schemaVersion:1,role:'Existing current strict word-goal needs one real targeted context review; original science/P/A/M/image remain KEEP',goalId:word,changedFields:['externalReverseRequires','pageFingerprint'],newExternalReverseRequires:a.externalReverseRequires.filter((r:any)=>!b.externalReverseRequires.some((q:any)=>q.goalId===r.goalId)),wholeFrames:frames,wholeExistingCanonicalBodyExact:true,ownCanonicalDContextExact:true,originalScienceAndImageApprovalNotReissued:true,originalImageUnchanged:bind(originalImage),realIndependentTargetedDAAndBStatus:'PENDING',humanApproval:false,humanTrial:false,newStrictClosures:0,activeWrites:0})
console.log(JSON.stringify({actualExistingWordContext:true,canonicalAndTextAndImageExact:true,realNewReverseReference:true,actualBeforeAfterPdfPhysicalPages:3,independentTargetedD:'PENDING',activeWrites:0}))
