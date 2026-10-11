import {readFileSync,writeFileSync} from 'node:fs'
import {buildAtomicDirectRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView} from './actual-all-route-quality-original-body-export-probe.ts'
const root='/home/enpasos/projects/skillpilot'
const relative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const meta=read(base+'/actual-own-CAN407-reviewed-material-isolate-and-bounded-five-support-scope.author.receipt.json')
const can=read(base+'/whole-V13-CAN407-four-exact-Root-machine-released-materials.inert.candidate.json')
const exams=read(root+'/'+meta.exactIndependentMaterialRelease.path)
const edges=buildAtomicDirectRequiresEdges(can)
const results:any[]=[]
for(const course of ['GK','LK']){
 const view=meta.physicalIsolate+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
 const target=collectRenderedAtomicGoalIdsFromCompositionView(can,view,[course],false)
 const visible=collectRenderedAtomicGoalIdsFromCompositionView(can,view,[course],true)
 for(const exam of exams){
  const queue=[...(edges.get(exam.id)??[])],seen=new Set<string>()
  while(queue.length){const id=queue.shift()!;if(seen.has(id))continue;seen.add(id);queue.push(...(edges.get(id)??[]))}
  const rows=[...seen].sort().map(id=>({goalId:id,title:can.goals.find((g:any)=>g.id===id)?.title,targetVisible:target.has(id),prerequisiteOnlyVisible:visible.has(id)&&!target.has(id),available:visible.has(id)}))
  results.push({courseProfile:course,examGoalId:exam.id,examTargetVisible:target.has(exam.id),actualTransitiveAtomicPrerequisites:rows,missingPrerequisites:rows.filter(r=>!r.available)})
 }
}
const missing=results.flatMap(r=>r.missingPrerequisites.map((p:any)=>({courseProfile:r.courseProfile,examGoalId:r.examGoalId,...p})))
writeFileSync(base+'/actual-four-reviewed-exams-GK-LK-transitive-atomic-prerequisite-closure.native.json',JSON.stringify({schemaVersion:1,kind:'targeted-technical-course-filtered-transitive-prerequisite-closure-for-four-reviewed-exams',actualExamCourseScopes:results.length,actualPrerequisiteOccurrences:results.reduce((n,r)=>n+r.actualTransitiveAtomicPrerequisites.length,0),missingPrerequisiteOccurrences:missing,results,ownIndependentCourseApproval:false,descriptionReview:false,humanReview:false,newStrictClosures:0,liveWrites:[]},null,2)+'\n')
console.log(JSON.stringify({actualExamCourseScopes:results.length,actualPrerequisiteOccurrences:results.reduce((n,r)=>n+r.actualTransitiveAtomicPrerequisites.length,0),missing}))
if(missing.length)process.exitCode=1
