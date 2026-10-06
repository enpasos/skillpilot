// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-candidate-v1'
const iso=resolve('tmp/biologie-ni-current-learner-view-adoption-candidate-v1-native-root')
const { discoverActiveMemoryCardReviewConfigs }=await import(resolve(iso,'app/scripts/memoryCardReviewConfigDiscovery.ts'))
const configs=discoverActiveMemoryCardReviewConfigs(own+'/default-configs.candidate',own+'/future-registry.memory-view-path-only.candidate.json')
const bio=configs.find((c:any)=>c.reviewId==='canonical-biology-full')
assert.equal(bio.configPath,own+'/full-memory.current-learner-views.config.json')
const actual=JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','utf8'))
const future=JSON.parse(readFileSync(own+'/future-registry.memory-view-path-only.candidate.json','utf8'))
for(const s of actual.subjects){const candidate=future.subjects.find((c:any)=>c.subject===s.subject);if(s.subject!=='biologie')assert.deepEqual(candidate,s);else{const {memoryReviewConfigPath:a,...rest}=s,{memoryReviewConfigPath:b,...frest}=candidate;assert.notEqual(a,b);assert.deepEqual(rest,frest)}}
const result={atUTC:new Date().toISOString(),status:'Unmodified active-memory-config discovery passed with exact current learner scopes; only Biology M-path proposed to change',activeConfigs:configs,physicalDiscoveryCodeSHA256:createHash('sha256').update(readFileSync(resolve(iso,'app/scripts/memoryCardReviewConfigDiscovery.ts'))).digest('hex'),activeWrites:false,otherRegistrySubjectsExact:true,newScienceClosures:0,humanApproval:false}
writeFileSync(own+'/native-active-config-discovery.actual.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({configuredSubjects:configs.length,Biology:bio,otherRegistrySubjectsExact:true,activeWrites:false}))
