// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {tmpdir} from 'node:os'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),B=resolve(D,'../biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1')
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8')),bind=(p:string)=>{const f=resolve(R,p),b=readFileSync(f);return {path:relative(R,f),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(n:string,x:any)=>{const f=resolve(D,n);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');return bind(f)}
const cfg=read(P+'/candidate/normal-source-atlas-primary-operator-rationale-only-v2.inactive.inputs.json'),built=buildGoalBookSourceAtlasInputs(cfg,R),cap=mkdtempSync(resolve(tmpdir(),'skillpilot-rationale-source2-whole394-'))
const copy=(p:string)=>{const src=resolve(R,p),dest=resolve(cap,p);mkdirSync(dirname(dest),{recursive:true});cpSync(src,dest)}
for(const p of [cfg.landscapePath,cfg.semanticKindLedgerPath,cfg.durationModelPolicyPath])copy(p)
for(const p of cfg.mappingPaths){copy(p);const m=read(p);copy(m.sourceExtractionPath);const e=read(m.sourceExtractionPath);for(const doc of [e.sourceDocument,...(e.sourceDocuments??[])])if(doc?.path)copy(doc.path)}
for(const p of cfg.courseProfileFallbackViewPaths??[])copy(p)
for(const s of cfg.sourceDocumentSnapshots)copy(s.path)
const configPath=P+'/candidate/normal-source-atlas-primary-operator-rationale-only-v2.inactive.inputs.json';copy(configPath)
const outputs=[]
for(const [p,text]of Object.entries(built.outputs)){mkdirSync(dirname(resolve(cap,p)),{recursive:true});writeFileSync(resolve(cap,p),text);outputs.push({normalPlannedOutputPath:p,portableExactOutput:put('normal-exact-output-archive/'+p,text)})}
const checked=checkGoalBookSourceAtlasInputs(configPath,cap);assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals,394);assert.equal(checked.receipt.counts.unresolvedSourceScopeDecisions,0)
const old=read(resolve(B,'native/full394-after-source-locator-and-requires.normal-model.actual.json')),delta=read(resolve(B,'native/exact-whole394-native-page-and-relation-deltas.actual.json')),digests:Record<string,string>={}
for(const a of delta.unchangedRasterBindings)digests[a.imageUrl]=a.sha256
const js=(p:string)=>JSON.parse(built.outputs[p]),manifest=js(cfg.manifestPath),model=buildGoalBookModel({landscape:read(cfg.landscapePath),semanticKindLedger:read(cfg.semanticKindLedgerPath),goalVisualizationQa:read(resolve(B,'inputs/whole394-qa.exact.json')),goalVisualizationAssetDigests:digests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:js(p)})),navigationView:js(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),evidenceReviewSources:[],config:read(resolve(B,'candidate/whole394-final-normal-book.inactive.config.json'))})
parseAndValidateGoalBookModel(model);assert.equal(model.pages.length,394);assert.equal(stableGoalBookJson(model),stableGoalBookJson(old),'All394 native page/context/fingerprint values must remain exact')
put('whole394-rationale-only-after.normal-model.actual.json',model)
put('normal-rationale-only-source-atlas.whole-receipt.actual.json',checked.receipt)
put('normal-rationale-only-source-path-and-whole394-page-exactness.actual.json',{schemaVersion:1,normalConfig:bind(configPath),normalExitCode:0,whole394OldModel:bind(resolve(B,'native/full394-after-source-locator-and-requires.normal-model.actual.json')),whole394AfterModel:bind(resolve(D,'whole394-rationale-only-after.normal-model.actual.json')),all394WholeNativePagesContextsAndFingerprintsExact:true,changedNativePageIds:[],wholeTwoGoalAndPInputsExact:true,sourceAtlasStructuralReceipt:bind(resolve(D,'normal-rationale-only-source-atlas.whole-receipt.actual.json')),outputs,capsulePathDiagnosticOnly:cap,scientificApproval:false,humanApproval:false,strictGain:0,activeWrites:0})
console.log(JSON.stringify({normalSourceAtlasExit:0,normalWhole394ModelExit:0,all394NativePagesExact:true,actualChangedPageIds:[],newScientificApproval:false,strictGain:0,activeWrites:0}))
