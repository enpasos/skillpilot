import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, relative } from 'node:path'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'

const root = '/home/enpasos/projects/skillpilot'
const base = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
const author = resolve(base, 'wirtschaft-by-three-autonomy-terminals-author-draft-v2')
const inputPath = resolve(base, 'wirtschaft-by-three-draft-current230-future311-native-technical-v2/canonical.current230.future311.with-three-DRAFTs.inert.json')
const outPath = resolve(base, 'wirtschaft-by-three-autonomy-independent-navigation-v2-review-v1/actual-own-native-parent-ancestor-and-closure-countercheck.json')
const hash = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const invariant = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
invariant(!existsSync(outPath), 'Historical receipt must not be overwritten')
const landscape = read(inputPath)
const cluster = read(resolve(author, 'whole-new-BY-only-practice-navigation-cluster.candidate.json'))
const terminalGoals = read(resolve(author, 'whole-three-terminal-goals.candidate.json'))
const oldParent = read(resolve(author, 'whole-existing-E-autonomy-parent.unchanged.json'))
const rootCandidate = read(resolve(author, 'whole-root-parent.with-one-BY-practice-cluster.candidate.json'))
const raw = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
for (const g of [cluster, oldParent, rootCandidate, ...terminalGoals]) invariant(same(raw.get(g.id), g), 'Physical input must contain the exact whole author objects: ' + g.id)
const prepared = prepareLandscapeEntries([landscape])
invariant(prepared.length === 1, 'Exactly one Economics landscape prepared')
const goals = prepared[0].goals
const byId = new Map(goals.map(goal => [goal.id, goal]))
const norm = (ref: string) => ref.includes(':') ? ref.slice(ref.indexOf(':') + 1) : ref
const parents = new Map<string, string[]>()
for (const g of goals) for (const c of g.contains) parents.set(norm(c), [...(parents.get(norm(c)) ?? []), g.id])
const ancestorChain = (id: string): string[] => {
  const result = new Set<string>()
  const visit = (n: string) => { for (const p of parents.get(n) ?? []) { invariant(!result.has(p), 'Repeated/cyclic ancestor path: ' + p); result.add(p); visit(p) } }
  visit(id); return [...result]
}
const inspectionClosure = (id: string) => {
  const atoms = new Set<string>()
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (n: string) => {
    invariant(!visiting.has(n), 'Combined dependency cycle: ' + n)
    if (visited.has(n)) return
    const goal = byId.get(n); invariant(!!goal, 'Missing dependency: ' + n)
    visiting.add(n)
    if (goal!.contains.length) for (const child of goal!.contains) visit(norm(child))
    else if (n !== id) atoms.add(n)
    for (const required of goal!.effectiveRequires ?? goal!.requires) visit(norm(required))
    visiting.delete(n); visited.add(n)
  }
  const goal = byId.get(id)!
  for (const required of goal.effectiveRequires ?? goal.requires) visit(norm(required))
  return [...atoms].sort().map(n => ({ goalId: n, title: byId.get(n)!.title, requires: byId.get(n)!.requires, effectiveRequires: byId.get(n)!.effectiveRequires, contains: byId.get(n)!.contains }))
}
invariant(same(parents.get(cluster.id), [rootCandidate.id]), 'New BY navigation has exactly the canonical root as parent')
invariant((parents.get(rootCandidate.id) ?? []).length === 0, 'Canonical root has no hidden ancestor')
invariant(byId.get(cluster.id)!.requires.length === 0 && byId.get(cluster.id)!.effectiveRequires!.length === 0, 'New BY navigation inherits no prerequisites')
const records = terminalGoals.map((t: any) => {
  const native = byId.get(t.id)!
  invariant(same(parents.get(t.id), [cluster.id]), 'Terminal has only the exact BY parent')
  invariant(same(native.effectiveRequires, t.requires), 'Native effective prerequisites equal reviewed task foundations')
  invariant(native.inheritedRequires!.length === 0, 'No hidden parent prerequisites')
  return { goalId: t.id, directRequires: t.requires, actualNativeEffectiveRequires: native.effectiveRequires, actualNativeInheritedRequires: native.inheritedRequires, actualWholeAncestorChain: ancestorChain(t.id), independentlyExpandedLeafFoundationClosure: inspectionClosure(t.id), directCoveredGoals: t.examData.coveredGoalIds, assessmentReviewStatus: t.examData.reviewStatus }
})
const output = {
  schemaVersion: 1,
  actualExecutedAt: new Date().toISOString(),
  reviewerAgentIdentity: '/root/economics_layer_a',
  role: 'own targeted native parent/ancestor countercheck on inert Economics v2',
  actualInputPath: relative(root, inputPath),
  actualInputSha256: hash(inputPath),
  actualNativeFunction: 'app/src/hooks/useLandscapes.ts::prepareLandscapeEntries → internal applyEffectiveRequires',
  actualNativeFunctionSourceSha256: hash(resolve(root, 'app/src/hooks/useLandscapes.ts')),
  physicalWholeObjectsExactlyMatchedAuthorCandidate: true,
  actualNewParentId: cluster.id,
  actualNewParentEffectiveRequires: byId.get(cluster.id)!.effectiveRequires,
  actualOldEParentImmediateRequiresUnchanged: byId.get(oldParent.id)!.requires,
  records,
  noTerminalCombinedDependencyCycleOrSelfDependencyObserved: true,
  closureMethodLimit: 'Effective prerequisite refs come from the actual native prepareLandscapeEntries call. Subsequent leaf/transitive expansion is this transparent independent inspection traversal, not a claimed separate CQR or backend frontier run. No authored learner-scope availability assertion from raw tags.',
  curriculumSourceAcceptanceClaimed: false,
  assessmentReleaseApproved: false,
  humanApproved: false,
  liveMutations: 0,
  ordinaryDenominatorAuthorityChange: 0,
  strictNetGain: 0,
}
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ output: relative(root, outPath), sha256: hash(outPath), records: records.map((r: any) => ({ goalId: r.goalId, directCount: r.directRequires.length, effectiveCount: r.actualNativeEffectiveRequires.length, inheritedCount: r.actualNativeInheritedRequires.length, leafClosureCount: r.independentlyExpandedLeafFoundationClosure.length })) }, null, 2))
