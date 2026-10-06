// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {fingerprintGoalForEvidence} from '../../../../../../../app/scripts/goalEvidenceProfileModel.ts'
import {fingerprintSemanticKindSourceGoal,parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel.ts'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-q1-he-terminal-applicability-metadata-independent-b-v5'
const dReview=base+'chemie-q1-current378-routes-independent-description-b-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const raw=read(own+'/native-physical-isolate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const byId=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const ledger=read(own+'/inputs/semantic-kinds.v4-retained.json')
assert.equal(sha(own+'/inputs/semantic-kinds.v4-retained.json'),'d16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54')
const kinds=new Map<string,string>(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const task='4cb74d76-99f1-5264-b1e3-448cda47b005'
const classification=ledger.decisions.find((d:any)=>d.goalId===task)
assert.equal(fingerprintSemanticKindSourceGoal(byId.get(task)),classification.sourceFingerprint)
const v4=parseAndValidateGoalBookModel(read(own+'/inputs/full-current378-v4.book-model.json'))
const v5=parseAndValidateGoalBookModel(read(own+'/inputs/full-current378-v5.book-model.json'))
assert.equal(v5.pages.length,378);assert.deepEqual(v5.pages,v4.pages)
const atlas4=parseAndValidateGoalBookModel(read(own+'/inputs/source-atlas359-v4.book-model.json'))
const atlas5=parseAndValidateGoalBookModel(read(own+'/inputs/source-atlas359-v5.book-model.json'))
assert.equal(atlas5.pages.length,359);assert.deepEqual(atlas5.pages,atlas4.pages)
const bindings:any[]=[];const subsets:any[]=[]
for(let i=1;i<=3;i++){
 const n=String(i).padStart(3,'0');const input=read(dReview+'/inputs/batch-'+n+'/round-b/description-review-input.json')
 const old=parseAndValidateGoalBookModel(read(dReview+'/inputs/batch-'+n+'/bundle/book-model.json'))
 const fresh=buildGoalDescriptionRolloutSubsetModel({baseModel:v5,goalIds:input.goals.map((g:any)=>g.goalId),bookId:old.book.id,title:old.book.title})
 assert.deepEqual(fresh.pages,old.pages)
 for(const g of input.goals){
  const current=byId.get(g.goalId);assert(current)
  const page=fresh.pages.find(p=>p.goalId===g.goalId);assert(page)
  assert.deepEqual(buildGoalDescriptionCanonicalContext(current),g.canonicalContext)
  assert.equal(fingerprintGoalForEvidence(current,'goal-evidence-v1',kinds.get(g.goalId)),g.goalFingerprint)
  assert.equal(fingerprintGoalDescriptionReviewPage(page),g.pageFingerprint)
  assert.deepEqual(g.reviewContext.page,page)
  assert.equal(g.currentTitleDe,current.title);assert.equal(g.currentTitleEn,current.titleEn)
  assert.equal(g.currentDescriptionDe,current.description);assert.equal(g.currentDescriptionEn,current.descriptionEn)
  const recomputed={...g,canonicalContext:buildGoalDescriptionCanonicalContext(current),reviewContext:{...g.reviewContext,page}}
  assert.deepEqual(recomputed,g)
  assert.equal(fingerprintGoalDescriptionReviewContext(recomputed),fingerprintGoalDescriptionReviewContext(g))
  bindings.push({goalId:g.goalId,batch:n,wholeInputGoalExact:true,canonicalContextExact:true,bilingualTextExact:true,goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,reviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),wholeNativePageExact:true})
 }
 subsets.push({batch:n,goalCount:input.goals.length,allPagesExact:true,preservedV4Digest:old.digest,currentV5OuterDigest:fresh.digest,outerDigestOnlyChanged:old.digest!==fresh.digest})
}
assert.equal(bindings.length,53)
assert.equal(new Set(bindings.map(g=>g.goalId)).size,53)
const compilerPath=resolve(own,'native-physical-isolate/app/scripts/applicabilityCompiler.ts')
assert.equal(sha(compilerPath),sha('app/scripts/applicabilityCompiler.ts'))
const compiler=await import(pathToFileURL(compilerPath).href)
const report=compiler.buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId===raw.landscapeId);assert(report)
assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0)
const prior=read(own+'/inputs/own-v4-native-applicability.actual.json')
const scope4=new Map(prior.allCompiledGoalRows.map((g:any)=>[g.goalId,g.compiledApplicability]))
assert.equal(report.goals.length,479)
for(const g of report.goals)assert.deepEqual(g.compiledApplicability,scope4.get(g.goalId))
const by4=prior.allCompiledGoalRows.filter((g:any)=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map((g:any)=>g.goalId).sort()
const by5=report.goals.filter((g:any)=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map((g:any)=>g.goalId).sort()
assert.equal(by5.length,473);assert.deepEqual(by5,by4)
const ids=[task,'0d59b62e-d3f9-5969-b961-0c5e26316c04','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','d3cd250f-5221-589d-aa1c-44a4692d1acb','171b47e2-2c53-50f2-a145-a26b896fd73f']
const selected=report.goals.filter((g:any)=>ids.includes(g.goalId));assert.equal(selected.length,6)
for(const g of selected){assert.deepEqual(g.compiledApplicability.jurisdiction,['DE-HE']);assert(!g.evidence.some((e:any)=>e.value==='DE-BY'))}
const receipt={reviewer:'independent-b',createdAtUTC:new Date().toISOString(),rawVerdict:'keep',all53NativeCurrentBindingFieldsExact:true,batches:subsets,bindings,full378WholePagesExact:true,atlas359WholePagesExact:true,classificationLedgerSHA256:sha(own+'/inputs/semantic-kinds.v4-retained.json'),taskClassificationFingerprintExact:classification.sourceFingerprint,compilerSHA256:sha(compilerPath),nativeSummary:report.summary,all479CompiledApplicabilityMapsExact:true,rawBY473Exact:true,rawBYGoalIds:by5,selectedHEOnly:selected,nativeFindings:report.findings,preservedNativeDRecordsRewritten:false,reviewRestartRequired:false,newScientificPOrVApproval:false,humanApproval:false,humanTrial:false,activeWrites:false,fullCQRRun:false}
writeFileSync(own+'/results/current-bindings-and-native-scope.actual.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({rawVerdict:'keep',all53BindingsExact:true,full378PagesExact:true,atlas359PagesExact:true,all479ScopesExact:true,BY473Exact:true,errors:0,warnings:0,selectedHEOnly:6,preservedDRecords:true}))
