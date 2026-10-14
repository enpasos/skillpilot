import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root=process.cwd()
const T='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-f85-BY-source-current406-targeted-native-one-technical-20261013-v1'
const F='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
const f85='f85b4651-50ea-5b42-b193-3465c05257a7'
const c0='c0c0f6e4-56be-5196-9408-20efc4504783'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,v:any)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),JSON.stringify(v,null,2)+'\n')}
const bind=(p:string)=>({path:p,sha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')})
const {buildApplicabilityCompilation}=await import(resolve(root,'app/scripts/applicabilityCompiler.ts'))
const {buildGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt}=await import(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts'))
const {loadGoalBookBuildInputs,writeGoalBookModel,canonicalGoalMatchesCourseProfile,GOAL_BOOK_ATLAS_COURSE_PROFILE_POLICY}=await import(resolve(root,'app/scripts/goalBookModel.ts'))

const fixture=read(T+'/CHECK.physical-source-fixture-and-original-CAS.actual.json')
copyFileSync(resolve(root,fixture.compilerBeforeMOPayload.path),resolve(root,fixture.compilerBeforeMOAddress))
const beforeCompiler=buildApplicabilityCompilation()
copyFileSync(resolve(root,fixture.compilerAfterMOPayload.path),resolve(root,fixture.compilerBeforeMOAddress))
const afterCompiler=buildApplicabilityCompilation()
const landscapeId='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const before=beforeCompiler.reports.find((x:any)=>x.landscapeId===landscapeId)!
const after=afterCompiler.reports.find((x:any)=>x.landscapeId===landscapeId)!
assert.ok(before&&after)
const compilerChanges=after.goals.flatMap((goal:any)=>{
 const prior=before.goals.find((x:any)=>x.goalId===goal.goalId)!
 const same=JSON.stringify(prior)===JSON.stringify(goal)
 return same?[]:[{goalId:goal.goalId,before:prior,after:goal,compiledApplicabilityChanged:JSON.stringify(prior.compiledApplicability)!==JSON.stringify(goal.compiledApplicability)}]
})
const beforeSourceConfig=read(T+'/configs/source-atlas.before.exact-pinned-final406.config.json')
const beforeSource=buildGoalBookSourceAtlasInputs(beforeSourceConfig,root)
const beforeUnion=new Set(beforeSource.receipt.scopes.flatMap((s:any)=>s.goalIds))
const afterSourceConfig=read(T+'/configs/source-atlas.after.only-f85-MO.config.json')
afterSourceConfig.expectedCurricularAtomicGoalCount=new Set([...beforeUnion,f85]).size
write(T+'/configs/source-atlas.after.only-f85-MO.config.json',afterSourceConfig)
const afterSource=buildGoalBookSourceAtlasInputs(afterSourceConfig,root)
for(const [p,bytes] of Object.entries(afterSource.outputs)){mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),bytes as string)}
const sourceChanges=afterSource.receipt.scopes.flatMap((s:any)=>{
 const prior=beforeSource.receipt.scopes.find((x:any)=>x.key===s.key)!
 const signature=(w:any)=>JSON.stringify({...w,mappingPath: w.mappingPath.includes('BY-MO.exact-whole-cell.portable-carrier.after.json') ? 'MO-BY-CARRIER' : w.mappingPath})
 // Mapping path is an exact technical transport. Compare science tuples separately.
 const normalized=(w:any)=>JSON.stringify({sourceExtractionPath:w.sourceExtractionPath,sourceGoalId:w.sourceGoalId,mappedTargetGoalId:w.mappedTargetGoalId,goalId:w.goalId,coverage:w.coverage,profileBasis:w.profileBasis,fallbackViewPath:w.fallbackViewPath??null})
 const old=new Set(prior.witnesses.map(normalized));const now=new Set(s.witnesses.map(normalized))
 const added=s.witnesses.filter((w:any)=>!old.has(normalized(w)));const removed=prior.witnesses.filter((w:any)=>!now.has(normalized(w)))
 return added.length||removed.length?[{key:s.key,added,removed,addedGoalIds:s.goalIds.filter((id:string)=>!prior.goalIds.includes(id)),removedGoalIds:prior.goalIds.filter((id:string)=>!s.goalIds.includes(id))}]:[]
})
assert.ok(sourceChanges.every((s:any)=>s.key.startsWith('DE-BY/SekII/')&&s.added.every((w:any)=>w.goalId===f85)&&s.removed.length===0))
const rawF85Scopes=afterSource.receipt.scopes.filter((s:any)=>s.goalIds.includes(f85)).map((s:any)=>({key:s.key,witnesses:s.witnesses.filter((w:any)=>w.goalId===f85)}))
const currentCanonical=read(T+'/candidate/canonical531.current406.final-resources.inactive.json')
const currentGoal=currentCanonical.goals.find((g:any)=>g.id===f85)
assert.deepEqual(currentGoal.tags,['LK'])
const bookCfg=read(T+'/configs/whole406.f85-source-overlay.inactive.config.json')
const atlasConfig={...bookCfg,bookId:'chemie-current406-f85-BY-effective-source-scope-proof',title:'Chemie – tatsächliche Quellensicht mit kanonischen Kursmarkern',compositionViewManifestPath:afterSourceConfig.manifestPath,atlasCourseProfilePolicy:GOAL_BOOK_ATLAS_COURSE_PROFILE_POLICY,outputPath:T+'/models/source-atlas-effective-f85-scope.private-proof.json'}
delete atlasConfig.compositionViewPath
write(T+'/configs/source-atlas-effective-scope.stock-book.config.json',atlasConfig)
const effectiveAtlas=await loadGoalBookBuildInputs(T+'/configs/source-atlas-effective-scope.stock-book.config.json',root)
const effectivePage=effectiveAtlas.model.pages.find((p:any)=>p.goalId===f85)!
assert.ok(effectivePage)
const effectiveScopes=effectivePage.applicability??[]
assert.ok(effectiveScopes.every((s:any)=>s.jurisdiction==='DE-BY'&&s.scopes.every((x:any)=>x.stage==='SekII'&&x.courseProfile==='LK')))
const loaded=await loadGoalBookBuildInputs(T+'/configs/whole406.f85-source-overlay.inactive.config.json',root)
await writeGoalBookModel(loaded.model,loaded.outputPath)
const original=read(F+'/models/whole406.final-resource-P7.stock-book-model.inactive.json')
const pageChanges=loaded.model.pages.flatMap((p:any)=>{
 const old=original.pages.find((x:any)=>x.goalId===p.goalId)
 return JSON.stringify(old)===JSON.stringify(p)?[]:[{goalId:p.goalId,beforePageFingerprint:old?.pageFingerprint,afterPageFingerprint:p.pageFingerprint,beforeGoalFingerprint:old?.goalFingerprint,afterGoalFingerprint:p.goalFingerprint}]
})
write(T+'/checks/actual-normal-compiler-source-and-native-context-impact.json',{
 schemaVersion:1,stockAPIs:[bind('app/scripts/applicabilityCompiler.ts'),bind('app/scripts/goalBookSourceAtlasInputs.ts'),bind('app/scripts/goalBookModel.ts')],
 compilerBeforeSummary:before.summary,compilerAfterSummary:after.summary,compilerChanges,
 compilerFindingsBefore:before.findings.filter((x:any)=>[f85,c0].includes(x.goalId)),compilerFindingsAfter:after.findings.filter((x:any)=>[f85,c0].includes(x.goalId)),
 sourceAtlasBeforeCounts:beforeSource.receipt.counts,sourceAtlasAfterCounts:afterSource.receipt.counts,sourceChanges,
 rawF85SourceScopes:rawF85Scopes,effectiveF85PublishedScopes:effectiveScopes,
 actualStockCanonicalGKFilter:canonicalGoalMatchesCourseProfile(currentGoal,'GK'),actualStockCanonicalLKFilter:canonicalGoalMatchesCourseProfile(currentGoal,'LK'),
 rawNativeGAEAOccurrencesRetained:true,rawSourceGKWitnessIsNotAutomaticTechnicalGKTargetEntitlement:true,
 canonicalGoalObjectsChanged:[],sourceOnlyOverlay:true,retainedC0FullOperators:currentCanonical.goals.find((g:any)=>g.id===c0),
 fullReviewModelPages:loaded.model.pages.length,fullReviewPageChanges:pageChanges,
 currentF85WholePage:loaded.model.pages.find((p:any)=>p.goalId===f85),effectiveSourceAtlasF85WholePage:effectivePage,
 semanticCountUnchanged406:true,newScientificVotes:0,newStrictClaim:false,activeWrites:false,
 currentHistoricalOtherStateCanonicalApplicabilityIsNotCertifiedByNewBYSource:true,
 sourceCoverageUnionNotWholeF85CoversWholeSourceRow:true
})
write(T+'/checks/stock-source-generated-output-bindings.actual.json',{logicalBookLocalOutputs:afterSource.receipt.outputBindings,actualSourceReceipt:compactGoalBookSourceAtlasReceipt(afterSource.receipt),losslessStockCompactReceipt:true,ownRootCopiesAreTechnicalCompanionsOnly:true})
console.log(JSON.stringify({compilerBefore:before.summary,compilerAfter:after.summary,compilerChangedGoalIds:compilerChanges.map((x:any)=>x.goalId),sourceBefore:beforeSource.receipt.counts,sourceAfter:afterSource.receipt.counts,changedSourceScopes:sourceChanges.map((x:any)=>x.key),effectiveF85Scopes:effectiveScopes,fullReviewPageChanges:pageChanges.length,fullReviewPages:loaded.model.pages.length}))
