import {loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {createHash} from 'node:crypto'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-five-prospective-current-candidate-v1',iso=resolve(root,'tmp/chemie-b010-five-native-isolated-20261005-v1')
const read=(base:string,path:string):any=>JSON.parse(readFileSync(resolve(base,path),'utf8'))
const sha=(path:string)=>'sha256:'+createHash('sha256').update(readFileSync(path)).digest('hex')
const reportPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-current-integration-v1/central-after-five-current-A-M.report.json',baseline=read(root,reportPath).subjects.find((s:any)=>s.subject==='chemie')
if(baseline.strictComplete!==85||baseline.strictCompleteGoalIds.length!==85||baseline.issues.length)throw new Error('Authoritative current85 baseline changed')
const central='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',cfg=read(root,central).subjects.find((s:any)=>s.subject==='chemie'),canon=cfg.landscapePath
const basecfg='curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json'
const [before,after]=await Promise.all([loadGoalBookBuildInputs(basecfg,root),loadGoalBookBuildInputs(basecfg,iso)])
if(before.model.pages.length!==376||after.model.pages.length!==376)throw new Error('Canonical review denominator changed')
const oldgoals=new Map(read(root,canon).goals.map((g:any)=>[g.id,g])),newgoals=new Map(read(iso,canon).goals.map((g:any)=>[g.id,g])),bindings=new Map<string,any>()
for(const indexPath of cfg.resolutionIndexPaths){const index=read(root,indexPath)
 for(const row of index.resolutions){if(!baseline.strictCompleteGoalIds.includes(row.goalId))continue
  if((cfg.resolutionWithdrawals??[]).some((r:any)=>r.goalId===row.goalId&&r.indexPath===indexPath))continue
  if((cfg.resolutionSupersessions??[]).some((r:any)=>r.goalId===row.goalId&&r.supersededIndexPath===indexPath))continue
  const group=index.groups.find((g:any)=>g.groupId===row.groupId),dir=resolve(root,dirname(indexPath),group.artifactDirectory??'.'),book=resolve(dir,'bundle/book-model.json')
  if(!existsSync(book))throw new Error('Authoritative model absent '+book)
  bindings.set(row.goalId,{indexPath,row,book,model:JSON.parse(readFileSync(book,'utf8'))})
 }}
const rows=baseline.strictCompleteGoalIds.map((id:string)=>{
 const binding=bindings.get(id);if(!binding)throw new Error('No current strict resolution '+id)
 const stored=binding.model,opts={goalIds:stored.pages.map((p:any)=>p.goalId),bookId:stored.book.id,title:stored.book.title}
 const a=buildGoalDescriptionRolloutSubsetModel({baseModel:before.model,...opts}).pages.find(p=>p.goalId===id)!,b=buildGoalDescriptionRolloutSubsetModel({baseModel:after.model,...opts}).pages.find(p=>p.goalId===id)!,reviewed=stored.pages.find((p:any)=>p.goalId===id)
 const original=oldgoals.get(id) as any,next=newgoals.get(id) as any,keys=Object.keys(a).filter(k=>JSON.stringify((a as any)[k])!==JSON.stringify((b as any)[k]))
 const row={goalId:id,authoritativeIndexPath:binding.indexPath,authoritativeStoredModelPath:binding.book.replace(root+'/',''),authoritativeStoredModelSHA256:sha(binding.book),authoritativeStoredModelDigest:stored.digest,storedReviewedGoalFingerprint:reviewed.goalFingerprint,storedReviewedPageFingerprint:reviewed.pageFingerprint,beforeActualGoalFingerprint:a.goalFingerprint,beforeActualPageFingerprint:a.pageFingerprint,afterActualGoalFingerprint:b.goalFingerprint,afterActualPageFingerprint:b.pageFingerprint,storedReviewedPageStillCurrentBeforeCandidate:reviewed.goalFingerprint===a.goalFingerprint&&reviewed.pageFingerprint===a.pageFingerprint,wholeGoalObjectUnchanged:JSON.stringify(original)===JSON.stringify(next),canonicalContextUnchanged:JSON.stringify(buildGoalDescriptionCanonicalContext(original))===JSON.stringify(buildGoalDescriptionCanonicalContext(next)),goalFingerprintUnchanged:a.goalFingerprint===b.goalFingerprint,pageFingerprintUnchanged:a.pageFingerprint===b.pageFingerprint,pageNumberUnchanged:a.pageNumber===b.pageNumber,changedPageFields:keys}
 if(keys.length||!row.wholeGoalObjectUnchanged){writeFileSync(resolve(root,own,id+'-existing-current-page-targeted-binding.case.json'),JSON.stringify({...row,role:'targeted_existing_binding_only_no_new_whole_goal_scientific_review',oldGoalObject:original,newGoalObject:next,oldCanonicalContext:buildGoalDescriptionCanonicalContext(original),newCanonicalContext:buildGoalDescriptionCanonicalContext(next),oldCurrentPageUsingAuthoritativeScope:a,newCurrentPageUsingAuthoritativeScope:b,humanApproval:false,strictClosure:0,activeWrites:0},null,2)+'\n')}
 return row
})
const affected=rows.filter((r:any)=>!r.wholeGoalObjectUnchanged||!r.canonicalContextUnchanged||!r.goalFingerprintUnchanged||!r.pageFingerprintUnchanged||!r.pageNumberUnchanged),staleBefore=rows.filter((r:any)=>!r.storedReviewedPageStillCurrentBeforeCandidate)
const oldPages=new Map(before.model.pages.map(p=>[p.goalId,p])),changed=after.model.pages.filter(p=>JSON.stringify(p)!==JSON.stringify(oldPages.get(p.goalId))).map(p=>({goalId:p.goalId,oldGoalFingerprint:oldPages.get(p.goalId)?.goalFingerprint,newGoalFingerprint:p.goalFingerprint,oldPageFingerprint:oldPages.get(p.goalId)?.pageFingerprint,newPageFingerprint:p.pageFingerprint,fields:Object.keys(p).filter(k=>JSON.stringify((p as any)[k])!==JSON.stringify((oldPages.get(p.goalId) as any)?.[k]))}))
const receipt={status:staleBefore.length?'HOLD_authoritative_stored_pages_not_current':affected.length?'targeted_existing_current_page_binding_reviews_required':'PASS_all_current_strict_pages_unchanged',baselineCentralReportPath:reportPath,baselineCentralReportSHA256:sha(resolve(root,reportPath)),baselineCentralRegistrySHA256:sha(resolve(root,central)),currentStrictCount:85,currentCurricularAtomic:376,futureCurricularAtomic:376,comparisonScope:'All current strict85 IDs, exact authoritative registered stored book scope recreated before and after from native full376 current models; no historical whole-goal rereview.',allCurrentStrictRows:rows,affectedStrictRows:affected,storedAuthoritativeBeforeMismatches:staleBefore,changedFullCurrentPages:changed,strictClosureAdded:0,restoredBindings:0,humanApproval:false,activeWrites:0}
writeFileSync(resolve(root,own,'all-current-85-strict-page-comparator.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
writeFileSync(resolve(root,own,'future-full.book-model.json'),JSON.stringify(after.model,null,2)+'\n')
writeFileSync(resolve(root,own,'current-full.book-model.json'),JSON.stringify(before.model,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,current:85,affected:affected.map((r:any)=>({id:r.goalId,fields:r.changedPageFields})),storedBeforeMismatches:staleBefore.map((r:any)=>r.goalId),changedFullPages:changed.length,activeWrites:0}))
if(staleBefore.length)process.exitCode=1
