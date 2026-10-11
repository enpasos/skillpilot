import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
async function main() {
const { buildGoalDescriptionCanonicalContext } = await import(pathToFileURL(resolve(process.cwd(),'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const { positiveGoalEvidenceReviewInputPayload, fingerprintPositiveGoalEvidenceReviewInput } = await import(pathToFileURL(resolve(process.cwd(),'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const { buildResolutionSupersessionChains } = await import(pathToFileURL(resolve(process.cwd(),'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const root=process.cwd(), p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1'
const load=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const plan=load(p+'/native31-rebinding-preparation.actual.json'), owner=load(p+'/D2-and-retained-owner-supersession-proposal.actual.json')
const active=load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const cfg=load(p+'/configs/P2-d2cc.inactive.config.json'),candidate=load(cfg.landscapePath)
const agoals=new Map(active.goals.map((g:any)=>[g.id,g])),bgoals=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const equal=(a:any,b:any):boolean=>JSON.stringify(a)===JSON.stringify(b)
const rows=plan.rows.map((r:any)=>{
 const a:any=agoals.get(r.goalId),b:any=bgoals.get(r.goalId),digests=Object.fromEntries((a.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+createHash('sha256').update(readFileSync(resolve(root,'app/public',l.url.slice(1)))).digest('hex')]))
 const criteria='sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835'
 const da=buildGoalDescriptionCanonicalContext(a),db=buildGoalDescriptionCanonicalContext(b)
 const pa=positiveGoalEvidenceReviewInputPayload(a,criteria,digests,'curricularAtomic'),pb=positiveGoalEvidenceReviewInputPayload(b,criteria,digests,'curricularAtomic')
 const changedD=!equal(da,db),changedP=!equal(pa,pb)
 const before=fingerprintPositiveGoalEvidenceReviewInput(a,criteria,digests,'curricularAtomic'),after=fingerprintPositiveGoalEvidenceReviewInput(b,criteria,digests,'curricularAtomic')
 if(changedD!==r.activeToCandidateDelta.ordinaryDCanonicalContextChanged||changedP!==r.activeToCandidateDelta.ordinaryPInputPayloadChanged||before!==r.activeToCandidateDelta.activePReviewInputFingerprint||after!==r.activeToCandidateDelta.candidatePReviewInputFingerprint)throw new Error('current inputs drift '+r.goalId)
 return {goalId:r.goalId,wholeCurrentGoalMatchesPlan:equal(b,r.wholeCurrentCanonicalGoal),ordinaryDContextChanged:changedD,ordinaryPInputChanged:changedP,actualPReviewInputFingerprint:after,scientificCompletionFromThisCheck:false}
})
const kinds=load(cfg.semanticKindLedgerPath),currentIds=new Set<string>(kinds.decisions.filter((g:any)=>g.semanticKind==='curricularAtomic').map((g:any)=>g.goalId))
const chains=buildResolutionSupersessionChains(owner.fullEdgesForNormalChainValidation,owner.fullIndexPathsForNormalChainValidation,currentIds)
if(chains.issues.length||rows.some((r:any)=>!r.wholeCurrentGoalMatchesPlan))throw new Error(chains.issues.join(' | ')||'whole goal drift')
const verdict={createdAtUTC:new Date().toISOString(),scope:'31 exact ordinary D/P payload checks and normal per-goal owner chain contract; no whole central intersection or review inferred',rows,currentAtomics:currentIds.size,changedD:rows.filter((r:any)=>r.ordinaryDContextChanged).length,changedP:rows.filter((r:any)=>r.ordinaryPInputChanged).length,normalSupersessionChainIssues:chains.issues,normalChainCount:chains.chains.length,targetedD2Chains:chains.chains.filter((c:any)=>owner.targetedTwoOldContextReplacementEdges.some((e:any)=>e.goalId===c.goalId)),retainedSixChains:chains.chains.filter((c:any)=>owner.retainedSixGoalIds.includes(c.goalId)),activeWrites:false,humanApproved:0,strictGain:0}
// Frozen package checks are read-only by default. An optional new output must stay outside this package.
const output = process.argv[2]
if (output) {
 const target = resolve(root,output)
 if (target.startsWith(resolve(root,p)+'/')) throw new Error('Refusing to rewrite the frozen preparation package')
 writeFileSync(target,JSON.stringify(verdict,null,2)+'\n')
}
console.log(JSON.stringify({protected:rows.length,currentAtomics:currentIds.size,changedD:verdict.changedD,changedP:verdict.changedP,normalChainIssues:chains.issues}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
