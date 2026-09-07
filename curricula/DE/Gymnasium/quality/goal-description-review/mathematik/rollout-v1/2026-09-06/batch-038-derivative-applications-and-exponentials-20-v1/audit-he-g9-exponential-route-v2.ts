// Read-only B038h counter-audit: no candidate adoption or repository writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildProposal } from './emit-he-g9-exponential-scope-proposal-v1.mjs'

interface Goal {
  id: string
  requires: string[]
  contains: string[]
  [key: string]: unknown
}

const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json'
const extractionPath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/mathematik'
const orientation = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
const equations = 'd900e0a4-0c45-50dd-a37b-01f9f91a134c'
const models = 'ab720928-9dbc-53c2-a1f8-865dda92122d'
const logarithm = '3c1d6ce7-099e-4267-9ff2-3d1526209a89'
const properties = '628928a6-4f48-54dc-952d-dec0e69dc856'
const derivatives = '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'
const terminalGoalClusterIds = [
  '28b45b93-11e1-5a96-97a1-4cfee171802b',
  'c25158fc-4860-59b2-8ef0-dca355f3a8b1',
  '14b19ee4-364e-50bd-b6a3-499471356ef3',
  'f24096c6-6ca0-5c15-a2f5-7bdaec789a8d',
  '57f07e66-800c-5f7e-99ab-11dd6e520eb1',
  'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1',
]

async function main() {
  assert(process.argv.length <= 3, 'Usage: tsx audit-he-g9-exponential-route-v2.ts [repository-root]')
  const repoRoot = resolve(process.argv[2] ?? process.cwd())
  const read = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
  const fileHash = (path: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(repoRoot, path))).digest('hex')}`
  const load = (path: string) => import(pathToFileURL(resolve(repoRoot, path)).href)
  const [{ convertLearningGoal }, { validateHardDirectAtomicRoutes }, { collectCompositionProjectionRoleGoalIds }] = await Promise.all([
    load('app/src/goalTypes.ts'),
    load('app/scripts/lib/hardLearningRouteValidation.ts'),
    load('app/src/utils/authoring/compositionViewAuthoring.ts'),
  ])
  // The original emitter checks the exact ten semantic states and four source/
  // mapping slices. Reusing it does not assert that its candidate is adoptable.
  const proposal = buildProposal(repoRoot)
  const canonical = read(canonicalPath) as { goals: Goal[] }
  const currentById = new Map(canonical.goals.map(goal => [goal.id, goal]))
  const kinds = new Map(read(semanticPath).decisions.map((entry: { goalId: string, semanticKind: string }) => [entry.goalId, entry.semanticKind]))
  const ids = new Set<string>(proposal.bindings.ids)
  const isSek2 = (goal: { id: string, tags?: string[], phase?: string, themenfeld?: string }) => (
    goal.id === orientation
    || goal.tags?.includes('phase:SekII')
    || ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.phase ?? '')
    || goal.themenfeld?.includes('SEK2')
  )
  // Mirrors validateGraph's current explicit Sek-II selector and terminal set;
  // findings are restricted to the bounded B038h seven plus three goal IDs.
  const profile = {
    scopeLabel: 'B038h seven plus three, native Sek-II route selector',
    motivationAnchorGoalIds: [orientation],
    terminalGoalClusterIds,
    routeGoalSelector: isSek2,
    goalSelector: (goal: { id: string }) => ids.has(goal.id) && isSek2(goal),
  }
  const routeFindings = (goals: Goal[]) => validateHardDirectAtomicRoutes(
    goals.map(convertLearningGoal), kinds, profile,
  ).filter((finding: { goalId?: string }) => ids.has(finding.goalId ?? ''))
  const beforeFindings = routeFindings(canonical.goals)
  assert.deepEqual(beforeFindings, [], 'Current bounded Sek-II route baseline changed')
  const candidate = structuredClone(canonical)
  const candidateById = new Map(candidate.goals.map(goal => [goal.id, goal]))
  for (const change of proposal.canonicalRequiresDelta) {
    const goal = candidateById.get(change.goalId)
    assert(goal)
    goal.requires = change.after
  }
  const candidateFindings = routeFindings(candidate.goals)
  assert.deepEqual(candidateFindings.map((finding: { goalId: string }) => finding.goalId).sort(), [equations, models].sort())
  const closure = (byId: Map<string, Goal>, id: string) => {
    const seen = new Set<string>()
    const visit = (next: string) => {
      if (seen.has(next)) return
      seen.add(next)
      byId.get(next)?.requires.forEach(visit)
    }
    visit(id)
    return seen
  }
  assert(closure(currentById, properties).has(derivatives))
  assert(!closure(candidateById, properties).has(derivatives))
  const containingAncestors = new Set<string>()
  const visitParents = (id: string) => canonical.goals.filter(goal => goal.contains.includes(id)).forEach(parent => {
    if (containingAncestors.has(parent.id)) return
    containingAncestors.add(parent.id)
    visitParents(parent.id)
  })
  visitParents(properties)
  assert([...containingAncestors].every(id => currentById.get(id)?.requires.length === 0))

  const viewPaths = readdirSync(resolve(repoRoot, viewDirectory))
    .filter(name => name.endsWith('.view.json')).sort().map(name => `${viewDirectory}/${name}`)
  const relevantViews = viewPaths.flatMap(path => {
    const view = read(path)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, currentById)
    if (!roles.targetGoalIds.has(equations)) return []
    return [{
      path,
      viewId: view.viewId,
      scope: view.scope,
      fileHash: fileHash(path),
      newLogarithmRole: roles.targetGoalIds.has(logarithm) ? 'target'
        : roles.prerequisiteOnlyGoalIds.has(logarithm) ? 'prerequisiteOnly' : 'absent',
    }]
  })
  assert.equal(relevantViews.length, 81, 'Changed current d900 target-view inventory')
  assert.equal(relevantViews.filter(view => view.newLogarithmRole === 'absent').length, 44)
  assert.equal(relevantViews.filter(view => view.newLogarithmRole === 'prerequisiteOnly').length, 0)
  const mapping = read(mappingPath)
  const fourthLineParameterEdge = mapping.mappings.find((edge: { legacyGoalId: string, canonicalGoalId: string }) => (
    edge.legacyGoalId === 'he-math-seki-g9-10-2-04-d7759617'
    && edge.canonicalGoalId === '346efb31-c400-5bd3-a698-dd9a7e1bc3f7'
  ))
  assert.equal(fourthLineParameterEdge.matchType, 'exact')

  // A separate, narrower candidate uses existing lower-secondary goals rather
  // than exporting their prerequisites into forty-four upper-secondary views.
  // This is a semantic alternative, not an adoption of the original proposal.
  const cluster = currentById.get('48e7615d-3e6e-4b5c-9df3-310e510f91f0')!
  const growth = '781f133a-08bb-54b9-8fda-efa2f8f9b12c'
  const parameters = '346efb31-c400-5bd3-a698-dd9a7e1bc3f7'
  const inverse = 'c15fe32d-1c83-4127-b1a4-9125af3d8f5d'
  const lowerEquations = 'c088fd81-fe4f-4282-99af-ebc0d1a7d202'
  const lowerInverse = 'aed3ca99-815b-40b8-ae91-e11bf92f51da'
  const alternative = structuredClone(canonical)
  const alternativeById = new Map(alternative.goals.map(goal => [goal.id, goal]))
  const alternativeRequiresDelta = [
    { goalId: growth, after: [orientation] },
    { goalId: properties, after: [parameters, derivatives] },
    { goalId: equations, after: [growth] },
    { goalId: inverse, after: [orientation] },
  ]
  alternativeRequiresDelta.forEach(change => { alternativeById.get(change.goalId)!.requires = change.after })
  assert.deepEqual(routeFindings(alternative.goals), [])
  assert(closure(alternativeById, properties).has(derivatives))
  assert(!closure(alternativeById, equations).has(derivatives))
  const checked = new Set<string>()
  const visiting = new Set<string>()
  const visitDag = (id: string) => {
    assert(!visiting.has(id), `Alternative creates a requires cycle at ${id}`)
    if (checked.has(id)) return
    visiting.add(id)
    alternativeById.get(id)?.requires.forEach(visitDag)
    visiting.delete(id)
    checked.add(id)
  }
  alternative.goals.forEach(goal => visitDag(goal.id))

  const lowerReplacementIds = [
    '31207307-0cf9-4a56-bf14-90196dc2b3d4',
    'c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7',
    'c19d1f8f-b297-5a58-b1d4-26d811e4aff4',
    '27b63e2e-6a34-483e-8e5a-fe0f49670d1d',
    logarithm, lowerEquations, lowerInverse,
  ]
  const heG9Roles = collectCompositionProjectionRoleGoalIds(
    read(`${viewDirectory}/de-he-seki-g9.view.json`).rootNodes, currentById,
  )
  const afterHeG9Targets = new Set<string>(heG9Roles.targetGoalIds)
  cluster.contains.forEach(id => afterHeG9Targets.delete(id))
  afterHeG9Targets.add(lowerEquations)
  afterHeG9Targets.add(lowerInverse)
  const remainingRequiresRemoved = [...afterHeG9Targets].flatMap(id => (
    alternativeById.get(id)?.requires.filter(required => cluster.contains.includes(required)) ?? []
  ))
  assert.deepEqual(remainingRequiresRemoved, [])
  for (const id of lowerReplacementIds) {
    const requiredClosure = closure(currentById, id)
    assert(requiredClosure.has('65365dce-f33f-49d8-9516-42f75883aa86'))
    assert([...requiredClosure].every(required => !isSek2(convertLearningGoal(currentById.get(required)))))
    assert([...requiredClosure].every(required => afterHeG9Targets.has(required)))
  }
  const alternativeNewMissingTargets: Array<{ viewPath: string, goalId: string, requiredId: string }> = []
  for (const path of viewPaths) {
    const viewTargets = path.endsWith('/de-he-seki-g9.view.json')
      ? afterHeG9Targets
      : collectCompositionProjectionRoleGoalIds(read(path).rootNodes, currentById).targetGoalIds
    for (const change of alternativeRequiresDelta) {
      if (!viewTargets.has(change.goalId)) continue
      for (const requiredId of change.after) {
        if (currentById.get(change.goalId)!.requires.includes(requiredId)) continue
        if (!viewTargets.has(requiredId)) alternativeNewMissingTargets.push({ viewPath: path, goalId: change.goalId, requiredId })
      }
    }
  }
  assert.deepEqual(alternativeNewMissingTargets, [])
  const sourceById = new Map(read(extractionPath).sourceGoals.map((goal: { id: string }) => [goal.id, goal]))
  const atomicIds = (id: string): string[] => {
    const children = currentById.get(id)?.contains ?? []
    return children.length > 0 ? children.flatMap(atomicIds) : [id]
  }
  type Edge = { legacyGoalId: string, canonicalGoalId: string }
  const rawG9 = (edges: Edge[]) => new Set(edges
    .filter(edge => (sourceById.get(edge.legacyGoalId) as { tags: string[] } | undefined)?.tags.includes('durationModel:G9'))
    .flatMap(edge => atomicIds(edge.canonicalGoalId)))
  const alternativeEdges = mapping.mappings.filter((edge: Edge) => !(
    (edge.legacyGoalId === 'he-math-seki-g9-10-2-07-5e841891' && edge.canonicalGoalId === cluster.id)
    || (edge.legacyGoalId === 'he-math-seki-g9-10-2-04-d7759617' && edge.canonicalGoalId === parameters)
  ))
  alternativeEdges.push(
    { legacyGoalId: 'he-math-seki-g9-10-2-06-6ae4d32a', canonicalGoalId: lowerEquations },
    { legacyGoalId: 'he-math-seki-g9-10-2-07-5e841891', canonicalGoalId: lowerInverse },
  )
  const oldRaw = rawG9(mapping.mappings)
  const alternativeRaw = rawG9(alternativeEdges)
  const alternativeRawDelta = {
    removed: [...oldRaw].filter(id => !alternativeRaw.has(id)).sort(),
    added: [...alternativeRaw].filter(id => !oldRaw.has(id)).sort(),
  }
  assert.deepEqual(alternativeRawDelta.removed, [...cluster.contains].sort())
  assert.deepEqual(alternativeRawDelta.added, [lowerEquations, lowerInverse].sort())
  const lowerExam = currentById.get('af7905d0-e684-5ea3-99ac-8a045455370e')!
  const examMissingAfter = lowerExam.requires.filter(id => !afterHeG9Targets.has(id))
  assert.deepEqual(examMissingAfter, [])

  process.stdout.write(`${JSON.stringify({
    auditId: 'B038h-source-and-route-counter-audit-v2',
    status: 'READ_ONLY_COUNTER_AUDIT_NOT_ADOPTION',
    oldCandidateAdoptionReady: false,
    originalCandidateBindings: proposal.bindings,
    inputFileHashes: Object.fromEntries([
      canonicalPath, mappingPath, extractionPath, semanticPath,
      'app/scripts/generateMathDurationCompositionViews.ts',
      'app/scripts/validateGraph.ts',
      'app/scripts/lib/hardLearningRouteValidation.ts',
      'app/src/utils/authoring/compositionViewAuthoring.ts',
    ].map(path => [path, fileHash(path)])),
    checkedViewSetDigest: `sha256:${createHash('sha256').update(JSON.stringify(viewPaths.map(path => [path, fileHash(path)]))).digest('hex')}`,
    sourceScopeDelta: proposal.rawG9ProjectionDelta,
    fourthLineParameterEdge,
    currentBoundedSek2Findings: beforeFindings,
    oldCandidateBoundedSek2Findings: candidateFindings,
    derivativePrerequisiteAt628: { before: true, oldCandidate: false, inheritedContainsAlternative: false },
    equationsTargetViewCount: relevantViews.length,
    proposedLogarithmAbsentViewCount: relevantViews.filter(view => view.newLogarithmRole === 'absent').length,
    relevantViews,
    narrowerAlternative: {
      status: 'READ_ONLY_FACHLICHE_OPTION_NOT_ADOPTED',
      decisionNeeded: 'Use the existing lower-secondary exponential/logarithm corridor for HE-G9, and teach logarithm-as-inverse within the upper-secondary equations goal. The separate c15/dbc orientation projection defect is not claimed repaired.',
      canonicalRequiresDelta: alternativeRequiresDelta,
      rawG9ProjectionDelta: alternativeRawDelta,
      boundedSek2RouteFindings: routeFindings(alternative.goals),
      newMissingDirectTargetPrerequisitesAcrossCurrentViews: alternativeNewMissingTargets,
      lowerReplacementIds,
      lowerReplacementClosuresCalculusFreeAndVisible: true,
      retainedHeG9TargetsRequiringRemovedChildren: remainingRequiresRemoved,
      previouslyHiddenYear10Exam: { goalId: lowerExam.id, missingPrerequisitesAfter: examMissingAfter },
      knownUnrepairedGoals: [inverse, 'dbc13bb0-963b-49a8-a441-2183f4b64c8e'],
      nativeFullGeneratorRun: false,
      maturityAndPublicationRechecksAfterAdoption: 'required, not claimed',
    },
    sources: [
      'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf',
      'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf',
    ],
  }, null, 2)}\n`)
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
