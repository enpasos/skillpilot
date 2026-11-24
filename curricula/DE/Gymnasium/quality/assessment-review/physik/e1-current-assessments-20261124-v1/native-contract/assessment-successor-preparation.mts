import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot-e1-nachweise/app/src/utils/authoring/canonicalAuthoring.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '/home/enpasos/projects/skillpilot-e1-nachweise/app/src/utils/authoring/compositionViewAuthoring.ts'
import {collectWholeMaterialPrerequisiteClosure} from '/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/generateCurriculumQualityStatus.ts'
const root='/home/enpasos/projects/skillpilot-e1-nachweise/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(v:any)=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
const docs=['PHYSIK','MATHEMATIK','CHEMIE'].map(s=>read(root+`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${s}.de.json`))
const capsule=read('/tmp/e1-t5/assessment-successor-a/canonical-input.json'),candidates=new Map(capsule.candidates.map((g:any)=>[g.id,g]))
docs[0].goals=docs[0].goals.map((g:any)=>candidates.get(g.id)??g)
const landscape={...docs[0],goals:docs.flatMap(d=>d.goals)},normalized=normalizeCanonicalLandscape(landscape), byid=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const closures=capsule.scopeGoalIds.map((id:string)=>{const c=collectWholeMaterialPrerequisiteClosure(landscape,id);assert.equal(c.unresolvedReferences.size,0);return{goalId:id,requires:(byid.get(id) as any).requires,coveredGoalIds:(byid.get(id) as any).examData.coveredGoalIds,atomicGoalIds:[...c.atomicGoalIds].sort(),count:c.atomicGoalIds.size}})
const views=[]
for(const suffix of ['he-sekii-gk','he-sekii-lk','sn-seki','st-seki']){
 const path=`curricula/DE/Gymnasium/composition-views/physik/de-${suffix}.view.json`,raw=read(root+path),view=normalizeCompositionView(raw),compiled=compileCompositionView(view,normalizeCanonicalLandscape(docs[0]),normalized)
 assert.deepEqual(compiled.findings.filter((f:any)=>f.severity==='error'),[])
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(normalized.goals.map(g=>[g.id,g])))
 const supply=new Set([...roles.targetGoalIds,...roles.prerequisiteOnlyGoalIds])
 const ids=suffix.startsWith('he')?capsule.scopeGoalIds:suffix.startsWith('sn')?['a8dc0290-9f80-5763-8943-e16b8d2aa860','f41e4e30-794e-5ce4-ba5e-cc72712cd691']:['a8dc0290-9f80-5763-8943-e16b8d2aa860']
 views.push({path,scope:raw.scope,sha256:createHash('sha256').update(readFileSync(root+path)).digest('hex'),nativeCompilationErrors:[],targetCount:roles.targetGoalIds.size,preparationOnlyCount:roles.prerequisiteOnlyGoalIds.size,assessmentChecks:ids.map((id:string)=>{const c=closures.find((x:any)=>x.goalId===id);return{goalId:id,fullClosureCount:c.count,missingInActualStageView:c.atomicGoalIds.filter((x:string)=>!supply.has(x))}})})
}
const union=new Set<string>(closures.flatMap((c:any)=>c.atomicGoalIds));const payload={schemaVersion:1,status:'ACTUAL_NATIVE_CANDIDATE_PREPARATION_OBSERVATION',closureMethod:'Unpruned native collectWholeMaterialPrerequisiteClosure over exact current Physics/Mathematics/Chemistry payloads, overriding only the6 sealed candidate assessments. A whole view or prerequisite membership does not replace independent scientific/source-stage review.',closures,views,preparationGoals:[...union].sort().map(id=>({goal:byid.get(id),jsonStringifySha256:hash(byid.get(id))})),limits:'HE E1 and SN/ST lower-stage source authority and actual teaching remain separate review obligations; missing IDs are explicit, not trimmed. No learner result or planning credit is inferred.'}
writeFileSync('/tmp/e1-t5/assessment-successor-preparation.actual.json',JSON.stringify(payload,null,2)+'\n');console.log(JSON.stringify({closures:closures.map((c:any)=>({id:c.goalId,count:c.count})),views:views.map(v=>({path:v.path,checks:v.assessmentChecks}))},null,2))
