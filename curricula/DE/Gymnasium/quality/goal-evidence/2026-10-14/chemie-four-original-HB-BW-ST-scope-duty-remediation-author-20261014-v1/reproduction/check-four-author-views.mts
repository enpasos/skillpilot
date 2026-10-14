import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const repo = process.cwd()
const packet = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-original-HB-BW-ST-scope-duty-remediation-author-20261014-v1')
const { collectAuthoritativeTargetAtomicGoalIds } = await import(pathToFileURL(resolve(repo, 'app/scripts/compositionViewSourceCoverage.ts')).href)
const { compileCompositionView, normalizeCompositionView } = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { normalizeCanonicalLandscape } = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const load = (path: string) => JSON.parse(readFileSync(resolve(packet, path), 'utf8'))
const before = load('before/canonical539.current412.exact.json')
const after = load('candidate/canonical540.current413.one-new-research-operator.author.json')
const newId = '93a7ce4d-1c90-568c-9368-cac423011ef9'
const goalById = new Map(after.goals.map((g: any) => [g.id, g]))
const directMissing = (targets: Set<string>) => [...targets].flatMap(id => ((goalById.get(id) as any)?.requires ?? []).filter((r: string) => !targets.has(r)).map((r: string) => `${id}|${r}`)).sort()
const entries = (nodes: any[]): any[] => nodes.flatMap(n => [n, ...entries(n.children ?? [])])
const rows: any[] = []
for (const name of ['de-hb-lk', 'de-bw-lk', 'de-st-gk', 'de-st-lk']) {
 const oldView = load(`before/${name}.view.json`)
 const newView = load(`candidate/${name}.view.author.json`)
 const beforeTargets: Set<string> = collectAuthoritativeTargetAtomicGoalIds(before, oldView)
 const afterTargets: Set<string> = collectAuthoritativeTargetAtomicGoalIds(after, newView)
 const added = [...afterTargets].filter(id => !beforeTargets.has(id)).sort()
 const removed = [...beforeTargets].filter(id => !afterTargets.has(id)).sort()
 const beforeCompile = compileCompositionView(normalizeCompositionView(oldView), normalizeCanonicalLandscape(before))
 const afterCompile = compileCompositionView(normalizeCompositionView(newView), normalizeCanonicalLandscape(after))
 const oldErrors = new Set(beforeCompile.findings.filter((f: any) => f.severity === 'error').map((f: any) => JSON.stringify(f)))
 const newErrors = afterCompile.findings.filter((f: any) => f.severity === 'error' && !oldErrors.has(JSON.stringify(f)))
 const oldGaps = new Set(directMissing(beforeTargets))
 const addedDirectGaps = directMissing(afterTargets).filter(x => !oldGaps.has(x))
 const oldMissingIds = new Set([...oldGaps].map(x => x.split('|')[1]))
 const addedMissingIds = [...new Set(addedDirectGaps.map(x => x.split('|')[1]))].filter(x => !oldMissingIds.has(x))
 const roleChanges = entries(newView.rootNodes).filter(n => n.projectionRole === 'prerequisiteOnly').length - entries(oldView.rootNodes).filter(n => n.projectionRole === 'prerequisiteOnly').length
 if (addedDirectGaps.length) console.log(JSON.stringify({ view: name, addedDirectGaps }))
 assert.equal(newErrors.length, 0, `${name}: new compiler errors`)
 assert.equal(removed.length, 0, `${name}: old target removed`)
 assert.equal(addedMissingIds.length, 0, `${name}: new missing prerequisite ID`)
 assert.equal(roleChanges, 0, `${name}: changed prerequisiteOnly count`)
 if (name === 'de-hb-lk') assert.deepEqual(added, ['5e2eb826-6e60-5273-91d6-c23f6dfa33b1', newId, 'dfbccd62-1203-5d1b-927d-65a4ca41bbad'].sort())
 else assert.deepEqual(added, [])
 rows.push({ view: name, beforeTargetCount: beforeTargets.size, afterTargetCount: afterTargets.size, addedTargets: added, removedTargets: removed, priorCompilerErrorCount: oldErrors.size, newCompilerErrors: newErrors, priorDirectPrerequisiteGapCount: oldGaps.size, newDirectEdgesToAlreadyMissingPrerequisites: addedDirectGaps, newMissingPrerequisiteIds: addedMissingIds, knownBaselineGapBoundary: 'HB fcc73 is already absent despite existing42a84/5a709 requirements; adding5e2 creates another edge to that SAME unresolved existing canonical prerequisite, openly recorded, not fixed by changing requires or inferred prerequisiteOnly.', prerequisiteOnlyCountDelta: roleChanges, compilerFindings: afterCompile.findings })
}
const newGoal = goalById.get(newId) as any
assert.ok(newGoal)
assert.equal(after.goals.length, before.goals.length + 1)
assert.equal(after.goals.filter((g: any) => !(g.contains?.length)).length, before.goals.filter((g: any) => !(g.contains?.length)).length + 1)
const result = { technicalOnly: true, scienceApproval: false, authorCandidateNotIntegrated: true, viewsChecked: rows.length, rows, newGoalCount: 1, canonicalGoalCount: after.goals.length, canonicalAtomicCount: after.goals.filter((g: any) => !(g.contains?.length)).length, strictClosures: 0, allAssertionsPassed: true }
writeFileSync(resolve(packet, 'checks/four-views-stock-runtime-and-compiler.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ views: rows.map(({ view, beforeTargetCount, afterTargetCount, addedTargets, priorCompilerErrorCount, priorDirectPrerequisiteGapCount }) => ({ view, beforeTargetCount, afterTargetCount, addedTargets, priorCompilerErrorCount, priorDirectPrerequisiteGapCount })), technicalAssertionsPassed: true, scienceApproval: false }))
