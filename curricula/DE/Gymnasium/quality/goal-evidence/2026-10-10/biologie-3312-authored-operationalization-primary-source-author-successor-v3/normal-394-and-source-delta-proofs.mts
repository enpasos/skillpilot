// SPDX-License-Identifier: Apache-2.0
// Uses unchanged normal APIs. No source, description or human approval is granted.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
import {expandGoalBookSourceAtlasReceipt} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const C=process.argv[process.argv.indexOf('--capsule')+1]
const stage=process.argv[process.argv.indexOf('--stage')+1]
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-operationalization-primary-source-author-successor-v3'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
const D=resolve(C,P), ID='3312b2bb-bc90-5c0f-a859-4b4f9b8ff117',SID='8229f9d4-78f9-4968-8667-0c93aba0c0d6'
const read=(p:string)=>JSON.parse(readFileSync(resolve(C,p),'utf8'))
const put=(p:string,j:any)=>{mkdirSync(dirname(resolve(D,p)),{recursive:true});writeFileSync(resolve(D,p),JSON.stringify(j,null,2)+'\n')}
const actual=await loadGoalBookBuildInputs(`${P}/normal/national394-${stage}.normal.config.json`,C)
assert.equal(actual.model.pages.length,394)
put(`normal/national394-${stage}.actual-model.json`,actual.model)
if(stage==='after'){
 const before=read(`${P}/normal/national394-before.actual-model.json`)
 const bp=new Map(before.pages.map((p:any)=>[p.goalId,p]))
 const changes=actual.model.pages.filter(p=>stableGoalBookJson(p)!==stableGoalBookJson(bp.get(p.goalId))).map(p=>p.goalId)
 const protectedIds=read(`${P}/inputs/protected315-baseline-IDs.exact.json`).subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
 assert.equal(protectedIds.length,315)
 const sourceBefore=read(`${P}/inputs/whole144-source-extraction.exact.json`),sourceAfter=read(`${P}/candidate/whole144-only8229-authored-operationalization.source-extraction.json`)
 const oldRows=new Map(sourceBefore.sourceGoals.map((g:any)=>[g.id,g])), newRows=new Map(sourceAfter.sourceGoals.map((g:any)=>[g.id,g]))
 const sourceChanges=[...newRows.keys()].filter(id=>stableGoalBookJson(newRows.get(id))!==stableGoalBookJson(oldRows.get(id)))
 assert.deepEqual(sourceChanges,[SID])
 const mapBefore=read(`${P}/inputs/whole144-mapping.exact.json`),mapAfter=read(`${P}/candidate/whole144-only8229-partial-edge.review.json`)
 const mappingChanges=mapAfter.mappings.filter((r:any,i:number)=>stableGoalBookJson(r)!==stableGoalBookJson(mapBefore.mappings[i]))
 assert.equal(mappingChanges.length,1);assert.equal(mappingChanges[0].legacyGoalId,SID);assert.equal(mappingChanges[0].canonicalGoalId,ID);assert.equal(mappingChanges[0].matchType,'partial')
 const bReceipt:any=expandGoalBookSourceAtlasReceipt(read(`${P}/normal/atlas-before-outputs/source-projection.receipt.json`))
 const aReceipt:any=expandGoalBookSourceAtlasReceipt(read(`${P}/normal/atlas-after-outputs/source-projection.receipt.json`))
 const bw=bReceipt.scopes.flatMap((s:any)=>s.witnesses),aw=aReceipt.scopes.flatMap((s:any)=>s.witnesses)
 const witnessScience=(rows:any[],goalId:string,ex:any,map:any)=>rows.filter(r=>r.goalId===goalId).map(r=>{
  const result={...r};delete result.mappingPath;delete result.sourceExtractionPath
  if(r.sourceGoalId===SID){result.actualCurrentSourceRow=ex.sourceGoals.find((g:any)=>g.id===SID);result.actualCurrentMappingRows=map.mappings.filter((g:any)=>g.legacyGoalId===SID)}
  return stableGoalBookJson(result)
 }).sort()
 const changedWitnessScience=actual.model.pages.filter(p=>stableGoalBookJson(witnessScience(bw,p.goalId,sourceBefore,mapBefore))!==stableGoalBookJson(witnessScience(aw,p.goalId,sourceAfter,mapAfter))).map(p=>p.goalId)
 assert.deepEqual(changedWitnessScience,[ID])
 const protectedSourceChanges=protectedIds.filter((id:string)=>changedWitnessScience.includes(id)),protectedPageChanges=protectedIds.filter((id:string)=>changes.includes(id))
 assert.deepEqual(protectedSourceChanges,[]);assert.deepEqual(protectedPageChanges,[]);assert.deepEqual(changes,[])
 const old=read(`${O}/candidate/whole479-title-methyl-eight-links.inactive.json`),kinds=read(`${O}/candidate/whole479-semantic-kinds.only3312-title.pending-targeted-AM.json`)
 const kind=kinds.decisions.find((r:any)=>r.goalId===ID);assert.equal(fingerprintSemanticKindSourceGoal(old.goals.find((g:any)=>g.id===ID)),kind.sourceFingerprint)
 put('checks/actual-normal394-pages-source-context-and-protected315-delta.json',{schemaVersion:1,normalAPIs:['loadGoalBookBuildInputs','expandGoalBookSourceAtlasReceipt','fingerprintSemanticKindSourceGoal','stableGoalBookJson'],beforeDigest:before.digest,afterDigest:actual.model.digest,whole394IDsExact:stableGoalBookJson(before.pages.map((p:any)=>p.goalId))===stableGoalBookJson(actual.model.pages.map(p=>p.goalId)),all394WholePageBodiesExact:true,actualPageDeltaIds:changes,actualSourceGoalRowDeltaIds:sourceChanges,actualSingleMappingEdgeDelta:mappingChanges,actualSourceWitnessScienceDeltaIds:changedWitnessScience,protected315SourceWitnessScienceChanges:protectedSourceChanges,protected315WholePageChanges:protectedPageChanges,protected315CurrentWholeGoalBodiesExact:true,allOther143SourceRowsAndAllPassageBodiesExact:stableGoalBookJson(sourceBefore.sourceGoals.filter((g:any)=>g.id!==SID))===stableGoalBookJson(sourceAfter.sourceGoals.filter((g:any)=>g.id!==SID))&&stableGoalBookJson(sourceBefore.passages)===stableGoalBookJson(sourceAfter.passages),sourcePathReplacementIsTransparentWholeFileMetadata:true,whole3312CurrentGoalAndPAndSemanticSourceFingerprintUnchanged:true,semantic3312SourceFingerprint:kind.sourceFingerprint,newAMReviewNeededForSourceOnlyChange:false,newPScientificReviewNeededForSourceOnlyChange:false,affectedSourceDGoalIds:[ID],newScientificReviewClaim:false,independentSourceReview:false,humanApproval:false,activeWrites:false,strictGain:0})
 console.log(JSON.stringify({pages394Changed:changes,sourceWitnessScienceChanged:changedWitnessScience,protected315PageChanges:protectedPageChanges,protected315SourceChanges:protectedSourceChanges},null,2))
}else console.log('Normal current national394 before-source-change whole model materialized.')
