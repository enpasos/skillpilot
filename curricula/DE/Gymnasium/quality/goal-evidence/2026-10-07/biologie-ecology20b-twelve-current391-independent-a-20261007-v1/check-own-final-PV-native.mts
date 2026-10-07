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

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'../biologie-ecology20b-current391-author-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const jsonl=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(line=>JSON.parse(line))
const records=jsonl(resolve(own,'P12.actual-raster-independent-a.review.jsonl'))
const authorRecords=jsonl(resolve(author,'source-locator-precision-v3/P12.actual-raster-source-roles-author-v3.review.jsonl'))
const priorAuthorRecords=jsonl(resolve(author,'native-raster-candidate/P12.actual-raster-author.review.jsonl'))
const visual=read(resolve(own,'V12.actual-raster-widths-pages-independent-a.final.json'))
const landscape=read(resolve(author,'candidate/canonical.current474-twelve-new-raster-author.json'))
const byId=new Map<string,any>(landscape.goals.map((goal:any)=>[goal.id,goal]))
const material=read(resolve(author,'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json'))
const materialsById=new Map<string,any>(material.goals.map((goal:any)=>[goal.goalId,goal]))
const candidates=read(resolve(author,'source-locator-precision-v3/P20.all-whole-profile-bodies-exact-source-roles.author.candidates.json'))
const candidatesById=new Map<string,any>(candidates.goals.map((goal:any)=>[goal.goalId,goal]))
const firstInput=read(resolve(own,'inputs/exact-twelve-neutral-whole-goals-and-twentyfour-cases.json'))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(records.length,12);assert.equal(visual.records.length,12)
let cases=0,extensions=0
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
  assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')
  assert.deepEqual(record.profile,authorRecords.find((row:any)=>row.goalId===record.goalId).profile)
  assert.deepEqual(record.profile,priorAuthorRecords.find((row:any)=>row.goalId===record.goalId).profile)
  assert.deepEqual(record.profile,candidatesById.get(record.goalId).profile)
  const whole=materialsById.get(record.goalId)
  assert.deepEqual(whole,firstInput.goals.find((row:any)=>row.wholeGoal.id===record.goalId).wholeMaterial)
  for(const item of whole.cases){
    const brief=record.profile.applicationCaseBriefs.find((row:any)=>row.id===item.id);assert.ok(brief)
    for(const [lang,suffix]of [['de','De'],['en','En']]){
      assert.equal(brief['taskDemand'+suffix],item.material[lang]+' '+item.task[lang])
      assert.equal(brief['expectedPerformance'+suffix],item.modelAnswer[lang])
    }
    cases++
  }
  if(whole.courseBoundConditionalExtension){
    const extension=whole.courseBoundConditionalExtension
    assert.equal(extension.extensionReplacesNoSharedExpectation,true)
    assert.deepEqual(extension.sharedRequiredCaseIds,whole.cases.map((item:any)=>item.id))
    const brief=record.profile.applicationCaseBriefs.find((row:any)=>row.id==='ecology20b-04-by-ea-lotka-volterra-extension');assert.ok(brief)
    const item=extension.wholeConditionalCase
    for(const [lang,suffix]of [['de','De'],['en','En']]){
      const body=item.material[lang]+' '+item.task[lang]
      assert.ok(brief['taskDemand'+suffix].endsWith(body))
      assert.ok(brief['taskDemand'+suffix].startsWith(lang==='de'
        ? 'Nur im tatsächlich belegten BY13-EA-Quellenteil4.1, keine gemeinsame GK-Pflicht: '
        : 'Only under the actually supported BY13 EA source passage4.1, no common basic-course obligation: '))
      assert.equal(brief['expectedPerformance'+suffix],item.modelAnswer[lang])
    }
    assert.equal(new Set(record.profile.applicationCaseBriefs.map((row:any)=>row.id)).size,record.profile.applicationCaseBriefs.length)
    extensions++
  }
  assert.ok(isGoalVisualizationAiApproved(v))
  assert.equal(v.approvedForPublication,false);assert.equal(v.humanApproved,false)
  assert.deepEqual(v.actualSeen,['full','360','680','native-book-page'])
  assert.equal(sha(resolve(root,v.actualNativePageCapture.path)),v.actualNativePageCapture.sha256)
  for(const capture of v.actualCaptures)assert.equal(sha(resolve(root,capture.path)),'sha256:'+capture.sha256)
}
assert.equal(cases,24);assert.equal(extensions,1)
const receipt={role:'Independent A actual native closed-schema/semantic P and current-image V validation after own complete scientific and page review',records:12,completeBilingualCommonCasePairs:24,conditionalBYEAExtensions:1,closedV2ProfileSchemaErrors:0,nativePositiveSemanticsErrors:0,exactUnchangedAuthorV3ProfilePayloads:true,allV3ProfileBodiesUnchangedFromActualRasterV1:true,allActualMaterialsExactFirstOwnScienceInputs:true,actualPNGDigestsBound:12,sourceAndCandidateImageBytesEqual:12,nativeVisualizationApprovalCurrent:12,actualWidthCapturesBound:24,actualNativePageCapturesBound:12,actualPublicAssetCLIStillPendingIntegration:true,reviewAuthority:'ai_candidate',status:'needs_human_review',evidenceLevel:'E1',maximumClaimScope:'G1',realLearnerPerformance:false,humanApproval:false,activeWrites:0,strictGainClaimed:0,inputs:[{path:relative(root,resolve(own,'P12.actual-raster-independent-a.review.jsonl')),sha256:sha(resolve(own,'P12.actual-raster-independent-a.review.jsonl'))},{path:relative(root,resolve(own,'V12.actual-raster-widths-pages-independent-a.final.json')),sha256:sha(resolve(own,'V12.actual-raster-widths-pages-independent-a.final.json'))}]}
writeFileSync(resolve(own,'P12-V12-native-current-raster-validation.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(receipt))
