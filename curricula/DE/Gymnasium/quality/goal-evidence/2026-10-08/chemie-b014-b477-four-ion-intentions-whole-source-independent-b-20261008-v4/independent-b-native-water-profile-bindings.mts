import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const own=path.dirname(new URL(import.meta.url).pathname)
const read=async(p:string)=>JSON.parse(await fs.readFile(p,'utf8'))
const assert=(x:unknown,m:string)=>{if(!x)throw Error(m)}
const land=await read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const qa=await read('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const kinds=await read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const valid=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const snapshots=await read(path.join(own,'independent-b-retained-current-1c-fd-P.exact.json'))
const results=[]
for(const item of snapshots.records){
 const r=item.record,g=land.goals.find((g:any)=>g.id===r.goalId),q=qa.records.find((q:any)=>q.goalId===r.goalId)
 const k=kinds.decisions.find((k:any)=>k.goalId===r.goalId)
 const hash='sha256:'+createHash('sha256').update(await fs.readFile(q.canonicalAssetPath)).digest('hex')
 assert(valid(r),'Closed native schema '+r.goalId+JSON.stringify(valid.errors))
 const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,{[q.imageUrl]:hash},k.semanticKind)
 assert(errors.length===0,'Native water-profile binding '+r.goalId+JSON.stringify(errors))
 const current=(await fs.readFile(item.reviewPath,'utf8')).trim().split('\n').map(s=>JSON.parse(s))
 assert(current.some((c:any)=>JSON.stringify(c)===JSON.stringify(r)),'Retained exact record '+r.goalId)
 results.push({goalId:r.goalId,closedNativeSchemaValid:true,currentNativeSemanticErrors:errors,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,renewedScienceReview:false})
}
await fs.writeFile(path.join(own,'independent-b-native-water-profile-bindings.actual.json'),JSON.stringify({actualExitCode:0,retainedExactBindings:results,activeWrites:0,newWholeProfileOrScienceApproval:false,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({actualExitCode:0,currentWaterProfiles:results.length,renewedScienceReviews:0,activeWrites:0}))
