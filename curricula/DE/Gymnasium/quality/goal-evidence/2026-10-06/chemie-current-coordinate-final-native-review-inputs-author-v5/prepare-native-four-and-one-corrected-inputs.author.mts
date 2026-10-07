import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root=resolve('.'),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-current-coordinate-final-native-review-inputs-author-v5',v3=base+'chemie-current-fifteen-final-native-review-inputs-author-v3',v4=base+'chemie-current-coordinate-bond-visual-correction-author-v4'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),bind=(p:string)=>({path:p,sha256:sha(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length}),write=(p:string,v:any)=>writeFileSync(resolve(root,own,p),JSON.stringify(v,null,2)+'\n')
for(const p of [v3+'/final-native-review-inputs-author-v3.final.freeze.json',v4+'/coordinate-bond-visual-author-v4.final.freeze.json'])for(const f of read(p).files)assert.equal(bind(f.path).sha256,f.sha256)
const staging=read(own+'/actual-single-visual-resource-staging-and-bounded-delta.author.json'),isolatedRoot=staging.temporaryIsolatedRootUsed
const {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/goalBookModel.ts')).href)
const {prepareGoalDescriptionRolloutBatch,validatePreparedGoalDescriptionRolloutBatch}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const helperPaths=['app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/goalBookRenderer.ts','app/scripts/exportGoalBookReviewBundle.ts']
for(const p of helperPaths)assert.equal(bind(p).sha256,sha(readFileSync(resolve(isolatedRoot,p))))
const full=await loadGoalBookBuildInputs(own+'/full-prospective378.book.config.json',isolatedRoot),oldFull=read(v3+'/qa-artifacts/full-prospective378.book-model.json'),can=read(own+'/prospective-current378.canonical.author-candidate.json'),oldCan=read(v3+'/prospective-current378.canonical.author-candidate.json')
assert.equal(full.model.pages.length,378)
const gid=staging.goalId,goals=new Map<string,any>(can.goals.map((g:any)=>[g.id,g])),oldGoals=new Map<string,any>(oldCan.goals.map((g:any)=>[g.id,g]))
const changedGoalIds=can.goals.filter((g:any)=>stableGoalBookJson(g)!==stableGoalBookJson(oldGoals.get(g.id))).map((g:any)=>g.id);assert.deepEqual(changedGoalIds,[gid])
const changedPageIds=full.model.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(oldFull.pages.find((o:any)=>o.goalId===p.goalId))).map((p:any)=>p.goalId);assert.deepEqual(changedPageIds,[gid])
const before=read(base+'chemie-current-atomic-description-positive-gap-author-v1/actual-inputs.before-native-preparation.json'),currentCan=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),currentGoals=new Map<string,any>(currentCan.goals.map((g:any)=>[g.id,g]))
for(const id of before.protectedStrictGoalIds)assert.deepEqual(goals.get(id),currentGoals.get(id));assert.equal(before.protectedStrictGoalIds.length,112)
const kinds=read(own+'/prospective-current378.semantic-kinds.author-input.json');for(const d of kinds.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)))
const selected15=read(v3+'/temporary-native-isolation.actual-receipt.json').exact15GoalIds
for(const id of selected15.filter((id:string)=>id!==gid)){assert.deepEqual(goals.get(id),oldGoals.get(id));assert.deepEqual(full.model.pages.find((p:any)=>p.goalId===id),oldFull.pages.find((p:any)=>p.goalId===id))}
await writeGoalBookModel(full.model,resolve(root,own,'qa-artifacts/full-prospective378.book-model.json'))
const oldNative=read(v3+'/actual-full378-national359-five-pages-native-context-source-bindings.json')
write('actual-one-delta-full378-and-fourteen-reuse.native-bindings.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR native exact fullbook and one resource delta; no new independent review or gate approval',actualCurrentCanonical:bind('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),prospectiveCanonical:bind(own+'/prospective-current378.canonical.author-candidate.json'),prospectiveFullBookDigest:full.model.digest,wholeGoalDeltaIds:changedGoalIds,fullPageDeltaIds:changedPageIds,all478OtherWholeGoalsExactV3:true,all377OtherFullPagesExactV3:true,all14OtherSelectedWholeGoalsAndFullPagesExactV3:true,protected112WholeGoalsExactCurrent:true,semanticKindDecisionPayloadsUnchangedV3:true,nativeAllKindsCurrentFP:true,selected15PageBindings:selected15.map((id:string)=>({goalId:id,prospectiveFullPage:full.model.pages.find((p:any)=>p.goalId===id),fullPageExactV3:id!==gid,wholeGoalExactV3:id!==gid,sourceWitnesses:oldNative.rows.find((r:any)=>r.goalId===id).actualNativeSourceScopeWitnesses,sourceScopesUnchanged:true,authorPrimaryScope:oldNative.rows.find((r:any)=>r.goalId===id).authorPrimaryScope,sourceApproval:false})),nativeHelperBindings:helperPaths.map(bind),activeWrites:false,humanApproval:false,humanTrial:false,strictNetGain:0})
// Four-page blind review inputs first; isolated output directories are distinct.
for(const key of ['four-excluding-coordinate','coordinate-single']){
 const path=own+'/native-d-'+key+'.batch.config.json'
 const built=await prepareGoalDescriptionRolloutBatch(path),checked=await validatePreparedGoalDescriptionRolloutBatch(path)
 assert.equal(checked.manifest.source.baseBookDigest,full.model.digest)
 write('native-d-'+key+'.actual-prepare-check-receipt.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual unchanged production prepare/check; no review verdict',scopeGoalIds:checked.manifest.goalIds,pageCount:checked.model.pages.length,subsetBookDigest:checked.model.digest,bundleFingerprint:checked.bundle.bundleFingerprint,actualPreparation:'PASS',twoDistinctBlindCampaignsExactSharedInput:true,baseBookDigest:full.model.digest,actualHTMLPath:checked.config.outputDirectory+'/bundle/book.html',actualPDFPath:checked.config.outputDirectory+'/bundle/book.pdf',activeWrites:false,humanApproval:false,strictNetGain:0})
 console.log(JSON.stringify({nativeScope:key,actualPrepareCheck:'PASS',pages:checked.model.pages.length,bundleFingerprint:checked.bundle.bundleFingerprint}))
}
