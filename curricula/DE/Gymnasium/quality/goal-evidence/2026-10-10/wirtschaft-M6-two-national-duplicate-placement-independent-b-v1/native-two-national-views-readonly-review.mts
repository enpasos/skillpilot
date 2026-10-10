import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const binding = (p: string) => { const b = readFileSync(p); return {path: relative(root,p), sha256: sha(b), bytes:b.length} }
const read = (p: string) => JSON.parse(readFileSync(p,'utf8'))
const [outArg, canArg, ...viewArgs] = process.argv.slice(2)
if (!outArg || !canArg || viewArgs.length !== 2) throw new Error('Expected output, canonical and exactly two national views')
const cp = resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')
const ca = resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')
const { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(cp).href)
const { normalizeCanonicalLandscape, buildCanonicalGraphIndex } = await import(pathToFileURL(ca).href)
const canonicalPath = resolve(root,canArg)
const canonical = normalizeCanonicalLandscape(read(canonicalPath))
const graph = buildCanonicalGraphIndex(canonical)
const rows = viewArgs.map((arg) => {
  const p = resolve(root,arg)
  const raw = read(p)
  const view = normalizeCompositionView(raw)
  const references: any[] = []
  const visitRef = (n: any, path: number[], labels: string[]) => {
    if (n.kind === 'structure') { n.children.forEach((c:any,i:number)=>visitRef(c,[...path,i],[...labels,n.label])); return }
    references.push({nodePath:path,labels,...n})
  }
  raw.rootNodes.forEach((n:any,i:number)=>visitRef(n,[i],[]))
  if (references.some(n=>n.kind==='landscapeEntry' || (n.goalId && !graph.goalById.has(n.goalId)))) throw new Error('This bounded native intake requires all actual references within the exact Economics canonical landscape')
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes,graph.goalById)
  const result = compileCompositionView(view,canonical)
  const occurrences = new Map<string,any[]>()
  const visit = (node:any, ancestors:any[]) => {
    if(node.sourceGoalId) {
      const a = occurrences.get(node.sourceGoalId) ?? []
      a.push({runtimeId:node.runtimeId,parent:ancestors.at(-1) ?? null,ancestorPath:ancestors})
      occurrences.set(node.sourceGoalId,a)
    }
    const entry = {runtimeId:node.runtimeId,label:node.label,kind:node.kind,...(node.sourceGoalId?{goalId:node.sourceGoalId}:{})}
    node.children.forEach((child:any)=>visit(child,[...ancestors,entry]))
  }
  result.compiledRootNodes.forEach((node:any)=>visit(node,[]))
  const duplicateRows = [...occurrences].filter(([,a])=>a.length>1).map(([goalId,paths])=> {
    const goal = graph.goalById.get(goalId) as any
    const directReferences = references.filter(n=>n.kind==='goalEntry'&&n.goalId===goalId)
    const canonicalPaths = paths.filter(p=>!p.runtimeId.startsWith('goalEntry:'))
    const directPaths = paths.filter(p=>p.runtimeId.startsWith('goalEntry:'))
    const withoutDirect = JSON.parse(JSON.stringify(view))
    const remove = (nodes:any[]):any[] => nodes.filter(n=> !(n.kind==='goalEntry'&&n.goalId===goalId)).map(n=>n.kind==='structure'?{...n,children:remove(n.children)}:n)
    withoutDirect.rootNodes = remove(withoutDirect.rootNodes)
    const remainingRoles = collectCompositionProjectionRoleGoalIds(withoutDirect.rootNodes,graph.goalById)
    const parentIds = canonicalPaths.map(p=>p.parent?.goalId).filter(Boolean)
    return {
      goalId,goalTitle:goal.title,goalTitleEn:goal.titleEn,description:goal.description,descriptionEn:goal.descriptionEn,
      rawPhase:goal.phase,dimensionTags:goal.dimensionTags,tags:goal.tags,practiceHasExamData:!!goal.examData,
      directReferences,paths,directPathCount:directPaths.length,canonicalPathCount:canonicalPaths.length,
      roleBefore:roles.targetGoalIds.has(goalId)?'target':roles.prerequisiteOnlyGoalIds.has(goalId)?'prerequisiteOnly':'absent',
      roleWithoutThisDirectRef:remainingRoles.targetGoalIds.has(goalId)?'target':remainingRoles.prerequisiteOnlyGoalIds.has(goalId)?'prerequisiteOnly':'absent',
      canonicalParents:parentIds.map(id=>graph.goalById.get(id)),
      directCanonicalParentContainsGoal:parentIds.every(id=>(graph.goalById.get(id)?.contains??[]).includes(goalId)),
    }
  })
  return {
    view:binding(p),scope:view.scope,viewId:view.viewId,findings:result.findings,
    targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),
    compiledGoalIds:[...occurrences.keys()].sort(),allCompiledOccurrences:[...occurrences].map(([goalId,paths])=>({goalId,paths})),
    actualDuplicateRows:duplicateRows,
    summary:{errorCount:result.findings.filter((f:any)=>f.severity==='error').length,warningCount:result.findings.filter((f:any)=>f.severity==='warning').length,duplicateGoalCount:duplicateRows.length,allExactlyOneDirectAndOneCanonical:duplicateRows.every(r=>r.directPathCount===1&&r.canonicalPathCount===1),allRemainTargetWithoutOwnDirect:duplicateRows.every(r=>r.roleBefore==='target'&&r.roleWithoutThisDirectRef==='target'),allNativeParentsActuallyContainGoal:duplicateRows.every(r=>r.directCanonicalParentContainsGoal)},
  }
})
writeFileSync(resolve(root,outArg),JSON.stringify({authority:'Independent actual native two-view technical intake; no author changes, whole-material science, human approval or maturity claim',canonical:binding(canonicalPath),productionCode:[binding(cp),binding(ca)],boundedReferenceUniverseChecked:true,rows},null,2)+'\n')
console.log(JSON.stringify(rows.map(r=>({viewId:r.viewId,...r.summary}))))
