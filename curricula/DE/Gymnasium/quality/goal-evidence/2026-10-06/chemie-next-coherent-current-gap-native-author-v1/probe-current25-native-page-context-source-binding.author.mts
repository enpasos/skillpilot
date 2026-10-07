import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {validatePreparedGoalDescriptionRolloutBatch} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const root=resolve('.'),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:digest(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const scope=read(own+'/current25-provisional-scope-and-valid-existing-bindings.author.json'),before=read(own+'/actual-current-input-bindings.before-authoring.json')
const subject=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((s:any)=>s.subject==='chemie')
const full=await loadGoalBookBuildInputs(own+'/full-current378.book.config.json',root)
const national=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',root)
const twenty=await validatePreparedGoalDescriptionRolloutBatch(own+'/native-d-twenty.batch.config.json')
const five=await validatePreparedGoalDescriptionRolloutBatch(own+'/native-d-five.batch.config.json')
const atlasConfig='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const atlas=buildGoalBookSourceAtlasInputs(read(atlasConfig),root)
const primary=read(own+'/actual-current25-primary-scope-and-boundaries.author.json')
assert.equal(full.model.pages.length,378);assert.equal(national.model.pages.length,359)
assert.equal(twenty.model.pages.length,20);assert.equal(five.model.pages.length,5)
assert.equal(twenty.manifest.source.baseBookDigest,full.model.digest);assert.equal(five.manifest.source.baseBookDigest,full.model.digest)
const currentCanon=read(subject.landscapePath),byID=new Map(currentCanon.goals.map((g:any)=>[g.id,g]))
const observedDrift=before.bindings.filter((b:any)=>digest(readFileSync(resolve(root,b.path)))!==b.sha256).map((b:any)=>({path:b.path,before:b.sha256,current:bind(b.path).sha256}))
const sensitive=[subject.landscapePath,subject.semanticKindLedgerPath,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']
assert.equal(observedDrift.filter((b:any)=>sensitive.includes(b.path)||b.path.startsWith('app/public/assets')||b.path.startsWith('curricula/DE/Gymnasium/visualizations')).length,0,JSON.stringify(observedDrift))
for(const r of scope.selectedWholeCurrentRows)assert.deepEqual(byID.get(r.goalId),r.wholeCurrentGoal)
assert.equal(scope.protectedCurrent127StrictGoalIds.length,127)
const strict=new Set(scope.protectedCurrent127StrictGoalIds)
assert.ok(scope.selected25GoalIds.every((id:string)=>!strict.has(id)))
const pages=scope.selectedWholeCurrentRows.map((r:any)=>{const f=full.model.pages.find(p=>p.goalId===r.goalId)!,n=national.model.pages.find(p=>p.goalId===r.goalId)!,sub=[...twenty.model.pages,...five.model.pages].find(p=>p.goalId===r.goalId)!
 assert.ok(f&&n&&sub)
 assert.equal(sub.goalFingerprint,f.goalFingerprint)
 const witnesses=atlas.receipt.scopes.flatMap(s=>s.witnesses.filter(w=>w.goalId===r.goalId).map(w=>({scopeKey:s.key,...w})))
 return {goalId:r.goalId,wholeCurrentGoal:r.wholeCurrentGoal,wholeCurrentGoalDigest:digest(stableGoalBookJson(byID.get(r.goalId))),fullCurrent378Page:f,national359Page:n,actualNativeSubsetPage:sub,subsetBatch:twenty.model.pages.some(p=>p.goalId===r.goalId)?'twenty':'five',fullPageDigest:digest(stableGoalBookJson(f)),nationalPageDigest:digest(stableGoalBookJson(n)),subsetPageDigest:digest(stableGoalBookJson(sub)),actualNativeSourceScopeWitnesses:witnesses,authorPrimaryBoundaries:primary.rows.find((s:any)=>s.goalId===r.goalId),sourceApproval:false,wholeNationalCoverageReviewed:false}
})
const protectedPages=scope.protectedCurrent127StrictGoalIds.map((id:string)=>{const p=full.model.pages.find(p=>p.goalId===id)!;assert.ok(p);return {goalId:id,wholeCurrentGoalDigest:digest(stableGoalBookJson(byID.get(id))),goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,pageNumber:p.pageNumber}})
mkdirSync(resolve(root,own,'qa-artifacts'),{recursive:true})
writeFileSync(resolve(root,own,'qa-artifacts/full-current378.book-model.json'),stableGoalBookJson(full.model))
writeFileSync(resolve(root,own,'actual-current378-national359-subsets20-plus5-page-source-context-bindings.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual unchanged native helper bindings; not independent D/P/source review',currentFullReviewPages:378,currentNationalAtlasPages:359,actualNativeSubsetPages:[20,5],canonicalWholeGoalCount:currentCanon.goals.length,fullModelDigest:full.model.digest,nationalModelDigest:national.model.digest,subsetDigests:[twenty.model.digest,five.model.digest],currentCanonical:bind(subject.landscapePath),currentSubjectRegistryRaw:subject,observedUnrelatedInputDrift:observedDrift,wholeCurrentCanonicalByteExactToInitialScope:true,selected25WholeGoalsByteExact:true,protected127StrictCurrentGoalsUntouched:true,protected127CurrentPageBindings:protectedPages,sourceAtlasCounts:atlas.receipt.counts,currentNativeAtlasInputBindings:atlas.receipt.inputBindings,currentModelSource:{full:full.model.source,national:national.model.source},countryViewTargets:atlas.receipt.scopes.map(s=>({key:s.key,count:s.goalIds.length,orderedGoalIds:s.goalIds,orderedDigest:digest(JSON.stringify(s.goalIds))})),rows:pages,unchangedNativeHelpers:['app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/exportGoalBookReviewBundle.ts','app/scripts/goalBookRenderer.ts'].map(bind),requiredFutureCurrentFullContextRebinding:true,independentReviewsPending:true,newStrictClosures:0,newScientificClosures:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false,activeWrites:false},null,2)+'\n')
console.log(JSON.stringify({full378:378,national359:359,nativeSubsets:[20,5],actualNativeFullCurrentCanonicalExact:true,selected25WholeGoalEquality:'PASS',protectedCurrent127:'PRESERVED',countryScopes:atlas.receipt.scopes.length,observedUnrelatedInputDrift:observedDrift}))
