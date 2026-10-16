// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16',O=`${E}/chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1`,A=`${E}/chemie-two-generic-GK-prior-boundaries-and-existing-recall-selection-author-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1'),C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex'),rows=(p:string)=>readFileSync(p,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l))
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'}),saveRows=(n:string,x:any[])=>writeFileSync(`${O}/${n}`,x.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const casPath=`${A}/CAS.two-whole-ordinary-goals-and-two-generic-GK-views.author-inactive.json`;assert.equal(sha(casPath),'sha256:99dbf18aa32c17df29c5680570611150882bc5347fda0ee5294ee05912f05f8c')
const cas=read(casPath),base=read(`${K}/${C}`),l=structuredClone(base),by=new Map<string,any>(base.goals.map((g:any)=>[g.id,g]))
assert.equal(sha(`${K}/${C}`),cas.baseCanonicalSha256)
for(const op of cas.ordinaryGoalOperations){assert.deepEqual(by.get(op.goalId),op.beforeWhole);const b=structuredClone(op.beforeWhole);b.requires=op.afterWhole.requires;assert.deepEqual(b,op.afterWhole);by.set(op.goalId,op.afterWhole);l.goals[l.goals.findIndex((g:any)=>g.id===op.goalId)]=op.afterWhole}
for(const edge of ['requires','contains']){const active=new Set<string>(),done=new Set<string>();const dfs=(id:string)=>{assert.ok(!active.has(id),`${edge}:${id}`);if(done.has(id))return;active.add(id);for(const r of by.get(id)[edge]??[]){assert.ok(by.has(r));dfs(r)}active.delete(id);done.add(id)};by.forEach((_,id)=>dfs(id))}
assert.equal(l.goals.filter((g:any,i:number)=>JSON.stringify(g)!==JSON.stringify(base.goals[i])).length,2)
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`),{convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const f6='f6d7386c-dda4-501d-84da-0c881362e724',mem=by.get(f6);assert.deepEqual(mem,cas.unchangedSelectedMemoryGoal)
const source=mem.extendedData.vocabularySource,deckPath=`${K}/app/public${source}`,deck=read(deckPath),filters=getSrsFilterTags(mem.tags)
const drill=readFileSync(`${K}/app/src/components/srs/FlashcardDrill.tsx`,'utf8'),fragment=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/);assert.ok(fragment)
const predicate=new Function('card','filterTags',`return ${fragment[1]}`),cards=deck.cards.filter((c:any)=>predicate(c,filters));assert.deepEqual(cards,cas.actualSelectedCards);assert.deepEqual(cards.map((c:any)=>c.id),['chem_org_q1_001','chem_org_q1_002','chem_org_q1_003','chem_org_q1_004'])
const originIds=['dd58c029-176f-5d99-923e-1c1fda6cf58e','7990387d-f254-5d3b-a589-a3e7ed9502a3','e14abd24-a0e5-5ab5-ade3-a8ae4f49e935','3de28598-672f-5753-8a45-8f559c2f9dc2']
const runtimeGK=(id:string)=>by.has(id)&&goalMatchesFilters(convertLearningGoal(by.get(id),{landscapeId:l.landscapeId}),['GK'])
const viewChecks=[]
for(const op of cas.wholeViewOperations){
 const br=roles(op.beforeWhole.rootNodes,by),ar=roles(op.afterWhole.rootNodes,by),before=new Set<string>([...br.targetGoalIds].filter(runtimeGK)),after=new Set<string>([...ar.targetGoalIds].filter(runtimeGK))
 assert.deepEqual([...after].filter(x=>!before.has(x)).sort(),op.addedTargetIds.slice().sort());assert.deepEqual([...before].filter(x=>!after.has(x)).sort(),op.removedTargetIds.slice().sort())
 const ordinary=(ids:Set<string>)=>[...ids].filter(id=>by.get(id).nodeKind!=='memory').sort();assert.deepEqual(ordinary(before),ordinary(after))
 assert.ok(after.has(f6));const acquisition=originIds.map(id=>({goalId:id,role:after.has(id)?'target':ar.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'missing'}));assert.ok(acquisition.every(x=>x.role!=='missing'))
 for(const [id,origin] of [['21066929-2b7f-5d31-924b-338677053238','cc5a626a-dc85-57e2-b422-259f92901545'],['7513bc49-807b-5bae-9a8e-1587ac2340a5','f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7']]){assert.ok(!after.has(id));assert.ok(ar.prerequisiteOnlyGoalIds.has(id));assert.ok(!after.has(origin));assert.equal([...by.values()].filter(g=>(g.requires??[]).includes(id)).length,0)}
 assert.deepEqual(compileCompositionView(op.afterWhole,l).findings.filter((f:any)=>f.severity==='error'),[])
 viewChecks.push({view:op.targetPath,stage:op.afterWhole.scope.stage,actualGKOrdinaryTargetSetExact:true,addedMemoryTarget:f6,removedMemoryTargets:op.removedTargetIds,actualSelectedCards:cards.map((c:any)=>c.id),actualOriginRoles:acquisition,stockCompilerErrors:0})
}
function stockFp(file:string,endMarker:string){const s=readFileSync(`${K}/app/scripts/${file}`,'utf8'),start=s.indexOf('function normalizeText('),end=s.indexOf(endMarker,start);assert.ok(start>=0&&end>start);const js=ts.transpileModule(s.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return new Function('createHash',js+';return fingerprintGoal;')(createHash)}
const afp=stockFp('semanticAtomicityReview.ts','function isLeaf('),mfp=stockFp('memoryCardReview.ts','function fingerprintMemoryCard(')
const {fingerprintGoalForPositiveEvidence:pFp,fingerprintPositiveGoalEvidenceReviewInput:piFp,fingerprintPositiveGoalEvidenceProfile:profileFp,validatePositiveGoalEvidenceRecordSemantics:validateP}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const reviewer='/root/chemie_native9_fresh_independent_b_20261016',reviewId='chemie-two-generic-gk-priors-and-recall-independent-b-20261016-v1',reviewedAt=new Date().toISOString(),A2=[],M2=[],P2=[],V2=[]
for(const op of cas.ordinaryGoalOperations){
 const g=op.afterWhole,sourceP=read(`${A}/input/P.${g.id}.whole-current-independent.json`),resources:Record<string,string>={}
 for(const r of g.resourceLinks??[])if(r.type==='goal-visualization')resources[r.url]=sha(`${K}/app/public${r.url}`)
 const reason='Actual independent B whole-context scienceFIRSTa3a4, including all five full bilingual P cases, own calculations, exact real prerequisites and actual original image viewing. Only excessive universal prerequisite is narrowed; whole content/operators/materials/images remain. No learner or human evidence.'
 A2.push({schemaVersion:1,reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:l.landscapeId,goalId:g.id,fingerprint:afp(g,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reviewedAt,reviewer,reason})
 M2.push({schemaVersion:1,reviewId,ruleVersion:'memory-card-review-v1',landscapeId:l.landscapeId,goalId:g.id,fingerprint:mfp(g,'memory-card-review-v1'),status:'no_memory_needed',memoryUseful:false,reviewedAt,reviewer,reason:'Current whole performance is interpretation of data/relationships and fresh application. Supplied case conventions/thresholds make no new compact recall prerequisite; previous no_memory_needed remains scientifically appropriate.'})
 const p={...sourceP,reviewId,reviewer,reviewedAt,reason,goalFingerprint:pFp(g,'curricularAtomic'),reviewInputFingerprint:piFp(g,sourceP.reviewCriteriaFingerprint,resources,'curricularAtomic'),status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:['Independent AI candidate; actual nativeD2 remains a separate pending page review, human approval/trial absent.']}
 assert.equal(p.profileFingerprint,profileFp(p.profile));assert.deepEqual(p.profile,sourceP.profile);assert.deepEqual(validateP(p,g,resources,'curricularAtomic'),[]);P2.push(p)
 V2.push({goalId:g.id,decision:'KEEP',reviewer,reviewedAt,currentGoalSourceFingerprint:p.goalFingerprint,actualImageResources:resources,actualViewImageInspection:true,wholeCurrentDescription:g.description,scienceFIRST:'sha256:a3a4e09d91debd280eaee9022b2cb7eb7dcb68eeab09118e2a2f7c6a7a85c8ab',nativeD2Pending:true,HumanApproval:false,HumanTrial:false,M7Claim:false})
}
for(const [n,r] of [['A2',A2],['M2',M2],['P2',P2],['V2',V2]] as [string,any[]][])saveRows(`${n}.actual-whole-two-incremental-independent-b.candidate.jsonl`,r)
const mc=read(`${K}/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json`),mrecords=rows(`${K}/${mc.reviewPath}`)
const mrefs=originIds.map(goalId=>{const r=mrecords.find((r:any)=>r.goalId===goalId);assert.ok(r?.memoryGoalIds?.includes(f6));return {goalId,status:r.status,alreadyReferencesSelectedF6:true}})
save('CHECK.actual-two-goals-two-GK-views-stock-cards-and-AMPV-bindings.independent-b.json',{role:'Own executed checks after sealed science, no author changes',cas:{path:casPath,sha256:sha(casPath)},canonicalWholeChanges:2,other637WholeBodiesExact:true,onlyFieldChanged:'requires',both639DAGsAcyclic:true,wholeViewChecks:viewChecks,actualDeck:{path:deckPath,sha256:sha(deckPath),filterTags:filters,wholeSelectedCards:cards},existingM437OriginReferences:mrefs,P2WholeBodiesExact:true,stockPositiveSemanticErrors:0,actualA2M2P2:true,V2:'Actual informed image/context compatibility rows; prior human records not edited',nativeD2Pending:true,HumanApproval:false,HumanTrial:false,M7Claim:false})
console.log(JSON.stringify({ordinaryGoals:2,views:2,selectedCards:4,ordinaryTargetsExact:true,P2WholeBodiesExact:true,stockPositiveSemanticErrors:0,nativeD2Pending:true}))
