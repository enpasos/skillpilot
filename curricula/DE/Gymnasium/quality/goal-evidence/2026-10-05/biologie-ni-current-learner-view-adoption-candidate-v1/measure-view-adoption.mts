// SPDX-License-Identifier: Apache-2.0
// Inactive, actual current-data view proposal measurement. No runtime writes.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { goalMatchesFilter } from '../../../../../../../app/src/utils/goalFilters'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>({path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})
const label=process.argv[2]??'';assert(/^[a-z0-9-]*$/.test(label)); const out=(n:string,v:any)=>writeFileSync(own+'/'+n.replace('.json',(label?'.'+label:'')+'.json'),JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const canon=read(canonPath), by=new Map<string,any>(canon.goals.map((g:any)=>[g.id,g]))
const cluster='9cd0dbbc-9507-5879-8c4f-df54529969ec'
const niIds:string[]=[cluster,...by.get(cluster).contains]
const memoryIds=['1a7d8063-5b3b-55fd-b8ea-8701d876888e','b00dd3d9-8589-584c-a8cf-12efb4856dfe']
assert.equal(niIds.length,21)
const sourcePath='app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json'
const sourceView=normalizeCompositionView(read(sourcePath))
const sourceIds=collectCompositionProjectionRoleGoalIds(sourceView.rootNodes,by).targetGoalIds
const currentViews=['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json','curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json']
const viewRows:any[]=[]
const actualByPath=new Map<string,Set<string>>(), futureByPath=new Map<string,Set<string>>()
for(const path of currentViews){
 const before=normalizeCompositionView(read(path)), after=normalizeCompositionView(read(own+'/prospective-input-tree/'+path))
 assert.deepEqual(before.scope,after.scope)
 const prior=collectCompositionProjectionRoleGoalIds(before.rootNodes,by), future=collectCompositionProjectionRoleGoalIds(after.rootNodes,by)
 actualByPath.set(path,prior.targetGoalIds); futureByPath.set(path,future.targetGoalIds)
 assert.deepEqual([...prior.prerequisiteOnlyGoalIds],[...future.prerequisiteOnlyGoalIds])
 const added=[...future.targetGoalIds].filter(id=>!prior.targetGoalIds.has(id)).sort()
 assert.deepEqual(added,[...niIds].sort())
 assert([...prior.targetGoalIds].every(id=>future.targetGoalIds.has(id)))
 const cBefore=compileCompositionView(before,normalizeCanonicalLandscape(canon))
 const cAfter=compileCompositionView(after,normalizeCanonicalLandscape(canon))
 assert.deepEqual(cAfter.findings.filter(f=>f.severity==='error'),[])
 const addedFindings=cAfter.findings.filter(f=>!cBefore.findings.some(b=>JSON.stringify(b)===JSON.stringify(f)))
 assert.deepEqual(addedFindings,[])
 const scopes=[]
 for(const jurisdiction of ['DE-NI','DE-HE','DE-BY','DE-BW','DE-RP','DE-SL','DE-HB','DE-NW','DE-BB','DE-BE','DE-HH','DE-MV','DE-SH','DE-SN','DE-ST','DE-TH']){
  for(const durationModel of ['G8','G9'])for(const courseProfile of ['GK','LK']){
   const matches=(id:string)=>[jurisdiction,durationModel,courseProfile].every(f=>goalMatchesFilter(by.get(id),f))
   const a=[...prior.targetGoalIds].filter(matches),b=[...future.targetGoalIds].filter(matches)
   const addition=b.filter(id=>!a.includes(id))
   assert.deepEqual(addition.sort(),jurisdiction==='DE-NI'?[...niIds].sort():[])
   scopes.push({jurisdiction,durationModel,courseProfile,previousWholeTargetCount:a.length,futureWholeTargetCount:b.length,addedTargetIds:addition})
  }
 }
 // Both learner anchor scopes are retained. The actual backend requires exact stage
 // for committed Personal Curriculum selection; neither view becomes a SekII offering.
 const actualStageAnchorWitness={before:before.scope.stage,after:after.scope.stage,resolvedSekIEligible:after.scope.stage==='SekI',resolvedSekIIEligible:after.scope.stage==='SekII',CrossStageReferenceOnly:after.scope.stage==='CrossStage'}
 assert.equal(actualStageAnchorWitness.resolvedSekIIEligible,false)
 viewRows.push({path,beforeSHA256:hash(path).sha256,candidateSHA256:hash(own+'/prospective-input-tree/'+path).sha256,oldWholeTargetCount:prior.targetGoalIds.size,newWholeTargetCount:future.targetGoalIds.size,addedWholeTargetIds:added,removedTargets:[],scopeExact:true,beforeCompilerFindings:cBefore.findings,afterCompilerFindings:cAfter.findings,newCompilerFindings:addedFindings,actualStageAnchorWitness,scopes})
}
const prepared=prepareLandscapeEntries([canon])[0]
const unqual=(id:string)=>id.startsWith(canon.landscapeId+':')?id.slice(canon.landscapeId.length+1):id
const prepBy=new Map<string,any>(prepared.goals.map((g:any)=>[unqual(g.id),{...g,eff:(g.effectiveRequires??[]).map(unqual)}]))
const niTargets=[...futureByPath.get(currentViews[0])!].filter(id=>['DE-NI','G9','GK'].every(f=>goalMatchesFilter(by.get(id),f)))
const missing=(id:string)=>{const all=new Set<string>(),visiting=new Set<string>();const visit=(x:string)=>{assert(!visiting.has(x),'requires cycle');visiting.add(x);for(const p of prepBy.get(x).eff){if(!all.has(p)){all.add(p);visit(p)}}visiting.delete(x)};visit(id);return{goalId:id,effectivePrerequisites:[...all].sort(),missingVisiblePrerequisites:[...all].filter(p=>!niTargets.includes(p)).sort()}}
const prerequisiteWitnesses=niIds.slice(1).map(missing)
assert(prerequisiteWitnesses.every(w=>w.missingVisiblePrerequisites.length===0))
const ordinaryIds=niIds.filter(id=>id!==cluster&&!memoryIds.includes(id))
assert.equal(ordinaryIds.length,18)
assert(ordinaryIds.every(id=>sourceIds.has(id)))
assert(memoryIds.every(id=>!sourceIds.has(id)))
const mappingPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-eighteen-current-reviewed-integration-candidate-v2/NI.current-reviewed.mapping.snapshot.json'
const mapping=read(mappingPath),source=read(mapping.sourceExtractionPath),sources=new Map<string,any>(source.sourceGoals.map((g:any)=>[g.id,g]))
const primaryWitnesses=ordinaryIds.map(id=>({goalId:id,gradeBand:by.get(id).extendedData?.authorCandidate?.gradeBand,sourceMappings:mapping.mappings.filter((m:any)=>m.canonicalGoalId===id).map((m:any)=>({matchType:m.matchType,sourceGoal:sources.get(m.legacyGoalId)}))}))
assert(primaryWitnesses.every(w=>w.sourceMappings.length>0&&w.sourceMappings.every(m=>m.sourceGoal.tags.includes('stage:SekI')&&m.sourceGoal.tags.includes('jurisdiction:DE-NI'))))
const policy=read('curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
const policies=Object.values(policy).flatMap((v:any)=>Array.isArray(v)?v:[])
const niPolicy=policies.find((p:any)=>p.subject==='Biologie'&&p.jurisdiction==='DE-NI'&&p.stage==='SekI')
assert.deepEqual(niPolicy.durationModels,['G9'])
const memoryConfig=read(own+'/full-memory.current-learner-views.config.json')
const memoryRecords=readFileSync(memoryConfig.reviewPath,'utf8').trim().split('\n').map(l=>JSON.parse(l))
const memoryRequired=memoryRecords.filter(r=>r.status==='memory_required')
const scopeMemoryWitnesses=currentViews.map(path=>({path,visibleMemoryRequiredGoals:memoryRequired.filter(r=>futureByPath.get(path)!.has(r.goalId)).map(r=>({goalId:r.goalId,memoryGoalIds:r.memoryGoalIds,deckIds:r.deckIds,allReferencedMemoryVisible:r.memoryGoalIds.every((m:string)=>futureByPath.get(path)!.has(m))}))}))
assert(scopeMemoryWitnesses.every(w=>w.visibleMemoryRequiredGoals.every(r=>r.allReferencedMemoryVisible)))
const javaPath='backend/src/test/java/com/skillpilot/backend/controller/LearnerControllerIntegrationTest.java',javaText=readFileSync(javaPath,'utf8')
const baseline=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-current-layer-a-inventory-projections-v2/final-projection-bio383-chem378.actual.json')
const projectionRows=[]
for(const [subject,name,tail]of[['Biologie','BIOLOGIE','biologie/de-de-gym-seki-biology.view.json'],['Chemie','CHEMIE','chemie/de-de-gym-seki-chemistry.view.json']]){
 const cp=`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`,raw=read(cp),byId=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
 const vp=`curricula/DE/Gymnasium/composition-views/${tail}`
 const targets=subject==='Biologie'?futureByPath.get(vp)!:collectCompositionProjectionRoleGoalIds(normalizeCompositionView(read(vp)).rootNodes,byId).targetGoalIds
 const expectedRows=[...javaText.matchAll(new RegExp(`\\{ "${subject}", CANONICAL_[A-Z]+_ID, "(DE-[A-Z]+)", "(\\d+)", "(\\d+)" \\}`,'g'))]
 for(const row of expectedRows)for(const durationModel of ['G8','G9']){
  const prior=baseline.rows.find((x:any)=>x.subject===subject&&x.jurisdiction===row[1]&&x.durationModel===durationModel)
  assert(prior)
  const ids=[...targets].filter(id=>{const g=byId.get(id);return(g.type??((g.contains?.length??0)>0?'cluster':'atomic'))!=='cluster'&&[row[1],durationModel,'GK'].every(f=>goalMatchesFilter(g,f))}).sort()
  const added=ids.filter(id=>!prior.currentTargetIds.includes(id)),removed=prior.currentTargetIds.filter((id:string)=>!ids.includes(id))
  assert.deepEqual(removed,[])
  assert.deepEqual(added.sort(),subject==='Biologie'&&row[1]==='DE-NI'?niIds.filter(id=>id!==cluster).sort():[])
  projectionRows.push({subject,jurisdiction:row[1],durationModel,stage:'SekI',courseProfile:'GK',javaExpectedBefore:Number(durationModel==='G8'?row[2]:row[3]),previousActual:prior.nativeCurrentTargetAtomicTotal,futureTargetAtomicTotal:ids.length,currentTargetIds:ids,addedTargetIds:added,removedTargetIds:removed,expectedJavaDelta:ids.length-Number(durationModel==='G8'?row[2]:row[3])})
 }
}
assert.equal(projectionRows.length,46)
const jAfter=javaText.replace('{ "Biologie", CANONICAL_BIOLOGY_ID, "DE-NI", "88", "88" }','{ "Biologie", CANONICAL_BIOLOGY_ID, "DE-NI", "108", "108" }')
assert.notEqual(jAfter,javaText)
writeFileSync(own+'/LearnerControllerIntegrationTest.counts-only.'+(label?label+'.':'')+'candidate.txt',jAfter,{flag:'wx'})
out('actual-current-and-prospective-view-scope-prerequisite-memory-projection-proof.json',{atUTC:new Date().toISOString(),status:'Inactive actual current-data native proof passed; pending root view adoption',activeWrites:false,runtimeCodeChanges:false,backendTestsRun:false,humanApproval:false,newScientificClosures:0,inputs:[hash(canonPath),hash(sourcePath),hash(mappingPath),hash(mapping.sourceExtractionPath),hash(javaPath),hash(memoryConfig.reviewPath),hash(memoryConfig.cardReviewPath)],views:viewRows,NI21wholeGoalObjects:niIds.map(id=>by.get(id)),primaryWitnesses,niDurationPolicy:niPolicy,G8ContractNote:'G8 is measured as the existing compatibility-test contract only; the normative NI source policy remains G9.',prerequisiteWitnesses,sourceAtlasNIOrdinaryGoalCount:18,sourceAtlasNewMemoryGoalCount:0,actualLearnerViewsNewMemoryGoalCount:2,scopeMemoryWitnesses,projection46Rows:projectionRows,expectedJavaChangedFields:[{jurisdiction:'DE-NI',subject:'Biologie',duration:'G8',before:88,after:108},{jurisdiction:'DE-NI',subject:'Biologie',duration:'G9',before:88,after:108}],wholeOldTargetsPreserved:true})
console.log(JSON.stringify({viewWholeTargetCounts:viewRows.map(x=>[x.path,x.oldWholeTargetCount,x.newWholeTargetCount]),compilerErrors:0,newCompilerFindings:0,missingPrerequisites:0,onlyNIProjectionChanges:projectionRows.filter(r=>r.expectedJavaDelta!==0).map(({currentTargetIds,...r})=>r),actualProjectionCases:46,newScientificClosures:0,humanApproval:false}))
