// SPDX-License-Identifier: Apache-2.0
// Run from repository root with app/node_modules/.bin/tsx <this-file>.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=resolve(process.argv[2]??process.cwd())
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/sn'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const hash=(v:any)=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex')
const rawHash=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const {normalizeCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {collectWholeMaterialPrerequisiteClosure}=await import(pathToFileURL(resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const report=read(base+'/review.actual.json')
assert.equal(report.schema,'independent-e1-saxon-source-stage-assessment-supersession-v1')
assert.equal(report.status,'PASS')
assert.deepEqual(report.approvedScopes.map((x:any)=>x.jurisdiction),['DE-SN'])
const docs=['PHYSIK','MATHEMATIK','CHEMIE'].map(s=>read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${s}.de.json`))
const landscape={...docs[0],goals:docs.flatMap(d=>d.goals)}
const byId=new Map(landscape.goals.map((g:any)=>[g.id,g]))
assert.equal(byId.size,landscape.goals.length,'preparation identities must be unique')
const normalized=normalizeCanonicalLandscape(landscape),normalizedById=new Map(normalized.goals.map((g:any)=>[g.id,g]))
assert.equal(rawHash(report.preparationBinding.path),report.preparationBinding.sha256)
for(const entry of read(report.preparationBinding.path).goals){
  const id=entry.goal.id
  assert.deepEqual(byId.get(id),entry.goal,`${id}: exact current dependency payload`)
  assert.equal(hash(byId.get(id)),entry.currentGoalJsonStringifySha256,`${id}: current JSON.stringify hash`)
  assert.equal(hash(normalizedById.get(id)),entry.normalizedGoalJsonStringifySha256,`${id}: native normalized hash`)
}
for(const row of report.goalBindings){
  const goal:any=byId.get(row.goalId)
  assert.equal(rawHash(row.currentGoalPath),row.currentGoalSha256)
  assert.deepEqual(read(row.currentGoalPath),goal)
  assert.equal(hash(goal),row.currentGoalJsonStringifySha256)
  assert.equal(hash(normalizedById.get(row.goalId)),row.normalizedCurrentGoalJsonStringifySha256)
  assert.equal(rawHash(row.previousGoalPath),row.previousGoalSha256)
  const previous=read(row.previousGoalPath)
  for(const delta of row.allowedDeltas){
    const keys=delta.path.split('.');let parent=previous
    for(const key of keys.slice(0,-1))parent=parent[key]
    assert.deepEqual(parent[keys.at(-1)!],delta.before)
    parent[keys.at(-1)!]=delta.after
  }
  assert.deepEqual(previous,goal,`${row.goalId}: only the independently reviewed allowed deltas`)
  const closure=collectWholeMaterialPrerequisiteClosure(landscape,row.goalId)
  assert.deepEqual([...closure.unresolvedReferences],[])
  assert.deepEqual([...closure.atomicGoalIds].sort(),row.closureGoalIds)
  assert.equal(closure.atomicGoalIds.size,row.fullRealPrerequisiteClosureCount)
  assert.deepEqual(row.reviewScope.jurisdictions,['DE-SN'])
  assert.deepEqual(row.reviewScope.stages,['SekI'])
  assert.deepEqual(goal.requires,row.requires)
  assert.deepEqual(goal.examData.coveredGoalIds,row.coveredGoalIds)
  assert.deepEqual(goal.examData.coveredStrands,row.coveredStrands)
  assert.equal(rawHash(row.sourceArtifact.path),row.sourceArtifact.sha256)
}
for(const old of report.supersedes)assert.equal(rawHash(old.path),old.sha256,'historical evidence is immutable')
for(const primary of report.primaryEvidence)assert.equal(rawHash(primary.path),primary.sha256)
const historical=report.historicalConservation.coveredStrandsUnchangedThirdRow
assert.equal(rawHash(historical.path),historical.sha256)
assert.deepEqual(byId.get(historical.goalId),read(historical.path))
const currentRoute=read(report.routeReview.current.path)
assert.equal(rawHash(report.routeReview.before.path),report.routeReview.before.sha256)
assert.equal(rawHash(report.routeReview.current.path),report.routeReview.current.sha256)
const mapping=read('curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json')
for(const row of currentRoute.decisions)assert.deepEqual(mapping.decisions.find((x:any)=>x.sourceGoalId===row.sourceGoalId),row)
const reviewedRouteIds=new Set(currentRoute.decisions.map((x:any)=>x.sourceGoalId))
assert.deepEqual(mapping.mappings.filter((x:any)=>reviewedRouteIds.has(x.legacyGoalId)),currentRoute.mappings,'exact route groups; unsupported extra matches must fail')
// Whole view hashes are dated observations; regenerated views must preserve the reviewed placement fragments.
for(const binding of report.observedPlacementBindings){
 const view=read(binding.path),found:any[]=[]
 const visit=(node:any,path:any[]=[])=>{
  if(Array.isArray(node)){node.forEach(x=>visit(x,path));return}
  if(!node||typeof node!=='object')return
  if(node.kind==='structure')path=[...path,{id:node.id,label:node.label??node.title}]
  if(report.placementConstraint.goalIds.includes(node.goalId))found.push({node,structurePath:path})
  Object.values(node).forEach(x=>visit(x,path))
 }
 visit(view)
 assert.deepEqual(found,binding.placements,`${binding.path}: exact reviewed SN J9 fragments`)
}
console.log(JSON.stringify({status:'PASS',assessmentCount:report.goalBindings.length,preparationPayloadCount:report.preparationBinding.goalCount,closureCounts:report.goalBindings.map((r:any)=>({goalId:r.goalId,count:r.fullRealPrerequisiteClosureCount})),historicalRecordsUnchanged:report.supersedes.length,SNViewsWithReviewedJ9Fragments:report.observedPlacementBindings.length}))
