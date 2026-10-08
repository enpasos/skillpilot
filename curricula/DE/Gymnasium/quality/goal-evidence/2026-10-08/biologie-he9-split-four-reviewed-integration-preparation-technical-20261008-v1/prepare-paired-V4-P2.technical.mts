// SPDX-License-Identifier: Apache-2.0
// Technical adoption of the exact sealed independent pair. No new science review.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {normalizeGoalVisualizationAiReview} from '../../../../../../../app/scripts/goalVisualizationQaModel'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),rp=(p:string)=>relative(root,p)
const declared:Record<string,any>={}
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p),r={path:rp(p),sha256:sha(b),bytes:b.length};declared[r.path]=r;return r}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:any)=>{const b=Buffer.from(typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(b),'Immutable packet drift: '+p);return bind(p)}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,b,{flag:'wx'});return bind(p)}
const guards=read(resolve(own,'checks/genuine-current-four-pair-ready.technical.json'))
const author=resolve(root,guards.actualSourceAuthor),children:string[]=guards.newChildGoalIds,companions:string[]=guards.contextCompanionGoalIds,ids=[...children,...companions]
const before=read(resolve(own,'before/qa.json')),authorQA=read(resolve(author,'candidate/visualization-qa.current392.actual-raster-author.json'))
const oldBy=new Map<string,any>(before.records.map((r:any)=>[r.goalId,r])),newBy=new Map<string,any>(authorQA.records.map((r:any)=>[r.goalId,r]))
assert.equal(oldBy.size,391);assert.equal(newBy.size,392)
const oldParent=oldBy.get(guards.oldStableParentId);assert.equal(oldParent.visualizationState,'missing')
const humanKeys=['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer']
assert.deepEqual(humanKeys.map(k=>oldParent[k]),['no','no','',null,''])
const Bfinal=read(resolve(root,guards.seals.B.seal.path)),completedAt=Bfinal.recordedAt
assert.equal(completedAt,'2026-10-08T01:55:13.873338+00:00')
const reviewers='Independent machine reviewers: Codex /root/chemistry_open_packets (A) and Codex /root/flora_fauna_independent_a (B); exact sealed technical adoption by /root/he12_native_four_engineering'
const futureRows=before.records.filter((r:any)=>r.goalId!==guards.oldStableParentId).map((r:any)=>structuredClone(r))
for(const id of children){const r=structuredClone(newBy.get(id));r.publicAssetPath='app/public'+r.imageUrl;r.canonicalAssetPath=`curricula/DE/Gymnasium/visualizations/biologie/${id}/${id}.png`;r.chatGptNotes='';futureRows.push(r)}
for(const id of ids){
 const r=futureRows.find((r:any)=>r.goalId===id),p=guards.actualPairedV.find((p:any)=>p.goalId===id);assert.ok(p.actualVisualKEEP&&p.descriptionKEEP&&p.wholePositiveScopedSciencePASS)
 assert.equal(r.assetSha256,'sha256:'+p.actualA.actualFullPNG.sha256.replace(/^sha256:/,''))
 const notes=`Actual original PNG, 360/680 px captures and complete native physical page independently viewed by A and B; both KEEP, no unresolved findings. A: ${JSON.stringify(p.actualA.substantiveActualVisualObservationsDe)} B: ${p.actualB.actualReasonDe}. Exact final seals A ${guards.seals.A.seal.sha256} and B ${guards.seals.B.seal.sha256}. Machine visual QA only; no human approval or trial.`
 Object.assign(r,normalizeGoalVisualizationAiReview({aiApproved:'yes',aiApprovedAssetSha256:r.assetSha256,aiReviewedAt:completedAt,aiReviewer:reviewers,aiNotes:notes},r.assetSha256))
 assert.equal(r.aiApproved,'yes');assert.ok(r.aiReviewedAt&&r.aiReviewer)
}
futureRows.sort((l:any,r:any)=>l.title.localeCompare(r.title,'de-DE',{numeric:true,sensitivity:'base'})||l.goalId.localeCompare(r.goalId))
const future={...before,records:futureRows},afterBy=new Map<string,any>(futureRows.map((r:any)=>[r.goalId,r]))
let wholeUnchanged=0,humanRetained=0
for(const [id,b] of oldBy){if(id===guards.oldStableParentId)continue;const a=afterBy.get(id);assert.deepEqual(humanKeys.map(k=>a[k]),humanKeys.map(k=>b[k]));humanRetained++;if(!companions.includes(id)){assert.deepEqual(a,b);wholeUnchanged++}}
assert.equal(wholeUnchanged,388);assert.equal(humanRetained,390)
for(const id of children)assert.deepEqual(humanKeys.map(k=>afterBy.get(id)[k]),['no','no','',null,''])
const futureQA=write(resolve(own,'candidate/visualization-qa.current392-reviewed.future-active.json'),future)
const inert=structuredClone(future);for(const r of inert.records)if(children.includes(r.goalId)){const ownr=newBy.get(r.goalId);r.publicAssetPath=ownr.publicAssetPath;r.canonicalAssetPath=ownr.canonicalAssetPath}
write(resolve(own,'candidate/visualization-qa.current392-reviewed.inactive.json'),inert)
const rawP=resolve(author,'native-raster-candidate-v2/P4.actual-raster-author.review.jsonl');bind(rawP)
const P4=readFileSync(rawP,'utf8').trim().split('\n').map(l=>JSON.parse(l)),canon=read(resolve(own,'candidate/canonical.current476-reviewed.future-active.json')),goals=new Map<string,any>(canon.goals.map((g:any)=>[g.id,g]))
assert.equal(P4.length,4)
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const checks:any[]=[],newP:any[]=[],criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',criteria=bind(resolve(root,criteriaPath))
const newId='biologie-he9-split-two-current392-reviewed-positive-v1'
for(const record of P4){
 const selected=guards.actualPairedV.find((p:any)=>p.goalId===record.goalId),q=inert.records.find((r:any)=>r.goalId===record.goalId),goal=goals.get(record.goalId),resources:Record<string,string>={}
 assert.equal(bind(resolve(root,q.publicAssetPath)).sha256,q.assetSha256)
 for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){assert.equal(link.url,q.imageUrl);resources[link.url]=q.assetSha256}
 assert.equal(record.reviewCriteriaFingerprint,criteria.sha256);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[]);assert.ok(validator(record),ajv.errorsText(validator.errors))
 assert.equal(selected.actualA.wholePositiveProfileRecord.profileFingerprint,record.profileFingerprint)
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')
 checks.push({goalId:record.goalId,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,actualRaster:q.assetSha256,schemaErrors:0,semanticErrors:0,wholeProfileAndCasesRemainGenuinelyReviewed:true})
 if(children.includes(record.goalId)){
  const next={...record,reviewId:newId,reviewedAt:completedAt,reviewer:reviewers,reason:'Die vollständigen bisherigen DE/EN-Fachfälle und das positive-understanding-evidence-v2-Profil bleiben unverändert. Zwei tatsächlich unabhängige, blind erstversiegelte finale Reviews A/B haben das gesamte aktuelle Lernziel, die vollständigen Fachfälle, das echte aktuelle PNG und die echte native Vierseitenbindung ohne offene Befunde geprüft. E1/G1: maschinell geprüfter Curriculum-Kandidat, needs_human_review/ai_candidate; kein Nachweis einer Lernendenleistung oder menschlicher Freigabe.',reviewRunIds:[],dissent:['Machine curriculum QA only: E1/G1, ai_candidate, needs_human_review. No learner evidence, human approval or human trial.','Original whole source scope and prerequisites retained; inherited source applicability is not new universal direct source approval.','No compulsory extra task after adequate mastery; two genuine whole bilingual case variations are retained.']}
  assert.deepEqual(next.profile,record.profile);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(next,goal,resources,'curricularAtomic'),[]);assert.ok(validator(next),ajv.errorsText(validator.errors));newP.push(next)
 }
}
assert.deepEqual(newP.map(r=>r.goalId),children)
const pRecords=write(resolve(own,'positive/current2.records.jsonl'),newP.map(r=>JSON.stringify(r)).join('\n')+'\n')
const originalConfig=read(resolve(author,'candidate/P2.actual-raster-author.future-active-v2.config.json'))
const config={...originalConfig,reviewId:newId,reviewPath:pRecords.path,reviewedResourceTypes:['goal-visualization'],reviewRunManifestPaths:[],requireApproved:false,scope:{label:'Two genuine whole new-child positive profiles; actual final blind independent A/B current raster/native review complete; E1/G1 AI candidates, separate human gates open',goalIds:children}}
const pFuture=write(resolve(own,'positive/current2.future-active.config.json'),config)
write(resolve(own,'positive/current2.inactive.config.json'),{...config,landscapePath:rp(resolve(own,'candidate/canonical.current476-reviewed.future-active.json')),semanticKindLedgerPath:rp(resolve(own,'candidate/semantic-kinds.current476-reviewed.inactive.json'))})
const registry=read(resolve(own,'before/registry.json')),bio=registry.subjects.find((s:any)=>s.subject==='biologie'),retainedCompanionP:any[]=[]
for(const cfgpath of bio.positiveEvidenceConfigPaths){const cfg=read(resolve(root,cfgpath)),path=resolve(root,cfg.reviewPath);bind(path);for(const line of readFileSync(path,'utf8').trim().split('\n')){const old=JSON.parse(line);if(companions.includes(old.goalId)){const r=P4.find(r=>r.goalId===old.goalId);assert.deepEqual(old.profile,r.profile);for(const field of ['goalFingerprint','reviewInputFingerprint','profileFingerprint'])assert.equal(old[field],r[field]);retainedCompanionP.push({goalId:old.goalId,existingConfig:cfgpath,existingRecords:rp(path),wholeRecordKeptExact:true,profileFingerprint:old.profileFingerprint})}}}
assert.equal(retainedCompanionP.length,2)
write(resolve(own,'checks/paired-V4-P2-native-schema-current-raster.actual.technical.json'),{role:'Technical exact sealed pair adoption, no new scientific review',fourChecks:checks,operativeNewProfiles:2,retainedCompanionPositiveRecords:retainedCompanionP,actualPairSeals:guards.seals,reviewedAtFromActualFinalB:completedAt,aiReviewNormalizer:'normalizeGoalVisualizationAiReview',futureQA,newPRecords:pRecords,newPConfig:pFuture,oldQAWholeRowsKeptExact:wholeUnchanged,oldQAHumanRowsKeptExact:humanRetained,oldMissingParentRemovedWithoutHumanEvidence:true,newChildHumanRowsUnapproved:2,only4PairedAIRowsChanged:true,aiApprovalIsNotHumanApproval:true,activeWrites:0,strictGainClaimed:0,actualPublicPCLIStillPendingIntegration:true})
write(resolve(own,'checks/paired-V4-P2-declared-inputs.technical.json'),{files:Object.values(declared)})
console.log(JSON.stringify({V4:'actual genuine paired KEEP, ordinary AI normalization',P2:'closed schema+native semantics PASS',oldQARowsWholeExact:388,oldHumanRowsExact:390,companionP:'2 existing whole records retained',activeWrites:0,strictGainClaimed:0}))
