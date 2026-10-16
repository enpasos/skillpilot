import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
const root=resolve(fileURLToPath(new URL('.',import.meta.url)))
const helpers=await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const goal=JSON.parse(readFileSync(resolve(root,'candidate/one-whole-current-goal.exact.json'),'utf8'))
const body=JSON.parse(readFileSync(resolve(root,'candidate/profile.author-body.json'),'utf8'))
const original=JSON.parse(readFileSync(resolve(root,'inputs/original-profile.exact.json'),'utf8'))
const resourceDigests=Object.fromEntries(goal.resourceLinks.filter((x:any)=>x.type==='goal-visualization').map((x:any)=>[x.url,'sha256:'+createHash('sha256').update(readFileSync(resolve('app/public'+x.url))).digest('hex')]))
const choices=[undefined,'curricularAtomic'].map(kind=>({kind:kind??null,goalFingerprint:helpers.fingerprintGoalForPositiveEvidence(goal,kind),reviewInputFingerprint:helpers.fingerprintPositiveGoalEvidenceReviewInput(goal,original.reviewCriteriaFingerprint,resourceDigests,kind)}))
const matched=choices.find(x=>x.goalFingerprint===original.goalFingerprint&&x.reviewInputFingerprint===original.reviewInputFingerprint)
if(!matched)throw new Error('Current exact goal/resource binding differs from supplied original raw profile: '+JSON.stringify(choices))
const record={...original,reviewId:'chemie-lab15-own-preparation-purity-author-20261015-v1',reviewedAt:new Date().toISOString(),reviewer:'codex-informed-author-own-preparation-purity',reason:'Informed author successor for this unchanged whole goal only: retained exact isolation case06-a plus complete own aspirin synthesis, purification and specific own-sample impurity/melting tests. E0/G0 design only; all results fictional. No independent D/P/A/M/V approval or actual performance claimed.',evidenceLevel:'E0',maximumClaimScope:'G0',status:'needs_human_review',reviewAuthority:'ai_candidate',reviewRunIds:[],dissent:['Primary school-chemistry methods are bound; explicit author adaptations require independent source/P/A review. No national course/view clearance is inferred.','Own supervised synthesis, purification, specific original-sample tests and raw records are mandatory future competence evidence; prior learner execution/Human Trials are not machine-M7 prerequisites.','Fe(III) brackets free phenolic SA in the known synthesis matrix; melting complements it. Neither supplies exhaustive purity or an unconditional purity-corrected ASA yield.'],profile:body,profileFingerprint:helpers.fingerprintPositiveGoalEvidenceProfile(body)}
const errors=helpers.validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,matched.kind??undefined)
if(errors.length)throw new Error(errors.join('\n'))
writeFileSync(resolve(root,'candidate/one-profile.raw-E0G0.production-helper.jsonl'),JSON.stringify(record)+'\n')
writeFileSync(resolve(root,'checks/production-raw-profile-helper.actual.json'),JSON.stringify({generatedAtUTC:new Date().toISOString(),helperPath:'app/scripts/positiveGoalEvidenceProfileModel.ts',goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,effectiveSemanticKind:matched.kind,resourceDigests,validationFunction:'validatePositiveGoalEvidenceRecordSemantics',errors,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope},null,2)+'\n')
console.log('Production raw-profile helper valid:1 E0/G0 candidate; unchanged goal/resource input binding.')
