import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'

const repo = process.cwd()
const folder = path.dirname(new URL(import.meta.url).pathname)
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const sha = (p) => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const candidate = read(path.join(folder, 'candidate.json'))
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const original = read(canonicalPath)
const beforeDigest = sha(canonicalPath)
const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const candidateGoal = candidate.assessmentGoal
const cluster = candidate.placementCluster
const target = candidate.coveredGoalId
const parentId = '98dcf9bd-d119-5eb1-835c-7d719f67b485'
const existingPractice = '14b19ee4-364e-50bd-b6a3-499471356ef3'
const allowedViews = new Set(['de-he-lk.view.json', 'de-he-sekii-lk.view.json', 'de-he-lk-g8.view.json', 'de-he-lk-g9.view.json'])
assert.equal(candidate.independentReviewStatus, 'open')
assert.equal(candidateGoal.examData.reviewStatus, 'needs_review')
assert.deepEqual(candidateGoal.requires, [target])
assert.deepEqual(candidateGoal.examData.coveredGoalIds, [target])
assert.equal(candidateGoal.extendedData.applicabilityFromRequires, true)
assert.deepEqual(candidateGoal.applicability, original.goals.find(g => g.id === target).applicability)
assert.equal(candidateGoal.examData.scoring.steps.reduce((a, s) => a + s.points, 0), 20)
assert.equal(candidateGoal.examData.scoring.maxPoints, 20)
assert.equal(candidateGoal.examData.scoring.passingPoints, 10)
assert.equal(new Set(candidateGoal.examData.scoring.steps.map(s => s.id)).size, candidateGoal.examData.scoring.steps.length)
for (const g of [candidateGoal, cluster]) assert(!original.goals.some(x => x.id === g.id), 'Candidate ID already exists')
const mul = (m, v) => m.map(r => r.reduce((s, a, i) => s + a * v[i], 0))
const mm = (a, b) => a.map(r => b[0].map((_, j) => r.reduce((s, x, i) => s + x * b[i][j], 0)))
const det = m => m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0])
const norm2 = v => v.reduce((s, x) => s + x*x, 0)
const A = [[0,-1,0],[1,0,0],[0,0,1]], B = [[1,0,0],[0,0,1],[0,-1,0]], C = [[0,1,0],[-1,0,0],[0,0,1]]
const I = [[1,0,0],[0,1,0],[0,0,1]], basis = [[1,0,0],[0,1,0],[0,0,1]], P = [2,-1,3]
assert.deepEqual(mul(A, P), [1,2,3]); assert.deepEqual(mul(B, P), [2,3,1])
assert.deepEqual(basis.map(v => mul(A,v)), [[0,1,0],[-1,0,0],[0,0,1]])
assert.deepEqual(basis.map(v => mul(B,v)), [[1,0,0],[0,0,-1],[0,1,0]])
assert.deepEqual(mul(C,basis[0]), [0,-1,0]); assert.deepEqual(mm(A,C), I)
for (const m of [A,B,C]) { assert.equal(det(m),1); assert.deepEqual(mm(m[0].map((_,j) => m.map(r => r[j])),m),I) }
let normSamples = 0
for (let x=-2;x<=2;x++) for(let y=-2;y<=2;y++) for(let z=-2;z<=2;z++) {
  for(const m of [A,B,C]) assert.equal(norm2(mul(m,[x,y,z])),norm2([x,y,z]))
  assert.deepEqual(mul(A,[0,0,z]),[0,0,z]); normSamples++
}
const katex = (await import(pathToFileURL(path.join(repo,'app/node_modules/katex/dist/katex.mjs')).href)).default
let renderedFormulaCount=0
for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn']) {
  for(const match of candidateGoal.examData[field].matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g)) {
    katex.renderToString(match[1] ?? match[2], {throwOnError:true, displayMode:!!match[1]}); renderedFormulaCount++
  }
}
const {compileCompositionView,collectCompositionProjectionRoleGoalIds} = await import(pathToFileURL(path.join(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const shadow = structuredClone(original)
shadow.goals.push(candidateGoal,cluster)
const parent = shadow.goals.find(g => g.id===parentId)
parent.contains.push(cluster.id)
const shared = shadow.goals.find(g => g.id===candidate.sharedAssessmentIdToPreserve)
const sharedBefore = original.goals.find(g => g.id===shared.id)
shared.requires=shared.requires.filter(id=>id!==target)
shared.examData.coveredGoalIds=shared.examData.coveredGoalIds.filter(id=>id!==target)
for(const field of ['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring']) assert.deepEqual(shared.examData[field],sharedBefore.examData[field])
const acyclic = edge => {
 const byId=new Map(shadow.goals.map(g=>[g.id,g])),active=new Set(),done=new Set()
 const visit=id=>{if(done.has(id))return;assert(!active.has(id),edge+' cycle '+id);active.add(id);for(const next of byId.get(id)?.[edge]??[]) {assert(byId.has(next),'missing '+next);visit(next)}active.delete(id);done.add(id)}
 for(const g of shadow.goals)visit(g.id)
}
acyclic('contains');acyclic('requires')
const roots=new Map([[original.landscapeId,original.goals.find(g=>g.tags?.includes('root')).id]])
const beforeMap=new Map(original.goals.map(g=>[g.id,g])),afterMap=new Map(shadow.goals.map(g=>[g.id,g]))
const views=[],placements=[]
function insertSibling(node,pointer,file) {
 if(!node || typeof node!=='object')return 0
 let count=0
 for(const[k,v]of Object.entries(node)) {
  if(Array.isArray(v)) {
   const index=v.findIndex(x=>x?.kind==='canonicalSubtree'&&x.goalId===existingPractice)
   if(index>=0) {
    const value={kind:'canonicalSubtree',goalId:cluster.id}
    placements.push({file:viewDir+'/'+file,beforeSha256:sha(viewDir+'/'+file),op:'add',path:pointer+'/'+k+'/'+(index+1),anchor:{kind:'canonicalSubtree',goalId:existingPractice},value})
    v.splice(index+1,0,value);count++
   }
   for(let i=0;i<v.length;i++) count+=insertSibling(v[i],pointer+'/'+k+'/'+i,file)
  } else if(v&&typeof v==='object')count+=insertSibling(v,pointer+'/'+k,file)
 }
 return count
}
for(const file of fs.readdirSync(viewDir).filter(f=>f.endsWith('.view.json')).sort()) {
 const old=read(path.join(viewDir,file)),view=structuredClone(old)
 if(allowedViews.has(file)) assert.equal(insertSibling(view,'',file),1)
 const before=collectCompositionProjectionRoleGoalIds(old.rootNodes,beforeMap,roots)
 const after=collectCompositionProjectionRoleGoalIds(view.rootNodes,afterMap,roots)
 const isAllowed=allowedViews.has(file)
 assert.equal(after.targetGoalIds.has(candidateGoal.id),isAllowed,file+' unintended assessment visibility')
 assert.equal(after.targetGoalIds.has(cluster.id),isAllowed,file+' unintended cluster visibility')
 assert(!after.prerequisiteOnlyGoalIds.has(candidateGoal.id))
 const added=[...after.targetGoalIds].filter(id=>!before.targetGoalIds.has(id)),removed=[...before.targetGoalIds].filter(id=>!after.targetGoalIds.has(id))
 assert.deepEqual(removed,[])
 assert.deepEqual(added.sort(),isAllowed?[cluster.id,candidateGoal.id].sort():[])
 if(isAllowed) assert(after.targetGoalIds.has(target),file+' missing assessed content goal')
 const compilation=compileCompositionView(view,shadow)
 const baseErrors=compileCompositionView(old,original).findings.filter(x=>x.severity==='error')
 const errors=compilation.findings.filter(x=>x.severity==='error')
 assert.deepEqual(errors,baseErrors,file+' new compiler errors')
 views.push({file:viewDir+'/'+file,scope:view.scope,assessmentTarget:after.targetGoalIds.has(candidateGoal.id),addedTargets:added,removedTargets:removed,compilerErrorCount:errors.length,baselineCompilerErrorCount:baseErrors.length})
}
assert.equal(placements.length,4)
assert.equal(sha(canonicalPath),beforeDigest,'Canonical was changed while checking; re-run against stable snapshot')
console.log(JSON.stringify({schemaVersion:1,kind:'author-self-check-not-independent-review',checkedAt:new Date().toISOString(),reviewAuthority:'ai_candidate',independentReviewStatus:'open',canonicalPath,canonicalSha256:beforeDigest,assessmentId:candidateGoal.id,clusterId:cluster.id,scoring:{total:20,passing:10},math:{A,B,C,imagePz:mul(A,P),imagePx:mul(B,P),normSamples,orthogonalityAndDeterminantChecks:true},renderedFormulaCount,dagChecks:['contains','requires'],sharedAssessmentTaskSolutionScoringUnchanged:true,allViewCount:views.length,assessmentTargetViewCount:views.filter(v=>v.assessmentTarget).length,unintendedTargetCount:0,placements,views,limits:['Author self-check, not independent substantive approval.','Only the endpoint placement is simulated; the separate GK scope plan is not applied here.','No global route/CQR/Maturity report run; releaseStatus remains needs_review and intentionally blocks release gates.','Other jurisdictions receive no new target; their rotation-route disposition after removal of false shared coverage remains a separate integration check.']},null,2))
