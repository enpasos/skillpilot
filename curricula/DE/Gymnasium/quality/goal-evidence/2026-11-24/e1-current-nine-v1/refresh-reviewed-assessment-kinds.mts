// SPDX-License-Identifier: Apache-2.0
// Bind unchanged practiceAssessment classifications after exact dual-reviewed task corrections.
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
const activationPath=process.argv[2],outputPath=process.argv[3]
if(!activationPath||!outputPath||!process.argv.includes('--write'))throw new Error('activation receipt, new output path and --write required')
if(existsSync(outputPath))throw new Error('Immutable receipt already exists')
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const activationBytes=readFileSync(activationPath),activation=JSON.parse(activationBytes.toString())
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',canonicalBytes=readFileSync(canonicalPath)
const goals=new Map(JSON.parse(canonicalBytes.toString()).goals.map((g:any)=>[g.id,g]))
const reviews=activation.independentReviews.map((r:any)=>{if(hash(readFileSync(r.path))!=='sha256:'+r.sha256)throw new Error('Actual review hash mismatch');return JSON.parse(readFileSync(r.path,'utf8'))})
if(reviews.length!==2)throw new Error('Expected two actual independent reviews')
const path='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',before=readFileSync(path),ledger=JSON.parse(before.toString()),records=[]
for(const approved of activation.goals){
 const goal:any=goals.get(approved.goalId),current=JSON.parse(readFileSync(approved.current.path,'utf8'))
 if(hash(readFileSync(approved.current.path))!=='sha256:'+approved.current.sha256||JSON.stringify(goal)!==JSON.stringify(current))throw new Error('Current task differs from approved exact checkpoint '+approved.goalId)
 for(const review of reviews){if(!review.reviews.some((r:any)=>r.goalId===goal.id&&r.candidateDecision==='accept'))throw new Error('No exact candidate acceptance '+goal.id)}
 const row=ledger.decisions.find((r:any)=>r.goalId===goal.id)
 if(row?.semanticKind!=='practiceAssessment'||!goal.examData)throw new Error('Unexpected kind/goal transition')
 const prior=JSON.parse(JSON.stringify(row));row.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
 records.push({goalId:goal.id,semanticKindUnchanged:'practiceAssessment',priorDecision:prior,currentDecision:row,currentGoalPath:approved.current.path,currentGoalRawSha256:approved.current.sha256,reviewedCandidate:approved.reviewedCandidate,postReviewMetadataOnlyDelta:approved.postReviewMetadataOnlyDelta})
}
const after=JSON.stringify(ledger,null,2)+'\n';writeFileSync(path,after)
if(!canonicalBytes.equals(readFileSync(canonicalPath)))throw new Error('Canonical changed')
writeFileSync(outputPath,JSON.stringify({schemaVersion:1,contract:'exact-dual-reviewed-assessment-kind-refresh-v1',records,beforeLedgerSha256:hash(before),afterLedgerSha256:hash(after),canonicalSha256Unchanged:hash(canonicalBytes),activationPath,activationSha256:hash(activationBytes),independentReviews:activation.independentReviews,canonicalEdits:0,placementEdits:0,kindTransitions:0,limits:'Current task identity, content and rubric remain an assessment. Existing kind decisions are retained and bound to actual reviewed content; no curricular credit, cut change or planning release is inferred.'},null,2)+'\n')
console.log('Refreshed',records.length,'unchanged practiceAssessment classifications; no canonical or placement edits.')
