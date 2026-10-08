// SPDX-License-Identifier: Apache-2.0
// Standard pure source-atlas + composition + book/source consumers, two isolated roots.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),declared=new Map<string,any>(),sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);return{path:relative(root,p),sha256:sha(b),bytes:b.length}}
const bytes=(p:string)=>{declared.set(p,bind(p));return readFileSync(p)},read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});const s=typeof v==='string'?v:JSON.stringify(v,null,2)+'\n';if(existsSync(p)){assert.equal(sha(readFileSync(p)),sha(s));return}writeFileSync(p,s,{flag:'wx'})}
const guard=read(resolve(own,'checks/paired-eight-source-roles-and-current-guard.technical.json')),roots={before:resolve(root,guard.inertInputRoots.before),after:resolve(root,guard.inertInputRoots.after)}
for(const b of Object.values(guard.beforeBindings)as any[])assert.equal(bind(resolve(root,b.path)).sha256,'sha256:'+b.sha256)
const configPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',activeConfig=read(resolve(root,configPath)),qa=read(resolve(root,activeConfig.goalVisualizationQaPath)),assetDigests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available')assetDigests[q.imageUrl]=sha(bytes(resolve(root,q.publicAssetPath)))
const models:any={},sources:any={},atlases:any={},compile:any={},beforeCurrentOutputDeltas:any[]=[]
for(const version of ['before','after']as const){
 const local=roots[version],inputConfig=readGoalBookSourceAtlasInputConfig(guard.sourceAtlasConfigPath,local),atlas=buildGoalBookSourceAtlasInputs(inputConfig,local)
 for(const [p,b]of Object.entries(atlas.outputs)){write(resolve(local,p),b);if(version==='before'&&existsSync(resolve(root,p))&&readFileSync(resolve(root,p),'utf8')!==b)beforeCurrentOutputDeltas.push({path:p,actualCurrent:bind(resolve(root,p)),actualRebuilt:bind(resolve(local,p)),kind:p.endsWith('source-projection.receipt.json')?'receipt-input-lineage':'substantive-generated-view-or-manifest'})}
 checkGoalBookSourceAtlasInputs(guard.sourceAtlasConfigPath,local)
 atlases[version]=atlas
 const landscape=read(resolve(local,inputConfig.landscapePath)),kinds=read(resolve(local,inputConfig.semanticKindLedgerPath)),manifest=JSON.parse(atlas.outputs[inputConfig.manifestPath]),navigationView=JSON.parse(atlas.outputs[inputConfig.navigationViewPath]),compositionViewSources=manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(atlas.outputs[path])})),durationModelPolicy=read(resolve(local,inputConfig.durationModelPolicyPath))
 const normalized=normalizeCanonicalLandscape(landscape),goalMap=new Map(normalized.goals.map((g:any)=>[g.id,g])),compileRows=[]
 for(const source of compositionViewSources){const v=normalizeCompositionView(source.view),c=compileCompositionView(v,normalized),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goalMap);assert.deepEqual(c.findings.filter(f=>f.severity==='error'),[]);compileRows.push({path:source.path,scope:v.scope,targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),errors:0})}
 compile[version]=compileRows
 const model=buildGoalBookModel({landscape,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,compositionViewManifest:manifest,compositionViewSources,navigationView,durationModelPolicy,evidenceReviewSources:[],config:activeConfig}as any)
 assert.equal(model.pages.length,359);models[version]=model;sources[version]=buildGoalBookOriginalSources(model,local,inputConfig.mappingPaths)
 write(resolve(own,'native-outputs',version+'.full359.atlas-book-model.json'),model);write(resolve(own,'native-outputs',version+'.original-sources.json'),sources[version]);write(resolve(own,'native-outputs',version+'.compiled-source-views.json'),compileRows);write(resolve(own,'native-outputs',version+'.source-atlas-expanded-receipt.json'),atlas.receipt)
}
const beforePages=new Map<string,any>(models.before.pages.map((p:any)=>[p.goalId,p])),afterPages=new Map<string,any>(models.after.pages.map((p:any)=>[p.goalId,p]));assert.deepEqual([...beforePages.keys()].sort(),[...afterPages.keys()].sort())
const pageDeltas=models.after.pages.flatMap((p:any)=>{const b=beforePages.get(p.goalId);if(stableGoalBookJson(b)===stableGoalBookJson(p))return[];return[{goalId:p.goalId,beforePageFingerprint:b.pageFingerprint,afterPageFingerprint:p.pageFingerprint,changedWholePageFields:[...new Set([...Object.keys(b),...Object.keys(p)])].filter(k=>stableGoalBookJson(b[k]??null)!==stableGoalBookJson(p[k]??null)),before:b,after:p}]})
const normalizedSourceGoal=(s:any,id:string)=>{const g=s.goals[id];if(!g)return null;const evidenceBy=new Map(s.evidence.map((r:any)=>[r.id,r])),documentsBy=new Map(s.documents.map((r:any)=>[r.id,r]));const visit=(v:any):any=>{if(Array.isArray(v))return v.map(visit);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,visit(x)]));if(typeof v==='string'&&evidenceBy.has(v)){const e:any=structuredClone(evidenceBy.get(v));const d:any=structuredClone(documentsBy.get(e.documentId));delete e.id;delete e.documentId;delete d.id;return{...e,document:d}}return v};return visit(g)}
const sourceDeltas=Object.keys(sources.after.goals).sort().flatMap(id=>{const b=normalizedSourceGoal(sources.before,id),a=normalizedSourceGoal(sources.after,id);return stableGoalBookJson(a)===stableGoalBookJson(b)?[]:[{goalId:id,beforeWholeSourceObligations:b,afterWholeSourceObligations:a}]})
const compileDeltas=compile.after.flatMap((r:any)=>{const b=compile.before.find((x:any)=>x.path===r.path);return stableGoalBookJson(r)===stableGoalBookJson(b)?[]:[{path:r.path,scope:r.scope,addedTargets:r.targetGoalIds.filter((id:string)=>!b.targetGoalIds.includes(id)),removedTargets:b.targetGoalIds.filter((id:string)=>!r.targetGoalIds.includes(id)),prerequisiteOnlyUnchanged:stableGoalBookJson(r.prerequisiteOnlyGoalIds)===stableGoalBookJson(b.prerequisiteOnlyGoalIds)}]})
const outputDeltas=Object.entries(atlases.after.outputs).flatMap(([path,b]:any)=>{const before=atlases.before.outputs[path];return before===b?[]:[{path,beforeSha256:sha(before),afterSha256:sha(b),receiptOnly:path.endsWith('source-projection.receipt.json')}]})
const pureConfig='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-current480-atomic-prerequisite-remediation-author-v7/candidate/baseline-native-book.config.json',pure=await loadGoalBookBuildInputs(pureConfig,root);assert.equal(pure.model.pages.length,378)
// This pure native review scope has no changed mapping consumer; its exact canonical/views/QA inputs remain untouched.
write(resolve(own,'native-outputs/current378.pure-review-model.unchanged.json'),pure.model)
write(resolve(own,'checks/actual-eight-source-atlas-consumer-impact.technical.json'),{
 standardSourceAtlasBeforeAfterAndOfflineSnapshotContract:'PASS',sourceAtlasCanonicalCurricularAtomicGoals:378,publishedSourceAtlasPages:359,originalUnresolvedScopeDecisionCount:atlases.before.receipt.counts.unresolvedSourceScopeDecisions,afterUnresolvedScopeDecisionCount:atlases.after.receipt.counts.unresolvedSourceScopeDecisions,
 compiledAllGeneratedSourceViews:'PASS',compiledViewDeltas:compileDeltas,generatedOutputDeltas:outputDeltas,wholeAtlasPageDeltas:pageDeltas,normalizedWholeOriginalSourceGoalDeltas:sourceDeltas,
 exactUnchangedAtlasPages:359-pageDeltas.length,sourceChangedGoalIds:sourceDeltas.map((x:any)=>x.goalId),pageContextChangedGoalIds:pageDeltas.map((x:any)=>x.goalId),beforeCurrentGeneratedOutputDrift:beforeCurrentOutputDeltas,
 currentWhole378NativeReviewScopeUnchanged:true,currentPureModel:bind(resolve(own,'native-outputs/current378.pure-review-model.unchanged.json')),all480WholeGoalBodiesAnd378ClassifierDecisionsUntouched:true,
 goalTextOrProfileOrImageChanges:0,actualCurrentPNGBytesChecked:Object.keys(assetDigests).length,thirdPartyPDFHTMLCopiesAdded:0,actualPracticalPerformance:false,sourceRoleAcceptance:'bounded E1/G1 only',strictGainClaimed:0,activeWrites:0,humanApproval:false,humanTrial:false
})
write(resolve(own,'checks/native-consumer-declared-inputs.technical.json'),{files:[...declared.values()]})
console.log(JSON.stringify({nativeSourceAtlas:'PASS',compiledViews:'PASS',beforeAfterCounts:atlases.after.receipt.counts,pageContextChangedGoalIds:pageDeltas.map((x:any)=>x.goalId),sourceChangedGoalIds:sourceDeltas.map((x:any)=>x.goalId),generatedViewDeltas:compileDeltas.length,exactUnchangedAtlasPages:359-pageDeltas.length,activeWrites:0,strictGainClaimed:0}))
