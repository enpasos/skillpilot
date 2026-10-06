// SPDX-License-Identifier: Apache-2.0
// Native author-candidate simulation. No operative source/QA authority is created.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..')
const rel=here.slice(root.length+1), read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const out=(p:string,v:any)=>writeFileSync(resolve(here,p),JSON.stringify(v,null,2)+'\n')
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const meta=read(rel+'/prospective-paths.json'),canon=read(meta.canonicalPath),baseline=read(rel+'/baseline.canonical.actual.snapshot.json')
const originalLedger=read('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
const ledger=structuredClone(originalLedger),existing=new Map(ledger.decisions.map((d:any)=>[d.goalId,d]))
const changed:any[]=[]
for (const g of canon.goals) {
  const prior:any=existing.get(g.id), fingerprint=fingerprintSemanticKindSourceGoal(g)
  if (prior) { if(prior.sourceFingerprint!==fingerprint){changed.push({goalId:g.id,before:prior.sourceFingerprint,after:fingerprint});prior.sourceFingerprint=fingerprint} }
  else {
    const semanticKind=meta.newMemoryGoalIds.includes(g.id)?'memory':g.id===meta.supplementId?'curricularArea':'curricularAtomic'
    // Closed native schema shape only. This dossier expressly withholds operative authority.
    const decisionBasis=semanticKind==='memory'?'reviewed-current-pilot-memory':semanticKind==='curricularArea'?'reviewed-current-post-split-curricular-area':'reviewed-current-post-split-curricular-atomic'
    ledger.decisions.push({goalId:g.id,sourceFingerprint:fingerprint,semanticKind,decisionStatus:'authoritative',decisionBasis})
  }
}
ledger.sourceLandscapePath=meta.canonicalPath
ledger.counts=Object.fromEntries(Object.keys(originalLedger.counts).filter(k=>k!=='total').map(k=>[k,0]));for(const d of ledger.decisions)ledger.counts[d.semanticKind]=(ledger.counts[d.semanticKind]??0)+1
ledger.counts.total=ledger.decisions.length
out('semantic-kinds.native-shape.inactive.snapshot.json',ledger)
const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(canon)).filter((d:any)=>d.severity==='error');assert.deepEqual(diagnostics,[])
const prep=prepareLandscapeEntries([canon])[0], strip=(id:string)=>id.startsWith(canon.landscapeId+':')?id.slice(canon.landscapeId.length+1):id
const prepared=new Map<string,any>(prep.goals.map((g:any)=>[strip(g.id),{...g,eff:(g.effectiveRequires??[]).map(strip)}]))
const done=new Set<string>(),open=new Set<string>()
const visit=(id:string,path:string[])=>{assert(prepared.has(id),'missing effective prerequisite '+id);assert(!open.has(id),'cycle '+[...path,id]);if(done.has(id))return;open.add(id);for(const x of prepared.get(id).eff)visit(x,[...path,id]);open.delete(id);done.add(id)}
for(const id of prepared.keys())visit(id,[])
const trans=(id:string)=>{const all=new Set<string>();const walk=(x:string)=>{for(const q of prepared.get(x)?.eff??[])if(!all.has(q)){all.add(q);walk(q)}};walk(id);return [...all]}
const forbidden=['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2']
const affected=[...meta.newOrdinaryGoalIds,...meta.newMemoryGoalIds,...meta.predecessorNI5GoalIds,'440854be-7f06-5678-91cb-ba8dcab56959']
const witnesses=affected.map((id:string)=>({goalId:id,effectiveRequires:trans(id),molecularScopeIntrusion:trans(id).filter(q=>forbidden.includes(q))}))
assert(witnesses.every((w:any)=>w.molecularScopeIntrusion.length===0),'NI SekI molecular scope intrusion')
const oldGoals=new Map(baseline.goals.map((g:any)=>[g.id,g])),oldDeltas=canon.goals.filter((g:any)=>oldGoals.has(g.id)&&JSON.stringify(oldGoals.get(g.id))!==JSON.stringify(g)).map((g:any)=>({goalId:g.id,before:oldGoals.get(g.id),after:g}))
assert.equal(oldDeltas.length,2);assert(oldDeltas.some((d:any)=>d.goalId==='440854be-7f06-5678-91cb-ba8dcab56959'))
const nativeRoot=meta.nativeInputRoot
const config=readGoalBookSourceAtlasInputConfig(meta.atlasConfigPath,nativeRoot),atlas=buildGoalBookSourceAtlasInputs(config,nativeRoot)
for(const [p,bytes]of Object.entries(atlas.outputs)){assert(p.startsWith('app/scripts/config/goal-books/'));mkdirSync(dirname(resolve(nativeRoot,p)),{recursive:true});writeFileSync(resolve(nativeRoot,p),bytes)}
const loaded=await loadGoalBookBuildInputs(rel+'/book.config.json',nativeRoot)
out('prospective-full.book-model.json',loaded.model)
const original=buildGoalBookOriginalSources(loaded.model,nativeRoot,config.mappingPaths)
out('actual-original-sources.current-selected.snapshot.json',original)
out('native-author.actual.receipt.json',{status:'inactive_native_author_simulation_pass',candidateOnly:true,humanApproval:false,activeWrites:false,canonicalGoals:canon.goals.length,prospectiveCurricularAtomic:ledger.counts.curricularAtomic,newOrdinary:meta.newOrdinaryGoalIds.length,newMemory:meta.newMemoryGoalIds.length,predecessorNI5:5,diagnostics,effectivePrerequisiteCycles:0,prerequisiteWitnesses:witnesses,changedExistingGoals:oldDeltas,changedExistingKindFingerprints:changed,allOtherOriginalKindRowsUnchanged:true,sourceAtlasCounts:atlas.receipt.counts,selectedMappingPaths:config.mappingPaths,inputDigests:{canonical:hash(meta.canonicalPath),mapping:hash(meta.sourceMappingPath),source:hash(meta.sourceExtractionPath)},missingNewVisualizationCount:meta.newOrdinaryGoalIds.filter((id:string)=>!canon.goals.find((g:any)=>g.id===id)?.resourceLinks?.some((l:any)=>l.type==='goal-visualization'&&l.role==='primary')).length,currentNewVisualizationApprovals:0,newVisualizationCandidateCount:13,independentNativeDescriptionReviews:'pending',sourceCoverageApproved:false,currentStrictNetIncrease:0})
console.log(JSON.stringify({canonical:canon.goals.length,atoms:ledger.counts.curricularAtomic,sourceAtlas:atlas.receipt.counts,effectiveCycles:0,oldGoalDeltas:oldDeltas.length,newScienceClosure:0,humanApproval:false}))
