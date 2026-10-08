import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const author=resolve(own,'../chemie-q3-twenty-whole-science-source-author-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const first=resolve(own,'whole20-whole40-science-source.independent-b.first.freeze.json')
assert.equal(hash(first),'765ecaf666288ecc91fea4bb9dbf53326784b88b70716c694e3aaebae1b3f297')
for(const f of read(first).files) assert.equal(hash(resolve(root,f.path)),f.sha256)
const config=read(resolve(author,'native/p20.author-candidate.config.json'))
const landscape=read(resolve(root,config.landscapePath))
const kinds=read(resolve(root,config.semanticKindLedgerPath)).decisions
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const verdicts=read(resolve(own,'whole20-whole40-science-source-atomicity.independent-b.first.verdict.json')).verdicts
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(records.length,20)
const verified=records.map((r:any)=>{
 const g=landscape.goals.find((x:any)=>x.id===r.goalId),k=kinds.find((x:any)=>x.goalId===r.goalId)
 assert.ok(g);assert.equal(k.semanticKind,'curricularAtomic')
 assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(g))
 assert.equal(r.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
 const links=g.resourceLinks.filter((l:any)=>l.type==='goal-visualization'),digests:Record<string,string>={}
 const assets=links.map((l:any)=>{const p=resolve(root,'app/public'+l.url);digests[l.url]='sha256:'+hash(p);return{url:l.url,path:p,sha256:hash(p)}})
 assert.ok(validate(r),ajv.errorsText(validate.errors));const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic');assert.deepEqual(errors,[])
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
 return{goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,assets,currentSourceKindFingerprint:k.sourceFingerprint,schemaErrors:0,semanticErrors:0,ownScientificVerdict:verdicts.find((v:any)=>v.goalId===r.goalId).scientificWholeCasesAndProfile}
})
writeFileSync(resolve(own,'P20.actual-closed-schema-semantics-current-assets.independent-b.receipt.json'),JSON.stringify({schemaVersion:1,recordedAt:new Date().toISOString(),nativeApi:'validatePositiveGoalEvidenceRecordSemantics',closedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',exactInput:config.reviewPath,records:verified,needsHumanReview:20,humanApproved:0,schemaErrors:0,semanticErrors:0,technicalFormPassDoesNotResolveSpecificScientificHolds:true,ownFirstSeal:first,ownFirstSealSha256:hash(first),actualExistingAssetBytesReadForBinding:true,freshVisualInspection:false,peerCurrentReviewRead:false,activeWrites:0,strictGain:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual P20 native closed-schema/semantics/source-kind/current asset binding:20 records,0 errors. Scientific P12/P16 holds remain; E1/G1 AI candidate needs_human_review.')
