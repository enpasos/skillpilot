import assert from 'node:assert/strict'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { resolve,dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { buildApplicabilityCompilation } from '../../../../../../../app/scripts/applicabilityCompiler.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { fingerprintSemanticKindSourceGoal,stableGoalBookJson,parseAndValidateGoalBookModel } from '../../../../../../../app/scripts/goalBookModel.ts'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'

const root='/home/enpasos/projects/skillpilot'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-final53-v5-metadata-binding-guard-v1'
const prior='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(name:string,obj:any)=>{const path=resolve(own,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(obj,null,2)+'\n')}
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const ledgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert.equal(createHash('sha256').update(readFileSync(ledgerPath)).digest('hex'),'d16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54')
const ledger=read(ledgerPath);const rawById=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));const kind=new Map<string,string>(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const taskId='4cb74d76-99f1-5264-b1e3-448cda47b005';const d=ledger.decisions.find((d:any)=>d.goalId===taskId)
assert.equal(fingerprintSemanticKindSourceGoal(rawById.get(taskId)),d.sourceFingerprint)
const v5Full=parseAndValidateGoalBookModel(read(own+'/native-models/full-current378-v5.book-model.json'))
const v4Full=parseAndValidateGoalBookModel(read(resolve(root,prior,'native-models/full-current378-final-v4.book-model.json')))
assert.equal(v5Full.pages.length,378);assert.deepEqual(v5Full.pages,v4Full.pages)
const v5Atlas=parseAndValidateGoalBookModel(read(own+'/native-models/source-atlas359-v5.book-model.json'))
const v4Atlas=parseAndValidateGoalBookModel(read(resolve(root,prior,'native-models/source-atlas359-final-v4.book-model.json')))
assert.equal(v5Atlas.pages.length,359);assert.deepEqual(v5Atlas.pages,v4Atlas.pages)
const rows:any[]=[];const batches:any[]=[]
for(let n=1;n<=3;n++){
 const number=String(n).padStart(3,'0');const config=read(resolve(root,prior,'batch-configs/batch-'+number+'.config.json'))
 const folder=resolve(root,prior,'native-current-d-batches/batch-'+number)
 const originalModel=parseAndValidateGoalBookModel(read(folder+'/bundle/book-model.json'))
 const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:v5Full,goalIds:config.goalIds,bookId:config.bookId,title:config.title})
 assert.deepEqual(subset.pages,originalModel.pages)
 write('actual-v5-recomputed-subsets/batch-'+number+'.book-model.json',subset)
 const first=read(folder+'/round-a/description-review-input.json');const second=read(folder+'/round-b/description-review-input.json');assert.deepEqual(first,second)
 for(const goal of first.goals){
  const canonical=rawById.get(goal.goalId);assert(canonical)
  const page=subset.pages.find(p=>p.goalId===goal.goalId);assert(page)
  assert.deepEqual(goal.canonicalContext,buildGoalDescriptionCanonicalContext(canonical))
  assert.equal(goal.goalFingerprint,fingerprintGoalForEvidence(canonical,'goal-evidence-v1',kind.get(goal.goalId)))
  assert.equal(goal.pageFingerprint,page.pageFingerprint)
  assert.equal(fingerprintGoalDescriptionReviewPage(page),goal.pageFingerprint)
  assert.deepEqual(goal.reviewContext.page,page)
  assert.equal(goal.currentTitleDe,canonical.title);assert.equal(goal.currentTitleEn,canonical.titleEn)
  assert.equal(goal.currentDescriptionDe,canonical.description);assert.equal(goal.currentDescriptionEn,canonical.descriptionEn)
  const recomputed={...goal,canonicalContext:buildGoalDescriptionCanonicalContext(canonical),reviewContext:{...goal.reviewContext,page}}
  assert.deepEqual(recomputed,goal)
  assert.equal(fingerprintGoalDescriptionReviewContext(recomputed),fingerprintGoalDescriptionReviewContext(goal))
  rows.push({goalId:goal.goalId,batchNumber:n,canonicalContextExact:true,goalFingerprintExact:true,pageFingerprintExact:true,wholeSubsetPageExact:true,bilingualTextExact:true,wholeInputGoalExact:true,reviewContextFingerprintBefore:fingerprintGoalDescriptionReviewContext(goal),reviewContextFingerprintAfter:fingerprintGoalDescriptionReviewContext(recomputed),goalFingerprint:goal.goalFingerprint,pageFingerprint:goal.pageFingerprint,effectiveSemanticKind:kind.get(goal.goalId)})
 }
 batches.push({batchNumber:n,goalCount:subset.pages.length,priorV4PreparedModelDigest:originalModel.digest,recomputedV5ModelDigest:subset.digest,allPageObjectsExact:true,preparedV4InputsModified:false,outerModelDigestChangesOnly:true})
}
assert.equal(rows.length,53);assert.equal(new Set(rows.map(r=>r.goalId)).size,53)
const before=read(resolve(root,prior,'final-v4-warning-attribution.paraben-native-scope.actual.json'))
const compilation=buildApplicabilityCompilation();const report=compilation.reports.find(r=>r.landscapeId===raw.landscapeId);assert(report)
assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0)
const baseline=new Map(before.nativeSourceEvidenceByCanonicalGoal.map((g:any)=>[g.goalId,g.compiledApplicability]))
assert.equal(report.goals.length,479)
for(const g of report.goals)assert.deepEqual(g.compiledApplicability,baseline.get(g.goalId))
const by=report.goals.filter(g=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map(g=>g.goalId)
assert.deepEqual(new Set(by),new Set(before.rawBYTargetGoalIds))
const targets=['0d59b62e-d3f9-5969-b961-0c5e26316c04',taskId,'3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','d3cd250f-5221-589d-aa1c-44a4692d1acb','171b47e2-2c53-50f2-a145-a26b896fd73f']
const selected=report.goals.filter(g=>targets.includes(g.goalId))
for(const g of selected)assert.deepEqual(g.compiledApplicability.jurisdiction,['DE-HE'])
const receipt={schemaVersion:1,createdAtUTC:new Date().toISOString(),nativeChemistrySummary:report.summary,all479CompiledApplicabilityMapsExactV4:true,allRawBYGoalIdSetsExactV4:true,rawBYGoalCount:by.length,rawBYGoalIds:by,HEOnlySelected:selected,
 full378WholePageObjectsExactV4:true,atlas359WholePageObjectsExactV4:true,prepared53GoalPageCanonicalContextAndBilingualTextExact:true,
 nativeReporterCurrentBindingFieldsUsed:['buildGoalDescriptionCanonicalContext','fingerprintGoalForEvidence(goal-evidence-v1)','fingerprintGoalDescriptionReviewPage','fingerprintGoalDescriptionReviewContext'],
 all53:rows,batches,outerDigestBeforeV4:v4Full.digest,outerDigestAfterV5:v5Full.digest,
 classificationTaskFingerprintUnchanged:d.sourceFingerprint,classificationLedgerModified:false,preparedV4InputsModified:false,requiresReviewRestartFromMetadataDelta:false,
 noCompletedDResolutionClaim:true,scienceReviewDecision:null,newSourceReview:false,humanApproval:false,humanTrial:false,activeWrites:false,fullCentralOrCQRRun:false,nativeCodeModified:false}
write('v5-native-scope-and-all53-current-binding.actual.receipt.json',receipt)
console.log(JSON.stringify({all53Exact:true,all378FullPagesExact:true,all359AtlasPagesExact:true,all479ScopesExact:true,rawBYCount:by.length,APV203Gone:true,errors:report.summary.errors,warnings:report.summary.warnings,classificationLedgerUnchanged:true,reviewRestartRequired:false}))
