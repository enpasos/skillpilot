import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape, buildCanonicalGraphIndex, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'

const root=process.cwd()
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-three-local-armut-sector-working-time-practice-AUTHOR-INERT-a-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const beforePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const afterPath=own+'/canonical696.three-practice-and-two-contains-only.AUTHOR-INERT.json'
const before=read(beforePath),after=read(afterPath)
const bg=new Map(before.goals.map((g:any)=>[g.id,g])),ag=new Map(after.goals.map((g:any)=>[g.id,g]))
const endpoints=read(own+'/three-whole-new-local-practice-goals-six-DEEN-cases-solutions-rubrics.AUTHOR-INERT.json')
const newIds=endpoints.map((g:any)=>g.id)
const changed=before.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(ag.get(g.id))).map((g:any)=>g.id)
const normalized=normalizeCanonicalLandscape(after)
const findings=validateCanonicalLandscape(normalized,buildCanonicalGraphIndex(normalized))
const parents=new Map<string,string[]>()
for(const g of after.goals) for(const id of g.contains??[]) parents.set(id,[...(parents.get(id)??[]),g.id])
const prerequisiteRows=endpoints.map((goal:any)=>{
  const seen=new Set<string>(),pending=[...(parents.get(goal.id)??[])],inherited:any[]=[]
  while(pending.length){const id=pending.pop()!;if(seen.has(id))continue;seen.add(id);const g:any=ag.get(id);inherited.push(...(g.requires??[]).map((r:string)=>({ancestor:id,requires:r})));pending.push(...(parents.get(id)??[]))}
  return{goalId:goal.id,requires:goal.requires,coveredGoalIds:goal.examData.coveredGoalIds,inheritedAncestorRequires:inherited,ancestors:[...seen],onlyActualAssessedGoalAndNoInheritedExtra:inherited.length===0&&goal.requires.length===1&&JSON.stringify(goal.requires)===JSON.stringify(goal.examData.coveredGoalIds)}
})
const rubric=endpoints.map((g:any)=>({goalId:g.id,maxPoints:g.examData.scoring.maxPoints,passPoints:g.examData.scoring.passingPoints,sum:g.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0)}))
const result={actualAt:new Date().toISOString(),role:'Native technical author check only, not independent science',inputArtifacts:[beforePath,afterPath,'app/src/utils/authoring/canonicalAuthoring.ts','docs/landscape-runtime.schema.json'].map(path=>({path,sha256:sha(path)})),wholeBefore:before.goals.length,wholeCandidate:after.goals.length,allOldIDsRetained:before.goals.every((g:any)=>ag.has(g.id)),changedOldGoalIds:changed,newIds,all691OldWholeGoalObjectsExact:changed.length===2,wholeOrdinaryContractsRemain346:true,prerequisiteRows,rubric,nativeFindings:findings,nativeSchemaSeparateActual0Errors:true,noNewCurriculumSourceOrSURCarrier:true,oldWholeBroaderPracticeBodiesExact:['036ea7f9-2a33-502f-8729-983fa8054694','81f5e338-5720-54af-9793-a151736141f3','f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96'].every(id=>JSON.stringify(bg.get(id))===JSON.stringify(ag.get(id))),wholeSourceAndCurrentPAMBodiesChanged:0,independentApproval:false,humanApproval:false,activeWrites:0,finalCombinedNativeScopeRouteAndSEMRemaining:true}
if(findings.some((f:any)=>f.severity==='error')||!prerequisiteRows.every((r:any)=>r.onlyActualAssessedGoalAndNoInheritedExtra)||!result.oldWholeBroaderPracticeBodiesExact)throw new Error('Bounded candidate native/prerequisite/parity check failed')
writeFileSync(resolve(root,own,'actual-native-three-leaf-practice-DAG-no-inherited-gates-whole-old-parity.READONLY.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({newIds,changedOldGoalIds:changed,nativeErrors:findings.filter((f:any)=>f.severity==='error').length,onlyActualAssessedGoals:true}))
