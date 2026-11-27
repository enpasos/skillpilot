// SPDX-License-Identifier: Apache-2.0
// R1–R5 for the planning effects of verified, versioned unit assessments.
import { assertSupportedCompositionViewFormat } from '../src/utils/legacyCurriculumFormats'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectCompositionProjectionRoleGoalIds, type CompositionView, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import type { UiGoal } from '../src/goalTypes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { fingerprintCurrentCurriculumDocument as digest, loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { assessmentReviewRevisions, UnitGraph, type UnitGraphLandscape } from './lib/learningUnitContracts'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'
import { hasGuidedUnitIntroduction, validateUnitMaterialOrientations } from './lib/unitMaterialOrientationValidation'
import { fingerprintPositiveGoalEvidenceProfile, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

interface Part {
  goalId: string
  material: { taskRevision: string; rubricRevision: string; fingerprint: string }
}
interface Credit {
  requiredPartIds: string[]
  goalIds: string[]
  orientation?: { requiredRecallGoalIds: string[] }
  release: {
    schemaVersion: number
    revision: string
    ownerUnitId: string
    ownerRevision: string
    viewIds: string[]
    review: { path: string; sha256: string }
    goalDefinitions: Record<string, { definition: string; profileFingerprint: string }>
    fingerprint: string
  }
}
interface MaterialUnit {
  landscapeId: string
  compositionNodeId: string
  viewIds: string[]
  orientationGoalId?: string
  sectionAssessmentPolicy?: { unitContractRevision: string; requiredPartsFingerprint: string; voluntaryAssessmentGoalIds: string[];
    additionalVoluntaryAssessmentGoalIdsByView?: Record<string, string[]> }
  assessmentContract?: { revision?: string; viewIds: string[]; parts: Part[]; contentGoalIds: string[]; planningCredits: Credit[] }
}
interface MaterialDocument {
  schemaVersion?: number
  unit: MaterialUnit
  intro?: Record<string, unknown>
  exercises?: { goalId: string }[]
  individualAssessmentOffers?: { targetGoalId: string; assessmentGoalId: string }[]
  guidedStudyOrder?: string[]
  studyRecommendations?: { beforeGoalId: string; afterGoalId: string }[]
}

const root = realpathSync(resolve(import.meta.dirname, '../..'))
const readBytes = (path: string) => {
  assert(path && !isAbsolute(path) && !path.split('/').includes('..'), 'Expected a repository-relative path')
  const source = realpathSync(resolve(root, path))
  assert(source.startsWith(root + sep), 'Release input outside the repository')
  return readFileSync(source)
}
const readJson = (path: string) => JSON.parse(readBytes(path).toString('utf8'))
const uniqueIds = (ids: string[], label: string) => {
  assert(Array.isArray(ids) && ids.length > 0 && ids.every(id => typeof id === 'string' && id.trim() === id && id),
    label + ' must contain nonempty IDs')
  assert.equal(new Set(ids).size, ids.length, label + ' contains duplicate IDs')
}

export function planningReleaseFingerprint(unit: MaterialUnit, credit: Credit): string {
  const { schemaVersion, revision, ownerUnitId, ownerRevision, viewIds, review, goalDefinitions } = credit.release
  const parts = [...credit.requiredPartIds].sort().map(id => {
    const matches = unit.assessmentContract!.parts.filter(part => part.goalId === id)
    assert.equal(matches.length, 1, 'Release requires exactly one material edition for ' + id)
    return matches[0]
  })
  return digest({ schemaVersion, landscapeId: unit.landscapeId, compositionNodeId: unit.compositionNodeId,
    revision, ownerUnitId, ownerRevision, viewIds: [...viewIds].sort(), review, parts, goalDefinitions,
    ...(credit.orientation != null && { orientation: credit.orientation }) })
}

export function planningGoalDefinition(goal: LearningGoal): string {
  const semanticKindFingerprint = fingerprintSemanticKindSourceGoal({ ...goal })
  if (!('experimentData' in goal || 'examples' in goal)) return semanticKindFingerprint
  return digest({ semanticKindFingerprint,
    ...('experimentData' in goal && { experimentData: goal.experimentData }),
    ...('examples' in goal && { examples: goal.examples }) })
}

interface ReleaseEvidence {
  landscape: SkillLandscape
  graph: UnitGraph
  approved: Record<string, string>
  currentProfile: (id: string) => string
  reviewHash: (path: string) => string
  materials?: MaterialDocument[]
}

function orientationIntroduction(unit: MaterialUnit, goalId: string, materials: MaterialDocument[] | undefined): Record<string, unknown> {
  const matches = materials?.filter(material => material.unit.landscapeId === unit.landscapeId
    && material.unit.orientationGoalId === goalId) ?? []
  assert.equal(matches.length, 1, 'Orientation credit needs exactly one own material binding')
  const material = matches[0]
  assert.equal(material.unit.compositionNodeId, unit.compositionNodeId, 'Orientation material belongs to another section')
  assert.equal(unit.orientationGoalId, goalId, 'Orientation credit must name the material opening')
  assert(hasGuidedUnitIntroduction(material.schemaVersion), 'Orientation credit requires a version 2, 3 or 4 introduction')
  const intro = material.intro
  assert(intro && typeof intro === 'object' && !Array.isArray(intro), 'Missing bilingual orientation introduction')
  assert.deepEqual(Object.keys(intro).sort(), ['de', 'en'], 'Orientation requires exactly German and English introductions')
  for (const language of ['de', 'en']) {
    const localized = intro[language]
    assert(localized && typeof localized === 'object' && !Array.isArray(localized), 'Missing orientation introduction in ' + language)
    const text = localized as Record<string, unknown>
    assert.deepEqual(Object.keys(text).sort(), ['imageAlt', 'imageUrl', 'promise', 'question', 'scene', 'topics'],
      'Orientation requires the complete version 2 introduction in ' + language)
    for (const field of ['question', 'promise', 'scene', 'imageUrl', 'imageAlt']) {
      assert(typeof text[field] === 'string' && text[field].trim(), 'Missing orientation ' + field + ' in ' + language)
    }
    assert((text.imageUrl as string).startsWith('/assets/'), 'Orientation image must be a declared local asset')
    assert(Array.isArray(text.topics) && text.topics.length > 0
      && text.topics.every(topic => typeof topic === 'string' && topic.trim())
      && new Set(text.topics).size === text.topics.length, 'Missing or repeated orientation topics in ' + language)
  }
  return intro
}

export function validatePlanningRelease(unit: MaterialUnit, credit: Credit, evidence: ReleaseEvidence): void {
  const { release, goalIds, requiredPartIds } = credit
  const contract = unit.assessmentContract!
  const { landscape, graph } = evidence
  assert.equal(landscape.landscapeId, unit.landscapeId, 'Release landscape differs from current catalog')
  assert.equal(release?.schemaVersion, 1, 'Missing or unsupported planning release')
  assert(release.revision?.trim(), 'Planning release requires a revision')
  uniqueIds(release.viewIds, 'Release views')
  uniqueIds(goalIds, 'Planning goals')
  uniqueIds(requiredPartIds, 'Required assessments')
  assert(release.viewIds.every(id => contract.viewIds.includes(id) && unit.viewIds.includes(id)),
    'Release views exceed the current contract')
  assert.deepEqual(Object.keys(release.goalDefinitions).sort(), [...goalIds].sort(), 'Incomplete goal definitions')
  assert.equal(release.review.sha256, evidence.reviewHash(release.review.path), 'Independent review bytes differ')
  const fingerprint = planningReleaseFingerprint(unit, credit)
  assert.equal(release.fingerprint, fingerprint, 'Planning release bytes differ')
  assert.equal(evidence.approved[fingerprint], release.review.sha256, 'No reviewed decision for these exact release bytes')
  const owners = landscape.programUnits?.filter(row => row.id === release.ownerUnitId && row.kind === 'learningUnit')
  assert(owners?.length === 1 && owners[0].revision === release.ownerRevision, 'Wrong owning unit edition')
  const map = new Map(landscape.goals.map(goal => [goal.id, goal]))
  const orientation = Object.hasOwn(credit, 'orientation')
  if (orientation) {
    assert(credit.orientation && typeof credit.orientation === 'object' && !Array.isArray(credit.orientation),
      'Orientation credit requires explicit recall obligations')
    const recall = credit.orientation.requiredRecallGoalIds
    assert(Array.isArray(recall), 'Orientation credit requires explicit recall obligations')
    assert.deepEqual(Object.keys(credit.orientation), ['requiredRecallGoalIds'], 'Unknown orientation credit field')
    if (recall.length) uniqueIds(recall, 'Required recall goals')
    assert.equal(goalIds.length, 1, 'Orientation credit requires exactly one opening')
    const goal = map.get(goalIds[0])
    const key = graph.resolve(goalIds[0], landscape.landscapeId)
    assert(goal && graph.isAtomic(key) && graph.kind(key) === 'orientation'
      && !contract.contentGoalIds.includes(goal.id) && !contract.parts.some(part => part.goalId === goal.id),
    'Only an own orientation atom outside the ordinary content can receive orientation evidence')
    const placements = landscape.goalPlacements?.filter(row => row.relation === 'own' && row.goalId === goal.id)
    assert.deepEqual(placements?.map(row => row.unitId), [release.ownerUnitId], 'Wrong orientation owner')
    const own = landscape.goalPlacements?.filter(row => row.relation === 'own' && row.unitId === release.ownerUnitId) ?? []
    const ownKinds = own.map(row => {
      const ownGoal = map.get(row.goalId)
      assert(ownGoal, 'Unresolved own goal in the orientation unit')
      const ownKey = graph.resolve(row.goalId, landscape.landscapeId)
      assert(graph.isAtomic(ownKey), 'Orientation unit must own atomic goals')
      const allPlacements = landscape.goalPlacements?.filter(candidate => candidate.relation === 'own' && candidate.goalId === row.goalId)
      assert.deepEqual(allPlacements?.map(candidate => candidate.unitId), [release.ownerUnitId], 'Ambiguous own orientation-unit goal')
      return { id: row.goalId, kind: graph.kind(ownKey) }
    })
    assert.deepEqual([...requiredPartIds].sort(), ownKinds.filter(row => row.kind === 'assessment').map(row => row.id).sort(),
      'Orientation credit must require all own assessments')
    assert.deepEqual([...recall].sort(), ownKinds.filter(row => row.kind === 'memory').map(row => row.id).sort(),
      'Orientation credit must require all own recall goals')
    const intro = orientationIntroduction(unit, goal.id, evidence.materials)
    assert.deepEqual(release.goalDefinitions[goal.id], {
      definition: planningGoalDefinition(goal), profileFingerprint: digest(intro),
    }, 'Current orientation goal or bilingual introduction differs')
  }
  const covered = new Set<string>()
  for (const id of requiredPartIds) {
    const goal = map.get(id)
    const exam = goal?.examData
    assert(goal && exam?.reviewStatus === 'released', 'Planning witness must be a released assessment')
    const key = graph.resolve(id, landscape.landscapeId)
    assert(graph.isAtomic(key) && graph.kind(key) === 'assessment', 'Planning witness must be atomic')
    const revisions = assessmentReviewRevisions(goal)
    const materialBinding = { ...revisions,
      ...(exam.taskContentEn != null && { taskContentEn: exam.taskContentEn }),
      ...(exam.solutionContentEn != null && { solutionContentEn: exam.solutionContentEn }) }
    assert.deepEqual(contract.parts.find(part => part.goalId === id)!.material,
      { ...revisions, fingerprint: digest(materialBinding) }, 'Witness task, rubric or language edition differs')
    const placements = landscape.goalPlacements?.filter(row => row.relation === 'own' && row.goalId === id)
    assert.deepEqual(placements?.map(row => row.unitId), [release.ownerUnitId], 'Wrong assessment owner')
    const reviews = owners[0].coverageReviews?.filter(row => row.assessmentGoalId === id)
    assert(reviews?.length === 1 && reviews[0].reference === release.review.path
      && reviews[0].taskRevision === revisions.taskRevision && reviews[0].rubricRevision === revisions.rubricRevision,
    'Missing or stale coverage review of an own assessment')
    const reachable = graph.reach(key)
    uniqueIds(reviews[0].goalIds, 'Reviewed coverage')
    for (const goalId of reviews[0].goalIds) {
      const goalKey = graph.resolve(goalId, landscape.landscapeId)
      assert(exam.coveredGoalIds?.includes(goalId) && reachable.has(goalKey), 'No required assessment both covers and requires ' + goalId)
      covered.add(goalKey)
    }
  }
  for (const id of orientation ? [] : goalIds) {
    const goal = map.get(id)
    const key = graph.resolve(id, landscape.landscapeId)
    assert(goal && graph.isAtomic(key) && graph.kind(key) === 'ordinary' && contract.contentGoalIds.includes(id),
      'Only an own ordinary atomic unit goal can receive planning evidence')
    const placements = landscape.goalPlacements?.filter(row => row.relation === 'own' && row.goalId === id)
    assert.deepEqual(placements?.map(row => row.unitId), [release.ownerUnitId], 'Wrong goal owner')
    assert(covered.has(key), 'No required assessment both covers and requires ' + id)
    assert.deepEqual(release.goalDefinitions[id], {
      definition: planningGoalDefinition(goal), profileFingerprint: evidence.currentProfile(id),
    }, 'Current goal or performance expectations differ for ' + id)
  }
  if (!orientation) assert.equal(covered.size, goalIds.length, 'Planning goal set differs from the canonical reviews')
}

interface ProfileConfig { landscapeId: string; scope: { goalIds: string[] }; reviewPath: string }
interface Rollout { landscapePath: string; positiveEvidenceConfigPaths: string[] }

function matchingStructures(nodes: CompositionViewNode[], id: string): CompositionViewNode[] {
  return nodes.flatMap(node => node.kind !== 'structure' ? [] : node.id === id ? [node] : matchingStructures(node.children, id))
}

function offeredSectionTargetAtoms(view: CompositionView, nodeId: string | null, entries: LandscapeEntry[]): Map<string, UiGoal> {
  const sectionId = `composition:${view.viewId}:structure:${nodeId}`
  const projected = applyCompositionViewProjection(entries, view)
  const owner = projected.find(entry => entry.meta.landscapeId === view.landscapeId)
  assert(owner, 'Missing projected landscape for ' + sectionId)
  const goals = new Map(projected.flatMap(entry => entry.goals.map(goal => [goal.id, goal] as const)))
  const filters = [view.scope.courseProfile, view.scope.jurisdiction, view.scope.durationModel].filter((value): value is string => !!value)
  function reachableFrom(roots: string[]): Set<string> {
    const reachable = new Set<string>()
    const pending = [...roots]
    while (pending.length) {
      const id = pending.pop()!
      if (reachable.has(id)) continue
      const goal = goals.get(id)
      assert(goal, 'Unresolved goal in ' + view.viewId + ': ' + id)
      if (!goalMatchesFilters(goal, filters)) continue
      reachable.add(id)
      pending.push(...goal.contains)
    }
    return reachable
  }
  const roots = owner.goals.filter(goal => goal.tags?.includes('root')).map(goal => goal.id)
  const viewGoals = reachableFrom(roots)
  assert(nodeId === null || viewGoals.has(sectionId), 'Unreachable section in the selected view: ' + sectionId)
  const targets = new Map<string, UiGoal>()
  for (const id of nodeId === null ? viewGoals : reachableFrom([sectionId])) {
    const goal = goals.get(id)!
    if (goal.type === 'atomic') targets.set(id, goal)
  }
  return targets
}

export function validateIndividualAssessmentOffers(materials: MaterialDocument[], graph: UnitGraph,
  views: Map<string, CompositionView>, entries: LandscapeEntry[]): void {
  const bound = new Set<string>()
  for (const material of materials) {
    if (!material.individualAssessmentOffers) continue
    const { unit, individualAssessmentOffers } = material
    assert(material.schemaVersion === 3 || material.schemaVersion === 4, 'Individual assessment offers require material v3 or v4')
    for (const viewId of unit.viewIds) {
      const view = views.get(viewId)
      assert(view?.landscapeId === unit.landscapeId, 'Missing bound view for an individual assessment')
      const ownTargets = offeredSectionTargetAtoms(view, unit.compositionNodeId, entries)
      const viewTargets = offeredSectionTargetAtoms(view, null, entries)
      for (const { targetGoalId, assessmentGoalId } of individualAssessmentOffers) {
        const target = graph.resolve(targetGoalId, unit.landscapeId)
        const assessment = graph.resolve(assessmentGoalId, unit.landscapeId)
        assert(graph.landscapeId(target) === unit.landscapeId && graph.landscapeId(assessment) === unit.landscapeId,
          'Individual assessment and exercise must belong to the same subject as the unit')
        assert(ownTargets.has(targetGoalId) && graph.isAtomic(target) && graph.kind(target) === 'ordinary'
          && material.exercises?.filter(exercise => exercise.goalId === targetGoalId).length === 1,
        'Individual assessment offers must name an ordinary exercise of the bound unit')
        const exam = viewTargets.get(assessmentGoalId)?.examData
        assert(graph.isAtomic(assessment) && graph.kind(assessment) === 'assessment' && exam?.reviewStatus === 'released',
          'Individual assessment must be a released, available assessment in the bound view')
        assert.deepEqual(exam.coveredGoalIds, [targetGoalId], 'Individual assessment must cover exactly its exercise goal')
        assert(graph.reach(assessment).has(target), 'Individual assessment must require its exercise goal')
        assert(!materials.some(other => other.unit.landscapeId === unit.landscapeId
          && other.unit.assessmentContract?.viewIds.includes(viewId)
          && other.unit.assessmentContract.parts.some(part => part.goalId === assessmentGoalId)),
        'A required unit part cannot be declared an individual assessment offer')
        const binding = JSON.stringify([unit.landscapeId, viewId, assessmentGoalId])
        assert(!bound.has(binding), 'Duplicate individual assessment offer in the bound view')
        bound.add(binding)
      }
    }
  }
}

function addStudyPredecessor(predecessors: Map<string, string[]>, before: string, after: string): void {
  const previous = predecessors.get(after) ?? []
  previous.push(before)
  predecessors.set(after, previous)
}

function reversesStudyOrder(graph: UnitGraph, additionalPredecessors: Map<string, string[]>, before: string, after: string): boolean {
  const pending = [before]
  const visited = new Set<string>()
  while (pending.length) {
    const current = pending.pop()!
    if (current === after) return true
    if (visited.has(current)) continue
    visited.add(current)
    pending.push(...graph.directAtomicRequires(current), ...(additionalPredecessors.get(current) ?? []))
  }
  return false
}

export function validateStudyRecommendations(materials: MaterialDocument[], graph: UnitGraph,
  views: Map<string, CompositionView>, entries: LandscapeEntry[]): void {
  const studyPredecessorsByView = new Map<string, Map<string, string[]>>()
  function studyPredecessors(view: CompositionView): Map<string, string[]> {
    const existing = studyPredecessorsByView.get(view.viewId)
    if (existing) return existing
    const predecessors = new Map<string, string[]>()
    for (const { unit, guidedStudyOrder } of materials) {
      if (!guidedStudyOrder?.length || unit.landscapeId !== view.landscapeId || !unit.viewIds.includes(view.viewId)) continue
      const targets = offeredSectionTargetAtoms(view, unit.compositionNodeId, entries)
      if (!unit.orientationGoalId || !targets.has(unit.orientationGoalId)) continue
      const ordered = guidedStudyOrder.filter(id => targets.has(id)).map(id => graph.resolve(id, unit.landscapeId))
      for (let index = 1; index < ordered.length; index++) {
        addStudyPredecessor(predecessors, ordered[index - 1], ordered[index])
      }
    }
    studyPredecessorsByView.set(view.viewId, predecessors)
    return predecessors
  }

  for (const material of materials) {
    if (material.studyRecommendations === undefined) continue
    const { unit, studyRecommendations } = material
    assert.equal(material.schemaVersion, 4, 'Study recommendations require material v4')
    if (studyRecommendations.length === 0) continue
    for (const viewId of unit.viewIds) {
      const view = views.get(viewId)
      assert(view?.landscapeId === unit.landscapeId, 'Missing bound view for study recommendations: ' + viewId)
      const targets = offeredSectionTargetAtoms(view, unit.compositionNodeId, entries)
      const predecessors = studyPredecessors(view)
      for (const { beforeGoalId, afterGoalId } of studyRecommendations) {
        for (const goalId of [beforeGoalId, afterGoalId]) {
          assert(targets.has(goalId),
            `Study recommendation must name an atomic target of ${unit.compositionNodeId} in ${viewId}: ${goalId}`)
        }
        const before = graph.resolve(beforeGoalId, unit.landscapeId)
        const after = graph.resolve(afterGoalId, unit.landscapeId)
        assert(!reversesStudyOrder(graph, predecessors, before, after),
          `Study recommendation conflicts with prerequisite or study order in ${unit.compositionNodeId}/${viewId}: ${beforeGoalId} before ${afterGoalId}`)
        addStudyPredecessor(predecessors, before, after)
      }
    }
  }
}

export function validateSectionAssessmentPolicy(
  unit: MaterialUnit, views: Map<string, CompositionView>, graph: UnitGraph, entries: LandscapeEntry[],
): void {
  const policy = unit.sectionAssessmentPolicy
  const contract = unit.assessmentContract
  if (!contract) {
    assert(!policy, 'Section assessment policy requires the current unit contract')
    return
  }
  assert(!policy || (contract.revision && contract.revision === policy.unitContractRevision && digest(contract.parts) === policy.requiredPartsFingerprint),
    'Section assessment policy requires the current unit contract and its exact required parts')
  const byView = policy?.additionalVoluntaryAssessmentGoalIdsByView ?? {}
  assert(Object.keys(byView).every(id => contract.viewIds.includes(id)), 'Additional voluntary assessments require a contract view')
  const partIds = contract.parts.map(part => part.goalId)
  uniqueIds(partIds, 'Unit assessment parts')
  uniqueIds(contract.viewIds, 'Unit assessment views')
  const required = new Set(partIds)
  for (const id of contract.viewIds) {
    const view = views.get(id)
    assert(unit.viewIds.includes(id) && view?.landscapeId === unit.landscapeId,
      'Section assessment policy references an unknown view or landscape')
    const nodes = matchingStructures(view.rootNodes, unit.compositionNodeId)
    assert.equal(nodes.length, 1, 'Voluntary assessments need an unambiguous unit in ' + id)
    const targetAtoms = offeredSectionTargetAtoms(view, unit.compositionNodeId, entries)
    if (Object.hasOwn(byView, id)) uniqueIds(byView[id], 'View-specific voluntary assessments')
    const optional = [...(policy?.voluntaryAssessmentGoalIds ?? []), ...(byView[id] ?? [])]
    if (optional.length) uniqueIds(optional, 'Voluntary assessments in ' + id)
    for (const goalId of optional) {
      const goal = targetAtoms.get(goalId)
      assert(goal?.examData?.reviewStatus === 'released' && !required.has(goalId),
      'Voluntary goal must be a released additional assessment within the selected unit and course: ' + id + '/' + goalId)
    }
    // The automatic section compiler counts assessments in the full prerequisite context of its target atoms.
    const sectionExams = new Set<string>()
    for (const goalId of targetAtoms.keys()) {
      const key = graph.resolve(goalId, unit.landscapeId)
      for (const candidate of [key, ...graph.reach(key)]) {
        if (graph.kind(candidate) === 'assessment') sectionExams.add(graph.goal(candidate).id)
      }
    }
    for (const goalId of optional) sectionExams.delete(goalId)
    const extra = [...sectionExams].filter(goalId => !required.has(goalId))
    const missing = [...required].filter(goalId => !sectionExams.has(goalId))
    assert(!extra.length && !missing.length,
      `Required section assessments differ from the unit parts in ${id}: extra [${extra}], missing [${missing}]`)
  }
}

function loadReleasedViews(materials: MaterialDocument[]): Map<string, CompositionView> {
  const selected = new Set(materials.flatMap(({ schemaVersion, unit }) => [
    ...(hasGuidedUnitIntroduction(schemaVersion) ? unit.viewIds : []),
    ...(unit.assessmentContract?.viewIds ?? []),
    ...(unit.assessmentContract?.planningCredits ?? []).flatMap(credit => credit.release.viewIds),
  ]))
  const directory = resolve(root, 'curricula/DE/Gymnasium/composition-views')
  const views = new Map<string, CompositionView>()
  if (!selected.size) return views
  for (const file of readdirSync(directory, { recursive: true, withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith('.view.json')) continue
    const view: CompositionView = JSON.parse(readFileSync(resolve(file.parentPath, file.name), 'utf8'))
    if (!selected.has(view.viewId)) continue
    assertSupportedCompositionViewFormat(view, resolve(file.parentPath, file.name))
    assert(!views.has(view.viewId), 'Ambiguous composition view ' + view.viewId)
    views.set(view.viewId, view)
  }
  return views
}

export function checkUnitPlanningReleases(): string[] {
  const inventory = readJson('curricula/unit-learning-materials.json')
  assert.equal(inventory.schemaVersion, 1)
  const materials: MaterialDocument[] = inventory.materials.map((path: string) => readJson('curricula/' + path))
  const units = materials.map(material => material.unit)
  const views = loadReleasedViews(materials)
  const { entries } = loadCurrentCurriculumCatalog(liveVerificationInputs)
  validateUnitMaterialOrientations(materials, entries.map(entry => entry.landscape), views)
  const graph = new UnitGraph(entries.map(({ landscape }) => landscape as UnitGraphLandscape))
  const projectionEntries = prepareLandscapeEntries(entries.map(({ landscape }) => landscape as SkillLandscape))
  validateIndividualAssessmentOffers(materials, graph, views, projectionEntries)
  validateStudyRecommendations(materials, graph, views, projectionEntries)
  const rollouts: Rollout[] = readJson('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects
  const active = new Set<string>()
  for (const unit of units) {
    const credits = unit.assessmentContract?.planningCredits ?? []
    if (!unit.assessmentContract && !unit.sectionAssessmentPolicy) continue
    const entry = entries.find(row => row.landscape.landscapeId === unit.landscapeId)
    assert(entry, 'No canonical source for the release owner ' + unit.landscapeId)
    const landscape = entry.landscape as unknown as SkillLandscape
    validateSectionAssessmentPolicy(unit, views, graph, projectionEntries)
    if (!credits.length) continue
    const rollout = rollouts.find(row => row.landscapePath === entry.path)
    assert(rollout || credits.every(credit => credit.orientation != null), 'Missing current performance evidence for ' + entry.path)
    const configs: ProfileConfig[] = rollout?.positiveEvidenceConfigPaths.map(readJson) ?? []
    const currentProfile = (id: string) => {
      const matches = configs.filter(config => config.landscapeId === unit.landscapeId && config.scope.goalIds.includes(id))
      assert.equal(matches.length, 1, 'Expected exactly one active performance profile for ' + id)
      const rows: PositiveGoalEvidenceReviewRecord[] = readBytes(matches[0].reviewPath).toString('utf8').trim()
        .split('\n').map(line => JSON.parse(line)).filter(row => row.landscapeId === unit.landscapeId && row.goalId === id)
      assert.equal(rows.length, 1, 'Missing or ambiguous evidence row for ' + id)
      assert.notEqual(rows[0].status, 'rejected', 'Rejected performance evidence for ' + id)
      const fingerprint = fingerprintPositiveGoalEvidenceProfile(rows[0].profile)
      assert.equal(rows[0].profileFingerprint, fingerprint, 'Stale performance evidence for ' + id)
      return fingerprint
    }
    const goalById = new Map(entry.landscape.goals.map(goal => [goal.id, goal]))
    for (const credit of credits) {
      for (const viewId of credit.release.viewIds) {
        const view = views.get(viewId)
        assert(view?.landscapeId === unit.landscapeId, 'Missing release view for ' + unit.landscapeId + '/' + viewId)
        const structures = matchingStructures(view.rootNodes, unit.compositionNodeId)
        assert.equal(structures.length, 1, 'Missing or ambiguous unit in release view ' + viewId)
        const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(structures, goalById)
        assert([...credit.requiredPartIds, ...credit.goalIds, ...(credit.orientation?.requiredRecallGoalIds ?? [])]
          .every(id => targetGoalIds.has(id)),
          'Release requires assessments and goals outside the target unit in ' + viewId)
      }
      validatePlanningRelease(unit, credit, { landscape, graph,
        approved: inventory.reviewedPlanningReleases ?? {}, currentProfile, materials,
        reviewHash: path => 'sha256:' + createHash('sha256').update(readBytes(path)).digest('hex') })
      assert(!active.has(credit.release.fingerprint), 'Duplicate planning release')
      active.add(credit.release.fingerprint)
    }
  }
  return [...active.values()]
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = checkUnitPlanningReleases().length
  console.log('Verified ' + count + ' reviewed unit planning release(s) against the current catalog.')
}
