// SPDX-License-Identifier: Apache-2.0
// Actual inactive review binding checks; no canonical or QA mutations.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),a=resolve(own,'../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(name:string,v:any)=>{const p=resolve(own,name);assert.ok(!existsSync(p));writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
for(const name of ['first-final-source-native-context.input.freeze.json','current576-whole-P-and-live244.additional-input.freeze.json'])for(const item of read(resolve(own,name)).requiredFiles){const b=readFileSync(resolve(root,item.path));assert.equal(digest(b),item.sha256,item.path);assert.equal(b.length,item.bytes,item.path)}
const e=read(resolve(a,'neutral-final-primary-refined-basis2.author.entry.json')),sd=read(resolve(root,e.finalSourceDiff.path)),config=sd.actualFinalBookConfig,atlas=read(e.finalSourceAtlasConfigPath)
const built=buildGoalBookSourceAtlasInputs(atlas,root)
for(const [p,bytes]of Object.entries(built.outputs))assert.equal(String(bytes),readFileSync(resolve(root,p),'utf8'),`Actual ordinary source output ${p}`)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(built.receipt.counts.publishedCurricularAtomicGoals,394)
const canon=read(config.landscapePath),kinds=read(config.semanticKindLedgerPath),qa=read(config.goalVisualizationQaPath),manifest=read(config.compositionViewManifestPath),digests:Record<string,string>={}
for(const r of qa.records)if(r.visualizationState==='available'){const b=readFileSync(resolve(root,r.publicAssetPath));assert.equal(digest(b),r.assetSha256);digests[r.imageUrl]=digest(b)}
const model=buildGoalBookModel({landscape:canon,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:read(p)})),navigationView:read(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config} as any)
const parsed=parseAndValidateGoalBookModel(model);assert.equal(parsed.pages.length,394);assert.equal(stableGoalBookJson(model),stableGoalBookJson(read(e.finalFull394BookModelPath)))
// The real active public loader is also used. No inactive asset alias is copied into app/public.
const current=await loadGoalBookBuildInputs(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(current.model.pages.length,392)
write('actual-current392.normal-public-loader.model.json',current.model)
const standalone=(m:any,id:string)=>buildGoalDescriptionRolloutSubsetModel({baseModel:m,goalIds:[id],bookId:'own-constant-context-comparison',title:'Own constant comparison'}).pages[0]
const changed:any[]=[],comparisons:any[]=[]
for(const p of current.model.pages){const before=standalone(current.model,p.goalId),after=standalone(model,p.goalId);const keys=Object.keys(before).filter(k=>stableGoalBookJson(before[k])!==stableGoalBookJson(after[k]));comparisons.push({goalId:p.goalId,wholeStandalonePageExact:keys.length===0,changedKeys:keys});if(keys.length)changed.push({goalId:p.goalId,wholeBefore:before,wholeAfter:after,changedKeys:keys})}
assert.equal(changed.length,1);assert.equal(changed[0].goalId,'576d59e2-397a-5654-b853-7c0c4870fbd3');assert.deepEqual(changed[0].changedKeys,['externalReverseRequires','pageFingerprint'])
const currentCanon=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),map=new Map(canon.goals.map((g:any)=>[g.id,g])),canonChanges:any[]=[]
for(const g of currentCanon.goals){const next:any=map.get(g.id);assert.ok(next);const keys=Object.keys(g).filter(k=>stableGoalBookJson(g[k])!==stableGoalBookJson(next[k]));if(keys.length)canonChanges.push({goalId:g.id,changedKeys:keys})}
assert.equal(currentCanon.goals.length,476);assert.equal(canon.goals.length,478);assert.equal(canonChanges.length,1);assert.equal(canonChanges[0].goalId,'860c80f9-e463-598b-8ef8-79f65c12f235');assert.deepEqual(new Set(canonChanges[0].changedKeys),new Set(['weight','contains']))
const guard=read(resolve(a,'checks/latest-root244-live-base-compatibility.actual.json'));assert.equal(guard.current244StrictGoalIds.length,244)
for(const id of guard.current244StrictGoalIds){assert.ok(current.model.pages.some((p:any)=>p.goalId===id));assert.ok(model.pages.some((p:any)=>p.goalId===id));assert.deepEqual(currentCanon.goals.find((g:any)=>g.id===id),canon.goals.find((g:any)=>g.id===id))}
const liveQA=read('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');assert.equal(liveQA.records.length,392)
const qaOldChanges=liveQA.records.filter((r:any)=>stableGoalBookJson(r)!==stableGoalBookJson(qa.records.find((n:any)=>n.goalId===r.goalId))).map((r:any)=>r.goalId)
assert.deepEqual(new Set(qaOldChanges),new Set(guard.QAThreeNewlyApprovedRootRowsMustBeRetained))
write('all392-current-QA-human-fields.exact-preserve.snapshot.json',{role:'All actual current392 QA records must be retained byte-equivalent on adoption; old candidate shadow must not overwrite three now-approved root rows',records:liveQA.records})
const wholeP=read(resolve(own,'existing576.whole-valid-P.exact-KEEP.json')),goal=canon.goals.find((g:any)=>g.id===wholeP.goalId),kind=kinds.decisions.find((r:any)=>r.goalId===goal.id)?.semanticKind
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(wholeP,goal,digests,kind),[])
write('actual-full394-live392-science244-and576-context.technical.receipt.json',{schemaVersion:1,actualOrdinaryAtlasOutputsExact:true,ordinaryAtlasCounts:built.receipt.counts,normalModelAPIs:['buildGoalBookModel','parseAndValidateGoalBookModel'],full394ModelExact:true,actualCurrentPublicLoader:'loadGoalBookBuildInputs',actualCurrent392PageCount:392,all391OtherWholeStandalonePagesExact:true,all392StandaloneComparisons:comparisons,onlyActualChangedWholeStandaloneContext:changed,all244OldStrictCanonicalWholeGoalsExact:true,existing244ScientificReviewsRestarted:false,all476ExistingCanonicalCompared:true,onlyParentStructureChange:canonChanges,all392CurrentQAHumanFieldsPreservedInOwnSnapshot:true,oldShadowQARowsThatMustNotOverwriteRootApprovedRows:qaOldChanges,existing576WholePOrdinarySemanticsErrors:[],existing576WholePUnchanged:true,selectedTwoNewGoalPageApplicability:model.pages.filter((p:any)=>e.selectedGoalIds.includes(p.goalId)).map((p:any)=>({goalId:p.goalId,applicability:p.applicability})),originalFourOperatorHoldsRetained:true,activeWrites:0,newStrictClosureClaims:0,humanApproval:false,humanTrial:false})
console.log('PASS ordinary full394 model+atlas, real active392 public loader,391 unchanged wholepages,244 unchanged canonical scientific contexts,576 only externalReverseRequires,whole valid P retained,392 QA preservation snapshot; inactive review only')
