// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync,copyFileSync,existsSync,lstatSync,unlinkSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {chromium} from '../../../../../../../app/node_modules/playwright/index.mjs'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import {buildGoalDescriptionReviewInput,buildGoalDescriptionReviewCampaign,serializeGoalDescriptionReviewBatchInput,loadGoalDescriptionReviewRecordSchemaBytes,validateGoalDescriptionReviewCampaign,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes,writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'

const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.'),out=resolve(own,'native-d-one')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});const bytes=Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n';if(existsSync(p)){assert.equal(sha(readFileSync(p)),sha(bytes),'Existing native input remains exact');return}writeFileSync(p,bytes,{flag:'wx'})}
const model=read(resolve(own,'native-full391.after-terminal.book-model.json')),target='11675f1a-5de2-5926-be78-1e8275f19f5b'
const landscape=read(resolve(own,'candidate/canonical.current474-bylk-terminal.inactive.json'))
const assessment=read(resolve(own,'bounded-bylk-terminal.whole-goal.candidate.json'))
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:[target],bookId:'biologie-11675-targeted-bylk-terminal-context-20261007-v1',title:'Biologie: begrenzte ENG/EKG-Modelle – gezielte aktuelle Terminalbindung'})
const image=subset.pages[0].visualization;assert.ok(image)
const alias=resolve(out,'public',image.url.replace(/^\//u,'')),canonicalImage=resolve(root,`curricula/DE/Gymnasium/visualizations/biologie/${target}/${target}.png`)
mkdirSync(dirname(alias),{recursive:true});if(existsSync(alias)&&lstatSync(alias).isSymbolicLink())unlinkSync(alias);if(!existsSync(alias))copyFileSync(canonicalImage,alias)
const publicImage=resolve(root,'app/public',image.url.replace(/^\//u,''));assert.equal(sha(readFileSync(alias)),sha(readFileSync(publicImage)))
const modelPath=resolve(out,'book-model.json'),htmlPath=resolve(out,'book.html'),pdfPath=resolve(out,'book.pdf')
write(modelPath,subset)
const options={publicRoot:resolve(out,'public'),feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'bounded-atlas' as const}
if(!existsSync(htmlPath+'.render-manifest.json'))await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
if(!existsSync(pdfPath+'.render-manifest.json'))await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDir=resolve(out,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDir,
promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:[target]})
for(const file of bundle.files)write(resolve(bundleDir,file.relativePath),file.content)
write(resolve(bundleDir,'review-bundle-manifest.json'),bundle.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDir)
const input=buildGoalDescriptionReviewInput({bundle:bundle.manifest,reviewInput:bundle.input,landscape}),schema=await loadGoalDescriptionReviewRecordSchemaBytes()
for(const side of ['a','b']){
 const campaignDir=resolve(out,'round-'+side),campaign=buildGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaignId:`biologie-11675-terminal-route-campaign-${side}-20261007-v1`,roundId:`biologie-11675-terminal-route-independent-${side}-20261007-v1`,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:`biologie-11675-terminal-route-independent-${side}-20261007-v1`,blindToOtherReviews:true,recordSchemaDigest:sha(schema),batchSize:1})
 const checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign});assert.deepEqual(checked.errors,[])
 write(resolve(campaignDir,'review-bundle-manifest.json'),bundle.manifest);write(resolve(campaignDir,'description-review-input.json'),input);write(resolve(campaignDir,'description-review-campaign.json'),campaign);write(resolve(campaignDir,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schema)
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:bundle.manifest,campaignDirectory:campaignDir,verifiedArtifactBytes:verified})
 for(const batch of campaign.batches){const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.manifest.bundleFingerprint,bookDigest:bundle.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals});const path=resolve(campaignDir,'batches',batch.batchId+'.input.jsonl');write(path,bytes);assert.equal(sha(readFileSync(path)),batch.batchInputFingerprint)}
}
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
const casePairs=read(resolve(own,'reused-reviewed-two-whole-bilingual-cases.exact.json'))
const auditHtml='<!doctype html><html lang="de"><meta charset="utf-8"><title>Inaktiver BY-LK-Prüfungskandidat</title><style>@page{size:A4;margin:18mm}body{font:12px Arial,sans-serif;line-height:1.45;color:#102030}h1{font-size:20px}h2{font-size:15px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.newpage{break-before:page}</style><body><h1>Inaktiver BY-LK-ENG/EKG-Prüfungskandidat</h1><p>Nur maschineller Autor-Kandidat; examData.reviewStatus=needs_review. Zwei unabhängige Maschinenprüfungen stehen aus. Keine menschliche Freigabe, Erprobung oder Leistung behauptet.</p><h2>Vollständiges aktuelles neues Übungsziel</h2><pre>'+escape(JSON.stringify({...assessment,examData:{...assessment.examData,taskContent:'siehe unten vollständig',solutionContent:'siehe unten vollständig'}},null,2))+'</pre><h2 class="newpage">Vollständige Aufgabe und Materialien</h2><pre>'+escape(assessment.examData.taskContent)+'</pre><h2 class="newpage">Vollständige Modelllösung und Bewertungsraster</h2><pre>'+escape(assessment.examData.solutionContent)+'</pre><h2 class="newpage">Unverändert wiederverwendete ganze bilinguale Fallbriefs</h2><pre>'+escape(JSON.stringify(casePairs.cases,null,2))+'</pre></body></html>'
const auditPath=resolve(own,'whole-assessment-author-audit.html');write(auditPath,auditHtml)
const browser=await chromium.launch({headless:true});try{const page=await browser.newPage();await page.setContent(auditHtml,{waitUntil:'load'});await page.pdf({path:resolve(own,'whole-assessment-author-audit.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true})}finally{await browser.close()}
write(resolve(own,'neutral-current-one-page-and-whole-endpoint-review-input.json'),{
 status:'inactive author candidate; two actual independent endpoint and changed context reviews required',newEndpointWholeGoal:assessment,
 unchangedWholeTarget:landscape.goals.find((g:any)=>g.id===target),actualNativeDInput:relative(root,resolve(out,'round-a/description-review-input.json')),
 actualNativePDF:relative(root,pdfPath),physicalGoalPage:3,
 wholeNewAssessmentAuditPDF:relative(root,resolve(own,'whole-assessment-author-audit.pdf')),
 wholeNewAssessmentAuditHTML:relative(root,auditPath),exactWholeBilingualCases:relative(root,resolve(own,'reused-reviewed-two-whole-bilingual-cases.exact.json')),
 authorTechnicalProbe:'native-current-and-candidate-route-scopes.actual.json',sourceAndPageFootprint:'exact-one-reverse-context-and-other390-binding-guards.actual.json',
 nativeIndependentCampaigns:['native-d-one/round-a','native-d-one/round-b'],
 peerReviewVerdictsIncluded:false,actualImageChanged:false,targetOwnPChanged:false,targetOwnDescriptionChanged:false,
 machineExamReleasePending:true,humanApproval:false,humanTrial:false,activeWrites:0,newStrictClosuresClaimed:0})
console.log(JSON.stringify({actualNativeGoalBookPages:1,changedTargetContext:target,blindCampaigns:2,wholeEndpointAuthorAuditPDF:'whole-assessment-author-audit.pdf',currentAssessmentReviewStatus:'needs_review',activeWrites:0}))
