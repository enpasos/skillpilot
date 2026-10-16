// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const R='/home/enpasos/projects/skillpilot',E=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
const O=resolve(E,'chemie-two-generic-GK-priors-and-recall-fresh-independent-a-20261016-v1'),A=resolve(E,'chemie-two-generic-GK-prior-boundaries-and-existing-recall-selection-author-20261016-v1')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const first=resolve(O,'FIRST.two-ordinary-priors-and-two-GK-recall-views.independent-a.frozen.json')
assert.equal(sha(first),'sha256:013746bf5ab0d3144552291a5e3e837d5b68a78a50dca20fd4517d6b2f48836e')
const casPath=resolve(A,'CAS.two-whole-ordinary-goals-and-two-generic-GK-views.author-inactive.json')
assert.equal(sha(casPath),'sha256:99dbf18aa32c17df29c5680570611150882bc5347fda0ee5294ee05912f05f8c')
const cas=read(casPath),canonical=read(resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const before=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])),by=new Map(before),goals=[]
for(const op of cas.ordinaryGoalOperations){assert.deepEqual(before.get(op.goalId),op.beforeWhole);const restored=structuredClone(op.afterWhole);restored.requires=op.beforeWhole.requires;assert.deepEqual(restored,op.beforeWhole);by.set(op.goalId,op.afterWhole);goals.push({goalId:op.goalId,requires:op.afterWhole.requires,onlyRequiresChanged:true})}
canonical.goals=canonical.goals.map((g:any)=>by.get(g.id))
assert.equal(canonical.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(before.get(g.id))).length,2)
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const shared=read(resolve(E,'chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1/CAS.eight-whole-views.author-inactive.json')).operations
const lab=read(resolve(E,'chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json')).operations
const roles=(v:any)=>{const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);return {target:new Set<string>([...r.targetGoalIds].filter((id:string)=>goalMatchesFilters(by.get(id),['GK']))),support:r.prerequisiteOnlyGoalIds}}
const narrow='f6d7386c-dda4-501d-84da-0c881362e724',broad='e3e8582a-976b-5f0f-b31b-3cf59a4fff24',advanced=['21066929-2b7f-5d31-924b-338677053238','7513bc49-807b-5bae-9a8e-1587ac2340a5'],allowed=new Set([narrow,broad,...advanced]),origins=['dd58c029-176f-5d99-923e-1c1fda6cf58e','7990387d-f254-5d3b-a589-a3e7ed9502a3','e14abd24-a0e5-5ab5-ade3-a8ae4f49e935','3de28598-672f-5753-8a45-8f559c2f9dc2']
function withoutRecall(v:any){const c=structuredClone(v);function prune(ns:any[]):any[]{return ns.filter(n=>!allowed.has(n.goalId)).map(n=>{if(n.children)n.children=prune(n.children);return n}).filter(n=>n.kind!=='structure'||n.children?.length)}c.rootNodes=prune(c.rootNodes);return c}
const views=[]
for(const op of cas.wholeViewOperations){
 const b=op.beforeWhole,a=op.afterWhole,prior=lab.find((x:any)=>x.afterWhole.viewId===b.viewId)?.afterWhole??shared.find((x:any)=>x.afterWhole.viewId===b.viewId)?.afterWhole
 assert.deepEqual(b,prior);assert.deepEqual(withoutRecall(b),withoutRecall(a))
 const rb=roles(b),ra=roles(a),memory=(id:string)=>{const g=by.get(id);return g.nodeKind==='memory'||g.tags?.includes('memorization')}
 assert.deepEqual([...rb.target].filter(id=>!memory(id)).sort(),[...ra.target].filter(id=>!memory(id)).sort())
 const removed=[...rb.target].filter(id=>!ra.target.has(id));assert.ok(removed.every(id=>[broad,...advanced].includes(id)))
 assert.ok(ra.target.has(narrow));assert.ok(!ra.target.has(broad)&&ra.support.has(broad))
 const scopeOrigins=origins.map(id=>({goalId:id,role:ra.target.has(id)?'target':ra.support.has(id)?'prerequisiteOnly':'OMITTED',actualLowerStage:by.get(id).tags.includes('SekI')}))
 assert.ok(scopeOrigins.every(x=>x.role==='target'||x.role==='prerequisiteOnly'&&x.actualLowerStage))
 for(const id of by.get(narrow).requires)assert.ok(ra.target.has(id)||ra.support.has(id))
 for(const mid of advanced){assert.ok(!ra.target.has(mid)&&ra.support.has(mid));for(const origin of by.get(mid).requires)assert.ok(!ra.target.has(origin))}
 for(const opg of cas.ordinaryGoalOperations)for(const id of opg.afterWhole.requires)assert.ok(ra.target.has(id)||ra.support.has(id))
 const compile=compileCompositionView(a,canonical,canonical);assert.deepEqual(compile.findings.filter((f:any)=>f.severity==='error'),[])
 views.push({viewId:a.viewId,stockCompileErrors:0,ordinaryTargetSetExact:true,onlyDeclaredMemoryReferencesChanged:true,removedMemoryTargetIds:removed,narrowTargetId:narrow,actualCardOrigins:scopeOrigins,advancedRecallSupportOnly:true,newOrdinaryDirectPrerequisitesPresent:true})
}
const deck=read(resolve(K,'app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json'))
assert.deepEqual(by.get(narrow),cas.unchangedSelectedMemoryGoal)
const drill=readFileSync(resolve(K,'app/src/components/srs/FlashcardDrill.tsx'),'utf8'),m=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/);assert.ok(m)
const predicate=new Function('card','filterTags',`return ${m[1]}`),tags=getSrsFilterTags(by.get(narrow).tags),cards=deck.cards.filter((c:any)=>predicate(c,tags))
assert.deepEqual(cards.map((c:any)=>c.id),['chem_org_q1_001','chem_org_q1_002','chem_org_q1_003','chem_org_q1_004']);assert.deepEqual(cards,cas.actualSelectedCards)
const mconfig=read(resolve(K,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json')),mr=readFileSync(resolve(K,mconfig.reviewPath),'utf8').trim().split(/\r?\n/).map(JSON.parse)
for(const id of origins){const row=mr.find((r:any)=>r.goalId===id);assert.equal(row.status,'memory_required');assert.ok(row.memoryGoalIds.includes(narrow))}
const calculations={polarimetryFirst:6/(2*.05),polarimetryReference:5.3/(1*.100),angleOnlyUncertainty:.1/(1*.100),chlorideVoltage:1.46-(-1.03)+.20,changedOxygenVoltage:1.28-(-1.03)+.20,copperBromideVoltage:1.17-.34+.12,changedAnodeThresholds:{oxygen:1.23+.15,bromine:1.07+.50}}
assert.equal(sha(first),'sha256:013746bf5ab0d3144552291a5e3e837d5b68a78a50dca20fd4517d6b2f48836e')
writeFileSync(resolve(O,'CHECK.actual-stock-two-views-two-priors-four-cards-and-own-calculations.json'),JSON.stringify({role:'Finite independent stock role/filter/compiler check after FIRST; not full39/source or Java session acceptance',firstScienceSHA256:sha(first),goals,views,selectedFourWholeCards:cards,filterTags:tags,existingM437OriginRefsRetained:true,calculations,normalInputWrites:0,formalNativeD2:'pending actual two pages',HumanApproval:false,HumanTrial:false,M7Claim:false},null,2)+'\n')
console.log(JSON.stringify({wholeGoalChanges:2,views:2,ordinaryTargetsRemoved:0,stockCompileErrors:0,exactSelectedCards:4,originM437Refs:4,firstExact:true}))
