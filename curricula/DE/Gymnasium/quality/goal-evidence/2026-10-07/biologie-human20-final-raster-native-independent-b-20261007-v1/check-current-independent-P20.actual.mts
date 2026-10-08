// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1')
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const rows=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(line=>JSON.parse(line))
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const config=json(resolve(author,'native-raster-candidate/full391.book.config.author.json'))
const landscape=json(resolve(root,config.landscapePath)),qa=json(resolve(root,config.goalVisualizationQaPath))
const by=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available')digests[q.imageUrl]='sha256:'+sha(readFileSync(resolve(root,q.publicAssetPath)))
const old=rows(resolve(author,'native-raster-candidate/P20.actual-raster-author.review.jsonl')),sourceBy=new Map(old.map(r=>[r.goalId,r]))
const current=rows(resolve(own,'P20.current-raster-independent-b.review.jsonl'))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(json(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const outcomes=[]
for(const record of current){
  const source=sourceBy.get(record.goalId) as any,goal=by.get(record.goalId) as any
  assert.deepEqual(record.profile,source.profile)
  for(const key of ['goalFingerprint','reviewInputFingerprint','profileFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope'])assert.equal(record[key],source[key])
  const resources:Record<string,string>={}
  for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]=digests[link.url]
  assert.equal(validate(record),true,ajv.errorsText(validate.errors))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[])
  assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
  outcomes.push({goalId:record.goalId,wholeProfileBodyPreserved:true,actualCurrentRasterBindingsValid:true,schemaErrors:0,semanticErrors:0})
}
assert.equal(outcomes.length,20)
const receipt={schemaVersion:1,artifactKind:'actual-native-independent-current-P20-schema-semantic-validation',recordedAt:new Date().toISOString(),records:20,wholeProfilesRetained:20,outcomes,errors:0,activeWrites:0,strictClosuresClaimed:0,humanApproval:false,humanTrial:false}
writeFileSync(resolve(own,'native-P20-validator.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({currentIndependentP20:20,wholeScientificBodiesRetained:20,actualSchemaErrors:0,actualSemanticErrors:0,activeWrites:0,humanApproval:false}))
