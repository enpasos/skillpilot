import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {evaluateGraphIntegrity,evaluateCurriculumExamReadiness,deriveCurriculumMaturity} from '../app/scripts/generateCurriculumQualityStatus.ts'
import {collectCurriculumMaturityFloorFailures} from '../app/scripts/checkCurriculumMaturityFloors.ts'
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const source=JSON.parse(readFileSync(sourcePath,'utf8'))
const original=source.goals.find((g:any)=>g.id==='311ab2f2-3364-5166-ac22-3ef01419fee4')
const A='00000000-0000-4000-8000-000000000001',owner='independent-assessment-review'
const landscape:any={landscapeId:owner,title:'Review fixture',goals:[{id:A,title:'Concrete exam',weight:1,contains:[],requires:[],nodeKind:'exam',examData:original.examData,release:{kind:'offer',status:'released',examYear:2026,courseLevel:'GK'}}]}
const graph=evaluateGraphIntegrity(landscape,[landscape]);assert.equal(graph.status,'pass')
const checks=evaluateCurriculumExamReadiness(landscape,[])
const base=[graph,...['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302','CQR-303'].map(id=>({id,status:'pass',summary:'Unchanged independent fixture prerequisite'}))]
const scopes:any=[{scopeId:'review',label:'Review',maturity:'M4',selectedAtomicGoals:1,rules:[{id:'CQR-101',status:'pass'}]}]
const derive=(rules:any)=>deriveCurriculumMaturity(rules,scopes,owner)
const policy=(floor:string)=>({schemaVersion:1,policyId:'independent-review',baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:owner,frameworkId:'fixture',subject:'Fixture',minimumMaturity:floor,reason:'Existing hard floor'}]})
const floor=(rules:any)=>['M6','M7'].map(f=>({floor:f,failures:collectCurriculumMaturityFloorFailures({curricula:[{landscapeId:owner,frameworkId:'fixture',subject:'Fixture',maturity:'M7',rules,scopes}]},policy(f))}))
const good:any=[...base,...checks]
const results:any[]=[{case:'valid_control',derived:derive(good),floor:floor(good)}];assert.equal(results[0].derived,'M7');assert(results[0].floor.every((r:any)=>r.failures.length===0))
for(const id of ['CQR-202','CQR-204']){
 const missing=good.filter((r:any)=>r.id!==id)
 results.push({case:'missing_'+id,derived:derive(missing),claimedM7Floor:floor(missing)})
 const failed=good.map((r:any)=>r.id===id?{...r,status:'fail',assessmentValidation:{...r.assessmentValidation,failingGoalIds:[A]}}:r)
 results.push({case:'failed_'+id,derived:derive(failed),claimedM7Floor:floor(failed)})
}
const truncated=good.map((r:any)=>r.assessmentValidation?{...r,assessmentValidation:{...r.assessmentValidation,requiredGoalIds:[],checkedGoalIds:r.id==='CQR-202'?[]:r.assessmentValidation.checkedGoalIds}}:r)
results.push({case:'joint_readiness_truncation_with_original_metrics',actualRequired:checks[0].assessmentValidation?.requiredGoalIds,derived:derive(truncated),metrics:truncated.filter((r:any)=>r.assessmentValidation).map((r:any)=>r.metrics)})
const out={schemaVersion:1,method:'Actual graph checker and actual curriculum assessment producer on a concrete original Math exam payload, unchanged other fixture requirements, actual derive and direct floor collector; correct identity fields, no learner or mastery state.',sourceBinding:{path:sourcePath,sha256:hash(sourcePath),goalId:original.id},implementationPins:['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/checkCurriculumMaturityFloors.ts'].map(path=>({path,sha256:hash(path)})),results,fullCqrProducerInvoked:false,sourceFilesWritten:false}
const output=process.argv[2]??'tmp/cqr202-204-independent-consumer-probe-before-2026-11-06.json'
writeFileSync(output,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2))
