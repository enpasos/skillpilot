// Apache-2.0. Bounded read-only native representation proof, not curriculum release.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {applyCompositionViewProjection,compositionViewExposesGoal} from '../../../../../../../app/src/utils/compositionViewRuntime.ts'
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes.ts'
import {collectAuthoritativeTargetAtomicGoalIds} from '../../../../../../../app/scripts/compositionViewSourceCoverage.ts'
import {scoreLearnerCompositionScope,compareLearnerCompositionScopeMatches} from '../../../../../../../app/src/utils/learnerCompositionScopeMatching.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const read=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const canPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const canBytes=await readFile(resolve(root,canPath)),landscape=JSON.parse(canBytes.toString())
const canonical=normalizeCanonicalLandscape(landscape),byId=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const disposition=await read(resolve(directory,'actual-independent-twenty-basic-regional-source-and-inert-scope-disposition.receipt.json').slice(root.length+1))
const excluded:string[]=disposition.sevenAdditionalGKPrerequisiteOnlyCandidateGoalIds
const goalId='479fb87a-3a5a-5892-8b3e-dfb1d07e9612'
const entry={meta:landscape,goals:landscape.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:landscape.landscapeId}))}
const require=createRequire(resolve(root,'app/package.json'));const Ajv2020=require('ajv/dist/2020.js').default
const schemaBytes=await readFile(resolve(root,'contracts/curriculum-package/v1/composition-view.schema.json'))
const validate=new Ajv2020({allErrors:true,strict:false}).compile(JSON.parse(schemaBytes.toString()))
const profiles:any[]=[]
for(const profile of ['GK','LK']){
 const basePath=`curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-law479-independent-source-scope-decision-v1/de-by-gym-economics-${profile.toLowerCase()}-479-bounded.inert.view.json`
 const base=await read(basePath)
 const candidatePath=resolve(directory,`bounded-BY-pair-scope-author-candidate-v2/de-by-gym-economics-${profile.toLowerCase()}-macro-bounded.inert.view.json`)
 const candidateBytes=await readFile(candidatePath),candidate=JSON.parse(candidateBytes.toString())
 if(!validate(candidate))throw new Error(JSON.stringify(validate.errors))
 const compileBase=compileCompositionView(normalizeCompositionView(base),canonical)
 const compileCandidate=compileCompositionView(normalizeCompositionView(candidate),canonical)
 if(compileBase.findings.length||compileCandidate.findings.length)throw new Error(JSON.stringify({compileBase,compileCandidate}))
 const baseTargets=collectAuthoritativeTargetAtomicGoalIds(landscape,base),newTargets=collectAuthoritativeTargetAtomicGoalIds(landscape,candidate)
 const removed=[...baseTargets].filter(x=>!newTargets.has(x)).sort(),added=[...newTargets].filter(x=>!baseTargets.has(x)).sort()
 const expectedActuallyPresentRemovals=profile==='GK'?excluded.filter(id=>baseTargets.has(id)).sort():[]
 if(JSON.stringify(removed)!==JSON.stringify(expectedActuallyPresentRemovals)||added.length)throw new Error(JSON.stringify({failure:'Unexpected atomic target delta',profile,removed,added,excluded,baseHasExcluded:excluded.map(id=>({id,target:baseTargets.has(id)}))}))
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(candidate).rootNodes,byId as any)
 const projected=applyCompositionViewProjection([entry],candidate)[0]
 const wholeRetained=projected.goals.find((g:any)=>g.id===goalId)
 if(!wholeRetained)throw new Error('Stable support goal removed from runtime data')
 const requested={schoolForm:'Gymnasium',jurisdiction:'DE-BY',stage:'CrossStage',courseProfile:profile}
 const baseMatch=scoreLearnerCompositionScope(base.scope,requested),candidateMatch=scoreLearnerCompositionScope(candidate.scope,requested)
 if(!baseMatch||!candidateMatch||compareLearnerCompositionScopeMatches(candidateMatch,baseMatch)>0)throw new Error('Unexpected regional scope regression')
 const mismatchedOtherJurisdiction=scoreLearnerCompositionScope(candidate.scope,{...requested,jurisdiction:'DE-HE'})
 const mismatchedOtherCourse=scoreLearnerCompositionScope(candidate.scope,{...requested,courseProfile:profile==='GK'?'LK':'GK'})
 const mismatchedSekII=scoreLearnerCompositionScope(candidate.scope,{...requested,stage:'SekII'})
 if(mismatchedOtherJurisdiction||mismatchedOtherCourse||mismatchedSekII)throw new Error('Unexpected scope broadening')
 profiles.push({profile,candidatePath:candidatePath.slice(root.length+1),candidateSha256:hash(candidateBytes),
  schemaPassed:true,nativeCompilerFindings:compileCandidate.findings,baseWholeAtomicTargetCount:baseTargets.size,
  candidateWholeAtomicTargetCount:newTargets.size,removedAtomicTargetIds:removed,addedAtomicTargetIds:added,
  actual479TargetRole:roles.targetGoalIds.has(goalId),actual479PrerequisiteOnlyRole:roles.prerequisiteOnlyGoalIds.has(goalId),
  actual479VisibleTarget:compositionViewExposesGoal([entry],candidate,goalId),
  initialSevenDeltaExpectationFailedBecauseTwoBaselineTargetsAbsent:true,
  actualStable479PresentInProjectedCanonicalData:true,actualCanonicalRequiresRetained:JSON.stringify(wholeRetained.requires)===JSON.stringify((byId.get(goalId) as any).requires),
  baseScopeMatch:baseMatch,candidateScopeMatch:candidateMatch,existingRegionalCrossStageScopeExactlyRetained:true,
  matchesOtherJurisdiction:false,matchesOtherCourse:false,matchesResolvedSekII:false,
  wholeCandidateAtomicTargetIds:[...newTargets].sort(),allSevenActualRoles:excluded.map(id=>({goalId:id,target:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),visible:compositionViewExposesGoal([entry],candidate,id),stableCanonicalRecordRetained:!!projected.goals.find((g:any)=>g.id===id)}))})
}
if(hash(await readFile(resolve(root,canPath)))!==hash(canBytes))throw new Error('Concurrent canonical mutation during probe')
const changedGuardedFiles=[]
for(const input of disposition.guardedImmutableAuthorAndSourceInputs){if(hash(await readFile(resolve(root,input.path)))!==input.sha256)changedGuardedFiles.push(input.path)}
if(changedGuardedFiles.length)throw new Error(JSON.stringify(changedGuardedFiles))
const receipt={role:'actual_native_bounded_seven_projection_candidate_representability_countercheck_not_substantive_selfapproval',createdAt:new Date().toISOString(),
 currentCanonicalPath:canPath,currentCanonicalSha256:hash(canBytes),canonicalWholeGoals:landscape.goals.length,
 schemaSha256:hash(schemaBytes),profiles,allGuardedActiveAndAuthorInputBytesPreserved:true,
 exactCommittedStageConstraint:'Both inert candidates retain the existing CrossStage scope. They do not match an exact SekII learner scope; no CrossStage fallback or reviewed SekII offering is claimed.',
 combinedProfileLimit:'A regional GK and LK pair avoids a BY GK+LK request resolving only the more-specific GK exclusion. Actual backend combined merge still requires integration verification.',
 activeWrites:0,humanApprovalClaim:false,newStrictCompletions:0,completeRegionalCurriculumApprovalClaim:false}
await writeFile(resolve(directory,'actual-native-seven-bounded-BY-GK-LK-projection.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({profiles:profiles.map(({profile,candidateWholeAtomicTargetCount,removedAtomicTargetIds,actual479TargetRole,actual479PrerequisiteOnlyRole})=>({profile,candidateWholeAtomicTargetCount,removedAtomicTargetIds,actual479TargetRole,actual479PrerequisiteOnlyRole})),activeWrites:0},null,2))
