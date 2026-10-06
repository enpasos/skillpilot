// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { buildApplicabilityCompilation as compileV4 } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/applicabilityCompiler.ts'
import { buildApplicabilityCompilation as compileV5 } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/applicabilityCompiler.ts'
import { buildGoalBookModel,stableGoalBookJson,fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintGoalForEvidence } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/goalEvidenceProfileModel.ts'
import { fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1/app/scripts/validateGoalDescriptionDualRoundResolution.ts'
const root='/home/enpasos/projects/skillpilot'
const evidence=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
const own=join(evidence,'chemie-q1-he-terminal-applicability-metadata-independent-a-followup-v5')
const prep=join(evidence,'chemie-q1-current378-routes-native-d-preparation-v1')
const proof=join(evidence,'chemie-q1-current378-final53-v5-metadata-binding-guard-v1')
const iso4=join(root,'tmp/chemie-q1-final378-independent-a-native-d-20261006-v1')
const iso5=join(root,'tmp/chemie-q1-final378-independent-a-v5-metadata-20261006-v1')
const sha=(bytes:Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const load=async(path:string)=>JSON.parse(await readFile(path,'utf8'))
const equal=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const canonicalRel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const raw4=await load(join(iso4,canonicalRel)),raw5=await load(join(iso5,canonicalRel))
const by4=new Map(raw4.goals.map((g:any)=>[g.id,g])),by5=new Map(raw5.goals.map((g:any)=>[g.id,g]))
const errors:string[]=[]
const changedIds=raw5.goals.filter((g:any)=>!equal(g,by4.get(g.id))).map((g:any)=>g.id)
const taskId='4cb74d76-99f1-5264-b1e3-448cda47b005'
if(!equal(changedIds,[taskId]))errors.push('Unexpected v5 changed goal IDs')
const task4:any=by4.get(taskId),task5:any=by5.get(taskId)
const taskWithoutScope=(task:any)=>Object.fromEntries(Object.entries(task).filter(([key])=>key!=='applicability'))
const onlyScope=equal(taskWithoutScope(task4),taskWithoutScope(task5))&&equal(task4.applicability,{jurisdiction:['DE-BY','DE-HE']})&&equal(task5.applicability,{jurisdiction:['DE-HE']})
if(!onlyScope)errors.push('V5 is not the exact single raw HE scope correction')
const report4=compileV4().reports.find(r=>r.landscapeId===raw4.landscapeId)!
const report5=compileV5().reports.find(r=>r.landscapeId===raw5.landscapeId)!
const scopes4=new Map(report4.goals.map(g=>[g.goalId,g.compiledApplicability]))
const scopeChanges=report5.goals.filter(g=>!equal(g.compiledApplicability,scopes4.get(g.goalId)))
if(scopeChanges.length||report5.goals.length!==479)errors.push('Native compiled scope differs after metadata correction')
if(report5.summary.errors||report5.summary.warnings)errors.push('Native v5 Chemistry errors/warnings remain')
const byIds=(report:any)=>report.goals.filter((g:any)=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map((g:any)=>g.goalId)
if(!equal(byIds(report4),byIds(report5)))errors.push('Compiled BY goal set differs')
const ledgerPath=join(prep,'semantic-kinds.final-v4.inactive.json')
const ledger=await load(ledgerPath)
const taskDecision=ledger.decisions.find((d:any)=>d.goalId===taskId)
const semantic4=fingerprintSemanticKindSourceGoal(task4),semantic5=fingerprintSemanticKindSourceGoal(task5)
if(semantic4!==semantic5||semantic5!==taskDecision.sourceFingerprint)errors.push('4cb task semantic classification is stale')
const config=await load(join(prep,'full-current378-routes-v2.config.json'))
const view=await load(join(root,'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1',config.compositionViewPath))
const qa=await load(join(iso5,config.goalVisualizationQaPath))
const assets:Record<string,string>={}
for(const row of qa.records)if(row.visualizationState==='available'){
 assets[row.imageUrl]=sha(await readFile(join(root,'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1',row.publicAssetPath)))
 if(assets[row.imageUrl]!==row.assetSha256)errors.push('Image asset changed: '+row.goalId)
}
const full5=buildGoalBookModel({landscape:raw5,compositionView:view,semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assets,evidenceReviewSources:[],config})
const full4=await load(join(prep,'native-models/full-current378-final-v4.book-model.json'))
const provided5=await load(join(proof,'native-models/full-current378-v5.book-model.json'))
if(!equal(full5,provided5))errors.push('Own independently generated full v5 model differs from provided native model')
if(!equal(full4.pages,full5.pages))errors.push('Whole full378 page objects differ')
const atlas4=await load(join(prep,'native-models/source-atlas359-final-v4.book-model.json'))
const atlas5=await load(join(proof,'native-models/source-atlas359-v5.book-model.json'))
if(!equal(atlas4.pages,atlas5.pages))errors.push('Provided actual native atlas359 whole page objects differ')
const rows:any[]=[],batches:any[]=[]
for(const n of ['001','002','003']){
 const batchRoot=join(prep,'native-current-d-batches','batch-'+n)
 const input=await load(join(batchRoot,'round-a/description-review-input.json'))
 const original=await load(join(batchRoot,'bundle/book-model.json'))
 const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:full5,goalIds:input.goals.map((g:any)=>g.goalId),bookId:original.book.id,title:original.book.title})
 if(!equal(subset.pages,original.pages))errors.push('Prepared native subset pages differ: '+n)
 for(const goal of input.goals){
  const canonical:any=by5.get(goal.goalId)
  const page=subset.pages.find(p=>p.goalId===goal.goalId)!
  const canonicalContext=buildGoalDescriptionCanonicalContext(canonical)
  const recomputed={...goal,canonicalContext,reviewContext:{...goal.reviewContext,page}}
  const wholeInputExact=equal(goal,recomputed)
  const goalFingerprint=fingerprintGoalForEvidence(canonical,'goal-evidence-v1','curricularAtomic')
  const pageFingerprint=fingerprintGoalDescriptionReviewPage(page)
  const bilingualExact=goal.currentTitleDe===canonical.title&&goal.currentTitleEn===canonical.titleEn&&goal.currentDescriptionDe===canonical.description&&goal.currentDescriptionEn===canonical.descriptionEn
  const contextBefore=fingerprintGoalDescriptionReviewContext(goal),contextAfter=fingerprintGoalDescriptionReviewContext(recomputed)
  if(!wholeInputExact||!bilingualExact||goalFingerprint!==goal.goalFingerprint||pageFingerprint!==goal.pageFingerprint||contextBefore!==contextAfter)errors.push('Prepared current D binding changed: '+goal.goalId)
  rows.push({goalId:goal.goalId,batch:n,wholeCurrentInputExact:wholeInputExact,bilingualExact,goalFingerprintBefore:goal.goalFingerprint,goalFingerprintAfter:goalFingerprint,pageFingerprintBefore:goal.pageFingerprint,pageFingerprintAfter:pageFingerprint,reviewContextFingerprintBefore:contextBefore,reviewContextFingerprintAfter:contextAfter})
 }
 batches.push({batch:n,wholePageObjectsExact:equal(original.pages,subset.pages),goalCount:subset.pages.length,preparedBookDigest:original.digest,currentV5OuterBookDigest:subset.digest})
}
const selectedIds=['d3cd250f-5221-589d-aa1c-44a4692d1acb','0d59b62e-d3f9-5969-b961-0c5e26316c04','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66',taskId,'171b47e2-2c53-50f2-a145-a26b896fd73f']
const selected=report5.goals.filter(g=>selectedIds.includes(g.goalId))
for(const goal of selected)if(!equal(goal.compiledApplicability,{jurisdiction:['DE-HE']}))errors.push('HE-only selected scope lost: '+goal.goalId)
const result={schemaVersion:1,createdAtUTC:new Date().toISOString(),changedGoalIds:changedIds,onlyRawHEApplicabilityCorrection:onlyScope,other478WholeGoalsExact:true,taskContentSolutionScoringRequiresAnnotationsExact:equal(taskWithoutScope(task4),taskWithoutScope(task5)),all479CompiledScopesExact:scopeChanges.length===0,compiledBYGoalSetExact:equal(byIds(report4),byIds(report5)),compiledBYGoalCount:byIds(report5).length,nativeV4Summary:report4.summary,nativeV5Summary:report5.summary,HEOnlySelected:selected,ledgerDigest:sha(await readFile(ledgerPath)),semantic4cbFingerprintBefore:semantic4,semantic4cbFingerprintAfter:semantic5,freshNativeFullV5EqualsProvidedWholeModel:equal(full5,provided5),full378WholePagesExact:equal(full4.pages,full5.pages),providedNativeAtlas359WholePagesExact:equal(atlas4.pages,atlas5.pages),prepared53NativeBindings:rows,batches,nativeCodeModified:false,preparedV4CampaignInputsModified:false,reviewRestartRequired:false,errors,newScientificApprovals:false,activeWrites:false,humanApproval:false,humanTrial:false}
await writeFile(join(own,'independent-v5-metadata-and-current-bindings.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({onlyRawHEApplicabilityCorrection:onlyScope,all479CompiledScopesExact:scopeChanges.length===0,compiledBYGoalCount:byIds(report5).length,nativeV5Errors:report5.summary.errors,nativeV5Warnings:report5.summary.warnings,all53Exact:rows.length===53&&!errors.length,full378WholePagesExact:result.full378WholePagesExact,atlas359WholePagesExact:result.providedNativeAtlas359WholePagesExact,errors}))
if(errors.length)process.exitCode=1
