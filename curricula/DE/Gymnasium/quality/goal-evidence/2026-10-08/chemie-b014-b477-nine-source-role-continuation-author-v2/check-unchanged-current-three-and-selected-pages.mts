// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(bytes:any)=>createHash('sha256').update(bytes).digest('hex')
const fp=(bytes:any)=>'sha256:'+digest(bytes)
const bind=(p:string)=>({path:relative(root,p),sha256:digest(readFileSync(p)),bytes:readFileSync(p).length})
const write=(p:string,v:unknown)=>writeFileSync(join(here,p),JSON.stringify(v,null,2)+'\n')
const {loadGoalBookBuildInputs}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const {validatePositiveGoalEvidenceRecordSemantics}=await import(pathToFileURL(join(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const {normalizeGoalEvidenceText,stableGoalEvidenceJson}=await import(pathToFileURL(join(root,'app/scripts/goalEvidenceProfileModel.ts')).href)
const guard=read(join(here,'declared-current-owned-input-bindings.actual.json'))
for(const b of guard.inputBindings)if(digest(readFileSync(join(root,b.path)))!==b.sha256)throw new Error('Owned input drift: '+b.path)
const registry=read(join(root,guard.registryPath)),chem=registry.subjects.find((x:any)=>x.subject==='chemie')
if(fp(stableGoalEvidenceJson(chem))!=='sha256:'+guard.currentChemistryRegistrySubjectSha256)throw new Error('Chemistry registry subject drift')
const landscape=read(join(root,chem.landscapePath)),byId=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const kinds=read(join(root,chem.semanticKindLedgerPath)),kindBy=new Map(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const selected=guard.validUntouchedReuseGoalIds
const raw=read(join(here,'existing-valid-three-whole-positive-records-and-reuse-boundaries.raw.json'))
const vBy=new Map(read(join(root,chem.visualizationQaPath)).records.map((r:any)=>[r.goalId,r]))
const mc=read(join(root,chem.memoryReviewConfigPath)),memoryBy=new Map(readFileSync(join(root,mc.reviewPath),'utf8').split('\n').filter(Boolean).map((l:string)=>{const r=JSON.parse(l);return[r.goalId,r]}))
const atomicRecords:any[]=[]
for(const cp of chem.semanticAtomicityConfigPaths){
 const c=read(join(root,cp))
 for(const [n,line] of readFileSync(join(root,c.reviewPath),'utf8').split('\n').entries()){
  if(!line)continue
  const r=JSON.parse(line)
  if(selected.includes(r.goalId))atomicRecords.push({configPath:cp,reviewPath:c.reviewPath,line:n+1,row:r})
 }
}
const semanticFP=(g:any,ruleVersion:string)=>fp(stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',
 title:normalizeGoalEvidenceText(g.title),titleEn:normalizeGoalEvidenceText(g.titleEn),description:normalizeGoalEvidenceText(g.description),descriptionEn:normalizeGoalEvidenceText(g.descriptionEn),
 phase:normalizeGoalEvidenceText(g.dimensionTags?.phase),area:normalizeGoalEvidenceText(g.dimensionTags?.area),topicCode:normalizeGoalEvidenceText(g.dimensionTags?.topicCode),nodeKind:normalizeGoalEvidenceText(g.nodeKind)}))
const entries=selected.map((goalId:string)=>{
 const g:any=byId.get(goalId),v:any=vBy.get(goalId),m:any=memoryBy.get(goalId)
 const old=raw.wholeCurrentGoals.find((x:any)=>x.id===goalId)
 if(stableGoalEvidenceJson(g)!==stableGoalEvidenceJson(old))throw new Error('Whole valid goal drift: '+goalId)
 const asset=fp(readFileSync(join(root,v.canonicalAssetPath))),pub=fp(readFileSync(join(root,v.publicAssetPath)))
 const primary=g.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&r.role==='primary')
 if(v.aiApproved!=='yes'||asset!==pub||asset!==v.assetSha256||asset!==v.aiApprovedAssetSha256||primary.url!==v.imageUrl||g.title!==v.title||g.description!==v.description)throw new Error('Valid V binding drift: '+goalId)
 if(!m||m.fingerprint!==semanticFP(g,m.ruleVersion)||!['memory_required','no_memory_needed'].includes(m.status))throw new Error('Valid M binding drift: '+goalId)
 const a=atomicRecords.filter((x:any)=>x.row.goalId===goalId&&x.row.status==='atomic'&&x.row.semanticAtomic===true&&x.row.fingerprint===semanticFP(g,x.row.ruleVersion))
 if(!a.length)throw new Error('Valid A binding drift: '+goalId)
 const records=raw.retainedPositiveRecords.filter((x:any)=>x.goalId===goalId)
 const positive=records.map((r:any)=>({retained:r,errors:validatePositiveGoalEvidenceRecordSemantics(r.wholeRecord,g,{[v.imageUrl]:asset},kindBy.get(goalId)),
  criteriaActualDigest:fp(readFileSync(join(root,r.config.reviewCriteriaPath)))})).filter((r:any)=>r.errors.length===0&&r.criteriaActualDigest===r.retained.wholeRecord.reviewCriteriaFingerprint)
 if(positive.length!==1)throw new Error('Expected one exact current P record: '+goalId+'; actual '+positive.length)
 if(positive[0].retained.wholeRecord.status!=='needs_human_review'||positive[0].retained.wholeRecord.reviewAuthority!=='ai_candidate')throw new Error('Truthful P status drift: '+goalId)
 return{goalId,wholeUnchangedGoal:g,A:{exactCurrentExistingRecords:a,newReview:false},M:{wholeExistingRecord:m,reviewPath:mc.reviewPath,newDecision:false,newCardOrVisibilityReview:false},
  V:{wholeExistingRecord:v,canonicalAssetBinding:bind(join(root,v.canonicalAssetPath)),publicAssetBinding:bind(join(root,v.publicAssetPath)),newVisualReview:false},
  P:{...positive[0],newScienceReview:false,newProfileOrStatus:false},
  currentStrictMachineCompletionRetained:true,humanApproval:false,humanTrial:false}
})
write('current-three-valid-A-M-V-P-exact-binding-reuse.native.actual.json',{schemaVersion:1,role:'Exact current unchanged valid evidence routing; native verification does not repeat scientific or visual review.',
 createdAtUTC:new Date().toISOString(),entries,exactExistingCurrentGoals:3,repeatedScientificReviews:0,newMachineApprovals:0,newHumanApprovals:0})
const pure='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-current480-atomic-prerequisite-remediation-author-v7/candidate/baseline-native-book.config.json'
const model=await loadGoalBookBuildInputs(pure,root)
if(model.model.pages.length!==378)throw new Error('Unexpected Chemistry current review universe')
const ids=[guard.heldParentId,...selected],pages=ids.map((id:string)=>model.model.pages.find((p:any)=>p.goalId===id))
if(pages.some((p:any)=>!p))throw new Error('Whole selected current native page missing')
write('whole-current-b477-and-valid-three-pages-and-contexts.native.raw.json',{schemaVersion:1,
 role:'Current selected pure native review-model pages/context only; no new D review, active atlas navigation equality, HTML/PDF or build claim.',
 pureConfigBinding:bind(join(root,pure)),wholeNativeReviewUniverse:378,selectedWholePages:pages,reviewedScienceAgain:false})
for(const b of guard.inputBindings)if(digest(readFileSync(join(root,b.path)))!==b.sha256)throw new Error('Owned input drift during native check: '+b.path)
console.log(JSON.stringify({nativeCurrentPValidation:3,currentExistingA:3,currentExistingM:3,currentExistingV:3,selectedWholeNativePages:4,newScientificApprovals:0,strictGain:0,activeWrites:false}))
