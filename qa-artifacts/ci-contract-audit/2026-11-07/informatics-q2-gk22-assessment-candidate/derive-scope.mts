// SPDX-License-Identifier: Apache-2.0
// Existing native helper; exported only in the documented private RO overlay.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { collectRenderedAtomicGoalIdsFromCompositionView } from '../../../../app/scripts/generateCurriculumQualityStatus'
import { convertLearningGoal } from '../../../../app/src/goalTypes'
import { resolveCoursePlanReferencedTopics } from '../../../../app/src/utils/coursePlanTopicSelection'

const root=process.cwd()
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex')
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const source='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
assert.equal(hash(source),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e')
const evidencePath='qa-artifacts/ci-contract-audit/2026-11-06/informatics-875-required-scope-repair-followup-2026-11-07.evidence.json.gz'
assert.equal(hash(evidencePath),'ee11c7e10a6536ff9f5249d258fd33d0df564a1bc2fb61875282e45f7d7efe25')
const evidence=JSON.parse(gunzipSync(readFileSync(evidencePath)).toString())
const landscape=load(source)
const catalog=readdirSync('curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).sort().map(f=>load('curricula/DE/Gymnasium/canonical/'+f))
const old=landscape.goals.find((g:any)=>g.id==='0df1bedd-5fda-5b3b-a959-c9610237bb3e')
const goals=new Map(landscape.goals.map((g:any)=>[g.id,convertLearningGoal(g,{landscapeId:landscape.landscapeId})]))
const oldResolution=resolveCoursePlanReferencedTopics(old.examData.coveredGoalIds,goals)
assert.deepEqual(oldResolution.invalidGoalIds,[])
assert.equal(oldResolution.atomicGoalIds.length,41)
const expected=evidence.plannedMandatoryScopeConsequences.newGkCoverageIds as string[]
assert.equal(expected.length,22)
const rows=[]
for(const [file,filters] of [
 ['de-he-gym-informatics-crossstage.view.json',['DE-HE','GK']],
 ['de-by-gym-informatics-crossstage.view.json',['DE-BY','GK']],
 ['de-de-gym-informatics-gk.view.json',['GK']],
] as const){
 const view='curricula/DE/Gymnasium/composition-views/informatik/'+file
 const pinned=evidence.viewPins.find((p:any)=>p.path===view)
 assert.ok(pinned);assert.equal(hash(view),pinned.currentSha256)
 const targets=collectRenderedAtomicGoalIdsFromCompositionView(landscape,resolve(root,view),[...filters],false,undefined,[],catalog)
 const ids=oldResolution.atomicGoalIds.filter(id=>targets.has(id))
 assert.deepEqual([...ids].sort(),[...expected].sort())
 const visible=new Map([...goals].filter(([id])=>targets.has(id)))
 const resolved=resolveCoursePlanReferencedTopics(ids,visible,undefined,goals)
 assert.deepEqual(resolved.invalidGoalIds,[])
 assert.deepEqual([...resolved.atomicGoalIds].sort(),[...expected].sort())
 assert.ok(!ids.includes('875cb53c-b48d-5b2b-8cb0-e20f27534f16'))
 rows.push({view:{path:view,sha256:hash(view)},filters,targetAtomicCount:targets.size,
  oldCoverageOutsideTargetIds:oldResolution.atomicGoalIds.filter(id=>!targets.has(id)),coveredGoalIds:ids,
  nativeResolvedCoveredGoalIds:resolved.atomicGoalIds,nativeInvalidGoalIds:resolved.invalidGoalIds})
}
const output={purpose:'native-derivation-of-one-private-GK-Q2-22-candidate-scope-not-offer-approval',
 source:{path:source,sha256:hash(source),landscapeId:landscape.landscapeId},
 catalog:readdirSync('curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).sort().map(f=>({path:'curricula/DE/Gymnasium/canonical/'+f,sha256:hash('curricula/DE/Gymnasium/canonical/'+f)})),
 historicalScopeEvidence:{path:evidencePath,sha256:hash(evidencePath)},originalExam:old,
 coveredGoalIds:rows[0].coveredGoalIds,contexts:rows,
 goalContexts:rows[0].coveredGoalIds.map(id=>({goal:landscape.goals.find((g:any)=>g.id===id),
  parents:landscape.goals.filter((g:any)=>(g.contains??[]).includes(id))})),
 activeWrites:false,automaticResultTransfer:false,independentContentApproval:false}
writeFileSync(process.argv[2],JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({contexts:rows.length,coveredGoalIds:output.coveredGoalIds,oldCoverage:41,advancedStateGoalIncluded:false}))
