import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  evaluateCourseLevelMappingConsistency,
  readAllGoalMappingFiles,
} from './generateCurriculumQualityStatus'

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

const temporaryMappingRoot = mkdtempSync(join(tmpdir(), 'course-level-active-discovery-'))
try {
  const validMapping = {
    ...firstReview,
    mappings: [...firstReview.mappings, ...secondReview.mappings],
  }
  const invalidMapping = {
    ...validMapping,
    mappings: [
      { legacyGoalId: sourceOne, canonicalGoalId: 'missing-active-target', matchType: 'exact' },
      ...secondReview.mappings,
    ],
  }
  const writeMapping = (relativePath: string, mapping: typeof validMapping) => {
    const path = join(temporaryMappingRoot, relativePath)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(mapping))
    return path
  }
  const activePaths = [
    'Gymnasium/mapping/region/nested/current.review.json',
    'Gymnasium/mapping/quality-assurance/current.review.json',
    'Gymnasium/mapping/quality_backup/current.review.json',
  ]
  activePaths.forEach((path) => writeMapping(path, validMapping))
  const qualityPaths = [
    'Gymnasium/quality/package/mapping/historical.review.json',
    'Gymnasium/mapping/quality/package/candidate.review.json',
    'Gymnasium/mapping/review-history/quality/nested/snapshot.review.json',
  ]
  qualityPaths.forEach((path) => writeMapping(path, invalidMapping))

  const discovered = readAllGoalMappingFiles(temporaryMappingRoot)
  assert.equal(discovered.length, activePaths.length,
    'Nested active mapping files remain current; exact quality directory segments identify retained review inputs.')
  activePaths.forEach((path) => {
    assert(discovered.some(({ file }) => file.replace(/\\/g, '/').endsWith(path)),
      `Active mapping must remain discoverable, including quality-like directory names: ${path}`)
  })
  assert.equal(evaluateCourseLevelMappingConsistency(landscape, discovered, sourceExtractions).status, 'pass',
    'Automatically discovered active mappings must satisfy the unchanged evaluator.')

  const activeBadPath = 'Gymnasium/mapping/region/new/quality.review.json'
  writeMapping(activeBadPath, invalidMapping)
  const rediscovered = readAllGoalMappingFiles(temporaryMappingRoot)
  assert.equal(rediscovered.length, activePaths.length + 1,
    'A custom discovery root must be reread; an active mapping named quality.review.json is still active.')
  assert(rediscovered.some(({ file }) => file.replace(/\\/g, '/').endsWith(activeBadPath)))
  const activeFailure = evaluateCourseLevelMappingConsistency(landscape, rediscovered, sourceExtractions)
  assert.equal(activeFailure.status, 'fail', 'A bad current target must never be hidden by discovery filtering.')
  assert.equal(activeFailure.metrics?.missingTargetGoals, 1)

  const explicitQualityFailure = evaluateCourseLevelMappingConsistency(
    landscape,
    [{ ...invalidMapping, file: join(temporaryMappingRoot, qualityPaths[0]) }],
    sourceExtractions,
  )
  assert.equal(explicitQualityFailure.status, 'fail',
    'Explicitly supplied quality evidence receives the same strict target validation as any active mapping.')
  assert.equal(explicitQualityFailure.metrics?.missingTargetGoals, 1)
} finally {
  rmSync(temporaryMappingRoot, { recursive: true, force: true })
}

console.log('Course-level mapping union, active discovery and strict failure regressions passed.')
