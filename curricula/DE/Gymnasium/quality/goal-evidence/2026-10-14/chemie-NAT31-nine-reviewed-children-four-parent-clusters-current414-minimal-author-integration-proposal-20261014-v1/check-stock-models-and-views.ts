import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { stableGoalEvidenceJson, normalizeGoalEvidenceText } from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts'

const repo='/home/enpasos/projects/skillpilot'
const own=path.dirname(new URL(import.meta.url).pathname)
const read=(p:string)=>JSON.parse(fs.readFileSync(path.isAbsolute(p)?p:path.join(repo,p),'utf8'))
const put=(p:string,d:unknown)=>fs.writeFileSync(path.join(own,p),JSON.stringify(d,null,2)+'\n')
const hash=(s:string)=>'sha256:'+crypto.createHash('sha256').update(s).digest('hex')
const candidate=read(path.join(own,'candidate/canonical551.prospective419.on-final542.exact-reviewed-NAT9.inactive.json'))
const ledger=read(path.join(own,'candidate/semantic551.prospective419.existing-paired-kind-science.json'))
const goals=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const kinds=new Map<string,any>(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const selected=read(path.join(own,'INPUTS.exact-whole-material-selection.external-bindings.json'))
const children:string[]=selected.selectedChildIds
const sk=ledger.decisions.map((d:any)=>({goalId:d.goalId,expected:fingerprintSemanticKindSourceGoal(goals.get(d.goalId)),actual:d.sourceFingerprint}))
const semanticMismatches=sk.filter((d:any)=>d.expected!==d.actual)
put('CHECK.stock-semantic-kind-551-actual-fingerprints.json',{function:'unmodified goalBookModel.fingerprintSemanticKindSourceGoal',decisionCount:sk.length,mismatches:semanticMismatches,pass:semanticMismatches.length===0})

const canonical=normalizeCanonicalLandscape({...candidate,goals:candidate.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))})
const canonicalFindings=validateCanonicalLandscape(canonical)
// The authoring API checks contains; retain a separately explicit directional requires cycle/missing-ref check.
const requiresErrors:any[]=[];const visited=new Set<string>(),visiting=new Set<string>()
function visit(i:string,stack:string[]){
 if(visiting.has(i)){requiresErrors.push({type:'requires-cycle',path:[...stack,i]});return}
 if(visited.has(i))return
 visiting.add(i)
 for(const ref of goals.get(i)?.requires??[]){const r=ref.split(':').at(-1);if(!goals.has(r))requiresErrors.push({type:'missing-prerequisite',goalId:i,ref});else visit(r,[...stack,i])}
 visiting.delete(i);visited.add(i)
}
for(const i of goals.keys())visit(i,[])
put('CHECK.stock-canonical-authoring-and-directional-requires-DAG.json',{stockCanonicalFindings:canonicalFindings,requiresErrors,pass:!canonicalFindings.some((x:any)=>x.severity==='error')&&!requiresErrors.length})

const assets=read(path.join(own,'V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json'))
const digests=Object.fromEntries(assets.map((a:any)=>[a.resourceBody.url,a.actualAsset.sha256]))
const records=fs.readFileSync(path.join(own,'P/nine-existing-whole-profile-records.exact.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const profiles=records.map((r:any)=>{
 const g=goals.get(r.goalId),kind=kinds.get(r.goalId)
 return {goalId:r.goalId,goalFingerprintActual:fingerprintGoalForPositiveEvidence(g,kind),goalFingerprintRecorded:r.goalFingerprint,
  reviewInputActual:fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,kind),reviewInputRecorded:r.reviewInputFingerprint,
  profileActual:fingerprintPositiveGoalEvidenceProfile(r.profile),profileRecorded:r.profileFingerprint,
  errors:validatePositiveGoalEvidenceRecordSemantics(r,g,digests,kind)}
})
put('CHECK.stock-P9-exact-whole-goal-profile-resource-input-bindings.json',{functions:'unmodified positiveGoalEvidenceProfileModel exports',resourceDigests:digests,records:profiles,pass:profiles.every((r:any)=>!r.errors.length),boundary:'Finite exact model/semantic check only. Not a new independent science/run, public-asset or learner-execution claim.'})

// Read the identical private fingerprint payload contracts in the unmodified A/M scripts; no record is amended.
const amresults:any[]=[]
for(const gate of ['A','M']){
 const rows=read(path.join(own,gate+'/nine-existing-a-records.selection.json'))
 for(const r of rows){const g=goals.get(r.goalId)
  const payload={ruleVersion:r.ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalizeGoalEvidenceText(g.title),titleEn:normalizeGoalEvidenceText(g.titleEn),description:normalizeGoalEvidenceText(g.description),descriptionEn:normalizeGoalEvidenceText(g.descriptionEn),phase:normalizeGoalEvidenceText(g.dimensionTags?.phase),area:normalizeGoalEvidenceText(g.dimensionTags?.area),topicCode:normalizeGoalEvidenceText(g.dimensionTags?.topicCode),nodeKind:normalizeGoalEvidenceText(g.nodeKind)}
  amresults.push({gate,goalId:g.id,actualFingerprint:hash(stableGoalEvidenceJson(payload)),recordedFingerprint:r.fingerprint,status:r.status,reviewId:r.reviewId,reviewer:r.reviewer,reviewedAt:r.reviewedAt})
 }
}
put('CHECK.A-M9-verbatim-record-fingerprints-private-contract-mirror.json',{contractSourceFiles:['app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts'],records:amresults,pass:amresults.every(x=>x.actualFingerprint===x.recordedFingerprint),boundary:'Private fingerprint contract mirror only; not the normal full M419 visibility/acquisition gate.'})

const viewcas=read(path.join(own,'CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json'))
const baseCas=read(path.join(own,'CAS.exact-four-parent-structure-plus-nine-reviewed-whole-children.NOT-APPLIED.json'))
const baseRaw=read(baseCas.base.path)
const baseLedgerPath=baseCas.base.path.replace('canonical542.prospective414.on-final-source6-539.minimal-inactive.json','semantic542.prospective414.paired-existing-science.closed-enum.json')
const baseKinds=new Map(read(baseLedgerPath).decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const baseCanonical=normalizeCanonicalLandscape({...baseRaw,goals:baseRaw.goals.map((g:any)=>({...g,semanticKind:baseKinds.get(g.id)}))})
const results=viewcas.changes.map((c:any)=>{
 const original=read(c.original.path),after=read(c.candidatePath)
 const baselineResult=compileCompositionView(original,baseCanonical)
 const beforeResult=compileCompositionView(original,canonical),afterResult=compileCompositionView(after,canonical)
 const roles=collectCompositionProjectionRoleGoalIds(after.rootNodes,goals)
 const beforeRoles=collectCompositionProjectionRoleGoalIds(original.rootNodes,goals)
 const childScopes=children.map(i=>({goalId:i,role:roles.targetGoalIds.has(i)?'target':roles.prerequisiteOnlyGoalIds.has(i)?'prerequisiteOnly':'absent',
    directPrerequisites:(goals.get(i)?.requires??[]).map((r:string)=>({goalId:r,role:roles.targetGoalIds.has(r)?'target':roles.prerequisiteOnlyGoalIds.has(r)?'prerequisiteOnly':'absent'}))}))
 const retainedExistingTargetIds=[...beforeRoles.targetGoalIds].filter(i=>goals.has(i)&&!roles.targetGoalIds.has(i))
 const unexpectedAddedTargets=[...roles.targetGoalIds].filter(i=>!beforeRoles.targetGoalIds.has(i)&&!children.includes(i))
 const findingKey=(x:any)=>stableGoalEvidenceJson(x)
 const baselineKeys=new Set(baselineResult.findings.map(findingKey))
 const newFindings=afterResult.findings.filter((x:any)=>!baselineKeys.has(findingKey(x)))
 return {originalPath:c.original.path,candidatePath:c.candidatePath,scope:after.scope,edits:c.changes.length,baseline542Findings:baselineResult.findings,beforeFindings:beforeResult.findings,afterFindings:afterResult.findings,newFindingsBeyond542Baseline:newFindings,childScopes,lostExistingTargetIds:retainedExistingTargetIds,unexpectedAddedTargets}
})
put('CHECK.stock-compile-28-affected-Chemistry-views-roles-and-prerequisites.json',{function:'unmodified compileCompositionView + collectCompositionProjectionRoleGoalIds',views:results,
 fullViewCompilePass:results.every((v:any)=>!v.afterFindings.some((x:any)=>x.severity==='error')),
 preexistingErrorOccurrenceCount:results.reduce((n:number,v:any)=>n+v.baseline542Findings.filter((x:any)=>x.severity==='error').length,0),
 remainingErrorOccurrenceCount:results.reduce((n:number,v:any)=>n+v.afterFindings.filter((x:any)=>x.severity==='error').length,0),
 scopedNATDeltaPass:results.every((v:any)=>!v.newFindingsBeyond542Baseline.some((x:any)=>x.severity==='error')&&!v.lostExistingTargetIds.length&&!v.unexpectedAddedTargets.length),
 boundary:'This is structural syntax/role validation. Missing prerequisite acquisition, whole original source union, explicit course/selection and M311/GOD holds remain separate. Existing prerequisiteOnly roles are never promoted.'})

const assetChecks=assets.map((a:any)=>{
 const bytes=fs.readFileSync(path.join(repo,a.actualAsset.path));const digest='sha256:'+crypto.createHash('sha256').update(bytes).digest('hex')
 const av=a.genuineA.V,bv=a.genuineB.actualAsset
 return {goalId:a.goalId,actualDigest:digest,recordedDigest:a.actualAsset.sha256,
  aExplicitDigest:typeof av==='object'?av.assetSha256:null,bExplicitDigest:bv?.originalDigest??null,
  pairScope:typeof av==='object'?'genuine v3 A/B explicit actual pixels':'genuine v2 A/B input-sealed PNG and full native/360/680 review; no new vote',
  explicitPixelPairMatches:(!av?.assetSha256||av.assetSha256===digest)&&(!bv?.originalDigest||bv.originalDigest===digest),
  actualPublicOrHumanClaim:false}
})
put('CHECK.nine-actual-PNG-digests-existing-paired-V-history.json',{records:assetChecks,pass:assetChecks.every((x:any)=>x.actualDigest===x.recordedDigest&&x.explicitPixelPairMatches),newVisualVotes:0})
const fail=semanticMismatches.length||requiresErrors.length||canonicalFindings.some((x:any)=>x.severity==='error')||profiles.some((x:any)=>x.errors.length)||amresults.some(x=>x.actualFingerprint!==x.recordedFingerprint)||results.some((v:any)=>v.newFindingsBeyond542Baseline.some((x:any)=>x.severity==='error')||v.lostExistingTargetIds.length||v.unexpectedAddedTargets.length)||assetChecks.some((x:any)=>x.actualDigest!==x.recordedDigest||!x.explicitPixelPairMatches)
console.log(JSON.stringify({semanticCount:sk.length,semanticMismatches:semanticMismatches.length,canonicalErrors:canonicalFindings.filter((x:any)=>x.severity==='error').length,requiresErrors:requiresErrors.length,P9Errors:profiles.filter((x:any)=>x.errors.length).length,AM18Mismatches:amresults.filter(x=>x.actualFingerprint!==x.recordedFingerprint).length,viewCount:results.length,viewsWithPreexistingErrors:results.filter((v:any)=>v.afterFindings.some((x:any)=>x.severity==='error')).length,newViewErrorCount:results.reduce((n:number,v:any)=>n+v.newFindingsBeyond542Baseline.filter((x:any)=>x.severity==='error').length,0),pixelMismatches:assetChecks.filter((x:any)=>x.actualDigest!==x.recordedDigest||!x.explicitPixelPairMatches).length,scopedDeltaPass:!fail,fullViewGatePass:false}))
process.exitCode=fail?1:0
