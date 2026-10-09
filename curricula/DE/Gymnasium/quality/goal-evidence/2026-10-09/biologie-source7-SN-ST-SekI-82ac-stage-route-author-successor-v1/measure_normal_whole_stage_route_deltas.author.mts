// SPDX-License-Identifier: Apache-2.0
// Actual ordinary data/compiler/source-atlas/native-model measurements; no science approval.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),ID='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1',BASIC='26aa47b7-e5cc-5131-8980-0ec3271758b6',B=`${P}/../biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1`,N=`${P}/../biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1`
const sha=(x:any)=>'sha256:'+createHash('sha256').update(x).digest('hex'),read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const bind=(p:string)=>{const f=resolve(R,p),b=readFileSync(f);return {path:relative(R,f),sha256:sha(b),bytes:b.length}}
const put=(p:string,x:any)=>{const f=resolve(D,p);mkdirSync(dirname(f),{recursive:true});const bytes=typeof x==='string'?x:JSON.stringify(x,null,2)+'\n';if(existsSync(f))assert.equal(readFileSync(f,'utf8'),bytes,'Frozen owned output differs: '+f);else writeFileSync(f,bytes);return bind(relative(R,f))}
const beforeCfg=read(`${P}/inputs/full394-only16.normal-source-atlas.config.exact.json`),afterCfg=read(`${P}/candidate/full394-source-atlas.without82ac-SN-ST-SekI-target.inputs.json`),book=read(`${P}/inputs/full394-only16.normal-book.config.exact.json`),canonical=read(book.landscapePath),kinds=read(book.semanticKindLedgerPath),qa=read(book.goalVisualizationQaPath)
const canonicalNormalized=normalizeCanonicalLandscape(canonical),goalMap=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])),viewRows=[]
for(const state of ['SN','ST'])for(const variant of ['active','source7']){
 const oldPath=`${P}/inputs/views/${state}-${variant}.whole.exact.json`,newPath=`${P}/candidate/views/${state}-${variant}.whole.without82ac-SekI-target.json`
 const raw0=read(oldPath),raw1=read(newPath),nv0=normalizeCompositionView(raw0),nv1=normalizeCompositionView(raw1),f0=compileCompositionView(nv0,canonicalNormalized).findings,f1=compileCompositionView(nv1,canonicalNormalized).findings
 assert.deepEqual(f0.filter((x:any)=>x.severity==='error'),[]);assert.deepEqual(f1.filter((x:any)=>x.severity==='error'),[])
 const a=collectCompositionProjectionRoleGoalIds(nv0.rootNodes,goalMap),b=collectCompositionProjectionRoleGoalIds(nv1.rootNodes,goalMap)
 assert.ok(a.targetGoalIds.has(ID)&&!b.targetGoalIds.has(ID)&&!b.prerequisiteOnlyGoalIds.has(ID));assert.ok(a.targetGoalIds.has(BASIC)&&b.targetGoalIds.has(BASIC))
 assert.deepEqual([...a.targetGoalIds].filter(x=>x!==ID).sort(),[...b.targetGoalIds].sort());assert.deepEqual(a.prerequisiteOnlyGoalIds,b.prerequisiteOnlyGoalIds)
 const directDependentTargets=canonical.goals.filter((g:any)=>b.targetGoalIds.has(g.id)&&(g.requires??[]).includes(ID)).map((g:any)=>({wholeGoal:g,actualSekITarget:true,wholeGoalTags:g.tags,remainingSeparateStageScopeIssue:true}))
 viewRows.push({state,variant,before:bind(oldPath),after:bind(newPath),beforeTargetCount:a.targetGoalIds.size,afterTargetCount:b.targetGoalIds.size,removedTargetIds:[ID],addedTargetIds:[],afterPrerequisiteOnlyIds:[...b.prerequisiteOnlyGoalIds],allOtherTargetsExact:true,beforeFindings:f0,afterFindings:f1,stillExistingHigherStageDependentTargetsOutside82acFix:directDependentTargets})
}
put('checks/four-actual-ordinary-learner-compiler-projections.actual.json',{schemaVersion:1,normalCompiler:'compileCompositionView+collectCompositionProjectionRoleGoalIds',views:viewRows,newPrerequisiteRoles:0,sourceOperatorClosureClaimed:false})
const atlases=[buildGoalBookSourceAtlasInputs(beforeCfg,R),buildGoalBookSourceAtlasInputs(afterCfg,R)]
for(const a of atlases){assert.equal(a.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(a.receipt.counts.publishedCurricularAtomicGoals,394);assert.equal(a.receipt.counts.unresolvedSourceScopeDecisions,0)}
assert.deepEqual(Object.keys(atlases[0].outputs).sort(),Object.keys(atlases[1].outputs).sort())
const sourceDiffs=[],transports=[]
for(let i=0;i<2;i++){
 const cfg=i?afterCfg:beforeCfg,built=atlases[i],stage=i?'after':'before',cap=mkdtempSync(resolve(tmpdir(),'skillpilot-bio82ac-source-atlas-'))
 const copy=(p:string)=>{if(!existsSync(resolve(R,p)))return;const d=resolve(cap,p);mkdirSync(dirname(d),{recursive:true});cpSync(resolve(R,p),d)}
 const copyDocumentPaths=(x:any)=>{if(x&&typeof x==='object')for(const [k,v]of Object.entries(x)){if(typeof v==='string'&&['path','localPath'].includes(k)&&v.startsWith('curricula/')&&existsSync(resolve(R,v)))copy(v);else if(typeof v==='object')copyDocumentPaths(v)}}
 for(const p of [cfg.landscapePath,cfg.semanticKindLedgerPath,cfg.durationModelPolicyPath])copy(p)
 for(const p of cfg.mappingPaths){copy(p);const m=read(p);copy(m.sourceExtractionPath);copyDocumentPaths(read(m.sourceExtractionPath))}
 for(const p of cfg.courseProfileFallbackViewPaths??[])copy(p)
 const configPath=`${P}/source-atlas/${stage}.actual-ordinary-inputs.config.json`;mkdirSync(dirname(resolve(cap,configPath)),{recursive:true});writeFileSync(resolve(cap,configPath),JSON.stringify(cfg,null,2)+'\n');put(`source-atlas/${stage}.actual-ordinary-inputs.config.json`,cfg)
 const outputs=[]
 for(const [p,bytes]of Object.entries(built.outputs)){
  mkdirSync(dirname(resolve(cap,p)),{recursive:true});writeFileSync(resolve(cap,p),bytes)
  outputs.push({normalIsolatedOutputPath:p,portableExactArchive:put(`source-atlas/${stage}-normal-exact-output-archive/${p}`,bytes)})
  if(i&&atlases[0].outputs[p]!==bytes)sourceDiffs.push({path:p,beforeSha256:sha(atlases[0].outputs[p]),afterSha256:sha(bytes),beforeWholeJSON:JSON.parse(atlases[0].outputs[p]),afterWholeJSON:JSON.parse(bytes)})
 }
 const checked=checkGoalBookSourceAtlasInputs(configPath,cap);assert.deepEqual(checked.receipt.counts,built.receipt.counts)
 const scopeRoles=checked.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds,contains82ac:s.goalIds.includes(ID),contains26aa:s.goalIds.includes(BASIC),whole82acWitnesses:s.witnesses.filter((w:any)=>w.goalId===ID)}))
 if(i){for(const state of ['SN','ST'])assert.equal(scopeRoles.find((s:any)=>s.key===`DE-${state}/SekI/`)!.contains82ac,false)}
 transports.push({stage,actualNormalConfig:bind(configPath),outputs,wholeReceipt:put(`source-atlas/${stage}.whole-ordinary-receipt.actual.json`,checked.receipt),scopeRoles,capsulePathDiagnosticOnly:cap,actualCheckExitCode:0})
}
const oldScope=new Map(atlases[0].receipt.scopes.map((s:any)=>[s.key,s])),newScope=new Map(atlases[1].receipt.scopes.map((s:any)=>[s.key,s]))
const fullScopeDiffs=[]
for(const [key,a]of oldScope){const b:any=newScope.get(key);const removed=a.goalIds.filter((x:string)=>!b.goalIds.includes(x)),added=b.goalIds.filter((x:string)=>!a.goalIds.includes(x));if(removed.length||added.length)fullScopeDiffs.push({key,removedGoalIds:removed,addedGoalIds:added});if(String(key).includes('/SekII/'))assert.deepEqual(a.goalIds,b.goalIds)}
assert.deepEqual(fullScopeDiffs.map(x=>x.key).sort(),['DE-SN/SekI/','DE-ST/SekI/']);assert.ok(fullScopeDiffs.every(x=>x.removedGoalIds.length===1&&x.removedGoalIds[0]===ID&&x.addedGoalIds.length===0))
const selected=new Set<string>(read(`${B}/sixteen-technical-input-FIRST.freeze.json`).selected16GoalIds),rasterBindings=read(`${N}/neutral-current17-and-protected-contexts.native-independent-review.final.entry.json`).rasterBindings,digests:Record<string,string>={},assetBindings=[]
for(const row of qa.records)if(row.visualizationState==='available'){const p=selected.has(row.goalId)?rasterBindings.find((x:any)=>x.goalId===row.goalId).portableAlias.path:row.publicAssetPath;const b=bind(p);assert.equal(b.sha256,row.assetSha256);digests[row.imageUrl]=b.sha256;assetBindings.push({goalId:row.goalId,imageUrl:row.imageUrl,...b})}
const models=atlases.map((a,i)=>{const cfg=i?afterCfg:beforeCfg,js=(p:string)=>JSON.parse(a.outputs[p]),manifest=js(cfg.manifestPath);const m=buildGoalBookModel({landscape:canonical,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:js(p)})),navigationView:js(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),evidenceReviewSources:[],config:book});parseAndValidateGoalBookModel(m);assert.equal(m.pages.length,394);return m})
assert.equal(stableGoalBookJson(models[0]),stableGoalBookJson(read(`${P}/inputs/full394-only16.normal-model.exact.json`)))
put('native/full394-before.normal-model.actual.json',models[0]);put('native/full394-after82ac-route.normal-model.actual.json',models[1])
const pageDiffs=models[0].pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(models[1].pages.find((q:any)=>q.goalId===p.goalId))).map((p:any)=>({goalId:p.goalId,beforeWholePage:p,afterWholePage:models[1].pages.find((q:any)=>q.goalId===p.goalId)}))
assert.ok(pageDiffs.some((p:any)=>p.goalId===ID))
const source16GoalIds=[...selected],changedReviewContexts=pageDiffs.map((p:any)=>({goalId:p.goalId,withinReviewed16:source16GoalIds.includes(p.goalId),newSemanticGoalReview:false,sourceOrPageBindingReviewRequired:true}))
put('native/whole394-actual-source-scope-and-native-page.diff.json',{schemaVersion:1,exactB16BaselineModelRetained:true,currentWholeGoalBodiesChanged:[],currentKindsChanged:[],currentRelationsChanged:[],fullSourceScopeDiffs:fullScopeDiffs,exactAllSekIIGoalTargetsRetained:true,actualChangedWholePages:pageDiffs,actualChangedPageIds:pageDiffs.map((p:any)=>p.goalId),actualChangedReviewContexts:changedReviewContexts,expectedPrior82acAnd2ae2AreNotAssumedComplete:true,assetBindings,whole394TargetUniversePreserved:true,strictGain:0,humanApproval:false})
put('checks/completed-normal-full394-source-atlas-and-stage-route.actual.json',{schemaVersion:1,ordinaryAtlasRuns:transports,actualGeneratedOutputChanges:sourceDiffs,whole394BeforeAfterNormalModelValid:true,exactB16Baseline:true,normalLearnerViewsCompiled:4,allSekIIGoalTargetsExact:true,normalSourceScopeDeltas:fullScopeDiffs,actualChangedPageIds:pageDiffs.map((p:any)=>p.goalId),whole479BodiesAnd394KindsExact:true,currentStrict299Untouched:true,authorScienceApproval:false,independentApproval:false,humanApproval:false,activeWrites:0,strictGain:0})
console.log(JSON.stringify({wholeModels:394,wholeCanonical:479,normalLearnerViews:4,normalSourceAtlasTerminals:2,SNandSTSekIRemoved:[ID],actualChangedPageIds:pageDiffs.map((p:any)=>p.goalId),SekIITargetChanges:0,activeWrites:0,strictGain:0}))
