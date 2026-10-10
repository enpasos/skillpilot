// SPDX-License-Identifier: Apache-2.0
// Path-only portable source transport and actual current P-bound native inputs.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),C=resolve(process.argv[process.argv.indexOf('--capsule')+1])
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const own=(p:string)=>read(`${P}/${p}`)
const put=(p:string,x:any)=>{const f=resolve(D,p),b=typeof x==='string'?x:JSON.stringify(x,null,2)+'\n';if(existsSync(f))assert.equal(readFileSync(f,'utf8'),b);else{mkdirSync(dirname(f),{recursive:true});writeFileSync(f,b)}return relative(R,f)}
const hash=(bytes:string|Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const ids=['d2d735de-bede-5310-8aeb-8bb7562c7b75','a0f6ba09-f072-5887-a797-fa369453c62a','7b39fa19-fec3-575e-9324-a3226b703358']
const ppath=`${P}/positive/current-three.author.review.jsonl`
const records=readFileSync(resolve(R,ppath),'utf8').trim().split('\n').map(line=>JSON.parse(line))
assert.deepEqual(records.map(r=>r.goalId),ids)
assert.ok(records.every(r=>r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.evidenceLevel==='E1'&&r.maximumClaimScope==='G1'))
const originalConfig=own('native/future381.normal.config.json')
const fullConfig={...originalConfig,bookId:'chemie-inactive381-current-P-raster-native-20261010-v1',title:'Chemie – vollständige inaktive 381-Ziele-Prüfsicht mit aktuellen Bild- und P-Bindungen',evidenceReviewPaths:[ppath],outputPath:`${P}/native/future381-current-P.actual-model.json`}
const cp=put('native/future381-current-P.normal.config.json',fullConfig)
const initialBatch=own('native/three.current.batch.config.json')
put('native/three.current-P.batch.config.json',{...initialBatch,batchId:'chemie-three-BW-practical-current-P-native-20261010-v1',bookId:'chemie-three-BW-practical-current-P-native-20261010-v1',baseGoalBookConfigPath:cp,outputDirectory:`${P}/native/three-current-P`})
const configs=[]
for(const stage of ['before','after']){
 const sourceRoot=`source-atlas/${stage}-exact-normal-output/app/scripts/config/goal-books/chemie-BW-three-current-20261010-${stage}`
 const originalManifest=own(`${sourceRoot}/source-manifest.json`)
 const ns=`${P}/source-atlas/${stage}-portable-operative`
 const transports=[]
 const sourcePaths=originalManifest.sourcePaths.map((path:string)=>{
   const suffix=path.split(`chemie-BW-three-current-20261010-${stage}/`)[1],archive=`${P}/${sourceRoot}/${suffix}`,target=`${ns}/${suffix}`,bytes=readFileSync(resolve(R,archive),'utf8')
   put(`source-atlas/${stage}-portable-operative/${suffix}`,bytes)
   transports.push({normalOutputPath:path,exactArchivePath:archive,operativePath:target,exactBytesRetained:true,sha256:hash(bytes)})
   return target
 })
 const navBytes=readFileSync(resolve(R,`${P}/${sourceRoot}/navigation.view.json`),'utf8')
 const navpath=put(`source-atlas/${stage}-portable-operative/navigation.view.json`,navBytes)
 const manifest={...originalManifest,sourcePaths,navigationViewPath:navpath}
 const manifestPath=put(`source-atlas/${stage}-portable-operative/source-manifest.json`,manifest)
 const modelBase=stage==='after'?fullConfig:own('native/current378.normal.config.json')
 const {compositionViewPath:removedSingleView,...atlasBase}=modelBase
 const cfg={...atlasBase,bookId:`chemie-BW-source-${stage}-portable-current-20261010-v1`,title:`Chemie – echte begrenzte BW-Quellensicht (${stage})`,compositionViewManifestPath:manifestPath,outputPath:`${ns}/actual-source-book-model.json`}
 const cfgpath=put(`source-atlas/${stage}-portable-operative/normal-source-book.config.json`,cfg)
 configs.push({stage,configPath:cfgpath,manifestPath,transports,wholeManifestChangedFields:Object.keys(manifest).filter(k=>stableGoalBookJson(manifest[k])!==stableGoalBookJson(originalManifest[k]))})
}
cpSync(D,resolve(C,P),{recursive:true})
const loaded=await loadGoalBookBuildInputs(cp,C);assert.equal(loaded.model.pages.length,381)
put('native/future381-current-P.actual-model.json',loaded.model)
const before=own('native/current378.actual-model.json'),bp=new Map<string,any>(before.pages.map((p:any)=>[p.goalId,p])),afterp=new Map<string,any>(loaded.model.pages.map(p=>[p.goalId,p]))
const strict=own('inputs/current-central-five-gate.exact.json').subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds
assert.ok(strict.every((id:string)=>stableGoalBookJson(bp.get(id))===stableGoalBookJson(afterp.get(id))))
const pmodelChecks=ids.map(id=>{const p=afterp.get(id),r=records.find(r=>r.goalId===id);assert.equal(p.evidenceReview.reviewInputFingerprint,r.reviewInputFingerprint);assert.equal(p.evidenceReview.profileFingerprint,r.profileFingerprint);assert.equal(p.visualization.originalDigest,'sha256:'+own('inputs/three-existing-raster-metadata-successor.exact.json').rows.find((row:any)=>row.goalId===id).selectedPNG.sha256);return{goalId:id,pageFingerprint:p.pageFingerprint,goalFingerprint:p.goalFingerprint,evidenceReview:p.evidenceReview,visualization:p.visualization}})
const sourceModels=[]
for(const row of configs){const built=await loadGoalBookBuildInputs(row.configPath,C),expected=row.stage==='before'?185:189;assert.equal(built.model.pages.length,expected);put(`source-atlas/${row.stage}-portable-operative/actual-source-book-model.json`,built.model);sourceModels.push({...row,actualAtomicPageCount:expected,normalModelDigest:built.model.digest,actualPracticalPages:built.model.pages.filter(p=>ids.includes(p.goalId))})}
put('checks/current-P-full381-and-portable-BW185-189.normal-models.actual.json',{schemaVersion:1,ordinaryTool:'loadGoalBookBuildInputs',actualFullCurrentPModel:cp,pModelChecks:pmodelChecks,allProtected177WholePagesEqual:true,sourceModels,sourceTransportIsOnlyRealRepoRelativePathRebinding:true,newScienceReviewsClaimed:0,currentIndependentNativeReviews:0,activeWrites:0,strictGain:0})
console.log(JSON.stringify({normalFullCurrentPModelPages:381,currentPBoundPracticalPages:pmodelChecks.length,portableSourceModels:sourceModels.map(s=>({stage:s.stage,pages:s.actualAtomicPageCount})),protected177Unchanged:true,strictGain:0,activeWrites:0}))
