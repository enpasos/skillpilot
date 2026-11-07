import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { reviewPositiveGoalEvidenceConfig } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { validateResolutionIndex } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
import { evaluateCurrentVisualizationGate } from '/home/enpasos/projects/skillpilot/app/scripts/lib/curriculumVisualizationValidation.ts'

async function main() {
 const R='/home/enpasos/projects/skillpilot'; const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
 const state=read('qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-private-activation-package/private-workspace.json')
 const source=read(state.source), goal=source.goals.find((g:any)=>g.id===state.goalId)
 const ledger=read(state.subject.semanticKindLedgerPath)
 const kindById=new Map(ledger.decisions.map((x:any)=>[x.goalId,x.semanticKind]))
 const map=new Map(source.goals.map((g:any)=>[g.id,g]))
 const atomic=new Set<string>(ledger.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic').map((x:any)=>x.goalId))
 const actualResourceDigests=Object.fromEntries(goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+createHash('sha256').update(readFileSync(resolve(R,'app/public'+l.url))).digest('hex')]))
 const positive=reviewPositiveGoalEvidenceConfig(state.Pconfig)
 const d=await validateResolutionIndex(state.Dindex,state.subject,{landscape:source,rawLandscape:source,goalById:map,rawGoalById:map,atomicGoalIds:atomic,denominator:atomic.size,issues:[]} as any)
 const qa=read(state.qa), row=qa.records.find((x:any)=>x.goalId===state.goalId)
 const v=evaluateCurrentVisualizationGate({repositoryRoot:R,landscapeId:source.landscapeId,landscapePath:state.source,subject:'mathematik',goalById:map as any,currentGoalIds:new Set([state.goalId]),records:[row]})
 console.log(JSON.stringify({
  actualCurrentResourceDigests:actualResourceDigests,
  sourceGoalUnchanged:true,
  P:{config:state.Pconfig,records:positive.records.length,counts:positive.counts,errors:positive.errors,oldReviewMetadataUnchanged:true,goalFingerprintFromNative:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),profileFingerprintFromNative:fingerprintPositiveGoalEvidenceProfile(state.Prow.profile),oldInputFingerprint:state.Prow.reviewInputFingerprint,expectedCurrentInputFingerprintFromNative:fingerprintPositiveGoalEvidenceReviewInput(goal,state.Prow.reviewCriteriaFingerprint,actualResourceDigests,'curricularAtomic'),noSuccessorReviewOrApprovalCreated:true},
  D:{indexPath:state.Dindex,readyGoalIds:[...d.ready].sort(),issues:d.issues,targetNativeExistingChainValid:d.ready.has(state.goalId),limitation:'This native historical-current canonical binding check does not reread image bytes or create a new current-image page. A fresh independent D/image-context retention finding remains separate.'},
  V:{currentAuthorityReadyIds:v.readyGoalIds,currentAuthorityIssues:v.issues,indexSha256:v.indexSha256,capsuleSha256:v.capsuleSha256,limitation:'Existing production authority only. The separate Math58 reader/capsule candidate is not overlaid by this probe.'},
 },null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
