import { readFileSync, writeFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-candidate-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const landscape = read(`${own}/canonical-with-one-memory-goal.inactive.candidate.json`)
const originId = '28bb9d15-f865-5843-a035-6066580fea64'
const memoryId = '417e65ec-68be-5f2e-9452-c3ba9b1d362f'
const canonical = normalizeCanonicalLandscape(landscape)
const baseline = normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const views = ['de-de-gym-chemistry-gk', 'de-de-gym-chemistry-lk', 'de-de-gym-seki-chemistry']
const scopes = views.map(id => {
  const path = `curricula/DE/Gymnasium/composition-views/chemie/${id}.view.json`
  const view = normalizeCompositionView(read(path))
  const compiled = compileCompositionView(view, canonical)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(canonical.goals.map(g => [g.id, g])))
  const before = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(baseline.goals.map(g => [g.id, g])))
  const removedTargetIds = [...before.targetGoalIds].filter(goalId => !roles.targetGoalIds.has(goalId))
  const addedTargetIds = [...roles.targetGoalIds].filter(goalId => !before.targetGoalIds.has(goalId))
  const originIsTarget = roles.targetGoalIds.has(originId)
  const memoryIsTarget = roles.targetGoalIds.has(memoryId)
  return { path, compileErrors: compiled.findings.filter(f => f.severity === 'error'), originIsTarget, memoryIsTarget, requiredMemoryVisible: !originIsTarget || memoryIsTarget, removedTargetIds, addedTargetIds }
})
const ids = new Set(landscape.goals.map((g: any) => g.id))
const danglingEdges = landscape.goals.flatMap((g: any) => [...(g.requires ?? []), ...(g.contains ?? [])].filter(id => !ids.has(id)).map(id => ({from:g.id,to:id})))
const cycleErrors: unknown[] = []
for (const kind of ['requires', 'contains']) {
  const done = new Set<string>(), visiting = new Set<string>(), goals = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
  const visit = (id: string, path: string[]) => {
    if (visiting.has(id)) { cycleErrors.push({kind,path:[...path,id]}); return }
    if (done.has(id)) return
    visiting.add(id)
    for (const child of goals.get(id)?.[kind] ?? []) visit(child,[...path,id])
    visiting.delete(id); done.add(id)
  }
  for (const id of ids) visit(String(id),[])
}
const passed = scopes.every(s => !s.compileErrors.length && s.requiredMemoryVisible && !s.removedTargetIds.length && s.addedTargetIds.every(id=>id===memoryId)) && !danglingEdges.length && !cycleErrors.length
const receipt = { status:passed?'PASS_candidate_native_bindings':'FAIL', authority:'ai_candidate', operativeAdoption:false, scopes, danglingEdges, cycleErrors, newMemoryGoalId:memoryId, newOrdinaryGoalIds:[], curricularAtomicDenominatorDelta:0, humanApproval:false, independentScientificApproval:false }
writeFileSync(`${own}/native-compiled-three-view-and-dag.receipt.json`,JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt))
if (!passed) process.exitCode = 1
