import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildGoalDescriptionCanonicalContext, fingerprintGoalDescriptionReviewInput } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage, fingerprintGoalDescriptionDualRoundResolution } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildResolutionSupersessionChains, claimUniqueGoal, validateResolutionSemanticRetirements, validateStandaloneResolutionIndexSchema, validateStandaloneResolutionIndexStructure, validateLegacyResolutionIndexSnapshot } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout'
import { stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'
import { stockResourceDigestsForGoal, stockPositiveRepoRoot } from '/mnt/e/skillpilot-chemie-L7-20261017/paired-all-seven-packages-and-HB7f-actual-current650-technical-v1/capsule/app/scripts/.L7-stock-positiveGoalEvidenceReview-exports'

const out=dirname(fileURLToPath(import.meta.url)), E=dirname(out), R='/home/enpasos/projects/skillpilot'
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const sha=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const pin=(p:string)=>({path:resolve(p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length})
const eq=(a:any,b:any)=>stableGoalBookJson(a??null)===stableGoalBookJson(b??null)
const write=(n:string,v:any)=>{assert(!existsSync(resolve(out,n)),'Immutable output already exists: '+n);writeFileSync(resolve(out,n),JSON.stringify(v,null,2)+'\n')}
const invPath=resolve(E,'final439-gates-command-map-technical-v1/INVENTORY.existing-full439-configs-D-lineage-and-current112-namespaces.json'),inv=read(invPath),L=inv.L6root
assert.equal(pin(invPath).sha256,'sha256:b37b24cc0d98b43739fcfc79a89a65f1abc2e285052bbe9888e9e039a2390369')
const bPath=resolve(E,'paired-all-seven-packages-and-HB7f-actual-current650-technical-v1/BINDING.actual439-P-and-twenty-SEM-source-FPs.json'), b=read(bPath)
for(const k of ['canonical','P439','SEM650','namespaceIndex'])assert.equal(pin(b[k].path).sha256,'sha256:'+b[k].sha256.replace(/^sha256:/,''),k)
assert.equal(b.canonical.sha256,'e0af9e3dedc6db17b940ec7d4732a6c2bcced7d00f3a30df9db948b9936332a8')
assert.equal(b.P439.sha256,'8f8a2a870cca12e918838c8e4ee36f56421d0d024ab2c73f04bc07ad427e7437')
const land=read(b.canonical.path),sem=read(b.SEM650.path),goals=new Map<string,any>(land.goals.map((g:any)=>[g.id,g])),kinds=new Map<string,string>(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const atomic=new Set<string>(sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
assert.equal(atomic.size,439);assert.equal(goals.size,650)
assert(sem.decisions.every((d:any)=>d.sourceFingerprint===fingerprintSemanticKindSourceGoal(goals.get(d.goalId))))
const cap=b.canonical.path.slice(0,b.canonical.path.indexOf('/curricula/'));assert.equal(realpathSync(stockPositiveRepoRoot),realpathSync(cap))
const configPath=inv.latestPrivateCentral.path,central=read(configPath),cfg=central.subjects.find((s:any)=>s.subject==='chemie')??central.subjects[0]
assert.equal(pin(configPath).sha256,'sha256:'+inv.latestPrivateCentral.sha256.replace(/^sha256:/,''))
assert(eq(cfg.resolutionSupersessions,inv.centralResolutionSupersessions));assert(eq(cfg.resolutionWithdrawals,inv.centralResolutionWithdrawals));assert(eq(cfg.resolutionSemanticRetirements,inv.centralResolutionSemanticRetirements))
const indices=inv.all105CurrentConfiguredDIndices.map((d:any)=>{
  assert.equal(pin(d.pin.path).sha256,'sha256:'+d.pin.sha256.replace(/^sha256:/,''));return {path:d.relativePath,index:read(d.pin.path),inventory:d}
})
assert.equal(indices.length,105);assert.deepEqual(indices.map((x:any)=>x.path),cfg.resolutionIndexPaths)
const retirementProof=validateResolutionSemanticRetirements({config:cfg,landscape:land,semanticKindLedger:sem,indices:indices.map(({path,index}:any)=>({path,index})),scopeIssues:[]})
assert.equal(retirementProof.issues.length,0,retirementProof.issues.join('\n'))
const chainResult=buildResolutionSupersessionChains(cfg.resolutionSupersessions,cfg.resolutionIndexPaths,atomic,retirementProof)
const schemaResults=indices.map(({path,index}:any)=>({indexPath:path,schemaVersion:index.schemaVersion,errors:index.schemaVersion===2?[...validateStandaloneResolutionIndexSchema(index),...validateStandaloneResolutionIndexStructure(index,atomic,{indexPath:path,proof:retirementProof})]:validateLegacyResolutionIndexSnapshot(index)}))
const retired=new Set<string>(cfg.resolutionSemanticRetirements.map((r:any)=>r.goalId)),withdrawn=new Map<string,any>(cfg.resolutionWithdrawals.map((w:any)=>[w.goalId,w]))
const retiredKeys=new Set<string>(cfg.resolutionSemanticRetirements.flatMap((r:any)=>r.historicalResolutions.map((h:any)=>h.indexPath+'::'+r.goalId)))
const supersededKeys=new Set<string>(chainResult.chains.flatMap((c:any)=>c.indexPaths.slice(0,-1).map((p:string)=>p+'::'+c.goalId)))
const pinChecks:any[]=[],invalidBindings=new Set<string>(),claims:any[]=[],entryByKey=new Map<string,any>()
for(const {path,index,inventory}:any of indices){
  for(const entry of index.resolutions){
    const f=inventory.resolutionFiles.find((x:any)=>x.goalId===entry.goalId), key=path+'::'+entry.goalId
    assert(f);const actual=pin(f.path),resolution=read(f.path),{resolutionFingerprint,...withoutFP}=resolution
    const errors:string[]=[]
    if(actual.sha256!=='sha256:'+f.sha256.replace(/^sha256:/,''))errors.push('inventory resolution byte pin differs')
    if(actual.sha256!==entry.resolutionDigest)errors.push('index resolution byte digest differs')
    if(resolutionFingerprint!==fingerprintGoalDescriptionDualRoundResolution(withoutFP))errors.push('stock resolutionFingerprint differs')
    if(resolutionFingerprint!==entry.resolutionFingerprint||resolution.goal.goalId!==entry.goalId)errors.push('index resolution identity differs')
    if(errors.length)invalidBindings.add(key)
    const row={goalId:entry.goalId,indexPath:path,resolutionPin:actual,errors};pinChecks.push(row)
    entryByKey.set(key,{entry,resolution,pin:actual,index,indexPath:path})
    if(!supersededKeys.has(key)&&!retiredKeys.has(key)&&!(withdrawn.get(entry.goalId)?.indexPath===path))claims.push({goalId:entry.goalId,owner:path})
  }
}
const withdrawalChecks=cfg.resolutionWithdrawals.map((w:any)=>{
  const e=entryByKey.get(w.indexPath+'::'+w.goalId),errors=[]
  if(!atomic.has(w.goalId)||!e||e.entry.resolutionDigest!==w.historicalResolutionDigest||invalidBindings.has(w.indexPath+'::'+w.goalId)||!w.reason?.trim()||cfg.resolutionSupersessions.some((s:any)=>s.goalId===w.goalId))errors.push('Withdrawal does not match one intact configured historical claim')
  return {...w,errors}
})
const chainPinChecks=chainResult.chains.map((c:any)=>({...c,errors:c.indexPaths.flatMap((p:string)=>!entryByKey.has(p+'::'+c.goalId)||invalidBindings.has(p+'::'+c.goalId)?['missing or changed historical byte-bound claim at '+p]:[])}))
const ownerByGoal=new Map<string,string>(),unique=new Set<string>(),overlaps:any[]=[]
for(const c of claims){const prev=claimUniqueGoal(c.goalId,c.owner,ownerByGoal,unique);if(prev)overlaps.push({goalId:c.goalId,owners:[prev,c.owner]})}
const unresolvedOwners=new Set<string>([...chainResult.invalidGoalIds,...chainPinChecks.filter((c:any)=>c.errors.length).map((c:any)=>c.goalId),...overlaps.map(x=>x.goalId)])
const inputCache=new Map<string,any>(),inputChecks=new Map<string,any>()
function oldRound(entry:any,round:string){
  const group=entry.index.groups.find((g:any)=>g.groupId===entry.entry.groupId);assert(group)
  const path=resolve(L,dirname(entry.indexPath),group.artifactDirectory??group.groupId,round,'description-review-input.json')
  assert(!relative(L,path).startsWith('..'))
  if(!inputCache.has(path)){
    const input=read(path),{reviewInputFingerprint,...without}=input
    inputCache.set(path,input);inputChecks.set(path,{pin:pin(path),declaredReviewInputFingerprint:reviewInputFingerprint,actualStockReviewInputFingerprint:fingerprintGoalDescriptionReviewInput(without),matches:reviewInputFingerprint===fingerprintGoalDescriptionReviewInput(without)})
  }
  const input=inputCache.get(path),goal=input.goals.find((g:any)=>g.goalId===entry.entry.goalId)
  return {path,input,goal}
}
const prows=readFileSync(b.P439.path,'utf8').split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x)),pById=new Map<string,any>(prows.map((p:any)=>[p.goalId,p]))
const nindex=read(b.namespaceIndex.path),namespaceByGoal=new Map<string,any>()
for(const f of nindex.fragments){const c=read(resolve(cap,f.configRelative));for(const id of f.goalIds){assert(!namespaceByGoal.has(id));namespaceByGoal.set(id,{...f,config:c})}}
assert.equal(namespaceByGoal.size,439)
const rows:any[]=[],pChecks:any[]=[]
const text=(g:any)=>({titleDe:g.title??'',titleEn:g.titleEn??'',descriptionDe:g.description??'',descriptionEn:g.descriptionEn??''})
function fieldDiff(before:any,after:any,prefix=''):any[]{
  if(eq(before,after))return []
  if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after))return [...new Set([...Object.keys(before),...Object.keys(after)])].sort().flatMap(k=>fieldDiff(before[k],after[k],prefix?prefix+'.'+k:k))
  return [{field:prefix,before:before??null,current:after??null}]
}
for(const id of [...atomic].sort()){
  const g=goals.get(id),p=pById.get(id),ns=namespaceByGoal.get(id),ctx=buildGoalDescriptionCanonicalContext(g),currentGoalFingerprint=fingerprintGoalForPositiveEvidence(g,kinds.get(id)),assets=stockResourceDigestsForGoal(g,new Set(['goal-visualization']))
  assert(p&&ns);const criteria=pin(resolve(cap,ns.config.reviewCriteriaPath)),reviewAssets=stockResourceDigestsForGoal(g,new Set(ns.config.reviewedResourceTypes)),pfp=fingerprintPositiveGoalEvidenceProfile(p.profile)
  const actualP={goalFingerprint:currentGoalFingerprint,profileFingerprint:pfp,reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteria.sha256,reviewAssets.digests,kinds.get(id)),reviewCriteriaFingerprint:criteria.sha256}
  const pBindingErrors=Object.keys(actualP).filter(k=>actualP[k as keyof typeof actualP]!==p[k]);if(p.reviewId!==ns.config.reviewId)pBindingErrors.push('reviewId')
  pChecks.push({goalId:id,criteria,reviewId:p.reviewId,actualStockFingerprints:actualP,bindingDifferences:pBindingErrors,resourceErrors:reviewAssets.errors})
  const base:any={goalId:id,titleDe:g.title,currentPins:{canonicalGoalFingerprint:currentGoalFingerprint,canonicalContextDiagnosticDigest:sha(stableGoalBookJson(ctx)),PRecordDiagnosticDigest:sha(stableGoalBookJson(p)),PProfileStockFingerprint:pfp,PReviewInputFingerprint:actualP.reviewInputFingerprint,criteria,assetDigests:assets.digests},currentPBindingErrors:pBindingErrors,currentAssetErrors:assets.errors,pageContextStatus:'PENDING_CURRENT_439_MODEL; no page, navigation, reverse-link or book-only equality claim',strictCurrentDClaim:false}
  if(withdrawn.has(id)){
    const w=withdrawn.get(id);rows.push({...base,status:'UNRESOLVED_WITHDRAWN_OWNER',withdrawal:w,action:'Current targeted D binding required; explicit historical withdrawal preserved',selectedOwner:null});continue
  }
  const owner=ownerByGoal.get(id),key=owner+'::'+id,e=entryByKey.get(key),schema=schemaResults.find((x:any)=>x.indexPath===owner)
  if(!owner||!unique.has(id)||unresolvedOwners.has(id)||!e||invalidBindings.has(key)||schema?.errors.length){rows.push({...base,status:'UNRESOLVED_OWNER_OR_STRUCTURAL_BINDING',selectedOwner:owner??null,action:'Resolve exact owner/chain/index before counting this evidence'});continue}
  let a:any,c:any
  try{a=oldRound(e,'round-a');c=oldRound(e,'round-b')}catch(error){rows.push({...base,status:'UNRESOLVED_OLD_INPUT',selectedOwner:owner,error:String(error)});continue}
  if(!a.goal||!c.goal){rows.push({...base,status:'UNRESOLVED_MISSING_GOAL_IN_OLD_INPUT',selectedOwner:owner});continue}
  const old=a.goal,other=c.goal,oldContext=old.canonicalContext??null,oldP=old.reviewContext?.evidenceProfile??null,otherP=other.reviewContext?.evidenceProfile??null,oldProfile=oldP?.profile??null
  const finalTextDiff=fieldDiff(e.resolution.goal.finalText,text(g)),canonicalDiff=oldContext?fieldDiff(oldContext,ctx):[{field:'canonicalContext',before:null,current:'Current context present; old input did not bind this context'}]
  const profileDiff=fieldDiff(oldProfile,p.profile),evidenceMetadataDiff=fieldDiff(oldP?Object.fromEntries(Object.entries(oldP).filter(([k])=>k!=='profile')):null,Object.fromEntries(Object.entries(p).filter(([k])=>k!=='profile')))
  const visual=old.reviewContext?.page?.visualization??null,currentVisualizationLinks=(g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization')
  const sameURL=visual?currentVisualizationLinks.find((l:any)=>l.url===visual.url):null
  const assetChanged=visual?(!sameURL||assets.digests[visual.url]!==visual.originalDigest):currentVisualizationLinks.length>0
  const oldPageFP=fingerprintGoalDescriptionReviewPage(old.reviewContext.page),oldContextFP=fingerprintGoalDescriptionReviewContext(old)
  const inputErrors=[]
  for(const q of [a,c])if(!inputChecks.get(q.path).matches)inputErrors.push('Old stock reviewInputFingerprint differs: '+q.path)
  if(oldPageFP!==old.pageFingerprint)inputErrors.push('Old stock pageFingerprint differs')
  if(oldContextFP!==e.resolution.goal.goalReviewContextFingerprint)inputErrors.push('Resolution goalReviewContextFingerprint differs from round-a goal')
  const roundDifferences=fieldDiff(old,other).map((x:any)=>x.field)
  const semanticChanges=finalTextDiff.length>0||canonicalDiff.length>0||profileDiff.length>0||assetChanged
  rows.push({...base,status:inputErrors.length?'UNRESOLVED_OLD_INPUT_BINDING':semanticChanges?'CHANGED_SUBSTANTIVE_INPUT':'READY_CANONICAL_P_ASSET_INPUT_SUBSET_ONLY',selectedOwner:owner,oldPins:{resolution:e.pin,index:pin(resolve(L,owner)),roundAInput:pin(a.path),roundBInput:pin(c.path),bookDigest:a.input.bookDigest,goalFingerprint:e.resolution.goal.goalFingerprint,pageFingerprint:e.resolution.goal.pageFingerprint,stockGoalReviewContextFingerprint:oldContextFP,oldPageStockFingerprint:oldPageFP,profileFingerprint:oldP?.profileFingerprint??null,reviewInputFingerprint:oldP?.reviewInputFingerprint??null,visualization:visual},finalTextDifferences:finalTextDiff,oldInputTextDifferences:fieldDiff({titleDe:old.currentTitleDe,titleEn:old.currentTitleEn,descriptionDe:old.currentDescriptionDe,descriptionEn:old.currentDescriptionEn},text(g)),canonicalContextDifferences:canonicalDiff,PProfileDifferences:profileDiff,PRecordMetadataDifferences:evidenceMetadataDiff,assetChanged,oldPProfilePresent:oldProfile!==null,oldPProfileSchema:oldP?.schemaVersion??null,oldRoundGoalDifferences:roundDifferences,oldRoundProfilesEqual:eq(oldP,otherP),oldInputBindingErrors:inputErrors,oldResolutionGoalFingerprintMatchesCurrent:e.resolution.goal.goalFingerprint===currentGoalFingerprint,action:semanticChanges?'Capture only changed current goal/context in a later targeted native subset; original evidence remains immutable':'Wait for actual current439 page/model comparison; this is no strict D pass',historicalFullDualRoundValidatorRerun:false})
}
const counts=(key:string)=>Object.fromEntries([...new Set(rows.map(r=>r[key]))].map(v=>[String(v),rows.filter(r=>r[key]===v).length]))
const summary={scope:439,statusCounts:counts('status'),selectedUniqueOwnerRows:rows.filter(r=>r.selectedOwner&& !r.status.startsWith('UNRESOLVED')).length,finalTextChanged:rows.filter(r=>r.finalTextDifferences?.length).length,canonicalContextChanged:rows.filter(r=>r.canonicalContextDifferences?.length).length,PProfileChanged:rows.filter(r=>r.PProfileDifferences?.length).length,assetChanged:rows.filter(r=>r.assetChanged).length,PMetadataChanged:rows.filter(r=>r.PRecordMetadataDifferences?.length).length,currentPBindingMismatches:pChecks.filter(r=>r.bindingDifferences.length||r.resourceErrors.length).length,currentPageContextsPending:439}
const stockScripts=['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts']
write('CHECK.stock-effective-owner-structure-and-original-byte-pins.json',{role:'Finite structural owner diagnosis only; no full historical validation or current D readiness vote',latestConfig:pin(configPath),registeredIndices:105,supersessionEdges:cfg.resolutionSupersessions.length,stockChains:chainResult.chains,stockChainIssues:chainResult.issues,stockInvalidChainGoalIds:[...chainResult.invalidGoalIds],chainPinChecks,withdrawalChecks,retirementIssues:retirementProof.issues,semanticRetirements:cfg.resolutionSemanticRetirements,schemaResults,resolutionPinChecks:pinChecks,overlaps,unresolvedOwnerGoalIds:[...unresolvedOwners],effectiveUniqueClaimIds:[...unique].filter(id=>atomic.has(id)&&!withdrawn.has(id)&&!unresolvedOwners.has(id)).sort(),fullDualRoundValidatorRerun:false})
write('CHECK.actual-current439-P-own-criteria-stock-input-fingerprints.json',{role:'Read-only finite stock fingerprint measurement; no record updates or new reviews',canonical:pin(b.canonical.path),P439:pin(b.P439.path),namespaceIndex:pin(b.namespaceIndex.path),rows:pChecks})
write('DIAGNOSTIC.selected-description-bindings.current-canonical-P-asset-field-differences.json',{schemaVersion:1,diagnosticContract:'selected-description-binding-field-diagnostic-v1',role:'Machine technical field diagnosis, no new scientific vote or Native-D gate',atUTC:new Date().toISOString(),inputs:{originalInventory:pin(invPath),latestL6Config:pin(configPath),assemblyBinding:pin(bPath),canonical650:pin(b.canonical.path),P439:pin(b.P439.path),SEM650:pin(b.SEM650.path),namespaceIndex:pin(b.namespaceIndex.path),stockScripts:stockScripts.map(p=>pin(resolve(R,p))),physicalAssetStockAdapter:pin(resolve(cap,'app/scripts/.L7-stock-positiveGoalEvidenceReview-exports.ts'))},summary,rows,oldInputStockFingerprintChecks:[...inputChecks.values()],boundaries:{newScienceVotes:0,reviewRunIds:[],humanApproval:false,M7:false,originalEvidenceUnmodified:true,fullCentralRun:false,fullNativeRun:false,compilerRun:false,PDFRender:false,historicalFullDualRoundValidityNotRerun:true,currentPageContextPending:true,metadataOmittedByStockCanonicalContext:['extendedData.skillPilotAcquisitionExtensions','extendedData.applicabilityOverrides'],noGlobalBookOrPaginationOnlyConclusionUntilCurrentModel:true}})
console.log(JSON.stringify(summary,null,2))
