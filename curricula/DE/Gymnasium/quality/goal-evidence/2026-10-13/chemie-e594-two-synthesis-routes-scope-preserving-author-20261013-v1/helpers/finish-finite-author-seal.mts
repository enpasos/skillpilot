// Apache-2.0. Unmodified production fingerprint/authoring APIs; no native build.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const bind = (path: string) => { const b = readFileSync(resolve(root, path)); return { path, sha256: `sha256:${createHash('sha256').update(b).digest('hex')}`, bytes: b.length } }
const write = (path: string, obj: unknown) => writeFileSync(resolve(root, own, path), typeof obj === 'string' ? obj : `${JSON.stringify(obj, null, 2)}\n`, { flag: 'wx' })
const modules = ['app/scripts/goalBookModel.ts', 'app/src/utils/authoring/canonicalAuthoring.ts']
const book = await import(pathToFileURL(resolve(root, modules[0])).href)
const authoring = await import(pathToFileURL(resolve(root, modules[1])).href)
const cas = read(`${own}/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json`)
assert.deepEqual(bind(cas.sourceCanonicalBinding.path), cas.sourceCanonicalBinding)
const baseline = read(cas.sourceCanonicalBinding.path)
const proposal = structuredClone(baseline)
for (const row of cas.existingGoals) {
  const ix = proposal.goals.findIndex((g: any) => g.id === row.expectedBeforeWholeGoal.id)
  assert.deepEqual(proposal.goals[ix], row.expectedBeforeWholeGoal)
  proposal.goals[ix] = row.proposedAfterWholeGoal
}
const parentId = 'e5941581-0aba-5354-b4b9-d0249d4538a8'
const ix = proposal.goals.findIndex((g: any) => g.id === parentId)
proposal.goals.splice(ix + 1, 0, ...cas.newChildren)
const normalized = authoring.normalizeCanonicalLandscape(proposal)
assert.deepEqual(JSON.parse(JSON.stringify(normalized)), proposal)
const diagnostics = authoring.validateCanonicalLandscape(normalized)
assert.equal(diagnostics.filter((d: any) => d.severity === 'error').length, 0)
const rawRows = read(`${own}/candidate/three-semantic-kind-decision-CAS.pending-stock-fingerprints.inactive-author.json`)
assert.deepEqual(bind(rawRows.sourceSemanticLedgerBinding.path), rawRows.sourceSemanticLedgerBinding)
const oldSemantic = read(rawRows.sourceSemanticLedgerBinding.path)
const allDecisions = structuredClone(oldSemantic.decisions)
const rows: any[] = []
for (const goal of [...cas.existingGoals.map((r: any) => r.proposedAfterWholeGoal), ...cas.newChildren]) {
  const before = oldSemantic.decisions.find((d: any) => d.goalId === goal.id) ?? null
  const kindProposal = rawRows.rows.find((r: any) => r.proposedAfterWholeDecision.goalId === goal.id)
  const after = structuredClone(kindProposal?.proposedAfterWholeDecision ?? before)
  assert(after)
  after.sourceFingerprint = book.fingerprintSemanticKindSourceGoal(goal)
  // The three unchanged-kind rows are technical classification fingerprint
  // transport only. No prior A/D/P/M/V verdict is rebound by this helper.
  if (!kindProposal) after.decisionBasis = `${before.decisionBasis}; inactive-author technical fingerprint transport only; scientific/page-context re-review pending`
  const decisionIndex = allDecisions.findIndex((d: any) => d.goalId === goal.id)
  if (decisionIndex < 0) allDecisions.push(after)
  else allDecisions[decisionIndex] = after
  rows.push({ expectedBeforeWholeDecision: before, proposedAfterWholeDecision: after, classificationOnlyNoScientificVote: true })
}
const kindCounts: Record<string, number> = {}
for (const decision of allDecisions) kindCounts[decision.semanticKind] = (kindCounts[decision.semanticKind] ?? 0) + 1
assert.equal(allDecisions.length, 525)
assert.equal(kindCounts.curricularAtomic, 403)
for (const goal of proposal.goals) assert.equal(allDecisions.find((d: any) => d.goalId === goal.id).sourceFingerprint, book.fingerprintSemanticKindSourceGoal(goal))
write('candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json', { sourceSemanticLedgerBinding: rawRows.sourceSemanticLedgerBinding, rows, measuredProposedCounts: { ...kindCounts, total: allDecisions.length }, activeWrites: false, newIndependentVotes: 0 })

const sourceCAS = read(`${own}/source-exact-cell-partition-and-whole-mapping-CAS.author.json`)
for (const file of sourceCAS.wholeMappingCompareAndSwap) {
  assert.deepEqual(bind(file.expectedWholeFileBinding.path), file.expectedWholeFileBinding)
  const mapping = read(file.expectedWholeFileBinding.path)
  assert.equal(mapping.mappings.length, file.appendAtMappingsLength)
  for (const cell of file.decisionCellCompareAndSwap) {
    const index = Number(cell.jsonPointer.split('/').at(-1))
    assert.deepEqual(mapping.decisions[index], cell.expectedBeforeWholeCell)
  }
  for (const extraction of file.exactExtractionBindings) assert.deepEqual(bind(extraction.path), extraction)
}
const viewCAS = read(`${own}/scope-view-whole-CAS.author.json`)
for (const file of viewCAS.wholeViewProposals) {
  assert.deepEqual(bind(file.expectedWholeViewBinding.path), file.expectedWholeViewBinding)
  const view = read(file.expectedWholeViewBinding.path)
  for (const cell of file.exactNodeChanges) {
    let node = view
    for (const part of cell.jsonPointer.split('/').slice(1)) node = node[part]
    assert.deepEqual(node, cell.beforeWholeNode)
  }
}
const sourceGuard = read(`${own}/inputs/finite-input-bindings.actual.json`)
for (const guard of sourceGuard.inputBindings) assert.deepEqual(bind(guard.path), guard)
const cases = read(`${own}/positive/four-child.complete-DEEN-cases.author.json`)
const profiles = read(`${own}/positive/two-child.exact-route-profiles.author.json`)
assert.equal(cases.cases.length, 4)
assert.equal(profiles.profiles.length, 2)
for (const profile of profiles.profiles) {
  assert.equal(profile.profile.expectations.length, 1)
  assert.equal(profile.profile.applicationCaseBriefs.length, 2)
  for (const brief of profile.profile.applicationCaseBriefs) {
    const c = cases.cases.find((c: any) => c.caseId === brief.id)
    assert.equal(c.goalId, profile.goalId)
    assert.equal(brief.taskDemandDe, `${c.dataDe}\n${c.taskDe}`)
    assert.equal(brief.taskDemandEn, `${c.dataEn}\n${c.taskEn}`)
    assert.equal(brief.expectedPerformanceDe, c.modelAnswerDe)
    assert.equal(brief.expectedPerformanceEn, c.modelAnswerEn)
  }
}
write('checks/stock-fingerprints-and-exact-CAS-guards.actual.json', {
  checkedAtUTC: new Date().toISOString(), productionAPIs: modules.map(bind), normalizerWholeCandidateExact: true,
  canonicalAuthoringDiagnostics: diagnostics, sourceFingerprintCountChecked: allDecisions.length,
  countsMeasuredInMemory: { beforeCanonical: baseline.goals.length, proposedCanonical: proposal.goals.length, beforeCurricularAtomic: oldSemantic.counts.curricularAtomic, proposedCurricularAtomic: kindCounts.curricularAtomic },
  exactSourceMappingGuardCount: sourceCAS.wholeMappingCompareAndSwap.length,
  exactViewGuardCount: viewCAS.wholeViewProposals.length,
  completeProfileCaseJoinCount: 4, copiedWholeCanonicalFiles: 0, newBookModels: 0, newNativePDFs: 0,
  newImages: 0, authorScientificPasses: 0, newIndependentVotes: 0, activeWrites: false,
})
write('README.author.md', `# e594: zwei vollständige Syntheserouten — inaktiver Autorstand\n\nDer echte \`non_atomic\`-/\`split_review\`-Befund wird durch zwei vollständige Ziele bearbeitet: Azosynthese über Diazotierung und Kupplung sowie Triphenylmethansynthese über Kondensation, Leukoverbindung und Oxidation. Das stabile e594-Ziel bleibt als Cluster mit dem bytegleichen korrigierten Überblicks-PNG a728cc4423 erhalten. Die zwei Kinder erhalten eigene, noch nicht erzeugte Bilder; die PNG-Briefs liegen unter \`visual-briefs/\`.\n\nDie kleinen CAS-Dateien binden den ganzen bestehenden Quellkanon über seinen Hash und enthalten nur drei ganze geänderte Ziele, zwei ganze neue Ziele, betroffene Klassifikationszeilen und exakte Mapping-/Viewzellen. Der Terminalknoten fordert beide Kinder; die Farbstoffchemie-Gewichtung wächst 11→12. Die vollständige In-Memory-Projektion ergibt 525 Knoten und 403 curricularAtomic statt der eingefrorenen 523/402. Dieser Vorschlag ersetzt den Ausgangsstand nicht. Kein Gesamtkanon, BookModel oder vollständige Quellenmatrix wurde kopiert.\n\nAlle sechs bisherigen DE/EN-Rubrikbausteine und beide vollständigen Routenerwartungen bleiben erhalten, verteilt auf zwei Profile und vier vollständige alternative Fallentwürfe. Ein hinreichender mehrschrittiger Transfer kann genügen; die zwei Varianten je Kind sind keine Aufgabenquote. Der alte ganze Fall-/Profilstand bleibt unverändert und exakt referenziert.\n\nBayern C13-EA.2.6 nennt beide Syntheserouten, RP 6.2 #2 die Azosynthese. RP-Klassifikation/Carbonylkontext und SN12-LK-Wahlbereich-Strukturklassifikation bleiben begrenzte Teilbeiträge; sie belegen keine vollständige Triphenylmethansynthese. Die übernommene Jurisdiktionsmetadatenunion und vorhandene breite Ansichten sind keine neue Quellen-/Kursfreigabe. Für die neu partitionierten Quellenzellen und neuen Kinder bleiben unabhängige Quellen-/D/P/A/M-Prüfungen sowie echte Bilder mit V-Prüfung offen. Änderungen der Terminal- und Nachbarseitenkontexte müssen vor Integration neu gebunden werden. Die vorhandenen e594-Befunde bleiben als historische Entscheidungen erhalten und werden nicht zu Kinderfreigaben.\n\nJSON, exakte Eingabe-/CAS-Guards, normaler Produktionsnormalisierer, Produktionsfingerprints für alle 525 Klassifikationen, DAGs und Inhaltserhaltung wurden mechanisch geprüft. Es gibt keine wissenschaftlichen Autor-Passes, unabhängigen Stimmen, aktiven Schreibvorgänge, Git-Operationen, menschliche Freigabe oder M7-Abschlussbehauptung.\n`)
const selector = {
  schemaVersion: 1, role: 'Neutral finite selector for inactive e594 two-route AUTHOR correction; scientific review pending',
  originalFinalSourceNativeSelector: bind(sourceGuard.inputBindings[0].path),
  canonicalCAS: bind(`${own}/candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json`),
  semanticClassificationCAS: bind(`${own}/candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json`),
  wholeGraphImpact: bind(`${own}/canonical-whole-goal-CAS-and-graph-impacts.author.json`),
  contextImpact: bind(`${own}/whole-context-before-after-and-inherited-scope-effects.author.json`),
  sourceCellsAndCAS: bind(`${own}/source-exact-cell-partition-and-whole-mapping-CAS.author.json`),
  scopeViewCAS: bind(`${own}/scope-view-whole-CAS.author.json`),
  childProfiles: bind(`${own}/positive/two-child.exact-route-profiles.author.json`),
  childCases: bind(`${own}/positive/four-child.complete-DEEN-cases.author.json`),
  retainedOriginalWholeCaseProfileHistory: bind(`${own}/inputs/retained-e594-original-whole-profile-and-two-cases.exact-history.json`),
  routeTransport: bind(`${own}/positive/exact-whole74-whole37-split-transport.author.json`),
  measuredStructuralChecks: bind(`${own}/checks/finite-author-structural-preservation.actual.json`),
  stockFingerprintCASChecks: bind(`${own}/checks/stock-fingerprints-and-exact-CAS-guards.actual.json`),
  sourceReviewFindingBindings: [
    bind('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-final-eighteen-current402-atomicity-independent-a-20261013-v1/SCIENTIFIC.REPORT.md'),
    bind('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-final-fiftythree-current402-source-native-independent-a-20261013-v1/SCIENTIFIC.REPORT.md'),
  ],
  visualBriefs: cas.newChildren.map((g: any) => bind(`${own}/visual-briefs/${g.id}.prompt.de.md`)),
  baseline523Current402NotReplaced: true, proposed525403Only: true, independentSourceAndDPAMReviewPending: true,
  actualChildImagesAndVAbsent: true, wholeSourceAndCourseApproval: false, currentParentOverviewOnlyPreserved: true,
  newIndependentVotes: 0, activeWrites: false, gitOperations: false, humanApproval: false, humanTrial: false,
}
write('NEUTRAL.two-route-split.inactive-author.input-selector.json', selector)
const files: string[] = []
const collect = (dir: string) => {
  for (const name of readdirSync(resolve(root, dir)).sort()) {
    const path = `${dir}/${name}`
    const stat = lstatSync(resolve(root, path))
    assert(!stat.isSymbolicLink(), `symlink forbidden in finite author root: ${path}`)
    if (stat.isDirectory()) collect(path)
    else files.push(path)
  }
}
collect(own)
for (const path of files.filter(p => p.endsWith('.json'))) read(path)
const manifest = files.map(bind)
write('FINAL.finite-inactive-author.freeze.json', {
  sealedAtUTC: new Date().toISOString(), role: 'Finite inactive author checkpoint, exact bytes; not independent review',
  outputFiles: manifest, outputFileCount: manifest.length, outputBytes: manifest.reduce((n, f) => n + f.bytes, 0),
  originalInputBindings: sourceGuard.inputBindings, finalSelector: bind(`${own}/NEUTRAL.two-route-split.inactive-author.input-selector.json`),
  allStructuredOutputsParsed: true, symlinks: 0, ignoredScratchInputs: 0,
  copiedWholeCanonicalFiles: 0, newBookModels: 0, scientificAuthorPasses: 0, independentVotes: 0, activeWrites: false,
  futureIntegrationAndFreshReviewsRequired: true,
})
console.log(JSON.stringify({ finiteAuthorRoot: own, frozenOutputFiles: manifest.length, bytes: manifest.reduce((n, f) => n + f.bytes, 0), proposedInMemoryCount: [proposal.goals.length, kindCounts.curricularAtomic], activeWrites: false, newIndependentVotes: 0 }))
