import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {pathToFileURL} from 'node:url'
const folder=path.dirname(new URL(import.meta.url).pathname),repo=process.cwd()
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const original=read(canonicalPath),canonicalSha256=hash(canonicalPath),candidate=read(path.join(folder,'candidate.json'))
const plan=read('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/b046h-he-scope-minimal-change-plan.json')
const newGoal=candidate.assessmentGoal,newCluster=candidate.placementCluster,target=candidate.coveredGoalId
const q25Id='b3d2284c-21e0-5af8-942a-a4c11390c84a',q24Id='d6d8904c-896f-5850-8181-06c223346b80',markovId='e4656e83-3f33-5bda-b0bc-d4b63ec4653e'
const {compileCompositionView,collectCompositionProjectionRoleGoalIds:collect}=await import(pathToFileURL(path.join(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const baseline=structuredClone(original),shadow=structuredClone(original)
assert(!shadow.goals.some(g=>g.id===newGoal.id||g.id===newCluster.id),'Candidate already integrated; need a new baseline')
shadow.goals.push(newGoal,newCluster)
const parent=shadow.goals.find(g=>g.id===q25Id)
assert(parent.contains.includes(target))
parent.contains.push(newCluster.id)
const shared=shadow.goals.find(g=>g.id===candidate.sharedAssessmentIdToPreserve),sharedBefore=original.goals.find(g=>g.id===shared.id)
shared.requires=shared.requires.filter(id=>id!==target)
shared.examData.coveredGoalIds=shared.examData.coveredGoalIds.filter(id=>id!==target)
for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring']) assert.deepEqual(shared.examData[field],sharedBefore.examData[field])
const beforeMap=new Map(baseline.goals.map(g=>[g.id,g])),afterMap=new Map(shadow.goals.map(g=>[g.id,g])),roots=new Map([[original.landscapeId,original.goals.find(g=>g.tags?.includes('root')).id]])
const viewDir='curricula/DE/Gymnasium/composition-views/mathematik',views=[],gkOperations=[]
function applyGkDelta(view,file) {
 const p=plan.views.find(v=>v.file===file)
 if(!p)return
 const replacements=p.operations.filter(o=>o.op==='replace')
 let replacementsApplied=0,markovRemoved=0
 function walk(v) {
  if(!v||typeof v!=='object')return
  for(const[k,value]of Object.entries(v)) {
   if(Array.isArray(value))for(let i=value.length-1;i>=0;i--){
    const x=value[i]
    if(x?.kind==='canonicalSubtree'&&[q24Id,q25Id].includes(x.goalId)) {
     const op=replacements.find(r=>r.before.goalId===x.goalId);assert(op)
     value[i]=structuredClone(op.value);replacementsApplied++
    } else if(x?.kind==='goalEntry'&&x.goalId===markovId) {value.splice(i,1);markovRemoved++}
    else walk(x)
   }else if(value&&typeof value==='object')walk(value)
  }
 }
 walk(view)
 assert.equal(replacementsApplied,2,file+' expected both HE-GK scope replacements')
 assert.equal(markovRemoved,1,file+' expected the LK Markov endpoint removal')
 gkOperations.push({file,replacementsApplied,markovRemoved})
}
for(const name of fs.readdirSync(viewDir).filter(n=>n.endsWith('.view.json')).sort()) {
 const file=path.join(viewDir,name),view=read(file),beforeSha256=hash(file)
 const rawBefore=collect(view.rootNodes,beforeMap,roots)
 applyGkDelta(view,file)
 const finalScopeBeforeEndpoint=collect(view.rootNodes,beforeMap,roots),after=collect(view.rootNodes,afterMap,roots)
 const hasRotation=after.targetGoalIds.has(target),hasExam=after.targetGoalIds.has(newGoal.id)
 assert.equal(hasExam,hasRotation,file+' endpoint and rotation target sets differ')
 assert.equal(after.targetGoalIds.has(newCluster.id),hasRotation,file+' cluster and rotation sets differ')
 assert(!after.prerequisiteOnlyGoalIds.has(newGoal.id),file+' accidental prerequisiteOnly assessment')
 const added=[...after.targetGoalIds].filter(id=>!finalScopeBeforeEndpoint.targetGoalIds.has(id)),removed=[...finalScopeBeforeEndpoint.targetGoalIds].filter(id=>!after.targetGoalIds.has(id))
 assert.deepEqual(removed,[],file+' unexpected removal by endpoint insertion')
 assert.deepEqual(added.sort(),hasRotation?[newGoal.id,newCluster.id].sort():[],file+' extra target gained')
 const errors=compileCompositionView(view,shadow).findings.filter(f=>f.severity==='error')
 assert.deepEqual(errors,[],file+' native compiler errors')
 assert.equal(hash(file),beforeSha256,file+' changed during simulation')
 views.push({file,scope:view.scope,beforeSha256,rotationTargetAfterScopeFix:hasRotation,newAssessmentTarget:hasExam,sharedAssessmentTarget:after.targetGoalIds.has(shared.id),endpointOnlyAddedTargets:added,endpointOnlyRemovedTargets:removed,fullDeltaRemovedTargets:[...rawBefore.targetGoalIds].filter(id=>!after.targetGoalIds.has(id)),compilerErrorCount:errors.length})
}
assert.equal(gkOperations.length,4)
assert.equal(views.filter(v=>v.newAssessmentTarget).length,72)
assert(views.filter(v=>v.scope.jurisdiction==='DE-HE'&&v.scope.courseProfile==='GK').every(v=>!v.rotationTargetAfterScopeFix&&!v.newAssessmentTarget))
const parents=new Map(shadow.goals.map(g=>[g.id,g]))
for(const edge of ['contains','requires']){
 const active=new Set(),done=new Set()
 const visit=id=>{if(done.has(id))return;assert(!active.has(id),edge+' cycle');active.add(id);for(const next of parents.get(id)?.[edge]??[]){assert(parents.has(next));visit(next)}active.delete(id);done.add(id)}
 for(const goal of shadow.goals)visit(goal.id)
}
assert.equal(hash(canonicalPath),canonicalSha256,'Canonical changed during simulation')
console.log(JSON.stringify({schemaVersion:1,kind:'alternative-q25-placement-author-simulation',status:'candidate_not_applied',reviewAuthority:'ai_candidate',checkedAt:new Date().toISOString(),canonicalPath,canonicalSha256,candidateSha256:hash(path.join(folder,'candidate.json')),placement:{parentGoalId:q25Id,childClusterId:newCluster.id,assessmentGoalId:newGoal.id,manualLkViewInsertions:0,qaTerminalClusterBinderStillRequired:true},allViewCount:views.length,exactTargetEquivalence:true,rotationTargetViewCount:72,assessmentTargetViewCount:72,viewBreakdown:{hessenLk:views.filter(v=>v.newAssessmentTarget&&v.scope.jurisdiction==='DE-HE').length,otherJurisdictions:views.filter(v=>v.newAssessmentTarget&&v.scope.jurisdiction&&v.scope.jurisdiction!=='DE-HE').length,national:views.filter(v=>v.newAssessmentTarget&&!v.scope.jurisdiction).length,otherGk:views.filter(v=>v.newAssessmentTarget&&v.scope.courseProfile==='GK'&&v.scope.jurisdiction!=='DE-HE').length},gkOperations,sharedAssessmentTaskSolutionScoringUnchanged:true,newCurricularAtomicGoalCount:0,existingGoalTargetAdditions:0,containsAndRequiresDag:true,independentSubstantiveAssessmentReview:'open_in_candidate',views,limits:['This is the parent-requested conditional placement candidate, not a canonical/view/QA mutation.','Other GK views that already target the rotation competence gain the corresponding assessment; this is not universally LK-only visibility. No view gains the rotation competence itself.','The four HE-GK scope changes are part of the in-memory simulation; removing only the false shared coverage without these changes is a different state.','Global APV/source/route/release/CQR/Maturity gates still belong to integration; do not infer them from target-set equivalence.']},null,2))

