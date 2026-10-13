// Apache-2.0. Exact guard/role checks, not a source atlas or publication build.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2'
const v1 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1'
const peer = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-split-scientific-independent-a-20261013-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const bind = (path: string) => { const b = readFileSync(resolve(root, path)); return { path, sha256: `sha256:${createHash('sha256').update(b).digest('hex')}`, bytes: b.length } }
const write = (path: string, data: unknown) => writeFileSync(resolve(root, own, path), typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx' })
const inputSeal = read(`${v1}/FINAL.finite-inactive-author.freeze.json`)
for (const binding of [...inputSeal.outputFiles, ...inputSeal.originalInputBindings]) assert.deepEqual(bind(binding.path), binding)
const peerSealPath = `${peer}/FINAL.independent-scientific.freeze.json`
const peerSealBinding = bind(peerSealPath)
const peerReportBinding = bind(`${peer}/SCIENTIFIC.REPORT.md`)
const cas = read(`${v1}/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json`)
assert.deepEqual(bind(cas.sourceCanonicalBinding.path), cas.sourceCanonicalBinding)
const landscape = read(cas.sourceCanonicalBinding.path)
for (const row of cas.existingGoals) {
  const index = landscape.goals.findIndex((g: any) => g.id === row.expectedBeforeWholeGoal.id)
  assert.deepEqual(landscape.goals[index], row.expectedBeforeWholeGoal)
  landscape.goals[index] = row.proposedAfterWholeGoal
}
landscape.goals.push(...cas.newChildren)
const goalById = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const childIds = cas.newChildren.map((g: any) => g.id)
const roleModule = 'app/src/utils/authoring/compositionViewAuthoring.ts'
const api = await import(pathToFileURL(resolve(root, roleModule)).href)
const viewCas = read(`${own}/all21-coupled-source-and-learner-view-CAS.author.json`)
const viewRoleChecks: any[] = []
for (const file of viewCas.wholeExistingViewGuardsAndNodeCAS) {
  assert.deepEqual(bind(file.expectedWholeViewBinding.path), file.expectedWholeViewBinding)
  const view = read(file.expectedWholeViewBinding.path)
  const before = structuredClone(view)
  for (const cell of file.exactNodeCAS) {
    const parts = cell.jsonPointer.split('/').slice(1)
    let parent: any = view
    for (const part of parts.slice(0, -1)) parent = parent[part]
    const index = Number(parts.at(-1))
    assert.deepEqual(parent[index], cell.expectedBeforeWholeNode)
    if (cell.operation === 'remove') parent.splice(index, 1)
    else { assert.equal(cell.operation, 'replace'); parent[index] = cell.proposedAfterWholeNode }
  }
  const roles = api.collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  const targets = childIds.filter((id: string) => roles.targetGoalIds.has(id))
  const allowBoth = file.exactNodeCAS.every((c: any) => c.allowBothCompleteChildren)
  assert.deepEqual(targets, allowBoth ? childIds : [])
  assert(childIds.every((id: string) => !roles.prerequisiteOnlyGoalIds.has(id)))
  // Only the explicit e594 reference may change. All other references remain.
  const refs = (v: any): any[] => {
    if (Array.isArray(v)) return v.flatMap(refs)
    if (v && typeof v === 'object') return [ ...(v.goalId && v.goalId !== 'e5941581-0aba-5354-b4b9-d0249d4538a8' ? [JSON.stringify(v)] : []), ...Object.values(v).flatMap(refs) ]
    return []
  }
  assert.deepEqual(refs(view), refs(before))
  viewRoleChecks.push({ viewBinding: file.expectedWholeViewBinding, scope: file.wholeExistingScope, completeSynthesisChildTargetIds: targets, synthesisChildPrerequisiteOnlyIds: [], everyOtherGoalReferenceExact: true })
}
assert.equal(viewRoleChecks.filter(c => c.completeSynthesisChildTargetIds.length === 2).length, 2)
assert.equal(viewRoleChecks.filter(c => c.completeSynthesisChildTargetIds.length === 0).length, 19)

const sourceCas = read(`${own}/source-component-five-cell-and-three-mapping-CAS.author.json`)
const sourceChecks: any[] = []
for (const file of sourceCas.wholeMappingGuardsAndCellCAS) {
  assert.deepEqual(bind(file.expectedWholeMappingBinding.path), file.expectedWholeMappingBinding)
  const mapping = read(file.expectedWholeMappingBinding.path)
  assert.deepEqual(mapping.summary ?? null, file.exactLegacySummaryGuard.expectedBefore)
  const before = structuredClone(mapping)
  for (const row of [...file.mappingCellReplacements].sort((a: any, b: any) => Number(b.jsonPointer.split('/').at(-1)) - Number(a.jsonPointer.split('/').at(-1)))) {
    const index = Number(row.jsonPointer.split('/').at(-1))
    assert.deepEqual(mapping.mappings[index], row.expectedBeforeWholeCell)
    mapping.mappings.splice(index, 1, ...row.replacementWholeCells)
  }
  for (const row of file.decisionCellCompareAndSwap) {
    const index = Number(row.jsonPointer.split('/').at(-1))
    assert.deepEqual(mapping.decisions[index], row.expectedBeforeWholeCell)
    mapping.decisions[index] = row.proposedAfterWholeCell
  }
  assert.deepEqual(mapping.summary, before.summary)
  assert.deepEqual(mapping.decisions.map((d: any) => d.sourceGoalId), before.decisions.map((d: any) => d.sourceGoalId))
  const operative = mapping.decisions.flatMap((d: any) => d.canonicalGoalIds.filter((id: string) => childIds.includes(id)).map((id: string) => ({ sourceGoalId: d.sourceGoalId, targetGoalId: id })))
  const isBY = file.namedMeasuredCountUnits.before.sourceDecisionRows === 332
  assert.deepEqual(operative.map((r: any) => r.targetGoalId), isBY ? childIds : [])
  if (isBY) assert(operative.every((r: any) => r.sourceGoalId === '4fb9f93d-b53f-5e9a-9bd1-5d600f081091'))
  sourceChecks.push({ mappingBinding: file.expectedWholeMappingBinding, operativeSynthesisChildEdges: operative, legacySummaryExact: true, sourceDecisionRowsAndOtherPartnersPreserved: true, namedCountUnits: file.namedMeasuredCountUnits })
}
const locators = read(`${own}/four-source-locator-and-optional-condition-whole-cell-CAS.author.json`)
for (const cell of locators.sourceCellCompareAndSwap) {
  assert.deepEqual(bind(cell.expectedWholeExtractionBinding.path), cell.expectedWholeExtractionBinding)
  const extraction = read(cell.expectedWholeExtractionBinding.path)
  const index = Number(cell.jsonPointer.split('/').at(-1))
  assert.deepEqual(extraction.sourceGoals[index], cell.expectedBeforeWholeCell)
  for (const key of ['id', 'title', 'description', 'sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText', 'rawSourceSpan']) assert.deepEqual(cell.proposedAfterWholeCell[key], cell.expectedBeforeWholeCell[key])
}
write('checks/stock-limited-view-role-and-source-CAS-guards.actual.json', {
  checkedAtUTC: new Date().toISOString(), roleAPI: bind(roleModule), viewRoleChecks, sourceChecks,
  interpretation: 'Exact proposed e594 node-role and direct mapping checks only. This is not a whole source atlas, normal source compiler run, BookModel, native page, runtime or learner-scope acceptance.',
  synthesizedViewsWritten: 0, sourceMappingFilesWritten: 0, fullCompilerScopeMeasurementByRootPending: true,
  newDPAOrMVVotes: 0, newIndependentVotes: 0, activeWrites: false,
})
write('README.author.md', `# e594 v2: begrenzte Quellen- und View-Korrektur\n\nDieser inaktive Autor-Nachfolger ersetzt ausschließlich die Quellen- und View-Vorschläge von v1. Der v1-Split-Kanon-CAS, beide vollständigen Ziele, beide Profile, vier Fallvarianten, Graphfolgen und das korrigierte Eltern-PNG bleiben exakt referenziert und unverändert. Es gibt keine neuen Ziele oder Bilder.\n\nBY C13-EA.2.6 deckt die Vereinigung beider vollständiger Syntheserouten. Nur diese Zelle erhält operative direkte Kinder-Zuordnungen. Die bisherigen e594-Zuordnungen aus RP-Carbonyl-/Klassifikationszellen und SN-Klassifikation werden entfernt; alle anderen ursprünglichen Mappingpartner und Quellenentscheidungen bleiben erhalten. Die RP-Azomechanik passt fachlich zum Kind, bleibt jedoch als nichtoperativer bedingter Vorschlag offen, weil der tatsächliche gewählte WP-/Additum-Kontext im allgemeinen LK-Modell nicht ausgedrückt ist. \`partial\`, Rationale oder optionale Metadaten dürfen keine vollständige Synthese-Zielabdeckung herstellen.\n\nAlle 21 früheren View-Vorschläge werden ersetzt. BY-LK-Quellansicht und nationale kanonische Vereinigung dürfen beide Kinder zeigen. Die übrigen 19 Ansichten entfernen nur den ungedeckten e594-Syntheseeintrag und behalten sämtliche anderen Zielreferenzen, Reihenfolgen und Rollen. Es gibt keinen Ersatz als prerequisiteOnly und keine neue Auswahlberechtigung. Diese Autorentscheidung erledigt weder echte optionale Kursauswahl noch die konkreten offenen Quellenpflichten.\n\nVier ganze Extraktionszellen bekommen nachvollziehbare Locator-/Bedingungs-CAS: RP3.3 PDF-/Druckseite40, RP6.2 PDF-/Druckseite47 mit P/WP/W-Regel von Seite19, SN Wahlbereich1 PDF60/Druck48. Originale operative Verben, vollständige Quelltexte und historische Raw-Zellen bleiben erhalten. Die Autorprüfung hat die ganzen lokalen Primärseiten als Text gelesen; dies ist keine neue unabhängige Quellenfreigabe.\n\nDie historische BY-Summary277/55 für 332 Quellzeilen bleibt bytegleich. Neue getrennte Zähleinheiten messen 332 Quellenentscheidungen und Mappingkanten495→496, davon exakt285→284 und partiell210→212. Eine Änderung der Kantenanzahl wird nicht als Änderung des Quellzeilen-Nenners ausgegeben.\n\nOffen bleiben die wirkliche RP6.2-Auswahl, die quellentreue Klassen-Einteilung einschließlich mindestens zweier weiterer RP-Klassen, die SN-Chromophor-Klassifikation und der eigene optionale RP-Carbonylkontext. Absorptionsspektren und Synthese sind keine Ersatzkompetenzen. Ein kleiner passender Klassifikationsatom kann später mit vollständiger Graph-/Quellen-/Scope-Prüfung ergänzt werden; hier wird keiner erfunden.\n\nExakte CAS-Guards, unveränderte v1-Bytes und der unveränderte Rollen-Collector wurden mechanisch geprüft. Der begrenzte Rollencheck ergibt zwei Kinder in den zwei zulässigen Vereinigungen und keines in den übrigen19; das ist kein vollständiger Quellencompiler- oder BookModel-Lauf. Root kombiniert und misst die vollständigen Scopes später. V1-Jurisdiktionsmetadaten sind kein neuer Quellenanspruch und müssen beim späteren normalen Compilerlauf aus tatsächlich zulässigen Quellen neu abgeleitet werden. Ausgang523/402 und Vorschlag525/403 werden durch v2 nicht neu veröffentlicht oder als integrierter Nenner behauptet. Keine D/P/A/M/V-Stimmen, wissenschaftlichen Autor-Passes, aktiven Writes, Git-Operationen oder menschliche Freigabe.\n`)
const selector = {
  schemaVersion: 1, role: 'Neutral finite inactive AUTHOR source/view successor; exact v1 scientific content reuse; open refinement and selection blockers',
  replacesOnlyV1SourceAndViewProposals: true,
  immutableV1Seal: bind(`${v1}/FINAL.finite-inactive-author.freeze.json`),
  exactV1CanonicalCAS: bind(`${v1}/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json`),
  exactV1SemanticClassificationCAS: bind(`${v1}/candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json`),
  exactV1TwoProfiles: bind(`${v1}/positive/two-child.exact-route-profiles.author.json`),
  exactV1FourDEENCases: bind(`${v1}/positive/four-child.complete-DEEN-cases.author.json`),
  exactParentOverviewSha256: 'sha256:a728cc442316a8028844ac7d48f15dc490e4f85882f002eab99c81f683b832f3',
  genuineV1IndependentFinding: peerReportBinding, genuineV1IndependentFinalSeal: peerSealBinding,
  sourceComponentCAS: bind(`${own}/source-component-five-cell-and-three-mapping-CAS.author.json`),
  locatorOptionalConditionCAS: bind(`${own}/four-source-locator-and-optional-condition-whole-cell-CAS.author.json`),
  all21ViewCAS: bind(`${own}/all21-coupled-source-and-learner-view-CAS.author.json`),
  finiteOpenDataBlockers: bind(`${own}/bounded-open-data-refinement-and-selected-scope-blockers.author.json`),
  originalInputsReuseAndPreservation: bind(`${own}/inputs/immutable-v1-reuse-and-genuine-finding-bindings.actual.json`),
  primaryReadAndCountUnits: bind(`${own}/checks/primary-locator-read-receipt-and-count-units.actual.json`),
  limitedTechnicalChecks: bind(`${own}/checks/stock-limited-view-role-and-source-CAS-guards.actual.json`),
  fullRootCompilerScopeAndNeighborPageRebindPending: true, actualOptionalScopeRepresentationPending: true,
  faithfulClassificationTargetRefinementPending: true, onlyBYSynthesisChildDirectSourceEdges: true,
  noGoalBodiesCasesProfilesGraphOrPNGChanged: true, noRuntimeUXOrCoreNoncorePermissionChanges: true,
  newSourceScientificApproval: false, newDPAOrMVVotes: 0, newIndependentVotes: 0, activeWrites: false, gitOperations: false, humanApproval: false, humanTrial: false,
}
write('NEUTRAL.source-and-view-remediation.inactive-author.input-selector.json', selector)
const files: string[] = []
const walk = (directory: string) => {
  for (const name of readdirSync(resolve(root, directory)).sort()) {
    const p = `${directory}/${name}`
    const stat = lstatSync(resolve(root, p))
    assert(!stat.isSymbolicLink())
    if (stat.isDirectory()) walk(p)
    else files.push(p)
  }
}
walk(own)
for (const p of files.filter(p => p.endsWith('.json'))) read(p)
for (const binding of [...inputSeal.outputFiles, ...inputSeal.originalInputBindings]) assert.deepEqual(bind(binding.path), binding)
assert.deepEqual(bind(peerSealPath), peerSealBinding)
assert.deepEqual(bind(`${peer}/SCIENTIFIC.REPORT.md`), peerReportBinding)
const outputs = files.map(bind)
write('FINAL.finite-inactive-source-view-author.freeze.json', {
  sealedAtUTC: new Date().toISOString(), role: 'Finite inactive e594 v2 author source/view remediation; independent review and real data blockers remain',
  outputFiles: outputs, outputFileCount: outputs.length, outputBytes: outputs.reduce((n, f) => n + f.bytes, 0),
  immutableV1Seal: bind(`${v1}/FINAL.finite-inactive-author.freeze.json`), immutableV1OutputFilesVerified: inputSeal.outputFiles.length,
  genuineV1IndependentReport: peerReportBinding, genuineV1IndependentFinalSeal: peerSealBinding,
  finalSelector: bind(`${own}/NEUTRAL.source-and-view-remediation.inactive-author.input-selector.json`),
  allWrittenJSONParsed: true, symlinks: 0, copiedWholeCanonicalFiles: 0, copiedWholeSourceMatrices: 0, newBookModels: 0,
  fullRootCompilerMeasurementsPending: true, newGoals: 0, newImages: 0, authorScientificPasses: 0, newDPAOrMVVotes: 0,
  newIndependentVotes: 0, activeWrites: false, gitOperations: false,
})
console.log(JSON.stringify({ finiteAuthorSuccessor: own, boundOutputFiles: outputs.length, bytes: outputs.reduce((n, f) => n + f.bytes, 0), onlyTwoSupportedViewUnions: 2, unsupportedViewChildTargets: 0, dataAndSelectionBlockersRemain: true, activeWrites: false }))
