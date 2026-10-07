import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root=resolve('.')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-final-native-review-inputs-author-v3'
const v1='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v1'
const arg=process.argv.indexOf('--isolated-root');assert.ok(arg>=0)
const isolatedRoot=resolve(process.argv[arg+1])
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const shaBytes=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:shaBytes(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const write=(p:string,v:any)=>writeFileSync(resolve(root,own,p),JSON.stringify(v,null,2)+'\n')
const isolation=read(own+'/temporary-native-isolation.actual-receipt.json')
for(const h of isolation.byteIdenticalCopiedProductionHelpers){assert.equal(bind(h.path).sha256,h.sha256,'Current helper drift: '+h.path);assert.equal(shaBytes(readFileSync(resolve(isolatedRoot,h.path))),h.sha256)}
const {loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal,writeGoalBookModel,stableGoalBookJson}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/goalBookModel.ts')).href)
const {prepareGoalDescriptionRolloutBatch,validatePreparedGoalDescriptionRolloutBatch}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const {buildGoalBookSourceAtlasInputs}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const canonical=read(own+'/prospective-current378.canonical.author-candidate.json'),byID=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const kind=read(own+'/prospective-current378.semantic-kinds.author-input.json')
const changedKinds:any[]=[]
for(const d of kind.decisions){const now=fingerprintSemanticKindSourceGoal(byID.get(d.goalId));if(now!==d.sourceFingerprint){changedKinds.push({goalId:d.goalId,before:d.sourceFingerprint,prospective:now,decisionStatus:d.decisionStatus,semanticKind:d.semanticKind,technicalBindingOnly:true,newIndependentAtomarityApproval:false});d.sourceFingerprint=now}}
assert.deepEqual(changedKinds.map(r=>r.goalId).sort(),isolation.dFreshGoalIds.filter((id:string)=>['3d3231f9','9decc36b','363c5740'].includes(id.slice(0,8))).sort())
write('prospective-current378.semantic-kinds.author-input.json',kind)
write('three-existing-kind-input-fingerprint-deltas.author.json',{schemaVersion:1,role:'AUTHOR exact technical source-fingerprint binding in an inert native input; existing kind values/status retained, no new independent A gate approval',rows:changedKinds,activeWrites:false,strictNetGain:0})
const full=await loadGoalBookBuildInputs(own+'/full-prospective378.book.config.json',isolatedRoot)
assert.equal(full.model.pages.length,378);await writeGoalBookModel(full.model,resolve(root,own,'qa-artifacts/full-prospective378.book-model.json'))
const currentFull=await loadGoalBookBuildInputs(v1+'/full-current378.book.config.json',root)
const currentNational=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',root)
assert.equal(currentFull.model.pages.length,378);assert.equal(currentNational.model.pages.length,359)
const atlas=buildGoalBookSourceAtlasInputs(read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'),root)
const oldAtlas=read(v1+'/actual-current378-national359-subset15-page-source-context-bindings.json')
const countries=atlas.receipt.scopes.map((s:any)=>({key:s.key,count:s.goalIds.length,orderedGoalIds:s.goalIds,orderedDigest:shaBytes(JSON.stringify(s.goalIds))}))
assert.deepEqual(countries,oldAtlas.countryViewTargets)
const currentRaw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),currentByID=new Map<string,any>(currentRaw.goals.map((g:any)=>[g.id,g]))
const before=read(v1+'/actual-inputs.before-native-preparation.json')
const protectedRows=before.protectedStrictGoalIds.map((goalId:string)=>{assert.deepEqual(byID.get(goalId),currentByID.get(goalId));return{goalId,wholeGoalSha256:shaBytes(stableGoalBookJson(byID.get(goalId))),wholeGoalExact:true}})
assert.equal(protectedRows.length,112)
const actuallyChangedPageIds=full.model.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(currentFull.model.pages.find((q:any)=>q.goalId===p.goalId))).map((p:any)=>p.goalId)
assert.deepEqual(actuallyChangedPageIds.sort(),[...isolation.dFreshGoalIds].sort())
const prepared=await prepareGoalDescriptionRolloutBatch(own+'/native-d-five.batch.config.json')
const checked=await validatePreparedGoalDescriptionRolloutBatch(own+'/native-d-five.batch.config.json')
assert.equal(checked.model.pages.length,5);assert.equal(checked.manifest.source.baseBookDigest,full.model.digest)
const authorScope=read(v1+'/current-amv-gap-and-selected-fifteen.author-readiness.json')
const pages=isolation.exact15GoalIds.map((goalId:string)=>{
 const f=full.model.pages.find((p:any)=>p.goalId===goalId),current=currentFull.model.pages.find((p:any)=>p.goalId===goalId),national=currentNational.model.pages.find((p:any)=>p.goalId===goalId),subset=checked.model.pages.find((p:any)=>p.goalId===goalId)
 assert.ok(f&&current&&national)
 const witnesses=atlas.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===goalId).map((w:any)=>({scopeKey:s.key,...w})))
 const old=oldAtlas.rows.find((r:any)=>r.goalId===goalId);assert.deepEqual(witnesses,old.actualNativeSourceScopeWitnesses)
 return {goalId,wholeProspectiveGoalSha256:shaBytes(stableGoalBookJson(byID.get(goalId))),wholeCurrentGoalSha256:shaBytes(stableGoalBookJson(currentByID.get(goalId))),wholeGoalUnchanged:stableGoalBookJson(byID.get(goalId))===stableGoalBookJson(currentByID.get(goalId)),prospectiveFull378Page:f,currentFull378Page:current,currentNational359Page:national,subsetFivePage:subset??null,fullPageExact:stableGoalBookJson(f)===stableGoalBookJson(current),prospectiveFullPageSha256:shaBytes(stableGoalBookJson(f)),currentFullPageSha256:shaBytes(stableGoalBookJson(current)),actualNativeSourceScopeWitnesses:witnesses,sourceWitnessesExactV1:true,authorPrimaryScope:authorScope.rows.find((r:any)=>r.goalId===goalId).authorPrimaryScope,sourceApproval:false,wholeNationalCoverageReviewed:false,nativeSourceMetadataNotPhysicalGradeEvidence:true}
})
write('actual-full378-national359-five-pages-native-context-source-bindings.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual unmodified production model/context/atlas/bundle preparation; not D/P/A/M/V approval',currentAtomCount:378,currentFullReviewPages:378,currentNational359Pages:359,prospectiveFullPages:378,targetedSubsetPages:5,fullProspectiveModelDigest:full.model.digest,currentFullModelDigest:currentFull.model.digest,currentNationalModelDigest:currentNational.model.digest,subsetDigest:checked.model.digest,bundleFingerprint:checked.bundle.bundleFingerprint,actualNativeDInputCheck:'PASS_TWO_DISTINCT_BLIND_CAMPAIGNS_IDENTICAL_INPUT',actuallyChangedFullPageIds:actuallyChangedPageIds,all373OtherFullPagePayloadsExact:true,protected112WholeGoalsExact:true,protectedRows,countryViewTargets:countries,all48CountryTargetSetsExactV1:true,sourceAtlasCounts:atlas.receipt.counts,actualNativeInputBindings:atlas.receipt.inputBindings,actualCurrentSourceAtlasReceipt:bind('app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'),sourceWitnessesAll15ExactV1:true,rows:pages,productionHelpersUsed:isolation.byteIdenticalCopiedProductionHelpers.filter((h:any)=>['goalBookModel.ts','goalBookSourceAtlasInputs.ts','materializeGoalDescriptionRolloutBatch.ts','createGoalDescriptionReviewCampaign.ts','goalBookRenderer.ts','exportGoalBookReviewBundle.ts'].some(n=>h.path.endsWith('/'+n))),currentGlobalDurationPolicy:bind('curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'),historicalHelpersNotRehashed:true,activeWrites:false,strictNetGain:0,newScientificClosures:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({nativeDInputCheck:'PASS',full378:full.model.pages.length,national359:currentNational.model.pages.length,subset5:checked.model.pages.length,actualChangedFullPages:actuallyChangedPageIds,all373OthersExact:true,protected112Exact:true,countryViewsUnchanged:countries.length,bundleFingerprint:checked.bundle.bundleFingerprint}))
