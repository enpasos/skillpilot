// SPDX-License-Identifier: Apache-2.0
// Compare actual current inputs with the completed first blind rounds. No review
// record, source fingerprint, or historical artifact is rewritten by this tool.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalDescriptionRolloutBase,buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {loadCanonicalCatalog} from '../../../../../../../app/scripts/deriveKnowledgeContext.ts'
import {KnowledgeContextIndex} from '../../../../../../../app/scripts/lib/knowledgeContext.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const configPath='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-15/semiconductor-stage-path-current-v1.config.json'
const read=(p:string)=>fs.readFileSync(resolve(root,p),'utf8')
const config=JSON.parse(read(configPath))
const old=JSON.parse(read(config.outputDirectory+'/bundle/book-model.json'))
const oldInput=JSON.parse(read(config.outputDirectory+'/round-a/description-review-input.json'))
const oldW=JSON.parse(fs.readFileSync(resolve(directory,'initial-P-context-review-inactive/knowledge-context-current-review-input.json'),'utf8'))
const base=await loadGoalDescriptionRolloutBase(config.baseGoalBookConfigPath)
const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:config.goalIds,bookId:config.bookId,title:config.title})
const landscape=JSON.parse(read(current.source.landscapePath)),goals=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const index=new KnowledgeContextIndex(loadCanonicalCatalog())
const retain=new Set(['9f265f49-1342-5ba7-9c5d-54e97fdb2f19','2084b7d4-300d-5fa0-8b8d-c480c40f853e','3857891b-d328-585b-9936-85c7aff122ee','4a42cddd-7827-5204-87e5-8d9eac7792f1','df010b2b-b182-5f7e-bbe4-49b72e48c27a','658cf33d-a0c2-5d47-801a-3dbcd5cac074'])
const digest=(value:string|Buffer)=>'sha256:'+createHash('sha256').update(value).digest('hex')
const equal=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const comparisons=old.pages.map((page:any)=>{
 const other=current.pages.find((p:any)=>p.goalId===page.goalId);assert.ok(other)
 const input=oldInput.goals.find((g:any)=>g.goalId===page.goalId),goal:any=goals.get(page.goalId);assert.ok(input&&goal)
 const priorW=oldW.contexts.find((c:any)=>c.goal.id===page.goalId);assert.ok(priorW)
 const bilingualTextExact=input.currentTitleDe===goal.title&&input.currentTitleEn===goal.titleEn&&input.currentDescriptionDe===goal.description&&input.currentDescriptionEn===goal.descriptionEn
 const result={goalId:page.goalId,retentionCandidate:retain.has(page.goalId),reviewedPageFingerprint:page.pageFingerprint,currentPageFingerprint:other.pageFingerprint,exactPageObjectsEqual:equal(page,other),bilingualTextExact,evidenceProfileContextExact:input.reviewContext.evidenceProfile===null&&current.source.evidenceReviewSources.length===0,canonicalContextExact:equal(input.canonicalContext,buildGoalDescriptionCanonicalContext(goal)),knowledgeContextExact:equal(priorW,index.context(page.goalId)),reviewedPageObjectDigest:digest(stableGoalBookJson(page)),currentPageObjectDigest:digest(stableGoalBookJson(other))}
 return {...result,retentionEligible:result.exactPageObjectsEqual&&result.bilingualTextExact&&result.evidenceProfileContextExact&&result.canonicalContextExact&&result.knowledgeContextExact}
})
const retained=comparisons.filter((x:any)=>x.retentionCandidate)
const receipt={schemaVersion:1,checkedAt:new Date().toISOString(),actualTool:'loadGoalDescriptionRolloutBase + buildGoalDescriptionRolloutSubsetModel + current KnowledgeContextIndex',reviewedBookModelDigest:old.digest,currentBookModelDigest:current.digest,sourceBindingChanged:old.digest!==current.digest,reviewedSourceBindings:old.source,currentSourceBindings:current.source,comparisonGoalIds:config.goalIds,comparisons,allSixRetainedInputBindingsExact:retained.length===6&&retained.every((x:any)=>x.retentionEligible),scope:'Actual final complete source/view BookModel compilation followed by the same native13-goal subset builder. Page objects, bilingual text, canonical contexts and complete graph-derived W are compared without rewriting completed blind records, books, bundles, runs or fingerprints. Global source-digest differences are explicit; no new scientific review or human approval is claimed.'}
fs.writeFileSync(resolve(directory,'retained-current-input-comparison.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
assert.ok(receipt.allSixRetainedInputBindingsExact,'A planned retained target changed: move it to actual current independent rereview')
console.log(`Actual current input comparison: six retained targets exact; ${comparisons.filter((x:any)=>!x.retentionEligible).length} other targets differ; global model ${old.digest} -> ${current.digest}`)
