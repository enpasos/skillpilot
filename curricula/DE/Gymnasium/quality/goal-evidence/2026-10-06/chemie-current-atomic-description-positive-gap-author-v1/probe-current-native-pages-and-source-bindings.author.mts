import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { validatePreparedGoalDescriptionRolloutBatch } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const root=resolve('.')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:digest(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const scope=read(own+'/current-amv-gap-and-selected-fifteen.author-readiness.json')
const before=read(own+'/actual-inputs.before-native-preparation.json')
const subjectConfig=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((s:any)=>s.subject==='chemie')
const full=await loadGoalBookBuildInputs(own+'/full-current378.book.config.json',root)
const national=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',root)
const prepared=await validatePreparedGoalDescriptionRolloutBatch(own+'/native-d-fifteen.batch.config.json')
const atlasConfigPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const atlas=buildGoalBookSourceAtlasInputs(read(atlasConfigPath),root)
assert.equal(full.model.pages.length,378);assert.equal(national.model.pages.length,359)
assert.equal(prepared.model.pages.length,15)
assert.equal(prepared.manifest.source.baseBookDigest,full.model.digest)
const nowRaw=read(subjectConfig.landscapePath)
const byID=new Map(nowRaw.goals.map((g:any)=>[g.id,g]))
const bindingDrift=before.files.filter((b:any)=>digest(readFileSync(resolve(root,b.path)))!==b.sha256).map((b:any)=>({path:b.path,before:b.sha256,now:bind(b.path).sha256}))
assert.ok(bindingDrift.every((b:any)=>b.path.includes('deep-understanding-rollout')||b.path==='AGENTS.md'),JSON.stringify(bindingDrift))
for(const r of scope.rows) assert.deepEqual(byID.get(r.goalId),r.wholeCurrentGoal)
const pages=scope.rows.map((r:any)=>{
 const f=full.model.pages.find((p:any)=>p.goalId===r.goalId)!
 const n=national.model.pages.find((p:any)=>p.goalId===r.goalId)!
 const sub=prepared.model.pages.find((p:any)=>p.goalId===r.goalId)!
 assert.ok(f&&n&&sub)
 const witnesses=atlas.receipt.scopes.flatMap(s=>s.witnesses.filter(w=>w.goalId===r.goalId).map(w=>({scopeKey:s.key,...w})))
 return {goalId:r.goalId,wholeCurrentGoalDigest:digest(stableGoalBookJson(byID.get(r.goalId))),fullCurrent378Page:f,national359Page:n,subset15Page:sub,fullPageDigest:digest(stableGoalBookJson(f)),nationalPageDigest:digest(stableGoalBookJson(n)),subsetPageDigest:digest(stableGoalBookJson(sub)),actualNativeSourceScopeWitnesses:witnesses,authorPrimaryScope:r.authorPrimaryScope,sourceApproval:false,wholeNationalCoverageReviewed:false,nativeSourceMetadataNotPhysicalGradeEvidence:true}
})
const protectedIDs=before.protectedStrictGoalIds
assert.equal(protectedIDs.length,112)
assert.ok(protectedIDs.every((id:string)=>full.model.pages.some(p=>p.goalId===id)))
const helpers=['app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/exportGoalBookReviewBundle.ts','app/scripts/goalBookRenderer.ts']
writeFileSync(resolve(root,own,'actual-current378-national359-subset15-page-source-context-bindings.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual unchanged production-helper bindings; not D/P/source approval',currentCanonicalAtomCount:378,currentFullReviewPages:378,currentNationalSourceAtlasPages:359,currentSubsetReviewPages:15,fullModelDigest:full.model.digest,nationalModelDigest:national.model.digest,subsetModelDigest:prepared.model.digest,actualCurrentWholeCanonical:bind(subjectConfig.landscapePath),actualCurrentSubjectRegistryConfig:subjectConfig,wholeRegistryOrPolicyDriftObserved:bindingDrift,protected112CurrentGoalsUntouched:true,protected112PagesExistWithoutRepeatingScienceReviews:true,sourceAtlasCounts:atlas.receipt.counts,actualNativeInputBindings:atlas.receipt.inputBindings,actualBookBuildInputBindings:{full:full.model.source,national:national.model.source},countryViewTargets:atlas.receipt.scopes.map(s=>({key:s.key,count:s.goalIds.length,orderedGoalIds:s.goalIds,orderedDigest:digest(JSON.stringify(s.goalIds))})),rows:pages,unchangedNativeHelpers:helpers.map(bind),activeWrites:false,newStrictClosures:0,humanApproval:false,humanTrial:false},null,2)+'\n')
console.log(JSON.stringify({full378:full.model.pages.length,national359:national.model.pages.length,subset15:prepared.model.pages.length,all15WholeGoalsUnchanged:true,actualNativeSourceInputs:atlas.receipt.inputBindings.length,sourceScopes:atlas.receipt.scopes.length}))
