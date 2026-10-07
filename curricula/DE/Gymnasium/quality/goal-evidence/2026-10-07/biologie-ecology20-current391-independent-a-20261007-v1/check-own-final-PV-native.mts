// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {isGoalVisualizationAiApproved} from '../../../../../../../app/scripts/goalVisualizationQaModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'../biologie-ecology20-current391-author-v2')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const records=readFileSync(resolve(own,'P20.actual-raster-independent-a.review.jsonl'),'utf8').trim().split('\n').map(line=>JSON.parse(line))
const authorRecords=readFileSync(resolve(author,'native-raster-candidate/P20.actual-raster-author.review.jsonl'),'utf8').trim().split('\n').map(line=>JSON.parse(line))
const visual=read(resolve(own,'V20.actual-raster-full-width-page-independent-a.final.json'))
const landscape=read(resolve(author,'candidate/canonical.current473-twenty-new-raster-author.json'))
const byId=new Map<string,any>(landscape.goals.map((goal:any)=>[goal.id,goal]))
const material=read(resolve(author,'materials-revision-v3/twenty-whole-goals-forty-complete-DEEN-cases.author-v3.json'))
const materialsById=new Map<string,any>(material.goals.map((goal:any)=>[goal.goalId,goal]))
const inputCandidates=read(resolve(author,'materials-revision-v3/P20.current-text-preimage.author-v3.candidates.json'))
const candidatesById=new Map<string,any>(inputCandidates.goals.map((goal:any)=>[goal.goalId,goal]))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(records.length,20);assert.equal(visual.records.length,20)
let cases=0
for(const record of records){
  const goal=byId.get(record.goalId);assert.ok(goal)
  const v=visual.records.find((row:any)=>row.goalId===record.goalId);assert.ok(v)
  assert.equal(sha(resolve(root,v.sourcePath)),v.assetSha256)
  assert.equal(sha(resolve(author,'selected-images/'+record.goalId+'.png')),v.assetSha256)
  const resources:Record<string,string>={}
  for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]=v.assetSha256
  assert.equal(Object.keys(resources).length,1)
  assert.ok(schema(record),ajv.errorsText(schema.errors))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[])
  assert.equal(record.status,'needs_human_review');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')
  assert.deepEqual(record.profile,authorRecords.find((row:any)=>row.goalId===record.goalId).profile)
  assert.deepEqual(record.profile,candidatesById.get(record.goalId).profile)
  for(const item of materialsById.get(record.goalId).cases){
    const brief=record.profile.applicationCaseBriefs.find((row:any)=>row.id===item.id);assert.ok(brief)
    for(const [lang,suffix]of [['de','De'],['en','En']]){
      assert.equal(brief['taskDemand'+suffix],item.material[lang]+' '+item.task[lang])
      assert.equal(brief['expectedPerformance'+suffix],item.modelAnswer[lang])
    }
    cases++
  }
  assert.ok(isGoalVisualizationAiApproved(v))
  assert.equal(v.approvedForPublication,false);assert.equal(v.humanApproved,false)
  assert.deepEqual(v.actualSeen,['full','360','680','native-book-page'])
  for(const capture of v.capturesActuallySeen)assert.equal(sha(resolve(root,capture.path)),'sha256:'+capture.sha256)
}
assert.equal(cases,40)
const receipt={role:'Independent A actual native structural/semantic P and current-image V validation after own scientific review',records:20,completeBilingualCasePairs:40,closedV2ProfileSchemaErrors:0,nativePositiveSemanticsErrors:0,exactUnchangedV3ProfilePayloads:true,actualPNGDigestsBound:20,sourceAndCandidateImageBytesEqual:20,nativeVisualizationApprovalCurrent:20,actualPublicAssetCLIStillPendingIntegration:true,reviewAuthority:'ai_candidate',status:'needs_human_review',evidenceLevel:'E1',maximumClaimScope:'G1',realLearnerPerformance:false,humanApproval:false,activeWrites:0,strictGainClaimed:0,inputs:[{path:relative(root,resolve(own,'P20.actual-raster-independent-a.review.jsonl')),sha256:sha(resolve(own,'P20.actual-raster-independent-a.review.jsonl'))},{path:relative(root,resolve(own,'V20.actual-raster-full-width-page-independent-a.final.json')),sha256:sha(resolve(own,'V20.actual-raster-full-width-page-independent-a.final.json'))}]}
writeFileSync(resolve(own,'P20-V20-native-current-raster-validation.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(receipt))
