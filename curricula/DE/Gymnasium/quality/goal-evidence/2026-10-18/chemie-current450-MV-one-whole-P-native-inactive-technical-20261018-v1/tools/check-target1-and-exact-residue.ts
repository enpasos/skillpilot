// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {buildPositiveGoalEvidenceCandidateRecords} from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-MV-one-whole-P-native-inactive-technical-20261018-v1/'
const J=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const H=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
async function main(){
 const plan=J(B+'PLAN.inactive-native-P1-and-exact-8ceb-residue.json'),cfg=J(plan.exactNewStockConfig.path),candidateSet=J(plan.exactStockCandidateSet.path)
 const expected=await buildPositiveGoalEvidenceCandidateRecords({config:cfg,candidateSet})
 assert.equal(expected.length,1);assert.deepEqual(readFileSync(cfg.reviewPath),Buffer.from(expected.map(r=>JSON.stringify(r)).join('\n')+'\n'))
 const oldPath=plan.residuals[0].oldReview.path,oldRows=readFileSync(oldPath,'utf8').trim().split('\n').map(JSON.parse),old=oldRows.find(r=>r.goalId===expected[0].goalId),rec=expected[0]
 assert.equal(rec.goalFingerprint,old.goalFingerprint);assert.equal(rec.reviewInputFingerprint,old.reviewInputFingerprint);assert.notEqual(rec.profileFingerprint,old.profileFingerprint)
 assert.equal(rec.status,'needs_human_review');assert.equal(rec.reviewAuthority,'ai_candidate');assert.equal(rec.evidenceLevel,old.evidenceLevel);assert.equal(rec.maximumClaimScope,old.maximumClaimScope);assert.deepEqual(rec.reviewRunIds,[]);assert.deepEqual(rec.profile,candidateSet.goals[0].profile)
 const stockChecks=[]
 for(const path of[plan.exactNewStockConfig.path,plan.residuals[0].newConfig.path]){
  const out=reviewPositiveGoalEvidenceConfig(path);assert.deepEqual(out.errors,[]);assert.equal(out.config.requireApproved,false);assert.equal(out.config.scope.goalIds.length,1)
  stockChecks.push({configPath:path,goalIds:out.config.scope.goalIds,counts:out.counts,errors:out.errors})
 }
 const residuePath=plan.residuals[0].newReview.path,residueRaw=readFileSync(residuePath),oldRetainedRaw=Buffer.from(readFileSync(oldPath,'utf8').split(/(?<=\n)/).filter(s=>!s.trim()||JSON.parse(s).goalId!==rec.goalId).join(''));assert.deepEqual(residueRaw,oldRetainedRaw)
 const oldOther=oldRows.find(r=>r.goalId!==rec.goalId),other=JSON.parse(residueRaw.toString().trim());assert.deepEqual(other,oldOther)
 for(const f of J(B+'BEFORE.exact-protected-normal-and-science-pins.json').files){const b=readFileSync(f.path);assert.equal(H(b),f.sha256);assert.equal(b.length,f.bytes)}
 console.log(JSON.stringify({status:'PASS',scope:'Stock target1 native P and exact8ceb residual only; not450 fresh scientific reviews',currentNativeRecord:{goalId:rec.goalId,goalFingerprint:rec.goalFingerprint,reviewInputFingerprint:rec.reviewInputFingerprint,profileFingerprint:rec.profileFingerprint,status:rec.status,reviewAuthority:rec.reviewAuthority,evidenceLevel:rec.evidenceLevel,maximumClaimScope:rec.maximumClaimScope},stockChecks,exactUnchanged8cebRow:true,protectedNormalAndScienceBytesUnchanged:true,normalWrites:0,newScientificVotes:0,newDDecisions:0,APCompilerBuildRuns:0},null,2))
}
void main()
