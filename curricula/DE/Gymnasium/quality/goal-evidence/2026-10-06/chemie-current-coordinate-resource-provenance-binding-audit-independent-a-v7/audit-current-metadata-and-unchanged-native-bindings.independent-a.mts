// SPDX-License-Identifier: Apache-2.0
// Independent targeted source-metadata audit; no new formal/scientific D round.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { stableGoalBookJson, parseAndValidateGoalBookModel, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..'),base=dirname(own)
const gid='363c5740-8a3c-50b8-8c3a-5548c80c36ea'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const digest=(v:any)=>'sha256:'+createHash('sha256').update(stableGoalBookJson(v)).digest('hex')
const bind=(p:string)=>({path:relative(root,p),sha256:sha(p),bytes:readFileSync(p).length})
const equal=(a:any,b:any)=>assert.equal(stableGoalBookJson(a),stableGoalBookJson(b))
const write=(name:string,v:any)=>writeFileSync(resolve(own,name),JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const author=resolve(base,'chemie-current-coordinate-provider-license-targeted-author-v7')
const authorFreeze=resolve(author,'coordinate-two-source-metadata-fields-author-v7.final.freeze.json')
assert.equal(sha(authorFreeze),'sha256:54939bf85930d3ec154714ed585b3cd28a0a7d1583152baf19e9b5b23a14462c')
const af=read(authorFreeze)
for(const r of af.files) assert.equal(sha(resolve(root,r.path)),r.sha256)
const raw=read(resolve(author,'raw-source-metadata-audit-input.author.json'))
assert.equal(raw.goalId,gid)
const inputBindings=Object.values(raw).filter((x:any)=>x&&typeof x==='object'&&x.path&&x.sha256) as Array<{path:string;sha256:string}>
for(const r of inputBindings) assert.equal(sha(resolve(root,r.path)),r.sha256)
const currentPath=resolve(root,raw.currentCanonical.path),current=read(currentPath)
const beforePath=resolve(base,'chemie-current-aromatic-delocalization-final-native-author-v6/prospective-current378.canonical.author-candidate.json'),before=read(beforePath)
const currentGoal=current.goals.find((g:any)=>g.id===gid),beforeGoal=before.goals.find((g:any)=>g.id===gid)
const reduced=structuredClone(current)
const reducedGoal=reduced.goals.find((g:any)=>g.id===gid)
reducedGoal.resourceLinks[0].provider=beforeGoal.resourceLinks[0].provider
reducedGoal.resourceLinks[0].license=beforeGoal.resourceLinks[0].license
equal(reduced,before)
assert.equal(currentGoal.resourceLinks.length,1)
assert.equal(currentGoal.resourceLinks[0].provider,'ChatGPT/Codex builtin image generation')
assert.equal(currentGoal.resourceLinks[0].license,'CC-BY-4.0')
const genPath=resolve(root,raw.actualGeneratorAndLicenseReceipt.path),gen=read(genPath)
const selected=gen.attempts.find((a:any)=>a.attempt===2)
assert.equal(gen.generator,'ChatGPT/Codex built-in image_gen; underlying generator model/version not reported')
const selectedRaster=resolve(root,selected.output.path),actualToolRaster=selected.toolOriginalPath
assert.equal(sha(selectedRaster),'sha256:7c2c562d42d59480f71def10d700fd45fd885e1622a515ac171aff74dd0b003e')
assert.equal(sha(actualToolRaster),sha(selectedRaster))
const licenseText=readFileSync(resolve(root,raw.actualLicensingAllocation.path),'utf8')
assert.ok(licenseText.includes('didactic images/diagrams/comics/audio'))
assert.ok(licenseText.includes('CC-BY-4.0'))
write('actual-provider-license-source-metadata-audit.independent-a.json',{
 schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'independent_source_metadata_auditor_a',goalId:gid,
 decision:'KEEP_CORRECTED_SOURCE_METADATA_CANDIDATE',recordStatus:'candidate',reviewAuthority:'ai_candidate',
 actualRawAuthorInputFreeze:bind(authorFreeze),actualRawCurrentCanonical:bind(currentPath),actualBeforeCanonical:bind(beforePath),
 beforeWholeGoal:beforeGoal,currentWholeGoal:currentGoal,onlyActualFieldDeltas:[{path:'resourceLinks/0/provider',before:beforeGoal.resourceLinks[0].provider,after:currentGoal.resourceLinks[0].provider},{path:'resourceLinks/0/license',before:beforeGoal.resourceLinks[0].license,after:currentGoal.resourceLinks[0].license}],
 allOtherWholeCanonicalPayloadBytesSemanticallyExact:true,all478OtherWholeGoalsExact:true,
 actualGeneratorReceipt:bind(genPath),actuallyRecordedGenerator:gen.generator,actualSelectedRaster:bind(selectedRaster),actualToolOriginalRaster:{path:actualToolRaster,sha256:sha(actualToolRaster),bytes:readFileSync(actualToolRaster).length},actualGeneratorOutputEqualsSelectedRaster:true,
 generatorModelVersionInvented:false,actualLicenseAllocation:bind(resolve(root,raw.actualLicensingAllocation.path)),actualLicenseText:bind(resolve(root,'LICENSES/CC-BY-4.0.txt')),
 rationaleDe:'Der vorhandene tatsächliche builtin image_gen-Originaloutput ist bytegleich mit dem ausgewählten versiegelten v4-PNG. Die neue Anbieterangabe benennt diesen tatsächlichen Generator und erfindet keine Modellversion; die alte Google/Nano-Angabe war falsch. CC-BY-4.0 entspricht der verbindlichen aktuellen Allokation für eigene didaktische Medien. Das alte AI-generated/SkillPilot-curated ist eine Provenienzangabe, keine Lizenz. Ausschließlich diese beiden Metadatenfelder sind geändert; keine neue wissenschaftliche Prüfung oder Rechte-/Human-Freigabe wird daraus abgeleitet.',
 rationaleEn:'The actual existing built-in image_gen original output is byte-identical to the selected sealed v4 PNG. The corrected provider identifies that actual generator without inventing a model version; the old Google/Nano attribution was wrong. CC-BY-4.0 matches the binding current allocation for own didactic media. AI-generated/SkillPilot-curated is provenance rather than a license. Only those two metadata fields changed; no new scientific, third-party-rights or human approval is inferred.',
 previousOwnV5ScienceKeepPreserved:true,newIndependentDReviewRounds:0,newCurrentPeerAuditOutputsRead:false,imageGeneration:false,activeWrites:0,humanApproval:false,humanTrial:false
})

const fullCurrentPath=resolve(root,raw.currentPureFullModel.path),fullCurrent=parseAndValidateGoalBookModel(read(fullCurrentPath))
const fullBeforePath=resolve(base,'chemie-current-aromatic-delocalization-final-native-author-v6/qa-artifacts/full-prospective378.book-model.json'),fullBefore=parseAndValidateGoalBookModel(read(fullBeforePath))
assert.equal(fullCurrent.pages.length,378);equal(fullCurrent.pages,fullBefore.pages)
assert.notEqual(fullCurrent.digest,fullBefore.digest)
assert.equal(fullCurrent.source.landscapeDigest,digest(current))
assert.notEqual(fullCurrent.source.landscapeDigest,fullBefore.source.landscapeDigest)
const syn=resolve(base,'chemie-current-fifteen-description-native-reviewed-integration-v1')
const synFreeze=resolve(syn,'current-fifteen-description-native-reviewed-integration-v1.final.freeze.json')
assert.equal(sha(synFreeze),'sha256:e68c05da39d50f5c3c774b345cb4c76e9cd3497fd7ba232d4cee6fe5247f29fe')
for(const r of read(synFreeze).files) assert.equal(sha(resolve(root,r.path)),r.sha256)
const group=resolve(syn,'native-coordinate-single')
const config=read(resolve(root,read(resolve(group,'batch-manifest.json')).configPath))
const currentSubset=buildGoalDescriptionRolloutSubsetModel({baseModel:fullCurrent,goalIds:config.goalIds,bookId:config.bookId,title:config.title})
const previousNative=parseAndValidateGoalBookModel(read(resolve(group,'bundle/book-model.json')))
equal(currentSubset.pages,previousNative.pages)
const oldA=read(resolve(root,raw.existingAInput.path)),oldB=read(resolve(root,raw.existingBInput.path));equal(oldA,oldB)
const priorGoal=oldA.goals[0]
const currentPage=currentSubset.pages[0]
const currentInputGoal={goalId:gid,goalFingerprint:currentPage.goalFingerprint,pageFingerprint:currentPage.pageFingerprint,currentTitleDe:currentGoal.title,currentTitleEn:currentGoal.titleEn,currentDescriptionDe:currentGoal.description,currentDescriptionEn:currentGoal.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(currentGoal),reviewContext:{page:currentPage,evidenceProfile:priorGoal.reviewContext.evidenceProfile}}
equal(currentInputGoal,priorGoal)
const currentGF=fingerprintGoalForEvidence(currentGoal,GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,'curricularAtomic')
assert.equal(currentGF,priorGoal.goalFingerprint)
const currentCF=fingerprintGoalDescriptionReviewContext(currentInputGoal)
const index=read(resolve(group,'resolution-index.json'));assert.equal(index.resolutions.length,1)
const res=read(resolve(group,index.resolutions[0].resolutionPath))
assert.equal(res.goal.goalFingerprint,currentGF);assert.equal(res.goal.pageFingerprint,currentPage.pageFingerprint);assert.equal(res.goal.goalReviewContextFingerprint,currentCF)
const oldOwnFreeze=resolve(base,'chemie-current-four-and-coordinate-native-d-blind-independent-a-v5/coordinate.final.freeze.json')
assert.equal(sha(oldOwnFreeze),'sha256:7c8c191a5d8dcc79ff3a0c43caa525c75642e7c1a06fd64e4f1163ba8ff1e33e')
for(const r of read(oldOwnFreeze).files) assert.equal(sha(resolve(root,r.path)),r.sha256)
const oldOwnRecords=resolve(base,'chemie-current-four-and-coordinate-native-d-blind-independent-a-v5/coordinate/round-a/results/chemie-current-coordinate-single-targeted-20261006-author-v5-first-pass-a.batch-001.records.jsonl')
const oldOwnRecord=JSON.parse(readFileSync(oldOwnRecords,'utf8').trim())
assert.equal(oldOwnRecord.decision,'keep');assert.equal(oldOwnRecord.goalFingerprint,currentGF);assert.equal(oldOwnRecord.pageFingerprint,currentPage.pageFingerprint)
const htmlPath=resolve(root,raw.existingRealHTML.path),pdfPath=resolve(root,raw.existingRealPDF.path)
const htmlManifest=read(resolve(group,'bundle/book.html.render-manifest.json')),pdfManifest=read(resolve(group,'bundle/book.pdf.render-manifest.json'))
const htmlAsset=htmlManifest.assets.find((a:any)=>a.publicPath===currentPage.visualization!.url),pdfAsset=pdfManifest.assets.find((a:any)=>a.publicPath===currentPage.visualization!.url)
assert.equal(htmlAsset.sourceSha256,sha(selectedRaster));assert.equal(pdfAsset.sourceSha256,sha(selectedRaster));assert.equal(currentPage.visualization!.originalDigest,sha(selectedRaster))
const html=readFileSync(htmlPath,'utf8')
const oldContinuity=read(resolve(syn,'actual-current15-whole-goal-page-context-source-raster-continuity.json')).rows.find((r:any)=>r.goalId===gid)
const actualHTMLImageSources=[...html.matchAll(/<img\s+src="([^"]+)"/g)].map(m=>m[1])
assert.ok(actualHTMLImageSources.includes(currentPage.visualization!.url))
const actualReviewedHTMLRaster=resolve(root,oldContinuity.actualRaster.originalResourcePath)
assert.equal(sha(actualReviewedHTMLRaster),sha(selectedRaster))
const authorRawEquality=read(resolve(root,raw.actualNativeEqualityProof.path))
equal(oldContinuity.actualCurrentSourceWitnesses,authorRawEquality.actualCurrentSourceWitnesses)
write('actual-unchanged-native-D-page-context-raster-reuse.independent-a.json',{
 schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'independent_source_metadata_binding_audit_a',goalId:gid,decision:'REUSE_EXISTING_EXACT_NATIVE_D_SCIENCE_KEEP_AND_INDEX',recordStatus:'candidate',reviewAuthority:'ai_candidate',
 actualCurrentFullModel:bind(fullCurrentPath),actualBeforeFullModel:bind(fullBeforePath),actualCurrentFullBookDigest:fullCurrent.digest,actualBeforeFullBookDigest:fullBefore.digest,sourceLandscapeDigestTruthfullyChanged:true,globalBookDigestTruthfullyChanged:true,all378WholeFullPagesExact:true,
 currentWholeFullPage:fullCurrent.pages.find(p=>p.goalId===gid),currentWholeNativeSubsetPage:currentPage,currentWholeDInputGoal:currentInputGoal,currentGoalFingerprint:currentGF,currentPageFingerprint:currentPage.pageFingerprint,currentReviewContextFingerprint:currentCF,
 currentGoalPageContextFullInputExactlyEqualPreviouslyReviewed:true,previousOwnV5ScienceKeep:{records:bind(oldOwnRecords),recordId:oldOwnRecord.recordId,decision:oldOwnRecord.decision,scienceRechecked:false},previousOwnV5ScienceFreeze:bind(oldOwnFreeze),unchangedFinalD15SynthesisFreeze:bind(synFreeze),unchangedNativeD1ResolutionIndex:bind(resolve(group,'resolution-index.json')),unchangedNativeD1Resolution:bind(resolve(group,index.resolutions[0].resolutionPath)),
 actualUnchangedNativeHTML:bind(htmlPath),actualUnchangedNativePDF:bind(pdfPath),actualHTMLRenderAssetManifest:htmlAsset,actualPDFRenderAssetManifest:pdfAsset,actualHTMLImageSources,actualHTMLPublicImageSourceMatchesCorrectResource:true,actualExistingReviewedHTMLRaster:{path:actualReviewedHTMLRaster,sha256:sha(actualReviewedHTMLRaster),bytes:readFileSync(actualReviewedHTMLRaster).length},exactSourceRasterBinding:bind(selectedRaster),
 individualProviderAndLicenseAreSourceMetadataNotVisibleNativeDPageFields:true,noNewVisibleAttributionInvented:true,actualNativeHTMLContainsWrongGoogleNanoAttribution:html.includes('Google Gemini')||html.includes('Nano Banana'),actualNativeHTMLContainsNewPerAssetGeneratorAttribution:html.includes('builtin image generation')||html.includes('image_gen'),
 actualCurrentSourceWitnesses:authorRawEquality.actualCurrentSourceWitnesses,sourceWitnessesExactPreviouslyBound:true,boundedPrimarySourceScopePreserved:oldContinuity.boundedExistingPrimarySourceScope,wholeNationalOrGKCoverageApproval:false,
 newlyCreatedDScienceCampaigns:0,newDRecordRunOrIndexCreated:false,existingRecordsRunsIndicesRelabelled:false,newGoalOrPageOrContextFingerprintUpdateClaimed:false,newScientificClosures:0,imageGeneration:false,newCurrentPeerAuditOutputsRead:false,activeWrites:0,humanApproval:false,humanTrial:false
})
for(const r of af.files) assert.equal(sha(resolve(root,r.path)),r.sha256)
for(const r of read(synFreeze).files) assert.equal(sha(resolve(root,r.path)),r.sha256)
console.log(JSON.stringify({sourceMetadataAudit:'PASS_provider_and_CC_BY_4_0_against_actual_generator_output_and_policy',onlySourceMetadataFieldsChanged:2,nativeWholeDGoalPageContextInputExact:true,all378FullPagesExact:true,rasterSHA256:sha(selectedRaster),existingDIndexExactReuse:true,newFormalDReviewRounds:0,newFPBindings:0,activeWrites:0}))
