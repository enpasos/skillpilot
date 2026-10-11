import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const [repoArg, capsuleArg, outputArg] = process.argv.slice(2)
const repo = resolve(repoArg), cap = resolve(capsuleArg)
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-requires-sequences-independent-review-b-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-seven-nonuniversal-prerequisite-bounded-author-v1'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const can = json(resolve(cap, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
assert.equal(sha(resolve(repo, author, 'whole-current-CAN493.seven-requires-only.inert-author-candidate.json')), '759245da9d52a38db6bb11532acdd954475f997a3d8f6b38e68e39a5a85356ff')
const report = json(resolve(repo, author, 'actual-seven-requires-current-source-native-applicability.report.json'))
assert.equal(report.goals.length, 493)
const native: any = await import(pathToFileURL(resolve(cap, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const graph = native.evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id)))
assert.equal(graph.status, 'pass')
const types = native.evaluateTypeConsistency(can)
assert.equal(types.status, 'pass')
const compilation = { reports: [report], summary: { supportedValues: report.projections.map((p: any) => p.value) } }
const coverage = native.readJurisdictionCoverageByLandscapeId(compilation).get(can.landscapeId)
assert.equal(coverage.unmappedSourceAtomicGoals, 0)
assert.equal(coverage.unsupportedAssignedAtomicGoals, 3)
const profile = native.routeProfiles.find((p: any) => p.landscapeId === can.landscapeId)
const routes = native.evaluateRouteProfile(can, profile, compilation)
const gb = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const closure = (id: string) => {
  const seen = new Set<string>(), stack = [...gb.get(id).requires]
  while (stack.length) {
    const current = stack.pop()!
    if (seen.has(current)) continue
    seen.add(current)
    stack.push(...(gb.get(current)?.requires ?? []))
  }
  return seen
}
const terminalIds = profile.terminalAutonomyClusterIds.flatMap((id: string) => gb.get(id).contains)
const wholeCoveredOutsideRequires = terminalIds.flatMap((id: string) => {
  const goal = gb.get(id), ancestors = closure(id)
  const missing = goal.examData.coveredGoalIds.filter((covered: string) => !ancestors.has(covered))
  return missing.length ? [{ terminalId: id, title: goal.title, unchangedWholeExamData: goal.examData, currentRequires: goal.requires, actualCoveredGoalsOutsidePrerequisiteClosure: missing }] : []
})
assert.deepEqual(wholeCoveredOutsideRequires.map((r: any) => r.terminalId), ['f80d7cbb-e03c-5613-a4b6-8a1bad485385'])
assert.equal(wholeCoveredOutsideRequires[0].actualCoveredGoalsOutsidePrerequisiteClosure.length, 3)
writeFileSync(resolve(outputArg), JSON.stringify({ role: 'Independent B actual seven-requires-only native graph/source/route and dependent material intake; no overall approval', nativeProductionSHA256: sha(resolve(repo, 'app/scripts/generateCurriculumQualityStatus.ts')), candidateWholeCANSHA256: sha(resolve(repo, author, 'whole-current-CAN493.seven-requires-only.inert-author-candidate.json')), graph, types, actualSourceCoverage: coverage, actualNativeRouteScope: routes, wholeCoveredOutsideRequires, nativePredicatesChanged: false, activeM3M4M6OrHumanApproval: false }, null, 2) + '\n')
console.log(JSON.stringify({ graph: graph.status, types: types.status, sourceUnsupported: coverage.unsupportedAssignedAtomicGoals, sourceReverseUnmapped: coverage.unmappedSourceAtomicGoals, routeRules: routes.rules.map((r: any) => [r.id, r.status, r.metrics]), dependentWholeMaterialPrerequisiteGaps: wholeCoveredOutsideRequires.map((r: any) => ({ terminalId: r.terminalId, coveredGoalsOutsideRequires: r.actualCoveredGoalsOutsidePrerequisiteClosure })) }))
