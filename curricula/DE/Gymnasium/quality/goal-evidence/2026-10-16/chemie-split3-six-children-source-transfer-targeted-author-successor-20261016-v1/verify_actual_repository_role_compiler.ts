import fs from 'node:fs'
import path from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const out = path.join(base, 'chemie-split3-six-children-source-transfer-targeted-author-successor-20261016-v1')
const old = path.join(base, 'chemie-seven-source-atomicity-whole-author-successor-20261016-v1/split-three')
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const inputs = read(path.join(out, 'INPUTS.finite-author-and-FIRST-baseline-pins.json'))
const canonical = read(inputs.currentCanonical.path)
const candidate = read(path.join(out, 'GOALS3.parents-CAS-and-SIX.whole-children.current709b.author.json'))
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
for (const row of candidate.wholeParentCAS) goals.set(row.goalId, row.afterWholeObject)
for (const g of candidate.wholeNewGoals) goals.set(g.id, g)
for (const row of read(path.join(out, 'ASSESSMENT.bus-whole-CAS-and-retained-capstone-HOLD.author.json')).wholeCAS) goals.set(row.goalId, row.afterWholeObject)
const previous = read(path.join(old, 'views/WHOLE.scoped-affected-composition-view-successors.author.json'))
const next = read(path.join(out, 'VIEWS25.whole-scoped-view-CAS.retained.author.json'))
const childIds = Object.values(candidate.stableChildIds) as string[]
const role = (p: any, id: string) => p.targetGoalIds.has(id) ? 'target' : p.prerequisiteOnlyGoalIds.has(id) ? 'prerequisiteOnly' : 'absent'
const rows: any[] = []
for (let i=0;i<next.patches.length;i++) {
  const n = next.patches[i]
  const before = collectCompositionProjectionRoleGoalIds(previous.patches[i].afterWholeView.rootNodes, goals)
  const after = collectCompositionProjectionRoleGoalIds(n.afterWholeView.rootNodes, goals)
  const otherBefore = [...before.targetGoalIds].filter(x => !childIds.includes(x)).sort()
  const otherAfter = [...after.targetGoalIds].filter(x => !childIds.includes(x)).sort()
  if (JSON.stringify(otherBefore) !== JSON.stringify(otherAfter)) throw new Error(`Non-child target changed in ${n.normalViewPath}`)
  const childRoles = childIds.map(id=>({goalId:id,before:role(before,id),after:role(after,id)}))
  if (n.normalViewPath.includes('de-he-')) {
    for (const id of childIds) {
      const expected = id === candidate.stableChildIds.oil ? 'target' : 'prerequisiteOnly'
      if (role(after,id) !== expected) throw new Error(`Unexpected HE-GK child role ${id}`)
    }
  }
  rows.push({normalViewPath:n.normalViewPath,scope:n.afterWholeView.scope,childRoles,
    allOtherAuthoredTargetIdsExactlyRetained:true,
    busRole:role(after,'31a630bc-ee86-5316-8ce5-e522b14fd607'),
    globalCapstoneRole:role(after,'14577339-9e0c-5b44-8e47-91e1a4947367'),
    roleCompilerExecuted:true,wholeScientificCourseApproval:false})
}
fs.writeFileSync(path.join(out, 'CHECK.actual-repository-role-compiler-25-bounded-views.json'),JSON.stringify({
  role:'Actual execution of the existing repository role compiler on finite candidate objects; no runtime code modification.',
  status:'PASS for the stated child-role/other-target-retention assertions only',rows,
  boundaries:[
    'No whole country/course source coverage or 47-course acceptance.',
    'This compiler assigns authored roles; it is not a backend learner-state/mastery execution.',
    'The complete retained global capstone remains HOLD; no indirect requirement is assumed satisfied from a role filter.',
    'Configured memory-card visibility and other legitimate assessment closure still require real isolated integration checks.',
  ],newScientificVotes:0,HumanApproval:false,HumanTrial:false,
},null,2)+'\n')
console.log(JSON.stringify({views:rows.length,status:'bounded role assertions PASS'}))
