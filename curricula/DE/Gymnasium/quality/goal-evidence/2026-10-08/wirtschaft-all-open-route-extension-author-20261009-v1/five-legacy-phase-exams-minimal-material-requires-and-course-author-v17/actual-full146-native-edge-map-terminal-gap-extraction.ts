import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { routeProfiles, buildEffectiveRequiresEdges, buildAtomicDirectRequiresEdges } from './actual-all-route-quality-original-body-export-probe.ts'
const root = '/home/enpasos/projects/skillpilot'
const relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/five-legacy-phase-exams-minimal-material-requires-and-course-author-v17'
const base = root + '/' + relative
const read = (name: string) => JSON.parse(readFileSync(base + '/' + name, 'utf8'))
const can = read('whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json')
const native = read('actual-three-variants-original-native-route-course-fixedpoint-memory-and-P311-book-impact.author-report.json').results.at(-1)
const profile = routeProfiles.find(p => p.profileId === 'canonical-economics-crossstage')!
const by = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const selected = can.goals.filter(profile.goalSelector)
const terminalIds = profile.terminalAutonomyClusterIds.flatMap(id => by.get(id)?.contains ?? []).filter(id => { const g = by.get(id); return !!g && !(g.contains?.length) && g.nodeKind !== 'memory' && !(g.tags ?? []).includes('memorization') && !(g.tags ?? []).some((t: string) => t.startsWith('srs-deck:')) })
function paths(edges: Map<string, string[]>) {
 const reverse = new Map<string, string[]>()
 for (const [id, reqs] of edges) for (const req of reqs) reverse.set(req, [...(reverse.get(req) ?? []), id])
 return selected.map((g: any) => {
  const q: Array<[string, string[]]> = [[g.id, [g.id]]], seen = new Set<string>()
  let result: string[] | null = null
  while (q.length) { const [id, p] = q.shift()!; if (seen.has(id)) continue; seen.add(id); if (terminalIds.includes(id)) { result = p; break }; for (const next of reverse.get(id) ?? []) q.push([next, [...p, next]]) }
  return { goalId: g.id, actualTerminalPath: result }
 })
}
const effective = paths(buildEffectiveRequiresEdges(can)), direct = paths(buildAtomicDirectRequiresEdges(can))
const rule101 = native.originalUnmodifiedRouteQualityBodyResult.rules.find((r: any) => r.id === 'CQR-101')
const rule102 = native.originalUnmodifiedRouteQualityBodyResult.rules.find((r: any) => r.id === 'CQR-102')
const missingEffective = effective.filter((r: any) => !r.actualTerminalPath).map((r: any) => r.goalId)
const missingDirect = direct.filter((r: any) => !r.actualTerminalPath).map((r: any) => r.goalId)
if (selected.length !== 311 || missingEffective.length !== rule101.metrics.missingTerminalPath || missingDirect.length !== rule102.metrics.missingDirectTerminalPath || terminalIds.length !== 41) throw Error('Actual full native-edge result differs from original route rule metrics')
if (JSON.stringify(missingEffective.slice(0,20).map((id: string) => `No effective terminal path: ${by.get(id).title} [${id}]`)) !== JSON.stringify(rule101.details)) throw Error('Full result prefix differs from actual original native limited detail list')
const out = base + '/actual-full146-native-edge-map-terminal-gap-extraction.result.json'
if (existsSync(out)) throw Error('Do not overwrite immutable result')
writeFileSync(out, JSON.stringify({ schemaVersion: 1, kind: 'full-native-effective-and-atomic-direct-terminal-gap-list', actualCode: 'original exported buildEffectiveRequiresEdges, buildAtomicDirectRequiresEdges and original routeProfiles goalSelector/terminal clusters; same reverse traversal as original evaluateRouteProfile', originalNativeDetailListLimit: rule101.details.length, initialDetailOnlyExtractionCouldNotProvideWhole146: true, actualSelectedGoalIds: selected.map((g: any) => g.id), actualTerminalGoalIds: terminalIds, actualAll311EffectiveTerminalPaths: effective, actualAll311AtomicDirectTerminalPaths: direct, actualMissing146EffectiveTerminalGoalIds: missingEffective, actualMissing146AtomicDirectTerminalGoalIds: missingDirect, actualNativeMetricParity: true, noGateOrCourseFilterChanges: true, noApproval: true }, null, 2) + '\n')
console.log(JSON.stringify({ selected: selected.length, terminals: terminalIds.length, effectiveMissing: missingEffective.length, directMissing: missingDirect.length, outputPath: relative + '/actual-full146-native-edge-map-terminal-gap-extraction.result.json', sha256: createHash('sha256').update(readFileSync(out)).digest('hex') }))
