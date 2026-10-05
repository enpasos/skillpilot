import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalDescriptionReviewCampaign, serializeGoalDescriptionReviewBatchInput, fingerprintGoalDescriptionReviewRecordSchema, validateGoalDescriptionReviewBatch, buildGoalDescriptionReviewInput, buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-independent-source-description-review-a-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1'
const read = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const write = (n:string,x:unknown) => writeFileSync(`${own}/${n}`,`${JSON.stringify(x,null,2)}\n`)
const sha = (b:Buffer) => `sha256:${createHash('sha256').update(b).digest('hex')}`

async function main() {
 const bundle=read(`${author}/bundle/manifest.json`), input=read(`${author}/current-description-review-input.json`), run=read(`${own}/source-description-a.run.json`)
 const receipt=read(`${own}/input-bindings-a.json`), landscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
 const goalById=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
 const exactFileMismatches=receipt.files.filter((f:any)=>sha(readFileSync(f.path))!==f.sha256)
 // The supplied current review input has no operative P material in this
 // author excerpt. No peer or historical reviewer output is opened here.
 const currentInput=buildGoalDescriptionReviewInput({bundle,reviewInput:read(`${author}/bundle/review-input.json`),landscape})
 const bindings=input.goals.map((g:any)=>({goalId:g.goalId,goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,
  contextFingerprint:fingerprintGoalDescriptionReviewContext(g),pageFingerprintMatches:fingerprintGoalDescriptionReviewPage(g.reviewContext.page)===g.pageFingerprint,
  canonicalContextMatches:JSON.stringify(buildGoalDescriptionCanonicalContext(goalById.get(g.goalId)))===JSON.stringify(g.canonicalContext),
  bilingualTextMatches:g.currentDescriptionDe===goalById.get(g.goalId).description&&g.currentDescriptionEn===goalById.get(g.goalId).descriptionEn,
  nativeCurrentInputMatches:JSON.stringify(currentInput.goals.find((x:any)=>x.goalId===g.goalId))===JSON.stringify(g)}))
 const recordSchemaDigest=await fingerprintGoalDescriptionReviewRecordSchema()
 // This adapter is deliberately informed and cannot satisfy blind Book-D2.
 const campaign=buildGoalDescriptionReviewCampaign({bundle,input,campaignId:run.campaignId,roundId:run.roundId,reviewerRole:'synthesizer',reviewPass:'synthesis',independenceGroupId:run.independenceGroupId,blindToOtherReviews:false,recordSchemaDigest,batchSize:7})
 const batch=campaign.batches[0]
 const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.bundleFingerprint,bookDigest:bundle.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals})
 write('native-campaign-a.json',campaign)
 writeFileSync(`${own}/native-batch-a.input.jsonl`,bytes)
 Object.assign(run,{batchId:batch.batchId,batchInputFingerprint:batch.batchInputFingerprint,completedAt:new Date().toISOString()})
 run.inputArtifacts=run.inputArtifacts.filter((a:any)=>a.role!=='description_review_batch_input_jsonl')
 run.inputArtifacts.push({role:'description_review_batch_input_jsonl',digest:batch.batchInputFingerprint})
 write('source-description-a.run.json',run)
 const result=await validateGoalDescriptionReviewBatch({bundle,input,campaign,run,batchInputBytes:bytes,recordsBytes:readFileSync(`${own}/source-description-a.records.jsonl`)})
 const errors=[...result.errors,...exactFileMismatches.map((f:any)=>`Input changed: ${f.path}`),...bindings.filter((b:any)=>!b.pageFingerprintMatches||!b.canonicalContextMatches||!b.bilingualTextMatches||!b.nativeCurrentInputMatches).map((b:any)=>`Current binding mismatch: ${b.goalId}`)]
 write('native-source-description-a.validation.receipt.json',{observedAt:new Date().toISOString(),result:errors.length?'FAIL':'PASS',nativeHelper:'validateGoalDescriptionReviewBatch',recordCount:result.records.length,errors,bindings,exactInputHashCount:receipt.files.length,
  roleQualifier:'synthesizer/informed adapter; own independent source/scientific critique with disclosed author-summary exposure, not a blind final native Book-D review or D2 acceptance',strictClosureAdded:0})

 const canonical=normalizeCanonicalLandscape(landscape), memoryGoalId='1e372b97-6f1c-596c-8a8b-fc03193d784a'
 const views=['curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-lk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json'].map(path=>{
  const view=normalizeCompositionView(read(path)),compiled=compileCompositionView(view,canonical),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(canonical.goals.map(g=>[g.id,g])))
  return {path,compileErrors:compiled.findings.filter(f=>f.severity==='error'),particleGoalVisible:roles.targetGoalIds.has(input.goals[0].goalId),memoryGoalVisible:roles.targetGoalIds.has(memoryGoalId)}
 })
 const deckPath='curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json', deck=read(deckPath)
 const cards=(deck.cards??deck.entries??[]).filter((c:any)=>c.id==='chem_basics_005')
 const memoryErrors=[...(cards.length===1?[]:['Particle card count is not one']),...views.filter(v=>v.compileErrors.length||v.particleGoalVisible&&!v.memoryGoalVisible).map(v=>`Memory visibility failure ${v.path}`)]
 write('individual-particle-memory-a.receipt.json',{observedAt:new Date().toISOString(),result:memoryErrors.length?'FAIL':'PASS',goalId:input.goals[0].goalId,memoryGoalId,deckId:'de_gymnasium_chemistry_basics_seki',deckPath,deckDigest:sha(readFileSync(deckPath)),cards,views,errors:memoryErrors,
  scopeQualifier:'Own scientific necessity judgment plus exact individual-card and native composition binding. Does not re-review or certify the complete shared deck.',scientificDecision:'memory_required, keep existing card unchanged; after a split bind it to retained particle identity; no Rutherford card.'})

 // Independent extraction of the actual source witness routing. Existing
 // mapping decisions are source inputs, not the reviewer’s scientific verdict.
 const witnesses=read(`${author}/current-source-witnesses.json`)
 const scoped=witnesses.scopes.filter((s:any)=>s.stage==='SekI'&&['DE-HE','DE-BY'].includes(s.jurisdiction)).map((s:any)=>({path:s.path,jurisdiction:s.jurisdiction,goalIds:s.goalIds.filter((id:string)=>run.goalIds.includes(id)),targetWitnesses:s.witnesses.filter((w:any)=>run.goalIds.includes(w.goalId))}))
 const sourceIds=new Map<string,Set<string>>()
 for(const c of witnesses.contexts) {
  if(!sourceIds.has(c.sourceExtractionPath)) {
   const extraction=read(c.sourceExtractionPath)
   const arr=extraction.goals??extraction.sourceGoals??[]
   sourceIds.set(c.sourceExtractionPath,new Set(arr.map((g:any)=>g.id)))
  }
 }
 write('specific-current-source-witnesses-a.receipt.json',{observedAt:new Date().toISOString(),scopes:scoped,
  missingBYGoalIds:run.goalIds.filter((id:string)=>!scoped.find((s:any)=>s.jurisdiction==='DE-BY')?.goalIds.includes(id)),
  provenance:run.goalIds.map((id:string)=>({goalId:id,currentProvenance:goalById.get(id).extendedData?.provenance,
   currentHEExtractionContainsProvenanceSourceGoal:sourceIds.get('curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json')?.has(goalById.get(id).extendedData?.provenance?.sourceGoalId)})),
  qualifier:'Routing existence only, source coverage and stage/operator judgments are in own frozen assessments; absent BY witnesses remain holds.'})
 console.log(JSON.stringify({nativeSourceD:errors.length?'FAIL':'PASS',records:result.records.length,bindingErrors:errors,individualMemory:memoryErrors.length?'FAIL':'PASS',memoryErrors,strictClosureAdded:0}))
 if(errors.length||memoryErrors.length)process.exitCode=1
}
main()
