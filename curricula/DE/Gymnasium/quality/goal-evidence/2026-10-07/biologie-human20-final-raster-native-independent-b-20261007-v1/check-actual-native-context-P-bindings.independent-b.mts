// SPDX-License-Identifier: Apache-2.0
// Read-only current binding checks; writes only this independent review's receipt.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1')
const imageAuthor=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2')
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const rows=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(line=>JSON.parse(line))
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const frozen=json(resolve(imageAuthor,'final-human20-raster-native-author-input.freeze.json'))
for(const file of frozen.frozenFiles){const actual=readFileSync(resolve(root,file.path));assert.equal(sha(actual),file.sha256);assert.equal(actual.byteLength,file.bytes)}
const entry=json(resolve(imageAuthor,'neutral-final-human20-raster-native-review.entry.json'))
assert.equal(sha(readFileSync(resolve(root,entry.sourceCurrentCanonical.path))),entry.sourceCurrentCanonical.sha256)
const originals=json(resolve(author,'current20-whole-DEEN-goals.actual.json')).goals
const config=json(resolve(author,'native-raster-candidate/full391.book.config.author.json'))
const landscape=json(resolve(root,config.landscapePath)),kinds=json(resolve(root,config.semanticKindLedgerPath)),qa=json(resolve(root,config.goalVisualizationQaPath))
const originalBy=new Map(originals.map((g:any)=>[g.id,g])),by=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const selectedIds=new Set(originals.map((g:any)=>g.id))
for(const original of originals){const future=by.get(original.id) as any;assert.ok(future);const strip=(g:any)=>Object.fromEntries(Object.entries(g).filter(([key])=>key!=='resourceLinks'));assert.deepEqual(strip(future),strip(original))}
const digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available')digests[q.imageUrl]='sha256:'+sha(readFileSync(resolve(root,q.publicAssetPath)))
const manifest=json(resolve(root,config.compositionViewManifestPath))
const model=buildGoalBookModel({landscape,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:json(resolve(root,path))})),navigationView:json(resolve(root,manifest.navigationViewPath)),durationModelPolicy:json(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config} as any)
assert.equal(model.pages.length,391)
const storedFull=json(resolve(author,'native-raster-candidate/full391.book-model.json'))
assert.equal(stableGoalBookJson(model),stableGoalBookJson(storedFull),'Current views/source/asset inputs must reconstruct exact frozen full model')
const before=json(resolve(author,'native-raster-candidate/full391.before-twenty-links.pure.book-model.json')),beforeBy=new Map(before.pages.map((p:any)=>[p.goalId,p]))
assert.equal(model.pages.filter(p=>p.pageFingerprint===(beforeBy.get(p.goalId) as any).pageFingerprint).length,371)
assert.equal(model.pages.filter(p=>p.pageFingerprint!==(beforeBy.get(p.goalId) as any).pageFingerprint).every(p=>selectedIds.has(p.goalId)),true)
const subset=json(resolve(author,'native-raster-candidate/twenty/book-model.json'))
const rebuilt=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:subset.pages.map((p:any)=>p.goalId),bookId:subset.book.id,title:subset.book.title})
assert.equal(stableGoalBookJson(rebuilt),stableGoalBookJson(subset),'Actual twenty whole pages/context must reconstruct exactly')
const dInput=json(resolve(author,'native-raster-candidate/twenty/round-b/description-review-input.json'))
for(const row of dInput.goals){const original=originalBy.get(row.goalId) as any;assert.deepEqual(row.canonicalContext,buildGoalDescriptionCanonicalContext(by.get(row.goalId) as any));assert.equal(row.currentTitleDe,original.title);assert.equal(row.currentTitleEn,original.titleEn);assert.equal(row.currentDescriptionDe,original.description);assert.equal(row.currentDescriptionEn,original.descriptionEn);assert.deepEqual(row.reviewContext.page,subset.pages.find((p:any)=>p.goalId===row.goalId))}
const oldP=rows(resolve(author,'science-correction-v2/P20.current-text-preimage.author-targeted-v2.review.jsonl')),newP=rows(resolve(author,'native-raster-candidate/P20.actual-raster-author.review.jsonl'))
const oldPBy=new Map(oldP.map(row=>[row.goalId,row]))
const whole=json(resolve(author,'science-correction-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json'))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const validate=ajv.compile(json(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const outcomes=[]
for(const record of newP){const goal=by.get(record.goalId) as any;assert.deepEqual(record.profile,(oldPBy.get(record.goalId) as any).profile);const resources:Record<string,string>={};for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]=digests[link.url];assert.equal(validate(record),true,ajv.errorsText(validate.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[]);assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');const material=whole.goals.find((g:any)=>g.goalId===record.goalId);for(const c of material.cases){const brief=record.profile.applicationCaseBriefs.find((r:any)=>r.id===c.id);for(const [lang,suffix]of [['de','De'],['en','En']]){assert.equal(brief['taskDemand'+suffix],c.material[lang]+' '+c.task[lang]);assert.equal(brief['expectedPerformance'+suffix],c.modelAnswer[lang])}}outcomes.push({goalId:goal.id,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,exactOldScientificProfilePreserved:true,wholeCasePairs:2,actualRasterDigests:resources,schemaErrors:0,semanticErrors:0})}
assert.equal(outcomes.length,20)
const receipt={schemaVersion:1,artifactKind:'independent-b-actual-current-native-page-context-source-P-bindings',recordedAt:new Date().toISOString(),inputFilesChecked:frozen.frozenFiles.length,selectedWholeGoalBodiesRetained:20,wholeCurrentModelReconstructed:391,wholeSubsetModelReconstructed:20,unchangedOtherPageFingerprints:371,wholePProfileBodiesRetained:20,wholeCurrentCasePairs:40,actualCurrentSourceAndViewContextsReconstructed:true,outcomes,scope:'Current canonical/source/view/page/image/P binding checks only; valid prior whole-science judgments retained. Actual image science and sight verdicts are separate.',activeWrites:0,strictClosuresClaimed:0,humanApproval:false}
writeFileSync(resolve(own,'actual-native-page-context-source-P-bindings.independent-b.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({frozenInputs:169,currentFullModel:391,exactCurrentWholePages:20,unchangedOtherPages:371,currentPositiveProfiles:20,wholeCasePairs:40,oldSciencePreserved:true,blockingBindingErrors:0,activeWrites:0,humanApproval:false}))
