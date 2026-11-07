// Private test only: real historical24 and native consumers; the independent
// graph/route fixture is explicitly NOT a passing graph claim for Info source.
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import {captureCurriculumSource,createRetainedCoverageContext,RETAINED_INFO_OWNER as OWNER} from '/home/enpasos/projects/skillpilot/app/scripts/lib/retainedAssessmentCoverage.ts'
import {evaluateCurriculumExamReadiness,evaluateGraphIntegrity,deriveCurriculumMaturity} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import {hasCompletePassingCurriculumExamReadiness} from '/home/enpasos/projects/skillpilot/app/scripts/lib/curriculumAssessmentValidation.ts'
import {collectCurriculumMaturityFloorFailures} from '/home/enpasos/projects/skillpilot/app/scripts/checkCurriculumMaturityFloors.ts'
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/informatics-q2-source-scope-v3-20261107',P=R+'/contracts/curriculum-assessment-coverage/v1/informatics'
const raw=gunzipSync(readFileSync(P+'/historical-informatics-source.json.gz')),history=JSON.parse(raw.toString()),inv=JSON.parse(readFileSync(P+'/history-inventory.json','utf8'))
assert.equal(createHash('sha256').update(raw).digest('hex'),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e')
const Q=['8877a2e6-ebf8-5b73-a88b-56d5145a20ba','0c346dc1-fdcc-5563-9154-28623d354574'],C='31026f4a-629b-571f-b45d-a87f47a09d9e',A='875cb53c-b48d-5b2b-8cb0-e20f27534f16'
const g=(s:any,id:string)=>s.goals.find((g:any)=>g.id===id),old=(id:string)=>inv.definitions.find((r:any)=>r.goalId===id).coverage.resolvedAtomicGoalIds
const graphFixture:any={landscapeId:OWNER,goals:[{id:'11111111-1111-4111-8111-111111111111',title:'Explicit graph prerequisite test fixture',contains:[],requires:[],weight:1}]}
const nativeGraphFixture=evaluateGraphIntegrity(graphFixture,[graphFixture]);assert.equal(nativeGraphFixture.status,'pass')
const other=['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302'].map(id=>({id,status:'pass',summary:'Explicit already-fulfilled independent gate test assumption; not a source verdict'}))
const routes:any=[{scopeId:'independent-route-test-fixture',maturity:'M4',selectedAtomicGoals:1,rules:[{id:'CQR-101',status:'pass'}]}]
const policy=(minimumMaturity:string)=>({schemaVersion:1,policyId:'private-actual-q3-consumer-test',baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:OWNER,frameworkId:'native-q3-test',subject:'Actual Q3 coverage consumer test',minimumMaturity,reason:'Native real-source coverage negative test only'}]})
function run(name:string,s:any,expectedFail:string[]){
 const src:any=captureCurriculumSource('fixtures/actual-history-q3-'+name+'.json',JSON.stringify(s)),ids=src.goals.filter((g:any)=>g.examData||g.nodeKind==='exam').map((g:any)=>g.id).sort(),retainedCoverage=createRetainedCoverageContext(R,src,ids,[],[])!
 const scope:any=Object.freeze({landscapeId:OWNER,definitionGoalIds:Object.freeze(ids),requiredGoalIds:Object.freeze([]),discoveryIssues:Object.freeze([]),retainedCoverage})
 const rules:any=[nativeGraphFixture,...other,...evaluateCurriculumExamReadiness(src,[],[src],scope)],structure=rules.find((r:any)=>r.id==='CQR-204'),manifest=retainedCoverage.manifest
 assert.deepEqual(manifest.failingGoalIds,expectedFail);assert.equal(structure.status,'fail');assert.equal(hasCompletePassingCurriculumExamReadiness(rules,OWNER,scope),false)
 const maturity=deriveCurriculumMaturity(rules,routes,OWNER,scope);assert.equal(maturity,'M3')
 const forged=structuredClone(rules),r=forged.find((r:any)=>r.id==='CQR-204');r.status='pass';r.metrics.weakExamData=0;r.metrics.discoveryIssues=0;r.assessmentValidation.failingGoalIds=[]
 const m=r.assessmentValidation.retainedCoverageManifest;m.status='pass';m.failingGoalIds=[];m.discoveryIssues=[];for(const row of m.rows){row.issues=[];row.decision=row.historyKind==='declared'?'declared-preserved':'undeclared-preserved'}
 assert.equal(hasCompletePassingCurriculumExamReadiness(forged,OWNER,scope),false);assert.equal(deriveCurriculumMaturity(forged,routes,OWNER,scope),'M3')
 const floors=Object.fromEntries(['M6','M7'].map(level=>{const failures=collectCurriculumMaturityFloorFailures({curricula:[{landscapeId:OWNER,frameworkId:'native-q3-test',subject:'Actual Q3 coverage consumer test',maturity:'M7',rules:forged,scopes:routes}]},policy(level),new Map([[OWNER,scope]]));assert.ok(failures.some(s=>s.includes('assessment reports bound to current source discovery')));return[level,failures]}))
 return{name,manifest,structure,allAssessmentRules:rules.filter((r:any)=>r.id.startsWith('CQR-20')),isolatedOtherPrerequisitesOnly:true,actualHistoricalGraphClaim:false,maturity,forgedM7Rejected:true,floors}
}
const results=[];results.push(run('historical-control',structuredClone(history),[]))
for(let i=0;i<2;i++){const s=structuredClone(history);g(s,C).contains.push(A);g(s,Q[1-i]).examData.coveredGoalIds=old(Q[1-i]);const r=run('actual-q3-'+i,s,[Q[i]]),row=r.manifest.rows.find((r:any)=>r.goalId===Q[i]);assert.equal(row.coverage.historyAtomicGoalKeys.length,[21,18][i]);assert.equal(row.coverage.currentAtomicGoalKeys.length,[22,19][i]);results.push(r)}
const pinned=structuredClone(history);g(pinned,C).contains.push(A);for(const id of Q)g(pinned,id).examData.coveredGoalIds=old(id);results.push(run('actual-native-explicit-pins',pinned,[]))
const report={historicalSourceSha256:createHash('sha256').update(raw).digest('hex'),status:'All native actual-source expectations passed; no curricular maturity approval',limitation:'Historical and explicit-pin controls retain six real material structure errors. Independent graph/routes are an explicit test fixture only; the separate sealed T21 proves a sole coverage error with otherwise real native passing fixture. This does not label a real Info graph or material M6.',results}
writeFileSync(W+'/actual-q3-consumer-chain.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases:results.map(r=>({name:r.name,retained:r.manifest.status,retainedFailures:r.manifest.failingGoalIds,structure:r.structure.status,structureWeak:r.structure.metrics.weakExamData,maturity:r.maturity,forgedM7Rejected:r.forgedM7Rejected})),status:'pass'}))
