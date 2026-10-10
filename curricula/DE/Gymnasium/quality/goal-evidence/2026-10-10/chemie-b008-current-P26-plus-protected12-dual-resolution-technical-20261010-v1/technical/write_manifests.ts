import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { materializeGoalDescriptionRolloutBatchDualSummary } from '../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { extractGoalDescriptionDualRoundResolutionSource } from '../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, validateGoalDescriptionRolloutSynthesisDecisionManifest, type GoalDescriptionRolloutSynthesisDecisionManifest, type GoalDescriptionSynthesisDigest } from '../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'
async function main(){
const root=process.cwd()
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P26-plus-protected12-dual-resolution-technical-20261010-v1'
const sha=(b:Buffer|string):GoalDescriptionSynthesisDigest=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const notes=JSON.parse(await readFile(join(root,'tmp/chemie-P26-protected12-dual-technical/synthesis-notes.json'),'utf8')) as Record<string,[string,string]>
const groups=JSON.parse(await readFile(join(root,out,'native-groups.technical.json'),'utf8')) as Array<{group:string;configPath:string}>
const comparisons=[]
for(const group of groups){
 const dual=await materializeGoalDescriptionRolloutBatchDualSummary(group.configPath,true)
 const goals=dual.prepared.manifest.goalIds.map(goalId=>{
  const a=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId,label:'First'})
  const b=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId,label:'Second'})
  if(a.errors.length||b.errors.length||!a.source||!b.source)throw Error([...a.errors,...b.errors].join(' | '))
  if(a.source.decision!=='keep' || b.source.decision!=='keep')throw Error(`Not both keep: ${goalId}: ${a.source.decision}/${b.source.decision}`)
  const current=dual.first.input.goals.find(g=>g.goalId===goalId)!
  return {goalId,effectiveSemanticKind:'curricularAtomic' as const,goalFingerprint:current.goalFingerprint as GoalDescriptionSynthesisDigest,pageFingerprint:current.pageFingerprint as GoalDescriptionSynthesisDigest,goalReviewContextFingerprint:a.source.binding.goalReviewContextFingerprint,finalText:{titleDe:current.currentTitleDe,titleEn:current.currentTitleEn,descriptionDe:current.currentDescriptionDe,descriptionEn:current.currentDescriptionEn},firstSource:a.source,secondSource:b.source}
 })
 const synthesizedAt=new Date(Math.max(...[...dual.first.resultPairs,...dual.second.resultPairs].map(r=>Date.parse(r.run.completedAt)))+1000).toISOString()
 const batch={batchId:dual.prepared.manifest.batchId,batchManifestDigest:sha(await readFile(join(dual.prepared.outputDirectory,'batch-manifest.json'))),configDigest:dual.prepared.manifest.configDigest,bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,bookDigest:dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,reviewInputFingerprint:dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,dualSummaryDigest:sha(dual.bytes),canonicalLandscapeDigest:sha(await readFile(join(root,dual.prepared.manifest.source.landscapePath)))}
 const rounds={first:buildGoalDescriptionRolloutSynthesisRoundBinding(goals[0].firstSource.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),second:buildGoalDescriptionRolloutSynthesisRoundBinding(goals[0].secondSource.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)}
 const decisions=goals.map(g=>{
  const note=notes[g.goalId.slice(0,8)];if(!note)throw Error(`Missing actual comparison note: ${g.goalId}`)
  const firstEvidence=g.firstSource.record.understandingEvidence, secondEvidence=g.secondSource.record.understandingEvidence
  const differences=Object.keys(firstEvidence!).filter(k=>(firstEvidence as any)[k] !== (secondEvidence as any)[k])
  comparisons.push({goalId:g.goalId,group:group.group,firstRecordId:g.firstSource.binding.recordId,secondRecordId:g.secondSource.binding.recordId,actualUnderstandingEvidenceFieldsDifferent:differences,firstRationale:g.firstSource.record.rationale,secondRationale:g.secondSource.record.rationale,selectedEvidenceRound:'first',selectedEvidenceCopiedLiteral:true,ownComparisonDe:note[0],ownComparisonEn:note[1],role:'Technical synthesis after both sealed independent FIRST reviews by existing reviewer A; not third scientific review',sourceHoldRetained:true})
  return {decisionId:`${group.group}-technical-dual-${g.goalId}`,goalId:g.goalId,effectiveSemanticKind:g.effectiveSemanticKind,goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:g.goalReviewContextFingerprint,finalText:g.finalText,resolutionDecision:'keep_current' as const,evidenceRound:'first' as const,records:{first:{recordId:g.firstSource.binding.recordId,recordDigest:g.firstSource.binding.recordDigest},second:{recordId:g.secondSource.binding.recordId,recordDigest:g.secondSource.binding.recordDigest}},rationaleDe:`Technische explizite Synthese der versiegelten unabhängigen FIRST-A/B nach eigener vollständiger Sichtung beider aktuellen Records; beteiligt ist der bestehende A-Reviewer, kein dritter Fachreview. Beide entscheiden KEEP. Die sechs unveränderten A-Nachweisfelder werden wörtlich gewählt, um Kompetenz und Fallbeispiele nicht zu einer zusätzlichen Aufgabenquote oder methodischen Pflicht zu verengen. Vergleich: ${note[0]} Die konkreten B-Befunde bleiben gebunden: ${g.secondSource.record.rationale} Aktuelle Beschreibung unverändert. Getrennte Source-/Kurs-/Partnerpflichten und sämtliche Whole-Source-HOLDs bleiben offen; keine menschliche Freigabe und kein aktiver M7-Zuwachs.`,rationaleEn:`Explicit technical synthesis of sealed independent FIRST-A/B after actual full reading of both current records; the existing A reviewer performs this synthesis, not a third subject review. Both decide KEEP. The six unchanged A evidence fields are selected literally to avoid narrowing competence and case examples into an extra task quota or method obligation. Comparison: ${note[1]} The exact B record, its bilingual evidence and its specific rationale remain bound and preserved as reviewed conditions. Current description unchanged. Separate source, course and partner duties and every whole-source hold remain open; no human approval and no active M7 gain.`}
 })
 const bare={ $schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json' as const,schemaVersion:1 as const,synthesisContract:'goal-description-rollout-synthesis-decision-v1' as const,manifestId:`${group.group}-current-dual-explicit-technical-synthesis-20261010-v1`,authority:'ai_synthesis' as const,synthesizedBy:'Codex technical synthesis by existing independent reviewer A; no third scientific review',synthesizedAt,batch,rounds,decisions }
 const manifest:GoalDescriptionRolloutSynthesisDecisionManifest={...bare,manifestFingerprint:fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(bare)}
 const check=await validateGoalDescriptionRolloutSynthesisDecisionManifest({manifest,expected:{batch,rounds,synthesizedAt,goals}})
 if(check.errors.length)throw Error(check.errors.join(' | '))
 const p=join(dual.prepared.outputDirectory,'synthesis-decisions.json');await writeFile(p,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'})
 console.log(`PASS normal exact prepared/dual/synthesis-manifest ${group.group}: ${goals.length} current KEEP/KEEP; explicit evidence selection, not automatic acceptance; ${manifest.manifestFingerprint}`)
}
await writeFile(join(root,out,'actual-both-records-comparison-and-explicit-evidence-selection.technical.json'),JSON.stringify({schemaVersion:1,technicalPerformedAt:new Date().toISOString(),synthesisTimestampMeaning:'Normal deterministic binding timestamp = latest sealed run completion plus 1000 milliseconds; actual technical performance time is recorded separately here',goalComparisons:comparisons,modelDiversityClaim:false,exactModelVersions:'unknown',automaticAcceptance:false,humanApproval:false,sourceHoldUnchanged:true,currentStrictNetGain:0},null,2)+'\n',{flag:'wx'})

}
main().catch(e=>{console.error(e);process.exitCode=1})
