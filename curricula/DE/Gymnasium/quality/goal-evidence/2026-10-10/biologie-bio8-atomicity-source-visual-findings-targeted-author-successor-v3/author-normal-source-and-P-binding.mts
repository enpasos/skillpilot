// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs'
import {resolve,dirname,basename} from 'node:path'
import {pathToFileURL} from 'node:url'
const R='/home/enpasos/projects/skillpilot', C=R+'/tmp/m7-bio8-findings-v3-author-isolated-capsule', P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const put=(p:string,obj:any)=>{const f=resolve(R,P,p);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});mkdirSync(dirname(resolve(C,P,p)),{recursive:true});copyFileSync(f,resolve(C,P,p))}
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput}=await import(pathToFileURL(C+'/app/scripts/positiveGoalEvidenceProfileModel.ts').href)
const {fingerprintGoalForEvidence,fingerprintGoalEvidenceReviewInput}=await import(pathToFileURL(C+'/app/scripts/goalEvidenceProfileModel.ts').href)
const cfg=read(P+'/native/whole396-closed-contract-author.normal.config.json'), goals=new Map(read(cfg.landscapePath).goals.map((g:any)=>[g.id,g])), kinds=new Map(read(cfg.semanticKindLedgerPath).decisions.map((d:any)=>[d.goalId,d.semanticKind])), qa=new Map(read(cfg.goalVisualizationQaPath).records.map((r:any)=>[r.goalId,r]))
const changes:any[]=[];let fileNo=0
cfg.evidenceReviewPaths=cfg.evidenceReviewPaths.map((path:string)=>{
 const rows=readFileSync(resolve(R,path),'utf8').trim().split(/\r?\n/u).map(l=>JSON.parse(l));let changed=false
 for(const row of rows){
  const goal:any=goals.get(row.goalId), kind:any=kinds.get(row.goalId), q:any=qa.get(row.goalId);const digests=q?{[q.imageUrl]:q.assetSha256}:{}
  const old=JSON.parse(JSON.stringify(row));const pos=row.schemaVersion===2
  const semantic=pos?fingerprintGoalForPositiveEvidence(goal,kind):fingerprintGoalForEvidence(goal,row.ruleVersion,kind)
  assert.equal(row.goalFingerprint,semantic,'Protected science semantic change '+row.goalId)
  const fp=pos?fingerprintPositiveGoalEvidenceReviewInput(goal,row.reviewCriteriaFingerprint,digests,kind):fingerprintGoalEvidenceReviewInput(goal,row.ruleVersion,row.reviewCriteriaFingerprint,digests,kind)
  if(fp!==row.reviewInputFingerprint){row.reviewInputFingerprint=fp;changed=true;changes.push({goalId:row.goalId,originalPath:path,oldReviewInputFingerprint:old.reviewInputFingerprint,currentReviewInputFingerprint:fp,wholeScienceProfileAndSemanticGoalFingerprintExact:true,statusRetainedWithoutNewApproval:row.status,authorityRetainedFromOriginal:row.reviewAuthority})}
 }
 if(!changed)return path
 const local='positive/retained-science-route-only-current-'+String(++fileNo).padStart(2,'0')+'.exact.jsonl',f=resolve(R,P,local);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,rows.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'});copyFileSync(f,resolve(C,P,local));return P+'/'+local
})
put('checks/retained-whole-P-route-only-technical-bindings.author.json',{records:changes,technicalRebindingOnly:true,newIndependentApproval:false,requiredTargetedDescriptionContextReview:true})
put('native/whole396-final-current.normal.config.json',cfg)
const {buildGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt}=await import(pathToFileURL(C+'/app/scripts/goalBookSourceAtlasInputs.ts').href)
const at=read(P+'/sources/final-four-exact-source-metadata-alias-atlas.normal.config.json');at.outputDirectory='app/scripts/config/goal-books/author-bio8-four396-20261010-v3/source-views';at.manifestPath='app/scripts/config/goal-books/author-bio8-four396-20261010-v3/atlas.sources.json';at.navigationViewPath='app/scripts/config/goal-books/author-bio8-four396-20261010-v3/navigation.view.json';at.receiptPath='app/scripts/config/goal-books/author-bio8-four396-20261010-v3/receipt.json'
put('sources/final-four-book-local-execution-atlas.normal.config.json',at)
const result=buildGoalBookSourceAtlasInputs(at,C)
put('sources/final-four396.normal-atlas.receipt.compact.json',compactGoalBookSourceAtlasReceipt(result.receipt))
put('sources/final-four396.normal-atlas.receipt.whole.json',result.receipt)
const aliases=[]
for(const [path,bytes]of Object.entries(result.outputs)){const local='sources/normal-output/'+basename(path),f=resolve(R,P,local);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,bytes as string,{flag:'wx'});aliases.push({normalBookLocalOutputPathDiagnosticOnly:path,actualPortableCopyPath:P+'/'+local})}
put('sources/normal-output-portable-path-aliases.json',{records:aliases,allNormalOutputBytesExact:true,sourceApproval:false})
console.log(JSON.stringify({retainedPTechnicalBindings:changes.map(r=>r.goalId),sourceCounts:result.receipt.counts,sourceViews:result.receipt.scopes.length,outputFiles:aliases.length}))
