import fs from 'node:fs'
import crypto from 'node:crypto'
import { goalMatchesFilters } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts'

const dir = '/mnt/e/skillpilot-chemie-L7-20261017/surfactants-softeners-retained-target-scope-author-v1'
const inputPath = `${dir}/REVIEW-INPUT.clean-package03-whole-content.json`
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const goals = new Map<string, any>(input.wholeCurrentOrdinaryGoalsAndRelatedContext.map((g: any) => [g.id, g]))
const seen = new Set<string>()
const stack = ['a78aacf9-92ea-5627-8776-a595111f754c']
while (stack.length) {
  const id = stack.pop()!
  if (seen.has(id)) continue
  seen.add(id)
  const goal = goals.get(id)
  if (!goal) throw Error(`Missing whole teacher context ${id}`)
  stack.push(...(goal.requires ?? []))
}
const findings = input.wholeEightUnchangedViews.map((view: any) => {
  const actualStockFilters = [view.scope.jurisdiction, view.scope.courseProfile]
  if (view.scope.stage !== 'CrossStage' || view.scope.courseProfile !== 'LK') throw Error('Unexpected stock scope')
  const rows = [...seen].sort().map((id) => {
    const goal = goals.get(id)
    return { goalId: id, title: goal.title, actualStoredApplicability: goal.applicability, tags: goal.tags,
      actualGoalMatchesFiltersResult: goalMatchesFilters(goal, actualStockFilters) }
  })
  if (rows.some((row) => !row.actualGoalMatchesFiltersResult)) throw Error(`Teacher filter failure ${view.viewId}`)
  return { viewId: view.viewId, actualStockFilters, teacherCount: rows.length, rows }
})
const hash = (path: string) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')
const output = {
  role: 'Additive bounded actual goalMatchesFilters check of existing teacher context; no compiler or acceptance gate',
  status: 'ai_candidate', humanReviewStatus: 'needs_human_review',
  cleanInput: { path: inputPath, sha256: hash(inputPath) },
  previousPackageSeal: { path: `${dir}/SEAL.author-package03.json`, sha256: hash(`${dir}/SEAL.author-package03.json`) },
  actualImplementation: { path: '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts',
    sha256: hash('/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts') },
  ownCheckSource: { path: `${dir}/CHECK.additive-existing-teachers.ts`, sha256: hash(`${dir}/CHECK.additive-existing-teachers.ts`) },
  findings, independentAcquisitionTeacherRoleGapsInThisSuppliedClosure: [],
  boundary: 'Existing whole-view target roles were checked in the sealed package. This additional check calls the actual unmodified filter function for all supplied current prerequisite goals using the unchanged stock LK+jurisdiction filters. It does not compile or validate the proposed new applicability, establish mastery, certify practical execution, or close the entire route.',
  wholePackageSealUnchanged: true, M7: false, HumanApproval: false, actualLearnerPerformance: false, nativeOrBuildInvocations: 0,
}
fs.writeFileSync(`${dir}/CHECK.additive-existing-teachers.actual-filters.json`, JSON.stringify(output, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ teacherCount: seen.size, viewCount: findings.length, checkedPairs: seen.size * findings.length, filterFailures: 0 }))
