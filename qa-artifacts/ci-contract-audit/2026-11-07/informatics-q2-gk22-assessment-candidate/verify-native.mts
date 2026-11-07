// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync,readdirSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { discoverCurriculumAssessmentScope,evaluateCurriculumExamReadiness,evaluateExamTaskReadiness } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus'
import { findExamMarkdownTableIssues } from '/home/enpasos/projects/skillpilot/app/scripts/lib/examMarkdownValidation'
import { convertLearningGoal } from '/home/enpasos/projects/skillpilot/app/src/goalTypes'
import { resolveCoursePlanReferencedTopics,analyzeCoursePlanTaskCoverage } from '/home/enpasos/projects/skillpilot/app/src/utils/coursePlanTopicSelection'

const root=process.cwd(),base=resolve(process.argv[2]),output=process.argv[3]
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex')
const fixture=load(base+'/private-fixture.json'),goal=load(base+'/goal-draft.json')
const view=base+'/private-view.json',expected=goal.examData.coveredGoalIds
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv)
const goalSchema=load(root+'/contracts/curriculum-package/v1/compiled-landscape.schema.json')
const shape=ajv.compile({$schema:goalSchema.$schema,$defs:goalSchema.$defs,$ref:'#/$defs/goal'})
assert.ok(shape(goal),JSON.stringify(shape.errors))
const viewShape=ajv.compile(load(root+'/contracts/curriculum-package/v1/composition-view.schema.json'))
assert.ok(viewShape(load(view)),JSON.stringify(viewShape.errors))
assert.deepEqual(findExamMarkdownTableIssues(goal.examData.taskContent),[])
assert.deepEqual(findExamMarkdownTableIssues(goal.examData.solutionContent),[])
assert.equal(new Set(expected).size,22)
assert.equal(goal.examData.scoring.steps.length,22)
assert.equal(goal.examData.scoring.steps.reduce((sum:number,s:any)=>sum+s.points,0),110)
assert.equal(goal.examData.scoring.passingPoints,110)
const catalog=readdirSync(root+'/curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).sort()
 .map(f=>load(root+'/curricula/DE/Gymnasium/canonical/'+f)).map(l=>l.landscapeId===fixture.landscapeId?fixture:l)
const scope=discoverCurriculumAssessmentScope(fixture,[view],catalog)
assert.deepEqual(scope.discoveryIssues,[])
assert.ok(scope.definitionGoalIds.includes(goal.id));assert.ok(scope.requiredGoalIds.includes(goal.id))
const results=evaluateCurriculumExamReadiness(fixture,[view],catalog,scope)
const structure=results.find(r=>r.id==='CQR-204')!,readiness=results.find(r=>r.id==='CQR-202')!
assert.ok(!structure.assessmentValidation!.failingGoalIds.includes(goal.id),'Candidate must have complete retained-definition structure.')
assert.ok(readiness.assessmentValidation!.failingGoalIds.includes(goal.id),'Actual draft is not ready.')
const direct=evaluateExamTaskReadiness([goal])
assert.equal(direct.status,'fail');assert.ok(direct.details?.some(x=>x.includes('reviewStatus=draft')))
const ui=new Map(fixture.goals.map((g:any)=>[g.id,convertLearningGoal(g,{landscapeId:fixture.landscapeId})]))
const resolved=resolveCoursePlanReferencedTopics(expected,ui)
assert.deepEqual(resolved.invalidGoalIds,[]);assert.deepEqual([...resolved.atomicGoalIds].sort(),[...expected].sort())
const teacher=analyzeCoursePlanTaskCoverage([...expected,goal.id],ui)
assert.deepEqual(teacher.unknownTaskIds,[goal.id]);assert.equal(teacher.uncoveredGoalIds.length,22)
const negatives=[]
for(const [name,patch] of [
 ['missing-task',{taskContent:''}],['missing-solution',{solutionContent:''}],
 ['missing-rubric',{scoring:{...goal.examData.scoring,steps:[]}}],
 ['generic-solution',{solutionContent:'Erwartet wird eine fachlich korrekte, begründete und überprüfte Lösung, die die relevanten Kompetenzen des Abschnitts vernetzt nutzt.'}],
] as const){
 const next=structuredClone(fixture);next.goals.find((g:any)=>g.id===goal.id).examData={...goal.examData,...patch}
 const rules=evaluateCurriculumExamReadiness(next,[view],catalog.map(l=>l.landscapeId===fixture.landscapeId?next:l))
 const result=rules.find(r=>r.id==='CQR-204')!
 assert.ok(result.assessmentValidation!.failingGoalIds.includes(goal.id),name)
 negatives.push({name,candidateDetectedAsStructurallyWeak:true,result})
}
const reduced=resolveCoursePlanReferencedTopics(expected.slice(1),ui)
assert.deepEqual(reduced.invalidGoalIds,[]);assert.equal(reduced.atomicGoalIds.length,21)
const missing=resolveCoursePlanReferencedTopics([...expected.slice(1),'00000000-0000-4000-8000-000000000099'],ui)
assert.deepEqual(missing.invalidGoalIds,['00000000-0000-4000-8000-000000000099'])
const report={purpose:'actual-native-assessment-functions-on-private-full-owner-fixture-not-release-approval',
 candidateGoalId:goal.id,owner:fixture.landscapeId,goalSchemaPass:true,viewSchemaPass:true,markdownTableFindings:0,
 coverageResolution:resolved,definitionScope:scope,actualNativeRules:results,
 candidateStructureComplete:true,actualDraftReadinessBlocked:true,actualDraftTeacherTaskSelection:teacher,
 directDraftCheck:direct,negatives,undercoverageControl:{nativeResolution:reduced,missingExpectedIds:expected.filter((id:string)=>!reduced.atomicGoalIds.includes(id)),
  boundary:'The native material-shape check does not establish exact22 semantic coverage; this candidate separately binds its independently derived expected set.'},
 unknownCoverageControl:missing,
 currentCodeBindings:['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/lib/curriculumAssessmentValidation.ts','app/scripts/lib/examMarkdownValidation.ts','app/src/utils/coursePlanTopicSelection.ts',
 'contracts/curriculum-package/v1/compiled-landscape.schema.json','contracts/curriculum-package/v1/composition-view.schema.json'].map(path=>({path,sha256:hash(root+'/'+path)})),
 noReleasedStatusSubstitution:true,completeCurriculumPassClaimed:false,independentContentApproval:false,activeWrites:false}
writeFileSync(output,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({candidateGoalId:goal.id,coverage:resolved.atomicGoalIds.length,discoveryIssues:scope.discoveryIssues.length,
 candidateStructureComplete:true,draftReadinessBlocked:true,nativeMaterialNegatives:negatives.length,wholeCurriculumRules:results.map(r=>({id:r.id,status:r.status}))}))
