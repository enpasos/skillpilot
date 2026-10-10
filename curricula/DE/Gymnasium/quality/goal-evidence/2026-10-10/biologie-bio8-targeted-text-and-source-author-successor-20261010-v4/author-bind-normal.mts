// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs'
import {resolve,dirname,basename} from 'node:path'
import {pathToFileURL} from 'node:url'
const R=process.cwd()
const C=resolve(R,'tmp/bio8-targeted-text-source-v4-native-capsule')
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const O=B+'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
const P=B+'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const put=(p:string,obj:any)=>{const f=resolve(R,P,p);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(obj,null,2)+'\n')}
const {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,writeGoalBookModel}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookModel.ts')).href)
const pos=await import(pathToFileURL(resolve(R,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const landscapePath=P+'/candidate/whole483-final-text-source-image.inactive.json'
const land=read(landscapePath),gm=new Map(land.goals.map((g:any)=>[g.id,g]))
const kinds=read(O+'/candidate/kinds396.final-fossil-image-classification.json')
kinds.sourceLandscapePath=landscapePath
const changedKinds=[]
for(const d of kinds.decisions){const fp=fingerprintSemanticKindSourceGoal(gm.get(d.goalId));if(fp!==d.sourceFingerprint){changedKinds.push(d.goalId);d.sourceFingerprint=fp}}
put('candidate/kinds396.author-classification-only.json',kinds)
const km=new Map(kinds.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const qa=read(P+'/candidate/QA396.author-pending.json'),qm=new Map(qa.records.map((q:any)=>[q.goalId,q]))
const records=readFileSync(resolve(R,O,'positive/ten-final-fossil-image-author.pending.review.jsonl'),'utf8').trim().split(/\r?\n/u).map(l=>JSON.parse(l))
const candidateSet=read(P+'/positive/ten-whole-author-candidates.current.json')
const updates=[]
for(const row of records){
 const previous=JSON.parse(JSON.stringify(row)),g:any=gm.get(row.goalId),q:any=qm.get(row.goalId)
 row.profile=candidateSet.goals.find((c:any)=>c.goalId===row.goalId).profile
 row.goalFingerprint=pos.fingerprintGoalForPositiveEvidence(g,km.get(row.goalId))
 row.reviewInputFingerprint=pos.fingerprintPositiveGoalEvidenceReviewInput(g,row.reviewCriteriaFingerprint,q?{[q.imageUrl]:q.assetSha256}:{},km.get(row.goalId))
 row.profileFingerprint=pos.fingerprintPositiveGoalEvidenceProfile(row.profile)
 if(JSON.stringify(row)!==JSON.stringify(previous))updates.push({goalId:row.goalId,before:previous,after:row,wholeScienceProfileExact:JSON.stringify(previous.profile)===JSON.stringify(row.profile),newIndependentScienceJudgment:false})
 assert.equal(row.reviewAuthority,'ai_candidate');assert.equal(row.status,'needs_human_review');assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
}
writeFileSync(resolve(R,P,'positive/ten-current-author.pending.review.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
put('checks/P10-current-exact-binding-deltas.author.json',{records:updates,kindSourceFingerprintsUpdated:changedKinds,newIndependentScienceJudgments:0,humanApproval:0})
const pc=read(O+'/positive/ten-final-fossil-image-author.pending.config.json')
Object.assign(pc,{landscapePath,semanticKindLedgerPath:P+'/candidate/kinds396.author-classification-only.json',reviewPath:P+'/positive/ten-current-author.pending.review.jsonl'})
put('positive/ten-current-author.pending.config.json',pc)
const cfg=read(O+'/native/whole396-final-fossil-image.normal.config.json')
Object.assign(cfg,{landscapePath,semanticKindLedgerPath:pc.semanticKindLedgerPath,goalVisualizationQaPath:P+'/candidate/QA396.author-pending.json',outputPath:P+'/native/whole396.normal-model.actual.json'})
cfg.evidenceReviewPaths=cfg.evidenceReviewPaths.map((p:string)=>p===O+'/positive/ten-final-fossil-image-author.pending.review.jsonl'?pc.reviewPath:p)
put('native/whole396.normal.config.json',cfg)
const current=await loadGoalBookBuildInputs(P+'/native/whole396.normal.config.json',C)
await writeGoalBookModel(current.model,resolve(R,cfg.outputPath))
const old=read(O+'/native/whole396-final-fossil-image.normal-model.actual.json'),oldPages=new Map(old.pages.map((p:any)=>[p.goalId,p]))
const deltas=current.model.pages.filter((p:any)=>JSON.stringify(p)!==JSON.stringify(oldPages.get(p.goalId))).map((p:any)=>({goalId:p.goalId,before:oldPages.get(p.goalId),after:p}))
put('checks/whole396-page-context-deltas.author.json',{previousModelDigest:old.digest,currentModelDigest:current.model.digest,actualChangedWholePages:deltas,unchangedWholePages:396-deltas.length,independentDescriptionReviewRequiredGoalIds:deltas.map((r:any)=>r.goalId),reviewAuthority:'author_only'})
const batch=read(O+'/native/nineteen-final-current-native.prerequisite-safe.batch.config.json')
Object.assign(batch,{batchId:'biologie-bio8-targeted-text-source-image-native-20261010-v4',bookId:'biologie-bio8-targeted-text-source-image-native-20261010-v4',title:'Biologie – gezielt korrigierte vollständige Seiten und Kontexte',baseGoalBookConfigPath:P+'/native/whole396.normal.config.json',goalIds:deltas.map((r:any)=>r.goalId),outputDirectory:P+'/native/affected-current-native',publicRoot:'app/public'})
put('native/affected-current-native.batch.config.json',batch)
const at=read(P+'/sources/normal-atlas.config.json');Object.assign(at,{landscapePath,semanticKindLedgerPath:pc.semanticKindLedgerPath});put('sources/final-normal-atlas.config.json',at)
const {buildGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const atlas=buildGoalBookSourceAtlasInputs(at,C)
put('sources/normal-atlas.receipt.whole.json',atlas.receipt);put('sources/normal-atlas.receipt.compact.json',compactGoalBookSourceAtlasReceipt(atlas.receipt))
const aliases=[]
for(const [normalPath,bytes] of Object.entries(atlas.outputs)){const local='sources/normal-output/'+basename(normalPath);mkdirSync(dirname(resolve(R,P,local)),{recursive:true});writeFileSync(resolve(R,P,local),bytes as string);aliases.push({normalBookLocalPathDiagnosticOnly:normalPath,actualCommittableCopy:P+'/'+local})}
put('sources/normal-output.portable-aliases.json',{records:aliases,exactReturnedNormalBytes:true,sourceApproval:false})
console.log(JSON.stringify({wholeGoals:land.goals.length,wholePages:current.model.pages.length,changedPages:deltas.map((d:any)=>d.goalId),PBindingChanges:updates.map((u:any)=>u.goalId),sourceScopes:atlas.receipt.scopes.length,sourceCounts:atlas.receipt.counts,newIndependentScienceJudgments:0}))
