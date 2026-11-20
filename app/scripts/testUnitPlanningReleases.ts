// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { planningGoalDefinition, planningReleaseFingerprint, validatePlanningRelease } from './checkUnitPlanningReleases'
import { fingerprintCurrentCurriculumDocument as digest } from './currentCurriculumCatalog'
import { UnitGraph, assessmentReviewRevisions, validateOfferedScopes, type LearningUnitCatalog } from './lib/learningUnitContracts'

const atom = { id: 'pressure', type: 'atomic', title: 'Interpret pressure', titleEn: 'Interpret pressure',
  description: 'Infer pressure from force and area', weight: 1, tags: [], contains: [], requires: [],
  dimensionTags: { framework: 'science', demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [], phase: 'E' } } satisfies LearningGoal & { titleEn: string }
const assessment = { ...atom, id: 'pressure-test', requires: [atom.id], examData: {
  taskContent: 'Find the pressure', solutionContent: 'Use force divided by area',
  scoring: { maxPoints: 2, passingPoints: 2, steps: [{ id: 'a', points: 2, description: 'Correct calculation' }] },
  coveredGoalIds: [atom.id], reviewStatus: 'released',
} }
const revisions = assessmentReviewRevisions(assessment)
const review = { path: 'reviews/pressure.md', sha256: digest('Independent review of qualification X') }
const owner = { coverageReviews: [{ assessmentGoalId: assessment.id, goalIds: [atom.id], reference: review.path, ...revisions }], id: 'pressure-unit', kind: 'learningUnit' as const, revision: '2026-11-20-v1', label: 'Pressure' }
const landscape: SkillLandscape = { landscapeId: 'physical-sciences', title: 'Science', description: '', locale: 'en',
  goals: [atom, assessment], programUnits: [owner], goalPlacements: [atom, assessment].map(goal => ({ unitId: owner.id, goalId: goal.id, relation: 'own' })),
}
const graphFor = ({ landscapeId, goals }: SkillLandscape) => new UnitGraph([{ landscapeId, goals }])
const part = { goalId: assessment.id, material: { ...revisions, fingerprint: digest(revisions) } }
const profileFingerprint = digest('Independently interpret a new physical example')
const decision = { requiredPartIds: [assessment.id], goalIds: [atom.id], release: { schemaVersion: 1, revision: 'edition-one',
  ownerUnitId: owner.id, ownerRevision: owner.revision, viewIds: ['course-x'], review,
  goalDefinitions: { [atom.id]: { definition: planningGoalDefinition(atom), profileFingerprint } }, fingerprint: '' } }
const material = { landscapeId: landscape.landscapeId, compositionNodeId: 'mechanics', viewIds: ['course-x'],
  assessmentContract: { viewIds: ['course-x'], parts: [part], contentGoalIds: [atom.id], planningCredits: [decision] } }
decision.release.fingerprint = planningReleaseFingerprint(material, decision)
const evidence = { approved: { [decision.release.fingerprint]: review.sha256 }, landscape,
  graph: graphFor(landscape), currentProfile: () => profileFingerprint, reviewHash: () => review.sha256 }

validatePlanningRelease(material, decision, evidence)
const otherCourse = structuredClone(material)
otherCourse.viewIds.push('course-y')
otherCourse.assessmentContract.viewIds.push('course-y')
assert.equal(planningReleaseFingerprint(otherCourse, decision), decision.release.fingerprint,
  'Merely offering a different course preserves only the existing release')
const expanded = structuredClone(decision)
expanded.release.viewIds.push('course-y')
expanded.release.fingerprint = planningReleaseFingerprint(otherCourse, expanded)
assert.throws(() => validatePlanningRelease(otherCourse, expanded, evidence), /No reviewed decision/)

const otherSubject = { ...structuredClone(landscape), landscapeId: 'engineering' }
const otherMaterial = { ...material, landscapeId: otherSubject.landscapeId }
const copied = structuredClone(decision)
copied.release.fingerprint = planningReleaseFingerprint(otherMaterial, copied)
assert.throws(() => validatePlanningRelease(otherMaterial, copied, { ...evidence, landscape: otherSubject,
  graph: graphFor(otherSubject) }), /No reviewed decision/)
const ownReview = { path: 'reviews/engineering.md', sha256: digest('Reviewed engineering decision') }
otherSubject.programUnits![0].coverageReviews![0].reference = ownReview.path
copied.release.review = ownReview
copied.release.fingerprint = planningReleaseFingerprint(otherMaterial, copied)
validatePlanningRelease(otherMaterial, copied, { ...evidence, landscape: otherSubject, graph: graphFor(otherSubject),
  reviewHash: () => ownReview.sha256, approved: { [copied.release.fingerprint]: ownReview.sha256 } })
assert.notEqual(copied.release.fingerprint, decision.release.fingerprint)

function rejectChangedCatalog(change: (catalog: SkillLandscape) => void, expected: RegExp) {
  const changed = structuredClone(landscape)
  change(changed)
  assert.throws(() => validatePlanningRelease(material, decision, { ...evidence, landscape: changed,
    graph: graphFor(changed) }), expected)
}
rejectChangedCatalog(current => { current.goals[0].title += ' and derive the barometric equation' }, /Current goal/)
rejectChangedCatalog(current => { current.goals[0].examples = ['Independently derive atmospheric pressure'] }, /Current goal/)
rejectChangedCatalog(current => { current.goalPlacements![0].unitId = 'other-unit' }, /Wrong goal owner/)
rejectChangedCatalog(current => { current.goalPlacements!.pop() }, /Wrong assessment owner/)
rejectChangedCatalog(current => { current.programUnits![0].coverageReviews = [] }, /coverage review/)
rejectChangedCatalog(current => { current.programUnits![0].coverageReviews![0].reference = 'unrelated.md' }, /coverage review/)
rejectChangedCatalog(current => { current.programUnits![0].coverageReviews![0].taskRevision = 'old' }, /coverage review/)
rejectChangedCatalog(current => { current.programUnits![0].revision = '2' }, /Wrong owning unit edition/)
rejectChangedCatalog(current => { current.goals[1].examData!.taskContentEn = 'Changed assessed material' }, /Witness task/)
rejectChangedCatalog(current => { current.goals[1].examData!.scoring!.passingPoints = 1 }, /Witness task/)
rejectChangedCatalog(current => { current.goals[1].requires = [] }, /No required assessment/)
rejectChangedCatalog(current => { current.goals[1].examData!.coveredGoalIds = [] }, /No required assessment/)
assert.throws(() => validatePlanningRelease(material, decision, { ...evidence, currentProfile: () => digest('Broader demand') }), /Current goal/)
assert.throws(() => validatePlanningRelease(material, decision, { ...evidence, reviewHash: () => digest('Altered review') }), /review bytes differ/)
const additionalPart = structuredClone(material)
additionalPart.assessmentContract.parts.push({ ...part, goalId: 'separate-exam' })
assert.equal(planningReleaseFingerprint(additionalPart, decision), decision.release.fingerprint,
  'An additional assessment outside the reviewed witnesses preserves their previous meaning')
console.log('Independent planning-release tests passed for two subjects, two courses and changed definitions, materials, ownership and graph witnesses.')

// An offered assessment must belong to the same canonical learning unit to satisfy R1.
const external = { ...assessment, id: 'equivalent-external-assessment' }
const scopedGraph = new UnitGraph([{ landscapeId: landscape.landscapeId, goals: [atom, assessment, external] }])
const catalog: LearningUnitCatalog = { landscapeId: landscape.landscapeId, completeness: 'partial', units: [{
  id: owner.id, ownGoalIds: [atom.id, assessment.id], childUnitIds: [], coverageReviews: owner.coverageReviews,
}] }
function offered(assessmentId: string) {
  const targets = new Set([atom.id, assessmentId])
  return validateOfferedScopes([catalog], scopedGraph, [{ id: 'native', landscapeId: landscape.landscapeId,
    members: ['native'], targetGoalIds: targets, seedTargetGoalIds: targets }])
}
assert.deepEqual(offered(assessment.id), [])
assert.equal(offered(external.id)[0]?.code, 'LU-R1-OFFERED')
