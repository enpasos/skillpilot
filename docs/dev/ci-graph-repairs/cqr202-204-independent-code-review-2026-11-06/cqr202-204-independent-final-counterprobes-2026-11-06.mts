import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {discoverCurriculumAssessmentScope,evaluateCurriculumExamReadiness,evaluateGraphIntegrity,deriveCurriculumMaturity} from '../app/scripts/generateCurriculumQualityStatus.ts'
import {collectCurriculumMaturityFloorFailures} from '../app/scripts/checkCurriculumMaturityFloors.ts'
import {hasCompletePassingCurriculumExamReadiness} from '../app/scripts/lib/curriculumAssessmentValidation.ts'
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const expectedPins:any={
'app/scripts/generateCurriculumQualityStatus.ts':'694b3f424d693636c3b7b0e670bdca7e912bf247ce66f3496f3a51d80fb23518',
'app/scripts/checkCurriculumMaturityFloors.ts':'c43382f6d6e94192718a7854e48116b0f6713b08f861bfe5fdd7d10d2051f94c',
'app/scripts/lib/curriculumAssessmentValidation.ts':'e7a933c348ab36ed3d7285247647e0c82aa8dd2e5f7630756ed079345ddffff7',
'app/scripts/testCurriculumExamReadiness.ts':'8a29bc20970673051e4ec2f3ed4867279480807e3c14ee0e6f39b8ad116adda7',
'app/scripts/testCurriculumGraphMaturity.ts':'1f4b5d900e768113c47c0c84d191d6ba97f0277758f7a673b1657d041ac15c86',
'app/scripts/testDeepUnderstandingRollout.ts':'42a4423ee3ee7fa14f6ab58bd765b725ceaa1a754952e2784453125c1b6a531c',
'docs/qa-ci/curriculum-quality-maturity-and-routes.md':'9bebd640355115aae57f578133d67edc2c7975a762acb4ee5211c7fbe3d4ac13'}
for(const [p,h] of Object.entries(expectedPins))assert.equal(hash(p),h,p)
const mathPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const math=JSON.parse(readFileSync(mathPath,'utf8'));const original=math.goals.find((g:any)=>g.id==='311ab2f2-3364-5166-ac22-3ef01419fee4')
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',owner='independent-assessment-final-review'
const landscape:any={landscapeId:owner,title:'Independent source fixture',goals:[{id:A,title:'Concrete exam',weight:1,contains:[],requires:[],nodeKind:'exam',examData:original.examData,release:{kind:'offer',status:'released',examYear:2026,courseLevel:'GK'}}]}
const scopes:any=[{scopeId:'independent',label:'Independent',maturity:'M4',selectedAtomicGoals:1,rules:[{id:'CQR-101',status:'pass'}]}]
const policy=(level:string)=>({schemaVersion:1,policyId:'independent-final-review',baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:owner,frameworkId:'fixture',subject:'Fixture',minimumMaturity:level,reason:'Existing protected floor'}]})
function bundle(raw=landscape,catalog:any[]=[raw]){
 const graph=evaluateGraphIntegrity(raw,catalog);assert.equal(graph.status,'pass')
 const expected=discoverCurriculumAssessmentScope(raw,[],catalog)
 const rules:any=[graph,...['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302','CQR-303'].map(id=>({id,status:'pass',summary:'Unchanged independent fixture requirement'})),...evaluateCurriculumExamReadiness(raw,[],catalog,expected)]
 return {rules,expected}
}
const results:any[]=[]
function check(name:string,b:any,negative=true,omitExpected=false){
 const expected=omitExpected?undefined:b.expected
 const derived=deriveCurriculumMaturity(b.rules,scopes,owner,expected)
 assert.equal(derived,negative?'M3':'M7',name+' derive')
 const floors=['M6','M7'].map(level=>{
  const failures=collectCurriculumMaturityFloorFailures({curricula:[{landscapeId:owner,frameworkId:'fixture',subject:'Fixture',maturity:'M7',rules:b.rules,scopes}]},policy(level),expected?new Map([[owner,expected]]):undefined)
  if(negative){assert(failures.some(f=>f.includes('no complete passing assessment reports bound to current source discovery')),name+' actual assessment rejection');assert(!failures.some(f=>f.includes('identity mismatch')||f.includes('strict graph-integrity')),name+' no unrelated failure')}
  else assert.deepEqual(failures,[],name+' valid floor control')
  return {floor:level,failures}
 })
 results.push({case:name,derived,claimedM7Floor:floors});console.log('PASS',name)
}
check('valid_source_bound_control',bundle(),false)
for(const id of ['CQR-202','CQR-204']){
 const missing=bundle();missing.rules=missing.rules.filter((r:any)=>r.id!==id);check('missing_'+id,missing)
 const failed=bundle();failed.rules=failed.rules.map((r:any)=>r.id===id?{...r,status:'fail',assessmentValidation:{...r.assessmentValidation,failingGoalIds:[A]}}:r);check('failed_'+id,failed)
 const duplicate=bundle();duplicate.rules.push(duplicate.rules.find((r:any)=>r.id===id));check('duplicate_'+id,duplicate)
}
for(const adjusted of [false,true]){
 const cut=bundle();cut.rules=cut.rules.map((r:any)=>r.assessmentValidation?{...r,assessmentValidation:{...r.assessmentValidation,requiredGoalIds:[],checkedGoalIds:r.id==='CQR-202'?[]:r.assessmentValidation.checkedGoalIds},metrics:adjusted?{...r.metrics,requiredExams:0,checkedExams:r.id==='CQR-202'?0:r.metrics.checkedExams}:r.metrics}:r)
 check('joint_required_truncation_'+(adjusted?'consistent_adjusted_metrics':'original_metrics'),cut)
}
const allCut=bundle();allCut.rules=allCut.rules.map((r:any)=>r.assessmentValidation?{...r,assessmentValidation:{...r.assessmentValidation,definitionGoalIds:[],requiredGoalIds:[],checkedGoalIds:[]},metrics:{examDefinitions:0,requiredExams:0,checkedExams:0,weakExamData:0,discoveryIssues:0}}:r);check('all_sets_jointly_empty_with_consistent_zero_metrics',allCut)
const inPlace=bundle();assert(Object.isFrozen(inPlace.expected));assert(Object.isFrozen(inPlace.expected.definitionGoalIds));assert(Object.isFrozen(inPlace.expected.requiredGoalIds))
for(const r of inPlace.rules.filter((r:any)=>r.assessmentValidation)){
 const m=r.assessmentValidation;assert.notEqual(m.definitionGoalIds,inPlace.expected.definitionGoalIds);assert.notEqual(m.requiredGoalIds,inPlace.expected.requiredGoalIds);assert.notEqual(m.discoveryIssues,inPlace.expected.discoveryIssues)
 for(const field of ['definitionGoalIds','requiredGoalIds','checkedGoalIds'])m[field].splice(0)
 Object.assign(r.metrics,{examDefinitions:0,requiredExams:0,checkedExams:0})
}
assert.deepEqual(inPlace.expected.definitionGoalIds,[A]);assert.deepEqual(inPlace.expected.requiredGoalIds,[A]);check('in_place_report_mutation_leaves_native_expectation_unchanged',inPlace)
const main={...landscape,goals:landscape.goals.map((g:any)=>({...g,requires:['foreign:'+B]}))}
const foreign:any={landscapeId:'foreign',title:'Foreign source',goals:[{id:B,title:'Foreign ordinary prerequisite',weight:1,contains:[],requires:[]}]}
const ownerCase=bundle(main,[main,foreign]);check('valid_foreign_prerequisite_control',ownerCase,false)
const ownerWrong={...ownerCase,rules:ownerCase.rules.map((r:any)=>r.assessmentValidation?{...r,assessmentValidation:{...r.assessmentValidation,definitionGoalIds:[B],requiredGoalIds:[B],checkedGoalIds:[B]}}:r)};check('checked_foreign_B_cannot_replace_root_exam_A',ownerWrong)
const spoofExpected={...ownerCase.expected,definitionGoalIds:[B],requiredGoalIds:[B]}
assert.equal(hasCompletePassingCurriculumExamReadiness(ownerWrong.rules,owner,spoofExpected),false,'Even substituted expected claims must obey exact rootOwner:goal keys')
results.push({case:'exact_owner_key_guard_even_with_spoofed_expected_set',sharedValidator:false,graphCheckedGoalKeys:ownerCase.rules.find((r:any)=>r.id==='CQR-001').graphIntegrity.checkedGoalKeys})
check('missing_native_expected_context_fails_closed',bundle(),true,true)
for(const [p,h] of Object.entries(expectedPins))assert.equal(hash(p),h,p+' final freeze')
const infoPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';assert.equal(hash(infoPath),'00bcdbaf0723441eea0e33dfef36c674ed865b61d7009705cd6c83241a897422')
const out={schemaVersion:1,status:'PASS',method:'Native source discovery, actual graph/assessment producer, actual derive and direct persisted-M7 floor consumer. No second scope engine or report-derived expected sets.',implementationPins:Object.entries(expectedPins).map(([path,sha256])=>({path,sha256})),mathPositiveBinding:{path:mathPath,goalId:original.id,sha256:hash(mathPath)},activeInfoBinding:{path:infoPath,sha256:hash(infoPath)},results,fullCqrProducerInvoked:false,sourceFilesWritten:false}
writeFileSync('tmp/cqr202-204-independent-final-counterprobes-2026-11-06.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,cases:results.length}))
