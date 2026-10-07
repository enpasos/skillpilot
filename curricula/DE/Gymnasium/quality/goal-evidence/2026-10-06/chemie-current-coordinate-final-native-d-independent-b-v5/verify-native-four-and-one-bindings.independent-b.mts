import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {expandGoalBookSourceAtlasReceipt} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {validatePreparedGoalDescriptionRolloutBatch} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/',author=base+'chemie-current-coordinate-final-native-review-inputs-author-v5/',prior=base+'chemie-current-fifteen-final-native-review-inputs-author-v3/',own=base+'chemie-current-coordinate-final-native-d-independent-b-v5/'
const get=async(p:string)=>JSON.parse(await readFile(p,'utf8')),digest=(b:string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const [four,one]=await Promise.all([validatePreparedGoalDescriptionRolloutBatch(author+'native-d-four-excluding-coordinate.batch.config.json'),validatePreparedGoalDescriptionRolloutBatch(author+'native-d-coordinate-single.batch.config.json')])
const [oldFull,newFull]=await Promise.all([get(prior+'qa-artifacts/full-prospective378.book-model.json').then(parseAndValidateGoalBookModel),get(author+'qa-artifacts/full-prospective378.book-model.json').then(parseAndValidateGoalBookModel)])
const oldPages=new Map(oldFull.pages.map(p=>[p.goalId,p])),newPages=new Map(newFull.pages.map(p=>[p.goalId,p])),coord='363c5740-8a3c-50b8-8c3a-5548c80c36ea'
assert.equal(oldFull.pages.length,378);assert.equal(newFull.pages.length,378)
const changedPages=newFull.pages.filter(p=>stableGoalBookJson(p)!==stableGoalBookJson(oldPages.get(p.goalId))).map(p=>p.goalId);assert.deepEqual(changedPages,[coord])
const oldCanon=await get(prior+'prospective-current378.canonical.author-candidate.json'),newCanon=await get(author+'prospective-current378.canonical.author-candidate.json'),currentCanon=await get('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const oldGoals=new Map(oldCanon.goals.map((g:any)=>[g.id,g])),newGoals=new Map(newCanon.goals.map((g:any)=>[g.id,g])),currentGoals=new Map(currentCanon.goals.map((g:any)=>[g.id,g]))
assert.equal(oldGoals.size,479);assert.equal(newGoals.size,479)
const changedGoals=[...newGoals].filter(([id,g])=>stableGoalBookJson(g)!==stableGoalBookJson(oldGoals.get(id))).map(([id])=>id);assert.deepEqual(changedGoals,[coord])
const oldCoord:any=oldGoals.get(coord),newCoord:any=newGoals.get(coord)
assert.deepEqual({...oldCoord,resourceLinks:undefined},{...newCoord,resourceLinks:undefined})
assert.equal(newCoord.resourceLinks[0].url.endsWith('.png'),true)
const before=await get(base+'chemie-current-atomic-description-positive-gap-author-v1/actual-inputs.before-native-preparation.json')
const protectedRows=before.protectedStrictGoalIds.map((id:string)=>{assert.deepEqual(newGoals.get(id),currentGoals.get(id));return{goalId:id,wholeGoalDigest:digest(stableGoalBookJson(newGoals.get(id))),wholeGoalExactCurrent:true}});assert.equal(protectedRows.length,112)
const sidecar=await get(author+'actual-one-delta-full378-and-fourteen-reuse.native-bindings.json'),oldSidecar=await get(prior+'actual-full378-national359-five-pages-native-context-source-bindings.json')
const atlas=expandGoalBookSourceAtlasReceipt(await get('app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'))
const witnessChecks=sidecar.selected15PageBindings.map((r:any)=>{const old=oldSidecar.rows.find((x:any)=>x.goalId===r.goalId),actual=atlas.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===r.goalId).map((w:any)=>({scopeKey:s.key,...w})));assert.deepEqual(r.sourceWitnesses,old.actualNativeSourceScopeWitnesses);assert.deepEqual(actual,r.sourceWitnesses);assert.deepEqual(r.prospectiveFullPage,newPages.get(r.goalId));if(r.goalId!==coord){assert.deepEqual(newPages.get(r.goalId),oldPages.get(r.goalId));assert.deepEqual(newGoals.get(r.goalId),oldGoals.get(r.goalId))}return{goalId:r.goalId,witnessCount:r.sourceWitnesses.length,witnessDigest:digest(stableGoalBookJson(actual)),exactV3AndCurrent:true,sourceApproval:false}});assert.equal(witnessChecks.length,15)
const oldInput=await get(prior+'native-d-five/round-b/description-review-input.json'),fourInput=await get(author+'native-d-four-excluding-coordinate/round-b/description-review-input.json'),oneInput=await get(author+'native-d-coordinate-single/round-b/description-review-input.json')
const inputChanges=fourInput.goals.map((g:any)=>{const old=oldInput.goals.find((x:any)=>x.goalId===g.goalId);assert.deepEqual(g.canonicalContext,old.canonicalContext);for(const key of ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint'])assert.equal(g[key],old[key]);return{goalId:g.goalId,pageFingerprintExactV3:g.pageFingerprint===old.pageFingerprint,pageTopLevelDeltaKeys:[...new Set([...Object.keys(g.reviewContext.page),...Object.keys(old.reviewContext.page)])].filter(k=>stableGoalBookJson(g.reviewContext.page[k])!==stableGoalBookJson(old.reviewContext.page[k]))}})
assert.equal(inputChanges.filter((r:any)=>!r.pageFingerprintExactV3).length,1);assert.equal(inputChanges.find((r:any)=>!r.pageFingerprintExactV3).goalId,'973c12d9-d863-5292-8c68-9c80cdacf9e2')
const carbonyl=fourInput.goals.find((g:any)=>g.goalId.startsWith('973c')),coordInput=oneInput.goals[0]
assert.equal(carbonyl.reviewContext.page.reverseRequires.length,0)
assert.ok(carbonyl.reviewContext.page.externalReverseRequires.some((r:any)=>r.goalId===coord&&r.canonicalUrl.endsWith('#goal-'+coord)))
assert.ok(coordInput.reviewContext.page.externalPrerequisites.some((r:any)=>r.goalId===carbonyl.goalId&&r.canonicalUrl.endsWith('#goal-'+carbonyl.goalId)))
assert.equal(coordInput.reviewContext.page.visualization.originalDigest,'sha256:7c2c562d42d59480f71def10d700fd45fd885e1622a515ac171aff74dd0b003e')
const helperBindings=[]
for(const r of sidecar.nativeHelperBindings){const actual='sha256:'+createHash('sha256').update(await readFile(r.path)).digest('hex');assert.equal(actual,r.sha256);helperBindings.push({...r,currentBytesExact:true})}
await writeFile(own+'targeted-native-four-plus-one-preservation.actual.independent-b.json',JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Independent targeted native binding reproduction, not science or human approval',nativePreparedValidator:{four:'PASS',one:'PASS'},fullAtomPages:378,canonicalNodes:479,changedWholeGoalIdsV3:changedGoals,changedFullPageIdsV3:changedPages,other478WholeGoalsExactV3:true,other377FullPagesExactV3:true,all14OtherSelectedWholeGoalsAndPagesExactV3:true,protectedRows,witnessChecks,nativeFourInputChanges:inputChanges,reciprocalCarbonylCoordinateLinkNowOutsideBothBundles:true,helperBindings,currentHelperDeltaPreviouslyIndependentlyBound:true,sourceMetadataNotPhysicalWholeCourseApproval:true,newPositiveAuthorMaterialsRead:false,currentPeerResultsRead:false,activeWrites:false,strictNetGain:0,humanApproval:false,humanTrial:false},null,2)+'\n')
console.log(JSON.stringify({nativeFour:'PASS',nativeOne:'PASS',changedWholeGoals:changedGoals.length,changedFullPages:changedPages.length,otherFullPagesExact:377,protected112:112,witnessSetsExact:15,actualCarbonylCoordinateOutsideLinks:'PASS'}))
