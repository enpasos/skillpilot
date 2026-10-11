import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import {
 loadGoalBookBuildInputs, parseAndValidateGoalBookModel, stableGoalBookJson,
} from '../../../../../../../app/scripts/goalBookModel'
import {
 prepareGoalDescriptionRolloutBatch, validatePreparedGoalDescriptionRolloutBatch,
} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'

const root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
const repoRoot = resolve('.')
const sha = (b: Buffer|string) => createHash('sha256').update(b).digest('hex')
const json = async (path: string) => JSON.parse(await readFile(resolve(repoRoot,path),'utf8'))
const put = async (name:string, value:unknown) => {
 const target=resolve(repoRoot,root,name), bytes=JSON.stringify(value,null,2)+'\n'
 try { await writeFile(target,bytes,{flag:'wx'}) }
 catch(error){
  if(!(error instanceof Error && 'code' in error && error.code==='EEXIST')) throw error
  if(await readFile(target,'utf8')!==bytes) throw new Error('Existing proof differs: '+name)
 }
}
const assert = (v:unknown,s:string) => { if(!v) throw new Error(s) }
const plan = await json(root+'/actual173-native-batch-configs-and336-freeze.preparation-plan.json')
const freezePath = root+'/freeze/whole-active-current336.normal-production-book-model.json'
const freezeBytes = await readFile(resolve(repoRoot,freezePath))
assert(sha(freezeBytes)===plan.baseWholeFileSha256,'frozen whole336 bytes mismatch')
const freeze = parseAndValidateGoalBookModel(JSON.parse(freezeBytes.toString()))
assert(freeze.digest===plan.baseNativeModelDigest,'frozen model native digest mismatch')
const baseConfigPath = root+'/freeze/current336-native-base-book.exact-active-copy.config.json'
const base = await loadGoalBookBuildInputs(baseConfigPath)
assert(stableGoalBookJson(base.model)===stableGoalBookJson(freeze),'actual native rebuild differs from whole336 Root freeze')
assert(base.model.pages.length===336,'actual native denominator is not336')
const bindings:Record<string,string> = {}
const config=base.config
const paths = new Set<string>([
 baseConfigPath, freezePath, plan.baseActualModelPath,
 config.landscapePath, config.semanticKindLedgerPath, config.goalVisualizationQaPath,
 ...(config.compositionViewPath?[config.compositionViewPath]:[]),
 ...(config.compositionViewManifestPath?[config.compositionViewManifestPath]:[]),
 ...config.evidenceReviewPaths, ...(config.externalLandscapePaths??[]),
 root+'/criteria/current336-description-owner-binding.frozen-blind.criteria.md',
 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
])
// Image bytes are part of the current native owner binding.
for(const page of freeze.pages) if(page.visualization?.url?.startsWith('/')) paths.add('app/public'+page.visualization.url)
for(const path of paths) bindings[path]=sha(await readFile(resolve(repoRoot,path)))
await put('actual-current336-native-rebuild-and-input-freeze.before.json',{
 technicalOnly:true,actualFullModelRebuilt:true,wholeFreezeSha256:sha(freezeBytes),nativeModelDigest:freeze.digest,
 actualDenominator:336,source:freeze.source,bindings,
 noScienceValidityOrHumanApprovalClaimed:true,
})
console.log('PASS actual native whole336 rebuild equals Root freeze; bindings='+Object.keys(bindings).length)
const prepared=[]
for(const configPath of plan.nativeBatchConfigPaths){
 const config = await json(configPath)
 console.log('PREPARE '+config.batchId+' goals='+config.goalIds.length)
 const result=await prepareGoalDescriptionRolloutBatch(configPath)
 const checked=await validatePreparedGoalDescriptionRolloutBatch(configPath)
 assert(checked.manifest.source.baseBookDigest===freeze.digest,'baseBookDigest mismatch')
 assert(stableGoalBookJson(checked.model.source)===stableGoalBookJson(freeze.source),'subset source changed')
 assert(checked.model.navigation.derivedProjection?.baseModelDigest===freeze.digest,'subset native baseModelDigest mismatch')
 assert(stableGoalBookJson(checked.model.pages.map(p=>p.goalId))===stableGoalBookJson(config.goalIds),'subset ID order mismatch')
 prepared.push({configPath,outputDirectory:config.outputDirectory,batchId:checked.manifest.batchId,
  goalIds:config.goalIds,count:config.goalIds.length,baseBookDigest:checked.manifest.source.baseBookDigest,
  subsetModelDigest:checked.model.digest,bundleFingerprint:checked.bundle.bundleFingerprint,
  first:checked.manifest.artifacts.rounds.first,second:checked.manifest.artifacts.rounds.second})
 console.log('PASS native prepare/check '+config.batchId+' model='+result.model.digest)
}
for(const [path,digest] of Object.entries(bindings)) assert(sha(await readFile(resolve(repoRoot,path)))===digest,'freeze binding changed during preparation: '+path)
const combined=prepared.flatMap(x=>x.goalIds)
assert(combined.length===173 && new Set(combined).size===173,'actual173 permutation invalid')
assert(stableGoalBookJson(combined)===stableGoalBookJson(plan.nativeOrderGoalIds173),'actual173 differs from approved native order')
await put('actual-nine-native-prepared-and-checked-A-B-current336-freeze.receipt.json',{
 technicalOnly:true,preparationContract:'native-goal-description-rollout-batch-v1',
 wholeFreezePath:freezePath,wholeFreezeSha256:sha(freezeBytes),nativeFullModelDigest:freeze.digest,
 wholeCurrentDenominator:336,actualTargetGoalCount:combined.length,actualBatchSizes:prepared.map(x=>x.count),
 allInputBindingsExactBeforeAfter:true,inputBindingCount:Object.keys(bindings).length,
 nativePreparedAndValidatedBatches:prepared,reviewRecordsAuthored:0,activeLedgerWrites:0,
 automaticAcceptance:false,scientificReviewOrApprovalClaimed:false,
})
console.log('PASS all nine native batches/18 blind first-pass campaigns; 173 exact native-ordered IDs; no records/ledgers')
