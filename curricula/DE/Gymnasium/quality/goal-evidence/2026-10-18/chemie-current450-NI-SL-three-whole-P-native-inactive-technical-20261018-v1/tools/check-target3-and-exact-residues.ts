// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-NI-SL-three-whole-P-native-inactive-technical-20261018-v1/'
const J=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const H=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').split(/(?<=\n)/)
async function main(){
 const plan=J(B+'PLAN.actual-inactive-P3-original-namespaces-and-residuals.json'),checks:any[]=[],combined:Buffer[]=[]
 for(const t of plan.targets){
  const cfg=J(t.newNativeConfig.path),candidateSet=J(t.newCandidateSet.path),oldCfg=J(t.oldOwnerConfig.path)
  const expected=await buildPositiveGoalEvidenceCandidateRecords({config:cfg,candidateSet})
  assert.equal(expected.length,1);const raw=readFileSync(cfg.reviewPath)
  assert.deepEqual(raw,Buffer.from(expected.map(r=>JSON.stringify(r)).join('\n')+'\n'));combined.push(raw)
  const rec=expected[0],oldRows=readFileSync(t.oldReview.path,'utf8').trim().split('\n').map(JSON.parse),old=oldRows.find((r:any)=>r.goalId===t.goalId)
  for(const k of['reviewId','goalFingerprintRuleVersion','profileRuleVersion','reviewCriteriaFingerprint','goalFingerprint','reviewInputFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope'])assert.deepEqual(rec[k],old[k],`${t.goalId}: unchanged ${k}`)
  assert.notEqual(rec.profileFingerprint,old.profileFingerprint);assert.deepEqual(rec.profile,candidateSet.goals[0].profile);assert.deepEqual(rec.reviewRunIds,[])
  for(const k of['reviewId','goalFingerprintRuleVersion','profileRuleVersion','reviewCriteriaPath','reviewedResourceTypes','requireApproved'])assert.deepEqual(cfg[k],oldCfg[k])
  const retainedRaw=Buffer.from(lines(t.oldReview.path).filter(s=>!s.trim()||JSON.parse(s).goalId!==t.goalId).join(''))
  assert.deepEqual(readFileSync(t.residualReview.path),retainedRaw)
  for(const p of[t.newNativeConfig.path,t.residualConfig.path]){
   const check=reviewPositiveGoalEvidenceConfig(p);assert.deepEqual(check.errors,[]);checks.push({configPath:p,goalIds:check.config.scope.goalIds,counts:check.counts,errors:check.errors})
  }
 }
 for(const f of J(B+'BEFORE.protected-normal-and-own-science-pins.json').files){const b=readFileSync(f.path);assert.equal(H(b),f.sha256);assert.equal(b.length,f.bytes)}
 writeFileSync(B+'native/P3.three-stock-rows.original-namespaces.aggregate-not-owner.jsonl',Buffer.concat(combined))
 const out={status:'PASS',scope:'Only three actual changed native P records and their exact2/5/3 residual rows; no450 fresh science, no205 old owner check replay',stockChecks:checks,stockNativeThreeRecordBuildExact:true,old447WholeRecordsAndProfilesPreservedByStructuralSelection:true,originalNamespacesCriteriaRulesLevelsStatusesPreserved:true,protectedNormalAndScienceBytesExact:true,configsBeforeAfter:[plan.oldPConfigCount,plan.candidatePConfigCount],normalWrites:0,newScientificVotes:0,newDDecisions:0,APCompilerBuildRuns:0,humanApproval:false}
 console.log(JSON.stringify(out,null,2))
}
void main()
