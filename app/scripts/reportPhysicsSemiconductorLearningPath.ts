// SPDX-License-Identifier: Apache-2.0
/** Bounded K1 diagnosis, not a stage-order gate or a source/assessment approval.
 * From app/: npx tsx scripts/reportPhysicsSemiconductorLearningPath.ts
 *   [--output ../tmp/physics-semiconductor-20261115/before.json]
 *   [--compare ../tmp/physics-semiconductor-20261115/before.json] [--goal UUID]
 * Paths are relative to the working directory; --goal adds to the six K1 goals.
 */
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectCompositionProjectionRoleGoalIds,
  type CompositionView, type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { validateTransitiveMinimalityScope } from './auditTransitiveMinimality'
import { fingerprintCurrentCurriculumDocument, loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { KnowledgeContextIndex, type ContextLandscape } from './lib/knowledgeContext'
import { withVerificationInputSnapshot } from './lib/verificationInputSnapshot'

export const SEMICONDUCTOR_GOAL_IDS = [
  'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  '2084b7d4-300d-5fa0-8b8d-c480c40f853e',
  '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
  '3857891b-d328-585b-9936-85c7aff122ee',
  '3b586f2a-60e2-5019-aa08-6a47616a1f1f',
  '1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e',
] as const

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort()
const order = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0
type Stage = 'SekI' | 'SekII' | null
type GoalRef = { key: string; id: string; title: string }
export type DiagnosticView = { path: string; view: CompositionView }
type ViewOccurrence = {
  path: string[]; stage: Stage; stageEvidence: 'scope' | 'structure-label' | 'unresolved'
  referencedGoalKey: string; referenceKind: string; declaredRole: string
}

export function buildSemiconductorLearningPathReport(
  catalog: ContextLandscape[], views: DiagnosticView[], requestedGoals: readonly string[] = SEMICONDUCTOR_GOAL_IDS,
) {
  // Resolve the complete catalog, not merely paths reached by these six goals.
  // This checks references and cycles; transitive minimality remains a separate gate.
  validateTransitiveMinimalityScope(catalog, catalog.map(({ landscapeId }) => landscapeId))
  const index = new KnowledgeContextIndex(catalog)
  const { graph } = index
  const keys = sorted(requestedGoals.map((reference) => index.resolveAtomicGoal(reference)))
  const selected = new Set(keys)
  const allKeys = catalog.flatMap(({ landscapeId, goals }) => goals.map(({ id }) => `${landscapeId}:${id}`)).sort()
  const atomicKeys = allKeys.filter((key) => graph.isAtomic(key))
  const ref = (key: string): GoalRef => ({ key, id: graph.goal(key).id, title: graph.goal(key).title ?? '' })
  const refs = (values: Iterable<string>): GoalRef[] => sorted(values).map(ref)
  const goalByKey = new Map(allKeys.map((key) => [key, {
    contains: (graph.goal(key).contains ?? []).map((child) => graph.resolve(child, graph.landscapeId(key))),
  }]))
  const rootByLandscape = new Map(catalog.map(({ landscapeId, goals }) => {
    const roots = goals.filter((goal) => goal.tags?.includes('root'))
    assert.equal(roots.length, 1, `${landscapeId}: expected exactly one tagged root`)
    return [landscapeId, `${landscapeId}:${roots[0].id}`]
  }))
  const coverage = new Map<string, string[]>()
  for (const key of atomicKeys) {
    const declared = graph.goal(key).examData?.coveredGoalIds
    if (declared === undefined) continue
    assert(Array.isArray(declared), `${key}: coveredGoalIds is not an array`)
    coverage.set(key, declared.map((value: unknown) => {
      assert.equal(typeof value, 'string', `${key}: invalid coveredGoalIds reference`)
      return graph.resolve(value as string, graph.landscapeId(key))
    }))
  }
  const seenViews = new Set<string>()
  const viewRows = [...views].sort((a, b) => order(a.view.viewId, b.view.viewId)).map(({ path, view }) => {
    assert(view.viewId && !seenViews.has(view.viewId), `Missing or duplicate view ID: ${view.viewId}`)
    seenViews.add(view.viewId)
    assert(rootByLandscape.has(view.landscapeId), `Unknown view landscape: ${view.landscapeId}`)
    assert(view.scope && Array.isArray(view.rootNodes), `${view.viewId}: invalid scope or rootNodes`)
    const occurrences = new Map(keys.map((key) => [key, [] as ViewOccurrence[]]))
    const scopeStage: Stage = view.scope.stage === 'SekI' || view.scope.stage === 'SekII' ? view.scope.stage : null
    const visit = (node: CompositionViewNode, pathParts: string[], stage: Stage,
      stageEvidence: ViewOccurrence['stageEvidence']): CompositionViewNode => {
      if (node.kind === 'structure') {
        assert(typeof node.label === 'string' && node.id && Array.isArray(node.children), `${view.viewId}: invalid structure`)
        const matched = /^Sekundarstufe (II|I)(?:\s*\([^)]*\))?$/u.exec(node.label.trim())
        const labelledStage: Stage = matched ? matched[1] === 'I' ? 'SekI' : 'SekII' : null
        const nextStage = labelledStage ?? stage
        const nextEvidence = labelledStage ? 'structure-label' : stageEvidence
        return { ...node, children: node.children.map((child) => visit(child, [...pathParts, node.id], nextStage, nextEvidence)) }
      }
      assert(['goalEntry', 'canonicalSubtree', 'landscapeEntry'].includes(node.kind), `${view.viewId}: unknown node kind`)
      const role = node.kind === 'landscapeEntry' ? 'target' : node.projectionRole ?? 'target'
      assert(role === 'target' || role === 'prerequisiteOnly', `${view.viewId}: invalid projection role ${role}`)
      const referenced = node.kind === 'landscapeEntry' ? rootByLandscape.get(node.landscapeId)
        : graph.resolve(node.goalId, view.landscapeId)
      assert(referenced, `${view.viewId}: unknown landscape reference`)
      const expanded = node.kind === 'goalEntry' ? [referenced] : graph.atoms(referenced)
      for (const key of expanded) if (selected.has(key)) occurrences.get(key)!.push({
        path: pathParts, stage, stageEvidence, referencedGoalKey: referenced, referenceKind: node.kind, declaredRole: role,
      })
      return node.kind === 'landscapeEntry' ? node : { ...node, goalId: referenced }
    }
    const normalized = view.rootNodes.map((node) => visit(node, [], scopeStage, scopeStage ? 'scope' : 'unresolved'))
    const roles = collectCompositionProjectionRoleGoalIds(normalized, goalByKey, rootByLandscape)
    return { path, viewId: view.viewId, scope: view.scope, goals: keys.map((key) => ({
      key,
      effectiveRole: roles.targetGoalIds.has(key) ? 'target'
        : roles.prerequisiteOnlyGoalIds.has(key) ? 'prerequisiteOnly' : 'absent',
      occurrences: occurrences.get(key)!,
    })) }
  })
  return {
    schema: 'physics-semiconductor-learning-path-v1',
    limitations: [
      'Bounded K1 diagnostic; not the full F6/E2 stage-order gate or a curriculum quality pass.',
      'View occurrences and roles are authored declarations, not verified official source assignments.',
      'Stage is read only from an explicit single-stage scope or an exact Sekundarstufe structure label; otherwise unresolved.',
      'No applicability/course filtering, personal curriculum compilation, derived preparation placement or learner state is evaluated.',
      'Assessment coverage is a declaration, not a task/rubric review or evidence of learner mastery.',
    ],
    catalogLandscapeCount: catalog.length,
    catalogGoalCount: allKeys.length,
    viewCount: views.length,
    goals: keys.map((key) => {
      const goal = graph.goal(key)
      const direct = (goal.requires ?? []).map((required) => graph.resolve(required, graph.landscapeId(key)))
      const transitive = graph.reach(key)
      const covered = coverage.get(key) ?? []
      return {
        ...ref(key), description: goal.description ?? '', kind: graph.kind(key),
        goalDigest: fingerprintCurrentCurriculumDocument(goal),
        parentClusters: refs(graph.parentKeys(key)),
        directRequires: refs(direct), effectiveDirectRequires: refs(graph.directAtomicRequires(key)),
        transitiveRequires: refs(transitive), prerequisiteClosureCount: transitive.size,
        ordinaryKnowledgeContextCount: index.securedKeys(key).length,
        incomingDirectRequires: refs(allKeys.filter((source) => (graph.goal(source).requires ?? [])
          .some((required) => graph.resolve(required, graph.landscapeId(source)) === key))),
        declaringAssessments: refs([...coverage].filter(([, ids]) => ids.includes(key)).map(([assessment]) => assessment)),
        declaredCoveredGoals: refs(covered),
        declaredCoverageOutsidePrerequisites: refs(covered.filter((target) => !transitive.has(target))),
        views: viewRows.map(({ goals, ...row }) => ({ ...row, ...goals.find((item) => item.key === key)! })),
      }
    }),
  }
}

type PathReport = ReturnType<typeof buildSemiconductorLearningPathReport>
export function compareSemiconductorLearningPathReports(before: PathReport, after: PathReport) {
  assert.equal(before.schema, after.schema, 'Incompatible baseline schema')
  assert(Array.isArray(before.goals), 'Invalid baseline goals')
  const previous = new Map(before.goals.map((goal) => [goal.key, goal]))
  assert.equal(previous.size, before.goals.length, 'Duplicate goal in baseline')
  const current = new Map(after.goals.map((goal) => [goal.key, goal]))
  const changedGoals = after.goals.flatMap((goal) => {
    const old = previous.get(goal.key)
    if (!old) return []
    const changedFields = (Object.keys(goal) as Array<keyof typeof goal>)
      .filter((field) => JSON.stringify(old[field]) !== JSON.stringify(goal[field]))
    if (!changedFields.length) return []
    const difference = (field: 'directRequires' | 'transitiveRequires' | 'incomingDirectRequires' | 'declaringAssessments' | 'declaredCoveredGoals') => ({
      added: goal[field].filter((item) => !old[field].some(({ key }) => key === item.key)),
      removed: old[field].filter((item) => !goal[field].some(({ key }) => key === item.key)),
    })
    return [{ key: goal.key, changedFields,
      prerequisiteClosureCount: { before: old.prerequisiteClosureCount, after: goal.prerequisiteClosureCount },
      ordinaryKnowledgeContextCount: { before: old.ordinaryKnowledgeContextCount, after: goal.ordinaryKnowledgeContextCount },
      directRequires: difference('directRequires'), transitiveRequires: difference('transitiveRequires'),
      incomingDirectRequires: difference('incomingDirectRequires'), declaringAssessments: difference('declaringAssessments'),
      declaredCoveredGoals: difference('declaredCoveredGoals'),
      changedViewIds: sorted([...old.views, ...goal.views].map(({ viewId }) => viewId)).filter((id) =>
        JSON.stringify(old.views.find(({ viewId }) => viewId === id)) !== JSON.stringify(goal.views.find(({ viewId }) => viewId === id))),
    }]
  })
  return {
    addedGoalKeys: sorted([...current.keys()].filter((key) => !previous.has(key))),
    removedGoalKeys: sorted([...previous.keys()].filter((key) => !current.has(key))),
    changedGoals,
  }
}

async function main(): Promise<void> {
  let output: string | undefined, compare: string | undefined
  const goals: string[] = [...SEMICONDUCTOR_GOAL_IDS]
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    const flag = args[i]
    if (flag === '--help') {
      console.log('Usage: tsx scripts/reportPhysicsSemiconductorLearningPath.ts [--output PATH] [--compare BASELINE] [--goal UUID]')
      return
    }
    assert(['--output', '--compare', '--goal'].includes(flag), `Unknown argument: ${flag}`)
    const value = args[++i]
    assert(value && !value.startsWith('--'), `${flag} requires a value`)
    if (flag === '--output') output = value
    else if (flag === '--compare') compare = value
    else goals.push(value)
  }
  const report = await withVerificationInputSnapshot((inputs) => {
    const { entries, sources } = loadCurrentCurriculumCatalog(inputs, repoRoot)
    const directory = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/physik')
    const views = inputs.readDirectory(directory).filter((entry) => entry.isFile() && entry.name.endsWith('.view.json'))
      .map(({ name }) => {
        const path = resolve(directory, name)
        return { path: relative(repoRoot, path), view: JSON.parse(inputs.readText(path)) as CompositionView }
      }).sort((a, b) => order(a.path, b.path))
    assert(views.length > 0, 'No Physics views found')
    const result = buildSemiconductorLearningPathReport(entries.map(({ landscape }) => landscape), views, goals)
    return { ...result, inputs: {
      catalogSources: sources,
      manifestDigest: fingerprintCurrentCurriculumDocument(JSON.parse(inputs.readText(resolve(repoRoot, 'curricula/curriculum_manifest.json')))),
      viewSources: views.map(({ path, view }) => ({ path, digest: fingerprintCurrentCurriculumDocument(view) })),
    } }
  })
  const result = compare ? { ...report,
    comparison: compareSemiconductorLearningPathReports(JSON.parse(readFileSync(resolve(compare), 'utf8')) as PathReport, report),
  } : report
  const serialized = `${JSON.stringify(result, null, 2)}\n`
  if (output) { mkdirSync(dirname(resolve(output)), { recursive: true }); writeFileSync(resolve(output), serialized) }
  else process.stdout.write(serialized)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
