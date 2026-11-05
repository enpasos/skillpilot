import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { atomicRelation, canonicalJson, digest, fullClosure, goalMeaning, mathCanonicalPath, reachable, type MathGoal } from './learningUnitsMathAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'curricula/DE/Gymnasium/learning-units'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const parse = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const show = (ref: string, path: string) => execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${ref}:${path}`],
  { cwd: root, encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 })
const sha = (value: unknown) => digest(canonicalJson(value))
interface Landscape { landscapeId: string; goals: MathGoal[]; programUnits: Array<Record<string, unknown>>; goalPlacements: Array<Record<string, unknown>> }

/** Reuses one exact task, existing canonical subtree and explicit source ownership; never manufactures offer masks. */
function main() {
  const check = process.argv.includes('--check')
  const prepareUnpublished = process.argv.includes('--prepare-unpublished')
  const isUntracked = (path: string) => !execFileSync('git', ['-c', 'core.trustctime=false', 'ls-files', '--', path], { cwd: root, encoding: 'utf8' }).trim()
  const config = parse('app/scripts/config/learning-units/math-right-prisms-volume-surface.json')
  const original = JSON.parse(show(config.baselineRef, mathCanonicalPath)) as Landscape
  const source = structuredClone(original)
  const originalById = new Map(original.goals.map(goal => [goal.id, goal]))
  const byId = new Map(source.goals.map(goal => [goal.id, goal]))
  assert.ok(!byId.has(config.assessmentGoalId), 'The new unpublished assessment ID already belongs to the baseline')
  const old = JSON.parse(show(config.materialRef, mathCanonicalPath)) as Landscape
  const candidate = structuredClone(old.goals.find(goal => goal.id === config.assessmentGoalId))!
  assert.ok(candidate?.examData)
  const own = [...config.ownOrdinaryGoalIds, config.assessmentGoalId] as string[]
  const qualityDirectory = 'curricula/DE/Gymnasium/quality/learning-units/math-right-prisms-2026-11-05'
  const reviewRef = 'quality/learning-units/math-right-prisms-2026-11-05.md'
  const taskPath = 'curricula/DE/Gymnasium/assessments/mathematik/learning-units/prisms-2026-11-05/tasks.md'
  candidate.requires = [...config.ownOrdinaryGoalIds]
  candidate.semanticKind = 'practiceAssessment'
  candidate.sourceRef = taskPath
  candidate.examData.sourceArtifactPath = taskPath
  candidate.examData.reviewNote = 'Die unveränderte 6/6-Aufgabe wurde unabhängig maschinell auf die beiden präzisen Prismenziele geprüft. Die neue Erwerbs- und Angebotsbindung wird gesondert nachgewiesen; keine menschliche Freigabe oder Erprobung wird behauptet.'
  assert.deepEqual(candidate.examData.coveredGoalIds, config.ownOrdinaryGoalIds)
  source.goals.push(candidate); byId.set(candidate.id, candidate)
  const cluster = byId.get(config.canonicalClusterId)!
  assert.deepEqual(cluster.contains, config.ownOrdinaryGoalIds, 'Expected the reviewed precise two-goal canonical prism subtree')
  cluster.contains = [...cluster.contains!, candidate.id]
  const parents = new Map<string, string[]>()
  for (const goal of source.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
  const descendants = (id: string, path = new Set<string>()): Set<string> => {
    assert.ok(!path.has(id), `Contains cycle ${id}`)
    const goal = byId.get(id)!; assert.ok(goal)
    return goal.contains?.length ? new Set(goal.contains.flatMap(child => [...descendants(child, new Set([...path, id]))])) : new Set([id])
  }
  const changedAncestors = reachable([config.canonicalClusterId], Object.fromEntries(parents))
  for (const id of changedAncestors) byId.get(id)!.weight = descendants(id).size
  const metadata = { contractId: config.contractId, revision: config.revision, placementRevision: config.placementRevision,
    requiredChildUnitIds: [], promise: config.promise, introduction: config.introduction }
  source.programUnits.push({ id: config.programUnitId, kind: 'module', label: config.title.de,
    shortLabel: 'Gerade Prismen', parentUnitId: config.parentUnitId, learningUnit: metadata })
  for (const id of own) source.goalPlacements.push({ goalId: id, unitId: config.programUnitId,
    relation: id === candidate.id ? 'assessed' : 'primary', acquisition: true })
  const beforeReduction = atomicRelation(source.goals)
  const expectedReachability = fullClosure(beforeReduction)
  const context = [...reachable(own, beforeReduction)].sort()
  assert.ok(!context.includes(config.excludedOldPrerequisiteId), 'Broad old body-surface endpoint leaked into the new unit demand')
  const candidateOwners = reachable(context, Object.fromEntries(parents))
  const removed: Array<[string, string]> = []
  // Every deletion is checked against the complete Mathematics atomic relation,
  // including ordinary goals outside this local unit and every existing Q/K.
  for (const id of [...candidateOwners].sort()) {
    const goal = byId.get(id)!
    for (const prerequisite of [...(goal.requires ?? [])]) {
      const previous = [...(goal.requires ?? [])]
      goal.requires = (goal.requires ?? []).filter(value => value !== prerequisite)
      if (canonicalJson(fullClosure(atomicRelation(source.goals))) === canonicalJson(expectedReachability)) removed.push([id, prerequisite])
      else goal.requires = previous
    }
  }
  const relation = atomicRelation(source.goals)
  assert.deepEqual(fullClosure(relation), expectedReachability, 'Local minimality reduction changed transitive demand')
  const originalReachability = fullClosure(atomicRelation(original.goals))
  for (const id of Object.keys(originalReachability)) assert.deepEqual([...reachable(relation[id], relation)].sort(), originalReachability[id],
    `Adding an assessment changed an original target prerequisite obligation: ${id}`)
  for (const id of config.ownOrdinaryGoalIds as string[]) assert.deepEqual(goalMeaning(byId.get(id)!), goalMeaning(originalById.get(id)!), 'An original ordinary goal meaning changed')
  const ownContext = [...reachable(own, relation)].sort()
  const atomicPrerequisites = Object.fromEntries(ownContext.map(id => [id, relation[id]]))
  for (const [id, dependencies] of Object.entries(atomicPrerequisites)) for (const prerequisite of dependencies) {
    assert.ok(!reachable(dependencies.filter(value => value !== prerequisite), atomicPrerequisites).has(prerequisite), `Unresolved effective redundant edge ${id} -> ${prerequisite}`)
  }
  const inventory = parse('docs/dev/learning-units-mathematics-offering-inventory.json')
  const membership = new Map<string, number[]>(inventory.targetAtomicMembership.map((entry: { goalId: string; scopeIndices: number[] }) => [entry.goalId, entry.scopeIndices]))
  assert.deepEqual(membership.get(config.ownOrdinaryGoalIds[0]), membership.get(config.ownOrdinaryGoalIds[1]))
  const scopeIndices = membership.get(config.ownOrdinaryGoalIds[0])!
  assert.equal(scopeIndices.length, 27)
  const referencedViews = new Set<string>()
  for (const index of scopeIndices) for (const view of inventory.scopes[index].compositionViewIds as string[]) {
    for (const id of view.startsWith('merged:') ? view.substring(7).split('+') : [view]) referencedViews.add(id)
  }
  const physicalViews = readdirSync(resolve(root, 'curricula/DE/Gymnasium/composition-views/mathematik')).filter(name => name.endsWith('.json'))
    .map(name => ({ path: `curricula/DE/Gymnasium/composition-views/mathematik/${name}`, view: parse(`curricula/DE/Gymnasium/composition-views/mathematik/${name}`) }))
    .filter(entry => referencedViews.has(entry.view.viewId)).sort((a, b) => a.view.viewId.localeCompare(b.view.viewId))
  const compositionViewDigests = Object.fromEntries(physicalViews.map(entry => [entry.view.viewId, digest(readFileSync(resolve(root, entry.path)))]))
  const artifacts = new Map<string, string>()
  const jsonBytes = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
  const setJson = (path: string, value: unknown) => artifacts.set(path, jsonBytes(value))
  const proofPath = `${qualityDirectory}/structural-proof.json`
  const ledger = JSON.parse(show(config.baselineRef, ledgerPath))
  const changedExisting = source.goals.filter(goal => originalById.has(goal.id)
    && fingerprintSemanticKindSourceGoal(goal) !== fingerprintSemanticKindSourceGoal(originalById.get(goal.id)!))
  for (const goal of changedExisting) ledger.decisions.find((entry: { goalId: string }) => entry.goalId === goal.id).sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  ledger.decisions.push({ goalId: candidate.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(candidate), semanticKind: 'practiceAssessment',
    decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' })
  ledger.decisions.sort((a: { goalId: string }, b: { goalId: string }) => a.goalId.localeCompare(b.goalId))
  ledger.counts.practiceAssessment++; ledger.counts.total++
  assert.equal(ledger.counts.curricularAtomic, 807)
  const generation = `${base}/sources/math-2026-11-05-prisms-v1`
  const snapshotPath = `${generation}.source.json`
  setJson(snapshotPath, { schemaVersion: 1, resolverRevision: 'completion-goal-kinds-v1', landscapes: [source], compositionViewDigests })
  const frozenLedgerPath = `${generation}/mathematik.semantic-kinds.json`
  setJson(frozenLedgerPath, ledger)
  for (const view of physicalViews) artifacts.set(`${generation}/views/${view.view.viewId}.view.json`, readFileSync(resolve(root, view.path), 'utf8'))
  const pair = { taskContent: candidate.examData.taskContent, solutionContent: candidate.examData.solutionContent }
  const rubric = candidate.examData.scoring
  const taskSnapshot = `${base}/inputs/${config.contractId}/${config.revision}/${candidate.id}.task.json`
  const rubricSnapshot = `${base}/inputs/${config.contractId}/${config.revision}/${candidate.id}.rubric.json`
  setJson(taskSnapshot, pair); setJson(rubricSnapshot, rubric)
  const historicalFiles = ['draft_v1.md', 'candidate.goal.json', 'review.md', 'review.receipt.json', 'author-evidence.json']
  for (const file of historicalFiles) artifacts.set(`${qualityDirectory}/pr79-history/${file}`, show(config.materialRef, `${config.oldMaterialDirectory}/${file}`))
  const taskMd = `# Prismenvolumen und Beschichtungsfläche\n\nNormale Aufgabe mit unverändertem 6/6-Bestehensvertrag. Wiederverwendeter Inhalt aus PR #79; die neue Lerneinheits- und Angebotsbindung hat eigene Nachweise.\n\n## Aufgabe\n\n${pair.taskContent}\n\n## Lösung\n\n${pair.solutionContent}\n\n## Normale Bewertung\n\n${JSON.stringify(rubric, null, 2)}\n`
  artifacts.set(taskPath, taskMd)
  setJson(proofPath, { schemaVersion: 1, baselineRef: config.baselineRef, materialRef: config.materialRef,
    originalGoalIdsPreserved: original.goals.length, originalCurricularAtomicIdsPreserved: 807,
    newAssessmentGoalIds: [candidate.id], excludedBroadOldPrerequisite: config.excludedOldPrerequisiteId,
    newQRequires: candidate.requires, ordinaryOwnMeaningsUnchanged: true, originalAtomicReachabilityUnchanged: true,
    reductionRemovedAuthoredEdges: removed, reductionFullReachabilityBeforeSha256: sha(expectedReachability), reductionFullReachabilityAfterSha256: sha(fullClosure(relation)),
    oldOrdinaryFingerprintRebindings: changedExisting.map(goal => ({ goalId: goal.id, semanticKind: ledger.decisions.find((entry: { goalId: string }) => entry.goalId === goal.id).semanticKind,
      reason: goal.id === config.canonicalClusterId ? 'existing precise canonical cluster now includes its explicit assessment' : 'reachability-neutral structural update' })),
    nativeBeforeScopeIds: scopeIndices.map(index => inventory.scopes[index].scopeId), physicalViewDigests: compositionViewDigests,
    physicalViewsChanged: false, canonicalClusterId: config.canonicalClusterId, ownContextAtomicGoalIds: ownContext,
    nativeAfterStatus: 'requires a fresh 182-scope backend/API comparison after actual data generation',
    contentReviewStatus: 'historical independently reviewed exact task reused; new actual unit binding is subject to separate independent review',
    reproduction: 'cd app && npx tsx scripts/learningUnitsPrismAuthoring.ts --check' })
  const meanings = Object.fromEntries(own.map(id => [id, goalMeaning(byId.get(id)!)]))
  const definition = { schemaVersion: 1, semantics: 'global-unit-recognition-v1', contractId: config.contractId, revision: config.revision,
    sourceBinding: { landscapeId: source.landscapeId, programUnitId: config.programUnitId, placementRevision: config.placementRevision, compositionViewDigests },
    title: config.title, promise: config.promise, introduction: config.introduction,
    ownGoalIds: own, requiredChildContractRefs: [], ownAssessmentGoalIds: [candidate.id], ownRecallGoalIds: [], ownOrientationGoalIds: [],
    ownGoalMeanings: meanings, ownResolvedKinds: Object.fromEntries(own.map(id => [id, id === candidate.id ? 'assessment' : 'ordinary'])),
    ownGoalMeaningDigests: Object.fromEntries(Object.entries(meanings).map(([id, meaning]) => [id, sha(meaning)])), atomicPrerequisites,
    assessmentClaims: { [candidate.id]: { coveredGoalIds: config.ownOrdinaryGoalIds, taskRevision: sha(pair), rubricRevision: sha(rubric),
      reviewRef: 'quality/learning-units/math-right-prisms-2026-11-05/pr79-history/review.md' } }, reviewRef }
  const contractPath = `${base}/contracts/${config.contractId}/${config.revision}.json`
  setJson(contractPath, definition)
  const currentReviewPath = `curricula/DE/Gymnasium/${reviewRef}`
  assert.ok(existsSync(resolve(root, currentReviewPath)), 'Write the actual unit review package before materializing the contract')
  const inputs: Record<string, string> = {}
  for (const [path, bytes] of artifacts) if (path !== contractPath) inputs[path.substring('curricula/'.length)] = digest(bytes)
  inputs[currentReviewPath.substring('curricula/'.length)] = digest(readFileSync(resolve(root, currentReviewPath)))
  const manifest = parse(`${base}/catalog.json`)
  const entry = { path: contractPath.substring('curricula/'.length), sha256: digest(artifacts.get(contractPath)!), status: 'active',
    sourceSnapshotPath: snapshotPath.substring('curricula/'.length), inputs,
    assessmentInputs: { [candidate.id]: { taskPath: taskSnapshot.substring('curricula/'.length), rubricPath: rubricSnapshot.substring('curricula/'.length) } }, recallInputs: {} }
  const prior = manifest.contracts.findIndex((value: { path: string }) => value.path === entry.path)
  if (prior < 0) manifest.contracts.push(entry); else manifest.contracts[prior] = entry
  setJson(`${base}/catalog.json`, manifest)
  // Preserve unrelated later work while reproducing this exact source generation.
  const live = parse(mathCanonicalPath) as Landscape
  const liveById = new Map(live.goals.map(goal => [goal.id, goal]))
  if (!liveById.has(candidate.id)) live.goals.push(candidate)
  else if (prepareUnpublished && isUntracked(snapshotPath)) {
    live.goals[live.goals.findIndex(goal => goal.id === candidate.id)] = candidate
  } else assert.deepEqual(liveById.get(candidate.id), candidate, 'Do not reinterpret an existing assessment identity')
  for (const [id, prerequisite] of removed) liveById.get(id)!.requires = (liveById.get(id)!.requires ?? []).filter(value => value !== prerequisite)
  const liveCluster = liveById.get(config.canonicalClusterId)!
  if (!liveCluster.contains!.includes(candidate.id)) liveCluster.contains!.push(candidate.id)
  liveById.set(candidate.id, candidate)
  const liveDescendants = (id: string): Set<string> => {
    const goal = liveById.get(id)!; assert.ok(goal)
    return goal.contains?.length ? new Set(goal.contains.flatMap(child => [...liveDescendants(child)])) : new Set([id])
  }
  for (const id of changedAncestors) liveById.get(id)!.weight = liveDescendants(id).size
  const unit = source.programUnits.find(unit => unit.id === config.programUnitId)!
  if (!live.programUnits.some(candidate => candidate.id === unit.id)) live.programUnits.push(unit)
  for (const placement of source.goalPlacements.filter(value => value.unitId === config.programUnitId)) {
    if (!live.goalPlacements.some(value => value.goalId === placement.goalId && value.unitId === placement.unitId)) live.goalPlacements.push(placement)
  }
  setJson(mathCanonicalPath, live)
  const liveLedger = parse(ledgerPath)
  for (const goal of changedExisting) liveLedger.decisions.find((entry: { goalId: string }) => entry.goalId === goal.id).sourceFingerprint = fingerprintSemanticKindSourceGoal(liveById.get(goal.id)!)
  if (!liveLedger.decisions.some((entry: { goalId: string }) => entry.goalId === candidate.id)) {
    liveLedger.decisions.push(ledger.decisions.find((entry: { goalId: string }) => entry.goalId === candidate.id)); liveLedger.counts.practiceAssessment++; liveLedger.counts.total++
    liveLedger.decisions.sort((a: { goalId: string }, b: { goalId: string }) => a.goalId.localeCompare(b.goalId))
  }
  setJson(ledgerPath, liveLedger)
  for (const [path, bytes] of artifacts) {
    const absolute = resolve(root, path)
    const immutable = path.startsWith(`${base}/sources/`) || path.startsWith(`${base}/inputs/`) || path.startsWith(`${base}/contracts/`)
    if (check || immutable && existsSync(absolute) && !(prepareUnpublished && isUntracked(path))) assert.equal(readFileSync(absolute, 'utf8'), bytes, `Artifact drift; never overwrite a retained immutable input: ${path}`)
  }
  if (!check) for (const [path, bytes] of artifacts) {
    const absolute = resolve(root, path)
    if (existsSync(absolute) && readFileSync(absolute, 'utf8') === bytes) continue
    mkdirSync(dirname(absolute), { recursive: true }); writeFileSync(absolute, bytes)
  }
  console.log(`Prism ${check ? 'verified' : 'prepared'} Own=3/Q=1/K=0; newQ=${candidate.id}; native-before masks=27; raw views unchanged; redundant edges removed=${removed.length}`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
