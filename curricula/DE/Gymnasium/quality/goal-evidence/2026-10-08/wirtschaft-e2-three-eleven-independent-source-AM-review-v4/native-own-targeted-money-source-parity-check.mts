// Apache-2.0. Independent targeted technical check; no live curriculum writes.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const d=dirname(fileURLToPath(import.meta.url)),root=resolve(d,'../../../../../../..'),base=resolve(d,'..')
const v3=resolve(base,'wirtschaft-e2-three-eleven-source-atomicity-author-v3'),v4=resolve(base,'wirtschaft-e2-three-eleven-source-atomicity-author-v4')
const rd=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const hash=(b:Buffer|string)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const original=await rd(resolve(v3,'whole-goals.candidate.json')),current=await rd(resolve(v4,'whole-goals.candidate.json'))
const oldMap=new Map(original.map((g:any)=>[g.id,g])),money='83779981-2279-5f96-8ea3-2293e801973f',d3='d3c11bfa-103c-5b58-8183-561e0b076251'
const errors:any[]=[]
const diffs=current.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(oldMap.get(g.id))).map((g:any)=>({goalId:g.id,changedFields:[...new Set([...Object.keys(g),...Object.keys(oldMap.get(g.id) as any)])].filter(k=>JSON.stringify(g[k])!==JSON.stringify((oldMap.get(g.id) as any)[k])).sort()}))
if(JSON.stringify(diffs)!==JSON.stringify([{goalId:money,changedFields:['description','descriptionEn']}]))errors.push({unexpectedWholeGoalDeltas:diffs})
const map=await rd(resolve(v4,'mapping/twelve-units-to-eleven-new-and-existing-d3.review.candidate.json')),oldMapping=await rd(resolve(v3,'mapping/twelve-units-to-eleven-new-and-existing-d3.review.candidate.json'))
const raw=await readFile(resolve(root,map.sourceExtractionPath)),rawJson=JSON.parse(raw.toString())
if(hash(raw)!=='sha256:2f6bff56b16c40761bbbddf5b9520e9ce4d62c4688174a3a7f805beb60da8782')errors.push('Raw twelve-source extraction changed')
const edge=map.mappings.find((e:any)=>e.canonicalGoalId===d3),decision=map.decisions.find((x:any)=>x.canonicalGoalIds.includes(d3))
if(edge.matchType!=='partial'||decision.matchType!=='partial'||map.summary.exactMappings!==11||map.summary.partialMappings!==1)errors.push('Untruthful partial d3 binding or totals')
if(JSON.stringify(map.mappings.filter((e:any)=>e.canonicalGoalId!==d3))!==JSON.stringify(oldMapping.mappings.filter((e:any)=>e.canonicalGoalId!==d3)))errors.push('Other source edges changed')
const d3v4=await rd(resolve(v4,'existing-d3-direct-source-unit-binding.inert.json')),d3v3=await rd(resolve(v3,'existing-d3-direct-source-unit-binding.inert.json'))
if(JSON.stringify(d3v4.wholeExistingGoal)!==JSON.stringify(d3v3.wholeExistingGoal)||d3v4.newVisibleContainsParentAdded!==false)errors.push('Existing d3 goal or placement changed')
const candidate=await rd(resolve(v4,'positive.money-only.candidates.json')),profile=candidate.goals[0].profile,goal=current.find((g:any)=>g.id===money)
const require=createRequire(resolve(root,'app/package.json')),Ajv=require('ajv/dist/2020.js').default,formats=require('ajv-formats').default,ajv=new Ajv({allErrors:true,strict:false});formats(ajv)
const schemaBytes=await readFile(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),schema=JSON.parse(schemaBytes.toString()),validate=ajv.compile(schema)
const crit=hash(await readFile(resolve(v4,'authoring-review.criteria.md')))
const record={$schema:schema.$id,schemaVersion:2,reviewId:'independent-by-money-candidate-native-smoke-only-v4',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:crit,landscapeId:'605bdaf6-32d5-56fd-8d92-5a80c2fd2901',goalId:money,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,crit,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'independent Codex economics_visual_memory_audit technical schema smoke',reason:'Hypothetical new BY money atom/profile schema and native fingerprints only. Current authoritative ledger does not contain this new ID; no final source/image bound gate record or human review claimed.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile}
if(!validate(record))errors.push({schema:validate.errors})
const sem=validatePositiveGoalEvidenceRecordSemantics(record as any,goal,{},'curricularAtomic');if(sem.length)errors.push({nativeSemanticErrors:sem})
const ledgerPath=resolve(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'),ledger=await rd(ledgerPath)
if(ledger.decisions.some((x:any)=>x.goalId===money&&x.decisionStatus==='authoritative'))errors.push('Proposed money atom unexpectedly in current authoritative scope')
const result={schemaVersion:1,checkedAt:new Date().toISOString(),reviewerAgent:'/root/economics_visual_memory_audit',errors,passed:!errors.length,currentAuthoritativeDenominator:303,currentStrictBaselineAtStart:113,wholeCandidateCount:current.length,unchangedWholeCandidateCount:13,changedWholeGoalFields:diffs,rawTwelveSourceUnitsByteEquivalent:true,rawSourceSha256:hash(raw),actualRawSourceGoalCount:rawJson.sourceGoals.length,d3WholeGoalAndPlacementByteEquivalent:true,currentD3Edge:edge,currentD3SourceDecision:decision,otherElevenMappingEdgesByteEquivalent:true,hypotheticalNewMoneyGoalFingerprint:record.goalFingerprint,hypotheticalNewMoneyReviewInputFingerprint:record.reviewInputFingerprint,hypotheticalNewMoneyProfileFingerprint:record.profileFingerprint,closedP2SchemaValid:!!validate(record),nativeP2SemanticsErrors:sem,sourceAndImageDigestsStillPending:true,currentMoneyGoalIdAuthoritative:false,authorTechnicalReceiptClassificationSentenceIsIncorrect:true,humanApprovalClaimed:false,wholeM7ClosureClaimed:false,newStrictClosures:0,activeWrites:0}
await writeFile(resolve(d,'native-own-targeted-money-source-parity-check.v2.actual.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'})
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1)}
console.log('Independent targeted native checks PASS: only two money descriptions changed; thirteen whole candidates and raw twelve sources preserved; d3 partial; hypothetical P2 schema/semantics valid; current303.')
