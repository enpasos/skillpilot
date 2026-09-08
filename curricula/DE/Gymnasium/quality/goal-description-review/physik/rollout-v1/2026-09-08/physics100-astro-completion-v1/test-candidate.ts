import assert from 'node:assert/strict'
import {buildCandidate} from './build-candidate.ts'
import {preserveB040PlacementsFromCurrent} from './view-generator-protection.ts'
import {ids,assessmentIds} from './assessment-drafts.mjs'
import {resolve} from 'node:path'
export function testCandidate(r:any){
 const cases:any[]=[]
 const relevant=new Set([...Object.values(ids),...Object.values(assessmentIds),'335a75b0-f691-5867-8ce3-3c971d541b9f'])
 const signatures=(v:any)=>{const result:string[]=[];const walk=(nodes:any[],anc:string[]=[])=>nodes.forEach(n=>{if(relevant.has(n.goalId))result.push(JSON.stringify([anc,n]));walk(n.children??[],[...anc,n.id??n.goalId])});walk(v.rootNodes);return result.sort()}
 for(const f of r.files.filter(f=>/composition-views\/physik\/de-(rp|sn|sl|th|hh)-.*\.view.json$/.test(f.path))){
  const current=JSON.parse(f.after),draft=structuredClone(current)
  // Simulate the precise template-copy regression: an unscoped new target at root.
  draft.rootNodes[0].children.push({kind:'goalEntry',goalId:ids.S})
  const sentinel={kind:'structure',id:'not-b040-test-sentinel',label:'Unrelated preserved neighbour',children:[]}
  draft.rootNodes[0].children.push(sentinel)
  preserveB040PlacementsFromCurrent(draft,current)
  assert.deepEqual(signatures(draft),signatures(current),f.path)
  assert(draft.rootNodes[0].children.some(n=>n.id===sentinel.id),'unrelated neighbour preserved')
  cases.push({path:f.path,exactB040PlacementSignatures:true,injectedRootLeakRemoved:true,unrelatedNeighbourPreserved:true})
 }
 assert.equal(cases.length,20)
 const sample=JSON.parse(r.files.find(f=>f.path.endsWith('/de-sn-gk.view.json'))!.after)
 assert.throws(()=>preserveB040PlacementsFromCurrent({...structuredClone(sample),scope:{...sample.scope,jurisdiction:'DE-HE'}},sample),/scope mismatch/)
 const bad=structuredClone(sample)
 const stripStage=(nodes:any[]):any[]=>nodes.filter(n=>n.id!=='physics-seki').map(n=>n.children?{...n,children:stripStage(n.children)}:n)
 bad.rootNodes=stripStage(bad.rootNodes)
 assert.throws(()=>preserveB040PlacementsFromCurrent(bad,sample),/missing reviewed stage anchor/)
 const tasks=r.landscape.goals.filter((g:any)=>Object.values(assessmentIds).includes(g.id))
 for(const task of tasks){assert.equal(task.examData.reviewStatus,'released');assert.deepEqual(task.requires,task.examData.coveredGoalIds);assert.equal(task.requires.length,task.id===assessmentIds.EX?2:1);assert.equal(task.examData.scoring.maxPoints,task.examData.scoring.steps.reduce((s:any,x:any)=>s+x.points,0))}
 return {status:'PASS',candidateCounts:r.plan.counts,dag:r.plan.dag,viewProtectionCases:cases,negativeCases:['cross-jurisdiction-copy rejected','missing original stage rejected'],actualNewTaskBodyCount:tasks.length,allCandidateFiles:r.files.length}
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)
 buildCandidate().then(testCandidate).then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1})
