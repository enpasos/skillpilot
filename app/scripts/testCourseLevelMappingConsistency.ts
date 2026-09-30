import assert from 'node:assert/strict'
import type { SkillLandscape } from '../src/landscapeTypes'
import { evaluateCourseLevelMappingConsistency } from './generateCurriculumQualityStatus'

const landscapeId = 'course-level-union-fixture'
const sourcePath = 'tmp/course-level-union-fixture.source-extraction.json'
const sourceOne = 'fixture-sekii-source-one'
const sourceTwo = 'fixture-sekii-source-two'
const targetOne = 'fixture-target-one'
const targetTwo = 'fixture-target-two'
const lkOnlyTarget = 'fixture-lk-only-target'

const landscape = {
  landscapeId,
  goals: [
    { id: targetOne, title: 'First GK/LK target', tags: ['GK', 'LK'] },
    { id: targetTwo, title: 'Second GK/LK target', tags: ['GK', 'LK'] },
    { id: lkOnlyTarget, title: 'LK-only target', tags: ['LK'] },
  ],
} as unknown as SkillLandscape

const sourceExtractions = new Map([[sourcePath, {
  sourceGoals: [
    { id: sourceOne, courseLevel: 'GK_LK' },
    { id: sourceTwo, courseLevel: 'GK_LK' },
  ],
}]])

const firstReview = {
  file: 'first-partial.review.json',
  targetLandscapeId: landscapeId,
  sourceExtractionPath: sourcePath,
  mappings: [{ legacyGoalId: sourceOne, canonicalGoalId: targetOne, matchType: 'exact' }],
}
const secondReview = {
  file: 'second-partial.review.json',
  targetLandscapeId: landscapeId,
  sourceExtractionPath: sourcePath,
  mappings: [{ legacyGoalId: sourceTwo, canonicalGoalId: targetTwo, matchType: 'exact' }],
}

const evaluate = (secondMappings: typeof secondReview.mappings) => (
  evaluateCourseLevelMappingConsistency(
    landscape,
    [firstReview, { ...secondReview, mappings: secondMappings }],
    sourceExtractions,
  )
)

const complete = evaluate(secondReview.mappings)
assert.equal(complete.status, 'pass')
assert.equal(complete.metrics?.configuredMappingFiles, 2)
assert.equal(complete.metrics?.sourceGoals, 2, 'each source extraction is counted once')
assert.equal(complete.metrics?.checkedMappingEdges, 2)
assert.equal(complete.metrics?.unmappedCourseLevelSourceGoals, 0)

const missingSourceBinding = evaluate([])
assert.equal(missingSourceBinding.status, 'fail')
assert.equal(missingSourceBinding.metrics?.unmappedCourseLevelSourceGoals, 1)

const missingCanonicalTarget = evaluate([
  { legacyGoalId: sourceTwo, canonicalGoalId: 'missing-canonical-target', matchType: 'exact' },
])
assert.equal(missingCanonicalTarget.status, 'fail')
assert.equal(missingCanonicalTarget.metrics?.missingTargetGoals, 1)

const wrongCourseLevel = evaluate([
  { legacyGoalId: sourceTwo, canonicalGoalId: lkOnlyTarget, matchType: 'exact' },
])
assert.equal(wrongCourseLevel.status, 'fail')
assert.equal(wrongCourseLevel.metrics?.mismatches, 1)

console.log('Course-level mapping union and failure regressions passed.')
