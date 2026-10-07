import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { findReviewedSpellingIssues, reviewedSpellingCollisions } from '../../../../../../../scripts/check_curriculum_spelling.mjs'
const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const bindings = []
const observations = []
for (const subject of ['CHEMIE', 'BIOLOGIE']) {
  const path = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`
  const bytes = readFileSync(resolve(root, path))
  const landscape = JSON.parse(bytes.toString('utf8'))
  bindings.push({ path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length })
  const issues = landscape.goals.flatMap(goal => findReviewedSpellingIssues(goal).map(issue => ({ goalId: goal.id, ...issue })))
  observations.push({ subject, actualWholeGoalCount: landscape.goals.length, issues })
}
const issues = observations.flatMap(row => row.issues)
writeFileSync(resolve(own, 'actual-unchanged-spelling-collision-helper-chem-bio.receipt.json'), `${JSON.stringify({ schemaVersion: 1, documentType: 'readonly-existing-spelling-collision-function-application-to-current-chemistry-biology', helper: 'scripts/check_curriculum_spelling.mjs:findReviewedSpellingIssues', unchangedReviewedCollisionPatterns: reviewedSpellingCollisions, actualInputBindings: bindings, observations, actualIssueCount: issues.length, scopeLimit: 'Only the existing five reviewed collision prefixes; no German dictionary, no general umlaut/style/scientific review and no autocorrection', nativeCliDefaultSubjectsRemainMathPhysics: true, activeCurriculumWrites: false }, null, 2)}\n`)
console.log(JSON.stringify({ actualInvocation: 'findReviewedSpellingIssues(currentWholeGoal)', subjectCounts: observations.map(row => ({ subject: row.subject, goals: row.actualWholeGoalCount, issues: row.issues.length })), actualIssueCount: issues.length, unchangedFiveCollisionPatternsOnly: true }))
if (issues.length) process.exitCode = 1
