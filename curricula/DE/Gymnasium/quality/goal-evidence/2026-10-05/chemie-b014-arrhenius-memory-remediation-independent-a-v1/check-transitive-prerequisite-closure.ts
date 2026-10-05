import { readFileSync,writeFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const raw=read(`${own}/canonical-with-one-memory-goal.reviewed.inactive.candidate.json`),canonical=normalizeCanonicalLandscape(raw),runtime=prepareLandscapeEntries([raw])[0]
const map=new Map(runtime.goals.map(g=>[g.id,g])),canon=new Map(canonical.goals.map(g=>[g.id,g]))
const origin=map.get('28bb9d15-f865-5843-a035-6066580fea64')!,memory=map.get('417e65ec-68be-5f2e-9452-c3ba9b1d362f')!
const closure=(id:string)=>{const out=new Set<string>();const visit=(node:string)=>{for(const r of map.get(node)?.effectiveRequires??map.get(node)?.requires??[]){if(out.has(r))continue;out.add(r);visit(r)}};visit(id);return [...out]}
const memoryClosure=closure(memory.id),originClosure=closure(origin.id)
const rows:any[]=[]
for(const profile of ['GK','LK']) {
 const viewPath=`curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-${profile.toLowerCase()}.view.json`,view=normalizeCompositionView(read(viewPath)),compiled=compileCompositionView(view,canonical)
 const targets=collectCompositionProjectionRoleGoalIds(view.rootNodes,canon).targetGoalIds
 const errors=compiled.findings.filter(f=>f.severity==='error')
 for(const jurisdiction of origin.applicability?.jurisdiction??[]) {
  const filters=[profile,jurisdiction]
  const checks=memoryClosure.map(id=>{const goal=map.get(id);return {goalId:id,title:goal?.title,exists:!!goal,isTarget:targets.has(id),matchesActualFilters:!!goal&&goalMatchesFilters(goal,filters)}})
  const originChecks=originClosure.map(id=>{const goal=map.get(id);return {goalId:id,title:goal?.title,exists:!!goal,isTarget:targets.has(id),matchesActualFilters:!!goal&&goalMatchesFilters(goal,filters)}})
  rows.push({profile,jurisdiction,checks,originChecks,compileErrors:errors,status:!errors.length&&checks.every(c=>c.exists&&c.isTarget&&c.matchesActualFilters)&&originChecks.every(c=>c.exists&&c.isTarget&&c.matchesActualFilters)?'PASS':'HOLD'})
 }
}
const passed=rows.length===32&&rows.every(r=>r.status==='PASS')
const receipt={status:passed?'PASS_all_transitive_prerequisite_routes':'HOLD',authority:'ai_candidate_independent_S_A_M_review',memoryClosure,originClosure,contexts:rows,actualCount:rows.length,passedCount:rows.filter(r=>r.status==='PASS').length,original27ArtifactFreezePreserved:true,strictNetDelta:0,activeWrites:0,humanApproval:false}
writeFileSync(`${own}/actual-transitive-prerequisite-closure.receipt.json`,JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,memoryClosureCount:memoryClosure.length,originClosureCount:originClosure.length,actualCount:rows.length,passedCount:receipt.passedCount}))
if(!passed)process.exitCode=1
