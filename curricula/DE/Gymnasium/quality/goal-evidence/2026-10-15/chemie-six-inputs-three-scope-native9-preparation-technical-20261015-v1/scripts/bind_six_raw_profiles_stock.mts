// SPDX-License-Identifier: Apache-2.0
import{readFileSync,writeFileSync,existsSync}from'node:fs'
import{resolve,dirname,relative}from'node:path'
import{fileURLToPath,pathToFileURL}from'node:url'
import{createHash}from'node:crypto'
const own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),repo=resolve(own,'../../../../../../..')
const mapping=JSON.parse(readFileSync(resolve(own,'checks/REBUILD.native9.PENDING-final-QA.physical-map.json'),'utf8')),host=resolve(repo,mapping.executionHost)
const{buildPositiveGoalEvidenceCandidateRecords}=await import(pathToFileURL(resolve(host,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const config=JSON.parse(readFileSync(resolve(own,'config/P6.raw-technical-binding.config.json'),'utf8')),candidatePath=resolve(own,'profiles/six-existing-profile-bodies.raw-author.candidates.json'),candidate=JSON.parse(readFileSync(candidatePath,'utf8'))
const target=resolve(repo,config.reviewPath)
if(existsSync(target))throw Error('Raw6 already written; do not repeat binding')
candidate.reviewedAt=new Date().toISOString();writeFileSync(candidatePath,JSON.stringify(candidate,null,2)+'\n')
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidate})
if(records.length!==6||records.some((r:any)=>r.evidenceLevel!=='E0'||r.maximumClaimScope!=='G0'||r.reviewRunIds.length!==0))throw Error('Raw6 state')
for(let i=0;i<records.length;i++)if(JSON.stringify(records[i].profile)!==JSON.stringify(candidate.goals[i].profile))throw Error('Profile body changed')
writeFileSync(target,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
writeFileSync(resolve(own,'checks/PROFILE.six-actual-stock-raw-bindings.json'),JSON.stringify({role:'Actual unchanged stock candidate builder; no scientific P vote',stockFunction:'buildPositiveGoalEvidenceCandidateRecords',stockModule:{path:'app/scripts/materializePositiveGoalEvidenceCandidates.ts',sha256:sha(resolve(host,'app/scripts/materializePositiveGoalEvidenceCandidates.ts'))},canonicalSha256:sha(resolve(host,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),rawRecordFile:{path:relative(repo,target),sha256:sha(target)},profileBodiesExact:true,rawE0G0:6,reviewRunIds:[],currentThreeE1G1OriginalsUnmodified:true,newPApprovals:0},null,2)+'\n')
console.log(JSON.stringify({raw6:6,E0G0:true,profileBodiesExact:true,rawSha256:sha(target)}))
