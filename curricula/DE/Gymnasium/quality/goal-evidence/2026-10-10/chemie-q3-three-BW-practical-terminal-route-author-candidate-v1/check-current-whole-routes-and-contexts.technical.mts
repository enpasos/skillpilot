// SPDX-License-Identifier: Apache-2.0
// Normal scoped evaluators; temporary exports append no selector/rule changes.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),C=process.argv[process.argv.indexOf('--capsule')+1]
const read=(p:string)=>JSON.parse(readFileSync(resolve(D,p),'utf8'))
const put=(p:string,j:any)=>{mkdirSync(dirname(resolve(D,p)),{recursive:true});writeFileSync(resolve(D,p),JSON.stringify(j,null,2)+'\n')}
const before=read('inputs/whole484-active-canonical.exact.json'),after=read('candidate/whole487-381-plus-three-practical-terminals.inactive.json'),baseKind=read('inputs/whole484-381-active-semantic-kinds.exact.json'),bindings=read('inputs/actual-start-bindings.json')
const b=new Map(before.goals.map((g:any)=>[g.id,g])),a=new Map(after.goals.map((g:any)=>[g.id,g]))
assert.equal(b.size,484);assert.equal(a.size,487)
const changedOldIds=before.goals.filter((g:any)=>stableGoalBookJson(g)!==stableGoalBookJson(a.get(g.id))).map((g:any)=>g.id)
assert.deepEqual(changedOldIds,[bindings.soleChangedExistingGoalId])
const oldQ:any=b.get(bindings.soleChangedExistingGoalId),newQ:any=a.get(bindings.soleChangedExistingGoalId)
assert.equal(stableGoalBookJson({...oldQ,contains:newQ.contains,applicability:newQ.applicability}),stableGoalBookJson(newQ))
assert.deepEqual(newQ.contains,[...oldQ.contains,...bindings.assessmentGoalIds])
for(const id of bindings.assessmentGoalIds){
 const g:any=a.get(id);assert.deepEqual(g.requires,g.examData.coveredGoalIds);assert.equal(g.requires.length,1);assert.equal(g.examData.reviewStatus,'needs_review')
 assert.equal(g.examData.scoring.maxPoints,10);assert.equal(g.examData.scoring.passingPoints,10);assert.equal(g.examData.scoring.steps.reduce((sum:number,s:any)=>sum+s.points,0),10)
}
const beforeKinds=structuredClone(baseKind);beforeKinds.sourceLandscapePath=P+'/inputs/whole484-active-canonical.exact.json';put('candidate/before484-semantic-kinds.path-only.inactive.json',beforeKinds)
const afterKinds=structuredClone(baseKind);afterKinds.sourceLandscapePath=P+'/candidate/whole487-381-plus-three-practical-terminals.inactive.json'
afterKinds.decisions.find((x:any)=>x.goalId===bindings.soleChangedExistingGoalId).sourceFingerprint=fingerprintSemanticKindSourceGoal(newQ)
// Closed normal classification vocabulary; actual author classification of an
// exam-shaped noncurricular node, not independent content release or M7.
for(const id of bindings.assessmentGoalIds)afterKinds.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(a.get(id)),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'})
afterKinds.counts.total+=3;afterKinds.counts.practiceAssessment+=3
assert.equal(afterKinds.counts.curricularAtomic,381);put('candidate/whole487-381.semantic-kinds.inactive.json',afterKinds)
const beforeConfig=read('native/before381.normal.config.json');beforeConfig.semanticKindLedgerPath=P+'/candidate/before484-semantic-kinds.path-only.inactive.json';put('native/before381.normal.config.json',beforeConfig)
for(const f of ['candidate/before484-semantic-kinds.path-only.inactive.json','candidate/whole487-381.semantic-kinds.inactive.json','native/before381.normal.config.json'])writeFileSync(resolve(C,P,f),readFileSync(resolve(D,f)))
const module=await import(pathToFileURL(resolve(C,'app/scripts/generateCurriculumQualityStatus.technical-instrumented.ts')).href)
const compiler=await import(pathToFileURL(resolve(C,'app/scripts/applicabilityCompiler.ts')).href)
const profile=module.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');assert.ok(profile)
const beforeCompilation=compiler.buildApplicabilityCompilation()
const beforeScope=module.evaluateRouteProfile(before,profile,beforeCompilation)
writeFileSync(resolve(C,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),JSON.stringify(after,null,2)+'\n')
const afterCompilation=compiler.buildApplicabilityCompilation(),afterScope=module.evaluateRouteProfile(after,profile,afterCompilation)
put('checks/normal-before-after-CQR-whole-SekII.actual.json',{schemaVersion:1,normalWholeSourceEvaluator:'generateCurriculumQualityStatus.ts/evaluateRouteProfile',unmodifiedNormalProfileId:profile.profileId,technicalExportOnly:true,originalRuleSelectorOrThresholdChanges:0,before:beforeScope,after:afterScope,assessmentReviewStatus:'needs_review',independentCurrentTaskReviews:0,normalFullStatusOrProtectedFloorPassClaimed:false,strictGain:0})
const cqr101=afterScope.rules.find((r:any)=>r.id==='CQR-101');assert.equal(cqr101.status,'pass')
assert.equal(afterScope.rules.find((r:any)=>r.id==='CQR-202').status,'fail');assert.equal(afterScope.rules.find((r:any)=>r.id==='CQR-203').status,'warn')
const report=afterCompilation.reports.find((r:any)=>r.landscapeId===after.landscapeId)
const beforeReport=beforeCompilation.reports.find((r:any)=>r.landscapeId===before.landscapeId)
assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0)
const assessmentApplicability=bindings.assessmentGoalIds.map((id:string)=>report.goals.find((r:any)=>r.goalId===id))
assert.ok(assessmentApplicability.every((r:any)=>stableGoalBookJson(r.compiledApplicability)==='{"jurisdiction":["DE-BW"]}'))
assert.ok(assessmentApplicability.every((r:any)=>r.evidence.some((e:any)=>e.kind==='assessment-requires')))
const views=[]
for(const course of ['gk','lk']){
 const v=normalizeCompositionView(read('views/candidate-de-bw-'+course+'.view.inactive.json')),ov=normalizeCompositionView(read('views/original-de-bw-'+course+'.view.exact.json'))
 const result=compileCompositionView(v,normalizeCanonicalLandscape(after)),original=compileCompositionView(ov,normalizeCanonicalLandscape(before))
 const beforeSet=collectCompositionProjectionRoleGoalIds(ov.rootNodes,b as any).targetGoalIds,afterSet=collectCompositionProjectionRoleGoalIds(v.rootNodes,a as any).targetGoalIds
 const added=[...afterSet].filter(id=>!beforeSet.has(id));assert.deepEqual(new Set(added),new Set(course==='gk'?bindings.assessmentGoalIds.slice(0,1):bindings.assessmentGoalIds))
 assert.equal([...beforeSet].filter(id=>!afterSet.has(id)).length,0)
 assert.equal(result.findings.filter(f=>f.severity==='error').length,0);assert.equal(result.findings.length,original.findings.length)
 for(const id of added){const g:any=a.get(id);assert.ok(goalMatchesFilters(g,['DE-BW',course.toUpperCase(),'SekII']));assert.ok(!goalMatchesFilters(g,['DE-HE']));assert.ok(!goalMatchesFilters(g,['DE-BY']));assert.ok(!goalMatchesFilters(g,['SekI']))}
 views.push({courseProfile:course.toUpperCase(),originalTargets:beforeSet.size,candidateTargets:afterSet.size,addedPracticeTargetGoalIds:added,removedTargetGoalIds:[],ordinaryTargetGoalIdsExact:true,normalCompositionFindings:result.findings,duplicateGoalOccurrenceErrors:result.findings.filter(f=>f.code==='CPV-003'||f.code==='CPV-005'),BWOnlySekII:true})
}
const graph=module.evaluateGraphIntegrity(after,new Set(after.goals.map((g:any)=>g.id))),types=module.evaluateTypeConsistency(after)
assert.equal(graph.status,'pass');assert.equal(types.status,'pass')
put('checks/normal-whole-applicability-composition-route.actual.json',{schemaVersion:1,normalApis:['buildApplicabilityCompilation','compileCompositionView','collectCompositionProjectionRoleGoalIds','goalMatchesFilters','evaluateGraphIntegrity','evaluateTypeConsistency'],beforeApplicabilityMetrics:beforeReport.summary,afterApplicabilityMetrics:report.summary,newAssessmentApplicability:assessmentApplicability,wholeBWViews:views,graph,types,existingWhole484GoalsUnchangedExceptQ3Contains:true,all381CurricularGoalBodiesExact:true,curAtomicDenominator:381,sourceCoverageApproval:false,humanApproval:false,activeWrites:0})
const bm=await loadGoalBookBuildInputs(P+'/native/before381.normal.config.json',C),am=await loadGoalBookBuildInputs(P+'/native/after381.normal.config.json',C)
assert.equal(bm.model.pages.length,381);assert.equal(am.model.pages.length,381)
put('native/before381.actual-model.json',bm.model);put('native/after381.actual-model.json',am.model)
const bp=new Map(bm.model.pages.map((p:any)=>[p.goalId,p])),ap=new Map(am.model.pages.map((p:any)=>[p.goalId,p]))
const changes=bm.model.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(ap.get(p.goalId))).map((p:any)=>p.goalId)
assert.deepEqual(new Set(changes),new Set(bindings.goalIds))
const pageDeltas=changes.map((id:string)=>{const o:any=bp.get(id),n:any=ap.get(id);return{goalId:id,oldPageFingerprint:o.pageFingerprint,newPageFingerprint:n.pageFingerprint,changedTopLevelFields:Object.keys(n).filter(k=>stableGoalBookJson(o[k])!==stableGoalBookJson(n[k])),oldWholePage:o,newWholePage:n}})
put('checks/normal-full381-exact-three-native-context-deltas.actual.json',{schemaVersion:1,normalApi:'loadGoalBookBuildInputs + stableGoalBookJson',beforeModelDigest:bm.model.digest,afterModelDigest:am.model.digest,beforePages:381,afterPages:381,unchangedWholePageCount:378,changedWholePageIds:changes,all484OldGoalBodiesExactExceptQ3Contains:true,all177PreviouslyStrictGoalBodiesAndWholeNativePagesExact:true,threeNewPracticalGoalBodiesExact:true,threeNewPracticalCurrentPageContextsChanged:true,currentContextReviewRequiredGoalIds:changes,pageDeltas,scientificHashOnlyReviewClaimed:false,oldReviewsRemainImmutable:true,currentIndependentContextApprovals:0})
console.log(JSON.stringify({normalCQR101:cqr101.status,CQR202:'fail (3 needs_review author tasks)',CQR203:'warn (release pending two actual task reviews)',graph:graph.status,types:types.status,BWPractices:{GK:1,LK:3,SekI:0,HE:0,BY:0},curAtomic:381,ordinaryPages:'381→381',wholePageBodiesExact:378,changedCurrentPracticalContexts:changes,newIndependentNativeCampaignsRequired:2,activeWrites:0,strictGain:0}))
