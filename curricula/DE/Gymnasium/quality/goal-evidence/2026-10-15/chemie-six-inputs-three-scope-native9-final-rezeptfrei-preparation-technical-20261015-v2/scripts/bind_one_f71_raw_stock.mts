// SPDX-License-Identifier: Apache-2.0
import{readFileSync,writeFileSync,existsSync}from'node:fs'
import{dirname,resolve,relative}from'node:path'
import{fileURLToPath,pathToFileURL}from'node:url'
import{createHash}from'node:crypto'
const own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),repo=resolve(own,'../../../../../../..'),old=resolve(own,'../chemie-six-inputs-three-scope-native9-preparation-technical-20261015-v1')
const mapping=JSON.parse(readFileSync(resolve(own,'checks/REBUILD.native9.final-actual-V2.physical-map.json'),'utf8')),host=resolve(repo,mapping.executionHost),config=JSON.parse(readFileSync(resolve(own,'config/P1.f71-raw-technical-binding.config.json'),'utf8'))
const candidatePath=resolve(own,'profiles/one-existing-f71-profile-body.raw-author.candidate.json'),candidate=JSON.parse(readFileSync(candidatePath,'utf8')),one=resolve(repo,config.reviewPath),six=resolve(own,'profiles/six-raw-E0G0.current-context.stock-bound.jsonl')
if(existsSync(one)||existsSync(six))throw Error('Do not repeat one-target binding')
candidate.reviewedAt=new Date().toISOString();writeFileSync(candidatePath,JSON.stringify(candidate,null,2)+'\n')
const{buildPositiveGoalEvidenceCandidateRecords}=await import(pathToFileURL(resolve(host,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidate})
if(records.length!==1||records[0].evidenceLevel!=='E0'||records[0].maximumClaimScope!=='G0'||records[0].reviewRunIds.length!==0)throw Error('raw1 state')
writeFileSync(one,JSON.stringify(records[0])+'\n',{flag:'wx'})
const others=readFileSync(resolve(own,'profiles/five-raw-E0G0-original-lines.exact.jsonl'),'utf8');writeFileSync(six,JSON.stringify(records[0])+'\n'+others,{flag:'wx'})
const before=readFileSync(resolve(old,'profiles/six-raw-E0G0.current-context.stock-bound.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l)),after=readFileSync(six,'utf8').trim().split('\n').map(l=>JSON.parse(l))
for(let i=0;i<6;i++){if(JSON.stringify(before[i].profile)!==JSON.stringify(after[i].profile))throw Error('Profile body changed');if(i>0&&JSON.stringify(before[i])!==JSON.stringify(after[i]))throw Error('Other raw record changed')}
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
writeFileSync(resolve(own,'checks/PROFILE.one-actual-stock-binding-five-raw-lines-three-E1-lines-preserved.json'),JSON.stringify({role:'Actual unchanged stock binder; no P approval',stockFunction:'buildPositiveGoalEvidenceCandidateRecords',stockModuleSha256:sha(resolve(host,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')),onlyTarget:records[0].goalId,canonicalSha256:sha(resolve(host,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),semanticSha256:sha(resolve(host,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')),allSixWholeProfileBodiesExact:true,otherFiveWholeRawRecordsExact:true,threeExistingE1G1RecordFileBytesExact:sha(resolve(old,'profiles/three-current-E1G1-original-record-lines.exact.jsonl'))===sha(resolve(own,'profiles/three-current-E1G1-original-record-lines.exact.jsonl')),rawSixSha256:sha(six),newPApprovals:0},null,2)+'\n')
console.log(JSON.stringify({oneRawBinding:true,allSixProfileBodiesExact:true,otherFiveRawRecordsExact:true,rawSixSha256:sha(six)}))
