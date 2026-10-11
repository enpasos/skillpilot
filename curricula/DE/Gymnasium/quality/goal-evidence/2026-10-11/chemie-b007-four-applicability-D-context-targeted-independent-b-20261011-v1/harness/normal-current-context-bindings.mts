import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root=process.cwd()
const mod=async(p:string)=>import(pathToFileURL(resolve(root,p)).href)
const {buildGoalDescriptionCanonicalContext}=await mod('app/scripts/validateGoalDescriptionReviewCampaign.ts')
const {fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewPage}=await mod('app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const {fingerprintGoalForEvidence}=await mod('app/scripts/goalEvidenceProfileModel.ts')
const {stableGoalBookJson,GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION}=await mod('app/scripts/goalBookModel.ts')
const n='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-four-materialized-applicability-D-context-root-preparation-20261011-v1'
const p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-four-applicability-D-context-targeted-independent-b-20261011-v1'
const json=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const input=json(n+'/native-D4/round-b/description-review-input.json')
const landscape=json(n+'/inputs/whole523-current402.exact.json')
const kind=json(n+'/configs/semantic-kinds.current402.path-only.json')
const rows=input.goals.map((g:any)=>{
 const goal=landscape.goals.find((o:any)=>o.id===g.goalId)
 const effective=kind.decisions.find((o:any)=>o.goalId===g.goalId).semanticKind
 return {goalId:g.goalId,goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),decision:'keep',canonicalContextNormalEqual:stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal))===stableGoalBookJson(g.canonicalContext),goalFingerprintNormalEqual:fingerprintGoalForEvidence(goal,GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,effective)===g.goalFingerprint,pageFingerprintNormalEqual:fingerprintGoalDescriptionReviewPage(g.reviewContext.page)===g.pageFingerprint}
})
if(!rows.every((r:any)=>r.canonicalContextNormalEqual&&r.goalFingerprintNormalEqual&&r.pageFingerprintNormalEqual))throw new Error('Actual normal current binding mismatch')
writeFileSync(resolve(root,p+'/D4-results/current-context-transfer.inputs.json'),JSON.stringify({schemaVersion:1,reviewAuthority:'ai_candidate',normalCampaignPath:n+'/native-D4/round-b/description-review-campaign.json',normalInputPath:n+'/native-D4/round-b/description-review-input.json',rows},null,2)+'\n')
console.log('Normal current canonical/page/goal bindings: 4/4 exact')
