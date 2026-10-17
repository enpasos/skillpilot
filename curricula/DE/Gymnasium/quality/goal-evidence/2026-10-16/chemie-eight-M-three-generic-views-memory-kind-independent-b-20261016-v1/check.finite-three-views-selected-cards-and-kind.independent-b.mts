// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const A=`${E}/chemie-eight-M-visibility-three-generic-views-one-memory-metadata-author-successor-20261016-v1`
const O=`${E}/chemie-eight-M-three-generic-views-memory-kind-independent-b-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const pin=(p:string)=>({path:p,sha256:sha(p),bytes:readFileSync(p).length})
const rows=(p:string)=>readFileSync(p,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l))
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const firstPath=`${O}/FIRST.three-generic-views-one-memory-kind.independent-b.science.json`
assert.equal(sha(firstPath),'sha256:f511c6b7e8267df4189a4859103c532e9c69a05352450fb68e010cfd2bc8a2fe')
const selectorPath=`${A}/OUTPUTS.three-view-one-memory-metadata.AUTHOR.inactive.selector.json`
assert.equal(sha(selectorPath),'sha256:8c41a2ea8867555907100e27eaebb656afbb27d49aa185b973db9cfb4ddf2b83')
const selector=read(selectorPath)
for(const key of ['wholeViewCAS','wholeMemoryMetadataCAS','primarySourceWholeObjects','cardsOriginsAndCurrentRecords'])assert.equal(sha(selector[key].path),selector[key].sha256)
const views=read(selector.wholeViewCAS.path),mc=read(selector.wholeMemoryMetadataCAS.path),input=read(selector.cardsOriginsAndCurrentRecords.path),source=read(selector.primarySourceWholeObjects.path)
assert.equal(views.operations.length,3);assert.equal(mc.operations.length,1)
const canonicalPath=`${K}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
assert.equal(sha(canonicalPath),selector.baselineCanonicalSHA256)
const l=read(canonicalPath),byBefore=new Map<string,any>(l.goals.map((g:any)=>[g.id,g])),byAfter=new Map(byBefore)
const op=mc.operations[0],memoryId='277af899-aec7-5b27-aab7-de67c0f45dbe';assert.equal(op.goalId,memoryId)
assert.deepEqual(byBefore.get(memoryId),op.beforeWhole)
const expected=structuredClone(op.beforeWhole)
expected.applicability.courseProfile=['GK','LK'];expected.extendedData.authoredMemoryAcquisitionScopes=op.afterWhole.extendedData.authoredMemoryAcquisitionScopes
assert.deepEqual(expected,op.afterWhole);assert.equal(expected.extendedData.authoredMemoryAcquisitionScopes.length,3)
assert.deepEqual(expected.extendedData.authoredMemoryAcquisitionScopes[0],op.beforeWhole.extendedData.authoredMemoryAcquisitionScopes[0])
assert.deepEqual(expected.applicability.jurisdiction,['DE-BY'])
byAfter.set(memoryId,op.afterWhole)
const afterLandscape={...l,goals:l.goals.map((g:any)=>g.id===memoryId?op.afterWhole:g)}
for(const g of input.wholeMemoryGoals)assert.deepEqual(g,byBefore.get(g.id))
for(const g of input.wholeCurrentOrdinaryOrigins)assert.deepEqual(g,byBefore.get(g.id))
assert.deepEqual(source.ordinary3bcWholeUnchanged,byBefore.get('3bc48951-025c-5144-99b1-924db611a5f9'))
assert.equal(sha(source.sourceExtraction.path),source.sourceExtraction.sha256)
assert.equal(sha(source.mappingInput.path),source.mappingInput.sha256)
const sourceExtraction=read(source.sourceExtraction.path)
for(const g of source.actualWholeSourceGoals)assert.deepEqual(sourceExtraction.sourceGoals.find((s:any)=>s.id===g.id),g)
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const {fingerprintSemanticKindSourceGoal:kindFp}=await import(`${K}/app/scripts/goalBookModel.ts`)
const config=read(`${K}/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json`)
const ledgerRows=rows(`${K}/${config.reviewPath}`),cardRows=rows(`${K}/${config.cardReviewPath}`)
for(const r of input.actualWholeCurrentMRecords)assert.deepEqual(ledgerRows.find((x:any)=>x.goalId===r.goalId),r)
for(const r of input.actualWholeKeptCardReviews)assert.deepEqual(cardRows.find((x:any)=>x.cardId===r.cardId&&x.deckId===r.deckId),r)
const drillPath=`${K}/app/src/components/srs/FlashcardDrill.tsx`,drill=readFileSync(drillPath,'utf8')
const fragment=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/);assert.ok(fragment)
const predicate=new Function('card','filterTags',`return ${fragment[1]}`)
const expectedCards:Record<string,string[]>={
 '567b5b63-8cc5-562f-85d1-13e2bbda9b54':['chem_org_q1_005','chem_org_q1_006'],
 '98781dda-8049-5173-899b-42a5c2902b86':['chem_org_q1_002'],
 [memoryId]:['chem_bond_008'],
}
const selections=input.wholeMemoryGoals.map((g:any)=>{
 const after=byAfter.get(g.id),deckPath=`${K}/app/public${after.extendedData.vocabularySource}`,deck=read(deckPath),tags=getSrsFilterTags(after.tags)
 const selected=deck.cards.filter((c:any)=>predicate(c,tags));assert.deepEqual(selected.map((c:any)=>c.id),expectedCards[g.id])
 const evidence=input.deckAndWholeCardEvidence.find((e:any)=>e.public.path===deckPath.replace(resolve('.')+'/', ''))??input.deckAndWholeCardEvidence.find((e:any)=>e.public.path.endsWith(after.extendedData.vocabularySource))
 assert.ok(evidence);assert.equal(sha(evidence.public.path),evidence.public.sha256);assert.equal(sha(evidence.canonical.path),evidence.canonical.sha256);assert.equal(sha(evidence.public.path),sha(evidence.canonical.path))
 for(const card of selected){assert.deepEqual(evidence.wholeSelectedCards.find((c:any)=>c.id===card.id),card);const cr=cardRows.find((r:any)=>r.cardId===card.id&&r.deckId===evidence.deckId);assert.equal(cr?.status,'kept');assert.equal(cr.necessary,true);for(const origin of cr.originGoalIds){assert.ok(card.tags.includes(`goal:${origin}`));assert.equal(ledgerRows.find((r:any)=>r.goalId===origin)?.status,'memory_required')}}
 assert.deepEqual(after.tags,g.tags);assert.deepEqual(after.requires,g.requires)
 return {memoryGoalId:g.id,filterTags:tags,selectedWholeCards:selected,deck:pin(evidence.canonical.path),publicDeck:pin(evidence.public.path),currentAcquisitionPrerequisites:after.requires}
})
const withoutNewEntries=(x:any,ids:Set<string>):any=>Array.isArray(x)?x.filter(n=>!(n?.kind==='goalEntry'&&ids.has(n.goalId)&&n.projectionRole==='target')).map(n=>withoutNewEntries(n,ids)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,withoutNewEntries(v,ids)])):x
const viewChecks=[];let restoredCount=0,newMemoryEntries=0
for(const vop of views.operations){
 assert.deepEqual(read(`${K}/${vop.viewPath}`),vop.beforeWhole);assert.equal(sha(`${K}/${vop.viewPath}`),vop.beforeFileSHA256)
 assert.deepEqual(withoutNewEntries(vop.afterWhole,new Set(vop.appendTargetMemoryGoalIds)),vop.beforeWhole)
 assert.ok(!vop.afterWhole.scope.jurisdiction)
 const br=roles(vop.beforeWhole.rootNodes,byBefore),ar=roles(vop.afterWhole.rootNodes,byAfter)
 const actual=(r:any,by:Map<string,any>)=>new Set<string>([...r.targetGoalIds].filter((id:any)=>by.has(id)&&goalMatchesFilters(convertLearningGoal(by.get(id),{landscapeId:l.landscapeId}),[vop.afterWhole.scope.courseProfile])))
 const before=actual(br,byBefore),after=actual(ar,byAfter),added=[...after].filter(id=>!before.has(id)).sort()
 assert.deepEqual(added,vop.appendTargetMemoryGoalIds.slice().sort());assert.deepEqual([...before].filter(id=>!after.has(id)),[])
 assert.ok(added.every(id=>byAfter.get(id).nodeKind==='memory'));newMemoryEntries+=added.length
 const ordinary=(ids:Set<string>)=>[...ids].filter(id=>byAfter.get(id).nodeKind!=='memory').sort()
 assert.deepEqual(ordinary(before),ordinary(after));assert.deepEqual([...br.prerequisiteOnlyGoalIds].sort(),[...ar.prerequisiteOnlyGoalIds].sort())
 const permitted=(id:string)=>after.has(id)||ar.prerequisiteOnlyGoalIds.has(id)
 const selectedAcquisitions=added.map(id=>({memoryGoalId:id,prerequisites:byAfter.get(id).requires.map((p:string)=>({goalId:p,title:byAfter.get(p).title,role:after.has(p)?'target':ar.prerequisiteOnlyGoalIds.has(p)?'prerequisiteOnly':'missing'}))}))
 assert.ok(selectedAcquisitions.every(x=>x.prerequisites.every((p:any)=>p.role!=='missing')))
 const intersectionChecks=input.actualWholeCurrentMRecords.filter((r:any)=>after.has(r.goalId)).map((r:any)=>{
  const b=r.memoryGoalIds.filter((id:string)=>before.has(id)),a=r.memoryGoalIds.filter((id:string)=>after.has(id));assert.ok(a.length)
  if(!b.length)restoredCount++
  return {ordinaryGoalId:r.goalId,beforeVisibleReferencedMemoryGoalIds:b,afterVisibleReferencedMemoryGoalIds:a,restored:!b.length}
 })
 if(vop.afterWhole.scope.courseProfile==='GK')for(const id of ['cc5a626a-dc85-57e2-b422-259f92901545','f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'])assert.ok(!after.has(id))
 assert.deepEqual(compileCompositionView(vop.afterWhole,afterLandscape).findings.filter((f:any)=>f.severity==='error'),[])
 viewChecks.push({viewPath:vop.viewPath,beforeSHA256:sha(`${K}/${vop.viewPath}`),scope:vop.afterWhole.scope,onlyExactNewGoalEntries:true,newExistingMemoryTargets:added,ordinaryTargetSetExact:true,prerequisiteOnlySetExact:true,actualAcquisitionRoles:selectedAcquisitions,currentOriginMemoryIntersections:intersectionChecks,compilerErrors:0})
}
assert.equal(newMemoryEntries,6);assert.equal(restoredCount,8)
const beforeKind=kindFp(op.beforeWhole),afterKind=kindFp(op.afterWhole);assert.notEqual(beforeKind,afterKind)
save('CHECK.actual-finite-three-views-cards-origins-and-same-kind.independent-b.json',{
 role:'Own actual finite stock checks after immutable scienceFIRST; only3views,3narrowMemory selections and supplied8ordinary/M/card origins; no39/global recheck',
 scienceFIRST:pin(firstPath),selector:pin(selectorPath),CAS:[pin(selector.wholeViewCAS.path),pin(selector.wholeMemoryMetadataCAS.path)],canonical:pin(canonicalPath),
 wholeMemoryMetadataOnly:true,oneChangedCanonicalMemoryId:memoryId,otherAuthorOperations:0,viewChecks,selections,
 newExistingMemoryTargetEntries:6,restoredOrdinaryMemoryVisibilityIntersections:8,newOrdinaryCompletionRequirements:0,
 wholeCardAndMRecordsExact:true,sourceOccurrenceWholeObjectsExact:true,unchangedBYJurisdiction:true,originalBYLKAcquisitionScopeExact:true,
 semanticKindCurrentJudgment:{goalId:memoryId,semanticKind:'memory',decision:'KEEP',beforeSourceFingerprint:beforeKind,afterSourceFingerprint:afterKind,sourceFingerprintChanged:true,wholeCurrentInformedJudgment:pin(firstPath),ordinaryOrOrientationOrAssessmentClaim:false,notHashOnlyScience:true},
 proofBoundary:'The source fingerprint changes because whole277 audit metadata changes; current same-kind decision was made independently in FIRST before this stock binding. Historical scientific records are untouched. GenericDE scope is no universal Bundesland course-duty claim. Card recall never creates ordinary mastery.',
 HumanApproval:false,HumanTrial:false,M7Claim:false,normalWrites:false,authorWrites:false
})
console.log(JSON.stringify({views:3,newExistingMemoryEntries:6,restoredMemoryIntersections:8,selectedCards:4,newOrdinaryCompletionRequirements:0,kind:'memory',stockKindFingerprintChanged:true,decision:'KEEP'}))
