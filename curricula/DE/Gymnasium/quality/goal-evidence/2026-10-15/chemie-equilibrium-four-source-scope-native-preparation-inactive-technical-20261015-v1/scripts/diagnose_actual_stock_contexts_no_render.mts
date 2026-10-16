// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,mkdirSync,unlinkSync,symlinkSync,existsSync,renameSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),repo=resolve(own,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const plan=read(resolve(own,process.argv[2]??'checks/INPUTS.no-render-stock-context.final-QA-ready.plan.technical.json'))
// Resolve root explicitly from an actual repository marker; do not assume source depth.
let root=own
while(!readFileSafe(resolve(root,'AGENTS.md')))root=dirname(root)
function readFileSafe(p:string){try{return readFileSync(p).length>0}catch{return false}}
const host=resolve(root,plan.host),mod=(n:string)=>import(pathToFileURL(resolve(host,'app/scripts',n+'.ts')).href)
const {loadGoalBookBuildInputs,stableGoalBookJson}=await mod('goalBookModel')
const {buildGoalDescriptionCanonicalContext}=await mod('validateGoalDescriptionReviewCampaign')
const {fingerprintGoalDescriptionReviewContext}=await mod('validateGoalDescriptionDualRoundResolution')
const {renderGoalBookReviewMarkdown}=await mod('exportGoalBookReviewBundle')
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile}=await mod('positiveGoalEvidenceProfileModel')
const wr=(name:string,v:any)=>writeFileSync(resolve(own,name),JSON.stringify(v,null,2)+'\n')
const baseSelector=read(resolve(root,plan.base367Selector.path)),base=read(resolve(root,baseSelector.canonical.path)),next=read(resolve(root,plan.canonical.path))
const oldBy=new Map(base.goals.map((g:any)=>[g.id,g])),newBy=new Map(next.goals.map((g:any)=>[g.id,g]))
const bodies=new Map(read(resolve(own,'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json')).profiles.map((r:any)=>[r.goalId,r.profile]))
const originalLines=plan.existingSelectedPProvenance.flatMap((r:any)=>readFileSync(resolve(root,r.records.path),'utf8').trim().split('\n'))
const allOriginal=originalLines.map((l:string)=>JSON.parse(l))
const original=allOriginal.filter((r:any)=>plan.targetGoalIds.includes(r.goalId))
writeFileSync(resolve(own,'profiles/base367-four-selected-P-records.whole-lines.exact.jsonl'),originalLines.filter((l:string)=>plan.targetGoalIds.includes(JSON.parse(l).goalId)).join('\n')+'\n')
const assets=new Map(plan.assets.map((a:any)=>[a.goalId,a]))
const bind=(r:any,g:any)=>{
 const q=structuredClone(r),a:any=assets.get(r.goalId),url=a?'/'+a.normalPublicDestination.slice('app/public/'.length):'',digests=a?{[url]:a.physicalRepositorySource.sha256}:{}
 q.goalFingerprint=fingerprintGoalForPositiveEvidence(g,'curricularAtomic')
 q.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,q.reviewCriteriaFingerprint,digests,'curricularAtomic')
 q.profile=bodies.get(r.goalId);q.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(q.profile)
 q.reviewId='chemie-source4-technical-raw-e0g0-current-input-v1';q.reviewRunIds=[];q.status='needs_human_review';q.reviewAuthority='ai_candidate';q.evidenceLevel='E0';q.maximumClaimScope='G0';q.reviewer='Technical stock input binding only';q.reason='Whole existing scientific profile body; raw current input with no positive evidence review or grant.';q.dissent=[]
 return q
}
const variants:any={base367:original,'prospective-wording':original.map((r:any)=>plan.descriptionChangeGoalIds.includes(r.goalId)?bind(r,newBy.get(r.goalId)):r),'prospective-raw-D4':original.map((r:any)=>plan.targetGoalIds.includes(r.goalId)?bind(r,newBy.get(r.goalId)):r)}
for(const name of ['prospective-wording','prospective-raw-D4']){
 const p=resolve(own,'profiles',name+'.selected-records.raw-technical.jsonl')
 const content=variants[name].map((r:any)=>JSON.stringify(r)).join('\n')+'\n'
 if(existsSync(p)&&readFileSync(p,'utf8')!==content)throw new Error('Existing bounded profile diagnostic differs '+p)
 if(!existsSync(p))writeFileSync(p,content)
}
const rawfour=resolve(own,'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl')
const rawcontent=variants['prospective-raw-D4'].filter((r:any)=>plan.targetGoalIds.includes(r.goalId)).map((r:any)=>JSON.stringify(r)).join('\n')+'\n'
if(existsSync(rawfour)&&readFileSync(rawfour,'utf8')!==rawcontent)throw new Error('Existing raw4 differs')
if(!existsSync(rawfour))writeFileSync(rawfour,rawcontent)
const cp=resolve(host,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),sp=resolve(host,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),qp=resolve(host,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const diag=resolve(host,'diagnostic-inputs');if(!existsSync(diag))mkdirSync(diag)
const rows:any={},models:any={}
for(const name of ['base367','prospective-wording','prospective-raw-D4']){
 const isbase=name==='base367',cpath=isbase?baseSelector.canonical.path:plan.canonical.path,spath=isbase?baseSelector.semantic.path:plan.semantic.path
 unlinkSync(cp);symlinkSync(resolve(root,cpath),cp);unlinkSync(sp);symlinkSync(resolve(root,spath),sp)
 if(plan.finalQA){unlinkSync(qp);symlinkSync(resolve(root,isbase?plan.baseQA.path:plan.finalQA.path),qp)}
 const profile=resolve(diag,'current.selected-records.jsonl');if(existsSync(profile))unlinkSync(profile)
 symlinkSync(resolve(own,'profiles',name==='base367'?'base367-four-selected-P-records.whole-lines.exact.jsonl':name+'.selected-records.raw-technical.jsonl'),profile)
 const loaded=await loadGoalBookBuildInputs(relative(root,resolve(own,'config',name+'.diagnostic-whole422.no-render.config.json')),host)
 models[name]=loaded.model;const pby=new Map(variants[name].map((r:any)=>[r.goalId,r])),cby=isbase?oldBy:newBy
 rows[name]=new Map(loaded.model.pages.map((page:any)=>{
  const goal:any=cby.get(page.goalId)
  const row={goalId:page.goalId,goalFingerprint:page.goalFingerprint,pageFingerprint:page.pageFingerprint,currentTitleDe:goal.title,currentTitleEn:goal.titleEn,currentDescriptionDe:goal.description,currentDescriptionEn:goal.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(goal),reviewContext:{page,evidenceProfile:pby.get(page.goalId)??null}}
  return[page.goalId,row]
 }))
 console.log(JSON.stringify({variant:name,stockPages:loaded.model.pages.length,modelDigest:loaded.model.digest}))
}
function dif(a:any,b:any,path=''):any[]{
 if(stableGoalBookJson(a)===stableGoalBookJson(b))return[]
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b))return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>dif(a[k],b[k],path+'/'+k))
 return[{path,before:a,after:b}]
}
const changes:any[]=[]
for(const [gid,b]of rows.base367){
 const n=rows['prospective-wording'].get(gid),raw=rows['prospective-raw-D4'].get(gid),d=dif(b,n),rd=dif(n,raw)
 if(d.length||rd.length||plan.targetGoalIds.includes(gid))changes.push({goalId:gid,target:plan.targetGoalIds.includes(gid),descriptionEdited:plan.descriptionChangeGoalIds.includes(gid),canonicalAndNecessaryRawBindingDiff:d,additionalRawD4AdministrativeDiff:rd,baseContextFP:fingerprintGoalDescriptionReviewContext(b),prospectiveContextFP:fingerprintGoalDescriptionReviewContext(n),rawD4ContextFP:fingerprintGoalDescriptionReviewContext(raw)})
}
const allids=[...rows.base367.keys()],changed=changes.filter((r:any)=>r.canonicalAndNecessaryRawBindingDiff.length).map((r:any)=>r.goalId),rawchanged=changes.filter((r:any)=>r.additionalRawD4AdministrativeDiff.length).map((r:any)=>r.goalId)
wr('checks/DIFF.actual-stock422-goal-page-contexts.no-render.json',{role:'Actual in-memory stock pages/canonicalContext and genuine review-context fingerprint function. No bundle/PDF or review-ready fingerprint is invented.',baseline:plan.base367Selector,prospectiveCanonical:plan.canonical,all422GoalIdsSame:allids.length===422&&allids.every(g=>rows['prospective-wording'].has(g)),comparedActualStockPages:allids.length,wholeBookModelDigestsDiagnosticOnly:Object.fromEntries(Object.keys(models).map(k=>[k,models[k].digest])),descriptionEditGoalIds:plan.descriptionChangeGoalIds,actualCanonicalOrRequiredBindingChangedGoalIds:changed,additionalRawD4AdministrativeChangedGoalIds:rawchanged,unchangedStockContextGoalIds:allids.filter(g=>!changed.includes(g)&&!rawchanged.includes(g)),rows:changes,footerModelDigestNotUsedAsTrigger:true,bundleFingerprint:null,validExportedReviewInput:false,finalImageAndQAReady:!!plan.finalQAReady,nativePrepareRuns:0,rendererRuns:0,newScienceVotes:0})
const selected=plan.targetGoalIds.map((id:string)=>rows['prospective-raw-D4'].get(id))
wr('diagnostic/four-stock-goal-review-bodies.no-bundle-no-render.json',{role:'Actual stock goal review bodies only; no review bundle/campaign/record permission; final image/QA pending',goals:selected,bundleFingerprint:null,bookDigest:null})
writeFileSync(resolve(own,'diagnostic/four-stock-page-content.no-render.md'),renderGoalBookReviewMarkdown({schemaVersion:1,book:models['prospective-raw-D4'].book,modelDigest:models['prospective-raw-D4'].digest,pages:selected.map((r:any)=>r.reviewContext)}))
wr('checks/ABSENCE.authored-source-and-LK-declaration-in-normal-stock-D-context.json',{role:'Concrete stock field-presence evidence; no claim that an external sidecar is active in the stock input',actualNormalCanonicalContextKeys:Object.keys(selected[0].canonicalContext),actualNormalReviewContextKeys:Object.keys(selected[0].reviewContext),actualNormalPageKeys:Object.keys(selected[0].reviewContext.page),externalOnlyScientificSidecars:['inputs/eight-authored-components-and-explicit-assumptions.unreviewed.neutral.json','inputs/four-existing-LK-target-author-declaration.unreviewed.neutral.json','inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json'],externalOnlyFieldsAffectingNormalStockFingerprints:false,normalSourceOrCourseRegistrationApplied:false,requiredFreshReaderInstruction:'Read the external complete neutral source/course sidecars in addition to normal stock D inputs; no sidecar field is represented as an already effective official curriculum mapping.',allFourScientificProfileBodiesExact:plan.targetGoalIds.every((gid:string)=>stableGoalBookJson(variants['prospective-raw-D4'].find((r:any)=>r.goalId===gid).profile)===stableGoalBookJson(bodies.get(gid))),nativePrepareRuns:0})
// Existing selected P records have different legitimate reviewed-resource scopes. Audit each
// with its own configured resource types, without applying goal-book resource assumptions.
const pr=[]
for(const provenance of plan.existingSelectedPProvenance){
 const cfg=read(resolve(root,provenance.config.path)),types=new Set(cfg.reviewedResourceTypes??[])
 const records=readFileSync(resolve(root,cfg.reviewPath),'utf8').trim().split('\n').map((l:string)=>JSON.parse(l))
 for(const r of records){
  const oldGoal:any=oldBy.get(r.goalId),newGoal:any=newBy.get(r.goalId)
  const dig=(g:any,list:any[])=>{
   const d:any={}
   if(types.has('goal-visualization'))for(const link of g.resourceLinks??[]){if(link.type==='goal-visualization'){
    const a:any=list.find((a:any)=>'/'+a.normalPublicDestination.slice('app/public/'.length)===link.url)
    if(!a)throw new Error('Missing exact asset reference '+link.url)
    d[link.url]=a.physicalRepositorySource.sha256
   }}
   return d
  }
  const oldfp=fingerprintPositiveGoalEvidenceReviewInput(oldGoal,r.reviewCriteriaFingerprint,dig(oldGoal,plan.baseAssets??plan.assets),'curricularAtomic')
  if(oldfp!==r.reviewInputFingerprint)throw new Error('Actual old367 P binding mismatch '+r.goalId)
  const newfp=fingerprintPositiveGoalEvidenceReviewInput(newGoal,r.reviewCriteriaFingerprint,dig(newGoal,plan.assets),'curricularAtomic')
  pr.push({goalId:r.goalId,oldExact:true,canonicalChangeAffectsBinding:oldfp!==newfp,reviewedResourceTypes:[...types]})
 }
}
wr('checks/DIFF.actual-all392-selected-P-binding-scope-preservation.no-new-review.json',{role:'Actual stock fingerprint comparison under each unchanged original P configuration resource scope; no new records or transported approval',oldSelectedRows:pr.length,allOriginalBindingsExact:pr.every(r=>r.oldExact),changedGoalIds:pr.filter(r=>r.canonicalChangeAffectsBinding).map(r=>r.goalId),unchangedGoalIds:pr.filter(r=>!r.canonicalChangeAffectsBinding).map(r=>r.goalId),rows:pr,newPApprovals:0})
console.log(JSON.stringify({actualPagesCompared:allids.length,canonicalOrRequiredBindingChanged:changed,additionalRawAdministrativeChanged:rawchanged,unaffectedGoalContexts:allids.length-new Set([...changed,...rawchanged]).size,prepare:0,render:0}))
