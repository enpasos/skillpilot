import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { isAiApprovedForCurrentAsset } from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts'
const root='/home/enpasos/projects/skillpilot'
const base=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cellcycle-evolution-two-current391-independent-b-20261007-v1')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cellcycle-evolution-two-current391-author-v1')
const out=resolve(base,'native-final-followup')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(bytes:Buffer|string)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const stable=(x:any):string=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v)
const manifest=read(resolve(base,'visual-followup/selected-two-raster-inputs.neutral.exact.json'))
const neutral=read(resolve(out,'current-neutral-full-input.json'))
const before=read(resolve(base,'neutral-inputs/current-two-whole-DEEN-goals.exact.json'))
const beforeBy=new Map(before.goals.map((g:any)=>[g.id,g]))
const nativeGoalBy=new Map(neutral.actualNativeInput.goals.map((g:any)=>[g.goalId,g]))
const physicalBy=new Map(neutral.physicalGoalPages.map((p:any)=>[p.goalId,p.physicalPage]))
const science=read(resolve(base,'whole-two-D-P-source.independent-b.science-first.json'))
const scienceBy=new Map(science.verdicts.map((g:any)=>[g.goalId,g]))
const visual=read(resolve(base,'visual-followup/first-actual-V2.independent-b.findings.json'))
const visualBy=new Map(visual.findings.map((g:any)=>[g.goalId,g]))
const fullGoalBy=new Map(neutral.wholeSelectedGoals.map((g:any)=>[g.id,g]))
const records=readFileSync(resolve(out,'P2.current-actual-raster.independent-b.review.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const recordBy=new Map(records.map((g:any)=>[g.goalId,g]))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const approvals:any[]=[];const checked:any[]=[]
for(const selected of manifest.images){
 const goal:any=fullGoalBy.get(selected.goalId),old:any=beforeBy.get(selected.goalId),current:any=nativeGoalBy.get(selected.goalId),record:any=recordBy.get(selected.goalId),scienceRow:any=scienceBy.get(selected.goalId),visualRow:any=visualBy.get(selected.goalId)
 const {resourceLinks:oldLinks,...oldScientific}=old
 const {resourceLinks:newLinks,...newScientific}=goal
 assert.deepEqual(newScientific,oldScientific,'No unreviewed scientific goal changes')
 assert.equal(current.currentTitleDe,goal.title);assert.equal(current.currentTitleEn,goal.titleEn)
 assert.equal(current.currentDescriptionDe,goal.description);assert.equal(current.currentDescriptionEn,goal.descriptionEn)
 const resources:Record<string,string>={}
 for(const link of newLinks){
  if(link.type!=='goal-visualization')continue
  assert.equal(link.skillpilotId,goal.id)
  assert.equal(link.url,`/assets/goal-visualizations/biologie/${goal.id}/${goal.id}.png`)
  assert.equal(link.altText,selected.altDe)
  const actual=sha(readFileSync(resolve(root,selected.path)));assert.equal(actual,'sha256:'+selected.sha256)
  resources[link.url]=actual
  assert.equal(current.reviewContext.page.visualization.originalDigest,actual)
  assert.equal(current.reviewContext.page.visualization.altText,selected.altDe)
 }
 assert.ok(validator(record),ajv.errorsText(validator.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[])
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
 assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');assert.deepEqual(record.reviewRunIds,[])
 assert.equal(scienceRow.PDecision,'PASS')
 assert.equal(visualRow.decision,'ai_approved');const inspections=visual.actualInspections.filter((x:any)=>x.goalId===goal.id);assert.equal(inspections.length,3);assert.ok(inspections.every((x:any)=>x.actuallyViewed===true));assert.deepEqual(inspections.filter((x:any)=>x.kind==='actual-browser-capture').map((x:any)=>x.width),[360,680])
 const qa={goalId:goal.id,title:goal.title,description:goal.description,subject:'biologie',landscapeId:'08a43a1b-d97e-522c-9dfa-c950a493364e',landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',visualizationState:'available',missingReason:'',imageUrl:newLinks.find((l:any)=>l.type==='goal-visualization').url,publicAssetPath:`app/public/assets/goal-visualizations/biologie/${goal.id}/${goal.id}.png`,canonicalAssetPath:`curricula/DE/Gymnasium/visualizations/biologie/${goal.id}/${goal.id}.png`,assetSha256:'sha256:'+selected.sha256,aiApproved:'yes',aiApprovedAssetSha256:'sha256:'+selected.sha256,aiReviewedAt:new Date().toISOString(),aiReviewer:'independent-b-codex-gpt-6-runtime-exact-serving-revision-unavailable',aiNotes:visualRow.scientificFinding+' '+visualRow.legibilityFinding+' '+visualRow.altTextFinding+' Ganzer nativer PDF-Seitenkontext ebenfalls tatsächlich gesichtet; maschinelle Prüfung, keine Human Approval.',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',humanReviewedAt:null,humanReviewer:''}
 assert.equal(isAiApprovedForCurrentAsset(qa),true)
 approvals.push(qa)
 checked.push({goalId:goal.id,goalFingerprint:current.goalFingerprint,pageFingerprint:current.pageFingerprint,actualNativePDFPhysicalPage:physicalBy.get(goal.id),wholeScientificFieldsExactToOwnFirstReview:true,nativePositiveSchema:'PASS',nativePositiveSemantics:'PASS',nativeVCurrentAssetApproval:'PASS',actualOriginalAndBothBrowserViewsSeen:true,actualPDFPageSeen:true,profileFingerprint:record.profileFingerprint,reviewInputFingerprint:record.reviewInputFingerprint})
}
assert.equal(checked.length,2);assert.equal(approvals.length,2)
writeFileSync(resolve(out,'V2.actual-raster-independent-b.approvals.json'),JSON.stringify({schemaVersion:1,subject:'biologie',source:{canonicalRoot:'curricula/DE/Gymnasium/canonical',publicAssetRoot:'app/public/assets/goal-visualizations'},role:'Prospective canonical paths; actual independent current PNG and native page review, not yet active integration',records:approvals},null,2)+'\n')
writeFileSync(resolve(out,'native-current-P2-V2-independent-b.actual.json'),JSON.stringify({actualNativeFunctions:['validatePositiveGoalEvidenceRecordSemantics','isAiApprovedForCurrentAsset'],recordSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',status:'PASS',rows:checked,fullNativeInputSha256:sha(readFileSync(resolve(out,'current-neutral-full-input.json'))),actualPDFSha256:sha(readFileSync(resolve(out,'book.pdf'))),PRecordsPath:relative(root,resolve(out,'P2.current-actual-raster.independent-b.review.jsonl')),unchangedFullPBodyToOwnFirstScience:true,scientificReviewLineage:'independent B own first science + own first actual V before peer result access + actual native PDF pages',realLearnerEvidence:false,humanApproval:false,humanTrial:false,strictGainClaimed:0,publicPCLI:'pending Root approved integration; current candidate exact actual resource digest semantics checked'},null,2)+'\n')
console.log('PASS: native P2 closed schema/semantics and actual current V2 SHA approvals; original scientific goal fields exactly retained')
