// Apache-2.0. Inert native representation probe; no substantive author self-approval.
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
const canPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-by-eleven-nine-bounded-current250-integration-handoff-v2/prepared/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const canBytes=await readFile(resolve(root,canPath)),landscape=JSON.parse(canBytes.toString()),canonical=normalizeCanonicalLandscape(landscape)
if(hash(canBytes)!=='sha256:886dd2f029c90adf5f77021c51bb69790d1543526ec20d3856bd27f5593916ee')throw new Error('Unexpected immutable current311 canonical')
const byId=new Map(landscape.goals.map((g:any)=>[g.id,g])),entry={meta:landscape,goals:landscape.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:landscape.landscapeId}))}
const final19=JSON.parse(await readFile(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-concrete-nineteen-bilingual-author-v1/whole-goals.with-individual-taxonomy.candidate.json'),'utf8'))
const ids:string[]=final19.filter((g:any)=>['941ea650','be602e0c','f0fc29e3','c87e528a','a6a609cb','94fe52f5','5d8c708f','78e87088','9a5b2913','8a453b6b','7a926b77'].includes(g.id.slice(0,8))).map((g:any)=>g.id)
const excluded:string[]=ids.filter(x=>['7a926b77','8a453b6b','9a5b2913','78e87088'].includes(x.slice(0,8)))
if(ids.length!==11||excluded.length!==4)throw new Error('Unexpected source goal denominator')
const require=createRequire(resolve(root,'app/package.json')),Ajv2020=require('ajv/dist/2020.js').default
const schemaBytes=await readFile(resolve(root,'contracts/curriculum-package/v1/composition-view.schema.json')),validate=new Ajv2020({allErrors:true,strict:false}).compile(JSON.parse(schemaBytes.toString()))
const profiles:any[]=[]
for(const profile of ['GK','LK']){
 const basePath=resolve(directory,`de-by-gym-economics-${profile.toLowerCase()}-macro-law-nav-rebased-baseline.inert.view.json`),candidatePath=resolve(directory,`de-by-gym-economics-${profile.toLowerCase()}-final-nineteen-bindings-restored.inert.view.json`)
 const baseBytes=await readFile(basePath),candidateBytes=await readFile(candidatePath),base=JSON.parse(baseBytes.toString()),candidate=JSON.parse(candidateBytes.toString())
 if(!validate(candidate))throw new Error(JSON.stringify(validate.errors))
 const compiled=compileCompositionView(normalizeCompositionView(candidate),canonical),baseCompiled=compileCompositionView(normalizeCompositionView(base),canonical)
 if(compiled.findings.length||baseCompiled.findings.length)throw new Error(JSON.stringify({compiledFindings:compiled.findings,baseFindings:baseCompiled.findings}))
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(candidate).rootNodes,byId as any),baseRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(base).rootNodes,byId as any)
 const targets=collectAuthoritativeTargetAtomicGoalIds(landscape,candidate),baseTargets=collectAuthoritativeTargetAtomicGoalIds(landscape,base)
 const removed=[...baseTargets].filter(x=>!targets.has(x)).sort(),added=[...targets].filter(x=>!baseTargets.has(x)).sort()
 const expectedRemoval=profile==='GK'?excluded.filter(x=>baseTargets.has(x)).sort():[]
 const restored=ids.filter(x=>['c87e528a','94fe52f5'].includes(x.slice(0,8))||(profile==='LK'&&x.startsWith('8a453b6b')))
 const expectedAdded=restored.filter(x=>!baseTargets.has(x)).sort()
 if(JSON.stringify(removed)!==JSON.stringify(expectedRemoval)||JSON.stringify(added)!==JSON.stringify(expectedAdded))throw new Error(JSON.stringify({unexpectedAtomicTargetDelta:true,profile,removed,added,expectedRemoval}))
 const allOtherRoleChanges=landscape.goals.filter((g:any)=>!excluded.includes(g.id)&&!restored.includes(g.id)).filter((g:any)=>roles.targetGoalIds.has(g.id)!==baseRoles.targetGoalIds.has(g.id)||roles.prerequisiteOnlyGoalIds.has(g.id)!==baseRoles.prerequisiteOnlyGoalIds.has(g.id)).map((g:any)=>g.id)
 if(allOtherRoleChanges.length)throw new Error(JSON.stringify({unexpectedOtherRoleChanges:allOtherRoleChanges}))
 const occurrences=new Map<string,string[]>()
 const visit=(nodes:any[],parent:string|null)=>{for(const node of nodes){if(node.sourceGoalId){const parents=occurrences.get(node.sourceGoalId)||[];parents.push(parent||'<root>');occurrences.set(node.sourceGoalId,parents)}visit(node.children||[],node.sourceGoalId||node.runtimeId)}}
 visit(compiled.compiledRootNodes,null)
 const duplicateParents=[...occurrences].filter(([,parents])=>parents.length>1)
 if(duplicateParents.length)throw new Error(JSON.stringify({duplicateParents}))
 const projected=applyCompositionViewProjection([entry],candidate)[0]
 const sourceEleven=ids.map(goalId=>({goalId,baseTarget:baseRoles.targetGoalIds.has(goalId),basePrerequisiteOnly:baseRoles.prerequisiteOnlyGoalIds.has(goalId),target:roles.targetGoalIds.has(goalId),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(goalId),visible:compositionViewExposesGoal([entry],candidate,goalId),visibleParentKeys:occurrences.get(goalId)||[],stableCanonicalRecordRetained:!!projected.goals.find((g:any)=>g.id===goalId),currentRequiresExactlyRetained:JSON.stringify(projected.goals.find((g:any)=>g.id===goalId)?.requires)===JSON.stringify((byId.get(goalId) as any).requires)}))
 for(const r of sourceEleven){const expected=profile==='LK'||!excluded.includes(r.goalId);if(r.target!==expected||r.visible!==expected||r.prerequisiteOnly===expected||r.visibleParentKeys.length!==(expected?1:0))throw new Error(JSON.stringify({sourceElevenMismatch:profile,r,expected}))}
 const macroDispositions=JSON.parse(await readFile(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q-business-macro-twenty-independent-regional-basic-scope-review-v1/twenty-individual-regional-basic-source-dispositions.actual.json'),'utf8'))
 const macroWholeRoles=macroDispositions.map((r:any)=>({goalId:r.goalId,expectedTarget:profile==='LK'||r.disposition==='complete-basic-supported',target:roles.targetGoalIds.has(r.goalId),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(r.goalId),visibleParentKeys:occurrences.get(r.goalId)||[]}))
 for(const r of macroWholeRoles){if(r.target!==r.expectedTarget||r.prerequisiteOnly===r.expectedTarget||r.visibleParentKeys.length!==(r.expectedTarget?1:0))throw new Error(JSON.stringify({macroRoleRegression:profile,r}))}
 const law479='479fb87a-3a5a-5892-8b3e-dfb1d07e9612'; if(roles.targetGoalIds.has(law479)!==(profile==='LK')||roles.prerequisiteOnlyGoalIds.has(law479)!==(profile==='GK'))throw new Error('Law479 role regression')
 const nationalPath=resolve(root,`curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${profile.toLowerCase()}.view.json`),nationalBytes=await readFile(nationalPath),national=JSON.parse(nationalBytes.toString())
 const requested={schoolForm:'Gymnasium',jurisdiction:'DE-BY',stage:'CrossStage',courseProfile:profile},candidateMatch=scoreLearnerCompositionScope(candidate.scope,requested),nationalMatch=scoreLearnerCompositionScope(national.scope,requested)
 if(!candidateMatch||!nationalMatch||compareLearnerCompositionScopeMatches(candidateMatch,nationalMatch)>=0)throw new Error('Missing regional default precedence')
 if(scoreLearnerCompositionScope(candidate.scope,{...requested,stage:'SekII'})||scoreLearnerCompositionScope(candidate.scope,{...requested,jurisdiction:'DE-HE'})||scoreLearnerCompositionScope(candidate.scope,{...requested,courseProfile:profile==='GK'?'LK':'GK'}))throw new Error('Unexpected scope broadening')
 profiles.push({profile,basePath:basePath.slice(root.length+1),baseSha256:hash(baseBytes),candidatePath:candidatePath.slice(root.length+1),candidateSha256:hash(candidateBytes),nationalPath:nationalPath.slice(root.length+1),nationalSha256:hash(nationalBytes),schemaPASS:true,nativeCompilerFindings:compiled.findings,baseAtomicTargetCount:baseTargets.size,candidateAtomicTargetCount:targets.size,removedAtomicTargetIds:removed,addedAtomicTargetIds:added,allOtherGoalRolesExactlyPreserved:true,duplicateVisibleGoalOrMultipleParentIds:duplicateParents,sourceElevenActualRoles:sourceEleven,macroTwentyRolesExactlyRetained:macroWholeRoles,actualLaw479Target:roles.targetGoalIds.has(law479),actualLaw479PrerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(law479),wholeAtomicTargetIds:[...targets].sort(),allTargetRoleGoalIds:[...roles.targetGoalIds].sort(),allPrerequisiteOnlyRoleGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),requested,candidateMatch,nationalMatch,regionalWouldShadowNational:true,matchesExactSekII:false,matchesOtherJurisdiction:false,matchesOtherSingleCourseProfile:false})
}
if(hash(await readFile(resolve(root,canPath)))!==hash(canBytes))throw new Error('Immutable canonical mutated')
const receipt={schemaVersion:1,actualExecutedAt:new Date().toISOString(),role:'Actual native inert v4 restored representation and preservation checks; no substantive view-author self-approval',immutableCurrent311CanonicalPath:canPath,immutableCurrent311CanonicalSha256:hash(canBytes),wholeCanonicalGoalObjects:landscape.goals.length,sourceGoalDenominator:11,sourceCourseMetadataRows:17,sourceMetadataParents:{basic:5,elevated:12},fourAdjudicatedHigherGoalIds:excluded,profiles,activeWrites:0,humanApproval:false,strictNetGain:0,fullRegionalCurriculumOrWholeLayerARouteApproval:false}
await writeFile(resolve(directory,'actual-native-v4-eleven-regional-target-roles-restored.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(profiles.map(p=>({profile:p.profile,baseTargets:p.baseAtomicTargetCount,candidateTargets:p.candidateAtomicTargetCount,removed:p.removedAtomicTargetIds,sourceEleven:p.sourceElevenActualRoles})),null,2))
