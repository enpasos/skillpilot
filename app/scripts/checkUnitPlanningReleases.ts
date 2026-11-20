// SPDX-License-Identifier: Apache-2.0
// R1–R5 for the planning effects of verified, versioned unit assessments.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectCompositionProjectionRoleGoalIds, type CompositionView, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { fingerprintCurrentCurriculumDocument as digest, loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { assessmentReviewRevisions, UnitGraph, type ReviewedUnitAssessmentEdition, type UnitGraphLandscape } from './lib/learningUnitContracts'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'
import { fingerprintPositiveGoalEvidenceProfile, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

interface Part {
  goalId: string
  material: { taskRevision: string; rubricRevision: string; fingerprint: string }
}
interface Credit {
  requiredPartIds: string[]
  goalIds: string[]
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
  assessmentContract?: { viewIds: string[]; parts: Part[]; contentGoalIds: string[]; planningCredits: Credit[] }
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
    revision, ownerUnitId, ownerRevision, viewIds: [...viewIds].sort(), review, parts, goalDefinitions })
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
    const reachable = graph.reach(key)
    for (const goalId of exam.coveredGoalIds ?? []) {
      if (reachable.has(graph.resolve(goalId, landscape.landscapeId))) covered.add(graph.resolve(goalId, landscape.landscapeId))
    }
  }
  for (const id of goalIds) {
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
}

interface ProfileConfig { landscapeId: string; scope: { goalIds: string[] }; reviewPath: string }
interface Rollout { landscapePath: string; positiveEvidenceConfigPaths: string[] }

function matchingStructures(nodes: CompositionViewNode[], id: string): CompositionViewNode[] {
  return nodes.flatMap(node => node.kind !== 'structure' ? [] : node.id === id ? [node] : matchingStructures(node.children, id))
}

function loadReleasedViews(units: MaterialUnit[]): Map<string, CompositionView> {
  const selected = new Set(units.flatMap(unit => (unit.assessmentContract?.planningCredits ?? []).flatMap(credit => credit.release.viewIds)))
  const directory = resolve(root, 'curricula/DE/Gymnasium/composition-views')
  const views = new Map<string, CompositionView>()
  if (!selected.size) return views
  for (const file of readdirSync(directory, { recursive: true, withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith('.view.json')) continue
    const view: CompositionView = JSON.parse(readFileSync(resolve(file.parentPath, file.name), 'utf8'))
    if (!selected.has(view.viewId)) continue
    assert(!views.has(view.viewId), 'Ambiguous composition view ' + view.viewId)
    views.set(view.viewId, view)
  }
  return views
}

export function checkUnitPlanningReleases(): ReviewedUnitAssessmentEdition[] {
  const inventory = readJson('curricula/unit-learning-materials.json')
  assert.equal(inventory.schemaVersion, 1)
  const units: MaterialUnit[] = inventory.materials.map((path: string) => readJson('curricula/' + path).unit)
  const views = loadReleasedViews(units)
  const { entries } = loadCurrentCurriculumCatalog(liveVerificationInputs)
  const graph = new UnitGraph(entries.map(({ landscape }) => landscape as UnitGraphLandscape))
  const rollouts: Rollout[] = readJson('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects
  const active = new Map<string, ReviewedUnitAssessmentEdition>()
  for (const unit of units) {
    const credits = unit.assessmentContract?.planningCredits ?? []
    if (!credits.length) continue
    const entry = entries.find(row => row.landscape.landscapeId === unit.landscapeId)
    assert(entry, 'No canonical source for the release owner ' + unit.landscapeId)
    const rollout = rollouts.find(row => row.landscapePath === entry.path)
    assert(rollout, 'Missing current performance evidence for ' + entry.path)
    const configs: ProfileConfig[] = rollout.positiveEvidenceConfigPaths.map(readJson)
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
        assert([...credit.requiredPartIds, ...credit.goalIds].every(id => targetGoalIds.has(id)),
          'Release requires assessments and goals outside the target unit in ' + viewId)
      }
      validatePlanningRelease(unit, credit, { landscape: entry.landscape as unknown as SkillLandscape, graph,
        approved: inventory.reviewedPlanningReleases ?? {}, currentProfile,
        reviewHash: path => 'sha256:' + createHash('sha256').update(readBytes(path)).digest('hex') })
      assert(!active.has(credit.release.fingerprint), 'Duplicate planning release')
      const { ownerUnitId, ownerRevision, viewIds } = credit.release
      active.set(credit.release.fingerprint, { landscapeId: unit.landscapeId, ownerUnitId, ownerRevision, viewIds,
        requiredPartIds: credit.requiredPartIds, goalIds: credit.goalIds })
    }
  }
  return [...active.values()]
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = checkUnitPlanningReleases().length
  console.log('Verified ' + count + ' reviewed unit planning release(s) against the current catalog.')
}
