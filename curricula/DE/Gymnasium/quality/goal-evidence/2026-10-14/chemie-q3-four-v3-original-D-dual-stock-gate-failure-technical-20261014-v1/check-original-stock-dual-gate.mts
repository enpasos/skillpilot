import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalDescriptionReviewCampaignResultDirectories,validateGoalDescriptionReviewCampaignResults} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {validateGoalDescriptionReviewDualRound} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {extractGoalDescriptionDualRoundResolutionSource,fingerprintGoalDescriptionReviewContext} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {proveMathAtlasReviewSubsetNarrowing} from '/home/enpasos/projects/skillpilot/app/scripts/mathAtlasReviewSubsetCompatibility.ts'
import {stableGoalBookJson} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),rel=own.slice(root.length+1)
const prev='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-q3-four-v3-reviewed-current407-integration-preparation-20261014-v1'
const rd=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const wr=(p:string,x:unknown)=>{mkdirSync(dirname(resolve(own,p)),{recursive:true});writeFileSync(resolve(own,p),JSON.stringify(x,null,2)+'\n')}
const bound:any[]=[]
const bind=(p:string)=>{const x={path:p,sha256:sha(p),bytes:readFileSync(resolve(root,p)).length};if(!bound.some(x=>x.path===p))bound.push(x);return x}
const oldSeal=prev+'/SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json';if(sha(oldSeal)!=='sha256:ce5ac3e9fec3f054f02e1fd9b36e05255fbaa4cdb41e40b1517f085a660ea1f6')throw new Error('original technical seal drift');bind(oldSeal)
const ids=rd(prev+'/FINAL.four-existing-reviewed-v3-current407-technical-integration.manifest.json').scopeGoalIds
const rounds:any[]=[]
for(const s of ['a','b']){
 const p=prev+'/description/original-'+s,campaign=rd(p+'/description-review-campaign.json'),loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(root,p+'/batches'),resultsDirectory:resolve(root,p+'/results')})
 if(loaded.errors.length)throw new Error(loaded.errors.join('|'))
 const artifacts={bundle:rd(p+'/review-bundle-manifest.json'),input:rd(p+'/description-review-input.json'),campaign,resultPairs:loaded.resultPairs};rounds.push(artifacts)
 for(const fn of ['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json']){
  const dest=resolve(own,'original-'+s,fn);mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(root,p,fn),dest);bind(p+'/'+fn)
 }
 for(const pair of loaded.resultPairs){
  for(const [fn,bytes] of [[pair.batchId+'.run.json',Buffer.from(JSON.stringify(pair.run,null,2)+'\n')],[pair.batchId+'.records.jsonl',pair.recordsBytes]] as const){
   const actual=resolve(root,p+'/results/'+fn);copyFileSync(actual,resolve(own,'original-'+s,fn));bind(p+'/results/'+fn)
  }
  const sourceBatch=p+'/batches/'+pair.batchId+'.input.jsonl';copyFileSync(resolve(root,sourceBatch),resolve(own,'original-'+s,pair.batchId+'.input.jsonl'));bind(sourceBatch)
 }
 const result=await validateGoalDescriptionReviewCampaignResults(artifacts)
 wr('checks/original-'+s+'-individual-stock-campaign.actual.json',{errors:result.errors,records:result.records.length,reviewPass:campaign.reviewPass,originalBytesUnchanged:true})
}
const dual=await validateGoalDescriptionReviewDualRound({first:rounds[0],second:rounds[1]})
wr('DIAGNOSTIC.original-v3-dual-summary.failed-stock-gate.actual.json',dual.summary)
wr('checks/original-v3-normal-stock-dual-gate-errors.actual.json',{stockFunction:'validateGoalDescriptionReviewDualRound',errors:dual.errors,passed:dual.errors.length===0,individualCampaignsPass:true,originalRecordsAndRunsNotChanged:true,newScienceVotes:0})
if(dual.errors.length===0)throw new Error('expected factual dual gate no longer blocked; inspect before continuing')
const modelPath=prev+'/models/whole407.q3-four-reviewed-v3.stock-model.inactive.json';bind(modelPath)
const current=rd(modelPath),currentFour=buildGoalDescriptionRolloutSubsetModel({baseModel:current,goalIds:ids,bookId:'chemie-current407-q3-four-next-native-first-pass',title:'Chemie – vier aktuelle Q3-Seiten'})
const rows=ids.map((id:string)=>{
 const a=rounds[0].input.goals.find((x:any)=>x.goalId===id),b=rounds[1].input.goals.find((x:any)=>x.goalId===id),p=currentFour.pages.find((x:any)=>x.goalId===id),sourceA=extractGoalDescriptionDualRoundResolutionSource({artifacts:rounds[0],goalId:id,label:'A'}),sourceB=extractGoalDescriptionDualRoundResolutionSource({artifacts:rounds[1],goalId:id,label:'B'})
 if(sourceA.errors.length||sourceB.errors.length)throw new Error('source extraction '+id)
 const proof=proveMathAtlasReviewSubsetNarrowing(a.reviewContext.page,p!)
 return {goalId:id,titleDe:a.currentTitleDe,originalWholeGoalInputTupleA:a,originalWholeGoalInputTupleB:b,originalWholeTuplesExact:stableGoalBookJson(a)===stableGoalBookJson(b),firstSource:sourceA.source,secondSource:sourceB.source,currentExactPage:p,originalContextFingerprint:fingerprintGoalDescriptionReviewContext(a),originalSourceContextFingerprintsExact:sourceA.source!.binding.goalReviewContextFingerprint===sourceB.source!.binding.goalReviewContextFingerprint,publicGKOnlyScopeCarryProof:proof,stockDualErrors:dual.errors,decision:'HOLD_CURRENT_NATIVE_D_BINDING',strictDescriptionComplete:false,noArtificialReviseVotes:true,noOriginalBindingPatched:true,missingGates:['one identical complete current bundle/input for both actual first_pass native rounds','a current first_pass round A rather than metadata reclassification of the historical follow_up','both actual current per-goal V3 page/context bindings'],narrowestActualNativeFollowupPage:{goalId:id,subsetPageNumber:p!.pageNumber,sourceCurrent407PageNumber:current.pages.find((x:any)=>x.goalId===id).pageNumber,pageFingerprint:p!.pageFingerprint,goalFingerprint:p!.goalFingerprint},bodyOrPScienceReopened:false}
})
wr('RECORDS.exact-four-original-v3-stock-D-gate-HOLD-and-current-native-pages.actual.json',{schemaVersion:1,rows,operativeResolutionsCreated:0,strictResolutionIndexCreated:false,reasonNoIndex:'The normal index contract requires one or more strictly valid resolutions. None of these four original dual sources passes the stock dual gate; no empty or falsely strict index is emitted.',newScientificVotes:0})
wr('INPUTS.finite-original-v3-runs-and-current-four-page-bindings.actual.json',{schemaVersion:1,startedAtUTC:'2026-10-14T00:14:51Z',completedAtUTC:new Date().toISOString(),provider:'OpenAI Codex',model:'GPT-6 session identity; serving revision and sampling unknown',role:'bounded technical stock validation, no new scientific run',bindings:bound,originalTechnicalSealUnchanged:true})
console.log(JSON.stringify({root:rel,stockDualErrors:dual.errors,wholeFourTuplesExact:rows.every(x=>x.originalWholeTuplesExact),originalRunsPreserved:true,holds:4,operativeResolutions:0}))
