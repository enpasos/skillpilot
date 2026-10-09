// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),H='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1',Q='328fd9d3-d3c3-5731-a8da-a909143d3962'
const B=resolve(D,'../biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1'),N=resolve(D,'../biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1')
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8')),sha=(b:any)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const f=resolve(R,p),b=readFileSync(f);return {path:relative(R,f),sha256:sha(b),bytes:b.length}}
const put=(n:string,x:any)=>{const f=resolve(D,n);mkdirSync(dirname(f),{recursive:true});const b=typeof x==='string'?x:JSON.stringify(x,null,2)+'\n';if(existsSync(f))assert.equal(readFileSync(f,'utf8'),b,'Frozen owned output differs: '+f);else writeFileSync(f,b);return bind(f)}
const configs=[read(`${P}/inputs/whole394-narrow-SNST-source-atlas.exact.config.json`),read(`${P}/candidate/whole394-source-atlas.primary-locators-and-one-prerequisite.inactive.config.json`)]
const books=[read(`${P}/inputs/whole394-before-book.exact.config.json`),read(`${P}/candidate/whole394-after-book.inactive.config.json`)]
const canons=[read(`${P}/inputs/whole479-before.exact.json`),read(`${P}/candidate/whole479-one-digital-prerequisite-removed.inactive.json`)],kinds=read(`${P}/inputs/whole394-kinds.exact.json`),qa=read(`${P}/inputs/whole394-qa.exact.json`)
const afterKinds=JSON.parse(JSON.stringify(kinds));afterKinds.sourceLandscapePath=configs[1].landscapePath;afterKinds.decisions.find((d:any)=>d.goalId===Q).sourceFingerprint=fingerprintSemanticKindSourceGoal(canons[1].goals.find((g:any)=>g.id===Q))
const technicalKinds=put('candidate/whole394-kinds.one-requires-technical-binding.inactive.json',afterKinds)
configs[1].semanticKindLedgerPath=technicalKinds.path;books[1].semanticKindLedgerPath=technicalKinds.path
for(const state of ['BB','BE','NI']){
 const primary=read(`${P}/candidate/source-extractions/${state}-whole-primary-locator.inactive.json`).sourceDocument.path
 const old=configs[1].sourceDocumentSnapshots.find((s:any)=>s.path===read(`${P}/inputs/${state}-whole-operative.extraction.exact.json`).sourceDocument.path);assert.ok(old);old.path=primary
}
put('candidate/whole394-final-normal-source-atlas.inactive.config.json',configs[1]);put('candidate/whole394-final-normal-book.inactive.config.json',books[1])
put('checks/necessary-kind-fingerprint-technical-delta.actual.json',{schemaVersion:1,wholeBefore:kinds,wholeAfter:afterKinds,semanticClassificationsExact:true,onlyOneRequiresFingerprintRecomputed:true,scientificApproval:false})
const atlases=configs.map(c=>buildGoalBookSourceAtlasInputs(c,R)),atlasRuns=[]
for(let i=0;i<2;i++){
 const stage=i?'after':'before',cfg=configs[i],built=atlases[i],cap=mkdtempSync(resolve(tmpdir(),'skillpilot-bio-whole2-source-prereq-'))
 const copy=(p:string)=>{const src=resolve(R,p);if(!existsSync(src))return;const dest=resolve(cap,p);mkdirSync(dirname(dest),{recursive:true});cpSync(src,dest)}
 const paths=(x:any)=>{if(x&&typeof x==='object')for(const [k,v]of Object.entries(x)){if(typeof v==='string'&&['path','localPath','sourcePath'].includes(k)&&v.startsWith('curricula/')&&existsSync(resolve(R,v)))copy(v);else if(typeof v==='object')paths(v)}}
 for(const p of [cfg.landscapePath,cfg.semanticKindLedgerPath,cfg.durationModelPolicyPath])copy(p)
 for(const p of cfg.mappingPaths){copy(p);const m=read(p);copy(m.sourceExtractionPath);paths(read(m.sourceExtractionPath))}
 for(const p of cfg.courseProfileFallbackViewPaths??[])copy(p)
 for(const s of cfg.sourceDocumentSnapshots??[])copy(s.path)
 const actualConfig=put(`source-atlas/${stage}.normal-input.config.json`,cfg);mkdirSync(dirname(resolve(cap,actualConfig.path)),{recursive:true});cpSync(resolve(R,actualConfig.path),resolve(cap,actualConfig.path))
 const outputs=[]
 for(const [p,b]of Object.entries(built.outputs)){mkdirSync(dirname(resolve(cap,p)),{recursive:true});writeFileSync(resolve(cap,p),b);outputs.push({normalOutputPath:p,portableExactArchive:put(`source-atlas/${stage}-normal-exact-output-archive/${p}`,b)})}
 const checked=checkGoalBookSourceAtlasInputs(actualConfig.path,cap);assert.equal(checked.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals,394);assert.equal(checked.receipt.counts.unresolvedSourceScopeDecisions,0)
 atlasRuns.push({stage,actualConfig,normalExitCode:0,wholeReceipt:put(`source-atlas/${stage}.whole-normal-receipt.actual.json`,checked.receipt),outputs,capsulePathDiagnosticOnly:cap})
}
const scopes=atlases[0].receipt.scopes.map((s:any)=>({key:s.key,beforeGoalIds:s.goalIds,afterGoalIds:atlases[1].receipt.scopes.find((t:any)=>s.key===t.key)!.goalIds}));assert.ok(scopes.every(s=>JSON.stringify(s.beforeGoalIds)===JSON.stringify(s.afterGoalIds)))
const selected=new Set<string>(read(resolve(B,'sixteen-technical-input-FIRST.freeze.json')).selected16GoalIds),raster=read(resolve(N,'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json')).rasterBindings,digests:Record<string,string>={},assets=[]
for(const row of qa.records)if(row.visualizationState==='available'){const p=selected.has(row.goalId)?raster.find((x:any)=>x.goalId===row.goalId).portableAlias.path:row.publicAssetPath,b=bind(p);assert.equal(b.sha256,row.assetSha256);digests[row.imageUrl]=b.sha256;assets.push({goalId:row.goalId,imageUrl:row.imageUrl,...b})}
const models=atlases.map((a,i)=>{const cfg=configs[i],js=(p:string)=>JSON.parse(a.outputs[p]),manifest=js(cfg.manifestPath);const m=buildGoalBookModel({landscape:canons[i],semanticKindLedger:i?afterKinds:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:js(p)})),navigationView:js(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),evidenceReviewSources:[],config:books[i]});parseAndValidateGoalBookModel(m);assert.equal(m.pages.length,394);return m})
assert.equal(stableGoalBookJson(models[0]),stableGoalBookJson(read(`${P}/inputs/full394-narrow-SNST-after.normal-model.exact.json`)))
put('native/full394-before.normal-model.actual.json',models[0]);put('native/full394-after-source-locator-and-requires.normal-model.actual.json',models[1])
const deltas=models[0].pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(models[1].pages.find((q:any)=>q.goalId===p.goalId))).map((p:any)=>({goalId:p.goalId,beforeWholePage:p,afterWholePage:models[1].pages.find((q:any)=>q.goalId===p.goalId)}))
assert.deepEqual(deltas.map((x:any)=>x.goalId).sort(),[H,Q].sort())
put('native/exact-whole394-native-page-and-relation-deltas.actual.json',{schemaVersion:1,actualChangedPages:deltas,actualChangedPageIds:deltas.map((x:any)=>x.goalId),other392WholePagesExact:true,allSourceAtlasTargetRolesExact:true,allSourceAtlasScopeGoalSets:scopes,wholeCanonicalGoals:479,newGoals:0,newImages:0,oneCanonicalRequiresEdgeRemoved:true,wholeSourceAtlasScopesDoNotProveScientificCoverage:true,unchangedRasterBindings:assets})
const views=[]
for(const state of ['SN','ST'])for(const variant of ['active','source7']){
 const p=`${P}/inputs/views/${state}-${variant}.whole-narrow-proposed.exact.json`,v=normalizeCompositionView(read(p));const checks=canons.map(c=>{const gm=new Map<string,any>(c.goals.map((g:any)=>[g.id,g])),compiled=compileCompositionView(v,normalizeCanonicalLandscape(c)),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,gm);assert.deepEqual(compiled.findings.filter((f:any)=>f.severity==='error'),[]);return {findings:compiled.findings,targetGoalIds:[...roles.targetGoalIds],prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds],wholeDigitalGoal:c.goals.find((g:any)=>g.id===Q),wholeHypothesisGoal:c.goals.find((g:any)=>g.id===H)}})
 assert.deepEqual(checks[0].targetGoalIds,checks[1].targetGoalIds);assert.ok(checks[1].targetGoalIds.includes(Q)&&!checks[1].targetGoalIds.includes(H));assert.ok(!checks[1].wholeDigitalGoal.requires.includes(H))
 views.push({state,variant,wholeUnchangedView:bind(p),before:checks[0],candidateAfter:checks[1],fabricatedProjectionRoles:0,activeViewWrites:0})
}
put('checks/completed-normal-two-atlases-four-views-and-whole394-models.actual.json',{schemaVersion:1,atlasRuns,whole394ModelsNormalValid:true,actualChangedPageIds:deltas.map((x:any)=>x.goalId),other392WholePagesExact:true,allSourceAtlasTargetGoalSetsExact:true,allFourUnchangedLearnerViewsCompiled:views,authorScienceApproval:false,independentApproval:false,humanApproval:false,strictGain:0,activeWrites:0})
console.log(JSON.stringify({fullModels:394,wholeCanonical:479,normalSourceAtlases:2,normalLearnerViews:4,actualChangedPageIds:deltas.map((x:any)=>x.goalId),sourceTargetsChanged:0,strictGain:0,activeWrites:0}))
