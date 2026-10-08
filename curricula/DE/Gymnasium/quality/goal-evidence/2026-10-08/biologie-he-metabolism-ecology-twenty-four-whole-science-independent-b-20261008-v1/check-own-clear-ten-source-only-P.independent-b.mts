import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const bind=(p:string)=>({path:relative(root,p),sha256:hash(p),bytes:readFileSync(p).length})
const first=resolve(own,'whole24-whole48-source-science-independent-b.first.freeze.json')
assert.equal(hash(first),'9ab66e1e3d35e7965ac8ccca5351f1e6fbb841ae68dbe1ddb842199ae93d50df')
for(const b of read(first).files){assert.equal(hash(resolve(root,b.path)),b.sha256);assert.equal(readFileSync(resolve(root,b.path)).length,b.bytes)}
const config=read(resolve(own,'P10.own-clear-source-only.exact-author-records.config.json'))
const landscape=read(resolve(root,config.landscapePath)),kinds=read(resolve(root,config.semanticKindLedgerPath)).decisions
const rows=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const ownVerdicts=read(resolve(own,'whole24-whole48-science-source-P-A-M.independent-b.first.verdicts.json')).entries
const author=resolve(dirname(own),'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1')
const fullProfiles=read(resolve(author,'P24.whole48-complete-DEEN-author.candidates.json')).goals
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(rows.length,10);assert.deepEqual(rows.map((x:any)=>x.goalId),config.scope.goalIds)
assert.deepEqual(config.reviewedResourceTypes,[])
const checked:any[]=[]
for(const record of rows){
  const goal=landscape.goals.find((g:any)=>g.id===record.goalId)
  const kind=kinds.find((k:any)=>k.goalId===record.goalId)
  const verdict=ownVerdicts.find((v:any)=>v.goalId===record.goalId)
  assert.equal(verdict.ownVerdict,'KEEP_SCIENCE_SOURCE_CANDIDATE')
  assert.equal(kind.semanticKind,'curricularAtomic')
  assert.equal(kind.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal))
  assert.equal(record.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
  assert.ok(validate(record),ajv.errorsText(validate.errors))
  assert.deepEqual(record.profile,fullProfiles.find((x:any)=>x.goalId===record.goalId).profile)
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,{},'curricularAtomic'),[])
  assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
  assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')
  checked.push({goalId:record.goalId,ordinal:verdict.ordinal,goalFingerprint:record.goalFingerprint,profileFingerprint:record.profileFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,
    actualResourceDigestMap:{},scope:'SOURCE_ONLY_NO_RASTER',closedV2SchemaErrors:0,nativeSemanticErrors:0,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope})
}
writeFileSync(resolve(own,'P10.actual-closed-schema-native-semantics-source-only.independent-b.receipt.json'),JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),ownFirstSeal:bind(first),
  nativeApi:'validatePositiveGoalEvidenceRecordSemantics',checkedCount:10,checked,sourceOnly:true,rasterD_VApproved:0,profilesActuallyWholeScienceReviewedBeforeTechnicalCheck:true,
  authorP14HeldFourNotPromoted:true,sourceCompoundAndOptionalModelHoldsNotClosedByNativeCheck:true,currentPeerRead:false,actualLearnerEvidence:false,performedExperiments:0,
  activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual own clear P10 source-only closed-v2 schema/native semantics: 10 records,0 errors, E1/G1 ai_candidate needs_human_review; raster/D/V pending.')
