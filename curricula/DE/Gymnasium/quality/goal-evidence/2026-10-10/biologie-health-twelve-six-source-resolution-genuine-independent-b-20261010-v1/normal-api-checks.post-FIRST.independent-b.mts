import { readFileSync, writeFileSync, mkdirSync, copyFileSync, mkdtempSync } from 'node:fs'
import { resolve, dirname, basename, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import {
  readGoalBookSourceAtlasInputConfig, buildGoalBookSourceAtlasInputs,
  checkGoalBookSourceAtlasInputs,
} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { loadGoalBookBuildInputs, writeGoalBookModel } from '../../../../../../../app/scripts/goalBookModel.ts'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = resolve(own, '../biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2')
const rel = (path: string) => relative(root,path).replaceAll('\\','/')
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const binding = (path: string) => ({ path: rel(path), sha256: sha(readFileSync(path)), bytes: readFileSync(path).length })
const put = (path: string, data: unknown) => {
  mkdirSync(dirname(path), {recursive:true})
  writeFileSync(path, JSON.stringify(data,null,2)+'\n')
  JSON.parse(readFileSync(path,'utf8'))
}
const first = JSON.parse(readFileSync(resolve(own,'FIRST.six-source-resolution.independent-b.freeze.json'),'utf8'))
assert.equal(binding(resolve(root,first.firstDecision.path)).sha256,first.firstDecision.sha256)
const authorConfigPath = resolve(author,'sources/current394-six-resolution.normal.config.json')
const originalConfig = readGoalBookSourceAtlasInputConfig(rel(authorConfigPath), root)
const originalBuild = buildGoalBookSourceAtlasInputs(originalConfig,root)
const exactAuthorOutputs = Object.entries(originalBuild.outputs).map(([path,bytes]) => {
  const actual = resolve(author,'sources/normal-output',basename(path))
  assert.equal(readFileSync(actual,'utf8'),bytes,`Normal API differs from author artifact ${path}`)
  return { logicalOutputPath:path, actualPortableFile:binding(actual), reproducedExactly:true }
})
// Preserve the normal API's book-local path rule. Its physical writes run in a
// temporary repository with exact input copies, then output bytes are retained
// under this new namespace. No active repository outputs are written.
const configPath = resolve(own,'normal-api/source-check.config.json')
put(configPath,originalConfig)
const capsule=mkdtempSync(resolve(root,'tmp/bio12-source-b-normal-post-first-'))
for (const item of originalBuild.receipt.inputBindings) {
  const target=resolve(capsule,item.path)
  mkdirSync(dirname(target),{recursive:true})
  copyFileSync(resolve(root,item.path),target)
  assert.equal(sha(readFileSync(target)),item.sha256)
}
const capsuleConfig=resolve(capsule,rel(configPath))
mkdirSync(dirname(capsuleConfig),{recursive:true})
copyFileSync(configPath,capsuleConfig)
for (const [path,bytes] of Object.entries(originalBuild.outputs)) {
  const destination=resolve(capsule,path)
  assert.ok(destination.startsWith(capsule+'/'))
  mkdirSync(dirname(destination),{recursive:true})
  writeFileSync(destination,bytes)
  JSON.parse(readFileSync(destination,'utf8'))
}
const checked=checkGoalBookSourceAtlasInputs(rel(configPath),capsule)
assert.deepEqual(checked.receipt.counts,originalBuild.receipt.counts)
const ownOutputs=Object.entries(checked.outputs).map(([logicalPath,bytes])=>{
  const destination=resolve(own,'normal-api/source-output',basename(logicalPath))
  mkdirSync(dirname(destination),{recursive:true})
  writeFileSync(destination,bytes)
  JSON.parse(readFileSync(destination,'utf8'))
  return {logicalPath,actualPortableOutput:binding(destination)}
})
const modelAuthorConfig = JSON.parse(readFileSync(resolve(author,'native/current394-six-resolution.normal.config.json'),'utf8'))
const modelConfig = {...modelAuthorConfig, outputPath:rel(resolve(own,'normal-api/current394.actual-normal-model.json'))}
const modelConfigPath=resolve(own,'normal-api/model.config.json')
put(modelConfigPath,modelConfig)
const modelSourcePaths = [modelConfig.landscapePath,modelConfig.semanticKindLedgerPath,modelConfig.goalVisualizationQaPath,
  modelConfig.compositionViewManifestPath,...modelConfig.evidenceReviewPaths,...(modelConfig.externalLandscapePaths??[])]
const sourceManifest=JSON.parse(readFileSync(resolve(root,modelConfig.compositionViewManifestPath),'utf8'))
modelSourcePaths.push(...sourceManifest.sourcePaths,sourceManifest.navigationViewPath,sourceManifest.durationModelPolicyPath)
const copiedModelInputs=[...new Set(modelSourcePaths)].map(path=>{
  const destination=resolve(capsule,path)
  mkdirSync(dirname(destination),{recursive:true})
  copyFileSync(resolve(root,path),destination)
  return binding(resolve(root,path))
})
const qa=JSON.parse(readFileSync(resolve(root,modelConfig.goalVisualizationQaPath),'utf8'))
const originalAssetAliases=qa.records.filter(record=>record.visualizationState==='available').map(record=>{
  const source=resolve(root,record.canonicalAssetPath)
  assert.equal(binding(source).sha256,record.assetSha256)
  const destination=resolve(capsule,record.publicAssetPath)
  mkdirSync(dirname(destination),{recursive:true})
  copyFileSync(source,destination)
  assert.equal(sha(readFileSync(destination)),record.assetSha256)
  return {goalId:record.goalId,actualCommittableSource:binding(source),temporaryExpectedRuntimePath:record.publicAssetPath,exactAliasBytes:true}
})
const capsuleModelConfig=resolve(capsule,rel(modelConfigPath))
mkdirSync(dirname(capsuleModelConfig),{recursive:true})
copyFileSync(modelConfigPath,capsuleModelConfig)
const {model,outputPath}=await loadGoalBookBuildInputs(rel(modelConfigPath),capsule)
const authorModelPath=resolve(author,'native/current394-six-resolution.actual-normal-model.json')
assert.deepEqual(model,JSON.parse(readFileSync(authorModelPath,'utf8')))
await writeGoalBookModel(model,outputPath)
assert.equal(readFileSync(outputPath,'utf8'),readFileSync(authorModelPath,'utf8'))
const ownModelPath=resolve(root,modelConfig.outputPath)
copyFileSync(outputPath,ownModelPath)
const proof={schemaVersion:1,role:'Post-FIRST normal implementation checks; retained reviews ingested only by the model API, no new scientific D/P/A/M/V judgment',firstFreeze:binding(resolve(own,'FIRST.six-source-resolution.independent-b.freeze.json')),normalSourceApi:'buildGoalBookSourceAtlasInputs/checkGoalBookSourceAtlasInputs',normalSourceCheckExecution:'Temporary repository with byte-exact regular input copies and unchanged normal logical output paths; no active output writes',normalModelApi:'loadGoalBookBuildInputs/writeGoalBookModel',normalModelCheckExecution:'Same isolated repository, exact original committable rasters materialized at expected runtime paths; no active asset or judgment mutation',copiedModelInputs,originalAssetAliases,sourceApiPureOriginalAuthorOutputsExact:exactAuthorOutputs,normalWrittenAndCheckedConfig:binding(configPath),normalWrittenAndCheckedOutputCount:Object.keys(checked.outputs).length,normalPortableOutputBindings:ownOutputs,normalReceiptCounts:checked.receipt.counts,normal394ModelExact:binding(ownModelPath),author394Model:binding(authorModelPath),wholeModelByteExact:true,sourceMappingCompletionClaimed:false,strictGain:0,humanApproved:0,humanTrial:false,activeWrites:[]}
put(resolve(own,'checks/normal-source-and-whole-model.post-FIRST.actual.json'),proof)
console.log(JSON.stringify({normalSourceCheck:'PASS',sourceOutputs:Object.keys(checked.outputs).length,originalAuthorOutputBytesExact:exactAuthorOutputs.length,normalModelByteExact:true,pages:model.pages.length,counts:checked.receipt.counts,strictGain:0,humanApproved:0}))
