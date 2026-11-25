import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../../app/scripts/goalBookModel.ts'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../../..')
const evidence='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality/imp-mass-example-successor-20261125-v1'
const output='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-25/e2-imp-mass-example-context-v6'
const id='53afbda1-5776-502b-8867-471975d7b766'
const hash=(b:Buffer|string)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
function assert(v:unknown,message:string):asserts v{if(!v)throw new Error(message)}
const read=(p:string)=>readFileSync(join(root,p)),json=(p:string)=>JSON.parse(read(p).toString('utf8'))
const bytes=(v:unknown)=>Buffer.from(`${JSON.stringify(v,null,2)}\n`)
const same=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const pin=(p:string)=>({path:p,sha256:hash(read(p)),bytes:read(p).length})
const args=process.argv.slice(2);assert(args.length===1&&['--write','--check'].includes(args[0]),'Usage: --write|--check');const write=args[0]==='--write'
const inputPath=`${evidence}/actual-image-profile-inspection.json`,input=json(inputPath)
assert(input.contract==='imp-mass-example-current-native-inspection-v1'&&input.goalId===id,'Wrong scoped input')
for(const p of [input.previousConfig,input.previousReview,input.currentVisualReview])assert(same(pin(p.path),p),`${p.path}: frozen input changed`)
const sourceConfig=json(input.previousConfig.path),sourceLines=read(input.previousReview.path).toString('utf8').trimEnd().split('\n')
const sourceRecords=sourceLines.map((s:string)=>JSON.parse(s)),old=sourceRecords.find((r:any)=>r.goalId===id)
assert(sourceRecords.length===4&&old,'Expected previous four-goal P owner')
const current=json(sourceConfig.landscapePath).goals.find((g:any)=>g.id===id),qa=json('curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json').records.find((g:any)=>g.goalId===id)
const strip=(g:any)=>{const{resourceLinks:ignored,...rest}=g;return rest}
assert(same(strip(current),strip(input.previousGoal)),'Non-media IMP change requires separate review')
assert(same(current.resourceLinks,input.currentResourceLinks)&&same(qa,input.currentQaRecord),'Final resource/QA input changed')
assert(same(buildGoalDescriptionCanonicalContext(current),buildGoalDescriptionCanonicalContext(input.previousGoal)),'D canonical context changed')
assert(fingerprintSemanticKindSourceGoal(current)===fingerprintSemanticKindSourceGoal(input.previousGoal),'Semantic-kind source changed')
const link=current.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary')
assert(link?.url===qa.imageUrl&&qa.assetSha256===input.currentAssetSha256&&qa.aiApproved==='yes'&&qa.aiApprovedAssetSha256===input.currentAssetSha256,'Current pixel approval is stale')
for(const p of [qa.publicAssetPath,qa.canonicalAssetPath,`backend/src/main/resources/static${link.url}`])assert(hash(read(p))===input.currentAssetSha256,`Mirror mismatch ${p}`)
assert(input.nativeAndPhoneInspected&&input.scientificProfileMeaningUnchanged,'Missing actual compatibility inspection')
const reviewId='physics-e2-imp-mass-example-context-20261125-v6',currentPath=`${output}/current-imp.config.json`,currentReview=`${output}/current-imp.review.jsonl`
const config={...sourceConfig,reviewId,reviewPath:currentReview,reviewRunManifestPaths:[],scope:{label:'IMP: aktueller Massen-/Geschwindigkeitsvergleich im Bild bei exakt unverändertem wissenschaftlichem P-Körper',goalIds:[id]}}
const candidates={schemaVersion:1 as const,authoringContract:'positive-understanding-evidence-candidates-v1' as const,reviewId,reviewedAt:input.reviewedAt,reviewer:'OpenAI Codex; actual current native-size and360px IMP image/alt/profile compatibility inspection; no new blind scientific vote',goals:[{goalId:id,reason:input.compatibilityReason,evidenceLevel:'E1' as const,maximumClaimScope:'G1' as const,dissent:old.dissent,profile:old.profile}]}
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates}),record=records[0]
assert(records.length===1&&record.goalFingerprint===old.goalFingerprint&&record.profileFingerprint===old.profileFingerprint&&same(record.profile,old.profile),'Scientific goal/profile body changed')
assert(record.reviewInputFingerprint!==old.reviewInputFingerprint,'Expected new current image context')
assert(record.reviewAuthority==='ai_candidate'&&record.status==='needs_human_review'&&record.reviewRunIds.length===0,'Authority escalation')
const retainedIds=sourceConfig.scope.goalIds.filter((g:string)=>g!==id),retainedLines=sourceLines.filter((s:string)=>JSON.parse(s).goalId!==id)
assert(retainedIds.length===3&&retainedLines.length===3&&same(retainedIds,retainedLines.map((s:string)=>JSON.parse(s).goalId)),'Retained source order/scope drift')
const retainedConfigPath=`${output}/retained-three.config.json`,retainedReviewPath=`${output}/retained-three.review.jsonl`
const retainedConfig={...sourceConfig,reviewPath:retainedReviewPath,scope:{label:'Drei vollständig bytegleiche RATE-M-/Newton2-/Erhaltungs-Records nach dem IMP-Bildkontextsplit',goalIds:retainedIds}}
const outputs=new Map<string,Buffer>([[currentPath,bytes(config)],[currentReview,Buffer.from(`${JSON.stringify(record)}\n`)],[`${output}/current-imp.candidates.json`,bytes(candidates)],[retainedConfigPath,bytes(retainedConfig)],[retainedReviewPath,Buffer.from(`${retainedLines.join('\n')}\n`)],[`${evidence}/current-context-binding.actual.json`,bytes({schemaVersion:1,contract:'imp-one-image-context-successor-native-binding-v1',reviewedAt:input.reviewedAt,input:pin(inputPath),previousConfig:input.previousConfig,previousReview:input.previousReview,goalId:id,previousReviewInputFingerprint:old.reviewInputFingerprint,currentReviewInputFingerprint:record.reviewInputFingerprint,unchangedGoalFingerprint:record.goalFingerprint,unchangedProfileFingerprint:record.profileFingerprint,currentImageSha256:input.currentAssetSha256,retainedGoalIds:retainedIds,retainedRecordLinesSha256:hash(`${retainedLines.join('\n')}\n`),currentConfigPath:currentPath,retainedConfigPath,scientificProfileMeaningAndBodyUnchanged:true,dCanonicalContextAndKindSourceUnchanged:true,newBlindScientificVotes:0,humanApproval:false,oldVisualVotesTransferredToNewAsset:false,remainingActivePConfigsUnchanged:true,historicalThreeCampaignSixRenderRecoveryUnchanged:true,learnerMasteryWritten:false})]])
for(const[p,b]of outputs){const target=join(root,p);if(existsSync(target))assert(readFileSync(target).equals(b),`${p}: refusing different existing successor`);else{assert(write,`${p}: missing successor`);await mkdir(dirname(target),{recursive:true});await writeFile(target,b,{flag:'wx'})}}
for(const p of[currentPath,retainedConfigPath]){const result=reviewPositiveGoalEvidenceConfig(p);assert(result.errors.length===0,`${p}: ${result.errors.join(' | ')}`)}
console.log(JSON.stringify({contract:'imp-one-image-context-successor-native-binding-v1',currentImageContexts:1,unchangedScientificProfileBodies:1,retainedByteExactOtherRecords:3,nativePConfigChecks:2,newBlindScientificVotes:0,humanApprovals:0,registryModifiedByHelper:false},null,2))
