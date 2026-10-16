// SPDX-License-Identifier: Apache-2.0
// Only writes this independent reviewer's new output root.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1`
const S=`${E}/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1`
const T=`${E}/chemie-qualitative-faraday-current-ordinary-kind-metadata-successor-technical-20261016-v1`
const F=`${E}/chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const L=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1')
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const rows=(p:string)=>readFileSync(p,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l))
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const saveRows=(n:string,x:any[])=>writeFileSync(`${O}/${n}`,x.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const base=read(`${K}/${C}`), by=new Map<string,any>(base.goals.map((g:any)=>[g.id,g]))
assert.equal(sha(`${K}/${C}`),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const cas=read(`${S}/CAS.six-whole-goal-operations.author-inactive-v3.json`)
const candidate=read(`${S}/candidate/CANONICAL639.six-whole-goal-operations.author-inactive-v3.json`)
const applied=structuredClone(base), changed=[]
for(const op of cas.operations){
 const index=applied.goals.findIndex((g:any)=>g.id===op.goalId)
 assert.deepEqual(applied.goals[index],op.beforeWhole)
 const keys=[...new Set([...Object.keys(op.beforeWhole),...Object.keys(op.afterWhole)])].filter(k=>JSON.stringify(op.beforeWhole[k])!==JSON.stringify(op.afterWhole[k]))
 assert.deepEqual(keys.slice().sort(),op.afterWhole.nodeKind==='memory'?['applicability','extendedData']:['requires'])
 applied.goals[index]=op.afterWhole;changed.push({goalId:op.goalId,changedKeys:keys})
}
assert.deepEqual(applied,candidate);assert.equal(changed.length,6)
const cb=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
for(const rel of ['requires','contains']){
 const visiting=new Set<string>(),done=new Set<string>()
 const dfs=(id:string)=>{assert.ok(!visiting.has(id),`${rel} cycle ${id}`);if(done.has(id))return;visiting.add(id);for(const child of cb.get(id)?.[rel]??[]){assert.ok(cb.has(child));dfs(child)}visiting.delete(id);done.add(id)}
 cb.forEach((_,id)=>dfs(id))
}
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const vc=read(`${S}/CAS.eight-whole-views.author-inactive.json`), viewChecks=[]
const viewByName=new Map<string,any>()
for(const op of vc.operations){
 const before=roles(op.beforeWhole.rootNodes,cb),after=roles(op.afterWhole.rootNodes,cb)
 const preview=compileCompositionView(op.afterWhole,candidate)
 assert.deepEqual(preview.findings.filter((x:any)=>x.severity==='error'),[])
 assert.deepEqual([...after.targetGoalIds].filter((x:string)=>!before.targetGoalIds.has(x)).sort(),op.addedTargetIds.slice().sort())
 assert.deepEqual([...before.targetGoalIds].filter((x:string)=>!after.targetGoalIds.has(x)).sort(),op.removedTargetIds.slice().sort())
 if(op.scope.courseProfile==='GK'){
  assert.ok(after.prerequisiteOnlyGoalIds.has('6122faf0-6718-52b3-b40d-b206a2e963ae'))
  assert.ok(!after.targetGoalIds.has('6122faf0-6718-52b3-b40d-b206a2e963ae'))
  for(const id of ['9ca180a2-07f7-559e-bf3a-d638ebbea75d','2ab83298-e12b-5d4e-bd90-4cacdbccecf2']){
   assert.ok(after.targetGoalIds.has(id))
   for(const origin of cb.get(id).requires)assert.ok(after.targetGoalIds.has(origin)||after.prerequisiteOnlyGoalIds.has(origin))
  }
 }
 viewByName.set(op.name,op.afterWhole)
 viewChecks.push({name:op.name,scope:op.scope,stockCompilerErrors:0,addedTargets:op.addedTargetIds,removedTargets:op.removedTargetIds,explicitNewRoles:op.additions,allDeclaredTargetDiffsExact:true})
}
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const drill=readFileSync(`${K}/app/src/components/srs/FlashcardDrill.tsx`,'utf8')
const fragment=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/);assert.ok(fragment)
const predicate=new Function('card','filterTags',`return ${fragment[1]}`)
const selections=[]
for(const [id,expected] of [
 ['9ca180a2-07f7-559e-bf3a-d638ebbea75d',['chem_energy_q4_001','chem_energy_q4_002']],
 ['2ab83298-e12b-5d4e-bd90-4cacdbccecf2',['chem_energy_q4_004']],
 ['fdd72195-e113-5a78-ab0b-02ed631b34aa',['chem_energy_q4_006']],
 ['98781dda-8049-5173-899b-42a5c2902b86',['chem_org_q1_002']],
 ['03b08b91-6809-576a-8cf1-4a131caab4e5',['chem_eq_q3_012','chem_eq_q3_013']],
] as [string,string[]][]){
 const g=cb.get(id),source=g.extendedData.vocabularySource,p=`${K}/${source.startsWith('/data/')?'app/public'+source:source}`
 const deck=read(p),filters=getSrsFilterTags(g.tags),cards=deck.cards.filter((c:any)=>predicate(c,filters))
 assert.deepEqual(cards.map((c:any)=>c.id),expected)
 selections.push({goalId:id,filterTags:filters,deckPath:p,sha256:sha(p),wholeSelectedCards:cards})
}
const typeBefore=read(`${T}/WHOLEGOAL.0e3.before-actual-L.json`),typeAfter=read(`${T}/WHOLEGOAL.0e3.after-current-L2.json`)
const typeExpected=structuredClone(typeBefore);delete typeExpected.nodeKind;assert.deepEqual(typeExpected,typeAfter)
const l=read(`${L}/${C}`);assert.equal(sha(`${L}/${C}`),'sha256:15367459e483db82c47c08d1ed4844ef6719beea54a17ee3b723b97c81ac40c7')
assert.equal(l.goals.filter((g:any,i:number)=>JSON.stringify(g)!==JSON.stringify(base.goals[i])).length,1)
assert.deepEqual(l.goals.find((g:any)=>g.id===typeAfter.id),typeAfter)
const {fingerprintSemanticKindSourceGoal}=await import(`${L}/app/scripts/goalBookModel.ts`)
const {fingerprintGoalForPositiveEvidence:pFp,fingerprintPositiveGoalEvidenceReviewInput:piFp,fingerprintPositiveGoalEvidenceProfile:profileFp,validatePositiveGoalEvidenceRecordSemantics:validateP}=await import(`${L}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
function stockFp(file:string,endMarker:string){const p=`${L}/app/scripts/${file}`,s=readFileSync(p,'utf8'),start=s.indexOf('function normalizeText('),end=s.indexOf(endMarker,start);assert.ok(start>=0&&end>start);const js=ts.transpileModule(s.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return new Function('createHash',js+';return fingerprintGoal;')(createHash)}
const afp=stockFp('semanticAtomicityReview.ts','function isLeaf('),mfp=stockFp('memoryCardReview.ts','function fingerprintMemoryCard(')
const ar=rows(`${T}/A1.current-metadata.author-technical-candidate.review.jsonl`)[0],mr=rows(`${T}/M1.current-metadata.author-technical-candidate.review.jsonl`)[0],pr=rows(`${T}/P1.current-metadata.author-technical-candidate.review.jsonl`)[0]
const ownOldP=rows(`${E}/chemie-native9-current437-fresh-independent-b-20261016-v1/P9.current-whole-profiles.independent-b.candidate.jsonl`).find((g:any)=>g.goalId===typeAfter.id)
assert.deepEqual(pr.profile,ownOldP.profile);assert.equal(pr.profileFingerprint,profileFp(pr.profile))
const resources:Record<string,string>={}
for(const r of typeAfter.resourceLinks??[])if(r.type==='goal-visualization')resources[r.url]=sha(`${L}/app/public${r.url}`)
assert.equal(ar.fingerprint,afp(typeAfter,ar.ruleVersion));assert.equal(mr.fingerprint,mfp(typeAfter,mr.ruleVersion))
assert.equal(pr.goalFingerprint,pFp(typeAfter,'curricularAtomic'));assert.equal(pr.reviewInputFingerprint,piFp(typeAfter,pr.reviewCriteriaFingerprint,resources,'curricularAtomic'))
const reviewId='chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1',reviewer='/root/chemie_native9_fresh_independent_b_20261016',reviewedAt=new Date().toISOString()
const reason='Actual independent B informed type-only followup after full own FIRST70cc and current FIRST0d0d. The source curricular Faraday goal is ordinary atomic; only the erroneous tutor metadata was removed. Actual full text/requires/P body/two material cases/image/cards remain exact. This is AI evidence, no human acceptance.'
const a={...ar,reviewId,reviewer,reviewedAt,reason,status:'atomic',semanticAtomic:true}
const m={...mr,reviewId,reviewer,reviewedAt,reason:reason+' Retain the actual narrow qualitative-law recall012/013; this does not replace application/electron/amount/mass reasoning.',status:'memory_required',memoryUseful:true}
const p={...pr,reviewId,reviewer,reviewedAt,reason,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E0',maximumClaimScope:'G0',dissent:['Independent AI candidate; human approval/trial absent. NativeD4 current page review remains separate.']}
assert.deepEqual(validateP(p,typeAfter,resources,'curricularAtomic'),[])
saveRows('A1.ordinary-kind-current.actual-independent-b.review.jsonl',[a]);saveRows('M1.ordinary-kind-current.actual-independent-b.review.jsonl',[m]);saveRows('P1.ordinary-kind-current.actual-independent-b.review.jsonl',[p])
const fc=read(`${F}/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json`),foundation=[]
for(const op of fc.operations){
 const before=roles(op.beforeWhole.rootNodes,cb),after=roles(op.afterWhole.rootNodes,cb)
 assert.deepEqual(before.targetGoalIds,after.targetGoalIds)
 assert.deepEqual([...after.prerequisiteOnlyGoalIds].filter((x:string)=>!before.prerequisiteOnlyGoalIds.has(x)),['266a2b2a-9ee2-52f6-ae09-59343da9a60b'])
 assert.deepEqual([...before.prerequisiteOnlyGoalIds].filter((x:string)=>!after.prerequisiteOnlyGoalIds.has(x)),[])
 for(const id of ['416dfd33-8b43-5c49-903c-9847b95e4208','13d4f336-ab16-54a7-9479-c920b458f385'])assert.ok(before.prerequisiteOnlyGoalIds.has(id))
 assert.ok(after.targetGoalIds.has('a9c22adc-b543-5b0c-a2d8-3189facdff08')||after.prerequisiteOnlyGoalIds.has('a9c22adc-b543-5b0c-a2d8-3189facdff08'))
 assert.deepEqual(compileCompositionView(op.afterWhole,candidate).findings.filter((f:any)=>f.severity==='error'),[])
 foundation.push({view:op.targetPath,targetsUnchanged:true,onlyAddedSupport:'266a2b2a-9ee2-52f6-ae09-59343da9a60b',bothRealAtomicChildrenAlreadySupport:true,orientationAlreadyAvailable:true,stockCompilerErrors:0})
}
save('CHECK.six-whole-CAS-eight-views-exact-cards-and-type-stock-bindings.independent-b.json',{role:'Independent B mechanical checks after own sealed scientific decisions',changedWholeGoals:changed,onlySixCanonicalBodiesChanged:true,bothDAGsAcyclic:true,wholeViewChecks:viewChecks,exactStockCardSelections:selections,cardIdPrecisionNote:'FIRST used energy_q4_001/002/004/006 as concise labels. Actual full IDs, selected by the executed stock predicate, are chem_energy_q4_001/002/004/006 as recorded here; no card bytes or selection changed.',typeCorrection:{oneKeyOnly:'nodeKind',other638Exact:true,semanticSourceFingerprint:fingerprintSemanticKindSourceGoal(typeAfter),atomicity:ar.fingerprint,memory:mr.fingerprint,positiveGoal:pr.goalFingerprint,positiveInput:pr.reviewInputFingerprint,wholeProfileExact:true,imageResources:resources},existingLabFoundationFour:foundation,HumanApproval:false,HumanTrial:false,M7Claim:false})
save('ADDENDUM.four-SekII-lab-interface.KEEP.independent-b.json',{role:'Actual independent B scope-science addendum after own seven-exam FIRST; no current peer opinions read',decision:'KEEP',CAS:{path:`${F}/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json`,sha256:sha(`${F}/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json`)},wholeCluster:fc.unchangedWholeCluster,wholeAtomicChildren:fc.unchangedWholeChildren,science:'266a is exactly the pre-existing laboratory methods/safety cluster with the two concrete children already explicit support in each SekII view. The preserved fcc73 foundation directly requires this stable clusterID. Explicit support restores the actual direct interface; it creates neither additional target completion nor assumed mastery. Both children still require real appropriate laboratory actions/safety competence; no requirement was removed, waived or replaced by fictional prior knowledge. Backend prerequisite checks may now consult their global mastery under the existing cluster semantics. This is a bounded placement decision, not a declaration that every learner already mastered it.',checks:foundation,originalSevenFIRST:'sha256:517c76b27b8468548db4c6bc451d5f0b6fce9fb9ae7899e3181370f423c1abab',normalWrites:false,HumanApproval:false,HumanTrial:false,M7Claim:false})
console.log(JSON.stringify({wholeCAS:6,stockViews:8,stockLabFollowups:4,exactSelections:5,currentA1M1P1:true,errors:0}))
