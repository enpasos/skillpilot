import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintSemanticKindSourceGoal,buildGoalBookModel,stableGoalBookJson} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import {validatePositiveGoalEvidenceRecordSemantics,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),rel=own.slice(root.length+1)
const t='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
const ar='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3'
const rd=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const wr=(p:string,d:unknown)=>{mkdirSync(dirname(resolve(own,p)),{recursive:true});writeFileSync(resolve(own,p),JSON.stringify(d,null,2)+'\n')}
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const land=rd(rel+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json'),sem=rd(rel+'/candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json'),beforeSem=rd(t+'/candidate/semantic533.current407.corrected-P8.inactive.json')
const ids=rd(rel+'/CAS.exact-four-whole-goals.before-after.actual.json').rows.map((x:any)=>x.goalId),by=new Map(land.goals.map((g:any)=>[g.id,g])),dec=new Map(sem.decisions.map((d:any)=>[d.goalId,d]))
const semDeltas:any[]=[]
sem.sourceLandscapePath=rel+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json'
for(const id of ids.slice(0,2)){const d:any=dec.get(id),fp=fingerprintSemanticKindSourceGoal(by.get(id) as any);semDeltas.push({goalId:id,before:beforeSem.decisions.find((x:any)=>x.goalId===id).sourceFingerprint,after:fp,semanticKind:d.semanticKind,decisionStatus:d.decisionStatus,decisionBasis:d.decisionBasis,technicalBindingOnly:true});d.sourceFingerprint=fp}
writeFileSync(resolve(own,'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json'),JSON.stringify(sem,null,2)+'\n')
const semErrors=sem.decisions.filter((d:any)=>d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(by.get(d.goalId) as any)).map((d:any)=>d.goalId)
const assets=rd(rel+'/V4.exact-existing-independent-pixel-decisions-and-installation-bindings.actual.json').rows,resources=Object.fromEntries(assets.map((x:any)=>[x.url,x.sha256]))
for(const x of assets)if(sha(x.ownedPublicAssetPath)!==x.sha256)throw new Error('asset transport '+x.goalId)
const pRows:any[]=[]
for(const s of ['a','b'])for(const l of readFileSync(resolve(own,'positive/P4.original-independent-'+s+'.review.jsonl'),'utf8').trim().split('\n')){
 const rec=JSON.parse(l),goal:any=by.get(rec.goalId),kind=(dec.get(rec.goalId) as any).semanticKind,errors=validatePositiveGoalEvidenceRecordSemantics(rec,goal,resources,kind)
 pRows.push({independent:s,goalId:rec.goalId,goalFingerprint:rec.goalFingerprint,expectedGoalFingerprint:fingerprintGoalForPositiveEvidence(goal,kind),reviewInputFingerprint:rec.reviewInputFingerprint,expectedReviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,rec.reviewCriteriaFingerprint,resources,kind),profileFingerprint:rec.profileFingerprint,expectedProfileFingerprint:fingerprintPositiveGoalEvidenceProfile(rec.profile),errors,originalRecordNotMutated:true})
}
wr('checks/stock-whole533-SEM-and-exact-P4-A-B-fingerprint-joins.actual.json',{schemaVersion:1,unmodifiedStockModules:true,semanticGoalCount:sem.decisions.length,semanticFingerprintErrors:semErrors,semanticBindingDeltas:semDeltas,classificationFieldsUnchanged:sem.decisions.every((d:any,i:number)=>Object.keys(d).every(k=>k==='sourceFingerprint'||d[k]===beforeSem.decisions[i][k])),rows:pRows,pass:semErrors.length===0&&pRows.every(x=>x.errors.length===0),newScientificVotes:0})
// Build through the stock model function with explicitly bound physical inputs.
// No original host or active file is changed; existing T407 asset digests are retained
// exactly, with only four verified asset bindings supplied from this owned root.
const oldModel=rd(t+'/models/whole407.corrected-P8.stock-book-model.inactive.json'),oldConfig=rd(t+'/configs/whole407.corrected-P8.inactive.config.json')
const originalDigests=Object.fromEntries(oldModel.pages.filter((p:any)=>p.visualization?.url&&p.visualization?.originalDigest).map((p:any)=>[p.visualization.url,p.visualization.originalDigest]))
const additionalQaAssetBindings:any[]=[]
for(const q of rd(t+'/candidate/QA.current407.exact-reviewed-child-images.inactive.json').records){
 if(q.imageUrl&&!originalDigests[q.imageUrl]){
  const actualPath=existsSync(resolve(root,q.publicAssetPath))?q.publicAssetPath:t+'/public-root'+q.imageUrl
  const digest=sha(actualPath)
  if(digest!==q.assetSha256)throw new Error('non-page QA asset differs '+q.goalId)
  originalDigests[q.imageUrl]=digest;additionalQaAssetBindings.push({path:actualPath,sha256:digest})
 }
}
const config={...oldConfig,bookId:'chemie-current407-four-q3-v3-technical-integration-inactive',title:'Chemie – vier bereits geprüfte Q3-Nachfolger im 407-Kandidaten',landscapePath:rel+'/candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json',semanticKindLedgerPath:rel+'/candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json',goalVisualizationQaPath:rel+'/candidate/QA.current407.q3-four-reviewed-v3.inactive.json',evidenceReviewPaths:[...oldConfig.evidenceReviewPaths,rel+'/positive/P4.original-independent-a.review.jsonl'],outputPath:rel+'/models/whole407.q3-four-reviewed-v3.stock-model.inactive.json'}
const composition=rd(config.compositionViewPath),evidence=config.evidenceReviewPaths.map((path:string)=>({path,text:readFileSync(resolve(root,path),'utf8')}))
const model=buildGoalBookModel({landscape:land,compositionView:composition,semanticKindLedger:sem,goalVisualizationQa:rd(config.goalVisualizationQaPath),goalVisualizationAssetDigests:{...originalDigests,...resources},evidenceReviewSources:evidence,config} as any)
wr('configs/whole407.q3-four-reviewed-v3.inactive.config.json',config);wr('models/whole407.q3-four-reviewed-v3.stock-model.inactive.json',model)
const orig=rd(ar+'/native/whole402.neutral.normal-model.author.actual.json'),reviewed=rd(ar+'/inputs/current523.author-successor.de.json'),rb=new Map(reviewed.goals.map((g:any)=>[g.id,g]))
const stripLocations=(x:any):any=>Array.isArray(x)?x.map(stripLocations):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','chapterIds','pageFingerprint'].includes(k)).map(([k,v])=>[k,stripLocations(v)])):x
const contexts=ids.map((id:string)=>{
 const old=orig.pages.find((p:any)=>p.goalId===id),cur=model.pages.find((p:any)=>p.goalId===id),base=oldModel.pages.find((p:any)=>p.goalId===id)
 const neighborIds=[...(by.get(id) as any).requires,...land.goals.filter((g:any)=>(g.requires??[]).includes(id)).map((g:any)=>g.id)]
 const neighbors=neighborIds.map((n:string)=>({goalId:n,oldWhole:rb.get(n),currentWhole:by.get(n),wholeExact:stableGoalBookJson(rb.get(n))===stableGoalBookJson(by.get(n))}))
 return {goalId:id,originalReviewedV3Page:old,current407BasePage:base,currentOwned407Page:cur,changedPageFields:Object.keys(old).filter(k=>stableGoalBookJson(old[k])!==stableGoalBookJson(cur[k])),afterRemovingLocationsChangedFields:Object.keys(stripLocations(old)).filter(k=>stableGoalBookJson(stripLocations(old)[k])!==stableGoalBookJson(stripLocations(cur)[k])),wholeReviewedV3GoalExact:stableGoalBookJson(rb.get(id))===stableGoalBookJson(by.get(id)),wholeContextNeighbors:neighbors,allRequiresAndReverseRequiresWholeBodiesExact:neighbors.every(x=>x.wholeExact),originalDRecordIsHistoricalBindingOnly:true,newNativeDReviewPerformed:false}
})
wr('D4.current407-exact-original-v3-versus-owned-candidate-context-binding-deltas.actual.json',{schemaVersion:1,role:'technical_context_comparison_not_new_scientific_D_votes',original402BookDigest:orig.digest,currentBase407Digest:oldModel.digest,currentOwned407Digest:model.digest,currentPages:model.pages.length,rows:contexts,broaderReviewsNotReopened:true,originalDRunBytesUnchanged:true})
const deps=[config.compositionViewPath,...oldConfig.evidenceReviewPaths,t+'/models/whole407.corrected-P8.stock-book-model.inactive.json',t+'/configs/whole407.corrected-P8.inactive.config.json',ar+'/native/whole402.neutral.normal-model.author.actual.json']
wr('checks/stock-book-build-physical-input-bindings.actual.json',{schemaVersion:1,role:'read_only_unmodified_stock_builder_explicit_owned_objects_and_exact_original407_asset_digests',bindings:deps.map(path=>({path,sha256:sha(path)})),existing407AssetDigestCount:Object.keys(originalDigests).length,additionalNonPageQAAssetBindingsReadActualBytes:additionalQaAssetBindings,exactFourOwnedAssetBindings:resources,privateHostWrites:0,activeWrites:0,newScientificVotes:0})
console.log(JSON.stringify({semErrors,pErrors:pRows.flatMap(x=>x.errors),pages:model.pages.length,contexts:contexts.map(x=>({goalId:x.goalId,changed:x.afterRemovingLocationsChangedFields,neighborsExact:x.allRequiresAndReverseRequiresWholeBodiesExact}))}))
