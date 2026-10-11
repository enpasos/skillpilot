import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import path from 'node:path'
import assert from 'node:assert/strict'
import {normalizeCanonicalLandscape} from '../src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../src/utils/authoring/compositionViewAuthoring'
import {goalMatchesFilters} from '../src/utils/goalFilters'
import {collectRenderedAtomicGoalIdsFromCompositionView} from './five-GK-production-readonly-export'
import {fingerprintGoalForPositiveEvidence} from './positiveGoalEvidenceProfileModel'
const R='/home/enpasos/projects/skillpilot'
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-five-existing-GK-tags-independent-actual-source-and-projection-review-v1'
const read=(p:string)=>JSON.parse(readFileSync(path.join(R,p),'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(path.join(R,p))).digest('hex')
const proposal=read(N+'/five-existing-LK-only-goals-source-supported-GK-tags-and-explicit-BE-role.author-proposals.json')
const before=read(N+'/whole-CAN475-additive-reviewed-Katalog-five-and-Source30-exact.author-successor-v3.json')
const after=structuredClone(before)
const byBefore=new Map(before.goals.map((g:any)=>[g.id,g]))
for (const p of proposal.proposals) {
 assert.deepEqual(p.wholeBeforeGoal,byBefore.get(p.goalId))
 const beforeWithoutTags=structuredClone(p.wholeBeforeGoal);delete beforeWithoutTags.tags
 const afterWithoutTags=structuredClone(p.wholeAfterGoalOnlyGKTag);delete afterWithoutTags.tags
 assert.deepEqual(beforeWithoutTags,afterWithoutTags)
 assert.deepEqual(p.wholeBeforeGoal.tags,['LK']);assert.deepEqual(p.wholeAfterGoalOnlyGKTag.tags,['GK','LK'])
 after.goals[after.goals.findIndex((g:any)=>g.id===p.goalId)]=structuredClone(p.wholeAfterGoalOnlyGKTag)
}
const changed=after.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(byBefore.get(g.id))).map((g:any)=>g.id)
assert.equal(changed.length,5)
const jurisdictions=['DE-BB','DE-BE','DE-BW','DE-BY','DE-HB','DE-HE','DE-HH','DE-MV','DE-NI','DE-NW','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH']
const nativeFilters=proposal.proposals.map((p:any)=>({goalId:p.goalId,courseOnly:{beforeGK:goalMatchesFilters(p.wholeBeforeGoal,['GK']),afterGK:goalMatchesFilters(p.wholeAfterGoalOnlyGKTag,['GK']),beforeLK:goalMatchesFilters(p.wholeBeforeGoal,['LK']),afterLK:goalMatchesFilters(p.wholeAfterGoalOnlyGKTag,['LK'])},jurisdictionGK:jurisdictions.map(j=>({jurisdiction:j,before:goalMatchesFilters(p.wholeBeforeGoal,['GK',j]),after:goalMatchesFilters(p.wholeAfterGoalOnlyGKTag,['GK',j])})),goalFingerprintBefore:fingerprintGoalForPositiveEvidence(p.wholeBeforeGoal),goalFingerprintAfter:fingerprintGoalForPositiveEvidence(p.wholeAfterGoalOnlyGKTag)}))
const national=[]
for(const profile of ['GK','LK']) {
 const f=`curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${profile.toLowerCase()}.view.json`
 const view=normalizeCompositionView(read(f));const compiledBefore=compileCompositionView(view,normalizeCanonicalLandscape(before));const compiledAfter=compileCompositionView(view,normalizeCanonicalLandscape(after))
 for(const js of [null,...jurisdictions]) {
  const filters=js?[profile,js]:[profile]
  const old=collectRenderedAtomicGoalIdsFromCompositionView(before,path.join(R,f),filters)
  const next=collectRenderedAtomicGoalIdsFromCompositionView(after,path.join(R,f),filters)
  national.push({profile,jurisdiction:js,filters,viewPath:f,viewSha256:sha(f),beforeCount:old.size,afterCount:next.size,added:[...next].filter(id=>!old.has(id)).sort(),removed:[...old].filter(id=>!next.has(id)).sort(),oldChangedVisible:changed.filter(id=>old.has(id)),newChangedVisible:changed.filter(id=>next.has(id)),compilerBeforeErrors:compiledBefore.findings.filter(f=>f.severity==='error'),compilerAfterErrors:compiledAfter.findings.filter(f=>f.severity==='error')})
 }
}
const ix=read(N+'/actual-full-125-source-catalog-and-108-explicit-elective-course-variants.author-index.json')
const variants=[]
for (const v of ix.variants) {
 const view=normalizeCompositionView(read(v.view.path));const ng=normalizeCanonicalLandscape(after);const by=new Map(ng.goals.map(g=>[g.id,g]));const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,by)
 const c=compileCompositionView(view,ng)
 const old=collectRenderedAtomicGoalIdsFromCompositionView(before,path.join(R,v.view.path),[v.courseProfile])
 const next=collectRenderedAtomicGoalIdsFromCompositionView(after,path.join(R,v.view.path),[v.courseProfile])
 const errors=c.findings.filter(f=>f.severity==='error')
 const ownRole=changed.map(id=>({goalId:id,target:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),beforeVisible:old.has(id),afterVisible:next.has(id),afterVisibleWithJurisdictionFilter:collectRenderedAtomicGoalIdsFromCompositionView(after,path.join(R,v.view.path),[v.courseProfile,'DE-BE']).has(id)}))
 const allOrdinaryCourseMissing=[...roles.targetGoalIds].filter(id=>!goalMatchesFilters(by.get(id) as any,[v.courseProfile]))
 const unsupportedSixthOnly=allOrdinaryCourseMissing.filter(id=>id==='bc3f895f-38d7-534b-998d-8d60fcbbb900')
 const additionalUnapproved=[...roles.targetGoalIds].filter(id=>id==='bc3f895f-38d7-534b-998d-8d60fcbbb900')
 variants.push({variantId:v.variantId,viewPath:v.view.path,viewSha256:sha(v.view.path),courseProfile:v.courseProfile,chosenYear1Modules:v.chosenYear1Modules,chosenYear2Modules:v.chosenYear2Modules,compilerErrors:errors,ownRole,allOrdinaryCourseMissing,unsupportedSixthOnly,additionalUnapprovedSixthTargets:additionalUnapproved,beforeCount:old.size,afterCount:next.size,added:[...next].filter(id=>!old.has(id)).sort(),removed:[...old].filter(id=>!next.has(id)).sort(),renderedPrerequisiteOnly:[...roles.prerequisiteOnlyGoalIds].filter(id=>next.has(id))})
}
const out={at:new Date().toISOString(),scope:'Independent actual five GK-tag metadata and existing native projection probes; no full source125/native course approval.',proposalSha256:sha(N+'/five-existing-LK-only-goals-source-supported-GK-tags-and-explicit-BE-role.author-proposals.json'),whole475BeforeSha256:sha(N+'/whole-CAN475-additive-reviewed-Katalog-five-and-Source30-exact.author-successor-v3.json'),onlyFiveTagsChanged:true,wholeOther470GoalsExact:true,allExistingDescriptionsRequiresSourceImageMemoryFieldsExact:true,changedIds:changed,nativeFilters,national,variants,variantCount:variants.length,variantCompilerErrors:variants.reduce((n,v)=>n+v.compilerErrors.length,0),sixthProposalNotApplied:true,notAnIndependentSource125PerformanceRereview:true,wholeCourseApproval:false,humanApproval:false,strictGain:0}
writeFileSync(path.join(R,O,'actual-independent-five-only-native-course-filters-national-projections-and-explicit-BE-roles.result.json'),JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({onlyFiveChanges:changed.length,nationalGKAdd:national.find(n=>n.profile==='GK'&&n.jurisdiction===null)?.added,nationalLKAdd:national.find(n=>n.profile==='LK'&&n.jurisdiction===null)?.added,variantCount:variants.length,compilerErrors:out.variantCompilerErrors,sixthOnlyMissing:variants.filter(v=>v.allOrdinaryCourseMissing.length).map(v=>({variant:v.variantId,missing:v.allOrdinaryCourseMissing})),fiveRoleSummary:changed.map(id=>({id,GKtargetVariants:variants.filter(v=>v.courseProfile==='GK'&&v.ownRole.find(r=>r.goalId===id)?.target).length,GKvisibleVariants:variants.filter(v=>v.courseProfile==='GK'&&v.ownRole.find(r=>r.goalId===id)?.afterVisible).length}))}))
assert.equal(out.variantCompilerErrors,0)
