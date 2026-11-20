// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { planningGoalDefinition, planningReleaseFingerprint, validatePlanningRelease } from './checkUnitPlanningReleases'
import { fingerprintCurrentCurriculumDocument as digest } from './currentCurriculumCatalog'
import { UnitGraph, assessmentReviewRevisions, validateOfferedScopes, type LearningUnitCatalog, type ReviewedUnitAssessmentEdition } from './lib/learningUnitContracts'

const atom = { id: 'pressure', type: 'atomic', title: 'Interpret pressure', titleEn: 'Interpret pressure',
  description: 'Infer pressure from force and area', weight: 1, tags: [], contains: [], requires: [],
  dimensionTags: { framework: 'science', demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [], phase: 'E' } } satisfies LearningGoal & { titleEn: string }
const assessment = { ...atom, id: 'pressure-test', requires: [atom.id], examData: {
  taskContent: 'Find the pressure', solutionContent: 'Use force divided by area',
  scoring: { maxPoints: 2, passingPoints: 2, steps: [{ id: 'a', points: 2, description: 'Correct calculation' }] },
  coveredGoalIds: [atom.id], reviewStatus: 'released',
} }
const owner = { id: 'pressure-unit', kind: 'learningUnit' as const, revision: '2026-11-20-v1', label: 'Pressure' }
const landscape: SkillLandscape = { landscapeId: 'physical-sciences', title: 'Science', description: '', locale: 'en',
  goals: [atom, assessment], programUnits: [owner], goalPlacements: [{ unitId: owner.id, goalId: atom.id, relation: 'own' }],
}
const graphFor = ({ landscapeId, goals }: SkillLandscape) => new UnitGraph([{ landscapeId, goals }])
const revisions = assessmentReviewRevisions(assessment)
const part = { goalId: assessment.id, material: { ...revisions, fingerprint: digest(revisions) } }
const profileFingerprint = digest('Independently interpret a new physical example')
const review = { path: 'reviews/pressure.md', sha256: digest('Independent review of qualification X') }
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

const otherSubject = { ...landscape, landscapeId: 'engineering' }
const otherMaterial = { ...material, landscapeId: otherSubject.landscapeId }
const copied = structuredClone(decision)
copied.release.fingerprint = planningReleaseFingerprint(otherMaterial, copied)
assert.throws(() => validatePlanningRelease(otherMaterial, copied, { ...evidence, landscape: otherSubject,
  graph: graphFor(otherSubject) }), /No reviewed decision/)
const ownReview = { path: 'reviews/engineering.md', sha256: digest('Reviewed engineering decision') }
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

// An offered regional qualification can replace the original owner's reviewed examination only as a whole.
const original = { ...assessment, id: 'original-test' }
const second = { ...assessment, id: 'second-test' }
const scopedGraph = new UnitGraph([{ landscapeId: landscape.landscapeId, goals: [atom, original, assessment, second] }])
const catalog: LearningUnitCatalog = { landscapeId: landscape.landscapeId, completeness: 'partial', units: [{
  id: owner.id, revision: owner.revision, ownGoalIds: [atom.id, original.id], childUnitIds: [],
  coverageReviews: [{ assessmentGoalId: original.id, goalIds: [atom.id], reference: review.path, ...revisions }],
}] }
const edition: ReviewedUnitAssessmentEdition = { landscapeId: landscape.landscapeId, ownerUnitId: owner.id,
  ownerRevision: owner.revision, requiredPartIds: [assessment.id, second.id], viewIds: ['x', 'y'], goalIds: [atom.id] }
const whole = [atom.id, assessment.id, second.id]
function missing(members: string[], offered = whole, editionOverride = edition, canonical = catalog) {
  const acquired = new Set(offered)
  return validateOfferedScopes([canonical], scopedGraph, [{ id: 'same-goal-set', landscapeId: landscape.landscapeId,
    members, viewIdByMember: new Map(members.map(view => [view, view])), targetGoalIds: acquired, seedTargetGoalIds: acquired,
  }], [editionOverride])
}
assert.deepEqual(missing(['x', 'y', 'merged:x+y']), [])
assert.match(missing(['x', 'other', 'merged:x+other'])[0].message, /in 2 configuration\(s\), e.g. other/)
for (const ids of [[atom.id, assessment.id], [atom.id, second.id], [atom.id, 'unrelated-exam']]) {
  assert.equal(missing(['x'], ids).length, 1, 'Each exact required assessment must be an offered target')
}
assert.equal(missing(['x'], whole, { ...edition, ownerRevision: 'older' }).length, 1)
assert.equal(missing(['x'], whole, { ...edition, ownerUnitId: 'another-unit' }).length, 1)
const staleSource = structuredClone(catalog)
staleSource.units[0].coverageReviews[0].rubricRevision = digest('different rubric')
assert.equal(missing(['x'], whole, edition, staleSource).length, 1)
const foreignSource = structuredClone(catalog)
foreignSource.units[0].ownGoalIds = [atom.id]
assert.equal(missing(['x'], whole, edition, foreignSource).length, 1)
assert.deepEqual(missing(['other'], [atom.id, original.id]), [], 'The original own assessment retains its scope')
console.log('Offered R1 tested for exact own editions, full witness sets and per-member single and merged views.')
