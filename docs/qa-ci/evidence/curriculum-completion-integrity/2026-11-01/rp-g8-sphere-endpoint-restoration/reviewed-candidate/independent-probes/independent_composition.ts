import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView }
  from './frozen-generator-host/app/src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from './frozen-generator-host/app/src/utils/authoring/canonicalAuthoring'

const root = process.cwd()
const cap = resolve(root, 'tmp/math-rp-final-year-exam-candidates-20261101')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const plan = read(resolve(cap, 'candidate-operations.json'))
const inputs = read(resolve(cap, 'view-input-evidence.json'))
const landscape = normalizeCanonicalLandscape(read(resolve(root,
  'tmp/math-rp-final-year-exam-candidates-20261101/duration-generator-host/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')))
const goals = new Map(landscape.goals.map(goal => [goal.id, goal]))
const folder = 'f6c9c2b8-3dbd-4839-972f-c60f33c44b63'
const checks = []
const signature = (finding: any) => JSON.stringify({ code: finding.code, goalId: finding.goalId, message: finding.message })
const paths = (nodes: any[], id: string, ancestors: string[] = []): string[][] => nodes.flatMap(node => [
  ...(node.sourceGoalId === id ? [[...ancestors, node.label]] : []), ...paths(node.children, id, [...ancestors, node.label]),
])
for (const operation of plan.operations) {
  const before = normalizeCompositionView(inputs[operation.path].view)
  const after = normalizeCompositionView(read(resolve(cap, 'candidate-offered-views', operation.path)))
  const b = collectCompositionProjectionRoleGoalIds(before.rootNodes, goals)
  const a = collectCompositionProjectionRoleGoalIds(after.rootNodes, goals)
  const added = [...a.targetGoalIds].filter(id => !b.targetGoalIds.has(id)).sort()
  const removed = [...b.targetGoalIds].filter(id => !a.targetGoalIds.has(id)).sort()
  if (JSON.stringify(added) !== JSON.stringify([...operation.newTargetGoalIds].sort()) || removed.length) throw new Error('Unexpected target delta')
  if (JSON.stringify([...b.prerequisiteOnlyGoalIds].sort()) !== JSON.stringify([...a.prerequisiteOnlyGoalIds].sort())) throw new Error('Existing support roles changed')
  const bc = compileCompositionView(before, landscape)
  const ac = compileCompositionView(after, landscape)
  const oldErrors = new Set(bc.findings.filter(f => f.severity === 'error').map(signature))
  const newErrors = ac.findings.filter(f => f.severity === 'error' && !oldErrors.has(signature(f)))
  if (newErrors.length) throw new Error(JSON.stringify(newErrors))
  const folderPaths = paths(ac.compiledRootNodes, folder)
  if (folderPaths.length !== 1 || !folderPaths[0].includes('Klassenstufe 9 (G8)')) throw new Error('Existing canonical final-year folder lost or duplicated')
  const taskPaths = operation.newTargetGoalIds.map((id: string) => ({ goalId: id, paths: paths(ac.compiledRootNodes, id) }))
  for (const task of taskPaths) if (task.paths.length !== 1
    || !task.paths[0].includes('Klassenstufe 9 (G8)')
    || !task.paths[0].includes('Prüfungen Jahrgangsstufe 9')) throw new Error('Sphere task outside exact final-year exam branch')
  checks.push({ viewId: operation.viewId, addedTargetGoalIds: added, removedTargetGoalIds: removed,
    changedExistingSupportRoles: [], newCompilerErrors: newErrors,
    baselineCompilerErrors: [...oldErrors], candidateCompilerErrors: ac.findings.filter(f => f.severity === 'error'), canonicalFolderDisplayOccurrences: folderPaths.length, taskPaths })
}
const result = { status: 'pass-mechanical-only-independent-source-placement-review-required',
  sourceViews: checks.length, selectedSphereReferences: checks.length * 2, heldMonteCarloReferences: 3, checks }
writeFileSync(resolve(cap, 'independent-probes/independent-composition-validation.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, views: checks.length, sphereReferences: checks.length * 2 }))
