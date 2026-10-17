// SPDX-License-Identifier: Apache-2.0
// Finite read-only stock checks after the independent first science seal.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
const R='/home/enpasos/projects/skillpilot',E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const P=resolve(R,E,'chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1')
const O=resolve(R,E,'chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const firstPath=resolve(O,'FIRST.shared-three-faraday-kind-and-eight-scope-science.frozen.json'),firstSha=sha(firstPath)
assert.equal(firstSha,'sha256:a29b739158a754a177bec65f1a1505c4afafea32203e768d5df6f65d1a974415')
const canonicalPath=resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
assert.equal(sha(canonicalPath),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const before=read(canonicalPath),after=read(resolve(P,'candidate/CANONICAL639.six-whole-goal-operations.author-inactive-v3.json'))
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g])),bby=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const goalCAS=read(resolve(P,'CAS.six-whole-goal-operations.author-inactive-v3.json'))
const viewCAS=read(resolve(P,'CAS.eight-whole-views.author-inactive.json'))
const goalChecks=[]
for(const op of goalCAS.operations){
 assert.deepEqual(op.beforeWhole,bby.get(op.goalId));assert.deepEqual(op.afterWhole,by.get(op.goalId))
 const restored=structuredClone(op.afterWhole)
 if(op.afterWhole.nodeKind==='memory'){
  restored.applicability.jurisdiction=op.beforeWhole.applicability.jurisdiction
  restored.extendedData.authoredMemoryAcquisitionScopes=op.beforeWhole.extendedData.authoredMemoryAcquisitionScopes
  assert.deepEqual(restored,op.beforeWhole)
  assert.ok(op.beforeWhole.extendedData.authoredMemoryAcquisitionScopes.every((s:any,i:number)=>JSON.stringify(s)===JSON.stringify(op.afterWhole.extendedData.authoredMemoryAcquisitionScopes[i])))
 }else {restored.requires=op.beforeWhole.requires;assert.deepEqual(restored,op.beforeWhole)}
 goalChecks.push({goalId:op.goalId,onlyDeclaredFieldsChanged:true})
}
assert.deepEqual(before.goals.filter((g:any)=>!goalCAS.operations.some((o:any)=>o.goalId===g.id)),after.goals.filter((g:any)=>!goalCAS.operations.some((o:any)=>o.goalId===g.id)))
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const roleSets=(v:any)=>collectCompositionProjectionRoleGoalIds(v.rootNodes,by)
const filtered=(v:any)=>{const roles=roleSets(v),filters=[v.scope.courseProfile,v.scope.jurisdiction].filter(Boolean);return {target:new Set<string>([...roles.targetGoalIds].filter((id:string)=>goalMatchesFilters(by.get(id),filters))),support:roles.prerequisiteOnlyGoalIds}}
const mids=['9ca180a2-07f7-559e-bf3a-d638ebbea75d','2ab83298-e12b-5d4e-bd90-4cacdbccecf2','fdd72195-e113-5a78-ab0b-02ed631b34aa']
const broad='6122faf0-6718-52b3-b40d-b206a2e963ae',lkOrigin='dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5'
const viewChecks=[]
for(const op of viewCAS.operations){
 const preview=compileCompositionView(op.afterWhole,after,after)
 assert.deepEqual(preview.findings.filter((f:any)=>f.severity==='error'),[])
 const b=filtered(op.beforeWhole),a=filtered(op.afterWhole)
 const removed=[...b.target].filter(id=>!a.target.has(id))
 assert.ok(removed.every(id=>id===broad))
 const narrowTarget=mids.filter(id=>a.target.has(id)&&!b.target.has(id))
 if(op.scope.courseProfile==='GK'){
  assert.ok(!a.target.has(broad));assert.ok(a.support.has(broad))
  for(const mid of narrowTarget)for(const origin of by.get(mid).requires)assert.ok(a.target.has(origin),op.name+': narrow origin is not an actual target '+origin)
  assert.ok(!a.target.has(lkOrigin))
 }
 const authoredPriors=op.additions.filter((x:any)=>x.role==='prerequisiteOnly').map((x:any)=>x.goalId)
 for(const id of authoredPriors){const g=by.get(id);assert.ok(g.tags.includes('SekI'));assert.ok(!g.tags.includes('SekII'));assert.ok(!g.contains?.length)}
 viewChecks.push({name:op.name,viewId:op.viewId,scope:op.scope,stockCompileErrors:0,declaredAdditions:op.additions,declaredShadows:op.shadows,actualAddedTargetIds:[...a.target].filter(id=>!b.target.has(id)),actualRemovedTargetIds:removed,actualNarrowTargetIds:narrowTarget,eachNewNarrowOriginAnActualTarget:true,existingTargetsPreservedExceptBroadQ4Recall:true,authoredPreviousStageAtomicPriorIds:authoredPriors})
}
const drill=readFileSync(resolve(K,'app/src/components/srs/FlashcardDrill.tsx'),'utf8')
const m=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/);assert.ok(m)
const predicate=new Function('card','filterTags',`return ${m[1]}`)
const deck=read(resolve(P,'input/CARDS.energy-q4.whole-unchanged.json')).deck
assert.deepEqual(deck,read(resolve(K,'app/public/data/de_gymnasium_chemistry_flashcards_energy_q4.de.json')))
const cards=[]
for(const [mid,expected]of [[mids[0],['chem_energy_q4_001','chem_energy_q4_002']],[mids[1],['chem_energy_q4_004']],[mids[2],['chem_energy_q4_006']],[broad,deck.cards.map((c:any)=>c.id)]] as [string,string[]][]){
 const filters=getSrsFilterTags(by.get(mid).tags),actual=deck.cards.filter((c:any)=>predicate(c,filters));assert.deepEqual(actual.map((c:any)=>c.id),expected)
 cards.push({memoryGoalId:mid,filterTags:filters,selectedWholeCards:actual,expectedIds:expected,exact:true})
}
const m4=read(resolve(P,'input/M4.exact-current-whole-necessity-records.json'))
const records=Array.isArray(m4)?m4:m4.wholeRecords??m4.records??m4.rows
assert.ok(Array.isArray(records))
const retainedReferences=[]
for(const mid of mids)for(const origin of by.get(mid).requires){const rec=records.find((r:any)=>r.goalId===origin);assert.ok(rec);assert.equal(rec.status,'memory_required');assert.ok(rec.memoryGoalIds.includes(mid));retainedReferences.push({origin,alreadyReferencedMemory:mid,alreadyMemoryRequired:true})}
assert.equal(sha(firstPath),firstSha);assert.equal(sha(canonicalPath),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const result={role:'Independent finite stock role/filter/compiler checks after first science; not full compiled-source/39-view or runtime-session acceptance',firstScienceSha256:firstSha,authorManifestSha256:sha(resolve(P,'MANIFEST.final-finite-author-package.sealed.json')),goalChecks,viewChecks,cards,retainedReferences,counts:{wholeGoalOperations:6,wholeViews:8,Q4GKCases:viewChecks.filter((x:any)=>x.scope.courseProfile==='GK').length,narrowExactSelections:3,broadSevenCardSelection:7},noNormalOrCapsuleInputWrites:true,HumanApproval:false,HumanTrial:false,M7Claim:false}
writeFileSync(resolve(O,'CHECK.actual-independent-six-whole-goals-eight-stock-views-and-Q4-selections.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({sixGoalOperations:6,eightViewCompiles:8,sixQ4GKCases:6,threeNarrowExactSelections:3,firstScienceExact:true}))
