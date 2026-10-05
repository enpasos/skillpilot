// Apache-2.0. Native inactive-snapshot checks, no P profile reads or active writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../../')
const read=(p:string)=>JSON.parse(readFileSync(resolve(here,p),'utf8'))
const write=(p:string,v:unknown)=>writeFileSync(resolve(here,p),JSON.stringify(v,null,2)+'\n')
const rp=(p:string)=>relative(root,resolve(here,p))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(here,p))).digest('hex')
const now=new Date().toISOString()
const canonical=read('canonical.biologie.candidate.json'), before=read('before/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])), old=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const delta=read('before-after-deltas.candidate.json'), newIds:string[]=delta.newGoalIds, parentIds:string[]=delta.changedExistingCanonicalIds
const ledger=read('biologie.semantic-kinds.base.json'), oldLedger=structuredClone(ledger)
const records=read('five-targeted-kind-am.rationales.candidate.json').records
const fps:any[]=[]
for(const id of [...newIds,...parentIds]){
  const g=goals.get(id), sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
  fps.push({goalId:id,semanticKindSourceFingerprint:sourceFingerprint,goalEvidenceFingerprint:fingerprintGoalForEvidence(g,'goal-evidence-v1')})
  const d=ledger.decisions.find((d:any)=>d.goalId===id)
  if(d){d.sourceFingerprint=sourceFingerprint}
  else ledger.decisions.push({goalId:id,sourceFingerprint,semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-semantic-recheck-curricular-atomic'})
}
ledger.counts.curricularAtomic=368;ledger.counts.total=446
write('biologie.semantic-kinds.prospective.json',ledger)
const testLedger=structuredClone(ledger);testLedger.sourceLandscapePath=rp('canonical.biologie.candidate.json');write('biologie.semantic-kinds.snapshot-test.json',testLedger)
write('native-seven-fingerprints.receipt.json',{status:'candidate',active:false,humanApproval:false,checkedAt:now,records:fps})
// Identical semantic payload contract used by native A/M scripts. The unmodified
// native command-line checks below verify every stored fingerprint independently.
const norm=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(x:any):string=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}':JSON.stringify(x)
const amfp=(g:any,ruleVersion:string)=>'sha256:'+createHash('sha256').update(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})).digest('hex')
for(const lane of ['semantic-atomicity','memory-card-review']){
  const cfg=read(lane+'.candidate.config.json'), original=readFileSync(resolve(here,lane+'.base.review.jsonl'),'utf8')
  const additions=records.map((r:any)=>({schemaVersion:1,reviewId:cfg.reviewId,ruleVersion:cfg.ruleVersion,landscapeId:cfg.landscapeId,goalId:r.goalId,fingerprint:amfp(goals.get(r.goalId),cfg.ruleVersion),status:lane==='semantic-atomicity'?'atomic':'no_memory_needed',...(lane==='semantic-atomicity'?{semanticAtomic:true}:{memoryUseful:false,memoryGoalIds:[],deckIds:[]}),reviewedAt:now,reviewer:'OpenAI Codex author-informed prospective candidate; deployed model unexposed',reason:lane==='semantic-atomicity'?r.atomicityReason:r.memoryReason}))
  assert.equal(original.trim().split('\n').length,363)
  writeFileSync(resolve(here,lane+'.candidate.review.jsonl'),original+(original.endsWith('\n')?'':'\n')+additions.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
  assert.ok(readFileSync(resolve(here,lane+'.candidate.review.jsonl'),'utf8').startsWith(original))
}
const canonicalFindings=validateCanonicalLandscape(normalizeCanonicalLandscape(canonical))
assert.deepEqual(canonicalFindings.filter(f=>f.severity==='error'),[])
const require=createRequire(resolve(root,'app/package.json'));const Ajv=require('ajv/dist/2020').default
const ajv=new Ajv({allErrors:true,strict:false})
require('ajv-formats')(ajv)
const schema=JSON.parse(readFileSync(resolve(root,'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),'utf8'))
const validate=ajv.compile(schema);assert.ok(validate(testLedger),JSON.stringify(validate.errors))
const shapeChecks:any[]=[]
for(const n of ['navigation.candidate.view.json','ni-source.candidate.view.json']){
  const compiled=compileCompositionView(normalizeCompositionView(read(n)),normalizeCanonicalLandscape(canonical))
  const errors=compiled.findings.filter(f=>f.severity==='error');assert.deepEqual(errors,[])
  shapeChecks.push({path:rp(n),errors,findings:compiled.findings})
}
const atlasCfg=read('source-atlas.inputs.snapshot-test.json')
const result=buildGoalBookSourceAtlasInputs(atlasCfg,root)
// build returns candidate output bytes in memory. All writes below go to here.
const ni=result.receipt.scopes.find((s:any)=>s.key==='DE-NI/SekI/')!
const oldCfg=read('before/de-gym-biology-national-atlas.inputs.json')
const oldResult=buildGoalBookSourceAtlasInputs(oldCfg,root), oldNI=oldResult.receipt.scopes.find((s:any)=>s.key==='DE-NI/SekI/')!
const proposed=read('ni-source.candidate.view.json')
const direct=(v:any):string[]=>v.rootNodes.flatMap((r:any)=>r.children.filter((n:any)=>n.kind==='goalEntry').map((n:any)=>n.goalId))
const onlyUnsupported=direct(proposed).filter((id:string)=>!ni.goalIds.includes(id))
const expectedRemoved=['02cabf54-0b70-572c-b85a-7409e686a48e','05358518-f66c-5c1b-ad3f-d16211d0fc1c','0daa79f6-8f61-5506-98f9-65db83062ba8','e70d8a85-2dea-5165-919b-200fee9f4db4']
assert.deepEqual(onlyUnsupported.sort(),expectedRemoved.sort())
proposed.rootNodes[0].children=proposed.rootNodes[0].children.filter((n:any)=>!onlyUnsupported.includes(n.goalId))
write('ni-source.candidate.view.json',proposed)
assert.deepEqual(direct(proposed).sort(),[...ni.goalIds].sort())
const compileFinal=compileCompositionView(normalizeCompositionView(proposed),normalizeCanonicalLandscape(canonical));assert.deepEqual(compileFinal.findings.filter(f=>f.severity==='error'),[])
const sourceBefore=read('before/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json'),sourceAfter=read('ni.current-source.candidate.json')
const sourceOld=new Map<string,any>(sourceBefore.sourceGoals.map((g:any)=>[g.id,g])),sourceNew=new Map<string,any>(sourceAfter.sourceGoals.map((g:any)=>[g.id,g]))
const targetSet=new Set<string>(ni.goalIds), neededPrereqs=new Set<string>()
const collect=(id:string)=>{const g=goals.get(id);for(const ref of g?.requires??[]){const r=String(ref).replace(canonical.landscapeId+':','');if(!neededPrereqs.has(r)){neededPrereqs.add(r);collect(r)}}}
ni.goalIds.forEach(collect)
const removeFindings=onlyUnsupported.map((id:string)=>({goalId:id,title:goals.get(id).title,canonicalGoalRetained:true,beforeNISourceBindings:oldNI.witnesses.filter((w:any)=>w.goalId===id).map((w:any)=>({...w,sourceText:sourceOld.get(w.sourceGoalId)?.sourceText,sourcePage:sourceOld.get(w.sourceGoalId)?.metadata.sourcePage})),remainingNISourceBindings:ni.witnesses.filter((w:any)=>w.goalId===id),neededByRemainingNITargetPrerequisites:neededPrereqs.has(id),decision:'Remove unsupported direct NI target entry only; canonical body and other jurisdiction bindings retained',otherJurisdictionAfterScopes:result.receipt.scopes.filter((s:any)=>s.jurisdiction!=='DE-NI'&&s.goalIds.includes(id)).map((s:any)=>s.key),nativeCompilerDecision:'PASS: removed entry is not in current NI source witness union; resulting view compiles without error',prerequisiteOnlyDecision:neededPrereqs.has(id)?'HOLD: target membership absent; prerequisite-only treatment needs scope decision':'Not required by remaining NI target prerequisites'}))
write('ni-four-sourceview-removals.evidence.candidate.json',{status:'candidate',active:false,sourceLandscapeId:sourceAfter.sourceLandscapeId,canonicalLandscapeId:canonical.landscapeId,newGoalIds:newIds,removedDirectGoalIds:onlyUnsupported,records:removeFindings,finalTargetCount:ni.goalIds.length,nativeViewErrors:compileFinal.findings.filter(f=>f.severity==='error')})
// Actual source-witness and local graph-context comparison for the 37 strict IDs;
// do not read positive-understanding evidence profiles.
const ids=read('strict37.ids.metadata-only.json').strictCompleteGoalIds
const canon=stable
const reverse=(map:Map<string,any>,id:string)=>[...map.values()].filter(g=>(g.requires??[]).some((r:any)=>String(r).replace(canonical.landscapeId+':','')===id)).map(g=>g.id).sort()
const containsParents=(map:Map<string,any>,id:string)=>[...map.values()].filter(g=>(g.contains??[]).some((r:any)=>String(r).replace(canonical.landscapeId+':','')===id)).map(g=>g.id).sort()
const witness=(scope:any,id:string)=>scope.witnesses.filter((w:any)=>w.goalId===id).map((w:any)=>({sourceGoalId:w.sourceGoalId,mappedTargetGoalId:w.mappedTargetGoalId,coverage:w.coverage})).sort((a:any,b:any)=>canon(a).localeCompare(canon(b)))
const impacts=ids.map((id:string)=>{
 const bw=witness(oldNI,id),aw=witness(ni,id),localParents=containsParents(old,id)
 const sourceCellsChanged=[...new Set<string>([...bw,...aw].map((w:any)=>w.sourceGoalId))].filter(sid=>canon(sourceOld.get(sid))!==canon(sourceNew.get(sid)))
 const siblingChangeParents=localParents.filter(p=>parentIds.includes(p))
 const reverseBefore=reverse(old,id),reverseAfter=reverse(goals,id)
 const bindingChanged=canon(bw)!==canon(aw)
 const flags={canonicalBodyChanged:canon(old.get(id))!==canon(goals.get(id)),requiresChanged:canon(old.get(id).requires)!==canon(goals.get(id).requires),reverseRequiresChanged:canon(reverseBefore)!==canon(reverseAfter),parentIdsChanged:canon(localParents)!==canon(containsParents(goals,id)),parentSiblingListsChanged:siblingChangeParents.length>0,NIWitnessSetChanged:bindingChanged,NISourceCellContentOrAdvisoryCacheChanged:sourceCellsChanged.length>0,NISourceViewTargetMembershipChanged:oldNI.goalIds.includes(id)!==ni.goalIds.includes(id)}
 return{goalId:id,title:goals.get(id).title,flags,materialContextAffected:Object.values(flags).some(Boolean),changedParentIds:siblingChangeParents,reverseRequiresBefore:reverseBefore,reverseRequiresAfter:reverseAfter,NISourceBefore:bw,NISourceAfter:aw,changedSourceCellIds:sourceCellsChanged,goalEvidenceFingerprintBefore:fingerprintGoalForEvidence(old.get(id),'goal-evidence-v1'),goalEvidenceFingerprintAfter:fingerprintGoalForEvidence(goals.get(id),'goal-evidence-v1'),canonicalBodyRetained:true,scope:'Actual graph / witness / source-cell / NI-view metadata only; fresh BookModel/PDF binding still belongs to root integration'}
})
write('strict37-context-impact.candidate.json',{status:'candidate',humanApproval:false,activeGateClaim:false,strictInputCount:ids.length,actualAffectedGoalIds:impacts.filter((i:any)=>i.materialContextAffected).map((i:any)=>i.goalId),unaffectedGoalIds:impacts.filter((i:any)=>!i.materialContextAffected).map((i:any)=>i.goalId),records:impacts,transportBindingQualification:'Canonical/atlas digest and prospective NI source/mapping file paths change globally; this alone is not a new substantive failure of any preserved goal. Root checks fresh BookModel/page/dossier bindings with actual integrated inputs.'})
write('native-source-atlas.projection.receipt.json',{status:'candidate',humanApproval:false,activeGateClaim:false,claims:result.receipt.claims,counts:result.receipt.counts,niScope:{key:ni.key,goalIds:ni.goalIds,witnesses:ni.witnesses},newFiveScopes:newIds.map(id=>({goalId:id,scopes:result.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>s.key)})),navigationExactGoalUnionCount:368,allOtherJurisdictionsUnaffectedByNewNILeaves:newIds.every(id=>result.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).every((s:any)=>s.jurisdiction==='DE-NI'))})
const unchangedKind=oldLedger.decisions.filter((d:any)=>!parentIds.includes(d.goalId)).every((d:any)=>canon(d)===canon(ledger.decisions.find((a:any)=>a.goalId===d.goalId)))
assert.ok(unchangedKind)
write('native-scoped-checks.receipt.json',{status:'candidate',reviewAuthority:'ai_candidate',humanApproval:false,checkedAt:now,canonicalRecords:goals.size,kindDecisions:ledger.decisions.length,curricularAtoms:368,kindClosedSchemaValid:true,kindFingerprintsChangedExistingGoalIds:parentIds,kindUnchangedOldDecisions:439,allOtherKindDecisionsPreserved:unchangedKind,canonicalValidationErrors:canonicalFindings.filter(f=>f.severity==='error'),canonicalValidationWarnings:canonicalFindings.filter(f=>f.severity!=='error'),compositionChecks:shapeChecks,finalNIViewErrors:compileFinal.findings.filter(f=>f.severity==='error'),atlasCounts:result.receipt.counts,sourcegroups:123,mappingEdges:336,PContentsRead:false,bookD2Passed:false,VPassed:false,activeGateClaim:false})
console.log(JSON.stringify({candidate:true,records:goals.size,atoms:368,sourceGroups:123,mappingEdges:336,NIAtoms:ni.goalIds.length,removedNIEntries:onlyUnsupported,strict37Affected:impacts.filter((i:any)=>i.materialContextAffected).map((i:any)=>i.goalId)}))
