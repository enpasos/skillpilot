// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { CompositionStructureNode, CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { planningGoalDefinition, planningReleaseFingerprint, validatePlanningRelease, validateStudyRecommendations } from './checkUnitPlanningReleases'
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

// A new orientation claim is a separate reviewed edition. It never changes
// what the existing ordinary assessments certify.
type PlanningCredit = Parameters<typeof validatePlanningRelease>[1]
type PlanningUnit = Parameters<typeof validatePlanningRelease>[0]
type PlanningEvidence = Parameters<typeof validatePlanningRelease>[2]
const opening = { ...atom, id: 'pressure-opening', semanticKind: 'orientation' as const,
  title: 'Discover pressure', description: 'Explore why pressure is useful without a subject test' }
const recall = { ...atom, id: 'pressure-recall', semanticKind: 'memory' as const, nodeKind: 'memory' as const }
const secondRecall = { ...recall, id: 'pressure-recall-two' }
const orientedLandscape: SkillLandscape = structuredClone(landscape)
orientedLandscape.goals.push(opening, recall, secondRecall)
orientedLandscape.goalPlacements!.push(...[opening, recall, secondRecall].map(goal => ({
  unitId: owner.id, goalId: goal.id, relation: 'own' as const,
})))
const introduction = {
  de: { question: 'Warum sinkt ein Schuh im Schnee ein?', promise: 'Du lernst Kräfte auf Flächen zu beziehen.',
    scene: 'Zwei Schuhe stehen im Schnee.', imageUrl: '/assets/pressure.png', imageAlt: 'Zwei Schuhe im Schnee', topics: ['Kraft und Fläche'] },
  en: { question: 'Why does a shoe sink into snow?', promise: 'You will relate forces to areas.',
    scene: 'Two shoes stand on snow.', imageUrl: '/assets/pressure.png', imageAlt: 'Two shoes on snow', topics: ['Force and area'] },
}
const orientedCredit: PlanningCredit = { ...structuredClone(decision), goalIds: [opening.id],
  orientation: { requiredRecallGoalIds: [recall.id, secondRecall.id] }, release: { ...structuredClone(decision.release),
    revision: 'orientation-edition-one', goalDefinitions: { [opening.id]: {
      definition: planningGoalDefinition(opening), profileFingerprint: digest(introduction),
    } }, fingerprint: '' } }
const orientedUnit: PlanningUnit = { ...structuredClone(material), orientationGoalId: opening.id }
orientedUnit.assessmentContract!.planningCredits = [orientedCredit]
const orientedMaterial = { schemaVersion: 2, unit: orientedUnit, intro: introduction }
function orientationEvidence(current = orientedLandscape, documents: PlanningEvidence['materials'] = [orientedMaterial],
  credit = orientedCredit): PlanningEvidence {
  credit.release.fingerprint = planningReleaseFingerprint(orientedUnit, credit)
  return { ...evidence, landscape: current, graph: graphFor(current), materials: documents,
    approved: { [credit.release.fingerprint]: review.sha256 }, currentProfile: () => {
      throw new Error('An orientation must bind its introduction, never a subject-performance profile')
    } }
}
validatePlanningRelease(orientedUnit, orientedCredit, orientationEvidence())
validatePlanningRelease(orientedUnit, orientedCredit, orientationEvidence(orientedLandscape, [
  { ...orientedMaterial, schemaVersion: 4 },
]))
assert.notEqual(planningReleaseFingerprint(orientedUnit, orientedCredit), decision.release.fingerprint)
const historicalOrdinaryBinding = structuredClone(orientedCredit)
historicalOrdinaryBinding.release.fingerprint = decision.release.fingerprint
assert.throws(() => validatePlanningRelease(orientedUnit, historicalOrdinaryBinding,
  { ...orientationEvidence(), approved: evidence.approved }), /Planning release bytes differ/)
const reorderedRecall = structuredClone(orientedCredit)
reorderedRecall.orientation!.requiredRecallGoalIds.reverse()
assert.notEqual(planningReleaseFingerprint(orientedUnit, reorderedRecall), orientedCredit.release.fingerprint,
  'The explicit recall ordering is part of the new release bytes')

function rejectOrientation(change: (unit: PlanningUnit, credit: PlanningCredit, current: SkillLandscape,
  documents: NonNullable<PlanningEvidence['materials']>) => void, expected: RegExp) {
  const unit = structuredClone(orientedUnit)
  const credit = structuredClone(orientedCredit)
  const current = structuredClone(orientedLandscape)
  const documents = [{ ...structuredClone(orientedMaterial), unit }]
  change(unit, credit, current, documents)
  credit.release.fingerprint = planningReleaseFingerprint(unit, credit)
  assert.throws(() => validatePlanningRelease(unit, credit, { ...orientationEvidence(current, documents, credit),
    approved: { [credit.release.fingerprint]: review.sha256 } }), expected)
}
rejectOrientation((_unit, credit) => { delete (credit.orientation as Partial<NonNullable<PlanningCredit['orientation']>>).requiredRecallGoalIds }, /explicit recall/)
rejectOrientation((_unit, credit) => { credit.orientation!.requiredRecallGoalIds = [] }, /all own recall/)
rejectOrientation((_unit, credit) => { credit.orientation!.requiredRecallGoalIds.push(recall.id) }, /duplicate IDs/)
rejectOrientation((_unit, credit) => { credit.orientation!.requiredRecallGoalIds.push('foreign-card') }, /all own recall/)
rejectOrientation((unit) => { unit.orientationGoalId = 'another-opening' }, /exactly one own material/)
rejectOrientation((_unit, _credit, current) => { current.goals.find(goal => goal.id === opening.id)!.semanticKind = 'curricularAtomic' }, /own orientation atom/)
rejectOrientation((unit) => { unit.assessmentContract!.contentGoalIds.push(opening.id) }, /outside the ordinary content/)
rejectOrientation((_unit, _credit, current) => {
  current.goalPlacements!.find(row => row.goalId === opening.id)!.unitId = 'foreign-owner'
}, /Wrong orientation owner/)
rejectOrientation((_unit, _credit, current) => {
  current.goalPlacements!.push({ unitId: 'foreign-owner', goalId: recall.id, relation: 'own' })
}, /Ambiguous own/)
rejectOrientation((_unit, _credit, current) => {
  const extra = { ...structuredClone(assessment), id: 'own-assessment-two' }
  current.goals.push(extra)
  current.goalPlacements!.push({ unitId: owner.id, goalId: extra.id, relation: 'own' })
}, /all own assessments/)
rejectOrientation((_unit, _credit, _current, documents) => { documents.push(structuredClone(documents[0])) }, /exactly one own material/)
rejectOrientation((_unit, _credit, _current, documents) => { documents[0].schemaVersion = 1 }, /version 2/)
rejectOrientation((_unit, _credit, _current, documents) => { delete documents[0].intro!.en }, /exactly German and English/)
rejectOrientation((_unit, _credit, _current, documents) => {
  delete (documents[0].intro!.en as Record<string, unknown>).promise
}, /complete version 2/)
rejectOrientation((_unit, _credit, _current, documents) => {
  (documents[0].intro!.en as Record<string, unknown>).topics = []
}, /topics/)
rejectOrientation((_unit, _credit, _current, documents) => {
  (documents[0].intro!.de as Record<string, unknown>).imageUrl = 'https://example.org/image.png'
}, /local asset/)
for (const language of ['de', 'en']) {
  for (const field of ['question', 'promise', 'scene', 'imageUrl', 'imageAlt', 'topics']) {
    rejectOrientation((_unit, _credit, _current, documents) => {
      const text = documents[0].intro![language] as Record<string, unknown>
      text[field] = field === 'topics' ? ['Changed topic'] : field === 'imageUrl' ? '/assets/changed.png' : 'Changed content'
    }, /bilingual introduction differs/)
  }
}
const noCardsLandscape = structuredClone(orientedLandscape)
noCardsLandscape.goals = noCardsLandscape.goals.filter(goal => ![recall.id, secondRecall.id].includes(goal.id))
noCardsLandscape.goalPlacements = noCardsLandscape.goalPlacements!.filter(row => ![recall.id, secondRecall.id].includes(row.goalId))
const noCardsCredit = structuredClone(orientedCredit)
noCardsCredit.orientation!.requiredRecallGoalIds = []
validatePlanningRelease(orientedUnit, noCardsCredit, orientationEvidence(noCardsLandscape, [orientedMaterial], noCardsCredit))
assert.equal(planningReleaseFingerprint(material, decision), decision.release.fingerprint,
  'An optional orientation credit never rebinds existing ordinary evidence')
console.log('Orientation release tests passed for explicit complete recall sets, exact own openings, bilingual introductions, ownership and immutable ordinary releases.')

const recommendations = [{
  schemaVersion: 4,
  unit: { landscapeId: landscape.landscapeId, compositionNodeId: 'mechanics', viewIds: ['gk', 'lk'] },
  studyRecommendations: [{ beforeGoalId: atom.id, afterGoalId: assessment.id }],
}]
const section: CompositionStructureNode = { kind: 'structure', id: 'mechanics', label: 'Mechanics', children: [
  { kind: 'goalEntry', goalId: atom.id }, { kind: 'goalEntry', goalId: assessment.id },
] }
const baseView: CompositionView = { viewId: 'gk', landscapeId: landscape.landscapeId,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'GK' },
  rootNodes: [section],
}
const otherSection = structuredClone(section)
const otherView: CompositionView = { ...baseView, viewId: 'lk', scope: { ...baseView.scope, courseProfile: 'LK' },
  rootNodes: [otherSection] }
const views = new Map([[baseView.viewId, baseView], [otherView.viewId, otherView]])
const checkRecommendations = (documents: Parameters<typeof validateStudyRecommendations>[0], current = landscape) =>
  validateStudyRecommendations(documents, graphFor(current), views, prepareLandscapeEntries([current]))
checkRecommendations(recommendations)
assert.throws(() => checkRecommendations([{ ...recommendations[0], schemaVersion: 3 }]),
  /require material v4/)
assert.throws(() => checkRecommendations(recommendations, { ...landscape, goals: [atom, { ...assessment, tags: ['GK'] }] }),
  /atomic target of mechanics in lk: pressure-test/)
const recommend = (beforeGoalId: string, afterGoalId: string) => ({
  ...recommendations[0], studyRecommendations: [{ beforeGoalId, afterGoalId }],
})
assert.throws(() => checkRecommendations([recommend(assessment.id, atom.id)]),
  /conflicts with prerequisite or study order in mechanics\/gk/)
otherSection.children[1] = { kind: 'goalEntry', goalId: assessment.id, projectionRole: 'prerequisiteOnly' }
assert.throws(() => checkRecommendations(recommendations),
  /atomic target of mechanics in lk: pressure-test/)
otherSection.children[1] = { kind: 'goalEntry', goalId: assessment.id }

const transfer = { ...atom, id: 'pressure-transfer' }
for (const node of [section, otherSection]) {
  node.children.unshift({ kind: 'goalEntry', goalId: opening.id })
  node.children.push({ kind: 'goalEntry', goalId: transfer.id })
}
const extended = { ...landscape, goals: [opening, atom, assessment, transfer] }
assert.throws(() => checkRecommendations([recommend(transfer.id, atom.id)],
  { ...extended, goals: [opening, atom, assessment, { ...transfer, requires: [assessment.id] }] }),
  /conflicts with prerequisite or study order in mechanics\/gk/)
const guided = { schemaVersion: 3, unit: { ...recommendations[0].unit, orientationGoalId: opening.id, viewIds: ['lk'] },
  guidedStudyOrder: [assessment.id, transfer.id] }
const contraryToGuide = recommend(transfer.id, assessment.id)
checkRecommendations([{ ...contraryToGuide, unit: { ...contraryToGuide.unit, viewIds: ['gk'] } }, guided], extended)
assert.throws(() => checkRecommendations([contraryToGuide, guided], extended),
  /conflicts with prerequisite or study order in mechanics\/lk/)
assert.throws(() => checkRecommendations([recommend(transfer.id, atom.id), guided], extended),
  /conflicts with prerequisite or study order in mechanics\/lk/)
console.log('Study recommendation targets verified in both course views, with negative probes for old versions, excluded goals, and conflicts with prerequisites and guided study.')
