// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}
const bind = (path: string) => ({ path: relative(root, path), sha256: createHash('sha256').update(readFileSync(path)).digest('hex'), bytes: readFileSync(path).length })
const { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } = await import(pathToFileURL(join(root, 'app/scripts/goalBookModel.ts')).href)
const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const { compileCompositionView } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { prepareLandscapeEntries } = await import(pathToFileURL(join(root, 'app/src/hooks/useLandscapes.ts')).href)
const guard = read(join(here, 'current-inputs-and-preservation.author.json'))
const baselinePath = join(root, guard.baseline.path)
if (bind(baselinePath).sha256 !== guard.baseline.sha256) throw new Error('Current production canonical drifted before targeted execution')
const baseline = read(baselinePath)
const candidatePath = join(here, 'candidate/canonical.current480-seven-atomic-route-proposals.json')
const candidate = read(candidatePath)
const oldKindsPath = join(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const oldKinds = read(oldKindsPath)
const previous = new Map(oldKinds.decisions.map((entry: any) => [entry.goalId, entry]))
const kinds = structuredClone(oldKinds)
kinds.ledgerId = 'chemie-b007-current486-inert-author-native-input'
kinds.sourceLandscapePath = relative(root, candidatePath)
kinds.decisions = candidate.goals.map((goal: any) => {
  const old: any = previous.get(goal.id)
  const sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  if (old?.sourceFingerprint === sourceFingerprint) return old
  return old ? { ...old, sourceFingerprint, semanticKind: goal.contains.length && guard.changedExistingWholeGoalIds.includes(goal.id) ? 'curricularArea' : old.semanticKind }
    : { goalId: goal.id, sourceFingerprint, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-structural-split-curricular-atomic' }
})
kinds.counts = Object.fromEntries(Object.keys(oldKinds.counts).filter(key => key !== 'total').map(key => [key, kinds.decisions.filter((entry: any) => entry.semanticKind === key).length]))
kinds.counts.total = kinds.decisions.length
if (kinds.counts.total !== 486 || kinds.counts.curricularAtomic !== 382 || kinds.counts.curricularArea !== 63) throw new Error('Unexpected actual candidate kind counts')
const kindsPath = join(here, 'candidate/semantic-kinds.current486.inert.json')
write(kindsPath, kinds)
const normalized = normalizeCanonicalLandscape(candidate)
const canonicalFindings = validateCanonicalLandscape(normalized)
if (canonicalFindings.some((entry: any) => entry.severity === 'error')) throw new Error(JSON.stringify(canonicalFindings))
const goalById = new Map(candidate.goals.map((goal: any) => [goal.id, goal]))
const visited = new Set<string>(), visiting = new Set<string>()
const visit = (id: string) => {
  if (visiting.has(id)) throw new Error('Requires cycle: ' + id)
  if (visited.has(id)) return
  visiting.add(id)
  for (const reference of (goalById.get(id) as any).requires ?? []) {
    const local = reference.includes(':') ? reference.split(':').at(-1) : reference
    if (!goalById.has(local)) throw new Error('Missing prerequisite: ' + reference)
    visit(local)
  }
  visiting.delete(id); visited.add(id)
}
for (const id of goalById.keys()) visit(id as string)
const attachKinds = (landscape: any, ledger: any) => {
  const classified = new Map(ledger.decisions.map((entry: any) => [entry.goalId, entry.semanticKind]))
  return normalizeCanonicalLandscape({ ...landscape, goals: landscape.goals.map((goal: any) => ({ ...goal, semanticKind: classified.get(goal.id) })) })
}
const before = attachKinds(baseline, oldKinds), after = attachKinds(candidate, kinds)
const oldEffective = new Map(prepareLandscapeEntries([baseline])[0].goals.map((goal: any) => [goal.id, goal]))
const newEffective = new Map(prepareLandscapeEntries([candidate])[0].goals.map((goal: any) => [goal.id, goal]))
const splitParents = ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
const quantitative = ['413040cd-ba74-5227-948c-a778b0bd0f56', '4aeced1e-15cd-58df-83f7-68e2531c2d32', '49d42c38-419c-5048-b7e9-860645dd122d']
const descendants = (id: string, effective: Map<any, any>, seen = new Set<string>()): Set<string> => {
  if (seen.has(id)) return seen
  seen.add(id)
  for (const entry of effective.get(id)?.effectiveRequires ?? []) if (effective.has(entry)) descendants(entry, effective, seen)
  return seen
}
const changedEffective = guard.currentStrictGoalIds.map((id: string) => ({
  goalId: id, before: oldEffective.get(id)?.effectiveRequires ?? [], candidate: newEffective.get(id)?.effectiveRequires ?? [],
})).filter((entry: any) => JSON.stringify(entry.before) !== JSON.stringify(entry.candidate))
const inheritedModelIds = ['988888bb-1f88-55f9-9a44-f3f60469a297', '5338b54c-68bc-5892-907c-e025351ffde6', '5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf', '78109f6d-c415-52c4-8314-07c0dd888a80']
const oldConsumers = baseline.goals.filter((goal: any) => goal.requires.some((id: string) => splitParents.includes(id))).map((goal: any) => goal.id)
const inspectedIds = [...new Set([...oldConsumers, ...inheritedModelIds])]
const exactRoutes = inspectedIds.map(id => {
  const prerequisiteClosure = [...descendants(id, newEffective)].filter(entry => entry !== id)
  return { goalId: id, title: (goalById.get(id) as any).title,
    beforeEffectiveRequires: oldEffective.get(id)?.effectiveRequires ?? [], candidateEffectiveRequires: newEffective.get(id)?.effectiveRequires ?? [],
    candidateTransitivePrerequisites: prerequisiteClosure,
    broadSplitClusterStillRequired: prerequisiteClosure.some(entry => splitParents.includes(entry)),
    newQuantitativePrerequisiteStillRequired: prerequisiteClosure.some(entry => quantitative.includes(entry)),
    currentProtectedStrict: guard.currentStrictGoalIds.includes(id), reviewStatus: 'author_didactic_proposal_independent_recheck_required' }
})
if (exactRoutes.some(entry => entry.broadSplitClusterStillRequired || entry.newQuantitativePrerequisiteStillRequired)) throw new Error('Broad or optional/fraction prerequisite survives in affected consumers')

const manifestPath = join(root, 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')
const manifest = read(manifestPath), affectedViews: any[] = []
for (const sourcePath of manifest.sourcePaths) {
  const view = read(join(root, sourcePath)), references: any[] = []
  const scan = (nodes: any[]) => nodes.forEach(node => { if (splitParents.includes(node.goalId)) references.push({ kind: node.kind, goalId: node.goalId }); if (node.children) scan(node.children) })
  scan(view.rootNodes)
  if (!references.length) continue
  const result = compileCompositionView(view, after)
  affectedViews.push({ binding: bind(join(root, sourcePath)), viewId: view.viewId, scope: view.scope,
    originalReferences: references, actualFindings: result.findings, sourceDutyStatus: 'HOLD; unchanged broad source rows do not prove all new child operators' })
}
const hePath = manifest.sourcePaths.find((path: string) => path.endsWith('de-he-seki.view.json'))
const heBefore = read(join(root, hePath)), heCandidate = structuredClone(heBefore)
heCandidate.$schema = 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
const handlingChildren = (goalById.get(splitParents[0]) as any).contains
const mandatorySolution = ['1351706f-4ea6-56e9-951b-87b24cbcdee8', '4aeced1e-15cd-58df-83f7-68e2531c2d32', '49d42c38-419c-5048-b7e9-860645dd122d']
const replace = (nodes: any[]): any[] => nodes.map(node => {
  if (node.goalId === splitParents[0]) return { kind: 'structure', id: `${heBefore.viewId}-b007-safety-mandatory`, label: 'HE 8.1: Umgang und Entsorgung – verbindliche Teilaspekte', children: handlingChildren.map((goalId: string) => ({ kind: 'goalEntry', goalId })) }
  if (node.goalId === splitParents[1]) return { kind: 'structure', id: `${heBefore.viewId}-b007-solutions`, label: 'HE 8.1: Lösungen und Anteile', children: [
    { kind: 'structure', id: `${heBefore.viewId}-b007-solutions-mandatory`, label: 'Verbindliche Herstellung und Anteilsroutinen', children: mandatorySolution.map(goalId => ({ kind: 'goalEntry', goalId })) },
    { kind: 'structure', id: `${heBefore.viewId}-b007-solubility-facultative`, label: 'Fakultativ: Sättigung und Löslichkeitsdaten', children: [{ kind: 'goalEntry', goalId: quantitative[0] }] },
  ] }
  return node.children ? { ...node, children: replace(node.children) } : node
})
heCandidate.rootNodes = replace(heCandidate.rootNodes)
const heCandidatePath = join(here, 'candidate/he-seki-existing-source-view.bounded-candidate.json')
write(heCandidatePath, heCandidate)
const heOldResult = compileCompositionView(heBefore, before), heNewResult = compileCompositionView(heCandidate, after)
if (heNewResult.findings.some((entry: any) => entry.severity === 'error')) throw new Error(JSON.stringify(heNewResult.findings))
const compiledGoalIds = (nodes: any[], result = new Set<string>()): Set<string> => {
  for (const node of nodes) {
    if (node.kind === 'goal' && node.sourceGoalId) result.add(node.sourceGoalId)
    compiledGoalIds(node.children, result)
  }
  return result
}
const heSelectedIds = compiledGoalIds(heNewResult.compiledRootNodes)
const oldHeIds = [...compiledGoalIds(heOldResult.compiledRootNodes)]
const expectedHeIds = new Set([...oldHeIds.filter(id => !splitParents.includes(id)), ...handlingChildren, ...mandatorySolution, quantitative[0]])
if (heSelectedIds.size !== expectedHeIds.size || [...expectedHeIds].some(id => !heSelectedIds.has(id))) throw new Error('Unexpected HE target mutation outside exact selected children')
const heRouteInput = join(here, 'candidate/he8-seven-routines.prospective-source.view.json')
const heNarrow = compileCompositionView(read(heRouteInput), after)
if (heNarrow.findings.some((entry: any) => entry.severity === 'error')) throw new Error(JSON.stringify(heNarrow.findings))

const baseModel = await loadGoalBookBuildInputs(relative(root, join(here, 'candidate/baseline-native-book.config.json')), root)
const candidateModel = await loadGoalBookBuildInputs(relative(root, join(here, 'candidate/candidate-native-book.config.json')), root)
if (baseModel.model.pages.length !== 378 || candidateModel.model.pages.length !== 382) throw new Error('Unexpected actual native pure model page counts')
const oldPages = new Map(baseModel.model.pages.map((page: any) => [page.goalId, page]))
const newPages = new Map(candidateModel.model.pages.map((page: any) => [page.goalId, page]))
const stripPagination = (value: any): any => Array.isArray(value) ? value.map(stripPagination) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint'].includes(key)).map(([key, item]) => [key, stripPagination(item)])) : value
const protectedPages = guard.currentStrictGoalIds.map((goalId: string) => ({ goalId,
  currentGoalFingerprint: oldPages.get(goalId)?.goalFingerprint, candidateGoalFingerprint: newPages.get(goalId)?.goalFingerprint,
  visiblePageContentIgnoringPaginationExact: JSON.stringify(stripPagination(oldPages.get(goalId))) === JSON.stringify(stripPagination(newPages.get(goalId))),
  beforeWholeGoal: baseline.goals.find((goal: any) => goal.id === goalId), candidateWholeGoal: goalById.get(goalId),
})).map((entry: any) => ({ ...entry, wholeGoalExact: JSON.stringify(entry.beforeWholeGoal) === JSON.stringify(entry.candidateWholeGoal), beforeWholeGoal: undefined, candidateWholeGoal: undefined }))
const affectedPageIds = protectedPages.filter((entry: any) => !entry.visiblePageContentIgnoringPaginationExact).map((entry: any) => entry.goalId)
const reviewPageIds = [...new Set([...guard.sixPriorCandidateGoalIds, ...affectedPageIds, ...inspectedIds])]
write(join(here, 'candidate/current-whole-selected-pages-and-contexts.raw.json'), {
  reviewRole: 'actual native whole-page inputs; not reviewed judgments',
  candidateRoutinePages: guard.sixPriorCandidateGoalIds.map((id: string) => ({ goalId: id, wholeCandidateGoal: goalById.get(id), page: newPages.get(id) })),
  affectedExistingPages: reviewPageIds.filter(id => !guard.sixPriorCandidateGoalIds.includes(id)).map(id => ({ goalId: id,
    wholeCurrentGoal: baseline.goals.find((goal: any) => goal.id === id), wholeCandidateGoal: goalById.get(id), currentPage: oldPages.get(id), candidatePage: newPages.get(id) })),
})
write(join(here, 'actual-native-routes-source-view-and-protected173.result.json'), {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'bounded current author remediation; no independent review',
  activeWrites: false, strictCompletionsAdded: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false,
  currentInputBinding: bind(baselinePath), currentKindBinding: bind(oldKindsPath), candidateBinding: bind(candidatePath), candidateKindBinding: bind(kindsPath),
  productionHelpers: ['app/scripts/goalBookModel.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/hooks/useLandscapes.ts'].map(path => bind(join(root, path))),
  canonicalFindings, requiresDagPassed: true, nativePurePageCounts: { current: 378, candidate: 382 }, semanticKindCounts: kinds.counts,
  allOriginal480IdsRetained: baseline.goals.every((goal: any) => goalById.has(goal.id)), exactAtomicRouteChecks: exactRoutes,
  protected173WholeGoalExactCount: protectedPages.filter((entry: any) => entry.wholeGoalExact).length,
  protected173GoalFingerprintExactCount: protectedPages.filter((entry: any) => entry.currentGoalFingerprint === entry.candidateGoalFingerprint).length,
  protected173VisiblePageContentIgnoringPaginationExactCount: protectedPages.filter((entry: any) => entry.visiblePageContentIgnoringPaginationExact).length,
  protectedPageBindings: protectedPages, changedProtectedEffectivePrerequisites: changedEffective,
  targetedExistingHEView: { original: bind(join(root, hePath)), candidate: bind(heCandidatePath), findings: heNewResult.findings,
    oldTargetCount: oldHeIds.length, candidateTargetCount: heSelectedIds.size, unaffectedTargetsExact: true,
    mandatoryRoutineGoalIds: [...handlingChildren, ...mandatorySolution], facultativeRoutineGoalId: quantitative[0],
    independentSourceDecisionBasis: 'exact prior independent A/B KEEP of HE physical pages8/12/13; no new national source approval',
    actualOriginalWholeSourceDutiesCleared: 0 },
  unchangedAffectedNationalViews: affectedViews,
  remainingUnreconciledSourceViews: affectedViews.filter(entry => entry.viewId !== heBefore.viewId).length,
  untouchedSourceViewCPV009Count: affectedViews.filter(entry => entry.viewId !== heBefore.viewId).reduce((sum, entry) => sum + entry.actualFindings.filter((finding: any) => finding.code === 'CPV-009').length, 0),
  all403NationalOriginalSourceDutiesRemainUncleared: true, nativeIndependentD_P_A_M_VApproval: false,
  strictGain: 0, runtimeBackendFrontierExecuted: false, PDFRendered: false, fullBuildExecuted: false,
})
if (bind(baselinePath).sha256 !== guard.baseline.sha256) throw new Error('Production drift during targeted native execution')
console.log(JSON.stringify({ currentWholeGoals: 480, candidateWholeGoals: 486, candidateAtomic: 382,
  exactConsumerRoutes: exactRoutes.length, inheritedClusterLeakRemaining: 0, HEViewErrors: 0,
  protected173WholeGoalsExact: protectedPages.filter((entry: any) => entry.wholeGoalExact).length,
  actualAffectedProtectedPages: affectedPageIds.length, remainingRegionalSourceViews: affectedViews.length - 1,
  strictGain: 0, activeWrites: false }))
