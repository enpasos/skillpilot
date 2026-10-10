import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Run with the exact recorded helper materialized outside curricula, preserving
// its original relative production-code imports. No author helper is invoked.
async function main() {
  const root = process.cwd()
  const helperPath = process.argv[2]
  if (!helperPath) throw Error('Supply frozen helper execution path outside curricula')
  const native = await import(pathToFileURL(resolve(helperPath)).href)
  const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-five-legacy-exams-125-material-prerequisite-and-LK-scope-independent-review-v1'
  const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/five-legacy-phase-exams-minimal-material-requires-and-course-author-v17'
  const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
  const can = read(author + '/whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json')
  const report = read(author + '/actual-three-variants-original-native-route-course-fixedpoint-memory-and-P311-book-impact.author-report.json')
  const candidate = native.routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')
  const production = { ...candidate, terminalAutonomyClusterIds: candidate.terminalAutonomyClusterIds.filter((id: string) => id !== '5317d078-413b-58bb-9262-d57387d51655') }
  const by = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
  const direct = native.buildAtomicDirectRequiresEdges(can)
  const effective = native.buildEffectiveRequiresEdges(can)
  const selected = can.goals.filter(candidate.goalSelector)
  function gaps(edges: Map<string, string[]>, terminalIds: Set<string>, allowed?: Set<string>) {
    const reverse = new Map<string, string[]>()
    for (const [id, reqs] of edges) {
      if (allowed && !allowed.has(id)) continue
      for (const req of reqs) if (!allowed || allowed.has(req)) reverse.set(req, [...(reverse.get(req) ?? []), id])
    }
    return selected.filter((g: any) => !allowed || allowed.has(g.id)).filter((g: any) => {
      const todo = [g.id], seen = new Set<string>()
      while (todo.length) {
        const id = todo.pop()!
        if (seen.has(id)) continue
        seen.add(id)
        if (terminalIds.has(id)) return false
        todo.push(...(reverse.get(id) ?? []))
      }
      return true
    }).map((g: any) => g.id)
  }
  const results = []
  for (const [label, profile] of [['explicit-E-cluster-candidate-profile', candidate], ['actual-production-profile-E-cluster-absent', production]] as const) {
    const terminals = new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id: string) => by.get(id)?.contains ?? []).filter((id: string) => {
      const g = by.get(id)
      return g && !(g.contains?.length) && g.nodeKind !== 'memory' && !(g.tags ?? []).includes('memorization') && !(g.tags ?? []).some((t: string) => t.startsWith('srs-deck:'))
    }))
    const allDirectMissing = gaps(direct, terminals)
    const allEffectiveMissing = gaps(effective, terminals)
    const local = []
    for (const course of ['GK', 'LK']) {
      const view = own + '/whole-recorded-candidate-' + course.toLowerCase() + '-composition-view.exact-v14.json'
      const targets: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(root, view), [course], false)
      const visible: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(root, view), [course], true)
      const saved = report.results.at(-1).local.find((l: any) => l.courseProfile === course)
      if (JSON.stringify([...targets].sort()) !== JSON.stringify(saved.actualTargetAtomicIds)) throw Error('Target projection differs from recorded source')
      if (JSON.stringify([...visible].filter(id => !targets.has(id)).sort()) !== JSON.stringify(saved.actualPrerequisiteOnlyIds)) throw Error('Support projection differs from recorded source')
      const allVisible = new Set<string>([...visible, ...saved.actualVisibleClusterIds])
      const fixedpoint = []
      for (const [kind, edges] of [['atomic-direct', direct], ['effective', effective]] as const) {
        const seen = new Set<string>(), todo = [...targets]
        while (todo.length) {
          const id = todo.pop()!
          if (seen.has(id)) continue
          seen.add(id)
          todo.push(...(edges.get(id) ?? []))
        }
        const missing = [...seen].filter(id => !allVisible.has(id)).sort()
        fixedpoint.push({ kind, missing, ordinaryAtomicMissing: missing.filter(id => selected.some((g: any) => g.id === id)), clustersMissing: missing.filter(id => by.get(id)?.contains?.length), noDepthLimit: true })
      }
      const courseTerminals = new Set([...terminals].filter(id => targets.has(id)))
      local.push({ course, selected: selected.filter((g: any) => targets.has(g.id)).length, targetIds: [...targets].sort(), terminalIds: [...courseTerminals].sort(), missingVisibleOnlyTerminalGoalIds: gaps(direct, courseTerminals, targets), fixedpoint })
    }
    results.push({ label, terminalClusterIds: profile.terminalAutonomyClusterIds, terminalGoalIds: [...terminals], selected: selected.length, allDirectMissing, allEffectiveMissing, local })
  }
  const output = resolve(root, own + '/actual-independent-two-qualified-profile-native-edge-and-course-fixedpoint-results.json')
  if (existsSync(output)) throw Error('Immutable output exists')
  writeFileSync(output, JSON.stringify({ nativeGraph: native.evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id))), nativeTypes: native.evaluateTypeConsistency(can), results, viewContext: 'Exact V14 seven-support candidate views; not current live production views', qualifiedOriginalCodeClaim: 'Native edge bodies and goal selectors match production exactly; recorded helper deliberately adds E terminal-cluster constant. Both contexts separately computed; this is not a full unmodified production CQR report.', sourceWholeApproval: false, humanApproval: false, strictGain: 0 }, null, 2) + '\n')
  console.log(JSON.stringify(results.map(r => ({ label: r.label, selected: r.selected, terminals: r.terminalGoalIds.length, effectiveMissing: r.allEffectiveMissing.length, directMissing: r.allDirectMissing.length, local: r.local.map(l => ({ course: l.course, selected: l.selected, terminalGaps: l.missingVisibleOnlyTerminalGoalIds.length, fixedpoint: l.fixedpoint.map(f => ({ kind: f.kind, missing: f.missing.length, ordinaryAtomicMissing: f.ordinaryAtomicMissing.length, clustersMissing: f.clustersMissing.length })) })) })), null, 2))
}
main().catch(e => { console.error(e); process.exitCode = 1 })
