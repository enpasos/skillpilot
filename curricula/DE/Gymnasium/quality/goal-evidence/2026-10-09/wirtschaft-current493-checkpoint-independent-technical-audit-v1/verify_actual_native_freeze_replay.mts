import { readFile,writeFile,mkdir,mkdtemp } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join,dirname,resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { loadGoalBookBuildInputs,stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-checkpoint-independent-technical-audit-v1'
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
const rootR='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-qualified-active-integration-and-book-root-v1'
const baseConfigPath=prep+'/freeze/current336-native-base-book.exact-active-copy.config.json'
const config=JSON.parse(await readFile(baseConfigPath,'utf8'))
const originalModelBytes=await readFile(prep+'/freeze/whole-active-current336.normal-production-book-model.json')
const freeze=JSON.parse(originalModelBytes.toString())
const qaArchive=rootR+'/whole-active-QA336.before-native-source-root-discovery-successor.json'
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const archivedQABytes=await readFile(qaArchive)
const archivedQA=JSON.parse(archivedQABytes.toString())
if('sha256:'+sha(stableGoalBookJson(archivedQA))!==freeze.source.goalVisualizationQaDigest)throw new Error('Archive does not bind frozen native QA digest')
const originalPackageManifest=JSON.parse(await readFile(prep+'/package-whole-files.sha256-manifest.json','utf8'))
for(const f of originalPackageManifest.files)if(sha(await readFile(prep+'/'+f.path))!==f.sha256)throw new Error('Prepared original artifact changed before replay '+f.path)
const candidatePath=root+'/candidate-native-baseConfig-one-archived-QA-path-only.not-active.json'
await writeFile(candidatePath,JSON.stringify({...config,goalVisualizationQaPath:qaArchive},null,2)+'\n',{flag:'wx'})
const candidate=await loadGoalBookBuildInputs(candidatePath)
const replayRoot=await mkdtemp(join(tmpdir(),'skillpilot-economics-d710-exact-freeze-replay-'))
const paths=new Set<string>([baseConfigPath,config.landscapePath,config.semanticKindLedgerPath,
 ...(config.compositionViewPath?[config.compositionViewPath]:[]),...(config.compositionViewManifestPath?[config.compositionViewManifestPath]:[]),
 ...config.evidenceReviewPaths,...(config.externalLandscapePaths??[]),
 ...archivedQA.records.filter((r:any)=>r.visualizationState==='available').map((r:any)=>r.publicAssetPath)])
const stagePlan=[]
for(const path of paths){
 const bytes=await readFile(path),target=resolve(replayRoot,path)
 await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'})
 stagePlan.push({repositoryRelativeStagePath:path,exactRepositoryInputPath:path,wholeFileSha256:sha(bytes),bytes:bytes.length})
}
const stagedQaPath=resolve(replayRoot,config.goalVisualizationQaPath)
await mkdir(dirname(stagedQaPath),{recursive:true});await writeFile(stagedQaPath,archivedQABytes,{flag:'wx'})
stagePlan.push({repositoryRelativeStagePath:config.goalVisualizationQaPath,exactRepositoryInputPath:qaArchive,wholeFileSha256:sha(archivedQABytes),bytes:archivedQABytes.length})
const actualReplay=await loadGoalBookBuildInputs(baseConfigPath,replayRoot)
if(stableGoalBookJson(actualReplay.model)!==stableGoalBookJson(freeze))throw new Error('Actual native isolated replay differs from frozen336')
const wholeRebuiltBytes=JSON.stringify(actualReplay.model,null,2)+'\n'
if(sha(wholeRebuiltBytes)!==sha(originalModelBytes))throw new Error('Actual native replay whole336 serialization differs')
const plan=JSON.parse(await readFile(prep+'/actual173-native-batch-configs-and336-freeze.preparation-plan.json','utf8'))
const subsets=[]
for(const configPath of plan.nativeBatchConfigPaths){
 const cfg=JSON.parse(await readFile(configPath,'utf8'))
 const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:actualReplay.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
 const original=await readFile(cfg.outputDirectory+'/bundle/book-model.json')
 const rebuilt=JSON.stringify(subset,null,2)+'\n'
 if(sha(original)!==sha(rebuilt))throw new Error('Native replay subset differs '+cfg.batchId)
 subsets.push({batchId:cfg.batchId,configPath,goalCount:cfg.goalIds.length,originalAndReplaySubsetNativeDigest:subset.digest,
 originalAndReplaySubsetWholeSha256:sha(rebuilt)})
}
for(const f of originalPackageManifest.files)if(sha(await readFile(prep+'/'+f.path))!==f.sha256)throw new Error('Original artifact changed after replay '+f.path)
const proof={technicalOnly:true,currentNativeBatch01Check:'PASS in separate raw.current-native-batch01-check.txt',
 checkLoadsSubsetAndCampaignBytesButDoesNotRebuildBase:true,
 originalBaseConfigPath:baseConfigPath,originalFrozen336Digest:freeze.digest,
 originalFrozen336WholeSha256:sha(originalModelBytes),
 archivedOriginalQAPath:qaArchive,archivedOriginalQAWholeSha256:sha(archivedQABytes),
 archivedOriginalQANativeStableDigest:freeze.source.goalVisualizationQaDigest,
 archiveQAPathOnlyCandidate:{path:candidatePath,nativeModelDigest:candidate.model.digest,
  whole336OwnerPagesExact:stableGoalBookJson(candidate.model.pages)===stableGoalBookJson(freeze.pages),
  sourceGoalVisualizationQaPath:candidate.model.source.goalVisualizationQaPath,
  exactD710Reproduced:false,reason:'The native BookModel includes the QA source path as well as its digest; changing the path changes the model digest.'},
 actualIsolatedNativeReplay:{repositoryRoot:replayRoot,method:'Native loadGoalBookBuildInputs(originalConfigPath, isolatedRepositoryRoot)',
  exactlyRestoredOriginalRelativeQAPath:config.goalVisualizationQaPath,
  actualRebuiltNativeDigest:actualReplay.model.digest,actualRebuiltWholeSha256:sha(wholeRebuiltBytes),
  wholeModelExact:true,all9SubsetsWholeBytesExact:subsets,stagePlan},
 original281PreparationFilesWholeBytesExactBeforeAfter:true,
 originalConfigsOr173InputsRewritten:false,activeConfigsOrLedgersWritten:false,
 recommendedMinimalAdditiveGuard:'Retain the exact original QA archive and this relative-path replay manifest; reconstruct the original QA path only in an isolated native replay root. Keep the existing nine configs and173 reviewer bytes unchanged. Require the replay whole336/nativeDigest and nine subset comparisons when asserting d710 reproducibility.',
 limitation:'A new archive-QA-path baseConfig does not reproduce d710 under the native contract. A shared current-root check does not establish full-base replay identity.',
 noScientificCarryoverOrHumanApprovalClaimed:true}
await writeFile(root+'/actual-native-current-check-and-two-real-freeze-replay-variants.technical-proof.json',JSON.stringify(proof,null,2)+'\n',{flag:'wx'})
await writeFile(root+'/exact-d710-native-freeze-replay.repository-relative-stage-manifest.json',JSON.stringify({technicalReplayOnly:true,baseConfigPath,expectedNativeDigest:freeze.digest,expectedWholeSha256:sha(originalModelBytes),stagePlan},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({PASS:true,archivePathCandidateDigest:candidate.model.digest,nativeReplayDigest:actualReplay.model.digest,
 wholeNativeReplaySha:sha(wholeRebuiltBytes),all9SubsetsExact:true,original281FilesExact:true,stageInputs:stagePlan.length,replayRoot}))

