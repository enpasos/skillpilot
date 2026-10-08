import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot',q='curricula/DE/Gymnasium/quality'
const own=q+'/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-targeted-independent-b-20261008-v2'
const author=q+'/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v3'
const json=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const records=(await readFile(resolve(root,own,'P20.retained19-with-one-v4-binding.independent-b.review.jsonl'),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
const goals=new Map((await json(author+'/candidate/canonical.current474-twenty-new-raster-author.json')).goals.map((g:any)=>[g.id,g]))
const images=new Map((await json(author+'/selected-twenty-one-targeted-image-correction.author.json')).images.map((x:any)=>[x.goalId,x]))
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv);const valid=ajv.compile(await json('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const results=records.map((r:any)=>{const g:any=goals.get(r.goalId),im:any=images.get(r.goalId),digests=Object.fromEntries(g.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+im.sha256]));return {goalId:r.goalId,schemaErrors:valid(r)?[]:[ajv.errorsText(valid.errors)],semanticErrors:validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic'),resourceDigests:digests,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,scientificRole:r.goalId==='321ea315-37fe-5f9e-8fa8-dd631bb447c7'?'one-targeted-v4-binding-recheck':'exact-retained-prior-independent-B-whole-science'}})
const errors=results.flatMap((r:any)=>[...r.schemaErrors,...r.semanticErrors]);const exitCode=errors.length||records.length!==20?1:0
await writeFile(resolve(root,own,'P20.exact-retained19-one-v4-native-api.independent-b.actual.json'),JSON.stringify({checkedAt:new Date().toISOString(),recordCount:records.length,exitCode,results,errors,scope:'Actual inactive PNG API; one v4 raster rebind, unchanged19 prior science retained, no new judgment from machine hashes',publicInstalledCliClaimed:false,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({recordCount:records.length,errors,exitCode}));process.exit(exitCode)
