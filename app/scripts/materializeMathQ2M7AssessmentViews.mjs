import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring.ts'

const root = resolve(import.meta.dirname, '../..')
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/mathematik'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const q2PracticeId = '14b19ee4-364e-50bd-b6a3-499471356ef3'
const oldQ2ExamId = '1878f680-095c-511d-aaed-e98393f7fde9'
const lkVolumeDerivationId = 'e9181209-1506-59df-9053-17f36b91bb06'
const write = process.argv.includes('--write')
assert(process.argv.slice(2).every((arg) => arg === '--write'), 'Only --write is supported')
const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const canonical = read(canonicalPath)
const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const exams = canonical.goals.filter((goal) => goal.shortKey?.startsWith('canonical_math_sek2_q2_m7_route_'))
assert(exams.length === 12, `Expected 12 focused Q2 exams, got ${exams.length}`)

const walk = (nodes, visit) => {
  for (const node of nodes) {
    visit(node, nodes)
    if (node.children) walk(node.children, visit)
  }
}
const isQ2AssessmentContainer = (node) => (
  node.kind === 'structure'
  && ((node.id ?? '').includes('q2') && /assessment|practice|exam/u.test(node.id ?? ''))
)
const findQ2AssessmentChildren = (view) => {
  let oldExamSiblings
  let labelledQ2Children
  walk(view.rootNodes, (node, siblings) => {
    if (node.goalId === oldQ2ExamId && !oldExamSiblings) oldExamSiblings = siblings
    if (isQ2AssessmentContainer(node) && !labelledQ2Children) labelledQ2Children = node.children
  })
  return oldExamSiblings ?? labelledQ2Children ?? view.rootNodes
}
const setDirectEntryPrerequisiteOnly = (view, goalId) => {
  let foundDirect = false
  walk(view.rootNodes, (node) => {
    if (node.kind === 'goalEntry' && node.goalId === goalId) {
      node.projectionRole = 'prerequisiteOnly'
      foundDirect = true
    }
  })
  if (!foundDirect) view.rootNodes.unshift({ kind: 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' })
}

const changedViews = []
const changedCounts = { examTargetEntries: 0, examPrerequisiteOverrides: 0, lkGoalCorrections: 0 }
for (const name of readdirSync(resolve(root, viewDirectory)).filter((file) => file.endsWith('.view.json')).sort()) {
  const path = `${viewDirectory}/${name}`
  const view = read(path)
  if (view.landscapeId !== landscapeId || !['SekII', 'CrossStage'].includes(view.scope?.stage) || !['GK', 'LK'].includes(view.scope?.courseProfile)) continue
  const before = JSON.stringify(view)

  // This canonical competence is expressly LK. A GK view may retain it only
  // as prerequisiteOnly, including where a broad body subtree once inherited it.
  if (view.scope.courseProfile === 'GK') {
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
    if (roles.targetGoalIds.has(lkVolumeDerivationId)) {
      setDirectEntryPrerequisiteOnly(view, lkVolumeDerivationId)
      changedCounts.lkGoalCorrections++
    }
  }

  const rolesBeforeExams = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  for (const exam of exams) {
    const covered = exam.examData.coveredGoalIds
    const allowedCourse = exam.tags.includes(view.scope.courseProfile)
    const desiredTarget = allowedCourse && covered.every((goalId) => rolesBeforeExams.targetGoalIds.has(goalId))
    const actualTarget = rolesBeforeExams.targetGoalIds.has(exam.id)
    if (desiredTarget && !actualTarget) {
      const siblings = findQ2AssessmentChildren(view)
      assert(!siblings.some((node) => node.kind === 'goalEntry' && node.goalId === exam.id), `Duplicate target entry ${name}: ${exam.id}`)
      siblings.push({ kind: 'goalEntry', goalId: exam.id })
      changedCounts.examTargetEntries++
    } else if (!desiredTarget && actualTarget) {
      setDirectEntryPrerequisiteOnly(view, exam.id)
      changedCounts.examPrerequisiteOverrides++
    }
  }

  const rolesAfter = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  assert(view.scope.courseProfile !== 'GK' || !rolesAfter.targetGoalIds.has(lkVolumeDerivationId), `GK still targets LK volume derivation: ${name}`)
  for (const exam of exams) {
    const desired = exam.tags.includes(view.scope.courseProfile) && exam.examData.coveredGoalIds.every((id) => rolesAfter.targetGoalIds.has(id))
    assert(rolesAfter.targetGoalIds.has(exam.id) === desired, `Exam/covered target mismatch ${name}: ${exam.shortKey}`)
  }
  if (JSON.stringify(view) !== before) {
    changedViews.push(name)
    if (write) writeFileSync(resolve(root, path), JSON.stringify(view, null, 2) + '\n')
  }
}
console.log(JSON.stringify({ status: write ? 'written' : 'checked', viewCount: changedViews.length, changedCounts, changedViews }))
