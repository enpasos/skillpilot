import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-science-first-independent-b-20261008-v1'
const json=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const landscape=await json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const goalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const rows=(await readFile(resolve(root,own,'P19.current-text-independent-b.review.jsonl'),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv)
const valid=ajv.compile(await json('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const results=rows.map((r:any)=>{const goal:any=goalById.get(r.goalId);return {goalId:r.goalId,schemaErrors:valid(r)?[]:[ajv.errorsText(valid.errors)],semanticErrors:validatePositiveGoalEvidenceRecordSemantics(r,goal,{},'curricularAtomic'),profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint}})
const errors=results.flatMap((r:any)=>[...r.schemaErrors,...r.semanticErrors])
const receipt={checkedAt:new Date().toISOString(),recordCount:rows.length,exitCode:errors.length||rows.length!==19?1:0,results,errors,role:'Native schema/semantics for exact current text-only P19; no final PNG, D/V or scientific approval inferred from terminal green',scientificProfileHoldCount:1,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',activeWrites:0,humanApproval:false}
await writeFile(resolve(root,own,'P19.current-text-native-api.independent-b.actual.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({recordCount:rows.length,errors,exitCode:receipt.exitCode}));process.exit(receipt.exitCode)
