import fs from 'node:fs'
import path from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-methods4-source-rubric-duplicate-targeted-author-successor-20261016-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const inputs=read(path.join(out,'INPUTS.finite-parent-and-independent-review-pins.json'))
const canonical=read(inputs.baseCanonical.path)
const candidate=read(path.join(out,'candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json'))
const byId=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
for(const p of candidate.patches)byId.set(p.goalId,p.afterWholeObject)
for(const g of candidate.newWholeGoals)byId.set(g.id,g)
const views=read(path.join(out,'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json'))
const role=(r:any,id:string)=>r.targetGoalIds.has(id)?'target':r.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'
const checks:any[]=[]
for(const v of views.safeSourceGroundedCommonCourseCAS){
 const a=collectCompositionProjectionRoleGoalIds(v.beforeWholeView.rootNodes,byId)
 const b=collectCompositionProjectionRoleGoalIds(v.afterWholeView.rootNodes,byId)
 if(role(b,v.addedGoalId)!=='target')throw new Error('New common target not targeted '+v.normalViewPath)
 const removed=[...a.targetGoalIds].filter(id=>!b.targetGoalIds.has(id))
 const added=[...b.targetGoalIds].filter(id=>!a.targetGoalIds.has(id))
 if(removed.length||added.length!==1||added[0]!==v.addedGoalId)throw new Error('Unexpected targets '+v.normalViewPath)
 checks.push({normalViewPath:v.normalViewPath,addedGoalId:v.addedGoalId,afterRole:role(b,v.addedGoalId),allOtherTargetsExactlyRetained:true,wholeCourseApproval:false})
}
const dup=read(path.join(out,'consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json'))
const old=collectCompositionProjectionRoleGoalIds(dup.viewCAS.beforeWholeObject.rootNodes,byId)
const after=collectCompositionProjectionRoleGoalIds(dup.viewCAS.afterWholeObject.rootNodes,byId)
const d=dup.historicalWholeRetiredCandidate.id,c=dup.protectedWholeSurvivorUnchanged.id
if(role(old,d)!=='target'||role(after,d)!=='absent'||role(old,c)!=='target'||role(after,c)!=='target')throw new Error('Duplicate/survivor role')
if(JSON.stringify([...old.targetGoalIds].filter(id=>id!==d).sort())!==JSON.stringify([...after.targetGoalIds].sort()))throw new Error('Other target lost with consolidation')
checks.push({normalViewPath:dup.viewCAS.normalPath,separateConditionalConsolidation:true,retiredRoleBefore:role(old,d),retiredRoleAfter:role(after,d),survivorRoleBefore:role(old,c),survivorRoleAfter:role(after,c),allOtherTargetsExactlyRetained:true})
for(const v of views.conditionalElectiveOnlyProposals){
 if(v.safeForUnconditionalReplay!==false)throw new Error('Elective boundary missing')
}
const combined=views.combinedNILKWhenBothIndependentApprovalsExist
const cr=collectCompositionProjectionRoleGoalIds(combined.afterWholeView.rootNodes,byId)
const gc=candidate.newWholeGoals[0].id
if(role(cr,gc)!=='target'||role(cr,d)!=='absent'||role(cr,c)!=='target')throw new Error('Combined NI-LK successor lost a disjoint change')
checks.push({normalViewPath:combined.normalViewPath,combinedOnlyAfterBothApprovals:true,gcRole:role(cr,gc),retiredRole:role(cr,d),survivorRole:role(cr,c),wholeBeforeAfterCompositionChecked:true})
console.log(JSON.stringify({status:'PASS',scope:'Existing repository role compiler on four common-course proposals and separate duplicate consolidation only',checks,conditionalElectiveSelectionNotProven:3,backendOrRuntimeAcceptance:false,independentScienceVotes:0,humanApproval:false,humanTrial:false}))
