import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

// Run from repository root with the repository's tsx. Imports and inputs are portable repository-relative paths.
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-19/chemie-current455-after-six-source-CAS-atlas-refresh-technical-20261019-v1'
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const R='curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
const A='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const ID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const pin=(path:string)=>{const b=readFileSync(path);return {path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const write=(name:string,j:any)=>{const p=O+'/'+name;assert(!existsSync(p),'Do not overwrite prior actual output '+p);writeFileSync(p,JSON.stringify(j,null,2)+'\n');assert.deepEqual(read(p),j);return pin(p)}
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const {buildApplicabilityCompilation}=await load('app/scripts/applicabilityCompiler.ts')
const {createReviewedRequiresClosureCoverageChecker,sourceCoverageSurrogateKey,hasDirectSourceCoverageEvidence}=await load('app/scripts/sourceCoverageEvidence.ts')
const {normalizeCanonicalLandscape}=await load('app/src/utils/authoring/canonicalAuthoring.ts')
const {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView}=await load('app/src/utils/authoring/compositionViewAuthoring.ts')
const {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig,compactGoalBookSourceAtlasReceipt}=await load('app/scripts/goalBookSourceAtlasInputs.ts')
const startedAtUTC=new Date().toISOString()
console.log(JSON.stringify({phase:'START',startedAtUTC,operation:'Current Chemistry only: production role/compiler, unmodified source checker, pure atlas model; no normal outputs written'}))
const raw=read(C),sem=read(S),registry=read(R),atlasOriginal=read(A)
const ordinary=new Set<string>(sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const goalById=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const canonical=normalizeCanonicalLandscape(raw)
const root=raw.goals.find((g:any)=>g.tags?.includes('root'))??raw.goals[0]
const roots=new Map([[ID,root.id]])
assert(Array.isArray(registry.entries),'Read the actual entries field; no historical length sentinel')
const surrogateEntries=registry.entries.filter((e:any)=>e.landscapeId===ID)
const surrogates=new Map<string,any[]>()
for(const e of surrogateEntries){const k=sourceCoverageSurrogateKey(e.landscapeId,e.goalId,e.jurisdiction);surrogates.set(k,[...(surrogates.get(k)??[]),e])}
const inputPaths=new Set([C,S,R,A,'app/scripts/applicabilityCompiler.ts','app/scripts/sourceCoverageEvidence.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts',atlasOriginal.durationModelPolicyPath,...atlasOriginal.mappingPaths,'curricula/DE/Gymnasium/provenance/source-landscape-registry.json','curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json','curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'])
for(const p of atlasOriginal.mappingPaths){const m=read(p);if(typeof m.sourceExtractionPath==='string')inputPaths.add(m.sourceExtractionPath)}
const views:any[]=[];const compositionFindings:any[]=[];const pairs=new Map<string,any>();const coords:any[]=[]
for(const file of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(f=>f.endsWith('.view.json')).sort()){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+file;inputPaths.add(path)
 const view=normalizeCompositionView(read(path));assert.equal(view.landscapeId,ID)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,goalById,roots)
 const compiled=compileCompositionView(view,canonical)
 const target=[...roles.targetGoalIds].filter((id:any)=>ordinary.has(id)).sort();const support=[...roles.prerequisiteOnlyGoalIds].filter((id:any)=>ordinary.has(id)).sort()
 const jurisdiction=view.scope.jurisdiction
 const land=typeof jurisdiction==='string'&&/^DE-[A-Z]{2}$/.test(jurisdiction)
 const ordinal=views.length
 views.push({ordinal,path,viewId:view.viewId,scope:view.scope,isLandTargetCoordinate:land,ordinaryTargetGoalIds:target,ordinaryPrerequisiteOnlyGoalIds:support,allTargetRoleCount:roles.targetGoalIds.size,allPrerequisiteOnlyRoleCount:roles.prerequisiteOnlyGoalIds.size,findings:compiled.findings})
 compositionFindings.push(...compiled.findings.map((f:any)=>({viewPath:path,viewId:view.viewId,scope:view.scope,...f})))
 for(const goalId of target){
  coords.push({goalId,viewOrdinal:ordinal,viewId:view.viewId,scope:view.scope,role:'target',jurisdictionForLandPair:land?jurisdiction:null})
  if(!land)continue
  const k=goalId+'|'+jurisdiction;const old=pairs.get(k)??{goalId,jurisdiction,viewOrdinals:[]};old.viewOrdinals.push(ordinal);pairs.set(k,old)
 }
}
const scopeBeforePins=[...inputPaths].sort().map(pin)
console.log(JSON.stringify({phase:'ACTUAL_ROLES',ordinaryGoals:ordinary.size,chemistryViews:views.length,landViewCoordinates:views.filter(v=>v.isLandTargetCoordinate).length,allOrdinaryTargetRoleOccurrences:coords.length,uniqueActualTargetLandPairs:pairs.size,compositionErrors:compositionFindings.filter(f=>f.severity==='error').length}))
// Production API has no subject option. It internally loads global dependency indexes; retain/process only Chemistry's report.
const compiledAP=buildApplicabilityCompilation()
const report=compiledAP.reports.find((r:any)=>r.landscapeId===ID);assert(report)
const apGoalById=new Map<string,any>(report.goals.map((g:any)=>[g.goalId,g]))
const checkers=new Map<string,any>()
const checker=(jurisdiction:string)=>{
 if(!checkers.has(jurisdiction))checkers.set(jurisdiction,createReviewedRequiresClosureCoverageChecker({landscapeId:ID,jurisdiction,goals:report.goals,canonicalGoalById:goalById,surrogateEntriesByKey:surrogates,isEligibleCanonicalGoal:(g:any)=>g!==undefined&&ordinary.has(g.id)}))
 return checkers.get(jurisdiction)
}
const targetResults=[...pairs.values()].sort((a,b)=>a.jurisdiction.localeCompare(b.jurisdiction)||a.goalId.localeCompare(b.goalId)).map(t=>{
 const g=apGoalById.get(t.goalId)
 if(!g)return {...t,coverageBacked:false,directCoverage:false,reviewedRequiresClosureCoverage:false,error:'Missing current AP report goal'}
 const c=checker(t.jurisdiction)
 return {...t,coverageBacked:c.hasCoverageBackedJurisdictionEvidence(g),directCoverage:hasDirectSourceCoverageEvidence(g,t.jurisdiction),reviewedRequiresClosureCoverage:c.hasReviewedRequiresClosureSurrogateEvidence(g),compiledApplicabilityIncludesLand:(g.compiledApplicability?.jurisdiction??[]).includes(t.jurisdiction)}
})
const missing=targetResults.filter(t=>!t.coverageBacked)
const apReportPin=write('AP.original-current-chemistry-report.json',report)
const rolesPin=write('ROLES.actual-current-41-view-projection.json',{kind:'ACTUAL_PRODUCTION_COMPOSITION_ROLES',ordinaryGoalCount:ordinary.size,views,allOrdinaryTargetRoleOccurrences:coords,nationalAggregateViewsDoNotCreateLandPairs:true})
const actualLandGoals=new Set(targetResults.map(t=>t.goalId));const noLandTargets=[...ordinary].filter(id=>!actualLandGoals.has(id)).sort()
const evidencePaths=[...new Set<string>(report.goals.flatMap((g:any)=>g.evidence.filter((e:any)=>e.kind==='mapping'||e.kind==='provenance').map((e:any)=>e.source)))]
const additionalAPInputs=evidencePaths.filter(p=>existsSync(p)&&!inputPaths.has(p)).map(pin)
const missingPin=write('MISSING.actual-current-target-land-pairs.json',{missingTargetLandPairs:missing,ordinaryGoalsWithoutAnyCurrentLandTargetRole:noLandTargets,unavailableAPGoals:targetResults.filter(t=>t.error),compositionFindings,APFindings:report.findings,scopeRule:'Only actual target roles of land-scoped normal Chemistry views form goal/land pairs. Prerequisite-only roles and national aggregate membership do not become land target authority.'})
const pairsPin=write('TARGET-PAIRS.all-current-actual-ordinary-land-targets.json',{kind:'ACTUAL_UNMODIFIED_CHECKER_RESULTS',startedAtUTC,finishedAtUTC:new Date().toISOString(),ordinaryGoalIds:[...ordinary].sort(),allCurrentTargetLandPairs:targetResults,missingTargetLandPairs:missing,viewsReference:rolesPin,originalChemistryAPReport:apReportPin,sourceChecker:'app/scripts/sourceCoverageEvidence.ts#createReviewedRequiresClosureCoverageChecker + sourceCoverageSurrogateKey unchanged',sourceCheckerBoundary:'Technical direct provenance/mapping or active reviewed requires-closure chain only; not whole original clause/operative material mastery or human approval.'})
console.log(JSON.stringify({phase:'SOURCE_CHECK',ordinaryGoals:ordinary.size,pairs:targetResults.length,missingPairs:missing.length,directCovered:targetResults.filter(t=>t.directCoverage).length,reviewedClosureOnly:targetResults.filter(t=>t.coverageBacked&&!t.directCoverage).length,APErrors:report.summary.errors,APWarnings:report.summary.warnings,APDiagnostics:report.summary.diagnostics,goalsWithoutLandTargetRole:noLandTargets.length}))
// Measure the original pure atlas model. Only the two stale count assertions may be updated in a private in-memory config after the original model reports actual values.
const config=structuredClone(readGoalBookSourceAtlasInputConfig(A,resolve('.')))
const countAssertionMeasurements:any[]=[];let atlas:any;let atlasFatal:any=null
for(let attempt=0;attempt<3;attempt++){
 try{atlas=buildGoalBookSourceAtlasInputs(config,resolve('.'));break}
 catch(error){const e=error as any;const msg=String(e.message??e);const field=msg.startsWith('Source-scope uncertainty changed; inspect rather than guess')?'expectedUnresolvedScopeDecisionCount':msg.startsWith('Source-supported atlas goal count changed')?'expectedCurricularAtomicGoalCount':null
  if(!field||typeof e.actual!=='number'){atlasFatal={message:msg,name:e.name??null,code:e.code??null,actual:e.actual??null,expected:e.expected??null};console.log(JSON.stringify({phase:'ATLAS_FATAL',...atlasFatal}));break}
  countAssertionMeasurements.push({attempt:attempt+1,field,originalOrPriorInMemoryValue:config[field],actualReportedByUnmodifiedModel:e.actual,originalAssertionMessage:msg});console.log(JSON.stringify({phase:'ATLAS_COUNT_MEASUREMENT',...countAssertionMeasurements.at(-1)}));config[field]=e.actual
 }
}
let atlasSummary:any={originalConfigPath:A,originalConfigUnchanged:true,onlyPrivateCountAssertionsMeasured:countAssertionMeasurements,originalPureModelCompleted:!!atlas,fatal:atlasFatal,normalOutputsWritten:false}
let atlasReceiptPin:any=null
if(atlas){
 const outputPaths=Object.keys(atlas.outputs);const stockReceiptPath=atlasOriginal.outputDirectory+'/source-projection.receipt.json';const stock=existsSync(stockReceiptPath)?read(stockReceiptPath):null
 const compactBytes=atlas.outputs[stockReceiptPath];assert(typeof compactBytes==='string');const compactPath=O+'/ATLAS.original-pure-model.compact-receipt.json';assert(!existsSync(compactPath));writeFileSync(compactPath,compactBytes);read(compactPath);atlasReceiptPin=pin(compactPath)
 const byReason=Object.fromEntries([...new Set(atlas.receipt.omittedGoals.map((g:any)=>g.reason))].map(reason=>[String(reason),atlas.receipt.omittedGoals.filter((g:any)=>g.reason===reason).length]))
 atlasSummary={...atlasSummary,actualCounts:atlas.receipt.counts,stockReceiptCounts:stock?.counts??null,stockReceiptInputBindingCount:stock?.inputBindings?.length??null,omittedByReason:byReason,omittedGoals:atlas.receipt.omittedGoals,unresolvedSourceScopes:atlas.receipt.unresolvedSourceScopes,scopes:atlas.receipt.scopes.map((s:any)=>({key:s.key,goalCount:s.goalIds.length,witnessCount:s.witnesses.length,profileBasisCounts:Object.fromEntries([...new Set(s.witnesses.map((w:any)=>w.profileBasis))].map(k=>[String(k),s.witnesses.filter((w:any)=>w.profileBasis===k).length])),path:s.path})),derivedOutputCount:outputPaths.length,changedAgainstCurrentStockOutputPaths:outputPaths.filter(p=>!existsSync(p)||readFileSync(p,'utf8')!==atlas.outputs[p]),unchangedAgainstCurrentStockOutputPaths:outputPaths.filter(p=>existsSync(p)&&readFileSync(p,'utf8')===atlas.outputs[p]),allDerivedOutputDigests:outputPaths.map(path=>({path,sha256:createHash('sha256').update(atlas.outputs[path]).digest('hex'),bytes:Buffer.byteLength(atlas.outputs[path])})),originalCompactReceipt:atlasReceiptPin,originalReceiptClaims:atlas.receipt.claims}
 console.log(JSON.stringify({phase:'ATLAS_MEASURED',counts:atlas.receipt.counts,omittedByReason:byReason,derivedOutputCount:outputPaths.length,changedStockOutputs:atlasSummary.changedAgainstCurrentStockOutputPaths.length,privateCountMeasurements:countAssertionMeasurements.length}))
}
const atlasPin=write('ATLAS.actual-current-pure-derivation-measurement.json',atlasSummary)
const drift=scopeBeforePins.filter(p=>pin(p.path).sha256!==p.sha256)
const allInputPins=new Map(scopeBeforePins.map(p=>[p.path,p]))
for(const p of additionalAPInputs)allInputPins.set(p.path,p)
if(atlas)for(const b of atlas.receipt.inputBindings){const digest=b.sha256.replace(/^sha256:/,'');const p=existsSync(b.path)?pin(b.path):{path:b.path,sha256:digest,bytes:null,offlineSnapshotOnly:true};if(p.sha256!==digest)drift.push(p);allInputPins.set(p.path,p)}
const perLand=Object.fromEntries([...new Set(targetResults.map(t=>t.jurisdiction))].sort().map(j=>[j,{targetPairs:targetResults.filter(t=>t.jurisdiction===j).length,covered:targetResults.filter(t=>t.jurisdiction===j&&t.coverageBacked).length,missing:targetResults.filter(t=>t.jurisdiction===j&&!t.coverageBacked).length}]))
const summary={operation:'READ_ONLY_CURRENT_CHEMISTRY_TECHNICAL_SOURCE_COVERAGE_AND_PURE_ATLAS',startedAtUTC,finishedAtUTC:new Date().toISOString(),normalWrites:0,productionRulesChanged:false,ordinaryGoals:ordinary.size,normalChemistryViews:views.length,landScopedViewCoordinates:views.filter(v=>v.isLandTargetCoordinate).length,viewsContainingFormation70Target:views.filter(v=>v.ordinaryTargetGoalIds.includes('70b34ae7-4481-590c-9a02-516464750832')).length,actualUniqueTargetLandPairs:targetResults.length,sourceCoveredPairs:targetResults.filter(t=>t.coverageBacked).length,uncoveredTargetLandPairs:missing.length,directCoveredPairs:targetResults.filter(t=>t.directCoverage).length,reviewedClosureOnlyCoveredPairs:targetResults.filter(t=>t.coverageBacked&&!t.directCoverage).length,ordinaryGoalsWithoutLandTarget:noLandTargets.length,APErrors:report.summary.errors,APWarnings:report.summary.warnings,APDiagnostics:report.summary.diagnostics,compositionErrors:compositionFindings.filter(f=>f.severity==='error').length,compositionWarnings:compositionFindings.filter(f=>f.severity==='warning').length,surrogateRegistryTotalEntries:registry.entries.length,chemistrySurrogateEntries:surrogateEntries.length,perLand,atlasCounts:atlas?.receipt?.counts??null,atlasFatal,concurrentCriticalInputDrift:drift,otherSubjectReportsRetainedOrAnalyzed:0,globalProductionAPIndexLoadingDisclosed:true,scopeAndCoverageBoundary:'Fresh scope comes solely from current production Chemistry role collector/compiler. No454/3701/historical hash scope or old target verdict reused. Production AP function has no subject option and loads its dependency index globally; only Chemistry report was retained/analyzed. No whole-source scientific acceptance, native D/P/A/M/V, learner execution, human approval or M7 inferred.',outputs:{roles:rolesPin,pairs:pairsPin,missingAndFindings:missingPin,APReport:apReportPin,atlasMeasurement:atlasPin,atlasCompactReceipt:atlasReceiptPin}}
write('INPUTS.actual-used-paths-hashes-and-measurement-cut.json',{startedAtUTC,finishedAtUTC:summary.finishedAtUTC,inputPins:[...allInputPins.values()].sort((a,b)=>a.path.localeCompare(b.path)),additionalAPInputPathsCapturedAfterRead:additionalAPInputs.map(p=>p.path),criticalBeforePinsVerifiedStable:drift.length===0,drift,codeEntryPoints:['buildApplicabilityCompilation','collectCompositionProjectionRoleGoalIds','compileCompositionView','createReviewedRequiresClosureCoverageChecker','sourceCoverageSurrogateKey','buildGoalBookSourceAtlasInputs'],noHistoricalScopePinsReused:true,privateCountAssertionMeasurements:countAssertionMeasurements})
const sumPin=write('SUMMARY.actual-current-chemistry-source-coverage.json',summary)
console.log(JSON.stringify({phase:'DONE',summary:sumPin,...Object.fromEntries(Object.entries(summary).filter(([k,v])=>typeof v==='number'||typeof v==='boolean'||v===null)),perLand,atlasCounts:summary.atlasCounts,concurrentCriticalInputDrift:drift.length}))
if(drift.length)process.exitCode=2
