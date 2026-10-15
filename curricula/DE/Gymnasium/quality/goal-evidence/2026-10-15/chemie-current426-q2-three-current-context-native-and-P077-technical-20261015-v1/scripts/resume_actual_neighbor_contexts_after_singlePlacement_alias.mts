// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const repo=process.cwd(), own=resolve(process.argv[2])
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const ref=(p:string)=>{const b=readFileSync(resolve(repo,p));return {path:p,sha256:`sha256:${createHash('sha256').update(b).digest('hex')}`,bytes:b.length}}
const put=(p:string,x:any)=>{const a=resolve(repo,p);assert.ok(!existsSync(a));mkdirSync(dirname(a),{recursive:true});writeFileSync(a,JSON.stringify(x,null,2)+'\n')}
const relative=(p:string)=>p.slice(repo.length+1)
const p=read(relative(resolve(own,'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json')))
const f=read(relative(resolve(own,'INPUTS.final-six-stable-bodies-images-and-successor-material.json')))
const host=resolve(repo,f.executionHost), stock=async(n:string)=>import(pathToFileURL(resolve(host,'app/scripts',n+'.ts')).href)
const {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson}=await stock('goalBookModel')
const {fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,fingerprintGoalForPositiveEvidence}=await stock('positiveGoalEvidenceProfileModel')
const {loadGoalDescriptionRolloutBatchConfig,buildGoalDescriptionRolloutSubsetModel}=await stock('materializeGoalDescriptionRolloutBatch')
const {fingerprintGoalDescriptionReviewPage}=await stock('validateGoalDescriptionDualRoundResolution')
const canonical=read(f.canonical.path), by=new Map(canonical.goals.map((g:any)=>[g.id,g])) as Map<string,any>
const profiles=readFileSync(resolve(repo,f.finalBookProfilesPath),'utf8').trim().split('\n').map((line:string)=>JSON.parse(line))
const pcfgpath=relative(resolve(own,'config/P11.only077-image-input-transport.normal.config.json'))
const loaded=await loadGoalDescriptionRolloutBatchConfig(f.nativeConfig.path)
assert.deepEqual(loaded.config.goalIds,p.goalIds)
// Root specifically authorized this one read-only stock model call for actual neighbor-context fingerprints.
const base=await loadGoalBookBuildInputs(f.baseConfig.path)
assert.equal(base.model.pages.length,426)
const changedTargets=new Set(p.Q2GoalIds)
const audits=[]
const scopeCache=new Map<string,any>()
for(const owner of p.affectedOrImmediateCurrentDOwners){
 const oldInput=read(owner.groupDirectory+'/round-a/description-review-input.json')
 const old=oldInput.goals.find((g:any)=>g.goalId===owner.goalId)
 const bundle=read(owner.groupDirectory+'/round-a/review-bundle-manifest.json')
 const selectedIds=oldInput.goals.map((g:any)=>g.goalId)
 const cacheKey=JSON.stringify(selectedIds)
 let subset=scopeCache.get(cacheKey)
 if(!subset){subset=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:selectedIds,bookId:bundle.bookId,title:'Read-only same-scope actual context fingerprint audit'});scopeCache.set(cacheKey,subset)}
 const current=subset.pages.find((g:any)=>g.goalId===owner.goalId)
 assert.ok(current)
 const relationFields=['requires','reverseRequires','externalPrerequisites','externalReverseRequires']
 const relationChanges=relationFields.filter(k=>stableGoalBookJson(old.reviewContext.page[k])!==stableGoalBookJson(current[k]))
 const causalQ2Changes=relationFields.flatMap(k=>{
   const before=new Set(old.reviewContext.page[k].map((r:any)=>r.goalId));const after=new Set(current[k].map((r:any)=>r.goalId))
   return [...changedTargets].filter(id=>before.has(id)!==after.has(id)).map(goalId=>({field:k,goalId,before:before.has(goalId),after:after.has(goalId)}))
 })
 const relationshipOnly={...old.reviewContext.page}
 for(const k of relationFields)relationshipOnly[k]=current[k]
 const relationshipOnlyPageFingerprint=fingerprintGoalDescriptionReviewPage(relationshipOnly)
 const ownCanonicalContextChanges=['requires','contains','examples'].filter(k=>stableGoalBookJson(old.canonicalContext[k])!==stableGoalBookJson(by.get(owner.goalId)[k]??[]))
 audits.push({goalId:owner.goalId,currentOwnDIndex:owner.index,currentOwnResolution:owner.resolution,
  oldInput:ref(owner.groupDirectory+'/round-a/description-review-input.json'),oldPageFingerprint:old.pageFingerprint,
  actualCurrentSameScopePageFingerprint:current.pageFingerprint,relationOnlyPageFingerprint,
  exactOldPage:old.reviewContext.page,actualCurrentSameScopePage:current,
  changedRelationFields:relationChanges,causalQ2RelationshipChanges:causalQ2Changes,ownCanonicalContextChanges,
  strictlyPreviouslyClaimedClosed:read(owner.resolution.path).status==='resolved',
  requiresGenuineCurrentNeighborContextSight:causalQ2Changes.length>0&&relationshipOnlyPageFingerprint!==old.pageFingerprint})
}
const neighbours=audits.filter((a:any)=>!p.goalIds.includes(a.goalId)&&a.requiresGenuineCurrentNeighborContextSight)
const out=relative(resolve(own,'checks/ACTUAL.current-neighbor-page-context-fingerprints.read-only.json'))
put(out,{schemaVersion:1,role:'One read-only stock model load, original-campaign-scope stock subset projection; no D judgment or fingerprint rewrite',canonical:f.canonical,baseBookDigest:base.model.digest,fullModelFileWritten:false,fullModelRenders:0,current426Denominator:426,selectedSixGoalIds:p.goalIds,actualComparedDOwners:audits,smallestQ2CausalNeighborSightGoalIds:neighbours.map((a:any)=>a.goalId),noDescriptionRecordWrites:true,noncausalProfileOrOrderingChangesDoNotExpandScope:true})
put(relative(resolve(own,'checks/PREFLIGHT.actual-native6-closed-config-model-and-profile-bindings.json')),{schemaVersion:1,closedConfigValidation:'PASS',actualStockFullAtomicBasePages:426,actualStockSelectedSubsetPages:buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:p.goalIds,bookId:loaded.config.bookId,title:loaded.config.title}).pages.length,bookCandidateProfiles:profiles.map((r:any)=>({goalId:r.goalId,status:r.status,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope})),P077Config:ref(pcfgpath),profileNullFor0bAndF4:true,profileBriefB47LiteralFinalMaterial:true,explicitFullModelExports:0,renders:0})
console.log(JSON.stringify({semanticSourceFPRefresh:3,semanticDecisionsUnchanged:570,P077OnlyField:'reviewInputFingerprint',otherTenPLinesExact:true,NativeConfig:'PASS',currentAtomicBase:426,actualNeighborPageSightIds:neighbours.map((a:any)=>a.goalId),actualNeighborContextAudit:out,fullModelFileWritten:false}))
