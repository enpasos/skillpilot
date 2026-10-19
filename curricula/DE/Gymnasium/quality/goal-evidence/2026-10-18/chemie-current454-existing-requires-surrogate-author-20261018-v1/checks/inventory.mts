// SPDX-License-Identifier: Apache-2.0
// Read-only prospective input projection; no production file is written.
import fs from 'node:fs'
import path from 'node:path'
import { syncBuiltinESMExports } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { sourceAtlasDescendants } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const repo = process.cwd()
const own = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const inputPaths = new Set<string>()
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const statePath = base + 'chemie-current454-joint-integration-candidate-technical-20261018-v2/LATEST.selected-candidate-state.pending.json'
const read = (p: string) => { inputPaths.add(path.resolve(repo, p)); return JSON.parse(fs.readFileSync(path.resolve(repo, p), 'utf8')) }
const state = read(statePath)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const landscape = read(state.landscapePath)
const goalById = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const atoms = new Set<string>(landscape.goals.filter((g: any) => !(g.contains ?? []).length).map((g: any) => g.id))
const casPath = base + 'chemie-current454-joint-source-integration-technical-20261018-v1/CAS.SELECTED.nineteen-mappings-and-three-existing-source-clones.pending.json'
const cas = read(casPath)
const selection = read(path.relative(repo, path.join(own, 'AUTHOR.source-anchor-selection.pending.json')))
const selectedAnchorKeys = new Set(selection.rows.flatMap((r: any) => r.anchors.map((a: any) => `${a.selectedMappingPath}|${a.sourceGoalId}|${r.requiredByGoalId}`)))
const replacements = new Map(cas.normalMappingOperations.map((op: any) => [op.targetPath, op.afterArtifact.path]))
const mappingFiles: string[] = []
const walk = (p: string) => {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name)
    if (e.isDirectory()) walk(f)
    else if (e.name.endsWith('.json')) mappingFiles.push(f)
  }
}
walk('curricula/DE/Gymnasium/mapping')
const mappings = mappingFiles.map(p => ({ normalPath: p, selectedPath: replacements.get(p) as string ?? p, body: read(replacements.get(p) as string ?? p) }))
  .filter(m => m.body.targetLandscapeId === landscape.landscapeId)

// Limit native compiler enumeration to this one canonical landscape and its 82
// current mapping locators. Registry reads remain exact. No production code edit.
const realRead = fs.readFileSync
const realReaddir = fs.readdirSync
const normalMappingSet = new Set(mappings.map(m => path.resolve(repo, m.normalPath)))
const curriculaRoot = path.resolve(repo, 'curricula')
const treeAllowed = [path.resolve(repo, canonicalPath), ...normalMappingSet]
;(fs as any).readdirSync = (p: any, options: any) => {
  const absolute = path.resolve(String(p))
  const entries: any = realReaddir(p, options)
  if (!absolute.startsWith(curriculaRoot) || absolute.includes('/quality/')) return entries
  return entries.filter((e: any) => {
    const name = typeof e === 'string' ? e : e.name
    const candidate = path.join(absolute, name)
    return treeAllowed.some(allowed => allowed === candidate || allowed.startsWith(candidate + path.sep))
  })
}
;(fs as any).readFileSync = (p: any, options: any) => {
  const absolute = path.resolve(String(p))
  if (absolute.startsWith(repo + path.sep)) inputPaths.add(absolute)
  if (absolute === path.resolve(repo, canonicalPath)) return realRead(path.resolve(repo, state.landscapePath), options)
  const relative = path.relative(repo, absolute)
  const replacement = replacements.get(relative)
  return realRead(replacement ? path.resolve(repo, replacement as string) : p, options)
}
syncBuiltinESMExports()
const { buildApplicabilityCompilation } = await import('../../../../../../../../app/scripts/applicabilityCompiler.ts')
const result = buildApplicabilityCompilation()
;(fs as any).readFileSync = realRead
;(fs as any).readdirSync = realReaddir
syncBuiltinESMExports()
if (result.reports.length !== 1) throw new Error('Expected bounded one-landscape applicability compilation')
const report = result.reports[0]
const ids = ['dc146', '69f2', '3de285', 'ca216', '8721d', 'b732', '8e6b', 'e7c3d20e', '57d2c98d'].map(prefix => [...goalById.keys()].find(id => id.startsWith(prefix))!)
const sources = new Map<string, any>()
const witnesses: any[] = []
for (const m of mappings) {
  const selectedEntries = (m.body.mappings ?? []).filter((entry: any) => selectedAnchorKeys.has(`${m.selectedPath}|${entry.legacyGoalId}|${entry.canonicalGoalId}`))
  if (!selectedEntries.length) continue
  const extractionPath = m.body.sourceExtractionPath
  if (!extractionPath || !fs.existsSync(extractionPath)) continue
  const extraction = sources.get(extractionPath) ?? read(extractionPath)
  sources.set(extractionPath, extraction)
  const byId = new Map<string, any>((extraction.sourceGoals ?? extraction.goals ?? []).map((g: any) => [g.id, g]))
  for (const entry of selectedEntries) {
    if (!entry.canonicalGoalId || !goalById.has(entry.canonicalGoalId)) continue
    const descendants = sourceAtlasDescendants(entry.canonicalGoalId, goalById, atoms, landscape.landscapeId)
    for (const id of ids.filter(id => descendants.includes(id))) witnesses.push({
      goalId: id, normalMappingPath: m.normalPath, selectedMappingPath: m.selectedPath,
      sourceExtractionPath: extractionPath, sourceLandscapeId: m.body.sourceLandscapeId,
      mappingEntry: entry, wholeSourceGoal: byId.get(entry.legacyGoalId),
      wholeCurrentMappingDecision: (m.body.decisions ?? []).find((d: any) => d.sourceGoalId === entry.legacyGoalId),
      sourceDocument: extraction.sourceDocument, sourceDocuments: extraction.sourceDocuments,
    })
  }
}
const views = fs.readdirSync(state.viewsPath).filter(p => p.endsWith('.view.json')).map(p => {
  const view = read(path.join(state.viewsPath, p))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  return { path: path.join(state.viewsPath, p), viewId: view.viewId, scope: view.scope,
    goals: ids.map(goalId => ({ goalId, target: roles.targetGoalIds.has(goalId), prerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(goalId) })) }
})
fs.mkdirSync(path.join(own, 'evidence'), { recursive: true })
fs.writeFileSync(path.join(own, 'evidence/native-one-landscape-applicability.json'), JSON.stringify({
  role: 'BOUNDED_PROSPECTIVE_NATIVE_FUNCTION_OUTPUT', normalWrites: false, productionCompilerChanged: false,
  enumeratedCanonicalLandscapes: result.reports.length, selectedMappingCount: mappings.length,
  statePath, casPath, report: { ...report, goals: report.goals.filter(g => ids.includes(g.goalId)), findings: report.findings.filter(g => ids.includes(g.goalId ?? '')) },
}, null, 2) + '\n')
fs.writeFileSync(path.join(own, 'evidence/current-carrier-source-witnesses.inventory.json'), JSON.stringify(witnesses, null, 2) + '\n')
fs.writeFileSync(path.join(own, 'evidence/native-selected-view-roles.json'), JSON.stringify(views, null, 2) + '\n')
for (const p of ['app/scripts/sourceCoverageEvidence.ts', 'app/scripts/applicabilityCompiler.ts', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/scripts/generateCurriculumQualityStatus.ts']) inputPaths.add(path.resolve(repo, p))
fs.writeFileSync(path.join(own, 'evidence/INPUTS.native-read-pins.json'), JSON.stringify([...inputPaths].sort().filter(p => !p.includes('/node_modules/') && fs.statSync(p).isFile()).map(p => {
  const bytes = fs.readFileSync(p)
  return { path: path.relative(repo, p), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
}), null, 2) + '\n')
console.log(JSON.stringify({ reports: result.reports.length, mappings: mappings.length, selectedViews: views.length, witnessRows: witnesses.length,
  selectedGoals: report.goals.filter(g => ids.includes(g.goalId)).map(g => ({ id: g.goalId, jurisdictions: g.compiledApplicability.jurisdiction,
    direct: g.evidence.filter(e => ['mapping', 'provenance'].includes(e.kind)).map(e => e.value).filter((v, i, a) => a.indexOf(v) === i) })) }, null, 2))
