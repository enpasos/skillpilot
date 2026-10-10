import { readFile,writeFile,mkdir,mkdtemp,rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname,resolve,join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadGoalBookBuildInputs,stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel,validatePreparedGoalDescriptionRolloutBatch } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-checkpoint-independent-technical-audit-v1'
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const manifest=JSON.parse(await readFile(root+'/exact-d710-native-freeze-replay.repository-relative-stage-manifest.json','utf8'))
const plan=JSON.parse(await readFile(prep+'/actual173-native-batch-configs-and336-freeze.preparation-plan.json','utf8'))
const replayRoot=await mkdtemp(join(tmpdir(),'skillpilot-economics-d710-readonly-native-guard-'))
try{
 for(const input of manifest.stagePlan){
  const bytes=await readFile(input.exactRepositoryInputPath)
  if(hash(bytes)!==input.wholeFileSha256)throw new Error('Frozen replay input changed: '+input.exactRepositoryInputPath)
  const target=resolve(replayRoot,input.repositoryRelativeStagePath)
  if(!target.startsWith(replayRoot+'/'))throw new Error('Replay path escapes isolated root')
  await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'})
 }
 const base=await loadGoalBookBuildInputs(manifest.baseConfigPath,replayRoot)
 const frozenBytes=await readFile(prep+'/freeze/whole-active-current336.normal-production-book-model.json')
 if(base.model.digest!==manifest.expectedNativeDigest ||
  hash(JSON.stringify(base.model,null,2)+'\n')!==manifest.expectedWholeSha256 ||
  hash(frozenBytes)!==manifest.expectedWholeSha256)throw new Error('Whole336 native freeze did not replay exactly')
 let count=0
 for(const configPath of plan.nativeBatchConfigPaths){
  const checked=await validatePreparedGoalDescriptionRolloutBatch(configPath)
  const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:checked.config.goalIds,
   bookId:checked.config.bookId,title:checked.config.title})
  const actualBytes=await readFile(checked.config.outputDirectory+'/bundle/book-model.json')
  if(hash(JSON.stringify(subset,null,2)+'\n')!==hash(actualBytes) ||
   checked.manifest.source.baseBookDigest!==base.model.digest ||
   stableGoalBookJson(checked.model.source)!==stableGoalBookJson(base.model.source))
   throw new Error('Prepared subset does not replay from exact whole336: '+configPath)
  count+=checked.config.goalIds.length
 }
 if(count!==173)throw new Error('Expected exact173 targeted input scope')
 console.log(JSON.stringify({technicalNativeFreezeGuard:'PASS',nativeFull336Digest:base.model.digest,
  whole336Sha256:manifest.expectedWholeSha256,originalBaseConfigRetained:true,nativeBatchesChecked:9,
  targetedCurrentInputs:count,replayInputsExact:manifest.stagePlan.length,
  originalConfigAndReviewerBytesNotWritten:true,activeSourcesNotWritten:true,scientificOrHumanApprovalClaimed:false}))
}finally{await rm(replayRoot,{recursive:true,force:true})}

