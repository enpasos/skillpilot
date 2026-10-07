import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import {isAiApprovedForCurrentAsset} from '../../../../../../../../app/src/utils/goalVisualizationQaStatus.ts'
const root=process.cwd()
const base=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-independent-b-20261007-v1')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-author-v1')
const out=resolve(base,'native-final-followup')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const entry=read(resolve(author,'native-raster-candidate/twelve/final-native-twelve-neutral-review.entry.json'))
const manifest=read(resolve(root,entry.rootActualSelectedRasterAuthorHandoff.path))
const neutral=read(resolve(root,entry.selectedActualNativePageContext.path))
const before=new Map(read(resolve(author,'current20-whole-DEEN-goals.actual.json')).goals.map((g:any)=>[g.id,g]))
const full=new Map(neutral.wholeSelectedGoals.map((g:any)=>[g.id,g]))
const current=new Map(neutral.actualNativeInput.goals.map((g:any)=>[g.goalId,g]))
const proof=read(resolve(out,'twelve-final-raster-alt-provenance-and-native-PDF-independent-b.actual.json'))
const proofBy=new Map(proof.rows.map((g:any)=>[g.goalId,g]))
const science=new Map(read(resolve(base,'twelve-whole-DEEN-goal-and-case-science-first.independent-b.json')).judgments.map((g:any)=>[g.goalId,g]))
const records=readFileSync(resolve(out,'P12.current-actual-raster.independent-b.review.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const recordBy=new Map(records.map((g:any)=>[g.goalId,g]))
const authorCandidates=new Map(read(resolve(root,entry.operativeWholeP20AuthorCandidatesSourceRolesV3.path)).goals.map((g:any)=>[g.goalId,g]))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const approvals:any[]=[];const checked:any[]=[]
for(const m of manifest.images){
 const g:any=full.get(m.goalId),o:any=before.get(m.goalId),c:any=current.get(m.goalId),p:any=recordBy.get(m.goalId),pr:any=proofBy.get(m.goalId),s:any=science.get(m.goalId),ap:any=authorCandidates.get(m.goalId)
 const{resourceLinks:oldLinks,...oldScientific}=o;const{resourceLinks:newLinks,...newScientific}=g;assert.deepEqual(newScientific,oldScientific)
 assert.equal(c.currentTitleDe,g.title);assert.equal(c.currentTitleEn,g.titleEn);assert.equal(c.currentDescriptionDe,g.description);assert.equal(c.currentDescriptionEn,g.descriptionEn)
 const resources:Record<string,string>={};for(const l of newLinks){if(l.type!=='goal-visualization')continue;assert.equal(l.skillpilotId,g.id);assert.equal(l.altText,m.altDe);assert.equal(l.url,`/assets/goal-visualizations/biologie/${g.id}/${g.id}.png`);const actual=sha(readFileSync(resolve(root,m.path)));assert.equal(actual,'sha256:'+m.sha256);resources[l.url]=actual;assert.equal(c.reviewContext.page.visualization.originalDigest,actual);assert.equal(c.reviewContext.page.visualization.altText,m.altDe)}
 assert.ok(validator(p),ajv.errorsText(validator.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(p,g,resources,'curricularAtomic'),[])
 assert.equal(p.status,'needs_human_review');assert.equal(p.reviewAuthority,'ai_candidate');assert.equal(p.evidenceLevel,'E1');assert.equal(p.maximumClaimScope,'G1');assert.deepEqual(p.reviewRunIds,[])
 assert.deepEqual(p.profile,ap.profile);assert.deepEqual(p.dissent,ap.dissent)
 assert.equal(s.wholeGoalAndBothWholeCommonCasesScientificVerdict,'PASS');assert.equal(pr.wholeCurrentD_P_VContextVerdict,'PASS');assert.equal(pr.actualOwnFullAnd360And680Seen,true);assert.equal(pr.actualWholeNativePDFSeen,true)
 const qa={goalId:g.id,title:g.title,description:g.description,subject:'biologie',landscapeId:'08a43a1b-d97e-522c-9dfa-c950a493364e',landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',visualizationState:'available',missingReason:'',imageUrl:newLinks.find((l:any)=>l.type==='goal-visualization').url,publicAssetPath:`app/public/assets/goal-visualizations/biologie/${g.id}/${g.id}.png`,canonicalAssetPath:`curricula/DE/Gymnasium/visualizations/biologie/${g.id}/${g.id}.png`,assetSha256:'sha256:'+m.sha256,aiApproved:'yes',aiApprovedAssetSha256:'sha256:'+m.sha256,aiReviewedAt:new Date().toISOString(),aiReviewer:'independent-b-codex-gpt-6-runtime-exact-serving-revision-unavailable',aiNotes:pr.actualVisualAndScientificFinding+' '+pr.actualWidthFinding+' Beide ganzen Alttexte und ganzer nativer PDF-Kontext tatsächlich geprüft. Nur maschinelle QS; keine Human Approval.',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',humanReviewedAt:null,humanReviewer:''}
 assert.equal(isAiApprovedForCurrentAsset(qa),true);approvals.push(qa)
 checked.push({goalId:g.id,goalFingerprint:c.goalFingerprint,pageFingerprint:c.pageFingerprint,actualNativePDFPhysicalPage:pr.actualNativePhysicalPage,nativePositiveSchema:'PASS',nativePositiveSemantics:'PASS',nativeVCurrentAssetApproval:'PASS',wholePBodyAndHistoricalDissentsExact:true,truthfulE1G1NeedsHumanAiCandidateAndNoBlindExperimentRuns:true,actualFullRasterBothWidthsAltAndPDFSeen:true,profileFingerprint:p.profileFingerprint,reviewInputFingerprint:p.reviewInputFingerprint})
}
assert.equal(approvals.length,12);assert.equal(checked.length,12)
writeFileSync(resolve(out,'V12.actual-raster-independent-b.approvals.json'),JSON.stringify({schemaVersion:1,subject:'biologie',source:{canonicalRoot:'curricula/DE/Gymnasium/canonical',publicAssetRoot:'app/public/assets/goal-visualizations'},role:'Prospective canonical paths; actual independent current PNG/alt/native page review; not active integration',records:approvals},null,2)+'\n')
writeFileSync(resolve(out,'native-current-P12-V12-independent-b.actual.json'),JSON.stringify({artifactKind:'native-current-P12-V12-independent-b-function-check',status:'PASS',actualNativeFunctions:['validatePositiveGoalEvidenceRecordSemantics','isAiApprovedForCurrentAsset'],recordSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',rows:checked,actualNativeInputSha256:sha(readFileSync(resolve(root,entry.selectedActualNativePageContext.path))),actualPDFSha256:sha(readFileSync(resolve(root,entry.actualPDF.path))),PRecordsPath:relative(root,resolve(out,'P12.current-actual-raster.independent-b.review.jsonl')),wholeNativeProfileBodiesExactToOwnFirstScience:true,source13And14Resolution:relative(root,resolve(out,'source13-and14-targeted-finding-resolution.independent-b.actual.json')),actualBIndependentRole:'not material author or image author; science/visual-first sealed before peer judgment; no peer raw judgments read',allEightSourceHOLDsRemainExcluded:entry.excludedGoalIds,publicPCLI:'Root integration gate pending; candidate exact actual resource digest native schema/semantic functions passed',strictGainClaimed:0,humanApproval:false,humanTrial:false,realLearnerEvidence:false,activeWrites:0},null,2)+'\n')
console.log('PASS native P12 closed schema and semantics; actual independent current V12 SHA approval; whole scientific fields and P bodies unchanged')
