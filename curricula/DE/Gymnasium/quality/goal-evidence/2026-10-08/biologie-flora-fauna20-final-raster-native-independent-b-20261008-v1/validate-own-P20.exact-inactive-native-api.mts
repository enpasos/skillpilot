import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot'
const q='curricula/DE/Gymnasium/quality'
const own=q+'/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
const author=q+'/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
const img=q+'/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
const json=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const records=(await readFile(resolve(root,own,'P20.current-raster-independent-b.review.jsonl'),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
const landscape=await json(author+'/candidate/canonical.current474-twenty-new-raster-author.json')
const goalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const images=(await json(img+'/selected-twenty-author-images.exact.json')).images
const imageById=new Map(images.map((x:any)=>[x.goalId,x]))
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv)
const valid=ajv.compile(await json('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const results=records.map((r:any)=>{
 const goal:any=goalById.get(r.goalId),selected:any=imageById.get(r.goalId)
 const digestByUrl=Object.fromEntries(goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+selected.sha256]))
 const schemaErrors=valid(r)?[]:[ajv.errorsText(valid.errors)]
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r,goal,digestByUrl,'curricularAtomic')
 return {goalId:r.goalId,schemaErrors,semanticErrors,resourceDigests:digestByUrl,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint}
})
const errors=results.flatMap((r:any)=>[...r.schemaErrors,...r.semanticErrors])
const receipt={role:'Actual native P20 closed-schema and semantic API against exact inactive PNG digests; no image scientific approval inferred',checkedAt:new Date().toISOString(),recordCount:records.length,expectedRecordCount:20,exitCode:errors.length||records.length!==20?1:0,results,errors,machineCandidateOnly:true,requiredStatus:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',humanApproval:false,publicCliOrInstalledAssetsClaimed:false}
await writeFile(resolve(root,own,'P20.exact-inactive-native-api.independent-b.actual.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({recordCount:records.length,schemaAndSemanticErrors:errors,exitCode:receipt.exitCode}))
process.exit(receipt.exitCode)

