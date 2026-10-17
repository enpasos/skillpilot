// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-HE145-327-current-admission-informed-independent-b-20261016-v1`
const R=`${E}/chemie-current-L3-twenty-one-unreleased-assessments-existing-content-evidence-readonly-20261016-v1`
const K3=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1')
const K4=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1')
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const stable=(x:any):any=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x
const fp=(x:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(stable(x))).digest('hex')
const pin=(p:string)=>({path:p,sha256:sha(p),bytes:readFileSync(p).length})
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const firstPath=`${O}/science.FIRST.two-current-primary-admissions.independent-b.json`
assert.equal(sha(firstPath),'sha256:776779bf3aaefd88be152bd68120aa9f95d3fa9e207890c64bda60a10f43174e')
assert.equal(sha(`${K3}/${C}`),'sha256:b3c50a6a0782247375dbad00a76a4ef5d5035030c12cbc2e9b190865e1ed33e1')
assert.equal(sha(`${K4}/${C}`),'sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903')
const l3=read(`${K3}/${C}`),l4=read(`${K4}/${C}`)
const by3=new Map<string,any>(l3.goals.map((g:any)=>[g.id,g])),by4=new Map<string,any>(l4.goals.map((g:any)=>[g.id,g]))
const inputPath=`${R}/INPUT.HE145-327-whole-current-goals-and-exact-admission-prerequisite-bodies.json`,input=read(inputPath)
const selectionPath=`${R}/HE145-327.existing-full-content-pairs-and-finite-current-admission-evidence-gap.json`,selection=read(selectionPath)
const goals=input.goals as any[],ids=goals.map(g=>g.id)
assert.deepEqual(ids,['14577339-9e0c-5b44-8e47-91e1a4947367','32705a3a-9b7f-5cc0-ba41-881d13d0c45b'])
const contentKeys=['taskContent','solutionContent','scoring','coveredGoalIds','coveredStrands','demandLevels']
const content=(g:any)=>Object.fromEntries(contentKeys.map(k=>[k,g.examData[k]]))
const contentChecks=goals.map((g:any,i:number)=>{
 assert.deepEqual(g,by3.get(g.id));assert.deepEqual(g,by4.get(g.id))
 assert.equal(g.requires.length,[185,265][i]);assert.equal(new Set(g.requires).size,g.requires.length)
 const s=selection.rows.find((r:any)=>r.goalId===g.id),old=read(s.historicalWholeGoalFile.path)
 assert.equal(sha(s.historicalWholeGoalFile.path),s.historicalWholeGoalFile.sha256)
 assert.deepEqual(content(g),content(old))
 assert.deepEqual(Object.keys(g.examData).filter(k=>JSON.stringify(g.examData[k])!==JSON.stringify(old.examData[k])),['reviewNote'])
 assert.equal(g.examData.scoring.maxPoints,44);assert.equal(g.examData.scoring.passingPoints,27)
 assert.equal(g.examData.scoring.steps.reduce((s:number,r:any)=>s+r.points,0),44)
 assert.equal(g.examData.coveredGoalIds.length,7);assert.equal(g.examData.reviewStatus,'draft')
 return {goalId:g.id,title:g.title,currentWholeFingerprint:fp(g),L3L4WholeExact:true,wholeInputExact:true,historicalWhole:pin(s.historicalWholeGoalFile.path),allSixAssessedContentFieldsExact:true,assessedContentFingerprint:fp(content(g)),changedExamDataFields:['reviewNote'],directRequires:g.requires.length,reviewStatus:g.examData.reviewStatus,maxPoints:44,passingPoints:27,coverageGoalIds:g.examData.coveredGoalIds}
})
assert.deepEqual(content(goals[0]),content(goals[1]))
assert.ok(goals[0].requires.every((id:string)=>goals[1].requires.includes(id)))
const unique=[...new Set(goals.flatMap(g=>g.requires))] as string[];assert.equal(unique.length,265)
assert.equal(input.wholePrerequisiteGoals.length,265)
const prerequisiteBodyDeltas=[]
for(const g of input.wholePrerequisiteGoals){
 assert.deepEqual(g,by3.get(g.id));assert.ok(unique.includes(g.id));
 const current=by4.get(g.id)
 if(JSON.stringify(g)!==JSON.stringify(current)){
  assert.ok(['f4d5a02d-711b-5a6b-a41d-971359c1f64d','3eada74b-25b8-55dc-811a-acb473196f53'].includes(g.id))
  const changed=Object.keys(g).filter(k=>JSON.stringify(g[k])!==JSON.stringify(current[k]));assert.deepEqual(changed,['requires'])
  prerequisiteBodyDeltas.push({goalId:g.id,changedFields:changed,descriptionExact:true,alreadySeparatelyReviewedByOwnB:'chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1/MANIFEST.final-current-native-two-independent-b.sealed.json'})
 }
}
assert.equal(prerequisiteBodyDeltas.length,2)
const apvPath=`${R}/APV.actual-current-L3.Chemistry-report.json`;assert.equal(sha(apvPath),'sha256:6254672ab308d5b97982b52aefd5ce7fe3c04461124b16115cc94472adc99891')
const apv=read(apvPath),apvBy=new Map<string,any>(apv.goals.map((g:any)=>[g.goalId,g]))
const {collectCompositionProjectionRoleGoalIds,compileCompositionView}=await import(`${K4}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {convertLearningGoal}=await import(`${K4}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K4}/app/src/utils/goalFilters.ts`)
const first=read(firstPath),eight=first.admissionFindings.definiteGKCourseLevelOverreach
const siliconeIds=first.admissionFindings.siliconePair.goalIds as string[],solubilityId=first.admissionFindings.solubility413.goalId as string
const witnessIds=[...siliconeIds,...eight.map((r:any)=>r.goalId),solubilityId]
const viewNames=['de-he-gk.view.json','de-he-lk.view.json','de-he-sekii-gk.view.json','de-he-sekii-lk.view.json','de-de-gym-chemistry-gk.view.json','de-de-gym-chemistry-lk.view.json','de-de-gym-sekii-chemistry-gk.view.json','de-de-gym-sekii-chemistry-lk.view.json']
const viewChecks=viewNames.map(name=>{
 const relative=`curricula/DE/Gymnasium/composition-views/chemie/${name}`,path=`${K4}/${relative}`,v=read(path),r=collectCompositionProjectionRoleGoalIds(v.rootNodes,by4)
 const filters=[v.scope.courseProfile,v.scope.jurisdiction].filter(Boolean)
 const actualTarget=(id:string)=>r.targetGoalIds.has(id)&&goalMatchesFilters(convertLearningGoal({...by4.get(id),applicability:{...by4.get(id).applicability,...apvBy.get(id)?.compiledApplicability}},{landscapeId:l4.landscapeId}),filters)
 const allowed=(id:string)=>actualTarget(id)||r.prerequisiteOnlyGoalIds.has(id)
 const primary=goals[v.scope.courseProfile==='GK'?0:1]
 const missing=primary.requires.filter((id:string)=>!allowed(id));assert.deepEqual(missing,[])
 const witnesses=witnessIds.map(id=>({goalId:id,title:by4.get(id).title,globalTags:by4.get(id).tags,rawApplicability:by4.get(id).applicability,authoredTarget:r.targetGoalIds.has(id),actualTargetWithPinnedL3APV:actualTarget(id),prerequisiteOnly:r.prerequisiteOnlyGoalIds.has(id),inGK185:goals[0].requires.includes(id),inLK265:goals[1].requires.includes(id)}))
 if(v.scope.jurisdiction==='DE-HE'){
  assert.ok(witnesses.filter(x=>siliconeIds.includes(x.goalId)||x.goalId===solubilityId).every(x=>x.actualTargetWithPinnedL3APV&&!x.prerequisiteOnly))
  if(v.scope.courseProfile==='GK')assert.ok(witnesses.filter(x=>eight.some((e:any)=>e.goalId===x.goalId)).every(x=>x.actualTargetWithPinnedL3APV&&x.inGK185&&!x.prerequisiteOnly))
 }
 const errors=compileCompositionView(v,l4).findings.filter((f:any)=>f.severity==='error');assert.deepEqual(errors,[])
 return {viewPath:relative,currentL4File:pin(path),L3SameViewBytes:sha(path)===sha(`${K3}/${relative}`),scope:v.scope,primaryGoalId:primary.id,primaryActualTarget:actualTarget(primary.id),directRequires:primary.requires.length,missingDirectRequirements:missing,stockCompilerErrors:0,witnesses}
})
const sourceEvidence=witnessIds.map(id=>({goalId:id,compiledApplicability:apvBy.get(id).compiledApplicability,HEJurisdictionEvidence:apvBy.get(id).evidence.filter((e:any)=>e.dimension==='jurisdiction'&&e.value==='DE-HE')}))
for(const id of [...siliconeIds,solubilityId]){
 const e=sourceEvidence.find(e=>e.goalId===id)!.HEJurisdictionEvidence
 assert.ok(e.length>0);assert.ok(e.every((e:any)=>e.kind==='requires-closure'))
}
const ownMath={esterK:.4*.4/(.2*.2),postRemovalQ:.2*.4/(.2*.2),standardCombustionKJPerMol:2*(-394)+3*(-286)-(-278),waterHeatKJ:1*4.18*5,ethanolMol:.9/46,apparentCombustionKJPerMol:-(1*4.18*5)/(.9/46),rubricPoints:[8,10,8,10,8],sum:8+10+8+10+8,pass:27,ethanolToEthanalToAcetateFunctionalCarbonOxidationNumbers:[-1,1,3]}
assert.ok(Math.abs(ownMath.esterK-4)<1e-12);assert.ok(Math.abs(ownMath.postRemovalQ-2)<1e-12);assert.equal(ownMath.standardCombustionKJPerMol,-1368);assert.ok(Math.abs(ownMath.apparentCombustionKJPerMol+1068.2222222222222)<1e-9)
const result={role:'Own executed exact current content/role/source/math checks after sealed independent science; no authored change and no release',reviewer:'/root/chemie_native9_fresh_independent_b_20261016',scienceFIRST:pin(firstPath),canonicalL3:pin(`${K3}/${C}`),canonicalL4:pin(`${K4}/${C}`),inputs:[pin(inputPath),pin(selectionPath)],contentChecks,GK185SubsetOfLK265:true,uniqueAdmissionBodies265:true,prerequisiteBodyDeltas,currentViewChecks:viewChecks,sourceEvidence,actualPinnedL3APV:pin(apvPath),APVFreshlyRecompiledByThisAgent:false,APVBoundary:'Actual pinned fresh L3 report; current L4 exact role/view functions executed. Only two L4 ordinary requires changed separately reviewed above. Closure-derived jurisdiction is applicability, not official source coverage.',ownMath,historicalReviewBoundary:'Historical route13B read as original history; no current peerA science read and no historical reviewer identity impersonated.',all265FreshPImageOrFullQualityReviewClaim:false,notExecutedJavaLearnerSession:true,currentWholeReleaseReady:false,HumanApproval:false,HumanTrial:false,M7Claim:false,normalWrites:false}
save('CHECK.two-current-primary-content-roles-sources-and-calculations.independent-b.json',result)
console.log(JSON.stringify({primaryWholes:2,L3L4PrimaryExact:true,assessedContentExact:true,admissionCounts:[185,265],uniqueAdmissionBodies:265,actualViews:viewChecks.length,HEViews:4,finiteWitnesses:witnessIds.length,contentDecision:'KEEP',admissionDecision:'REVISE',releaseReady:false}))
