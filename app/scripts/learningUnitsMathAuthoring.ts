import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

export const mathCanonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'curricula/DE/Gymnasium/learning-units'
export const canonicalJson = (value: unknown): string => JSON.stringify(value, (_key, item: unknown) => (
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, (item as Record<string, unknown>)[key]])) : item
))
export const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const objectDigest = (value: unknown) => digest(canonicalJson(value))
export interface MathGoal { id: string; title?: string; titleEn?: string; description?: string; descriptionEn?: string;
  type?: string; nodeKind?: string; semanticKind?: string; contains?: string[]; requires?: string[];
  tags?: string[]; extendedData?: Record<string, unknown>; examData?: Record<string, unknown>; [key: string]: unknown }
interface MathLandscape { landscapeId: string; programUnits: Array<Record<string, unknown>>;
  goalPlacements: Array<Record<string, unknown>>; goals: MathGoal[] }
const parse = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))

/** Independent structural proof helper, also checked against the native compiler in the repository test. */
export function atomicRelation(goals: MathGoal[]): Record<string, string[]> {
  const byId = new Map(goals.map(goal => [goal.id, goal]))
  const parents = new Map<string, string[]>()
  for (const goal of goals) for (const child of goal.contains ?? []) {
    assert.ok(byId.has(child), `Missing contains reference ${child}`)
    parents.set(child, [...(parents.get(child) ?? []), goal.id])
  }
  const descendantCache = new Map<string, string[]>()
  const descendants = (id: string, path = new Set<string>()): string[] => {
    if (descendantCache.has(id)) return descendantCache.get(id)!
    assert.ok(!path.has(id), `Contains cycle ${id}`)
    const goal = byId.get(id); assert.ok(goal, `Missing prerequisite ${id}`)
    const children = goal.contains ?? []
    const result = children.length ? [...new Set(children.flatMap(child => descendants(child, new Set([...path, id]))))].sort() : [id]
    descendantCache.set(id, result); return result
  }
  const inheritedCache = new Map<string, string[]>()
  const inherited = (id: string): string[] => {
    if (inheritedCache.has(id)) return inheritedCache.get(id)!
    const result = [...new Set([...(byId.get(id)?.requires ?? []), ...(parents.get(id) ?? []).flatMap(parent => inherited(parent))])].sort()
    inheritedCache.set(id, result); return result
  }
  for (const id of byId.keys()) descendants(id)
  return Object.fromEntries(goals.filter(goal => !(goal.contains?.length)).sort((a, b) => a.id.localeCompare(b.id)).map(goal => (
    [goal.id, [...new Set(inherited(goal.id).flatMap(id => descendants(id)))].sort()]
  )))
}

export function reachable(start: Iterable<string>, relation: Record<string, string[]>): Set<string> {
  const visited = new Set<string>(); const pending = [...start]
  while (pending.length) { const id = pending.pop()!; if (visited.has(id)) continue; visited.add(id); pending.push(...(relation[id] ?? [])) }
  return visited
}
export function fullClosure(relation: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(Object.keys(relation).sort().map(id => [id, [...reachable(relation[id], relation)].sort()]))
}
export function goalMeaning(goal: MathGoal) {
  return Object.fromEntries(['id', 'title', 'titleEn', 'description', 'descriptionEn', 'type', 'nodeKind', 'semanticKind']
    .map(key => [key, goal[key] ?? null]))
}
export const resolvedKind = (goal: MathGoal) => goal.nodeKind === 'exam' || goal.examData || ['assessment', 'practiceAssessment'].includes(goal.semanticKind ?? '')
  ? 'assessment' : goal.nodeKind === 'memory' || ['memory', 'memorization'].includes(goal.semanticKind ?? '') || goal.extendedData?.vocabularySource
    || goal.tags?.some(tag => tag.startsWith('srs-deck') || tag === 'memorization') ? 'memory'
    : goal.semanticKind === 'orientation' || !goal.semanticKind && goal.tags?.some(tag => ['orientation', 'motivation'].includes(tag)) ? 'orientation' : 'ordinary'

function main() {
  const check = process.argv.includes('--check')
  const prepareUnpublished = process.argv.includes('--prepare-unpublished')
  const isUntracked = (path: string) => !execFileSync('git', ['-c', 'core.trustctime=false', 'ls-files', '--', path], { cwd: root, encoding: 'utf8' }).trim()
  const config = parse('app/scripts/config/learning-units/math-dot-product-projection.json')
  const live = parse(mathCanonicalPath) as MathLandscape
  const original = JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${config.baselineRef}:${mathCanonicalPath}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })) as MathLandscape
  // Each published snapshot is reproduced from its exact source generation.
  // Later authoring may extend live Mathematics without rewriting this archive.
  const current = structuredClone(original)
  const beforeById = new Map(original.goals.map(goal => [goal.id, goal]))
  const byId = new Map(current.goals.map(goal => [goal.id, goal]))
  for (const [source, prerequisite] of config.removeRedundantRequires as string[][]) {
    const goal = byId.get(source); assert.ok(goal)
    assert.ok(beforeById.get(source)?.requires?.includes(prerequisite), 'Repair is not an original authored edge')
    goal.requires = (goal.requires ?? []).filter(id => id !== prerequisite)
  }
  const metadata = { contractId: config.contractId, revision: config.revision, placementRevision: config.placementRevision,
    promise: config.promise, introduction: config.introduction }
  const authoredUnit = { id: config.programUnitId, kind: 'module', label: config.title.de,
    shortLabel: 'Skalarprodukt geometrisch', parentUnitId: config.parentUnitId, learningUnit: metadata }
  const existingUnit = current.programUnits.findIndex(unit => unit.id === config.programUnitId)
  if (existingUnit < 0) current.programUnits.push(authoredUnit); else current.programUnits[existingUnit] = authoredUnit
  for (const id of config.ownGoalIds as string[]) {
    assert.ok(byId.has(id), `Missing own goal ${id}`)
    const placement = { goalId: id, unitId: config.programUnitId, relation: id === config.ownAssessmentGoalIds[0] ? 'assessed' : 'primary', acquisition: true }
    const existing = current.goalPlacements.findIndex(item => item.goalId === id && item.unitId === config.programUnitId)
    if (existing < 0) current.goalPlacements.push(placement); else current.goalPlacements[existing] = placement
  }
  const beforeRelation = atomicRelation(original.goals); const afterRelation = atomicRelation(current.goals)
  const beforeClosure = fullClosure(beforeRelation); const afterClosure = fullClosure(afterRelation)
  assert.deepEqual(afterClosure, beforeClosure, 'Minimality repair changed full transitive demand')
  assert.deepEqual([...byId.keys()].sort(), [...beforeById.keys()].sort(), 'S2 changed goal identities')
  for (const id of config.ownGoalIds as string[]) assert.deepEqual(byId.get(id), beforeById.get(id), 'S2 changed historical A/Q meaning or task')
  const ownContext = [...reachable(config.ownGoalIds, afterRelation)].sort()
  const atomicPrerequisites = Object.fromEntries(ownContext.map(id => [id, afterRelation[id]]))
  const frozenViewBytes = Object.fromEntries(Object.entries(config.compositionViews as Record<string, string>).map(([id, path]) => [id,
    execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${config.baselineRef}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })]))
  const compositionViewDigests = Object.fromEntries(Object.entries(frozenViewBytes).map(([id, bytes]) => [id, digest(bytes)]))
  const meanings = Object.fromEntries(config.ownGoalIds.map((id: string) => [id, goalMeaning(byId.get(id)!)]))
  const taskDir = `${base}/inputs/${config.contractId}/${config.revision}`
  const snapshotPath = `${base}/sources/math-2026-11-05-s2-v1.source.json`
  const contractPath = `${base}/contracts/${config.contractId}/${config.revision}.json`
  const minimalityPath = 'curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-05-minimality.json'
  const semanticLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
  const rebindPath = 'curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-05-semantic-rebind.json'
  const artifacts = new Map<string, unknown>()
  const rawArtifacts = new Map<string, string>()
  const assessmentInputs: Record<string, { taskPath: string; rubricPath: string }> = {}
  const claims: Record<string, unknown> = {}
  for (const id of config.ownAssessmentGoalIds as string[]) {
    const exam = byId.get(id)!.examData!
    assert.ok(exam.taskContent && exam.solutionContent && exam.scoring)
    assert.ok(!exam.taskContentEn && !exam.solutionContentEn, 'Translated normal task requires separate static review')
    const task = { taskContent: exam.taskContent, solutionContent: exam.solutionContent }
    const taskPath = `${taskDir}/${id}.task.json`; const rubricPath = `${taskDir}/${id}.rubric.json`
    artifacts.set(taskPath, task); artifacts.set(rubricPath, exam.scoring)
    assessmentInputs[id] = { taskPath: taskPath.substring('curricula/'.length), rubricPath: rubricPath.substring('curricula/'.length) }
    claims[id] = { coveredGoalIds: [config.ownGoalIds[0]], taskRevision: objectDigest(task), rubricRevision: objectDigest(exam.scoring), reviewRef: config.reviewRef }
  }
  const definition = { schemaVersion: 1, semantics: 'global-unit-recognition-v1', contractId: config.contractId,
    revision: config.revision, sourceBinding: { landscapeId: current.landscapeId, programUnitId: config.programUnitId,
      placementRevision: config.placementRevision, compositionViewDigests },
    title: config.title, promise: config.promise, introduction: config.introduction,
    ownGoalIds: config.ownGoalIds, requiredChildContractRefs: config.requiredChildContractRefs,
    ownAssessmentGoalIds: config.ownAssessmentGoalIds, ownRecallGoalIds: config.ownRecallGoalIds,
    ownOrientationGoalIds: config.ownOrientationGoalIds, ownGoalMeanings: meanings,
    ownResolvedKinds: Object.fromEntries(config.ownGoalIds.map((id: string) => [id, resolvedKind(byId.get(id)!)])),
    ownGoalMeaningDigests: Object.fromEntries(Object.entries(meanings).map(([id, meaning]) => [id, objectDigest(meaning)])),
    atomicPrerequisites, assessmentClaims: claims, reviewRef: config.reviewRef }
  const liveWithS2 = structuredClone(live)
  for (const [source, prerequisite] of config.removeRedundantRequires as string[][]) {
    const goal = liveWithS2.goals.find(goal => goal.id === source); assert.ok(goal)
    goal.requires = (goal.requires ?? []).filter(id => id !== prerequisite)
  }
  const liveUnitIndex = liveWithS2.programUnits.findIndex(unit => unit.id === config.programUnitId)
  if (liveUnitIndex < 0) liveWithS2.programUnits.push(authoredUnit)
  else assert.equal((liveWithS2.programUnits[liveUnitIndex].learningUnit as { contractId: string }).contractId, config.contractId,
    'Do not overwrite a different live acquisition unit while reproducing the S2 archive')
  for (const placement of current.goalPlacements.filter(placement => placement.unitId === config.programUnitId)) {
    const livePlacementIndex = liveWithS2.goalPlacements.findIndex(item => item.goalId === placement.goalId && item.unitId === config.programUnitId)
    if (livePlacementIndex < 0) liveWithS2.goalPlacements.push(placement); else liveWithS2.goalPlacements[livePlacementIndex] = placement
  }
  artifacts.set(mathCanonicalPath, liveWithS2)
  artifacts.set(contractPath, definition)
  artifacts.set(snapshotPath, { schemaVersion: 1, resolverRevision: 'completion-goal-kinds-v1', landscapes: [current], compositionViewDigests })
  artifacts.set(minimalityPath, { schemaVersion: 1, baselineRef: config.baselineRef,
    scope: 'all canonical Mathematics atoms, with inherited and cluster-expanded prerequisites',
    removedAuthoredEdges: config.removeRedundantRequires,
    originalGoalCount: original.goals.length, finalGoalCount: current.goals.length,
    atomicGoalCount: Object.keys(afterRelation).length,
    beforeAtomicRelationSha256: objectDigest(beforeRelation), afterAtomicRelationSha256: objectDigest(afterRelation),
    beforeFullReachabilitySha256: objectDigest(beforeClosure), afterFullReachabilitySha256: objectDigest(afterClosure),
    exactFullReachabilityEqual: true, originalOwnGoalsUnchanged: true,
    ownContextAtomicGoalIds: ownContext,
    reproduction: 'cd app && npx tsx scripts/learningUnitsMathAuthoring.ts --check' })
  const ledger = parse(semanticLedgerPath)
  const originalLedger = JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${config.baselineRef}:${semanticLedgerPath}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }))
  const frozenLedger = structuredClone(originalLedger)
  const rebound = (config.removeRedundantRequires as string[][]).map(([id]) => {
    const record = ledger.decisions.find((record: { goalId: string }) => record.goalId === id)
    const previous = originalLedger.decisions.find((record: { goalId: string }) => record.goalId === id)
    assert.equal(record.semanticKind, previous.semanticKind)
    assert.equal(record.decisionBasis, previous.decisionBasis)
    assert.equal(record.decisionStatus, previous.decisionStatus)
    record.sourceFingerprint = fingerprintSemanticKindSourceGoal(byId.get(id)!)
    frozenLedger.decisions.find((entry: { goalId: string }) => entry.goalId === id).sourceFingerprint = record.sourceFingerprint
    return { goalId: id, previousFingerprint: previous.sourceFingerprint, sourceFingerprint: record.sourceFingerprint,
      unchangedSemanticKind: record.semanticKind, unchangedDecisionBasis: record.decisionBasis }
  })
  artifacts.set(semanticLedgerPath, ledger)
  const frozenLedgerPath = `${base}/sources/math-2026-11-05-s2-v1/mathematik.semantic-kinds.json`
  artifacts.set(frozenLedgerPath, frozenLedger)
  for (const [viewId, bytes] of Object.entries(frozenViewBytes)) {
    rawArtifacts.set(`${base}/sources/math-2026-11-05-s2-v1/views/${viewId}.view.json`, bytes)
  }
  artifacts.set(rebindPath, { schemaVersion: 1, scope: 'three exact source fingerprints after reachability-neutral redundant-edge repair',
    baselineRef: config.baselineRef, proofPath: minimalityPath, proofSha256: objectDigest(artifacts.get(minimalityPath)),
    exactFullReachabilityEqual: true, classificationAndDecisionUnchanged: true, newQualityApproval: false, decisions: rebound })
  const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
  const inputs: Record<string, string> = {}
  for (const path of [snapshotPath, frozenLedgerPath, ...[...artifacts.keys()].filter(path => path.startsWith(taskDir)), minimalityPath, rebindPath]) {
    inputs[path.substring('curricula/'.length)] = digest(serialize(artifacts.get(path)))
  }
  for (const path of [`DE/Gymnasium/${config.reviewRef}`, config.taskSourcePath]) inputs[path] = digest(readFileSync(resolve(root, 'curricula', path)))
  for (const [path, bytes] of rawArtifacts) inputs[path.substring('curricula/'.length)] = digest(bytes)
  const priorManifest = existsSync(resolve(root, `${base}/catalog.json`)) ? parse(`${base}/catalog.json`) : { schemaVersion: 1, contracts: [] }
  const priorEntries = priorManifest.contracts
  const previousOwn = priorEntries.find((entry: { path: string }) => entry.path === contractPath.substring('curricula/'.length))
  const ownEntry = { path: contractPath.substring('curricula/'.length),
    sha256: digest(serialize(definition)), status: previousOwn?.status ?? 'active', sourceSnapshotPath: snapshotPath.substring('curricula/'.length),
    inputs, assessmentInputs, recallInputs: {} }
  const manifest = { ...priorManifest, schemaVersion: 1, contracts: previousOwn
    ? priorEntries.map((entry: { path: string }) => entry.path === ownEntry.path ? ownEntry : entry)
    : [...priorEntries, ownEntry] }
  artifacts.set(`${base}/catalog.json`, manifest)
  for (const [path, value] of artifacts) {
    const bytes = serialize(value); const absolute = resolve(root, path)
    if (check) assert.equal(readFileSync(absolute, 'utf8'), bytes, `Generated artifact drift: ${path}`)
    else {
      const immutable = path.startsWith(`${base}/contracts/`) || path.startsWith(`${base}/sources/`) || path.startsWith(`${base}/inputs/`)
      if (immutable && existsSync(absolute) && !(prepareUnpublished && isUntracked(path))) assert.equal(readFileSync(absolute, 'utf8'), bytes, `Refusing to overwrite immutable archive: ${path}`)
      else { mkdirSync(dirname(absolute), { recursive: true }); writeFileSync(absolute, bytes) }
    }
  }
  for (const [path, bytes] of rawArtifacts) {
    const absolute = resolve(root, path)
    if (check || existsSync(absolute) && !(prepareUnpublished && isUntracked(path))) assert.equal(readFileSync(absolute, 'utf8'), bytes, `Frozen view drift: ${path}`)
    else { mkdirSync(dirname(absolute), { recursive: true }); writeFileSync(absolute, bytes) }
  }
  console.log(`S2 ${check ? 'verified' : 'generated'}: ${config.contractId}@${config.revision}; Own=2/Q=1/K=0; exact full closure ${objectDigest(afterClosure)}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
