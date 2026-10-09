// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
const root=resolve('.'), own=dirname(dirname(fileURLToPath(import.meta.url))),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const canonical=read(resolve(own,'candidate/canonical504-current26-resource-links.inactive.json')),goals=new Map(canonical.goals.map((g:any)=>[g.id,g])),kinds=read(resolve(own,'candidate/semantic-kinds.current504.technical-review-input.json'))
const byKind=new Map(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]));
const classifiedCanonical={...canonical,goals:canonical.goals.map((g:any)=>({...g,semanticKind:byKind.get(g.id)}))};
const atoms=new Set(kinds.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId))
const inputPath=resolve(own,'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json'),input=read(inputPath)
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const write=(p:string,v:any)=>{assert.ok(!existsSync(p),p);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n');return bind(p)}
const role=(view:any)=>collectCompositionProjectionRoleGoalIds(view.rootNodes,goals as any).targetGoalIds
const views=[],holds=[]
for(const viewId of [...new Set(input.entries.map((r:any)=>r.viewId))]){
 const rows=input.entries.filter((r:any)=>r.viewId===viewId),before=read(resolve(root,rows[0].beforeViewBinding.path)),candidate=structuredClone(before),beforeTargets=role(before),beforeAtoms=new Set([...beforeTargets].filter((i:any)=>atoms.has(i)))
 const removals=[],ownHolds=[]
 for(const row of rows){const sources=row.wholeOriginalSourceDutiesAndPartnerContexts
  const evidence=sources.map((s:any)=>{const partnerIds=s.wholePartnerGoals.map((g:any)=>g.id),atomicPartnerIds=partnerIds.filter((i:any)=>atoms.has(i)),existingAtomicPartnerIds=atomicPartnerIds.filter((i:any)=>beforeAtoms.has(i));return {sourceGoalId:s.wholeSourceGoal.id,wholeSourceText:s.wholeSourceGoal.sourceText,partnerIds,atomicPartnerIds,existingAtomicPartnerIds,allAtomicPartnersAlreadyTarget:atomicPartnerIds.every((i:any)=>beforeAtoms.has(i)),convertedPartnerFamilyIds:partnerIds.filter((i:any)=>!atoms.has(i))}})
  // Only a content redirection candidate where every actual original duty has an existing ordinary content atom.
  // No additional process-child claim, phase inference, source approval or denominator reduction.
  const reviewable=sources.length>0&&evidence.every((e:any)=>e.existingAtomicPartnerIds.length>0&&e.allAtomicPartnersAlreadyTarget)
  if(reviewable)removals.push({familyId:row.finding.goalId,nodePath:row.finding.nodePath,wholeOriginalSourceDutyCount:sources.length,actualExistingPartnerEvidence:evidence,authorCandidateReason:'The former generic atomic family is now a non-atomic descriptor. Its source rows here assert concrete chemical content; all corresponding existing content atoms remain target exactly. A new whole process-child/source claim is not derived from these content rows. Independent full source/operator and view review is required.'})
  else ownHolds.push({familyId:row.finding.goalId,nodePath:row.finding.nodePath,wholeOriginalSourceDutyCount:sources.length,evidence,reason:'At least one original duty lacks a present existing atomic content partner. Do not remove or expand this opaque family as a technical-only fix; exact process/content source completion or appropriate reviewed companion is required.'})
 }
 const removeSet=new Set(removals.map(r=>r.familyId));let changed=0
 const transform=(nodes:any[]):any[]=>nodes.flatMap(n=>{if(n.kind==='goalEntry'&&removeSet.has(n.goalId)){changed++;return []}return [{...n,...(n.children?{children:transform(n.children)}:{})}]})
 candidate.rootNodes=transform(candidate.rootNodes);assert.equal(changed,removals.length)
 const afterTargets=role(candidate),afterAtoms=new Set([...afterTargets].filter((i:any)=>atoms.has(i)))
 assert.deepEqual([...afterAtoms].sort(),[...beforeAtoms].sort());assert.deepEqual(candidate.scope,before.scope)
 const findings=compileCompositionView(candidate,classifiedCanonical).findings,beforeFindings=compileCompositionView(before,classifiedCanonical).findings
 const beforeErrors=beforeFindings.filter((f:any)=>f.severity==='error'),afterErrors=findings.filter((f:any)=>f.severity==='error')
 assert.equal(beforeErrors.length-afterErrors.length,changed)
 const p=resolve(own,'source-view-author/partner-preserving-view-candidates/'+viewId+'.author-candidate.json'),binding=write(p,candidate)
 views.push({viewId,scope:before.scope,beforeBinding:bind(resolve(root,rows[0].beforeViewBinding.path)),candidateBinding:binding,onlyCandidateNodeRemovals:removals,unresolvedWholeDutyNodes:ownHolds,removedOpaqueNodes:changed,beforeNormalErrors:beforeErrors,afterNormalErrors:afterErrors,actualBeforeAtomicTargetIds:[...beforeAtoms].sort(),actualAfterAtomicTargetIds:[...afterAtoms].sort(),atomicTargetsValueExact:true,newAtomicTargets:[],lostExistingAtomicTargets:[],sourceOperatorApproval:false,viewApproval:false})
 holds.push(...ownHolds.map(h=>({viewId,...h})))
}
const complete=views.filter(v=>v.afterNormalErrors.length===0),pending=views.filter(v=>v.afterNormalErrors.length>0)
const out=resolve(own,'source-view-author/partner-preserving-view-candidates.actual-normal-proof.json');write(out,{schemaVersion:1,role:'Concrete normal composition view author candidates for demonstrably content-only legacy family references; no independent curriculum source/view decision',wholeInput:bind(inputPath),views,reviewableStructurallyValidViewCount:complete.length,remainingViewHoldCount:pending.length,removedOpaqueEntryCount:views.reduce((n,v)=>n+v.removedOpaqueNodes,0),remainingOpaqueEntryCount:holds.length,originalWholeDutiesAndPartnersRetainedInInput:true,allOtherNodeObjectsExactlyPreserved:true,allExistingAtomicTargetSetsExact:true,sourceWholeHolds:holds,ordinaryCompilerUnchanged:true,qualityLimitsUnchanged:true,sourceOperatorApproval:false,activeWrites:[],strictGain:0,newScientificClosures:0,restoredBindings:0,humanApproval:false})
console.log(JSON.stringify({removedOpaqueEntries:views.reduce((n,v)=>n+v.removedOpaqueNodes,0),remainingOpaqueEntries:holds.length,actualNormalErrorFreeViews:complete.length,remainingViews:pending.length,actualExistingTargetSetsExact:true,newOrLostAtoms:0,sourceViewApproval:false,strictGain:0}))
